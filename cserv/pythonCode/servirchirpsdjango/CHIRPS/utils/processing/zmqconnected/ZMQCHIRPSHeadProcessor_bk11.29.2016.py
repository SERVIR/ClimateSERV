'''
Created on Jan 30, 2015

@author: jeburks
@author: Kris Stanton
'''
import CHIRPS.utils.geo.geoutils as geoutils
import CHIRPS.utils.processtools.dateprocessor as dproc
import CHIRPS.utils.configuration.parameters as params
import CHIRPS.utils.file.npmemmapstorage as rp
import CHIRPS.utils.geo.clippedmaskgenerator as mg
import CHIRPS.utils.file.dateutils as dateutils
import CHIRPS.utils.db.bddbprocessing as bdp
import sys
import CHIRPS.utils.locallog.locallogging as llog
import zmq
import json
import CHIRPS.utils.processtools.uutools as uu
import CHIRPS.utils.file.MaskTempStorage  as mst
import CHIRPS.utils.geo.shapefile.readShapesfromFiles as sf
import CHIRPS.utils.processtools.pMathOperations as pMath
import time
from copy import deepcopy
from operator import itemgetter
import CHIRPS.utils.RequestLog.requestLog as reqLog
import CHIRPS.utils.file.ExtractTifFromH5 as extractTif

class ZMQCHIRPSHeadProcessor():
    
    logger = llog.getNamedLogger("request_processor")
    workToBeDone = {}
    workDone = []
    name = None
    current_work_dict = None
    finished_items = []
    total_tasks_count= 0
    finished_task_count = 0
    request = None
    inputreceiver = None
    outputreceiver = None
    listeningreceiver = None
    inputconn = None
    outputconn = None
    listeningconn = None
    progress = 0
    process_start_time =0
    mathop = None
    
    # KS Refactor 2015  # Some items related to download data jobs
    isDownloadJob = False
    dj_OperationName = "download"  # Needed by   # "if results['value'][opname] != missingValue:"
    
    def __init__(self, name, inputconn, outputconn, listenconn):
       
        self.name = name
        self.inputconn = inputconn
        self.outputconn = outputconn
        self.listeningconn = listenconn
        self.logger.info("Creating Processor named: "+self.name+" listening on port: "+self.inputconn+" outputting to port: "+self.outputconn+"  listening for output on: "+self.listeningconn)
        
        ##Connect to the source
        self.__beginWatching__()
   
    def __beginWatching__(self):
       
        context = zmq.Context()
        
        self.inputreceiver = context.socket(zmq.PULL)
        self.inputreceiver.connect(self.inputconn)
        self.outputreceiver = context.socket(zmq.PUSH)
        self.outputreceiver.connect(self.outputconn)
        self.listenreceiver = context.socket(zmq.PULL)
        self.listenreceiver.connect(self.listeningconn)
        self.logger.info("Processor ("+self.name+")  Connected and Ready")
        self.__watchAgain__()
        
    def __watchAgain__(self):
        while(True):
            self.logger.info("HeadProcessor ("+self.name+"): Waiting for input")
            request = json.loads(self.inputreceiver.recv())
            self.process_start_time = time.time()
            self.logger.info("Processing request "+request['uniqueid'])
            self.processWork(request)
            time_total = time.time()-self.process_start_time
            self.logger.info("Total time: "+str(time_total))
        
    # For download dataset types..
    def preProcessWork_ForDownloadTypes(self, request):
        if (self.isDownloadJob == True ):
            if (self.dj_OperationName == "download"):
                theJobID = None
                try:
                    self.logger.info("("+self.name+"):preProcessWork_ForDownloadTypes: Pre_Processing a Download Data Job. " + str(request['uniqueid']))
                    theJobID = request['uniqueid']
                    outFileFolder = params.zipFile_ScratchWorkspace_Path + str(theJobID)+"/" 
                    extractTif.create_Scratch_Folder(outFileFolder)
                except:
                    pass
            elif (self.dj_OperationName == "download_all_climate_datasets"):
                # Placeholder for download_all_climate_datasets operations.... not even sure if going to use this here..
                pass
        else:
            # This is a statistical  do nothing
            return
    
    # After all the tif extracting is done, need to zip them all up in a single operation
    def postProcessWork_ForDownloadTypes(self, request):
        if (self.isDownloadJob == True ):
            if (self.dj_OperationName == "download"):
                theJobID = None
                try:
                    self.logger.info("("+self.name+"):postProcessWork_ForDownloadTypes: Post_Processing a Download Data Job. " + str(request['uniqueid']))
                    theJobID = request['uniqueid']
                    
                    # Zip the files
                    zipFilePath, errorMessage = extractTif.zip_Extracted_Tif_Files_Controller(theJobID)
                    if (errorMessage == None):
                        self.logger.info("("+self.name+"):postProcessWork_ForDownloadTypes: Tif files have been zipped to: " + str(zipFilePath))
                    else:
                        self.logger.info("("+self.name+"):postProcessWork_ForDownloadTypes: ERROR ZIPPING TIF FILES.  errorMessage: " + str(errorMessage))
                        
                except:
                    pass
            elif (self.dj_OperationName == "download_all_climate_datasets"):
                # Placeholder for download_all_climate_datasets operations.... not even sure if going to use this here..
                pass
        else:
            # This is a statistical  do nothing
            return
        
        # Placeholder
        
        pass
    
        
    def processWork(self,request):
        #self.logger.info("Process Work"+str(request))
        self.logger.info("("+self.name+"):processWork: Process Work: "+str(request))
        ###Break into Chunks
        self.request = request
        
        # ks notes // Generate a list of work to be done (each item represents a time interval)
        error, workarray = self.__preProcessIncomingRequest__(request)
        
        # KS Refactor 2015 // Additional pre-setup items specific to download request types
        self.preProcessWork_ForDownloadTypes(request)
        
        # ks notes // Dispatch that list of work through the output receiver (to be picked up by workers)
        if (error == None):
            self.logger.info(workarray)
            self.total_task_count = len(workarray)
            self.__updateProgress__()
            for item in workarray:
                self.workToBeDone[item['workid']] = item
            workingArray = deepcopy(self.workToBeDone)   
            # ks notes // Not sure why deepcopy here, but a copy is made of the work list here and that copy is sent (as json string)
            for item in workingArray:
                self.outputreceiver.send_string(json.dumps(workingArray[item]))
            self.__watchForResults__()
        else:
            self.logger.warn("Got an error processing request: "+str(error))
            
            # ks refactor 2015 - Write Error to log, (also try and get the job id from the request)
            theJobID = ""
            try:
                theJobID = request['uniqueid']
            except:
                theJobID = ""
            self.__write_JobError_To_DB__(theJobID, str(error), str(request))
            
            self.progress = -1
            self.__cleanup__()
            self.__processProgress__(self.progress)
            self.__watchAgain__()
            
        self.logger.info("("+self.name+"):processWork: Process Work has reached the end!")

    
    def __watchForResults__(self):
        while (self.progress < 100):
            results = json.loads(self.listenreceiver.recv())
            self.processFinishedData(results)
        self.__finishJob__()
            
                
        
    def processFinishedData(self, results):
        self.logger.info("("+self.name+"):processFinishedData: Process Finished Work "+str(self.request))
        
        #self.logger.info("Process Finished Work "+str(self.request))
        #Need to process the data
        self.finished_task_count = self.finished_task_count +1
        
        self.workToBeDone.pop(results['workid'],None)
        missingValue = params.dataTypes[self.request['datatype']]['fillValue']
        #self.logger.info("Request:"+str(self.request))
        #self.logger.info("Results:"+str(results))
        
        
        # Another override
        #self.logger.info("HeadProcessor:processFinishedData:DEBUG: str(results) :  "+str(results))
        opname = ""
        if (self.isDownloadJob == True):
            # For Download Jobs.
            opname = self.dj_OperationName #self.mathop.getName()
            
            # Need to figure out why we use 'self.finished_items' and what happens if I just skip it..
            if results['value'] != missingValue:
                self.finished_items.append(results)
            
            #self.__updateProgress__()
        else:
            # For math operator type stats functions.
            opname = self.mathop.getName()
            if results['value'][opname] != missingValue:
                self.finished_items.append(results)
            #self.__updateProgress__()
            
        self.__updateProgress__()
        
        #self.logger.info("Opname"+opname)
        
        # This part of the code checks the value that the current operation returned, if it is different than the missing value, it is counted as a finished item.
        # This only applies to non-download jobs.. so here is the conditional.
        
        # Commenting old code (this was moved into the conditional above when 'download' jobs were added.)
        #if results['value'][opname] != missingValue:
        #    #self.logger.info("Adding data")
        #    self.finished_items.append(results)
        #self.__updateProgress__()
        ##self.logger.info("Progress :"+str(self.progress))
            
    def __sortData__(self,array):
        newlist = sorted(array, key=itemgetter('epochTime'))
        return newlist    
    
        
    def __updateProgress__(self,output_full=False):
        self.progress = (float(self.finished_task_count)/float(self.total_task_count))*100.
        if (self.progress < 100 or output_full == True):
            self.__processProgress__(self.progress)
        
    def __finishJob__(self):
        
        # KS Refactor 2015 // Pipe the request into the postprocess for download pipeline
        self.postProcessWork_ForDownloadTypes(self.request)
        
        #self.logger.info("Finished Job:"+str(self.request))
        self.logger.info("("+self.name+"):__finishJob__:Finished Job:"+str(self.request))
        
        # KS Refactor 2015 - Logging Job Finished
        theJobID = ""
        try:
            theJobID = str(self.request['uniqueid'])
        except:
            theJobID = ""
        self.__write_JobCompleted_To_DB__(theJobID, str(self.request))
        
        self.finished_items = self.__sortData__(self.finished_items)
#         ##Output Data
        self.__outputData__()
#         ##Update Progress 
        self.__updateProgress__(output_full=True)
        self.__cleanup__()
#         ###Back to looking for work.
        
    def __cleanup__(self):
        # self.logger.info("Cleanup")
        self.total_task_count = 0;
        self.finished_task_count = 0;
        self.current_work_dict = None
        self.finished_items = []
    
    
    def __writeResults__(self,uniqueid,results):
        filename = params.getResultsFilename(uniqueid)
        f = open(filename, 'w')
        json.dump(results,f)
        f.close()
        f = None
        
    def __insertProgressDb__(self,uniqueid):
        conn = bdp.BDDbConnector()
        conn.setProgress(uniqueid, 0)
        conn.close()
        
    def __updateProgressDb__(self,uniqueid, progress):
        conn = bdp.BDDbConnector()
        conn.setProgress(uniqueid, progress)
        conn.close()
        
    # KS Refactor 2015 - Adding ServerSide Job Log to request logs area - Log when Jobs are started.
    def __write_JobStarted_To_DB__(self,uniqueid, objectInfo):
        try:
            theID = uniqueid
            theStatusNote = "JobStarted"
            theAdditionalNotes = "Server Job: " + str(theID) + " has started :: Object Info: " + str(objectInfo)
            rLog = reqLog.requestLog()
            rLog.logger = self.logger
            rLog.add_New_ServerSide_Request(theID, theStatusNote, theAdditionalNotes)
        except:
            pass
        
    
    # KS Refactor 2015 - Adding ServerSide Job Log to request logs area - Log when Jobs are completed
    def __write_JobError_To_DB__(self,uniqueid,errorMessage, objectInfo):
        try:
            theID = uniqueid
            theStatusNote = "JobError"
            theAdditionalNotes = "Server Job: " + str(theID) + " had an Error.  Error Message: " + str(errorMessage) + " :: Object Info: " + str(objectInfo)
            rLog = reqLog.requestLog()
            rLog.logger = self.logger
            rLog.add_New_ServerSide_Request(theID, theStatusNote, theAdditionalNotes)
        except:
            pass
        
        
    # KS Refactor 2015 - Adding ServerSide Job Log to request logs area - Log when Jobs are completed
    def __write_JobCompleted_To_DB__(self,uniqueid, objectInfo):
        try:
            theID = uniqueid
            theStatusNote = "JobCompleted"
            theAdditionalNotes = "Server Job: " + str(theID) + " has been completed :: Object Info: " + str(objectInfo)
            rLog = reqLog.requestLog()
            rLog.logger = self.logger
            rLog.add_New_ServerSide_Request(theID, theStatusNote, theAdditionalNotes)
        except:
            pass
        
    def __writeMask__(self,uid,array,bounds):
        mst.writeHMaskToTempStorage(uid,array,bounds)
    
    def __preProcessIncomingRequest__(self, request):
        try:
            if(params.DEBUG_LIVE == True):
                self.logger.info("("+self.name+"):__preProcessIncomingRequest__: params.DEBUG_LIVE is set to True.  There will be a lot of textual output for this run.")               
            uniqueid = request['uniqueid']
            self.__insertProgressDb__(uniqueid)
            self.__write_JobStarted_To_DB__(uniqueid, str(request))  # Log when Job has started. 
            
            #self.logger.info("Processing Request: "+uniqueid)
            self.logger.info("("+self.name+"):__preProcessIncomingRequest__: uniqueid: "+str(uniqueid))
            
            datatype = request['datatype']
        
        
            begintime = request['begintime']
            endtime = request['endtime']
            intervaltype = request['intervaltype']
            
            # KS Refactor 2015 // Dirty override for download operations type.
            operationtype = request['operationtype']    # Original line (just get the operation param)
            # KS Refactor 2015 // Dirty override for download operations type.
            #self.mathop = pMath.mathOperations(operationtype,1,params.dataTypes[datatype]['fillValue'],None)
            #self.logger.info("("+self.name+"):__preProcessIncomingRequest__: DEBUG: About to do the DIRTY OVERRIDE! operationtype value: "+ str(operationtype))
            if(params.parameters[operationtype][1] == 'download'):
                # If this is a download dataset request, set the self.mathop prop to 0 (or 'max' operator.. this is just so I don't have to refactor a ton of code just to get this feature working at this time... note:  Refactor of this IS needed!)
                self.mathop = pMath.mathOperations(0,1,params.dataTypes[datatype]['fillValue'],None)
                
                # Additional customized code for download jobs
                self.isDownloadJob = True 
                self.dj_OperationName = "download"
            else:
                # This is pass through for all normal requests..
                self.mathop = pMath.mathOperations(operationtype,1,params.dataTypes[datatype]['fillValue'],None) 
                self.isDownloadJob = False
                self.dj_OperationName = "NotDLoad"
            
            #self.logger.info("("+self.name+"):__preProcessIncomingRequest__: DEBUG: MADE IT PASSED THE DIRTY OVERRIDE! requestID: "+uniqueid)
            
            size = params.getGridDimension(int(datatype))
            dates = dproc.getListOfTimes(begintime, endtime,intervaltype)
            
            if (intervaltype == 0):
                dates = params.dataTypes[datatype]['indexer'].cullDateList(dates)
                
            # KS Developer Note: The issue here is that I need to only cut simple rectangle shaped images out of the data.
            # All I really need is the largest bounding box that encompases all points (regardless of how complex the original polygon was)
            # Seems simple right? :)
            # The other part of this issue is that this only needs to happen on download data requests.  If I change the code for all requests, it becomes less efficient for stats type jobs.
            #self.logger.info("("+self.name+"):__preProcessIncomingRequest__: DEBUG ALERT: Right now, only user drawn polygons are supported for download requests.  Need to write a function that gets geometry values from features as well.. VERY IMPORTANT TODO BEFORE RELEASE!!")
            #geometry_ToPass = None
            polygon_Str_ToPass = None
            dataTypeCategory = params.dataTypes[datatype]['data_category'] #  == 'ClimateModel'
                
            geotransform, wkt = rp.getSpatialReference(int(datatype))
            self.logger.info("*****************************code*****************************")
            # User Drawn Polygon
            if ('geometry' in request):
                
                if(params.DEBUG_LIVE == True):
                    self.logger.info("("+self.name+"):__preProcessIncomingRequest__: DEBUG: GEOMETRY FOUND (POLYGON DRAWN BY USER)")
                
                
                # Get the polygon string
                polygonstring = request['geometry']
                
                # Process input polygon string
                geometry = geoutils.decodeGeoJSON(polygonstring)
                #geometry = geoutils.decodeGeoJSON(polygon_Str_ToPass)
                
                if(params.DEBUG_LIVE == True):
                    self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : polygonstring (request['geometry']) value: " + str(polygonstring))
                
                
                # Needed for download types
                #polygon_Str_ToPass = polygonstring 
                
                # IMPORTANT BEFORE RELEASING ALL DATA DOWNLOADS
                # running the below if statement part breaks the mask generation... 
                # Latest test shows that CHIRPS dataset actually produces a working image
                # and that seasonal forecasts do as well...
                # Lets see if there is a way to keep the mask on file downloads..
# BillyZ Fixed this
                self.logger.info('*****dataTypeCategory:*****' + dataTypeCategory)
                if((self.dj_OperationName == "download") | (dataTypeCategory == 'ClimateModel') | (dataTypeCategory == 'CHIRPS')):
                #if(self.dj_OperationName == "download"):
                #if((self.dj_OperationName == "download") | (dataTypeCategory == 'ClimateModel')| (dataTypeCategory == 'NDVI')):
                    self.logger.info("*****************************BYPASSED*****************************")
                    polygon_Str_ToPass = extractTif.get_ClimateDataFiltered_PolygonString_FromSingleGeometry(geometry)
                    
                    if(params.DEBUG_LIVE == True):
                        self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : polygon_Str_ToPass (request['geometry']) value: " + str(polygon_Str_ToPass))
                    
                    geometry = geoutils.decodeGeoJSON(polygon_Str_ToPass)
                    bounds, mask = mg.rasterizePolygon(geotransform, size[0], size[1], geometry)
                else:
                    self.logger.info("*****************************Not bypassed*****************************")
                    polygon_Str_ToPass = polygonstring 
                    bounds, mask = mg.rasterizePolygon(geotransform, size[0], size[1], geometry)
                    #polygon_Str_ToPass = extractTif.get_ClimateDataFiltered_PolygonString_FromSingleGeometry(geometry)
                    
                    if(params.DEBUG_LIVE == True):
                        self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : polygon_Str_ToPass (request['geometry']) value: " + str(polygon_Str_ToPass))
                    
                    #geometry = geoutils.decodeGeoJSON(polygon_Str_ToPass)
                    #bounds, mask = mg.rasterizePolygon(geotransform, size[0], size[1], geometry)
                
                
                # ks refactor // Getting geometry and bounds info.
                #geometry_ToPass = geometry
                
                if(params.DEBUG_LIVE == True):
                    self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : polygonstring (request['geometry']) value: " + str(polygonstring))
                    self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : (user defined polygon) geometry value: " + str(geometry))
                    self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : bounds value: " + str(bounds))
            
            
            # User Selected a Feature
            elif ('layerid' in request):
                
                if(params.DEBUG_LIVE == True):
                    self.logger.info("("+self.name+"):__preProcessIncomingRequest__: DEBUG: LAYERID FOUND (FEATURE SELECTED BY USER)")
                
                layerid = request['layerid']
                featureids = request['featureids']
                geometries  = sf.getPolygons(layerid, featureids)
                
                if(params.DEBUG_LIVE == True):
                    self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : (FeatureSelection) geometries value: " + str(geometries))
                
                
                
                
                # For Download data types, convert all of the geometries into a bounding box that covers the whole map.
                # RIGHT HERE!!
                #if(self.dj_OperationName == "download"):
                if((self.dj_OperationName == "download") | (dataTypeCategory == 'ClimateModel')):
                    # Convert all the geometries to the rounded polygon string, and then pass that through the system
                    polygonstring = extractTif.get_ClimateDataFiltered_PolygonString_FromMultipleGeometries(geometries)
                    polygon_Str_ToPass = polygonstring
                    geometry = geoutils.decodeGeoJSON(polygonstring)
                    bounds, mask = mg.rasterizePolygon(geotransform, size[0], size[1], geometry)
                
                else:
                    
                    bounds,mask = mg.rasterizePolygons(geotransform, size[0], size[1], geometries)
                
                
            
        #Break up date
        #Check for cached polygon
            #if no cached polygon exists rasterize polygon
            clippedmask = mask[bounds[2]:bounds[3],bounds[0]:bounds[1]]
            #self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : debug : Value of 'mask': " + str(mask))
            #self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : debug : Value of 'clippedmask': " + str(clippedmask))
            
        
            self.__writeMask__(uniqueid,clippedmask,bounds)
            
            del mask
            del clippedmask
            worklist =[]
            for date in dates:
                workid = uu.getUUID()
                #workdict = {'uid':uniqueid,'workid':workid,'bounds':bounds,'datatype':datatype,'operationtype':operationtype, 'intervaltype':intervaltype}
                workdict = {'uid':uniqueid,'workid':workid,'bounds':bounds,'datatype':datatype,'operationtype':operationtype, 'intervaltype':intervaltype, 'polygon_Str_ToPass':polygon_Str_ToPass} #'geometryToClip':geometry_ToPass}
                if (intervaltype == 0):
                    workdict['year'] = date[2]
                    workdict['month'] = date[1]
                    workdict['day'] = date[0]
                    dateObject = dateutils.createDateFromYearMonthDay(date[2], date[1], date[0])
                    workdict['isodate'] = dateObject.strftime(params.intervals[0]['pattern'])
                    workdict['epochTime'] = dateObject.strftime("%s")
                    worklist.extend([workdict])
                elif (intervaltype == 1):
                    workdict['year'] = date[1]
                    workdict['month'] = date[0]
                    dateObject = dateutils.createDateFromYearMonth(date[1], date[0])
                    workdict['isodate'] = dateObject.strftime(params.intervals[0]['pattern'])
                    workdict['epochTime'] = dateObject.strftime("%s")
                    worklist.extend([workdict])
                elif (intervaltype == 2):
                    workdict['year'] = date
                    dateObject = dateutils.createDateFromYear(date)
                    workdict['isodate'] = dateObject.strftime(params.intervals[0]['pattern'])
                    workdict['epochTime'] = dateObject.strftime("%s")
                    worklist.extend([workdict])
            # ks Refactor // Understanding how the work is distributed among worker threads.
            if(params.DEBUG_LIVE == True):
                self.logger.debug("("+self.name+"):__preProcessIncomingRequest__ : worklist array value: " + str(worklist))
            
            return None, worklist
        except Exception as e:
            self.logger.warn("("+self.name+"):Error processing Request in HeadProcessor: uniqueid: "+str(uniqueid)+" Exception Error Message: "+str(e))
            return e,None
        
    def __processProgress__(self, progress):
        self.__updateProgressDb__(self.request['uniqueid'],progress)
        
    def __outputData__(self):
        self.logger.info("outputting data for "+self.request['uniqueid'])
        output = {'data':self.finished_items}
        self.__writeResults__(self.request['uniqueid'], output)
        
    def __processErrors__(self, errors):
        self.logger.info("Errors  ",errors)
        
if __name__ == "__main__":
    name = sys.argv[1]
    inputconn = sys.argv[2]
    outputconn = sys.argv[3]
    listenconn = sys.argv[4]
    ZMQCHIRPSHeadProcessor(name, inputconn, outputconn, listenconn)
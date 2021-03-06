'''

Created on March 2016
@author: Kris Stanton

'''

import ftplib
import CHIRPS.utils.configuration.parameters as params

class IMERG_EarlyLate_EnumType(object):
    early = 1
    late = 2
    
class IMERG_Data:
    
    EarlyLateType = IMERG_EarlyLate_EnumType.late
    Earliest_IMERG1Day_YYYYMMDD = "20160101"
    
    FTP_RootFilePath = "ftp://jsimpson.pps.eosdis.nasa.gov/data/imerg/gis"
    FTP_RootHostPath = "ftp://jsimpson.pps.eosdis.nasa.gov/"    # Used in cleaning paths for direct downloading (downloading without changing directory on the server)
    
    FTP_Host = "jsimpson.pps.eosdis.nasa.gov" #"trmmopen.gsfc.nasa.gov" #"198.118.195.58" #trmmopen.gsfc.nasa.gov"  #"ftp://trmmopen.gsfc.nasa.gov"
    FTP_UserName = "billy.ashmall@nasa.gov" 
    FTP_UserPass = "billy.ashmall@nasa.gov" 
    FTP_SubFolderPath = "data/imerg/gis" #"pub/gis"
    
    
    # 2015 Specific (Legacy Dataset)
    FTP_2015_SubFolder_Path = "2015"
    
    
    def __init__(self):
        pass
    
    def _get_FTP_FolderPath_From_FullFilePath(self, full_FTP_FilePath):
        retString = full_FTP_FilePath[len(self.FTP_RootHostPath):]  # Subtracts off part of the URL leaving only the ftp folder structure (removes the host parts)
        return retString
    
    def _get_EarlyLate_StringPart(self):
        if(self.EarlyLateType == IMERG_EarlyLate_EnumType.early):
            return "E"
        else:
            return "L"
    
    def get_Expected_Tif_FileName(self, theYear, theMonth, theDay):
        theMonthSTR = str("%02d" % theMonth)    # Convert to two character string
        theDaySTR = str("%02d" % theDay)
        print "using data class in django"
        retFileName = ""
        retFileName += "3B-HHR-"
        retFileName += self._get_EarlyLate_StringPart()
        retFileName += ".MS.MRG.3IMERG."
        retFileName += str(theYear)
        retFileName += theMonthSTR
        retFileName += theDaySTR
        if self.if_File_Exists(theMonthSTR,  retFileName + "-S233000-E235959.1410.V04A.1day.tif"):
        	retFileName += "-S233000-E235959.1410.V04A.1day.tif"
        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S233000-E235959.1410.V04B.1day.tif"):
        	retFileName += "-S233000-E235959.1410.V04B.1day.tif"
        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S143000-E145959.0870.V04B.1day.tif"):
        	retFileName += "-S143000-E145959.0870.V04B.1day.tif"

        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S053000-E055959.0330.V04B.1day.tif"):
        	retFileName += "-S053000-E055959.0330.V04B.1day.tif"
        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S053000-E055959.0150.V04B.1day.tif"):
        	retFileName += "-S023000-E025959.0150.V04B.1day.tif"
        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S233000-E235959.1410.V05A.1day.tif"):
        	retFileName += "-S233000-E235959.1410.V05A.1day.tif"
        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S143000-E145959.0870.V05A.1day.tif"):
        	retFileName += "-S143000-E145959.0870.V05A.1day.tif"

        elif self.if_File_Exists(theMonthSTR,  retFileName + "-S053000-E055959.0330.V05A.1day.tif"):
        	retFileName += "-S053000-E055959.0330.V05A.1day.tif"
        else:
        	retFileName += "-S023000-E025959.0150.V05A.1day.tif"
        print retFileName
        return retFileName
        
    
    def get_Expected_FTP_FilePath_To_Tif(self, theYear, theMonth, theDay):
        theMonthSTR = str("%02d" % theMonth)    # Convert to two character string
        theDaySTR = str("%02d" % theDay)
        
        retString = ""
        retString += self.FTP_RootFilePath
        retString += "/"
        retString += str(theYear)
        retString += "/"
        retString += theMonthSTR
        retString += "/"
        
        retString += self.get_Expected_Tif_FileName(theYear, theMonth, theDay)
        #retString += "3B-HHR-"
        #retString += self._get_EarlyLate_StringPart()
        #retString += ".MS.MRG.3IMERG."
        #retString += str(theYear)
        #retString += theMonthSTR
        #retString += theDaySTR
        #retString += "-S000000-E002959.0000.V03E.1day.tif"
        
        return retString
    def if_File_Exists(self, month, filename):
        hasFile = False
        server = self.FTP_Host 
        

        try:
            ftp = ftplib.FTP(server)    
            ftp.login(self.FTP_UserName,self.FTP_UserPass)
        except Exception,e:
            print e, " ftp issue"
        else:    
            ftp.cwd('/data/imerg/gis/' + month)
            filelist = [] #to store all files
            ftp.retrlines('LIST',filelist.append)    # append to list  
            f=0
            for f in filelist:
                if filename in f:
                    hasFile = True
                    f=1
            if f==0:
                print "FTP has no file named " + filename
                hasFile = False
        return hasFile

    # Legacy 2015 Dataset
    def get_Expected_FTP_FilePath_To_Tif_2015Dataset(self, theYear, theMonth, theDay):
        theMonthSTR = str("%02d" % theMonth)    # Convert to two character string
        theDaySTR = str("%02d" % theDay)
        
        retString = ""
        retString += self.FTP_RootFilePath
        retString += "/"
        retString += self.FTP_2015_SubFolder_Path
        retString += "/"
        retString += theMonthSTR
        retString += "/"
        retString += self.get_Expected_Tif_FileName(theYear, theMonth, theDay)
        retString += ".gz"  # 2015 datasets are all gzipped... so.....
        return retString
        
    
    def get_Expected_FTP_FilePath_To_Tfw(self, theYear, theMonth, theDay):
        retString = self.get_Expected_FTP_FilePath_To_Tif(theYear, theMonth, theDay)
        retString = retString[:-2] # Remove part of the extension
        retString += "f"
        retString += "w"
        #retString[-2] = "f"
        #retString[-1] = "w"
        return retString
    
    def get_Expected_FTP_FilePath_To_Tfw_2015Dataset(self, theYear, theMonth, theDay):
        retString = self.get_Expected_FTP_FilePath_To_Tif_2015Dataset(theYear, theMonth, theDay)
        retString = retString[:-5] # Remove part of the extension (Removes if.gz)
        retString += "f"
        retString += "w"
        retString += ".gz"
        #retString[-2] = "f"
        #retString[-1] = "w"
        return retString
    
    def convert_TIF_FileName_To_TFW_Filename(self, tif_FileName):
        retTFWName = tif_FileName[:-2]
        retTFWName += "f"
        retTFWName += "w"
        return retTFWName
    
    def get_DefaultProjection_String(self):
        return 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433],AUTHORITY["EPSG","4326"]]'
        
    def get_DefaultGeoTransform_Obj(self):
        # For IMERG 1Day from jsimpson FTP, GIS TIFF outputs
        gt0_TopLeft_X = -179.9499969 #0
        gt1_WE_PixelResolution = 0.10 #0.05
        gt2_0a = 0 # Not sure what this is
        gt3_TopLeft_Y = 89.9499969 # 90
        gt4_0b = 0  # Not sure what this is
        gt5_NS_PixelResolution_Negative = -0.10 #-0.05
        ret_GeoTransform = (gt0_TopLeft_X, gt1_WE_PixelResolution, gt2_0a, gt3_TopLeft_Y, gt4_0b, gt5_NS_PixelResolution_Negative)
        return ret_GeoTransform
        #outFullGeoTransform = (outTransform_xPos, fullDatset_GeoTransform[1], fullDatset_GeoTransform[2], outTransform_yPos, fullDatset_GeoTransform[4], fullDatset_GeoTransform[5])
    
        #print("TODO, ADD THIS IN HERE")
        #ADD THESE NOW!!!!  (LOOK AT THE SIZE, CALCULATE THE NUMBERS BY THAT!!)
        #adfGeoTransform[0] /* top left x */
        #adfGeoTransform[1] /* w-e pixel resolution */
        #adfGeoTransform[2] /* 0 */
        #adfGeoTransform[3] /* top left y */
        #adfGeoTransform[4] /* 0 */
        #adfGeoTransform[5] /* n-s pixel resolution (negative value) */
        #pass
        
        # TFW file
    
    #def get_Expected_Local_FilePath_To_Tif(self, theYear, theMonth, theDay): 

# Example Paths
# ftp://jsimpson.pps.eosdis.nasa.gov/data/imerg/gis/01/3B-HHR-L.MS.MRG.3IMERG.20160101-S000000-E002959.0000.V03E.1day.tif
# ftp://jsimpson.pps.eosdis.nasa.gov/data/imerg/gis/01/3B-HHR-L.MS.MRG.3IMERG.20160101-S000000-E002959.0000.V03E.1day.tfw



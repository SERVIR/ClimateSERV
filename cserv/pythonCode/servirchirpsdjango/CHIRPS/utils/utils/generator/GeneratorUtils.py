'''

Created on May 2016
@author: Kris Stanton

'''

import CHIRPS.utils.configuration.parameters as params
import CHIRPS.utils.file.h5datastorage as dStore
import numpy
from Cython.Shadow import boundscheck

# Generator Utils functions


class Generator_Utils:
    '''
    This class is the collection of re-usable low level functions for getting pixels from HDF files
    and expected commonly grouped dataTypeNumbers
    '''
    
    def __init__(self):
        pass
    
    # Get a collection of datastores
    def _get_CollectionOfDataStores_ByYears(self, dataTypeNumber, startYear, endYear, openForWriting=False):
        hdf_Data_Store_List = []
        for yearWithData in range(startYear, endYear + 1):
            current_HDF_Store = self._get_DataStore(dataTypeNumber, yearWithData, openForWriting) # dStore.datastorage(dataTypeNumber, yearWithData)
            hdf_Data_Store_List.append(current_HDF_Store)
        return hdf_Data_Store_List
    
    # Wrapper for getting a datastore
    def _get_DataStore(self, dataTypeNumber, yearValue, forWriting):
        retDataStore = dStore.datastorage(dataTypeNumber, yearValue, forWriting)
        return retDataStore
    
    def _close_Store(self, theDataStore):
        theDataStore.close()
    
    # Get the Pixel Value for a single file, datatype, indexvalue, and bounds value
    def _get_Pixel_Value_For_HDFFile_Index_And_Bounds(self, hdf_Data_Store, indexValue, boundsValue):
        wrappedValue = hdf_Data_Store.getData(indexValue, boundsValue)  # Returns something like    :   array([[-9999.]], dtype=float32)
        pixelValue = wrappedValue[0][0]
        return pixelValue
        
    
    # Get an array of Pixel Value for a set of HDF_Files,  datatypes, using a common index and bounds value set 
    def _get_PixelArray_For_HDFFiles_Index_And_Bounds(self, hdf_Data_Store_List, indexValue, boundsValue):
        pixelArray = []
        #for dtNumber in dataTypeNumbers: 
        for hdf_Data_Store in hdf_Data_Store_List:
            pixelValue = self._get_Pixel_Value_For_HDFFile_Index_And_Bounds(hdf_Data_Store, indexValue, boundsValue)
            pixelArray.append(pixelValue)
        return pixelArray
        
    
    # Gets the Bounds for any given Pixel
    def _get_SinglePointBounds_ForPixel(self, xPixel, yPixel):
        # bounds = (minx,maxx,miny,maxy)
        pointBounds = (xPixel, xPixel + 1, yPixel, yPixel + 1)
        return pointBounds
    
    def _get_Bounds_ForArea(self, xPixelMin, xPixelMax, yPixelMin, yPixelMax):
        areaBounds = (xPixelMin, xPixelMax, yPixelMin, yPixelMax)
        return areaBounds
        
    # Calculate the percentile from the value array
    def _get_Calculated_PercentileValue(self, valueArray, percentile_To_Get):
        percentileValue = numpy.percentile(valueArray, percentile_To_Get)
        return percentileValue
    
    # Reads an array of numbers, Calculates a percentile from them, writes percentile data to the exact location
    # Writes the percentile value to the HDF Store in an exact location
    def _write_Percentile_To_HDFStore(self, percentileValue, hdf_Store_Output, indexValue, boundsValue):
        #write_Single_Value
        hdf_Store_Output.write_Array_To_Bounds(indexValue, boundsValue, percentileValue)
        #print("Writing Test.  Just wrote value: " + str(percentileValue) + " to bounds: " + str(boundsValue))
        
    
    # Reads the percentileDataTypeNumbers, pulls relavent dataTypeSpecific information and passes it on for writing., # gets the corresponding datastore  
    def _write_Percentiles_To_HDFStores(self, valueArray, percentileDataTypeNumbers, indexValue, boundsValue):
        
        # This may be highly inefficient (because we are opening and closing the HDF store for every single pixel write.
        # an improvement may be to open all the stores and pass their references to this function over and over again..
        # This will come out in the benchmark test
        for percentDataTypeNumber in percentileDataTypeNumbers:
            # Get the Data Store
            current_Fixed_year = params.dataTypes[percentDataTypeNumber]['fixed_year'] 
            current_HDF_Store = self._get_DataStore(percentDataTypeNumber, current_Fixed_year, True)
            
            # Get the percentile Value, calculate that percentile and write to the store
            current_Percentile_To_Get = params.dataTypes[percentDataTypeNumber]['percentile']
            current_PercentileValue = self._get_Calculated_PercentileValue(valueArray, current_Percentile_To_Get)
            self._write_Percentile_To_HDFStore(current_PercentileValue, current_HDF_Store, indexValue, boundsValue)
            
            # Close the data store
            self._close_Store(current_HDF_Store)
            
            
    
    #  
    
    # TESTS
    def test_Echo_Data_From_PercentileStore(self, indexValue, boundsValue):
        pass
    
    def test_OutputSectionWithData(self):
        chirpsMonthly_DataTypeNumber = 28
        chirpsData_Start_Year = 1985
        chirpsData_End_Year = 2016
        hdf_Data_Store_List = self._get_CollectionOfDataStores_ByYears(chirpsMonthly_DataTypeNumber, chirpsData_Start_Year, chirpsData_End_Year)
        
        # Normally in a forLoop
        xMin = 3600
        xMax = 3601
        yMin = 800
        yMax = 806
        currentBounds = self._get_Bounds_ForArea(xMin,xMax,yMin,yMax)
        
        
    def test_Controller_ProcessAreasOfData(self, xMin, xMax, yMin, yMax):
        pass
    
    def test_SmallDataset_Controller(self):
        # Test Copy and paste on console
        # import CHIRPS.utils.generator.GeneratorUtils as gu
        # genTests = gu.Generator_Utils()
        # genTests.test_SmallDataset_Controller()
        
        dataTypeNumber = 28  # Chirps Monthly Data Source
        size = params.dataTypes[dataTypeNumber]['size'] 
        sizeX = size[0]
        sizeY = size[1]
        
        bounds_Pixel_0 = self._get_SinglePointBounds_ForPixel(0,0)
        bounds_Pixel_1 = self._get_SinglePointBounds_ForPixel(0,1)
        bounds_Pixel_Mid = self._get_SinglePointBounds_ForPixel(sizeX/2,sizeY/2)
        bounds_Pixel_Last = self._get_SinglePointBounds_ForPixel(sizeX-1,sizeY-1)
        
         
        
        chirpsData_Start_Year = 1985
        chirpsData_End_Year = 2016
        
        # Get a reference to all the data stores
        hdf_Data_Store_List = []
        for yearWithData in range(chirpsData_Start_Year, chirpsData_End_Year + 1):
            #currentStore = dStore.datastorage(dataTypeNumber, yearWithData)
            current_HDF_Store = self._get_DataStore(dataTypeNumber, yearWithData, False) # dStore.datastorage(dataTypeNumber, yearWithData)
            hdf_Data_Store_List.append(current_HDF_Store)
            
            
        
        # At this point, we need to process this for each month of the year
        # so that would be an a range from 1 to 12.. but for this purpose, 
        # I'm just hardcoding Jan (index 0)
        current_HDF_Index = 0 # For this case, the index represents the month of the year, 0 means Jan.
        
        # Get the pixel value from each store
        # Test 1 - Pixel values array for 0, 1 middle and last pixel
        pixel_0_Values = self._get_PixelArray_For_HDFFiles_Index_And_Bounds(hdf_Data_Store_List, current_HDF_Index, bounds_Pixel_0)
        pixel_1_Values = self._get_PixelArray_For_HDFFiles_Index_And_Bounds(hdf_Data_Store_List, current_HDF_Index, bounds_Pixel_1)
        pixel_Mid_Values = self._get_PixelArray_For_HDFFiles_Index_And_Bounds(hdf_Data_Store_List, current_HDF_Index, bounds_Pixel_Mid)
        pixel_Last_Values = self._get_PixelArray_For_HDFFiles_Index_And_Bounds(hdf_Data_Store_List, current_HDF_Index, bounds_Pixel_Last)
        print("Test Results - For getting Pixel Arrays")
        print(" ==== ")
        print("Pixel 0: " + str(pixel_0_Values))
        print(" ==== ")
        print("Pixel 1: " + str(pixel_1_Values))
        print(" ==== ")
        print("Pixel Mid: " + str(pixel_Mid_Values))
        print(" ==== ")
        print("Pixel Last: " + str(pixel_Last_Values))
        print(" ==== ")
        
        print(" ==== ")
        print(" Test Results - For getting a larger number of pixel arrays ")
        # Small vertical line down the middle of the dataset
        #for y in range(800, 1200):
        for y in range(800, 806):
            xVal = 3600
            currentBounds = self._get_SinglePointBounds_ForPixel(xVal,y)
            currentPixelValues = self._get_PixelArray_For_HDFFiles_Index_And_Bounds(hdf_Data_Store_List, current_HDF_Index, currentBounds)
            print("Pixel Vals for (x,y) (" + str(xVal) + " , " + str(y) + ") : " + str(currentPixelValues))
        
            # Section of the code that actually writes to the HDF Files 
            # Now get the different percentiles and store them in their corresponding HDF Arrays
            #print("TODO, WRITE THE FUNCTIONS TO GET DATA INTO THESE STORES THAT MATCH THE DATATYPE NUMBERS BELOW!")
            chirps_Monthly_Percentile_Out_DataTypeNumbers = [29, 30, 31, 32, 33, 34, 35]
            percentileDataTypeNumbers = chirps_Monthly_Percentile_Out_DataTypeNumbers
            
            # Write the Pixels to the arrays
            self._write_Percentiles_To_HDFStores(currentPixelValues, percentileDataTypeNumbers, current_HDF_Index, currentBounds)
            
            
            # TEST OUTPUT!!
            # Validate that the new values were actually written to the HDFs
            chirps_Monthly_Percentile_Out_DataTypeNumbers = [29, 30, 31, 32, 33, 34, 35]
            test_HDF_Store = self._get_DataStore(29, 2016, False)   # 5th Percentile (at datatype 29)
            testValue = test_HDF_Store.getData(0, currentBounds)
            print("Test Value: 5th percentile: " + str(testValue))
        
        # Close all the stores
        for current_HDF_Store in hdf_Data_Store_List:
            self._close_Store(current_HDF_Store)
            
        
        
        
    
    def test_GetPixelArray(self):
        dataTypeNumber = 28 # 28 is CHIRPS Monthly Data
        
        
        pass
    
    def test_OtherTest(self):
        pass
    
    def test_ConsoleTest(self):
        
        # Benchmarking info
        # 7200 * 2000 = 14400000    # Number of single pixel slots on a single chirps dataset
        
        # Lines for Copy and pasting
        # import CHIRPS.utils.configuration.parameters as params
        # dataTypeNumber = 28
        # size = params.dataTypes[dataTypeNumber]['size'] 
        # sizeX = size[0]
        # sizeY = size[1]
        #
        # Testing the bounds for the very first and very last pixel
        # boundsStart = (0,0,0,0)
        # boundsEnd = (7200,7200,2000,2000)
        #
        # How to get access to an HDF Datafile
        # import CHIRPS.utils.file.h5datastorage as dStore
        # theYear = 2010
        # theStore = dStore.datastorage(dataTypeNumber, theYear)
        #
        # Selecting data
        # indexValue = 0
        # theStore.getData(indexValue, (0,1,0,1))    # actually selects the top left corner single pixel
        # theStore.getData(indexValue, (7199,7200,1999,2000))  # actually selects the bottom right corner single pixel
        #
        pass
    

class Generate_CHIRPS_Climatology:
    '''
    This does not need to be terribly efficient on it's first draft.
    Just need to get this to work.
    Data is pulled from many HDF files and vertically sliced into arrays.
    Percentile values are pulled from each of these arrays and placed into their position corresponding percentile HDF file.
    
    '''
    
    # Member Variables
    generatorUtils = Generator_Utils()
    chirps_Monthly_DataTypeNumber = 28
    chirps_Monthly_Percentile_Out_DataTypeNumbers = [29, 30, 31, 32, 33, 34, 35]  # ( 5th, - 95th Percentile datatypes)
    
    # Replace these two Hardcoded members after the system has a more flexible capabilities
    chirpsData_Start_Year = 1985
    chirpsData_End_Year = 2016  

    def __init__(self):
        pass
    
    
    
    # Generates the Climatology for Chirps
    def do_Generate_CHIRPS_Monthly_Climatology(self, xStart=0, xEnd=2, yStart=0, yEnd=2):
        
        dataTypeNumber = self.chirps_Monthly_DataTypeNumber # dataTypeNumber = 28
        size = params.dataTypes[dataTypeNumber]['size'] 
        sizeX = size[0]     # Range of 0 to 7200 will select the first AND last pixel using the loop below range(0,sizeX):
        sizeY = size[1]
        
        # Limit the number of times in the for loop (so we don't process the whole chunk in one shot.
        #xStart = 0
        #xEnd = 2    # Use, 'sizeX' to end at the max range, # Not included in the for loop
        #yStart = 0
        #yEnd = 2    # use, 'sizeY' to end at the max range, # This value is NOT included in the for loop but the last pixel DOES get selected for.
        
        # generatorUtils
        
        # Get a reference to all the data stores
        hdf_Data_Store_List = []
        for yearWithData in range(self.chirpsData_Start_Year, self.chirpsData_End_Year + 1):
            #currentStore = dStore.datastorage(dataTypeNumber, yearWithData)
            current_HDF_Store = self.generatorUtils._get_DataStore(dataTypeNumber, yearWithData, False) # dStore.datastorage(dataTypeNumber, yearWithData)
            hdf_Data_Store_List.append(current_HDF_Store)
            
            
        # Count each pixel iteration (which includes processing percentiles for all 12 months)  
        pixelCounter = 0
        
        lastX = 0
        lastY = 0
        for xPos in range(xStart, xEnd):
            for yPos in range(yStart, yEnd):
                for i in range (1,13):
                    
                    # Get the current Month Index
                    current_HDF_Month_Index = i #
                    
                    # Get the bounds
                    currentBounds = self.generatorUtils._get_SinglePointBounds_ForPixel(xPos,yPos)
                    
                    # Get the the pixel arrays 
                    currentPixelValues = self.generatorUtils._get_PixelArray_For_HDFFiles_Index_And_Bounds(hdf_Data_Store_List, current_HDF_Month_Index, currentBounds)
                    #print("Pixel Vals for (x,y) (" + str(xVal) + " , " + str(y) + ") : " + str(currentPixelValues))
        
                    # Section of the code that actually writes to the HDF Files 
                    # Now get the different percentiles and store them in their corresponding HDF Arrays
                    #chirps_Monthly_Percentile_Out_DataTypeNumbers = [29, 30, 31, 32, 33, 34, 35]
                    percentileDataTypeNumbers = self.chirps_Monthly_Percentile_Out_DataTypeNumbers
            
                    # Write the Pixels to the arrays
                    self.generatorUtils._write_Percentiles_To_HDFStores(currentPixelValues, percentileDataTypeNumbers, current_HDF_Month_Index, currentBounds)
            
                
                
                pixelCounter += 1
                lastY = yPos
                if(pixelCounter % 1000 == 0):
                    print("Just finished writing pixel number: " + str(pixelCounter) + " for all twelve Months.  Last (x,y) pixel x,y position: " + str(xPos) + " , " + str(yPos))   
                pass
            lastX = xPos
            pass
        pass
    
    
        # Close all the stores
        for current_HDF_Store in hdf_Data_Store_List:
            self._close_Store(current_HDF_Store)
    
            
        print("REPORT: Last X,Y positions processed")
        print("REPORT: lastX : " + str(lastX))
        print("REPORT: lastY : " + str(lastY))
        
    
        #current_HDF_Index = 0 # For this case, the index represents the month of the year, 0 means Jan.
        
        # For each month of any given year
        
        # For each pixel on a section of the dataset
        #for xPos in range(0, sizeX):
        #    for yPos in range(0, sizeY):
        #        for i in range (1,13):
        #            current_HDF_Month_Index = i #
        #        pass
        #    pass
        #pass
    

    # Functions TODO
    # do_Generate_CHIRPS_Monthly_Climatology() # Walk through each pixel and each month.  save the climatology array values into their corresponding HDF files
        # For each Month of the Year
            # For Each Pixel on the array 
                # Get the Index Value (Tells us which temporal position in each yearly HDF file)
                # Get the current HDF Bounds (tells us which pixel we are pulling data from)
                # Get the array of ALL values in the current pixel position for (the SAME MONTH of ALL YEARS (array order does not matter yet))
                # Sort the array (from least to greatest or greatest to least?)
                # Use Numpy to get all of the percetile values that we want,
                # Write each of those values to their corresponding HDF Percentile files (index and pixel position / bounds must match)
                
    # Processing Metrics
    # 7200 x 2000 = 14,400,000 Pixels * 12 Months = 172,800,000 * 7 percentile values = 1,209,600,000 HDF Pixel values
    
    # Benchmarks (Local Machine)
    # 100 pixels (8400 HDF Writes) took 47.20 seconds (With Output Strings for each write)
    # 100 pixels (8400 HDF Writes) took 59.02 seconds (NO OUTPUT STRINGS unti the end.)
    
    # Some quick calcs
    # 60 seconds per hundred pixels (1 minute.. so 10 minutes per 1000, 20 minutes per thousand item row), that is 20 minutes * 7200 rows....)
    # ... thats 144,000 minutes, or 2,400 hours, or 100 days.... hmm.. need to be more efficient!
    
    # Time for Optimizations
    
    # Test Console commands
    # import CHIRPS.utils.generator.GeneratorUtils as gu
    # chirpsGenerator = gu.Generate_CHIRPS_Climatology() 
    # chirpsGenerator.do_Generate_CHIRPS_Monthly_Climatology(0, 100, 0, 1)
                
# Old Notes
# Todo!  Clean up after done writing this code... 
#  These notes are a result of not being able to write this entire class in one sitting.
#  When having to split my attention across multiple sittings, these notes provide a nice clean guide to use.
# _get_PixelArray_For_Position()  # Opens ALL the HDF Files for this given month for every year and pulls the requested pixel.

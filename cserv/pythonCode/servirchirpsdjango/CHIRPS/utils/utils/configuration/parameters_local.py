'''
Created on Jun 3, 2014

@author: jeburks
'''
import CHIRPS.utils.processtools.dateIndexTools as dit
logToConsole = True
serviringestroot = '''/Users/jeburks/work/SERVIR/Code/Server/SERVIR/serviringest/'''
maskstorage = '''/Users/jeburks/temp/mask/'''
dbfilepath = '''/Users/jeburks/temp/servirchirps.db'''
newdbfilepath = '''/Users/jeburks/temp/servirchirps_bsd.db'''
capabilities_db_filepath = '''/Users/jeburks/temp/servirchirps_bsd_capabilities.db'''
logfilepath = '''/Users/jeburks/temp/logs/'''
workpath = '''/Users/jeburks/temp/chirpswork'''
shapefilepath = '''/Users/jeburks/work/SERVIR/Data/GIS/mapfiles/'''
ageInDaysToPurgeData = 2
#profileLocation = 'mycluster'
#profileClientLocation = None
parameters = ([0,'max',"Max"],[1,'min',"Min"],[2,'median',"Median"],[3,'range',"Range"],[4,'sum',"Sum"],[5,'avg','Average'])
dataTypes = (
             {'number':0,
              'name':'Chirps','description':'CHIRPS description',
              'size':[7200,2000],
              'directory':'/Users/jeburks/work/SERVIR/Data/Processed/CHIRPS/',
              'fillValue':-9999.,
              'indexer': dit.DailyIndex(),
              'inputDataLocation':'/Users/jeburks/work/SERVIR/Code/Server/SERVIR/serviringest/'},
             
             {'number':1,
              'name':'NDVI MODIS-West Africa',
              'description':'NDVI MODIS West Africa description',
              'size':[19271, 7874],
              'directory':'/Users/jeburks/work/SERVIR/Data/Processed/eMODIS/ndvi-westafrica/',
              'fillValue':-9999.,
              'indexer': dit.EveryFiveDaysIndex(),
              'inputDataLocation':'/Users/jeburks/work/SERVIR/Data/Image/eMODIS/westafrica/'
              },
             
             {'number':2,
              'name':'NDVI MODIS-East Africa',
              'description':'NDVI MODIS East Africa description',
              'size':[12847,14712],
              'directory':'/Users/jeburks/work/SERVIR/Data/Processed/eMODIS/ndvi-eastafrica/np/',
              'fillValue':-9999.,
             'indexer': dit.EveryFiveDaysIndex(),
             'inputDataLocation': '/Users/jeburks/work/SERVIR/Data/Image/eMODIS/eastafrica/'
             },
             
             {'number':3,
              'name':'NDVI MODIS-North Africa','description':'NDVI MODIS North Africa description',
              'size':[23415, 7045],
              'directory':'/Users/jeburks/work/SERVIR/Data/Processed/eMODIS/ndvi-northafrica/np/',
              'fillValue':-9999.,
              'indexer': dit.EveryFiveDaysIndex(),
              'inputDataLocation':'/Users/jeburks/work/SERVIR/Data/Image/eMODIS/northafrica/'
              },
             
             {'number':4,
              'name':'NDVI MODIS-Central Africa',
              'description':'NDVI MODIS Central Africa description',
              'size':[1600,1500],
              'directory':'/Users/jeburks/work/SERVIR/Data/Processed/eMODIS/ndvi-centralafrica/np/',
              'fillValue':-9999.,
              'indexer': dit.EveryFiveDaysIndex(),
              'inputDataLocation':'/Users/jeburks/work/SERVIR/Data/Image/eMODIS/centralafrica/'
              },
             
             {'number':5,'name':'NDVI MODIS-South Africa',
              'description':'NDVI MODIS South Africa description',
              'size':[1600,1500],
              'directory':'/Users/jeburks/work/SERVIR/Data/Processed/eMODIS/ndvi-southafrica/np/',
              'fillValue':-9999.,
              'indexer': dit.EveryFiveDaysIndex(),
              'inputDataLocation': '/Users/jeburks/work/SERVIR/Data/Image/eMODIS/southafrica/'
              },
             )
dataTypeInfo = ({'path':'/Users/jeburks/data/shapefiles','layer':'county'})
shapefileName =[{'id':'country',
                 'displayName':"Countries",
                 'shapefilename':'country.shp',
                 'visible':'true'},
                 {'id':'admin_1_earth',
                 'displayName':"Admin #1",
                 'shapefilename':'admin_1_earth.shp',
                 'visible':'false'},
                {'id':'admin_2_af',
                 'displayName':"Admin #2",
                 'shapefilename':'admin_2_af.shp',
                 'visible':'false'},
                {'id':'sept2015_zoi',
                 'displayName':"FTF ZOI",
                 'shapefilename':'sept2015_zoi.shp',
                 'visible':'false'}
                  ]
operationTypes = (
                  [0,'max',"Max"],
                  [1,'min',"Min"],
                  [2,'median',"Median"],
                  [3,'range',"Range"],
                  [4,'sum',"Sum"],
                  [5,'avg',"Average"]
                  )
intervals = (
             {'name':'day','pattern':'%m/%d/%Y'},
             {'name':'month','pattern':'%m/%Y'},
             {'name':'year','pattern':'%Y'}
             )

resultsdir = '''/Users/jeburks/temp/results/'''

# Climate Change Scenario Specific
# ks refactor 2015 // New Parameter Variables : New variable to match climate change variable names
# KeyVals, // "Name" is the label passed in to the ingest scripts, "VarNameForFile" is the label that is a part of the processed tif file name
Climate_Variable_Names = []
# ks refactor 2015 // New Parameter Variables : Object used by clientside code to assist in building client UI and client UI Validation.
ClientSide_ClimateChangeScenario_Specs = {
    "Climate_Variable_Names":Climate_Variable_Names
}

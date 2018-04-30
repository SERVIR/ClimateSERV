/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*  url(r'^getParameterTypes/','servirchirps.views.getParameterTypes'),
    url(r'^getDataTypes/','servirchirps.views.getDataTypes'),
    url(r'^submitDataRequest/','servirchirps.views.submitDataRequest'),
    url(r'^getDataRequestProgress/','servirchirps.views.getDataRequestProgress'),
    url(r'^getDataFromRequest/','servirchirps.views.getDataFromRequest')
 */
var climateModelInfo = null;       // See climateModelInfo_ functions below for accessibility of this object
var imerg1Day_Info = null;

var parameterTypes = [];
var parameterType;
var operationType;
var polygon;
var dataType;
var intervalType;
var beginTime;
var endTime;
var uniqueid;
var data;
var hashData ;
var myArray;
var progressForId;
var varName;
var varTitle;
var dataFromRequest;
var parseDate = d3.time.format("%m/%d/%Y").parse;
var timer;
var timerInterval = 2000;
var parsingFormat = ['%m/%d/%Y','%m/%Y','%Y'];
var dateformat = ['%m/%d/%Y',"%B/%Y","%Y"];
var initializedDialog = false;

var isLocalMode = false;     // KS Refactor 2015 // Keep track of local or remote running versions
var debug_ErrorList = [];    // KS Refactor 2015 // Store Try/Catch errors in this array for debugging.
var graphable_MonthlyRainfallAnalysis_Object = null; // Object ready to be graphed.
var theJson;
var LSTvalue;

// JSON.stringify(climateModelInfo)
var json___climateModelInfo = {"climate_DatatypeMap":[{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 10","climate_Ensemble":"ens10","dataType_Number":24},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 10","climate_Ensemble":"ens10","dataType_Number":25}],"climate_Ensemble":"ens10"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 05","climate_Ensemble":"ens05","dataType_Number":14},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 05","climate_Ensemble":"ens05","dataType_Number":15}],"climate_Ensemble":"ens05"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 04","climate_Ensemble":"ens04","dataType_Number":12},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 04","climate_Ensemble":"ens04","dataType_Number":13}],"climate_Ensemble":"ens04"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 07","climate_Ensemble":"ens07","dataType_Number":18},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 07","climate_Ensemble":"ens07","dataType_Number":19}],"climate_Ensemble":"ens07"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 06","climate_Ensemble":"ens06","dataType_Number":16},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 06","climate_Ensemble":"ens06","dataType_Number":17}],"climate_Ensemble":"ens06"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"Ensemble 01","climate_Ensemble":"ens01","dataType_Number":6},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 01","climate_Ensemble":"ens01","dataType_Number":7}],"climate_Ensemble":"ens01"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 03","climate_Ensemble":"ens03","dataType_Number":10},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 03","climate_Ensemble":"ens03","dataType_Number":11}],"climate_Ensemble":"ens03"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 02","climate_Ensemble":"ens02","dataType_Number":8},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 02","climate_Ensemble":"ens02","dataType_Number":9}],"climate_Ensemble":"ens02"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 09","climate_Ensemble":"ens09","dataType_Number":22},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 09","climate_Ensemble":"ens09","dataType_Number":23}],"climate_Ensemble":"ens09"},{"climate_DataTypes":[{"climate_Variable":"tref","climate_Variable_Label":"Temperature","climate_Ensemble_Label":"ensemble 08","climate_Ensemble":"ens08","dataType_Number":20},{"climate_Variable":"prcp","climate_Variable_Label":"Precipitation","climate_Ensemble_Label":"Ensemble 08","climate_Ensemble":"ens08","dataType_Number":21}],"climate_Ensemble":"ens08"}],"RequestName":"getClimateScenarioInfo","climate_DataTypeCapabilities":[{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens01 Temperature\", \"description\": \"Climate Change Scenario: ens01 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens01\"}","dataTypeNumber":6},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens01 Precipitation\", \"description\": \"Climate Change Scenario: ens01 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens01\"}","dataTypeNumber":7},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens02 Temperature\", \"description\": \"Climate Change Scenario: ens02 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens02\"}","dataTypeNumber":8},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens02 Precipitation\", \"description\": \"Climate Change Scenario: ens02 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens02\"}","dataTypeNumber":9},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens03 Temperature\", \"description\": \"Climate Change Scenario: ens03 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens03\"}","dataTypeNumber":10},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens03 Precipitation\", \"description\": \"Climate Change Scenario: ens03 Variable: Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens03\"}","dataTypeNumber":11},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens04 Temperature\", \"description\": \"Climate Change Scenario: ens04 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens04\"}","dataTypeNumber":12},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens04 Precipitation\", \"description\": \"Climate Change Scenario: ens04 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens04\"}","dataTypeNumber":13},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens05 Temperature\", \"description\": \"Climate Change Scenario: ens05 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens05\"}","dataTypeNumber":14},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens05 Precipitation\", \"description\": \"Climate Change Scenario: ens05 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens05\"}","dataTypeNumber":15},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens06 Temperature\", \"description\": \"Climate Change Scenario: ens06 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens06\"}","dataTypeNumber":16},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens06 Precipitation\", \"description\": \"Climate Change Scenario: ens06 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens06\"}","dataTypeNumber":17},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens07 Temperature\", \"description\": \"Climate Change Scenario: ens07 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens07\"}","dataTypeNumber":18},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens07 Precipitation\", \"description\": \"Climate Change Scenario: ens07 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens07\"}","dataTypeNumber":19},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens08 Temperature\", \"description\": \"Climate Change Scenario: ens08 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens08\"}","dataTypeNumber":20},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens08 Precipitation\", \"description\": \"Climate Change Scenario: ens08 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens08\"}","dataTypeNumber":21},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens09 Temperature\", \"description\": \"Climate Change Scenario: ens09 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens09\"}","dataTypeNumber":22},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens09 Precipitation\", \"description\": \"Climate Change Scenario: ens09 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens09\"}","dataTypeNumber":23},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"tref\", \"variable_Label\": \"Temperature\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens10 Temperature\", \"description\": \"Climate Change Scenario: ens10 Temperature\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens10\"}","dataTypeNumber":24},{"current_Capabilities":"{\"fillValue\": -9999.0, \"projection\": \"GEOGCS[\\\"WGS 84\\\",DATUM[\\\"WGS_1984\\\",SPHEROID[\\\"WGS 84\\\",6378137,298.257223563,AUTHORITY[\\\"EPSG\\\",\\\"7030\\\"]],AUTHORITY[\\\"EPSG\\\",\\\"6326\\\"]],PRIMEM[\\\"Greenwich\\\",0],UNIT[\\\"degree\\\",0.0174532925199433],AUTHORITY[\\\"EPSG\\\",\\\"4326\\\"]]\", \"startDateTime\": \"2017_05_01\", \"grid\": [0.0, 0.5, 0.0, 90.0, 0.0, -0.5], \"variable\": \"prcp\", \"variable_Label\": \"Precipitation\", \"size\": [720, 360], \"name\": \"Climate Change Scenario: ens10 Precipitation\", \"description\": \"Climate Change Scenario: ens10 Precipitation\", \"endDateTime\": \"2017_10_28\", \"date_FormatString_For_ForecastRange\": \"%Y_%m_%d\", \"data_category\": \"ClimateModel\", \"number_Of_ForecastDays\": 180, \"ensemble\": \"ens10\"}","dataTypeNumber":25}],"isError":false};
//    climateModelInfo = json___climateModelInfo;


//var minDate_Imerg1Day = null;
//var maxDate_Imerg1Day = null;

compareFunction = function (a,b){
    return a-b
}

//if (window.location.hostname === 'localhost2')
// Cris Squared Refactor 2016 - Added a Choice to editing local mode on page load
var confirm_value = false;
//console.log("window.location.hostname: " + window.location.hostname); 
if (window.location.hostname === 'localhost')  // This breaks for 'file:///' loads.. but thats ok!
{
    confirm_value = confirm("Use Localhost API Server?  Select 'OK' to use the localhost as the data source for API Server.  Select 'cancel' to use the Live Server");
}
if(confirm_value == true)
{
 
    isLocalMode = true;
    var baseurl = "http://localhost/";
    var baserequesturl = "http://localhost:8000/";
 
    // KS Refactor Design 2016 // Changing Map Layers from 4326 to 3857
    //var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/jeburks/work/SERVIR/data/GIS/mapfiles/servir.map"; // jeburks dev
    //var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/kris/work/SERVIR/data/GIS/mapfiles/servir.map"; // ks dev
    var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/kris/work/SERVIR/data/GIS/mapfiles/servir.map"; // ks dev
    
} else {
    isLocalMode = false;
    //var baseurl = "http://climateserv.servirglobal.net/";
    //var baserequesturl = "http://chirps.nsstc.nasa.gov/chirps/";
    //var baseWMSurl = "http://chirps.nsstc.nasa.gov/cgi-bin/servirmap?";
    
    //var hostName = window.location.hostname;
    var hostName = "climateserv.servirglobal.net"; //"chirps.nsstc.nasa.gov";
    var baseurl = "https://"+hostName+"/";
    var baserequesturl = "https://"+hostName+"/chirps/";
    // KS Refactor Design 2016 // Changing Map Layers from 4326 to 3857
    //var baseWMSurl = "http://"+hostName+"/cgi-bin/servirmap?";
    var baseWMSurl = "https://"+hostName+"/cgi-bin/servirmap_102100?";
}


// KS Refactor 2015 // Get Climate model info from the server and do init related to all of that
function getClimateModelInfo()
{
	if(isLocalMode == true)
    {
        processClimateModelInfo(json___climateModelInfo);
    }
    else
    {
        $.getJSON(baserequesturl+'getClimateScenarioInfo/?callback=?', function(data) {
            processClimateModelInfo(data);
        });
    }
}

// Get the Info for the current datatype // IMERG and SMAP refactor
function getCapabilitiesForDataset(theDataType)
{
    $.getJSON(baserequesturl+'getCapabilitiesForDataset/?datatype='+theDataType+'&callback=?', function(data) {
        processDatasetCapabilitiesInfo(data);
    })
}


//Go get the list of available parameter types from the server.
function getParameterTypes() {
     $.getJSON(baserequesturl+'getParameterTypes/?callback=?', function(data) {
        processParameterTypes(data);
       
    });
}



function getFeatureLayers() {
     $.getJSON(baserequesturl+'getFeatureLayers/?callback=?', function(data) {
        processFeatureLayers(data);
       
    });
}


function processDatasetCapabilitiesInfo(data)
{
    // At the time of this development, this only applies to IMERG
    //alert("stopped here!!");
    //init_Dynamic_Capabilities_UIs();
    
    //minDate_Imerg1Day =
    //maxDate_Imerg1Day =
    
    imerg1Day_Info = data;
    
}

// KS Refactor 2015 // Process the Climate Model Info (Store the API Response to a local JS Var)
function processClimateModelInfo(data)
{
    climateModelInfo = data;
    
    // Now that the data is available, initialize the UI elements related to Climate Model data
    init_ClimateModel_UI();
}

function processFeatureLayers(data) {
    //Foreach array item
   //{"visible": "true", "displayName": "Countries", "id": "country"}
   
    for (i = 0; i < data.length; i++) { 
        var visible = false;
        if (data[i]['visible'] === 'true') 
        {
            //visible = true;  // KS Refactor Design 2016 Override // We want all of the feature layers to be visible false by default.
        } 
        addLayer(data[i]['displayName'], data[i]['id'], visible);
    }
}

//Process the parameter type returned from the server.
function processParameterTypes(data){
    for (i in data) {
        parameterTypes[data[i][0]]={'lname':data[i][1],'uname':data[i][1]};
    }
    
}

//Get the data types from the server
function getDataTypes() {
    ///TODO need to fill in the value
}

//Start a timer. This timer is used to callback the server to check status of the data request
function startTimer(callback) {
    timer = $.timer(callback);
    timer.set({time:timerInterval,autostart:true});
}

//Stop the timer that callsback the server to check up the data request.
function stopTimer() {
    if (timer) {
        timer.stop();
    }
}

function cleanBeforeSendRequest() {
    d3.select("svg").remove();
    uniqueid = "";
    progressForId=0;
}

function check_Filter_For_New_Dataset_DataTypeValue_Options(theDataTypeValue)
{
    
    if(theDataTypeValue.toLowerCase() == "imerg1day")  // IMERG1Day
    {
        return 26;
    }
    return theDataTypeValue;
}

// KS Refactor 2016 // Moved this function into design2016.js
// Need to convert currentStringPolygon to 4326 before submitting request
//function convert_PolygonString_To_4326_ForRequest(polygonString)
//{
//    var polyObj = JSON.parse(polygonString);
//    for(var i = 0; i < polyObj.coordinates[0].length; i++)
//    {
//        polyObj.coordinates[0][i] = ol.proj.transform( polyObj.coordinates[0][i] , 'EPSG:102100', 'EPSG:4326');
//    }
//    var retString = JSON.stringify(polyObj);
//    return retString;
//}

// Submit a data request to the server for processing.
// KS Refactor 2016 // Created a new MonthlyRainfallAnalysisRequest
// Submit a Monthly Analysis Data Request to the server for processing.
// Maybe we need to roll multiple 'MonthlyAnalysis' types together..
//function submitMonthlyRainfallAnalysisRequest() // Maybe we need to roll multiple
// Submit a data request to the server for processing.  - Monthly Analysis Request Types
function submitMonthlyAnalysisRequest()
{

    // Clears graph, global uniqueid and progress bar info variables
    cleanBeforeSendRequest();

    // Setup the Values to submit to the server.
    var seasonal_start_date = "";
    var seasonal_end_date = "";
    try
    {
        var single_climate_model_capabiliites = JSON.parse(climateModelInfo.climate_DataTypeCapabilities[0].current_Capabilities);
        seasonal_start_date = single_climate_model_capabiliites.startDateTime; //"2017_05_01";
        seasonal_end_date = single_climate_model_capabiliites.endDateTime; //"2017_10_28";
    }
    catch(err_Getting_Dates_From_Climate_Model_Capabilities)
    {
        seasonal_start_date = "";
        seasonal_end_date = "";
    }


    //data = {};
    data =
    {
        'custom_job_type':'monthly_rainfall_analysis',
        'seasonal_start_date':seasonal_start_date,
        'seasonal_end_date':seasonal_end_date
    };

    // Grab the Geo Selection Stuff (this was copied from some old legacy code).. note, 'clickEnabled' is probably not the best way to check and see if a feature selection was made vs a polygon definition created....
    if (clickEnabled || (last_GeoSelection_State == "Feature"))
    {
        data['layerid'] = layerIds[selectedLayer];
        data['featureids'] = selectedFeatures.join()
    } else
    {
        // KS Refactor Design 2016 Override // The base layer USED to be 4326, but the server still only understands 4326 so we need to convert cords back to it just before making the request)
        data['geometry'] = convert_PolygonString_To_4326_ForRequest(currentStringPolygon); //currentStringPolygon;
    }

    // Tracking requests.
    debugMe_AjaxData.push(data);

    // Some of these do not really make sense here, but I don't want to exclude them in case of unexpected bugs and results.
    // Would be a good idea to either refactor to clean stuff like this out, or to simply wait until a need to rebuild the pipeline comes along.
    $("#defineAreaDialog").dialog("close");
    $("#progressbar").progressbar({value:0});
    update_ProgressBar(0); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
    $("#progresslabel").text("Submitting monthly analysis Request...");
    $("#progressdialog").dialog();

    // Ajax section
    $.ajax({url: baserequesturl+'submitMonthlyRainfallAnalysisRequest/?callback=?',
    type: "get",
    data: data,
    dataType: "jsonp",
    jsonpCallback: 'successCallback',
    async: true,
    beforeSend: function() {

    },
    complete: function() {

    },
    success: function (result) {
        uniqueid = result[0];
        $("#progressbar").progressbar({value:0});
        update_ProgressBar(0); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
        $("#progresslabel").text("Processing..."+0+"%");
        $("#requestId").html(get_ProgressBarID_HTML(uniqueid));
        hide_DownloadFileLink();    // Hide the download file link before showing the progress dialog box.
        $("#progressdialog").dialog();


        //startTimer(getDataRequestProgress);         // Normal Request
        startTimer(getDataRequestProgress_ForMonthlyAnalysisTypes);         // Monthly Analysis Types

    },
    error: function (request,error) {
        console.log("Got an error");
    },
    successCallback:function(){

    }
});
        // WALKING DOWN 'submitDataRequest' STOPPED HERE... CONTINUE SOON!
}


var dPolygon;

// Submit a data request to the server for processing.   - Normal Flat Request Types
//Submit a data request to the server for processing.
function submitDataRequest() 
{
    // Clears graph, global uniqueid and progress bar info variables
    cleanBeforeSendRequest();
        
    
        
    // Default UI values
    //popup animation loop
    //Get values and submit search
    var operationValue = $('#operationmenu').val();
    var dataTypeValue = check_Filter_For_New_Dataset_DataTypeValue_Options( $('#typemenu').val() ); // $('#typemenu').val();

    // KS Refactor 201511 clientupdates_201511
    //var dateintervalValue = $('#dateintervalmenu').val();
    var dateintervalValue = 0;
    
    var dateBeginValue =  $('#datepickerbegin').val();      // Format, "01/31/2015" or "dd/mm/yyyy"
    var dateEndValue =  $('#datepickerend').val();
    
    // KS Refactor 2015 // Adding hook for climate datatypes
    var dataType_Option_Value = $('#typemenu').val(); // $("#typemenu option:selected" ).attr("value");
    var climate_DataType_OptionValue = "ClimateModel"; // TODO! Change this from hardcoded to relative variable (needs changes in a few places throughout the code, including the API)
    
    // New Params
    var dateType_Category = "default";
    var isZip_CurrentDataType = false;
    
    if(dataType_Option_Value.toLowerCase() == climate_DataType_OptionValue.toLowerCase())
    {
        // New Params
        dateType_Category = "ClimateModel";
        
        // Override the values above with items from the Climate UI.
        operationValue = $('#select_OperationType_ClimateModel').val();
        dataTypeValue = $('#select_Variable_ClimateModel').val();
        dateintervalValue = $('#select_dateintervalmenu_ClimateModel').val();
        
        // Process begin and end date values (from/to boxes)    // Input Format "09-04-2015"  // API needs, "09/04/2015"
        
        // Javascript is a funny sometimes... so we need to do this to replace all occurances of a string (instead of just the first one)
        var str_Find = "-";
        var str_Replace = "/";
        var regEx_Find = new RegExp(str_Find, 'g');
        // USAGE:  // str = str.replace(regEx_Find, str_Replace);
        
        var dateBeginValue_Raw = $("#select_RangeFrom_ClimateModel").val();
        var dateEndValue_Raw = $("#select_RangeTo_ClimateModel").val();
        
        // Override the dates from above with (// Input Format "09-04-2015"  // API needs, "09/04/2015") 
        dateBeginValue = dateBeginValue_Raw.replace(regEx_Find, str_Replace);
        dateEndValue = dateEndValue_Raw.replace(regEx_Find, str_Replace);
        
    }
    
    if (dataType_Option_Value.toLowerCase() == 'lst') {
        dataType = 25;
        //alert('do gee stuff here');
        splitBeginDate = dateBeginValue.split("/");
        splitEndDate = dateEndValue.split("/");
        theJson = {
            collectionNameTimeSeries: "MODIS/MOD11A1",
            dateFromTimeSeries: splitBeginDate[2] + "-" + splitBeginDate[0] + "-" + splitBeginDate[1],//"2015-01-01", //yyyy-mm-dd
            dateToTimeSeries: splitEndDate[2] + "-" + splitEndDate[0] + "-" + splitEndDate[1],//"2016-01-02",
            indexName: "LST_Day_1km",
            scale: "2000",
            reducer: $('#operationmenu option:selected').text().toLowerCase(),
            polygon: convert_PolygonString_To_4326_ForRequest(currentStringPolygon)
        };
        var collectionNameTimeSeries = "MODIS/MOD11A1";
        var dateFromTimeSeries = splitBeginDate[2] + "-" + splitBeginDate[0] + "-" + splitBeginDate[1]; //"2015-01-01";
        var dateToTimeSeries = splitEndDate[2] + "-" + splitEndDate[0] + "-" + splitEndDate[1]; //"2016-01-02";
        var indexName = "LST_Day_1km";
        var scale = "20000";
        var reducer = $('#operationmenu option:selected').text().toLowerCase(); //"max";
        var aPolygon = convert_PolygonString_To_4326_ForRequest(currentStringPolygon);
        dPolygon = JSON.parse(aPolygon);
        var querystring = "?collectionNameTimeSeries=" + collectionNameTimeSeries + "&dateFromTimeSeries=" + dateFromTimeSeries + "&dateToTimeSeries=" + dateToTimeSeries + "&indexName=" + indexName + "&scale=" + scale + "&reducer=" + reducer + "&polygon=" + JSON.stringify(dPolygon.coordinates[0]);
	//var querystring = "?collectionNameTimeSeries=MODIS/MOD11A1&dateFromTimeSeries="+splitBeginDate[2] + "-" + splitBeginDate[0] + "-" + splitBeginDate[1] +"&dateToTimeSeries="+ splitEndDate[2] + "-" + splitEndDate[0] + "-" + splitEndDate[1]+"&indexName=LST_Day_1km&reducer="+ $('#operationmenu option:selected').text().toLowerCase() +"&polygon="+convert_PolygonString_To_4326_ForRequest(currentStringPolygon);	
	geeGatewayQuery(querystring);
		//geeGatewayAccess(theJson);
    }
    else {


        data =
        {
            'datatype': dataTypeValue,
            'begintime': dateBeginValue,
            'endtime': dateEndValue,
            'intervaltype': dateintervalValue,
            'operationtype': operationValue,
			'callback':'successCallback',
            // New Params
            'dateType_Category': dateType_Category,
            'isZip_CurrentDataType': isZip_CurrentDataType       // This one will mostlikely get renamed when we actually hook up the zipping capabilities
        };

        // KS Refactor Design 2016 Override // Fix for bug where a feature selection wasn't being sent to the server in the new UI Design.
        // if (clickEnabled) {  // Original Line
        if (clickEnabled || (last_GeoSelection_State == "Feature")) {
            data['layerid'] = layerIds[selectedLayer];
            data['featureids'] = selectedFeatures.join()
        } else {
            // KS Refactor Design 2016 Override // The base layer USED to be 4326, but the server still only understands 4326 so we need to convert cords back to it just before making the request)
            data['geometry'] = convert_PolygonString_To_4326_ForRequest(currentStringPolygon); //currentStringPolygon;
        }

        // Tracking requests.
        debugMe_AjaxData.push(data);

        // Need to check up on these and how they are used elsewhere in the code
        parameterType = operationValue;
        intervalType = dateintervalValue;
        operationType = operationValue;
        dataType = dataTypeValue;
        beginTime = dateBeginValue;
        endTime = dateEndValue;
        $("#defineAreaDialog").dialog("close");
        $("#progressbar").progressbar({ value: 0 });
        update_ProgressBar(0); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
        $("#progresslabel").text("Submitting Request...");
        $("#progressdialog").dialog();
        $.ajax({
            url: baserequesturl + 'submitDataRequest/?callback=?',
            type: "post",
            data: data,
            dataType: "jsonp",
            jsonpCallback: 'successCallback',
            async: true,
            beforeSend: function () {

            },
            complete: function () {

            },
            success: function (result) {
                uniqueid = result[0];
                $("#progressbar").progressbar({ value: 0 });
                update_ProgressBar(0); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
                $("#progresslabel").text("Processing..." + 0 + "%");
                $("#requestId").html(get_ProgressBarID_HTML(uniqueid));
                hide_DownloadFileLink();    // Hide the download file link before showing the progress dialog box.
                $("#progressdialog").dialog();


                startTimer(getDataRequestProgress);
				first = true;
            },
            error: function (request, error) {
                console.log("Got an error");
				
            },
            successCallback: function () {

            }
        });
    }

}
var first = true;
$("#chartdialog").dialog();

var encodedurl;
function geeGatewayQuery(query)
{
    var url = "https://servirglobal.net/MapResources/ProxyForm.aspx" + query;
    encodedurl = encodeURI(url);
	$.ajax({
	    url: encodeURI(url),
	    dataType: 'jsonp',
	    jsonp: "callback",
	    contentType: "application/json",
	    success: function (responseData, textStatus, jqXHR) {
	        LSTvalue = responseData;
	        createChart_For_LST(LSTvalue);
	    },
	    error: function (responseData, textStatus, errorThrown) {
	        alert('GET failed.');
	    }
	});
}
var bChart;
function createChart_For_LST(chart_data) {
    var x;
    var y1;
    dataFromRequest = JSON.parse(chart_data).timeseries;
    var output = new Array();
    hashData = {};
    myArray = [];
    var varName = "LST";


    for (var i in dataFromRequest) {
        var outputdate = dataFromRequest[i][0];
        value = dataFromRequest[i][1]
        if (value < -999.00) { value = 0; }
        // Intercept for IMERG Data (Convert IMERG Data from 0.1 mm/day to 1.0 mm/day
        value = (value * .02) - 273.15;

        epochTime = dataFromRequest[i][0];

        if (value >= 0) {
            var index = output.length;
            var tempDate = new Date(outputdate);
            var outputdate = (tempDate.getMonth() + 1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
            var temp = { 'date': outputdate, 'LST': value };
            output.push(temp);
            myArray.push(epochTime);
            hashData[epochTime] = { 'date': (tempDate.getMonth() + 1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear() };
            hashData[epochTime][varName] = value;
        }

    }
    data = output;

    if (data.length === 0) {
        //tell user there is no MODIS Data for that area in that time range, Please change parameters.
        event_Progress_TopRightX_Clicked();
        alert("There is no MODIS Data in selected area for that time range, Please change parameters.");
    }
    else {
        transition_To_ChartUI(); // KS Refactor Design 2016 Override // Show the SubPage for Chart (Chart UI)
        chartUI_Show_ChartDrawing_State();
        global_Chart_FirstDraw = true;      // Important.. charts won't actually draw the data if this is set to false.. also, this is used in making sure chart does not redraw ALL data unless it absolutely needs to.
        var svg = dimple.newSvg("#chartWindow", "100%", "100%");
        var myChart = new dimple.chart(svg, data);
        bChart = myChart;
        myChart.setMargins("60px", "60px", "30px", "170px");
        //myChart.defaultColors = [new dimple.color("#8fd4bd")];
        var currentChartTitle = "MODIS LST";
        svg.append("text")
            //.attr("x", chart._xPixels() + chart._widthPixels() / 2)
            .attr("x", "50%")  // KS Refactor Design 2016 Override // Dynamic Centering of Chart Title.
            .attr("y", myChart._yPixels() - 20) //20) //.attr("y", chart._yPixels() - 20)
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-weight", "bold")
            .style("font-size", "1.25rem") // KS Refactor Design 2016 Override // Dynamic, slightly larger, text size of Chart Title.
            .text(currentChartTitle);//("Chart Title goes here!");
        x = myChart.addTimeAxis("x", "date", "%m/%d/%Y", "%m/%d/%Y");
        myx = x;
        y1 = myChart.addMeasureAxis("y", "LST", " �C");
        y1.title = "deg. C";
        var series = myChart.addSeries(dataType, dimple.plot.line, [x, y1]);
        series.getTooltipText = function (e) {

            return [
                "MODIS LST",
                "date: " + moment(e.x).format("MM/DD/YYYY"),
                "MODIS LST: " + e.y + " deg. C"
            ];
        };
        //series.lineWeight = 2;
        series.lineMarkers = true;
        var mymin = Math.min.apply(Math, data.map(function (o) { return o.LST; })) - 1;
        y1.overrideMin = mymin; //(mymin < 0) ? 0 : mymin;
        y1.overrideMax = Math.max.apply(Math, data.map(function (o) { return o.LST; })) + 1;
        $("#chartWindow").show();
        myChart.draw();
        y1.titleShape.text("Degrees C");
        if (data.length > 7) {
            $('.tick').each(function (i, obj) {
                if (i % 2 && "text - anchor")
                    $(this).hide();
            });

            $('.tick text').each(function (i, obj) {
                if (i % 2 && $(this).css("text - anchor") == "start")
                    $(this).hide();
                //tickList.push($(this));
            });
        }
        x.shapes.selectAll("text").attr("transform",
               function (d) {
                   return d3.select(this).attr("transform") + " rotate(-45) translate(0,10)";
               });
        fixContentHeight();  // This is important, this fixes the map content div height so the page's vertical rendering happens correctly.
        update_ChartUISubPage_DynamicHeights();

        myChart.draw(0, true);

        $(window).resize(function () {
            try {
                //update_ChartUISubPage_DynamicHeights();
            }
            catch (e) { }
            try {
                myChart.draw(0, true);
            }
            catch (e) { }
        });


        $("#progressdialog").dialog("close");
        window.setTimeout(function () {
            $(window).trigger('resize');
        }, 250);
    }
}
function createChart_For_LST_Types(chart_data) {

    dataFromRequest = JSON.parse(chart_data).timeseries;
    var output = new Array();
    hashData = {};
    myArray = [];
    var varName = "LST";

console.log("i am legend!");
	for (var i in dataFromRequest) {
		
		var outputdate = dataFromRequest[i][0];
		console.log(outputdate);
		value = dataFromRequest[i][1]
		if (value < -999.00) { value = 0; }
		if (value == null) { value = 0; }
		// Intercept for IMERG Data (Convert IMERG Data from 0.1 mm/day to 1.0 mm/day
		value = (value * .02) - 273.15;

		epochTime = dataFromRequest[i][0];
	 
		if (value >= 0) {
			var index = output.length;
			var tempDate = new Date(outputdate);
			var outputdate = (tempDate.getMonth() + 1) + '/' + tempDate.getDate() + '/' + tempDate.getFullYear();
			var temp = { 'date': outputdate, 'LST': value };
			output.push(temp);
			myArray.push(epochTime);
			hashData[epochTime] = { 'date': new Date(outputdate) };
			hashData[epochTime][varName] = value;
		}
	
	}
	data = output;
	transition_To_ChartUI(); 
	chartUI_Show_ChartDrawing_State();
	global_Chart_FirstDraw = true;     
	keys = Object.keys(data[0]);
	var xcord = keys[0];
	var ycord = keys[1];
	var svg = dimple.newSvg("#chartWindow", "100%", "100%");

	var myChart = new dimple.chart(svg, data);
	bChart = myChart;
	myChart.setMargins("30px", "60px", "10px", "170px");
	myChart.defaultColors = [new dimple.color("#8fd4bd")];

    //console.log("createChart: " + Date() + " (Chart created, about to add axis and title  ) " );

    // Add a title to this chart
        var currentChartTitle = getSelectedOption_Text("typemenu"); //$("#typemenu").val();
        svg.append("text")
            //.attr("x", chart._xPixels() + chart._widthPixels() / 2)
            .attr("x", "50%")  // KS Refactor Design 2016 Override // Dynamic Centering of Chart Title.
            .attr("y", myChart._yPixels() - 20) //20) //.attr("y", chart._yPixels() - 20)
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-weight", "bold")
            .style("font-size", "1.25rem") // KS Refactor Design 2016 Override // Dynamic, slightly larger, text size of Chart Title.
            .text(currentChartTitle);//("Chart Title goes here!");
        

        var x = myChart.addCategoryAxis("x", xcord);
        x.addOrderRule(xcord);
       // x.dateParseFormat = "%d/%m/%Y";
        x.showGridlines = false;
     
      //  myChart.setMargins(100, 100, 100, 100);

        var y = myChart.addMeasureAxis("y", ycord);
        y.showGridlines = true;
       
        y.overrideMin = Math.min.apply(Math, data.map(function (o) { return o.LST; })) - 1;
        y.overrideMax = Math.max.apply(Math, data.map(function (o) { return o.LST; })) + 1;
        myx = x;
        var s = myChart.addSeries(null, dimple.plot.line);
        s.lineWeight = 2;
        s.lineMarkers = true;
        //s.afterDraw= function (shape, data) {
        //    // Get the shape as a d3 selection
        //    $(window).trigger('resize');
    //    };
    //
        $("#chartWindow").show();
        
            myChart.draw();
            x.shapes.selectAll("text").attr("transform",
            function (d) {
                return d3.select(this).attr("transform") + " rotate(-45)";
            });
            fixContentHeight();  // This is important, this fixes the map content div height so the page's vertical rendering happens correctly.
            update_ChartUISubPage_DynamicHeights();

            myChart.draw(0, true);
            
            $(window).resize(function () {
                try {
                    //update_ChartUISubPage_DynamicHeights();
                }
                catch (e) { }
                try {
                    myChart.draw(0, true);
                }
                catch (e) { }
            });


            $("#progressdialog").dialog("close");
            window.setTimeout(function () {
                $(window).trigger('resize');
            }, 250);
       
}

var rtime;
var timeout = false;
var delta = 200;
$(window).resize(function () {
    rtime = new Date();
    if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if (new Date() - rtime < delta) {
        setTimeout(resizeend, delta);
    } else {
        timeout = false;
        if (myx)
            {
        myx.shapes.selectAll("text").attr("transform",
           function (d) {
               return d3.select(this).attr("transform") + " rotate(-45)";
           });
        }
    }
}
var myx;
var debugMe_AjaxData = [];


//set the uniqueid
function setUniqueId(id) {
    uniqueid=id;
}


// Query the server to check the progress of Data Request that has been submitted.
// // Checking Progress on a loop

// Checking Progress on a loop - MonthlyRainfallAnalysis Types
function getDataRequestProgress_ForMonthlyAnalysisTypes()
{

    datain = {'id':uniqueid};

    $.ajax(
    {
        url: baserequesturl+'getDataRequestProgress/?callback=?',
        type: "get",
        data: datain,
        dataType: "jsonp",
        jsonpCallback: 'successCallback',
        async: true,
        beforeSend: function()
        {

        },
        complete: function()
        {

        },
        success: function (result)
        {

            progressForId = result[0];
            if (progressForId === -1)
            {
                //TODO need to pop error dialog
                $("#progresslabel").text("There was an error processing your request...");
                $("#progressdialog").dialog();
                stopTimer();
            }
            else if (progressForId === -2)
            {
                //Ignore this means there was some problem reading the data.
            }
            else if (progressForId === 100)
            {
                stopTimer();
                $("#progressbar").progressbar({value:100});
                update_ProgressBar(100); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
                $("#progresslabel").text("Downloading...");

                // KS Refactor 2015 // This is where I need to intercept the 'download' operation type on the client side..
                // This line for all operation types that are not download... (maybe)..
                getDataFromRequest_ForMonthlyAnalysisTypes(uniqueid);
            }
            else
            {
                $("#progressbar").progressbar({value:progressForId});
                update_ProgressBar(progressForId); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
                $("#progresslabel").text("Processing..."+progressForId.toFixed(0)+"%");
                $("#progressdialog").dialog();
            }
        },
        error: function (request,error)
        {
            stopTimer();
            $("#progresslabel").text("There has been an error in submitting your request please try again later");
            $("#progressdialog").dialog();
        },
        successCallback:function()
        {

        }
    });
}


//Query the server to check the progress of Data Request that has been submitted.
// Checking Progress on a loop - Normal Flat Request Types
//Query the server to check the progress of Data Request that has been submitted.
function getDataRequestProgress() {
     datain = {'id':uniqueid};
     $.ajax({url: baserequesturl+'getDataRequestProgress/?callback=?',
    type: "get",       
    data: datain,
    dataType: "jsonp",
    jsonpCallback: 'successCallback',
    async: true,
    beforeSend: function() {

    },
    complete: function() {

    },
    success: function (result) {
        
       progressForId = result[0];
       if (progressForId === -1) {
           //TODO need to pop error dialog
		   if(first == true)
			{
				stopTimer();
				submitDataRequest();
				first = false;
			}
			else{
				$("#progresslabel").text("There was an error processing your request...");
				$("#progressdialog").dialog();
				stopTimer();
			}
       } else if (progressForId === -2) {
           //Ignore this means there was some problem reading the data.
       } else if (progressForId === 100)
       {
           
           
           stopTimer();
           $("#progressbar").progressbar({value:100});
           update_ProgressBar(100); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
           $("#progresslabel").text("Downloading...");
           
           // KS Refactor 2015 // This is where I need to intercept the 'download' operation type on the client side..
           // This line for all operation types that are not download... (maybe)..
           getDataFromRequest(uniqueid);
       } else {
           $("#progressbar").progressbar({value:progressForId});
           update_ProgressBar(progressForId); // KS Refactor Design 2016 Override // For every '#progressbar' reference, add this functionCall 'update_ProgressBar(value)'
           $("#progresslabel").text("Processing..."+progressForId.toFixed(0)+"%");
           $("#progressdialog").dialog();
       }
    },
    error: function (request,error) {
       stopTimer();
       $("#progresslabel").text("There has been an error in submitting your request please try again later");
       $("#progressdialog").dialog();
    }, 
    successCallback:function(){
        
    }
});
}

//Get the data from the submitted request and process it.   - For Monthly Analysis Types
function getDataFromRequest_ForMonthlyAnalysisTypes()
{
    data = {'id':uniqueid}
    $.ajax(
    {
        url: baserequesturl+'getDataFromRequest/?callback=?',
        type: "get",
        data: data,
        dataType: "jsonp",
        jsonpCallback: 'successCallback',
        async: true,
        beforeSend: function()
        {

        },
        complete: function()
        {

            //console.log("getDataFromRequest: " + Date() + " (Ajax.complete called) " );

        },
        success: function (result)
        {
            //console.log("getDataFromRequest_ForMonthlyAnalysisTypes: " + Date() + " (Ajax.success: Started) " );

            if ($("#progressdialog").is(':data(dialog)'))
            {
                $("#progressdialog").dialog("close");
            }

            //console.log("getDataFromRequest_ForMonthlyAnalysisTypes: " + Date() + " (Ajax.success: About to call: processIncomingData(result) (on 0.1 second delay, so we can update the label first. ) " );

            $("#progresslabel").text("Creating Chart...");


            // // KS Design 2016 Optimization // The label will not update unless this next function is called Asynchronously which is why it is now in a setTimeout.
            // // processIncomingData(result);

            // alert("Uncomment this next line when ready.  For now, check the console output.");
	     //var fixedResult = result.replace('"col02_MonthlyAverage": "-', '"col02_MonthlyAverage": "');
            setTimeout(function(){ processIncomingData_ForMonthlyAnalysisTypes(result); }, 100);


            //console.log("getDataFromRequest_ForMonthlyAnalysisTypes: " + Date() + " (Ajax.success: processIncomingData(result) will be called very soon... ) " );
        },
        error: function (request,error) {

        },
        successCallback:function(){

        }
    });
    //console.log("getDataFromRequest_ForMonthlyAnalysisTypes: " + Date() + " (Just Used Ajax) " );
}
//Get the data from the submitted request and process it.
function getDataFromRequest() {
    data = {'id':uniqueid}
    //console.log("getDataFromRequest: " + Date() + " (About To Use Ajax) " );
    $.ajax(
    {
        url: baserequesturl+'getDataFromRequest/?callback=?',
        type: "get",       
        data: data,
        dataType: "jsonp",
        jsonpCallback: 'successCallback',
        async: true,
        beforeSend: function() {

        },
        complete: function() {
            
            //console.log("getDataFromRequest: " + Date() + " (Ajax.complete called) " );  
            
        },
        success: function (result) 
        {
            //console.log("getDataFromRequest: " + Date() + " (Ajax.success: Started) " );
            
            if ($("#progressdialog").is(':data(dialog)')) 
            {
              $("#progressdialog").dialog("close");
            }
            
            //console.log("getDataFromRequest: " + Date() + " (Ajax.success: About to call: processIncomingData(result) (on 0.1 second delay, so we can update the label first. ) " );
            
            $("#progresslabel").text("Creating Chart...");
            
            // KS Design 2016 Optimization // The label will not update unless this next function is called Asynchronously which is why it is now in a setTimeout.
            //processIncomingData(result); 
            setTimeout(function(){ processIncomingData(result); }, 100);
            
            
            //console.log("getDataFromRequest: " + Date() + " (Ajax.success: processIncomingData(result) will be called very soon... ) " );
        },
        error: function (request,error) {

        }, 
        successCallback:function(){

        }
    });
    //console.log("getDataFromRequest: " + Date() + " (Just Used Ajax) " );
}

//Cancel a request that has been submitted to the server.
function cancelRequest() {
    //TODO need to enable method to be able to cancel a request
}

function togglePauseRequest() {
    //TODO need to be able to pause request checking
    
}


// Generate HTML that links the user to their file download.
function get_DownloadFile_HTML_ForJobID(theID)
{
    var theHref = baserequesturl+'getFileForJobID/?id=' + theID;
    
    var retHTML = "";
    retHTML += "<a href='";
    retHTML += theHref;
    retHTML += "' target='_blank'>";
    retHTML += "Click Here to Download File";
    retHTML += "</a>";
    
    return retHTML;
}
// File Download Section (written for climate datasets but should work for any)
function show_DownloadFileLink(theID)
{
    // Get the HTML from the Unique ID
    var downloadFile_HTML = get_DownloadFile_HTML_ForJobID(theID);
    // downloadFileURL

    var addedSpaceHTML = "<br />" + downloadFile_HTML;
    $("#downloadFileURL").html(addedSpaceHTML);
}
function hide_DownloadFileLink()
{
    $("#downloadFileURL").html("");
}

// Start the zip file download (if it exists)
// Some kind of token issues when wrapped in jsonp
// Some kind of cross domain issues when not wrapped in jsonp
function get_DownloadFile_ForJobID(theID)
{
    data = {'id':theID};
    $.ajax(
    {
        //url: baserequesturl+'getFileForJobID/?callback=',
        url: baserequesturl+'getFileForJobID/?callback=?',
        type: "get",       
        data: data,
        //dataType:"json",
        dataType: "jsonp",
        jsonpCallback: 'successCallback',
        async: true,
        beforeSend: function() 
        {

        },
        complete: function() 
        {

        },
        success: function (result) 
        {
            //alert(result);
        },
        error: function (request,error) 
        {

        }, 
        successCallback:function()
        {
        
        }
    });
}


// MONTHLY ANALYSIS SUPPORT METHODS         START

// These two are set by the monthly analysis 'submit data request'
// var monthlyRainfallAnalysis_Start_Date = "";  // expected format is:
// var monthlyRainfallAnalysis_End_Date = "";

function get_Year_From_YYYY_MM_DD_String(YYYY_MM_DD_String)
{
    //str.split("_");
    var yearPart = (YYYY_MM_DD_String.split("_")[0] * 1);
    var monthPart = (YYYY_MM_DD_String.split("_")[1] * 1);
    var dayPart = (YYYY_MM_DD_String.split("_")[2] * 1);
    //var retDate = new Date(yearPart, monthPart - 1, dayPart);
    //return retDate;
    return yearPart;
}

function get_Month_From_YYYY_MM_DD_String(YYYY_MM_DD_String)
{
    //str.split("_");
    var yearPart = (YYYY_MM_DD_String.split("_")[0] * 1);
    var monthPart = (YYYY_MM_DD_String.split("_")[1] * 1);
    var dayPart = (YYYY_MM_DD_String.split("_")[2] * 1);
    //var retDate = new Date(yearPart, monthPart - 1, dayPart);
    //return retDate;
    return monthPart;
}

// monthNumberString is a value between "1" and "12"  ("1" == Jan)
function get_category_month_name_for_monthNumberString(monthNumberString)
{
    if(monthNumberString == "1") { return "Jan"; }
    if(monthNumberString == "2") { return "Feb"; }
    if(monthNumberString == "3") { return "Mar"; }
    if(monthNumberString == "4") { return "Apr"; }
    if(monthNumberString == "5") { return "May"; }
    if(monthNumberString == "6") { return "June"; }
    if(monthNumberString == "7") { return "July"; }
    if(monthNumberString == "8") { return "Aug"; }
    if(monthNumberString == "9") { return "Sept"; }
    if(monthNumberString == "10") { return "Oct"; }
    if(monthNumberString == "11") { return "Nov"; }
    if(monthNumberString == "12") { return "Dec"; }
    return "unknown";
}

// Gets the list of Index items that contain Seasonal_Forecast data
function monthlyRainfall_Analysis__Get_SeasonalForecast_IndexList(raw_data_obj)
{
    var ret_index_list = [];
    for(var i = 0; i < raw_data_obj.MonthlyAnalysisOutput.dataset_info_list.length; i++)
    {
        var current_DatasetItem = raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[i];
        if(current_DatasetItem.out_subTypeName == "SEASONAL_FORECAST")
        {
            ret_index_list.push(i);
        }
    }
    return ret_index_list;
}
// Gets the index which contains CHIRPS data
function monthlyRainfall_Analysis__Get_Chirps_Index(raw_data_obj)
{
    for(var i = 0; i < raw_data_obj.MonthlyAnalysisOutput.dataset_info_list.length; i++)
    {
        var current_DatasetItem = raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[i];
        if(current_DatasetItem.out_subTypeName == "CHIRPS_REQUEST")
        {
            return i;
        }
    }
    return -1;
}


// If there is ever an issue with mis-matching monthStrings and actual month values used,
// // the way to fix this is to also pass in the dataset index, and then iterate through that, then find the correct month index by checking the column which has the month number in it.
// This may be caused by a sort order issue.. at this time there is no reason to believe the sorting would ever be off... (since the server always returns 12 months worth of data)
function get_MonthIndex_from_MonthString(monthString, raw_data_obj)
{
    // If there is trouble with this first section (I.E getting the wrong data, we may need to match month numbers)
    // Convert monthString to month_index
    // monthString is a string (that is a number) from "1" to "12", ("1" is Jan, "2" is Feb, etc)
    // month_index is a number from 0-11  (0 is Jan, 1 is Feb, etc)
    var month_index = (monthString * 1) - 1;   // Converts a "3", which is march to the number 2, which is the index inside the dataset object for the month of march data.
    return month_index;
}

// Compute a monthly average of all seasonal forecast datasets for any given month.
// Usage Examples
// monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, "1"); // Seasonal Forecase Ensemebles average of averages for JAN
// monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, "2"); // Seasonal Forecase Ensemebles average of averages for FEB
// monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, "5"); // Seasonal Forecase Ensemebles average of averages for MAY
function monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, monthString)
{

braw.push(raw_data_obj);

    // If there is trouble with this first section (I.E getting the wrong data, we may need to match month numbers)
    // Convert monthString to month_index
    // monthString is a string (that is a number) from "1" to "12", ("1" is Jan, "2" is Feb, etc)
    // month_index is a number from 0-11  (0 is Jan, 1 is Feb, etc)
    //var month_index = (monthString * 1) - 1;   // Converts a "3", which is march to the number 2, which is the index inside the dataset object for the month of march data.
    var month_index = get_MonthIndex_from_MonthString(monthString, raw_data_obj);

    // Get the full list of averages for all ensembles for a given month
    var indexList_for_SeasonalForecast_Datasets = monthlyRainfall_Analysis__Get_SeasonalForecast_IndexList(raw_data_obj);
    var singleMonth_SeasonalForecast_List_Of_Averages = [];  // List of all the averages for March (for example) for ALL ensembles.
    for(var i = 0; i < indexList_for_SeasonalForecast_Datasets.length; i++)
    {
        var current_dataset_index = indexList_for_SeasonalForecast_Datasets[i];
        var theAverage = raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[current_dataset_index].avg_percentiles_dataLines[month_index].col02_MonthlyAverage == "nan"? 0: raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[current_dataset_index].avg_percentiles_dataLines[month_index].col02_MonthlyAverage;
        var col02_MonthlyAverage = theAverage * 1;
        singleMonth_SeasonalForecast_List_Of_Averages.push(col02_MonthlyAverage);
        // raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[0].avg_percentiles_dataLines[2] // March
        //avg_percentiles_dataLines
    }
    monthlies.push(singleMonth_SeasonalForecast_List_Of_Averages);
    // Compute the average of all the averages.
    var sum_of_averages = 0;
    var itemCount = 0;
    for(var j = 0; j < singleMonth_SeasonalForecast_List_Of_Averages.length; j++)
    {
        sum_of_averages = sum_of_averages + singleMonth_SeasonalForecast_List_Of_Averages[j];
        itemCount = itemCount + 1;
    }

    // don't divide by 0!
    if(itemCount < 1){itemCount = 1 }
    var finalAverage = (sum_of_averages / itemCount);

    return finalAverage;

}
var monthlies = [];
var braw = [];

// Gets the LongTermAverage value from the CHIRPS dataset for any given month.
// monthlyRainfall_Analysis__Get_Chirps_LongTermAverage_ForMonth(raw_data_obj, "5");  // MAY, ChirpsDataset - Col02_MonthlyAvg
function monthlyRainfall_Analysis__Get_Chirps_LongTermAverage_ForMonth(raw_data_obj, monthString)
{
    var month_index = get_MonthIndex_from_MonthString(monthString, raw_data_obj);
    var chirps_dataset_index = monthlyRainfall_Analysis__Get_Chirps_Index(raw_data_obj);
    var col02_MonthlyAverage = raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[chirps_dataset_index].avg_percentiles_dataLines[month_index].col02_MonthlyAverage * 1;
    return col02_MonthlyAverage;
}

// Gets the LongTermAverage value from the CHIRPS dataset for any given month.
// monthlyRainfall_Analysis__Get_Chirps_25thPercentile_ForMonth(raw_data_obj, "5");  // MAY, ChirpsDataset - Col03_25thPercentile
function monthlyRainfall_Analysis__Get_Chirps_25thPercentile_ForMonth(raw_data_obj, monthString)
{
    var month_index = get_MonthIndex_from_MonthString(monthString, raw_data_obj);
    var chirps_dataset_index = monthlyRainfall_Analysis__Get_Chirps_Index(raw_data_obj);
    var col03_25thPercentile = raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[chirps_dataset_index].avg_percentiles_dataLines[month_index].col03_25thPercentile * 1;
    return col03_25thPercentile;
}

// Gets the LongTermAverage value from the CHIRPS dataset for any given month.
// monthlyRainfall_Analysis__Get_Chirps_75thPercentile_ForMonth(raw_data_obj, "5");  // MAY, ChirpsDataset - Col04_75thPercentile
function monthlyRainfall_Analysis__Get_Chirps_75thPercentile_ForMonth(raw_data_obj, monthString)
{
    var month_index = get_MonthIndex_from_MonthString(monthString, raw_data_obj);
    var chirps_dataset_index = monthlyRainfall_Analysis__Get_Chirps_Index(raw_data_obj);
    var col04_75thPercentile = raw_data_obj.MonthlyAnalysisOutput.dataset_info_list[chirps_dataset_index].avg_percentiles_dataLines[month_index].col04_75thPercentile * 1;
    return col04_75thPercentile;
}

// Build the data object that is ready to be graphed for MonthlyRainfallAnalysis
function build_MonthlyRainFall_Analysis_Graphable_Object(raw_data_obj)
{

    var ret_dataLines_List = [];


    // Definitions of Data
    // LongTermAverage  (CHIRPS, 50th percentile for each month)

    // Need a controlling mechanism (so we know which Months to use)
    // Setup the Values to submit to the server.
    var seasonal_start_month = "1";  // "1" is Jan
    var seasonal_end_month = "12";   // "12" is Dec
    var monthlyRainfall_Start_Year = 2012;   // Only need this for the x axis on the chart.
    var is_range_in_same_year = true; // Has an affect on how the data is looked up.
    try
    {
        var single_climate_model_capabiliites = JSON.parse(climateModelInfo.climate_DataTypeCapabilities[0].current_Capabilities);
        var seasonal_start_date = single_climate_model_capabiliites.startDateTime; //"2017_05_01";
        var seasonal_end_date = single_climate_model_capabiliites.endDateTime; //"2017_10_28";

        var year_start = get_Year_From_YYYY_MM_DD_String(seasonal_start_date);
        var year_end = get_Year_From_YYYY_MM_DD_String(seasonal_end_date);
        if(year_start == year_end){ is_range_in_same_year = true; } else { is_range_in_same_year = false; }
        monthlyRainfall_Start_Year = year_start;

        seasonal_start_month = get_Month_From_YYYY_MM_DD_String(seasonal_start_date);
        seasonal_end_month = get_Month_From_YYYY_MM_DD_String(seasonal_end_date);

        // // Test for months within the same here
        // console.log("Try 9");
        // seasonal_start_month = 4 + "";
        // console.log("Try 10");
        // seasonal_end_month = 7 + "";
        // console.log("Try 11");

        // // Test for months within different years
        // console.log("Try 9");
        // seasonal_start_month = 5 + "";
        // console.log("Try 10");
        // seasonal_end_month = 3 + "";
        // console.log("Try 11");
        // is_range_in_same_year = false;

    }
    catch(err_Getting_Dates_From_Climate_Model_Capabilities)
    {
        //console.log("Exception hit");

        seasonal_start_month = "1";  // "1" is Jan
        seasonal_end_month = "12";   // "12" is Dec
    }

    // Note, it is possible that the months span over multiple years.

    // Convert Years to numbers
    seasonal_start_month_num = seasonal_start_month * 1;
    seasonal_end_month_num = seasonal_end_month * 1;

    // Need to build the list of months to use in the for loop (months in order so nov, dec, (year 2) jan, feb,.. etc)
    var month_string_list = [];  // looks like this ["2", "3", "4", etc]  or [ "11", "12", "1", "2", etc]  when done.
    var current_month_num = seasonal_start_month_num;
    var current_year_num = monthlyRainfall_Start_Year;

    // Creating a new way to tell what number is next?


    // Always the same year
    // TODO! Code Improvement // The better way to refactor this to remove all the duplicate code is to make a list of objects (kind of like the 'month_string_list' thing above) and use that as the iterator.
    // Also that object should contain definitions for what to pass into the labels....
    for(var aMonth = 1; aMonth<13; aMonth++)
    {
        if(is_range_in_same_year == true)
        {
            // Always the same year
            // if(current_month_num <= seasonal_end_month_num)  // Just does all 12 months for my example dataset
            //if( (current_month_num <= seasonal_end_month_num) && (aMonth >= current_month_num) )
            if(current_month_num <= seasonal_end_month_num)
            {

                // Process this month, convert back to a string
                var current_Month_String = current_month_num + "";
                var currentMonth_CurrentSeasonalForecast_Average_Value = monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, current_Month_String);
                var currentMonth_CurrentCHIRPS_LongTermAverage_Value   = monthlyRainfall_Analysis__Get_Chirps_LongTermAverage_ForMonth(raw_data_obj, current_Month_String);
                var currentMonth_CurrentCHIRPS_25thPercentile_Value    = monthlyRainfall_Analysis__Get_Chirps_25thPercentile_ForMonth(raw_data_obj, current_Month_String);
                var currentMonth_CurrentCHIRPS_75thPercentile_Value    = monthlyRainfall_Analysis__Get_Chirps_75thPercentile_ForMonth(raw_data_obj, current_Month_String);

                var current_Month_Name = get_category_month_name_for_monthNumberString(current_Month_String);
                var current_Year_as_String = current_year_num + ""; //monthlyRainfall_Start_Year + "";
                var current_Month_Year_Value = current_Month_Name + "-" + current_Year_as_String;   // (Expecting "May" + "-" + 2017)  (to turn into "May-2017")

                // CREATE THE OBJECTS (DATA LINES)
                //
                // Would normally create like this,     some_object = { prop_name:value, prop2_name:value_2 } but I don't know if the dimple chart can handle that type.
                //
                // SEASONAL FORECAST - Only one type of these - SeasonalFcstAvg
                var data_line_object__SeasonalFcstAvg = [];
                data_line_object__SeasonalFcstAvg['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__SeasonalFcstAvg['data_series_type'] = "SeasonalFcstAvg";
                data_line_object__SeasonalFcstAvg['Monthly_Rainfall_mm'] = currentMonth_CurrentSeasonalForecast_Average_Value; //30.510046690142;

                // CHIRPS - LongTermAverage - Only one type of these - SeasonalFcstAvg
                var data_line_object__Chirps_LongTermAverage = [];
                data_line_object__Chirps_LongTermAverage['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__Chirps_LongTermAverage['data_series_type'] = "LongTermAverage";
                data_line_object__Chirps_LongTermAverage['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_LongTermAverage_Value; // 22.222046690142;

                // CHIRPS - 25thPercentile - Only one type of these - SeasonalFcstAvg
                var data_line_object__Chirps_25thPercentile = [];
                data_line_object__Chirps_25thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__Chirps_25thPercentile['data_series_type'] = "25thPercentile";
                data_line_object__Chirps_25thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_25thPercentile_Value; // 11.111046690142;

                // CHIRPS - 75thPercentile - Only one type of these - SeasonalFcstAvg
                var data_line_object__Chirps_75thPercentile = [];
                data_line_object__Chirps_75thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__Chirps_75thPercentile['data_series_type'] = "75thPercentile";
                data_line_object__Chirps_75thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_75thPercentile_Value; // 33.333046690142;


                ret_dataLines_List.push(data_line_object__SeasonalFcstAvg);
                ret_dataLines_List.push(data_line_object__Chirps_LongTermAverage);
                ret_dataLines_List.push(data_line_object__Chirps_25thPercentile);
                ret_dataLines_List.push(data_line_object__Chirps_75thPercentile);

                //alert("Was working with 'monthlyRainfall_Start_Year' ");

                // Increment the month.
                current_month_num = current_month_num + 1;
            }
        }
        else
        {
            // Not always the same year..
            if(current_year_num == monthlyRainfall_Start_Year)
            {
                // We are still within the first year.

                // Process this month, convert back to a string
                var current_Month_String = current_month_num + "";
                var currentMonth_CurrentSeasonalForecast_Average_Value = monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, current_Month_String);
                var currentMonth_CurrentCHIRPS_LongTermAverage_Value   = monthlyRainfall_Analysis__Get_Chirps_LongTermAverage_ForMonth(raw_data_obj, current_Month_String);
                var currentMonth_CurrentCHIRPS_25thPercentile_Value    = monthlyRainfall_Analysis__Get_Chirps_25thPercentile_ForMonth(raw_data_obj, current_Month_String);
                var currentMonth_CurrentCHIRPS_75thPercentile_Value    = monthlyRainfall_Analysis__Get_Chirps_75thPercentile_ForMonth(raw_data_obj, current_Month_String);

                var current_Month_Name = get_category_month_name_for_monthNumberString(current_Month_String);
                var current_Year_as_String = current_year_num + ""; //monthlyRainfall_Start_Year + "";
                var current_Month_Year_Value = current_Month_Name + "-" + current_Year_as_String;   // (Expecting "May" + "-" + 2017)  (to turn into "May-2017")

                // CREATE THE OBJECTS (DATA LINES)
                //
                // Would normally create like this,     some_object = { prop_name:value, prop2_name:value_2 } but I don't know if the dimple chart can handle that type.
                //
                // SEASONAL FORECAST - Only one type of these - SeasonalFcstAvg
                var data_line_object__SeasonalFcstAvg = [];
                data_line_object__SeasonalFcstAvg['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__SeasonalFcstAvg['data_series_type'] = "SeasonalFcstAvg";
                data_line_object__SeasonalFcstAvg['Monthly_Rainfall_mm'] = currentMonth_CurrentSeasonalForecast_Average_Value; //30.510046690142;

                // CHIRPS - LongTermAverage - Only one type of these - SeasonalFcstAvg
                var data_line_object__Chirps_LongTermAverage = [];
                data_line_object__Chirps_LongTermAverage['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__Chirps_LongTermAverage['data_series_type'] = "LongTermAverage";
                data_line_object__Chirps_LongTermAverage['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_LongTermAverage_Value; // 22.222046690142;

                // CHIRPS - 25thPercentile - Only one type of these - SeasonalFcstAvg
                var data_line_object__Chirps_25thPercentile = [];
                data_line_object__Chirps_25thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__Chirps_25thPercentile['data_series_type'] = "25thPercentile";
                data_line_object__Chirps_25thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_25thPercentile_Value; // 11.111046690142;

                // CHIRPS - 75thPercentile - Only one type of these - SeasonalFcstAvg
                var data_line_object__Chirps_75thPercentile = [];
                data_line_object__Chirps_75thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                data_line_object__Chirps_75thPercentile['data_series_type'] = "75thPercentile";
                data_line_object__Chirps_75thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_75thPercentile_Value; // 33.333046690142;


                ret_dataLines_List.push(data_line_object__SeasonalFcstAvg);
                ret_dataLines_List.push(data_line_object__Chirps_LongTermAverage);
                ret_dataLines_List.push(data_line_object__Chirps_25thPercentile);
                ret_dataLines_List.push(data_line_object__Chirps_75thPercentile);


                // Increment things
                current_month_num = current_month_num + 1;
                // Check for year change
                if (current_month_num > 12)
                {
                    // Time to change the year.
                    current_month_num = 1; // Forcing set to Jan
                    current_year_num = current_year_num + 1; // Increasing the year.
                }
            }
            else
            {
                // We are now in the second year. (Need to make sure we don't do months we don't need or want in the result data...)
                if(current_month_num <= seasonal_end_month_num)
                {

                    // Process this month, convert back to a string
                    var current_Month_String = current_month_num + "";
                    var currentMonth_CurrentSeasonalForecast_Average_Value = monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, current_Month_String);
                    var currentMonth_CurrentCHIRPS_LongTermAverage_Value   = monthlyRainfall_Analysis__Get_Chirps_LongTermAverage_ForMonth(raw_data_obj, current_Month_String);
                    var currentMonth_CurrentCHIRPS_25thPercentile_Value    = monthlyRainfall_Analysis__Get_Chirps_25thPercentile_ForMonth(raw_data_obj, current_Month_String);
                    var currentMonth_CurrentCHIRPS_75thPercentile_Value    = monthlyRainfall_Analysis__Get_Chirps_75thPercentile_ForMonth(raw_data_obj, current_Month_String);

                    var current_Month_Name = get_category_month_name_for_monthNumberString(current_Month_String);
                    var current_Year_as_String = current_year_num + ""; //monthlyRainfall_Start_Year + "";
                    var current_Month_Year_Value = current_Month_Name + "-" + current_Year_as_String;   // (Expecting "May" + "-" + 2017)  (to turn into "May-2017")

                    // CREATE THE OBJECTS (DATA LINES)
                    //
                    // Would normally create like this,     some_object = { prop_name:value, prop2_name:value_2 } but I don't know if the dimple chart can handle that type.
                    //
                    // SEASONAL FORECAST - Only one type of these - SeasonalFcstAvg
                    var data_line_object__SeasonalFcstAvg = [];
                    data_line_object__SeasonalFcstAvg['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                    data_line_object__SeasonalFcstAvg['data_series_type'] = "SeasonalFcstAvg";
                    data_line_object__SeasonalFcstAvg['Monthly_Rainfall_mm'] = currentMonth_CurrentSeasonalForecast_Average_Value; //30.510046690142;

                    // CHIRPS - LongTermAverage - Only one type of these - SeasonalFcstAvg
                    var data_line_object__Chirps_LongTermAverage = [];
                    data_line_object__Chirps_LongTermAverage['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                    data_line_object__Chirps_LongTermAverage['data_series_type'] = "LongTermAverage";
                    data_line_object__Chirps_LongTermAverage['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_LongTermAverage_Value; // 22.222046690142;

                    // CHIRPS - 25thPercentile - Only one type of these - SeasonalFcstAvg
                    var data_line_object__Chirps_25thPercentile = [];
                    data_line_object__Chirps_25thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                    data_line_object__Chirps_25thPercentile['data_series_type'] = "25thPercentile";
                    data_line_object__Chirps_25thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_25thPercentile_Value; // 11.111046690142;

                    // CHIRPS - 75thPercentile - Only one type of these - SeasonalFcstAvg
                    var data_line_object__Chirps_75thPercentile = [];
                    data_line_object__Chirps_75thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
                    data_line_object__Chirps_75thPercentile['data_series_type'] = "75thPercentile";
                    data_line_object__Chirps_75thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_75thPercentile_Value; // 33.333046690142;


                    ret_dataLines_List.push(data_line_object__SeasonalFcstAvg);
                    ret_dataLines_List.push(data_line_object__Chirps_LongTermAverage);
                    ret_dataLines_List.push(data_line_object__Chirps_25thPercentile);
                    ret_dataLines_List.push(data_line_object__Chirps_75thPercentile);

                    // Increment things
                    current_month_num = current_month_num + 1;

                }
            }
        }
    }

    return ret_dataLines_List;


    // //if(seasonal_start_month_num < seasonal_end_month_num)
    // if(is_range_in_same_year == true)
    // {
    //     // Always the same year
    //     for(var a = 1; a<13; a++)
    //     {
    //         if(current_month_num <= seasonal_end_month_num)
    //         {
    //             // Process this month, convert back to a string
    //             var current_Month_String = current_month_num + "";
    //             var currentMonth_CurrentSeasonalForecast_Average_Value = monthlyRainfall_Analysis__Compute_SeasonalForecast_Average_ForMonth(raw_data_obj, current_Month_String);
    //         }
    //     }
    //
    // }
    // else
    // {
    //     // Not always the same year..
    //     for(var a = 1; a<13; a++)
    //     {
    //         //console.log(a);
    //     }
    // }

    // // Need to build something like this for all months.
    // var TEMP_ITEM_4 = [];
    // TEMP_ITEM_4['date'] = "May-17";
    // TEMP_ITEM_4['data_series_type'] = "SeasonalFcstAvg";
    // TEMP_ITEM_4['Monthly_Rainfall_mm'] = 30.510046690142;
    //
    // alert("I'm working this from both ends:   This is where I'm at on working forwards");
    //
    //
    //
    //
    // alert("I'm working this from both ends:   This is where I'm at on working backwards");
    //
    // // Need to create average of ALL seasonal Forecast ensembles for each month.
    //
    //
    // // Data needs to look something like this when done!
    //
    // // Second Round (more accurate looking)
    // // maybe date sort order is what matters?
    // // This could work // var x = myChart.addCategoryAxis("x", "Month");
    // // Also, 'avg' is now 'Monthly_Rainfall_mm'
    // var TEMP_ITEM_1 = []; TEMP_ITEM_1['date'] = "May-17"; TEMP_ITEM_1['data_series_type'] = "LongTermAverage";  TEMP_ITEM_1['Monthly_Rainfall_mm'] = 52.4362894699;
    // var TEMP_ITEM_2 = []; TEMP_ITEM_2['date'] = "May-17"; TEMP_ITEM_2['data_series_type'] = "25thPercentile";  TEMP_ITEM_2['Monthly_Rainfall_mm'] = 14.1553766424;
    // var TEMP_ITEM_3 = []; TEMP_ITEM_3['date'] = "May-17"; TEMP_ITEM_3['data_series_type'] = "75thPercentile";  TEMP_ITEM_3['Monthly_Rainfall_mm'] = 67.7171217138;
    // var TEMP_ITEM_4 = []; TEMP_ITEM_4['date'] = "May-17"; TEMP_ITEM_4['data_series_type'] = "SeasonalFcstAvg";  TEMP_ITEM_4['Monthly_Rainfall_mm'] = 30.510046690142;
    //
    // var TEMP_ITEM_5 = []; TEMP_ITEM_5['date'] = "June-17"; TEMP_ITEM_5['data_series_type'] = "LongTermAverage";  TEMP_ITEM_5['Monthly_Rainfall_mm'] = 35.3672877146;
    // var TEMP_ITEM_6 = []; TEMP_ITEM_6['date'] = "June-17"; TEMP_ITEM_6['data_series_type'] = "25thPercentile";  TEMP_ITEM_6['Monthly_Rainfall_mm'] = 11.9520834316;
    // var TEMP_ITEM_7 = []; TEMP_ITEM_7['date'] = "June-17"; TEMP_ITEM_7['data_series_type'] = "75thPercentile";  TEMP_ITEM_7['Monthly_Rainfall_mm'] = 49.6841634111;
    // var TEMP_ITEM_8 = []; TEMP_ITEM_8['date'] = "June-17"; TEMP_ITEM_8['data_series_type'] = "SeasonalFcstAvg";  TEMP_ITEM_8['Monthly_Rainfall_mm'] = 36.18654034399;
    //
    // var TEMP_DATA = [ TEMP_ITEM_1, TEMP_ITEM_2, TEMP_ITEM_3, TEMP_ITEM_4, TEMP_ITEM_5, TEMP_ITEM_6, TEMP_ITEM_7, TEMP_ITEM_8 ]; 		// This is going to be my test fixture... get this info from the dimple's site.
    // var chart_data = TEMP_DATA;
    //
    //
    // // First Round Data type
    // // //alert("Remove all this TEMP_ITEM_1 business when done");  // 52.4362894699
    // // var TEMP_ITEM_1 = []; TEMP_ITEM_1['date'] = "1/9/2009"; TEMP_ITEM_1['data_series_type'] = "LongTermAverage";  TEMP_ITEM_1['avg'] = 1;
    // // var TEMP_ITEM_2 = []; TEMP_ITEM_2['date'] = "1/9/2009"; TEMP_ITEM_2['data_series_type'] = "series_2";  TEMP_ITEM_2['avg'] = 3;
    // // var TEMP_ITEM_3 = []; TEMP_ITEM_3['date'] = "1/9/2009"; TEMP_ITEM_3['data_series_type'] = "LongTermAverage";  TEMP_ITEM_3['avg'] = 1;
    // // var TEMP_ITEM_4 = []; TEMP_ITEM_4['date'] = "1/9/2009"; TEMP_ITEM_4['data_series_type'] = "series_2";  TEMP_ITEM_4['avg'] = 3;
    // //
    // // var TEMP_ITEM_3 = []; TEMP_ITEM_3['date'] = "1/10/2009"; TEMP_ITEM_3['data_series_type'] = "series_1";  TEMP_ITEM_3['avg'] = 2;
    // // var TEMP_ITEM_4 = []; TEMP_ITEM_4['date'] = "1/10/2009"; TEMP_ITEM_4['data_series_type'] = "series_2";  TEMP_ITEM_4['avg'] = 9;
    // // var TEMP_ITEM_5 = []; TEMP_ITEM_5['date'] = "1/11/2009"; TEMP_ITEM_5['data_series_type'] = "series_1";  TEMP_ITEM_5['avg'] = 3;
    // // var TEMP_ITEM_6 = []; TEMP_ITEM_6['date'] = "1/11/2009"; TEMP_ITEM_6['data_series_type'] = "series_2";  TEMP_ITEM_6['avg'] = 27;
    // // var TEMP_DATA = [ TEMP_ITEM_1, TEMP_ITEM_2, TEMP_ITEM_3, TEMP_ITEM_4, TEMP_ITEM_5, TEMP_ITEM_6 ]; 		// This is going to be my test fixture... get this info from the dimple's site.
    // // var chart_data = TEMP_DATA;


}

//Process the data from the request and display it in a graph.
//var debug_temp_hc_data;
function processIncomingData_ForMonthlyAnalysisTypes(datain)
{

    var graphable_obj = build_MonthlyRainFall_Analysis_Graphable_Object(datain);

    transition_To_ChartUI();
    chartUI_Show_ChartDrawing_State();
    global_Chart_FirstDraw = true;
    setTimeout(function(){ createChart_For_MonthlyAnalysis_Types(graphable_obj); }, 100); //100);
    $("#progressdialog").dialog("close");


    // Eventually, we need to arrive at this:
    // createChart_For_MonthlyAnalaysis_Types(output);  // or even the existing one createChart(output);

}

//Process the data from the request and display it in a graph.
function processIncomingData(datain) 
{
    dataFromRequest = datain['data'];
    var output = new Array();
    hashData = {};
    myArray = [];
    var varName = parameterTypes[parameterType]['lname'].trim();
    
    // KS Refactor 2015 // This is where I need to intercept the 'download' operation type on the client side..
    // This line for all operation types that are not download... (maybe)..
    if(varName == "download")
    {
        // Check for errors and working datasets in the zip file
        var image_File_SuccessList = [];
        var image_File_ErrorList = [];

        for (var i in dataFromRequest) 
        {
            var outputdate = dataFromRequest[i]['date'];
            value = dataFromRequest[i]['value']; //[varName]; // Datastructure is different here for download jobs..
            epochTime = dataFromRequest[i]['epochTime'];
            output[i] = [];
            output[i]['date'] = outputdate;
            output[i][varName]=value;
            myArray.push(epochTime);
            hashData[epochTime] = {'date':outputdate};
            hashData[epochTime][varName] = value;
            
            // Check for errors and successes
            if(value == 1)
            {
                image_File_SuccessList.push(outputdate);
            }
            else
            {
                image_File_ErrorList.push(outputdate);
            }
        }   
        data = output;
        
        //
        //alert("Download file hook here!!");
        // Download the file..
        // get_DownloadFile_ForJobID(uniqueid);
        show_DownloadFileLink(uniqueid);
        
        // Get a list of the files that did not make it into the zip file.
        //var image_File_SuccessList //= check_Zip_FileResults(output);
        var progressLabelMessage = ""
        if(image_File_SuccessList.length > 0)
        {
            if(image_File_ErrorList.length == 0)
            {
                progressLabelMessage = "File Download Ready";
            }
            else
            {
                progressLabelMessage = "File Download Ready | " + image_File_ErrorList.length + " errors.";
            }
            //if(image_File_ErrorList.length > 0)
            //{
            //    progressLabelMessage += " | " + image_File_ErrorList.length + "errors.";
            //}
        }
        else
        {
            // $("#progresslabel").text("There was an error generating this zip file.  Select a different area and try again.");
            progressLabelMessage = "There was an error generating this zip file.  Select a different area and try again."
            hide_DownloadFileLink();
        }
        $("#progresslabel").text(progressLabelMessage);
        
        // Running this line of code generates a graph, 1's mean file was created, 0's mean they were not.
        // createChart(data);  // run this on the console to see if all files were created.
        //createChart(output);
        
    }
    else
    {
        //$("#progresslabel").text("Creating Chart...");
        
        for (var i in dataFromRequest) 
        {
            var outputdate = dataFromRequest[i]['date'];
            value = dataFromRequest[i]['value'][varName];
            if(value < -999.00) { value = 0; }
            // Intercept for IMERG Data (Convert IMERG Data from 0.1 mm/day to 1.0 mm/day
            if($("#typemenu").val() == "IMERG1Day") { value = (value/10); }
            // if(value < -999.00) { alert(value); }
            epochTime = dataFromRequest[i]['epochTime'];
            if (dataType == "29" || dataType=="33") {
                if (value >= -10 && value<=10) {
                    var index = output.length;
                    output[index] = [];
                    output[index]['date'] = outputdate;
                    output[index][varName] = value;
                    myArray.push(epochTime);
                    hashData[epochTime] = { 'date': outputdate };
                    hashData[epochTime][varName] = value;
                }
            }
            else {
                if (value >= 0) {
                    var index = output.length;
                    output[index] = [];
                    output[index]['date'] = outputdate;
                    output[index][varName] = value;
                    myArray.push(epochTime);
                    hashData[epochTime] = { 'date': outputdate };
                    hashData[epochTime][varName] = value;
                }
            }
        }   
        data = output;
        
        //console.log("processIncomingData: "  + Date() + " (not_download_block: About to call transition_To_ChartUI() (2016 design func)  ) " );
        
        transition_To_ChartUI(); // KS Refactor Design 2016 Override // Show the SubPage for Chart (Chart UI)
        
        //console.log("processIncomingData: "  + Date() + " (not_download_block: About to call createChart(output)  ) " );
        //console.log("processIncomingData: "  + Date() + " (not_download_block: changed createChart(output) to be ASYNC, 100 ms delay  ) " );
        
        // KS Refactor Design 2016 Override // Before Chart Draw, Show UI Indication of Chart drawing status needed for charts with a large number of points to plot.
        // Note: This Line's matching function that closes or hides the loading popup is found near the bottom of 'createChart', after Async code happens.
        chartUI_Show_ChartDrawing_State();
        global_Chart_FirstDraw = true;      // Important.. charts won't actually draw the data if this is set to false.. also, this is used in making sure chart does not redraw ALL data unless it absolutely needs to.
    
        // KS Design 2016 Optimization // The UI will now be displayed BEFORE the chart is drawn (breaking up the UX delays a little bit.)
        //createChart(output);
        setTimeout(function(){ createChart(output); }, 100);
        
        //console.log("processIncomingData: "  + Date() + " (not_download_block: just finished createChart(output) ) " );
        
        $("#progressdialog").dialog("close");
    }
    
}

//Open the editor selection dialog.
function openNewEditorDialog() {
    $( "#defineAreaDialog" ).dialog("close");
    if (initializedDialog === false) {
        createEditorDialog();
        initializedDialog = true;
    } else {
        $("#editordialog").dialog("open");
    }
      
}

function createEditorDialog()
{
    $("#editordialog").dialog(
            {
                open: function(event, ui) 
                {
                    $(this).css({'max-height': 500, 'overflow-y': 'auto'}); 
                    
                    // Show the UI based on whats selected 
                    try
                    {
                        dataType_Option_Value = $("#typemenu option:selected" ).attr("value");
                        select_dataType_Changed(dataType_Option_Value);
                    }
                    catch(err_GettingDataTypeSelection)
                    {
                        show_SubmitDataRequest_UI_Group("SubmitDataRequest_UI_Default");
                    }
                    
                    
                },
                autoOpen:true,
                modal: false,
                resizable: true,
                draggable: true,
                width: '450',//'300',
                closeOnEscape: true,
                position: [20,'center']});
                        
    $( "#submitsearchbutton" )
      .button()
      .click(function( event ) {
        $( "#editordialog" ).dialog("close");
                submitDataRequest();
      });
}

//Close the editor dialog.
function closeNewEditorDialog() {
    $("#editordialog").dialog("close");
}

//Open the polygonDialog so the user can select the polygon of interest.
function openPolygonDialog() {
    $("#polygondialog").dialog();
    $( "#startpolygonbutton" )
      .button()
      .click(function( event ) {
        $( "#polygondialog" ).dialog("close");
      });
}

function clearChart() {
    
}

// Get Y Axis lookup list (TODO, move this to the server params)
function get_Y_Axis_HC_LOOKUP(parameterTypeName, dataTypeValue)
{
    // parameterTypeName possibles while hardcoded
    // max, min, avg, download
    // dataTypeValue possibles while hardcoded
    // CHIRPS Rainfall, eMODIS NDVI, Seasonal_Forecast 
    
    var ret_Axis_Label = "";
    
    // Look up by operation types
    var operationPart = "";
    if(parameterTypeName.toLowerCase() == "max")
    {
        operationPart = "Maximum";
    }
    else if(parameterTypeName.toLowerCase() == "min")
    {
        operationPart = "Minimum";
    }
    else if(parameterTypeName.toLowerCase() == "avg")
    {
        operationPart = "Average";
    }
    else
    {
        // Lookup not found, use the that was passed in as the default.
        operationPart = parameterTypeName;
    }
    
    // Now look up by datatypes
    var datatypePart = "";
    if(dataTypeValue == "CHIRPS Rainfall")
    {
        datatypePart = "_CHIRPS_Rainfall(mm/day)";
    }
    else if(dataTypeValue == "NDVI")
    {
        datatypePart = "_NDVI";
    }
    else if(dataTypeValue == "IMERG 1 Day")
    {
        //datatypePart = "_IMERG_1_Day(0.1 mm/day)";
        datatypePart = "_IMERG_1_Day(1 mm/day)";
    }
    else if(dataTypeValue == "Seasonal_Forecast")
    {
        datatypePart = "_Forecast_";
        
        // Add Ensemble to this Axis
        var currEnsemble = getSelectedOption_Text("select_Ensemble_ClimateModel");
        datatypePart += currEnsemble;
        datatypePart += "_";
        
        // Need additional info to find out which variable name
        var currClimateSelection = getSelectedOption_Text("select_Variable_ClimateModel");
        if(currClimateSelection == "Precipitation")
        {
            datatypePart += "Rainfall(mm/day)";
        }
        else if (currClimateSelection == "Temperature")
        {
            datatypePart += "Temperature(K)";
        }
    }
    else
    {
        // Lookup not found, use nothing as default here.
        datatypePart = "";  
    }
    
    // Now combine the parts and return
    ret_Axis_Label = operationPart + datatypePart;
    return ret_Axis_Label;
}


// KS Refactor Design 2016 Override // Chart is now in a new UI Container.
// Returns { width:width, height:height, margin:{left:left,right:right,top:top,bottom:bottom} }
function get_ChartSize_Info()
{
    // New Chart Resizing (for design 2016)
    var dialogwidth = $("#chartUI_AdjustableMinHeightDiv").outerWidth();
    var dialogheight = $("#chartUI_AdjustableMinHeightDiv").outerHeight();
    var margin = {'left': 3, 'right': 5, 'top': 2, 'bottom': 144};      // Certain amount to account for other UI elements.
    var size_Width = dialogwidth - margin.left - margin.right;
    var size_Height = dialogheight - margin.top - margin.bottom;
    
    var sizeObj = 
    {
        'width':size_Width, 
        'height':size_Height, 
        'margin':margin        
    };
    
    // Usage Case
    //var svg = dimple.newSvg("#chartWindow", width, height);
    
    return sizeObj;
}

function get_current_year() {
    var current_year = new Date().getFullYear();
    return current_year;
}
function get_next_year() {
    var next_year = get_current_year() + 1;
    return next_year;
}
function make_category_axis_sorting_array_for_MonthlyAnalysis_Types() {
    var return_array = [];

    // Current Year Months
    return_array.push("Jan" + "-" + get_current_year());
    return_array.push("Feb" + "-" + get_current_year());
    return_array.push("Mar" + "-" + get_current_year());
    return_array.push("Apr" + "-" + get_current_year());
    return_array.push("May" + "-" + get_current_year());
    return_array.push("June" + "-" + get_current_year());
    return_array.push("July" + "-" + get_current_year());
    return_array.push("Aug" + "-" + get_current_year());
    return_array.push("Sept" + "-" + get_current_year());
    return_array.push("Oct" + "-" + get_current_year());
    return_array.push("Nov" + "-" + get_current_year());
    return_array.push("Dec" + "-" + get_current_year());

    // Next Year's Months
    return_array.push("Jan" + "-" + get_next_year());
    return_array.push("Feb" + "-" + get_next_year());
    return_array.push("Mar" + "-" + get_next_year());
    return_array.push("Apr" + "-" + get_next_year());
    return_array.push("May" + "-" + get_next_year());
    return_array.push("June" + "-" + get_next_year());
    return_array.push("July" + "-" + get_next_year());
    return_array.push("Aug" + "-" + get_next_year());
    return_array.push("Sept" + "-" + get_next_year());
    return_array.push("Oct" + "-" + get_next_year());
    return_array.push("Nov" + "-" + get_next_year());
    return_array.push("Dec" + "-" + get_next_year());

    return return_array;
}



function createChart_For_MonthlyAnalysis_Types(chart_data)
{
    $("#chartWindow").show();
    // Setting the chart data to the global,
    g_ChartData_MonthlyAnalysis = chart_data;

    // Went through line by line
    //alert("Make sure to compare this to the normal chart buildilng flow.. there were some key differences..");


    // alert("Also, don't forget to make sure the actual buttons work as well (export csv is pretty important!");


    // GREAT FOR TESTING A SIMPLE VERSION OF THE CHART DATA (MULTILINE CHART)
    // alert("Remove all this TEMP_ITEM_1 business when done");
    // var TEMP_ITEM_1 = []; TEMP_ITEM_1['date'] = "1/9/2009"; TEMP_ITEM_1['data_series_type'] = "series_1";  TEMP_ITEM_1['avg'] = 1;
    // var TEMP_ITEM_2 = []; TEMP_ITEM_2['date'] = "1/9/2009"; TEMP_ITEM_2['data_series_type'] = "series_2";  TEMP_ITEM_2['avg'] = 3;
    // var TEMP_ITEM_3 = []; TEMP_ITEM_3['date'] = "1/10/2009"; TEMP_ITEM_3['data_series_type'] = "series_1";  TEMP_ITEM_3['avg'] = 2;
    // var TEMP_ITEM_4 = []; TEMP_ITEM_4['date'] = "1/10/2009"; TEMP_ITEM_4['data_series_type'] = "series_2";  TEMP_ITEM_4['avg'] = 9;
    // var TEMP_ITEM_5 = []; TEMP_ITEM_5['date'] = "1/11/2009"; TEMP_ITEM_5['data_series_type'] = "series_1";  TEMP_ITEM_5['avg'] = 3;
    // var TEMP_ITEM_6 = []; TEMP_ITEM_6['date'] = "1/11/2009"; TEMP_ITEM_6['data_series_type'] = "series_2";  TEMP_ITEM_6['avg'] = 27;
    // var TEMP_DATA = [ TEMP_ITEM_1, TEMP_ITEM_2, TEMP_ITEM_3, TEMP_ITEM_4, TEMP_ITEM_5, TEMP_ITEM_6 ]; 		// This is going to be my test fixture... get this info from the dimple's site.
    // var chart_data = TEMP_DATA;


    // HERE IS WHAT CHART DATA LOOKS LIKE
    // var data_line_object__SeasonalFcstAvg = [];
    // data_line_object__SeasonalFcstAvg['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
    // data_line_object__SeasonalFcstAvg['data_series_type'] = "SeasonalFcstAvg";
    // data_line_object__SeasonalFcstAvg['Monthly_Rainfall_mm'] = currentMonth_CurrentSeasonalForecast_Average_Value; //30.510046690142;
    //
    // // CHIRPS - LongTermAverage - Only one type of these - SeasonalFcstAvg
    // var data_line_object__Chirps_LongTermAverage = [];
    // data_line_object__Chirps_LongTermAverage['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
    // data_line_object__Chirps_LongTermAverage['data_series_type'] = "LongTermAverage";
    // data_line_object__Chirps_LongTermAverage['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_LongTermAverage_Value; // 22.222046690142;
    //
    // // CHIRPS - 25thPercentile - Only one type of these - SeasonalFcstAvg
    // var data_line_object__Chirps_25thPercentile = [];
    // data_line_object__Chirps_25thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
    // data_line_object__Chirps_25thPercentile['data_series_type'] = "25thPercentile";
    // data_line_object__Chirps_25thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_25thPercentile_Value; // 11.111046690142;
    //
    // // CHIRPS - 75thPercentile - Only one type of these - SeasonalFcstAvg
    // var data_line_object__Chirps_75thPercentile = [];
    // data_line_object__Chirps_75thPercentile['Month_Year'] = current_Month_Year_Value; // "May-17"; //TEMP_ITEM_4['date'] = "May-17";
    // data_line_object__Chirps_75thPercentile['data_series_type'] = "75thPercentile";
    // data_line_object__Chirps_75thPercentile['Monthly_Rainfall_mm'] = currentMonth_CurrentCHIRPS_75thPercentile_Value; // 33.333046690142;

    // The CSS fix is found in design2016.js (search for "// KS Refactor 2017 - Patch-up fix for styles")
    // alert("FIX STYLE ISSUES WITH LINES:  THIS CSS IS CAUSING PROBLEMS: servir.css: line 86: .dimple-series-0 {fill:#8fd4bd;stroke: #8fd4bd;}");
    // alert("For customizing styles on chart, See 'http://dimplejs.org/advanced_examples_viewer.html?id=advanced_custom_styling' ");



    // Actual stuff that should work.
    var buttons = [];
    count = 0;
    if (clickEnabled == false)
    {
        buttons[count] = {text: "Export Polygon",click: function() {savePolygon();}};
        ++count;
    }
    buttons[count] = {text: "Export to Png",click: function() {savePng(uniqueid);}};
    ++count;
    buttons[count]= {text: "Export to CSV",click: function() { saveCSV_ForMonthlyRainfallAnalysisTypes(uniqueid, chart_data); }};
    ++count;
    buttons[count]= {text: "Close",click: function() { $(this).dialog("close"); }};

    $("#chartdialog").dialog({
        modal:true,
        autoOpen: true,
        show: "blind",
        hide: "explode",
        buttons: buttons,
        resizable: true,
        width:$(window).width()-100,
        height:$(window).height()-100,
        resizeStop: function(event, ui) {resizeChart();}
    });


    var sizeObj = get_ChartSize_Info();
    var svg = dimple.newSvg("#chartWindow", "100%", "25em");
    var chart = new dimple.chart(svg, chart_data);

    //chart.defaultColors = [new dimple.color("grey")];

    // Add a title to this chart
    var currentChartTitle = "Monthly Rainfall Analysis";
    svg.append("text")
        //.attr("x", chart._xPixels() + chart._widthPixels() / 2)
        .attr("x", "80%") //"50%")  // KS Refactor Design 2016 Override // Dynamic Centering of Chart Title.
        .attr("y", chart._yPixels() - 30) // )// - 20) //.attr("y", chart._yPixels() - 20)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "1.25rem") // KS Refactor Design 2016 Override // Dynamic, slightly larger, text size of Chart Title.
        .text(currentChartTitle);


svg.style("padding-top", "35px");
    // These next 3 lines are if the data has descrete date ordering, instead, will use the category type
    // parsing_format =  "%m/%d/%Y";  // parsingFormat[intervalType]
    // interval_format =  "%m/%d/%Y"; // dateformat[intervalType]
    // var x = chart.addTimeAxis("x", "Month_Year", parsing_format, interval_format); // var x = chart.addTimeAxis("x", "date", parsing_format, interval_format);
    var x = chart.addCategoryAxis("x", "Month_Year");  // var x = myChart.addCategoryAxis("x", "Month");
    x.showGridlines = true;
    var month_year_vals = make_category_axis_sorting_array_for_MonthlyAnalysis_Types();
    x.addOrderRule(month_year_vals);


    y_Axis_Label = "Monthly Rainfall (mm)";
    var y = chart.addMeasureAxis("y", "Monthly_Rainfall_mm"); //var y = chart.addMeasureAxis("y", "avg"); //"series_1"); //parameterTypes[parameterType]['uname']);

    chart.axes[0].title = "Month - Year";
    chart.axes[1].title = y_Axis_Label;

    // Not sure if this applies here.. this code works on single datasets
    // to force the bottom number for the y axis to be relative and not just 0.
    /*
    try
    {
        var minMaxObj = get_NewMinMax_Adjust_Y_Axis_For_Thin_Ranges_SingleDataset(data, parameterTypes[parameterType]['uname'], chart);
        if(minMaxObj == null)
        {
            // Do nothing
        }
        else
        {

            //console.log(Math.floor(minMaxObj.min));
            //console.log(Math.ceil(minMaxObj.max));
            var yMin = Math.floor(minMaxObj.min);
            var yMax = Math.ceil(minMaxObj.max);
            //yMax = yMax + ((yMax - yMin) %2);   // Fix for uneven number of grid points
            yMin = yMin - ((yMax - yMin) %2);   // Fix for uneven number of grid points
            //console.log(yMax);
            y.overrideMin = yMin; //Math.floor(minMaxObj.min);
            y.overrideMax = yMax; //Math.ceil(minMaxObj.max);

        }
    }
    catch(err_Overriding_YAxis)
    {
        // Do nothing for now.
    }
    */

    y.tickFormat = ',.2f';
    y.showGridlines = true;

    // This line tells the chart that there are multiple Series in the data, and they are differentiated by the 'data_series_type' property
    chart.addSeries("data_series_type", dimple.plot.line); // chart.addSeries(null, dimple.plot.area);  // DAFUQ?

    // Add the Legend (list of series items)
    //chart.addLegend(60, 10, 500, 20, "left"); // "right");
    chart.addLegend(60, 10, 500, 200, "left"); // "right");

    chart.draw(0, true);

    chartUI_Hide_ChartDrawing_State();

    global_legacy_Chart = chart;
    setTimeout(function(){ update_ChartUISubPage_DynamicHeights(); }, 100);
}

// KS Refactor Design 2016 Override // Need this variable to be global (UI Code uses it in one place)
var y_Axis_Label = "UNSET";
var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
//Create the chart based on the data.
function createChart(data)
{
    if (isFirefox)
        {
        $("#chartWindow").show();
    }
    // This switch actually controlls CSV output
    g_ChartData_MonthlyAnalysis = null;
    
    //console.log("createChart: " + Date() + " (About to Set up Buttons) ");
    
    var buttons = [];
    count = 0;
    if (clickEnabled == false)
    {
        buttons[count] = {text: "Export Polygon",click: function() {savePolygon();}};
        ++count;
    }
    buttons[count] = {text: "Export to Png",click: function() {savePng(uniqueid);}};
    ++count;
    buttons[count]= {text: "Export to CSV",click: function() { saveCSV(uniqueid, y_Axis_Label); }};
    ++count;
    buttons[count]= {text: "Close",click: function() { $(this).dialog("close"); }};
    
    $("#chartdialog").dialog({
        modal:true,
        autoOpen: true,
        show: "blind",
        hide: "explode",
        buttons: buttons,
        resizable: true,
        width:$(window).width()-100,
        height:$(window).height()-100,
        resizeStop: function(event, ui) {resizeChart();}
    });


    //console.log("createChart: " + Date() + " (About to Calculate chart info Size) ");
    
    // KS Refactor Design 2016 Override // Chart is now in a new UI Container.
    // Original Chart Sizing details.
    //var dialogwidth = $("#chartdialog").outerWidth();
    //var dialogheight = $("#chartdialog").outerHeight();
    //var margin = {'left': 30, 'right': 50, 'top': 20, 'bottom': 40},
    //width = dialogwidth - margin.left - margin.right,
    //height = dialogheight - margin.top - margin.bottom;
    //var svg = dimple.newSvg("#chartWindow", width, height);
    // New Chart Resizing (for design 2016)
    var sizeObj = get_ChartSize_Info();  // UPDATE NOTE:  Not sure exactly what is going on here, using this function does not have the effect I was expecting.
    //var svg = dimple.newSvg("#chartWindow", sizeObj.width, sizeObj.height);
    
    //console.log("createChart: " + Date() + " (About to Create dimple svg object) ");
    //console.log("createChart: " + Date() + " (Changed svg object to remove the width and height values..About to Create dimple svg object) ");
    
    // Setting for when there is a significant bottom space on the chart UI for a screenshot.
    var svg = dimple.newSvg("#chartWindow", "100%", "25em"); // UPDATE NOTE:  Instead, using em value for the height seems to work.. at least in chrome.
    //var svg = dimple.newSvg("#chartWindow"); // Doing this covers the title and did NOT improve performance.
    // Setting for when there should be not too much space between the bottom of the chart and the buttons and bottom of UI (no screenshot)
    //var svg = dimple.newSvg("#chartWindow", "100%", "40em"); 
    
    
    //console.log("createChart: " + Date() + " (... doing the rest of the create chart stuff) " );
    //console.log("createChart: " + Date() + " (About to create dimple chart 'var chart = new dimple.chart(svg, data)' ) " );
    
    var chart = new dimple.chart(svg, data);


    chart.defaultColors = [new dimple.color("#8fd4bd")];
    
    //console.log("createChart: " + Date() + " (Chart created, about to add axis and title  ) " );
    
    // Add a title to this chart
    var currentChartTitle = getSelectedOption_Text("typemenu"); //$("#typemenu").val();
    svg.append("text")
        //.attr("x", chart._xPixels() + chart._widthPixels() / 2)
        .attr("x", "50%")  // KS Refactor Design 2016 Override // Dynamic Centering of Chart Title.
        .attr("y", chart._yPixels() - 20) //20) //.attr("y", chart._yPixels() - 20)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "1.25rem") // KS Refactor Design 2016 Override // Dynamic, slightly larger, text size of Chart Title.
        .text(currentChartTitle);//("Chart Title goes here!");

    // KS Refactor Design 2016 Override // Put the title of the chart, on the Chart UI
    //.style("color", "black") 
    // $("#chartUI_Title").text(currentChartTitle);  // KS Refactor Design 2016 Override // No need for redundant chart title.
    
    // Add logo to the chart 100 x 82  ( W x H )
    //svg.append("image")
    //    .attr('x', 0)
    //    .attr('y', 568)
    //    .attr('width', 100)
    //    .attr('height', 82)
    //    .attr("xlink:href", "img/Servir_Logo_Full_Color_Stacked2.jpg");

    
    // Add the X and Y Axis to the chart
    
    var x = chart.addTimeAxis("x", "date",parsingFormat[intervalType],dateformat[intervalType]);
    x.showGridlines = true;
    
    
    // KS Refactor Design 2016 Override // Need this variable to be global (UI Code uses it in one place)
    // Refactor for new Y Axis
    try{
        y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);
    }
    catch(e)
    {
        y_Axis_Label = "LST";
    }
    
    //var y = chart.addMeasureAxis("y", "TEST"); // Looks like the info that contains the label is identical to the key being used to get the data from the array...
    //var y = chart.addMeasureAxis("y", y_Axis_Label);  // Breaks??
    var y;
    try {
        y = chart.addMeasureAxis("y", parameterTypes[parameterType]['uname']);
    }
    catch (e) {
        y = "LST";
    }
    
    // Apply labels to the axes
    chart.axes[0].title = "Date";
    try {
        chart.axes[1].title = y_Axis_Label;  // To directly change ONLY THE LABEL..
    }
    catch (e) { }
    //console.log("createChart: " + Date() + " (About to calculate to correct y axis stretching issue try/catch block ) " );
    
    // This is a hacky quick fix for this issue of y axis stretching / corrections
    // This only works for the single dataset per chart types.
    // data, parameterTypes[parameterType]['uname'], chart
    try
    {
        var minMaxObj;
        try {
            minMaxObj = get_NewMinMax_Adjust_Y_Axis_For_Thin_Ranges_SingleDataset(data, parameterTypes[parameterType]['uname'], chart);
        }
        catch (e) { }
        if(minMaxObj == null)
        {
            // Do nothing
        }
        else
        {
            
            //console.log(Math.floor(minMaxObj.min));
            //console.log(Math.ceil(minMaxObj.max));
            var yMin = Math.floor(minMaxObj.min);
            var yMax = Math.ceil(minMaxObj.max);
            //yMax = yMax + ((yMax - yMin) %2);   // Fix for uneven number of grid points
            yMin = yMin - ((yMax - yMin) %2);   // Fix for uneven number of grid points
            //console.log(yMax);
            y.overrideMin = yMin; //Math.floor(minMaxObj.min);
            y.overrideMax = yMax; //Math.ceil(minMaxObj.max);
            
        }
    }
    catch(err_Overriding_YAxis)
    {
        // Do nothing for now.
    }
    //chart.axes[1]._min = 50;
    //y._min = 50;
    
    //y.tickFormat = ',.2f';
    y.showGridlines = true;
    
    //console.log("createChart: " + Date() + " (About to addSeries to chart  ) " );
    
    chart.addSeries(null, dimple.plot.area);
    
    //console.log("createChart: " + Date() + " (About to call chart.draw() ) " );
    
    // KS Refactor Design 2016 Override // Before Chart Draw, Show UI Indication of Chart drawing status needed for charts with a large number of points to plot.
    // Update: This line is put WAY before (in the function that calls this 'createChart') here because: In order for the UI cycle to actually update the message, this 'createChart' function needs to happen ASYNC and just shortly AFTER the UI update is called!.
    //chartUI_Show_ChartDrawing_State();
    if (!isFirefox)
        {
        $("#chartWindow").show();
    }
    //chart.draw();
    // This will draw an empty chart very very fast... for this to work, we need 'chart.draw(0, false); // somewhere else in the code.. so the data actually gets plot.
    chart.draw(0, true);  // chart.draw(duration, noDataChange) // this does not work as the first time a chart is drawn, need to do the full draw cycle once.
    
    // KS Refactor Design 2016 Override // After Chart Draw, Hide UI Indication of Chart drawing status needed for charts with a large number of points to plot.
    chartUI_Hide_ChartDrawing_State();
    
    
    global_legacy_Chart = chart;  // Set a global reference
    //debug_Chart.push(chart);
    
    //console.log("createChart: " + Date() + " (About to call update_ChartUISubPage_DynamicHeights() ) " );
    //console.log("createChart: " + Date() + " (Calling this ASYNC to improve UX a bit.. About to call update_ChartUISubPage_DynamicHeights() ) " );
    
    // KS Refactor Design 2016 Override // Force a single autoupdate so the chart gets sized correctly.
    //update_ChartUISubPage_DynamicHeights();
    setTimeout(function(){ update_ChartUISubPage_DynamicHeights(); }, 100);
    
    //console.log("createChart: " + Date() + " (reached the end!) " );
}
var global_legacy_Chart = null;
var debug_Chart = [];

//Enable the saving of the chart as a PNG file
function savePng(theUniqueID) {
    var svgtemp= document.getElementsByTagName("svg")[0];
    
    // KS Refactor Design 2016 Override // See Note
    // Note:  // Dynamic Chart width adjustment (width attr set to 100%) breaks the png saving function, however, a fixed pixel value breaks the dynamic window resizing feature.. this function call resets the state on window resize)
    set_dynamic_patch_ChartWidth_for_SVGSaving();
    
    saveSvgAsPng(svgtemp, theUniqueID+"_Chart.png", 3);
    //saveSvgAsPng(svgtemp, "diagram.png", 3);
    
}

var g_ChartData_MonthlyAnalysis = null;  //
// Enable saving of CSV for MonthlyRainfallAnalysis Types
function saveCSV_ForMonthlyRainfallAnalysisTypes(theUniqueID, chart_data)
{
    // Passing through... maybe this will work.. if not, rewrite here!
    // saveCSV(theUniqueID);

    var outputstring = "";
    outputstring += "This data was generated by SERVIR's ClimateSERV system (http://ClimateSERV.nsstc.nasa.gov/),\n";

    //outputstring = 'date,'+parameterTypes[parameterType]['lname']+'\n';
    var currentChartTitle = "Monthly Rainfall Analysis";
    //var y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);

    outputstring += 'Month_Year, Monthly_Rainfall_mm, data_series_type \n';

    //for (var i in chart_data)
    for (var i = 0; i < chart_data.length; i++)
    {
        //var valueToProcess = hashData[chart_data[i]];
        var valueToProcess = chart_data[i];
        outputstring += valueToProcess['Month_Year']+', ';
        outputstring += valueToProcess['Monthly_Rainfall_mm']+', ';
        outputstring += valueToProcess['data_series_type']+', ';
        outputstring += "\n";
    }

    downloadTextFile(theUniqueID+".csv", outputstring)

}

//Enable saving of the data output to Comma Seperated variable.
function saveCSV(theUniqueID)
{
    if(g_ChartData_MonthlyAnalysis == null)
    {
        // Do nothing
    }
    else
    {
        // Use the alternate path (For MonthlyAnalysis Types)
        saveCSV_ForMonthlyRainfallAnalysisTypes(theUniqueID, g_ChartData_MonthlyAnalysis);
        return;
    }
    
    var outputstring = "";
    outputstring += "This data was generated by SERVIR's ClimateSERV system (http://ClimateSERV.servirglobal.net/),\n";
    
    //outputstring = 'date,'+parameterTypes[parameterType]['lname']+'\n';
    var currentChartTitle = getSelectedOption_Text("typemenu"); 
    var y_Axis_Label;
    if(parameterType)
    {
        y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);
    }
    else {
        y_Axis_Label = "MODIS LST";
    }
    
    
    outputstring += 'Date,'+y_Axis_Label+'\n';
    if (parameterType) {
        for (var i in myArray.sort(compareFunction)) {
            var valueToProcess = hashData[myArray[i]];
            outputstring += valueToProcess['date'] + ', ' + valueToProcess[parameterTypes[parameterType]['lname']] + "\n";
        }
    }
    else {
        for (var i in myArray.sort(compareFunction)) {
            var valueToProcess = hashData[myArray[i]];
            outputstring += valueToProcess['date'] + ', ' + valueToProcess["LST"] + "\n";
        }
    }
    if (! theUniqueID)
        {
        //downloadTextFile("results.csv",outputstring);
        theUniqueID = guid();
       
    }
    
    downloadTextFile(theUniqueID + ".csv", outputstring);
}
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function savePolygon() {
    // KS Refactor Design 2016 // This original line exports the GeoJSON in the MAP's projection (which has changed in the past)
    //downloadTextFile("polygon.geojson",getCurrentPolygonAsGeoJson());
    // KS Refactor Design 2016 // This original line exports the GeoJSON in the MAP's projection (which has changed in the past)
    downloadTextFile("polygon.geojson", convert_PolygonString_To_4326_ForGeoJSONOutput(getCurrentPolygonAsGeoJson()));  // convert_PolygonString_To_4326_ForGeoJSONOutput(getCurrentPolygonAsGeoJson())
}

//Download a text file. Used by CSV to enable downloading of the file containing text.
function downloadTextFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function resetToInitial() {
    clearPolygon();
    closeNewEditorDialog();
    disableCustomPolygonDrawing();
    $("#chooseAreaMethodDialog").dialog();
    
}



// KS Refactor 2015 - Add selectable request ID to the progress bar.
function get_ProgressBarID_HTML(theID)
{
    var theHTML = "";
    theHTML += "<br />Job ID: " + theID;
    return theHTML;
    
}


//var debug_DatasetCapabilities = [];
//
// Dataset Capabilities Access Functions (Prototyping for IMERG 1 Day and SMAP datasets)
//
function datasetCapabilities_IsNull_LogError(dataset_Capabilities_Object)
{
    if(dataset_Capabilities_Object == null)
    {
        errorMsg = "datasetCapabilities_IsNull_LogError: There was an error getting capabilities info from the server.";
        debug_ErrorList.push(errorMsg);
        return true;
    }
    else
    {
        return false;
    }
    
}

function set_Default_Datatype_UI_DateRange(minDate, maxDate)
{
    // datepickerbegin
    $("#datepickerbegin").datepicker("option","minDate",minDate);
    $("#datepickerbegin").datepicker("option","maxDate",maxDate);
    
    // datepickerend
    $("#datepickerend").datepicker("option","minDate",minDate);
    $("#datepickerend").datepicker("option","maxDate",maxDate);
    
    
    
}

function parse_YYYY_MM_DD_To_NewDateObj(YYYY_MM_DD_String)
{
    //str.split("_");
    var yearPart = (YYYY_MM_DD_String.split("_")[0] * 1);
    var monthPart = (YYYY_MM_DD_String.split("_")[1] * 1);
    var dayPart = (YYYY_MM_DD_String.split("_")[2] * 1);
    var retDate = new Date(yearPart, monthPart - 1, dayPart);
    return retDate;
}
//imerg1Day_Info
// imerg1Day_Info.current_DataType_Capabilities_List[0].current_Capabilities // The capabilities String
// imerg1Day_Info.current_DataType_Capabilities_List[0].dataTypeNumber
function setup_IMERG_1_Day_DateRanges()
{
    var imerg1Day_Capabilities_Object = null;
    try
    {
        imerg1Day_Capabilities_Object = JSON.parse(imerg1Day_Info.current_DataType_Capabilities_List[0].current_Capabilities);
        var startDate = parse_YYYY_MM_DD_To_NewDateObj(imerg1Day_Capabilities_Object.startDateTime);
        var endDate = parse_YYYY_MM_DD_To_NewDateObj(imerg1Day_Capabilities_Object.endDateTime);
        set_Default_Datatype_UI_DateRange(startDate, endDate);
        //set_Default_Datatype_UI_minDate(startDate);
        //set_Default_Datatype_UI_maxDate(endDate);
        
        // Set datepickerend to the max range.
        $("#datepickerend").datepicker("setDate", endDate);
        
    }
    catch(err_JSON_Parse)
    {
        // eMessage = "Error Parsing JSON.  Error Message: " + err_JSON_Parse + ".  JSON String that failed to parse:: " + current_Object.current_Capabilities;
        // errMsgs.push(eMessage);
    }
    
    // imerg1Day_Capabilities_Object.startDateTime
    // imerg1Day_Capabilities_Object.endDateTime
}

// Other DateRange functions

// Removes the min and max date ranges from the calendars
function release_DateRanges()
{
    set_Default_Datatype_UI_DateRange(null, null);
}


// KS Refactor 2015
// Modifications for Climate Scenario items


//
// CLIMATE MODEL INFO ACCESS FUNCTIONS
//


// Functions to access data from the object 'climateModelInfo'
// Get list of Ensembles from the climate info model
function climateModelInfo_IsNull_LogError()
{
    if(climateModelInfo == null) 
    {
        //alert("There was an error getting info related to Climate Model datatypes from the server");
        errorMsg = "climateModelInfo_IsNull_LogError: There was an error getting info related to Climate Model datatypes from the server";
        debug_ErrorList.push(errorMsg);
        return true;
    }
    else
    {
        return false;
    }
}

// Returns a list of strings which are the ensemble names
function climateModelInfo_Get_List_Of_Ensembles()
{
    ensemble_RetList = [];
    if (climateModelInfo_IsNull_LogError() == false)
    {
        try
        {
            // foreach dataTypeMapItem in climateModelInfo.climate_DatatypeMap
            for(var i = 0; i < climateModelInfo.climate_DatatypeMap.length; i++)
            {
                ensemble_RetList.push(climateModelInfo.climate_DatatypeMap[i].climate_Ensemble);
            }
            
        }
        catch(errEnsembleList)
        {
            if (isLocalMode == true)
            {
                errString = "climateModelInfo_Get_List_Of_Ensembles: ERROR: errEnsembleList: Error Message: " + errEnsembleList;
                debug_ErrorList.push(errString);
            }
        }
    }
    
    // Sort the list and return
    ensemble_RetList = ensemble_RetList.sort();
    return ensemble_RetList;
}


// Returns a list of objects which contain climate_Variables and matching climate_Variable_Labels
// returnList                           (list/array)    The whole collection of climate variables and their labels
// returnList[n].climate_Variable        (string)        the climate variable name (as it's recognized by the system)
// returnList[n].climate_Variable_Label   (string)        the climate variable in a more easy to read format.
// returnList[n].climate_Ensemble
// returnList[n].climate_Ensemble_Label
// returnList[n].dataType_Number       (int)   Matching unique datatype number for submitting requests.
function climateModelInfo_Get_List_Of_Variable_Objects_ForEnsemble(theEnsemble)
{
    var variable_RetList = [];
    if (climateModelInfo_IsNull_LogError() == false)
    {
        try
        {
            // foreach dataTypeMapItem in climateModelInfo.climate_DatatypeMap
            for(var i = 0; i < climateModelInfo.climate_DatatypeMap.length; i++)
            {
                // When we found the correct ensemble, get it's datatypes
                var currentEnsemble = climateModelInfo.climate_DatatypeMap[i].climate_Ensemble;
                if(theEnsemble == currentEnsemble)
                {
                    var current_Ensemble_DataTypes = climateModelInfo.climate_DatatypeMap[i].climate_DataTypes;
                    
                    // Just return this list
                    variable_RetList = current_Ensemble_DataTypes;
                    return variable_RetList;
                    
                    // Iterate through and grab all the climate variables
                    //for(var j = 0; j < current_Ensemble_DataTypes.length; j++)
                    //{
                    //    //currentVariable = current_Ensemble_DataTypes[j].climate_Variable;
                    //    //currentVariableLabel = current_Ensemble_DataTypes[j].climate_Variable_Label;
                    //    //current
                    //    
                    //}
                }
                //variable_RetList.push(climateModelInfo.climate_DatatypeMap[i].climate_Ensemble)
            }
            
        }
        catch(errEnsembleList)
        {
            if (isLocalMode == true)
            {
                errString = "climateModelInfo_Get_List_Of_Ensembles: ERROR: errEnsembleList: Error Message: " + errEnsembleList;
                debug_ErrorList.push(errString);
            }
        }
    }
    
    // Sort the list and return
    variable_RetList = variable_RetList.sort()
    return variable_RetList
}

// Get the climate Capabilities object from a given datatype Number
function climateModelInfo_Get_CurrentCapabilities_ForDataTypeNumber(theDataTypeNumber)
{
    // Default value
    currentCapabilities_Object = null;
    errMsgs = [];
    
    // Iterate through all capabilities items and find the matching datatype
    try
    {
        for(var i = 0; i < climateModelInfo.climate_DataTypeCapabilities.length; i++)
        {
            current_Object = climateModelInfo.climate_DataTypeCapabilities[i];
            current_DataTypeNumber = current_Object.dataTypeNumber;
            if(theDataTypeNumber.toString() == current_DataTypeNumber.toString())
            {
                // This is the object we want.. 
                try
                {
                    currentCapabilities_Object = JSON.parse(current_Object.current_Capabilities);
                }
                catch(err_JSON_Parse)
                {
                    eMessage = "Error Parsing JSON.  Error Message: " + err_JSON_Parse + ".  JSON String that failed to parse:: " + current_Object.current_Capabilities;
                    errMsgs.push(eMessage);
                }
            }
        }
    }
    catch(err_Accessing_DataTypeCapabilities)
    {
        eMessage = "Error Accessing DataTypeCapabilities: Error Message: " + err_Accessing_DataTypeCapabilities;
        errMsgs.push(eMessage);
    }
    
    // If the capabilities object is still null, add the default error message.
    if(currentCapabilities_Object == null) 
    { 
        errMsgs.push("Could not find any capabilities matching this datatype.");  
    }
    
    // Package up the object and return.
    retObject = {
        "Capabilities":currentCapabilities_Object,
        "dataTypeNumber":theDataTypeNumber,
        "errorMsg":errMsgs
    }
    return retObject;
}

//
// Building the UI - Methods to assist with dynamically generating the UI for Climate Model Items
//




// Build an HTML Options list for Ensembles with keys and values
// Returns <option> elements as a single HTML-ready string
function htmlBuilder_Get_ClimateEnsemble_Options()
{
    ret_HTML = '';
    ensemble_Names_List = climateModelInfo_Get_List_Of_Ensembles();
    for(var i = 0; i < ensemble_Names_List.length; i++)
    {
        current_Ensemble_Name = ensemble_Names_List[i];
        ret_HTML += '<option value="'+current_Ensemble_Name+'">' + current_Ensemble_Name + '</option>';
    }
    return ret_HTML;   
}
// Build an HTML Options list for Variables with keys and values
// Returns <option> elements as a single HTML-ready string
function htmlBuilder_Get_ClimateVariable_Options_ForEnsemble(theEnsemble)
{
    var ret_HTML = '';
    var variable_Objects_List = climateModelInfo_Get_List_Of_Variable_Objects_ForEnsemble(theEnsemble);
    for(var i = 0; i < variable_Objects_List.length; i++)
    {
        var current_Variable_Name = variable_Objects_List[i].climate_Variable;
        var current_Variable_Label = variable_Objects_List[i].climate_Variable_Label;
        var current_DataTypeValue = variable_Objects_List[i].dataType_Number;
        
        // KS Refactor 201511 clientupdates_201511
        ret_HTML += '<option value="'+current_DataTypeValue+'">' + current_Variable_Label + '</option>';
        //ret_HTML += '<option value="'+current_DataTypeValue+'">' + current_Variable_Label + ' ('+current_Variable_Name+')' + '</option>';
    }
    return ret_HTML;
}
// Builds an HTML Options list for the forecast range with keys and values
// Returns <option> elements as a single HTML-ready string
var debugDates = [];
function htmlBuilder_Get_ClimateForecast_Days(theNumber_Of_Forecast_Days, climateModel_Start_Year, climateModel_Start_Month)
{
    // Make the starting date string
    var startMonth_Number = climateModel_Start_Month * 1;
    var startDate_STR = climateModel_Start_Year + "-" + startMonth_Number + "-1";  // Something like, "2015-9-1"
    
    // Browser Compatibility issues
    var sYear = climateModel_Start_Year + "";
    var sMonth = (startMonth_Number-1)+ "";
    var sDay = "1";
    
    
    var testDate = new Date(startDate_STR);
    var testDate2 = new Date(sYear, sMonth, sDay);
    //debugDates.push(testDate);
    //debugDates.push(testDate2);
    //debugDates.push(startDate_STR);
    
    var ret_HTML = "";
    for(var i = 0; i < theNumber_Of_Forecast_Days; i++)
    {
        var current_ForecastDay_Number = i + 1;  // Forecast days start at 1 not 0
        // For Display purposes, convert the forcast day to a 3 digit number as a string (with 1 or 2 leading zeros)
        var current_ForecastDay_Number_Str = current_ForecastDay_Number + "";
        if (current_ForecastDay_Number_Str.length == 1){current_ForecastDay_Number_Str = "00"+current_ForecastDay_Number_Str;}
        if (current_ForecastDay_Number_Str.length == 2){current_ForecastDay_Number_Str = "0"+current_ForecastDay_Number_Str;}
        
        
        //var startDate = new Date(startDate_STR);
        var startDate = new Date(sYear, sMonth, sDay);  // Browser Compatibility
        
        // Add days for each position on the loop,
        var daysToAdd = i;
        startDate.setDate(startDate.getDate() + daysToAdd);
        var dd = "" + startDate.getDate();
        var mm = "" + (startDate.getMonth() + 1);
        var yyyy = "" + startDate.getFullYear();
        var dateSTR = yyyy+"-"+mm+"-"+dd;
        
        //debugDates.push(startDate.getDate());
        //debugDates.push(daysToAdd);
        
        // Convert Date STR to what is needed for the value portion
        var day_Int = startDate.getDate();
        var month_Int = (startDate.getMonth() + 1);
        var year_Int = startDate.getFullYear();
        
        var day_Str = day_Int + "";
        var month_Str = month_Int + "";
        var year_Str = year_Int + "";
        
        // Add a leading zero where needed on the day and month strings
        if (day_Str.length == 1){day_Str = "0"+day_Str;}
        if (month_Str.length == 1){month_Str = "0"+month_Str;}
        
        var value_Date_Str = month_Str + "-" + day_Str + "-" + year_Str; // "mm-dd-yyyy" // Actually need slashes, but we can replace the dashes with slashed on the recieiving end.
        
        // Set the HTML
        //ret_HTML += '<option value="'+current_ForecastDay_Number+'">' + current_ForecastDay_Number + ' ('+ dateSTR +')' + '</option>';
        ret_HTML += '<option value="'+value_Date_Str+'">f' + current_ForecastDay_Number_Str + ' ('+ dateSTR +')' + '</option>';

    }
    //alert(debugDates[0]);
    //alert(debugDates[1]);
    //alert(debugDates[2]);
    //alert(debugDates[3]);
    
    return ret_HTML;
    
}

// Replaces the current Ensemble select dropdown with available options
function UI_Builder_Add_ClimateEnsemble_Options()
{
    // Get the HTML for all available Climate Ensemble options
    theHTML_Options = htmlBuilder_Get_ClimateEnsemble_Options();
    
    // Set the options to the select control (ID: 'select_Ensemble_ClimateModel')
    $("#select_Ensemble_ClimateModel").html(theHTML_Options);
}

// Replaces the current Variable select dropdown with available options for a given ensemble
function UI_Builder_Add_ClimateVariable_Options_ForEnsemble(theEnsemble)
{
    // Get the HTML for all available Climate Variable options
    theHTML_Options = htmlBuilder_Get_ClimateVariable_Options_ForEnsemble(theEnsemble);
    
    // Set the option to the select control (ID: 'select_Variable_ClimateModel')
    $("#select_Variable_ClimateModel").html(theHTML_Options);
    
    // Try and reselect the previously selected option on the ClimateVariable List
    //try_reselect_CurrentClimateVariable();  // Note, the previously selected option may not be available in the new list...
    try_reselect_SelectBoxOption_For(global_Current_ClimateVariable_SelectText, "select_Variable_ClimateModel");
}

// Replace parts of the Climate Model UI based on the Capabilities object
function UI_Builder_Adjust_UI_To_CurrentCapabilities(current_Capabilities_Obj)
{
    // Gather needed infos
    //forecast_Select_ID_From = "select_RangeFrom_ClimateModel";
    //forecast_Select_ID_To = "select_RangeTo_ClimateModel"
    
    
    
    // Model Run String (YYYY / MM)
    var startDateTimeStr = current_Capabilities_Obj.Capabilities.startDateTime;
    var modelYear = startDateTimeStr.split("_")[0];
    var modelMonth = startDateTimeStr.split("_")[1];
    //modelRunString = "Model Run Year/Month: " + modelYear + "/" + modelMonth;
    var modelRunString = modelYear + "/" + modelMonth;
    
    // Forecast Days
    var number_Of_ForecastDays = current_Capabilities_Obj.Capabilities.number_Of_ForecastDays;
    var forecast_HTML_From = htmlBuilder_Get_ClimateForecast_Days(number_Of_ForecastDays, modelYear, modelMonth);
    var forecast_HTML_To = htmlBuilder_Get_ClimateForecast_Days(number_Of_ForecastDays, modelYear, modelMonth);
    var number_Of_ForecastDays_HTML_Label = "Max Days: " + number_Of_ForecastDays;
    
    // Replace HTML Elements as needed
    $("#span_ModelRunYYYYMM_ClimateModel").html(modelRunString);
    $("#span_NumOfForecastDays_ClimateModel").html(number_Of_ForecastDays_HTML_Label);
    $("#select_RangeFrom_ClimateModel").html(forecast_HTML_From);
    $("#select_RangeTo_ClimateModel").html(forecast_HTML_To);
    
    // Restore Previously selected elements for the range
    try_reselect_SelectBoxOption_For(global_ForecastRange_FromString, "select_RangeFrom_ClimateModel");
    try_reselect_SelectBoxOption_For(global_ForecastRange_ToString, "select_RangeTo_ClimateModel");
}

// Groups of classes for the different UI's
// SubmitDataRequest_UI                 : The Root classname tag, use this to hide all UIs
// SubmitDataRequest_UI_Default         : (CHIRPS/NDVI) Default UI, the one that already existed
// SubmitDataRequest_UI_ClimateModel    : Climate Model Datatypes

// Show and Hide the different UIs
function hide_SubmitDataRequest_UI_Group(theClassName) { $("."+theClassName).hide(); }
function show_SubmitDataRequest_UI_Group(theClassName) 
{ 
    // Hide All SubmitDataRequest UI's
    hide_SubmitDataRequest_UI_Group("SubmitDataRequest_UI");
    // Show only the group we want to see!
    $("."+theClassName).show(); 
    
    
}

// KS Refactor 201511 clientupdates_201511
// Now we need some code that is specific to CHIRPS and different code that is specific to NDVI
function display_CHIRPS_Specific_UI()
{
    $("#dateintervalmenu_Default_Dynamic").html("Daily");
    release_DateRanges();
}
function display_NDVI_Specific_UI()
{
    $("#dateintervalmenu_Default_Dynamic").html("Pentadal");
    release_DateRanges();
}
function display_IMERG1Day_Specific_UI()
{
    $("#dateintervalmenu_Default_Dynamic").html("Daily");
    setup_IMERG_1_Day_DateRanges();
}

function display_SMAP_Specific_UI() {
    $("#dateintervalmenu_Default_Dynamic").html("Daily");
    release_DateRanges();
}
//
// EVENT HANDLERS (Climate Model)
//


// When the drop down box (ID: 'typemenu' ) for 'Select Data Type' changes,
// Enumeration notes for 'theOptionValue'
// <option value="0">CHIRPS Precip</option>
// <option value="1">eMODIS NDVI - West Africa</option>
// <option value="ClimateModel">Climate Models</option>
function select_dataType_Changed(theOptionValue)
{
    //alert(theOptionValue);
    
    // Based on the option selected, change which UI is displayed
    // CHIRPS and NDVI have existing UI's, ClimateModel requires a diferent UI

    // Show the SubmitDataRequest UI
    if(theOptionValue == "ClimateModel")
    {
        // KS Refactor Design 2016 Override // Show the 'Select Data' UI Form for Seasonal_Forecasts
        show_SelectDataForm_SeasonalForecast();
         
        //alert("Climate Model type selected");
        show_SubmitDataRequest_UI_Group("SubmitDataRequest_UI_ClimateModel");
    }
    else
    {
        // KS Refactor Design 2016 Override // Show the 'Select Data' UI Form for Default
        show_SelectDataForm_Default();
        
        //alert("CHIRPS or NDVI UI selected");
        show_SubmitDataRequest_UI_Group("SubmitDataRequest_UI_Default");
        
        // Check to see if this is CHIRPS or NDVI
        if(theOptionValue == "0")
        {
            display_CHIRPS_Specific_UI();
        }
        if(theOptionValue == "1")
        {
            display_NDVI_Specific_UI();
        }
        if(theOptionValue == "IMERG1Day")
        {
            display_IMERG1Day_Specific_UI();
            //alert("IMERG");
        }
        if (theOptionValue == "29" || theOptionValue == "33") {
            display_SMAP_Specific_UI();
        }
        if (theOptionValue == "30") {
            display_SMAP_Specific_UI();
        }
    }
    
}

// KS Refactor 201511 clientupdates_201511
// Default ClimateVariable String
var default_ClimateVariable_SelectString = "Precipitation";
var default_ForecastRange_StartString = "f001 (2015-9-1)";//"09-01-2015";
var default_ForecastRange_EndString = "f009 (2015-9-9)";//"09-10-2015";

var global_Current_ClimateVariable_SelectText = default_ClimateVariable_SelectString;
var global_ForecastRange_FromString = default_ForecastRange_StartString;
var global_ForecastRange_ToString = default_ForecastRange_EndString;

function try_reselect_CurrentClimate_ForecastRange() {}         // Attempt to set BOTH boxes. 

function set_global_Current_ClimateVariable_SelectText(newText) { global_Current_ClimateVariable_SelectText = newText; }
function set_global_ForecastRange_FromString(newText) { global_ForecastRange_FromString = newText; }
function set_global_ForecastRange_ToString(newText) { global_ForecastRange_ToString = newText; }
function get_global_Current_SelectOption_TextValue_For(optionVal, selectBoxElementID )
{
    try
    {
        var currentExisting_ClimateVariableOptions = getOptionList_val_text_Items(selectBoxElementID);
        for(var i = 0; i < currentExisting_ClimateVariableOptions.length; i++)
        {
            var currItem_Text = currentExisting_ClimateVariableOptions[i].text;
            var currItem_Val = currentExisting_ClimateVariableOptions[i].val;
            if(currItem_Val == optionVal)
            {
                return currItem_Text;
            }
        }
    }
    catch(err_Setting_global_Current_SelectOption_TextValue)
    {
        return "error";
    }
}
function try_reselect_SelectBoxOption_For(textValue, selectBoxElementID)
{
    try
    {
        var currentExisting_SelectBox_Options = getOptionList_val_text_Items(selectBoxElementID);
        // Try and find an item that matches the currently selected item and select it.
        for(var i = 0; i < currentExisting_SelectBox_Options.length; i++)
        {
            var currItem_Text = currentExisting_SelectBox_Options[i].text;
            var currItem_Val = currentExisting_SelectBox_Options[i].val;
            if(currItem_Text == textValue)
            {
                try
                {
                    $("#"+selectBoxElementID).val(currItem_Val);
                }
                catch(err_SelectingCurrentVariable)
                {
                    //alert(0);
                    //alert(err_SelectingCurrentVariable);
                }
            }
        }
    }
    catch(err_SelectingOption)
    {
        //alert(1);
        //alert(err_SelectingDefault);
    }
}
/*
function try_reselect_CurrentClimateVariable()
{
    try
    {
        var climateVarSelectBoxID = "select_Variable_ClimateModel";
        var currentExisting_ClimateVariableOptions = getOptionList_val_text_Items(climateVarSelectBoxID); //'select_Variable_ClimateModel'
        
        // Try and find an item that matches the currently selected item and select it.
        for(var i = 0; i<currentExisting_ClimateVariableOptions.length; i++)
        {
            var currItem_Text = currentExisting_ClimateVariableOptions[i].text;
            var currItem_Val = currentExisting_ClimateVariableOptions[i].val;
            if(currItem_Text == global_Current_ClimateVariable_SelectText)
            {
                try
                {
                    $("#"+climateVarSelectBoxID).val(currItem_Val);
                }
                catch(err_SelectingCurrentVariable)
                {
                    //alert(0);
                    //alert(err_SelectingCurrentVariable);
                }
            }
        }
        
    }
    catch(err_SelectingDefault)
    {
        //alert(1);
        //alert(err_SelectingDefault);
    }
    
}
*/
/*
// Gets a list of all the options, finds the one selected, stores the text string into the global variable.
function set_global_Current_ClimateVariable_SelectText(optionVal)
{
    try
    {
        var climateVarSelectBoxID = "select_Variable_ClimateModel";
        var currentExisting_ClimateVariableOptions = getOptionList_val_text_Items(climateVarSelectBoxID);
        for(var i = 0; i<currentExisting_ClimateVariableOptions.length; i++)
        {
            var currItem_Text = currentExisting_ClimateVariableOptions[i].text;
            var currItem_Val = currentExisting_ClimateVariableOptions[i].val;
            if(currItem_Val == optionVal)
            {
                global_Current_ClimateVariable_SelectText = currItem_Text;
            }
        }
    }
    catch(err_Setting_global_Current_ClimateVariable_SelectText)
    {
        //alert(1);
        //alert(err_SelectingDefault);
    }
    
}
*/

function getSelectedOption_Value(elementID)
{
    // $('#select_Variable_ClimateModel option:selected').val()
    return $('#'+elementID+' option:selected').val()
}
function getSelectedOption_Text(elementID)
{
    // $('#select_Variable_ClimateModel option:selected').text()
    return $('#'+elementID+' option:selected').text()
}
function getOptionList_val_text_Items(elementID)
{
    var val_text_Items = [];
    $("#"+elementID+" option").each(function()
    {
        var curr_Text = $(this).text();
        var curr_Val = $(this).val();
        var currObj = 
        {
            'val':curr_Val,
            'text':curr_Text
        };
        val_text_Items.push(currObj);
        //alert($(this).text());// Add $(this).val() to your list
    });
    return val_text_Items;
}





// When the drop down box (ID: 'select_Ensemble_ClimateModel' ) for 'Select a model ensemble' changes
function select_Ensemble_Changed(theOptionValue)
{
    // Change the ClimateVariable select box based on what was selected on the Ensemble drowdown
    var ensemble_Selection_Value = theOptionValue;
    UI_Builder_Add_ClimateVariable_Options_ForEnsemble(ensemble_Selection_Value);
    //alert(theOptionValue);
}

// When the drop down box (ID: '' ) for 'Select a variable' changes
function select_ClimateVariable_Changed(theOptionValue, isUserSelectedChange)
{
    // User Selected Change
    if(isUserSelectedChange == true)
    {
        //set_global_Current_ClimateVariable_SelectText(theOptionValue);
        var currentTextValue = get_global_Current_SelectOption_TextValue_For(theOptionValue, "select_Variable_ClimateModel");
        set_global_Current_ClimateVariable_SelectText(currentTextValue);
    }
    // The Option Value IS the datatypeNumber (When the select box for climate variables are built, the unique data type number is paired with it and used as the value.)
    // Get the Capabilities for the current selected Datatype and use that to build the rest of the UI (it is all dependent on
    current_Capabilities_Object = climateModelInfo_Get_CurrentCapabilities_ForDataTypeNumber(theOptionValue);
    UI_Builder_Adjust_UI_To_CurrentCapabilities(current_Capabilities_Object);
    
}


// Utility to convert the from/to forecast values into ints to be used to compare
function get_Converted_Range_Value(theValueToConvert)
{
    // Input looks something like this, : 'f001 (2015-9-1)'
    
    // Update, turns out this is not necessary at this time!
    return -1;
}

// Convert Date Strings to 3 part date inputs (Fix for Safari issues, converts 03-28-2010 to "03","28","2010" (Obj.month,year,day))
function get_DatePartsObj_From_mmddyyyy_String(mmddyyyy_String)
{
    
    var monthPart = "01";
    var dayPart = "01";
    var yearPart = "0000";
    var objMessage = "Defaults Used";
    try
    {
        monthPart = mmddyyyy_String.split("-")[0];
        dayPart = mmddyyyy_String.split("-")[1];
        yearPart = mmddyyyy_String.split("-")[2];
        objMessage = "String Parse Success";
    }
    catch(errParsingString)
    {
        yearPart = "0000";
        monthPart = "01";
        dayPart = "01";
        objMessage = errParsingString;
    }
    
    var retObj = {
        "month":monthPart,
        "day":dayPart,
        "year":yearPart,
        "objMessage":objMessage
    };
    return retObj;
    
}
// When the drop down box (ID: 'select_RangeFrom_ClimateModel' ) for 'Select Forecast range From, has a change
function select_RangeFrom_Changed(theOptionValue, isUserSelectedChange)
{
    // User Selected Change
    if(isUserSelectedChange == true)
    {
        var currentTextValue = get_global_Current_SelectOption_TextValue_For(theOptionValue, "select_RangeFrom_ClimateModel");
        set_global_ForecastRange_FromString(currentTextValue);
    }
    
    // Get both range values, set other range value if necessary
    var from_Option_Value_Raw = $("#select_RangeFrom_ClimateModel option:selected" ).attr("value");
    var to_Option_Value_Raw = $("#select_RangeTo_ClimateModel option:selected" ).attr("value");
    
    // When we need ints or numbers
    //var from_Option_Value_Int = ( from_Option_Value_Raw * 1);
    //var to_Option_Value_Int = ( to_Option_Value_Raw * 1);
    
    // Inputs are dates in this format "09-01-2015"
    // Fix for Safari date bug
    var to_Option_Value_DateObjParts = get_DatePartsObj_From_mmddyyyy_String(to_Option_Value_Raw);
    var from_Option_Value_DateObjParts = get_DatePartsObj_From_mmddyyyy_String(from_Option_Value_Raw);
    var to_Option_Value = new Date(to_Option_Value_DateObjParts.year, to_Option_Value_DateObjParts.month - 1, to_Option_Value_DateObjParts.day);
    var from_Option_Value = new Date(from_Option_Value_DateObjParts.year, from_Option_Value_DateObjParts.month - 1, from_Option_Value_DateObjParts.day);
    //var to_Option_Value = new Date(to_Option_Value_Raw);
    //var from_Option_Value = new Date(from_Option_Value_Raw);
    
    if(to_Option_Value < from_Option_Value)
    {
        // Set the bottom limit on the 'to' box
        //$("#select_RangeTo_ClimateModel").val(from_Option_Value); 
        $("#select_RangeTo_ClimateModel").val(from_Option_Value_Raw); 
        select_RangeTo_Changed(from_Option_Value_Raw, true);  // Yep, programatic but need the userSelectChange as well.
    }
    
}
// When the drop down box (ID: 'select_RangeTo_ClimateModel' ) for 'Select Forecast range To, has a change
function select_RangeTo_Changed(theOptionValue, isUserSelectedChange)
{
    // User Selected Change
    if(isUserSelectedChange == true)
    {
        var currentTextValue = get_global_Current_SelectOption_TextValue_For(theOptionValue, "select_RangeTo_ClimateModel");
        set_global_ForecastRange_ToString(currentTextValue);
    }
    
    // Get both range values, set other range value if necessary
    var from_Option_Value_Raw = $("#select_RangeFrom_ClimateModel option:selected" ).attr("value");
    var to_Option_Value_Raw = $("#select_RangeTo_ClimateModel option:selected" ).attr("value");
    
    // When we need ints or numbers
    //var from_Option_Value_Int = ( from_Option_Value_Raw * 1);
    //var to_Option_Value_Int = ( to_Option_Value_Raw * 1);
    
    // Inputs are dates in this format "09-01-2015"
    // Fix for Safari date bug
    var to_Option_Value_DateObjParts = get_DatePartsObj_From_mmddyyyy_String(to_Option_Value_Raw);
    var from_Option_Value_DateObjParts = get_DatePartsObj_From_mmddyyyy_String(from_Option_Value_Raw);
    var to_Option_Value = new Date(to_Option_Value_DateObjParts.year, to_Option_Value_DateObjParts.month - 1, to_Option_Value_DateObjParts.day);
    var from_Option_Value = new Date(from_Option_Value_DateObjParts.year, from_Option_Value_DateObjParts.month - 1, from_Option_Value_DateObjParts.day);
    //var to_Option_Value = new Date(to_Option_Value_Raw);
    //var from_Option_Value = new Date(from_Option_Value_Raw);
    
    if(from_Option_Value > to_Option_Value)
    {
        // Set the bottom limit on the 'to' box
        //$("#select_RangeFrom_ClimateModel").val(to_Option_Value); 
        $("#select_RangeFrom_ClimateModel").val(to_Option_Value_Raw); 
        select_RangeFrom_Changed(to_Option_Value_Raw, true);  // Yep, programatic but need the userSelectChange as well.
    }
    
}

//
// INIT (Climate Model UI) - Main Controller section
//

// Init ClimateModel UI
function init_ClimateModel_UI()
{
    // Init the Ensemble Drop down box
    UI_Builder_Add_ClimateEnsemble_Options();
    
    // Force selection of first Ensemble (which leads to populating the variable dropdown
    current_First_Ensemble_Option_Value = $("#select_Ensemble_ClimateModel option")[0].value;
    select_Ensemble_Changed(current_First_Ensemble_Option_Value);
    
    // Force selection of first Variable (which leads to populating the rest of the interface for the current datatype)
    current_First_Variable_Option_Value = $("#select_Variable_ClimateModel option")[0].value;
    select_ClimateVariable_Changed(current_First_Variable_Option_Value, false);    
}


// Check for Maintenance Mode (By checking to see if the API is responding or not)
function checkMaintenanceMode()
{
    // If the API is not responding, forward the user to the maintenance.html page.
    $.ajax({url: baserequesturl+'getParameterTypes/?callback=?',
    type: "get",       
    //data: data,
    dataType: "json", //"jsonp",
    //jsonpCallback: 'successCallback',
    async: false, //true,
    beforeSend: function() { },
    complete: function() { },
    success: function (result) { },
    error: function (request,error) 
    { 
        var basePathAddition = "/";
        if(isLocalMode == true)
        {
            basePathAddition += "SERVIRMap/";
        }
        var newLocation = window.location.origin + basePathAddition + "maintenance.html"; 
        
        // Forward to a new page
        //window.location.href = newLocation;
    }, 
    successCallback:function(){ }
    });
}


//
// Time Before Showing 2 Seconds
// Time it stays up 5 Seconds
// Only shows once
// Clickiing the handle before the tip, removes the tip completly.

// Functions to control the User Helper Guide
// Settings
var startHelper_TimeBeforeShowing = 3000; 
var startHelper_TimeHelperStays = 5000;
var startHelper_Slide_In_Time = 1000;
var startHelper_Slide_Out_Time = 1000;
var isDisplay_startHelper = true;
function start_Helper_Clicked()
{
    $("ul#top_menu").sidebar("open");
    remove_Start_Helper_NOW();
}
function show_Start_Helper_Timer()
{
    setTimeout(function(){ show_Start_Helper(); }, startHelper_TimeBeforeShowing);
}
function show_Start_Helper()
{
    // display:block;
    //$("#userHelper_Start").show();
    if(isDisplay_startHelper === true)
    {
        var effectOptions = {};
        var effectTime = startHelper_Slide_In_Time;
        $("#userHelper_Start").show( "drop", effectOptions, effectTime, hide_Start_Helper_Timer );
    }
}
function hide_Start_Helper_Timer()
{
    setTimeout(function(){ hide_Start_Helper(); }, startHelper_TimeHelperStays);
}
function hide_Start_Helper()
{
    // display:none;
    isDisplay_startHelper = false;
    var effectOptions = {};
    var effectTime = startHelper_Slide_Out_Time;
    $("#userHelper_Start").hide( "drop", effectOptions, effectTime, hide_Start_Helper_EffectFinished );
}
function hide_Start_Helper_EffectFinished()
{
    // Do nothing!
}
function remove_Start_Helper_NOW()
{
    isDisplay_startHelper = false;
    $("#userHelper_Start").hide();
}

function addEventLoop_Helper()
{
    
    if($(".sidebar-inject").length == 0)
    {
        setTimeout(function(){ addEventLoop_Helper(); }, 100);
    }
    else
    {
        $(".sidebar-inject").on( "click", remove_Start_Helper_NOW ); 
    }
}

// Entry point for Climate Model UI Init
// UI Init entry point is actually called just after the climate data map comes in
$(document).ready(function()
{
   // Note, the behavior when running this line indicates that the Doc is NOT ready when this funciton is called!
   // 
   //alert("READY") 
   
   // Add the List of Ensembles to the dropdown.
   //UI_Builder_Add_Ensemble_Options();
   
   // Start the helper functions
   show_Start_Helper_Timer();
   
   //$("ul#top_menu").on( "click", handler1 );
   //alert($(".sidebar-inject"));
   
   addEventLoop_Helper();
   
   
});


// KS Refactor for Temp. Range graph normalizations
// This is the code that converts the y axis on graph.
// The conversion is to instead of using '0' as the min Y value, analyze the dataset
// and use a relative min/max range based on the data returned

// Support for Temp Range Graph Normalizations
function check_IsTypeToAdjust()
{
    try
    {
        var currClimateSelection = getSelectedOption_Text("select_Variable_ClimateModel");
        if (currClimateSelection == "Temperature") { return true; }
    }
    catch(err_CheckingType)
    {
        return false;
    }
    
    // Default, if we didn't hit any items in the list, then default to false..
    return false;
}
// Heavy lifting for adjusting the y axis based on data            
function get_NewMinMax_Adjust_Y_Axis_For_Thin_Ranges_SingleDataset(theData, theKeyName_ToData, theChart)
{
    var isTypeToAdjust = check_IsTypeToAdjust();
    
    if(isTypeToAdjust == false)
    { 
        return null;
    }
    else
    {
        // Get the min and max of the data it self
        var currentMin = 0;
        var currentMax = 0;
        for (var i = 0; i < theData.length; i++)
        {
            var currentValue = theData[i][theKeyName_ToData];
            
            if(i == 0)
            {
                // First time through the loop!
                currentMin = currentValue;
                currentMax = currentValue;
            }
            else
            {
                if(currentValue < currentMin) { currentMin = currentValue; }
                if(currentValue > currentMax) { currentMax = currentValue; }
            }
            // console.log(currentValue);
            // console.log(currentMin);
            // console.log(currentMax);
            
        }
        
        var adjustmentPercent = 0.20; // percent multiplier
        var adjustmentAmount = (currentMax - currentMin) * adjustmentPercent;
        var adjustedMax = currentMax + adjustmentAmount;
        var adjustedMin = currentMin - adjustmentAmount;
        
        //var yAxis = theChart.axes[1];
        var ret_MinMaxObj = 
                {
                    "min":adjustedMin,
                    "max":adjustedMax
                };
        // console.log(ret_MinMaxObj);
                
        return ret_MinMaxObj;
        
    }
    
    // If we got this far, something probably went wrong...
    return null;
    
    
}



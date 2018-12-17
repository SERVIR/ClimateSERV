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

//var minDate_Imerg1Day = null;
//var maxDate_Imerg1Day = null;

compareFunction = function (a,b){
    return a-b
}

if (window.location.hostname === 'localhost2') 
//if (window.location.hostname === 'localhost') 
{
    isLocalMode = true;
    var baseurl = "http://localhost/";
    var baserequesturl = "http://localhost:8000/";
    //var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/jeburks/work/SERVIR/data/GIS/mapfiles/servir.map"; // jeburks dev
    var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/kris/work/SERVIR/data/GIS/mapfiles/servir.map"; // ks dev
} else {
    isLocalMode = false;
    //var baseurl = "http://chirps.nsstc.nasa.gov/";
    //var baserequesturl = "http://chirps.nsstc.nasa.gov/chirps/";
    //var baseWMSurl = "http://chirps.nsstc.nasa.gov/cgi-bin/servirmap?";
    
    //var hostName = window.location.hostname;
    var hostName = "chirps.nsstc.nasa.gov";
    var baseurl = "http://"+hostName+"/";
    var baserequesturl = "http://"+hostName+"/chirps/";
    var baseWMSurl = "http://"+hostName+"/cgi-bin/servirmap?";
}


// KS Refactor 2015 // Get Climate model info from the server and do init related to all of that
function getClimateModelInfo()
{
    $.getJSON(baserequesturl+'getClimateScenarioInfo/?callback=?', function(data) {
        processClimateModelInfo(data);
    });
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
        if (data[i]['visible'] === 'true') {
            visible = true;
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
    
    data = 
    {
        'datatype':dataTypeValue,
        'begintime':dateBeginValue,
        'endtime':dateEndValue,
        'intervaltype':dateintervalValue,
        'operationtype':operationValue,
        
        // New Params
        'dateType_Category':dateType_Category,
        'isZip_CurrentDataType':isZip_CurrentDataType       // This one will mostlikely get renamed when we actually hook up the zipping capabilities
    };
    if (clickEnabled) {
        data['layerid'] = layerIds[selectedLayer];
        data['featureids'] = selectedFeatures.join()
    } else {
        data['geometry'] =currentStringPolygon;
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
    $("#progressbar").progressbar({value:0});
    $("#progresslabel").text("Submitting Request...");
    $("#progressdialog").dialog();
    $.ajax({url: baserequesturl+'submitDataRequest/?callback=?',
    type: "post",       
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
        $("#progresslabel").text("Processing..."+0+"%");
        $("#requestId").html(get_ProgressBarID_HTML(uniqueid));
        hide_DownloadFileLink();    // Hide the download file link before showing the progress dialog box.
        $("#progressdialog").dialog();
        
        
        startTimer(getDataRequestProgress);
        
    },
    error: function (request,error) {
        console.log("Got an error");
    }, 
    successCallback:function(){
        
    }
});
}

var debugMe_AjaxData = [];


//set the uniqueid
function setUniqueId(id) {
    uniqueid=id;
}

//Query the server to check the progress of Data Request that has been submitted.
function getDataRequestProgress() {
     datain = {'id':uniqueid};
     $.ajax({url: baserequesturl+'getDataRequestProgress/?callback=?',
    type: "post",       
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
           $("#progresslabel").text("There was an error processing your request...");
           $("#progressdialog").dialog();
           stopTimer();
       } else if (progressForId === -2) {
           //Ignore this means there was some problem reading the data.
       } else if (progressForId === 100)
       {
           
           
           stopTimer();
           $("#progressbar").progressbar({value:100});
           $("#progresslabel").text("Downloading...");
           
           // KS Refactor 2015 // This is where I need to intercept the 'download' operation type on the client side..
           // This line for all operation types that are not download... (maybe)..
           getDataFromRequest(uniqueid);
       } else {
           $("#progressbar").progressbar({value:progressForId});
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


//Get the data from the submitted request and process it.
function getDataFromRequest() {
    data = {'id':uniqueid}
    $.ajax({url: baserequesturl+'getDataFromRequest/?callback=?',
    type: "post",       
    data: data,
    dataType: "jsonp",
    jsonpCallback: 'successCallback',
    async: true,
    beforeSend: function() {

    },
    complete: function() {

    },
    success: function (result) {
      if ($("#progressdialog").is(':data(dialog)')) {
        $("#progressdialog").dialog("close");
      }
      processIncomingData(result);
    },
    error: function (request,error) {

    }, 
    successCallback:function(){
        
    }
});
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
        type: "post",       
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
            alert(result);
        },
        error: function (request,error) 
        {

        }, 
        successCallback:function()
        {
        
        }
    });
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
        for (var i in dataFromRequest) 
        {
            var outputdate = dataFromRequest[i]['date'];
            value = dataFromRequest[i]['value'][varName];
            if(value < -999.00) { value = 0; }
            // Intercept for IMERG Data (Convert IMERG Data from 0.1 mm/day to 1.0 mm/day
            if($("#typemenu").val() == "IMERG1Day") { value = (value/10); }
            // if(value < -999.00) { alert(value); }
            epochTime = dataFromRequest[i]['epochTime'];
            output[i] = [];
            output[i]['date'] = outputdate;
            output[i][varName]=value;
            myArray.push(epochTime);
            hashData[epochTime] = {'date':outputdate};
            hashData[epochTime][varName] = value;
        }   
        data = output;
        createChart(output);
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

//Create the chart based on the data.
function createChart(data){
    
    
    var buttons = []
    count =0
    if (clickEnabled == false) {
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
        buttons: buttons ,
        resizable: true,
        width:$(window).width()-100,
        height:$(window).height()-100,
        resizeStop: function(event, ui) 
        {
            resizeChart();
        }
    
    });
    var dialogwidth = $("#chartdialog").outerWidth();
    var dialogheight = $("#chartdialog").outerHeight();
    var margin = {'left': 30, 'right': 50, 'top': 20, 'bottom': 40},
    width = dialogwidth - margin.left - margin.right,
    height = dialogheight - margin.top - margin.bottom;
    var svg = dimple.newSvg("#chartWindow", width, height);

    
    
    var chart = new dimple.chart(svg, data);
    chart.defaultColors = [
        new dimple.color("grey")
    ]; 
    
    // Add a title to this chart
    var currentChartTitle = getSelectedOption_Text("typemenu"); //$("#typemenu").val();
    svg.append("text")
        .attr("x", chart._xPixels() + chart._widthPixels() / 2)
        .attr("y", chart._yPixels() - 20)
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .text(currentChartTitle);//("Chart Title goes here!");

    
    
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
    
    
    // Refactor for new Y Axis
    var y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);
    //var y = chart.addMeasureAxis("y", "TEST"); // Looks like the info that contains the label is identical to the key being used to get the data from the array...
    //var y = chart.addMeasureAxis("y", y_Axis_Label);  // Breaks??
    var y = chart.addMeasureAxis("y", parameterTypes[parameterType]['uname']);
    
    // Apply labels to the axes
    chart.axes[0].title = "Date";
    chart.axes[1].title = y_Axis_Label;  // To directly change ONLY THE LABEL..
    
    // This is a hacky quick fix for this issue of y axis stretching / corrections
    // This only works for the single dataset per chart types.
    // data, parameterTypes[parameterType]['uname'], chart
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
    //chart.axes[1]._min = 50;
    //y._min = 50;
    
    y.tickFormat = ',.2f';
    y.showGridlines = true;
    chart.addSeries(null, dimple.plot.area);
    
    chart.draw();
    
    
    debug_Chart.push(chart);
}
var debug_Chart = [];

//Enable the saving of the chart as a PNG file
function savePng(theUniqueID) {
    var svgtemp= document.getElementsByTagName("svg")[0];
    
    saveSvgAsPng(svgtemp, theUniqueID+"_Chart.png", 3);
    //saveSvgAsPng(svgtemp, "diagram.png", 3);
    
}

//Enable saving of the data output to Comma Seperated variable.
function saveCSV(theUniqueID) {
    
    outputstring = "";
    outputstring += "This data was generated by SERVIR's ClimateSERV system (http://ClimateSERV.nsstc.nasa.gov/),\n";
    
    //outputstring = 'date,'+parameterTypes[parameterType]['lname']+'\n';
    var currentChartTitle = getSelectedOption_Text("typemenu"); 
    var y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);
    
    
    outputstring += 'Date,'+y_Axis_Label+'\n';
       
    for (var i in myArray.sort(compareFunction)) {
        var valueToProcess = hashData[myArray[i]];
        outputstring += valueToProcess['date']+', '+valueToProcess[parameterTypes[parameterType]['lname']]+"\n";
    }
    //downloadTextFile("results.csv",outputstring);
    downloadTextFile(theUniqueID+".csv", outputstring)
    
    
}

function savePolygon() {
    downloadTextFile("polygon.geojson",getCurrentPolygonAsGeoJson());
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
        //alert("Climate Model type selected");
        show_SubmitDataRequest_UI_Group("SubmitDataRequest_UI_ClimateModel");
    }
    else
    {
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
        window.location.href = newLocation;
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



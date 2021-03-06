/* 
 * Description: Clientside code for Agriserv Alpha
 * Author: Kris Stanton (SERVIR Project)
 * Date: May/June 2016
 * 
 */



// CODE SECTION             START



// Global Items

// Pseudo enum for Use Case Types
var UseCaseTypes = { Area_Of_Interest_Analytics:"Area_Of_Interest_Analytics"  }  

// Container for holding Areas of Interest
var AreaOfInterest_List = [];



var HCTEST_ITEMS =
{
    Input_Year_2000 : 2000,
    Input_Year_2015 : 2015,
    
    // 4 Point Close Polygon (rectangular shape) in West Africa
    Input_AOI_Polygon_01 : "{\"type\":\"Polygon\",\"coordinates\":[[[-10.678710937500014,13.6669921875],[-7.119140625000014,13.7548828125],[-7.163085937500014,11.1181640625],[-10.590820312500014,11.25],[-10.678710937500014,13.6669921875]]]}",
    // 4 Point Close Polygon (rectangular shape) in West Africa (Slightly east of Input_AOI_01)
    Input_AOI_Polygon_02 : "{\"type\":\"Polygon\",\"coordinates\":[[[-5.009765625000014,13.293457031250004],[-2.021484375000014,13.293457031250004],[-2.021484375000014,11.096191406250004],[-4.965820312500014,11.008300781250004],[-5.009765625000014,13.293457031250004]]]}"
};





// ////////////////////////////////   Utilities    /////////////////////////////////////
// ////////////////////////////////   Utilities    /////////////////////////////////////
// ////////////////////////////////   Utilities    /////////////////////////////////////

// Generate 4 byte hex string
function s4() 
{
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}
// Generate guid from series of 4 byte hex strings
function guid() 
{
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// Generate a Local Request ID (Used to uniquely identify individual requests and connect them to their usecase
function generate_LocalRequest_ID_as_s8()
{
    return s4() + s4()
}




// ////////////////////////////////   MULTI REQUEST HANDLING    ////////////////////////////////
// ////////////////////////////////   MULTI REQUEST HANDLING    ////////////////////////////////
// ////////////////////////////////   MULTI REQUEST HANDLING    ////////////////////////////////


// Data Model Stuff
var requests_Waiting_ToMake = [];       // Requests in the queue waiting to be submitted to the API
var requests_Waiting_ForData = [];      // Requests that are waiting for data
var requests_DataReady = []; // Not necessary.. once the data comes in, the reciever function should put that data where it goes to be graphed later.

function add_RequestTo_WaitingToMake_Queue(theRequest)
{
    // Check for too many here??  or check for anything else
    requests_Waiting_ToMake.push(theRequest);
}
function add_RequestTo_WaitingForData_Queue(localJobID, serverJobID, jobProgressValue)
{
    var request_Waiting_For_Data_Object = {
        "localJobID":localJobID,
        "serverJobID":serverJobID,
        "jobProgressValue":jobProgressValue
    };
    requests_Waiting_ForData.push(request_Waiting_For_Data_Object); 
    
    // Modify the original object to store the serverJobID
    set_ServerJobID_To_UseCaseA_Request(serverJobID, localJobID);
}
function add_RequestTo_DataReady_Queue(localJobID, serverJobID)
{
    var request_DataReady_Object = 
    {
        "localJobID":localJobID,
        "serverJobID":serverJobID
    };
    requests_DataReady.push(request_DataReady_Object);
}
//function makeRequestItem(localID){    var retObj = {           }    return retObj}

// Intervals
var interval_Seconds_To_CheckRequestQueues = 1;

// Set interval function to check for requests and request results
var checkRequestQueues = false; //setInterval(function(){ multiRequest_CheckRequests() }, interval_Seconds_To_CheckRequestQueues * 1000);

// Start the intervals
function startIntervals()
{
    // Interval for checking all the request queues and processing them
    checkRequestQueues = setInterval(function(){ multiRequest_CheckRequests() }, interval_Seconds_To_CheckRequestQueues * 1000);
}
// clear the intervals
function stopIntervals() 
{
    clearInterval(checkRequestQueues);
    console.warn('cleared, should be false next');
    checkRequestQueues = false;
}

var debugTicks = [];
/********************Fix me now*************************************/
function getHighestTick() {
    var highestTick = 0;
    var ticks = $(".tick text");
   
    for (var i = 0; i < ticks.length; i++) {
        var theText = $(ticks[i]).text();
        debugTicks.push(theText);
        if (theText.indexOf('/') > -1 || theText.length == 0) { }
        else
        {
            
            if (theText > highestTick) {
                
                highestTick = theText
            }
        }
    }
    return highestTick;
}
function multiRequest_UpdateJobStatusUI()
{
    // Get Job IDs and Status values
    var statusHTML = "";
    
    // Lets see if there are any Jobs that don't have data in the usecase object yet.
    var jobs_Needed_InQueue = [];
    // Sometimes global_CurrentUseCaseObject is null.
    try
    {
        jobs_Needed_InQueue = get_Requests_From_UseCaseA_Object_WithMissingData(global_CurrentUseCaseObject);
    }
    catch(errGettingJobsList){}
    
    statusHTML += "Jobs needed in the queue: " + jobs_Needed_InQueue.length + "<br />";
    statusHTML += "<br />";
    for(var i = 0; i < jobs_Needed_InQueue.length; i++)
    {
        statusHTML += "Job LocalID: " + jobs_Needed_InQueue[i].LocalID;
        statusHTML += "<br />";
    }
    
    var jobCount = 0;
    
    statusHTML += "<br />";
    statusHTML += "Jobs waiting to be submitted to the server for processing.<br />";
    for(var i = 0; i < requests_Waiting_ToMake.length; i++)
    {
        jobCount += 1;
        
        statusHTML += "Job LocalID: " + requests_Waiting_ToMake[i].LocalID;
        //statusHTML += " | ";
        //statusHTML += "Job ServerID: " + requests_Waiting_ToMake[i].serverJobID;
        //statusHTML += " | ";
        //statusHTML += "Job Progress: " + requests_Waiting_ToMake[i].jobProgressValue;
        statusHTML += "<br />";
    }
    
    
    statusHTML += "<br />";
    statusHTML += "Jobs being processed by the server at this time:<br />";
    for(var i = 0; i < requests_Waiting_ForData.length; i++)
    {
        jobCount += 1;
        
        statusHTML += "Job LocalID: " + requests_Waiting_ForData[i].localJobID;
        statusHTML += " | ";
        statusHTML += "Job ServerID: " + requests_Waiting_ForData[i].serverJobID;
        statusHTML += " | ";
        statusHTML += "Job Progress: " + requests_Waiting_ForData[i].jobProgressValue;
        statusHTML += "<br />";
    }
    
    
    
    if(jobCount === 0) 
    {
        statusHTML += "<br /><br />No Jobs currently waiting for data.";
        // clearInterval(checkRequestQueues);
        
    }

    
    //$("#DEBUG_jobStatusOutput").html(statusHTML);
    $("#requestReportingStatus_Output").html(statusHTML);
}

// Function called every N time interval that checks all the queues and makes function calls based on state.
// Check Queues... Take Action...
function multiRequest_CheckRequests()
{
    //console.log("multiRequest_CheckRequests: Checking requests...");
    
    // Update the UI
    multiRequest_UpdateJobStatusUI();
    
    
    
    
    
    // Checking for data ready to recieve
    if(requests_DataReady.length === 0)
    {
        // Queue is empty, Do nothing
    }
    else
    {
        // There is at least 1 item that has data ready to be pulled from the server... do that now.
        var currentReadyJob = requests_DataReady.pop();
        
        // Make the request to get the data.
        //alert("UNCOMMENT THE NEXT LINE TO GET THE DATA THAT IS READY");
        agriserv_AJAX__getDataFromRequest(currentReadyJob.serverJobID, currentReadyJob.localJobID) ;
        
        // return once a request is made
        return;
    }
    
    
    // Checking for job progress
    if(requests_Waiting_ForData.length === 0)
    {
        // Queue is empty, Do nothing
    }
    else
    {
        // There is at least 1 item that needs to be checked for request progress.. do that now.
        //var currentRequestToCheck = requests_Waiting_ForData.pop(); //    // Remove last element
        var currentRequestToCheck = requests_Waiting_ForData.shift();       // Remove first element
        
        // Make the request to check job status.
        agriserv_AJAX__getDataRequestProgress(currentRequestToCheck.serverJobID, currentRequestToCheck.localJobID);
        
        // return once a request is made
        return;
    }
    
    // Check requests_Waiting_ToMake, if any request is found, pull it out of the array, 
    if(requests_Waiting_ToMake.length === 0)
    {
        // Queue is empty, Do nothing
    }
    else
    {
        // There is at least 1 item in the request queue.. make that request now.
        var creq = requests_Waiting_ToMake.pop();   // currentRequestToMake
        
        // Lets first see if this request already has a server job ID.
        //
        var isMakeNewRequest = recoverRequest_Checkpoint(creq);
        
        // Make the Request to ClimateSERV's API
        if(isMakeNewRequest == true)
        {
            agriserv_AJAX__Submit_New_DataRequest(creq.cservParam_datatype, creq.cservParam_operationtype, creq.cservParam_intervaltype, creq.cservParam_begintime, creq.cservParam_endtime, creq.UsePolyString, creq.cservParam_geometry, creq.cservParam_layerid, creq.cservParam_featureids, creq.LocalID);
        }
        
        // return once a request is made
        return;
    }
    
    
    // If we got this far... lets see if the requests are done.. if they aren't done, keep trying to work on the requests.
    if(global_IsNewRequestLocked == true)
    {
        // A request should be in progress of processing... check to see if the use case object is now post process ready.
        usecaseObj_MightBe_PostProcessReady_EventHandler();
    }
    
    
}

// Sometimes a job gets submitted, and before the job can return a valid status, it gets lost in the pipeline.
// These functions support job recovery.
function recoverRequest_Checkpoint(creq)
{
    if(typeof(creq.ServerJobID) === "undefined") 
    {
        // This is the first time through.. let it through.
        return true;
    }
    else
    {
        // This object already has a serverjob ID, 
        // Lets now check the counter.
        if(creq.LostRequestCounter > 3)
        {
            // Request has attempted recovery 3 times already.. 
            
            // Lets now check to see if we have already previously resubmitted the request
            if(creq.SecondChanceFlag == true)
            {
                // The request has failed submission to the server twice now,
                // Either there is something wrong with the server, the area of interest has no data, or something is wrong with the users connection.
                alert("There was a problem with this request.  Possible causes: The area of interest selected has no data, the connection between the client machine and server is down, or ClimateSERV is experiencing technical difficulties.");
                
                // Remove the processing of requests (reset part of the UI)
                usecase_UnlockRequests();
                
                // Don't let the request through.
                return false;
            }
            else
            {
                // This is the second time through, Set the flag and Let the request through.
                set_SecondChanceFlag_For_UseCaseA_Request(true, creq.ServerJobID);
                return true;
            }
        }
        else
        {
            // The request has been submitted but maybe the job status part got lost.. move this item to the other queue
            var startingProgressValue = 0.0;
            add_RequestTo_WaitingForData_Queue(creq.LocalID, creq.ServerJobID, startingProgressValue);
            
            // Increment the counter
            increment_LostRequestCounter_For_UseCaseA_Request(creq.ServerJobID);
            
            // Don't let the request through
            return false;
        }
        
        // I don't think we should ever reach this code..
        alert("Code issue...To Development staff, check all possible logic paths in the (inner) Request Recovery function.. Request Recovery function should not make it to this case.");
        return false;
    }
    
    alert("Code issue...To Development staff, check all possible logic paths in the (outer) Request Recovery function.. Request Recovery function should not make it to this case.");
    return false;
}

//set_ServerJobID_To_UseCaseA_Request(ServerJobID, LocalID)
//set_SecondChanceFlag_For_UseCaseA_Request(valueToSet, ServerJobID) 
//increment_LostRequestCounter_For_UseCaseA_Request(ServerJobID)

// Checks for requests that are ready for the queue system. 
function pull_Requests_To_QueueSystem()
{
    // Check for new requests that need to be made!
    // handle case where object is just blank (or hasn't been setup yet)
    
    // So this next section is ONLY IF global_CurrentUseCaseObject IS NOT NULL OR EMPTY..
    
    if(global_CurrentUseCaseObject === null)
    {
        // Object is not in a ready state.
        // Do nothing
    }
    else
    {
        // Check for new requests that need to be made
        var requests_WithMissingResults = get_Requests_From_UseCaseA_Object_WithMissingData(global_CurrentUseCaseObject);
        for(var i = 0; i < requests_WithMissingResults.length; i++)
        {
            // Pushes the 
            add_RequestTo_WaitingToMake_Queue(requests_WithMissingResults[i]);
            
        }
        
    }
}

// Check the ready state of the use case object (We want to know if all requests have been processed yet.)
function is_UseCaseRequestDataIn()
{
    if(global_CurrentUseCaseObject === null)
    {
        // Object is not even init yet
        return false;
    }
    var requests_WithMissingResults = get_Requests_From_UseCaseA_Object_WithMissingData(global_CurrentUseCaseObject);
    if(requests_WithMissingResults.length === 0)
    {
        // All requests should be done now..
        return true;
    }
    return false;
}

// If any of the queues are not empty
function is_RequestPipelineRunning()
{
    //[requests_Waiting_ToMake, requests_Waiting_ForData, requests_DataReady]
    if(requests_Waiting_ToMake.length > 0) { return true; }
    if(requests_Waiting_ForData.length > 0) { return true; }
    if(requests_DataReady.length > 0) { return true; }
    return false;
}

// Is the use case object ready for the post request processing of data?
function is_UseCase_Ready_For_PostProcessing()
{
    // Is the request pipeline running?
    if(is_RequestPipelineRunning() == true) { return false; }
    // Is all the requested data already loaded in the Use Case object?
    return is_UseCaseRequestDataIn(); //if(is_UseCaseRequestDataIn() == false
}

// Check pipeline and status... re-run request data at this point.
function usecaseObj_MightBe_PostProcessReady_EventHandler()
{
    if(is_UseCase_Ready_For_PostProcessing() === true)
    {
        // We are ready.. 
        //alert("ALL THE DATA SHOULD BE IN... WE ARE READY FOR POST PROCESSING.. THIS IS WHERE TO DISPLAY THE GROWING SEASONS UI ");
        
        $("#div_AgriservUI_Output").show();
        
        // This Unlocks and resets the submit UI. //global_IsNewRequestLocked = false;
        usecase_UnlockRequests();
        if (BillyZjobCount == 0) {
            stopIntervals();
            


            var maxValue = getMaxValue(global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData, global_CurrentUseCaseObject.AOIs[1].NDVIRequest.resultData.GranuleData);
            loadGraphCombinedOLD(getFormattedData(global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData), 1, false, maxValue);
            loadGraphCombinedOLD(getFormattedData(global_CurrentUseCaseObject.AOIs[1].NDVIRequest.resultData.GranuleData), 2, false, maxValue);
            try {
                $("#chartWindow1 svg").css({ 'height': '100%', 'width': '100%' });
                $("#chartWindow2 svg").css({ 'height': '100%', 'width': '100%' });

                myCharts[0].draw(0, true);
                myCharts[1].draw(0, true);

                $('#GrowingSeason_Threshold_Slider').height($(".dimple-axis")[1].getBoundingClientRect().height);
                updateLine();

            }
            catch (ex) {
                firefoxresizebugfix();
            }
            init_jQuery_GrowingSeasonThreshold_Slider(getHighestTick());
            //updateLine();
           // $("svg").height(300);
           // setTimeout(function () { $("svg").width(275); }, 250);
            refresh_ThresholdFromSlider();
            
        }
    }
    else
    {
        $("#div_AgriservUI_Output").hide();
        if(is_RequestPipelineRunning() === false)
        {
            // Maybe we have a request error.. run it again.
            pull_Requests_To_QueueSystem();
        }
    }
}

function getFormattedData(which)
{
    var output = new Array();
    for (var i in which) {
        var outputdate = which[i]['Date'];
        var value = which[i]['Value'];
        if (value < -999.00) { value = 0; }
        //value = (value * 10); 
        output[i] = [];
        output[i]['Date'] = outputdate;
        output[i]['Value'] = value;
    }
    return output;
}
function getMaxValue(set1, set2)
{
    var maxValue = 0;
    for (var i in set1) {
        if (set1[i]['Value'] > maxValue)
        {
            maxValue = set1[i]['Value'];
        }
    }
    for (var i in set2) {
        if (set2[i]['Value'] > maxValue) {
            maxValue = set2[i]['Value'];
        }
    }
   // init_jQuery_GrowingSeasonThreshold_Slider(maxValue);
    return maxValue;
}

// Default Datamodel object (blank)
var RunTime_UseCase_Data = {};
function reset_UseCase_Data()
{
    RunTime_UseCase_Data = {};
}


function makeRequests()
{
    // Fill the Requests to Process hopper
}




// UI Should allow for multiple selections




// Map Extensions
// Draw Polygon
function drawPolygon_FromPolyString(polyStringToDraw)
{
    //currentStringPolygon = JSON.stringify(output);
}

function Test__LoadObjects_ForTestData()
{
    // Load up test Areas of interest
    
}


// ////////////////////////////////   USE CASE LOGIC    ////////////////////////////////
// ////////////////////////////////   USE CASE LOGIC    ////////////////////////////////
// ////////////////////////////////   USE CASE LOGIC    ////////////////////////////////

// Make sure the user is not able to spam add requests 
var global_IsNewRequestLocked = false; 
function usecase_LockRequests()
{
    global_IsNewRequestLocked = true;
    
    // Update the UI
    $("#input_Agriserv_Submit_UseCaseA").html("<span class='ui-button-text'>Job Request in progress...</span>");
}
function usecase_UnlockRequests()
{
    global_IsNewRequestLocked = false;
    $("#input_Agriserv_Submit_UseCaseA").html("<span class='ui-button-text'>Submit Job Request</span>");
}
function usecase_AreRequestsLocked()
{
    return global_IsNewRequestLocked;
}
// Validate inputs from input section
function get_and_Validate_UseCaseA_Inputs()
{

    //input_Agriserv_Select_YearStart
    //input_Agriserv_Select_YearEnd
    
    var isValidInputs = true;
    
    // Get Years
    var year_Start = $("#input_Agriserv_Select_YearStart").val() * 1;
    var year_End = $("#input_Agriserv_Select_YearEnd").val() * 1;
    if(year_Start > year_End)
    {
        // Switch the order
        var tempYearEnd = year_End;
        year_End = year_Start;
        year_Start = tempYearEnd;
    }
    //alert(year_Start);
    //alert(year_End);
    
    // NEED SOME WAY TO GET THIS NEXT VARIABLE FROM THE UI
    //alert("get_and_Validate_UseCaseA_Inputs: HARD CODING isUsePolystring variable.. todo fix this!");
    var isUsePolystring = true;
    
    // Get Area of Interest Selections
    //alert("get_and_Validate_UseCaseA_Inputs: HARD CODING AOI SELECTIONS.. todo fix this!");
    //var aoi_1 = HCTEST_ITEMS.Input_AOI_Polygon_01;
    //var aoi_2 = HCTEST_ITEMS.Input_AOI_Polygon_02;
    var aoi_1 = global_Input_AOI_1;
    var aoi_2 = global_Input_AOI_2;
    
    // Validate Areas of interest.
    if(aoi_1 == 0) { isValidInputs = false; }
    if(aoi_2 == 0) { isValidInputs = false; }
    
    var retObject = {
        "year_Start":year_Start,
        "year_End":year_End,
        "isUsePolystring":isUsePolystring,
        "aoi_1":aoi_1,
        "aoi_2":aoi_2,
        "isValidInputs":isValidInputs
    }
    
    return retObject;
}

function run_UseCaseController_Logic()
{
    // First Check to see if new requests are locked, if so, inform user and bail out
    if(usecase_AreRequestsLocked() == true)
    {
        alert("Cannot process request at this time.  Request processing is currently in progress.");
        return;
    }
    
    // Lock the request object and Change the text on the submit button.
    usecase_LockRequests();
    // input_Agriserv_Submit_UseCaseA
    
    // Reset the UseCase object
    reset_UseCaseObj();
    
    // Get inputs
    var useCase_A_Inputs = get_and_Validate_UseCaseA_Inputs();
    
    // Are the inputs valid?
    if(useCase_A_Inputs.isValidInputs == false)
    {
        // Inputs are not valid.
        alert("Inputs are invalid, please correct the form and resubmit the request");
        usecase_UnlockRequests();
        
        // Don't process the request..
        return;
    }
    
    // Build a use case object from the inputs
    global_CurrentUseCaseObject = get_UseCase_A_Object(useCase_A_Inputs.year_Start, useCase_A_Inputs.year_End, useCase_A_Inputs.isUsePolystring, useCase_A_Inputs.aoi_1, useCase_A_Inputs.aoi_2);
    
    // Send the Requests to the queue system.
    pull_Requests_To_QueueSystem();
    
}

//alert("TODO!! - Make sure the user is not able to spam add requests (by pressing the start button over and over again... (disable that button and have the request queue empty before it is allowed to fill again))");
//alert("TODO!! - HANDLE THE FEATURE AND LAYER SELECTIONS (GET WORKING POLYGON STRINGS FIRST)");
//alert("TODO!! - MAKE UI FOR CONVERTING 2 GEOJSON FILES INTO ");
//alert("TODO!! - MAKE UI FOR STARTING THE USE CASE - 'DO PROCESSES' BUTTON ");
//alert("TODO!! - FINISH MULTIREQUEST PROCESSING CODE (SEE DIAGRAM AND STARTER FUNCTIONS) ");
//alert("TODO!! - WRITE FUNCTION TO PROCESS ALL THE RETURNED RESULTS INTO USUABLE INPUTS READY TO DRAW ");
//alert("TODO!! - GET THE OUTPUT TO DISPLAY CORRECTLY ");

var global_CurrentUseCaseObject = null;
var debug_Items = [];

// App Controls
function reset_UseCaseObj()
{
    global_CurrentUseCaseObject = null;
}



// Get the requests to make from the object
function get_Requests_From_UseCaseA_Object(usecaseA_Obj)
{
    var retRequestsList = [];
    for(var i = 0; i < usecaseA_Obj.AOIs.length; i++)
    {
        var currentAOI = usecaseA_Obj.AOIs[i];
        retRequestsList.push(currentAOI.CHIRPSRequest);
        retRequestsList.push(currentAOI.NDVIRequest);
    }
    return retRequestsList;
}

// Get Single Request from UseCaseA_Object by RequestLocalID
function get_Requests_From_UseCaseA_Object_By_LocalID(usecaseA_Obj, request_LocalID)
{
    // Get all Requests from the UseCaseA Object
    var all_Requests = get_Requests_From_UseCaseA_Object(usecaseA_Obj);
    
    // Iterate and find the one that has a matching ID.. once found, return it.
    for(var i = 0; i < all_Requests.length; i++)
    {
        var currentRequest = all_Requests[i];
        if(currentRequest.LocalID === request_LocalID)
        {
            return currentRequest;
        }
    }
}

// Get Requests that have not been completed yet.
function get_Requests_From_UseCaseA_Object_WithMissingData(usecaseA_Obj)
{
    var all_Requests = get_Requests_From_UseCaseA_Object(usecaseA_Obj);
    var retRequestsList = [];
    for(var i = 0; i < all_Requests.length; i++)
    {
        var currentRequest = all_Requests[i];
        
        // Check to see if a request has data, if it does have data, do nothing, if it does not have, add it to the return list.
        if(typeof(currentRequest.resultData) === "undefined") 
        {
            // Current request has no resultData property (so current request does not have any data)
            retRequestsList.push(currentRequest);
        }
    }
    return retRequestsList;
}


// Set a server job ID to a request 
// THIS FUNCTION BELOW CHANGES THE GLOBAL INSTANCE OF 'global_CurrentUseCaseObject'
function set_ServerJobID_To_UseCaseA_Request(ServerJobID, LocalID)
{
    // Basically, just walk through all possible request objects (by checking both types for each area of interest) and then set the ServerJobID to the one that matches the passed in localID.
    for(var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++)
    {
        
        if(global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.LocalID == LocalID)
        {
            global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID = ServerJobID;
            //global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.LostRequestCounter = 0;
        }
        if(global_CurrentUseCaseObject.AOIs[i].NDVIRequest.LocalID == LocalID)
        {
            global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID = ServerJobID;
            //global_CurrentUseCaseObject.AOIs[i].NDVIRequest.LostRequestCounter = 0;
        }
        
        //var currentAOI = usecaseA_Obj.AOIs[i];
        //retRequestsList.push(currentAOI.CHIRPSRequest);
        //retRequestsList.push(currentAOI.NDVIRequest);
    }
}
 
// 
function increment_LostRequestCounter_For_UseCaseA_Request(ServerJobID)
{
    for(var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++)
    {
        
        //if(typeof(global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID) === "undefined") { }
        //else
        //{
            if(global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID == ServerJobID)
            {
                global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.LostRequestCounter += 1;
            }
        //}
        
        //if(typeof(global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID) === "undefined") { }
        //else
        //{
            if(global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID == ServerJobID)
            {
                global_CurrentUseCaseObject.AOIs[i].NDVIRequest.LostRequestCounter += 1;
            }
        //}
    }
}
function set_SecondChanceFlag_For_UseCaseA_Request(valueToSet, ServerJobID)
{
    for(var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++)
    {
        if(global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID == ServerJobID)
        {
            global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.SecondChanceFlag = valueToSet;
        }
        if(global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID == ServerJobID)
        {
            global_CurrentUseCaseObject.AOIs[i].NDVIRequest.SecondChanceFlag = valueToSet;
        }
    }
}

// Eventually, this will need to be a pipeline to support multiple types of use cases.. 
// but for now, just using a single function of entry... gotta get the thing working first..
function process_RawData__For_UseCase_A_Object(incoming_Raw_Data_Object)
{
    // Because we can't know if this object has the props we want, and we need to make this alpha working yesterday!!
    try
    {
        var localID = incoming_Raw_Data_Object.localJobID;
        var serverJobID = incoming_Raw_Data_Object.serverJobID;
        var rawData = incoming_Raw_Data_Object.result.data;
        // Structure of rawData (Defined on the server)
        // rawData              // [] array of elements, each element is a unique date object
        // rawData[n]           // obj, structure defined on the server
        // rawData[n].date      // string, the date of this granule, M/D/YYYY or MM/D/YYYY or M/DD/YYYY or MM/DD/YYYY format (ex. "1/11/2015")
        // rawData[n].epochTime // string (int), epochtime for date, used for sorting temporally (ex. "1105423200")
        // rawData[n].workid    // string (guid), server job-worker ID (not really relavent to the clientside)  (ex. "65a93294-c2bc-4c51-8db8-c559b2871978")
        // rawData[n].value     // obj, wrapper to store the value.. sub prop has a variable name (either 'avg', 'min', or 'max'
        // rawData[n].value.VAR // float, VAR meaning, variableNamed object... choices are, 'avg', 'min', 'max', and a few others.. (avg,min,max are the 3 we will encounter).
        
        // Use the localID to figure out which operation was done.. then use that operation to look up what the 'val' component from the server would be called
        // OR.. just try each possibility until one works.. if none work... then this returned dataset is a bust!!
        
        
        // Store the granules into their own simpler array of objects
        var granuleData = [];
        for(var i = 0; i<rawData.length; i++)
        {
            var currentDate = rawData[i].date;
            var currentEpochTime = rawData[i].epochTime;

            // Get the value.. and ... inefficiently code wise but quickly.. validate the types
            // TODO! Fix this inefficiency by looking up the prop type which should be given by the operation type and comparing to a lookup / enum type object.
            var currentVal = rawData[i].value.avg;
            if(isNaN(currentVal) === true)
            {
                currentVal = rawData[i].value.max;
                if(isNaN(currentVal) === true)  {   currentVal = rawData[i].value.min;                }
            }
            
            // Filter Statement
            if(currentVal < 0)
            {
                // Throw these out.. (requested feature)
            }
            else
            {
                // Keep these if they are not 0
                var granuleObj = {
                    "Date":currentDate,
                    "EpochTime":currentEpochTime,
                    "Value":currentVal
                };
                granuleData.push(granuleObj);
            }
        }
        
        var resultData = {
            "GranuleData" : granuleData,
            "incoming_Raw_Data_Object":incoming_Raw_Data_Object
        }
        
        // attach that raw data to the usecase object associated with the localID.  // global_CurrentUseCaseObject
        // There is definitely a better way to do this.... doing it like this for speed (object's current datastructure is strictly tied to this particular solution.)
        for(var j = 0; j < global_CurrentUseCaseObject.AOIs.length; j++)
        {
            // Just checking the local job ids for a match.. once a match is found, the result data is updated.
            if(localID === global_CurrentUseCaseObject.AOIs[j].CHIRPSRequest.LocalID)
            {
                global_CurrentUseCaseObject.AOIs[j].CHIRPSRequest.resultData = resultData;
            }
            if(localID === global_CurrentUseCaseObject.AOIs[j].NDVIRequest.LocalID)
            {
                global_CurrentUseCaseObject.AOIs[j].NDVIRequest.resultData = resultData;
            }
        }
        
        
    }
    catch(errGenericResultsError)
    {
        
    }
}


// Use Case Entry point..
function get_UseCase_A_Object(input_yearStart, input_yearEnd, isUsePolystring, input_PolygonString_1, input_PolygonString_2, ndvi_Type)
{
    // Settings
    var chirps_DataType = 0;     // Datatype number for Chirps
    var chirps_IntervalType = 0; // Daily
    var chirps_Operationtype = 5; // 5 means "AVERAGE",  Min and Max are (0 and 1)
    console.warn("setting NDVI Type");
    var ndvi_DataType = ndvi_Type; //1;     // Datatype number for NDVI
    if (ndvi_DataType == null)
    {
        ndvi_DataType = 1;
    }
    console.warn("ndvi_DataType: " + ndvi_DataType);
    var ndvi_IntervalType = 0; // Daily... converted to pentadal on server
    var ndvi_Operationtype = 5; // 5 means "AVERAGE",  Min and Max are (0 and 1)
    
    
    // Inputs
    //var input_yearStart = 2001;
    //var input_yearEnd = 2008;
    //var input_PolygonString_1 = "{\"type\":\"Polygon\",\"coordinates\":[[[-10.678710937500014,13.6669921875],[-7.119140625000014,13.7548828125],[-7.163085937500014,11.1181640625],[-10.590820312500014,11.25],[-10.678710937500014,13.6669921875]]]}";     //"POLYSTRING_1_PLACEHOLDER";
    //var input_PolygonString_2 = "{\"type\":\"Polygon\",\"coordinates\":[[[-5.009765625000014,13.293457031250004],[-2.021484375000014,13.293457031250004],[-2.021484375000014,11.096191406250004],[-4.965820312500014,11.008300781250004],[-5.009765625000014,13.293457031250004]]]}";   // "POLYSTRING_2_PLACEHOLDER";
    // TODO!  DEAL WITH FEATURE SELECTIONS AND NOT JUST POLYGON STRINGS
    
    // Convert start/end years to requestable dates
    var converted_beginDate = "01/01/" + input_yearStart;
    var converted_endDate = "12/31/" + input_yearEnd;
    
    
    
    // Make all 4 request objects, AOI 1 gets a Chirps and NDVI object, AOI 2 also gets a slightly different CHIRPS and NDVI request object.
    //var AOI_1_CHIRPSRequestOBJ = make_CHIRPSRequest_Object(0, "01/01/2001", "12/31/2008", 0, 5, "APolygonJSONStringHere", 0,[]);
    var AOI_1_CHIRPSRequestOBJ = make_Request_Object(chirps_DataType, converted_beginDate, converted_endDate, chirps_IntervalType, chirps_Operationtype, isUsePolystring, input_PolygonString_1, 0, []);
    var AOI_1_NDVIRequestOBJ = make_Request_Object(theAIOTypeList[0], converted_beginDate, converted_endDate, ndvi_IntervalType, ndvi_Operationtype, isUsePolystring, input_PolygonString_1, 0, []);
    var AOI_2_CHIRPSRequestOBJ = make_Request_Object(chirps_DataType, converted_beginDate, converted_endDate, chirps_IntervalType, chirps_Operationtype, isUsePolystring, input_PolygonString_2, 0, []);
    var AOI_2_NDVIRequestOBJ = make_Request_Object(theAIOTypeList[1], converted_beginDate, converted_endDate, ndvi_IntervalType, ndvi_Operationtype, isUsePolystring, input_PolygonString_2, 0, []);
    
    
    
    // Make 2 AOI Objects and put them together in a list for making the final usecase object
    var AOIObj_1 = make_AOI_Object(input_PolygonString_1, isUsePolystring, 0, [0,1], AOI_1_CHIRPSRequestOBJ, AOI_1_NDVIRequestOBJ );
    var AOIObj_2 = make_AOI_Object(input_PolygonString_2, isUsePolystring, 0, [0,1], AOI_2_CHIRPSRequestOBJ, AOI_2_NDVIRequestOBJ );
    var AOIList = [AOIObj_1, AOIObj_2];
    
    // Make the final Starting Use Case Object
    var useCase_A_Obj = make_UseCase_A_Object(AOIList, input_yearStart, input_yearEnd);
    
    // Return the object
    return useCase_A_Obj;
}

















// ////////////////////////////////   MAP UI EXTENSIONS FUNCTION    ////////////////////////////////
// ////////////////////////////////   MAP UI EXTENSIONS FUNCTION    ////////////////////////////////
// ////////////////////////////////   MAP UI EXTENSIONS FUNCTION    ////////////////////////////////

var global_Input_AOI_1 = 0;
var global_Input_AOI_2 = 0;
var global_PolygonDrawingBuffer = 0;
var global_AOI_UseCase_Index = 0;

// Spans for displaying AOI info  span_aoi_1    span_aoi_2
// span_Draw_AOI_1, span_Draw_AOI_2, 

//Function to enable custom drawing of polygons.
function enableCustomPolygonDrawing_AgriservOverride(aoi_Index) 
{
    if (aoi_Index == 1) {
        try {
            source.removeFeature(source.getFeatureById("firstAOI"));
        }
        catch (e) { }
    }
    else if
    (aoi_Index == 2) {
        try {
            source.removeFeature(source.getFeatureById("secondAOI"));
        }
        catch (e) { }
    }
    global_AOI_UseCase_Index = aoi_Index;
    //alert(global_AOI_UseCase_Index);
    if (clickEnabled === true) 
    {
        disableFeatureSelection();
    }
    map.addInteraction(draw);
}

function update_Selected_Poly_String_UI()
{
    $("#span_aoi_1").html(global_Input_AOI_1);
    $("#span_aoi_2").html(global_Input_AOI_2);
}

function set_UseCase_AOI_FromPolygonDrawing()
{
    // Mapping the Global AOI UseCase Index to the correct AOI Use Case Input
    if(global_AOI_UseCase_Index == 1)
    {
       
        global_Input_AOI_1 = global_PolygonDrawingBuffer;
        
    }
    else if(global_AOI_UseCase_Index == 2)
    {
       
        global_Input_AOI_2 = global_PolygonDrawingBuffer;
        
    }
    
    // Update the UI
    update_Selected_Poly_String_UI();
}

// Callback for when the vector layer changes
function init_VectorLayer_Change_Callback()
{
    source.on("change", function (e) 
    {
        // Legacy compatible
        if (global_AOI_UseCase_Index == 0)
        {
            return;
        }
    });
}

// ////////////////////////////////   GROWING SEASON OBJECTS    ////////////////////////////////////
// ////////////////////////////////   GROWING SEASON OBJECTS    ////////////////////////////////////
// ////////////////////////////////   GROWING SEASON OBJECTS    ////////////////////////////////////

function make_GrowingSeason_Object(NDVI_Granules, CHIRPS_Granules, Earliest_Date, Latest_Date, Length_Days)
{
    var gsObj = {
        "NDVI_Granules" : NDVI_Granules,        // Array of DateValue Granules for NDVI data (Usually Pentadal)
        "CHIRPS_Granules":CHIRPS_Granules,      // Array of DateValue Granules for CHIRPS data (Usually Daily)
        "Earliest_Date" : Earliest_Date,
        "Latest_Date" : Latest_Date,
        "Length_Days" : Length_Days
    };
    return gsObj;
}
function make_DateValue_Granule(dateString, val)
{
    var dateValObj = {
        "dateString" : dateString,
        "val": val
    };
    return dateValObj;
}


// Helper to quickly get a Javascript Date Object from an EpochTime float
function get_JS_DateFrom_EpochTime(epochTimeValue)
{
    var retDate = new Date(0);
    retDate.setUTCSeconds(epochTimeValue);
    return retDate;
}


//
//
//
var debug_GrowingSeasons = [];
var csvRows_Current_GrowingSeasonData = [];
var csvRows_Current_GrowingSeasonSummaryData = [];

// Get Growing Seasons Summary data as CSV file
function get_GrowingSeasons_Summary_Output_As_CSV()
{
    var csvOutputString = "";
    for(var i = 0; i < csvRows_Current_GrowingSeasonSummaryData.length; i++)
    {
        csvOutputString += csvRows_Current_GrowingSeasonSummaryData[i];
        csvOutputString += "\n";
    }
    //downloadTextFile(theUniqueID+".csv", outputstring)
    downloadTextFile("Agriserv_GrowingSeason_Summary_Data.csv", csvOutputString);     // Depends on 'servirnasa.js'
}

// Get Growing Seasons Output as CSV file
function get_GrowingSeasonsOutput_As_CSV()
{
    var csvOutputString = "";
    for(var i = 0; i < csvRows_Current_GrowingSeasonData.length; i++)
    {
        csvOutputString += csvRows_Current_GrowingSeasonData[i];
        csvOutputString += "\n";
    }
    //downloadTextFile(theUniqueID+".csv", outputstring)
    downloadTextFile("Agriserv_GrowingSeason_RawData.csv", csvOutputString);     // Depends on 'servirnasa.js'
}

// Updates the GrowingSeasons UI Panel (Stats and Table) with the data passed into it
// This function shows the expected growing seasons high level data and detail level data for each growing season list.
//function update_GrowingSeasons_UI(data_GrowingSeasons)
function update_GrowingSeasons_UI(data_AOI_GrowingSeasons)
{
    debug_GrowingSeasons.push(data_AOI_GrowingSeasons);
    
    // Holding these for CSV Output
    var rowsOfData = [];
    var csv_HeaderString = "AOI,GrowingSeason,NDVI_Date,NDVI_Value,CHIRPS_Date,CHIRPS_Value";
    rowsOfData.push(csv_HeaderString);
    
    var currentThresholdValue = $("#GrowingSeason_Threshold_Slider").slider("value");
    
    // Refactor for GrowingSeason Summary - CSV Setup
    var summary_Rows = [];
    var summary_CSV_HeaderString = "AOI_ID,GS_ID,Year,GrowingSeason_Length_Days,NDVI_Threshold,Sum_Of_Avg_CHIRPS_Rainfall";
    summary_Rows.push(summary_CSV_HeaderString);
    // Refactor for GrowingSeason Summary - HTML Output
    var summaryHTML = "";
    summaryHTML += "<br />";
    summaryHTML += "Selected NDVI Threshold: " + currentThresholdValue;
    summaryHTML += "<br />";
    
    // Rough Draft - Just seperating out and recollating the relavent data in the way that it needs to be displayed.
    var roughHTML = "";
    roughHTML += "<br/><hr /><br />";
    
   // $("#growingSeasonsTable").append("<tr><td>" + theYear + "</td><td>" + theDays + "</td><td>" + theRainfall + "</td><td>" + theThreshold + "</td></tr>");
    $("#growingSeasonsTable0").find("tr:gt(0)").remove();
    $("#growingSeasonsTable1").find("tr:gt(0)").remove();
    // For each Area of interest..
    for(var i = 0; i<data_AOI_GrowingSeasons.length; i++)
    {
        // Inside the Area of interest.
        var current_AreaOfInterest_Title = "Area of Interest: " + i;
        var current_GrowingSeasons_List = data_AOI_GrowingSeasons[i].GrowingSeasons;
        
        // Refactor for GrowingSeason Summary - New Output HTML
        var growingSeason_SummaryHTML = "";
        
        
        
        var growingSeason_RoughHTML = "";
        for(var j = 0; j<current_GrowingSeasons_List.length; j++)
        {
            var theYear;
            var theDays;
            var theRainfall;
            var theThreshold = currentThresholdValue;
            var theAOI = i;
            
            
            var current_GrowingSeason = current_GrowingSeasons_List[j];
            var current_GS_StartDate = current_GrowingSeason.Start_Date_String;
            var current_GS_EndDate = current_GrowingSeason.End_Date_String;
            var current_GS_NDVIGranules = current_GrowingSeason.NDVI_Granules;
            var current_GS_CHIRPSGranules = current_GrowingSeason.CHIRPS_Granules;
            
            // Get the number of days between
            var d1 = new Date(0);
            d1.setUTCSeconds(current_GrowingSeason.Start_EpochTime);
            var d2 = new Date(0);
            d2.setUTCSeconds(current_GrowingSeason.End_EpochTime);
            var timeDiff = Math.abs(d2.getTime() - d1.getTime());
            var numOfDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            
            theYear = d1.getFullYear();
            theDays = numOfDays;
            
            
            // Refactor for GrowingSeason Summary - New CSV Out
            var summaryCSV_RowBuilder = "";
            // Refactor for GrowingSeason Summary - Get, AOI_ID, GS_ID, Year, length in days, threshold value Data
            growingSeason_SummaryHTML += "<br />";
            growingSeason_SummaryHTML += "Area Of Interest ID: " + (i + 1).toString() + "<br />";
            growingSeason_SummaryHTML += "GrowingSeason ID: " + (i + 1).toString() + "_" + (j + 1).toString() + "<br />";
            growingSeason_SummaryHTML += "Year: " + d1.getFullYear() + "<br />";
            growingSeason_SummaryHTML += "Number of Days in Growing Season: " + numOfDays + "<br />";
            growingSeason_SummaryHTML += "Current NDVI Threshold: " + currentThresholdValue + "<br />";
            summaryCSV_RowBuilder += (i + 1).toString();   // AOI_ID
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += (i + 1).toString() + "_" + (j + 1).toString();   // GS_ID
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += d1.getFullYear().toString();   // Year
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += numOfDays.toString();   // GrowingSeason_Length_Days
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += currentThresholdValue;   // NDVI_Threshold
            summaryCSV_RowBuilder += ",";
            
            // Refactor for GrowingSeason Summary - Recording CHIRPS Rainfall Value Totals 
            // Sum_Of_Avg_CHIRPS_Rainfall
            var chirpsRainfall_Value_OverRange_Total = 0;
            
            growingSeason_RoughHTML += "<br />";
            growingSeason_RoughHTML += "<fieldset><legend>AOI: " +i+ ", Growing Season: "+j+"</legend>";
            growingSeason_RoughHTML += "Growing Season: " + j + "<br />";
            growingSeason_RoughHTML += "Start Date: " + current_GS_StartDate + "<br />";
            growingSeason_RoughHTML += "End Date: " + current_GS_EndDate + "<br />";
            growingSeason_RoughHTML += "Number of Days in Growing Season: " + numOfDays + "<br />";
            
            // Iterate through all NDVI Granules
            for(var k = 0; k < current_GS_NDVIGranules.length; k++)
            {
                var current_GS_NDVIGranule = current_GS_NDVIGranules[k];
                var date_NDVI = new Date(0);
                date_NDVI.setUTCSeconds(current_GS_NDVIGranule.EpochTime);
                growingSeason_RoughHTML += "NDVI Date: " + date_NDVI.getFullYear() + "/" + (date_NDVI.getMonth() + 1) + "/" + date_NDVI.getDate() + "  Value:  " + current_GS_NDVIGranule.Value;
                growingSeason_RoughHTML += "<br />";
                
                // Next task is to get associated CHIRPS data points.
                
                // We need a time limit so we don't just dump ALL CHIRPS granules with this currently associated NDVI Granule.
                var startEpochTime_Limit_ForCHIRPS = current_GS_NDVIGranule.EpochTime;
                var endEpochTime_Limit_ForCHIRPS = current_GrowingSeason.End_EpochTime;
                
                // If we aren't at the last item, use the Next NDVI Point's Epoch time as our limite
                if(k < current_GS_NDVIGranules.length - 1)
                {
                    endEpochTime_Limit_ForCHIRPS = current_GS_NDVIGranules[k+1].EpochTime;
                }
                
                // Now loop through the CHIRPS Granules and dump all the items which fall within the EPOCH time range we need.
                for(var n = 0; n < current_GS_CHIRPSGranules.length; n++)
                {
                    var current_CHIRPS_Granule = current_GS_CHIRPSGranules[n];
                    var current_CHIRPS_Granule_EpochTime = current_CHIRPS_Granule.EpochTime;
                    
                    // Need the chirps granules that are within the current range. (Inclduing start time, excluding end time)
                    if(current_CHIRPS_Granule_EpochTime >= startEpochTime_Limit_ForCHIRPS)
                    {
                        if(current_CHIRPS_Granule_EpochTime < endEpochTime_Limit_ForCHIRPS)
                        {
                            var date_CHIRPS = new Date(0);
                            date_CHIRPS.setUTCSeconds(current_CHIRPS_Granule.EpochTime);
                            growingSeason_RoughHTML += "CHIRPS Date: " + date_CHIRPS.getFullYear() + "/" + (date_CHIRPS.getMonth() + 1) + "/" + date_CHIRPS.getDate() + "  Value:  " + current_CHIRPS_Granule.Value;
                            growingSeason_RoughHTML += "<br />";
                            
                            // For CSV
                            var csv_NDVI_DateString = date_NDVI.getFullYear() + "/" + (date_NDVI.getMonth() + 1) + "/" + date_NDVI.getDate();
                            var csv_CHIRPS_DateString = date_CHIRPS.getFullYear() + "/" + (date_CHIRPS.getMonth() + 1) + "/" + date_CHIRPS.getDate();
                            // Headers:  "AOI,GrowingSeason,NDVI_Date,NDVI_Value,CHIRPS_Date,CHIRPS_Value";
                            var csvString = i + "," + i + "_" + j + "," + csv_NDVI_DateString + "," + current_GS_NDVIGranule.Value + "," + csv_CHIRPS_DateString + "," + current_CHIRPS_Granule.Value;
                            rowsOfData.push(csvString);
                            
                            // Refactor for GrowingSeason Summary - Recording CHIRPS Rainfall Value Totals 
                            chirpsRainfall_Value_OverRange_Total = chirpsRainfall_Value_OverRange_Total + current_CHIRPS_Granule.Value;
                        }
                        // If the array is sorted, we can do this for efficiency // because at this point, we would have already collected all the chirps granules we need.
                        //else{ break; }
                    }
                }

            }
            
            // Next walk through NDVI Data and CHIRPS data.. make the table list of values (date:Value)
            // NDVI Covers 5 days per data point so it will look something like this
            //  
            // NDVI Date/Value
            // CHIRPS Date/Value (Same Date as NDVI Date)
            // CHIRPS Date/Value
            // CHIRPS Date/Value
            // CHIRPS Date/Value
            // CHIRPS Date/Value
            // NDVI Date/Value
            // 5 CHIRPS Date/Values 
            // ...
            // Repeat till last NDVI Date and only single Chirps Date value.
            
            theRainfall = chirpsRainfall_Value_OverRange_Total;

            $("#growingSeasonsTable" + i).append("<tr><td>" + theYear + "</td><td>" + theDays + "</td><td>" + theRainfall + "</td><td>" + theThreshold + "</td><td>" + theAOI + "</td></tr>");
            // Walk through all of the NDVI data and CHIRPS data.. place in a combined list... Keep track of which Source the data came from... Sort it by EpochTime, then just output it.. all of it!
            //alert("STOPPED HERE... DURING OUTPUT PROCESSING");
            
            
            // Get the Date for the Epoch Time
            //var currentNDVI_Granule = current_GrowingSeasons_List[j].
            
            growingSeason_RoughHTML += "</fieldset><br />";
            growingSeason_RoughHTML += "<br />";
            
            
            // Refactor for GrowingSeason Summary - Recording CHIRPS Rainfall Value Totals 
            growingSeason_SummaryHTML += "Sum of CHIRPS Rainfall Averages over Growing Season: " + chirpsRainfall_Value_OverRange_Total + "<br />";
            summaryCSV_RowBuilder += chirpsRainfall_Value_OverRange_Total;   // Sum_Of_Avg_CHIRPS_Rainfall 
            // Refactor for GrowingSeason Summary - New CSV Out
            summary_Rows.push(summaryCSV_RowBuilder);
        }
        
        
        // Refactor for GrowingSeason Summary - Output some HTML
        summaryHTML += growingSeason_SummaryHTML;
        
        
        // Output some HTML
        roughHTML += current_AreaOfInterest_Title;
        roughHTML += "<br />";
        roughHTML += growingSeason_RoughHTML;
        roughHTML += "<br />";
        roughHTML += "<br/><hr /><br />";
    }
    
    var allHTML_Out = "";
    allHTML_Out += "<br />Summary Growing Seasons Data Out: <br />";
    allHTML_Out += summaryHTML;
    allHTML_Out += "<br /><hr /><br />";
    allHTML_Out += "<br />Raw Data Out: <br />"
    allHTML_Out += roughHTML;
    
    $("#GrowingSeasons_Output_Container").html(allHTML_Out);
    //$("#GrowingSeasons_Output_Container").html(roughHTML);
    
    
    // Store the CSV Output
    csvRows_Current_GrowingSeasonSummaryData = summary_Rows;
    csvRows_Current_GrowingSeasonData = rowsOfData;
    
    //var rowsOfData = [];

    
    //var utcSeconds = 1119675600;
    //var d = new Date(0);
    //d.setUTCSeconds(utcSeconds);
    //d.getYear();
    //d.getDate();
    //d.getMonth() + 1;
    
    //alert("TODO!!  BUILD OUTPUT UI TABLE.. AND WRITE FUNCTIONS FOR DISPLAYING THE DATA FROM GROWING SEASONS...");
    //$("#GrowingSeasons_Output_Container").html("TODO!!  BUILD OUTPUT UI TABLE.. AND WRITE FUNCTIONS FOR DISPLAYING THE DATA FROM GROWING SEASONS...");
    
}

// Controller Pipeline for Handling Generation of Growing Seasons   // Epoch Time values are force converted to integers (using * 1)
function recalculate_GrowingSeasons(NDVI_BottomThreshold, NDVI_FilteredData, CHIRPS_FilteredData)
{
    // Sort NDVI_FilteredData temporally (Earliest date to latest date)
    // Iterate through all the NDVI filtered raw data temporally (from earliest to latest).
    // When the threshold value is reached (or exceeded), start 'recording' NDVI data to create a new GrowingSeason Object
    // Only 'record' current growing season data while the threshold is still being exceeded.
    // Once the NDVI data drops below the threshold, finalize the growing season object and add it to the main 'GrowingSeasons' array.
    // Keep iterating the NDVI dataset and repeat the above process each time the threshold is exceeded.
    
    // Object to hold all the growing seasons as we iterate through the data.
    var retGrowingSeasons = [];
    
    // Are we currently above a threshold?
    var isCurrentlyAboveThreshold = false;
    
    // Reusable Data items for a single growing season
    var reusableGrowingSeasonData = [];
    var growingSeason_Start_DateString = "";
    var growingSeason_Start_EpochTime = "";
    var growingSeason_End_DateString = "";
    var growingSeason_End_EpochTime = "";
    
    
    
    
    
    // Iterate temporally through each NDVI Filtered Data Granule
    for(var i = 0; i < NDVI_FilteredData.length; i++)
    {
        // Current Granule Value
        var current_NDVI_Value = NDVI_FilteredData[i].Value;
        
        // Is the current value above or equal to the threshold?  
        if(current_NDVI_Value >= NDVI_BottomThreshold)
        {
            // Regardless of which growing season we are in, start recording
            reusableGrowingSeasonData.push(NDVI_FilteredData[i]);
            
            // Were we already above the threshold?
            if(isCurrentlyAboveThreshold == false)
            {
                //console.log("This data point IS part of a growing season, and IS the FIRST Point in a NEW Growing Season.");
                
                // This is a new Growing Season!
                isCurrentlyAboveThreshold = true;
                
                // Record the start date and time
                growingSeason_Start_EpochTime = (NDVI_FilteredData[i].EpochTime * 1);
                growingSeason_Start_DateString = NDVI_FilteredData[i].Date;
                 
                
                
            }
            else
            {
                // We were already in the current growing season... just add data to it in here
                //console.log("This data point IS part of a growing season");
            }
        }
        else
        {
            // Were we in a growing season on the last datapoint?
            if(isCurrentlyAboveThreshold == true)
            {
                //console.log("This data point is NOT part of a growing season, HOWEVER, This is the first data point AFTER the last datapoint in a growing season. ");
                
                // We are no longer in the growing season... Finalize it and add the obj/array to the growing seasons collection
                isCurrentlyAboveThreshold = false;
                
                // Finalize the Growing season (Walk CHIRPS array in here), Gather date ranges, etc etc.
                
                // Bug/Condition Catching.
                // IN THE EVENT THAT THE THRESHOLD WAS SET TOO LOW (SO THAT ALL THE DATA FALLS IN A SINGLE GROWING SEASON),
                // // NEED TO RUN THIS PART OF THE CODE AT THE END OF THE LOOP... SO TIME TO BREAK THIS OUT TO IT'S OWN FUNCTION AND CALL IT IN THOSE TWO PLACES.
                 
                // Record the End Date and Time
                growingSeason_End_EpochTime = (reusableGrowingSeasonData[reusableGrowingSeasonData.length - 1].EpochTime * 1);
                growingSeason_End_DateString = reusableGrowingSeasonData[reusableGrowingSeasonData.length - 1].Date;
                
                
                // Walk through all Chirps Granules and keep the ones that are within the start/end EpochTime range
                var related_ChirpsGranules = [];
                for(var j = 0; j < CHIRPS_FilteredData.length; j++)
                {
                    var currentCHIRPS_Granule = CHIRPS_FilteredData[j];
                    if((currentCHIRPS_Granule.EpochTime * 1) >= growingSeason_Start_EpochTime)
                    {
                        if((currentCHIRPS_Granule.EpochTime * 1) <= growingSeason_End_EpochTime)
                        {
                            related_ChirpsGranules.push(currentCHIRPS_Granule);
                        }
                    }
                }
                
                // Store the growing season and all it's members... and push to the global array
                var growingSeasonObj = {
                    "Start_Date_String":growingSeason_Start_DateString,
                    "End_Date_String":growingSeason_End_DateString,
                    "Start_EpochTime":growingSeason_Start_EpochTime,
                    "End_EpochTime":growingSeason_End_EpochTime,
                    "NDVI_Granules":reusableGrowingSeasonData,
                    "CHIRPS_Granules":related_ChirpsGranules  
                };
                
                retGrowingSeasons.push(growingSeasonObj);
                
                // Last step.. Reset all the variables and blank out the array for the next use!
                reusableGrowingSeasonData = [];
                growingSeason_Start_DateString = "";
                growingSeason_Start_EpochTime = "";
                growingSeason_End_DateString = "";
                growingSeason_End_EpochTime = "";
            }
            else
            {
                //console.log("This data point is NOT part of a growing season, and the last datapoint was not either..");
                
                // We were not in a growing season in the last data point... and we still aren't now (outter if statement) 
                // Do nothing with this data point.
            }
        }
        
    }
    
    // Return the Growing Seasons list
    return retGrowingSeasons;
}
var sliderValue;
// Handler for Slider Change
function GrowingSeason_Threshold_Slider_Changed() {
    var newThresholdValue = $("#GrowingSeason_Threshold_Slider").slider("value");
    select_NDVIBottomThreshold_Changed(newThresholdValue);
    if ($(".ui-slider-handle").length > 0) {
        updateLine();
    }
}


// Handler for threshold value changing
function select_NDVIBottomThreshold_Changed(newThresholdValue)
{
    if ($(".ui-slider-handle").length > 0) {
        updateLine();
    }
    // Make a Growing Seasons list for each Area of Interest
    var areaOfInterest_GrowingSeasons_List = [];
    
    // global_CurrentUseCaseObject.AOIs[j].CHIRPSRequest.resultData
    for(var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++)
    {
        var currentAOI = global_CurrentUseCaseObject.AOIs[i];
        var currentNDVI_Granules = global_CurrentUseCaseObject.AOIs[i].NDVIRequest.resultData.GranuleData;
        var currentCHIRPS_Granules = global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.resultData.GranuleData;
        
        // Recalculate the growing seasons data for each area of interest
        var growingSeasons = recalculate_GrowingSeasons(newThresholdValue, currentNDVI_Granules, currentCHIRPS_Granules);
        
        var aoi_GrowingSeason_Obj = {
            "AOI_Data":currentAOI,
            "GrowingSeasons":growingSeasons
        };
        
        areaOfInterest_GrowingSeasons_List.push(aoi_GrowingSeason_Obj);
    }

    // Update the UI
    update_GrowingSeasons_UI(areaOfInterest_GrowingSeasons_List);
    
    
    
    /*
    // Recalculate the Growing Seasons data
    //var theNDVI_FilteredData = //TODO! GET THIS DATA FROM THE GLOBAL OBJECT THAT HOLDS FILTERED RESULTS.. [];  // 
    //var growingSeasons = recalculate_GrowingSeasons(newThresholdValue, theNDVI_FilteredData, theCHIRPS_FilteredData);
    var growingSeasons = recalculate_GrowingSeasons(newThresholdValue, [], []);
    
    // Update the growing seasons output UI
    //update_GrowingSeasons_UI(growingSeasons); 
    alert("MAKE A CHANGE TO THIS... THE OUTPUT UI NEEDS TO BE ABLE TO HANDLE MULTIPLE AREAS OF INTEREST.. NOT JUST 1");
    update_GrowingSeasons_UI(growingSeasons);
    */
}


// ////////////////////////////////   AJAX TO CSERV API FUNCTIONS    ///////////////////////////////
// ////////////////////////////////   AJAX TO CSERV API FUNCTIONS    ///////////////////////////////
// ////////////////////////////////   AJAX TO CSERV API FUNCTIONS    ///////////////////////////////


// MultiRequest_Component - submit_New_DataRequest
// -Reusable Function to make the requests for submitting new datajobs to cserv (Takes all the params it needs)
function agriserv_AJAX__Submit_New_DataRequest(dataTypeValue, operationValue, dateintervalValue, dateBeginValue, dateEndValue, isUsePolystring, polygonString, layerid, featureids, localJobID)
{
    
    var req_Data = 
    {
        'datatype':dataTypeValue,
        'begintime':dateBeginValue,
        'endtime':dateEndValue,
        'intervaltype':dateintervalValue,
        'operationtype':operationValue
        
        // New Params
        //'dateType_Category':dateType_Category,
        //'isZip_CurrentDataType':isZip_CurrentDataType       // This one will mostlikely get renamed when we actually hook up the zipping capabilities
    };
    
    // Are we using polygon strings, or feature selections
    if(isUsePolystring == true)
    {
        // We are using the polygon string
        req_Data['geometry'] = polygonString;
    }
    else
    {
        // We are using the layer and feature ids
        req_Data['layerid'] = layerid; //layerIds[selectedLayer];
        req_Data['featureids'] = featureids; //selectedFeatures.join()
    }
    
    
    // Make the request, set up the handlers (pass the info we need into it)
    $.ajax(
    {   
        url: baserequesturl+'submitDataRequest/?callback=?',
        type: "post",       
        data: req_Data,
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
            // Also.. Connect the local JobID to the queue
            // localJobID

            // This code used to take the 'uniqueid' (which is the server job id) and process it (goes into a queue to check status)
            var serverJobID = result[0];
            
            // Starting Job Progress Value
            var startingProgressValue = 0.0;

            // Items to store in the 'requests_Waiting_ForData' area
            add_RequestTo_WaitingForData_Queue(localJobID, serverJobID, startingProgressValue);

            // This code used to take the 'uniqueid' (which is the server job id) and process it (goes into a queue to check status)
            //uniqueid = result[0];
            //$("#progressbar").progressbar({value:0});
            //$("#progresslabel").text("Processing..."+0+"%");
            //$("#requestId").html(get_ProgressBarID_HTML(uniqueid));
            //hide_DownloadFileLink();    // Hide the download file link before showing the progress dialog box.
            //$("#progressdialog").dialog();

            //startTimer(getDataRequestProgress);   // Start a timer to check for progress.

        },
        error: function (request,error) 
        {
            try
            {
                console.log("Agriserv, Submit New Data Request: Got an error when communicating with the server.  Error Message: " + error);
            }
            catch(exErr){}
        
        }, 
        successCallback:function()
        {

        }
    });

}
var BillyZjobProgressResponse;
var BillyZjobCount;
//Query the server to check the progress of Data Request that has been submitted.
function agriserv_AJAX__getDataRequestProgress(serverJobID, localJobID) 
{
    
    var req_Data = {'id':serverJobID};
    
    $.ajax(
    {
        url: baserequesturl+'getDataRequestProgress/?callback=?',
        type: "post",       
        data: req_Data,
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
            // Check the job progress in the response, 
            var jobProgressResponse = result[0];
            BillyZjobProgressResponse = jobProgressResponse;

            var jobCount = requests_Waiting_ToMake.length;
            BillyZjobCount = jobCount;
            if (jobProgressResponse === -1) 
            {
                // The server could not process this job and is reporting back an error.
                try
                {
                    console.log("Agriserv, Check Job Status: The server encountered an error while processing this job. ");
                }
                catch(ex){}
                // For now.. nothing will happen, job just gets lost in the noise.
                // Here is what should happen in a non alpha version of this,
                // The entire request gets made again (Back to the step of 'agriserv_AJAX__Submit_New_DataRequest'
            }
            else if (jobProgressResponse === 100)
            {
                // Job is done processing... ready for data.. add to the DataReady queue
                if (jobCount == 0)
                {
                    updateProgressBar(100);
                    /******************Hides debug form***********************/
                    //toggleForm();
                    setTimeout(function () { $("#myProgress").hide(); }, 1000);
                    
                }
                add_RequestTo_DataReady_Queue(localJobID, serverJobID);
                
            }
            else
            {
                var theNum;
                if (jobCount == 1)
                {
                    theNum = Math.floor((jobProgressResponse * .25) + (50 * 1));
                    updateProgressBar(theNum);
                    console.log("Job Count: " + jobCount + " - Progress: " + theNum);
                }
                else if (jobCount == 2)
                {
                    theNum = Math.floor((jobProgressResponse * .25) + (25 * 1));
                    updateProgressBar(theNum);
                    console.log("Job Count: " + jobCount + " - Progress: " + theNum);
                }
                else if (jobCount == 3) {
                    theNum = Math.floor((jobProgressResponse * .25));
                    updateProgressBar(theNum);
                    console.log("Job Count: " + jobCount + " - Progress: " + theNum);
                }
                else {
                    theNum = Math.floor((jobProgressResponse * .25) + (75 * 1));
                    updateProgressBar(theNum);
                    console.log("Job Count: " + jobCount + " - Progress: " + theNum);
                }
                // Job is still being processed.. add back to the queue with the new progress value
                add_RequestTo_WaitingForData_Queue(localJobID, serverJobID, jobProgressResponse);
            }
            
            
            
        },
        error: function (request,error) 
        {
            try 
            {
                console.log("Agriserv, Check Job Status: Got an error when communicating with the server.  Error Message: " + error);
            }
            catch(exerrr){}
            // What do here?
            // Put the object back in the queue so it tries again?.. if so, then this loop may run forever unless we have a way to track attempts made.
            // Do nothing?  That would mean the request gets lost..
            
            //stopTimer();
            //$("#progresslabel").text("There has been an error in submitting your request please try again later");
            //$("#progressdialog").dialog();
        }, 
        successCallback: function ()
        {

        }
    });
}

// Get the raw data from the submitted request and send it to another function for routing and processing.
function agriserv_AJAX__getDataFromRequest(serverJobID, localJobID)  
{
    //alert("I STOPPED RIGHT HERE... NEED TO FINISH ROUTING THE GET DATA REQUEST AND MOVE THE THING TO THE NEXT QUEUE")
    
    var req_Data = {'id':serverJobID}
    $.ajax(
    {
        url: baserequesturl+'getDataFromRequest/?callback=?',
        type: "post",       
        data: req_Data,
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
            var resultObj = {
                "serverJobID":serverJobID,
                "localJobID":localJobID,
                "result":result,
            };
            
            //debug_RawData.push(resultObj);
            
            //alert("TODO!! CONNECT RESULT DATA WITH USE CASE PROCESSING FUNCTION (localJobID) (USE LOCALID TO LOOK UP THE OBJECT THAT THE DATA SHOULD BE ATTACHED TO) ")
            
            // Sending the raw data for processing
            process_RawData__For_UseCase_A_Object(resultObj);
            
            
            
            // At this point, all the data should be in place... lets check and see if this was the last one..
            if(is_RequestPipelineRunning() === false)
            {
                // Pipeline appears to be done... is all the data in it's place?
                //setTimeout(function(){usecaseObj_MightBe_PostProcessReady_EventHandler();}, 2000);
                try
                {
                    console.log("1 of the datasets have been processed and pushed to the usecase object");
                }
                catch(exErrrPipelineReport){}
                
            }
            
            // Original code
            // if ($("#progressdialog").is(':data(dialog)'))             {                $("#progressdialog").dialog("close");            }
             processIncomingData(result);
        },
        error: function (request,error) 
        {
            try
            {
                console.log("Agriserv, Get data from Request: Got an error when communicating with the server.  Error Message: " + error);
            }
            catch(exErrAjax_ErrorReporting) {}
            // What to do here?
            // Put the object back in the queue so it tries again?.. if so, then this loop may run forever unless we have a way to track attempts made.
            // Do nothing?  That would mean the request gets lost..

        }, 
        successCallback:function()
        {

        }
    });
}

//var debug_RawData = [];

// This section is about storing and recovering jobs that have already been submitted to the server may have been lost in the requests.

// Store the session local IDs and Server Job IDs whenever they are obtained.
var global_ServerJobsSubmitted = [];

// When about to submit a job, check to see if there is a valid server ID
function recover_Job_BeforeResubmit_Controller()
{
    
}







// ////////////////////////////////   JQUERY INIT AND OTHER UI    ////////////////////////////////
// ////////////////////////////////   JQUERY INIT AND OTHER UI    ////////////////////////////////
// ////////////////////////////////   JQUERY INIT AND OTHER UI    ////////////////////////////////

// Inputs UI Section

/*
// GeoJSON Loader
function init_GeoJSON_DropZones()
{
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}
//Function to handle drag and drop.
function handleDragOver(evt) 
{
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}
//If a user wants to load a GeoJSON file this handles the file selection.
function handleFileSelect(evt) 
{
    evt.stopPropagation();
    evt.preventDefault();

    var f = evt.dataTransfer.files[0]; // FileList object.

    // files is a FileList of File objects. List some properties.

    var reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function (f) 
    {
        return function (e) 
        {
            setPolygonWithGeoJSON(e.target.result);
            $("#loadGeoJsonDialog").dialog("close");
        };
    })(f);
    reader.readAsText(f);
}
*/



// Get and Validate Inputs from UI
function submit_UseCaseA_Input_EventHandler()
{
    if (checkRequestQueues == false)
    {
        startIntervals();
    }
    run_UseCaseController_Logic();
    
}

// For Submitting the User Input for UseCaseA
function init_jQuery_SubmitUseCaseA_Button()
{
    $( "#input_Agriserv_Submit_UseCaseA" ).button()
        .click(function( event ) 
        {
            event.preventDefault();
            submit_UseCaseA_Input_EventHandler();
        });
    // $("#input_Agriserv_Submit_UseCaseA").prop("disabled",true);
    // $("#input_Agriserv_Submit_UseCaseA").prop("disabled",false);
}

// Data is loaded section

// When User Changes the Slider
function refresh_ThresholdFromSlider()
{
    var threshhold_Value = ( $("#GrowingSeason_Threshold_Slider").slider("value") * 1);
    select_NDVIBottomThreshold_Changed(threshhold_Value);
    if ($(".ui-slider-handle").length > 0) {
        updateLine();
    }
}
function updateLine()
{
    $("#scaleLine").offset({ top: $(".ui-slider-handle").offset().top +10, left: $("#scaleLine").offset().left });
}
// Growing Season Threshold Slider
function init_jQuery_GrowingSeasonThreshold_Slider(maxValue)
{
    $( "#GrowingSeason_Threshold_Slider" ).slider({
        min: 0,
        max: maxValue,
        value: 0.5,
        step: 0.01,
        orientation: "vertical",
        change: refresh_ThresholdFromSlider,
        slide: updateLine
    });
    updateLine();
}

//function init_jQuery_SideAgriservMenu()
//{
//    $("ul#left_Side_AgriservUI").sidebar(
//    {
//        position:"left",
//        height:"1000px",
//        open:"click"
//    });
//}
function init_AgriservUI_Dialog()
{
    // Dialog Box for Agriserv inputs
    $("#AgriservUI_Dialog").dialog(
    {
        position : [0, 50]
    });
    
    // Submit button for UseCaseA
    init_jQuery_SubmitUseCaseA_Button();
}

// UI Elements (jQuery UI)
$(document).ready(function()
{
    // Area of Interest Radio Buttons
    $( "#radio_AOIs" ).buttonset();
    //alert(1);
    
    // Init Agriserv UI 
    //init_AgriservUI_Dialog();
    
    // Init the UI Sidebar
    //init_jQuery_SideAgriservMenu();
    
    // Start all the intervals
    startIntervals();
    
    // Change the Threshold on Growing Seasons
    //init_jQuery_GrowingSeasonThreshold_Slider();

    // Setup event handler for vector layer changed callback
    init_VectorLayer_Change_Callback();
    
    // Hide the Post Processing part of the UI (It gets 'un-hidden' when requests are done processing)
    $("#div_AgriservUI_Output").hide();

    // Stop the helper
    hide_Start_Helper();
    
     
    // Testing and Debugging
    Test__LoadObjects_ForTestData();
    
});

















// Data Model to hold all of this.


// Variables that depend on 'servirnasa.js'
// isLocalMode      // are we running in localhost mode or live server mode?
// baserequesturl   // url for communications with server (ajax)





// ////////////////////////////////   DOCUMENTATION    ///////////////////////////////////////////
// ////////////////////////////////   DOCUMENTATION    ///////////////////////////////////////////
// ////////////////////////////////   DOCUMENTATION    ///////////////////////////////////////////

// A USE CASE OBJECT Example
var useCase_Example_Obj = {
    "AOIs" : [],            // List of objects and related data
    "YearStart" : 2005,     // Starting year for the processes (Earliest Year)
    "YearEnd" : 2010,       // Ending year for the process (Latest Year)
};
// "AOIs" item ( useCase_Example_Obj.AOIs[0]
var AOI_0_Object = {
    "PolyString_JSON" : "{\"type\":\"Polygon\",\"coordinates\":[[[-10.678710937500014,13.6669921875],[-7.119140625000014,13.7548828125],[-7.163085937500014,11.1181640625],[-10.590820312500014,11.25],[-10.678710937500014,13.6669921875]]]}",
    "UsePolyString" : true,     // Boolean that tells the request processor to either use the "polygon string" or the "FeatureID + LayerID" combo to define the Area of Interest when making a request.
    "LayerID" : 2,              // Layer ID (Which GIS Layer are the features connected to)
    "FeatureIDs" : [55,56],     // Feature IDs (Which features on the above LayerID were selected)    
    "CHIRPSRequest" : {},       // Custom object to hold params for making a CHIRPS Request
    "NDVIRequest" : {}          // Custom object to hold params for making an NDVI Request
    // Future, Climatetology layer mixed in here?  Special request for that (Still working on this from the CSERV side)
}
var CHIRPSRequest_Object = {
    "LocalID":"1289abef",           // Way to connect Request status to the request object
    "cservParam_datatype" : "0",    // The data type value on the server for CHIRPS Daily Dataset (Chirps daily data is datatype "0"
    "cservParam_begintime" : "01/01/2005",  // Start date of the request
    "cservParam_endtime" : "12/31/2010",    // End date of the request
    "cservParam_intervaltype" : "0",  // Interval type, "0" is daily intervals
    "cservParam_operationtype" : "5", // 5 is Average (Need to make sure I know which type we wanted for this UseCase.)
    // Special use, either use "geometry" by itself, or use "layerid" AND "featureids" together.. don't put all 3 in the request.
    "UsePolyString" : true,     // Boolean that tells the request processor to either use the "polygon string" or the "FeatureID + LayerID" combo to define the Area of Interest when making a request.
    "cservParam_geometry" : "SameAs_PolyString_JSON",  // Polygon String wrapped in JSON.
    "cservParam_layerid" : 2,           // Layer ID for the features that were selected 
    "cservParam_featureids" : [1,2]     // Feature IDs on the above layer that were selected
}
var NDVIRequest_Object = {
    "LocalID":"ab98ef21",           // Way to connect Request status to the request object
    "cservParam_datatype" : "1",    // The data type value on the server for NDVI Pentadal Dataset (NDVI Pentadal data is datatype "1"
    "cservParam_begintime" : "01/01/2005",  // Start date of the request
    "cservParam_endtime" : "12/31/2010",    // End date of the request
    "cservParam_intervaltype" : "0",  // Interval type, "0" is daily intervals (Which gets converted up to pentadal on the serverside automatically)
    "cservParam_operationtype" : "5", // 5 is Average (Need to make sure I know which type we wanted for this UseCase.)
    // Special use, either use "geometry" by itself, or use "layerid" AND "featureids" together.. don't put all 3 in the request.
    "UsePolyString" : true,     // Boolean that tells the request processor to either use the "polygon string" or the "FeatureID + LayerID" combo to define the Area of Interest when making a request.
    "cservParam_geometry" : "SameAs_PolyString_JSON",  // Polygon String wrapped in JSON.
    "cservParam_layerid" : 2,           // Layer ID for the features that were selected 
    "cservParam_featureids" : [1,2]     // Feature IDs on the above layer that were selected
}

// Makes the Use Case "A" object (First derrived application/product Leveraging ClimateSERV's API to analyze data)
function make_UseCase_A_Object(AOI_Objects_List, yearStart, yearEnd)
{
    var retUseCaseObj = {
        "AOIs": AOI_Objects_List,
        "YearStart" : yearStart,
        "YearEnd" : yearEnd
    };
    return retUseCaseObj;
}

// Make an Area of Interest object, UseCase A has a collection of AOI Objects, AOI objects dictate the what CHIRPS and NDVI Requests are made so they contain the defs for those.
function make_AOI_Object(polyString_JSON, usePolyString, layerID, featureIDs, CHIRPSRequest, NDVIRequest)
{
    var retAOIObj = {
        "PolyString_JSON" : polyString_JSON,
        "UsePolyString" : usePolyString,
        "LayerID" : layerID,
        "FeatureIDs" : featureIDs,
        "CHIRPSRequest" : CHIRPSRequest,
        "NDVIRequest" : NDVIRequest
    };
    return retAOIObj;
}

// Make a CHIRPSRequest Object, Contains a list of params needed to make a request to ClimateSERV, a local ID for code tracking, and a results container.
// make_CHIRPSRequest_Object // Renamed the function to be more generic.. only differential is what is set in the params.
// Use this to make any request objects.
function make_Request_Object(cservParam_datatype, cservParam_begintime, cservParam_endtime, cservParam_intervaltype, cservParam_operationtype, isUsePolystring, cservParam_geometry, cservParam_layerid, cservParam_featureids)
{
    var localID = generate_LocalRequest_ID_as_s8();
    var ret_RequestObj = {
        "LocalID" : localID,
        "LostRequestCounter" : 0,   // When a request fails a few times the second chance flag gets set, when it fails more times and flag is set, there is something wrong with either the server or the area of interest has no data.
        "SecondChanceFlag" : false,     // When a request is submitted for a second time, this gets set to true,
        "cservParam_datatype" : cservParam_datatype,
        "cservParam_begintime" : cservParam_begintime,
        "cservParam_endtime" : cservParam_endtime,
        "cservParam_intervaltype" : cservParam_intervaltype,
        "cservParam_operationtype" : cservParam_operationtype,
        "UsePolyString" : isUsePolystring, 
        "cservParam_geometry" : cservParam_geometry,
        "cservParam_layerid" : cservParam_layerid,
        "cservParam_featureids" : cservParam_featureids
    };
    return ret_RequestObj;
}
// Make a NDVIRequest Object, Contains a list of params needed to make a request to ClimateSERV, a local ID for code tracking, and a results container.





// Test - Make Loaded Object
function unitTest_Complete_UseCase_A_ObjectTest()
{
    // Settings
    var chirps_DataType = 0;     // Datatype number for Chirps
    var chirps_IntervalType = 0; // Daily
    var chirps_Operationtype = 5; // 5 means "AVERAGE",  Min and Max are (0 and 1)
    
    var ndvi_DataType = 1;     // Datatype number for NDVI
    var ndvi_IntervalType = 0; // Daily... converted to pentadal on server
    var ndvi_Operationtype = 5; // 5 means "AVERAGE",  Min and Max are (0 and 1)
    
    
    // Inputs
    var input_yearStart = 2001;
    var input_yearEnd = 2008;
    var input_PolygonString_1 = "{\"type\":\"Polygon\",\"coordinates\":[[[-10.678710937500014,13.6669921875],[-7.119140625000014,13.7548828125],[-7.163085937500014,11.1181640625],[-10.590820312500014,11.25],[-10.678710937500014,13.6669921875]]]}";     //"POLYSTRING_1_PLACEHOLDER";
    var input_PolygonString_2 = "{\"type\":\"Polygon\",\"coordinates\":[[[-5.009765625000014,13.293457031250004],[-2.021484375000014,13.293457031250004],[-2.021484375000014,11.096191406250004],[-4.965820312500014,11.008300781250004],[-5.009765625000014,13.293457031250004]]]}";   // "POLYSTRING_2_PLACEHOLDER";
    // TODO!  DEAL WITH FEATURE SELECTIONS AND NOT JUST POLYGON STRINGS
    var isUsePolystring = true; // Setting this to true means we are using the polygon string and NOT the featureID/layerID combo
    
    // Convert start/end years to requestable dates
    var converted_beginDate = "01/01/" + input_yearStart;
    var converted_endDate = "12/31/" + input_yearEnd;
    
   // alert(9999);
    
    // Make all 4 request objects, AOI 1 gets a Chirps and NDVI object, AOI 2 also gets a slightly different CHIRPS and NDVI request object.
    //var AOI_1_CHIRPSRequestOBJ = make_CHIRPSRequest_Object(0, "01/01/2001", "12/31/2008", 0, 5, "APolygonJSONStringHere", 0,[]);
    var AOI_1_CHIRPSRequestOBJ = make_Request_Object(chirps_DataType, converted_beginDate, converted_endDate, chirps_IntervalType, chirps_Operationtype, isUsePolystring, input_PolygonString_1, 0, []);
    var AOI_1_NDVIRequestOBJ = make_Request_Object(ndvi_DataType, converted_beginDate, converted_endDate, ndvi_IntervalType, ndvi_Operationtype, isUsePolystring, input_PolygonString_1, 0, []);
    var AOI_2_CHIRPSRequestOBJ = make_Request_Object(chirps_DataType, converted_beginDate, converted_endDate, chirps_IntervalType, chirps_Operationtype, isUsePolystring, input_PolygonString_2, 0, []);
    var AOI_2_NDVIRequestOBJ = make_Request_Object(ndvi_DataType, converted_beginDate, converted_endDate, ndvi_IntervalType, ndvi_Operationtype, isUsePolystring, input_PolygonString_2, 0, []);
    
    
    
    // Make 2 AOI Objects and put them together in a list for making the final usecase object
    var test_AOIObj_1 = make_AOI_Object(input_PolygonString_1, isUsePolystring, 0, [0,1], AOI_1_CHIRPSRequestOBJ, AOI_1_NDVIRequestOBJ );
    //var test_AOIObj_1 = make_AOI_Object("POLYSTRING_1_PLACEHOLDER", true, 0, [0,1], {}, {} );
    var test_AOIObj_2 = make_AOI_Object(input_PolygonString_2, isUsePolystring, 0, [0,1], AOI_2_CHIRPSRequestOBJ, AOI_2_NDVIRequestOBJ );
    //var test_AOIObj_2 = make_AOI_Object("POLYSTRING_2_PLACEHOLDER", true, 0, [0,1], {}, {} );
    var AOIList = [test_AOIObj_1, test_AOIObj_2];
    
    // Make the final Starting Use Case Object
    var test_UseCaseObj = make_UseCase_A_Object(AOIList, input_yearStart, input_yearEnd);
    //var test_UseCaseObj = make_UseCase_A_Object([], 2001, 2008);
    return test_UseCaseObj;
}

var TEST_UseCaseA_CompleteObject = unitTest_Complete_UseCase_A_ObjectTest();



/**********************This is where the data is not being set yet****************************/
//Process the data from the request and display it in a graph.
function processIncomingData(datain) {
    dataFromRequest = datain['data'];
    var output = new Array();
    hashData = {};
    myArray = [];
    var varName = 'Notdownload'; //parameterTypes[parameterType]['lname'].trim();

    // KS Refactor 2015 // This is where I need to intercept the 'download' operation type on the client side..
    // This line for all operation types that are not download... (maybe)..
    if (varName == "download") {
        // Check for errors and working datasets in the zip file
        var image_File_SuccessList = [];
        var image_File_ErrorList = [];

        for (var i in dataFromRequest) {
            var outputdate = dataFromRequest[i]['date'];
            value = dataFromRequest[i]['value']; //[varName]; // Datastructure is different here for download jobs..
            epochTime = dataFromRequest[i]['epochTime'];
            output[i] = [];
            output[i]['date'] = outputdate;
            output[i][varName] = value;
            myArray.push(epochTime);
            hashData[epochTime] = { 'date': outputdate };
            hashData[epochTime][varName] = value;

            // Check for errors and successes
            if (value == 1) {
                image_File_SuccessList.push(outputdate);
            }
            else {
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
        if (image_File_SuccessList.length > 0) {
            if (image_File_ErrorList.length == 0) {
                progressLabelMessage = "File Download Ready";
            }
            else {
                progressLabelMessage = "File Download Ready | " + image_File_ErrorList.length + " errors.";
            }
            //if(image_File_ErrorList.length > 0)
            //{
            //    progressLabelMessage += " | " + image_File_ErrorList.length + "errors.";
            //}
        }
        else {
            // $("#progresslabel").text("There was an error generating this zip file.  Select a different area and try again.");
            progressLabelMessage = "There was an error generating this zip file.  Select a different area and try again."
            hide_DownloadFileLink();
        }
        $("#progresslabel").text(progressLabelMessage);

        // Running this line of code generates a graph, 1's mean file was created, 0's mean they were not.
        // createChart(data);  // run this on the console to see if all files were created.
        //createChart(output);

    }
    else {
        for (var i in dataFromRequest) {
            var outputdate = dataFromRequest[i]['date'];
            value = dataFromRequest[i]['value'][varName];
            if (value < -999.00) { value = 0; }
            // Intercept for IMERG Data (Convert IMERG Data from 0.1 mm/day to 1.0 mm/day
            if ($("#typemenu").val() == "IMERG1Day") { value = (value / 10); }
            // if(value < -999.00) { alert(value); }
            epochTime = dataFromRequest[i]['epochTime'];
            output[i] = [];
            output[i]['date'] = outputdate;
            output[i][varName] = value;
            myArray.push(epochTime);
            hashData[epochTime] = { 'date': outputdate };
            hashData[epochTime][varName] = value;
        }
        data = output;
        // createChart(output);
        
        $("#progressdialog").dialog("close");
    }

}

var myCharts = [];

function loadGraphCombinedOLD(currentData, which, maximize, maxValue) {
    BillyZdata = currentData;

    $("#chartdialogNot").show();
    $("#chartWindow" + which).empty();

    // alert(clusterLayer._map.infoWindow.features[clusterLayer._map.infoWindow.selectedIndex].attributes.StationID);

    /* I will need to get actual data for clusterLayer._map.infoWindow.features[clusterLayer._map.infoWindow.selectedIndex].attributes.StationID with specific dates */
    $(".loading").show();
    var x;
    var y1;
    var y2;
    var height = 230;
    var width = 230;
    if (maximize) {
        height = $(".sizer.content").height() - 65;

        width = $(".sizer.content").width() - 60;
    }
    if ("#chartWindow" + which) {
        svg = dimple.newSvg("#chartWindow" + which, "100%", "100%");
    }
    
    var dataType = "NDVI";
    var myChart = new dimple.chart(svg, currentData);
    myChart.defaultColors = [
       new dimple.color("grey")
    ];
    //myChart.style("font-family", "courier new");
    //myChart.style("text-anchor", "end");
    //myChart.style("font-size", "20px");
    myChart.setMargins("60px", "30px", "110px", "70px");
    if (maximize) {
       // myChart.setBounds(60, 30, width - 120, height - 125);
    }
    else {
       // myChart.setBounds(60, 30, 180, 165);
    }
    x = myChart.addTimeAxis("x", "Date", "%m/%d/%Y", "%m/%d/%Y");
   // x.style("font-size", "20px");
    y1 = myChart.addMeasureAxis("y", "Value", " NDVI");
    y1.overrideMin = 0;
    y1.overrideMax = maxValue;
    y1.tickFormat = ',.2f';
    y1.showGridlines = true;
    var series = myChart.addSeries(dataType, dimple.plot.area, [x, y1]);
    series.getTooltipText = function (e) {

        return [
            "NDVI",
            "Date: " + moment(e.x).format("MM/DD/YYYY"),
            "Value: " + Number(e.y).toFixed(2) + " NDVI"
        ];
    };

    /*I can assign color by type of data if needed */

    myChart.assignColor(dataType, "#3e3ec6");
    //y2 = myChart.addMeasureAxis("y", "Value2");
    //myChart.addSeries("Standard Dev", dimple.plot.line, [x, y2]);
    // myChart.assignColor("Standard Dev", "#000000");
    myChart.addLegend("100%", 0, 0, "auto", "Right");
    myChart.draw();

    try {
        fullScreenWizard();
        

    }
    catch (ex)
    { }

    y1.titleShape.text("NDVI");
    x.shapes.selectAll("text").attr("transform", "rotate(45)");
    // svg.selectAll("path.dimple-Standard-Dev").style("stroke-dasharray", "2");

    if (numDaysInRange() > 7) {
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
  //  $(".loading").hide();
   // $(".loadingmessage").hide();
    // updateDownloadData();
    if ($(".ui-slider-handle").length > 0) {
        updateLine();
    }
    myCharts.push(myChart);
}

function numDaysInRange() {
    return global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData.length;
}


var BillyZdata;
function createChart(data) {


    var buttons = []
    count = 0
    if (clickEnabled == false) {
        buttons[count] = { text: "Export Polygon", click: function () { savePolygon(); } };
        ++count;
    }
    buttons[count] = { text: "Export to Png", click: function () { savePng(uniqueid); } };
    ++count;
    buttons[count] = { text: "Export to CSV", click: function () { saveCSV(uniqueid, y_Axis_Label); } };
    ++count;
    buttons[count] = { text: "Close", click: function () { $(this).dialog("close"); } };

    //$("#chartdialog").dialog({
    //    modal: true,
    //    autoOpen: true,
    //    show: "blind",
    //    hide: "explode",
    //    buttons: buttons,
    //    resizable: true,
    //    width: $(window).width() - 100,
    //    height: $(window).height() - 100,
    //    resizeStop: function (event, ui) {
    //        resizeChart();
    //    }

    //});
    //var dialogwidth = $("#chartdialog").outerWidth();
    //var dialogheight = $("#chartdialog").outerHeight();
    var margin = { 'left': 30, 'right': 50, 'top': 20, 'bottom': 40 },
    width = 580;//dialogwidth - margin.left - margin.right,
    height = 400;//dialogheight - margin.top - margin.bottom;
    $("#chartWindow").html("");
    var svg = dimple.newSvg("#chartWindow", width, height);


    BillyZdata = data;
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

    var x = chart.addTimeAxis("x", "date", parsingFormat[intervalType], dateformat[intervalType]);
    x.showGridlines = true;


    // Refactor for new Y Axis
    var y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[5]['uname'], currentChartTitle);
    //var y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);
    //var y = chart.addMeasureAxis("y", "TEST"); // Looks like the info that contains the label is identical to the key being used to get the data from the array...
    //var y = chart.addMeasureAxis("y", y_Axis_Label);  // Breaks??
    //var y = chart.addMeasureAxis("y", parameterTypes[parameterType]['uname']);
    var y = chart.addMeasureAxis("y", parameterTypes[5]['uname']);

    // Apply labels to the axes
    chart.axes[0].title = "Date";
    chart.axes[1].title = y_Axis_Label;  // To directly change ONLY THE LABEL..

    // This is a hacky quick fix for this issue of y axis stretching / corrections
    // This only works for the single dataset per chart types.
    // data, parameterTypes[parameterType]['uname'], chart
    try {
        //var minMaxObj = get_NewMinMax_Adjust_Y_Axis_For_Thin_Ranges_SingleDataset(data, parameterTypes[parameterType]['uname'], chart);
        var minMaxObj = get_NewMinMax_Adjust_Y_Axis_For_Thin_Ranges_SingleDataset(data, parameterTypes[5]['uname'], chart);
        if (minMaxObj == null) {
            // Do nothing
        }
        else {

            //console.log(Math.floor(minMaxObj.min));
            //console.log(Math.ceil(minMaxObj.max));
            var yMin = Math.floor(minMaxObj.min);
            var yMax = Math.ceil(minMaxObj.max);
            //yMax = yMax + ((yMax - yMin) %2);   // Fix for uneven number of grid points
            yMin = yMin - ((yMax - yMin) % 2);   // Fix for uneven number of grid points
            //console.log(yMax);
            y.overrideMin = yMin; //Math.floor(minMaxObj.min);
            y.overrideMax = yMax; //Math.ceil(minMaxObj.max);

        }
    }
    catch (err_Overriding_YAxis) {
        // Do nothing for now.
    }
    //chart.axes[1]._min = 50;
    //y._min = 50;

    y.tickFormat = ',.2f';
    y.showGridlines = true;
    chart.addSeries(null, dimple.plot.area);

    chart.draw();
    $("#chartdialogNot").show();

    debug_Chart.push(chart);
}
var debug_Chart = [];

//Enable the saving of the chart as a PNG file
function savePng(theUniqueID) {
    var svgtemp = $("#fPage4 .fPage")[0];                    //document.getElementsByTagName("svg")[0];

    saveSvgAsPng(svgtemp, theUniqueID + "_Chart.png", 3);
    //saveSvgAsPng(svgtemp, "diagram.png", 3);

}

//Enable saving of the data output to Comma Seperated variable.
function saveCSV(theUniqueID) {

    outputstring = "";
    outputstring += "This data was generated by SERVIR's ClimateSERV system (http://ClimateSERV.nsstc.nasa.gov/),\n";

    //outputstring = 'date,'+parameterTypes[parameterType]['lname']+'\n';
    var currentChartTitle = getSelectedOption_Text("typemenu");
    var y_Axis_Label = get_Y_Axis_HC_LOOKUP(parameterTypes[parameterType]['uname'], currentChartTitle);


    outputstring += 'Date,' + y_Axis_Label + '\n';

    for (var i in myArray.sort(compareFunction)) {
        var valueToProcess = hashData[myArray[i]];
        outputstring += valueToProcess['date'] + ', ' + valueToProcess[parameterTypes[parameterType]['lname']] + "\n";
    }
    //downloadTextFile("results.csv",outputstring);
    downloadTextFile(theUniqueID + ".csv", outputstring)


}

function savePolygon() {
    downloadTextFile("polygon.geojson", getCurrentPolygonAsGeoJson());
}

//Download a text file. Used by CSV to enable downloading of the file containing text.
function downloadTextFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}
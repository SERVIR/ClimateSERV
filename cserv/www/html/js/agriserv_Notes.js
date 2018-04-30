/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



// To Test this whole thing,
// 
// Phase 1, Load up the Use Case object and initial Requests
// Load the site, Run
// stopIntervals()  // To pause the intervales so the requests don't just all spam at one time..
// global_CurrentUseCaseObject  // Holds all the setup info for requests that Need to be made... and once requests are done, holds the results.
// [requests_Waiting_ToMake, requests_Waiting_ForData, requests_DataReady]  // Shows the status of the 3 queues in the request pipeline.
// test_UseCase_A_Handler();  // Or click the button on the green page once..  This should load up 'global_CurrentUseCaseObject' with starter data
// global_CurrentUseCaseObject;     // Make sure this object is filled out according to specs
// [requests_Waiting_ToMake, requests_Waiting_ForData, requests_DataReady];     This should now be showing 4 requests loaded in the first queue.
//
// // Phase 2, Run the request pipeline manually one at a time... let the localhost server catch up to each request 
// multiRequest_CheckRequests() // Runs the process to perform an AJAX comms action on any one of the items from any of the 3 queues.. // In operational mode, this function is called every N seconds and eventually processes all comms.
// [requests_Waiting_ToMake, requests_Waiting_ForData, requests_DataReady]  // Should have some data in it... each time running the multirequest, this should change.
// 
// // Phase 3, See some results!
// select_NDVIBottomThreshold_Changed(0.5);  //  This should calculate atleast 2 growing seasons for each area of interest (1 per year, per area of interest) and should output all the data to a very roughly designed HTML table at the bottom of the page))
// 
// process_RawData__For_UseCase_A_Object(debug_RawData[2]); // An example of performing calculations on completed raw data



// This is an alpha, some of the functionality in here depends on external parameters that should be dynamically generated.
// to account for this, we've got this variable below (HC_ITEMS).  HC is for HardCoded.  These items should be removed and replaced with dynamic functionality ASAP.
// Remember, this is just an ALPHA version.
var HC_ITEMS = {};


//alert(0);

// Components
// MultiRequest Module (Code and variables that can handle making multiple requests to ClimateSERV API and manage their results)
// UseCase Controller and Rules Bridge 
//  on one end, can talk to the MultiRequest Module and tell it what requests to make
//  on another end, receive and package data from the UI (UI Handlers and translate inputs into requests to be made based on the use cases)
//  and in the middle (controller piece) can fire off events to populate the output boxes
// UI for 'N' cases
// 


// Component Requirements
// Component: MultiRequest_Component
// What it does: Make multiple requests to ClimateSERV, store those requests into a datastructure
// -Reusable Function to make the requests (Takes all the params it needs)
// -Reusable Functional system (multiple functions) that track a job till completion (that check the status of a job over and over again until it is either done, or it failed and indicates that as well somehow)
// Data Structure to hold all these steps (JobID and status object Queue, a 'RequestsToBeMade' list, a outgoing 'CompletedRequests' list that holds data
// -Function to load up the Datastructure with data when a job is done processing
// -Function to handle errors when a job request fails or it's job ID failes (This function needs to basically remake the request)
// -Function to serve as the entry point for this module (some other function will call this one and send it data to make a request)
//
// Component: UseCaseController
// What it does: Handles input from the UI, Uses rules for usecases to translate inputs into a set of requests, calls the functions that make the requests, 
//                  Receieves a signal that the requests are all complete, provides a signal to the user that the output is ready for viewing,
//                  Turns on and off the viewing of the output            

// PLANNING SECTION         END



// Notes on Stuff that is needed (after Alpha version)
// -Dynamic UI (Generated based on which Use Case was selected)
// -Dynamic UI Mappings (A way to key inputs to specific Use Case)
// -

// UseCaseController - ucc_Test_Do_FullPipelineTest__UIInputs_To_Requests_To_Outputs
function ucc_Test_Do_FullPipelineTest__UIInputs_To_Requests_To_Outputs()
{
    // From the UI, get which UseCase was selected
    var useCaseType = UseCaseTypes.Area_Of_Interest_Analytics;
    
    // Select the Logic we are processing from the given use case
    if(useCaseType === UseCaseTypes.Area_Of_Interest_Analytics)
    {
        
        // Pull in Inputs form the specific Use Case UI.
        var yearInput_Start = HCTEST_ITEMS.Input_Year_2000;
        var yearInput_End   = HCTEST_ITEMS.Input_Year_2015;
        var AreaOfInterest_01 = HCTEST_ITEMS.Input_AOI_Polygon_01;
        var AreaOfInterest_02 = HCTEST_ITEMS.Input_AOI_Polygon_02;
        
        // Eventually we want to support 'N' areas of interest...
        var areasOfInterest = [];
        
        // These should probably be pulled in by checkboxes or some other UI driven mechanism
        areasOfInterest.push( {"aoi": {"polygon":AreaOfInterest_01 } } );
        areasOfInterest.push( {"aoi": {"polygon":AreaOfInterest_02 } } );
        
        // We need an array of requests to make/manage
        var requests = [];
        
        // Populate the Requests based on the number of areas of interest.
        for(var i = 0; i < areasOfInterest.length; i++)
        {
            alert("STILL WORKING ON WHAT TO ADD TO THE REQUEST OBJECT");
            var requestObject = {
                
            };
        }
        
        
        // Set up the Request object for each area of interest
        // CHIRPS Request(s)
        
        alert("STILL WORKING ON WHAT TO ADD TO THE USECASE BUSINESS OBJECT");
        // Build the UseCase_Business_Object to be processed by the request handler.
        var useCase_Business_Object = {
            "Number_Of_AreasOfInterest": areasOfInterest.length,    // Tells us how many areas of interest were selected for processing.
            "Req":{
                "Name":"CHIRPS_Request"
            }
        };
        
        
        // VISUALIZING THE OUTPUT
        // 
        // outputs  TEST_DEBUG_OUTPUT_BLOCK
        var debug_Output_HTML = "";
        debug_Output_HTML += "yearInput_Start: " + yearInput_Start + "<br />";
        debug_Output_HTML += "yearInput_End: " + yearInput_End + "<br />";
        debug_Output_HTML += "AreaOfInterest_01: " + AreaOfInterest_01 + "<br />";
        debug_Output_HTML += "AreaOfInterest_02: " + AreaOfInterest_02 + "<br />";
        
        // Fill The output box with debug info
        $("#TEST_DEBUG_OUTPUT_BLOCK").html(debug_Output_HTML);
        
    }
}

function ucc_Start_Handler()
{
    
}

// http://stackoverflow.com/questions/744554/jquery-ui-dialog-positioning

// http://stackoverflow.com/questions/12867016/button-style-is-messed-up-after-changing-the-text-through-jquery
// $("#input_Agriserv_Submit_UseCaseA .ui-btn-text").html()
// <span class="ui-button-text">Submit Job Request</span>
// $("#input_Agriserv_Submit_UseCaseA").html(); // "<span class="ui-button-text">Submit Job Request</span>"
// $("#input_Agriserv_Submit_UseCaseA").html("<span class='ui-button-text'>Submit Job Request</span>");
// $("#input_Agriserv_Submit_UseCaseA").html("<span class='ui-button-text'>Job Request in progress...</span>");
// 
// Need process to check if all requests were made and if they all returned data.. if not, make them again.
//function check
// var requests_WithMissingResults = get_Requests_From_UseCaseA_Object_WithMissingData(global_CurrentUseCaseObject);

var global_IsNewRequestLocked = false; 

function test_UseCase_A_Handler()
{
    if(global_IsNewRequestLocked === true) 
    { 
        alert("There is currently a set of requests being made.  This action is disabled until the requests are fully completed.  This process may take a few minutes."); 
    }

    // Lock is not active.. lock it now.
    global_IsNewRequestLocked = true;
    
    // Reset the UseCase object
    reset_UseCaseObj();
    
    // TODO!! Message
    alert("TODO! (Get Inputs from the UI) Replace the Hard Coded Polygon Strings with actual select from inputs.");
    // NEED SOME WAY TO GET THIS NEXT VARIABLE FROM THE UI
    var isUsePolystring = true;
    
    // Build a use case object from the inputs
    global_CurrentUseCaseObject = get_UseCase_A_Object(2005, 2006, isUsePolystring, HCTEST_ITEMS.Input_AOI_Polygon_01, HCTEST_ITEMS.Input_AOI_Polygon_02);
    
    // Moved this functionality to pull_Requests_To_QueueSystem
    //// Get all the requests from the Global Use Case object
    //var requestsToMake = get_Requests_From_UseCaseA_Object(global_CurrentUseCaseObject);
    //// Place the Request objects in their queue.
    //for(var i = 0; i<requestsToMake.length; i ++)
    //{
    //    //requests_Waiting_ToMake.push(requestsToMake[i]);
    //    add_RequestTo_WaitingToMake_Queue(requestsToMake[i]);
    //}
    pull_Requests_To_QueueSystem();
    
    alert("REMOVE THESE DEBUG LINES RIGHT BELOW THIS LINE..");
    debug_Items.push("global_CurrentUseCaseObject has been set.");
    debug_Items.push(global_CurrentUseCaseObject);
    
    //alert("TODO! SET UP SOME KIND OF LOOP TO CHECK FOR WHEN THE REQUESTS ARE ALL DONE.");
    // NOPE, FOR NOW.. THIS IS TRIGGERED BY THE RAW DATA BEING SENT TO THE PROCESSING FUNCTION
    
    // Wait, actually.. this does need to be done on a long polling loop (since there are multiple requests for a single use case,,, and that number can vary)
}


// Change


<div id="AgriservUI_Dialog" title="Agriserv Early Alpha" style="border: 1px solid #666666; background: #4F4F4F url('images/ui-bg_inset-soft_25_4F4F4F_1x100.png') 50% bottom repeat-x;  color: #ffffff; position: absolute; height: auto; width: 300px;  top: 50px;  left: 0px; display: none;">
            <div id="div_AgriservUI_TopHeader">
                Agriserv Alpha.<br />
                Compare Growing Seasons between multiple areas of interest.<br />
            </div>
            <br />
            <div id="div_AgriservUI_InputSection">
                <fieldset>
                    <legend>Inputs</legend>
                    <!-- Input: Select Start Year -->
                    <div class="searcharea_newrow SubmitDataRequest_UI SubmitDataRequest_UI_Default">
                        <div class="searcharea_left">Choose a Start Year:</div>
                        <div class="searcharea_right">
                            <select name="input_Agriserv_Select_YearStart" id="input_Agriserv_Select_YearStart">
                                <option value="2000">2000</option>
                                <option value="2001">2001</option>
                                <option value="2002">2002</option>
                                <option value="2003">2003</option>
                                <option value="2004">2004</option>
                                <option value="2005" selected>2005</option>
                                <option value="2006">2006</option>
                                <option value="2007">2007</option>
                                <option value="2008">2008</option>
                                <option value="2009">2009</option>
                                <option value="2010">2010</option>
                                <option value="2011">2011</option>
                                <option value="2012">2012</option>
                                <option value="2013">2013</option>
                                <option value="2014">2014</option>
                                <option value="2015">2015</option>
                            </select>
                        </div>
                    </div>

                    <!-- Input: Select End Year -->
                    <div class="searcharea_newrow SubmitDataRequest_UI SubmitDataRequest_UI_Default">
                        <div class="searcharea_left">Choose an End Year:</div>
                        <div class="searcharea_right">
                            <select name="input_Agriserv_Select_YearEnd" id="input_Agriserv_Select_YearEnd">
                                <option value="2000">2000</option>
                                <option value="2001">2001</option>
                                <option value="2002">2002</option>
                                <option value="2003">2003</option>
                                <option value="2004">2004</option>
                                <option value="2005">2005</option>
                                <option value="2006" selected>2006</option>
                                <option value="2007">2007</option>
                                <option value="2008">2008</option>
                                <option value="2009">2009</option>
                                <option value="2010">2010</option>
                                <option value="2011">2011</option>
                                <option value="2012">2012</option>
                                <option value="2013">2013</option>
                                <option value="2014">2014</option>
                                <option value="2015">2015</option>
                            </select>
                        </div>
                    </div>
                    <!-- Area of Interest 1 -->
                    <div class="searcharea_newrow SubmitDataRequest_UI SubmitDataRequest_UI_Default">
                        <div class="searcharea_left">Select Area of Interest 1:</div>
                        <div class="searcharea_right">
                            [GeoJSON Drop Zone AOI 1]
                        </div>
                    </div>
                    <!-- Area of Interest 1 -->
                    <div class="searcharea_newrow SubmitDataRequest_UI SubmitDataRequest_UI_Default">
                        <div class="searcharea_left">Select Area of Interest 2:</div>
                        <div class="searcharea_right">
                            [GeoJSON Drop Zone AOI 2]
                        </div>
                    </div>

                    <br />

                    <!-- Submit Job Request -->
                    <div class="searcharea_newrow SubmitDataRequest_UI SubmitDataRequest_UI_Default">
                        <div class="searcharea_left">&nbsp;</div>
                        <div class="searcharea_right">
                            <button id="input_Agriserv_Submit_UseCaseA" onclick="submit_UseCaseA_Input_EventHandler();">Submit Job Request</button>
                        </div>
                    </div>



                </fieldset>
            </div>
            <br />
            <div id="div_AgriservUI_RequestReportingArea">
                Once the input variables have been submitted (in the step above), data specific to the area of interest and year range must be requested, processed, and loaded prior to analysis.
                This process may take several minutes.<br />
                <br />
                <fieldset>
                    <legend>Request For Data Status</legend>
                    <br />
                    <span id="requestReportingStatus_Output">No Requests yet made.</span><br />
                    <br />
                </fieldset>
                <br />
            </div>
            <br />
            <div id="div_AgriservUI_Output">
                Use the Slider to select an NDVI Threshold<br />
                <div id="GrowingSeason_Threshold_Container">
                    <div id="GrowingSeason_Threshold_Slider"></div>
                </div>
                <br />
                <br /><hr /><br />
                <div id="GrowingSeasons_Output_Container">
                    GrowingSeasons_Output_Container UNSET
                </div>

                Calculated Growing Seasons Output:<br />
                [Output Text Area for Growing Seasons]<br />
                [Export Option Buttons (CSV Out)]<br />
                [IF TIME... Graph Options]<br />
            </div>



        </div>

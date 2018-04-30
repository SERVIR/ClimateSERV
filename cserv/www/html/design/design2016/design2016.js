/* 
    Created on : 2016
    Author     : Cris Squared, Kris Stanton
*/



// Settings
var g_Show_Welcome_Page_Delay = 200; // 2000;  // 2000 means 2 seconds.
var g_Dimmer_Opacity = 0.6;  // Number from 0 to 1,  0 is no dimming, 1 is complete dimmer
var g_Dimmer_On_ContentPlaceholder_ID = "dimmer_On_Content_Placeholder";
var g_Dimmer_First_ShowTime = 200; //3000;
var g_Dimmer_Normal_ShowTime = 500;
var g_Dimmer_Current_ShowTime = 500;
var g_Dimmer_Current_HideTime = 500;


// Detect Safari VS Chrome
var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
var is_safari = navigator.userAgent.indexOf("Safari") > -1;
var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
if ((is_chrome)&&(is_safari)) {is_safari=false;}
if ((is_chrome)&&(is_opera)) {is_chrome=false;}
function is_safari()
{
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) 
    {
        return true;
    }
    return false;
}

// Set map Opacity to completely visible (prevents a flash on page load)
function set_map_opacity_to_visible()
{
    //$("#map").css('opacity', '1.0');
    $("#map").fadeTo( 'fast', '1.0');
}

// Dimmer Functions
//function show_Dimmer_ForElement(the_Element, opacity = g_Dimmer_Opacity)    {   the_Element.dimmer('setting', 'opacity', opacity).dimmer('show');   }
//function show_Dimmer_ForElement(the_Element, opacity = g_Dimmer_Opacity)    {   the_Element.dimmer('setting', 'opacity', opacity).dimmer('setting', 'duration', {show:g_Dimmer_Current_ShowTime,hide:500}).dimmer('show');   }
function show_Dimmer_ForElement(the_Element, opacity)    
{   
    if(typeof(opacity)==='undefined') { opacity = g_Dimmer_Opacity; } // Default params break in safari!
    //the_Element.dimmer('setting', 'opacity', opacity).dimmer('setting', 'duration', {show:g_Dimmer_Current_ShowTime, hide:g_Dimmer_Current_HideTime}).dimmer('show');   
    the_Element.dimmer('setting', 'opacity', opacity).dimmer('show');   
}
function hide_Dimmer_ForElement(the_Element)                                {   the_Element.dimmer('hide');    }
function toggle_Dimmer_ForElement(the_Element, opacity)  
{   
    if(typeof(opacity)==='undefined') { opacity = g_Dimmer_Opacity; }  // Default params break in safari!
    the_Element.dimmer('setting', 'opacity', opacity).dimmer('toggle'); 
}

// Content Area Dimmer Controller funcitons
function show_Content_Dimmer()
{
    // Select the content area and attach a dimmer to it 
    var contentElement = $("div[data-role='content']:visible:visible");
    show_Dimmer_ForElement(contentElement);
}
function hide_Content_Dimmer()
{
    // Select the content area and hide the dimmer if it is found
    var contentElement = $("div[data-role='content']:visible:visible");
    hide_Dimmer_ForElement(contentElement);
}

// Update Progress Bar
// Assumptions: Div ID is 'div_UI_Progress_Bar', Normal 'value' range is 0 to 100 (as a percent, so passed as a float, may be a float wrapped inside a string), any other 'value' is considered an error. (Usually -1 gets passed when things go wrong).
function update_ProgressBar(value)
{
    // Progress bar has multiple color states, so we need to set these conditions along with the value.
    var isError = false;
    
    // Convert the value into a number.
    var filtered_Value = value * 1;
    
    // Validate for Errors
    // Check to see if the value is not a number.
    if(isNaN(filtered_Value) == true) { isError = true; }
    if(filtered_Value < 0) { isError = true; }
    if(filtered_Value > 100) { isError = true; }
    
    if(isError == true)
    {
        // Set the Error
        $('#div_UI_Progress_Bar').progress('set error').progress({value:-1});
    }
    else
    {
        if(filtered_Value == 100)
        {
            // Set the success / Done state
            $('#div_UI_Progress_Bar').progress('set success').progress({percent:100});
        }
        else
        {
            // Set the active state // Meaning (the progress bar is doing it's normal updating thing right here.
            $('#div_UI_Progress_Bar').progress('set active').progress({percent: filtered_Value});
            
        }
    }
}

// Show/Hide Map Message Controls
function hide_MapMessages()
{
    $("#div_MapMessageContainer").addClass("servir_helper_hidden");
    $("#div_MapMessage_DrawPolygon").addClass("servir_helper_hidden");
    $("#div_MapMessage_SelectFeatures").addClass("servir_helper_hidden");
    $("#div_MapMessage_GeoJSONUpload").addClass("servir_helper_hidden");
}
function show_MapMessage_DrawPolygon()
{
    $("#div_MapMessageContainer").removeClass("servir_helper_hidden");
    $("#div_MapMessage_DrawPolygon").removeClass("servir_helper_hidden");
}
function show_MapMessage_SelectFeatures()
{
    $("#div_MapMessageContainer").removeClass("servir_helper_hidden");
    $("#div_MapMessage_SelectFeatures").removeClass("servir_helper_hidden");
}
function show_MapMessage_GeoJSONUpload()
{
    $("#div_MapMessageContainer").removeClass("servir_helper_hidden");
    $("#div_MapMessage_GeoJSONUpload").removeClass("servir_helper_hidden");
}


// SelectData SubPage // Dynamic Form Controls 
function hide_SelectDataForms()
{
    $(".controlClass_selectData_Form_Default").addClass("servir_helper_hidden");
    $(".controlClass_selectData_Form_SeasonalForecast").addClass("servir_helper_hidden");
}
function show_SelectDataForm_Default()
{
    hide_SelectDataForms();
    $(".controlClass_selectData_Form_Default").removeClass("servir_helper_hidden");
}
function show_SelectDataForm_SeasonalForecast()
{
    hide_SelectDataForms();
    $(".controlClass_selectData_Form_SeasonalForecast").removeClass("servir_helper_hidden");
}

function hide_TypeOfRequest_SubForms()
{
    $(".SelectData_Datasets_FormContainer").addClass("servir_helper_hidden");
    $(".SelectData_Monthly_Analysis_FormContainer").addClass("servir_helper_hidden");
}
function show_TypeOfRequest_Datasets_Form()
{
    $(".SelectData_Datasets_FormContainer").removeClass("servir_helper_hidden");
}
function show_TypeOfRequest_MonthlyAnalysis_Form()
{
    $(".SelectData_Monthly_Analysis_FormContainer").removeClass("servir_helper_hidden");
}

// Default, called during init, selectData_typeOfRequest_Changed('datasets')
function selectData_typeOfRequest_Changed(selected_Value)
{
    // Hide All of the "Type Of Request" Subforms
    hide_TypeOfRequest_SubForms();

    // Current Choices: "datasets" and "monthly_analysis"
    if(selected_Value == "monthly_analysis")
    {
        show_TypeOfRequest_MonthlyAnalysis_Form();
    }
    else  // expecting (selected_Value == "datasets") for this else... but unexpected behavior should show
    {
        show_TypeOfRequest_Datasets_Form();
    }

}


// //////////////////////////////////// Logical UI Transitions ////////////////////////////////////
// This is a section for things where state needs to change on the app and then the CUSTOM user input is required.
// For example, when the user clicks to 'Draw a custom polygon', we need to hide the 'GetStarted' SubPage and hide the dimmer, 
// // wait for the user to finish drawing, and when they are done drawing, show the next sub page (Select Data)
// These bits need to be hooked up to the existing code base.

// Record the last GeoSelection State (So we can know which data request to send to the server in terms of geometry vs feature ids)
var last_GeoSelection_State = "Polygon"; // default to Polygon. // List of types are:  'Polygon' , 'Feature' , 'GeoJSON'

// default state is false, this variable only measures WHEN a user is inside the intended polygon drawing process...
// This is to account for a program control UI (UX) bug where we want the user to have to click done on the GeoJSON upload sub page.
var stateSwitchManagement_PolyDraw_or_GeoJSONUpload__IsPolyDraw = false; 

// Clear any existing Feature selections or polygons on the map.
function clear_MapSelections()
{
    // Clears drawn polygons.
    clearPolygon();
    
    // Resets the GeoJSON File Status
    set_GeoJSON_File_Upload_Indicator("No data loaded.");
    
    // Clears Selected features
    disableFeatureSelection();
}

function hide_PagesFor_MapInteraction()
{
    // Change the UI so that the map is now ready for interaction.
    hide_All_Subpages();
    g_Dimmer_Current_HideTime = 10;
    hide_Content_Dimmer();
    g_Dimmer_Current_HideTime = 500;
}

// For map selection via Polygon Drawing
function start_UserPolygonDrawing()
{
    stateSwitchManagement_PolyDraw_or_GeoJSONUpload__IsPolyDraw = true;
    
    hide_PagesFor_MapInteraction();
    
    // Show the UX message so the user knows what to do.
    hide_MapMessages();
    show_MapMessage_DrawPolygon();
        
    // Clear the map of selections.
    clear_MapSelections();
    
    // This function allows the drawing of a polygon on a vector layer by clicking on the map. // Function defined in original map manipulation code.
    enableCustomPolygonDrawing();
    
}
function end_UserPolygonDrawing()
{
    stateSwitchManagement_PolyDraw_or_GeoJSONUpload__IsPolyDraw = false;
    
    // Hide the UX Helper (Map Message)
    hide_MapMessages();
    
    // This may not be needed..
    //disableCustomPolygonDrawing();
    

    // Change the UI so that the managed SubPage flow is working.
    hide_All_Subpages();
    show_Content_Dimmer();
    show_SubPage_SelectData();
    
    // Set the last GeoSelection State to "Polygon"
    last_GeoSelection_State = "Polygon";
}


// For map selections via Feature Selection
function start_UserFeatureSelection()
{
    hide_PagesFor_MapInteraction();
    
    // Show the UX message so the user knows what to do.
    hide_MapMessages();
    show_MapMessage_SelectFeatures();
    
    // Clear the map of selections.
    clear_MapSelections();

    // Enable feature selection interaction on the map // Function defined in original map manipulation code.
    setupBaseFeatureSelection();
    setSelectionLayer(selectedLayer); // Changing the dropdown to which layer, sets 'selectedLayer' param.. we want to be able to select from that layer.
    enableFeatureSelection();  // We also want to be able to select features!
}
function end_UserFeatureSelection()
{
    // Hide the UX Helper (Map Message)
    hide_MapMessages();
    
    // Disable feature selction on the map. 
    // disableFeatureSelection()  // This pre-existing function does more than we need it to, so the next lines are only what we specifically need (but we still need it else where)
    map.un('singleclick',respondToClicks);
    clickEnabled = false;

    
    // Change the UI so that the managed SubPage flow is working.
    hide_All_Subpages();
    show_Content_Dimmer();
    show_SubPage_SelectData();
    
    // Set the last GeoSelection State to "Polygon"
    last_GeoSelection_State = "Feature";
}

// For geo selection via GeoJSON file uploading
function start_UserGeoJSONUpload()
{
    hide_PagesFor_MapInteraction();
    
    // Show the UX message so the user knows what to do.
    hide_MapMessages();
    show_MapMessage_GeoJSONUpload(); // MAYBE // show_SubPage_GeoJSONUpload();
    
    // Clear the map of selections.
    clear_MapSelections();
}
function end_UserGeoJSONUpload()
{
    // Hide the UX Helper (Map Message)
    hide_MapMessages();
    
    // No actions to do.. this is all handled by the drop file handler already.. in the pre-existing code
    
    // Change the UI so that the managed SubPage flow is working.
    hide_All_Subpages();
    show_Content_Dimmer();
    show_SubPage_SelectData();    
    
    // Set the last GeoSelection State to "GeoJSON"
    last_GeoSelection_State = "GeoJSON";
}



// //////////////////////////////////// Fragment Pages ////////////////////////////////////
//
//


// Sub Page controlls
function hide_All_Subpages(){    $(".servir_climateserv_subpage").addClass("servir_helper_hidden"); }
function show_SubPage_Welcome()     { hide_All_Subpages(); $("#subPage_Welcome").removeClass("servir_helper_hidden");       }
function show_SubPage_HowItWorks()  { hide_All_Subpages(); $("#subPage_HowItWorks").removeClass("servir_helper_hidden");    }
function show_SubPage_GetStarted()  { hide_All_Subpages(); $("#subPage_GetStarted").removeClass("servir_helper_hidden");    }
function show_SubPage_SelectArea()  
{ 
    hide_All_Subpages(); 
    $("#subPage_SelectArea").removeClass("servir_helper_hidden");    
    selectArea_OnLoad(); // UI for this sub page has some special rules.
}
function show_SubPage_SelectData()     { hide_All_Subpages(); $("#subPage_SelectData").removeClass("servir_helper_hidden");       }
function show_SubPage_JobProgress()     
{ 
    hide_All_Subpages(); 
    $("#subPage_JobProgress").removeClass("servir_helper_hidden");       
    // Also, hide the chart UI, so we an draw it fast
    $("#chartWindow").hide();
}
function show_SubPage_ChartUI()     
{ 
    hide_All_Subpages(); 
    $("#subPage_ChartUI").removeClass("servir_helper_hidden");       
    chartUI_OnLoad();  // UI for this sub page has some special rules.
}



// TEST TRANSITION   hide_All_Subpages(); show_SubPage_GetData();

// //////////////////////////////////// Transitions ////////////////////////////////////

// Simple, TO_transitions (No information about where the source is from)
function transition_To_Welcome()        {  hide_All_Subpages();    show_SubPage_Welcome();          }
function transition_To_HowItWorks()     {  hide_All_Subpages();    show_SubPage_HowItWorks();       }
function transition_To_GetStarted()     {  hide_All_Subpages();    show_SubPage_GetStarted();       }
function transition_To_SelectArea()     {  hide_All_Subpages();    show_SubPage_SelectArea();       }
function transition_To_SelectData()     {  hide_All_Subpages();    show_SubPage_SelectData();       }
function transition_To_JobProgress()    {  hide_All_Subpages();    show_SubPage_JobProgress();      }
function transition_To_ChartUI()        {  hide_All_Subpages();    show_SubPage_ChartUI();          }

// Specific From and To Transitions 
function transition_From_WelcomePage_To_HowItWorks()
{
    hide_All_Subpages(); //hide_Welcome_Page();
    show_SubPage_HowItWorks(); //show_HowItWorks_Page();
}
function transition_From_WelcomePage_To_GetStartedPage()
{
    hide_All_Subpages();
    show_SubPage_GetStarted();
}

function transition_From_HowItWorks_To_WelcomePage()
{
    hide_All_Subpages(); //hide_HowItWorks_Page();
    show_SubPage_Welcome(); //show_Welcome_Page();
}
function transition_From_HowItWorks_To_GetStarted()
{
    hide_All_Subpages();
    show_SubPage_GetStarted();
}

function transition_From_GetStarted_To_HowItWorks()
{
    hide_All_Subpages(); 
    show_SubPage_HowItWorks(); 
}
function transition_From_GetStarted_To_SelectArea()
{
    hide_All_Subpages(); 
    show_SubPage_SelectArea(); 
}


function transition_From_SelectArea_To_GetStarted()
{
    hide_All_Subpages();
    show_SubPage_GetStarted();
}

function transition_From_SelectData_To_GetStarted()
{
    hide_All_Subpages();
    show_SubPage_GetStarted();
}

function transition_From_SelectData_To_JobProgress()
{
    hide_All_Subpages();
    show_SubPage_JobProgress();
} 

function transition_From_JobProgress_To_ChartUI()
{
    hide_All_Subpages();
    show_SubPage_ChartUI();
}


// //////////////////////////////////// Event Handlers ////////////////////////////////////

// Welcome Page Buttons
function event_WelcomePage_HowItWorks_Button_Clicked()
{
    transition_From_WelcomePage_To_HowItWorks();
}
function event_WelcomePage_GetStarted_Button_Clicked()
{
    transition_From_WelcomePage_To_GetStartedPage();
}

// How It Works Page Buttons
function event_HowItWorksPage_LearningCenter_Button_Clicked()
{
    alert("event_HowItWorksPage_LearningCenter_Button_Clicked");
}
function event_HowItWorksPage_GetStarted_Button_Clicked()
{
    transition_From_HowItWorks_To_GetStarted();
}
function event_HowItWorks_TopRightX_Clicked()
{
    transition_From_HowItWorks_To_WelcomePage();
}

// Get Started Page Buttons and Handlers
function event_GetStarted_TopRightX_Clicked()
{
    // Hiding 'HowItWorks' for now.
    //transition_From_GetStarted_To_HowItWorks();
    transition_To_Welcome();
}
function event_GetStarted_DrawCustomPoly_Button_Clicked()
{
    start_UserPolygonDrawing();   
}
function event_GetStarted_ChooseFeatureOnMap_Button_Clicked()
{
    transition_From_GetStarted_To_SelectArea();
}
function event_GetStarted_LoadGeoJSONFile_Button_Clicked()
{
    start_UserGeoJSONUpload();
}

// Select Area Page Buttons and Handlers
function event_SelectArea_TopRightX_Clicked()
{
    transition_From_SelectArea_To_GetStarted();
}
function event_SelectArea_StartSelectingFromMap()
{
    start_UserFeatureSelection();
}


// Select Data Page Buttons and Handlers
function event_SelectData_TopRightX_Clicked()
{
    transition_From_SelectData_To_GetStarted();
}
function event_SelectData_ReDraw_Button_Clicked()
{
    transition_From_SelectData_To_GetStarted();
}
function event_SelectData_SubmitJob_Button_Clicked()
{
    // Set the Default JobProgress UI
    update_ProgressBar(0);
    // TODO! SET OTHER FIELDS
    
    // Show the JobProgress Page
    transition_From_SelectData_To_JobProgress();

    // Check the type of request
    // selectData_typeOfRequest
    selectData_typeOfRequest_value = "";
    try
    {
        selectData_typeOfRequest_value = $("#selectData_typeOfRequest").val()
    }
    catch(err)
    {
        selectData_typeOfRequest_value = "";
    }

    if(selectData_typeOfRequest_value == "monthly_analysis")
    {
        //submitMonthlyRainfallAnalysisRequest(); // Maybe we need to roll multiple 'MonthlyAnalysis' types together..
        submitMonthlyAnalysisRequest();
    }
    else
    {
        // This is the original route (Before the "Type of Request" option existed.)
        submitDataRequest();
    }
}

function event_Checkbox_SelectArea_ShowLabels_Countries_Changed()
{
    toggleLabel(); // Pre-existing function
}

// 
function event_Progress_TopRightX_Clicked()
{
    // Do something to cancel the submit job maybe?
    transition_To_SelectData();
}


function event_ChartUI_Button_ExportToPolygon_Clicked()
{
    savePolygon(); // Pre-existing function
}
function event_ChartUI_Button_ExportToPNG_Clicked()
{
    savePng(uniqueid); // Pre-existing function
}
function event_ChartUI_Button_ExportToCSV_Clicked()
{
    saveCSV(uniqueid, y_Axis_Label); // Pre-existing function
}
function event_ChartUI_Button_Back_Clicked()
{
    // Back to the SelectData UI
    transition_To_SelectData();
}
function event_ChartUI_Button_StartOver_Clicked()
{
    // Back to the Get Started Page.
    transition_To_GetStarted();
}
function event_ChartUI_TopRightX_Clicked() 
{
    // Back to the SelectData UI
    transition_To_SelectData();
}


// //////////////////////////////////// GeoJSON Upload Additional Functions ////////////////////////////////////

// Set HTML on the GeoJSON File_Upload_Indicator
function set_GeoJSON_File_Upload_Indicator(html_To_Set)
{
    $("#GeoJSON_File_Upload_Indicator").html(html_To_Set);
}

// Need to convert currentStringPolygon to 4326 before submitting request
function convert_PolygonString_To_4326_ForRequest(polygonString)
{
    var polyObj = JSON.parse(polygonString);
    for(var i = 0; i < polyObj.coordinates[0].length; i++)
    {
        polyObj.coordinates[0][i] = ol.proj.transform( polyObj.coordinates[0][i] , 'EPSG:102100', 'EPSG:4326');
    }
    var retString = JSON.stringify(polyObj);
    return retString;
}
function convert_PolygonString_To_4326_ForGeoJSONOutput(featureCollection)
{
    //var polyObj = JSON.parse(polygonString);
    var featureCollectionObj = JSON.parse(featureCollection);
    for(var i = 0; i < featureCollectionObj.features[0].geometry.coordinates[0].length; i++)  //for(var i = 0; i < polyObj.coordinates[0].length; i++)
    {
        featureCollectionObj.features[0].geometry.coordinates[0][i] = ol.proj.transform( featureCollectionObj.features[0].geometry.coordinates[0][i], 'EPSG:102100', 'EPSG:4326');
    }
    var retString = JSON.stringify(featureCollectionObj);
    return retString;
}
// Need to convert currentStringPolygon to 4326 before submitting request
function convert_PolygonString_To_102100_ForSystemInput(featureCollection)
{
    var featureCollectionObj = JSON.parse(featureCollection);
    if (featureCollectionObj.type == "Feature") {
        for (var i = 0; i < featureCollectionObj.geometry.coordinates[0].length; i++) 
        {
            featureCollectionObj.geometry.coordinates[0][i] = ol.proj.transform(featureCollectionObj.geometry.coordinates[0][i], 'EPSG:4326', 'EPSG:102100'); // polyObj.coordinates[0][i] = ol.proj.transform( polyObj.coordinates[0][i] , 'EPSG:4326', 'EPSG:102100');
        }
        var retString = JSON.stringify(featureCollectionObj);
        
    } else {
        for (var i = 0; i < featureCollectionObj.features[0].geometry.coordinates[0].length; i++)  //for(var i = 0; i < polyObj.coordinates[0].length; i++)
        {
            featureCollectionObj.features[0].geometry.coordinates[0][i] = ol.proj.transform(featureCollectionObj.features[0].geometry.coordinates[0][i], 'EPSG:4326', 'EPSG:102100'); // polyObj.coordinates[0][i] = ol.proj.transform( polyObj.coordinates[0][i] , 'EPSG:4326', 'EPSG:102100');
        }
        var retString = JSON.stringify(featureCollectionObj);
    }
    
    return retString;
}



// //////////////////////////////////// Chart UI Loading Popup ////////////////////////////////////
// 
// 
// <div id="chartLoadingNotification" class="servir_helper_hidden" style="position:absolute; color:black; background-color: #dddddd; padding: 2rem; border-radius: 15px; opacity: 0.9; top: 50px; left: 25%; width: 50%;">
// chartUI_Loading_Message
// chartUI_Loading_Popup
// chartUI_Loading_Title
function chartUI_Hide_LoadingNotifcation()  {    $("#chartUI_Loading_Popup").addClass("servir_helper_hidden");       }
function chartUI_Show_LoadingNotification() {    $("#chartUI_Loading_Popup").removeClass("servir_helper_hidden");    }
function chartUI_Set_LoadingTitle(html_Title)   {    $("#chartUI_Loading_Title").html(html_Title);    }
function chartUI_Set_LoadingMessage(html_Message)   {    $("#chartUI_Loading_Message").html(html_Message);    }

function chartUI_Show_ChartDrawing_State()
{
    var plottingMessage = "Plotting: ";
    // Legacy code stores the data that is about to be drawn to a global variable called 'data'
    // Also calling this function at a random times cannot garuntee that data will be set to an array.. so try/catch helps with that.
    var numOfDataPoints = "???"; 
    try
    {
        numOfDataPoints = data.length.toString();  
    }
    catch(e) {    }
    plottingMessage += numOfDataPoints;
    plottingMessage += " data points.";
    
    // Set the UI
    chartUI_Show_LoadingNotification();
    chartUI_Set_LoadingTitle("LOADING CHART");
    chartUI_Set_LoadingMessage(plottingMessage);
}
function chartUI_Show_Resizing_State()
{
    chartUI_Show_LoadingNotification();
    chartUI_Set_LoadingTitle("RESIZING CHART");
    //chartUI_Set_LoadingMessage("Resizing Chart Data");
}
function chartUI_Hide_Resizing_State()      { chartUI_Hide_LoadingNotifcation(); }
function chartUI_Hide_ChartDrawing_State()  { chartUI_Hide_LoadingNotifcation(); }  
// This needs to be called only once just after page load to set up a looping progress bar.
function chartUI_Setup_ChartLoading_Area()
{
    // Setup the progress bar
    //data-value="-1" data-total="100"
    $('#chartUI_ChartLoading_ProgressBar').progress({value:99});
    $('#chartUI_ChartLoading_ProgressBar').progress('set active');
        
    // Setup the label
}


// //////////////////////////////////// Chart UI Dynamic Height ////////////////////////////////////
// Chart UI

function get_ContentHeight()
{
    var viewHeight = $(window).height(); 
    var header = $("div[data-role='header']:visible:visible");
    var footer = $("div[data-role='footer']:visible:visible");
    var contentHeight = viewHeight - header.outerHeight() - footer.outerHeight();
    return contentHeight;
}
function update_ChartUISubPage_DynamicHeights()
{
    if( (global_ChartResizingEnabled == true) || (global_Chart_FirstDraw == true) )
    {
        // Execute this function (do nothing inside this if statement)
    }
    else
    {
        // Bail out, it turns out that resizing the chart is actually not a trival task for large datasets.. so... return here to bail out!
        return;  // Stuff below won't execute.
    }
    
    // Shows the user that the chart is now in a resizing state.. so they know why they have to wait for large charts.
    chartUI_Show_Resizing_State();
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (update_ChartUISubPage_DynamicHeights was called ) " );
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (about to call reset_dynamicSVG_to_100Percent() ) " );
    
    // Dynamic Chart width adjustment (width attr set to 100%) breaks the png saving function, however, a fixed pixel value breaks the dynamic window resizing feature.. this function call resets the state on window resize)
    reset_dynamicSVG_to_100Percent();
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (about to call get_ContentHeight() ) " );
    
    var contentHeight = get_ContentHeight();
    //var otherPartsToSubtract = (14 + 42 + 10 + 14 + 38 + 14 + 14 + 14);  // Before fine tuning the Chart UI..
    var otherPartsToSubtract = (14 + 42 + 14 + 38 + 14 + 14 + 14);  // After Fine tuning the Chart UI
    var fudgeFactor = 50;  // Was something wrong with my calculations above?? This variable gets ADDED to the ChartHeight so use this one to make small adjustments.
    var chartHeight = (contentHeight - otherPartsToSubtract) + fudgeFactor;
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (about to set chartUI_AdjustableMinHeightDiv min-height ) " );
    
    // Now set the min height of the element to this value (this forces the whole SubPage to expand vertically to fill the page)
    $("#chartUI_AdjustableMinHeightDiv").css("min-height", chartHeight);
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (about to set chartWindow min-height ) " );
    
    // One more adjustment for the direct parent container of the chart.
    var amountForBottomUI = 50; // 200 (With Screenshot, need more)
    var direct_ChartContainer_Height = chartHeight - amountForBottomUI;
    $("#chartWindow").css("min-height", direct_ChartContainer_Height); 
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (about to set chartWindow ALL CHILDREN height ) " );
    
    $("#chartWindow").children().attr("height", direct_ChartContainer_Height + "px"); // Set the chart's SVG element directly
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (about to enter try/catch block ) " );
        
    // Chart is like this.
    try
    {
        // The way the chart is originally built in the otehr file
        // var sizeObj = get_ChartSize_Info();
        // var svg = dimple.newSvg("#chartWindow", sizeObj.width, sizeObj.height);
        

        //console.log("NOW DO SOME MORE STUFF TO MAKE SURE THE ACTUAL CHART IS THE RIGHT SIZE (within the UI itself)!");


        // Set the min-height Value of the #chartWindow (Child div of 'chartUI_AdjustableMinHeightDiv' which holds the legacy chart)
        // Then the first child of #chartWindow is an SVG element with a width and height value.. something is wrong with the code and I am getting negative numbers for this.
        // // These numbers are ACTUALLY what control the render size of the chart.... so... fix that bug and most of this may work..
        var theChartReference = global_legacy_Chart;       // Gets the Reference from other code..
        
        // Get the latest dimensions
        
        //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (try/catch block: about to call get_ChartSize_Info() ) " );
        
        var sizeObj = get_ChartSize_Info();
        var boundsAdjustment_Height = -70; //-50;  // -200 For when there is a screenshot UI
        var boundsAdjustment_Width = -125;
        
        // This is one of the resizing bottlenecks and we need to call this function at least once when drawing a new chart.
        // If it is the first time through drawing the chart OR if it chart resizing is enabled, let this through.
        //if( (global_ChartResizingEnabled == true) || (global_Chart_FirstDraw == true) )
        //{
        //
        //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (try/catch block: about to call (dimple) theChartReference.setBounds(params) ) " );
        theChartReference.setBounds(60,25, (sizeObj.width + boundsAdjustment_Width), (sizeObj.height + boundsAdjustment_Height) );
        //
//}
        // Set the props on the chart's svg object
        //theChartReference.svg[0] 
        
        // Setting the width to 100% broke 
        
        //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (try/catch block: about to call (dimple) theChartReference.draw(0, true) ) " );
        //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (try/catch block: REMOVED: (dimple) theChartReference.draw(0, true) ) " );
        
        //theChartReference.draw(0, true);            // Redraws the chart
    }
    catch(errRedrawingChart)
    {
        
    }
    
    // Removes the Chart Loading pop up, so the user can do stuff with the chart.
    chartUI_Hide_Resizing_State();
    
    // Now lets draw the chart, only if this is the first time..
    chartUI_Show_ChartDrawing_State();
    setTimeout(function(){ draw_chart_WithData(); }, 100);
    
    //console.log("update_ChartUISubPage_DynamicHeights: " + Date() + " (update_ChartUISubPage_DynamicHeights reached the end! ) " );
}
var global_ChartResizingEnabled = false;
var global_Chart_FirstDraw = true;
function draw_chart_WithData()
{
	
    try
    {
        var theChartReference = global_legacy_Chart;
        if(global_Chart_FirstDraw == true)
        {
			
			theChartReference.draw(0, false);  // chart.draw(duration, noDataChange);
			// Tried to hide the UI, draw the chart, and then unhide it... no luck.. (timeout is so jquery does the hide before the drawing starts..
            //console.log("draw_chart_WithData: Set chart Div to hidden right here...... YES");
			//$("#chartWindow").hide();
			//setTimeout(function(){ theChartReference.draw(0, false); $("#chartWindow").show(); console.log("draw_chart_WithData: Set chart Div to visible right here...."); }, 100);
			
			
            global_Chart_FirstDraw = false;
        }
        else
        {
            theChartReference.draw(0, true);
        }

        // 0,'', 
        // function() 
        // {
        //     theChartReference.draw(0, true);  // Calling this again fixes the labels around the chart.
        // }
        
        // Now that the chart drawing is done... show the chart.
        $("#chartWindow").show();  
        chartUI_Hide_ChartDrawing_State();
        if(is_safari == true)
        {
            // Reposition the axis on the chart
            setTimeout(function()
            {
                // Reposition the y value of the left axis (moving it slightly to the left)
                var current_left_axis_y_value = $(".dimple-title")[1].getAttribute('y');
                $(".dimple-title")[1].setAttribute('y', (current_left_axis_y_value - 20) );

                // Reposition the y value of the bottom axis (moving it slightly down)
                var current_bottom_axis_y_value = $(".dimple-title")[0].getAttribute('y');
                $(".dimple-title")[0].setAttribute('y', ( (current_bottom_axis_y_value * 1) + 20) );


            }, 2500);
            
            //$(".dimple-title")[1].setAttribute('y',182)
        }
        else
        {
            theChartReference.draw(0, true);  // Calling this again fixes the labels around the chart.
        }   

    }
    catch(errDrawingChart)
    {
        chartUI_Hide_ChartDrawing_State();
    }

    // KS Refactor 2017 - Patch-up fix for styles
    // Chart is done resizing... now we need to determine if there is only one y axis.. if so, then we need to set all the elements to this style.
    //$(".dimple-series-0").add('style').css("fill","#8fd4bd");
    //$(".dimple-series-0").add('style').css("stroke","#8fd4bd");
    try
    {
        // This is a definition that only exists for MonthlyRainfallAnalysis types at this time.
        if(global_legacy_Chart.series[0].categoryFields[0] == "data_series_type")
        {
console.log("data_series_type");
            // Do nothing, we want default dimple styles.
        }
		else if(dataType == 25){
			console.log("25");
		    $(".dimple-series-0").add('style').css("stroke","#8fd4bd");
			$(".dimple-series-0").add('style').css("fill","none");
		}
        else
        {
			console.log("nothing");
            // Most likely this chart only has 1 series... use this.
            $(".dimple-series-0").add('style').css("fill","#8fd4bd");
		    $(".dimple-series-0").add('style').css("stroke","#8fd4bd");
        }
    }
    catch(err_finding_multiple)
    {
		if(dataType == 25){
			console.log("25");
		    $(".dimple-series-0").add('style').css("stroke","#8fd4bd");
			$(".dimple-series-0").add('style').css("fill","none");
		}
		else{
        // This chart is most likely a simple one series chart, go with the style for one series.
        $(".dimple-series-0").add('style').css("fill","#8fd4bd");
		$(".dimple-series-0").add('style').css("stroke","#8fd4bd");
		}
    }
}

// To make the chart flexible in the x direction, the svg width was set to 100%.  
// This change breaks the SVG saving.  So just before saving the svg, the width is set to a snapshot of whatever it is at the time the button is clicked.
// TempSet Chart Width 
function set_dynamic_patch_ChartWidth_for_SVGSaving()
{
    var chart_PX_Width_Value = Math.floor($("svg").width());
    $("svg").attr("width", chart_PX_Width_Value.toString());
}
function reset_dynamicSVG_to_100Percent()
{
    $("svg").attr("width", "100%");
}

// ChartUI Button Display
// If User's last state was to draw a polygon, then show the export polygon, otherwise, hide it.
function chartUI_OnLoad()
{
    // Set the Date for the Chart Creation
    init_ChartUI_DateCreated();
    
    // Check the last map interaction state..
    if(last_GeoSelection_State === "Polygon") 
    {
        // show 'export polygon' button,
        $("#chartUI_ButtonContainer_ExportPolygon").removeClass("servir_helper_hidden");
    }
    else
    {
        // hide 'export polygon' button
        $("#chartUI_ButtonContainer_ExportPolygon").addClass("servir_helper_hidden");
    }
    
}
var bdata;
var bItems = [];
// For Displaying the Date a chart was created.
function init_ChartUI_DateCreated()
{
	if(dataType == "0")
	{
		$.getJSON( "json/stats.json", function( data ) {
			bdata = data;
		  var items = [];
		  $.each( bdata.items, function( val, item ) {
			if(item.name == "chirps"){
				var chartCreatedDate_String = "Station-corrected CHIRPS data is available until: ";
				theSplitDate = item.Latest.split(" ");
				chartCreatedDate_String += theSplitDate[1] + "/" + theSplitDate[0] + "/" + theSplitDate[2] + ", subsequent data is from the CHIRP data stream.";
				$("#chartUI_ChartCreatedDate_Label").html(chartCreatedDate_String);
			}
		  }) 
		});
	}
	else
	{
	
	    var chartCreatedDate_String = "Chart created on: ";
	    var now = new Date();
	    chartCreatedDate_String += now.toDateString();
    		$("#chartUI_ChartCreatedDate_Label").html(chartCreatedDate_String);
	}
}
    
// //////////////////////////////////// Select Area Map Position Fix ////////////////////////////////////
// Issue: Select Area UI covers one of the layers that can be selected for (by default).
// Solution: Move the map's position on selection to the area where the covered layers are located so they are visible on the map when selected.

// Starting position
var g_SelectArea_StartingCenter = [0,0];
var g_SelectArea_StartingZoom = 3;

// FTF ZOI Map Positions
var g_SelectArea_FTFZOI_MapCenter = ol.proj.transform([-15,16.5], 'EPSG:4326', 'EPSG:102100'); //[-15,16.5];
var g_SelectArea_FTFZOI_MapZoom = 7;
function selectArea_SaveCurrent_MapState()
{
    g_SelectArea_StartingCenter = map.getView().getCenter();
    g_SelectArea_StartingZoom = map.getView().getZoom();
}
function selectArea_Set_MapState_To_SavedState()
{
    map.getView().setCenter(g_SelectArea_StartingCenter);
    map.getView().setZoom(g_SelectArea_StartingZoom);
}
function selectArea_Set_MapState_To_FTFZOI()
{
    map.getView().setCenter(g_SelectArea_FTFZOI_MapCenter);
    map.getView().setZoom(g_SelectArea_FTFZOI_MapZoom);
}

// Also need to move the Element a little bit
var g_SelectArea_Default_Element_PositionPercent = "0%";
var g_SelectArea_FTFZOI_Element_PositionPercent = "-70%";
function selectArea_Set_Element_TopPosition_To_Default()
{
    $("#selectArea_Movable_ID").css("top", g_SelectArea_Default_Element_PositionPercent);
}
function selectArea_Set_Element_TopPosition_To_FTFZOI()
{
    $("#selectArea_Movable_ID").css("top", g_SelectArea_FTFZOI_Element_PositionPercent);
}



// Controls
function selectArea_OnLoad() 
{  
    selectArea_SaveCurrent_MapState(); 
    
    // Restore the state of the Countries Feature layer, This is a consequence of that layer being set to true by default AND it being the first option that is preselected on this UI.
    if($("#selectmenu").val() == "0") 
    {
        // this value is initially set to false by commenting some code at ('servirnasa.js' line: 150 //visible = true;).  This makes the server side control of sending a starting visible value ineffective.
        tileLayers[0].setVisible(true);  // Search index.html javascript 'map' code to find where this is used and look at servirnasa.js function 'processFeatureLayers' to see where it is initially added to the map as a result of an ajax call.        
    }
    
    // Conditionally show or hide the checkbox area
    if(show_CHIRPS_Custom_GIS_Labels == true)
    {
        // show the checkbox for selecting labels
        $("#SelectArea_ShowLabels_Label_Part").removeClass("servir_helper_hidden");
        $("#SelectArea_ShowLabels_Checkbox_Part").removeClass("servir_helper_hidden");
         
    }
    else
    {
        // Hide the checkbox for selecting labels
        $("#SelectArea_ShowLabels_Label_Part").addClass("servir_helper_hidden");
        $("#SelectArea_ShowLabels_Checkbox_Part").addClass("servir_helper_hidden");
    }
    
}
function selectArea_Set_BusinessView_To_Default() 
{
    selectArea_Set_MapState_To_SavedState();
    selectArea_Set_Element_TopPosition_To_Default();
}
function selectArea_Set_BusinessView_To_FTFZOI() 
{
    selectArea_Set_MapState_To_FTFZOI();
    selectArea_Set_Element_TopPosition_To_FTFZOI();
}
function selectArea_SelectAreasBy_Dropdown_Changed_Event()
{
    var selectAreasBy_Value = $("#selectmenu").val();
    // Value of 3 is the option for 'FTF ZOI'
    if(selectAreasBy_Value == "3") { selectArea_Set_BusinessView_To_FTFZOI(); }
    else { selectArea_Set_BusinessView_To_Default(); }
}



// //////////////////////////////////// Screenshot of Selected Area on Map ////////////////////////////////////

// KS // NEED TO SOLVE CROSS ORIGIN SCRIPTING ISSUE ON THE SERVERSIDE FOR THIS SORT OF FEATURE TO WORK SMOOTHLY AND ACCROSS MULTIPLE BROWSERS..
//// Export Map as PNG (openlayers 3 feature)
//function export_Map_As_PNG()
//{
//    
//}
//
//// Test Base64 Image
//function test_get_base64_imgSrc()
//{
//    return "data:image/png;base64,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";
//}
////
////// Get Screen from map
////function get_Screenshot_From_Map()
////{
////    
////    
////    var canvasElement = $(".ol-viewport canvas")[0];
////    var canvasContext = $(".ol-viewport canvas")[0].getContext('2d');
////    
////    var mapState_As_Base64Image = $(".ol-viewport canvas")[0].toDataURL('image/png');
////    var jpegUrl = canvas.toDataURL("image/jpeg");
////    var pngUrl = canvas.toDataURL(); // PNG is the default
////}
////
////// Convert Canvas to Base64
////
//
// 
//// Canvas to Base64 
//function exec_Screenshot_From_Map_To_ChartUI()
//{
//    
//    var mapScreenshot = $(".ol-viewport canvas")[0].toDataURL('image/png');
//    
//    // Clear any existing children of the screenshot container.
//    $("#chartUI_ScreenshotContainer").empty();
//    
//    var img = new Image();
//    img.crossOrigin = "anonymous";
//    img.src = 
//    
//    // Place the screenshot in the image.
//    $("#chartUI_ScreenshotContainer").append($('<img>', 
//    { 
//        src : test_get_base64_imgSrc(), 
//        width : 16, 
//        height : 16, 
//        alt : "Test Image", 
//        title : "Test Image"
//    }));
//}

// //////////////////////////////////// Design Init Items ////////////////////////////////////
function init_ToolTips()
{
    try{
		$('#helpIcon_SelectData_DataSource_ToolTip').popup({ hoverable: true, position: 'right center', delay: { show: 300, hide: 800 }, popup: $('#popup_SelectData_DataSource_ToolTip'),  lastResort: 'right center', onShow: function(){resizePopup();} });
	}
	catch(e){}
    if ($("#popup_SelectData_DataSource_ToolTip1").css("display") == "none") {
        $('#helpIcon_SelectData_DataSource_ToolTip').popup({ hoverable: true, position: 'right center', delay: { show: 300, hide: 800 }, popup: $('#popup_SelectData_DataSource_ToolTip'),  lastResort: 'right center', onShow: function(){resizePopup();} });

    }
	try{
		$('#helpIcon_SelectData_Calculations_ToolTip').popup({ hoverable: true, position: 'right center', delay: { show: 300, hide: 800 }, popup: $('#popup_SelectData_Calculations_ToolTip'),  lastResort: 'right center', onShow: function(){resizePopup();} });
	}
	catch(e){}
     if ($("#popup_SelectData_Calculations_ToolTip1").css("display") == "none") {
        $('#helpIcon_SelectData_Calculations_ToolTip').popup({ hoverable: true, position: 'right center', delay: { show: 300, hide: 800 }, popup: $('#popup_SelectData_Calculations_ToolTip'),  lastResort: 'right center', onShow: function(){resizePopup();} });

    }
    
}

// //////////////////////////////////// Init Legacy Code ////////////////////////////////////
// Look in 'servirnasa.js' or 'index.html' to find where these functions are defined.
function init_LegacyCode()
{
    checkMaintenanceMode();
    getParameterTypes();
    getFeatureLayers();
    // KS Refactor 2015 // Set up for Climate Model Infos
    getClimateModelInfo();
    // KS Refactor for Imerg and Smap, // Get info for these datasets
    getCapabilitiesForDataset(26);  // Imerg 1 Day
    //getCapabilitiesForDataset(27);  // Smap
}


// //////////////////////////////////// Dynamic Element Defaults ////////////////////////////////////
function set_Dynamic_Element_Defaults()
{
    // Select Data form should be showing us the Default form, and not the SeasonalForecast one.
    hide_SelectDataForms();
    show_SelectDataForm_Default();

    // Show the "Datasets" Select Data Form
    selectData_typeOfRequest_Changed('datasets');
}
// //////////////////////////////////// Page Entry Point ////////////////////////////////////

function getURL_Params_As_JS_Object()
{
    var search = location.search.substring(1);
    var urlParams = search?JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
    return urlParams;
}

// Check url params for short cut popup state links
function starting_UI_PopupOverride_Checkpoint()
{    
    try
    {
        var urlParams = getURL_Params_As_JS_Object();
        if(urlParams.s == "getstarted")
        {
            show_SubPage_GetStarted();
            return;
        }
        else if (urlParams.s == "howitworks")
        {
            show_SubPage_HowItWorks();
            return;
        }
    }
    catch(errShortCutToPage)
    {
        
    }
    
    // Default action, show the Welcome page..
    show_SubPage_Welcome();
}

// Entry point of code execution - post load
$(document).ready(function()
{
    // Putting an extra call to show content dimmer here, should help avoid the flash that happens as the map loads before the dimmer is on the page.
    show_Content_Dimmer();

    // Logic needed AFTER code and page are loaded...
    init_ToolTips();
    
    // Init Legacy Code
    init_LegacyCode();
    
    set_Dynamic_Element_Defaults();
    
    
    // Start the application by showing the welcome page...
    setTimeout(function()
    { 
        // KS Note: First show Welcome page should take a bit longer to fade in .. to give that little movie theater experience 
        g_Dimmer_Current_ShowTime = g_Dimmer_First_ShowTime;
        
        // Originally, Just show the Welcome page, but since we can link directly to other subpages (via urlParams), now we check
        //show_SubPage_Welcome();    //show_Welcome_Page();
        starting_UI_PopupOverride_Checkpoint();
        
        show_Content_Dimmer();
        g_Dimmer_Current_ShowTime = g_Dimmer_Normal_ShowTime;

        // Bring Map back up to visible behind the dimmer
        setTimeout(function() {set_map_opacity_to_visible();}, 500);

    }, g_Show_Welcome_Page_Delay);
    
    // Sets up the Loading popup on the Chart UI Page (So the progress bar appears to be in an infinite loop)
    chartUI_Setup_ChartLoading_Area();
    
    // Recalculates the Chart Area Sizes
    //update_ChartUISubPage_DynamicHeights();
    // Setting the resizing event of the window to also do the Chart UI Update // Event Handler for window.onresize
    window.onresize = function(event) 
    {
        fixContentHeight();  // This is important, this fixes the map content div height so the page's vertical rendering happens correctly.
        update_ChartUISubPage_DynamicHeights();
    };
});







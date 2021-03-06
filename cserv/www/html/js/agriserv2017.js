/* 
 * Description: Clientside code for Agriserv
 * Author: Kris Stanton (SERVIR Project)
 * Date: May/June 2016
 * Last Update: August 2017 by Sarva Pulla
 */
var confirm_value;
if (window.location.hostname === 'localhost')  // This breaks for 'file:///' loads.. but thats ok!
{
    confirm_value = confirm("Use Localhost API Server?  Select 'OK' to use the localhost as the data source for API Server.  Select 'cancel' to use the Live Server");
}
if (confirm_value == true) {

    isLocalMode = true;
    var baseurl = "http://localhost/";
    var baserequesturl = "http://localhost:8000/";

    // KS Refactor Design 2016 // Changing Map Layers from 4326 to 3857
    var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/jeburks/work/SERVIR/data/GIS/mapfiles/servir.map"; // jeburks dev
    var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/kris/work/SERVIR/data/GIS/mapfiles/servir.map"; // ks dev
    var baseWMSurl = "http://localhost/cgi-bin/mapserv?map=/Users/kris/work/SERVIR/data/GIS/mapfiles/servir.map"; // ks dev

} else {
    isLocalMode = false;
    var hostName = "agriserv.servirglobal.net"; //"chirps.nsstc.nasa.gov";
    var baseurl = "https://" + hostName + "/";
    var baserequesturl = "https://" + hostName + "/chirps/";

    var baseWMSurl = "https://" + hostName + "/cgi-bin/servirmap_102100?";
}

function getFeatureLayers() {
    $.getJSON(baserequesturl + 'getFeatureLayers/?callback=?', function (data) {
        processFeatureLayers(data);
    });
}

function processFeatureLayers(data) {

    for (i = 0; i < data.length; i++) {
        var visible = false;
        if (data[i]['visible'] === 'true') {
            //visible = true;  // KS Refactor Design 2016 Override // We want all of the feature layers to be visible false by default.
        }
        addLayer(data[i]['displayName'], data[i]['id'], visible);
    }
}

function getMODISLayers() {
    $.getJSON('https://gis1.servirglobal.net/arcgis/rest/services/Global?f=pjson&callback=?', function (data) {
        processMODISLayers(data);
    });
}

function processMODISLayers(data) {
    $.each(data.services, function (i, service) {
        if (JSON.stringify(service).indexOf('MODIS_Land') !== -1) {
            var wmsURL = 'https://gis1.servirglobal.net/arcgis/services/' + service.name + '/MapServer/WMSServer?';
            var wmsSource = new ol.source.ImageWMS({
                url: wmsURL,
                params: {
                    LAYERS: 0,
                }
            });
            var wmsLayer = new ol.layer.Image({
                source: wmsSource,
                name: 'Land Cover ' + service.name.slice(-4),
                visible: false
            });
            MODISLayers.push(wmsLayer)
        }

    });
}
////Close the editor dialog.
function closeNewEditorDialog() {
    $("#editordialog").dialog("close");
}

//// Check for Maintenance Mode (By checking to see if the API is responding or not)
function checkMaintenanceMode() {
    // If the API is not responding, forward the user to the maintenance.html page.
    $.ajax({
        url: baserequesturl + 'getParameterTypes/?callback=?',
        type: "get",
        //data: data,
        dataType: "json", //"jsonp",
        //jsonpCallback: 'successCallback',
        async: false, //true,
        beforeSend: function () { },
        complete: function () { },
        success: function (result) { },
        error: function (request, error) {
            var basePathAddition = "/";
            if (isLocalMode == true) {
                basePathAddition += "/";
            }
            var newLocation = window.location.origin + basePathAddition + "maintenance.html";

            // Forward to a new page
            //window.location.href = newLocation;
        },
        successCallback: function () { }
    });
}


// ////////////////////////////////   Utilities    /////////////////////////////////////

// Generate 4 byte hex string
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

// Generate a Local Request ID (Used to uniquely identify individual requests and connect them to their usecase
function generate_LocalRequest_ID_as_s8() {
    return s4() + s4()
}

// ////////////////////////////////   MULTI REQUEST HANDLING    ////////////////////////////////

// Data Model Stuff
var requests_Waiting_ToMake = [];       // Requests in the queue waiting to be submitted to the API
var requests_Waiting_ForData = [];      // Requests that are waiting for data

function add_RequestTo_WaitingToMake_Queue(theRequest) {
    // Check for too many here??  or check for anything else
    requests_Waiting_ToMake.push(theRequest);
}
function add_RequestTo_WaitingForData_Queue(localJobID, serverJobID, jobProgressValue) {
    var request_Waiting_For_Data_Object = {
        "localJobID": localJobID,
        "serverJobID": serverJobID,
        "jobProgressValue": jobProgressValue
    };
    requests_Waiting_ForData.push(request_Waiting_For_Data_Object);

    // Modify the original object to store the serverJobID
    set_ServerJobID_To_UseCaseA_Request(serverJobID, localJobID);
}

// Intervals
var interval_Seconds_To_CheckRequestQueues = 1;

// Set interval function to check for requests and request results
var checkRequestQueues = false;

// Start the intervals
function startIntervals() {
    // Interval for checking all the request queues and processing them
    checkRequestQueues = setInterval(function () { multiRequest_CheckRequests() }, interval_Seconds_To_CheckRequestQueues * 1000);
}
// clear the intervals
function stopIntervals() {
    clearInterval(checkRequestQueues);
    checkRequestQueues = false;
}

// Function called every N time interval that checks all the queues and makes function calls based on state.
// Check Queues... Take Action...
function multiRequest_CheckRequests() {

    // Checking for job progress
    if (requests_Waiting_ForData.length === 0) {
        // Queue is empty, Do nothing
    }
    else {
        // There is at least 1 item that needs to be checked for request progress.. do that now.
        var currentRequestToCheck = requests_Waiting_ForData.shift();       // Remove first element

        // Make the request to check job status.
        agriserv_AJAX__getDataRequestProgress(currentRequestToCheck.serverJobID, currentRequestToCheck.localJobID);

        return;
    }

    // Check requests_Waiting_ToMake, if any request is found, pull it out of the array, 
    if (requests_Waiting_ToMake.length === 0) {
        // Queue is empty, Do nothing
    }
    else {
        // There is at least 1 item in the request queue.. make that request now.
        var creq = requests_Waiting_ToMake.pop();   // currentRequestToMake

        // Lets first see if this request already has a server job ID.
        var isMakeNewRequest = recoverRequest_Checkpoint(creq);

        // Make the Request to ClimateSERV's API
        if (isMakeNewRequest == true) {
            agriserv_AJAX__Submit_New_DataRequest(creq.cservParam_datatype, creq.cservParam_operationtype, creq.cservParam_intervaltype, creq.cservParam_begintime, creq.cservParam_endtime, creq.UsePolyString, creq.cservParam_geometry, creq.cservParam_layerid, creq.cservParam_featureids, creq.LocalID);
        }

        return;
    }

    usecaseObj_MightBe_PostProcessReady_EventHandler();

}

// Sometimes a job gets submitted, and before the job can return a valid status, it gets lost in the pipeline.
// These functions support job recovery.
function recoverRequest_Checkpoint(creq) {
    if (typeof (creq.ServerJobID) === "undefined") {
        // This is the first time through.. let it through.
        return true;
    }
    else {
        // This object already has a serverjob ID, 
        // Lets now check the counter.
        if (creq.LostRequestCounter > 3) {
            // Request has attempted recovery 3 times already.. 

            // Lets now check to see if we have already previously resubmitted the request
            if (creq.SecondChanceFlag == true) {
                // The request has failed submission to the server twice now,
                // Either there is something wrong with the server, the area of interest has no data, or something is wrong with the users connection.
                alert("There was a problem with this request.  Possible causes: The area of interest selected has no data, the connection between the client machine and server is down, or ClimateSERV is experiencing technical difficulties.");
                // Don't let the request through.
                return false;
            }
            else {
                // This is the second time through, Set the flag and Let the request through.
                set_SecondChanceFlag_For_UseCaseA_Request(true, creq.ServerJobID);
                return true;
            }
        }
        else {
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

// Checks for requests that are ready for the queue system. 
function pull_Requests_To_QueueSystem() {
    // Check for new requests that need to be made!
    // handle case where object is just blank (or hasn't been setup yet)

    if (global_CurrentUseCaseObject === null) {
        // Object is not in a ready state.
        // Do nothing
    }
    else {
        // Check for new requests that need to be made
        var requests_WithMissingResults = get_Requests_From_UseCaseA_Object_WithMissingData(global_CurrentUseCaseObject);
        for (var i = 0; i < requests_WithMissingResults.length; i++) {
            // Pushes the 
            add_RequestTo_WaitingToMake_Queue(requests_WithMissingResults[i]);

        }

    }
}

// Check the ready state of the use case object (We want to know if all requests have been processed yet.)
function is_UseCaseRequestDataIn() {
    if (global_CurrentUseCaseObject === null) {
        // Object is not even init yet
        return false;
    }
    var requests_WithMissingResults = get_Requests_From_UseCaseA_Object_WithMissingData(global_CurrentUseCaseObject);
    if (requests_WithMissingResults.length === 0) {
        // All requests should be done now..
        return true;
    }
    return false;
}

// If any of the queues are not empty
function is_RequestPipelineRunning() {
    //[requests_Waiting_ToMake, requests_Waiting_ForData, requests_DataReady]
    if (requests_Waiting_ToMake.length > 0) { return true; }
    if (requests_Waiting_ForData.length > 0) { return true; }
    return false;
}

// Is the use case object ready for the post request processing of data?
function is_UseCase_Ready_For_PostProcessing() {
    // Is the request pipeline running?
    if (is_RequestPipelineRunning() == true) { return false; }
    // Is all the requested data already loaded in the Use Case object?
    return is_UseCaseRequestDataIn(); //if(is_UseCaseRequestDataIn() == false
}
var colors = ['green', 'orange', 'blue', 'fuchsia', 'gray', 'black',
    'lime', 'maroon', 'navy', 'olive', 'aqua', 'purple', 'red',
    'silver', 'teal', 'yellow'];
function splitSeriesByYear(id) {
    var chart = $('#' + id).highcharts();
    var seriesType = chart.options.chart.defaultSeriesType;

    var max_year = global_CurrentUseCaseObject.YearEnd + 1;

    if ((seriesType == "bar") || (seriesType == "pie")) {
        // Unable to do year on year with these types
        return;
    }
    // get max year

    $.each(chart.series, function (i, series) {
        $.each(series.data, function (j, data) {
            var date = new Date(data.category);
            var year = date.getUTCFullYear();

            if (year > max_year) {
                max_year = year;
            }
        });
    });

    // get new series
    var new_series = [];
    $.each(chart.series, function (i, item) {
        if (i == 0) {
            var new_items = splitOneSeries(item, max_year, "Solid");
            $.each(new_items, function (i, new_item) {
                new_series.push(new_item);
            });
        } else {
            var new_items = splitOneSeries(item, max_year, "LongDash");
            $.each(new_items, function (i, new_item) {
                new_series.push(new_item);
            });
        }

    });

    while (chart.series.length > 0) {
        chart.series[0].remove(true);
    }

    $.each(new_series, function (i, item) {
        chart.addSeries(item);
    });
}


function splitOneSeries(series, max_year, dashStyle) {
    var years = [];
    var all_data = [];
    var new_series = [];

    $.each(series.data, function (i, data) {
        var date = new Date(data.category);
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth();
        var date = date.getUTCDate();
        if (years.indexOf(year) == -1) {
            years.push(year);

            new_series.push({
                name: series.name + " - " + year,
                data: [],
                pointStart: Date.UTC(2010, 0, 1),
                pointInterval: 24 * 3600 * 5000,
                dashStyle: dashStyle
            });
        }

        var index = years.indexOf(year);
        new_series[index].color = colors[index];
        if (index == -1) {
            // This is probably because there's only 
            console.log("Unable to find year " + year + " from date " + data.category);
        } else {
            new_series[index].data
                .push([data.y]);

        }
    });
    return new_series;
}


// Check pipeline and status... re-run request data at this point.
function usecaseObj_MightBe_PostProcessReady_EventHandler() {
    if (is_UseCase_Ready_For_PostProcessing() === true) {
        // We are ready.. 

        if (BillyZjobCount == 0) {
            stopIntervals();

            var maxValue = getMaxValue(global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData, global_CurrentUseCaseObject.AOIs[1].NDVIRequest.resultData.GranuleData);
            series1 = formatData(global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData);
            series2 = formatData(global_CurrentUseCaseObject.AOIs[1].NDVIRequest.resultData.GranuleData);

            chirps1 = formatData(global_CurrentUseCaseObject.AOIs[0].CHIRPSRequest.resultData.GranuleData);
            chirps2 = formatData(global_CurrentUseCaseObject.AOIs[1].CHIRPSRequest.resultData.GranuleData);


            try {
                $("#plot").empty();
                $("#plot-years").empty();
                $("#chirps-plot").empty();
                $("#chirps-years").empty();


                Highcharts.stockChart('plot', {
                    chart: {
                        events: {
                            redraw: function () {
                                update_aoi_maps();
                            }
                        }
                    },
                    rangeSelector: {
                        allButtonsEnabled: true,
                        selected: 5
                    },
                    legend: {
                        enabled: true
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    navigator: {
                        enabled: true
                    },
                    title: {
                        text: "NDVI Comparison",
                    },
                    tooltip: {
                        crosshairs: false,
                    },
                    xAxis: {
                        crosshair: false
                    },
                    yAxis: {
                        opposite: false,
                        crosshair: false,
                        title: {
                            text: "NDVI"
                        },
                        plotLines: [{
                            id: 'threshold',
                            value: maxValue,
                            color: 'red',
                            dashStyle: 'solid',
                            width: 3,
                            label: {
                                text: 'Threshold'
                            },
                            onDragFinish: function (newThresholdValue) {
                                select_NDVIBottomThreshold_Changed(newThresholdValue);
                                //$("#plot-years").highcharts().yAxis[0].plotLinesAndBands[0].options.value = newThresholdValue
                                $("#plot-years").highcharts().update({
                                    yAxis: {
                                        opposite: false,
                                        title: {
                                            text: "NDVI"
                                        },
                                        plotLines: [{
                                            id: 'threshold',
                                            value: newThresholdValue,
                                            color: 'red',
                                            dashStyle: 'SolidDash',
                                            width: 3,
                                            label: {
                                                text: 'Threshold'
                                            }
                                        }]
                                    }
                                });
                            }
                        }]

                    },
                    exporting: {
                        enabled: true,
                        chartOptions: {
                            chart: {
                                events: {
                                    load: function () {
                                        update_aoi_maps();
                                        getMapScreenshot();
                                        $('.credits').remove();
                                        var chart = this,
                                            width = chart.chartWidth - 190,
                                            height = chart.chartHeight - 40;
                                        this.renderer.image(aoiPNG1, width - 265, height, 50, 25).add();
                                        this.renderer.image('https://agriserv.servirglobal.net/images/Servir_Logo_Full_Color_Large.png', width + 90, height, 100, 25).add();
                                    }
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'line',
                        data: series1,
                        name: "NDVI AOI 1",
                        color: "green"
                        //"#028c20"
                    }, {
                        type: 'line',
                        data: series2,
                        name: "NDVI AOI 2",
                        color: "orange"
                        //e2850b
                    }]

                }, function (chart) {
                    draggablePlotLine(chart.yAxis[0], 'threshold');
                });

                Highcharts.chart('plot-years', {
                    chart: {
                        type: 'line',
                        zoomType: 'x',
                        events: {
                            redraw: function () {
                                update_aoi_maps();
                            },
                        }
                    },
                    legend: {
                        enabled: true
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        shared: true,
                        crosshairs: true,
                        dateTimeLabelFormats: {
                            day: "%b %e"
                        }
                    },
                    title: {
                        text: "NDVI Year on Year",
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: '{value:%b %e}'
                        }
                    },
                    yAxis: {
                        opposite: false,
                        title: {
                            text: "NDVI"
                        },
                        plotLines: [{
                            id: 'threshold',
                            value: maxValue,
                            color: 'red',
                            dashStyle: 'SolidDash',
                            width: 3,
                            label: {
                                text: 'Threshold'
                            }
                        }]
                    },
                    exporting: {
                        enabled: true,
                        chartOptions: {
                            chart: {
                                events: {
                                    load: function () {
                                        update_aoi_maps();
                                        getMapScreenshot();
                                        $('.credits').remove();
                                        var chart = this,
                                            width = chart.chartWidth - 190,
                                            height = chart.chartHeight - 40;
                                        //this.renderer.image(aoiPNG1, width - 265, height, 50, 25).add();
                                        this.renderer.image('https://agriserv.servirglobal.net/images/Servir_Logo_Full_Color_Large.png', width + 90, height, 100, 25).add();
                                    }
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'line',
                        data: series1,
                        name: "NDVI AOI 1"
                    }, {
                        type: 'line',
                        data: series2,
                        name: "NDVI AOI 2"
                    }]

                }, function (chart) {
                    //chart.renderer.image(aoiPNG2, width, height, 100, 50).addClass('credits').add();
                });

                Highcharts.stockChart('chirps-plot', {
                    rangeSelector: {
                        allButtonsEnabled: true,
                        selected: 5
                    },
                    legend: {
                        enabled: true
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    navigator: {
                        enabled: true
                    },
                    title: {
                        text: "CHIRPS Comparison",
                    },
                    yAxis: {
                        opposite: false,
                        title: {
                            text: "CHIRPS Rainfall"
                        },
                    },
                    exporting: {
                        enabled: true,
                        chartOptions: {
                            chart: {
                                events: {
                                    load: function () {
                                        update_aoi_maps();
                                        getMapScreenshot();
                                        $('.credits').remove();
                                        var chart = this,
                                            width = chart.chartWidth - 190,
                                            height = chart.chartHeight - 40;
                                        this.renderer.image(aoiPNG1, width - 275, height, 50, 25).add();
                                        this.renderer.image('https://agriserv.servirglobal.net/images/Servir_Logo_Full_Color_Large.png', width + 90, height, 100, 25).add();
                                    }
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'line',
                        data: chirps1,
                        name: "CHIRPS AOI 1",
                        color: "green"
                    }, {
                        type: 'line',
                        data: chirps2,
                        name: "CHIRPS AOI 2",
                        color: "orange"
                    }]

                });

                Highcharts.chart('chirps-years', {
                    chart: {
                        type: 'line',
                        zoomType: 'x'
                    },
                    legend: {
                        enabled: true
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        shared: true,
                        crosshairs: true,
                        dateTimeLabelFormats: {
                            day: "%b %e"
                        }
                    },
                    title: {
                        text: "CHIRPS Year on Year",
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: '{value:%b %e}'
                        }
                    },
                    yAxis: {
                        opposite: false,
                        title: {
                            text: "CHIRPS"
                        }
                    },
                    exporting: {
                        enabled: true,
                        chartOptions: {
                            chart: {
                                events: {
                                    load: function () {
                                        update_aoi_maps();
                                        getMapScreenshot();
                                        $('.credits').remove();
                                        var chart = this,
                                            width = chart.chartWidth - 190,
                                            height = chart.chartHeight - 40;
                                        //this.renderer.image(aoiPNG1, width - 265, height, 50, 25).add();
                                        this.renderer.image('https://agriserv.servirglobal.net/images/Servir_Logo_Full_Color_Large.png', width + 90, height, 100, 25).add();
                                    }
                                }
                            }
                        }
                    },
                    series: [{
                        type: 'line',
                        data: chirps1,
                        name: "CHIRPS AOI 1"
                    }, {
                        type: 'line',
                        data: chirps2,
                        name: "CHIRPS AOI 2"
                    }]

                }, function (chart) {
                });

                select_NDVIBottomThreshold_Changed(maxValue);
                splitSeriesByYear('plot-years');
                splitSeriesByYear('chirps-years');
                fullScreenWizard();

            }
            catch (ex) {
                console.log(ex);
            }

        }
    }
    else {
        if (is_RequestPipelineRunning() === false) {
            // Maybe we have a request error.. run it again.
            pull_Requests_To_QueueSystem();
        }
    }
}

function get_years() {
    $("#plot-years").removeClass('hidden');
    $("#plot").addClass('hidden');
    $("#chirps-plot").addClass('hidden');
    $("#chirps-years").addClass('hidden');
    $("#show-original").removeClass('hidden');
    $("#show-overlay").addClass('hidden');
    $("#plot-years").css({ 'height': '70%', 'width': '100%', 'max-height': '70%', 'max-width': '100%' });
    $("#plot-years").highcharts().reflow();
}
function get_original() {
    $("#plot").removeClass('hidden');
    $("#plot-years").addClass('hidden');
    $("#chirps-plot").addClass('hidden');
    $("#chirps-years").addClass('hidden');
    $("#plot").css({ 'height': '70%', 'width': '100%', 'max-height': '70%', 'max-width': '100%' });
    $("#plot").highcharts().reflow();
    $("#show-overlay").removeClass('hidden');
    $("#show-original").addClass('hidden');
}

function get_chirps() {
    $("#chirps-plot").removeClass('hidden');
    $("#chirps-years").addClass('hidden');
    $("#plot-years").addClass('hidden');
    $("#plot").addClass('hidden');
    $("#chirps-plot").css({ 'height': '70%', 'width': '100%', 'max-height': '70%', 'max-width': '100%' });
    $("#chirps-plot").highcharts().reflow();
    $("#show-chirps-years").removeClass('hidden');
    $("#show-chirps").addClass('hidden');
}

function get_chirps_years() {
    $("#chirps-years").removeClass('hidden');
    $("#chirps-plot").addClass('hidden');
    $("#plot-years").addClass('hidden');
    $("#plot").addClass('hidden');
    $("#chirps-years").css({ 'height': '70%', 'width': '100%', 'max-height': '70%', 'max-width': '100%' });
    $("#chirps-years").highcharts().reflow();
    $("#show-chirps-years").addClass('hidden');
    $("#show-chirps").removeClass('hidden');
}



var aoiPNG1, aoiPNG2;
function getMapScreenshot() {
    //$(window).trigger('resize');
    var pom = document.createElement('a');
    pom.addEventListener('click', function () {
        aoi1.once('postcompose', function (event) {
            var canvas = event.context.canvas;
            aoiPNG1 = canvas.toDataURL("image/png");
        });
        aoi1.renderSync();
    });
    pom.click();

    //var pom2 = document.createElement('a');
    //pom2.addEventListener('click', function () {
    //    aoi2.once('postcompose', function (event) {
    //        var canvas = event.context.canvas;
    //        aoiPNG2 = canvas.toDataURL("image/png");
    //    });
    //    aoi2.renderSync();
    //});
    //pom2.click();

}

function update_aoi_maps() {
    //aoi1.updateSize();
    //aoi2.updateSize();
    var aoiStr1 = JSON.parse(global_CurrentUseCaseObject.AOIs[0].PolyString_JSON);
    var aoiStr2 = JSON.parse(global_CurrentUseCaseObject.AOIs[1].PolyString_JSON);

    var pol1 = new ol.geom.Polygon(aoiStr1.coordinates);
    var pol2 = new ol.geom.Polygon(aoiStr2.coordinates);

    var feature1 = new ol.Feature({ geometry: pol1 });
    var feature2 = new ol.Feature({ geometry: pol2 });
    geoJson = new ol.format.GeoJSON();

    aoiLayer1.getSource().clear();
    aoiLayer2.getSource().clear();

    aoiLayer1.getSource().addFeature(feature1);
    aoiLayer2.getSource().addFeature(feature2);

    var ext1 = feature1.getGeometry().getExtent();
    var ext2 = feature2.getGeometry().getExtent();

    var center1 = ol.extent.getCenter(ext1);
    var center2 = ol.extent.getCenter(ext2);

    aoi1.setView(new ol.View({
        projection: 'EPSG:102100',//or any projection you are using
        center: [center1[0], center1[1]],//zoom to the center of your feature
        zoom: 8 //here you define the levelof zoom
    }));

    //aoi2.setView(new ol.View({
    //    projection: 'EPSG:102100',//or any projection you are using
    //    center: [center2[0], center2[1]],//zoom to the center of your feature
    //    zoom: 8 //here you define the levelof zoom
    //}));


    aoi1.getInteractions().forEach(function (interaction) {
        interaction.setActive(false);
    }, this);
    aoi1.getControls().forEach(function (control) {
        aoi1.removeControl(control);
    }, this);
    //aoi2.getInteractions().forEach(function (interaction) {
    //    interaction.setActive(false);
    //}, this);
    //aoi2.getControls().forEach(function (control) {
    //    aoi2.removeControl(control);
    //}, this);

    aoi1.updateSize();
    //aoi2.updateSize();
}
function draggablePlotLine(axis, plotLineId) {
    var clickX, clickY;

    var getPlotLine = function () {
        for (var i = 0; i < axis.plotLinesAndBands.length; i++) {
            if (axis.plotLinesAndBands[i].id === plotLineId) {
                return axis.plotLinesAndBands[i];
            }
        }
    };

    var getValue = function () {
        var plotLine = getPlotLine();
        var translation = axis.horiz ? plotLine.svgElem.translateX : plotLine.svgElem.translateY;
        var new_value = axis.toValue(translation) - axis.toValue(0) + plotLine.options.value;
        new_value = Math.max(axis.min, Math.min(axis.max, new_value));
        return new_value;
    };

    var drag_start = function (e) {
        $(document).bind({
            'mousemove.line': drag_step,
            'mouseup.line': drag_stop
        });

        var plotLine = getPlotLine();
        clickX = e.pageX - plotLine.svgElem.translateX;
        clickY = e.pageY - plotLine.svgElem.translateY;
        if (plotLine.options.onDragStart) {
            plotLine.options.onDragStart(getValue());
        }
    };

    var drag_step = function (e) {
        var plotLine = getPlotLine();
        var new_translation = axis.horiz ? e.pageX - clickX : e.pageY - clickY;
        var new_value = axis.toValue(new_translation) - axis.toValue(0) + plotLine.options.value;
        new_value = Math.max(axis.min, Math.min(axis.max, new_value));
        new_translation = axis.toPixels(new_value + axis.toValue(0) - plotLine.options.value);
        plotLine.svgElem.translate(
            axis.horiz ? new_translation : 0,
            axis.horiz ? 0 : new_translation);

        if (plotLine.options.onDragChange) {
            plotLine.options.onDragChange(new_value);
        }
    };

    var drag_stop = function () {
        $(document).unbind('.line');

        var plotLine = getPlotLine();
        var plotLineOptions = plotLine.options;
        //Remove + Re-insert plot line
        //Otherwise it gets messed up when chart is resized
        if (plotLine.svgElem.hasOwnProperty('translateX')) {
            plotLineOptions.value = getValue()
            axis.removePlotLine(plotLineOptions.id);
            axis.addPlotLine(plotLineOptions);

            if (plotLineOptions.onDragFinish) {
                plotLineOptions.onDragFinish(plotLineOptions.value);
            }
        }

        getPlotLine().svgElem
            .css({ 'cursor': 'pointer' })
            .translate(0, 0)
            .on('mousedown', drag_start);
    };
    drag_stop();
};
function formatData(which) {
    var output = new Array();
    for (var i in which) {
        var epochTime = parseFloat(which[i]["EpochTime"]) * 1000
        var value = which[i]['Value'];
        if (value < -999.00) { value = 0; }
        //value = (value * 10); 
        output[i] = [];
        output[i].push(epochTime, value)
    }

    output.sort(function (x, y) {
        return x[0] - y[0];
    });
    return output;
}

function getMaxValue(set1, set2) {
    var maxValue = 0;
    for (var i in set1) {
        if (set1[i]['Value'] > maxValue) {
            maxValue = set1[i]['Value'];
        }
    }
    for (var i in set2) {
        if (set2[i]['Value'] > maxValue) {
            maxValue = set2[i]['Value'];
        }
    }
    return maxValue;
}

// ////////////////////////////////   USE CASE LOGIC    ////////////////////////////////

// Validate inputs from input section
function get_and_Validate_UseCaseA_Inputs() {
    var isValidInputs = true;

    // Get Years
    var year_Start = $("#input_Agriserv_Select_YearStart").val() * 1;
    var year_End = $("#input_Agriserv_Select_YearEnd").val() * 1;
    if (year_Start > year_End) {
        // Switch the order
        var tempYearEnd = year_End;
        year_End = year_Start;
        year_Start = tempYearEnd;
    }

    // NEED SOME WAY TO GET THIS NEXT VARIABLE FROM THE UI
    //alert("get_and_Validate_UseCaseA_Inputs: HARD CODING isUsePolystring variable.. todo fix this!");
    var isUsePolystring = true;

    // Get Area of Interest Selections
    var aoi_1 = global_Input_AOI_1;
    var aoi_2 = global_Input_AOI_2;

    // Validate Areas of interest.
    if (aoi_1 == 0) { isValidInputs = false; }
    if (aoi_2 == 0) { isValidInputs = false; }

    var retObject = {
        "year_Start": year_Start,
        "year_End": year_End,
        "isUsePolystring": isUsePolystring,
        "aoi_1": aoi_1,
        "aoi_2": aoi_2,
        "isValidInputs": isValidInputs
    }

    return retObject;
}

function run_UseCaseController_Logic() {
    // Reset the UseCase object
    reset_UseCaseObj();

    // Get inputs
    var useCase_A_Inputs = get_and_Validate_UseCaseA_Inputs();

    // Are the inputs valid?
    if (useCase_A_Inputs.isValidInputs == false) {
        // Inputs are not valid.
        alert("Inputs are invalid, please correct the form and resubmit the request");

        // Don't process the request..
        return;
    }

    // Build a use case object from the inputs
    global_CurrentUseCaseObject = get_UseCase_A_Object(useCase_A_Inputs.year_Start, useCase_A_Inputs.year_End, useCase_A_Inputs.isUsePolystring, useCase_A_Inputs.aoi_1, useCase_A_Inputs.aoi_2);

    // Send the Requests to the queue system.
    pull_Requests_To_QueueSystem();

}

var global_CurrentUseCaseObject = null;
var debug_Items = [];

// App Controls
function reset_UseCaseObj() {
    global_CurrentUseCaseObject = null;
}

// Get the requests to make from the object
function get_Requests_From_UseCaseA_Object(usecaseA_Obj) {
    var retRequestsList = [];
    for (var i = 0; i < usecaseA_Obj.AOIs.length; i++) {
        var currentAOI = usecaseA_Obj.AOIs[i];
        retRequestsList.push(currentAOI.CHIRPSRequest);
        retRequestsList.push(currentAOI.NDVIRequest);
    }
    return retRequestsList;
}

// Get Requests that have not been completed yet.
function get_Requests_From_UseCaseA_Object_WithMissingData(usecaseA_Obj) {
    var all_Requests = get_Requests_From_UseCaseA_Object(usecaseA_Obj);
    var retRequestsList = [];
    for (var i = 0; i < all_Requests.length; i++) {
        var currentRequest = all_Requests[i];

        // Check to see if a request has data, if it does have data, do nothing, if it does not have, add it to the return list.
        if (typeof (currentRequest.resultData) === "undefined") {
            // Current request has no resultData property (so current request does not have any data)
            retRequestsList.push(currentRequest);
        }
    }
    return retRequestsList;
}

// Set a server job ID to a request 
// THIS FUNCTION BELOW CHANGES THE GLOBAL INSTANCE OF 'global_CurrentUseCaseObject'
function set_ServerJobID_To_UseCaseA_Request(ServerJobID, LocalID) {
    // Basically, just walk through all possible request objects (by checking both types for each area of interest) and then set the ServerJobID to the one that matches the passed in localID.
    for (var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++) {

        if (global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.LocalID == LocalID) {
            global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID = ServerJobID;
        }
        if (global_CurrentUseCaseObject.AOIs[i].NDVIRequest.LocalID == LocalID) {
            global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID = ServerJobID;
        }

    }
}

function increment_LostRequestCounter_For_UseCaseA_Request(ServerJobID) {
    for (var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++) {
        if (global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID == ServerJobID) {
            global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.LostRequestCounter += 1;
        }

        if (global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID == ServerJobID) {
            global_CurrentUseCaseObject.AOIs[i].NDVIRequest.LostRequestCounter += 1;
        }
    }
}
function set_SecondChanceFlag_For_UseCaseA_Request(valueToSet, ServerJobID) {
    for (var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++) {
        if (global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.ServerJobID == ServerJobID) {
            global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.SecondChanceFlag = valueToSet;
        }
        if (global_CurrentUseCaseObject.AOIs[i].NDVIRequest.ServerJobID == ServerJobID) {
            global_CurrentUseCaseObject.AOIs[i].NDVIRequest.SecondChanceFlag = valueToSet;
        }
    }
}
var gincoming_Raw_Data_Object;
// Eventually, this will need to be a pipeline to support multiple types of use cases.. 
// but for now, just using a single function of entry... gotta get the thing working first..
function process_RawData__For_UseCase_A_Object(incoming_Raw_Data_Object) {
    // Because we can't know if this object has the props we want, and we need to make this alpha working yesterday!!
    try {
		gincoming_Raw_Data_Object = incoming_Raw_Data_Object;
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
        for (var i = 0; i < rawData.length; i++) {
            var currentDate = rawData[i].date;
            var currentEpochTime = rawData[i].epochTime;

            // Get the value.. and ... inefficiently code wise but quickly.. validate the types
            // TODO! Fix this inefficiency by looking up the prop type which should be given by the operation type and comparing to a lookup / enum type object.
            var currentVal = rawData[i].value.avg;
            if (isNaN(currentVal) === true) {
                currentVal = rawData[i].value.max;
                if (isNaN(currentVal) === true) { currentVal = rawData[i].value.min; }
            }

            // Filter Statement
            if (currentVal < 0) {
                // Throw these out.. (requested feature)
            }
            else {
                // Keep these if they are not 0
                var granuleObj = {
                    "Date": currentDate,
                    "EpochTime": currentEpochTime,
                    "Value": currentVal
                };
                granuleData.push(granuleObj);
            }
        }

        var resultData = {
            "GranuleData": granuleData,
            "incoming_Raw_Data_Object": incoming_Raw_Data_Object
        }

        // attach that raw data to the usecase object associated with the localID.  // global_CurrentUseCaseObject
        // There is definitely a better way to do this.... doing it like this for speed (object's current datastructure is strictly tied to this particular solution.)
        for (var j = 0; j < global_CurrentUseCaseObject.AOIs.length; j++) {
            // Just checking the local job ids for a match.. once a match is found, the result data is updated.
            if (localID === global_CurrentUseCaseObject.AOIs[j].CHIRPSRequest.LocalID) {
                global_CurrentUseCaseObject.AOIs[j].CHIRPSRequest.resultData = resultData;
            }
            if (localID === global_CurrentUseCaseObject.AOIs[j].NDVIRequest.LocalID) {
                global_CurrentUseCaseObject.AOIs[j].NDVIRequest.resultData = resultData;
            }
        }


    }
    catch (errGenericResultsError) {
alert(errGenericResultsError)
    }
}

// Use Case Entry point..
function get_UseCase_A_Object(input_yearStart, input_yearEnd, isUsePolystring, input_PolygonString_1, input_PolygonString_2, ndvi_Type) {
    // Settings
    var chirps_DataType = 0;     // Datatype number for Chirps
    var chirps_IntervalType = 0; // Daily
    var chirps_Operationtype = 5; // 5 means "AVERAGE",  Min and Max are (0 and 1)
    var ndvi_DataType = ndvi_Type; //1;     // Datatype number for NDVI
    if (ndvi_DataType == null) {
        ndvi_DataType = 1;
    }
    var ndvi_IntervalType = 0; // Daily... converted to pentadal on server
    var ndvi_Operationtype = 5; // 5 means "AVERAGE",  Min and Max are (0 and 1)

    // Convert start/end years to requestable dates
    var converted_beginDate = "01/01/" + input_yearStart;
    var converted_endDate = "12/31/" + input_yearEnd;

    // Make all 4 request objects, AOI 1 gets a Chirps and NDVI object, AOI 2 also gets a slightly different CHIRPS and NDVI request object.
    var AOI_1_CHIRPSRequestOBJ = make_Request_Object(chirps_DataType, converted_beginDate, converted_endDate, chirps_IntervalType, chirps_Operationtype, isUsePolystring, input_PolygonString_1, 0, []);
    var AOI_1_NDVIRequestOBJ = make_Request_Object(theAIOTypeList[0], converted_beginDate, converted_endDate, ndvi_IntervalType, ndvi_Operationtype, isUsePolystring, input_PolygonString_1, 0, []);
    var AOI_2_CHIRPSRequestOBJ = make_Request_Object(chirps_DataType, converted_beginDate, converted_endDate, chirps_IntervalType, chirps_Operationtype, isUsePolystring, input_PolygonString_2, 0, []);
    var AOI_2_NDVIRequestOBJ = make_Request_Object(theAIOTypeList[1], converted_beginDate, converted_endDate, ndvi_IntervalType, ndvi_Operationtype, isUsePolystring, input_PolygonString_2, 0, []);

    // Make 2 AOI Objects and put them together in a list for making the final usecase object
    var AOIObj_1 = make_AOI_Object(input_PolygonString_1, isUsePolystring, 0, [0, 1], AOI_1_CHIRPSRequestOBJ, AOI_1_NDVIRequestOBJ);
    var AOIObj_2 = make_AOI_Object(input_PolygonString_2, isUsePolystring, 0, [0, 1], AOI_2_CHIRPSRequestOBJ, AOI_2_NDVIRequestOBJ);
    var AOIList = [AOIObj_1, AOIObj_2];

    // Make the final Starting Use Case Object
    var useCase_A_Obj = make_UseCase_A_Object(AOIList, input_yearStart, input_yearEnd);

    // Return the object
    return useCase_A_Obj;
}

// Make a CHIRPSRequest Object, Contains a list of params needed to make a request to ClimateSERV, a local ID for code tracking, and a results container.
// Use this to make any request objects.
function make_Request_Object(cservParam_datatype, cservParam_begintime, cservParam_endtime, cservParam_intervaltype, cservParam_operationtype, isUsePolystring, cservParam_geometry, cservParam_layerid, cservParam_featureids) {
    var localID = generate_LocalRequest_ID_as_s8();
    var ret_RequestObj = {
        "LocalID": localID,
        "LostRequestCounter": 0,   // When a request fails a few times the second chance flag gets set, when it fails more times and flag is set, there is something wrong with either the server or the area of interest has no data.
        "SecondChanceFlag": false,     // When a request is submitted for a second time, this gets set to true,
        "cservParam_datatype": cservParam_datatype,
        "cservParam_begintime": cservParam_begintime,
        "cservParam_endtime": cservParam_endtime,
        "cservParam_intervaltype": cservParam_intervaltype,
        "cservParam_operationtype": cservParam_operationtype,
        "UsePolyString": isUsePolystring,
        "cservParam_geometry": cservParam_geometry,
        "cservParam_layerid": cservParam_layerid,
        "cservParam_featureids": cservParam_featureids
    };
    return ret_RequestObj;
}

// Make an Area of Interest object, UseCase A has a collection of AOI Objects, AOI objects dictate the what CHIRPS and NDVI Requests are made so they contain the defs for those.
function make_AOI_Object(polyString_JSON, usePolyString, layerID, featureIDs, CHIRPSRequest, NDVIRequest) {
    var retAOIObj = {
        "PolyString_JSON": polyString_JSON,
        "UsePolyString": usePolyString,
        "LayerID": layerID,
        "FeatureIDs": featureIDs,
        "CHIRPSRequest": CHIRPSRequest,
        "NDVIRequest": NDVIRequest
    };
    return retAOIObj;
}
// Makes the Use Case "A" object (First derrived application/product Leveraging ClimateSERV's API to analyze data)
function make_UseCase_A_Object(AOI_Objects_List, yearStart, yearEnd) {
    var retUseCaseObj = {
        "AOIs": AOI_Objects_List,
        "YearStart": yearStart,
        "YearEnd": yearEnd
    };
    return retUseCaseObj;
}

// ////////////////////////////////   MAP UI EXTENSIONS FUNCTION    ////////////////////////////////

var global_Input_AOI_1 = 0;
var global_Input_AOI_2 = 0;
var global_PolygonDrawingBuffer = 0;
var global_AOI_UseCase_Index = 0;

// Spans for displaying AOI info  span_aoi_1    span_aoi_2
// span_Draw_AOI_1, span_Draw_AOI_2, 

//Function to enable custom drawing of polygons.
function enableCustomPolygonDrawing_AgriservOverride(aoi_Index) {
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
    if (clickEnabled === true) {
        disableFeatureSelection();
    }
    map.addInteraction(draw);
}

function update_Selected_Poly_String_UI() {
    $("#span_aoi_1").html(global_Input_AOI_1);
    $("#span_aoi_2").html(global_Input_AOI_2);
}

function set_UseCase_AOI_FromPolygonDrawing() {
    // Mapping the Global AOI UseCase Index to the correct AOI Use Case Input
    if (global_AOI_UseCase_Index == 1) {

        global_Input_AOI_1 = global_PolygonDrawingBuffer;

    }
    else if (global_AOI_UseCase_Index == 2) {

        global_Input_AOI_2 = global_PolygonDrawingBuffer;

    }

    // Update the UI
    update_Selected_Poly_String_UI();
}

// Callback for when the vector layer changes
function init_VectorLayer_Change_Callback() {
    source.on("change", function (e) {
        // Legacy compatible
        if (global_AOI_UseCase_Index == 0) {
            return;
        }
    });
}

// ////////////////////////////////   GROWING SEASON OBJECTS    ////////////////////////////////////
var debug_GrowingSeasons = [];
var csvRows_Current_GrowingSeasonData = [];
var csvRows_Current_GrowingSeasonSummaryData = [];

// Get Growing Seasons Summary data as CSV file
function get_GrowingSeasons_Summary_Output_As_CSV() {
    var csvOutputString = "";
    for (var i = 0; i < csvRows_Current_GrowingSeasonSummaryData.length; i++) {
        csvOutputString += csvRows_Current_GrowingSeasonSummaryData[i];
        csvOutputString += "\n";
    }
    downloadTextFile("Agriserv_GrowingSeason_Summary_Data.csv", csvOutputString);
}

// Get Growing Seasons Output as CSV file
function get_GrowingSeasonsOutput_As_CSV() {
    var csvOutputString = "";
    for (var i = 0; i < csvRows_Current_GrowingSeasonData.length; i++) {
        csvOutputString += csvRows_Current_GrowingSeasonData[i];
        csvOutputString += "\n";
    }
    downloadTextFile("Agriserv_GrowingSeason_RawData.csv", csvOutputString);
}

function get_aoi_JSON() {
    var aoiStr1 = JSON.parse(global_CurrentUseCaseObject.AOIs[0].PolyString_JSON);
    var aoiStr2 = JSON.parse(global_CurrentUseCaseObject.AOIs[1].PolyString_JSON);

    var pol1 = new ol.geom.Polygon(aoiStr1.coordinates);
    var pol2 = new ol.geom.Polygon(aoiStr2.coordinates);

    var polTransform1 = pol1.transform('EPSG:102100', 'EPSG:4326');
    var polTransform2 = pol2.transform('EPSG:102100', 'EPSG:4326');

    var feature1 = new ol.Feature({ geometry: polTransform1 });
    var feature2 = new ol.Feature({ geometry: polTransform2 });
    geoJson = new ol.format.GeoJSON();

    output1 = geoJson.writeFeatures([feature1], { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:4326' });
    output2 = geoJson.writeFeatures([feature2], { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:4326' });

    downloadTextFile('aoi1.geojson', output1);
    downloadTextFile('aoi2.geojson', output2);
}
function get_raw_As_CSV() {
    // alert("Coming soon");

    var aoi0NDVI_Granules = global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData;
    var aoi0CHIRPS_Granules = global_CurrentUseCaseObject.AOIs[0].CHIRPSRequest.resultData.GranuleData;


    var aoi0granules = calculateAllGranules(aoi0NDVI_Granules, aoi0CHIRPS_Granules);

    var aoi1NDVI_Granules = global_CurrentUseCaseObject.AOIs[1].NDVIRequest.resultData.GranuleData;
    var aoi1CHIRPS_Granules = global_CurrentUseCaseObject.AOIs[1].CHIRPSRequest.resultData.GranuleData;

    var aoi1granules = calculateAllGranules(aoi1NDVI_Granules, aoi1CHIRPS_Granules);

    //Create csv from aoi0granules + aoi1granules
    //AOI | NDVI Date | NDVI Value | CHIRPS Date | CHIRPS Value
    var rawrowsOfData = [];
    var csv_HeaderString = "AOI,NDVI_Date,NDVI_Value,CHIRPS_Date,CHIRPS_Value";
    rawrowsOfData.push(csv_HeaderString);

    buildStringArray(rawrowsOfData, 0, aoi0granules);
    buildStringArray(rawrowsOfData, 1, aoi1granules);


    var csvOutputString = "";
    for (var i = 0; i < rawrowsOfData.length; i++) {
        csvOutputString += rawrowsOfData[i];
        csvOutputString += "\n";
    }
    downloadTextFile("Agriserv_Raw_Data.csv", csvOutputString);
}

function buildStringArray(theArray, AOI, granules) {

    for (var i = 0; i < granules.length; i++) {
        var current_GS_NDVIGranules = granules[i].NDVI_Granules;
        var current_GS_CHIRPSGranules = granules[i].CHIRPS_Granules;

        // Now loop through the CHIRPS Granules and dump all the items which fall within the EPOCH time range we need.
        for (var n = 0; n < current_GS_CHIRPSGranules.length; n++) {
            var current_CHIRPS_Granule = current_GS_CHIRPSGranules[n];
            var current_GS_NDVIGranule = current_GS_NDVIGranules[n];
            var current_CHIRPS_Granule_EpochTime = current_CHIRPS_Granule.EpochTime;

            // Need the chirps granules that are within the current range. (Inclduing start time, excluding end time)

            var date_CHIRPS = new Date(0);
            date_CHIRPS.setUTCSeconds(current_CHIRPS_Granule.EpochTime);
            var date_NDVI = new Date(0);
            date_NDVI.setUTCSeconds(current_GS_NDVIGranule.EpochTime);

            // For CSV
            var csv_NDVI_DateString = date_NDVI.getUTCFullYear() + "/" + (date_NDVI.getUTCMonth() + 1) + "/" + date_NDVI.getUTCDate();
            var csv_CHIRPS_DateString = date_CHIRPS.getUTCFullYear() + "/" + (date_CHIRPS.getUTCMonth() + 1) + "/" + date_CHIRPS.getUTCDate();
            // Headers:  "AOI,NDVI_Date,NDVI_Value,CHIRPS_Date,CHIRPS_Value";
            var csvString = AOI + "," + csv_NDVI_DateString + "," + current_GS_NDVIGranule.Value + "," + csv_CHIRPS_DateString + "," + current_CHIRPS_Granule.Value;
            theArray.push(csvString);
        }
    }
    return theArray;

}

// Updates the GrowingSeasons UI Panel (Stats and Table) with the data passed into it
// This function shows the expected growing seasons high level data and detail level data for each growing season list.
function update_GrowingSeasons_UI(data_AOI_GrowingSeasons) {
    debug_GrowingSeasons.push(data_AOI_GrowingSeasons);

    // Holding these for CSV Output
    var rowsOfData = [];
    var csv_HeaderString = "AOI,GrowingSeason,NDVI_Date,NDVI_Value,CHIRPS_Date,CHIRPS_Value";
    rowsOfData.push(csv_HeaderString);

    var chart = $("#plot").highcharts();
    var currentThresholdValue = chart.yAxis[0].plotLinesAndBands[0].options.value;
    // Refactor for GrowingSeason Summary - CSV Setup
    var summary_Rows = [];
    var summary_CSV_HeaderString = "AOI_ID,GS_ID,Year,GrowingSeason_Length_Days,NDVI_Threshold,Sum_Of_Avg_CHIRPS_Rainfall";
    summary_Rows.push(summary_CSV_HeaderString);

    $("#growingSeasonsTable0").find("tr:gt(0)").remove();
    $("#growingSeasonsTable1").find("tr:gt(0)").remove();
    // For each Area of interest..
    for (var i = 0; i < data_AOI_GrowingSeasons.length; i++) {
        // Inside the Area of interest.
        var current_AreaOfInterest_Title = "Area of Interest: " + i;
        var current_GrowingSeasons_List = data_AOI_GrowingSeasons[i].GrowingSeasons;

        var highest = 0;

        for (var j = 0; j < current_GrowingSeasons_List.length; j++) {
            var theYear;
            var startDate;
            var endDate;
            var theDays;
            var theRainfall;
            var theThreshold = currentThresholdValue;
            var theAOI = 'AOI ' + (parseFloat(i) + parseFloat(1));

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

            theYear = d1.getUTCFullYear();
            startDate = moment(d1).utc().format('MMMM DD YYYY');
            endDate = moment(d2).utc().format('MMMM DD YYYY');
            theDays = numOfDays;

            // Refactor for GrowingSeason Summary - New CSV Out
            var summaryCSV_RowBuilder = "";
            // Refactor for GrowingSeason Summary - Get, AOI_ID, GS_ID, Year, length in days, threshold value Data
            summaryCSV_RowBuilder += (i).toString();   // AOI_ID
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += (i).toString() + "_" + (j + 1).toString();   // GS_ID
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += d1.getUTCFullYear().toString();   // Year
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += numOfDays.toString();   // GrowingSeason_Length_Days
            summaryCSV_RowBuilder += ",";
            summaryCSV_RowBuilder += currentThresholdValue;   // NDVI_Threshold
            summaryCSV_RowBuilder += ",";

            // Refactor for GrowingSeason Summary - Recording CHIRPS Rainfall Value Totals 
            // Sum_Of_Avg_CHIRPS_Rainfall
            var chirpsRainfall_Value_OverRange_Total = 0;

            // Iterate through all NDVI Granules
            for (var k = 0; k < current_GS_NDVIGranules.length; k++) {
                var current_GS_NDVIGranule = current_GS_NDVIGranules[k];
                var date_NDVI = new Date(0);
                date_NDVI.setUTCSeconds(current_GS_NDVIGranule.EpochTime);

                // Next task is to get associated CHIRPS data points
                // We need a time limit so we don't just dump ALL CHIRPS granules with this currently associated NDVI Granule.
                var startEpochTime_Limit_ForCHIRPS = current_GS_NDVIGranule.EpochTime;
                var endEpochTime_Limit_ForCHIRPS = current_GrowingSeason.End_EpochTime;

                // If we aren't at the last item, use the Next NDVI Point's Epoch time as our limite
                if (k < current_GS_NDVIGranules.length - 1) {
                    endEpochTime_Limit_ForCHIRPS = current_GS_NDVIGranules[k + 1].EpochTime;
                }

                // Now loop through the CHIRPS Granules and dump all the items which fall within the EPOCH time range we need.
                for (var n = 0; n < current_GS_CHIRPSGranules.length; n++) {
                    var current_CHIRPS_Granule = current_GS_CHIRPSGranules[n];
                    var current_CHIRPS_Granule_EpochTime = current_CHIRPS_Granule.EpochTime;

                    // Need the chirps granules that are within the current range. (Inclduing start time, excluding end time)
                    if (current_CHIRPS_Granule_EpochTime >= startEpochTime_Limit_ForCHIRPS) {
                        if (current_CHIRPS_Granule_EpochTime < endEpochTime_Limit_ForCHIRPS) {
                            var date_CHIRPS = new Date(0);
                            date_CHIRPS.setUTCSeconds(current_CHIRPS_Granule.EpochTime);

                            // For CSV
                            var csv_NDVI_DateString = date_NDVI.getUTCFullYear() + "/" + (date_NDVI.getUTCMonth() + 1) + "/" + date_NDVI.getUTCDate();
                            var csv_CHIRPS_DateString = date_CHIRPS.getUTCFullYear() + "/" + (date_CHIRPS.getUTCMonth() + 1) + "/" + date_CHIRPS.getUTCDate();
                            // Headers:  "AOI,GrowingSeason,NDVI_Date,NDVI_Value,CHIRPS_Date,CHIRPS_Value";
                            var csvString = i + "," + i + "_" + j + "," + csv_NDVI_DateString + "," + current_GS_NDVIGranule.Value + "," + csv_CHIRPS_DateString + "," + current_CHIRPS_Granule.Value;
                            rowsOfData.push(csvString);
                            if (current_GS_NDVIGranule.Value > highest) {
                                theYear = date_NDVI.getUTCFullYear();
                            }
                            // Refactor for GrowingSeason Summary - Recording CHIRPS Rainfall Value Totals 
                            chirpsRainfall_Value_OverRange_Total = chirpsRainfall_Value_OverRange_Total + current_CHIRPS_Granule.Value;
                        }

                    }
                }

            }

            theRainfall = chirpsRainfall_Value_OverRange_Total;

            $("#growingSeasonsTable" + i).append("<tr><td>" + startDate + "</td><td>" + endDate + "</td><td>" + theDays + "</td><td>" + theRainfall + "</td><td>" + theThreshold + "</td><td>" + theAOI + "</td></tr>");

            // Refactor for GrowingSeason Summary - Recording CHIRPS Rainfall Value Totals 
            summaryCSV_RowBuilder += chirpsRainfall_Value_OverRange_Total;   // Sum_Of_Avg_CHIRPS_Rainfall 
            // Refactor for GrowingSeason Summary - New CSV Out
            summary_Rows.push(summaryCSV_RowBuilder);
        }

    }

    // Store the CSV Output
    csvRows_Current_GrowingSeasonSummaryData = summary_Rows;
    csvRows_Current_GrowingSeasonData = rowsOfData;


}

// Controller Pipeline for Handling Generation of Growing Seasons   // Epoch Time values are force converted to integers (using * 1)
function recalculate_GrowingSeasons(NDVI_BottomThreshold, NDVI_FilteredData, CHIRPS_FilteredData) {
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
    for (var i = 0; i < NDVI_FilteredData.length; i++) {
        // Current Granule Value
        var current_NDVI_Value = NDVI_FilteredData[i].Value;

        // Is the current value above or equal to the threshold?  
        if (current_NDVI_Value >= NDVI_BottomThreshold) {
            // Regardless of which growing season we are in, start recording
            reusableGrowingSeasonData.push(NDVI_FilteredData[i]);

            // Were we already above the threshold?
            if (isCurrentlyAboveThreshold == false) {
                //console.log("This data point IS part of a growing season, and IS the FIRST Point in a NEW Growing Season.");

                // This is a new Growing Season!
                isCurrentlyAboveThreshold = true;

                // Record the start date and time
                growingSeason_Start_EpochTime = (NDVI_FilteredData[i].EpochTime * 1);
                growingSeason_Start_DateString = NDVI_FilteredData[i].Date;

            }
            else {
                // We were already in the current growing season... just add data to it in here
                //console.log("This data point IS part of a growing season");
            }
        }
        else {
            // Were we in a growing season on the last datapoint?
            if (isCurrentlyAboveThreshold == true) {
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
                for (var j = 0; j < CHIRPS_FilteredData.length; j++) {
                    var currentCHIRPS_Granule = CHIRPS_FilteredData[j];
                    if ((currentCHIRPS_Granule.EpochTime * 1) >= growingSeason_Start_EpochTime) {
                        if ((currentCHIRPS_Granule.EpochTime * 1) <= growingSeason_End_EpochTime) {
                            related_ChirpsGranules.push(currentCHIRPS_Granule);
                        }
                    }
                }

                // Store the growing season and all it's members... and push to the global array
                var growingSeasonObj = {
                    "Start_Date_String": growingSeason_Start_DateString,
                    "End_Date_String": growingSeason_End_DateString,
                    "Start_EpochTime": growingSeason_Start_EpochTime,
                    "End_EpochTime": growingSeason_End_EpochTime,
                    "NDVI_Granules": reusableGrowingSeasonData,
                    "CHIRPS_Granules": related_ChirpsGranules
                };

                retGrowingSeasons.push(growingSeasonObj);

                // Last step.. Reset all the variables and blank out the array for the next use!
                reusableGrowingSeasonData = [];
                growingSeason_Start_DateString = "";
                growingSeason_Start_EpochTime = "";
                growingSeason_End_DateString = "";
                growingSeason_End_EpochTime = "";
            }
            else {
                //console.log("This data point is NOT part of a growing season, and the last datapoint was not either..");
            }
        }

    }

    // Return the Growing Seasons list
    return retGrowingSeasons;
}

// Handler for threshold value changing
function select_NDVIBottomThreshold_Changed(newThresholdValue) {

    // Make a Growing Seasons list for each Area of Interest
    var areaOfInterest_GrowingSeasons_List = [];

    // global_CurrentUseCaseObject.AOIs[j].CHIRPSRequest.resultData
    for (var i = 0; i < global_CurrentUseCaseObject.AOIs.length; i++) {
        var currentAOI = global_CurrentUseCaseObject.AOIs[i];
        var currentNDVI_Granules = global_CurrentUseCaseObject.AOIs[i].NDVIRequest.resultData.GranuleData;
        var currentCHIRPS_Granules = global_CurrentUseCaseObject.AOIs[i].CHIRPSRequest.resultData.GranuleData;

        // Recalculate the growing seasons data for each area of interest
        var growingSeasons = recalculate_GrowingSeasons(newThresholdValue, currentNDVI_Granules, currentCHIRPS_Granules);

        var aoi_GrowingSeason_Obj = {
            "AOI_Data": currentAOI,
            "GrowingSeasons": growingSeasons
        };

        areaOfInterest_GrowingSeasons_List.push(aoi_GrowingSeason_Obj);
    }

    // Update the UI
    update_GrowingSeasons_UI(areaOfInterest_GrowingSeasons_List);
}

function calculateAllGranules(NDVI_FilteredData, CHIRPS_FilteredData) {
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
    for (var i = 0; i < NDVI_FilteredData.length; i++) {
        // Current Granule Value
        var current_NDVI_Value = NDVI_FilteredData[i].Value;

        // Is the current value above or equal to the threshold?Regardless of which growing season we are in, start recording
        reusableGrowingSeasonData.push(NDVI_FilteredData[i]);

        // Were we already above the threshold?
        if (isCurrentlyAboveThreshold == false) {
            //console.log("This data point IS part of a growing season, and IS the FIRST Point in a NEW Growing Season.");

            // This is a new Growing Season!
            isCurrentlyAboveThreshold = true;

            // Record the start date and time
            growingSeason_Start_EpochTime = (NDVI_FilteredData[i].EpochTime * 1);
            growingSeason_Start_DateString = NDVI_FilteredData[i].Date;

        }
        else {
            // We were already in the current growing season... just add data to it in here
        }

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
        for (var j = 0; j < CHIRPS_FilteredData.length; j++) {
            var currentCHIRPS_Granule = CHIRPS_FilteredData[j];
            if ((currentCHIRPS_Granule.EpochTime * 1) >= growingSeason_Start_EpochTime) {
                if ((currentCHIRPS_Granule.EpochTime * 1) <= growingSeason_End_EpochTime) {
                    related_ChirpsGranules.push(currentCHIRPS_Granule);
                }
            }
        }

        // Store the growing season and all it's members... and push to the global array
        var growingSeasonObj = {
            "Start_Date_String": growingSeason_Start_DateString,
            "End_Date_String": growingSeason_End_DateString,
            "Start_EpochTime": growingSeason_Start_EpochTime,
            "End_EpochTime": growingSeason_End_EpochTime,
            "NDVI_Granules": reusableGrowingSeasonData,
            "CHIRPS_Granules": related_ChirpsGranules
        };

        retGrowingSeasons.push(growingSeasonObj);

        // Last step.. Reset all the variables and blank out the array for the next use!
        reusableGrowingSeasonData = [];
        growingSeason_Start_DateString = "";
        growingSeason_Start_EpochTime = "";
        growingSeason_End_DateString = "";
        growingSeason_End_EpochTime = "";

    }

    // Return the Growing Seasons list
    return retGrowingSeasons;
}

// ////////////////////////////////   AJAX TO CSERV API FUNCTIONS    ///////////////////////////////

function convert_PolygonString_To_4326_ForRequest(polygonString) {
    var polyObj = JSON.parse(polygonString);
    for (var i = 0; i < polyObj.coordinates[0].length; i++) {
        polyObj.coordinates[0][i] = ol.proj.transform(polyObj.coordinates[0][i], 'EPSG:102100', 'EPSG:4326');
    }
    var retString = JSON.stringify(polyObj);
    return retString;
}
function convert_PolygonString_To_102100_ForSystemInput(featureCollection) {
    //var polyObj = JSON.parse(polygonString);
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
var rq;
var gserverJobID;
// MultiRequest_Component - submit_New_DataRequest
// -Reusable Function to make the requests for submitting new datajobs to cserv (Takes all the params it needs)
function agriserv_AJAX__Submit_New_DataRequest(dataTypeValue, operationValue, dateintervalValue, dateBeginValue, dateEndValue, isUsePolystring, polygonString, layerid, featureids, localJobID) {

    var req_Data =
        {
            'datatype': dataTypeValue,
            'begintime': dateBeginValue,
            'endtime': dateEndValue,
            'intervaltype': dateintervalValue,
            'operationtype': operationValue
        };

    if (isUsePolystring == true) {
        // We are using the polygon string
        req_Data['geometry'] = convert_PolygonString_To_4326_ForRequest(polygonString);
    }
    else {
        // We are using the layer and feature ids
        req_Data['layerid'] = layerid; //layerIds[selectedLayer];
        req_Data['featureids'] = featureids; //selectedFeatures.join()
    }

    // Make the request, set up the handlers (pass the info we need into it)
    $.ajax(
        {
            url: baserequesturl + 'submitDataRequest/',
            type: "get",
            data: req_Data,
            jsonpCallback: 'successCallback',
            async: true,
			crossDomain: true,
            beforeSend: function () {

            },
            complete: function () {

            },
            success: function (result) {
                // Also.. Connect the local JobID to the queue
                // localJobID

                // This code used to take the 'uniqueid' (which is the server job id) and process it (goes into a queue to check status)
                var serverJobID = eval(result)[0];
				if(serverJobID.length < 5)
				{
					 serverJobID = result
				}
gserverJobID = serverJobID;
                // Starting Job Progress Value
                var startingProgressValue = 0.0;

                // Items to store in the 'requests_Waiting_ForData' area
                add_RequestTo_WaitingForData_Queue(localJobID, serverJobID, startingProgressValue);

            },
            error: function (request, error) {
                try {
					rq = request;
                    console.log("Agriserv, Submit New Data Request: Got an error when communicating with the server.  Error Message:::: " + error);
                }
                catch (exErr) { }

            },
            successCallback: function () {

            }
        });

}
var BillyZjobProgressResponse;
var BillyZjobCount;
//Query the server to check the progress of Data Request that has been submitted.
function agriserv_AJAX__getDataRequestProgress(serverJobID, localJobID) {

    var req_Data = { 'id': serverJobID };

    $.ajax(
        {
            url: baserequesturl + 'getDataRequestProgress/',
            type: "get",
            data: req_Data,
            jsonpCallback: 'successCallback',
            async: true,
			crossDomain: true,
            beforeSend: function () {

            },
            complete: function () {

            },
            success: function (result) {
                // Check the job progress in the response, 
                var jobProgressResponse = eval(result)[0];
                BillyZjobProgressResponse = jobProgressResponse;

                var jobCount = requests_Waiting_ToMake.length;
                BillyZjobCount = jobCount;
                if (jobProgressResponse === -1) {
                    // The server could not process this job and is reporting back an error.
                    try {
                        console.log("Agriserv, Check Job Status: The server encountered an error while processing this job. ");
                    }
                    catch (ex) { }
                }
                else if (jobProgressResponse === 100) {
                    // Job is done processing... ready for data.. add to the DataReady queue
                    if (jobCount == 0) {
                        updateProgressBar(100);
                        /******************Hides debug form***********************/
                        //toggleForm();
                        setTimeout(function () { $("#myProgress").hide(); }, 1000);

                    }
                    agriserv_AJAX__getDataFromRequest(serverJobID, localJobID);

                }
                else {
                    var theNum;
                    if (jobCount == 1) {
                        theNum = Math.floor((jobProgressResponse * .25) + (50 * 1));
                        updateProgressBar(theNum);
                    }
                    else if (jobCount == 2) {
                        theNum = Math.floor((jobProgressResponse * .25) + (25 * 1));
                        updateProgressBar(theNum);
                    }
                    else if (jobCount == 3) {
                        theNum = Math.floor((jobProgressResponse * .25));
                        updateProgressBar(theNum);
                    }
                    else {
                        theNum = Math.floor((jobProgressResponse * .25) + (75 * 1));
                        updateProgressBar(theNum);
                    }
                    // Job is still being processed.. add back to the queue with the new progress value
                    add_RequestTo_WaitingForData_Queue(localJobID, serverJobID, jobProgressResponse);
                }



            },
            error: function (request, error) {
                try {
                    console.log("Agriserv, Check Job Status: Got an error when communicating with the server.  EEEEError Message: " + error);
                }
                catch (exerrr) { }

            },
            successCallback: function () {

            }
        });
}
var myresult;
// Get the raw data from the submitted request and send it to another function for routing and processing.
function agriserv_AJAX__getDataFromRequest(serverJobID, localJobID) {
    var req_Data = { 'id': serverJobID }
    $.ajax(
        {
            url: baserequesturl + 'getDataFromRequest/',
            type: "get",
            data: req_Data,
            jsonpCallback: 'successCallback',
			crossDomain: true,
            async: true,
            beforeSend: function () {

            },
            complete: function () {

            },
            success: function (result) {
				myresult = JSON.parse(result);
                var resultObj = {
                    "serverJobID": serverJobID,
                    "localJobID": localJobID,
                    "result": myresult,
                };

                // Sending the raw data for processing
                process_RawData__For_UseCase_A_Object(resultObj);
            },
            error: function (request, error) {
                try {
                    console.log("Agriserv, Get data from Request: Got an error when communicating with the server.  Error Message: " + error);
                }
                catch (exErrAjax_ErrorReporting) { }

            },
            successCallback: function () {

            }
        });
}

// ////////////////////////////////   JQUERY INIT AND OTHER UI    ////////////////////////////////

// Get and Validate Inputs from UI
function submit_UseCaseA_Input_EventHandler() {
    if (checkRequestQueues == false) {
        startIntervals();
    }
    run_UseCaseController_Logic();

}

function numDaysInRange() {
    return global_CurrentUseCaseObject.AOIs[0].NDVIRequest.resultData.GranuleData.length;
}

//Download a text file. Used by CSV to enable downloading of the file containing text.
function downloadTextFile(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

// UI Elements (jQuery UI)
$(document).ready(function () {
    // Setup event handler for vector layer changed callback
    init_VectorLayer_Change_Callback();
});
/*****************************************************************************
 * FILE:    METRICS MAIN JS
 * DATE:    5 JANUARY 2018
 * AUTHOR: Sarva Pulla
 * COPYRIGHT: (c) NASA SERVIR 2018
 * LICENSE: BSD 2-Clause
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/

var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var metrics_data,
        public_interface;			// Object returned by the module



    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var generate_plots,  
	init_events,
        init_jquery_vars,
        init_all;


    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/

    init_jquery_vars = function(){
        var $metrics_element = $("#metrics");
        metrics_data = $metrics_element.attr('data-metrics-json');
        metrics_data = JSON.parse(metrics_data);
	console.log(metrics_data);
    };

    init_events = function(){
        
    };

    generate_plots = function(){
 	$("#plotter").highcharts({
                        chart: {
                            type:'line',
                            zoomType: 'x'
                        },
                        title: {
                            text:'Metrics Plot'
                            // style: {
                            //     fontSize: '13px',
                            //     fontWeight: 'bold'
                            // }
                        },
                        xAxis: {
                            type: 'datetime',
                            labels: {
                                format: '{value:%d %b %Y}'
                                // rotation: 90,
                                // align: 'left'
                            },
                            title: {
                                text: 'Date'
                            }
                        },
                        yAxis: {
                            title: {
                                text: 'Frequency'
                            }

                        },
                        exporting: {
                            enabled: true
                        },
                        series: [{
                            data:metrics_data['submitDataPlot'],
                            name: 'Submit Data'
                        },{
                            data:metrics_data['downloadDataPlot'],
                            name: 'Download Data'
                        }]
                    });
	$("#submitBar").highcharts({
                        chart: {
                            type:'column'
                        },
                        title: {
                            text:'Submit Data Request Breakdown'
                            // style: {
                            //     fontSize: '13px',
                            //     fontWeight: 'bold'
                            // }
                        },
                       xAxis: {
				categories: [
				    'Submit Data Request'
				]
			    },
		      yAxis: {
			min: 0,
			title: {
			    text: 'Frequency'
			}
		    },
                        exporting: {
                            enabled: true
                        },
                        series: metrics_data['submitDataBar']
                    });

        $("#downloadBar").highcharts({
                        chart: {
                            type:'column'
                        },
                        title: {
                            text:'Download Data Request Breakdown'
                            // style: {
                            //     fontSize: '13px',
                            //     fontWeight: 'bold'
                            // }
                        },
                       xAxis: {
				categories: [
				    'Download Data Request'
				]
			    },
		      yAxis: {
			min: 0,
			title: {
			    text: 'Frequency'
			}
		    },
                        exporting: {
                            enabled: true
                        },
                        series: metrics_data['downloadDataBar']
                    });
    };

    init_all = function(){
        init_jquery_vars();
        init_events();
	generate_plots();
    };

 

    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/

    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading
    $(function() {
        init_all();
    });

    return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.

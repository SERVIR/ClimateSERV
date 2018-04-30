"use strict";

var map;
var isslayer;
var animationInterval;
var layerList = [];
var listIndex = 0;
var subs = ['mesonet', 'mesonet1', 'mesonet2', 'mesonet3'];
var updateinterval;
var globalTileLayer;
var globalPoint;
var globalGraphic;
var globalPictureMarkerSymbol;

require(["esri/Map", "esri/views/MapView", 'esri/widgets/BasemapToggle', 'esri/layers/TileLayer', 'esri/layers/GraphicsLayer',
        'esri/geometry/Extent', 'esri/geometry/SpatialReference', 'esri/geometry/Point', 'esri/Graphic', 'esri/symbols/PictureMarkerSymbol',
         'dojo/domReady!'],
        function (Map, MapView, BasemapToggle, TileLayer, GraphicsLayer, Extent, SpatialReference, Point, Graphic, PictureMarkerSymbol, domReady, on, parser, ready) {
            map = new Map(
            {
                basemap: 'topo'
            }
        ); // map setup
            var view = new MapView({
                container: "viewDiv",  // Reference to the DOM node that will contain the view
                map: map              // References the map object created in step 3
                
            
            });
            view.extent = new Extent({ xmin: -124.848974, ymin: 24.396308, xmax: -66.885444, ymax: 49.384358, spatialReference: 4326 });
            var toggle = new BasemapToggle({ map: map, basemap: 'hybrid' }, 'BasemapToggle');
            toggle.startup();
            isslayer = new GraphicsLayer({ id: 'issLayer' });
            map.add(isslayer);
            setInterval('getISScurrentLocation()', 5000);
            globalTileLayer = TileLayer;
            globalPoint = Point;
            globalGraphic = Graphic;
            globalPictureMarkerSymbol = PictureMarkerSymbol;
        });


function fullextent() {
    map.setExtent(new esri.geometry.Extent(-124.848974, 24.396308, -66.885444, 49.384358, new esri.SpatialReference({ wkid: 4326 })));
}
function getISScurrentLocation() {
    (function () {
        var iservlocal = 'http://api.open-notify.org/iss-now.json?callback=?';
        $.getJSON(iservlocal, { format: 'json' }).done(function (data) {
            map.findLayerById('issLayer').removeAll();
            var geometrya = new globalPoint(data.iss_position.longitude, data.iss_position.latitude);
            isslayer.add(new globalGraphic(geometrya,
                new globalPictureMarkerSymbol('images/iss.png', 45, 45)));
        });
    })();
}



require(['dojo/ready', 'esri/layers/TileLayer', 'esri/geometry/Extent', 'esri/geometry/SpatialReference', 'esri/widgets/Search'],
    function (ready, WebTiledLayer, Extent, SpatialReference, Search) {
        ready(function () {

            var search = new Search({
                map: map,
                autoNavigate: true,
                showInfoWindowOnSelect: false,
                enableButtonMode: true,
                enableLabel: false
            }, "search");
            search.startup();
            search.on('search-results', function (e) {
                console.log('search results', e);
                search.collapse();
                search.blur();
            });
            addWebTileLayerToList('nexrad-n0q-900913', 'mostCurrent', false);
            addWebTileLayerToList('nexrad-n0q-900913-m20m', 'last20minutes', true);
            addWebTileLayerToList('nexrad-n0q-900913-m15m', 'last15minutes', true);
            addWebTileLayerToList('nexrad-n0q-900913-m10m', 'last10minutes', true);
            addWebTileLayerToList('nexrad-n0q-900913-m05m', 'last5minutes', true);

            animationInterval = setInterval('animateWeather()', 500);
            updateinterval = setInterval(runUpdate, 60000);
            northEastRegion = new Extent(-91.271, 38.933, -68.228, 48.976, new SpatialReference({ wkid: 4326 }));
            southEastRegion = new Extent(-91.271, 24.753390, -68.228, 36.455050, new SpatialReference({ wkid: 4326 }));
            northWestRegion = new Extent(-124.271, 40.933, -106.966, 49.976, new SpatialReference({ wkid: 4326 }));
            southWestRegion = new Extent(-124.271, 30.753390, -106.966, 40.455050, new SpatialReference({ wkid: 4326 }));
            //36.455050, -76.093166
            //24.753390, -95.955648


            map.onResize = function (event) {
                if (map.height < 170) {
                    $('#mapOpacityControl').hide();
                }
                else {
                    $('#mapOpacityControl').show();
                }
            };

        });
    });

function addWebTileLayerToList(which, id, hide) {

    layerList.push(new globalTileLayer('http://${subDomain}.agron.iastate.edu/cache/tile.py/1.0.0/' + which + '/${level}/${col}/${row}.png' + (new Date()).getTime(), {
        id: id,
        subDomains: subs
    }));
    map.add(layerList[layerList.length - 1]);
    if (hide == true) {
        $('#map_' + id).hide();
    }
}


function runUpdate() {
    updateCycle = true;

}

$(window).on('resize', function () {
    if (mapIsFull == true) {
        fullScreenMap();
    }
    fixMaxHeight();
});

var updateCycle = false;
var updating = false;

function animateWeather() {

    if (listIndex == 0) {
        if (updateCycle == true) {
            updating = true;
        }
        $('#map_mostCurrent').hide();
        $('#map_last20minutes').show();
    }
    else if (listIndex == 1) {
        $('#map_last20minutes').hide();
        $('#map_last15minutes').show();
    }
    else if (listIndex == 2) {
        $('#map_last15minutes').hide();
        $('#map_last10minutes').show();
    }
    else if (listIndex == 3) {

        $('#map_last10minutes').hide();
        $('#map_last5minutes').show();
    }
    else if (listIndex == 4) {
        $('#map_last5minutes').hide();
        $('#map_mostCurrent').show();
    }
    if (updating == true) {
        layerList[listIndex].refresh();
    }
    listIndex++;

    if (listIndex == 5) {
        if (updating == true) {
            updateCycle = false;
            updating = false;
        }
        listIndex = 0;
    }
}
var mapIsFull = false;
function fullScreenMap() {
    mapIsFull = true;
    $('.fullhide').hide();
    $('body').css('overflow', 'hidden');
    // $('.map').height($(window).height() - top_menu_height);
    $('.map').height($(window).height() - 58);

    $('.templatemo-top-menu').css('min-height', '0px');
    $('.navbar').css('min-height', '0px');
    $('#logoimage').height('38px');
    $('.navbar-brand').css('margin-top', '0px');
    $('.navbar-right').css('margin-top', '0px');
    //.templatemo-top-menu .navbar-brand
    // .templatemo-top-menu min-height: 0px;
    //.navbar  min-height: 0px;
    // #logoimage height = 38px
    $('.templatemo-top-menu .navbar-toggle').css('margin-top', '0px');
    $('.navbar-toggle').css('margin-top', '0px');
    caroholdHeight = $('#templatemo-carousel').height();
    $('#templatemo-carousel').height($(window).height() - 80);
    caroholdmaxheight = $('.carousel').css('max-height');

    $('.carousel').css('max-height', '100%');

    $('#btnfullMap').text('Small Map');

}
var caroholdHeight;
var caroholdmaxheight;
function shrinkMap() {
    mapIsFull = false;
    $('.fullhide').show();
    $('body').css('overflow', 'auto');
    $('.map').height('100%');



    $('.templatemo-top-menu').css('min-height', '110px');
    $('.navbar').css('min-height', '50px');
    $('#logoimage').height('auto');
    $('.navbar-brand').css('margin-top', '30px');
    $('.navbar-right').css('margin-top', '40px');
    $('.navbar-toggle').css('margin-top', '8px');
    $('.templatemo-top-menu .navbar-toggle').css('margin-top', '38px');

    $('#templatemo-carousel').height(caroholdHeight);
    $('.carousel').css('max-height', caroholdmaxheight);

    $('#btnfullMap').text('Fullscreen map');
}
function toggleMap() {
    if (mapIsFull == true) {
        shrinkMap();
    }
    else {
        fullScreenMap();
    }
}
var wasfixed;
var viewHeight;
var mapHeight;
var fixMaxHeightTimeout;
var firsttop;
function fixMaxHeight() {
    firsttop = top_menu_height;
    viewHeight = $(window).height() - top_menu_height;
    mapHeight = $('#map').height();
    if (top_menu_height > 0) {
        if ((viewHeight * 0.7) < mapHeight) {
            $('#templatemo-carousel').height(viewHeight * 0.7);
            wasfixed = 0;
        }
        else if (mapHeight < 500 && (viewHeight * 0.7) < 500) {
            $('#templatemo-carousel').height(viewHeight * 0.7);
            wasfixed = 1;
        }
    }
    else {
        fixMaxHeightTimeout = setTimeout(fixMaxHeight, 250);
    }

}
$(document).ready(
function () {
    fixMaxHeight();
    //$(document).on('slidestop', '#slider-s', function () {
    //    console.log("stop");
    //    adjustOpacity();
    //});

    //    $("#slider-s").slider({});
    //    $('#slider-s').change(function () { adjustOpacity(); });


    var rangeSlider = function () {
        var slider = $('.range-slider'),
      range = $('.range-slider__range'),
      value = $('.range-slider__value');

        slider.each(function () {

            value.each(function () {
                var value = $(this).prev().attr('value');
                $(this).html(value);
            });

            range.on('input', function () {
                $(this).next(value).html(this.value);
                adjustOpacity();
            });
            range.on('change', function () {
                $(this).next(value).html(this.value);
                adjustOpacity();
            });
        });
    };

    rangeSlider();

}
);


var theValue;
function adjustOpacity() {
    if ($(".range-slider__range").val() == 100) {
        theValue = 1;
    }
    else {
        theValue = "0." + $(".range-slider__range").val();
    }


    $('#map_mostCurrent').css("opacity", theValue);
    $('#map_last20minutes').css("opacity", theValue);
    $('#map_last15minutes').css("opacity", theValue);
    $('#map_last10minutes').css("opacity", theValue);
    $('#map_last5minutes').css("opacity", theValue);

}

var northEastRegion; // = new esri.geometry.Extent(-91.271, 38.933, -68.228, 48.976,
// new esri.SpatialReference({ wkid: 4326 }));
var southEastRegion;
var northWestRegion;
var southWestRegion
function setNortheast() {
    map.setExtent(new esri.geometry.Extent(-91.271, 38.933, -68.228, 48.976,
      new esri.SpatialReference({ wkid: 4326 })));
    window.location = "#templatemo-top"
}
function zoomToRegion(which) {
    map.setExtent(which);
    window.location = "#templatemo-top"
}
"use strict";

var map;
var isslayer;
var animationInterval;
var layerList = [];
var listIndex = 0;
var subs = ['mesonet', 'mesonet1', 'mesonet2', 'mesonet3'];
var updateinterval;

require(['esri/map', 'esri/dijit/BasemapToggle', 'esri/layers/MapImageLayer', 'esri/layers/MapImage',
        'esri/geometry/Extent', 'esri/SpatialReference', 'dijit/form/HorizontalSlider', 'esri/dijit/Popup',
        'esri/dijit/PopupTemplate', 'dojo/domReady!'],
        function (Map, BasemapToggle, Popup, PopupTemplate, dom, on, parser, ready) {
            map = new Map('map',
            {
                basemap: 'topo',
                extent: new esri.geometry.Extent(-124.848974, 24.396308, -66.885444, 49.384358, new esri.SpatialReference({ wkid: 4326 }))
            }
        ); // map setup
            var toggle = new BasemapToggle({ map: map, basemap: 'hybrid' }, 'BasemapToggle');
            toggle.startup();
            isslayer = new esri.layers.GraphicsLayer({ id: 'issLayer' });
            map.addLayer(isslayer);
            setInterval('getISScurrentLocation()', 5000);
        });


function fullextent() {
    map.setExtent(new esri.geometry.Extent(-124.848974, 24.396308, -66.885444, 49.384358, new esri.SpatialReference({ wkid: 4326 })));
}
function getISScurrentLocation() {
    (function () {
        var iservlocal = 'http://api.open-notify.org/iss-now.json?callback=?';
        $.getJSON(iservlocal, { format: 'json' }).done(function (data) {
            map.getLayer('issLayer').clear();
            var geometrya = new esri.geometry.Point(data.iss_position.longitude, data.iss_position.latitude);
            isslayer.add(new esri.Graphic(geometrya,
                new esri.symbol.PictureMarkerSymbol('images/iss.png', 45, 45)));
        });
    })();
}



require(['dojo/ready', 'esri/layers/WebTiledLayer', 'esri/dijit/Search'],
    function (ready, WebTiledLayer, Search) {
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
            northEastRegion = new esri.geometry.Extent(-91.271, 38.933, -68.228, 48.976, new esri.SpatialReference({ wkid: 4326 }));
            southEastRegion = new esri.geometry.Extent(-91.271, 24.753390, -68.228, 36.455050, new esri.SpatialReference({ wkid: 4326 }));
            northWestRegion = new esri.geometry.Extent(-124.271, 40.933, -106.966, 49.976, new esri.SpatialReference({ wkid: 4326 }));
            southWestRegion = new esri.geometry.Extent(-124.271, 30.753390, -106.966, 40.455050, new esri.SpatialReference({ wkid: 4326 }));
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

    layerList.push(new esri.layers.WebTiledLayer('http://${subDomain}.agron.iastate.edu/cache/tile.py/1.0.0/' + which + '/${level}/${col}/${row}.png' + (new Date()).getTime(), {
        id: id,
        subDomains: subs
    }));
    map.addLayer(layerList[layerList.length - 1]);
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
        fixMaxHeight(false);
    }
    else{
        fixMaxHeight(true);
        if($(window).width() < 425)
        {
            updateQuickLinkLabels(true);
        }
        else {
            updateQuickLinkLabels(false);
        }
    }
  
});

function updateQuickLinkLabels(short)
{
    if (short) {
        $("#northwest").text("NW");
        $("#southwest").text("SW");
        $("#southeast").text("SE");
        $("#northeast").text("NE");
    }
    else
    {
        $("#northwest").text("Northwest");
        $("#southwest").text("Southwest");
        $("#southeast").text("Southeast");
        $("#northeast").text("Northeast");
    }
}

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
var myvarscroll
$(document).on('scroll', function () {
    myvarscroll = parseInt($(document).scrollTop());
    if (myvarscroll < 200)
    {
        $(".templatemo-top-menu").css('position', '');
        $('.templatemo-top-menu').css('min-height', '0px');
    }
});

var mapIsFull = false;
function fullScreenMap() {
    mapIsFull = true;
    $('.fullhide').hide();
    $('body').css('overflow', 'hidden');
    // $('.map').height($(window).height() - top_menu_height);
    $('.map').height($(window).height() - 38);
    $(".templatemo-top-menu").css('position', '');
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
    
    caroholdmaxheight = $('.carousel').css('max-height');

    $('.carousel').css('max-height', '100%');
    $('#templatemo-carousel').height($(window).height() - 38);
    $('#btnfullMap').text('Small Map');

}
var caroholdHeight;
var caroholdmaxheight;
function shrinkMap() {
    mapIsFull = false;
    $('.fullhide').show();
    if ($(window).width() < 370) {
        $('#templatemo-top').hide();
    }
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
    fixMaxHeight(true);
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
function fixMaxHeight(change) {
    firsttop = top_menu_height;
    viewHeight = $(window).height() - top_menu_height;
    mapHeight = $('#map').height();
    if (top_menu_height > 0) {
        if (change != false) {
            if ((viewHeight * 0.7) < mapHeight) {
                $('#templatemo-carousel').height(viewHeight * 0.7);
                wasfixed = 0;
            }
            else if (mapHeight < 500 && (viewHeight * 0.7) < 500) {
                $('#templatemo-carousel').height(viewHeight * 0.7);
                wasfixed = 1;
            }
        }
    }
    else {
        fixMaxHeightTimeout = setTimeout('fixMaxHeight(change)', 250);
    }

}
$(document).ready(
function () {
    fixMaxHeight(true);
    if ($(window).width() < 425) {
        updateQuickLinkLabels(true);
    }
    else {
        updateQuickLinkLabels(false);
    }


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


//$(document).on('pagecreate', '#index', function () {

//    $(document).on('slidestop', '#slider-s', function () {
//        console.log("stop");
//        adjustOpacity();
//    });
//});



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

function openEmailSuccess() {
    if ($('#sb-overlay').length > 0) {
        doTheBox();
    }
    else {
        setTimeout(openInfo, 500);
    }
}

function openEmailFailed()
{
    if ($('#sb-overlay').length > 0) {
        emailfailed();
    }
    else {
        setTimeout(openEmailFailed, 500);
    }
}

function doTheBox()
{
    Shadowbox.open({
        content: '<div id="welcome-msg">Your message has been sent, we will get back to you as soon as possible.</div>',
        player: "html",
        title: 'Email Sent!',
        height: 200,
        width: 300
    });
}
function emailfailed() {

    Shadowbox.open({
        content: '<div id="welcome-msg">Failed.</div>',
        player: "html",
        title: 'Email Sent!',
        height: 200,
        width: 300
    });
}
$(function () {
    Shadowbox.init({
        skipSetup: true,
        continuous: false,
        counterType: "none",
        enableKeys: false
    });
});

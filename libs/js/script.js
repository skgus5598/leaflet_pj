/*
$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow', function () {
            $(this).remove();
        });
    }
});

*/
const loader = $(".loader");
const html = $("html");
html.css({ 'overflow': 'hidden' });

$(window).on('load', () => {
    $(".page").hide();

     let icon = "<i id='pageLoad' class='bx bx-world bx-burst'><h3>GAZETTEER</h3></i>"
    // let icon = "<i id='pageLoad1' class='bx bx-world bx-fade-left'><h3>GAZETTEER</h3></i>"
    // icon += "<i id='pageLoad2' class='bx bx-world bx-fade-right'><h3>GAZETTEER</h3></i>"

    $(".loader").append(icon)
    setTimeout(() => {
        $(".page").fadeIn(1000);
        loader.fadeOut(1500);
        html.css({ 'overflow': 'auto' })
      //  $("#pageLoad").remove();
        $("#pageLoad1").remove();
        $("#pageLoad2").remove();

    }, 4000);
});



/*
 *  Objects of each Button Controls 
 */
let firstToggle = false;
let myLocationClick = false;
let myLocationGps = {
    countryCd: '',
    lat: '',
    lng: ''
}
const countryObj = {
    Head: {
        code: "",
        officialName: ""
    },
    CommonName: "",
    Capital: "",
    CLat: "",
    CLng: "",
    Population: "",
    Area: "",
    Languages: ""
};
const weatherObj = {
    Description: {
        icon: "",
        description: "",
        currentTemp: "",
        feelsLike: ""
    },
    Capital: "",
    Main: "",
    WindSpeed: "",
    Humidity: "",
    MaxTemp: "",
    MinTemp: ""
};
const exchObj = {
    ExchangeRate: {
        rates: "",
        currency: "",
        code: ""
    },
    CurrencyName: "",
    CurrencySymbol: "",
    Calculate: ""
};

let newsObj = [];
let wikiObj = [];
let wikiSearch = '';

/*
    Layers&Markers
*/
let airportMarkers = L.markerClusterGroup();
//let attrMarkers = L.markerClusterGroup();
let cityMarkers = L.markerClusterGroup();
let landMarkers = L.markerClusterGroup();

let cityMk_st = L.AwesomeMarkers.icon({
    icon: 'map-pin',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'purple',
});
let landMk_st = L.AwesomeMarkers.icon({
    icon: 'star',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'orange',
    spin: true
});
let airportMk_st = L.AwesomeMarkers.icon({
    icon: 'plane',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'blue',
});

//let attrCluster;
let cityCluster;
let landmarkCluster;
let airportCluster;
let airportToggle = false;
let attrToggle = false;

//fitbound
let countryGeo;
let borderStyle = {
    color: '#FFF670',
    weight: 2,
    fillOpacity: 0.02
}

$(document).ready(function () {
    //$('.loader').hide();
    $.ajax({
        url: "libs/php/geoJson.php",
        type: "GET",
        success: function (result) {
            const arr = result['features']
            let html = '';
            arr.sort((a, b) => { return a.properties.name < b.properties.name ? -1 : a.properties.name > b.properties.name ? 1 : 0 })
                .forEach(e => {
                    if (e.properties.name == 'Korea') {
                        html += `<option value='${e.properties.iso_a2}'>${e.properties.name}(South Korea) </option>`
                    } else if (e.properties.name == 'Dem. Rep. Korea') {
                        html += `<option value='${e.properties.iso_a2}'>${e.properties.name}(North Korea) </option>`
                    } else {
                        html += `<option value='${e.properties.iso_a2}'> ${e.properties.name} </option>`;
                    }
                    //geoJson default setting
                    if (e.properties.iso_a2 == 'GB') {
                        countryGeo = L.geoJson(e, { style: borderStyle })
                    }
                });
            $("#countrySelect").append(html);
            setLocation();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
});

const setLocation = () => {
    if (navigator.geolocation) {
        let options = { timeout: 70000 }; // maximum API request time
        navigator
            .geolocation
            .getCurrentPosition(setCurrentCountry, setDefault, options);
    }
}

// Location request success
const setCurrentCountry = (position) => {
    let userLng = position.coords.longitude;
    let userLat = position.coords.latitude;
    $.ajax({
        url: "libs/php/currentCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            userLng,
            userLat
        },
        success: function (result) {
            $("#countrySelect").val(result['data'].countryCode).prop("selected", true);
            myLocationGps.countryCd = $("#countrySelect").val();
            myLocationGps.lat = userLat;
            myLocationGps.lng = userLng;
            changeCountry();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error');
            setDefault();
        }
    });
}

// Default || location request deny
const setDefault = () => {
    if(myLocationClick){
        alert("Please turn on your location")
    }else{
        $("#countrySelect").val('GB').prop("selected", true);
        countryInfo($("#countrySelect").val());
    }
};

/*
    Country Information
*/
const countryInfo = (countryCd) => {
    $.ajax({
        url: 'libs/php/countryInfo.php',
        type: 'POST',
        dataType: 'JSON',
        data: {
            code: countryCd
        },
        success: function (result) {
            countryObj.Head.code = result.code;
            countryObj.Head.officialName = result.officialName;
            countryObj.CommonName = result.commonName;
            countryObj.Capital = result.capital.toString();
            countryObj.CLat = result.capitalLatLng[0];
            countryObj.CLng = result.capitalLatLng[1];
            countryObj.Population = result.population.toLocaleString();
            countryObj.Area = result.area.toLocaleString() + " km&sup2;"
            countryObj.Languages = result.languages;
            exchObj.ExchangeRate.code = result.code;
            exchObj.ExchangeRate.currency = result.currency;
            exchObj.CurrencyName = result.currencyName;
            exchObj.CurrencySymbol = result.currencySymbol;
            getAttractions();
            weather();
            exchange();
            getWiki();
          //  getNews();
        },
        error: function () {
            console.log("country info error")
        }
    })
}

/*
    Weather
*/
const weather = () => {
    $.ajax({
        url: 'libs/php/getWeather.php',
        type: 'POST',
        dataType: 'JSON',
        data: {
            lat : countryObj.CLat ,
            lng : countryObj.CLng
        },
        success: function (result) {
            weatherObj.Capital = result.city
            weatherObj.Description.description = result.description;
            weatherObj.Description.icon = result.icon;
            weatherObj.Main = result.main;
            weatherObj.WindSpeed = result.windSpeed;
            weatherObj.Humidity = result.humidity;
            weatherObj.Description.currentTemp = Math.round(result.currentTemp) + " &#8451;";
            weatherObj.Description.feelsLike = Math.round(result.feelsLike) + " &#8451;";
            weatherObj.MaxTemp = Math.round(result.maxTemp) + " &#8451;";
            weatherObj.MinTemp = Math.round(result.minTemp) + " &#8451;";
        },
        error: function () {
            console.log("weather info error")
        }
    });
};


/*
   ExchangeRates
*/

const exchange = () => {
    $.ajax({
        url: 'libs/php/getExchange.php',
        type: 'GET',
        dataType: 'JSON',
        success: function (result) {
            for (let key in result.data) {
                if (key == exchObj.ExchangeRate.currency) {
                    exchObj.ExchangeRate.rates = result.data[key];
                    break;
                }
            }
        },
        error: function () {
            console.log("currency error");
        }
    });
};

/*
   getNews
*/
//Limit Exceeded error
const getNews = () => {
    $.ajax({
        url: 'libs/php/getNews.php',
        type: 'POST',
        dataType: 'JSON',
        data: {
            lat: countryObj.CLat,
            lng: countryObj.CLng
        },
        success: function (result) {
            newsObj = result.data

        },
        error: function () {
            console.log("getnews error");
        }
    });
};

const getWiki = () => {
    if ($("#searchInput").val() == undefined || $("#searchInput").val() == '') {
        wikiSearch = countryObj.CommonName;
    } else {
        wikiSearch = $("#searchInput").val()
    }

    $.ajax({
        url: 'libs/php/getWiki.php',
        type: 'POST',
        dataType: 'JSON',
        data: {
            param: wikiSearch
        },
        success: function (result) {
            wikiObj = result.data;
            //createWikiTb(wikiObj);
        },
        error: function () {
            console.log("currency error");
        }
    });
}

const createWikiTb = (result) => {
    $("#modalTb>tbody").empty();
    let html = "";
    html += `<tr><td style='width:80%;' colspan='2'><input id='searchInput' type='text' placeholder='${wikiSearch}'></td>`
    html += `<td><input id='searchBtn'type='button' value='search' onclick='getWiki()'></td></tr>`

    result.forEach((e) => {
        html += "<tr style='background-color: #FDFFF6'><a href='#'>";
        html += `<td style='width:20%' class='text-center'>${e.title}</td>`
        html += `<td style='width:80%' colspan='2' ><i>${e.snippet}...</i>`
        html += `<h6 style='text-align:right'><a href='https://en.wikipedia.org/wiki/${e.title}' target='_blank'> → wikipedia</a></h6></td>`
        html += "</a></tr>"
    });
    $("#modalTb").append(html);
}

const createNewsTb = (result) => {
    $("#modalTb>tbody").empty();

    let html = "";
    result.sort((a, b) => { return a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0 })
        .forEach((e) => {
            let date = dateFormat(new Date(e.timestamp * 1000));
            html += "<tr style='background-color: #FDFFF6'><a href='#'>";
            html += `<td class='text-center'><img style='width:100%; height:100%' src='${e.source_image_url}'></td>`
            html += `<td><a href='${e.source_citation_url}' target='_blank'><em><b>${e.claim}</b></a><br/>`
            html += `<h6 style='text-align : right'>${date}</h6></em></td>`
            html += "</a></tr>"
        });
    $("#modalTb").append(html);
}

const dateFormat = (date) => {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();

    month = month >= 10 ? month : '0' + month;
    day = day >= 10 ? day : '0' + day;
    hour = hour >= 10 ? hour : '0' + hour;
    minute = minute >= 10 ? minute : '0' + minute;

    return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute;
};


const createTable = (result) => {
    $("#modalTb>tbody").empty();
    let html = '';
    for (let obj in result) {
        if (obj == 'status') {
            continue;
        }else if(obj == 'CLat' || obj =='CLng'){
            continue;
        } else if (obj == 'Head') {
            html += "<tr style='background-color: #FDFFF6'>"
            html += `<td colspan='2' class='text-center'><br/> `
            html += `<img src='https://flagsapi.com/${result[obj].code}/flat/64.png'> <br/>`
            html += `<i>${result[obj].officialName}</i></td>`
            html += "</tr>"
        } else if (obj == 'Description') {
            html += "<tr style='background-color: #FFFFCC'>"
            html += `<td class='text-center'>`
            html += `<img style='width:30%;' src='https://openweathermap.org/img/wn/${result[obj].icon}'><br/><i>${result[obj].description}</i>s</td>`
            html += `<td><br/><i> Current : <b> ${result[obj].currentTemp} </b> </i><br/>`
            html += `<i> Feels like :<b> ${result[obj].feelsLike} </b> </i><br/>`
            html += "</td>"
            html += "</tr>"
        } else if (obj == 'ExchangeRate') {
            html += "<tr>"
            html += `<td colspan='2' class='text-center'>`
            html += `<img src='https://flagsapi.com/US/flat/48.png'><b> 1 USD  = ${result[obj].rates} ${result[obj].currency}</b>&nbsp;&nbsp;`
            html += `<img src='https://flagsapi.com/${result[obj].code}/flat/48.png'>  </td>`;
            html += "</tr>"
        } else if (obj == 'Calculate') {
            html += "<tr>"
            html += "<td class='text-left'><input id='excg' placeholder='USD' oninput ='calcExch()' type ='number'></td>"
            html += "<td class='text-center' id='calcResult'><b>0</b></td>"
            html += "</tr>"
        } else {
            html += "<tr>"
            html += "<td class='text-left'>" + obj + "</td>"
            html += "<td class='text-center'><b>" + result[obj] + "</b></td>"
            html += "</tr>"
        }
    };
    $("#modalTb").append(html);
};

const calcExch = () => {
    let rate = exchObj.ExchangeRate.rates;
    let inputAmt = $("#excg").val();
    let calc = Math.floor(inputAmt * rate);
    $("#calcResult").text(calc.toLocaleString() + " " + exchObj.ExchangeRate.currency)
};


/*
    BaseMaps 
 */
const streets = L.tileLayer(
    'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey={apikey}',
    {
        attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        apikey: '72cc0dd08dfa4169a7711f3a5bb67f2b',
        maxZoom: 22
    });

const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
);

/*
    OverlayMaps Examples
*/
//var littleton = L.marker([51.505, -0.09]).bindPopup('This is Littleton, CO.')
let cities = L.markerClusterGroup();
let landmarks = L.markerClusterGroup();

//let landmarks = L.layerGroup();
//L.marker([51.505, -0.09]).bindPopup('This is Littleton, CO.').addTo(cities);
const overlayMaps = {
    "City" : cities,
    "Landmark" : landmarks
}


const basemaps = {
    "Streets": streets,
    "Satellite": satellite
};
let map = L.map("map", {
    layers: [streets]
}).setView([51.505, -0.09], 12);

let layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);

/*
    country border
*/
$("#countrySelect").change(function () {
    changeCountry();
})

const changeCountry = () => {
    if(!firstToggle){
        firstToggle = true;
    }else{
        cities.clearLayers();
        cityCluster.clearLayers();
        landmarks.clearLayers();
        landmarkCluster.clearLayers();
    }  
    //$(".leaflet-control-layers-overlays label input").prop('checked', true)

    if (airportToggle) {
        airportCluster.clearLayers();
        airportToggle = false;
    }

    let countryCd = $("#countrySelect option:selected").val();
    $.ajax({
        url: "libs/php/geoJson.php",
        type: 'POST',
        dataType: 'json',
        success: function (result) {
            countryGeo.clearLayers();
            let arr = result['features']
            let geojsonFeature = arr.filter((e) => e.properties.iso_a2 == countryCd);
            countryGeo = L.geoJson(geojsonFeature, { style: borderStyle }).addTo(map)
            //map.flyToBounds(countryGeo.getBounds())
            map.fitBounds(countryGeo.getBounds());
            countryInfo(countryCd);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
}

const getAttractions = () => {    
    $.ajax({
        url: "libs/php/getAttractions.php",
        type: 'POST',
        data: {
            code: countryObj.Head.code
        },
        dataType: 'json',
        success: function (result) {
            let arr = result.data;
            let cityMarker;
            let landmarkMarker;
            arr.filter((e) => e.feature == 'landmark' || e.feature == 'city')
                .forEach((e) => {
                    if (e.feature == 'landmark') {
                        landmarkMarker = L.marker([e.lat, e.lng], { icon: landMk_st })
                            .bindPopup(attrPop(e))//.addTo(landmarks)
                        landmarkCluster = landMarkers.addLayer(landmarkMarker).addTo(landmarks);
                    } else {
                        cityMarker = L.marker([e.lat, e.lng], { icon: cityMk_st })
                            .bindPopup(attrPop(e))//.addTo(cities)
                        cityCluster = cityMarkers.addLayer(cityMarker).addTo(cities);
                    }                  
                    map.addLayer(cities);
                    map.addLayer(landmarks);
                });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
};
const attrPop = (e) => {
    let html = '<div style="text-align:center; background-color:#F7EFFA">';
    if (e.thumbnailImg != null) {
        html += `<a href='https://${e.wikipediaUrl}'><img style='width:150px; height:100px' src='${e.thumbnailImg}'></a><br/>`
    }
    html += `<h3>${e.title}</h3>`
    html += `<i>${e.summary}</i><br>`
    html += `<a href="https://${e.wikipediaUrl}" target="_blank"> --> Wiki Link</a>`
    html += "</div>"
    return html
}

const getAirports = () => {
    map.fitBounds(countryGeo.getBounds());
    $.ajax({
        url: "libs/php/getAirports.php",
        type: 'POST',
        data: {
            code: countryObj.Head.code
        },
        dataType: 'json',
        success: function (result) {
            let arr = result.data;
            arr.forEach((e) => {
                let airportMarker = L.marker([e.lat, e.lng], { icon: airportMk_st })
                    .bindPopup(e.name);
                airportMarkers.addLayer(airportMarker);
                airportCluster = airportMarkers.addTo(map).bringToFront();
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
}

/*
 *  modal-popup
 */
const showModal = (opt, img, obj) => {
    if (obj == newsObj) {
        createNewsTb(obj)
    } else if (obj == wikiObj) {
        createWikiTb(obj)
    } else {
        createTable(obj);
    }
    let title = `<h2>${opt} <img src='libs/images/${img}.png'></h2>`
    $(".modal-title").html(title);
    $("#popModal").modal("show");
}
/*
    Location Loader 
*/

const loaderShow = () => {
    let icon = "<i class='bx bx-current-location bx-spin bx-flip-vertical' ></i>"
    loader.append(icon)
    loader.show();
    setTimeout(() => {
        loader.fadeOut(300);
        html.css({ 'overflow': 'auto' });
    }, 4000);
};


/*
 * L.easyButton(add control button)
 */

let mylocationBtn = L.easyButton({
    id: 'mylocationBtn',
    position: 'topright',
    states: [{
        icon: '<img id="modal-open" class="controlBtnLoc" src="libs/images/locate.png">',
        title: 'My Location',
        onClick: function onEachFeature(f, l) {
            myLocationClick = true;
            if (myLocationGps.countryCd != '') {
                $("#countrySelect").val(myLocationGps.countryCd).prop("selected", true);
                changeCountry();
            } else {
                setLocation();
            };

        }
    }]
}).addTo(map);
let wikiBtn = L.easyButton({
    id: 'wikiBtn',
    position: 'bottomright',
    states: [{
        icon: '<img class="controlBtn" src="libs/images/wikipedia.png">',
        title: 'Search',
        onClick: function onEachFeature(f, l) {
           // getWiki();
            showModal('Wikipedia', 'wikipedia', wikiObj)
        }
    }]
}).addTo(map);

let newsBtn = L.easyButton({
    id: 'newsBtn',
    position: 'bottomright',
    states: [{
        icon: '<img id="modal-open" class="controlBtn" src="libs/images/news.png">',
        title: 'Local News',
        onClick: function onEachFeature(f, l) {
           // getNews()
            showModal('Local News', 'news', newsObj)

        }
    }]
}).addTo(map);

let currencyBtn = L.easyButton({
    id: 'currencyBtn',
    position: 'bottomright',
    states: [{
        icon: '<img id="modal-open" class="controlBtn" src="libs/images/currency.png">',
        title: 'Exchange Rates',
        onClick: function onEachFeature(f, l) {
            showModal('Exchange Rate', 'currency', exchObj)

        }
    }]
}).addTo(map);

let weatherBtn = L.easyButton({
    id: 'weatherBtn',
    position: 'bottomright',
    states: [{
        icon: '<img id="modal-open" class="controlBtn" src="libs/images/sky.png">',
        title: 'Weather Info',
        onClick: function onEachFeature(f, l) {
            showModal('Weather', 'sky', weatherObj)

        }
    }]
}).addTo(map);

let countryInfoBtn = L.easyButton({
    id: 'countryInfoBtn',
    position: 'bottomright',
    states: [{
        icon: '<img id="modal-open" class="controlBtn" src="libs/images/location.png">',
        title: 'Country Info',
        onClick: function onEachFeature(f, l) {
            showModal('Country Information', 'country', countryObj)
        }
    }]
}).addTo(map);

let airportBtn = L.easyButton({
    id: 'airportBtn',
    position: 'bottomright',
    states: [{
        icon: '<img id="modal-open" class="controlBtn" src="libs/images/plane.png">',
        title: 'Airports',
        onClick: function onEachFeature(f, l) {
            if (airportToggle) {
                airportCluster.clearLayers();
                airportToggle = !airportToggle;
            } else {
                getAirports();
                airportToggle = !airportToggle;

            };
        }
    }]
}).addTo(map);
/*
let attrBtn = L.easyButton({
    id: 'attrBtn',
    position: 'bottomright',
    states: [{
        icon: '<img id="modal-open" class="controlBtn" src="libs/images/attraction.png">',
        title: 'Attractions',
        onClick: function onEachFeature(f, l) {
            if (attrToggle) {
                attrCluster.clearLayers();
                attrToggle = !attrToggle;
            } else {
                getAttractions();
                attrToggle = !attrToggle;
            };
        }
    }]
}).addTo(map);
*/
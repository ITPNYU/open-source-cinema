//this asks poly for a model based on a key
function searchPoly(keywords) {
    console.log("Searching Poly for " + keywords);
    //You get your own api key at the creditial part of https://console.developers.google.com -->
    const API_KEY = 'AIzaSyBi_F0gaMWtXi8Ngerunlwe1vRFkjy8cdI';
    var url = `https://poly.googleapis.com/v1/assets?keywords=${keywords}&format=OBJ&key=${API_KEY}`;
    //THE IS HOW YOU MAKE A NETWORK CALL IN PURE JAVASCRIPT
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.addEventListener('load', function (event) {
        //go looking throught he json that comes back
        var data = JSON.parse(event.target.response);
        var assets = data.assets;
        if (assets) {
            //for ( var i = 0; i < assets.length; i ++ ) {  //POLY GIVES MORE THAN ONE CHOICE
            var asset = assets[0];
            var format = asset.formats.find( format => { return format.formatType === 'OBJ'; } );
            if (format === undefined){
                console.log("no OBJ option");
            }else{
                var obj = format.root;
                var mtl = format.resources.find( resource => { return resource.url.endsWith( 'mtl' ) } );
                mtl = mtl.relativePath;
                var path =   obj.url.slice( 0, obj.url.indexOf( obj.relativePath ) );
                obj = obj.relativePath;
                createObject(path,mtl,obj);
            }
        } else {
            results.innerHTML = '<center>NO RESULTS</center>';
        }
    });
    request.send(null);
}

///////MAPS

function askForLatLong(query){
    console.log("asking");
    //var query = $("#place").val();
    var api_key = "AIzaSyBi_F0gaMWtXi8Ngerunlwe1vRFkjy8cdI";
    ///work around  CORS Exception with proxy from herokuap
    var url = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address="+  query + "&key=" + api_key;
console.log(url);
    //THIS IS HOW YOU MAKE A NETWORK CALL IN JQUERY
    $.ajax( { 
    url: url,
    type: "POST",
    contentType: "application/json",
    success: function(data){
       // console.log(data);
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        newLoc = {};
        newLoc.lat = lat;
        newLoc.lng = lng;
        console.log(newLoc);
        initializeGoogleMaps(newLoc);
    },
    failure: function(data){  console.log("didn't find place" );}
    });
}

//this gets called from script tag
function initializeGoogleMaps(loc) {

        console.log("load google maps")
        if (!loc) {  //Fenway Park Boston by default
            var loc = { lat: 42.345573, lng: -71.098326 };
        }

        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), {
                position: loc,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            });
}
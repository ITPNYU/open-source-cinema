var selectedElement;
var capture;
var objects = [];
var name_field;
var scene_field;
var sceneNum = 1;
var allOthers = [];
var controls;
var pano = true;
var p5canvas;
var pg;
var vid_width = 320;
var vid_height = 240;
var img;

var camera3D;  //be careful because p5.js might have something named camera
var scene ;  //be careful because our sketch has something named scene
var renderer ;
var handProxy;
var video_texture

//go to  http://docs.mlab.com/ sign up and get get your own api Key and make your own db and collection
var apiKey = "COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN";
var db = "osc";
var coll = "osc_mobile";

function setup(){
 p5canvas = createCanvas(vid_width,vid_height);
//imageMode(CENTER);
  makeMask();
  console.log("Start Her Up" + canvas);
  setUp3D();
  UI_in_html();

 set_up_video()
   document.addEventListener( 'wheel', onDocumentMouseWheel, false );
}

function makeMask(){



  //createCanvas(720, 400);
  img = createImage(320, 240);
  img.loadPixels();
  for(var x = 0; x < img.width; x++) {
    for(var y = 0; y < img.height; y++) {
       var d = dist(x,y,img.width/2, img.height/2);

      var a = 255;//map(y, 0, img.height, 0, 255);
        if (d > img.width/6){
           a = 0;
         }
      img.set(x, y, [255,0,255, a]);
    }
  }
  img.updatePixels();
}


//  pg = createGraphics(vid_width,vid_height);
//pg.imageMode(CENTER);
    //pg.background(255);
      //pg.fill(0200, 0300);
    //  pg.clear();
//pg.fill(0,255,255,0);
  // pg.ellipse(100,100,100,100);
    //pg.noStroke();
  //  pg.background(255);
//    pg.ellipseMode(CENTER);
  //  pg.ellipse(vid_width/2,vid_height/2,vid_width,vid_height);
//  for (var i = 1; i < pg.width/2; i++)   {
  //    pg.fill(i*2,i*2);
  //    pg.ellipse(pg.width/2, pg.height/2, pg.width-(2*i), pg.height-(2*i));
  // }

//}
function set_up_video(){
    capture = createCapture(VIDEO);


  //  canvas = document.getElementById('video_canvas');
    //canvas.style.display="none";
  //  canvas.width = CANVW;
    //canvas.height = CANVH;
    //ctx = capture.elt.getContext('2d');
  capture.size(vid_width,vid_height);

  capture.hide();
    var geo = new THREE.PlaneGeometry(vid_width/4,vid_height/2);
    //  geo.scale(  1, 1, -1 );
    video_texture = new THREE.Texture( p5canvas.elt);  //make this global because you have to update it
    //video_texture.scale.x= .1;
    //  video_texture.scale.y= .1;
    video_texture.minFilter = THREE.LinearFilter;
    //var mat = new THREE.MeshBasicMaterial({ map: green_screen_texture });

    var mat = new THREE.MeshBasicMaterial({ map: video_texture , transparent: true, opacity: 1, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geo, mat);
  ///  plane.position.y = 0;
//    plane.position.x = 200;
  // plane.position.z = -300;
//    plane.scale.set(4,4,1);
    //  scene.add(plane);
  handProxy.add(plane);
  plane.position.set(0,0,-300);
    //plane.scale.set(2,2,2);

    return plane;


  }
function UI_in_html(){
  name_field = $("#name");
  name_field.val("Dan");
    $("#lock_pano").click(lockPano);
    $("#add_text").on('keyup', function (e) {
      if (e.keyCode == 13) {
        //use the little thing you attached to camera to get location to place text
        var posInWorld = handProxy.getWorldPosition() ;
        var rotationInWord = handProxy.getWorldRotation( );
        var mesh = createNewText(($("#add_text").val()),posInWorld.x,posInWorld.y,posInWorld.z,rotationInWord.x,rotationInWord.y,rotationInWord.z );
        scene.add(mesh);
        objects.push(mesh);
        saveText($("#add_text").val(),mesh);
        //clear it out of the way
        $("#add_text").css('top',-window.innerHeight/3);
        $("#add_text").css('left',-window.innerWidth/4  - $("#add_text").width()/2);
        $("#add_text").val("");

      }
    });
}

function setUp3D(){
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera( 75, (window.innerWidth/2)/window.innerHeight, .1, 1000 );
  //renderer = new THREE.WebGLRenderer();
  controls = new THREE.DeviceOrientationControls( camera3D );
  //  renderer.setSize( window.innerWidth/2, window.innerHeight );
  //  document.getElementById( 'container' ).appendChild( renderer.domElement );
   camera3D.position.z = 5;
  //create a sphere to put the panoramic video on
  var geometry = new THREE.SphereGeometry( 500, 16, 8 );
  geometry.scale( - 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load('ruin.jpg')
  } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  var container = document.getElementById( 'container' );
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = 0;
  container.appendChild(renderer.domElement);
  //ugly little greeen cube that follows camera like your handPosition
    var geometry = new THREE.PlaneGeometry(4,3);
  //var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 ,opacity : 0} );
  handProxy = new THREE.Mesh( geometry, material );
  scene.add(camera3D);//add the camera to the scene
  camera3D.add( handProxy ); // then add the handProxy to the camera so it follow it
  handProxy.position.set(0,0,10);
  handProxy.visible = true;  //less ugly
}

function createNewText(text, x,y,z,rx,ry,rz) {
  var canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  var fontSize  = Math.max(camera3D.fov/2,9);
  context.font = fontSize + "pt Arial";
  context.textAlign = "center";
  context.fillStyle = "white";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  var textTexture = new THREE.Texture(canvas);
  textTexture.needsUpdate = true;
  var material = new THREE.MeshBasicMaterial({ map: textTexture , transparent: true });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  //copy the little green (invisible? ) box that you added to follow camera
  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = z;
  mesh.rotation.x = rx;
  mesh.rotation.y = ry;
  mesh.rotation.z = rz;
  mesh.scale.set(5,5,5);
  return mesh;
}

function lockPano(){
    console.log("toggle pano lock");
    pano = !pano;
}

function draw(){  //there is a more official way to do this in three js
  if (pano){
    controls.update();
  }
      //pg._renderer);
//
  //image(pg,0,0);
  //image(pg,0,0);
  //background(255,0,0,255);

capture.mask(img);
//  scale(-1.0,1.0);
push();
translate(capture.width,0);
scale(-1.0,1.0);



  image(capture,0,0,vid_width,vid_height);
  pop();
  //  image(img,0,0);


  video_texture.needsUpdate = true;
  renderer.render(scene, camera3D);

}

function saveText(myText, thisObj){
  var myName =  name_field.val() ;
  var thisElementArray = {}; //make an array for sending
  thisElementArray.owner = myName;
  thisElementArray.type = "text"
  thisElementArray.scene = sceneNum ;
  thisElementArray.msg = myText;
  thisElementArray.x = thisObj.position.x;
  thisElementArray.y = thisObj.position.y;
  thisElementArray.z = thisObj.position.z;
  thisElementArray.rx = thisObj.rotation.x;
  thisElementArray.ry = thisObj.rotation.y;
  thisElementArray.rz = thisObj.rotation.z;

  var data = JSON.stringify(thisElementArray ) ;
  var myName = name_field.val() ;

  var query =  "q=" + JSON.stringify({ owner:myName,scene:sceneNum}) ;
  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?" +  query + "&apiKey=" + apiKey,
  data: data,
  type: "POST",
  contentType: "application/json",
  success: function(data){console.log("saved text" );},
  failure: function(data){  console.log("didn't text" );}
});
}

function onDocumentMouseWheel( event ) {
  camera3D.fov = Math.max(Math.min(100,camera3D.fov + event.deltaY * 0.05),1);
  camera3D.updateProjectionMatrix();

}

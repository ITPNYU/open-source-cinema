var objects = [];
var selectedObject;
var handProxy;

// Three.js variables
var width = window.innerWidth;
var height = window.innerHeight;
var camera3D;  //be careful because p5.js might have something named camera
var scene;
var renderer;

var kinectron = null;
var mode = "keying";

//Three.js version of p5's "setup"
function init() {
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.getElementById( 'container' ).appendChild( renderer.domElement );

  camera3D.position.z = 5;
  //create a sphere to put the panoramic video on
  var geometry = new THREE.SphereGeometry( 500, 60, 40 );
  geometry.scale( -1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load('ruin.jpg')
  } );
  var mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );
  ///UI
  htmlInterface();
  //document.addEventListener( 'mousedown', onDocumentMouseDownCheckObject, false); //check for clicks
  activatePanoControl(camera3D); //field mouse dragggin to move camera

//UGLY LITTLE PROXY FOR YOUR handPosition
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  handProxy = new THREE.Mesh( geometry, material );
  //scene.add(handProxy);
  scene.add(camera3D);//add the camera to the scene
  camera3D.add( handProxy ); // then add the handProxy to the camera so it follow it
  handProxy.position.set(0,0,-10);
}

//key pressed won't work unless you wake up p5 but we are using three.js's "init" funciton instead
function setup(){
}
function htmlInterface(){
  //moved most of these out into html file instead of creating them in p5js
  name_field = $("#name");
  name_field.val("Dan");
  scene_field = $("#sceneNum");
  plot_point_field = $("#plot_point");
  $("#previous").click(previous);
  $("#next").click(next);
  $("#previous_plot_point").click(previousPlotPoint);
  $("#next_plot_point").click(nextPlotPoint);
  scene_field.val(sceneNum);
  plot_point_field.val(plotPoints[plotPoint]);
  //if they hit return in ip address text entry field than connect to kinectron
  $("#kinectron_address").on('keyup', function (e) {
    if (e.keyCode == 13) {
      connectToKinectron($("#kinectron_address").val());
    }
  });
}

function connectToKinectron(ipAddress){
  //if you already have a connection kill it
  if(kinectron) kinectron.stopAll();
  // Define and create an instance of kinectron
  kinectron = new Kinectron(ipAddress);
  // Connect remote to application
  kinectron.makeConnection();
  mode = "keying"
  //this is using object oriented coding for the a kinectronKey
  var keyObject = new kinectronKey(-200,0,300);
//plane.position.z = 300;
//  var keyObject = new kinectronKey(handProxy.position.x, handProxy.position.y, handProxy.position.z); //connect to kinectron an get a keyed image
  scene.add(keyObject.getMesh() );
  selectedObject = keyObject;
  objects.push(keyObject );  //put it in the list of things that you check for mouse clicks on
  kinectron.startKey(gotKey);//listen to the kinectron with this object
  console.log("Connected to " + ipAddress );
//  console.log(keyObject);
}

function gotKey(data){
//relay the general callback to the particular key object
   selectedObject.gotKey(data);
}

function keyPressed(){

// moving things the old way of moving things around
  if(selectedObject){
    var thisMesh = selectedObject.getMesh();
    console.log(thisMesh);
    if (keyCode == 37){
      thisMesh.rotation.y =   thisMesh.rotation.y  + Math.PI/18;
      saveKeying(selectedObject);
    }else if (keyCode == 39){
      thisMesh.rotation.y =   thisMesh.rotation.y  - Math.PI/18;
      saveKeying(selectedObject);
    }else if (keyCode == 38){
      thisMesh.position.z =   thisMesh.position.z  + 10;
      saveKeying(selectedObject);
    }else if (keyCode == 40){
      thisMesh.position.z =   thisMesh.position.z - 10;
      saveKeying(selectedObject);
    }
  }
  //space key change modes
  if (key == ' '){ //space key
    if (mode == "keying"){
      kinectron.stopAll();
      kinectron.startTrackedBodies(gotBody);
      mode = "moving"
      console.log("change to moving");
    }else{
      kinectron.stopAll();
      kinectron.startKey(gotKey);
      mode = "keying"
      console.log("change to keying");
    }
  }

}

function gotBody(data){
  //numbers come in normalized 0-1 and you need to scale them to your space
  var scaleBy = 500;
  var leftHand = data.joints[kinectron.HANDLEFT];
  var rightHand = data.joints[kinectron.HANDRIGHT];
  x = map(leftHand.cameraX,0,1,0,scaleBy);
  y = map(leftHand.cameraY,0,1,0,scaleBy);
  z = map(leftHand.cameraZ,0,1,scaleBy,0);
  handProxy.position.set(x,y,-z);
  //go look what the handProxy is intersectin with
  var closestObject = checkIntersections();
  if (closestObject[0] != -1){
    //if they made a fist gesture
    if(data.leftHandState == 3){

      var closestObjectIndex = closestObject[0];
      selectedObject = objects[closestObjectIndex];
      //find the position of the handProxy and pretend it is your hand.
      var handPosition = new THREE.Vector3();
      handPosition.setFromMatrixPosition( handProxy.matrixWorld );
      var handPosInWorld = handPosition; //camera3D.localToWorld( handPosition  );
      //console.log(handPosInWorld);
      selectedObject.getMesh().position.set(handPosInWorld.x, handPosInWorld.y, handPosInWorld.z);
      //this only works so so, might consider using the rotation of another joint
      //selectedObject.getMesh().rotation.set(rightHand.orientationX, rightHand.orientationY, rightHand.orientationZ);
    }
  }
  //  console.log(data);
}

//Three.js version of p5's "draw"
function animate() {
  requestAnimationFrame(animate);
  for(var i = 0; i < objects.length; i++){
    objects[i].animate();
  }

  // animateVideo();
  renderer.render(scene,   camera3D);
}

init();
animate();

//checks against the list of objects for what you have clicked on to make it the "selectedObject"
function onDocumentMouseDownCheckObject( e ) {
  console.log("clicked object", selectedObject);
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera3D );
  var intersects = raycaster.intersectObjects( objects, true );
  var tempobj;
  for( var i = 0; i < intersects.length; i++ ) {
    var intersection = intersects[ i ],
    tempobj = intersection.object;
    //break;
  }
  if (tempobj) selectedObject = tempobj
  console.log("clicked object", selectedObject);

}

function checkIntersections(){
  var shortestDistance = 31000;  //holds world's record for closest, set high at start
  var winningObject = -1;
  scene.updateMatrixWorld(true);
  for (var i = 0; i < objects.length; i++){
    var handPosition = new THREE.Vector3();
    handPosition.setFromMatrixPosition( handProxy.matrixWorld );
    var objectPosition = new THREE.Vector3();
    objectPosition.setFromMatrixPosition( objects[i].getMesh().matrixWorld );
    var distance = handPosition.distanceTo(objectPosition);
    if (distance < shortestDistance){
      shortestDistance = distance;
      winningObject = i; //best so far
    }
  }
  var winnings = [winningObject,shortestDistance];
  return winnings;
}

//video
//  var vidObject = addVideo("sintel.mp4");
//  scene.add(vidObject);
//  objects.push(vidObject);

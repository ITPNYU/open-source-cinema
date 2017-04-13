var objects = [];
var selectedObject;
var cube;

// Three.js variables
var width = window.innerWidth;
var height = window.innerHeight;
var camera3D;  //be careful because p5.js might have something named camera
var scene;  //be careful because our sketch has something named scene
var renderer;


var kinectron = null;
var kinectronIpAddress = "172.16.223.176"; // FILL IN YOUR KINECTRON IP ADDRESS HERE
var mode = "keying";


//key pressed won't work unless you wake up p5 but we are using three.js's "init" funciton instead
function setup(){
}

function keyPressed(){
  console.log(keyCode);
  if(selectedObject){
    if (keyCode == 37){
      selectedObject.rotation.y =   selectedObject.rotation.y  + Math.PI/18;
      saveKeying(selectedObject);
    }else if (keyCode == 39){
      selectedObject.rotation.y =   selectedObject.rotation.y  - Math.PI/18;
      saveKeying(selectedObject);
    }else if (keyCode == 38){
      selectedObject.position.z =   selectedObject.position.z  + 10;
      saveKeying(selectedObject);
    }else if (keyCode == 40){
      selectedObject.position.z =   selectedObject.position.z - 10;
      saveKeying(selectedObject);
    }

  }

  //change modes
  if (key == ' '){ //space key

    if (mode == "keying"){
      kinectron.stopAll();
      kinectron.startBodies(gotBody);
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

  var whichBody = -1;
  //if multiple bodies come in find the first one with some joints.
  for(var i = 0; i < data.bodies.length; i++){
    if(data.bodies[i].joints){
      whichBody = i;
      break;
    }
  }
  //if none have joints skip
  if (whichBody == -1) return;
  //numbers come in normalized 0-1 and you need to scale them to your space
  var scaleBy = 500;
  var leftHand = data.bodies[whichBody].joints[kinectron.HANDLEFT];
  var rightHand = data.bodies[whichBody].joints[kinectron.HANDRIGHT];
  x = map(leftHand.cameraX,0,1,0,scaleBy);
  y = map(leftHand.cameraY,0,1,0,scaleBy);
  z = map(leftHand.cameraZ,0,1,scaleBy,0);
  cube.position.set(x,y,-z);
  //go look what the cube is intersectin with
  var closestObject = checkIntersections();
  if (closestObject[0] != -1){
    //if they made a fist gesture
    if(data.bodies[0].leftHandState == 3){
      //console.log(closestObject);
      var closestObjectIndex = closestObject[0];
      selectedObject = objects[closestObjectIndex];
      //console.log(selectedObject);
      var handPosition = new THREE.Vector3();
      handPosition.setFromMatrixPosition( cube.matrixWorld );

      var handPosInWorld = handPosition; //camera3D.localToWorld( handPosition  );
      console.log(handPosInWorld);
      selectedObject.position.set(handPosInWorld.x, handPosInWorld.y, handPosInWorld.z);
      selectedObject.rotation.set(rightHand.orientationX, rightHand.orientationY, rightHand.orientationZ);
    }
  }
  //  console.log(data.bodies[0]);


}

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


  //video
  //  var vidObject = addVideo("sintel.mp4");
  //  scene.add(vidObject);
  //  objects.push(vidObject);
  htmlInterface();

  ///UI
  document.addEventListener( 'mousedown', onDocumentMouseDownCheckObject, false); //check for clicks
  activatePanoControl(camera3D); //field mouse dragggin to move camera

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  cube = new THREE.Mesh( geometry, material );
  //scene.add(cube);
  scene.add(camera3D);//add the camera to the scene
  camera3D.add( cube ); // then add the cube to the camera
  cube.position.set(0,0,-10);

  // Define and create an instance of kinectron
  kinectron = new Kinectron(kinectronIpAddress);
  //kinectron = new Kinectron("kinectron.itp.tsoa.nyu.edu");  //for one at itp
  // Connect remote to application
  kinectron.makeConnection();
  //key
  var keyObject = setupKey(); //connect to kinectron an get a keyed image
  scene.add(keyObject );
  objects.push(keyObject );  //put it in the list of things that you check for mouse clicks on

}

//Three.js version of p5's "draw"
function animate() {
  requestAnimationFrame(animate);
  // Update the textures for each animate frame
  animateKey();
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
    handPosition.setFromMatrixPosition( cube.matrixWorld );
    var objectPosition = new THREE.Vector3();
    objectPosition.setFromMatrixPosition( objects[i].matrixWorld );
    var distance = handPosition.distanceTo(objectPosition);
    if (distance < shortestDistance){
      shortestDistance = distance;
      winningObject = i; //best so far
    }
  }
  var winnings = [winningObject,shortestDistance];
  return winnings;
}

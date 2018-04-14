var grabbableMeshes = [];
var selectedObject;
var handProxy;

// Three.js variables
var width = window.innerWidth;
var height = window.innerHeight;
var camera3D;  //be careful because p5.js might have something named camera
var scene;
var renderer;
var p5Texture;

var kinectron = null;
var mode = "keying";

init();
animate();

function animate() {
  requestAnimationFrame(animate);
 //for(var i = 0; i < grabbableMeshes.length; i++){
  //  grabbableMeshes[i].animate();
//  }
  animateP5();
  if(p5Texture ) p5Texture.needsUpdate = true;


	if(videoTexture){
    videoImageContext.drawImage(foregroundVideo, 0, 0);
    videoTexture.needsUpdate = true;
  }
  renderer.render(scene,   camera3D);
}


//Three.js version of p5's "setup"
function init() {
  console.log("init three js");
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
  /////THROW IN A LIGHT
  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );
  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set(1, 1, -10 );
  scene.add( directionalLight );

  ///UI
  htmlInterface();
  addVideo();
  addModels();
  document.addEventListener( 'mousedown', onDocumentMouseDownCheckObject, false); //check for clicks
  activatePanoControl(camera3D); //field mouse dragggin to move camera

//UGLY LITTLE PROXY FOR YOUR handPosition
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  handProxy = new THREE.Mesh( geometry, material );
  scene.add(camera3D);//add the camera to the scene
  camera3D.add( handProxy ); // then add the handProxy to the camera so it follow it
  handProxy.position.set(0,0,-10);

}

//key pressed won't work unless you wake up p5 but we are using three.js's "init" funciton instead
//function setup(){
//}

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
  scene.add(keyObject.getMesh() );
  selectedObject = keyObject;
  grabbableMeshes.push(keyObject.getMesh() );  //put it in the list of things that you check for mouse clicks on
  kinectron.startKey(gotKey);//listen to the kinectron with this object
  console.log("Connected to " + ipAddress );
//  console.log(keyObject);
}

//called by kinectron when a keyed image (with background removed) comes in.
function gotKey(data){
  var img1 = new Image;
  img1.src = data.src;
  var kinectObject = selectedObject;
  img1.onload =  function () {
  kinectObject.ctx .clearRect(0,0,   512 ,   512 );
    kinectObject.ctx .drawImage(data,0,0,    512 ,   512 );
    kinectObject .animate();
  };
}

function loadP5Sketch(p5Canvas){
  ////PUT IN A P5 SKETCH USING THE CANVAS MADE IN P5 AS A TEXTURE

         geo = new THREE.PlaneGeometry(100,100);
          p5Texture = new THREE.Texture( p5Canvas.elt );
          mat = new THREE.MeshBasicMaterial({ map: p5Texture, transparent: true, opacity: 1, side: THREE.DoubleSide });
          var plane = new THREE.Mesh(geo, mat);
          plane.position.y = 0;
  		    plane.position.z = -100;
          plane.rotation.x = 0;  //-Math.PI/2;
          plane.rotation.y = 0; //-Math.PI/2;
  		    plane.scale.set(2,2,2);
          scene.add(plane);
}

function addModels(){
  ///START LOADING MODELS

    var manager = new THREE.LoadingManager();
         manager.onProgress = function ( item, loaded, total ) {
              console.log( item, loaded, total );
          };
     var onProgress = function ( xhr ) {
              if ( xhr.lengthComputable ) {
                  var percentComplete = xhr.loaded / xhr.total * 100;
                  console.log(  Math.round(percentComplete, 2) + '% downloaded' );
             }
          };
          var onError = function ( xhr ) {
          };


  //////LOAD IN A STORE BOUGHT .OBJ MODEL OF LITTLE MAN AND IT'S TEXTURE
          var texture = new THREE.Texture();

          var imageLoader = new THREE.ImageLoader( manager );
          imageLoader.load( 'UV_Grid_Sm.jpg', function ( image ) {
              texture.image = image;
              texture.needsUpdate = true;
          } );
  		var littleGuyLoader = new THREE.OBJLoader( manager );

  		littleGuyLoader.load( 'male02/male02.obj', function ( object ) {
              object.traverse( function ( child ) {
                  if ( child instanceof THREE.Mesh ) {
                      child.material.map = texture;
                      grabbableMeshes.push( child);
                  }
              } );
              object.position.y = -200;
              object.position.z =  -200;
              object.position.x = -100;
              object.rotation.y = 90*Math.PI / 180;
              object.scale.y = 1;
              object.scale.z = 1;
              scene.add( object );
          }, onProgress, onError );

  ///// LOAD IN ANOTHER OBJ MODLE MADE IN MICROSOFT 3D SCAN
          // model
          var bustLoader = new THREE.OBJLoader( manager );

          bustLoader.load( 'danoBustObj4.obj', function ( object ) {
          //loader.load( 'male02/male02.obj', function ( object ) {
              object.traverse( function ( child ) {
                  if ( child instanceof THREE.Mesh ) {
                      child.material.map = texture;
                      grabbableMeshes.push( child );
                  }
              } );
              object.position.y = -200;
              object.position.z = 300;
              object.position.x = -100;
              object.rotation.x = -Math.PI/2;
              object.rotation.z= Math.PI/1;
              object.scale.y = 1;
              object.scale.z = 1;
              scene.add( object );
          }, onProgress, onError );
}

function addVideo(){
    // VIDEO_TEXTURE
    	foregroundVideo = document.createElement('video');
    	foregroundVideo.setAttribute("webkit-playsinline", "");
    	foregroundVideo.autoplay = true;
    	foregroundVideo.loop = true;
    	foregroundVideo.preload = "auto";
    	foregroundVideo.src = "sintel.mp4";//.mp4";

    	var videoImage = document.createElement('canvas');
    	videoImage.width = 480;
    	videoImage.height = 204;
    	//
    	videoImageContext = videoImage.getContext('2d');
    	videoImageContext.fillStyle = '#880000ff';
    	videoImageContext.fillRect(0,0, videoImage.width, videoImage.height);

    	// videoTexture = new THREE.Texture( foregroundVideo );
    	videoTexture = new THREE.Texture( videoImage );
    	videoTexture.minFilter = THREE.LinearFilter;
    	videoTexture.magFilter = THREE.LinearFilter;
    	videoTexture.format = THREE.RGBFormat;
    	videoTexture.generateMipmaps = false;

    	videoTexture.wrapS = videoTexture.wrapT = THREE.ClampToEdgeWrapping;
    	videoTexture.needsUpdate = true;

    	var geo =	 new THREE.PlaneGeometry(16,9);// new THREE.PlaneGeometry( 240, 100, 4, 4 ); //
    	var mat = new THREE.MeshBasicMaterial( {map: videoTexture, side: THREE.DoubleSide} );
    	var mesh = new THREE.Mesh(  geo, mat );
    	mesh.rotation.y = -Math.PI/4;
      	mesh.position.z = -5;
        	mesh.position.x = -200;
          	mesh.position.y = 0;

    	mesh.scale.set(5,5,5);
    	scene.add(mesh);
      grabbableMeshes.push( mesh );
    	///DON"T FORGET TO PUT STUFF IN ANIMATE
}
function keyPressed(){
// moving things the old way of moving things around
  if(selectedObject){
    var thisMesh = selectedObject;
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
    //  kinectron.stopAll();
      kinectron.startTrackedBodies(gotBody);
      mode = "moving"
      console.log("change to moving");
    }else{
      //kinectron.stopAll();
      kinectron.startKey(gotKey);
      mode = "keying"
      console.log("change to keying");
    }
  }

}

//called by kinectron when you are in skeleton mode
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
      selectedObject = grabbableMeshes[closestObjectIndex];
      //find the position of the handProxy and pretend it is your hand.
      var handPosition = new THREE.Vector3();
      handPosition.setFromMatrixPosition( handProxy.matrixWorld );
      var handPosInWorld = handPosition; //camera3D.localToWorld( handPosition  );
      //console.log(handPosInWorld);
      selectedObject.position.set(handPosInWorld.x, handPosInWorld.y, handPosInWorld.z);
      //this only works so so, might consider using the rotation of another joint
      //selectedObject.getMesh().rotation.set(rightHand.orientationX, rightHand.orientationY, rightHand.orientationZ);
    }
  }
}



//checks against the list of grabbableMeshes for what you have clicked on to make it the "selectedObject"
function onDocumentMouseDownCheckObject( e ) {
  console.log("clicked object", selectedObject);
  var raycaster = new THREE.Raycaster(); // create once
  var mouse = new THREE.Vector2(); // create once
  mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera3D );
  var intersects = raycaster.intersectObjects( grabbableMeshes, true );
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
  for (var i = 0; i < grabbableMeshes.length; i++){
    var handPosition = new THREE.Vector3();
    handPosition.setFromMatrixPosition( handProxy.matrixWorld );
    var objectPosition = new THREE.Vector3();
    objectPosition.setFromMatrixPosition( grabbableMeshes[i].matrixWorld );
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
//  grabbableMeshes.push(vidObject);

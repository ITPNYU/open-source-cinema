var selectedElement;

var objects = [];
var name_field;
var scene_field;
var sceneNum = 1;
var allOthers = [];


//go to  http://docs.mlab.com/ sign up and get get your own api Key and make your own db and collection
var apiKey = "COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN";
var db = "osc";
var coll = "osc_search";

var camera3D;  //be careful because p5.js might have something named camera
var scene ;  //be careful because our sketch has something named scene
var renderer ;
var handProxy;

var visOtherInP5 ;


function setup(){
  visOtherInP5 = createCanvas(window.innerWidth/2,window.innerHeight)
  visOtherInP5.position(window.innerWidth/2,0);

  htmlInterface();
  getScene();
  setUp3D();
  activatePanoControl(camera3D);
  getEveryBodiesScenes();
}

function keyPressed(){
  //make the input field reappear
  $("#add_text").css('top',window.innerHeight);
  $("#add_text").css('left',window.innerWidth/4  - $("#add_text").width()/2);
}

function htmlInterface(){
  //moved most of these out into html file instead of creating them in p5js
  name_field = $("#name");
  name_field.val("Dan");
  scene_field = $("#sceneNum");
  $("#previous").click(previous);
  $("#next").click(next);
  scene_field.val(sceneNum);
  $("#add_text").css('top',window.innerHeight/2);
  $("#add_text").css('left',window.innerWidth/4  - $("#add_text").width()/2);
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
      $("#add_text").css('top',-window.innerHeight/2);
      $("#add_text").css('left',-window.innerWidth/4  - $("#add_text").width()/2);
      $("#add_text").val("");

    }
  });
  $("#name").on('keyup', function (e) {
    if (e.keyCode == 13) {
      clearObjects();
      console.log("New Person");
      getScene();
      activatePanoControl(camera3D);
    }
  });
}

function clearObjects(){
  for(var i= objects.length-1; i > -1; i--){
    obj = objects[i];
    scene.remove(obj);
  }
  objects = [];
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

function setUp3D(){
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera( 75, (window.innerWidth/2)/window.innerHeight, .1, 1000 );
  renderer = new THREE.WebGLRenderer();

  renderer.setSize( window.innerWidth/2, window.innerHeight );
  document.getElementById( 'container' ).appendChild( renderer.domElement );
  camera3D.position.z = 5;
  //create a sphere to put the panoramic video on
  var geometry = new THREE.SphereGeometry( 500, 60, 40 );
  geometry.scale( - 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load('ruin.jpg')
  } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  //ugly little greeen cube that follows camera like your handPosition
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 ,opacity : 0} );
  handProxy = new THREE.Mesh( geometry, material );
  scene.add(camera3D);//add the camera to the scene
  camera3D.add( handProxy ); // then add the handProxy to the camera so it follow it
  handProxy.position.set(0,0,-10);
  handProxy.visible = false;  //less ugly
}

function draw(){  //there is a more official way to do this in three js
  renderer.render(scene, camera3D);
}


function previous(){
  saveCamera();
  sceneNum = max(1,sceneNum -1);
  scene_field.val(sceneNum);
  getScene()
}

function next(){
  saveCamera();
  sceneNum++;
  scene_field.val(sceneNum);
  getScene()
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

function saveCamera(){
  var myName =  name_field.val() ;
  var thisElementArray = {}; //make an array for sending
  thisElementArray.owner = myName;
  thisElementArray.type = "camera"
  thisElementArray.scene = sceneNum ;
  thisElementArray.camera = camera3D.matrix.toArray();
  thisElementArray.cameraFOV = camera3D.fov; //camera3D.fov;
  var data = JSON.stringify(thisElementArray ) ;
  var myName = name_field.val() ;
  var query =  "q=" + JSON.stringify({owner:myName, type:"camera", scene:sceneNum}) + "&";
  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?" +  query + "u=true&apiKey=" + apiKey,
  data: data,
  type: "PUT",
  contentType: "application/json",
  success: function(data){console.log("saved camera" );},
  failure: function(data){  console.log("didn't savecamera" );}
});
}

function getScene(){
  //get all the info for this user and this scene
  var myName = name_field.val() ;
  var query = JSON.stringify({owner:myName, scene:sceneNum});

  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?q=" + query +"&apiKey=" + apiKey,
  type: "GET",
  success: function (data){  //create the select ui element based on what came back from db
    $.each(data, function(index,obj){
      if(obj.type == "camera"){
        camera3D.matrix.fromArray(obj.camera); // set the camera using saved camera settings
        camera3D.matrix.decompose(camera3D.position,camera3D.quaternion,camera3D.scale);
        camera3D.fov = obj.cameraFOV;
        camera3D.updateProjectionMatrix();
      }else if(obj.type == "text"){
        var newText = createNewText(obj.msg, obj.x,obj.y,obj.z,obj.rx,obj.ry,obj.rz);
        //  console.log(obj._id.$oid);
        newText.userData = obj._id.$oid; //handy for matching up with objec in database for deleteing
        scene.add(newText);
        objects.push(newText);
      }
    })
  },
  contentType: "application/json" } );
}

function getEveryBodiesScenes(){
  var myName = name_field.val() ;
  var query = JSON.stringify({'owner': {$ne : myName}}); //not equal my name
  var myURL = "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?l=2000&q=" + query + "&apiKey=" + apiKey;
  $.ajax( { url: myURL,
    type: "GET",
    success: function (data){  //create the select ui element based on what came back from db
      allOthers = [];
      //NOW COME UP WITH A RANKING BASED ON HOW FAR AWAY TEXT IS
      for (var i = 0; i < data.length; i ++ ){
        var thisItem = data[i];
        var otherPerson = thisItem.owner
        if(otherPerson  != myName){  // don't look at yourself
        if(!allOthers[otherPerson]){  //if this is the first time
          allOthers[otherPerson] = {ranking:0, elements:[]};
        }
        var smallestDistance = 100000;  //some huge number
        for(var j = 0 ; j < objects.length; j++){
          var otherPersonsText = new THREE.Vector3(data[i].x,data[i].y,data[i].z);
          var oneOfMyText = new THREE.Vector3(objects[j].position.x,objects[j].position.y,objects[j].position.z);
          var distance = otherPersonsText.distanceTo(oneOfMyText);
          if(distance < smallestDistance){
            smallestDistance = distance;//set a new record
          }
        }
        allOthers[otherPerson].ranking += smallestDistance
        allOthers[otherPerson].elements.push(data[i]);
      }
    }
    //So far rank shows the smallest distances but you have make it an average so people with a few items are not favored
    for(var name in allOthers){
      allOthers[name].rank = allOthers[name].rank/allOthers[name].elements.length;
    }
    //NOW VISUALIZE OTHERS
    var pos = 1;
    for(var name in allOthers){
      fill(random(255),random(255),random(255));
      textSize(allOthers[name].ranking*2);
      text(name, 100 ,pos*100);
      allOthers[name].centerX = 100;
      allOthers[name].centerY = pos*100;
      var elements = allOthers[name].elements;
      for(var i = 0; i < elements.length; i++){

      }
      pos += 1;
      console.log(name);
    }
    console.log(allOthers);
  },
  contentType: "application/json" } );
}

function mousePressed(){
  if (mouseX > 0){
    //whose name did they click on
    var closest= 10000.0;
    var closestName = "Nobody";
    for(var name in allOthers){
        var thisDist =   dist(allOthers[name].centerX, allOthers[name].centerY, mouseX, mouseY);
        if (thisDist < closest){
          closestName = name;
          closest = thisDist ;
        }
    }
    console.log("winner " + closestName);
    pickedNewPerson(closestName);
  }
}


function pickedNewPerson(newName) {

  clearObjects();
  name_field.val(newName);
  sceneNum = 1;
  getScene();
}

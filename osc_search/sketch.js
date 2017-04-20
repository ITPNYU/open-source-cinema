var selectedElement;
var numberOfElements = 0;
var dragging = false;
var allElements = [];
var name_field;
var scene_field;
var sceneNum = 1;
var people;
var texture;
var textTexture;
var handProxy;
//go to  http://docs.mlab.com/ sign up and get get your own api Key and make your own db and collection
var apiKey = "COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN";
var db = "osc";
var coll = "osc_setting";
var camera3D;  //be careful because p5.js might have something named camera
var scene ;  //be careful because our sketch has something named scene
var renderer ;
var cube3D;


function setup(){
  htmlInterface();
  listOfUsers();
  getScene();
  setUp3D();
  activatePanoControl();
}


function keyPressed(){
  console.log("pressed");
  //$("#add_text").style.display("inline");
}

function htmlInterface(){
  //moved most of these out into html file instead of creating them in p5js
  name_field = $("#name");
  name_field.val("Dan");
  scene_field = $("#sceneNum");
  $("#previous").click(previous);
  $("#next").click(next);
  scene_field.val(sceneNum);
  console.log($("#add_text").width());
  $("#add_text").css('top',window.innerHeight/2);
  $("#add_text").css('left',window.innerWidth/2  - $("#add_text").width()/2);
  $("#add_text").on('keyup', function (e) {
    if (e.keyCode == 13) {
      var handPosition = new THREE.Vector3();
      handPosition.setFromMatrixPosition( handProxy.matrixWorld );
      var handPosInWorld = handProxy.localToWorld( handPosition  );
      //console.log(handPosInWorld);

      var mesh = createNewText(($("#add_text").val()),handPosInWorld.x,handPosInWorld.y,handPosInWorld.z);
      scene.add(mesh);
    }
  });
}

function createNewText(text, x, y, z) {
  var canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "32pt Arial";
  context.textAlign = "center";
  //context.fillStyle = "white";
  //context.fillRect(0, 0, 600, 600);
  context.fillStyle = "white";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  textTexture = new THREE.Texture(canvas);
  textTexture.needsUpdate = true;
  var material = new THREE.MeshBasicMaterial({ map: textTexture , transparent: true });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  // mesh.overdraw = true;
  // mesh.doubleSided = true;
  mesh.position.x = x;
  mesh.position.y = y;
  mesh.position.z = -10;
  mesh.scale.set(5,5,5);
  return mesh;
}

function setUp3D(){
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor( 0xffffff, 0);

  renderer.setSize( window.innerWidth, window.innerHeight );
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
  //  scene.background = new THREE.Color( 0xffffff );

  //UGLY LITTLE PROXY FOR YOUR handPosition
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 ,opacity : 0} );
    handProxy = new THREE.Mesh( geometry, material );
    //scene.add(handProxy);
    scene.add(camera3D);//add the camera to the scene
    camera3D.add( handProxy ); // then add the handProxy to the camera so it follow it
    handProxy.position.set(0,0,-10);
      handProxy.visible = false;
}

function draw(){  //there is a more official way to do this in three js
  if(textTexture) textTexture.needsUpdate = true;
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

function keyPressed(){
  //opportunity for you to change the background?
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

  var query =  "q=" + JSON.stringify({type:"camera", scene:sceneNum}) + "&";
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
      }else{
        //we will worry about elements next week
        //newElement(obj._id,obj.src,obj.x,obj.y,obj.width,obj.height);
      }
    })
  },
  contentType: "application/json" } );
}




function listOfUsers(){
  $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db + "/runCommand?apiKey=" + apiKey,
  data: JSON.stringify( {"distinct": coll,"key": "owner"} ),
  type: "POST",
  contentType: "application/json",
  success: function(msg) {
    var allPeople =  msg.values;
    for(var i = 0; i < allPeople.length; i++){
      $("#other_people").append('<option>'+allPeople[i]+'</option>');
    }
    $("#other_people").change(pickedNewPerson);
  } } )
}


function pickedNewPerson() {
  var newName= $("#other_people").val();
  name_field.val(newName);
  sceneNum = 1;
  getScene();
}

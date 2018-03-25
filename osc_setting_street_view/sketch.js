  var selectedElement;
  var numberOfElements = 0;
  var dragging = false;
  var allElements = [];
  var name_field;
  var scene_field;
  var sceneNum = 1;
  var people;
  var texture;
  //go to  http://docs.mlab.com/ sign up and get get your own api Key and make your own db and collection
  var apiKey = "COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN";
  var db = "osc";
  var coll = "osc_setting_street_view";
  var camera3D;  //be careful because p5.js might have something named camera
  var scene ;  //be careful because our sketch has something named scene
  var renderer ;
  var cube3D;

   var panorama;
  function setup(){
    htmlInterface();
    listOfUsers();
   setUp3D();
    getScene();

   activatePanoControl();
   setUpStreetView();
  }

  function htmlInterface(){
    //moved most of these out into html file instead of creating them in p5js
    name_field = $("#name");
    name_field.val("Dan");
    scene_field = $("#sceneNum");
    $("#previous").click(previous);
    $("#next").click(next);
    scene_field.val(sceneNum);
  }

  function setUpStreetView(){
    var fenway = {lat: 42.345573, lng: -71.098326};

    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
          position: fenway,
          pov: {
            heading: 34,
            pitch: 10
          }
        });


  }

  function setUp3D(){
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
    renderer = new THREE.WebGLRenderer( { alpha: true });
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
  //  scene.add( mesh );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.x = 0;
    cube.position.y = 0;
    cube.position.z = -5;


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

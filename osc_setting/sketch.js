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
  var coll = "osc_setting";
  var camera3D;  //be careful because p5.js might have something named camera
  var scene ;  //be careful because our sketch has something named scene
  var renderer ;
  var cube3D;

  function setup(){

    htmlInterface();

    //listOfUsers();
    getScene();
    setUp3D();
   activatePanoControl();
  }

  function htmlInterface(){

    name_field = $("#name");
    name_field.val("Dan");
    scene_field = $("#sceneNum");
    $("#previous").click(previous);
    $("#next").click(next);
    scene_field.val(sceneNum);
  }

  function setUp3D(){
    scene = new THREE.Scene();
    camera3D = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, .1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.getElementById( 'container' ).appendChild( renderer.domElement );
  //  document.body.appendChild( renderer.domElement );
    camera3D.position.z = 5;

    //var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    //cube3D = new THREE.Mesh( geometry, material );
    //scene.add( cube3D);
    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
    geometry.scale( - 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
      map: new THREE.TextureLoader().load('ruin.jpg')// 'http://itp.nyu.edu/~dbo3/osc17/osc_setting/office.jpg' )
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
  }

  function draw(){
    //cube3D.rotation.x += 0.1;
  //  cube3D.rotation.y += 0.1;
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
    //console.log(keyCode);
    if(keyCode == 8){ //delete key
      killIt(selectedElement);
      selectedElement.remove();
    } else if (keyCode == 187) {
      //"=" key
      var s = selectedElement.size();
      selectedElement.size(s.width+10, s.height +10);
      saveIt(selectedElement);
    } else if (keyCode == 189) {
      //"-" key
      var s = selectedElement.size();
      selectedElement.size(s.width-10, s.height -10);
      saveIt(selectedElement);
    }
  }

  function killIt(whichElement){
    var id = whichElement.id();
    $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/" +  id + "?apiKey=" + apiKey,
    type: "DELETE",
    contentType: "application/json",
    success: function(data){console.log("saved" + data);},
    failure: function(data){console.log("didn't save" + data);}
  });
  }

  function saveIt(thisDomElement){
    //serialize info
    var myName =  name_field.val() ;
    var thisElementArray = {}; //make an array for sending
    var dom_id = thisDomElement.id();
    thisElementArray.owner = myName;
    thisElementArray._id = dom_id ;
    thisElementArray.scene = sceneNum ;
    thisElementArray.x = thisDomElement.position().x;
    thisElementArray.y = thisDomElement.position().y;
    thisElementArray.width = thisDomElement.size().width;
    thisElementArray.height = thisDomElement.size().height;
    thisElementArray.src = thisDomElement.attribute("src");
    var data = JSON.stringify(thisElementArray ) ;
    var query =  "q=" + JSON.stringify({_id:dom_id}) + "&";
    $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?" +  query + "u=true&apiKey=" + apiKey,
    data: data,
    type: "PUT",
    contentType: "application/json",
    success: function(data){console.log("saved" );},
    failure: function(data){  console.log("didn't save" );}
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

        var query =  "q=" + JSON.stringify({type:"camera", scene:sceneNum}) + "&";
        console.log("Save Camera" + query);
        $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?" +  query + "u=true&apiKey=" + apiKey,
        data: data,
        type: "PUT",
        contentType: "application/json",
        success: function(data){console.log("saved camera" );},
        failure: function(data){  console.log("didn't savecamera" );}
      });
      }



  function getScene(){
    //kill all the existing elements
    for(var i = 0; i < allElements.length; i++){
      allElements[i].remove();
    }
    //get all the info for this user and this scene
    var myName = name_field.val() ;
    var query = JSON.stringify({owner:myName, scene:sceneNum});
    console.log("get Scene" + query);
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
          newElement(obj._id,obj.src,obj.x,obj.y,obj.width,obj.height);
      }
      })
    },
    contentType: "application/json" } );
  }

  function drop(ev) {
    var data = ev.originalEvent.dataTransfer.getData('text/html');
    //use a regular expression to pull the url out of the the html for the thing they dropped
    var regexToken = /(((http|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
    var url = regexToken.exec(data)[0]; //returns array of all matches but you want the first
    //Creat a new object using our own object function'
    var elementID = "OSC_IMG_"+ numberOfElements;
    newElement(elementID,url,mouseX,mouseY,-1,-1);
  }

  function newElement(elementID,url,x,y,w,h){
    numberOfElements++;
    var dom_element = createImg(url);
    dom_element.onload = function()  {
      console.log("update texture");
  //   texture.needsUpdate = true;
  };
    //deserialize info
    selectedElement = dom_element;
    dom_element.id(elementID);
    dom_element.position(-x,y);
    dom_element.size(w, h);


     //plane.position.x = cube3D.position.x;
     //plane.position.y = cube3D.position.y;
      //  plane.position.z = cube3D.position.z;

      if (w == -1){  //just dropped
        w = dom_element.size().width/2;  //pictures tend to be too big
        h = dom_element.size().height/2;


      var element = $("#"+elementID);

      console.log(element);

  texture = new THREE.Texture( element);
  texture.needsUpdate = true;
       var geometry = new THREE.PlaneGeometry(200, 200);
       var material = new THREE.MeshBasicMaterial( { map : texture } );
       var plane = new THREE.Mesh(geometry,material);
      console.log(plane);
      scene.add(plane);
      console.log(scene);
      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  //  var material = new THREE.MeshBasicMaterial( { map: texture } );
     var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      cube3D = new THREE.Mesh( geometry, material );
      scene.add( cube3D);

          }



      // console.log(texture);
    //var element = document.createElement( 'img' );
    //element.src = 'textures/sprites/ball.png';
    // create the object3d for this element
    //var cssObject = new THREE.CSS3DObject( element );
    // we reference the same position and rotation
    //cssObject.position = planeMesh.position;
    //cssObject.rotation = planeMesh.rotation;
    // add it to the css scene
    //cssScene.add(cssObject);


    dom_element.mousePressed(function(){
      dragging = true;
      selectedElement = this;
    });
    dom_element.mouseMoved( function(){
      if(this == selectedElement && dragging == true){
        this.position(mouseX-this.width/2,mouseY-this.height/2);
      }
    });
    dom_element.mouseReleased(function(){
      dragging = false;
      saveIt(selectedElement);
    });
    //disable all the default drag events for this element.
    $('#'+elementID).on("dragenter dragstart dragend dragleave dragover drag drop", function (e) {e.preventDefault();});
    saveIt(dom_element);
    allElements.push(dom_element);
  }

  function listOfUsers(){
    $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db + "/runCommand?apiKey=" + apiKey,
    data: JSON.stringify( {"distinct": "osc_collection","key": "owner"} ),
    type: "POST",
    contentType: "application/json",
    success: function(msg) {
      var allPeople =  msg.values;
      for(var i = 0; i < allPeople.length; i++){
        people.option(allPeople[i]);

      }
    } } )
  }

  function pickedNewPerson() {
    var newName= people.value();
    name_field.val(newName);
    sceneNum = 1;
    getScene();
  }

var selectedElement;
var numberOfElements = 0;
var dragging = false;
var allElements = [];
var name_field;
var scene_field;
var plot_point_field;
var sceneNum = 1;
var plotPoint = 1;
var people;

//http://www.storymastery.com/story/screenplay-structure-five-key-turning-points-successful-scripts/
var plotPoints =  ['Setup', 'The Opportunity', 'New Situation', 'Change of Plans', 'Progress', 'Point of No Return', 'Compication and Higher Stakes', 'Them Major Setback', 'The Final Push', 'The Climax', 'The Aftermath'];


//go to  http://docs.mlab.com/ sign up and get get your own api Key and make your own db and collection
var apiKey = "COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN";
var db = "osc";
var coll = "osc_elements";



function nextPlotPoint(){
  plotPoint =  plotPoint + 1;
  plot_point_field.val(plotPoints[plotPoint]);
}

function previousPlotPoint(){
  plotPoint = max(1,plotPoint -1);
  plot_point_field.val(plotPoints[plotPoint]);
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


function saveKeying(thisObj){
      thisMesh = thisObj.getMesh();
      var myName =  name_field.val() ;
      var thisElementArray = {}; //make an array for sending
      thisElementArray.owner = myName;
      thisElementArray.type = "keying";
      thisElementArray.scene = sceneNum ;
      thisElementArray.x = thisMesh.position.x;
      thisElementArray.y = thisMesh.position.y;
      thisElementArray.z = thisMesh.position.z;
      thisElementArray.rx = thisMesh.rotation.x;
      thisElementArray.ry = thisMesh.rotation.y;
      thisElementArray.rz = thisMesh.rotation.z;
      thisElementArray.plotPoint = plotPoints[plotPoint];
      var data = JSON.stringify(thisElementArray ) ;

      var query =  "q=" + JSON.stringify({type:"camera", scene:sceneNum, type:"keying"}) + "&";
      $.ajax( { url: "https://api.mlab.com/api/1/databases/"+ db +"/collections/"+coll+"/?" +  query + "u=true&apiKey=" + apiKey,
      data: data,
      type: "PUT",
      contentType: "application/json",
      success: function(data){console.log("saved Keying" );},
      failure: function(data){  console.log("didn't keying" );}
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
      thisElementArray.plotPoint = plotPoints[plotPoint];
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
      } else if(obj.type == "keying"){
        if(selectedObject){
            selectedObject.position.x = obj.x;
            selectedObject.position.y = obj.y;
            selectedObject.position.z = obj.z;
            selectedObject.rotation.x = obj.rx;
            selectedObject.rotation.y = obj.ry;
            selectedObject.rotation.z = obj.rz;
        }
    }else{

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

var selectedElement;
var numberOfElements = 0;
var dragging = false;
var allElements = [];
var name_field;
var scene = 1;

function setup(){
  name_field = createInput("dan");
  var previous_button = createButton("PREVIOUS");
  previous_button.mousePressed(previous);
  scene_field = createInput(scene);
  scene_field.attribute("width",3);
  var next_button = createButton("NEXT");
  next_button.mousePressed(next);

  var  c = createCanvas(window.innerWidth, window.innerHeight);
  c.id("myCanvas");
  $("#myCanvas").on("drop", drop);
  //preempt and take over what browser would ordinarily do about draggging
  $('#myCanvas').on("dragenter dragstart dragend dragleave dragover drag drop", function (e) {e.preventDefault();});
  getOtherUsers();
}

function previous(){
  scene = max(1,scene -1);
  scene_field.value(scene);
  getOtherUsers()
}

function next(){
  scene++;
  scene_field.value(scene);
  getOtherUsers()
}

function keyPressed(){
  //console.log(keyCode);
  if(keyCode == 8){ //delete key
    killIt(selectedElement);
    selectedElement.remove();
  } else if (keyCode == 187) { //"=" key
    var s = selectedElement.size();
    selectedElement.size(s.width+10, s.height +10);
    saveIt(selectedElement);
  } else if (keyCode == 189) { //"-" key
    var s = selectedElement.size();
    selectedElement.size(s.width-10, s.height -10);
    saveIt(selectedElement);
  }
}
function killIt(whichElement){
  var id = whichElement.id();
  $.ajax( { url: "https://api.mlab.com/api/1/databases/osc/collections/osc_collection/" +  id + "?apiKey=COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN",
  type: "DELETE",
  contentType: "application/json",
  success: function(data){console.log("saved" + data);},
  failure: function(data){console.log("didn't save" + data);}
});

}
function saveIt(thisDomElement){
  var myName =  name_field.value() ;
  var thisElementArray = {}; //make an array for sending
  var dom_id = thisDomElement.id();
  thisElementArray.owner = myName;
  thisElementArray._id = dom_id ;
  thisElementArray.scene = scene ;
  thisElementArray.x = thisDomElement.position().x;
  thisElementArray.y = thisDomElement.position().y;
  thisElementArray.width = thisDomElement.size().width;
  thisElementArray.height = thisDomElement.size().height;
  thisElementArray.src = thisDomElement.attribute("src");
  var data = JSON.stringify(thisElementArray ) ;
  var query =  "q=" + JSON.stringify({_id:dom_id}) + "&";
  $.ajax( { url: "https://api.mlab.com/api/1/databases/osc/collections/osc_collection?" +  query + "u=true&apiKey=COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN",
  data: data,
  type: "PUT",
  contentType: "application/json",
  success: function(data){console.log("saved" );},
  failure: function(data){  console.log("didn't save" );}
});
}

function getOtherUsers(){
  //kill all the existing users
  for(var i = 0; i < allElements.length; i++){
    allElements[i].remove();
  }
  var myName = name_field.value() ;
  var query = JSON.stringify({owner:myName, scene:scene});

  $.ajax( { url: "https://api.mlab.com/api/1/databases/osc/collections/osc_collection?q=" + query +"&apiKey=COrdiz9qAt5OlZOLRyoKaaaG-60PkkxN",
  type: "GET",
  success: function (data){  //create the select ui element based on what came back from db
    $.each(data, function(index,obj){
      newElement(obj._id,obj.src,obj.x,obj.y,obj.width,obj.height);
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
  if (w == -1){  //just dropped
    w = dom_element.size().width/2;  //pictures tend to be too big
    h = dom_element.size().height/2;
  }
  selectedElement = dom_element;
  dom_element.id(elementID);
  dom_element.position(x,y);
  dom_element.size(w, h);
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

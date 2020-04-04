const runwayText2PictureSketch = function(p) {
  
  var runway_img;
  let runway_canvas;
p.setup = function () {
    runway_canvas = p .createCanvas(512, 512);
  //  runway_img = createImage(width,height);
    loadP5Sketch(runway_canvas.elt,0,0,0); 
    runway_canvas.style('display', 'none');// hide this because I want to use in three.js
    console.log("setup runway"); 
  };

p.draw = function () {
   if(runway_img){
    p.clear();
    p.image(runway_img, 0, 0);
   }
  };

talkToRunway = function(query) {
    const path = 'http://localhost:8000/query';
    console.log("askit");
    const data = {
      "caption": query
    };
    p.httpPost(path, 'json', data, gotRunwayImage, gotRunwayError);
  }

gotRunwayError = function(error) {
    console.error(  error);
  }

gotRunwayImage = function(data) {
    console.log(data.result);
    runway_img= p.createImg(data.result,"image generated in runway");
    runway_img.hide();
  }

};

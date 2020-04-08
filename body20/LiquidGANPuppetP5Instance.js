//made into an instance from this orgininal p5 sketch https://editor.p5js.org/dano/sketches/PgDbe6-v9
const   LiquidGANPuppetP5Instance = function(p) {

let source;
let target;
let img;
let liquidCanvas;

p.preload = function(){
  target = loadImage("nick.jpg");
};

p.setup = function() {
  liquidCanvas = p.createCanvas(512, 512);

  source = p.createCapture(VIDEO,320);
  source.hide();
  loadP5Sketch( liquidCanvas.elt,0,0,-500); 
  liquidCanvas.style('display', 'none');// hide this because I want to use in three.js
};

p.setPuppetSkin = function(newFile){
    target = loadImage(newFile + ".jpg");
};

p.talkToRunway = function() {
             
  const path = 'http://localhost:8000/query';
  
  source.loadPixels();
  var source64 = source.canvas.toDataURL("image/jpeg", 1.0);

  target.loadPixels();
  var target64 = target.canvas.toDataURL("image/jpeg", 1.0);

  
  const data = {
   "source": source64,
   "target": target64
  };
  //console.log(path, data);
  p.httpPost(path, 'json', data, gotImage, gotError);
};

gotError = function(error) {
  console.error(  error);
}

gotImage = function(result) {
 console.log("got image");
  img= createImg(result.image, "puppet");
  img.hide();
  p.talkToRunway() ;
}


p.draw = function() {
  p.clear();
  if (img) {
    p.image(img, 0, 0);
  }
}


};
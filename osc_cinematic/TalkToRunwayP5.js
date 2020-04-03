var runway_img;
let runway_canvas;
function setup() {
  runway_canvas = createCanvas(512, 512);
//  runway_img = createImage(width,height);
  loadP5Sketch(runway_canvas.elt,0,0,200); 
  runway_canvas.style('display', 'none');// hide this because I want to use in three.js
  console.log("setup runway"); 
}

function talkToRunway(query) {
  const path = 'http://localhost:8000/query';
  console.log("askit");
  const data = {
    "caption": query
  };
  httpPost(path, 'json', data, gotImage, gotError);
}

function gotError(error) {
  console.error(  error);
}

function gotImage(data) {
  console.log("Got Image Data" + data.length);
  let runway_img= createImg(data.result,"image generated in runway");
  runway_img.hide();
  clear();
  image(runway_img, 0, 0);
}

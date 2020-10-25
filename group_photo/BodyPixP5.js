let bodypix;
let video;
let segmentation;
let capturing = false;
let existingImage ;

const options = {
  outputStride: 32, // 8, 16, or 32, default is 16
  segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5 
}

let body_pix_p5_canvas;
let preferredCam;

function preload() {
  preferredCam = localStorage.getItem('preferredCam');
  // console.log(preferredCam);
}

function setImage(url){
 // existingImage = createImg(url,"", 'anonymous' ,loadedExisting);
 // existingIMage.hide();
 existingImage = loadImage(url,loadedExisting,failedToLoadExisting);
}



function loadedExisting(){
  console.log("loaded self"  + existingImage);
  clear();
  image(existingImage, 0, 0);
  gotBodyPixImage();
}

function failedToLoadExisting(){
  console.log("failed self"  + existingImage);
  capturing = true;
}



function setup() {
  console.log ("got to setup");
  body_pix_p5_canvas = createCanvas(512 , 256);
  imageMode(CORNER);
  // load up your video

  if (preferredCam) {
    videoOptions = {
      video: {
        optional: [{
          sourceId: preferredCam
        }]
      }
    };
    video = createCapture(videoOptions);
  } else {
    video = createCapture(VIDEO);
  }
  video.size(320, 240);
  video.hide(); // Hide the video element, and just show the canvas
  bodypix = ml5.bodyPix(video, modelReady);
  loadP5Sketch(body_pix_p5_canvas.elt, 0, 0, -200);
  body_pix_p5_canvas.style('display', 'none');// hide this because I want to use in three.js
  console.log("setup body  pix");
}

function setVideoInput(input) {
  localStorage.setItem('preferredCam', this.value);
  videoOptions = {
    video: {
      optional: [{
        sourceId: this.value
      }]
    }
  };
  video = createCapture(videoOptions);
  video.size(320, 240);
  video.hide(); // Hide the video element, and just show the canvas
}

function modelReady() {
  console.log('body pix model ready!')
  if(capturing)
  bodypix.segment(video, options, gotResults);
}

function getVideoImage() {
  return (body_pix_p5_canvas.canvas.toDataURL("image/png", 1.0));
}
 
function pauseVideo() {
  capturing = false;
}

function isCapturing(){
  return capturing;
}

function restartVideo() {
  bodypix.segment(video, options, gotResults);
  capturing = true;
}

function gotResults(err, result) {
  // console.log(result);
  if (err) {
    console.log("Oh My" + err)
    return
  }
  segmentation = result;
  clear();
  image(segmentation.backgroundMask, 0, 0);
  gotBodyPixImage();
  if (capturing) {
    bodypix.segment(video, options, gotResults);
  }
}
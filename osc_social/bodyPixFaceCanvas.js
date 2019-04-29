/* This sketch shows replace the background for an instant green-screening effect using BodyPix. */

/* See the blog post about BodyPix here: https://medium.com/tensorflow/introducing-bodypix-real-time-person-segmentation-in-the-browser-with-tensorflow-js-f1948126c2a0 */

/* Created by Dan Oved https://twitter.com/oveddan */

// the downloaded bodyPix machine learning model
let model;
// the video capture
let capture;
//let segmentationEstimated = false;
// the most recent resulting mask image generated from estimating person segmentation on the video,
// drawn onto a canvas.
let canvas = document.createElement("canvas");
canvas.width = 640;  //2048;
canvas.height = 480; //1024;

let video;
let videoPlaying;

let videoWidth;
let videoHeight;


// setup function run when document loads
async function setupBodyPix() {

  // capture from the webcam
  capture = await loadWebcamCapture('user');
  capture.play();

  loadModelAndStartEstimating();
  bodyPixIsReady(powerOf2Canvas );
}

/* the arguments to the function which draws the mask onto the canvas.  See the documentation for full descriptions:
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#drawmask
*/

// the size of the model. should be 0.25, 0.50, 0.75, or 1.00.  Higher number means higher accuracy but lower speed.
const mobileNetMultiplier = 0.75;

async function loadModelAndStartEstimating() {
  console.log('downloading the machine learning model...');
  model = await bodyPix.load(mobileNetMultiplier);
  console.log('done downloading');
  // start the estimation loop, separately from the drawing loop.  
  estimateFrame();
}

async function estimateFrame() {
  if (capture) {
    await performPartsEstimation();
    //await performEstimation();
  }
  // at the end of estimating, start again after the current frame is complete.
  requestAnimationFrame(estimateFrame);
}


/* the arguments to the functions which estimate the person segmentation and convert the results
to a mask to draw onto the canvas.  See the documentation for both methods:
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#person-segmentation
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#tomaskimagedata
*/
// set the output stride to 16 or 32 for faster performance but lower accuracy.
const outputStride = 32;
// affects the crop size around the person.  Higher number is tighter crop and visa
// versa for a lower number
const segmentationThreshold = 0.5;

async function performPartsEstimation() {
  
  const partSegmentation = await model.estimatePartSegmentation(
    capture, outputStride, segmentationThreshold);
    processSegmentation(partSegmentation);
 // segmentationEstimated = true;
}

function processSegmentation(segmentation){
  //console.log(segmentation);
  let segmentsData = segmentation.data;
  let width = segmentation.width;
  let height = segmentation.height;


  let top = height;
  let bottom = 0;
  let right = 0;
  let left = width;

  //for finding center of gravity
  let totX = 0;
  let numX = 0;

  let ctx = canvas.getContext('2d');
  ctx.drawImage(capture, 0, 0);
  //let bigImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let bigImage = ctx.getImageData(0, 0, width, height);
  for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
          let placeInArray = row * width + col;
          let placeInBigArray = 4 * (row * width + col);
          const partId = Math.round(segmentsData[placeInArray]);
          if (partId === 1 || partId === 0) {
              //set records
              if (row < top) top = row;
              if (row > bottom) bottom = row;
              if (col < left) left = col;
              if (col > right) right = col;
              //for finding average x, ie center of gravity
              bigImage.data[placeInBigArray + 3] = 255;
          } else {
              //this changes the alpha, this is important for corners of small sub image
              bigImage.data[placeInBigArray + 3] = 0;
          }
      }
  }
  ctx.putImageData(bigImage, 0, 0); //put the 
  let subWidth = right - left;
  let subHeight = bottom - top;
  if (subWidth*subHeight < 100) return;
  let imageData = ctx.getImageData(left, top, subWidth, subHeight);
  //This is the image data
  let output = {"image_data":imageData, "rect": {"left":left, "top":top, "width":subWidth, "height":subHeight}};

  gotNewBodyPixResult(output);
}


/**
 * Loads a the camera to be used
 *
 */
async function loadWebcamCapture() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const videoElement = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia(
    { 'audio': false, 'video': true });
  videoElement.srcObject = stream;

  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}



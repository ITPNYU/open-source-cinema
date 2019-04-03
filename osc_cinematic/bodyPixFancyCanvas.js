/* This sketch shows replace the background for an instant green-screening effect using BodyPix. */

/* See the blog post about BodyPix here: https://medium.com/tensorflow/introducing-bodypix-real-time-person-segmentation-in-the-browser-with-tensorflow-js-f1948126c2a0 */

/* Created by Dan Oved https://twitter.com/oveddan */

let statusText = '';
// the downloaded bodyPix machine learning model
let model;
// the video capture
let capture;
let segmentationEstimated = false;
// the most recent resulting mask image generated from estimating person segmentation on the video,
// drawn onto a canvas.
let maskCanvas;
// the output canvas
let canvas;
let video;
let videoPlaying;

let videoWidth;
let videoHeight;

//let background;

// setup function run when document loads
async function setupp() {

  // capture from the webcam
  capture = await loadWebcamCapture('user');
  capture.play();


  //backgroundVideo = document.getElementById('background-video');
  //background= document.getElementById('transparent');
  canvas = document.getElementById('canvas');
  //canvas.width = 512;
  // canvas.height = 512;
  canvas.width = 2048;
  canvas.height = 1024;
  //canvas.width = capture.width;
  //canvas.height = capture.height;

  maskCanvas = document.createElement('canvas');
  //maskCanvas.width = 512;
  //maskCanvas.height = 512;

  loadModelAndStartEstimating();

  startDrawLoop();

}

setupp();

/* the arguments to the function which draws the mask onto the canvas.  See the documentation for full descriptions:
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#drawmask
*/
// if the output should be flip horizontally.  This should be set to true for user facing cameras.
const flipHorizontal = true;
// how much to blur the mask background by.  This affects the softness of the edge.
const maskBlurAmount = 3;

function startDrawLoop() {
  drawIt();
  sendTextureToThree(canvas);
  //document.getElementById('background-video').play();
}

function drawIt() {
  const ctx = canvas.getContext('2d');

  // make sure video is loaded, and a mask has been estimated from the video.  The mask
  // continuously gets updated in the loop estimateFrame below, which is independent
  // from the draw loop
  if (capture && segmentationEstimated) {


    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (flipHorizontal) {
      // flip the drawing of the results horizontally 
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    // blur the mask and draw it onto the canvas
    // ctx.filter = `blur(${maskBlurAmount}px)`;

    ctx.drawImage(maskCanvas, 0, 0);
    // ctx.filter = 'blur(0px)';

    // draw the background video on the canvas using the compositing operation 'source-in.' 
    // "The new shape is drawn only where both the new shape and the destination canvas overlap. Everything else is made transparent."
    // see all possible compositing operations at https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
    ctx.globalCompositeOperation = 'source-in';
    //ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // draw camera feed frame onto the canvas using the compositing operation 'destination-over.'
    // "New shapes are drawn behind the existing canvas content."
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(capture, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;

    // enumerate all pixels
    // each pixel's r,g,b,a datum are stored in separate sequential array elements

    for (var i = 0; i < data.length; i += 4) {
      if (data[i] == 0) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    ctx.restore();

  }

  requestAnimationFrame(drawIt);
}

// the size of the model. should be 0.25, 0.50, 0.75, or 1.00.  Higher number means higher accuracy but lower speed.
const mobileNetMultiplier = 0.75;

async function loadModelAndStartEstimating() {
  setStatusText('downloading the machine learning model...');
  model = await bodyPix.load(mobileNetMultiplier);

  setStatusText('');

  // start the estimation loop, separately from the drawing loop.  
  // This allows drawing to happen at a high number of frames per
  // second, independent from the speed of estimation.
  startEstimationLoop();
}

function startEstimationLoop() {
  estimateFrame();
}

async function estimateFrame() {
  if (capture) {
    await performEstimation();
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
const outputStride = 16;
// affects the crop size around the person.  Higher number is tighter crop and visa
// versa for a lower number
const segmentationThreshold = 0.5;
// if the background or the person should be masked.  If set to false, masks the person.
const maskBackground = true;

async function performEstimation() {
  const personSegmentation = await model.estimatePersonSegmentation(
    capture, outputStride, segmentationThreshold);

  const maskImage = bodyPix.toMaskImageData(personSegmentation, maskBackground);

  // draw the mask image to an offscreen canvas.
  maskCanvas.width = maskImage.width;
  maskCanvas.height = maskImage.height;

  //maskCanvas.getContext('2d').clearRect(0,0,maskImage.width,maskImage.height);
  maskCanvas.getContext('2d').putImageData(maskImage, 0, 0);

  segmentationEstimated = true;
}

const statusElement = document.getElementById('status');

function setStatusText(text) {
  if (text) {
    statusElement.style.display = 'block';
    statusElement.innerText = text;
  } else
    statusElement.style.display = 'none';
}

/*
function toMaskImageDataCustom(segmentation, maskBackground) {
const {width, height, data} = segmentation;
const bytes = new Uint8ClampedArray(width * height * 4);

for (let i = 0; i < height * width; ++i) {
  const shouldMask = maskBackground ? 1 - data[i] : data[i];
  // alpha will determine how dark the mask should be.
  const alpha = shouldMask * 255;

  const j = i * 4;
  bytes[j + 0] = 0;
  bytes[j + 1] = 0;
  bytes[j + 2] = 0;
  bytes[j + 3] = Math.round(alpha);
}
*/
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

async function loadImage(imagePath) {
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.crossOrigin = '';
    image.onload = () => {
      resolve(image);
    };
  });

  image.src = imagePath;
  return promise;
}

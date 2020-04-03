let BodyPixSketch = function(p) {
  ////THIS WON'T WORK WITHOUT THE DEV VERSION OF ML 5 LIBRARY THAT YOU HAVE TO DOWN LOAD
//https://github.com/ml5js/ml5-examples/issues/159

  let bodypix;
  let video;
  let segmentation;
  let img;

  const options = {
    outputStride: 8, // 8, 16, or 32, default is 16
    segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5 
  }

  let body_pix_p5_canvas;


  p.setup =function() {
    body_pix_p5_canvas = p.createCanvas(256, 256);
    // load up your video
    video = p.createCapture(p.VIDEO);
    video.size(160, 120);
    video.hide(); // Hide the video element, and just show the canvas
    bodypix = ml5.bodyPix(video, modelReady);
    loadP5Sketch(body_pix_p5_canvas.elt,0,-100,-100); 
    body_pix_p5_canvas.style('display', 'none');// hide this because I want to use in three.js
    console.log("setup body  pix"); 
  };

function modelReady () {
    console.log('body pix model ready!')
    bodypix.segmentWithParts(gotResults, options)
  };

function gotResults (err, result) {
    // console.log(result);
    if (err) {
      console.log("Oh My" + err)
      return
    }
    segmentation = result;
    p.clear();
    p.image(segmentation.personMask, 0, 0);

    bodypix.segmentWithParts(gotResults, options);
  };
};

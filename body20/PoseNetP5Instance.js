// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */
const poseNetSketch = function(p) {

let video;
let poseNet;
let poses = [];
let thisCanvas ;

p.setup = function() {
  poseNetCanvas = p.createCanvas(640, 480);

///ONLY DO THIS PART IF YOU WANT TO USE A SEPARATE USB CAMERA
  //navigator.mediaDevices.enumerateDevices().then(function(d){console.log(d);});
  //un comment above look in the console for the video input device you are after
  /*
   var options = {
     video: {
       optional: [{
          sourceId: '5289ce1802c3a8580144fdb57108c6c5866e9095eed6024105418a989e4e074e'
      }]
     }
  };*/
 //video = p.createCapture( options);

  //OTHERWISE LOAD UP DEFAULT CAMERA
  video = p.createCapture(p.VIDEO);
  video.size(p.width, p.height);

  //load up posenet
  let  params = {
    architecture: 'MobileNetV1',
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    maxPoseDetections: 5,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'single',
    inputResolution: 513,
    multiplier: 0.75,
    quantBytes: 2,
  };
  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video,params, modelReady);
  // Hide the video element, and just show the canvas
  video.hide();
  poseNetCanvas.style('display', 'none');// hide this because I want to use in three.js
};

p.getPoses = function(){
    return poses;
};


function modelReady() {
  poseNet.on('pose', gotPose);
  console.log("model ready");
  // This sets up an event that fills the global variable "poses"

}

function gotPose(results) {
  poses = results;
}


};

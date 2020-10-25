const BodyPixSketch = function (sketch)  {

    let bodypix;
    let video;
    let segmentation;
    let capturing = false;
    let existingImage;
  
    const options = {
        outputStride: 32, // 8, 16, or 32, default is 16
        segmentationThreshold: 0.3, // 0 - 1, defaults to 0.5 
    }

    let body_pix_p5_canvas;
    let preferredCam;

    sketch.preload = function(){
        preferredCam = localStorage.getItem('preferredCam');
        // console.log(preferredCam);
    }


    sketch.setImage = function(url) {
        // existingImage = createImg(url,"", 'anonymous' ,loadedExisting);
        // existingIMage.hide();
        existingImage = sketch.loadImage(url, loadedExisting, failedToLoadExisting);
    }



    sketch.loadedExisting = function() {
        console.log("loaded self" + existingImage);
        sketch.clear();
        sketch.image(existingImage, 0, 0);
        gotBodyPixImage();
    }

    sketch.failedToLoadExisting = function() {
        console.log("failed self" + existingImage);
        capturing = true;
    }



    sketch.setup = function () {

        body_pix_p5_canvas = sketch.createCanvas(512, 256);
        sketch.imageMode(sketch.CORNER);
        // load up your video

        if (preferredCam) {
            videoOptions = {
                video: {
                    optional: [{
                        sourceId: preferredCam
                    }]
                }
            };
            video = sketch.createCapture(videoOptions);
        } else {
            video = sketch.createCapture(sketch.VIDEO);
        }
        video.size(320, 240);
        video.hide(); // Hide the video element, and just show the canvas
        bodypix = ml5.bodyPix(video, sketch.modelReady);
        // loadP5Sketch(body_pix_p5_canvas.elt, 0, 0, -200);
        body_pix_p5_canvas.style('display', 'none');// hide this because I want to use in three.js
        console.log("setup body  pix");
    }

   sketch.getP5Canvas = function() {
        return body_pix_p5_canvas;
    }
    sketch.setVideoInput = function(input) {
        localStorage.setItem('preferredCam', this.value);
        videoOptions = {
            video: {
                optional: [{
                    sourceId: this.value
                }]
            }
        };
        video = sketch.createCapture(videoOptions);
        video.size(320, 240);
        video.hide(); // Hide the video element, and just show the canvas
    }

    sketch.modelReady = function() {
        console.log('body pix model ready!')
        if (capturing)
            bodypix.segment(video, options, gotResults);
    }

    sketch.getVideoImage = function() {
        return (body_pix_p5_canvas.canvas.toDataURL("image/png", 1.0));
    }

    sketch.pauseVideo = function() {
        capturing = false;
    }

    sketch.isCapturing = function() {
        return capturing;
    }

    sketch.restartVideo = function() {
        bodypix.segment(video, options, gotResults);
        capturing = true;
    }

    sketch.gotResults = function(err, result) {
        // console.log(result);
        if (err) {
            console.log("Oh My" + err)
            return
        }
        segmentation = result;
        sketch.clear();
        sketch.image(segmentation.backgroundMask, 0, 0);
        gotBodyPixImage();
        if (capturing) {
            bodypix.segment(video, options, gotResults);
        }
    }

};



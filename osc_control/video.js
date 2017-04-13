var   videoImageContext;
var videoTexture;

function addVideo(filename){

  foregroundVideo = document.createElement('video');
foregroundVideo.setAttribute("webkit-playsinline", "");
//  foregroundVideo.setAttribute("x-webkit-airplay","allow" );
foregroundVideo.autoplay = true;
foregroundVideo.loop = true;
foregroundVideo.preload = "auto";
foregroundVideo.src = filename;//"https://www.youtube.com/watch?v=D1ZYhVpdXbQ";//.mp4";


var videoImage = document.createElement('canvas');
videoImage.width = 480;
videoImage.height = 204;
//
videoImageContext = videoImage.getContext('2d');
//videoImageContext.fillStyle = '#88000ff';
videoImageContext.fillStyle = "rgba(255, 255, 255, 0.5)";
videoImageContext.fillRect(0,0, videoImage.width, videoImage.height);

// videoTexture = new THREE.Texture( foregroundVideo );
videoTexture = new THREE.Texture( videoImage );
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;
videoTexture.generateMipmaps = false;


videoTexture.wrapS = videoTexture.wrapT = THREE.ClampToEdgeWrapping;
videoTexture.needsUpdate = true;

var ge =	 new THREE.PlaneGeometry(16,9);// new THREE.PlaneGeometry( 240, 500, 4, 4 ); //
var ma = new THREE.MeshBasicMaterial( {map: videoTexture,side: THREE.DoubleSide} );
var mes = new THREE.Mesh(  ge, ma );
mes.rotation.y = Math.PI/2;
mes.position.x = 100;
mes.position.z = -100;
mes.scale.set(-8,8,8);
return mes;
}

function animateVideo(){
  videoImageContext.fillStyle = "rgba(255, 255, 255, 0.5)";
  videoImageContext.drawImage(foregroundVideo, 0, 0);
  videoTexture.needsUpdate = true;
}

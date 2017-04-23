var 	onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX =0 ,onPointerDownPointerY =0;
var lon = 0, onMouseDownLon = 0,lat = 0, onMouseDownLat = 0, phi = 0, theta = 0;
var   isUserInteracting = false;
var myCamera;

function activatePanoControl(cam){
  myCamera = cam;
  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );
  window.addEventListener( 'resize', onWindowResize, false );

  myCamera.target = new THREE.Vector3( 0, 0, 0 );
  //myCamera.target = new THREE.Vector3( 0, 0, 0 );

}
function onDocumentMouseDown( event ) {
  //  if (event.mouseY > 500){
  //  event.preventDefault();
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
  isUserInteracting  = true;
  //}
}
function onDocumentMouseMove( event ) {
  if(isUserInteracting ){
    lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
    lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
    computeCameraOrientation();
  }
}
function onDocumentMouseUp( event ) {
  saveCamera();
  isUserInteracting = false;
}
function onDocumentMouseWheel( event ) {
  myCamera.fov = Math.max(Math.min(100,myCamera.fov + event.deltaY * 0.05),1);
  myCamera.updateProjectionMatrix();

}

function computeCameraOrientation() {

  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );
  myCamera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
  myCamera.target.y = 500 * Math.cos( phi );
  myCamera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
  myCamera.lookAt( myCamera.target );

}



function onWindowResize() {
  myCamera.aspect = (window.innerWidth/2) / window.innerHeight;
  myCamera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth/2, window.innerHeight );
}

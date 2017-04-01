var 	onMouseDownMouseX = 0, onMouseDownMouseY = 0;
var onPointerDownPointerX =0 ,onPointerDownPointerY =0;
var lon = 0, onMouseDownLon = 0,lat = 0, onMouseDownLat = 0, phi = 0, theta = 0;
var   isUserInteracting = false;

function activatePanoControl(){

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'mouseup', onDocumentMouseUp, false );
  document.addEventListener( 'wheel', onDocumentMouseWheel, false );

  camera3D.target = new THREE.Vector3( 0, 0, 0 );
  //camera3D.target = new THREE.Vector3( 0, 0, 0 );

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
  camera3D.fov += event.deltaY * 0.05;
  camera3D.updateProjectionMatrix();
}

function computeCameraOrientation() {

  lat = Math.max( - 85, Math.min( 85, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  theta = THREE.Math.degToRad( lon );
  camera3D.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
  camera3D.target.y = 500 * Math.cos( phi );
  camera3D.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
  camera3D.lookAt( camera3D.target );

}

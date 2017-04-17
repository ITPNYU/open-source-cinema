
function kinectronKey(x,y,z){// Use two canvases to draw incoming feeds

  // Setup canvas and context
  //  this.canvas = document.createElement('canvas');
  //  this.canvas = $('<canvas/>',{'class':'kinectScratchPad'}).width(512).height(512);
  this.canvas = document.getElementById('canvas1');

 this.canvas.width = 512;
  this.canvas.height = 512;
//  this.canvas.display = "none";
  //this.canvas.visible = false;

  this.ctx = this.canvas.getContext('2d');

  this.geo = new THREE.PlaneGeometry(100,100);
  this.green_screen_texture = new THREE.Texture(this.canvas);  //make this global because you have to update it

  this.mat = new THREE.MeshBasicMaterial({ map: this.green_screen_texture , transparent: true, opacity: 1, side: THREE.DoubleSide });
  //this.mat = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
  this.plane = new THREE.Mesh(this.geo, this.mat);
  this.plane.position.x = x;
  this.plane.position.y = y;
  this.plane.position.z = x;
  this.plane.scale.set(4,4,1);

  this.animate = function(){
    // Update the textures for each animate frame
    this.green_screen_texture.needsUpdate = true;
  };

  this.getMesh = function(){
    return this.plane;

  };

  this.gotKey = function(data){
    //this is called when kinectron has a keyed image to display
    // Image data needs to be draw to img element before canvas
    //might have to add this style in some chrome browsers
    /*var newImg = new Image();
    newImg.src = data; // image data from kinectron

    newImg.onload = function () { //needs onload function
      this.ctx.clearRect(0, 0, hiddenContext.canvas.width, hiddenContext.canvas.height);
      this.ctx.drawImage(newImg, 0, 0);
    }*/
     this.ctx.clearRect(0,0, 512, 512);
    this.ctx.drawImage(data, 0,0, 512, 512);
  };


};

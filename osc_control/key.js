function kinectronKey(x,y,z){// Use two canvases to draw incoming feeds

  // Setup canvas and context
  //  this.canvas = document.createElement('canvas');
  //  this.canvas = $('<canvas/>',{'class':'kinectScratchPad'}).width(512).height(512);
  this.canvas = document.getElementById('canvas1');

  this.canvas.width = 512;
  this.canvas.height = 512;
//  this.canvas.display = "none";
  //this.canvas.visible = false;

  this.canvas = document.getElementById('canvas1');
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




};

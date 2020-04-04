// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Simple Particle System
// Edited Video: https://www.youtube.com/watch?v=UcdigVaIYAk

const particleSystemSketch = function(p) {

  particles = [];
  let partical_system_p5_canvas;
  p.setup = function (){
  partical_system_p5_canvas = p.createCanvas(512, 512);
  //    loadP5Sketch(partical_system_p5_canvas.elt,0,0,200);   calling this from threejs
  partical_system_p5_canvas.style('display', 'none');// hide this because I want to use in three.js
  console.log("setup particle system");
};
  
  p.getP5Canvas = function(){
    return partical_system_p5_canvas.elt;
  }
  
  p.draw = function(){
    p.clear();
  
    for (let i = 0; i < 5; i++) {
      let p = new Particle();
      particles.push(p);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();
      if (particles[i].finished()) {
        // remove this particle
        particles.splice(i, 1);
      }
    }
  };
  
  class Particle {
  
    constructor() {
      this.x = 300;
      this.y = 380;
      this.vx = p.random(-1, 1);
      this.vy = p.random(-5, -1);
      this.alpha = 255;
    }
  
    finished() {
      return this.alpha < 0;
    }
  
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 5;
    }
  
    show() {
      p.noStroke();
      //stroke(255);
      p.fill(255, 0, 255, this.alpha);
      p.ellipse(this.x, this.y, 16);
    }
  
  }
  };
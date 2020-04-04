// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Simple Particle System
// Edited Video: https://www.youtube.com/watch?v=UcdigVaIYAk


particles = [];
let partical_system_p5_canvas;
function setup() {
  partical_system_p5_canvas = createCanvas(512, 512);
  loadP5Sketch(partical_system_p5_canvas.elt,0,0,200);  
  partical_system_p5_canvas.style('display', 'none');// hide this because I want to use in three.js
  console.log("setup particle system");
}

function draw() {
  clear();

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
}

class Particle {

  constructor() {
    this.x = 300;
    this.y = 380;
    this.vx = random(-1, 1);
    this.vy = random(-5, -1);
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
    noStroke();
    //stroke(255);
    fill(255, 0, 255, this.alpha);
    ellipse(this.x, this.y, 16);
  }

}
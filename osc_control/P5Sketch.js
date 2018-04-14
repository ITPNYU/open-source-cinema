/*
 * P5js Example:
 * @name Multiple Objects
 * @description Create a Jitter class, instantiate multiple objects,
 * and move it around the screen.
 */
var bug1;  // Declare objects
var bug2;
var bug3;
var bug4;

var p5cs;

function setup() {
  console.log("Loaded P5 Script------------------------------------------");
  p5cs = createCanvas(1024, 1024);
  p5cs.position(0,300);

  // Create object
  bug1 = new Jitter();
  bug2 = new Jitter();
  bug3 = new Jitter();
  bug4 = new Jitter();

   loadP5Sketch(p5cs); // add this to three.js sketch
}

function animateP5() {
  // P5 ANIMATION
        clear();
        background( 'rgba(50, 89, 100, 0)' );
        bug1.move();
        bug1.display();
        bug2.move();
        bug2.display();
        bug3.move();
        bug3.display();
        bug4.move();
        bug4.display();
}

// Jitter class
function Jitter() {
  this.x = width/2 + random(-20,20);
  this.y = height/2 + random(-20,20);
  this.diameter = random(30, 50);
  this.speed = 5;

  this.move = function() {
    this.x += random(-this.speed, this.speed);
    this.y += random(-this.speed, this.speed);
  };

  this.display = function() {
    fill( color("yellow") );
    noStroke();
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };
}

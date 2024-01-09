// module aliases
const { Engine, Body, Bodies, Composite, Vector } = Matter;

const engine = Engine.create({ gravity: { x: 0, y: 0.01 } });

// Logo specifics
const colors = [
  '#44c2cc',
  '#1f3c7e',
  '#038645',
  '#3c3e3f',
  '#9ec53a',
  '#1b365d',
];
const sqrt3 = Math.sqrt(3);

// Recording
let capture;
let canvas;

let bodies = [];

let img;
window.preload = () => {
  img = loadImage('image.png');
};

// Rendering
window.setup = () => {
  let canvasSize = 600;
  createCanvas(canvasSize, canvasSize);
  canvas = document.querySelector('canvas');

  let n = 20;
  let squareSize = Math.floor(Math.min(img.width, img.height) / 100);
  let scaleFactor = width / Math.max(img.width, img.height);

  for (let i = 0; i < img.width; i += squareSize) {
    for (let j = 0; j < img.height; j += squareSize) {
      if (img.get(i, j)[3] != 0) {
        let body = Bodies.rectangle(
          (i - img.width / 2) * scaleFactor,
          (j - img.height / 2) * scaleFactor,
          squareSize * scaleFactor,
          squareSize * scaleFactor,
          {
            frictionAir: 0,
            friction: 0,
            restitution: 0.95,
            render: { fillStyle: img.get(i, j) },
          }
        );
        bodies.push(body);
      }
    }
  }

  const wallWidth = 600;
  const wallOps = {
    isStatic: true,
    friction: 0,
    restitution: 0.95,
  };
  const walls = [
    Bodies.rectangle(0, height / 2 + wallWidth / 2, width, wallWidth, wallOps),
    Bodies.rectangle(0, -height / 2 - wallWidth / 2, width, wallWidth, wallOps),
    Bodies.rectangle(width / 2 + wallWidth / 2, 0, wallWidth, height, wallOps),
    Bodies.rectangle(-width / 2 - wallWidth / 2, 0, wallWidth, height, wallOps),
  ];

  Composite.add(engine.world, [...bodies, ...walls]);

  frameRate(120);
  pixelDensity(2);
};

let myFrameRate = 60;
let endFrame = myFrameRate * 120;
let startTime;
let recording = false;

let lastUpdated = null;

window.draw = () => {
  if (frameCount === 1) {
    if (recording) {
      capturer = CCapture({
        framerate: myFrameRate,
        format: 'webm',
        autoSaveTime: 10,
      });
      capturer.start();
    }
    startTime = new Date();
  }
  /* if (frameCount === endFrame) {
    if (recording) {
      capturer.stop();
      capturer.save();
    }
    console.log('animation stopped');
    noLoop();
    return;
  } */

  // Compute, update according to timestep
  if (frameCount > 1) {
    if (recording) {
      Engine.update(engine, Date.now() - lastUpdated);
    } else {
      Engine.update(engine);
    }
  }
  lastUpdated = Date.now();

  // Draw
  if (recording || frameCount % 30 === 1) {
    // clear();
    background(240);
    translate(width / 2, height / 2);
    strokeWeight(0.7);

    bodies.forEach((body, i) => {
      fill(body.render.fillStyle);
      stroke(body.render.fillStyle);
      beginShape();
      for (let v of body.vertices) {
        vertex(v.x, v.y);
      }
      endShape(CLOSE);
    });
  }

  let secElapsed = (new Date() - startTime) / 1000;
  let secETA = ((endFrame - frameCount) * secElapsed) / frameCount;
  document.querySelector(
    '#frame-counter'
  ).innerText = `Frame ${frameCount} | Elapsed: ${secElapsed.toFixed(2)} s | ${(
    secElapsed / frameCount
  ).toFixed(2)} s/it | ETA: ${Math.floor(secETA / 60)
    .toString()
    .padStart(2, '0')}:${(secETA % 60).toFixed(2).padStart(5, '0')}`;

  if (recording) capturer.capture(canvas);
};

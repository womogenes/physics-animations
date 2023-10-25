// module aliases
const { Engine, Body, Bodies, Composite, Vector } = Matter;

const engine = Engine.create({ gravity: { x: 0, y: 0.1 } });

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

let scaleFactor = 50;
let n = 256; // Subdivisions

// Rendering
window.setup = () => {
  let canvasSize = 600;
  createCanvas(canvasSize, canvasSize);
  canvas = document.querySelector('canvas');

  // Create bodies
  let e1 = Vector.mult(Vector.create(1 / n, sqrt3 / n), scaleFactor);
  let e2 = Vector.mult(Vector.create(-1 / n, sqrt3 / n), scaleFactor);

  let vertices = [
    [-1, 0],
    [0, sqrt3],
    [1, 0],
  ].map(([x, y]) => ({ x: (x * scaleFactor) / n, y: (y * scaleFactor) / n }));

  for (let i = 0; i < 6; i++) {
    for (let x = 0; x < n; x++) {
      for (let y = 0; y < n; y++) {
        // Two equilateral triangles
        let pos = Vector.rotate(
          Vector.add(
            Vector.add(Vector.mult(e1, x), Vector.mult(e2, y)),
            Vector.create(0, (sqrt3 * scaleFactor) / n)
          ),
          (2 * Math.PI * i) / 6 + Math.PI
        );
        let rad = (scaleFactor / n) * 1;
        let body = Bodies.circle(pos.x, pos.y, rad, {
          frictionAir: 0,
          friction: 0,
          restitution: 0.95,
          mass: (i + 6) * 1e-4,
          render: { fillStyle: colors[i], radius: rad },
        });
        // Body.setAngle(body, 2 * Math.PI * (i / 6) + Math.PI * 1);
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

let myFrameRate = 120;
let endFrame = myFrameRate * 120;
let startTime;
let recording = true;

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
      Engine.update(engine, 1000 / myFrameRate);
    }
  }
  lastUpdated = Date.now();

  // Draw
  if (recording || true || frameCount % 10 === 1) {
    background(240);
    translate(width / 2, height / 2);
    strokeWeight(0.7);

    bodies.forEach((body, i) => {
      fill(body.render.fillStyle);
      stroke(body.render.fillStyle);
      ellipse(body.position.x, body.position.y, body.render.radius * 2);
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

// module aliases
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;
Body = Matter.Body;

const engine = Engine.create({ gravity: { x: 0, y: 0 } });

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

const rotate = (x, y, angle) => {
  // https://en.wikipedia.org/wiki/Rotation_matrix
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return [cos * x - sin * y, sin * x + cos * y];
};

let scaleFactor = 50;
let vertices = [
  [0, 0],
  [1, sqrt3],
  [0, 2 * sqrt3],
  [-1, sqrt3],
].map(([x, y]) => ({ x: x * scaleFactor, y: y * scaleFactor }));
let bodies = [];

// Recording
let capture;

// Rendering
window.setup = () => {
  let canvasSize = 600;
  createCanvas(canvasSize, canvasSize);

  // Create bodies
  for (let i = 0; i < 6; i++) {
    let body = Bodies.fromVertices(
      ...rotate(0, scaleFactor * sqrt3, 2 * Math.PI * (i / 6) + Math.PI),
      vertices,
      {
        frictionAir: 0,
        friction: 0,
        restitution: 1,
      }
    );
    Body.setAngle(body, 2 * Math.PI * (i / 6) + Math.PI);
    bodies.push(body);
  }

  const wallWidth = 600;
  const wallOps = {
    isStatic: true,
    restitution: 1,
  };
  const walls = [
    Bodies.rectangle(0, height / 2 + wallWidth / 2, width, wallWidth, wallOps),
    Bodies.rectangle(0, -height / 2 - wallWidth / 2, width, wallWidth, wallOps),
    Bodies.rectangle(width / 2 + wallWidth / 2, 0, wallWidth, height, wallOps),
    Bodies.rectangle(-width / 2 - wallWidth / 2, 0, wallWidth, height, wallOps),
  ];

  Composite.add(engine.world, [...bodies, ...walls]);

  frameRate(60);

  /* saveGif('animation.gif', 8 * 60 + 10, {
    units: 'frames',
  }); */
};

window.draw = () => {
  // Compute
  Engine.update(engine);

  if (frameCount === 1) {
    capture = new CCapture({
      format: 'webm',
      framerate: '60',
      quality: 'high',
    });
    capture.start();
  }

  let startDelay = 10;
  if (frameCount === startDelay) {
    // Add a bit of force
    let scaleFactor = 0.01;
    bodies.forEach((body, i) => {
      let vel = rotate(0, 1, (2 * Math.PI * i) / 6 + Math.PI);
      Body.setVelocity(body, {
        x: vel[0] * scaleFactor,
        y: vel[1] * scaleFactor,
      });
    });
    console.log('started animation');
  }
  if (frameCount > startDelay && frameCount < startDelay + 60 * 1) {
    // Accelerate
    for (let body of bodies) {
      Body.setSpeed(body, body.speed * 1.1);
    }
    console.log('speeding up');
  }
  if (frameCount === startDelay + 60 * 1) {
    for (let body of bodies) {
      Body.setAngularSpeed(body, (Math.random() - 0.5) * 0.01);
    }
  }
  if (frameCount > startDelay + 60 * 1 && frameCount < startDelay + 60 * 1.5) {
    for (let body of bodies) {
      Body.setAngularSpeed(body, body.angularSpeed * 1.08);
    }
  }

  if (frameCount > startDelay + 60 * 5) {
    // Add a bit of force
    for (let body of bodies) {
      Body.setSpeed(body, body.speed / 1.05);
      Body.setAngularSpeed(body, body.angularSpeed / 1.05);
    }
    console.log('slowing down');
  }

  if (frameCount === startDelay + 60 * 7) {
    console.log('stopped');
    capture.stop();
    capture.save();
    noLoop();
    return;
  }

  // Draw
  background(240);
  translate(width / 2, height / 2);

  bodies.forEach((body, i) => {
    fill(colors[i]);
    noStroke();
    beginShape();
    for (let v of body.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  });

  capture.capture(document.querySelector('canvas'));
};

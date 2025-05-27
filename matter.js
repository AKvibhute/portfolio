const { Engine, Render, World, Bodies, Runner, Events, Body, Vector } = Matter;

// create engine
const engine = Engine.create();
const world = engine.world;

// get canvas and set up renderer
const canvas = document.getElementById('world');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: '#111'
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// screen boundaries
const width = window.innerWidth;
const height = window.innerHeight;

const boundaries = [
  Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true }),  // ground
  Bodies.rectangle(width / 2, -25, width, 50, { isStatic: true }),         // ceiling
  Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true }),       // left wall
  Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true }) // right wall
];
World.add(world, boundaries);

// function to create new circles
function createCircles() {
  const newCircles = [];
  for (let i = 0; i < 80; i++) {
    const circle = Bodies.circle(
      Math.random() * width,
      Math.random() * height,
      5 + Math.random() * 5,
      {
        restitution: 0.9,
        friction: 0,
        label: 'Circle Body',
        render: {
          fillStyle: '#ffffff'
        }
      }
    );
    newCircles.push(circle);
    World.add(world, circle);
  }
  return newCircles;
}

// initialize first set
let circles = createCircles();

let waitingToBlast = true;

Events.on(engine, 'afterUpdate', () => {
  if (waitingToBlast) {
    // wait for all circles to settle near bottom
    const allSettled = circles.every(circle => {
      const speed = Math.sqrt(circle.velocity.x ** 2 + circle.velocity.y ** 2);
      return speed < 0.05 && circle.position.y > height - 50;
    });

    if (allSettled) {
      waitingToBlast = false;

      // blast force + schedule removal
      circles.forEach(circle => {
        const forceMagnitude = 0.05 * circle.mass;
        const forceDirection = Vector.normalise({
          x: circle.position.x - width / 2,
          y: circle.position.y - height
        });

        Body.applyForce(circle, circle.position, {
          x: forceDirection.x * forceMagnitude,
          y: forceDirection.y * forceMagnitude - 0.1
        });
      });

      // remove all after short delay (so blast is visible)
      setTimeout(() => {
        circles.forEach(circle => World.remove(world, circle));
        circles = createCircles(); // create new set
        waitingToBlast = true;     // repeat
      }, 400); // wait 400ms to show blast
    }
  }
});

// resize reload
window.addEventListener('resize', () => {
  location.reload();
});

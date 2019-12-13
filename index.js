const progressBar = document.querySelector("progress");
let fish;
let seaBackground;
let jellyfish;
let song;
let shell;

class Sprite {
  constructor(x, y, color, diameter, speed) {
    Object.assign(this, { x, y, color, diameter, speed });
  }
  get radius() {
    return this.diameter / 2;
  }
  move(target) {
    this.x += (target.x - this.x) * this.speed;
    this.y += (target.y - this.y) * this.speed;
  }
}

class Player extends Sprite {
  constructor() {
    super(0, 0, "white", 40, 0.2);
    this.health = 100;
  }
  render() {
    circle(this.x, this.y, this.diameter);
    image(fish, this.x, this.y);
  }

  takeHit() {
    player.health -= 1;
    progressBar.value = this.health;
  }
  addHealth() {
    this.health += 2;
    if (this.health > 100) {
      this.health = 100;
    }
    progressBar.value = this.health;
  }
}

class Enemy extends Sprite {
  constructor(x, y, speed) {
    super(x, y, 50);
    this.diameter = Math.random() * 40 + 7;
    this.speed = speed;
    this.color = `rgba(248, 240, 246, 0.5)`;
  }
  render() {
    fill(this.color);
    circle(this.x, this.y, this.diameter);
  }
}

class Scarecrow extends Sprite {
  constructor(x, y) {
    super(x, y);
  }
  render() {
    image(jellyfish, this.x, this.y);
  }
}

class PowerUp {
  constructor() {
    this.diameter = 20;
    this.shouldShow = false;
  }
  on() {
    this.shouldShow = true;
    [this.x, this.y] = randomPointOnCanvas();
  }
  off() {
    this.shouldShow = false;
    console.log("OFF");
  }
  display() {
    if (this.shouldShow) {
      fill("white");
      text("🐚", this.x, this.y);
      fill(`rgba(248, 240, 246, 0)`);
    }
  }
}

function collided(sprite1, sprite2) {
  const distanceBetween = Math.hypot(
    sprite1.x - sprite2.x,
    sprite1.y - sprite2.y
  );
  const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
  return distanceBetween < sumOfRadii;
}

function randomPointOnCanvas() {
  return [
    Math.floor(Math.random() * width),
    Math.floor(Math.random() * height)
  ];
}

let width = 980;
let height = 600;
let player = new Player();
let scarecrow;
let enemies = [
  new Enemy(...randomPointOnCanvas(), 0.006),
  new Enemy(...randomPointOnCanvas(), 0.006),
  new Enemy(...randomPointOnCanvas(), 0.007),
  new Enemy(...randomPointOnCanvas(), 0.021),
  new Enemy(...randomPointOnCanvas(), 0.023),
  new Enemy(...randomPointOnCanvas(), 0.02),
  new Enemy(...randomPointOnCanvas(), 0.02),
  new Enemy(...randomPointOnCanvas(), 0.01),
  new Enemy(...randomPointOnCanvas(), 0.01),
  new Enemy(...randomPointOnCanvas(), 0.01)
];

function preload() {
  fish = loadImage(
    "https://raw.githubusercontent.com/rsinglet/chaser-game/master/fish.jpg.png"
  );
  seaBackground = loadImage(
    "https://raw.githubusercontent.com/rsinglet/chaser-game/master/thumbnail_8314D0AD42404F8B9A16583AEA11DBC4.jpg"
  );
  jellyfish = loadImage(
    "https://raw.githubusercontent.com/rsinglet/chaser-game/master/jellyfish.gif"
  );
  song = new Audio(
    "https://raw.githubusercontent.com/rsinglet/chaser-game/master/Bubbles%20Sound%20Effect.mp3"
  );
  /*treasureChest = loadImage(
    "https://raw.githubusercontent.com/rsinglet/chaser-game/master/treasurechest.jpeg"
  );*/
}

function increaseInEnemies() {
  enemies.push(new Enemy(...randomPointOnCanvas(), 0.006));
  enemies.push(new Enemy(...randomPointOnCanvas(), 0.005));
  enemies.push(new Enemy(...randomPointOnCanvas(), 0.004));
  enemies.push(new Enemy(...randomPointOnCanvas(), 0.007));
  enemies.push(new Enemy(...randomPointOnCanvas(), 0.01));
}

function setup() {
  createCanvas(width, height);
  imageMode(CENTER);
  noStroke();
  textSize(30);
  textAlign(CENTER, CENTER);
  shell = new PowerUp();
}

function checkForDamage(enemy, player) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function checkForHealth(shell, player) {
  if (collided(player, shell)) {
    player.addHealth();
  }
}

function adjustSprites() {
  const characters = [player, ...enemies];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      pushOff(characters[i], characters[j]);
    }
  }
}

function pushOff(c1, c2, c3) {
  let [dx, dy, dz] = [c2.x - c1.x, c2.y - c1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = c1.radius + c2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    c1.x -= adjustX;
    c1.y -= adjustY;
    c2.x += adjustX;
    c2.y += adjustY;
  }
}

function mouseClicked() {
  if (!scarecrow) {
    scarecrow = new Scarecrow(player.x, player.y);
    scarecrow.ttl = frameRate() * 5;
  }
  if (enemies.length < 500) {
    increaseInEnemies();
  }
}

function draw() {
  imageMode(CORNER);
  background(seaBackground);
  imageMode(CENTER);
  player.render();
  player.move({ x: mouseX, y: mouseY });
  enemies.forEach(enemy => {
    enemy.render();
    checkForDamage(enemy, player);
    enemy.move(scarecrow || player);
  });
  fill(`rgba(248, 240, 246, 0)`);
  if (progressBar.value <= 0) {
    fill(`rgba(248, 240, 246, 0.5)`);
    textSize(width / 7);
    text("GAME OVER", width / 2, height / 2);
    song.play();
    noLoop();
  }
  if (frameCount % 400 === 0) {
    shell.on();
  }
  if (frameCount % 400 === 100) {
    shell.off();
  }
  shell.display();
  checkForHealth(shell, player);
  enemies.forEach(enemy => enemy.move(scarecrow || player));
  if (scarecrow) {
    scarecrow.render();
    scarecrow.ttl--;
    if (scarecrow.ttl < 0) {
      scarecrow = undefined;
    }
  }
  adjustSprites();
}



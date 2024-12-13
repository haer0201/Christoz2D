const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

canvas.width = 1200; // Längre bana
canvas.height = 400;

let gameStarted = false; // Flagga för att avgöra om spelet har börjat

// Ladda bilder
const startScreenImage = new Image();
startScreenImage.src = '8bit-background.png'; // 8-bit startskärm som täcker hela bakgrunden

const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Original spelbakgrund

const playerImage = new Image();
playerImage.src = 'samisk-karaktar.png';

const enemyImage = new Image();
enemyImage.src = 'ren.png';

const jiraImage = new Image();
jiraImage.src = 'jira.png'; // Jira Ticket i slutet av banan

// Spelkaraktär
const player = {
  x: 50,
  y: 300,
  width: 50,
  height: 50,
  speed: 5,
  dy: 0,
  gravity: 0.5,
  jumpPower: -15, // Hoppkraft för att hoppa över fienderna
  isJumping: false,
  health: 2, // Karaktären har 2 liv
};

const platforms = [
  { x: 100, y: 350, width: 200, height: 20 },
  { x: 350, y: 300, width: 150, height: 20 },
  { x: 550, y: 250, width: 200, height: 20 },
  { x: 800, y: 200, width: 200, height: 20 }, // Nya hinder
  { x: 1050, y: 150, width: 150, height: 20 },
];

let enemies = [
  { x: 150, y: 330, width: 50, height: 50, speed: 2, direction: 1 },
  { x: 400, y: 280, width: 50, height: 50, speed: 3, direction: 1 },
  { x: 600, y: 230, width: 50, height: 50, speed: 1.5, direction: -1 },
  { x: 900, y: 180, width: 50, height: 50, speed: 2.5, direction: 1 },
  { x: 1100, y: 130, width: 50, height: 50, speed: 2, direction: -1 },
];

const jiraTicket = { x: 1150, y: 100, width: 50, height: 50 }; // Jira Ticket

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  z: false, // Hoppa med Z
};

let gameOver = false; // Flagga för att avgöra om spelet är slut

function showStartScreen() {
  const customBackgroundImage = new Image();
  customBackgroundImage.src = 'Christoz2D-background.png'; // Ladda den nya bakgrundsbilden

  customBackgroundImage.onload = () => {
    ctx.drawImage(customBackgroundImage, 0, 0, canvas.width, canvas.height); // Rita bakgrunden

    const buttonX = canvas.width / 2 - 100;
    const buttonY = canvas.height / 2;
    const buttonWidth = 200;
    const buttonHeight = 50;

    ctx.fillStyle = '#ff6666';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Start Game', canvas.width / 2, buttonY + 30);

    canvas.addEventListener('click', function startListener(event) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (
        mouseX >= buttonX &&
        mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY &&
        mouseY <= buttonY + buttonHeight
      ) {
        gameStarted = true;
        canvas.removeEventListener('click', startListener);
        gameLoop();
      }
    });
  };
}

function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawHealth() {
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, player.health * 50, 20); // 2 liv = 100px bredd, 1 liv = 50px
  ctx.strokeStyle = 'black';
  ctx.strokeRect(10, 10, 100, 20);
}

function drawPlatforms() {
  ctx.fillStyle = 'green';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function drawJiraTicket() {
  ctx.drawImage(jiraImage, jiraTicket.x, jiraTicket.y, jiraTicket.width, jiraTicket.height);
}

function updatePlayer() {
  if (!gameStarted || gameOver) return;

  if (keys.ArrowLeft) player.x -= player.speed;
  if (keys.ArrowRight) player.x += player.speed;

  if (keys.z && !player.isJumping) {
    player.dy = player.jumpPower;
    player.isJumping = true;
  }

  player.y += player.dy;
  player.dy += player.gravity;

  platforms.forEach(platform => {
    if (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height <= platform.y &&
      player.y + player.height + player.dy >= platform.y
    ) {
      player.dy = 0;
      player.isJumping = false;
      player.y = platform.y - player.height;
    }
  });

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.isJumping = false;
  }
}

function updateEnemies() {
  if (!gameStarted || gameOver) return;

  enemies.forEach(enemy => {
    enemy.x += enemy.speed * enemy.direction;

    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
      enemy.direction *= -1;
    }

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      triggerExplosion();
      gameOver = true;
    }
  });
}

function checkWinCondition() {
  if (
    gameStarted &&
    player.x < jiraTicket.x + jiraTicket.width &&
    player.x + player.width > jiraTicket.x &&
    player.y < jiraTicket.y + jiraTicket.height &&
    player.y + player.height > jiraTicket.y
  ) {
    startJiraShake();
    gameOver = true;
  }
}

function startJiraShake() {
  const jiraCanvas = document.createElement('canvas');
  jiraCanvas.width = window.innerWidth;
  jiraCanvas.height = window.innerHeight;
  jiraCanvas.style.position = 'fixed';
  jiraCanvas.style.top = '0';
  jiraCanvas.style.left = '0';
  jiraCanvas.style.zIndex = 999;
  document.body.appendChild(jiraCanvas);

  const jiraCtx = jiraCanvas.getContext('2d');
  let shakeOffset = 10;

  function shakeJira() {
    jiraCtx.clearRect(0, 0, jiraCanvas.width, jiraCanvas.height);
    jiraCtx.save();
    jiraCtx.translate(
      jiraCanvas.width / 2 + Math.random() * shakeOffset - shakeOffset / 2,
      jiraCanvas.height / 2 + Math.random() * shakeOffset - shakeOffset / 2
    );
    jiraCtx.drawImage(jiraImage, -150, -150, 300, 300); // Jira.png 3x storlek
    jiraCtx.restore();
    shakeOffset = Math.max(shakeOffset - 0.2, 0); // Gradvis minska skakeffekt
  }

  let shakeDuration = 0;
  function shakeLoop() {
    if (shakeDuration < 4) { // Skaka i 4 sekunder
      shakeJira();
      shakeDuration++;
      requestAnimationFrame(shakeLoop);
    } else {
      document.body.removeChild(jiraCanvas);
      showWinMessage();
    }
  }

  shakeLoop();
}

function showWinMessage() {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.backgroundColor = '#fff';
  popup.style.padding = '20px';
  popup.style.border = '5px solid #ff6666';
  popup.style.borderRadius = '10px';
  popup.style.textAlign = 'center';
  popup.style.zIndex = 1000;
  popup.innerHTML = `
    <h1 style="color: #ff4c4c;">Grattis!</h1>
    <p>Du fångade jiran!</p>
  `;
  document.body.appendChild(popup);
  setTimeout(() => {
    document.body.removeChild(popup);
    resetGame();
  }, 4000);
}

function triggerExplosion() {
  const fragments = [];
  for (let i = 0; i < 40; i++) {
    fragments.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      dx: Math.random() * 8 - 4,
      dy: Math.random() * 8 - 4,
      size: Math.random() * 20 + 10,
      color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
    });
  }

  function drawFragments() {
    fragments.forEach(fragment => {
      ctx.fillStyle = fragment.color;
      ctx.fillRect(fragment.x, fragment.y, fragment.size, fragment.size);
      fragment.x += fragment.dx;
      fragment.y += fragment.dy;
    });
  }

  let frame = 0;
  function animateExplosion() {
    if (frame < 60) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawFragments();
      frame++;
      requestAnimationFrame(animateExplosion);
    } else {
      showGameOverPopup();
    }
  }

  animateExplosion();
}

function showGameOverPopup() {
  const popup = document.createElement('div');
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.backgroundColor = '#fff';
  popup.style.padding = '20px';
  popup.style.border = '5px solid #ff6666';
  popup.style.borderRadius = '10px';
  popup.style.textAlign = 'center';
  popup.style.zIndex = 1000;
  popup.innerHTML = `
    <h1 style="color: #ff4c4c;">Game Over</h1>
    <p>Try again!</p>
  `;

  document.body.appendChild(popup);
  setTimeout(() => {
    document.body.removeChild(popup);
    resetGame();
  }, 2000);
}

function resetGame() {
  player.x = 50;
  player.y = 300;
  player.dy = 0;
  player.isJumping = false;
  player.health = 2;
  gameOver = false;

  enemies = [
    { x: 150, y: 330, width: 50, height: 50, speed: 2, direction: 1 },
    { x: 400, y: 280, width: 50, height: 50, speed: 3, direction: 1 },
    { x: 600, y: 230, width: 50, height: 50, speed: 1.5, direction: -1 },
    { x: 900, y: 180, width: 50, height: 50, speed: 2.5, direction: 1 },
    { x: 1100, y: 130, width: 50, height: 50, speed: 2, direction: -1 },
  ];

  showStartScreen();
}

document.addEventListener('keydown', event => {
  const key = event.key;
  if (keys.hasOwnProperty(key)) {
    keys[key] = true;
  }
});

document.addEventListener('keyup', event => {
  const key = event.key;
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
  }
});

function gameLoop() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPlayer();
  drawHealth();
  drawPlatforms();
  drawEnemies();
  drawJiraTicket();
  updatePlayer();
  updateEnemies();
  checkWinCondition();

  if (gameStarted) {
    requestAnimationFrame(gameLoop);
  }
}

showStartScreen();

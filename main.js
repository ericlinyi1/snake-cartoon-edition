/**
 * Snake Cartoon Deluxe 2.0 - Core Engine
 * Author: Dave (OpenClaw Engineer)
 * Version: 2.0.0
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startMenu = document.getElementById('start-menu');
const startBtn = document.getElementById('start-btn');

// Game Constants
const GRID_SIZE = 20;
const TILE_COUNT = 20;
canvas.width = GRID_SIZE * TILE_COUNT;
canvas.height = GRID_SIZE * TILE_COUNT;

// State
let snake = [];
let food = { x: 15, y: 5 };
let dx = 0;
let dy = -1;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameSpeed = 100;
let isDashing = false;
let enemies = [];
let bullets = [];

highScoreElement.innerText = highScore;

const COLORS = {
    bgLight: '#aad751',
    bgDark: '#a2d149',
    snake: '#4a752c',
    head: '#4a752c',
    food: '#e74c3c',
    enemy: '#e67e22',
    bullet: '#f1c40f'
};

// --- Initialization ---

function initGame() {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0; dy = -1;
    score = 0;
    scoreElement.innerText = score;
    bullets = [];
    spawnEnemies(2);
}

function spawnEnemies(count) {
    enemies = [];
    for (let i = 0; i < count; i++) {
        enemies.push({
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT),
            dx: Math.random() > 0.5 ? 1 : -1,
            dy: 0
        });
    }
}

// --- Drawing Functions ---

function drawBackground() {
    for (let row = 0; row < TILE_COUNT; row++) {
        for (let col = 0; col < TILE_COUNT; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.bgLight : COLORS.bgDark;
            ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;

        ctx.fillStyle = COLORS.snake;
        if (isDashing && isHead) ctx.fillStyle = '#ff7675'; // Dash glow
        
        if (isHead) {
            ctx.beginPath();
            ctx.roundRect(x, y, GRID_SIZE, GRID_SIZE, [10, 10, 10, 10]);
            ctx.fill();

            // Eyes
            const eyeSize = 4;
            const eyeOffset = 5;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y + eyeOffset - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE - eyeOffset, y + eyeOffset - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, [6, 6, 6, 6]);
            ctx.fill();
        }
    });
}

function drawFood() {
    const x = food.x * GRID_SIZE + GRID_SIZE / 2;
    const y = food.y * GRID_SIZE + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 2;
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = COLORS.enemy;
        ctx.beginPath();
        ctx.roundRect(e.x * GRID_SIZE + 2, e.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4, [4, 4, 4, 4]);
        ctx.fill();
    });
}

function drawBullets() {
    bullets.forEach(b => {
        ctx.fillStyle = COLORS.bullet;
        ctx.beginPath();
        ctx.arc(b.x * GRID_SIZE + GRID_SIZE/2, b.y * GRID_SIZE + GRID_SIZE/2, 4, 0, Math.PI*2);
        ctx.fill();
    });
}

// --- Logic ---

function update() {
    if (!gameRunning) return;

    // Bullets
    bullets = bullets.filter(b => {
        b.x += b.dx;
        b.y += b.dy;
        // Check hit
        const hitIdx = enemies.findIndex(e => e.x === b.x && e.y === b.y);
        if (hitIdx > -1) {
            enemies.splice(hitIdx, 1);
            score += 5;
            scoreElement.innerText = score;
            return false;
        }
        return b.x >= 0 && b.x < TILE_COUNT && b.y >= 0 && b.y < TILE_COUNT;
    });

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) return gameOver();

    // Body collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) return gameOver();

    // Enemy collision
    if (enemies.some(e => e.x === head.x && e.y === head.y)) return gameOver();

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.innerText = score;
        generateFood();
    } else {
        snake.pop();
    }

    // AI Basic Movement
    enemies.forEach(e => {
        if (Math.random() < 0.1) {
            const dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
            const d = dirs[Math.floor(Math.random()*dirs.length)];
            e.dx = d.x; e.dy = d.y;
        }
        const nextX = e.x + e.dx;
        const nextY = e.y + e.dy;
        if (nextX >= 0 && nextX < TILE_COUNT && nextY >= 0 && nextY < TILE_COUNT) {
            e.x = nextX; e.y = nextY;
        }
    });
}

function generateFood() {
    food = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * TILE_COUNT) };
}

function gameOver() {
    gameRunning = false;
    startMenu.classList.remove('hidden');
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.innerText = highScore;
    }
}

function shoot() {
    if (!gameRunning) return;
    bullets.push({ x: snake[0].x, y: snake[0].y, dx: dx, dy: dy });
}

function gameLoop() {
    drawBackground();
    drawFood();
    drawEnemies();
    drawBullets();
    drawSnake();
    update();
    setTimeout(gameLoop, isDashing ? gameSpeed / 2 : gameSpeed);
}

window.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
        case 'w': if (dy === 0) { dx = 0; dy = -1; } break;
        case 's': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'a': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'd': if (dx === 0) { dx = 1; dy = 0; } break;
        case ' ': shoot(); break;
        case 'shift': isDashing = true; break;
    }
});

window.addEventListener('keyup', e => {
    if (e.key.toLowerCase() === 'shift') isDashing = false;
});

startBtn.addEventListener('click', () => {
    initGame();
    gameRunning = true;
    startMenu.classList.add('hidden');
});

gameLoop();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restartBtn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let gameLoop = null;
let isGameOver = false;

function init() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    nextDx = 0;
    nextDy = 0;
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    overlay.classList.add('hidden');
    spawnFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, 150);
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Ensure food doesn't spawn on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        spawnFood();
    }
}

function draw() {
    update();
    if (isGameOver) return;

    // Clear Canvas
    ctx.fillStyle = '#f0fdf4'; // Light green
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#ef4444'; // Red
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2.5,
        0, Math.PI * 2
    );
    ctx.fill();

    // Draw Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#16a34a' : '#22c55e'; // Dark green head, green body
        
        // Cartoon rounded rect
        const r = 6;
        const x = segment.x * GRID_SIZE + 2;
        const y = segment.y * GRID_SIZE + 2;
        const w = GRID_SIZE - 4;
        const h = GRID_SIZE - 4;

        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();

        // Eyes for the head
        if (index === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + 5, y + 5, 2, 0, Math.PI * 2);
            ctx.arc(x + w - 5, y + 5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function update() {
    if (nextDx === 0 && nextDy === 0) return;

    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self Collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food Collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    overlay.classList.remove('hidden');
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
        case 'ArrowDown': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
        case 'ArrowLeft': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
        case 'ArrowRight': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
    }
});

// Mobile Controls
document.querySelectorAll('.ctrl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        if (dir === 'up' && dy !== 1) { nextDx = 0; nextDy = -1; }
        if (dir === 'down' && dy !== -1) { nextDx = 0; nextDy = 1; }
        if (dir === 'left' && dx !== 1) { nextDx = -1; nextDy = 0; }
        if (dir === 'right' && dx !== -1) { nextDx = 1; nextDy = 0; }
    });
});

restartBtn.addEventListener('click', init);

init();

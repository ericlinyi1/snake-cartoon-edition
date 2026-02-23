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

let snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
let food = { x: 15, y: 5 };
let dx = 0;
let dy = -1;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameSpeed = 100;

highScoreElement.innerText = highScore;

// Colors from Reference
const COLORS = {
    bgLight: '#aad751',
    bgDark: '#a2d149',
    snake: '#4a752c',
    head: '#4a752c',
    food: '#e74c3c'
};

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
        const radius = GRID_SIZE / 2;

        ctx.fillStyle = COLORS.snake;
        
        if (isHead) {
            // Draw Rounded Head
            ctx.beginPath();
            ctx.roundRect(x, y, GRID_SIZE, GRID_SIZE, [10, 10, 10, 10]);
            ctx.fill();

            // Draw Eyes (following Google Snake reference)
            const eyeSize = 4;
            const eyeOffset = 5;
            ctx.fillStyle = 'white';
            
            // Left Eye
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            // Right Eye
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x + eyeOffset, y + eyeOffset - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE - eyeOffset, y + eyeOffset - 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw Rounded Body
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
    
    // Leaf
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(x - 2, y - radius - 2, 4, 4);
}

function update() {
    if (!gameRunning) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Body collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.innerText = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
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

function gameLoop() {
    drawBackground();
    drawFood();
    drawSnake();
    update();
    setTimeout(gameLoop, gameSpeed);
}

window.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
        case 'w': if (dy === 0) { dx = 0; dy = -1; } break;
        case 's': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'a': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'd': if (dx === 0) { dx = 1; dy = 0; } break;
    }
});

startBtn.addEventListener('click', () => {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0; dy = -1;
    score = 0;
    scoreElement.innerText = score;
    gameRunning = true;
    startMenu.classList.add('hidden');
});

gameLoop();

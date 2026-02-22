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

// New: bullets and enemies
let bullets = [];
let enemies = [];
let tickCount = 0;
let enemySpawnTimer = 0;

class Bullet {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.dead = false;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw() {
        ctx.fillStyle = '#111827'; // dark
        ctx.beginPath();
        ctx.arc(
            this.x * GRID_SIZE + GRID_SIZE / 2,
            this.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 6,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

class Enemy {
    constructor(x, y, length = 4) {
        this.segments = [];
        for (let i = 0; i < length; i++) {
            this.segments.push({ x: x - i, y: y });
        }
        this.dx = 1;
        this.dy = 0;
        this.colorHead = '#b45309';
        this.colorBody = '#f59e0b';
    }

    update() {
        // Simple chase AI with some randomness
        const head = this.segments[0];
        const target = snake[0];
        const distX = target.x - head.x;
        const distY = target.y - head.y;

        // Decide primary direction towards player
        let ndx = 0, ndy = 0;
        if (Math.abs(distX) > Math.abs(distY)) {
            ndx = Math.sign(distX);
            ndy = 0;
        } else if (Math.abs(distY) > 0) {
            ndx = 0;
            ndy = Math.sign(distY);
        }

        // Occasionally pick a random turn
        if (Math.random() < 0.12 || (ndx === -this.dx && ndy === -this.dy)) {
            const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
            const choice = dirs[Math.floor(Math.random() * dirs.length)];
            ndx = choice[0]; ndy = choice[1];
        }

        // Prevent reversing
        if (!(ndx === -this.dx && ndy === -this.dy) && (ndx !== 0 || ndy !== 0)) {
            this.dx = ndx; this.dy = ndy;
        }

        let newHead = { x: head.x + this.dx, y: head.y + this.dy };

        // If wall collision, choose another direction
        if (newHead.x < 0 || newHead.x >= TILE_COUNT || newHead.y < 0 || newHead.y >= TILE_COUNT) {
            const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
            for (let i=0;i<10;i++) {
                const c = dirs[Math.floor(Math.random()*dirs.length)];
                if (!(c[0] === -this.dx && c[1] === -this.dy)) {
                    this.dx = c[0]; this.dy = c[1];
                    break;
                }
            }
            newHead = { x: head.x + this.dx, y: head.y + this.dy };
        }

        // Move body
        this.segments.unshift(newHead);
        this.segments.pop();
    }

    draw() {
        this.segments.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? this.colorHead : this.colorBody;
            const r = 6;
            const x = segment.x * GRID_SIZE + 2;
            const y = segment.y * GRID_SIZE + 2;
            const w = GRID_SIZE - 4;
            const h = GRID_SIZE - 4;

            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();
        });
    }
}

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
    bullets = [];
    enemies = [];
    tickCount = 0;
    enemySpawnTimer = 0;
    spawnFood();
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, 150);
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * TILE_COUNT),
        y: Math.floor(Math.random() * TILE_COUNT)
    };
    // Ensure food doesn't spawn on snake or enemies
    if (snake.some(segment => segment.x === food.x && segment.y === food.y) ||
        enemies.some(e => e.segments.some(segment => segment.x === food.x && segment.y === food.y))) {
        spawnFood();
    }
}

function spawnEnemy() {
    // Spawn at random edge
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = 0; y = Math.floor(Math.random() * TILE_COUNT); }
    if (edge === 1) { x = TILE_COUNT - 1; y = Math.floor(Math.random() * TILE_COUNT); }
    if (edge === 2) { x = Math.floor(Math.random() * TILE_COUNT); y = 0; }
    if (edge === 3) { x = Math.floor(Math.random() * TILE_COUNT); y = TILE_COUNT - 1; }

    // Avoid spawning on player
    if (snake.some(s => s.x === x && s.y === y)) return;

    enemies.push(new Enemy(x, y, 4));
}

function draw() {
    tickCount++;
    // Update game logic
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

    // Draw Enemy Snakes
    enemies.forEach(enemy => enemy.draw());

    // Draw Player Snake
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

    // Draw Bullets
    bullets.forEach(b => b.draw());
}

function update() {
    // Player movement - only if player has given a direction
    if (!(nextDx === 0 && nextDy === 0)) {
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

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.move();

        // Remove bullets that leave screen
        if (b.x < 0 || b.x >= TILE_COUNT || b.y < 0 || b.y >= TILE_COUNT) {
            bullets.splice(i, 1);
            continue;
        }

        // Check collision with enemies
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            for (let k = 0; k < enemy.segments.length; k++) {
                const seg = enemy.segments[k];
                if (seg.x === b.x && seg.y === b.y) {
                    // Remove enemy
                    enemies.splice(j, 1);
                    bullets.splice(i, 1);
                    score += 50;
                    scoreElement.textContent = score;
                    spawnFood();
                    hit = true;
                    break;
                }
            }
            if (hit) break;
        }
    }

    // Update enemies (every tick)
    enemies.forEach(enemy => enemy.update());

    // Check collision between enemy and player
    const head = snake[0];
    for (const enemy of enemies) {
        if (enemy.segments.some(seg => seg.x === head.x && seg.y === head.y)) {
            gameOver();
            return;
        }
    }

    // Spawn enemies occasionally
    enemySpawnTimer++;
    if (enemySpawnTimer > 30 && enemies.length < 4) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    overlay.classList.remove('hidden');
}

function fireBullet() {
    // Use current moving direction if available, otherwise next direction
    let bdx = dx, bdy = dy;
    if (bdx === 0 && bdy === 0) { bdx = nextDx; bdy = nextDy; }
    if (bdx === 0 && bdy === 0) return; // no direction to fire

    const head = snake[0];
    const bx = head.x + bdx; const by = head.y + bdy;
    bullets.push(new Bullet(bx, by, bdx, bdy));
}

window.addEventListener('keydown', e => {
    const k = e.key;
    // Movement: Arrow keys + WASD
    if (k === 'ArrowUp' || k === 'Up' || k === 'w' || k === 'W') { if (dy !== 1) { nextDx = 0; nextDy = -1; } }
    if (k === 'ArrowDown' || k === 'Down' || k === 's' || k === 'S') { if (dy !== -1) { nextDx = 0; nextDy = 1; } }
    if (k === 'ArrowLeft' || k === 'Left' || k === 'a' || k === 'A') { if (dx !== 1) { nextDx = -1; nextDy = 0; } }
    if (k === 'ArrowRight' || k === 'Right' || k === 'd' || k === 'D') { if (dx !== -1) { nextDx = 1; nextDy = 0; } }

    // Fire: Space key
    if (k === ' ' || e.code === 'Space' || k === 'Spacebar') {
        fireBullet();
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

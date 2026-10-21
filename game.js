// Arcanoid Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Paddle {
    constructor() {
        this.width = 120;
        this.height = 15;
        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - 30;
        this.color = '#00ffcc';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    move(mouseX) {
        this.x = mouseX - this.width / 2;

        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
    }
}

class Ball {
    constructor() {
        this.radius = 10;
        this.color = 'ff3366';
        this.baseSpeed = 6;

        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;
        this.dx = 0;
        this.dy = 0;
        this.isStuck = true;
    }

    launch() {
        if (this.isStuck) {
            this.isStuck = false;
            this.dx = (Math.random() * 4 - 2);
            this.dy = -this.baseSpeed;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(aPaddle) {
        if (this.isStuck) {
            this.x = aPaddle.x + aPaddle.width / 2;
            this.y = aPaddle.y - this.radius;
            return; // Выходим из метода, физику полета и отскоков не считаем
        }

        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx *= -1;
        }

        if (this.y - this.radius < 0) {
            this.dy *= -1;
        }

        if (this.y - this.radius > canvas.height) {
            this.reset();
        }

        // ==========================================
        // КОЛЛИЗИЯ С ПЛАТФОРМОЙ
        // ==========================================

        if (
            this.y + this.radius >= aPaddle.y &&                // 1. Мяч не улетел выше верха платформы
            this.y - this.radius <= aPaddle.y + aPaddle.height && // 2. Мяч не улетел ниже дна платформы
            this.x + this.radius >= aPaddle.x &&               // 3. Мяч правее левого края платформы
            this.x - this.radius <= aPaddle.x + aPaddle.width     // 4. Мяч левее правого края платформы
        ) {
            let hitPosition = this.x - aPaddle.x;
            let relativeHit = (hitPosition / aPaddle.width) * 2 - 1;

            this.dx = relativeHit * this.baseSpeed;
            this.dy = -Math.sqrt(Math.abs(this.baseSpeed * this.baseSpeed - this.dx * this.dx));

            if (Math.abs(this.dy) < 2) {
                this.dy = -2;
            }

            this.y = aPaddle.y - this.radius;
        }

    }
}

const paddle = new Paddle();
const ball = new Ball();

canvas.addEventListener('mousemove', event => {
    const realtiveX = event.clientX - canvas.getBoundingClientRect().left;
    paddle.move(realtiveX);
});

window.addEventListener('click', () => {
    ball.launch();
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paddle.draw();
    ball.draw();
    ball.update(paddle);
    requestAnimationFrame(gameLoop);
}

gameLoop();
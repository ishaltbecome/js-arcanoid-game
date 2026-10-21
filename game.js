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
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;
        this.color = 'ff3366';
        this.dx = 5;
        this.dy = -5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx *= -1;
        }

        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy *= -1;
        }
    }
}


const paddle = new Paddle();
const ball = new Ball();

canvas.addEventListener('mousemove', event => {
    paddle.move(event.offsetX);
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paddle.draw();
    ball.draw();
    ball.update();
    requestAnimationFrame(gameLoop);
}

gameLoop();
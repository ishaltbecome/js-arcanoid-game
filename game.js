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

class Brick {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.isDestroyed = false;
    }

    draw(ctx) {
        if (!this.isDestroyed) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Добавим легкую обводку, чтобы кирпичи смотрелись объемнее
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

const paddle = new Paddle();
const ball = new Ball();

// Настройки сетки кирпичей
const brickRows = 5;       // Количество строк
const brickCols = 8;       // Количество колонок
const brickPadding = 10;   // Отступ между кирпичами
const brickOffsetTop = 50; // Отступ от верхнего края canvas
const brickOffsetLeft = 35;// Отступ от левого края canvas

// Автоматически вычисляем ширину кирпича, чтобы сетка ровно влезла в экран 800px
const brickWidth = (canvas.width - (brickOffsetLeft * 2) - (brickPadding * (brickCols - 1))) / brickCols;
const brickHeight = 25;    // Высота кирпича

// Массив цветов для каждого ряда (сверху вниз)
const rowColors = ['#ff3333', '#ff9933', '#ffff33', '#33ff33', '#3399ff'];

const bricks = [];

// Двойной цикл для заполнения сетки
for (let r = 0; r < brickRows; r++) {
    for (let c = 0; c < brickCols; c++) {
        // Вычисляем координаты X и Y для каждого конкретного кирпича
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

        // Создаем новый кирпич и кладем его в массив
        bricks.push(new Brick(brickX, brickY, brickWidth, brickHeight, rowColors[r]));
    }
}


canvas.addEventListener('mousemove', event => {
    const realtiveX = event.clientX - canvas.getBoundingClientRect().left;
    paddle.move(realtiveX);
});

window.addEventListener('click', () => {
    ball.launch();
});

function checkBrickCollisions() {
    bricks.forEach(brick => {
        // Проверяем коллизию только для тех кирпичей, которые ЕЩЕ НЕ разрушены
        if (!brick.isDestroyed) {
            if (
                ball.y + ball.radius >= brick.y &&               // Мяч ниже верхней границы кирпича
                ball.y - ball.radius <= brick.y + brick.height && // Мяч выше нижней границы кирпича
                ball.x + ball.radius >= brick.x &&               // Мяч правее левой границы кирпича
                ball.x - ball.radius <= brick.x + brick.width     // Мяч левее правой границы кирпича
            ) {
                // Разворачиваем мяч по вертикали
                ball.dy *= -1;

                // Помечаем кирпич как уничтоженный
                brick.isDestroyed = true;
            }
        }
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paddle.draw();
    ball.draw();
    ball.update(paddle);
    checkBrickCollisions();
    bricks.forEach(brick => brick.draw(ctx));
    requestAnimationFrame(gameLoop);
}

gameLoop();
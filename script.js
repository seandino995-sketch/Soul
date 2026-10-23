const gameArea = document.getElementById("gameArea");
const horse = document.getElementById("horse");
const gameMessage = document.getElementById("gameMessage");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const jumpBtn = document.getElementById("jumpBtn");

let playing = false;
let jumping = false;

let score = 0;
let best = 0;

try {
    best = Number(localStorage.getItem("horseBest")) || 0;
} catch (error) {
    best = 0;
}

bestEl.textContent = best;

let jumpHeight = 0;
let jumpSpeed = 0;
let speed = 5;
let lastTime = 0;
let scoreTimer = 0;
let obstacles = [];
let nextObstacleDistance = 300;

function createObstacle() {
    const obstacle = document.createElement("div");

    const kind = Math.random() < 0.5 ? "cactus" : "rock";

    obstacle.className = "obstacle " + kind;

    let width;
    let height;

    if (kind === "cactus") {
        width = 30;
        height = 45 + Math.random() * 15;
    } else {
        width = 45 + Math.random() * 20;
        height = 30 + Math.random() * 10;
    }

    obstacle.style.width = width + "px";
    obstacle.style.height = height + "px";

    gameArea.appendChild(obstacle);

    obstacles.push({
        element: obstacle,
        x: gameArea.clientWidth + 20,
        width: width,
        height: height
    });
}

function clearObstacles() {
    obstacles.forEach(function(obstacle) {
        obstacle.element.remove();
    });

    obstacles = [];
}

function startGame() {
    if (playing) {
        return;
    }

    clearObstacles();

    playing = true;
    jumping = false;

    score = 0;
    speed = 5;
    jumpHeight = 0;
    jumpSpeed = 0;
    scoreTimer = 0;
    lastTime = 0;

    nextObstacleDistance = 300;

    horse.style.bottom = "0px";
    scoreEl.textContent = score;

    gameMessage.style.display = "none";

    createObstacle();

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!playing) {
        startGame();
        return;
    }

    if (!jumping) {
        jumping = true;
        jumpSpeed = 13;
    }
}

function gameLoop(time) {
    if (!playing) {
        return;
    }

    if (lastTime === 0) {
        lastTime = time;
    }

    const delta = Math.min((time - lastTime) / 16.67, 2);

    lastTime = time;

    if (jumping) {
        jumpHeight += jumpSpeed * delta;
        jumpSpeed -= 0.65 * delta;

        if (jumpHeight <= 0) {
            jumpHeight = 0;
            jumping = false;
        }

        horse.style.bottom = jumpHeight + "px";
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];

        obstacle.x -= speed * delta;
        obstacle.element.style.left = obstacle.x + "px";

        if (obstacle.x < -100) {
            obstacle.element.remove();
            obstacles.splice(i, 1);
            speed += 0.2;
        }
    }

    const lastObstacle = obstacles[obstacles.length - 1];

    if (!lastObstacle ||
        lastObstacle.x < gameArea.clientWidth - nextObstacleDistance) {

        createObstacle();

        nextObstacleDistance = 260 + Math.random() * 120;
    }

    scoreTimer += delta;

    if (scoreTimer >= 6) {
        score++;
        scoreTimer = 0;
        scoreEl.textContent = score;
    }

    const horseLeft = horse.offsetLeft + 15;
    const horseRight = horse.offsetLeft + horse.offsetWidth - 15;

    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];

        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + obstacle.width;

        if (
            obstacleRight > horseLeft &&
            obstacleLeft < horseRight &&
            jumpHeight < obstacle.height - 8
        ) {
            gameOver();
            return;
        }
    }

    requestAnimationFrame(gameLoop);
}

function gameOver() {
    playing = false;

    if (score > best) {
        best = score;
        bestEl.textContent = best;

        try {
            localStorage.setItem("horseBest", String(best));
        } catch (error) {
            console.log("High score could not be saved.");
        }
    }

    gameMessage.innerHTML =
        "GAME OVER!<br>" +
        "Score: " + score + "<br>" +
        "Press START to retry!";

    gameMessage.style.display = "block";
}

startBtn.addEventListener("click", startGame);

jumpBtn.addEventListener("click", jump);

gameArea.addEventListener("pointerdown", function() {
    jump();
});

window.addEventListener("keydown", function(event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();

        if (!event.repeat) {
            jump();
        }
    }
});
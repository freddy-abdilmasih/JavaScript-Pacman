import { LEVEL, OBJECT_TYPE } from './setup';
import { randomMovement } from './ghostMoves';

// Classes
import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghost';

// Sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';

// DOM Elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');

// Game Constants
const POWER_PILL_TIME = 10000; // ms, PowerPill lasts for 10 seconds
const GLOBAL_SPEED = 80; // ms -Global speed for game loop
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

// Initial Setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

// Audio
function playAudio(audio) {
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

// Functions
function gameOver(pacman, grid) {
    playAudio(soundGameOver);
    document.removeEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );

    gameBoard.showGameStatus(gameWin);

    clearInterval(timer);

    startButton.classList.remove('hide');
}

function checkCollision(pacman, ghosts) {
    const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

    if (collidedGhost) {
        // Pacman eats a ghost
        if (pacman.powerPill) {
            playAudio(soundGhost);

            gameBoard.removeObject(collidedGhost.pos, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name,
            ]);
            collidedGhost.pos = collidedGhost.startPos; // Moves the ghost back to the start position after it dies
            score += 100;
        } else {
            gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos, 0);
            gameOver(pacman, gameGrid);
        }
    }
}

function gameLoop(pacman, ghosts) {
    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    // Check if Pacman eats a dot
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--; // removes dots when eaten
        score += 10; // 10 pts for each dot eaten
    }

    // Check if Pacman eats a PowerPill
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

        pacman.powerPill = true; // Pacman is supercharged after eating PowerPill
        score += 50; // 50 pts for eating a PowerPill

        clearTimeout(powerPillTimer); // Resets the PowerPill timer
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
    }

    // Change ghosts "scared" mode (dependent on PowerPill)
    if (pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
    }

    // Check if all dots have been eaten
    if (gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    // Show the scoreboard
    scoreTable.innerHTML = score;
}

function startGame() {
    playAudio(soundGameStart);

    gameWin = false;
    powerPillActive = false;
    score = 0;

    startButton.classList.add('hide'); // hides the start button after it's clicked

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, 287); // 2 = speed, 287 = position
    gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );

    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY), // speed = 5, position = 188
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE),
    ];

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// Initialize game
startButton.addEventListener('click', startGame);

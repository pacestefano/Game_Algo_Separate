import { calculateMinMoves } from './minMovesCalculator.js';

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('gameBoard');
    const timerBar = document.getElementById('timerBar');
    const timerText = document.getElementById('timerText');
    const minMovesContainer = document.getElementById('minMovesContainer');
    const movesContainer = document.getElementById('movesContainer');
    const minMovesCounter = document.getElementById('minMovesCounter');
    const movesCounter = document.getElementById('movesCounter');
    const message = document.getElementById('message');
    const summary = document.getElementById('summary');
    const instructions = document.getElementById('instructions');
    const nextGameButton = document.getElementById('nextGameButton');
    const retryButton = document.getElementById('retryButton');
    const timeoutMessage = document.getElementById('timeoutMessage');
    const moveSound = document.getElementById('moveSound');
    const winSound = document.getElementById('winSound');
    // const timeoutSound = document.getElementById('timeoutSound');
    // const loseSound = document.getElementById('loseSound');
    const undoButton = document.getElementById('undoButton');
    const burgerMenu = document.getElementById('burgerMenu');
    const menuOptions = document.getElementById('menuOptions');
    const levelDisplay = document.getElementById('levelDisplay');

    let moveCount = 0;
    let timerInterval;
    let gameIndex = 0;
    let gamesData = [];
    let timerStarted = false;
    let draggedElement = null;
    let totalMoves;
    let moveHistory = [];
    let gameOver = false;
    let currentLevel = 'Base';

    const MAX_GAMES = 3;

    burgerMenu.addEventListener('click', () => {
        menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
    });

    window.setLevel = function setLevel(level) {
        currentLevel = level;
        levelDisplay.textContent = `Livello: ${level}`;
        updateLevelColor(level);
        menuOptions.style.display = 'none';
        resetTimer();
        startGame();
    };

    function updateLevelColor(level) {
        switch (level) {
            case 'Medio':
                levelDisplay.style.color = 'orange';
                break;
            case 'Avanzato':
                levelDisplay.style.color = 'red';
                break;
            case 'Base':
            default:
                levelDisplay.style.color = 'black';
                break;
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerText.textContent = '120 secondi';
        timerBar.style.width = '100%';
    }

    function startGame() {
        console.log("Starting game..."); // Debug
        moveCount = 0;
        moveHistory = [];
        gameOver = false;
        if (message) message.textContent = '';
        if (timeoutMessage) timeoutMessage.style.display = 'none';
        if (retryButton) retryButton.style.display = 'none';
        if (summary) summary.textContent = '';
        if (nextGameButton) nextGameButton.style.display = 'none';
        if (board) {
            board.innerHTML = '';
            board.classList.remove('win-animation');
        }
        if (timerText) timerText.textContent = '120 secondi';
        if (timerBar) timerBar.style.width = '100%';
        if (movesContainer) movesContainer.innerHTML = '';
        if (minMovesContainer) minMovesContainer.innerHTML = '';
        if (movesCounter) movesCounter.textContent = '0';
        if (minMovesCounter) minMovesCounter.textContent = '0';

        if (undoButton) {
            undoButton.classList.remove('active');
            undoButton.style.backgroundColor = '#d3d3d3';
            undoButton.style.cursor = 'not-allowed';
        }

        let numbers = generateNumbers();
        let shuffledNumbers = shuffle(numbers);
        console.log("Generated numbers:", numbers); // Debug

        const minMoves = getMinMovesForLevel(currentLevel);
        if (minMovesCounter) minMovesCounter.textContent = minMoves;
        totalMoves = minMoves;
        for (let i = 0; i < minMoves; i++) {
            let circle = document.createElement('div');
            circle.classList.add('circle', 'min-moves');
            minMovesContainer.appendChild(circle);
        }

        for (let i = 0; i < 3; i++) {
            createCell(shuffledNumbers[i * 3]);
            createOperator('+');
            createCell(shuffledNumbers[i * 3 + 1]);
            createOperator('=');
            createCell(shuffledNumbers[i * 3 + 2]);
        }
        console.log("Grid populated"); // Debug

        startTimer();
    }

    function generateNumbers() {
        let numbers = [];
        while (numbers.length < 9) {
            let A = Math.floor(Math.random() * 9) + 1;
            let B = Math.floor(Math.random() * 9) + 1;
            let C = A + B;
            if (C <= 9) {
                numbers.push(A, B, C);
            }
        }
        console.log("Generated numbers:", numbers); // Debug
        return numbers.slice(0, 9);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createCell(num) {
        let cell = document.createElement('div');
        console.log("Creating cell with number:", num); // Debug
        cell.classList.add('cell');
        cell.textContent = num;
        cell.draggable = true;
        cell.dataset.index = board.childElementCount;
        cell.addEventListener('dragstart', dragStart);
        cell.addEventListener('dragover', dragOver);
        cell.addEventListener('dragleave', dragLeave);
        cell.addEventListener('drop', drop);
        cell.addEventListener('touchstart', touchStart, { passive: false });
        cell.addEventListener('touchmove', touchMove, { passive: false });
        cell.addEventListener('touchend', touchEnd, { passive: false });
        if (board) board.appendChild(cell);
    }

    function createOperator(operator) {
        let operatorCell = document.createElement('div');
        operatorCell.classList.add('operator');
        operatorCell.textContent = operator;
        if (board) board.appendChild(operatorCell);
    }

    function dragStart(e) {
        if (gameOver) return;
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
        e.target.classList.add('dragging');
        if (!timerStarted) {
            timerStarted = true;
        }

        if (undoButton) {
            undoButton.classList.add('active');
            undoButton.style.backgroundColor = '#4caf50';
            undoButton.style.cursor = 'pointer';
        }
    }

    function dragOver(e) {
        e.preventDefault();
        if (gameOver) return;
        e.target.classList.add('drop-target');
    }

    function dragLeave(e

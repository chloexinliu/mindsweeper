class Minesweeper {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
        this.setGameConfig();
        this.board = [];
        this.revealed = new Set();
        this.gameOver = false;
        this.initializeBoard();
        this.placeMines();
        this.calculateNumbers();
        this.render();
        
        // Add event listener for reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.resetGame();
        });
    }

    setGameConfig() {
        switch (this.difficulty) {
            case 'easy':
                this.rows = 8;
                this.cols = 8;
                this.mines = 10;
                break;
            case 'medium':
                this.rows = 16;
                this.cols = 16;
                this.mines = 40;
                break;
            case 'hard':
                this.rows = 30;
                this.cols = 16;
                this.mines = 99;
                break;
        }
    }

    initializeBoard() {
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (this.board[row][col] !== 'X') {
                this.board[row][col] = 'X';
                minesPlaced++;
            }
        }
    }

    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] === 'X') continue;
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (newRow >= 0 && newRow < this.rows && 
                            newCol >= 0 && newCol < this.cols && 
                            this.board[newRow][newCol] === 'X') {
                            count++;
                        }
                    }
                }
                this.board[row][col] = count;
            }
        }
    }

    render() {
        const boardElement = document.getElementById('board');
        boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 30px)`;
        boardElement.innerHTML = '';

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const key = `${row}-${col}`;
                
                if (this.revealed.has(key)) {
                    cell.classList.add('revealed');
                    if (this.board[row][col] === 'X') {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.board[row][col] > 0) {
                        cell.textContent = this.board[row][col];
                    }
                }

                cell.addEventListener('click', () => this.handleClick(row, col));
                boardElement.appendChild(cell);
            }
        }
    }

    handleClick(row, col) {
        if (this.gameOver) return;
        
        const key = `${row}-${col}`;
        if (this.revealed.has(key)) return;

        this.revealed.add(key);

        if (this.board[row][col] === 'X') {
            this.gameOver = true;
            document.getElementById('game-status').textContent = 'Game over! You lost!';
            this.revealAll();
        } else {
            this.checkWin();
        }

        this.render();
    }

    checkWin() {
        const totalCells = this.rows * this.cols;
        const safeCells = totalCells - this.mines;
        
        if (this.revealed.size === safeCells) {
            this.gameOver = true;
            document.getElementById('game-status').textContent = 'Game over! You Won!';
            this.revealAll();
        }
    }

    revealAll() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.revealed.add(`${row}-${col}`);
            }
        }
        this.render();
    }

    resetGame() {
        this.revealed = new Set();
        this.gameOver = false;
        document.getElementById('game-status').textContent = '';
        this.initializeBoard();
        this.placeMines();
        this.calculateNumbers();
        this.render();
    }
    
    getDifficultyFromHash() {
        const hash = window.location.hash;
        if (hash === '#/game/easy') return 'easy';
        else if (hash === '#/game/medium') return 'medium';
        else if (hash === '#/game/hard') return 'hard';
        return null;
    }

    updateGame() {
        const newDifficulty = this.getDifficultyFromHash();
        if (newDifficulty && newDifficulty !== this.difficulty) {
            this.difficulty = newDifficulty;
            this.setGameConfig();
            this.resetGame();
        }
    }
}

// Start game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const initialDifficulty = new Minesweeper().difficulty;
    new Minesweeper(initialDifficulty);

    // Listen for hash changes to update the game difficulty
    window.addEventListener('hashchange', () => {
        const minesweeperInstance = new Minesweeper();
        minesweeperInstance.updateGame();
    });
});
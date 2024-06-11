document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const row = 20;
    const col = 10;
    const blockSize = 30;
    const board = Array.from({ length: row }, () => Array(col).fill(0));
    const colors = [
        '#000000', '#FFD700', '#DC143C', '#00CED1', '#FF8C00', '#8A2BE2', '#20B2AA', '#FF69B4'
    ];
    const messages = [
        "경증 환자, LA GRADE A-B, 라비에트 10MG BID",
        "중증 환자, LA GRADE C-D, 라비에트 20MG BID",
        "가슴 통증, 만성 기침, 후두 이물감 있는 환자, 라비에트 20MG BID",
        "라비에트는 FULL DOSE BID 처방(20MG BID)되는 유일한 PPI(K21.0)",
        "라비에트는 재활용 포장 사용 친환경 제품입니다.",
        "라비에트는 국내 라베프라졸 NO.1 제품",
        "클래리스로마이신과의 약물 상호 작용이 적어 제균에 효과적"
    ];
    let messageIndex = 0;

    const tetrominoes = [
        [ [1, 1, 1, 1] ], // I
        [ [0, 2, 2], [2, 2, 0] ], // S
        [ [3, 3, 0], [0, 3, 3] ], // Z
        [ [4, 0, 0], [4, 4, 4] ], // J
        [ [0, 0, 5], [5, 5, 5] ], // L
        [ [6, 6], [6, 6] ], // O
        [ [0, 7, 0], [7, 7, 7] ]  // T
    ];

    let currentPiece, currentX, currentY;

    function resetBoard() {
        for (let y = 0; y < row; y++) {
            board[y].fill(0);
        }
    }

    function drawSquare(x, y, color) {
        ctx.fillStyle = colors[color];
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }

    function drawBoard() {
        for (let y = 0; y < row; y++) {
            for (let x = 0; x < col; x++) {
                drawSquare(x, y, board[y][x]);
            }
        }
    }

    function collide(area, matrix, offsetX, offsetY) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < matrix[y].length; ++x) {
                if (matrix[y][x] !== 0 &&
                   (area[y + offsetY] && area[y + offsetY][x + offsetX]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function rotate(matrix) {
        const newMatrix = matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
        return newMatrix;
    }

    function rotatePiece() {
        const rotatedPiece = rotate(currentPiece);
        if (!collide(board, rotatedPiece, currentX, currentY)) {
            currentPiece = rotatedPiece;
        }
    }

    function dropPiece() {
        currentY++;
        if (collide(board, currentPiece, currentX, currentY)) {
            currentY--;
            merge(board, currentPiece, currentX, currentY);
            resetCurrentPiece();
            sweepBoard();
        }
        drawBoard();
        drawPiece(currentPiece, currentX, currentY);
    }

    function merge(board, piece, offsetX, offsetY) {
        piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + offsetY][x + offsetX] = value;
                }
            });
        });
    }

    function resetCurrentPiece() {
        const id = Math.floor(Math.random() * tetrominoes.length);
        currentPiece = tetrominoes[id];
        currentX = (col / 2 | 0) - (currentPiece[0].length / 2 | 0);
        currentY = 0;
        if (collide(board, currentPiece, currentX, currentY)) {
            resetBoard();  // Game over reset
        }
    }

    function sweepBoard() {
        let lineCounter = 0;
        outer: for (let y = board.length - 1; y > 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }

            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            ++y;

            lineCounter++;
        }
        if (lineCounter > 0) {
            displayMessage();
        }
    }

    function displayMessage() {
        const messageDiv = document.getElementById('message');
        messageDiv.innerText = messages[messageIndex];
        messageIndex = (messageIndex + 1) % messages.length;
    }

    function updateBoard() {
        drawBoard();
        drawPiece(currentPiece, currentX, currentY);
    }

    function drawPiece(piece, offsetX, offsetY) {
        piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawSquare(x + offsetX, y + offsetY, value);
                }
            });
        });
    }

    function handleKeyPress(event) {
        switch (event.keyCode) {
            case 37: // Left arrow
                moveLeft();
                break;
            case 39: // Right arrow
                moveRight();
                break;
            case 40: // Down arrow
                dropPiece();
                break;
            case 38: // Up arrow
            case 13: // Enter key
                rotatePiece();
                break;
        }
        updateBoard();
    }

    function moveLeft() {
        currentX--;
        if (collide(board, currentPiece, currentX, currentY)) {
            currentX++;
        }
    }

    function moveRight() {
        currentX++;
        if (collide(board, currentPiece, currentX, currentY)) {
            currentX--;
        }
    }

    function handleTouch(button) {
        switch (button) {
            case 'left':
                moveLeft();
                break;
            case 'right':
                moveRight();
                break;
            case 'down':
                dropPiece();
                break;
            case 'rotate':
                rotatePiece();
                break;
        }
        updateBoard();
    }

    document.addEventListener('keydown', handleKeyPress);

    document.getElementById('left').addEventListener('click', () => handleTouch('left'));
    document.getElementById('right').addEventListener('click', () => handleTouch('right'));
    document.getElementById('down').addEventListener('click', () => handleTouch('down'));
    document.getElementById('rotate').addEventListener('click', () => handleTouch('rotate'));

    resetBoard();
    resetCurrentPiece();
    updateBoard();
    setInterval(dropPiece, 1000); // Update game state every second
});

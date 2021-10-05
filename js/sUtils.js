'use strict';
//play sound function
function playSound(src) {
    var sound = new Audio('src');
    sound.play();
}

//randomColor function
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//random int function
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

//get numbers for board
function getBoardNums() {
    var nums = [];
    for (var i = 1; i <= gCurrLevel; i++) {
        nums.push(i);
    }
    return nums;
}

//blow up negs
function blowUpNegs(pos) {
    var cellI = pos.i;
    var cellJ = pos.j;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].gameObject === ALIEN) {
                updateCell({ i, j }, '');
                gPoints += 10;
                gGame.aliensCount--;
            }
        }
    }
}

//count negs
function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            var currCell = mat[i][j];
            if (currCell === LIFE || currCell === SUPER_LIFE) neighborsCount++;
        }
    }
    return neighborsCount;
}

//timer functions
function startTime() {
    var gStartTime = Date.now();
    var elTimer = document.querySelector('.timer');
    gTimerInterval = setInterval(function () {
        var passedSeconds = Math.floor((Date.now() - gStartTime) / 1000);
        elTimer.innerText = passedSeconds;
    }, 100);
}
function stopTime() {
    clearInterval(gTimerInterval);
}

//render board
function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // figure class name
            var className = (i + j) % 2 === 0 ? 'white' : 'black';

            strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this)">
                            ${cell}
                        </td>`;
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}

//renderCell function
function renderCell(pos, value) {
    var elCell = document.querySelector(
        `[data-i="${pos.i}"][data-j="${pos.j}"]`
    );
    elCell.innerText = value;
}

//check empty cell
function CheckEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) {
                emptyCells.push({ i, j });
            }
        }
    }

    return emptyCells;
}
function CheckEmptyCellsFirstRow(board) {
    var emptyCells = [];
    for (var i = 0; i < 1; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) {
                emptyCells.push({ i, j });
            }
        }
    }

    return emptyCells;
}

//get empty random cell
function getRandomEmptyCell(board) {
    var currEmptyCells = CheckEmptyCells(board);
    var currIdx = getRandomInt(0, currEmptyCells.length - 1);
    return currEmptyCells[currIdx];
}

function getRowRandomEmptyCell(board) {
    var currEmptyCells = CheckEmptyCellsFirstRow(board);
    var currIdx = getRandomInt(0, currEmptyCells.length - 1);
    return currEmptyCells[currIdx];
}

//get class by location i , j
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

//create matrix
function createBoard(ROWS, COLS) {
    var board = [];
    for (var i = 0; i < ROWS; i++) {
        var row = [];
        for (var j = 0; j < COLS; j++) {
            row.push('');
        }
        board.push(row);
    }
    return board;
}

//copy board (for recursion)
function copyBoard(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        // newMat[i] = mat[i].slice();
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

//shuffle array
function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length - 1);
        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}

// Returns a new cell object. e.g.: {type: SKY, gameObject: ALIEN}
function createCell(gameObject = null) {
    return {
        type: SKY,
        gameObject: gameObject,
    };
}
//get specipic cell
function getElCell(pos) {
    return document.querySelector(`[data-i='${pos.i}'][data-j='${pos.j}']`);
}

'use strict';
//globals
//main
const BOARD_SIZE = 15;
const LASER = '🔼';
const SUPER_LASER = '💥';
var gSuperShoots = 3;
const SUPER_LASER_SPEED = 40;
var gSuperMode = false;
const SKY = 'sky';
const EARTH = 'earth';
gCurrLevel = 'beg';
var gAliens = {
    alienSpeed: 500,
    aliensRowLength: 8,
    aliensRowCount: 3,
    gAliensTopRowIdx: 0,
    gAliensBottomRowIdx: 2,
};

const STAR = '⭐';
var gStarInterval;
var gNegsShoot = false;
//alien

const POOP = '💩';
const POOP_SPEED = 100;
const ALIEN = '👾';

var gIntervalAliens;

var gIsAlienFreeze = true;

//hero
const HERO = '🗼';
const LASER_SPEED = 80;
var gLaserInterval;
var gHero = { pos: { i: 13, j: 7 }, isShoot: false };
// creates the hero and place it on board

// Matrix of cell objects. e.g.: {type: SKY, gameObject: ALIEN}
var gBoard;
var gGame = {
    isOn: false,
    aliensCount: 0,
};
var gPoints = 0;
var gCurrLevel = 'beg';
var elH2 = document.querySelector('.negs-mode');
//functions
function init() {
    gGame.isOn = false;
    gNegsShoot = false;
    elH2.innerText = 'OFF';
    elH2.style.backgroundColor = 'red';
    closeModal();
    clearInterval(gIntervalAliens);
    clearInterval(gStarInterval);
    gSuperShoots = 3;
    document.querySelector('.super-shoot').innerText = gSuperShoots;
    gPoints = 0;
    document.querySelector('.points').innerText = gPoints;
    gBoard = createBoard(BOARD_SIZE);
    renderBoard(gBoard);
    gGame.aliensCount = gAliens.aliensRowCount * gAliens.aliensRowLength;
    gAliens.gAliensTopRowIdx = gAliens.gAliensTopRowIdx;
    gAliens.gAliensBottomRowIdx = gAliens.gAliensBottomRowIdx;
}
function start() {
    if (gGame.isOn) {
        return;
    }
    gGame.isOn = true;
    moveAliens();
    gStarInterval = setInterval(randomStar, 10000);
}

function createBoard(BOARD_SIZE) {
    var board = [];
    for (var i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < BOARD_SIZE; j++) {
            var currCell = createCell();
            if (i === BOARD_SIZE - 1) currCell.type = EARTH;
            board[i][j] = currCell;
        }
    }

    createAliens(board);
    createHero(board);
    return board;
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var className = board[i][j].type === SKY ? 'sky' : 'earth';
            strHtml += `<td data-i="${i}" data-j="${j}"
            class="${className}">
                            ${board[i][j].gameObject}
                        </td>`;
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;
}

function createCell(gameObject = '') {
    return {
        type: SKY,
        gameObject,
    };
}

//hero functions
function createHero(board) {
    var i = gHero.pos.i;
    var j = gHero.pos.j;
    board[i][j].gameObject = HERO;
}

// // Handle game keys
function onKeyDown(ev) {
    // console.log(ev);
    if (gGame.isOn) {
        var i = gHero.pos.i;
        var j = gHero.pos.j;

        switch (ev.key) {
            case 'ArrowLeft':
                moveHero({ i, j: j - 1 });
                break;
            case 'ArrowRight':
                moveHero({ i, j: j + 1 });
                break;
            case ' ':
                if (gHero.isShoot) return;
                //make the user cant shot immideatly
                gHero.isShoot = true;
                shoot({ i: i - 1, j });
                break;
            case 'n':
                gNegsShoot = true;
                elH2.innerText = 'ON';
                elH2.style.backgroundColor = 'green';
                break;
            case 'x':
                if (gHero.isShoot) return;
                gHero.isShoot = true;
                gSuperMode = true;
                shoot({ i: i - 1, j });
                break;
        }
    }
}

function moveHero(pos) {
    if (pos.j > gBoard.length - 1 || pos.j < 0) return;
    updateCell(gHero.pos, '');
    gHero.pos.i = pos.i;
    gHero.pos.j = pos.j;
    updateCell(pos, HERO);
}

//shooting bug - if i shoot and the aliens move into it they die and i dont get the points

// // Sets an interval for shutting (blinking) the laser up towards aliens
function shoot(pos) {
    if (gSuperShoots === 0) {
        gSuperMode = false;
    }
    if (gSuperMode) {
        updateCell(pos, SUPER_LASER);
        gLaserInterval = setInterval(function () {
            blinkLaser(pos);
        }, SUPER_LASER_SPEED);
        gSuperShoots--;
    } else {
        updateCell(pos, LASER);
        gLaserInterval = setInterval(function () {
            blinkLaser(pos);
        }, LASER_SPEED);
    }
}
// // renders a LASER at specific cell for short time and removes it
function blinkLaser(pos) {
    var nextCell = getElCell({ i: pos.i - 1, j: pos.j });

    if (pos.i === 0) {
        clearInterval(gLaserInterval);
        updateCell(pos, '');
        gHero.isShoot = false;
        return;
    }

    if (nextCell.innerText === ALIEN) {
        if (gNegsShoot) {
            blowUpNegs(pos);
            gNegsShoot = false;
            elH2.innerText = 'OFF';
            elH2.style.backgroundColor = 'red';
            gPoints -= 10;
            gGame.aliensCount++;
        }
        gSuperMode = false;
        clearInterval(gLaserInterval);
        updateCell({ i: pos.i - 1, j: pos.j }, '');
        updateCell(pos, '');
        gGame.aliensCount--;
        gPoints += 10;
        document.querySelector('.points').innerText = gPoints;
        document.querySelector('.super-shoot').innerText = gSuperShoots;
        gHero.isShoot = false;

        checkVictory();
        return;
    } else if (nextCell.innerText === STAR) {
        console.log('star hit');
        gPoints += 50;
        document.querySelector('.points').innerText = gPoints;
    }
    updateCell(pos, '');
    pos.i--;
    updateCell(pos, gSuperMode ? SUPER_LASER : LASER);
}

function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject;
    var elCell = getElCell(pos);
    elCell.innerHTML = gameObject || '';
}

function checkVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].gameObject === ALIEN) return;
        }
    }
    gameOver();
}

function createAliens(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < gAliens.aliensRowLength; j++) {
            if (i < gAliens.aliensRowCount) {
                board[i][j] = createCell(ALIEN);
            }
        }
    }
}

function gameOver(isGameOver = false) {
    if (!isGameOver) {
        var modalStr =
            'You Save The Universe !  </br> <button class="btn" onclick="resetGame()">Reset Game</button>';
        openModal(modalStr);
        clearInterval(gIntervalAliens);
    } else if (isGameOver) {
        var modalStr =
            'You Lost Our Galaxy ! </br> <button class="btn" onclick="resetGame()">Reset Game</button>';
        openModal(modalStr);
        clearInterval(gIntervalAliens);
        return;
    }
}

function openModal(modalStr) {
    gGame.isOn = false;
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
    elModal.innerHTML = modalStr;
}

function closeModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}

function shiftBoardRight(board, fromI, toI) {
    if (!gGame.isOn) return;
    for (var i = fromI; i <= toI; i++) {
        for (var j = board.length - 1; j >= 0; j--) {
            if (getElCell({ i: i, j: j }).innerText === LASER) {
                console.log('hit');
                gGame.aliensCount--;
                gPoints += 10;
            }
            if (getElCell({ i: i, j: j }).innerText === ALIEN) {
                if (j === board.length - 1) {
                    clearInterval(gIntervalAliens);
                    shiftBoardDown(
                        board,
                        gAliens.gAliensTopRowIdx++,
                        gAliens.gAliensBottomRowIdx++
                    );
                    gIntervalAliens = setInterval(function () {
                        shiftBoardLeft(
                            board,
                            gAliens.gAliensTopRowIdx,
                            gAliens.gAliensBottomRowIdx
                        );
                    }, gAliens.alienSpeed);
                    return;
                }
                updateCell({ i: i, j: j }, '');
                updateCell({ i: i, j: j + 1 }, ALIEN);
            }
        }
    }
    renderBoard(board);
}

function shiftBoardLeft(board, fromI, toI) {
    if (!gGame.isOn) return;
    for (var i = fromI; i <= toI; i++) {
        for (var j = 0; j <= board.length - 1; j++) {
            if (getElCell({ i: i, j: j }).innerText === LASER) {
                console.log('hit');
                gGame.aliensCount--;
                gPoints += 10;
            }
            if (getElCell({ i: i, j: j }).innerText === ALIEN) {
                if (j === 0) {
                    clearInterval(gIntervalAliens);
                    shiftBoardDown(
                        board,
                        gAliens.gAliensTopRowIdx++,
                        gAliens.gAliensBottomRowIdx++
                    );
                    gIntervalAliens = setInterval(function () {
                        shiftBoardRight(
                            board,
                            gAliens.gAliensTopRowIdx,
                            gAliens.gAliensBottomRowIdx
                        );
                    }, gAliens.alienSpeed);
                    return;
                }
                updateCell({ i: i, j: j }, '');
                updateCell({ i: i, j: j - 1 }, ALIEN);
            }
        }
    }
    renderBoard(board);
}

function shiftBoardDown(board, fromI, toI) {
    if (!gGame.isOn) return;
    for (var i = toI; i >= fromI; i--) {
        for (var j = board.length - 1; j >= 0; j--) {
            if (getElCell({ i: i, j: j }).innerText === ALIEN) {
                updateCell({ i: i, j: j }, '');
                updateCell({ i: i + 1, j: j }, ALIEN);
                if (gAliens.gAliensBottomRowIdx === board.length - 2) {
                    gameOver(true);
                }
            }
        }
    }
    renderBoard(board);
}

function moveAliens() {
    gIntervalAliens = setInterval(function () {
        shiftBoardRight(
            gBoard,
            gAliens.gAliensTopRowIdx,
            gAliens.gAliensBottomRowIdx
        );
    }, gAliens.alienSpeed);
}

function resetGame() {
    if (gCurrLevel === 'beg') {
        levels(500, 8, 3, 'beg', 0, 2);
    } else if (gCurrLevel === 'med') {
        levels(300, 9, 4, 'med', 0, 3);
    } else if (gCurrLevel === 'ex') {
        levels(200, 10, 5, 'ex', 0, 4);
    }
    gGame.isOn = false;
    init();
}

function levels(num, length, count, lvlName, tRowIdx, bRowIdx) {
    gGame.isOn = true;
    gPoints = 0;
    document.querySelector('.points').innerText = gPoints;
    gCurrLevel = lvlName;
    gAliens = {
        alienSpeed: num,
        aliensRowLength: length,
        aliensRowCount: count,
        gAliensTopRowIdx: tRowIdx,
        gAliensBottomRowIdx: bRowIdx,
    };
    gGame.isOn = false;
    init();
    createBoard(BOARD_SIZE);
    renderBoard(gBoard);
}

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

function randomStar() {
    var randLocation = getRowRandomEmptyCell(gBoard);
    if (!randLocation) return;
    updateCell({ i: randLocation.i, j: randLocation.j }, STAR);
    setTimeout(function () {
        updateCell({ i: randLocation.i, j: randLocation.j }, '');
    }, 5000);
}

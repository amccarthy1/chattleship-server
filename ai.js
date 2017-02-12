const indexUtils = require("./indexUtils.js");
// This is a simple AI for battleship.

var Mode = {
    HUNT: 0,
    TARGET: 1
}

// holds an object full of spaces that are still available.
var spaces = {};
var mode = Mode.HUNT;
var lastSpace = null;


// in case I have to change the format
function pick(space) {
    delete spaces[space];
    return space;
}

function pickArr(space) {
    var c = indexUtils.toAlphaNum(space[0], space[1]);
    return pick(c);
}

function newGame() {
    for (var row = 0; row < 10; row++) {
        for (var col = 0; col < 10; col++) {
            var coords = indexUtils.toAlphaNum(row, col);
            spaces[coords] = [row, col];
        }
    }
}

// http://stackoverflow.com/a/15106541
var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};

// Pick a random available space.
function hunt() {
    var nextSpace = randomProperty(spaces);
    // update this so we know if we hit it next time
    lastSpace = indexUtils.toRowCol(nextSpace);
    var selected = pick(nextSpace);
    return selected;
}

// DIRECTIONAL HELPERS
function up(coords) {
    if (coords[0] === 0)
        return null;
    return [coords[0] - 1, coords[1]];
} function down(coords) {
    if (coords[0] === 9)
        return null;
    return [coords[0] + 1, coords[1]];
} function left(coords) {
    if (coords[1] === 0)
        return null;
    return [coords[0], coords[1] - 1];
} function right(coords) {
    if (coords[1] === 9)
        return null;
    return [coords[0], coords[1] + 1];
}


function target(board) {
    // try to go up
    debugger;
    var g = lastSpace;
    var hit = board[g[0]][g[1]];
    if (hit === 3) {
        // we sunk it, switch back to hunting
        mode = Mode.HUNT;
        return hunt();
    }
    do {
        g = up(g);
        hit = (g ? board[g[0]][g[1]] : 1);
    } while (hit >= 2); // must be a hit
    // if the first non-hit tile is empty, shoot there
    if (hit === 0) return pickArr(g);
    g = lastSpace; hit = 2;
    do {
        g = right(g);
        hit = (g ? board[g[0]][g[1]] : 1)
    } while (hit >= 2);
    if (hit === 0) return pickArr(g);
    g = lastSpace; hit = 2;
    do {
        g = down(g);
        hit = (g ? board[g[0]][g[1]] : 1)
    } while (hit >= 2);
    if (hit === 0) return pickArr(g);
    g = lastSpace; hit = 2;
    do {
        g = left(g);
        hit = (g ? board[g[0]][g[1]] : 1)
    } while (hit >= 2);
    if (hit === 0) return pickArr(g);
    // something is messed up. Switch to hunt mode
    mode = Mode.HUNT;
    return hunt();
}

function reset() {
    newGame();
    mode = Mode.HUNT;
    lastSpace = null;
}

function choose(board) {
    // check if we hit the last shot.
    debugger;
    if (lastSpace && board[lastSpace[0]][lastSpace[1]] === 2) {
        // Enter target mode and target
        mode = Mode.TARGET;
        return target(board);
    } else {
        return hunt();
    }
}

module.exports = {
    choose: choose,
    reset: reset
};

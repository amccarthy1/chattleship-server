/**
 * [DISCLAIMER] * THIS IS HACKATHON-QUALITY CODE.
 * BY READING THIS SOURCE FILE, YOU UNDERSTAND THAT THIS CODE IS NOT OF
 * PRODUCTION QUALITY, AND WAS WRITTEN IN A 24-HOUR TIMESPAN.
 * IT IS NOT ACTIVELY MAINTAINED.
 * boardState.js
 * Contains objects and functions for manipulating the state of a game of
 *  Battleship.
 *
 */
const indexUtils = require("./indexUtils.js");
const boardgen = require("./randboardgen.js");
const ai = require("./ai.js");

function newBoard() {
    return [
    //   1  2  3  4  5  6  7  8  9 10
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // A
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // B
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // C
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // D
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // E
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // F
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // G
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // H
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // I
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // J
    ];
}

const shiplength = {
    CARRIER: 5,
    BATTLESHIP: 4,
    CRUISER: 3,
    SUBMARINE: 3,
    DESTROYER: 2
}

const phase = {
    SETUP: 0,
    FIRING: 1,
    OVER: 2
}

var currentphase;
var activeplayer;
var winner;

// Ship placements will be done randomly for the computer.
// TODO allow p1 fleet configuration via chat commands

/**
 * Really really useful class that allows bidirectional lookups of where ships
 * are placed on the board. You can lookup the coordinates of a ship, and you
 * can get the ship (if there is one) at given coordinates.
 * Has some helpers for determining if a ship has been sunk or the game has been
 * won.
 * Each player has one ShipPlacements and one Board. Together, they constitute
 * the entire game state.
 */
function ShipPlacements() {
    this.shipToCoords = {};
    this.coordsToShips = {};
    this.lastSpace = null;
    this.sunk = 0;
}


/**
 * Place a ship given some coordinates and an orientation
 * @param {string} shipName The name of the ship in all caps. Acceptable ship
 *  names are: "CARRIER", "BATTLESHIP", "CRUISER", "SUBMARINE", and "DESTROYER"
 * @param {number} row The 0-based row index to put the top-left corner of the
 *  ship at.
 * @param {number} col The 0-based col index to put the top-left corner of the
 *  ship at.
 * @param {string} orientation The orientation (either 'H' for horizontal or
 *  'V' for vertical) to place the ship.
 * @throws {string} Exception An error message if ship location is invalid.
 */
ShipPlacements.prototype.placeShip = function(shipName, row, col, orientation) {
    if (orientation === 'H') {
        this.placeHorizontal(shipName, row, col);
    } else if (orientation === 'V') {
        this.placeVertical(shipName, row, col);
    }
}
ShipPlacements.prototype.placeHorizontal = function(shipName, row, col) {
    var length = shiplength[shipName];
    if (typeof length === 'undefined') {
        throw "Invalid Ship Name";
    }
    if ((col + length > 10) || col < 0 || row < 0 || row > 9) {
        throw "Invalid Ship Placement";
    }
    var spaces = []

    for (var i = 0; i < length; i++) {
        var space = indexUtils.toAlphaNum(row, col+i);
        spaces.push(space);
        if (typeof this.coordsToShips[space] !== "undefined") {
            throw "Conflicting Ship Placement";
        }
    }
    // place the ship, since it doesn't conflict.
    this.shipToCoords[shipName] = spaces;
    for (var i = 0; i < spaces.length; i++) {
        this.coordsToShips[spaces[i]] = shipName;
    }
}
ShipPlacements.prototype.placeVertical = function(shipName, row, col) {
    var length = shiplength[shipName];
    if (typeof length === 'undefined') {
        throw "Invalid Ship Name";
    }
    if ((row + length > 10) || row < 0 || col < 0 || col > 9) {
        throw "Invalid Ship Placement";
    }
    var spaces = []
    for (var i = 0; i < length; i++) {
        var space = indexUtils.toAlphaNum(row+i, col);
        spaces.push(space);
        if (typeof this.coordsToShips[space] !== "undefined") {
            throw "Conflicting Ship Placement";
        }
    }
    // place the ship, since it doesn't conflict.
    this.shipToCoords[shipName] = spaces;
    for (var i = 0; i < spaces.length; i++) {
        this.coordsToShips[spaces[i]] = shipName;
    }
}
ShipPlacements.prototype.fire = function(row, col, board) {
    this.lastSpace = [row, col];
    if (board[row][col] !== 0) {
        return board; // we're firing at a location that's already been fired
    }
    var coords = indexUtils.toAlphaNum(row, col);
    if (typeof this.coordsToShips[coords] === "undefined") {
        // miss
        board[row][col] = 1;
        return board;
    } else {
        var ship = this.coordsToShips[coords];
        board[row][col] = 2;
        this.checkSunk(ship, board);
        return board;
    }
}
ShipPlacements.prototype.checkSunk = function(ship, board) {
    var tiles = this.shipToCoords[ship];
    for (var i = 0; i < tiles.length; i++) {
        var c = indexUtils.toRowCol(tiles[i]);
        if (board[c[0]][c[1]] !== 2) {
            return;
        }
    }
    // ship is sunk, mark with blue
    for (var i = 0; i < tiles.length; i++) {
        var c = indexUtils.toRowCol(tiles[i]);
        board[c[0]][c[1]] = 3; // mark blue
    }
}
ShipPlacements.prototype.isGameWon = function(board) {
    // all ship coords should be non-zero
    for (var coord in this.coordsToShips) {
        if (Object.prototype.hasOwnProperty.call(this.coordsToShips, coord)) {
            var rc = indexUtils.toRowCol(coord);
            var row = rc[0]; var col = rc[1];
            if (board[row][col] === 0) {
                return false;
            }
        }
    }
    return true;
}
ShipPlacements.prototype.debug = function() {
    for (var ship in this.shipToCoords) {
        console.log(ship + ": " + this.shipToCoords[ship]);
    }
}
ShipPlacements.prototype.sinkOne = function() {
    this.sunk++;
}

/**
 * Construct a new ShipPlacements from a json file of coords.
 */
function fromJson(obj) {
    var res = new ShipPlacements();
    for (var key in obj) {
        var stuff = indexUtils.toRowColOrientation(obj[key]);
        var row = stuff[0];
        var col = stuff[1];
        var orientation = stuff[2];
        res.placeShip(key, row, col, orientation);
    }
    return res;
}

var boards = {};
var placements = {};

/**
 * Reset game state, generate new boards.
 */
function newGame() {
    boards.player1 = newBoard();
    boards.player2 = newBoard();
    // TODO randomize
    // placements.player1 = fromJson(p1place);
    placements.player1 = new ShipPlacements();
    placements.player2 = new ShipPlacements();
    boardgen.generate(placements.player1);
    boardgen.generate(placements.player2);
    ai.reset(); // reset AI board state
    currentphase = phase.FIRING;
    activeplayer = 1;
    winner = null;
    return {
        success: true,
        error: null,
        result: null,
        state: asObj()
    };
}

/**
 * Serialize game state as a JSON obj for api consistency.
 */
function asObj() {
    var obj = {};
    obj.boards = {};
    obj.boards.player1 = boards.player1;
    obj.boards.player2 = boards.player2;
    obj.p1last = placements.player1.lastSpace;
    obj.p2last = placements.player2.lastSpace;
    obj.p1sunk = placements.player1.sunk;
    obj.p2sunk = placements.player2.sunk;
    obj.phase = currentphase;
    obj.activeplayer = activeplayer;
    obj.winner = winner;
    return obj;
}

/**
 * helper to convert from alphanumeric row/col to numeric row/col and lookup
 * board square
 */
function boardLookup(board, coords) {
    var rc = indexUtils.toRowCol(coords);
    return board[rc[0]][rc[1]];
}

/**
 * Fire a shot at the given coords on the given player's board
 */
function fire(player, coords) {
    if (player !== activeplayer) {
        throw "It is not your turn";
    }
    var board = boards["player" + player];
    var plcmt = placements["player" + player];
    var oldHitVal = boardLookup(board, coords);
    var rc = indexUtils.toRowCol(coords);
    plcmt.fire(rc[0], rc[1], board);
    var hitValue = boardLookup(board, coords);
    if (hitValue === 3 && oldHitVal !== 3) {
        plcmt.sinkOne();
    }
    var result = [null, "MISS", "HIT", "SUNK"][hitValue];
    if (plcmt.isGameWon(board)) {
        currentphase = phase.OVER;
        winner = player;
    } else {
        // AI turn
        var aicoords = ai.choose(boards.player2);
        var airc = indexUtils.toRowCol(aicoords);
        var aiOldHitVal = boardLookup(boards.player2, aicoords);
        placements.player2.fire(airc[0], airc[1], boards.player2);
        var aiHitVal = boardLookup(boards.player2, aicoords);
        if (aiHitVal === 3 && aiOldHitVal !== 3) {
            placements.player2.sinkOne();
        }
        // DESTROYED by AI
        if (placements.player2.isGameWon(boards.player2)) {
            currentphase = phase.OVER;
            winner = 2;
            // gg
        }
    }
    return {
        success: true,
        error: null,
        result: result,
        state: asObj()
    }
}

module.exports = {
    ShipPlacements: ShipPlacements,
    newGame: newGame,
    fire: fire,
    asObj: asObj
}

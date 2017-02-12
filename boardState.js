const indexUtils = require("./indexUtils.js");

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

// initially, load in ship placements from json files.
// TODO allow fleet configuration via chat commands
var p1place = require("./player1.json");
var p2place = require("./player2.json");

function ShipPlacements() {
    this.shipToCoords = {};
    this.coordsToShips = {};
}
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

/**
 * Construct a new ShipPlacements from a json file of coords
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

function newGame() {
    boards.player1 = newBoard();
    boards.player2 = newBoard();
    // TODO randomize
    placements.player1 = fromJson(p1place);
    placements.player2 = fromJson(p2place);
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

function asObj() {
    var obj = {};
    obj.boards = {};
    obj.boards.player1 = boards.player1;
    obj.boards.player2 = boards.player2;
    obj.phase = currentphase;
    obj.activeplayer = activeplayer;
    obj.winner = winner;
    return obj;
}

function boardLookup(board, coords) {
    var rc = indexUtils.toRowCol(coords);
    return board[rc[0]][rc[1]];
}

function fire(player, coords) {
    if (player !== activeplayer) {
        throw "It is not your turn";
    }
    var board = boards["player" + player];
    var plcmt = placements["player" + player];
    var rc = indexUtils.toRowCol(coords);
    plcmt.fire(rc[0], rc[1], board);
    var result = (boardLookup(board, coords) !== 1 ? "HIT" : "MISS");
    if (plcmt.isGameWon(board)) {
        currentphase = phase.OVER;
        winner = player;
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

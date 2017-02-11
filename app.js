// initially, load in ship placements from json files.
var p1place = require("./player1.json");
var p2place = require("./player2.json");


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
var shiplength = {
    CARRIER: 5,
    BATTLESHIP: 4,
    CRUISER: 3,
    SUBMARINE: 3,
    DESTROYER: 2
}

var phase = {
    SETUP: 0,
    FIRING: 1,
    OVER: 2
}

// rows and columns should be 0-based internally, and 1-based externally
var rows = {
    A:0,
    B:1,
    C:2,
    D:3,
    E:4,
    F:5,
    G:6,
    H:7,
    I:8,
    J:9
}
var cols = [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

var reverseRows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var reverseCols = [ 1 ,  2 ,  3 ,  4 ,  5 ,  6 ,  7 ,  8 ,  9 ,  10];

function toRowCol(coords) {
    var match = coords.match(/\b([A-J])([0-9]|10)\b/);
    if (!match) {
        throw "Could not parse coords";
    }
    var row = rows[match[1]];
    var col = cols[match[2]|0];
    return [row, col];
}

function toRowColOrientation(coords) {
    var match = coords.match(/\b([HV])([A-J])([0-9]|10)\b/);
    if (!match) {
        throw "Could not parse coords";
    }
    var row = rows[match[2]];
    var col = cols[match[3]|0];
    var ori = match[1];
    return [row, col, ori];
}

function toAlphaNum(row, col) {
    var an_row = reverseRows[row];
    var an_col = reverseCols[col];
    return an_row + an_col;
}


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
        var space = toAlphaNum(row, col+i);
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
        var space = toAlphaNum(row+i, col);
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
    var coords = toAlphaNum(row, col);
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
    debugger;
    var tiles = this.shipToCoords[ship];
    for (var i = 0; i < tiles.length; i++) {
        var c = toRowCol(tiles[i]);
        if (board[c[0]][c[1]] !== 2) {
            return;
        }
    }
    // ship is sunk, mark with blue
    for (var i = 0; i < tiles.length; i++) {
        var c = toRowCol(tiles[i]);
        board[c[0]][c[1]] = 3; // mark blue
    }
}
ShipPlacements.prototype.isGameWon = function(board) {
    // all ship coords should be non-zero
    for (var coord in this.coordsToShips) {
        if (Object.prototype.hasOwnProperty.call(this.coordsToShips, coord)) {
            var rc = toRowCol(coord);
            var row = rc[0]; var col = rc[1];
            if (board[row, col] === 0) {
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

var boards = {
    player1: newBoard(),
    player2: newBoard()
};

var placements = {
    player1: new ShipPlacements(),
    player2: new ShipPlacements()
};

function fromJson(obj) {
    var res = new ShipPlacements();
    for (var key in obj) {
        var stuff = toRowColOrientation(obj[key]);
        var row = stuff[0];
        var col = stuff[1];
        var orientation = stuff[2];
        res.placeShip(key, row, col, orientation);
    }
    return res;
}

function newGame() {
    boards.player1 = newBoard();
    boards.player2 = newBoard();
    placements.player1 = fromJson(p1place);
    placements.player2 = fromJson(p2place);
}

debugger;
newGame();
placements.player1.debug();

placements.player1.fire(2, 0, boards.player1);
placements.player1.fire(2, 1, boards.player1);
placements.player1.fire(2, 2, boards.player1);
placements.player1.fire(5, 5, boards.player1);
console.log(boards.player1);

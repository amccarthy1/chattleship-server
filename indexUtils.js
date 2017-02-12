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

module.exports = {
    toRowCol: toRowCol,
    toRowColOrientation: toRowColOrientation,
    toAlphaNum: toAlphaNum
}

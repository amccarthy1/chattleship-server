/**
 * [DISCLAIMER] * THIS IS HACKATHON-QUALITY CODE.
 * BY READING THIS SOURCE FILE, YOU UNDERSTAND THAT THIS CODE IS NOT OF
 * PRODUCTION QUALITY, AND WAS WRITTEN IN A 24-HOUR TIMESPAN.
 * IT IS NOT ACTIVELY MAINTAINED.
 * randboardgen.js
 * Generates fleet configurations by trial-and-error random number generation.
 */
const indexUtils = require("./indexUtils.js");

const shipsToPlace = ["CARRIER", "BATTLESHIP", "CRUISER", "SUBMARINE", "DESTROYER"];

function generate(placement) {
    for (var i = 0; i < shipsToPlace.length; i++) {
        // place a ship
        var placed = false;
        while (!placed) {
            try {
                var row = Math.floor(Math.random()*10);
                var col = Math.floor(Math.random()*10);
                var orientation = (Math.random() <= 0.5 ? "H" : "V");
                placement.placeShip(shipsToPlace[i], row, col, orientation);
                placed = true;
            } catch (exn) {
                // There's a good chance this fails, so we need to catch that.
                console.error(exn);
                // just try again until it's been placed.
            }
        }
    }
    placement.debug();
}

module.exports = {
    generate: generate
};

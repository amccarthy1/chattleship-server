/**
 * [DISCLAIMER] * THIS IS HACKATHON-QUALITY CODE.
 * BY READING THIS SOURCE FILE, YOU UNDERSTAND THAT THIS CODE IS NOT OF
 * PRODUCTION QUALITY, AND WAS WRITTEN IN A 24-HOUR TIMESPAN.
 * IT IS NOT ACTIVELY MAINTAINED.
 * app.js
 * Main server for chattleship. Uses express to expose an HTTP API for game
 *  control. Very stateful. Very bad.
 * Exposes a static board view at /static/view.html. This is the view used by
 *  twitch.tv/chattleship
 */
///////////////////////////////////////////////////////////////////////////////
// call the packages we need
const express    = require('express');        // call express
const app        = express();                 // define our app using express
const bodyParser = require('body-parser');

const boardState = require("./boardState.js");
const indexUtils = require("./indexUtils.js");
const ai = require("./ai.js");

boardState.newGame();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


router.get('/board', function(req, res) {
    res.json({
        success: true,
        error: null,
        result: true,
        state: boardState.asObj()
    });
});

router.post('/fire', function(req, res) {
    var player = req.body.player;
    var coords = req.body.coords;
    try {
        if (player !== 1) {
            throw "You are player 1";
        }
        var obj = boardState.fire(player, coords);
        res.json(obj);
    } catch (err) {
        res.json({
            success: false,
            error: err,
            result: null,
            state: boardState.asObj()
        });
    }
    // TODO Switch players
});

router.post('/reset', function(req, res) {
    res.json(boardState.newGame());
});

app.use('/', router)
// =============================================================================
// host the static view webpage
app.use('/static', express.static("./static"));
app.listen(port);
console.log('ChattleShip API running on port ' + port);

Chattleship Server
==================

A very simple and bad server for playing Battleship.

Send HTTP POST requests to `/fire`
post body should be of this form:
```json
{
  "player": 1,
  "coords": "F7"
}
```



To place a ship in the fleet, send HTTP POST request to `/place`
post body should be of this form:
```json
{
  "coords": "F7",
  "orientation": "h"
}
```
`coords` specifies the top left coordinate of the ship
`orientation` is either `h` for horizontal or `v` for vertical

To look up the board state, send a GET request to `/board`
Response will be of this form:
```json
{
  "player1": {
    "board": [
      [0, 0, 0, 1, 0, 0, 2, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 2, 0, 1, 0],
      ...
      [0, 0, 2, 0, 1, 1, 0, 0, 0, 1]
    ]
  },
  "player2": {
    "board": [
      ...
    ]
  },
  "winner": null
}
```
where `0` is an empty space, `1` is a white marker, and `2` is a red marker.

when the game is over, "winner" will be set to either "player1" or "player2"
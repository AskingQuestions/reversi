# reversi
8 weeks of code Reversi challenge.

## Installing
```
$ git clone https://github.com/AskingQuestions/reversi.git

$ npm install
```

## Testing
I have included a built in tester(`tester.js`) that tests using `tests.json` taken from the 8woc 2018 challenge repo.
```
$ npm test
or
$ node tester.js cli.js
```

## Executing from command-line
You can pipe in a json string and it will pipe out the json formatted board after it has applied the move.
```
$ node cli.js
```

## Usage
``` js
const solver = require("solver.js");

let board = new Reversi.Board(); // Initializes with center cells filled in.
board.applyMove(3, 2, 1);
console.log(board.board); // 2d array of cells.
```

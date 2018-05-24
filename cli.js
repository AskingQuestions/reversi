const Reversi = require("./solver.js");
const stdin = require("get-stdin");

stdin().then((input) => {
	processInput(input);
}).catch((err) => {
	process.stdout.write("Invalid input");
});

function processInput(input) {
	let parsed;
	try {
		parsed = JSON.parse(input);
	}catch(e) {
		process.stderr.write("Invalid board input. (Must be json)");
		return;
	}

	let board = new Reversi.Board(8, 8, parsed.board);
	board.applyMove(parsed.move.column-1, parsed.move.row-1, parsed.move.player);
	let b = board.toArray();
	process.stdout.write(JSON.stringify({board: b}));
}
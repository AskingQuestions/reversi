var Reversi = { // Create our namespace
	black: 1, // Constant team values
	white: 2,

	degToRad: function (degrees) { // Simple helper function to convert degrees to radians
		return degrees / (Math.PI * 180);
	},
	negate: function (state) { // Negates the team
		return state == Reversi.black ? Reversi.white : Reversi.black;
	}
};

Reversi.Board = class ReversiBoard { // This object will contain our board state, as well as any extra helper methods
	constructor(board, height, arr) {
		if (arr) {
			this.board = this.constructor.blankBoard(board, height, arr);
		}else{
			// The member name "board" is questionable if this were used I might choose grid or layout.
			this.board = board || this.constructor.blankBoard(); // board is an optional argument if its not set use a default reversi board
		}
		// NOTE: Each board is stored as -> rows[column] index via board[y][x]
		this.size = {width: this.board[0].length, height: this.board.length};
	}

	/**
	 * @param Number x
	 * @param Number y
	 *
	 * @return Reversi.Cell The cell at position $x, $y
	 */
	getCell(x, y) {
		// Make sure our cords are in range
		if (x > this.size.width - 1 || y > this.size.height - 1 || x < 0 || y < 0)
			throw new Error("Out of board range");

		return this.board[y][x];
	}

	/**
	 * Casts a ray from $x, $y at $angle until it hits $hit and returns the cells it passed.
	 * 
	 * @param {Number[2]} Array [1, 0] rise/run to move ray
	 * @param {Reversi.black} || Reversi.white Team to hit
	 * 
	 * @return {Reversi.Cell[]} List of cells the ray passed through
	 */
	cast(x, y, angle, hit) {
		let rise = angle[1];
		let run = angle[0];

		let current = {x: x, y: y}; // This is our current cell context variable used in the loop.
		let line = new Reversi.Line([], false); // Array of cell refrences used to store the line

		try { // Get first cell
			var baseCell = this.getCell(current.x, current.y);
			if (baseCell && baseCell.state != 0)
				return line;
		}catch(e) {
			return line;
		}

		// Iterate to the maximum length of a ray.
		for (let i = 0; i < this.size.height + this.size.width; i++) {
			current.x += run;
			current.y += rise;
			let cell;

			try { 
				// Using try catch we could implement extenders(plugins) that can cancel a ray(throw)
				// without needing to interface with a custom error class.
				// This is however a bit slower.

				cell = this.getCell(current.x, current.y); // Check the current cell we are pointing at.
				if (cell.state == 0) {
					line.hadHit = false;
					return line;
				}
			} catch(e) {
				return line;
			}

			if (cell.state == hit) {
				line.hadHit = true;
				return line;
			}

			line.cells.push(cell);
		}

		return line;
	}

	/**
	 * @return 1d Array of Number.
	 */
	toArray() {
		var o = new Array(this.size.width * this.size.height);
		var w = this.size.width;
		for (let i = 0; i < w * this.size.height; i++)
			o[i] = this.board[Math.floor(i / w)][i % w].state;
		
		return o;
	}

	/**
	 * Applies a move to this object.
	 * 
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Reversi.Team} hit 
	 * 
	 * @return {Number} Total number of changed cells.
	 */
	applyMove(x, y, hit) {
		try {
			let cell = this.getCell(x, y); // Cast in 8 directions around x, y.
			let lines = this.castLines(x, y, hit);
			var valid = false;
			var valids = 0;

			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line.hadHit) {
					if (line.cells.length > 0)
						valid = true;

					for (let j = 0; j < line.cells.length; j++) {
						valids++;
						line.cells[j].setTeam(hit);
					}
				}
			}

			if (valid)
				cell.setTeam(hit);

			return valids;
		}catch(e) {
			return 0;
		}
	}

	/**
	 * Tests this board against a literal Reversi.Board.board $board
	 * 
	 * @note The board is an Array
	 * 
	 * @param {Reversi.Board.board} board Check board
	 * 
	 * @return {Boolean} true/false if test passed
	 */
	compare(board) {
		var passed = true;
		for (var i = 0; i < board.length; i++) {
			for (var j = 0; j < board[i].length; j++) {
				if (board[i][j] != this.board[i][j])
					passed = true;
			}
		}

		return passed;
	}

	/**
	 * Returns a map(anon object) of each team's cell count.
	 * 
	 * @example board.cellCount() => {1: 10, 2: 5}
	 */
	countCells() {
		var counts = {};
		for (var i = 0; i < this.board.length; i++)
			for (var j = 0; j < this.board[i].length; j++) {
				if (!(this.board[i][j].state in counts))
					counts[this.board[i][j].state] = 0;
				counts[this.board[i][j].state]++;
			}
		return counts;
	}

	/**
	 * Casts 8 lines.
	 * 
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} hit
	 * 
	 * @return {Reversi.Line[]} Array of 8 Reversi.Line
	 */
	castLines(x, y, hit) {
		const angles = {
			n: [0, 1],
			ne: [1, 1],
			e: [1, 0],
			se: [1, -1],
			s: [0, -1],
			sw: [-1, -1],
			w: [-1, 0],
			nw: [-1, 1],
		};
		
		var lines = [];

		for (let a in angles) {
			lines.push(this.cast(x, y, angles[a], hit));
		}

		return lines;
	}

	static blankBoard(w, h, fill) { // Generates a blank board and fills the center
		w = w || 8;
		h = h || 8;

		let board = [];
		let offset = 0;
		for (let i = 0; i < w; i++) {
			board.push([]);
			for (let j = 0; j < h; j++) {
				board[i].push(new Reversi.Cell(0, j, i)); // Cell state defaults to empty
				if (typeof fill == "object") {
					board[i][board[i].length-1].state = fill[offset];
				}
				offset++;
			}
		}

		if (!fill) {
			board[w/2][h/2].setTeam(Reversi.black);
			board[w/2][h/2 - 1].setTeam(Reversi.white);
			board[w/2 - 1][h/2].setTeam(Reversi.white);
			board[w/2 - 1][h/2 - 1].setTeam(Reversi.black);
		}

		return board;
	}
}; 

Reversi.Cell = class ReversiCell {
	constructor(state, x, y) {
		this.state = state || 0;
		this.x = x;
		this.y = y;
	}

	flip() { // Sets ownership to the other team //NOTE: In multi team games this does not work
		this.state = Reversi.negate(this.state);
	}

	setTeam(t) {
		this.state = t;
	}

	clear() {
		this.state = 0;
	}
};

Reversi.Line = class ReversiLine {
	constructor(cells, hit) {
		this.cells = cells;
		this.hadHit = hit;
	}
};

if (typeof module != "undefined")
	module.exports = Reversi;
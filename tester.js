const fs = require("fs");
const execFile = require('child_process').execFile;
const stream = require('stream');

const tests = JSON.parse(fs.readFileSync("./tests.json", "utf8"));

function runTest(test, name) {
	let child = execFile("node", [process.argv[process.argv.length - 1]], function (err, stdout, stderr) {
		let out = JSON.parse(stdout);
		let yes = true;
		for (let i = 0; i < out.board.length; i++)
			if (test.expected.board[i] != out.board[i])
				yes = false;
		if (yes)
			console.log("Passed test " + name);
		else console.log("Failed test " + name);
	});

	var stdinStream = new stream.Readable();
	stdinStream.push(JSON.stringify(test.input));
	stdinStream.push(null);
	stdinStream.pipe(child.stdin);
}

let i = 0;
for (let test of tests) {
	i++;
	runTest(test, "#" + i);
}
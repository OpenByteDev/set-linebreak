const process = require('process');
const path = require('path');
const fs = require('fs');
const fsa = fs.promises;


async function main() {
	const args = process.argv.slice(2);
	const linebreak = args.length > 0 ? args[0].toLowerCase() : 'crlf';
	if (linebreak !== 'crlf' && linebreak !== 'lf')
		return console.error('Invalid linebreak specified: ' + linebreak);

	const dir = args.length > 1 ? args[1].toLowerCase() : '.';
	const stats = await fsa.stat(dir);
	if (!stats.isDirectory())
		return console.error('Invalid directory specified: ' + dir);
	
	return run(dir, linebreak);
}

async function run(dir, linebreak) {
	const files = await fsa.readdir(dir);
	for (file of files) {
		const p = path.join(dir, file);
		const stats = await fsa.stat(p);
		if (stats.isDirectory())
			await run(p, linebreak);
		else await exec(p, linebreak)
	}
}

async function exec(path, linebreak) {
	const buffer = await fsa.readFile(path);
	let content = buffer.toString();
	if (linebreak === 'crlf')
		content = content.replace(/\r?\n/g, "\r\n");
	else if (linebreak  === 'lf')
		content = content.replace(/\r\n/g, "\n");
	else throw new Error('Unexpected value encountered');
	await fsa.writeFile(path, content);
}


main();

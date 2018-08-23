const process = require('process');
const path = require('path');
const ignore = require('ignore');
const fs = require('fs');
const fsa = fs.promises;


async function main() {
	const args = process.argv.slice(2);
	const linebreak = args.length > 0 ? args[0].toLowerCase() : 'crlf';
	if (linebreak !== 'crlf' && linebreak !== 'lf')
		return console.error('Invalid linebreak specified: ' + linebreak);

	const dir = args.length > 1 ? args[1].toLowerCase() : '.';
	const dirStats = await fsa.stat(dir).catch(() => null);;
	if (dirStats === null || !dirStats.isDirectory())
		return console.error('Invalid directory specified: ' + dir);
	
	let ig = ignore().add(['.git', 'node_modules']);
	const ignoreFile = args.length > 2 ? args[2].toLowerCase() : null;
	if (ignoreFile !== null) {
		const ignoreFileStats = await fsa.stat(ignoreFile).catch(() => null);
		if (ignoreFileStats === null || ignoreFileStats.isDirectory())
			return console.error('Invalid ignore specified: ' + ignoreFile);
		const ignoreBuffer = await afs.readFile(ignoreFile);
		const ignoreContents = ignoreBuffer.toString();
		ig = ig.add(ignoreContents);
	}
	
	return run(dir, linebreak, ig);
}

async function run(dir, linebreak, ig) {
	const files = await fsa.readdir(dir);
	for (file of files) {
		if (ig.ignores(file))
			continue;
		const p = path.join(dir, file);
		const stats = await fsa.stat(p);
		if (stats.isDirectory())
			await run(p, linebreak, ig);
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

var fs = require('fs');
var { spawn } = require('child_process');

var isFullBuild = process.argv.includes('--full');
process.argv = process.argv.filter(arg => arg != '--full');

var isWatch = process.argv.includes('--watch');
process.argv = process.argv.filter(arg => arg != '--watch');

var isRelease = process.argv.includes('--release') || isFullBuild;
process.argv = process.argv.filter(arg => arg != '--release');

var isActions = process.argv.includes('--actions');
process.argv = process.argv.filter(arg => arg != '--actions');

var firstRun = true;

function startChild() {
	console.log('Starting build process...');

	var args = process.argv.slice(2);

	if(isFullBuild) {
		args.push('--full');
	}
	if(isWatch) {
		args.push('--watch');
	}
	if(isRelease) {
		args.push('--release');
	}
	if(firstRun) {
		args.push('--first-run');
		firstRun = false;
	}
	if(isActions) {
		args.push('--actions');
	}

	child = spawn('node', ['src/build.js', ...args], {
		stdio: 'inherit'
	});

	child.on('exit', function (code) {
		if(isWatch) {
			console.log("Watching for file changes... Press Ctrl+C to stop.");
		}
	});
}

function restartChild() {
	if (child) {
		console.log('Restarting build process...');
		child.kill();
	}
	startChild();
}

startChild();

if (isWatch) {
	var watchDirs = [
		'./featured-mods/',
		'./src/',
		// './api-generator/theme/',
		'./donators.json',
		'./tools/',
		'./wiki/'
	];

	for(const dir of watchDirs) {
		fs.watch(dir, { recursive: true }, (eventType, filename) => {
			if (filename) {
				console.log(`${filename} changed. Rebuilding...`);
				restartChild();
			}
		});
	}

	setInterval(() => {}, 1000);
}
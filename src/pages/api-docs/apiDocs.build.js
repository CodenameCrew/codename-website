var { getGlobals } = require("../../utils.js");
var path = require("path");
var fs = require('fs');
const { execSync } = require('child_process');

var { fixHtmlRefs, copyDir, parseTemplate, compileJs, htmlToString, compileSass } = require("../../utils.js");
var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8')

const apiGenerator = path.join(__dirname, "..", "..", '..', 'api-generator');

function alwaysRun(exportPath) {
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	var prevPath = path.join(exportPath, "..");
	compileJs("./src/pages/api-docs/resources/highlighter.js", exportPath + "highlighter.js");
	compileJs("./src/pages/api-docs/resources/index.js", exportPath + "index.js");
	compileSass("./src/pages/api-docs/resources/api-docs.scss", prevPath + "/api-docs.css");
}

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "api-docs/";
	var exportPath = _exportPath + "api-docs/";
	alwaysRun(exportPath);
	console.log("Building Api Docs");
	console.log("Using api generator at " + apiGenerator);

	var { isActions } = getGlobals();

	//if(isWatch) {
		// build with haxe
		var args = [
			"haxe",
			"dox.hxml",
		];
		if(isActions) {
			args.push("--define ACTIONS");
		}
		execSync(args.join(" "), {cwd: apiGenerator}, function(error, stdout, stderr) {
			console.log(stdout);
		});
	//} else {
	//	// build with neko
	//	execSync("neko bin/main.n", {cwd: apiGenerator}, function(error, stdout, stderr) {
	//		console.log(stdout);
	//	});
	//}

	//copyDir("./src/pages/api-docs/", exportPath);
}

function buildNotBuilt(_pageDir, _exportPath) {
	var pageDir = _pageDir + "api-docs/";
	var exportPath = _exportPath + "api-docs/";
	alwaysRun(exportPath);

	var html = fs.readFileSync("./src/pages/api-docs/not-built.html", 'utf8');
	html = parseTemplate(html, {
		title: "API Docs",
		header: header
	});
	let doc = fixHtmlRefs(html, pageDir, _pageDir);
	fs.writeFileSync(exportPath + "/index.html", htmlToString(doc), 'utf8');
}

module.exports = {
	buildHtml: buildHtml,
	buildNotBuilt: buildNotBuilt,
	alwaysRun: alwaysRun
}
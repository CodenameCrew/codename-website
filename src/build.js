var fs = require('fs');
var hljs = require('highlight.js');
var haxeFormat = require('./syntax/haxeFormat.js');
var wiki = require('./pages/wiki.build.js');
var tools = require('../tools/tools.build.js');
var apiDocs = require('./pages/api-docs/apiDocs.build.js');
var indexPage = require('./pages/index.build.js');
var sitemap = require("./sitemap.build.js");
var notFound = require("./pages/404.build.js");

var { copyDir, compileSass, compileJs, setGlobals } = require('./utils.js');

var isFullBuild = process.argv.includes('--full');
process.argv = process.argv.filter(arg => arg != '--full');

var isWatch = process.argv.includes('--watch');
process.argv = process.argv.filter(arg => arg != '--watch');

var isFirstRun = process.argv.includes('--first-run');
process.argv = process.argv.filter(arg => arg != '--first-run');

var isRelease = process.argv.includes('--release') || isFullBuild;
process.argv = process.argv.filter(arg => arg != '--release');

var isActions = process.argv.includes('--actions');
process.argv = process.argv.filter(arg => arg != '--actions');

setGlobals({isFullBuild, isWatch, isFirstRun, isRelease, isActions});

hljs.registerLanguage('haxe', haxeFormat);

var pageDir = process.argv[2] || "./";
var exportPath = "./export/" + (process.argv[3] || '');

if(!pageDir.endsWith('/')) pageDir += '/';
if(!exportPath.endsWith('/')) exportPath += '/';

if (!fs.existsSync(exportPath)) {
	fs.mkdirSync(exportPath, {recursive: true});
}

console.log("Building pages...");

copyDir("./src/img/", exportPath + "/img/");

compileSass("./src/style.scss", exportPath + "/style.css");
compileSass("./src/pages/wiki.scss", exportPath + "/wiki.css");
compileSass("./src/pages/index.scss", exportPath + "/index.css");
compileSass("./src/giscus-theme.scss", exportPath + "/giscus-theme.css");
compileSass("./src/pages/ko-fi.scss", exportPath + "/ko-fi.css");
compileSass("./tools/tools.scss", exportPath + "/tools.css");

compileJs("./src/pages/featuredMods.js", exportPath + "/featuredMods.js");
compileJs("./src/pages/wiki.js", exportPath + "/wiki.js");

copyDir("./src/toplevel/", exportPath + "/");

indexPage.buildHtml(pageDir, exportPath); // builds into /
tools.buildHtml(pageDir, exportPath); // builds into /tools
wiki.buildHtml(pageDir, exportPath); // builds into /wiki
notFound.buildHtml(pageDir, exportPath); // builds into /404.html
if(isFirstRun) {
	if(isFullBuild) {
		apiDocs.buildHtml(pageDir, exportPath); // builds into /api-docs
	} else {
		console.log("Skipping API Docs build (not full build)...");
		apiDocs.buildNotBuilt(pageDir, exportPath); // builds into /api-docs
	}
} else {
	apiDocs.alwaysRun(exportPath + "/api-docs/");
}

if(isFirstRun && isFullBuild) {
}
sitemap.buildFile(pageDir, exportPath); // builds into /sitemap.xml

console.log("Build completed.");
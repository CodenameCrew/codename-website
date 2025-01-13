var fs = require("fs");
var path = require("path");
var Handlebars = require("handlebars");

var { fixHtmlRefs, parseHtml, htmlToString } = require("./utils.js");

const DO_PRIO = false;

function buildFile(pageDir, exportPath) {
	const root = "https://codename-engine.com/";

	console.log("Building sitemap...");

	const hideUrls = [
		"tools/", // hiding it until its done
		"mods/",
		"404.html",
		"featured-mods/",
		"api-docs/",
		"api-docs/404.html"
	]

	var forcePrio = {
		"/": 1,
		"/wiki/": 0.8,
		"/api-docs/": 0.8,
		"/wiki/troubleshooting.html": 0.7,
		"/wiki/faq.html": 0.7,
	}

	var files = fs.readdirSync(exportPath, {recursive: true});
	var foundLinks = {};
	/*if(DO_PRIO) {
		for(const file of files) {
			if(file.startsWith(".")) continue;
			if(!file.endsWith(".html")) continue;
			var shouldSkip = false;
			for(const hideUrl of hideUrls) {
				if(file.startsWith(hideUrl)) {
					shouldSkip = true;
					break;
				}
			}
			if(shouldSkip) continue;
			if(fs.statSync(exportPath + "/" + file).isDirectory()) continue;
			//if(file.startsWith("api-docs/")) continue;
			//if(extRegex.test(file)) continue;

			var data = fs.readFileSync(exportPath + "/" + file);
			var dirName = path.dirname(file);

			let foundLinksThisFile = new Set();

			var parsedHtml = parseHtml(data);
			const links = parsedHtml.window.document.querySelectorAll("a[href]");
			const HASH_REGEX = /#.*$/g;
			const GET_REGEX = /\?.*$/g;
			for(const link of links) {
				var href = link.href;
				if(href.startsWith("about:blank#")) continue;
				if(href.startsWith("#")) continue;
				if(href.startsWith("http")) {
					if(!href.startsWith(root)) continue;
					href = href.replace(root, "");
				}
				if(href.startsWith(".")) {
					href = "/" + path.join(dirName, href);
				}
				if(!href.startsWith("/")) {
					href = "/" + path.join(dirName, href);
				}
				if(href.includes("#")) {
					href = href.replace(HASH_REGEX, "");
				}
				if(href.includes("?")) {
					href = href.replace(GET_REGEX, "");
				}
				if(href.endsWith("index.html")) {
					href = href.replace("index.html", "");
				}
				if(href.includes("api-docs/funkin/funkin")) {
					href = href.replace("api-docs/funkin/funkin", "api-docs/funkin");
				}
				if(foundLinksThisFile.has(href)) continue;
				foundLinksThisFile.add(href);
				if(!foundLinks[href]) {
					foundLinks[href] = 1;
				} else {
					foundLinks[href]++;
				}
			}
		}
	} else {*/
	for(let file of files) {
		if(file.startsWith(".")) continue;
		if(!file.endsWith(".html")) continue;
		var shouldSkip = false;
		for(const hideUrl of hideUrls) {
			if(file.startsWith(hideUrl)) {
				shouldSkip = true;
				break;
			}
		}
		if(shouldSkip) continue;
		if(fs.statSync(exportPath + "/" + file).isDirectory()) continue;

		file = file.replace("index.html", "");

		foundLinks["/" + file] = 1;
	}
	//}
	var total = 0;
	for(const link in foundLinks) {
		if(forcePrio[link]) {
			//foundLinks[link] = 0;
		} else {
			total += foundLinks[link];
		}
	}

	var curTime = new Date(Date.now()).toISOString();

	var prioList = [];
	for(const link in foundLinks) {

		var prio = 0.5;
		if(forcePrio[link])
			prio = forcePrio[link];
		else {
			if(link.startsWith("/wiki/"))
				prio = 0.65;
			else if(link.endsWith("/"))
				prio = 0.6;
		}
		prioList.push({
			link: (root + link).replace(/\/\//g, "/").replace(/^(https?):\/+/g, "$1://"),
			prio: prio,
			//prio: forcePrio[link] ?? (foundLinks[link] / total),
			//time: curTime
		});
	}

	prioList.sort((a, b) => b.prio - a.prio);

	var template = fs.readFileSync("./src/sitemap.template.xml", 'utf8');
	var sitemap = Handlebars.compile(template)({
		links: prioList.map(link => ({
			link: link.link.replace(/\.html$/, ""),
			prio: link.prio
		})),
		root: root
	});

	fs.writeFileSync("./export/sitemap.xml", sitemap);

	var indexNow = {
		"host": "codename-engine.com",
		"key": "6662987d066b4c09b12a50964d0f47bf",
		"keyLocation": "https://codename-engine.com/6662987d066b4c09b12a50964d0f47bf.txt",
		"urlList": prioList.map(link => link.link.replace(/\.html$/, ""))
	}

	fs.writeFileSync("./IndexNow.json", JSON.stringify(indexNow, null, "\t"));

	console.log("Made sitemap.xml");
}

module.exports = {
	buildFile: buildFile
}
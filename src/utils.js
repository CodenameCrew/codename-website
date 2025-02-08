var jsdom = require("jsdom");
var Handlebars = require('handlebars');
const createDOMPurify = require('dompurify');
var path = require("path");
var hljs = require('highlight.js');
var fs = require('fs');
var sass = require('sass');
var CleanCSS = require('clean-css');
var Terser = require('terser');

var isFullBuild = false;
var isWatch = false;
var isFirstRun = false;
var isRelease = false;
var isActions = false;

function setGlobals(data) {
	isFullBuild = data.isFullBuild;
	isWatch = data.isWatch;
	isFirstRun = data.isFirstRun;
	isRelease = data.isRelease;
	isActions = data.isActions;
}

function getGlobals() {
	return {isFullBuild, isWatch, isFirstRun, isRelease, isActions};
}

function fixPath(url) {
	return url.replaceAll(path.sep, path.posix.sep);
}

function parseHtml(html) {
	return new jsdom.JSDOM(html);
}

function htmlToString(html) {
	var str = html.serialize();
	str = str.replace(/href="about:blank#/g, "href=\"#");
	str = str.replace(/\<h2\>\<\/h2>/g, "");
	return str;
}

function fixHtmlRefs(html, pageDir, _pageDir) {
	var dom = new jsdom.JSDOM(html);
	var links = dom.window.document.querySelectorAll("[href]");
	var imageSrcs = dom.window.document.querySelectorAll("[src]");
	var imageSrcsets = dom.window.document.querySelectorAll("[srcset]");

	function changeTagName(el, tag) {
		const newElement = dom.window.document.createElement(tag);

		for (const { name, value } of el.attributes) {
			newElement.setAttribute(name, value);
		}

		while (el.firstChild) {
			newElement.appendChild(el.firstChild);
		}

		el.parentNode.replaceChild(newElement, el);

		return newElement;
	}

	for(const link of links) {
		if(link.href == "#") continue;

		var href = link.href;

		href = fixPath(href);
		href = href.replace(/\.md$/, ".html").replace("./" + pageDir, "./");
		if(href.startsWith("/")) {
			href = path.normalize("/" + pageDir + href.substring(1));
		}
		if(href.startsWith("root/")) {
			href = path.normalize("/" + _pageDir + href.substring(5));
		}
		href = href.replace(/\.force-md$/, "");
		href = fixPath(href);
		if(isActions) {
			href = href.replace(/\.html$/, "");
		}

		link.href = href;
	}

	for(const image of imageSrcs) {
		if(image.src == "#") continue;

		var src = image.src;

		src = fixPath(src);
		src = src.replace(/\.md$/, ".html").replace("./" + pageDir, "./");
		if(src.startsWith("/")) {
			src = path.normalize("/" + _pageDir + src.substring(1));
		}
		if(src.startsWith("root/")) {
			src = path.normalize("/" + _pageDir + src.substring(5));
		}
		src = src.replace(/\.force-md$/, "");
		src = fixPath(src);
		if(isActions) {
			href = href.replace(/\.html$/, "");
		}
		image.src = src;
	}

	for(const image of imageSrcsets) {
		if(image.src == "#") continue;

		var src = image.srcset;

		src = fixPath(src);
		src = src.replace(/\.md$/, ".html").replace("./" + pageDir, "./");
		if(src.startsWith("/")) {
			src = path.normalize("/" + _pageDir + src.substring(1));
		}
		if(src.startsWith("root/")) {
			src = path.normalize("/" + _pageDir + src.substring(5));
		}
		src = src.replace(/\.force-md$/, "");
		src = fixPath(src);
		if(isActions) {
			href = href.replace(/\.html$/, "");
		}
		image.srcset = src;
	}

	var codeblocks = dom.window.document.querySelectorAll('pre code[class^="language-"]');
	for(const codeblock of codeblocks) {
		codeblock.innerHTML = hljs.highlight(codeblock.textContent, {language: codeblock.className.split("-")[1]}).value;
		codeblock.parentElement.classList.add("hljs");
	}

	// select all non hljs codeblocks
	var inlineCodeblocks = dom.window.document.querySelectorAll('code:not([class^="language-"])');
	for(const codeblock of inlineCodeblocks) {
		if(codeblock.classList.contains("no-inline")) {
			codeblock.classList.remove("no-inline");
			continue;
		}
		codeblock.classList.add("inline-code");
	}

	var inlineCodeblocks = dom.window.document.querySelectorAll('pre code:not([class^="language-"])');
	for(const codeblock of inlineCodeblocks) {
		if(codeblock.parentElement.classList.contains("no-inline")) {
			codeblock.parentElement.classList.remove("no-inline");
			continue;
		}
		codeblock.parentElement.classList.add("inline-code");
	}

	var inlineSyntaxBlocks = dom.window.document.querySelectorAll('syntax');
	for(let codeblock of inlineSyntaxBlocks) {
		codeblock = changeTagName(codeblock, "code");
		codeblock.classList.add("inline-syntax", "inline-code");

		var format = codeblock.getAttribute("lang");
		codeblock.removeAttribute("lang");

		if(format != null)
			codeblock.innerHTML = hljs.highlight(codeblock.textContent, {language: format}).value;
	}

	return dom
}

function copyDir(src, dest) {
	// Check if the source exists
	if (!fs.existsSync(src)) {
		console.error(`Source directory ${src} does not exist`);
		return;
	}

	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	const items = fs.readdirSync(src);

	for (let item of items) {
		let srcPath = path.join(src, item);
		let destPath = path.join(dest, item);

		srcPath = fixPath(srcPath);
		destPath = fixPath(destPath);

		const stats = fs.statSync(srcPath);
		if (stats.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			if(isRelease) {
				if(item.endsWith(".js")) {
					compileJs(srcPath, destPath);
				} else if(item.endsWith(".css")) {
					compileCss(srcPath, destPath);
				} else if(item.endsWith(".scss")) {
					compileSass(srcPath, destPath);
				} else {
					fs.copyFileSync(srcPath, destPath);
				}
			} else {
				fs.copyFileSync(srcPath, destPath);
			}
		}
	}
}

async function compileJs(file, dest) {
	try {
		fs.unlinkSync(dest + ".map");
	} catch (e) {}
	if(isRelease) {
		var content = fs.readFileSync(file, 'utf8');

		var cleanFile = file.replace(/\.js$/, ".uncompressed.js");
		var filename = path.basename(file);
		var cleanFilename = path.basename(cleanFile);
		var result = await Terser.minify({
			[cleanFilename]: content
		}, {
			compress: {
				ecma: 2015,
				keep_fargs: false,
				passes: 10,
				unsafe_arrows: true
			},
			sourceMap: {
				includeSources: true,
				//root: path.dirname(file),
				filename: cleanFilename,
				url: filename + ".map"
			}
		});
		if(result.error) {
			console.error(result.error);
			console.error("Error minifying file: " + file);
			console.error("Skipping...");
			fs.copyFileSync(file, dest);
			return;
		}
		fs.writeFileSync(dest, result.code);
		fs.writeFileSync(dest + ".map", result.map);
		return;
	}
	fs.copyFileSync(file, dest);
}

Handlebars.registerHelper('formatDate', function(date) {
	var date = new Date(date);

	var year = date.getUTCFullYear();
	var month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
	var day = ('0' + date.getUTCDate()).slice(-2);
	var hours = ('0' + date.getUTCHours()).slice(-2);
	var minutes = ('0' + date.getUTCMinutes()).slice(-2);
	var seconds = ('0' + date.getUTCSeconds()).slice(-2);

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});

Handlebars.registerHelper('shortDate', function(date) {
	var date = new Date(date);

	var year = date.getUTCFullYear();
	var month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
	var day = ('0' + date.getUTCDate()).slice(-2);

	return `${year}-${month}-${day}`;
});

Handlebars.registerHelper('isoDate', function(date) {
	if(!date) return date;
	var date = new Date(date);
	return date.toISOString();
});

Handlebars.registerHelper('safe', function(str) {
	return new Handlebars.SafeString(str);
});
Handlebars.registerHelper('safeish', function(str) {
	const window = new jsdom.JSDOM('').window;
	const DOMPurify = createDOMPurify(window);
	DOMPurify.setConfig({
		ADD_TAGS: ['code', 'pre', 'syntax']
	});
	DOMPurify.addHook("afterSanitizeAttributes", (node) => {
		const { attributes } = node;
		if (!attributes  || attributes.length < 2)
		  return;
		// No need to switch the last one.
		for (let l = attributes.length - 2; l >= 0; l--) {
		  const attr = attributes[l];
		  const { name, value } = attr;
		  node.removeAttribute(name);
		  node.setAttribute(name, value);
		}
	});

	return new Handlebars.SafeString(DOMPurify.sanitize(str));
});

Handlebars.registerHelper('parse', function(html) {
	return parseTemplate(html, this);
});


function parseTemplate(html, vars) {
	let old;
	// Parse nested templates
	//do {
	//	old = html;
	//	html = Handlebars.compile(html)(vars);
	//} while(html != old);
	html = Handlebars.compile(html)(vars);

	return html;
}

function compileSass(file, dest) {
	var result = sass.compileString(fs.readFileSync(file, 'utf8'), {
		importers: [{
			canonicalize(url) {
				if (!url.endsWith('.scss')) return null;
				if (!url.startsWith('root/')) return null;
				return new URL("file:///" + url.substring(5));
			},
			load(canonicalUrl) {
				if (!canonicalUrl.pathname.endsWith('.scss')) return null;

				var filePath = "./" + path.join("./src", canonicalUrl.pathname);

				//console.log(canonicalUrl.pathname, canonicalUrl);
				//console.log(filePath);

				//console.log(fs.existsSync(filePath));
				if (!fs.existsSync(filePath)) return null;

				return {
					contents: fs.readFileSync(filePath, 'utf8'),
					syntax: 'scss'
				};
			}
		}]
	});
	if(isRelease) {
		result.css = new CleanCSS({
			level: 2
		}).minify(result.css).styles;
	}
	fs.writeFileSync(dest, result.css);
}

function compileCss(file, dest) {
	var content = fs.readFileSync(file, 'utf8');
	if(isRelease) {
		content = new CleanCSS({
			level: 2
		}).minify(content).styles;
	}
	fs.writeFileSync(dest, content);
}

module.exports = {
	setGlobals: setGlobals,
	getGlobals: getGlobals,
	fixPath: fixPath,
	fixHtmlRefs: fixHtmlRefs,
	copyDir: copyDir,
	parseTemplate: parseTemplate,
	compileSass: compileSass,
	compileJs: compileJs,
	parseHtml: parseHtml,
	htmlToString: htmlToString,
}
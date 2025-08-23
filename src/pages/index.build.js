var fs = require('fs');

var { fixHtmlRefs, copyDir, parseTemplate, htmlToString } = require("../utils.js");

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8');
var footer = fs.readFileSync("./src/pages/templates/footer.html", 'utf8');
var donatorsData = JSON.parse(fs.readFileSync("./donators.json", 'utf8'));

function sortByTime(a, b) {
	var aTime = a.lastUpdated;
	var bTime = b.lastUpdated;

	if (aTime == null) return 1;           // Push null to the bottom
	if (bTime == null) return -1;
	if (aTime === "unreleased") return 1;  // Push "unreleased" to the bottom
	if (bTime === "unreleased") return -1;
	if (aTime === "unknown") return 1;     // Push "unknown" to the bottom
	if (bTime === "unknown") return -1;

	var aDate = new Date(aTime).getTime();
	var bDate = new Date(bTime).getTime();

	if (aDate === bDate) return 0;
	return bDate > aDate ? 1 : -1;
}

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "/";
	var exportPath = _exportPath + "/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Index Page");

	var warnings = [];

	var mods = [];
	var links = {};
	var modsDir = "./featured-mods/";
	var files = fs.readdirSync(modsDir);
	for(const file of files) {
		if(file.startsWith(".")) continue;
		if(!fs.existsSync(modsDir + file + "/meta.json")) continue;
		var meta = JSON.parse(fs.readFileSync(modsDir + file + "/meta.json", 'utf8'));

		let modExport = exportPath + "featuredMods/" + file;

		if(!fs.existsSync(modExport)) fs.mkdirSync(modExport, { recursive: true });

		var imageExt = null;
		if(fs.existsSync(modsDir + file + "/cover.jpg")) {
			imageExt = "jpg";
		}
		else if(fs.existsSync(modsDir + file + "/cover.jpeg")) {
			imageExt = "jpeg";
		}
		else if(fs.existsSync(modsDir + file + "/cover.png")) {
			imageExt = "png";
		}
		else if(fs.existsSync(modsDir + file + "/cover.webp")) {
			imageExt = "webp";
		}

		var imgLink;

		if(imageExt == null) {
			//warnings.push("No cover image found for mod: " + meta.name);
			imgLink = "img/missing.png";
		} else {
			fs.copyFileSync(modsDir + file + "/cover." + imageExt, modExport + "/cover." + imageExt);
			imgLink = "./featuredMods/" + file + "/cover." + imageExt;
		}

		if(meta.link != null && meta.link != "") {
			if(links[meta.link]) {
				warnings.push("Duplicate link: " + meta.link + " (mod: " + meta.name + " and " + links[meta.link] + ")");
			}
			links[meta.link] = meta.name;
		}

		var tags = meta.tags ?? [];

		mods.push({
			name: meta.name,
			description: meta.description,
			image: imgLink,
			link: meta.link,
			tags: tags,
			tagsRaw: (tags).join(","),
			author: meta.author,
			source: meta.source,
			version: meta.version,
			lastUpdated: meta.lastUpdated ?? "unknown",
			unreleased: tags.includes("upcoming"),
			premium: tags.includes("premium")
		});
	}

	mods.sort(sortByTime);
	//mods.sort((a, b) => a.name.localeCompare(b.name));

	var members = [];
	var donators = [];
	for(const donator of donatorsData.donators) {
		var obj = {
			name: donator.name,
			profilePicture: donator.profilePicture,
			hasMembership: donator.hasMembership,
			donations: []
		};
		var amounts = {};
		var usd = 0.0;
		for(const donation of donator.donations) {
			obj.donations.push({
				amount: donation.amount,
				currency: donation.currency,
				type: donation.type
			});
			amounts[donation.currency] = (amounts[donation.currency] ?? 0) + donation.amount;

			usd += donation.usdAmount ?? donation.amount;
		}

		var amountString = [];
		for(const currency in amounts) {
			amountString.push(amounts[currency] + " " + currency);
		}
		amountString = amountString.join(", ");

		var siteObj = {
			name: donator.name,
			profilePicture: donator.profilePicture,
			amount: usd + " $",//amountString,
			totalAmount: usd,
			hasMembership: obj.hasMembership
		};
		donators.push(siteObj);
		if(donator.hasMembership) {
			members.push(siteObj);
		}
	}

	donators.sort((a, b) => b.totalAmount - a.totalAmount);

	var path = "./src/pages/index.html";
	var outPath = exportPath + "index.html";
	var templatePage = fs.readFileSync(path, 'utf8');
	var vars = {
		pageTitle: "Home",
		title: "Home",
		header: header,
		footer: footer,
		mods: mods,
		warnings: warnings,
		donators: donators,
		members: members,
		hasMembers: members.length > 0
	};

	let html = parseTemplate(templatePage, vars);

	var dom = fixHtmlRefs(html, pageDir, _pageDir);

	//console.log(data);
	fs.writeFileSync(
		outPath,
		htmlToString(dom),
		'utf8'
	);
}

module.exports = {
	buildHtml: buildHtml
}
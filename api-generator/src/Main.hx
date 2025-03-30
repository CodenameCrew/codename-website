package;

import dox.Api;
import dox.Config;
import dox.Dox;
import haxe.rtti.CType.TypeInfos;
import sys.io.File;
import sys.io.File;
import haxe.Json;
import haxe.rtti.CType;

using StringTools;

class Main {
	public static var defines:Map<String, String>;

	static function main() {
		/*defines = [
			for (line in File.getContent("../xml/bin/defines.txt").split("\n")) {
				var parts = ~/ /.split(line);
				parts[0] => parts[1];
			}
		];*/

		// Generate doc-filter.xml if it exists
		if(sys.FileSystem.exists("api/doc.xml")) {
			var cwd = Sys.getCwd();
			Sys.setCwd(cwd + "/api");
			Sys.command("python3 filter.py");
			Sys.setCwd(cwd);
			sys.FileSystem.rename("api/doc.xml", "api/doc-old.xml"); // so it doesn't convert it again
		}

		// otherwise, check if cached doc-filter.xml exists
		if(!sys.FileSystem.exists("api/doc-filter.xml")) {
			trace("Couldn't find doc-filter.xml");
			Sys.exit(1);
		}

		var config = new Config(Macro.getDoxPath());
		config.inputPath = "api/doc-filter.xml";
		config.outputPath = "../export/api-docs";
		config.rootPath = "./";
		config.loadTheme("./theme");
		config.pageTitle = "Codename Engine API";
		config.toplevelPackage = "funkin";
		//config.defines = [Version => defines["flixel"]];
		config.addFilter("(__ASSET__|ApplicationMain|DocumentClass|DefaultAssetLibrary|Main|NMEPreloader|zpp_nape)", false);
		config.addFilter("funkin|scripting", true);
		//config.rootPath = "";

		Dox.run(config, CodenameApi.new);
	}
}

class CodenameApi extends Api {
	public function packToUrl(pack:String) {
		var url = "/api-docs/" + pack.split(".").join("/") + ".html";
		return cleanUrl(url);
	}

	public function cleanUrl(url:String) {
		if(url.endsWith("index.html"))
			url = url.substr(0, url.length - 10);
		#if ACTIONS
		if(url.endsWith(".html"))
			url = url.substr(0, url.length - 5);
		#end
		return url;
	}

	override public function pathToUrl(path:Path):String {
		var rootPath = config.rootPath;
		if(config.rootPath == "::rootPath::") {
			rootPath = "/api-docs/";
		}
		var res = rootPath + sanitizePath(path).split(".").join("/") + ".html";
		return cleanUrl(res);
	}

	override public function packageToUrl(full:String):String {
		var rootPath = config.rootPath;
		if(config.rootPath == "::rootPath::") {
			rootPath = "/api-docs/";
		}
		var res;
		if (full == config.toplevelPackage) {
			res = rootPath + "index.html";
		} else {
			res = rootPath + full.split(".").join("/") + "/index.html";
		}
		return cleanUrl(res);
	}

	override function getSourceLink(type:TypeInfos):Null<String> {
		var module = type.module != null ? type.module : type.path;
		var ending = ".hx";
		var url = "https://github.com/CodenameCrew/CodenameEngine/blob/main/source/";

		return haxe.io.Path.join([url, module.replace(".", "/") + ending]);
	}

	public function getSourceLinkWithLine(type:TypeInfos, line:Int):Null<String> {
		var module = type.module != null ? type.module : type.path;
		var ending = ".hx";
		var url = "https://github.com/CodenameCrew/CodenameEngine/blob/main/source/";

		return haxe.io.Path.join([url, module.replace(".", "/") + ending + "#L" + line]);
	}

	function isOneOf(module:String, classes:Array<String>):Bool {
		for (cl in classes) {
			if (module.indexOf(cl) >= 0)
				return true;
		}
		return false;
	}

	override function hasSourceLink(type:TypeInfos):Bool {
		return type.file != null && type.file.endsWith(".hx");
	}

	function printInheritedFields_hasFields(inheritedFields:InheritedFields):Bool {
		var fields = inheritedFields.fields;
		for (cl in inheritedFields.types) {
			for(field in fields.get(cl)) {
				return true;
			}
		}
		return false;
	}

	function printInheritedFields_hasMethods(inheritedFields:InheritedFields):Bool {
		var fields = inheritedFields.methods;
		for (cl in inheritedFields.types) {
			for(field in fields.get(cl)) {
				if(field.name != "new" && !field.isOverride) {
					return true;
				}
			}
		}
		return false;
	}

	function printInheritedFields_type_hasMethods(cl:Dynamic, inheritedFields:InheritedFields):Bool {
		var fields = inheritedFields.methods;
		for(field in fields.get(cl)) {
			if(field.name != "new" && !field.isOverride) {
				return true;
			}
		}
		return false;
	}

	function trace(str:Dynamic) {
		trace(str);
	}
}
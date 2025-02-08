package templo;

import templo.Ast;
import templo.Token;

/**
	The templo Template class provides advanced templating support.

	Templo directives start with two double-dots: `::directive`. The supported
	directives are:

		- `::raw`
		- `::if`, `::elseif` and `::else`
		- `::foreach`
		- `::set`
		- `::fill`
		- `::cond` (within node definition)
		- `::repeat`` (within node definition)
		- `::attr` (within node definition)
		- `::switch` and `::case`
		- `::use`
		- `::eval`

	The following directives are currently unsupported:

		- `::compare`
		- `~=`
**/
class Template {

	static var partMap:Map<String, Part> = new Map();

	var part:Part;
	var byteData:byte.ByteData;

	/**
		Creates a new Template by parsing `input`.

		If `sourceName` is provided, error messages will contain its value. It
		is also recorded in a global lookup and can be used as argument to
		`::use`.

		The parsing process is expensive, but it only has to be done once for
		each input source. Template maintains no state other than the parsed
		template information, so the intended usage is to create a Template
		once and then invoke its `execute` method multiple times.

		If `input` is null, the result is unspecified.
	**/
	public function new(input:haxe.io.Input, ?sourceName = null) {
		byteData = byte.ByteData.ofString(input.readAll().toString());
		var parser = new templo.Parser(byteData, sourceName);
		hxparse.Utils.catchErrors(byteData, function() {
			part = templo.Converter.toAst(parser.parse());
		});
		if (sourceName != null) partMap.set(sourceName, part);
	}

	/**
		Convenience function for creating a new Template from a String.
	**/
	static public function fromString(s:String, ?sourceName = null) {
		return new Template(new haxe.io.StringInput(s), sourceName);
	}

#if (sys||nodejs)
	/**
		Convenience function for creating a new Template from a file.
	**/
	static public function fromFile(path:String) {
		#if sys
		var p = new haxe.io.Path(path);
		return new Template(sys.io.File.read(path), p.file + "." + p.ext);
		#elseif nodejs
		var p = new haxe.io.Path(path);
		return new Template(new haxe.io.StringInput(sys.io.File.getContent(path)), p.file + "." + p.ext);
		#end
	}
#end

	/**
		Executes `this` Template with the provided `data` as context.

		Each invocation of `execute` has its own context.
	**/
	public function execute(data:{}) {
		var ctx = new Context(byteData, data);
		ctx.push();
		ctx.bind("null", null);
		ctx.bind("true", true);
		ctx.bind("false", false);
		processPart(ctx, part);
		ctx.pop();
		return ctx.getContent();
	}

	function processPart(ctx:Context, e:Part) {
		switch(e) {
			case PBlock(pl):
				for (p in pl) processPart(ctx, p);
			case PSet(s, e): ctx.bind(s, eval(ctx, e));
			case PData(s): ctx.append(s);
			case PComment(s):
				ctx.append(s);
				ctx.append("\n");
			case PEval(e): eval(ctx, e);
			case PMacroCall(s, cl): callMacro(ctx, s, cl);
			case PIf(eif, pthen, pelse):
				if(eval(ctx, eif)) processPart(ctx, pthen);
				else if (pelse != null) processPart(ctx, pelse);
			case PForeach(s, it, p):
				var v = getIterator(eval(ctx, it));
				iterate(ctx, s, v, p);
			case PValue(e): ctx.append(display(eval(ctx, e)));
			case PRaw(e): ctx.append(Std.string(eval(ctx, e)));
			case PNode(node) if (node.cond != null && eval(ctx, node.cond) != true):
			case PNode(node) if (node.repeat != null):
				var v = getIterator(eval(ctx, node.repeat.t));
				var r = node.repeat;
				node.repeat = null;
				iterate(ctx, r.name, v, e);
				node.repeat = r;
			case PNode(node):
				var isVoid = Parser.voidElements.indexOf(node.node) != -1;
				ctx.append('<${node.node}');
				for (attr in node.attributes) {
					ctx.append(' ${attr.name}="');
					processPart(ctx, attr.t);
					ctx.append('"');
				}
				for (attr in node.attrs) {
					var e = eval(ctx, attr.t);
					if (e == null) continue;
					ctx.append(' ${attr.name}="$e"');
				}
				if(isVoid) {
					ctx.append(">");
				} else {
					if (node.content != null) {
						ctx.append(">");
						processPart(ctx, node.content);
						ctx.append('</${node.node}>');
					} else {
						ctx.append("/>");
					}
				}
			case PFill(s, body):
				ctx.pushBuffer();
				processPart(ctx, body);
				ctx.bind(s, ctx.popBuffer().toString());
			case PSwitch(e1, cases, def):
				var v = eval(ctx, e1);
				var i = Type.enumIndex(v);
				if (cases[i] == null)
					processPart(ctx, def);
				else {
					ctx.push();
					ctx.bind("args", Type.enumParameters(v));
					processPart(ctx, cases[i]);
					ctx.pop();
				}
			case PUse(e, body):
				var v = eval(ctx, e);
				#if sys
				if (!partMap.exists(v) && sys.FileSystem.exists(v)) Template.fromFile(v);
				#end
				if (!partMap.exists(v)) throw "Could not find template " + v;
				ctx.push();
				ctx.pushBuffer();
				processPart(ctx, body);
				ctx.bind("__content__", ctx.popBuffer().toString());
				processPart(ctx, partMap.get(v));
				ctx.pop();
		}
	}

	function callMacro(ctx:Context, s:String, cl:Array<Part>) {
		ctx.push();
		var m = Converter.macros.get(s); // TODO: decouple
		if (m == null) throw 'Unknown macro: $s';
		for (i in 0...cl.length) {
			var arg = m.args[i];
			switch(cl[i]) {
				case PValue(e):
					ctx.bind(arg.name, eval(ctx, e));
				case t:
					throw 'Unexpected macro arg: $t';
			}
		}
		processPart(ctx, m.part);
		ctx.pop();
	}

	function display(v:Dynamic) {
		return StringTools.htmlEscape(Std.string(v), true);
	}

	function getIterator(v:Dynamic):Iterator<Dynamic> {
		try {
			var x : Dynamic = v.iterator();
			if( x.hasNext == null ) throw null;
			v = x;
		} catch( e : Dynamic ) try {
			if( v.hasNext == null ) throw null;
		} catch( e : Dynamic ) {
			throw "Cannot iter on " + v;
		}
		return v;
	}

	function iterate<T>(ctx:Context, s:String, v:Iterator<T>, part:Part) {
		var repeat = {
			index: -1,
			number: 0,
			odd: true,
			even: false,
			first: true,
			last: false,
			size: 0
		};
		ctx.push();
		var r = {};
		ctx.bind("repeat", r);
		for ( i in v ) {
			repeat.index++;
			repeat.number++;
			repeat.even = repeat.index & 1 == 0;
			repeat.odd = !repeat.even;
			repeat.last = !v.hasNext();
			ctx.push();
			Reflect.setField(r, s, repeat);
			ctx.bind(s, i);
			processPart(ctx, part);
			ctx.pop();
			repeat.first = false;
		}
		ctx.pop();
	}

	function eval(ctx:Context, e:Expr):Dynamic {
		return switch(e.expr) {
			case VConst(c):
				switch(c) {
					case CInt(i): i;
					case CString(s): s;
					case CFloat(s): Std.parseFloat(s);
				}
			case VIdent(s):
				ctx.lookup(s, e.pos);
			case VVar(s):
				null;
			case VIf(econd, ethen, null):
				if (eval(ctx, econd)) eval(ctx, ethen) else null;
			case VIf(econd, ethen, eelse):
				if (eval(ctx, econd)) eval(ctx, ethen) else eval(ctx, eelse);
			case VField(e1, s):
				Reflect.field(eval(ctx,e1), s);
			case VParent(e1):
				eval(ctx, e1);
			case VUnop(op, false, e1):
				switch(op) {
					case Not: !eval(ctx, e1);
					case Neg: -eval(ctx, e1);
					case Increment: eval(ctx, { expr: VBinop(OpAssign, e1, { expr: VBinop(OpAdd, e1, {expr:VConst(CInt(1)), pos: e1.pos}), pos: e1.pos}), pos: e1.pos });
					case Decrement: eval(ctx, { expr: VBinop(OpAssign, e1, { expr: VBinop(OpSub, e1, {expr:VConst(CInt(1)), pos: e1.pos}), pos: e1.pos}), pos: e1.pos });
				}
			case VUnop(op, true, e1):
				switch(op) {
					case Increment:
						var v = eval(ctx, { expr: VBinop(OpAssign, e1, { expr: VBinop(OpAdd, e1, {expr:VConst(CInt(1)), pos: e1.pos}), pos: e1.pos}), pos: e1.pos });
						v - 1;
					case Decrement:
						var v = eval(ctx, { expr: VBinop(OpAssign, e1, { expr: VBinop(OpSub, e1, {expr:VConst(CInt(1)), pos: e1.pos}), pos: e1.pos}), pos: e1.pos });
						v + 1;
					case _: throw 'Unsupported postfix unop: $op';
				}
			case VLiteral(e1):
				eval(ctx, e1); // ???
			case VBinop(op, e1, e2):
				switch(op) {
					case OpAdd: eval(ctx, e1) + eval(ctx, e2);
					case OpMult: eval(ctx, e1) * eval(ctx, e2);
					case OpDiv: eval(ctx, e1) / eval(ctx, e2);
					case OpSub: eval(ctx, e1) - eval(ctx, e2);
					case OpEq: eval(ctx, e1) == eval(ctx, e2);
					case OpNotEq: eval(ctx, e1) != eval(ctx, e2);
					case OpGt: eval(ctx, e1) > eval(ctx, e2);
					case OpGte: eval(ctx, e1) >= eval(ctx, e2);
					case OpLt: eval(ctx, e1) < eval(ctx, e2);
					case OpLte: eval(ctx, e1) <= eval(ctx, e2);
					case OpAnd: eval(ctx, e1) & eval(ctx, e2);
					case OpOr: eval(ctx, e1) | eval(ctx, e2);
					case OpXor: eval(ctx, e1) ^ eval(ctx, e2);
					case OpBoolAnd:
						if (!eval(ctx, e1)) false;
						else eval(ctx, e2);
					case OpBoolOr:
						if (eval(ctx, e1)) true;
						else eval(ctx, e2);
					case OpShl: eval(ctx, e1) << eval(ctx, e2);
					case OpShr: eval(ctx, e1) >> eval(ctx, e2);
					case OpUShr: eval(ctx, e1) >>> eval(ctx, e2);
					case OpMod: eval(ctx, e1) % eval(ctx, e1);
					case OpCompare: throw "???";
					case OpAssign:
						switch(e1.expr) {
							case VField(ef, s):
								var ef = eval(ctx, ef);
								Reflect.setField(ef, s, eval(ctx, e2));
								Reflect.field(ef, s);
							case VArray(eb, ei):
								untyped eval(ctx, eb)[eval(ctx, ei)] = eval(ctx, e2);
							case VIdent(s):
								ctx.assign(s, eval(ctx, e2), e.pos);
							case _:
								throw "invalid assign";
						}
				}
			case VObject(fl):
				var r = { };
				for (f in fl) {
					Reflect.setField(r, f.name, eval(ctx, f.expr));
				}
				r;
			case VBool(e1):
				throw "???";
			case VArray(e1, e2):
				untyped eval(ctx, e1)[eval(ctx, e2)];
			case VArrayDecl(el):
				el.map(eval.bind(ctx));
			case VCall(e1 = {expr: VField(ef, s)}, el):
				var ef = eval(ctx, ef);
				var field = Reflect.field(ef, s);
				try
					Reflect.callMethod(ef, field, el.map(eval.bind(ctx)))
				catch (err:Dynamic) {
					throw ctx.formatPos(e.pos) + ": " +err;
				}
			case VCall(e1, el):
				var e1 = eval(ctx, e1);
				try
					Reflect.callMethod(e1, e1, el.map(eval.bind(ctx)))
				catch (err:Dynamic) {
					throw ctx.formatPos(e.pos) + ": " +err;
				}
		}
	}
}

private typedef CtxStack = haxe.ds.GenericStack<haxe.ds.StringMap<Dynamic>>;

private class Context {

	var data:{};
	var stack:CtxStack;
	var buffer:StringBuf;
	var input:byte.ByteData;
	var bufferStack:haxe.ds.GenericStack<StringBuf>;

	public function new(input:byte.ByteData, data:{}) {
		stack = new CtxStack();
		this.data = data;
		this.input = input;
		buffer = new StringBuf();
		bufferStack = new haxe.ds.GenericStack<StringBuf>();
	}

	public inline function push() {
		stack.add(new haxe.ds.StringMap());
	}

	public inline function pop() {
		return stack.pop();
	}

	public inline function pushBuffer() {
		bufferStack.add(buffer);
		buffer = new StringBuf();
	}

	public inline function popBuffer() {
		var b = buffer;
		buffer = bufferStack.pop();
		return b;
	}

	public inline function bind<T>(s:String, v:T) {
		stack.first().set(s, v);
	}

	public function assign<T>(s:String, v:T, pos) {
		for (st in stack) {
			if (st.exists(s)) {
				st.set(s, v);
				return v;
			}
		}
		throw '${formatPos(pos)}: Unknown identifier: $s';
	}

	public function lookup(s:String, pos:hxparse.Position) {
		for (st in stack) {
			if (st.exists(s)) return st.get(s);
		}
		return Reflect.field(data, s);
	}

	public inline function append(s:String) {
		buffer.add(s);
	}

	public inline function getContent() {
		return buffer.toString();
	}

	public function formatPos(pos:hxparse.Position) {
		return pos.format(input);
	}
}
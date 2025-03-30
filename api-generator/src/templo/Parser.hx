package templo;
import templo.Token;
import hxparse.LexerTokenSource;
import hxparse.Parser;

enum ParserErrorMsg {
	Unexpected(t:Token);
	Message(s:String);
	UnclosedNode(s:String);
}

typedef Error = {
	msg: ParserErrorMsg,
	pos: hxparse.Position
}

class Parser extends hxparse.Parser<LexerTokenSource<Token>, Token> implements hxparse.ParserBuilder {
	public function new(input:byte.ByteData, sourceName:String) {
		var lexer = new Lexer(input, sourceName);
		var source = new LexerTokenSource(lexer, Lexer.element);
		super(source);
	}

	public function parse() {
		return program([]).content;
	}

	function program(acc):{content:Content, tok:TokenDef} {
		return switch stream {
			case [{tok:Eof}]: {content: acc, tok: Eof};
			case [{tok:EndNode(n)}]: {content: acc, tok: EndNode(n)};
			case [e = parseElement()]:
				switch(e.def) {
					case XData(""):
					case _: acc.push(e);
				}
				program(acc);
		}
	}

	function parseElement() {
		return switch stream {
			case [{tok:Data(str), pos: p}]: {def: XData(str), pos:p}
			case [{tok:Comment(n), pos: p}]: {def: XComment(n), pos:p}
			case [{tok:DoubleDot, pos: p}, c = parseConstruct()]: {def: XConstr(c), pos:punion(p,c.pos)}
			case [{tok:Node(n), pos: p}, node = (n == "macro") ? parseMacroDef(p) : parseNode(n,p)]: node;
			case [{tok:Macro(m), pos:p1}, params = parseMacro()]: {def: XMacroCall(m, params), pos:p1};
			case [{tok:CDataBegin, pos:p1}, c = parseCData(), {tok: CDataEnd,pos:p2}]: {def: XCData(c), pos: punion(p1, p2)};
		}
	}

	function parseCData() {
		stream.ruleset = Lexer.cdata;
		var e = null;
		var acc = [];
		while(true) {
			switch stream {
				case [e = parseElement()]: acc.push(e);
				case _: break;
			}
		}
		stream.ruleset = Lexer.element;
		return acc;
	}

	static public var voidElements = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

	function parseNode(n,p1) {
		var isVoid = voidElements.indexOf(n) != -1;
		var n = {
			node: n,
			attributes: [],
			macros: [],
			cond: null,
			repeat: null,
			attrs: [],
			content: null,
			ignore: false
		};
		stream.ruleset = Lexer.attributes;
		var c = parseNodeAttribs(n);
		stream.ruleset = Lexer.element;
		if (c.hasContent && !isVoid) {
			var content = program([]);
			if(!isVoid) {
				switch(content.tok) {
					case EndNode(name): if (n.node != name) error(Message('Expected </${n.node}>, found </$name>'), p1);
					case _: error(UnclosedNode(n.node), p1);
				}
			}
			n.content = content.content;
		}
		return {
			def: XNode(n),
			pos: punion(p1, c.pos)
		}
	}

	function parseNodeAttribs(node:TNode) {
		return switch stream {
			case [{tok: NodeContent(c), pos:p}]: {hasContent: c, pos: p};
			case [{tok: DoubleDot}]:
				stream.ruleset = Lexer.expr;
				switch stream {
					case [{tok:Ident("cond"), pos:p}, e = parseExpr(), {tok:DoubleDot}]:
						if (node.cond == null)
							node.cond = e;
						else
							error(Message("Duplicate cond"), p);
					case [{tok:Ident("attr")}, {tok: Ident(attr) | String(attr)}, e = parseExpr(), {tok:DoubleDot}]:
						node.attrs.push({
							name: attr,
							expr: e
						});
					case [{tok:Ident("repeat"), pos: p}, {tok: Ident(v)}, e = parseExpr(), {tok: DoubleDot}]:
						if (node.repeat == null)
							node.repeat = {
								name: v,
								expr: e
							}
						else
							error(Message("Duplicate repeat"), p);
					case [{tok:Kwd(Ignore), pos: p}, {tok:DoubleDot}]:
						if (node.ignore) error(Message("Duplicate ignore"), p);
						node.ignore = true;
				}
				stream.ruleset = Lexer.attributes;
				parseNodeAttribs(node);
			case [{tok:Ident(attr)}, {tok:Op(OpAssign)}]:
				stream.ruleset = Lexer.attrvalue;
				var v = switch stream {
					case [{tok:Quote(b)}, v = parseAttribValues(b)]: v;
				}
				stream.ruleset = Lexer.attributes;
				v.reverse();
				node.attributes.push({
					name: attr,
					content: v
				});
				parseNodeAttribs(node);
		}
	}

	function parseAttribValues(b):Content {
		return switch stream {
			case [{tok:Data(str), pos: p}]:
				var l = parseAttribValues(b);
				l.push({
					def: XData(str),
					pos: p
				});
				l;
			case [{tok:DoubleDot, pos: p1}, c = parseConstruct()]:
				var l = parseAttribValues(b);
				l.push({
					def: XConstr(c),
					pos: punion(p1, c.pos)
				});
				l;
			case [{tok:Macro(m), pos: p1}, params = parseMacro()]:
				var l = parseAttribValues(b);
				l.push({
					def: XMacroCall(m,params),
					pos: p1
				});
				l;
			case [{tok:Quote(b2), pos: p1}]:
				if (b == b2)
					[];
				else {
					var l = parseAttribValues(b);
					l.push({
						def: XData(b2 ? '"' : "'"),
						pos: p1
					});
					l;
				}
		}
	}

	function parseMacro() {
		var old = stream.ruleset;
		stream.ruleset = Lexer.macros;
		var el = switch stream {
			case [{tok:ParentOpen}]:
				switch stream {
					case [{tok:ParentClose}]: [];
					case [el = parseMacroParams([],0,[])]: el;
				}
		}
		stream.ruleset = old;
		return el;
	}

	function parseMacroParams(acc:Array<Content>,n,pacc) {
		return switch stream {
			case [param = parseMacroParam(n,pacc)]:
				var vl = param.vl;
				var n = param.n;
				switch stream {
					case [{tok:Comma, pos:p}]:
						if (n == 0) {
							vl.reverse();
							acc.push(vl);
							parseMacroParams(acc, 0, []);
						} else {
							vl.push({
								def: XData(","),
								pos: p
							});
							parseMacroParams(acc, n, vl);
						}
					case [{tok:ParentClose, pos:p}]:
						if (n == 0) {
							vl.reverse();
							acc.push(vl);
							acc.reverse();
							acc;
						} else {
							vl.push({
								def: XData(","),
								pos: p
							});
							parseMacroParams(acc, n, vl);
						}
				}
		}
	}

	function parseMacroParam(n,acc):{vl:Content, n:Int} {
		return switch stream {
			case [{tok:BraceOpen, pos:p}]: parseMacroParam(n + 1, aadd(acc, {def:XData("{"), pos:p}));
			case [{tok:BraceClose, pos:p}]:
				if (n == 0)
					error(Message("Stream error"),p);
				parseMacroParam(n - 1, aadd(acc, {def:XData("}"), pos:p}));
			case [{tok:ParentOpen, pos:p}]: parseMacroParam(n, aadd(acc, {def:XData("("), pos:p}));
			case [{tok:Data(d), pos:p}]: parseMacroParam(n, aadd(acc, {def:XData(d), pos:p}));
			case [{tok:DoubleDot, pos:p1}, c = parseConstruct()]: parseMacroParam(n, aadd(acc, {def:XConstr(c), pos:punion(p1,c.pos)}));
			case [{tok:Macro(m), pos:p1}, params = parseMacro()]: parseMacroParam(n, aadd(acc, {def:XMacroCall(m, params), pos:p1}));
			case [{tok:Node(node), pos:p1}]:
				var node = parseNode(node, p1);
				stream.ruleset = Lexer.macros;
				parseMacroParam(n, aadd(acc, node));
			case _: { vl: acc, n:n};
		}
	}

	function parseMacroDef(p1) {
		stream.ruleset = Lexer.attributes;
		var data = switch stream {
			case [{tok:Ident("name")}, {tok:Op(OpAssign)}, {tok:Quote(b)}]:
				stream.ruleset = Lexer.expr;
				var mode = parseModeName();
				var params = switch stream {
					case [{tok:ParentOpen}]: parseMacroArgs(false);
				}
				stream.ruleset = Lexer.attributes;
				switch stream {
					case [{tok:Quote(b2), pos:p}]: if (b != b2) error(Message("Stream error"), p);
				}
				{
					mode: mode.mode,
					name: mode.name,
					params: params
				}
		}
		var content = switch stream {
			case [{tok:NodeContent(b), pos:p2}]: {content: b ? 1 : 0, pos: p2};
			case _: {content:-1, pos:p1};
		}
		var p2 = content.pos;
		var content = switch(content.content) {
			case -1:
				switch(parseNode("macro", p1)) {
					case {def:XNode(n), pos:p}:
						if (n.content != null)
							error(Message("Attribute macro can't have content"), p);
						if (n.attrs.length > 0 || n.macros.length > 0 || n.repeat != null || n.cond != null)
							error(Message("Attribute macro can't have special attribute"),p);
						MAttr(n.attributes);
					case _: throw "assert";
				}
			case 0:
				MContent([]);
			case 1:
				stream.ruleset = Lexer.element;
				var content = program([]);
				switch(content.tok) {
					case EndNode("macro"): MContent(content.content);
					case _: error(UnclosedNode("macro"),p1);
				}
			case _: throw "assert";
		}
		var m = {
			mode: data.mode,
			name: data.name,
			args: data.params,
			content: content
		}
		return {
			def: XMacroDef(m),
			pos: punion(p1, p2)
		}
	}

	function parseModeName() {
		return switch stream {
			case [{tok:Kwd(Literal)}, {tok:Ident(name)}]: { mode: MLiteral, name: name };
			case [{tok:Ident("grammar")}, {tok:Ident(name)}]: { mode: MGrammar, name: name};
			case [{tok:Ident(name)}]: { mode: MNormal, name: name};
		}
	}

	function parseMacroArgs(opt) {
		return switch stream {
			case [{tok:ParentClose}]: [];
			case [{tok:Question}]: parseMacroArgs(true);
		case _:
			var mode = parseModeName();
			switch stream {
				case [{tok:Comma}]: aadd(parseMacroArgs(opt), { name: mode.name, mode: mode.mode, opt:opt});
				case [{tok:ParentClose}]: [{name:mode.name, mode:mode.mode, opt:opt}];
			}
		}
	}

	function parseExpr() {
		return switch stream {
			case [{tok:Int(i), pos:p}]: parseExprNext({expr:VConst(CInt(i)),pos:p});
			case [{tok:Float(f), pos:p}]: parseExprNext({expr:VConst(CFloat(f)),pos:p});
			case [{tok:String(s), pos:p}]: parseExprNext({expr:VConst(CString(s)),pos:p});
			case [{tok:Ident(id), pos:p}]: parseExprNext({expr:VIdent(id),pos:p});
			case [{tok:ParentOpen, pos:p1}, e = parseExpr(), {tok:ParentClose, pos:p2}]: parseExprNext({expr:VParent(e), pos:punion(p1,p2)});
			case [{tok:Kwd(If), pos:p1}, cond = parseExpr(), e1 = parseExpr()]:
				switch stream {
					case [{tok:Kwd(Else)}, e2 = parseExpr()]: {expr: VIf(cond, e1, e2), pos: punion(p1, e2.pos)};
					case _: {expr: VIf(cond, e1, null), pos: punion(p1, e1.pos)};
				}
			case [{tok:Unop(op), pos:p}]:
				makeUnop(op, parseExpr(), p);
			case [{tok:Op(OpSub), pos:p}]:
				makeUnop(Neg, parseExpr(), p);
			case [{tok:BracketOpen, pos:p1}, el = parseExprList(), {tok: BracketClose, pos:p2}]:
				parseExprNext({expr:VArrayDecl(el), pos:punion(p1, p2)});
			case [{tok:Kwd(Literal), pos:p1}]:
				switch stream {
					case [{tok:ParentOpen}, e = parseExpr(), {tok:ParentClose, pos:p2}]:
						parseExprNext({expr:VLiteral(e), pos:punion(p1, p2)});
					case [e = parseExpr()]:
						{expr: VLiteral(e), pos: punion(p1, e.pos)};
				}
			case [{tok:BraceOpen, pos:p1}, fl = parseFieldList(), {tok:BraceClose, pos:p2}]:
				parseExprNext({expr:VObject(fl), pos:punion(p1, p2)});

		}
	}

	function parseExprNext(e1:Expr) {
		var p1 = e1.pos;
		return switch stream {
			case [{tok:Dot}, {tok:Ident(f), pos:p2}]: parseExprNext({expr: VField(e1,f), pos:punion(p1,p2)});
			case [{tok:ParentOpen}, args = parseExprList(), {tok:ParentClose, pos:p2}]: parseExprNext({expr:VCall(e1, args), pos:punion(p1,p2)});
			case [{tok: Op(op)}, e2 = parseExpr()]: makeBinop(op,e1,e2);
			case [{tok: Unop(op), pos:p}]: parseExprNext({expr:VUnop(op, true, e1), pos:p});
			case [{tok:BracketOpen}, e2 = parseExpr(), {tok:BracketClose, pos:p2}]: parseExprNext({expr: VArray(e1, e2),pos:punion(p1,p2)});
			case _: e1;
		}
	}

	function parseFieldList():Array<{name:String, expr:Expr}> {
		return switch stream {
			case [{tok:Ident(str)}, {tok:DoubleDot}, e = parseExpr()]:
				switch stream {
					case [{tok:Comma}]: null;
					case _: null;
				}
				var l = parseFieldList();
				l.push({
					name: str,
					expr: e
				});
				l;
			case _:
				[];
		}
	}

	function parseExprList():Array<Expr> {
		return switch stream {
			case [e = parseExpr()]:
				switch stream {
					case [{tok:Comma}]:
						var l = parseExprList();
						l.unshift(e);
						l;
					case _:
						[e];
				}
			case _:
				[];
		}
	}

	function parseConstruct() {
		var old = stream.ruleset;
		stream.ruleset = Lexer.expr;
		var c = switch stream {
			case [{tok:Ident("use")}, e = parseExpr()]: CUse(e);
			case [{tok:Ident("raw")}, e = parseExpr()]: CRaw(e);
			case [{tok:Ident("set")}, {tok: Ident(value)}, {tok: Op(OpAssign)}, e = parseExpr()]: CSet(value, e);
			case [{tok:Kwd(If), pos:p1}, e = parseExpr()]:
				switch stream {
					case [e1 = parseExpr(), {tok:Kwd(Else)}, e2 = parseExpr()]: CValue({expr:VIf(e, e1, e2), pos:punion(p1, e2.pos)});
					case _: CIf(e);
				}
			case [{tok:Kwd(Else)}]: CElse;
			case [{tok:Kwd(Switch)}, e = parseExpr()]: CSwitch(e);
			case [{tok:Kwd(Case)}]:
				switch stream {
					case [e = parseExpr()]:
						switch(e.expr) {
							case VConst(CInt(i)) if (i >= 0): CCase(i);
							case _: error(Message("Case expression should be a constant positive integer"), e.pos);
						}
					case _: CCase(-1);
				}
			case [{tok:Ident("elseif")}, e = parseExpr()]: CElseIf(e);
			case [{tok:Ident("foreach")}, {tok:Ident(k)}, e = parseExpr()]: CForeach(k,e);
			case [{tok:Ident("fill")}, {tok:Ident(k)}]: CFill(k);
			case [{tok:Ident("end")}]: CEnd;
			case [{tok:Ident("eval")}, e = parseExpr()]: CEval(e);
			case [{tok:Ident("compare")}]: CCompare;
			case [{tok:Op(OpCompare)}]: CCompareWith;
			case [e = parseExpr()]: CValue(e);
		}
		stream.ruleset = old;
		return switch stream {
			case [{tok:DoubleDot, pos: p2}]: {
				def: c,
				pos: p2
			}
		}
	}

	// Helper

	static inline function error(msg,pos):Dynamic {
		throw {
			msg: msg,
			pos: pos
		}
	}

	static inline function aadd<T>(a:Array<T>, t:T) {
		a.push(t);
		return a;
	}

	static function priority(op) {
		return switch(op) {
			case OpCompare: -5;
			case OpAssign: -4;
			case OpBoolOr: -3;
			case OpBoolAnd: -2;
			case OpEq | OpNotEq | OpGt | OpLt | OpGte | OpLte: -1;
			case OpOr | OpAnd | OpXor: 0;
			case OpShl | OpShr | OpUShr: 1;
			case OpAdd | OpSub: 2;
			case OpMult | OpDiv: 3;
			case OpMod: 4;
		}
	}

	static function canSwap(_op, op) {
		var p1 = priority(_op);
		var p2 = priority(op);
		return if (p1 < p2)
			true;
		else if (p1 == p2 && p2 >= 0)
			true;
		else
			false;
	}

	static function makeUnop(op, e:Expr, p1) {
		return switch(e) {
			case {expr:VBinop(bop,e,e2), pos:p2}: {expr:VBinop(bop,makeUnop(op,e,p1),e2), pos:punion(p1,p2)};
			case {pos:p2}: {expr:VUnop(op,false,e), pos: punion(p1,p2)};
		}
	}

	static function makeBinop(op,e,e2:Expr) {
		return switch(e2) {
			case {expr:VBinop(_op,_e, _e2)} if (canSwap(_op,op)):
				var _e = makeBinop(op, e, _e);
				{
					expr: VBinop(_op, _e, _e2),
					pos: punion(_e.pos, _e2.pos)
				}
			case _:
				{
					expr: VBinop(op, e, e2),
					pos: punion(e.pos, e2.pos)
				}
		}
	}

	static inline function punion(p1,p2) return hxparse.Position.union(p1, p2);

}
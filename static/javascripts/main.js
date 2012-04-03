var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.evalWorksForGlobals_ = null;
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.getObjectByName(name) && !goog.implicitNamespaces_[name]) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.require = function(rule) {
  if(!COMPILED) {
    if(goog.getObjectByName(rule)) {
      return
    }
    var path = goog.getPathFromDeps_(rule);
    if(path) {
      goog.included_[path] = true;
      goog.writeScripts_()
    }else {
      var errorMessage = "goog.require could not find: " + rule;
      if(goog.global.console) {
        goog.global.console["error"](errorMessage)
      }
      throw Error(errorMessage);
    }
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(var_args) {
  return arguments[0]
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    return ctor.instance_ || (ctor.instance_ = new ctor)
  }
};
if(!COMPILED) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(requireName in deps.nameToPath) {
            visitNode(deps.nameToPath[requireName])
          }else {
            if(!goog.getObjectByName(requireName)) {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call(value);
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  if(propName in object) {
    for(var key in object) {
      if(key == propName && Object.prototype.hasOwnProperty.call(object, propName)) {
        return true
      }
    }
  }
  return false
};
goog.propertyIsEnumerable_ = function(object, propName) {
  if(object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName)
  }else {
    return goog.propertyIsEnumerableCustom_(object, propName)
  }
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == "object" || type == "array" || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments)
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  var context = selfObj || goog.global;
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(context, newArgs)
    }
  }else {
    return function() {
      return fn.apply(context, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = style
};
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.subs = function(str, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var replacement = String(arguments[i]).replace(/\$/g, "$$$$");
    str = str.replace(/\%s/, replacement)
  }
  return str
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function(str) {
  str = String(str);
  if(!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str)
  }
  return str
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global && !goog.string.contains(str, "<")) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var el = goog.global["document"]["createElement"]("div");
  el["innerHTML"] = "<pre>x" + str + "</pre>";
  if(el["firstChild"][goog.string.NORMALIZE_FN_]) {
    el["firstChild"][goog.string.NORMALIZE_FN_]()
  }
  str = el["firstChild"]["firstChild"]["nodeValue"].slice(1);
  el["innerHTML"] = "";
  return goog.string.canonicalizeNewlines(str)
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.NORMALIZE_FN_ = "normalize";
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\u000b":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function(str) {
  return goog.string.toCamelCaseCache_[str] || (goog.string.toCamelCaseCache_[str] = String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function(str) {
  return goog.string.toSelectorCaseCache_[str] || (goog.string.toSelectorCaseCache_[str] = String(str).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  this.stack = (new Error).stack || "";
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = true;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = function(arr, f, val, opt_obj) {
  if(arr.reduce) {
    if(opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduce(f, val)
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if(arr.reduceRight) {
    if(opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduceRight(f, val)
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function(arr) {
  if(goog.isArray(arr)) {
    return goog.array.concat(arr)
  }else {
    var rv = [];
    for(var i = 0, len = arr.length;i < len;i++) {
      rv[i] = arr[i]
    }
    return rv
  }
};
goog.array.toArray = function(object) {
  if(goog.isArray(object)) {
    return goog.array.concat(object)
  }
  return goog.array.clone(object)
};
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && arr2.hasOwnProperty("callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.provide("goog.userAgent.jscript");
goog.require("goog.string");
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false;
goog.userAgent.jscript.init_ = function() {
  var hasScriptEngine = "ScriptEngine" in goog.global;
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = hasScriptEngine && goog.global["ScriptEngine"]() == "JScript";
  goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ? goog.global["ScriptEngineMajorVersion"]() + "." + goog.global["ScriptEngineMinorVersion"]() + "." + goog.global["ScriptEngineBuildVersion"]() : "0"
};
if(!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
  goog.userAgent.jscript.init_()
}
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? false : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? "0" : goog.userAgent.jscript.DETECTED_VERSION_;
goog.userAgent.jscript.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION, version) >= 0
};
goog.provide("goog.string.StringBuffer");
goog.require("goog.userAgent.jscript");
goog.string.StringBuffer = function(opt_a1, var_args) {
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : "";
  if(opt_a1 != null) {
    this.append.apply(this, arguments)
  }
};
goog.string.StringBuffer.prototype.set = function(s) {
  this.clear();
  this.append(s)
};
if(goog.userAgent.jscript.HAS_JSCRIPT) {
  goog.string.StringBuffer.prototype.bufferLength_ = 0;
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    if(opt_a2 == null) {
      this.buffer_[this.bufferLength_++] = a1
    }else {
      this.buffer_.push.apply(this.buffer_, arguments);
      this.bufferLength_ = this.buffer_.length
    }
    return this
  }
}else {
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    this.buffer_ += a1;
    if(opt_a2 != null) {
      for(var i = 1;i < arguments.length;i++) {
        this.buffer_ += arguments[i]
      }
    }
    return this
  }
}
goog.string.StringBuffer.prototype.clear = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    this.buffer_.length = 0;
    this.bufferLength_ = 0
  }else {
    this.buffer_ = ""
  }
};
goog.string.StringBuffer.prototype.getLength = function() {
  return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    var str = this.buffer_.join("");
    this.clear();
    if(str) {
      this.append(str)
    }
    return str
  }else {
    return this.buffer_
  }
};
goog.provide("cljs.core");
goog.require("goog.string");
goog.require("goog.string.StringBuffer");
goog.require("goog.object");
goog.require("goog.array");
cljs.core._STAR_print_fn_STAR_ = function _STAR_print_fn_STAR_(_) {
  throw new Error("No *print-fn* fn set for evaluation environment");
};
cljs.core.truth_ = function truth_(x) {
  return x != null && x !== false
};
cljs.core.type_satisfies_ = function type_satisfies_(p, x) {
  var or__3548__auto____99769 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____99769)) {
    return or__3548__auto____99769
  }else {
    var or__3548__auto____99770 = p["_"];
    if(cljs.core.truth_(or__3548__auto____99770)) {
      return or__3548__auto____99770
    }else {
      return false
    }
  }
};
cljs.core.is_proto_ = function is_proto_(x) {
  return x.constructor.prototype === x
};
cljs.core._STAR_main_cli_fn_STAR_ = null;
cljs.core.missing_protocol = function missing_protocol(proto, obj) {
  return Error.call(null, "No protocol method " + proto + " defined for type " + goog.typeOf.call(null, obj) + ": " + obj)
};
cljs.core.aclone = function aclone(array_like) {
  return Array.prototype.slice.call(array_like)
};
cljs.core.array = function array(var_args) {
  return Array.prototype.slice.call(arguments)
};
cljs.core.aget = function aget(array, i) {
  return array[i]
};
cljs.core.aset = function aset(array, i, val) {
  return array[i] = val
};
cljs.core.alength = function alength(array) {
  return array.length
};
cljs.core.IFn = {};
cljs.core._invoke = function() {
  var _invoke = null;
  var _invoke__99834 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99771 = this$;
      if(cljs.core.truth_(and__3546__auto____99771)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99771
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____99772 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99772)) {
          return or__3548__auto____99772
        }else {
          var or__3548__auto____99773 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99773)) {
            return or__3548__auto____99773
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__99835 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99774 = this$;
      if(cljs.core.truth_(and__3546__auto____99774)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99774
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____99775 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99775)) {
          return or__3548__auto____99775
        }else {
          var or__3548__auto____99776 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99776)) {
            return or__3548__auto____99776
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__99836 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99777 = this$;
      if(cljs.core.truth_(and__3546__auto____99777)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99777
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____99778 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99778)) {
          return or__3548__auto____99778
        }else {
          var or__3548__auto____99779 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99779)) {
            return or__3548__auto____99779
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__99837 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99780 = this$;
      if(cljs.core.truth_(and__3546__auto____99780)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99780
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____99781 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99781)) {
          return or__3548__auto____99781
        }else {
          var or__3548__auto____99782 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99782)) {
            return or__3548__auto____99782
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__99838 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99783 = this$;
      if(cljs.core.truth_(and__3546__auto____99783)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99783
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____99784 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99784)) {
          return or__3548__auto____99784
        }else {
          var or__3548__auto____99785 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99785)) {
            return or__3548__auto____99785
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__99839 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99786 = this$;
      if(cljs.core.truth_(and__3546__auto____99786)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99786
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____99787 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99787)) {
          return or__3548__auto____99787
        }else {
          var or__3548__auto____99788 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99788)) {
            return or__3548__auto____99788
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__99840 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99789 = this$;
      if(cljs.core.truth_(and__3546__auto____99789)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99789
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____99790 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99790)) {
          return or__3548__auto____99790
        }else {
          var or__3548__auto____99791 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99791)) {
            return or__3548__auto____99791
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__99841 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99792 = this$;
      if(cljs.core.truth_(and__3546__auto____99792)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99792
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____99793 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99793)) {
          return or__3548__auto____99793
        }else {
          var or__3548__auto____99794 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99794)) {
            return or__3548__auto____99794
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__99842 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99795 = this$;
      if(cljs.core.truth_(and__3546__auto____99795)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99795
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____99796 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99796)) {
          return or__3548__auto____99796
        }else {
          var or__3548__auto____99797 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99797)) {
            return or__3548__auto____99797
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__99843 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99798 = this$;
      if(cljs.core.truth_(and__3546__auto____99798)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99798
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____99799 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99799)) {
          return or__3548__auto____99799
        }else {
          var or__3548__auto____99800 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99800)) {
            return or__3548__auto____99800
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__99844 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99801 = this$;
      if(cljs.core.truth_(and__3546__auto____99801)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99801
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____99802 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99802)) {
          return or__3548__auto____99802
        }else {
          var or__3548__auto____99803 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99803)) {
            return or__3548__auto____99803
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__99845 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99804 = this$;
      if(cljs.core.truth_(and__3546__auto____99804)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99804
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____99805 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99805)) {
          return or__3548__auto____99805
        }else {
          var or__3548__auto____99806 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99806)) {
            return or__3548__auto____99806
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__99846 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99807 = this$;
      if(cljs.core.truth_(and__3546__auto____99807)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99807
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____99808 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99808)) {
          return or__3548__auto____99808
        }else {
          var or__3548__auto____99809 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99809)) {
            return or__3548__auto____99809
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__99847 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99810 = this$;
      if(cljs.core.truth_(and__3546__auto____99810)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99810
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____99811 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99811)) {
          return or__3548__auto____99811
        }else {
          var or__3548__auto____99812 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99812)) {
            return or__3548__auto____99812
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__99848 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99813 = this$;
      if(cljs.core.truth_(and__3546__auto____99813)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99813
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____99814 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99814)) {
          return or__3548__auto____99814
        }else {
          var or__3548__auto____99815 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99815)) {
            return or__3548__auto____99815
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__99849 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99816 = this$;
      if(cljs.core.truth_(and__3546__auto____99816)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99816
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____99817 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99817)) {
          return or__3548__auto____99817
        }else {
          var or__3548__auto____99818 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99818)) {
            return or__3548__auto____99818
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__99850 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99819 = this$;
      if(cljs.core.truth_(and__3546__auto____99819)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99819
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____99820 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99820)) {
          return or__3548__auto____99820
        }else {
          var or__3548__auto____99821 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99821)) {
            return or__3548__auto____99821
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__99851 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99822 = this$;
      if(cljs.core.truth_(and__3546__auto____99822)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99822
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____99823 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99823)) {
          return or__3548__auto____99823
        }else {
          var or__3548__auto____99824 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99824)) {
            return or__3548__auto____99824
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__99852 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99825 = this$;
      if(cljs.core.truth_(and__3546__auto____99825)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99825
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____99826 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99826)) {
          return or__3548__auto____99826
        }else {
          var or__3548__auto____99827 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99827)) {
            return or__3548__auto____99827
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__99853 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99828 = this$;
      if(cljs.core.truth_(and__3546__auto____99828)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99828
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____99829 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99829)) {
          return or__3548__auto____99829
        }else {
          var or__3548__auto____99830 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99830)) {
            return or__3548__auto____99830
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__99854 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99831 = this$;
      if(cljs.core.truth_(and__3546__auto____99831)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____99831
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____99832 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____99832)) {
          return or__3548__auto____99832
        }else {
          var or__3548__auto____99833 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____99833)) {
            return or__3548__auto____99833
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
  };
  _invoke = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    switch(arguments.length) {
      case 1:
        return _invoke__99834.call(this, this$);
      case 2:
        return _invoke__99835.call(this, this$, a);
      case 3:
        return _invoke__99836.call(this, this$, a, b);
      case 4:
        return _invoke__99837.call(this, this$, a, b, c);
      case 5:
        return _invoke__99838.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__99839.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__99840.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__99841.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__99842.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__99843.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__99844.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__99845.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__99846.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__99847.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__99848.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__99849.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__99850.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__99851.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__99852.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__99853.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__99854.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99856 = coll;
    if(cljs.core.truth_(and__3546__auto____99856)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____99856
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____99857 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99857)) {
        return or__3548__auto____99857
      }else {
        var or__3548__auto____99858 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____99858)) {
          return or__3548__auto____99858
        }else {
          throw cljs.core.missing_protocol.call(null, "ICounted.-count", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IEmptyableCollection = {};
cljs.core._empty = function _empty(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99859 = coll;
    if(cljs.core.truth_(and__3546__auto____99859)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____99859
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____99860 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99860)) {
        return or__3548__auto____99860
      }else {
        var or__3548__auto____99861 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____99861)) {
          return or__3548__auto____99861
        }else {
          throw cljs.core.missing_protocol.call(null, "IEmptyableCollection.-empty", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ICollection = {};
cljs.core._conj = function _conj(coll, o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99862 = coll;
    if(cljs.core.truth_(and__3546__auto____99862)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____99862
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____99863 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99863)) {
        return or__3548__auto____99863
      }else {
        var or__3548__auto____99864 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____99864)) {
          return or__3548__auto____99864
        }else {
          throw cljs.core.missing_protocol.call(null, "ICollection.-conj", coll);
        }
      }
    }().call(null, coll, o)
  }
};
cljs.core.IIndexed = {};
cljs.core._nth = function() {
  var _nth = null;
  var _nth__99871 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99865 = coll;
      if(cljs.core.truth_(and__3546__auto____99865)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____99865
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____99866 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____99866)) {
          return or__3548__auto____99866
        }else {
          var or__3548__auto____99867 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____99867)) {
            return or__3548__auto____99867
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__99872 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99868 = coll;
      if(cljs.core.truth_(and__3546__auto____99868)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____99868
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____99869 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____99869)) {
          return or__3548__auto____99869
        }else {
          var or__3548__auto____99870 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____99870)) {
            return or__3548__auto____99870
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n, not_found)
    }
  };
  _nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return _nth__99871.call(this, coll, n);
      case 3:
        return _nth__99872.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99874 = coll;
    if(cljs.core.truth_(and__3546__auto____99874)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____99874
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____99875 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99875)) {
        return or__3548__auto____99875
      }else {
        var or__3548__auto____99876 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____99876)) {
          return or__3548__auto____99876
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99877 = coll;
    if(cljs.core.truth_(and__3546__auto____99877)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____99877
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____99878 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99878)) {
        return or__3548__auto____99878
      }else {
        var or__3548__auto____99879 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____99879)) {
          return or__3548__auto____99879
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ILookup = {};
cljs.core._lookup = function() {
  var _lookup = null;
  var _lookup__99886 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99880 = o;
      if(cljs.core.truth_(and__3546__auto____99880)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____99880
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____99881 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____99881)) {
          return or__3548__auto____99881
        }else {
          var or__3548__auto____99882 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____99882)) {
            return or__3548__auto____99882
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__99887 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99883 = o;
      if(cljs.core.truth_(and__3546__auto____99883)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____99883
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____99884 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____99884)) {
          return or__3548__auto____99884
        }else {
          var or__3548__auto____99885 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____99885)) {
            return or__3548__auto____99885
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k, not_found)
    }
  };
  _lookup = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return _lookup__99886.call(this, o, k);
      case 3:
        return _lookup__99887.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99889 = coll;
    if(cljs.core.truth_(and__3546__auto____99889)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____99889
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____99890 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99890)) {
        return or__3548__auto____99890
      }else {
        var or__3548__auto____99891 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____99891)) {
          return or__3548__auto____99891
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99892 = coll;
    if(cljs.core.truth_(and__3546__auto____99892)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____99892
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____99893 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99893)) {
        return or__3548__auto____99893
      }else {
        var or__3548__auto____99894 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____99894)) {
          return or__3548__auto____99894
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-assoc", coll);
        }
      }
    }().call(null, coll, k, v)
  }
};
cljs.core.IMap = {};
cljs.core._dissoc = function _dissoc(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99895 = coll;
    if(cljs.core.truth_(and__3546__auto____99895)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____99895
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____99896 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99896)) {
        return or__3548__auto____99896
      }else {
        var or__3548__auto____99897 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____99897)) {
          return or__3548__auto____99897
        }else {
          throw cljs.core.missing_protocol.call(null, "IMap.-dissoc", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core.ISet = {};
cljs.core._disjoin = function _disjoin(coll, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99898 = coll;
    if(cljs.core.truth_(and__3546__auto____99898)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____99898
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____99899 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99899)) {
        return or__3548__auto____99899
      }else {
        var or__3548__auto____99900 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____99900)) {
          return or__3548__auto____99900
        }else {
          throw cljs.core.missing_protocol.call(null, "ISet.-disjoin", coll);
        }
      }
    }().call(null, coll, v)
  }
};
cljs.core.IStack = {};
cljs.core._peek = function _peek(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99901 = coll;
    if(cljs.core.truth_(and__3546__auto____99901)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____99901
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____99902 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99902)) {
        return or__3548__auto____99902
      }else {
        var or__3548__auto____99903 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____99903)) {
          return or__3548__auto____99903
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99904 = coll;
    if(cljs.core.truth_(and__3546__auto____99904)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____99904
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____99905 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99905)) {
        return or__3548__auto____99905
      }else {
        var or__3548__auto____99906 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____99906)) {
          return or__3548__auto____99906
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-pop", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IVector = {};
cljs.core._assoc_n = function _assoc_n(coll, n, val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99907 = coll;
    if(cljs.core.truth_(and__3546__auto____99907)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____99907
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____99908 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____99908)) {
        return or__3548__auto____99908
      }else {
        var or__3548__auto____99909 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____99909)) {
          return or__3548__auto____99909
        }else {
          throw cljs.core.missing_protocol.call(null, "IVector.-assoc-n", coll);
        }
      }
    }().call(null, coll, n, val)
  }
};
cljs.core.IDeref = {};
cljs.core._deref = function _deref(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99910 = o;
    if(cljs.core.truth_(and__3546__auto____99910)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____99910
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____99911 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99911)) {
        return or__3548__auto____99911
      }else {
        var or__3548__auto____99912 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____99912)) {
          return or__3548__auto____99912
        }else {
          throw cljs.core.missing_protocol.call(null, "IDeref.-deref", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = function _deref_with_timeout(o, msec, timeout_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99913 = o;
    if(cljs.core.truth_(and__3546__auto____99913)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____99913
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____99914 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99914)) {
        return or__3548__auto____99914
      }else {
        var or__3548__auto____99915 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____99915)) {
          return or__3548__auto____99915
        }else {
          throw cljs.core.missing_protocol.call(null, "IDerefWithTimeout.-deref-with-timeout", o);
        }
      }
    }().call(null, o, msec, timeout_val)
  }
};
cljs.core.IMeta = {};
cljs.core._meta = function _meta(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99916 = o;
    if(cljs.core.truth_(and__3546__auto____99916)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____99916
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____99917 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99917)) {
        return or__3548__auto____99917
      }else {
        var or__3548__auto____99918 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____99918)) {
          return or__3548__auto____99918
        }else {
          throw cljs.core.missing_protocol.call(null, "IMeta.-meta", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IWithMeta = {};
cljs.core._with_meta = function _with_meta(o, meta) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99919 = o;
    if(cljs.core.truth_(and__3546__auto____99919)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____99919
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____99920 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99920)) {
        return or__3548__auto____99920
      }else {
        var or__3548__auto____99921 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____99921)) {
          return or__3548__auto____99921
        }else {
          throw cljs.core.missing_protocol.call(null, "IWithMeta.-with-meta", o);
        }
      }
    }().call(null, o, meta)
  }
};
cljs.core.IReduce = {};
cljs.core._reduce = function() {
  var _reduce = null;
  var _reduce__99928 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99922 = coll;
      if(cljs.core.truth_(and__3546__auto____99922)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____99922
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____99923 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____99923)) {
          return or__3548__auto____99923
        }else {
          var or__3548__auto____99924 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____99924)) {
            return or__3548__auto____99924
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__99929 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____99925 = coll;
      if(cljs.core.truth_(and__3546__auto____99925)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____99925
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____99926 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____99926)) {
          return or__3548__auto____99926
        }else {
          var or__3548__auto____99927 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____99927)) {
            return or__3548__auto____99927
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f, start)
    }
  };
  _reduce = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return _reduce__99928.call(this, coll, f);
      case 3:
        return _reduce__99929.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99931 = o;
    if(cljs.core.truth_(and__3546__auto____99931)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____99931
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____99932 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99932)) {
        return or__3548__auto____99932
      }else {
        var or__3548__auto____99933 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____99933)) {
          return or__3548__auto____99933
        }else {
          throw cljs.core.missing_protocol.call(null, "IEquiv.-equiv", o);
        }
      }
    }().call(null, o, other)
  }
};
cljs.core.IHash = {};
cljs.core._hash = function _hash(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99934 = o;
    if(cljs.core.truth_(and__3546__auto____99934)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____99934
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____99935 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99935)) {
        return or__3548__auto____99935
      }else {
        var or__3548__auto____99936 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____99936)) {
          return or__3548__auto____99936
        }else {
          throw cljs.core.missing_protocol.call(null, "IHash.-hash", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISeqable = {};
cljs.core._seq = function _seq(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99937 = o;
    if(cljs.core.truth_(and__3546__auto____99937)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____99937
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____99938 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99938)) {
        return or__3548__auto____99938
      }else {
        var or__3548__auto____99939 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____99939)) {
          return or__3548__auto____99939
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeqable.-seq", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISequential = {};
cljs.core.IRecord = {};
cljs.core.IPrintable = {};
cljs.core._pr_seq = function _pr_seq(o, opts) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99940 = o;
    if(cljs.core.truth_(and__3546__auto____99940)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____99940
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____99941 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____99941)) {
        return or__3548__auto____99941
      }else {
        var or__3548__auto____99942 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____99942)) {
          return or__3548__auto____99942
        }else {
          throw cljs.core.missing_protocol.call(null, "IPrintable.-pr-seq", o);
        }
      }
    }().call(null, o, opts)
  }
};
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = function _realized_QMARK_(d) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99943 = d;
    if(cljs.core.truth_(and__3546__auto____99943)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____99943
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____99944 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____99944)) {
        return or__3548__auto____99944
      }else {
        var or__3548__auto____99945 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____99945)) {
          return or__3548__auto____99945
        }else {
          throw cljs.core.missing_protocol.call(null, "IPending.-realized?", d);
        }
      }
    }().call(null, d)
  }
};
cljs.core.IWatchable = {};
cljs.core._notify_watches = function _notify_watches(this$, oldval, newval) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99946 = this$;
    if(cljs.core.truth_(and__3546__auto____99946)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____99946
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____99947 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____99947)) {
        return or__3548__auto____99947
      }else {
        var or__3548__auto____99948 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____99948)) {
          return or__3548__auto____99948
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99949 = this$;
    if(cljs.core.truth_(and__3546__auto____99949)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____99949
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____99950 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____99950)) {
        return or__3548__auto____99950
      }else {
        var or__3548__auto____99951 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____99951)) {
          return or__3548__auto____99951
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____99952 = this$;
    if(cljs.core.truth_(and__3546__auto____99952)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____99952
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____99953 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____99953)) {
        return or__3548__auto____99953
      }else {
        var or__3548__auto____99954 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____99954)) {
          return or__3548__auto____99954
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-remove-watch", this$);
        }
      }
    }().call(null, this$, key)
  }
};
cljs.core.identical_QMARK_ = function identical_QMARK_(x, y) {
  return x === y
};
cljs.core._EQ_ = function _EQ_(x, y) {
  return cljs.core._equiv.call(null, x, y)
};
cljs.core.nil_QMARK_ = function nil_QMARK_(x) {
  return x === null
};
cljs.core.type = function type(x) {
  return x.constructor
};
cljs.core.IHash["null"] = true;
cljs.core._hash["null"] = function(o) {
  return 0
};
cljs.core.ILookup["null"] = true;
cljs.core._lookup["null"] = function() {
  var G__99955 = null;
  var G__99955__99956 = function(o, k) {
    return null
  };
  var G__99955__99957 = function(o, k, not_found) {
    return not_found
  };
  G__99955 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__99955__99956.call(this, o, k);
      case 3:
        return G__99955__99957.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__99955
}();
cljs.core.IAssociative["null"] = true;
cljs.core._assoc["null"] = function(_, k, v) {
  return cljs.core.hash_map.call(null, k, v)
};
cljs.core.ICollection["null"] = true;
cljs.core._conj["null"] = function(_, o) {
  return cljs.core.list.call(null, o)
};
cljs.core.IReduce["null"] = true;
cljs.core._reduce["null"] = function() {
  var G__99959 = null;
  var G__99959__99960 = function(_, f) {
    return f.call(null)
  };
  var G__99959__99961 = function(_, f, start) {
    return start
  };
  G__99959 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__99959__99960.call(this, _, f);
      case 3:
        return G__99959__99961.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__99959
}();
cljs.core.IPrintable["null"] = true;
cljs.core._pr_seq["null"] = function(o) {
  return cljs.core.list.call(null, "nil")
};
cljs.core.ISet["null"] = true;
cljs.core._disjoin["null"] = function(_, v) {
  return null
};
cljs.core.ICounted["null"] = true;
cljs.core._count["null"] = function(_) {
  return 0
};
cljs.core.IStack["null"] = true;
cljs.core._peek["null"] = function(_) {
  return null
};
cljs.core._pop["null"] = function(_) {
  return null
};
cljs.core.ISeq["null"] = true;
cljs.core._first["null"] = function(_) {
  return null
};
cljs.core._rest["null"] = function(_) {
  return cljs.core.list.call(null)
};
cljs.core.IEquiv["null"] = true;
cljs.core._equiv["null"] = function(_, o) {
  return o === null
};
cljs.core.IWithMeta["null"] = true;
cljs.core._with_meta["null"] = function(_, meta) {
  return null
};
cljs.core.IMeta["null"] = true;
cljs.core._meta["null"] = function(_) {
  return null
};
cljs.core.IIndexed["null"] = true;
cljs.core._nth["null"] = function() {
  var G__99963 = null;
  var G__99963__99964 = function(_, n) {
    return null
  };
  var G__99963__99965 = function(_, n, not_found) {
    return not_found
  };
  G__99963 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__99963__99964.call(this, _, n);
      case 3:
        return G__99963__99965.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__99963
}();
cljs.core.IEmptyableCollection["null"] = true;
cljs.core._empty["null"] = function(_) {
  return null
};
cljs.core.IMap["null"] = true;
cljs.core._dissoc["null"] = function(_, k) {
  return null
};
Date.prototype.cljs$core$IEquiv$ = true;
Date.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  return o.toString() === other.toString()
};
cljs.core.IHash["number"] = true;
cljs.core._hash["number"] = function(o) {
  return o
};
cljs.core.IEquiv["number"] = true;
cljs.core._equiv["number"] = function(x, o) {
  return x === o
};
cljs.core.IHash["boolean"] = true;
cljs.core._hash["boolean"] = function(o) {
  return o === true ? 1 : 0
};
cljs.core.IHash["function"] = true;
cljs.core._hash["function"] = function(o) {
  return goog.getUid.call(null, o)
};
cljs.core.inc = function inc(x) {
  return x + 1
};
cljs.core.ci_reduce = function() {
  var ci_reduce = null;
  var ci_reduce__99973 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__99967 = cljs.core._nth.call(null, cicoll, 0);
      var n__99968 = 1;
      while(true) {
        if(cljs.core.truth_(n__99968 < cljs.core._count.call(null, cicoll))) {
          var G__99977 = f.call(null, val__99967, cljs.core._nth.call(null, cicoll, n__99968));
          var G__99978 = n__99968 + 1;
          val__99967 = G__99977;
          n__99968 = G__99978;
          continue
        }else {
          return val__99967
        }
        break
      }
    }
  };
  var ci_reduce__99974 = function(cicoll, f, val) {
    var val__99969 = val;
    var n__99970 = 0;
    while(true) {
      if(cljs.core.truth_(n__99970 < cljs.core._count.call(null, cicoll))) {
        var G__99979 = f.call(null, val__99969, cljs.core._nth.call(null, cicoll, n__99970));
        var G__99980 = n__99970 + 1;
        val__99969 = G__99979;
        n__99970 = G__99980;
        continue
      }else {
        return val__99969
      }
      break
    }
  };
  var ci_reduce__99975 = function(cicoll, f, val, idx) {
    var val__99971 = val;
    var n__99972 = idx;
    while(true) {
      if(cljs.core.truth_(n__99972 < cljs.core._count.call(null, cicoll))) {
        var G__99981 = f.call(null, val__99971, cljs.core._nth.call(null, cicoll, n__99972));
        var G__99982 = n__99972 + 1;
        val__99971 = G__99981;
        n__99972 = G__99982;
        continue
      }else {
        return val__99971
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__99973.call(this, cicoll, f);
      case 3:
        return ci_reduce__99974.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__99975.call(this, cicoll, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ci_reduce
}();
cljs.core.IndexedSeq = function(a, i) {
  this.a = a;
  this.i = i
};
cljs.core.IndexedSeq.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.IndexedSeq")
};
cljs.core.IndexedSeq.prototype.cljs$core$IHash$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__99983 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__99996 = null;
  var G__99996__99997 = function(_, f) {
    var this__99984 = this;
    return cljs.core.ci_reduce.call(null, this__99984.a, f, this__99984.a[this__99984.i], this__99984.i + 1)
  };
  var G__99996__99998 = function(_, f, start) {
    var this__99985 = this;
    return cljs.core.ci_reduce.call(null, this__99985.a, f, start, this__99985.i)
  };
  G__99996 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__99996__99997.call(this, _, f);
      case 3:
        return G__99996__99998.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__99996
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__99986 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__99987 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__100000 = null;
  var G__100000__100001 = function(coll, n) {
    var this__99988 = this;
    var i__99989 = n + this__99988.i;
    if(cljs.core.truth_(i__99989 < this__99988.a.length)) {
      return this__99988.a[i__99989]
    }else {
      return null
    }
  };
  var G__100000__100002 = function(coll, n, not_found) {
    var this__99990 = this;
    var i__99991 = n + this__99990.i;
    if(cljs.core.truth_(i__99991 < this__99990.a.length)) {
      return this__99990.a[i__99991]
    }else {
      return not_found
    }
  };
  G__100000 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100000__100001.call(this, coll, n);
      case 3:
        return G__100000__100002.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100000
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__99992 = this;
  return this__99992.a.length - this__99992.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__99993 = this;
  return this__99993.a[this__99993.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__99994 = this;
  if(cljs.core.truth_(this__99994.i + 1 < this__99994.a.length)) {
    return new cljs.core.IndexedSeq(this__99994.a, this__99994.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__99995 = this;
  return this$
};
cljs.core.IndexedSeq;
cljs.core.prim_seq = function prim_seq(prim, i) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, prim.length))) {
    return null
  }else {
    return new cljs.core.IndexedSeq(prim, i)
  }
};
cljs.core.array_seq = function array_seq(array, i) {
  return cljs.core.prim_seq.call(null, array, i)
};
cljs.core.IReduce["array"] = true;
cljs.core._reduce["array"] = function() {
  var G__100004 = null;
  var G__100004__100005 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__100004__100006 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__100004 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__100004__100005.call(this, array, f);
      case 3:
        return G__100004__100006.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100004
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__100008 = null;
  var G__100008__100009 = function(array, k) {
    return array[k]
  };
  var G__100008__100010 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__100008 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100008__100009.call(this, array, k);
      case 3:
        return G__100008__100010.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100008
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__100012 = null;
  var G__100012__100013 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__100012__100014 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__100012 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100012__100013.call(this, array, n);
      case 3:
        return G__100012__100014.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100012
}();
cljs.core.ICounted["array"] = true;
cljs.core._count["array"] = function(a) {
  return a.length
};
cljs.core.ISeqable["array"] = true;
cljs.core._seq["array"] = function(array) {
  return cljs.core.array_seq.call(null, array, 0)
};
cljs.core.seq = function seq(coll) {
  if(cljs.core.truth_(coll)) {
    return cljs.core._seq.call(null, coll)
  }else {
    return null
  }
};
cljs.core.first = function first(coll) {
  var temp__3698__auto____100016 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____100016)) {
    var s__100017 = temp__3698__auto____100016;
    return cljs.core._first.call(null, s__100017)
  }else {
    return null
  }
};
cljs.core.rest = function rest(coll) {
  return cljs.core._rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.next = function next(coll) {
  if(cljs.core.truth_(coll)) {
    return cljs.core.seq.call(null, cljs.core.rest.call(null, coll))
  }else {
    return null
  }
};
cljs.core.second = function second(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.ffirst = function ffirst(coll) {
  return cljs.core.first.call(null, cljs.core.first.call(null, coll))
};
cljs.core.nfirst = function nfirst(coll) {
  return cljs.core.next.call(null, cljs.core.first.call(null, coll))
};
cljs.core.fnext = function fnext(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.nnext = function nnext(coll) {
  return cljs.core.next.call(null, cljs.core.next.call(null, coll))
};
cljs.core.last = function last(s) {
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s))) {
      var G__100018 = cljs.core.next.call(null, s);
      s = G__100018;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__100019 = cljs.core.seq.call(null, x);
  var n__100020 = 0;
  while(true) {
    if(cljs.core.truth_(s__100019)) {
      var G__100021 = cljs.core.next.call(null, s__100019);
      var G__100022 = n__100020 + 1;
      s__100019 = G__100021;
      n__100020 = G__100022;
      continue
    }else {
      return n__100020
    }
    break
  }
};
cljs.core.IEquiv["_"] = true;
cljs.core._equiv["_"] = function(x, o) {
  return x === o
};
cljs.core.not = function not(x) {
  if(cljs.core.truth_(x)) {
    return false
  }else {
    return true
  }
};
cljs.core.conj = function() {
  var conj = null;
  var conj__100023 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__100024 = function() {
    var G__100026__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__100027 = conj.call(null, coll, x);
          var G__100028 = cljs.core.first.call(null, xs);
          var G__100029 = cljs.core.next.call(null, xs);
          coll = G__100027;
          x = G__100028;
          xs = G__100029;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__100026 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100026__delegate.call(this, coll, x, xs)
    };
    G__100026.cljs$lang$maxFixedArity = 2;
    G__100026.cljs$lang$applyTo = function(arglist__100030) {
      var coll = cljs.core.first(arglist__100030);
      var x = cljs.core.first(cljs.core.next(arglist__100030));
      var xs = cljs.core.rest(cljs.core.next(arglist__100030));
      return G__100026__delegate.call(this, coll, x, xs)
    };
    return G__100026
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__100023.call(this, coll, x);
      default:
        return conj__100024.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__100024.cljs$lang$applyTo;
  return conj
}();
cljs.core.empty = function empty(coll) {
  return cljs.core._empty.call(null, coll)
};
cljs.core.count = function count(coll) {
  return cljs.core._count.call(null, coll)
};
cljs.core.nth = function() {
  var nth = null;
  var nth__100031 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__100032 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__100031.call(this, coll, n);
      case 3:
        return nth__100032.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__100034 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__100035 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__100034.call(this, o, k);
      case 3:
        return get__100035.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__100038 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__100039 = function() {
    var G__100041__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__100037 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__100042 = ret__100037;
          var G__100043 = cljs.core.first.call(null, kvs);
          var G__100044 = cljs.core.second.call(null, kvs);
          var G__100045 = cljs.core.nnext.call(null, kvs);
          coll = G__100042;
          k = G__100043;
          v = G__100044;
          kvs = G__100045;
          continue
        }else {
          return ret__100037
        }
        break
      }
    };
    var G__100041 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__100041__delegate.call(this, coll, k, v, kvs)
    };
    G__100041.cljs$lang$maxFixedArity = 3;
    G__100041.cljs$lang$applyTo = function(arglist__100046) {
      var coll = cljs.core.first(arglist__100046);
      var k = cljs.core.first(cljs.core.next(arglist__100046));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100046)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100046)));
      return G__100041__delegate.call(this, coll, k, v, kvs)
    };
    return G__100041
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__100038.call(this, coll, k, v);
      default:
        return assoc__100039.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__100039.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__100048 = function(coll) {
    return coll
  };
  var dissoc__100049 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__100050 = function() {
    var G__100052__delegate = function(coll, k, ks) {
      while(true) {
        var ret__100047 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__100053 = ret__100047;
          var G__100054 = cljs.core.first.call(null, ks);
          var G__100055 = cljs.core.next.call(null, ks);
          coll = G__100053;
          k = G__100054;
          ks = G__100055;
          continue
        }else {
          return ret__100047
        }
        break
      }
    };
    var G__100052 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100052__delegate.call(this, coll, k, ks)
    };
    G__100052.cljs$lang$maxFixedArity = 2;
    G__100052.cljs$lang$applyTo = function(arglist__100056) {
      var coll = cljs.core.first(arglist__100056);
      var k = cljs.core.first(cljs.core.next(arglist__100056));
      var ks = cljs.core.rest(cljs.core.next(arglist__100056));
      return G__100052__delegate.call(this, coll, k, ks)
    };
    return G__100052
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__100048.call(this, coll);
      case 2:
        return dissoc__100049.call(this, coll, k);
      default:
        return dissoc__100050.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__100050.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__451__auto____100057 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100058 = x__451__auto____100057;
      if(cljs.core.truth_(and__3546__auto____100058)) {
        var and__3546__auto____100059 = x__451__auto____100057.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____100059)) {
          return cljs.core.not.call(null, x__451__auto____100057.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____100059
        }
      }else {
        return and__3546__auto____100058
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__451__auto____100057)
    }
  }())) {
    return cljs.core._meta.call(null, o)
  }else {
    return null
  }
};
cljs.core.peek = function peek(coll) {
  return cljs.core._peek.call(null, coll)
};
cljs.core.pop = function pop(coll) {
  return cljs.core._pop.call(null, coll)
};
cljs.core.disj = function() {
  var disj = null;
  var disj__100061 = function(coll) {
    return coll
  };
  var disj__100062 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__100063 = function() {
    var G__100065__delegate = function(coll, k, ks) {
      while(true) {
        var ret__100060 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__100066 = ret__100060;
          var G__100067 = cljs.core.first.call(null, ks);
          var G__100068 = cljs.core.next.call(null, ks);
          coll = G__100066;
          k = G__100067;
          ks = G__100068;
          continue
        }else {
          return ret__100060
        }
        break
      }
    };
    var G__100065 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100065__delegate.call(this, coll, k, ks)
    };
    G__100065.cljs$lang$maxFixedArity = 2;
    G__100065.cljs$lang$applyTo = function(arglist__100069) {
      var coll = cljs.core.first(arglist__100069);
      var k = cljs.core.first(cljs.core.next(arglist__100069));
      var ks = cljs.core.rest(cljs.core.next(arglist__100069));
      return G__100065__delegate.call(this, coll, k, ks)
    };
    return G__100065
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__100061.call(this, coll);
      case 2:
        return disj__100062.call(this, coll, k);
      default:
        return disj__100063.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__100063.cljs$lang$applyTo;
  return disj
}();
cljs.core.hash = function hash(o) {
  return cljs.core._hash.call(null, o)
};
cljs.core.empty_QMARK_ = function empty_QMARK_(coll) {
  return cljs.core.not.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.coll_QMARK_ = function coll_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____100070 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100071 = x__451__auto____100070;
      if(cljs.core.truth_(and__3546__auto____100071)) {
        var and__3546__auto____100072 = x__451__auto____100070.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____100072)) {
          return cljs.core.not.call(null, x__451__auto____100070.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____100072
        }
      }else {
        return and__3546__auto____100071
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__451__auto____100070)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____100073 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100074 = x__451__auto____100073;
      if(cljs.core.truth_(and__3546__auto____100074)) {
        var and__3546__auto____100075 = x__451__auto____100073.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____100075)) {
          return cljs.core.not.call(null, x__451__auto____100073.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____100075
        }
      }else {
        return and__3546__auto____100074
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__451__auto____100073)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__451__auto____100076 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____100077 = x__451__auto____100076;
    if(cljs.core.truth_(and__3546__auto____100077)) {
      var and__3546__auto____100078 = x__451__auto____100076.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____100078)) {
        return cljs.core.not.call(null, x__451__auto____100076.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____100078
      }
    }else {
      return and__3546__auto____100077
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__451__auto____100076)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__451__auto____100079 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____100080 = x__451__auto____100079;
    if(cljs.core.truth_(and__3546__auto____100080)) {
      var and__3546__auto____100081 = x__451__auto____100079.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____100081)) {
        return cljs.core.not.call(null, x__451__auto____100079.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____100081
      }
    }else {
      return and__3546__auto____100080
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__451__auto____100079)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__451__auto____100082 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____100083 = x__451__auto____100082;
    if(cljs.core.truth_(and__3546__auto____100083)) {
      var and__3546__auto____100084 = x__451__auto____100082.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____100084)) {
        return cljs.core.not.call(null, x__451__auto____100082.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____100084
      }
    }else {
      return and__3546__auto____100083
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__451__auto____100082)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____100085 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100086 = x__451__auto____100085;
      if(cljs.core.truth_(and__3546__auto____100086)) {
        var and__3546__auto____100087 = x__451__auto____100085.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____100087)) {
          return cljs.core.not.call(null, x__451__auto____100085.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____100087
        }
      }else {
        return and__3546__auto____100086
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__451__auto____100085)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__451__auto____100088 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____100089 = x__451__auto____100088;
    if(cljs.core.truth_(and__3546__auto____100089)) {
      var and__3546__auto____100090 = x__451__auto____100088.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____100090)) {
        return cljs.core.not.call(null, x__451__auto____100088.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____100090
      }
    }else {
      return and__3546__auto____100089
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__451__auto____100088)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__100091 = [];
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__100091.push(key)
  });
  return keys__100091
};
cljs.core.js_delete = function js_delete(obj, key) {
  return delete obj[key]
};
cljs.core.lookup_sentinel = cljs.core.js_obj.call(null);
cljs.core.false_QMARK_ = function false_QMARK_(x) {
  return x === false
};
cljs.core.true_QMARK_ = function true_QMARK_(x) {
  return x === true
};
cljs.core.undefined_QMARK_ = function undefined_QMARK_(x) {
  return void 0 === x
};
cljs.core.instance_QMARK_ = function instance_QMARK_(t, o) {
  return o != null && (o instanceof t || o.constructor === t || t === Object)
};
cljs.core.seq_QMARK_ = function seq_QMARK_(s) {
  if(cljs.core.truth_(s === null)) {
    return false
  }else {
    var x__451__auto____100092 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100093 = x__451__auto____100092;
      if(cljs.core.truth_(and__3546__auto____100093)) {
        var and__3546__auto____100094 = x__451__auto____100092.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____100094)) {
          return cljs.core.not.call(null, x__451__auto____100092.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____100094
        }
      }else {
        return and__3546__auto____100093
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__451__auto____100092)
    }
  }
};
cljs.core.boolean$ = function boolean$(x) {
  if(cljs.core.truth_(x)) {
    return true
  }else {
    return false
  }
};
cljs.core.string_QMARK_ = function string_QMARK_(x) {
  var and__3546__auto____100095 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____100095)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____100096 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____100096)) {
        return or__3548__auto____100096
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____100095
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____100097 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____100097)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____100097
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____100098 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____100098)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____100098
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____100099 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____100099)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____100099
  }
};
cljs.core.contains_QMARK_ = function contains_QMARK_(coll, v) {
  if(cljs.core.truth_(cljs.core._lookup.call(null, coll, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)) {
    return false
  }else {
    return true
  }
};
cljs.core.find = function find(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____100100 = coll;
    if(cljs.core.truth_(and__3546__auto____100100)) {
      var and__3546__auto____100101 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____100101)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____100101
      }
    }else {
      return and__3546__auto____100100
    }
  }())) {
    return cljs.core.PersistentVector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___100106 = function(x) {
    return true
  };
  var distinct_QMARK___100107 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___100108 = function() {
    var G__100110__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__100102 = cljs.core.set([y, x]);
        var xs__100103 = more;
        while(true) {
          var x__100104 = cljs.core.first.call(null, xs__100103);
          var etc__100105 = cljs.core.next.call(null, xs__100103);
          if(cljs.core.truth_(xs__100103)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__100102, x__100104))) {
              return false
            }else {
              var G__100111 = cljs.core.conj.call(null, s__100102, x__100104);
              var G__100112 = etc__100105;
              s__100102 = G__100111;
              xs__100103 = G__100112;
              continue
            }
          }else {
            return true
          }
          break
        }
      }else {
        return false
      }
    };
    var G__100110 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100110__delegate.call(this, x, y, more)
    };
    G__100110.cljs$lang$maxFixedArity = 2;
    G__100110.cljs$lang$applyTo = function(arglist__100113) {
      var x = cljs.core.first(arglist__100113);
      var y = cljs.core.first(cljs.core.next(arglist__100113));
      var more = cljs.core.rest(cljs.core.next(arglist__100113));
      return G__100110__delegate.call(this, x, y, more)
    };
    return G__100110
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___100106.call(this, x);
      case 2:
        return distinct_QMARK___100107.call(this, x, y);
      default:
        return distinct_QMARK___100108.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___100108.cljs$lang$applyTo;
  return distinct_QMARK_
}();
cljs.core.compare = function compare(x, y) {
  return goog.array.defaultCompare.call(null, x, y)
};
cljs.core.fn__GT_comparator = function fn__GT_comparator(f) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, f, cljs.core.compare))) {
    return cljs.core.compare
  }else {
    return function(x, y) {
      var r__100114 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__100114))) {
        return r__100114
      }else {
        if(cljs.core.truth_(r__100114)) {
          return-1
        }else {
          if(cljs.core.truth_(f.call(null, y, x))) {
            return 1
          }else {
            return 0
          }
        }
      }
    }
  }
};
cljs.core.sort = function() {
  var sort = null;
  var sort__100116 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__100117 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__100115 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__100115, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__100115)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__100116.call(this, comp);
      case 2:
        return sort__100117.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__100119 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__100120 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__100119.call(this, keyfn, comp);
      case 3:
        return sort_by__100120.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__100122 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__100123 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__100122.call(this, f, val);
      case 3:
        return reduce__100123.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__100129 = function(f, coll) {
    var temp__3695__auto____100125 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____100125)) {
      var s__100126 = temp__3695__auto____100125;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__100126), cljs.core.next.call(null, s__100126))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__100130 = function(f, val, coll) {
    var val__100127 = val;
    var coll__100128 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__100128)) {
        var G__100132 = f.call(null, val__100127, cljs.core.first.call(null, coll__100128));
        var G__100133 = cljs.core.next.call(null, coll__100128);
        val__100127 = G__100132;
        coll__100128 = G__100133;
        continue
      }else {
        return val__100127
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__100129.call(this, f, val);
      case 3:
        return seq_reduce__100130.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__100134 = null;
  var G__100134__100135 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__100134__100136 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__100134 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__100134__100135.call(this, coll, f);
      case 3:
        return G__100134__100136.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100134
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___100138 = function() {
    return 0
  };
  var _PLUS___100139 = function(x) {
    return x
  };
  var _PLUS___100140 = function(x, y) {
    return x + y
  };
  var _PLUS___100141 = function() {
    var G__100143__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__100143 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100143__delegate.call(this, x, y, more)
    };
    G__100143.cljs$lang$maxFixedArity = 2;
    G__100143.cljs$lang$applyTo = function(arglist__100144) {
      var x = cljs.core.first(arglist__100144);
      var y = cljs.core.first(cljs.core.next(arglist__100144));
      var more = cljs.core.rest(cljs.core.next(arglist__100144));
      return G__100143__delegate.call(this, x, y, more)
    };
    return G__100143
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___100138.call(this);
      case 1:
        return _PLUS___100139.call(this, x);
      case 2:
        return _PLUS___100140.call(this, x, y);
      default:
        return _PLUS___100141.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___100141.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___100145 = function(x) {
    return-x
  };
  var ___100146 = function(x, y) {
    return x - y
  };
  var ___100147 = function() {
    var G__100149__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__100149 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100149__delegate.call(this, x, y, more)
    };
    G__100149.cljs$lang$maxFixedArity = 2;
    G__100149.cljs$lang$applyTo = function(arglist__100150) {
      var x = cljs.core.first(arglist__100150);
      var y = cljs.core.first(cljs.core.next(arglist__100150));
      var more = cljs.core.rest(cljs.core.next(arglist__100150));
      return G__100149__delegate.call(this, x, y, more)
    };
    return G__100149
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___100145.call(this, x);
      case 2:
        return ___100146.call(this, x, y);
      default:
        return ___100147.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___100147.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___100151 = function() {
    return 1
  };
  var _STAR___100152 = function(x) {
    return x
  };
  var _STAR___100153 = function(x, y) {
    return x * y
  };
  var _STAR___100154 = function() {
    var G__100156__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__100156 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100156__delegate.call(this, x, y, more)
    };
    G__100156.cljs$lang$maxFixedArity = 2;
    G__100156.cljs$lang$applyTo = function(arglist__100157) {
      var x = cljs.core.first(arglist__100157);
      var y = cljs.core.first(cljs.core.next(arglist__100157));
      var more = cljs.core.rest(cljs.core.next(arglist__100157));
      return G__100156__delegate.call(this, x, y, more)
    };
    return G__100156
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___100151.call(this);
      case 1:
        return _STAR___100152.call(this, x);
      case 2:
        return _STAR___100153.call(this, x, y);
      default:
        return _STAR___100154.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___100154.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___100158 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___100159 = function(x, y) {
    return x / y
  };
  var _SLASH___100160 = function() {
    var G__100162__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__100162 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100162__delegate.call(this, x, y, more)
    };
    G__100162.cljs$lang$maxFixedArity = 2;
    G__100162.cljs$lang$applyTo = function(arglist__100163) {
      var x = cljs.core.first(arglist__100163);
      var y = cljs.core.first(cljs.core.next(arglist__100163));
      var more = cljs.core.rest(cljs.core.next(arglist__100163));
      return G__100162__delegate.call(this, x, y, more)
    };
    return G__100162
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___100158.call(this, x);
      case 2:
        return _SLASH___100159.call(this, x, y);
      default:
        return _SLASH___100160.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___100160.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___100164 = function(x) {
    return true
  };
  var _LT___100165 = function(x, y) {
    return x < y
  };
  var _LT___100166 = function() {
    var G__100168__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__100169 = y;
            var G__100170 = cljs.core.first.call(null, more);
            var G__100171 = cljs.core.next.call(null, more);
            x = G__100169;
            y = G__100170;
            more = G__100171;
            continue
          }else {
            return y < cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__100168 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100168__delegate.call(this, x, y, more)
    };
    G__100168.cljs$lang$maxFixedArity = 2;
    G__100168.cljs$lang$applyTo = function(arglist__100172) {
      var x = cljs.core.first(arglist__100172);
      var y = cljs.core.first(cljs.core.next(arglist__100172));
      var more = cljs.core.rest(cljs.core.next(arglist__100172));
      return G__100168__delegate.call(this, x, y, more)
    };
    return G__100168
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___100164.call(this, x);
      case 2:
        return _LT___100165.call(this, x, y);
      default:
        return _LT___100166.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___100166.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___100173 = function(x) {
    return true
  };
  var _LT__EQ___100174 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___100175 = function() {
    var G__100177__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__100178 = y;
            var G__100179 = cljs.core.first.call(null, more);
            var G__100180 = cljs.core.next.call(null, more);
            x = G__100178;
            y = G__100179;
            more = G__100180;
            continue
          }else {
            return y <= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__100177 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100177__delegate.call(this, x, y, more)
    };
    G__100177.cljs$lang$maxFixedArity = 2;
    G__100177.cljs$lang$applyTo = function(arglist__100181) {
      var x = cljs.core.first(arglist__100181);
      var y = cljs.core.first(cljs.core.next(arglist__100181));
      var more = cljs.core.rest(cljs.core.next(arglist__100181));
      return G__100177__delegate.call(this, x, y, more)
    };
    return G__100177
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___100173.call(this, x);
      case 2:
        return _LT__EQ___100174.call(this, x, y);
      default:
        return _LT__EQ___100175.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___100175.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___100182 = function(x) {
    return true
  };
  var _GT___100183 = function(x, y) {
    return x > y
  };
  var _GT___100184 = function() {
    var G__100186__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__100187 = y;
            var G__100188 = cljs.core.first.call(null, more);
            var G__100189 = cljs.core.next.call(null, more);
            x = G__100187;
            y = G__100188;
            more = G__100189;
            continue
          }else {
            return y > cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__100186 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100186__delegate.call(this, x, y, more)
    };
    G__100186.cljs$lang$maxFixedArity = 2;
    G__100186.cljs$lang$applyTo = function(arglist__100190) {
      var x = cljs.core.first(arglist__100190);
      var y = cljs.core.first(cljs.core.next(arglist__100190));
      var more = cljs.core.rest(cljs.core.next(arglist__100190));
      return G__100186__delegate.call(this, x, y, more)
    };
    return G__100186
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___100182.call(this, x);
      case 2:
        return _GT___100183.call(this, x, y);
      default:
        return _GT___100184.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___100184.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___100191 = function(x) {
    return true
  };
  var _GT__EQ___100192 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___100193 = function() {
    var G__100195__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__100196 = y;
            var G__100197 = cljs.core.first.call(null, more);
            var G__100198 = cljs.core.next.call(null, more);
            x = G__100196;
            y = G__100197;
            more = G__100198;
            continue
          }else {
            return y >= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__100195 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100195__delegate.call(this, x, y, more)
    };
    G__100195.cljs$lang$maxFixedArity = 2;
    G__100195.cljs$lang$applyTo = function(arglist__100199) {
      var x = cljs.core.first(arglist__100199);
      var y = cljs.core.first(cljs.core.next(arglist__100199));
      var more = cljs.core.rest(cljs.core.next(arglist__100199));
      return G__100195__delegate.call(this, x, y, more)
    };
    return G__100195
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___100191.call(this, x);
      case 2:
        return _GT__EQ___100192.call(this, x, y);
      default:
        return _GT__EQ___100193.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___100193.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__100200 = function(x) {
    return x
  };
  var max__100201 = function(x, y) {
    return x > y ? x : y
  };
  var max__100202 = function() {
    var G__100204__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__100204 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100204__delegate.call(this, x, y, more)
    };
    G__100204.cljs$lang$maxFixedArity = 2;
    G__100204.cljs$lang$applyTo = function(arglist__100205) {
      var x = cljs.core.first(arglist__100205);
      var y = cljs.core.first(cljs.core.next(arglist__100205));
      var more = cljs.core.rest(cljs.core.next(arglist__100205));
      return G__100204__delegate.call(this, x, y, more)
    };
    return G__100204
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__100200.call(this, x);
      case 2:
        return max__100201.call(this, x, y);
      default:
        return max__100202.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__100202.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__100206 = function(x) {
    return x
  };
  var min__100207 = function(x, y) {
    return x < y ? x : y
  };
  var min__100208 = function() {
    var G__100210__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__100210 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100210__delegate.call(this, x, y, more)
    };
    G__100210.cljs$lang$maxFixedArity = 2;
    G__100210.cljs$lang$applyTo = function(arglist__100211) {
      var x = cljs.core.first(arglist__100211);
      var y = cljs.core.first(cljs.core.next(arglist__100211));
      var more = cljs.core.rest(cljs.core.next(arglist__100211));
      return G__100210__delegate.call(this, x, y, more)
    };
    return G__100210
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__100206.call(this, x);
      case 2:
        return min__100207.call(this, x, y);
      default:
        return min__100208.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__100208.cljs$lang$applyTo;
  return min
}();
cljs.core.fix = function fix(q) {
  if(cljs.core.truth_(q >= 0)) {
    return Math.floor.call(null, q)
  }else {
    return Math.ceil.call(null, q)
  }
};
cljs.core.mod = function mod(n, d) {
  return n % d
};
cljs.core.quot = function quot(n, d) {
  var rem__100212 = n % d;
  return cljs.core.fix.call(null, (n - rem__100212) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__100213 = cljs.core.quot.call(null, n, d);
  return n - d * q__100213
};
cljs.core.rand = function() {
  var rand = null;
  var rand__100214 = function() {
    return Math.random.call(null)
  };
  var rand__100215 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__100214.call(this);
      case 1:
        return rand__100215.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return cljs.core.fix.call(null, cljs.core.rand.call(null, n))
};
cljs.core.bit_xor = function bit_xor(x, y) {
  return x ^ y
};
cljs.core.bit_and = function bit_and(x, y) {
  return x & y
};
cljs.core.bit_or = function bit_or(x, y) {
  return x | y
};
cljs.core.bit_and_not = function bit_and_not(x, y) {
  return x & ~y
};
cljs.core.bit_clear = function bit_clear(x, n) {
  return x & ~(1 << n)
};
cljs.core.bit_flip = function bit_flip(x, n) {
  return x ^ 1 << n
};
cljs.core.bit_not = function bit_not(x) {
  return~x
};
cljs.core.bit_set = function bit_set(x, n) {
  return x | 1 << n
};
cljs.core.bit_test = function bit_test(x, n) {
  return(x & 1 << n) != 0
};
cljs.core.bit_shift_left = function bit_shift_left(x, n) {
  return x << n
};
cljs.core.bit_shift_right = function bit_shift_right(x, n) {
  return x >> n
};
cljs.core._EQ__EQ_ = function() {
  var _EQ__EQ_ = null;
  var _EQ__EQ___100217 = function(x) {
    return true
  };
  var _EQ__EQ___100218 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___100219 = function() {
    var G__100221__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__100222 = y;
            var G__100223 = cljs.core.first.call(null, more);
            var G__100224 = cljs.core.next.call(null, more);
            x = G__100222;
            y = G__100223;
            more = G__100224;
            continue
          }else {
            return _EQ__EQ_.call(null, y, cljs.core.first.call(null, more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__100221 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100221__delegate.call(this, x, y, more)
    };
    G__100221.cljs$lang$maxFixedArity = 2;
    G__100221.cljs$lang$applyTo = function(arglist__100225) {
      var x = cljs.core.first(arglist__100225);
      var y = cljs.core.first(cljs.core.next(arglist__100225));
      var more = cljs.core.rest(cljs.core.next(arglist__100225));
      return G__100221__delegate.call(this, x, y, more)
    };
    return G__100221
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___100217.call(this, x);
      case 2:
        return _EQ__EQ___100218.call(this, x, y);
      default:
        return _EQ__EQ___100219.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___100219.cljs$lang$applyTo;
  return _EQ__EQ_
}();
cljs.core.pos_QMARK_ = function pos_QMARK_(n) {
  return n > 0
};
cljs.core.zero_QMARK_ = function zero_QMARK_(n) {
  return n === 0
};
cljs.core.neg_QMARK_ = function neg_QMARK_(x) {
  return x < 0
};
cljs.core.nthnext = function nthnext(coll, n) {
  var n__100226 = n;
  var xs__100227 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____100228 = xs__100227;
      if(cljs.core.truth_(and__3546__auto____100228)) {
        return n__100226 > 0
      }else {
        return and__3546__auto____100228
      }
    }())) {
      var G__100229 = n__100226 - 1;
      var G__100230 = cljs.core.next.call(null, xs__100227);
      n__100226 = G__100229;
      xs__100227 = G__100230;
      continue
    }else {
      return xs__100227
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__100235 = null;
  var G__100235__100236 = function(coll, n) {
    var temp__3695__auto____100231 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____100231)) {
      var xs__100232 = temp__3695__auto____100231;
      return cljs.core.first.call(null, xs__100232)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__100235__100237 = function(coll, n, not_found) {
    var temp__3695__auto____100233 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____100233)) {
      var xs__100234 = temp__3695__auto____100233;
      return cljs.core.first.call(null, xs__100234)
    }else {
      return not_found
    }
  };
  G__100235 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100235__100236.call(this, coll, n);
      case 3:
        return G__100235__100237.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100235
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___100239 = function() {
    return""
  };
  var str_STAR___100240 = function(x) {
    if(cljs.core.truth_(x === null)) {
      return""
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return x.toString()
      }else {
        return null
      }
    }
  };
  var str_STAR___100241 = function() {
    var G__100243__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__100244 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__100245 = cljs.core.next.call(null, more);
            sb = G__100244;
            more = G__100245;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__100243 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__100243__delegate.call(this, x, ys)
    };
    G__100243.cljs$lang$maxFixedArity = 1;
    G__100243.cljs$lang$applyTo = function(arglist__100246) {
      var x = cljs.core.first(arglist__100246);
      var ys = cljs.core.rest(arglist__100246);
      return G__100243__delegate.call(this, x, ys)
    };
    return G__100243
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___100239.call(this);
      case 1:
        return str_STAR___100240.call(this, x);
      default:
        return str_STAR___100241.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___100241.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__100247 = function() {
    return""
  };
  var str__100248 = function(x) {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, x))) {
      return x.substring(2, x.length)
    }else {
      if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, x))) {
        return cljs.core.str_STAR_.call(null, ":", x.substring(2, x.length))
      }else {
        if(cljs.core.truth_(x === null)) {
          return""
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            return x.toString()
          }else {
            return null
          }
        }
      }
    }
  };
  var str__100249 = function() {
    var G__100251__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__100252 = sb.append(str.call(null, cljs.core.first.call(null, more)));
            var G__100253 = cljs.core.next.call(null, more);
            sb = G__100252;
            more = G__100253;
            continue
          }else {
            return cljs.core.str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.call(null, x)), ys)
    };
    var G__100251 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__100251__delegate.call(this, x, ys)
    };
    G__100251.cljs$lang$maxFixedArity = 1;
    G__100251.cljs$lang$applyTo = function(arglist__100254) {
      var x = cljs.core.first(arglist__100254);
      var ys = cljs.core.rest(arglist__100254);
      return G__100251__delegate.call(this, x, ys)
    };
    return G__100251
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__100247.call(this);
      case 1:
        return str__100248.call(this, x);
      default:
        return str__100249.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__100249.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__100255 = function(s, start) {
    return s.substring(start)
  };
  var subs__100256 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__100255.call(this, s, start);
      case 3:
        return subs__100256.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__100258 = function(name) {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, name))) {
      name
    }else {
      if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, name))) {
        cljs.core.str_STAR_.call(null, "\ufdd1", "'", cljs.core.subs.call(null, name, 2))
      }else {
      }
    }
    return cljs.core.str_STAR_.call(null, "\ufdd1", "'", name)
  };
  var symbol__100259 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__100258.call(this, ns);
      case 2:
        return symbol__100259.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__100261 = function(name) {
    if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, name))) {
      return name
    }else {
      if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, name))) {
        return cljs.core.str_STAR_.call(null, "\ufdd0", "'", cljs.core.subs.call(null, name, 2))
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          return cljs.core.str_STAR_.call(null, "\ufdd0", "'", name)
        }else {
          return null
        }
      }
    }
  };
  var keyword__100262 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__100261.call(this, ns);
      case 2:
        return keyword__100262.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__100264 = cljs.core.seq.call(null, x);
    var ys__100265 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__100264 === null)) {
        return ys__100265 === null
      }else {
        if(cljs.core.truth_(ys__100265 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__100264), cljs.core.first.call(null, ys__100265)))) {
            var G__100266 = cljs.core.next.call(null, xs__100264);
            var G__100267 = cljs.core.next.call(null, ys__100265);
            xs__100264 = G__100266;
            ys__100265 = G__100267;
            continue
          }else {
            if(cljs.core.truth_("\ufdd0'else")) {
              return false
            }else {
              return null
            }
          }
        }
      }
      break
    }
  }() : null)
};
cljs.core.hash_combine = function hash_combine(seed, hash) {
  return seed ^ hash + 2654435769 + (seed << 6) + (seed >> 2)
};
cljs.core.hash_coll = function hash_coll(coll) {
  return cljs.core.reduce.call(null, function(p1__100268_SHARP_, p2__100269_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__100268_SHARP_, cljs.core.hash.call(null, p2__100269_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__100270__100271 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__100270__100271)) {
    var G__100273__100275 = cljs.core.first.call(null, G__100270__100271);
    var vec__100274__100276 = G__100273__100275;
    var key_name__100277 = cljs.core.nth.call(null, vec__100274__100276, 0, null);
    var f__100278 = cljs.core.nth.call(null, vec__100274__100276, 1, null);
    var G__100270__100279 = G__100270__100271;
    var G__100273__100280 = G__100273__100275;
    var G__100270__100281 = G__100270__100279;
    while(true) {
      var vec__100282__100283 = G__100273__100280;
      var key_name__100284 = cljs.core.nth.call(null, vec__100282__100283, 0, null);
      var f__100285 = cljs.core.nth.call(null, vec__100282__100283, 1, null);
      var G__100270__100286 = G__100270__100281;
      var str_name__100287 = cljs.core.name.call(null, key_name__100284);
      obj[str_name__100287] = f__100285;
      var temp__3698__auto____100288 = cljs.core.next.call(null, G__100270__100286);
      if(cljs.core.truth_(temp__3698__auto____100288)) {
        var G__100270__100289 = temp__3698__auto____100288;
        var G__100290 = cljs.core.first.call(null, G__100270__100289);
        var G__100291 = G__100270__100289;
        G__100273__100280 = G__100290;
        G__100270__100281 = G__100291;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return obj
};
cljs.core.List = function(meta, first, rest, count) {
  this.meta = meta;
  this.first = first;
  this.rest = rest;
  this.count = count
};
cljs.core.List.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.List")
};
cljs.core.List.prototype.cljs$core$IHash$ = true;
cljs.core.List.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100292 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100293 = this;
  return new cljs.core.List(this__100293.meta, o, coll, this__100293.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100294 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__100295 = this;
  return this__100295.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__100296 = this;
  return this__100296.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__100297 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__100298 = this;
  return this__100298.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__100299 = this;
  return this__100299.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100300 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100301 = this;
  return new cljs.core.List(meta, this__100301.first, this__100301.rest, this__100301.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100302 = this;
  return this__100302.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100303 = this;
  return cljs.core.List.EMPTY
};
cljs.core.List;
cljs.core.EmptyList = function(meta) {
  this.meta = meta
};
cljs.core.EmptyList.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.EmptyList")
};
cljs.core.EmptyList.prototype.cljs$core$IHash$ = true;
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100304 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100305 = this;
  return new cljs.core.List(this__100305.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100306 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__100307 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__100308 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__100309 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__100310 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__100311 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100312 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100313 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100314 = this;
  return this__100314.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100315 = this;
  return coll
};
cljs.core.EmptyList;
cljs.core.List.EMPTY = new cljs.core.EmptyList(null);
cljs.core.reverse = function reverse(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
};
cljs.core.list = function() {
  var list__delegate = function(items) {
    return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, cljs.core.reverse.call(null, items))
  };
  var list = function(var_args) {
    var items = null;
    if(goog.isDef(var_args)) {
      items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return list__delegate.call(this, items)
  };
  list.cljs$lang$maxFixedArity = 0;
  list.cljs$lang$applyTo = function(arglist__100316) {
    var items = cljs.core.seq(arglist__100316);
    return list__delegate.call(this, items)
  };
  return list
}();
cljs.core.Cons = function(meta, first, rest) {
  this.meta = meta;
  this.first = first;
  this.rest = rest
};
cljs.core.Cons.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Cons")
};
cljs.core.Cons.prototype.cljs$core$ISeqable$ = true;
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100317 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100318 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100319 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100320 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__100320.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100321 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__100322 = this;
  return this__100322.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__100323 = this;
  if(cljs.core.truth_(this__100323.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__100323.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100324 = this;
  return this__100324.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100325 = this;
  return new cljs.core.Cons(meta, this__100325.first, this__100325.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__100326 = null;
  var G__100326__100327 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__100326__100328 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__100326 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__100326__100327.call(this, string, f);
      case 3:
        return G__100326__100328.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100326
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__100330 = null;
  var G__100330__100331 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__100330__100332 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__100330 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100330__100331.call(this, string, k);
      case 3:
        return G__100330__100332.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100330
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__100334 = null;
  var G__100334__100335 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__100334__100336 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__100334 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100334__100335.call(this, string, n);
      case 3:
        return G__100334__100336.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100334
}();
cljs.core.ICounted["string"] = true;
cljs.core._count["string"] = function(s) {
  return s.length
};
cljs.core.ISeqable["string"] = true;
cljs.core._seq["string"] = function(string) {
  return cljs.core.prim_seq.call(null, string, 0)
};
cljs.core.IHash["string"] = true;
cljs.core._hash["string"] = function(o) {
  return goog.string.hashCode.call(null, o)
};
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = function() {
  var G__100344 = null;
  var G__100344__100345 = function(tsym100338, coll) {
    var tsym100338__100340 = this;
    var this$__100341 = tsym100338__100340;
    return cljs.core.get.call(null, coll, this$__100341.toString())
  };
  var G__100344__100346 = function(tsym100339, coll, not_found) {
    var tsym100339__100342 = this;
    var this$__100343 = tsym100339__100342;
    return cljs.core.get.call(null, coll, this$__100343.toString(), not_found)
  };
  G__100344 = function(tsym100339, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100344__100345.call(this, tsym100339, coll);
      case 3:
        return G__100344__100346.call(this, tsym100339, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100344
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__100348 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__100348
  }else {
    lazy_seq.x = x__100348.call(null);
    lazy_seq.realized = true;
    return lazy_seq.x
  }
};
cljs.core.LazySeq = function(meta, realized, x) {
  this.meta = meta;
  this.realized = realized;
  this.x = x
};
cljs.core.LazySeq.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.LazySeq")
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100349 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100350 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100351 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100352 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__100352.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100353 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__100354 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__100355 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100356 = this;
  return this__100356.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100357 = this;
  return new cljs.core.LazySeq(meta, this__100357.realized, this__100357.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__100358 = [];
  var s__100359 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__100359))) {
      ary__100358.push(cljs.core.first.call(null, s__100359));
      var G__100360 = cljs.core.next.call(null, s__100359);
      s__100359 = G__100360;
      continue
    }else {
      return ary__100358
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__100361 = s;
  var i__100362 = n;
  var sum__100363 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____100364 = i__100362 > 0;
      if(cljs.core.truth_(and__3546__auto____100364)) {
        return cljs.core.seq.call(null, s__100361)
      }else {
        return and__3546__auto____100364
      }
    }())) {
      var G__100365 = cljs.core.next.call(null, s__100361);
      var G__100366 = i__100362 - 1;
      var G__100367 = sum__100363 + 1;
      s__100361 = G__100365;
      i__100362 = G__100366;
      sum__100363 = G__100367;
      continue
    }else {
      return sum__100363
    }
    break
  }
};
cljs.core.spread = function spread(arglist) {
  if(cljs.core.truth_(arglist === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core.next.call(null, arglist) === null)) {
      return cljs.core.seq.call(null, cljs.core.first.call(null, arglist))
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, arglist), spread.call(null, cljs.core.next.call(null, arglist)))
      }else {
        return null
      }
    }
  }
};
cljs.core.concat = function() {
  var concat = null;
  var concat__100371 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__100372 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__100373 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__100368 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__100368)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__100368), concat.call(null, cljs.core.rest.call(null, s__100368), y))
      }else {
        return y
      }
    })
  };
  var concat__100374 = function() {
    var G__100376__delegate = function(x, y, zs) {
      var cat__100370 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__100369 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__100369)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__100369), cat.call(null, cljs.core.rest.call(null, xys__100369), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__100370.call(null, concat.call(null, x, y), zs)
    };
    var G__100376 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100376__delegate.call(this, x, y, zs)
    };
    G__100376.cljs$lang$maxFixedArity = 2;
    G__100376.cljs$lang$applyTo = function(arglist__100377) {
      var x = cljs.core.first(arglist__100377);
      var y = cljs.core.first(cljs.core.next(arglist__100377));
      var zs = cljs.core.rest(cljs.core.next(arglist__100377));
      return G__100376__delegate.call(this, x, y, zs)
    };
    return G__100376
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__100371.call(this);
      case 1:
        return concat__100372.call(this, x);
      case 2:
        return concat__100373.call(this, x, y);
      default:
        return concat__100374.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__100374.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___100378 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___100379 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___100380 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___100381 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___100382 = function() {
    var G__100384__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__100384 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__100384__delegate.call(this, a, b, c, d, more)
    };
    G__100384.cljs$lang$maxFixedArity = 4;
    G__100384.cljs$lang$applyTo = function(arglist__100385) {
      var a = cljs.core.first(arglist__100385);
      var b = cljs.core.first(cljs.core.next(arglist__100385));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100385)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100385))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100385))));
      return G__100384__delegate.call(this, a, b, c, d, more)
    };
    return G__100384
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___100378.call(this, a);
      case 2:
        return list_STAR___100379.call(this, a, b);
      case 3:
        return list_STAR___100380.call(this, a, b, c);
      case 4:
        return list_STAR___100381.call(this, a, b, c, d);
      default:
        return list_STAR___100382.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___100382.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__100395 = function(f, args) {
    var fixed_arity__100386 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__100386 + 1) <= fixed_arity__100386)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__100396 = function(f, x, args) {
    var arglist__100387 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__100388 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__100387, fixed_arity__100388) <= fixed_arity__100388)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__100387))
      }else {
        return f.cljs$lang$applyTo(arglist__100387)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__100387))
    }
  };
  var apply__100397 = function(f, x, y, args) {
    var arglist__100389 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__100390 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__100389, fixed_arity__100390) <= fixed_arity__100390)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__100389))
      }else {
        return f.cljs$lang$applyTo(arglist__100389)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__100389))
    }
  };
  var apply__100398 = function(f, x, y, z, args) {
    var arglist__100391 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__100392 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__100391, fixed_arity__100392) <= fixed_arity__100392)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__100391))
      }else {
        return f.cljs$lang$applyTo(arglist__100391)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__100391))
    }
  };
  var apply__100399 = function() {
    var G__100401__delegate = function(f, a, b, c, d, args) {
      var arglist__100393 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__100394 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__100393, fixed_arity__100394) <= fixed_arity__100394)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__100393))
        }else {
          return f.cljs$lang$applyTo(arglist__100393)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__100393))
      }
    };
    var G__100401 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__100401__delegate.call(this, f, a, b, c, d, args)
    };
    G__100401.cljs$lang$maxFixedArity = 5;
    G__100401.cljs$lang$applyTo = function(arglist__100402) {
      var f = cljs.core.first(arglist__100402);
      var a = cljs.core.first(cljs.core.next(arglist__100402));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100402)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100402))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100402)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100402)))));
      return G__100401__delegate.call(this, f, a, b, c, d, args)
    };
    return G__100401
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__100395.call(this, f, a);
      case 3:
        return apply__100396.call(this, f, a, b);
      case 4:
        return apply__100397.call(this, f, a, b, c);
      case 5:
        return apply__100398.call(this, f, a, b, c, d);
      default:
        return apply__100399.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__100399.cljs$lang$applyTo;
  return apply
}();
cljs.core.vary_meta = function() {
  var vary_meta__delegate = function(obj, f, args) {
    return cljs.core.with_meta.call(null, obj, cljs.core.apply.call(null, f, cljs.core.meta.call(null, obj), args))
  };
  var vary_meta = function(obj, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return vary_meta__delegate.call(this, obj, f, args)
  };
  vary_meta.cljs$lang$maxFixedArity = 2;
  vary_meta.cljs$lang$applyTo = function(arglist__100403) {
    var obj = cljs.core.first(arglist__100403);
    var f = cljs.core.first(cljs.core.next(arglist__100403));
    var args = cljs.core.rest(cljs.core.next(arglist__100403));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___100404 = function(x) {
    return false
  };
  var not_EQ___100405 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___100406 = function() {
    var G__100408__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__100408 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100408__delegate.call(this, x, y, more)
    };
    G__100408.cljs$lang$maxFixedArity = 2;
    G__100408.cljs$lang$applyTo = function(arglist__100409) {
      var x = cljs.core.first(arglist__100409);
      var y = cljs.core.first(cljs.core.next(arglist__100409));
      var more = cljs.core.rest(cljs.core.next(arglist__100409));
      return G__100408__delegate.call(this, x, y, more)
    };
    return G__100408
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___100404.call(this, x);
      case 2:
        return not_EQ___100405.call(this, x, y);
      default:
        return not_EQ___100406.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___100406.cljs$lang$applyTo;
  return not_EQ_
}();
cljs.core.not_empty = function not_empty(coll) {
  if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
    return coll
  }else {
    return null
  }
};
cljs.core.every_QMARK_ = function every_QMARK_(pred, coll) {
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll) === null)) {
      return true
    }else {
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, coll)))) {
        var G__100410 = pred;
        var G__100411 = cljs.core.next.call(null, coll);
        pred = G__100410;
        coll = G__100411;
        continue
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          return false
        }else {
          return null
        }
      }
    }
    break
  }
};
cljs.core.not_every_QMARK_ = function not_every_QMARK_(pred, coll) {
  return cljs.core.not.call(null, cljs.core.every_QMARK_.call(null, pred, coll))
};
cljs.core.some = function some(pred, coll) {
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var or__3548__auto____100412 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____100412)) {
        return or__3548__auto____100412
      }else {
        var G__100413 = pred;
        var G__100414 = cljs.core.next.call(null, coll);
        pred = G__100413;
        coll = G__100414;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.not_any_QMARK_ = function not_any_QMARK_(pred, coll) {
  return cljs.core.not.call(null, cljs.core.some.call(null, pred, coll))
};
cljs.core.even_QMARK_ = function even_QMARK_(n) {
  if(cljs.core.truth_(cljs.core.integer_QMARK_.call(null, n))) {
    return(n & 1) === 0
  }else {
    throw new Error(cljs.core.str.call(null, "Argument must be an integer: ", n));
  }
};
cljs.core.odd_QMARK_ = function odd_QMARK_(n) {
  return cljs.core.not.call(null, cljs.core.even_QMARK_.call(null, n))
};
cljs.core.identity = function identity(x) {
  return x
};
cljs.core.complement = function complement(f) {
  return function() {
    var G__100415 = null;
    var G__100415__100416 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__100415__100417 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__100415__100418 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__100415__100419 = function() {
      var G__100421__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__100421 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__100421__delegate.call(this, x, y, zs)
      };
      G__100421.cljs$lang$maxFixedArity = 2;
      G__100421.cljs$lang$applyTo = function(arglist__100422) {
        var x = cljs.core.first(arglist__100422);
        var y = cljs.core.first(cljs.core.next(arglist__100422));
        var zs = cljs.core.rest(cljs.core.next(arglist__100422));
        return G__100421__delegate.call(this, x, y, zs)
      };
      return G__100421
    }();
    G__100415 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__100415__100416.call(this);
        case 1:
          return G__100415__100417.call(this, x);
        case 2:
          return G__100415__100418.call(this, x, y);
        default:
          return G__100415__100419.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__100415.cljs$lang$maxFixedArity = 2;
    G__100415.cljs$lang$applyTo = G__100415__100419.cljs$lang$applyTo;
    return G__100415
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__100423__delegate = function(args) {
      return x
    };
    var G__100423 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__100423__delegate.call(this, args)
    };
    G__100423.cljs$lang$maxFixedArity = 0;
    G__100423.cljs$lang$applyTo = function(arglist__100424) {
      var args = cljs.core.seq(arglist__100424);
      return G__100423__delegate.call(this, args)
    };
    return G__100423
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__100428 = function() {
    return cljs.core.identity
  };
  var comp__100429 = function(f) {
    return f
  };
  var comp__100430 = function(f, g) {
    return function() {
      var G__100434 = null;
      var G__100434__100435 = function() {
        return f.call(null, g.call(null))
      };
      var G__100434__100436 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__100434__100437 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__100434__100438 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__100434__100439 = function() {
        var G__100441__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__100441 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100441__delegate.call(this, x, y, z, args)
        };
        G__100441.cljs$lang$maxFixedArity = 3;
        G__100441.cljs$lang$applyTo = function(arglist__100442) {
          var x = cljs.core.first(arglist__100442);
          var y = cljs.core.first(cljs.core.next(arglist__100442));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100442)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100442)));
          return G__100441__delegate.call(this, x, y, z, args)
        };
        return G__100441
      }();
      G__100434 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__100434__100435.call(this);
          case 1:
            return G__100434__100436.call(this, x);
          case 2:
            return G__100434__100437.call(this, x, y);
          case 3:
            return G__100434__100438.call(this, x, y, z);
          default:
            return G__100434__100439.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__100434.cljs$lang$maxFixedArity = 3;
      G__100434.cljs$lang$applyTo = G__100434__100439.cljs$lang$applyTo;
      return G__100434
    }()
  };
  var comp__100431 = function(f, g, h) {
    return function() {
      var G__100443 = null;
      var G__100443__100444 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__100443__100445 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__100443__100446 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__100443__100447 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__100443__100448 = function() {
        var G__100450__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__100450 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100450__delegate.call(this, x, y, z, args)
        };
        G__100450.cljs$lang$maxFixedArity = 3;
        G__100450.cljs$lang$applyTo = function(arglist__100451) {
          var x = cljs.core.first(arglist__100451);
          var y = cljs.core.first(cljs.core.next(arglist__100451));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100451)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100451)));
          return G__100450__delegate.call(this, x, y, z, args)
        };
        return G__100450
      }();
      G__100443 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__100443__100444.call(this);
          case 1:
            return G__100443__100445.call(this, x);
          case 2:
            return G__100443__100446.call(this, x, y);
          case 3:
            return G__100443__100447.call(this, x, y, z);
          default:
            return G__100443__100448.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__100443.cljs$lang$maxFixedArity = 3;
      G__100443.cljs$lang$applyTo = G__100443__100448.cljs$lang$applyTo;
      return G__100443
    }()
  };
  var comp__100432 = function() {
    var G__100452__delegate = function(f1, f2, f3, fs) {
      var fs__100425 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__100453__delegate = function(args) {
          var ret__100426 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__100425), args);
          var fs__100427 = cljs.core.next.call(null, fs__100425);
          while(true) {
            if(cljs.core.truth_(fs__100427)) {
              var G__100454 = cljs.core.first.call(null, fs__100427).call(null, ret__100426);
              var G__100455 = cljs.core.next.call(null, fs__100427);
              ret__100426 = G__100454;
              fs__100427 = G__100455;
              continue
            }else {
              return ret__100426
            }
            break
          }
        };
        var G__100453 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__100453__delegate.call(this, args)
        };
        G__100453.cljs$lang$maxFixedArity = 0;
        G__100453.cljs$lang$applyTo = function(arglist__100456) {
          var args = cljs.core.seq(arglist__100456);
          return G__100453__delegate.call(this, args)
        };
        return G__100453
      }()
    };
    var G__100452 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__100452__delegate.call(this, f1, f2, f3, fs)
    };
    G__100452.cljs$lang$maxFixedArity = 3;
    G__100452.cljs$lang$applyTo = function(arglist__100457) {
      var f1 = cljs.core.first(arglist__100457);
      var f2 = cljs.core.first(cljs.core.next(arglist__100457));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100457)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100457)));
      return G__100452__delegate.call(this, f1, f2, f3, fs)
    };
    return G__100452
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__100428.call(this);
      case 1:
        return comp__100429.call(this, f1);
      case 2:
        return comp__100430.call(this, f1, f2);
      case 3:
        return comp__100431.call(this, f1, f2, f3);
      default:
        return comp__100432.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__100432.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__100458 = function(f, arg1) {
    return function() {
      var G__100463__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__100463 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__100463__delegate.call(this, args)
      };
      G__100463.cljs$lang$maxFixedArity = 0;
      G__100463.cljs$lang$applyTo = function(arglist__100464) {
        var args = cljs.core.seq(arglist__100464);
        return G__100463__delegate.call(this, args)
      };
      return G__100463
    }()
  };
  var partial__100459 = function(f, arg1, arg2) {
    return function() {
      var G__100465__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__100465 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__100465__delegate.call(this, args)
      };
      G__100465.cljs$lang$maxFixedArity = 0;
      G__100465.cljs$lang$applyTo = function(arglist__100466) {
        var args = cljs.core.seq(arglist__100466);
        return G__100465__delegate.call(this, args)
      };
      return G__100465
    }()
  };
  var partial__100460 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__100467__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__100467 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__100467__delegate.call(this, args)
      };
      G__100467.cljs$lang$maxFixedArity = 0;
      G__100467.cljs$lang$applyTo = function(arglist__100468) {
        var args = cljs.core.seq(arglist__100468);
        return G__100467__delegate.call(this, args)
      };
      return G__100467
    }()
  };
  var partial__100461 = function() {
    var G__100469__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__100470__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__100470 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__100470__delegate.call(this, args)
        };
        G__100470.cljs$lang$maxFixedArity = 0;
        G__100470.cljs$lang$applyTo = function(arglist__100471) {
          var args = cljs.core.seq(arglist__100471);
          return G__100470__delegate.call(this, args)
        };
        return G__100470
      }()
    };
    var G__100469 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__100469__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__100469.cljs$lang$maxFixedArity = 4;
    G__100469.cljs$lang$applyTo = function(arglist__100472) {
      var f = cljs.core.first(arglist__100472);
      var arg1 = cljs.core.first(cljs.core.next(arglist__100472));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100472)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100472))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100472))));
      return G__100469__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__100469
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__100458.call(this, f, arg1);
      case 3:
        return partial__100459.call(this, f, arg1, arg2);
      case 4:
        return partial__100460.call(this, f, arg1, arg2, arg3);
      default:
        return partial__100461.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__100461.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__100473 = function(f, x) {
    return function() {
      var G__100477 = null;
      var G__100477__100478 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__100477__100479 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__100477__100480 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__100477__100481 = function() {
        var G__100483__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__100483 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100483__delegate.call(this, a, b, c, ds)
        };
        G__100483.cljs$lang$maxFixedArity = 3;
        G__100483.cljs$lang$applyTo = function(arglist__100484) {
          var a = cljs.core.first(arglist__100484);
          var b = cljs.core.first(cljs.core.next(arglist__100484));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100484)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100484)));
          return G__100483__delegate.call(this, a, b, c, ds)
        };
        return G__100483
      }();
      G__100477 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__100477__100478.call(this, a);
          case 2:
            return G__100477__100479.call(this, a, b);
          case 3:
            return G__100477__100480.call(this, a, b, c);
          default:
            return G__100477__100481.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__100477.cljs$lang$maxFixedArity = 3;
      G__100477.cljs$lang$applyTo = G__100477__100481.cljs$lang$applyTo;
      return G__100477
    }()
  };
  var fnil__100474 = function(f, x, y) {
    return function() {
      var G__100485 = null;
      var G__100485__100486 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__100485__100487 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__100485__100488 = function() {
        var G__100490__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__100490 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100490__delegate.call(this, a, b, c, ds)
        };
        G__100490.cljs$lang$maxFixedArity = 3;
        G__100490.cljs$lang$applyTo = function(arglist__100491) {
          var a = cljs.core.first(arglist__100491);
          var b = cljs.core.first(cljs.core.next(arglist__100491));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100491)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100491)));
          return G__100490__delegate.call(this, a, b, c, ds)
        };
        return G__100490
      }();
      G__100485 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__100485__100486.call(this, a, b);
          case 3:
            return G__100485__100487.call(this, a, b, c);
          default:
            return G__100485__100488.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__100485.cljs$lang$maxFixedArity = 3;
      G__100485.cljs$lang$applyTo = G__100485__100488.cljs$lang$applyTo;
      return G__100485
    }()
  };
  var fnil__100475 = function(f, x, y, z) {
    return function() {
      var G__100492 = null;
      var G__100492__100493 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__100492__100494 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__100492__100495 = function() {
        var G__100497__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__100497 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100497__delegate.call(this, a, b, c, ds)
        };
        G__100497.cljs$lang$maxFixedArity = 3;
        G__100497.cljs$lang$applyTo = function(arglist__100498) {
          var a = cljs.core.first(arglist__100498);
          var b = cljs.core.first(cljs.core.next(arglist__100498));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100498)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100498)));
          return G__100497__delegate.call(this, a, b, c, ds)
        };
        return G__100497
      }();
      G__100492 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__100492__100493.call(this, a, b);
          case 3:
            return G__100492__100494.call(this, a, b, c);
          default:
            return G__100492__100495.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__100492.cljs$lang$maxFixedArity = 3;
      G__100492.cljs$lang$applyTo = G__100492__100495.cljs$lang$applyTo;
      return G__100492
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__100473.call(this, f, x);
      case 3:
        return fnil__100474.call(this, f, x, y);
      case 4:
        return fnil__100475.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__100501 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____100499 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____100499)) {
        var s__100500 = temp__3698__auto____100499;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__100500)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__100500)))
      }else {
        return null
      }
    })
  };
  return mapi__100501.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____100502 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____100502)) {
      var s__100503 = temp__3698__auto____100502;
      var x__100504 = f.call(null, cljs.core.first.call(null, s__100503));
      if(cljs.core.truth_(x__100504 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__100503))
      }else {
        return cljs.core.cons.call(null, x__100504, keep.call(null, f, cljs.core.rest.call(null, s__100503)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__100514 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____100511 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____100511)) {
        var s__100512 = temp__3698__auto____100511;
        var x__100513 = f.call(null, idx, cljs.core.first.call(null, s__100512));
        if(cljs.core.truth_(x__100513 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__100512))
        }else {
          return cljs.core.cons.call(null, x__100513, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__100512)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__100514.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__100559 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__100564 = function() {
        return true
      };
      var ep1__100565 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__100566 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100521 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100521)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____100521
          }
        }())
      };
      var ep1__100567 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100522 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100522)) {
            var and__3546__auto____100523 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____100523)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____100523
            }
          }else {
            return and__3546__auto____100522
          }
        }())
      };
      var ep1__100568 = function() {
        var G__100570__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____100524 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____100524)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____100524
            }
          }())
        };
        var G__100570 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100570__delegate.call(this, x, y, z, args)
        };
        G__100570.cljs$lang$maxFixedArity = 3;
        G__100570.cljs$lang$applyTo = function(arglist__100571) {
          var x = cljs.core.first(arglist__100571);
          var y = cljs.core.first(cljs.core.next(arglist__100571));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100571)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100571)));
          return G__100570__delegate.call(this, x, y, z, args)
        };
        return G__100570
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__100564.call(this);
          case 1:
            return ep1__100565.call(this, x);
          case 2:
            return ep1__100566.call(this, x, y);
          case 3:
            return ep1__100567.call(this, x, y, z);
          default:
            return ep1__100568.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__100568.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__100560 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__100572 = function() {
        return true
      };
      var ep2__100573 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100525 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100525)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____100525
          }
        }())
      };
      var ep2__100574 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100526 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100526)) {
            var and__3546__auto____100527 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____100527)) {
              var and__3546__auto____100528 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____100528)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____100528
              }
            }else {
              return and__3546__auto____100527
            }
          }else {
            return and__3546__auto____100526
          }
        }())
      };
      var ep2__100575 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100529 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100529)) {
            var and__3546__auto____100530 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____100530)) {
              var and__3546__auto____100531 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____100531)) {
                var and__3546__auto____100532 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____100532)) {
                  var and__3546__auto____100533 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____100533)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____100533
                  }
                }else {
                  return and__3546__auto____100532
                }
              }else {
                return and__3546__auto____100531
              }
            }else {
              return and__3546__auto____100530
            }
          }else {
            return and__3546__auto____100529
          }
        }())
      };
      var ep2__100576 = function() {
        var G__100578__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____100534 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____100534)) {
              return cljs.core.every_QMARK_.call(null, function(p1__100505_SHARP_) {
                var and__3546__auto____100535 = p1.call(null, p1__100505_SHARP_);
                if(cljs.core.truth_(and__3546__auto____100535)) {
                  return p2.call(null, p1__100505_SHARP_)
                }else {
                  return and__3546__auto____100535
                }
              }, args)
            }else {
              return and__3546__auto____100534
            }
          }())
        };
        var G__100578 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100578__delegate.call(this, x, y, z, args)
        };
        G__100578.cljs$lang$maxFixedArity = 3;
        G__100578.cljs$lang$applyTo = function(arglist__100579) {
          var x = cljs.core.first(arglist__100579);
          var y = cljs.core.first(cljs.core.next(arglist__100579));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100579)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100579)));
          return G__100578__delegate.call(this, x, y, z, args)
        };
        return G__100578
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__100572.call(this);
          case 1:
            return ep2__100573.call(this, x);
          case 2:
            return ep2__100574.call(this, x, y);
          case 3:
            return ep2__100575.call(this, x, y, z);
          default:
            return ep2__100576.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__100576.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__100561 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__100580 = function() {
        return true
      };
      var ep3__100581 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100536 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100536)) {
            var and__3546__auto____100537 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____100537)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____100537
            }
          }else {
            return and__3546__auto____100536
          }
        }())
      };
      var ep3__100582 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100538 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100538)) {
            var and__3546__auto____100539 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____100539)) {
              var and__3546__auto____100540 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____100540)) {
                var and__3546__auto____100541 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____100541)) {
                  var and__3546__auto____100542 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____100542)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____100542
                  }
                }else {
                  return and__3546__auto____100541
                }
              }else {
                return and__3546__auto____100540
              }
            }else {
              return and__3546__auto____100539
            }
          }else {
            return and__3546__auto____100538
          }
        }())
      };
      var ep3__100583 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____100543 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____100543)) {
            var and__3546__auto____100544 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____100544)) {
              var and__3546__auto____100545 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____100545)) {
                var and__3546__auto____100546 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____100546)) {
                  var and__3546__auto____100547 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____100547)) {
                    var and__3546__auto____100548 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____100548)) {
                      var and__3546__auto____100549 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____100549)) {
                        var and__3546__auto____100550 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____100550)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____100550
                        }
                      }else {
                        return and__3546__auto____100549
                      }
                    }else {
                      return and__3546__auto____100548
                    }
                  }else {
                    return and__3546__auto____100547
                  }
                }else {
                  return and__3546__auto____100546
                }
              }else {
                return and__3546__auto____100545
              }
            }else {
              return and__3546__auto____100544
            }
          }else {
            return and__3546__auto____100543
          }
        }())
      };
      var ep3__100584 = function() {
        var G__100586__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____100551 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____100551)) {
              return cljs.core.every_QMARK_.call(null, function(p1__100506_SHARP_) {
                var and__3546__auto____100552 = p1.call(null, p1__100506_SHARP_);
                if(cljs.core.truth_(and__3546__auto____100552)) {
                  var and__3546__auto____100553 = p2.call(null, p1__100506_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____100553)) {
                    return p3.call(null, p1__100506_SHARP_)
                  }else {
                    return and__3546__auto____100553
                  }
                }else {
                  return and__3546__auto____100552
                }
              }, args)
            }else {
              return and__3546__auto____100551
            }
          }())
        };
        var G__100586 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100586__delegate.call(this, x, y, z, args)
        };
        G__100586.cljs$lang$maxFixedArity = 3;
        G__100586.cljs$lang$applyTo = function(arglist__100587) {
          var x = cljs.core.first(arglist__100587);
          var y = cljs.core.first(cljs.core.next(arglist__100587));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100587)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100587)));
          return G__100586__delegate.call(this, x, y, z, args)
        };
        return G__100586
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__100580.call(this);
          case 1:
            return ep3__100581.call(this, x);
          case 2:
            return ep3__100582.call(this, x, y);
          case 3:
            return ep3__100583.call(this, x, y, z);
          default:
            return ep3__100584.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__100584.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__100562 = function() {
    var G__100588__delegate = function(p1, p2, p3, ps) {
      var ps__100554 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__100589 = function() {
          return true
        };
        var epn__100590 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__100507_SHARP_) {
            return p1__100507_SHARP_.call(null, x)
          }, ps__100554)
        };
        var epn__100591 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__100508_SHARP_) {
            var and__3546__auto____100555 = p1__100508_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____100555)) {
              return p1__100508_SHARP_.call(null, y)
            }else {
              return and__3546__auto____100555
            }
          }, ps__100554)
        };
        var epn__100592 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__100509_SHARP_) {
            var and__3546__auto____100556 = p1__100509_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____100556)) {
              var and__3546__auto____100557 = p1__100509_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____100557)) {
                return p1__100509_SHARP_.call(null, z)
              }else {
                return and__3546__auto____100557
              }
            }else {
              return and__3546__auto____100556
            }
          }, ps__100554)
        };
        var epn__100593 = function() {
          var G__100595__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____100558 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____100558)) {
                return cljs.core.every_QMARK_.call(null, function(p1__100510_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__100510_SHARP_, args)
                }, ps__100554)
              }else {
                return and__3546__auto____100558
              }
            }())
          };
          var G__100595 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__100595__delegate.call(this, x, y, z, args)
          };
          G__100595.cljs$lang$maxFixedArity = 3;
          G__100595.cljs$lang$applyTo = function(arglist__100596) {
            var x = cljs.core.first(arglist__100596);
            var y = cljs.core.first(cljs.core.next(arglist__100596));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100596)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100596)));
            return G__100595__delegate.call(this, x, y, z, args)
          };
          return G__100595
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__100589.call(this);
            case 1:
              return epn__100590.call(this, x);
            case 2:
              return epn__100591.call(this, x, y);
            case 3:
              return epn__100592.call(this, x, y, z);
            default:
              return epn__100593.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__100593.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__100588 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__100588__delegate.call(this, p1, p2, p3, ps)
    };
    G__100588.cljs$lang$maxFixedArity = 3;
    G__100588.cljs$lang$applyTo = function(arglist__100597) {
      var p1 = cljs.core.first(arglist__100597);
      var p2 = cljs.core.first(cljs.core.next(arglist__100597));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100597)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100597)));
      return G__100588__delegate.call(this, p1, p2, p3, ps)
    };
    return G__100588
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__100559.call(this, p1);
      case 2:
        return every_pred__100560.call(this, p1, p2);
      case 3:
        return every_pred__100561.call(this, p1, p2, p3);
      default:
        return every_pred__100562.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__100562.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__100637 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__100642 = function() {
        return null
      };
      var sp1__100643 = function(x) {
        return p.call(null, x)
      };
      var sp1__100644 = function(x, y) {
        var or__3548__auto____100599 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100599)) {
          return or__3548__auto____100599
        }else {
          return p.call(null, y)
        }
      };
      var sp1__100645 = function(x, y, z) {
        var or__3548__auto____100600 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100600)) {
          return or__3548__auto____100600
        }else {
          var or__3548__auto____100601 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____100601)) {
            return or__3548__auto____100601
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__100646 = function() {
        var G__100648__delegate = function(x, y, z, args) {
          var or__3548__auto____100602 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____100602)) {
            return or__3548__auto____100602
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__100648 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100648__delegate.call(this, x, y, z, args)
        };
        G__100648.cljs$lang$maxFixedArity = 3;
        G__100648.cljs$lang$applyTo = function(arglist__100649) {
          var x = cljs.core.first(arglist__100649);
          var y = cljs.core.first(cljs.core.next(arglist__100649));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100649)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100649)));
          return G__100648__delegate.call(this, x, y, z, args)
        };
        return G__100648
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__100642.call(this);
          case 1:
            return sp1__100643.call(this, x);
          case 2:
            return sp1__100644.call(this, x, y);
          case 3:
            return sp1__100645.call(this, x, y, z);
          default:
            return sp1__100646.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__100646.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__100638 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__100650 = function() {
        return null
      };
      var sp2__100651 = function(x) {
        var or__3548__auto____100603 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100603)) {
          return or__3548__auto____100603
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__100652 = function(x, y) {
        var or__3548__auto____100604 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100604)) {
          return or__3548__auto____100604
        }else {
          var or__3548__auto____100605 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____100605)) {
            return or__3548__auto____100605
          }else {
            var or__3548__auto____100606 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____100606)) {
              return or__3548__auto____100606
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__100653 = function(x, y, z) {
        var or__3548__auto____100607 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100607)) {
          return or__3548__auto____100607
        }else {
          var or__3548__auto____100608 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____100608)) {
            return or__3548__auto____100608
          }else {
            var or__3548__auto____100609 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____100609)) {
              return or__3548__auto____100609
            }else {
              var or__3548__auto____100610 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____100610)) {
                return or__3548__auto____100610
              }else {
                var or__3548__auto____100611 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____100611)) {
                  return or__3548__auto____100611
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__100654 = function() {
        var G__100656__delegate = function(x, y, z, args) {
          var or__3548__auto____100612 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____100612)) {
            return or__3548__auto____100612
          }else {
            return cljs.core.some.call(null, function(p1__100515_SHARP_) {
              var or__3548__auto____100613 = p1.call(null, p1__100515_SHARP_);
              if(cljs.core.truth_(or__3548__auto____100613)) {
                return or__3548__auto____100613
              }else {
                return p2.call(null, p1__100515_SHARP_)
              }
            }, args)
          }
        };
        var G__100656 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100656__delegate.call(this, x, y, z, args)
        };
        G__100656.cljs$lang$maxFixedArity = 3;
        G__100656.cljs$lang$applyTo = function(arglist__100657) {
          var x = cljs.core.first(arglist__100657);
          var y = cljs.core.first(cljs.core.next(arglist__100657));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100657)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100657)));
          return G__100656__delegate.call(this, x, y, z, args)
        };
        return G__100656
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__100650.call(this);
          case 1:
            return sp2__100651.call(this, x);
          case 2:
            return sp2__100652.call(this, x, y);
          case 3:
            return sp2__100653.call(this, x, y, z);
          default:
            return sp2__100654.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__100654.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__100639 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__100658 = function() {
        return null
      };
      var sp3__100659 = function(x) {
        var or__3548__auto____100614 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100614)) {
          return or__3548__auto____100614
        }else {
          var or__3548__auto____100615 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____100615)) {
            return or__3548__auto____100615
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__100660 = function(x, y) {
        var or__3548__auto____100616 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100616)) {
          return or__3548__auto____100616
        }else {
          var or__3548__auto____100617 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____100617)) {
            return or__3548__auto____100617
          }else {
            var or__3548__auto____100618 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____100618)) {
              return or__3548__auto____100618
            }else {
              var or__3548__auto____100619 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____100619)) {
                return or__3548__auto____100619
              }else {
                var or__3548__auto____100620 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____100620)) {
                  return or__3548__auto____100620
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__100661 = function(x, y, z) {
        var or__3548__auto____100621 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____100621)) {
          return or__3548__auto____100621
        }else {
          var or__3548__auto____100622 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____100622)) {
            return or__3548__auto____100622
          }else {
            var or__3548__auto____100623 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____100623)) {
              return or__3548__auto____100623
            }else {
              var or__3548__auto____100624 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____100624)) {
                return or__3548__auto____100624
              }else {
                var or__3548__auto____100625 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____100625)) {
                  return or__3548__auto____100625
                }else {
                  var or__3548__auto____100626 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____100626)) {
                    return or__3548__auto____100626
                  }else {
                    var or__3548__auto____100627 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____100627)) {
                      return or__3548__auto____100627
                    }else {
                      var or__3548__auto____100628 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____100628)) {
                        return or__3548__auto____100628
                      }else {
                        return p3.call(null, z)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      var sp3__100662 = function() {
        var G__100664__delegate = function(x, y, z, args) {
          var or__3548__auto____100629 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____100629)) {
            return or__3548__auto____100629
          }else {
            return cljs.core.some.call(null, function(p1__100516_SHARP_) {
              var or__3548__auto____100630 = p1.call(null, p1__100516_SHARP_);
              if(cljs.core.truth_(or__3548__auto____100630)) {
                return or__3548__auto____100630
              }else {
                var or__3548__auto____100631 = p2.call(null, p1__100516_SHARP_);
                if(cljs.core.truth_(or__3548__auto____100631)) {
                  return or__3548__auto____100631
                }else {
                  return p3.call(null, p1__100516_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__100664 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__100664__delegate.call(this, x, y, z, args)
        };
        G__100664.cljs$lang$maxFixedArity = 3;
        G__100664.cljs$lang$applyTo = function(arglist__100665) {
          var x = cljs.core.first(arglist__100665);
          var y = cljs.core.first(cljs.core.next(arglist__100665));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100665)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100665)));
          return G__100664__delegate.call(this, x, y, z, args)
        };
        return G__100664
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__100658.call(this);
          case 1:
            return sp3__100659.call(this, x);
          case 2:
            return sp3__100660.call(this, x, y);
          case 3:
            return sp3__100661.call(this, x, y, z);
          default:
            return sp3__100662.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__100662.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__100640 = function() {
    var G__100666__delegate = function(p1, p2, p3, ps) {
      var ps__100632 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__100667 = function() {
          return null
        };
        var spn__100668 = function(x) {
          return cljs.core.some.call(null, function(p1__100517_SHARP_) {
            return p1__100517_SHARP_.call(null, x)
          }, ps__100632)
        };
        var spn__100669 = function(x, y) {
          return cljs.core.some.call(null, function(p1__100518_SHARP_) {
            var or__3548__auto____100633 = p1__100518_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____100633)) {
              return or__3548__auto____100633
            }else {
              return p1__100518_SHARP_.call(null, y)
            }
          }, ps__100632)
        };
        var spn__100670 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__100519_SHARP_) {
            var or__3548__auto____100634 = p1__100519_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____100634)) {
              return or__3548__auto____100634
            }else {
              var or__3548__auto____100635 = p1__100519_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____100635)) {
                return or__3548__auto____100635
              }else {
                return p1__100519_SHARP_.call(null, z)
              }
            }
          }, ps__100632)
        };
        var spn__100671 = function() {
          var G__100673__delegate = function(x, y, z, args) {
            var or__3548__auto____100636 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____100636)) {
              return or__3548__auto____100636
            }else {
              return cljs.core.some.call(null, function(p1__100520_SHARP_) {
                return cljs.core.some.call(null, p1__100520_SHARP_, args)
              }, ps__100632)
            }
          };
          var G__100673 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__100673__delegate.call(this, x, y, z, args)
          };
          G__100673.cljs$lang$maxFixedArity = 3;
          G__100673.cljs$lang$applyTo = function(arglist__100674) {
            var x = cljs.core.first(arglist__100674);
            var y = cljs.core.first(cljs.core.next(arglist__100674));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100674)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100674)));
            return G__100673__delegate.call(this, x, y, z, args)
          };
          return G__100673
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__100667.call(this);
            case 1:
              return spn__100668.call(this, x);
            case 2:
              return spn__100669.call(this, x, y);
            case 3:
              return spn__100670.call(this, x, y, z);
            default:
              return spn__100671.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__100671.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__100666 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__100666__delegate.call(this, p1, p2, p3, ps)
    };
    G__100666.cljs$lang$maxFixedArity = 3;
    G__100666.cljs$lang$applyTo = function(arglist__100675) {
      var p1 = cljs.core.first(arglist__100675);
      var p2 = cljs.core.first(cljs.core.next(arglist__100675));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100675)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100675)));
      return G__100666__delegate.call(this, p1, p2, p3, ps)
    };
    return G__100666
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__100637.call(this, p1);
      case 2:
        return some_fn__100638.call(this, p1, p2);
      case 3:
        return some_fn__100639.call(this, p1, p2, p3);
      default:
        return some_fn__100640.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__100640.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__100688 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____100676 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____100676)) {
        var s__100677 = temp__3698__auto____100676;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__100677)), map.call(null, f, cljs.core.rest.call(null, s__100677)))
      }else {
        return null
      }
    })
  };
  var map__100689 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__100678 = cljs.core.seq.call(null, c1);
      var s2__100679 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____100680 = s1__100678;
        if(cljs.core.truth_(and__3546__auto____100680)) {
          return s2__100679
        }else {
          return and__3546__auto____100680
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__100678), cljs.core.first.call(null, s2__100679)), map.call(null, f, cljs.core.rest.call(null, s1__100678), cljs.core.rest.call(null, s2__100679)))
      }else {
        return null
      }
    })
  };
  var map__100690 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__100681 = cljs.core.seq.call(null, c1);
      var s2__100682 = cljs.core.seq.call(null, c2);
      var s3__100683 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____100684 = s1__100681;
        if(cljs.core.truth_(and__3546__auto____100684)) {
          var and__3546__auto____100685 = s2__100682;
          if(cljs.core.truth_(and__3546__auto____100685)) {
            return s3__100683
          }else {
            return and__3546__auto____100685
          }
        }else {
          return and__3546__auto____100684
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__100681), cljs.core.first.call(null, s2__100682), cljs.core.first.call(null, s3__100683)), map.call(null, f, cljs.core.rest.call(null, s1__100681), cljs.core.rest.call(null, s2__100682), cljs.core.rest.call(null, s3__100683)))
      }else {
        return null
      }
    })
  };
  var map__100691 = function() {
    var G__100693__delegate = function(f, c1, c2, c3, colls) {
      var step__100687 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__100686 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__100686))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__100686), step.call(null, map.call(null, cljs.core.rest, ss__100686)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__100598_SHARP_) {
        return cljs.core.apply.call(null, f, p1__100598_SHARP_)
      }, step__100687.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__100693 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__100693__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__100693.cljs$lang$maxFixedArity = 4;
    G__100693.cljs$lang$applyTo = function(arglist__100694) {
      var f = cljs.core.first(arglist__100694);
      var c1 = cljs.core.first(cljs.core.next(arglist__100694));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100694)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100694))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__100694))));
      return G__100693__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__100693
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__100688.call(this, f, c1);
      case 3:
        return map__100689.call(this, f, c1, c2);
      case 4:
        return map__100690.call(this, f, c1, c2, c3);
      default:
        return map__100691.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__100691.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____100695 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____100695)) {
        var s__100696 = temp__3698__auto____100695;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__100696), take.call(null, n - 1, cljs.core.rest.call(null, s__100696)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__100699 = function(n, coll) {
    while(true) {
      var s__100697 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____100698 = n > 0;
        if(cljs.core.truth_(and__3546__auto____100698)) {
          return s__100697
        }else {
          return and__3546__auto____100698
        }
      }())) {
        var G__100700 = n - 1;
        var G__100701 = cljs.core.rest.call(null, s__100697);
        n = G__100700;
        coll = G__100701;
        continue
      }else {
        return s__100697
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__100699.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__100702 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__100703 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__100702.call(this, n);
      case 2:
        return drop_last__100703.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__100705 = cljs.core.seq.call(null, coll);
  var lead__100706 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__100706)) {
      var G__100707 = cljs.core.next.call(null, s__100705);
      var G__100708 = cljs.core.next.call(null, lead__100706);
      s__100705 = G__100707;
      lead__100706 = G__100708;
      continue
    }else {
      return s__100705
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__100711 = function(pred, coll) {
    while(true) {
      var s__100709 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____100710 = s__100709;
        if(cljs.core.truth_(and__3546__auto____100710)) {
          return pred.call(null, cljs.core.first.call(null, s__100709))
        }else {
          return and__3546__auto____100710
        }
      }())) {
        var G__100712 = pred;
        var G__100713 = cljs.core.rest.call(null, s__100709);
        pred = G__100712;
        coll = G__100713;
        continue
      }else {
        return s__100709
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__100711.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____100714 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____100714)) {
      var s__100715 = temp__3698__auto____100714;
      return cljs.core.concat.call(null, s__100715, cycle.call(null, s__100715))
    }else {
      return null
    }
  })
};
cljs.core.split_at = function split_at(n, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take.call(null, n, coll), cljs.core.drop.call(null, n, coll)])
};
cljs.core.repeat = function() {
  var repeat = null;
  var repeat__100716 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__100717 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__100716.call(this, n);
      case 2:
        return repeat__100717.call(this, n, x)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return repeat
}();
cljs.core.replicate = function replicate(n, x) {
  return cljs.core.take.call(null, n, cljs.core.repeat.call(null, x))
};
cljs.core.repeatedly = function() {
  var repeatedly = null;
  var repeatedly__100719 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__100720 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__100719.call(this, n);
      case 2:
        return repeatedly__100720.call(this, n, f)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return repeatedly
}();
cljs.core.iterate = function iterate(f, x) {
  return cljs.core.cons.call(null, x, new cljs.core.LazySeq(null, false, function() {
    return iterate.call(null, f, f.call(null, x))
  }))
};
cljs.core.interleave = function() {
  var interleave = null;
  var interleave__100726 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__100722 = cljs.core.seq.call(null, c1);
      var s2__100723 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____100724 = s1__100722;
        if(cljs.core.truth_(and__3546__auto____100724)) {
          return s2__100723
        }else {
          return and__3546__auto____100724
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__100722), cljs.core.cons.call(null, cljs.core.first.call(null, s2__100723), interleave.call(null, cljs.core.rest.call(null, s1__100722), cljs.core.rest.call(null, s2__100723))))
      }else {
        return null
      }
    })
  };
  var interleave__100727 = function() {
    var G__100729__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__100725 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__100725))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__100725), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__100725)))
        }else {
          return null
        }
      })
    };
    var G__100729 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100729__delegate.call(this, c1, c2, colls)
    };
    G__100729.cljs$lang$maxFixedArity = 2;
    G__100729.cljs$lang$applyTo = function(arglist__100730) {
      var c1 = cljs.core.first(arglist__100730);
      var c2 = cljs.core.first(cljs.core.next(arglist__100730));
      var colls = cljs.core.rest(cljs.core.next(arglist__100730));
      return G__100729__delegate.call(this, c1, c2, colls)
    };
    return G__100729
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__100726.call(this, c1, c2);
      default:
        return interleave__100727.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__100727.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__100733 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____100731 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____100731)) {
        var coll__100732 = temp__3695__auto____100731;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__100732), cat.call(null, cljs.core.rest.call(null, coll__100732), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__100733.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__100734 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__100735 = function() {
    var G__100737__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__100737 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__100737__delegate.call(this, f, coll, colls)
    };
    G__100737.cljs$lang$maxFixedArity = 2;
    G__100737.cljs$lang$applyTo = function(arglist__100738) {
      var f = cljs.core.first(arglist__100738);
      var coll = cljs.core.first(cljs.core.next(arglist__100738));
      var colls = cljs.core.rest(cljs.core.next(arglist__100738));
      return G__100737__delegate.call(this, f, coll, colls)
    };
    return G__100737
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__100734.call(this, f, coll);
      default:
        return mapcat__100735.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__100735.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____100739 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____100739)) {
      var s__100740 = temp__3698__auto____100739;
      var f__100741 = cljs.core.first.call(null, s__100740);
      var r__100742 = cljs.core.rest.call(null, s__100740);
      if(cljs.core.truth_(pred.call(null, f__100741))) {
        return cljs.core.cons.call(null, f__100741, filter.call(null, pred, r__100742))
      }else {
        return filter.call(null, pred, r__100742)
      }
    }else {
      return null
    }
  })
};
cljs.core.remove = function remove(pred, coll) {
  return cljs.core.filter.call(null, cljs.core.complement.call(null, pred), coll)
};
cljs.core.tree_seq = function tree_seq(branch_QMARK_, children, root) {
  var walk__100744 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__100744.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__100743_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__100743_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__100751 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__100752 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____100745 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____100745)) {
        var s__100746 = temp__3698__auto____100745;
        var p__100747 = cljs.core.take.call(null, n, s__100746);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__100747)))) {
          return cljs.core.cons.call(null, p__100747, partition.call(null, n, step, cljs.core.drop.call(null, step, s__100746)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__100753 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____100748 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____100748)) {
        var s__100749 = temp__3698__auto____100748;
        var p__100750 = cljs.core.take.call(null, n, s__100749);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__100750)))) {
          return cljs.core.cons.call(null, p__100750, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__100749)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__100750, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__100751.call(this, n, step);
      case 3:
        return partition__100752.call(this, n, step, pad);
      case 4:
        return partition__100753.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__100759 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__100760 = function(m, ks, not_found) {
    var sentinel__100755 = cljs.core.lookup_sentinel;
    var m__100756 = m;
    var ks__100757 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__100757)) {
        var m__100758 = cljs.core.get.call(null, m__100756, cljs.core.first.call(null, ks__100757), sentinel__100755);
        if(cljs.core.truth_(sentinel__100755 === m__100758)) {
          return not_found
        }else {
          var G__100762 = sentinel__100755;
          var G__100763 = m__100758;
          var G__100764 = cljs.core.next.call(null, ks__100757);
          sentinel__100755 = G__100762;
          m__100756 = G__100763;
          ks__100757 = G__100764;
          continue
        }
      }else {
        return m__100756
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__100759.call(this, m, ks);
      case 3:
        return get_in__100760.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__100765, v) {
  var vec__100766__100767 = p__100765;
  var k__100768 = cljs.core.nth.call(null, vec__100766__100767, 0, null);
  var ks__100769 = cljs.core.nthnext.call(null, vec__100766__100767, 1);
  if(cljs.core.truth_(ks__100769)) {
    return cljs.core.assoc.call(null, m, k__100768, assoc_in.call(null, cljs.core.get.call(null, m, k__100768), ks__100769, v))
  }else {
    return cljs.core.assoc.call(null, m, k__100768, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__100770, f, args) {
    var vec__100771__100772 = p__100770;
    var k__100773 = cljs.core.nth.call(null, vec__100771__100772, 0, null);
    var ks__100774 = cljs.core.nthnext.call(null, vec__100771__100772, 1);
    if(cljs.core.truth_(ks__100774)) {
      return cljs.core.assoc.call(null, m, k__100773, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__100773), ks__100774, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__100773, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__100773), args))
    }
  };
  var update_in = function(m, p__100770, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__100770, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__100775) {
    var m = cljs.core.first(arglist__100775);
    var p__100770 = cljs.core.first(cljs.core.next(arglist__100775));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__100775)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__100775)));
    return update_in__delegate.call(this, m, p__100770, f, args)
  };
  return update_in
}();
cljs.core.Vector = function(meta, array) {
  this.meta = meta;
  this.array = array
};
cljs.core.Vector.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Vector")
};
cljs.core.Vector.prototype.cljs$core$IHash$ = true;
cljs.core.Vector.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100776 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__100809 = null;
  var G__100809__100810 = function(coll, k) {
    var this__100777 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__100809__100811 = function(coll, k, not_found) {
    var this__100778 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__100809 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100809__100810.call(this, coll, k);
      case 3:
        return G__100809__100811.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100809
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__100779 = this;
  var new_array__100780 = cljs.core.aclone.call(null, this__100779.array);
  new_array__100780[k] = v;
  return new cljs.core.Vector(this__100779.meta, new_array__100780)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__100813 = null;
  var G__100813__100814 = function(tsym100781, k) {
    var this__100783 = this;
    var tsym100781__100784 = this;
    var coll__100785 = tsym100781__100784;
    return cljs.core._lookup.call(null, coll__100785, k)
  };
  var G__100813__100815 = function(tsym100782, k, not_found) {
    var this__100786 = this;
    var tsym100782__100787 = this;
    var coll__100788 = tsym100782__100787;
    return cljs.core._lookup.call(null, coll__100788, k, not_found)
  };
  G__100813 = function(tsym100782, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100813__100814.call(this, tsym100782, k);
      case 3:
        return G__100813__100815.call(this, tsym100782, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100813
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100789 = this;
  var new_array__100790 = cljs.core.aclone.call(null, this__100789.array);
  new_array__100790.push(o);
  return new cljs.core.Vector(this__100789.meta, new_array__100790)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__100817 = null;
  var G__100817__100818 = function(v, f) {
    var this__100791 = this;
    return cljs.core.ci_reduce.call(null, this__100791.array, f)
  };
  var G__100817__100819 = function(v, f, start) {
    var this__100792 = this;
    return cljs.core.ci_reduce.call(null, this__100792.array, f, start)
  };
  G__100817 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__100817__100818.call(this, v, f);
      case 3:
        return G__100817__100819.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100817
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100793 = this;
  if(cljs.core.truth_(this__100793.array.length > 0)) {
    var vector_seq__100794 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__100793.array.length)) {
          return cljs.core.cons.call(null, this__100793.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__100794.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__100795 = this;
  return this__100795.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__100796 = this;
  var count__100797 = this__100796.array.length;
  if(cljs.core.truth_(count__100797 > 0)) {
    return this__100796.array[count__100797 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__100798 = this;
  if(cljs.core.truth_(this__100798.array.length > 0)) {
    var new_array__100799 = cljs.core.aclone.call(null, this__100798.array);
    new_array__100799.pop();
    return new cljs.core.Vector(this__100798.meta, new_array__100799)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__100800 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100801 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100802 = this;
  return new cljs.core.Vector(meta, this__100802.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100803 = this;
  return this__100803.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__100821 = null;
  var G__100821__100822 = function(coll, n) {
    var this__100804 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100805 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____100805)) {
        return n < this__100804.array.length
      }else {
        return and__3546__auto____100805
      }
    }())) {
      return this__100804.array[n]
    }else {
      return null
    }
  };
  var G__100821__100823 = function(coll, n, not_found) {
    var this__100806 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100807 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____100807)) {
        return n < this__100806.array.length
      }else {
        return and__3546__auto____100807
      }
    }())) {
      return this__100806.array[n]
    }else {
      return not_found
    }
  };
  G__100821 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100821__100822.call(this, coll, n);
      case 3:
        return G__100821__100823.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100821
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100808 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__100808.meta)
};
cljs.core.Vector;
cljs.core.Vector.EMPTY = new cljs.core.Vector(null, []);
cljs.core.Vector.fromArray = function(xs) {
  return new cljs.core.Vector(null, xs)
};
cljs.core.vector = function() {
  var vector__delegate = function(args) {
    return cljs.core.vec.call(null, args)
  };
  var vector = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return vector__delegate.call(this, args)
  };
  vector.cljs$lang$maxFixedArity = 0;
  vector.cljs$lang$applyTo = function(arglist__100825) {
    var args = cljs.core.seq(arglist__100825);
    return vector__delegate.call(this, args)
  };
  return vector
}();
cljs.core.tail_off = function tail_off(pv) {
  var cnt__100826 = pv.cnt;
  if(cljs.core.truth_(cnt__100826 < 32)) {
    return 0
  }else {
    return cnt__100826 - 1 >> 5 << 5
  }
};
cljs.core.new_path = function new_path(level, node) {
  var ll__100827 = level;
  var ret__100828 = node;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, ll__100827))) {
      return ret__100828
    }else {
      var embed__100829 = ret__100828;
      var r__100830 = cljs.core.aclone.call(null, cljs.core.PersistentVector.EMPTY_NODE);
      var ___100831 = r__100830[0] = embed__100829;
      var G__100832 = ll__100827 - 5;
      var G__100833 = r__100830;
      ll__100827 = G__100832;
      ret__100828 = G__100833;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__100834 = cljs.core.aclone.call(null, parent);
  var subidx__100835 = pv.cnt - 1 >> level & 31;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 5, level))) {
    ret__100834[subidx__100835] = tailnode;
    return ret__100834
  }else {
    var temp__3695__auto____100836 = parent[subidx__100835];
    if(cljs.core.truth_(temp__3695__auto____100836)) {
      var child__100837 = temp__3695__auto____100836;
      var node_to_insert__100838 = push_tail.call(null, pv, level - 5, child__100837, tailnode);
      var ___100839 = ret__100834[subidx__100835] = node_to_insert__100838;
      return ret__100834
    }else {
      var node_to_insert__100840 = cljs.core.new_path.call(null, level - 5, tailnode);
      var ___100841 = ret__100834[subidx__100835] = node_to_insert__100840;
      return ret__100834
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____100842 = 0 <= i;
    if(cljs.core.truth_(and__3546__auto____100842)) {
      return i < pv.cnt
    }else {
      return and__3546__auto____100842
    }
  }())) {
    if(cljs.core.truth_(i >= cljs.core.tail_off.call(null, pv))) {
      return pv.tail
    }else {
      var node__100843 = pv.root;
      var level__100844 = pv.shift;
      while(true) {
        if(cljs.core.truth_(level__100844 > 0)) {
          var G__100845 = node__100843[i >> level__100844 & 31];
          var G__100846 = level__100844 - 5;
          node__100843 = G__100845;
          level__100844 = G__100846;
          continue
        }else {
          return node__100843
        }
        break
      }
    }
  }else {
    throw new Error(cljs.core.str.call(null, "No item ", i, " in vector of length ", pv.cnt));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__100847 = cljs.core.aclone.call(null, node);
  if(cljs.core.truth_(level === 0)) {
    ret__100847[i & 31] = val;
    return ret__100847
  }else {
    var subidx__100848 = i >> level & 31;
    var ___100849 = ret__100847[subidx__100848] = do_assoc.call(null, pv, level - 5, node[subidx__100848], i, val);
    return ret__100847
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__100850 = pv.cnt - 2 >> level & 31;
  if(cljs.core.truth_(level > 5)) {
    var new_child__100851 = pop_tail.call(null, pv, level - 5, node[subidx__100850]);
    if(cljs.core.truth_(function() {
      var and__3546__auto____100852 = new_child__100851 === null;
      if(cljs.core.truth_(and__3546__auto____100852)) {
        return subidx__100850 === 0
      }else {
        return and__3546__auto____100852
      }
    }())) {
      return null
    }else {
      var ret__100853 = cljs.core.aclone.call(null, node);
      var ___100854 = ret__100853[subidx__100850] = new_child__100851;
      return ret__100853
    }
  }else {
    if(cljs.core.truth_(subidx__100850 === 0)) {
      return null
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        var ret__100855 = cljs.core.aclone.call(null, node);
        var ___100856 = ret__100855[subidx__100850] = null;
        return ret__100855
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector = function(meta, cnt, shift, root, tail) {
  this.meta = meta;
  this.cnt = cnt;
  this.shift = shift;
  this.root = root;
  this.tail = tail
};
cljs.core.PersistentVector.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentVector")
};
cljs.core.PersistentVector.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100857 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__100897 = null;
  var G__100897__100898 = function(coll, k) {
    var this__100858 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__100897__100899 = function(coll, k, not_found) {
    var this__100859 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__100897 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100897__100898.call(this, coll, k);
      case 3:
        return G__100897__100899.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100897
}();
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__100860 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____100861 = 0 <= k;
    if(cljs.core.truth_(and__3546__auto____100861)) {
      return k < this__100860.cnt
    }else {
      return and__3546__auto____100861
    }
  }())) {
    if(cljs.core.truth_(cljs.core.tail_off.call(null, coll) <= k)) {
      var new_tail__100862 = cljs.core.aclone.call(null, this__100860.tail);
      new_tail__100862[k & 31] = v;
      return new cljs.core.PersistentVector(this__100860.meta, this__100860.cnt, this__100860.shift, this__100860.root, new_tail__100862)
    }else {
      return new cljs.core.PersistentVector(this__100860.meta, this__100860.cnt, this__100860.shift, cljs.core.do_assoc.call(null, coll, this__100860.shift, this__100860.root, k, v), this__100860.tail)
    }
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, k, this__100860.cnt))) {
      return cljs.core._conj.call(null, coll, v)
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw new Error(cljs.core.str.call(null, "Index ", k, " out of bounds  [0,", this__100860.cnt, "]"));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IFn$ = true;
cljs.core.PersistentVector.prototype.call = function() {
  var G__100901 = null;
  var G__100901__100902 = function(tsym100863, k) {
    var this__100865 = this;
    var tsym100863__100866 = this;
    var coll__100867 = tsym100863__100866;
    return cljs.core._lookup.call(null, coll__100867, k)
  };
  var G__100901__100903 = function(tsym100864, k, not_found) {
    var this__100868 = this;
    var tsym100864__100869 = this;
    var coll__100870 = tsym100864__100869;
    return cljs.core._lookup.call(null, coll__100870, k, not_found)
  };
  G__100901 = function(tsym100864, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100901__100902.call(this, tsym100864, k);
      case 3:
        return G__100901__100903.call(this, tsym100864, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100901
}();
cljs.core.PersistentVector.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100871 = this;
  if(cljs.core.truth_(this__100871.cnt - cljs.core.tail_off.call(null, coll) < 32)) {
    var new_tail__100872 = cljs.core.aclone.call(null, this__100871.tail);
    new_tail__100872.push(o);
    return new cljs.core.PersistentVector(this__100871.meta, this__100871.cnt + 1, this__100871.shift, this__100871.root, new_tail__100872)
  }else {
    var root_overflow_QMARK___100873 = this__100871.cnt >> 5 > 1 << this__100871.shift;
    var new_shift__100874 = cljs.core.truth_(root_overflow_QMARK___100873) ? this__100871.shift + 5 : this__100871.shift;
    var new_root__100876 = cljs.core.truth_(root_overflow_QMARK___100873) ? function() {
      var n_r__100875 = cljs.core.aclone.call(null, cljs.core.PersistentVector.EMPTY_NODE);
      n_r__100875[0] = this__100871.root;
      n_r__100875[1] = cljs.core.new_path.call(null, this__100871.shift, this__100871.tail);
      return n_r__100875
    }() : cljs.core.push_tail.call(null, coll, this__100871.shift, this__100871.root, this__100871.tail);
    return new cljs.core.PersistentVector(this__100871.meta, this__100871.cnt + 1, new_shift__100874, new_root__100876, [o])
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__100905 = null;
  var G__100905__100906 = function(v, f) {
    var this__100877 = this;
    return cljs.core.ci_reduce.call(null, v, f)
  };
  var G__100905__100907 = function(v, f, start) {
    var this__100878 = this;
    return cljs.core.ci_reduce.call(null, v, f, start)
  };
  G__100905 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__100905__100906.call(this, v, f);
      case 3:
        return G__100905__100907.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100905
}();
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100879 = this;
  if(cljs.core.truth_(this__100879.cnt > 0)) {
    var vector_seq__100880 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__100879.cnt)) {
          return cljs.core.cons.call(null, cljs.core._nth.call(null, coll, i), vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__100880.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__100881 = this;
  return this__100881.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__100882 = this;
  if(cljs.core.truth_(this__100882.cnt > 0)) {
    return cljs.core._nth.call(null, coll, this__100882.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__100883 = this;
  if(cljs.core.truth_(this__100883.cnt === 0)) {
    throw new Error("Can't pop empty vector");
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, this__100883.cnt))) {
      return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__100883.meta)
    }else {
      if(cljs.core.truth_(1 < this__100883.cnt - cljs.core.tail_off.call(null, coll))) {
        return new cljs.core.PersistentVector(this__100883.meta, this__100883.cnt - 1, this__100883.shift, this__100883.root, cljs.core.aclone.call(null, this__100883.tail))
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          var new_tail__100884 = cljs.core.array_for.call(null, coll, this__100883.cnt - 2);
          var nr__100885 = cljs.core.pop_tail.call(null, this__100883.shift, this__100883.root);
          var new_root__100886 = cljs.core.truth_(nr__100885 === null) ? cljs.core.PersistentVector.EMPTY_NODE : nr__100885;
          var cnt_1__100887 = this__100883.cnt - 1;
          if(cljs.core.truth_(function() {
            var and__3546__auto____100888 = 5 < this__100883.shift;
            if(cljs.core.truth_(and__3546__auto____100888)) {
              return new_root__100886[1] === null
            }else {
              return and__3546__auto____100888
            }
          }())) {
            return new cljs.core.PersistentVector(this__100883.meta, cnt_1__100887, this__100883.shift - 5, new_root__100886[0], new_tail__100884)
          }else {
            return new cljs.core.PersistentVector(this__100883.meta, cnt_1__100887, this__100883.shift, new_root__100886, new_tail__100884)
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IVector$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__100889 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100890 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100891 = this;
  return new cljs.core.PersistentVector(meta, this__100891.cnt, this__100891.shift, this__100891.root, this__100891.tail)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100892 = this;
  return this__100892.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__100909 = null;
  var G__100909__100910 = function(coll, n) {
    var this__100893 = this;
    return cljs.core.array_for.call(null, coll, n)[n & 31]
  };
  var G__100909__100911 = function(coll, n, not_found) {
    var this__100894 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____100895 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____100895)) {
        return n < this__100894.cnt
      }else {
        return and__3546__auto____100895
      }
    }())) {
      return cljs.core._nth.call(null, coll, n)
    }else {
      return not_found
    }
  };
  G__100909 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100909__100910.call(this, coll, n);
      case 3:
        return G__100909__100911.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100909
}();
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100896 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__100896.meta)
};
cljs.core.PersistentVector;
cljs.core.PersistentVector.EMPTY_NODE = new Array(32);
cljs.core.PersistentVector.EMPTY = new cljs.core.PersistentVector(null, 0, 5, cljs.core.PersistentVector.EMPTY_NODE, []);
cljs.core.PersistentVector.fromArray = function(xs) {
  return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, xs)
};
cljs.core.vec = function vec(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.PersistentVector.EMPTY, coll)
};
cljs.core.Subvec = function(meta, v, start, end) {
  this.meta = meta;
  this.v = v;
  this.start = start;
  this.end = end
};
cljs.core.Subvec.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Subvec")
};
cljs.core.Subvec.prototype.cljs$core$IHash$ = true;
cljs.core.Subvec.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100913 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__100941 = null;
  var G__100941__100942 = function(coll, k) {
    var this__100914 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__100941__100943 = function(coll, k, not_found) {
    var this__100915 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__100941 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100941__100942.call(this, coll, k);
      case 3:
        return G__100941__100943.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100941
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__100916 = this;
  var v_pos__100917 = this__100916.start + key;
  return new cljs.core.Subvec(this__100916.meta, cljs.core._assoc.call(null, this__100916.v, v_pos__100917, val), this__100916.start, this__100916.end > v_pos__100917 + 1 ? this__100916.end : v_pos__100917 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__100945 = null;
  var G__100945__100946 = function(tsym100918, k) {
    var this__100920 = this;
    var tsym100918__100921 = this;
    var coll__100922 = tsym100918__100921;
    return cljs.core._lookup.call(null, coll__100922, k)
  };
  var G__100945__100947 = function(tsym100919, k, not_found) {
    var this__100923 = this;
    var tsym100919__100924 = this;
    var coll__100925 = tsym100919__100924;
    return cljs.core._lookup.call(null, coll__100925, k, not_found)
  };
  G__100945 = function(tsym100919, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100945__100946.call(this, tsym100919, k);
      case 3:
        return G__100945__100947.call(this, tsym100919, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100945
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100926 = this;
  return new cljs.core.Subvec(this__100926.meta, cljs.core._assoc_n.call(null, this__100926.v, this__100926.end, o), this__100926.start, this__100926.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__100949 = null;
  var G__100949__100950 = function(coll, f) {
    var this__100927 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__100949__100951 = function(coll, f, start) {
    var this__100928 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__100949 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__100949__100950.call(this, coll, f);
      case 3:
        return G__100949__100951.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100949
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100929 = this;
  var subvec_seq__100930 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__100929.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__100929.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__100930.call(null, this__100929.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__100931 = this;
  return this__100931.end - this__100931.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__100932 = this;
  return cljs.core._nth.call(null, this__100932.v, this__100932.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__100933 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__100933.start, this__100933.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__100933.meta, this__100933.v, this__100933.start, this__100933.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__100934 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100935 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100936 = this;
  return new cljs.core.Subvec(meta, this__100936.v, this__100936.start, this__100936.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100937 = this;
  return this__100937.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__100953 = null;
  var G__100953__100954 = function(coll, n) {
    var this__100938 = this;
    return cljs.core._nth.call(null, this__100938.v, this__100938.start + n)
  };
  var G__100953__100955 = function(coll, n, not_found) {
    var this__100939 = this;
    return cljs.core._nth.call(null, this__100939.v, this__100939.start + n, not_found)
  };
  G__100953 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__100953__100954.call(this, coll, n);
      case 3:
        return G__100953__100955.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__100953
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100940 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__100940.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__100957 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__100958 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__100957.call(this, v, start);
      case 3:
        return subvec__100958.call(this, v, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subvec
}();
cljs.core.PersistentQueueSeq = function(meta, front, rear) {
  this.meta = meta;
  this.front = front;
  this.rear = rear
};
cljs.core.PersistentQueueSeq.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentQueueSeq")
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100960 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100961 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100962 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100963 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__100963.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100964 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__100965 = this;
  return cljs.core._first.call(null, this__100965.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__100966 = this;
  var temp__3695__auto____100967 = cljs.core.next.call(null, this__100966.front);
  if(cljs.core.truth_(temp__3695__auto____100967)) {
    var f1__100968 = temp__3695__auto____100967;
    return new cljs.core.PersistentQueueSeq(this__100966.meta, f1__100968, this__100966.rear)
  }else {
    if(cljs.core.truth_(this__100966.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__100966.meta, this__100966.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100969 = this;
  return this__100969.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100970 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__100970.front, this__100970.rear)
};
cljs.core.PersistentQueueSeq;
cljs.core.PersistentQueue = function(meta, count, front, rear) {
  this.meta = meta;
  this.count = count;
  this.front = front;
  this.rear = rear
};
cljs.core.PersistentQueue.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentQueue")
};
cljs.core.PersistentQueue.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100971 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__100972 = this;
  if(cljs.core.truth_(this__100972.front)) {
    return new cljs.core.PersistentQueue(this__100972.meta, this__100972.count + 1, this__100972.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____100973 = this__100972.rear;
      if(cljs.core.truth_(or__3548__auto____100973)) {
        return or__3548__auto____100973
      }else {
        return cljs.core.PersistentVector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__100972.meta, this__100972.count + 1, cljs.core.conj.call(null, this__100972.front, o), cljs.core.PersistentVector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__100974 = this;
  var rear__100975 = cljs.core.seq.call(null, this__100974.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____100976 = this__100974.front;
    if(cljs.core.truth_(or__3548__auto____100976)) {
      return or__3548__auto____100976
    }else {
      return rear__100975
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__100974.front, cljs.core.seq.call(null, rear__100975))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__100977 = this;
  return this__100977.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__100978 = this;
  return cljs.core._first.call(null, this__100978.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__100979 = this;
  if(cljs.core.truth_(this__100979.front)) {
    var temp__3695__auto____100980 = cljs.core.next.call(null, this__100979.front);
    if(cljs.core.truth_(temp__3695__auto____100980)) {
      var f1__100981 = temp__3695__auto____100980;
      return new cljs.core.PersistentQueue(this__100979.meta, this__100979.count - 1, f1__100981, this__100979.rear)
    }else {
      return new cljs.core.PersistentQueue(this__100979.meta, this__100979.count - 1, cljs.core.seq.call(null, this__100979.rear), cljs.core.PersistentVector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__100982 = this;
  return cljs.core.first.call(null, this__100982.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__100983 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__100984 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__100985 = this;
  return new cljs.core.PersistentQueue(meta, this__100985.count, this__100985.front, this__100985.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__100986 = this;
  return this__100986.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__100987 = this;
  return cljs.core.PersistentQueue.EMPTY
};
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = new cljs.core.PersistentQueue(null, 0, null, cljs.core.PersistentVector.fromArray([]));
cljs.core.NeverEquiv = function() {
};
cljs.core.NeverEquiv.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.NeverEquiv")
};
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$ = true;
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__100988 = this;
  return false
};
cljs.core.NeverEquiv;
cljs.core.never_equiv = new cljs.core.NeverEquiv;
cljs.core.equiv_map = function equiv_map(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.map_QMARK_.call(null, y)) ? cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, x), cljs.core.count.call(null, y))) ? cljs.core.every_QMARK_.call(null, cljs.core.identity, cljs.core.map.call(null, function(xkv) {
    return cljs.core._EQ_.call(null, cljs.core.get.call(null, y, cljs.core.first.call(null, xkv), cljs.core.never_equiv), cljs.core.second.call(null, xkv))
  }, x)) : null : null)
};
cljs.core.scan_array = function scan_array(incr, k, array) {
  var len__100989 = array.length;
  var i__100990 = 0;
  while(true) {
    if(cljs.core.truth_(i__100990 < len__100989)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__100990]))) {
        return i__100990
      }else {
        var G__100991 = i__100990 + incr;
        i__100990 = G__100991;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.obj_map_contains_key_QMARK_ = function() {
  var obj_map_contains_key_QMARK_ = null;
  var obj_map_contains_key_QMARK___100993 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___100994 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____100992 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____100992)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____100992
      }
    }())) {
      return true_val
    }else {
      return false_val
    }
  };
  obj_map_contains_key_QMARK_ = function(k, strobj, true_val, false_val) {
    switch(arguments.length) {
      case 2:
        return obj_map_contains_key_QMARK___100993.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___100994.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__100997 = cljs.core.hash.call(null, a);
  var b__100998 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__100997 < b__100998)) {
    return-1
  }else {
    if(cljs.core.truth_(a__100997 > b__100998)) {
      return 1
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return 0
      }else {
        return null
      }
    }
  }
};
cljs.core.ObjMap = function(meta, keys, strobj) {
  this.meta = meta;
  this.keys = keys;
  this.strobj = strobj
};
cljs.core.ObjMap.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.ObjMap")
};
cljs.core.ObjMap.prototype.cljs$core$IHash$ = true;
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__100999 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__101026 = null;
  var G__101026__101027 = function(coll, k) {
    var this__101000 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__101026__101028 = function(coll, k, not_found) {
    var this__101001 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__101001.strobj, this__101001.strobj[k], not_found)
  };
  G__101026 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101026__101027.call(this, coll, k);
      case 3:
        return G__101026__101028.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101026
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__101002 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__101003 = goog.object.clone.call(null, this__101002.strobj);
    var overwrite_QMARK___101004 = new_strobj__101003.hasOwnProperty(k);
    new_strobj__101003[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___101004)) {
      return new cljs.core.ObjMap(this__101002.meta, this__101002.keys, new_strobj__101003)
    }else {
      var new_keys__101005 = cljs.core.aclone.call(null, this__101002.keys);
      new_keys__101005.push(k);
      return new cljs.core.ObjMap(this__101002.meta, new_keys__101005, new_strobj__101003)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__101002.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__101006 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__101006.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__101030 = null;
  var G__101030__101031 = function(tsym101007, k) {
    var this__101009 = this;
    var tsym101007__101010 = this;
    var coll__101011 = tsym101007__101010;
    return cljs.core._lookup.call(null, coll__101011, k)
  };
  var G__101030__101032 = function(tsym101008, k, not_found) {
    var this__101012 = this;
    var tsym101008__101013 = this;
    var coll__101014 = tsym101008__101013;
    return cljs.core._lookup.call(null, coll__101014, k, not_found)
  };
  G__101030 = function(tsym101008, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101030__101031.call(this, tsym101008, k);
      case 3:
        return G__101030__101032.call(this, tsym101008, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101030
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__101015 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__101016 = this;
  if(cljs.core.truth_(this__101016.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__100996_SHARP_) {
      return cljs.core.vector.call(null, p1__100996_SHARP_, this__101016.strobj[p1__100996_SHARP_])
    }, this__101016.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__101017 = this;
  return this__101017.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__101018 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__101019 = this;
  return new cljs.core.ObjMap(meta, this__101019.keys, this__101019.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__101020 = this;
  return this__101020.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__101021 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__101021.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__101022 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____101023 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____101023)) {
      return this__101022.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____101023
    }
  }())) {
    var new_keys__101024 = cljs.core.aclone.call(null, this__101022.keys);
    var new_strobj__101025 = goog.object.clone.call(null, this__101022.strobj);
    new_keys__101024.splice(cljs.core.scan_array.call(null, 1, k, new_keys__101024), 1);
    cljs.core.js_delete.call(null, new_strobj__101025, k);
    return new cljs.core.ObjMap(this__101022.meta, new_keys__101024, new_strobj__101025)
  }else {
    return coll
  }
};
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = new cljs.core.ObjMap(null, [], cljs.core.js_obj.call(null));
cljs.core.ObjMap.fromObject = function(ks, obj) {
  return new cljs.core.ObjMap(null, ks, obj)
};
cljs.core.HashMap = function(meta, count, hashobj) {
  this.meta = meta;
  this.count = count;
  this.hashobj = hashobj
};
cljs.core.HashMap.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.HashMap")
};
cljs.core.HashMap.prototype.cljs$core$IHash$ = true;
cljs.core.HashMap.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__101035 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__101073 = null;
  var G__101073__101074 = function(coll, k) {
    var this__101036 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__101073__101075 = function(coll, k, not_found) {
    var this__101037 = this;
    var bucket__101038 = this__101037.hashobj[cljs.core.hash.call(null, k)];
    var i__101039 = cljs.core.truth_(bucket__101038) ? cljs.core.scan_array.call(null, 2, k, bucket__101038) : null;
    if(cljs.core.truth_(i__101039)) {
      return bucket__101038[i__101039 + 1]
    }else {
      return not_found
    }
  };
  G__101073 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101073__101074.call(this, coll, k);
      case 3:
        return G__101073__101075.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101073
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__101040 = this;
  var h__101041 = cljs.core.hash.call(null, k);
  var bucket__101042 = this__101040.hashobj[h__101041];
  if(cljs.core.truth_(bucket__101042)) {
    var new_bucket__101043 = cljs.core.aclone.call(null, bucket__101042);
    var new_hashobj__101044 = goog.object.clone.call(null, this__101040.hashobj);
    new_hashobj__101044[h__101041] = new_bucket__101043;
    var temp__3695__auto____101045 = cljs.core.scan_array.call(null, 2, k, new_bucket__101043);
    if(cljs.core.truth_(temp__3695__auto____101045)) {
      var i__101046 = temp__3695__auto____101045;
      new_bucket__101043[i__101046 + 1] = v;
      return new cljs.core.HashMap(this__101040.meta, this__101040.count, new_hashobj__101044)
    }else {
      new_bucket__101043.push(k, v);
      return new cljs.core.HashMap(this__101040.meta, this__101040.count + 1, new_hashobj__101044)
    }
  }else {
    var new_hashobj__101047 = goog.object.clone.call(null, this__101040.hashobj);
    new_hashobj__101047[h__101041] = [k, v];
    return new cljs.core.HashMap(this__101040.meta, this__101040.count + 1, new_hashobj__101047)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__101048 = this;
  var bucket__101049 = this__101048.hashobj[cljs.core.hash.call(null, k)];
  var i__101050 = cljs.core.truth_(bucket__101049) ? cljs.core.scan_array.call(null, 2, k, bucket__101049) : null;
  if(cljs.core.truth_(i__101050)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__101077 = null;
  var G__101077__101078 = function(tsym101051, k) {
    var this__101053 = this;
    var tsym101051__101054 = this;
    var coll__101055 = tsym101051__101054;
    return cljs.core._lookup.call(null, coll__101055, k)
  };
  var G__101077__101079 = function(tsym101052, k, not_found) {
    var this__101056 = this;
    var tsym101052__101057 = this;
    var coll__101058 = tsym101052__101057;
    return cljs.core._lookup.call(null, coll__101058, k, not_found)
  };
  G__101077 = function(tsym101052, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101077__101078.call(this, tsym101052, k);
      case 3:
        return G__101077__101079.call(this, tsym101052, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101077
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__101059 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__101060 = this;
  if(cljs.core.truth_(this__101060.count > 0)) {
    var hashes__101061 = cljs.core.js_keys.call(null, this__101060.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__101034_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__101060.hashobj[p1__101034_SHARP_]))
    }, hashes__101061)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__101062 = this;
  return this__101062.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__101063 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__101064 = this;
  return new cljs.core.HashMap(meta, this__101064.count, this__101064.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__101065 = this;
  return this__101065.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__101066 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__101066.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__101067 = this;
  var h__101068 = cljs.core.hash.call(null, k);
  var bucket__101069 = this__101067.hashobj[h__101068];
  var i__101070 = cljs.core.truth_(bucket__101069) ? cljs.core.scan_array.call(null, 2, k, bucket__101069) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__101070))) {
    return coll
  }else {
    var new_hashobj__101071 = goog.object.clone.call(null, this__101067.hashobj);
    if(cljs.core.truth_(3 > bucket__101069.length)) {
      cljs.core.js_delete.call(null, new_hashobj__101071, h__101068)
    }else {
      var new_bucket__101072 = cljs.core.aclone.call(null, bucket__101069);
      new_bucket__101072.splice(i__101070, 2);
      new_hashobj__101071[h__101068] = new_bucket__101072
    }
    return new cljs.core.HashMap(this__101067.meta, this__101067.count - 1, new_hashobj__101071)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__101081 = ks.length;
  var i__101082 = 0;
  var out__101083 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__101082 < len__101081)) {
      var G__101084 = i__101082 + 1;
      var G__101085 = cljs.core.assoc.call(null, out__101083, ks[i__101082], vs[i__101082]);
      i__101082 = G__101084;
      out__101083 = G__101085;
      continue
    }else {
      return out__101083
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__101086 = cljs.core.seq.call(null, keyvals);
    var out__101087 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__101086)) {
        var G__101088 = cljs.core.nnext.call(null, in$__101086);
        var G__101089 = cljs.core.assoc.call(null, out__101087, cljs.core.first.call(null, in$__101086), cljs.core.second.call(null, in$__101086));
        in$__101086 = G__101088;
        out__101087 = G__101089;
        continue
      }else {
        return out__101087
      }
      break
    }
  };
  var hash_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return hash_map__delegate.call(this, keyvals)
  };
  hash_map.cljs$lang$maxFixedArity = 0;
  hash_map.cljs$lang$applyTo = function(arglist__101090) {
    var keyvals = cljs.core.seq(arglist__101090);
    return hash_map__delegate.call(this, keyvals)
  };
  return hash_map
}();
cljs.core.keys = function keys(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.first, hash_map))
};
cljs.core.vals = function vals(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.second, hash_map))
};
cljs.core.merge = function() {
  var merge__delegate = function(maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      return cljs.core.reduce.call(null, function(p1__101091_SHARP_, p2__101092_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____101093 = p1__101091_SHARP_;
          if(cljs.core.truth_(or__3548__auto____101093)) {
            return or__3548__auto____101093
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__101092_SHARP_)
      }, maps)
    }else {
      return null
    }
  };
  var merge = function(var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return merge__delegate.call(this, maps)
  };
  merge.cljs$lang$maxFixedArity = 0;
  merge.cljs$lang$applyTo = function(arglist__101094) {
    var maps = cljs.core.seq(arglist__101094);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__101097 = function(m, e) {
        var k__101095 = cljs.core.first.call(null, e);
        var v__101096 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__101095))) {
          return cljs.core.assoc.call(null, m, k__101095, f.call(null, cljs.core.get.call(null, m, k__101095), v__101096))
        }else {
          return cljs.core.assoc.call(null, m, k__101095, v__101096)
        }
      };
      var merge2__101099 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__101097, function() {
          var or__3548__auto____101098 = m1;
          if(cljs.core.truth_(or__3548__auto____101098)) {
            return or__3548__auto____101098
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__101099, maps)
    }else {
      return null
    }
  };
  var merge_with = function(f, var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return merge_with__delegate.call(this, f, maps)
  };
  merge_with.cljs$lang$maxFixedArity = 1;
  merge_with.cljs$lang$applyTo = function(arglist__101100) {
    var f = cljs.core.first(arglist__101100);
    var maps = cljs.core.rest(arglist__101100);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__101102 = cljs.core.ObjMap.fromObject([], {});
  var keys__101103 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__101103)) {
      var key__101104 = cljs.core.first.call(null, keys__101103);
      var entry__101105 = cljs.core.get.call(null, map, key__101104, "\ufdd0'user/not-found");
      var G__101106 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__101105, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__101102, key__101104, entry__101105) : ret__101102;
      var G__101107 = cljs.core.next.call(null, keys__101103);
      ret__101102 = G__101106;
      keys__101103 = G__101107;
      continue
    }else {
      return ret__101102
    }
    break
  }
};
cljs.core.Set = function(meta, hash_map) {
  this.meta = meta;
  this.hash_map = hash_map
};
cljs.core.Set.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Set")
};
cljs.core.Set.prototype.cljs$core$IHash$ = true;
cljs.core.Set.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__101108 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__101129 = null;
  var G__101129__101130 = function(coll, v) {
    var this__101109 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__101129__101131 = function(coll, v, not_found) {
    var this__101110 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__101110.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__101129 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101129__101130.call(this, coll, v);
      case 3:
        return G__101129__101131.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101129
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__101133 = null;
  var G__101133__101134 = function(tsym101111, k) {
    var this__101113 = this;
    var tsym101111__101114 = this;
    var coll__101115 = tsym101111__101114;
    return cljs.core._lookup.call(null, coll__101115, k)
  };
  var G__101133__101135 = function(tsym101112, k, not_found) {
    var this__101116 = this;
    var tsym101112__101117 = this;
    var coll__101118 = tsym101112__101117;
    return cljs.core._lookup.call(null, coll__101118, k, not_found)
  };
  G__101133 = function(tsym101112, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101133__101134.call(this, tsym101112, k);
      case 3:
        return G__101133__101135.call(this, tsym101112, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101133
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__101119 = this;
  return new cljs.core.Set(this__101119.meta, cljs.core.assoc.call(null, this__101119.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__101120 = this;
  return cljs.core.keys.call(null, this__101120.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__101121 = this;
  return new cljs.core.Set(this__101121.meta, cljs.core.dissoc.call(null, this__101121.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__101122 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__101123 = this;
  var and__3546__auto____101124 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____101124)) {
    var and__3546__auto____101125 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____101125)) {
      return cljs.core.every_QMARK_.call(null, function(p1__101101_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__101101_SHARP_)
      }, other)
    }else {
      return and__3546__auto____101125
    }
  }else {
    return and__3546__auto____101124
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__101126 = this;
  return new cljs.core.Set(meta, this__101126.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__101127 = this;
  return this__101127.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__101128 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__101128.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__101138 = cljs.core.seq.call(null, coll);
  var out__101139 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__101138)))) {
      var G__101140 = cljs.core.rest.call(null, in$__101138);
      var G__101141 = cljs.core.conj.call(null, out__101139, cljs.core.first.call(null, in$__101138));
      in$__101138 = G__101140;
      out__101139 = G__101141;
      continue
    }else {
      return out__101139
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__101142 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____101143 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____101143)) {
        var e__101144 = temp__3695__auto____101143;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__101144))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__101142, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__101137_SHARP_) {
      var temp__3695__auto____101145 = cljs.core.find.call(null, smap, p1__101137_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____101145)) {
        var e__101146 = temp__3695__auto____101145;
        return cljs.core.second.call(null, e__101146)
      }else {
        return p1__101137_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__101154 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__101147, seen) {
        while(true) {
          var vec__101148__101149 = p__101147;
          var f__101150 = cljs.core.nth.call(null, vec__101148__101149, 0, null);
          var xs__101151 = vec__101148__101149;
          var temp__3698__auto____101152 = cljs.core.seq.call(null, xs__101151);
          if(cljs.core.truth_(temp__3698__auto____101152)) {
            var s__101153 = temp__3698__auto____101152;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__101150))) {
              var G__101155 = cljs.core.rest.call(null, s__101153);
              var G__101156 = seen;
              p__101147 = G__101155;
              seen = G__101156;
              continue
            }else {
              return cljs.core.cons.call(null, f__101150, step.call(null, cljs.core.rest.call(null, s__101153), cljs.core.conj.call(null, seen, f__101150)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__101154.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__101157 = cljs.core.PersistentVector.fromArray([]);
  var s__101158 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__101158))) {
      var G__101159 = cljs.core.conj.call(null, ret__101157, cljs.core.first.call(null, s__101158));
      var G__101160 = cljs.core.next.call(null, s__101158);
      ret__101157 = G__101159;
      s__101158 = G__101160;
      continue
    }else {
      return cljs.core.seq.call(null, ret__101157)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____101161 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____101161)) {
        return or__3548__auto____101161
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__101162 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__101162 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__101162 + 1)
      }
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw new Error(cljs.core.str.call(null, "Doesn't support name: ", x));
      }else {
        return null
      }
    }
  }
};
cljs.core.namespace = function namespace(x) {
  if(cljs.core.truth_(function() {
    var or__3548__auto____101163 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____101163)) {
      return or__3548__auto____101163
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__101164 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__101164 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__101164)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__101167 = cljs.core.ObjMap.fromObject([], {});
  var ks__101168 = cljs.core.seq.call(null, keys);
  var vs__101169 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101170 = ks__101168;
      if(cljs.core.truth_(and__3546__auto____101170)) {
        return vs__101169
      }else {
        return and__3546__auto____101170
      }
    }())) {
      var G__101171 = cljs.core.assoc.call(null, map__101167, cljs.core.first.call(null, ks__101168), cljs.core.first.call(null, vs__101169));
      var G__101172 = cljs.core.next.call(null, ks__101168);
      var G__101173 = cljs.core.next.call(null, vs__101169);
      map__101167 = G__101171;
      ks__101168 = G__101172;
      vs__101169 = G__101173;
      continue
    }else {
      return map__101167
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__101176 = function(k, x) {
    return x
  };
  var max_key__101177 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__101178 = function() {
    var G__101180__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__101165_SHARP_, p2__101166_SHARP_) {
        return max_key.call(null, k, p1__101165_SHARP_, p2__101166_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__101180 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__101180__delegate.call(this, k, x, y, more)
    };
    G__101180.cljs$lang$maxFixedArity = 3;
    G__101180.cljs$lang$applyTo = function(arglist__101181) {
      var k = cljs.core.first(arglist__101181);
      var x = cljs.core.first(cljs.core.next(arglist__101181));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101181)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101181)));
      return G__101180__delegate.call(this, k, x, y, more)
    };
    return G__101180
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__101176.call(this, k, x);
      case 3:
        return max_key__101177.call(this, k, x, y);
      default:
        return max_key__101178.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__101178.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__101182 = function(k, x) {
    return x
  };
  var min_key__101183 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__101184 = function() {
    var G__101186__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__101174_SHARP_, p2__101175_SHARP_) {
        return min_key.call(null, k, p1__101174_SHARP_, p2__101175_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__101186 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__101186__delegate.call(this, k, x, y, more)
    };
    G__101186.cljs$lang$maxFixedArity = 3;
    G__101186.cljs$lang$applyTo = function(arglist__101187) {
      var k = cljs.core.first(arglist__101187);
      var x = cljs.core.first(cljs.core.next(arglist__101187));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101187)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101187)));
      return G__101186__delegate.call(this, k, x, y, more)
    };
    return G__101186
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__101182.call(this, k, x);
      case 3:
        return min_key__101183.call(this, k, x, y);
      default:
        return min_key__101184.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__101184.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__101190 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__101191 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____101188 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____101188)) {
        var s__101189 = temp__3698__auto____101188;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__101189), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__101189)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__101190.call(this, n, step);
      case 3:
        return partition_all__101191.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____101193 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____101193)) {
      var s__101194 = temp__3698__auto____101193;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__101194)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__101194), take_while.call(null, pred, cljs.core.rest.call(null, s__101194)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.Range = function(meta, start, end, step) {
  this.meta = meta;
  this.start = start;
  this.end = end;
  this.step = step
};
cljs.core.Range.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Range")
};
cljs.core.Range.prototype.cljs$core$IHash$ = true;
cljs.core.Range.prototype.cljs$core$IHash$_hash = function(rng) {
  var this__101195 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__101196 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__101212 = null;
  var G__101212__101213 = function(rng, f) {
    var this__101197 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__101212__101214 = function(rng, f, s) {
    var this__101198 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__101212 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__101212__101213.call(this, rng, f);
      case 3:
        return G__101212__101214.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101212
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__101199 = this;
  var comp__101200 = cljs.core.truth_(this__101199.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__101200.call(null, this__101199.start, this__101199.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__101201 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__101201.end - this__101201.start) / this__101201.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__101202 = this;
  return this__101202.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__101203 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__101203.meta, this__101203.start + this__101203.step, this__101203.end, this__101203.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__101204 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__101205 = this;
  return new cljs.core.Range(meta, this__101205.start, this__101205.end, this__101205.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__101206 = this;
  return this__101206.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__101216 = null;
  var G__101216__101217 = function(rng, n) {
    var this__101207 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__101207.start + n * this__101207.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____101208 = this__101207.start > this__101207.end;
        if(cljs.core.truth_(and__3546__auto____101208)) {
          return cljs.core._EQ_.call(null, this__101207.step, 0)
        }else {
          return and__3546__auto____101208
        }
      }())) {
        return this__101207.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__101216__101218 = function(rng, n, not_found) {
    var this__101209 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__101209.start + n * this__101209.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____101210 = this__101209.start > this__101209.end;
        if(cljs.core.truth_(and__3546__auto____101210)) {
          return cljs.core._EQ_.call(null, this__101209.step, 0)
        }else {
          return and__3546__auto____101210
        }
      }())) {
        return this__101209.start
      }else {
        return not_found
      }
    }
  };
  G__101216 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101216__101217.call(this, rng, n);
      case 3:
        return G__101216__101218.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101216
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__101211 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__101211.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__101220 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__101221 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__101222 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__101223 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__101220.call(this);
      case 1:
        return range__101221.call(this, start);
      case 2:
        return range__101222.call(this, start, end);
      case 3:
        return range__101223.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____101225 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____101225)) {
      var s__101226 = temp__3698__auto____101225;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__101226), take_nth.call(null, n, cljs.core.drop.call(null, n, s__101226)))
    }else {
      return null
    }
  })
};
cljs.core.split_with = function split_with(pred, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take_while.call(null, pred, coll), cljs.core.drop_while.call(null, pred, coll)])
};
cljs.core.partition_by = function partition_by(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____101228 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____101228)) {
      var s__101229 = temp__3698__auto____101228;
      var fst__101230 = cljs.core.first.call(null, s__101229);
      var fv__101231 = f.call(null, fst__101230);
      var run__101232 = cljs.core.cons.call(null, fst__101230, cljs.core.take_while.call(null, function(p1__101227_SHARP_) {
        return cljs.core._EQ_.call(null, fv__101231, f.call(null, p1__101227_SHARP_))
      }, cljs.core.next.call(null, s__101229)));
      return cljs.core.cons.call(null, run__101232, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__101232), s__101229))))
    }else {
      return null
    }
  })
};
cljs.core.frequencies = function frequencies(coll) {
  return cljs.core.reduce.call(null, function(counts, x) {
    return cljs.core.assoc.call(null, counts, x, cljs.core.get.call(null, counts, x, 0) + 1)
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.reductions = function() {
  var reductions = null;
  var reductions__101247 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____101243 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____101243)) {
        var s__101244 = temp__3695__auto____101243;
        return reductions.call(null, f, cljs.core.first.call(null, s__101244), cljs.core.rest.call(null, s__101244))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__101248 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____101245 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____101245)) {
        var s__101246 = temp__3698__auto____101245;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__101246)), cljs.core.rest.call(null, s__101246))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__101247.call(this, f, init);
      case 3:
        return reductions__101248.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__101251 = function(f) {
    return function() {
      var G__101256 = null;
      var G__101256__101257 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__101256__101258 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__101256__101259 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__101256__101260 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__101256__101261 = function() {
        var G__101263__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__101263 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__101263__delegate.call(this, x, y, z, args)
        };
        G__101263.cljs$lang$maxFixedArity = 3;
        G__101263.cljs$lang$applyTo = function(arglist__101264) {
          var x = cljs.core.first(arglist__101264);
          var y = cljs.core.first(cljs.core.next(arglist__101264));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101264)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101264)));
          return G__101263__delegate.call(this, x, y, z, args)
        };
        return G__101263
      }();
      G__101256 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__101256__101257.call(this);
          case 1:
            return G__101256__101258.call(this, x);
          case 2:
            return G__101256__101259.call(this, x, y);
          case 3:
            return G__101256__101260.call(this, x, y, z);
          default:
            return G__101256__101261.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__101256.cljs$lang$maxFixedArity = 3;
      G__101256.cljs$lang$applyTo = G__101256__101261.cljs$lang$applyTo;
      return G__101256
    }()
  };
  var juxt__101252 = function(f, g) {
    return function() {
      var G__101265 = null;
      var G__101265__101266 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__101265__101267 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__101265__101268 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__101265__101269 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__101265__101270 = function() {
        var G__101272__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__101272 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__101272__delegate.call(this, x, y, z, args)
        };
        G__101272.cljs$lang$maxFixedArity = 3;
        G__101272.cljs$lang$applyTo = function(arglist__101273) {
          var x = cljs.core.first(arglist__101273);
          var y = cljs.core.first(cljs.core.next(arglist__101273));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101273)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101273)));
          return G__101272__delegate.call(this, x, y, z, args)
        };
        return G__101272
      }();
      G__101265 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__101265__101266.call(this);
          case 1:
            return G__101265__101267.call(this, x);
          case 2:
            return G__101265__101268.call(this, x, y);
          case 3:
            return G__101265__101269.call(this, x, y, z);
          default:
            return G__101265__101270.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__101265.cljs$lang$maxFixedArity = 3;
      G__101265.cljs$lang$applyTo = G__101265__101270.cljs$lang$applyTo;
      return G__101265
    }()
  };
  var juxt__101253 = function(f, g, h) {
    return function() {
      var G__101274 = null;
      var G__101274__101275 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__101274__101276 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__101274__101277 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__101274__101278 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__101274__101279 = function() {
        var G__101281__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__101281 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__101281__delegate.call(this, x, y, z, args)
        };
        G__101281.cljs$lang$maxFixedArity = 3;
        G__101281.cljs$lang$applyTo = function(arglist__101282) {
          var x = cljs.core.first(arglist__101282);
          var y = cljs.core.first(cljs.core.next(arglist__101282));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101282)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101282)));
          return G__101281__delegate.call(this, x, y, z, args)
        };
        return G__101281
      }();
      G__101274 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__101274__101275.call(this);
          case 1:
            return G__101274__101276.call(this, x);
          case 2:
            return G__101274__101277.call(this, x, y);
          case 3:
            return G__101274__101278.call(this, x, y, z);
          default:
            return G__101274__101279.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__101274.cljs$lang$maxFixedArity = 3;
      G__101274.cljs$lang$applyTo = G__101274__101279.cljs$lang$applyTo;
      return G__101274
    }()
  };
  var juxt__101254 = function() {
    var G__101283__delegate = function(f, g, h, fs) {
      var fs__101250 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__101284 = null;
        var G__101284__101285 = function() {
          return cljs.core.reduce.call(null, function(p1__101233_SHARP_, p2__101234_SHARP_) {
            return cljs.core.conj.call(null, p1__101233_SHARP_, p2__101234_SHARP_.call(null))
          }, cljs.core.PersistentVector.fromArray([]), fs__101250)
        };
        var G__101284__101286 = function(x) {
          return cljs.core.reduce.call(null, function(p1__101235_SHARP_, p2__101236_SHARP_) {
            return cljs.core.conj.call(null, p1__101235_SHARP_, p2__101236_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.fromArray([]), fs__101250)
        };
        var G__101284__101287 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__101237_SHARP_, p2__101238_SHARP_) {
            return cljs.core.conj.call(null, p1__101237_SHARP_, p2__101238_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.fromArray([]), fs__101250)
        };
        var G__101284__101288 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__101239_SHARP_, p2__101240_SHARP_) {
            return cljs.core.conj.call(null, p1__101239_SHARP_, p2__101240_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.fromArray([]), fs__101250)
        };
        var G__101284__101289 = function() {
          var G__101291__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__101241_SHARP_, p2__101242_SHARP_) {
              return cljs.core.conj.call(null, p1__101241_SHARP_, cljs.core.apply.call(null, p2__101242_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.fromArray([]), fs__101250)
          };
          var G__101291 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__101291__delegate.call(this, x, y, z, args)
          };
          G__101291.cljs$lang$maxFixedArity = 3;
          G__101291.cljs$lang$applyTo = function(arglist__101292) {
            var x = cljs.core.first(arglist__101292);
            var y = cljs.core.first(cljs.core.next(arglist__101292));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101292)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101292)));
            return G__101291__delegate.call(this, x, y, z, args)
          };
          return G__101291
        }();
        G__101284 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__101284__101285.call(this);
            case 1:
              return G__101284__101286.call(this, x);
            case 2:
              return G__101284__101287.call(this, x, y);
            case 3:
              return G__101284__101288.call(this, x, y, z);
            default:
              return G__101284__101289.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__101284.cljs$lang$maxFixedArity = 3;
        G__101284.cljs$lang$applyTo = G__101284__101289.cljs$lang$applyTo;
        return G__101284
      }()
    };
    var G__101283 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__101283__delegate.call(this, f, g, h, fs)
    };
    G__101283.cljs$lang$maxFixedArity = 3;
    G__101283.cljs$lang$applyTo = function(arglist__101293) {
      var f = cljs.core.first(arglist__101293);
      var g = cljs.core.first(cljs.core.next(arglist__101293));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101293)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__101293)));
      return G__101283__delegate.call(this, f, g, h, fs)
    };
    return G__101283
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__101251.call(this, f);
      case 2:
        return juxt__101252.call(this, f, g);
      case 3:
        return juxt__101253.call(this, f, g, h);
      default:
        return juxt__101254.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__101254.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__101295 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__101298 = cljs.core.next.call(null, coll);
        coll = G__101298;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__101296 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____101294 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____101294)) {
          return n > 0
        }else {
          return and__3546__auto____101294
        }
      }())) {
        var G__101299 = n - 1;
        var G__101300 = cljs.core.next.call(null, coll);
        n = G__101299;
        coll = G__101300;
        continue
      }else {
        return null
      }
      break
    }
  };
  dorun = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return dorun__101295.call(this, n);
      case 2:
        return dorun__101296.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__101301 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__101302 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__101301.call(this, n);
      case 2:
        return doall__101302.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__101304 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__101304), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__101304), 1))) {
      return cljs.core.first.call(null, matches__101304)
    }else {
      return cljs.core.vec.call(null, matches__101304)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__101305 = re.exec(s);
  if(cljs.core.truth_(matches__101305 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__101305), 1))) {
      return cljs.core.first.call(null, matches__101305)
    }else {
      return cljs.core.vec.call(null, matches__101305)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__101306 = cljs.core.re_find.call(null, re, s);
  var match_idx__101307 = s.search(re);
  var match_str__101308 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__101306)) ? cljs.core.first.call(null, match_data__101306) : match_data__101306;
  var post_match__101309 = cljs.core.subs.call(null, s, match_idx__101307 + cljs.core.count.call(null, match_str__101308));
  if(cljs.core.truth_(match_data__101306)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__101306, re_seq.call(null, re, post_match__101309))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__101311__101312 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___101313 = cljs.core.nth.call(null, vec__101311__101312, 0, null);
  var flags__101314 = cljs.core.nth.call(null, vec__101311__101312, 1, null);
  var pattern__101315 = cljs.core.nth.call(null, vec__101311__101312, 2, null);
  return new RegExp(pattern__101315, flags__101314)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.PersistentVector.fromArray([sep]), cljs.core.map.call(null, function(p1__101310_SHARP_) {
    return print_one.call(null, p1__101310_SHARP_, opts)
  }, coll))), cljs.core.PersistentVector.fromArray([end]))
};
cljs.core.string_print = function string_print(x) {
  cljs.core._STAR_print_fn_STAR_.call(null, x);
  return null
};
cljs.core.flush = function flush() {
  return null
};
cljs.core.pr_seq = function pr_seq(obj, opts) {
  if(cljs.core.truth_(obj === null)) {
    return cljs.core.list.call(null, "nil")
  }else {
    if(cljs.core.truth_(void 0 === obj)) {
      return cljs.core.list.call(null, "#<undefined>")
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.concat.call(null, cljs.core.truth_(function() {
          var and__3546__auto____101316 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____101316)) {
            var and__3546__auto____101320 = function() {
              var x__451__auto____101317 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____101318 = x__451__auto____101317;
                if(cljs.core.truth_(and__3546__auto____101318)) {
                  var and__3546__auto____101319 = x__451__auto____101317.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____101319)) {
                    return cljs.core.not.call(null, x__451__auto____101317.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____101319
                  }
                }else {
                  return and__3546__auto____101318
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__451__auto____101317)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____101320)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____101320
            }
          }else {
            return and__3546__auto____101316
          }
        }()) ? cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.PersistentVector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__451__auto____101321 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____101322 = x__451__auto____101321;
            if(cljs.core.truth_(and__3546__auto____101322)) {
              var and__3546__auto____101323 = x__451__auto____101321.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____101323)) {
                return cljs.core.not.call(null, x__451__auto____101321.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____101323
              }
            }else {
              return and__3546__auto____101322
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__451__auto____101321)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__101324 = cljs.core.first.call(null, objs);
  var sb__101325 = new goog.string.StringBuffer;
  var G__101326__101327 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__101326__101327)) {
    var obj__101328 = cljs.core.first.call(null, G__101326__101327);
    var G__101326__101329 = G__101326__101327;
    while(true) {
      if(cljs.core.truth_(obj__101328 === first_obj__101324)) {
      }else {
        sb__101325.append(" ")
      }
      var G__101330__101331 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__101328, opts));
      if(cljs.core.truth_(G__101330__101331)) {
        var string__101332 = cljs.core.first.call(null, G__101330__101331);
        var G__101330__101333 = G__101330__101331;
        while(true) {
          sb__101325.append(string__101332);
          var temp__3698__auto____101334 = cljs.core.next.call(null, G__101330__101333);
          if(cljs.core.truth_(temp__3698__auto____101334)) {
            var G__101330__101335 = temp__3698__auto____101334;
            var G__101338 = cljs.core.first.call(null, G__101330__101335);
            var G__101339 = G__101330__101335;
            string__101332 = G__101338;
            G__101330__101333 = G__101339;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____101336 = cljs.core.next.call(null, G__101326__101329);
      if(cljs.core.truth_(temp__3698__auto____101336)) {
        var G__101326__101337 = temp__3698__auto____101336;
        var G__101340 = cljs.core.first.call(null, G__101326__101337);
        var G__101341 = G__101326__101337;
        obj__101328 = G__101340;
        G__101326__101329 = G__101341;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__101325)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__101342 = cljs.core.first.call(null, objs);
  var G__101343__101344 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__101343__101344)) {
    var obj__101345 = cljs.core.first.call(null, G__101343__101344);
    var G__101343__101346 = G__101343__101344;
    while(true) {
      if(cljs.core.truth_(obj__101345 === first_obj__101342)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__101347__101348 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__101345, opts));
      if(cljs.core.truth_(G__101347__101348)) {
        var string__101349 = cljs.core.first.call(null, G__101347__101348);
        var G__101347__101350 = G__101347__101348;
        while(true) {
          cljs.core.string_print.call(null, string__101349);
          var temp__3698__auto____101351 = cljs.core.next.call(null, G__101347__101350);
          if(cljs.core.truth_(temp__3698__auto____101351)) {
            var G__101347__101352 = temp__3698__auto____101351;
            var G__101355 = cljs.core.first.call(null, G__101347__101352);
            var G__101356 = G__101347__101352;
            string__101349 = G__101355;
            G__101347__101350 = G__101356;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____101353 = cljs.core.next.call(null, G__101343__101346);
      if(cljs.core.truth_(temp__3698__auto____101353)) {
        var G__101343__101354 = temp__3698__auto____101353;
        var G__101357 = cljs.core.first.call(null, G__101343__101354);
        var G__101358 = G__101343__101354;
        obj__101345 = G__101357;
        G__101343__101346 = G__101358;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.newline = function newline(opts) {
  cljs.core.string_print.call(null, "\n");
  if(cljs.core.truth_(cljs.core.get.call(null, opts, "\ufdd0'flush-on-newline"))) {
    return cljs.core.flush.call(null)
  }else {
    return null
  }
};
cljs.core._STAR_flush_on_newline_STAR_ = true;
cljs.core._STAR_print_readably_STAR_ = true;
cljs.core._STAR_print_meta_STAR_ = false;
cljs.core._STAR_print_dup_STAR_ = false;
cljs.core.pr_opts = function pr_opts() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'flush-on-newline", "\ufdd0'readably", "\ufdd0'meta", "\ufdd0'dup"], {"\ufdd0'flush-on-newline":cljs.core._STAR_flush_on_newline_STAR_, "\ufdd0'readably":cljs.core._STAR_print_readably_STAR_, "\ufdd0'meta":cljs.core._STAR_print_meta_STAR_, "\ufdd0'dup":cljs.core._STAR_print_dup_STAR_})
};
cljs.core.pr_str = function() {
  var pr_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr_str__delegate.call(this, objs)
  };
  pr_str.cljs$lang$maxFixedArity = 0;
  pr_str.cljs$lang$applyTo = function(arglist__101359) {
    var objs = cljs.core.seq(arglist__101359);
    return pr_str__delegate.call(this, objs)
  };
  return pr_str
}();
cljs.core.pr = function() {
  var pr__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr__delegate.call(this, objs)
  };
  pr.cljs$lang$maxFixedArity = 0;
  pr.cljs$lang$applyTo = function(arglist__101360) {
    var objs = cljs.core.seq(arglist__101360);
    return pr__delegate.call(this, objs)
  };
  return pr
}();
cljs.core.print = function() {
  var cljs_core_print__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var cljs_core_print = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return cljs_core_print__delegate.call(this, objs)
  };
  cljs_core_print.cljs$lang$maxFixedArity = 0;
  cljs_core_print.cljs$lang$applyTo = function(arglist__101361) {
    var objs = cljs.core.seq(arglist__101361);
    return cljs_core_print__delegate.call(this, objs)
  };
  return cljs_core_print
}();
cljs.core.println = function() {
  var println__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var println = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println__delegate.call(this, objs)
  };
  println.cljs$lang$maxFixedArity = 0;
  println.cljs$lang$applyTo = function(arglist__101362) {
    var objs = cljs.core.seq(arglist__101362);
    return println__delegate.call(this, objs)
  };
  return println
}();
cljs.core.prn = function() {
  var prn__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var prn = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn__delegate.call(this, objs)
  };
  prn.cljs$lang$maxFixedArity = 0;
  prn.cljs$lang$applyTo = function(arglist__101363) {
    var objs = cljs.core.seq(arglist__101363);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__101364 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__101364, "{", ", ", "}", opts, coll)
};
cljs.core.IPrintable["number"] = true;
cljs.core._pr_seq["number"] = function(n, opts) {
  return cljs.core.list.call(null, cljs.core.str.call(null, n))
};
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Subvec.prototype.cljs$core$IPrintable$ = true;
cljs.core.Subvec.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.LazySeq.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["boolean"] = true;
cljs.core._pr_seq["boolean"] = function(bool, opts) {
  return cljs.core.list.call(null, cljs.core.str.call(null, bool))
};
cljs.core.Set.prototype.cljs$core$IPrintable$ = true;
cljs.core.Set.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.IPrintable["string"] = true;
cljs.core._pr_seq["string"] = function(obj, opts) {
  if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, obj))) {
    return cljs.core.list.call(null, cljs.core.str.call(null, ":", function() {
      var temp__3698__auto____101365 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____101365)) {
        var nspc__101366 = temp__3698__auto____101365;
        return cljs.core.str.call(null, nspc__101366, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____101367 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____101367)) {
          var nspc__101368 = temp__3698__auto____101367;
          return cljs.core.str.call(null, nspc__101368, "/")
        }else {
          return null
        }
      }(), cljs.core.name.call(null, obj)))
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.list.call(null, cljs.core.truth_("\ufdd0'readably".call(null, opts)) ? goog.string.quote.call(null, obj) : obj)
      }else {
        return null
      }
    }
  }
};
cljs.core.Vector.prototype.cljs$core$IPrintable$ = true;
cljs.core.Vector.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.List.prototype.cljs$core$IPrintable$ = true;
cljs.core.List.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["array"] = true;
cljs.core._pr_seq["array"] = function(a, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#<Array [", ", ", "]>", opts, a)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["function"] = true;
cljs.core._pr_seq["function"] = function(this$) {
  return cljs.core.list.call(null, "#<", cljs.core.str.call(null, this$), ">")
};
cljs.core.EmptyList.prototype.cljs$core$IPrintable$ = true;
cljs.core.EmptyList.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.list.call(null, "()")
};
cljs.core.Cons.prototype.cljs$core$IPrintable$ = true;
cljs.core.Cons.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Range.prototype.cljs$core$IPrintable$ = true;
cljs.core.Range.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ObjMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.ObjMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__101369 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__101369, "{", ", ", "}", opts, coll)
};
cljs.core.Atom = function(state, meta, validator, watches) {
  this.state = state;
  this.meta = meta;
  this.validator = validator;
  this.watches = watches
};
cljs.core.Atom.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Atom")
};
cljs.core.Atom.prototype.cljs$core$IHash$ = true;
cljs.core.Atom.prototype.cljs$core$IHash$_hash = function(this$) {
  var this__101370 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__101371 = this;
  var G__101372__101373 = cljs.core.seq.call(null, this__101371.watches);
  if(cljs.core.truth_(G__101372__101373)) {
    var G__101375__101377 = cljs.core.first.call(null, G__101372__101373);
    var vec__101376__101378 = G__101375__101377;
    var key__101379 = cljs.core.nth.call(null, vec__101376__101378, 0, null);
    var f__101380 = cljs.core.nth.call(null, vec__101376__101378, 1, null);
    var G__101372__101381 = G__101372__101373;
    var G__101375__101382 = G__101375__101377;
    var G__101372__101383 = G__101372__101381;
    while(true) {
      var vec__101384__101385 = G__101375__101382;
      var key__101386 = cljs.core.nth.call(null, vec__101384__101385, 0, null);
      var f__101387 = cljs.core.nth.call(null, vec__101384__101385, 1, null);
      var G__101372__101388 = G__101372__101383;
      f__101387.call(null, key__101386, this$, oldval, newval);
      var temp__3698__auto____101389 = cljs.core.next.call(null, G__101372__101388);
      if(cljs.core.truth_(temp__3698__auto____101389)) {
        var G__101372__101390 = temp__3698__auto____101389;
        var G__101397 = cljs.core.first.call(null, G__101372__101390);
        var G__101398 = G__101372__101390;
        G__101375__101382 = G__101397;
        G__101372__101383 = G__101398;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_add_watch = function(this$, key, f) {
  var this__101391 = this;
  return this$.watches = cljs.core.assoc.call(null, this__101391.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__101392 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__101392.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__101393 = this;
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__101393.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__101394 = this;
  return this__101394.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__101395 = this;
  return this__101395.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__101396 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__101405 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__101406 = function() {
    var G__101408__delegate = function(x, p__101399) {
      var map__101400__101401 = p__101399;
      var map__101400__101402 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__101400__101401)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__101400__101401) : map__101400__101401;
      var validator__101403 = cljs.core.get.call(null, map__101400__101402, "\ufdd0'validator");
      var meta__101404 = cljs.core.get.call(null, map__101400__101402, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__101404, validator__101403, null)
    };
    var G__101408 = function(x, var_args) {
      var p__101399 = null;
      if(goog.isDef(var_args)) {
        p__101399 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__101408__delegate.call(this, x, p__101399)
    };
    G__101408.cljs$lang$maxFixedArity = 1;
    G__101408.cljs$lang$applyTo = function(arglist__101409) {
      var x = cljs.core.first(arglist__101409);
      var p__101399 = cljs.core.rest(arglist__101409);
      return G__101408__delegate.call(this, x, p__101399)
    };
    return G__101408
  }();
  atom = function(x, var_args) {
    var p__101399 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__101405.call(this, x);
      default:
        return atom__101406.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__101406.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____101410 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____101410)) {
    var validate__101411 = temp__3698__auto____101410;
    if(cljs.core.truth_(validate__101411.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3257)))));
    }
  }else {
  }
  var old_value__101412 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__101412, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___101413 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___101414 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___101415 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___101416 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___101417 = function() {
    var G__101419__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__101419 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__101419__delegate.call(this, a, f, x, y, z, more)
    };
    G__101419.cljs$lang$maxFixedArity = 5;
    G__101419.cljs$lang$applyTo = function(arglist__101420) {
      var a = cljs.core.first(arglist__101420);
      var f = cljs.core.first(cljs.core.next(arglist__101420));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__101420)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__101420))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__101420)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__101420)))));
      return G__101419__delegate.call(this, a, f, x, y, z, more)
    };
    return G__101419
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___101413.call(this, a, f);
      case 3:
        return swap_BANG___101414.call(this, a, f, x);
      case 4:
        return swap_BANG___101415.call(this, a, f, x, y);
      case 5:
        return swap_BANG___101416.call(this, a, f, x, y, z);
      default:
        return swap_BANG___101417.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___101417.cljs$lang$applyTo;
  return swap_BANG_
}();
cljs.core.compare_and_set_BANG_ = function compare_and_set_BANG_(a, oldval, newval) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, a.state, oldval))) {
    cljs.core.reset_BANG_.call(null, a, newval);
    return true
  }else {
    return false
  }
};
cljs.core.deref = function deref(o) {
  return cljs.core._deref.call(null, o)
};
cljs.core.set_validator_BANG_ = function set_validator_BANG_(iref, val) {
  return iref.validator = val
};
cljs.core.get_validator = function get_validator(iref) {
  return iref.validator
};
cljs.core.alter_meta_BANG_ = function() {
  var alter_meta_BANG___delegate = function(iref, f, args) {
    return iref.meta = cljs.core.apply.call(null, f, iref.meta, args)
  };
  var alter_meta_BANG_ = function(iref, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$maxFixedArity = 2;
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__101421) {
    var iref = cljs.core.first(arglist__101421);
    var f = cljs.core.first(cljs.core.next(arglist__101421));
    var args = cljs.core.rest(cljs.core.next(arglist__101421));
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  return alter_meta_BANG_
}();
cljs.core.reset_meta_BANG_ = function reset_meta_BANG_(iref, m) {
  return iref.meta = m
};
cljs.core.add_watch = function add_watch(iref, key, f) {
  return cljs.core._add_watch.call(null, iref, key, f)
};
cljs.core.remove_watch = function remove_watch(iref, key) {
  return cljs.core._remove_watch.call(null, iref, key)
};
cljs.core.gensym_counter = null;
cljs.core.gensym = function() {
  var gensym = null;
  var gensym__101422 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__101423 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__101422.call(this);
      case 1:
        return gensym__101423.call(this, prefix_string)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return gensym
}();
cljs.core.fixture1 = 1;
cljs.core.fixture2 = 2;
cljs.core.Delay = function(f, state) {
  this.f = f;
  this.state = state
};
cljs.core.Delay.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.Delay")
};
cljs.core.Delay.prototype.cljs$core$IPending$ = true;
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_ = function(d) {
  var this__101425 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__101425.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__101426 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__101426.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__101426.state, this__101426.f)
  }
  return cljs.core.deref.call(null, this__101426.state)
};
cljs.core.Delay;
cljs.core.delay = function() {
  var delay__delegate = function(body) {
    return new cljs.core.Delay(function() {
      return cljs.core.apply.call(null, cljs.core.identity, body)
    }, cljs.core.atom.call(null, null))
  };
  var delay = function(var_args) {
    var body = null;
    if(goog.isDef(var_args)) {
      body = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return delay__delegate.call(this, body)
  };
  delay.cljs$lang$maxFixedArity = 0;
  delay.cljs$lang$applyTo = function(arglist__101427) {
    var body = cljs.core.seq(arglist__101427);
    return delay__delegate.call(this, body)
  };
  return delay
}();
cljs.core.delay_QMARK_ = function delay_QMARK_(x) {
  return cljs.core.instance_QMARK_.call(null, cljs.core.Delay, x)
};
cljs.core.force = function force(x) {
  if(cljs.core.truth_(cljs.core.delay_QMARK_.call(null, x))) {
    return cljs.core.deref.call(null, x)
  }else {
    return x
  }
};
cljs.core.realized_QMARK_ = function realized_QMARK_(d) {
  return cljs.core._realized_QMARK_.call(null, d)
};
cljs.core.js__GT_clj = function() {
  var js__GT_clj__delegate = function(x, options) {
    var map__101428__101429 = options;
    var map__101428__101430 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__101428__101429)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__101428__101429) : map__101428__101429;
    var keywordize_keys__101431 = cljs.core.get.call(null, map__101428__101430, "\ufdd0'keywordize-keys");
    var keyfn__101432 = cljs.core.truth_(keywordize_keys__101431) ? cljs.core.keyword : cljs.core.str;
    var f__101438 = function thisfn(x) {
      if(cljs.core.truth_(cljs.core.seq_QMARK_.call(null, x))) {
        return cljs.core.doall.call(null, cljs.core.map.call(null, thisfn, x))
      }else {
        if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null, x))) {
          return cljs.core.into.call(null, cljs.core.empty.call(null, x), cljs.core.map.call(null, thisfn, x))
        }else {
          if(cljs.core.truth_(goog.isArray.call(null, x))) {
            return cljs.core.vec.call(null, cljs.core.map.call(null, thisfn, x))
          }else {
            if(cljs.core.truth_(goog.isObject.call(null, x))) {
              return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), function() {
                var iter__515__auto____101437 = function iter__101433(s__101434) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__101434__101435 = s__101434;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__101434__101435))) {
                        var k__101436 = cljs.core.first.call(null, s__101434__101435);
                        return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([keyfn__101432.call(null, k__101436), thisfn.call(null, x[k__101436])]), iter__101433.call(null, cljs.core.rest.call(null, s__101434__101435)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__515__auto____101437.call(null, cljs.core.js_keys.call(null, x))
              }())
            }else {
              if(cljs.core.truth_("\ufdd0'else")) {
                return x
              }else {
                return null
              }
            }
          }
        }
      }
    };
    return f__101438.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__101439) {
    var x = cljs.core.first(arglist__101439);
    var options = cljs.core.rest(arglist__101439);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__101440 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__101444__delegate = function(args) {
      var temp__3695__auto____101441 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__101440), args);
      if(cljs.core.truth_(temp__3695__auto____101441)) {
        var v__101442 = temp__3695__auto____101441;
        return v__101442
      }else {
        var ret__101443 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__101440, cljs.core.assoc, args, ret__101443);
        return ret__101443
      }
    };
    var G__101444 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__101444__delegate.call(this, args)
    };
    G__101444.cljs$lang$maxFixedArity = 0;
    G__101444.cljs$lang$applyTo = function(arglist__101445) {
      var args = cljs.core.seq(arglist__101445);
      return G__101444__delegate.call(this, args)
    };
    return G__101444
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__101447 = function(f) {
    while(true) {
      var ret__101446 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__101446))) {
        var G__101450 = ret__101446;
        f = G__101450;
        continue
      }else {
        return ret__101446
      }
      break
    }
  };
  var trampoline__101448 = function() {
    var G__101451__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__101451 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__101451__delegate.call(this, f, args)
    };
    G__101451.cljs$lang$maxFixedArity = 1;
    G__101451.cljs$lang$applyTo = function(arglist__101452) {
      var f = cljs.core.first(arglist__101452);
      var args = cljs.core.rest(arglist__101452);
      return G__101451__delegate.call(this, f, args)
    };
    return G__101451
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__101447.call(this, f);
      default:
        return trampoline__101448.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__101448.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__101453 = function() {
    return rand.call(null, 1)
  };
  var rand__101454 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__101453.call(this);
      case 1:
        return rand__101454.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return Math.floor(Math.random() * n)
};
cljs.core.rand_nth = function rand_nth(coll) {
  return cljs.core.nth.call(null, coll, cljs.core.rand_int.call(null, cljs.core.count.call(null, coll)))
};
cljs.core.group_by = function group_by(f, coll) {
  return cljs.core.reduce.call(null, function(ret, x) {
    var k__101456 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__101456, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__101456, cljs.core.PersistentVector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___101465 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___101466 = function(h, child, parent) {
    var or__3548__auto____101457 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____101457)) {
      return or__3548__auto____101457
    }else {
      var or__3548__auto____101458 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____101458)) {
        return or__3548__auto____101458
      }else {
        var and__3546__auto____101459 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____101459)) {
          var and__3546__auto____101460 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____101460)) {
            var and__3546__auto____101461 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____101461)) {
              var ret__101462 = true;
              var i__101463 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____101464 = cljs.core.not.call(null, ret__101462);
                  if(cljs.core.truth_(or__3548__auto____101464)) {
                    return or__3548__auto____101464
                  }else {
                    return cljs.core._EQ_.call(null, i__101463, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__101462
                }else {
                  var G__101468 = isa_QMARK_.call(null, h, child.call(null, i__101463), parent.call(null, i__101463));
                  var G__101469 = i__101463 + 1;
                  ret__101462 = G__101468;
                  i__101463 = G__101469;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____101461
            }
          }else {
            return and__3546__auto____101460
          }
        }else {
          return and__3546__auto____101459
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___101465.call(this, h, child);
      case 3:
        return isa_QMARK___101466.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__101470 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__101471 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__101470.call(this, h);
      case 2:
        return parents__101471.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__101473 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__101474 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__101473.call(this, h);
      case 2:
        return ancestors__101474.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__101476 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__101477 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__101476.call(this, h);
      case 2:
        return descendants__101477.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__101487 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3549)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__101488 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3553)))));
    }
    var tp__101482 = "\ufdd0'parents".call(null, h);
    var td__101483 = "\ufdd0'descendants".call(null, h);
    var ta__101484 = "\ufdd0'ancestors".call(null, h);
    var tf__101485 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____101486 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__101482.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__101484.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__101484.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__101482, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__101485.call(null, "\ufdd0'ancestors".call(null, h), tag, td__101483, parent, ta__101484), "\ufdd0'descendants":tf__101485.call(null, "\ufdd0'descendants".call(null, h), parent, ta__101484, tag, td__101483)})
    }();
    if(cljs.core.truth_(or__3548__auto____101486)) {
      return or__3548__auto____101486
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__101487.call(this, h, tag);
      case 3:
        return derive__101488.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__101494 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__101495 = function(h, tag, parent) {
    var parentMap__101490 = "\ufdd0'parents".call(null, h);
    var childsParents__101491 = cljs.core.truth_(parentMap__101490.call(null, tag)) ? cljs.core.disj.call(null, parentMap__101490.call(null, tag), parent) : cljs.core.set([]);
    var newParents__101492 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__101491)) ? cljs.core.assoc.call(null, parentMap__101490, tag, childsParents__101491) : cljs.core.dissoc.call(null, parentMap__101490, tag);
    var deriv_seq__101493 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__101479_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__101479_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__101479_SHARP_), cljs.core.second.call(null, p1__101479_SHARP_)))
    }, cljs.core.seq.call(null, newParents__101492)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__101490.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__101480_SHARP_, p2__101481_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__101480_SHARP_, p2__101481_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__101493))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__101494.call(this, h, tag);
      case 3:
        return underive__101495.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return underive
}();
cljs.core.reset_cache = function reset_cache(method_cache, method_table, cached_hierarchy, hierarchy) {
  cljs.core.swap_BANG_.call(null, method_cache, function(_) {
    return cljs.core.deref.call(null, method_table)
  });
  return cljs.core.swap_BANG_.call(null, cached_hierarchy, function(_) {
    return cljs.core.deref.call(null, hierarchy)
  })
};
cljs.core.prefers_STAR_ = function prefers_STAR_(x, y, prefer_table) {
  var xprefs__101497 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____101499 = cljs.core.truth_(function() {
    var and__3546__auto____101498 = xprefs__101497;
    if(cljs.core.truth_(and__3546__auto____101498)) {
      return xprefs__101497.call(null, y)
    }else {
      return and__3546__auto____101498
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____101499)) {
    return or__3548__auto____101499
  }else {
    var or__3548__auto____101501 = function() {
      var ps__101500 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__101500) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__101500), prefer_table))) {
          }else {
          }
          var G__101504 = cljs.core.rest.call(null, ps__101500);
          ps__101500 = G__101504;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____101501)) {
      return or__3548__auto____101501
    }else {
      var or__3548__auto____101503 = function() {
        var ps__101502 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__101502) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__101502), y, prefer_table))) {
            }else {
            }
            var G__101505 = cljs.core.rest.call(null, ps__101502);
            ps__101502 = G__101505;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____101503)) {
        return or__3548__auto____101503
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____101506 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____101506)) {
    return or__3548__auto____101506
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__101515 = cljs.core.reduce.call(null, function(be, p__101507) {
    var vec__101508__101509 = p__101507;
    var k__101510 = cljs.core.nth.call(null, vec__101508__101509, 0, null);
    var ___101511 = cljs.core.nth.call(null, vec__101508__101509, 1, null);
    var e__101512 = vec__101508__101509;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__101510))) {
      var be2__101514 = cljs.core.truth_(function() {
        var or__3548__auto____101513 = be === null;
        if(cljs.core.truth_(or__3548__auto____101513)) {
          return or__3548__auto____101513
        }else {
          return cljs.core.dominates.call(null, k__101510, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__101512 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__101514), k__101510, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__101510, " and ", cljs.core.first.call(null, be2__101514), ", and neither is preferred"));
      }
      return be2__101514
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__101515)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__101515));
      return cljs.core.second.call(null, best_entry__101515)
    }else {
      cljs.core.reset_cache.call(null, method_cache, method_table, cached_hierarchy, hierarchy);
      return find_and_cache_best_method.call(null, name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy)
    }
  }else {
    return null
  }
};
cljs.core.IMultiFn = {};
cljs.core._reset = function _reset(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101516 = mf;
    if(cljs.core.truth_(and__3546__auto____101516)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____101516
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____101517 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101517)) {
        return or__3548__auto____101517
      }else {
        var or__3548__auto____101518 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____101518)) {
          return or__3548__auto____101518
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101519 = mf;
    if(cljs.core.truth_(and__3546__auto____101519)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____101519
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____101520 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101520)) {
        return or__3548__auto____101520
      }else {
        var or__3548__auto____101521 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____101521)) {
          return or__3548__auto____101521
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101522 = mf;
    if(cljs.core.truth_(and__3546__auto____101522)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____101522
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____101523 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101523)) {
        return or__3548__auto____101523
      }else {
        var or__3548__auto____101524 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____101524)) {
          return or__3548__auto____101524
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101525 = mf;
    if(cljs.core.truth_(and__3546__auto____101525)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____101525
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____101526 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101526)) {
        return or__3548__auto____101526
      }else {
        var or__3548__auto____101527 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____101527)) {
          return or__3548__auto____101527
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101528 = mf;
    if(cljs.core.truth_(and__3546__auto____101528)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____101528
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____101529 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101529)) {
        return or__3548__auto____101529
      }else {
        var or__3548__auto____101530 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____101530)) {
          return or__3548__auto____101530
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101531 = mf;
    if(cljs.core.truth_(and__3546__auto____101531)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____101531
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____101532 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101532)) {
        return or__3548__auto____101532
      }else {
        var or__3548__auto____101533 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____101533)) {
          return or__3548__auto____101533
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101534 = mf;
    if(cljs.core.truth_(and__3546__auto____101534)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____101534
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____101535 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101535)) {
        return or__3548__auto____101535
      }else {
        var or__3548__auto____101536 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____101536)) {
          return or__3548__auto____101536
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101537 = mf;
    if(cljs.core.truth_(and__3546__auto____101537)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____101537
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____101538 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____101538)) {
        return or__3548__auto____101538
      }else {
        var or__3548__auto____101539 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____101539)) {
          return or__3548__auto____101539
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__101540 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__101541 = cljs.core._get_method.call(null, mf, dispatch_val__101540);
  if(cljs.core.truth_(target_fn__101541)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__101540));
  }
  return cljs.core.apply.call(null, target_fn__101541, args)
};
cljs.core.MultiFn = function(name, dispatch_fn, default_dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  this.name = name;
  this.dispatch_fn = dispatch_fn;
  this.default_dispatch_val = default_dispatch_val;
  this.hierarchy = hierarchy;
  this.method_table = method_table;
  this.prefer_table = prefer_table;
  this.method_cache = method_cache;
  this.cached_hierarchy = cached_hierarchy
};
cljs.core.MultiFn.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.core.MultiFn")
};
cljs.core.MultiFn.prototype.cljs$core$IHash$ = true;
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash = function(this$) {
  var this__101542 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__101543 = this;
  cljs.core.swap_BANG_.call(null, this__101543.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__101543.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__101543.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__101543.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__101544 = this;
  cljs.core.swap_BANG_.call(null, this__101544.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__101544.method_cache, this__101544.method_table, this__101544.cached_hierarchy, this__101544.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__101545 = this;
  cljs.core.swap_BANG_.call(null, this__101545.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__101545.method_cache, this__101545.method_table, this__101545.cached_hierarchy, this__101545.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__101546 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__101546.cached_hierarchy), cljs.core.deref.call(null, this__101546.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__101546.method_cache, this__101546.method_table, this__101546.cached_hierarchy, this__101546.hierarchy)
  }
  var temp__3695__auto____101547 = cljs.core.deref.call(null, this__101546.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____101547)) {
    var target_fn__101548 = temp__3695__auto____101547;
    return target_fn__101548
  }else {
    var temp__3695__auto____101549 = cljs.core.find_and_cache_best_method.call(null, this__101546.name, dispatch_val, this__101546.hierarchy, this__101546.method_table, this__101546.prefer_table, this__101546.method_cache, this__101546.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____101549)) {
      var target_fn__101550 = temp__3695__auto____101549;
      return target_fn__101550
    }else {
      return cljs.core.deref.call(null, this__101546.method_table).call(null, this__101546.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__101551 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__101551.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__101551.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__101551.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__101551.method_cache, this__101551.method_table, this__101551.cached_hierarchy, this__101551.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__101552 = this;
  return cljs.core.deref.call(null, this__101552.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__101553 = this;
  return cljs.core.deref.call(null, this__101553.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__101554 = this;
  return cljs.core.do_dispatch.call(null, mf, this__101554.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__101555__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__101555 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__101555__delegate.call(this, _, args)
  };
  G__101555.cljs$lang$maxFixedArity = 1;
  G__101555.cljs$lang$applyTo = function(arglist__101556) {
    var _ = cljs.core.first(arglist__101556);
    var args = cljs.core.rest(arglist__101556);
    return G__101555__delegate.call(this, _, args)
  };
  return G__101555
}();
cljs.core.MultiFn.prototype.apply = function(_, args) {
  return cljs.core._dispatch.call(null, this, args)
};
cljs.core.remove_all_methods = function remove_all_methods(multifn) {
  return cljs.core._reset.call(null, multifn)
};
cljs.core.remove_method = function remove_method(multifn, dispatch_val) {
  return cljs.core._remove_method.call(null, multifn, dispatch_val)
};
cljs.core.prefer_method = function prefer_method(multifn, dispatch_val_x, dispatch_val_y) {
  return cljs.core._prefer_method.call(null, multifn, dispatch_val_x, dispatch_val_y)
};
cljs.core.methods$ = function methods$(multifn) {
  return cljs.core._methods.call(null, multifn)
};
cljs.core.get_method = function get_method(multifn, dispatch_val) {
  return cljs.core._get_method.call(null, multifn, dispatch_val)
};
cljs.core.prefers = function prefers(multifn) {
  return cljs.core._prefers.call(null, multifn)
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf("Opera") == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && ua.indexOf("MSIE") != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && ua.indexOf("WebKit") != -1;
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && ua.indexOf("Mobile") != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && navigator.product == "Gecko"
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11")
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /MSIE\s+([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.isVersionCache_[version] || (goog.userAgent.isVersionCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0)
};
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isVersion("9"), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isVersion("9") || goog.userAgent.GECKO && goog.userAgent.isVersion("1.9.1"), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersion("9"), INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", DD:"DD", DEL:"DEL", DFN:"DFN", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", FIELDSET:"FIELDSET", FONT:"FONT", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", 
H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", MAP:"MAP", MENU:"MENU", META:"META", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", P:"P", PARAM:"PARAM", PRE:"PRE", Q:"Q", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SELECT:"SELECT", SMALL:"SMALL", SPAN:"SPAN", STRIKE:"STRIKE", 
STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUP:"SUP", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TITLE:"TITLE", TR:"TR", TT:"TT", U:"U", UL:"UL", VAR:"VAR"};
goog.provide("goog.dom.classes");
goog.require("goog.array");
goog.dom.classes.set = function(element, className) {
  element.className = className
};
goog.dom.classes.get = function(element) {
  var className = element.className;
  return className && typeof className.split == "function" ? className.split(/\s+/) : []
};
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var b = goog.dom.classes.add_(classes, args);
  element.className = classes.join(" ");
  return b
};
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var b = goog.dom.classes.remove_(classes, args);
  element.className = classes.join(" ");
  return b
};
goog.dom.classes.add_ = function(classes, args) {
  var rv = 0;
  for(var i = 0;i < args.length;i++) {
    if(!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
      rv++
    }
  }
  return rv == args.length
};
goog.dom.classes.remove_ = function(classes, args) {
  var rv = 0;
  for(var i = 0;i < classes.length;i++) {
    if(goog.array.contains(args, classes[i])) {
      goog.array.splice(classes, i--, 1);
      rv++
    }
  }
  return rv == args.length
};
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);
  var removed = false;
  for(var i = 0;i < classes.length;i++) {
    if(classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true
    }
  }
  if(removed) {
    classes.push(toClass);
    element.className = classes.join(" ")
  }
  return removed
};
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if(goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove)
  }else {
    if(goog.isArray(classesToRemove)) {
      goog.dom.classes.remove_(classes, classesToRemove)
    }
  }
  if(goog.isString(classesToAdd) && !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd)
  }else {
    if(goog.isArray(classesToAdd)) {
      goog.dom.classes.add_(classes, classesToAdd)
    }
  }
  element.className = classes.join(" ")
};
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className)
};
goog.dom.classes.enable = function(element, className, enabled) {
  if(enabled) {
    goog.dom.classes.add(element, className)
  }else {
    goog.dom.classes.remove(element, className)
  }
};
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add
};
goog.provide("goog.math.Coordinate");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y)
};
if(goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return"(" + this.x + ", " + this.y + ")"
  }
}
goog.math.Coordinate.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.x == b.x && a.y == b.y
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy)
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y)
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y)
};
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height
};
goog.math.Size.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.width == b.width && a.height == b.height
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height)
};
if(goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return"(" + this.width + " x " + this.height + ")"
  }
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height)
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height)
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area()
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s)
};
goog.provide("goog.dom");
goog.provide("goog.dom.DomHelper");
goog.provide("goog.dom.NodeType");
goog.require("goog.array");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classes");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.ASSUME_QUIRKS_MODE = false;
goog.dom.ASSUME_STANDARDS_MODE = false;
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper)
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document
};
goog.dom.getElement = function(element) {
  return goog.isString(element) ? document.getElementById(element) : element
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el)
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if(goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className)
  }else {
    if(parent.getElementsByClassName) {
      return parent.getElementsByClassName(className)
    }
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if(goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector("." + className)
  }else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0]
  }
  return retVal || null
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return parent.querySelectorAll && parent.querySelector && (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) || goog.userAgent.isVersion("528"))
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if(goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query)
  }
  if(opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if(tagName) {
      var arrayLike = {};
      var len = 0;
      for(var i = 0, el;el = els[i];i++) {
        if(tagName == el.nodeName) {
          arrayLike[len++] = el
        }
      }
      arrayLike.length = len;
      return arrayLike
    }else {
      return els
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if(opt_class) {
    var arrayLike = {};
    var len = 0;
    for(var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if(typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el
      }
    }
    arrayLike.length = len;
    return arrayLike
  }else {
    return els
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if(key == "style") {
      element.style.cssText = val
    }else {
      if(key == "class") {
        element.className = val
      }else {
        if(key == "for") {
          element.htmlFor = val
        }else {
          if(key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val)
          }else {
            element[key] = val
          }
        }
      }
    }
  })
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "rowspan":"rowSpan", "valign":"vAlign", "height":"height", "width":"width", "usemap":"useMap", "frameborder":"frameBorder", "maxlength":"maxLength", "type":"type"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window)
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  if(goog.userAgent.WEBKIT && !goog.userAgent.isVersion("500") && !goog.userAgent.MOBILE) {
    if(typeof win.innerHeight == "undefined") {
      win = window
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;
    if(win == win.top) {
      if(scrollHeight < innerHeight) {
        innerHeight -= 15
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight)
  }
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight)
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window)
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if(doc) {
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if(goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight
    }else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if(docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight
      }
      if(sh > vh) {
        height = sh > oh ? sh : oh
      }else {
        height = sh < oh ? sh : oh
      }
    }
  }
  return height
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll()
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document)
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop)
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document)
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  return!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments)
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if(!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes && (attributes.name || attributes.type)) {
    var tagNameArr = ["<", tagName];
    if(attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"')
    }
    if(attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      attributes = clone;
      delete attributes.type
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("")
  }
  var element = doc.createElement(tagName);
  if(attributes) {
    if(goog.isString(attributes)) {
      element.className = attributes
    }else {
      if(goog.isArray(attributes)) {
        goog.dom.classes.add.apply(null, [element].concat(attributes))
      }else {
        goog.dom.setProperties(element, attributes)
      }
    }
  }
  if(args.length > 2) {
    goog.dom.append_(doc, element, args, 2)
  }
  return element
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if(child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child)
    }
  }
  for(var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if(goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.clone(arg) : arg, childHandler)
    }else {
      childHandler(arg)
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name)
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(content)
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ["<tr>"];
  for(var i = 0;i < columns;i++) {
    rowHtml.push(fillWithNbsp ? "<td>&nbsp;</td>" : "<td></td>")
  }
  rowHtml.push("</tr>");
  rowHtml = rowHtml.join("");
  var totalHtml = ["<table>"];
  for(i = 0;i < rows;i++) {
    totalHtml.push(rowHtml)
  }
  totalHtml.push("</table>");
  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join("");
  return elem.removeChild(elem.firstChild)
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString)
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement("div");
  if(goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild)
  }else {
    tempDiv.innerHTML = htmlString
  }
  if(tempDiv.childNodes.length == 1) {
    return tempDiv.removeChild(tempDiv.firstChild)
  }else {
    var fragment = doc.createDocumentFragment();
    while(tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    return fragment
  }
};
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document)
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if(goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE
  }
  return doc.compatMode == "CSS1Compat"
};
goog.dom.canHaveChildren = function(node) {
  if(node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false
  }
  switch(node.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.STYLE:
      return false
  }
  return true
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child)
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1)
};
goog.dom.removeChildren = function(node) {
  var child;
  while(child = node.firstChild) {
    node.removeChild(child)
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode)
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling)
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null)
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if(parent) {
    parent.replaceChild(newNode, oldNode)
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if(parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if(element.removeNode) {
      return element.removeNode(false)
    }else {
      while(child = element.firstChild) {
        parent.insertBefore(child, element)
      }
      return goog.dom.removeNode(element)
    }
  }
};
goog.dom.getChildren = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT
  })
};
goog.dom.getFirstElementChild = function(node) {
  if(node.firstElementChild != undefined) {
    return node.firstElementChild
  }
  return goog.dom.getNextElementNode_(node.firstChild, true)
};
goog.dom.getLastElementChild = function(node) {
  if(node.lastElementChild != undefined) {
    return node.lastElementChild
  }
  return goog.dom.getNextElementNode_(node.lastChild, false)
};
goog.dom.getNextElementSibling = function(node) {
  if(node.nextElementSibling != undefined) {
    return node.nextElementSibling
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true)
};
goog.dom.getPreviousElementSibling = function(node) {
  if(node.previousElementSibling != undefined) {
    return node.previousElementSibling
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false)
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while(node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling
  }
  return node
};
goog.dom.getNextNode = function(node) {
  if(!node) {
    return null
  }
  if(node.firstChild) {
    return node.firstChild
  }
  while(node && !node.nextSibling) {
    node = node.parentNode
  }
  return node ? node.nextSibling : null
};
goog.dom.getPreviousNode = function(node) {
  if(!node) {
    return null
  }
  if(!node.previousSibling) {
    return node.parentNode
  }
  node = node.previousSibling;
  while(node && node.lastChild) {
    node = node.lastChild
  }
  return node
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj
};
goog.dom.contains = function(parent, descendant) {
  if(parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant)
  }
  if(typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16)
  }
  while(descendant && parent != descendant) {
    descendant = descendant.parentNode
  }
  return descendant == parent
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if(node1 == node2) {
    return 0
  }
  if(node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1
  }
  if("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if(isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex
    }else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if(parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2)
      }
      if(!isElement1 && goog.dom.contains(parent1, node2)) {
        return-1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2)
      }
      if(!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1)
      }
      return(isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex)
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2)
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if(parent == node) {
    return-1
  }
  var sibling = node;
  while(sibling.parentNode != parent) {
    sibling = sibling.parentNode
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode)
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while(s = s.previousSibling) {
    if(s == node1) {
      return-1
    }
  }
  return 1
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if(!count) {
    return null
  }else {
    if(count == 1) {
      return arguments[0]
    }
  }
  var paths = [];
  var minLength = Infinity;
  for(i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while(node) {
      ancestors.unshift(node);
      node = node.parentNode
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length)
  }
  var output = null;
  for(i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for(var j = 1;j < count;j++) {
      if(first != paths[j][i]) {
        return output
      }
    }
    output = first
  }
  return output
};
goog.dom.getOwnerDocument = function(node) {
  return node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document
};
goog.dom.getFrameContentDocument = function(frame) {
  var doc;
  if(goog.userAgent.WEBKIT) {
    doc = frame.document || frame.contentWindow.document
  }else {
    doc = frame.contentDocument || frame.contentWindow.document
  }
  return doc
};
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow || goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame))
};
goog.dom.setTextContent = function(element, text) {
  if("textContent" in element) {
    element.textContent = text
  }else {
    if(element.firstChild && element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
      while(element.lastChild != element.firstChild) {
        element.removeChild(element.lastChild)
      }
      element.firstChild.data = text
    }else {
      goog.dom.removeChildren(element);
      var doc = goog.dom.getOwnerDocument(element);
      element.appendChild(doc.createTextNode(text))
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  if("outerHTML" in element) {
    return element.outerHTML
  }else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement("div");
    div.appendChild(element.cloneNode(true));
    return div.innerHTML
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if(root != null) {
    for(var i = 0, child;child = root.childNodes[i];i++) {
      if(p(child)) {
        rv.push(child);
        if(findOne) {
          return true
        }
      }
      if(goog.dom.findNodes_(child, p, rv, findOne)) {
        return true
      }
    }
  }
  return false
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  if(attrNode && attrNode.specified) {
    var index = element.tabIndex;
    return goog.isNumber(index) && index >= 0
  }
  return false
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if(enable) {
    element.tabIndex = 0
  }else {
    element.removeAttribute("tabIndex")
  }
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText)
  }else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("")
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if(!goog.userAgent.IE) {
    textContent = textContent.replace(/ +/g, " ")
  }
  if(textContent != " ") {
    textContent = textContent.replace(/^\s*/, "")
  }
  return textContent
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("")
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if(node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  }else {
    if(node.nodeType == goog.dom.NodeType.TEXT) {
      if(normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""))
      }else {
        buf.push(node.nodeValue)
      }
    }else {
      if(node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName])
      }else {
        var child = node.firstChild;
        while(child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while(node && node != root) {
    var cur = node;
    while(cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur))
    }
    node = node.parentNode
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur;
  while(stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if(cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    }else {
      if(cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length
      }else {
        if(cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length
        }else {
          for(var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i])
          }
        }
      }
    }
  }
  if(goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur
  }
  return cur
};
goog.dom.isNodeList = function(val) {
  if(val && typeof val.length == "number") {
    if(goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string"
    }else {
      if(goog.isFunction(val)) {
        return typeof val.item == "function"
      }
    }
  }
  return false
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return goog.dom.getAncestor(element, function(node) {
    return(!tagName || node.nodeName == tagName) && (!opt_class || goog.dom.classes.has(node, opt_class))
  }, true)
};
goog.dom.getAncestorByClass = function(element, opt_class) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, opt_class)
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if(!opt_includeNode) {
    element = element.parentNode
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while(element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if(matcher(element)) {
      return element
    }
    element = element.parentNode;
    steps++
  }
  return null
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || goog.global.document || document
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  if(goog.isString(element)) {
    return this.document_.getElementById(element)
  }else {
    return element
  }
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el)
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc)
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc)
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow())
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow())
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments)
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name)
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content)
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString)
};
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_)
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_)
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
goog.provide("clojure.string");
goog.require("cljs.core");
goog.require("goog.string");
goog.require("goog.string.StringBuffer");
clojure.string.seq_reverse = function seq_reverse(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
};
clojure.string.reverse = function reverse(s) {
  return s.split("").reverse().join("")
};
clojure.string.replace = function replace(s, match, replacement) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, match))) {
    return s.replace(new RegExp(goog.string.regExpEscape.call(null, match), "g"), replacement)
  }else {
    if(cljs.core.truth_(match.hasOwnProperty("source"))) {
      return s.replace(new RegExp(match.source, "g"), replacement)
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw cljs.core.str.call(null, "Invalid match arg: ", match);
      }else {
        return null
      }
    }
  }
};
clojure.string.replace_first = function replace_first(s, match, replacement) {
  return s.replace(match, replacement)
};
clojure.string.join = function() {
  var join = null;
  var join__101557 = function(coll) {
    return cljs.core.apply.call(null, cljs.core.str, coll)
  };
  var join__101558 = function(separator, coll) {
    return cljs.core.apply.call(null, cljs.core.str, cljs.core.interpose.call(null, separator, coll))
  };
  join = function(separator, coll) {
    switch(arguments.length) {
      case 1:
        return join__101557.call(this, separator);
      case 2:
        return join__101558.call(this, separator, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return join
}();
clojure.string.upper_case = function upper_case(s) {
  return s.toUpperCase()
};
clojure.string.lower_case = function lower_case(s) {
  return s.toLowerCase()
};
clojure.string.capitalize = function capitalize(s) {
  if(cljs.core.truth_(cljs.core.count.call(null, s) < 2)) {
    return clojure.string.upper_case.call(null, s)
  }else {
    return cljs.core.str.call(null, clojure.string.upper_case.call(null, cljs.core.subs.call(null, s, 0, 1)), clojure.string.lower_case.call(null, cljs.core.subs.call(null, s, 1)))
  }
};
clojure.string.split = function() {
  var split = null;
  var split__101566 = function(s, re) {
    return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
  };
  var split__101567 = function(s, re, limit) {
    if(cljs.core.truth_(limit < 1)) {
      return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
    }else {
      var s__101560 = s;
      var limit__101561 = limit;
      var parts__101562 = cljs.core.PersistentVector.fromArray([]);
      while(true) {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, limit__101561, 1))) {
          return cljs.core.conj.call(null, parts__101562, s__101560)
        }else {
          var temp__3695__auto____101563 = cljs.core.re_find.call(null, re, s__101560);
          if(cljs.core.truth_(temp__3695__auto____101563)) {
            var m__101564 = temp__3695__auto____101563;
            var index__101565 = s__101560.indexOf(m__101564);
            var G__101569 = s__101560.substring(index__101565 + cljs.core.count.call(null, m__101564));
            var G__101570 = limit__101561 - 1;
            var G__101571 = cljs.core.conj.call(null, parts__101562, s__101560.substring(0, index__101565));
            s__101560 = G__101569;
            limit__101561 = G__101570;
            parts__101562 = G__101571;
            continue
          }else {
            return cljs.core.conj.call(null, parts__101562, s__101560)
          }
        }
        break
      }
    }
  };
  split = function(s, re, limit) {
    switch(arguments.length) {
      case 2:
        return split__101566.call(this, s, re);
      case 3:
        return split__101567.call(this, s, re, limit)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return split
}();
clojure.string.split_lines = function split_lines(s) {
  return clojure.string.split.call(null, s, /\n|\r\n/)
};
clojure.string.trim = function trim(s) {
  return goog.string.trim.call(null, s)
};
clojure.string.triml = function triml(s) {
  return goog.string.trimLeft.call(null, s)
};
clojure.string.trimr = function trimr(s) {
  return goog.string.trimRight.call(null, s)
};
clojure.string.trim_newline = function trim_newline(s) {
  var index__101572 = s.length;
  while(true) {
    if(cljs.core.truth_(index__101572 === 0)) {
      return""
    }else {
      var ch__101573 = cljs.core.get.call(null, s, index__101572 - 1);
      if(cljs.core.truth_(function() {
        var or__3548__auto____101574 = cljs.core._EQ_.call(null, ch__101573, "\n");
        if(cljs.core.truth_(or__3548__auto____101574)) {
          return or__3548__auto____101574
        }else {
          return cljs.core._EQ_.call(null, ch__101573, "\r")
        }
      }())) {
        var G__101575 = index__101572 - 1;
        index__101572 = G__101575;
        continue
      }else {
        return s.substring(0, index__101572)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__101576 = cljs.core.str.call(null, s);
  if(cljs.core.truth_(function() {
    var or__3548__auto____101577 = cljs.core.not.call(null, s__101576);
    if(cljs.core.truth_(or__3548__auto____101577)) {
      return or__3548__auto____101577
    }else {
      var or__3548__auto____101578 = cljs.core._EQ_.call(null, "", s__101576);
      if(cljs.core.truth_(or__3548__auto____101578)) {
        return or__3548__auto____101578
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__101576)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__101579 = new goog.string.StringBuffer;
  var length__101580 = s.length;
  var index__101581 = 0;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, length__101580, index__101581))) {
      return buffer__101579.toString()
    }else {
      var ch__101582 = s.charAt(index__101581);
      var temp__3695__auto____101583 = cljs.core.get.call(null, cmap, ch__101582);
      if(cljs.core.truth_(temp__3695__auto____101583)) {
        var replacement__101584 = temp__3695__auto____101583;
        buffer__101579.append(cljs.core.str.call(null, replacement__101584))
      }else {
        buffer__101579.append(ch__101582)
      }
      var G__101585 = index__101581 + 1;
      index__101581 = G__101585;
      continue
    }
    break
  }
};
goog.provide("crate.core");
goog.require("cljs.core");
goog.require("goog.dom");
goog.require("clojure.string");
crate.core.xmlns = cljs.core.ObjMap.fromObject(["\ufdd0'xhtml", "\ufdd0'svg"], {"\ufdd0'xhtml":"http://www.w3.org/1999/xhtml", "\ufdd0'svg":"http://www.w3.org/2000/svg"});
crate.core.group_id = cljs.core.atom.call(null, 0);
crate.core.dom_attr = function() {
  var dom_attr = null;
  var dom_attr__101850 = function(elem, attrs) {
    if(cljs.core.truth_(elem)) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.map_QMARK_.call(null, attrs)))) {
        return elem.getAttribute(cljs.core.name.call(null, attrs))
      }else {
        var G__101831__101832 = cljs.core.seq.call(null, attrs);
        if(cljs.core.truth_(G__101831__101832)) {
          var G__101834__101836 = cljs.core.first.call(null, G__101831__101832);
          var vec__101835__101837 = G__101834__101836;
          var k__101838 = cljs.core.nth.call(null, vec__101835__101837, 0, null);
          var v__101839 = cljs.core.nth.call(null, vec__101835__101837, 1, null);
          var G__101831__101840 = G__101831__101832;
          var G__101834__101841 = G__101834__101836;
          var G__101831__101842 = G__101831__101840;
          while(true) {
            var vec__101843__101844 = G__101834__101841;
            var k__101845 = cljs.core.nth.call(null, vec__101843__101844, 0, null);
            var v__101846 = cljs.core.nth.call(null, vec__101843__101844, 1, null);
            var G__101831__101847 = G__101831__101842;
            dom_attr.call(null, elem, k__101845, v__101846);
            var temp__3698__auto____101848 = cljs.core.next.call(null, G__101831__101847);
            if(cljs.core.truth_(temp__3698__auto____101848)) {
              var G__101831__101849 = temp__3698__auto____101848;
              var G__101853 = cljs.core.first.call(null, G__101831__101849);
              var G__101854 = G__101831__101849;
              G__101834__101841 = G__101853;
              G__101831__101842 = G__101854;
              continue
            }else {
            }
            break
          }
        }else {
        }
        return elem
      }
    }else {
      return null
    }
  };
  var dom_attr__101851 = function(elem, k, v) {
    elem.setAttribute(cljs.core.name.call(null, k), v);
    return elem
  };
  dom_attr = function(elem, k, v) {
    switch(arguments.length) {
      case 2:
        return dom_attr__101850.call(this, elem, k);
      case 3:
        return dom_attr__101851.call(this, elem, k, v)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dom_attr
}();
crate.core.as_content = function as_content(parent, content) {
  var G__101855__101856 = cljs.core.seq.call(null, content);
  if(cljs.core.truth_(G__101855__101856)) {
    var c__101857 = cljs.core.first.call(null, G__101855__101856);
    var G__101855__101858 = G__101855__101856;
    while(true) {
      var child__101859 = cljs.core.truth_(c__101857 === null) ? null : cljs.core.truth_(cljs.core.map_QMARK_.call(null, c__101857)) ? function() {
        throw"Maps cannot be used as content";
      }() : cljs.core.truth_(cljs.core.string_QMARK_.call(null, c__101857)) ? goog.dom.createTextNode.call(null, c__101857) : cljs.core.truth_(cljs.core.vector_QMARK_.call(null, c__101857)) ? crate.core.elem_factory.call(null, c__101857) : cljs.core.truth_(cljs.core.seq_QMARK_.call(null, c__101857)) ? as_content.call(null, parent, c__101857) : cljs.core.truth_(c__101857.nodeName) ? c__101857 : null;
      if(cljs.core.truth_(child__101859)) {
        goog.dom.appendChild.call(null, parent, child__101859)
      }else {
      }
      var temp__3698__auto____101860 = cljs.core.next.call(null, G__101855__101858);
      if(cljs.core.truth_(temp__3698__auto____101860)) {
        var G__101855__101861 = temp__3698__auto____101860;
        var G__101862 = cljs.core.first.call(null, G__101855__101861);
        var G__101863 = G__101855__101861;
        c__101857 = G__101862;
        G__101855__101858 = G__101863;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
crate.core.re_tag = /([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/;
crate.core.normalize_element = function normalize_element(p__101865) {
  var vec__101866__101867 = p__101865;
  var tag__101868 = cljs.core.nth.call(null, vec__101866__101867, 0, null);
  var content__101869 = cljs.core.nthnext.call(null, vec__101866__101867, 1);
  if(cljs.core.truth_(cljs.core.not.call(null, function() {
    var or__3548__auto____101870 = cljs.core.keyword_QMARK_.call(null, tag__101868);
    if(cljs.core.truth_(or__3548__auto____101870)) {
      return or__3548__auto____101870
    }else {
      var or__3548__auto____101871 = cljs.core.symbol_QMARK_.call(null, tag__101868);
      if(cljs.core.truth_(or__3548__auto____101871)) {
        return or__3548__auto____101871
      }else {
        return cljs.core.string_QMARK_.call(null, tag__101868)
      }
    }
  }()))) {
    throw cljs.core.str.call(null, tag__101868, " is not a valid tag name.");
  }else {
  }
  var vec__101872__101874 = cljs.core.re_matches.call(null, crate.core.re_tag, cljs.core.name.call(null, tag__101868));
  var ___101875 = cljs.core.nth.call(null, vec__101872__101874, 0, null);
  var tag__101876 = cljs.core.nth.call(null, vec__101872__101874, 1, null);
  var id__101877 = cljs.core.nth.call(null, vec__101872__101874, 2, null);
  var class$__101878 = cljs.core.nth.call(null, vec__101872__101874, 3, null);
  var vec__101873__101885 = function() {
    var vec__101879__101880 = clojure.string.split.call(null, tag__101876, /:/);
    var nsp__101881 = cljs.core.nth.call(null, vec__101879__101880, 0, null);
    var t__101882 = cljs.core.nth.call(null, vec__101879__101880, 1, null);
    var ns_xmlns__101883 = crate.core.xmlns.call(null, cljs.core.keyword.call(null, nsp__101881));
    if(cljs.core.truth_(t__101882)) {
      return cljs.core.PersistentVector.fromArray([function() {
        var or__3548__auto____101884 = ns_xmlns__101883;
        if(cljs.core.truth_(or__3548__auto____101884)) {
          return or__3548__auto____101884
        }else {
          return nsp__101881
        }
      }(), t__101882])
    }else {
      return cljs.core.PersistentVector.fromArray(["\ufdd0'xhtml".call(null, crate.core.xmlns), nsp__101881])
    }
  }();
  var nsp__101886 = cljs.core.nth.call(null, vec__101873__101885, 0, null);
  var tag__101887 = cljs.core.nth.call(null, vec__101873__101885, 1, null);
  var tag_attrs__101889 = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.filter.call(null, function(p1__101864_SHARP_) {
    return cljs.core.not.call(null, cljs.core.second.call(null, p1__101864_SHARP_) === null)
  }, cljs.core.ObjMap.fromObject(["\ufdd0'id", "\ufdd0'class"], {"\ufdd0'id":function() {
    var or__3548__auto____101888 = id__101877;
    if(cljs.core.truth_(or__3548__auto____101888)) {
      return or__3548__auto____101888
    }else {
      return null
    }
  }(), "\ufdd0'class":cljs.core.truth_(class$__101878) ? clojure.string.replace.call(null, class$__101878, /\./, " ") : null})));
  var map_attrs__101890 = cljs.core.first.call(null, content__101869);
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, map_attrs__101890))) {
    return cljs.core.PersistentVector.fromArray([nsp__101886, tag__101887, cljs.core.merge.call(null, tag_attrs__101889, map_attrs__101890), cljs.core.next.call(null, content__101869)])
  }else {
    return cljs.core.PersistentVector.fromArray([nsp__101886, tag__101887, tag_attrs__101889, content__101869])
  }
};
crate.core.parse_content = function parse_content(elem, content) {
  var attrs__101891 = cljs.core.first.call(null, content);
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, attrs__101891))) {
    crate.core.dom_attr.call(null, elem, attrs__101891);
    return cljs.core.rest.call(null, content)
  }else {
    return content
  }
};
crate.core.create_elem = cljs.core.truth_(document.createElementNS) ? function(nsp, tag) {
  return document.createElementNS(nsp, tag)
} : function(_, tag) {
  return document.createElement(tag)
};
crate.core.elem_factory = function elem_factory(tag_def) {
  var vec__101892__101893 = crate.core.normalize_element.call(null, tag_def);
  var nsp__101894 = cljs.core.nth.call(null, vec__101892__101893, 0, null);
  var tag__101895 = cljs.core.nth.call(null, vec__101892__101893, 1, null);
  var attrs__101896 = cljs.core.nth.call(null, vec__101892__101893, 2, null);
  var content__101897 = cljs.core.nth.call(null, vec__101892__101893, 3, null);
  var elem__101898 = crate.core.create_elem.call(null, nsp__101894, tag__101895);
  crate.core.dom_attr.call(null, elem__101898, attrs__101896);
  crate.core.as_content.call(null, elem__101898, content__101897);
  return elem__101898
};
crate.core.html = function() {
  var html__delegate = function(tags) {
    var res__101899 = cljs.core.map.call(null, crate.core.elem_factory, tags);
    if(cljs.core.truth_(cljs.core.second.call(null, res__101899))) {
      return res__101899
    }else {
      return cljs.core.first.call(null, res__101899)
    }
  };
  var html = function(var_args) {
    var tags = null;
    if(goog.isDef(var_args)) {
      tags = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return html__delegate.call(this, tags)
  };
  html.cljs$lang$maxFixedArity = 0;
  html.cljs$lang$applyTo = function(arglist__101900) {
    var tags = cljs.core.seq(arglist__101900);
    return html__delegate.call(this, tags)
  };
  return html
}();
goog.provide("jayq.util");
goog.require("cljs.core");
jayq.util.map__GT_js = function map__GT_js(m) {
  var out__102004 = cljs.core.js_obj.call(null);
  var G__102005__102006 = cljs.core.seq.call(null, m);
  if(cljs.core.truth_(G__102005__102006)) {
    var G__102008__102010 = cljs.core.first.call(null, G__102005__102006);
    var vec__102009__102011 = G__102008__102010;
    var k__102012 = cljs.core.nth.call(null, vec__102009__102011, 0, null);
    var v__102013 = cljs.core.nth.call(null, vec__102009__102011, 1, null);
    var G__102005__102014 = G__102005__102006;
    var G__102008__102015 = G__102008__102010;
    var G__102005__102016 = G__102005__102014;
    while(true) {
      var vec__102017__102018 = G__102008__102015;
      var k__102019 = cljs.core.nth.call(null, vec__102017__102018, 0, null);
      var v__102020 = cljs.core.nth.call(null, vec__102017__102018, 1, null);
      var G__102005__102021 = G__102005__102016;
      out__102004[cljs.core.name.call(null, k__102019)] = v__102020;
      var temp__3698__auto____102022 = cljs.core.next.call(null, G__102005__102021);
      if(cljs.core.truth_(temp__3698__auto____102022)) {
        var G__102005__102023 = temp__3698__auto____102022;
        var G__102024 = cljs.core.first.call(null, G__102005__102023);
        var G__102025 = G__102005__102023;
        G__102008__102015 = G__102024;
        G__102005__102016 = G__102025;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return out__102004
};
jayq.util.wait = function wait(ms, func) {
  return setTimeout(func, ms)
};
jayq.util.log = function() {
  var log__delegate = function(v, text) {
    var vs__102026 = cljs.core.truth_(cljs.core.string_QMARK_.call(null, v)) ? cljs.core.apply.call(null, cljs.core.str, v, text) : v;
    return console.log(vs__102026)
  };
  var log = function(v, var_args) {
    var text = null;
    if(goog.isDef(var_args)) {
      text = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return log__delegate.call(this, v, text)
  };
  log.cljs$lang$maxFixedArity = 1;
  log.cljs$lang$applyTo = function(arglist__102027) {
    var v = cljs.core.first(arglist__102027);
    var text = cljs.core.rest(arglist__102027);
    return log__delegate.call(this, v, text)
  };
  return log
}();
jayq.util.clj__GT_js = function clj__GT_js(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, x))) {
      return cljs.core.name.call(null, x)
    }else {
      if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, x))) {
        return cljs.core.reduce.call(null, function(m, p__102028) {
          var vec__102029__102030 = p__102028;
          var k__102031 = cljs.core.nth.call(null, vec__102029__102030, 0, null);
          var v__102032 = cljs.core.nth.call(null, vec__102029__102030, 1, null);
          return cljs.core.assoc.call(null, m, clj__GT_js.call(null, k__102031), clj__GT_js.call(null, v__102032))
        }, cljs.core.ObjMap.fromObject([], {}), x).strobj
      }else {
        if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null, x))) {
          return cljs.core.apply.call(null, cljs.core.array, cljs.core.map.call(null, clj__GT_js, x))
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            return x
          }else {
            return null
          }
        }
      }
    }
  }
};
goog.provide("jayq.core");
goog.require("cljs.core");
goog.require("jayq.util");
goog.require("clojure.string");
jayq.core.crate_meta = function crate_meta(func) {
  return func.prototype._crateGroup
};
jayq.core.__GT_selector = function __GT_selector(sel) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, sel))) {
    return sel
  }else {
    if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, sel))) {
      var temp__3695__auto____101901 = jayq.core.crate_meta.call(null, sel);
      if(cljs.core.truth_(temp__3695__auto____101901)) {
        var cm__101902 = temp__3695__auto____101901;
        return cljs.core.str.call(null, "[crateGroup=", cm__101902, "]")
      }else {
        return sel
      }
    }else {
      if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, sel))) {
        return cljs.core.name.call(null, sel)
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          return sel
        }else {
          return null
        }
      }
    }
  }
};
jayq.core.$ = function() {
  var $__delegate = function(sel, p__101903) {
    var vec__101904__101905 = p__101903;
    var context__101906 = cljs.core.nth.call(null, vec__101904__101905, 0, null);
    if(cljs.core.truth_(cljs.core.not.call(null, context__101906))) {
      return jQuery.call(null, jayq.core.__GT_selector.call(null, sel))
    }else {
      return jQuery.call(null, jayq.core.__GT_selector.call(null, sel), context__101906)
    }
  };
  var $ = function(sel, var_args) {
    var p__101903 = null;
    if(goog.isDef(var_args)) {
      p__101903 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return $__delegate.call(this, sel, p__101903)
  };
  $.cljs$lang$maxFixedArity = 1;
  $.cljs$lang$applyTo = function(arglist__101907) {
    var sel = cljs.core.first(arglist__101907);
    var p__101903 = cljs.core.rest(arglist__101907);
    return $__delegate.call(this, sel, p__101903)
  };
  return $
}();
jQuery.prototype.cljs$core$IReduce$ = true;
jQuery.prototype.cljs$core$IReduce$_reduce = function(this$, f) {
  return cljs.core.ci_reduce.call(null, jayq.core.coll, f, cljs.core.first.call(null, this$), cljs.core.count.call(null, this$))
};
jQuery.prototype.cljs$core$IReduce$_reduce = function(this$, f, start) {
  return cljs.core.ci_reduce.call(null, jayq.core.coll, f, start, jayq.core.i)
};
jQuery.prototype.cljs$core$ILookup$ = true;
jQuery.prototype.cljs$core$ILookup$_lookup = function() {
  var G__101909 = null;
  var G__101909__101910 = function(this$, k) {
    var or__3548__auto____101908 = this$.slice(k, k + 1);
    if(cljs.core.truth_(or__3548__auto____101908)) {
      return or__3548__auto____101908
    }else {
      return null
    }
  };
  var G__101909__101911 = function(this$, k, not_found) {
    return cljs.core._nth.call(null, this$, k, not_found)
  };
  G__101909 = function(this$, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101909__101910.call(this, this$, k);
      case 3:
        return G__101909__101911.call(this, this$, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101909
}();
jQuery.prototype.cljs$core$ISequential$ = true;
jQuery.prototype.cljs$core$IIndexed$ = true;
jQuery.prototype.cljs$core$IIndexed$_nth = function(this$, n) {
  if(cljs.core.truth_(n < cljs.core.count.call(null, this$))) {
    return this$.slice(n, n + 1)
  }else {
    return null
  }
};
jQuery.prototype.cljs$core$IIndexed$_nth = function(this$, n, not_found) {
  if(cljs.core.truth_(n < cljs.core.count.call(null, this$))) {
    return this$.slice(n, n + 1)
  }else {
    if(cljs.core.truth_(void 0 === not_found)) {
      return null
    }else {
      return not_found
    }
  }
};
jQuery.prototype.cljs$core$ICounted$ = true;
jQuery.prototype.cljs$core$ICounted$_count = function(this$) {
  return this$.size()
};
jQuery.prototype.cljs$core$ISeq$ = true;
jQuery.prototype.cljs$core$ISeq$_first = function(this$) {
  return this$.get(0)
};
jQuery.prototype.cljs$core$ISeq$_rest = function(this$) {
  if(cljs.core.truth_(cljs.core.count.call(null, this$) > 1)) {
    return this$.slice(1)
  }else {
    return cljs.core.list.call(null)
  }
};
jQuery.prototype.cljs$core$ISeqable$ = true;
jQuery.prototype.cljs$core$ISeqable$_seq = function(this$) {
  if(cljs.core.truth_(this$.get(0))) {
    return this$
  }else {
    return null
  }
};
jQuery.prototype.call = function() {
  var G__101913 = null;
  var G__101913__101914 = function(_, k) {
    return cljs.core._lookup.call(null, this, k)
  };
  var G__101913__101915 = function(_, k, not_found) {
    return cljs.core._lookup.call(null, this, k, not_found)
  };
  G__101913 = function(_, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__101913__101914.call(this, _, k);
      case 3:
        return G__101913__101915.call(this, _, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101913
}();
jayq.core.anim = function anim(elem, props, dur) {
  return elem.animate(jayq.util.clj__GT_js.call(null, props), dur)
};
jayq.core.text = function text($elem, txt) {
  return $elem.text(txt)
};
jayq.core.css = function css($elem, opts) {
  if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, opts))) {
    return $elem.css(cljs.core.name.call(null, opts))
  }else {
    return $elem.css(jayq.util.clj__GT_js.call(null, opts))
  }
};
jayq.core.attr = function() {
  var attr__delegate = function($elem, a, p__101917) {
    var vec__101918__101919 = p__101917;
    var v__101920 = cljs.core.nth.call(null, vec__101918__101919, 0, null);
    var a__101921 = cljs.core.name.call(null, a);
    if(cljs.core.truth_(cljs.core.not.call(null, v__101920))) {
      return $elem.attr(a__101921)
    }else {
      return $elem.attr(a__101921, v__101920)
    }
  };
  var attr = function($elem, a, var_args) {
    var p__101917 = null;
    if(goog.isDef(var_args)) {
      p__101917 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return attr__delegate.call(this, $elem, a, p__101917)
  };
  attr.cljs$lang$maxFixedArity = 2;
  attr.cljs$lang$applyTo = function(arglist__101922) {
    var $elem = cljs.core.first(arglist__101922);
    var a = cljs.core.first(cljs.core.next(arglist__101922));
    var p__101917 = cljs.core.rest(cljs.core.next(arglist__101922));
    return attr__delegate.call(this, $elem, a, p__101917)
  };
  return attr
}();
jayq.core.data = function() {
  var data__delegate = function($elem, k, p__101923) {
    var vec__101924__101925 = p__101923;
    var v__101926 = cljs.core.nth.call(null, vec__101924__101925, 0, null);
    var k__101927 = cljs.core.name.call(null, k);
    if(cljs.core.truth_(cljs.core.not.call(null, v__101926))) {
      return $elem.data(k__101927)
    }else {
      return $elem.data(k__101927, v__101926)
    }
  };
  var data = function($elem, k, var_args) {
    var p__101923 = null;
    if(goog.isDef(var_args)) {
      p__101923 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return data__delegate.call(this, $elem, k, p__101923)
  };
  data.cljs$lang$maxFixedArity = 2;
  data.cljs$lang$applyTo = function(arglist__101928) {
    var $elem = cljs.core.first(arglist__101928);
    var k = cljs.core.first(cljs.core.next(arglist__101928));
    var p__101923 = cljs.core.rest(cljs.core.next(arglist__101928));
    return data__delegate.call(this, $elem, k, p__101923)
  };
  return data
}();
jayq.core.position = function position($elem) {
  return cljs.core.js__GT_clj.call(null, $elem.position(), "\ufdd0'keywordize-keys", true)
};
jayq.core.add_class = function add_class($elem, cl) {
  var cl__101929 = cljs.core.name.call(null, cl);
  return $elem.addClass(cl__101929)
};
jayq.core.remove_class = function remove_class($elem, cl) {
  var cl__101930 = cljs.core.name.call(null, cl);
  return $elem.removeClass(cl__101930)
};
jayq.core.append = function append($elem, content) {
  return $elem.append(content)
};
jayq.core.prepend = function prepend($elem, content) {
  return $elem.prepend(content)
};
jayq.core.remove = function remove($elem) {
  return $elem.remove()
};
jayq.core.hide = function() {
  var hide__delegate = function($elem, p__101931) {
    var vec__101932__101933 = p__101931;
    var speed__101934 = cljs.core.nth.call(null, vec__101932__101933, 0, null);
    var on_finish__101935 = cljs.core.nth.call(null, vec__101932__101933, 1, null);
    return $elem.hide(speed__101934, on_finish__101935)
  };
  var hide = function($elem, var_args) {
    var p__101931 = null;
    if(goog.isDef(var_args)) {
      p__101931 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return hide__delegate.call(this, $elem, p__101931)
  };
  hide.cljs$lang$maxFixedArity = 1;
  hide.cljs$lang$applyTo = function(arglist__101936) {
    var $elem = cljs.core.first(arglist__101936);
    var p__101931 = cljs.core.rest(arglist__101936);
    return hide__delegate.call(this, $elem, p__101931)
  };
  return hide
}();
jayq.core.show = function() {
  var show__delegate = function($elem, p__101937) {
    var vec__101938__101939 = p__101937;
    var speed__101940 = cljs.core.nth.call(null, vec__101938__101939, 0, null);
    var on_finish__101941 = cljs.core.nth.call(null, vec__101938__101939, 1, null);
    return $elem.show(speed__101940, on_finish__101941)
  };
  var show = function($elem, var_args) {
    var p__101937 = null;
    if(goog.isDef(var_args)) {
      p__101937 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return show__delegate.call(this, $elem, p__101937)
  };
  show.cljs$lang$maxFixedArity = 1;
  show.cljs$lang$applyTo = function(arglist__101942) {
    var $elem = cljs.core.first(arglist__101942);
    var p__101937 = cljs.core.rest(arglist__101942);
    return show__delegate.call(this, $elem, p__101937)
  };
  return show
}();
jayq.core.toggle = function() {
  var toggle__delegate = function($elem, p__101943) {
    var vec__101944__101945 = p__101943;
    var speed__101946 = cljs.core.nth.call(null, vec__101944__101945, 0, null);
    var on_finish__101947 = cljs.core.nth.call(null, vec__101944__101945, 1, null);
    return $elem.toggle(speed__101946, on_finish__101947)
  };
  var toggle = function($elem, var_args) {
    var p__101943 = null;
    if(goog.isDef(var_args)) {
      p__101943 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return toggle__delegate.call(this, $elem, p__101943)
  };
  toggle.cljs$lang$maxFixedArity = 1;
  toggle.cljs$lang$applyTo = function(arglist__101948) {
    var $elem = cljs.core.first(arglist__101948);
    var p__101943 = cljs.core.rest(arglist__101948);
    return toggle__delegate.call(this, $elem, p__101943)
  };
  return toggle
}();
jayq.core.fade_out = function() {
  var fade_out__delegate = function($elem, p__101949) {
    var vec__101950__101951 = p__101949;
    var speed__101952 = cljs.core.nth.call(null, vec__101950__101951, 0, null);
    var on_finish__101953 = cljs.core.nth.call(null, vec__101950__101951, 1, null);
    return $elem.fadeOut(speed__101952, on_finish__101953)
  };
  var fade_out = function($elem, var_args) {
    var p__101949 = null;
    if(goog.isDef(var_args)) {
      p__101949 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return fade_out__delegate.call(this, $elem, p__101949)
  };
  fade_out.cljs$lang$maxFixedArity = 1;
  fade_out.cljs$lang$applyTo = function(arglist__101954) {
    var $elem = cljs.core.first(arglist__101954);
    var p__101949 = cljs.core.rest(arglist__101954);
    return fade_out__delegate.call(this, $elem, p__101949)
  };
  return fade_out
}();
jayq.core.fade_in = function() {
  var fade_in__delegate = function($elem, p__101955) {
    var vec__101956__101957 = p__101955;
    var speed__101958 = cljs.core.nth.call(null, vec__101956__101957, 0, null);
    var on_finish__101959 = cljs.core.nth.call(null, vec__101956__101957, 1, null);
    return $elem.fadeIn(speed__101958, on_finish__101959)
  };
  var fade_in = function($elem, var_args) {
    var p__101955 = null;
    if(goog.isDef(var_args)) {
      p__101955 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return fade_in__delegate.call(this, $elem, p__101955)
  };
  fade_in.cljs$lang$maxFixedArity = 1;
  fade_in.cljs$lang$applyTo = function(arglist__101960) {
    var $elem = cljs.core.first(arglist__101960);
    var p__101955 = cljs.core.rest(arglist__101960);
    return fade_in__delegate.call(this, $elem, p__101955)
  };
  return fade_in
}();
jayq.core.slide_up = function() {
  var slide_up__delegate = function($elem, p__101961) {
    var vec__101962__101963 = p__101961;
    var speed__101964 = cljs.core.nth.call(null, vec__101962__101963, 0, null);
    var on_finish__101965 = cljs.core.nth.call(null, vec__101962__101963, 1, null);
    return $elem.slideUp(speed__101964, on_finish__101965)
  };
  var slide_up = function($elem, var_args) {
    var p__101961 = null;
    if(goog.isDef(var_args)) {
      p__101961 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return slide_up__delegate.call(this, $elem, p__101961)
  };
  slide_up.cljs$lang$maxFixedArity = 1;
  slide_up.cljs$lang$applyTo = function(arglist__101966) {
    var $elem = cljs.core.first(arglist__101966);
    var p__101961 = cljs.core.rest(arglist__101966);
    return slide_up__delegate.call(this, $elem, p__101961)
  };
  return slide_up
}();
jayq.core.slide_down = function() {
  var slide_down__delegate = function($elem, p__101967) {
    var vec__101968__101969 = p__101967;
    var speed__101970 = cljs.core.nth.call(null, vec__101968__101969, 0, null);
    var on_finish__101971 = cljs.core.nth.call(null, vec__101968__101969, 1, null);
    return $elem.slideDown(speed__101970, on_finish__101971)
  };
  var slide_down = function($elem, var_args) {
    var p__101967 = null;
    if(goog.isDef(var_args)) {
      p__101967 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return slide_down__delegate.call(this, $elem, p__101967)
  };
  slide_down.cljs$lang$maxFixedArity = 1;
  slide_down.cljs$lang$applyTo = function(arglist__101972) {
    var $elem = cljs.core.first(arglist__101972);
    var p__101967 = cljs.core.rest(arglist__101972);
    return slide_down__delegate.call(this, $elem, p__101967)
  };
  return slide_down
}();
jayq.core.parent = function parent($elem) {
  return $elem.parent()
};
jayq.core.find = function find($elem, selector) {
  return $elem.find(cljs.core.name.call(null, selector))
};
jayq.core.clone = function clone($elem) {
  return $elem.clone()
};
jayq.core.inner = function inner($elem, v) {
  return $elem.html(v)
};
jayq.core.empty = function empty($elem) {
  return $elem.empty()
};
jayq.core.val = function() {
  var val__delegate = function($elem, p__101973) {
    var vec__101974__101975 = p__101973;
    var v__101976 = cljs.core.nth.call(null, vec__101974__101975, 0, null);
    if(cljs.core.truth_(v__101976)) {
      return $elem.val(v__101976)
    }else {
      return $elem.val()
    }
  };
  var val = function($elem, var_args) {
    var p__101973 = null;
    if(goog.isDef(var_args)) {
      p__101973 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return val__delegate.call(this, $elem, p__101973)
  };
  val.cljs$lang$maxFixedArity = 1;
  val.cljs$lang$applyTo = function(arglist__101977) {
    var $elem = cljs.core.first(arglist__101977);
    var p__101973 = cljs.core.rest(arglist__101977);
    return val__delegate.call(this, $elem, p__101973)
  };
  return val
}();
jayq.core.queue = function queue($elem, callback) {
  return $elem.queue(callback)
};
jayq.core.dequeue = function dequeue(elem) {
  return jayq.core.$.call(null, elem).dequeue()
};
jayq.core.document_ready = function document_ready(func) {
  return jayq.core.$.call(null, document).ready(func)
};
jayq.core.xhr = function xhr(p__101978, content, callback) {
  var vec__101979__101980 = p__101978;
  var method__101981 = cljs.core.nth.call(null, vec__101979__101980, 0, null);
  var uri__101982 = cljs.core.nth.call(null, vec__101979__101980, 1, null);
  var params__101983 = jayq.util.clj__GT_js.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data", "\ufdd0'success"], {"\ufdd0'type":clojure.string.upper_case.call(null, cljs.core.name.call(null, method__101981)), "\ufdd0'data":jayq.util.clj__GT_js.call(null, content), "\ufdd0'success":callback}));
  return jQuery.ajax(uri__101982, params__101983)
};
jayq.core.bind = function bind($elem, ev, func) {
  return $elem.bind(cljs.core.name.call(null, ev), func)
};
jayq.core.trigger = function trigger($elem, ev) {
  return $elem.trigger(cljs.core.name.call(null, ev))
};
jayq.core.delegate = function delegate($elem, sel, ev, func) {
  return $elem.delegate(jayq.core.__GT_selector.call(null, sel), cljs.core.name.call(null, ev), func)
};
jayq.core.__GT_event = function __GT_event(e) {
  if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, e))) {
    return cljs.core.name.call(null, e)
  }else {
    if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, e))) {
      return jayq.util.clj__GT_js.call(null, e)
    }else {
      if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null, e))) {
        return clojure.string.join.call(null, " ", cljs.core.map.call(null, cljs.core.name, e))
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          throw new Error(cljs.core.str.call(null, "Unknown event type: ", e));
        }else {
          return null
        }
      }
    }
  }
};
jayq.core.on = function() {
  var on__delegate = function($elem, events, p__101984) {
    var vec__101985__101986 = p__101984;
    var sel__101987 = cljs.core.nth.call(null, vec__101985__101986, 0, null);
    var data__101988 = cljs.core.nth.call(null, vec__101985__101986, 1, null);
    var handler__101989 = cljs.core.nth.call(null, vec__101985__101986, 2, null);
    return $elem.on(jayq.core.__GT_event.call(null, events), jayq.core.__GT_selector.call(null, sel__101987), data__101988, handler__101989)
  };
  var on = function($elem, events, var_args) {
    var p__101984 = null;
    if(goog.isDef(var_args)) {
      p__101984 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return on__delegate.call(this, $elem, events, p__101984)
  };
  on.cljs$lang$maxFixedArity = 2;
  on.cljs$lang$applyTo = function(arglist__101990) {
    var $elem = cljs.core.first(arglist__101990);
    var events = cljs.core.first(cljs.core.next(arglist__101990));
    var p__101984 = cljs.core.rest(cljs.core.next(arglist__101990));
    return on__delegate.call(this, $elem, events, p__101984)
  };
  return on
}();
jayq.core.one = function() {
  var one__delegate = function($elem, events, p__101991) {
    var vec__101992__101993 = p__101991;
    var sel__101994 = cljs.core.nth.call(null, vec__101992__101993, 0, null);
    var data__101995 = cljs.core.nth.call(null, vec__101992__101993, 1, null);
    var handler__101996 = cljs.core.nth.call(null, vec__101992__101993, 2, null);
    return $elem.one(jayq.core.__GT_event.call(null, events), jayq.core.__GT_selector.call(null, sel__101994), data__101995, handler__101996)
  };
  var one = function($elem, events, var_args) {
    var p__101991 = null;
    if(goog.isDef(var_args)) {
      p__101991 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return one__delegate.call(this, $elem, events, p__101991)
  };
  one.cljs$lang$maxFixedArity = 2;
  one.cljs$lang$applyTo = function(arglist__101997) {
    var $elem = cljs.core.first(arglist__101997);
    var events = cljs.core.first(cljs.core.next(arglist__101997));
    var p__101991 = cljs.core.rest(cljs.core.next(arglist__101997));
    return one__delegate.call(this, $elem, events, p__101991)
  };
  return one
}();
jayq.core.off = function() {
  var off__delegate = function($elem, events, p__101998) {
    var vec__101999__102000 = p__101998;
    var sel__102001 = cljs.core.nth.call(null, vec__101999__102000, 0, null);
    var handler__102002 = cljs.core.nth.call(null, vec__101999__102000, 1, null);
    return $elem.off(jayq.core.__GT_event.call(null, events), jayq.core.__GT_selector.call(null, sel__102001), handler__102002)
  };
  var off = function($elem, events, var_args) {
    var p__101998 = null;
    if(goog.isDef(var_args)) {
      p__101998 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return off__delegate.call(this, $elem, events, p__101998)
  };
  off.cljs$lang$maxFixedArity = 2;
  off.cljs$lang$applyTo = function(arglist__102003) {
    var $elem = cljs.core.first(arglist__102003);
    var events = cljs.core.first(cljs.core.next(arglist__102003));
    var p__101998 = cljs.core.rest(cljs.core.next(arglist__102003));
    return off__delegate.call(this, $elem, events, p__101998)
  };
  return off
}();
jayq.core.prevent = function prevent(e) {
  return e.preventDefault()
};
goog.provide("tatame.client.views");
goog.require("cljs.core");
goog.require("jayq.core");
goog.require("crate.core");
tatame.client.views.on_start_session = function on_start_session(dojo) {
  return fetch.remotes.remote_callback.call(null, "start-session", cljs.core.PersistentVector.fromArray(["\ufdd0'id".call(null, dojo)]), function(r) {
    return jayq.core.inner.call(null, jayq.core.$.call(null, "\ufdd0'#workspace"), "sessao criada")
  })
};
tatame.client.views.on_start_dojo = function on_start_dojo() {
  return fetch.remotes.remote_callback.call(null, "start-dojo", cljs.core.PersistentVector.fromArray([]), function(current_dojo) {
    jayq.core.inner.call(null, jayq.core.$.call(null, "\ufdd0'#workspace"), tatame.client.views.dojo.call(null));
    return jayq.core.$.call(null, "\ufdd0'#start-session").click(cljs.core.partial.call(null, tatame.client.views.on_start_session, current_dojo))
  })
};
tatame.client.views.render = function render(f) {
  return jayq.core.append.call(null, jayq.core.$.call(null, "\ufdd0'#workspace"), f.call(null))
};
var group__3247__auto____99742 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.dojo = function dojo() {
  var elem__3248__auto____99743 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div", "sess\u00f5es atuais", cljs.core.PersistentVector.fromArray(["\ufdd0'input#start-session.btn.btn-primary", cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'value"], {"\ufdd0'type":"button", "\ufdd0'value":"Come\u00e7ar sess\u00e3o"})])]));
  elem__3248__auto____99743.setAttribute("crateGroup", group__3247__auto____99742);
  return elem__3248__auto____99743
};
tatame.client.views.dojo.prototype._crateGroup = group__3247__auto____99742;
var group__3247__auto____99744 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.loading = function loading() {
  var elem__3248__auto____99745 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div.span12", cljs.core.PersistentVector.fromArray(["\ufdd0'div.hero-unit", cljs.core.PersistentVector.fromArray(["\ufdd0'h1", "Welcome to the Dojo!!"])]), cljs.core.PersistentVector.fromArray(["\ufdd0'div.alert.alert-info", cljs.core.PersistentVector.fromArray(["\ufdd0'h4", "Aguarde!"]), "Conectando com servidor..."]), tatame.client.views.new_dojo.call(null)]));
  elem__3248__auto____99745.setAttribute("crateGroup", group__3247__auto____99744);
  return elem__3248__auto____99745
};
tatame.client.views.loading.prototype._crateGroup = group__3247__auto____99744;
var group__3247__auto____99746 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.new_dojo = function new_dojo() {
  var elem__3248__auto____99747 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div", cljs.core.PersistentVector.fromArray(["\ufdd0'a", cljs.core.ObjMap.fromObject(["\ufdd0'href"], {"\ufdd0'href":"#new-dojo"}), "Come\u00e7ar dojo"])]));
  elem__3248__auto____99747.setAttribute("crateGroup", group__3247__auto____99746);
  return elem__3248__auto____99747
};
tatame.client.views.new_dojo.prototype._crateGroup = group__3247__auto____99746;
var group__3247__auto____99748 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.admin_sidebar = function admin_sidebar() {
  var elem__3248__auto____99749 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div.well.sidebar-nav", cljs.core.PersistentVector.fromArray(["\ufdd0'ul.nav.nav-list", cljs.core.PersistentVector.fromArray(["\ufdd0'li.nav-header", "Sidebar"]), cljs.core.PersistentVector.fromArray(["\ufdd0'li.active", "Dojos"]), cljs.core.PersistentVector.fromArray(["\ufdd0'li.active", "Usu\u00e1rios"])])]));
  elem__3248__auto____99749.setAttribute("crateGroup", group__3247__auto____99748);
  return elem__3248__auto____99749
};
tatame.client.views.admin_sidebar.prototype._crateGroup = group__3247__auto____99748;
var group__3247__auto____99750 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.user_registration = function user_registration() {
  var elem__3248__auto____99751 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div.span4", cljs.core.PersistentVector.fromArray(["\ufdd0'div.alert.alert-info", cljs.core.PersistentVector.fromArray(["\ufdd0'h4", "Ol\u00e1!"]), "Registre um usu\u00e1rio para come\u00e7ar a sess\u00e3o"]), cljs.core.PersistentVector.fromArray(["\ufdd0'input", cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data-loading-text"], {"\ufdd0'type":"text", "\ufdd0'data-loading-text":"registrando..."})]), 
  cljs.core.PersistentVector.fromArray(["\ufdd0'a.btn.btn-primary", "Registrar usu\u00e1rio"])]));
  elem__3248__auto____99751.setAttribute("crateGroup", group__3247__auto____99750);
  return elem__3248__auto____99751
};
tatame.client.views.user_registration.prototype._crateGroup = group__3247__auto____99750;
goog.provide("waltz.state");
goog.require("cljs.core");
waltz.state.debug_log = function() {
  var debug_log__delegate = function(sm, v, vs) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____102043 = console;
      if(cljs.core.truth_(and__3546__auto____102043)) {
        return cljs.core.deref.call(null, sm).call(null, "\ufdd0'debug")
      }else {
        return and__3546__auto____102043
      }
    }())) {
      var s__102044 = cljs.core.apply.call(null, cljs.core.str, waltz.state.get_name.call(null, sm), " :: ", v, vs);
      return console.log(s__102044)
    }else {
      return null
    }
  };
  var debug_log = function(sm, v, var_args) {
    var vs = null;
    if(goog.isDef(var_args)) {
      vs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return debug_log__delegate.call(this, sm, v, vs)
  };
  debug_log.cljs$lang$maxFixedArity = 2;
  debug_log.cljs$lang$applyTo = function(arglist__102045) {
    var sm = cljs.core.first(arglist__102045);
    var v = cljs.core.first(cljs.core.next(arglist__102045));
    var vs = cljs.core.rest(cljs.core.next(arglist__102045));
    return debug_log__delegate.call(this, sm, v, vs)
  };
  return debug_log
}();
waltz.state.__GT_coll = function __GT_coll(v) {
  if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null, v))) {
    return v
  }else {
    return cljs.core.PersistentVector.fromArray([v])
  }
};
waltz.state.state_STAR_ = function state_STAR_() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'in", "\ufdd0'out", "\ufdd0'constraints"], {"\ufdd0'in":cljs.core.PersistentVector.fromArray([]), "\ufdd0'out":cljs.core.PersistentVector.fromArray([]), "\ufdd0'constraints":cljs.core.PersistentVector.fromArray([])})
};
waltz.state.machine = function() {
  var machine__delegate = function(p__102046) {
    var vec__102047__102048 = p__102046;
    var n__102049 = cljs.core.nth.call(null, vec__102047__102048, 0, null);
    return cljs.core.atom.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'debug", "\ufdd0'name", "\ufdd0'current", "\ufdd0'states", "\ufdd0'transitions"], {"\ufdd0'debug":true, "\ufdd0'name":cljs.core.name.call(null, n__102049), "\ufdd0'current":cljs.core.set([]), "\ufdd0'states":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'transitions":cljs.core.ObjMap.fromObject([], {})}))
  };
  var machine = function(var_args) {
    var p__102046 = null;
    if(goog.isDef(var_args)) {
      p__102046 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return machine__delegate.call(this, p__102046)
  };
  machine.cljs$lang$maxFixedArity = 0;
  machine.cljs$lang$applyTo = function(arglist__102050) {
    var p__102046 = cljs.core.seq(arglist__102050);
    return machine__delegate.call(this, p__102046)
  };
  return machine
}();
waltz.state.get_name = function get_name(sm) {
  return waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'name"]))
};
waltz.state.get_in_sm = function get_in_sm(sm, ks) {
  return cljs.core.get_in.call(null, cljs.core.deref.call(null, sm), ks)
};
waltz.state.assoc_sm = function assoc_sm(sm, ks, v) {
  return cljs.core.swap_BANG_.call(null, sm, function(p1__102051_SHARP_) {
    return cljs.core.assoc_in.call(null, p1__102051_SHARP_, ks, v)
  })
};
waltz.state.update_sm = function() {
  var update_sm__delegate = function(sm, fntail) {
    return cljs.core.swap_BANG_.call(null, sm, function(p1__102052_SHARP_) {
      return cljs.core.apply.call(null, cljs.core.update_in, p1__102052_SHARP_, fntail)
    })
  };
  var update_sm = function(sm, var_args) {
    var fntail = null;
    if(goog.isDef(var_args)) {
      fntail = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return update_sm__delegate.call(this, sm, fntail)
  };
  update_sm.cljs$lang$maxFixedArity = 1;
  update_sm.cljs$lang$applyTo = function(arglist__102053) {
    var sm = cljs.core.first(arglist__102053);
    var fntail = cljs.core.rest(arglist__102053);
    return update_sm__delegate.call(this, sm, fntail)
  };
  return update_sm
}();
waltz.state.current = function current(sm) {
  return waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'current"]))
};
waltz.state.in_QMARK_ = function in_QMARK_(sm, state) {
  return waltz.state.current.call(null, sm).call(null, state)
};
waltz.state.has_state_QMARK_ = function has_state_QMARK_(sm, state) {
  return waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state]))
};
waltz.state.has_transition_QMARK_ = function has_transition_QMARK_(sm, trans) {
  return waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'transitions", trans]))
};
waltz.state.add_state = function add_state(sm, name, v) {
  return waltz.state.assoc_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", name]), v)
};
waltz.state.add_transition = function add_transition(sm, name, v) {
  return waltz.state.assoc_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'transitions", name]), v)
};
waltz.state.in_STAR_ = function in_STAR_(state, fn) {
  return cljs.core.update_in.call(null, state, cljs.core.PersistentVector.fromArray(["\ufdd0'in"]), cljs.core.conj, fn)
};
waltz.state.out_STAR_ = function out_STAR_(state, fn) {
  return cljs.core.update_in.call(null, state, cljs.core.PersistentVector.fromArray(["\ufdd0'out"]), cljs.core.conj, fn)
};
waltz.state.constraint = function constraint(state, fn) {
  return cljs.core.update_in.call(null, state, cljs.core.PersistentVector.fromArray(["\ufdd0'constraint"]), cljs.core.conj, fn)
};
waltz.state.can_transition_QMARK_ = function can_transition_QMARK_(sm, state) {
  var trans__102055 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state, "\ufdd0'constraints"]));
  if(cljs.core.truth_(trans__102055)) {
    return cljs.core.every_QMARK_.call(null, function(p1__102054_SHARP_) {
      return p1__102054_SHARP_.call(null, state)
    }, trans__102055)
  }else {
    return true
  }
};
waltz.state.set = function() {
  var set__delegate = function(sm, states, context) {
    var G__102056__102057 = cljs.core.seq.call(null, waltz.state.__GT_coll.call(null, states));
    if(cljs.core.truth_(G__102056__102057)) {
      var state__102058 = cljs.core.first.call(null, G__102056__102057);
      var G__102056__102059 = G__102056__102057;
      while(true) {
        if(cljs.core.truth_(waltz.state.can_transition_QMARK_.call(null, sm, state__102058))) {
          var cur_in__102060 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state__102058, "\ufdd0'in"]));
          waltz.state.update_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'current"]), cljs.core.conj, state__102058);
          waltz.state.debug_log.call(null, sm, "(set ", cljs.core.str.call(null, state__102058), ") -> ", cljs.core.pr_str.call(null, waltz.state.current.call(null, sm)));
          if(cljs.core.truth_(cljs.core.seq.call(null, cur_in__102060))) {
            waltz.state.debug_log.call(null, sm, "(in ", cljs.core.str.call(null, state__102058), ")");
            var G__102061__102062 = cljs.core.seq.call(null, cur_in__102060);
            if(cljs.core.truth_(G__102061__102062)) {
              var func__102063 = cljs.core.first.call(null, G__102061__102062);
              var G__102061__102064 = G__102061__102062;
              while(true) {
                cljs.core.apply.call(null, func__102063, context);
                var temp__3698__auto____102065 = cljs.core.next.call(null, G__102061__102064);
                if(cljs.core.truth_(temp__3698__auto____102065)) {
                  var G__102061__102066 = temp__3698__auto____102065;
                  var G__102069 = cljs.core.first.call(null, G__102061__102066);
                  var G__102070 = G__102061__102066;
                  func__102063 = G__102069;
                  G__102061__102064 = G__102070;
                  continue
                }else {
                }
                break
              }
            }else {
            }
          }else {
          }
        }else {
        }
        var temp__3698__auto____102067 = cljs.core.next.call(null, G__102056__102059);
        if(cljs.core.truth_(temp__3698__auto____102067)) {
          var G__102056__102068 = temp__3698__auto____102067;
          var G__102071 = cljs.core.first.call(null, G__102056__102068);
          var G__102072 = G__102056__102068;
          state__102058 = G__102071;
          G__102056__102059 = G__102072;
          continue
        }else {
        }
        break
      }
    }else {
    }
    return sm
  };
  var set = function(sm, states, var_args) {
    var context = null;
    if(goog.isDef(var_args)) {
      context = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return set__delegate.call(this, sm, states, context)
  };
  set.cljs$lang$maxFixedArity = 2;
  set.cljs$lang$applyTo = function(arglist__102073) {
    var sm = cljs.core.first(arglist__102073);
    var states = cljs.core.first(cljs.core.next(arglist__102073));
    var context = cljs.core.rest(cljs.core.next(arglist__102073));
    return set__delegate.call(this, sm, states, context)
  };
  return set
}();
waltz.state.unset = function() {
  var unset__delegate = function(sm, states, context) {
    var G__102074__102075 = cljs.core.seq.call(null, waltz.state.__GT_coll.call(null, states));
    if(cljs.core.truth_(G__102074__102075)) {
      var state__102076 = cljs.core.first.call(null, G__102074__102075);
      var G__102074__102077 = G__102074__102075;
      while(true) {
        if(cljs.core.truth_(waltz.state.in_QMARK_.call(null, sm, state__102076))) {
          var cur_out__102078 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state__102076, "\ufdd0'out"]));
          waltz.state.update_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'current"]), cljs.core.disj, state__102076);
          waltz.state.debug_log.call(null, sm, "(unset ", cljs.core.str.call(null, state__102076, ")"), " -> ", cljs.core.pr_str.call(null, waltz.state.current.call(null, sm)));
          if(cljs.core.truth_(cljs.core.seq.call(null, cur_out__102078))) {
            waltz.state.debug_log.call(null, sm, "(out ", cljs.core.str.call(null, state__102076), ")");
            var G__102079__102080 = cljs.core.seq.call(null, cur_out__102078);
            if(cljs.core.truth_(G__102079__102080)) {
              var func__102081 = cljs.core.first.call(null, G__102079__102080);
              var G__102079__102082 = G__102079__102080;
              while(true) {
                cljs.core.apply.call(null, func__102081, context);
                var temp__3698__auto____102083 = cljs.core.next.call(null, G__102079__102082);
                if(cljs.core.truth_(temp__3698__auto____102083)) {
                  var G__102079__102084 = temp__3698__auto____102083;
                  var G__102087 = cljs.core.first.call(null, G__102079__102084);
                  var G__102088 = G__102079__102084;
                  func__102081 = G__102087;
                  G__102079__102082 = G__102088;
                  continue
                }else {
                }
                break
              }
            }else {
            }
          }else {
          }
        }else {
        }
        var temp__3698__auto____102085 = cljs.core.next.call(null, G__102074__102077);
        if(cljs.core.truth_(temp__3698__auto____102085)) {
          var G__102074__102086 = temp__3698__auto____102085;
          var G__102089 = cljs.core.first.call(null, G__102074__102086);
          var G__102090 = G__102074__102086;
          state__102076 = G__102089;
          G__102074__102077 = G__102090;
          continue
        }else {
        }
        break
      }
    }else {
    }
    return sm
  };
  var unset = function(sm, states, var_args) {
    var context = null;
    if(goog.isDef(var_args)) {
      context = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return unset__delegate.call(this, sm, states, context)
  };
  unset.cljs$lang$maxFixedArity = 2;
  unset.cljs$lang$applyTo = function(arglist__102091) {
    var sm = cljs.core.first(arglist__102091);
    var states = cljs.core.first(cljs.core.next(arglist__102091));
    var context = cljs.core.rest(cljs.core.next(arglist__102091));
    return unset__delegate.call(this, sm, states, context)
  };
  return unset
}();
waltz.state.set_ex = function() {
  var set_ex__delegate = function(sm, to_unset, to_set, context) {
    cljs.core.apply.call(null, waltz.state.unset, sm, to_unset, context);
    return cljs.core.apply.call(null, waltz.state.set, sm, to_set, context)
  };
  var set_ex = function(sm, to_unset, to_set, var_args) {
    var context = null;
    if(goog.isDef(var_args)) {
      context = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return set_ex__delegate.call(this, sm, to_unset, to_set, context)
  };
  set_ex.cljs$lang$maxFixedArity = 3;
  set_ex.cljs$lang$applyTo = function(arglist__102092) {
    var sm = cljs.core.first(arglist__102092);
    var to_unset = cljs.core.first(cljs.core.next(arglist__102092));
    var to_set = cljs.core.first(cljs.core.next(cljs.core.next(arglist__102092)));
    var context = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__102092)));
    return set_ex__delegate.call(this, sm, to_unset, to_set, context)
  };
  return set_ex
}();
waltz.state.transition = function() {
  var transition__delegate = function(sm, ts, context) {
    var G__102093__102094 = cljs.core.seq.call(null, waltz.state.__GT_coll.call(null, ts));
    if(cljs.core.truth_(G__102093__102094)) {
      var trans__102095 = cljs.core.first.call(null, G__102093__102094);
      var G__102093__102096 = G__102093__102094;
      while(true) {
        var temp__3698__auto____102097 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'transitions", trans__102095]));
        if(cljs.core.truth_(temp__3698__auto____102097)) {
          var t__102098 = temp__3698__auto____102097;
          var res__102099 = cljs.core.apply.call(null, t__102098, context);
          waltz.state.debug_log.call(null, sm, "(trans ", cljs.core.str.call(null, trans__102095), ") -> ", cljs.core.boolean$.call(null, res__102099), " :: context ", cljs.core.pr_str.call(null, context))
        }else {
        }
        var temp__3698__auto____102100 = cljs.core.next.call(null, G__102093__102096);
        if(cljs.core.truth_(temp__3698__auto____102100)) {
          var G__102093__102101 = temp__3698__auto____102100;
          var G__102102 = cljs.core.first.call(null, G__102093__102101);
          var G__102103 = G__102093__102101;
          trans__102095 = G__102102;
          G__102093__102096 = G__102103;
          continue
        }else {
          return null
        }
        break
      }
    }else {
      return null
    }
  };
  var transition = function(sm, ts, var_args) {
    var context = null;
    if(goog.isDef(var_args)) {
      context = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return transition__delegate.call(this, sm, ts, context)
  };
  transition.cljs$lang$maxFixedArity = 2;
  transition.cljs$lang$applyTo = function(arglist__102104) {
    var sm = cljs.core.first(arglist__102104);
    var ts = cljs.core.first(cljs.core.next(arglist__102104));
    var context = cljs.core.rest(cljs.core.next(arglist__102104));
    return transition__delegate.call(this, sm, ts, context)
  };
  return transition
}();
waltz.state.set_debug = function set_debug(sm, dbg) {
  return waltz.state.assoc_sm.call(null, sm, "\ufdd0'debug", dbg)
};
goog.provide("cljs.reader");
goog.require("cljs.core");
goog.require("goog.string");
cljs.reader.PushbackReader = {};
cljs.reader.read_char = function read_char(reader) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101587 = reader;
    if(cljs.core.truth_(and__3546__auto____101587)) {
      return reader.cljs$reader$PushbackReader$read_char
    }else {
      return and__3546__auto____101587
    }
  }())) {
    return reader.cljs$reader$PushbackReader$read_char(reader)
  }else {
    return function() {
      var or__3548__auto____101588 = cljs.reader.read_char[goog.typeOf.call(null, reader)];
      if(cljs.core.truth_(or__3548__auto____101588)) {
        return or__3548__auto____101588
      }else {
        var or__3548__auto____101589 = cljs.reader.read_char["_"];
        if(cljs.core.truth_(or__3548__auto____101589)) {
          return or__3548__auto____101589
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.read-char", reader);
        }
      }
    }().call(null, reader)
  }
};
cljs.reader.unread = function unread(reader, ch) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101590 = reader;
    if(cljs.core.truth_(and__3546__auto____101590)) {
      return reader.cljs$reader$PushbackReader$unread
    }else {
      return and__3546__auto____101590
    }
  }())) {
    return reader.cljs$reader$PushbackReader$unread(reader, ch)
  }else {
    return function() {
      var or__3548__auto____101591 = cljs.reader.unread[goog.typeOf.call(null, reader)];
      if(cljs.core.truth_(or__3548__auto____101591)) {
        return or__3548__auto____101591
      }else {
        var or__3548__auto____101592 = cljs.reader.unread["_"];
        if(cljs.core.truth_(or__3548__auto____101592)) {
          return or__3548__auto____101592
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.unread", reader);
        }
      }
    }().call(null, reader, ch)
  }
};
cljs.reader.StringPushbackReader = function(s, index_atom, buffer_atom) {
  this.s = s;
  this.index_atom = index_atom;
  this.buffer_atom = buffer_atom
};
cljs.reader.StringPushbackReader.cljs$core$IPrintable$_pr_seq = function(this__367__auto__) {
  return cljs.core.list.call(null, "cljs.reader.StringPushbackReader")
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$ = true;
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$read_char = function(reader) {
  var this__101593 = this;
  if(cljs.core.truth_(cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, this__101593.buffer_atom)))) {
    var idx__101594 = cljs.core.deref.call(null, this__101593.index_atom);
    cljs.core.swap_BANG_.call(null, this__101593.index_atom, cljs.core.inc);
    return cljs.core.nth.call(null, this__101593.s, idx__101594)
  }else {
    var buf__101595 = cljs.core.deref.call(null, this__101593.buffer_atom);
    cljs.core.swap_BANG_.call(null, this__101593.buffer_atom, cljs.core.rest);
    return cljs.core.first.call(null, buf__101595)
  }
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$unread = function(reader, ch) {
  var this__101596 = this;
  return cljs.core.swap_BANG_.call(null, this__101596.buffer_atom, function(p1__101586_SHARP_) {
    return cljs.core.cons.call(null, ch, p1__101586_SHARP_)
  })
};
cljs.reader.StringPushbackReader;
cljs.reader.push_back_reader = function push_back_reader(s) {
  return new cljs.reader.StringPushbackReader(s, cljs.core.atom.call(null, 0), cljs.core.atom.call(null, null))
};
cljs.reader.whitespace_QMARK_ = function whitespace_QMARK_(ch) {
  var or__3548__auto____101597 = goog.string.isBreakingWhitespace.call(null, ch);
  if(cljs.core.truth_(or__3548__auto____101597)) {
    return or__3548__auto____101597
  }else {
    return cljs.core._EQ_.call(null, ",", ch)
  }
};
cljs.reader.numeric_QMARK_ = function numeric_QMARK_(ch) {
  return goog.string.isNumeric.call(null, ch)
};
cljs.reader.comment_prefix_QMARK_ = function comment_prefix_QMARK_(ch) {
  return cljs.core._EQ_.call(null, ";", ch)
};
cljs.reader.number_literal_QMARK_ = function number_literal_QMARK_(reader, initch) {
  var or__3548__auto____101598 = cljs.reader.numeric_QMARK_.call(null, initch);
  if(cljs.core.truth_(or__3548__auto____101598)) {
    return or__3548__auto____101598
  }else {
    var and__3546__auto____101600 = function() {
      var or__3548__auto____101599 = cljs.core._EQ_.call(null, "+", initch);
      if(cljs.core.truth_(or__3548__auto____101599)) {
        return or__3548__auto____101599
      }else {
        return cljs.core._EQ_.call(null, "-", initch)
      }
    }();
    if(cljs.core.truth_(and__3546__auto____101600)) {
      return cljs.reader.numeric_QMARK_.call(null, function() {
        var next_ch__101601 = cljs.reader.read_char.call(null, reader);
        cljs.reader.unread.call(null, reader, next_ch__101601);
        return next_ch__101601
      }())
    }else {
      return and__3546__auto____101600
    }
  }
};
cljs.reader.reader_error = function() {
  var reader_error__delegate = function(rdr, msg) {
    throw cljs.core.apply.call(null, cljs.core.str, msg);
  };
  var reader_error = function(rdr, var_args) {
    var msg = null;
    if(goog.isDef(var_args)) {
      msg = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return reader_error__delegate.call(this, rdr, msg)
  };
  reader_error.cljs$lang$maxFixedArity = 1;
  reader_error.cljs$lang$applyTo = function(arglist__101602) {
    var rdr = cljs.core.first(arglist__101602);
    var msg = cljs.core.rest(arglist__101602);
    return reader_error__delegate.call(this, rdr, msg)
  };
  return reader_error
}();
cljs.reader.macro_terminating_QMARK_ = function macro_terminating_QMARK_(ch) {
  var and__3546__auto____101603 = cljs.core.not_EQ_.call(null, ch, "#");
  if(cljs.core.truth_(and__3546__auto____101603)) {
    var and__3546__auto____101604 = cljs.core.not_EQ_.call(null, ch, "'");
    if(cljs.core.truth_(and__3546__auto____101604)) {
      var and__3546__auto____101605 = cljs.core.not_EQ_.call(null, ch, ":");
      if(cljs.core.truth_(and__3546__auto____101605)) {
        return cljs.core.contains_QMARK_.call(null, cljs.reader.macros, ch)
      }else {
        return and__3546__auto____101605
      }
    }else {
      return and__3546__auto____101604
    }
  }else {
    return and__3546__auto____101603
  }
};
cljs.reader.read_token = function read_token(rdr, initch) {
  var sb__101606 = new goog.string.StringBuffer(initch);
  var ch__101607 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3548__auto____101608 = ch__101607 === null;
      if(cljs.core.truth_(or__3548__auto____101608)) {
        return or__3548__auto____101608
      }else {
        var or__3548__auto____101609 = cljs.reader.whitespace_QMARK_.call(null, ch__101607);
        if(cljs.core.truth_(or__3548__auto____101609)) {
          return or__3548__auto____101609
        }else {
          return cljs.reader.macro_terminating_QMARK_.call(null, ch__101607)
        }
      }
    }())) {
      cljs.reader.unread.call(null, rdr, ch__101607);
      return sb__101606.toString()
    }else {
      var G__101610 = function() {
        sb__101606.append(ch__101607);
        return sb__101606
      }();
      var G__101611 = cljs.reader.read_char.call(null, rdr);
      sb__101606 = G__101610;
      ch__101607 = G__101611;
      continue
    }
    break
  }
};
cljs.reader.skip_line = function skip_line(reader, _) {
  while(true) {
    var ch__101612 = cljs.reader.read_char.call(null, reader);
    if(cljs.core.truth_(function() {
      var or__3548__auto____101613 = cljs.core._EQ_.call(null, ch__101612, "n");
      if(cljs.core.truth_(or__3548__auto____101613)) {
        return or__3548__auto____101613
      }else {
        var or__3548__auto____101614 = cljs.core._EQ_.call(null, ch__101612, "r");
        if(cljs.core.truth_(or__3548__auto____101614)) {
          return or__3548__auto____101614
        }else {
          return ch__101612 === null
        }
      }
    }())) {
      return reader
    }else {
      continue
    }
    break
  }
};
cljs.reader.int_pattern = cljs.core.re_pattern.call(null, "([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?");
cljs.reader.ratio_pattern = cljs.core.re_pattern.call(null, "([-+]?[0-9]+)/([0-9]+)");
cljs.reader.float_pattern = cljs.core.re_pattern.call(null, "([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?");
cljs.reader.symbol_pattern = cljs.core.re_pattern.call(null, "[:]?([^0-9/].*/)?([^0-9/][^/]*)");
cljs.reader.match_int = function match_int(s) {
  var groups__101615 = cljs.core.re_find.call(null, cljs.reader.int_pattern, s);
  var group3__101616 = cljs.core.nth.call(null, groups__101615, 2);
  if(cljs.core.truth_(cljs.core.not.call(null, function() {
    var or__3548__auto____101617 = void 0 === group3__101616;
    if(cljs.core.truth_(or__3548__auto____101617)) {
      return or__3548__auto____101617
    }else {
      return group3__101616.length < 1
    }
  }()))) {
    return 0
  }else {
    var negate__101619 = cljs.core.truth_(cljs.core._EQ_.call(null, "-", cljs.core.nth.call(null, groups__101615, 1))) ? -1 : 1;
    var vec__101618__101620 = cljs.core.truth_(cljs.core.nth.call(null, groups__101615, 3)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__101615, 3), 10]) : cljs.core.truth_(cljs.core.nth.call(null, groups__101615, 4)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__101615, 4), 16]) : cljs.core.truth_(cljs.core.nth.call(null, groups__101615, 5)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__101615, 5), 8]) : cljs.core.truth_(cljs.core.nth.call(null, 
    groups__101615, 7)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__101615, 7), parseInt.call(null, cljs.core.nth.call(null, groups__101615, 7))]) : cljs.core.truth_("\ufdd0'default") ? cljs.core.PersistentVector.fromArray([null, null]) : null;
    var n__101621 = cljs.core.nth.call(null, vec__101618__101620, 0, null);
    var radix__101622 = cljs.core.nth.call(null, vec__101618__101620, 1, null);
    if(cljs.core.truth_(n__101621 === null)) {
      return null
    }else {
      return negate__101619 * parseInt.call(null, n__101621, radix__101622)
    }
  }
};
cljs.reader.match_ratio = function match_ratio(s) {
  var groups__101623 = cljs.core.re_find.call(null, cljs.reader.ratio_pattern, s);
  var numinator__101624 = cljs.core.nth.call(null, groups__101623, 1);
  var denominator__101625 = cljs.core.nth.call(null, groups__101623, 2);
  return parseInt.call(null, numinator__101624) / parseInt.call(null, denominator__101625)
};
cljs.reader.match_float = function match_float(s) {
  return parseFloat.call(null, s)
};
cljs.reader.match_number = function match_number(s) {
  if(cljs.core.truth_(cljs.core.re_matches.call(null, cljs.reader.int_pattern, s))) {
    return cljs.reader.match_int.call(null, s)
  }else {
    if(cljs.core.truth_(cljs.core.re_matches.call(null, cljs.reader.ratio_pattern, s))) {
      return cljs.reader.match_ratio.call(null, s)
    }else {
      if(cljs.core.truth_(cljs.core.re_matches.call(null, cljs.reader.float_pattern, s))) {
        return cljs.reader.match_float.call(null, s)
      }else {
        return null
      }
    }
  }
};
cljs.reader.escape_char_map = cljs.core.HashMap.fromArrays(["t", "r", "n", "\\", '"', "b", "f"], ["\t", "\r", "\n", "\\", '"', "\u0008", "\u000c"]);
cljs.reader.read_unicode_char = function read_unicode_char(reader, initch) {
  return cljs.reader.reader_error.call(null, reader, "Unicode characters not supported by reader (yet)")
};
cljs.reader.escape_char = function escape_char(buffer, reader) {
  var ch__101626 = cljs.reader.read_char.call(null, reader);
  var mapresult__101627 = cljs.core.get.call(null, cljs.reader.escape_char_map, ch__101626);
  if(cljs.core.truth_(mapresult__101627)) {
    return mapresult__101627
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____101628 = cljs.core._EQ_.call(null, "u", ch__101626);
      if(cljs.core.truth_(or__3548__auto____101628)) {
        return or__3548__auto____101628
      }else {
        return cljs.reader.numeric_QMARK_.call(null, ch__101626)
      }
    }())) {
      return cljs.reader.read_unicode_char.call(null, reader, ch__101626)
    }else {
      return cljs.reader.reader_error.call(null, reader, "Unsupported escape charater: \\", ch__101626)
    }
  }
};
cljs.reader.read_past = function read_past(pred, rdr) {
  var ch__101629 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(pred.call(null, ch__101629))) {
      var G__101630 = cljs.reader.read_char.call(null, rdr);
      ch__101629 = G__101630;
      continue
    }else {
      return ch__101629
    }
    break
  }
};
cljs.reader.read_delimited_list = function read_delimited_list(delim, rdr, recursive_QMARK_) {
  var a__101631 = cljs.core.PersistentVector.fromArray([]);
  while(true) {
    var ch__101632 = cljs.reader.read_past.call(null, cljs.reader.whitespace_QMARK_, rdr);
    if(cljs.core.truth_(ch__101632)) {
    }else {
      cljs.reader.reader_error.call(null, rdr, "EOF")
    }
    if(cljs.core.truth_(cljs.core._EQ_.call(null, delim, ch__101632))) {
      return a__101631
    }else {
      var temp__3695__auto____101633 = cljs.core.get.call(null, cljs.reader.macros, ch__101632);
      if(cljs.core.truth_(temp__3695__auto____101633)) {
        var macrofn__101634 = temp__3695__auto____101633;
        var mret__101635 = macrofn__101634.call(null, rdr, ch__101632);
        var G__101637 = cljs.core.truth_(cljs.core._EQ_.call(null, mret__101635, rdr)) ? a__101631 : cljs.core.conj.call(null, a__101631, mret__101635);
        a__101631 = G__101637;
        continue
      }else {
        cljs.reader.unread.call(null, rdr, ch__101632);
        var o__101636 = cljs.reader.read.call(null, rdr, true, null, recursive_QMARK_);
        var G__101638 = cljs.core.truth_(cljs.core._EQ_.call(null, o__101636, rdr)) ? a__101631 : cljs.core.conj.call(null, a__101631, o__101636);
        a__101631 = G__101638;
        continue
      }
    }
    break
  }
};
cljs.reader.not_implemented = function not_implemented(rdr, ch) {
  return cljs.reader.reader_error.call(null, rdr, "Reader for ", ch, " not implemented yet")
};
cljs.reader.read_dispatch = function read_dispatch(rdr, _) {
  var ch__101639 = cljs.reader.read_char.call(null, rdr);
  var dm__101640 = cljs.core.get.call(null, cljs.reader.dispatch_macros, ch__101639);
  if(cljs.core.truth_(dm__101640)) {
    return dm__101640.call(null, rdr, _)
  }else {
    return cljs.reader.reader_error.call(null, rdr, "No dispatch macro for ", ch__101639)
  }
};
cljs.reader.read_unmatched_delimiter = function read_unmatched_delimiter(rdr, ch) {
  return cljs.reader.reader_error.call(null, rdr, "Unmached delimiter ", ch)
};
cljs.reader.read_list = function read_list(rdr, _) {
  return cljs.core.apply.call(null, cljs.core.list, cljs.reader.read_delimited_list.call(null, ")", rdr, true))
};
cljs.reader.read_comment = cljs.reader.skip_line;
cljs.reader.read_vector = function read_vector(rdr, _) {
  return cljs.reader.read_delimited_list.call(null, "]", rdr, true)
};
cljs.reader.read_map = function read_map(rdr, _) {
  var l__101641 = cljs.reader.read_delimited_list.call(null, "}", rdr, true);
  if(cljs.core.truth_(cljs.core.odd_QMARK_.call(null, cljs.core.count.call(null, l__101641)))) {
    cljs.reader.reader_error.call(null, rdr, "Map literal must contain an even number of forms")
  }else {
  }
  return cljs.core.apply.call(null, cljs.core.hash_map, l__101641)
};
cljs.reader.read_number = function read_number(reader, initch) {
  var buffer__101642 = new goog.string.StringBuffer(initch);
  var ch__101643 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3548__auto____101644 = ch__101643 === null;
      if(cljs.core.truth_(or__3548__auto____101644)) {
        return or__3548__auto____101644
      }else {
        var or__3548__auto____101645 = cljs.reader.whitespace_QMARK_.call(null, ch__101643);
        if(cljs.core.truth_(or__3548__auto____101645)) {
          return or__3548__auto____101645
        }else {
          return cljs.core.contains_QMARK_.call(null, cljs.reader.macros, ch__101643)
        }
      }
    }())) {
      cljs.reader.unread.call(null, reader, ch__101643);
      var s__101646 = buffer__101642.toString();
      var or__3548__auto____101647 = cljs.reader.match_number.call(null, s__101646);
      if(cljs.core.truth_(or__3548__auto____101647)) {
        return or__3548__auto____101647
      }else {
        return cljs.reader.reader_error.call(null, reader, "Invalid number format [", s__101646, "]")
      }
    }else {
      var G__101648 = function() {
        buffer__101642.append(ch__101643);
        return buffer__101642
      }();
      var G__101649 = cljs.reader.read_char.call(null, reader);
      buffer__101642 = G__101648;
      ch__101643 = G__101649;
      continue
    }
    break
  }
};
cljs.reader.read_string = function read_string(reader, _) {
  var buffer__101650 = new goog.string.StringBuffer;
  var ch__101651 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(ch__101651 === null)) {
      return cljs.reader.reader_error.call(null, reader, "EOF while reading string")
    }else {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, "\\", ch__101651))) {
        var G__101652 = function() {
          buffer__101650.append(cljs.reader.escape_char.call(null, buffer__101650, reader));
          return buffer__101650
        }();
        var G__101653 = cljs.reader.read_char.call(null, reader);
        buffer__101650 = G__101652;
        ch__101651 = G__101653;
        continue
      }else {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, '"', ch__101651))) {
          return buffer__101650.toString()
        }else {
          if(cljs.core.truth_("\ufdd0'default")) {
            var G__101654 = function() {
              buffer__101650.append(ch__101651);
              return buffer__101650
            }();
            var G__101655 = cljs.reader.read_char.call(null, reader);
            buffer__101650 = G__101654;
            ch__101651 = G__101655;
            continue
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
cljs.reader.special_symbols = cljs.core.ObjMap.fromObject(["nil", "true", "false"], {"nil":null, "true":true, "false":false});
cljs.reader.read_symbol = function read_symbol(reader, initch) {
  var token__101656 = cljs.reader.read_token.call(null, reader, initch);
  if(cljs.core.truth_(goog.string.contains.call(null, token__101656, "/"))) {
    return cljs.core.symbol.call(null, cljs.core.subs.call(null, token__101656, 0, token__101656.indexOf("/")), cljs.core.subs.call(null, token__101656, token__101656.indexOf("/") + 1, token__101656.length))
  }else {
    return cljs.core.get.call(null, cljs.reader.special_symbols, token__101656, cljs.core.symbol.call(null, token__101656))
  }
};
cljs.reader.read_keyword = function read_keyword(reader, initch) {
  var token__101658 = cljs.reader.read_token.call(null, reader, cljs.reader.read_char.call(null, reader));
  var vec__101657__101659 = cljs.core.re_matches.call(null, cljs.reader.symbol_pattern, token__101658);
  var token__101660 = cljs.core.nth.call(null, vec__101657__101659, 0, null);
  var ns__101661 = cljs.core.nth.call(null, vec__101657__101659, 1, null);
  var name__101662 = cljs.core.nth.call(null, vec__101657__101659, 2, null);
  if(cljs.core.truth_(function() {
    var or__3548__auto____101664 = function() {
      var and__3546__auto____101663 = cljs.core.not.call(null, void 0 === ns__101661);
      if(cljs.core.truth_(and__3546__auto____101663)) {
        return ns__101661.substring(ns__101661.length - 2, ns__101661.length) === ":/"
      }else {
        return and__3546__auto____101663
      }
    }();
    if(cljs.core.truth_(or__3548__auto____101664)) {
      return or__3548__auto____101664
    }else {
      var or__3548__auto____101665 = name__101662[name__101662.length - 1] === ":";
      if(cljs.core.truth_(or__3548__auto____101665)) {
        return or__3548__auto____101665
      }else {
        return cljs.core.not.call(null, token__101660.indexOf("::", 1) === -1)
      }
    }
  }())) {
    return cljs.reader.reader_error.call(null, reader, "Invalid token: ", token__101660)
  }else {
    if(cljs.core.truth_(cljs.reader.ns_QMARK_)) {
      return cljs.core.keyword.call(null, ns__101661.substring(0, ns__101661.indexOf("/")), name__101662)
    }else {
      return cljs.core.keyword.call(null, token__101660)
    }
  }
};
cljs.reader.desugar_meta = function desugar_meta(f) {
  if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, f))) {
    return cljs.core.ObjMap.fromObject(["\ufdd0'tag"], {"\ufdd0'tag":f})
  }else {
    if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, f))) {
      return cljs.core.ObjMap.fromObject(["\ufdd0'tag"], {"\ufdd0'tag":f})
    }else {
      if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, f))) {
        return cljs.core.HashMap.fromArrays([f], [true])
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          return f
        }else {
          return null
        }
      }
    }
  }
};
cljs.reader.wrapping_reader = function wrapping_reader(sym) {
  return function(rdr, _) {
    return cljs.core.list.call(null, sym, cljs.reader.read.call(null, rdr, true, null, true))
  }
};
cljs.reader.throwing_reader = function throwing_reader(msg) {
  return function(rdr, _) {
    return cljs.reader.reader_error.call(null, rdr, msg)
  }
};
cljs.reader.read_meta = function read_meta(rdr, _) {
  var m__101666 = cljs.reader.desugar_meta.call(null, cljs.reader.read.call(null, rdr, true, null, true));
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, m__101666))) {
  }else {
    cljs.reader.reader_error.call(null, rdr, "Metadata must be Symbol,Keyword,String or Map")
  }
  var o__101667 = cljs.reader.read.call(null, rdr, true, null, true);
  if(cljs.core.truth_(function() {
    var x__451__auto____101668 = o__101667;
    if(cljs.core.truth_(function() {
      var and__3546__auto____101669 = x__451__auto____101668;
      if(cljs.core.truth_(and__3546__auto____101669)) {
        var and__3546__auto____101670 = x__451__auto____101668.cljs$core$IWithMeta$;
        if(cljs.core.truth_(and__3546__auto____101670)) {
          return cljs.core.not.call(null, x__451__auto____101668.hasOwnProperty("cljs$core$IWithMeta$"))
        }else {
          return and__3546__auto____101670
        }
      }else {
        return and__3546__auto____101669
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, x__451__auto____101668)
    }
  }())) {
    return cljs.core.with_meta.call(null, o__101667, cljs.core.merge.call(null, cljs.core.meta.call(null, o__101667), m__101666))
  }else {
    return cljs.reader.reader_error.call(null, rdr, "Metadata can only be applied to IWithMetas")
  }
};
cljs.reader.read_set = function read_set(rdr, _) {
  return cljs.core.set.call(null, cljs.reader.read_delimited_list.call(null, "}", rdr, true))
};
cljs.reader.read_regex = function read_regex(rdr, ch) {
  return cljs.core.re_pattern.call(null, cljs.reader.read_string.call(null, rdr, ch))
};
cljs.reader.read_discard = function read_discard(rdr, _) {
  cljs.reader.read.call(null, rdr, true, null, true);
  return rdr
};
cljs.reader.macros = cljs.core.HashMap.fromArrays(["@", "`", '"', "#", "%", "'", "(", ")", ":", ";", "[", "{", "\\", "]", "}", "^", "~"], [cljs.reader.wrapping_reader.call(null, "\ufdd1'deref"), cljs.reader.not_implemented, cljs.reader.read_string, cljs.reader.read_dispatch, cljs.reader.not_implemented, cljs.reader.wrapping_reader.call(null, "\ufdd1'quote"), cljs.reader.read_list, cljs.reader.read_unmatched_delimiter, cljs.reader.read_keyword, cljs.reader.not_implemented, cljs.reader.read_vector, 
cljs.reader.read_map, cljs.reader.read_char, cljs.reader.read_unmatched_delimiter, cljs.reader.read_unmatched_delimiter, cljs.reader.read_meta, cljs.reader.not_implemented]);
cljs.reader.dispatch_macros = cljs.core.ObjMap.fromObject(["{", "<", '"', "!", "_"], {"{":cljs.reader.read_set, "<":cljs.reader.throwing_reader.call(null, "Unreadable form"), '"':cljs.reader.read_regex, "!":cljs.reader.read_comment, "_":cljs.reader.read_discard});
cljs.reader.read = function read(reader, eof_is_error, sentinel, is_recursive) {
  while(true) {
    var ch__101671 = cljs.reader.read_char.call(null, reader);
    if(cljs.core.truth_(ch__101671 === null)) {
      if(cljs.core.truth_(eof_is_error)) {
        return cljs.reader.reader_error.call(null, reader, "EOF")
      }else {
        return sentinel
      }
    }else {
      if(cljs.core.truth_(cljs.reader.whitespace_QMARK_.call(null, ch__101671))) {
        var G__101673 = reader;
        var G__101674 = eof_is_error;
        var G__101675 = sentinel;
        var G__101676 = is_recursive;
        reader = G__101673;
        eof_is_error = G__101674;
        sentinel = G__101675;
        is_recursive = G__101676;
        continue
      }else {
        if(cljs.core.truth_(cljs.reader.comment_prefix_QMARK_.call(null, ch__101671))) {
          var G__101677 = cljs.reader.read_comment.call(null, reader, ch__101671);
          var G__101678 = eof_is_error;
          var G__101679 = sentinel;
          var G__101680 = is_recursive;
          reader = G__101677;
          eof_is_error = G__101678;
          sentinel = G__101679;
          is_recursive = G__101680;
          continue
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            var res__101672 = cljs.core.truth_(cljs.reader.macros.call(null, ch__101671)) ? cljs.reader.macros.call(null, ch__101671).call(null, reader, ch__101671) : cljs.core.truth_(cljs.reader.number_literal_QMARK_.call(null, reader, ch__101671)) ? cljs.reader.read_number.call(null, reader, ch__101671) : cljs.core.truth_("\ufdd0'else") ? cljs.reader.read_symbol.call(null, reader, ch__101671) : null;
            if(cljs.core.truth_(cljs.core._EQ_.call(null, res__101672, reader))) {
              var G__101681 = reader;
              var G__101682 = eof_is_error;
              var G__101683 = sentinel;
              var G__101684 = is_recursive;
              reader = G__101681;
              eof_is_error = G__101682;
              sentinel = G__101683;
              is_recursive = G__101684;
              continue
            }else {
              return res__101672
            }
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
cljs.reader.read_string = function read_string(s) {
  var r__101685 = cljs.reader.push_back_reader.call(null, s);
  return cljs.reader.read.call(null, r__101685, true, null, false)
};
goog.provide("tatame.client.model");
goog.require("cljs.core");
goog.require("waltz.state");
goog.require("cljs.reader");
goog.require("waltz.state");
goog.require("tatame.client.views");
tatame.client.model.log = function log() {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, location.hostname, "localhost"))) {
    return console.log(arguments)
  }else {
    return null
  }
};
tatame.client.model.app = waltz.state.machine.call(null, "\ufdd0'app");
var s__3278__auto____99753 = waltz.state.out_STAR_.call(null, waltz.state.in_STAR_.call(null, waltz.state.state_STAR_.call(null), function() {
  tatame.client.model.log.call(null, "loading");
  return tatame.client.views.render.call(null, tatame.client.views.loading)
}), function() {
  return tatame.client.model.log.call(null, "loaded")
});
waltz.state.add_state.call(null, tatame.client.model.app, "\ufdd0'loading", s__3278__auto____99753);
waltz.state.add_transition.call(null, tatame.client.model.app, "\ufdd0'connect", function() {
  return waltz.state.unset.call(null, tatame.client.model.app, "\ufdd0'loading")
});
waltz.state.add_transition.call(null, tatame.client.model.app, "\ufdd0'navigate", function(token) {
  return null
});
tatame.client.model.worker = cljs.core.atom.call(null, null);
tatame.client.model.client_id = cljs.core.atom.call(null, null);
tatame.client.model.emit_event_BANG_ = function emit_event_BANG_(data) {
  if(cljs.core.truth_(cljs.core.deref.call(null, tatame.client.model.worker))) {
    return cljs.core.deref.call(null, tatame.client.model.worker).postMessage(data)
  }else {
    return null
  }
};
tatame.client.model.on_hello = function on_hello(data) {
  var temp__3695__auto____99754 = cljs.core.deref.call(null, tatame.client.model.client_id);
  if(cljs.core.truth_(temp__3695__auto____99754)) {
    var current_client_id__99755 = temp__3695__auto____99754;
    return cljs.core.deref.call(null, tatame.client.model.worker).postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'command", "\ufdd0'client-id"], {"\ufdd0'command":"hello", "\ufdd0'client-id":current_client_id__99755})))
  }else {
    var temp__3695__auto____99756 = "\ufdd0'client-id".call(null, data);
    if(cljs.core.truth_(temp__3695__auto____99756)) {
      var id__99757 = temp__3695__auto____99756;
      return cljs.core.swap_BANG_.call(null, tatame.client.model.client_id, function() {
        localStorage.setItem("client-id", id__99757);
        goog.net.cookies.set("client-id", cljs.core.deref.call(null, tatame.client.model.client_id));
        return id__99757
      })
    }else {
      return null
    }
  }
};
tatame.client.model.on_client_message = function on_client_message(data) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "\ufdd0'event".call(null, data), "onopen"))) {
    waltz.state.transition.call(null, tatame.client.model.app, "\ufdd0'connect")
  }else {
  }
  return tatame.client.model.log.call(null, "on client message", data)
};
tatame.client.model.on_server_message = function on_server_message(p__99758) {
  var data__99759 = p__99758;
  var data__99760 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, data__99759)) ? cljs.core.apply.call(null, cljs.core.hash_map, data__99759) : data__99759;
  var event__99761 = cljs.core.get.call(null, data__99760, "\ufdd0'event");
  tatame.client.model.log.call(null, "on server message", cljs.core.pr_str.call(null, data__99760));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, event__99761, "hello"))) {
    return tatame.client.model.on_hello.call(null, data__99760)
  }else {
    return null
  }
};
tatame.client.model.on_ws_message = function on_ws_message(e) {
  var data__99762 = cljs.reader.read_string.call(null, e.data);
  var temp__3695__auto____99763 = "\ufdd0'type".call(null, data__99762);
  if(cljs.core.truth_(temp__3695__auto____99763)) {
    var type__99764 = temp__3695__auto____99763;
    if(cljs.core.truth_(cljs.core._EQ_.call(null, type__99764, "server"))) {
      return tatame.client.model.on_server_message.call(null, cljs.reader.read_string.call(null, "\ufdd0'data".call(null, data__99762)))
    }else {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, type__99764, "client"))) {
        return tatame.client.model.on_client_message.call(null, data__99762)
      }else {
        return null
      }
    }
  }else {
    return console.log("on generic message", data__99762)
  }
};
tatame.client.model.init_BANG_ = function init_BANG_() {
  var temp__3695__auto____99765 = localStorage.getItem("client-id");
  if(cljs.core.truth_(temp__3695__auto____99765)) {
    var local_id__99766 = temp__3695__auto____99765;
    cljs.core.reset_BANG_.call(null, tatame.client.model.client_id, local_id__99766)
  }else {
    goog.net.cookies.set("client-id", tatame.client.model.local_id)
  }
  cljs.core.swap_BANG_.call(null, tatame.client.model.worker, function() {
    return new Worker("/javascripts/worker.js")
  });
  var G__99767__99768 = cljs.core.deref.call(null, tatame.client.model.worker);
  G__99767__99768.addEventListener("message", tatame.client.model.on_ws_message);
  return G__99767__99768
};
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose;
goog.disposable.IDisposable.prototype.isDisposed;
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if(goog.Disposable.ENABLE_MONITORING) {
    goog.Disposable.instances_[goog.getUid(this)] = this
  }
};
goog.Disposable.ENABLE_MONITORING = false;
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for(var id in goog.Disposable.instances_) {
    if(goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)])
    }
  }
  return ret
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {}
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if(!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if(goog.Disposable.ENABLE_MONITORING) {
      var uid = goog.getUid(this);
      if(!goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid]
    }
  }
};
goog.Disposable.prototype.disposeInternal = function() {
};
goog.dispose = function(obj) {
  if(obj && typeof obj.dispose == "function") {
    obj.dispose()
  }
};
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  var transformer = goog.bind(monitor.wrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var transformer = goog.bind(monitor.unwrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
};
goog.provide("goog.debug.errorHandlerWeakDep");
goog.debug.errorHandlerWeakDep = {protectEntryPoint:function(fn, opt_tracers) {
  return fn
}};
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isVersion("9"), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersion("8")};
goog.provide("goog.events.Event");
goog.require("goog.Disposable");
goog.events.Event = function(type, opt_target) {
  goog.Disposable.call(this);
  this.type = type;
  this.target = opt_target;
  this.currentTarget = this.target
};
goog.inherits(goog.events.Event, goog.Disposable);
goog.events.Event.prototype.disposeInternal = function() {
  delete this.type;
  delete this.target;
  delete this.currentTarget
};
goog.events.Event.prototype.propagationStopped_ = false;
goog.events.Event.prototype.returnValue_ = true;
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true
};
goog.events.Event.prototype.preventDefault = function() {
  this.returnValue_ = false
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation()
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault()
};
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", SELECTSTART:"selectstart", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", CHANGE:"change", SELECT:"select", SUBMIT:"submit", INPUT:"input", PROPERTYCHANGE:"propertychange", 
DRAGSTART:"dragstart", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", CONTEXTMENU:"contextmenu", ERROR:"error", HELP:"help", LOAD:"load", LOSECAPTURE:"losecapture", READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", 
MESSAGE:"message", CONNECT:"connect"};
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object
};
goog.reflect.sinkValue = new Function("a", "return a");
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  if(opt_e) {
    this.init(opt_e, opt_currentTarget)
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.target = null;
goog.events.BrowserEvent.prototype.currentTarget;
goog.events.BrowserEvent.prototype.relatedTarget = null;
goog.events.BrowserEvent.prototype.offsetX = 0;
goog.events.BrowserEvent.prototype.offsetY = 0;
goog.events.BrowserEvent.prototype.clientX = 0;
goog.events.BrowserEvent.prototype.clientY = 0;
goog.events.BrowserEvent.prototype.screenX = 0;
goog.events.BrowserEvent.prototype.screenY = 0;
goog.events.BrowserEvent.prototype.button = 0;
goog.events.BrowserEvent.prototype.keyCode = 0;
goog.events.BrowserEvent.prototype.charCode = 0;
goog.events.BrowserEvent.prototype.ctrlKey = false;
goog.events.BrowserEvent.prototype.altKey = false;
goog.events.BrowserEvent.prototype.shiftKey = false;
goog.events.BrowserEvent.prototype.metaKey = false;
goog.events.BrowserEvent.prototype.state;
goog.events.BrowserEvent.prototype.platformModifierKey = false;
goog.events.BrowserEvent.prototype.event_ = null;
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  goog.events.Event.call(this, type);
  this.target = e.target || e.srcElement;
  this.currentTarget = opt_currentTarget;
  var relatedTarget = e.relatedTarget;
  if(relatedTarget) {
    if(goog.userAgent.GECKO) {
      try {
        goog.reflect.sinkValue(relatedTarget.nodeName)
      }catch(err) {
        relatedTarget = null
      }
    }
  }else {
    if(type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement
    }else {
      if(type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement
      }
    }
  }
  this.relatedTarget = relatedTarget;
  this.offsetX = e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  delete this.returnValue_;
  delete this.propagationStopped_
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if(!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if(this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT
    }else {
      return!!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button])
    }
  }else {
    return this.event_.button == button
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey)
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if(this.event_.stopPropagation) {
    this.event_.stopPropagation()
  }else {
    this.event_.cancelBubble = true
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if(!be.preventDefault) {
    be.returnValue = false;
    if(goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if(be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1
        }
      }catch(ex) {
      }
    }
  }else {
    be.preventDefault()
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_
};
goog.events.BrowserEvent.prototype.disposeInternal = function() {
  goog.events.BrowserEvent.superClass_.disposeInternal.call(this);
  this.event_ = null;
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null
};
goog.provide("goog.events.EventWrapper");
goog.events.EventWrapper = function() {
};
goog.events.EventWrapper.prototype.listen = function(src, listener, opt_capt, opt_scope, opt_eventHandler) {
};
goog.events.EventWrapper.prototype.unlisten = function(src, listener, opt_capt, opt_scope, opt_eventHandler) {
};
goog.provide("goog.events.Listener");
goog.events.Listener = function() {
};
goog.events.Listener.counter_ = 0;
goog.events.Listener.prototype.isFunctionListener_;
goog.events.Listener.prototype.listener;
goog.events.Listener.prototype.proxy;
goog.events.Listener.prototype.src;
goog.events.Listener.prototype.type;
goog.events.Listener.prototype.capture;
goog.events.Listener.prototype.handler;
goog.events.Listener.prototype.key = 0;
goog.events.Listener.prototype.removed = false;
goog.events.Listener.prototype.callOnce = false;
goog.events.Listener.prototype.init = function(listener, proxy, src, type, capture, opt_handler) {
  if(goog.isFunction(listener)) {
    this.isFunctionListener_ = true
  }else {
    if(listener && listener.handleEvent && goog.isFunction(listener.handleEvent)) {
      this.isFunctionListener_ = false
    }else {
      throw Error("Invalid listener argument");
    }
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.callOnce = false;
  this.key = ++goog.events.Listener.counter_;
  this.removed = false
};
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if(this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject)
  }
  return this.listener.handleEvent.call(this.listener, eventObject)
};
goog.provide("goog.structs.SimplePool");
goog.require("goog.Disposable");
goog.structs.SimplePool = function(initialCount, maxCount) {
  goog.Disposable.call(this);
  this.maxCount_ = maxCount;
  this.freeQueue_ = [];
  this.createInitial_(initialCount)
};
goog.inherits(goog.structs.SimplePool, goog.Disposable);
goog.structs.SimplePool.prototype.createObjectFn_ = null;
goog.structs.SimplePool.prototype.disposeObjectFn_ = null;
goog.structs.SimplePool.prototype.setCreateObjectFn = function(createObjectFn) {
  this.createObjectFn_ = createObjectFn
};
goog.structs.SimplePool.prototype.setDisposeObjectFn = function(disposeObjectFn) {
  this.disposeObjectFn_ = disposeObjectFn
};
goog.structs.SimplePool.prototype.getObject = function() {
  if(this.freeQueue_.length) {
    return this.freeQueue_.pop()
  }
  return this.createObject()
};
goog.structs.SimplePool.prototype.releaseObject = function(obj) {
  if(this.freeQueue_.length < this.maxCount_) {
    this.freeQueue_.push(obj)
  }else {
    this.disposeObject(obj)
  }
};
goog.structs.SimplePool.prototype.createInitial_ = function(initialCount) {
  if(initialCount > this.maxCount_) {
    throw Error("[goog.structs.SimplePool] Initial cannot be greater than max");
  }
  for(var i = 0;i < initialCount;i++) {
    this.freeQueue_.push(this.createObject())
  }
};
goog.structs.SimplePool.prototype.createObject = function() {
  if(this.createObjectFn_) {
    return this.createObjectFn_()
  }else {
    return{}
  }
};
goog.structs.SimplePool.prototype.disposeObject = function(obj) {
  if(this.disposeObjectFn_) {
    this.disposeObjectFn_(obj)
  }else {
    if(goog.isObject(obj)) {
      if(goog.isFunction(obj.dispose)) {
        obj.dispose()
      }else {
        for(var i in obj) {
          delete obj[i]
        }
      }
    }
  }
};
goog.structs.SimplePool.prototype.disposeInternal = function() {
  goog.structs.SimplePool.superClass_.disposeInternal.call(this);
  var freeQueue = this.freeQueue_;
  while(freeQueue.length) {
    this.disposeObject(freeQueue.pop())
  }
  delete this.freeQueue_
};
goog.provide("goog.events.pools");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.Listener");
goog.require("goog.structs.SimplePool");
goog.require("goog.userAgent.jscript");
goog.events.ASSUME_GOOD_GC = false;
goog.events.pools.getObject;
goog.events.pools.releaseObject;
goog.events.pools.getArray;
goog.events.pools.releaseArray;
goog.events.pools.getProxy;
goog.events.pools.setProxyCallbackFunction;
goog.events.pools.releaseProxy;
goog.events.pools.getListener;
goog.events.pools.releaseListener;
goog.events.pools.getEvent;
goog.events.pools.releaseEvent;
(function() {
  var BAD_GC = !goog.events.ASSUME_GOOD_GC && goog.userAgent.jscript.HAS_JSCRIPT && !goog.userAgent.jscript.isVersion("5.7");
  function getObject() {
    return{count_:0, remaining_:0}
  }
  function getArray() {
    return[]
  }
  var proxyCallbackFunction;
  goog.events.pools.setProxyCallbackFunction = function(cb) {
    proxyCallbackFunction = cb
  };
  function getProxy() {
    var f = function(eventObject) {
      return proxyCallbackFunction.call(f.src, f.key, eventObject)
    };
    return f
  }
  function getListener() {
    return new goog.events.Listener
  }
  function getEvent() {
    return new goog.events.BrowserEvent
  }
  if(!BAD_GC) {
    goog.events.pools.getObject = getObject;
    goog.events.pools.releaseObject = goog.nullFunction;
    goog.events.pools.getArray = getArray;
    goog.events.pools.releaseArray = goog.nullFunction;
    goog.events.pools.getProxy = getProxy;
    goog.events.pools.releaseProxy = goog.nullFunction;
    goog.events.pools.getListener = getListener;
    goog.events.pools.releaseListener = goog.nullFunction;
    goog.events.pools.getEvent = getEvent;
    goog.events.pools.releaseEvent = goog.nullFunction
  }else {
    goog.events.pools.getObject = function() {
      return objectPool.getObject()
    };
    goog.events.pools.releaseObject = function(obj) {
      objectPool.releaseObject(obj)
    };
    goog.events.pools.getArray = function() {
      return arrayPool.getObject()
    };
    goog.events.pools.releaseArray = function(obj) {
      arrayPool.releaseObject(obj)
    };
    goog.events.pools.getProxy = function() {
      return proxyPool.getObject()
    };
    goog.events.pools.releaseProxy = function(obj) {
      proxyPool.releaseObject(getProxy())
    };
    goog.events.pools.getListener = function() {
      return listenerPool.getObject()
    };
    goog.events.pools.releaseListener = function(obj) {
      listenerPool.releaseObject(obj)
    };
    goog.events.pools.getEvent = function() {
      return eventPool.getObject()
    };
    goog.events.pools.releaseEvent = function(obj) {
      eventPool.releaseObject(obj)
    };
    var OBJECT_POOL_INITIAL_COUNT = 0;
    var OBJECT_POOL_MAX_COUNT = 600;
    var objectPool = new goog.structs.SimplePool(OBJECT_POOL_INITIAL_COUNT, OBJECT_POOL_MAX_COUNT);
    objectPool.setCreateObjectFn(getObject);
    var ARRAY_POOL_INITIAL_COUNT = 0;
    var ARRAY_POOL_MAX_COUNT = 600;
    var arrayPool = new goog.structs.SimplePool(ARRAY_POOL_INITIAL_COUNT, ARRAY_POOL_MAX_COUNT);
    arrayPool.setCreateObjectFn(getArray);
    var HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT = 0;
    var HANDLE_EVENT_PROXY_POOL_MAX_COUNT = 600;
    var proxyPool = new goog.structs.SimplePool(HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT, HANDLE_EVENT_PROXY_POOL_MAX_COUNT);
    proxyPool.setCreateObjectFn(getProxy);
    var LISTENER_POOL_INITIAL_COUNT = 0;
    var LISTENER_POOL_MAX_COUNT = 600;
    var listenerPool = new goog.structs.SimplePool(LISTENER_POOL_INITIAL_COUNT, LISTENER_POOL_MAX_COUNT);
    listenerPool.setCreateObjectFn(getListener);
    var EVENT_POOL_INITIAL_COUNT = 0;
    var EVENT_POOL_MAX_COUNT = 600;
    var eventPool = new goog.structs.SimplePool(EVENT_POOL_INITIAL_COUNT, EVENT_POOL_MAX_COUNT);
    eventPool.setCreateObjectFn(getEvent)
  }
})();
goog.provide("goog.events");
goog.require("goog.array");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.debug.errorHandlerWeakDep");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.Event");
goog.require("goog.events.EventWrapper");
goog.require("goog.events.pools");
goog.require("goog.object");
goog.require("goog.userAgent");
goog.events.listeners_ = {};
goog.events.listenerTree_ = {};
goog.events.sources_ = {};
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.keySeparator_ = "_";
goog.events.requiresSyntheticEventPropagation_;
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if(!type) {
    throw Error("Invalid event type");
  }else {
    if(goog.isArray(type)) {
      for(var i = 0;i < type.length;i++) {
        goog.events.listen(src, type[i], listener, opt_capt, opt_handler)
      }
      return null
    }else {
      var capture = !!opt_capt;
      var map = goog.events.listenerTree_;
      if(!(type in map)) {
        map[type] = goog.events.pools.getObject()
      }
      map = map[type];
      if(!(capture in map)) {
        map[capture] = goog.events.pools.getObject();
        map.count_++
      }
      map = map[capture];
      var srcUid = goog.getUid(src);
      var listenerArray, listenerObj;
      map.remaining_++;
      if(!map[srcUid]) {
        listenerArray = map[srcUid] = goog.events.pools.getArray();
        map.count_++
      }else {
        listenerArray = map[srcUid];
        for(var i = 0;i < listenerArray.length;i++) {
          listenerObj = listenerArray[i];
          if(listenerObj.listener == listener && listenerObj.handler == opt_handler) {
            if(listenerObj.removed) {
              break
            }
            return listenerArray[i].key
          }
        }
      }
      var proxy = goog.events.pools.getProxy();
      proxy.src = src;
      listenerObj = goog.events.pools.getListener();
      listenerObj.init(listener, proxy, src, type, capture, opt_handler);
      var key = listenerObj.key;
      proxy.key = key;
      listenerArray.push(listenerObj);
      goog.events.listeners_[key] = listenerObj;
      if(!goog.events.sources_[srcUid]) {
        goog.events.sources_[srcUid] = goog.events.pools.getArray()
      }
      goog.events.sources_[srcUid].push(listenerObj);
      if(src.addEventListener) {
        if(src == goog.global || !src.customEvent_) {
          src.addEventListener(type, proxy, capture)
        }
      }else {
        src.attachEvent(goog.events.getOnString_(type), proxy)
      }
      return key
    }
  }
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler);
  var listenerObj = goog.events.listeners_[key];
  listenerObj.callOnce = true;
  return key
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler)
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(!listenerArray) {
    return false
  }
  for(var i = 0;i < listenerArray.length;i++) {
    if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i].key)
    }
  }
  return false
};
goog.events.unlistenByKey = function(key) {
  if(!goog.events.listeners_[key]) {
    return false
  }
  var listener = goog.events.listeners_[key];
  if(listener.removed) {
    return false
  }
  var src = listener.src;
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;
  if(src.removeEventListener) {
    if(src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture)
    }
  }else {
    if(src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy)
    }
  }
  var srcUid = goog.getUid(src);
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];
  if(goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if(sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid]
    }
  }
  listener.removed = true;
  listenerArray.needsCleanup_ = true;
  goog.events.cleanUp_(type, capture, srcUid, listenerArray);
  delete goog.events.listeners_[key];
  return true
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler)
};
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  if(!listenerArray.locked_) {
    if(listenerArray.needsCleanup_) {
      for(var oldIndex = 0, newIndex = 0;oldIndex < listenerArray.length;oldIndex++) {
        if(listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          goog.events.pools.releaseProxy(proxy);
          goog.events.pools.releaseListener(listenerArray[oldIndex]);
          continue
        }
        if(oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex]
        }
        newIndex++
      }
      listenerArray.length = newIndex;
      listenerArray.needsCleanup_ = false;
      if(newIndex == 0) {
        goog.events.pools.releaseArray(listenerArray);
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;
        if(goog.events.listenerTree_[type][capture].count_ == 0) {
          goog.events.pools.releaseObject(goog.events.listenerTree_[type][capture]);
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--
        }
        if(goog.events.listenerTree_[type].count_ == 0) {
          goog.events.pools.releaseObject(goog.events.listenerTree_[type]);
          delete goog.events.listenerTree_[type]
        }
      }
    }
  }
};
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) {
  var count = 0;
  var noObj = opt_obj == null;
  var noType = opt_type == null;
  var noCapt = opt_capt == null;
  opt_capt = !!opt_capt;
  if(!noObj) {
    var srcUid = goog.getUid(opt_obj);
    if(goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for(var i = sourcesArray.length - 1;i >= 0;i--) {
        var listener = sourcesArray[i];
        if((noType || opt_type == listener.type) && (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++
        }
      }
    }
  }else {
    goog.object.forEach(goog.events.sources_, function(listeners) {
      for(var i = listeners.length - 1;i >= 0;i--) {
        var listener = listeners[i];
        if((noType || opt_type == listener.type) && (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++
        }
      }
    })
  }
  return count
};
goog.events.getListeners = function(obj, type, capture) {
  return goog.events.getListeners_(obj, type, capture) || []
};
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if(map[objUid]) {
        return map[objUid]
      }
    }
  }
  return null
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(listenerArray) {
    for(var i = 0;i < listenerArray.length;i++) {
      if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
        return listenerArray[i]
      }
    }
  }
  return null
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];
  if(listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);
    if(hasType && hasCapture) {
      var map = goog.events.listenerTree_[opt_type];
      return!!map && !!map[opt_capture] && objUid in map[opt_capture]
    }else {
      if(!(hasType || hasCapture)) {
        return true
      }else {
        return goog.array.some(listeners, function(listener) {
          return hasType && listener.type == opt_type || hasCapture && listener.capture == opt_capture
        })
      }
    }
  }
  return false
};
goog.events.expose = function(e) {
  var str = [];
  for(var key in e) {
    if(e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")")
    }else {
      str.push(key + " = " + e[key])
    }
  }
  return str.join("\n")
};
goog.events.getOnString_ = function(type) {
  if(type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type]
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type, capture, eventObject)
    }
  }
  return true
};
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;
  var objUid = goog.getUid(obj);
  if(map[objUid]) {
    map.remaining_--;
    var listenerArray = map[objUid];
    if(!listenerArray.locked_) {
      listenerArray.locked_ = 1
    }else {
      listenerArray.locked_++
    }
    try {
      var length = listenerArray.length;
      for(var i = 0;i < length;i++) {
        var listener = listenerArray[i];
        if(listener && !listener.removed) {
          retval &= goog.events.fireListener(listener, eventObject) !== false
        }
      }
    }finally {
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray)
    }
  }
  return Boolean(retval)
};
goog.events.fireListener = function(listener, eventObject) {
  var rv = listener.handleEvent(eventObject);
  if(listener.callOnce) {
    goog.events.unlistenByKey(listener.key)
  }
  return rv
};
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_)
};
goog.events.dispatchEvent = function(src, e) {
  var type = e.type || e;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  if(goog.isString(e)) {
    e = new goog.events.Event(e, src)
  }else {
    if(!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event(type, src);
      goog.object.extend(e, oldEvent)
    }else {
      e.target = e.target || src
    }
  }
  var rv = 1, ancestors;
  map = map[type];
  var hasCapture = true in map;
  var targetsMap;
  if(hasCapture) {
    ancestors = [];
    for(var parent = src;parent;parent = parent.getParentEventTarget()) {
      ancestors.push(parent)
    }
    targetsMap = map[true];
    targetsMap.remaining_ = targetsMap.count_;
    for(var i = ancestors.length - 1;!e.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, true, e) && e.returnValue_ != false
    }
  }
  var hasBubble = false in map;
  if(hasBubble) {
    targetsMap = map[false];
    targetsMap.remaining_ = targetsMap.count_;
    if(hasCapture) {
      for(var i = 0;!e.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, false, e) && e.returnValue_ != false
      }
    }else {
      for(var current = src;!e.propagationStopped_ && current && targetsMap.remaining_;current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners_(targetsMap, current, e.type, false, e) && e.returnValue_ != false
      }
    }
  }
  return Boolean(rv)
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_);
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_)
};
goog.events.handleBrowserEvent_ = function(key, opt_evt) {
  if(!goog.events.listeners_[key]) {
    return true
  }
  var listener = goog.events.listeners_[key];
  var type = listener.type;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  map = map[type];
  var retval, targetsMap;
  if(goog.events.synthesizeEventPropagation_()) {
    var ieEvent = opt_evt || goog.getObjectByName("window.event");
    var hasCapture = true in map;
    var hasBubble = false in map;
    if(hasCapture) {
      if(goog.events.isMarkedIeEvent_(ieEvent)) {
        return true
      }
      goog.events.markIeEvent_(ieEvent)
    }
    var evt = goog.events.pools.getEvent();
    evt.init(ieEvent, this);
    retval = true;
    try {
      if(hasCapture) {
        var ancestors = goog.events.pools.getArray();
        for(var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent)
        }
        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;
        for(var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, true, evt)
        }
        if(hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;
          for(var i = 0;!evt.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, false, evt)
          }
        }
      }else {
        retval = goog.events.fireListener(listener, evt)
      }
    }finally {
      if(ancestors) {
        ancestors.length = 0;
        goog.events.pools.releaseArray(ancestors)
      }
      evt.dispose();
      goog.events.pools.releaseEvent(evt)
    }
    return retval
  }
  var be = new goog.events.BrowserEvent(opt_evt, this);
  try {
    retval = goog.events.fireListener(listener, be)
  }finally {
    be.dispose()
  }
  return retval
};
goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_);
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if(e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return
    }catch(ex) {
      useReturnValue = true
    }
  }
  if(useReturnValue || e.returnValue == undefined) {
    e.returnValue = true
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++
};
goog.events.synthesizeEventPropagation_ = function() {
  if(goog.events.requiresSyntheticEventPropagation_ === undefined) {
    goog.events.requiresSyntheticEventPropagation_ = goog.userAgent.IE && !goog.global["addEventListener"]
  }
  return goog.events.requiresSyntheticEventPropagation_
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_);
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_)
});
goog.provide("goog.events.EventTarget");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.events.EventTarget = function() {
  goog.Disposable.call(this)
};
goog.inherits(goog.events.EventTarget, goog.Disposable);
goog.events.EventTarget.prototype.customEvent_ = true;
goog.events.EventTarget.prototype.parentEventTarget_ = null;
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_
};
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent
};
goog.events.EventTarget.prototype.addEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.removeEventListener = function(type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope)
};
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  return goog.events.dispatchEvent(this, e)
};
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  goog.events.removeAll(this);
  this.parentEventTarget_ = null
};
goog.provide("goog.Timer");
goog.require("goog.events.EventTarget");
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);
  this.interval_ = opt_interval || 1;
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;
  this.boundTick_ = goog.bind(this.tick_, this);
  this.last_ = goog.now()
};
goog.inherits(goog.Timer, goog.events.EventTarget);
goog.Timer.MAX_TIMEOUT_ = 2147483647;
goog.Timer.prototype.enabled = false;
goog.Timer.defaultTimerObject = goog.global["window"];
goog.Timer.intervalScale = 0.8;
goog.Timer.prototype.timer_ = null;
goog.Timer.prototype.getInterval = function() {
  return this.interval_
};
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if(this.timer_ && this.enabled) {
    this.stop();
    this.start()
  }else {
    if(this.timer_) {
      this.stop()
    }
  }
};
goog.Timer.prototype.tick_ = function() {
  if(this.enabled) {
    var elapsed = goog.now() - this.last_;
    if(elapsed > 0 && elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_ - elapsed);
      return
    }
    this.dispatchTick();
    if(this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
      this.last_ = goog.now()
    }
  }
};
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK)
};
goog.Timer.prototype.start = function() {
  this.enabled = true;
  if(!this.timer_) {
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_, this.interval_);
    this.last_ = goog.now()
  }
};
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if(this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null
  }
};
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_
};
goog.Timer.TICK = "tick";
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if(goog.isFunction(listener)) {
    if(opt_handler) {
      listener = goog.bind(listener, opt_handler)
    }
  }else {
    if(listener && typeof listener.handleEvent == "function") {
      listener = goog.bind(listener.handleEvent, listener)
    }else {
      throw Error("Invalid listener argument");
    }
  }
  if(opt_delay > goog.Timer.MAX_TIMEOUT_) {
    return-1
  }else {
    return goog.Timer.defaultTimerObject.setTimeout(listener, opt_delay || 0)
  }
};
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId)
};
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if(typeof col.getCount == "function") {
    return col.getCount()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return col.length
  }
  return goog.object.getCount(col)
};
goog.structs.getValues = function(col) {
  if(typeof col.getValues == "function") {
    return col.getValues()
  }
  if(goog.isString(col)) {
    return col.split("")
  }
  if(goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(col[i])
    }
    return rv
  }
  return goog.object.getValues(col)
};
goog.structs.getKeys = function(col) {
  if(typeof col.getKeys == "function") {
    return col.getKeys()
  }
  if(typeof col.getValues == "function") {
    return undefined
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(i)
    }
    return rv
  }
  return goog.object.getKeys(col)
};
goog.structs.contains = function(col, val) {
  if(typeof col.contains == "function") {
    return col.contains(val)
  }
  if(typeof col.containsValue == "function") {
    return col.containsValue(val)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(col, val)
  }
  return goog.object.containsValue(col, val)
};
goog.structs.isEmpty = function(col) {
  if(typeof col.isEmpty == "function") {
    return col.isEmpty()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(col)
  }
  return goog.object.isEmpty(col)
};
goog.structs.clear = function(col) {
  if(typeof col.clear == "function") {
    col.clear()
  }else {
    if(goog.isArrayLike(col)) {
      goog.array.clear(col)
    }else {
      goog.object.clear(col)
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if(typeof col.forEach == "function") {
    col.forEach(f, opt_obj)
  }else {
    if(goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach(col, f, opt_obj)
    }else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for(var i = 0;i < l;i++) {
        f.call(opt_obj, values[i], keys && keys[i], col)
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if(typeof col.filter == "function") {
    return col.filter(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(col, f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i]
      }
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i])
      }
    }
  }
  return rv
};
goog.structs.map = function(col, f, opt_obj) {
  if(typeof col.map == "function") {
    return col.map(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(col, f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col)
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col)
    }
  }
  return rv
};
goog.structs.some = function(col, f, opt_obj) {
  if(typeof col.some == "function") {
    return col.some(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(col, f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true
    }
  }
  return false
};
goog.structs.every = function(col, f, opt_obj) {
  if(typeof col.every == "function") {
    return col.every(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(col, f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false
    }
  }
  return true
};
goog.provide("goog.iter");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.iter.Iterable;
if("StopIteration" in goog.global) {
  goog.iter.StopIteration = goog.global["StopIteration"]
}else {
  goog.iter.StopIteration = Error("StopIteration")
}
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this
};
goog.iter.toIterator = function(iterable) {
  if(iterable instanceof goog.iter.Iterator) {
    return iterable
  }
  if(typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false)
  }
  if(goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while(true) {
        if(i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if(!(i in iterable)) {
          i++;
          continue
        }
        return iterable[i++]
      }
    };
    return newIter
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if(goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach(iterable, f, opt_obj)
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while(true) {
        f.call(opt_obj, iterable.next(), undefined, iterable)
      }
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      if(f.call(opt_obj, val, undefined, iterable)) {
        return val
      }
    }
  };
  return newIter
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if(arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop
  }
  if(step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if(step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv
  };
  return newIter
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator)
};
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable)
    }
  };
  return newIter
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val)
  });
  return rval
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true
};
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    try {
      if(i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next()
    }catch(ex) {
      if(ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      }else {
        i++;
        return this.next()
      }
    }
  };
  return newIter
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      if(dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue
      }else {
        dropping = false
      }
      return val
    }
  };
  return newIter
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while(true) {
      if(taking) {
        var val = iterable.next();
        if(f.call(opt_obj, val, undefined, iterable)) {
          return val
        }else {
          taking = false
        }
      }else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter
};
goog.iter.toArray = function(iterable) {
  if(goog.isArrayLike(iterable)) {
    return goog.array.toArray(iterable)
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val)
  });
  return array
};
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  try {
    while(true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if(val1 != val2) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }else {
      if(b1 && !b2) {
        return false
      }
      if(!b2) {
        try {
          val2 = iterable2.next();
          return false
        }catch(ex1) {
          if(ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          return true
        }
      }
    }
  }
  return false
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next()
  }catch(e) {
    if(e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return!arr.length
  });
  if(someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if(indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex]
      });
      for(var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if(indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break
        }
        if(i == 0) {
          indicies = null;
          break
        }
        indicies[i] = 0
      }
      return retVal
    }
    throw goog.iter.StopIteration;
  };
  return iter
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.require("goog.structs");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  var argLength = arguments.length;
  if(argLength > 1) {
    if(argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1])
    }
  }else {
    if(opt_map) {
      this.addAll(opt_map)
    }
  }
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function() {
  return this.count_
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key])
  }
  return rv
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return this.keys_.concat()
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key)
};
goog.structs.Map.prototype.containsValue = function(val) {
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if(goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true
    }
  }
  return false
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if(this === otherMap) {
    return true
  }
  if(this.count_ != otherMap.getCount()) {
    return false
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for(var key, i = 0;key = this.keys_[i];i++) {
    if(!equalityFn(this.get(key), otherMap.get(key))) {
      return false
    }
  }
  return true
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0
};
goog.structs.Map.prototype.remove = function(key) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if(this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_()
    }
    return true
  }
  return false
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if(this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
  if(this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key]
  }
  return opt_val
};
goog.structs.Map.prototype.set = function(key, value) {
  if(!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push(key);
    this.version_++
  }
  this.map_[key] = value
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if(map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues()
  }else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map)
  }
  for(var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i])
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key)
  }
  return transposed
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key]
  }
  return obj
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true)
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false)
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      if(version != selfObj.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if(i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key]
    }
  };
  return newIter
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
};
goog.provide("goog.structs.Set");
goog.require("goog.structs");
goog.require("goog.structs.Map");
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if(opt_values) {
    this.addAll(opt_values)
  }
};
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if(type == "object" && val || type == "function") {
    return"o" + goog.getUid(val)
  }else {
    return type.substr(0, 1) + val
  }
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount()
};
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element)
};
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    this.add(values[i])
  }
};
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    this.remove(values[i])
  }
};
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element))
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear()
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty()
};
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element))
};
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this)
};
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set;
  var values = goog.structs.getValues(col);
  for(var i = 0;i < values.length;i++) {
    var value = values[i];
    if(this.contains(value)) {
      result.add(value)
    }
  }
  return result
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues()
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this)
};
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col)
};
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if(this.getCount() > colCount) {
    return false
  }
  if(!(col instanceof goog.structs.Set) && colCount > 5) {
    col = new goog.structs.Set(col)
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value)
  })
};
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false)
};
goog.provide("goog.debug");
goog.require("goog.array");
goog.require("goog.string");
goog.require("goog.structs.Set");
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  target.onerror = function(message, url, line) {
    if(oldErrorHandler) {
      oldErrorHandler(message, url, line)
    }
    logFunc({message:message, fileName:url, line:line});
    return Boolean(opt_cancel)
  }
};
goog.debug.expose = function(obj, opt_showFn) {
  if(typeof obj == "undefined") {
    return"undefined"
  }
  if(obj == null) {
    return"NULL"
  }
  var str = [];
  for(var x in obj) {
    if(!opt_showFn && goog.isFunction(obj[x])) {
      continue
    }
    var s = x + " = ";
    try {
      s += obj[x]
    }catch(e) {
      s += "*** " + e + " ***"
    }
    str.push(s)
  }
  return str.join("\n")
};
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set;
  var str = [];
  var helper = function(obj, space) {
    var nestspace = space + "  ";
    var indentMultiline = function(str) {
      return str.replace(/\n/g, "\n" + space)
    };
    try {
      if(!goog.isDef(obj)) {
        str.push("undefined")
      }else {
        if(goog.isNull(obj)) {
          str.push("NULL")
        }else {
          if(goog.isString(obj)) {
            str.push('"' + indentMultiline(obj) + '"')
          }else {
            if(goog.isFunction(obj)) {
              str.push(indentMultiline(String(obj)))
            }else {
              if(goog.isObject(obj)) {
                if(previous.contains(obj)) {
                  str.push("*** reference loop detected ***")
                }else {
                  previous.add(obj);
                  str.push("{");
                  for(var x in obj) {
                    if(!opt_showFn && goog.isFunction(obj[x])) {
                      continue
                    }
                    str.push("\n");
                    str.push(nestspace);
                    str.push(x + " = ");
                    helper(obj[x], nestspace)
                  }
                  str.push("\n" + space + "}")
                }
              }else {
                str.push(obj)
              }
            }
          }
        }
      }
    }catch(e) {
      str.push("*** " + e + " ***")
    }
  };
  helper(obj, "");
  return str.join("")
};
goog.debug.exposeArray = function(arr) {
  var str = [];
  for(var i = 0;i < arr.length;i++) {
    if(goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]))
    }else {
      str.push(arr[i])
    }
  }
  return"[ " + str.join(", ") + " ]"
};
goog.debug.exposeException = function(err, opt_fn) {
  try {
    var e = goog.debug.normalizeErrorObject(err);
    var error = "Message: " + goog.string.htmlEscape(e.message) + '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' + e.fileName + "</a>\nLine: " + e.lineNumber + "\n\nBrowser stack:\n" + goog.string.htmlEscape(e.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + goog.string.htmlEscape(goog.debug.getStacktrace(opt_fn) + "-> ");
    return error
  }catch(e2) {
    return"Exception trying to expose exception! You win, we lose. " + e2
  }
};
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName("window.location.href");
  if(goog.isString(err)) {
    return{"message":err, "name":"Unknown error", "lineNumber":"Not available", "fileName":href, "stack":"Not available"}
  }
  var lineNumber, fileName;
  var threwError = false;
  try {
    lineNumber = err.lineNumber || err.line || "Not available"
  }catch(e) {
    lineNumber = "Not available";
    threwError = true
  }
  try {
    fileName = err.fileName || err.filename || err.sourceURL || href
  }catch(e) {
    fileName = "Not available";
    threwError = true
  }
  if(threwError || !err.lineNumber || !err.fileName || !err.stack) {
    return{"message":err.message, "name":err.name, "lineNumber":lineNumber, "fileName":fileName, "stack":err.stack || "Not available"}
  }
  return err
};
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == "string" ? Error(err) : err;
  if(!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller)
  }
  if(opt_message) {
    var x = 0;
    while(error["message" + x]) {
      ++x
    }
    error["message" + x] = String(opt_message)
  }
  return error
};
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;
  while(fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push("()\n");
    try {
      fn = fn.caller
    }catch(e) {
      sb.push("[exception trying to get caller]\n");
      break
    }
    depth++;
    if(depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push("[...long stack...]");
      break
    }
  }
  if(opt_depth && depth >= opt_depth) {
    sb.push("[...reached max depth limit...]")
  }else {
    sb.push("[end]")
  }
  return sb.join("")
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, [])
};
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];
  if(goog.array.contains(visited, fn)) {
    sb.push("[...circular reference...]")
  }else {
    if(fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
      sb.push(goog.debug.getFunctionName(fn) + "(");
      var args = fn.arguments;
      for(var i = 0;i < args.length;i++) {
        if(i > 0) {
          sb.push(", ")
        }
        var argDesc;
        var arg = args[i];
        switch(typeof arg) {
          case "object":
            argDesc = arg ? "object" : "null";
            break;
          case "string":
            argDesc = arg;
            break;
          case "number":
            argDesc = String(arg);
            break;
          case "boolean":
            argDesc = arg ? "true" : "false";
            break;
          case "function":
            argDesc = goog.debug.getFunctionName(arg);
            argDesc = argDesc ? argDesc : "[fn]";
            break;
          case "undefined":
          ;
          default:
            argDesc = typeof arg;
            break
        }
        if(argDesc.length > 40) {
          argDesc = argDesc.substr(0, 40) + "..."
        }
        sb.push(argDesc)
      }
      visited.push(fn);
      sb.push(")\n");
      try {
        sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited))
      }catch(e) {
        sb.push("[exception trying to get caller]\n")
      }
    }else {
      if(fn) {
        sb.push("[...long stack...]")
      }else {
        sb.push("[end]")
      }
    }
  }
  return sb.join("")
};
goog.debug.getFunctionName = function(fn) {
  var functionSource = String(fn);
  if(!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if(matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method
    }else {
      goog.debug.fnNameCache_[functionSource] = "[Anonymous]"
    }
  }
  return goog.debug.fnNameCache_[functionSource]
};
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]")
};
goog.debug.fnNameCache_ = {};
goog.provide("goog.debug.LogRecord");
goog.debug.LogRecord = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber)
};
goog.debug.LogRecord.prototype.time_;
goog.debug.LogRecord.prototype.level_;
goog.debug.LogRecord.prototype.msg_;
goog.debug.LogRecord.prototype.loggerName_;
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;
goog.debug.LogRecord.prototype.exception_ = null;
goog.debug.LogRecord.prototype.exceptionText_ = null;
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true;
goog.debug.LogRecord.nextSequenceNumber_ = 0;
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName, opt_time, opt_sequenceNumber) {
  if(goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == "number" ? opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++
  }
  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_
};
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_
};
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_
};
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception
};
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_
};
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text
};
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName
};
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_
};
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level
};
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_
};
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg
};
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_
};
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time
};
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_
};
goog.provide("goog.debug.LogBuffer");
goog.require("goog.asserts");
goog.require("goog.debug.LogRecord");
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(), "Cannot use goog.debug.LogBuffer without defining " + "goog.debug.LogBuffer.CAPACITY.");
  this.clear()
};
goog.debug.LogBuffer.getInstance = function() {
  if(!goog.debug.LogBuffer.instance_) {
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer
  }
  return goog.debug.LogBuffer.instance_
};
goog.debug.LogBuffer.CAPACITY = 0;
goog.debug.LogBuffer.prototype.buffer_;
goog.debug.LogBuffer.prototype.curIndex_;
goog.debug.LogBuffer.prototype.isFull_;
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if(this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] = new goog.debug.LogRecord(level, msg, loggerName)
};
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0
};
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false
};
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  if(!buffer[0]) {
    return
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func(buffer[i])
  }while(i != curIndex)
};
goog.provide("goog.debug.LogManager");
goog.provide("goog.debug.Logger");
goog.provide("goog.debug.Logger.Level");
goog.require("goog.array");
goog.require("goog.asserts");
goog.require("goog.debug");
goog.require("goog.debug.LogBuffer");
goog.require("goog.debug.LogRecord");
goog.debug.Logger = function(name) {
  this.name_ = name
};
goog.debug.Logger.prototype.parent_ = null;
goog.debug.Logger.prototype.level_ = null;
goog.debug.Logger.prototype.children_ = null;
goog.debug.Logger.prototype.handlers_ = null;
goog.debug.Logger.ENABLE_HIERARCHY = true;
if(!goog.debug.Logger.ENABLE_HIERARCHY) {
  goog.debug.Logger.rootHandlers_ = [];
  goog.debug.Logger.rootLevel_
}
goog.debug.Logger.Level = function(name, value) {
  this.name = name;
  this.value = value
};
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name
};
goog.debug.Logger.Level.OFF = new goog.debug.Logger.Level("OFF", Infinity);
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level("SHOUT", 1200);
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level("SEVERE", 1E3);
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level("WARNING", 900);
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level("INFO", 800);
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level("CONFIG", 700);
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level("FINE", 500);
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level("FINER", 400);
goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level("FINEST", 300);
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level("ALL", 0);
goog.debug.Logger.Level.PREDEFINED_LEVELS = [goog.debug.Logger.Level.OFF, goog.debug.Logger.Level.SHOUT, goog.debug.Logger.Level.SEVERE, goog.debug.Logger.Level.WARNING, goog.debug.Logger.Level.INFO, goog.debug.Logger.Level.CONFIG, goog.debug.Logger.Level.FINE, goog.debug.Logger.Level.FINER, goog.debug.Logger.Level.FINEST, goog.debug.Logger.Level.ALL];
goog.debug.Logger.Level.predefinedLevelsCache_ = null;
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for(var i = 0, level;level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level
  }
};
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if(!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_()
  }
  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null
};
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if(!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_()
  }
  if(value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value]
  }
  for(var i = 0;i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length;++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if(level.value <= value) {
      return level
    }
  }
  return null
};
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name)
};
goog.debug.Logger.prototype.getName = function() {
  return this.name_
};
goog.debug.Logger.prototype.addHandler = function(handler) {
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    if(!this.handlers_) {
      this.handlers_ = []
    }
    this.handlers_.push(handler)
  }else {
    goog.asserts.assert(!this.name_, "Cannot call addHandler on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
    goog.debug.Logger.rootHandlers_.push(handler)
  }
};
goog.debug.Logger.prototype.removeHandler = function(handler) {
  var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ : goog.debug.Logger.rootHandlers_;
  return!!handlers && goog.array.remove(handlers, handler)
};
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_
};
goog.debug.Logger.prototype.getChildren = function() {
  if(!this.children_) {
    this.children_ = {}
  }
  return this.children_
};
goog.debug.Logger.prototype.setLevel = function(level) {
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    this.level_ = level
  }else {
    goog.asserts.assert(!this.name_, "Cannot call setLevel() on a non-root logger when " + "goog.debug.Logger.ENABLE_HIERARCHY is false.");
    goog.debug.Logger.rootLevel_ = level
  }
};
goog.debug.Logger.prototype.getLevel = function() {
  return this.level_
};
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if(!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_
  }
  if(this.level_) {
    return this.level_
  }
  if(this.parent_) {
    return this.parent_.getEffectiveLevel()
  }
  goog.asserts.fail("Root logger has no level set.");
  return null
};
goog.debug.Logger.prototype.isLoggable = function(level) {
  return level.value >= this.getEffectiveLevel().value
};
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  if(this.isLoggable(level)) {
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception))
  }
};
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if(goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord = goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_)
  }else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_)
  }
  if(opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(goog.debug.exposeException(opt_exception, arguments.callee.caller))
  }
  return logRecord
};
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception)
};
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception)
};
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception)
};
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.INFO, msg, opt_exception)
};
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception)
};
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINE, msg, opt_exception)
};
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINER, msg, opt_exception)
};
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception)
};
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if(this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord)
  }
};
goog.debug.Logger.prototype.logToSpeedTracer_ = function(msg) {
  if(goog.global["console"] && goog.global["console"]["markTimeline"]) {
    goog.global["console"]["markTimeline"](msg)
  }
};
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  this.logToSpeedTracer_("log:" + logRecord.getMessage());
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while(target) {
      target.callPublish_(logRecord);
      target = target.getParent()
    }
  }else {
    for(var i = 0, handler;handler = goog.debug.Logger.rootHandlers_[i++];) {
      handler(logRecord)
    }
  }
};
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if(this.handlers_) {
    for(var i = 0, handler;handler = this.handlers_[i];i++) {
      handler(logRecord)
    }
  }
};
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent
};
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger
};
goog.debug.LogManager = {};
goog.debug.LogManager.loggers_ = {};
goog.debug.LogManager.rootLogger_ = null;
goog.debug.LogManager.initialize = function() {
  if(!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger("");
    goog.debug.LogManager.loggers_[""] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG)
  }
};
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_
};
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return goog.debug.LogManager.rootLogger_
};
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name)
};
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe("Error: " + info.message + " (" + info.fileName + " @ Line: " + info.line + ")")
  }
};
goog.debug.LogManager.createLogger_ = function(name) {
  var logger = new goog.debug.Logger(name);
  if(goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf(".");
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger)
  }
  goog.debug.LogManager.loggers_[name] = logger;
  return logger
};
goog.provide("goog.json");
goog.provide("goog.json.Serializer");
goog.json.isValid_ = function(s) {
  if(/^\s*$/.test(s)) {
    return false
  }
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe = /"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;
  return remainderRe.test(s.replace(backslashesRe, "@").replace(simpleValuesRe, "]").replace(openBracketsRe, ""))
};
goog.json.parse = function(s) {
  var o = String(s);
  if(goog.json.isValid_(o)) {
    try {
      return eval("(" + o + ")")
    }catch(ex) {
    }
  }
  throw Error("Invalid JSON string: " + o);
};
goog.json.unsafeParse = function(s) {
  return eval("(" + s + ")")
};
goog.json.serialize = function(object) {
  return(new goog.json.Serializer).serialize(object)
};
goog.json.Serializer = function() {
};
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join("")
};
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch(typeof object) {
    case "string":
      this.serializeString_(object, sb);
      break;
    case "number":
      this.serializeNumber_(object, sb);
      break;
    case "boolean":
      sb.push(object);
      break;
    case "undefined":
      sb.push("null");
      break;
    case "object":
      if(object == null) {
        sb.push("null");
        break
      }
      if(goog.isArray(object)) {
        this.serializeArray_(object, sb);
        break
      }
      this.serializeObject_(object, sb);
      break;
    case "function":
      break;
    default:
      throw Error("Unknown type: " + typeof object);
  }
};
goog.json.Serializer.charToJsonCharCache_ = {'"':'\\"', "\\":"\\\\", "/":"\\/", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\u000b":"\\u000b"};
goog.json.Serializer.charsToReplace_ = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    if(c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c]
    }
    var cc = c.charCodeAt(0);
    var rv = "\\u";
    if(cc < 16) {
      rv += "000"
    }else {
      if(cc < 256) {
        rv += "00"
      }else {
        if(cc < 4096) {
          rv += "0"
        }
      }
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16)
  }), '"')
};
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : "null")
};
goog.json.Serializer.prototype.serializeArray_ = function(arr, sb) {
  var l = arr.length;
  sb.push("[");
  var sep = "";
  for(var i = 0;i < l;i++) {
    sb.push(sep);
    this.serialize_(arr[i], sb);
    sep = ","
  }
  sb.push("]")
};
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push("{");
  var sep = "";
  for(var key in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      if(typeof value != "function") {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(":");
        this.serialize_(value, sb);
        sep = ","
      }
    }
  }
  sb.push("}")
};
goog.provide("goog.net.ErrorCode");
goog.net.ErrorCode = {NO_ERROR:0, ACCESS_DENIED:1, FILE_NOT_FOUND:2, FF_SILENT_ERROR:3, CUSTOM_ERROR:4, EXCEPTION:5, HTTP_ERROR:6, ABORT:7, TIMEOUT:8, OFFLINE:9};
goog.net.ErrorCode.getDebugMessage = function(errorCode) {
  switch(errorCode) {
    case goog.net.ErrorCode.NO_ERROR:
      return"No Error";
    case goog.net.ErrorCode.ACCESS_DENIED:
      return"Access denied to content document";
    case goog.net.ErrorCode.FILE_NOT_FOUND:
      return"File not found";
    case goog.net.ErrorCode.FF_SILENT_ERROR:
      return"Firefox silently errored";
    case goog.net.ErrorCode.CUSTOM_ERROR:
      return"Application custom error";
    case goog.net.ErrorCode.EXCEPTION:
      return"An exception occurred";
    case goog.net.ErrorCode.HTTP_ERROR:
      return"Http response at 400 or 500 level";
    case goog.net.ErrorCode.ABORT:
      return"Request was aborted";
    case goog.net.ErrorCode.TIMEOUT:
      return"Request timed out";
    case goog.net.ErrorCode.OFFLINE:
      return"The resource is not available offline";
    default:
      return"Unrecognized error code"
  }
};
goog.provide("goog.net.EventType");
goog.net.EventType = {COMPLETE:"complete", SUCCESS:"success", ERROR:"error", ABORT:"abort", READY:"ready", READY_STATE_CHANGE:"readystatechange", TIMEOUT:"timeout", INCREMENTAL_DATA:"incrementaldata", PROGRESS:"progress"};
goog.provide("goog.net.HttpStatus");
goog.net.HttpStatus = {CONTINUE:100, SWITCHING_PROTOCOLS:101, OK:200, CREATED:201, ACCEPTED:202, NON_AUTHORITATIVE_INFORMATION:203, NO_CONTENT:204, RESET_CONTENT:205, PARTIAL_CONTENT:206, MULTIPLE_CHOICES:300, MOVED_PERMANENTLY:301, FOUND:302, SEE_OTHER:303, NOT_MODIFIED:304, USE_PROXY:305, TEMPORARY_REDIRECT:307, BAD_REQUEST:400, UNAUTHORIZED:401, PAYMENT_REQUIRED:402, FORBIDDEN:403, NOT_FOUND:404, METHOD_NOT_ALLOWED:405, NOT_ACCEPTABLE:406, PROXY_AUTHENTICATION_REQUIRED:407, REQUEST_TIMEOUT:408, 
CONFLICT:409, GONE:410, LENGTH_REQUIRED:411, PRECONDITION_FAILED:412, REQUEST_ENTITY_TOO_LARGE:413, REQUEST_URI_TOO_LONG:414, UNSUPPORTED_MEDIA_TYPE:415, REQUEST_RANGE_NOT_SATISFIABLE:416, EXPECTATION_FAILED:417, INTERNAL_SERVER_ERROR:500, NOT_IMPLEMENTED:501, BAD_GATEWAY:502, SERVICE_UNAVAILABLE:503, GATEWAY_TIMEOUT:504, HTTP_VERSION_NOT_SUPPORTED:505};
goog.provide("goog.net.XmlHttpFactory");
goog.net.XmlHttpFactory = function() {
};
goog.net.XmlHttpFactory.prototype.cachedOptions_ = null;
goog.net.XmlHttpFactory.prototype.createInstance = goog.abstractMethod;
goog.net.XmlHttpFactory.prototype.getOptions = function() {
  return this.cachedOptions_ || (this.cachedOptions_ = this.internalGetOptions())
};
goog.net.XmlHttpFactory.prototype.internalGetOptions = goog.abstractMethod;
goog.provide("goog.net.WrapperXmlHttpFactory");
goog.require("goog.net.XmlHttpFactory");
goog.net.WrapperXmlHttpFactory = function(xhrFactory, optionsFactory) {
  goog.net.XmlHttpFactory.call(this);
  this.xhrFactory_ = xhrFactory;
  this.optionsFactory_ = optionsFactory
};
goog.inherits(goog.net.WrapperXmlHttpFactory, goog.net.XmlHttpFactory);
goog.net.WrapperXmlHttpFactory.prototype.createInstance = function() {
  return this.xhrFactory_()
};
goog.net.WrapperXmlHttpFactory.prototype.getOptions = function() {
  return this.optionsFactory_()
};
goog.provide("goog.net.DefaultXmlHttpFactory");
goog.provide("goog.net.XmlHttp");
goog.provide("goog.net.XmlHttp.OptionType");
goog.provide("goog.net.XmlHttp.ReadyState");
goog.require("goog.net.WrapperXmlHttpFactory");
goog.require("goog.net.XmlHttpFactory");
goog.net.XmlHttp = function() {
  return goog.net.XmlHttp.factory_.createInstance()
};
goog.net.XmlHttp.getOptions = function() {
  return goog.net.XmlHttp.factory_.getOptions()
};
goog.net.XmlHttp.OptionType = {USE_NULL_FUNCTION:0, LOCAL_REQUEST_ERROR:1};
goog.net.XmlHttp.ReadyState = {UNINITIALIZED:0, LOADING:1, LOADED:2, INTERACTIVE:3, COMPLETE:4};
goog.net.XmlHttp.factory_;
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) {
  goog.net.XmlHttp.setGlobalFactory(new goog.net.WrapperXmlHttpFactory(factory, optionsFactory))
};
goog.net.XmlHttp.setGlobalFactory = function(factory) {
  goog.net.XmlHttp.factory_ = factory
};
goog.net.DefaultXmlHttpFactory = function() {
  goog.net.XmlHttpFactory.call(this)
};
goog.inherits(goog.net.DefaultXmlHttpFactory, goog.net.XmlHttpFactory);
goog.net.DefaultXmlHttpFactory.prototype.createInstance = function() {
  var progId = this.getProgId_();
  if(progId) {
    return new ActiveXObject(progId)
  }else {
    return new XMLHttpRequest
  }
};
goog.net.DefaultXmlHttpFactory.prototype.internalGetOptions = function() {
  var progId = this.getProgId_();
  var options = {};
  if(progId) {
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] = true;
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] = true
  }
  return options
};
goog.net.DefaultXmlHttpFactory.prototype.ieProgId_ = null;
goog.net.DefaultXmlHttpFactory.prototype.getProgId_ = function() {
  if(!this.ieProgId_ && typeof XMLHttpRequest == "undefined" && typeof ActiveXObject != "undefined") {
    var ACTIVE_X_IDENTS = ["MSXML2.XMLHTTP.6.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
    for(var i = 0;i < ACTIVE_X_IDENTS.length;i++) {
      var candidate = ACTIVE_X_IDENTS[i];
      try {
        new ActiveXObject(candidate);
        this.ieProgId_ = candidate;
        return candidate
      }catch(e) {
      }
    }
    throw Error("Could not create ActiveXObject. ActiveX might be disabled," + " or MSXML might not be installed");
  }
  return this.ieProgId_
};
goog.net.XmlHttp.setGlobalFactory(new goog.net.DefaultXmlHttpFactory);
goog.provide("goog.net.xhrMonitor");
goog.require("goog.array");
goog.require("goog.debug.Logger");
goog.require("goog.userAgent");
goog.net.XhrMonitor_ = function() {
  if(!goog.userAgent.GECKO) {
    return
  }
  this.contextsToXhr_ = {};
  this.xhrToContexts_ = {};
  this.stack_ = []
};
goog.net.XhrMonitor_.getKey = function(obj) {
  return goog.isString(obj) ? obj : goog.isObject(obj) ? goog.getUid(obj) : ""
};
goog.net.XhrMonitor_.prototype.logger_ = goog.debug.Logger.getLogger("goog.net.xhrMonitor");
goog.net.XhrMonitor_.prototype.enabled_ = goog.userAgent.GECKO;
goog.net.XhrMonitor_.prototype.setEnabled = function(val) {
  this.enabled_ = goog.userAgent.GECKO && val
};
goog.net.XhrMonitor_.prototype.pushContext = function(context) {
  if(!this.enabled_) {
    return
  }
  var key = goog.net.XhrMonitor_.getKey(context);
  this.logger_.finest("Pushing context: " + context + " (" + key + ")");
  this.stack_.push(key)
};
goog.net.XhrMonitor_.prototype.popContext = function() {
  if(!this.enabled_) {
    return
  }
  var context = this.stack_.pop();
  this.logger_.finest("Popping context: " + context);
  this.updateDependentContexts_(context)
};
goog.net.XhrMonitor_.prototype.isContextSafe = function(context) {
  if(!this.enabled_) {
    return true
  }
  var deps = this.contextsToXhr_[goog.net.XhrMonitor_.getKey(context)];
  this.logger_.fine("Context is safe : " + context + " - " + deps);
  return!deps
};
goog.net.XhrMonitor_.prototype.markXhrOpen = function(xhr) {
  if(!this.enabled_) {
    return
  }
  var uid = goog.getUid(xhr);
  this.logger_.fine("Opening XHR : " + uid);
  for(var i = 0;i < this.stack_.length;i++) {
    var context = this.stack_[i];
    this.addToMap_(this.contextsToXhr_, context, uid);
    this.addToMap_(this.xhrToContexts_, uid, context)
  }
};
goog.net.XhrMonitor_.prototype.markXhrClosed = function(xhr) {
  if(!this.enabled_) {
    return
  }
  var uid = goog.getUid(xhr);
  this.logger_.fine("Closing XHR : " + uid);
  delete this.xhrToContexts_[uid];
  for(var context in this.contextsToXhr_) {
    goog.array.remove(this.contextsToXhr_[context], uid);
    if(this.contextsToXhr_[context].length == 0) {
      delete this.contextsToXhr_[context]
    }
  }
};
goog.net.XhrMonitor_.prototype.updateDependentContexts_ = function(xhrUid) {
  var contexts = this.xhrToContexts_[xhrUid];
  var xhrs = this.contextsToXhr_[xhrUid];
  if(contexts && xhrs) {
    this.logger_.finest("Updating dependent contexts");
    goog.array.forEach(contexts, function(context) {
      goog.array.forEach(xhrs, function(xhr) {
        this.addToMap_(this.contextsToXhr_, context, xhr);
        this.addToMap_(this.xhrToContexts_, xhr, context)
      }, this)
    }, this)
  }
};
goog.net.XhrMonitor_.prototype.addToMap_ = function(map, key, value) {
  if(!map[key]) {
    map[key] = []
  }
  if(!goog.array.contains(map[key], value)) {
    map[key].push(value)
  }
};
goog.net.xhrMonitor = new goog.net.XhrMonitor_;
goog.provide("goog.uri.utils");
goog.provide("goog.uri.utils.ComponentIndex");
goog.require("goog.asserts");
goog.require("goog.string");
goog.uri.utils.CharCode_ = {AMPERSAND:38, EQUAL:61, HASH:35, QUESTION:63};
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = [];
  if(opt_scheme) {
    out.push(opt_scheme, ":")
  }
  if(opt_domain) {
    out.push("//");
    if(opt_userInfo) {
      out.push(opt_userInfo, "@")
    }
    out.push(opt_domain);
    if(opt_port) {
      out.push(":", opt_port)
    }
  }
  if(opt_path) {
    out.push(opt_path)
  }
  if(opt_queryData) {
    out.push("?", opt_queryData)
  }
  if(opt_fragment) {
    out.push("#", opt_fragment)
  }
  return out.join("")
};
goog.uri.utils.splitRe_ = new RegExp("^" + "(?:" + "([^:/?#.]+)" + ":)?" + "(?://" + "(?:([^/?#]*)@)?" + "([\\w\\d\\-\\u0100-\\uffff.%]*)" + "(?::([0-9]+))?" + ")?" + "([^?#]+)?" + "(?:\\?([^#]*))?" + "(?:#(.*))?" + "$");
goog.uri.utils.ComponentIndex = {SCHEME:1, USER_INFO:2, DOMAIN:3, PORT:4, PATH:5, QUERY_DATA:6, FRAGMENT:7};
goog.uri.utils.split = function(uri) {
  return uri.match(goog.uri.utils.splitRe_)
};
goog.uri.utils.decodeIfPossible_ = function(uri) {
  return uri && decodeURIComponent(uri)
};
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  return goog.uri.utils.split(uri)[componentIndex] || null
};
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.SCHEME, uri)
};
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.USER_INFO, uri)
};
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getUserInfoEncoded(uri))
};
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.DOMAIN, uri)
};
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri))
};
goog.uri.utils.getPort = function(uri) {
  return Number(goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PORT, uri)) || null
};
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.PATH, uri)
};
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri))
};
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(goog.uri.utils.ComponentIndex.QUERY_DATA, uri)
};
goog.uri.utils.getFragmentEncoded = function(uri) {
  var hashIndex = uri.indexOf("#");
  return hashIndex < 0 ? null : uri.substr(hashIndex + 1)
};
goog.uri.utils.setFragmentEncoded = function(uri, fragment) {
  return goog.uri.utils.removeFragment(uri) + (fragment ? "#" + fragment : "")
};
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getFragmentEncoded(uri))
};
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(pieces[goog.uri.utils.ComponentIndex.SCHEME], pieces[goog.uri.utils.ComponentIndex.USER_INFO], pieces[goog.uri.utils.ComponentIndex.DOMAIN], pieces[goog.uri.utils.ComponentIndex.PORT])
};
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null, pieces[goog.uri.utils.ComponentIndex.PATH], pieces[goog.uri.utils.ComponentIndex.QUERY_DATA], pieces[goog.uri.utils.ComponentIndex.FRAGMENT])
};
goog.uri.utils.removeFragment = function(uri) {
  var hashIndex = uri.indexOf("#");
  return hashIndex < 0 ? uri : uri.substr(0, hashIndex)
};
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1);
  var pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] == pieces2[goog.uri.utils.ComponentIndex.DOMAIN] && pieces1[goog.uri.utils.ComponentIndex.SCHEME] == pieces2[goog.uri.utils.ComponentIndex.SCHEME] && pieces1[goog.uri.utils.ComponentIndex.PORT] == pieces2[goog.uri.utils.ComponentIndex.PORT]
};
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) {
  if(goog.DEBUG && (uri.indexOf("#") >= 0 || uri.indexOf("?") >= 0)) {
    throw Error("goog.uri.utils: Fragment or query identifiers are not " + "supported: [" + uri + "]");
  }
};
goog.uri.utils.QueryValue;
goog.uri.utils.QueryArray;
goog.uri.utils.appendQueryData_ = function(buffer) {
  if(buffer[1]) {
    var baseUri = buffer[0];
    var hashIndex = baseUri.indexOf("#");
    if(hashIndex >= 0) {
      buffer.push(baseUri.substr(hashIndex));
      buffer[0] = baseUri = baseUri.substr(0, hashIndex)
    }
    var questionIndex = baseUri.indexOf("?");
    if(questionIndex < 0) {
      buffer[1] = "?"
    }else {
      if(questionIndex == baseUri.length - 1) {
        buffer[1] = undefined
      }
    }
  }
  return buffer.join("")
};
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  if(goog.isArray(value)) {
    value = value;
    for(var j = 0;j < value.length;j++) {
      pairs.push("&", key);
      if(value[j] !== "") {
        pairs.push("=", goog.string.urlEncode(value[j]))
      }
    }
  }else {
    if(value != null) {
      pairs.push("&", key);
      if(value !== "") {
        pairs.push("=", goog.string.urlEncode(value))
      }
    }
  }
};
goog.uri.utils.buildQueryDataBuffer_ = function(buffer, keysAndValues, opt_startIndex) {
  goog.asserts.assert(Math.max(keysAndValues.length - (opt_startIndex || 0), 0) % 2 == 0, "goog.uri.utils: Key/value lists must be even in length.");
  for(var i = opt_startIndex || 0;i < keysAndValues.length;i += 2) {
    goog.uri.utils.appendKeyValuePairs_(keysAndValues[i], keysAndValues[i + 1], buffer)
  }
  return buffer
};
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  var buffer = goog.uri.utils.buildQueryDataBuffer_([], keysAndValues, opt_startIndex);
  buffer[0] = "";
  return buffer.join("")
};
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) {
  for(var key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer)
  }
  return buffer
};
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map);
  buffer[0] = "";
  return buffer.join("")
};
goog.uri.utils.appendParams = function(uri, var_args) {
  return goog.uri.utils.appendQueryData_(arguments.length == 2 ? goog.uri.utils.buildQueryDataBuffer_([uri], arguments[1], 0) : goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1))
};
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  return goog.uri.utils.appendQueryData_(goog.uri.utils.buildQueryDataBufferFromMap_([uri], map))
};
goog.uri.utils.appendParam = function(uri, key, value) {
  return goog.uri.utils.appendQueryData_([uri, "&", key, "=", goog.string.urlEncode(value)])
};
goog.uri.utils.findParam_ = function(uri, startIndex, keyEncoded, hashOrEndIndex) {
  var index = startIndex;
  var keyLength = keyEncoded.length;
  while((index = uri.indexOf(keyEncoded, index)) >= 0 && index < hashOrEndIndex) {
    var precedingChar = uri.charCodeAt(index - 1);
    if(precedingChar == goog.uri.utils.CharCode_.AMPERSAND || precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      var followingChar = uri.charCodeAt(index + keyLength);
      if(!followingChar || followingChar == goog.uri.utils.CharCode_.EQUAL || followingChar == goog.uri.utils.CharCode_.AMPERSAND || followingChar == goog.uri.utils.CharCode_.HASH) {
        return index
      }
    }
    index += keyLength + 1
  }
  return-1
};
goog.uri.utils.hashOrEndRe_ = /#|$/;
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return goog.uri.utils.findParam_(uri, 0, keyEncoded, uri.search(goog.uri.utils.hashOrEndRe_)) >= 0
};
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var foundIndex = goog.uri.utils.findParam_(uri, 0, keyEncoded, hashOrEndIndex);
  if(foundIndex < 0) {
    return null
  }else {
    var endPosition = uri.indexOf("&", foundIndex);
    if(endPosition < 0 || endPosition > hashOrEndIndex) {
      endPosition = hashOrEndIndex
    }
    foundIndex += keyEncoded.length + 1;
    return goog.string.urlDecode(uri.substr(foundIndex, endPosition - foundIndex))
  }
};
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var result = [];
  while((foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    position = uri.indexOf("&", foundIndex);
    if(position < 0 || position > hashOrEndIndex) {
      position = hashOrEndIndex
    }
    foundIndex += keyEncoded.length + 1;
    result.push(goog.string.urlDecode(uri.substr(foundIndex, position - foundIndex)))
  }
  return result
};
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/;
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var buffer = [];
  while((foundIndex = goog.uri.utils.findParam_(uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    buffer.push(uri.substring(position, foundIndex));
    position = Math.min(uri.indexOf("&", foundIndex) + 1 || hashOrEndIndex, hashOrEndIndex)
  }
  buffer.push(uri.substr(position));
  return buffer.join("").replace(goog.uri.utils.trailingQueryPunctuationRe_, "$1")
};
goog.uri.utils.setParam = function(uri, keyEncoded, value) {
  return goog.uri.utils.appendParam(goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value)
};
goog.uri.utils.appendPath = function(baseUri, path) {
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri);
  if(goog.string.endsWith(baseUri, "/")) {
    baseUri = baseUri.substr(0, baseUri.length - 1)
  }
  if(goog.string.startsWith(path, "/")) {
    path = path.substr(1)
  }
  return goog.string.buildString(baseUri, "/", path)
};
goog.uri.utils.StandardQueryParam = {RANDOM:"zx"};
goog.uri.utils.makeUnique = function(uri) {
  return goog.uri.utils.setParam(uri, goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString())
};
goog.provide("goog.net.XhrIo");
goog.provide("goog.net.XhrIo.ResponseType");
goog.require("goog.Timer");
goog.require("goog.debug.Logger");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.debug.errorHandlerWeakDep");
goog.require("goog.events.EventTarget");
goog.require("goog.json");
goog.require("goog.net.ErrorCode");
goog.require("goog.net.EventType");
goog.require("goog.net.HttpStatus");
goog.require("goog.net.XmlHttp");
goog.require("goog.net.xhrMonitor");
goog.require("goog.object");
goog.require("goog.structs");
goog.require("goog.structs.Map");
goog.require("goog.uri.utils");
goog.net.XhrIo = function(opt_xmlHttpFactory) {
  goog.events.EventTarget.call(this);
  this.headers = new goog.structs.Map;
  this.xmlHttpFactory_ = opt_xmlHttpFactory || null
};
goog.inherits(goog.net.XhrIo, goog.events.EventTarget);
goog.net.XhrIo.ResponseType = {DEFAULT:"", TEXT:"text", DOCUMENT:"document", BLOB:"blob", ARRAY_BUFFER:"arraybuffer"};
goog.net.XhrIo.prototype.logger_ = goog.debug.Logger.getLogger("goog.net.XhrIo");
goog.net.XhrIo.CONTENT_TYPE_HEADER = "Content-Type";
goog.net.XhrIo.HTTP_SCHEME_PATTERN = /^https?:?$/i;
goog.net.XhrIo.FORM_CONTENT_TYPE = "application/x-www-form-urlencoded;charset=utf-8";
goog.net.XhrIo.sendInstances_ = [];
goog.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content, opt_headers, opt_timeoutInterval) {
  var x = new goog.net.XhrIo;
  goog.net.XhrIo.sendInstances_.push(x);
  if(opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback)
  }
  goog.events.listen(x, goog.net.EventType.READY, goog.partial(goog.net.XhrIo.cleanupSend_, x));
  if(opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval)
  }
  x.send(url, opt_method, opt_content, opt_headers)
};
goog.net.XhrIo.cleanup = function() {
  var instances = goog.net.XhrIo.sendInstances_;
  while(instances.length) {
    instances.pop().dispose()
  }
};
goog.net.XhrIo.protectEntryPoints = function(errorHandler) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = errorHandler.protectEntryPoint(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_)
};
goog.net.XhrIo.cleanupSend_ = function(XhrIo) {
  XhrIo.dispose();
  goog.array.remove(goog.net.XhrIo.sendInstances_, XhrIo)
};
goog.net.XhrIo.prototype.active_ = false;
goog.net.XhrIo.prototype.xhr_ = null;
goog.net.XhrIo.prototype.xhrOptions_ = null;
goog.net.XhrIo.prototype.lastUri_ = "";
goog.net.XhrIo.prototype.lastMethod_ = "";
goog.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
goog.net.XhrIo.prototype.lastError_ = "";
goog.net.XhrIo.prototype.errorDispatched_ = false;
goog.net.XhrIo.prototype.inSend_ = false;
goog.net.XhrIo.prototype.inOpen_ = false;
goog.net.XhrIo.prototype.inAbort_ = false;
goog.net.XhrIo.prototype.timeoutInterval_ = 0;
goog.net.XhrIo.prototype.timeoutId_ = null;
goog.net.XhrIo.prototype.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT;
goog.net.XhrIo.prototype.withCredentials_ = false;
goog.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_
};
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms)
};
goog.net.XhrIo.prototype.setResponseType = function(type) {
  this.responseType_ = type
};
goog.net.XhrIo.prototype.getResponseType = function() {
  return this.responseType_
};
goog.net.XhrIo.prototype.setWithCredentials = function(withCredentials) {
  this.withCredentials_ = withCredentials
};
goog.net.XhrIo.prototype.getWithCredentials = function() {
  return this.withCredentials_
};
goog.net.XhrIo.prototype.send = function(url, opt_method, opt_content, opt_headers) {
  if(this.xhr_) {
    throw Error("[goog.net.XhrIo] Object is active with another request");
  }
  var method = opt_method || "GET";
  this.lastUri_ = url;
  this.lastError_ = "";
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastMethod_ = method;
  this.errorDispatched_ = false;
  this.active_ = true;
  this.xhr_ = this.createXhr();
  this.xhrOptions_ = this.xmlHttpFactory_ ? this.xmlHttpFactory_.getOptions() : goog.net.XmlHttp.getOptions();
  goog.net.xhrMonitor.markXhrOpen(this.xhr_);
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this);
  try {
    this.logger_.fine(this.formatMsg_("Opening Xhr"));
    this.inOpen_ = true;
    this.xhr_.open(method, url, true);
    this.inOpen_ = false
  }catch(err) {
    this.logger_.fine(this.formatMsg_("Error opening Xhr: " + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
    return
  }
  var content = opt_content || "";
  var headers = this.headers.clone();
  if(opt_headers) {
    goog.structs.forEach(opt_headers, function(value, key) {
      headers.set(key, value)
    })
  }
  if(method == "POST" && !headers.containsKey(goog.net.XhrIo.CONTENT_TYPE_HEADER)) {
    headers.set(goog.net.XhrIo.CONTENT_TYPE_HEADER, goog.net.XhrIo.FORM_CONTENT_TYPE)
  }
  goog.structs.forEach(headers, function(value, key) {
    this.xhr_.setRequestHeader(key, value)
  }, this);
  if(this.responseType_) {
    this.xhr_.responseType = this.responseType_
  }
  if(goog.object.containsKey(this.xhr_, "withCredentials")) {
    this.xhr_.withCredentials = this.withCredentials_
  }
  try {
    if(this.timeoutId_) {
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null
    }
    if(this.timeoutInterval_ > 0) {
      this.logger_.fine(this.formatMsg_("Will abort after " + this.timeoutInterval_ + "ms if incomplete"));
      this.timeoutId_ = goog.Timer.defaultTimerObject.setTimeout(goog.bind(this.timeout_, this), this.timeoutInterval_)
    }
    this.logger_.fine(this.formatMsg_("Sending request"));
    this.inSend_ = true;
    this.xhr_.send(content);
    this.inSend_ = false
  }catch(err) {
    this.logger_.fine(this.formatMsg_("Send error: " + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err)
  }
};
goog.net.XhrIo.prototype.createXhr = function() {
  return this.xmlHttpFactory_ ? this.xmlHttpFactory_.createInstance() : new goog.net.XmlHttp
};
goog.net.XhrIo.prototype.dispatchEvent = function(e) {
  if(this.xhr_) {
    goog.net.xhrMonitor.pushContext(this.xhr_);
    try {
      return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e)
    }finally {
      goog.net.xhrMonitor.popContext()
    }
  }else {
    return goog.net.XhrIo.superClass_.dispatchEvent.call(this, e)
  }
};
goog.net.XhrIo.prototype.timeout_ = function() {
  if(typeof goog == "undefined") {
  }else {
    if(this.xhr_) {
      this.lastError_ = "Timed out after " + this.timeoutInterval_ + "ms, aborting";
      this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
      this.logger_.fine(this.formatMsg_(this.lastError_));
      this.dispatchEvent(goog.net.EventType.TIMEOUT);
      this.abort(goog.net.ErrorCode.TIMEOUT)
    }
  }
};
goog.net.XhrIo.prototype.error_ = function(errorCode, err) {
  this.active_ = false;
  if(this.xhr_) {
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false
  }
  this.lastError_ = err;
  this.lastErrorCode_ = errorCode;
  this.dispatchErrors_();
  this.cleanUpXhr_()
};
goog.net.XhrIo.prototype.dispatchErrors_ = function() {
  if(!this.errorDispatched_) {
    this.errorDispatched_ = true;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR)
  }
};
goog.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if(this.xhr_ && this.active_) {
    this.logger_.fine(this.formatMsg_("Aborting"));
    this.active_ = false;
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.cleanUpXhr_()
  }
};
goog.net.XhrIo.prototype.disposeInternal = function() {
  if(this.xhr_) {
    if(this.active_) {
      this.active_ = false;
      this.inAbort_ = true;
      this.xhr_.abort();
      this.inAbort_ = false
    }
    this.cleanUpXhr_(true)
  }
  goog.net.XhrIo.superClass_.disposeInternal.call(this)
};
goog.net.XhrIo.prototype.onReadyStateChange_ = function() {
  if(!this.inOpen_ && !this.inSend_ && !this.inAbort_) {
    this.onReadyStateChangeEntryPoint_()
  }else {
    this.onReadyStateChangeHelper_()
  }
};
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {
  this.onReadyStateChangeHelper_()
};
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() {
  if(!this.active_) {
    return
  }
  if(typeof goog == "undefined") {
  }else {
    if(this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] && this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE && this.getStatus() == 2) {
      this.logger_.fine(this.formatMsg_("Local request error detected and ignored"))
    }else {
      if(this.inSend_ && this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) {
        goog.Timer.defaultTimerObject.setTimeout(goog.bind(this.onReadyStateChange_, this), 0);
        return
      }
      this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);
      if(this.isComplete()) {
        this.logger_.fine(this.formatMsg_("Request complete"));
        this.active_ = false;
        if(this.isSuccess()) {
          this.dispatchEvent(goog.net.EventType.COMPLETE);
          this.dispatchEvent(goog.net.EventType.SUCCESS)
        }else {
          this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
          this.lastError_ = this.getStatusText() + " [" + this.getStatus() + "]";
          this.dispatchErrors_()
        }
        this.cleanUpXhr_()
      }
    }
  }
};
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) {
  if(this.xhr_) {
    var xhr = this.xhr_;
    var clearedOnReadyStateChange = this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] ? goog.nullFunction : null;
    this.xhr_ = null;
    this.xhrOptions_ = null;
    if(this.timeoutId_) {
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null
    }
    if(!opt_fromDispose) {
      goog.net.xhrMonitor.pushContext(xhr);
      this.dispatchEvent(goog.net.EventType.READY);
      goog.net.xhrMonitor.popContext()
    }
    goog.net.xhrMonitor.markXhrClosed(xhr);
    try {
      xhr.onreadystatechange = clearedOnReadyStateChange
    }catch(e) {
      this.logger_.severe("Problem encountered resetting onreadystatechange: " + e.message)
    }
  }
};
goog.net.XhrIo.prototype.isActive = function() {
  return!!this.xhr_
};
goog.net.XhrIo.prototype.isComplete = function() {
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE
};
goog.net.XhrIo.prototype.isSuccess = function() {
  switch(this.getStatus()) {
    case 0:
      return!this.isLastUriEffectiveSchemeHttp_();
    case goog.net.HttpStatus.OK:
    ;
    case goog.net.HttpStatus.NO_CONTENT:
    ;
    case goog.net.HttpStatus.NOT_MODIFIED:
      return true;
    default:
      return false
  }
};
goog.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() {
  var lastUriScheme = goog.isString(this.lastUri_) ? goog.uri.utils.getScheme(this.lastUri_) : this.lastUri_.getScheme();
  if(lastUriScheme) {
    return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(lastUriScheme)
  }
  if(self.location) {
    return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(self.location.protocol)
  }else {
    return true
  }
};
goog.net.XhrIo.prototype.getReadyState = function() {
  return this.xhr_ ? this.xhr_.readyState : goog.net.XmlHttp.ReadyState.UNINITIALIZED
};
goog.net.XhrIo.prototype.getStatus = function() {
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ? this.xhr_.status : -1
  }catch(e) {
    this.logger_.warning("Can not get status: " + e.message);
    return-1
  }
};
goog.net.XhrIo.prototype.getStatusText = function() {
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ? this.xhr_.statusText : ""
  }catch(e) {
    this.logger_.fine("Can not get status: " + e.message);
    return""
  }
};
goog.net.XhrIo.prototype.getLastUri = function() {
  return String(this.lastUri_)
};
goog.net.XhrIo.prototype.getResponseText = function() {
  try {
    return this.xhr_ ? this.xhr_.responseText : ""
  }catch(e) {
    this.logger_.fine("Can not get responseText: " + e.message);
    return""
  }
};
goog.net.XhrIo.prototype.getResponseXml = function() {
  try {
    return this.xhr_ ? this.xhr_.responseXML : null
  }catch(e) {
    this.logger_.fine("Can not get responseXML: " + e.message);
    return null
  }
};
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if(!this.xhr_) {
    return undefined
  }
  var responseText = this.xhr_.responseText;
  if(opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length)
  }
  return goog.json.parse(responseText)
};
goog.net.XhrIo.prototype.getResponse = function() {
  try {
    return this.xhr_ && this.xhr_.response
  }catch(e) {
    this.logger_.fine("Can not get response: " + e.message);
    return null
  }
};
goog.net.XhrIo.prototype.getResponseHeader = function(key) {
  return this.xhr_ && this.isComplete() ? this.xhr_.getResponseHeader(key) : undefined
};
goog.net.XhrIo.prototype.getAllResponseHeaders = function() {
  return this.xhr_ && this.isComplete() ? this.xhr_.getAllResponseHeaders() : ""
};
goog.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_
};
goog.net.XhrIo.prototype.getLastError = function() {
  return goog.isString(this.lastError_) ? this.lastError_ : String(this.lastError_)
};
goog.net.XhrIo.prototype.formatMsg_ = function(msg) {
  return msg + " [" + this.lastMethod_ + " " + this.lastUri_ + " " + this.getStatus() + "]"
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = transformer(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_)
});
goog.provide("clojure.browser.event");
goog.require("cljs.core");
goog.require("goog.events");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
clojure.browser.event.EventType = {};
clojure.browser.event.event_types = function event_types(this$) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101793 = this$;
    if(cljs.core.truth_(and__3546__auto____101793)) {
      return this$.clojure$browser$event$EventType$event_types
    }else {
      return and__3546__auto____101793
    }
  }())) {
    return this$.clojure$browser$event$EventType$event_types(this$)
  }else {
    return function() {
      var or__3548__auto____101794 = clojure.browser.event.event_types[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____101794)) {
        return or__3548__auto____101794
      }else {
        var or__3548__auto____101795 = clojure.browser.event.event_types["_"];
        if(cljs.core.truth_(or__3548__auto____101795)) {
          return or__3548__auto____101795
        }else {
          throw cljs.core.missing_protocol.call(null, "EventType.event-types", this$);
        }
      }
    }().call(null, this$)
  }
};
Element.prototype.clojure$browser$event$EventType$ = true;
Element.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__101796) {
    var vec__101797__101798 = p__101796;
    var k__101799 = cljs.core.nth.call(null, vec__101797__101798, 0, null);
    var v__101800 = cljs.core.nth.call(null, vec__101797__101798, 1, null);
    return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__101799.toLowerCase()), v__101800])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.events.EventType))))
};
goog.events.EventTarget.prototype.clojure$browser$event$EventType$ = true;
goog.events.EventTarget.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__101801) {
    var vec__101802__101803 = p__101801;
    var k__101804 = cljs.core.nth.call(null, vec__101802__101803, 0, null);
    var v__101805 = cljs.core.nth.call(null, vec__101802__101803, 1, null);
    return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__101804.toLowerCase()), v__101805])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.events.EventType))))
};
clojure.browser.event.listen = function() {
  var listen = null;
  var listen__101806 = function(src, type, fn) {
    return listen.call(null, src, type, fn, false)
  };
  var listen__101807 = function(src, type, fn, capture_QMARK_) {
    return goog.events.listen.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  listen = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return listen__101806.call(this, src, type, fn);
      case 4:
        return listen__101807.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen
}();
clojure.browser.event.listen_once = function() {
  var listen_once = null;
  var listen_once__101809 = function(src, type, fn) {
    return listen_once.call(null, src, type, fn, false)
  };
  var listen_once__101810 = function(src, type, fn, capture_QMARK_) {
    return goog.events.listenOnce.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  listen_once = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return listen_once__101809.call(this, src, type, fn);
      case 4:
        return listen_once__101810.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen_once
}();
clojure.browser.event.unlisten = function() {
  var unlisten = null;
  var unlisten__101812 = function(src, type, fn) {
    return unlisten.call(null, src, type, fn, false)
  };
  var unlisten__101813 = function(src, type, fn, capture_QMARK_) {
    return goog.events.unlisten.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  unlisten = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return unlisten__101812.call(this, src, type, fn);
      case 4:
        return unlisten__101813.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return unlisten
}();
clojure.browser.event.unlisten_by_key = function unlisten_by_key(key) {
  return goog.events.unlistenByKey.call(null, key)
};
clojure.browser.event.dispatch_event = function dispatch_event(src, event) {
  return goog.events.dispatchEvent.call(null, src, event)
};
clojure.browser.event.expose = function expose(e) {
  return goog.events.expose.call(null, e)
};
clojure.browser.event.fire_listeners = function fire_listeners(obj, type, capture, event) {
  return null
};
clojure.browser.event.total_listener_count = function total_listener_count() {
  return goog.events.getTotalListenerCount.call(null)
};
clojure.browser.event.get_listener = function get_listener(src, type, listener, opt_capt, opt_handler) {
  return null
};
clojure.browser.event.all_listeners = function all_listeners(obj, type, capture) {
  return null
};
clojure.browser.event.unique_event_id = function unique_event_id(event_type) {
  return null
};
clojure.browser.event.has_listener = function has_listener(obj, opt_type, opt_capture) {
  return null
};
clojure.browser.event.remove_all = function remove_all(opt_obj, opt_type, opt_capt) {
  return null
};
goog.provide("goog.history.EventType");
goog.history.EventType = {NAVIGATE:"navigate"};
goog.provide("goog.history.Event");
goog.require("goog.events.Event");
goog.require("goog.history.EventType");
goog.history.Event = function(token, isNavigation) {
  goog.events.Event.call(this, goog.history.EventType.NAVIGATE);
  this.token = token;
  this.isNavigation = isNavigation
};
goog.inherits(goog.history.Event, goog.events.Event);
goog.provide("goog.history.Html5History");
goog.provide("goog.history.Html5History.TokenTransformer");
goog.require("goog.asserts");
goog.require("goog.events");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.history.Event");
goog.require("goog.history.EventType");
goog.history.Html5History = function(opt_win, opt_transformer) {
  goog.events.EventTarget.call(this);
  goog.asserts.assert(goog.history.Html5History.isSupported(opt_win), "HTML5 history is not supported.");
  this.window_ = opt_win || window;
  this.transformer_ = opt_transformer || null;
  goog.events.listen(this.window_, goog.events.EventType.POPSTATE, this.onHistoryEvent_, false, this);
  goog.events.listen(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this)
};
goog.inherits(goog.history.Html5History, goog.events.EventTarget);
goog.history.Html5History.isSupported = function(opt_win) {
  var win = opt_win || window;
  return!!(win.history && win.history.pushState)
};
goog.history.Html5History.prototype.enabled_ = false;
goog.history.Html5History.prototype.useFragment_ = true;
goog.history.Html5History.prototype.pathPrefix_ = "/";
goog.history.Html5History.prototype.setEnabled = function(enable) {
  if(enable == this.enabled_) {
    return
  }
  this.enabled_ = enable;
  if(enable) {
    this.dispatchEvent(new goog.history.Event(this.getToken(), false))
  }
};
goog.history.Html5History.prototype.getToken = function() {
  if(this.useFragment_) {
    var loc = this.window_.location.href;
    var index = loc.indexOf("#");
    return index < 0 ? "" : loc.substring(index + 1)
  }else {
    return this.transformer_ ? this.transformer_.retrieveToken(this.pathPrefix_, this.window_.location) : this.window_.location.pathname.substr(this.pathPrefix_.length)
  }
};
goog.history.Html5History.prototype.setToken = function(token, opt_title) {
  if(token == this.getToken()) {
    return
  }
  this.window_.history.pushState(null, opt_title || this.window_.document.title || "", this.getUrl_(token));
  this.dispatchEvent(new goog.history.Event(token, false))
};
goog.history.Html5History.prototype.replaceToken = function(token, opt_title) {
  this.window_.history.replaceState(null, opt_title || this.window_.document.title || "", this.getUrl_(token));
  this.dispatchEvent(new goog.history.Event(token, false))
};
goog.history.Html5History.prototype.disposeInternal = function() {
  goog.events.unlisten(this.window_, goog.events.EventType.POPSTATE, this.onHistoryEvent_, false, this);
  if(this.useFragment_) {
    goog.events.unlisten(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this)
  }
};
goog.history.Html5History.prototype.setUseFragment = function(useFragment) {
  if(this.useFragment_ != useFragment) {
    if(useFragment) {
      goog.events.listen(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this)
    }else {
      goog.events.unlisten(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this)
    }
    this.useFragment_ = useFragment
  }
};
goog.history.Html5History.prototype.setPathPrefix = function(pathPrefix) {
  this.pathPrefix_ = pathPrefix
};
goog.history.Html5History.prototype.getPathPrefix = function() {
  return this.pathPrefix_
};
goog.history.Html5History.prototype.getUrl_ = function(token) {
  if(this.useFragment_) {
    return"#" + token
  }else {
    return this.transformer_ ? this.transformer_.createUrl(token, this.pathPrefix_, this.window_.location) : this.pathPrefix_ + token + this.window_.location.search
  }
};
goog.history.Html5History.prototype.onHistoryEvent_ = function(e) {
  if(this.enabled_) {
    this.dispatchEvent(new goog.history.Event(this.getToken(), true))
  }
};
goog.history.Html5History.TokenTransformer = function() {
};
goog.history.Html5History.TokenTransformer.prototype.retrieveToken = function(pathPrefix, location) {
};
goog.history.Html5History.TokenTransformer.prototype.createUrl = function(token, pathPrefix, location) {
};
goog.provide("goog.events.EventHandler");
goog.require("goog.Disposable");
goog.require("goog.events");
goog.require("goog.events.EventWrapper");
goog.require("goog.object");
goog.require("goog.structs.SimplePool");
goog.events.EventHandler = function(opt_handler) {
  goog.Disposable.call(this);
  this.handler_ = opt_handler
};
goog.inherits(goog.events.EventHandler, goog.Disposable);
goog.events.EventHandler.KEY_POOL_INITIAL_COUNT = 0;
goog.events.EventHandler.KEY_POOL_MAX_COUNT = 100;
goog.events.EventHandler.keyPool_ = new goog.structs.SimplePool(goog.events.EventHandler.KEY_POOL_INITIAL_COUNT, goog.events.EventHandler.KEY_POOL_MAX_COUNT);
goog.events.EventHandler.keys_ = null;
goog.events.EventHandler.key_ = null;
goog.events.EventHandler.typeArray_ = [];
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn, opt_capture, opt_handler) {
  if(!goog.isArray(type)) {
    goog.events.EventHandler.typeArray_[0] = type;
    type = goog.events.EventHandler.typeArray_
  }
  for(var i = 0;i < type.length;i++) {
    var key = goog.events.listen(src, type[i], opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this);
    this.recordListenerKey_(key)
  }
  return this
};
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn, opt_capture, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      this.listenOnce(src, type[i], opt_fn, opt_capture, opt_handler)
    }
  }else {
    var key = goog.events.listenOnce(src, type, opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this);
    this.recordListenerKey_(key)
  }
  return this
};
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler || this.handler_, this);
  return this
};
goog.events.EventHandler.prototype.recordListenerKey_ = function(key) {
  if(this.keys_) {
    this.keys_[key] = true
  }else {
    if(this.key_) {
      this.keys_ = goog.events.EventHandler.keyPool_.getObject();
      this.keys_[this.key_] = true;
      this.key_ = null;
      this.keys_[key] = true
    }else {
      this.key_ = key
    }
  }
};
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn, opt_capture, opt_handler) {
  if(this.key_ || this.keys_) {
    if(goog.isArray(type)) {
      for(var i = 0;i < type.length;i++) {
        this.unlisten(src, type[i], opt_fn, opt_capture, opt_handler)
      }
    }else {
      var listener = goog.events.getListener(src, type, opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this);
      if(listener) {
        var key = listener.key;
        goog.events.unlistenByKey(key);
        if(this.keys_) {
          goog.object.remove(this.keys_, key)
        }else {
          if(this.key_ == key) {
            this.key_ = null
          }
        }
      }
    }
  }
  return this
};
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler || this.handler_, this);
  return this
};
goog.events.EventHandler.prototype.removeAll = function() {
  if(this.keys_) {
    for(var key in this.keys_) {
      goog.events.unlistenByKey(key);
      delete this.keys_[key]
    }
    goog.events.EventHandler.keyPool_.releaseObject(this.keys_);
    this.keys_ = null
  }else {
    if(this.key_) {
      goog.events.unlistenByKey(this.key_)
    }
  }
};
goog.events.EventHandler.prototype.disposeInternal = function() {
  goog.events.EventHandler.superClass_.disposeInternal.call(this);
  this.removeAll()
};
goog.events.EventHandler.prototype.handleEvent = function(e) {
  throw Error("EventHandler.handleEvent not implemented");
};
goog.provide("goog.History");
goog.provide("goog.History.Event");
goog.provide("goog.History.EventType");
goog.require("goog.Timer");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.Event");
goog.require("goog.events.EventHandler");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
goog.require("goog.history.Event");
goog.require("goog.history.EventType");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.History = function(opt_invisible, opt_blankPageUrl, opt_input, opt_iframe) {
  goog.events.EventTarget.call(this);
  if(opt_invisible && !opt_blankPageUrl) {
    throw Error("Can't use invisible history without providing a blank page.");
  }
  var input;
  if(opt_input) {
    input = opt_input
  }else {
    var inputId = "history_state" + goog.History.historyCount_;
    document.write(goog.string.subs(goog.History.INPUT_TEMPLATE_, inputId, inputId));
    input = goog.dom.getElement(inputId)
  }
  this.hiddenInput_ = input;
  this.window_ = opt_input ? goog.dom.getWindow(goog.dom.getOwnerDocument(opt_input)) : window;
  this.baseUrl_ = this.window_.location.href.split("#")[0] + "#";
  this.iframeSrc_ = opt_blankPageUrl;
  if(goog.userAgent.IE && !opt_blankPageUrl) {
    this.iframeSrc_ = window.location.protocol == "https" ? "https:///" : 'javascript:""'
  }
  this.timer_ = new goog.Timer(goog.History.PollingType.NORMAL);
  this.userVisible_ = !opt_invisible;
  this.eventHandler_ = new goog.events.EventHandler(this);
  if(opt_invisible || goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
    var iframe;
    if(opt_iframe) {
      iframe = opt_iframe
    }else {
      var iframeId = "history_iframe" + goog.History.historyCount_;
      var srcAttribute = this.iframeSrc_ ? 'src="' + goog.string.htmlEscape(this.iframeSrc_) + '"' : "";
      document.write(goog.string.subs(goog.History.IFRAME_TEMPLATE_, iframeId, srcAttribute));
      iframe = goog.dom.getElement(iframeId)
    }
    this.iframe_ = iframe;
    this.unsetIframe_ = true
  }
  if(goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
    this.eventHandler_.listen(this.window_, goog.events.EventType.LOAD, this.onDocumentLoaded);
    this.documentLoaded = false;
    this.shouldEnable_ = false
  }
  if(this.userVisible_) {
    this.setHash_(this.getToken(), true)
  }else {
    this.setIframeToken_(this.hiddenInput_.value)
  }
  goog.History.historyCount_++
};
goog.inherits(goog.History, goog.events.EventTarget);
goog.History.prototype.enabled_ = false;
goog.History.prototype.longerPolling_ = false;
goog.History.prototype.lastToken_ = null;
goog.History.HAS_ONHASHCHANGE = goog.userAgent.IE && document.documentMode >= 8 || goog.userAgent.GECKO && goog.userAgent.isVersion("1.9.2") || goog.userAgent.WEBKIT && goog.userAgent.isVersion("532.1");
goog.History.prototype.lockedToken_ = null;
goog.History.prototype.disposeInternal = function() {
  goog.History.superClass_.disposeInternal.call(this);
  this.eventHandler_.dispose();
  this.setEnabled(false)
};
goog.History.prototype.setEnabled = function(enable) {
  if(enable == this.enabled_) {
    return
  }
  if(goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE && !this.documentLoaded) {
    this.shouldEnable_ = enable;
    return
  }
  if(enable) {
    if(goog.userAgent.OPERA) {
      this.eventHandler_.listen(this.window_.document, goog.History.INPUT_EVENTS_, this.operaDefibrillator_)
    }else {
      if(goog.userAgent.GECKO) {
        this.eventHandler_.listen(this.window_, "pageshow", this.onShow_)
      }
    }
    if(goog.History.HAS_ONHASHCHANGE && this.userVisible_) {
      this.eventHandler_.listen(this.window_, goog.events.EventType.HASHCHANGE, this.onHashChange_);
      this.enabled_ = true;
      this.dispatchEvent(new goog.history.Event(this.getToken(), false))
    }else {
      if(!goog.userAgent.IE || this.documentLoaded) {
        this.eventHandler_.listen(this.timer_, goog.Timer.TICK, goog.bind(this.check_, this, true));
        this.enabled_ = true;
        if(!goog.userAgent.IE) {
          this.lastToken_ = this.getToken()
        }
        this.timer_.start();
        this.dispatchEvent(new goog.history.Event(this.getToken(), false))
      }
    }
  }else {
    this.enabled_ = false;
    this.eventHandler_.removeAll();
    this.timer_.stop()
  }
};
goog.History.prototype.onDocumentLoaded = function() {
  this.documentLoaded = true;
  if(this.hiddenInput_.value) {
    this.setIframeToken_(this.hiddenInput_.value, true)
  }
  this.setEnabled(this.shouldEnable_)
};
goog.History.prototype.onShow_ = function(e) {
  if(e.getBrowserEvent()["persisted"]) {
    this.setEnabled(false);
    this.setEnabled(true)
  }
};
goog.History.prototype.onHashChange_ = function(e) {
  var hash = this.getLocationFragment_(this.window_);
  if(hash != this.lastToken_) {
    this.update_(hash, true)
  }
};
goog.History.prototype.getToken = function() {
  if(this.lockedToken_ != null) {
    return this.lockedToken_
  }else {
    if(this.userVisible_) {
      return this.getLocationFragment_(this.window_)
    }else {
      return this.getIframeToken_() || ""
    }
  }
};
goog.History.prototype.setToken = function(token, opt_title) {
  this.setHistoryState_(token, false, opt_title)
};
goog.History.prototype.replaceToken = function(token, opt_title) {
  this.setHistoryState_(token, true, opt_title)
};
goog.History.prototype.getLocationFragment_ = function(win) {
  var loc = win.location.href;
  var index = loc.indexOf("#");
  return index < 0 ? "" : loc.substring(index + 1)
};
goog.History.prototype.setHistoryState_ = function(token, replace, opt_title) {
  if(this.getToken() != token) {
    if(this.userVisible_) {
      this.setHash_(token, replace);
      if(!goog.History.HAS_ONHASHCHANGE) {
        if(goog.userAgent.IE) {
          this.setIframeToken_(token, replace, opt_title)
        }
      }
      if(this.enabled_) {
        this.check_(false)
      }
    }else {
      this.setIframeToken_(token, replace);
      this.lockedToken_ = this.lastToken_ = this.hiddenInput_.value = token;
      this.dispatchEvent(new goog.history.Event(token, false))
    }
  }
};
goog.History.prototype.setHash_ = function(hash, opt_replace) {
  var url = this.baseUrl_ + (hash || "");
  var loc = this.window_.location;
  if(url != loc.href) {
    if(opt_replace) {
      loc.replace(url)
    }else {
      loc.href = url
    }
  }
};
goog.History.prototype.setIframeToken_ = function(token, opt_replace, opt_title) {
  if(this.unsetIframe_ || token != this.getIframeToken_()) {
    this.unsetIframe_ = false;
    token = goog.string.urlEncode(token);
    if(goog.userAgent.IE) {
      var doc = goog.dom.getFrameContentDocument(this.iframe_);
      doc.open("text/html", opt_replace ? "replace" : undefined);
      doc.write(goog.string.subs(goog.History.IFRAME_SOURCE_TEMPLATE_, goog.string.htmlEscape(opt_title || this.window_.document.title), token));
      doc.close()
    }else {
      var url = this.iframeSrc_ + "#" + token;
      var contentWindow = this.iframe_.contentWindow;
      if(contentWindow) {
        if(opt_replace) {
          contentWindow.location.replace(url)
        }else {
          contentWindow.location.href = url
        }
      }
    }
  }
};
goog.History.prototype.getIframeToken_ = function() {
  if(goog.userAgent.IE) {
    var doc = goog.dom.getFrameContentDocument(this.iframe_);
    return doc.body ? goog.string.urlDecode(doc.body.innerHTML) : null
  }else {
    var contentWindow = this.iframe_.contentWindow;
    if(contentWindow) {
      var hash;
      try {
        hash = goog.string.urlDecode(this.getLocationFragment_(contentWindow))
      }catch(e) {
        if(!this.longerPolling_) {
          this.setLongerPolling_(true)
        }
        return null
      }
      if(this.longerPolling_) {
        this.setLongerPolling_(false)
      }
      return hash || null
    }else {
      return null
    }
  }
};
goog.History.prototype.check_ = function(isNavigation) {
  if(this.userVisible_) {
    var hash = this.getLocationFragment_(this.window_);
    if(hash != this.lastToken_) {
      this.update_(hash, isNavigation)
    }
  }
  if(!this.userVisible_ || goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
    var token = this.getIframeToken_() || "";
    if(this.lockedToken_ == null || token == this.lockedToken_) {
      this.lockedToken_ = null;
      if(token != this.lastToken_) {
        this.update_(token, isNavigation)
      }
    }
  }
};
goog.History.prototype.update_ = function(token, isNavigation) {
  this.lastToken_ = this.hiddenInput_.value = token;
  if(this.userVisible_) {
    if(goog.userAgent.IE && !goog.History.HAS_ONHASHCHANGE) {
      this.setIframeToken_(token)
    }
    this.setHash_(token)
  }else {
    this.setIframeToken_(token)
  }
  this.dispatchEvent(new goog.history.Event(this.getToken(), isNavigation))
};
goog.History.prototype.setLongerPolling_ = function(longerPolling) {
  if(this.longerPolling_ != longerPolling) {
    this.timer_.setInterval(longerPolling ? goog.History.PollingType.LONG : goog.History.PollingType.NORMAL)
  }
  this.longerPolling_ = longerPolling
};
goog.History.prototype.operaDefibrillator_ = function() {
  this.timer_.stop();
  this.timer_.start()
};
goog.History.INPUT_EVENTS_ = [goog.events.EventType.MOUSEDOWN, goog.events.EventType.KEYDOWN, goog.events.EventType.MOUSEMOVE];
goog.History.IFRAME_SOURCE_TEMPLATE_ = "<title>%s</title><body>%s</body>";
goog.History.IFRAME_TEMPLATE_ = '<iframe id="%s" style="display:none" %s></iframe>';
goog.History.INPUT_TEMPLATE_ = '<input type="text" name="%s" id="%s" style="display:none" />';
goog.History.historyCount_ = 0;
goog.History.PollingType = {NORMAL:150, LONG:1E4};
goog.History.EventType = goog.history.EventType;
goog.History.Event = goog.history.Event;
goog.provide("waltz.history");
goog.require("cljs.core");
goog.require("clojure.browser.event");
goog.require("goog.History");
goog.require("goog.history.Html5History");
waltz.history.create_history = function create_history() {
  var h__102105 = cljs.core.truth_(goog.history.Html5History.isSupported.call(null)) ? new goog.history.Html5History : new goog.History;
  h__102105.setEnabled(true);
  return h__102105
};
waltz.history.history = waltz.history.create_history.call(null);
waltz.history.set = function set(token) {
  return waltz.history.history.setToken(cljs.core.name.call(null, token))
};
waltz.history.get = function get() {
  var t__102106 = waltz.history.history.getToken();
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "", t__102106))) {
    return null
  }else {
    return cljs.core.keyword.call(null, t__102106)
  }
};
waltz.history.listen = function listen(callback) {
  return clojure.browser.event.listen.call(null, waltz.history.history, "navigate", callback)
};
goog.provide("goog.Uri");
goog.provide("goog.Uri.QueryData");
goog.require("goog.array");
goog.require("goog.string");
goog.require("goog.structs");
goog.require("goog.structs.Map");
goog.require("goog.uri.utils");
goog.require("goog.uri.utils.ComponentIndex");
goog.Uri = function(opt_uri, opt_ignoreCase) {
  var m;
  if(opt_uri instanceof goog.Uri) {
    this.setIgnoreCase(opt_ignoreCase == null ? opt_uri.getIgnoreCase() : opt_ignoreCase);
    this.setScheme(opt_uri.getScheme());
    this.setUserInfo(opt_uri.getUserInfo());
    this.setDomain(opt_uri.getDomain());
    this.setPort(opt_uri.getPort());
    this.setPath(opt_uri.getPath());
    this.setQueryData(opt_uri.getQueryData().clone());
    this.setFragment(opt_uri.getFragment())
  }else {
    if(opt_uri && (m = goog.uri.utils.split(String(opt_uri)))) {
      this.setIgnoreCase(!!opt_ignoreCase);
      this.setScheme(m[goog.uri.utils.ComponentIndex.SCHEME] || "", true);
      this.setUserInfo(m[goog.uri.utils.ComponentIndex.USER_INFO] || "", true);
      this.setDomain(m[goog.uri.utils.ComponentIndex.DOMAIN] || "", true);
      this.setPort(m[goog.uri.utils.ComponentIndex.PORT]);
      this.setPath(m[goog.uri.utils.ComponentIndex.PATH] || "", true);
      this.setQuery(m[goog.uri.utils.ComponentIndex.QUERY_DATA] || "", true);
      this.setFragment(m[goog.uri.utils.ComponentIndex.FRAGMENT] || "", true)
    }else {
      this.setIgnoreCase(!!opt_ignoreCase);
      this.queryData_ = new goog.Uri.QueryData(null, this, this.ignoreCase_)
    }
  }
};
goog.Uri.RANDOM_PARAM = goog.uri.utils.StandardQueryParam.RANDOM;
goog.Uri.prototype.scheme_ = "";
goog.Uri.prototype.userInfo_ = "";
goog.Uri.prototype.domain_ = "";
goog.Uri.prototype.port_ = null;
goog.Uri.prototype.path_ = "";
goog.Uri.prototype.queryData_;
goog.Uri.prototype.fragment_ = "";
goog.Uri.prototype.isReadOnly_ = false;
goog.Uri.prototype.ignoreCase_ = false;
goog.Uri.prototype.toString = function() {
  if(this.cachedToString_) {
    return this.cachedToString_
  }
  var out = [];
  if(this.scheme_) {
    out.push(goog.Uri.encodeSpecialChars_(this.scheme_, goog.Uri.reDisallowedInSchemeOrUserInfo_), ":")
  }
  if(this.domain_) {
    out.push("//");
    if(this.userInfo_) {
      out.push(goog.Uri.encodeSpecialChars_(this.userInfo_, goog.Uri.reDisallowedInSchemeOrUserInfo_), "@")
    }
    out.push(goog.Uri.encodeString_(this.domain_));
    if(this.port_ != null) {
      out.push(":", String(this.getPort()))
    }
  }
  if(this.path_) {
    if(this.hasDomain() && this.path_.charAt(0) != "/") {
      out.push("/")
    }
    out.push(goog.Uri.encodeSpecialChars_(this.path_, goog.Uri.reDisallowedInPath_))
  }
  var query = String(this.queryData_);
  if(query) {
    out.push("?", query)
  }
  if(this.fragment_) {
    out.push("#", goog.Uri.encodeSpecialChars_(this.fragment_, goog.Uri.reDisallowedInFragment_))
  }
  return this.cachedToString_ = out.join("")
};
goog.Uri.prototype.resolve = function(relativeUri) {
  var absoluteUri = this.clone();
  var overridden = relativeUri.hasScheme();
  if(overridden) {
    absoluteUri.setScheme(relativeUri.getScheme())
  }else {
    overridden = relativeUri.hasUserInfo()
  }
  if(overridden) {
    absoluteUri.setUserInfo(relativeUri.getUserInfo())
  }else {
    overridden = relativeUri.hasDomain()
  }
  if(overridden) {
    absoluteUri.setDomain(relativeUri.getDomain())
  }else {
    overridden = relativeUri.hasPort()
  }
  var path = relativeUri.getPath();
  if(overridden) {
    absoluteUri.setPort(relativeUri.getPort())
  }else {
    overridden = relativeUri.hasPath();
    if(overridden) {
      if(path.charAt(0) != "/") {
        if(this.hasDomain() && !this.hasPath()) {
          path = "/" + path
        }else {
          var lastSlashIndex = absoluteUri.getPath().lastIndexOf("/");
          if(lastSlashIndex != -1) {
            path = absoluteUri.getPath().substr(0, lastSlashIndex + 1) + path
          }
        }
      }
      path = goog.Uri.removeDotSegments(path)
    }
  }
  if(overridden) {
    absoluteUri.setPath(path)
  }else {
    overridden = relativeUri.hasQuery()
  }
  if(overridden) {
    absoluteUri.setQuery(relativeUri.getDecodedQuery())
  }else {
    overridden = relativeUri.hasFragment()
  }
  if(overridden) {
    absoluteUri.setFragment(relativeUri.getFragment())
  }
  return absoluteUri
};
goog.Uri.prototype.clone = function() {
  return goog.Uri.create(this.scheme_, this.userInfo_, this.domain_, this.port_, this.path_, this.queryData_.clone(), this.fragment_, this.ignoreCase_)
};
goog.Uri.prototype.getScheme = function() {
  return this.scheme_
};
goog.Uri.prototype.setScheme = function(newScheme, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.scheme_ = opt_decode ? goog.Uri.decodeOrEmpty_(newScheme) : newScheme;
  if(this.scheme_) {
    this.scheme_ = this.scheme_.replace(/:$/, "")
  }
  return this
};
goog.Uri.prototype.hasScheme = function() {
  return!!this.scheme_
};
goog.Uri.prototype.getUserInfo = function() {
  return this.userInfo_
};
goog.Uri.prototype.setUserInfo = function(newUserInfo, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.userInfo_ = opt_decode ? goog.Uri.decodeOrEmpty_(newUserInfo) : newUserInfo;
  return this
};
goog.Uri.prototype.hasUserInfo = function() {
  return!!this.userInfo_
};
goog.Uri.prototype.getDomain = function() {
  return this.domain_
};
goog.Uri.prototype.setDomain = function(newDomain, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.domain_ = opt_decode ? goog.Uri.decodeOrEmpty_(newDomain) : newDomain;
  return this
};
goog.Uri.prototype.hasDomain = function() {
  return!!this.domain_
};
goog.Uri.prototype.getPort = function() {
  return this.port_
};
goog.Uri.prototype.setPort = function(newPort) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  if(newPort) {
    newPort = Number(newPort);
    if(isNaN(newPort) || newPort < 0) {
      throw Error("Bad port number " + newPort);
    }
    this.port_ = newPort
  }else {
    this.port_ = null
  }
  return this
};
goog.Uri.prototype.hasPort = function() {
  return this.port_ != null
};
goog.Uri.prototype.getPath = function() {
  return this.path_
};
goog.Uri.prototype.setPath = function(newPath, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.path_ = opt_decode ? goog.Uri.decodeOrEmpty_(newPath) : newPath;
  return this
};
goog.Uri.prototype.hasPath = function() {
  return!!this.path_
};
goog.Uri.prototype.hasQuery = function() {
  return this.queryData_.toString() !== ""
};
goog.Uri.prototype.setQueryData = function(queryData, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  if(queryData instanceof goog.Uri.QueryData) {
    this.queryData_ = queryData;
    this.queryData_.uri_ = this;
    this.queryData_.setIgnoreCase(this.ignoreCase_)
  }else {
    if(!opt_decode) {
      queryData = goog.Uri.encodeSpecialChars_(queryData, goog.Uri.reDisallowedInQuery_)
    }
    this.queryData_ = new goog.Uri.QueryData(queryData, this, this.ignoreCase_)
  }
  return this
};
goog.Uri.prototype.setQuery = function(newQuery, opt_decode) {
  return this.setQueryData(newQuery, opt_decode)
};
goog.Uri.prototype.getEncodedQuery = function() {
  return this.queryData_.toString()
};
goog.Uri.prototype.getDecodedQuery = function() {
  return this.queryData_.toDecodedString()
};
goog.Uri.prototype.getQueryData = function() {
  return this.queryData_
};
goog.Uri.prototype.getQuery = function() {
  return this.getEncodedQuery()
};
goog.Uri.prototype.setParameterValue = function(key, value) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.queryData_.set(key, value);
  return this
};
goog.Uri.prototype.setParameterValues = function(key, values) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  if(!goog.isArray(values)) {
    values = [String(values)]
  }
  this.queryData_.setValues(key, values);
  return this
};
goog.Uri.prototype.getParameterValues = function(name) {
  return this.queryData_.getValues(name)
};
goog.Uri.prototype.getParameterValue = function(paramName) {
  return this.queryData_.get(paramName)
};
goog.Uri.prototype.getFragment = function() {
  return this.fragment_
};
goog.Uri.prototype.setFragment = function(newFragment, opt_decode) {
  this.enforceReadOnly();
  delete this.cachedToString_;
  this.fragment_ = opt_decode ? goog.Uri.decodeOrEmpty_(newFragment) : newFragment;
  return this
};
goog.Uri.prototype.hasFragment = function() {
  return!!this.fragment_
};
goog.Uri.prototype.hasSameDomainAs = function(uri2) {
  return(!this.hasDomain() && !uri2.hasDomain() || this.getDomain() == uri2.getDomain()) && (!this.hasPort() && !uri2.hasPort() || this.getPort() == uri2.getPort())
};
goog.Uri.prototype.makeUnique = function() {
  this.enforceReadOnly();
  this.setParameterValue(goog.Uri.RANDOM_PARAM, goog.string.getRandomString());
  return this
};
goog.Uri.prototype.removeParameter = function(key) {
  this.enforceReadOnly();
  this.queryData_.remove(key);
  return this
};
goog.Uri.prototype.setReadOnly = function(isReadOnly) {
  this.isReadOnly_ = isReadOnly;
  return this
};
goog.Uri.prototype.isReadOnly = function() {
  return this.isReadOnly_
};
goog.Uri.prototype.enforceReadOnly = function() {
  if(this.isReadOnly_) {
    throw Error("Tried to modify a read-only Uri");
  }
};
goog.Uri.prototype.setIgnoreCase = function(ignoreCase) {
  this.ignoreCase_ = ignoreCase;
  if(this.queryData_) {
    this.queryData_.setIgnoreCase(ignoreCase)
  }
  return this
};
goog.Uri.prototype.getIgnoreCase = function() {
  return this.ignoreCase_
};
goog.Uri.parse = function(uri, opt_ignoreCase) {
  return uri instanceof goog.Uri ? uri.clone() : new goog.Uri(uri, opt_ignoreCase)
};
goog.Uri.create = function(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_query, opt_fragment, opt_ignoreCase) {
  var uri = new goog.Uri(null, opt_ignoreCase);
  opt_scheme && uri.setScheme(opt_scheme);
  opt_userInfo && uri.setUserInfo(opt_userInfo);
  opt_domain && uri.setDomain(opt_domain);
  opt_port && uri.setPort(opt_port);
  opt_path && uri.setPath(opt_path);
  opt_query && uri.setQueryData(opt_query);
  opt_fragment && uri.setFragment(opt_fragment);
  return uri
};
goog.Uri.resolve = function(base, rel) {
  if(!(base instanceof goog.Uri)) {
    base = goog.Uri.parse(base)
  }
  if(!(rel instanceof goog.Uri)) {
    rel = goog.Uri.parse(rel)
  }
  return base.resolve(rel)
};
goog.Uri.removeDotSegments = function(path) {
  if(path == ".." || path == ".") {
    return""
  }else {
    if(!goog.string.contains(path, "./") && !goog.string.contains(path, "/.")) {
      return path
    }else {
      var leadingSlash = goog.string.startsWith(path, "/");
      var segments = path.split("/");
      var out = [];
      for(var pos = 0;pos < segments.length;) {
        var segment = segments[pos++];
        if(segment == ".") {
          if(leadingSlash && pos == segments.length) {
            out.push("")
          }
        }else {
          if(segment == "..") {
            if(out.length > 1 || out.length == 1 && out[0] != "") {
              out.pop()
            }
            if(leadingSlash && pos == segments.length) {
              out.push("")
            }
          }else {
            out.push(segment);
            leadingSlash = true
          }
        }
      }
      return out.join("/")
    }
  }
};
goog.Uri.decodeOrEmpty_ = function(val) {
  return val ? decodeURIComponent(val) : ""
};
goog.Uri.encodeString_ = function(unescapedPart) {
  if(goog.isString(unescapedPart)) {
    return encodeURIComponent(unescapedPart)
  }
  return null
};
goog.Uri.encodeSpecialRegExp_ = /^[a-zA-Z0-9\-_.!~*'():\/;?]*$/;
goog.Uri.encodeSpecialChars_ = function(unescapedPart, extra) {
  var ret = null;
  if(goog.isString(unescapedPart)) {
    ret = unescapedPart;
    if(!goog.Uri.encodeSpecialRegExp_.test(ret)) {
      ret = encodeURI(unescapedPart)
    }
    if(ret.search(extra) >= 0) {
      ret = ret.replace(extra, goog.Uri.encodeChar_)
    }
  }
  return ret
};
goog.Uri.encodeChar_ = function(ch) {
  var n = ch.charCodeAt(0);
  return"%" + (n >> 4 & 15).toString(16) + (n & 15).toString(16)
};
goog.Uri.reDisallowedInSchemeOrUserInfo_ = /[#\/\?@]/g;
goog.Uri.reDisallowedInPath_ = /[\#\?]/g;
goog.Uri.reDisallowedInQuery_ = /[\#\?@]/g;
goog.Uri.reDisallowedInFragment_ = /#/g;
goog.Uri.haveSameDomain = function(uri1String, uri2String) {
  var pieces1 = goog.uri.utils.split(uri1String);
  var pieces2 = goog.uri.utils.split(uri2String);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] == pieces2[goog.uri.utils.ComponentIndex.DOMAIN] && pieces1[goog.uri.utils.ComponentIndex.PORT] == pieces2[goog.uri.utils.ComponentIndex.PORT]
};
goog.Uri.QueryData = function(opt_query, opt_uri, opt_ignoreCase) {
  this.encodedQuery_ = opt_query || null;
  this.uri_ = opt_uri || null;
  this.ignoreCase_ = !!opt_ignoreCase
};
goog.Uri.QueryData.prototype.ensureKeyMapInitialized_ = function() {
  if(!this.keyMap_) {
    this.keyMap_ = new goog.structs.Map;
    if(this.encodedQuery_) {
      var pairs = this.encodedQuery_.split("&");
      for(var i = 0;i < pairs.length;i++) {
        var indexOfEquals = pairs[i].indexOf("=");
        var name = null;
        var value = null;
        if(indexOfEquals >= 0) {
          name = pairs[i].substring(0, indexOfEquals);
          value = pairs[i].substring(indexOfEquals + 1)
        }else {
          name = pairs[i]
        }
        name = goog.string.urlDecode(name);
        name = this.getKeyName_(name);
        this.add(name, value ? goog.string.urlDecode(value) : "")
      }
    }
  }
};
goog.Uri.QueryData.createFromMap = function(map, opt_uri, opt_ignoreCase) {
  var keys = goog.structs.getKeys(map);
  if(typeof keys == "undefined") {
    throw Error("Keys are undefined");
  }
  return goog.Uri.QueryData.createFromKeysValues(keys, goog.structs.getValues(map), opt_uri, opt_ignoreCase)
};
goog.Uri.QueryData.createFromKeysValues = function(keys, values, opt_uri, opt_ignoreCase) {
  if(keys.length != values.length) {
    throw Error("Mismatched lengths for keys/values");
  }
  var queryData = new goog.Uri.QueryData(null, opt_uri, opt_ignoreCase);
  for(var i = 0;i < keys.length;i++) {
    queryData.add(keys[i], values[i])
  }
  return queryData
};
goog.Uri.QueryData.prototype.keyMap_ = null;
goog.Uri.QueryData.prototype.count_ = null;
goog.Uri.QueryData.decodedQuery_ = null;
goog.Uri.QueryData.prototype.getCount = function() {
  this.ensureKeyMapInitialized_();
  return this.count_
};
goog.Uri.QueryData.prototype.add = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  if(!this.containsKey(key)) {
    this.keyMap_.set(key, value)
  }else {
    var current = this.keyMap_.get(key);
    if(goog.isArray(current)) {
      current.push(value)
    }else {
      this.keyMap_.set(key, [current, value])
    }
  }
  this.count_++;
  return this
};
goog.Uri.QueryData.prototype.remove = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  if(this.keyMap_.containsKey(key)) {
    this.invalidateCache_();
    var old = this.keyMap_.get(key);
    if(goog.isArray(old)) {
      this.count_ -= old.length
    }else {
      this.count_--
    }
    return this.keyMap_.remove(key)
  }
  return false
};
goog.Uri.QueryData.prototype.clear = function() {
  this.invalidateCache_();
  if(this.keyMap_) {
    this.keyMap_.clear()
  }
  this.count_ = 0
};
goog.Uri.QueryData.prototype.isEmpty = function() {
  this.ensureKeyMapInitialized_();
  return this.count_ == 0
};
goog.Uri.QueryData.prototype.containsKey = function(key) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  return this.keyMap_.containsKey(key)
};
goog.Uri.QueryData.prototype.containsValue = function(value) {
  var vals = this.getValues();
  return goog.array.contains(vals, value)
};
goog.Uri.QueryData.prototype.getKeys = function() {
  this.ensureKeyMapInitialized_();
  var vals = this.keyMap_.getValues();
  var keys = this.keyMap_.getKeys();
  var rv = [];
  for(var i = 0;i < keys.length;i++) {
    var val = vals[i];
    if(goog.isArray(val)) {
      for(var j = 0;j < val.length;j++) {
        rv.push(keys[i])
      }
    }else {
      rv.push(keys[i])
    }
  }
  return rv
};
goog.Uri.QueryData.prototype.getValues = function(opt_key) {
  this.ensureKeyMapInitialized_();
  var rv;
  if(opt_key) {
    var key = this.getKeyName_(opt_key);
    if(this.containsKey(key)) {
      var value = this.keyMap_.get(key);
      if(goog.isArray(value)) {
        return value
      }else {
        rv = [];
        rv.push(value)
      }
    }else {
      rv = []
    }
  }else {
    var vals = this.keyMap_.getValues();
    rv = [];
    for(var i = 0;i < vals.length;i++) {
      var val = vals[i];
      if(goog.isArray(val)) {
        goog.array.extend(rv, val)
      }else {
        rv.push(val)
      }
    }
  }
  return rv
};
goog.Uri.QueryData.prototype.set = function(key, value) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  if(this.containsKey(key)) {
    var old = this.keyMap_.get(key);
    if(goog.isArray(old)) {
      this.count_ -= old.length
    }else {
      this.count_--
    }
  }
  this.keyMap_.set(key, value);
  this.count_++;
  return this
};
goog.Uri.QueryData.prototype.get = function(key, opt_default) {
  this.ensureKeyMapInitialized_();
  key = this.getKeyName_(key);
  if(this.containsKey(key)) {
    var val = this.keyMap_.get(key);
    if(goog.isArray(val)) {
      return val[0]
    }else {
      return val
    }
  }else {
    return opt_default
  }
};
goog.Uri.QueryData.prototype.setValues = function(key, values) {
  this.ensureKeyMapInitialized_();
  this.invalidateCache_();
  key = this.getKeyName_(key);
  if(this.containsKey(key)) {
    var old = this.keyMap_.get(key);
    if(goog.isArray(old)) {
      this.count_ -= old.length
    }else {
      this.count_--
    }
  }
  if(values.length > 0) {
    this.keyMap_.set(key, values);
    this.count_ += values.length
  }
};
goog.Uri.QueryData.prototype.toString = function() {
  if(this.encodedQuery_) {
    return this.encodedQuery_
  }
  if(!this.keyMap_) {
    return""
  }
  var sb = [];
  var count = 0;
  var keys = this.keyMap_.getKeys();
  for(var i = 0;i < keys.length;i++) {
    var key = keys[i];
    var encodedKey = goog.string.urlEncode(key);
    var val = this.keyMap_.get(key);
    if(goog.isArray(val)) {
      for(var j = 0;j < val.length;j++) {
        if(count > 0) {
          sb.push("&")
        }
        sb.push(encodedKey);
        if(val[j] !== "") {
          sb.push("=", goog.string.urlEncode(val[j]))
        }
        count++
      }
    }else {
      if(count > 0) {
        sb.push("&")
      }
      sb.push(encodedKey);
      if(val !== "") {
        sb.push("=", goog.string.urlEncode(val))
      }
      count++
    }
  }
  return this.encodedQuery_ = sb.join("")
};
goog.Uri.QueryData.prototype.toDecodedString = function() {
  if(!this.decodedQuery_) {
    this.decodedQuery_ = goog.Uri.decodeOrEmpty_(this.toString())
  }
  return this.decodedQuery_
};
goog.Uri.QueryData.prototype.invalidateCache_ = function() {
  delete this.decodedQuery_;
  delete this.encodedQuery_;
  if(this.uri_) {
    delete this.uri_.cachedToString_
  }
};
goog.Uri.QueryData.prototype.filterKeys = function(keys) {
  this.ensureKeyMapInitialized_();
  goog.structs.forEach(this.keyMap_, function(value, key, map) {
    if(!goog.array.contains(keys, key)) {
      this.remove(key)
    }
  }, this);
  return this
};
goog.Uri.QueryData.prototype.clone = function() {
  var rv = new goog.Uri.QueryData;
  if(this.decodedQuery_) {
    rv.decodedQuery_ = this.decodedQuery_
  }
  if(this.encodedQuery_) {
    rv.encodedQuery_ = this.encodedQuery_
  }
  if(this.keyMap_) {
    rv.keyMap_ = this.keyMap_.clone()
  }
  return rv
};
goog.Uri.QueryData.prototype.getKeyName_ = function(arg) {
  var keyName = String(arg);
  if(this.ignoreCase_) {
    keyName = keyName.toLowerCase()
  }
  return keyName
};
goog.Uri.QueryData.prototype.setIgnoreCase = function(ignoreCase) {
  var resetKeys = ignoreCase && !this.ignoreCase_;
  if(resetKeys) {
    this.ensureKeyMapInitialized_();
    this.invalidateCache_();
    goog.structs.forEach(this.keyMap_, function(value, key, map) {
      var lowerCase = key.toLowerCase();
      if(key != lowerCase) {
        this.remove(key);
        this.add(lowerCase, value)
      }
    }, this)
  }
  this.ignoreCase_ = ignoreCase
};
goog.Uri.QueryData.prototype.extend = function(var_args) {
  for(var i = 0;i < arguments.length;i++) {
    var data = arguments[i];
    goog.structs.forEach(data, function(value, key) {
      this.add(key, value)
    }, this)
  }
};
goog.provide("goog.messaging.MessageChannel");
goog.messaging.MessageChannel = function() {
};
goog.messaging.MessageChannel.prototype.connect = function(opt_connectCb) {
};
goog.messaging.MessageChannel.prototype.isConnected = function() {
};
goog.messaging.MessageChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) {
};
goog.messaging.MessageChannel.prototype.registerDefaultService = function(callback) {
};
goog.messaging.MessageChannel.prototype.send = function(serviceName, payload) {
};
goog.provide("goog.messaging.AbstractChannel");
goog.require("goog.Disposable");
goog.require("goog.debug");
goog.require("goog.debug.Logger");
goog.require("goog.json");
goog.require("goog.messaging.MessageChannel");
goog.messaging.AbstractChannel = function() {
  goog.base(this);
  this.services_ = {}
};
goog.inherits(goog.messaging.AbstractChannel, goog.Disposable);
goog.messaging.AbstractChannel.prototype.defaultService_;
goog.messaging.AbstractChannel.prototype.logger = goog.debug.Logger.getLogger("goog.messaging.AbstractChannel");
goog.messaging.AbstractChannel.prototype.connect = function(opt_connectCb) {
  if(opt_connectCb) {
    opt_connectCb()
  }
};
goog.messaging.AbstractChannel.prototype.isConnected = function() {
  return true
};
goog.messaging.AbstractChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) {
  this.services_[serviceName] = {callback:callback, objectPayload:!!opt_objectPayload}
};
goog.messaging.AbstractChannel.prototype.registerDefaultService = function(callback) {
  this.defaultService_ = callback
};
goog.messaging.AbstractChannel.prototype.send = goog.abstractMethod;
goog.messaging.AbstractChannel.prototype.deliver = function(serviceName, payload) {
  var service = this.getService(serviceName, payload);
  if(!service) {
    return
  }
  payload = this.decodePayload(serviceName, payload, service.objectPayload);
  if(goog.isDefAndNotNull(payload)) {
    service.callback(payload)
  }
};
goog.messaging.AbstractChannel.prototype.getService = function(serviceName, payload) {
  var service = this.services_[serviceName];
  if(service) {
    return service
  }else {
    if(this.defaultService_) {
      var callback = goog.partial(this.defaultService_, serviceName);
      var objectPayload = goog.isObject(payload);
      return{callback:callback, objectPayload:objectPayload}
    }
  }
  this.logger.warning('Unknown service name "' + serviceName + '"');
  return null
};
goog.messaging.AbstractChannel.prototype.decodePayload = function(serviceName, payload, objectPayload) {
  if(objectPayload && goog.isString(payload)) {
    try {
      return goog.json.parse(payload)
    }catch(err) {
      this.logger.warning("Expected JSON payload for " + serviceName + ', was "' + payload + '"');
      return null
    }
  }else {
    if(!objectPayload && !goog.isString(payload)) {
      return goog.json.serialize(payload)
    }
  }
  return payload
};
goog.messaging.AbstractChannel.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  goog.dispose(this.logger);
  delete this.logger;
  delete this.services_;
  delete this.defaultService_
};
goog.provide("goog.net.xpc");
goog.provide("goog.net.xpc.CfgFields");
goog.provide("goog.net.xpc.ChannelStates");
goog.provide("goog.net.xpc.TransportNames");
goog.provide("goog.net.xpc.TransportTypes");
goog.provide("goog.net.xpc.UriCfgFields");
goog.require("goog.debug.Logger");
goog.net.xpc.TransportTypes = {NATIVE_MESSAGING:1, FRAME_ELEMENT_METHOD:2, IFRAME_RELAY:3, IFRAME_POLLING:4, FLASH:5, NIX:6};
goog.net.xpc.TransportNames = {1:"NativeMessagingTransport", 2:"FrameElementMethodTransport", 3:"IframeRelayTransport", 4:"IframePollingTransport", 5:"FlashTransport", 6:"NixTransport"};
goog.net.xpc.CfgFields = {CHANNEL_NAME:"cn", AUTH_TOKEN:"at", REMOTE_AUTH_TOKEN:"rat", PEER_URI:"pu", IFRAME_ID:"ifrid", TRANSPORT:"tp", LOCAL_RELAY_URI:"lru", PEER_RELAY_URI:"pru", LOCAL_POLL_URI:"lpu", PEER_POLL_URI:"ppu", PEER_HOSTNAME:"ph"};
goog.net.xpc.UriCfgFields = [goog.net.xpc.CfgFields.PEER_URI, goog.net.xpc.CfgFields.LOCAL_RELAY_URI, goog.net.xpc.CfgFields.PEER_RELAY_URI, goog.net.xpc.CfgFields.LOCAL_POLL_URI, goog.net.xpc.CfgFields.PEER_POLL_URI];
goog.net.xpc.ChannelStates = {NOT_CONNECTED:1, CONNECTED:2, CLOSED:3};
goog.net.xpc.TRANSPORT_SERVICE_ = "tp";
goog.net.xpc.SETUP = "SETUP";
goog.net.xpc.SETUP_ACK_ = "SETUP_ACK";
goog.net.xpc.channels_ = {};
goog.net.xpc.getRandomString = function(length, opt_characters) {
  var chars = opt_characters || goog.net.xpc.randomStringCharacters_;
  var charsLength = chars.length;
  var s = "";
  while(length-- > 0) {
    s += chars.charAt(Math.floor(Math.random() * charsLength))
  }
  return s
};
goog.net.xpc.randomStringCharacters_ = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
goog.net.xpc.logger = goog.debug.Logger.getLogger("goog.net.xpc");
goog.provide("goog.net.xpc.Transport");
goog.require("goog.Disposable");
goog.require("goog.net.xpc");
goog.net.xpc.Transport = function(opt_domHelper) {
  goog.Disposable.call(this);
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper()
};
goog.inherits(goog.net.xpc.Transport, goog.Disposable);
goog.net.xpc.Transport.prototype.transportType = 0;
goog.net.xpc.Transport.prototype.getType = function() {
  return this.transportType
};
goog.net.xpc.Transport.prototype.getWindow = function() {
  return this.domHelper_.getWindow()
};
goog.net.xpc.Transport.prototype.getName = function() {
  return goog.net.xpc.TransportNames[this.transportType] || ""
};
goog.net.xpc.Transport.prototype.transportServiceHandler = goog.abstractMethod;
goog.net.xpc.Transport.prototype.connect = goog.abstractMethod;
goog.net.xpc.Transport.prototype.send = goog.abstractMethod;
goog.provide("goog.net.xpc.FrameElementMethodTransport");
goog.require("goog.net.xpc");
goog.require("goog.net.xpc.Transport");
goog.net.xpc.FrameElementMethodTransport = function(channel, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.channel_ = channel;
  this.queue_ = [];
  this.deliverQueuedCb_ = goog.bind(this.deliverQueued_, this)
};
goog.inherits(goog.net.xpc.FrameElementMethodTransport, goog.net.xpc.Transport);
goog.net.xpc.FrameElementMethodTransport.prototype.transportType = goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD;
goog.net.xpc.FrameElementMethodTransport.prototype.recursive_ = false;
goog.net.xpc.FrameElementMethodTransport.prototype.timer_ = 0;
goog.net.xpc.FrameElementMethodTransport.outgoing_ = null;
goog.net.xpc.FrameElementMethodTransport.prototype.connect = function() {
  if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) {
    this.iframeElm_ = this.channel_.iframeElement_;
    this.iframeElm_["XPC_toOuter"] = goog.bind(this.incoming_, this)
  }else {
    this.attemptSetup_()
  }
};
goog.net.xpc.FrameElementMethodTransport.prototype.attemptSetup_ = function() {
  var retry = true;
  try {
    if(!this.iframeElm_) {
      this.iframeElm_ = this.getWindow().frameElement
    }
    if(this.iframeElm_ && this.iframeElm_["XPC_toOuter"]) {
      this.outgoing_ = this.iframeElm_["XPC_toOuter"];
      this.iframeElm_["XPC_toOuter"]["XPC_toInner"] = goog.bind(this.incoming_, this);
      retry = false;
      this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
      this.channel_.notifyConnected_()
    }
  }catch(e) {
    goog.net.xpc.logger.severe("exception caught while attempting setup: " + e)
  }
  if(retry) {
    if(!this.attemptSetupCb_) {
      this.attemptSetupCb_ = goog.bind(this.attemptSetup_, this)
    }
    this.getWindow().setTimeout(this.attemptSetupCb_, 100)
  }
};
goog.net.xpc.FrameElementMethodTransport.prototype.transportServiceHandler = function(payload) {
  if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER && !this.channel_.isConnected() && payload == goog.net.xpc.SETUP_ACK_) {
    this.outgoing_ = this.iframeElm_["XPC_toOuter"]["XPC_toInner"];
    this.channel_.notifyConnected_()
  }else {
    throw Error("Got unexpected transport message.");
  }
};
goog.net.xpc.FrameElementMethodTransport.prototype.incoming_ = function(serviceName, payload) {
  if(!this.recursive_ && this.queue_.length == 0) {
    this.channel_.deliver_(serviceName, payload)
  }else {
    this.queue_.push({serviceName:serviceName, payload:payload});
    if(this.queue_.length == 1) {
      this.timer_ = this.getWindow().setTimeout(this.deliverQueuedCb_, 1)
    }
  }
};
goog.net.xpc.FrameElementMethodTransport.prototype.deliverQueued_ = function() {
  while(this.queue_.length) {
    var msg = this.queue_.shift();
    this.channel_.deliver_(msg.serviceName, msg.payload)
  }
};
goog.net.xpc.FrameElementMethodTransport.prototype.send = function(service, payload) {
  this.recursive_ = true;
  this.outgoing_(service, payload);
  this.recursive_ = false
};
goog.net.xpc.FrameElementMethodTransport.prototype.disposeInternal = function() {
  goog.net.xpc.FrameElementMethodTransport.superClass_.disposeInternal.call(this);
  this.outgoing_ = null;
  this.iframeElm_ = null
};
goog.provide("goog.net.xpc.IframePollingTransport");
goog.provide("goog.net.xpc.IframePollingTransport.Receiver");
goog.provide("goog.net.xpc.IframePollingTransport.Sender");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.net.xpc");
goog.require("goog.net.xpc.Transport");
goog.require("goog.userAgent");
goog.net.xpc.IframePollingTransport = function(channel, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.channel_ = channel;
  this.sendUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI];
  this.rcvUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI];
  this.sendQueue_ = []
};
goog.inherits(goog.net.xpc.IframePollingTransport, goog.net.xpc.Transport);
goog.net.xpc.IframePollingTransport.prototype.transportType = goog.net.xpc.TransportTypes.IFRAME_POLLING;
goog.net.xpc.IframePollingTransport.prototype.sequence_ = 0;
goog.net.xpc.IframePollingTransport.prototype.waitForAck_ = false;
goog.net.xpc.IframePollingTransport.prototype.initialized_ = false;
goog.net.xpc.IframePollingTransport.IFRAME_PREFIX = "googlexpc";
goog.net.xpc.IframePollingTransport.prototype.getMsgFrameName_ = function() {
  return goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + "_" + this.channel_.name + "_msg"
};
goog.net.xpc.IframePollingTransport.prototype.getAckFrameName_ = function() {
  return goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + "_" + this.channel_.name + "_ack"
};
goog.net.xpc.IframePollingTransport.prototype.connect = function() {
  goog.net.xpc.logger.fine("transport connect called");
  if(!this.initialized_) {
    goog.net.xpc.logger.fine("initializing...");
    this.constructSenderFrames_();
    this.initialized_ = true
  }
  this.checkForeignFramesReady_()
};
goog.net.xpc.IframePollingTransport.prototype.constructSenderFrames_ = function() {
  var name = this.getMsgFrameName_();
  this.msgIframeElm_ = this.constructSenderFrame_(name);
  this.msgWinObj_ = this.getWindow().frames[name];
  name = this.getAckFrameName_();
  this.ackIframeElm_ = this.constructSenderFrame_(name);
  this.ackWinObj_ = this.getWindow().frames[name]
};
goog.net.xpc.IframePollingTransport.prototype.constructSenderFrame_ = function(id) {
  goog.net.xpc.logger.finest("constructing sender frame: " + id);
  var ifr = goog.dom.createElement("iframe");
  var s = ifr.style;
  s.position = "absolute";
  s.top = "-10px";
  s.left = "10px";
  s.width = "1px";
  s.height = "1px";
  ifr.id = ifr.name = id;
  ifr.src = this.sendUri_ + "#INITIAL";
  this.getWindow().document.body.appendChild(ifr);
  return ifr
};
goog.net.xpc.IframePollingTransport.prototype.innerPeerReconnect_ = function() {
  goog.net.xpc.logger.finest("innerPeerReconnect called");
  this.channel_.name = goog.net.xpc.getRandomString(10);
  goog.net.xpc.logger.finest("switching channels: " + this.channel_.name);
  this.deconstructSenderFrames_();
  this.initialized_ = false;
  this.reconnectFrame_ = this.constructSenderFrame_(goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + "_reconnect_" + this.channel_.name)
};
goog.net.xpc.IframePollingTransport.prototype.outerPeerReconnect_ = function() {
  goog.net.xpc.logger.finest("outerPeerReconnect called");
  var frames = this.channel_.peerWindowObject_.frames;
  var length = frames.length;
  for(var i = 0;i < length;i++) {
    var frameName;
    try {
      if(frames[i] && frames[i].name) {
        frameName = frames[i].name
      }
    }catch(e) {
    }
    if(!frameName) {
      continue
    }
    var message = frameName.split("_");
    if(message.length == 3 && message[0] == goog.net.xpc.IframePollingTransport.IFRAME_PREFIX && message[1] == "reconnect") {
      this.channel_.name = message[2];
      this.deconstructSenderFrames_();
      this.initialized_ = false;
      break
    }
  }
};
goog.net.xpc.IframePollingTransport.prototype.deconstructSenderFrames_ = function() {
  goog.net.xpc.logger.finest("deconstructSenderFrames called");
  if(this.msgIframeElm_) {
    this.msgIframeElm_.parentNode.removeChild(this.msgIframeElm_);
    this.msgIframeElm_ = null;
    this.msgWinObj_ = null
  }
  if(this.ackIframeElm_) {
    this.ackIframeElm_.parentNode.removeChild(this.ackIframeElm_);
    this.ackIframeElm_ = null;
    this.ackWinObj_ = null
  }
};
goog.net.xpc.IframePollingTransport.prototype.checkForeignFramesReady_ = function() {
  if(!(this.isRcvFrameReady_(this.getMsgFrameName_()) && this.isRcvFrameReady_(this.getAckFrameName_()))) {
    goog.net.xpc.logger.finest("foreign frames not (yet) present");
    if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.INNER && !this.reconnectFrame_) {
      this.innerPeerReconnect_()
    }else {
      if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) {
        this.outerPeerReconnect_()
      }
    }
    this.getWindow().setTimeout(goog.bind(this.connect, this), 100)
  }else {
    goog.net.xpc.logger.fine("foreign frames present");
    this.msgReceiver_ = new goog.net.xpc.IframePollingTransport.Receiver(this, this.channel_.peerWindowObject_.frames[this.getMsgFrameName_()], goog.bind(this.processIncomingMsg, this));
    this.ackReceiver_ = new goog.net.xpc.IframePollingTransport.Receiver(this, this.channel_.peerWindowObject_.frames[this.getAckFrameName_()], goog.bind(this.processIncomingAck, this));
    this.checkLocalFramesPresent_()
  }
};
goog.net.xpc.IframePollingTransport.prototype.isRcvFrameReady_ = function(frameName) {
  goog.net.xpc.logger.finest("checking for receive frame: " + frameName);
  try {
    var winObj = this.channel_.peerWindowObject_.frames[frameName];
    if(!winObj || winObj.location.href.indexOf(this.rcvUri_) != 0) {
      return false
    }
  }catch(e) {
    return false
  }
  return true
};
goog.net.xpc.IframePollingTransport.prototype.checkLocalFramesPresent_ = function() {
  var frames = this.channel_.peerWindowObject_.frames;
  if(!(frames[this.getAckFrameName_()] && frames[this.getMsgFrameName_()])) {
    if(!this.checkLocalFramesPresentCb_) {
      this.checkLocalFramesPresentCb_ = goog.bind(this.checkLocalFramesPresent_, this)
    }
    this.getWindow().setTimeout(this.checkLocalFramesPresentCb_, 100);
    goog.net.xpc.logger.fine("local frames not (yet) present")
  }else {
    this.msgSender_ = new goog.net.xpc.IframePollingTransport.Sender(this.sendUri_, this.msgWinObj_);
    this.ackSender_ = new goog.net.xpc.IframePollingTransport.Sender(this.sendUri_, this.ackWinObj_);
    goog.net.xpc.logger.fine("local frames ready");
    this.getWindow().setTimeout(goog.bind(function() {
      this.msgSender_.send(goog.net.xpc.SETUP);
      this.sentConnectionSetup_ = true;
      this.waitForAck_ = true;
      goog.net.xpc.logger.fine("SETUP sent")
    }, this), 100)
  }
};
goog.net.xpc.IframePollingTransport.prototype.checkIfConnected_ = function() {
  if(this.sentConnectionSetupAck_ && this.rcvdConnectionSetupAck_) {
    this.channel_.notifyConnected_();
    if(this.deliveryQueue_) {
      goog.net.xpc.logger.fine("delivering queued messages " + "(" + this.deliveryQueue_.length + ")");
      for(var i = 0, m;i < this.deliveryQueue_.length;i++) {
        m = this.deliveryQueue_[i];
        this.channel_.deliver_(m.service, m.payload)
      }
      delete this.deliveryQueue_
    }
  }else {
    goog.net.xpc.logger.finest("checking if connected: " + "ack sent:" + this.sentConnectionSetupAck_ + ", ack rcvd: " + this.rcvdConnectionSetupAck_)
  }
};
goog.net.xpc.IframePollingTransport.prototype.processIncomingMsg = function(raw) {
  goog.net.xpc.logger.finest("msg received: " + raw);
  if(raw == goog.net.xpc.SETUP) {
    if(!this.ackSender_) {
      return
    }
    this.ackSender_.send(goog.net.xpc.SETUP_ACK_);
    goog.net.xpc.logger.finest("SETUP_ACK sent");
    this.sentConnectionSetupAck_ = true;
    this.checkIfConnected_()
  }else {
    if(this.channel_.isConnected() || this.sentConnectionSetupAck_) {
      var pos = raw.indexOf("|");
      var head = raw.substring(0, pos);
      var frame = raw.substring(pos + 1);
      pos = head.indexOf(",");
      if(pos == -1) {
        var seq = head;
        this.ackSender_.send("ACK:" + seq);
        this.deliverPayload_(frame)
      }else {
        var seq = head.substring(0, pos);
        this.ackSender_.send("ACK:" + seq);
        var partInfo = head.substring(pos + 1).split("/");
        var part0 = parseInt(partInfo[0], 10);
        var part1 = parseInt(partInfo[1], 10);
        if(part0 == 1) {
          this.parts_ = []
        }
        this.parts_.push(frame);
        if(part0 == part1) {
          this.deliverPayload_(this.parts_.join(""));
          delete this.parts_
        }
      }
    }else {
      goog.net.xpc.logger.warning("received msg, but channel is not connected")
    }
  }
};
goog.net.xpc.IframePollingTransport.prototype.processIncomingAck = function(msgStr) {
  goog.net.xpc.logger.finest("ack received: " + msgStr);
  if(msgStr == goog.net.xpc.SETUP_ACK_) {
    this.waitForAck_ = false;
    this.rcvdConnectionSetupAck_ = true;
    this.checkIfConnected_()
  }else {
    if(this.channel_.isConnected()) {
      if(!this.waitForAck_) {
        goog.net.xpc.logger.warning("got unexpected ack");
        return
      }
      var seq = parseInt(msgStr.split(":")[1], 10);
      if(seq == this.sequence_) {
        this.waitForAck_ = false;
        this.sendNextFrame_()
      }else {
        goog.net.xpc.logger.warning("got ack with wrong sequence")
      }
    }else {
      goog.net.xpc.logger.warning("received ack, but channel not connected")
    }
  }
};
goog.net.xpc.IframePollingTransport.prototype.sendNextFrame_ = function() {
  if(this.waitForAck_ || !this.sendQueue_.length) {
    return
  }
  var s = this.sendQueue_.shift();
  ++this.sequence_;
  this.msgSender_.send(this.sequence_ + s);
  goog.net.xpc.logger.finest("msg sent: " + this.sequence_ + s);
  this.waitForAck_ = true
};
goog.net.xpc.IframePollingTransport.prototype.deliverPayload_ = function(s) {
  var pos = s.indexOf(":");
  var service = s.substr(0, pos);
  var payload = s.substring(pos + 1);
  if(!this.channel_.isConnected()) {
    (this.deliveryQueue_ || (this.deliveryQueue_ = [])).push({service:service, payload:payload});
    goog.net.xpc.logger.finest("queued delivery")
  }else {
    this.channel_.deliver_(service, payload)
  }
};
goog.net.xpc.IframePollingTransport.prototype.MAX_FRAME_LENGTH_ = 3800;
goog.net.xpc.IframePollingTransport.prototype.send = function(service, payload) {
  var frame = service + ":" + payload;
  if(!goog.userAgent.IE || payload.length <= this.MAX_FRAME_LENGTH_) {
    this.sendQueue_.push("|" + frame)
  }else {
    var l = payload.length;
    var num = Math.ceil(l / this.MAX_FRAME_LENGTH_);
    var pos = 0;
    var i = 1;
    while(pos < l) {
      this.sendQueue_.push("," + i + "/" + num + "|" + frame.substr(pos, this.MAX_FRAME_LENGTH_));
      i++;
      pos += this.MAX_FRAME_LENGTH_
    }
  }
  this.sendNextFrame_()
};
goog.net.xpc.IframePollingTransport.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  var receivers = goog.net.xpc.IframePollingTransport.receivers_;
  goog.array.remove(receivers, this.msgReceiver_);
  goog.array.remove(receivers, this.ackReceiver_);
  this.msgReceiver_ = this.ackReceiver_ = null;
  goog.dom.removeNode(this.msgIframeElm_);
  goog.dom.removeNode(this.ackIframeElm_);
  this.msgIframeElm_ = this.ackIframeElm_ = null;
  this.msgWinObj_ = this.ackWinObj_ = null
};
goog.net.xpc.IframePollingTransport.receivers_ = [];
goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_ = 10;
goog.net.xpc.IframePollingTransport.TIME_POLL_LONG_ = 100;
goog.net.xpc.IframePollingTransport.TIME_SHORT_POLL_AFTER_ACTIVITY_ = 1E3;
goog.net.xpc.IframePollingTransport.receive_ = function() {
  var rcvd = false;
  try {
    for(var i = 0, l = goog.net.xpc.IframePollingTransport.receivers_.length;i < l;i++) {
      rcvd = rcvd || goog.net.xpc.IframePollingTransport.receivers_[i].receive()
    }
  }catch(e) {
    goog.net.xpc.logger.info("receive_() failed: " + e);
    goog.net.xpc.IframePollingTransport.receivers_[i].transport_.channel_.notifyTransportError_();
    if(!goog.net.xpc.IframePollingTransport.receivers_.length) {
      return
    }
  }
  var now = goog.now();
  if(rcvd) {
    goog.net.xpc.IframePollingTransport.lastActivity_ = now
  }
  var t = now - goog.net.xpc.IframePollingTransport.lastActivity_ < goog.net.xpc.IframePollingTransport.TIME_SHORT_POLL_AFTER_ACTIVITY_ ? goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_ : goog.net.xpc.IframePollingTransport.TIME_POLL_LONG_;
  goog.net.xpc.IframePollingTransport.rcvTimer_ = window.setTimeout(goog.net.xpc.IframePollingTransport.receiveCb_, t)
};
goog.net.xpc.IframePollingTransport.receiveCb_ = goog.bind(goog.net.xpc.IframePollingTransport.receive_, goog.net.xpc.IframePollingTransport);
goog.net.xpc.IframePollingTransport.startRcvTimer_ = function() {
  goog.net.xpc.logger.fine("starting receive-timer");
  goog.net.xpc.IframePollingTransport.lastActivity_ = goog.now();
  if(goog.net.xpc.IframePollingTransport.rcvTimer_) {
    window.clearTimeout(goog.net.xpc.IframePollingTransport.rcvTimer_)
  }
  goog.net.xpc.IframePollingTransport.rcvTimer_ = window.setTimeout(goog.net.xpc.IframePollingTransport.receiveCb_, goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_)
};
goog.net.xpc.IframePollingTransport.Sender = function(url, windowObj) {
  this.sendUri_ = url;
  this.sendFrame_ = windowObj;
  this.cycle_ = 0
};
goog.net.xpc.IframePollingTransport.Sender.prototype.send = function(payload) {
  this.cycle_ = ++this.cycle_ % 2;
  var url = this.sendUri_ + "#" + this.cycle_ + encodeURIComponent(payload);
  try {
    if(goog.userAgent.WEBKIT) {
      this.sendFrame_.location.href = url
    }else {
      this.sendFrame_.location.replace(url)
    }
  }catch(e) {
    goog.net.xpc.logger.severe("sending failed", e)
  }
  goog.net.xpc.IframePollingTransport.startRcvTimer_()
};
goog.net.xpc.IframePollingTransport.Receiver = function(transport, windowObj, callback) {
  this.transport_ = transport;
  this.rcvFrame_ = windowObj;
  this.cb_ = callback;
  this.currentLoc_ = this.rcvFrame_.location.href.split("#")[0] + "#INITIAL";
  goog.net.xpc.IframePollingTransport.receivers_.push(this);
  goog.net.xpc.IframePollingTransport.startRcvTimer_()
};
goog.net.xpc.IframePollingTransport.Receiver.prototype.receive = function() {
  var loc = this.rcvFrame_.location.href;
  if(loc != this.currentLoc_) {
    this.currentLoc_ = loc;
    var payload = loc.split("#")[1];
    if(payload) {
      payload = payload.substr(1);
      this.cb_(decodeURIComponent(payload))
    }
    return true
  }else {
    return false
  }
};
goog.provide("goog.net.xpc.IframeRelayTransport");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.net.xpc");
goog.require("goog.net.xpc.Transport");
goog.require("goog.userAgent");
goog.net.xpc.IframeRelayTransport = function(channel, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.channel_ = channel;
  this.peerRelayUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.PEER_RELAY_URI];
  this.peerIframeId_ = this.channel_.cfg_[goog.net.xpc.CfgFields.IFRAME_ID];
  if(goog.userAgent.WEBKIT) {
    goog.net.xpc.IframeRelayTransport.startCleanupTimer_()
  }
};
goog.inherits(goog.net.xpc.IframeRelayTransport, goog.net.xpc.Transport);
if(goog.userAgent.WEBKIT) {
  goog.net.xpc.IframeRelayTransport.iframeRefs_ = [];
  goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_ = 1E3;
  goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_ = 3E3;
  goog.net.xpc.IframeRelayTransport.cleanupTimer_ = 0;
  goog.net.xpc.IframeRelayTransport.startCleanupTimer_ = function() {
    if(!goog.net.xpc.IframeRelayTransport.cleanupTimer_) {
      goog.net.xpc.IframeRelayTransport.cleanupTimer_ = window.setTimeout(function() {
        goog.net.xpc.IframeRelayTransport.cleanup_()
      }, goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_)
    }
  };
  goog.net.xpc.IframeRelayTransport.cleanup_ = function(opt_maxAge) {
    var now = goog.now();
    var maxAge = opt_maxAge || goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_;
    while(goog.net.xpc.IframeRelayTransport.iframeRefs_.length && now - goog.net.xpc.IframeRelayTransport.iframeRefs_[0].timestamp >= maxAge) {
      var ifr = goog.net.xpc.IframeRelayTransport.iframeRefs_.shift().iframeElement;
      goog.dom.removeNode(ifr);
      goog.net.xpc.logger.finest("iframe removed")
    }
    goog.net.xpc.IframeRelayTransport.cleanupTimer_ = window.setTimeout(goog.net.xpc.IframeRelayTransport.cleanupCb_, goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_)
  };
  goog.net.xpc.IframeRelayTransport.cleanupCb_ = function() {
    goog.net.xpc.IframeRelayTransport.cleanup_()
  }
}
goog.net.xpc.IframeRelayTransport.IE_PAYLOAD_MAX_SIZE_ = 1800;
goog.net.xpc.IframeRelayTransport.FragmentInfo;
goog.net.xpc.IframeRelayTransport.fragmentMap_ = {};
goog.net.xpc.IframeRelayTransport.prototype.transportType = goog.net.xpc.TransportTypes.IFRAME_RELAY;
goog.net.xpc.IframeRelayTransport.prototype.connect = function() {
  if(!this.getWindow()["xpcRelay"]) {
    this.getWindow()["xpcRelay"] = goog.net.xpc.IframeRelayTransport.receiveMessage_
  }
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP)
};
goog.net.xpc.IframeRelayTransport.receiveMessage_ = function(channelName, frame) {
  var pos = frame.indexOf(":");
  var header = frame.substr(0, pos);
  var payload = frame.substr(pos + 1);
  if(!goog.userAgent.IE || (pos = header.indexOf("|")) == -1) {
    var service = header
  }else {
    var service = header.substr(0, pos);
    var fragmentIdStr = header.substr(pos + 1);
    pos = fragmentIdStr.indexOf("+");
    var messageIdStr = fragmentIdStr.substr(0, pos);
    var fragmentNum = parseInt(fragmentIdStr.substr(pos + 1), 10);
    var fragmentInfo = goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr];
    if(!fragmentInfo) {
      fragmentInfo = goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr] = {fragments:[], received:0, expected:0}
    }
    if(goog.string.contains(fragmentIdStr, "++")) {
      fragmentInfo.expected = fragmentNum + 1
    }
    fragmentInfo.fragments[fragmentNum] = payload;
    fragmentInfo.received++;
    if(fragmentInfo.received != fragmentInfo.expected) {
      return
    }
    payload = fragmentInfo.fragments.join("");
    delete goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr]
  }
  goog.net.xpc.channels_[channelName].deliver_(service, decodeURIComponent(payload))
};
goog.net.xpc.IframeRelayTransport.prototype.transportServiceHandler = function(payload) {
  if(payload == goog.net.xpc.SETUP) {
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
    this.channel_.notifyConnected_()
  }else {
    if(payload == goog.net.xpc.SETUP_ACK_) {
      this.channel_.notifyConnected_()
    }
  }
};
goog.net.xpc.IframeRelayTransport.prototype.send = function(service, payload) {
  var encodedPayload = encodeURIComponent(payload);
  var encodedLen = encodedPayload.length;
  var maxSize = goog.net.xpc.IframeRelayTransport.IE_PAYLOAD_MAX_SIZE_;
  if(goog.userAgent.IE && encodedLen > maxSize) {
    var messageIdStr = goog.string.getRandomString();
    for(var startIndex = 0, fragmentNum = 0;startIndex < encodedLen;fragmentNum++) {
      var payloadFragment = encodedPayload.substr(startIndex, maxSize);
      startIndex += maxSize;
      var fragmentIdStr = messageIdStr + (startIndex >= encodedLen ? "++" : "+") + fragmentNum;
      this.send_(service, payloadFragment, fragmentIdStr)
    }
  }else {
    this.send_(service, encodedPayload)
  }
};
goog.net.xpc.IframeRelayTransport.prototype.send_ = function(service, encodedPayload, opt_fragmentIdStr) {
  if(goog.userAgent.IE) {
    var div = this.getWindow().document.createElement("div");
    div.innerHTML = '<iframe onload="this.xpcOnload()"></iframe>';
    var ifr = div.childNodes[0];
    div = null;
    ifr["xpcOnload"] = goog.net.xpc.IframeRelayTransport.iframeLoadHandler_
  }else {
    var ifr = this.getWindow().document.createElement("iframe");
    if(goog.userAgent.WEBKIT) {
      goog.net.xpc.IframeRelayTransport.iframeRefs_.push({timestamp:goog.now(), iframeElement:ifr})
    }else {
      goog.events.listen(ifr, "load", goog.net.xpc.IframeRelayTransport.iframeLoadHandler_)
    }
  }
  var style = ifr.style;
  style.visibility = "hidden";
  style.width = ifr.style.height = "0px";
  style.position = "absolute";
  var url = this.peerRelayUri_;
  url += "#" + this.channel_.name;
  if(this.peerIframeId_) {
    url += "," + this.peerIframeId_
  }
  url += "|" + service;
  if(opt_fragmentIdStr) {
    url += "|" + opt_fragmentIdStr
  }
  url += ":" + encodedPayload;
  ifr.src = url;
  this.getWindow().document.body.appendChild(ifr);
  goog.net.xpc.logger.finest("msg sent: " + url)
};
goog.net.xpc.IframeRelayTransport.iframeLoadHandler_ = function() {
  goog.net.xpc.logger.finest("iframe-load");
  goog.dom.removeNode(this);
  this.xpcOnload = null
};
goog.net.xpc.IframeRelayTransport.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  if(goog.userAgent.WEBKIT) {
    goog.net.xpc.IframeRelayTransport.cleanup_(0)
  }
};
goog.provide("goog.net.xpc.NativeMessagingTransport");
goog.require("goog.events");
goog.require("goog.net.xpc");
goog.require("goog.net.xpc.Transport");
goog.net.xpc.NativeMessagingTransport = function(channel, peerHostname, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.channel_ = channel;
  this.peerHostname_ = peerHostname || "*"
};
goog.inherits(goog.net.xpc.NativeMessagingTransport, goog.net.xpc.Transport);
goog.net.xpc.NativeMessagingTransport.prototype.initialized_ = false;
goog.net.xpc.NativeMessagingTransport.prototype.transportType = goog.net.xpc.TransportTypes.NATIVE_MESSAGING;
goog.net.xpc.NativeMessagingTransport.activeCount_ = {};
goog.net.xpc.NativeMessagingTransport.initialize_ = function(listenWindow) {
  var uid = goog.getUid(listenWindow);
  var value = goog.net.xpc.NativeMessagingTransport.activeCount_[uid];
  if(!goog.isNumber(value)) {
    value = 0
  }
  if(value == 0) {
    goog.events.listen(listenWindow.postMessage ? listenWindow : listenWindow.document, "message", goog.net.xpc.NativeMessagingTransport.messageReceived_, false, goog.net.xpc.NativeMessagingTransport)
  }
  goog.net.xpc.NativeMessagingTransport.activeCount_[uid] = value + 1
};
goog.net.xpc.NativeMessagingTransport.messageReceived_ = function(msgEvt) {
  var data = msgEvt.getBrowserEvent().data;
  var headDelim = data.indexOf("|");
  var serviceDelim = data.indexOf(":");
  if(headDelim == -1 || serviceDelim == -1) {
    return false
  }
  var channelName = data.substring(0, headDelim);
  var service = data.substring(headDelim + 1, serviceDelim);
  var payload = data.substring(serviceDelim + 1);
  goog.net.xpc.logger.fine("messageReceived: channel=" + channelName + ", service=" + service + ", payload=" + payload);
  var channel = goog.net.xpc.channels_[channelName];
  if(channel) {
    channel.deliver_(service, payload, msgEvt.getBrowserEvent().origin);
    return true
  }
  for(var staleChannelName in goog.net.xpc.channels_) {
    var staleChannel = goog.net.xpc.channels_[staleChannelName];
    if(staleChannel.getRole() == goog.net.xpc.CrossPageChannel.Role.INNER && !staleChannel.isConnected() && service == goog.net.xpc.TRANSPORT_SERVICE_ && payload == goog.net.xpc.SETUP) {
      goog.net.xpc.logger.fine("changing channel name to " + channelName);
      staleChannel.name = channelName;
      delete goog.net.xpc.channels_[staleChannelName];
      goog.net.xpc.channels_[channelName] = staleChannel;
      staleChannel.deliver_(service, payload);
      return true
    }
  }
  goog.net.xpc.logger.info('channel name mismatch; message ignored"');
  return false
};
goog.net.xpc.NativeMessagingTransport.prototype.transportServiceHandler = function(payload) {
  switch(payload) {
    case goog.net.xpc.SETUP:
      this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_);
      break;
    case goog.net.xpc.SETUP_ACK_:
      this.channel_.notifyConnected_();
      break
  }
};
goog.net.xpc.NativeMessagingTransport.prototype.connect = function() {
  goog.net.xpc.NativeMessagingTransport.initialize_(this.getWindow());
  this.initialized_ = true;
  this.connectWithRetries_()
};
goog.net.xpc.NativeMessagingTransport.prototype.connectWithRetries_ = function() {
  if(this.channel_.isConnected() || this.isDisposed()) {
    return
  }
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP);
  this.getWindow().setTimeout(goog.bind(this.connectWithRetries_, this), 100)
};
goog.net.xpc.NativeMessagingTransport.prototype.send = function(service, payload) {
  var win = this.channel_.peerWindowObject_;
  if(!win) {
    goog.net.xpc.logger.fine("send(): window not ready");
    return
  }
  var obj = win.postMessage ? win : win.document;
  this.send = function(service, payload) {
    goog.net.xpc.logger.fine("send(): payload=" + payload + " to hostname=" + this.peerHostname_);
    obj.postMessage(this.channel_.name + "|" + service + ":" + payload, this.peerHostname_)
  };
  this.send(service, payload)
};
goog.net.xpc.NativeMessagingTransport.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  if(this.initialized_) {
    var listenWindow = this.getWindow();
    var uid = goog.getUid(listenWindow);
    var value = goog.net.xpc.NativeMessagingTransport.activeCount_[uid];
    goog.net.xpc.NativeMessagingTransport.activeCount_[uid] = value - 1;
    if(value == 1) {
      goog.events.unlisten(listenWindow.postMessage ? listenWindow : listenWindow.document, "message", goog.net.xpc.NativeMessagingTransport.messageReceived_, false, goog.net.xpc.NativeMessagingTransport)
    }
  }
};
goog.provide("goog.net.xpc.NixTransport");
goog.require("goog.net.xpc");
goog.require("goog.net.xpc.Transport");
goog.net.xpc.NixTransport = function(channel, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.channel_ = channel;
  this.authToken_ = channel[goog.net.xpc.CfgFields.AUTH_TOKEN] || "";
  this.remoteAuthToken_ = channel[goog.net.xpc.CfgFields.REMOTE_AUTH_TOKEN] || "";
  goog.net.xpc.NixTransport.conductGlobalSetup_(this.getWindow());
  this[goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE] = this.handleMessage_;
  this[goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL] = this.createChannel_
};
goog.inherits(goog.net.xpc.NixTransport, goog.net.xpc.Transport);
goog.net.xpc.NixTransport.NIX_WRAPPER = "GCXPC____NIXVBS_wrapper";
goog.net.xpc.NixTransport.NIX_GET_WRAPPER = "GCXPC____NIXVBS_get_wrapper";
goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE = "GCXPC____NIXJS_handle_message";
goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL = "GCXPC____NIXJS_create_channel";
goog.net.xpc.NixTransport.NIX_ID_FIELD = "GCXPC____NIXVBS_container";
goog.net.xpc.NixTransport.conductGlobalSetup_ = function(listenWindow) {
  if(listenWindow["nix_setup_complete"]) {
    return
  }
  var vbscript = "Class " + goog.net.xpc.NixTransport.NIX_WRAPPER + "\n " + "Private m_Transport\n" + "Private m_Auth\n" + "Public Sub SetTransport(transport)\n" + "If isEmpty(m_Transport) Then\n" + "Set m_Transport = transport\n" + "End If\n" + "End Sub\n" + "Public Sub SetAuth(auth)\n" + "If isEmpty(m_Auth) Then\n" + "m_Auth = auth\n" + "End If\n" + "End Sub\n" + "Public Function GetAuthToken()\n " + "GetAuthToken = m_Auth\n" + "End Function\n" + "Public Sub SendMessage(service, payload)\n " + 
  "Call m_Transport." + goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE + "(service, payload)\n" + "End Sub\n" + "Public Sub CreateChannel(channel)\n " + "Call m_Transport." + goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL + "(channel)\n" + "End Sub\n" + "Public Sub " + goog.net.xpc.NixTransport.NIX_ID_FIELD + "()\n " + "End Sub\n" + "End Class\n " + "Function " + goog.net.xpc.NixTransport.NIX_GET_WRAPPER + "(transport, auth)\n" + "Dim wrap\n" + "Set wrap = New " + goog.net.xpc.NixTransport.NIX_WRAPPER + 
  "\n" + "wrap.SetTransport transport\n" + "wrap.SetAuth auth\n" + "Set " + goog.net.xpc.NixTransport.NIX_GET_WRAPPER + " = wrap\n" + "End Function";
  try {
    listenWindow.execScript(vbscript, "vbscript");
    listenWindow["nix_setup_complete"] = true
  }catch(e) {
    goog.net.xpc.logger.severe("exception caught while attempting global setup: " + e)
  }
};
goog.net.xpc.NixTransport.prototype.transportType = goog.net.xpc.TransportTypes.NIX;
goog.net.xpc.NixTransport.prototype.localSetupCompleted_ = false;
goog.net.xpc.NixTransport.prototype.nixChannel_ = null;
goog.net.xpc.NixTransport.prototype.connect = function() {
  if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) {
    this.attemptOuterSetup_()
  }else {
    this.attemptInnerSetup_()
  }
};
goog.net.xpc.NixTransport.prototype.attemptOuterSetup_ = function() {
  if(this.localSetupCompleted_) {
    return
  }
  var innerFrame = this.channel_.iframeElement_;
  try {
    innerFrame.contentWindow.opener = this.getWindow()[goog.net.xpc.NixTransport.NIX_GET_WRAPPER](this, this.authToken_);
    this.localSetupCompleted_ = true
  }catch(e) {
    goog.net.xpc.logger.severe("exception caught while attempting setup: " + e)
  }
  if(!this.localSetupCompleted_) {
    this.getWindow().setTimeout(goog.bind(this.attemptOuterSetup_, this), 100)
  }
};
goog.net.xpc.NixTransport.prototype.attemptInnerSetup_ = function() {
  if(this.localSetupCompleted_) {
    return
  }
  try {
    var opener = this.getWindow().opener;
    if(opener && goog.net.xpc.NixTransport.NIX_ID_FIELD in opener) {
      this.nixChannel_ = opener;
      var remoteAuthToken = this.nixChannel_["GetAuthToken"]();
      if(remoteAuthToken != this.remoteAuthToken_) {
        goog.net.xpc.logger.severe("Invalid auth token from other party");
        return
      }
      this.nixChannel_["CreateChannel"](this.getWindow()[goog.net.xpc.NixTransport.NIX_GET_WRAPPER](this, this.authToken_));
      this.localSetupCompleted_ = true;
      this.channel_.notifyConnected_()
    }
  }catch(e) {
    goog.net.xpc.logger.severe("exception caught while attempting setup: " + e);
    return
  }
  if(!this.localSetupCompleted_) {
    this.getWindow().setTimeout(goog.bind(this.attemptInnerSetup_, this), 100)
  }
};
goog.net.xpc.NixTransport.prototype.createChannel_ = function(channel) {
  if(typeof channel != "unknown" || !(goog.net.xpc.NixTransport.NIX_ID_FIELD in channel)) {
    goog.net.xpc.logger.severe("Invalid NIX channel given to createChannel_")
  }
  this.nixChannel_ = channel;
  var remoteAuthToken = this.nixChannel_["GetAuthToken"]();
  if(remoteAuthToken != this.remoteAuthToken_) {
    goog.net.xpc.logger.severe("Invalid auth token from other party");
    return
  }
  this.channel_.notifyConnected_()
};
goog.net.xpc.NixTransport.prototype.handleMessage_ = function(serviceName, payload) {
  function deliveryHandler() {
    this.channel_.deliver_(serviceName, payload)
  }
  this.getWindow().setTimeout(goog.bind(deliveryHandler, this), 1)
};
goog.net.xpc.NixTransport.prototype.send = function(service, payload) {
  if(typeof this.nixChannel_ !== "unknown") {
    goog.net.xpc.logger.severe("NIX channel not connected")
  }
  this.nixChannel_["SendMessage"](service, payload)
};
goog.net.xpc.NixTransport.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  this.nixChannel_ = null
};
goog.provide("goog.net.xpc.CrossPageChannel");
goog.provide("goog.net.xpc.CrossPageChannel.Role");
goog.require("goog.Disposable");
goog.require("goog.Uri");
goog.require("goog.dom");
goog.require("goog.events");
goog.require("goog.json");
goog.require("goog.messaging.AbstractChannel");
goog.require("goog.net.xpc");
goog.require("goog.net.xpc.FrameElementMethodTransport");
goog.require("goog.net.xpc.IframePollingTransport");
goog.require("goog.net.xpc.IframeRelayTransport");
goog.require("goog.net.xpc.NativeMessagingTransport");
goog.require("goog.net.xpc.NixTransport");
goog.require("goog.net.xpc.Transport");
goog.require("goog.userAgent");
goog.net.xpc.CrossPageChannel = function(cfg, opt_domHelper) {
  goog.base(this);
  for(var i = 0, uriField;uriField = goog.net.xpc.UriCfgFields[i];i++) {
    if(uriField in cfg && !/^https?:\/\//.test(cfg[uriField])) {
      throw Error("URI " + cfg[uriField] + " is invalid for field " + uriField);
    }
  }
  this.cfg_ = cfg;
  this.name = this.cfg_[goog.net.xpc.CfgFields.CHANNEL_NAME] || goog.net.xpc.getRandomString(10);
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper();
  goog.net.xpc.channels_[this.name] = this;
  goog.events.listen(window, "unload", goog.net.xpc.CrossPageChannel.disposeAll_);
  goog.net.xpc.logger.info("CrossPageChannel created: " + this.name)
};
goog.inherits(goog.net.xpc.CrossPageChannel, goog.messaging.AbstractChannel);
goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_ESCAPE_RE_ = new RegExp("^%*" + goog.net.xpc.TRANSPORT_SERVICE_ + "$");
goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_UNESCAPE_RE_ = new RegExp("^%+" + goog.net.xpc.TRANSPORT_SERVICE_ + "$");
goog.net.xpc.CrossPageChannel.prototype.transport_ = null;
goog.net.xpc.CrossPageChannel.prototype.state_ = goog.net.xpc.ChannelStates.NOT_CONNECTED;
goog.net.xpc.CrossPageChannel.prototype.isConnected = function() {
  return this.state_ == goog.net.xpc.ChannelStates.CONNECTED
};
goog.net.xpc.CrossPageChannel.prototype.peerWindowObject_ = null;
goog.net.xpc.CrossPageChannel.prototype.iframeElement_ = null;
goog.net.xpc.CrossPageChannel.prototype.setPeerWindowObject = function(peerWindowObject) {
  this.peerWindowObject_ = peerWindowObject
};
goog.net.xpc.CrossPageChannel.prototype.determineTransportType_ = function() {
  var transportType;
  if(goog.isFunction(document.postMessage) || goog.isFunction(window.postMessage) || goog.userAgent.IE && window.postMessage) {
    transportType = goog.net.xpc.TransportTypes.NATIVE_MESSAGING
  }else {
    if(goog.userAgent.GECKO) {
      transportType = goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD
    }else {
      if(goog.userAgent.IE && this.cfg_[goog.net.xpc.CfgFields.PEER_RELAY_URI]) {
        transportType = goog.net.xpc.TransportTypes.IFRAME_RELAY
      }else {
        if(goog.userAgent.IE) {
          transportType = goog.net.xpc.TransportTypes.NIX
        }else {
          if(this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI] && this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]) {
            transportType = goog.net.xpc.TransportTypes.IFRAME_POLLING
          }
        }
      }
    }
  }
  return transportType
};
goog.net.xpc.CrossPageChannel.prototype.createTransport_ = function() {
  if(this.transport_) {
    return
  }
  if(!this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]) {
    this.cfg_[goog.net.xpc.CfgFields.TRANSPORT] = this.determineTransportType_()
  }
  switch(this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]) {
    case goog.net.xpc.TransportTypes.NATIVE_MESSAGING:
      this.transport_ = new goog.net.xpc.NativeMessagingTransport(this, this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME], this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.NIX:
      this.transport_ = new goog.net.xpc.NixTransport(this, this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD:
      this.transport_ = new goog.net.xpc.FrameElementMethodTransport(this, this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.IFRAME_RELAY:
      this.transport_ = new goog.net.xpc.IframeRelayTransport(this, this.domHelper_);
      break;
    case goog.net.xpc.TransportTypes.IFRAME_POLLING:
      this.transport_ = new goog.net.xpc.IframePollingTransport(this, this.domHelper_);
      break
  }
  if(this.transport_) {
    goog.net.xpc.logger.info("Transport created: " + this.transport_.getName())
  }else {
    throw Error("CrossPageChannel: No suitable transport found!");
  }
};
goog.net.xpc.CrossPageChannel.prototype.getTransportType = function() {
  return this.transport_.getType()
};
goog.net.xpc.CrossPageChannel.prototype.getTransportName = function() {
  return this.transport_.getName()
};
goog.net.xpc.CrossPageChannel.prototype.getPeerConfiguration = function() {
  var peerCfg = {};
  peerCfg[goog.net.xpc.CfgFields.CHANNEL_NAME] = this.name;
  peerCfg[goog.net.xpc.CfgFields.TRANSPORT] = this.cfg_[goog.net.xpc.CfgFields.TRANSPORT];
  if(this.cfg_[goog.net.xpc.CfgFields.LOCAL_RELAY_URI]) {
    peerCfg[goog.net.xpc.CfgFields.PEER_RELAY_URI] = this.cfg_[goog.net.xpc.CfgFields.LOCAL_RELAY_URI]
  }
  if(this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]) {
    peerCfg[goog.net.xpc.CfgFields.PEER_POLL_URI] = this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]
  }
  if(this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]) {
    peerCfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI] = this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]
  }
  return peerCfg
};
goog.net.xpc.CrossPageChannel.prototype.createPeerIframe = function(parentElm, opt_configureIframeCb, opt_addCfgParam) {
  var iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID];
  if(!iframeId) {
    iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID] = "xpcpeer" + goog.net.xpc.getRandomString(4)
  }
  var iframeElm = goog.dom.createElement("IFRAME");
  iframeElm.id = iframeElm.name = iframeId;
  if(opt_configureIframeCb) {
    opt_configureIframeCb(iframeElm)
  }else {
    iframeElm.style.width = iframeElm.style.height = "100%"
  }
  var peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI];
  if(goog.isString(peerUri)) {
    peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI] = new goog.Uri(peerUri)
  }
  if(opt_addCfgParam !== false) {
    peerUri.setParameterValue("xpc", goog.json.serialize(this.getPeerConfiguration()))
  }
  if(goog.userAgent.GECKO || goog.userAgent.WEBKIT) {
    this.deferConnect_ = true;
    window.setTimeout(goog.bind(function() {
      this.deferConnect_ = false;
      parentElm.appendChild(iframeElm);
      iframeElm.src = peerUri.toString();
      goog.net.xpc.logger.info("peer iframe created (" + iframeId + ")");
      if(this.connectDeferred_) {
        this.connect(this.connectCb_)
      }
    }, this), 1)
  }else {
    iframeElm.src = peerUri.toString();
    parentElm.appendChild(iframeElm);
    goog.net.xpc.logger.info("peer iframe created (" + iframeId + ")")
  }
  return iframeElm
};
goog.net.xpc.CrossPageChannel.prototype.deferConnect_ = false;
goog.net.xpc.CrossPageChannel.prototype.connectDeferred_ = false;
goog.net.xpc.CrossPageChannel.prototype.connect = function(opt_connectCb) {
  this.connectCb_ = opt_connectCb || goog.nullFunction;
  if(this.deferConnect_) {
    goog.net.xpc.logger.info("connect() deferred");
    this.connectDeferred_ = true;
    return
  }
  goog.net.xpc.logger.info("connect()");
  if(this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]) {
    this.iframeElement_ = this.domHelper_.getElement(this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID])
  }
  if(this.iframeElement_) {
    var winObj = this.iframeElement_.contentWindow;
    if(!winObj) {
      winObj = window.frames[this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]]
    }
    this.setPeerWindowObject(winObj)
  }
  if(!this.peerWindowObject_) {
    if(window == top) {
      throw Error("CrossPageChannel: Can't connect, peer window-object not set.");
    }else {
      this.setPeerWindowObject(window.parent)
    }
  }
  this.createTransport_();
  this.transport_.connect()
};
goog.net.xpc.CrossPageChannel.prototype.close = function() {
  if(!this.isConnected()) {
    return
  }
  this.state_ = goog.net.xpc.ChannelStates.CLOSED;
  this.transport_.dispose();
  this.transport_ = null;
  goog.net.xpc.logger.info('Channel "' + this.name + '" closed')
};
goog.net.xpc.CrossPageChannel.prototype.notifyConnected_ = function() {
  if(this.isConnected()) {
    return
  }
  this.state_ = goog.net.xpc.ChannelStates.CONNECTED;
  goog.net.xpc.logger.info('Channel "' + this.name + '" connected');
  this.connectCb_()
};
goog.net.xpc.CrossPageChannel.prototype.notifyTransportError_ = function() {
  goog.net.xpc.logger.info("Transport Error");
  this.close()
};
goog.net.xpc.CrossPageChannel.prototype.send = function(serviceName, payload) {
  if(!this.isConnected()) {
    goog.net.xpc.logger.severe("Can't send. Channel not connected.");
    return
  }
  if(this.peerWindowObject_.closed) {
    goog.net.xpc.logger.severe("Peer has disappeared.");
    this.close();
    return
  }
  if(goog.isObject(payload)) {
    payload = goog.json.serialize(payload)
  }
  this.transport_.send(this.escapeServiceName_(serviceName), payload)
};
goog.net.xpc.CrossPageChannel.prototype.deliver_ = function(serviceName, payload, opt_origin) {
  if(!this.isMessageOriginAcceptable_(opt_origin)) {
    goog.net.xpc.logger.warning('Message received from unapproved origin "' + opt_origin + '" - rejected.');
    return
  }
  if(this.isDisposed()) {
    goog.net.xpc.logger.warning("CrossPageChannel::deliver_(): Disposed.")
  }else {
    if(!serviceName || serviceName == goog.net.xpc.TRANSPORT_SERVICE_) {
      this.transport_.transportServiceHandler(payload)
    }else {
      if(this.isConnected()) {
        this.deliver(this.unescapeServiceName_(serviceName), payload)
      }else {
        goog.net.xpc.logger.info("CrossPageChannel::deliver_(): Not connected.")
      }
    }
  }
};
goog.net.xpc.CrossPageChannel.prototype.escapeServiceName_ = function(name) {
  if(goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_ESCAPE_RE_.test(name)) {
    name = "%" + name
  }
  return name.replace(/[%:|]/g, encodeURIComponent)
};
goog.net.xpc.CrossPageChannel.prototype.unescapeServiceName_ = function(name) {
  name = name.replace(/%[0-9a-f]{2}/gi, decodeURIComponent);
  if(goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_UNESCAPE_RE_.test(name)) {
    return name.substring(1)
  }else {
    return name
  }
};
goog.net.xpc.CrossPageChannel.Role = {OUTER:0, INNER:1};
goog.net.xpc.CrossPageChannel.prototype.getRole = function() {
  return window.parent == this.peerWindowObject_ ? goog.net.xpc.CrossPageChannel.Role.INNER : goog.net.xpc.CrossPageChannel.Role.OUTER
};
goog.net.xpc.CrossPageChannel.prototype.isMessageOriginAcceptable_ = function(opt_origin) {
  var peerHostname = this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME];
  return goog.string.isEmptySafe(opt_origin) || goog.string.isEmptySafe(peerHostname) || opt_origin == this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME]
};
goog.net.xpc.CrossPageChannel.prototype.disposeInternal = function() {
  goog.base(this, "disposeInternal");
  this.close();
  this.peerWindowObject_ = null;
  this.iframeElement_ = null;
  delete goog.net.xpc.channels_[this.name]
};
goog.net.xpc.CrossPageChannel.disposeAll_ = function() {
  for(var name in goog.net.xpc.channels_) {
    var ch = goog.net.xpc.channels_[name];
    if(ch) {
      ch.dispose()
    }
  }
};
goog.provide("clojure.browser.net");
goog.require("cljs.core");
goog.require("clojure.browser.event");
goog.require("goog.net.XhrIo");
goog.require("goog.net.EventType");
goog.require("goog.net.xpc.CfgFields");
goog.require("goog.net.xpc.CrossPageChannel");
goog.require("goog.json");
clojure.browser.net._STAR_timeout_STAR_ = 1E4;
clojure.browser.net.event_types = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__101699) {
  var vec__101700__101701 = p__101699;
  var k__101702 = cljs.core.nth.call(null, vec__101700__101701, 0, null);
  var v__101703 = cljs.core.nth.call(null, vec__101700__101701, 1, null);
  return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__101702.toLowerCase()), v__101703])
}, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.net.EventType))));
clojure.browser.net.IConnection = {};
clojure.browser.net.connect = function() {
  var connect = null;
  var connect__101734 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101704 = this$;
      if(cljs.core.truth_(and__3546__auto____101704)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____101704
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$)
    }else {
      return function() {
        var or__3548__auto____101705 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101705)) {
          return or__3548__auto____101705
        }else {
          var or__3548__auto____101706 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____101706)) {
            return or__3548__auto____101706
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var connect__101735 = function(this$, opt1) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101707 = this$;
      if(cljs.core.truth_(and__3546__auto____101707)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____101707
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1)
    }else {
      return function() {
        var or__3548__auto____101708 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101708)) {
          return or__3548__auto____101708
        }else {
          var or__3548__auto____101709 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____101709)) {
            return or__3548__auto____101709
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1)
    }
  };
  var connect__101736 = function(this$, opt1, opt2) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101710 = this$;
      if(cljs.core.truth_(and__3546__auto____101710)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____101710
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1, opt2)
    }else {
      return function() {
        var or__3548__auto____101711 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101711)) {
          return or__3548__auto____101711
        }else {
          var or__3548__auto____101712 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____101712)) {
            return or__3548__auto____101712
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1, opt2)
    }
  };
  var connect__101737 = function(this$, opt1, opt2, opt3) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101713 = this$;
      if(cljs.core.truth_(and__3546__auto____101713)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____101713
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1, opt2, opt3)
    }else {
      return function() {
        var or__3548__auto____101714 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101714)) {
          return or__3548__auto____101714
        }else {
          var or__3548__auto____101715 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____101715)) {
            return or__3548__auto____101715
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1, opt2, opt3)
    }
  };
  connect = function(this$, opt1, opt2, opt3) {
    switch(arguments.length) {
      case 1:
        return connect__101734.call(this, this$);
      case 2:
        return connect__101735.call(this, this$, opt1);
      case 3:
        return connect__101736.call(this, this$, opt1, opt2);
      case 4:
        return connect__101737.call(this, this$, opt1, opt2, opt3)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return connect
}();
clojure.browser.net.transmit = function() {
  var transmit = null;
  var transmit__101739 = function(this$, opt) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101716 = this$;
      if(cljs.core.truth_(and__3546__auto____101716)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____101716
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt)
    }else {
      return function() {
        var or__3548__auto____101717 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101717)) {
          return or__3548__auto____101717
        }else {
          var or__3548__auto____101718 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____101718)) {
            return or__3548__auto____101718
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt)
    }
  };
  var transmit__101740 = function(this$, opt, opt2) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101719 = this$;
      if(cljs.core.truth_(and__3546__auto____101719)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____101719
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2)
    }else {
      return function() {
        var or__3548__auto____101720 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101720)) {
          return or__3548__auto____101720
        }else {
          var or__3548__auto____101721 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____101721)) {
            return or__3548__auto____101721
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2)
    }
  };
  var transmit__101741 = function(this$, opt, opt2, opt3) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101722 = this$;
      if(cljs.core.truth_(and__3546__auto____101722)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____101722
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3)
    }else {
      return function() {
        var or__3548__auto____101723 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101723)) {
          return or__3548__auto____101723
        }else {
          var or__3548__auto____101724 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____101724)) {
            return or__3548__auto____101724
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3)
    }
  };
  var transmit__101742 = function(this$, opt, opt2, opt3, opt4) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101725 = this$;
      if(cljs.core.truth_(and__3546__auto____101725)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____101725
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3, opt4)
    }else {
      return function() {
        var or__3548__auto____101726 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101726)) {
          return or__3548__auto____101726
        }else {
          var or__3548__auto____101727 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____101727)) {
            return or__3548__auto____101727
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3, opt4)
    }
  };
  var transmit__101743 = function(this$, opt, opt2, opt3, opt4, opt5) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101728 = this$;
      if(cljs.core.truth_(and__3546__auto____101728)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____101728
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3, opt4, opt5)
    }else {
      return function() {
        var or__3548__auto____101729 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101729)) {
          return or__3548__auto____101729
        }else {
          var or__3548__auto____101730 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____101730)) {
            return or__3548__auto____101730
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3, opt4, opt5)
    }
  };
  transmit = function(this$, opt, opt2, opt3, opt4, opt5) {
    switch(arguments.length) {
      case 2:
        return transmit__101739.call(this, this$, opt);
      case 3:
        return transmit__101740.call(this, this$, opt, opt2);
      case 4:
        return transmit__101741.call(this, this$, opt, opt2, opt3);
      case 5:
        return transmit__101742.call(this, this$, opt, opt2, opt3, opt4);
      case 6:
        return transmit__101743.call(this, this$, opt, opt2, opt3, opt4, opt5)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return transmit
}();
clojure.browser.net.close = function close(this$) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____101731 = this$;
    if(cljs.core.truth_(and__3546__auto____101731)) {
      return this$.clojure$browser$net$IConnection$close
    }else {
      return and__3546__auto____101731
    }
  }())) {
    return this$.clojure$browser$net$IConnection$close(this$)
  }else {
    return function() {
      var or__3548__auto____101732 = clojure.browser.net.close[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____101732)) {
        return or__3548__auto____101732
      }else {
        var or__3548__auto____101733 = clojure.browser.net.close["_"];
        if(cljs.core.truth_(or__3548__auto____101733)) {
          return or__3548__auto____101733
        }else {
          throw cljs.core.missing_protocol.call(null, "IConnection.close", this$);
        }
      }
    }().call(null, this$)
  }
};
goog.net.XhrIo.prototype.clojure$browser$event$EventType$ = true;
goog.net.XhrIo.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__101745) {
    var vec__101746__101747 = p__101745;
    var k__101748 = cljs.core.nth.call(null, vec__101746__101747, 0, null);
    var v__101749 = cljs.core.nth.call(null, vec__101746__101747, 1, null);
    return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__101748.toLowerCase()), v__101749])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.net.EventType))))
};
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$ = true;
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$transmit = function() {
  var G__101750 = null;
  var G__101750__101751 = function(this$, uri) {
    return clojure.browser.net.transmit.call(null, this$, uri, "GET", null, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__101750__101752 = function(this$, uri, method) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, null, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__101750__101753 = function(this$, uri, method, content) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, content, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__101750__101754 = function(this$, uri, method, content, headers) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, content, headers, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__101750__101755 = function(this$, uri, method, content, headers, timeout) {
    this$.setTimeoutInterval(timeout);
    return this$.send(uri, method, content, headers)
  };
  G__101750 = function(this$, uri, method, content, headers, timeout) {
    switch(arguments.length) {
      case 2:
        return G__101750__101751.call(this, this$, uri);
      case 3:
        return G__101750__101752.call(this, this$, uri, method);
      case 4:
        return G__101750__101753.call(this, this$, uri, method, content);
      case 5:
        return G__101750__101754.call(this, this$, uri, method, content, headers);
      case 6:
        return G__101750__101755.call(this, this$, uri, method, content, headers, timeout)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101750
}();
clojure.browser.net.xpc_config_fields = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__101757) {
  var vec__101758__101759 = p__101757;
  var k__101760 = cljs.core.nth.call(null, vec__101758__101759, 0, null);
  var v__101761 = cljs.core.nth.call(null, vec__101758__101759, 1, null);
  return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__101760.toLowerCase()), v__101761])
}, cljs.core.js__GT_clj.call(null, goog.net.xpc.CfgFields)));
clojure.browser.net.xhr_connection = function xhr_connection() {
  return new goog.net.XhrIo
};
clojure.browser.net.ICrossPageChannel = {};
clojure.browser.net.register_service = function() {
  var register_service = null;
  var register_service__101768 = function(this$, service_name, fn) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101762 = this$;
      if(cljs.core.truth_(and__3546__auto____101762)) {
        return this$.clojure$browser$net$ICrossPageChannel$register_service
      }else {
        return and__3546__auto____101762
      }
    }())) {
      return this$.clojure$browser$net$ICrossPageChannel$register_service(this$, service_name, fn)
    }else {
      return function() {
        var or__3548__auto____101763 = clojure.browser.net.register_service[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101763)) {
          return or__3548__auto____101763
        }else {
          var or__3548__auto____101764 = clojure.browser.net.register_service["_"];
          if(cljs.core.truth_(or__3548__auto____101764)) {
            return or__3548__auto____101764
          }else {
            throw cljs.core.missing_protocol.call(null, "ICrossPageChannel.register-service", this$);
          }
        }
      }().call(null, this$, service_name, fn)
    }
  };
  var register_service__101769 = function(this$, service_name, fn, encode_json_QMARK_) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____101765 = this$;
      if(cljs.core.truth_(and__3546__auto____101765)) {
        return this$.clojure$browser$net$ICrossPageChannel$register_service
      }else {
        return and__3546__auto____101765
      }
    }())) {
      return this$.clojure$browser$net$ICrossPageChannel$register_service(this$, service_name, fn, encode_json_QMARK_)
    }else {
      return function() {
        var or__3548__auto____101766 = clojure.browser.net.register_service[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____101766)) {
          return or__3548__auto____101766
        }else {
          var or__3548__auto____101767 = clojure.browser.net.register_service["_"];
          if(cljs.core.truth_(or__3548__auto____101767)) {
            return or__3548__auto____101767
          }else {
            throw cljs.core.missing_protocol.call(null, "ICrossPageChannel.register-service", this$);
          }
        }
      }().call(null, this$, service_name, fn, encode_json_QMARK_)
    }
  };
  register_service = function(this$, service_name, fn, encode_json_QMARK_) {
    switch(arguments.length) {
      case 3:
        return register_service__101768.call(this, this$, service_name, fn);
      case 4:
        return register_service__101769.call(this, this$, service_name, fn, encode_json_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return register_service
}();
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$connect = function() {
  var G__101771 = null;
  var G__101771__101772 = function(this$) {
    return clojure.browser.net.connect.call(null, this$, null)
  };
  var G__101771__101773 = function(this$, on_connect_fn) {
    return this$.connect(on_connect_fn)
  };
  var G__101771__101774 = function(this$, on_connect_fn, config_iframe_fn) {
    return clojure.browser.net.connect.call(null, this$, on_connect_fn, config_iframe_fn, document.body)
  };
  var G__101771__101775 = function(this$, on_connect_fn, config_iframe_fn, iframe_parent) {
    this$.createPeerIframe(iframe_parent, config_iframe_fn);
    return this$.connect(on_connect_fn)
  };
  G__101771 = function(this$, on_connect_fn, config_iframe_fn, iframe_parent) {
    switch(arguments.length) {
      case 1:
        return G__101771__101772.call(this, this$);
      case 2:
        return G__101771__101773.call(this, this$, on_connect_fn);
      case 3:
        return G__101771__101774.call(this, this$, on_connect_fn, config_iframe_fn);
      case 4:
        return G__101771__101775.call(this, this$, on_connect_fn, config_iframe_fn, iframe_parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101771
}();
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$transmit = function(this$, service_name, payload) {
  return this$.send(cljs.core.name.call(null, service_name), payload)
};
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$close = function(this$) {
  return this$.close(cljs.core.List.EMPTY)
};
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$register_service = function() {
  var G__101777 = null;
  var G__101777__101778 = function(this$, service_name, fn) {
    return clojure.browser.net.register_service.call(null, this$, service_name, fn, false)
  };
  var G__101777__101779 = function(this$, service_name, fn, encode_json_QMARK_) {
    return this$.registerService(cljs.core.name.call(null, service_name), fn, encode_json_QMARK_)
  };
  G__101777 = function(this$, service_name, fn, encode_json_QMARK_) {
    switch(arguments.length) {
      case 3:
        return G__101777__101778.call(this, this$, service_name, fn);
      case 4:
        return G__101777__101779.call(this, this$, service_name, fn, encode_json_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__101777
}();
clojure.browser.net.xpc_connection = function() {
  var xpc_connection = null;
  var xpc_connection__101790 = function() {
    var temp__3698__auto____101781 = (new goog.Uri(window.location.href)).getParameterValue("xpc");
    if(cljs.core.truth_(temp__3698__auto____101781)) {
      var config__101782 = temp__3698__auto____101781;
      return new goog.net.xpc.CrossPageChannel(goog.json.parse.call(null, config__101782))
    }else {
      return null
    }
  };
  var xpc_connection__101791 = function(config) {
    return new goog.net.xpc.CrossPageChannel(cljs.core.reduce.call(null, function(sum, p__101783) {
      var vec__101784__101785 = p__101783;
      var k__101786 = cljs.core.nth.call(null, vec__101784__101785, 0, null);
      var v__101787 = cljs.core.nth.call(null, vec__101784__101785, 1, null);
      var temp__3695__auto____101788 = cljs.core.get.call(null, clojure.browser.net.xpc_config_fields, k__101786);
      if(cljs.core.truth_(temp__3695__auto____101788)) {
        var field__101789 = temp__3695__auto____101788;
        return cljs.core.assoc.call(null, sum, field__101789, v__101787)
      }else {
        return sum
      }
    }, cljs.core.ObjMap.fromObject([], {}), config).strobj)
  };
  xpc_connection = function(config) {
    switch(arguments.length) {
      case 0:
        return xpc_connection__101790.call(this);
      case 1:
        return xpc_connection__101791.call(this, config)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return xpc_connection
}();
goog.provide("clojure.browser.repl");
goog.require("cljs.core");
goog.require("clojure.browser.net");
goog.require("clojure.browser.event");
clojure.browser.repl.xpc_connection = cljs.core.atom.call(null, null);
clojure.browser.repl.repl_print = function repl_print(data) {
  var temp__3695__auto____101686 = cljs.core.deref.call(null, clojure.browser.repl.xpc_connection);
  if(cljs.core.truth_(temp__3695__auto____101686)) {
    var conn__101687 = temp__3695__auto____101686;
    return clojure.browser.net.transmit.call(null, conn__101687, "\ufdd0'print", cljs.core.pr_str.call(null, data))
  }else {
    return null
  }
};
clojure.browser.repl.evaluate_javascript = function evaluate_javascript(conn, block) {
  var result__101690 = function() {
    try {
      return cljs.core.ObjMap.fromObject(["\ufdd0'status", "\ufdd0'value"], {"\ufdd0'status":"\ufdd0'success", "\ufdd0'value":cljs.core.str.call(null, eval(block))})
    }catch(e101688) {
      if(cljs.core.truth_(cljs.core.instance_QMARK_.call(null, Error, e101688))) {
        var e__101689 = e101688;
        return cljs.core.ObjMap.fromObject(["\ufdd0'status", "\ufdd0'value", "\ufdd0'stacktrace"], {"\ufdd0'status":"\ufdd0'exception", "\ufdd0'value":cljs.core.pr_str.call(null, e__101689), "\ufdd0'stacktrace":cljs.core.truth_(e__101689.hasOwnProperty("stack")) ? e__101689.stack : "No stacktrace available."})
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          throw e101688;
        }else {
          return null
        }
      }
    }
  }();
  return cljs.core.pr_str.call(null, result__101690)
};
clojure.browser.repl.send_result = function send_result(connection, url, data) {
  return clojure.browser.net.transmit.call(null, connection, url, "POST", data, null, 0)
};
clojure.browser.repl.send_print = function() {
  var send_print = null;
  var send_print__101692 = function(url, data) {
    return send_print.call(null, url, data, 0)
  };
  var send_print__101693 = function(url, data, n) {
    var conn__101691 = clojure.browser.net.xhr_connection.call(null);
    clojure.browser.event.listen.call(null, conn__101691, "\ufdd0'error", function(_) {
      if(cljs.core.truth_(n < 10)) {
        return send_print.call(null, url, data, n + 1)
      }else {
        return console.log(cljs.core.str.call(null, "Could not send ", data, " after ", n, " attempts."))
      }
    });
    return clojure.browser.net.transmit.call(null, conn__101691, url, "POST", data, null, 0)
  };
  send_print = function(url, data, n) {
    switch(arguments.length) {
      case 2:
        return send_print__101692.call(this, url, data);
      case 3:
        return send_print__101693.call(this, url, data, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return send_print
}();
clojure.browser.repl.order = cljs.core.atom.call(null, 0);
clojure.browser.repl.wrap_message = function wrap_message(t, data) {
  return cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'content", "\ufdd0'order"], {"\ufdd0'type":t, "\ufdd0'content":data, "\ufdd0'order":cljs.core.swap_BANG_.call(null, clojure.browser.repl.order, cljs.core.inc)}))
};
clojure.browser.repl.start_evaluator = function start_evaluator(url) {
  var temp__3695__auto____101695 = clojure.browser.net.xpc_connection.call(null);
  if(cljs.core.truth_(temp__3695__auto____101695)) {
    var repl_connection__101696 = temp__3695__auto____101695;
    var connection__101697 = clojure.browser.net.xhr_connection.call(null);
    clojure.browser.event.listen.call(null, connection__101697, "\ufdd0'success", function(e) {
      return clojure.browser.net.transmit.call(null, repl_connection__101696, "\ufdd0'evaluate-javascript", e.currentTarget.getResponseText(cljs.core.List.EMPTY))
    });
    clojure.browser.net.register_service.call(null, repl_connection__101696, "\ufdd0'send-result", function(data) {
      return clojure.browser.repl.send_result.call(null, connection__101697, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'result", data))
    });
    clojure.browser.net.register_service.call(null, repl_connection__101696, "\ufdd0'print", function(data) {
      return clojure.browser.repl.send_print.call(null, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'print", data))
    });
    clojure.browser.net.connect.call(null, repl_connection__101696, cljs.core.constantly.call(null, null));
    return setTimeout.call(null, function() {
      return clojure.browser.repl.send_result.call(null, connection__101697, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'ready", "ready"))
    }, 50)
  }else {
    return alert.call(null, "No 'xpc' param provided to child iframe.")
  }
};
clojure.browser.repl.connect = function connect(repl_server_url) {
  var repl_connection__101698 = clojure.browser.net.xpc_connection.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'peer_uri"], {"\ufdd0'peer_uri":repl_server_url}));
  cljs.core.swap_BANG_.call(null, clojure.browser.repl.xpc_connection, cljs.core.constantly.call(null, repl_connection__101698));
  clojure.browser.net.register_service.call(null, repl_connection__101698, "\ufdd0'evaluate-javascript", function(js) {
    return clojure.browser.net.transmit.call(null, repl_connection__101698, "\ufdd0'send-result", clojure.browser.repl.evaluate_javascript.call(null, repl_connection__101698, js))
  });
  return clojure.browser.net.connect.call(null, repl_connection__101698, cljs.core.constantly.call(null, null), function(iframe) {
    return iframe.style.display = "none"
  })
};
goog.provide("tatame.client.editors");
goog.require("cljs.core");
goog.require("tatame.client.model");
goog.require("cljs.reader");
goog.require("clojure.browser.repl");
goog.require("clojure.string");
goog.require("goog.dom");
goog.require("goog.object");
tatame.client.editors.jasmine_template = '<html>\n  <head>\n\n\n    <link rel="stylesheet" type="text/css" href="/jasmine.css">\n    <script type="text/javascript" src="/jasmine.js"><\/script>\n    <script type="text/javascript" src="/jasmine-html.js"><\/script>\n\n    <body>\n    <\!-- include spec files here... --\>\n    <script type="text/javascript">{{code}}<\/script>\n\n    <script type="text/javascript">\n      (function() {\n      var jasmineEnv = jasmine.getEnv();\n      //jasmineEnv.updateInterval = 1000;\n\n      var trivialReporter = new jasmine.TrivialReporter();\n      jasmineEnv.addReporter(trivialReporter);\n      jasmineEnv.specFilter = function(spec) {\n        return trivialReporter.specFilter(spec);\n      };\n\n      window.onload = function() {\n         jasmineEnv.execute();\n      };;\n\n      //window.jasmineEnv = jasmineEnv;\n\n      })();\n    <\/script>\n    </body>\n\n  </head>\n\n\n</html>\n\n';
tatame.client.editors.editors = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
tatame.client.editors.stable_js = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
tatame.client.editors.session = function session(editor) {
  return editor.getSession()
};
tatame.client.editors.content = function content(editor) {
  return tatame.client.editors.session.call(null, editor).getValue()
};
tatame.client.editors.frame_doc = function frame_doc(id) {
  return goog.dom.getFrameContentDocument.call(null, goog.dom.getElement.call(null, id))
};
tatame.client.editors.frame_id = function frame_id(id) {
  return cljs.core.str.call(null, id, "-frame")
};
tatame.client.editors.frame_el = function frame_el(id) {
  return goog.dom.getElement.call(null, tatame.client.editors.frame_id.call(null, id))
};
tatame.client.editors.frame_template = function frame_template(id) {
  return cljs.core.str.call(null, '<iframe id="', id, '-frame" src=""style="width:100%; height:100%"></iframe>')
};
tatame.client.editors.init_editor_BANG_ = function init_editor_BANG_(id, mode, listeners) {
  var editor__99674 = ace.edit(id);
  var session__99675 = tatame.client.editors.session.call(null, editor__99674);
  var mode_fn__99676 = window.require(mode).Mode;
  session__99675.setMode(new mode_fn__99676);
  var G__99677__99678 = cljs.core.seq.call(null, listeners);
  if(cljs.core.truth_(G__99677__99678)) {
    var G__99680__99682 = cljs.core.first.call(null, G__99677__99678);
    var vec__99681__99683 = G__99680__99682;
    var event__99684 = cljs.core.nth.call(null, vec__99681__99683, 0, null);
    var f__99685 = cljs.core.nth.call(null, vec__99681__99683, 1, null);
    var G__99677__99686 = G__99677__99678;
    var G__99680__99687 = G__99680__99682;
    var G__99677__99688 = G__99677__99686;
    while(true) {
      var vec__99689__99690 = G__99680__99687;
      var event__99691 = cljs.core.nth.call(null, vec__99689__99690, 0, null);
      var f__99692 = cljs.core.nth.call(null, vec__99689__99690, 1, null);
      var G__99677__99693 = G__99677__99688;
      session__99675.on(event__99691, cljs.core.partial.call(null, f__99692, id));
      var temp__3698__auto____99694 = cljs.core.next.call(null, G__99677__99693);
      if(cljs.core.truth_(temp__3698__auto____99694)) {
        var G__99677__99695 = temp__3698__auto____99694;
        var G__99696 = cljs.core.first.call(null, G__99677__99695);
        var G__99697 = G__99677__99695;
        G__99680__99687 = G__99696;
        G__99677__99688 = G__99697;
        continue
      }else {
      }
      break
    }
  }else {
  }
  cljs.core.swap_BANG_.call(null, tatame.client.editors.editors, cljs.core.assoc, id, editor__99674);
  return editor__99674
};
tatame.client.editors.write_frame_BANG_ = function write_frame_BANG_(id, html, clean) {
  if(cljs.core.truth_(clean)) {
    goog.dom.removeNode.call(null, tatame.client.editors.frame_el.call(null, id));
    goog.dom.getElement.call(null, id).innerHTML = tatame.client.editors.frame_template.call(null, id)
  }else {
  }
  var doc__99698 = tatame.client.editors.frame_doc.call(null, tatame.client.editors.frame_id.call(null, id));
  var G__99699__99700 = doc__99698;
  G__99699__99700.open();
  G__99699__99700.write(html);
  G__99699__99700.close();
  return G__99699__99700
};
tatame.client.editors.refresh_canvas_BANG_ = function refresh_canvas_BANG_() {
  var html__99702 = tatame.client.editors.content.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, "html-editor"));
  var js__99703 = cljs.core.deref.call(null, tatame.client.editors.stable_js).call(null, "js-editor");
  var content__99704 = clojure.string.replace_first.call(null, html__99702, "{{code}}", js__99703);
  tatame.client.editors.write_frame_BANG_.call(null, "canvas", content__99704, false);
  return true
};
tatame.client.editors.run_if_stable_BANG_ = function run_if_stable_BANG_(id, f) {
  var editor__99705 = cljs.core.deref.call(null, tatame.client.editors.editors).call(null, id);
  var annotations__99706 = tatame.client.editors.session.call(null, editor__99705).$annotations;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.some.call(null, function(p1__99701_SHARP_) {
    return cljs.core._EQ_.call(null, p1__99701_SHARP_.type, "error")
  }, goog.object.getKeys.call(null, annotations__99706))))) {
    cljs.core.swap_BANG_.call(null, tatame.client.editors.stable_js, cljs.core.assoc, id, tatame.client.editors.content.call(null, editor__99705));
    f.call(null)
  }else {
  }
  return true
};
tatame.client.editors.run_tests_BANG_ = function run_tests_BANG_() {
  var tests__99707 = tatame.client.editors.content.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, "test-editor"));
  var source__99708 = cljs.core.deref.call(null, tatame.client.editors.stable_js).call(null, "js-editor");
  var html__99709 = clojure.string.replace_first.call(null, tatame.client.editors.jasmine_template, "{{code}}", cljs.core.str.call(null, tests__99707, source__99708));
  return tatame.client.editors.write_frame_BANG_.call(null, "jasmine", html__99709, true)
};
tatame.client.editors.delay_buffered = function delay_buffered(f, ms) {
  var timer__99710 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__99714__delegate = function(args) {
      var temp__3695__auto____99711 = cljs.core.deref.call(null, timer__99710).call(null, args);
      if(cljs.core.truth_(temp__3695__auto____99711)) {
        var t__99712 = temp__3695__auto____99711;
        window.clearTimeout(t__99712)
      }else {
      }
      var t__99713 = window.setTimeout(function() {
        cljs.core.swap_BANG_.call(null, timer__99710, cljs.core.assoc, args, null);
        return cljs.core.apply.call(null, f, args)
      }, ms);
      return cljs.core.swap_BANG_.call(null, timer__99710, cljs.core.assoc, args, t__99713)
    };
    var G__99714 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__99714__delegate.call(this, args)
    };
    G__99714.cljs$lang$maxFixedArity = 0;
    G__99714.cljs$lang$applyTo = function(arglist__99715) {
      var args = cljs.core.seq(arglist__99715);
      return G__99714__delegate.call(this, args)
    };
    return G__99714
  }()
};
tatame.client.editors.save_state_BANG_ = function save_state_BANG_(id) {
  return localStorage.setItem(id, tatame.client.editors.content.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, id)))
};
tatame.client.editors.load_state_BANG_ = function load_state_BANG_(id) {
  var temp__3698__auto____99716 = localStorage.getItem(id);
  if(cljs.core.truth_(temp__3698__auto____99716)) {
    var content__99717 = temp__3698__auto____99716;
    return tatame.client.editors.session.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, id)).setValue(content__99717)
  }else {
    return null
  }
};
tatame.client.editors.run_tests_BANG_ = tatame.client.editors.delay_buffered.call(null, tatame.client.editors.run_tests_BANG_, 500);
tatame.client.editors.refresh_canvas_BANG_ = tatame.client.editors.delay_buffered.call(null, tatame.client.editors.refresh_canvas_BANG_, 200);
tatame.client.editors.init_BANG_ = function init_BANG_() {
  var send_event_BANG___99718 = function(id, data) {
    data.editor = id;
    return tatame.client.model.emit_event_BANG_.call(null, data)
  };
  var onchange__99719 = cljs.core.juxt.call(null, send_event_BANG___99718, tatame.client.editors.save_state_BANG_);
  var editors__99720 = cljs.core.ObjMap.fromObject(["html-editor", "js-editor", "test-editor"], {"html-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change"], {"\ufdd0'mode":"ace/mode/html", "change":function(id, event) {
    tatame.client.editors.refresh_canvas_BANG_.call(null);
    return onchange__99719.call(null, id, event)
  }}), "js-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change", "changeAnnotation"], {"\ufdd0'mode":"ace/mode/javascript", "change":onchange__99719, "changeAnnotation":function(id) {
    return tatame.client.editors.run_if_stable_BANG_.call(null, id, cljs.core.juxt.call(null, tatame.client.editors.refresh_canvas_BANG_, tatame.client.editors.run_tests_BANG_))
  }}), "test-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change", "changeAnnotation"], {"\ufdd0'mode":"ace/mode/javascript", "change":onchange__99719, "changeAnnotation":function(id) {
    return tatame.client.editors.run_if_stable_BANG_.call(null, id, tatame.client.editors.run_tests_BANG_)
  }})});
  var G__99721__99722 = cljs.core.seq.call(null, editors__99720);
  if(cljs.core.truth_(G__99721__99722)) {
    var G__99724__99726 = cljs.core.first.call(null, G__99721__99722);
    var vec__99725__99727 = G__99724__99726;
    var id__99728 = cljs.core.nth.call(null, vec__99725__99727, 0, null);
    var opts__99729 = cljs.core.nth.call(null, vec__99725__99727, 1, null);
    var G__99721__99730 = G__99721__99722;
    var G__99724__99731 = G__99724__99726;
    var G__99721__99732 = G__99721__99730;
    while(true) {
      var vec__99733__99734 = G__99724__99731;
      var id__99735 = cljs.core.nth.call(null, vec__99733__99734, 0, null);
      var opts__99736 = cljs.core.nth.call(null, vec__99733__99734, 1, null);
      var G__99721__99737 = G__99721__99732;
      tatame.client.editors.init_editor_BANG_.call(null, id__99735, "\ufdd0'mode".call(null, opts__99736), cljs.core.dissoc.call(null, opts__99736, "\ufdd0'mode"));
      tatame.client.editors.load_state_BANG_.call(null, id__99735);
      var temp__3698__auto____99738 = cljs.core.next.call(null, G__99721__99737);
      if(cljs.core.truth_(temp__3698__auto____99738)) {
        var G__99721__99739 = temp__3698__auto____99738;
        var G__99740 = cljs.core.first.call(null, G__99721__99739);
        var G__99741 = G__99721__99739;
        G__99724__99731 = G__99740;
        G__99721__99732 = G__99741;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
goog.provide("fetch.util");
goog.require("cljs.core");
fetch.util.clj__GT_js = function clj__GT_js(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, x))) {
      return cljs.core.name.call(null, x)
    }else {
      if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, x))) {
        return cljs.core.reduce.call(null, function(m, p__102195) {
          var vec__102196__102197 = p__102195;
          var k__102198 = cljs.core.nth.call(null, vec__102196__102197, 0, null);
          var v__102199 = cljs.core.nth.call(null, vec__102196__102197, 1, null);
          return cljs.core.assoc.call(null, m, clj__GT_js.call(null, k__102198), clj__GT_js.call(null, v__102199))
        }, cljs.core.ObjMap.fromObject([], {}), x).strobj
      }else {
        if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null, x))) {
          return cljs.core.apply.call(null, cljs.core.array, cljs.core.map.call(null, clj__GT_js, x))
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            return x
          }else {
            return null
          }
        }
      }
    }
  }
};
goog.provide("fetch.core");
goog.require("cljs.core");
goog.require("goog.net.XhrIo");
goog.require("clojure.string");
goog.require("fetch.util");
goog.require("cljs.reader");
goog.require("goog.events");
goog.require("goog.Uri.QueryData");
goog.require("goog.structs");
fetch.core.__GT_method = function __GT_method(m) {
  return clojure.string.upper_case.call(null, cljs.core.name.call(null, m))
};
fetch.core.parse_route = function parse_route(route) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, route))) {
    return cljs.core.PersistentVector.fromArray(["GET", route])
  }else {
    if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, route))) {
      var vec__102176__102177 = route;
      var m__102178 = cljs.core.nth.call(null, vec__102176__102177, 0, null);
      var u__102179 = cljs.core.nth.call(null, vec__102176__102177, 1, null);
      return cljs.core.PersistentVector.fromArray([fetch.core.__GT_method.call(null, m__102178), u__102179])
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.PersistentVector.fromArray(["GET", route])
      }else {
        return null
      }
    }
  }
};
fetch.core.__GT_data = function __GT_data(d) {
  var cur__102180 = fetch.util.clj__GT_js.call(null, d);
  var query__102181 = goog.Uri.QueryData.createFromMap.call(null, new goog.structs.Map(cur__102180));
  return cljs.core.str.call(null, query__102181)
};
fetch.core.__GT_callback = function __GT_callback(callback) {
  if(cljs.core.truth_(callback)) {
    return function(req) {
      var data__102182 = req.getResponseText();
      return callback.call(null, data__102182)
    }
  }else {
    return null
  }
};
fetch.core.xhr = function() {
  var xhr__delegate = function(route, content, callback, p__102183) {
    var vec__102184__102185 = p__102183;
    var opts__102186 = cljs.core.nth.call(null, vec__102184__102185, 0, null);
    var req__102188 = new goog.net.XhrIo;
    var vec__102187__102189 = fetch.core.parse_route.call(null, route);
    var method__102190 = cljs.core.nth.call(null, vec__102187__102189, 0, null);
    var uri__102191 = cljs.core.nth.call(null, vec__102187__102189, 1, null);
    var data__102192 = fetch.core.__GT_data.call(null, content);
    var callback__102193 = fetch.core.__GT_callback.call(null, callback);
    if(cljs.core.truth_(callback__102193)) {
      goog.events.listen.call(null, req__102188, goog.net.EventType.COMPLETE, function() {
        return callback__102193.call(null, req__102188)
      })
    }else {
    }
    return req__102188.send(uri__102191, method__102190, data__102192, cljs.core.truth_(opts__102186) ? fetch.util.clj__GT_js.call(null, opts__102186) : null)
  };
  var xhr = function(route, content, callback, var_args) {
    var p__102183 = null;
    if(goog.isDef(var_args)) {
      p__102183 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return xhr__delegate.call(this, route, content, callback, p__102183)
  };
  xhr.cljs$lang$maxFixedArity = 3;
  xhr.cljs$lang$applyTo = function(arglist__102194) {
    var route = cljs.core.first(arglist__102194);
    var content = cljs.core.first(cljs.core.next(arglist__102194));
    var callback = cljs.core.first(cljs.core.next(cljs.core.next(arglist__102194)));
    var p__102183 = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__102194)));
    return xhr__delegate.call(this, route, content, callback, p__102183)
  };
  return xhr
}();
goog.provide("fetch.remotes");
goog.require("cljs.core");
goog.require("fetch.core");
goog.require("cljs.reader");
fetch.remotes.remote_uri = "/_fetch";
fetch.remotes.remote_callback = function remote_callback(remote, params, callback) {
  return fetch.core.xhr.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'post", fetch.remotes.remote_uri]), cljs.core.ObjMap.fromObject(["\ufdd0'remote", "\ufdd0'params"], {"\ufdd0'remote":remote, "\ufdd0'params":cljs.core.pr_str.call(null, params)}), cljs.core.truth_(callback) ? function(data) {
    var data__102175 = cljs.core.truth_(cljs.core._EQ_.call(null, data, "")) ? "nil" : data;
    return callback.call(null, cljs.reader.read_string.call(null, data__102175))
  } : null)
};
goog.provide("tatame.client.main");
goog.require("cljs.core");
goog.require("waltz.state");
goog.require("jayq.core");
goog.require("tatame.client.editors");
goog.require("cljs.reader");
goog.require("crate.core");
goog.require("tatame.client.model");
goog.require("waltz.history");
goog.require("clojure.string");
goog.require("waltz.state");
goog.require("fetch.remotes");
goog.require("tatame.client.views");
goog.require("clojure.browser.repl");
if(cljs.core.truth_(cljs.core._EQ_.call(null, location.hostname, "localhost"))) {
  clojure.browser.repl.connect.call(null, "http://localhost:9000/repl")
}else {
}
tatame.client.main.on_navigate = function on_navigate(e) {
  var token__99752 = e.token;
  console.log("on navigate", token__99752);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, token__99752, ""))) {
    return true
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, token__99752, "new-dojo"))) {
      return tatame.client.views.on_start_dojo.call(null)
    }else {
      return null
    }
  }
};
tatame.client.main.init_BANG_ = function init_BANG_() {
  waltz.state.set.call(null, tatame.client.model.app, "\ufdd0'loading");
  tatame.client.model.init_BANG_.call(null);
  return waltz.history.listen.call(null, tatame.client.main.on_navigate)
};
window.onload = tatame.client.main.init_BANG_;

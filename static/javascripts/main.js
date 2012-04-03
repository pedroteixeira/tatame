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
  var or__3548__auto____372906 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____372906)) {
    return or__3548__auto____372906
  }else {
    var or__3548__auto____372907 = p["_"];
    if(cljs.core.truth_(or__3548__auto____372907)) {
      return or__3548__auto____372907
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
  var _invoke__372971 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372908 = this$;
      if(cljs.core.truth_(and__3546__auto____372908)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372908
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____372909 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372909)) {
          return or__3548__auto____372909
        }else {
          var or__3548__auto____372910 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372910)) {
            return or__3548__auto____372910
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__372972 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372911 = this$;
      if(cljs.core.truth_(and__3546__auto____372911)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372911
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____372912 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372912)) {
          return or__3548__auto____372912
        }else {
          var or__3548__auto____372913 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372913)) {
            return or__3548__auto____372913
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__372973 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372914 = this$;
      if(cljs.core.truth_(and__3546__auto____372914)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372914
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____372915 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372915)) {
          return or__3548__auto____372915
        }else {
          var or__3548__auto____372916 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372916)) {
            return or__3548__auto____372916
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__372974 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372917 = this$;
      if(cljs.core.truth_(and__3546__auto____372917)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372917
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____372918 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372918)) {
          return or__3548__auto____372918
        }else {
          var or__3548__auto____372919 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372919)) {
            return or__3548__auto____372919
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__372975 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372920 = this$;
      if(cljs.core.truth_(and__3546__auto____372920)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372920
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____372921 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372921)) {
          return or__3548__auto____372921
        }else {
          var or__3548__auto____372922 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372922)) {
            return or__3548__auto____372922
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__372976 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372923 = this$;
      if(cljs.core.truth_(and__3546__auto____372923)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372923
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____372924 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372924)) {
          return or__3548__auto____372924
        }else {
          var or__3548__auto____372925 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372925)) {
            return or__3548__auto____372925
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__372977 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372926 = this$;
      if(cljs.core.truth_(and__3546__auto____372926)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372926
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____372927 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372927)) {
          return or__3548__auto____372927
        }else {
          var or__3548__auto____372928 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372928)) {
            return or__3548__auto____372928
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__372978 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372929 = this$;
      if(cljs.core.truth_(and__3546__auto____372929)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372929
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____372930 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372930)) {
          return or__3548__auto____372930
        }else {
          var or__3548__auto____372931 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372931)) {
            return or__3548__auto____372931
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__372979 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372932 = this$;
      if(cljs.core.truth_(and__3546__auto____372932)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372932
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____372933 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372933)) {
          return or__3548__auto____372933
        }else {
          var or__3548__auto____372934 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372934)) {
            return or__3548__auto____372934
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__372980 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372935 = this$;
      if(cljs.core.truth_(and__3546__auto____372935)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372935
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____372936 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372936)) {
          return or__3548__auto____372936
        }else {
          var or__3548__auto____372937 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372937)) {
            return or__3548__auto____372937
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__372981 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372938 = this$;
      if(cljs.core.truth_(and__3546__auto____372938)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372938
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____372939 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372939)) {
          return or__3548__auto____372939
        }else {
          var or__3548__auto____372940 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372940)) {
            return or__3548__auto____372940
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__372982 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372941 = this$;
      if(cljs.core.truth_(and__3546__auto____372941)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372941
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____372942 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372942)) {
          return or__3548__auto____372942
        }else {
          var or__3548__auto____372943 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372943)) {
            return or__3548__auto____372943
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__372983 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372944 = this$;
      if(cljs.core.truth_(and__3546__auto____372944)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372944
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____372945 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372945)) {
          return or__3548__auto____372945
        }else {
          var or__3548__auto____372946 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372946)) {
            return or__3548__auto____372946
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__372984 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372947 = this$;
      if(cljs.core.truth_(and__3546__auto____372947)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372947
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____372948 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372948)) {
          return or__3548__auto____372948
        }else {
          var or__3548__auto____372949 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372949)) {
            return or__3548__auto____372949
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__372985 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372950 = this$;
      if(cljs.core.truth_(and__3546__auto____372950)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372950
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____372951 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372951)) {
          return or__3548__auto____372951
        }else {
          var or__3548__auto____372952 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372952)) {
            return or__3548__auto____372952
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__372986 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372953 = this$;
      if(cljs.core.truth_(and__3546__auto____372953)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372953
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____372954 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372954)) {
          return or__3548__auto____372954
        }else {
          var or__3548__auto____372955 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372955)) {
            return or__3548__auto____372955
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__372987 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372956 = this$;
      if(cljs.core.truth_(and__3546__auto____372956)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372956
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____372957 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372957)) {
          return or__3548__auto____372957
        }else {
          var or__3548__auto____372958 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372958)) {
            return or__3548__auto____372958
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__372988 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372959 = this$;
      if(cljs.core.truth_(and__3546__auto____372959)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372959
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____372960 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372960)) {
          return or__3548__auto____372960
        }else {
          var or__3548__auto____372961 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372961)) {
            return or__3548__auto____372961
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__372989 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372962 = this$;
      if(cljs.core.truth_(and__3546__auto____372962)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372962
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____372963 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372963)) {
          return or__3548__auto____372963
        }else {
          var or__3548__auto____372964 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372964)) {
            return or__3548__auto____372964
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__372990 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372965 = this$;
      if(cljs.core.truth_(and__3546__auto____372965)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372965
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____372966 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372966)) {
          return or__3548__auto____372966
        }else {
          var or__3548__auto____372967 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372967)) {
            return or__3548__auto____372967
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__372991 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____372968 = this$;
      if(cljs.core.truth_(and__3546__auto____372968)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____372968
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____372969 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____372969)) {
          return or__3548__auto____372969
        }else {
          var or__3548__auto____372970 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____372970)) {
            return or__3548__auto____372970
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
        return _invoke__372971.call(this, this$);
      case 2:
        return _invoke__372972.call(this, this$, a);
      case 3:
        return _invoke__372973.call(this, this$, a, b);
      case 4:
        return _invoke__372974.call(this, this$, a, b, c);
      case 5:
        return _invoke__372975.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__372976.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__372977.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__372978.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__372979.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__372980.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__372981.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__372982.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__372983.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__372984.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__372985.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__372986.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__372987.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__372988.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__372989.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__372990.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__372991.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____372993 = coll;
    if(cljs.core.truth_(and__3546__auto____372993)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____372993
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____372994 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____372994)) {
        return or__3548__auto____372994
      }else {
        var or__3548__auto____372995 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____372995)) {
          return or__3548__auto____372995
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
    var and__3546__auto____372996 = coll;
    if(cljs.core.truth_(and__3546__auto____372996)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____372996
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____372997 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____372997)) {
        return or__3548__auto____372997
      }else {
        var or__3548__auto____372998 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____372998)) {
          return or__3548__auto____372998
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
    var and__3546__auto____372999 = coll;
    if(cljs.core.truth_(and__3546__auto____372999)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____372999
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____373000 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373000)) {
        return or__3548__auto____373000
      }else {
        var or__3548__auto____373001 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____373001)) {
          return or__3548__auto____373001
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
  var _nth__373008 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373002 = coll;
      if(cljs.core.truth_(and__3546__auto____373002)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____373002
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____373003 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____373003)) {
          return or__3548__auto____373003
        }else {
          var or__3548__auto____373004 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____373004)) {
            return or__3548__auto____373004
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__373009 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373005 = coll;
      if(cljs.core.truth_(and__3546__auto____373005)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____373005
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____373006 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____373006)) {
          return or__3548__auto____373006
        }else {
          var or__3548__auto____373007 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____373007)) {
            return or__3548__auto____373007
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
        return _nth__373008.call(this, coll, n);
      case 3:
        return _nth__373009.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373011 = coll;
    if(cljs.core.truth_(and__3546__auto____373011)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____373011
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____373012 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373012)) {
        return or__3548__auto____373012
      }else {
        var or__3548__auto____373013 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____373013)) {
          return or__3548__auto____373013
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373014 = coll;
    if(cljs.core.truth_(and__3546__auto____373014)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____373014
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____373015 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373015)) {
        return or__3548__auto____373015
      }else {
        var or__3548__auto____373016 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____373016)) {
          return or__3548__auto____373016
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
  var _lookup__373023 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373017 = o;
      if(cljs.core.truth_(and__3546__auto____373017)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____373017
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____373018 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____373018)) {
          return or__3548__auto____373018
        }else {
          var or__3548__auto____373019 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____373019)) {
            return or__3548__auto____373019
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__373024 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373020 = o;
      if(cljs.core.truth_(and__3546__auto____373020)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____373020
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____373021 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____373021)) {
          return or__3548__auto____373021
        }else {
          var or__3548__auto____373022 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____373022)) {
            return or__3548__auto____373022
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
        return _lookup__373023.call(this, o, k);
      case 3:
        return _lookup__373024.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373026 = coll;
    if(cljs.core.truth_(and__3546__auto____373026)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____373026
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____373027 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373027)) {
        return or__3548__auto____373027
      }else {
        var or__3548__auto____373028 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____373028)) {
          return or__3548__auto____373028
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373029 = coll;
    if(cljs.core.truth_(and__3546__auto____373029)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____373029
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____373030 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373030)) {
        return or__3548__auto____373030
      }else {
        var or__3548__auto____373031 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____373031)) {
          return or__3548__auto____373031
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
    var and__3546__auto____373032 = coll;
    if(cljs.core.truth_(and__3546__auto____373032)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____373032
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____373033 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373033)) {
        return or__3548__auto____373033
      }else {
        var or__3548__auto____373034 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____373034)) {
          return or__3548__auto____373034
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
    var and__3546__auto____373035 = coll;
    if(cljs.core.truth_(and__3546__auto____373035)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____373035
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____373036 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373036)) {
        return or__3548__auto____373036
      }else {
        var or__3548__auto____373037 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____373037)) {
          return or__3548__auto____373037
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
    var and__3546__auto____373038 = coll;
    if(cljs.core.truth_(and__3546__auto____373038)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____373038
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____373039 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373039)) {
        return or__3548__auto____373039
      }else {
        var or__3548__auto____373040 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____373040)) {
          return or__3548__auto____373040
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373041 = coll;
    if(cljs.core.truth_(and__3546__auto____373041)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____373041
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____373042 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373042)) {
        return or__3548__auto____373042
      }else {
        var or__3548__auto____373043 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____373043)) {
          return or__3548__auto____373043
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
    var and__3546__auto____373044 = coll;
    if(cljs.core.truth_(and__3546__auto____373044)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____373044
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____373045 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____373045)) {
        return or__3548__auto____373045
      }else {
        var or__3548__auto____373046 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____373046)) {
          return or__3548__auto____373046
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
    var and__3546__auto____373047 = o;
    if(cljs.core.truth_(and__3546__auto____373047)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____373047
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____373048 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373048)) {
        return or__3548__auto____373048
      }else {
        var or__3548__auto____373049 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____373049)) {
          return or__3548__auto____373049
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
    var and__3546__auto____373050 = o;
    if(cljs.core.truth_(and__3546__auto____373050)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____373050
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____373051 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373051)) {
        return or__3548__auto____373051
      }else {
        var or__3548__auto____373052 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____373052)) {
          return or__3548__auto____373052
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
    var and__3546__auto____373053 = o;
    if(cljs.core.truth_(and__3546__auto____373053)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____373053
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____373054 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373054)) {
        return or__3548__auto____373054
      }else {
        var or__3548__auto____373055 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____373055)) {
          return or__3548__auto____373055
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
    var and__3546__auto____373056 = o;
    if(cljs.core.truth_(and__3546__auto____373056)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____373056
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____373057 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373057)) {
        return or__3548__auto____373057
      }else {
        var or__3548__auto____373058 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____373058)) {
          return or__3548__auto____373058
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
  var _reduce__373065 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373059 = coll;
      if(cljs.core.truth_(and__3546__auto____373059)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____373059
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____373060 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____373060)) {
          return or__3548__auto____373060
        }else {
          var or__3548__auto____373061 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____373061)) {
            return or__3548__auto____373061
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__373066 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373062 = coll;
      if(cljs.core.truth_(and__3546__auto____373062)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____373062
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____373063 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____373063)) {
          return or__3548__auto____373063
        }else {
          var or__3548__auto____373064 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____373064)) {
            return or__3548__auto____373064
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
        return _reduce__373065.call(this, coll, f);
      case 3:
        return _reduce__373066.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373068 = o;
    if(cljs.core.truth_(and__3546__auto____373068)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____373068
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____373069 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373069)) {
        return or__3548__auto____373069
      }else {
        var or__3548__auto____373070 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____373070)) {
          return or__3548__auto____373070
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
    var and__3546__auto____373071 = o;
    if(cljs.core.truth_(and__3546__auto____373071)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____373071
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____373072 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373072)) {
        return or__3548__auto____373072
      }else {
        var or__3548__auto____373073 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____373073)) {
          return or__3548__auto____373073
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
    var and__3546__auto____373074 = o;
    if(cljs.core.truth_(and__3546__auto____373074)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____373074
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____373075 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373075)) {
        return or__3548__auto____373075
      }else {
        var or__3548__auto____373076 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____373076)) {
          return or__3548__auto____373076
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
    var and__3546__auto____373077 = o;
    if(cljs.core.truth_(and__3546__auto____373077)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____373077
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____373078 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____373078)) {
        return or__3548__auto____373078
      }else {
        var or__3548__auto____373079 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____373079)) {
          return or__3548__auto____373079
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
    var and__3546__auto____373080 = d;
    if(cljs.core.truth_(and__3546__auto____373080)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____373080
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____373081 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____373081)) {
        return or__3548__auto____373081
      }else {
        var or__3548__auto____373082 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____373082)) {
          return or__3548__auto____373082
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
    var and__3546__auto____373083 = this$;
    if(cljs.core.truth_(and__3546__auto____373083)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____373083
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____373084 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____373084)) {
        return or__3548__auto____373084
      }else {
        var or__3548__auto____373085 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____373085)) {
          return or__3548__auto____373085
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373086 = this$;
    if(cljs.core.truth_(and__3546__auto____373086)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____373086
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____373087 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____373087)) {
        return or__3548__auto____373087
      }else {
        var or__3548__auto____373088 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____373088)) {
          return or__3548__auto____373088
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373089 = this$;
    if(cljs.core.truth_(and__3546__auto____373089)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____373089
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____373090 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____373090)) {
        return or__3548__auto____373090
      }else {
        var or__3548__auto____373091 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____373091)) {
          return or__3548__auto____373091
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
  var G__373092 = null;
  var G__373092__373093 = function(o, k) {
    return null
  };
  var G__373092__373094 = function(o, k, not_found) {
    return not_found
  };
  G__373092 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373092__373093.call(this, o, k);
      case 3:
        return G__373092__373094.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373092
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
  var G__373096 = null;
  var G__373096__373097 = function(_, f) {
    return f.call(null)
  };
  var G__373096__373098 = function(_, f, start) {
    return start
  };
  G__373096 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__373096__373097.call(this, _, f);
      case 3:
        return G__373096__373098.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373096
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
  var G__373100 = null;
  var G__373100__373101 = function(_, n) {
    return null
  };
  var G__373100__373102 = function(_, n, not_found) {
    return not_found
  };
  G__373100 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373100__373101.call(this, _, n);
      case 3:
        return G__373100__373102.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373100
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
  var ci_reduce__373110 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__373104 = cljs.core._nth.call(null, cicoll, 0);
      var n__373105 = 1;
      while(true) {
        if(cljs.core.truth_(n__373105 < cljs.core._count.call(null, cicoll))) {
          var G__373114 = f.call(null, val__373104, cljs.core._nth.call(null, cicoll, n__373105));
          var G__373115 = n__373105 + 1;
          val__373104 = G__373114;
          n__373105 = G__373115;
          continue
        }else {
          return val__373104
        }
        break
      }
    }
  };
  var ci_reduce__373111 = function(cicoll, f, val) {
    var val__373106 = val;
    var n__373107 = 0;
    while(true) {
      if(cljs.core.truth_(n__373107 < cljs.core._count.call(null, cicoll))) {
        var G__373116 = f.call(null, val__373106, cljs.core._nth.call(null, cicoll, n__373107));
        var G__373117 = n__373107 + 1;
        val__373106 = G__373116;
        n__373107 = G__373117;
        continue
      }else {
        return val__373106
      }
      break
    }
  };
  var ci_reduce__373112 = function(cicoll, f, val, idx) {
    var val__373108 = val;
    var n__373109 = idx;
    while(true) {
      if(cljs.core.truth_(n__373109 < cljs.core._count.call(null, cicoll))) {
        var G__373118 = f.call(null, val__373108, cljs.core._nth.call(null, cicoll, n__373109));
        var G__373119 = n__373109 + 1;
        val__373108 = G__373118;
        n__373109 = G__373119;
        continue
      }else {
        return val__373108
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__373110.call(this, cicoll, f);
      case 3:
        return ci_reduce__373111.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__373112.call(this, cicoll, f, val, idx)
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
  var this__373120 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__373133 = null;
  var G__373133__373134 = function(_, f) {
    var this__373121 = this;
    return cljs.core.ci_reduce.call(null, this__373121.a, f, this__373121.a[this__373121.i], this__373121.i + 1)
  };
  var G__373133__373135 = function(_, f, start) {
    var this__373122 = this;
    return cljs.core.ci_reduce.call(null, this__373122.a, f, start, this__373122.i)
  };
  G__373133 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__373133__373134.call(this, _, f);
      case 3:
        return G__373133__373135.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373133
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__373123 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__373124 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__373137 = null;
  var G__373137__373138 = function(coll, n) {
    var this__373125 = this;
    var i__373126 = n + this__373125.i;
    if(cljs.core.truth_(i__373126 < this__373125.a.length)) {
      return this__373125.a[i__373126]
    }else {
      return null
    }
  };
  var G__373137__373139 = function(coll, n, not_found) {
    var this__373127 = this;
    var i__373128 = n + this__373127.i;
    if(cljs.core.truth_(i__373128 < this__373127.a.length)) {
      return this__373127.a[i__373128]
    }else {
      return not_found
    }
  };
  G__373137 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373137__373138.call(this, coll, n);
      case 3:
        return G__373137__373139.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373137
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__373129 = this;
  return this__373129.a.length - this__373129.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__373130 = this;
  return this__373130.a[this__373130.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__373131 = this;
  if(cljs.core.truth_(this__373131.i + 1 < this__373131.a.length)) {
    return new cljs.core.IndexedSeq(this__373131.a, this__373131.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__373132 = this;
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
  var G__373141 = null;
  var G__373141__373142 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__373141__373143 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__373141 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__373141__373142.call(this, array, f);
      case 3:
        return G__373141__373143.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373141
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__373145 = null;
  var G__373145__373146 = function(array, k) {
    return array[k]
  };
  var G__373145__373147 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__373145 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373145__373146.call(this, array, k);
      case 3:
        return G__373145__373147.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373145
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__373149 = null;
  var G__373149__373150 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__373149__373151 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__373149 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373149__373150.call(this, array, n);
      case 3:
        return G__373149__373151.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373149
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
  var temp__3698__auto____373153 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____373153)) {
    var s__373154 = temp__3698__auto____373153;
    return cljs.core._first.call(null, s__373154)
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
      var G__373155 = cljs.core.next.call(null, s);
      s = G__373155;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__373156 = cljs.core.seq.call(null, x);
  var n__373157 = 0;
  while(true) {
    if(cljs.core.truth_(s__373156)) {
      var G__373158 = cljs.core.next.call(null, s__373156);
      var G__373159 = n__373157 + 1;
      s__373156 = G__373158;
      n__373157 = G__373159;
      continue
    }else {
      return n__373157
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
  var conj__373160 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__373161 = function() {
    var G__373163__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__373164 = conj.call(null, coll, x);
          var G__373165 = cljs.core.first.call(null, xs);
          var G__373166 = cljs.core.next.call(null, xs);
          coll = G__373164;
          x = G__373165;
          xs = G__373166;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__373163 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373163__delegate.call(this, coll, x, xs)
    };
    G__373163.cljs$lang$maxFixedArity = 2;
    G__373163.cljs$lang$applyTo = function(arglist__373167) {
      var coll = cljs.core.first(arglist__373167);
      var x = cljs.core.first(cljs.core.next(arglist__373167));
      var xs = cljs.core.rest(cljs.core.next(arglist__373167));
      return G__373163__delegate.call(this, coll, x, xs)
    };
    return G__373163
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__373160.call(this, coll, x);
      default:
        return conj__373161.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__373161.cljs$lang$applyTo;
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
  var nth__373168 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__373169 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__373168.call(this, coll, n);
      case 3:
        return nth__373169.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__373171 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__373172 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__373171.call(this, o, k);
      case 3:
        return get__373172.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__373175 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__373176 = function() {
    var G__373178__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__373174 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__373179 = ret__373174;
          var G__373180 = cljs.core.first.call(null, kvs);
          var G__373181 = cljs.core.second.call(null, kvs);
          var G__373182 = cljs.core.nnext.call(null, kvs);
          coll = G__373179;
          k = G__373180;
          v = G__373181;
          kvs = G__373182;
          continue
        }else {
          return ret__373174
        }
        break
      }
    };
    var G__373178 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__373178__delegate.call(this, coll, k, v, kvs)
    };
    G__373178.cljs$lang$maxFixedArity = 3;
    G__373178.cljs$lang$applyTo = function(arglist__373183) {
      var coll = cljs.core.first(arglist__373183);
      var k = cljs.core.first(cljs.core.next(arglist__373183));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373183)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373183)));
      return G__373178__delegate.call(this, coll, k, v, kvs)
    };
    return G__373178
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__373175.call(this, coll, k, v);
      default:
        return assoc__373176.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__373176.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__373185 = function(coll) {
    return coll
  };
  var dissoc__373186 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__373187 = function() {
    var G__373189__delegate = function(coll, k, ks) {
      while(true) {
        var ret__373184 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__373190 = ret__373184;
          var G__373191 = cljs.core.first.call(null, ks);
          var G__373192 = cljs.core.next.call(null, ks);
          coll = G__373190;
          k = G__373191;
          ks = G__373192;
          continue
        }else {
          return ret__373184
        }
        break
      }
    };
    var G__373189 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373189__delegate.call(this, coll, k, ks)
    };
    G__373189.cljs$lang$maxFixedArity = 2;
    G__373189.cljs$lang$applyTo = function(arglist__373193) {
      var coll = cljs.core.first(arglist__373193);
      var k = cljs.core.first(cljs.core.next(arglist__373193));
      var ks = cljs.core.rest(cljs.core.next(arglist__373193));
      return G__373189__delegate.call(this, coll, k, ks)
    };
    return G__373189
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__373185.call(this, coll);
      case 2:
        return dissoc__373186.call(this, coll, k);
      default:
        return dissoc__373187.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__373187.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__451__auto____373194 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373195 = x__451__auto____373194;
      if(cljs.core.truth_(and__3546__auto____373195)) {
        var and__3546__auto____373196 = x__451__auto____373194.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____373196)) {
          return cljs.core.not.call(null, x__451__auto____373194.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____373196
        }
      }else {
        return and__3546__auto____373195
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__451__auto____373194)
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
  var disj__373198 = function(coll) {
    return coll
  };
  var disj__373199 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__373200 = function() {
    var G__373202__delegate = function(coll, k, ks) {
      while(true) {
        var ret__373197 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__373203 = ret__373197;
          var G__373204 = cljs.core.first.call(null, ks);
          var G__373205 = cljs.core.next.call(null, ks);
          coll = G__373203;
          k = G__373204;
          ks = G__373205;
          continue
        }else {
          return ret__373197
        }
        break
      }
    };
    var G__373202 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373202__delegate.call(this, coll, k, ks)
    };
    G__373202.cljs$lang$maxFixedArity = 2;
    G__373202.cljs$lang$applyTo = function(arglist__373206) {
      var coll = cljs.core.first(arglist__373206);
      var k = cljs.core.first(cljs.core.next(arglist__373206));
      var ks = cljs.core.rest(cljs.core.next(arglist__373206));
      return G__373202__delegate.call(this, coll, k, ks)
    };
    return G__373202
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__373198.call(this, coll);
      case 2:
        return disj__373199.call(this, coll, k);
      default:
        return disj__373200.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__373200.cljs$lang$applyTo;
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
    var x__451__auto____373207 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373208 = x__451__auto____373207;
      if(cljs.core.truth_(and__3546__auto____373208)) {
        var and__3546__auto____373209 = x__451__auto____373207.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____373209)) {
          return cljs.core.not.call(null, x__451__auto____373207.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____373209
        }
      }else {
        return and__3546__auto____373208
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__451__auto____373207)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____373210 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373211 = x__451__auto____373210;
      if(cljs.core.truth_(and__3546__auto____373211)) {
        var and__3546__auto____373212 = x__451__auto____373210.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____373212)) {
          return cljs.core.not.call(null, x__451__auto____373210.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____373212
        }
      }else {
        return and__3546__auto____373211
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__451__auto____373210)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__451__auto____373213 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____373214 = x__451__auto____373213;
    if(cljs.core.truth_(and__3546__auto____373214)) {
      var and__3546__auto____373215 = x__451__auto____373213.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____373215)) {
        return cljs.core.not.call(null, x__451__auto____373213.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____373215
      }
    }else {
      return and__3546__auto____373214
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__451__auto____373213)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__451__auto____373216 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____373217 = x__451__auto____373216;
    if(cljs.core.truth_(and__3546__auto____373217)) {
      var and__3546__auto____373218 = x__451__auto____373216.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____373218)) {
        return cljs.core.not.call(null, x__451__auto____373216.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____373218
      }
    }else {
      return and__3546__auto____373217
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__451__auto____373216)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__451__auto____373219 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____373220 = x__451__auto____373219;
    if(cljs.core.truth_(and__3546__auto____373220)) {
      var and__3546__auto____373221 = x__451__auto____373219.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____373221)) {
        return cljs.core.not.call(null, x__451__auto____373219.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____373221
      }
    }else {
      return and__3546__auto____373220
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__451__auto____373219)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____373222 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373223 = x__451__auto____373222;
      if(cljs.core.truth_(and__3546__auto____373223)) {
        var and__3546__auto____373224 = x__451__auto____373222.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____373224)) {
          return cljs.core.not.call(null, x__451__auto____373222.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____373224
        }
      }else {
        return and__3546__auto____373223
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__451__auto____373222)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__451__auto____373225 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____373226 = x__451__auto____373225;
    if(cljs.core.truth_(and__3546__auto____373226)) {
      var and__3546__auto____373227 = x__451__auto____373225.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____373227)) {
        return cljs.core.not.call(null, x__451__auto____373225.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____373227
      }
    }else {
      return and__3546__auto____373226
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__451__auto____373225)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__373228 = [];
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__373228.push(key)
  });
  return keys__373228
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
    var x__451__auto____373229 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373230 = x__451__auto____373229;
      if(cljs.core.truth_(and__3546__auto____373230)) {
        var and__3546__auto____373231 = x__451__auto____373229.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____373231)) {
          return cljs.core.not.call(null, x__451__auto____373229.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____373231
        }
      }else {
        return and__3546__auto____373230
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__451__auto____373229)
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
  var and__3546__auto____373232 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____373232)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____373233 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____373233)) {
        return or__3548__auto____373233
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____373232
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____373234 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____373234)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____373234
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____373235 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____373235)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____373235
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____373236 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____373236)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____373236
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
    var and__3546__auto____373237 = coll;
    if(cljs.core.truth_(and__3546__auto____373237)) {
      var and__3546__auto____373238 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____373238)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____373238
      }
    }else {
      return and__3546__auto____373237
    }
  }())) {
    return cljs.core.PersistentVector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___373243 = function(x) {
    return true
  };
  var distinct_QMARK___373244 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___373245 = function() {
    var G__373247__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__373239 = cljs.core.set([y, x]);
        var xs__373240 = more;
        while(true) {
          var x__373241 = cljs.core.first.call(null, xs__373240);
          var etc__373242 = cljs.core.next.call(null, xs__373240);
          if(cljs.core.truth_(xs__373240)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__373239, x__373241))) {
              return false
            }else {
              var G__373248 = cljs.core.conj.call(null, s__373239, x__373241);
              var G__373249 = etc__373242;
              s__373239 = G__373248;
              xs__373240 = G__373249;
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
    var G__373247 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373247__delegate.call(this, x, y, more)
    };
    G__373247.cljs$lang$maxFixedArity = 2;
    G__373247.cljs$lang$applyTo = function(arglist__373250) {
      var x = cljs.core.first(arglist__373250);
      var y = cljs.core.first(cljs.core.next(arglist__373250));
      var more = cljs.core.rest(cljs.core.next(arglist__373250));
      return G__373247__delegate.call(this, x, y, more)
    };
    return G__373247
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___373243.call(this, x);
      case 2:
        return distinct_QMARK___373244.call(this, x, y);
      default:
        return distinct_QMARK___373245.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___373245.cljs$lang$applyTo;
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
      var r__373251 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__373251))) {
        return r__373251
      }else {
        if(cljs.core.truth_(r__373251)) {
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
  var sort__373253 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__373254 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__373252 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__373252, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__373252)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__373253.call(this, comp);
      case 2:
        return sort__373254.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__373256 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__373257 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__373256.call(this, keyfn, comp);
      case 3:
        return sort_by__373257.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__373259 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__373260 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__373259.call(this, f, val);
      case 3:
        return reduce__373260.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__373266 = function(f, coll) {
    var temp__3695__auto____373262 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____373262)) {
      var s__373263 = temp__3695__auto____373262;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__373263), cljs.core.next.call(null, s__373263))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__373267 = function(f, val, coll) {
    var val__373264 = val;
    var coll__373265 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__373265)) {
        var G__373269 = f.call(null, val__373264, cljs.core.first.call(null, coll__373265));
        var G__373270 = cljs.core.next.call(null, coll__373265);
        val__373264 = G__373269;
        coll__373265 = G__373270;
        continue
      }else {
        return val__373264
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__373266.call(this, f, val);
      case 3:
        return seq_reduce__373267.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__373271 = null;
  var G__373271__373272 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__373271__373273 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__373271 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__373271__373272.call(this, coll, f);
      case 3:
        return G__373271__373273.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373271
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___373275 = function() {
    return 0
  };
  var _PLUS___373276 = function(x) {
    return x
  };
  var _PLUS___373277 = function(x, y) {
    return x + y
  };
  var _PLUS___373278 = function() {
    var G__373280__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__373280 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373280__delegate.call(this, x, y, more)
    };
    G__373280.cljs$lang$maxFixedArity = 2;
    G__373280.cljs$lang$applyTo = function(arglist__373281) {
      var x = cljs.core.first(arglist__373281);
      var y = cljs.core.first(cljs.core.next(arglist__373281));
      var more = cljs.core.rest(cljs.core.next(arglist__373281));
      return G__373280__delegate.call(this, x, y, more)
    };
    return G__373280
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___373275.call(this);
      case 1:
        return _PLUS___373276.call(this, x);
      case 2:
        return _PLUS___373277.call(this, x, y);
      default:
        return _PLUS___373278.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___373278.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___373282 = function(x) {
    return-x
  };
  var ___373283 = function(x, y) {
    return x - y
  };
  var ___373284 = function() {
    var G__373286__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__373286 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373286__delegate.call(this, x, y, more)
    };
    G__373286.cljs$lang$maxFixedArity = 2;
    G__373286.cljs$lang$applyTo = function(arglist__373287) {
      var x = cljs.core.first(arglist__373287);
      var y = cljs.core.first(cljs.core.next(arglist__373287));
      var more = cljs.core.rest(cljs.core.next(arglist__373287));
      return G__373286__delegate.call(this, x, y, more)
    };
    return G__373286
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___373282.call(this, x);
      case 2:
        return ___373283.call(this, x, y);
      default:
        return ___373284.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___373284.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___373288 = function() {
    return 1
  };
  var _STAR___373289 = function(x) {
    return x
  };
  var _STAR___373290 = function(x, y) {
    return x * y
  };
  var _STAR___373291 = function() {
    var G__373293__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__373293 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373293__delegate.call(this, x, y, more)
    };
    G__373293.cljs$lang$maxFixedArity = 2;
    G__373293.cljs$lang$applyTo = function(arglist__373294) {
      var x = cljs.core.first(arglist__373294);
      var y = cljs.core.first(cljs.core.next(arglist__373294));
      var more = cljs.core.rest(cljs.core.next(arglist__373294));
      return G__373293__delegate.call(this, x, y, more)
    };
    return G__373293
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___373288.call(this);
      case 1:
        return _STAR___373289.call(this, x);
      case 2:
        return _STAR___373290.call(this, x, y);
      default:
        return _STAR___373291.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___373291.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___373295 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___373296 = function(x, y) {
    return x / y
  };
  var _SLASH___373297 = function() {
    var G__373299__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__373299 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373299__delegate.call(this, x, y, more)
    };
    G__373299.cljs$lang$maxFixedArity = 2;
    G__373299.cljs$lang$applyTo = function(arglist__373300) {
      var x = cljs.core.first(arglist__373300);
      var y = cljs.core.first(cljs.core.next(arglist__373300));
      var more = cljs.core.rest(cljs.core.next(arglist__373300));
      return G__373299__delegate.call(this, x, y, more)
    };
    return G__373299
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___373295.call(this, x);
      case 2:
        return _SLASH___373296.call(this, x, y);
      default:
        return _SLASH___373297.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___373297.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___373301 = function(x) {
    return true
  };
  var _LT___373302 = function(x, y) {
    return x < y
  };
  var _LT___373303 = function() {
    var G__373305__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__373306 = y;
            var G__373307 = cljs.core.first.call(null, more);
            var G__373308 = cljs.core.next.call(null, more);
            x = G__373306;
            y = G__373307;
            more = G__373308;
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
    var G__373305 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373305__delegate.call(this, x, y, more)
    };
    G__373305.cljs$lang$maxFixedArity = 2;
    G__373305.cljs$lang$applyTo = function(arglist__373309) {
      var x = cljs.core.first(arglist__373309);
      var y = cljs.core.first(cljs.core.next(arglist__373309));
      var more = cljs.core.rest(cljs.core.next(arglist__373309));
      return G__373305__delegate.call(this, x, y, more)
    };
    return G__373305
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___373301.call(this, x);
      case 2:
        return _LT___373302.call(this, x, y);
      default:
        return _LT___373303.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___373303.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___373310 = function(x) {
    return true
  };
  var _LT__EQ___373311 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___373312 = function() {
    var G__373314__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__373315 = y;
            var G__373316 = cljs.core.first.call(null, more);
            var G__373317 = cljs.core.next.call(null, more);
            x = G__373315;
            y = G__373316;
            more = G__373317;
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
    var G__373314 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373314__delegate.call(this, x, y, more)
    };
    G__373314.cljs$lang$maxFixedArity = 2;
    G__373314.cljs$lang$applyTo = function(arglist__373318) {
      var x = cljs.core.first(arglist__373318);
      var y = cljs.core.first(cljs.core.next(arglist__373318));
      var more = cljs.core.rest(cljs.core.next(arglist__373318));
      return G__373314__delegate.call(this, x, y, more)
    };
    return G__373314
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___373310.call(this, x);
      case 2:
        return _LT__EQ___373311.call(this, x, y);
      default:
        return _LT__EQ___373312.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___373312.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___373319 = function(x) {
    return true
  };
  var _GT___373320 = function(x, y) {
    return x > y
  };
  var _GT___373321 = function() {
    var G__373323__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__373324 = y;
            var G__373325 = cljs.core.first.call(null, more);
            var G__373326 = cljs.core.next.call(null, more);
            x = G__373324;
            y = G__373325;
            more = G__373326;
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
    var G__373323 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373323__delegate.call(this, x, y, more)
    };
    G__373323.cljs$lang$maxFixedArity = 2;
    G__373323.cljs$lang$applyTo = function(arglist__373327) {
      var x = cljs.core.first(arglist__373327);
      var y = cljs.core.first(cljs.core.next(arglist__373327));
      var more = cljs.core.rest(cljs.core.next(arglist__373327));
      return G__373323__delegate.call(this, x, y, more)
    };
    return G__373323
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___373319.call(this, x);
      case 2:
        return _GT___373320.call(this, x, y);
      default:
        return _GT___373321.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___373321.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___373328 = function(x) {
    return true
  };
  var _GT__EQ___373329 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___373330 = function() {
    var G__373332__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__373333 = y;
            var G__373334 = cljs.core.first.call(null, more);
            var G__373335 = cljs.core.next.call(null, more);
            x = G__373333;
            y = G__373334;
            more = G__373335;
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
    var G__373332 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373332__delegate.call(this, x, y, more)
    };
    G__373332.cljs$lang$maxFixedArity = 2;
    G__373332.cljs$lang$applyTo = function(arglist__373336) {
      var x = cljs.core.first(arglist__373336);
      var y = cljs.core.first(cljs.core.next(arglist__373336));
      var more = cljs.core.rest(cljs.core.next(arglist__373336));
      return G__373332__delegate.call(this, x, y, more)
    };
    return G__373332
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___373328.call(this, x);
      case 2:
        return _GT__EQ___373329.call(this, x, y);
      default:
        return _GT__EQ___373330.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___373330.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__373337 = function(x) {
    return x
  };
  var max__373338 = function(x, y) {
    return x > y ? x : y
  };
  var max__373339 = function() {
    var G__373341__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__373341 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373341__delegate.call(this, x, y, more)
    };
    G__373341.cljs$lang$maxFixedArity = 2;
    G__373341.cljs$lang$applyTo = function(arglist__373342) {
      var x = cljs.core.first(arglist__373342);
      var y = cljs.core.first(cljs.core.next(arglist__373342));
      var more = cljs.core.rest(cljs.core.next(arglist__373342));
      return G__373341__delegate.call(this, x, y, more)
    };
    return G__373341
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__373337.call(this, x);
      case 2:
        return max__373338.call(this, x, y);
      default:
        return max__373339.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__373339.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__373343 = function(x) {
    return x
  };
  var min__373344 = function(x, y) {
    return x < y ? x : y
  };
  var min__373345 = function() {
    var G__373347__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__373347 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373347__delegate.call(this, x, y, more)
    };
    G__373347.cljs$lang$maxFixedArity = 2;
    G__373347.cljs$lang$applyTo = function(arglist__373348) {
      var x = cljs.core.first(arglist__373348);
      var y = cljs.core.first(cljs.core.next(arglist__373348));
      var more = cljs.core.rest(cljs.core.next(arglist__373348));
      return G__373347__delegate.call(this, x, y, more)
    };
    return G__373347
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__373343.call(this, x);
      case 2:
        return min__373344.call(this, x, y);
      default:
        return min__373345.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__373345.cljs$lang$applyTo;
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
  var rem__373349 = n % d;
  return cljs.core.fix.call(null, (n - rem__373349) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__373350 = cljs.core.quot.call(null, n, d);
  return n - d * q__373350
};
cljs.core.rand = function() {
  var rand = null;
  var rand__373351 = function() {
    return Math.random.call(null)
  };
  var rand__373352 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__373351.call(this);
      case 1:
        return rand__373352.call(this, n)
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
  var _EQ__EQ___373354 = function(x) {
    return true
  };
  var _EQ__EQ___373355 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___373356 = function() {
    var G__373358__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__373359 = y;
            var G__373360 = cljs.core.first.call(null, more);
            var G__373361 = cljs.core.next.call(null, more);
            x = G__373359;
            y = G__373360;
            more = G__373361;
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
    var G__373358 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373358__delegate.call(this, x, y, more)
    };
    G__373358.cljs$lang$maxFixedArity = 2;
    G__373358.cljs$lang$applyTo = function(arglist__373362) {
      var x = cljs.core.first(arglist__373362);
      var y = cljs.core.first(cljs.core.next(arglist__373362));
      var more = cljs.core.rest(cljs.core.next(arglist__373362));
      return G__373358__delegate.call(this, x, y, more)
    };
    return G__373358
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___373354.call(this, x);
      case 2:
        return _EQ__EQ___373355.call(this, x, y);
      default:
        return _EQ__EQ___373356.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___373356.cljs$lang$applyTo;
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
  var n__373363 = n;
  var xs__373364 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373365 = xs__373364;
      if(cljs.core.truth_(and__3546__auto____373365)) {
        return n__373363 > 0
      }else {
        return and__3546__auto____373365
      }
    }())) {
      var G__373366 = n__373363 - 1;
      var G__373367 = cljs.core.next.call(null, xs__373364);
      n__373363 = G__373366;
      xs__373364 = G__373367;
      continue
    }else {
      return xs__373364
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__373372 = null;
  var G__373372__373373 = function(coll, n) {
    var temp__3695__auto____373368 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____373368)) {
      var xs__373369 = temp__3695__auto____373368;
      return cljs.core.first.call(null, xs__373369)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__373372__373374 = function(coll, n, not_found) {
    var temp__3695__auto____373370 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____373370)) {
      var xs__373371 = temp__3695__auto____373370;
      return cljs.core.first.call(null, xs__373371)
    }else {
      return not_found
    }
  };
  G__373372 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373372__373373.call(this, coll, n);
      case 3:
        return G__373372__373374.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373372
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___373376 = function() {
    return""
  };
  var str_STAR___373377 = function(x) {
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
  var str_STAR___373378 = function() {
    var G__373380__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__373381 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__373382 = cljs.core.next.call(null, more);
            sb = G__373381;
            more = G__373382;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__373380 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__373380__delegate.call(this, x, ys)
    };
    G__373380.cljs$lang$maxFixedArity = 1;
    G__373380.cljs$lang$applyTo = function(arglist__373383) {
      var x = cljs.core.first(arglist__373383);
      var ys = cljs.core.rest(arglist__373383);
      return G__373380__delegate.call(this, x, ys)
    };
    return G__373380
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___373376.call(this);
      case 1:
        return str_STAR___373377.call(this, x);
      default:
        return str_STAR___373378.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___373378.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__373384 = function() {
    return""
  };
  var str__373385 = function(x) {
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
  var str__373386 = function() {
    var G__373388__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__373389 = sb.append(str.call(null, cljs.core.first.call(null, more)));
            var G__373390 = cljs.core.next.call(null, more);
            sb = G__373389;
            more = G__373390;
            continue
          }else {
            return cljs.core.str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.call(null, x)), ys)
    };
    var G__373388 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__373388__delegate.call(this, x, ys)
    };
    G__373388.cljs$lang$maxFixedArity = 1;
    G__373388.cljs$lang$applyTo = function(arglist__373391) {
      var x = cljs.core.first(arglist__373391);
      var ys = cljs.core.rest(arglist__373391);
      return G__373388__delegate.call(this, x, ys)
    };
    return G__373388
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__373384.call(this);
      case 1:
        return str__373385.call(this, x);
      default:
        return str__373386.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__373386.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__373392 = function(s, start) {
    return s.substring(start)
  };
  var subs__373393 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__373392.call(this, s, start);
      case 3:
        return subs__373393.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__373395 = function(name) {
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
  var symbol__373396 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__373395.call(this, ns);
      case 2:
        return symbol__373396.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__373398 = function(name) {
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
  var keyword__373399 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__373398.call(this, ns);
      case 2:
        return keyword__373399.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__373401 = cljs.core.seq.call(null, x);
    var ys__373402 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__373401 === null)) {
        return ys__373402 === null
      }else {
        if(cljs.core.truth_(ys__373402 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__373401), cljs.core.first.call(null, ys__373402)))) {
            var G__373403 = cljs.core.next.call(null, xs__373401);
            var G__373404 = cljs.core.next.call(null, ys__373402);
            xs__373401 = G__373403;
            ys__373402 = G__373404;
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
  return cljs.core.reduce.call(null, function(p1__373405_SHARP_, p2__373406_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__373405_SHARP_, cljs.core.hash.call(null, p2__373406_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__373407__373408 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__373407__373408)) {
    var G__373410__373412 = cljs.core.first.call(null, G__373407__373408);
    var vec__373411__373413 = G__373410__373412;
    var key_name__373414 = cljs.core.nth.call(null, vec__373411__373413, 0, null);
    var f__373415 = cljs.core.nth.call(null, vec__373411__373413, 1, null);
    var G__373407__373416 = G__373407__373408;
    var G__373410__373417 = G__373410__373412;
    var G__373407__373418 = G__373407__373416;
    while(true) {
      var vec__373419__373420 = G__373410__373417;
      var key_name__373421 = cljs.core.nth.call(null, vec__373419__373420, 0, null);
      var f__373422 = cljs.core.nth.call(null, vec__373419__373420, 1, null);
      var G__373407__373423 = G__373407__373418;
      var str_name__373424 = cljs.core.name.call(null, key_name__373421);
      obj[str_name__373424] = f__373422;
      var temp__3698__auto____373425 = cljs.core.next.call(null, G__373407__373423);
      if(cljs.core.truth_(temp__3698__auto____373425)) {
        var G__373407__373426 = temp__3698__auto____373425;
        var G__373427 = cljs.core.first.call(null, G__373407__373426);
        var G__373428 = G__373407__373426;
        G__373410__373417 = G__373427;
        G__373407__373418 = G__373428;
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
  var this__373429 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__373430 = this;
  return new cljs.core.List(this__373430.meta, o, coll, this__373430.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__373431 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__373432 = this;
  return this__373432.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__373433 = this;
  return this__373433.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__373434 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__373435 = this;
  return this__373435.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__373436 = this;
  return this__373436.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__373437 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__373438 = this;
  return new cljs.core.List(meta, this__373438.first, this__373438.rest, this__373438.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__373439 = this;
  return this__373439.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__373440 = this;
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
  var this__373441 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__373442 = this;
  return new cljs.core.List(this__373442.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__373443 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__373444 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__373445 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__373446 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__373447 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__373448 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__373449 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__373450 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__373451 = this;
  return this__373451.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__373452 = this;
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
  list.cljs$lang$applyTo = function(arglist__373453) {
    var items = cljs.core.seq(arglist__373453);
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
  var this__373454 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__373455 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__373456 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__373457 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__373457.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__373458 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__373459 = this;
  return this__373459.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__373460 = this;
  if(cljs.core.truth_(this__373460.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__373460.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__373461 = this;
  return this__373461.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__373462 = this;
  return new cljs.core.Cons(meta, this__373462.first, this__373462.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__373463 = null;
  var G__373463__373464 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__373463__373465 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__373463 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__373463__373464.call(this, string, f);
      case 3:
        return G__373463__373465.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373463
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__373467 = null;
  var G__373467__373468 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__373467__373469 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__373467 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373467__373468.call(this, string, k);
      case 3:
        return G__373467__373469.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373467
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__373471 = null;
  var G__373471__373472 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__373471__373473 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__373471 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373471__373472.call(this, string, n);
      case 3:
        return G__373471__373473.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373471
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
  var G__373481 = null;
  var G__373481__373482 = function(tsym373475, coll) {
    var tsym373475__373477 = this;
    var this$__373478 = tsym373475__373477;
    return cljs.core.get.call(null, coll, this$__373478.toString())
  };
  var G__373481__373483 = function(tsym373476, coll, not_found) {
    var tsym373476__373479 = this;
    var this$__373480 = tsym373476__373479;
    return cljs.core.get.call(null, coll, this$__373480.toString(), not_found)
  };
  G__373481 = function(tsym373476, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373481__373482.call(this, tsym373476, coll);
      case 3:
        return G__373481__373483.call(this, tsym373476, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373481
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__373485 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__373485
  }else {
    lazy_seq.x = x__373485.call(null);
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
  var this__373486 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__373487 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__373488 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__373489 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__373489.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__373490 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__373491 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__373492 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__373493 = this;
  return this__373493.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__373494 = this;
  return new cljs.core.LazySeq(meta, this__373494.realized, this__373494.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__373495 = [];
  var s__373496 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__373496))) {
      ary__373495.push(cljs.core.first.call(null, s__373496));
      var G__373497 = cljs.core.next.call(null, s__373496);
      s__373496 = G__373497;
      continue
    }else {
      return ary__373495
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__373498 = s;
  var i__373499 = n;
  var sum__373500 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____373501 = i__373499 > 0;
      if(cljs.core.truth_(and__3546__auto____373501)) {
        return cljs.core.seq.call(null, s__373498)
      }else {
        return and__3546__auto____373501
      }
    }())) {
      var G__373502 = cljs.core.next.call(null, s__373498);
      var G__373503 = i__373499 - 1;
      var G__373504 = sum__373500 + 1;
      s__373498 = G__373502;
      i__373499 = G__373503;
      sum__373500 = G__373504;
      continue
    }else {
      return sum__373500
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
  var concat__373508 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__373509 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__373510 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__373505 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__373505)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__373505), concat.call(null, cljs.core.rest.call(null, s__373505), y))
      }else {
        return y
      }
    })
  };
  var concat__373511 = function() {
    var G__373513__delegate = function(x, y, zs) {
      var cat__373507 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__373506 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__373506)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__373506), cat.call(null, cljs.core.rest.call(null, xys__373506), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__373507.call(null, concat.call(null, x, y), zs)
    };
    var G__373513 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373513__delegate.call(this, x, y, zs)
    };
    G__373513.cljs$lang$maxFixedArity = 2;
    G__373513.cljs$lang$applyTo = function(arglist__373514) {
      var x = cljs.core.first(arglist__373514);
      var y = cljs.core.first(cljs.core.next(arglist__373514));
      var zs = cljs.core.rest(cljs.core.next(arglist__373514));
      return G__373513__delegate.call(this, x, y, zs)
    };
    return G__373513
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__373508.call(this);
      case 1:
        return concat__373509.call(this, x);
      case 2:
        return concat__373510.call(this, x, y);
      default:
        return concat__373511.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__373511.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___373515 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___373516 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___373517 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___373518 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___373519 = function() {
    var G__373521__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__373521 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__373521__delegate.call(this, a, b, c, d, more)
    };
    G__373521.cljs$lang$maxFixedArity = 4;
    G__373521.cljs$lang$applyTo = function(arglist__373522) {
      var a = cljs.core.first(arglist__373522);
      var b = cljs.core.first(cljs.core.next(arglist__373522));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373522)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373522))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373522))));
      return G__373521__delegate.call(this, a, b, c, d, more)
    };
    return G__373521
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___373515.call(this, a);
      case 2:
        return list_STAR___373516.call(this, a, b);
      case 3:
        return list_STAR___373517.call(this, a, b, c);
      case 4:
        return list_STAR___373518.call(this, a, b, c, d);
      default:
        return list_STAR___373519.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___373519.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__373532 = function(f, args) {
    var fixed_arity__373523 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__373523 + 1) <= fixed_arity__373523)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__373533 = function(f, x, args) {
    var arglist__373524 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__373525 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__373524, fixed_arity__373525) <= fixed_arity__373525)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__373524))
      }else {
        return f.cljs$lang$applyTo(arglist__373524)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__373524))
    }
  };
  var apply__373534 = function(f, x, y, args) {
    var arglist__373526 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__373527 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__373526, fixed_arity__373527) <= fixed_arity__373527)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__373526))
      }else {
        return f.cljs$lang$applyTo(arglist__373526)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__373526))
    }
  };
  var apply__373535 = function(f, x, y, z, args) {
    var arglist__373528 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__373529 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__373528, fixed_arity__373529) <= fixed_arity__373529)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__373528))
      }else {
        return f.cljs$lang$applyTo(arglist__373528)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__373528))
    }
  };
  var apply__373536 = function() {
    var G__373538__delegate = function(f, a, b, c, d, args) {
      var arglist__373530 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__373531 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__373530, fixed_arity__373531) <= fixed_arity__373531)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__373530))
        }else {
          return f.cljs$lang$applyTo(arglist__373530)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__373530))
      }
    };
    var G__373538 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__373538__delegate.call(this, f, a, b, c, d, args)
    };
    G__373538.cljs$lang$maxFixedArity = 5;
    G__373538.cljs$lang$applyTo = function(arglist__373539) {
      var f = cljs.core.first(arglist__373539);
      var a = cljs.core.first(cljs.core.next(arglist__373539));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373539)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373539))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373539)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373539)))));
      return G__373538__delegate.call(this, f, a, b, c, d, args)
    };
    return G__373538
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__373532.call(this, f, a);
      case 3:
        return apply__373533.call(this, f, a, b);
      case 4:
        return apply__373534.call(this, f, a, b, c);
      case 5:
        return apply__373535.call(this, f, a, b, c, d);
      default:
        return apply__373536.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__373536.cljs$lang$applyTo;
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
  vary_meta.cljs$lang$applyTo = function(arglist__373540) {
    var obj = cljs.core.first(arglist__373540);
    var f = cljs.core.first(cljs.core.next(arglist__373540));
    var args = cljs.core.rest(cljs.core.next(arglist__373540));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___373541 = function(x) {
    return false
  };
  var not_EQ___373542 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___373543 = function() {
    var G__373545__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__373545 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373545__delegate.call(this, x, y, more)
    };
    G__373545.cljs$lang$maxFixedArity = 2;
    G__373545.cljs$lang$applyTo = function(arglist__373546) {
      var x = cljs.core.first(arglist__373546);
      var y = cljs.core.first(cljs.core.next(arglist__373546));
      var more = cljs.core.rest(cljs.core.next(arglist__373546));
      return G__373545__delegate.call(this, x, y, more)
    };
    return G__373545
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___373541.call(this, x);
      case 2:
        return not_EQ___373542.call(this, x, y);
      default:
        return not_EQ___373543.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___373543.cljs$lang$applyTo;
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
        var G__373547 = pred;
        var G__373548 = cljs.core.next.call(null, coll);
        pred = G__373547;
        coll = G__373548;
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
      var or__3548__auto____373549 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____373549)) {
        return or__3548__auto____373549
      }else {
        var G__373550 = pred;
        var G__373551 = cljs.core.next.call(null, coll);
        pred = G__373550;
        coll = G__373551;
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
    var G__373552 = null;
    var G__373552__373553 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__373552__373554 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__373552__373555 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__373552__373556 = function() {
      var G__373558__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__373558 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__373558__delegate.call(this, x, y, zs)
      };
      G__373558.cljs$lang$maxFixedArity = 2;
      G__373558.cljs$lang$applyTo = function(arglist__373559) {
        var x = cljs.core.first(arglist__373559);
        var y = cljs.core.first(cljs.core.next(arglist__373559));
        var zs = cljs.core.rest(cljs.core.next(arglist__373559));
        return G__373558__delegate.call(this, x, y, zs)
      };
      return G__373558
    }();
    G__373552 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__373552__373553.call(this);
        case 1:
          return G__373552__373554.call(this, x);
        case 2:
          return G__373552__373555.call(this, x, y);
        default:
          return G__373552__373556.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__373552.cljs$lang$maxFixedArity = 2;
    G__373552.cljs$lang$applyTo = G__373552__373556.cljs$lang$applyTo;
    return G__373552
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__373560__delegate = function(args) {
      return x
    };
    var G__373560 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__373560__delegate.call(this, args)
    };
    G__373560.cljs$lang$maxFixedArity = 0;
    G__373560.cljs$lang$applyTo = function(arglist__373561) {
      var args = cljs.core.seq(arglist__373561);
      return G__373560__delegate.call(this, args)
    };
    return G__373560
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__373565 = function() {
    return cljs.core.identity
  };
  var comp__373566 = function(f) {
    return f
  };
  var comp__373567 = function(f, g) {
    return function() {
      var G__373571 = null;
      var G__373571__373572 = function() {
        return f.call(null, g.call(null))
      };
      var G__373571__373573 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__373571__373574 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__373571__373575 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__373571__373576 = function() {
        var G__373578__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__373578 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373578__delegate.call(this, x, y, z, args)
        };
        G__373578.cljs$lang$maxFixedArity = 3;
        G__373578.cljs$lang$applyTo = function(arglist__373579) {
          var x = cljs.core.first(arglist__373579);
          var y = cljs.core.first(cljs.core.next(arglist__373579));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373579)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373579)));
          return G__373578__delegate.call(this, x, y, z, args)
        };
        return G__373578
      }();
      G__373571 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__373571__373572.call(this);
          case 1:
            return G__373571__373573.call(this, x);
          case 2:
            return G__373571__373574.call(this, x, y);
          case 3:
            return G__373571__373575.call(this, x, y, z);
          default:
            return G__373571__373576.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__373571.cljs$lang$maxFixedArity = 3;
      G__373571.cljs$lang$applyTo = G__373571__373576.cljs$lang$applyTo;
      return G__373571
    }()
  };
  var comp__373568 = function(f, g, h) {
    return function() {
      var G__373580 = null;
      var G__373580__373581 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__373580__373582 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__373580__373583 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__373580__373584 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__373580__373585 = function() {
        var G__373587__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__373587 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373587__delegate.call(this, x, y, z, args)
        };
        G__373587.cljs$lang$maxFixedArity = 3;
        G__373587.cljs$lang$applyTo = function(arglist__373588) {
          var x = cljs.core.first(arglist__373588);
          var y = cljs.core.first(cljs.core.next(arglist__373588));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373588)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373588)));
          return G__373587__delegate.call(this, x, y, z, args)
        };
        return G__373587
      }();
      G__373580 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__373580__373581.call(this);
          case 1:
            return G__373580__373582.call(this, x);
          case 2:
            return G__373580__373583.call(this, x, y);
          case 3:
            return G__373580__373584.call(this, x, y, z);
          default:
            return G__373580__373585.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__373580.cljs$lang$maxFixedArity = 3;
      G__373580.cljs$lang$applyTo = G__373580__373585.cljs$lang$applyTo;
      return G__373580
    }()
  };
  var comp__373569 = function() {
    var G__373589__delegate = function(f1, f2, f3, fs) {
      var fs__373562 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__373590__delegate = function(args) {
          var ret__373563 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__373562), args);
          var fs__373564 = cljs.core.next.call(null, fs__373562);
          while(true) {
            if(cljs.core.truth_(fs__373564)) {
              var G__373591 = cljs.core.first.call(null, fs__373564).call(null, ret__373563);
              var G__373592 = cljs.core.next.call(null, fs__373564);
              ret__373563 = G__373591;
              fs__373564 = G__373592;
              continue
            }else {
              return ret__373563
            }
            break
          }
        };
        var G__373590 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__373590__delegate.call(this, args)
        };
        G__373590.cljs$lang$maxFixedArity = 0;
        G__373590.cljs$lang$applyTo = function(arglist__373593) {
          var args = cljs.core.seq(arglist__373593);
          return G__373590__delegate.call(this, args)
        };
        return G__373590
      }()
    };
    var G__373589 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__373589__delegate.call(this, f1, f2, f3, fs)
    };
    G__373589.cljs$lang$maxFixedArity = 3;
    G__373589.cljs$lang$applyTo = function(arglist__373594) {
      var f1 = cljs.core.first(arglist__373594);
      var f2 = cljs.core.first(cljs.core.next(arglist__373594));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373594)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373594)));
      return G__373589__delegate.call(this, f1, f2, f3, fs)
    };
    return G__373589
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__373565.call(this);
      case 1:
        return comp__373566.call(this, f1);
      case 2:
        return comp__373567.call(this, f1, f2);
      case 3:
        return comp__373568.call(this, f1, f2, f3);
      default:
        return comp__373569.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__373569.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__373595 = function(f, arg1) {
    return function() {
      var G__373600__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__373600 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__373600__delegate.call(this, args)
      };
      G__373600.cljs$lang$maxFixedArity = 0;
      G__373600.cljs$lang$applyTo = function(arglist__373601) {
        var args = cljs.core.seq(arglist__373601);
        return G__373600__delegate.call(this, args)
      };
      return G__373600
    }()
  };
  var partial__373596 = function(f, arg1, arg2) {
    return function() {
      var G__373602__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__373602 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__373602__delegate.call(this, args)
      };
      G__373602.cljs$lang$maxFixedArity = 0;
      G__373602.cljs$lang$applyTo = function(arglist__373603) {
        var args = cljs.core.seq(arglist__373603);
        return G__373602__delegate.call(this, args)
      };
      return G__373602
    }()
  };
  var partial__373597 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__373604__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__373604 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__373604__delegate.call(this, args)
      };
      G__373604.cljs$lang$maxFixedArity = 0;
      G__373604.cljs$lang$applyTo = function(arglist__373605) {
        var args = cljs.core.seq(arglist__373605);
        return G__373604__delegate.call(this, args)
      };
      return G__373604
    }()
  };
  var partial__373598 = function() {
    var G__373606__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__373607__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__373607 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__373607__delegate.call(this, args)
        };
        G__373607.cljs$lang$maxFixedArity = 0;
        G__373607.cljs$lang$applyTo = function(arglist__373608) {
          var args = cljs.core.seq(arglist__373608);
          return G__373607__delegate.call(this, args)
        };
        return G__373607
      }()
    };
    var G__373606 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__373606__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__373606.cljs$lang$maxFixedArity = 4;
    G__373606.cljs$lang$applyTo = function(arglist__373609) {
      var f = cljs.core.first(arglist__373609);
      var arg1 = cljs.core.first(cljs.core.next(arglist__373609));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373609)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373609))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373609))));
      return G__373606__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__373606
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__373595.call(this, f, arg1);
      case 3:
        return partial__373596.call(this, f, arg1, arg2);
      case 4:
        return partial__373597.call(this, f, arg1, arg2, arg3);
      default:
        return partial__373598.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__373598.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__373610 = function(f, x) {
    return function() {
      var G__373614 = null;
      var G__373614__373615 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__373614__373616 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__373614__373617 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__373614__373618 = function() {
        var G__373620__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__373620 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373620__delegate.call(this, a, b, c, ds)
        };
        G__373620.cljs$lang$maxFixedArity = 3;
        G__373620.cljs$lang$applyTo = function(arglist__373621) {
          var a = cljs.core.first(arglist__373621);
          var b = cljs.core.first(cljs.core.next(arglist__373621));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373621)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373621)));
          return G__373620__delegate.call(this, a, b, c, ds)
        };
        return G__373620
      }();
      G__373614 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__373614__373615.call(this, a);
          case 2:
            return G__373614__373616.call(this, a, b);
          case 3:
            return G__373614__373617.call(this, a, b, c);
          default:
            return G__373614__373618.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__373614.cljs$lang$maxFixedArity = 3;
      G__373614.cljs$lang$applyTo = G__373614__373618.cljs$lang$applyTo;
      return G__373614
    }()
  };
  var fnil__373611 = function(f, x, y) {
    return function() {
      var G__373622 = null;
      var G__373622__373623 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__373622__373624 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__373622__373625 = function() {
        var G__373627__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__373627 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373627__delegate.call(this, a, b, c, ds)
        };
        G__373627.cljs$lang$maxFixedArity = 3;
        G__373627.cljs$lang$applyTo = function(arglist__373628) {
          var a = cljs.core.first(arglist__373628);
          var b = cljs.core.first(cljs.core.next(arglist__373628));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373628)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373628)));
          return G__373627__delegate.call(this, a, b, c, ds)
        };
        return G__373627
      }();
      G__373622 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__373622__373623.call(this, a, b);
          case 3:
            return G__373622__373624.call(this, a, b, c);
          default:
            return G__373622__373625.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__373622.cljs$lang$maxFixedArity = 3;
      G__373622.cljs$lang$applyTo = G__373622__373625.cljs$lang$applyTo;
      return G__373622
    }()
  };
  var fnil__373612 = function(f, x, y, z) {
    return function() {
      var G__373629 = null;
      var G__373629__373630 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__373629__373631 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__373629__373632 = function() {
        var G__373634__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__373634 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373634__delegate.call(this, a, b, c, ds)
        };
        G__373634.cljs$lang$maxFixedArity = 3;
        G__373634.cljs$lang$applyTo = function(arglist__373635) {
          var a = cljs.core.first(arglist__373635);
          var b = cljs.core.first(cljs.core.next(arglist__373635));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373635)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373635)));
          return G__373634__delegate.call(this, a, b, c, ds)
        };
        return G__373634
      }();
      G__373629 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__373629__373630.call(this, a, b);
          case 3:
            return G__373629__373631.call(this, a, b, c);
          default:
            return G__373629__373632.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__373629.cljs$lang$maxFixedArity = 3;
      G__373629.cljs$lang$applyTo = G__373629__373632.cljs$lang$applyTo;
      return G__373629
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__373610.call(this, f, x);
      case 3:
        return fnil__373611.call(this, f, x, y);
      case 4:
        return fnil__373612.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__373638 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____373636 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____373636)) {
        var s__373637 = temp__3698__auto____373636;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__373637)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__373637)))
      }else {
        return null
      }
    })
  };
  return mapi__373638.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____373639 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____373639)) {
      var s__373640 = temp__3698__auto____373639;
      var x__373641 = f.call(null, cljs.core.first.call(null, s__373640));
      if(cljs.core.truth_(x__373641 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__373640))
      }else {
        return cljs.core.cons.call(null, x__373641, keep.call(null, f, cljs.core.rest.call(null, s__373640)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__373651 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____373648 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____373648)) {
        var s__373649 = temp__3698__auto____373648;
        var x__373650 = f.call(null, idx, cljs.core.first.call(null, s__373649));
        if(cljs.core.truth_(x__373650 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__373649))
        }else {
          return cljs.core.cons.call(null, x__373650, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__373649)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__373651.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__373696 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__373701 = function() {
        return true
      };
      var ep1__373702 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__373703 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373658 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373658)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____373658
          }
        }())
      };
      var ep1__373704 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373659 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373659)) {
            var and__3546__auto____373660 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____373660)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____373660
            }
          }else {
            return and__3546__auto____373659
          }
        }())
      };
      var ep1__373705 = function() {
        var G__373707__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____373661 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____373661)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____373661
            }
          }())
        };
        var G__373707 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373707__delegate.call(this, x, y, z, args)
        };
        G__373707.cljs$lang$maxFixedArity = 3;
        G__373707.cljs$lang$applyTo = function(arglist__373708) {
          var x = cljs.core.first(arglist__373708);
          var y = cljs.core.first(cljs.core.next(arglist__373708));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373708)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373708)));
          return G__373707__delegate.call(this, x, y, z, args)
        };
        return G__373707
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__373701.call(this);
          case 1:
            return ep1__373702.call(this, x);
          case 2:
            return ep1__373703.call(this, x, y);
          case 3:
            return ep1__373704.call(this, x, y, z);
          default:
            return ep1__373705.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__373705.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__373697 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__373709 = function() {
        return true
      };
      var ep2__373710 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373662 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373662)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____373662
          }
        }())
      };
      var ep2__373711 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373663 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373663)) {
            var and__3546__auto____373664 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____373664)) {
              var and__3546__auto____373665 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____373665)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____373665
              }
            }else {
              return and__3546__auto____373664
            }
          }else {
            return and__3546__auto____373663
          }
        }())
      };
      var ep2__373712 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373666 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373666)) {
            var and__3546__auto____373667 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____373667)) {
              var and__3546__auto____373668 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____373668)) {
                var and__3546__auto____373669 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____373669)) {
                  var and__3546__auto____373670 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____373670)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____373670
                  }
                }else {
                  return and__3546__auto____373669
                }
              }else {
                return and__3546__auto____373668
              }
            }else {
              return and__3546__auto____373667
            }
          }else {
            return and__3546__auto____373666
          }
        }())
      };
      var ep2__373713 = function() {
        var G__373715__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____373671 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____373671)) {
              return cljs.core.every_QMARK_.call(null, function(p1__373642_SHARP_) {
                var and__3546__auto____373672 = p1.call(null, p1__373642_SHARP_);
                if(cljs.core.truth_(and__3546__auto____373672)) {
                  return p2.call(null, p1__373642_SHARP_)
                }else {
                  return and__3546__auto____373672
                }
              }, args)
            }else {
              return and__3546__auto____373671
            }
          }())
        };
        var G__373715 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373715__delegate.call(this, x, y, z, args)
        };
        G__373715.cljs$lang$maxFixedArity = 3;
        G__373715.cljs$lang$applyTo = function(arglist__373716) {
          var x = cljs.core.first(arglist__373716);
          var y = cljs.core.first(cljs.core.next(arglist__373716));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373716)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373716)));
          return G__373715__delegate.call(this, x, y, z, args)
        };
        return G__373715
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__373709.call(this);
          case 1:
            return ep2__373710.call(this, x);
          case 2:
            return ep2__373711.call(this, x, y);
          case 3:
            return ep2__373712.call(this, x, y, z);
          default:
            return ep2__373713.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__373713.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__373698 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__373717 = function() {
        return true
      };
      var ep3__373718 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373673 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373673)) {
            var and__3546__auto____373674 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____373674)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____373674
            }
          }else {
            return and__3546__auto____373673
          }
        }())
      };
      var ep3__373719 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373675 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373675)) {
            var and__3546__auto____373676 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____373676)) {
              var and__3546__auto____373677 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____373677)) {
                var and__3546__auto____373678 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____373678)) {
                  var and__3546__auto____373679 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____373679)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____373679
                  }
                }else {
                  return and__3546__auto____373678
                }
              }else {
                return and__3546__auto____373677
              }
            }else {
              return and__3546__auto____373676
            }
          }else {
            return and__3546__auto____373675
          }
        }())
      };
      var ep3__373720 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____373680 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____373680)) {
            var and__3546__auto____373681 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____373681)) {
              var and__3546__auto____373682 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____373682)) {
                var and__3546__auto____373683 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____373683)) {
                  var and__3546__auto____373684 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____373684)) {
                    var and__3546__auto____373685 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____373685)) {
                      var and__3546__auto____373686 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____373686)) {
                        var and__3546__auto____373687 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____373687)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____373687
                        }
                      }else {
                        return and__3546__auto____373686
                      }
                    }else {
                      return and__3546__auto____373685
                    }
                  }else {
                    return and__3546__auto____373684
                  }
                }else {
                  return and__3546__auto____373683
                }
              }else {
                return and__3546__auto____373682
              }
            }else {
              return and__3546__auto____373681
            }
          }else {
            return and__3546__auto____373680
          }
        }())
      };
      var ep3__373721 = function() {
        var G__373723__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____373688 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____373688)) {
              return cljs.core.every_QMARK_.call(null, function(p1__373643_SHARP_) {
                var and__3546__auto____373689 = p1.call(null, p1__373643_SHARP_);
                if(cljs.core.truth_(and__3546__auto____373689)) {
                  var and__3546__auto____373690 = p2.call(null, p1__373643_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____373690)) {
                    return p3.call(null, p1__373643_SHARP_)
                  }else {
                    return and__3546__auto____373690
                  }
                }else {
                  return and__3546__auto____373689
                }
              }, args)
            }else {
              return and__3546__auto____373688
            }
          }())
        };
        var G__373723 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373723__delegate.call(this, x, y, z, args)
        };
        G__373723.cljs$lang$maxFixedArity = 3;
        G__373723.cljs$lang$applyTo = function(arglist__373724) {
          var x = cljs.core.first(arglist__373724);
          var y = cljs.core.first(cljs.core.next(arglist__373724));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373724)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373724)));
          return G__373723__delegate.call(this, x, y, z, args)
        };
        return G__373723
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__373717.call(this);
          case 1:
            return ep3__373718.call(this, x);
          case 2:
            return ep3__373719.call(this, x, y);
          case 3:
            return ep3__373720.call(this, x, y, z);
          default:
            return ep3__373721.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__373721.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__373699 = function() {
    var G__373725__delegate = function(p1, p2, p3, ps) {
      var ps__373691 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__373726 = function() {
          return true
        };
        var epn__373727 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__373644_SHARP_) {
            return p1__373644_SHARP_.call(null, x)
          }, ps__373691)
        };
        var epn__373728 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__373645_SHARP_) {
            var and__3546__auto____373692 = p1__373645_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____373692)) {
              return p1__373645_SHARP_.call(null, y)
            }else {
              return and__3546__auto____373692
            }
          }, ps__373691)
        };
        var epn__373729 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__373646_SHARP_) {
            var and__3546__auto____373693 = p1__373646_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____373693)) {
              var and__3546__auto____373694 = p1__373646_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____373694)) {
                return p1__373646_SHARP_.call(null, z)
              }else {
                return and__3546__auto____373694
              }
            }else {
              return and__3546__auto____373693
            }
          }, ps__373691)
        };
        var epn__373730 = function() {
          var G__373732__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____373695 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____373695)) {
                return cljs.core.every_QMARK_.call(null, function(p1__373647_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__373647_SHARP_, args)
                }, ps__373691)
              }else {
                return and__3546__auto____373695
              }
            }())
          };
          var G__373732 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__373732__delegate.call(this, x, y, z, args)
          };
          G__373732.cljs$lang$maxFixedArity = 3;
          G__373732.cljs$lang$applyTo = function(arglist__373733) {
            var x = cljs.core.first(arglist__373733);
            var y = cljs.core.first(cljs.core.next(arglist__373733));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373733)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373733)));
            return G__373732__delegate.call(this, x, y, z, args)
          };
          return G__373732
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__373726.call(this);
            case 1:
              return epn__373727.call(this, x);
            case 2:
              return epn__373728.call(this, x, y);
            case 3:
              return epn__373729.call(this, x, y, z);
            default:
              return epn__373730.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__373730.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__373725 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__373725__delegate.call(this, p1, p2, p3, ps)
    };
    G__373725.cljs$lang$maxFixedArity = 3;
    G__373725.cljs$lang$applyTo = function(arglist__373734) {
      var p1 = cljs.core.first(arglist__373734);
      var p2 = cljs.core.first(cljs.core.next(arglist__373734));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373734)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373734)));
      return G__373725__delegate.call(this, p1, p2, p3, ps)
    };
    return G__373725
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__373696.call(this, p1);
      case 2:
        return every_pred__373697.call(this, p1, p2);
      case 3:
        return every_pred__373698.call(this, p1, p2, p3);
      default:
        return every_pred__373699.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__373699.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__373774 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__373779 = function() {
        return null
      };
      var sp1__373780 = function(x) {
        return p.call(null, x)
      };
      var sp1__373781 = function(x, y) {
        var or__3548__auto____373736 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373736)) {
          return or__3548__auto____373736
        }else {
          return p.call(null, y)
        }
      };
      var sp1__373782 = function(x, y, z) {
        var or__3548__auto____373737 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373737)) {
          return or__3548__auto____373737
        }else {
          var or__3548__auto____373738 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____373738)) {
            return or__3548__auto____373738
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__373783 = function() {
        var G__373785__delegate = function(x, y, z, args) {
          var or__3548__auto____373739 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____373739)) {
            return or__3548__auto____373739
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__373785 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373785__delegate.call(this, x, y, z, args)
        };
        G__373785.cljs$lang$maxFixedArity = 3;
        G__373785.cljs$lang$applyTo = function(arglist__373786) {
          var x = cljs.core.first(arglist__373786);
          var y = cljs.core.first(cljs.core.next(arglist__373786));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373786)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373786)));
          return G__373785__delegate.call(this, x, y, z, args)
        };
        return G__373785
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__373779.call(this);
          case 1:
            return sp1__373780.call(this, x);
          case 2:
            return sp1__373781.call(this, x, y);
          case 3:
            return sp1__373782.call(this, x, y, z);
          default:
            return sp1__373783.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__373783.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__373775 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__373787 = function() {
        return null
      };
      var sp2__373788 = function(x) {
        var or__3548__auto____373740 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373740)) {
          return or__3548__auto____373740
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__373789 = function(x, y) {
        var or__3548__auto____373741 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373741)) {
          return or__3548__auto____373741
        }else {
          var or__3548__auto____373742 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____373742)) {
            return or__3548__auto____373742
          }else {
            var or__3548__auto____373743 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____373743)) {
              return or__3548__auto____373743
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__373790 = function(x, y, z) {
        var or__3548__auto____373744 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373744)) {
          return or__3548__auto____373744
        }else {
          var or__3548__auto____373745 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____373745)) {
            return or__3548__auto____373745
          }else {
            var or__3548__auto____373746 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____373746)) {
              return or__3548__auto____373746
            }else {
              var or__3548__auto____373747 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____373747)) {
                return or__3548__auto____373747
              }else {
                var or__3548__auto____373748 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____373748)) {
                  return or__3548__auto____373748
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__373791 = function() {
        var G__373793__delegate = function(x, y, z, args) {
          var or__3548__auto____373749 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____373749)) {
            return or__3548__auto____373749
          }else {
            return cljs.core.some.call(null, function(p1__373652_SHARP_) {
              var or__3548__auto____373750 = p1.call(null, p1__373652_SHARP_);
              if(cljs.core.truth_(or__3548__auto____373750)) {
                return or__3548__auto____373750
              }else {
                return p2.call(null, p1__373652_SHARP_)
              }
            }, args)
          }
        };
        var G__373793 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373793__delegate.call(this, x, y, z, args)
        };
        G__373793.cljs$lang$maxFixedArity = 3;
        G__373793.cljs$lang$applyTo = function(arglist__373794) {
          var x = cljs.core.first(arglist__373794);
          var y = cljs.core.first(cljs.core.next(arglist__373794));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373794)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373794)));
          return G__373793__delegate.call(this, x, y, z, args)
        };
        return G__373793
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__373787.call(this);
          case 1:
            return sp2__373788.call(this, x);
          case 2:
            return sp2__373789.call(this, x, y);
          case 3:
            return sp2__373790.call(this, x, y, z);
          default:
            return sp2__373791.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__373791.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__373776 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__373795 = function() {
        return null
      };
      var sp3__373796 = function(x) {
        var or__3548__auto____373751 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373751)) {
          return or__3548__auto____373751
        }else {
          var or__3548__auto____373752 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____373752)) {
            return or__3548__auto____373752
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__373797 = function(x, y) {
        var or__3548__auto____373753 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373753)) {
          return or__3548__auto____373753
        }else {
          var or__3548__auto____373754 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____373754)) {
            return or__3548__auto____373754
          }else {
            var or__3548__auto____373755 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____373755)) {
              return or__3548__auto____373755
            }else {
              var or__3548__auto____373756 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____373756)) {
                return or__3548__auto____373756
              }else {
                var or__3548__auto____373757 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____373757)) {
                  return or__3548__auto____373757
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__373798 = function(x, y, z) {
        var or__3548__auto____373758 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____373758)) {
          return or__3548__auto____373758
        }else {
          var or__3548__auto____373759 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____373759)) {
            return or__3548__auto____373759
          }else {
            var or__3548__auto____373760 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____373760)) {
              return or__3548__auto____373760
            }else {
              var or__3548__auto____373761 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____373761)) {
                return or__3548__auto____373761
              }else {
                var or__3548__auto____373762 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____373762)) {
                  return or__3548__auto____373762
                }else {
                  var or__3548__auto____373763 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____373763)) {
                    return or__3548__auto____373763
                  }else {
                    var or__3548__auto____373764 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____373764)) {
                      return or__3548__auto____373764
                    }else {
                      var or__3548__auto____373765 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____373765)) {
                        return or__3548__auto____373765
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
      var sp3__373799 = function() {
        var G__373801__delegate = function(x, y, z, args) {
          var or__3548__auto____373766 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____373766)) {
            return or__3548__auto____373766
          }else {
            return cljs.core.some.call(null, function(p1__373653_SHARP_) {
              var or__3548__auto____373767 = p1.call(null, p1__373653_SHARP_);
              if(cljs.core.truth_(or__3548__auto____373767)) {
                return or__3548__auto____373767
              }else {
                var or__3548__auto____373768 = p2.call(null, p1__373653_SHARP_);
                if(cljs.core.truth_(or__3548__auto____373768)) {
                  return or__3548__auto____373768
                }else {
                  return p3.call(null, p1__373653_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__373801 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__373801__delegate.call(this, x, y, z, args)
        };
        G__373801.cljs$lang$maxFixedArity = 3;
        G__373801.cljs$lang$applyTo = function(arglist__373802) {
          var x = cljs.core.first(arglist__373802);
          var y = cljs.core.first(cljs.core.next(arglist__373802));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373802)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373802)));
          return G__373801__delegate.call(this, x, y, z, args)
        };
        return G__373801
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__373795.call(this);
          case 1:
            return sp3__373796.call(this, x);
          case 2:
            return sp3__373797.call(this, x, y);
          case 3:
            return sp3__373798.call(this, x, y, z);
          default:
            return sp3__373799.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__373799.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__373777 = function() {
    var G__373803__delegate = function(p1, p2, p3, ps) {
      var ps__373769 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__373804 = function() {
          return null
        };
        var spn__373805 = function(x) {
          return cljs.core.some.call(null, function(p1__373654_SHARP_) {
            return p1__373654_SHARP_.call(null, x)
          }, ps__373769)
        };
        var spn__373806 = function(x, y) {
          return cljs.core.some.call(null, function(p1__373655_SHARP_) {
            var or__3548__auto____373770 = p1__373655_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____373770)) {
              return or__3548__auto____373770
            }else {
              return p1__373655_SHARP_.call(null, y)
            }
          }, ps__373769)
        };
        var spn__373807 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__373656_SHARP_) {
            var or__3548__auto____373771 = p1__373656_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____373771)) {
              return or__3548__auto____373771
            }else {
              var or__3548__auto____373772 = p1__373656_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____373772)) {
                return or__3548__auto____373772
              }else {
                return p1__373656_SHARP_.call(null, z)
              }
            }
          }, ps__373769)
        };
        var spn__373808 = function() {
          var G__373810__delegate = function(x, y, z, args) {
            var or__3548__auto____373773 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____373773)) {
              return or__3548__auto____373773
            }else {
              return cljs.core.some.call(null, function(p1__373657_SHARP_) {
                return cljs.core.some.call(null, p1__373657_SHARP_, args)
              }, ps__373769)
            }
          };
          var G__373810 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__373810__delegate.call(this, x, y, z, args)
          };
          G__373810.cljs$lang$maxFixedArity = 3;
          G__373810.cljs$lang$applyTo = function(arglist__373811) {
            var x = cljs.core.first(arglist__373811);
            var y = cljs.core.first(cljs.core.next(arglist__373811));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373811)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373811)));
            return G__373810__delegate.call(this, x, y, z, args)
          };
          return G__373810
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__373804.call(this);
            case 1:
              return spn__373805.call(this, x);
            case 2:
              return spn__373806.call(this, x, y);
            case 3:
              return spn__373807.call(this, x, y, z);
            default:
              return spn__373808.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__373808.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__373803 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__373803__delegate.call(this, p1, p2, p3, ps)
    };
    G__373803.cljs$lang$maxFixedArity = 3;
    G__373803.cljs$lang$applyTo = function(arglist__373812) {
      var p1 = cljs.core.first(arglist__373812);
      var p2 = cljs.core.first(cljs.core.next(arglist__373812));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373812)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373812)));
      return G__373803__delegate.call(this, p1, p2, p3, ps)
    };
    return G__373803
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__373774.call(this, p1);
      case 2:
        return some_fn__373775.call(this, p1, p2);
      case 3:
        return some_fn__373776.call(this, p1, p2, p3);
      default:
        return some_fn__373777.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__373777.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__373825 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____373813 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____373813)) {
        var s__373814 = temp__3698__auto____373813;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__373814)), map.call(null, f, cljs.core.rest.call(null, s__373814)))
      }else {
        return null
      }
    })
  };
  var map__373826 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__373815 = cljs.core.seq.call(null, c1);
      var s2__373816 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____373817 = s1__373815;
        if(cljs.core.truth_(and__3546__auto____373817)) {
          return s2__373816
        }else {
          return and__3546__auto____373817
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__373815), cljs.core.first.call(null, s2__373816)), map.call(null, f, cljs.core.rest.call(null, s1__373815), cljs.core.rest.call(null, s2__373816)))
      }else {
        return null
      }
    })
  };
  var map__373827 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__373818 = cljs.core.seq.call(null, c1);
      var s2__373819 = cljs.core.seq.call(null, c2);
      var s3__373820 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____373821 = s1__373818;
        if(cljs.core.truth_(and__3546__auto____373821)) {
          var and__3546__auto____373822 = s2__373819;
          if(cljs.core.truth_(and__3546__auto____373822)) {
            return s3__373820
          }else {
            return and__3546__auto____373822
          }
        }else {
          return and__3546__auto____373821
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__373818), cljs.core.first.call(null, s2__373819), cljs.core.first.call(null, s3__373820)), map.call(null, f, cljs.core.rest.call(null, s1__373818), cljs.core.rest.call(null, s2__373819), cljs.core.rest.call(null, s3__373820)))
      }else {
        return null
      }
    })
  };
  var map__373828 = function() {
    var G__373830__delegate = function(f, c1, c2, c3, colls) {
      var step__373824 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__373823 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__373823))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__373823), step.call(null, map.call(null, cljs.core.rest, ss__373823)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__373735_SHARP_) {
        return cljs.core.apply.call(null, f, p1__373735_SHARP_)
      }, step__373824.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__373830 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__373830__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__373830.cljs$lang$maxFixedArity = 4;
    G__373830.cljs$lang$applyTo = function(arglist__373831) {
      var f = cljs.core.first(arglist__373831);
      var c1 = cljs.core.first(cljs.core.next(arglist__373831));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373831)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373831))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__373831))));
      return G__373830__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__373830
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__373825.call(this, f, c1);
      case 3:
        return map__373826.call(this, f, c1, c2);
      case 4:
        return map__373827.call(this, f, c1, c2, c3);
      default:
        return map__373828.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__373828.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____373832 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____373832)) {
        var s__373833 = temp__3698__auto____373832;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__373833), take.call(null, n - 1, cljs.core.rest.call(null, s__373833)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__373836 = function(n, coll) {
    while(true) {
      var s__373834 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____373835 = n > 0;
        if(cljs.core.truth_(and__3546__auto____373835)) {
          return s__373834
        }else {
          return and__3546__auto____373835
        }
      }())) {
        var G__373837 = n - 1;
        var G__373838 = cljs.core.rest.call(null, s__373834);
        n = G__373837;
        coll = G__373838;
        continue
      }else {
        return s__373834
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__373836.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__373839 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__373840 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__373839.call(this, n);
      case 2:
        return drop_last__373840.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__373842 = cljs.core.seq.call(null, coll);
  var lead__373843 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__373843)) {
      var G__373844 = cljs.core.next.call(null, s__373842);
      var G__373845 = cljs.core.next.call(null, lead__373843);
      s__373842 = G__373844;
      lead__373843 = G__373845;
      continue
    }else {
      return s__373842
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__373848 = function(pred, coll) {
    while(true) {
      var s__373846 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____373847 = s__373846;
        if(cljs.core.truth_(and__3546__auto____373847)) {
          return pred.call(null, cljs.core.first.call(null, s__373846))
        }else {
          return and__3546__auto____373847
        }
      }())) {
        var G__373849 = pred;
        var G__373850 = cljs.core.rest.call(null, s__373846);
        pred = G__373849;
        coll = G__373850;
        continue
      }else {
        return s__373846
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__373848.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____373851 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____373851)) {
      var s__373852 = temp__3698__auto____373851;
      return cljs.core.concat.call(null, s__373852, cycle.call(null, s__373852))
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
  var repeat__373853 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__373854 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__373853.call(this, n);
      case 2:
        return repeat__373854.call(this, n, x)
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
  var repeatedly__373856 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__373857 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__373856.call(this, n);
      case 2:
        return repeatedly__373857.call(this, n, f)
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
  var interleave__373863 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__373859 = cljs.core.seq.call(null, c1);
      var s2__373860 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____373861 = s1__373859;
        if(cljs.core.truth_(and__3546__auto____373861)) {
          return s2__373860
        }else {
          return and__3546__auto____373861
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__373859), cljs.core.cons.call(null, cljs.core.first.call(null, s2__373860), interleave.call(null, cljs.core.rest.call(null, s1__373859), cljs.core.rest.call(null, s2__373860))))
      }else {
        return null
      }
    })
  };
  var interleave__373864 = function() {
    var G__373866__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__373862 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__373862))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__373862), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__373862)))
        }else {
          return null
        }
      })
    };
    var G__373866 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373866__delegate.call(this, c1, c2, colls)
    };
    G__373866.cljs$lang$maxFixedArity = 2;
    G__373866.cljs$lang$applyTo = function(arglist__373867) {
      var c1 = cljs.core.first(arglist__373867);
      var c2 = cljs.core.first(cljs.core.next(arglist__373867));
      var colls = cljs.core.rest(cljs.core.next(arglist__373867));
      return G__373866__delegate.call(this, c1, c2, colls)
    };
    return G__373866
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__373863.call(this, c1, c2);
      default:
        return interleave__373864.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__373864.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__373870 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____373868 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____373868)) {
        var coll__373869 = temp__3695__auto____373868;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__373869), cat.call(null, cljs.core.rest.call(null, coll__373869), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__373870.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__373871 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__373872 = function() {
    var G__373874__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__373874 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__373874__delegate.call(this, f, coll, colls)
    };
    G__373874.cljs$lang$maxFixedArity = 2;
    G__373874.cljs$lang$applyTo = function(arglist__373875) {
      var f = cljs.core.first(arglist__373875);
      var coll = cljs.core.first(cljs.core.next(arglist__373875));
      var colls = cljs.core.rest(cljs.core.next(arglist__373875));
      return G__373874__delegate.call(this, f, coll, colls)
    };
    return G__373874
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__373871.call(this, f, coll);
      default:
        return mapcat__373872.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__373872.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____373876 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____373876)) {
      var s__373877 = temp__3698__auto____373876;
      var f__373878 = cljs.core.first.call(null, s__373877);
      var r__373879 = cljs.core.rest.call(null, s__373877);
      if(cljs.core.truth_(pred.call(null, f__373878))) {
        return cljs.core.cons.call(null, f__373878, filter.call(null, pred, r__373879))
      }else {
        return filter.call(null, pred, r__373879)
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
  var walk__373881 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__373881.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__373880_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__373880_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__373888 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__373889 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____373882 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____373882)) {
        var s__373883 = temp__3698__auto____373882;
        var p__373884 = cljs.core.take.call(null, n, s__373883);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__373884)))) {
          return cljs.core.cons.call(null, p__373884, partition.call(null, n, step, cljs.core.drop.call(null, step, s__373883)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__373890 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____373885 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____373885)) {
        var s__373886 = temp__3698__auto____373885;
        var p__373887 = cljs.core.take.call(null, n, s__373886);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__373887)))) {
          return cljs.core.cons.call(null, p__373887, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__373886)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__373887, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__373888.call(this, n, step);
      case 3:
        return partition__373889.call(this, n, step, pad);
      case 4:
        return partition__373890.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__373896 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__373897 = function(m, ks, not_found) {
    var sentinel__373892 = cljs.core.lookup_sentinel;
    var m__373893 = m;
    var ks__373894 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__373894)) {
        var m__373895 = cljs.core.get.call(null, m__373893, cljs.core.first.call(null, ks__373894), sentinel__373892);
        if(cljs.core.truth_(sentinel__373892 === m__373895)) {
          return not_found
        }else {
          var G__373899 = sentinel__373892;
          var G__373900 = m__373895;
          var G__373901 = cljs.core.next.call(null, ks__373894);
          sentinel__373892 = G__373899;
          m__373893 = G__373900;
          ks__373894 = G__373901;
          continue
        }
      }else {
        return m__373893
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__373896.call(this, m, ks);
      case 3:
        return get_in__373897.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__373902, v) {
  var vec__373903__373904 = p__373902;
  var k__373905 = cljs.core.nth.call(null, vec__373903__373904, 0, null);
  var ks__373906 = cljs.core.nthnext.call(null, vec__373903__373904, 1);
  if(cljs.core.truth_(ks__373906)) {
    return cljs.core.assoc.call(null, m, k__373905, assoc_in.call(null, cljs.core.get.call(null, m, k__373905), ks__373906, v))
  }else {
    return cljs.core.assoc.call(null, m, k__373905, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__373907, f, args) {
    var vec__373908__373909 = p__373907;
    var k__373910 = cljs.core.nth.call(null, vec__373908__373909, 0, null);
    var ks__373911 = cljs.core.nthnext.call(null, vec__373908__373909, 1);
    if(cljs.core.truth_(ks__373911)) {
      return cljs.core.assoc.call(null, m, k__373910, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__373910), ks__373911, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__373910, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__373910), args))
    }
  };
  var update_in = function(m, p__373907, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__373907, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__373912) {
    var m = cljs.core.first(arglist__373912);
    var p__373907 = cljs.core.first(cljs.core.next(arglist__373912));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__373912)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__373912)));
    return update_in__delegate.call(this, m, p__373907, f, args)
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
  var this__373913 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__373946 = null;
  var G__373946__373947 = function(coll, k) {
    var this__373914 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__373946__373948 = function(coll, k, not_found) {
    var this__373915 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__373946 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373946__373947.call(this, coll, k);
      case 3:
        return G__373946__373948.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373946
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__373916 = this;
  var new_array__373917 = cljs.core.aclone.call(null, this__373916.array);
  new_array__373917[k] = v;
  return new cljs.core.Vector(this__373916.meta, new_array__373917)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__373950 = null;
  var G__373950__373951 = function(tsym373918, k) {
    var this__373920 = this;
    var tsym373918__373921 = this;
    var coll__373922 = tsym373918__373921;
    return cljs.core._lookup.call(null, coll__373922, k)
  };
  var G__373950__373952 = function(tsym373919, k, not_found) {
    var this__373923 = this;
    var tsym373919__373924 = this;
    var coll__373925 = tsym373919__373924;
    return cljs.core._lookup.call(null, coll__373925, k, not_found)
  };
  G__373950 = function(tsym373919, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373950__373951.call(this, tsym373919, k);
      case 3:
        return G__373950__373952.call(this, tsym373919, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373950
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__373926 = this;
  var new_array__373927 = cljs.core.aclone.call(null, this__373926.array);
  new_array__373927.push(o);
  return new cljs.core.Vector(this__373926.meta, new_array__373927)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__373954 = null;
  var G__373954__373955 = function(v, f) {
    var this__373928 = this;
    return cljs.core.ci_reduce.call(null, this__373928.array, f)
  };
  var G__373954__373956 = function(v, f, start) {
    var this__373929 = this;
    return cljs.core.ci_reduce.call(null, this__373929.array, f, start)
  };
  G__373954 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__373954__373955.call(this, v, f);
      case 3:
        return G__373954__373956.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373954
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__373930 = this;
  if(cljs.core.truth_(this__373930.array.length > 0)) {
    var vector_seq__373931 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__373930.array.length)) {
          return cljs.core.cons.call(null, this__373930.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__373931.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__373932 = this;
  return this__373932.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__373933 = this;
  var count__373934 = this__373933.array.length;
  if(cljs.core.truth_(count__373934 > 0)) {
    return this__373933.array[count__373934 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__373935 = this;
  if(cljs.core.truth_(this__373935.array.length > 0)) {
    var new_array__373936 = cljs.core.aclone.call(null, this__373935.array);
    new_array__373936.pop();
    return new cljs.core.Vector(this__373935.meta, new_array__373936)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__373937 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__373938 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__373939 = this;
  return new cljs.core.Vector(meta, this__373939.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__373940 = this;
  return this__373940.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__373958 = null;
  var G__373958__373959 = function(coll, n) {
    var this__373941 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373942 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____373942)) {
        return n < this__373941.array.length
      }else {
        return and__3546__auto____373942
      }
    }())) {
      return this__373941.array[n]
    }else {
      return null
    }
  };
  var G__373958__373960 = function(coll, n, not_found) {
    var this__373943 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____373944 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____373944)) {
        return n < this__373943.array.length
      }else {
        return and__3546__auto____373944
      }
    }())) {
      return this__373943.array[n]
    }else {
      return not_found
    }
  };
  G__373958 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__373958__373959.call(this, coll, n);
      case 3:
        return G__373958__373960.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__373958
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__373945 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__373945.meta)
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
  vector.cljs$lang$applyTo = function(arglist__373962) {
    var args = cljs.core.seq(arglist__373962);
    return vector__delegate.call(this, args)
  };
  return vector
}();
cljs.core.tail_off = function tail_off(pv) {
  var cnt__373963 = pv.cnt;
  if(cljs.core.truth_(cnt__373963 < 32)) {
    return 0
  }else {
    return cnt__373963 - 1 >> 5 << 5
  }
};
cljs.core.new_path = function new_path(level, node) {
  var ll__373964 = level;
  var ret__373965 = node;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, ll__373964))) {
      return ret__373965
    }else {
      var embed__373966 = ret__373965;
      var r__373967 = cljs.core.aclone.call(null, cljs.core.PersistentVector.EMPTY_NODE);
      var ___373968 = r__373967[0] = embed__373966;
      var G__373969 = ll__373964 - 5;
      var G__373970 = r__373967;
      ll__373964 = G__373969;
      ret__373965 = G__373970;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__373971 = cljs.core.aclone.call(null, parent);
  var subidx__373972 = pv.cnt - 1 >> level & 31;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 5, level))) {
    ret__373971[subidx__373972] = tailnode;
    return ret__373971
  }else {
    var temp__3695__auto____373973 = parent[subidx__373972];
    if(cljs.core.truth_(temp__3695__auto____373973)) {
      var child__373974 = temp__3695__auto____373973;
      var node_to_insert__373975 = push_tail.call(null, pv, level - 5, child__373974, tailnode);
      var ___373976 = ret__373971[subidx__373972] = node_to_insert__373975;
      return ret__373971
    }else {
      var node_to_insert__373977 = cljs.core.new_path.call(null, level - 5, tailnode);
      var ___373978 = ret__373971[subidx__373972] = node_to_insert__373977;
      return ret__373971
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____373979 = 0 <= i;
    if(cljs.core.truth_(and__3546__auto____373979)) {
      return i < pv.cnt
    }else {
      return and__3546__auto____373979
    }
  }())) {
    if(cljs.core.truth_(i >= cljs.core.tail_off.call(null, pv))) {
      return pv.tail
    }else {
      var node__373980 = pv.root;
      var level__373981 = pv.shift;
      while(true) {
        if(cljs.core.truth_(level__373981 > 0)) {
          var G__373982 = node__373980[i >> level__373981 & 31];
          var G__373983 = level__373981 - 5;
          node__373980 = G__373982;
          level__373981 = G__373983;
          continue
        }else {
          return node__373980
        }
        break
      }
    }
  }else {
    throw new Error(cljs.core.str.call(null, "No item ", i, " in vector of length ", pv.cnt));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__373984 = cljs.core.aclone.call(null, node);
  if(cljs.core.truth_(level === 0)) {
    ret__373984[i & 31] = val;
    return ret__373984
  }else {
    var subidx__373985 = i >> level & 31;
    var ___373986 = ret__373984[subidx__373985] = do_assoc.call(null, pv, level - 5, node[subidx__373985], i, val);
    return ret__373984
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__373987 = pv.cnt - 2 >> level & 31;
  if(cljs.core.truth_(level > 5)) {
    var new_child__373988 = pop_tail.call(null, pv, level - 5, node[subidx__373987]);
    if(cljs.core.truth_(function() {
      var and__3546__auto____373989 = new_child__373988 === null;
      if(cljs.core.truth_(and__3546__auto____373989)) {
        return subidx__373987 === 0
      }else {
        return and__3546__auto____373989
      }
    }())) {
      return null
    }else {
      var ret__373990 = cljs.core.aclone.call(null, node);
      var ___373991 = ret__373990[subidx__373987] = new_child__373988;
      return ret__373990
    }
  }else {
    if(cljs.core.truth_(subidx__373987 === 0)) {
      return null
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        var ret__373992 = cljs.core.aclone.call(null, node);
        var ___373993 = ret__373992[subidx__373987] = null;
        return ret__373992
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
  var this__373994 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__374034 = null;
  var G__374034__374035 = function(coll, k) {
    var this__373995 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__374034__374036 = function(coll, k, not_found) {
    var this__373996 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__374034 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374034__374035.call(this, coll, k);
      case 3:
        return G__374034__374036.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374034
}();
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__373997 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____373998 = 0 <= k;
    if(cljs.core.truth_(and__3546__auto____373998)) {
      return k < this__373997.cnt
    }else {
      return and__3546__auto____373998
    }
  }())) {
    if(cljs.core.truth_(cljs.core.tail_off.call(null, coll) <= k)) {
      var new_tail__373999 = cljs.core.aclone.call(null, this__373997.tail);
      new_tail__373999[k & 31] = v;
      return new cljs.core.PersistentVector(this__373997.meta, this__373997.cnt, this__373997.shift, this__373997.root, new_tail__373999)
    }else {
      return new cljs.core.PersistentVector(this__373997.meta, this__373997.cnt, this__373997.shift, cljs.core.do_assoc.call(null, coll, this__373997.shift, this__373997.root, k, v), this__373997.tail)
    }
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, k, this__373997.cnt))) {
      return cljs.core._conj.call(null, coll, v)
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw new Error(cljs.core.str.call(null, "Index ", k, " out of bounds  [0,", this__373997.cnt, "]"));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IFn$ = true;
cljs.core.PersistentVector.prototype.call = function() {
  var G__374038 = null;
  var G__374038__374039 = function(tsym374000, k) {
    var this__374002 = this;
    var tsym374000__374003 = this;
    var coll__374004 = tsym374000__374003;
    return cljs.core._lookup.call(null, coll__374004, k)
  };
  var G__374038__374040 = function(tsym374001, k, not_found) {
    var this__374005 = this;
    var tsym374001__374006 = this;
    var coll__374007 = tsym374001__374006;
    return cljs.core._lookup.call(null, coll__374007, k, not_found)
  };
  G__374038 = function(tsym374001, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374038__374039.call(this, tsym374001, k);
      case 3:
        return G__374038__374040.call(this, tsym374001, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374038
}();
cljs.core.PersistentVector.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__374008 = this;
  if(cljs.core.truth_(this__374008.cnt - cljs.core.tail_off.call(null, coll) < 32)) {
    var new_tail__374009 = cljs.core.aclone.call(null, this__374008.tail);
    new_tail__374009.push(o);
    return new cljs.core.PersistentVector(this__374008.meta, this__374008.cnt + 1, this__374008.shift, this__374008.root, new_tail__374009)
  }else {
    var root_overflow_QMARK___374010 = this__374008.cnt >> 5 > 1 << this__374008.shift;
    var new_shift__374011 = cljs.core.truth_(root_overflow_QMARK___374010) ? this__374008.shift + 5 : this__374008.shift;
    var new_root__374013 = cljs.core.truth_(root_overflow_QMARK___374010) ? function() {
      var n_r__374012 = cljs.core.aclone.call(null, cljs.core.PersistentVector.EMPTY_NODE);
      n_r__374012[0] = this__374008.root;
      n_r__374012[1] = cljs.core.new_path.call(null, this__374008.shift, this__374008.tail);
      return n_r__374012
    }() : cljs.core.push_tail.call(null, coll, this__374008.shift, this__374008.root, this__374008.tail);
    return new cljs.core.PersistentVector(this__374008.meta, this__374008.cnt + 1, new_shift__374011, new_root__374013, [o])
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__374042 = null;
  var G__374042__374043 = function(v, f) {
    var this__374014 = this;
    return cljs.core.ci_reduce.call(null, v, f)
  };
  var G__374042__374044 = function(v, f, start) {
    var this__374015 = this;
    return cljs.core.ci_reduce.call(null, v, f, start)
  };
  G__374042 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__374042__374043.call(this, v, f);
      case 3:
        return G__374042__374044.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374042
}();
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__374016 = this;
  if(cljs.core.truth_(this__374016.cnt > 0)) {
    var vector_seq__374017 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__374016.cnt)) {
          return cljs.core.cons.call(null, cljs.core._nth.call(null, coll, i), vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__374017.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__374018 = this;
  return this__374018.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__374019 = this;
  if(cljs.core.truth_(this__374019.cnt > 0)) {
    return cljs.core._nth.call(null, coll, this__374019.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__374020 = this;
  if(cljs.core.truth_(this__374020.cnt === 0)) {
    throw new Error("Can't pop empty vector");
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, this__374020.cnt))) {
      return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__374020.meta)
    }else {
      if(cljs.core.truth_(1 < this__374020.cnt - cljs.core.tail_off.call(null, coll))) {
        return new cljs.core.PersistentVector(this__374020.meta, this__374020.cnt - 1, this__374020.shift, this__374020.root, cljs.core.aclone.call(null, this__374020.tail))
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          var new_tail__374021 = cljs.core.array_for.call(null, coll, this__374020.cnt - 2);
          var nr__374022 = cljs.core.pop_tail.call(null, this__374020.shift, this__374020.root);
          var new_root__374023 = cljs.core.truth_(nr__374022 === null) ? cljs.core.PersistentVector.EMPTY_NODE : nr__374022;
          var cnt_1__374024 = this__374020.cnt - 1;
          if(cljs.core.truth_(function() {
            var and__3546__auto____374025 = 5 < this__374020.shift;
            if(cljs.core.truth_(and__3546__auto____374025)) {
              return new_root__374023[1] === null
            }else {
              return and__3546__auto____374025
            }
          }())) {
            return new cljs.core.PersistentVector(this__374020.meta, cnt_1__374024, this__374020.shift - 5, new_root__374023[0], new_tail__374021)
          }else {
            return new cljs.core.PersistentVector(this__374020.meta, cnt_1__374024, this__374020.shift, new_root__374023, new_tail__374021)
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
  var this__374026 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374027 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374028 = this;
  return new cljs.core.PersistentVector(meta, this__374028.cnt, this__374028.shift, this__374028.root, this__374028.tail)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374029 = this;
  return this__374029.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__374046 = null;
  var G__374046__374047 = function(coll, n) {
    var this__374030 = this;
    return cljs.core.array_for.call(null, coll, n)[n & 31]
  };
  var G__374046__374048 = function(coll, n, not_found) {
    var this__374031 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____374032 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____374032)) {
        return n < this__374031.cnt
      }else {
        return and__3546__auto____374032
      }
    }())) {
      return cljs.core._nth.call(null, coll, n)
    }else {
      return not_found
    }
  };
  G__374046 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374046__374047.call(this, coll, n);
      case 3:
        return G__374046__374048.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374046
}();
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374033 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__374033.meta)
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
  var this__374050 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__374078 = null;
  var G__374078__374079 = function(coll, k) {
    var this__374051 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__374078__374080 = function(coll, k, not_found) {
    var this__374052 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__374078 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374078__374079.call(this, coll, k);
      case 3:
        return G__374078__374080.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374078
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__374053 = this;
  var v_pos__374054 = this__374053.start + key;
  return new cljs.core.Subvec(this__374053.meta, cljs.core._assoc.call(null, this__374053.v, v_pos__374054, val), this__374053.start, this__374053.end > v_pos__374054 + 1 ? this__374053.end : v_pos__374054 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__374082 = null;
  var G__374082__374083 = function(tsym374055, k) {
    var this__374057 = this;
    var tsym374055__374058 = this;
    var coll__374059 = tsym374055__374058;
    return cljs.core._lookup.call(null, coll__374059, k)
  };
  var G__374082__374084 = function(tsym374056, k, not_found) {
    var this__374060 = this;
    var tsym374056__374061 = this;
    var coll__374062 = tsym374056__374061;
    return cljs.core._lookup.call(null, coll__374062, k, not_found)
  };
  G__374082 = function(tsym374056, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374082__374083.call(this, tsym374056, k);
      case 3:
        return G__374082__374084.call(this, tsym374056, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374082
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__374063 = this;
  return new cljs.core.Subvec(this__374063.meta, cljs.core._assoc_n.call(null, this__374063.v, this__374063.end, o), this__374063.start, this__374063.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__374086 = null;
  var G__374086__374087 = function(coll, f) {
    var this__374064 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__374086__374088 = function(coll, f, start) {
    var this__374065 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__374086 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__374086__374087.call(this, coll, f);
      case 3:
        return G__374086__374088.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374086
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__374066 = this;
  var subvec_seq__374067 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__374066.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__374066.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__374067.call(null, this__374066.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__374068 = this;
  return this__374068.end - this__374068.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__374069 = this;
  return cljs.core._nth.call(null, this__374069.v, this__374069.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__374070 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__374070.start, this__374070.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__374070.meta, this__374070.v, this__374070.start, this__374070.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__374071 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374072 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374073 = this;
  return new cljs.core.Subvec(meta, this__374073.v, this__374073.start, this__374073.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374074 = this;
  return this__374074.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__374090 = null;
  var G__374090__374091 = function(coll, n) {
    var this__374075 = this;
    return cljs.core._nth.call(null, this__374075.v, this__374075.start + n)
  };
  var G__374090__374092 = function(coll, n, not_found) {
    var this__374076 = this;
    return cljs.core._nth.call(null, this__374076.v, this__374076.start + n, not_found)
  };
  G__374090 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374090__374091.call(this, coll, n);
      case 3:
        return G__374090__374092.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374090
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374077 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__374077.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__374094 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__374095 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__374094.call(this, v, start);
      case 3:
        return subvec__374095.call(this, v, start, end)
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
  var this__374097 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__374098 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374099 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374100 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__374100.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__374101 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__374102 = this;
  return cljs.core._first.call(null, this__374102.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__374103 = this;
  var temp__3695__auto____374104 = cljs.core.next.call(null, this__374103.front);
  if(cljs.core.truth_(temp__3695__auto____374104)) {
    var f1__374105 = temp__3695__auto____374104;
    return new cljs.core.PersistentQueueSeq(this__374103.meta, f1__374105, this__374103.rear)
  }else {
    if(cljs.core.truth_(this__374103.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__374103.meta, this__374103.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374106 = this;
  return this__374106.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374107 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__374107.front, this__374107.rear)
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
  var this__374108 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__374109 = this;
  if(cljs.core.truth_(this__374109.front)) {
    return new cljs.core.PersistentQueue(this__374109.meta, this__374109.count + 1, this__374109.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____374110 = this__374109.rear;
      if(cljs.core.truth_(or__3548__auto____374110)) {
        return or__3548__auto____374110
      }else {
        return cljs.core.PersistentVector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__374109.meta, this__374109.count + 1, cljs.core.conj.call(null, this__374109.front, o), cljs.core.PersistentVector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__374111 = this;
  var rear__374112 = cljs.core.seq.call(null, this__374111.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____374113 = this__374111.front;
    if(cljs.core.truth_(or__3548__auto____374113)) {
      return or__3548__auto____374113
    }else {
      return rear__374112
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__374111.front, cljs.core.seq.call(null, rear__374112))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__374114 = this;
  return this__374114.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__374115 = this;
  return cljs.core._first.call(null, this__374115.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__374116 = this;
  if(cljs.core.truth_(this__374116.front)) {
    var temp__3695__auto____374117 = cljs.core.next.call(null, this__374116.front);
    if(cljs.core.truth_(temp__3695__auto____374117)) {
      var f1__374118 = temp__3695__auto____374117;
      return new cljs.core.PersistentQueue(this__374116.meta, this__374116.count - 1, f1__374118, this__374116.rear)
    }else {
      return new cljs.core.PersistentQueue(this__374116.meta, this__374116.count - 1, cljs.core.seq.call(null, this__374116.rear), cljs.core.PersistentVector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__374119 = this;
  return cljs.core.first.call(null, this__374119.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__374120 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374121 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374122 = this;
  return new cljs.core.PersistentQueue(meta, this__374122.count, this__374122.front, this__374122.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374123 = this;
  return this__374123.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374124 = this;
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
  var this__374125 = this;
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
  var len__374126 = array.length;
  var i__374127 = 0;
  while(true) {
    if(cljs.core.truth_(i__374127 < len__374126)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__374127]))) {
        return i__374127
      }else {
        var G__374128 = i__374127 + incr;
        i__374127 = G__374128;
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
  var obj_map_contains_key_QMARK___374130 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___374131 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374129 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____374129)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____374129
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
        return obj_map_contains_key_QMARK___374130.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___374131.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__374134 = cljs.core.hash.call(null, a);
  var b__374135 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__374134 < b__374135)) {
    return-1
  }else {
    if(cljs.core.truth_(a__374134 > b__374135)) {
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
  var this__374136 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__374163 = null;
  var G__374163__374164 = function(coll, k) {
    var this__374137 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__374163__374165 = function(coll, k, not_found) {
    var this__374138 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__374138.strobj, this__374138.strobj[k], not_found)
  };
  G__374163 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374163__374164.call(this, coll, k);
      case 3:
        return G__374163__374165.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374163
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__374139 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__374140 = goog.object.clone.call(null, this__374139.strobj);
    var overwrite_QMARK___374141 = new_strobj__374140.hasOwnProperty(k);
    new_strobj__374140[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___374141)) {
      return new cljs.core.ObjMap(this__374139.meta, this__374139.keys, new_strobj__374140)
    }else {
      var new_keys__374142 = cljs.core.aclone.call(null, this__374139.keys);
      new_keys__374142.push(k);
      return new cljs.core.ObjMap(this__374139.meta, new_keys__374142, new_strobj__374140)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__374139.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__374143 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__374143.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__374167 = null;
  var G__374167__374168 = function(tsym374144, k) {
    var this__374146 = this;
    var tsym374144__374147 = this;
    var coll__374148 = tsym374144__374147;
    return cljs.core._lookup.call(null, coll__374148, k)
  };
  var G__374167__374169 = function(tsym374145, k, not_found) {
    var this__374149 = this;
    var tsym374145__374150 = this;
    var coll__374151 = tsym374145__374150;
    return cljs.core._lookup.call(null, coll__374151, k, not_found)
  };
  G__374167 = function(tsym374145, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374167__374168.call(this, tsym374145, k);
      case 3:
        return G__374167__374169.call(this, tsym374145, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374167
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__374152 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__374153 = this;
  if(cljs.core.truth_(this__374153.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__374133_SHARP_) {
      return cljs.core.vector.call(null, p1__374133_SHARP_, this__374153.strobj[p1__374133_SHARP_])
    }, this__374153.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__374154 = this;
  return this__374154.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374155 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374156 = this;
  return new cljs.core.ObjMap(meta, this__374156.keys, this__374156.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374157 = this;
  return this__374157.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374158 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__374158.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__374159 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____374160 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____374160)) {
      return this__374159.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____374160
    }
  }())) {
    var new_keys__374161 = cljs.core.aclone.call(null, this__374159.keys);
    var new_strobj__374162 = goog.object.clone.call(null, this__374159.strobj);
    new_keys__374161.splice(cljs.core.scan_array.call(null, 1, k, new_keys__374161), 1);
    cljs.core.js_delete.call(null, new_strobj__374162, k);
    return new cljs.core.ObjMap(this__374159.meta, new_keys__374161, new_strobj__374162)
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
  var this__374172 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__374210 = null;
  var G__374210__374211 = function(coll, k) {
    var this__374173 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__374210__374212 = function(coll, k, not_found) {
    var this__374174 = this;
    var bucket__374175 = this__374174.hashobj[cljs.core.hash.call(null, k)];
    var i__374176 = cljs.core.truth_(bucket__374175) ? cljs.core.scan_array.call(null, 2, k, bucket__374175) : null;
    if(cljs.core.truth_(i__374176)) {
      return bucket__374175[i__374176 + 1]
    }else {
      return not_found
    }
  };
  G__374210 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374210__374211.call(this, coll, k);
      case 3:
        return G__374210__374212.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374210
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__374177 = this;
  var h__374178 = cljs.core.hash.call(null, k);
  var bucket__374179 = this__374177.hashobj[h__374178];
  if(cljs.core.truth_(bucket__374179)) {
    var new_bucket__374180 = cljs.core.aclone.call(null, bucket__374179);
    var new_hashobj__374181 = goog.object.clone.call(null, this__374177.hashobj);
    new_hashobj__374181[h__374178] = new_bucket__374180;
    var temp__3695__auto____374182 = cljs.core.scan_array.call(null, 2, k, new_bucket__374180);
    if(cljs.core.truth_(temp__3695__auto____374182)) {
      var i__374183 = temp__3695__auto____374182;
      new_bucket__374180[i__374183 + 1] = v;
      return new cljs.core.HashMap(this__374177.meta, this__374177.count, new_hashobj__374181)
    }else {
      new_bucket__374180.push(k, v);
      return new cljs.core.HashMap(this__374177.meta, this__374177.count + 1, new_hashobj__374181)
    }
  }else {
    var new_hashobj__374184 = goog.object.clone.call(null, this__374177.hashobj);
    new_hashobj__374184[h__374178] = [k, v];
    return new cljs.core.HashMap(this__374177.meta, this__374177.count + 1, new_hashobj__374184)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__374185 = this;
  var bucket__374186 = this__374185.hashobj[cljs.core.hash.call(null, k)];
  var i__374187 = cljs.core.truth_(bucket__374186) ? cljs.core.scan_array.call(null, 2, k, bucket__374186) : null;
  if(cljs.core.truth_(i__374187)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__374214 = null;
  var G__374214__374215 = function(tsym374188, k) {
    var this__374190 = this;
    var tsym374188__374191 = this;
    var coll__374192 = tsym374188__374191;
    return cljs.core._lookup.call(null, coll__374192, k)
  };
  var G__374214__374216 = function(tsym374189, k, not_found) {
    var this__374193 = this;
    var tsym374189__374194 = this;
    var coll__374195 = tsym374189__374194;
    return cljs.core._lookup.call(null, coll__374195, k, not_found)
  };
  G__374214 = function(tsym374189, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374214__374215.call(this, tsym374189, k);
      case 3:
        return G__374214__374216.call(this, tsym374189, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374214
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__374196 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__374197 = this;
  if(cljs.core.truth_(this__374197.count > 0)) {
    var hashes__374198 = cljs.core.js_keys.call(null, this__374197.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__374171_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__374197.hashobj[p1__374171_SHARP_]))
    }, hashes__374198)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__374199 = this;
  return this__374199.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374200 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374201 = this;
  return new cljs.core.HashMap(meta, this__374201.count, this__374201.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374202 = this;
  return this__374202.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374203 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__374203.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__374204 = this;
  var h__374205 = cljs.core.hash.call(null, k);
  var bucket__374206 = this__374204.hashobj[h__374205];
  var i__374207 = cljs.core.truth_(bucket__374206) ? cljs.core.scan_array.call(null, 2, k, bucket__374206) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__374207))) {
    return coll
  }else {
    var new_hashobj__374208 = goog.object.clone.call(null, this__374204.hashobj);
    if(cljs.core.truth_(3 > bucket__374206.length)) {
      cljs.core.js_delete.call(null, new_hashobj__374208, h__374205)
    }else {
      var new_bucket__374209 = cljs.core.aclone.call(null, bucket__374206);
      new_bucket__374209.splice(i__374207, 2);
      new_hashobj__374208[h__374205] = new_bucket__374209
    }
    return new cljs.core.HashMap(this__374204.meta, this__374204.count - 1, new_hashobj__374208)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__374218 = ks.length;
  var i__374219 = 0;
  var out__374220 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__374219 < len__374218)) {
      var G__374221 = i__374219 + 1;
      var G__374222 = cljs.core.assoc.call(null, out__374220, ks[i__374219], vs[i__374219]);
      i__374219 = G__374221;
      out__374220 = G__374222;
      continue
    }else {
      return out__374220
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__374223 = cljs.core.seq.call(null, keyvals);
    var out__374224 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__374223)) {
        var G__374225 = cljs.core.nnext.call(null, in$__374223);
        var G__374226 = cljs.core.assoc.call(null, out__374224, cljs.core.first.call(null, in$__374223), cljs.core.second.call(null, in$__374223));
        in$__374223 = G__374225;
        out__374224 = G__374226;
        continue
      }else {
        return out__374224
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
  hash_map.cljs$lang$applyTo = function(arglist__374227) {
    var keyvals = cljs.core.seq(arglist__374227);
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
      return cljs.core.reduce.call(null, function(p1__374228_SHARP_, p2__374229_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____374230 = p1__374228_SHARP_;
          if(cljs.core.truth_(or__3548__auto____374230)) {
            return or__3548__auto____374230
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__374229_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__374231) {
    var maps = cljs.core.seq(arglist__374231);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__374234 = function(m, e) {
        var k__374232 = cljs.core.first.call(null, e);
        var v__374233 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__374232))) {
          return cljs.core.assoc.call(null, m, k__374232, f.call(null, cljs.core.get.call(null, m, k__374232), v__374233))
        }else {
          return cljs.core.assoc.call(null, m, k__374232, v__374233)
        }
      };
      var merge2__374236 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__374234, function() {
          var or__3548__auto____374235 = m1;
          if(cljs.core.truth_(or__3548__auto____374235)) {
            return or__3548__auto____374235
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__374236, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__374237) {
    var f = cljs.core.first(arglist__374237);
    var maps = cljs.core.rest(arglist__374237);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__374239 = cljs.core.ObjMap.fromObject([], {});
  var keys__374240 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__374240)) {
      var key__374241 = cljs.core.first.call(null, keys__374240);
      var entry__374242 = cljs.core.get.call(null, map, key__374241, "\ufdd0'user/not-found");
      var G__374243 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__374242, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__374239, key__374241, entry__374242) : ret__374239;
      var G__374244 = cljs.core.next.call(null, keys__374240);
      ret__374239 = G__374243;
      keys__374240 = G__374244;
      continue
    }else {
      return ret__374239
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
  var this__374245 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__374266 = null;
  var G__374266__374267 = function(coll, v) {
    var this__374246 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__374266__374268 = function(coll, v, not_found) {
    var this__374247 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__374247.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__374266 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374266__374267.call(this, coll, v);
      case 3:
        return G__374266__374268.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374266
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__374270 = null;
  var G__374270__374271 = function(tsym374248, k) {
    var this__374250 = this;
    var tsym374248__374251 = this;
    var coll__374252 = tsym374248__374251;
    return cljs.core._lookup.call(null, coll__374252, k)
  };
  var G__374270__374272 = function(tsym374249, k, not_found) {
    var this__374253 = this;
    var tsym374249__374254 = this;
    var coll__374255 = tsym374249__374254;
    return cljs.core._lookup.call(null, coll__374255, k, not_found)
  };
  G__374270 = function(tsym374249, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374270__374271.call(this, tsym374249, k);
      case 3:
        return G__374270__374272.call(this, tsym374249, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374270
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__374256 = this;
  return new cljs.core.Set(this__374256.meta, cljs.core.assoc.call(null, this__374256.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__374257 = this;
  return cljs.core.keys.call(null, this__374257.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__374258 = this;
  return new cljs.core.Set(this__374258.meta, cljs.core.dissoc.call(null, this__374258.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__374259 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__374260 = this;
  var and__3546__auto____374261 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____374261)) {
    var and__3546__auto____374262 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____374262)) {
      return cljs.core.every_QMARK_.call(null, function(p1__374238_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__374238_SHARP_)
      }, other)
    }else {
      return and__3546__auto____374262
    }
  }else {
    return and__3546__auto____374261
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__374263 = this;
  return new cljs.core.Set(meta, this__374263.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__374264 = this;
  return this__374264.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__374265 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__374265.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__374275 = cljs.core.seq.call(null, coll);
  var out__374276 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__374275)))) {
      var G__374277 = cljs.core.rest.call(null, in$__374275);
      var G__374278 = cljs.core.conj.call(null, out__374276, cljs.core.first.call(null, in$__374275));
      in$__374275 = G__374277;
      out__374276 = G__374278;
      continue
    }else {
      return out__374276
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__374279 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____374280 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____374280)) {
        var e__374281 = temp__3695__auto____374280;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__374281))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__374279, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__374274_SHARP_) {
      var temp__3695__auto____374282 = cljs.core.find.call(null, smap, p1__374274_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____374282)) {
        var e__374283 = temp__3695__auto____374282;
        return cljs.core.second.call(null, e__374283)
      }else {
        return p1__374274_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__374291 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__374284, seen) {
        while(true) {
          var vec__374285__374286 = p__374284;
          var f__374287 = cljs.core.nth.call(null, vec__374285__374286, 0, null);
          var xs__374288 = vec__374285__374286;
          var temp__3698__auto____374289 = cljs.core.seq.call(null, xs__374288);
          if(cljs.core.truth_(temp__3698__auto____374289)) {
            var s__374290 = temp__3698__auto____374289;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__374287))) {
              var G__374292 = cljs.core.rest.call(null, s__374290);
              var G__374293 = seen;
              p__374284 = G__374292;
              seen = G__374293;
              continue
            }else {
              return cljs.core.cons.call(null, f__374287, step.call(null, cljs.core.rest.call(null, s__374290), cljs.core.conj.call(null, seen, f__374287)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__374291.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__374294 = cljs.core.PersistentVector.fromArray([]);
  var s__374295 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__374295))) {
      var G__374296 = cljs.core.conj.call(null, ret__374294, cljs.core.first.call(null, s__374295));
      var G__374297 = cljs.core.next.call(null, s__374295);
      ret__374294 = G__374296;
      s__374295 = G__374297;
      continue
    }else {
      return cljs.core.seq.call(null, ret__374294)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____374298 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____374298)) {
        return or__3548__auto____374298
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__374299 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__374299 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__374299 + 1)
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
    var or__3548__auto____374300 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____374300)) {
      return or__3548__auto____374300
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__374301 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__374301 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__374301)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__374304 = cljs.core.ObjMap.fromObject([], {});
  var ks__374305 = cljs.core.seq.call(null, keys);
  var vs__374306 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374307 = ks__374305;
      if(cljs.core.truth_(and__3546__auto____374307)) {
        return vs__374306
      }else {
        return and__3546__auto____374307
      }
    }())) {
      var G__374308 = cljs.core.assoc.call(null, map__374304, cljs.core.first.call(null, ks__374305), cljs.core.first.call(null, vs__374306));
      var G__374309 = cljs.core.next.call(null, ks__374305);
      var G__374310 = cljs.core.next.call(null, vs__374306);
      map__374304 = G__374308;
      ks__374305 = G__374309;
      vs__374306 = G__374310;
      continue
    }else {
      return map__374304
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__374313 = function(k, x) {
    return x
  };
  var max_key__374314 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__374315 = function() {
    var G__374317__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__374302_SHARP_, p2__374303_SHARP_) {
        return max_key.call(null, k, p1__374302_SHARP_, p2__374303_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__374317 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__374317__delegate.call(this, k, x, y, more)
    };
    G__374317.cljs$lang$maxFixedArity = 3;
    G__374317.cljs$lang$applyTo = function(arglist__374318) {
      var k = cljs.core.first(arglist__374318);
      var x = cljs.core.first(cljs.core.next(arglist__374318));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374318)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374318)));
      return G__374317__delegate.call(this, k, x, y, more)
    };
    return G__374317
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__374313.call(this, k, x);
      case 3:
        return max_key__374314.call(this, k, x, y);
      default:
        return max_key__374315.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__374315.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__374319 = function(k, x) {
    return x
  };
  var min_key__374320 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__374321 = function() {
    var G__374323__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__374311_SHARP_, p2__374312_SHARP_) {
        return min_key.call(null, k, p1__374311_SHARP_, p2__374312_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__374323 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__374323__delegate.call(this, k, x, y, more)
    };
    G__374323.cljs$lang$maxFixedArity = 3;
    G__374323.cljs$lang$applyTo = function(arglist__374324) {
      var k = cljs.core.first(arglist__374324);
      var x = cljs.core.first(cljs.core.next(arglist__374324));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374324)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374324)));
      return G__374323__delegate.call(this, k, x, y, more)
    };
    return G__374323
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__374319.call(this, k, x);
      case 3:
        return min_key__374320.call(this, k, x, y);
      default:
        return min_key__374321.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__374321.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__374327 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__374328 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____374325 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____374325)) {
        var s__374326 = temp__3698__auto____374325;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__374326), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__374326)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__374327.call(this, n, step);
      case 3:
        return partition_all__374328.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____374330 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____374330)) {
      var s__374331 = temp__3698__auto____374330;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__374331)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__374331), take_while.call(null, pred, cljs.core.rest.call(null, s__374331)))
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
  var this__374332 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__374333 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__374349 = null;
  var G__374349__374350 = function(rng, f) {
    var this__374334 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__374349__374351 = function(rng, f, s) {
    var this__374335 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__374349 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__374349__374350.call(this, rng, f);
      case 3:
        return G__374349__374351.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374349
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__374336 = this;
  var comp__374337 = cljs.core.truth_(this__374336.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__374337.call(null, this__374336.start, this__374336.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__374338 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__374338.end - this__374338.start) / this__374338.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__374339 = this;
  return this__374339.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__374340 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__374340.meta, this__374340.start + this__374340.step, this__374340.end, this__374340.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__374341 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__374342 = this;
  return new cljs.core.Range(meta, this__374342.start, this__374342.end, this__374342.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__374343 = this;
  return this__374343.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__374353 = null;
  var G__374353__374354 = function(rng, n) {
    var this__374344 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__374344.start + n * this__374344.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____374345 = this__374344.start > this__374344.end;
        if(cljs.core.truth_(and__3546__auto____374345)) {
          return cljs.core._EQ_.call(null, this__374344.step, 0)
        }else {
          return and__3546__auto____374345
        }
      }())) {
        return this__374344.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__374353__374355 = function(rng, n, not_found) {
    var this__374346 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__374346.start + n * this__374346.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____374347 = this__374346.start > this__374346.end;
        if(cljs.core.truth_(and__3546__auto____374347)) {
          return cljs.core._EQ_.call(null, this__374346.step, 0)
        }else {
          return and__3546__auto____374347
        }
      }())) {
        return this__374346.start
      }else {
        return not_found
      }
    }
  };
  G__374353 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__374353__374354.call(this, rng, n);
      case 3:
        return G__374353__374355.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374353
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__374348 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__374348.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__374357 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__374358 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__374359 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__374360 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__374357.call(this);
      case 1:
        return range__374358.call(this, start);
      case 2:
        return range__374359.call(this, start, end);
      case 3:
        return range__374360.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____374362 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____374362)) {
      var s__374363 = temp__3698__auto____374362;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__374363), take_nth.call(null, n, cljs.core.drop.call(null, n, s__374363)))
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
    var temp__3698__auto____374365 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____374365)) {
      var s__374366 = temp__3698__auto____374365;
      var fst__374367 = cljs.core.first.call(null, s__374366);
      var fv__374368 = f.call(null, fst__374367);
      var run__374369 = cljs.core.cons.call(null, fst__374367, cljs.core.take_while.call(null, function(p1__374364_SHARP_) {
        return cljs.core._EQ_.call(null, fv__374368, f.call(null, p1__374364_SHARP_))
      }, cljs.core.next.call(null, s__374366)));
      return cljs.core.cons.call(null, run__374369, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__374369), s__374366))))
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
  var reductions__374384 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____374380 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____374380)) {
        var s__374381 = temp__3695__auto____374380;
        return reductions.call(null, f, cljs.core.first.call(null, s__374381), cljs.core.rest.call(null, s__374381))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__374385 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____374382 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____374382)) {
        var s__374383 = temp__3698__auto____374382;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__374383)), cljs.core.rest.call(null, s__374383))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__374384.call(this, f, init);
      case 3:
        return reductions__374385.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__374388 = function(f) {
    return function() {
      var G__374393 = null;
      var G__374393__374394 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__374393__374395 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__374393__374396 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__374393__374397 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__374393__374398 = function() {
        var G__374400__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__374400 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__374400__delegate.call(this, x, y, z, args)
        };
        G__374400.cljs$lang$maxFixedArity = 3;
        G__374400.cljs$lang$applyTo = function(arglist__374401) {
          var x = cljs.core.first(arglist__374401);
          var y = cljs.core.first(cljs.core.next(arglist__374401));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374401)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374401)));
          return G__374400__delegate.call(this, x, y, z, args)
        };
        return G__374400
      }();
      G__374393 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__374393__374394.call(this);
          case 1:
            return G__374393__374395.call(this, x);
          case 2:
            return G__374393__374396.call(this, x, y);
          case 3:
            return G__374393__374397.call(this, x, y, z);
          default:
            return G__374393__374398.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__374393.cljs$lang$maxFixedArity = 3;
      G__374393.cljs$lang$applyTo = G__374393__374398.cljs$lang$applyTo;
      return G__374393
    }()
  };
  var juxt__374389 = function(f, g) {
    return function() {
      var G__374402 = null;
      var G__374402__374403 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__374402__374404 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__374402__374405 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__374402__374406 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__374402__374407 = function() {
        var G__374409__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__374409 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__374409__delegate.call(this, x, y, z, args)
        };
        G__374409.cljs$lang$maxFixedArity = 3;
        G__374409.cljs$lang$applyTo = function(arglist__374410) {
          var x = cljs.core.first(arglist__374410);
          var y = cljs.core.first(cljs.core.next(arglist__374410));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374410)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374410)));
          return G__374409__delegate.call(this, x, y, z, args)
        };
        return G__374409
      }();
      G__374402 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__374402__374403.call(this);
          case 1:
            return G__374402__374404.call(this, x);
          case 2:
            return G__374402__374405.call(this, x, y);
          case 3:
            return G__374402__374406.call(this, x, y, z);
          default:
            return G__374402__374407.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__374402.cljs$lang$maxFixedArity = 3;
      G__374402.cljs$lang$applyTo = G__374402__374407.cljs$lang$applyTo;
      return G__374402
    }()
  };
  var juxt__374390 = function(f, g, h) {
    return function() {
      var G__374411 = null;
      var G__374411__374412 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__374411__374413 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__374411__374414 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__374411__374415 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__374411__374416 = function() {
        var G__374418__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__374418 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__374418__delegate.call(this, x, y, z, args)
        };
        G__374418.cljs$lang$maxFixedArity = 3;
        G__374418.cljs$lang$applyTo = function(arglist__374419) {
          var x = cljs.core.first(arglist__374419);
          var y = cljs.core.first(cljs.core.next(arglist__374419));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374419)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374419)));
          return G__374418__delegate.call(this, x, y, z, args)
        };
        return G__374418
      }();
      G__374411 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__374411__374412.call(this);
          case 1:
            return G__374411__374413.call(this, x);
          case 2:
            return G__374411__374414.call(this, x, y);
          case 3:
            return G__374411__374415.call(this, x, y, z);
          default:
            return G__374411__374416.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__374411.cljs$lang$maxFixedArity = 3;
      G__374411.cljs$lang$applyTo = G__374411__374416.cljs$lang$applyTo;
      return G__374411
    }()
  };
  var juxt__374391 = function() {
    var G__374420__delegate = function(f, g, h, fs) {
      var fs__374387 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__374421 = null;
        var G__374421__374422 = function() {
          return cljs.core.reduce.call(null, function(p1__374370_SHARP_, p2__374371_SHARP_) {
            return cljs.core.conj.call(null, p1__374370_SHARP_, p2__374371_SHARP_.call(null))
          }, cljs.core.PersistentVector.fromArray([]), fs__374387)
        };
        var G__374421__374423 = function(x) {
          return cljs.core.reduce.call(null, function(p1__374372_SHARP_, p2__374373_SHARP_) {
            return cljs.core.conj.call(null, p1__374372_SHARP_, p2__374373_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.fromArray([]), fs__374387)
        };
        var G__374421__374424 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__374374_SHARP_, p2__374375_SHARP_) {
            return cljs.core.conj.call(null, p1__374374_SHARP_, p2__374375_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.fromArray([]), fs__374387)
        };
        var G__374421__374425 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__374376_SHARP_, p2__374377_SHARP_) {
            return cljs.core.conj.call(null, p1__374376_SHARP_, p2__374377_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.fromArray([]), fs__374387)
        };
        var G__374421__374426 = function() {
          var G__374428__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__374378_SHARP_, p2__374379_SHARP_) {
              return cljs.core.conj.call(null, p1__374378_SHARP_, cljs.core.apply.call(null, p2__374379_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.fromArray([]), fs__374387)
          };
          var G__374428 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__374428__delegate.call(this, x, y, z, args)
          };
          G__374428.cljs$lang$maxFixedArity = 3;
          G__374428.cljs$lang$applyTo = function(arglist__374429) {
            var x = cljs.core.first(arglist__374429);
            var y = cljs.core.first(cljs.core.next(arglist__374429));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374429)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374429)));
            return G__374428__delegate.call(this, x, y, z, args)
          };
          return G__374428
        }();
        G__374421 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__374421__374422.call(this);
            case 1:
              return G__374421__374423.call(this, x);
            case 2:
              return G__374421__374424.call(this, x, y);
            case 3:
              return G__374421__374425.call(this, x, y, z);
            default:
              return G__374421__374426.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__374421.cljs$lang$maxFixedArity = 3;
        G__374421.cljs$lang$applyTo = G__374421__374426.cljs$lang$applyTo;
        return G__374421
      }()
    };
    var G__374420 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__374420__delegate.call(this, f, g, h, fs)
    };
    G__374420.cljs$lang$maxFixedArity = 3;
    G__374420.cljs$lang$applyTo = function(arglist__374430) {
      var f = cljs.core.first(arglist__374430);
      var g = cljs.core.first(cljs.core.next(arglist__374430));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374430)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__374430)));
      return G__374420__delegate.call(this, f, g, h, fs)
    };
    return G__374420
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__374388.call(this, f);
      case 2:
        return juxt__374389.call(this, f, g);
      case 3:
        return juxt__374390.call(this, f, g, h);
      default:
        return juxt__374391.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__374391.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__374432 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__374435 = cljs.core.next.call(null, coll);
        coll = G__374435;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__374433 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____374431 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____374431)) {
          return n > 0
        }else {
          return and__3546__auto____374431
        }
      }())) {
        var G__374436 = n - 1;
        var G__374437 = cljs.core.next.call(null, coll);
        n = G__374436;
        coll = G__374437;
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
        return dorun__374432.call(this, n);
      case 2:
        return dorun__374433.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__374438 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__374439 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__374438.call(this, n);
      case 2:
        return doall__374439.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__374441 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__374441), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__374441), 1))) {
      return cljs.core.first.call(null, matches__374441)
    }else {
      return cljs.core.vec.call(null, matches__374441)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__374442 = re.exec(s);
  if(cljs.core.truth_(matches__374442 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__374442), 1))) {
      return cljs.core.first.call(null, matches__374442)
    }else {
      return cljs.core.vec.call(null, matches__374442)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__374443 = cljs.core.re_find.call(null, re, s);
  var match_idx__374444 = s.search(re);
  var match_str__374445 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__374443)) ? cljs.core.first.call(null, match_data__374443) : match_data__374443;
  var post_match__374446 = cljs.core.subs.call(null, s, match_idx__374444 + cljs.core.count.call(null, match_str__374445));
  if(cljs.core.truth_(match_data__374443)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__374443, re_seq.call(null, re, post_match__374446))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__374448__374449 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___374450 = cljs.core.nth.call(null, vec__374448__374449, 0, null);
  var flags__374451 = cljs.core.nth.call(null, vec__374448__374449, 1, null);
  var pattern__374452 = cljs.core.nth.call(null, vec__374448__374449, 2, null);
  return new RegExp(pattern__374452, flags__374451)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.PersistentVector.fromArray([sep]), cljs.core.map.call(null, function(p1__374447_SHARP_) {
    return print_one.call(null, p1__374447_SHARP_, opts)
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
          var and__3546__auto____374453 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____374453)) {
            var and__3546__auto____374457 = function() {
              var x__451__auto____374454 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____374455 = x__451__auto____374454;
                if(cljs.core.truth_(and__3546__auto____374455)) {
                  var and__3546__auto____374456 = x__451__auto____374454.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____374456)) {
                    return cljs.core.not.call(null, x__451__auto____374454.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____374456
                  }
                }else {
                  return and__3546__auto____374455
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__451__auto____374454)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____374457)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____374457
            }
          }else {
            return and__3546__auto____374453
          }
        }()) ? cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.PersistentVector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__451__auto____374458 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____374459 = x__451__auto____374458;
            if(cljs.core.truth_(and__3546__auto____374459)) {
              var and__3546__auto____374460 = x__451__auto____374458.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____374460)) {
                return cljs.core.not.call(null, x__451__auto____374458.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____374460
              }
            }else {
              return and__3546__auto____374459
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__451__auto____374458)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__374461 = cljs.core.first.call(null, objs);
  var sb__374462 = new goog.string.StringBuffer;
  var G__374463__374464 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__374463__374464)) {
    var obj__374465 = cljs.core.first.call(null, G__374463__374464);
    var G__374463__374466 = G__374463__374464;
    while(true) {
      if(cljs.core.truth_(obj__374465 === first_obj__374461)) {
      }else {
        sb__374462.append(" ")
      }
      var G__374467__374468 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__374465, opts));
      if(cljs.core.truth_(G__374467__374468)) {
        var string__374469 = cljs.core.first.call(null, G__374467__374468);
        var G__374467__374470 = G__374467__374468;
        while(true) {
          sb__374462.append(string__374469);
          var temp__3698__auto____374471 = cljs.core.next.call(null, G__374467__374470);
          if(cljs.core.truth_(temp__3698__auto____374471)) {
            var G__374467__374472 = temp__3698__auto____374471;
            var G__374475 = cljs.core.first.call(null, G__374467__374472);
            var G__374476 = G__374467__374472;
            string__374469 = G__374475;
            G__374467__374470 = G__374476;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____374473 = cljs.core.next.call(null, G__374463__374466);
      if(cljs.core.truth_(temp__3698__auto____374473)) {
        var G__374463__374474 = temp__3698__auto____374473;
        var G__374477 = cljs.core.first.call(null, G__374463__374474);
        var G__374478 = G__374463__374474;
        obj__374465 = G__374477;
        G__374463__374466 = G__374478;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__374462)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__374479 = cljs.core.first.call(null, objs);
  var G__374480__374481 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__374480__374481)) {
    var obj__374482 = cljs.core.first.call(null, G__374480__374481);
    var G__374480__374483 = G__374480__374481;
    while(true) {
      if(cljs.core.truth_(obj__374482 === first_obj__374479)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__374484__374485 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__374482, opts));
      if(cljs.core.truth_(G__374484__374485)) {
        var string__374486 = cljs.core.first.call(null, G__374484__374485);
        var G__374484__374487 = G__374484__374485;
        while(true) {
          cljs.core.string_print.call(null, string__374486);
          var temp__3698__auto____374488 = cljs.core.next.call(null, G__374484__374487);
          if(cljs.core.truth_(temp__3698__auto____374488)) {
            var G__374484__374489 = temp__3698__auto____374488;
            var G__374492 = cljs.core.first.call(null, G__374484__374489);
            var G__374493 = G__374484__374489;
            string__374486 = G__374492;
            G__374484__374487 = G__374493;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____374490 = cljs.core.next.call(null, G__374480__374483);
      if(cljs.core.truth_(temp__3698__auto____374490)) {
        var G__374480__374491 = temp__3698__auto____374490;
        var G__374494 = cljs.core.first.call(null, G__374480__374491);
        var G__374495 = G__374480__374491;
        obj__374482 = G__374494;
        G__374480__374483 = G__374495;
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
  pr_str.cljs$lang$applyTo = function(arglist__374496) {
    var objs = cljs.core.seq(arglist__374496);
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
  pr.cljs$lang$applyTo = function(arglist__374497) {
    var objs = cljs.core.seq(arglist__374497);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__374498) {
    var objs = cljs.core.seq(arglist__374498);
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
  println.cljs$lang$applyTo = function(arglist__374499) {
    var objs = cljs.core.seq(arglist__374499);
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
  prn.cljs$lang$applyTo = function(arglist__374500) {
    var objs = cljs.core.seq(arglist__374500);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__374501 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__374501, "{", ", ", "}", opts, coll)
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
      var temp__3698__auto____374502 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____374502)) {
        var nspc__374503 = temp__3698__auto____374502;
        return cljs.core.str.call(null, nspc__374503, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____374504 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____374504)) {
          var nspc__374505 = temp__3698__auto____374504;
          return cljs.core.str.call(null, nspc__374505, "/")
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
  var pr_pair__374506 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__374506, "{", ", ", "}", opts, coll)
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
  var this__374507 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__374508 = this;
  var G__374509__374510 = cljs.core.seq.call(null, this__374508.watches);
  if(cljs.core.truth_(G__374509__374510)) {
    var G__374512__374514 = cljs.core.first.call(null, G__374509__374510);
    var vec__374513__374515 = G__374512__374514;
    var key__374516 = cljs.core.nth.call(null, vec__374513__374515, 0, null);
    var f__374517 = cljs.core.nth.call(null, vec__374513__374515, 1, null);
    var G__374509__374518 = G__374509__374510;
    var G__374512__374519 = G__374512__374514;
    var G__374509__374520 = G__374509__374518;
    while(true) {
      var vec__374521__374522 = G__374512__374519;
      var key__374523 = cljs.core.nth.call(null, vec__374521__374522, 0, null);
      var f__374524 = cljs.core.nth.call(null, vec__374521__374522, 1, null);
      var G__374509__374525 = G__374509__374520;
      f__374524.call(null, key__374523, this$, oldval, newval);
      var temp__3698__auto____374526 = cljs.core.next.call(null, G__374509__374525);
      if(cljs.core.truth_(temp__3698__auto____374526)) {
        var G__374509__374527 = temp__3698__auto____374526;
        var G__374534 = cljs.core.first.call(null, G__374509__374527);
        var G__374535 = G__374509__374527;
        G__374512__374519 = G__374534;
        G__374509__374520 = G__374535;
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
  var this__374528 = this;
  return this$.watches = cljs.core.assoc.call(null, this__374528.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__374529 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__374529.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__374530 = this;
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__374530.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__374531 = this;
  return this__374531.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__374532 = this;
  return this__374532.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__374533 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__374542 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__374543 = function() {
    var G__374545__delegate = function(x, p__374536) {
      var map__374537__374538 = p__374536;
      var map__374537__374539 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__374537__374538)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__374537__374538) : map__374537__374538;
      var validator__374540 = cljs.core.get.call(null, map__374537__374539, "\ufdd0'validator");
      var meta__374541 = cljs.core.get.call(null, map__374537__374539, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__374541, validator__374540, null)
    };
    var G__374545 = function(x, var_args) {
      var p__374536 = null;
      if(goog.isDef(var_args)) {
        p__374536 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__374545__delegate.call(this, x, p__374536)
    };
    G__374545.cljs$lang$maxFixedArity = 1;
    G__374545.cljs$lang$applyTo = function(arglist__374546) {
      var x = cljs.core.first(arglist__374546);
      var p__374536 = cljs.core.rest(arglist__374546);
      return G__374545__delegate.call(this, x, p__374536)
    };
    return G__374545
  }();
  atom = function(x, var_args) {
    var p__374536 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__374542.call(this, x);
      default:
        return atom__374543.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__374543.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____374547 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____374547)) {
    var validate__374548 = temp__3698__auto____374547;
    if(cljs.core.truth_(validate__374548.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3257)))));
    }
  }else {
  }
  var old_value__374549 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__374549, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___374550 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___374551 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___374552 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___374553 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___374554 = function() {
    var G__374556__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__374556 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__374556__delegate.call(this, a, f, x, y, z, more)
    };
    G__374556.cljs$lang$maxFixedArity = 5;
    G__374556.cljs$lang$applyTo = function(arglist__374557) {
      var a = cljs.core.first(arglist__374557);
      var f = cljs.core.first(cljs.core.next(arglist__374557));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__374557)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__374557))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__374557)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__374557)))));
      return G__374556__delegate.call(this, a, f, x, y, z, more)
    };
    return G__374556
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___374550.call(this, a, f);
      case 3:
        return swap_BANG___374551.call(this, a, f, x);
      case 4:
        return swap_BANG___374552.call(this, a, f, x, y);
      case 5:
        return swap_BANG___374553.call(this, a, f, x, y, z);
      default:
        return swap_BANG___374554.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___374554.cljs$lang$applyTo;
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__374558) {
    var iref = cljs.core.first(arglist__374558);
    var f = cljs.core.first(cljs.core.next(arglist__374558));
    var args = cljs.core.rest(cljs.core.next(arglist__374558));
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
  var gensym__374559 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__374560 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__374559.call(this);
      case 1:
        return gensym__374560.call(this, prefix_string)
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
  var this__374562 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__374562.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__374563 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__374563.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__374563.state, this__374563.f)
  }
  return cljs.core.deref.call(null, this__374563.state)
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
  delay.cljs$lang$applyTo = function(arglist__374564) {
    var body = cljs.core.seq(arglist__374564);
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
    var map__374565__374566 = options;
    var map__374565__374567 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__374565__374566)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__374565__374566) : map__374565__374566;
    var keywordize_keys__374568 = cljs.core.get.call(null, map__374565__374567, "\ufdd0'keywordize-keys");
    var keyfn__374569 = cljs.core.truth_(keywordize_keys__374568) ? cljs.core.keyword : cljs.core.str;
    var f__374575 = function thisfn(x) {
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
                var iter__515__auto____374574 = function iter__374570(s__374571) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__374571__374572 = s__374571;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__374571__374572))) {
                        var k__374573 = cljs.core.first.call(null, s__374571__374572);
                        return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([keyfn__374569.call(null, k__374573), thisfn.call(null, x[k__374573])]), iter__374570.call(null, cljs.core.rest.call(null, s__374571__374572)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__515__auto____374574.call(null, cljs.core.js_keys.call(null, x))
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
    return f__374575.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__374576) {
    var x = cljs.core.first(arglist__374576);
    var options = cljs.core.rest(arglist__374576);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__374577 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__374581__delegate = function(args) {
      var temp__3695__auto____374578 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__374577), args);
      if(cljs.core.truth_(temp__3695__auto____374578)) {
        var v__374579 = temp__3695__auto____374578;
        return v__374579
      }else {
        var ret__374580 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__374577, cljs.core.assoc, args, ret__374580);
        return ret__374580
      }
    };
    var G__374581 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__374581__delegate.call(this, args)
    };
    G__374581.cljs$lang$maxFixedArity = 0;
    G__374581.cljs$lang$applyTo = function(arglist__374582) {
      var args = cljs.core.seq(arglist__374582);
      return G__374581__delegate.call(this, args)
    };
    return G__374581
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__374584 = function(f) {
    while(true) {
      var ret__374583 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__374583))) {
        var G__374587 = ret__374583;
        f = G__374587;
        continue
      }else {
        return ret__374583
      }
      break
    }
  };
  var trampoline__374585 = function() {
    var G__374588__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__374588 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__374588__delegate.call(this, f, args)
    };
    G__374588.cljs$lang$maxFixedArity = 1;
    G__374588.cljs$lang$applyTo = function(arglist__374589) {
      var f = cljs.core.first(arglist__374589);
      var args = cljs.core.rest(arglist__374589);
      return G__374588__delegate.call(this, f, args)
    };
    return G__374588
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__374584.call(this, f);
      default:
        return trampoline__374585.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__374585.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__374590 = function() {
    return rand.call(null, 1)
  };
  var rand__374591 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__374590.call(this);
      case 1:
        return rand__374591.call(this, n)
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
    var k__374593 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__374593, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__374593, cljs.core.PersistentVector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___374602 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___374603 = function(h, child, parent) {
    var or__3548__auto____374594 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____374594)) {
      return or__3548__auto____374594
    }else {
      var or__3548__auto____374595 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____374595)) {
        return or__3548__auto____374595
      }else {
        var and__3546__auto____374596 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____374596)) {
          var and__3546__auto____374597 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____374597)) {
            var and__3546__auto____374598 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____374598)) {
              var ret__374599 = true;
              var i__374600 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____374601 = cljs.core.not.call(null, ret__374599);
                  if(cljs.core.truth_(or__3548__auto____374601)) {
                    return or__3548__auto____374601
                  }else {
                    return cljs.core._EQ_.call(null, i__374600, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__374599
                }else {
                  var G__374605 = isa_QMARK_.call(null, h, child.call(null, i__374600), parent.call(null, i__374600));
                  var G__374606 = i__374600 + 1;
                  ret__374599 = G__374605;
                  i__374600 = G__374606;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____374598
            }
          }else {
            return and__3546__auto____374597
          }
        }else {
          return and__3546__auto____374596
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___374602.call(this, h, child);
      case 3:
        return isa_QMARK___374603.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__374607 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__374608 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__374607.call(this, h);
      case 2:
        return parents__374608.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__374610 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__374611 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__374610.call(this, h);
      case 2:
        return ancestors__374611.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__374613 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__374614 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__374613.call(this, h);
      case 2:
        return descendants__374614.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__374624 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3549)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__374625 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3553)))));
    }
    var tp__374619 = "\ufdd0'parents".call(null, h);
    var td__374620 = "\ufdd0'descendants".call(null, h);
    var ta__374621 = "\ufdd0'ancestors".call(null, h);
    var tf__374622 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____374623 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__374619.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__374621.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__374621.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__374619, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__374622.call(null, "\ufdd0'ancestors".call(null, h), tag, td__374620, parent, ta__374621), "\ufdd0'descendants":tf__374622.call(null, "\ufdd0'descendants".call(null, h), parent, ta__374621, tag, td__374620)})
    }();
    if(cljs.core.truth_(or__3548__auto____374623)) {
      return or__3548__auto____374623
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__374624.call(this, h, tag);
      case 3:
        return derive__374625.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__374631 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__374632 = function(h, tag, parent) {
    var parentMap__374627 = "\ufdd0'parents".call(null, h);
    var childsParents__374628 = cljs.core.truth_(parentMap__374627.call(null, tag)) ? cljs.core.disj.call(null, parentMap__374627.call(null, tag), parent) : cljs.core.set([]);
    var newParents__374629 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__374628)) ? cljs.core.assoc.call(null, parentMap__374627, tag, childsParents__374628) : cljs.core.dissoc.call(null, parentMap__374627, tag);
    var deriv_seq__374630 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__374616_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__374616_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__374616_SHARP_), cljs.core.second.call(null, p1__374616_SHARP_)))
    }, cljs.core.seq.call(null, newParents__374629)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__374627.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__374617_SHARP_, p2__374618_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__374617_SHARP_, p2__374618_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__374630))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__374631.call(this, h, tag);
      case 3:
        return underive__374632.call(this, h, tag, parent)
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
  var xprefs__374634 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____374636 = cljs.core.truth_(function() {
    var and__3546__auto____374635 = xprefs__374634;
    if(cljs.core.truth_(and__3546__auto____374635)) {
      return xprefs__374634.call(null, y)
    }else {
      return and__3546__auto____374635
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____374636)) {
    return or__3548__auto____374636
  }else {
    var or__3548__auto____374638 = function() {
      var ps__374637 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__374637) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__374637), prefer_table))) {
          }else {
          }
          var G__374641 = cljs.core.rest.call(null, ps__374637);
          ps__374637 = G__374641;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____374638)) {
      return or__3548__auto____374638
    }else {
      var or__3548__auto____374640 = function() {
        var ps__374639 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__374639) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__374639), y, prefer_table))) {
            }else {
            }
            var G__374642 = cljs.core.rest.call(null, ps__374639);
            ps__374639 = G__374642;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____374640)) {
        return or__3548__auto____374640
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____374643 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____374643)) {
    return or__3548__auto____374643
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__374652 = cljs.core.reduce.call(null, function(be, p__374644) {
    var vec__374645__374646 = p__374644;
    var k__374647 = cljs.core.nth.call(null, vec__374645__374646, 0, null);
    var ___374648 = cljs.core.nth.call(null, vec__374645__374646, 1, null);
    var e__374649 = vec__374645__374646;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__374647))) {
      var be2__374651 = cljs.core.truth_(function() {
        var or__3548__auto____374650 = be === null;
        if(cljs.core.truth_(or__3548__auto____374650)) {
          return or__3548__auto____374650
        }else {
          return cljs.core.dominates.call(null, k__374647, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__374649 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__374651), k__374647, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__374647, " and ", cljs.core.first.call(null, be2__374651), ", and neither is preferred"));
      }
      return be2__374651
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__374652)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__374652));
      return cljs.core.second.call(null, best_entry__374652)
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
    var and__3546__auto____374653 = mf;
    if(cljs.core.truth_(and__3546__auto____374653)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____374653
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____374654 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374654)) {
        return or__3548__auto____374654
      }else {
        var or__3548__auto____374655 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____374655)) {
          return or__3548__auto____374655
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374656 = mf;
    if(cljs.core.truth_(and__3546__auto____374656)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____374656
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____374657 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374657)) {
        return or__3548__auto____374657
      }else {
        var or__3548__auto____374658 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____374658)) {
          return or__3548__auto____374658
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374659 = mf;
    if(cljs.core.truth_(and__3546__auto____374659)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____374659
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____374660 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374660)) {
        return or__3548__auto____374660
      }else {
        var or__3548__auto____374661 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____374661)) {
          return or__3548__auto____374661
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374662 = mf;
    if(cljs.core.truth_(and__3546__auto____374662)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____374662
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____374663 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374663)) {
        return or__3548__auto____374663
      }else {
        var or__3548__auto____374664 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____374664)) {
          return or__3548__auto____374664
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374665 = mf;
    if(cljs.core.truth_(and__3546__auto____374665)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____374665
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____374666 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374666)) {
        return or__3548__auto____374666
      }else {
        var or__3548__auto____374667 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____374667)) {
          return or__3548__auto____374667
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374668 = mf;
    if(cljs.core.truth_(and__3546__auto____374668)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____374668
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____374669 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374669)) {
        return or__3548__auto____374669
      }else {
        var or__3548__auto____374670 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____374670)) {
          return or__3548__auto____374670
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374671 = mf;
    if(cljs.core.truth_(and__3546__auto____374671)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____374671
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____374672 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374672)) {
        return or__3548__auto____374672
      }else {
        var or__3548__auto____374673 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____374673)) {
          return or__3548__auto____374673
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374674 = mf;
    if(cljs.core.truth_(and__3546__auto____374674)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____374674
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____374675 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____374675)) {
        return or__3548__auto____374675
      }else {
        var or__3548__auto____374676 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____374676)) {
          return or__3548__auto____374676
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__374677 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__374678 = cljs.core._get_method.call(null, mf, dispatch_val__374677);
  if(cljs.core.truth_(target_fn__374678)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__374677));
  }
  return cljs.core.apply.call(null, target_fn__374678, args)
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
  var this__374679 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__374680 = this;
  cljs.core.swap_BANG_.call(null, this__374680.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__374680.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__374680.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__374680.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__374681 = this;
  cljs.core.swap_BANG_.call(null, this__374681.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__374681.method_cache, this__374681.method_table, this__374681.cached_hierarchy, this__374681.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__374682 = this;
  cljs.core.swap_BANG_.call(null, this__374682.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__374682.method_cache, this__374682.method_table, this__374682.cached_hierarchy, this__374682.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__374683 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__374683.cached_hierarchy), cljs.core.deref.call(null, this__374683.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__374683.method_cache, this__374683.method_table, this__374683.cached_hierarchy, this__374683.hierarchy)
  }
  var temp__3695__auto____374684 = cljs.core.deref.call(null, this__374683.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____374684)) {
    var target_fn__374685 = temp__3695__auto____374684;
    return target_fn__374685
  }else {
    var temp__3695__auto____374686 = cljs.core.find_and_cache_best_method.call(null, this__374683.name, dispatch_val, this__374683.hierarchy, this__374683.method_table, this__374683.prefer_table, this__374683.method_cache, this__374683.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____374686)) {
      var target_fn__374687 = temp__3695__auto____374686;
      return target_fn__374687
    }else {
      return cljs.core.deref.call(null, this__374683.method_table).call(null, this__374683.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__374688 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__374688.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__374688.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__374688.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__374688.method_cache, this__374688.method_table, this__374688.cached_hierarchy, this__374688.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__374689 = this;
  return cljs.core.deref.call(null, this__374689.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__374690 = this;
  return cljs.core.deref.call(null, this__374690.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__374691 = this;
  return cljs.core.do_dispatch.call(null, mf, this__374691.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__374692__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__374692 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__374692__delegate.call(this, _, args)
  };
  G__374692.cljs$lang$maxFixedArity = 1;
  G__374692.cljs$lang$applyTo = function(arglist__374693) {
    var _ = cljs.core.first(arglist__374693);
    var args = cljs.core.rest(arglist__374693);
    return G__374692__delegate.call(this, _, args)
  };
  return G__374692
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
  var join__374694 = function(coll) {
    return cljs.core.apply.call(null, cljs.core.str, coll)
  };
  var join__374695 = function(separator, coll) {
    return cljs.core.apply.call(null, cljs.core.str, cljs.core.interpose.call(null, separator, coll))
  };
  join = function(separator, coll) {
    switch(arguments.length) {
      case 1:
        return join__374694.call(this, separator);
      case 2:
        return join__374695.call(this, separator, coll)
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
  var split__374703 = function(s, re) {
    return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
  };
  var split__374704 = function(s, re, limit) {
    if(cljs.core.truth_(limit < 1)) {
      return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
    }else {
      var s__374697 = s;
      var limit__374698 = limit;
      var parts__374699 = cljs.core.PersistentVector.fromArray([]);
      while(true) {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, limit__374698, 1))) {
          return cljs.core.conj.call(null, parts__374699, s__374697)
        }else {
          var temp__3695__auto____374700 = cljs.core.re_find.call(null, re, s__374697);
          if(cljs.core.truth_(temp__3695__auto____374700)) {
            var m__374701 = temp__3695__auto____374700;
            var index__374702 = s__374697.indexOf(m__374701);
            var G__374706 = s__374697.substring(index__374702 + cljs.core.count.call(null, m__374701));
            var G__374707 = limit__374698 - 1;
            var G__374708 = cljs.core.conj.call(null, parts__374699, s__374697.substring(0, index__374702));
            s__374697 = G__374706;
            limit__374698 = G__374707;
            parts__374699 = G__374708;
            continue
          }else {
            return cljs.core.conj.call(null, parts__374699, s__374697)
          }
        }
        break
      }
    }
  };
  split = function(s, re, limit) {
    switch(arguments.length) {
      case 2:
        return split__374703.call(this, s, re);
      case 3:
        return split__374704.call(this, s, re, limit)
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
  var index__374709 = s.length;
  while(true) {
    if(cljs.core.truth_(index__374709 === 0)) {
      return""
    }else {
      var ch__374710 = cljs.core.get.call(null, s, index__374709 - 1);
      if(cljs.core.truth_(function() {
        var or__3548__auto____374711 = cljs.core._EQ_.call(null, ch__374710, "\n");
        if(cljs.core.truth_(or__3548__auto____374711)) {
          return or__3548__auto____374711
        }else {
          return cljs.core._EQ_.call(null, ch__374710, "\r")
        }
      }())) {
        var G__374712 = index__374709 - 1;
        index__374709 = G__374712;
        continue
      }else {
        return s.substring(0, index__374709)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__374713 = cljs.core.str.call(null, s);
  if(cljs.core.truth_(function() {
    var or__3548__auto____374714 = cljs.core.not.call(null, s__374713);
    if(cljs.core.truth_(or__3548__auto____374714)) {
      return or__3548__auto____374714
    }else {
      var or__3548__auto____374715 = cljs.core._EQ_.call(null, "", s__374713);
      if(cljs.core.truth_(or__3548__auto____374715)) {
        return or__3548__auto____374715
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__374713)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__374716 = new goog.string.StringBuffer;
  var length__374717 = s.length;
  var index__374718 = 0;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, length__374717, index__374718))) {
      return buffer__374716.toString()
    }else {
      var ch__374719 = s.charAt(index__374718);
      var temp__3695__auto____374720 = cljs.core.get.call(null, cmap, ch__374719);
      if(cljs.core.truth_(temp__3695__auto____374720)) {
        var replacement__374721 = temp__3695__auto____374720;
        buffer__374716.append(cljs.core.str.call(null, replacement__374721))
      }else {
        buffer__374716.append(ch__374719)
      }
      var G__374722 = index__374718 + 1;
      index__374718 = G__374722;
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
  var dom_attr__374987 = function(elem, attrs) {
    if(cljs.core.truth_(elem)) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.map_QMARK_.call(null, attrs)))) {
        return elem.getAttribute(cljs.core.name.call(null, attrs))
      }else {
        var G__374968__374969 = cljs.core.seq.call(null, attrs);
        if(cljs.core.truth_(G__374968__374969)) {
          var G__374971__374973 = cljs.core.first.call(null, G__374968__374969);
          var vec__374972__374974 = G__374971__374973;
          var k__374975 = cljs.core.nth.call(null, vec__374972__374974, 0, null);
          var v__374976 = cljs.core.nth.call(null, vec__374972__374974, 1, null);
          var G__374968__374977 = G__374968__374969;
          var G__374971__374978 = G__374971__374973;
          var G__374968__374979 = G__374968__374977;
          while(true) {
            var vec__374980__374981 = G__374971__374978;
            var k__374982 = cljs.core.nth.call(null, vec__374980__374981, 0, null);
            var v__374983 = cljs.core.nth.call(null, vec__374980__374981, 1, null);
            var G__374968__374984 = G__374968__374979;
            dom_attr.call(null, elem, k__374982, v__374983);
            var temp__3698__auto____374985 = cljs.core.next.call(null, G__374968__374984);
            if(cljs.core.truth_(temp__3698__auto____374985)) {
              var G__374968__374986 = temp__3698__auto____374985;
              var G__374990 = cljs.core.first.call(null, G__374968__374986);
              var G__374991 = G__374968__374986;
              G__374971__374978 = G__374990;
              G__374968__374979 = G__374991;
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
  var dom_attr__374988 = function(elem, k, v) {
    elem.setAttribute(cljs.core.name.call(null, k), v);
    return elem
  };
  dom_attr = function(elem, k, v) {
    switch(arguments.length) {
      case 2:
        return dom_attr__374987.call(this, elem, k);
      case 3:
        return dom_attr__374988.call(this, elem, k, v)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dom_attr
}();
crate.core.as_content = function as_content(parent, content) {
  var G__374992__374993 = cljs.core.seq.call(null, content);
  if(cljs.core.truth_(G__374992__374993)) {
    var c__374994 = cljs.core.first.call(null, G__374992__374993);
    var G__374992__374995 = G__374992__374993;
    while(true) {
      var child__374996 = cljs.core.truth_(c__374994 === null) ? null : cljs.core.truth_(cljs.core.map_QMARK_.call(null, c__374994)) ? function() {
        throw"Maps cannot be used as content";
      }() : cljs.core.truth_(cljs.core.string_QMARK_.call(null, c__374994)) ? goog.dom.createTextNode.call(null, c__374994) : cljs.core.truth_(cljs.core.vector_QMARK_.call(null, c__374994)) ? crate.core.elem_factory.call(null, c__374994) : cljs.core.truth_(cljs.core.seq_QMARK_.call(null, c__374994)) ? as_content.call(null, parent, c__374994) : cljs.core.truth_(c__374994.nodeName) ? c__374994 : null;
      if(cljs.core.truth_(child__374996)) {
        goog.dom.appendChild.call(null, parent, child__374996)
      }else {
      }
      var temp__3698__auto____374997 = cljs.core.next.call(null, G__374992__374995);
      if(cljs.core.truth_(temp__3698__auto____374997)) {
        var G__374992__374998 = temp__3698__auto____374997;
        var G__374999 = cljs.core.first.call(null, G__374992__374998);
        var G__375000 = G__374992__374998;
        c__374994 = G__374999;
        G__374992__374995 = G__375000;
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
crate.core.normalize_element = function normalize_element(p__375002) {
  var vec__375003__375004 = p__375002;
  var tag__375005 = cljs.core.nth.call(null, vec__375003__375004, 0, null);
  var content__375006 = cljs.core.nthnext.call(null, vec__375003__375004, 1);
  if(cljs.core.truth_(cljs.core.not.call(null, function() {
    var or__3548__auto____375007 = cljs.core.keyword_QMARK_.call(null, tag__375005);
    if(cljs.core.truth_(or__3548__auto____375007)) {
      return or__3548__auto____375007
    }else {
      var or__3548__auto____375008 = cljs.core.symbol_QMARK_.call(null, tag__375005);
      if(cljs.core.truth_(or__3548__auto____375008)) {
        return or__3548__auto____375008
      }else {
        return cljs.core.string_QMARK_.call(null, tag__375005)
      }
    }
  }()))) {
    throw cljs.core.str.call(null, tag__375005, " is not a valid tag name.");
  }else {
  }
  var vec__375009__375011 = cljs.core.re_matches.call(null, crate.core.re_tag, cljs.core.name.call(null, tag__375005));
  var ___375012 = cljs.core.nth.call(null, vec__375009__375011, 0, null);
  var tag__375013 = cljs.core.nth.call(null, vec__375009__375011, 1, null);
  var id__375014 = cljs.core.nth.call(null, vec__375009__375011, 2, null);
  var class$__375015 = cljs.core.nth.call(null, vec__375009__375011, 3, null);
  var vec__375010__375022 = function() {
    var vec__375016__375017 = clojure.string.split.call(null, tag__375013, /:/);
    var nsp__375018 = cljs.core.nth.call(null, vec__375016__375017, 0, null);
    var t__375019 = cljs.core.nth.call(null, vec__375016__375017, 1, null);
    var ns_xmlns__375020 = crate.core.xmlns.call(null, cljs.core.keyword.call(null, nsp__375018));
    if(cljs.core.truth_(t__375019)) {
      return cljs.core.PersistentVector.fromArray([function() {
        var or__3548__auto____375021 = ns_xmlns__375020;
        if(cljs.core.truth_(or__3548__auto____375021)) {
          return or__3548__auto____375021
        }else {
          return nsp__375018
        }
      }(), t__375019])
    }else {
      return cljs.core.PersistentVector.fromArray(["\ufdd0'xhtml".call(null, crate.core.xmlns), nsp__375018])
    }
  }();
  var nsp__375023 = cljs.core.nth.call(null, vec__375010__375022, 0, null);
  var tag__375024 = cljs.core.nth.call(null, vec__375010__375022, 1, null);
  var tag_attrs__375026 = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.filter.call(null, function(p1__375001_SHARP_) {
    return cljs.core.not.call(null, cljs.core.second.call(null, p1__375001_SHARP_) === null)
  }, cljs.core.ObjMap.fromObject(["\ufdd0'id", "\ufdd0'class"], {"\ufdd0'id":function() {
    var or__3548__auto____375025 = id__375014;
    if(cljs.core.truth_(or__3548__auto____375025)) {
      return or__3548__auto____375025
    }else {
      return null
    }
  }(), "\ufdd0'class":cljs.core.truth_(class$__375015) ? clojure.string.replace.call(null, class$__375015, /\./, " ") : null})));
  var map_attrs__375027 = cljs.core.first.call(null, content__375006);
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, map_attrs__375027))) {
    return cljs.core.PersistentVector.fromArray([nsp__375023, tag__375024, cljs.core.merge.call(null, tag_attrs__375026, map_attrs__375027), cljs.core.next.call(null, content__375006)])
  }else {
    return cljs.core.PersistentVector.fromArray([nsp__375023, tag__375024, tag_attrs__375026, content__375006])
  }
};
crate.core.parse_content = function parse_content(elem, content) {
  var attrs__375028 = cljs.core.first.call(null, content);
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, attrs__375028))) {
    crate.core.dom_attr.call(null, elem, attrs__375028);
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
  var vec__375029__375030 = crate.core.normalize_element.call(null, tag_def);
  var nsp__375031 = cljs.core.nth.call(null, vec__375029__375030, 0, null);
  var tag__375032 = cljs.core.nth.call(null, vec__375029__375030, 1, null);
  var attrs__375033 = cljs.core.nth.call(null, vec__375029__375030, 2, null);
  var content__375034 = cljs.core.nth.call(null, vec__375029__375030, 3, null);
  var elem__375035 = crate.core.create_elem.call(null, nsp__375031, tag__375032);
  crate.core.dom_attr.call(null, elem__375035, attrs__375033);
  crate.core.as_content.call(null, elem__375035, content__375034);
  return elem__375035
};
crate.core.html = function() {
  var html__delegate = function(tags) {
    var res__375036 = cljs.core.map.call(null, crate.core.elem_factory, tags);
    if(cljs.core.truth_(cljs.core.second.call(null, res__375036))) {
      return res__375036
    }else {
      return cljs.core.first.call(null, res__375036)
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
  html.cljs$lang$applyTo = function(arglist__375037) {
    var tags = cljs.core.seq(arglist__375037);
    return html__delegate.call(this, tags)
  };
  return html
}();
goog.provide("jayq.util");
goog.require("cljs.core");
jayq.util.map__GT_js = function map__GT_js(m) {
  var out__375141 = cljs.core.js_obj.call(null);
  var G__375142__375143 = cljs.core.seq.call(null, m);
  if(cljs.core.truth_(G__375142__375143)) {
    var G__375145__375147 = cljs.core.first.call(null, G__375142__375143);
    var vec__375146__375148 = G__375145__375147;
    var k__375149 = cljs.core.nth.call(null, vec__375146__375148, 0, null);
    var v__375150 = cljs.core.nth.call(null, vec__375146__375148, 1, null);
    var G__375142__375151 = G__375142__375143;
    var G__375145__375152 = G__375145__375147;
    var G__375142__375153 = G__375142__375151;
    while(true) {
      var vec__375154__375155 = G__375145__375152;
      var k__375156 = cljs.core.nth.call(null, vec__375154__375155, 0, null);
      var v__375157 = cljs.core.nth.call(null, vec__375154__375155, 1, null);
      var G__375142__375158 = G__375142__375153;
      out__375141[cljs.core.name.call(null, k__375156)] = v__375157;
      var temp__3698__auto____375159 = cljs.core.next.call(null, G__375142__375158);
      if(cljs.core.truth_(temp__3698__auto____375159)) {
        var G__375142__375160 = temp__3698__auto____375159;
        var G__375161 = cljs.core.first.call(null, G__375142__375160);
        var G__375162 = G__375142__375160;
        G__375145__375152 = G__375161;
        G__375142__375153 = G__375162;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return out__375141
};
jayq.util.wait = function wait(ms, func) {
  return setTimeout(func, ms)
};
jayq.util.log = function() {
  var log__delegate = function(v, text) {
    var vs__375163 = cljs.core.truth_(cljs.core.string_QMARK_.call(null, v)) ? cljs.core.apply.call(null, cljs.core.str, v, text) : v;
    return console.log(vs__375163)
  };
  var log = function(v, var_args) {
    var text = null;
    if(goog.isDef(var_args)) {
      text = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return log__delegate.call(this, v, text)
  };
  log.cljs$lang$maxFixedArity = 1;
  log.cljs$lang$applyTo = function(arglist__375164) {
    var v = cljs.core.first(arglist__375164);
    var text = cljs.core.rest(arglist__375164);
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
        return cljs.core.reduce.call(null, function(m, p__375165) {
          var vec__375166__375167 = p__375165;
          var k__375168 = cljs.core.nth.call(null, vec__375166__375167, 0, null);
          var v__375169 = cljs.core.nth.call(null, vec__375166__375167, 1, null);
          return cljs.core.assoc.call(null, m, clj__GT_js.call(null, k__375168), clj__GT_js.call(null, v__375169))
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
      var temp__3695__auto____375038 = jayq.core.crate_meta.call(null, sel);
      if(cljs.core.truth_(temp__3695__auto____375038)) {
        var cm__375039 = temp__3695__auto____375038;
        return cljs.core.str.call(null, "[crateGroup=", cm__375039, "]")
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
  var $__delegate = function(sel, p__375040) {
    var vec__375041__375042 = p__375040;
    var context__375043 = cljs.core.nth.call(null, vec__375041__375042, 0, null);
    if(cljs.core.truth_(cljs.core.not.call(null, context__375043))) {
      return jQuery.call(null, jayq.core.__GT_selector.call(null, sel))
    }else {
      return jQuery.call(null, jayq.core.__GT_selector.call(null, sel), context__375043)
    }
  };
  var $ = function(sel, var_args) {
    var p__375040 = null;
    if(goog.isDef(var_args)) {
      p__375040 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return $__delegate.call(this, sel, p__375040)
  };
  $.cljs$lang$maxFixedArity = 1;
  $.cljs$lang$applyTo = function(arglist__375044) {
    var sel = cljs.core.first(arglist__375044);
    var p__375040 = cljs.core.rest(arglist__375044);
    return $__delegate.call(this, sel, p__375040)
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
  var G__375046 = null;
  var G__375046__375047 = function(this$, k) {
    var or__3548__auto____375045 = this$.slice(k, k + 1);
    if(cljs.core.truth_(or__3548__auto____375045)) {
      return or__3548__auto____375045
    }else {
      return null
    }
  };
  var G__375046__375048 = function(this$, k, not_found) {
    return cljs.core._nth.call(null, this$, k, not_found)
  };
  G__375046 = function(this$, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__375046__375047.call(this, this$, k);
      case 3:
        return G__375046__375048.call(this, this$, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__375046
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
  var G__375050 = null;
  var G__375050__375051 = function(_, k) {
    return cljs.core._lookup.call(null, this, k)
  };
  var G__375050__375052 = function(_, k, not_found) {
    return cljs.core._lookup.call(null, this, k, not_found)
  };
  G__375050 = function(_, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__375050__375051.call(this, _, k);
      case 3:
        return G__375050__375052.call(this, _, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__375050
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
  var attr__delegate = function($elem, a, p__375054) {
    var vec__375055__375056 = p__375054;
    var v__375057 = cljs.core.nth.call(null, vec__375055__375056, 0, null);
    var a__375058 = cljs.core.name.call(null, a);
    if(cljs.core.truth_(cljs.core.not.call(null, v__375057))) {
      return $elem.attr(a__375058)
    }else {
      return $elem.attr(a__375058, v__375057)
    }
  };
  var attr = function($elem, a, var_args) {
    var p__375054 = null;
    if(goog.isDef(var_args)) {
      p__375054 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return attr__delegate.call(this, $elem, a, p__375054)
  };
  attr.cljs$lang$maxFixedArity = 2;
  attr.cljs$lang$applyTo = function(arglist__375059) {
    var $elem = cljs.core.first(arglist__375059);
    var a = cljs.core.first(cljs.core.next(arglist__375059));
    var p__375054 = cljs.core.rest(cljs.core.next(arglist__375059));
    return attr__delegate.call(this, $elem, a, p__375054)
  };
  return attr
}();
jayq.core.data = function() {
  var data__delegate = function($elem, k, p__375060) {
    var vec__375061__375062 = p__375060;
    var v__375063 = cljs.core.nth.call(null, vec__375061__375062, 0, null);
    var k__375064 = cljs.core.name.call(null, k);
    if(cljs.core.truth_(cljs.core.not.call(null, v__375063))) {
      return $elem.data(k__375064)
    }else {
      return $elem.data(k__375064, v__375063)
    }
  };
  var data = function($elem, k, var_args) {
    var p__375060 = null;
    if(goog.isDef(var_args)) {
      p__375060 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return data__delegate.call(this, $elem, k, p__375060)
  };
  data.cljs$lang$maxFixedArity = 2;
  data.cljs$lang$applyTo = function(arglist__375065) {
    var $elem = cljs.core.first(arglist__375065);
    var k = cljs.core.first(cljs.core.next(arglist__375065));
    var p__375060 = cljs.core.rest(cljs.core.next(arglist__375065));
    return data__delegate.call(this, $elem, k, p__375060)
  };
  return data
}();
jayq.core.position = function position($elem) {
  return cljs.core.js__GT_clj.call(null, $elem.position(), "\ufdd0'keywordize-keys", true)
};
jayq.core.add_class = function add_class($elem, cl) {
  var cl__375066 = cljs.core.name.call(null, cl);
  return $elem.addClass(cl__375066)
};
jayq.core.remove_class = function remove_class($elem, cl) {
  var cl__375067 = cljs.core.name.call(null, cl);
  return $elem.removeClass(cl__375067)
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
  var hide__delegate = function($elem, p__375068) {
    var vec__375069__375070 = p__375068;
    var speed__375071 = cljs.core.nth.call(null, vec__375069__375070, 0, null);
    var on_finish__375072 = cljs.core.nth.call(null, vec__375069__375070, 1, null);
    return $elem.hide(speed__375071, on_finish__375072)
  };
  var hide = function($elem, var_args) {
    var p__375068 = null;
    if(goog.isDef(var_args)) {
      p__375068 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return hide__delegate.call(this, $elem, p__375068)
  };
  hide.cljs$lang$maxFixedArity = 1;
  hide.cljs$lang$applyTo = function(arglist__375073) {
    var $elem = cljs.core.first(arglist__375073);
    var p__375068 = cljs.core.rest(arglist__375073);
    return hide__delegate.call(this, $elem, p__375068)
  };
  return hide
}();
jayq.core.show = function() {
  var show__delegate = function($elem, p__375074) {
    var vec__375075__375076 = p__375074;
    var speed__375077 = cljs.core.nth.call(null, vec__375075__375076, 0, null);
    var on_finish__375078 = cljs.core.nth.call(null, vec__375075__375076, 1, null);
    return $elem.show(speed__375077, on_finish__375078)
  };
  var show = function($elem, var_args) {
    var p__375074 = null;
    if(goog.isDef(var_args)) {
      p__375074 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return show__delegate.call(this, $elem, p__375074)
  };
  show.cljs$lang$maxFixedArity = 1;
  show.cljs$lang$applyTo = function(arglist__375079) {
    var $elem = cljs.core.first(arglist__375079);
    var p__375074 = cljs.core.rest(arglist__375079);
    return show__delegate.call(this, $elem, p__375074)
  };
  return show
}();
jayq.core.toggle = function() {
  var toggle__delegate = function($elem, p__375080) {
    var vec__375081__375082 = p__375080;
    var speed__375083 = cljs.core.nth.call(null, vec__375081__375082, 0, null);
    var on_finish__375084 = cljs.core.nth.call(null, vec__375081__375082, 1, null);
    return $elem.toggle(speed__375083, on_finish__375084)
  };
  var toggle = function($elem, var_args) {
    var p__375080 = null;
    if(goog.isDef(var_args)) {
      p__375080 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return toggle__delegate.call(this, $elem, p__375080)
  };
  toggle.cljs$lang$maxFixedArity = 1;
  toggle.cljs$lang$applyTo = function(arglist__375085) {
    var $elem = cljs.core.first(arglist__375085);
    var p__375080 = cljs.core.rest(arglist__375085);
    return toggle__delegate.call(this, $elem, p__375080)
  };
  return toggle
}();
jayq.core.fade_out = function() {
  var fade_out__delegate = function($elem, p__375086) {
    var vec__375087__375088 = p__375086;
    var speed__375089 = cljs.core.nth.call(null, vec__375087__375088, 0, null);
    var on_finish__375090 = cljs.core.nth.call(null, vec__375087__375088, 1, null);
    return $elem.fadeOut(speed__375089, on_finish__375090)
  };
  var fade_out = function($elem, var_args) {
    var p__375086 = null;
    if(goog.isDef(var_args)) {
      p__375086 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return fade_out__delegate.call(this, $elem, p__375086)
  };
  fade_out.cljs$lang$maxFixedArity = 1;
  fade_out.cljs$lang$applyTo = function(arglist__375091) {
    var $elem = cljs.core.first(arglist__375091);
    var p__375086 = cljs.core.rest(arglist__375091);
    return fade_out__delegate.call(this, $elem, p__375086)
  };
  return fade_out
}();
jayq.core.fade_in = function() {
  var fade_in__delegate = function($elem, p__375092) {
    var vec__375093__375094 = p__375092;
    var speed__375095 = cljs.core.nth.call(null, vec__375093__375094, 0, null);
    var on_finish__375096 = cljs.core.nth.call(null, vec__375093__375094, 1, null);
    return $elem.fadeIn(speed__375095, on_finish__375096)
  };
  var fade_in = function($elem, var_args) {
    var p__375092 = null;
    if(goog.isDef(var_args)) {
      p__375092 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return fade_in__delegate.call(this, $elem, p__375092)
  };
  fade_in.cljs$lang$maxFixedArity = 1;
  fade_in.cljs$lang$applyTo = function(arglist__375097) {
    var $elem = cljs.core.first(arglist__375097);
    var p__375092 = cljs.core.rest(arglist__375097);
    return fade_in__delegate.call(this, $elem, p__375092)
  };
  return fade_in
}();
jayq.core.slide_up = function() {
  var slide_up__delegate = function($elem, p__375098) {
    var vec__375099__375100 = p__375098;
    var speed__375101 = cljs.core.nth.call(null, vec__375099__375100, 0, null);
    var on_finish__375102 = cljs.core.nth.call(null, vec__375099__375100, 1, null);
    return $elem.slideUp(speed__375101, on_finish__375102)
  };
  var slide_up = function($elem, var_args) {
    var p__375098 = null;
    if(goog.isDef(var_args)) {
      p__375098 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return slide_up__delegate.call(this, $elem, p__375098)
  };
  slide_up.cljs$lang$maxFixedArity = 1;
  slide_up.cljs$lang$applyTo = function(arglist__375103) {
    var $elem = cljs.core.first(arglist__375103);
    var p__375098 = cljs.core.rest(arglist__375103);
    return slide_up__delegate.call(this, $elem, p__375098)
  };
  return slide_up
}();
jayq.core.slide_down = function() {
  var slide_down__delegate = function($elem, p__375104) {
    var vec__375105__375106 = p__375104;
    var speed__375107 = cljs.core.nth.call(null, vec__375105__375106, 0, null);
    var on_finish__375108 = cljs.core.nth.call(null, vec__375105__375106, 1, null);
    return $elem.slideDown(speed__375107, on_finish__375108)
  };
  var slide_down = function($elem, var_args) {
    var p__375104 = null;
    if(goog.isDef(var_args)) {
      p__375104 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return slide_down__delegate.call(this, $elem, p__375104)
  };
  slide_down.cljs$lang$maxFixedArity = 1;
  slide_down.cljs$lang$applyTo = function(arglist__375109) {
    var $elem = cljs.core.first(arglist__375109);
    var p__375104 = cljs.core.rest(arglist__375109);
    return slide_down__delegate.call(this, $elem, p__375104)
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
  var val__delegate = function($elem, p__375110) {
    var vec__375111__375112 = p__375110;
    var v__375113 = cljs.core.nth.call(null, vec__375111__375112, 0, null);
    if(cljs.core.truth_(v__375113)) {
      return $elem.val(v__375113)
    }else {
      return $elem.val()
    }
  };
  var val = function($elem, var_args) {
    var p__375110 = null;
    if(goog.isDef(var_args)) {
      p__375110 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return val__delegate.call(this, $elem, p__375110)
  };
  val.cljs$lang$maxFixedArity = 1;
  val.cljs$lang$applyTo = function(arglist__375114) {
    var $elem = cljs.core.first(arglist__375114);
    var p__375110 = cljs.core.rest(arglist__375114);
    return val__delegate.call(this, $elem, p__375110)
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
jayq.core.xhr = function xhr(p__375115, content, callback) {
  var vec__375116__375117 = p__375115;
  var method__375118 = cljs.core.nth.call(null, vec__375116__375117, 0, null);
  var uri__375119 = cljs.core.nth.call(null, vec__375116__375117, 1, null);
  var params__375120 = jayq.util.clj__GT_js.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data", "\ufdd0'success"], {"\ufdd0'type":clojure.string.upper_case.call(null, cljs.core.name.call(null, method__375118)), "\ufdd0'data":jayq.util.clj__GT_js.call(null, content), "\ufdd0'success":callback}));
  return jQuery.ajax(uri__375119, params__375120)
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
  var on__delegate = function($elem, events, p__375121) {
    var vec__375122__375123 = p__375121;
    var sel__375124 = cljs.core.nth.call(null, vec__375122__375123, 0, null);
    var data__375125 = cljs.core.nth.call(null, vec__375122__375123, 1, null);
    var handler__375126 = cljs.core.nth.call(null, vec__375122__375123, 2, null);
    return $elem.on(jayq.core.__GT_event.call(null, events), jayq.core.__GT_selector.call(null, sel__375124), data__375125, handler__375126)
  };
  var on = function($elem, events, var_args) {
    var p__375121 = null;
    if(goog.isDef(var_args)) {
      p__375121 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return on__delegate.call(this, $elem, events, p__375121)
  };
  on.cljs$lang$maxFixedArity = 2;
  on.cljs$lang$applyTo = function(arglist__375127) {
    var $elem = cljs.core.first(arglist__375127);
    var events = cljs.core.first(cljs.core.next(arglist__375127));
    var p__375121 = cljs.core.rest(cljs.core.next(arglist__375127));
    return on__delegate.call(this, $elem, events, p__375121)
  };
  return on
}();
jayq.core.one = function() {
  var one__delegate = function($elem, events, p__375128) {
    var vec__375129__375130 = p__375128;
    var sel__375131 = cljs.core.nth.call(null, vec__375129__375130, 0, null);
    var data__375132 = cljs.core.nth.call(null, vec__375129__375130, 1, null);
    var handler__375133 = cljs.core.nth.call(null, vec__375129__375130, 2, null);
    return $elem.one(jayq.core.__GT_event.call(null, events), jayq.core.__GT_selector.call(null, sel__375131), data__375132, handler__375133)
  };
  var one = function($elem, events, var_args) {
    var p__375128 = null;
    if(goog.isDef(var_args)) {
      p__375128 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return one__delegate.call(this, $elem, events, p__375128)
  };
  one.cljs$lang$maxFixedArity = 2;
  one.cljs$lang$applyTo = function(arglist__375134) {
    var $elem = cljs.core.first(arglist__375134);
    var events = cljs.core.first(cljs.core.next(arglist__375134));
    var p__375128 = cljs.core.rest(cljs.core.next(arglist__375134));
    return one__delegate.call(this, $elem, events, p__375128)
  };
  return one
}();
jayq.core.off = function() {
  var off__delegate = function($elem, events, p__375135) {
    var vec__375136__375137 = p__375135;
    var sel__375138 = cljs.core.nth.call(null, vec__375136__375137, 0, null);
    var handler__375139 = cljs.core.nth.call(null, vec__375136__375137, 1, null);
    return $elem.off(jayq.core.__GT_event.call(null, events), jayq.core.__GT_selector.call(null, sel__375138), handler__375139)
  };
  var off = function($elem, events, var_args) {
    var p__375135 = null;
    if(goog.isDef(var_args)) {
      p__375135 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return off__delegate.call(this, $elem, events, p__375135)
  };
  off.cljs$lang$maxFixedArity = 2;
  off.cljs$lang$applyTo = function(arglist__375140) {
    var $elem = cljs.core.first(arglist__375140);
    var events = cljs.core.first(cljs.core.next(arglist__375140));
    var p__375135 = cljs.core.rest(cljs.core.next(arglist__375140));
    return off__delegate.call(this, $elem, events, p__375135)
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
tatame.client.views.render = function render(f) {
  return jayq.core.append.call(null, jayq.core.$.call(null, "\ufdd0'#workspace"), f.call(null))
};
var group__20975__auto____372884 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.loading = function loading() {
  var elem__20976__auto____372885 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div.span12", cljs.core.PersistentVector.fromArray(["\ufdd0'div.hero-unit", cljs.core.PersistentVector.fromArray(["\ufdd0'h1", "Welcome to the Dojo!"])]), cljs.core.PersistentVector.fromArray(["\ufdd0'div.alert.alert-info", cljs.core.PersistentVector.fromArray(["\ufdd0'h4", "Aguarde!"]), "Conectando com servidor..."])]));
  elem__20976__auto____372885.setAttribute("crateGroup", group__20975__auto____372884);
  return elem__20976__auto____372885
};
tatame.client.views.loading.prototype._crateGroup = group__20975__auto____372884;
var group__20975__auto____372886 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.admin_sidebar = function admin_sidebar() {
  var elem__20976__auto____372887 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div.well.sidebar-nav", cljs.core.PersistentVector.fromArray(["\ufdd0'ul.nav.nav-list", cljs.core.PersistentVector.fromArray(["\ufdd0'li.nav-header", "Sidebar"]), cljs.core.PersistentVector.fromArray(["\ufdd0'li.active", "Dojos"]), cljs.core.PersistentVector.fromArray(["\ufdd0'li.active", "Usu\u00e1rios"])])]));
  elem__20976__auto____372887.setAttribute("crateGroup", group__20975__auto____372886);
  return elem__20976__auto____372887
};
tatame.client.views.admin_sidebar.prototype._crateGroup = group__20975__auto____372886;
var group__20975__auto____372888 = cljs.core.swap_BANG_.call(null, crate.core.group_id, cljs.core.inc);
tatame.client.views.user_registration = function user_registration() {
  var elem__20976__auto____372889 = crate.core.html.call(null, cljs.core.PersistentVector.fromArray(["\ufdd0'div.span4", cljs.core.PersistentVector.fromArray(["\ufdd0'div.alert.alert-info", cljs.core.PersistentVector.fromArray(["\ufdd0'h4", "Ol\u00e1!"]), "Registre um usu\u00e1rio para come\u00e7ar a sess\u00e3o"]), cljs.core.PersistentVector.fromArray(["\ufdd0'input", cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data-loading-text"], {"\ufdd0'type":"text", "\ufdd0'data-loading-text":"registrando..."})]), 
  cljs.core.PersistentVector.fromArray(["\ufdd0'a.btn.btn-primary", "Registrar usu\u00e1rio"])]));
  elem__20976__auto____372889.setAttribute("crateGroup", group__20975__auto____372888);
  return elem__20976__auto____372889
};
tatame.client.views.user_registration.prototype._crateGroup = group__20975__auto____372888;
goog.provide("waltz.state");
goog.require("cljs.core");
waltz.state.debug_log = function() {
  var debug_log__delegate = function(sm, v, vs) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____375176 = console;
      if(cljs.core.truth_(and__3546__auto____375176)) {
        return cljs.core.deref.call(null, sm).call(null, "\ufdd0'debug")
      }else {
        return and__3546__auto____375176
      }
    }())) {
      var s__375177 = cljs.core.apply.call(null, cljs.core.str, waltz.state.get_name.call(null, sm), " :: ", v, vs);
      return console.log(s__375177)
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
  debug_log.cljs$lang$applyTo = function(arglist__375178) {
    var sm = cljs.core.first(arglist__375178);
    var v = cljs.core.first(cljs.core.next(arglist__375178));
    var vs = cljs.core.rest(cljs.core.next(arglist__375178));
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
  var machine__delegate = function(p__375179) {
    var vec__375180__375181 = p__375179;
    var n__375182 = cljs.core.nth.call(null, vec__375180__375181, 0, null);
    return cljs.core.atom.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'debug", "\ufdd0'name", "\ufdd0'current", "\ufdd0'states", "\ufdd0'transitions"], {"\ufdd0'debug":true, "\ufdd0'name":cljs.core.name.call(null, n__375182), "\ufdd0'current":cljs.core.set([]), "\ufdd0'states":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'transitions":cljs.core.ObjMap.fromObject([], {})}))
  };
  var machine = function(var_args) {
    var p__375179 = null;
    if(goog.isDef(var_args)) {
      p__375179 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return machine__delegate.call(this, p__375179)
  };
  machine.cljs$lang$maxFixedArity = 0;
  machine.cljs$lang$applyTo = function(arglist__375183) {
    var p__375179 = cljs.core.seq(arglist__375183);
    return machine__delegate.call(this, p__375179)
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
  return cljs.core.swap_BANG_.call(null, sm, function(p1__375184_SHARP_) {
    return cljs.core.assoc_in.call(null, p1__375184_SHARP_, ks, v)
  })
};
waltz.state.update_sm = function() {
  var update_sm__delegate = function(sm, fntail) {
    return cljs.core.swap_BANG_.call(null, sm, function(p1__375185_SHARP_) {
      return cljs.core.apply.call(null, cljs.core.update_in, p1__375185_SHARP_, fntail)
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
  update_sm.cljs$lang$applyTo = function(arglist__375186) {
    var sm = cljs.core.first(arglist__375186);
    var fntail = cljs.core.rest(arglist__375186);
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
  var trans__375188 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state, "\ufdd0'constraints"]));
  if(cljs.core.truth_(trans__375188)) {
    return cljs.core.every_QMARK_.call(null, function(p1__375187_SHARP_) {
      return p1__375187_SHARP_.call(null, state)
    }, trans__375188)
  }else {
    return true
  }
};
waltz.state.set = function() {
  var set__delegate = function(sm, states, context) {
    var G__375189__375190 = cljs.core.seq.call(null, waltz.state.__GT_coll.call(null, states));
    if(cljs.core.truth_(G__375189__375190)) {
      var state__375191 = cljs.core.first.call(null, G__375189__375190);
      var G__375189__375192 = G__375189__375190;
      while(true) {
        if(cljs.core.truth_(waltz.state.can_transition_QMARK_.call(null, sm, state__375191))) {
          var cur_in__375193 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state__375191, "\ufdd0'in"]));
          waltz.state.update_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'current"]), cljs.core.conj, state__375191);
          waltz.state.debug_log.call(null, sm, "(set ", cljs.core.str.call(null, state__375191), ") -> ", cljs.core.pr_str.call(null, waltz.state.current.call(null, sm)));
          if(cljs.core.truth_(cljs.core.seq.call(null, cur_in__375193))) {
            waltz.state.debug_log.call(null, sm, "(in ", cljs.core.str.call(null, state__375191), ")");
            var G__375194__375195 = cljs.core.seq.call(null, cur_in__375193);
            if(cljs.core.truth_(G__375194__375195)) {
              var func__375196 = cljs.core.first.call(null, G__375194__375195);
              var G__375194__375197 = G__375194__375195;
              while(true) {
                cljs.core.apply.call(null, func__375196, context);
                var temp__3698__auto____375198 = cljs.core.next.call(null, G__375194__375197);
                if(cljs.core.truth_(temp__3698__auto____375198)) {
                  var G__375194__375199 = temp__3698__auto____375198;
                  var G__375202 = cljs.core.first.call(null, G__375194__375199);
                  var G__375203 = G__375194__375199;
                  func__375196 = G__375202;
                  G__375194__375197 = G__375203;
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
        var temp__3698__auto____375200 = cljs.core.next.call(null, G__375189__375192);
        if(cljs.core.truth_(temp__3698__auto____375200)) {
          var G__375189__375201 = temp__3698__auto____375200;
          var G__375204 = cljs.core.first.call(null, G__375189__375201);
          var G__375205 = G__375189__375201;
          state__375191 = G__375204;
          G__375189__375192 = G__375205;
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
  set.cljs$lang$applyTo = function(arglist__375206) {
    var sm = cljs.core.first(arglist__375206);
    var states = cljs.core.first(cljs.core.next(arglist__375206));
    var context = cljs.core.rest(cljs.core.next(arglist__375206));
    return set__delegate.call(this, sm, states, context)
  };
  return set
}();
waltz.state.unset = function() {
  var unset__delegate = function(sm, states, context) {
    var G__375207__375208 = cljs.core.seq.call(null, waltz.state.__GT_coll.call(null, states));
    if(cljs.core.truth_(G__375207__375208)) {
      var state__375209 = cljs.core.first.call(null, G__375207__375208);
      var G__375207__375210 = G__375207__375208;
      while(true) {
        if(cljs.core.truth_(waltz.state.in_QMARK_.call(null, sm, state__375209))) {
          var cur_out__375211 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'states", state__375209, "\ufdd0'out"]));
          waltz.state.update_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'current"]), cljs.core.disj, state__375209);
          waltz.state.debug_log.call(null, sm, "(unset ", cljs.core.str.call(null, state__375209, ")"), " -> ", cljs.core.pr_str.call(null, waltz.state.current.call(null, sm)));
          if(cljs.core.truth_(cljs.core.seq.call(null, cur_out__375211))) {
            waltz.state.debug_log.call(null, sm, "(out ", cljs.core.str.call(null, state__375209), ")");
            var G__375212__375213 = cljs.core.seq.call(null, cur_out__375211);
            if(cljs.core.truth_(G__375212__375213)) {
              var func__375214 = cljs.core.first.call(null, G__375212__375213);
              var G__375212__375215 = G__375212__375213;
              while(true) {
                cljs.core.apply.call(null, func__375214, context);
                var temp__3698__auto____375216 = cljs.core.next.call(null, G__375212__375215);
                if(cljs.core.truth_(temp__3698__auto____375216)) {
                  var G__375212__375217 = temp__3698__auto____375216;
                  var G__375220 = cljs.core.first.call(null, G__375212__375217);
                  var G__375221 = G__375212__375217;
                  func__375214 = G__375220;
                  G__375212__375215 = G__375221;
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
        var temp__3698__auto____375218 = cljs.core.next.call(null, G__375207__375210);
        if(cljs.core.truth_(temp__3698__auto____375218)) {
          var G__375207__375219 = temp__3698__auto____375218;
          var G__375222 = cljs.core.first.call(null, G__375207__375219);
          var G__375223 = G__375207__375219;
          state__375209 = G__375222;
          G__375207__375210 = G__375223;
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
  unset.cljs$lang$applyTo = function(arglist__375224) {
    var sm = cljs.core.first(arglist__375224);
    var states = cljs.core.first(cljs.core.next(arglist__375224));
    var context = cljs.core.rest(cljs.core.next(arglist__375224));
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
  set_ex.cljs$lang$applyTo = function(arglist__375225) {
    var sm = cljs.core.first(arglist__375225);
    var to_unset = cljs.core.first(cljs.core.next(arglist__375225));
    var to_set = cljs.core.first(cljs.core.next(cljs.core.next(arglist__375225)));
    var context = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__375225)));
    return set_ex__delegate.call(this, sm, to_unset, to_set, context)
  };
  return set_ex
}();
waltz.state.transition = function() {
  var transition__delegate = function(sm, ts, context) {
    var G__375226__375227 = cljs.core.seq.call(null, waltz.state.__GT_coll.call(null, ts));
    if(cljs.core.truth_(G__375226__375227)) {
      var trans__375228 = cljs.core.first.call(null, G__375226__375227);
      var G__375226__375229 = G__375226__375227;
      while(true) {
        var temp__3698__auto____375230 = waltz.state.get_in_sm.call(null, sm, cljs.core.PersistentVector.fromArray(["\ufdd0'transitions", trans__375228]));
        if(cljs.core.truth_(temp__3698__auto____375230)) {
          var t__375231 = temp__3698__auto____375230;
          var res__375232 = cljs.core.apply.call(null, t__375231, context);
          waltz.state.debug_log.call(null, sm, "(trans ", cljs.core.str.call(null, trans__375228), ") -> ", cljs.core.boolean$.call(null, res__375232), " :: context ", cljs.core.pr_str.call(null, context))
        }else {
        }
        var temp__3698__auto____375233 = cljs.core.next.call(null, G__375226__375229);
        if(cljs.core.truth_(temp__3698__auto____375233)) {
          var G__375226__375234 = temp__3698__auto____375233;
          var G__375235 = cljs.core.first.call(null, G__375226__375234);
          var G__375236 = G__375226__375234;
          trans__375228 = G__375235;
          G__375226__375229 = G__375236;
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
  transition.cljs$lang$applyTo = function(arglist__375237) {
    var sm = cljs.core.first(arglist__375237);
    var ts = cljs.core.first(cljs.core.next(arglist__375237));
    var context = cljs.core.rest(cljs.core.next(arglist__375237));
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
    var and__3546__auto____374724 = reader;
    if(cljs.core.truth_(and__3546__auto____374724)) {
      return reader.cljs$reader$PushbackReader$read_char
    }else {
      return and__3546__auto____374724
    }
  }())) {
    return reader.cljs$reader$PushbackReader$read_char(reader)
  }else {
    return function() {
      var or__3548__auto____374725 = cljs.reader.read_char[goog.typeOf.call(null, reader)];
      if(cljs.core.truth_(or__3548__auto____374725)) {
        return or__3548__auto____374725
      }else {
        var or__3548__auto____374726 = cljs.reader.read_char["_"];
        if(cljs.core.truth_(or__3548__auto____374726)) {
          return or__3548__auto____374726
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.read-char", reader);
        }
      }
    }().call(null, reader)
  }
};
cljs.reader.unread = function unread(reader, ch) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374727 = reader;
    if(cljs.core.truth_(and__3546__auto____374727)) {
      return reader.cljs$reader$PushbackReader$unread
    }else {
      return and__3546__auto____374727
    }
  }())) {
    return reader.cljs$reader$PushbackReader$unread(reader, ch)
  }else {
    return function() {
      var or__3548__auto____374728 = cljs.reader.unread[goog.typeOf.call(null, reader)];
      if(cljs.core.truth_(or__3548__auto____374728)) {
        return or__3548__auto____374728
      }else {
        var or__3548__auto____374729 = cljs.reader.unread["_"];
        if(cljs.core.truth_(or__3548__auto____374729)) {
          return or__3548__auto____374729
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
  var this__374730 = this;
  if(cljs.core.truth_(cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, this__374730.buffer_atom)))) {
    var idx__374731 = cljs.core.deref.call(null, this__374730.index_atom);
    cljs.core.swap_BANG_.call(null, this__374730.index_atom, cljs.core.inc);
    return cljs.core.nth.call(null, this__374730.s, idx__374731)
  }else {
    var buf__374732 = cljs.core.deref.call(null, this__374730.buffer_atom);
    cljs.core.swap_BANG_.call(null, this__374730.buffer_atom, cljs.core.rest);
    return cljs.core.first.call(null, buf__374732)
  }
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$unread = function(reader, ch) {
  var this__374733 = this;
  return cljs.core.swap_BANG_.call(null, this__374733.buffer_atom, function(p1__374723_SHARP_) {
    return cljs.core.cons.call(null, ch, p1__374723_SHARP_)
  })
};
cljs.reader.StringPushbackReader;
cljs.reader.push_back_reader = function push_back_reader(s) {
  return new cljs.reader.StringPushbackReader(s, cljs.core.atom.call(null, 0), cljs.core.atom.call(null, null))
};
cljs.reader.whitespace_QMARK_ = function whitespace_QMARK_(ch) {
  var or__3548__auto____374734 = goog.string.isBreakingWhitespace.call(null, ch);
  if(cljs.core.truth_(or__3548__auto____374734)) {
    return or__3548__auto____374734
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
  var or__3548__auto____374735 = cljs.reader.numeric_QMARK_.call(null, initch);
  if(cljs.core.truth_(or__3548__auto____374735)) {
    return or__3548__auto____374735
  }else {
    var and__3546__auto____374737 = function() {
      var or__3548__auto____374736 = cljs.core._EQ_.call(null, "+", initch);
      if(cljs.core.truth_(or__3548__auto____374736)) {
        return or__3548__auto____374736
      }else {
        return cljs.core._EQ_.call(null, "-", initch)
      }
    }();
    if(cljs.core.truth_(and__3546__auto____374737)) {
      return cljs.reader.numeric_QMARK_.call(null, function() {
        var next_ch__374738 = cljs.reader.read_char.call(null, reader);
        cljs.reader.unread.call(null, reader, next_ch__374738);
        return next_ch__374738
      }())
    }else {
      return and__3546__auto____374737
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
  reader_error.cljs$lang$applyTo = function(arglist__374739) {
    var rdr = cljs.core.first(arglist__374739);
    var msg = cljs.core.rest(arglist__374739);
    return reader_error__delegate.call(this, rdr, msg)
  };
  return reader_error
}();
cljs.reader.macro_terminating_QMARK_ = function macro_terminating_QMARK_(ch) {
  var and__3546__auto____374740 = cljs.core.not_EQ_.call(null, ch, "#");
  if(cljs.core.truth_(and__3546__auto____374740)) {
    var and__3546__auto____374741 = cljs.core.not_EQ_.call(null, ch, "'");
    if(cljs.core.truth_(and__3546__auto____374741)) {
      var and__3546__auto____374742 = cljs.core.not_EQ_.call(null, ch, ":");
      if(cljs.core.truth_(and__3546__auto____374742)) {
        return cljs.core.contains_QMARK_.call(null, cljs.reader.macros, ch)
      }else {
        return and__3546__auto____374742
      }
    }else {
      return and__3546__auto____374741
    }
  }else {
    return and__3546__auto____374740
  }
};
cljs.reader.read_token = function read_token(rdr, initch) {
  var sb__374743 = new goog.string.StringBuffer(initch);
  var ch__374744 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3548__auto____374745 = ch__374744 === null;
      if(cljs.core.truth_(or__3548__auto____374745)) {
        return or__3548__auto____374745
      }else {
        var or__3548__auto____374746 = cljs.reader.whitespace_QMARK_.call(null, ch__374744);
        if(cljs.core.truth_(or__3548__auto____374746)) {
          return or__3548__auto____374746
        }else {
          return cljs.reader.macro_terminating_QMARK_.call(null, ch__374744)
        }
      }
    }())) {
      cljs.reader.unread.call(null, rdr, ch__374744);
      return sb__374743.toString()
    }else {
      var G__374747 = function() {
        sb__374743.append(ch__374744);
        return sb__374743
      }();
      var G__374748 = cljs.reader.read_char.call(null, rdr);
      sb__374743 = G__374747;
      ch__374744 = G__374748;
      continue
    }
    break
  }
};
cljs.reader.skip_line = function skip_line(reader, _) {
  while(true) {
    var ch__374749 = cljs.reader.read_char.call(null, reader);
    if(cljs.core.truth_(function() {
      var or__3548__auto____374750 = cljs.core._EQ_.call(null, ch__374749, "n");
      if(cljs.core.truth_(or__3548__auto____374750)) {
        return or__3548__auto____374750
      }else {
        var or__3548__auto____374751 = cljs.core._EQ_.call(null, ch__374749, "r");
        if(cljs.core.truth_(or__3548__auto____374751)) {
          return or__3548__auto____374751
        }else {
          return ch__374749 === null
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
  var groups__374752 = cljs.core.re_find.call(null, cljs.reader.int_pattern, s);
  var group3__374753 = cljs.core.nth.call(null, groups__374752, 2);
  if(cljs.core.truth_(cljs.core.not.call(null, function() {
    var or__3548__auto____374754 = void 0 === group3__374753;
    if(cljs.core.truth_(or__3548__auto____374754)) {
      return or__3548__auto____374754
    }else {
      return group3__374753.length < 1
    }
  }()))) {
    return 0
  }else {
    var negate__374756 = cljs.core.truth_(cljs.core._EQ_.call(null, "-", cljs.core.nth.call(null, groups__374752, 1))) ? -1 : 1;
    var vec__374755__374757 = cljs.core.truth_(cljs.core.nth.call(null, groups__374752, 3)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__374752, 3), 10]) : cljs.core.truth_(cljs.core.nth.call(null, groups__374752, 4)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__374752, 4), 16]) : cljs.core.truth_(cljs.core.nth.call(null, groups__374752, 5)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__374752, 5), 8]) : cljs.core.truth_(cljs.core.nth.call(null, 
    groups__374752, 7)) ? cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, groups__374752, 7), parseInt.call(null, cljs.core.nth.call(null, groups__374752, 7))]) : cljs.core.truth_("\ufdd0'default") ? cljs.core.PersistentVector.fromArray([null, null]) : null;
    var n__374758 = cljs.core.nth.call(null, vec__374755__374757, 0, null);
    var radix__374759 = cljs.core.nth.call(null, vec__374755__374757, 1, null);
    if(cljs.core.truth_(n__374758 === null)) {
      return null
    }else {
      return negate__374756 * parseInt.call(null, n__374758, radix__374759)
    }
  }
};
cljs.reader.match_ratio = function match_ratio(s) {
  var groups__374760 = cljs.core.re_find.call(null, cljs.reader.ratio_pattern, s);
  var numinator__374761 = cljs.core.nth.call(null, groups__374760, 1);
  var denominator__374762 = cljs.core.nth.call(null, groups__374760, 2);
  return parseInt.call(null, numinator__374761) / parseInt.call(null, denominator__374762)
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
  var ch__374763 = cljs.reader.read_char.call(null, reader);
  var mapresult__374764 = cljs.core.get.call(null, cljs.reader.escape_char_map, ch__374763);
  if(cljs.core.truth_(mapresult__374764)) {
    return mapresult__374764
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____374765 = cljs.core._EQ_.call(null, "u", ch__374763);
      if(cljs.core.truth_(or__3548__auto____374765)) {
        return or__3548__auto____374765
      }else {
        return cljs.reader.numeric_QMARK_.call(null, ch__374763)
      }
    }())) {
      return cljs.reader.read_unicode_char.call(null, reader, ch__374763)
    }else {
      return cljs.reader.reader_error.call(null, reader, "Unsupported escape charater: \\", ch__374763)
    }
  }
};
cljs.reader.read_past = function read_past(pred, rdr) {
  var ch__374766 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(pred.call(null, ch__374766))) {
      var G__374767 = cljs.reader.read_char.call(null, rdr);
      ch__374766 = G__374767;
      continue
    }else {
      return ch__374766
    }
    break
  }
};
cljs.reader.read_delimited_list = function read_delimited_list(delim, rdr, recursive_QMARK_) {
  var a__374768 = cljs.core.PersistentVector.fromArray([]);
  while(true) {
    var ch__374769 = cljs.reader.read_past.call(null, cljs.reader.whitespace_QMARK_, rdr);
    if(cljs.core.truth_(ch__374769)) {
    }else {
      cljs.reader.reader_error.call(null, rdr, "EOF")
    }
    if(cljs.core.truth_(cljs.core._EQ_.call(null, delim, ch__374769))) {
      return a__374768
    }else {
      var temp__3695__auto____374770 = cljs.core.get.call(null, cljs.reader.macros, ch__374769);
      if(cljs.core.truth_(temp__3695__auto____374770)) {
        var macrofn__374771 = temp__3695__auto____374770;
        var mret__374772 = macrofn__374771.call(null, rdr, ch__374769);
        var G__374774 = cljs.core.truth_(cljs.core._EQ_.call(null, mret__374772, rdr)) ? a__374768 : cljs.core.conj.call(null, a__374768, mret__374772);
        a__374768 = G__374774;
        continue
      }else {
        cljs.reader.unread.call(null, rdr, ch__374769);
        var o__374773 = cljs.reader.read.call(null, rdr, true, null, recursive_QMARK_);
        var G__374775 = cljs.core.truth_(cljs.core._EQ_.call(null, o__374773, rdr)) ? a__374768 : cljs.core.conj.call(null, a__374768, o__374773);
        a__374768 = G__374775;
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
  var ch__374776 = cljs.reader.read_char.call(null, rdr);
  var dm__374777 = cljs.core.get.call(null, cljs.reader.dispatch_macros, ch__374776);
  if(cljs.core.truth_(dm__374777)) {
    return dm__374777.call(null, rdr, _)
  }else {
    return cljs.reader.reader_error.call(null, rdr, "No dispatch macro for ", ch__374776)
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
  var l__374778 = cljs.reader.read_delimited_list.call(null, "}", rdr, true);
  if(cljs.core.truth_(cljs.core.odd_QMARK_.call(null, cljs.core.count.call(null, l__374778)))) {
    cljs.reader.reader_error.call(null, rdr, "Map literal must contain an even number of forms")
  }else {
  }
  return cljs.core.apply.call(null, cljs.core.hash_map, l__374778)
};
cljs.reader.read_number = function read_number(reader, initch) {
  var buffer__374779 = new goog.string.StringBuffer(initch);
  var ch__374780 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3548__auto____374781 = ch__374780 === null;
      if(cljs.core.truth_(or__3548__auto____374781)) {
        return or__3548__auto____374781
      }else {
        var or__3548__auto____374782 = cljs.reader.whitespace_QMARK_.call(null, ch__374780);
        if(cljs.core.truth_(or__3548__auto____374782)) {
          return or__3548__auto____374782
        }else {
          return cljs.core.contains_QMARK_.call(null, cljs.reader.macros, ch__374780)
        }
      }
    }())) {
      cljs.reader.unread.call(null, reader, ch__374780);
      var s__374783 = buffer__374779.toString();
      var or__3548__auto____374784 = cljs.reader.match_number.call(null, s__374783);
      if(cljs.core.truth_(or__3548__auto____374784)) {
        return or__3548__auto____374784
      }else {
        return cljs.reader.reader_error.call(null, reader, "Invalid number format [", s__374783, "]")
      }
    }else {
      var G__374785 = function() {
        buffer__374779.append(ch__374780);
        return buffer__374779
      }();
      var G__374786 = cljs.reader.read_char.call(null, reader);
      buffer__374779 = G__374785;
      ch__374780 = G__374786;
      continue
    }
    break
  }
};
cljs.reader.read_string = function read_string(reader, _) {
  var buffer__374787 = new goog.string.StringBuffer;
  var ch__374788 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(ch__374788 === null)) {
      return cljs.reader.reader_error.call(null, reader, "EOF while reading string")
    }else {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, "\\", ch__374788))) {
        var G__374789 = function() {
          buffer__374787.append(cljs.reader.escape_char.call(null, buffer__374787, reader));
          return buffer__374787
        }();
        var G__374790 = cljs.reader.read_char.call(null, reader);
        buffer__374787 = G__374789;
        ch__374788 = G__374790;
        continue
      }else {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, '"', ch__374788))) {
          return buffer__374787.toString()
        }else {
          if(cljs.core.truth_("\ufdd0'default")) {
            var G__374791 = function() {
              buffer__374787.append(ch__374788);
              return buffer__374787
            }();
            var G__374792 = cljs.reader.read_char.call(null, reader);
            buffer__374787 = G__374791;
            ch__374788 = G__374792;
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
  var token__374793 = cljs.reader.read_token.call(null, reader, initch);
  if(cljs.core.truth_(goog.string.contains.call(null, token__374793, "/"))) {
    return cljs.core.symbol.call(null, cljs.core.subs.call(null, token__374793, 0, token__374793.indexOf("/")), cljs.core.subs.call(null, token__374793, token__374793.indexOf("/") + 1, token__374793.length))
  }else {
    return cljs.core.get.call(null, cljs.reader.special_symbols, token__374793, cljs.core.symbol.call(null, token__374793))
  }
};
cljs.reader.read_keyword = function read_keyword(reader, initch) {
  var token__374795 = cljs.reader.read_token.call(null, reader, cljs.reader.read_char.call(null, reader));
  var vec__374794__374796 = cljs.core.re_matches.call(null, cljs.reader.symbol_pattern, token__374795);
  var token__374797 = cljs.core.nth.call(null, vec__374794__374796, 0, null);
  var ns__374798 = cljs.core.nth.call(null, vec__374794__374796, 1, null);
  var name__374799 = cljs.core.nth.call(null, vec__374794__374796, 2, null);
  if(cljs.core.truth_(function() {
    var or__3548__auto____374801 = function() {
      var and__3546__auto____374800 = cljs.core.not.call(null, void 0 === ns__374798);
      if(cljs.core.truth_(and__3546__auto____374800)) {
        return ns__374798.substring(ns__374798.length - 2, ns__374798.length) === ":/"
      }else {
        return and__3546__auto____374800
      }
    }();
    if(cljs.core.truth_(or__3548__auto____374801)) {
      return or__3548__auto____374801
    }else {
      var or__3548__auto____374802 = name__374799[name__374799.length - 1] === ":";
      if(cljs.core.truth_(or__3548__auto____374802)) {
        return or__3548__auto____374802
      }else {
        return cljs.core.not.call(null, token__374797.indexOf("::", 1) === -1)
      }
    }
  }())) {
    return cljs.reader.reader_error.call(null, reader, "Invalid token: ", token__374797)
  }else {
    if(cljs.core.truth_(cljs.reader.ns_QMARK_)) {
      return cljs.core.keyword.call(null, ns__374798.substring(0, ns__374798.indexOf("/")), name__374799)
    }else {
      return cljs.core.keyword.call(null, token__374797)
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
  var m__374803 = cljs.reader.desugar_meta.call(null, cljs.reader.read.call(null, rdr, true, null, true));
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, m__374803))) {
  }else {
    cljs.reader.reader_error.call(null, rdr, "Metadata must be Symbol,Keyword,String or Map")
  }
  var o__374804 = cljs.reader.read.call(null, rdr, true, null, true);
  if(cljs.core.truth_(function() {
    var x__451__auto____374805 = o__374804;
    if(cljs.core.truth_(function() {
      var and__3546__auto____374806 = x__451__auto____374805;
      if(cljs.core.truth_(and__3546__auto____374806)) {
        var and__3546__auto____374807 = x__451__auto____374805.cljs$core$IWithMeta$;
        if(cljs.core.truth_(and__3546__auto____374807)) {
          return cljs.core.not.call(null, x__451__auto____374805.hasOwnProperty("cljs$core$IWithMeta$"))
        }else {
          return and__3546__auto____374807
        }
      }else {
        return and__3546__auto____374806
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, x__451__auto____374805)
    }
  }())) {
    return cljs.core.with_meta.call(null, o__374804, cljs.core.merge.call(null, cljs.core.meta.call(null, o__374804), m__374803))
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
    var ch__374808 = cljs.reader.read_char.call(null, reader);
    if(cljs.core.truth_(ch__374808 === null)) {
      if(cljs.core.truth_(eof_is_error)) {
        return cljs.reader.reader_error.call(null, reader, "EOF")
      }else {
        return sentinel
      }
    }else {
      if(cljs.core.truth_(cljs.reader.whitespace_QMARK_.call(null, ch__374808))) {
        var G__374810 = reader;
        var G__374811 = eof_is_error;
        var G__374812 = sentinel;
        var G__374813 = is_recursive;
        reader = G__374810;
        eof_is_error = G__374811;
        sentinel = G__374812;
        is_recursive = G__374813;
        continue
      }else {
        if(cljs.core.truth_(cljs.reader.comment_prefix_QMARK_.call(null, ch__374808))) {
          var G__374814 = cljs.reader.read_comment.call(null, reader, ch__374808);
          var G__374815 = eof_is_error;
          var G__374816 = sentinel;
          var G__374817 = is_recursive;
          reader = G__374814;
          eof_is_error = G__374815;
          sentinel = G__374816;
          is_recursive = G__374817;
          continue
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            var res__374809 = cljs.core.truth_(cljs.reader.macros.call(null, ch__374808)) ? cljs.reader.macros.call(null, ch__374808).call(null, reader, ch__374808) : cljs.core.truth_(cljs.reader.number_literal_QMARK_.call(null, reader, ch__374808)) ? cljs.reader.read_number.call(null, reader, ch__374808) : cljs.core.truth_("\ufdd0'else") ? cljs.reader.read_symbol.call(null, reader, ch__374808) : null;
            if(cljs.core.truth_(cljs.core._EQ_.call(null, res__374809, reader))) {
              var G__374818 = reader;
              var G__374819 = eof_is_error;
              var G__374820 = sentinel;
              var G__374821 = is_recursive;
              reader = G__374818;
              eof_is_error = G__374819;
              sentinel = G__374820;
              is_recursive = G__374821;
              continue
            }else {
              return res__374809
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
  var r__374822 = cljs.reader.push_back_reader.call(null, s);
  return cljs.reader.read.call(null, r__374822, true, null, false)
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
var s__218003__auto____372890 = waltz.state.out_STAR_.call(null, waltz.state.in_STAR_.call(null, waltz.state.state_STAR_.call(null), function() {
  tatame.client.model.log.call(null, "loading");
  return tatame.client.views.render.call(null, tatame.client.views.loading)
}), function() {
  return tatame.client.model.log.call(null, "loaded")
});
waltz.state.add_state.call(null, tatame.client.model.app, "\ufdd0'loading", s__218003__auto____372890);
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
  var temp__3695__auto____372891 = cljs.core.deref.call(null, tatame.client.model.client_id);
  if(cljs.core.truth_(temp__3695__auto____372891)) {
    var current_client_id__372892 = temp__3695__auto____372891;
    return cljs.core.deref.call(null, tatame.client.model.worker).postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'command", "\ufdd0'client-id"], {"\ufdd0'command":"hello", "\ufdd0'client-id":current_client_id__372892})))
  }else {
    var temp__3695__auto____372893 = "\ufdd0'client-id".call(null, data);
    if(cljs.core.truth_(temp__3695__auto____372893)) {
      var id__372894 = temp__3695__auto____372893;
      return cljs.core.swap_BANG_.call(null, tatame.client.model.client_id, function() {
        localStorage.setItem("client-id", id__372894);
        goog.net.cookies.set("client-id", cljs.core.deref.call(null, tatame.client.model.client_id));
        return id__372894
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
tatame.client.model.on_server_message = function on_server_message(p__372895) {
  var data__372896 = p__372895;
  var data__372897 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, data__372896)) ? cljs.core.apply.call(null, cljs.core.hash_map, data__372896) : data__372896;
  var event__372898 = cljs.core.get.call(null, data__372897, "\ufdd0'event");
  tatame.client.model.log.call(null, "on server message", cljs.core.pr_str.call(null, data__372897));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, event__372898, "hello"))) {
    return tatame.client.model.on_hello.call(null, data__372897)
  }else {
    return null
  }
};
tatame.client.model.on_ws_message = function on_ws_message(e) {
  var data__372899 = cljs.reader.read_string.call(null, e.data);
  var temp__3695__auto____372900 = "\ufdd0'type".call(null, data__372899);
  if(cljs.core.truth_(temp__3695__auto____372900)) {
    var type__372901 = temp__3695__auto____372900;
    if(cljs.core.truth_(cljs.core._EQ_.call(null, type__372901, "server"))) {
      return tatame.client.model.on_server_message.call(null, cljs.reader.read_string.call(null, "\ufdd0'data".call(null, data__372899)))
    }else {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, type__372901, "client"))) {
        return tatame.client.model.on_client_message.call(null, data__372899)
      }else {
        return null
      }
    }
  }else {
    return console.log("on generic message", data__372899)
  }
};
tatame.client.model.init_BANG_ = function init_BANG_() {
  var temp__3695__auto____372902 = localStorage.getItem("client-id");
  if(cljs.core.truth_(temp__3695__auto____372902)) {
    var local_id__372903 = temp__3695__auto____372902;
    cljs.core.reset_BANG_.call(null, tatame.client.model.client_id, local_id__372903)
  }else {
    goog.net.cookies.set("client-id", tatame.client.model.local_id)
  }
  cljs.core.swap_BANG_.call(null, tatame.client.model.worker, function() {
    return new Worker("/javascripts/worker.js")
  });
  var G__372904__372905 = cljs.core.deref.call(null, tatame.client.model.worker);
  G__372904__372905.addEventListener("message", tatame.client.model.on_ws_message);
  return G__372904__372905
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
    var and__3546__auto____374930 = this$;
    if(cljs.core.truth_(and__3546__auto____374930)) {
      return this$.clojure$browser$event$EventType$event_types
    }else {
      return and__3546__auto____374930
    }
  }())) {
    return this$.clojure$browser$event$EventType$event_types(this$)
  }else {
    return function() {
      var or__3548__auto____374931 = clojure.browser.event.event_types[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____374931)) {
        return or__3548__auto____374931
      }else {
        var or__3548__auto____374932 = clojure.browser.event.event_types["_"];
        if(cljs.core.truth_(or__3548__auto____374932)) {
          return or__3548__auto____374932
        }else {
          throw cljs.core.missing_protocol.call(null, "EventType.event-types", this$);
        }
      }
    }().call(null, this$)
  }
};
Element.prototype.clojure$browser$event$EventType$ = true;
Element.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__374933) {
    var vec__374934__374935 = p__374933;
    var k__374936 = cljs.core.nth.call(null, vec__374934__374935, 0, null);
    var v__374937 = cljs.core.nth.call(null, vec__374934__374935, 1, null);
    return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__374936.toLowerCase()), v__374937])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.events.EventType))))
};
goog.events.EventTarget.prototype.clojure$browser$event$EventType$ = true;
goog.events.EventTarget.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__374938) {
    var vec__374939__374940 = p__374938;
    var k__374941 = cljs.core.nth.call(null, vec__374939__374940, 0, null);
    var v__374942 = cljs.core.nth.call(null, vec__374939__374940, 1, null);
    return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__374941.toLowerCase()), v__374942])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.events.EventType))))
};
clojure.browser.event.listen = function() {
  var listen = null;
  var listen__374943 = function(src, type, fn) {
    return listen.call(null, src, type, fn, false)
  };
  var listen__374944 = function(src, type, fn, capture_QMARK_) {
    return goog.events.listen.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  listen = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return listen__374943.call(this, src, type, fn);
      case 4:
        return listen__374944.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen
}();
clojure.browser.event.listen_once = function() {
  var listen_once = null;
  var listen_once__374946 = function(src, type, fn) {
    return listen_once.call(null, src, type, fn, false)
  };
  var listen_once__374947 = function(src, type, fn, capture_QMARK_) {
    return goog.events.listenOnce.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  listen_once = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return listen_once__374946.call(this, src, type, fn);
      case 4:
        return listen_once__374947.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen_once
}();
clojure.browser.event.unlisten = function() {
  var unlisten = null;
  var unlisten__374949 = function(src, type, fn) {
    return unlisten.call(null, src, type, fn, false)
  };
  var unlisten__374950 = function(src, type, fn, capture_QMARK_) {
    return goog.events.unlisten.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  unlisten = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return unlisten__374949.call(this, src, type, fn);
      case 4:
        return unlisten__374950.call(this, src, type, fn, capture_QMARK_)
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
  var h__375238 = cljs.core.truth_(goog.history.Html5History.isSupported.call(null)) ? new goog.history.Html5History : new goog.History;
  h__375238.setEnabled(true);
  return h__375238
};
waltz.history.history = waltz.history.create_history.call(null);
waltz.history.set = function set(token) {
  return waltz.history.history.setToken(cljs.core.name.call(null, token))
};
waltz.history.get = function get() {
  var t__375239 = waltz.history.history.getToken();
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "", t__375239))) {
    return null
  }else {
    return cljs.core.keyword.call(null, t__375239)
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
clojure.browser.net.event_types = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__374836) {
  var vec__374837__374838 = p__374836;
  var k__374839 = cljs.core.nth.call(null, vec__374837__374838, 0, null);
  var v__374840 = cljs.core.nth.call(null, vec__374837__374838, 1, null);
  return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__374839.toLowerCase()), v__374840])
}, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.net.EventType))));
clojure.browser.net.IConnection = {};
clojure.browser.net.connect = function() {
  var connect = null;
  var connect__374871 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374841 = this$;
      if(cljs.core.truth_(and__3546__auto____374841)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____374841
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$)
    }else {
      return function() {
        var or__3548__auto____374842 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374842)) {
          return or__3548__auto____374842
        }else {
          var or__3548__auto____374843 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____374843)) {
            return or__3548__auto____374843
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var connect__374872 = function(this$, opt1) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374844 = this$;
      if(cljs.core.truth_(and__3546__auto____374844)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____374844
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1)
    }else {
      return function() {
        var or__3548__auto____374845 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374845)) {
          return or__3548__auto____374845
        }else {
          var or__3548__auto____374846 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____374846)) {
            return or__3548__auto____374846
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1)
    }
  };
  var connect__374873 = function(this$, opt1, opt2) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374847 = this$;
      if(cljs.core.truth_(and__3546__auto____374847)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____374847
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1, opt2)
    }else {
      return function() {
        var or__3548__auto____374848 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374848)) {
          return or__3548__auto____374848
        }else {
          var or__3548__auto____374849 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____374849)) {
            return or__3548__auto____374849
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1, opt2)
    }
  };
  var connect__374874 = function(this$, opt1, opt2, opt3) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374850 = this$;
      if(cljs.core.truth_(and__3546__auto____374850)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____374850
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1, opt2, opt3)
    }else {
      return function() {
        var or__3548__auto____374851 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374851)) {
          return or__3548__auto____374851
        }else {
          var or__3548__auto____374852 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____374852)) {
            return or__3548__auto____374852
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
        return connect__374871.call(this, this$);
      case 2:
        return connect__374872.call(this, this$, opt1);
      case 3:
        return connect__374873.call(this, this$, opt1, opt2);
      case 4:
        return connect__374874.call(this, this$, opt1, opt2, opt3)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return connect
}();
clojure.browser.net.transmit = function() {
  var transmit = null;
  var transmit__374876 = function(this$, opt) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374853 = this$;
      if(cljs.core.truth_(and__3546__auto____374853)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____374853
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt)
    }else {
      return function() {
        var or__3548__auto____374854 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374854)) {
          return or__3548__auto____374854
        }else {
          var or__3548__auto____374855 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____374855)) {
            return or__3548__auto____374855
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt)
    }
  };
  var transmit__374877 = function(this$, opt, opt2) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374856 = this$;
      if(cljs.core.truth_(and__3546__auto____374856)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____374856
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2)
    }else {
      return function() {
        var or__3548__auto____374857 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374857)) {
          return or__3548__auto____374857
        }else {
          var or__3548__auto____374858 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____374858)) {
            return or__3548__auto____374858
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2)
    }
  };
  var transmit__374878 = function(this$, opt, opt2, opt3) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374859 = this$;
      if(cljs.core.truth_(and__3546__auto____374859)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____374859
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3)
    }else {
      return function() {
        var or__3548__auto____374860 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374860)) {
          return or__3548__auto____374860
        }else {
          var or__3548__auto____374861 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____374861)) {
            return or__3548__auto____374861
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3)
    }
  };
  var transmit__374879 = function(this$, opt, opt2, opt3, opt4) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374862 = this$;
      if(cljs.core.truth_(and__3546__auto____374862)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____374862
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3, opt4)
    }else {
      return function() {
        var or__3548__auto____374863 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374863)) {
          return or__3548__auto____374863
        }else {
          var or__3548__auto____374864 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____374864)) {
            return or__3548__auto____374864
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3, opt4)
    }
  };
  var transmit__374880 = function(this$, opt, opt2, opt3, opt4, opt5) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374865 = this$;
      if(cljs.core.truth_(and__3546__auto____374865)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____374865
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3, opt4, opt5)
    }else {
      return function() {
        var or__3548__auto____374866 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374866)) {
          return or__3548__auto____374866
        }else {
          var or__3548__auto____374867 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____374867)) {
            return or__3548__auto____374867
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
        return transmit__374876.call(this, this$, opt);
      case 3:
        return transmit__374877.call(this, this$, opt, opt2);
      case 4:
        return transmit__374878.call(this, this$, opt, opt2, opt3);
      case 5:
        return transmit__374879.call(this, this$, opt, opt2, opt3, opt4);
      case 6:
        return transmit__374880.call(this, this$, opt, opt2, opt3, opt4, opt5)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return transmit
}();
clojure.browser.net.close = function close(this$) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____374868 = this$;
    if(cljs.core.truth_(and__3546__auto____374868)) {
      return this$.clojure$browser$net$IConnection$close
    }else {
      return and__3546__auto____374868
    }
  }())) {
    return this$.clojure$browser$net$IConnection$close(this$)
  }else {
    return function() {
      var or__3548__auto____374869 = clojure.browser.net.close[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____374869)) {
        return or__3548__auto____374869
      }else {
        var or__3548__auto____374870 = clojure.browser.net.close["_"];
        if(cljs.core.truth_(or__3548__auto____374870)) {
          return or__3548__auto____374870
        }else {
          throw cljs.core.missing_protocol.call(null, "IConnection.close", this$);
        }
      }
    }().call(null, this$)
  }
};
goog.net.XhrIo.prototype.clojure$browser$event$EventType$ = true;
goog.net.XhrIo.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__374882) {
    var vec__374883__374884 = p__374882;
    var k__374885 = cljs.core.nth.call(null, vec__374883__374884, 0, null);
    var v__374886 = cljs.core.nth.call(null, vec__374883__374884, 1, null);
    return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__374885.toLowerCase()), v__374886])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.net.EventType))))
};
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$ = true;
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$transmit = function() {
  var G__374887 = null;
  var G__374887__374888 = function(this$, uri) {
    return clojure.browser.net.transmit.call(null, this$, uri, "GET", null, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__374887__374889 = function(this$, uri, method) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, null, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__374887__374890 = function(this$, uri, method, content) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, content, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__374887__374891 = function(this$, uri, method, content, headers) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, content, headers, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__374887__374892 = function(this$, uri, method, content, headers, timeout) {
    this$.setTimeoutInterval(timeout);
    return this$.send(uri, method, content, headers)
  };
  G__374887 = function(this$, uri, method, content, headers, timeout) {
    switch(arguments.length) {
      case 2:
        return G__374887__374888.call(this, this$, uri);
      case 3:
        return G__374887__374889.call(this, this$, uri, method);
      case 4:
        return G__374887__374890.call(this, this$, uri, method, content);
      case 5:
        return G__374887__374891.call(this, this$, uri, method, content, headers);
      case 6:
        return G__374887__374892.call(this, this$, uri, method, content, headers, timeout)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374887
}();
clojure.browser.net.xpc_config_fields = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__374894) {
  var vec__374895__374896 = p__374894;
  var k__374897 = cljs.core.nth.call(null, vec__374895__374896, 0, null);
  var v__374898 = cljs.core.nth.call(null, vec__374895__374896, 1, null);
  return cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, k__374897.toLowerCase()), v__374898])
}, cljs.core.js__GT_clj.call(null, goog.net.xpc.CfgFields)));
clojure.browser.net.xhr_connection = function xhr_connection() {
  return new goog.net.XhrIo
};
clojure.browser.net.ICrossPageChannel = {};
clojure.browser.net.register_service = function() {
  var register_service = null;
  var register_service__374905 = function(this$, service_name, fn) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374899 = this$;
      if(cljs.core.truth_(and__3546__auto____374899)) {
        return this$.clojure$browser$net$ICrossPageChannel$register_service
      }else {
        return and__3546__auto____374899
      }
    }())) {
      return this$.clojure$browser$net$ICrossPageChannel$register_service(this$, service_name, fn)
    }else {
      return function() {
        var or__3548__auto____374900 = clojure.browser.net.register_service[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374900)) {
          return or__3548__auto____374900
        }else {
          var or__3548__auto____374901 = clojure.browser.net.register_service["_"];
          if(cljs.core.truth_(or__3548__auto____374901)) {
            return or__3548__auto____374901
          }else {
            throw cljs.core.missing_protocol.call(null, "ICrossPageChannel.register-service", this$);
          }
        }
      }().call(null, this$, service_name, fn)
    }
  };
  var register_service__374906 = function(this$, service_name, fn, encode_json_QMARK_) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____374902 = this$;
      if(cljs.core.truth_(and__3546__auto____374902)) {
        return this$.clojure$browser$net$ICrossPageChannel$register_service
      }else {
        return and__3546__auto____374902
      }
    }())) {
      return this$.clojure$browser$net$ICrossPageChannel$register_service(this$, service_name, fn, encode_json_QMARK_)
    }else {
      return function() {
        var or__3548__auto____374903 = clojure.browser.net.register_service[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____374903)) {
          return or__3548__auto____374903
        }else {
          var or__3548__auto____374904 = clojure.browser.net.register_service["_"];
          if(cljs.core.truth_(or__3548__auto____374904)) {
            return or__3548__auto____374904
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
        return register_service__374905.call(this, this$, service_name, fn);
      case 4:
        return register_service__374906.call(this, this$, service_name, fn, encode_json_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return register_service
}();
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$connect = function() {
  var G__374908 = null;
  var G__374908__374909 = function(this$) {
    return clojure.browser.net.connect.call(null, this$, null)
  };
  var G__374908__374910 = function(this$, on_connect_fn) {
    return this$.connect(on_connect_fn)
  };
  var G__374908__374911 = function(this$, on_connect_fn, config_iframe_fn) {
    return clojure.browser.net.connect.call(null, this$, on_connect_fn, config_iframe_fn, document.body)
  };
  var G__374908__374912 = function(this$, on_connect_fn, config_iframe_fn, iframe_parent) {
    this$.createPeerIframe(iframe_parent, config_iframe_fn);
    return this$.connect(on_connect_fn)
  };
  G__374908 = function(this$, on_connect_fn, config_iframe_fn, iframe_parent) {
    switch(arguments.length) {
      case 1:
        return G__374908__374909.call(this, this$);
      case 2:
        return G__374908__374910.call(this, this$, on_connect_fn);
      case 3:
        return G__374908__374911.call(this, this$, on_connect_fn, config_iframe_fn);
      case 4:
        return G__374908__374912.call(this, this$, on_connect_fn, config_iframe_fn, iframe_parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374908
}();
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$transmit = function(this$, service_name, payload) {
  return this$.send(cljs.core.name.call(null, service_name), payload)
};
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$close = function(this$) {
  return this$.close(cljs.core.List.EMPTY)
};
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$register_service = function() {
  var G__374914 = null;
  var G__374914__374915 = function(this$, service_name, fn) {
    return clojure.browser.net.register_service.call(null, this$, service_name, fn, false)
  };
  var G__374914__374916 = function(this$, service_name, fn, encode_json_QMARK_) {
    return this$.registerService(cljs.core.name.call(null, service_name), fn, encode_json_QMARK_)
  };
  G__374914 = function(this$, service_name, fn, encode_json_QMARK_) {
    switch(arguments.length) {
      case 3:
        return G__374914__374915.call(this, this$, service_name, fn);
      case 4:
        return G__374914__374916.call(this, this$, service_name, fn, encode_json_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__374914
}();
clojure.browser.net.xpc_connection = function() {
  var xpc_connection = null;
  var xpc_connection__374927 = function() {
    var temp__3698__auto____374918 = (new goog.Uri(window.location.href)).getParameterValue("xpc");
    if(cljs.core.truth_(temp__3698__auto____374918)) {
      var config__374919 = temp__3698__auto____374918;
      return new goog.net.xpc.CrossPageChannel(goog.json.parse.call(null, config__374919))
    }else {
      return null
    }
  };
  var xpc_connection__374928 = function(config) {
    return new goog.net.xpc.CrossPageChannel(cljs.core.reduce.call(null, function(sum, p__374920) {
      var vec__374921__374922 = p__374920;
      var k__374923 = cljs.core.nth.call(null, vec__374921__374922, 0, null);
      var v__374924 = cljs.core.nth.call(null, vec__374921__374922, 1, null);
      var temp__3695__auto____374925 = cljs.core.get.call(null, clojure.browser.net.xpc_config_fields, k__374923);
      if(cljs.core.truth_(temp__3695__auto____374925)) {
        var field__374926 = temp__3695__auto____374925;
        return cljs.core.assoc.call(null, sum, field__374926, v__374924)
      }else {
        return sum
      }
    }, cljs.core.ObjMap.fromObject([], {}), config).strobj)
  };
  xpc_connection = function(config) {
    switch(arguments.length) {
      case 0:
        return xpc_connection__374927.call(this);
      case 1:
        return xpc_connection__374928.call(this, config)
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
  var temp__3695__auto____374823 = cljs.core.deref.call(null, clojure.browser.repl.xpc_connection);
  if(cljs.core.truth_(temp__3695__auto____374823)) {
    var conn__374824 = temp__3695__auto____374823;
    return clojure.browser.net.transmit.call(null, conn__374824, "\ufdd0'print", cljs.core.pr_str.call(null, data))
  }else {
    return null
  }
};
clojure.browser.repl.evaluate_javascript = function evaluate_javascript(conn, block) {
  var result__374827 = function() {
    try {
      return cljs.core.ObjMap.fromObject(["\ufdd0'status", "\ufdd0'value"], {"\ufdd0'status":"\ufdd0'success", "\ufdd0'value":cljs.core.str.call(null, eval(block))})
    }catch(e374825) {
      if(cljs.core.truth_(cljs.core.instance_QMARK_.call(null, Error, e374825))) {
        var e__374826 = e374825;
        return cljs.core.ObjMap.fromObject(["\ufdd0'status", "\ufdd0'value", "\ufdd0'stacktrace"], {"\ufdd0'status":"\ufdd0'exception", "\ufdd0'value":cljs.core.pr_str.call(null, e__374826), "\ufdd0'stacktrace":cljs.core.truth_(e__374826.hasOwnProperty("stack")) ? e__374826.stack : "No stacktrace available."})
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          throw e374825;
        }else {
          return null
        }
      }
    }
  }();
  return cljs.core.pr_str.call(null, result__374827)
};
clojure.browser.repl.send_result = function send_result(connection, url, data) {
  return clojure.browser.net.transmit.call(null, connection, url, "POST", data, null, 0)
};
clojure.browser.repl.send_print = function() {
  var send_print = null;
  var send_print__374829 = function(url, data) {
    return send_print.call(null, url, data, 0)
  };
  var send_print__374830 = function(url, data, n) {
    var conn__374828 = clojure.browser.net.xhr_connection.call(null);
    clojure.browser.event.listen.call(null, conn__374828, "\ufdd0'error", function(_) {
      if(cljs.core.truth_(n < 10)) {
        return send_print.call(null, url, data, n + 1)
      }else {
        return console.log(cljs.core.str.call(null, "Could not send ", data, " after ", n, " attempts."))
      }
    });
    return clojure.browser.net.transmit.call(null, conn__374828, url, "POST", data, null, 0)
  };
  send_print = function(url, data, n) {
    switch(arguments.length) {
      case 2:
        return send_print__374829.call(this, url, data);
      case 3:
        return send_print__374830.call(this, url, data, n)
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
  var temp__3695__auto____374832 = clojure.browser.net.xpc_connection.call(null);
  if(cljs.core.truth_(temp__3695__auto____374832)) {
    var repl_connection__374833 = temp__3695__auto____374832;
    var connection__374834 = clojure.browser.net.xhr_connection.call(null);
    clojure.browser.event.listen.call(null, connection__374834, "\ufdd0'success", function(e) {
      return clojure.browser.net.transmit.call(null, repl_connection__374833, "\ufdd0'evaluate-javascript", e.currentTarget.getResponseText(cljs.core.List.EMPTY))
    });
    clojure.browser.net.register_service.call(null, repl_connection__374833, "\ufdd0'send-result", function(data) {
      return clojure.browser.repl.send_result.call(null, connection__374834, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'result", data))
    });
    clojure.browser.net.register_service.call(null, repl_connection__374833, "\ufdd0'print", function(data) {
      return clojure.browser.repl.send_print.call(null, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'print", data))
    });
    clojure.browser.net.connect.call(null, repl_connection__374833, cljs.core.constantly.call(null, null));
    return setTimeout.call(null, function() {
      return clojure.browser.repl.send_result.call(null, connection__374834, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'ready", "ready"))
    }, 50)
  }else {
    return alert.call(null, "No 'xpc' param provided to child iframe.")
  }
};
clojure.browser.repl.connect = function connect(repl_server_url) {
  var repl_connection__374835 = clojure.browser.net.xpc_connection.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'peer_uri"], {"\ufdd0'peer_uri":repl_server_url}));
  cljs.core.swap_BANG_.call(null, clojure.browser.repl.xpc_connection, cljs.core.constantly.call(null, repl_connection__374835));
  clojure.browser.net.register_service.call(null, repl_connection__374835, "\ufdd0'evaluate-javascript", function(js) {
    return clojure.browser.net.transmit.call(null, repl_connection__374835, "\ufdd0'send-result", clojure.browser.repl.evaluate_javascript.call(null, repl_connection__374835, js))
  });
  return clojure.browser.net.connect.call(null, repl_connection__374835, cljs.core.constantly.call(null, null), function(iframe) {
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
  var editor__372816 = ace.edit(id);
  var session__372817 = tatame.client.editors.session.call(null, editor__372816);
  var mode_fn__372818 = window.require(mode).Mode;
  session__372817.setMode(new mode_fn__372818);
  var G__372819__372820 = cljs.core.seq.call(null, listeners);
  if(cljs.core.truth_(G__372819__372820)) {
    var G__372822__372824 = cljs.core.first.call(null, G__372819__372820);
    var vec__372823__372825 = G__372822__372824;
    var event__372826 = cljs.core.nth.call(null, vec__372823__372825, 0, null);
    var f__372827 = cljs.core.nth.call(null, vec__372823__372825, 1, null);
    var G__372819__372828 = G__372819__372820;
    var G__372822__372829 = G__372822__372824;
    var G__372819__372830 = G__372819__372828;
    while(true) {
      var vec__372831__372832 = G__372822__372829;
      var event__372833 = cljs.core.nth.call(null, vec__372831__372832, 0, null);
      var f__372834 = cljs.core.nth.call(null, vec__372831__372832, 1, null);
      var G__372819__372835 = G__372819__372830;
      session__372817.on(event__372833, cljs.core.partial.call(null, f__372834, id));
      var temp__3698__auto____372836 = cljs.core.next.call(null, G__372819__372835);
      if(cljs.core.truth_(temp__3698__auto____372836)) {
        var G__372819__372837 = temp__3698__auto____372836;
        var G__372838 = cljs.core.first.call(null, G__372819__372837);
        var G__372839 = G__372819__372837;
        G__372822__372829 = G__372838;
        G__372819__372830 = G__372839;
        continue
      }else {
      }
      break
    }
  }else {
  }
  cljs.core.swap_BANG_.call(null, tatame.client.editors.editors, cljs.core.assoc, id, editor__372816);
  return editor__372816
};
tatame.client.editors.write_frame_BANG_ = function write_frame_BANG_(id, html, clean) {
  if(cljs.core.truth_(clean)) {
    goog.dom.removeNode.call(null, tatame.client.editors.frame_el.call(null, id));
    goog.dom.getElement.call(null, id).innerHTML = tatame.client.editors.frame_template.call(null, id)
  }else {
  }
  var doc__372840 = tatame.client.editors.frame_doc.call(null, tatame.client.editors.frame_id.call(null, id));
  var G__372841__372842 = doc__372840;
  G__372841__372842.open();
  G__372841__372842.write(html);
  G__372841__372842.close();
  return G__372841__372842
};
tatame.client.editors.refresh_canvas_BANG_ = function refresh_canvas_BANG_() {
  var html__372844 = tatame.client.editors.content.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, "html-editor"));
  var js__372845 = cljs.core.deref.call(null, tatame.client.editors.stable_js).call(null, "js-editor");
  var content__372846 = clojure.string.replace_first.call(null, html__372844, "{{code}}", js__372845);
  tatame.client.editors.write_frame_BANG_.call(null, "canvas", content__372846, false);
  return true
};
tatame.client.editors.run_if_stable_BANG_ = function run_if_stable_BANG_(id, f) {
  var editor__372847 = cljs.core.deref.call(null, tatame.client.editors.editors).call(null, id);
  var annotations__372848 = tatame.client.editors.session.call(null, editor__372847).$annotations;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.some.call(null, function(p1__372843_SHARP_) {
    return cljs.core._EQ_.call(null, p1__372843_SHARP_.type, "error")
  }, goog.object.getKeys.call(null, annotations__372848))))) {
    cljs.core.swap_BANG_.call(null, tatame.client.editors.stable_js, cljs.core.assoc, id, tatame.client.editors.content.call(null, editor__372847));
    f.call(null)
  }else {
  }
  return true
};
tatame.client.editors.run_tests_BANG_ = function run_tests_BANG_() {
  var tests__372849 = tatame.client.editors.content.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, "test-editor"));
  var source__372850 = cljs.core.deref.call(null, tatame.client.editors.stable_js).call(null, "js-editor");
  var html__372851 = clojure.string.replace_first.call(null, tatame.client.editors.jasmine_template, "{{code}}", cljs.core.str.call(null, tests__372849, source__372850));
  return tatame.client.editors.write_frame_BANG_.call(null, "jasmine", html__372851, true)
};
tatame.client.editors.delay_buffered = function delay_buffered(f, ms) {
  var timer__372852 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__372856__delegate = function(args) {
      var temp__3695__auto____372853 = cljs.core.deref.call(null, timer__372852).call(null, args);
      if(cljs.core.truth_(temp__3695__auto____372853)) {
        var t__372854 = temp__3695__auto____372853;
        window.clearTimeout(t__372854)
      }else {
      }
      var t__372855 = window.setTimeout(function() {
        cljs.core.swap_BANG_.call(null, timer__372852, cljs.core.assoc, args, null);
        return cljs.core.apply.call(null, f, args)
      }, ms);
      return cljs.core.swap_BANG_.call(null, timer__372852, cljs.core.assoc, args, t__372855)
    };
    var G__372856 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__372856__delegate.call(this, args)
    };
    G__372856.cljs$lang$maxFixedArity = 0;
    G__372856.cljs$lang$applyTo = function(arglist__372857) {
      var args = cljs.core.seq(arglist__372857);
      return G__372856__delegate.call(this, args)
    };
    return G__372856
  }()
};
tatame.client.editors.save_state_BANG_ = function save_state_BANG_(id) {
  return localStorage.setItem(id, tatame.client.editors.content.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, id)))
};
tatame.client.editors.load_state_BANG_ = function load_state_BANG_(id) {
  var temp__3698__auto____372858 = localStorage.getItem(id);
  if(cljs.core.truth_(temp__3698__auto____372858)) {
    var content__372859 = temp__3698__auto____372858;
    return tatame.client.editors.session.call(null, cljs.core.deref.call(null, tatame.client.editors.editors).call(null, id)).setValue(content__372859)
  }else {
    return null
  }
};
tatame.client.editors.run_tests_BANG_ = tatame.client.editors.delay_buffered.call(null, tatame.client.editors.run_tests_BANG_, 500);
tatame.client.editors.refresh_canvas_BANG_ = tatame.client.editors.delay_buffered.call(null, tatame.client.editors.refresh_canvas_BANG_, 200);
tatame.client.editors.init_BANG_ = function init_BANG_() {
  var send_event_BANG___372860 = function(id, data) {
    data.editor = id;
    return tatame.client.model.emit_event_BANG_.call(null, data)
  };
  var onchange__372861 = cljs.core.juxt.call(null, send_event_BANG___372860, tatame.client.editors.save_state_BANG_);
  var editors__372862 = cljs.core.ObjMap.fromObject(["html-editor", "js-editor", "test-editor"], {"html-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change"], {"\ufdd0'mode":"ace/mode/html", "change":function(id, event) {
    tatame.client.editors.refresh_canvas_BANG_.call(null);
    return onchange__372861.call(null, id, event)
  }}), "js-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change", "changeAnnotation"], {"\ufdd0'mode":"ace/mode/javascript", "change":onchange__372861, "changeAnnotation":function(id) {
    return tatame.client.editors.run_if_stable_BANG_.call(null, id, cljs.core.juxt.call(null, tatame.client.editors.refresh_canvas_BANG_, tatame.client.editors.run_tests_BANG_))
  }}), "test-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change", "changeAnnotation"], {"\ufdd0'mode":"ace/mode/javascript", "change":onchange__372861, "changeAnnotation":function(id) {
    return tatame.client.editors.run_if_stable_BANG_.call(null, id, tatame.client.editors.run_tests_BANG_)
  }})});
  var G__372863__372864 = cljs.core.seq.call(null, editors__372862);
  if(cljs.core.truth_(G__372863__372864)) {
    var G__372866__372868 = cljs.core.first.call(null, G__372863__372864);
    var vec__372867__372869 = G__372866__372868;
    var id__372870 = cljs.core.nth.call(null, vec__372867__372869, 0, null);
    var opts__372871 = cljs.core.nth.call(null, vec__372867__372869, 1, null);
    var G__372863__372872 = G__372863__372864;
    var G__372866__372873 = G__372866__372868;
    var G__372863__372874 = G__372863__372872;
    while(true) {
      var vec__372875__372876 = G__372866__372873;
      var id__372877 = cljs.core.nth.call(null, vec__372875__372876, 0, null);
      var opts__372878 = cljs.core.nth.call(null, vec__372875__372876, 1, null);
      var G__372863__372879 = G__372863__372874;
      tatame.client.editors.init_editor_BANG_.call(null, id__372877, "\ufdd0'mode".call(null, opts__372878), cljs.core.dissoc.call(null, opts__372878, "\ufdd0'mode"));
      tatame.client.editors.load_state_BANG_.call(null, id__372877);
      var temp__3698__auto____372880 = cljs.core.next.call(null, G__372863__372879);
      if(cljs.core.truth_(temp__3698__auto____372880)) {
        var G__372863__372881 = temp__3698__auto____372880;
        var G__372882 = cljs.core.first.call(null, G__372863__372881);
        var G__372883 = G__372863__372881;
        G__372866__372873 = G__372882;
        G__372863__372874 = G__372883;
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
        return cljs.core.reduce.call(null, function(m, p__375328) {
          var vec__375329__375330 = p__375328;
          var k__375331 = cljs.core.nth.call(null, vec__375329__375330, 0, null);
          var v__375332 = cljs.core.nth.call(null, vec__375329__375330, 1, null);
          return cljs.core.assoc.call(null, m, clj__GT_js.call(null, k__375331), clj__GT_js.call(null, v__375332))
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
      var vec__375309__375310 = route;
      var m__375311 = cljs.core.nth.call(null, vec__375309__375310, 0, null);
      var u__375312 = cljs.core.nth.call(null, vec__375309__375310, 1, null);
      return cljs.core.PersistentVector.fromArray([fetch.core.__GT_method.call(null, m__375311), u__375312])
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
  var cur__375313 = fetch.util.clj__GT_js.call(null, d);
  var query__375314 = goog.Uri.QueryData.createFromMap.call(null, new goog.structs.Map(cur__375313));
  return cljs.core.str.call(null, query__375314)
};
fetch.core.__GT_callback = function __GT_callback(callback) {
  if(cljs.core.truth_(callback)) {
    return function(req) {
      var data__375315 = req.getResponseText();
      return callback.call(null, data__375315)
    }
  }else {
    return null
  }
};
fetch.core.xhr = function() {
  var xhr__delegate = function(route, content, callback, p__375316) {
    var vec__375317__375318 = p__375316;
    var opts__375319 = cljs.core.nth.call(null, vec__375317__375318, 0, null);
    var req__375321 = new goog.net.XhrIo;
    var vec__375320__375322 = fetch.core.parse_route.call(null, route);
    var method__375323 = cljs.core.nth.call(null, vec__375320__375322, 0, null);
    var uri__375324 = cljs.core.nth.call(null, vec__375320__375322, 1, null);
    var data__375325 = fetch.core.__GT_data.call(null, content);
    var callback__375326 = fetch.core.__GT_callback.call(null, callback);
    if(cljs.core.truth_(callback__375326)) {
      goog.events.listen.call(null, req__375321, goog.net.EventType.COMPLETE, function() {
        return callback__375326.call(null, req__375321)
      })
    }else {
    }
    return req__375321.send(uri__375324, method__375323, data__375325, cljs.core.truth_(opts__375319) ? fetch.util.clj__GT_js.call(null, opts__375319) : null)
  };
  var xhr = function(route, content, callback, var_args) {
    var p__375316 = null;
    if(goog.isDef(var_args)) {
      p__375316 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return xhr__delegate.call(this, route, content, callback, p__375316)
  };
  xhr.cljs$lang$maxFixedArity = 3;
  xhr.cljs$lang$applyTo = function(arglist__375327) {
    var route = cljs.core.first(arglist__375327);
    var content = cljs.core.first(cljs.core.next(arglist__375327));
    var callback = cljs.core.first(cljs.core.next(cljs.core.next(arglist__375327)));
    var p__375316 = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__375327)));
    return xhr__delegate.call(this, route, content, callback, p__375316)
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
    var data__375308 = cljs.core.truth_(cljs.core._EQ_.call(null, data, "")) ? "nil" : data;
    return callback.call(null, cljs.reader.read_string.call(null, data__375308))
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
  return console.log("on navigate", e)
};
tatame.client.main.init_BANG_ = function init_BANG_() {
  waltz.state.set.call(null, tatame.client.model.app, "\ufdd0'loading");
  tatame.client.model.init_BANG_.call(null);
  return waltz.history.listen.call(null, tatame.client.main.on_navigate)
};
window.onload = tatame.client.main.init_BANG_;

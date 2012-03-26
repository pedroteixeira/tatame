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
  var or__3548__auto____127709 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____127709)) {
    return or__3548__auto____127709
  }else {
    var or__3548__auto____127710 = p["_"];
    if(cljs.core.truth_(or__3548__auto____127710)) {
      return or__3548__auto____127710
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
  var _invoke__127774 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127711 = this$;
      if(cljs.core.truth_(and__3546__auto____127711)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127711
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____127712 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127712)) {
          return or__3548__auto____127712
        }else {
          var or__3548__auto____127713 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127713)) {
            return or__3548__auto____127713
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__127775 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127714 = this$;
      if(cljs.core.truth_(and__3546__auto____127714)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127714
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____127715 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127715)) {
          return or__3548__auto____127715
        }else {
          var or__3548__auto____127716 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127716)) {
            return or__3548__auto____127716
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__127776 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127717 = this$;
      if(cljs.core.truth_(and__3546__auto____127717)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127717
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____127718 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127718)) {
          return or__3548__auto____127718
        }else {
          var or__3548__auto____127719 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127719)) {
            return or__3548__auto____127719
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__127777 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127720 = this$;
      if(cljs.core.truth_(and__3546__auto____127720)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127720
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____127721 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127721)) {
          return or__3548__auto____127721
        }else {
          var or__3548__auto____127722 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127722)) {
            return or__3548__auto____127722
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__127778 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127723 = this$;
      if(cljs.core.truth_(and__3546__auto____127723)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127723
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____127724 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127724)) {
          return or__3548__auto____127724
        }else {
          var or__3548__auto____127725 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127725)) {
            return or__3548__auto____127725
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__127779 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127726 = this$;
      if(cljs.core.truth_(and__3546__auto____127726)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127726
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____127727 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127727)) {
          return or__3548__auto____127727
        }else {
          var or__3548__auto____127728 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127728)) {
            return or__3548__auto____127728
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__127780 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127729 = this$;
      if(cljs.core.truth_(and__3546__auto____127729)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127729
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____127730 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127730)) {
          return or__3548__auto____127730
        }else {
          var or__3548__auto____127731 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127731)) {
            return or__3548__auto____127731
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__127781 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127732 = this$;
      if(cljs.core.truth_(and__3546__auto____127732)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127732
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____127733 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127733)) {
          return or__3548__auto____127733
        }else {
          var or__3548__auto____127734 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127734)) {
            return or__3548__auto____127734
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__127782 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127735 = this$;
      if(cljs.core.truth_(and__3546__auto____127735)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127735
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____127736 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127736)) {
          return or__3548__auto____127736
        }else {
          var or__3548__auto____127737 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127737)) {
            return or__3548__auto____127737
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__127783 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127738 = this$;
      if(cljs.core.truth_(and__3546__auto____127738)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127738
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____127739 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127739)) {
          return or__3548__auto____127739
        }else {
          var or__3548__auto____127740 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127740)) {
            return or__3548__auto____127740
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__127784 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127741 = this$;
      if(cljs.core.truth_(and__3546__auto____127741)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127741
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____127742 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127742)) {
          return or__3548__auto____127742
        }else {
          var or__3548__auto____127743 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127743)) {
            return or__3548__auto____127743
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__127785 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127744 = this$;
      if(cljs.core.truth_(and__3546__auto____127744)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127744
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____127745 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127745)) {
          return or__3548__auto____127745
        }else {
          var or__3548__auto____127746 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127746)) {
            return or__3548__auto____127746
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__127786 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127747 = this$;
      if(cljs.core.truth_(and__3546__auto____127747)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127747
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____127748 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127748)) {
          return or__3548__auto____127748
        }else {
          var or__3548__auto____127749 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127749)) {
            return or__3548__auto____127749
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__127787 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127750 = this$;
      if(cljs.core.truth_(and__3546__auto____127750)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127750
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____127751 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127751)) {
          return or__3548__auto____127751
        }else {
          var or__3548__auto____127752 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127752)) {
            return or__3548__auto____127752
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__127788 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127753 = this$;
      if(cljs.core.truth_(and__3546__auto____127753)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127753
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____127754 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127754)) {
          return or__3548__auto____127754
        }else {
          var or__3548__auto____127755 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127755)) {
            return or__3548__auto____127755
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__127789 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127756 = this$;
      if(cljs.core.truth_(and__3546__auto____127756)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127756
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____127757 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127757)) {
          return or__3548__auto____127757
        }else {
          var or__3548__auto____127758 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127758)) {
            return or__3548__auto____127758
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__127790 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127759 = this$;
      if(cljs.core.truth_(and__3546__auto____127759)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127759
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____127760 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127760)) {
          return or__3548__auto____127760
        }else {
          var or__3548__auto____127761 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127761)) {
            return or__3548__auto____127761
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__127791 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127762 = this$;
      if(cljs.core.truth_(and__3546__auto____127762)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127762
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____127763 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127763)) {
          return or__3548__auto____127763
        }else {
          var or__3548__auto____127764 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127764)) {
            return or__3548__auto____127764
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__127792 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127765 = this$;
      if(cljs.core.truth_(and__3546__auto____127765)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127765
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____127766 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127766)) {
          return or__3548__auto____127766
        }else {
          var or__3548__auto____127767 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127767)) {
            return or__3548__auto____127767
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__127793 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127768 = this$;
      if(cljs.core.truth_(and__3546__auto____127768)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127768
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____127769 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127769)) {
          return or__3548__auto____127769
        }else {
          var or__3548__auto____127770 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127770)) {
            return or__3548__auto____127770
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__127794 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127771 = this$;
      if(cljs.core.truth_(and__3546__auto____127771)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____127771
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____127772 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____127772)) {
          return or__3548__auto____127772
        }else {
          var or__3548__auto____127773 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____127773)) {
            return or__3548__auto____127773
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
        return _invoke__127774.call(this, this$);
      case 2:
        return _invoke__127775.call(this, this$, a);
      case 3:
        return _invoke__127776.call(this, this$, a, b);
      case 4:
        return _invoke__127777.call(this, this$, a, b, c);
      case 5:
        return _invoke__127778.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__127779.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__127780.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__127781.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__127782.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__127783.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__127784.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__127785.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__127786.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__127787.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__127788.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__127789.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__127790.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__127791.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__127792.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__127793.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__127794.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127796 = coll;
    if(cljs.core.truth_(and__3546__auto____127796)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____127796
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____127797 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127797)) {
        return or__3548__auto____127797
      }else {
        var or__3548__auto____127798 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____127798)) {
          return or__3548__auto____127798
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
    var and__3546__auto____127799 = coll;
    if(cljs.core.truth_(and__3546__auto____127799)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____127799
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____127800 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127800)) {
        return or__3548__auto____127800
      }else {
        var or__3548__auto____127801 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____127801)) {
          return or__3548__auto____127801
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
    var and__3546__auto____127802 = coll;
    if(cljs.core.truth_(and__3546__auto____127802)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____127802
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____127803 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127803)) {
        return or__3548__auto____127803
      }else {
        var or__3548__auto____127804 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____127804)) {
          return or__3548__auto____127804
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
  var _nth__127811 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127805 = coll;
      if(cljs.core.truth_(and__3546__auto____127805)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____127805
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____127806 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____127806)) {
          return or__3548__auto____127806
        }else {
          var or__3548__auto____127807 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____127807)) {
            return or__3548__auto____127807
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__127812 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127808 = coll;
      if(cljs.core.truth_(and__3546__auto____127808)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____127808
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____127809 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____127809)) {
          return or__3548__auto____127809
        }else {
          var or__3548__auto____127810 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____127810)) {
            return or__3548__auto____127810
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
        return _nth__127811.call(this, coll, n);
      case 3:
        return _nth__127812.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127814 = coll;
    if(cljs.core.truth_(and__3546__auto____127814)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____127814
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____127815 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127815)) {
        return or__3548__auto____127815
      }else {
        var or__3548__auto____127816 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____127816)) {
          return or__3548__auto____127816
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127817 = coll;
    if(cljs.core.truth_(and__3546__auto____127817)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____127817
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____127818 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127818)) {
        return or__3548__auto____127818
      }else {
        var or__3548__auto____127819 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____127819)) {
          return or__3548__auto____127819
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
  var _lookup__127826 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127820 = o;
      if(cljs.core.truth_(and__3546__auto____127820)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____127820
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____127821 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____127821)) {
          return or__3548__auto____127821
        }else {
          var or__3548__auto____127822 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____127822)) {
            return or__3548__auto____127822
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__127827 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127823 = o;
      if(cljs.core.truth_(and__3546__auto____127823)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____127823
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____127824 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____127824)) {
          return or__3548__auto____127824
        }else {
          var or__3548__auto____127825 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____127825)) {
            return or__3548__auto____127825
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
        return _lookup__127826.call(this, o, k);
      case 3:
        return _lookup__127827.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127829 = coll;
    if(cljs.core.truth_(and__3546__auto____127829)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____127829
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____127830 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127830)) {
        return or__3548__auto____127830
      }else {
        var or__3548__auto____127831 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____127831)) {
          return or__3548__auto____127831
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127832 = coll;
    if(cljs.core.truth_(and__3546__auto____127832)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____127832
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____127833 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127833)) {
        return or__3548__auto____127833
      }else {
        var or__3548__auto____127834 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____127834)) {
          return or__3548__auto____127834
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
    var and__3546__auto____127835 = coll;
    if(cljs.core.truth_(and__3546__auto____127835)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____127835
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____127836 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127836)) {
        return or__3548__auto____127836
      }else {
        var or__3548__auto____127837 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____127837)) {
          return or__3548__auto____127837
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
    var and__3546__auto____127838 = coll;
    if(cljs.core.truth_(and__3546__auto____127838)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____127838
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____127839 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127839)) {
        return or__3548__auto____127839
      }else {
        var or__3548__auto____127840 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____127840)) {
          return or__3548__auto____127840
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
    var and__3546__auto____127841 = coll;
    if(cljs.core.truth_(and__3546__auto____127841)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____127841
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____127842 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127842)) {
        return or__3548__auto____127842
      }else {
        var or__3548__auto____127843 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____127843)) {
          return or__3548__auto____127843
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127844 = coll;
    if(cljs.core.truth_(and__3546__auto____127844)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____127844
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____127845 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127845)) {
        return or__3548__auto____127845
      }else {
        var or__3548__auto____127846 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____127846)) {
          return or__3548__auto____127846
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
    var and__3546__auto____127847 = coll;
    if(cljs.core.truth_(and__3546__auto____127847)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____127847
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____127848 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____127848)) {
        return or__3548__auto____127848
      }else {
        var or__3548__auto____127849 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____127849)) {
          return or__3548__auto____127849
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
    var and__3546__auto____127850 = o;
    if(cljs.core.truth_(and__3546__auto____127850)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____127850
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____127851 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127851)) {
        return or__3548__auto____127851
      }else {
        var or__3548__auto____127852 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____127852)) {
          return or__3548__auto____127852
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
    var and__3546__auto____127853 = o;
    if(cljs.core.truth_(and__3546__auto____127853)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____127853
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____127854 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127854)) {
        return or__3548__auto____127854
      }else {
        var or__3548__auto____127855 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____127855)) {
          return or__3548__auto____127855
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
    var and__3546__auto____127856 = o;
    if(cljs.core.truth_(and__3546__auto____127856)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____127856
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____127857 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127857)) {
        return or__3548__auto____127857
      }else {
        var or__3548__auto____127858 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____127858)) {
          return or__3548__auto____127858
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
    var and__3546__auto____127859 = o;
    if(cljs.core.truth_(and__3546__auto____127859)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____127859
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____127860 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127860)) {
        return or__3548__auto____127860
      }else {
        var or__3548__auto____127861 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____127861)) {
          return or__3548__auto____127861
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
  var _reduce__127868 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127862 = coll;
      if(cljs.core.truth_(and__3546__auto____127862)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____127862
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____127863 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____127863)) {
          return or__3548__auto____127863
        }else {
          var or__3548__auto____127864 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____127864)) {
            return or__3548__auto____127864
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__127869 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____127865 = coll;
      if(cljs.core.truth_(and__3546__auto____127865)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____127865
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____127866 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____127866)) {
          return or__3548__auto____127866
        }else {
          var or__3548__auto____127867 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____127867)) {
            return or__3548__auto____127867
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
        return _reduce__127868.call(this, coll, f);
      case 3:
        return _reduce__127869.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127871 = o;
    if(cljs.core.truth_(and__3546__auto____127871)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____127871
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____127872 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127872)) {
        return or__3548__auto____127872
      }else {
        var or__3548__auto____127873 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____127873)) {
          return or__3548__auto____127873
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
    var and__3546__auto____127874 = o;
    if(cljs.core.truth_(and__3546__auto____127874)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____127874
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____127875 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127875)) {
        return or__3548__auto____127875
      }else {
        var or__3548__auto____127876 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____127876)) {
          return or__3548__auto____127876
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
    var and__3546__auto____127877 = o;
    if(cljs.core.truth_(and__3546__auto____127877)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____127877
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____127878 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127878)) {
        return or__3548__auto____127878
      }else {
        var or__3548__auto____127879 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____127879)) {
          return or__3548__auto____127879
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
    var and__3546__auto____127880 = o;
    if(cljs.core.truth_(and__3546__auto____127880)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____127880
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____127881 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____127881)) {
        return or__3548__auto____127881
      }else {
        var or__3548__auto____127882 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____127882)) {
          return or__3548__auto____127882
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
    var and__3546__auto____127883 = d;
    if(cljs.core.truth_(and__3546__auto____127883)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____127883
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____127884 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____127884)) {
        return or__3548__auto____127884
      }else {
        var or__3548__auto____127885 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____127885)) {
          return or__3548__auto____127885
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
    var and__3546__auto____127886 = this$;
    if(cljs.core.truth_(and__3546__auto____127886)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____127886
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____127887 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____127887)) {
        return or__3548__auto____127887
      }else {
        var or__3548__auto____127888 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____127888)) {
          return or__3548__auto____127888
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127889 = this$;
    if(cljs.core.truth_(and__3546__auto____127889)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____127889
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____127890 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____127890)) {
        return or__3548__auto____127890
      }else {
        var or__3548__auto____127891 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____127891)) {
          return or__3548__auto____127891
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____127892 = this$;
    if(cljs.core.truth_(and__3546__auto____127892)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____127892
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____127893 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____127893)) {
        return or__3548__auto____127893
      }else {
        var or__3548__auto____127894 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____127894)) {
          return or__3548__auto____127894
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
  var G__127895 = null;
  var G__127895__127896 = function(o, k) {
    return null
  };
  var G__127895__127897 = function(o, k, not_found) {
    return not_found
  };
  G__127895 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__127895__127896.call(this, o, k);
      case 3:
        return G__127895__127897.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127895
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
  var G__127899 = null;
  var G__127899__127900 = function(_, f) {
    return f.call(null)
  };
  var G__127899__127901 = function(_, f, start) {
    return start
  };
  G__127899 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__127899__127900.call(this, _, f);
      case 3:
        return G__127899__127901.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127899
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
  var G__127903 = null;
  var G__127903__127904 = function(_, n) {
    return null
  };
  var G__127903__127905 = function(_, n, not_found) {
    return not_found
  };
  G__127903 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__127903__127904.call(this, _, n);
      case 3:
        return G__127903__127905.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127903
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
  var ci_reduce__127913 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__127907 = cljs.core._nth.call(null, cicoll, 0);
      var n__127908 = 1;
      while(true) {
        if(cljs.core.truth_(n__127908 < cljs.core._count.call(null, cicoll))) {
          var G__127917 = f.call(null, val__127907, cljs.core._nth.call(null, cicoll, n__127908));
          var G__127918 = n__127908 + 1;
          val__127907 = G__127917;
          n__127908 = G__127918;
          continue
        }else {
          return val__127907
        }
        break
      }
    }
  };
  var ci_reduce__127914 = function(cicoll, f, val) {
    var val__127909 = val;
    var n__127910 = 0;
    while(true) {
      if(cljs.core.truth_(n__127910 < cljs.core._count.call(null, cicoll))) {
        var G__127919 = f.call(null, val__127909, cljs.core._nth.call(null, cicoll, n__127910));
        var G__127920 = n__127910 + 1;
        val__127909 = G__127919;
        n__127910 = G__127920;
        continue
      }else {
        return val__127909
      }
      break
    }
  };
  var ci_reduce__127915 = function(cicoll, f, val, idx) {
    var val__127911 = val;
    var n__127912 = idx;
    while(true) {
      if(cljs.core.truth_(n__127912 < cljs.core._count.call(null, cicoll))) {
        var G__127921 = f.call(null, val__127911, cljs.core._nth.call(null, cicoll, n__127912));
        var G__127922 = n__127912 + 1;
        val__127911 = G__127921;
        n__127912 = G__127922;
        continue
      }else {
        return val__127911
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__127913.call(this, cicoll, f);
      case 3:
        return ci_reduce__127914.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__127915.call(this, cicoll, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ci_reduce
}();
cljs.core.IndexedSeq = function(a, i) {
  this.a = a;
  this.i = i
};
cljs.core.IndexedSeq.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.IndexedSeq")
};
cljs.core.IndexedSeq.prototype.cljs$core$IHash$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__127923 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__127936 = null;
  var G__127936__127937 = function(_, f) {
    var this__127924 = this;
    return cljs.core.ci_reduce.call(null, this__127924.a, f, this__127924.a[this__127924.i], this__127924.i + 1)
  };
  var G__127936__127938 = function(_, f, start) {
    var this__127925 = this;
    return cljs.core.ci_reduce.call(null, this__127925.a, f, start, this__127925.i)
  };
  G__127936 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__127936__127937.call(this, _, f);
      case 3:
        return G__127936__127938.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127936
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__127926 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__127927 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__127940 = null;
  var G__127940__127941 = function(coll, n) {
    var this__127928 = this;
    var i__127929 = n + this__127928.i;
    if(cljs.core.truth_(i__127929 < this__127928.a.length)) {
      return this__127928.a[i__127929]
    }else {
      return null
    }
  };
  var G__127940__127942 = function(coll, n, not_found) {
    var this__127930 = this;
    var i__127931 = n + this__127930.i;
    if(cljs.core.truth_(i__127931 < this__127930.a.length)) {
      return this__127930.a[i__127931]
    }else {
      return not_found
    }
  };
  G__127940 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__127940__127941.call(this, coll, n);
      case 3:
        return G__127940__127942.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127940
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__127932 = this;
  return this__127932.a.length - this__127932.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__127933 = this;
  return this__127933.a[this__127933.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__127934 = this;
  if(cljs.core.truth_(this__127934.i + 1 < this__127934.a.length)) {
    return new cljs.core.IndexedSeq(this__127934.a, this__127934.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__127935 = this;
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
  var G__127944 = null;
  var G__127944__127945 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__127944__127946 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__127944 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__127944__127945.call(this, array, f);
      case 3:
        return G__127944__127946.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127944
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__127948 = null;
  var G__127948__127949 = function(array, k) {
    return array[k]
  };
  var G__127948__127950 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__127948 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__127948__127949.call(this, array, k);
      case 3:
        return G__127948__127950.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127948
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__127952 = null;
  var G__127952__127953 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__127952__127954 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__127952 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__127952__127953.call(this, array, n);
      case 3:
        return G__127952__127954.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__127952
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
  var temp__3698__auto____127956 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____127956)) {
    var s__127957 = temp__3698__auto____127956;
    return cljs.core._first.call(null, s__127957)
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
      var G__127958 = cljs.core.next.call(null, s);
      s = G__127958;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__127959 = cljs.core.seq.call(null, x);
  var n__127960 = 0;
  while(true) {
    if(cljs.core.truth_(s__127959)) {
      var G__127961 = cljs.core.next.call(null, s__127959);
      var G__127962 = n__127960 + 1;
      s__127959 = G__127961;
      n__127960 = G__127962;
      continue
    }else {
      return n__127960
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
  var conj__127963 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__127964 = function() {
    var G__127966__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__127967 = conj.call(null, coll, x);
          var G__127968 = cljs.core.first.call(null, xs);
          var G__127969 = cljs.core.next.call(null, xs);
          coll = G__127967;
          x = G__127968;
          xs = G__127969;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__127966 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__127966__delegate.call(this, coll, x, xs)
    };
    G__127966.cljs$lang$maxFixedArity = 2;
    G__127966.cljs$lang$applyTo = function(arglist__127970) {
      var coll = cljs.core.first(arglist__127970);
      var x = cljs.core.first(cljs.core.next(arglist__127970));
      var xs = cljs.core.rest(cljs.core.next(arglist__127970));
      return G__127966__delegate.call(this, coll, x, xs)
    };
    return G__127966
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__127963.call(this, coll, x);
      default:
        return conj__127964.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__127964.cljs$lang$applyTo;
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
  var nth__127971 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__127972 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__127971.call(this, coll, n);
      case 3:
        return nth__127972.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__127974 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__127975 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__127974.call(this, o, k);
      case 3:
        return get__127975.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__127978 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__127979 = function() {
    var G__127981__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__127977 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__127982 = ret__127977;
          var G__127983 = cljs.core.first.call(null, kvs);
          var G__127984 = cljs.core.second.call(null, kvs);
          var G__127985 = cljs.core.nnext.call(null, kvs);
          coll = G__127982;
          k = G__127983;
          v = G__127984;
          kvs = G__127985;
          continue
        }else {
          return ret__127977
        }
        break
      }
    };
    var G__127981 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__127981__delegate.call(this, coll, k, v, kvs)
    };
    G__127981.cljs$lang$maxFixedArity = 3;
    G__127981.cljs$lang$applyTo = function(arglist__127986) {
      var coll = cljs.core.first(arglist__127986);
      var k = cljs.core.first(cljs.core.next(arglist__127986));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__127986)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__127986)));
      return G__127981__delegate.call(this, coll, k, v, kvs)
    };
    return G__127981
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__127978.call(this, coll, k, v);
      default:
        return assoc__127979.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__127979.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__127988 = function(coll) {
    return coll
  };
  var dissoc__127989 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__127990 = function() {
    var G__127992__delegate = function(coll, k, ks) {
      while(true) {
        var ret__127987 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__127993 = ret__127987;
          var G__127994 = cljs.core.first.call(null, ks);
          var G__127995 = cljs.core.next.call(null, ks);
          coll = G__127993;
          k = G__127994;
          ks = G__127995;
          continue
        }else {
          return ret__127987
        }
        break
      }
    };
    var G__127992 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__127992__delegate.call(this, coll, k, ks)
    };
    G__127992.cljs$lang$maxFixedArity = 2;
    G__127992.cljs$lang$applyTo = function(arglist__127996) {
      var coll = cljs.core.first(arglist__127996);
      var k = cljs.core.first(cljs.core.next(arglist__127996));
      var ks = cljs.core.rest(cljs.core.next(arglist__127996));
      return G__127992__delegate.call(this, coll, k, ks)
    };
    return G__127992
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__127988.call(this, coll);
      case 2:
        return dissoc__127989.call(this, coll, k);
      default:
        return dissoc__127990.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__127990.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__450__auto____127997 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____127998 = x__450__auto____127997;
      if(cljs.core.truth_(and__3546__auto____127998)) {
        var and__3546__auto____127999 = x__450__auto____127997.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____127999)) {
          return cljs.core.not.call(null, x__450__auto____127997.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____127999
        }
      }else {
        return and__3546__auto____127998
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____127997)
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
  var disj__128001 = function(coll) {
    return coll
  };
  var disj__128002 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__128003 = function() {
    var G__128005__delegate = function(coll, k, ks) {
      while(true) {
        var ret__128000 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__128006 = ret__128000;
          var G__128007 = cljs.core.first.call(null, ks);
          var G__128008 = cljs.core.next.call(null, ks);
          coll = G__128006;
          k = G__128007;
          ks = G__128008;
          continue
        }else {
          return ret__128000
        }
        break
      }
    };
    var G__128005 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128005__delegate.call(this, coll, k, ks)
    };
    G__128005.cljs$lang$maxFixedArity = 2;
    G__128005.cljs$lang$applyTo = function(arglist__128009) {
      var coll = cljs.core.first(arglist__128009);
      var k = cljs.core.first(cljs.core.next(arglist__128009));
      var ks = cljs.core.rest(cljs.core.next(arglist__128009));
      return G__128005__delegate.call(this, coll, k, ks)
    };
    return G__128005
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__128001.call(this, coll);
      case 2:
        return disj__128002.call(this, coll, k);
      default:
        return disj__128003.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__128003.cljs$lang$applyTo;
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
    var x__450__auto____128010 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____128011 = x__450__auto____128010;
      if(cljs.core.truth_(and__3546__auto____128011)) {
        var and__3546__auto____128012 = x__450__auto____128010.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____128012)) {
          return cljs.core.not.call(null, x__450__auto____128010.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____128012
        }
      }else {
        return and__3546__auto____128011
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__450__auto____128010)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____128013 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____128014 = x__450__auto____128013;
      if(cljs.core.truth_(and__3546__auto____128014)) {
        var and__3546__auto____128015 = x__450__auto____128013.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____128015)) {
          return cljs.core.not.call(null, x__450__auto____128013.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____128015
        }
      }else {
        return and__3546__auto____128014
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__450__auto____128013)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__450__auto____128016 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____128017 = x__450__auto____128016;
    if(cljs.core.truth_(and__3546__auto____128017)) {
      var and__3546__auto____128018 = x__450__auto____128016.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____128018)) {
        return cljs.core.not.call(null, x__450__auto____128016.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____128018
      }
    }else {
      return and__3546__auto____128017
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__450__auto____128016)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__450__auto____128019 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____128020 = x__450__auto____128019;
    if(cljs.core.truth_(and__3546__auto____128020)) {
      var and__3546__auto____128021 = x__450__auto____128019.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____128021)) {
        return cljs.core.not.call(null, x__450__auto____128019.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____128021
      }
    }else {
      return and__3546__auto____128020
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__450__auto____128019)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__450__auto____128022 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____128023 = x__450__auto____128022;
    if(cljs.core.truth_(and__3546__auto____128023)) {
      var and__3546__auto____128024 = x__450__auto____128022.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____128024)) {
        return cljs.core.not.call(null, x__450__auto____128022.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____128024
      }
    }else {
      return and__3546__auto____128023
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__450__auto____128022)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____128025 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____128026 = x__450__auto____128025;
      if(cljs.core.truth_(and__3546__auto____128026)) {
        var and__3546__auto____128027 = x__450__auto____128025.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____128027)) {
          return cljs.core.not.call(null, x__450__auto____128025.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____128027
        }
      }else {
        return and__3546__auto____128026
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__450__auto____128025)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__450__auto____128028 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____128029 = x__450__auto____128028;
    if(cljs.core.truth_(and__3546__auto____128029)) {
      var and__3546__auto____128030 = x__450__auto____128028.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____128030)) {
        return cljs.core.not.call(null, x__450__auto____128028.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____128030
      }
    }else {
      return and__3546__auto____128029
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__450__auto____128028)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__128031 = cljs.core.array.call(null);
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__128031.push(key)
  });
  return keys__128031
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
    var x__450__auto____128032 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____128033 = x__450__auto____128032;
      if(cljs.core.truth_(and__3546__auto____128033)) {
        var and__3546__auto____128034 = x__450__auto____128032.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____128034)) {
          return cljs.core.not.call(null, x__450__auto____128032.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____128034
        }
      }else {
        return and__3546__auto____128033
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__450__auto____128032)
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
  var and__3546__auto____128035 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____128035)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____128036 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____128036)) {
        return or__3548__auto____128036
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____128035
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____128037 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____128037)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____128037
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____128038 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____128038)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____128038
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____128039 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____128039)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____128039
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
    var and__3546__auto____128040 = coll;
    if(cljs.core.truth_(and__3546__auto____128040)) {
      var and__3546__auto____128041 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____128041)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____128041
      }
    }else {
      return and__3546__auto____128040
    }
  }())) {
    return cljs.core.Vector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___128046 = function(x) {
    return true
  };
  var distinct_QMARK___128047 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___128048 = function() {
    var G__128050__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__128042 = cljs.core.set([y, x]);
        var xs__128043 = more;
        while(true) {
          var x__128044 = cljs.core.first.call(null, xs__128043);
          var etc__128045 = cljs.core.next.call(null, xs__128043);
          if(cljs.core.truth_(xs__128043)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__128042, x__128044))) {
              return false
            }else {
              var G__128051 = cljs.core.conj.call(null, s__128042, x__128044);
              var G__128052 = etc__128045;
              s__128042 = G__128051;
              xs__128043 = G__128052;
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
    var G__128050 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128050__delegate.call(this, x, y, more)
    };
    G__128050.cljs$lang$maxFixedArity = 2;
    G__128050.cljs$lang$applyTo = function(arglist__128053) {
      var x = cljs.core.first(arglist__128053);
      var y = cljs.core.first(cljs.core.next(arglist__128053));
      var more = cljs.core.rest(cljs.core.next(arglist__128053));
      return G__128050__delegate.call(this, x, y, more)
    };
    return G__128050
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___128046.call(this, x);
      case 2:
        return distinct_QMARK___128047.call(this, x, y);
      default:
        return distinct_QMARK___128048.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___128048.cljs$lang$applyTo;
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
      var r__128054 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__128054))) {
        return r__128054
      }else {
        if(cljs.core.truth_(r__128054)) {
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
  var sort__128056 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__128057 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__128055 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__128055, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__128055)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__128056.call(this, comp);
      case 2:
        return sort__128057.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__128059 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__128060 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__128059.call(this, keyfn, comp);
      case 3:
        return sort_by__128060.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__128062 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__128063 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__128062.call(this, f, val);
      case 3:
        return reduce__128063.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__128069 = function(f, coll) {
    var temp__3695__auto____128065 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____128065)) {
      var s__128066 = temp__3695__auto____128065;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__128066), cljs.core.next.call(null, s__128066))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__128070 = function(f, val, coll) {
    var val__128067 = val;
    var coll__128068 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__128068)) {
        var G__128072 = f.call(null, val__128067, cljs.core.first.call(null, coll__128068));
        var G__128073 = cljs.core.next.call(null, coll__128068);
        val__128067 = G__128072;
        coll__128068 = G__128073;
        continue
      }else {
        return val__128067
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__128069.call(this, f, val);
      case 3:
        return seq_reduce__128070.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__128074 = null;
  var G__128074__128075 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__128074__128076 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__128074 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__128074__128075.call(this, coll, f);
      case 3:
        return G__128074__128076.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128074
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___128078 = function() {
    return 0
  };
  var _PLUS___128079 = function(x) {
    return x
  };
  var _PLUS___128080 = function(x, y) {
    return x + y
  };
  var _PLUS___128081 = function() {
    var G__128083__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__128083 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128083__delegate.call(this, x, y, more)
    };
    G__128083.cljs$lang$maxFixedArity = 2;
    G__128083.cljs$lang$applyTo = function(arglist__128084) {
      var x = cljs.core.first(arglist__128084);
      var y = cljs.core.first(cljs.core.next(arglist__128084));
      var more = cljs.core.rest(cljs.core.next(arglist__128084));
      return G__128083__delegate.call(this, x, y, more)
    };
    return G__128083
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___128078.call(this);
      case 1:
        return _PLUS___128079.call(this, x);
      case 2:
        return _PLUS___128080.call(this, x, y);
      default:
        return _PLUS___128081.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___128081.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___128085 = function(x) {
    return-x
  };
  var ___128086 = function(x, y) {
    return x - y
  };
  var ___128087 = function() {
    var G__128089__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__128089 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128089__delegate.call(this, x, y, more)
    };
    G__128089.cljs$lang$maxFixedArity = 2;
    G__128089.cljs$lang$applyTo = function(arglist__128090) {
      var x = cljs.core.first(arglist__128090);
      var y = cljs.core.first(cljs.core.next(arglist__128090));
      var more = cljs.core.rest(cljs.core.next(arglist__128090));
      return G__128089__delegate.call(this, x, y, more)
    };
    return G__128089
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___128085.call(this, x);
      case 2:
        return ___128086.call(this, x, y);
      default:
        return ___128087.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___128087.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___128091 = function() {
    return 1
  };
  var _STAR___128092 = function(x) {
    return x
  };
  var _STAR___128093 = function(x, y) {
    return x * y
  };
  var _STAR___128094 = function() {
    var G__128096__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__128096 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128096__delegate.call(this, x, y, more)
    };
    G__128096.cljs$lang$maxFixedArity = 2;
    G__128096.cljs$lang$applyTo = function(arglist__128097) {
      var x = cljs.core.first(arglist__128097);
      var y = cljs.core.first(cljs.core.next(arglist__128097));
      var more = cljs.core.rest(cljs.core.next(arglist__128097));
      return G__128096__delegate.call(this, x, y, more)
    };
    return G__128096
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___128091.call(this);
      case 1:
        return _STAR___128092.call(this, x);
      case 2:
        return _STAR___128093.call(this, x, y);
      default:
        return _STAR___128094.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___128094.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___128098 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___128099 = function(x, y) {
    return x / y
  };
  var _SLASH___128100 = function() {
    var G__128102__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__128102 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128102__delegate.call(this, x, y, more)
    };
    G__128102.cljs$lang$maxFixedArity = 2;
    G__128102.cljs$lang$applyTo = function(arglist__128103) {
      var x = cljs.core.first(arglist__128103);
      var y = cljs.core.first(cljs.core.next(arglist__128103));
      var more = cljs.core.rest(cljs.core.next(arglist__128103));
      return G__128102__delegate.call(this, x, y, more)
    };
    return G__128102
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___128098.call(this, x);
      case 2:
        return _SLASH___128099.call(this, x, y);
      default:
        return _SLASH___128100.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___128100.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___128104 = function(x) {
    return true
  };
  var _LT___128105 = function(x, y) {
    return x < y
  };
  var _LT___128106 = function() {
    var G__128108__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__128109 = y;
            var G__128110 = cljs.core.first.call(null, more);
            var G__128111 = cljs.core.next.call(null, more);
            x = G__128109;
            y = G__128110;
            more = G__128111;
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
    var G__128108 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128108__delegate.call(this, x, y, more)
    };
    G__128108.cljs$lang$maxFixedArity = 2;
    G__128108.cljs$lang$applyTo = function(arglist__128112) {
      var x = cljs.core.first(arglist__128112);
      var y = cljs.core.first(cljs.core.next(arglist__128112));
      var more = cljs.core.rest(cljs.core.next(arglist__128112));
      return G__128108__delegate.call(this, x, y, more)
    };
    return G__128108
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___128104.call(this, x);
      case 2:
        return _LT___128105.call(this, x, y);
      default:
        return _LT___128106.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___128106.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___128113 = function(x) {
    return true
  };
  var _LT__EQ___128114 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___128115 = function() {
    var G__128117__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__128118 = y;
            var G__128119 = cljs.core.first.call(null, more);
            var G__128120 = cljs.core.next.call(null, more);
            x = G__128118;
            y = G__128119;
            more = G__128120;
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
    var G__128117 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128117__delegate.call(this, x, y, more)
    };
    G__128117.cljs$lang$maxFixedArity = 2;
    G__128117.cljs$lang$applyTo = function(arglist__128121) {
      var x = cljs.core.first(arglist__128121);
      var y = cljs.core.first(cljs.core.next(arglist__128121));
      var more = cljs.core.rest(cljs.core.next(arglist__128121));
      return G__128117__delegate.call(this, x, y, more)
    };
    return G__128117
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___128113.call(this, x);
      case 2:
        return _LT__EQ___128114.call(this, x, y);
      default:
        return _LT__EQ___128115.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___128115.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___128122 = function(x) {
    return true
  };
  var _GT___128123 = function(x, y) {
    return x > y
  };
  var _GT___128124 = function() {
    var G__128126__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__128127 = y;
            var G__128128 = cljs.core.first.call(null, more);
            var G__128129 = cljs.core.next.call(null, more);
            x = G__128127;
            y = G__128128;
            more = G__128129;
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
    var G__128126 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128126__delegate.call(this, x, y, more)
    };
    G__128126.cljs$lang$maxFixedArity = 2;
    G__128126.cljs$lang$applyTo = function(arglist__128130) {
      var x = cljs.core.first(arglist__128130);
      var y = cljs.core.first(cljs.core.next(arglist__128130));
      var more = cljs.core.rest(cljs.core.next(arglist__128130));
      return G__128126__delegate.call(this, x, y, more)
    };
    return G__128126
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___128122.call(this, x);
      case 2:
        return _GT___128123.call(this, x, y);
      default:
        return _GT___128124.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___128124.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___128131 = function(x) {
    return true
  };
  var _GT__EQ___128132 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___128133 = function() {
    var G__128135__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__128136 = y;
            var G__128137 = cljs.core.first.call(null, more);
            var G__128138 = cljs.core.next.call(null, more);
            x = G__128136;
            y = G__128137;
            more = G__128138;
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
    var G__128135 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128135__delegate.call(this, x, y, more)
    };
    G__128135.cljs$lang$maxFixedArity = 2;
    G__128135.cljs$lang$applyTo = function(arglist__128139) {
      var x = cljs.core.first(arglist__128139);
      var y = cljs.core.first(cljs.core.next(arglist__128139));
      var more = cljs.core.rest(cljs.core.next(arglist__128139));
      return G__128135__delegate.call(this, x, y, more)
    };
    return G__128135
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___128131.call(this, x);
      case 2:
        return _GT__EQ___128132.call(this, x, y);
      default:
        return _GT__EQ___128133.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___128133.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__128140 = function(x) {
    return x
  };
  var max__128141 = function(x, y) {
    return x > y ? x : y
  };
  var max__128142 = function() {
    var G__128144__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__128144 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128144__delegate.call(this, x, y, more)
    };
    G__128144.cljs$lang$maxFixedArity = 2;
    G__128144.cljs$lang$applyTo = function(arglist__128145) {
      var x = cljs.core.first(arglist__128145);
      var y = cljs.core.first(cljs.core.next(arglist__128145));
      var more = cljs.core.rest(cljs.core.next(arglist__128145));
      return G__128144__delegate.call(this, x, y, more)
    };
    return G__128144
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__128140.call(this, x);
      case 2:
        return max__128141.call(this, x, y);
      default:
        return max__128142.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__128142.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__128146 = function(x) {
    return x
  };
  var min__128147 = function(x, y) {
    return x < y ? x : y
  };
  var min__128148 = function() {
    var G__128150__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__128150 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128150__delegate.call(this, x, y, more)
    };
    G__128150.cljs$lang$maxFixedArity = 2;
    G__128150.cljs$lang$applyTo = function(arglist__128151) {
      var x = cljs.core.first(arglist__128151);
      var y = cljs.core.first(cljs.core.next(arglist__128151));
      var more = cljs.core.rest(cljs.core.next(arglist__128151));
      return G__128150__delegate.call(this, x, y, more)
    };
    return G__128150
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__128146.call(this, x);
      case 2:
        return min__128147.call(this, x, y);
      default:
        return min__128148.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__128148.cljs$lang$applyTo;
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
  var rem__128152 = n % d;
  return cljs.core.fix.call(null, (n - rem__128152) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__128153 = cljs.core.quot.call(null, n, d);
  return n - d * q__128153
};
cljs.core.rand = function() {
  var rand = null;
  var rand__128154 = function() {
    return Math.random.call(null)
  };
  var rand__128155 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__128154.call(this);
      case 1:
        return rand__128155.call(this, n)
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
  var _EQ__EQ___128157 = function(x) {
    return true
  };
  var _EQ__EQ___128158 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___128159 = function() {
    var G__128161__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__128162 = y;
            var G__128163 = cljs.core.first.call(null, more);
            var G__128164 = cljs.core.next.call(null, more);
            x = G__128162;
            y = G__128163;
            more = G__128164;
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
    var G__128161 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128161__delegate.call(this, x, y, more)
    };
    G__128161.cljs$lang$maxFixedArity = 2;
    G__128161.cljs$lang$applyTo = function(arglist__128165) {
      var x = cljs.core.first(arglist__128165);
      var y = cljs.core.first(cljs.core.next(arglist__128165));
      var more = cljs.core.rest(cljs.core.next(arglist__128165));
      return G__128161__delegate.call(this, x, y, more)
    };
    return G__128161
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___128157.call(this, x);
      case 2:
        return _EQ__EQ___128158.call(this, x, y);
      default:
        return _EQ__EQ___128159.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___128159.cljs$lang$applyTo;
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
  var n__128166 = n;
  var xs__128167 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____128168 = xs__128167;
      if(cljs.core.truth_(and__3546__auto____128168)) {
        return n__128166 > 0
      }else {
        return and__3546__auto____128168
      }
    }())) {
      var G__128169 = n__128166 - 1;
      var G__128170 = cljs.core.next.call(null, xs__128167);
      n__128166 = G__128169;
      xs__128167 = G__128170;
      continue
    }else {
      return xs__128167
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__128175 = null;
  var G__128175__128176 = function(coll, n) {
    var temp__3695__auto____128171 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____128171)) {
      var xs__128172 = temp__3695__auto____128171;
      return cljs.core.first.call(null, xs__128172)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__128175__128177 = function(coll, n, not_found) {
    var temp__3695__auto____128173 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____128173)) {
      var xs__128174 = temp__3695__auto____128173;
      return cljs.core.first.call(null, xs__128174)
    }else {
      return not_found
    }
  };
  G__128175 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128175__128176.call(this, coll, n);
      case 3:
        return G__128175__128177.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128175
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___128179 = function() {
    return""
  };
  var str_STAR___128180 = function(x) {
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
  var str_STAR___128181 = function() {
    var G__128183__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__128184 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__128185 = cljs.core.next.call(null, more);
            sb = G__128184;
            more = G__128185;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__128183 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__128183__delegate.call(this, x, ys)
    };
    G__128183.cljs$lang$maxFixedArity = 1;
    G__128183.cljs$lang$applyTo = function(arglist__128186) {
      var x = cljs.core.first(arglist__128186);
      var ys = cljs.core.rest(arglist__128186);
      return G__128183__delegate.call(this, x, ys)
    };
    return G__128183
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___128179.call(this);
      case 1:
        return str_STAR___128180.call(this, x);
      default:
        return str_STAR___128181.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___128181.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__128187 = function() {
    return""
  };
  var str__128188 = function(x) {
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
  var str__128189 = function() {
    var G__128191__delegate = function(x, ys) {
      return cljs.core.apply.call(null, cljs.core.str_STAR_, x, ys)
    };
    var G__128191 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__128191__delegate.call(this, x, ys)
    };
    G__128191.cljs$lang$maxFixedArity = 1;
    G__128191.cljs$lang$applyTo = function(arglist__128192) {
      var x = cljs.core.first(arglist__128192);
      var ys = cljs.core.rest(arglist__128192);
      return G__128191__delegate.call(this, x, ys)
    };
    return G__128191
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__128187.call(this);
      case 1:
        return str__128188.call(this, x);
      default:
        return str__128189.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__128189.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__128193 = function(s, start) {
    return s.substring(start)
  };
  var subs__128194 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__128193.call(this, s, start);
      case 3:
        return subs__128194.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__128196 = function(name) {
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
  var symbol__128197 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__128196.call(this, ns);
      case 2:
        return symbol__128197.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__128199 = function(name) {
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
  var keyword__128200 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__128199.call(this, ns);
      case 2:
        return keyword__128200.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__128202 = cljs.core.seq.call(null, x);
    var ys__128203 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__128202 === null)) {
        return ys__128203 === null
      }else {
        if(cljs.core.truth_(ys__128203 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__128202), cljs.core.first.call(null, ys__128203)))) {
            var G__128204 = cljs.core.next.call(null, xs__128202);
            var G__128205 = cljs.core.next.call(null, ys__128203);
            xs__128202 = G__128204;
            ys__128203 = G__128205;
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
  return cljs.core.reduce.call(null, function(p1__128206_SHARP_, p2__128207_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__128206_SHARP_, cljs.core.hash.call(null, p2__128207_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__128208__128209 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__128208__128209)) {
    var G__128211__128213 = cljs.core.first.call(null, G__128208__128209);
    var vec__128212__128214 = G__128211__128213;
    var key_name__128215 = cljs.core.nth.call(null, vec__128212__128214, 0, null);
    var f__128216 = cljs.core.nth.call(null, vec__128212__128214, 1, null);
    var G__128208__128217 = G__128208__128209;
    var G__128211__128218 = G__128211__128213;
    var G__128208__128219 = G__128208__128217;
    while(true) {
      var vec__128220__128221 = G__128211__128218;
      var key_name__128222 = cljs.core.nth.call(null, vec__128220__128221, 0, null);
      var f__128223 = cljs.core.nth.call(null, vec__128220__128221, 1, null);
      var G__128208__128224 = G__128208__128219;
      var str_name__128225 = cljs.core.name.call(null, key_name__128222);
      obj[str_name__128225] = f__128223;
      var temp__3698__auto____128226 = cljs.core.next.call(null, G__128208__128224);
      if(cljs.core.truth_(temp__3698__auto____128226)) {
        var G__128208__128227 = temp__3698__auto____128226;
        var G__128228 = cljs.core.first.call(null, G__128208__128227);
        var G__128229 = G__128208__128227;
        G__128211__128218 = G__128228;
        G__128208__128219 = G__128229;
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
cljs.core.List.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.List")
};
cljs.core.List.prototype.cljs$core$IHash$ = true;
cljs.core.List.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128230 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128231 = this;
  return new cljs.core.List(this__128231.meta, o, coll, this__128231.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128232 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128233 = this;
  return this__128233.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__128234 = this;
  return this__128234.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__128235 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__128236 = this;
  return this__128236.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__128237 = this;
  return this__128237.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128238 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128239 = this;
  return new cljs.core.List(meta, this__128239.first, this__128239.rest, this__128239.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128240 = this;
  return this__128240.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128241 = this;
  return cljs.core.List.EMPTY
};
cljs.core.List;
cljs.core.EmptyList = function(meta) {
  this.meta = meta
};
cljs.core.EmptyList.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.EmptyList")
};
cljs.core.EmptyList.prototype.cljs$core$IHash$ = true;
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128242 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128243 = this;
  return new cljs.core.List(this__128243.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128244 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128245 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__128246 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__128247 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__128248 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__128249 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128250 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128251 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128252 = this;
  return this__128252.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128253 = this;
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
  list.cljs$lang$applyTo = function(arglist__128254) {
    var items = cljs.core.seq(arglist__128254);
    return list__delegate.call(this, items)
  };
  return list
}();
cljs.core.Cons = function(meta, first, rest) {
  this.meta = meta;
  this.first = first;
  this.rest = rest
};
cljs.core.Cons.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Cons")
};
cljs.core.Cons.prototype.cljs$core$ISeqable$ = true;
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128255 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128256 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128257 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128258 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__128258.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128259 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__128260 = this;
  return this__128260.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__128261 = this;
  if(cljs.core.truth_(this__128261.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__128261.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128262 = this;
  return this__128262.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128263 = this;
  return new cljs.core.Cons(meta, this__128263.first, this__128263.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__128264 = null;
  var G__128264__128265 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__128264__128266 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__128264 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__128264__128265.call(this, string, f);
      case 3:
        return G__128264__128266.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128264
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__128268 = null;
  var G__128268__128269 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__128268__128270 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__128268 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128268__128269.call(this, string, k);
      case 3:
        return G__128268__128270.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128268
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__128272 = null;
  var G__128272__128273 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__128272__128274 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__128272 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128272__128273.call(this, string, n);
      case 3:
        return G__128272__128274.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128272
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
  var G__128282 = null;
  var G__128282__128283 = function(tsym128276, coll) {
    var tsym128276__128278 = this;
    var this$__128279 = tsym128276__128278;
    return cljs.core.get.call(null, coll, this$__128279.toString())
  };
  var G__128282__128284 = function(tsym128277, coll, not_found) {
    var tsym128277__128280 = this;
    var this$__128281 = tsym128277__128280;
    return cljs.core.get.call(null, coll, this$__128281.toString(), not_found)
  };
  G__128282 = function(tsym128277, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128282__128283.call(this, tsym128277, coll);
      case 3:
        return G__128282__128284.call(this, tsym128277, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128282
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__128286 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__128286
  }else {
    lazy_seq.x = x__128286.call(null);
    lazy_seq.realized = true;
    return lazy_seq.x
  }
};
cljs.core.LazySeq = function(meta, realized, x) {
  this.meta = meta;
  this.realized = realized;
  this.x = x
};
cljs.core.LazySeq.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.LazySeq")
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128287 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128288 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128289 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128290 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__128290.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128291 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__128292 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__128293 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128294 = this;
  return this__128294.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128295 = this;
  return new cljs.core.LazySeq(meta, this__128295.realized, this__128295.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__128296 = cljs.core.array.call(null);
  var s__128297 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__128297))) {
      ary__128296.push(cljs.core.first.call(null, s__128297));
      var G__128298 = cljs.core.next.call(null, s__128297);
      s__128297 = G__128298;
      continue
    }else {
      return ary__128296
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__128299 = s;
  var i__128300 = n;
  var sum__128301 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____128302 = i__128300 > 0;
      if(cljs.core.truth_(and__3546__auto____128302)) {
        return cljs.core.seq.call(null, s__128299)
      }else {
        return and__3546__auto____128302
      }
    }())) {
      var G__128303 = cljs.core.next.call(null, s__128299);
      var G__128304 = i__128300 - 1;
      var G__128305 = sum__128301 + 1;
      s__128299 = G__128303;
      i__128300 = G__128304;
      sum__128301 = G__128305;
      continue
    }else {
      return sum__128301
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
  var concat__128309 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__128310 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__128311 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__128306 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__128306)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__128306), concat.call(null, cljs.core.rest.call(null, s__128306), y))
      }else {
        return y
      }
    })
  };
  var concat__128312 = function() {
    var G__128314__delegate = function(x, y, zs) {
      var cat__128308 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__128307 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__128307)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__128307), cat.call(null, cljs.core.rest.call(null, xys__128307), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__128308.call(null, concat.call(null, x, y), zs)
    };
    var G__128314 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128314__delegate.call(this, x, y, zs)
    };
    G__128314.cljs$lang$maxFixedArity = 2;
    G__128314.cljs$lang$applyTo = function(arglist__128315) {
      var x = cljs.core.first(arglist__128315);
      var y = cljs.core.first(cljs.core.next(arglist__128315));
      var zs = cljs.core.rest(cljs.core.next(arglist__128315));
      return G__128314__delegate.call(this, x, y, zs)
    };
    return G__128314
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__128309.call(this);
      case 1:
        return concat__128310.call(this, x);
      case 2:
        return concat__128311.call(this, x, y);
      default:
        return concat__128312.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__128312.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___128316 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___128317 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___128318 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___128319 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___128320 = function() {
    var G__128322__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__128322 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__128322__delegate.call(this, a, b, c, d, more)
    };
    G__128322.cljs$lang$maxFixedArity = 4;
    G__128322.cljs$lang$applyTo = function(arglist__128323) {
      var a = cljs.core.first(arglist__128323);
      var b = cljs.core.first(cljs.core.next(arglist__128323));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128323)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128323))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128323))));
      return G__128322__delegate.call(this, a, b, c, d, more)
    };
    return G__128322
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___128316.call(this, a);
      case 2:
        return list_STAR___128317.call(this, a, b);
      case 3:
        return list_STAR___128318.call(this, a, b, c);
      case 4:
        return list_STAR___128319.call(this, a, b, c, d);
      default:
        return list_STAR___128320.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___128320.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__128333 = function(f, args) {
    var fixed_arity__128324 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__128324 + 1) <= fixed_arity__128324)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__128334 = function(f, x, args) {
    var arglist__128325 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__128326 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__128325, fixed_arity__128326) <= fixed_arity__128326)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__128325))
      }else {
        return f.cljs$lang$applyTo(arglist__128325)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__128325))
    }
  };
  var apply__128335 = function(f, x, y, args) {
    var arglist__128327 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__128328 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__128327, fixed_arity__128328) <= fixed_arity__128328)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__128327))
      }else {
        return f.cljs$lang$applyTo(arglist__128327)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__128327))
    }
  };
  var apply__128336 = function(f, x, y, z, args) {
    var arglist__128329 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__128330 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__128329, fixed_arity__128330) <= fixed_arity__128330)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__128329))
      }else {
        return f.cljs$lang$applyTo(arglist__128329)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__128329))
    }
  };
  var apply__128337 = function() {
    var G__128339__delegate = function(f, a, b, c, d, args) {
      var arglist__128331 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__128332 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__128331, fixed_arity__128332) <= fixed_arity__128332)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__128331))
        }else {
          return f.cljs$lang$applyTo(arglist__128331)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__128331))
      }
    };
    var G__128339 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__128339__delegate.call(this, f, a, b, c, d, args)
    };
    G__128339.cljs$lang$maxFixedArity = 5;
    G__128339.cljs$lang$applyTo = function(arglist__128340) {
      var f = cljs.core.first(arglist__128340);
      var a = cljs.core.first(cljs.core.next(arglist__128340));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128340)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128340))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128340)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128340)))));
      return G__128339__delegate.call(this, f, a, b, c, d, args)
    };
    return G__128339
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__128333.call(this, f, a);
      case 3:
        return apply__128334.call(this, f, a, b);
      case 4:
        return apply__128335.call(this, f, a, b, c);
      case 5:
        return apply__128336.call(this, f, a, b, c, d);
      default:
        return apply__128337.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__128337.cljs$lang$applyTo;
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
  vary_meta.cljs$lang$applyTo = function(arglist__128341) {
    var obj = cljs.core.first(arglist__128341);
    var f = cljs.core.first(cljs.core.next(arglist__128341));
    var args = cljs.core.rest(cljs.core.next(arglist__128341));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___128342 = function(x) {
    return false
  };
  var not_EQ___128343 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___128344 = function() {
    var G__128346__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__128346 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128346__delegate.call(this, x, y, more)
    };
    G__128346.cljs$lang$maxFixedArity = 2;
    G__128346.cljs$lang$applyTo = function(arglist__128347) {
      var x = cljs.core.first(arglist__128347);
      var y = cljs.core.first(cljs.core.next(arglist__128347));
      var more = cljs.core.rest(cljs.core.next(arglist__128347));
      return G__128346__delegate.call(this, x, y, more)
    };
    return G__128346
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___128342.call(this, x);
      case 2:
        return not_EQ___128343.call(this, x, y);
      default:
        return not_EQ___128344.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___128344.cljs$lang$applyTo;
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
        var G__128348 = pred;
        var G__128349 = cljs.core.next.call(null, coll);
        pred = G__128348;
        coll = G__128349;
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
      var or__3548__auto____128350 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____128350)) {
        return or__3548__auto____128350
      }else {
        var G__128351 = pred;
        var G__128352 = cljs.core.next.call(null, coll);
        pred = G__128351;
        coll = G__128352;
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
    var G__128353 = null;
    var G__128353__128354 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__128353__128355 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__128353__128356 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__128353__128357 = function() {
      var G__128359__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__128359 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__128359__delegate.call(this, x, y, zs)
      };
      G__128359.cljs$lang$maxFixedArity = 2;
      G__128359.cljs$lang$applyTo = function(arglist__128360) {
        var x = cljs.core.first(arglist__128360);
        var y = cljs.core.first(cljs.core.next(arglist__128360));
        var zs = cljs.core.rest(cljs.core.next(arglist__128360));
        return G__128359__delegate.call(this, x, y, zs)
      };
      return G__128359
    }();
    G__128353 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__128353__128354.call(this);
        case 1:
          return G__128353__128355.call(this, x);
        case 2:
          return G__128353__128356.call(this, x, y);
        default:
          return G__128353__128357.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__128353.cljs$lang$maxFixedArity = 2;
    G__128353.cljs$lang$applyTo = G__128353__128357.cljs$lang$applyTo;
    return G__128353
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__128361__delegate = function(args) {
      return x
    };
    var G__128361 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__128361__delegate.call(this, args)
    };
    G__128361.cljs$lang$maxFixedArity = 0;
    G__128361.cljs$lang$applyTo = function(arglist__128362) {
      var args = cljs.core.seq(arglist__128362);
      return G__128361__delegate.call(this, args)
    };
    return G__128361
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__128366 = function() {
    return cljs.core.identity
  };
  var comp__128367 = function(f) {
    return f
  };
  var comp__128368 = function(f, g) {
    return function() {
      var G__128372 = null;
      var G__128372__128373 = function() {
        return f.call(null, g.call(null))
      };
      var G__128372__128374 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__128372__128375 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__128372__128376 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__128372__128377 = function() {
        var G__128379__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__128379 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128379__delegate.call(this, x, y, z, args)
        };
        G__128379.cljs$lang$maxFixedArity = 3;
        G__128379.cljs$lang$applyTo = function(arglist__128380) {
          var x = cljs.core.first(arglist__128380);
          var y = cljs.core.first(cljs.core.next(arglist__128380));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128380)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128380)));
          return G__128379__delegate.call(this, x, y, z, args)
        };
        return G__128379
      }();
      G__128372 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__128372__128373.call(this);
          case 1:
            return G__128372__128374.call(this, x);
          case 2:
            return G__128372__128375.call(this, x, y);
          case 3:
            return G__128372__128376.call(this, x, y, z);
          default:
            return G__128372__128377.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__128372.cljs$lang$maxFixedArity = 3;
      G__128372.cljs$lang$applyTo = G__128372__128377.cljs$lang$applyTo;
      return G__128372
    }()
  };
  var comp__128369 = function(f, g, h) {
    return function() {
      var G__128381 = null;
      var G__128381__128382 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__128381__128383 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__128381__128384 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__128381__128385 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__128381__128386 = function() {
        var G__128388__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__128388 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128388__delegate.call(this, x, y, z, args)
        };
        G__128388.cljs$lang$maxFixedArity = 3;
        G__128388.cljs$lang$applyTo = function(arglist__128389) {
          var x = cljs.core.first(arglist__128389);
          var y = cljs.core.first(cljs.core.next(arglist__128389));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128389)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128389)));
          return G__128388__delegate.call(this, x, y, z, args)
        };
        return G__128388
      }();
      G__128381 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__128381__128382.call(this);
          case 1:
            return G__128381__128383.call(this, x);
          case 2:
            return G__128381__128384.call(this, x, y);
          case 3:
            return G__128381__128385.call(this, x, y, z);
          default:
            return G__128381__128386.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__128381.cljs$lang$maxFixedArity = 3;
      G__128381.cljs$lang$applyTo = G__128381__128386.cljs$lang$applyTo;
      return G__128381
    }()
  };
  var comp__128370 = function() {
    var G__128390__delegate = function(f1, f2, f3, fs) {
      var fs__128363 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__128391__delegate = function(args) {
          var ret__128364 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__128363), args);
          var fs__128365 = cljs.core.next.call(null, fs__128363);
          while(true) {
            if(cljs.core.truth_(fs__128365)) {
              var G__128392 = cljs.core.first.call(null, fs__128365).call(null, ret__128364);
              var G__128393 = cljs.core.next.call(null, fs__128365);
              ret__128364 = G__128392;
              fs__128365 = G__128393;
              continue
            }else {
              return ret__128364
            }
            break
          }
        };
        var G__128391 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__128391__delegate.call(this, args)
        };
        G__128391.cljs$lang$maxFixedArity = 0;
        G__128391.cljs$lang$applyTo = function(arglist__128394) {
          var args = cljs.core.seq(arglist__128394);
          return G__128391__delegate.call(this, args)
        };
        return G__128391
      }()
    };
    var G__128390 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__128390__delegate.call(this, f1, f2, f3, fs)
    };
    G__128390.cljs$lang$maxFixedArity = 3;
    G__128390.cljs$lang$applyTo = function(arglist__128395) {
      var f1 = cljs.core.first(arglist__128395);
      var f2 = cljs.core.first(cljs.core.next(arglist__128395));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128395)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128395)));
      return G__128390__delegate.call(this, f1, f2, f3, fs)
    };
    return G__128390
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__128366.call(this);
      case 1:
        return comp__128367.call(this, f1);
      case 2:
        return comp__128368.call(this, f1, f2);
      case 3:
        return comp__128369.call(this, f1, f2, f3);
      default:
        return comp__128370.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__128370.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__128396 = function(f, arg1) {
    return function() {
      var G__128401__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__128401 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__128401__delegate.call(this, args)
      };
      G__128401.cljs$lang$maxFixedArity = 0;
      G__128401.cljs$lang$applyTo = function(arglist__128402) {
        var args = cljs.core.seq(arglist__128402);
        return G__128401__delegate.call(this, args)
      };
      return G__128401
    }()
  };
  var partial__128397 = function(f, arg1, arg2) {
    return function() {
      var G__128403__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__128403 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__128403__delegate.call(this, args)
      };
      G__128403.cljs$lang$maxFixedArity = 0;
      G__128403.cljs$lang$applyTo = function(arglist__128404) {
        var args = cljs.core.seq(arglist__128404);
        return G__128403__delegate.call(this, args)
      };
      return G__128403
    }()
  };
  var partial__128398 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__128405__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__128405 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__128405__delegate.call(this, args)
      };
      G__128405.cljs$lang$maxFixedArity = 0;
      G__128405.cljs$lang$applyTo = function(arglist__128406) {
        var args = cljs.core.seq(arglist__128406);
        return G__128405__delegate.call(this, args)
      };
      return G__128405
    }()
  };
  var partial__128399 = function() {
    var G__128407__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__128408__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__128408 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__128408__delegate.call(this, args)
        };
        G__128408.cljs$lang$maxFixedArity = 0;
        G__128408.cljs$lang$applyTo = function(arglist__128409) {
          var args = cljs.core.seq(arglist__128409);
          return G__128408__delegate.call(this, args)
        };
        return G__128408
      }()
    };
    var G__128407 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__128407__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__128407.cljs$lang$maxFixedArity = 4;
    G__128407.cljs$lang$applyTo = function(arglist__128410) {
      var f = cljs.core.first(arglist__128410);
      var arg1 = cljs.core.first(cljs.core.next(arglist__128410));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128410)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128410))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128410))));
      return G__128407__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__128407
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__128396.call(this, f, arg1);
      case 3:
        return partial__128397.call(this, f, arg1, arg2);
      case 4:
        return partial__128398.call(this, f, arg1, arg2, arg3);
      default:
        return partial__128399.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__128399.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__128411 = function(f, x) {
    return function() {
      var G__128415 = null;
      var G__128415__128416 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__128415__128417 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__128415__128418 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__128415__128419 = function() {
        var G__128421__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__128421 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128421__delegate.call(this, a, b, c, ds)
        };
        G__128421.cljs$lang$maxFixedArity = 3;
        G__128421.cljs$lang$applyTo = function(arglist__128422) {
          var a = cljs.core.first(arglist__128422);
          var b = cljs.core.first(cljs.core.next(arglist__128422));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128422)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128422)));
          return G__128421__delegate.call(this, a, b, c, ds)
        };
        return G__128421
      }();
      G__128415 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__128415__128416.call(this, a);
          case 2:
            return G__128415__128417.call(this, a, b);
          case 3:
            return G__128415__128418.call(this, a, b, c);
          default:
            return G__128415__128419.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__128415.cljs$lang$maxFixedArity = 3;
      G__128415.cljs$lang$applyTo = G__128415__128419.cljs$lang$applyTo;
      return G__128415
    }()
  };
  var fnil__128412 = function(f, x, y) {
    return function() {
      var G__128423 = null;
      var G__128423__128424 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__128423__128425 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__128423__128426 = function() {
        var G__128428__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__128428 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128428__delegate.call(this, a, b, c, ds)
        };
        G__128428.cljs$lang$maxFixedArity = 3;
        G__128428.cljs$lang$applyTo = function(arglist__128429) {
          var a = cljs.core.first(arglist__128429);
          var b = cljs.core.first(cljs.core.next(arglist__128429));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128429)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128429)));
          return G__128428__delegate.call(this, a, b, c, ds)
        };
        return G__128428
      }();
      G__128423 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__128423__128424.call(this, a, b);
          case 3:
            return G__128423__128425.call(this, a, b, c);
          default:
            return G__128423__128426.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__128423.cljs$lang$maxFixedArity = 3;
      G__128423.cljs$lang$applyTo = G__128423__128426.cljs$lang$applyTo;
      return G__128423
    }()
  };
  var fnil__128413 = function(f, x, y, z) {
    return function() {
      var G__128430 = null;
      var G__128430__128431 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__128430__128432 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__128430__128433 = function() {
        var G__128435__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__128435 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128435__delegate.call(this, a, b, c, ds)
        };
        G__128435.cljs$lang$maxFixedArity = 3;
        G__128435.cljs$lang$applyTo = function(arglist__128436) {
          var a = cljs.core.first(arglist__128436);
          var b = cljs.core.first(cljs.core.next(arglist__128436));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128436)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128436)));
          return G__128435__delegate.call(this, a, b, c, ds)
        };
        return G__128435
      }();
      G__128430 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__128430__128431.call(this, a, b);
          case 3:
            return G__128430__128432.call(this, a, b, c);
          default:
            return G__128430__128433.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__128430.cljs$lang$maxFixedArity = 3;
      G__128430.cljs$lang$applyTo = G__128430__128433.cljs$lang$applyTo;
      return G__128430
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__128411.call(this, f, x);
      case 3:
        return fnil__128412.call(this, f, x, y);
      case 4:
        return fnil__128413.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__128439 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____128437 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____128437)) {
        var s__128438 = temp__3698__auto____128437;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__128438)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__128438)))
      }else {
        return null
      }
    })
  };
  return mapi__128439.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____128440 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____128440)) {
      var s__128441 = temp__3698__auto____128440;
      var x__128442 = f.call(null, cljs.core.first.call(null, s__128441));
      if(cljs.core.truth_(x__128442 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__128441))
      }else {
        return cljs.core.cons.call(null, x__128442, keep.call(null, f, cljs.core.rest.call(null, s__128441)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__128452 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____128449 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____128449)) {
        var s__128450 = temp__3698__auto____128449;
        var x__128451 = f.call(null, idx, cljs.core.first.call(null, s__128450));
        if(cljs.core.truth_(x__128451 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__128450))
        }else {
          return cljs.core.cons.call(null, x__128451, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__128450)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__128452.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__128497 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__128502 = function() {
        return true
      };
      var ep1__128503 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__128504 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128459 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128459)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____128459
          }
        }())
      };
      var ep1__128505 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128460 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128460)) {
            var and__3546__auto____128461 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____128461)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____128461
            }
          }else {
            return and__3546__auto____128460
          }
        }())
      };
      var ep1__128506 = function() {
        var G__128508__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____128462 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____128462)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____128462
            }
          }())
        };
        var G__128508 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128508__delegate.call(this, x, y, z, args)
        };
        G__128508.cljs$lang$maxFixedArity = 3;
        G__128508.cljs$lang$applyTo = function(arglist__128509) {
          var x = cljs.core.first(arglist__128509);
          var y = cljs.core.first(cljs.core.next(arglist__128509));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128509)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128509)));
          return G__128508__delegate.call(this, x, y, z, args)
        };
        return G__128508
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__128502.call(this);
          case 1:
            return ep1__128503.call(this, x);
          case 2:
            return ep1__128504.call(this, x, y);
          case 3:
            return ep1__128505.call(this, x, y, z);
          default:
            return ep1__128506.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__128506.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__128498 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__128510 = function() {
        return true
      };
      var ep2__128511 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128463 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128463)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____128463
          }
        }())
      };
      var ep2__128512 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128464 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128464)) {
            var and__3546__auto____128465 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____128465)) {
              var and__3546__auto____128466 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____128466)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____128466
              }
            }else {
              return and__3546__auto____128465
            }
          }else {
            return and__3546__auto____128464
          }
        }())
      };
      var ep2__128513 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128467 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128467)) {
            var and__3546__auto____128468 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____128468)) {
              var and__3546__auto____128469 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____128469)) {
                var and__3546__auto____128470 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____128470)) {
                  var and__3546__auto____128471 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____128471)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____128471
                  }
                }else {
                  return and__3546__auto____128470
                }
              }else {
                return and__3546__auto____128469
              }
            }else {
              return and__3546__auto____128468
            }
          }else {
            return and__3546__auto____128467
          }
        }())
      };
      var ep2__128514 = function() {
        var G__128516__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____128472 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____128472)) {
              return cljs.core.every_QMARK_.call(null, function(p1__128443_SHARP_) {
                var and__3546__auto____128473 = p1.call(null, p1__128443_SHARP_);
                if(cljs.core.truth_(and__3546__auto____128473)) {
                  return p2.call(null, p1__128443_SHARP_)
                }else {
                  return and__3546__auto____128473
                }
              }, args)
            }else {
              return and__3546__auto____128472
            }
          }())
        };
        var G__128516 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128516__delegate.call(this, x, y, z, args)
        };
        G__128516.cljs$lang$maxFixedArity = 3;
        G__128516.cljs$lang$applyTo = function(arglist__128517) {
          var x = cljs.core.first(arglist__128517);
          var y = cljs.core.first(cljs.core.next(arglist__128517));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128517)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128517)));
          return G__128516__delegate.call(this, x, y, z, args)
        };
        return G__128516
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__128510.call(this);
          case 1:
            return ep2__128511.call(this, x);
          case 2:
            return ep2__128512.call(this, x, y);
          case 3:
            return ep2__128513.call(this, x, y, z);
          default:
            return ep2__128514.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__128514.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__128499 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__128518 = function() {
        return true
      };
      var ep3__128519 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128474 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128474)) {
            var and__3546__auto____128475 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____128475)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____128475
            }
          }else {
            return and__3546__auto____128474
          }
        }())
      };
      var ep3__128520 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128476 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128476)) {
            var and__3546__auto____128477 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____128477)) {
              var and__3546__auto____128478 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____128478)) {
                var and__3546__auto____128479 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____128479)) {
                  var and__3546__auto____128480 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____128480)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____128480
                  }
                }else {
                  return and__3546__auto____128479
                }
              }else {
                return and__3546__auto____128478
              }
            }else {
              return and__3546__auto____128477
            }
          }else {
            return and__3546__auto____128476
          }
        }())
      };
      var ep3__128521 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____128481 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____128481)) {
            var and__3546__auto____128482 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____128482)) {
              var and__3546__auto____128483 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____128483)) {
                var and__3546__auto____128484 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____128484)) {
                  var and__3546__auto____128485 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____128485)) {
                    var and__3546__auto____128486 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____128486)) {
                      var and__3546__auto____128487 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____128487)) {
                        var and__3546__auto____128488 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____128488)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____128488
                        }
                      }else {
                        return and__3546__auto____128487
                      }
                    }else {
                      return and__3546__auto____128486
                    }
                  }else {
                    return and__3546__auto____128485
                  }
                }else {
                  return and__3546__auto____128484
                }
              }else {
                return and__3546__auto____128483
              }
            }else {
              return and__3546__auto____128482
            }
          }else {
            return and__3546__auto____128481
          }
        }())
      };
      var ep3__128522 = function() {
        var G__128524__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____128489 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____128489)) {
              return cljs.core.every_QMARK_.call(null, function(p1__128444_SHARP_) {
                var and__3546__auto____128490 = p1.call(null, p1__128444_SHARP_);
                if(cljs.core.truth_(and__3546__auto____128490)) {
                  var and__3546__auto____128491 = p2.call(null, p1__128444_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____128491)) {
                    return p3.call(null, p1__128444_SHARP_)
                  }else {
                    return and__3546__auto____128491
                  }
                }else {
                  return and__3546__auto____128490
                }
              }, args)
            }else {
              return and__3546__auto____128489
            }
          }())
        };
        var G__128524 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128524__delegate.call(this, x, y, z, args)
        };
        G__128524.cljs$lang$maxFixedArity = 3;
        G__128524.cljs$lang$applyTo = function(arglist__128525) {
          var x = cljs.core.first(arglist__128525);
          var y = cljs.core.first(cljs.core.next(arglist__128525));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128525)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128525)));
          return G__128524__delegate.call(this, x, y, z, args)
        };
        return G__128524
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__128518.call(this);
          case 1:
            return ep3__128519.call(this, x);
          case 2:
            return ep3__128520.call(this, x, y);
          case 3:
            return ep3__128521.call(this, x, y, z);
          default:
            return ep3__128522.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__128522.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__128500 = function() {
    var G__128526__delegate = function(p1, p2, p3, ps) {
      var ps__128492 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__128527 = function() {
          return true
        };
        var epn__128528 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__128445_SHARP_) {
            return p1__128445_SHARP_.call(null, x)
          }, ps__128492)
        };
        var epn__128529 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__128446_SHARP_) {
            var and__3546__auto____128493 = p1__128446_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____128493)) {
              return p1__128446_SHARP_.call(null, y)
            }else {
              return and__3546__auto____128493
            }
          }, ps__128492)
        };
        var epn__128530 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__128447_SHARP_) {
            var and__3546__auto____128494 = p1__128447_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____128494)) {
              var and__3546__auto____128495 = p1__128447_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____128495)) {
                return p1__128447_SHARP_.call(null, z)
              }else {
                return and__3546__auto____128495
              }
            }else {
              return and__3546__auto____128494
            }
          }, ps__128492)
        };
        var epn__128531 = function() {
          var G__128533__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____128496 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____128496)) {
                return cljs.core.every_QMARK_.call(null, function(p1__128448_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__128448_SHARP_, args)
                }, ps__128492)
              }else {
                return and__3546__auto____128496
              }
            }())
          };
          var G__128533 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__128533__delegate.call(this, x, y, z, args)
          };
          G__128533.cljs$lang$maxFixedArity = 3;
          G__128533.cljs$lang$applyTo = function(arglist__128534) {
            var x = cljs.core.first(arglist__128534);
            var y = cljs.core.first(cljs.core.next(arglist__128534));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128534)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128534)));
            return G__128533__delegate.call(this, x, y, z, args)
          };
          return G__128533
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__128527.call(this);
            case 1:
              return epn__128528.call(this, x);
            case 2:
              return epn__128529.call(this, x, y);
            case 3:
              return epn__128530.call(this, x, y, z);
            default:
              return epn__128531.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__128531.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__128526 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__128526__delegate.call(this, p1, p2, p3, ps)
    };
    G__128526.cljs$lang$maxFixedArity = 3;
    G__128526.cljs$lang$applyTo = function(arglist__128535) {
      var p1 = cljs.core.first(arglist__128535);
      var p2 = cljs.core.first(cljs.core.next(arglist__128535));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128535)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128535)));
      return G__128526__delegate.call(this, p1, p2, p3, ps)
    };
    return G__128526
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__128497.call(this, p1);
      case 2:
        return every_pred__128498.call(this, p1, p2);
      case 3:
        return every_pred__128499.call(this, p1, p2, p3);
      default:
        return every_pred__128500.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__128500.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__128575 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__128580 = function() {
        return null
      };
      var sp1__128581 = function(x) {
        return p.call(null, x)
      };
      var sp1__128582 = function(x, y) {
        var or__3548__auto____128537 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128537)) {
          return or__3548__auto____128537
        }else {
          return p.call(null, y)
        }
      };
      var sp1__128583 = function(x, y, z) {
        var or__3548__auto____128538 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128538)) {
          return or__3548__auto____128538
        }else {
          var or__3548__auto____128539 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____128539)) {
            return or__3548__auto____128539
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__128584 = function() {
        var G__128586__delegate = function(x, y, z, args) {
          var or__3548__auto____128540 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____128540)) {
            return or__3548__auto____128540
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__128586 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128586__delegate.call(this, x, y, z, args)
        };
        G__128586.cljs$lang$maxFixedArity = 3;
        G__128586.cljs$lang$applyTo = function(arglist__128587) {
          var x = cljs.core.first(arglist__128587);
          var y = cljs.core.first(cljs.core.next(arglist__128587));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128587)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128587)));
          return G__128586__delegate.call(this, x, y, z, args)
        };
        return G__128586
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__128580.call(this);
          case 1:
            return sp1__128581.call(this, x);
          case 2:
            return sp1__128582.call(this, x, y);
          case 3:
            return sp1__128583.call(this, x, y, z);
          default:
            return sp1__128584.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__128584.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__128576 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__128588 = function() {
        return null
      };
      var sp2__128589 = function(x) {
        var or__3548__auto____128541 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128541)) {
          return or__3548__auto____128541
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__128590 = function(x, y) {
        var or__3548__auto____128542 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128542)) {
          return or__3548__auto____128542
        }else {
          var or__3548__auto____128543 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____128543)) {
            return or__3548__auto____128543
          }else {
            var or__3548__auto____128544 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____128544)) {
              return or__3548__auto____128544
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__128591 = function(x, y, z) {
        var or__3548__auto____128545 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128545)) {
          return or__3548__auto____128545
        }else {
          var or__3548__auto____128546 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____128546)) {
            return or__3548__auto____128546
          }else {
            var or__3548__auto____128547 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____128547)) {
              return or__3548__auto____128547
            }else {
              var or__3548__auto____128548 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____128548)) {
                return or__3548__auto____128548
              }else {
                var or__3548__auto____128549 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____128549)) {
                  return or__3548__auto____128549
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__128592 = function() {
        var G__128594__delegate = function(x, y, z, args) {
          var or__3548__auto____128550 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____128550)) {
            return or__3548__auto____128550
          }else {
            return cljs.core.some.call(null, function(p1__128453_SHARP_) {
              var or__3548__auto____128551 = p1.call(null, p1__128453_SHARP_);
              if(cljs.core.truth_(or__3548__auto____128551)) {
                return or__3548__auto____128551
              }else {
                return p2.call(null, p1__128453_SHARP_)
              }
            }, args)
          }
        };
        var G__128594 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128594__delegate.call(this, x, y, z, args)
        };
        G__128594.cljs$lang$maxFixedArity = 3;
        G__128594.cljs$lang$applyTo = function(arglist__128595) {
          var x = cljs.core.first(arglist__128595);
          var y = cljs.core.first(cljs.core.next(arglist__128595));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128595)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128595)));
          return G__128594__delegate.call(this, x, y, z, args)
        };
        return G__128594
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__128588.call(this);
          case 1:
            return sp2__128589.call(this, x);
          case 2:
            return sp2__128590.call(this, x, y);
          case 3:
            return sp2__128591.call(this, x, y, z);
          default:
            return sp2__128592.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__128592.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__128577 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__128596 = function() {
        return null
      };
      var sp3__128597 = function(x) {
        var or__3548__auto____128552 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128552)) {
          return or__3548__auto____128552
        }else {
          var or__3548__auto____128553 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____128553)) {
            return or__3548__auto____128553
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__128598 = function(x, y) {
        var or__3548__auto____128554 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128554)) {
          return or__3548__auto____128554
        }else {
          var or__3548__auto____128555 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____128555)) {
            return or__3548__auto____128555
          }else {
            var or__3548__auto____128556 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____128556)) {
              return or__3548__auto____128556
            }else {
              var or__3548__auto____128557 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____128557)) {
                return or__3548__auto____128557
              }else {
                var or__3548__auto____128558 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____128558)) {
                  return or__3548__auto____128558
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__128599 = function(x, y, z) {
        var or__3548__auto____128559 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____128559)) {
          return or__3548__auto____128559
        }else {
          var or__3548__auto____128560 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____128560)) {
            return or__3548__auto____128560
          }else {
            var or__3548__auto____128561 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____128561)) {
              return or__3548__auto____128561
            }else {
              var or__3548__auto____128562 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____128562)) {
                return or__3548__auto____128562
              }else {
                var or__3548__auto____128563 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____128563)) {
                  return or__3548__auto____128563
                }else {
                  var or__3548__auto____128564 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____128564)) {
                    return or__3548__auto____128564
                  }else {
                    var or__3548__auto____128565 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____128565)) {
                      return or__3548__auto____128565
                    }else {
                      var or__3548__auto____128566 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____128566)) {
                        return or__3548__auto____128566
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
      var sp3__128600 = function() {
        var G__128602__delegate = function(x, y, z, args) {
          var or__3548__auto____128567 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____128567)) {
            return or__3548__auto____128567
          }else {
            return cljs.core.some.call(null, function(p1__128454_SHARP_) {
              var or__3548__auto____128568 = p1.call(null, p1__128454_SHARP_);
              if(cljs.core.truth_(or__3548__auto____128568)) {
                return or__3548__auto____128568
              }else {
                var or__3548__auto____128569 = p2.call(null, p1__128454_SHARP_);
                if(cljs.core.truth_(or__3548__auto____128569)) {
                  return or__3548__auto____128569
                }else {
                  return p3.call(null, p1__128454_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__128602 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__128602__delegate.call(this, x, y, z, args)
        };
        G__128602.cljs$lang$maxFixedArity = 3;
        G__128602.cljs$lang$applyTo = function(arglist__128603) {
          var x = cljs.core.first(arglist__128603);
          var y = cljs.core.first(cljs.core.next(arglist__128603));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128603)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128603)));
          return G__128602__delegate.call(this, x, y, z, args)
        };
        return G__128602
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__128596.call(this);
          case 1:
            return sp3__128597.call(this, x);
          case 2:
            return sp3__128598.call(this, x, y);
          case 3:
            return sp3__128599.call(this, x, y, z);
          default:
            return sp3__128600.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__128600.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__128578 = function() {
    var G__128604__delegate = function(p1, p2, p3, ps) {
      var ps__128570 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__128605 = function() {
          return null
        };
        var spn__128606 = function(x) {
          return cljs.core.some.call(null, function(p1__128455_SHARP_) {
            return p1__128455_SHARP_.call(null, x)
          }, ps__128570)
        };
        var spn__128607 = function(x, y) {
          return cljs.core.some.call(null, function(p1__128456_SHARP_) {
            var or__3548__auto____128571 = p1__128456_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____128571)) {
              return or__3548__auto____128571
            }else {
              return p1__128456_SHARP_.call(null, y)
            }
          }, ps__128570)
        };
        var spn__128608 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__128457_SHARP_) {
            var or__3548__auto____128572 = p1__128457_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____128572)) {
              return or__3548__auto____128572
            }else {
              var or__3548__auto____128573 = p1__128457_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____128573)) {
                return or__3548__auto____128573
              }else {
                return p1__128457_SHARP_.call(null, z)
              }
            }
          }, ps__128570)
        };
        var spn__128609 = function() {
          var G__128611__delegate = function(x, y, z, args) {
            var or__3548__auto____128574 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____128574)) {
              return or__3548__auto____128574
            }else {
              return cljs.core.some.call(null, function(p1__128458_SHARP_) {
                return cljs.core.some.call(null, p1__128458_SHARP_, args)
              }, ps__128570)
            }
          };
          var G__128611 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__128611__delegate.call(this, x, y, z, args)
          };
          G__128611.cljs$lang$maxFixedArity = 3;
          G__128611.cljs$lang$applyTo = function(arglist__128612) {
            var x = cljs.core.first(arglist__128612);
            var y = cljs.core.first(cljs.core.next(arglist__128612));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128612)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128612)));
            return G__128611__delegate.call(this, x, y, z, args)
          };
          return G__128611
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__128605.call(this);
            case 1:
              return spn__128606.call(this, x);
            case 2:
              return spn__128607.call(this, x, y);
            case 3:
              return spn__128608.call(this, x, y, z);
            default:
              return spn__128609.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__128609.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__128604 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__128604__delegate.call(this, p1, p2, p3, ps)
    };
    G__128604.cljs$lang$maxFixedArity = 3;
    G__128604.cljs$lang$applyTo = function(arglist__128613) {
      var p1 = cljs.core.first(arglist__128613);
      var p2 = cljs.core.first(cljs.core.next(arglist__128613));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128613)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128613)));
      return G__128604__delegate.call(this, p1, p2, p3, ps)
    };
    return G__128604
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__128575.call(this, p1);
      case 2:
        return some_fn__128576.call(this, p1, p2);
      case 3:
        return some_fn__128577.call(this, p1, p2, p3);
      default:
        return some_fn__128578.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__128578.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__128626 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____128614 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____128614)) {
        var s__128615 = temp__3698__auto____128614;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__128615)), map.call(null, f, cljs.core.rest.call(null, s__128615)))
      }else {
        return null
      }
    })
  };
  var map__128627 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__128616 = cljs.core.seq.call(null, c1);
      var s2__128617 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____128618 = s1__128616;
        if(cljs.core.truth_(and__3546__auto____128618)) {
          return s2__128617
        }else {
          return and__3546__auto____128618
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__128616), cljs.core.first.call(null, s2__128617)), map.call(null, f, cljs.core.rest.call(null, s1__128616), cljs.core.rest.call(null, s2__128617)))
      }else {
        return null
      }
    })
  };
  var map__128628 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__128619 = cljs.core.seq.call(null, c1);
      var s2__128620 = cljs.core.seq.call(null, c2);
      var s3__128621 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____128622 = s1__128619;
        if(cljs.core.truth_(and__3546__auto____128622)) {
          var and__3546__auto____128623 = s2__128620;
          if(cljs.core.truth_(and__3546__auto____128623)) {
            return s3__128621
          }else {
            return and__3546__auto____128623
          }
        }else {
          return and__3546__auto____128622
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__128619), cljs.core.first.call(null, s2__128620), cljs.core.first.call(null, s3__128621)), map.call(null, f, cljs.core.rest.call(null, s1__128619), cljs.core.rest.call(null, s2__128620), cljs.core.rest.call(null, s3__128621)))
      }else {
        return null
      }
    })
  };
  var map__128629 = function() {
    var G__128631__delegate = function(f, c1, c2, c3, colls) {
      var step__128625 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__128624 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__128624))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__128624), step.call(null, map.call(null, cljs.core.rest, ss__128624)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__128536_SHARP_) {
        return cljs.core.apply.call(null, f, p1__128536_SHARP_)
      }, step__128625.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__128631 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__128631__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__128631.cljs$lang$maxFixedArity = 4;
    G__128631.cljs$lang$applyTo = function(arglist__128632) {
      var f = cljs.core.first(arglist__128632);
      var c1 = cljs.core.first(cljs.core.next(arglist__128632));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128632)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128632))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__128632))));
      return G__128631__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__128631
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__128626.call(this, f, c1);
      case 3:
        return map__128627.call(this, f, c1, c2);
      case 4:
        return map__128628.call(this, f, c1, c2, c3);
      default:
        return map__128629.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__128629.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____128633 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____128633)) {
        var s__128634 = temp__3698__auto____128633;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__128634), take.call(null, n - 1, cljs.core.rest.call(null, s__128634)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__128637 = function(n, coll) {
    while(true) {
      var s__128635 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____128636 = n > 0;
        if(cljs.core.truth_(and__3546__auto____128636)) {
          return s__128635
        }else {
          return and__3546__auto____128636
        }
      }())) {
        var G__128638 = n - 1;
        var G__128639 = cljs.core.rest.call(null, s__128635);
        n = G__128638;
        coll = G__128639;
        continue
      }else {
        return s__128635
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__128637.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__128640 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__128641 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__128640.call(this, n);
      case 2:
        return drop_last__128641.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__128643 = cljs.core.seq.call(null, coll);
  var lead__128644 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__128644)) {
      var G__128645 = cljs.core.next.call(null, s__128643);
      var G__128646 = cljs.core.next.call(null, lead__128644);
      s__128643 = G__128645;
      lead__128644 = G__128646;
      continue
    }else {
      return s__128643
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__128649 = function(pred, coll) {
    while(true) {
      var s__128647 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____128648 = s__128647;
        if(cljs.core.truth_(and__3546__auto____128648)) {
          return pred.call(null, cljs.core.first.call(null, s__128647))
        }else {
          return and__3546__auto____128648
        }
      }())) {
        var G__128650 = pred;
        var G__128651 = cljs.core.rest.call(null, s__128647);
        pred = G__128650;
        coll = G__128651;
        continue
      }else {
        return s__128647
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__128649.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____128652 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____128652)) {
      var s__128653 = temp__3698__auto____128652;
      return cljs.core.concat.call(null, s__128653, cycle.call(null, s__128653))
    }else {
      return null
    }
  })
};
cljs.core.split_at = function split_at(n, coll) {
  return cljs.core.Vector.fromArray([cljs.core.take.call(null, n, coll), cljs.core.drop.call(null, n, coll)])
};
cljs.core.repeat = function() {
  var repeat = null;
  var repeat__128654 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__128655 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__128654.call(this, n);
      case 2:
        return repeat__128655.call(this, n, x)
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
  var repeatedly__128657 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__128658 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__128657.call(this, n);
      case 2:
        return repeatedly__128658.call(this, n, f)
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
  var interleave__128664 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__128660 = cljs.core.seq.call(null, c1);
      var s2__128661 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____128662 = s1__128660;
        if(cljs.core.truth_(and__3546__auto____128662)) {
          return s2__128661
        }else {
          return and__3546__auto____128662
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__128660), cljs.core.cons.call(null, cljs.core.first.call(null, s2__128661), interleave.call(null, cljs.core.rest.call(null, s1__128660), cljs.core.rest.call(null, s2__128661))))
      }else {
        return null
      }
    })
  };
  var interleave__128665 = function() {
    var G__128667__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__128663 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__128663))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__128663), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__128663)))
        }else {
          return null
        }
      })
    };
    var G__128667 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128667__delegate.call(this, c1, c2, colls)
    };
    G__128667.cljs$lang$maxFixedArity = 2;
    G__128667.cljs$lang$applyTo = function(arglist__128668) {
      var c1 = cljs.core.first(arglist__128668);
      var c2 = cljs.core.first(cljs.core.next(arglist__128668));
      var colls = cljs.core.rest(cljs.core.next(arglist__128668));
      return G__128667__delegate.call(this, c1, c2, colls)
    };
    return G__128667
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__128664.call(this, c1, c2);
      default:
        return interleave__128665.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__128665.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__128671 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____128669 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____128669)) {
        var coll__128670 = temp__3695__auto____128669;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__128670), cat.call(null, cljs.core.rest.call(null, coll__128670), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__128671.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__128672 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__128673 = function() {
    var G__128675__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__128675 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__128675__delegate.call(this, f, coll, colls)
    };
    G__128675.cljs$lang$maxFixedArity = 2;
    G__128675.cljs$lang$applyTo = function(arglist__128676) {
      var f = cljs.core.first(arglist__128676);
      var coll = cljs.core.first(cljs.core.next(arglist__128676));
      var colls = cljs.core.rest(cljs.core.next(arglist__128676));
      return G__128675__delegate.call(this, f, coll, colls)
    };
    return G__128675
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__128672.call(this, f, coll);
      default:
        return mapcat__128673.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__128673.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____128677 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____128677)) {
      var s__128678 = temp__3698__auto____128677;
      var f__128679 = cljs.core.first.call(null, s__128678);
      var r__128680 = cljs.core.rest.call(null, s__128678);
      if(cljs.core.truth_(pred.call(null, f__128679))) {
        return cljs.core.cons.call(null, f__128679, filter.call(null, pred, r__128680))
      }else {
        return filter.call(null, pred, r__128680)
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
  var walk__128682 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__128682.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__128681_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__128681_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__128689 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__128690 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____128683 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____128683)) {
        var s__128684 = temp__3698__auto____128683;
        var p__128685 = cljs.core.take.call(null, n, s__128684);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__128685)))) {
          return cljs.core.cons.call(null, p__128685, partition.call(null, n, step, cljs.core.drop.call(null, step, s__128684)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__128691 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____128686 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____128686)) {
        var s__128687 = temp__3698__auto____128686;
        var p__128688 = cljs.core.take.call(null, n, s__128687);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__128688)))) {
          return cljs.core.cons.call(null, p__128688, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__128687)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__128688, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__128689.call(this, n, step);
      case 3:
        return partition__128690.call(this, n, step, pad);
      case 4:
        return partition__128691.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__128697 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__128698 = function(m, ks, not_found) {
    var sentinel__128693 = cljs.core.lookup_sentinel;
    var m__128694 = m;
    var ks__128695 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__128695)) {
        var m__128696 = cljs.core.get.call(null, m__128694, cljs.core.first.call(null, ks__128695), sentinel__128693);
        if(cljs.core.truth_(sentinel__128693 === m__128696)) {
          return not_found
        }else {
          var G__128700 = sentinel__128693;
          var G__128701 = m__128696;
          var G__128702 = cljs.core.next.call(null, ks__128695);
          sentinel__128693 = G__128700;
          m__128694 = G__128701;
          ks__128695 = G__128702;
          continue
        }
      }else {
        return m__128694
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__128697.call(this, m, ks);
      case 3:
        return get_in__128698.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__128703, v) {
  var vec__128704__128705 = p__128703;
  var k__128706 = cljs.core.nth.call(null, vec__128704__128705, 0, null);
  var ks__128707 = cljs.core.nthnext.call(null, vec__128704__128705, 1);
  if(cljs.core.truth_(ks__128707)) {
    return cljs.core.assoc.call(null, m, k__128706, assoc_in.call(null, cljs.core.get.call(null, m, k__128706), ks__128707, v))
  }else {
    return cljs.core.assoc.call(null, m, k__128706, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__128708, f, args) {
    var vec__128709__128710 = p__128708;
    var k__128711 = cljs.core.nth.call(null, vec__128709__128710, 0, null);
    var ks__128712 = cljs.core.nthnext.call(null, vec__128709__128710, 1);
    if(cljs.core.truth_(ks__128712)) {
      return cljs.core.assoc.call(null, m, k__128711, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__128711), ks__128712, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__128711, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__128711), args))
    }
  };
  var update_in = function(m, p__128708, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__128708, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__128713) {
    var m = cljs.core.first(arglist__128713);
    var p__128708 = cljs.core.first(cljs.core.next(arglist__128713));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__128713)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__128713)));
    return update_in__delegate.call(this, m, p__128708, f, args)
  };
  return update_in
}();
cljs.core.Vector = function(meta, array) {
  this.meta = meta;
  this.array = array
};
cljs.core.Vector.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Vector")
};
cljs.core.Vector.prototype.cljs$core$IHash$ = true;
cljs.core.Vector.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128714 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__128747 = null;
  var G__128747__128748 = function(coll, k) {
    var this__128715 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__128747__128749 = function(coll, k, not_found) {
    var this__128716 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__128747 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128747__128748.call(this, coll, k);
      case 3:
        return G__128747__128749.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128747
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__128717 = this;
  var new_array__128718 = cljs.core.aclone.call(null, this__128717.array);
  new_array__128718[k] = v;
  return new cljs.core.Vector(this__128717.meta, new_array__128718)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__128751 = null;
  var G__128751__128752 = function(tsym128719, k) {
    var this__128721 = this;
    var tsym128719__128722 = this;
    var coll__128723 = tsym128719__128722;
    return cljs.core._lookup.call(null, coll__128723, k)
  };
  var G__128751__128753 = function(tsym128720, k, not_found) {
    var this__128724 = this;
    var tsym128720__128725 = this;
    var coll__128726 = tsym128720__128725;
    return cljs.core._lookup.call(null, coll__128726, k, not_found)
  };
  G__128751 = function(tsym128720, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128751__128752.call(this, tsym128720, k);
      case 3:
        return G__128751__128753.call(this, tsym128720, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128751
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128727 = this;
  var new_array__128728 = cljs.core.aclone.call(null, this__128727.array);
  new_array__128728.push(o);
  return new cljs.core.Vector(this__128727.meta, new_array__128728)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__128755 = null;
  var G__128755__128756 = function(v, f) {
    var this__128729 = this;
    return cljs.core.ci_reduce.call(null, this__128729.array, f)
  };
  var G__128755__128757 = function(v, f, start) {
    var this__128730 = this;
    return cljs.core.ci_reduce.call(null, this__128730.array, f, start)
  };
  G__128755 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__128755__128756.call(this, v, f);
      case 3:
        return G__128755__128757.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128755
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128731 = this;
  if(cljs.core.truth_(this__128731.array.length > 0)) {
    var vector_seq__128732 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__128731.array.length)) {
          return cljs.core.cons.call(null, this__128731.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__128732.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128733 = this;
  return this__128733.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__128734 = this;
  var count__128735 = this__128734.array.length;
  if(cljs.core.truth_(count__128735 > 0)) {
    return this__128734.array[count__128735 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__128736 = this;
  if(cljs.core.truth_(this__128736.array.length > 0)) {
    var new_array__128737 = cljs.core.aclone.call(null, this__128736.array);
    new_array__128737.pop();
    return new cljs.core.Vector(this__128736.meta, new_array__128737)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__128738 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128739 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128740 = this;
  return new cljs.core.Vector(meta, this__128740.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128741 = this;
  return this__128741.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__128759 = null;
  var G__128759__128760 = function(coll, n) {
    var this__128742 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____128743 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____128743)) {
        return n < this__128742.array.length
      }else {
        return and__3546__auto____128743
      }
    }())) {
      return this__128742.array[n]
    }else {
      return null
    }
  };
  var G__128759__128761 = function(coll, n, not_found) {
    var this__128744 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____128745 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____128745)) {
        return n < this__128744.array.length
      }else {
        return and__3546__auto____128745
      }
    }())) {
      return this__128744.array[n]
    }else {
      return not_found
    }
  };
  G__128759 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128759__128760.call(this, coll, n);
      case 3:
        return G__128759__128761.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128759
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128746 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__128746.meta)
};
cljs.core.Vector;
cljs.core.Vector.EMPTY = new cljs.core.Vector(null, cljs.core.array.call(null));
cljs.core.Vector.fromArray = function(xs) {
  return new cljs.core.Vector(null, xs)
};
cljs.core.vec = function vec(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.Vector.EMPTY, coll)
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
  vector.cljs$lang$applyTo = function(arglist__128763) {
    var args = cljs.core.seq(arglist__128763);
    return vector__delegate.call(this, args)
  };
  return vector
}();
cljs.core.Subvec = function(meta, v, start, end) {
  this.meta = meta;
  this.v = v;
  this.start = start;
  this.end = end
};
cljs.core.Subvec.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Subvec")
};
cljs.core.Subvec.prototype.cljs$core$IHash$ = true;
cljs.core.Subvec.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128764 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__128792 = null;
  var G__128792__128793 = function(coll, k) {
    var this__128765 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__128792__128794 = function(coll, k, not_found) {
    var this__128766 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__128792 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128792__128793.call(this, coll, k);
      case 3:
        return G__128792__128794.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128792
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__128767 = this;
  var v_pos__128768 = this__128767.start + key;
  return new cljs.core.Subvec(this__128767.meta, cljs.core._assoc.call(null, this__128767.v, v_pos__128768, val), this__128767.start, this__128767.end > v_pos__128768 + 1 ? this__128767.end : v_pos__128768 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__128796 = null;
  var G__128796__128797 = function(tsym128769, k) {
    var this__128771 = this;
    var tsym128769__128772 = this;
    var coll__128773 = tsym128769__128772;
    return cljs.core._lookup.call(null, coll__128773, k)
  };
  var G__128796__128798 = function(tsym128770, k, not_found) {
    var this__128774 = this;
    var tsym128770__128775 = this;
    var coll__128776 = tsym128770__128775;
    return cljs.core._lookup.call(null, coll__128776, k, not_found)
  };
  G__128796 = function(tsym128770, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128796__128797.call(this, tsym128770, k);
      case 3:
        return G__128796__128798.call(this, tsym128770, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128796
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128777 = this;
  return new cljs.core.Subvec(this__128777.meta, cljs.core._assoc_n.call(null, this__128777.v, this__128777.end, o), this__128777.start, this__128777.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__128800 = null;
  var G__128800__128801 = function(coll, f) {
    var this__128778 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__128800__128802 = function(coll, f, start) {
    var this__128779 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__128800 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__128800__128801.call(this, coll, f);
      case 3:
        return G__128800__128802.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128800
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128780 = this;
  var subvec_seq__128781 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__128780.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__128780.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__128781.call(null, this__128780.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128782 = this;
  return this__128782.end - this__128782.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__128783 = this;
  return cljs.core._nth.call(null, this__128783.v, this__128783.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__128784 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__128784.start, this__128784.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__128784.meta, this__128784.v, this__128784.start, this__128784.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__128785 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128786 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128787 = this;
  return new cljs.core.Subvec(meta, this__128787.v, this__128787.start, this__128787.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128788 = this;
  return this__128788.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__128804 = null;
  var G__128804__128805 = function(coll, n) {
    var this__128789 = this;
    return cljs.core._nth.call(null, this__128789.v, this__128789.start + n)
  };
  var G__128804__128806 = function(coll, n, not_found) {
    var this__128790 = this;
    return cljs.core._nth.call(null, this__128790.v, this__128790.start + n, not_found)
  };
  G__128804 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128804__128805.call(this, coll, n);
      case 3:
        return G__128804__128806.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128804
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128791 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__128791.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__128808 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__128809 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__128808.call(this, v, start);
      case 3:
        return subvec__128809.call(this, v, start, end)
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
cljs.core.PersistentQueueSeq.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentQueueSeq")
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128811 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128812 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128813 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128814 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__128814.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128815 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__128816 = this;
  return cljs.core._first.call(null, this__128816.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__128817 = this;
  var temp__3695__auto____128818 = cljs.core.next.call(null, this__128817.front);
  if(cljs.core.truth_(temp__3695__auto____128818)) {
    var f1__128819 = temp__3695__auto____128818;
    return new cljs.core.PersistentQueueSeq(this__128817.meta, f1__128819, this__128817.rear)
  }else {
    if(cljs.core.truth_(this__128817.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__128817.meta, this__128817.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128820 = this;
  return this__128820.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128821 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__128821.front, this__128821.rear)
};
cljs.core.PersistentQueueSeq;
cljs.core.PersistentQueue = function(meta, count, front, rear) {
  this.meta = meta;
  this.count = count;
  this.front = front;
  this.rear = rear
};
cljs.core.PersistentQueue.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentQueue")
};
cljs.core.PersistentQueue.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128822 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128823 = this;
  if(cljs.core.truth_(this__128823.front)) {
    return new cljs.core.PersistentQueue(this__128823.meta, this__128823.count + 1, this__128823.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____128824 = this__128823.rear;
      if(cljs.core.truth_(or__3548__auto____128824)) {
        return or__3548__auto____128824
      }else {
        return cljs.core.Vector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__128823.meta, this__128823.count + 1, cljs.core.conj.call(null, this__128823.front, o), cljs.core.Vector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128825 = this;
  var rear__128826 = cljs.core.seq.call(null, this__128825.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____128827 = this__128825.front;
    if(cljs.core.truth_(or__3548__auto____128827)) {
      return or__3548__auto____128827
    }else {
      return rear__128826
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__128825.front, cljs.core.seq.call(null, rear__128826))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128828 = this;
  return this__128828.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__128829 = this;
  return cljs.core._first.call(null, this__128829.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__128830 = this;
  if(cljs.core.truth_(this__128830.front)) {
    var temp__3695__auto____128831 = cljs.core.next.call(null, this__128830.front);
    if(cljs.core.truth_(temp__3695__auto____128831)) {
      var f1__128832 = temp__3695__auto____128831;
      return new cljs.core.PersistentQueue(this__128830.meta, this__128830.count - 1, f1__128832, this__128830.rear)
    }else {
      return new cljs.core.PersistentQueue(this__128830.meta, this__128830.count - 1, cljs.core.seq.call(null, this__128830.rear), cljs.core.Vector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__128833 = this;
  return cljs.core.first.call(null, this__128833.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__128834 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128835 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128836 = this;
  return new cljs.core.PersistentQueue(meta, this__128836.count, this__128836.front, this__128836.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128837 = this;
  return this__128837.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128838 = this;
  return cljs.core.PersistentQueue.EMPTY
};
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = new cljs.core.PersistentQueue(null, 0, null, cljs.core.Vector.fromArray([]));
cljs.core.NeverEquiv = function() {
};
cljs.core.NeverEquiv.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.NeverEquiv")
};
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$ = true;
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__128839 = this;
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
  var len__128840 = array.length;
  var i__128841 = 0;
  while(true) {
    if(cljs.core.truth_(i__128841 < len__128840)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__128841]))) {
        return i__128841
      }else {
        var G__128842 = i__128841 + incr;
        i__128841 = G__128842;
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
  var obj_map_contains_key_QMARK___128844 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___128845 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____128843 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____128843)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____128843
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
        return obj_map_contains_key_QMARK___128844.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___128845.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__128848 = cljs.core.hash.call(null, a);
  var b__128849 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__128848 < b__128849)) {
    return-1
  }else {
    if(cljs.core.truth_(a__128848 > b__128849)) {
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
cljs.core.ObjMap.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.ObjMap")
};
cljs.core.ObjMap.prototype.cljs$core$IHash$ = true;
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128850 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__128877 = null;
  var G__128877__128878 = function(coll, k) {
    var this__128851 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__128877__128879 = function(coll, k, not_found) {
    var this__128852 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__128852.strobj, this__128852.strobj[k], not_found)
  };
  G__128877 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128877__128878.call(this, coll, k);
      case 3:
        return G__128877__128879.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128877
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__128853 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__128854 = goog.object.clone.call(null, this__128853.strobj);
    var overwrite_QMARK___128855 = new_strobj__128854.hasOwnProperty(k);
    new_strobj__128854[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___128855)) {
      return new cljs.core.ObjMap(this__128853.meta, this__128853.keys, new_strobj__128854)
    }else {
      var new_keys__128856 = cljs.core.aclone.call(null, this__128853.keys);
      new_keys__128856.push(k);
      return new cljs.core.ObjMap(this__128853.meta, new_keys__128856, new_strobj__128854)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__128853.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__128857 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__128857.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__128881 = null;
  var G__128881__128882 = function(tsym128858, k) {
    var this__128860 = this;
    var tsym128858__128861 = this;
    var coll__128862 = tsym128858__128861;
    return cljs.core._lookup.call(null, coll__128862, k)
  };
  var G__128881__128883 = function(tsym128859, k, not_found) {
    var this__128863 = this;
    var tsym128859__128864 = this;
    var coll__128865 = tsym128859__128864;
    return cljs.core._lookup.call(null, coll__128865, k, not_found)
  };
  G__128881 = function(tsym128859, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128881__128882.call(this, tsym128859, k);
      case 3:
        return G__128881__128883.call(this, tsym128859, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128881
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__128866 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128867 = this;
  if(cljs.core.truth_(this__128867.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__128847_SHARP_) {
      return cljs.core.vector.call(null, p1__128847_SHARP_, this__128867.strobj[p1__128847_SHARP_])
    }, this__128867.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128868 = this;
  return this__128868.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128869 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128870 = this;
  return new cljs.core.ObjMap(meta, this__128870.keys, this__128870.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128871 = this;
  return this__128871.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128872 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__128872.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__128873 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____128874 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____128874)) {
      return this__128873.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____128874
    }
  }())) {
    var new_keys__128875 = cljs.core.aclone.call(null, this__128873.keys);
    var new_strobj__128876 = goog.object.clone.call(null, this__128873.strobj);
    new_keys__128875.splice(cljs.core.scan_array.call(null, 1, k, new_keys__128875), 1);
    cljs.core.js_delete.call(null, new_strobj__128876, k);
    return new cljs.core.ObjMap(this__128873.meta, new_keys__128875, new_strobj__128876)
  }else {
    return coll
  }
};
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = new cljs.core.ObjMap(null, cljs.core.array.call(null), cljs.core.js_obj.call(null));
cljs.core.ObjMap.fromObject = function(ks, obj) {
  return new cljs.core.ObjMap(null, ks, obj)
};
cljs.core.HashMap = function(meta, count, hashobj) {
  this.meta = meta;
  this.count = count;
  this.hashobj = hashobj
};
cljs.core.HashMap.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.HashMap")
};
cljs.core.HashMap.prototype.cljs$core$IHash$ = true;
cljs.core.HashMap.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128886 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__128924 = null;
  var G__128924__128925 = function(coll, k) {
    var this__128887 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__128924__128926 = function(coll, k, not_found) {
    var this__128888 = this;
    var bucket__128889 = this__128888.hashobj[cljs.core.hash.call(null, k)];
    var i__128890 = cljs.core.truth_(bucket__128889) ? cljs.core.scan_array.call(null, 2, k, bucket__128889) : null;
    if(cljs.core.truth_(i__128890)) {
      return bucket__128889[i__128890 + 1]
    }else {
      return not_found
    }
  };
  G__128924 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128924__128925.call(this, coll, k);
      case 3:
        return G__128924__128926.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128924
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__128891 = this;
  var h__128892 = cljs.core.hash.call(null, k);
  var bucket__128893 = this__128891.hashobj[h__128892];
  if(cljs.core.truth_(bucket__128893)) {
    var new_bucket__128894 = cljs.core.aclone.call(null, bucket__128893);
    var new_hashobj__128895 = goog.object.clone.call(null, this__128891.hashobj);
    new_hashobj__128895[h__128892] = new_bucket__128894;
    var temp__3695__auto____128896 = cljs.core.scan_array.call(null, 2, k, new_bucket__128894);
    if(cljs.core.truth_(temp__3695__auto____128896)) {
      var i__128897 = temp__3695__auto____128896;
      new_bucket__128894[i__128897 + 1] = v;
      return new cljs.core.HashMap(this__128891.meta, this__128891.count, new_hashobj__128895)
    }else {
      new_bucket__128894.push(k, v);
      return new cljs.core.HashMap(this__128891.meta, this__128891.count + 1, new_hashobj__128895)
    }
  }else {
    var new_hashobj__128898 = goog.object.clone.call(null, this__128891.hashobj);
    new_hashobj__128898[h__128892] = cljs.core.array.call(null, k, v);
    return new cljs.core.HashMap(this__128891.meta, this__128891.count + 1, new_hashobj__128898)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__128899 = this;
  var bucket__128900 = this__128899.hashobj[cljs.core.hash.call(null, k)];
  var i__128901 = cljs.core.truth_(bucket__128900) ? cljs.core.scan_array.call(null, 2, k, bucket__128900) : null;
  if(cljs.core.truth_(i__128901)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__128928 = null;
  var G__128928__128929 = function(tsym128902, k) {
    var this__128904 = this;
    var tsym128902__128905 = this;
    var coll__128906 = tsym128902__128905;
    return cljs.core._lookup.call(null, coll__128906, k)
  };
  var G__128928__128930 = function(tsym128903, k, not_found) {
    var this__128907 = this;
    var tsym128903__128908 = this;
    var coll__128909 = tsym128903__128908;
    return cljs.core._lookup.call(null, coll__128909, k, not_found)
  };
  G__128928 = function(tsym128903, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128928__128929.call(this, tsym128903, k);
      case 3:
        return G__128928__128930.call(this, tsym128903, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128928
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__128910 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128911 = this;
  if(cljs.core.truth_(this__128911.count > 0)) {
    var hashes__128912 = cljs.core.js_keys.call(null, this__128911.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__128885_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__128911.hashobj[p1__128885_SHARP_]))
    }, hashes__128912)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128913 = this;
  return this__128913.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128914 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128915 = this;
  return new cljs.core.HashMap(meta, this__128915.count, this__128915.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128916 = this;
  return this__128916.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128917 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__128917.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__128918 = this;
  var h__128919 = cljs.core.hash.call(null, k);
  var bucket__128920 = this__128918.hashobj[h__128919];
  var i__128921 = cljs.core.truth_(bucket__128920) ? cljs.core.scan_array.call(null, 2, k, bucket__128920) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__128921))) {
    return coll
  }else {
    var new_hashobj__128922 = goog.object.clone.call(null, this__128918.hashobj);
    if(cljs.core.truth_(3 > bucket__128920.length)) {
      cljs.core.js_delete.call(null, new_hashobj__128922, h__128919)
    }else {
      var new_bucket__128923 = cljs.core.aclone.call(null, bucket__128920);
      new_bucket__128923.splice(i__128921, 2);
      new_hashobj__128922[h__128919] = new_bucket__128923
    }
    return new cljs.core.HashMap(this__128918.meta, this__128918.count - 1, new_hashobj__128922)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__128932 = ks.length;
  var i__128933 = 0;
  var out__128934 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__128933 < len__128932)) {
      var G__128935 = i__128933 + 1;
      var G__128936 = cljs.core.assoc.call(null, out__128934, ks[i__128933], vs[i__128933]);
      i__128933 = G__128935;
      out__128934 = G__128936;
      continue
    }else {
      return out__128934
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__128937 = cljs.core.seq.call(null, keyvals);
    var out__128938 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__128937)) {
        var G__128939 = cljs.core.nnext.call(null, in$__128937);
        var G__128940 = cljs.core.assoc.call(null, out__128938, cljs.core.first.call(null, in$__128937), cljs.core.second.call(null, in$__128937));
        in$__128937 = G__128939;
        out__128938 = G__128940;
        continue
      }else {
        return out__128938
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
  hash_map.cljs$lang$applyTo = function(arglist__128941) {
    var keyvals = cljs.core.seq(arglist__128941);
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
      return cljs.core.reduce.call(null, function(p1__128942_SHARP_, p2__128943_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____128944 = p1__128942_SHARP_;
          if(cljs.core.truth_(or__3548__auto____128944)) {
            return or__3548__auto____128944
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__128943_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__128945) {
    var maps = cljs.core.seq(arglist__128945);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__128948 = function(m, e) {
        var k__128946 = cljs.core.first.call(null, e);
        var v__128947 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__128946))) {
          return cljs.core.assoc.call(null, m, k__128946, f.call(null, cljs.core.get.call(null, m, k__128946), v__128947))
        }else {
          return cljs.core.assoc.call(null, m, k__128946, v__128947)
        }
      };
      var merge2__128950 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__128948, function() {
          var or__3548__auto____128949 = m1;
          if(cljs.core.truth_(or__3548__auto____128949)) {
            return or__3548__auto____128949
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__128950, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__128951) {
    var f = cljs.core.first(arglist__128951);
    var maps = cljs.core.rest(arglist__128951);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__128953 = cljs.core.ObjMap.fromObject([], {});
  var keys__128954 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__128954)) {
      var key__128955 = cljs.core.first.call(null, keys__128954);
      var entry__128956 = cljs.core.get.call(null, map, key__128955, "\ufdd0'user/not-found");
      var G__128957 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__128956, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__128953, key__128955, entry__128956) : ret__128953;
      var G__128958 = cljs.core.next.call(null, keys__128954);
      ret__128953 = G__128957;
      keys__128954 = G__128958;
      continue
    }else {
      return ret__128953
    }
    break
  }
};
cljs.core.Set = function(meta, hash_map) {
  this.meta = meta;
  this.hash_map = hash_map
};
cljs.core.Set.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Set")
};
cljs.core.Set.prototype.cljs$core$IHash$ = true;
cljs.core.Set.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__128959 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__128980 = null;
  var G__128980__128981 = function(coll, v) {
    var this__128960 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__128980__128982 = function(coll, v, not_found) {
    var this__128961 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__128961.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__128980 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128980__128981.call(this, coll, v);
      case 3:
        return G__128980__128982.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128980
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__128984 = null;
  var G__128984__128985 = function(tsym128962, k) {
    var this__128964 = this;
    var tsym128962__128965 = this;
    var coll__128966 = tsym128962__128965;
    return cljs.core._lookup.call(null, coll__128966, k)
  };
  var G__128984__128986 = function(tsym128963, k, not_found) {
    var this__128967 = this;
    var tsym128963__128968 = this;
    var coll__128969 = tsym128963__128968;
    return cljs.core._lookup.call(null, coll__128969, k, not_found)
  };
  G__128984 = function(tsym128963, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__128984__128985.call(this, tsym128963, k);
      case 3:
        return G__128984__128986.call(this, tsym128963, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__128984
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__128970 = this;
  return new cljs.core.Set(this__128970.meta, cljs.core.assoc.call(null, this__128970.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__128971 = this;
  return cljs.core.keys.call(null, this__128971.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__128972 = this;
  return new cljs.core.Set(this__128972.meta, cljs.core.dissoc.call(null, this__128972.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__128973 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__128974 = this;
  var and__3546__auto____128975 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____128975)) {
    var and__3546__auto____128976 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____128976)) {
      return cljs.core.every_QMARK_.call(null, function(p1__128952_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__128952_SHARP_)
      }, other)
    }else {
      return and__3546__auto____128976
    }
  }else {
    return and__3546__auto____128975
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__128977 = this;
  return new cljs.core.Set(meta, this__128977.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__128978 = this;
  return this__128978.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__128979 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__128979.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__128989 = cljs.core.seq.call(null, coll);
  var out__128990 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__128989)))) {
      var G__128991 = cljs.core.rest.call(null, in$__128989);
      var G__128992 = cljs.core.conj.call(null, out__128990, cljs.core.first.call(null, in$__128989));
      in$__128989 = G__128991;
      out__128990 = G__128992;
      continue
    }else {
      return out__128990
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__128993 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____128994 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____128994)) {
        var e__128995 = temp__3695__auto____128994;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__128995))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__128993, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__128988_SHARP_) {
      var temp__3695__auto____128996 = cljs.core.find.call(null, smap, p1__128988_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____128996)) {
        var e__128997 = temp__3695__auto____128996;
        return cljs.core.second.call(null, e__128997)
      }else {
        return p1__128988_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__129005 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__128998, seen) {
        while(true) {
          var vec__128999__129000 = p__128998;
          var f__129001 = cljs.core.nth.call(null, vec__128999__129000, 0, null);
          var xs__129002 = vec__128999__129000;
          var temp__3698__auto____129003 = cljs.core.seq.call(null, xs__129002);
          if(cljs.core.truth_(temp__3698__auto____129003)) {
            var s__129004 = temp__3698__auto____129003;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__129001))) {
              var G__129006 = cljs.core.rest.call(null, s__129004);
              var G__129007 = seen;
              p__128998 = G__129006;
              seen = G__129007;
              continue
            }else {
              return cljs.core.cons.call(null, f__129001, step.call(null, cljs.core.rest.call(null, s__129004), cljs.core.conj.call(null, seen, f__129001)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__129005.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__129008 = cljs.core.Vector.fromArray([]);
  var s__129009 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__129009))) {
      var G__129010 = cljs.core.conj.call(null, ret__129008, cljs.core.first.call(null, s__129009));
      var G__129011 = cljs.core.next.call(null, s__129009);
      ret__129008 = G__129010;
      s__129009 = G__129011;
      continue
    }else {
      return cljs.core.seq.call(null, ret__129008)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____129012 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____129012)) {
        return or__3548__auto____129012
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__129013 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__129013 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__129013 + 1)
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
    var or__3548__auto____129014 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____129014)) {
      return or__3548__auto____129014
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__129015 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__129015 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__129015)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__129018 = cljs.core.ObjMap.fromObject([], {});
  var ks__129019 = cljs.core.seq.call(null, keys);
  var vs__129020 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____129021 = ks__129019;
      if(cljs.core.truth_(and__3546__auto____129021)) {
        return vs__129020
      }else {
        return and__3546__auto____129021
      }
    }())) {
      var G__129022 = cljs.core.assoc.call(null, map__129018, cljs.core.first.call(null, ks__129019), cljs.core.first.call(null, vs__129020));
      var G__129023 = cljs.core.next.call(null, ks__129019);
      var G__129024 = cljs.core.next.call(null, vs__129020);
      map__129018 = G__129022;
      ks__129019 = G__129023;
      vs__129020 = G__129024;
      continue
    }else {
      return map__129018
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__129027 = function(k, x) {
    return x
  };
  var max_key__129028 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__129029 = function() {
    var G__129031__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__129016_SHARP_, p2__129017_SHARP_) {
        return max_key.call(null, k, p1__129016_SHARP_, p2__129017_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__129031 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__129031__delegate.call(this, k, x, y, more)
    };
    G__129031.cljs$lang$maxFixedArity = 3;
    G__129031.cljs$lang$applyTo = function(arglist__129032) {
      var k = cljs.core.first(arglist__129032);
      var x = cljs.core.first(cljs.core.next(arglist__129032));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129032)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129032)));
      return G__129031__delegate.call(this, k, x, y, more)
    };
    return G__129031
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__129027.call(this, k, x);
      case 3:
        return max_key__129028.call(this, k, x, y);
      default:
        return max_key__129029.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__129029.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__129033 = function(k, x) {
    return x
  };
  var min_key__129034 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__129035 = function() {
    var G__129037__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__129025_SHARP_, p2__129026_SHARP_) {
        return min_key.call(null, k, p1__129025_SHARP_, p2__129026_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__129037 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__129037__delegate.call(this, k, x, y, more)
    };
    G__129037.cljs$lang$maxFixedArity = 3;
    G__129037.cljs$lang$applyTo = function(arglist__129038) {
      var k = cljs.core.first(arglist__129038);
      var x = cljs.core.first(cljs.core.next(arglist__129038));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129038)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129038)));
      return G__129037__delegate.call(this, k, x, y, more)
    };
    return G__129037
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__129033.call(this, k, x);
      case 3:
        return min_key__129034.call(this, k, x, y);
      default:
        return min_key__129035.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__129035.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__129041 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__129042 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____129039 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____129039)) {
        var s__129040 = temp__3698__auto____129039;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__129040), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__129040)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__129041.call(this, n, step);
      case 3:
        return partition_all__129042.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____129044 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____129044)) {
      var s__129045 = temp__3698__auto____129044;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__129045)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__129045), take_while.call(null, pred, cljs.core.rest.call(null, s__129045)))
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
cljs.core.Range.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Range")
};
cljs.core.Range.prototype.cljs$core$IHash$ = true;
cljs.core.Range.prototype.cljs$core$IHash$_hash = function(rng) {
  var this__129046 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__129047 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__129063 = null;
  var G__129063__129064 = function(rng, f) {
    var this__129048 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__129063__129065 = function(rng, f, s) {
    var this__129049 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__129063 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__129063__129064.call(this, rng, f);
      case 3:
        return G__129063__129065.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__129063
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__129050 = this;
  var comp__129051 = cljs.core.truth_(this__129050.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__129051.call(null, this__129050.start, this__129050.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__129052 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__129052.end - this__129052.start) / this__129052.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__129053 = this;
  return this__129053.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__129054 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__129054.meta, this__129054.start + this__129054.step, this__129054.end, this__129054.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__129055 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__129056 = this;
  return new cljs.core.Range(meta, this__129056.start, this__129056.end, this__129056.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__129057 = this;
  return this__129057.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__129067 = null;
  var G__129067__129068 = function(rng, n) {
    var this__129058 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__129058.start + n * this__129058.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____129059 = this__129058.start > this__129058.end;
        if(cljs.core.truth_(and__3546__auto____129059)) {
          return cljs.core._EQ_.call(null, this__129058.step, 0)
        }else {
          return and__3546__auto____129059
        }
      }())) {
        return this__129058.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__129067__129069 = function(rng, n, not_found) {
    var this__129060 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__129060.start + n * this__129060.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____129061 = this__129060.start > this__129060.end;
        if(cljs.core.truth_(and__3546__auto____129061)) {
          return cljs.core._EQ_.call(null, this__129060.step, 0)
        }else {
          return and__3546__auto____129061
        }
      }())) {
        return this__129060.start
      }else {
        return not_found
      }
    }
  };
  G__129067 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__129067__129068.call(this, rng, n);
      case 3:
        return G__129067__129069.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__129067
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__129062 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__129062.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__129071 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__129072 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__129073 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__129074 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__129071.call(this);
      case 1:
        return range__129072.call(this, start);
      case 2:
        return range__129073.call(this, start, end);
      case 3:
        return range__129074.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____129076 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____129076)) {
      var s__129077 = temp__3698__auto____129076;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__129077), take_nth.call(null, n, cljs.core.drop.call(null, n, s__129077)))
    }else {
      return null
    }
  })
};
cljs.core.split_with = function split_with(pred, coll) {
  return cljs.core.Vector.fromArray([cljs.core.take_while.call(null, pred, coll), cljs.core.drop_while.call(null, pred, coll)])
};
cljs.core.partition_by = function partition_by(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____129079 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____129079)) {
      var s__129080 = temp__3698__auto____129079;
      var fst__129081 = cljs.core.first.call(null, s__129080);
      var fv__129082 = f.call(null, fst__129081);
      var run__129083 = cljs.core.cons.call(null, fst__129081, cljs.core.take_while.call(null, function(p1__129078_SHARP_) {
        return cljs.core._EQ_.call(null, fv__129082, f.call(null, p1__129078_SHARP_))
      }, cljs.core.next.call(null, s__129080)));
      return cljs.core.cons.call(null, run__129083, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__129083), s__129080))))
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
  var reductions__129098 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____129094 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____129094)) {
        var s__129095 = temp__3695__auto____129094;
        return reductions.call(null, f, cljs.core.first.call(null, s__129095), cljs.core.rest.call(null, s__129095))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__129099 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____129096 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____129096)) {
        var s__129097 = temp__3698__auto____129096;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__129097)), cljs.core.rest.call(null, s__129097))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__129098.call(this, f, init);
      case 3:
        return reductions__129099.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__129102 = function(f) {
    return function() {
      var G__129107 = null;
      var G__129107__129108 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__129107__129109 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__129107__129110 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__129107__129111 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__129107__129112 = function() {
        var G__129114__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__129114 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__129114__delegate.call(this, x, y, z, args)
        };
        G__129114.cljs$lang$maxFixedArity = 3;
        G__129114.cljs$lang$applyTo = function(arglist__129115) {
          var x = cljs.core.first(arglist__129115);
          var y = cljs.core.first(cljs.core.next(arglist__129115));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129115)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129115)));
          return G__129114__delegate.call(this, x, y, z, args)
        };
        return G__129114
      }();
      G__129107 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__129107__129108.call(this);
          case 1:
            return G__129107__129109.call(this, x);
          case 2:
            return G__129107__129110.call(this, x, y);
          case 3:
            return G__129107__129111.call(this, x, y, z);
          default:
            return G__129107__129112.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__129107.cljs$lang$maxFixedArity = 3;
      G__129107.cljs$lang$applyTo = G__129107__129112.cljs$lang$applyTo;
      return G__129107
    }()
  };
  var juxt__129103 = function(f, g) {
    return function() {
      var G__129116 = null;
      var G__129116__129117 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__129116__129118 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__129116__129119 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__129116__129120 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__129116__129121 = function() {
        var G__129123__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__129123 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__129123__delegate.call(this, x, y, z, args)
        };
        G__129123.cljs$lang$maxFixedArity = 3;
        G__129123.cljs$lang$applyTo = function(arglist__129124) {
          var x = cljs.core.first(arglist__129124);
          var y = cljs.core.first(cljs.core.next(arglist__129124));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129124)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129124)));
          return G__129123__delegate.call(this, x, y, z, args)
        };
        return G__129123
      }();
      G__129116 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__129116__129117.call(this);
          case 1:
            return G__129116__129118.call(this, x);
          case 2:
            return G__129116__129119.call(this, x, y);
          case 3:
            return G__129116__129120.call(this, x, y, z);
          default:
            return G__129116__129121.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__129116.cljs$lang$maxFixedArity = 3;
      G__129116.cljs$lang$applyTo = G__129116__129121.cljs$lang$applyTo;
      return G__129116
    }()
  };
  var juxt__129104 = function(f, g, h) {
    return function() {
      var G__129125 = null;
      var G__129125__129126 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__129125__129127 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__129125__129128 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__129125__129129 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__129125__129130 = function() {
        var G__129132__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__129132 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__129132__delegate.call(this, x, y, z, args)
        };
        G__129132.cljs$lang$maxFixedArity = 3;
        G__129132.cljs$lang$applyTo = function(arglist__129133) {
          var x = cljs.core.first(arglist__129133);
          var y = cljs.core.first(cljs.core.next(arglist__129133));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129133)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129133)));
          return G__129132__delegate.call(this, x, y, z, args)
        };
        return G__129132
      }();
      G__129125 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__129125__129126.call(this);
          case 1:
            return G__129125__129127.call(this, x);
          case 2:
            return G__129125__129128.call(this, x, y);
          case 3:
            return G__129125__129129.call(this, x, y, z);
          default:
            return G__129125__129130.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__129125.cljs$lang$maxFixedArity = 3;
      G__129125.cljs$lang$applyTo = G__129125__129130.cljs$lang$applyTo;
      return G__129125
    }()
  };
  var juxt__129105 = function() {
    var G__129134__delegate = function(f, g, h, fs) {
      var fs__129101 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__129135 = null;
        var G__129135__129136 = function() {
          return cljs.core.reduce.call(null, function(p1__129084_SHARP_, p2__129085_SHARP_) {
            return cljs.core.conj.call(null, p1__129084_SHARP_, p2__129085_SHARP_.call(null))
          }, cljs.core.Vector.fromArray([]), fs__129101)
        };
        var G__129135__129137 = function(x) {
          return cljs.core.reduce.call(null, function(p1__129086_SHARP_, p2__129087_SHARP_) {
            return cljs.core.conj.call(null, p1__129086_SHARP_, p2__129087_SHARP_.call(null, x))
          }, cljs.core.Vector.fromArray([]), fs__129101)
        };
        var G__129135__129138 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__129088_SHARP_, p2__129089_SHARP_) {
            return cljs.core.conj.call(null, p1__129088_SHARP_, p2__129089_SHARP_.call(null, x, y))
          }, cljs.core.Vector.fromArray([]), fs__129101)
        };
        var G__129135__129139 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__129090_SHARP_, p2__129091_SHARP_) {
            return cljs.core.conj.call(null, p1__129090_SHARP_, p2__129091_SHARP_.call(null, x, y, z))
          }, cljs.core.Vector.fromArray([]), fs__129101)
        };
        var G__129135__129140 = function() {
          var G__129142__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__129092_SHARP_, p2__129093_SHARP_) {
              return cljs.core.conj.call(null, p1__129092_SHARP_, cljs.core.apply.call(null, p2__129093_SHARP_, x, y, z, args))
            }, cljs.core.Vector.fromArray([]), fs__129101)
          };
          var G__129142 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__129142__delegate.call(this, x, y, z, args)
          };
          G__129142.cljs$lang$maxFixedArity = 3;
          G__129142.cljs$lang$applyTo = function(arglist__129143) {
            var x = cljs.core.first(arglist__129143);
            var y = cljs.core.first(cljs.core.next(arglist__129143));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129143)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129143)));
            return G__129142__delegate.call(this, x, y, z, args)
          };
          return G__129142
        }();
        G__129135 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__129135__129136.call(this);
            case 1:
              return G__129135__129137.call(this, x);
            case 2:
              return G__129135__129138.call(this, x, y);
            case 3:
              return G__129135__129139.call(this, x, y, z);
            default:
              return G__129135__129140.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__129135.cljs$lang$maxFixedArity = 3;
        G__129135.cljs$lang$applyTo = G__129135__129140.cljs$lang$applyTo;
        return G__129135
      }()
    };
    var G__129134 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__129134__delegate.call(this, f, g, h, fs)
    };
    G__129134.cljs$lang$maxFixedArity = 3;
    G__129134.cljs$lang$applyTo = function(arglist__129144) {
      var f = cljs.core.first(arglist__129144);
      var g = cljs.core.first(cljs.core.next(arglist__129144));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129144)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__129144)));
      return G__129134__delegate.call(this, f, g, h, fs)
    };
    return G__129134
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__129102.call(this, f);
      case 2:
        return juxt__129103.call(this, f, g);
      case 3:
        return juxt__129104.call(this, f, g, h);
      default:
        return juxt__129105.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__129105.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__129146 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__129149 = cljs.core.next.call(null, coll);
        coll = G__129149;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__129147 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____129145 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____129145)) {
          return n > 0
        }else {
          return and__3546__auto____129145
        }
      }())) {
        var G__129150 = n - 1;
        var G__129151 = cljs.core.next.call(null, coll);
        n = G__129150;
        coll = G__129151;
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
        return dorun__129146.call(this, n);
      case 2:
        return dorun__129147.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__129152 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__129153 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__129152.call(this, n);
      case 2:
        return doall__129153.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__129155 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__129155), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__129155), 1))) {
      return cljs.core.first.call(null, matches__129155)
    }else {
      return cljs.core.vec.call(null, matches__129155)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__129156 = re.exec(s);
  if(cljs.core.truth_(matches__129156 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__129156), 1))) {
      return cljs.core.first.call(null, matches__129156)
    }else {
      return cljs.core.vec.call(null, matches__129156)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__129157 = cljs.core.re_find.call(null, re, s);
  var match_idx__129158 = s.search(re);
  var match_str__129159 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__129157)) ? cljs.core.first.call(null, match_data__129157) : match_data__129157;
  var post_match__129160 = cljs.core.subs.call(null, s, match_idx__129158 + cljs.core.count.call(null, match_str__129159));
  if(cljs.core.truth_(match_data__129157)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__129157, re_seq.call(null, re, post_match__129160))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__129162__129163 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___129164 = cljs.core.nth.call(null, vec__129162__129163, 0, null);
  var flags__129165 = cljs.core.nth.call(null, vec__129162__129163, 1, null);
  var pattern__129166 = cljs.core.nth.call(null, vec__129162__129163, 2, null);
  return new RegExp(pattern__129166, flags__129165)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.Vector.fromArray([sep]), cljs.core.map.call(null, function(p1__129161_SHARP_) {
    return print_one.call(null, p1__129161_SHARP_, opts)
  }, coll))), cljs.core.Vector.fromArray([end]))
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
          var and__3546__auto____129167 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____129167)) {
            var and__3546__auto____129171 = function() {
              var x__450__auto____129168 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____129169 = x__450__auto____129168;
                if(cljs.core.truth_(and__3546__auto____129169)) {
                  var and__3546__auto____129170 = x__450__auto____129168.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____129170)) {
                    return cljs.core.not.call(null, x__450__auto____129168.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____129170
                  }
                }else {
                  return and__3546__auto____129169
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____129168)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____129171)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____129171
            }
          }else {
            return and__3546__auto____129167
          }
        }()) ? cljs.core.concat.call(null, cljs.core.Vector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.Vector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__450__auto____129172 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____129173 = x__450__auto____129172;
            if(cljs.core.truth_(and__3546__auto____129173)) {
              var and__3546__auto____129174 = x__450__auto____129172.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____129174)) {
                return cljs.core.not.call(null, x__450__auto____129172.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____129174
              }
            }else {
              return and__3546__auto____129173
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__450__auto____129172)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__129175 = cljs.core.first.call(null, objs);
  var sb__129176 = new goog.string.StringBuffer;
  var G__129177__129178 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__129177__129178)) {
    var obj__129179 = cljs.core.first.call(null, G__129177__129178);
    var G__129177__129180 = G__129177__129178;
    while(true) {
      if(cljs.core.truth_(obj__129179 === first_obj__129175)) {
      }else {
        sb__129176.append(" ")
      }
      var G__129181__129182 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__129179, opts));
      if(cljs.core.truth_(G__129181__129182)) {
        var string__129183 = cljs.core.first.call(null, G__129181__129182);
        var G__129181__129184 = G__129181__129182;
        while(true) {
          sb__129176.append(string__129183);
          var temp__3698__auto____129185 = cljs.core.next.call(null, G__129181__129184);
          if(cljs.core.truth_(temp__3698__auto____129185)) {
            var G__129181__129186 = temp__3698__auto____129185;
            var G__129189 = cljs.core.first.call(null, G__129181__129186);
            var G__129190 = G__129181__129186;
            string__129183 = G__129189;
            G__129181__129184 = G__129190;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____129187 = cljs.core.next.call(null, G__129177__129180);
      if(cljs.core.truth_(temp__3698__auto____129187)) {
        var G__129177__129188 = temp__3698__auto____129187;
        var G__129191 = cljs.core.first.call(null, G__129177__129188);
        var G__129192 = G__129177__129188;
        obj__129179 = G__129191;
        G__129177__129180 = G__129192;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__129176)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__129193 = cljs.core.first.call(null, objs);
  var G__129194__129195 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__129194__129195)) {
    var obj__129196 = cljs.core.first.call(null, G__129194__129195);
    var G__129194__129197 = G__129194__129195;
    while(true) {
      if(cljs.core.truth_(obj__129196 === first_obj__129193)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__129198__129199 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__129196, opts));
      if(cljs.core.truth_(G__129198__129199)) {
        var string__129200 = cljs.core.first.call(null, G__129198__129199);
        var G__129198__129201 = G__129198__129199;
        while(true) {
          cljs.core.string_print.call(null, string__129200);
          var temp__3698__auto____129202 = cljs.core.next.call(null, G__129198__129201);
          if(cljs.core.truth_(temp__3698__auto____129202)) {
            var G__129198__129203 = temp__3698__auto____129202;
            var G__129206 = cljs.core.first.call(null, G__129198__129203);
            var G__129207 = G__129198__129203;
            string__129200 = G__129206;
            G__129198__129201 = G__129207;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____129204 = cljs.core.next.call(null, G__129194__129197);
      if(cljs.core.truth_(temp__3698__auto____129204)) {
        var G__129194__129205 = temp__3698__auto____129204;
        var G__129208 = cljs.core.first.call(null, G__129194__129205);
        var G__129209 = G__129194__129205;
        obj__129196 = G__129208;
        G__129194__129197 = G__129209;
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
  pr_str.cljs$lang$applyTo = function(arglist__129210) {
    var objs = cljs.core.seq(arglist__129210);
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
  pr.cljs$lang$applyTo = function(arglist__129211) {
    var objs = cljs.core.seq(arglist__129211);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__129212) {
    var objs = cljs.core.seq(arglist__129212);
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
  println.cljs$lang$applyTo = function(arglist__129213) {
    var objs = cljs.core.seq(arglist__129213);
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
  prn.cljs$lang$applyTo = function(arglist__129214) {
    var objs = cljs.core.seq(arglist__129214);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__129215 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__129215, "{", ", ", "}", opts, coll)
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
      var temp__3698__auto____129216 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____129216)) {
        var nspc__129217 = temp__3698__auto____129216;
        return cljs.core.str.call(null, nspc__129217, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____129218 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____129218)) {
          var nspc__129219 = temp__3698__auto____129218;
          return cljs.core.str.call(null, nspc__129219, "/")
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
  var pr_pair__129220 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__129220, "{", ", ", "}", opts, coll)
};
cljs.core.Atom = function(state, meta, validator, watches) {
  this.state = state;
  this.meta = meta;
  this.validator = validator;
  this.watches = watches
};
cljs.core.Atom.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Atom")
};
cljs.core.Atom.prototype.cljs$core$IHash$ = true;
cljs.core.Atom.prototype.cljs$core$IHash$_hash = function(this$) {
  var this__129221 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__129222 = this;
  var G__129223__129224 = cljs.core.seq.call(null, this__129222.watches);
  if(cljs.core.truth_(G__129223__129224)) {
    var G__129226__129228 = cljs.core.first.call(null, G__129223__129224);
    var vec__129227__129229 = G__129226__129228;
    var key__129230 = cljs.core.nth.call(null, vec__129227__129229, 0, null);
    var f__129231 = cljs.core.nth.call(null, vec__129227__129229, 1, null);
    var G__129223__129232 = G__129223__129224;
    var G__129226__129233 = G__129226__129228;
    var G__129223__129234 = G__129223__129232;
    while(true) {
      var vec__129235__129236 = G__129226__129233;
      var key__129237 = cljs.core.nth.call(null, vec__129235__129236, 0, null);
      var f__129238 = cljs.core.nth.call(null, vec__129235__129236, 1, null);
      var G__129223__129239 = G__129223__129234;
      f__129238.call(null, key__129237, this$, oldval, newval);
      var temp__3698__auto____129240 = cljs.core.next.call(null, G__129223__129239);
      if(cljs.core.truth_(temp__3698__auto____129240)) {
        var G__129223__129241 = temp__3698__auto____129240;
        var G__129248 = cljs.core.first.call(null, G__129223__129241);
        var G__129249 = G__129223__129241;
        G__129226__129233 = G__129248;
        G__129223__129234 = G__129249;
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
  var this__129242 = this;
  return this$.watches = cljs.core.assoc.call(null, this__129242.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__129243 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__129243.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__129244 = this;
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__129244.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__129245 = this;
  return this__129245.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__129246 = this;
  return this__129246.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__129247 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__129256 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__129257 = function() {
    var G__129259__delegate = function(x, p__129250) {
      var map__129251__129252 = p__129250;
      var map__129251__129253 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__129251__129252)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__129251__129252) : map__129251__129252;
      var validator__129254 = cljs.core.get.call(null, map__129251__129253, "\ufdd0'validator");
      var meta__129255 = cljs.core.get.call(null, map__129251__129253, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__129255, validator__129254, null)
    };
    var G__129259 = function(x, var_args) {
      var p__129250 = null;
      if(goog.isDef(var_args)) {
        p__129250 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__129259__delegate.call(this, x, p__129250)
    };
    G__129259.cljs$lang$maxFixedArity = 1;
    G__129259.cljs$lang$applyTo = function(arglist__129260) {
      var x = cljs.core.first(arglist__129260);
      var p__129250 = cljs.core.rest(arglist__129260);
      return G__129259__delegate.call(this, x, p__129250)
    };
    return G__129259
  }();
  atom = function(x, var_args) {
    var p__129250 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__129256.call(this, x);
      default:
        return atom__129257.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__129257.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____129261 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____129261)) {
    var validate__129262 = temp__3698__auto____129261;
    if(cljs.core.truth_(validate__129262.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3073)))));
    }
  }else {
  }
  var old_value__129263 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__129263, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___129264 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___129265 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___129266 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___129267 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___129268 = function() {
    var G__129270__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__129270 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__129270__delegate.call(this, a, f, x, y, z, more)
    };
    G__129270.cljs$lang$maxFixedArity = 5;
    G__129270.cljs$lang$applyTo = function(arglist__129271) {
      var a = cljs.core.first(arglist__129271);
      var f = cljs.core.first(cljs.core.next(arglist__129271));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__129271)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__129271))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__129271)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__129271)))));
      return G__129270__delegate.call(this, a, f, x, y, z, more)
    };
    return G__129270
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___129264.call(this, a, f);
      case 3:
        return swap_BANG___129265.call(this, a, f, x);
      case 4:
        return swap_BANG___129266.call(this, a, f, x, y);
      case 5:
        return swap_BANG___129267.call(this, a, f, x, y, z);
      default:
        return swap_BANG___129268.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___129268.cljs$lang$applyTo;
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__129272) {
    var iref = cljs.core.first(arglist__129272);
    var f = cljs.core.first(cljs.core.next(arglist__129272));
    var args = cljs.core.rest(cljs.core.next(arglist__129272));
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
  var gensym__129273 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__129274 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__129273.call(this);
      case 1:
        return gensym__129274.call(this, prefix_string)
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
cljs.core.Delay.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.Delay")
};
cljs.core.Delay.prototype.cljs$core$IPending$ = true;
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_ = function(d) {
  var this__129276 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__129276.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__129277 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__129277.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__129277.state, this__129277.f)
  }
  return cljs.core.deref.call(null, this__129277.state)
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
  delay.cljs$lang$applyTo = function(arglist__129278) {
    var body = cljs.core.seq(arglist__129278);
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
    var map__129279__129280 = options;
    var map__129279__129281 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__129279__129280)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__129279__129280) : map__129279__129280;
    var keywordize_keys__129282 = cljs.core.get.call(null, map__129279__129281, "\ufdd0'keywordize-keys");
    var keyfn__129283 = cljs.core.truth_(keywordize_keys__129282) ? cljs.core.keyword : cljs.core.str;
    var f__129289 = function thisfn(x) {
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
                var iter__514__auto____129288 = function iter__129284(s__129285) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__129285__129286 = s__129285;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__129285__129286))) {
                        var k__129287 = cljs.core.first.call(null, s__129285__129286);
                        return cljs.core.cons.call(null, cljs.core.Vector.fromArray([keyfn__129283.call(null, k__129287), thisfn.call(null, x[k__129287])]), iter__129284.call(null, cljs.core.rest.call(null, s__129285__129286)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__514__auto____129288.call(null, cljs.core.js_keys.call(null, x))
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
    return f__129289.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__129290) {
    var x = cljs.core.first(arglist__129290);
    var options = cljs.core.rest(arglist__129290);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__129291 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__129295__delegate = function(args) {
      var temp__3695__auto____129292 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__129291), args);
      if(cljs.core.truth_(temp__3695__auto____129292)) {
        var v__129293 = temp__3695__auto____129292;
        return v__129293
      }else {
        var ret__129294 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__129291, cljs.core.assoc, args, ret__129294);
        return ret__129294
      }
    };
    var G__129295 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__129295__delegate.call(this, args)
    };
    G__129295.cljs$lang$maxFixedArity = 0;
    G__129295.cljs$lang$applyTo = function(arglist__129296) {
      var args = cljs.core.seq(arglist__129296);
      return G__129295__delegate.call(this, args)
    };
    return G__129295
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__129298 = function(f) {
    while(true) {
      var ret__129297 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__129297))) {
        var G__129301 = ret__129297;
        f = G__129301;
        continue
      }else {
        return ret__129297
      }
      break
    }
  };
  var trampoline__129299 = function() {
    var G__129302__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__129302 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__129302__delegate.call(this, f, args)
    };
    G__129302.cljs$lang$maxFixedArity = 1;
    G__129302.cljs$lang$applyTo = function(arglist__129303) {
      var f = cljs.core.first(arglist__129303);
      var args = cljs.core.rest(arglist__129303);
      return G__129302__delegate.call(this, f, args)
    };
    return G__129302
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__129298.call(this, f);
      default:
        return trampoline__129299.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__129299.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__129304 = function() {
    return rand.call(null, 1)
  };
  var rand__129305 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__129304.call(this);
      case 1:
        return rand__129305.call(this, n)
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
    var k__129307 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__129307, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__129307, cljs.core.Vector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___129316 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___129317 = function(h, child, parent) {
    var or__3548__auto____129308 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____129308)) {
      return or__3548__auto____129308
    }else {
      var or__3548__auto____129309 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____129309)) {
        return or__3548__auto____129309
      }else {
        var and__3546__auto____129310 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____129310)) {
          var and__3546__auto____129311 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____129311)) {
            var and__3546__auto____129312 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____129312)) {
              var ret__129313 = true;
              var i__129314 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____129315 = cljs.core.not.call(null, ret__129313);
                  if(cljs.core.truth_(or__3548__auto____129315)) {
                    return or__3548__auto____129315
                  }else {
                    return cljs.core._EQ_.call(null, i__129314, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__129313
                }else {
                  var G__129319 = isa_QMARK_.call(null, h, child.call(null, i__129314), parent.call(null, i__129314));
                  var G__129320 = i__129314 + 1;
                  ret__129313 = G__129319;
                  i__129314 = G__129320;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____129312
            }
          }else {
            return and__3546__auto____129311
          }
        }else {
          return and__3546__auto____129310
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___129316.call(this, h, child);
      case 3:
        return isa_QMARK___129317.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__129321 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__129322 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__129321.call(this, h);
      case 2:
        return parents__129322.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__129324 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__129325 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__129324.call(this, h);
      case 2:
        return ancestors__129325.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__129327 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__129328 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__129327.call(this, h);
      case 2:
        return descendants__129328.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__129338 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3365)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__129339 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3369)))));
    }
    var tp__129333 = "\ufdd0'parents".call(null, h);
    var td__129334 = "\ufdd0'descendants".call(null, h);
    var ta__129335 = "\ufdd0'ancestors".call(null, h);
    var tf__129336 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____129337 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__129333.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__129335.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__129335.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__129333, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__129336.call(null, "\ufdd0'ancestors".call(null, h), tag, td__129334, parent, ta__129335), "\ufdd0'descendants":tf__129336.call(null, "\ufdd0'descendants".call(null, h), parent, ta__129335, tag, td__129334)})
    }();
    if(cljs.core.truth_(or__3548__auto____129337)) {
      return or__3548__auto____129337
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__129338.call(this, h, tag);
      case 3:
        return derive__129339.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__129345 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__129346 = function(h, tag, parent) {
    var parentMap__129341 = "\ufdd0'parents".call(null, h);
    var childsParents__129342 = cljs.core.truth_(parentMap__129341.call(null, tag)) ? cljs.core.disj.call(null, parentMap__129341.call(null, tag), parent) : cljs.core.set([]);
    var newParents__129343 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__129342)) ? cljs.core.assoc.call(null, parentMap__129341, tag, childsParents__129342) : cljs.core.dissoc.call(null, parentMap__129341, tag);
    var deriv_seq__129344 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__129330_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__129330_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__129330_SHARP_), cljs.core.second.call(null, p1__129330_SHARP_)))
    }, cljs.core.seq.call(null, newParents__129343)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__129341.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__129331_SHARP_, p2__129332_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__129331_SHARP_, p2__129332_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__129344))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__129345.call(this, h, tag);
      case 3:
        return underive__129346.call(this, h, tag, parent)
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
  var xprefs__129348 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____129350 = cljs.core.truth_(function() {
    var and__3546__auto____129349 = xprefs__129348;
    if(cljs.core.truth_(and__3546__auto____129349)) {
      return xprefs__129348.call(null, y)
    }else {
      return and__3546__auto____129349
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____129350)) {
    return or__3548__auto____129350
  }else {
    var or__3548__auto____129352 = function() {
      var ps__129351 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__129351) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__129351), prefer_table))) {
          }else {
          }
          var G__129355 = cljs.core.rest.call(null, ps__129351);
          ps__129351 = G__129355;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____129352)) {
      return or__3548__auto____129352
    }else {
      var or__3548__auto____129354 = function() {
        var ps__129353 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__129353) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__129353), y, prefer_table))) {
            }else {
            }
            var G__129356 = cljs.core.rest.call(null, ps__129353);
            ps__129353 = G__129356;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____129354)) {
        return or__3548__auto____129354
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____129357 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____129357)) {
    return or__3548__auto____129357
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__129366 = cljs.core.reduce.call(null, function(be, p__129358) {
    var vec__129359__129360 = p__129358;
    var k__129361 = cljs.core.nth.call(null, vec__129359__129360, 0, null);
    var ___129362 = cljs.core.nth.call(null, vec__129359__129360, 1, null);
    var e__129363 = vec__129359__129360;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__129361))) {
      var be2__129365 = cljs.core.truth_(function() {
        var or__3548__auto____129364 = be === null;
        if(cljs.core.truth_(or__3548__auto____129364)) {
          return or__3548__auto____129364
        }else {
          return cljs.core.dominates.call(null, k__129361, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__129363 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__129365), k__129361, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__129361, " and ", cljs.core.first.call(null, be2__129365), ", and neither is preferred"));
      }
      return be2__129365
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__129366)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__129366));
      return cljs.core.second.call(null, best_entry__129366)
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
    var and__3546__auto____129367 = mf;
    if(cljs.core.truth_(and__3546__auto____129367)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____129367
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____129368 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129368)) {
        return or__3548__auto____129368
      }else {
        var or__3548__auto____129369 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____129369)) {
          return or__3548__auto____129369
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129370 = mf;
    if(cljs.core.truth_(and__3546__auto____129370)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____129370
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____129371 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129371)) {
        return or__3548__auto____129371
      }else {
        var or__3548__auto____129372 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____129372)) {
          return or__3548__auto____129372
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129373 = mf;
    if(cljs.core.truth_(and__3546__auto____129373)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____129373
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____129374 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129374)) {
        return or__3548__auto____129374
      }else {
        var or__3548__auto____129375 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____129375)) {
          return or__3548__auto____129375
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129376 = mf;
    if(cljs.core.truth_(and__3546__auto____129376)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____129376
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____129377 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129377)) {
        return or__3548__auto____129377
      }else {
        var or__3548__auto____129378 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____129378)) {
          return or__3548__auto____129378
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129379 = mf;
    if(cljs.core.truth_(and__3546__auto____129379)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____129379
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____129380 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129380)) {
        return or__3548__auto____129380
      }else {
        var or__3548__auto____129381 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____129381)) {
          return or__3548__auto____129381
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129382 = mf;
    if(cljs.core.truth_(and__3546__auto____129382)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____129382
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____129383 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129383)) {
        return or__3548__auto____129383
      }else {
        var or__3548__auto____129384 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____129384)) {
          return or__3548__auto____129384
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129385 = mf;
    if(cljs.core.truth_(and__3546__auto____129385)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____129385
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____129386 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129386)) {
        return or__3548__auto____129386
      }else {
        var or__3548__auto____129387 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____129387)) {
          return or__3548__auto____129387
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____129388 = mf;
    if(cljs.core.truth_(and__3546__auto____129388)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____129388
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____129389 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____129389)) {
        return or__3548__auto____129389
      }else {
        var or__3548__auto____129390 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____129390)) {
          return or__3548__auto____129390
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__129391 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__129392 = cljs.core._get_method.call(null, mf, dispatch_val__129391);
  if(cljs.core.truth_(target_fn__129392)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__129391));
  }
  return cljs.core.apply.call(null, target_fn__129392, args)
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
cljs.core.MultiFn.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.core.MultiFn")
};
cljs.core.MultiFn.prototype.cljs$core$IHash$ = true;
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash = function(this$) {
  var this__129393 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__129394 = this;
  cljs.core.swap_BANG_.call(null, this__129394.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__129394.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__129394.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__129394.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__129395 = this;
  cljs.core.swap_BANG_.call(null, this__129395.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__129395.method_cache, this__129395.method_table, this__129395.cached_hierarchy, this__129395.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__129396 = this;
  cljs.core.swap_BANG_.call(null, this__129396.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__129396.method_cache, this__129396.method_table, this__129396.cached_hierarchy, this__129396.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__129397 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__129397.cached_hierarchy), cljs.core.deref.call(null, this__129397.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__129397.method_cache, this__129397.method_table, this__129397.cached_hierarchy, this__129397.hierarchy)
  }
  var temp__3695__auto____129398 = cljs.core.deref.call(null, this__129397.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____129398)) {
    var target_fn__129399 = temp__3695__auto____129398;
    return target_fn__129399
  }else {
    var temp__3695__auto____129400 = cljs.core.find_and_cache_best_method.call(null, this__129397.name, dispatch_val, this__129397.hierarchy, this__129397.method_table, this__129397.prefer_table, this__129397.method_cache, this__129397.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____129400)) {
      var target_fn__129401 = temp__3695__auto____129400;
      return target_fn__129401
    }else {
      return cljs.core.deref.call(null, this__129397.method_table).call(null, this__129397.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__129402 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__129402.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__129402.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__129402.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__129402.method_cache, this__129402.method_table, this__129402.cached_hierarchy, this__129402.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__129403 = this;
  return cljs.core.deref.call(null, this__129403.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__129404 = this;
  return cljs.core.deref.call(null, this__129404.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__129405 = this;
  return cljs.core.do_dispatch.call(null, mf, this__129405.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__129406__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__129406 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__129406__delegate.call(this, _, args)
  };
  G__129406.cljs$lang$maxFixedArity = 1;
  G__129406.cljs$lang$applyTo = function(arglist__129407) {
    var _ = cljs.core.first(arglist__129407);
    var args = cljs.core.rest(arglist__129407);
    return G__129406__delegate.call(this, _, args)
  };
  return G__129406
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
goog.provide("tatame.worker");
goog.require("cljs.core");
tatame.worker.socket = new WebSocket("ws://localhost:8108/socket");
tatame.worker.events = cljs.core.atom.call(null, new cljs.core.Vector(null, []));
tatame.worker.send_messages_BANG_ = function send_messages_BANG_() {
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, tatame.worker.events))))) {
      self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data"], {"\ufdd0'type":"client", "\ufdd0'data":"sending events to server!"})));
      tatame.worker.socket.send(cljs.core.pr_str.call(null, cljs.core.first.call(null, cljs.core.deref.call(null, tatame.worker.events))));
      cljs.core.swap_BANG_.call(null, tatame.worker.events, function(p1__127706_SHARP_) {
        return cljs.core.drop.call(null, 1, p1__127706_SHARP_)
      });
      continue
    }else {
    }
    break
  }
  return self.setTimeout(send_messages_BANG_, 1E4)
};
tatame.worker.on_client_message = function on_client_message(e) {
  var data__127707 = e.data;
  if(cljs.core.truth_(data__127707.editor)) {
    return cljs.core.swap_BANG_.call(null, tatame.worker.events, cljs.core.conj, cljs.core.js__GT_clj.call(null, data__127707))
  }else {
    if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, data__127707))) {
      return tatame.worker.socket.send(data__127707)
    }else {
      return null
    }
  }
};
tatame.worker.on_server_message = function on_server_message(e) {
  var data__127708 = e.data;
  return self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data"], {"\ufdd0'type":"server", "\ufdd0'data":data__127708})))
};
tatame.worker.socket.onopen = tatame.worker.send_messages_BANG_;
tatame.worker.socket.onmessage = tatame.worker.on_server_message;
self.addEventListener("message", tatame.worker.on_client_message, false);

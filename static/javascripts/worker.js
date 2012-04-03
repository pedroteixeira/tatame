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
  var or__3548__auto____348356 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____348356)) {
    return or__3548__auto____348356
  }else {
    var or__3548__auto____348357 = p["_"];
    if(cljs.core.truth_(or__3548__auto____348357)) {
      return or__3548__auto____348357
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
  var _invoke__348421 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348358 = this$;
      if(cljs.core.truth_(and__3546__auto____348358)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348358
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____348359 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348359)) {
          return or__3548__auto____348359
        }else {
          var or__3548__auto____348360 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348360)) {
            return or__3548__auto____348360
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__348422 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348361 = this$;
      if(cljs.core.truth_(and__3546__auto____348361)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348361
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____348362 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348362)) {
          return or__3548__auto____348362
        }else {
          var or__3548__auto____348363 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348363)) {
            return or__3548__auto____348363
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__348423 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348364 = this$;
      if(cljs.core.truth_(and__3546__auto____348364)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348364
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____348365 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348365)) {
          return or__3548__auto____348365
        }else {
          var or__3548__auto____348366 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348366)) {
            return or__3548__auto____348366
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__348424 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348367 = this$;
      if(cljs.core.truth_(and__3546__auto____348367)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348367
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____348368 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348368)) {
          return or__3548__auto____348368
        }else {
          var or__3548__auto____348369 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348369)) {
            return or__3548__auto____348369
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__348425 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348370 = this$;
      if(cljs.core.truth_(and__3546__auto____348370)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348370
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____348371 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348371)) {
          return or__3548__auto____348371
        }else {
          var or__3548__auto____348372 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348372)) {
            return or__3548__auto____348372
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__348426 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348373 = this$;
      if(cljs.core.truth_(and__3546__auto____348373)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348373
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____348374 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348374)) {
          return or__3548__auto____348374
        }else {
          var or__3548__auto____348375 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348375)) {
            return or__3548__auto____348375
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__348427 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348376 = this$;
      if(cljs.core.truth_(and__3546__auto____348376)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348376
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____348377 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348377)) {
          return or__3548__auto____348377
        }else {
          var or__3548__auto____348378 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348378)) {
            return or__3548__auto____348378
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__348428 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348379 = this$;
      if(cljs.core.truth_(and__3546__auto____348379)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348379
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____348380 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348380)) {
          return or__3548__auto____348380
        }else {
          var or__3548__auto____348381 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348381)) {
            return or__3548__auto____348381
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__348429 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348382 = this$;
      if(cljs.core.truth_(and__3546__auto____348382)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348382
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____348383 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348383)) {
          return or__3548__auto____348383
        }else {
          var or__3548__auto____348384 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348384)) {
            return or__3548__auto____348384
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__348430 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348385 = this$;
      if(cljs.core.truth_(and__3546__auto____348385)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348385
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____348386 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348386)) {
          return or__3548__auto____348386
        }else {
          var or__3548__auto____348387 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348387)) {
            return or__3548__auto____348387
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__348431 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348388 = this$;
      if(cljs.core.truth_(and__3546__auto____348388)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348388
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____348389 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348389)) {
          return or__3548__auto____348389
        }else {
          var or__3548__auto____348390 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348390)) {
            return or__3548__auto____348390
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__348432 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348391 = this$;
      if(cljs.core.truth_(and__3546__auto____348391)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348391
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____348392 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348392)) {
          return or__3548__auto____348392
        }else {
          var or__3548__auto____348393 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348393)) {
            return or__3548__auto____348393
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__348433 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348394 = this$;
      if(cljs.core.truth_(and__3546__auto____348394)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348394
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____348395 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348395)) {
          return or__3548__auto____348395
        }else {
          var or__3548__auto____348396 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348396)) {
            return or__3548__auto____348396
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__348434 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348397 = this$;
      if(cljs.core.truth_(and__3546__auto____348397)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348397
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____348398 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348398)) {
          return or__3548__auto____348398
        }else {
          var or__3548__auto____348399 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348399)) {
            return or__3548__auto____348399
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__348435 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348400 = this$;
      if(cljs.core.truth_(and__3546__auto____348400)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348400
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____348401 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348401)) {
          return or__3548__auto____348401
        }else {
          var or__3548__auto____348402 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348402)) {
            return or__3548__auto____348402
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__348436 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348403 = this$;
      if(cljs.core.truth_(and__3546__auto____348403)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348403
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____348404 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348404)) {
          return or__3548__auto____348404
        }else {
          var or__3548__auto____348405 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348405)) {
            return or__3548__auto____348405
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__348437 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348406 = this$;
      if(cljs.core.truth_(and__3546__auto____348406)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348406
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____348407 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348407)) {
          return or__3548__auto____348407
        }else {
          var or__3548__auto____348408 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348408)) {
            return or__3548__auto____348408
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__348438 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348409 = this$;
      if(cljs.core.truth_(and__3546__auto____348409)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348409
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____348410 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348410)) {
          return or__3548__auto____348410
        }else {
          var or__3548__auto____348411 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348411)) {
            return or__3548__auto____348411
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__348439 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348412 = this$;
      if(cljs.core.truth_(and__3546__auto____348412)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348412
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____348413 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348413)) {
          return or__3548__auto____348413
        }else {
          var or__3548__auto____348414 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348414)) {
            return or__3548__auto____348414
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__348440 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348415 = this$;
      if(cljs.core.truth_(and__3546__auto____348415)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348415
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____348416 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348416)) {
          return or__3548__auto____348416
        }else {
          var or__3548__auto____348417 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348417)) {
            return or__3548__auto____348417
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__348441 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348418 = this$;
      if(cljs.core.truth_(and__3546__auto____348418)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____348418
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____348419 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____348419)) {
          return or__3548__auto____348419
        }else {
          var or__3548__auto____348420 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____348420)) {
            return or__3548__auto____348420
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
        return _invoke__348421.call(this, this$);
      case 2:
        return _invoke__348422.call(this, this$, a);
      case 3:
        return _invoke__348423.call(this, this$, a, b);
      case 4:
        return _invoke__348424.call(this, this$, a, b, c);
      case 5:
        return _invoke__348425.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__348426.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__348427.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__348428.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__348429.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__348430.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__348431.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__348432.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__348433.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__348434.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__348435.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__348436.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__348437.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__348438.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__348439.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__348440.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__348441.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348443 = coll;
    if(cljs.core.truth_(and__3546__auto____348443)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____348443
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____348444 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348444)) {
        return or__3548__auto____348444
      }else {
        var or__3548__auto____348445 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____348445)) {
          return or__3548__auto____348445
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
    var and__3546__auto____348446 = coll;
    if(cljs.core.truth_(and__3546__auto____348446)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____348446
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____348447 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348447)) {
        return or__3548__auto____348447
      }else {
        var or__3548__auto____348448 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____348448)) {
          return or__3548__auto____348448
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
    var and__3546__auto____348449 = coll;
    if(cljs.core.truth_(and__3546__auto____348449)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____348449
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____348450 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348450)) {
        return or__3548__auto____348450
      }else {
        var or__3548__auto____348451 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____348451)) {
          return or__3548__auto____348451
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
  var _nth__348458 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348452 = coll;
      if(cljs.core.truth_(and__3546__auto____348452)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____348452
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____348453 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____348453)) {
          return or__3548__auto____348453
        }else {
          var or__3548__auto____348454 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____348454)) {
            return or__3548__auto____348454
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__348459 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348455 = coll;
      if(cljs.core.truth_(and__3546__auto____348455)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____348455
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____348456 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____348456)) {
          return or__3548__auto____348456
        }else {
          var or__3548__auto____348457 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____348457)) {
            return or__3548__auto____348457
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
        return _nth__348458.call(this, coll, n);
      case 3:
        return _nth__348459.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348461 = coll;
    if(cljs.core.truth_(and__3546__auto____348461)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____348461
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____348462 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348462)) {
        return or__3548__auto____348462
      }else {
        var or__3548__auto____348463 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____348463)) {
          return or__3548__auto____348463
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348464 = coll;
    if(cljs.core.truth_(and__3546__auto____348464)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____348464
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____348465 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348465)) {
        return or__3548__auto____348465
      }else {
        var or__3548__auto____348466 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____348466)) {
          return or__3548__auto____348466
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
  var _lookup__348473 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348467 = o;
      if(cljs.core.truth_(and__3546__auto____348467)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____348467
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____348468 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____348468)) {
          return or__3548__auto____348468
        }else {
          var or__3548__auto____348469 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____348469)) {
            return or__3548__auto____348469
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__348474 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348470 = o;
      if(cljs.core.truth_(and__3546__auto____348470)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____348470
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____348471 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____348471)) {
          return or__3548__auto____348471
        }else {
          var or__3548__auto____348472 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____348472)) {
            return or__3548__auto____348472
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
        return _lookup__348473.call(this, o, k);
      case 3:
        return _lookup__348474.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348476 = coll;
    if(cljs.core.truth_(and__3546__auto____348476)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____348476
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____348477 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348477)) {
        return or__3548__auto____348477
      }else {
        var or__3548__auto____348478 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____348478)) {
          return or__3548__auto____348478
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348479 = coll;
    if(cljs.core.truth_(and__3546__auto____348479)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____348479
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____348480 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348480)) {
        return or__3548__auto____348480
      }else {
        var or__3548__auto____348481 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____348481)) {
          return or__3548__auto____348481
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
    var and__3546__auto____348482 = coll;
    if(cljs.core.truth_(and__3546__auto____348482)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____348482
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____348483 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348483)) {
        return or__3548__auto____348483
      }else {
        var or__3548__auto____348484 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____348484)) {
          return or__3548__auto____348484
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
    var and__3546__auto____348485 = coll;
    if(cljs.core.truth_(and__3546__auto____348485)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____348485
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____348486 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348486)) {
        return or__3548__auto____348486
      }else {
        var or__3548__auto____348487 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____348487)) {
          return or__3548__auto____348487
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
    var and__3546__auto____348488 = coll;
    if(cljs.core.truth_(and__3546__auto____348488)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____348488
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____348489 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348489)) {
        return or__3548__auto____348489
      }else {
        var or__3548__auto____348490 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____348490)) {
          return or__3548__auto____348490
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348491 = coll;
    if(cljs.core.truth_(and__3546__auto____348491)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____348491
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____348492 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348492)) {
        return or__3548__auto____348492
      }else {
        var or__3548__auto____348493 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____348493)) {
          return or__3548__auto____348493
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
    var and__3546__auto____348494 = coll;
    if(cljs.core.truth_(and__3546__auto____348494)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____348494
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____348495 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____348495)) {
        return or__3548__auto____348495
      }else {
        var or__3548__auto____348496 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____348496)) {
          return or__3548__auto____348496
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
    var and__3546__auto____348497 = o;
    if(cljs.core.truth_(and__3546__auto____348497)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____348497
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____348498 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348498)) {
        return or__3548__auto____348498
      }else {
        var or__3548__auto____348499 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____348499)) {
          return or__3548__auto____348499
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
    var and__3546__auto____348500 = o;
    if(cljs.core.truth_(and__3546__auto____348500)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____348500
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____348501 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348501)) {
        return or__3548__auto____348501
      }else {
        var or__3548__auto____348502 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____348502)) {
          return or__3548__auto____348502
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
    var and__3546__auto____348503 = o;
    if(cljs.core.truth_(and__3546__auto____348503)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____348503
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____348504 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348504)) {
        return or__3548__auto____348504
      }else {
        var or__3548__auto____348505 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____348505)) {
          return or__3548__auto____348505
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
    var and__3546__auto____348506 = o;
    if(cljs.core.truth_(and__3546__auto____348506)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____348506
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____348507 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348507)) {
        return or__3548__auto____348507
      }else {
        var or__3548__auto____348508 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____348508)) {
          return or__3548__auto____348508
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
  var _reduce__348515 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348509 = coll;
      if(cljs.core.truth_(and__3546__auto____348509)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____348509
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____348510 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____348510)) {
          return or__3548__auto____348510
        }else {
          var or__3548__auto____348511 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____348511)) {
            return or__3548__auto____348511
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__348516 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348512 = coll;
      if(cljs.core.truth_(and__3546__auto____348512)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____348512
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____348513 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____348513)) {
          return or__3548__auto____348513
        }else {
          var or__3548__auto____348514 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____348514)) {
            return or__3548__auto____348514
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
        return _reduce__348515.call(this, coll, f);
      case 3:
        return _reduce__348516.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348518 = o;
    if(cljs.core.truth_(and__3546__auto____348518)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____348518
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____348519 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348519)) {
        return or__3548__auto____348519
      }else {
        var or__3548__auto____348520 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____348520)) {
          return or__3548__auto____348520
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
    var and__3546__auto____348521 = o;
    if(cljs.core.truth_(and__3546__auto____348521)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____348521
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____348522 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348522)) {
        return or__3548__auto____348522
      }else {
        var or__3548__auto____348523 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____348523)) {
          return or__3548__auto____348523
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
    var and__3546__auto____348524 = o;
    if(cljs.core.truth_(and__3546__auto____348524)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____348524
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____348525 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348525)) {
        return or__3548__auto____348525
      }else {
        var or__3548__auto____348526 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____348526)) {
          return or__3548__auto____348526
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
    var and__3546__auto____348527 = o;
    if(cljs.core.truth_(and__3546__auto____348527)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____348527
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____348528 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____348528)) {
        return or__3548__auto____348528
      }else {
        var or__3548__auto____348529 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____348529)) {
          return or__3548__auto____348529
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
    var and__3546__auto____348530 = d;
    if(cljs.core.truth_(and__3546__auto____348530)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____348530
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____348531 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____348531)) {
        return or__3548__auto____348531
      }else {
        var or__3548__auto____348532 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____348532)) {
          return or__3548__auto____348532
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
    var and__3546__auto____348533 = this$;
    if(cljs.core.truth_(and__3546__auto____348533)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____348533
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____348534 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____348534)) {
        return or__3548__auto____348534
      }else {
        var or__3548__auto____348535 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____348535)) {
          return or__3548__auto____348535
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348536 = this$;
    if(cljs.core.truth_(and__3546__auto____348536)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____348536
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____348537 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____348537)) {
        return or__3548__auto____348537
      }else {
        var or__3548__auto____348538 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____348538)) {
          return or__3548__auto____348538
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____348539 = this$;
    if(cljs.core.truth_(and__3546__auto____348539)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____348539
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____348540 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____348540)) {
        return or__3548__auto____348540
      }else {
        var or__3548__auto____348541 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____348541)) {
          return or__3548__auto____348541
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
  var G__348542 = null;
  var G__348542__348543 = function(o, k) {
    return null
  };
  var G__348542__348544 = function(o, k, not_found) {
    return not_found
  };
  G__348542 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348542__348543.call(this, o, k);
      case 3:
        return G__348542__348544.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348542
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
  var G__348546 = null;
  var G__348546__348547 = function(_, f) {
    return f.call(null)
  };
  var G__348546__348548 = function(_, f, start) {
    return start
  };
  G__348546 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__348546__348547.call(this, _, f);
      case 3:
        return G__348546__348548.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348546
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
  var G__348550 = null;
  var G__348550__348551 = function(_, n) {
    return null
  };
  var G__348550__348552 = function(_, n, not_found) {
    return not_found
  };
  G__348550 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348550__348551.call(this, _, n);
      case 3:
        return G__348550__348552.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348550
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
  var ci_reduce__348560 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__348554 = cljs.core._nth.call(null, cicoll, 0);
      var n__348555 = 1;
      while(true) {
        if(cljs.core.truth_(n__348555 < cljs.core._count.call(null, cicoll))) {
          var G__348564 = f.call(null, val__348554, cljs.core._nth.call(null, cicoll, n__348555));
          var G__348565 = n__348555 + 1;
          val__348554 = G__348564;
          n__348555 = G__348565;
          continue
        }else {
          return val__348554
        }
        break
      }
    }
  };
  var ci_reduce__348561 = function(cicoll, f, val) {
    var val__348556 = val;
    var n__348557 = 0;
    while(true) {
      if(cljs.core.truth_(n__348557 < cljs.core._count.call(null, cicoll))) {
        var G__348566 = f.call(null, val__348556, cljs.core._nth.call(null, cicoll, n__348557));
        var G__348567 = n__348557 + 1;
        val__348556 = G__348566;
        n__348557 = G__348567;
        continue
      }else {
        return val__348556
      }
      break
    }
  };
  var ci_reduce__348562 = function(cicoll, f, val, idx) {
    var val__348558 = val;
    var n__348559 = idx;
    while(true) {
      if(cljs.core.truth_(n__348559 < cljs.core._count.call(null, cicoll))) {
        var G__348568 = f.call(null, val__348558, cljs.core._nth.call(null, cicoll, n__348559));
        var G__348569 = n__348559 + 1;
        val__348558 = G__348568;
        n__348559 = G__348569;
        continue
      }else {
        return val__348558
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__348560.call(this, cicoll, f);
      case 3:
        return ci_reduce__348561.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__348562.call(this, cicoll, f, val, idx)
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
  var this__348570 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__348583 = null;
  var G__348583__348584 = function(_, f) {
    var this__348571 = this;
    return cljs.core.ci_reduce.call(null, this__348571.a, f, this__348571.a[this__348571.i], this__348571.i + 1)
  };
  var G__348583__348585 = function(_, f, start) {
    var this__348572 = this;
    return cljs.core.ci_reduce.call(null, this__348572.a, f, start, this__348572.i)
  };
  G__348583 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__348583__348584.call(this, _, f);
      case 3:
        return G__348583__348585.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348583
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__348573 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__348574 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__348587 = null;
  var G__348587__348588 = function(coll, n) {
    var this__348575 = this;
    var i__348576 = n + this__348575.i;
    if(cljs.core.truth_(i__348576 < this__348575.a.length)) {
      return this__348575.a[i__348576]
    }else {
      return null
    }
  };
  var G__348587__348589 = function(coll, n, not_found) {
    var this__348577 = this;
    var i__348578 = n + this__348577.i;
    if(cljs.core.truth_(i__348578 < this__348577.a.length)) {
      return this__348577.a[i__348578]
    }else {
      return not_found
    }
  };
  G__348587 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348587__348588.call(this, coll, n);
      case 3:
        return G__348587__348589.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348587
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__348579 = this;
  return this__348579.a.length - this__348579.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__348580 = this;
  return this__348580.a[this__348580.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__348581 = this;
  if(cljs.core.truth_(this__348581.i + 1 < this__348581.a.length)) {
    return new cljs.core.IndexedSeq(this__348581.a, this__348581.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__348582 = this;
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
  var G__348591 = null;
  var G__348591__348592 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__348591__348593 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__348591 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__348591__348592.call(this, array, f);
      case 3:
        return G__348591__348593.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348591
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__348595 = null;
  var G__348595__348596 = function(array, k) {
    return array[k]
  };
  var G__348595__348597 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__348595 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348595__348596.call(this, array, k);
      case 3:
        return G__348595__348597.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348595
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__348599 = null;
  var G__348599__348600 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__348599__348601 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__348599 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348599__348600.call(this, array, n);
      case 3:
        return G__348599__348601.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348599
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
  var temp__3698__auto____348603 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____348603)) {
    var s__348604 = temp__3698__auto____348603;
    return cljs.core._first.call(null, s__348604)
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
      var G__348605 = cljs.core.next.call(null, s);
      s = G__348605;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__348606 = cljs.core.seq.call(null, x);
  var n__348607 = 0;
  while(true) {
    if(cljs.core.truth_(s__348606)) {
      var G__348608 = cljs.core.next.call(null, s__348606);
      var G__348609 = n__348607 + 1;
      s__348606 = G__348608;
      n__348607 = G__348609;
      continue
    }else {
      return n__348607
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
  var conj__348610 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__348611 = function() {
    var G__348613__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__348614 = conj.call(null, coll, x);
          var G__348615 = cljs.core.first.call(null, xs);
          var G__348616 = cljs.core.next.call(null, xs);
          coll = G__348614;
          x = G__348615;
          xs = G__348616;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__348613 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348613__delegate.call(this, coll, x, xs)
    };
    G__348613.cljs$lang$maxFixedArity = 2;
    G__348613.cljs$lang$applyTo = function(arglist__348617) {
      var coll = cljs.core.first(arglist__348617);
      var x = cljs.core.first(cljs.core.next(arglist__348617));
      var xs = cljs.core.rest(cljs.core.next(arglist__348617));
      return G__348613__delegate.call(this, coll, x, xs)
    };
    return G__348613
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__348610.call(this, coll, x);
      default:
        return conj__348611.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__348611.cljs$lang$applyTo;
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
  var nth__348618 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__348619 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__348618.call(this, coll, n);
      case 3:
        return nth__348619.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__348621 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__348622 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__348621.call(this, o, k);
      case 3:
        return get__348622.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__348625 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__348626 = function() {
    var G__348628__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__348624 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__348629 = ret__348624;
          var G__348630 = cljs.core.first.call(null, kvs);
          var G__348631 = cljs.core.second.call(null, kvs);
          var G__348632 = cljs.core.nnext.call(null, kvs);
          coll = G__348629;
          k = G__348630;
          v = G__348631;
          kvs = G__348632;
          continue
        }else {
          return ret__348624
        }
        break
      }
    };
    var G__348628 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__348628__delegate.call(this, coll, k, v, kvs)
    };
    G__348628.cljs$lang$maxFixedArity = 3;
    G__348628.cljs$lang$applyTo = function(arglist__348633) {
      var coll = cljs.core.first(arglist__348633);
      var k = cljs.core.first(cljs.core.next(arglist__348633));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__348633)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__348633)));
      return G__348628__delegate.call(this, coll, k, v, kvs)
    };
    return G__348628
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__348625.call(this, coll, k, v);
      default:
        return assoc__348626.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__348626.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__348635 = function(coll) {
    return coll
  };
  var dissoc__348636 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__348637 = function() {
    var G__348639__delegate = function(coll, k, ks) {
      while(true) {
        var ret__348634 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__348640 = ret__348634;
          var G__348641 = cljs.core.first.call(null, ks);
          var G__348642 = cljs.core.next.call(null, ks);
          coll = G__348640;
          k = G__348641;
          ks = G__348642;
          continue
        }else {
          return ret__348634
        }
        break
      }
    };
    var G__348639 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348639__delegate.call(this, coll, k, ks)
    };
    G__348639.cljs$lang$maxFixedArity = 2;
    G__348639.cljs$lang$applyTo = function(arglist__348643) {
      var coll = cljs.core.first(arglist__348643);
      var k = cljs.core.first(cljs.core.next(arglist__348643));
      var ks = cljs.core.rest(cljs.core.next(arglist__348643));
      return G__348639__delegate.call(this, coll, k, ks)
    };
    return G__348639
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__348635.call(this, coll);
      case 2:
        return dissoc__348636.call(this, coll, k);
      default:
        return dissoc__348637.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__348637.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__451__auto____348644 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____348645 = x__451__auto____348644;
      if(cljs.core.truth_(and__3546__auto____348645)) {
        var and__3546__auto____348646 = x__451__auto____348644.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____348646)) {
          return cljs.core.not.call(null, x__451__auto____348644.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____348646
        }
      }else {
        return and__3546__auto____348645
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__451__auto____348644)
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
  var disj__348648 = function(coll) {
    return coll
  };
  var disj__348649 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__348650 = function() {
    var G__348652__delegate = function(coll, k, ks) {
      while(true) {
        var ret__348647 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__348653 = ret__348647;
          var G__348654 = cljs.core.first.call(null, ks);
          var G__348655 = cljs.core.next.call(null, ks);
          coll = G__348653;
          k = G__348654;
          ks = G__348655;
          continue
        }else {
          return ret__348647
        }
        break
      }
    };
    var G__348652 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348652__delegate.call(this, coll, k, ks)
    };
    G__348652.cljs$lang$maxFixedArity = 2;
    G__348652.cljs$lang$applyTo = function(arglist__348656) {
      var coll = cljs.core.first(arglist__348656);
      var k = cljs.core.first(cljs.core.next(arglist__348656));
      var ks = cljs.core.rest(cljs.core.next(arglist__348656));
      return G__348652__delegate.call(this, coll, k, ks)
    };
    return G__348652
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__348648.call(this, coll);
      case 2:
        return disj__348649.call(this, coll, k);
      default:
        return disj__348650.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__348650.cljs$lang$applyTo;
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
    var x__451__auto____348657 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____348658 = x__451__auto____348657;
      if(cljs.core.truth_(and__3546__auto____348658)) {
        var and__3546__auto____348659 = x__451__auto____348657.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____348659)) {
          return cljs.core.not.call(null, x__451__auto____348657.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____348659
        }
      }else {
        return and__3546__auto____348658
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__451__auto____348657)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____348660 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____348661 = x__451__auto____348660;
      if(cljs.core.truth_(and__3546__auto____348661)) {
        var and__3546__auto____348662 = x__451__auto____348660.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____348662)) {
          return cljs.core.not.call(null, x__451__auto____348660.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____348662
        }
      }else {
        return and__3546__auto____348661
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__451__auto____348660)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__451__auto____348663 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____348664 = x__451__auto____348663;
    if(cljs.core.truth_(and__3546__auto____348664)) {
      var and__3546__auto____348665 = x__451__auto____348663.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____348665)) {
        return cljs.core.not.call(null, x__451__auto____348663.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____348665
      }
    }else {
      return and__3546__auto____348664
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__451__auto____348663)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__451__auto____348666 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____348667 = x__451__auto____348666;
    if(cljs.core.truth_(and__3546__auto____348667)) {
      var and__3546__auto____348668 = x__451__auto____348666.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____348668)) {
        return cljs.core.not.call(null, x__451__auto____348666.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____348668
      }
    }else {
      return and__3546__auto____348667
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__451__auto____348666)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__451__auto____348669 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____348670 = x__451__auto____348669;
    if(cljs.core.truth_(and__3546__auto____348670)) {
      var and__3546__auto____348671 = x__451__auto____348669.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____348671)) {
        return cljs.core.not.call(null, x__451__auto____348669.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____348671
      }
    }else {
      return and__3546__auto____348670
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__451__auto____348669)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__451__auto____348672 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____348673 = x__451__auto____348672;
      if(cljs.core.truth_(and__3546__auto____348673)) {
        var and__3546__auto____348674 = x__451__auto____348672.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____348674)) {
          return cljs.core.not.call(null, x__451__auto____348672.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____348674
        }
      }else {
        return and__3546__auto____348673
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__451__auto____348672)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__451__auto____348675 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____348676 = x__451__auto____348675;
    if(cljs.core.truth_(and__3546__auto____348676)) {
      var and__3546__auto____348677 = x__451__auto____348675.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____348677)) {
        return cljs.core.not.call(null, x__451__auto____348675.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____348677
      }
    }else {
      return and__3546__auto____348676
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__451__auto____348675)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__348678 = [];
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__348678.push(key)
  });
  return keys__348678
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
    var x__451__auto____348679 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____348680 = x__451__auto____348679;
      if(cljs.core.truth_(and__3546__auto____348680)) {
        var and__3546__auto____348681 = x__451__auto____348679.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____348681)) {
          return cljs.core.not.call(null, x__451__auto____348679.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____348681
        }
      }else {
        return and__3546__auto____348680
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__451__auto____348679)
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
  var and__3546__auto____348682 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____348682)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____348683 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____348683)) {
        return or__3548__auto____348683
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____348682
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____348684 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____348684)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____348684
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____348685 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____348685)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____348685
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____348686 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____348686)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____348686
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
    var and__3546__auto____348687 = coll;
    if(cljs.core.truth_(and__3546__auto____348687)) {
      var and__3546__auto____348688 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____348688)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____348688
      }
    }else {
      return and__3546__auto____348687
    }
  }())) {
    return cljs.core.PersistentVector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___348693 = function(x) {
    return true
  };
  var distinct_QMARK___348694 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___348695 = function() {
    var G__348697__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__348689 = cljs.core.set([y, x]);
        var xs__348690 = more;
        while(true) {
          var x__348691 = cljs.core.first.call(null, xs__348690);
          var etc__348692 = cljs.core.next.call(null, xs__348690);
          if(cljs.core.truth_(xs__348690)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__348689, x__348691))) {
              return false
            }else {
              var G__348698 = cljs.core.conj.call(null, s__348689, x__348691);
              var G__348699 = etc__348692;
              s__348689 = G__348698;
              xs__348690 = G__348699;
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
    var G__348697 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348697__delegate.call(this, x, y, more)
    };
    G__348697.cljs$lang$maxFixedArity = 2;
    G__348697.cljs$lang$applyTo = function(arglist__348700) {
      var x = cljs.core.first(arglist__348700);
      var y = cljs.core.first(cljs.core.next(arglist__348700));
      var more = cljs.core.rest(cljs.core.next(arglist__348700));
      return G__348697__delegate.call(this, x, y, more)
    };
    return G__348697
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___348693.call(this, x);
      case 2:
        return distinct_QMARK___348694.call(this, x, y);
      default:
        return distinct_QMARK___348695.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___348695.cljs$lang$applyTo;
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
      var r__348701 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__348701))) {
        return r__348701
      }else {
        if(cljs.core.truth_(r__348701)) {
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
  var sort__348703 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__348704 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__348702 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__348702, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__348702)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__348703.call(this, comp);
      case 2:
        return sort__348704.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__348706 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__348707 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__348706.call(this, keyfn, comp);
      case 3:
        return sort_by__348707.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__348709 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__348710 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__348709.call(this, f, val);
      case 3:
        return reduce__348710.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__348716 = function(f, coll) {
    var temp__3695__auto____348712 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____348712)) {
      var s__348713 = temp__3695__auto____348712;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__348713), cljs.core.next.call(null, s__348713))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__348717 = function(f, val, coll) {
    var val__348714 = val;
    var coll__348715 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__348715)) {
        var G__348719 = f.call(null, val__348714, cljs.core.first.call(null, coll__348715));
        var G__348720 = cljs.core.next.call(null, coll__348715);
        val__348714 = G__348719;
        coll__348715 = G__348720;
        continue
      }else {
        return val__348714
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__348716.call(this, f, val);
      case 3:
        return seq_reduce__348717.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__348721 = null;
  var G__348721__348722 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__348721__348723 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__348721 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__348721__348722.call(this, coll, f);
      case 3:
        return G__348721__348723.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348721
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___348725 = function() {
    return 0
  };
  var _PLUS___348726 = function(x) {
    return x
  };
  var _PLUS___348727 = function(x, y) {
    return x + y
  };
  var _PLUS___348728 = function() {
    var G__348730__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__348730 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348730__delegate.call(this, x, y, more)
    };
    G__348730.cljs$lang$maxFixedArity = 2;
    G__348730.cljs$lang$applyTo = function(arglist__348731) {
      var x = cljs.core.first(arglist__348731);
      var y = cljs.core.first(cljs.core.next(arglist__348731));
      var more = cljs.core.rest(cljs.core.next(arglist__348731));
      return G__348730__delegate.call(this, x, y, more)
    };
    return G__348730
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___348725.call(this);
      case 1:
        return _PLUS___348726.call(this, x);
      case 2:
        return _PLUS___348727.call(this, x, y);
      default:
        return _PLUS___348728.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___348728.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___348732 = function(x) {
    return-x
  };
  var ___348733 = function(x, y) {
    return x - y
  };
  var ___348734 = function() {
    var G__348736__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__348736 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348736__delegate.call(this, x, y, more)
    };
    G__348736.cljs$lang$maxFixedArity = 2;
    G__348736.cljs$lang$applyTo = function(arglist__348737) {
      var x = cljs.core.first(arglist__348737);
      var y = cljs.core.first(cljs.core.next(arglist__348737));
      var more = cljs.core.rest(cljs.core.next(arglist__348737));
      return G__348736__delegate.call(this, x, y, more)
    };
    return G__348736
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___348732.call(this, x);
      case 2:
        return ___348733.call(this, x, y);
      default:
        return ___348734.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___348734.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___348738 = function() {
    return 1
  };
  var _STAR___348739 = function(x) {
    return x
  };
  var _STAR___348740 = function(x, y) {
    return x * y
  };
  var _STAR___348741 = function() {
    var G__348743__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__348743 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348743__delegate.call(this, x, y, more)
    };
    G__348743.cljs$lang$maxFixedArity = 2;
    G__348743.cljs$lang$applyTo = function(arglist__348744) {
      var x = cljs.core.first(arglist__348744);
      var y = cljs.core.first(cljs.core.next(arglist__348744));
      var more = cljs.core.rest(cljs.core.next(arglist__348744));
      return G__348743__delegate.call(this, x, y, more)
    };
    return G__348743
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___348738.call(this);
      case 1:
        return _STAR___348739.call(this, x);
      case 2:
        return _STAR___348740.call(this, x, y);
      default:
        return _STAR___348741.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___348741.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___348745 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___348746 = function(x, y) {
    return x / y
  };
  var _SLASH___348747 = function() {
    var G__348749__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__348749 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348749__delegate.call(this, x, y, more)
    };
    G__348749.cljs$lang$maxFixedArity = 2;
    G__348749.cljs$lang$applyTo = function(arglist__348750) {
      var x = cljs.core.first(arglist__348750);
      var y = cljs.core.first(cljs.core.next(arglist__348750));
      var more = cljs.core.rest(cljs.core.next(arglist__348750));
      return G__348749__delegate.call(this, x, y, more)
    };
    return G__348749
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___348745.call(this, x);
      case 2:
        return _SLASH___348746.call(this, x, y);
      default:
        return _SLASH___348747.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___348747.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___348751 = function(x) {
    return true
  };
  var _LT___348752 = function(x, y) {
    return x < y
  };
  var _LT___348753 = function() {
    var G__348755__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__348756 = y;
            var G__348757 = cljs.core.first.call(null, more);
            var G__348758 = cljs.core.next.call(null, more);
            x = G__348756;
            y = G__348757;
            more = G__348758;
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
    var G__348755 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348755__delegate.call(this, x, y, more)
    };
    G__348755.cljs$lang$maxFixedArity = 2;
    G__348755.cljs$lang$applyTo = function(arglist__348759) {
      var x = cljs.core.first(arglist__348759);
      var y = cljs.core.first(cljs.core.next(arglist__348759));
      var more = cljs.core.rest(cljs.core.next(arglist__348759));
      return G__348755__delegate.call(this, x, y, more)
    };
    return G__348755
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___348751.call(this, x);
      case 2:
        return _LT___348752.call(this, x, y);
      default:
        return _LT___348753.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___348753.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___348760 = function(x) {
    return true
  };
  var _LT__EQ___348761 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___348762 = function() {
    var G__348764__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__348765 = y;
            var G__348766 = cljs.core.first.call(null, more);
            var G__348767 = cljs.core.next.call(null, more);
            x = G__348765;
            y = G__348766;
            more = G__348767;
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
    var G__348764 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348764__delegate.call(this, x, y, more)
    };
    G__348764.cljs$lang$maxFixedArity = 2;
    G__348764.cljs$lang$applyTo = function(arglist__348768) {
      var x = cljs.core.first(arglist__348768);
      var y = cljs.core.first(cljs.core.next(arglist__348768));
      var more = cljs.core.rest(cljs.core.next(arglist__348768));
      return G__348764__delegate.call(this, x, y, more)
    };
    return G__348764
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___348760.call(this, x);
      case 2:
        return _LT__EQ___348761.call(this, x, y);
      default:
        return _LT__EQ___348762.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___348762.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___348769 = function(x) {
    return true
  };
  var _GT___348770 = function(x, y) {
    return x > y
  };
  var _GT___348771 = function() {
    var G__348773__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__348774 = y;
            var G__348775 = cljs.core.first.call(null, more);
            var G__348776 = cljs.core.next.call(null, more);
            x = G__348774;
            y = G__348775;
            more = G__348776;
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
    var G__348773 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348773__delegate.call(this, x, y, more)
    };
    G__348773.cljs$lang$maxFixedArity = 2;
    G__348773.cljs$lang$applyTo = function(arglist__348777) {
      var x = cljs.core.first(arglist__348777);
      var y = cljs.core.first(cljs.core.next(arglist__348777));
      var more = cljs.core.rest(cljs.core.next(arglist__348777));
      return G__348773__delegate.call(this, x, y, more)
    };
    return G__348773
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___348769.call(this, x);
      case 2:
        return _GT___348770.call(this, x, y);
      default:
        return _GT___348771.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___348771.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___348778 = function(x) {
    return true
  };
  var _GT__EQ___348779 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___348780 = function() {
    var G__348782__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__348783 = y;
            var G__348784 = cljs.core.first.call(null, more);
            var G__348785 = cljs.core.next.call(null, more);
            x = G__348783;
            y = G__348784;
            more = G__348785;
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
    var G__348782 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348782__delegate.call(this, x, y, more)
    };
    G__348782.cljs$lang$maxFixedArity = 2;
    G__348782.cljs$lang$applyTo = function(arglist__348786) {
      var x = cljs.core.first(arglist__348786);
      var y = cljs.core.first(cljs.core.next(arglist__348786));
      var more = cljs.core.rest(cljs.core.next(arglist__348786));
      return G__348782__delegate.call(this, x, y, more)
    };
    return G__348782
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___348778.call(this, x);
      case 2:
        return _GT__EQ___348779.call(this, x, y);
      default:
        return _GT__EQ___348780.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___348780.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__348787 = function(x) {
    return x
  };
  var max__348788 = function(x, y) {
    return x > y ? x : y
  };
  var max__348789 = function() {
    var G__348791__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__348791 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348791__delegate.call(this, x, y, more)
    };
    G__348791.cljs$lang$maxFixedArity = 2;
    G__348791.cljs$lang$applyTo = function(arglist__348792) {
      var x = cljs.core.first(arglist__348792);
      var y = cljs.core.first(cljs.core.next(arglist__348792));
      var more = cljs.core.rest(cljs.core.next(arglist__348792));
      return G__348791__delegate.call(this, x, y, more)
    };
    return G__348791
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__348787.call(this, x);
      case 2:
        return max__348788.call(this, x, y);
      default:
        return max__348789.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__348789.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__348793 = function(x) {
    return x
  };
  var min__348794 = function(x, y) {
    return x < y ? x : y
  };
  var min__348795 = function() {
    var G__348797__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__348797 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348797__delegate.call(this, x, y, more)
    };
    G__348797.cljs$lang$maxFixedArity = 2;
    G__348797.cljs$lang$applyTo = function(arglist__348798) {
      var x = cljs.core.first(arglist__348798);
      var y = cljs.core.first(cljs.core.next(arglist__348798));
      var more = cljs.core.rest(cljs.core.next(arglist__348798));
      return G__348797__delegate.call(this, x, y, more)
    };
    return G__348797
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__348793.call(this, x);
      case 2:
        return min__348794.call(this, x, y);
      default:
        return min__348795.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__348795.cljs$lang$applyTo;
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
  var rem__348799 = n % d;
  return cljs.core.fix.call(null, (n - rem__348799) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__348800 = cljs.core.quot.call(null, n, d);
  return n - d * q__348800
};
cljs.core.rand = function() {
  var rand = null;
  var rand__348801 = function() {
    return Math.random.call(null)
  };
  var rand__348802 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__348801.call(this);
      case 1:
        return rand__348802.call(this, n)
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
  var _EQ__EQ___348804 = function(x) {
    return true
  };
  var _EQ__EQ___348805 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___348806 = function() {
    var G__348808__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__348809 = y;
            var G__348810 = cljs.core.first.call(null, more);
            var G__348811 = cljs.core.next.call(null, more);
            x = G__348809;
            y = G__348810;
            more = G__348811;
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
    var G__348808 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348808__delegate.call(this, x, y, more)
    };
    G__348808.cljs$lang$maxFixedArity = 2;
    G__348808.cljs$lang$applyTo = function(arglist__348812) {
      var x = cljs.core.first(arglist__348812);
      var y = cljs.core.first(cljs.core.next(arglist__348812));
      var more = cljs.core.rest(cljs.core.next(arglist__348812));
      return G__348808__delegate.call(this, x, y, more)
    };
    return G__348808
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___348804.call(this, x);
      case 2:
        return _EQ__EQ___348805.call(this, x, y);
      default:
        return _EQ__EQ___348806.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___348806.cljs$lang$applyTo;
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
  var n__348813 = n;
  var xs__348814 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348815 = xs__348814;
      if(cljs.core.truth_(and__3546__auto____348815)) {
        return n__348813 > 0
      }else {
        return and__3546__auto____348815
      }
    }())) {
      var G__348816 = n__348813 - 1;
      var G__348817 = cljs.core.next.call(null, xs__348814);
      n__348813 = G__348816;
      xs__348814 = G__348817;
      continue
    }else {
      return xs__348814
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__348822 = null;
  var G__348822__348823 = function(coll, n) {
    var temp__3695__auto____348818 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____348818)) {
      var xs__348819 = temp__3695__auto____348818;
      return cljs.core.first.call(null, xs__348819)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__348822__348824 = function(coll, n, not_found) {
    var temp__3695__auto____348820 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____348820)) {
      var xs__348821 = temp__3695__auto____348820;
      return cljs.core.first.call(null, xs__348821)
    }else {
      return not_found
    }
  };
  G__348822 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348822__348823.call(this, coll, n);
      case 3:
        return G__348822__348824.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348822
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___348826 = function() {
    return""
  };
  var str_STAR___348827 = function(x) {
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
  var str_STAR___348828 = function() {
    var G__348830__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__348831 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__348832 = cljs.core.next.call(null, more);
            sb = G__348831;
            more = G__348832;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__348830 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__348830__delegate.call(this, x, ys)
    };
    G__348830.cljs$lang$maxFixedArity = 1;
    G__348830.cljs$lang$applyTo = function(arglist__348833) {
      var x = cljs.core.first(arglist__348833);
      var ys = cljs.core.rest(arglist__348833);
      return G__348830__delegate.call(this, x, ys)
    };
    return G__348830
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___348826.call(this);
      case 1:
        return str_STAR___348827.call(this, x);
      default:
        return str_STAR___348828.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___348828.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__348834 = function() {
    return""
  };
  var str__348835 = function(x) {
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
  var str__348836 = function() {
    var G__348838__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__348839 = sb.append(str.call(null, cljs.core.first.call(null, more)));
            var G__348840 = cljs.core.next.call(null, more);
            sb = G__348839;
            more = G__348840;
            continue
          }else {
            return cljs.core.str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.call(null, x)), ys)
    };
    var G__348838 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__348838__delegate.call(this, x, ys)
    };
    G__348838.cljs$lang$maxFixedArity = 1;
    G__348838.cljs$lang$applyTo = function(arglist__348841) {
      var x = cljs.core.first(arglist__348841);
      var ys = cljs.core.rest(arglist__348841);
      return G__348838__delegate.call(this, x, ys)
    };
    return G__348838
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__348834.call(this);
      case 1:
        return str__348835.call(this, x);
      default:
        return str__348836.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__348836.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__348842 = function(s, start) {
    return s.substring(start)
  };
  var subs__348843 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__348842.call(this, s, start);
      case 3:
        return subs__348843.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__348845 = function(name) {
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
  var symbol__348846 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__348845.call(this, ns);
      case 2:
        return symbol__348846.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__348848 = function(name) {
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
  var keyword__348849 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__348848.call(this, ns);
      case 2:
        return keyword__348849.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__348851 = cljs.core.seq.call(null, x);
    var ys__348852 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__348851 === null)) {
        return ys__348852 === null
      }else {
        if(cljs.core.truth_(ys__348852 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__348851), cljs.core.first.call(null, ys__348852)))) {
            var G__348853 = cljs.core.next.call(null, xs__348851);
            var G__348854 = cljs.core.next.call(null, ys__348852);
            xs__348851 = G__348853;
            ys__348852 = G__348854;
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
  return cljs.core.reduce.call(null, function(p1__348855_SHARP_, p2__348856_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__348855_SHARP_, cljs.core.hash.call(null, p2__348856_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__348857__348858 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__348857__348858)) {
    var G__348860__348862 = cljs.core.first.call(null, G__348857__348858);
    var vec__348861__348863 = G__348860__348862;
    var key_name__348864 = cljs.core.nth.call(null, vec__348861__348863, 0, null);
    var f__348865 = cljs.core.nth.call(null, vec__348861__348863, 1, null);
    var G__348857__348866 = G__348857__348858;
    var G__348860__348867 = G__348860__348862;
    var G__348857__348868 = G__348857__348866;
    while(true) {
      var vec__348869__348870 = G__348860__348867;
      var key_name__348871 = cljs.core.nth.call(null, vec__348869__348870, 0, null);
      var f__348872 = cljs.core.nth.call(null, vec__348869__348870, 1, null);
      var G__348857__348873 = G__348857__348868;
      var str_name__348874 = cljs.core.name.call(null, key_name__348871);
      obj[str_name__348874] = f__348872;
      var temp__3698__auto____348875 = cljs.core.next.call(null, G__348857__348873);
      if(cljs.core.truth_(temp__3698__auto____348875)) {
        var G__348857__348876 = temp__3698__auto____348875;
        var G__348877 = cljs.core.first.call(null, G__348857__348876);
        var G__348878 = G__348857__348876;
        G__348860__348867 = G__348877;
        G__348857__348868 = G__348878;
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
  var this__348879 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__348880 = this;
  return new cljs.core.List(this__348880.meta, o, coll, this__348880.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__348881 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__348882 = this;
  return this__348882.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__348883 = this;
  return this__348883.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__348884 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__348885 = this;
  return this__348885.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__348886 = this;
  return this__348886.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__348887 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__348888 = this;
  return new cljs.core.List(meta, this__348888.first, this__348888.rest, this__348888.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__348889 = this;
  return this__348889.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__348890 = this;
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
  var this__348891 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__348892 = this;
  return new cljs.core.List(this__348892.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__348893 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__348894 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__348895 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__348896 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__348897 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__348898 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__348899 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__348900 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__348901 = this;
  return this__348901.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__348902 = this;
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
  list.cljs$lang$applyTo = function(arglist__348903) {
    var items = cljs.core.seq(arglist__348903);
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
  var this__348904 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__348905 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__348906 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__348907 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__348907.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__348908 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__348909 = this;
  return this__348909.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__348910 = this;
  if(cljs.core.truth_(this__348910.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__348910.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__348911 = this;
  return this__348911.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__348912 = this;
  return new cljs.core.Cons(meta, this__348912.first, this__348912.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__348913 = null;
  var G__348913__348914 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__348913__348915 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__348913 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__348913__348914.call(this, string, f);
      case 3:
        return G__348913__348915.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348913
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__348917 = null;
  var G__348917__348918 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__348917__348919 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__348917 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348917__348918.call(this, string, k);
      case 3:
        return G__348917__348919.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348917
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__348921 = null;
  var G__348921__348922 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__348921__348923 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__348921 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348921__348922.call(this, string, n);
      case 3:
        return G__348921__348923.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348921
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
  var G__348931 = null;
  var G__348931__348932 = function(tsym348925, coll) {
    var tsym348925__348927 = this;
    var this$__348928 = tsym348925__348927;
    return cljs.core.get.call(null, coll, this$__348928.toString())
  };
  var G__348931__348933 = function(tsym348926, coll, not_found) {
    var tsym348926__348929 = this;
    var this$__348930 = tsym348926__348929;
    return cljs.core.get.call(null, coll, this$__348930.toString(), not_found)
  };
  G__348931 = function(tsym348926, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__348931__348932.call(this, tsym348926, coll);
      case 3:
        return G__348931__348933.call(this, tsym348926, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__348931
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__348935 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__348935
  }else {
    lazy_seq.x = x__348935.call(null);
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
  var this__348936 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__348937 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__348938 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__348939 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__348939.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__348940 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__348941 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__348942 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__348943 = this;
  return this__348943.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__348944 = this;
  return new cljs.core.LazySeq(meta, this__348944.realized, this__348944.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__348945 = [];
  var s__348946 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__348946))) {
      ary__348945.push(cljs.core.first.call(null, s__348946));
      var G__348947 = cljs.core.next.call(null, s__348946);
      s__348946 = G__348947;
      continue
    }else {
      return ary__348945
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__348948 = s;
  var i__348949 = n;
  var sum__348950 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____348951 = i__348949 > 0;
      if(cljs.core.truth_(and__3546__auto____348951)) {
        return cljs.core.seq.call(null, s__348948)
      }else {
        return and__3546__auto____348951
      }
    }())) {
      var G__348952 = cljs.core.next.call(null, s__348948);
      var G__348953 = i__348949 - 1;
      var G__348954 = sum__348950 + 1;
      s__348948 = G__348952;
      i__348949 = G__348953;
      sum__348950 = G__348954;
      continue
    }else {
      return sum__348950
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
  var concat__348958 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__348959 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__348960 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__348955 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__348955)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__348955), concat.call(null, cljs.core.rest.call(null, s__348955), y))
      }else {
        return y
      }
    })
  };
  var concat__348961 = function() {
    var G__348963__delegate = function(x, y, zs) {
      var cat__348957 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__348956 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__348956)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__348956), cat.call(null, cljs.core.rest.call(null, xys__348956), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__348957.call(null, concat.call(null, x, y), zs)
    };
    var G__348963 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348963__delegate.call(this, x, y, zs)
    };
    G__348963.cljs$lang$maxFixedArity = 2;
    G__348963.cljs$lang$applyTo = function(arglist__348964) {
      var x = cljs.core.first(arglist__348964);
      var y = cljs.core.first(cljs.core.next(arglist__348964));
      var zs = cljs.core.rest(cljs.core.next(arglist__348964));
      return G__348963__delegate.call(this, x, y, zs)
    };
    return G__348963
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__348958.call(this);
      case 1:
        return concat__348959.call(this, x);
      case 2:
        return concat__348960.call(this, x, y);
      default:
        return concat__348961.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__348961.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___348965 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___348966 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___348967 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___348968 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___348969 = function() {
    var G__348971__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__348971 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__348971__delegate.call(this, a, b, c, d, more)
    };
    G__348971.cljs$lang$maxFixedArity = 4;
    G__348971.cljs$lang$applyTo = function(arglist__348972) {
      var a = cljs.core.first(arglist__348972);
      var b = cljs.core.first(cljs.core.next(arglist__348972));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__348972)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__348972))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__348972))));
      return G__348971__delegate.call(this, a, b, c, d, more)
    };
    return G__348971
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___348965.call(this, a);
      case 2:
        return list_STAR___348966.call(this, a, b);
      case 3:
        return list_STAR___348967.call(this, a, b, c);
      case 4:
        return list_STAR___348968.call(this, a, b, c, d);
      default:
        return list_STAR___348969.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___348969.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__348982 = function(f, args) {
    var fixed_arity__348973 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__348973 + 1) <= fixed_arity__348973)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__348983 = function(f, x, args) {
    var arglist__348974 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__348975 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__348974, fixed_arity__348975) <= fixed_arity__348975)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__348974))
      }else {
        return f.cljs$lang$applyTo(arglist__348974)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__348974))
    }
  };
  var apply__348984 = function(f, x, y, args) {
    var arglist__348976 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__348977 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__348976, fixed_arity__348977) <= fixed_arity__348977)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__348976))
      }else {
        return f.cljs$lang$applyTo(arglist__348976)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__348976))
    }
  };
  var apply__348985 = function(f, x, y, z, args) {
    var arglist__348978 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__348979 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__348978, fixed_arity__348979) <= fixed_arity__348979)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__348978))
      }else {
        return f.cljs$lang$applyTo(arglist__348978)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__348978))
    }
  };
  var apply__348986 = function() {
    var G__348988__delegate = function(f, a, b, c, d, args) {
      var arglist__348980 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__348981 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__348980, fixed_arity__348981) <= fixed_arity__348981)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__348980))
        }else {
          return f.cljs$lang$applyTo(arglist__348980)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__348980))
      }
    };
    var G__348988 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__348988__delegate.call(this, f, a, b, c, d, args)
    };
    G__348988.cljs$lang$maxFixedArity = 5;
    G__348988.cljs$lang$applyTo = function(arglist__348989) {
      var f = cljs.core.first(arglist__348989);
      var a = cljs.core.first(cljs.core.next(arglist__348989));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__348989)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__348989))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__348989)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__348989)))));
      return G__348988__delegate.call(this, f, a, b, c, d, args)
    };
    return G__348988
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__348982.call(this, f, a);
      case 3:
        return apply__348983.call(this, f, a, b);
      case 4:
        return apply__348984.call(this, f, a, b, c);
      case 5:
        return apply__348985.call(this, f, a, b, c, d);
      default:
        return apply__348986.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__348986.cljs$lang$applyTo;
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
  vary_meta.cljs$lang$applyTo = function(arglist__348990) {
    var obj = cljs.core.first(arglist__348990);
    var f = cljs.core.first(cljs.core.next(arglist__348990));
    var args = cljs.core.rest(cljs.core.next(arglist__348990));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___348991 = function(x) {
    return false
  };
  var not_EQ___348992 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___348993 = function() {
    var G__348995__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__348995 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__348995__delegate.call(this, x, y, more)
    };
    G__348995.cljs$lang$maxFixedArity = 2;
    G__348995.cljs$lang$applyTo = function(arglist__348996) {
      var x = cljs.core.first(arglist__348996);
      var y = cljs.core.first(cljs.core.next(arglist__348996));
      var more = cljs.core.rest(cljs.core.next(arglist__348996));
      return G__348995__delegate.call(this, x, y, more)
    };
    return G__348995
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___348991.call(this, x);
      case 2:
        return not_EQ___348992.call(this, x, y);
      default:
        return not_EQ___348993.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___348993.cljs$lang$applyTo;
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
        var G__348997 = pred;
        var G__348998 = cljs.core.next.call(null, coll);
        pred = G__348997;
        coll = G__348998;
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
      var or__3548__auto____348999 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____348999)) {
        return or__3548__auto____348999
      }else {
        var G__349000 = pred;
        var G__349001 = cljs.core.next.call(null, coll);
        pred = G__349000;
        coll = G__349001;
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
    var G__349002 = null;
    var G__349002__349003 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__349002__349004 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__349002__349005 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__349002__349006 = function() {
      var G__349008__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__349008 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__349008__delegate.call(this, x, y, zs)
      };
      G__349008.cljs$lang$maxFixedArity = 2;
      G__349008.cljs$lang$applyTo = function(arglist__349009) {
        var x = cljs.core.first(arglist__349009);
        var y = cljs.core.first(cljs.core.next(arglist__349009));
        var zs = cljs.core.rest(cljs.core.next(arglist__349009));
        return G__349008__delegate.call(this, x, y, zs)
      };
      return G__349008
    }();
    G__349002 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__349002__349003.call(this);
        case 1:
          return G__349002__349004.call(this, x);
        case 2:
          return G__349002__349005.call(this, x, y);
        default:
          return G__349002__349006.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__349002.cljs$lang$maxFixedArity = 2;
    G__349002.cljs$lang$applyTo = G__349002__349006.cljs$lang$applyTo;
    return G__349002
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__349010__delegate = function(args) {
      return x
    };
    var G__349010 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__349010__delegate.call(this, args)
    };
    G__349010.cljs$lang$maxFixedArity = 0;
    G__349010.cljs$lang$applyTo = function(arglist__349011) {
      var args = cljs.core.seq(arglist__349011);
      return G__349010__delegate.call(this, args)
    };
    return G__349010
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__349015 = function() {
    return cljs.core.identity
  };
  var comp__349016 = function(f) {
    return f
  };
  var comp__349017 = function(f, g) {
    return function() {
      var G__349021 = null;
      var G__349021__349022 = function() {
        return f.call(null, g.call(null))
      };
      var G__349021__349023 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__349021__349024 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__349021__349025 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__349021__349026 = function() {
        var G__349028__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__349028 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349028__delegate.call(this, x, y, z, args)
        };
        G__349028.cljs$lang$maxFixedArity = 3;
        G__349028.cljs$lang$applyTo = function(arglist__349029) {
          var x = cljs.core.first(arglist__349029);
          var y = cljs.core.first(cljs.core.next(arglist__349029));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349029)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349029)));
          return G__349028__delegate.call(this, x, y, z, args)
        };
        return G__349028
      }();
      G__349021 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__349021__349022.call(this);
          case 1:
            return G__349021__349023.call(this, x);
          case 2:
            return G__349021__349024.call(this, x, y);
          case 3:
            return G__349021__349025.call(this, x, y, z);
          default:
            return G__349021__349026.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349021.cljs$lang$maxFixedArity = 3;
      G__349021.cljs$lang$applyTo = G__349021__349026.cljs$lang$applyTo;
      return G__349021
    }()
  };
  var comp__349018 = function(f, g, h) {
    return function() {
      var G__349030 = null;
      var G__349030__349031 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__349030__349032 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__349030__349033 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__349030__349034 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__349030__349035 = function() {
        var G__349037__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__349037 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349037__delegate.call(this, x, y, z, args)
        };
        G__349037.cljs$lang$maxFixedArity = 3;
        G__349037.cljs$lang$applyTo = function(arglist__349038) {
          var x = cljs.core.first(arglist__349038);
          var y = cljs.core.first(cljs.core.next(arglist__349038));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349038)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349038)));
          return G__349037__delegate.call(this, x, y, z, args)
        };
        return G__349037
      }();
      G__349030 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__349030__349031.call(this);
          case 1:
            return G__349030__349032.call(this, x);
          case 2:
            return G__349030__349033.call(this, x, y);
          case 3:
            return G__349030__349034.call(this, x, y, z);
          default:
            return G__349030__349035.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349030.cljs$lang$maxFixedArity = 3;
      G__349030.cljs$lang$applyTo = G__349030__349035.cljs$lang$applyTo;
      return G__349030
    }()
  };
  var comp__349019 = function() {
    var G__349039__delegate = function(f1, f2, f3, fs) {
      var fs__349012 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__349040__delegate = function(args) {
          var ret__349013 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__349012), args);
          var fs__349014 = cljs.core.next.call(null, fs__349012);
          while(true) {
            if(cljs.core.truth_(fs__349014)) {
              var G__349041 = cljs.core.first.call(null, fs__349014).call(null, ret__349013);
              var G__349042 = cljs.core.next.call(null, fs__349014);
              ret__349013 = G__349041;
              fs__349014 = G__349042;
              continue
            }else {
              return ret__349013
            }
            break
          }
        };
        var G__349040 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__349040__delegate.call(this, args)
        };
        G__349040.cljs$lang$maxFixedArity = 0;
        G__349040.cljs$lang$applyTo = function(arglist__349043) {
          var args = cljs.core.seq(arglist__349043);
          return G__349040__delegate.call(this, args)
        };
        return G__349040
      }()
    };
    var G__349039 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__349039__delegate.call(this, f1, f2, f3, fs)
    };
    G__349039.cljs$lang$maxFixedArity = 3;
    G__349039.cljs$lang$applyTo = function(arglist__349044) {
      var f1 = cljs.core.first(arglist__349044);
      var f2 = cljs.core.first(cljs.core.next(arglist__349044));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349044)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349044)));
      return G__349039__delegate.call(this, f1, f2, f3, fs)
    };
    return G__349039
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__349015.call(this);
      case 1:
        return comp__349016.call(this, f1);
      case 2:
        return comp__349017.call(this, f1, f2);
      case 3:
        return comp__349018.call(this, f1, f2, f3);
      default:
        return comp__349019.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__349019.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__349045 = function(f, arg1) {
    return function() {
      var G__349050__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__349050 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__349050__delegate.call(this, args)
      };
      G__349050.cljs$lang$maxFixedArity = 0;
      G__349050.cljs$lang$applyTo = function(arglist__349051) {
        var args = cljs.core.seq(arglist__349051);
        return G__349050__delegate.call(this, args)
      };
      return G__349050
    }()
  };
  var partial__349046 = function(f, arg1, arg2) {
    return function() {
      var G__349052__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__349052 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__349052__delegate.call(this, args)
      };
      G__349052.cljs$lang$maxFixedArity = 0;
      G__349052.cljs$lang$applyTo = function(arglist__349053) {
        var args = cljs.core.seq(arglist__349053);
        return G__349052__delegate.call(this, args)
      };
      return G__349052
    }()
  };
  var partial__349047 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__349054__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__349054 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__349054__delegate.call(this, args)
      };
      G__349054.cljs$lang$maxFixedArity = 0;
      G__349054.cljs$lang$applyTo = function(arglist__349055) {
        var args = cljs.core.seq(arglist__349055);
        return G__349054__delegate.call(this, args)
      };
      return G__349054
    }()
  };
  var partial__349048 = function() {
    var G__349056__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__349057__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__349057 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__349057__delegate.call(this, args)
        };
        G__349057.cljs$lang$maxFixedArity = 0;
        G__349057.cljs$lang$applyTo = function(arglist__349058) {
          var args = cljs.core.seq(arglist__349058);
          return G__349057__delegate.call(this, args)
        };
        return G__349057
      }()
    };
    var G__349056 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__349056__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__349056.cljs$lang$maxFixedArity = 4;
    G__349056.cljs$lang$applyTo = function(arglist__349059) {
      var f = cljs.core.first(arglist__349059);
      var arg1 = cljs.core.first(cljs.core.next(arglist__349059));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349059)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__349059))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__349059))));
      return G__349056__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__349056
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__349045.call(this, f, arg1);
      case 3:
        return partial__349046.call(this, f, arg1, arg2);
      case 4:
        return partial__349047.call(this, f, arg1, arg2, arg3);
      default:
        return partial__349048.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__349048.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__349060 = function(f, x) {
    return function() {
      var G__349064 = null;
      var G__349064__349065 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__349064__349066 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__349064__349067 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__349064__349068 = function() {
        var G__349070__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__349070 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349070__delegate.call(this, a, b, c, ds)
        };
        G__349070.cljs$lang$maxFixedArity = 3;
        G__349070.cljs$lang$applyTo = function(arglist__349071) {
          var a = cljs.core.first(arglist__349071);
          var b = cljs.core.first(cljs.core.next(arglist__349071));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349071)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349071)));
          return G__349070__delegate.call(this, a, b, c, ds)
        };
        return G__349070
      }();
      G__349064 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__349064__349065.call(this, a);
          case 2:
            return G__349064__349066.call(this, a, b);
          case 3:
            return G__349064__349067.call(this, a, b, c);
          default:
            return G__349064__349068.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349064.cljs$lang$maxFixedArity = 3;
      G__349064.cljs$lang$applyTo = G__349064__349068.cljs$lang$applyTo;
      return G__349064
    }()
  };
  var fnil__349061 = function(f, x, y) {
    return function() {
      var G__349072 = null;
      var G__349072__349073 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__349072__349074 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__349072__349075 = function() {
        var G__349077__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__349077 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349077__delegate.call(this, a, b, c, ds)
        };
        G__349077.cljs$lang$maxFixedArity = 3;
        G__349077.cljs$lang$applyTo = function(arglist__349078) {
          var a = cljs.core.first(arglist__349078);
          var b = cljs.core.first(cljs.core.next(arglist__349078));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349078)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349078)));
          return G__349077__delegate.call(this, a, b, c, ds)
        };
        return G__349077
      }();
      G__349072 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__349072__349073.call(this, a, b);
          case 3:
            return G__349072__349074.call(this, a, b, c);
          default:
            return G__349072__349075.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349072.cljs$lang$maxFixedArity = 3;
      G__349072.cljs$lang$applyTo = G__349072__349075.cljs$lang$applyTo;
      return G__349072
    }()
  };
  var fnil__349062 = function(f, x, y, z) {
    return function() {
      var G__349079 = null;
      var G__349079__349080 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__349079__349081 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__349079__349082 = function() {
        var G__349084__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__349084 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349084__delegate.call(this, a, b, c, ds)
        };
        G__349084.cljs$lang$maxFixedArity = 3;
        G__349084.cljs$lang$applyTo = function(arglist__349085) {
          var a = cljs.core.first(arglist__349085);
          var b = cljs.core.first(cljs.core.next(arglist__349085));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349085)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349085)));
          return G__349084__delegate.call(this, a, b, c, ds)
        };
        return G__349084
      }();
      G__349079 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__349079__349080.call(this, a, b);
          case 3:
            return G__349079__349081.call(this, a, b, c);
          default:
            return G__349079__349082.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349079.cljs$lang$maxFixedArity = 3;
      G__349079.cljs$lang$applyTo = G__349079__349082.cljs$lang$applyTo;
      return G__349079
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__349060.call(this, f, x);
      case 3:
        return fnil__349061.call(this, f, x, y);
      case 4:
        return fnil__349062.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__349088 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349086 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349086)) {
        var s__349087 = temp__3698__auto____349086;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__349087)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__349087)))
      }else {
        return null
      }
    })
  };
  return mapi__349088.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____349089 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____349089)) {
      var s__349090 = temp__3698__auto____349089;
      var x__349091 = f.call(null, cljs.core.first.call(null, s__349090));
      if(cljs.core.truth_(x__349091 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__349090))
      }else {
        return cljs.core.cons.call(null, x__349091, keep.call(null, f, cljs.core.rest.call(null, s__349090)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__349101 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349098 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349098)) {
        var s__349099 = temp__3698__auto____349098;
        var x__349100 = f.call(null, idx, cljs.core.first.call(null, s__349099));
        if(cljs.core.truth_(x__349100 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__349099))
        }else {
          return cljs.core.cons.call(null, x__349100, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__349099)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__349101.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__349146 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__349151 = function() {
        return true
      };
      var ep1__349152 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__349153 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349108 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349108)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____349108
          }
        }())
      };
      var ep1__349154 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349109 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349109)) {
            var and__3546__auto____349110 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____349110)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____349110
            }
          }else {
            return and__3546__auto____349109
          }
        }())
      };
      var ep1__349155 = function() {
        var G__349157__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____349111 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____349111)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____349111
            }
          }())
        };
        var G__349157 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349157__delegate.call(this, x, y, z, args)
        };
        G__349157.cljs$lang$maxFixedArity = 3;
        G__349157.cljs$lang$applyTo = function(arglist__349158) {
          var x = cljs.core.first(arglist__349158);
          var y = cljs.core.first(cljs.core.next(arglist__349158));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349158)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349158)));
          return G__349157__delegate.call(this, x, y, z, args)
        };
        return G__349157
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__349151.call(this);
          case 1:
            return ep1__349152.call(this, x);
          case 2:
            return ep1__349153.call(this, x, y);
          case 3:
            return ep1__349154.call(this, x, y, z);
          default:
            return ep1__349155.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__349155.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__349147 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__349159 = function() {
        return true
      };
      var ep2__349160 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349112 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349112)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____349112
          }
        }())
      };
      var ep2__349161 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349113 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349113)) {
            var and__3546__auto____349114 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____349114)) {
              var and__3546__auto____349115 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____349115)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____349115
              }
            }else {
              return and__3546__auto____349114
            }
          }else {
            return and__3546__auto____349113
          }
        }())
      };
      var ep2__349162 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349116 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349116)) {
            var and__3546__auto____349117 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____349117)) {
              var and__3546__auto____349118 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____349118)) {
                var and__3546__auto____349119 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____349119)) {
                  var and__3546__auto____349120 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____349120)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____349120
                  }
                }else {
                  return and__3546__auto____349119
                }
              }else {
                return and__3546__auto____349118
              }
            }else {
              return and__3546__auto____349117
            }
          }else {
            return and__3546__auto____349116
          }
        }())
      };
      var ep2__349163 = function() {
        var G__349165__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____349121 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____349121)) {
              return cljs.core.every_QMARK_.call(null, function(p1__349092_SHARP_) {
                var and__3546__auto____349122 = p1.call(null, p1__349092_SHARP_);
                if(cljs.core.truth_(and__3546__auto____349122)) {
                  return p2.call(null, p1__349092_SHARP_)
                }else {
                  return and__3546__auto____349122
                }
              }, args)
            }else {
              return and__3546__auto____349121
            }
          }())
        };
        var G__349165 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349165__delegate.call(this, x, y, z, args)
        };
        G__349165.cljs$lang$maxFixedArity = 3;
        G__349165.cljs$lang$applyTo = function(arglist__349166) {
          var x = cljs.core.first(arglist__349166);
          var y = cljs.core.first(cljs.core.next(arglist__349166));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349166)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349166)));
          return G__349165__delegate.call(this, x, y, z, args)
        };
        return G__349165
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__349159.call(this);
          case 1:
            return ep2__349160.call(this, x);
          case 2:
            return ep2__349161.call(this, x, y);
          case 3:
            return ep2__349162.call(this, x, y, z);
          default:
            return ep2__349163.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__349163.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__349148 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__349167 = function() {
        return true
      };
      var ep3__349168 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349123 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349123)) {
            var and__3546__auto____349124 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____349124)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____349124
            }
          }else {
            return and__3546__auto____349123
          }
        }())
      };
      var ep3__349169 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349125 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349125)) {
            var and__3546__auto____349126 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____349126)) {
              var and__3546__auto____349127 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____349127)) {
                var and__3546__auto____349128 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____349128)) {
                  var and__3546__auto____349129 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____349129)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____349129
                  }
                }else {
                  return and__3546__auto____349128
                }
              }else {
                return and__3546__auto____349127
              }
            }else {
              return and__3546__auto____349126
            }
          }else {
            return and__3546__auto____349125
          }
        }())
      };
      var ep3__349170 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____349130 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____349130)) {
            var and__3546__auto____349131 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____349131)) {
              var and__3546__auto____349132 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____349132)) {
                var and__3546__auto____349133 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____349133)) {
                  var and__3546__auto____349134 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____349134)) {
                    var and__3546__auto____349135 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____349135)) {
                      var and__3546__auto____349136 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____349136)) {
                        var and__3546__auto____349137 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____349137)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____349137
                        }
                      }else {
                        return and__3546__auto____349136
                      }
                    }else {
                      return and__3546__auto____349135
                    }
                  }else {
                    return and__3546__auto____349134
                  }
                }else {
                  return and__3546__auto____349133
                }
              }else {
                return and__3546__auto____349132
              }
            }else {
              return and__3546__auto____349131
            }
          }else {
            return and__3546__auto____349130
          }
        }())
      };
      var ep3__349171 = function() {
        var G__349173__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____349138 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____349138)) {
              return cljs.core.every_QMARK_.call(null, function(p1__349093_SHARP_) {
                var and__3546__auto____349139 = p1.call(null, p1__349093_SHARP_);
                if(cljs.core.truth_(and__3546__auto____349139)) {
                  var and__3546__auto____349140 = p2.call(null, p1__349093_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____349140)) {
                    return p3.call(null, p1__349093_SHARP_)
                  }else {
                    return and__3546__auto____349140
                  }
                }else {
                  return and__3546__auto____349139
                }
              }, args)
            }else {
              return and__3546__auto____349138
            }
          }())
        };
        var G__349173 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349173__delegate.call(this, x, y, z, args)
        };
        G__349173.cljs$lang$maxFixedArity = 3;
        G__349173.cljs$lang$applyTo = function(arglist__349174) {
          var x = cljs.core.first(arglist__349174);
          var y = cljs.core.first(cljs.core.next(arglist__349174));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349174)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349174)));
          return G__349173__delegate.call(this, x, y, z, args)
        };
        return G__349173
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__349167.call(this);
          case 1:
            return ep3__349168.call(this, x);
          case 2:
            return ep3__349169.call(this, x, y);
          case 3:
            return ep3__349170.call(this, x, y, z);
          default:
            return ep3__349171.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__349171.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__349149 = function() {
    var G__349175__delegate = function(p1, p2, p3, ps) {
      var ps__349141 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__349176 = function() {
          return true
        };
        var epn__349177 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__349094_SHARP_) {
            return p1__349094_SHARP_.call(null, x)
          }, ps__349141)
        };
        var epn__349178 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__349095_SHARP_) {
            var and__3546__auto____349142 = p1__349095_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____349142)) {
              return p1__349095_SHARP_.call(null, y)
            }else {
              return and__3546__auto____349142
            }
          }, ps__349141)
        };
        var epn__349179 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__349096_SHARP_) {
            var and__3546__auto____349143 = p1__349096_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____349143)) {
              var and__3546__auto____349144 = p1__349096_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____349144)) {
                return p1__349096_SHARP_.call(null, z)
              }else {
                return and__3546__auto____349144
              }
            }else {
              return and__3546__auto____349143
            }
          }, ps__349141)
        };
        var epn__349180 = function() {
          var G__349182__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____349145 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____349145)) {
                return cljs.core.every_QMARK_.call(null, function(p1__349097_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__349097_SHARP_, args)
                }, ps__349141)
              }else {
                return and__3546__auto____349145
              }
            }())
          };
          var G__349182 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__349182__delegate.call(this, x, y, z, args)
          };
          G__349182.cljs$lang$maxFixedArity = 3;
          G__349182.cljs$lang$applyTo = function(arglist__349183) {
            var x = cljs.core.first(arglist__349183);
            var y = cljs.core.first(cljs.core.next(arglist__349183));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349183)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349183)));
            return G__349182__delegate.call(this, x, y, z, args)
          };
          return G__349182
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__349176.call(this);
            case 1:
              return epn__349177.call(this, x);
            case 2:
              return epn__349178.call(this, x, y);
            case 3:
              return epn__349179.call(this, x, y, z);
            default:
              return epn__349180.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__349180.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__349175 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__349175__delegate.call(this, p1, p2, p3, ps)
    };
    G__349175.cljs$lang$maxFixedArity = 3;
    G__349175.cljs$lang$applyTo = function(arglist__349184) {
      var p1 = cljs.core.first(arglist__349184);
      var p2 = cljs.core.first(cljs.core.next(arglist__349184));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349184)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349184)));
      return G__349175__delegate.call(this, p1, p2, p3, ps)
    };
    return G__349175
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__349146.call(this, p1);
      case 2:
        return every_pred__349147.call(this, p1, p2);
      case 3:
        return every_pred__349148.call(this, p1, p2, p3);
      default:
        return every_pred__349149.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__349149.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__349224 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__349229 = function() {
        return null
      };
      var sp1__349230 = function(x) {
        return p.call(null, x)
      };
      var sp1__349231 = function(x, y) {
        var or__3548__auto____349186 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349186)) {
          return or__3548__auto____349186
        }else {
          return p.call(null, y)
        }
      };
      var sp1__349232 = function(x, y, z) {
        var or__3548__auto____349187 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349187)) {
          return or__3548__auto____349187
        }else {
          var or__3548__auto____349188 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____349188)) {
            return or__3548__auto____349188
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__349233 = function() {
        var G__349235__delegate = function(x, y, z, args) {
          var or__3548__auto____349189 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____349189)) {
            return or__3548__auto____349189
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__349235 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349235__delegate.call(this, x, y, z, args)
        };
        G__349235.cljs$lang$maxFixedArity = 3;
        G__349235.cljs$lang$applyTo = function(arglist__349236) {
          var x = cljs.core.first(arglist__349236);
          var y = cljs.core.first(cljs.core.next(arglist__349236));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349236)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349236)));
          return G__349235__delegate.call(this, x, y, z, args)
        };
        return G__349235
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__349229.call(this);
          case 1:
            return sp1__349230.call(this, x);
          case 2:
            return sp1__349231.call(this, x, y);
          case 3:
            return sp1__349232.call(this, x, y, z);
          default:
            return sp1__349233.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__349233.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__349225 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__349237 = function() {
        return null
      };
      var sp2__349238 = function(x) {
        var or__3548__auto____349190 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349190)) {
          return or__3548__auto____349190
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__349239 = function(x, y) {
        var or__3548__auto____349191 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349191)) {
          return or__3548__auto____349191
        }else {
          var or__3548__auto____349192 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____349192)) {
            return or__3548__auto____349192
          }else {
            var or__3548__auto____349193 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____349193)) {
              return or__3548__auto____349193
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__349240 = function(x, y, z) {
        var or__3548__auto____349194 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349194)) {
          return or__3548__auto____349194
        }else {
          var or__3548__auto____349195 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____349195)) {
            return or__3548__auto____349195
          }else {
            var or__3548__auto____349196 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____349196)) {
              return or__3548__auto____349196
            }else {
              var or__3548__auto____349197 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____349197)) {
                return or__3548__auto____349197
              }else {
                var or__3548__auto____349198 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____349198)) {
                  return or__3548__auto____349198
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__349241 = function() {
        var G__349243__delegate = function(x, y, z, args) {
          var or__3548__auto____349199 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____349199)) {
            return or__3548__auto____349199
          }else {
            return cljs.core.some.call(null, function(p1__349102_SHARP_) {
              var or__3548__auto____349200 = p1.call(null, p1__349102_SHARP_);
              if(cljs.core.truth_(or__3548__auto____349200)) {
                return or__3548__auto____349200
              }else {
                return p2.call(null, p1__349102_SHARP_)
              }
            }, args)
          }
        };
        var G__349243 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349243__delegate.call(this, x, y, z, args)
        };
        G__349243.cljs$lang$maxFixedArity = 3;
        G__349243.cljs$lang$applyTo = function(arglist__349244) {
          var x = cljs.core.first(arglist__349244);
          var y = cljs.core.first(cljs.core.next(arglist__349244));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349244)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349244)));
          return G__349243__delegate.call(this, x, y, z, args)
        };
        return G__349243
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__349237.call(this);
          case 1:
            return sp2__349238.call(this, x);
          case 2:
            return sp2__349239.call(this, x, y);
          case 3:
            return sp2__349240.call(this, x, y, z);
          default:
            return sp2__349241.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__349241.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__349226 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__349245 = function() {
        return null
      };
      var sp3__349246 = function(x) {
        var or__3548__auto____349201 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349201)) {
          return or__3548__auto____349201
        }else {
          var or__3548__auto____349202 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____349202)) {
            return or__3548__auto____349202
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__349247 = function(x, y) {
        var or__3548__auto____349203 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349203)) {
          return or__3548__auto____349203
        }else {
          var or__3548__auto____349204 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____349204)) {
            return or__3548__auto____349204
          }else {
            var or__3548__auto____349205 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____349205)) {
              return or__3548__auto____349205
            }else {
              var or__3548__auto____349206 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____349206)) {
                return or__3548__auto____349206
              }else {
                var or__3548__auto____349207 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____349207)) {
                  return or__3548__auto____349207
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__349248 = function(x, y, z) {
        var or__3548__auto____349208 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____349208)) {
          return or__3548__auto____349208
        }else {
          var or__3548__auto____349209 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____349209)) {
            return or__3548__auto____349209
          }else {
            var or__3548__auto____349210 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____349210)) {
              return or__3548__auto____349210
            }else {
              var or__3548__auto____349211 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____349211)) {
                return or__3548__auto____349211
              }else {
                var or__3548__auto____349212 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____349212)) {
                  return or__3548__auto____349212
                }else {
                  var or__3548__auto____349213 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____349213)) {
                    return or__3548__auto____349213
                  }else {
                    var or__3548__auto____349214 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____349214)) {
                      return or__3548__auto____349214
                    }else {
                      var or__3548__auto____349215 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____349215)) {
                        return or__3548__auto____349215
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
      var sp3__349249 = function() {
        var G__349251__delegate = function(x, y, z, args) {
          var or__3548__auto____349216 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____349216)) {
            return or__3548__auto____349216
          }else {
            return cljs.core.some.call(null, function(p1__349103_SHARP_) {
              var or__3548__auto____349217 = p1.call(null, p1__349103_SHARP_);
              if(cljs.core.truth_(or__3548__auto____349217)) {
                return or__3548__auto____349217
              }else {
                var or__3548__auto____349218 = p2.call(null, p1__349103_SHARP_);
                if(cljs.core.truth_(or__3548__auto____349218)) {
                  return or__3548__auto____349218
                }else {
                  return p3.call(null, p1__349103_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__349251 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349251__delegate.call(this, x, y, z, args)
        };
        G__349251.cljs$lang$maxFixedArity = 3;
        G__349251.cljs$lang$applyTo = function(arglist__349252) {
          var x = cljs.core.first(arglist__349252);
          var y = cljs.core.first(cljs.core.next(arglist__349252));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349252)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349252)));
          return G__349251__delegate.call(this, x, y, z, args)
        };
        return G__349251
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__349245.call(this);
          case 1:
            return sp3__349246.call(this, x);
          case 2:
            return sp3__349247.call(this, x, y);
          case 3:
            return sp3__349248.call(this, x, y, z);
          default:
            return sp3__349249.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__349249.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__349227 = function() {
    var G__349253__delegate = function(p1, p2, p3, ps) {
      var ps__349219 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__349254 = function() {
          return null
        };
        var spn__349255 = function(x) {
          return cljs.core.some.call(null, function(p1__349104_SHARP_) {
            return p1__349104_SHARP_.call(null, x)
          }, ps__349219)
        };
        var spn__349256 = function(x, y) {
          return cljs.core.some.call(null, function(p1__349105_SHARP_) {
            var or__3548__auto____349220 = p1__349105_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____349220)) {
              return or__3548__auto____349220
            }else {
              return p1__349105_SHARP_.call(null, y)
            }
          }, ps__349219)
        };
        var spn__349257 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__349106_SHARP_) {
            var or__3548__auto____349221 = p1__349106_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____349221)) {
              return or__3548__auto____349221
            }else {
              var or__3548__auto____349222 = p1__349106_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____349222)) {
                return or__3548__auto____349222
              }else {
                return p1__349106_SHARP_.call(null, z)
              }
            }
          }, ps__349219)
        };
        var spn__349258 = function() {
          var G__349260__delegate = function(x, y, z, args) {
            var or__3548__auto____349223 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____349223)) {
              return or__3548__auto____349223
            }else {
              return cljs.core.some.call(null, function(p1__349107_SHARP_) {
                return cljs.core.some.call(null, p1__349107_SHARP_, args)
              }, ps__349219)
            }
          };
          var G__349260 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__349260__delegate.call(this, x, y, z, args)
          };
          G__349260.cljs$lang$maxFixedArity = 3;
          G__349260.cljs$lang$applyTo = function(arglist__349261) {
            var x = cljs.core.first(arglist__349261);
            var y = cljs.core.first(cljs.core.next(arglist__349261));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349261)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349261)));
            return G__349260__delegate.call(this, x, y, z, args)
          };
          return G__349260
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__349254.call(this);
            case 1:
              return spn__349255.call(this, x);
            case 2:
              return spn__349256.call(this, x, y);
            case 3:
              return spn__349257.call(this, x, y, z);
            default:
              return spn__349258.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__349258.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__349253 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__349253__delegate.call(this, p1, p2, p3, ps)
    };
    G__349253.cljs$lang$maxFixedArity = 3;
    G__349253.cljs$lang$applyTo = function(arglist__349262) {
      var p1 = cljs.core.first(arglist__349262);
      var p2 = cljs.core.first(cljs.core.next(arglist__349262));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349262)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349262)));
      return G__349253__delegate.call(this, p1, p2, p3, ps)
    };
    return G__349253
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__349224.call(this, p1);
      case 2:
        return some_fn__349225.call(this, p1, p2);
      case 3:
        return some_fn__349226.call(this, p1, p2, p3);
      default:
        return some_fn__349227.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__349227.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__349275 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349263 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349263)) {
        var s__349264 = temp__3698__auto____349263;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__349264)), map.call(null, f, cljs.core.rest.call(null, s__349264)))
      }else {
        return null
      }
    })
  };
  var map__349276 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__349265 = cljs.core.seq.call(null, c1);
      var s2__349266 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____349267 = s1__349265;
        if(cljs.core.truth_(and__3546__auto____349267)) {
          return s2__349266
        }else {
          return and__3546__auto____349267
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__349265), cljs.core.first.call(null, s2__349266)), map.call(null, f, cljs.core.rest.call(null, s1__349265), cljs.core.rest.call(null, s2__349266)))
      }else {
        return null
      }
    })
  };
  var map__349277 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__349268 = cljs.core.seq.call(null, c1);
      var s2__349269 = cljs.core.seq.call(null, c2);
      var s3__349270 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____349271 = s1__349268;
        if(cljs.core.truth_(and__3546__auto____349271)) {
          var and__3546__auto____349272 = s2__349269;
          if(cljs.core.truth_(and__3546__auto____349272)) {
            return s3__349270
          }else {
            return and__3546__auto____349272
          }
        }else {
          return and__3546__auto____349271
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__349268), cljs.core.first.call(null, s2__349269), cljs.core.first.call(null, s3__349270)), map.call(null, f, cljs.core.rest.call(null, s1__349268), cljs.core.rest.call(null, s2__349269), cljs.core.rest.call(null, s3__349270)))
      }else {
        return null
      }
    })
  };
  var map__349278 = function() {
    var G__349280__delegate = function(f, c1, c2, c3, colls) {
      var step__349274 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__349273 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__349273))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__349273), step.call(null, map.call(null, cljs.core.rest, ss__349273)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__349185_SHARP_) {
        return cljs.core.apply.call(null, f, p1__349185_SHARP_)
      }, step__349274.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__349280 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__349280__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__349280.cljs$lang$maxFixedArity = 4;
    G__349280.cljs$lang$applyTo = function(arglist__349281) {
      var f = cljs.core.first(arglist__349281);
      var c1 = cljs.core.first(cljs.core.next(arglist__349281));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349281)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__349281))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__349281))));
      return G__349280__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__349280
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__349275.call(this, f, c1);
      case 3:
        return map__349276.call(this, f, c1, c2);
      case 4:
        return map__349277.call(this, f, c1, c2, c3);
      default:
        return map__349278.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__349278.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____349282 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349282)) {
        var s__349283 = temp__3698__auto____349282;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__349283), take.call(null, n - 1, cljs.core.rest.call(null, s__349283)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__349286 = function(n, coll) {
    while(true) {
      var s__349284 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____349285 = n > 0;
        if(cljs.core.truth_(and__3546__auto____349285)) {
          return s__349284
        }else {
          return and__3546__auto____349285
        }
      }())) {
        var G__349287 = n - 1;
        var G__349288 = cljs.core.rest.call(null, s__349284);
        n = G__349287;
        coll = G__349288;
        continue
      }else {
        return s__349284
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__349286.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__349289 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__349290 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__349289.call(this, n);
      case 2:
        return drop_last__349290.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__349292 = cljs.core.seq.call(null, coll);
  var lead__349293 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__349293)) {
      var G__349294 = cljs.core.next.call(null, s__349292);
      var G__349295 = cljs.core.next.call(null, lead__349293);
      s__349292 = G__349294;
      lead__349293 = G__349295;
      continue
    }else {
      return s__349292
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__349298 = function(pred, coll) {
    while(true) {
      var s__349296 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____349297 = s__349296;
        if(cljs.core.truth_(and__3546__auto____349297)) {
          return pred.call(null, cljs.core.first.call(null, s__349296))
        }else {
          return and__3546__auto____349297
        }
      }())) {
        var G__349299 = pred;
        var G__349300 = cljs.core.rest.call(null, s__349296);
        pred = G__349299;
        coll = G__349300;
        continue
      }else {
        return s__349296
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__349298.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____349301 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____349301)) {
      var s__349302 = temp__3698__auto____349301;
      return cljs.core.concat.call(null, s__349302, cycle.call(null, s__349302))
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
  var repeat__349303 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__349304 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__349303.call(this, n);
      case 2:
        return repeat__349304.call(this, n, x)
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
  var repeatedly__349306 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__349307 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__349306.call(this, n);
      case 2:
        return repeatedly__349307.call(this, n, f)
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
  var interleave__349313 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__349309 = cljs.core.seq.call(null, c1);
      var s2__349310 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____349311 = s1__349309;
        if(cljs.core.truth_(and__3546__auto____349311)) {
          return s2__349310
        }else {
          return and__3546__auto____349311
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__349309), cljs.core.cons.call(null, cljs.core.first.call(null, s2__349310), interleave.call(null, cljs.core.rest.call(null, s1__349309), cljs.core.rest.call(null, s2__349310))))
      }else {
        return null
      }
    })
  };
  var interleave__349314 = function() {
    var G__349316__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__349312 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__349312))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__349312), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__349312)))
        }else {
          return null
        }
      })
    };
    var G__349316 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__349316__delegate.call(this, c1, c2, colls)
    };
    G__349316.cljs$lang$maxFixedArity = 2;
    G__349316.cljs$lang$applyTo = function(arglist__349317) {
      var c1 = cljs.core.first(arglist__349317);
      var c2 = cljs.core.first(cljs.core.next(arglist__349317));
      var colls = cljs.core.rest(cljs.core.next(arglist__349317));
      return G__349316__delegate.call(this, c1, c2, colls)
    };
    return G__349316
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__349313.call(this, c1, c2);
      default:
        return interleave__349314.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__349314.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__349320 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____349318 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____349318)) {
        var coll__349319 = temp__3695__auto____349318;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__349319), cat.call(null, cljs.core.rest.call(null, coll__349319), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__349320.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__349321 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__349322 = function() {
    var G__349324__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__349324 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__349324__delegate.call(this, f, coll, colls)
    };
    G__349324.cljs$lang$maxFixedArity = 2;
    G__349324.cljs$lang$applyTo = function(arglist__349325) {
      var f = cljs.core.first(arglist__349325);
      var coll = cljs.core.first(cljs.core.next(arglist__349325));
      var colls = cljs.core.rest(cljs.core.next(arglist__349325));
      return G__349324__delegate.call(this, f, coll, colls)
    };
    return G__349324
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__349321.call(this, f, coll);
      default:
        return mapcat__349322.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__349322.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____349326 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____349326)) {
      var s__349327 = temp__3698__auto____349326;
      var f__349328 = cljs.core.first.call(null, s__349327);
      var r__349329 = cljs.core.rest.call(null, s__349327);
      if(cljs.core.truth_(pred.call(null, f__349328))) {
        return cljs.core.cons.call(null, f__349328, filter.call(null, pred, r__349329))
      }else {
        return filter.call(null, pred, r__349329)
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
  var walk__349331 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__349331.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__349330_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__349330_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__349338 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__349339 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349332 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349332)) {
        var s__349333 = temp__3698__auto____349332;
        var p__349334 = cljs.core.take.call(null, n, s__349333);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__349334)))) {
          return cljs.core.cons.call(null, p__349334, partition.call(null, n, step, cljs.core.drop.call(null, step, s__349333)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__349340 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349335 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349335)) {
        var s__349336 = temp__3698__auto____349335;
        var p__349337 = cljs.core.take.call(null, n, s__349336);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__349337)))) {
          return cljs.core.cons.call(null, p__349337, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__349336)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__349337, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__349338.call(this, n, step);
      case 3:
        return partition__349339.call(this, n, step, pad);
      case 4:
        return partition__349340.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__349346 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__349347 = function(m, ks, not_found) {
    var sentinel__349342 = cljs.core.lookup_sentinel;
    var m__349343 = m;
    var ks__349344 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__349344)) {
        var m__349345 = cljs.core.get.call(null, m__349343, cljs.core.first.call(null, ks__349344), sentinel__349342);
        if(cljs.core.truth_(sentinel__349342 === m__349345)) {
          return not_found
        }else {
          var G__349349 = sentinel__349342;
          var G__349350 = m__349345;
          var G__349351 = cljs.core.next.call(null, ks__349344);
          sentinel__349342 = G__349349;
          m__349343 = G__349350;
          ks__349344 = G__349351;
          continue
        }
      }else {
        return m__349343
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__349346.call(this, m, ks);
      case 3:
        return get_in__349347.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__349352, v) {
  var vec__349353__349354 = p__349352;
  var k__349355 = cljs.core.nth.call(null, vec__349353__349354, 0, null);
  var ks__349356 = cljs.core.nthnext.call(null, vec__349353__349354, 1);
  if(cljs.core.truth_(ks__349356)) {
    return cljs.core.assoc.call(null, m, k__349355, assoc_in.call(null, cljs.core.get.call(null, m, k__349355), ks__349356, v))
  }else {
    return cljs.core.assoc.call(null, m, k__349355, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__349357, f, args) {
    var vec__349358__349359 = p__349357;
    var k__349360 = cljs.core.nth.call(null, vec__349358__349359, 0, null);
    var ks__349361 = cljs.core.nthnext.call(null, vec__349358__349359, 1);
    if(cljs.core.truth_(ks__349361)) {
      return cljs.core.assoc.call(null, m, k__349360, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__349360), ks__349361, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__349360, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__349360), args))
    }
  };
  var update_in = function(m, p__349357, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__349357, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__349362) {
    var m = cljs.core.first(arglist__349362);
    var p__349357 = cljs.core.first(cljs.core.next(arglist__349362));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349362)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349362)));
    return update_in__delegate.call(this, m, p__349357, f, args)
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
  var this__349363 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__349396 = null;
  var G__349396__349397 = function(coll, k) {
    var this__349364 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__349396__349398 = function(coll, k, not_found) {
    var this__349365 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__349396 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349396__349397.call(this, coll, k);
      case 3:
        return G__349396__349398.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349396
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__349366 = this;
  var new_array__349367 = cljs.core.aclone.call(null, this__349366.array);
  new_array__349367[k] = v;
  return new cljs.core.Vector(this__349366.meta, new_array__349367)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__349400 = null;
  var G__349400__349401 = function(tsym349368, k) {
    var this__349370 = this;
    var tsym349368__349371 = this;
    var coll__349372 = tsym349368__349371;
    return cljs.core._lookup.call(null, coll__349372, k)
  };
  var G__349400__349402 = function(tsym349369, k, not_found) {
    var this__349373 = this;
    var tsym349369__349374 = this;
    var coll__349375 = tsym349369__349374;
    return cljs.core._lookup.call(null, coll__349375, k, not_found)
  };
  G__349400 = function(tsym349369, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349400__349401.call(this, tsym349369, k);
      case 3:
        return G__349400__349402.call(this, tsym349369, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349400
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__349376 = this;
  var new_array__349377 = cljs.core.aclone.call(null, this__349376.array);
  new_array__349377.push(o);
  return new cljs.core.Vector(this__349376.meta, new_array__349377)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__349404 = null;
  var G__349404__349405 = function(v, f) {
    var this__349378 = this;
    return cljs.core.ci_reduce.call(null, this__349378.array, f)
  };
  var G__349404__349406 = function(v, f, start) {
    var this__349379 = this;
    return cljs.core.ci_reduce.call(null, this__349379.array, f, start)
  };
  G__349404 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__349404__349405.call(this, v, f);
      case 3:
        return G__349404__349406.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349404
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349380 = this;
  if(cljs.core.truth_(this__349380.array.length > 0)) {
    var vector_seq__349381 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__349380.array.length)) {
          return cljs.core.cons.call(null, this__349380.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__349381.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349382 = this;
  return this__349382.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__349383 = this;
  var count__349384 = this__349383.array.length;
  if(cljs.core.truth_(count__349384 > 0)) {
    return this__349383.array[count__349384 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__349385 = this;
  if(cljs.core.truth_(this__349385.array.length > 0)) {
    var new_array__349386 = cljs.core.aclone.call(null, this__349385.array);
    new_array__349386.pop();
    return new cljs.core.Vector(this__349385.meta, new_array__349386)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__349387 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349388 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349389 = this;
  return new cljs.core.Vector(meta, this__349389.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349390 = this;
  return this__349390.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__349408 = null;
  var G__349408__349409 = function(coll, n) {
    var this__349391 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____349392 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____349392)) {
        return n < this__349391.array.length
      }else {
        return and__3546__auto____349392
      }
    }())) {
      return this__349391.array[n]
    }else {
      return null
    }
  };
  var G__349408__349410 = function(coll, n, not_found) {
    var this__349393 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____349394 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____349394)) {
        return n < this__349393.array.length
      }else {
        return and__3546__auto____349394
      }
    }())) {
      return this__349393.array[n]
    }else {
      return not_found
    }
  };
  G__349408 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349408__349409.call(this, coll, n);
      case 3:
        return G__349408__349410.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349408
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349395 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__349395.meta)
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
  vector.cljs$lang$applyTo = function(arglist__349412) {
    var args = cljs.core.seq(arglist__349412);
    return vector__delegate.call(this, args)
  };
  return vector
}();
cljs.core.tail_off = function tail_off(pv) {
  var cnt__349413 = pv.cnt;
  if(cljs.core.truth_(cnt__349413 < 32)) {
    return 0
  }else {
    return cnt__349413 - 1 >> 5 << 5
  }
};
cljs.core.new_path = function new_path(level, node) {
  var ll__349414 = level;
  var ret__349415 = node;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, ll__349414))) {
      return ret__349415
    }else {
      var embed__349416 = ret__349415;
      var r__349417 = cljs.core.aclone.call(null, cljs.core.PersistentVector.EMPTY_NODE);
      var ___349418 = r__349417[0] = embed__349416;
      var G__349419 = ll__349414 - 5;
      var G__349420 = r__349417;
      ll__349414 = G__349419;
      ret__349415 = G__349420;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__349421 = cljs.core.aclone.call(null, parent);
  var subidx__349422 = pv.cnt - 1 >> level & 31;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 5, level))) {
    ret__349421[subidx__349422] = tailnode;
    return ret__349421
  }else {
    var temp__3695__auto____349423 = parent[subidx__349422];
    if(cljs.core.truth_(temp__3695__auto____349423)) {
      var child__349424 = temp__3695__auto____349423;
      var node_to_insert__349425 = push_tail.call(null, pv, level - 5, child__349424, tailnode);
      var ___349426 = ret__349421[subidx__349422] = node_to_insert__349425;
      return ret__349421
    }else {
      var node_to_insert__349427 = cljs.core.new_path.call(null, level - 5, tailnode);
      var ___349428 = ret__349421[subidx__349422] = node_to_insert__349427;
      return ret__349421
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____349429 = 0 <= i;
    if(cljs.core.truth_(and__3546__auto____349429)) {
      return i < pv.cnt
    }else {
      return and__3546__auto____349429
    }
  }())) {
    if(cljs.core.truth_(i >= cljs.core.tail_off.call(null, pv))) {
      return pv.tail
    }else {
      var node__349430 = pv.root;
      var level__349431 = pv.shift;
      while(true) {
        if(cljs.core.truth_(level__349431 > 0)) {
          var G__349432 = node__349430[i >> level__349431 & 31];
          var G__349433 = level__349431 - 5;
          node__349430 = G__349432;
          level__349431 = G__349433;
          continue
        }else {
          return node__349430
        }
        break
      }
    }
  }else {
    throw new Error(cljs.core.str.call(null, "No item ", i, " in vector of length ", pv.cnt));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__349434 = cljs.core.aclone.call(null, node);
  if(cljs.core.truth_(level === 0)) {
    ret__349434[i & 31] = val;
    return ret__349434
  }else {
    var subidx__349435 = i >> level & 31;
    var ___349436 = ret__349434[subidx__349435] = do_assoc.call(null, pv, level - 5, node[subidx__349435], i, val);
    return ret__349434
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__349437 = pv.cnt - 2 >> level & 31;
  if(cljs.core.truth_(level > 5)) {
    var new_child__349438 = pop_tail.call(null, pv, level - 5, node[subidx__349437]);
    if(cljs.core.truth_(function() {
      var and__3546__auto____349439 = new_child__349438 === null;
      if(cljs.core.truth_(and__3546__auto____349439)) {
        return subidx__349437 === 0
      }else {
        return and__3546__auto____349439
      }
    }())) {
      return null
    }else {
      var ret__349440 = cljs.core.aclone.call(null, node);
      var ___349441 = ret__349440[subidx__349437] = new_child__349438;
      return ret__349440
    }
  }else {
    if(cljs.core.truth_(subidx__349437 === 0)) {
      return null
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        var ret__349442 = cljs.core.aclone.call(null, node);
        var ___349443 = ret__349442[subidx__349437] = null;
        return ret__349442
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
  var this__349444 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__349484 = null;
  var G__349484__349485 = function(coll, k) {
    var this__349445 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__349484__349486 = function(coll, k, not_found) {
    var this__349446 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__349484 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349484__349485.call(this, coll, k);
      case 3:
        return G__349484__349486.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349484
}();
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__349447 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____349448 = 0 <= k;
    if(cljs.core.truth_(and__3546__auto____349448)) {
      return k < this__349447.cnt
    }else {
      return and__3546__auto____349448
    }
  }())) {
    if(cljs.core.truth_(cljs.core.tail_off.call(null, coll) <= k)) {
      var new_tail__349449 = cljs.core.aclone.call(null, this__349447.tail);
      new_tail__349449[k & 31] = v;
      return new cljs.core.PersistentVector(this__349447.meta, this__349447.cnt, this__349447.shift, this__349447.root, new_tail__349449)
    }else {
      return new cljs.core.PersistentVector(this__349447.meta, this__349447.cnt, this__349447.shift, cljs.core.do_assoc.call(null, coll, this__349447.shift, this__349447.root, k, v), this__349447.tail)
    }
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, k, this__349447.cnt))) {
      return cljs.core._conj.call(null, coll, v)
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw new Error(cljs.core.str.call(null, "Index ", k, " out of bounds  [0,", this__349447.cnt, "]"));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IFn$ = true;
cljs.core.PersistentVector.prototype.call = function() {
  var G__349488 = null;
  var G__349488__349489 = function(tsym349450, k) {
    var this__349452 = this;
    var tsym349450__349453 = this;
    var coll__349454 = tsym349450__349453;
    return cljs.core._lookup.call(null, coll__349454, k)
  };
  var G__349488__349490 = function(tsym349451, k, not_found) {
    var this__349455 = this;
    var tsym349451__349456 = this;
    var coll__349457 = tsym349451__349456;
    return cljs.core._lookup.call(null, coll__349457, k, not_found)
  };
  G__349488 = function(tsym349451, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349488__349489.call(this, tsym349451, k);
      case 3:
        return G__349488__349490.call(this, tsym349451, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349488
}();
cljs.core.PersistentVector.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__349458 = this;
  if(cljs.core.truth_(this__349458.cnt - cljs.core.tail_off.call(null, coll) < 32)) {
    var new_tail__349459 = cljs.core.aclone.call(null, this__349458.tail);
    new_tail__349459.push(o);
    return new cljs.core.PersistentVector(this__349458.meta, this__349458.cnt + 1, this__349458.shift, this__349458.root, new_tail__349459)
  }else {
    var root_overflow_QMARK___349460 = this__349458.cnt >> 5 > 1 << this__349458.shift;
    var new_shift__349461 = cljs.core.truth_(root_overflow_QMARK___349460) ? this__349458.shift + 5 : this__349458.shift;
    var new_root__349463 = cljs.core.truth_(root_overflow_QMARK___349460) ? function() {
      var n_r__349462 = cljs.core.aclone.call(null, cljs.core.PersistentVector.EMPTY_NODE);
      n_r__349462[0] = this__349458.root;
      n_r__349462[1] = cljs.core.new_path.call(null, this__349458.shift, this__349458.tail);
      return n_r__349462
    }() : cljs.core.push_tail.call(null, coll, this__349458.shift, this__349458.root, this__349458.tail);
    return new cljs.core.PersistentVector(this__349458.meta, this__349458.cnt + 1, new_shift__349461, new_root__349463, [o])
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__349492 = null;
  var G__349492__349493 = function(v, f) {
    var this__349464 = this;
    return cljs.core.ci_reduce.call(null, v, f)
  };
  var G__349492__349494 = function(v, f, start) {
    var this__349465 = this;
    return cljs.core.ci_reduce.call(null, v, f, start)
  };
  G__349492 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__349492__349493.call(this, v, f);
      case 3:
        return G__349492__349494.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349492
}();
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349466 = this;
  if(cljs.core.truth_(this__349466.cnt > 0)) {
    var vector_seq__349467 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__349466.cnt)) {
          return cljs.core.cons.call(null, cljs.core._nth.call(null, coll, i), vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__349467.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349468 = this;
  return this__349468.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__349469 = this;
  if(cljs.core.truth_(this__349469.cnt > 0)) {
    return cljs.core._nth.call(null, coll, this__349469.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__349470 = this;
  if(cljs.core.truth_(this__349470.cnt === 0)) {
    throw new Error("Can't pop empty vector");
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, this__349470.cnt))) {
      return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__349470.meta)
    }else {
      if(cljs.core.truth_(1 < this__349470.cnt - cljs.core.tail_off.call(null, coll))) {
        return new cljs.core.PersistentVector(this__349470.meta, this__349470.cnt - 1, this__349470.shift, this__349470.root, cljs.core.aclone.call(null, this__349470.tail))
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          var new_tail__349471 = cljs.core.array_for.call(null, coll, this__349470.cnt - 2);
          var nr__349472 = cljs.core.pop_tail.call(null, this__349470.shift, this__349470.root);
          var new_root__349473 = cljs.core.truth_(nr__349472 === null) ? cljs.core.PersistentVector.EMPTY_NODE : nr__349472;
          var cnt_1__349474 = this__349470.cnt - 1;
          if(cljs.core.truth_(function() {
            var and__3546__auto____349475 = 5 < this__349470.shift;
            if(cljs.core.truth_(and__3546__auto____349475)) {
              return new_root__349473[1] === null
            }else {
              return and__3546__auto____349475
            }
          }())) {
            return new cljs.core.PersistentVector(this__349470.meta, cnt_1__349474, this__349470.shift - 5, new_root__349473[0], new_tail__349471)
          }else {
            return new cljs.core.PersistentVector(this__349470.meta, cnt_1__349474, this__349470.shift, new_root__349473, new_tail__349471)
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
  var this__349476 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349477 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349478 = this;
  return new cljs.core.PersistentVector(meta, this__349478.cnt, this__349478.shift, this__349478.root, this__349478.tail)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349479 = this;
  return this__349479.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__349496 = null;
  var G__349496__349497 = function(coll, n) {
    var this__349480 = this;
    return cljs.core.array_for.call(null, coll, n)[n & 31]
  };
  var G__349496__349498 = function(coll, n, not_found) {
    var this__349481 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____349482 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____349482)) {
        return n < this__349481.cnt
      }else {
        return and__3546__auto____349482
      }
    }())) {
      return cljs.core._nth.call(null, coll, n)
    }else {
      return not_found
    }
  };
  G__349496 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349496__349497.call(this, coll, n);
      case 3:
        return G__349496__349498.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349496
}();
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349483 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__349483.meta)
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
  var this__349500 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__349528 = null;
  var G__349528__349529 = function(coll, k) {
    var this__349501 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__349528__349530 = function(coll, k, not_found) {
    var this__349502 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__349528 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349528__349529.call(this, coll, k);
      case 3:
        return G__349528__349530.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349528
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__349503 = this;
  var v_pos__349504 = this__349503.start + key;
  return new cljs.core.Subvec(this__349503.meta, cljs.core._assoc.call(null, this__349503.v, v_pos__349504, val), this__349503.start, this__349503.end > v_pos__349504 + 1 ? this__349503.end : v_pos__349504 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__349532 = null;
  var G__349532__349533 = function(tsym349505, k) {
    var this__349507 = this;
    var tsym349505__349508 = this;
    var coll__349509 = tsym349505__349508;
    return cljs.core._lookup.call(null, coll__349509, k)
  };
  var G__349532__349534 = function(tsym349506, k, not_found) {
    var this__349510 = this;
    var tsym349506__349511 = this;
    var coll__349512 = tsym349506__349511;
    return cljs.core._lookup.call(null, coll__349512, k, not_found)
  };
  G__349532 = function(tsym349506, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349532__349533.call(this, tsym349506, k);
      case 3:
        return G__349532__349534.call(this, tsym349506, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349532
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__349513 = this;
  return new cljs.core.Subvec(this__349513.meta, cljs.core._assoc_n.call(null, this__349513.v, this__349513.end, o), this__349513.start, this__349513.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__349536 = null;
  var G__349536__349537 = function(coll, f) {
    var this__349514 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__349536__349538 = function(coll, f, start) {
    var this__349515 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__349536 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__349536__349537.call(this, coll, f);
      case 3:
        return G__349536__349538.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349536
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349516 = this;
  var subvec_seq__349517 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__349516.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__349516.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__349517.call(null, this__349516.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349518 = this;
  return this__349518.end - this__349518.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__349519 = this;
  return cljs.core._nth.call(null, this__349519.v, this__349519.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__349520 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__349520.start, this__349520.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__349520.meta, this__349520.v, this__349520.start, this__349520.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__349521 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349522 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349523 = this;
  return new cljs.core.Subvec(meta, this__349523.v, this__349523.start, this__349523.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349524 = this;
  return this__349524.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__349540 = null;
  var G__349540__349541 = function(coll, n) {
    var this__349525 = this;
    return cljs.core._nth.call(null, this__349525.v, this__349525.start + n)
  };
  var G__349540__349542 = function(coll, n, not_found) {
    var this__349526 = this;
    return cljs.core._nth.call(null, this__349526.v, this__349526.start + n, not_found)
  };
  G__349540 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349540__349541.call(this, coll, n);
      case 3:
        return G__349540__349542.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349540
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349527 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__349527.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__349544 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__349545 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__349544.call(this, v, start);
      case 3:
        return subvec__349545.call(this, v, start, end)
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
  var this__349547 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__349548 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349549 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349550 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__349550.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__349551 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__349552 = this;
  return cljs.core._first.call(null, this__349552.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__349553 = this;
  var temp__3695__auto____349554 = cljs.core.next.call(null, this__349553.front);
  if(cljs.core.truth_(temp__3695__auto____349554)) {
    var f1__349555 = temp__3695__auto____349554;
    return new cljs.core.PersistentQueueSeq(this__349553.meta, f1__349555, this__349553.rear)
  }else {
    if(cljs.core.truth_(this__349553.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__349553.meta, this__349553.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349556 = this;
  return this__349556.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349557 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__349557.front, this__349557.rear)
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
  var this__349558 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__349559 = this;
  if(cljs.core.truth_(this__349559.front)) {
    return new cljs.core.PersistentQueue(this__349559.meta, this__349559.count + 1, this__349559.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____349560 = this__349559.rear;
      if(cljs.core.truth_(or__3548__auto____349560)) {
        return or__3548__auto____349560
      }else {
        return cljs.core.PersistentVector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__349559.meta, this__349559.count + 1, cljs.core.conj.call(null, this__349559.front, o), cljs.core.PersistentVector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349561 = this;
  var rear__349562 = cljs.core.seq.call(null, this__349561.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____349563 = this__349561.front;
    if(cljs.core.truth_(or__3548__auto____349563)) {
      return or__3548__auto____349563
    }else {
      return rear__349562
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__349561.front, cljs.core.seq.call(null, rear__349562))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349564 = this;
  return this__349564.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__349565 = this;
  return cljs.core._first.call(null, this__349565.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__349566 = this;
  if(cljs.core.truth_(this__349566.front)) {
    var temp__3695__auto____349567 = cljs.core.next.call(null, this__349566.front);
    if(cljs.core.truth_(temp__3695__auto____349567)) {
      var f1__349568 = temp__3695__auto____349567;
      return new cljs.core.PersistentQueue(this__349566.meta, this__349566.count - 1, f1__349568, this__349566.rear)
    }else {
      return new cljs.core.PersistentQueue(this__349566.meta, this__349566.count - 1, cljs.core.seq.call(null, this__349566.rear), cljs.core.PersistentVector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__349569 = this;
  return cljs.core.first.call(null, this__349569.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__349570 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349571 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349572 = this;
  return new cljs.core.PersistentQueue(meta, this__349572.count, this__349572.front, this__349572.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349573 = this;
  return this__349573.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349574 = this;
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
  var this__349575 = this;
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
  var len__349576 = array.length;
  var i__349577 = 0;
  while(true) {
    if(cljs.core.truth_(i__349577 < len__349576)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__349577]))) {
        return i__349577
      }else {
        var G__349578 = i__349577 + incr;
        i__349577 = G__349578;
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
  var obj_map_contains_key_QMARK___349580 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___349581 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____349579 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____349579)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____349579
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
        return obj_map_contains_key_QMARK___349580.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___349581.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__349584 = cljs.core.hash.call(null, a);
  var b__349585 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__349584 < b__349585)) {
    return-1
  }else {
    if(cljs.core.truth_(a__349584 > b__349585)) {
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
  var this__349586 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__349613 = null;
  var G__349613__349614 = function(coll, k) {
    var this__349587 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__349613__349615 = function(coll, k, not_found) {
    var this__349588 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__349588.strobj, this__349588.strobj[k], not_found)
  };
  G__349613 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349613__349614.call(this, coll, k);
      case 3:
        return G__349613__349615.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349613
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__349589 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__349590 = goog.object.clone.call(null, this__349589.strobj);
    var overwrite_QMARK___349591 = new_strobj__349590.hasOwnProperty(k);
    new_strobj__349590[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___349591)) {
      return new cljs.core.ObjMap(this__349589.meta, this__349589.keys, new_strobj__349590)
    }else {
      var new_keys__349592 = cljs.core.aclone.call(null, this__349589.keys);
      new_keys__349592.push(k);
      return new cljs.core.ObjMap(this__349589.meta, new_keys__349592, new_strobj__349590)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__349589.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__349593 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__349593.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__349617 = null;
  var G__349617__349618 = function(tsym349594, k) {
    var this__349596 = this;
    var tsym349594__349597 = this;
    var coll__349598 = tsym349594__349597;
    return cljs.core._lookup.call(null, coll__349598, k)
  };
  var G__349617__349619 = function(tsym349595, k, not_found) {
    var this__349599 = this;
    var tsym349595__349600 = this;
    var coll__349601 = tsym349595__349600;
    return cljs.core._lookup.call(null, coll__349601, k, not_found)
  };
  G__349617 = function(tsym349595, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349617__349618.call(this, tsym349595, k);
      case 3:
        return G__349617__349619.call(this, tsym349595, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349617
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__349602 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349603 = this;
  if(cljs.core.truth_(this__349603.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__349583_SHARP_) {
      return cljs.core.vector.call(null, p1__349583_SHARP_, this__349603.strobj[p1__349583_SHARP_])
    }, this__349603.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349604 = this;
  return this__349604.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349605 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349606 = this;
  return new cljs.core.ObjMap(meta, this__349606.keys, this__349606.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349607 = this;
  return this__349607.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349608 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__349608.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__349609 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____349610 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____349610)) {
      return this__349609.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____349610
    }
  }())) {
    var new_keys__349611 = cljs.core.aclone.call(null, this__349609.keys);
    var new_strobj__349612 = goog.object.clone.call(null, this__349609.strobj);
    new_keys__349611.splice(cljs.core.scan_array.call(null, 1, k, new_keys__349611), 1);
    cljs.core.js_delete.call(null, new_strobj__349612, k);
    return new cljs.core.ObjMap(this__349609.meta, new_keys__349611, new_strobj__349612)
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
  var this__349622 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__349660 = null;
  var G__349660__349661 = function(coll, k) {
    var this__349623 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__349660__349662 = function(coll, k, not_found) {
    var this__349624 = this;
    var bucket__349625 = this__349624.hashobj[cljs.core.hash.call(null, k)];
    var i__349626 = cljs.core.truth_(bucket__349625) ? cljs.core.scan_array.call(null, 2, k, bucket__349625) : null;
    if(cljs.core.truth_(i__349626)) {
      return bucket__349625[i__349626 + 1]
    }else {
      return not_found
    }
  };
  G__349660 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349660__349661.call(this, coll, k);
      case 3:
        return G__349660__349662.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349660
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__349627 = this;
  var h__349628 = cljs.core.hash.call(null, k);
  var bucket__349629 = this__349627.hashobj[h__349628];
  if(cljs.core.truth_(bucket__349629)) {
    var new_bucket__349630 = cljs.core.aclone.call(null, bucket__349629);
    var new_hashobj__349631 = goog.object.clone.call(null, this__349627.hashobj);
    new_hashobj__349631[h__349628] = new_bucket__349630;
    var temp__3695__auto____349632 = cljs.core.scan_array.call(null, 2, k, new_bucket__349630);
    if(cljs.core.truth_(temp__3695__auto____349632)) {
      var i__349633 = temp__3695__auto____349632;
      new_bucket__349630[i__349633 + 1] = v;
      return new cljs.core.HashMap(this__349627.meta, this__349627.count, new_hashobj__349631)
    }else {
      new_bucket__349630.push(k, v);
      return new cljs.core.HashMap(this__349627.meta, this__349627.count + 1, new_hashobj__349631)
    }
  }else {
    var new_hashobj__349634 = goog.object.clone.call(null, this__349627.hashobj);
    new_hashobj__349634[h__349628] = [k, v];
    return new cljs.core.HashMap(this__349627.meta, this__349627.count + 1, new_hashobj__349634)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__349635 = this;
  var bucket__349636 = this__349635.hashobj[cljs.core.hash.call(null, k)];
  var i__349637 = cljs.core.truth_(bucket__349636) ? cljs.core.scan_array.call(null, 2, k, bucket__349636) : null;
  if(cljs.core.truth_(i__349637)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__349664 = null;
  var G__349664__349665 = function(tsym349638, k) {
    var this__349640 = this;
    var tsym349638__349641 = this;
    var coll__349642 = tsym349638__349641;
    return cljs.core._lookup.call(null, coll__349642, k)
  };
  var G__349664__349666 = function(tsym349639, k, not_found) {
    var this__349643 = this;
    var tsym349639__349644 = this;
    var coll__349645 = tsym349639__349644;
    return cljs.core._lookup.call(null, coll__349645, k, not_found)
  };
  G__349664 = function(tsym349639, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349664__349665.call(this, tsym349639, k);
      case 3:
        return G__349664__349666.call(this, tsym349639, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349664
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__349646 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349647 = this;
  if(cljs.core.truth_(this__349647.count > 0)) {
    var hashes__349648 = cljs.core.js_keys.call(null, this__349647.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__349621_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__349647.hashobj[p1__349621_SHARP_]))
    }, hashes__349648)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349649 = this;
  return this__349649.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349650 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349651 = this;
  return new cljs.core.HashMap(meta, this__349651.count, this__349651.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349652 = this;
  return this__349652.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349653 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__349653.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__349654 = this;
  var h__349655 = cljs.core.hash.call(null, k);
  var bucket__349656 = this__349654.hashobj[h__349655];
  var i__349657 = cljs.core.truth_(bucket__349656) ? cljs.core.scan_array.call(null, 2, k, bucket__349656) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__349657))) {
    return coll
  }else {
    var new_hashobj__349658 = goog.object.clone.call(null, this__349654.hashobj);
    if(cljs.core.truth_(3 > bucket__349656.length)) {
      cljs.core.js_delete.call(null, new_hashobj__349658, h__349655)
    }else {
      var new_bucket__349659 = cljs.core.aclone.call(null, bucket__349656);
      new_bucket__349659.splice(i__349657, 2);
      new_hashobj__349658[h__349655] = new_bucket__349659
    }
    return new cljs.core.HashMap(this__349654.meta, this__349654.count - 1, new_hashobj__349658)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__349668 = ks.length;
  var i__349669 = 0;
  var out__349670 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__349669 < len__349668)) {
      var G__349671 = i__349669 + 1;
      var G__349672 = cljs.core.assoc.call(null, out__349670, ks[i__349669], vs[i__349669]);
      i__349669 = G__349671;
      out__349670 = G__349672;
      continue
    }else {
      return out__349670
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__349673 = cljs.core.seq.call(null, keyvals);
    var out__349674 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__349673)) {
        var G__349675 = cljs.core.nnext.call(null, in$__349673);
        var G__349676 = cljs.core.assoc.call(null, out__349674, cljs.core.first.call(null, in$__349673), cljs.core.second.call(null, in$__349673));
        in$__349673 = G__349675;
        out__349674 = G__349676;
        continue
      }else {
        return out__349674
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
  hash_map.cljs$lang$applyTo = function(arglist__349677) {
    var keyvals = cljs.core.seq(arglist__349677);
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
      return cljs.core.reduce.call(null, function(p1__349678_SHARP_, p2__349679_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____349680 = p1__349678_SHARP_;
          if(cljs.core.truth_(or__3548__auto____349680)) {
            return or__3548__auto____349680
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__349679_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__349681) {
    var maps = cljs.core.seq(arglist__349681);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__349684 = function(m, e) {
        var k__349682 = cljs.core.first.call(null, e);
        var v__349683 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__349682))) {
          return cljs.core.assoc.call(null, m, k__349682, f.call(null, cljs.core.get.call(null, m, k__349682), v__349683))
        }else {
          return cljs.core.assoc.call(null, m, k__349682, v__349683)
        }
      };
      var merge2__349686 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__349684, function() {
          var or__3548__auto____349685 = m1;
          if(cljs.core.truth_(or__3548__auto____349685)) {
            return or__3548__auto____349685
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__349686, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__349687) {
    var f = cljs.core.first(arglist__349687);
    var maps = cljs.core.rest(arglist__349687);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__349689 = cljs.core.ObjMap.fromObject([], {});
  var keys__349690 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__349690)) {
      var key__349691 = cljs.core.first.call(null, keys__349690);
      var entry__349692 = cljs.core.get.call(null, map, key__349691, "\ufdd0'user/not-found");
      var G__349693 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__349692, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__349689, key__349691, entry__349692) : ret__349689;
      var G__349694 = cljs.core.next.call(null, keys__349690);
      ret__349689 = G__349693;
      keys__349690 = G__349694;
      continue
    }else {
      return ret__349689
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
  var this__349695 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__349716 = null;
  var G__349716__349717 = function(coll, v) {
    var this__349696 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__349716__349718 = function(coll, v, not_found) {
    var this__349697 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__349697.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__349716 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349716__349717.call(this, coll, v);
      case 3:
        return G__349716__349718.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349716
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__349720 = null;
  var G__349720__349721 = function(tsym349698, k) {
    var this__349700 = this;
    var tsym349698__349701 = this;
    var coll__349702 = tsym349698__349701;
    return cljs.core._lookup.call(null, coll__349702, k)
  };
  var G__349720__349722 = function(tsym349699, k, not_found) {
    var this__349703 = this;
    var tsym349699__349704 = this;
    var coll__349705 = tsym349699__349704;
    return cljs.core._lookup.call(null, coll__349705, k, not_found)
  };
  G__349720 = function(tsym349699, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349720__349721.call(this, tsym349699, k);
      case 3:
        return G__349720__349722.call(this, tsym349699, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349720
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__349706 = this;
  return new cljs.core.Set(this__349706.meta, cljs.core.assoc.call(null, this__349706.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__349707 = this;
  return cljs.core.keys.call(null, this__349707.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__349708 = this;
  return new cljs.core.Set(this__349708.meta, cljs.core.dissoc.call(null, this__349708.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__349709 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__349710 = this;
  var and__3546__auto____349711 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____349711)) {
    var and__3546__auto____349712 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____349712)) {
      return cljs.core.every_QMARK_.call(null, function(p1__349688_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__349688_SHARP_)
      }, other)
    }else {
      return and__3546__auto____349712
    }
  }else {
    return and__3546__auto____349711
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__349713 = this;
  return new cljs.core.Set(meta, this__349713.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__349714 = this;
  return this__349714.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__349715 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__349715.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__349725 = cljs.core.seq.call(null, coll);
  var out__349726 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__349725)))) {
      var G__349727 = cljs.core.rest.call(null, in$__349725);
      var G__349728 = cljs.core.conj.call(null, out__349726, cljs.core.first.call(null, in$__349725));
      in$__349725 = G__349727;
      out__349726 = G__349728;
      continue
    }else {
      return out__349726
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__349729 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____349730 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____349730)) {
        var e__349731 = temp__3695__auto____349730;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__349731))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__349729, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__349724_SHARP_) {
      var temp__3695__auto____349732 = cljs.core.find.call(null, smap, p1__349724_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____349732)) {
        var e__349733 = temp__3695__auto____349732;
        return cljs.core.second.call(null, e__349733)
      }else {
        return p1__349724_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__349741 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__349734, seen) {
        while(true) {
          var vec__349735__349736 = p__349734;
          var f__349737 = cljs.core.nth.call(null, vec__349735__349736, 0, null);
          var xs__349738 = vec__349735__349736;
          var temp__3698__auto____349739 = cljs.core.seq.call(null, xs__349738);
          if(cljs.core.truth_(temp__3698__auto____349739)) {
            var s__349740 = temp__3698__auto____349739;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__349737))) {
              var G__349742 = cljs.core.rest.call(null, s__349740);
              var G__349743 = seen;
              p__349734 = G__349742;
              seen = G__349743;
              continue
            }else {
              return cljs.core.cons.call(null, f__349737, step.call(null, cljs.core.rest.call(null, s__349740), cljs.core.conj.call(null, seen, f__349737)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__349741.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__349744 = cljs.core.PersistentVector.fromArray([]);
  var s__349745 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__349745))) {
      var G__349746 = cljs.core.conj.call(null, ret__349744, cljs.core.first.call(null, s__349745));
      var G__349747 = cljs.core.next.call(null, s__349745);
      ret__349744 = G__349746;
      s__349745 = G__349747;
      continue
    }else {
      return cljs.core.seq.call(null, ret__349744)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____349748 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____349748)) {
        return or__3548__auto____349748
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__349749 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__349749 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__349749 + 1)
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
    var or__3548__auto____349750 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____349750)) {
      return or__3548__auto____349750
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__349751 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__349751 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__349751)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__349754 = cljs.core.ObjMap.fromObject([], {});
  var ks__349755 = cljs.core.seq.call(null, keys);
  var vs__349756 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____349757 = ks__349755;
      if(cljs.core.truth_(and__3546__auto____349757)) {
        return vs__349756
      }else {
        return and__3546__auto____349757
      }
    }())) {
      var G__349758 = cljs.core.assoc.call(null, map__349754, cljs.core.first.call(null, ks__349755), cljs.core.first.call(null, vs__349756));
      var G__349759 = cljs.core.next.call(null, ks__349755);
      var G__349760 = cljs.core.next.call(null, vs__349756);
      map__349754 = G__349758;
      ks__349755 = G__349759;
      vs__349756 = G__349760;
      continue
    }else {
      return map__349754
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__349763 = function(k, x) {
    return x
  };
  var max_key__349764 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__349765 = function() {
    var G__349767__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__349752_SHARP_, p2__349753_SHARP_) {
        return max_key.call(null, k, p1__349752_SHARP_, p2__349753_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__349767 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__349767__delegate.call(this, k, x, y, more)
    };
    G__349767.cljs$lang$maxFixedArity = 3;
    G__349767.cljs$lang$applyTo = function(arglist__349768) {
      var k = cljs.core.first(arglist__349768);
      var x = cljs.core.first(cljs.core.next(arglist__349768));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349768)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349768)));
      return G__349767__delegate.call(this, k, x, y, more)
    };
    return G__349767
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__349763.call(this, k, x);
      case 3:
        return max_key__349764.call(this, k, x, y);
      default:
        return max_key__349765.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__349765.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__349769 = function(k, x) {
    return x
  };
  var min_key__349770 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__349771 = function() {
    var G__349773__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__349761_SHARP_, p2__349762_SHARP_) {
        return min_key.call(null, k, p1__349761_SHARP_, p2__349762_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__349773 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__349773__delegate.call(this, k, x, y, more)
    };
    G__349773.cljs$lang$maxFixedArity = 3;
    G__349773.cljs$lang$applyTo = function(arglist__349774) {
      var k = cljs.core.first(arglist__349774);
      var x = cljs.core.first(cljs.core.next(arglist__349774));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349774)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349774)));
      return G__349773__delegate.call(this, k, x, y, more)
    };
    return G__349773
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__349769.call(this, k, x);
      case 3:
        return min_key__349770.call(this, k, x, y);
      default:
        return min_key__349771.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__349771.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__349777 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__349778 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349775 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349775)) {
        var s__349776 = temp__3698__auto____349775;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__349776), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__349776)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__349777.call(this, n, step);
      case 3:
        return partition_all__349778.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____349780 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____349780)) {
      var s__349781 = temp__3698__auto____349780;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__349781)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__349781), take_while.call(null, pred, cljs.core.rest.call(null, s__349781)))
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
  var this__349782 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__349783 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__349799 = null;
  var G__349799__349800 = function(rng, f) {
    var this__349784 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__349799__349801 = function(rng, f, s) {
    var this__349785 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__349799 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__349799__349800.call(this, rng, f);
      case 3:
        return G__349799__349801.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349799
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__349786 = this;
  var comp__349787 = cljs.core.truth_(this__349786.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__349787.call(null, this__349786.start, this__349786.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__349788 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__349788.end - this__349788.start) / this__349788.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__349789 = this;
  return this__349789.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__349790 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__349790.meta, this__349790.start + this__349790.step, this__349790.end, this__349790.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__349791 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__349792 = this;
  return new cljs.core.Range(meta, this__349792.start, this__349792.end, this__349792.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__349793 = this;
  return this__349793.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__349803 = null;
  var G__349803__349804 = function(rng, n) {
    var this__349794 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__349794.start + n * this__349794.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____349795 = this__349794.start > this__349794.end;
        if(cljs.core.truth_(and__3546__auto____349795)) {
          return cljs.core._EQ_.call(null, this__349794.step, 0)
        }else {
          return and__3546__auto____349795
        }
      }())) {
        return this__349794.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__349803__349805 = function(rng, n, not_found) {
    var this__349796 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__349796.start + n * this__349796.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____349797 = this__349796.start > this__349796.end;
        if(cljs.core.truth_(and__3546__auto____349797)) {
          return cljs.core._EQ_.call(null, this__349796.step, 0)
        }else {
          return and__3546__auto____349797
        }
      }())) {
        return this__349796.start
      }else {
        return not_found
      }
    }
  };
  G__349803 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__349803__349804.call(this, rng, n);
      case 3:
        return G__349803__349805.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__349803
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__349798 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__349798.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__349807 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__349808 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__349809 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__349810 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__349807.call(this);
      case 1:
        return range__349808.call(this, start);
      case 2:
        return range__349809.call(this, start, end);
      case 3:
        return range__349810.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____349812 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____349812)) {
      var s__349813 = temp__3698__auto____349812;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__349813), take_nth.call(null, n, cljs.core.drop.call(null, n, s__349813)))
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
    var temp__3698__auto____349815 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____349815)) {
      var s__349816 = temp__3698__auto____349815;
      var fst__349817 = cljs.core.first.call(null, s__349816);
      var fv__349818 = f.call(null, fst__349817);
      var run__349819 = cljs.core.cons.call(null, fst__349817, cljs.core.take_while.call(null, function(p1__349814_SHARP_) {
        return cljs.core._EQ_.call(null, fv__349818, f.call(null, p1__349814_SHARP_))
      }, cljs.core.next.call(null, s__349816)));
      return cljs.core.cons.call(null, run__349819, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__349819), s__349816))))
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
  var reductions__349834 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____349830 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____349830)) {
        var s__349831 = temp__3695__auto____349830;
        return reductions.call(null, f, cljs.core.first.call(null, s__349831), cljs.core.rest.call(null, s__349831))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__349835 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____349832 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____349832)) {
        var s__349833 = temp__3698__auto____349832;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__349833)), cljs.core.rest.call(null, s__349833))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__349834.call(this, f, init);
      case 3:
        return reductions__349835.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__349838 = function(f) {
    return function() {
      var G__349843 = null;
      var G__349843__349844 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__349843__349845 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__349843__349846 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__349843__349847 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__349843__349848 = function() {
        var G__349850__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__349850 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349850__delegate.call(this, x, y, z, args)
        };
        G__349850.cljs$lang$maxFixedArity = 3;
        G__349850.cljs$lang$applyTo = function(arglist__349851) {
          var x = cljs.core.first(arglist__349851);
          var y = cljs.core.first(cljs.core.next(arglist__349851));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349851)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349851)));
          return G__349850__delegate.call(this, x, y, z, args)
        };
        return G__349850
      }();
      G__349843 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__349843__349844.call(this);
          case 1:
            return G__349843__349845.call(this, x);
          case 2:
            return G__349843__349846.call(this, x, y);
          case 3:
            return G__349843__349847.call(this, x, y, z);
          default:
            return G__349843__349848.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349843.cljs$lang$maxFixedArity = 3;
      G__349843.cljs$lang$applyTo = G__349843__349848.cljs$lang$applyTo;
      return G__349843
    }()
  };
  var juxt__349839 = function(f, g) {
    return function() {
      var G__349852 = null;
      var G__349852__349853 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__349852__349854 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__349852__349855 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__349852__349856 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__349852__349857 = function() {
        var G__349859__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__349859 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349859__delegate.call(this, x, y, z, args)
        };
        G__349859.cljs$lang$maxFixedArity = 3;
        G__349859.cljs$lang$applyTo = function(arglist__349860) {
          var x = cljs.core.first(arglist__349860);
          var y = cljs.core.first(cljs.core.next(arglist__349860));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349860)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349860)));
          return G__349859__delegate.call(this, x, y, z, args)
        };
        return G__349859
      }();
      G__349852 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__349852__349853.call(this);
          case 1:
            return G__349852__349854.call(this, x);
          case 2:
            return G__349852__349855.call(this, x, y);
          case 3:
            return G__349852__349856.call(this, x, y, z);
          default:
            return G__349852__349857.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349852.cljs$lang$maxFixedArity = 3;
      G__349852.cljs$lang$applyTo = G__349852__349857.cljs$lang$applyTo;
      return G__349852
    }()
  };
  var juxt__349840 = function(f, g, h) {
    return function() {
      var G__349861 = null;
      var G__349861__349862 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__349861__349863 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__349861__349864 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__349861__349865 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__349861__349866 = function() {
        var G__349868__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__349868 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__349868__delegate.call(this, x, y, z, args)
        };
        G__349868.cljs$lang$maxFixedArity = 3;
        G__349868.cljs$lang$applyTo = function(arglist__349869) {
          var x = cljs.core.first(arglist__349869);
          var y = cljs.core.first(cljs.core.next(arglist__349869));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349869)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349869)));
          return G__349868__delegate.call(this, x, y, z, args)
        };
        return G__349868
      }();
      G__349861 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__349861__349862.call(this);
          case 1:
            return G__349861__349863.call(this, x);
          case 2:
            return G__349861__349864.call(this, x, y);
          case 3:
            return G__349861__349865.call(this, x, y, z);
          default:
            return G__349861__349866.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__349861.cljs$lang$maxFixedArity = 3;
      G__349861.cljs$lang$applyTo = G__349861__349866.cljs$lang$applyTo;
      return G__349861
    }()
  };
  var juxt__349841 = function() {
    var G__349870__delegate = function(f, g, h, fs) {
      var fs__349837 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__349871 = null;
        var G__349871__349872 = function() {
          return cljs.core.reduce.call(null, function(p1__349820_SHARP_, p2__349821_SHARP_) {
            return cljs.core.conj.call(null, p1__349820_SHARP_, p2__349821_SHARP_.call(null))
          }, cljs.core.PersistentVector.fromArray([]), fs__349837)
        };
        var G__349871__349873 = function(x) {
          return cljs.core.reduce.call(null, function(p1__349822_SHARP_, p2__349823_SHARP_) {
            return cljs.core.conj.call(null, p1__349822_SHARP_, p2__349823_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.fromArray([]), fs__349837)
        };
        var G__349871__349874 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__349824_SHARP_, p2__349825_SHARP_) {
            return cljs.core.conj.call(null, p1__349824_SHARP_, p2__349825_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.fromArray([]), fs__349837)
        };
        var G__349871__349875 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__349826_SHARP_, p2__349827_SHARP_) {
            return cljs.core.conj.call(null, p1__349826_SHARP_, p2__349827_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.fromArray([]), fs__349837)
        };
        var G__349871__349876 = function() {
          var G__349878__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__349828_SHARP_, p2__349829_SHARP_) {
              return cljs.core.conj.call(null, p1__349828_SHARP_, cljs.core.apply.call(null, p2__349829_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.fromArray([]), fs__349837)
          };
          var G__349878 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__349878__delegate.call(this, x, y, z, args)
          };
          G__349878.cljs$lang$maxFixedArity = 3;
          G__349878.cljs$lang$applyTo = function(arglist__349879) {
            var x = cljs.core.first(arglist__349879);
            var y = cljs.core.first(cljs.core.next(arglist__349879));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349879)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349879)));
            return G__349878__delegate.call(this, x, y, z, args)
          };
          return G__349878
        }();
        G__349871 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__349871__349872.call(this);
            case 1:
              return G__349871__349873.call(this, x);
            case 2:
              return G__349871__349874.call(this, x, y);
            case 3:
              return G__349871__349875.call(this, x, y, z);
            default:
              return G__349871__349876.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__349871.cljs$lang$maxFixedArity = 3;
        G__349871.cljs$lang$applyTo = G__349871__349876.cljs$lang$applyTo;
        return G__349871
      }()
    };
    var G__349870 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__349870__delegate.call(this, f, g, h, fs)
    };
    G__349870.cljs$lang$maxFixedArity = 3;
    G__349870.cljs$lang$applyTo = function(arglist__349880) {
      var f = cljs.core.first(arglist__349880);
      var g = cljs.core.first(cljs.core.next(arglist__349880));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__349880)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__349880)));
      return G__349870__delegate.call(this, f, g, h, fs)
    };
    return G__349870
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__349838.call(this, f);
      case 2:
        return juxt__349839.call(this, f, g);
      case 3:
        return juxt__349840.call(this, f, g, h);
      default:
        return juxt__349841.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__349841.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__349882 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__349885 = cljs.core.next.call(null, coll);
        coll = G__349885;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__349883 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____349881 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____349881)) {
          return n > 0
        }else {
          return and__3546__auto____349881
        }
      }())) {
        var G__349886 = n - 1;
        var G__349887 = cljs.core.next.call(null, coll);
        n = G__349886;
        coll = G__349887;
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
        return dorun__349882.call(this, n);
      case 2:
        return dorun__349883.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__349888 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__349889 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__349888.call(this, n);
      case 2:
        return doall__349889.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__349891 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__349891), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__349891), 1))) {
      return cljs.core.first.call(null, matches__349891)
    }else {
      return cljs.core.vec.call(null, matches__349891)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__349892 = re.exec(s);
  if(cljs.core.truth_(matches__349892 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__349892), 1))) {
      return cljs.core.first.call(null, matches__349892)
    }else {
      return cljs.core.vec.call(null, matches__349892)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__349893 = cljs.core.re_find.call(null, re, s);
  var match_idx__349894 = s.search(re);
  var match_str__349895 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__349893)) ? cljs.core.first.call(null, match_data__349893) : match_data__349893;
  var post_match__349896 = cljs.core.subs.call(null, s, match_idx__349894 + cljs.core.count.call(null, match_str__349895));
  if(cljs.core.truth_(match_data__349893)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__349893, re_seq.call(null, re, post_match__349896))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__349898__349899 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___349900 = cljs.core.nth.call(null, vec__349898__349899, 0, null);
  var flags__349901 = cljs.core.nth.call(null, vec__349898__349899, 1, null);
  var pattern__349902 = cljs.core.nth.call(null, vec__349898__349899, 2, null);
  return new RegExp(pattern__349902, flags__349901)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.PersistentVector.fromArray([sep]), cljs.core.map.call(null, function(p1__349897_SHARP_) {
    return print_one.call(null, p1__349897_SHARP_, opts)
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
          var and__3546__auto____349903 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____349903)) {
            var and__3546__auto____349907 = function() {
              var x__451__auto____349904 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____349905 = x__451__auto____349904;
                if(cljs.core.truth_(and__3546__auto____349905)) {
                  var and__3546__auto____349906 = x__451__auto____349904.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____349906)) {
                    return cljs.core.not.call(null, x__451__auto____349904.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____349906
                  }
                }else {
                  return and__3546__auto____349905
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__451__auto____349904)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____349907)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____349907
            }
          }else {
            return and__3546__auto____349903
          }
        }()) ? cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.PersistentVector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__451__auto____349908 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____349909 = x__451__auto____349908;
            if(cljs.core.truth_(and__3546__auto____349909)) {
              var and__3546__auto____349910 = x__451__auto____349908.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____349910)) {
                return cljs.core.not.call(null, x__451__auto____349908.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____349910
              }
            }else {
              return and__3546__auto____349909
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__451__auto____349908)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__349911 = cljs.core.first.call(null, objs);
  var sb__349912 = new goog.string.StringBuffer;
  var G__349913__349914 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__349913__349914)) {
    var obj__349915 = cljs.core.first.call(null, G__349913__349914);
    var G__349913__349916 = G__349913__349914;
    while(true) {
      if(cljs.core.truth_(obj__349915 === first_obj__349911)) {
      }else {
        sb__349912.append(" ")
      }
      var G__349917__349918 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__349915, opts));
      if(cljs.core.truth_(G__349917__349918)) {
        var string__349919 = cljs.core.first.call(null, G__349917__349918);
        var G__349917__349920 = G__349917__349918;
        while(true) {
          sb__349912.append(string__349919);
          var temp__3698__auto____349921 = cljs.core.next.call(null, G__349917__349920);
          if(cljs.core.truth_(temp__3698__auto____349921)) {
            var G__349917__349922 = temp__3698__auto____349921;
            var G__349925 = cljs.core.first.call(null, G__349917__349922);
            var G__349926 = G__349917__349922;
            string__349919 = G__349925;
            G__349917__349920 = G__349926;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____349923 = cljs.core.next.call(null, G__349913__349916);
      if(cljs.core.truth_(temp__3698__auto____349923)) {
        var G__349913__349924 = temp__3698__auto____349923;
        var G__349927 = cljs.core.first.call(null, G__349913__349924);
        var G__349928 = G__349913__349924;
        obj__349915 = G__349927;
        G__349913__349916 = G__349928;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__349912)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__349929 = cljs.core.first.call(null, objs);
  var G__349930__349931 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__349930__349931)) {
    var obj__349932 = cljs.core.first.call(null, G__349930__349931);
    var G__349930__349933 = G__349930__349931;
    while(true) {
      if(cljs.core.truth_(obj__349932 === first_obj__349929)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__349934__349935 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__349932, opts));
      if(cljs.core.truth_(G__349934__349935)) {
        var string__349936 = cljs.core.first.call(null, G__349934__349935);
        var G__349934__349937 = G__349934__349935;
        while(true) {
          cljs.core.string_print.call(null, string__349936);
          var temp__3698__auto____349938 = cljs.core.next.call(null, G__349934__349937);
          if(cljs.core.truth_(temp__3698__auto____349938)) {
            var G__349934__349939 = temp__3698__auto____349938;
            var G__349942 = cljs.core.first.call(null, G__349934__349939);
            var G__349943 = G__349934__349939;
            string__349936 = G__349942;
            G__349934__349937 = G__349943;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____349940 = cljs.core.next.call(null, G__349930__349933);
      if(cljs.core.truth_(temp__3698__auto____349940)) {
        var G__349930__349941 = temp__3698__auto____349940;
        var G__349944 = cljs.core.first.call(null, G__349930__349941);
        var G__349945 = G__349930__349941;
        obj__349932 = G__349944;
        G__349930__349933 = G__349945;
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
  pr_str.cljs$lang$applyTo = function(arglist__349946) {
    var objs = cljs.core.seq(arglist__349946);
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
  pr.cljs$lang$applyTo = function(arglist__349947) {
    var objs = cljs.core.seq(arglist__349947);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__349948) {
    var objs = cljs.core.seq(arglist__349948);
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
  println.cljs$lang$applyTo = function(arglist__349949) {
    var objs = cljs.core.seq(arglist__349949);
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
  prn.cljs$lang$applyTo = function(arglist__349950) {
    var objs = cljs.core.seq(arglist__349950);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__349951 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__349951, "{", ", ", "}", opts, coll)
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
      var temp__3698__auto____349952 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____349952)) {
        var nspc__349953 = temp__3698__auto____349952;
        return cljs.core.str.call(null, nspc__349953, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____349954 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____349954)) {
          var nspc__349955 = temp__3698__auto____349954;
          return cljs.core.str.call(null, nspc__349955, "/")
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
  var pr_pair__349956 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__349956, "{", ", ", "}", opts, coll)
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
  var this__349957 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__349958 = this;
  var G__349959__349960 = cljs.core.seq.call(null, this__349958.watches);
  if(cljs.core.truth_(G__349959__349960)) {
    var G__349962__349964 = cljs.core.first.call(null, G__349959__349960);
    var vec__349963__349965 = G__349962__349964;
    var key__349966 = cljs.core.nth.call(null, vec__349963__349965, 0, null);
    var f__349967 = cljs.core.nth.call(null, vec__349963__349965, 1, null);
    var G__349959__349968 = G__349959__349960;
    var G__349962__349969 = G__349962__349964;
    var G__349959__349970 = G__349959__349968;
    while(true) {
      var vec__349971__349972 = G__349962__349969;
      var key__349973 = cljs.core.nth.call(null, vec__349971__349972, 0, null);
      var f__349974 = cljs.core.nth.call(null, vec__349971__349972, 1, null);
      var G__349959__349975 = G__349959__349970;
      f__349974.call(null, key__349973, this$, oldval, newval);
      var temp__3698__auto____349976 = cljs.core.next.call(null, G__349959__349975);
      if(cljs.core.truth_(temp__3698__auto____349976)) {
        var G__349959__349977 = temp__3698__auto____349976;
        var G__349984 = cljs.core.first.call(null, G__349959__349977);
        var G__349985 = G__349959__349977;
        G__349962__349969 = G__349984;
        G__349959__349970 = G__349985;
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
  var this__349978 = this;
  return this$.watches = cljs.core.assoc.call(null, this__349978.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__349979 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__349979.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__349980 = this;
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__349980.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__349981 = this;
  return this__349981.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__349982 = this;
  return this__349982.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__349983 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__349992 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__349993 = function() {
    var G__349995__delegate = function(x, p__349986) {
      var map__349987__349988 = p__349986;
      var map__349987__349989 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__349987__349988)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__349987__349988) : map__349987__349988;
      var validator__349990 = cljs.core.get.call(null, map__349987__349989, "\ufdd0'validator");
      var meta__349991 = cljs.core.get.call(null, map__349987__349989, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__349991, validator__349990, null)
    };
    var G__349995 = function(x, var_args) {
      var p__349986 = null;
      if(goog.isDef(var_args)) {
        p__349986 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__349995__delegate.call(this, x, p__349986)
    };
    G__349995.cljs$lang$maxFixedArity = 1;
    G__349995.cljs$lang$applyTo = function(arglist__349996) {
      var x = cljs.core.first(arglist__349996);
      var p__349986 = cljs.core.rest(arglist__349996);
      return G__349995__delegate.call(this, x, p__349986)
    };
    return G__349995
  }();
  atom = function(x, var_args) {
    var p__349986 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__349992.call(this, x);
      default:
        return atom__349993.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__349993.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____349997 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____349997)) {
    var validate__349998 = temp__3698__auto____349997;
    if(cljs.core.truth_(validate__349998.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3257)))));
    }
  }else {
  }
  var old_value__349999 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__349999, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___350000 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___350001 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___350002 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___350003 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___350004 = function() {
    var G__350006__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__350006 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__350006__delegate.call(this, a, f, x, y, z, more)
    };
    G__350006.cljs$lang$maxFixedArity = 5;
    G__350006.cljs$lang$applyTo = function(arglist__350007) {
      var a = cljs.core.first(arglist__350007);
      var f = cljs.core.first(cljs.core.next(arglist__350007));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__350007)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__350007))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__350007)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__350007)))));
      return G__350006__delegate.call(this, a, f, x, y, z, more)
    };
    return G__350006
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___350000.call(this, a, f);
      case 3:
        return swap_BANG___350001.call(this, a, f, x);
      case 4:
        return swap_BANG___350002.call(this, a, f, x, y);
      case 5:
        return swap_BANG___350003.call(this, a, f, x, y, z);
      default:
        return swap_BANG___350004.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___350004.cljs$lang$applyTo;
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__350008) {
    var iref = cljs.core.first(arglist__350008);
    var f = cljs.core.first(cljs.core.next(arglist__350008));
    var args = cljs.core.rest(cljs.core.next(arglist__350008));
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
  var gensym__350009 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__350010 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__350009.call(this);
      case 1:
        return gensym__350010.call(this, prefix_string)
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
  var this__350012 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__350012.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__350013 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__350013.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__350013.state, this__350013.f)
  }
  return cljs.core.deref.call(null, this__350013.state)
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
  delay.cljs$lang$applyTo = function(arglist__350014) {
    var body = cljs.core.seq(arglist__350014);
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
    var map__350015__350016 = options;
    var map__350015__350017 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__350015__350016)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__350015__350016) : map__350015__350016;
    var keywordize_keys__350018 = cljs.core.get.call(null, map__350015__350017, "\ufdd0'keywordize-keys");
    var keyfn__350019 = cljs.core.truth_(keywordize_keys__350018) ? cljs.core.keyword : cljs.core.str;
    var f__350025 = function thisfn(x) {
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
                var iter__515__auto____350024 = function iter__350020(s__350021) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__350021__350022 = s__350021;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__350021__350022))) {
                        var k__350023 = cljs.core.first.call(null, s__350021__350022);
                        return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([keyfn__350019.call(null, k__350023), thisfn.call(null, x[k__350023])]), iter__350020.call(null, cljs.core.rest.call(null, s__350021__350022)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__515__auto____350024.call(null, cljs.core.js_keys.call(null, x))
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
    return f__350025.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__350026) {
    var x = cljs.core.first(arglist__350026);
    var options = cljs.core.rest(arglist__350026);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__350027 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__350031__delegate = function(args) {
      var temp__3695__auto____350028 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__350027), args);
      if(cljs.core.truth_(temp__3695__auto____350028)) {
        var v__350029 = temp__3695__auto____350028;
        return v__350029
      }else {
        var ret__350030 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__350027, cljs.core.assoc, args, ret__350030);
        return ret__350030
      }
    };
    var G__350031 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__350031__delegate.call(this, args)
    };
    G__350031.cljs$lang$maxFixedArity = 0;
    G__350031.cljs$lang$applyTo = function(arglist__350032) {
      var args = cljs.core.seq(arglist__350032);
      return G__350031__delegate.call(this, args)
    };
    return G__350031
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__350034 = function(f) {
    while(true) {
      var ret__350033 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__350033))) {
        var G__350037 = ret__350033;
        f = G__350037;
        continue
      }else {
        return ret__350033
      }
      break
    }
  };
  var trampoline__350035 = function() {
    var G__350038__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__350038 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__350038__delegate.call(this, f, args)
    };
    G__350038.cljs$lang$maxFixedArity = 1;
    G__350038.cljs$lang$applyTo = function(arglist__350039) {
      var f = cljs.core.first(arglist__350039);
      var args = cljs.core.rest(arglist__350039);
      return G__350038__delegate.call(this, f, args)
    };
    return G__350038
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__350034.call(this, f);
      default:
        return trampoline__350035.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__350035.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__350040 = function() {
    return rand.call(null, 1)
  };
  var rand__350041 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__350040.call(this);
      case 1:
        return rand__350041.call(this, n)
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
    var k__350043 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__350043, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__350043, cljs.core.PersistentVector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___350052 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___350053 = function(h, child, parent) {
    var or__3548__auto____350044 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____350044)) {
      return or__3548__auto____350044
    }else {
      var or__3548__auto____350045 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____350045)) {
        return or__3548__auto____350045
      }else {
        var and__3546__auto____350046 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____350046)) {
          var and__3546__auto____350047 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____350047)) {
            var and__3546__auto____350048 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____350048)) {
              var ret__350049 = true;
              var i__350050 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____350051 = cljs.core.not.call(null, ret__350049);
                  if(cljs.core.truth_(or__3548__auto____350051)) {
                    return or__3548__auto____350051
                  }else {
                    return cljs.core._EQ_.call(null, i__350050, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__350049
                }else {
                  var G__350055 = isa_QMARK_.call(null, h, child.call(null, i__350050), parent.call(null, i__350050));
                  var G__350056 = i__350050 + 1;
                  ret__350049 = G__350055;
                  i__350050 = G__350056;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____350048
            }
          }else {
            return and__3546__auto____350047
          }
        }else {
          return and__3546__auto____350046
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___350052.call(this, h, child);
      case 3:
        return isa_QMARK___350053.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__350057 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__350058 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__350057.call(this, h);
      case 2:
        return parents__350058.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__350060 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__350061 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__350060.call(this, h);
      case 2:
        return ancestors__350061.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__350063 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__350064 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__350063.call(this, h);
      case 2:
        return descendants__350064.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__350074 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3549)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__350075 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3553)))));
    }
    var tp__350069 = "\ufdd0'parents".call(null, h);
    var td__350070 = "\ufdd0'descendants".call(null, h);
    var ta__350071 = "\ufdd0'ancestors".call(null, h);
    var tf__350072 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____350073 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__350069.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__350071.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__350071.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__350069, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__350072.call(null, "\ufdd0'ancestors".call(null, h), tag, td__350070, parent, ta__350071), "\ufdd0'descendants":tf__350072.call(null, "\ufdd0'descendants".call(null, h), parent, ta__350071, tag, td__350070)})
    }();
    if(cljs.core.truth_(or__3548__auto____350073)) {
      return or__3548__auto____350073
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__350074.call(this, h, tag);
      case 3:
        return derive__350075.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__350081 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__350082 = function(h, tag, parent) {
    var parentMap__350077 = "\ufdd0'parents".call(null, h);
    var childsParents__350078 = cljs.core.truth_(parentMap__350077.call(null, tag)) ? cljs.core.disj.call(null, parentMap__350077.call(null, tag), parent) : cljs.core.set([]);
    var newParents__350079 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__350078)) ? cljs.core.assoc.call(null, parentMap__350077, tag, childsParents__350078) : cljs.core.dissoc.call(null, parentMap__350077, tag);
    var deriv_seq__350080 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__350066_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__350066_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__350066_SHARP_), cljs.core.second.call(null, p1__350066_SHARP_)))
    }, cljs.core.seq.call(null, newParents__350079)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__350077.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__350067_SHARP_, p2__350068_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__350067_SHARP_, p2__350068_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__350080))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__350081.call(this, h, tag);
      case 3:
        return underive__350082.call(this, h, tag, parent)
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
  var xprefs__350084 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____350086 = cljs.core.truth_(function() {
    var and__3546__auto____350085 = xprefs__350084;
    if(cljs.core.truth_(and__3546__auto____350085)) {
      return xprefs__350084.call(null, y)
    }else {
      return and__3546__auto____350085
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____350086)) {
    return or__3548__auto____350086
  }else {
    var or__3548__auto____350088 = function() {
      var ps__350087 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__350087) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__350087), prefer_table))) {
          }else {
          }
          var G__350091 = cljs.core.rest.call(null, ps__350087);
          ps__350087 = G__350091;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____350088)) {
      return or__3548__auto____350088
    }else {
      var or__3548__auto____350090 = function() {
        var ps__350089 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__350089) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__350089), y, prefer_table))) {
            }else {
            }
            var G__350092 = cljs.core.rest.call(null, ps__350089);
            ps__350089 = G__350092;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____350090)) {
        return or__3548__auto____350090
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____350093 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____350093)) {
    return or__3548__auto____350093
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__350102 = cljs.core.reduce.call(null, function(be, p__350094) {
    var vec__350095__350096 = p__350094;
    var k__350097 = cljs.core.nth.call(null, vec__350095__350096, 0, null);
    var ___350098 = cljs.core.nth.call(null, vec__350095__350096, 1, null);
    var e__350099 = vec__350095__350096;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__350097))) {
      var be2__350101 = cljs.core.truth_(function() {
        var or__3548__auto____350100 = be === null;
        if(cljs.core.truth_(or__3548__auto____350100)) {
          return or__3548__auto____350100
        }else {
          return cljs.core.dominates.call(null, k__350097, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__350099 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__350101), k__350097, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__350097, " and ", cljs.core.first.call(null, be2__350101), ", and neither is preferred"));
      }
      return be2__350101
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__350102)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__350102));
      return cljs.core.second.call(null, best_entry__350102)
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
    var and__3546__auto____350103 = mf;
    if(cljs.core.truth_(and__3546__auto____350103)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____350103
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____350104 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350104)) {
        return or__3548__auto____350104
      }else {
        var or__3548__auto____350105 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____350105)) {
          return or__3548__auto____350105
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350106 = mf;
    if(cljs.core.truth_(and__3546__auto____350106)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____350106
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____350107 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350107)) {
        return or__3548__auto____350107
      }else {
        var or__3548__auto____350108 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____350108)) {
          return or__3548__auto____350108
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350109 = mf;
    if(cljs.core.truth_(and__3546__auto____350109)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____350109
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____350110 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350110)) {
        return or__3548__auto____350110
      }else {
        var or__3548__auto____350111 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____350111)) {
          return or__3548__auto____350111
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350112 = mf;
    if(cljs.core.truth_(and__3546__auto____350112)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____350112
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____350113 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350113)) {
        return or__3548__auto____350113
      }else {
        var or__3548__auto____350114 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____350114)) {
          return or__3548__auto____350114
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350115 = mf;
    if(cljs.core.truth_(and__3546__auto____350115)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____350115
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____350116 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350116)) {
        return or__3548__auto____350116
      }else {
        var or__3548__auto____350117 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____350117)) {
          return or__3548__auto____350117
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350118 = mf;
    if(cljs.core.truth_(and__3546__auto____350118)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____350118
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____350119 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350119)) {
        return or__3548__auto____350119
      }else {
        var or__3548__auto____350120 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____350120)) {
          return or__3548__auto____350120
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350121 = mf;
    if(cljs.core.truth_(and__3546__auto____350121)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____350121
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____350122 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350122)) {
        return or__3548__auto____350122
      }else {
        var or__3548__auto____350123 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____350123)) {
          return or__3548__auto____350123
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____350124 = mf;
    if(cljs.core.truth_(and__3546__auto____350124)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____350124
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____350125 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____350125)) {
        return or__3548__auto____350125
      }else {
        var or__3548__auto____350126 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____350126)) {
          return or__3548__auto____350126
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__350127 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__350128 = cljs.core._get_method.call(null, mf, dispatch_val__350127);
  if(cljs.core.truth_(target_fn__350128)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__350127));
  }
  return cljs.core.apply.call(null, target_fn__350128, args)
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
  var this__350129 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__350130 = this;
  cljs.core.swap_BANG_.call(null, this__350130.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__350130.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__350130.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__350130.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__350131 = this;
  cljs.core.swap_BANG_.call(null, this__350131.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__350131.method_cache, this__350131.method_table, this__350131.cached_hierarchy, this__350131.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__350132 = this;
  cljs.core.swap_BANG_.call(null, this__350132.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__350132.method_cache, this__350132.method_table, this__350132.cached_hierarchy, this__350132.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__350133 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__350133.cached_hierarchy), cljs.core.deref.call(null, this__350133.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__350133.method_cache, this__350133.method_table, this__350133.cached_hierarchy, this__350133.hierarchy)
  }
  var temp__3695__auto____350134 = cljs.core.deref.call(null, this__350133.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____350134)) {
    var target_fn__350135 = temp__3695__auto____350134;
    return target_fn__350135
  }else {
    var temp__3695__auto____350136 = cljs.core.find_and_cache_best_method.call(null, this__350133.name, dispatch_val, this__350133.hierarchy, this__350133.method_table, this__350133.prefer_table, this__350133.method_cache, this__350133.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____350136)) {
      var target_fn__350137 = temp__3695__auto____350136;
      return target_fn__350137
    }else {
      return cljs.core.deref.call(null, this__350133.method_table).call(null, this__350133.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__350138 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__350138.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__350138.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__350138.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__350138.method_cache, this__350138.method_table, this__350138.cached_hierarchy, this__350138.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__350139 = this;
  return cljs.core.deref.call(null, this__350139.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__350140 = this;
  return cljs.core.deref.call(null, this__350140.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__350141 = this;
  return cljs.core.do_dispatch.call(null, mf, this__350141.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__350142__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__350142 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__350142__delegate.call(this, _, args)
  };
  G__350142.cljs$lang$maxFixedArity = 1;
  G__350142.cljs$lang$applyTo = function(arglist__350143) {
    var _ = cljs.core.first(arglist__350143);
    var args = cljs.core.rest(arglist__350143);
    return G__350142__delegate.call(this, _, args)
  };
  return G__350142
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
goog.provide("tatame.worker.main");
goog.require("cljs.core");
tatame.worker.main.socket = new WebSocket(cljs.core.str.call(null, "ws://", location.hostname, ":8108/socket"));
tatame.worker.main.events = cljs.core.atom.call(null, cljs.core.PersistentVector.fromArray([]));
tatame.worker.main.send_messages_BANG_ = function send_messages_BANG_() {
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, tatame.worker.main.events))))) {
      tatame.worker.main.socket.send(cljs.core.pr_str.call(null, cljs.core.first.call(null, cljs.core.deref.call(null, tatame.worker.main.events))));
      cljs.core.swap_BANG_.call(null, tatame.worker.main.events, function(p1__348352_SHARP_) {
        return cljs.core.drop.call(null, 1, p1__348352_SHARP_)
      });
      continue
    }else {
    }
    break
  }
  return self.setTimeout(send_messages_BANG_, 1E4)
};
tatame.worker.main.on_client_message = function on_client_message(e) {
  var data__348353 = e.data;
  if(cljs.core.truth_(data__348353.editor)) {
    var event__348354 = cljs.core.assoc.call(null, cljs.core.js__GT_clj.call(null, data__348353), "\ufdd0'ts", e.timeStamp);
    return cljs.core.swap_BANG_.call(null, tatame.worker.main.events, cljs.core.conj, event__348354)
  }else {
    if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, data__348353))) {
      return tatame.worker.main.socket.send(data__348353)
    }else {
      return null
    }
  }
};
tatame.worker.main.on_server_message = function on_server_message(e) {
  var data__348355 = e.data;
  return self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data"], {"\ufdd0'type":"server", "\ufdd0'data":data__348355})))
};
tatame.worker.main.on_open = function on_open() {
  tatame.worker.main.send_messages_BANG_.call(null);
  return self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'event"], {"\ufdd0'type":"client", "\ufdd0'event":"onopen"})))
};
tatame.worker.main.socket.onopen = tatame.worker.main.on_open;
tatame.worker.main.socket.onmessage = tatame.worker.main.on_server_message;
self.addEventListener("message", tatame.worker.main.on_client_message, false);

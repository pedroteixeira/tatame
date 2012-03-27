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
  var or__3548__auto____3091 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____3091)) {
    return or__3548__auto____3091
  }else {
    var or__3548__auto____3092 = p["_"];
    if(cljs.core.truth_(or__3548__auto____3092)) {
      return or__3548__auto____3092
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
  var _invoke__3156 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3093 = this$;
      if(cljs.core.truth_(and__3546__auto____3093)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3093
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____3094 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3094)) {
          return or__3548__auto____3094
        }else {
          var or__3548__auto____3095 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3095)) {
            return or__3548__auto____3095
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__3157 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3096 = this$;
      if(cljs.core.truth_(and__3546__auto____3096)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3096
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____3097 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3097)) {
          return or__3548__auto____3097
        }else {
          var or__3548__auto____3098 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3098)) {
            return or__3548__auto____3098
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__3158 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3099 = this$;
      if(cljs.core.truth_(and__3546__auto____3099)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3099
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____3100 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3100)) {
          return or__3548__auto____3100
        }else {
          var or__3548__auto____3101 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3101)) {
            return or__3548__auto____3101
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__3159 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3102 = this$;
      if(cljs.core.truth_(and__3546__auto____3102)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3102
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____3103 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3103)) {
          return or__3548__auto____3103
        }else {
          var or__3548__auto____3104 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3104)) {
            return or__3548__auto____3104
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__3160 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3105 = this$;
      if(cljs.core.truth_(and__3546__auto____3105)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3105
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____3106 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3106)) {
          return or__3548__auto____3106
        }else {
          var or__3548__auto____3107 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3107)) {
            return or__3548__auto____3107
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__3161 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3108 = this$;
      if(cljs.core.truth_(and__3546__auto____3108)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3108
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____3109 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3109)) {
          return or__3548__auto____3109
        }else {
          var or__3548__auto____3110 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3110)) {
            return or__3548__auto____3110
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__3162 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3111 = this$;
      if(cljs.core.truth_(and__3546__auto____3111)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3111
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____3112 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3112)) {
          return or__3548__auto____3112
        }else {
          var or__3548__auto____3113 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3113)) {
            return or__3548__auto____3113
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__3163 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3114 = this$;
      if(cljs.core.truth_(and__3546__auto____3114)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3114
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____3115 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3115)) {
          return or__3548__auto____3115
        }else {
          var or__3548__auto____3116 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3116)) {
            return or__3548__auto____3116
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__3164 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3117 = this$;
      if(cljs.core.truth_(and__3546__auto____3117)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3117
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____3118 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3118)) {
          return or__3548__auto____3118
        }else {
          var or__3548__auto____3119 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3119)) {
            return or__3548__auto____3119
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__3165 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3120 = this$;
      if(cljs.core.truth_(and__3546__auto____3120)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3120
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____3121 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3121)) {
          return or__3548__auto____3121
        }else {
          var or__3548__auto____3122 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3122)) {
            return or__3548__auto____3122
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__3166 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3123 = this$;
      if(cljs.core.truth_(and__3546__auto____3123)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3123
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____3124 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3124)) {
          return or__3548__auto____3124
        }else {
          var or__3548__auto____3125 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3125)) {
            return or__3548__auto____3125
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__3167 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3126 = this$;
      if(cljs.core.truth_(and__3546__auto____3126)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3126
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____3127 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3127)) {
          return or__3548__auto____3127
        }else {
          var or__3548__auto____3128 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3128)) {
            return or__3548__auto____3128
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__3168 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3129 = this$;
      if(cljs.core.truth_(and__3546__auto____3129)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3129
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____3130 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3130)) {
          return or__3548__auto____3130
        }else {
          var or__3548__auto____3131 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3131)) {
            return or__3548__auto____3131
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__3169 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3132 = this$;
      if(cljs.core.truth_(and__3546__auto____3132)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3132
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____3133 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3133)) {
          return or__3548__auto____3133
        }else {
          var or__3548__auto____3134 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3134)) {
            return or__3548__auto____3134
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__3170 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3135 = this$;
      if(cljs.core.truth_(and__3546__auto____3135)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3135
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____3136 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3136)) {
          return or__3548__auto____3136
        }else {
          var or__3548__auto____3137 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3137)) {
            return or__3548__auto____3137
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__3171 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3138 = this$;
      if(cljs.core.truth_(and__3546__auto____3138)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3138
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____3139 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3139)) {
          return or__3548__auto____3139
        }else {
          var or__3548__auto____3140 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3140)) {
            return or__3548__auto____3140
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__3172 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3141 = this$;
      if(cljs.core.truth_(and__3546__auto____3141)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3141
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____3142 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3142)) {
          return or__3548__auto____3142
        }else {
          var or__3548__auto____3143 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3143)) {
            return or__3548__auto____3143
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__3173 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3144 = this$;
      if(cljs.core.truth_(and__3546__auto____3144)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3144
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____3145 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3145)) {
          return or__3548__auto____3145
        }else {
          var or__3548__auto____3146 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3146)) {
            return or__3548__auto____3146
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__3174 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3147 = this$;
      if(cljs.core.truth_(and__3546__auto____3147)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3147
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____3148 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3148)) {
          return or__3548__auto____3148
        }else {
          var or__3548__auto____3149 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3149)) {
            return or__3548__auto____3149
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__3175 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3150 = this$;
      if(cljs.core.truth_(and__3546__auto____3150)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3150
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____3151 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3151)) {
          return or__3548__auto____3151
        }else {
          var or__3548__auto____3152 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3152)) {
            return or__3548__auto____3152
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__3176 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3153 = this$;
      if(cljs.core.truth_(and__3546__auto____3153)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____3153
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____3154 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____3154)) {
          return or__3548__auto____3154
        }else {
          var or__3548__auto____3155 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____3155)) {
            return or__3548__auto____3155
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
        return _invoke__3156.call(this, this$);
      case 2:
        return _invoke__3157.call(this, this$, a);
      case 3:
        return _invoke__3158.call(this, this$, a, b);
      case 4:
        return _invoke__3159.call(this, this$, a, b, c);
      case 5:
        return _invoke__3160.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__3161.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__3162.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__3163.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__3164.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__3165.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__3166.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__3167.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__3168.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__3169.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__3170.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__3171.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__3172.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__3173.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__3174.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__3175.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__3176.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3178 = coll;
    if(cljs.core.truth_(and__3546__auto____3178)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____3178
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____3179 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3179)) {
        return or__3548__auto____3179
      }else {
        var or__3548__auto____3180 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____3180)) {
          return or__3548__auto____3180
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
    var and__3546__auto____3181 = coll;
    if(cljs.core.truth_(and__3546__auto____3181)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____3181
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____3182 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3182)) {
        return or__3548__auto____3182
      }else {
        var or__3548__auto____3183 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____3183)) {
          return or__3548__auto____3183
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
    var and__3546__auto____3184 = coll;
    if(cljs.core.truth_(and__3546__auto____3184)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____3184
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____3185 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3185)) {
        return or__3548__auto____3185
      }else {
        var or__3548__auto____3186 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____3186)) {
          return or__3548__auto____3186
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
  var _nth__3193 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3187 = coll;
      if(cljs.core.truth_(and__3546__auto____3187)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____3187
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____3188 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____3188)) {
          return or__3548__auto____3188
        }else {
          var or__3548__auto____3189 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____3189)) {
            return or__3548__auto____3189
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__3194 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3190 = coll;
      if(cljs.core.truth_(and__3546__auto____3190)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____3190
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____3191 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____3191)) {
          return or__3548__auto____3191
        }else {
          var or__3548__auto____3192 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____3192)) {
            return or__3548__auto____3192
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
        return _nth__3193.call(this, coll, n);
      case 3:
        return _nth__3194.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3196 = coll;
    if(cljs.core.truth_(and__3546__auto____3196)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____3196
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____3197 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3197)) {
        return or__3548__auto____3197
      }else {
        var or__3548__auto____3198 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____3198)) {
          return or__3548__auto____3198
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3199 = coll;
    if(cljs.core.truth_(and__3546__auto____3199)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____3199
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____3200 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3200)) {
        return or__3548__auto____3200
      }else {
        var or__3548__auto____3201 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____3201)) {
          return or__3548__auto____3201
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
  var _lookup__3208 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3202 = o;
      if(cljs.core.truth_(and__3546__auto____3202)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____3202
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____3203 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____3203)) {
          return or__3548__auto____3203
        }else {
          var or__3548__auto____3204 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____3204)) {
            return or__3548__auto____3204
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__3209 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3205 = o;
      if(cljs.core.truth_(and__3546__auto____3205)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____3205
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____3206 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____3206)) {
          return or__3548__auto____3206
        }else {
          var or__3548__auto____3207 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____3207)) {
            return or__3548__auto____3207
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
        return _lookup__3208.call(this, o, k);
      case 3:
        return _lookup__3209.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3211 = coll;
    if(cljs.core.truth_(and__3546__auto____3211)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____3211
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____3212 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3212)) {
        return or__3548__auto____3212
      }else {
        var or__3548__auto____3213 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____3213)) {
          return or__3548__auto____3213
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3214 = coll;
    if(cljs.core.truth_(and__3546__auto____3214)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____3214
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____3215 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3215)) {
        return or__3548__auto____3215
      }else {
        var or__3548__auto____3216 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____3216)) {
          return or__3548__auto____3216
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
    var and__3546__auto____3217 = coll;
    if(cljs.core.truth_(and__3546__auto____3217)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____3217
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____3218 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3218)) {
        return or__3548__auto____3218
      }else {
        var or__3548__auto____3219 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____3219)) {
          return or__3548__auto____3219
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
    var and__3546__auto____3220 = coll;
    if(cljs.core.truth_(and__3546__auto____3220)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____3220
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____3221 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3221)) {
        return or__3548__auto____3221
      }else {
        var or__3548__auto____3222 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____3222)) {
          return or__3548__auto____3222
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
    var and__3546__auto____3223 = coll;
    if(cljs.core.truth_(and__3546__auto____3223)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____3223
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____3224 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3224)) {
        return or__3548__auto____3224
      }else {
        var or__3548__auto____3225 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____3225)) {
          return or__3548__auto____3225
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3226 = coll;
    if(cljs.core.truth_(and__3546__auto____3226)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____3226
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____3227 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3227)) {
        return or__3548__auto____3227
      }else {
        var or__3548__auto____3228 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____3228)) {
          return or__3548__auto____3228
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
    var and__3546__auto____3229 = coll;
    if(cljs.core.truth_(and__3546__auto____3229)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____3229
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____3230 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____3230)) {
        return or__3548__auto____3230
      }else {
        var or__3548__auto____3231 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____3231)) {
          return or__3548__auto____3231
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
    var and__3546__auto____3232 = o;
    if(cljs.core.truth_(and__3546__auto____3232)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____3232
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____3233 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3233)) {
        return or__3548__auto____3233
      }else {
        var or__3548__auto____3234 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____3234)) {
          return or__3548__auto____3234
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
    var and__3546__auto____3235 = o;
    if(cljs.core.truth_(and__3546__auto____3235)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____3235
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____3236 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3236)) {
        return or__3548__auto____3236
      }else {
        var or__3548__auto____3237 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____3237)) {
          return or__3548__auto____3237
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
    var and__3546__auto____3238 = o;
    if(cljs.core.truth_(and__3546__auto____3238)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____3238
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____3239 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3239)) {
        return or__3548__auto____3239
      }else {
        var or__3548__auto____3240 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____3240)) {
          return or__3548__auto____3240
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
    var and__3546__auto____3241 = o;
    if(cljs.core.truth_(and__3546__auto____3241)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____3241
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____3242 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3242)) {
        return or__3548__auto____3242
      }else {
        var or__3548__auto____3243 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____3243)) {
          return or__3548__auto____3243
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
  var _reduce__3250 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3244 = coll;
      if(cljs.core.truth_(and__3546__auto____3244)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____3244
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____3245 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____3245)) {
          return or__3548__auto____3245
        }else {
          var or__3548__auto____3246 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____3246)) {
            return or__3548__auto____3246
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__3251 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3247 = coll;
      if(cljs.core.truth_(and__3546__auto____3247)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____3247
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____3248 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____3248)) {
          return or__3548__auto____3248
        }else {
          var or__3548__auto____3249 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____3249)) {
            return or__3548__auto____3249
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
        return _reduce__3250.call(this, coll, f);
      case 3:
        return _reduce__3251.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3253 = o;
    if(cljs.core.truth_(and__3546__auto____3253)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____3253
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____3254 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3254)) {
        return or__3548__auto____3254
      }else {
        var or__3548__auto____3255 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____3255)) {
          return or__3548__auto____3255
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
    var and__3546__auto____3256 = o;
    if(cljs.core.truth_(and__3546__auto____3256)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____3256
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____3257 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3257)) {
        return or__3548__auto____3257
      }else {
        var or__3548__auto____3258 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____3258)) {
          return or__3548__auto____3258
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
    var and__3546__auto____3259 = o;
    if(cljs.core.truth_(and__3546__auto____3259)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____3259
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____3260 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3260)) {
        return or__3548__auto____3260
      }else {
        var or__3548__auto____3261 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____3261)) {
          return or__3548__auto____3261
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
    var and__3546__auto____3262 = o;
    if(cljs.core.truth_(and__3546__auto____3262)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____3262
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____3263 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____3263)) {
        return or__3548__auto____3263
      }else {
        var or__3548__auto____3264 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____3264)) {
          return or__3548__auto____3264
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
    var and__3546__auto____3265 = d;
    if(cljs.core.truth_(and__3546__auto____3265)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____3265
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____3266 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____3266)) {
        return or__3548__auto____3266
      }else {
        var or__3548__auto____3267 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____3267)) {
          return or__3548__auto____3267
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
    var and__3546__auto____3268 = this$;
    if(cljs.core.truth_(and__3546__auto____3268)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____3268
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____3269 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____3269)) {
        return or__3548__auto____3269
      }else {
        var or__3548__auto____3270 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____3270)) {
          return or__3548__auto____3270
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3271 = this$;
    if(cljs.core.truth_(and__3546__auto____3271)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____3271
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____3272 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____3272)) {
        return or__3548__auto____3272
      }else {
        var or__3548__auto____3273 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____3273)) {
          return or__3548__auto____3273
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____3274 = this$;
    if(cljs.core.truth_(and__3546__auto____3274)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____3274
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____3275 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____3275)) {
        return or__3548__auto____3275
      }else {
        var or__3548__auto____3276 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____3276)) {
          return or__3548__auto____3276
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
  var G__3277 = null;
  var G__3277__3278 = function(o, k) {
    return null
  };
  var G__3277__3279 = function(o, k, not_found) {
    return not_found
  };
  G__3277 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3277__3278.call(this, o, k);
      case 3:
        return G__3277__3279.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3277
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
  var G__3281 = null;
  var G__3281__3282 = function(_, f) {
    return f.call(null)
  };
  var G__3281__3283 = function(_, f, start) {
    return start
  };
  G__3281 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__3281__3282.call(this, _, f);
      case 3:
        return G__3281__3283.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3281
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
  var G__3285 = null;
  var G__3285__3286 = function(_, n) {
    return null
  };
  var G__3285__3287 = function(_, n, not_found) {
    return not_found
  };
  G__3285 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3285__3286.call(this, _, n);
      case 3:
        return G__3285__3287.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3285
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
  var ci_reduce__3295 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__3289 = cljs.core._nth.call(null, cicoll, 0);
      var n__3290 = 1;
      while(true) {
        if(cljs.core.truth_(n__3290 < cljs.core._count.call(null, cicoll))) {
          var G__3299 = f.call(null, val__3289, cljs.core._nth.call(null, cicoll, n__3290));
          var G__3300 = n__3290 + 1;
          val__3289 = G__3299;
          n__3290 = G__3300;
          continue
        }else {
          return val__3289
        }
        break
      }
    }
  };
  var ci_reduce__3296 = function(cicoll, f, val) {
    var val__3291 = val;
    var n__3292 = 0;
    while(true) {
      if(cljs.core.truth_(n__3292 < cljs.core._count.call(null, cicoll))) {
        var G__3301 = f.call(null, val__3291, cljs.core._nth.call(null, cicoll, n__3292));
        var G__3302 = n__3292 + 1;
        val__3291 = G__3301;
        n__3292 = G__3302;
        continue
      }else {
        return val__3291
      }
      break
    }
  };
  var ci_reduce__3297 = function(cicoll, f, val, idx) {
    var val__3293 = val;
    var n__3294 = idx;
    while(true) {
      if(cljs.core.truth_(n__3294 < cljs.core._count.call(null, cicoll))) {
        var G__3303 = f.call(null, val__3293, cljs.core._nth.call(null, cicoll, n__3294));
        var G__3304 = n__3294 + 1;
        val__3293 = G__3303;
        n__3294 = G__3304;
        continue
      }else {
        return val__3293
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__3295.call(this, cicoll, f);
      case 3:
        return ci_reduce__3296.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__3297.call(this, cicoll, f, val, idx)
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
  var this__3305 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__3318 = null;
  var G__3318__3319 = function(_, f) {
    var this__3306 = this;
    return cljs.core.ci_reduce.call(null, this__3306.a, f, this__3306.a[this__3306.i], this__3306.i + 1)
  };
  var G__3318__3320 = function(_, f, start) {
    var this__3307 = this;
    return cljs.core.ci_reduce.call(null, this__3307.a, f, start, this__3307.i)
  };
  G__3318 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__3318__3319.call(this, _, f);
      case 3:
        return G__3318__3320.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3318
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__3308 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__3309 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__3322 = null;
  var G__3322__3323 = function(coll, n) {
    var this__3310 = this;
    var i__3311 = n + this__3310.i;
    if(cljs.core.truth_(i__3311 < this__3310.a.length)) {
      return this__3310.a[i__3311]
    }else {
      return null
    }
  };
  var G__3322__3324 = function(coll, n, not_found) {
    var this__3312 = this;
    var i__3313 = n + this__3312.i;
    if(cljs.core.truth_(i__3313 < this__3312.a.length)) {
      return this__3312.a[i__3313]
    }else {
      return not_found
    }
  };
  G__3322 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3322__3323.call(this, coll, n);
      case 3:
        return G__3322__3324.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3322
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__3314 = this;
  return this__3314.a.length - this__3314.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__3315 = this;
  return this__3315.a[this__3315.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__3316 = this;
  if(cljs.core.truth_(this__3316.i + 1 < this__3316.a.length)) {
    return new cljs.core.IndexedSeq(this__3316.a, this__3316.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__3317 = this;
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
  var G__3326 = null;
  var G__3326__3327 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__3326__3328 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__3326 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__3326__3327.call(this, array, f);
      case 3:
        return G__3326__3328.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3326
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__3330 = null;
  var G__3330__3331 = function(array, k) {
    return array[k]
  };
  var G__3330__3332 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__3330 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3330__3331.call(this, array, k);
      case 3:
        return G__3330__3332.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3330
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__3334 = null;
  var G__3334__3335 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__3334__3336 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__3334 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3334__3335.call(this, array, n);
      case 3:
        return G__3334__3336.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3334
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
  var temp__3698__auto____3338 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____3338)) {
    var s__3339 = temp__3698__auto____3338;
    return cljs.core._first.call(null, s__3339)
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
      var G__3340 = cljs.core.next.call(null, s);
      s = G__3340;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__3341 = cljs.core.seq.call(null, x);
  var n__3342 = 0;
  while(true) {
    if(cljs.core.truth_(s__3341)) {
      var G__3343 = cljs.core.next.call(null, s__3341);
      var G__3344 = n__3342 + 1;
      s__3341 = G__3343;
      n__3342 = G__3344;
      continue
    }else {
      return n__3342
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
  var conj__3345 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__3346 = function() {
    var G__3348__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__3349 = conj.call(null, coll, x);
          var G__3350 = cljs.core.first.call(null, xs);
          var G__3351 = cljs.core.next.call(null, xs);
          coll = G__3349;
          x = G__3350;
          xs = G__3351;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__3348 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3348__delegate.call(this, coll, x, xs)
    };
    G__3348.cljs$lang$maxFixedArity = 2;
    G__3348.cljs$lang$applyTo = function(arglist__3352) {
      var coll = cljs.core.first(arglist__3352);
      var x = cljs.core.first(cljs.core.next(arglist__3352));
      var xs = cljs.core.rest(cljs.core.next(arglist__3352));
      return G__3348__delegate.call(this, coll, x, xs)
    };
    return G__3348
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__3345.call(this, coll, x);
      default:
        return conj__3346.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__3346.cljs$lang$applyTo;
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
  var nth__3353 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__3354 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__3353.call(this, coll, n);
      case 3:
        return nth__3354.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__3356 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__3357 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__3356.call(this, o, k);
      case 3:
        return get__3357.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__3360 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__3361 = function() {
    var G__3363__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__3359 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__3364 = ret__3359;
          var G__3365 = cljs.core.first.call(null, kvs);
          var G__3366 = cljs.core.second.call(null, kvs);
          var G__3367 = cljs.core.nnext.call(null, kvs);
          coll = G__3364;
          k = G__3365;
          v = G__3366;
          kvs = G__3367;
          continue
        }else {
          return ret__3359
        }
        break
      }
    };
    var G__3363 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__3363__delegate.call(this, coll, k, v, kvs)
    };
    G__3363.cljs$lang$maxFixedArity = 3;
    G__3363.cljs$lang$applyTo = function(arglist__3368) {
      var coll = cljs.core.first(arglist__3368);
      var k = cljs.core.first(cljs.core.next(arglist__3368));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3368)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3368)));
      return G__3363__delegate.call(this, coll, k, v, kvs)
    };
    return G__3363
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__3360.call(this, coll, k, v);
      default:
        return assoc__3361.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__3361.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__3370 = function(coll) {
    return coll
  };
  var dissoc__3371 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__3372 = function() {
    var G__3374__delegate = function(coll, k, ks) {
      while(true) {
        var ret__3369 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__3375 = ret__3369;
          var G__3376 = cljs.core.first.call(null, ks);
          var G__3377 = cljs.core.next.call(null, ks);
          coll = G__3375;
          k = G__3376;
          ks = G__3377;
          continue
        }else {
          return ret__3369
        }
        break
      }
    };
    var G__3374 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3374__delegate.call(this, coll, k, ks)
    };
    G__3374.cljs$lang$maxFixedArity = 2;
    G__3374.cljs$lang$applyTo = function(arglist__3378) {
      var coll = cljs.core.first(arglist__3378);
      var k = cljs.core.first(cljs.core.next(arglist__3378));
      var ks = cljs.core.rest(cljs.core.next(arglist__3378));
      return G__3374__delegate.call(this, coll, k, ks)
    };
    return G__3374
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__3370.call(this, coll);
      case 2:
        return dissoc__3371.call(this, coll, k);
      default:
        return dissoc__3372.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__3372.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__450__auto____3379 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____3380 = x__450__auto____3379;
      if(cljs.core.truth_(and__3546__auto____3380)) {
        var and__3546__auto____3381 = x__450__auto____3379.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____3381)) {
          return cljs.core.not.call(null, x__450__auto____3379.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____3381
        }
      }else {
        return and__3546__auto____3380
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____3379)
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
  var disj__3383 = function(coll) {
    return coll
  };
  var disj__3384 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__3385 = function() {
    var G__3387__delegate = function(coll, k, ks) {
      while(true) {
        var ret__3382 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__3388 = ret__3382;
          var G__3389 = cljs.core.first.call(null, ks);
          var G__3390 = cljs.core.next.call(null, ks);
          coll = G__3388;
          k = G__3389;
          ks = G__3390;
          continue
        }else {
          return ret__3382
        }
        break
      }
    };
    var G__3387 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3387__delegate.call(this, coll, k, ks)
    };
    G__3387.cljs$lang$maxFixedArity = 2;
    G__3387.cljs$lang$applyTo = function(arglist__3391) {
      var coll = cljs.core.first(arglist__3391);
      var k = cljs.core.first(cljs.core.next(arglist__3391));
      var ks = cljs.core.rest(cljs.core.next(arglist__3391));
      return G__3387__delegate.call(this, coll, k, ks)
    };
    return G__3387
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__3383.call(this, coll);
      case 2:
        return disj__3384.call(this, coll, k);
      default:
        return disj__3385.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__3385.cljs$lang$applyTo;
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
    var x__450__auto____3392 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____3393 = x__450__auto____3392;
      if(cljs.core.truth_(and__3546__auto____3393)) {
        var and__3546__auto____3394 = x__450__auto____3392.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____3394)) {
          return cljs.core.not.call(null, x__450__auto____3392.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____3394
        }
      }else {
        return and__3546__auto____3393
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__450__auto____3392)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____3395 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____3396 = x__450__auto____3395;
      if(cljs.core.truth_(and__3546__auto____3396)) {
        var and__3546__auto____3397 = x__450__auto____3395.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____3397)) {
          return cljs.core.not.call(null, x__450__auto____3395.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____3397
        }
      }else {
        return and__3546__auto____3396
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__450__auto____3395)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__450__auto____3398 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____3399 = x__450__auto____3398;
    if(cljs.core.truth_(and__3546__auto____3399)) {
      var and__3546__auto____3400 = x__450__auto____3398.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____3400)) {
        return cljs.core.not.call(null, x__450__auto____3398.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____3400
      }
    }else {
      return and__3546__auto____3399
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__450__auto____3398)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__450__auto____3401 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____3402 = x__450__auto____3401;
    if(cljs.core.truth_(and__3546__auto____3402)) {
      var and__3546__auto____3403 = x__450__auto____3401.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____3403)) {
        return cljs.core.not.call(null, x__450__auto____3401.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____3403
      }
    }else {
      return and__3546__auto____3402
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__450__auto____3401)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__450__auto____3404 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____3405 = x__450__auto____3404;
    if(cljs.core.truth_(and__3546__auto____3405)) {
      var and__3546__auto____3406 = x__450__auto____3404.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____3406)) {
        return cljs.core.not.call(null, x__450__auto____3404.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____3406
      }
    }else {
      return and__3546__auto____3405
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__450__auto____3404)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____3407 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____3408 = x__450__auto____3407;
      if(cljs.core.truth_(and__3546__auto____3408)) {
        var and__3546__auto____3409 = x__450__auto____3407.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____3409)) {
          return cljs.core.not.call(null, x__450__auto____3407.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____3409
        }
      }else {
        return and__3546__auto____3408
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__450__auto____3407)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__450__auto____3410 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____3411 = x__450__auto____3410;
    if(cljs.core.truth_(and__3546__auto____3411)) {
      var and__3546__auto____3412 = x__450__auto____3410.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____3412)) {
        return cljs.core.not.call(null, x__450__auto____3410.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____3412
      }
    }else {
      return and__3546__auto____3411
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__450__auto____3410)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__3413 = cljs.core.array.call(null);
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__3413.push(key)
  });
  return keys__3413
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
    var x__450__auto____3414 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____3415 = x__450__auto____3414;
      if(cljs.core.truth_(and__3546__auto____3415)) {
        var and__3546__auto____3416 = x__450__auto____3414.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____3416)) {
          return cljs.core.not.call(null, x__450__auto____3414.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____3416
        }
      }else {
        return and__3546__auto____3415
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__450__auto____3414)
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
  var and__3546__auto____3417 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____3417)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____3418 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____3418)) {
        return or__3548__auto____3418
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____3417
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____3419 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____3419)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____3419
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____3420 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____3420)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____3420
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____3421 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____3421)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____3421
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
    var and__3546__auto____3422 = coll;
    if(cljs.core.truth_(and__3546__auto____3422)) {
      var and__3546__auto____3423 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____3423)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____3423
      }
    }else {
      return and__3546__auto____3422
    }
  }())) {
    return cljs.core.Vector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___3428 = function(x) {
    return true
  };
  var distinct_QMARK___3429 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___3430 = function() {
    var G__3432__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__3424 = cljs.core.set([y, x]);
        var xs__3425 = more;
        while(true) {
          var x__3426 = cljs.core.first.call(null, xs__3425);
          var etc__3427 = cljs.core.next.call(null, xs__3425);
          if(cljs.core.truth_(xs__3425)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__3424, x__3426))) {
              return false
            }else {
              var G__3433 = cljs.core.conj.call(null, s__3424, x__3426);
              var G__3434 = etc__3427;
              s__3424 = G__3433;
              xs__3425 = G__3434;
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
    var G__3432 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3432__delegate.call(this, x, y, more)
    };
    G__3432.cljs$lang$maxFixedArity = 2;
    G__3432.cljs$lang$applyTo = function(arglist__3435) {
      var x = cljs.core.first(arglist__3435);
      var y = cljs.core.first(cljs.core.next(arglist__3435));
      var more = cljs.core.rest(cljs.core.next(arglist__3435));
      return G__3432__delegate.call(this, x, y, more)
    };
    return G__3432
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___3428.call(this, x);
      case 2:
        return distinct_QMARK___3429.call(this, x, y);
      default:
        return distinct_QMARK___3430.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___3430.cljs$lang$applyTo;
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
      var r__3436 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__3436))) {
        return r__3436
      }else {
        if(cljs.core.truth_(r__3436)) {
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
  var sort__3438 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__3439 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__3437 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__3437, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__3437)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__3438.call(this, comp);
      case 2:
        return sort__3439.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__3441 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__3442 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__3441.call(this, keyfn, comp);
      case 3:
        return sort_by__3442.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__3444 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__3445 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__3444.call(this, f, val);
      case 3:
        return reduce__3445.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__3451 = function(f, coll) {
    var temp__3695__auto____3447 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____3447)) {
      var s__3448 = temp__3695__auto____3447;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__3448), cljs.core.next.call(null, s__3448))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__3452 = function(f, val, coll) {
    var val__3449 = val;
    var coll__3450 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__3450)) {
        var G__3454 = f.call(null, val__3449, cljs.core.first.call(null, coll__3450));
        var G__3455 = cljs.core.next.call(null, coll__3450);
        val__3449 = G__3454;
        coll__3450 = G__3455;
        continue
      }else {
        return val__3449
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__3451.call(this, f, val);
      case 3:
        return seq_reduce__3452.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__3456 = null;
  var G__3456__3457 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__3456__3458 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__3456 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__3456__3457.call(this, coll, f);
      case 3:
        return G__3456__3458.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3456
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___3460 = function() {
    return 0
  };
  var _PLUS___3461 = function(x) {
    return x
  };
  var _PLUS___3462 = function(x, y) {
    return x + y
  };
  var _PLUS___3463 = function() {
    var G__3465__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__3465 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3465__delegate.call(this, x, y, more)
    };
    G__3465.cljs$lang$maxFixedArity = 2;
    G__3465.cljs$lang$applyTo = function(arglist__3466) {
      var x = cljs.core.first(arglist__3466);
      var y = cljs.core.first(cljs.core.next(arglist__3466));
      var more = cljs.core.rest(cljs.core.next(arglist__3466));
      return G__3465__delegate.call(this, x, y, more)
    };
    return G__3465
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___3460.call(this);
      case 1:
        return _PLUS___3461.call(this, x);
      case 2:
        return _PLUS___3462.call(this, x, y);
      default:
        return _PLUS___3463.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___3463.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___3467 = function(x) {
    return-x
  };
  var ___3468 = function(x, y) {
    return x - y
  };
  var ___3469 = function() {
    var G__3471__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__3471 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3471__delegate.call(this, x, y, more)
    };
    G__3471.cljs$lang$maxFixedArity = 2;
    G__3471.cljs$lang$applyTo = function(arglist__3472) {
      var x = cljs.core.first(arglist__3472);
      var y = cljs.core.first(cljs.core.next(arglist__3472));
      var more = cljs.core.rest(cljs.core.next(arglist__3472));
      return G__3471__delegate.call(this, x, y, more)
    };
    return G__3471
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___3467.call(this, x);
      case 2:
        return ___3468.call(this, x, y);
      default:
        return ___3469.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___3469.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___3473 = function() {
    return 1
  };
  var _STAR___3474 = function(x) {
    return x
  };
  var _STAR___3475 = function(x, y) {
    return x * y
  };
  var _STAR___3476 = function() {
    var G__3478__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__3478 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3478__delegate.call(this, x, y, more)
    };
    G__3478.cljs$lang$maxFixedArity = 2;
    G__3478.cljs$lang$applyTo = function(arglist__3479) {
      var x = cljs.core.first(arglist__3479);
      var y = cljs.core.first(cljs.core.next(arglist__3479));
      var more = cljs.core.rest(cljs.core.next(arglist__3479));
      return G__3478__delegate.call(this, x, y, more)
    };
    return G__3478
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___3473.call(this);
      case 1:
        return _STAR___3474.call(this, x);
      case 2:
        return _STAR___3475.call(this, x, y);
      default:
        return _STAR___3476.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___3476.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___3480 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___3481 = function(x, y) {
    return x / y
  };
  var _SLASH___3482 = function() {
    var G__3484__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__3484 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3484__delegate.call(this, x, y, more)
    };
    G__3484.cljs$lang$maxFixedArity = 2;
    G__3484.cljs$lang$applyTo = function(arglist__3485) {
      var x = cljs.core.first(arglist__3485);
      var y = cljs.core.first(cljs.core.next(arglist__3485));
      var more = cljs.core.rest(cljs.core.next(arglist__3485));
      return G__3484__delegate.call(this, x, y, more)
    };
    return G__3484
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___3480.call(this, x);
      case 2:
        return _SLASH___3481.call(this, x, y);
      default:
        return _SLASH___3482.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___3482.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___3486 = function(x) {
    return true
  };
  var _LT___3487 = function(x, y) {
    return x < y
  };
  var _LT___3488 = function() {
    var G__3490__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__3491 = y;
            var G__3492 = cljs.core.first.call(null, more);
            var G__3493 = cljs.core.next.call(null, more);
            x = G__3491;
            y = G__3492;
            more = G__3493;
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
    var G__3490 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3490__delegate.call(this, x, y, more)
    };
    G__3490.cljs$lang$maxFixedArity = 2;
    G__3490.cljs$lang$applyTo = function(arglist__3494) {
      var x = cljs.core.first(arglist__3494);
      var y = cljs.core.first(cljs.core.next(arglist__3494));
      var more = cljs.core.rest(cljs.core.next(arglist__3494));
      return G__3490__delegate.call(this, x, y, more)
    };
    return G__3490
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___3486.call(this, x);
      case 2:
        return _LT___3487.call(this, x, y);
      default:
        return _LT___3488.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___3488.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___3495 = function(x) {
    return true
  };
  var _LT__EQ___3496 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___3497 = function() {
    var G__3499__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__3500 = y;
            var G__3501 = cljs.core.first.call(null, more);
            var G__3502 = cljs.core.next.call(null, more);
            x = G__3500;
            y = G__3501;
            more = G__3502;
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
    var G__3499 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3499__delegate.call(this, x, y, more)
    };
    G__3499.cljs$lang$maxFixedArity = 2;
    G__3499.cljs$lang$applyTo = function(arglist__3503) {
      var x = cljs.core.first(arglist__3503);
      var y = cljs.core.first(cljs.core.next(arglist__3503));
      var more = cljs.core.rest(cljs.core.next(arglist__3503));
      return G__3499__delegate.call(this, x, y, more)
    };
    return G__3499
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___3495.call(this, x);
      case 2:
        return _LT__EQ___3496.call(this, x, y);
      default:
        return _LT__EQ___3497.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___3497.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___3504 = function(x) {
    return true
  };
  var _GT___3505 = function(x, y) {
    return x > y
  };
  var _GT___3506 = function() {
    var G__3508__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__3509 = y;
            var G__3510 = cljs.core.first.call(null, more);
            var G__3511 = cljs.core.next.call(null, more);
            x = G__3509;
            y = G__3510;
            more = G__3511;
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
    var G__3508 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3508__delegate.call(this, x, y, more)
    };
    G__3508.cljs$lang$maxFixedArity = 2;
    G__3508.cljs$lang$applyTo = function(arglist__3512) {
      var x = cljs.core.first(arglist__3512);
      var y = cljs.core.first(cljs.core.next(arglist__3512));
      var more = cljs.core.rest(cljs.core.next(arglist__3512));
      return G__3508__delegate.call(this, x, y, more)
    };
    return G__3508
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___3504.call(this, x);
      case 2:
        return _GT___3505.call(this, x, y);
      default:
        return _GT___3506.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___3506.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___3513 = function(x) {
    return true
  };
  var _GT__EQ___3514 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___3515 = function() {
    var G__3517__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__3518 = y;
            var G__3519 = cljs.core.first.call(null, more);
            var G__3520 = cljs.core.next.call(null, more);
            x = G__3518;
            y = G__3519;
            more = G__3520;
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
    var G__3517 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3517__delegate.call(this, x, y, more)
    };
    G__3517.cljs$lang$maxFixedArity = 2;
    G__3517.cljs$lang$applyTo = function(arglist__3521) {
      var x = cljs.core.first(arglist__3521);
      var y = cljs.core.first(cljs.core.next(arglist__3521));
      var more = cljs.core.rest(cljs.core.next(arglist__3521));
      return G__3517__delegate.call(this, x, y, more)
    };
    return G__3517
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___3513.call(this, x);
      case 2:
        return _GT__EQ___3514.call(this, x, y);
      default:
        return _GT__EQ___3515.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___3515.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__3522 = function(x) {
    return x
  };
  var max__3523 = function(x, y) {
    return x > y ? x : y
  };
  var max__3524 = function() {
    var G__3526__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__3526 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3526__delegate.call(this, x, y, more)
    };
    G__3526.cljs$lang$maxFixedArity = 2;
    G__3526.cljs$lang$applyTo = function(arglist__3527) {
      var x = cljs.core.first(arglist__3527);
      var y = cljs.core.first(cljs.core.next(arglist__3527));
      var more = cljs.core.rest(cljs.core.next(arglist__3527));
      return G__3526__delegate.call(this, x, y, more)
    };
    return G__3526
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__3522.call(this, x);
      case 2:
        return max__3523.call(this, x, y);
      default:
        return max__3524.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__3524.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__3528 = function(x) {
    return x
  };
  var min__3529 = function(x, y) {
    return x < y ? x : y
  };
  var min__3530 = function() {
    var G__3532__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__3532 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3532__delegate.call(this, x, y, more)
    };
    G__3532.cljs$lang$maxFixedArity = 2;
    G__3532.cljs$lang$applyTo = function(arglist__3533) {
      var x = cljs.core.first(arglist__3533);
      var y = cljs.core.first(cljs.core.next(arglist__3533));
      var more = cljs.core.rest(cljs.core.next(arglist__3533));
      return G__3532__delegate.call(this, x, y, more)
    };
    return G__3532
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__3528.call(this, x);
      case 2:
        return min__3529.call(this, x, y);
      default:
        return min__3530.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__3530.cljs$lang$applyTo;
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
  var rem__3534 = n % d;
  return cljs.core.fix.call(null, (n - rem__3534) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__3535 = cljs.core.quot.call(null, n, d);
  return n - d * q__3535
};
cljs.core.rand = function() {
  var rand = null;
  var rand__3536 = function() {
    return Math.random.call(null)
  };
  var rand__3537 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__3536.call(this);
      case 1:
        return rand__3537.call(this, n)
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
  var _EQ__EQ___3539 = function(x) {
    return true
  };
  var _EQ__EQ___3540 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___3541 = function() {
    var G__3543__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__3544 = y;
            var G__3545 = cljs.core.first.call(null, more);
            var G__3546 = cljs.core.next.call(null, more);
            x = G__3544;
            y = G__3545;
            more = G__3546;
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
    var G__3543 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3543__delegate.call(this, x, y, more)
    };
    G__3543.cljs$lang$maxFixedArity = 2;
    G__3543.cljs$lang$applyTo = function(arglist__3547) {
      var x = cljs.core.first(arglist__3547);
      var y = cljs.core.first(cljs.core.next(arglist__3547));
      var more = cljs.core.rest(cljs.core.next(arglist__3547));
      return G__3543__delegate.call(this, x, y, more)
    };
    return G__3543
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___3539.call(this, x);
      case 2:
        return _EQ__EQ___3540.call(this, x, y);
      default:
        return _EQ__EQ___3541.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___3541.cljs$lang$applyTo;
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
  var n__3548 = n;
  var xs__3549 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3550 = xs__3549;
      if(cljs.core.truth_(and__3546__auto____3550)) {
        return n__3548 > 0
      }else {
        return and__3546__auto____3550
      }
    }())) {
      var G__3551 = n__3548 - 1;
      var G__3552 = cljs.core.next.call(null, xs__3549);
      n__3548 = G__3551;
      xs__3549 = G__3552;
      continue
    }else {
      return xs__3549
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__3557 = null;
  var G__3557__3558 = function(coll, n) {
    var temp__3695__auto____3553 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____3553)) {
      var xs__3554 = temp__3695__auto____3553;
      return cljs.core.first.call(null, xs__3554)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__3557__3559 = function(coll, n, not_found) {
    var temp__3695__auto____3555 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____3555)) {
      var xs__3556 = temp__3695__auto____3555;
      return cljs.core.first.call(null, xs__3556)
    }else {
      return not_found
    }
  };
  G__3557 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3557__3558.call(this, coll, n);
      case 3:
        return G__3557__3559.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3557
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___3561 = function() {
    return""
  };
  var str_STAR___3562 = function(x) {
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
  var str_STAR___3563 = function() {
    var G__3565__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__3566 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__3567 = cljs.core.next.call(null, more);
            sb = G__3566;
            more = G__3567;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__3565 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__3565__delegate.call(this, x, ys)
    };
    G__3565.cljs$lang$maxFixedArity = 1;
    G__3565.cljs$lang$applyTo = function(arglist__3568) {
      var x = cljs.core.first(arglist__3568);
      var ys = cljs.core.rest(arglist__3568);
      return G__3565__delegate.call(this, x, ys)
    };
    return G__3565
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___3561.call(this);
      case 1:
        return str_STAR___3562.call(this, x);
      default:
        return str_STAR___3563.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___3563.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__3569 = function() {
    return""
  };
  var str__3570 = function(x) {
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
  var str__3571 = function() {
    var G__3573__delegate = function(x, ys) {
      return cljs.core.apply.call(null, cljs.core.str_STAR_, x, ys)
    };
    var G__3573 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__3573__delegate.call(this, x, ys)
    };
    G__3573.cljs$lang$maxFixedArity = 1;
    G__3573.cljs$lang$applyTo = function(arglist__3574) {
      var x = cljs.core.first(arglist__3574);
      var ys = cljs.core.rest(arglist__3574);
      return G__3573__delegate.call(this, x, ys)
    };
    return G__3573
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__3569.call(this);
      case 1:
        return str__3570.call(this, x);
      default:
        return str__3571.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__3571.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__3575 = function(s, start) {
    return s.substring(start)
  };
  var subs__3576 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__3575.call(this, s, start);
      case 3:
        return subs__3576.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__3578 = function(name) {
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
  var symbol__3579 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__3578.call(this, ns);
      case 2:
        return symbol__3579.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__3581 = function(name) {
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
  var keyword__3582 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__3581.call(this, ns);
      case 2:
        return keyword__3582.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__3584 = cljs.core.seq.call(null, x);
    var ys__3585 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__3584 === null)) {
        return ys__3585 === null
      }else {
        if(cljs.core.truth_(ys__3585 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__3584), cljs.core.first.call(null, ys__3585)))) {
            var G__3586 = cljs.core.next.call(null, xs__3584);
            var G__3587 = cljs.core.next.call(null, ys__3585);
            xs__3584 = G__3586;
            ys__3585 = G__3587;
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
  return cljs.core.reduce.call(null, function(p1__3588_SHARP_, p2__3589_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__3588_SHARP_, cljs.core.hash.call(null, p2__3589_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__3590__3591 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__3590__3591)) {
    var G__3593__3595 = cljs.core.first.call(null, G__3590__3591);
    var vec__3594__3596 = G__3593__3595;
    var key_name__3597 = cljs.core.nth.call(null, vec__3594__3596, 0, null);
    var f__3598 = cljs.core.nth.call(null, vec__3594__3596, 1, null);
    var G__3590__3599 = G__3590__3591;
    var G__3593__3600 = G__3593__3595;
    var G__3590__3601 = G__3590__3599;
    while(true) {
      var vec__3602__3603 = G__3593__3600;
      var key_name__3604 = cljs.core.nth.call(null, vec__3602__3603, 0, null);
      var f__3605 = cljs.core.nth.call(null, vec__3602__3603, 1, null);
      var G__3590__3606 = G__3590__3601;
      var str_name__3607 = cljs.core.name.call(null, key_name__3604);
      obj[str_name__3607] = f__3605;
      var temp__3698__auto____3608 = cljs.core.next.call(null, G__3590__3606);
      if(cljs.core.truth_(temp__3698__auto____3608)) {
        var G__3590__3609 = temp__3698__auto____3608;
        var G__3610 = cljs.core.first.call(null, G__3590__3609);
        var G__3611 = G__3590__3609;
        G__3593__3600 = G__3610;
        G__3590__3601 = G__3611;
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
  var this__3612 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__3613 = this;
  return new cljs.core.List(this__3613.meta, o, coll, this__3613.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__3614 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__3615 = this;
  return this__3615.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__3616 = this;
  return this__3616.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__3617 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__3618 = this;
  return this__3618.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__3619 = this;
  return this__3619.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__3620 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__3621 = this;
  return new cljs.core.List(meta, this__3621.first, this__3621.rest, this__3621.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__3622 = this;
  return this__3622.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__3623 = this;
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
  var this__3624 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__3625 = this;
  return new cljs.core.List(this__3625.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__3626 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__3627 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__3628 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__3629 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__3630 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__3631 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__3632 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__3633 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__3634 = this;
  return this__3634.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__3635 = this;
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
  list.cljs$lang$applyTo = function(arglist__3636) {
    var items = cljs.core.seq(arglist__3636);
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
  var this__3637 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__3638 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__3639 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__3640 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__3640.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__3641 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__3642 = this;
  return this__3642.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__3643 = this;
  if(cljs.core.truth_(this__3643.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__3643.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__3644 = this;
  return this__3644.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__3645 = this;
  return new cljs.core.Cons(meta, this__3645.first, this__3645.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__3646 = null;
  var G__3646__3647 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__3646__3648 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__3646 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__3646__3647.call(this, string, f);
      case 3:
        return G__3646__3648.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3646
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__3650 = null;
  var G__3650__3651 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__3650__3652 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__3650 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3650__3651.call(this, string, k);
      case 3:
        return G__3650__3652.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3650
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__3654 = null;
  var G__3654__3655 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__3654__3656 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__3654 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3654__3655.call(this, string, n);
      case 3:
        return G__3654__3656.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3654
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
  var G__3664 = null;
  var G__3664__3665 = function(tsym3658, coll) {
    var tsym3658__3660 = this;
    var this$__3661 = tsym3658__3660;
    return cljs.core.get.call(null, coll, this$__3661.toString())
  };
  var G__3664__3666 = function(tsym3659, coll, not_found) {
    var tsym3659__3662 = this;
    var this$__3663 = tsym3659__3662;
    return cljs.core.get.call(null, coll, this$__3663.toString(), not_found)
  };
  G__3664 = function(tsym3659, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__3664__3665.call(this, tsym3659, coll);
      case 3:
        return G__3664__3666.call(this, tsym3659, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__3664
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__3668 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__3668
  }else {
    lazy_seq.x = x__3668.call(null);
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
  var this__3669 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__3670 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__3671 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__3672 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__3672.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__3673 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__3674 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__3675 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__3676 = this;
  return this__3676.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__3677 = this;
  return new cljs.core.LazySeq(meta, this__3677.realized, this__3677.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__3678 = cljs.core.array.call(null);
  var s__3679 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__3679))) {
      ary__3678.push(cljs.core.first.call(null, s__3679));
      var G__3680 = cljs.core.next.call(null, s__3679);
      s__3679 = G__3680;
      continue
    }else {
      return ary__3678
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__3681 = s;
  var i__3682 = n;
  var sum__3683 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____3684 = i__3682 > 0;
      if(cljs.core.truth_(and__3546__auto____3684)) {
        return cljs.core.seq.call(null, s__3681)
      }else {
        return and__3546__auto____3684
      }
    }())) {
      var G__3685 = cljs.core.next.call(null, s__3681);
      var G__3686 = i__3682 - 1;
      var G__3687 = sum__3683 + 1;
      s__3681 = G__3685;
      i__3682 = G__3686;
      sum__3683 = G__3687;
      continue
    }else {
      return sum__3683
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
  var concat__3691 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__3692 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__3693 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__3688 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__3688)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__3688), concat.call(null, cljs.core.rest.call(null, s__3688), y))
      }else {
        return y
      }
    })
  };
  var concat__3694 = function() {
    var G__3696__delegate = function(x, y, zs) {
      var cat__3690 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__3689 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__3689)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__3689), cat.call(null, cljs.core.rest.call(null, xys__3689), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__3690.call(null, concat.call(null, x, y), zs)
    };
    var G__3696 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3696__delegate.call(this, x, y, zs)
    };
    G__3696.cljs$lang$maxFixedArity = 2;
    G__3696.cljs$lang$applyTo = function(arglist__3697) {
      var x = cljs.core.first(arglist__3697);
      var y = cljs.core.first(cljs.core.next(arglist__3697));
      var zs = cljs.core.rest(cljs.core.next(arglist__3697));
      return G__3696__delegate.call(this, x, y, zs)
    };
    return G__3696
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__3691.call(this);
      case 1:
        return concat__3692.call(this, x);
      case 2:
        return concat__3693.call(this, x, y);
      default:
        return concat__3694.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__3694.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___3698 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___3699 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___3700 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___3701 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___3702 = function() {
    var G__3704__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__3704 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__3704__delegate.call(this, a, b, c, d, more)
    };
    G__3704.cljs$lang$maxFixedArity = 4;
    G__3704.cljs$lang$applyTo = function(arglist__3705) {
      var a = cljs.core.first(arglist__3705);
      var b = cljs.core.first(cljs.core.next(arglist__3705));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3705)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3705))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3705))));
      return G__3704__delegate.call(this, a, b, c, d, more)
    };
    return G__3704
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___3698.call(this, a);
      case 2:
        return list_STAR___3699.call(this, a, b);
      case 3:
        return list_STAR___3700.call(this, a, b, c);
      case 4:
        return list_STAR___3701.call(this, a, b, c, d);
      default:
        return list_STAR___3702.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___3702.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__3715 = function(f, args) {
    var fixed_arity__3706 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__3706 + 1) <= fixed_arity__3706)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__3716 = function(f, x, args) {
    var arglist__3707 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__3708 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__3707, fixed_arity__3708) <= fixed_arity__3708)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__3707))
      }else {
        return f.cljs$lang$applyTo(arglist__3707)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__3707))
    }
  };
  var apply__3717 = function(f, x, y, args) {
    var arglist__3709 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__3710 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__3709, fixed_arity__3710) <= fixed_arity__3710)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__3709))
      }else {
        return f.cljs$lang$applyTo(arglist__3709)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__3709))
    }
  };
  var apply__3718 = function(f, x, y, z, args) {
    var arglist__3711 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__3712 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__3711, fixed_arity__3712) <= fixed_arity__3712)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__3711))
      }else {
        return f.cljs$lang$applyTo(arglist__3711)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__3711))
    }
  };
  var apply__3719 = function() {
    var G__3721__delegate = function(f, a, b, c, d, args) {
      var arglist__3713 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__3714 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__3713, fixed_arity__3714) <= fixed_arity__3714)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__3713))
        }else {
          return f.cljs$lang$applyTo(arglist__3713)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__3713))
      }
    };
    var G__3721 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__3721__delegate.call(this, f, a, b, c, d, args)
    };
    G__3721.cljs$lang$maxFixedArity = 5;
    G__3721.cljs$lang$applyTo = function(arglist__3722) {
      var f = cljs.core.first(arglist__3722);
      var a = cljs.core.first(cljs.core.next(arglist__3722));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3722)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3722))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3722)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3722)))));
      return G__3721__delegate.call(this, f, a, b, c, d, args)
    };
    return G__3721
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__3715.call(this, f, a);
      case 3:
        return apply__3716.call(this, f, a, b);
      case 4:
        return apply__3717.call(this, f, a, b, c);
      case 5:
        return apply__3718.call(this, f, a, b, c, d);
      default:
        return apply__3719.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__3719.cljs$lang$applyTo;
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
  vary_meta.cljs$lang$applyTo = function(arglist__3723) {
    var obj = cljs.core.first(arglist__3723);
    var f = cljs.core.first(cljs.core.next(arglist__3723));
    var args = cljs.core.rest(cljs.core.next(arglist__3723));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___3724 = function(x) {
    return false
  };
  var not_EQ___3725 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___3726 = function() {
    var G__3728__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__3728 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__3728__delegate.call(this, x, y, more)
    };
    G__3728.cljs$lang$maxFixedArity = 2;
    G__3728.cljs$lang$applyTo = function(arglist__3729) {
      var x = cljs.core.first(arglist__3729);
      var y = cljs.core.first(cljs.core.next(arglist__3729));
      var more = cljs.core.rest(cljs.core.next(arglist__3729));
      return G__3728__delegate.call(this, x, y, more)
    };
    return G__3728
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___3724.call(this, x);
      case 2:
        return not_EQ___3725.call(this, x, y);
      default:
        return not_EQ___3726.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___3726.cljs$lang$applyTo;
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
        var G__3730 = pred;
        var G__3731 = cljs.core.next.call(null, coll);
        pred = G__3730;
        coll = G__3731;
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
      var or__3548__auto____3732 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____3732)) {
        return or__3548__auto____3732
      }else {
        var G__3733 = pred;
        var G__3734 = cljs.core.next.call(null, coll);
        pred = G__3733;
        coll = G__3734;
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
    var G__3735 = null;
    var G__3735__3736 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__3735__3737 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__3735__3738 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__3735__3739 = function() {
      var G__3741__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__3741 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__3741__delegate.call(this, x, y, zs)
      };
      G__3741.cljs$lang$maxFixedArity = 2;
      G__3741.cljs$lang$applyTo = function(arglist__3742) {
        var x = cljs.core.first(arglist__3742);
        var y = cljs.core.first(cljs.core.next(arglist__3742));
        var zs = cljs.core.rest(cljs.core.next(arglist__3742));
        return G__3741__delegate.call(this, x, y, zs)
      };
      return G__3741
    }();
    G__3735 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__3735__3736.call(this);
        case 1:
          return G__3735__3737.call(this, x);
        case 2:
          return G__3735__3738.call(this, x, y);
        default:
          return G__3735__3739.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__3735.cljs$lang$maxFixedArity = 2;
    G__3735.cljs$lang$applyTo = G__3735__3739.cljs$lang$applyTo;
    return G__3735
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__3743__delegate = function(args) {
      return x
    };
    var G__3743 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__3743__delegate.call(this, args)
    };
    G__3743.cljs$lang$maxFixedArity = 0;
    G__3743.cljs$lang$applyTo = function(arglist__3744) {
      var args = cljs.core.seq(arglist__3744);
      return G__3743__delegate.call(this, args)
    };
    return G__3743
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__3748 = function() {
    return cljs.core.identity
  };
  var comp__3749 = function(f) {
    return f
  };
  var comp__3750 = function(f, g) {
    return function() {
      var G__3754 = null;
      var G__3754__3755 = function() {
        return f.call(null, g.call(null))
      };
      var G__3754__3756 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__3754__3757 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__3754__3758 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__3754__3759 = function() {
        var G__3761__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__3761 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3761__delegate.call(this, x, y, z, args)
        };
        G__3761.cljs$lang$maxFixedArity = 3;
        G__3761.cljs$lang$applyTo = function(arglist__3762) {
          var x = cljs.core.first(arglist__3762);
          var y = cljs.core.first(cljs.core.next(arglist__3762));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3762)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3762)));
          return G__3761__delegate.call(this, x, y, z, args)
        };
        return G__3761
      }();
      G__3754 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__3754__3755.call(this);
          case 1:
            return G__3754__3756.call(this, x);
          case 2:
            return G__3754__3757.call(this, x, y);
          case 3:
            return G__3754__3758.call(this, x, y, z);
          default:
            return G__3754__3759.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__3754.cljs$lang$maxFixedArity = 3;
      G__3754.cljs$lang$applyTo = G__3754__3759.cljs$lang$applyTo;
      return G__3754
    }()
  };
  var comp__3751 = function(f, g, h) {
    return function() {
      var G__3763 = null;
      var G__3763__3764 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__3763__3765 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__3763__3766 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__3763__3767 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__3763__3768 = function() {
        var G__3770__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__3770 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3770__delegate.call(this, x, y, z, args)
        };
        G__3770.cljs$lang$maxFixedArity = 3;
        G__3770.cljs$lang$applyTo = function(arglist__3771) {
          var x = cljs.core.first(arglist__3771);
          var y = cljs.core.first(cljs.core.next(arglist__3771));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3771)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3771)));
          return G__3770__delegate.call(this, x, y, z, args)
        };
        return G__3770
      }();
      G__3763 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__3763__3764.call(this);
          case 1:
            return G__3763__3765.call(this, x);
          case 2:
            return G__3763__3766.call(this, x, y);
          case 3:
            return G__3763__3767.call(this, x, y, z);
          default:
            return G__3763__3768.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__3763.cljs$lang$maxFixedArity = 3;
      G__3763.cljs$lang$applyTo = G__3763__3768.cljs$lang$applyTo;
      return G__3763
    }()
  };
  var comp__3752 = function() {
    var G__3772__delegate = function(f1, f2, f3, fs) {
      var fs__3745 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__3773__delegate = function(args) {
          var ret__3746 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__3745), args);
          var fs__3747 = cljs.core.next.call(null, fs__3745);
          while(true) {
            if(cljs.core.truth_(fs__3747)) {
              var G__3774 = cljs.core.first.call(null, fs__3747).call(null, ret__3746);
              var G__3775 = cljs.core.next.call(null, fs__3747);
              ret__3746 = G__3774;
              fs__3747 = G__3775;
              continue
            }else {
              return ret__3746
            }
            break
          }
        };
        var G__3773 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__3773__delegate.call(this, args)
        };
        G__3773.cljs$lang$maxFixedArity = 0;
        G__3773.cljs$lang$applyTo = function(arglist__3776) {
          var args = cljs.core.seq(arglist__3776);
          return G__3773__delegate.call(this, args)
        };
        return G__3773
      }()
    };
    var G__3772 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__3772__delegate.call(this, f1, f2, f3, fs)
    };
    G__3772.cljs$lang$maxFixedArity = 3;
    G__3772.cljs$lang$applyTo = function(arglist__3777) {
      var f1 = cljs.core.first(arglist__3777);
      var f2 = cljs.core.first(cljs.core.next(arglist__3777));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3777)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3777)));
      return G__3772__delegate.call(this, f1, f2, f3, fs)
    };
    return G__3772
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__3748.call(this);
      case 1:
        return comp__3749.call(this, f1);
      case 2:
        return comp__3750.call(this, f1, f2);
      case 3:
        return comp__3751.call(this, f1, f2, f3);
      default:
        return comp__3752.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__3752.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__3778 = function(f, arg1) {
    return function() {
      var G__3783__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__3783 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__3783__delegate.call(this, args)
      };
      G__3783.cljs$lang$maxFixedArity = 0;
      G__3783.cljs$lang$applyTo = function(arglist__3784) {
        var args = cljs.core.seq(arglist__3784);
        return G__3783__delegate.call(this, args)
      };
      return G__3783
    }()
  };
  var partial__3779 = function(f, arg1, arg2) {
    return function() {
      var G__3785__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__3785 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__3785__delegate.call(this, args)
      };
      G__3785.cljs$lang$maxFixedArity = 0;
      G__3785.cljs$lang$applyTo = function(arglist__3786) {
        var args = cljs.core.seq(arglist__3786);
        return G__3785__delegate.call(this, args)
      };
      return G__3785
    }()
  };
  var partial__3780 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__3787__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__3787 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__3787__delegate.call(this, args)
      };
      G__3787.cljs$lang$maxFixedArity = 0;
      G__3787.cljs$lang$applyTo = function(arglist__3788) {
        var args = cljs.core.seq(arglist__3788);
        return G__3787__delegate.call(this, args)
      };
      return G__3787
    }()
  };
  var partial__3781 = function() {
    var G__3789__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__3790__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__3790 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__3790__delegate.call(this, args)
        };
        G__3790.cljs$lang$maxFixedArity = 0;
        G__3790.cljs$lang$applyTo = function(arglist__3791) {
          var args = cljs.core.seq(arglist__3791);
          return G__3790__delegate.call(this, args)
        };
        return G__3790
      }()
    };
    var G__3789 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__3789__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__3789.cljs$lang$maxFixedArity = 4;
    G__3789.cljs$lang$applyTo = function(arglist__3792) {
      var f = cljs.core.first(arglist__3792);
      var arg1 = cljs.core.first(cljs.core.next(arglist__3792));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3792)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3792))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3792))));
      return G__3789__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__3789
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__3778.call(this, f, arg1);
      case 3:
        return partial__3779.call(this, f, arg1, arg2);
      case 4:
        return partial__3780.call(this, f, arg1, arg2, arg3);
      default:
        return partial__3781.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__3781.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__3793 = function(f, x) {
    return function() {
      var G__3797 = null;
      var G__3797__3798 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__3797__3799 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__3797__3800 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__3797__3801 = function() {
        var G__3803__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__3803 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3803__delegate.call(this, a, b, c, ds)
        };
        G__3803.cljs$lang$maxFixedArity = 3;
        G__3803.cljs$lang$applyTo = function(arglist__3804) {
          var a = cljs.core.first(arglist__3804);
          var b = cljs.core.first(cljs.core.next(arglist__3804));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3804)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3804)));
          return G__3803__delegate.call(this, a, b, c, ds)
        };
        return G__3803
      }();
      G__3797 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__3797__3798.call(this, a);
          case 2:
            return G__3797__3799.call(this, a, b);
          case 3:
            return G__3797__3800.call(this, a, b, c);
          default:
            return G__3797__3801.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__3797.cljs$lang$maxFixedArity = 3;
      G__3797.cljs$lang$applyTo = G__3797__3801.cljs$lang$applyTo;
      return G__3797
    }()
  };
  var fnil__3794 = function(f, x, y) {
    return function() {
      var G__3805 = null;
      var G__3805__3806 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__3805__3807 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__3805__3808 = function() {
        var G__3810__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__3810 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3810__delegate.call(this, a, b, c, ds)
        };
        G__3810.cljs$lang$maxFixedArity = 3;
        G__3810.cljs$lang$applyTo = function(arglist__3811) {
          var a = cljs.core.first(arglist__3811);
          var b = cljs.core.first(cljs.core.next(arglist__3811));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3811)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3811)));
          return G__3810__delegate.call(this, a, b, c, ds)
        };
        return G__3810
      }();
      G__3805 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__3805__3806.call(this, a, b);
          case 3:
            return G__3805__3807.call(this, a, b, c);
          default:
            return G__3805__3808.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__3805.cljs$lang$maxFixedArity = 3;
      G__3805.cljs$lang$applyTo = G__3805__3808.cljs$lang$applyTo;
      return G__3805
    }()
  };
  var fnil__3795 = function(f, x, y, z) {
    return function() {
      var G__3812 = null;
      var G__3812__3813 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__3812__3814 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__3812__3815 = function() {
        var G__3817__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__3817 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3817__delegate.call(this, a, b, c, ds)
        };
        G__3817.cljs$lang$maxFixedArity = 3;
        G__3817.cljs$lang$applyTo = function(arglist__3818) {
          var a = cljs.core.first(arglist__3818);
          var b = cljs.core.first(cljs.core.next(arglist__3818));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3818)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3818)));
          return G__3817__delegate.call(this, a, b, c, ds)
        };
        return G__3817
      }();
      G__3812 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__3812__3813.call(this, a, b);
          case 3:
            return G__3812__3814.call(this, a, b, c);
          default:
            return G__3812__3815.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__3812.cljs$lang$maxFixedArity = 3;
      G__3812.cljs$lang$applyTo = G__3812__3815.cljs$lang$applyTo;
      return G__3812
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__3793.call(this, f, x);
      case 3:
        return fnil__3794.call(this, f, x, y);
      case 4:
        return fnil__3795.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__3821 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____3819 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____3819)) {
        var s__3820 = temp__3698__auto____3819;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__3820)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__3820)))
      }else {
        return null
      }
    })
  };
  return mapi__3821.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____3822 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____3822)) {
      var s__3823 = temp__3698__auto____3822;
      var x__3824 = f.call(null, cljs.core.first.call(null, s__3823));
      if(cljs.core.truth_(x__3824 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__3823))
      }else {
        return cljs.core.cons.call(null, x__3824, keep.call(null, f, cljs.core.rest.call(null, s__3823)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__3834 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____3831 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____3831)) {
        var s__3832 = temp__3698__auto____3831;
        var x__3833 = f.call(null, idx, cljs.core.first.call(null, s__3832));
        if(cljs.core.truth_(x__3833 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__3832))
        }else {
          return cljs.core.cons.call(null, x__3833, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__3832)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__3834.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__3879 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__3884 = function() {
        return true
      };
      var ep1__3885 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__3886 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3841 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3841)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____3841
          }
        }())
      };
      var ep1__3887 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3842 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3842)) {
            var and__3546__auto____3843 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____3843)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____3843
            }
          }else {
            return and__3546__auto____3842
          }
        }())
      };
      var ep1__3888 = function() {
        var G__3890__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____3844 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____3844)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____3844
            }
          }())
        };
        var G__3890 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3890__delegate.call(this, x, y, z, args)
        };
        G__3890.cljs$lang$maxFixedArity = 3;
        G__3890.cljs$lang$applyTo = function(arglist__3891) {
          var x = cljs.core.first(arglist__3891);
          var y = cljs.core.first(cljs.core.next(arglist__3891));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3891)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3891)));
          return G__3890__delegate.call(this, x, y, z, args)
        };
        return G__3890
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__3884.call(this);
          case 1:
            return ep1__3885.call(this, x);
          case 2:
            return ep1__3886.call(this, x, y);
          case 3:
            return ep1__3887.call(this, x, y, z);
          default:
            return ep1__3888.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__3888.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__3880 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__3892 = function() {
        return true
      };
      var ep2__3893 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3845 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3845)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____3845
          }
        }())
      };
      var ep2__3894 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3846 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3846)) {
            var and__3546__auto____3847 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____3847)) {
              var and__3546__auto____3848 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____3848)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____3848
              }
            }else {
              return and__3546__auto____3847
            }
          }else {
            return and__3546__auto____3846
          }
        }())
      };
      var ep2__3895 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3849 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3849)) {
            var and__3546__auto____3850 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____3850)) {
              var and__3546__auto____3851 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____3851)) {
                var and__3546__auto____3852 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____3852)) {
                  var and__3546__auto____3853 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____3853)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____3853
                  }
                }else {
                  return and__3546__auto____3852
                }
              }else {
                return and__3546__auto____3851
              }
            }else {
              return and__3546__auto____3850
            }
          }else {
            return and__3546__auto____3849
          }
        }())
      };
      var ep2__3896 = function() {
        var G__3898__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____3854 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____3854)) {
              return cljs.core.every_QMARK_.call(null, function(p1__3825_SHARP_) {
                var and__3546__auto____3855 = p1.call(null, p1__3825_SHARP_);
                if(cljs.core.truth_(and__3546__auto____3855)) {
                  return p2.call(null, p1__3825_SHARP_)
                }else {
                  return and__3546__auto____3855
                }
              }, args)
            }else {
              return and__3546__auto____3854
            }
          }())
        };
        var G__3898 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3898__delegate.call(this, x, y, z, args)
        };
        G__3898.cljs$lang$maxFixedArity = 3;
        G__3898.cljs$lang$applyTo = function(arglist__3899) {
          var x = cljs.core.first(arglist__3899);
          var y = cljs.core.first(cljs.core.next(arglist__3899));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3899)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3899)));
          return G__3898__delegate.call(this, x, y, z, args)
        };
        return G__3898
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__3892.call(this);
          case 1:
            return ep2__3893.call(this, x);
          case 2:
            return ep2__3894.call(this, x, y);
          case 3:
            return ep2__3895.call(this, x, y, z);
          default:
            return ep2__3896.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__3896.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__3881 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__3900 = function() {
        return true
      };
      var ep3__3901 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3856 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3856)) {
            var and__3546__auto____3857 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____3857)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____3857
            }
          }else {
            return and__3546__auto____3856
          }
        }())
      };
      var ep3__3902 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3858 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3858)) {
            var and__3546__auto____3859 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____3859)) {
              var and__3546__auto____3860 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____3860)) {
                var and__3546__auto____3861 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____3861)) {
                  var and__3546__auto____3862 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____3862)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____3862
                  }
                }else {
                  return and__3546__auto____3861
                }
              }else {
                return and__3546__auto____3860
              }
            }else {
              return and__3546__auto____3859
            }
          }else {
            return and__3546__auto____3858
          }
        }())
      };
      var ep3__3903 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____3863 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____3863)) {
            var and__3546__auto____3864 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____3864)) {
              var and__3546__auto____3865 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____3865)) {
                var and__3546__auto____3866 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____3866)) {
                  var and__3546__auto____3867 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____3867)) {
                    var and__3546__auto____3868 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____3868)) {
                      var and__3546__auto____3869 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____3869)) {
                        var and__3546__auto____3870 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____3870)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____3870
                        }
                      }else {
                        return and__3546__auto____3869
                      }
                    }else {
                      return and__3546__auto____3868
                    }
                  }else {
                    return and__3546__auto____3867
                  }
                }else {
                  return and__3546__auto____3866
                }
              }else {
                return and__3546__auto____3865
              }
            }else {
              return and__3546__auto____3864
            }
          }else {
            return and__3546__auto____3863
          }
        }())
      };
      var ep3__3904 = function() {
        var G__3906__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____3871 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____3871)) {
              return cljs.core.every_QMARK_.call(null, function(p1__3826_SHARP_) {
                var and__3546__auto____3872 = p1.call(null, p1__3826_SHARP_);
                if(cljs.core.truth_(and__3546__auto____3872)) {
                  var and__3546__auto____3873 = p2.call(null, p1__3826_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____3873)) {
                    return p3.call(null, p1__3826_SHARP_)
                  }else {
                    return and__3546__auto____3873
                  }
                }else {
                  return and__3546__auto____3872
                }
              }, args)
            }else {
              return and__3546__auto____3871
            }
          }())
        };
        var G__3906 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3906__delegate.call(this, x, y, z, args)
        };
        G__3906.cljs$lang$maxFixedArity = 3;
        G__3906.cljs$lang$applyTo = function(arglist__3907) {
          var x = cljs.core.first(arglist__3907);
          var y = cljs.core.first(cljs.core.next(arglist__3907));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3907)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3907)));
          return G__3906__delegate.call(this, x, y, z, args)
        };
        return G__3906
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__3900.call(this);
          case 1:
            return ep3__3901.call(this, x);
          case 2:
            return ep3__3902.call(this, x, y);
          case 3:
            return ep3__3903.call(this, x, y, z);
          default:
            return ep3__3904.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__3904.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__3882 = function() {
    var G__3908__delegate = function(p1, p2, p3, ps) {
      var ps__3874 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__3909 = function() {
          return true
        };
        var epn__3910 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__3827_SHARP_) {
            return p1__3827_SHARP_.call(null, x)
          }, ps__3874)
        };
        var epn__3911 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__3828_SHARP_) {
            var and__3546__auto____3875 = p1__3828_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____3875)) {
              return p1__3828_SHARP_.call(null, y)
            }else {
              return and__3546__auto____3875
            }
          }, ps__3874)
        };
        var epn__3912 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__3829_SHARP_) {
            var and__3546__auto____3876 = p1__3829_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____3876)) {
              var and__3546__auto____3877 = p1__3829_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____3877)) {
                return p1__3829_SHARP_.call(null, z)
              }else {
                return and__3546__auto____3877
              }
            }else {
              return and__3546__auto____3876
            }
          }, ps__3874)
        };
        var epn__3913 = function() {
          var G__3915__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____3878 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____3878)) {
                return cljs.core.every_QMARK_.call(null, function(p1__3830_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__3830_SHARP_, args)
                }, ps__3874)
              }else {
                return and__3546__auto____3878
              }
            }())
          };
          var G__3915 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__3915__delegate.call(this, x, y, z, args)
          };
          G__3915.cljs$lang$maxFixedArity = 3;
          G__3915.cljs$lang$applyTo = function(arglist__3916) {
            var x = cljs.core.first(arglist__3916);
            var y = cljs.core.first(cljs.core.next(arglist__3916));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3916)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3916)));
            return G__3915__delegate.call(this, x, y, z, args)
          };
          return G__3915
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__3909.call(this);
            case 1:
              return epn__3910.call(this, x);
            case 2:
              return epn__3911.call(this, x, y);
            case 3:
              return epn__3912.call(this, x, y, z);
            default:
              return epn__3913.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__3913.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__3908 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__3908__delegate.call(this, p1, p2, p3, ps)
    };
    G__3908.cljs$lang$maxFixedArity = 3;
    G__3908.cljs$lang$applyTo = function(arglist__3917) {
      var p1 = cljs.core.first(arglist__3917);
      var p2 = cljs.core.first(cljs.core.next(arglist__3917));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3917)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3917)));
      return G__3908__delegate.call(this, p1, p2, p3, ps)
    };
    return G__3908
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__3879.call(this, p1);
      case 2:
        return every_pred__3880.call(this, p1, p2);
      case 3:
        return every_pred__3881.call(this, p1, p2, p3);
      default:
        return every_pred__3882.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__3882.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__3957 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__3962 = function() {
        return null
      };
      var sp1__3963 = function(x) {
        return p.call(null, x)
      };
      var sp1__3964 = function(x, y) {
        var or__3548__auto____3919 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3919)) {
          return or__3548__auto____3919
        }else {
          return p.call(null, y)
        }
      };
      var sp1__3965 = function(x, y, z) {
        var or__3548__auto____3920 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3920)) {
          return or__3548__auto____3920
        }else {
          var or__3548__auto____3921 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____3921)) {
            return or__3548__auto____3921
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__3966 = function() {
        var G__3968__delegate = function(x, y, z, args) {
          var or__3548__auto____3922 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____3922)) {
            return or__3548__auto____3922
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__3968 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3968__delegate.call(this, x, y, z, args)
        };
        G__3968.cljs$lang$maxFixedArity = 3;
        G__3968.cljs$lang$applyTo = function(arglist__3969) {
          var x = cljs.core.first(arglist__3969);
          var y = cljs.core.first(cljs.core.next(arglist__3969));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3969)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3969)));
          return G__3968__delegate.call(this, x, y, z, args)
        };
        return G__3968
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__3962.call(this);
          case 1:
            return sp1__3963.call(this, x);
          case 2:
            return sp1__3964.call(this, x, y);
          case 3:
            return sp1__3965.call(this, x, y, z);
          default:
            return sp1__3966.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__3966.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__3958 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__3970 = function() {
        return null
      };
      var sp2__3971 = function(x) {
        var or__3548__auto____3923 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3923)) {
          return or__3548__auto____3923
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__3972 = function(x, y) {
        var or__3548__auto____3924 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3924)) {
          return or__3548__auto____3924
        }else {
          var or__3548__auto____3925 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____3925)) {
            return or__3548__auto____3925
          }else {
            var or__3548__auto____3926 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____3926)) {
              return or__3548__auto____3926
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__3973 = function(x, y, z) {
        var or__3548__auto____3927 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3927)) {
          return or__3548__auto____3927
        }else {
          var or__3548__auto____3928 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____3928)) {
            return or__3548__auto____3928
          }else {
            var or__3548__auto____3929 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____3929)) {
              return or__3548__auto____3929
            }else {
              var or__3548__auto____3930 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____3930)) {
                return or__3548__auto____3930
              }else {
                var or__3548__auto____3931 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____3931)) {
                  return or__3548__auto____3931
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__3974 = function() {
        var G__3976__delegate = function(x, y, z, args) {
          var or__3548__auto____3932 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____3932)) {
            return or__3548__auto____3932
          }else {
            return cljs.core.some.call(null, function(p1__3835_SHARP_) {
              var or__3548__auto____3933 = p1.call(null, p1__3835_SHARP_);
              if(cljs.core.truth_(or__3548__auto____3933)) {
                return or__3548__auto____3933
              }else {
                return p2.call(null, p1__3835_SHARP_)
              }
            }, args)
          }
        };
        var G__3976 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3976__delegate.call(this, x, y, z, args)
        };
        G__3976.cljs$lang$maxFixedArity = 3;
        G__3976.cljs$lang$applyTo = function(arglist__3977) {
          var x = cljs.core.first(arglist__3977);
          var y = cljs.core.first(cljs.core.next(arglist__3977));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3977)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3977)));
          return G__3976__delegate.call(this, x, y, z, args)
        };
        return G__3976
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__3970.call(this);
          case 1:
            return sp2__3971.call(this, x);
          case 2:
            return sp2__3972.call(this, x, y);
          case 3:
            return sp2__3973.call(this, x, y, z);
          default:
            return sp2__3974.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__3974.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__3959 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__3978 = function() {
        return null
      };
      var sp3__3979 = function(x) {
        var or__3548__auto____3934 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3934)) {
          return or__3548__auto____3934
        }else {
          var or__3548__auto____3935 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____3935)) {
            return or__3548__auto____3935
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__3980 = function(x, y) {
        var or__3548__auto____3936 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3936)) {
          return or__3548__auto____3936
        }else {
          var or__3548__auto____3937 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____3937)) {
            return or__3548__auto____3937
          }else {
            var or__3548__auto____3938 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____3938)) {
              return or__3548__auto____3938
            }else {
              var or__3548__auto____3939 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____3939)) {
                return or__3548__auto____3939
              }else {
                var or__3548__auto____3940 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____3940)) {
                  return or__3548__auto____3940
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__3981 = function(x, y, z) {
        var or__3548__auto____3941 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____3941)) {
          return or__3548__auto____3941
        }else {
          var or__3548__auto____3942 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____3942)) {
            return or__3548__auto____3942
          }else {
            var or__3548__auto____3943 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____3943)) {
              return or__3548__auto____3943
            }else {
              var or__3548__auto____3944 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____3944)) {
                return or__3548__auto____3944
              }else {
                var or__3548__auto____3945 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____3945)) {
                  return or__3548__auto____3945
                }else {
                  var or__3548__auto____3946 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____3946)) {
                    return or__3548__auto____3946
                  }else {
                    var or__3548__auto____3947 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____3947)) {
                      return or__3548__auto____3947
                    }else {
                      var or__3548__auto____3948 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____3948)) {
                        return or__3548__auto____3948
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
      var sp3__3982 = function() {
        var G__3984__delegate = function(x, y, z, args) {
          var or__3548__auto____3949 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____3949)) {
            return or__3548__auto____3949
          }else {
            return cljs.core.some.call(null, function(p1__3836_SHARP_) {
              var or__3548__auto____3950 = p1.call(null, p1__3836_SHARP_);
              if(cljs.core.truth_(or__3548__auto____3950)) {
                return or__3548__auto____3950
              }else {
                var or__3548__auto____3951 = p2.call(null, p1__3836_SHARP_);
                if(cljs.core.truth_(or__3548__auto____3951)) {
                  return or__3548__auto____3951
                }else {
                  return p3.call(null, p1__3836_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__3984 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__3984__delegate.call(this, x, y, z, args)
        };
        G__3984.cljs$lang$maxFixedArity = 3;
        G__3984.cljs$lang$applyTo = function(arglist__3985) {
          var x = cljs.core.first(arglist__3985);
          var y = cljs.core.first(cljs.core.next(arglist__3985));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3985)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3985)));
          return G__3984__delegate.call(this, x, y, z, args)
        };
        return G__3984
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__3978.call(this);
          case 1:
            return sp3__3979.call(this, x);
          case 2:
            return sp3__3980.call(this, x, y);
          case 3:
            return sp3__3981.call(this, x, y, z);
          default:
            return sp3__3982.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__3982.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__3960 = function() {
    var G__3986__delegate = function(p1, p2, p3, ps) {
      var ps__3952 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__3987 = function() {
          return null
        };
        var spn__3988 = function(x) {
          return cljs.core.some.call(null, function(p1__3837_SHARP_) {
            return p1__3837_SHARP_.call(null, x)
          }, ps__3952)
        };
        var spn__3989 = function(x, y) {
          return cljs.core.some.call(null, function(p1__3838_SHARP_) {
            var or__3548__auto____3953 = p1__3838_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____3953)) {
              return or__3548__auto____3953
            }else {
              return p1__3838_SHARP_.call(null, y)
            }
          }, ps__3952)
        };
        var spn__3990 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__3839_SHARP_) {
            var or__3548__auto____3954 = p1__3839_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____3954)) {
              return or__3548__auto____3954
            }else {
              var or__3548__auto____3955 = p1__3839_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____3955)) {
                return or__3548__auto____3955
              }else {
                return p1__3839_SHARP_.call(null, z)
              }
            }
          }, ps__3952)
        };
        var spn__3991 = function() {
          var G__3993__delegate = function(x, y, z, args) {
            var or__3548__auto____3956 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____3956)) {
              return or__3548__auto____3956
            }else {
              return cljs.core.some.call(null, function(p1__3840_SHARP_) {
                return cljs.core.some.call(null, p1__3840_SHARP_, args)
              }, ps__3952)
            }
          };
          var G__3993 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__3993__delegate.call(this, x, y, z, args)
          };
          G__3993.cljs$lang$maxFixedArity = 3;
          G__3993.cljs$lang$applyTo = function(arglist__3994) {
            var x = cljs.core.first(arglist__3994);
            var y = cljs.core.first(cljs.core.next(arglist__3994));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3994)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3994)));
            return G__3993__delegate.call(this, x, y, z, args)
          };
          return G__3993
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__3987.call(this);
            case 1:
              return spn__3988.call(this, x);
            case 2:
              return spn__3989.call(this, x, y);
            case 3:
              return spn__3990.call(this, x, y, z);
            default:
              return spn__3991.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__3991.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__3986 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__3986__delegate.call(this, p1, p2, p3, ps)
    };
    G__3986.cljs$lang$maxFixedArity = 3;
    G__3986.cljs$lang$applyTo = function(arglist__3995) {
      var p1 = cljs.core.first(arglist__3995);
      var p2 = cljs.core.first(cljs.core.next(arglist__3995));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3995)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3995)));
      return G__3986__delegate.call(this, p1, p2, p3, ps)
    };
    return G__3986
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__3957.call(this, p1);
      case 2:
        return some_fn__3958.call(this, p1, p2);
      case 3:
        return some_fn__3959.call(this, p1, p2, p3);
      default:
        return some_fn__3960.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__3960.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__4008 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____3996 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____3996)) {
        var s__3997 = temp__3698__auto____3996;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__3997)), map.call(null, f, cljs.core.rest.call(null, s__3997)))
      }else {
        return null
      }
    })
  };
  var map__4009 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__3998 = cljs.core.seq.call(null, c1);
      var s2__3999 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____4000 = s1__3998;
        if(cljs.core.truth_(and__3546__auto____4000)) {
          return s2__3999
        }else {
          return and__3546__auto____4000
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__3998), cljs.core.first.call(null, s2__3999)), map.call(null, f, cljs.core.rest.call(null, s1__3998), cljs.core.rest.call(null, s2__3999)))
      }else {
        return null
      }
    })
  };
  var map__4010 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__4001 = cljs.core.seq.call(null, c1);
      var s2__4002 = cljs.core.seq.call(null, c2);
      var s3__4003 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____4004 = s1__4001;
        if(cljs.core.truth_(and__3546__auto____4004)) {
          var and__3546__auto____4005 = s2__4002;
          if(cljs.core.truth_(and__3546__auto____4005)) {
            return s3__4003
          }else {
            return and__3546__auto____4005
          }
        }else {
          return and__3546__auto____4004
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__4001), cljs.core.first.call(null, s2__4002), cljs.core.first.call(null, s3__4003)), map.call(null, f, cljs.core.rest.call(null, s1__4001), cljs.core.rest.call(null, s2__4002), cljs.core.rest.call(null, s3__4003)))
      }else {
        return null
      }
    })
  };
  var map__4011 = function() {
    var G__4013__delegate = function(f, c1, c2, c3, colls) {
      var step__4007 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__4006 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__4006))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__4006), step.call(null, map.call(null, cljs.core.rest, ss__4006)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__3918_SHARP_) {
        return cljs.core.apply.call(null, f, p1__3918_SHARP_)
      }, step__4007.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__4013 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__4013__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__4013.cljs$lang$maxFixedArity = 4;
    G__4013.cljs$lang$applyTo = function(arglist__4014) {
      var f = cljs.core.first(arglist__4014);
      var c1 = cljs.core.first(cljs.core.next(arglist__4014));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4014)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4014))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4014))));
      return G__4013__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__4013
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__4008.call(this, f, c1);
      case 3:
        return map__4009.call(this, f, c1, c2);
      case 4:
        return map__4010.call(this, f, c1, c2, c3);
      default:
        return map__4011.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__4011.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____4015 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____4015)) {
        var s__4016 = temp__3698__auto____4015;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__4016), take.call(null, n - 1, cljs.core.rest.call(null, s__4016)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__4019 = function(n, coll) {
    while(true) {
      var s__4017 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____4018 = n > 0;
        if(cljs.core.truth_(and__3546__auto____4018)) {
          return s__4017
        }else {
          return and__3546__auto____4018
        }
      }())) {
        var G__4020 = n - 1;
        var G__4021 = cljs.core.rest.call(null, s__4017);
        n = G__4020;
        coll = G__4021;
        continue
      }else {
        return s__4017
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__4019.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__4022 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__4023 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__4022.call(this, n);
      case 2:
        return drop_last__4023.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__4025 = cljs.core.seq.call(null, coll);
  var lead__4026 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__4026)) {
      var G__4027 = cljs.core.next.call(null, s__4025);
      var G__4028 = cljs.core.next.call(null, lead__4026);
      s__4025 = G__4027;
      lead__4026 = G__4028;
      continue
    }else {
      return s__4025
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__4031 = function(pred, coll) {
    while(true) {
      var s__4029 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____4030 = s__4029;
        if(cljs.core.truth_(and__3546__auto____4030)) {
          return pred.call(null, cljs.core.first.call(null, s__4029))
        }else {
          return and__3546__auto____4030
        }
      }())) {
        var G__4032 = pred;
        var G__4033 = cljs.core.rest.call(null, s__4029);
        pred = G__4032;
        coll = G__4033;
        continue
      }else {
        return s__4029
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__4031.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____4034 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____4034)) {
      var s__4035 = temp__3698__auto____4034;
      return cljs.core.concat.call(null, s__4035, cycle.call(null, s__4035))
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
  var repeat__4036 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__4037 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__4036.call(this, n);
      case 2:
        return repeat__4037.call(this, n, x)
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
  var repeatedly__4039 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__4040 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__4039.call(this, n);
      case 2:
        return repeatedly__4040.call(this, n, f)
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
  var interleave__4046 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__4042 = cljs.core.seq.call(null, c1);
      var s2__4043 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____4044 = s1__4042;
        if(cljs.core.truth_(and__3546__auto____4044)) {
          return s2__4043
        }else {
          return and__3546__auto____4044
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__4042), cljs.core.cons.call(null, cljs.core.first.call(null, s2__4043), interleave.call(null, cljs.core.rest.call(null, s1__4042), cljs.core.rest.call(null, s2__4043))))
      }else {
        return null
      }
    })
  };
  var interleave__4047 = function() {
    var G__4049__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__4045 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__4045))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__4045), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__4045)))
        }else {
          return null
        }
      })
    };
    var G__4049 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4049__delegate.call(this, c1, c2, colls)
    };
    G__4049.cljs$lang$maxFixedArity = 2;
    G__4049.cljs$lang$applyTo = function(arglist__4050) {
      var c1 = cljs.core.first(arglist__4050);
      var c2 = cljs.core.first(cljs.core.next(arglist__4050));
      var colls = cljs.core.rest(cljs.core.next(arglist__4050));
      return G__4049__delegate.call(this, c1, c2, colls)
    };
    return G__4049
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__4046.call(this, c1, c2);
      default:
        return interleave__4047.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__4047.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__4053 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____4051 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____4051)) {
        var coll__4052 = temp__3695__auto____4051;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__4052), cat.call(null, cljs.core.rest.call(null, coll__4052), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__4053.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__4054 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__4055 = function() {
    var G__4057__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__4057 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4057__delegate.call(this, f, coll, colls)
    };
    G__4057.cljs$lang$maxFixedArity = 2;
    G__4057.cljs$lang$applyTo = function(arglist__4058) {
      var f = cljs.core.first(arglist__4058);
      var coll = cljs.core.first(cljs.core.next(arglist__4058));
      var colls = cljs.core.rest(cljs.core.next(arglist__4058));
      return G__4057__delegate.call(this, f, coll, colls)
    };
    return G__4057
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__4054.call(this, f, coll);
      default:
        return mapcat__4055.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__4055.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____4059 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____4059)) {
      var s__4060 = temp__3698__auto____4059;
      var f__4061 = cljs.core.first.call(null, s__4060);
      var r__4062 = cljs.core.rest.call(null, s__4060);
      if(cljs.core.truth_(pred.call(null, f__4061))) {
        return cljs.core.cons.call(null, f__4061, filter.call(null, pred, r__4062))
      }else {
        return filter.call(null, pred, r__4062)
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
  var walk__4064 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__4064.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__4063_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__4063_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__4071 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__4072 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____4065 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____4065)) {
        var s__4066 = temp__3698__auto____4065;
        var p__4067 = cljs.core.take.call(null, n, s__4066);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__4067)))) {
          return cljs.core.cons.call(null, p__4067, partition.call(null, n, step, cljs.core.drop.call(null, step, s__4066)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__4073 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____4068 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____4068)) {
        var s__4069 = temp__3698__auto____4068;
        var p__4070 = cljs.core.take.call(null, n, s__4069);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__4070)))) {
          return cljs.core.cons.call(null, p__4070, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__4069)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__4070, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__4071.call(this, n, step);
      case 3:
        return partition__4072.call(this, n, step, pad);
      case 4:
        return partition__4073.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__4079 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__4080 = function(m, ks, not_found) {
    var sentinel__4075 = cljs.core.lookup_sentinel;
    var m__4076 = m;
    var ks__4077 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__4077)) {
        var m__4078 = cljs.core.get.call(null, m__4076, cljs.core.first.call(null, ks__4077), sentinel__4075);
        if(cljs.core.truth_(sentinel__4075 === m__4078)) {
          return not_found
        }else {
          var G__4082 = sentinel__4075;
          var G__4083 = m__4078;
          var G__4084 = cljs.core.next.call(null, ks__4077);
          sentinel__4075 = G__4082;
          m__4076 = G__4083;
          ks__4077 = G__4084;
          continue
        }
      }else {
        return m__4076
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__4079.call(this, m, ks);
      case 3:
        return get_in__4080.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__4085, v) {
  var vec__4086__4087 = p__4085;
  var k__4088 = cljs.core.nth.call(null, vec__4086__4087, 0, null);
  var ks__4089 = cljs.core.nthnext.call(null, vec__4086__4087, 1);
  if(cljs.core.truth_(ks__4089)) {
    return cljs.core.assoc.call(null, m, k__4088, assoc_in.call(null, cljs.core.get.call(null, m, k__4088), ks__4089, v))
  }else {
    return cljs.core.assoc.call(null, m, k__4088, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__4090, f, args) {
    var vec__4091__4092 = p__4090;
    var k__4093 = cljs.core.nth.call(null, vec__4091__4092, 0, null);
    var ks__4094 = cljs.core.nthnext.call(null, vec__4091__4092, 1);
    if(cljs.core.truth_(ks__4094)) {
      return cljs.core.assoc.call(null, m, k__4093, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__4093), ks__4094, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__4093, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__4093), args))
    }
  };
  var update_in = function(m, p__4090, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__4090, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__4095) {
    var m = cljs.core.first(arglist__4095);
    var p__4090 = cljs.core.first(cljs.core.next(arglist__4095));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4095)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4095)));
    return update_in__delegate.call(this, m, p__4090, f, args)
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
  var this__4096 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__4129 = null;
  var G__4129__4130 = function(coll, k) {
    var this__4097 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__4129__4131 = function(coll, k, not_found) {
    var this__4098 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__4129 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4129__4130.call(this, coll, k);
      case 3:
        return G__4129__4131.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4129
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__4099 = this;
  var new_array__4100 = cljs.core.aclone.call(null, this__4099.array);
  new_array__4100[k] = v;
  return new cljs.core.Vector(this__4099.meta, new_array__4100)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__4133 = null;
  var G__4133__4134 = function(tsym4101, k) {
    var this__4103 = this;
    var tsym4101__4104 = this;
    var coll__4105 = tsym4101__4104;
    return cljs.core._lookup.call(null, coll__4105, k)
  };
  var G__4133__4135 = function(tsym4102, k, not_found) {
    var this__4106 = this;
    var tsym4102__4107 = this;
    var coll__4108 = tsym4102__4107;
    return cljs.core._lookup.call(null, coll__4108, k, not_found)
  };
  G__4133 = function(tsym4102, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4133__4134.call(this, tsym4102, k);
      case 3:
        return G__4133__4135.call(this, tsym4102, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4133
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4109 = this;
  var new_array__4110 = cljs.core.aclone.call(null, this__4109.array);
  new_array__4110.push(o);
  return new cljs.core.Vector(this__4109.meta, new_array__4110)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__4137 = null;
  var G__4137__4138 = function(v, f) {
    var this__4111 = this;
    return cljs.core.ci_reduce.call(null, this__4111.array, f)
  };
  var G__4137__4139 = function(v, f, start) {
    var this__4112 = this;
    return cljs.core.ci_reduce.call(null, this__4112.array, f, start)
  };
  G__4137 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4137__4138.call(this, v, f);
      case 3:
        return G__4137__4139.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4137
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__4113 = this;
  if(cljs.core.truth_(this__4113.array.length > 0)) {
    var vector_seq__4114 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__4113.array.length)) {
          return cljs.core.cons.call(null, this__4113.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__4114.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__4115 = this;
  return this__4115.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__4116 = this;
  var count__4117 = this__4116.array.length;
  if(cljs.core.truth_(count__4117 > 0)) {
    return this__4116.array[count__4117 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__4118 = this;
  if(cljs.core.truth_(this__4118.array.length > 0)) {
    var new_array__4119 = cljs.core.aclone.call(null, this__4118.array);
    new_array__4119.pop();
    return new cljs.core.Vector(this__4118.meta, new_array__4119)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__4120 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4121 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4122 = this;
  return new cljs.core.Vector(meta, this__4122.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4123 = this;
  return this__4123.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__4141 = null;
  var G__4141__4142 = function(coll, n) {
    var this__4124 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4125 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____4125)) {
        return n < this__4124.array.length
      }else {
        return and__3546__auto____4125
      }
    }())) {
      return this__4124.array[n]
    }else {
      return null
    }
  };
  var G__4141__4143 = function(coll, n, not_found) {
    var this__4126 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4127 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____4127)) {
        return n < this__4126.array.length
      }else {
        return and__3546__auto____4127
      }
    }())) {
      return this__4126.array[n]
    }else {
      return not_found
    }
  };
  G__4141 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4141__4142.call(this, coll, n);
      case 3:
        return G__4141__4143.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4141
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4128 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__4128.meta)
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
  vector.cljs$lang$applyTo = function(arglist__4145) {
    var args = cljs.core.seq(arglist__4145);
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
  var this__4146 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__4174 = null;
  var G__4174__4175 = function(coll, k) {
    var this__4147 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__4174__4176 = function(coll, k, not_found) {
    var this__4148 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__4174 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4174__4175.call(this, coll, k);
      case 3:
        return G__4174__4176.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4174
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__4149 = this;
  var v_pos__4150 = this__4149.start + key;
  return new cljs.core.Subvec(this__4149.meta, cljs.core._assoc.call(null, this__4149.v, v_pos__4150, val), this__4149.start, this__4149.end > v_pos__4150 + 1 ? this__4149.end : v_pos__4150 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__4178 = null;
  var G__4178__4179 = function(tsym4151, k) {
    var this__4153 = this;
    var tsym4151__4154 = this;
    var coll__4155 = tsym4151__4154;
    return cljs.core._lookup.call(null, coll__4155, k)
  };
  var G__4178__4180 = function(tsym4152, k, not_found) {
    var this__4156 = this;
    var tsym4152__4157 = this;
    var coll__4158 = tsym4152__4157;
    return cljs.core._lookup.call(null, coll__4158, k, not_found)
  };
  G__4178 = function(tsym4152, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4178__4179.call(this, tsym4152, k);
      case 3:
        return G__4178__4180.call(this, tsym4152, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4178
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4159 = this;
  return new cljs.core.Subvec(this__4159.meta, cljs.core._assoc_n.call(null, this__4159.v, this__4159.end, o), this__4159.start, this__4159.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__4182 = null;
  var G__4182__4183 = function(coll, f) {
    var this__4160 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__4182__4184 = function(coll, f, start) {
    var this__4161 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__4182 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4182__4183.call(this, coll, f);
      case 3:
        return G__4182__4184.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4182
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__4162 = this;
  var subvec_seq__4163 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__4162.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__4162.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__4163.call(null, this__4162.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__4164 = this;
  return this__4164.end - this__4164.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__4165 = this;
  return cljs.core._nth.call(null, this__4165.v, this__4165.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__4166 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__4166.start, this__4166.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__4166.meta, this__4166.v, this__4166.start, this__4166.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__4167 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4168 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4169 = this;
  return new cljs.core.Subvec(meta, this__4169.v, this__4169.start, this__4169.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4170 = this;
  return this__4170.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__4186 = null;
  var G__4186__4187 = function(coll, n) {
    var this__4171 = this;
    return cljs.core._nth.call(null, this__4171.v, this__4171.start + n)
  };
  var G__4186__4188 = function(coll, n, not_found) {
    var this__4172 = this;
    return cljs.core._nth.call(null, this__4172.v, this__4172.start + n, not_found)
  };
  G__4186 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4186__4187.call(this, coll, n);
      case 3:
        return G__4186__4188.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4186
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4173 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__4173.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__4190 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__4191 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__4190.call(this, v, start);
      case 3:
        return subvec__4191.call(this, v, start, end)
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
  var this__4193 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__4194 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4195 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4196 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__4196.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4197 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__4198 = this;
  return cljs.core._first.call(null, this__4198.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__4199 = this;
  var temp__3695__auto____4200 = cljs.core.next.call(null, this__4199.front);
  if(cljs.core.truth_(temp__3695__auto____4200)) {
    var f1__4201 = temp__3695__auto____4200;
    return new cljs.core.PersistentQueueSeq(this__4199.meta, f1__4201, this__4199.rear)
  }else {
    if(cljs.core.truth_(this__4199.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__4199.meta, this__4199.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4202 = this;
  return this__4202.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4203 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__4203.front, this__4203.rear)
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
  var this__4204 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4205 = this;
  if(cljs.core.truth_(this__4205.front)) {
    return new cljs.core.PersistentQueue(this__4205.meta, this__4205.count + 1, this__4205.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____4206 = this__4205.rear;
      if(cljs.core.truth_(or__3548__auto____4206)) {
        return or__3548__auto____4206
      }else {
        return cljs.core.Vector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__4205.meta, this__4205.count + 1, cljs.core.conj.call(null, this__4205.front, o), cljs.core.Vector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__4207 = this;
  var rear__4208 = cljs.core.seq.call(null, this__4207.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____4209 = this__4207.front;
    if(cljs.core.truth_(or__3548__auto____4209)) {
      return or__3548__auto____4209
    }else {
      return rear__4208
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__4207.front, cljs.core.seq.call(null, rear__4208))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__4210 = this;
  return this__4210.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__4211 = this;
  return cljs.core._first.call(null, this__4211.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__4212 = this;
  if(cljs.core.truth_(this__4212.front)) {
    var temp__3695__auto____4213 = cljs.core.next.call(null, this__4212.front);
    if(cljs.core.truth_(temp__3695__auto____4213)) {
      var f1__4214 = temp__3695__auto____4213;
      return new cljs.core.PersistentQueue(this__4212.meta, this__4212.count - 1, f1__4214, this__4212.rear)
    }else {
      return new cljs.core.PersistentQueue(this__4212.meta, this__4212.count - 1, cljs.core.seq.call(null, this__4212.rear), cljs.core.Vector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__4215 = this;
  return cljs.core.first.call(null, this__4215.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__4216 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4217 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4218 = this;
  return new cljs.core.PersistentQueue(meta, this__4218.count, this__4218.front, this__4218.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4219 = this;
  return this__4219.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4220 = this;
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
  var this__4221 = this;
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
  var len__4222 = array.length;
  var i__4223 = 0;
  while(true) {
    if(cljs.core.truth_(i__4223 < len__4222)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__4223]))) {
        return i__4223
      }else {
        var G__4224 = i__4223 + incr;
        i__4223 = G__4224;
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
  var obj_map_contains_key_QMARK___4226 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___4227 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4225 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____4225)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____4225
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
        return obj_map_contains_key_QMARK___4226.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___4227.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__4230 = cljs.core.hash.call(null, a);
  var b__4231 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__4230 < b__4231)) {
    return-1
  }else {
    if(cljs.core.truth_(a__4230 > b__4231)) {
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
  var this__4232 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__4259 = null;
  var G__4259__4260 = function(coll, k) {
    var this__4233 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__4259__4261 = function(coll, k, not_found) {
    var this__4234 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__4234.strobj, this__4234.strobj[k], not_found)
  };
  G__4259 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4259__4260.call(this, coll, k);
      case 3:
        return G__4259__4261.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4259
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__4235 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__4236 = goog.object.clone.call(null, this__4235.strobj);
    var overwrite_QMARK___4237 = new_strobj__4236.hasOwnProperty(k);
    new_strobj__4236[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___4237)) {
      return new cljs.core.ObjMap(this__4235.meta, this__4235.keys, new_strobj__4236)
    }else {
      var new_keys__4238 = cljs.core.aclone.call(null, this__4235.keys);
      new_keys__4238.push(k);
      return new cljs.core.ObjMap(this__4235.meta, new_keys__4238, new_strobj__4236)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__4235.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__4239 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__4239.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__4263 = null;
  var G__4263__4264 = function(tsym4240, k) {
    var this__4242 = this;
    var tsym4240__4243 = this;
    var coll__4244 = tsym4240__4243;
    return cljs.core._lookup.call(null, coll__4244, k)
  };
  var G__4263__4265 = function(tsym4241, k, not_found) {
    var this__4245 = this;
    var tsym4241__4246 = this;
    var coll__4247 = tsym4241__4246;
    return cljs.core._lookup.call(null, coll__4247, k, not_found)
  };
  G__4263 = function(tsym4241, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4263__4264.call(this, tsym4241, k);
      case 3:
        return G__4263__4265.call(this, tsym4241, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4263
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__4248 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__4249 = this;
  if(cljs.core.truth_(this__4249.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__4229_SHARP_) {
      return cljs.core.vector.call(null, p1__4229_SHARP_, this__4249.strobj[p1__4229_SHARP_])
    }, this__4249.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__4250 = this;
  return this__4250.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4251 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4252 = this;
  return new cljs.core.ObjMap(meta, this__4252.keys, this__4252.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4253 = this;
  return this__4253.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4254 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__4254.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__4255 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4256 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____4256)) {
      return this__4255.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____4256
    }
  }())) {
    var new_keys__4257 = cljs.core.aclone.call(null, this__4255.keys);
    var new_strobj__4258 = goog.object.clone.call(null, this__4255.strobj);
    new_keys__4257.splice(cljs.core.scan_array.call(null, 1, k, new_keys__4257), 1);
    cljs.core.js_delete.call(null, new_strobj__4258, k);
    return new cljs.core.ObjMap(this__4255.meta, new_keys__4257, new_strobj__4258)
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
  var this__4268 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__4306 = null;
  var G__4306__4307 = function(coll, k) {
    var this__4269 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__4306__4308 = function(coll, k, not_found) {
    var this__4270 = this;
    var bucket__4271 = this__4270.hashobj[cljs.core.hash.call(null, k)];
    var i__4272 = cljs.core.truth_(bucket__4271) ? cljs.core.scan_array.call(null, 2, k, bucket__4271) : null;
    if(cljs.core.truth_(i__4272)) {
      return bucket__4271[i__4272 + 1]
    }else {
      return not_found
    }
  };
  G__4306 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4306__4307.call(this, coll, k);
      case 3:
        return G__4306__4308.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4306
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__4273 = this;
  var h__4274 = cljs.core.hash.call(null, k);
  var bucket__4275 = this__4273.hashobj[h__4274];
  if(cljs.core.truth_(bucket__4275)) {
    var new_bucket__4276 = cljs.core.aclone.call(null, bucket__4275);
    var new_hashobj__4277 = goog.object.clone.call(null, this__4273.hashobj);
    new_hashobj__4277[h__4274] = new_bucket__4276;
    var temp__3695__auto____4278 = cljs.core.scan_array.call(null, 2, k, new_bucket__4276);
    if(cljs.core.truth_(temp__3695__auto____4278)) {
      var i__4279 = temp__3695__auto____4278;
      new_bucket__4276[i__4279 + 1] = v;
      return new cljs.core.HashMap(this__4273.meta, this__4273.count, new_hashobj__4277)
    }else {
      new_bucket__4276.push(k, v);
      return new cljs.core.HashMap(this__4273.meta, this__4273.count + 1, new_hashobj__4277)
    }
  }else {
    var new_hashobj__4280 = goog.object.clone.call(null, this__4273.hashobj);
    new_hashobj__4280[h__4274] = cljs.core.array.call(null, k, v);
    return new cljs.core.HashMap(this__4273.meta, this__4273.count + 1, new_hashobj__4280)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__4281 = this;
  var bucket__4282 = this__4281.hashobj[cljs.core.hash.call(null, k)];
  var i__4283 = cljs.core.truth_(bucket__4282) ? cljs.core.scan_array.call(null, 2, k, bucket__4282) : null;
  if(cljs.core.truth_(i__4283)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__4310 = null;
  var G__4310__4311 = function(tsym4284, k) {
    var this__4286 = this;
    var tsym4284__4287 = this;
    var coll__4288 = tsym4284__4287;
    return cljs.core._lookup.call(null, coll__4288, k)
  };
  var G__4310__4312 = function(tsym4285, k, not_found) {
    var this__4289 = this;
    var tsym4285__4290 = this;
    var coll__4291 = tsym4285__4290;
    return cljs.core._lookup.call(null, coll__4291, k, not_found)
  };
  G__4310 = function(tsym4285, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4310__4311.call(this, tsym4285, k);
      case 3:
        return G__4310__4312.call(this, tsym4285, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4310
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__4292 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__4293 = this;
  if(cljs.core.truth_(this__4293.count > 0)) {
    var hashes__4294 = cljs.core.js_keys.call(null, this__4293.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__4267_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__4293.hashobj[p1__4267_SHARP_]))
    }, hashes__4294)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__4295 = this;
  return this__4295.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4296 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4297 = this;
  return new cljs.core.HashMap(meta, this__4297.count, this__4297.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4298 = this;
  return this__4298.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4299 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__4299.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__4300 = this;
  var h__4301 = cljs.core.hash.call(null, k);
  var bucket__4302 = this__4300.hashobj[h__4301];
  var i__4303 = cljs.core.truth_(bucket__4302) ? cljs.core.scan_array.call(null, 2, k, bucket__4302) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__4303))) {
    return coll
  }else {
    var new_hashobj__4304 = goog.object.clone.call(null, this__4300.hashobj);
    if(cljs.core.truth_(3 > bucket__4302.length)) {
      cljs.core.js_delete.call(null, new_hashobj__4304, h__4301)
    }else {
      var new_bucket__4305 = cljs.core.aclone.call(null, bucket__4302);
      new_bucket__4305.splice(i__4303, 2);
      new_hashobj__4304[h__4301] = new_bucket__4305
    }
    return new cljs.core.HashMap(this__4300.meta, this__4300.count - 1, new_hashobj__4304)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__4314 = ks.length;
  var i__4315 = 0;
  var out__4316 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__4315 < len__4314)) {
      var G__4317 = i__4315 + 1;
      var G__4318 = cljs.core.assoc.call(null, out__4316, ks[i__4315], vs[i__4315]);
      i__4315 = G__4317;
      out__4316 = G__4318;
      continue
    }else {
      return out__4316
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__4319 = cljs.core.seq.call(null, keyvals);
    var out__4320 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__4319)) {
        var G__4321 = cljs.core.nnext.call(null, in$__4319);
        var G__4322 = cljs.core.assoc.call(null, out__4320, cljs.core.first.call(null, in$__4319), cljs.core.second.call(null, in$__4319));
        in$__4319 = G__4321;
        out__4320 = G__4322;
        continue
      }else {
        return out__4320
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
  hash_map.cljs$lang$applyTo = function(arglist__4323) {
    var keyvals = cljs.core.seq(arglist__4323);
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
      return cljs.core.reduce.call(null, function(p1__4324_SHARP_, p2__4325_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____4326 = p1__4324_SHARP_;
          if(cljs.core.truth_(or__3548__auto____4326)) {
            return or__3548__auto____4326
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__4325_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__4327) {
    var maps = cljs.core.seq(arglist__4327);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__4330 = function(m, e) {
        var k__4328 = cljs.core.first.call(null, e);
        var v__4329 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__4328))) {
          return cljs.core.assoc.call(null, m, k__4328, f.call(null, cljs.core.get.call(null, m, k__4328), v__4329))
        }else {
          return cljs.core.assoc.call(null, m, k__4328, v__4329)
        }
      };
      var merge2__4332 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__4330, function() {
          var or__3548__auto____4331 = m1;
          if(cljs.core.truth_(or__3548__auto____4331)) {
            return or__3548__auto____4331
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__4332, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__4333) {
    var f = cljs.core.first(arglist__4333);
    var maps = cljs.core.rest(arglist__4333);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__4335 = cljs.core.ObjMap.fromObject([], {});
  var keys__4336 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__4336)) {
      var key__4337 = cljs.core.first.call(null, keys__4336);
      var entry__4338 = cljs.core.get.call(null, map, key__4337, "\ufdd0'user/not-found");
      var G__4339 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__4338, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__4335, key__4337, entry__4338) : ret__4335;
      var G__4340 = cljs.core.next.call(null, keys__4336);
      ret__4335 = G__4339;
      keys__4336 = G__4340;
      continue
    }else {
      return ret__4335
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
  var this__4341 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__4362 = null;
  var G__4362__4363 = function(coll, v) {
    var this__4342 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__4362__4364 = function(coll, v, not_found) {
    var this__4343 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__4343.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__4362 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4362__4363.call(this, coll, v);
      case 3:
        return G__4362__4364.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4362
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__4366 = null;
  var G__4366__4367 = function(tsym4344, k) {
    var this__4346 = this;
    var tsym4344__4347 = this;
    var coll__4348 = tsym4344__4347;
    return cljs.core._lookup.call(null, coll__4348, k)
  };
  var G__4366__4368 = function(tsym4345, k, not_found) {
    var this__4349 = this;
    var tsym4345__4350 = this;
    var coll__4351 = tsym4345__4350;
    return cljs.core._lookup.call(null, coll__4351, k, not_found)
  };
  G__4366 = function(tsym4345, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4366__4367.call(this, tsym4345, k);
      case 3:
        return G__4366__4368.call(this, tsym4345, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4366
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4352 = this;
  return new cljs.core.Set(this__4352.meta, cljs.core.assoc.call(null, this__4352.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__4353 = this;
  return cljs.core.keys.call(null, this__4353.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__4354 = this;
  return new cljs.core.Set(this__4354.meta, cljs.core.dissoc.call(null, this__4354.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__4355 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4356 = this;
  var and__3546__auto____4357 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____4357)) {
    var and__3546__auto____4358 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____4358)) {
      return cljs.core.every_QMARK_.call(null, function(p1__4334_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__4334_SHARP_)
      }, other)
    }else {
      return and__3546__auto____4358
    }
  }else {
    return and__3546__auto____4357
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__4359 = this;
  return new cljs.core.Set(meta, this__4359.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__4360 = this;
  return this__4360.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__4361 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__4361.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__4371 = cljs.core.seq.call(null, coll);
  var out__4372 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__4371)))) {
      var G__4373 = cljs.core.rest.call(null, in$__4371);
      var G__4374 = cljs.core.conj.call(null, out__4372, cljs.core.first.call(null, in$__4371));
      in$__4371 = G__4373;
      out__4372 = G__4374;
      continue
    }else {
      return out__4372
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__4375 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____4376 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____4376)) {
        var e__4377 = temp__3695__auto____4376;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__4377))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__4375, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__4370_SHARP_) {
      var temp__3695__auto____4378 = cljs.core.find.call(null, smap, p1__4370_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____4378)) {
        var e__4379 = temp__3695__auto____4378;
        return cljs.core.second.call(null, e__4379)
      }else {
        return p1__4370_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__4387 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__4380, seen) {
        while(true) {
          var vec__4381__4382 = p__4380;
          var f__4383 = cljs.core.nth.call(null, vec__4381__4382, 0, null);
          var xs__4384 = vec__4381__4382;
          var temp__3698__auto____4385 = cljs.core.seq.call(null, xs__4384);
          if(cljs.core.truth_(temp__3698__auto____4385)) {
            var s__4386 = temp__3698__auto____4385;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__4383))) {
              var G__4388 = cljs.core.rest.call(null, s__4386);
              var G__4389 = seen;
              p__4380 = G__4388;
              seen = G__4389;
              continue
            }else {
              return cljs.core.cons.call(null, f__4383, step.call(null, cljs.core.rest.call(null, s__4386), cljs.core.conj.call(null, seen, f__4383)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__4387.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__4390 = cljs.core.Vector.fromArray([]);
  var s__4391 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__4391))) {
      var G__4392 = cljs.core.conj.call(null, ret__4390, cljs.core.first.call(null, s__4391));
      var G__4393 = cljs.core.next.call(null, s__4391);
      ret__4390 = G__4392;
      s__4391 = G__4393;
      continue
    }else {
      return cljs.core.seq.call(null, ret__4390)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____4394 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____4394)) {
        return or__3548__auto____4394
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__4395 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__4395 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__4395 + 1)
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
    var or__3548__auto____4396 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____4396)) {
      return or__3548__auto____4396
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__4397 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__4397 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__4397)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__4400 = cljs.core.ObjMap.fromObject([], {});
  var ks__4401 = cljs.core.seq.call(null, keys);
  var vs__4402 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4403 = ks__4401;
      if(cljs.core.truth_(and__3546__auto____4403)) {
        return vs__4402
      }else {
        return and__3546__auto____4403
      }
    }())) {
      var G__4404 = cljs.core.assoc.call(null, map__4400, cljs.core.first.call(null, ks__4401), cljs.core.first.call(null, vs__4402));
      var G__4405 = cljs.core.next.call(null, ks__4401);
      var G__4406 = cljs.core.next.call(null, vs__4402);
      map__4400 = G__4404;
      ks__4401 = G__4405;
      vs__4402 = G__4406;
      continue
    }else {
      return map__4400
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__4409 = function(k, x) {
    return x
  };
  var max_key__4410 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__4411 = function() {
    var G__4413__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__4398_SHARP_, p2__4399_SHARP_) {
        return max_key.call(null, k, p1__4398_SHARP_, p2__4399_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__4413 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__4413__delegate.call(this, k, x, y, more)
    };
    G__4413.cljs$lang$maxFixedArity = 3;
    G__4413.cljs$lang$applyTo = function(arglist__4414) {
      var k = cljs.core.first(arglist__4414);
      var x = cljs.core.first(cljs.core.next(arglist__4414));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4414)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4414)));
      return G__4413__delegate.call(this, k, x, y, more)
    };
    return G__4413
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__4409.call(this, k, x);
      case 3:
        return max_key__4410.call(this, k, x, y);
      default:
        return max_key__4411.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__4411.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__4415 = function(k, x) {
    return x
  };
  var min_key__4416 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__4417 = function() {
    var G__4419__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__4407_SHARP_, p2__4408_SHARP_) {
        return min_key.call(null, k, p1__4407_SHARP_, p2__4408_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__4419 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__4419__delegate.call(this, k, x, y, more)
    };
    G__4419.cljs$lang$maxFixedArity = 3;
    G__4419.cljs$lang$applyTo = function(arglist__4420) {
      var k = cljs.core.first(arglist__4420);
      var x = cljs.core.first(cljs.core.next(arglist__4420));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4420)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4420)));
      return G__4419__delegate.call(this, k, x, y, more)
    };
    return G__4419
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__4415.call(this, k, x);
      case 3:
        return min_key__4416.call(this, k, x, y);
      default:
        return min_key__4417.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__4417.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__4423 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__4424 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____4421 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____4421)) {
        var s__4422 = temp__3698__auto____4421;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__4422), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__4422)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__4423.call(this, n, step);
      case 3:
        return partition_all__4424.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____4426 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____4426)) {
      var s__4427 = temp__3698__auto____4426;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__4427)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__4427), take_while.call(null, pred, cljs.core.rest.call(null, s__4427)))
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
  var this__4428 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__4429 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__4445 = null;
  var G__4445__4446 = function(rng, f) {
    var this__4430 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__4445__4447 = function(rng, f, s) {
    var this__4431 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__4445 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__4445__4446.call(this, rng, f);
      case 3:
        return G__4445__4447.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4445
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__4432 = this;
  var comp__4433 = cljs.core.truth_(this__4432.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__4433.call(null, this__4432.start, this__4432.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__4434 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__4434.end - this__4434.start) / this__4434.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__4435 = this;
  return this__4435.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__4436 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__4436.meta, this__4436.start + this__4436.step, this__4436.end, this__4436.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__4437 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__4438 = this;
  return new cljs.core.Range(meta, this__4438.start, this__4438.end, this__4438.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__4439 = this;
  return this__4439.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__4449 = null;
  var G__4449__4450 = function(rng, n) {
    var this__4440 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__4440.start + n * this__4440.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____4441 = this__4440.start > this__4440.end;
        if(cljs.core.truth_(and__3546__auto____4441)) {
          return cljs.core._EQ_.call(null, this__4440.step, 0)
        }else {
          return and__3546__auto____4441
        }
      }())) {
        return this__4440.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__4449__4451 = function(rng, n, not_found) {
    var this__4442 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__4442.start + n * this__4442.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____4443 = this__4442.start > this__4442.end;
        if(cljs.core.truth_(and__3546__auto____4443)) {
          return cljs.core._EQ_.call(null, this__4442.step, 0)
        }else {
          return and__3546__auto____4443
        }
      }())) {
        return this__4442.start
      }else {
        return not_found
      }
    }
  };
  G__4449 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4449__4450.call(this, rng, n);
      case 3:
        return G__4449__4451.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4449
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__4444 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__4444.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__4453 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__4454 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__4455 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__4456 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__4453.call(this);
      case 1:
        return range__4454.call(this, start);
      case 2:
        return range__4455.call(this, start, end);
      case 3:
        return range__4456.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____4458 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____4458)) {
      var s__4459 = temp__3698__auto____4458;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__4459), take_nth.call(null, n, cljs.core.drop.call(null, n, s__4459)))
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
    var temp__3698__auto____4461 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____4461)) {
      var s__4462 = temp__3698__auto____4461;
      var fst__4463 = cljs.core.first.call(null, s__4462);
      var fv__4464 = f.call(null, fst__4463);
      var run__4465 = cljs.core.cons.call(null, fst__4463, cljs.core.take_while.call(null, function(p1__4460_SHARP_) {
        return cljs.core._EQ_.call(null, fv__4464, f.call(null, p1__4460_SHARP_))
      }, cljs.core.next.call(null, s__4462)));
      return cljs.core.cons.call(null, run__4465, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__4465), s__4462))))
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
  var reductions__4480 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____4476 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____4476)) {
        var s__4477 = temp__3695__auto____4476;
        return reductions.call(null, f, cljs.core.first.call(null, s__4477), cljs.core.rest.call(null, s__4477))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__4481 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____4478 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____4478)) {
        var s__4479 = temp__3698__auto____4478;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__4479)), cljs.core.rest.call(null, s__4479))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__4480.call(this, f, init);
      case 3:
        return reductions__4481.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__4484 = function(f) {
    return function() {
      var G__4489 = null;
      var G__4489__4490 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__4489__4491 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__4489__4492 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__4489__4493 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__4489__4494 = function() {
        var G__4496__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__4496 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__4496__delegate.call(this, x, y, z, args)
        };
        G__4496.cljs$lang$maxFixedArity = 3;
        G__4496.cljs$lang$applyTo = function(arglist__4497) {
          var x = cljs.core.first(arglist__4497);
          var y = cljs.core.first(cljs.core.next(arglist__4497));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4497)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4497)));
          return G__4496__delegate.call(this, x, y, z, args)
        };
        return G__4496
      }();
      G__4489 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__4489__4490.call(this);
          case 1:
            return G__4489__4491.call(this, x);
          case 2:
            return G__4489__4492.call(this, x, y);
          case 3:
            return G__4489__4493.call(this, x, y, z);
          default:
            return G__4489__4494.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__4489.cljs$lang$maxFixedArity = 3;
      G__4489.cljs$lang$applyTo = G__4489__4494.cljs$lang$applyTo;
      return G__4489
    }()
  };
  var juxt__4485 = function(f, g) {
    return function() {
      var G__4498 = null;
      var G__4498__4499 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__4498__4500 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__4498__4501 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__4498__4502 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__4498__4503 = function() {
        var G__4505__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__4505 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__4505__delegate.call(this, x, y, z, args)
        };
        G__4505.cljs$lang$maxFixedArity = 3;
        G__4505.cljs$lang$applyTo = function(arglist__4506) {
          var x = cljs.core.first(arglist__4506);
          var y = cljs.core.first(cljs.core.next(arglist__4506));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4506)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4506)));
          return G__4505__delegate.call(this, x, y, z, args)
        };
        return G__4505
      }();
      G__4498 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__4498__4499.call(this);
          case 1:
            return G__4498__4500.call(this, x);
          case 2:
            return G__4498__4501.call(this, x, y);
          case 3:
            return G__4498__4502.call(this, x, y, z);
          default:
            return G__4498__4503.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__4498.cljs$lang$maxFixedArity = 3;
      G__4498.cljs$lang$applyTo = G__4498__4503.cljs$lang$applyTo;
      return G__4498
    }()
  };
  var juxt__4486 = function(f, g, h) {
    return function() {
      var G__4507 = null;
      var G__4507__4508 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__4507__4509 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__4507__4510 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__4507__4511 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__4507__4512 = function() {
        var G__4514__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__4514 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__4514__delegate.call(this, x, y, z, args)
        };
        G__4514.cljs$lang$maxFixedArity = 3;
        G__4514.cljs$lang$applyTo = function(arglist__4515) {
          var x = cljs.core.first(arglist__4515);
          var y = cljs.core.first(cljs.core.next(arglist__4515));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4515)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4515)));
          return G__4514__delegate.call(this, x, y, z, args)
        };
        return G__4514
      }();
      G__4507 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__4507__4508.call(this);
          case 1:
            return G__4507__4509.call(this, x);
          case 2:
            return G__4507__4510.call(this, x, y);
          case 3:
            return G__4507__4511.call(this, x, y, z);
          default:
            return G__4507__4512.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__4507.cljs$lang$maxFixedArity = 3;
      G__4507.cljs$lang$applyTo = G__4507__4512.cljs$lang$applyTo;
      return G__4507
    }()
  };
  var juxt__4487 = function() {
    var G__4516__delegate = function(f, g, h, fs) {
      var fs__4483 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__4517 = null;
        var G__4517__4518 = function() {
          return cljs.core.reduce.call(null, function(p1__4466_SHARP_, p2__4467_SHARP_) {
            return cljs.core.conj.call(null, p1__4466_SHARP_, p2__4467_SHARP_.call(null))
          }, cljs.core.Vector.fromArray([]), fs__4483)
        };
        var G__4517__4519 = function(x) {
          return cljs.core.reduce.call(null, function(p1__4468_SHARP_, p2__4469_SHARP_) {
            return cljs.core.conj.call(null, p1__4468_SHARP_, p2__4469_SHARP_.call(null, x))
          }, cljs.core.Vector.fromArray([]), fs__4483)
        };
        var G__4517__4520 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__4470_SHARP_, p2__4471_SHARP_) {
            return cljs.core.conj.call(null, p1__4470_SHARP_, p2__4471_SHARP_.call(null, x, y))
          }, cljs.core.Vector.fromArray([]), fs__4483)
        };
        var G__4517__4521 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__4472_SHARP_, p2__4473_SHARP_) {
            return cljs.core.conj.call(null, p1__4472_SHARP_, p2__4473_SHARP_.call(null, x, y, z))
          }, cljs.core.Vector.fromArray([]), fs__4483)
        };
        var G__4517__4522 = function() {
          var G__4524__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__4474_SHARP_, p2__4475_SHARP_) {
              return cljs.core.conj.call(null, p1__4474_SHARP_, cljs.core.apply.call(null, p2__4475_SHARP_, x, y, z, args))
            }, cljs.core.Vector.fromArray([]), fs__4483)
          };
          var G__4524 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__4524__delegate.call(this, x, y, z, args)
          };
          G__4524.cljs$lang$maxFixedArity = 3;
          G__4524.cljs$lang$applyTo = function(arglist__4525) {
            var x = cljs.core.first(arglist__4525);
            var y = cljs.core.first(cljs.core.next(arglist__4525));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4525)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4525)));
            return G__4524__delegate.call(this, x, y, z, args)
          };
          return G__4524
        }();
        G__4517 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__4517__4518.call(this);
            case 1:
              return G__4517__4519.call(this, x);
            case 2:
              return G__4517__4520.call(this, x, y);
            case 3:
              return G__4517__4521.call(this, x, y, z);
            default:
              return G__4517__4522.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__4517.cljs$lang$maxFixedArity = 3;
        G__4517.cljs$lang$applyTo = G__4517__4522.cljs$lang$applyTo;
        return G__4517
      }()
    };
    var G__4516 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__4516__delegate.call(this, f, g, h, fs)
    };
    G__4516.cljs$lang$maxFixedArity = 3;
    G__4516.cljs$lang$applyTo = function(arglist__4526) {
      var f = cljs.core.first(arglist__4526);
      var g = cljs.core.first(cljs.core.next(arglist__4526));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4526)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4526)));
      return G__4516__delegate.call(this, f, g, h, fs)
    };
    return G__4516
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__4484.call(this, f);
      case 2:
        return juxt__4485.call(this, f, g);
      case 3:
        return juxt__4486.call(this, f, g, h);
      default:
        return juxt__4487.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__4487.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__4528 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__4531 = cljs.core.next.call(null, coll);
        coll = G__4531;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__4529 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____4527 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____4527)) {
          return n > 0
        }else {
          return and__3546__auto____4527
        }
      }())) {
        var G__4532 = n - 1;
        var G__4533 = cljs.core.next.call(null, coll);
        n = G__4532;
        coll = G__4533;
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
        return dorun__4528.call(this, n);
      case 2:
        return dorun__4529.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__4534 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__4535 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__4534.call(this, n);
      case 2:
        return doall__4535.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__4537 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__4537), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__4537), 1))) {
      return cljs.core.first.call(null, matches__4537)
    }else {
      return cljs.core.vec.call(null, matches__4537)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__4538 = re.exec(s);
  if(cljs.core.truth_(matches__4538 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__4538), 1))) {
      return cljs.core.first.call(null, matches__4538)
    }else {
      return cljs.core.vec.call(null, matches__4538)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__4539 = cljs.core.re_find.call(null, re, s);
  var match_idx__4540 = s.search(re);
  var match_str__4541 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__4539)) ? cljs.core.first.call(null, match_data__4539) : match_data__4539;
  var post_match__4542 = cljs.core.subs.call(null, s, match_idx__4540 + cljs.core.count.call(null, match_str__4541));
  if(cljs.core.truth_(match_data__4539)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__4539, re_seq.call(null, re, post_match__4542))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__4544__4545 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___4546 = cljs.core.nth.call(null, vec__4544__4545, 0, null);
  var flags__4547 = cljs.core.nth.call(null, vec__4544__4545, 1, null);
  var pattern__4548 = cljs.core.nth.call(null, vec__4544__4545, 2, null);
  return new RegExp(pattern__4548, flags__4547)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.Vector.fromArray([sep]), cljs.core.map.call(null, function(p1__4543_SHARP_) {
    return print_one.call(null, p1__4543_SHARP_, opts)
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
          var and__3546__auto____4549 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____4549)) {
            var and__3546__auto____4553 = function() {
              var x__450__auto____4550 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____4551 = x__450__auto____4550;
                if(cljs.core.truth_(and__3546__auto____4551)) {
                  var and__3546__auto____4552 = x__450__auto____4550.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____4552)) {
                    return cljs.core.not.call(null, x__450__auto____4550.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____4552
                  }
                }else {
                  return and__3546__auto____4551
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____4550)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____4553)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____4553
            }
          }else {
            return and__3546__auto____4549
          }
        }()) ? cljs.core.concat.call(null, cljs.core.Vector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.Vector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__450__auto____4554 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____4555 = x__450__auto____4554;
            if(cljs.core.truth_(and__3546__auto____4555)) {
              var and__3546__auto____4556 = x__450__auto____4554.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____4556)) {
                return cljs.core.not.call(null, x__450__auto____4554.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____4556
              }
            }else {
              return and__3546__auto____4555
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__450__auto____4554)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__4557 = cljs.core.first.call(null, objs);
  var sb__4558 = new goog.string.StringBuffer;
  var G__4559__4560 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__4559__4560)) {
    var obj__4561 = cljs.core.first.call(null, G__4559__4560);
    var G__4559__4562 = G__4559__4560;
    while(true) {
      if(cljs.core.truth_(obj__4561 === first_obj__4557)) {
      }else {
        sb__4558.append(" ")
      }
      var G__4563__4564 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__4561, opts));
      if(cljs.core.truth_(G__4563__4564)) {
        var string__4565 = cljs.core.first.call(null, G__4563__4564);
        var G__4563__4566 = G__4563__4564;
        while(true) {
          sb__4558.append(string__4565);
          var temp__3698__auto____4567 = cljs.core.next.call(null, G__4563__4566);
          if(cljs.core.truth_(temp__3698__auto____4567)) {
            var G__4563__4568 = temp__3698__auto____4567;
            var G__4571 = cljs.core.first.call(null, G__4563__4568);
            var G__4572 = G__4563__4568;
            string__4565 = G__4571;
            G__4563__4566 = G__4572;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____4569 = cljs.core.next.call(null, G__4559__4562);
      if(cljs.core.truth_(temp__3698__auto____4569)) {
        var G__4559__4570 = temp__3698__auto____4569;
        var G__4573 = cljs.core.first.call(null, G__4559__4570);
        var G__4574 = G__4559__4570;
        obj__4561 = G__4573;
        G__4559__4562 = G__4574;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__4558)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__4575 = cljs.core.first.call(null, objs);
  var G__4576__4577 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__4576__4577)) {
    var obj__4578 = cljs.core.first.call(null, G__4576__4577);
    var G__4576__4579 = G__4576__4577;
    while(true) {
      if(cljs.core.truth_(obj__4578 === first_obj__4575)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__4580__4581 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__4578, opts));
      if(cljs.core.truth_(G__4580__4581)) {
        var string__4582 = cljs.core.first.call(null, G__4580__4581);
        var G__4580__4583 = G__4580__4581;
        while(true) {
          cljs.core.string_print.call(null, string__4582);
          var temp__3698__auto____4584 = cljs.core.next.call(null, G__4580__4583);
          if(cljs.core.truth_(temp__3698__auto____4584)) {
            var G__4580__4585 = temp__3698__auto____4584;
            var G__4588 = cljs.core.first.call(null, G__4580__4585);
            var G__4589 = G__4580__4585;
            string__4582 = G__4588;
            G__4580__4583 = G__4589;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____4586 = cljs.core.next.call(null, G__4576__4579);
      if(cljs.core.truth_(temp__3698__auto____4586)) {
        var G__4576__4587 = temp__3698__auto____4586;
        var G__4590 = cljs.core.first.call(null, G__4576__4587);
        var G__4591 = G__4576__4587;
        obj__4578 = G__4590;
        G__4576__4579 = G__4591;
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
  pr_str.cljs$lang$applyTo = function(arglist__4592) {
    var objs = cljs.core.seq(arglist__4592);
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
  pr.cljs$lang$applyTo = function(arglist__4593) {
    var objs = cljs.core.seq(arglist__4593);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__4594) {
    var objs = cljs.core.seq(arglist__4594);
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
  println.cljs$lang$applyTo = function(arglist__4595) {
    var objs = cljs.core.seq(arglist__4595);
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
  prn.cljs$lang$applyTo = function(arglist__4596) {
    var objs = cljs.core.seq(arglist__4596);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__4597 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__4597, "{", ", ", "}", opts, coll)
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
      var temp__3698__auto____4598 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____4598)) {
        var nspc__4599 = temp__3698__auto____4598;
        return cljs.core.str.call(null, nspc__4599, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____4600 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____4600)) {
          var nspc__4601 = temp__3698__auto____4600;
          return cljs.core.str.call(null, nspc__4601, "/")
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
  var pr_pair__4602 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__4602, "{", ", ", "}", opts, coll)
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
  var this__4603 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__4604 = this;
  var G__4605__4606 = cljs.core.seq.call(null, this__4604.watches);
  if(cljs.core.truth_(G__4605__4606)) {
    var G__4608__4610 = cljs.core.first.call(null, G__4605__4606);
    var vec__4609__4611 = G__4608__4610;
    var key__4612 = cljs.core.nth.call(null, vec__4609__4611, 0, null);
    var f__4613 = cljs.core.nth.call(null, vec__4609__4611, 1, null);
    var G__4605__4614 = G__4605__4606;
    var G__4608__4615 = G__4608__4610;
    var G__4605__4616 = G__4605__4614;
    while(true) {
      var vec__4617__4618 = G__4608__4615;
      var key__4619 = cljs.core.nth.call(null, vec__4617__4618, 0, null);
      var f__4620 = cljs.core.nth.call(null, vec__4617__4618, 1, null);
      var G__4605__4621 = G__4605__4616;
      f__4620.call(null, key__4619, this$, oldval, newval);
      var temp__3698__auto____4622 = cljs.core.next.call(null, G__4605__4621);
      if(cljs.core.truth_(temp__3698__auto____4622)) {
        var G__4605__4623 = temp__3698__auto____4622;
        var G__4630 = cljs.core.first.call(null, G__4605__4623);
        var G__4631 = G__4605__4623;
        G__4608__4615 = G__4630;
        G__4605__4616 = G__4631;
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
  var this__4624 = this;
  return this$.watches = cljs.core.assoc.call(null, this__4624.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__4625 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__4625.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__4626 = this;
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__4626.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__4627 = this;
  return this__4627.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__4628 = this;
  return this__4628.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__4629 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__4638 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__4639 = function() {
    var G__4641__delegate = function(x, p__4632) {
      var map__4633__4634 = p__4632;
      var map__4633__4635 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__4633__4634)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__4633__4634) : map__4633__4634;
      var validator__4636 = cljs.core.get.call(null, map__4633__4635, "\ufdd0'validator");
      var meta__4637 = cljs.core.get.call(null, map__4633__4635, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__4637, validator__4636, null)
    };
    var G__4641 = function(x, var_args) {
      var p__4632 = null;
      if(goog.isDef(var_args)) {
        p__4632 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__4641__delegate.call(this, x, p__4632)
    };
    G__4641.cljs$lang$maxFixedArity = 1;
    G__4641.cljs$lang$applyTo = function(arglist__4642) {
      var x = cljs.core.first(arglist__4642);
      var p__4632 = cljs.core.rest(arglist__4642);
      return G__4641__delegate.call(this, x, p__4632)
    };
    return G__4641
  }();
  atom = function(x, var_args) {
    var p__4632 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__4638.call(this, x);
      default:
        return atom__4639.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__4639.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____4643 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____4643)) {
    var validate__4644 = temp__3698__auto____4643;
    if(cljs.core.truth_(validate__4644.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3073)))));
    }
  }else {
  }
  var old_value__4645 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__4645, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___4646 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___4647 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___4648 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___4649 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___4650 = function() {
    var G__4652__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__4652 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__4652__delegate.call(this, a, f, x, y, z, more)
    };
    G__4652.cljs$lang$maxFixedArity = 5;
    G__4652.cljs$lang$applyTo = function(arglist__4653) {
      var a = cljs.core.first(arglist__4653);
      var f = cljs.core.first(cljs.core.next(arglist__4653));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4653)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4653))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4653)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4653)))));
      return G__4652__delegate.call(this, a, f, x, y, z, more)
    };
    return G__4652
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___4646.call(this, a, f);
      case 3:
        return swap_BANG___4647.call(this, a, f, x);
      case 4:
        return swap_BANG___4648.call(this, a, f, x, y);
      case 5:
        return swap_BANG___4649.call(this, a, f, x, y, z);
      default:
        return swap_BANG___4650.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___4650.cljs$lang$applyTo;
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__4654) {
    var iref = cljs.core.first(arglist__4654);
    var f = cljs.core.first(cljs.core.next(arglist__4654));
    var args = cljs.core.rest(cljs.core.next(arglist__4654));
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
  var gensym__4655 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__4656 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__4655.call(this);
      case 1:
        return gensym__4656.call(this, prefix_string)
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
  var this__4658 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__4658.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__4659 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__4659.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__4659.state, this__4659.f)
  }
  return cljs.core.deref.call(null, this__4659.state)
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
  delay.cljs$lang$applyTo = function(arglist__4660) {
    var body = cljs.core.seq(arglist__4660);
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
    var map__4661__4662 = options;
    var map__4661__4663 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__4661__4662)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__4661__4662) : map__4661__4662;
    var keywordize_keys__4664 = cljs.core.get.call(null, map__4661__4663, "\ufdd0'keywordize-keys");
    var keyfn__4665 = cljs.core.truth_(keywordize_keys__4664) ? cljs.core.keyword : cljs.core.str;
    var f__4671 = function thisfn(x) {
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
                var iter__514__auto____4670 = function iter__4666(s__4667) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__4667__4668 = s__4667;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__4667__4668))) {
                        var k__4669 = cljs.core.first.call(null, s__4667__4668);
                        return cljs.core.cons.call(null, cljs.core.Vector.fromArray([keyfn__4665.call(null, k__4669), thisfn.call(null, x[k__4669])]), iter__4666.call(null, cljs.core.rest.call(null, s__4667__4668)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__514__auto____4670.call(null, cljs.core.js_keys.call(null, x))
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
    return f__4671.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__4672) {
    var x = cljs.core.first(arglist__4672);
    var options = cljs.core.rest(arglist__4672);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__4673 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__4677__delegate = function(args) {
      var temp__3695__auto____4674 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__4673), args);
      if(cljs.core.truth_(temp__3695__auto____4674)) {
        var v__4675 = temp__3695__auto____4674;
        return v__4675
      }else {
        var ret__4676 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__4673, cljs.core.assoc, args, ret__4676);
        return ret__4676
      }
    };
    var G__4677 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__4677__delegate.call(this, args)
    };
    G__4677.cljs$lang$maxFixedArity = 0;
    G__4677.cljs$lang$applyTo = function(arglist__4678) {
      var args = cljs.core.seq(arglist__4678);
      return G__4677__delegate.call(this, args)
    };
    return G__4677
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__4680 = function(f) {
    while(true) {
      var ret__4679 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__4679))) {
        var G__4683 = ret__4679;
        f = G__4683;
        continue
      }else {
        return ret__4679
      }
      break
    }
  };
  var trampoline__4681 = function() {
    var G__4684__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__4684 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__4684__delegate.call(this, f, args)
    };
    G__4684.cljs$lang$maxFixedArity = 1;
    G__4684.cljs$lang$applyTo = function(arglist__4685) {
      var f = cljs.core.first(arglist__4685);
      var args = cljs.core.rest(arglist__4685);
      return G__4684__delegate.call(this, f, args)
    };
    return G__4684
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__4680.call(this, f);
      default:
        return trampoline__4681.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__4681.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__4686 = function() {
    return rand.call(null, 1)
  };
  var rand__4687 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__4686.call(this);
      case 1:
        return rand__4687.call(this, n)
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
    var k__4689 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__4689, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__4689, cljs.core.Vector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___4698 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___4699 = function(h, child, parent) {
    var or__3548__auto____4690 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____4690)) {
      return or__3548__auto____4690
    }else {
      var or__3548__auto____4691 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____4691)) {
        return or__3548__auto____4691
      }else {
        var and__3546__auto____4692 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____4692)) {
          var and__3546__auto____4693 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____4693)) {
            var and__3546__auto____4694 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____4694)) {
              var ret__4695 = true;
              var i__4696 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____4697 = cljs.core.not.call(null, ret__4695);
                  if(cljs.core.truth_(or__3548__auto____4697)) {
                    return or__3548__auto____4697
                  }else {
                    return cljs.core._EQ_.call(null, i__4696, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__4695
                }else {
                  var G__4701 = isa_QMARK_.call(null, h, child.call(null, i__4696), parent.call(null, i__4696));
                  var G__4702 = i__4696 + 1;
                  ret__4695 = G__4701;
                  i__4696 = G__4702;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____4694
            }
          }else {
            return and__3546__auto____4693
          }
        }else {
          return and__3546__auto____4692
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___4698.call(this, h, child);
      case 3:
        return isa_QMARK___4699.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__4703 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__4704 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__4703.call(this, h);
      case 2:
        return parents__4704.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__4706 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__4707 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__4706.call(this, h);
      case 2:
        return ancestors__4707.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__4709 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__4710 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__4709.call(this, h);
      case 2:
        return descendants__4710.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__4720 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3365)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__4721 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3369)))));
    }
    var tp__4715 = "\ufdd0'parents".call(null, h);
    var td__4716 = "\ufdd0'descendants".call(null, h);
    var ta__4717 = "\ufdd0'ancestors".call(null, h);
    var tf__4718 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____4719 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__4715.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__4717.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__4717.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__4715, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__4718.call(null, "\ufdd0'ancestors".call(null, h), tag, td__4716, parent, ta__4717), "\ufdd0'descendants":tf__4718.call(null, "\ufdd0'descendants".call(null, h), parent, ta__4717, tag, td__4716)})
    }();
    if(cljs.core.truth_(or__3548__auto____4719)) {
      return or__3548__auto____4719
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__4720.call(this, h, tag);
      case 3:
        return derive__4721.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__4727 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__4728 = function(h, tag, parent) {
    var parentMap__4723 = "\ufdd0'parents".call(null, h);
    var childsParents__4724 = cljs.core.truth_(parentMap__4723.call(null, tag)) ? cljs.core.disj.call(null, parentMap__4723.call(null, tag), parent) : cljs.core.set([]);
    var newParents__4725 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__4724)) ? cljs.core.assoc.call(null, parentMap__4723, tag, childsParents__4724) : cljs.core.dissoc.call(null, parentMap__4723, tag);
    var deriv_seq__4726 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__4712_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__4712_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__4712_SHARP_), cljs.core.second.call(null, p1__4712_SHARP_)))
    }, cljs.core.seq.call(null, newParents__4725)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__4723.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__4713_SHARP_, p2__4714_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__4713_SHARP_, p2__4714_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__4726))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__4727.call(this, h, tag);
      case 3:
        return underive__4728.call(this, h, tag, parent)
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
  var xprefs__4730 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____4732 = cljs.core.truth_(function() {
    var and__3546__auto____4731 = xprefs__4730;
    if(cljs.core.truth_(and__3546__auto____4731)) {
      return xprefs__4730.call(null, y)
    }else {
      return and__3546__auto____4731
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____4732)) {
    return or__3548__auto____4732
  }else {
    var or__3548__auto____4734 = function() {
      var ps__4733 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__4733) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__4733), prefer_table))) {
          }else {
          }
          var G__4737 = cljs.core.rest.call(null, ps__4733);
          ps__4733 = G__4737;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____4734)) {
      return or__3548__auto____4734
    }else {
      var or__3548__auto____4736 = function() {
        var ps__4735 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__4735) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__4735), y, prefer_table))) {
            }else {
            }
            var G__4738 = cljs.core.rest.call(null, ps__4735);
            ps__4735 = G__4738;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____4736)) {
        return or__3548__auto____4736
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____4739 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____4739)) {
    return or__3548__auto____4739
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__4748 = cljs.core.reduce.call(null, function(be, p__4740) {
    var vec__4741__4742 = p__4740;
    var k__4743 = cljs.core.nth.call(null, vec__4741__4742, 0, null);
    var ___4744 = cljs.core.nth.call(null, vec__4741__4742, 1, null);
    var e__4745 = vec__4741__4742;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__4743))) {
      var be2__4747 = cljs.core.truth_(function() {
        var or__3548__auto____4746 = be === null;
        if(cljs.core.truth_(or__3548__auto____4746)) {
          return or__3548__auto____4746
        }else {
          return cljs.core.dominates.call(null, k__4743, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__4745 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__4747), k__4743, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__4743, " and ", cljs.core.first.call(null, be2__4747), ", and neither is preferred"));
      }
      return be2__4747
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__4748)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__4748));
      return cljs.core.second.call(null, best_entry__4748)
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
    var and__3546__auto____4749 = mf;
    if(cljs.core.truth_(and__3546__auto____4749)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____4749
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____4750 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4750)) {
        return or__3548__auto____4750
      }else {
        var or__3548__auto____4751 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____4751)) {
          return or__3548__auto____4751
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4752 = mf;
    if(cljs.core.truth_(and__3546__auto____4752)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____4752
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____4753 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4753)) {
        return or__3548__auto____4753
      }else {
        var or__3548__auto____4754 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____4754)) {
          return or__3548__auto____4754
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4755 = mf;
    if(cljs.core.truth_(and__3546__auto____4755)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____4755
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____4756 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4756)) {
        return or__3548__auto____4756
      }else {
        var or__3548__auto____4757 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____4757)) {
          return or__3548__auto____4757
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4758 = mf;
    if(cljs.core.truth_(and__3546__auto____4758)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____4758
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____4759 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4759)) {
        return or__3548__auto____4759
      }else {
        var or__3548__auto____4760 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____4760)) {
          return or__3548__auto____4760
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4761 = mf;
    if(cljs.core.truth_(and__3546__auto____4761)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____4761
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____4762 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4762)) {
        return or__3548__auto____4762
      }else {
        var or__3548__auto____4763 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____4763)) {
          return or__3548__auto____4763
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4764 = mf;
    if(cljs.core.truth_(and__3546__auto____4764)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____4764
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____4765 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4765)) {
        return or__3548__auto____4765
      }else {
        var or__3548__auto____4766 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____4766)) {
          return or__3548__auto____4766
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4767 = mf;
    if(cljs.core.truth_(and__3546__auto____4767)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____4767
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____4768 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4768)) {
        return or__3548__auto____4768
      }else {
        var or__3548__auto____4769 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____4769)) {
          return or__3548__auto____4769
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4770 = mf;
    if(cljs.core.truth_(and__3546__auto____4770)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____4770
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____4771 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____4771)) {
        return or__3548__auto____4771
      }else {
        var or__3548__auto____4772 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____4772)) {
          return or__3548__auto____4772
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__4773 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__4774 = cljs.core._get_method.call(null, mf, dispatch_val__4773);
  if(cljs.core.truth_(target_fn__4774)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__4773));
  }
  return cljs.core.apply.call(null, target_fn__4774, args)
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
  var this__4775 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__4776 = this;
  cljs.core.swap_BANG_.call(null, this__4776.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__4776.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__4776.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__4776.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__4777 = this;
  cljs.core.swap_BANG_.call(null, this__4777.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__4777.method_cache, this__4777.method_table, this__4777.cached_hierarchy, this__4777.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__4778 = this;
  cljs.core.swap_BANG_.call(null, this__4778.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__4778.method_cache, this__4778.method_table, this__4778.cached_hierarchy, this__4778.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__4779 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__4779.cached_hierarchy), cljs.core.deref.call(null, this__4779.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__4779.method_cache, this__4779.method_table, this__4779.cached_hierarchy, this__4779.hierarchy)
  }
  var temp__3695__auto____4780 = cljs.core.deref.call(null, this__4779.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____4780)) {
    var target_fn__4781 = temp__3695__auto____4780;
    return target_fn__4781
  }else {
    var temp__3695__auto____4782 = cljs.core.find_and_cache_best_method.call(null, this__4779.name, dispatch_val, this__4779.hierarchy, this__4779.method_table, this__4779.prefer_table, this__4779.method_cache, this__4779.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____4782)) {
      var target_fn__4783 = temp__3695__auto____4782;
      return target_fn__4783
    }else {
      return cljs.core.deref.call(null, this__4779.method_table).call(null, this__4779.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__4784 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__4784.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__4784.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__4784.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__4784.method_cache, this__4784.method_table, this__4784.cached_hierarchy, this__4784.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__4785 = this;
  return cljs.core.deref.call(null, this__4785.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__4786 = this;
  return cljs.core.deref.call(null, this__4786.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__4787 = this;
  return cljs.core.do_dispatch.call(null, mf, this__4787.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__4788__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__4788 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__4788__delegate.call(this, _, args)
  };
  G__4788.cljs$lang$maxFixedArity = 1;
  G__4788.cljs$lang$applyTo = function(arglist__4789) {
    var _ = cljs.core.first(arglist__4789);
    var args = cljs.core.rest(arglist__4789);
    return G__4788__delegate.call(this, _, args)
  };
  return G__4788
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
tatame.worker.socket = new WebSocket(cljs.core.str.call(null, "ws://", location.hostname, ":8108/socket"));
tatame.worker.events = cljs.core.atom.call(null, cljs.core.Vector.fromArray([]));
tatame.worker.send_messages_BANG_ = function send_messages_BANG_() {
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, tatame.worker.events))))) {
      self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data"], {"\ufdd0'type":"client", "\ufdd0'data":"sending events to server!"})));
      tatame.worker.socket.send(cljs.core.pr_str.call(null, cljs.core.first.call(null, cljs.core.deref.call(null, tatame.worker.events))));
      cljs.core.swap_BANG_.call(null, tatame.worker.events, function(p1__3087_SHARP_) {
        return cljs.core.drop.call(null, 1, p1__3087_SHARP_)
      });
      continue
    }else {
    }
    break
  }
  return self.setTimeout(send_messages_BANG_, 1E4)
};
tatame.worker.on_client_message = function on_client_message(e) {
  var data__3088 = e.data;
  if(cljs.core.truth_(data__3088.editor)) {
    var event__3089 = cljs.core.assoc.call(null, cljs.core.js__GT_clj.call(null, data__3088), "\ufdd0'ts", e.timeStamp);
    return cljs.core.swap_BANG_.call(null, tatame.worker.events, cljs.core.conj, event__3089)
  }else {
    if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, data__3088))) {
      return tatame.worker.socket.send(data__3088)
    }else {
      return null
    }
  }
};
tatame.worker.on_server_message = function on_server_message(e) {
  var data__3090 = e.data;
  return self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data"], {"\ufdd0'type":"server", "\ufdd0'data":data__3090})))
};
tatame.worker.socket.onopen = tatame.worker.send_messages_BANG_;
tatame.worker.socket.onmessage = tatame.worker.on_server_message;
self.addEventListener("message", tatame.worker.on_client_message, false);

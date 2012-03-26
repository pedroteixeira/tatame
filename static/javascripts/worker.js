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
  var or__3548__auto____4125 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____4125)) {
    return or__3548__auto____4125
  }else {
    var or__3548__auto____4126 = p["_"];
    if(cljs.core.truth_(or__3548__auto____4126)) {
      return or__3548__auto____4126
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
  var _invoke__4215 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4127 = this$;
      if(cljs.core.truth_(and__3546__auto____4127)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4127
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____4128 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4128)) {
          return or__3548__auto____4128
        }else {
          var or__3548__auto____4129 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4129)) {
            return or__3548__auto____4129
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__4216 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4130 = this$;
      if(cljs.core.truth_(and__3546__auto____4130)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4130
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____4131 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4131)) {
          return or__3548__auto____4131
        }else {
          var or__3548__auto____4132 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4132)) {
            return or__3548__auto____4132
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__4217 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4133 = this$;
      if(cljs.core.truth_(and__3546__auto____4133)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4133
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____4136 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4136)) {
          return or__3548__auto____4136
        }else {
          var or__3548__auto____4137 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4137)) {
            return or__3548__auto____4137
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__4218 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4138 = this$;
      if(cljs.core.truth_(and__3546__auto____4138)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4138
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____4139 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4139)) {
          return or__3548__auto____4139
        }else {
          var or__3548__auto____4140 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4140)) {
            return or__3548__auto____4140
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__4219 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4141 = this$;
      if(cljs.core.truth_(and__3546__auto____4141)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4141
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____4142 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4142)) {
          return or__3548__auto____4142
        }else {
          var or__3548__auto____4143 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4143)) {
            return or__3548__auto____4143
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__4220 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4144 = this$;
      if(cljs.core.truth_(and__3546__auto____4144)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4144
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____4145 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4145)) {
          return or__3548__auto____4145
        }else {
          var or__3548__auto____4146 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4146)) {
            return or__3548__auto____4146
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__4221 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4147 = this$;
      if(cljs.core.truth_(and__3546__auto____4147)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4147
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____4148 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4148)) {
          return or__3548__auto____4148
        }else {
          var or__3548__auto____4149 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4149)) {
            return or__3548__auto____4149
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__4222 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4150 = this$;
      if(cljs.core.truth_(and__3546__auto____4150)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4150
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____4151 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4151)) {
          return or__3548__auto____4151
        }else {
          var or__3548__auto____4152 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4152)) {
            return or__3548__auto____4152
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__4223 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4153 = this$;
      if(cljs.core.truth_(and__3546__auto____4153)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4153
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____4154 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4154)) {
          return or__3548__auto____4154
        }else {
          var or__3548__auto____4155 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4155)) {
            return or__3548__auto____4155
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__4224 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4156 = this$;
      if(cljs.core.truth_(and__3546__auto____4156)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4156
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____4157 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4157)) {
          return or__3548__auto____4157
        }else {
          var or__3548__auto____4158 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4158)) {
            return or__3548__auto____4158
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__4225 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4159 = this$;
      if(cljs.core.truth_(and__3546__auto____4159)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4159
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____4160 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4160)) {
          return or__3548__auto____4160
        }else {
          var or__3548__auto____4161 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4161)) {
            return or__3548__auto____4161
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__4226 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4162 = this$;
      if(cljs.core.truth_(and__3546__auto____4162)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4162
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____4163 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4163)) {
          return or__3548__auto____4163
        }else {
          var or__3548__auto____4164 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4164)) {
            return or__3548__auto____4164
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__4227 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4165 = this$;
      if(cljs.core.truth_(and__3546__auto____4165)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4165
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____4166 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4166)) {
          return or__3548__auto____4166
        }else {
          var or__3548__auto____4167 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4167)) {
            return or__3548__auto____4167
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__4228 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4168 = this$;
      if(cljs.core.truth_(and__3546__auto____4168)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4168
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____4169 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4169)) {
          return or__3548__auto____4169
        }else {
          var or__3548__auto____4170 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4170)) {
            return or__3548__auto____4170
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__4229 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4172 = this$;
      if(cljs.core.truth_(and__3546__auto____4172)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4172
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____4175 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4175)) {
          return or__3548__auto____4175
        }else {
          var or__3548__auto____4176 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4176)) {
            return or__3548__auto____4176
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__4230 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4177 = this$;
      if(cljs.core.truth_(and__3546__auto____4177)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4177
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____4178 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4178)) {
          return or__3548__auto____4178
        }else {
          var or__3548__auto____4179 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4179)) {
            return or__3548__auto____4179
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__4231 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4180 = this$;
      if(cljs.core.truth_(and__3546__auto____4180)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4180
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____4182 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4182)) {
          return or__3548__auto____4182
        }else {
          var or__3548__auto____4184 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4184)) {
            return or__3548__auto____4184
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__4232 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4187 = this$;
      if(cljs.core.truth_(and__3546__auto____4187)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4187
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____4189 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4189)) {
          return or__3548__auto____4189
        }else {
          var or__3548__auto____4191 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4191)) {
            return or__3548__auto____4191
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__4233 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4193 = this$;
      if(cljs.core.truth_(and__3546__auto____4193)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4193
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____4196 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4196)) {
          return or__3548__auto____4196
        }else {
          var or__3548__auto____4197 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4197)) {
            return or__3548__auto____4197
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__4234 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4200 = this$;
      if(cljs.core.truth_(and__3546__auto____4200)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4200
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____4202 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4202)) {
          return or__3548__auto____4202
        }else {
          var or__3548__auto____4204 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4204)) {
            return or__3548__auto____4204
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__4235 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4207 = this$;
      if(cljs.core.truth_(and__3546__auto____4207)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4207
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____4209 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4209)) {
          return or__3548__auto____4209
        }else {
          var or__3548__auto____4210 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4210)) {
            return or__3548__auto____4210
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
        return _invoke__4215.call(this, this$);
      case 2:
        return _invoke__4216.call(this, this$, a);
      case 3:
        return _invoke__4217.call(this, this$, a, b);
      case 4:
        return _invoke__4218.call(this, this$, a, b, c);
      case 5:
        return _invoke__4219.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__4220.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__4221.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__4222.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__4223.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__4224.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__4225.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__4226.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__4227.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__4228.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__4229.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__4230.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__4231.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__4232.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__4233.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__4234.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__4235.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4299 = coll;
    if(cljs.core.truth_(and__3546__auto____4299)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____4299
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____4300 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4300)) {
        return or__3548__auto____4300
      }else {
        var or__3548__auto____4301 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____4301)) {
          return or__3548__auto____4301
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
    var and__3546__auto____4302 = coll;
    if(cljs.core.truth_(and__3546__auto____4302)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____4302
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____4303 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4303)) {
        return or__3548__auto____4303
      }else {
        var or__3548__auto____4304 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____4304)) {
          return or__3548__auto____4304
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
    var and__3546__auto____4305 = coll;
    if(cljs.core.truth_(and__3546__auto____4305)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____4305
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____4306 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4306)) {
        return or__3548__auto____4306
      }else {
        var or__3548__auto____4307 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____4307)) {
          return or__3548__auto____4307
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
  var _nth__4314 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4308 = coll;
      if(cljs.core.truth_(and__3546__auto____4308)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____4308
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____4309 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4309)) {
          return or__3548__auto____4309
        }else {
          var or__3548__auto____4310 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____4310)) {
            return or__3548__auto____4310
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__4315 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4311 = coll;
      if(cljs.core.truth_(and__3546__auto____4311)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____4311
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____4312 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4312)) {
          return or__3548__auto____4312
        }else {
          var or__3548__auto____4313 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____4313)) {
            return or__3548__auto____4313
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
        return _nth__4314.call(this, coll, n);
      case 3:
        return _nth__4315.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4317 = coll;
    if(cljs.core.truth_(and__3546__auto____4317)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____4317
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____4318 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4318)) {
        return or__3548__auto____4318
      }else {
        var or__3548__auto____4319 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____4319)) {
          return or__3548__auto____4319
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4320 = coll;
    if(cljs.core.truth_(and__3546__auto____4320)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____4320
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____4321 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4321)) {
        return or__3548__auto____4321
      }else {
        var or__3548__auto____4322 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____4322)) {
          return or__3548__auto____4322
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
  var _lookup__4329 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4323 = o;
      if(cljs.core.truth_(and__3546__auto____4323)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____4323
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____4324 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____4324)) {
          return or__3548__auto____4324
        }else {
          var or__3548__auto____4325 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____4325)) {
            return or__3548__auto____4325
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__4330 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4326 = o;
      if(cljs.core.truth_(and__3546__auto____4326)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____4326
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____4327 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____4327)) {
          return or__3548__auto____4327
        }else {
          var or__3548__auto____4328 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____4328)) {
            return or__3548__auto____4328
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
        return _lookup__4329.call(this, o, k);
      case 3:
        return _lookup__4330.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4332 = coll;
    if(cljs.core.truth_(and__3546__auto____4332)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____4332
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____4334 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4334)) {
        return or__3548__auto____4334
      }else {
        var or__3548__auto____4335 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____4335)) {
          return or__3548__auto____4335
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4338 = coll;
    if(cljs.core.truth_(and__3546__auto____4338)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____4338
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____4339 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4339)) {
        return or__3548__auto____4339
      }else {
        var or__3548__auto____4340 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____4340)) {
          return or__3548__auto____4340
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
    var and__3546__auto____4344 = coll;
    if(cljs.core.truth_(and__3546__auto____4344)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____4344
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____4345 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4345)) {
        return or__3548__auto____4345
      }else {
        var or__3548__auto____4346 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____4346)) {
          return or__3548__auto____4346
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
    var and__3546__auto____4347 = coll;
    if(cljs.core.truth_(and__3546__auto____4347)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____4347
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____4348 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4348)) {
        return or__3548__auto____4348
      }else {
        var or__3548__auto____4349 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____4349)) {
          return or__3548__auto____4349
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
    var and__3546__auto____4353 = coll;
    if(cljs.core.truth_(and__3546__auto____4353)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____4353
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____4354 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4354)) {
        return or__3548__auto____4354
      }else {
        var or__3548__auto____4355 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____4355)) {
          return or__3548__auto____4355
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4357 = coll;
    if(cljs.core.truth_(and__3546__auto____4357)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____4357
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____4359 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4359)) {
        return or__3548__auto____4359
      }else {
        var or__3548__auto____4361 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____4361)) {
          return or__3548__auto____4361
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
    var and__3546__auto____4368 = coll;
    if(cljs.core.truth_(and__3546__auto____4368)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____4368
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____4369 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4369)) {
        return or__3548__auto____4369
      }else {
        var or__3548__auto____4370 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____4370)) {
          return or__3548__auto____4370
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
    var and__3546__auto____4374 = o;
    if(cljs.core.truth_(and__3546__auto____4374)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____4374
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____4376 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4376)) {
        return or__3548__auto____4376
      }else {
        var or__3548__auto____4377 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____4377)) {
          return or__3548__auto____4377
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
    var and__3546__auto____4380 = o;
    if(cljs.core.truth_(and__3546__auto____4380)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____4380
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____4381 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4381)) {
        return or__3548__auto____4381
      }else {
        var or__3548__auto____4382 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____4382)) {
          return or__3548__auto____4382
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
    var and__3546__auto____4389 = o;
    if(cljs.core.truth_(and__3546__auto____4389)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____4389
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____4393 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4393)) {
        return or__3548__auto____4393
      }else {
        var or__3548__auto____4394 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____4394)) {
          return or__3548__auto____4394
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
    var and__3546__auto____4395 = o;
    if(cljs.core.truth_(and__3546__auto____4395)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____4395
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____4396 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4396)) {
        return or__3548__auto____4396
      }else {
        var or__3548__auto____4397 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____4397)) {
          return or__3548__auto____4397
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
  var _reduce__4404 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4398 = coll;
      if(cljs.core.truth_(and__3546__auto____4398)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____4398
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____4399 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4399)) {
          return or__3548__auto____4399
        }else {
          var or__3548__auto____4400 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____4400)) {
            return or__3548__auto____4400
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__4405 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4401 = coll;
      if(cljs.core.truth_(and__3546__auto____4401)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____4401
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____4402 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4402)) {
          return or__3548__auto____4402
        }else {
          var or__3548__auto____4403 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____4403)) {
            return or__3548__auto____4403
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
        return _reduce__4404.call(this, coll, f);
      case 3:
        return _reduce__4405.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4407 = o;
    if(cljs.core.truth_(and__3546__auto____4407)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____4407
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____4408 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4408)) {
        return or__3548__auto____4408
      }else {
        var or__3548__auto____4409 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____4409)) {
          return or__3548__auto____4409
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
    var and__3546__auto____4410 = o;
    if(cljs.core.truth_(and__3546__auto____4410)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____4410
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____4411 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4411)) {
        return or__3548__auto____4411
      }else {
        var or__3548__auto____4412 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____4412)) {
          return or__3548__auto____4412
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
    var and__3546__auto____4419 = o;
    if(cljs.core.truth_(and__3546__auto____4419)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____4419
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____4420 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4420)) {
        return or__3548__auto____4420
      }else {
        var or__3548__auto____4421 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____4421)) {
          return or__3548__auto____4421
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
    var and__3546__auto____4422 = o;
    if(cljs.core.truth_(and__3546__auto____4422)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____4422
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____4423 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4423)) {
        return or__3548__auto____4423
      }else {
        var or__3548__auto____4425 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____4425)) {
          return or__3548__auto____4425
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
    var and__3546__auto____4428 = d;
    if(cljs.core.truth_(and__3546__auto____4428)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____4428
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____4429 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____4429)) {
        return or__3548__auto____4429
      }else {
        var or__3548__auto____4430 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____4430)) {
          return or__3548__auto____4430
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
    var and__3546__auto____4434 = this$;
    if(cljs.core.truth_(and__3546__auto____4434)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____4434
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____4435 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____4435)) {
        return or__3548__auto____4435
      }else {
        var or__3548__auto____4437 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____4437)) {
          return or__3548__auto____4437
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4440 = this$;
    if(cljs.core.truth_(and__3546__auto____4440)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____4440
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____4441 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____4441)) {
        return or__3548__auto____4441
      }else {
        var or__3548__auto____4443 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____4443)) {
          return or__3548__auto____4443
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4446 = this$;
    if(cljs.core.truth_(and__3546__auto____4446)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____4446
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____4447 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____4447)) {
        return or__3548__auto____4447
      }else {
        var or__3548__auto____4448 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____4448)) {
          return or__3548__auto____4448
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
  var G__4461 = null;
  var G__4461__4463 = function(o, k) {
    return null
  };
  var G__4461__4464 = function(o, k, not_found) {
    return not_found
  };
  G__4461 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4461__4463.call(this, o, k);
      case 3:
        return G__4461__4464.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4461
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
  var G__4468 = null;
  var G__4468__4469 = function(_, f) {
    return f.call(null)
  };
  var G__4468__4470 = function(_, f, start) {
    return start
  };
  G__4468 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4468__4469.call(this, _, f);
      case 3:
        return G__4468__4470.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4468
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
  var G__4481 = null;
  var G__4481__4482 = function(_, n) {
    return null
  };
  var G__4481__4483 = function(_, n, not_found) {
    return not_found
  };
  G__4481 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4481__4482.call(this, _, n);
      case 3:
        return G__4481__4483.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4481
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
  var ci_reduce__4500 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__4491 = cljs.core._nth.call(null, cicoll, 0);
      var n__4492 = 1;
      while(true) {
        if(cljs.core.truth_(n__4492 < cljs.core._count.call(null, cicoll))) {
          var G__4504 = f.call(null, val__4491, cljs.core._nth.call(null, cicoll, n__4492));
          var G__4505 = n__4492 + 1;
          val__4491 = G__4504;
          n__4492 = G__4505;
          continue
        }else {
          return val__4491
        }
        break
      }
    }
  };
  var ci_reduce__4501 = function(cicoll, f, val) {
    var val__4494 = val;
    var n__4495 = 0;
    while(true) {
      if(cljs.core.truth_(n__4495 < cljs.core._count.call(null, cicoll))) {
        var G__4506 = f.call(null, val__4494, cljs.core._nth.call(null, cicoll, n__4495));
        var G__4507 = n__4495 + 1;
        val__4494 = G__4506;
        n__4495 = G__4507;
        continue
      }else {
        return val__4494
      }
      break
    }
  };
  var ci_reduce__4502 = function(cicoll, f, val, idx) {
    var val__4497 = val;
    var n__4498 = idx;
    while(true) {
      if(cljs.core.truth_(n__4498 < cljs.core._count.call(null, cicoll))) {
        var G__4509 = f.call(null, val__4497, cljs.core._nth.call(null, cicoll, n__4498));
        var G__4510 = n__4498 + 1;
        val__4497 = G__4509;
        n__4498 = G__4510;
        continue
      }else {
        return val__4497
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__4500.call(this, cicoll, f);
      case 3:
        return ci_reduce__4501.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__4502.call(this, cicoll, f, val, idx)
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
  var this__4513 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__4529 = null;
  var G__4529__4530 = function(_, f) {
    var this__4514 = this;
    return cljs.core.ci_reduce.call(null, this__4514.a, f, this__4514.a[this__4514.i], this__4514.i + 1)
  };
  var G__4529__4531 = function(_, f, start) {
    var this__4515 = this;
    return cljs.core.ci_reduce.call(null, this__4515.a, f, start, this__4515.i)
  };
  G__4529 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4529__4530.call(this, _, f);
      case 3:
        return G__4529__4531.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4529
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4516 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4517 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__4536 = null;
  var G__4536__4537 = function(coll, n) {
    var this__4518 = this;
    var i__4519 = n + this__4518.i;
    if(cljs.core.truth_(i__4519 < this__4518.a.length)) {
      return this__4518.a[i__4519]
    }else {
      return null
    }
  };
  var G__4536__4538 = function(coll, n, not_found) {
    var this__4520 = this;
    var i__4521 = n + this__4520.i;
    if(cljs.core.truth_(i__4521 < this__4520.a.length)) {
      return this__4520.a[i__4521]
    }else {
      return not_found
    }
  };
  G__4536 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4536__4537.call(this, coll, n);
      case 3:
        return G__4536__4538.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4536
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__4523 = this;
  return this__4523.a.length - this__4523.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__4524 = this;
  return this__4524.a[this__4524.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__4526 = this;
  if(cljs.core.truth_(this__4526.i + 1 < this__4526.a.length)) {
    return new cljs.core.IndexedSeq(this__4526.a, this__4526.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__4528 = this;
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
  var G__4546 = null;
  var G__4546__4547 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__4546__4548 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__4546 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4546__4547.call(this, array, f);
      case 3:
        return G__4546__4548.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4546
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__4550 = null;
  var G__4550__4551 = function(array, k) {
    return array[k]
  };
  var G__4550__4552 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__4550 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4550__4551.call(this, array, k);
      case 3:
        return G__4550__4552.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4550
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__4554 = null;
  var G__4554__4555 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__4554__4556 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__4554 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4554__4555.call(this, array, n);
      case 3:
        return G__4554__4556.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4554
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
  var temp__3698__auto____4558 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____4558)) {
    var s__4559 = temp__3698__auto____4558;
    return cljs.core._first.call(null, s__4559)
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
      var G__4560 = cljs.core.next.call(null, s);
      s = G__4560;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__4561 = cljs.core.seq.call(null, x);
  var n__4562 = 0;
  while(true) {
    if(cljs.core.truth_(s__4561)) {
      var G__4563 = cljs.core.next.call(null, s__4561);
      var G__4564 = n__4562 + 1;
      s__4561 = G__4563;
      n__4562 = G__4564;
      continue
    }else {
      return n__4562
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
  var conj__4565 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__4566 = function() {
    var G__4568__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__4569 = conj.call(null, coll, x);
          var G__4570 = cljs.core.first.call(null, xs);
          var G__4571 = cljs.core.next.call(null, xs);
          coll = G__4569;
          x = G__4570;
          xs = G__4571;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__4568 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4568__delegate.call(this, coll, x, xs)
    };
    G__4568.cljs$lang$maxFixedArity = 2;
    G__4568.cljs$lang$applyTo = function(arglist__4572) {
      var coll = cljs.core.first(arglist__4572);
      var x = cljs.core.first(cljs.core.next(arglist__4572));
      var xs = cljs.core.rest(cljs.core.next(arglist__4572));
      return G__4568__delegate.call(this, coll, x, xs)
    };
    return G__4568
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__4565.call(this, coll, x);
      default:
        return conj__4566.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__4566.cljs$lang$applyTo;
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
  var nth__4581 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__4582 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__4581.call(this, coll, n);
      case 3:
        return nth__4582.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__4584 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__4585 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__4584.call(this, o, k);
      case 3:
        return get__4585.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__4588 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__4589 = function() {
    var G__4591__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__4587 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__4592 = ret__4587;
          var G__4593 = cljs.core.first.call(null, kvs);
          var G__4594 = cljs.core.second.call(null, kvs);
          var G__4595 = cljs.core.nnext.call(null, kvs);
          coll = G__4592;
          k = G__4593;
          v = G__4594;
          kvs = G__4595;
          continue
        }else {
          return ret__4587
        }
        break
      }
    };
    var G__4591 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__4591__delegate.call(this, coll, k, v, kvs)
    };
    G__4591.cljs$lang$maxFixedArity = 3;
    G__4591.cljs$lang$applyTo = function(arglist__4596) {
      var coll = cljs.core.first(arglist__4596);
      var k = cljs.core.first(cljs.core.next(arglist__4596));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4596)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4596)));
      return G__4591__delegate.call(this, coll, k, v, kvs)
    };
    return G__4591
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__4588.call(this, coll, k, v);
      default:
        return assoc__4589.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__4589.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__4600 = function(coll) {
    return coll
  };
  var dissoc__4602 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__4604 = function() {
    var G__4606__delegate = function(coll, k, ks) {
      while(true) {
        var ret__4597 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__4607 = ret__4597;
          var G__4608 = cljs.core.first.call(null, ks);
          var G__4609 = cljs.core.next.call(null, ks);
          coll = G__4607;
          k = G__4608;
          ks = G__4609;
          continue
        }else {
          return ret__4597
        }
        break
      }
    };
    var G__4606 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4606__delegate.call(this, coll, k, ks)
    };
    G__4606.cljs$lang$maxFixedArity = 2;
    G__4606.cljs$lang$applyTo = function(arglist__4610) {
      var coll = cljs.core.first(arglist__4610);
      var k = cljs.core.first(cljs.core.next(arglist__4610));
      var ks = cljs.core.rest(cljs.core.next(arglist__4610));
      return G__4606__delegate.call(this, coll, k, ks)
    };
    return G__4606
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__4600.call(this, coll);
      case 2:
        return dissoc__4602.call(this, coll, k);
      default:
        return dissoc__4604.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__4604.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__450__auto____4611 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4612 = x__450__auto____4611;
      if(cljs.core.truth_(and__3546__auto____4612)) {
        var and__3546__auto____4613 = x__450__auto____4611.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____4613)) {
          return cljs.core.not.call(null, x__450__auto____4611.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____4613
        }
      }else {
        return and__3546__auto____4612
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____4611)
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
  var disj__4617 = function(coll) {
    return coll
  };
  var disj__4618 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__4619 = function() {
    var G__4621__delegate = function(coll, k, ks) {
      while(true) {
        var ret__4614 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__4622 = ret__4614;
          var G__4623 = cljs.core.first.call(null, ks);
          var G__4624 = cljs.core.next.call(null, ks);
          coll = G__4622;
          k = G__4623;
          ks = G__4624;
          continue
        }else {
          return ret__4614
        }
        break
      }
    };
    var G__4621 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4621__delegate.call(this, coll, k, ks)
    };
    G__4621.cljs$lang$maxFixedArity = 2;
    G__4621.cljs$lang$applyTo = function(arglist__4625) {
      var coll = cljs.core.first(arglist__4625);
      var k = cljs.core.first(cljs.core.next(arglist__4625));
      var ks = cljs.core.rest(cljs.core.next(arglist__4625));
      return G__4621__delegate.call(this, coll, k, ks)
    };
    return G__4621
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__4617.call(this, coll);
      case 2:
        return disj__4618.call(this, coll, k);
      default:
        return disj__4619.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__4619.cljs$lang$applyTo;
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
    var x__450__auto____4638 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4641 = x__450__auto____4638;
      if(cljs.core.truth_(and__3546__auto____4641)) {
        var and__3546__auto____4642 = x__450__auto____4638.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____4642)) {
          return cljs.core.not.call(null, x__450__auto____4638.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____4642
        }
      }else {
        return and__3546__auto____4641
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__450__auto____4638)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____4643 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4644 = x__450__auto____4643;
      if(cljs.core.truth_(and__3546__auto____4644)) {
        var and__3546__auto____4645 = x__450__auto____4643.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____4645)) {
          return cljs.core.not.call(null, x__450__auto____4643.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____4645
        }
      }else {
        return and__3546__auto____4644
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__450__auto____4643)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__450__auto____4656 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4657 = x__450__auto____4656;
    if(cljs.core.truth_(and__3546__auto____4657)) {
      var and__3546__auto____4659 = x__450__auto____4656.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____4659)) {
        return cljs.core.not.call(null, x__450__auto____4656.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____4659
      }
    }else {
      return and__3546__auto____4657
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__450__auto____4656)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__450__auto____4666 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4667 = x__450__auto____4666;
    if(cljs.core.truth_(and__3546__auto____4667)) {
      var and__3546__auto____4668 = x__450__auto____4666.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____4668)) {
        return cljs.core.not.call(null, x__450__auto____4666.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____4668
      }
    }else {
      return and__3546__auto____4667
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__450__auto____4666)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__450__auto____4673 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4674 = x__450__auto____4673;
    if(cljs.core.truth_(and__3546__auto____4674)) {
      var and__3546__auto____4675 = x__450__auto____4673.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____4675)) {
        return cljs.core.not.call(null, x__450__auto____4673.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____4675
      }
    }else {
      return and__3546__auto____4674
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__450__auto____4673)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____4676 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4677 = x__450__auto____4676;
      if(cljs.core.truth_(and__3546__auto____4677)) {
        var and__3546__auto____4678 = x__450__auto____4676.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____4678)) {
          return cljs.core.not.call(null, x__450__auto____4676.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____4678
        }
      }else {
        return and__3546__auto____4677
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__450__auto____4676)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__450__auto____4683 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4684 = x__450__auto____4683;
    if(cljs.core.truth_(and__3546__auto____4684)) {
      var and__3546__auto____4685 = x__450__auto____4683.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____4685)) {
        return cljs.core.not.call(null, x__450__auto____4683.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____4685
      }
    }else {
      return and__3546__auto____4684
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__450__auto____4683)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__4694 = cljs.core.array.call(null);
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__4694.push(key)
  });
  return keys__4694
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
    var x__450__auto____4697 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4698 = x__450__auto____4697;
      if(cljs.core.truth_(and__3546__auto____4698)) {
        var and__3546__auto____4699 = x__450__auto____4697.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____4699)) {
          return cljs.core.not.call(null, x__450__auto____4697.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____4699
        }
      }else {
        return and__3546__auto____4698
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__450__auto____4697)
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
  var and__3546__auto____4700 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____4700)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____4701 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____4701)) {
        return or__3548__auto____4701
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____4700
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____4705 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____4705)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____4705
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____4708 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____4708)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____4708
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____4716 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____4716)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____4716
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
    var and__3546__auto____4718 = coll;
    if(cljs.core.truth_(and__3546__auto____4718)) {
      var and__3546__auto____4719 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____4719)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____4719
      }
    }else {
      return and__3546__auto____4718
    }
  }())) {
    return cljs.core.Vector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___4731 = function(x) {
    return true
  };
  var distinct_QMARK___4732 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___4733 = function() {
    var G__4739__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__4726 = cljs.core.set([y, x]);
        var xs__4727 = more;
        while(true) {
          var x__4728 = cljs.core.first.call(null, xs__4727);
          var etc__4730 = cljs.core.next.call(null, xs__4727);
          if(cljs.core.truth_(xs__4727)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__4726, x__4728))) {
              return false
            }else {
              var G__4745 = cljs.core.conj.call(null, s__4726, x__4728);
              var G__4746 = etc__4730;
              s__4726 = G__4745;
              xs__4727 = G__4746;
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
    var G__4739 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4739__delegate.call(this, x, y, more)
    };
    G__4739.cljs$lang$maxFixedArity = 2;
    G__4739.cljs$lang$applyTo = function(arglist__4747) {
      var x = cljs.core.first(arglist__4747);
      var y = cljs.core.first(cljs.core.next(arglist__4747));
      var more = cljs.core.rest(cljs.core.next(arglist__4747));
      return G__4739__delegate.call(this, x, y, more)
    };
    return G__4739
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___4731.call(this, x);
      case 2:
        return distinct_QMARK___4732.call(this, x, y);
      default:
        return distinct_QMARK___4733.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___4733.cljs$lang$applyTo;
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
      var r__4758 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__4758))) {
        return r__4758
      }else {
        if(cljs.core.truth_(r__4758)) {
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
  var sort__4763 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__4764 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__4762 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__4762, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__4762)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__4763.call(this, comp);
      case 2:
        return sort__4764.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__4766 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__4767 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__4766.call(this, keyfn, comp);
      case 3:
        return sort_by__4767.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__4779 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__4780 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__4779.call(this, f, val);
      case 3:
        return reduce__4780.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__4789 = function(f, coll) {
    var temp__3695__auto____4785 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____4785)) {
      var s__4786 = temp__3695__auto____4785;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__4786), cljs.core.next.call(null, s__4786))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__4790 = function(f, val, coll) {
    var val__4787 = val;
    var coll__4788 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__4788)) {
        var G__4793 = f.call(null, val__4787, cljs.core.first.call(null, coll__4788));
        var G__4794 = cljs.core.next.call(null, coll__4788);
        val__4787 = G__4793;
        coll__4788 = G__4794;
        continue
      }else {
        return val__4787
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__4789.call(this, f, val);
      case 3:
        return seq_reduce__4790.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__4797 = null;
  var G__4797__4798 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__4797__4799 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__4797 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4797__4798.call(this, coll, f);
      case 3:
        return G__4797__4799.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4797
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___4804 = function() {
    return 0
  };
  var _PLUS___4805 = function(x) {
    return x
  };
  var _PLUS___4806 = function(x, y) {
    return x + y
  };
  var _PLUS___4807 = function() {
    var G__4809__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__4809 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4809__delegate.call(this, x, y, more)
    };
    G__4809.cljs$lang$maxFixedArity = 2;
    G__4809.cljs$lang$applyTo = function(arglist__4811) {
      var x = cljs.core.first(arglist__4811);
      var y = cljs.core.first(cljs.core.next(arglist__4811));
      var more = cljs.core.rest(cljs.core.next(arglist__4811));
      return G__4809__delegate.call(this, x, y, more)
    };
    return G__4809
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___4804.call(this);
      case 1:
        return _PLUS___4805.call(this, x);
      case 2:
        return _PLUS___4806.call(this, x, y);
      default:
        return _PLUS___4807.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___4807.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___4814 = function(x) {
    return-x
  };
  var ___4815 = function(x, y) {
    return x - y
  };
  var ___4816 = function() {
    var G__4819__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__4819 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4819__delegate.call(this, x, y, more)
    };
    G__4819.cljs$lang$maxFixedArity = 2;
    G__4819.cljs$lang$applyTo = function(arglist__4822) {
      var x = cljs.core.first(arglist__4822);
      var y = cljs.core.first(cljs.core.next(arglist__4822));
      var more = cljs.core.rest(cljs.core.next(arglist__4822));
      return G__4819__delegate.call(this, x, y, more)
    };
    return G__4819
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___4814.call(this, x);
      case 2:
        return ___4815.call(this, x, y);
      default:
        return ___4816.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___4816.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___4823 = function() {
    return 1
  };
  var _STAR___4824 = function(x) {
    return x
  };
  var _STAR___4825 = function(x, y) {
    return x * y
  };
  var _STAR___4826 = function() {
    var G__4831__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__4831 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4831__delegate.call(this, x, y, more)
    };
    G__4831.cljs$lang$maxFixedArity = 2;
    G__4831.cljs$lang$applyTo = function(arglist__4832) {
      var x = cljs.core.first(arglist__4832);
      var y = cljs.core.first(cljs.core.next(arglist__4832));
      var more = cljs.core.rest(cljs.core.next(arglist__4832));
      return G__4831__delegate.call(this, x, y, more)
    };
    return G__4831
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___4823.call(this);
      case 1:
        return _STAR___4824.call(this, x);
      case 2:
        return _STAR___4825.call(this, x, y);
      default:
        return _STAR___4826.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___4826.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___4836 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___4837 = function(x, y) {
    return x / y
  };
  var _SLASH___4838 = function() {
    var G__4840__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__4840 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4840__delegate.call(this, x, y, more)
    };
    G__4840.cljs$lang$maxFixedArity = 2;
    G__4840.cljs$lang$applyTo = function(arglist__4841) {
      var x = cljs.core.first(arglist__4841);
      var y = cljs.core.first(cljs.core.next(arglist__4841));
      var more = cljs.core.rest(cljs.core.next(arglist__4841));
      return G__4840__delegate.call(this, x, y, more)
    };
    return G__4840
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___4836.call(this, x);
      case 2:
        return _SLASH___4837.call(this, x, y);
      default:
        return _SLASH___4838.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___4838.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___4843 = function(x) {
    return true
  };
  var _LT___4844 = function(x, y) {
    return x < y
  };
  var _LT___4845 = function() {
    var G__4847__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4848 = y;
            var G__4849 = cljs.core.first.call(null, more);
            var G__4850 = cljs.core.next.call(null, more);
            x = G__4848;
            y = G__4849;
            more = G__4850;
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
    var G__4847 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4847__delegate.call(this, x, y, more)
    };
    G__4847.cljs$lang$maxFixedArity = 2;
    G__4847.cljs$lang$applyTo = function(arglist__4851) {
      var x = cljs.core.first(arglist__4851);
      var y = cljs.core.first(cljs.core.next(arglist__4851));
      var more = cljs.core.rest(cljs.core.next(arglist__4851));
      return G__4847__delegate.call(this, x, y, more)
    };
    return G__4847
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___4843.call(this, x);
      case 2:
        return _LT___4844.call(this, x, y);
      default:
        return _LT___4845.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___4845.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___4852 = function(x) {
    return true
  };
  var _LT__EQ___4853 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___4854 = function() {
    var G__4858__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4860 = y;
            var G__4861 = cljs.core.first.call(null, more);
            var G__4862 = cljs.core.next.call(null, more);
            x = G__4860;
            y = G__4861;
            more = G__4862;
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
    var G__4858 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4858__delegate.call(this, x, y, more)
    };
    G__4858.cljs$lang$maxFixedArity = 2;
    G__4858.cljs$lang$applyTo = function(arglist__4863) {
      var x = cljs.core.first(arglist__4863);
      var y = cljs.core.first(cljs.core.next(arglist__4863));
      var more = cljs.core.rest(cljs.core.next(arglist__4863));
      return G__4858__delegate.call(this, x, y, more)
    };
    return G__4858
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___4852.call(this, x);
      case 2:
        return _LT__EQ___4853.call(this, x, y);
      default:
        return _LT__EQ___4854.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___4854.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___4864 = function(x) {
    return true
  };
  var _GT___4866 = function(x, y) {
    return x > y
  };
  var _GT___4867 = function() {
    var G__4870__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4871 = y;
            var G__4872 = cljs.core.first.call(null, more);
            var G__4873 = cljs.core.next.call(null, more);
            x = G__4871;
            y = G__4872;
            more = G__4873;
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
    var G__4870 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4870__delegate.call(this, x, y, more)
    };
    G__4870.cljs$lang$maxFixedArity = 2;
    G__4870.cljs$lang$applyTo = function(arglist__4874) {
      var x = cljs.core.first(arglist__4874);
      var y = cljs.core.first(cljs.core.next(arglist__4874));
      var more = cljs.core.rest(cljs.core.next(arglist__4874));
      return G__4870__delegate.call(this, x, y, more)
    };
    return G__4870
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___4864.call(this, x);
      case 2:
        return _GT___4866.call(this, x, y);
      default:
        return _GT___4867.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___4867.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___4876 = function(x) {
    return true
  };
  var _GT__EQ___4877 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___4878 = function() {
    var G__4881__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4882 = y;
            var G__4883 = cljs.core.first.call(null, more);
            var G__4884 = cljs.core.next.call(null, more);
            x = G__4882;
            y = G__4883;
            more = G__4884;
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
    var G__4881 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4881__delegate.call(this, x, y, more)
    };
    G__4881.cljs$lang$maxFixedArity = 2;
    G__4881.cljs$lang$applyTo = function(arglist__4885) {
      var x = cljs.core.first(arglist__4885);
      var y = cljs.core.first(cljs.core.next(arglist__4885));
      var more = cljs.core.rest(cljs.core.next(arglist__4885));
      return G__4881__delegate.call(this, x, y, more)
    };
    return G__4881
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___4876.call(this, x);
      case 2:
        return _GT__EQ___4877.call(this, x, y);
      default:
        return _GT__EQ___4878.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___4878.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__4887 = function(x) {
    return x
  };
  var max__4888 = function(x, y) {
    return x > y ? x : y
  };
  var max__4889 = function() {
    var G__4891__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__4891 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4891__delegate.call(this, x, y, more)
    };
    G__4891.cljs$lang$maxFixedArity = 2;
    G__4891.cljs$lang$applyTo = function(arglist__4892) {
      var x = cljs.core.first(arglist__4892);
      var y = cljs.core.first(cljs.core.next(arglist__4892));
      var more = cljs.core.rest(cljs.core.next(arglist__4892));
      return G__4891__delegate.call(this, x, y, more)
    };
    return G__4891
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__4887.call(this, x);
      case 2:
        return max__4888.call(this, x, y);
      default:
        return max__4889.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__4889.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__4895 = function(x) {
    return x
  };
  var min__4896 = function(x, y) {
    return x < y ? x : y
  };
  var min__4897 = function() {
    var G__4899__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__4899 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4899__delegate.call(this, x, y, more)
    };
    G__4899.cljs$lang$maxFixedArity = 2;
    G__4899.cljs$lang$applyTo = function(arglist__4900) {
      var x = cljs.core.first(arglist__4900);
      var y = cljs.core.first(cljs.core.next(arglist__4900));
      var more = cljs.core.rest(cljs.core.next(arglist__4900));
      return G__4899__delegate.call(this, x, y, more)
    };
    return G__4899
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__4895.call(this, x);
      case 2:
        return min__4896.call(this, x, y);
      default:
        return min__4897.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__4897.cljs$lang$applyTo;
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
  var rem__4910 = n % d;
  return cljs.core.fix.call(null, (n - rem__4910) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__4914 = cljs.core.quot.call(null, n, d);
  return n - d * q__4914
};
cljs.core.rand = function() {
  var rand = null;
  var rand__4915 = function() {
    return Math.random.call(null)
  };
  var rand__4916 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__4915.call(this);
      case 1:
        return rand__4916.call(this, n)
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
  var _EQ__EQ___4938 = function(x) {
    return true
  };
  var _EQ__EQ___4939 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___4940 = function() {
    var G__4942__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4943 = y;
            var G__4944 = cljs.core.first.call(null, more);
            var G__4945 = cljs.core.next.call(null, more);
            x = G__4943;
            y = G__4944;
            more = G__4945;
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
    var G__4942 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4942__delegate.call(this, x, y, more)
    };
    G__4942.cljs$lang$maxFixedArity = 2;
    G__4942.cljs$lang$applyTo = function(arglist__4950) {
      var x = cljs.core.first(arglist__4950);
      var y = cljs.core.first(cljs.core.next(arglist__4950));
      var more = cljs.core.rest(cljs.core.next(arglist__4950));
      return G__4942__delegate.call(this, x, y, more)
    };
    return G__4942
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___4938.call(this, x);
      case 2:
        return _EQ__EQ___4939.call(this, x, y);
      default:
        return _EQ__EQ___4940.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___4940.cljs$lang$applyTo;
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
  var n__4958 = n;
  var xs__4959 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4960 = xs__4959;
      if(cljs.core.truth_(and__3546__auto____4960)) {
        return n__4958 > 0
      }else {
        return and__3546__auto____4960
      }
    }())) {
      var G__4966 = n__4958 - 1;
      var G__4967 = cljs.core.next.call(null, xs__4959);
      n__4958 = G__4966;
      xs__4959 = G__4967;
      continue
    }else {
      return xs__4959
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__4978 = null;
  var G__4978__4979 = function(coll, n) {
    var temp__3695__auto____4969 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____4969)) {
      var xs__4970 = temp__3695__auto____4969;
      return cljs.core.first.call(null, xs__4970)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__4978__4980 = function(coll, n, not_found) {
    var temp__3695__auto____4971 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____4971)) {
      var xs__4972 = temp__3695__auto____4971;
      return cljs.core.first.call(null, xs__4972)
    }else {
      return not_found
    }
  };
  G__4978 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4978__4979.call(this, coll, n);
      case 3:
        return G__4978__4980.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4978
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___4989 = function() {
    return""
  };
  var str_STAR___4991 = function(x) {
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
  var str_STAR___4992 = function() {
    var G__4994__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__4995 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__4996 = cljs.core.next.call(null, more);
            sb = G__4995;
            more = G__4996;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__4994 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__4994__delegate.call(this, x, ys)
    };
    G__4994.cljs$lang$maxFixedArity = 1;
    G__4994.cljs$lang$applyTo = function(arglist__4997) {
      var x = cljs.core.first(arglist__4997);
      var ys = cljs.core.rest(arglist__4997);
      return G__4994__delegate.call(this, x, ys)
    };
    return G__4994
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___4989.call(this);
      case 1:
        return str_STAR___4991.call(this, x);
      default:
        return str_STAR___4992.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___4992.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__5007 = function() {
    return""
  };
  var str__5008 = function(x) {
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
  var str__5009 = function() {
    var G__5017__delegate = function(x, ys) {
      return cljs.core.apply.call(null, cljs.core.str_STAR_, x, ys)
    };
    var G__5017 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__5017__delegate.call(this, x, ys)
    };
    G__5017.cljs$lang$maxFixedArity = 1;
    G__5017.cljs$lang$applyTo = function(arglist__5020) {
      var x = cljs.core.first(arglist__5020);
      var ys = cljs.core.rest(arglist__5020);
      return G__5017__delegate.call(this, x, ys)
    };
    return G__5017
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__5007.call(this);
      case 1:
        return str__5008.call(this, x);
      default:
        return str__5009.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__5009.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__5022 = function(s, start) {
    return s.substring(start)
  };
  var subs__5023 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__5022.call(this, s, start);
      case 3:
        return subs__5023.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__5034 = function(name) {
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
  var symbol__5035 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__5034.call(this, ns);
      case 2:
        return symbol__5035.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__5045 = function(name) {
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
  var keyword__5046 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__5045.call(this, ns);
      case 2:
        return keyword__5046.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__5049 = cljs.core.seq.call(null, x);
    var ys__5050 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__5049 === null)) {
        return ys__5050 === null
      }else {
        if(cljs.core.truth_(ys__5050 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__5049), cljs.core.first.call(null, ys__5050)))) {
            var G__5057 = cljs.core.next.call(null, xs__5049);
            var G__5058 = cljs.core.next.call(null, ys__5050);
            xs__5049 = G__5057;
            ys__5050 = G__5058;
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
  return cljs.core.reduce.call(null, function(p1__5063_SHARP_, p2__5064_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__5063_SHARP_, cljs.core.hash.call(null, p2__5064_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__5068__5069 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__5068__5069)) {
    var G__5072__5077 = cljs.core.first.call(null, G__5068__5069);
    var vec__5073__5078 = G__5072__5077;
    var key_name__5079 = cljs.core.nth.call(null, vec__5073__5078, 0, null);
    var f__5080 = cljs.core.nth.call(null, vec__5073__5078, 1, null);
    var G__5068__5081 = G__5068__5069;
    var G__5072__5082 = G__5072__5077;
    var G__5068__5083 = G__5068__5081;
    while(true) {
      var vec__5084__5085 = G__5072__5082;
      var key_name__5086 = cljs.core.nth.call(null, vec__5084__5085, 0, null);
      var f__5087 = cljs.core.nth.call(null, vec__5084__5085, 1, null);
      var G__5068__5088 = G__5068__5083;
      var str_name__5089 = cljs.core.name.call(null, key_name__5086);
      obj[str_name__5089] = f__5087;
      var temp__3698__auto____5090 = cljs.core.next.call(null, G__5068__5088);
      if(cljs.core.truth_(temp__3698__auto____5090)) {
        var G__5068__5091 = temp__3698__auto____5090;
        var G__5092 = cljs.core.first.call(null, G__5068__5091);
        var G__5093 = G__5068__5091;
        G__5072__5082 = G__5092;
        G__5068__5083 = G__5093;
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
  var this__5094 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5095 = this;
  return new cljs.core.List(this__5095.meta, o, coll, this__5095.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__5096 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__5097 = this;
  return this__5097.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__5098 = this;
  return this__5098.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__5099 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5100 = this;
  return this__5100.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5101 = this;
  return this__5101.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5102 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5103 = this;
  return new cljs.core.List(meta, this__5103.first, this__5103.rest, this__5103.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5104 = this;
  return this__5104.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5105 = this;
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
  var this__5118 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5119 = this;
  return new cljs.core.List(this__5119.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__5120 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__5123 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__5124 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__5125 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5126 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5127 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5129 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5131 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5132 = this;
  return this__5132.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5135 = this;
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
  list.cljs$lang$applyTo = function(arglist__5148) {
    var items = cljs.core.seq(arglist__5148);
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
  var this__5155 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__5156 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5157 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5161 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__5161.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5162 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5163 = this;
  return this__5163.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5164 = this;
  if(cljs.core.truth_(this__5164.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__5164.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5165 = this;
  return this__5165.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5166 = this;
  return new cljs.core.Cons(meta, this__5166.first, this__5166.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__5177 = null;
  var G__5177__5178 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__5177__5179 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__5177 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__5177__5178.call(this, string, f);
      case 3:
        return G__5177__5179.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5177
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__5183 = null;
  var G__5183__5184 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__5183__5185 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__5183 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5183__5184.call(this, string, k);
      case 3:
        return G__5183__5185.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5183
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__5187 = null;
  var G__5187__5188 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__5187__5189 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__5187 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5187__5188.call(this, string, n);
      case 3:
        return G__5187__5189.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5187
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
  var G__5220 = null;
  var G__5220__5221 = function(tsym5208, coll) {
    var tsym5208__5213 = this;
    var this$__5214 = tsym5208__5213;
    return cljs.core.get.call(null, coll, this$__5214.toString())
  };
  var G__5220__5222 = function(tsym5210, coll, not_found) {
    var tsym5210__5217 = this;
    var this$__5218 = tsym5210__5217;
    return cljs.core.get.call(null, coll, this$__5218.toString(), not_found)
  };
  G__5220 = function(tsym5210, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5220__5221.call(this, tsym5210, coll);
      case 3:
        return G__5220__5222.call(this, tsym5210, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5220
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__5235 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__5235
  }else {
    lazy_seq.x = x__5235.call(null);
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
  var this__5236 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__5237 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5238 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5240 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__5240.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5242 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5244 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5246 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5251 = this;
  return this__5251.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5253 = this;
  return new cljs.core.LazySeq(meta, this__5253.realized, this__5253.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__5257 = cljs.core.array.call(null);
  var s__5258 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__5258))) {
      ary__5257.push(cljs.core.first.call(null, s__5258));
      var G__5259 = cljs.core.next.call(null, s__5258);
      s__5258 = G__5259;
      continue
    }else {
      return ary__5257
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__5260 = s;
  var i__5261 = n;
  var sum__5262 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____5263 = i__5261 > 0;
      if(cljs.core.truth_(and__3546__auto____5263)) {
        return cljs.core.seq.call(null, s__5260)
      }else {
        return and__3546__auto____5263
      }
    }())) {
      var G__5265 = cljs.core.next.call(null, s__5260);
      var G__5266 = i__5261 - 1;
      var G__5267 = sum__5262 + 1;
      s__5260 = G__5265;
      i__5261 = G__5266;
      sum__5262 = G__5267;
      continue
    }else {
      return sum__5262
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
  var concat__5280 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__5281 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__5282 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__5277 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__5277)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__5277), concat.call(null, cljs.core.rest.call(null, s__5277), y))
      }else {
        return y
      }
    })
  };
  var concat__5283 = function() {
    var G__5285__delegate = function(x, y, zs) {
      var cat__5279 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__5278 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__5278)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__5278), cat.call(null, cljs.core.rest.call(null, xys__5278), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__5279.call(null, concat.call(null, x, y), zs)
    };
    var G__5285 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__5285__delegate.call(this, x, y, zs)
    };
    G__5285.cljs$lang$maxFixedArity = 2;
    G__5285.cljs$lang$applyTo = function(arglist__5286) {
      var x = cljs.core.first(arglist__5286);
      var y = cljs.core.first(cljs.core.next(arglist__5286));
      var zs = cljs.core.rest(cljs.core.next(arglist__5286));
      return G__5285__delegate.call(this, x, y, zs)
    };
    return G__5285
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__5280.call(this);
      case 1:
        return concat__5281.call(this, x);
      case 2:
        return concat__5282.call(this, x, y);
      default:
        return concat__5283.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__5283.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___5291 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___5292 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___5293 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___5294 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___5295 = function() {
    var G__5301__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__5301 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__5301__delegate.call(this, a, b, c, d, more)
    };
    G__5301.cljs$lang$maxFixedArity = 4;
    G__5301.cljs$lang$applyTo = function(arglist__5306) {
      var a = cljs.core.first(arglist__5306);
      var b = cljs.core.first(cljs.core.next(arglist__5306));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5306)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5306))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5306))));
      return G__5301__delegate.call(this, a, b, c, d, more)
    };
    return G__5301
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___5291.call(this, a);
      case 2:
        return list_STAR___5292.call(this, a, b);
      case 3:
        return list_STAR___5293.call(this, a, b, c);
      case 4:
        return list_STAR___5294.call(this, a, b, c, d);
      default:
        return list_STAR___5295.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___5295.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__5326 = function(f, args) {
    var fixed_arity__5307 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__5307 + 1) <= fixed_arity__5307)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__5327 = function(f, x, args) {
    var arglist__5308 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__5309 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5308, fixed_arity__5309) <= fixed_arity__5309)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5308))
      }else {
        return f.cljs$lang$applyTo(arglist__5308)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__5308))
    }
  };
  var apply__5328 = function(f, x, y, args) {
    var arglist__5314 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__5315 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5314, fixed_arity__5315) <= fixed_arity__5315)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5314))
      }else {
        return f.cljs$lang$applyTo(arglist__5314)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__5314))
    }
  };
  var apply__5329 = function(f, x, y, z, args) {
    var arglist__5318 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__5319 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5318, fixed_arity__5319) <= fixed_arity__5319)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5318))
      }else {
        return f.cljs$lang$applyTo(arglist__5318)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__5318))
    }
  };
  var apply__5330 = function() {
    var G__5333__delegate = function(f, a, b, c, d, args) {
      var arglist__5324 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__5325 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5324, fixed_arity__5325) <= fixed_arity__5325)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__5324))
        }else {
          return f.cljs$lang$applyTo(arglist__5324)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5324))
      }
    };
    var G__5333 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__5333__delegate.call(this, f, a, b, c, d, args)
    };
    G__5333.cljs$lang$maxFixedArity = 5;
    G__5333.cljs$lang$applyTo = function(arglist__5342) {
      var f = cljs.core.first(arglist__5342);
      var a = cljs.core.first(cljs.core.next(arglist__5342));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5342)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5342))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5342)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5342)))));
      return G__5333__delegate.call(this, f, a, b, c, d, args)
    };
    return G__5333
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__5326.call(this, f, a);
      case 3:
        return apply__5327.call(this, f, a, b);
      case 4:
        return apply__5328.call(this, f, a, b, c);
      case 5:
        return apply__5329.call(this, f, a, b, c, d);
      default:
        return apply__5330.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__5330.cljs$lang$applyTo;
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
  vary_meta.cljs$lang$applyTo = function(arglist__5344) {
    var obj = cljs.core.first(arglist__5344);
    var f = cljs.core.first(cljs.core.next(arglist__5344));
    var args = cljs.core.rest(cljs.core.next(arglist__5344));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___5345 = function(x) {
    return false
  };
  var not_EQ___5346 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___5347 = function() {
    var G__5350__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__5350 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__5350__delegate.call(this, x, y, more)
    };
    G__5350.cljs$lang$maxFixedArity = 2;
    G__5350.cljs$lang$applyTo = function(arglist__5352) {
      var x = cljs.core.first(arglist__5352);
      var y = cljs.core.first(cljs.core.next(arglist__5352));
      var more = cljs.core.rest(cljs.core.next(arglist__5352));
      return G__5350__delegate.call(this, x, y, more)
    };
    return G__5350
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___5345.call(this, x);
      case 2:
        return not_EQ___5346.call(this, x, y);
      default:
        return not_EQ___5347.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___5347.cljs$lang$applyTo;
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
        var G__5361 = pred;
        var G__5362 = cljs.core.next.call(null, coll);
        pred = G__5361;
        coll = G__5362;
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
      var or__3548__auto____5363 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____5363)) {
        return or__3548__auto____5363
      }else {
        var G__5364 = pred;
        var G__5365 = cljs.core.next.call(null, coll);
        pred = G__5364;
        coll = G__5365;
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
    var G__5376 = null;
    var G__5376__5377 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__5376__5378 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__5376__5379 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__5376__5380 = function() {
      var G__5382__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__5382 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__5382__delegate.call(this, x, y, zs)
      };
      G__5382.cljs$lang$maxFixedArity = 2;
      G__5382.cljs$lang$applyTo = function(arglist__5383) {
        var x = cljs.core.first(arglist__5383);
        var y = cljs.core.first(cljs.core.next(arglist__5383));
        var zs = cljs.core.rest(cljs.core.next(arglist__5383));
        return G__5382__delegate.call(this, x, y, zs)
      };
      return G__5382
    }();
    G__5376 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__5376__5377.call(this);
        case 1:
          return G__5376__5378.call(this, x);
        case 2:
          return G__5376__5379.call(this, x, y);
        default:
          return G__5376__5380.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__5376.cljs$lang$maxFixedArity = 2;
    G__5376.cljs$lang$applyTo = G__5376__5380.cljs$lang$applyTo;
    return G__5376
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__5390__delegate = function(args) {
      return x
    };
    var G__5390 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__5390__delegate.call(this, args)
    };
    G__5390.cljs$lang$maxFixedArity = 0;
    G__5390.cljs$lang$applyTo = function(arglist__5391) {
      var args = cljs.core.seq(arglist__5391);
      return G__5390__delegate.call(this, args)
    };
    return G__5390
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__5400 = function() {
    return cljs.core.identity
  };
  var comp__5401 = function(f) {
    return f
  };
  var comp__5402 = function(f, g) {
    return function() {
      var G__5407 = null;
      var G__5407__5409 = function() {
        return f.call(null, g.call(null))
      };
      var G__5407__5410 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__5407__5411 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__5407__5412 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__5407__5413 = function() {
        var G__5416__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__5416 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5416__delegate.call(this, x, y, z, args)
        };
        G__5416.cljs$lang$maxFixedArity = 3;
        G__5416.cljs$lang$applyTo = function(arglist__5418) {
          var x = cljs.core.first(arglist__5418);
          var y = cljs.core.first(cljs.core.next(arglist__5418));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5418)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5418)));
          return G__5416__delegate.call(this, x, y, z, args)
        };
        return G__5416
      }();
      G__5407 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__5407__5409.call(this);
          case 1:
            return G__5407__5410.call(this, x);
          case 2:
            return G__5407__5411.call(this, x, y);
          case 3:
            return G__5407__5412.call(this, x, y, z);
          default:
            return G__5407__5413.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5407.cljs$lang$maxFixedArity = 3;
      G__5407.cljs$lang$applyTo = G__5407__5413.cljs$lang$applyTo;
      return G__5407
    }()
  };
  var comp__5403 = function(f, g, h) {
    return function() {
      var G__5420 = null;
      var G__5420__5421 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__5420__5422 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__5420__5423 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__5420__5424 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__5420__5426 = function() {
        var G__5428__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__5428 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5428__delegate.call(this, x, y, z, args)
        };
        G__5428.cljs$lang$maxFixedArity = 3;
        G__5428.cljs$lang$applyTo = function(arglist__5435) {
          var x = cljs.core.first(arglist__5435);
          var y = cljs.core.first(cljs.core.next(arglist__5435));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5435)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5435)));
          return G__5428__delegate.call(this, x, y, z, args)
        };
        return G__5428
      }();
      G__5420 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__5420__5421.call(this);
          case 1:
            return G__5420__5422.call(this, x);
          case 2:
            return G__5420__5423.call(this, x, y);
          case 3:
            return G__5420__5424.call(this, x, y, z);
          default:
            return G__5420__5426.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5420.cljs$lang$maxFixedArity = 3;
      G__5420.cljs$lang$applyTo = G__5420__5426.cljs$lang$applyTo;
      return G__5420
    }()
  };
  var comp__5404 = function() {
    var G__5436__delegate = function(f1, f2, f3, fs) {
      var fs__5395 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__5437__delegate = function(args) {
          var ret__5396 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__5395), args);
          var fs__5397 = cljs.core.next.call(null, fs__5395);
          while(true) {
            if(cljs.core.truth_(fs__5397)) {
              var G__5438 = cljs.core.first.call(null, fs__5397).call(null, ret__5396);
              var G__5439 = cljs.core.next.call(null, fs__5397);
              ret__5396 = G__5438;
              fs__5397 = G__5439;
              continue
            }else {
              return ret__5396
            }
            break
          }
        };
        var G__5437 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__5437__delegate.call(this, args)
        };
        G__5437.cljs$lang$maxFixedArity = 0;
        G__5437.cljs$lang$applyTo = function(arglist__5440) {
          var args = cljs.core.seq(arglist__5440);
          return G__5437__delegate.call(this, args)
        };
        return G__5437
      }()
    };
    var G__5436 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__5436__delegate.call(this, f1, f2, f3, fs)
    };
    G__5436.cljs$lang$maxFixedArity = 3;
    G__5436.cljs$lang$applyTo = function(arglist__5441) {
      var f1 = cljs.core.first(arglist__5441);
      var f2 = cljs.core.first(cljs.core.next(arglist__5441));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5441)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5441)));
      return G__5436__delegate.call(this, f1, f2, f3, fs)
    };
    return G__5436
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__5400.call(this);
      case 1:
        return comp__5401.call(this, f1);
      case 2:
        return comp__5402.call(this, f1, f2);
      case 3:
        return comp__5403.call(this, f1, f2, f3);
      default:
        return comp__5404.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__5404.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__5442 = function(f, arg1) {
    return function() {
      var G__5447__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__5447 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__5447__delegate.call(this, args)
      };
      G__5447.cljs$lang$maxFixedArity = 0;
      G__5447.cljs$lang$applyTo = function(arglist__5448) {
        var args = cljs.core.seq(arglist__5448);
        return G__5447__delegate.call(this, args)
      };
      return G__5447
    }()
  };
  var partial__5443 = function(f, arg1, arg2) {
    return function() {
      var G__5450__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__5450 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__5450__delegate.call(this, args)
      };
      G__5450.cljs$lang$maxFixedArity = 0;
      G__5450.cljs$lang$applyTo = function(arglist__5451) {
        var args = cljs.core.seq(arglist__5451);
        return G__5450__delegate.call(this, args)
      };
      return G__5450
    }()
  };
  var partial__5444 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__5452__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__5452 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__5452__delegate.call(this, args)
      };
      G__5452.cljs$lang$maxFixedArity = 0;
      G__5452.cljs$lang$applyTo = function(arglist__5453) {
        var args = cljs.core.seq(arglist__5453);
        return G__5452__delegate.call(this, args)
      };
      return G__5452
    }()
  };
  var partial__5445 = function() {
    var G__5454__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__5455__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__5455 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__5455__delegate.call(this, args)
        };
        G__5455.cljs$lang$maxFixedArity = 0;
        G__5455.cljs$lang$applyTo = function(arglist__5457) {
          var args = cljs.core.seq(arglist__5457);
          return G__5455__delegate.call(this, args)
        };
        return G__5455
      }()
    };
    var G__5454 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__5454__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__5454.cljs$lang$maxFixedArity = 4;
    G__5454.cljs$lang$applyTo = function(arglist__5458) {
      var f = cljs.core.first(arglist__5458);
      var arg1 = cljs.core.first(cljs.core.next(arglist__5458));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5458)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5458))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5458))));
      return G__5454__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__5454
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__5442.call(this, f, arg1);
      case 3:
        return partial__5443.call(this, f, arg1, arg2);
      case 4:
        return partial__5444.call(this, f, arg1, arg2, arg3);
      default:
        return partial__5445.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__5445.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__5466 = function(f, x) {
    return function() {
      var G__5470 = null;
      var G__5470__5471 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__5470__5472 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__5470__5473 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__5470__5474 = function() {
        var G__5476__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__5476 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5476__delegate.call(this, a, b, c, ds)
        };
        G__5476.cljs$lang$maxFixedArity = 3;
        G__5476.cljs$lang$applyTo = function(arglist__5477) {
          var a = cljs.core.first(arglist__5477);
          var b = cljs.core.first(cljs.core.next(arglist__5477));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5477)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5477)));
          return G__5476__delegate.call(this, a, b, c, ds)
        };
        return G__5476
      }();
      G__5470 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__5470__5471.call(this, a);
          case 2:
            return G__5470__5472.call(this, a, b);
          case 3:
            return G__5470__5473.call(this, a, b, c);
          default:
            return G__5470__5474.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5470.cljs$lang$maxFixedArity = 3;
      G__5470.cljs$lang$applyTo = G__5470__5474.cljs$lang$applyTo;
      return G__5470
    }()
  };
  var fnil__5467 = function(f, x, y) {
    return function() {
      var G__5478 = null;
      var G__5478__5479 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__5478__5480 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__5478__5481 = function() {
        var G__5485__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__5485 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5485__delegate.call(this, a, b, c, ds)
        };
        G__5485.cljs$lang$maxFixedArity = 3;
        G__5485.cljs$lang$applyTo = function(arglist__5486) {
          var a = cljs.core.first(arglist__5486);
          var b = cljs.core.first(cljs.core.next(arglist__5486));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5486)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5486)));
          return G__5485__delegate.call(this, a, b, c, ds)
        };
        return G__5485
      }();
      G__5478 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__5478__5479.call(this, a, b);
          case 3:
            return G__5478__5480.call(this, a, b, c);
          default:
            return G__5478__5481.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5478.cljs$lang$maxFixedArity = 3;
      G__5478.cljs$lang$applyTo = G__5478__5481.cljs$lang$applyTo;
      return G__5478
    }()
  };
  var fnil__5468 = function(f, x, y, z) {
    return function() {
      var G__5488 = null;
      var G__5488__5489 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__5488__5490 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__5488__5491 = function() {
        var G__5495__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__5495 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5495__delegate.call(this, a, b, c, ds)
        };
        G__5495.cljs$lang$maxFixedArity = 3;
        G__5495.cljs$lang$applyTo = function(arglist__5496) {
          var a = cljs.core.first(arglist__5496);
          var b = cljs.core.first(cljs.core.next(arglist__5496));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5496)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5496)));
          return G__5495__delegate.call(this, a, b, c, ds)
        };
        return G__5495
      }();
      G__5488 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__5488__5489.call(this, a, b);
          case 3:
            return G__5488__5490.call(this, a, b, c);
          default:
            return G__5488__5491.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5488.cljs$lang$maxFixedArity = 3;
      G__5488.cljs$lang$applyTo = G__5488__5491.cljs$lang$applyTo;
      return G__5488
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__5466.call(this, f, x);
      case 3:
        return fnil__5467.call(this, f, x, y);
      case 4:
        return fnil__5468.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__5499 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____5497 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5497)) {
        var s__5498 = temp__3698__auto____5497;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__5498)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__5498)))
      }else {
        return null
      }
    })
  };
  return mapi__5499.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____5506 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____5506)) {
      var s__5507 = temp__3698__auto____5506;
      var x__5508 = f.call(null, cljs.core.first.call(null, s__5507));
      if(cljs.core.truth_(x__5508 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__5507))
      }else {
        return cljs.core.cons.call(null, x__5508, keep.call(null, f, cljs.core.rest.call(null, s__5507)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__5522 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____5519 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5519)) {
        var s__5520 = temp__3698__auto____5519;
        var x__5521 = f.call(null, idx, cljs.core.first.call(null, s__5520));
        if(cljs.core.truth_(x__5521 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__5520))
        }else {
          return cljs.core.cons.call(null, x__5521, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__5520)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__5522.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__5615 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__5620 = function() {
        return true
      };
      var ep1__5621 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__5622 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5546 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5546)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____5546
          }
        }())
      };
      var ep1__5623 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5548 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5548)) {
            var and__3546__auto____5549 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____5549)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____5549
            }
          }else {
            return and__3546__auto____5548
          }
        }())
      };
      var ep1__5624 = function() {
        var G__5636__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____5553 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____5553)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____5553
            }
          }())
        };
        var G__5636 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5636__delegate.call(this, x, y, z, args)
        };
        G__5636.cljs$lang$maxFixedArity = 3;
        G__5636.cljs$lang$applyTo = function(arglist__5637) {
          var x = cljs.core.first(arglist__5637);
          var y = cljs.core.first(cljs.core.next(arglist__5637));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5637)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5637)));
          return G__5636__delegate.call(this, x, y, z, args)
        };
        return G__5636
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__5620.call(this);
          case 1:
            return ep1__5621.call(this, x);
          case 2:
            return ep1__5622.call(this, x, y);
          case 3:
            return ep1__5623.call(this, x, y, z);
          default:
            return ep1__5624.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__5624.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__5616 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__5640 = function() {
        return true
      };
      var ep2__5641 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5558 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5558)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____5558
          }
        }())
      };
      var ep2__5642 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5559 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5559)) {
            var and__3546__auto____5561 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____5561)) {
              var and__3546__auto____5562 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____5562)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____5562
              }
            }else {
              return and__3546__auto____5561
            }
          }else {
            return and__3546__auto____5559
          }
        }())
      };
      var ep2__5643 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5564 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5564)) {
            var and__3546__auto____5565 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____5565)) {
              var and__3546__auto____5566 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____5566)) {
                var and__3546__auto____5568 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____5568)) {
                  var and__3546__auto____5569 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____5569)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____5569
                  }
                }else {
                  return and__3546__auto____5568
                }
              }else {
                return and__3546__auto____5566
              }
            }else {
              return and__3546__auto____5565
            }
          }else {
            return and__3546__auto____5564
          }
        }())
      };
      var ep2__5644 = function() {
        var G__5653__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____5573 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____5573)) {
              return cljs.core.every_QMARK_.call(null, function(p1__5511_SHARP_) {
                var and__3546__auto____5575 = p1.call(null, p1__5511_SHARP_);
                if(cljs.core.truth_(and__3546__auto____5575)) {
                  return p2.call(null, p1__5511_SHARP_)
                }else {
                  return and__3546__auto____5575
                }
              }, args)
            }else {
              return and__3546__auto____5573
            }
          }())
        };
        var G__5653 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5653__delegate.call(this, x, y, z, args)
        };
        G__5653.cljs$lang$maxFixedArity = 3;
        G__5653.cljs$lang$applyTo = function(arglist__5660) {
          var x = cljs.core.first(arglist__5660);
          var y = cljs.core.first(cljs.core.next(arglist__5660));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5660)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5660)));
          return G__5653__delegate.call(this, x, y, z, args)
        };
        return G__5653
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__5640.call(this);
          case 1:
            return ep2__5641.call(this, x);
          case 2:
            return ep2__5642.call(this, x, y);
          case 3:
            return ep2__5643.call(this, x, y, z);
          default:
            return ep2__5644.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__5644.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__5617 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__5662 = function() {
        return true
      };
      var ep3__5663 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5577 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5577)) {
            var and__3546__auto____5578 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5578)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____5578
            }
          }else {
            return and__3546__auto____5577
          }
        }())
      };
      var ep3__5664 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5579 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5579)) {
            var and__3546__auto____5580 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5580)) {
              var and__3546__auto____5581 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____5581)) {
                var and__3546__auto____5582 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____5582)) {
                  var and__3546__auto____5583 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____5583)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____5583
                  }
                }else {
                  return and__3546__auto____5582
                }
              }else {
                return and__3546__auto____5581
              }
            }else {
              return and__3546__auto____5580
            }
          }else {
            return and__3546__auto____5579
          }
        }())
      };
      var ep3__5665 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5584 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5584)) {
            var and__3546__auto____5585 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5585)) {
              var and__3546__auto____5586 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____5586)) {
                var and__3546__auto____5587 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____5587)) {
                  var and__3546__auto____5588 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____5588)) {
                    var and__3546__auto____5594 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____5594)) {
                      var and__3546__auto____5596 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____5596)) {
                        var and__3546__auto____5597 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____5597)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____5597
                        }
                      }else {
                        return and__3546__auto____5596
                      }
                    }else {
                      return and__3546__auto____5594
                    }
                  }else {
                    return and__3546__auto____5588
                  }
                }else {
                  return and__3546__auto____5587
                }
              }else {
                return and__3546__auto____5586
              }
            }else {
              return and__3546__auto____5585
            }
          }else {
            return and__3546__auto____5584
          }
        }())
      };
      var ep3__5666 = function() {
        var G__5671__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____5601 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____5601)) {
              return cljs.core.every_QMARK_.call(null, function(p1__5513_SHARP_) {
                var and__3546__auto____5603 = p1.call(null, p1__5513_SHARP_);
                if(cljs.core.truth_(and__3546__auto____5603)) {
                  var and__3546__auto____5604 = p2.call(null, p1__5513_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____5604)) {
                    return p3.call(null, p1__5513_SHARP_)
                  }else {
                    return and__3546__auto____5604
                  }
                }else {
                  return and__3546__auto____5603
                }
              }, args)
            }else {
              return and__3546__auto____5601
            }
          }())
        };
        var G__5671 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5671__delegate.call(this, x, y, z, args)
        };
        G__5671.cljs$lang$maxFixedArity = 3;
        G__5671.cljs$lang$applyTo = function(arglist__5673) {
          var x = cljs.core.first(arglist__5673);
          var y = cljs.core.first(cljs.core.next(arglist__5673));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5673)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5673)));
          return G__5671__delegate.call(this, x, y, z, args)
        };
        return G__5671
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__5662.call(this);
          case 1:
            return ep3__5663.call(this, x);
          case 2:
            return ep3__5664.call(this, x, y);
          case 3:
            return ep3__5665.call(this, x, y, z);
          default:
            return ep3__5666.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__5666.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__5618 = function() {
    var G__5676__delegate = function(p1, p2, p3, ps) {
      var ps__5608 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__5677 = function() {
          return true
        };
        var epn__5678 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__5514_SHARP_) {
            return p1__5514_SHARP_.call(null, x)
          }, ps__5608)
        };
        var epn__5679 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__5515_SHARP_) {
            var and__3546__auto____5611 = p1__5515_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5611)) {
              return p1__5515_SHARP_.call(null, y)
            }else {
              return and__3546__auto____5611
            }
          }, ps__5608)
        };
        var epn__5680 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__5517_SHARP_) {
            var and__3546__auto____5612 = p1__5517_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5612)) {
              var and__3546__auto____5613 = p1__5517_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____5613)) {
                return p1__5517_SHARP_.call(null, z)
              }else {
                return and__3546__auto____5613
              }
            }else {
              return and__3546__auto____5612
            }
          }, ps__5608)
        };
        var epn__5681 = function() {
          var G__5684__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____5614 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____5614)) {
                return cljs.core.every_QMARK_.call(null, function(p1__5518_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__5518_SHARP_, args)
                }, ps__5608)
              }else {
                return and__3546__auto____5614
              }
            }())
          };
          var G__5684 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__5684__delegate.call(this, x, y, z, args)
          };
          G__5684.cljs$lang$maxFixedArity = 3;
          G__5684.cljs$lang$applyTo = function(arglist__5690) {
            var x = cljs.core.first(arglist__5690);
            var y = cljs.core.first(cljs.core.next(arglist__5690));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5690)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5690)));
            return G__5684__delegate.call(this, x, y, z, args)
          };
          return G__5684
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__5677.call(this);
            case 1:
              return epn__5678.call(this, x);
            case 2:
              return epn__5679.call(this, x, y);
            case 3:
              return epn__5680.call(this, x, y, z);
            default:
              return epn__5681.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__5681.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__5676 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__5676__delegate.call(this, p1, p2, p3, ps)
    };
    G__5676.cljs$lang$maxFixedArity = 3;
    G__5676.cljs$lang$applyTo = function(arglist__5693) {
      var p1 = cljs.core.first(arglist__5693);
      var p2 = cljs.core.first(cljs.core.next(arglist__5693));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5693)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5693)));
      return G__5676__delegate.call(this, p1, p2, p3, ps)
    };
    return G__5676
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__5615.call(this, p1);
      case 2:
        return every_pred__5616.call(this, p1, p2);
      case 3:
        return every_pred__5617.call(this, p1, p2, p3);
      default:
        return every_pred__5618.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__5618.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__5776 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__5781 = function() {
        return null
      };
      var sp1__5782 = function(x) {
        return p.call(null, x)
      };
      var sp1__5783 = function(x, y) {
        var or__3548__auto____5697 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5697)) {
          return or__3548__auto____5697
        }else {
          return p.call(null, y)
        }
      };
      var sp1__5784 = function(x, y, z) {
        var or__3548__auto____5698 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5698)) {
          return or__3548__auto____5698
        }else {
          var or__3548__auto____5699 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____5699)) {
            return or__3548__auto____5699
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__5785 = function() {
        var G__5790__delegate = function(x, y, z, args) {
          var or__3548__auto____5700 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____5700)) {
            return or__3548__auto____5700
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__5790 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5790__delegate.call(this, x, y, z, args)
        };
        G__5790.cljs$lang$maxFixedArity = 3;
        G__5790.cljs$lang$applyTo = function(arglist__5791) {
          var x = cljs.core.first(arglist__5791);
          var y = cljs.core.first(cljs.core.next(arglist__5791));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5791)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5791)));
          return G__5790__delegate.call(this, x, y, z, args)
        };
        return G__5790
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__5781.call(this);
          case 1:
            return sp1__5782.call(this, x);
          case 2:
            return sp1__5783.call(this, x, y);
          case 3:
            return sp1__5784.call(this, x, y, z);
          default:
            return sp1__5785.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__5785.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__5777 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__5803 = function() {
        return null
      };
      var sp2__5804 = function(x) {
        var or__3548__auto____5707 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5707)) {
          return or__3548__auto____5707
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__5805 = function(x, y) {
        var or__3548__auto____5709 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5709)) {
          return or__3548__auto____5709
        }else {
          var or__3548__auto____5710 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____5710)) {
            return or__3548__auto____5710
          }else {
            var or__3548__auto____5711 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5711)) {
              return or__3548__auto____5711
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__5806 = function(x, y, z) {
        var or__3548__auto____5714 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5714)) {
          return or__3548__auto____5714
        }else {
          var or__3548__auto____5715 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____5715)) {
            return or__3548__auto____5715
          }else {
            var or__3548__auto____5717 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____5717)) {
              return or__3548__auto____5717
            }else {
              var or__3548__auto____5718 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____5718)) {
                return or__3548__auto____5718
              }else {
                var or__3548__auto____5719 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____5719)) {
                  return or__3548__auto____5719
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__5807 = function() {
        var G__5811__delegate = function(x, y, z, args) {
          var or__3548__auto____5722 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____5722)) {
            return or__3548__auto____5722
          }else {
            return cljs.core.some.call(null, function(p1__5532_SHARP_) {
              var or__3548__auto____5725 = p1.call(null, p1__5532_SHARP_);
              if(cljs.core.truth_(or__3548__auto____5725)) {
                return or__3548__auto____5725
              }else {
                return p2.call(null, p1__5532_SHARP_)
              }
            }, args)
          }
        };
        var G__5811 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5811__delegate.call(this, x, y, z, args)
        };
        G__5811.cljs$lang$maxFixedArity = 3;
        G__5811.cljs$lang$applyTo = function(arglist__5818) {
          var x = cljs.core.first(arglist__5818);
          var y = cljs.core.first(cljs.core.next(arglist__5818));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5818)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5818)));
          return G__5811__delegate.call(this, x, y, z, args)
        };
        return G__5811
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__5803.call(this);
          case 1:
            return sp2__5804.call(this, x);
          case 2:
            return sp2__5805.call(this, x, y);
          case 3:
            return sp2__5806.call(this, x, y, z);
          default:
            return sp2__5807.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__5807.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__5778 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__5819 = function() {
        return null
      };
      var sp3__5820 = function(x) {
        var or__3548__auto____5728 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5728)) {
          return or__3548__auto____5728
        }else {
          var or__3548__auto____5730 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____5730)) {
            return or__3548__auto____5730
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__5821 = function(x, y) {
        var or__3548__auto____5733 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5733)) {
          return or__3548__auto____5733
        }else {
          var or__3548__auto____5734 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____5734)) {
            return or__3548__auto____5734
          }else {
            var or__3548__auto____5735 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5735)) {
              return or__3548__auto____5735
            }else {
              var or__3548__auto____5737 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____5737)) {
                return or__3548__auto____5737
              }else {
                var or__3548__auto____5738 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____5738)) {
                  return or__3548__auto____5738
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__5822 = function(x, y, z) {
        var or__3548__auto____5740 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5740)) {
          return or__3548__auto____5740
        }else {
          var or__3548__auto____5741 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____5741)) {
            return or__3548__auto____5741
          }else {
            var or__3548__auto____5743 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5743)) {
              return or__3548__auto____5743
            }else {
              var or__3548__auto____5745 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____5745)) {
                return or__3548__auto____5745
              }else {
                var or__3548__auto____5746 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____5746)) {
                  return or__3548__auto____5746
                }else {
                  var or__3548__auto____5747 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____5747)) {
                    return or__3548__auto____5747
                  }else {
                    var or__3548__auto____5749 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____5749)) {
                      return or__3548__auto____5749
                    }else {
                      var or__3548__auto____5751 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____5751)) {
                        return or__3548__auto____5751
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
      var sp3__5823 = function() {
        var G__5827__delegate = function(x, y, z, args) {
          var or__3548__auto____5755 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____5755)) {
            return or__3548__auto____5755
          }else {
            return cljs.core.some.call(null, function(p1__5534_SHARP_) {
              var or__3548__auto____5756 = p1.call(null, p1__5534_SHARP_);
              if(cljs.core.truth_(or__3548__auto____5756)) {
                return or__3548__auto____5756
              }else {
                var or__3548__auto____5758 = p2.call(null, p1__5534_SHARP_);
                if(cljs.core.truth_(or__3548__auto____5758)) {
                  return or__3548__auto____5758
                }else {
                  return p3.call(null, p1__5534_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__5827 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5827__delegate.call(this, x, y, z, args)
        };
        G__5827.cljs$lang$maxFixedArity = 3;
        G__5827.cljs$lang$applyTo = function(arglist__5834) {
          var x = cljs.core.first(arglist__5834);
          var y = cljs.core.first(cljs.core.next(arglist__5834));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5834)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5834)));
          return G__5827__delegate.call(this, x, y, z, args)
        };
        return G__5827
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__5819.call(this);
          case 1:
            return sp3__5820.call(this, x);
          case 2:
            return sp3__5821.call(this, x, y);
          case 3:
            return sp3__5822.call(this, x, y, z);
          default:
            return sp3__5823.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__5823.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__5779 = function() {
    var G__5835__delegate = function(p1, p2, p3, ps) {
      var ps__5762 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__5836 = function() {
          return null
        };
        var spn__5837 = function(x) {
          return cljs.core.some.call(null, function(p1__5539_SHARP_) {
            return p1__5539_SHARP_.call(null, x)
          }, ps__5762)
        };
        var spn__5838 = function(x, y) {
          return cljs.core.some.call(null, function(p1__5542_SHARP_) {
            var or__3548__auto____5767 = p1__5542_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5767)) {
              return or__3548__auto____5767
            }else {
              return p1__5542_SHARP_.call(null, y)
            }
          }, ps__5762)
        };
        var spn__5839 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__5543_SHARP_) {
            var or__3548__auto____5768 = p1__5543_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5768)) {
              return or__3548__auto____5768
            }else {
              var or__3548__auto____5770 = p1__5543_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____5770)) {
                return or__3548__auto____5770
              }else {
                return p1__5543_SHARP_.call(null, z)
              }
            }
          }, ps__5762)
        };
        var spn__5840 = function() {
          var G__5843__delegate = function(x, y, z, args) {
            var or__3548__auto____5773 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____5773)) {
              return or__3548__auto____5773
            }else {
              return cljs.core.some.call(null, function(p1__5544_SHARP_) {
                return cljs.core.some.call(null, p1__5544_SHARP_, args)
              }, ps__5762)
            }
          };
          var G__5843 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__5843__delegate.call(this, x, y, z, args)
          };
          G__5843.cljs$lang$maxFixedArity = 3;
          G__5843.cljs$lang$applyTo = function(arglist__5845) {
            var x = cljs.core.first(arglist__5845);
            var y = cljs.core.first(cljs.core.next(arglist__5845));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5845)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5845)));
            return G__5843__delegate.call(this, x, y, z, args)
          };
          return G__5843
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__5836.call(this);
            case 1:
              return spn__5837.call(this, x);
            case 2:
              return spn__5838.call(this, x, y);
            case 3:
              return spn__5839.call(this, x, y, z);
            default:
              return spn__5840.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__5840.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__5835 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__5835__delegate.call(this, p1, p2, p3, ps)
    };
    G__5835.cljs$lang$maxFixedArity = 3;
    G__5835.cljs$lang$applyTo = function(arglist__5853) {
      var p1 = cljs.core.first(arglist__5853);
      var p2 = cljs.core.first(cljs.core.next(arglist__5853));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5853)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5853)));
      return G__5835__delegate.call(this, p1, p2, p3, ps)
    };
    return G__5835
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__5776.call(this, p1);
      case 2:
        return some_fn__5777.call(this, p1, p2);
      case 3:
        return some_fn__5778.call(this, p1, p2, p3);
      default:
        return some_fn__5779.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__5779.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__5884 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____5857 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5857)) {
        var s__5858 = temp__3698__auto____5857;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__5858)), map.call(null, f, cljs.core.rest.call(null, s__5858)))
      }else {
        return null
      }
    })
  };
  var map__5885 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__5860 = cljs.core.seq.call(null, c1);
      var s2__5861 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____5862 = s1__5860;
        if(cljs.core.truth_(and__3546__auto____5862)) {
          return s2__5861
        }else {
          return and__3546__auto____5862
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__5860), cljs.core.first.call(null, s2__5861)), map.call(null, f, cljs.core.rest.call(null, s1__5860), cljs.core.rest.call(null, s2__5861)))
      }else {
        return null
      }
    })
  };
  var map__5886 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__5866 = cljs.core.seq.call(null, c1);
      var s2__5867 = cljs.core.seq.call(null, c2);
      var s3__5868 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____5870 = s1__5866;
        if(cljs.core.truth_(and__3546__auto____5870)) {
          var and__3546__auto____5871 = s2__5867;
          if(cljs.core.truth_(and__3546__auto____5871)) {
            return s3__5868
          }else {
            return and__3546__auto____5871
          }
        }else {
          return and__3546__auto____5870
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__5866), cljs.core.first.call(null, s2__5867), cljs.core.first.call(null, s3__5868)), map.call(null, f, cljs.core.rest.call(null, s1__5866), cljs.core.rest.call(null, s2__5867), cljs.core.rest.call(null, s3__5868)))
      }else {
        return null
      }
    })
  };
  var map__5887 = function() {
    var G__5903__delegate = function(f, c1, c2, c3, colls) {
      var step__5880 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__5876 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__5876))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__5876), step.call(null, map.call(null, cljs.core.rest, ss__5876)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__5696_SHARP_) {
        return cljs.core.apply.call(null, f, p1__5696_SHARP_)
      }, step__5880.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__5903 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__5903__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__5903.cljs$lang$maxFixedArity = 4;
    G__5903.cljs$lang$applyTo = function(arglist__5909) {
      var f = cljs.core.first(arglist__5909);
      var c1 = cljs.core.first(cljs.core.next(arglist__5909));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5909)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5909))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5909))));
      return G__5903__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__5903
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__5884.call(this, f, c1);
      case 3:
        return map__5885.call(this, f, c1, c2);
      case 4:
        return map__5886.call(this, f, c1, c2, c3);
      default:
        return map__5887.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__5887.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____5913 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5913)) {
        var s__5915 = temp__3698__auto____5913;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__5915), take.call(null, n - 1, cljs.core.rest.call(null, s__5915)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__5931 = function(n, coll) {
    while(true) {
      var s__5928 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____5929 = n > 0;
        if(cljs.core.truth_(and__3546__auto____5929)) {
          return s__5928
        }else {
          return and__3546__auto____5929
        }
      }())) {
        var G__5933 = n - 1;
        var G__5934 = cljs.core.rest.call(null, s__5928);
        n = G__5933;
        coll = G__5934;
        continue
      }else {
        return s__5928
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__5931.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__5941 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__5942 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__5941.call(this, n);
      case 2:
        return drop_last__5942.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__5946 = cljs.core.seq.call(null, coll);
  var lead__5947 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__5947)) {
      var G__5954 = cljs.core.next.call(null, s__5946);
      var G__5955 = cljs.core.next.call(null, lead__5947);
      s__5946 = G__5954;
      lead__5947 = G__5955;
      continue
    }else {
      return s__5946
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__5958 = function(pred, coll) {
    while(true) {
      var s__5956 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____5957 = s__5956;
        if(cljs.core.truth_(and__3546__auto____5957)) {
          return pred.call(null, cljs.core.first.call(null, s__5956))
        }else {
          return and__3546__auto____5957
        }
      }())) {
        var G__5960 = pred;
        var G__5961 = cljs.core.rest.call(null, s__5956);
        pred = G__5960;
        coll = G__5961;
        continue
      }else {
        return s__5956
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__5958.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____5963 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____5963)) {
      var s__5964 = temp__3698__auto____5963;
      return cljs.core.concat.call(null, s__5964, cycle.call(null, s__5964))
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
  var repeat__5975 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__5976 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__5975.call(this, n);
      case 2:
        return repeat__5976.call(this, n, x)
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
  var repeatedly__5997 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__5998 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__5997.call(this, n);
      case 2:
        return repeatedly__5998.call(this, n, f)
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
  var interleave__6011 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__6004 = cljs.core.seq.call(null, c1);
      var s2__6005 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____6007 = s1__6004;
        if(cljs.core.truth_(and__3546__auto____6007)) {
          return s2__6005
        }else {
          return and__3546__auto____6007
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__6004), cljs.core.cons.call(null, cljs.core.first.call(null, s2__6005), interleave.call(null, cljs.core.rest.call(null, s1__6004), cljs.core.rest.call(null, s2__6005))))
      }else {
        return null
      }
    })
  };
  var interleave__6012 = function() {
    var G__6017__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__6008 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__6008))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__6008), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__6008)))
        }else {
          return null
        }
      })
    };
    var G__6017 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6017__delegate.call(this, c1, c2, colls)
    };
    G__6017.cljs$lang$maxFixedArity = 2;
    G__6017.cljs$lang$applyTo = function(arglist__6020) {
      var c1 = cljs.core.first(arglist__6020);
      var c2 = cljs.core.first(cljs.core.next(arglist__6020));
      var colls = cljs.core.rest(cljs.core.next(arglist__6020));
      return G__6017__delegate.call(this, c1, c2, colls)
    };
    return G__6017
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__6011.call(this, c1, c2);
      default:
        return interleave__6012.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__6012.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__6049 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____6026 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____6026)) {
        var coll__6027 = temp__3695__auto____6026;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__6027), cat.call(null, cljs.core.rest.call(null, coll__6027), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__6049.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__6054 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__6055 = function() {
    var G__6058__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__6058 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6058__delegate.call(this, f, coll, colls)
    };
    G__6058.cljs$lang$maxFixedArity = 2;
    G__6058.cljs$lang$applyTo = function(arglist__6060) {
      var f = cljs.core.first(arglist__6060);
      var coll = cljs.core.first(cljs.core.next(arglist__6060));
      var colls = cljs.core.rest(cljs.core.next(arglist__6060));
      return G__6058__delegate.call(this, f, coll, colls)
    };
    return G__6058
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__6054.call(this, f, coll);
      default:
        return mapcat__6055.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__6055.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6064 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6064)) {
      var s__6066 = temp__3698__auto____6064;
      var f__6067 = cljs.core.first.call(null, s__6066);
      var r__6068 = cljs.core.rest.call(null, s__6066);
      if(cljs.core.truth_(pred.call(null, f__6067))) {
        return cljs.core.cons.call(null, f__6067, filter.call(null, pred, r__6068))
      }else {
        return filter.call(null, pred, r__6068)
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
  var walk__6072 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__6072.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__6070_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__6070_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__6089 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__6090 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6073 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6073)) {
        var s__6074 = temp__3698__auto____6073;
        var p__6076 = cljs.core.take.call(null, n, s__6074);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__6076)))) {
          return cljs.core.cons.call(null, p__6076, partition.call(null, n, step, cljs.core.drop.call(null, step, s__6074)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__6091 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6079 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6079)) {
        var s__6081 = temp__3698__auto____6079;
        var p__6083 = cljs.core.take.call(null, n, s__6081);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__6083)))) {
          return cljs.core.cons.call(null, p__6083, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__6081)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__6083, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__6089.call(this, n, step);
      case 3:
        return partition__6090.call(this, n, step, pad);
      case 4:
        return partition__6091.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__6104 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__6105 = function(m, ks, not_found) {
    var sentinel__6097 = cljs.core.lookup_sentinel;
    var m__6098 = m;
    var ks__6099 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__6099)) {
        var m__6100 = cljs.core.get.call(null, m__6098, cljs.core.first.call(null, ks__6099), sentinel__6097);
        if(cljs.core.truth_(sentinel__6097 === m__6100)) {
          return not_found
        }else {
          var G__6110 = sentinel__6097;
          var G__6111 = m__6100;
          var G__6112 = cljs.core.next.call(null, ks__6099);
          sentinel__6097 = G__6110;
          m__6098 = G__6111;
          ks__6099 = G__6112;
          continue
        }
      }else {
        return m__6098
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__6104.call(this, m, ks);
      case 3:
        return get_in__6105.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__6118, v) {
  var vec__6119__6120 = p__6118;
  var k__6121 = cljs.core.nth.call(null, vec__6119__6120, 0, null);
  var ks__6122 = cljs.core.nthnext.call(null, vec__6119__6120, 1);
  if(cljs.core.truth_(ks__6122)) {
    return cljs.core.assoc.call(null, m, k__6121, assoc_in.call(null, cljs.core.get.call(null, m, k__6121), ks__6122, v))
  }else {
    return cljs.core.assoc.call(null, m, k__6121, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__6123, f, args) {
    var vec__6124__6125 = p__6123;
    var k__6126 = cljs.core.nth.call(null, vec__6124__6125, 0, null);
    var ks__6127 = cljs.core.nthnext.call(null, vec__6124__6125, 1);
    if(cljs.core.truth_(ks__6127)) {
      return cljs.core.assoc.call(null, m, k__6126, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__6126), ks__6127, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__6126, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__6126), args))
    }
  };
  var update_in = function(m, p__6123, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__6123, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__6133) {
    var m = cljs.core.first(arglist__6133);
    var p__6123 = cljs.core.first(cljs.core.next(arglist__6133));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6133)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6133)));
    return update_in__delegate.call(this, m, p__6123, f, args)
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
  var this__6135 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6201 = null;
  var G__6201__6203 = function(coll, k) {
    var this__6136 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__6201__6204 = function(coll, k, not_found) {
    var this__6137 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__6201 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6201__6203.call(this, coll, k);
      case 3:
        return G__6201__6204.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6201
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__6141 = this;
  var new_array__6144 = cljs.core.aclone.call(null, this__6141.array);
  new_array__6144[k] = v;
  return new cljs.core.Vector(this__6141.meta, new_array__6144)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__6209 = null;
  var G__6209__6210 = function(tsym6147, k) {
    var this__6150 = this;
    var tsym6147__6152 = this;
    var coll__6154 = tsym6147__6152;
    return cljs.core._lookup.call(null, coll__6154, k)
  };
  var G__6209__6212 = function(tsym6149, k, not_found) {
    var this__6156 = this;
    var tsym6149__6158 = this;
    var coll__6160 = tsym6149__6158;
    return cljs.core._lookup.call(null, coll__6160, k, not_found)
  };
  G__6209 = function(tsym6149, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6209__6210.call(this, tsym6149, k);
      case 3:
        return G__6209__6212.call(this, tsym6149, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6209
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6162 = this;
  var new_array__6164 = cljs.core.aclone.call(null, this__6162.array);
  new_array__6164.push(o);
  return new cljs.core.Vector(this__6162.meta, new_array__6164)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__6217 = null;
  var G__6217__6218 = function(v, f) {
    var this__6166 = this;
    return cljs.core.ci_reduce.call(null, this__6166.array, f)
  };
  var G__6217__6219 = function(v, f, start) {
    var this__6168 = this;
    return cljs.core.ci_reduce.call(null, this__6168.array, f, start)
  };
  G__6217 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__6217__6218.call(this, v, f);
      case 3:
        return G__6217__6219.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6217
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6170 = this;
  if(cljs.core.truth_(this__6170.array.length > 0)) {
    var vector_seq__6172 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__6170.array.length)) {
          return cljs.core.cons.call(null, this__6170.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__6172.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6174 = this;
  return this__6174.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__6176 = this;
  var count__6177 = this__6176.array.length;
  if(cljs.core.truth_(count__6177 > 0)) {
    return this__6176.array[count__6177 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__6179 = this;
  if(cljs.core.truth_(this__6179.array.length > 0)) {
    var new_array__6180 = cljs.core.aclone.call(null, this__6179.array);
    new_array__6180.pop();
    return new cljs.core.Vector(this__6179.meta, new_array__6180)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__6181 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6182 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6183 = this;
  return new cljs.core.Vector(meta, this__6183.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6184 = this;
  return this__6184.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__6225 = null;
  var G__6225__6226 = function(coll, n) {
    var this__6186 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____6187 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____6187)) {
        return n < this__6186.array.length
      }else {
        return and__3546__auto____6187
      }
    }())) {
      return this__6186.array[n]
    }else {
      return null
    }
  };
  var G__6225__6227 = function(coll, n, not_found) {
    var this__6189 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____6190 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____6190)) {
        return n < this__6189.array.length
      }else {
        return and__3546__auto____6190
      }
    }())) {
      return this__6189.array[n]
    }else {
      return not_found
    }
  };
  G__6225 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6225__6226.call(this, coll, n);
      case 3:
        return G__6225__6227.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6225
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6199 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__6199.meta)
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
  vector.cljs$lang$applyTo = function(arglist__6233) {
    var args = cljs.core.seq(arglist__6233);
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
  var this__6235 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6307 = null;
  var G__6307__6308 = function(coll, k) {
    var this__6262 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__6307__6309 = function(coll, k, not_found) {
    var this__6263 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__6307 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6307__6308.call(this, coll, k);
      case 3:
        return G__6307__6309.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6307
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__6265 = this;
  var v_pos__6266 = this__6265.start + key;
  return new cljs.core.Subvec(this__6265.meta, cljs.core._assoc.call(null, this__6265.v, v_pos__6266, val), this__6265.start, this__6265.end > v_pos__6266 + 1 ? this__6265.end : v_pos__6266 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__6311 = null;
  var G__6311__6312 = function(tsym6268, k) {
    var this__6270 = this;
    var tsym6268__6271 = this;
    var coll__6272 = tsym6268__6271;
    return cljs.core._lookup.call(null, coll__6272, k)
  };
  var G__6311__6313 = function(tsym6269, k, not_found) {
    var this__6277 = this;
    var tsym6269__6278 = this;
    var coll__6279 = tsym6269__6278;
    return cljs.core._lookup.call(null, coll__6279, k, not_found)
  };
  G__6311 = function(tsym6269, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6311__6312.call(this, tsym6269, k);
      case 3:
        return G__6311__6313.call(this, tsym6269, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6311
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6280 = this;
  return new cljs.core.Subvec(this__6280.meta, cljs.core._assoc_n.call(null, this__6280.v, this__6280.end, o), this__6280.start, this__6280.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__6318 = null;
  var G__6318__6319 = function(coll, f) {
    var this__6281 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__6318__6320 = function(coll, f, start) {
    var this__6286 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__6318 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__6318__6319.call(this, coll, f);
      case 3:
        return G__6318__6320.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6318
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6287 = this;
  var subvec_seq__6288 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__6287.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__6287.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__6288.call(null, this__6287.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6293 = this;
  return this__6293.end - this__6293.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__6294 = this;
  return cljs.core._nth.call(null, this__6294.v, this__6294.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__6295 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__6295.start, this__6295.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__6295.meta, this__6295.v, this__6295.start, this__6295.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__6296 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6297 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6298 = this;
  return new cljs.core.Subvec(meta, this__6298.v, this__6298.start, this__6298.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6299 = this;
  return this__6299.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__6331 = null;
  var G__6331__6332 = function(coll, n) {
    var this__6300 = this;
    return cljs.core._nth.call(null, this__6300.v, this__6300.start + n)
  };
  var G__6331__6333 = function(coll, n, not_found) {
    var this__6301 = this;
    return cljs.core._nth.call(null, this__6301.v, this__6301.start + n, not_found)
  };
  G__6331 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6331__6332.call(this, coll, n);
      case 3:
        return G__6331__6333.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6331
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6302 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__6302.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__6337 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__6338 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__6337.call(this, v, start);
      case 3:
        return subvec__6338.call(this, v, start, end)
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
  var this__6340 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__6341 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6342 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6343 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__6343.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6344 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__6345 = this;
  return cljs.core._first.call(null, this__6345.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__6346 = this;
  var temp__3695__auto____6347 = cljs.core.next.call(null, this__6346.front);
  if(cljs.core.truth_(temp__3695__auto____6347)) {
    var f1__6348 = temp__3695__auto____6347;
    return new cljs.core.PersistentQueueSeq(this__6346.meta, f1__6348, this__6346.rear)
  }else {
    if(cljs.core.truth_(this__6346.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__6346.meta, this__6346.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6350 = this;
  return this__6350.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6352 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__6352.front, this__6352.rear)
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
  var this__6364 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6366 = this;
  if(cljs.core.truth_(this__6366.front)) {
    return new cljs.core.PersistentQueue(this__6366.meta, this__6366.count + 1, this__6366.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____6368 = this__6366.rear;
      if(cljs.core.truth_(or__3548__auto____6368)) {
        return or__3548__auto____6368
      }else {
        return cljs.core.Vector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__6366.meta, this__6366.count + 1, cljs.core.conj.call(null, this__6366.front, o), cljs.core.Vector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6370 = this;
  var rear__6372 = cljs.core.seq.call(null, this__6370.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____6373 = this__6370.front;
    if(cljs.core.truth_(or__3548__auto____6373)) {
      return or__3548__auto____6373
    }else {
      return rear__6372
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__6370.front, cljs.core.seq.call(null, rear__6372))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6374 = this;
  return this__6374.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__6375 = this;
  return cljs.core._first.call(null, this__6375.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__6376 = this;
  if(cljs.core.truth_(this__6376.front)) {
    var temp__3695__auto____6377 = cljs.core.next.call(null, this__6376.front);
    if(cljs.core.truth_(temp__3695__auto____6377)) {
      var f1__6378 = temp__3695__auto____6377;
      return new cljs.core.PersistentQueue(this__6376.meta, this__6376.count - 1, f1__6378, this__6376.rear)
    }else {
      return new cljs.core.PersistentQueue(this__6376.meta, this__6376.count - 1, cljs.core.seq.call(null, this__6376.rear), cljs.core.Vector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__6379 = this;
  return cljs.core.first.call(null, this__6379.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__6380 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6381 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6382 = this;
  return new cljs.core.PersistentQueue(meta, this__6382.count, this__6382.front, this__6382.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6383 = this;
  return this__6383.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6384 = this;
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
  var this__6386 = this;
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
  var len__6391 = array.length;
  var i__6393 = 0;
  while(true) {
    if(cljs.core.truth_(i__6393 < len__6391)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__6393]))) {
        return i__6393
      }else {
        var G__6396 = i__6393 + incr;
        i__6393 = G__6396;
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
  var obj_map_contains_key_QMARK___6401 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___6402 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____6398 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____6398)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____6398
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
        return obj_map_contains_key_QMARK___6401.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___6402.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__6405 = cljs.core.hash.call(null, a);
  var b__6407 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__6405 < b__6407)) {
    return-1
  }else {
    if(cljs.core.truth_(a__6405 > b__6407)) {
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
  var this__6415 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6465 = null;
  var G__6465__6466 = function(coll, k) {
    var this__6416 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__6465__6467 = function(coll, k, not_found) {
    var this__6417 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__6417.strobj, this__6417.strobj[k], not_found)
  };
  G__6465 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6465__6466.call(this, coll, k);
      case 3:
        return G__6465__6467.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6465
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__6418 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__6419 = goog.object.clone.call(null, this__6418.strobj);
    var overwrite_QMARK___6422 = new_strobj__6419.hasOwnProperty(k);
    new_strobj__6419[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___6422)) {
      return new cljs.core.ObjMap(this__6418.meta, this__6418.keys, new_strobj__6419)
    }else {
      var new_keys__6425 = cljs.core.aclone.call(null, this__6418.keys);
      new_keys__6425.push(k);
      return new cljs.core.ObjMap(this__6418.meta, new_keys__6425, new_strobj__6419)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__6418.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__6430 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__6430.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__6473 = null;
  var G__6473__6474 = function(tsym6431, k) {
    var this__6434 = this;
    var tsym6431__6435 = this;
    var coll__6436 = tsym6431__6435;
    return cljs.core._lookup.call(null, coll__6436, k)
  };
  var G__6473__6475 = function(tsym6433, k, not_found) {
    var this__6438 = this;
    var tsym6433__6439 = this;
    var coll__6440 = tsym6433__6439;
    return cljs.core._lookup.call(null, coll__6440, k, not_found)
  };
  G__6473 = function(tsym6433, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6473__6474.call(this, tsym6433, k);
      case 3:
        return G__6473__6475.call(this, tsym6433, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6473
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__6441 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6444 = this;
  if(cljs.core.truth_(this__6444.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__6404_SHARP_) {
      return cljs.core.vector.call(null, p1__6404_SHARP_, this__6444.strobj[p1__6404_SHARP_])
    }, this__6444.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6447 = this;
  return this__6447.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6449 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6452 = this;
  return new cljs.core.ObjMap(meta, this__6452.keys, this__6452.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6454 = this;
  return this__6454.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6456 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__6456.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__6457 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____6458 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____6458)) {
      return this__6457.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____6458
    }
  }())) {
    var new_keys__6459 = cljs.core.aclone.call(null, this__6457.keys);
    var new_strobj__6460 = goog.object.clone.call(null, this__6457.strobj);
    new_keys__6459.splice(cljs.core.scan_array.call(null, 1, k, new_keys__6459), 1);
    cljs.core.js_delete.call(null, new_strobj__6460, k);
    return new cljs.core.ObjMap(this__6457.meta, new_keys__6459, new_strobj__6460)
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
  var this__6479 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6563 = null;
  var G__6563__6564 = function(coll, k) {
    var this__6481 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__6563__6565 = function(coll, k, not_found) {
    var this__6483 = this;
    var bucket__6485 = this__6483.hashobj[cljs.core.hash.call(null, k)];
    var i__6487 = cljs.core.truth_(bucket__6485) ? cljs.core.scan_array.call(null, 2, k, bucket__6485) : null;
    if(cljs.core.truth_(i__6487)) {
      return bucket__6485[i__6487 + 1]
    }else {
      return not_found
    }
  };
  G__6563 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6563__6564.call(this, coll, k);
      case 3:
        return G__6563__6565.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6563
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__6490 = this;
  var h__6492 = cljs.core.hash.call(null, k);
  var bucket__6494 = this__6490.hashobj[h__6492];
  if(cljs.core.truth_(bucket__6494)) {
    var new_bucket__6496 = cljs.core.aclone.call(null, bucket__6494);
    var new_hashobj__6498 = goog.object.clone.call(null, this__6490.hashobj);
    new_hashobj__6498[h__6492] = new_bucket__6496;
    var temp__3695__auto____6499 = cljs.core.scan_array.call(null, 2, k, new_bucket__6496);
    if(cljs.core.truth_(temp__3695__auto____6499)) {
      var i__6501 = temp__3695__auto____6499;
      new_bucket__6496[i__6501 + 1] = v;
      return new cljs.core.HashMap(this__6490.meta, this__6490.count, new_hashobj__6498)
    }else {
      new_bucket__6496.push(k, v);
      return new cljs.core.HashMap(this__6490.meta, this__6490.count + 1, new_hashobj__6498)
    }
  }else {
    var new_hashobj__6503 = goog.object.clone.call(null, this__6490.hashobj);
    new_hashobj__6503[h__6492] = cljs.core.array.call(null, k, v);
    return new cljs.core.HashMap(this__6490.meta, this__6490.count + 1, new_hashobj__6503)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__6505 = this;
  var bucket__6507 = this__6505.hashobj[cljs.core.hash.call(null, k)];
  var i__6509 = cljs.core.truth_(bucket__6507) ? cljs.core.scan_array.call(null, 2, k, bucket__6507) : null;
  if(cljs.core.truth_(i__6509)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__6568 = null;
  var G__6568__6570 = function(tsym6511, k) {
    var this__6515 = this;
    var tsym6511__6517 = this;
    var coll__6519 = tsym6511__6517;
    return cljs.core._lookup.call(null, coll__6519, k)
  };
  var G__6568__6572 = function(tsym6512, k, not_found) {
    var this__6521 = this;
    var tsym6512__6523 = this;
    var coll__6525 = tsym6512__6523;
    return cljs.core._lookup.call(null, coll__6525, k, not_found)
  };
  G__6568 = function(tsym6512, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6568__6570.call(this, tsym6512, k);
      case 3:
        return G__6568__6572.call(this, tsym6512, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6568
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__6527 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6529 = this;
  if(cljs.core.truth_(this__6529.count > 0)) {
    var hashes__6531 = cljs.core.js_keys.call(null, this__6529.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__6477_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__6529.hashobj[p1__6477_SHARP_]))
    }, hashes__6531)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6548 = this;
  return this__6548.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6549 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6550 = this;
  return new cljs.core.HashMap(meta, this__6550.count, this__6550.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6551 = this;
  return this__6551.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6552 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__6552.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__6553 = this;
  var h__6555 = cljs.core.hash.call(null, k);
  var bucket__6559 = this__6553.hashobj[h__6555];
  var i__6560 = cljs.core.truth_(bucket__6559) ? cljs.core.scan_array.call(null, 2, k, bucket__6559) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__6560))) {
    return coll
  }else {
    var new_hashobj__6561 = goog.object.clone.call(null, this__6553.hashobj);
    if(cljs.core.truth_(3 > bucket__6559.length)) {
      cljs.core.js_delete.call(null, new_hashobj__6561, h__6555)
    }else {
      var new_bucket__6562 = cljs.core.aclone.call(null, bucket__6559);
      new_bucket__6562.splice(i__6560, 2);
      new_hashobj__6561[h__6555] = new_bucket__6562
    }
    return new cljs.core.HashMap(this__6553.meta, this__6553.count - 1, new_hashobj__6561)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__6583 = ks.length;
  var i__6584 = 0;
  var out__6585 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__6584 < len__6583)) {
      var G__6587 = i__6584 + 1;
      var G__6588 = cljs.core.assoc.call(null, out__6585, ks[i__6584], vs[i__6584]);
      i__6584 = G__6587;
      out__6585 = G__6588;
      continue
    }else {
      return out__6585
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__6589 = cljs.core.seq.call(null, keyvals);
    var out__6590 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__6589)) {
        var G__6592 = cljs.core.nnext.call(null, in$__6589);
        var G__6593 = cljs.core.assoc.call(null, out__6590, cljs.core.first.call(null, in$__6589), cljs.core.second.call(null, in$__6589));
        in$__6589 = G__6592;
        out__6590 = G__6593;
        continue
      }else {
        return out__6590
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
  hash_map.cljs$lang$applyTo = function(arglist__6594) {
    var keyvals = cljs.core.seq(arglist__6594);
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
      return cljs.core.reduce.call(null, function(p1__6600_SHARP_, p2__6601_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____6602 = p1__6600_SHARP_;
          if(cljs.core.truth_(or__3548__auto____6602)) {
            return or__3548__auto____6602
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__6601_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__6605) {
    var maps = cljs.core.seq(arglist__6605);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__6612 = function(m, e) {
        var k__6610 = cljs.core.first.call(null, e);
        var v__6611 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__6610))) {
          return cljs.core.assoc.call(null, m, k__6610, f.call(null, cljs.core.get.call(null, m, k__6610), v__6611))
        }else {
          return cljs.core.assoc.call(null, m, k__6610, v__6611)
        }
      };
      var merge2__6616 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__6612, function() {
          var or__3548__auto____6613 = m1;
          if(cljs.core.truth_(or__3548__auto____6613)) {
            return or__3548__auto____6613
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__6616, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__6617) {
    var f = cljs.core.first(arglist__6617);
    var maps = cljs.core.rest(arglist__6617);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__6623 = cljs.core.ObjMap.fromObject([], {});
  var keys__6625 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__6625)) {
      var key__6627 = cljs.core.first.call(null, keys__6625);
      var entry__6629 = cljs.core.get.call(null, map, key__6627, "\ufdd0'user/not-found");
      var G__6635 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__6629, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__6623, key__6627, entry__6629) : ret__6623;
      var G__6636 = cljs.core.next.call(null, keys__6625);
      ret__6623 = G__6635;
      keys__6625 = G__6636;
      continue
    }else {
      return ret__6623
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
  var this__6644 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6675 = null;
  var G__6675__6676 = function(coll, v) {
    var this__6647 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__6675__6677 = function(coll, v, not_found) {
    var this__6648 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__6648.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__6675 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6675__6676.call(this, coll, v);
      case 3:
        return G__6675__6677.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6675
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__6682 = null;
  var G__6682__6683 = function(tsym6649, k) {
    var this__6651 = this;
    var tsym6649__6652 = this;
    var coll__6653 = tsym6649__6652;
    return cljs.core._lookup.call(null, coll__6653, k)
  };
  var G__6682__6684 = function(tsym6650, k, not_found) {
    var this__6658 = this;
    var tsym6650__6659 = this;
    var coll__6660 = tsym6650__6659;
    return cljs.core._lookup.call(null, coll__6660, k, not_found)
  };
  G__6682 = function(tsym6650, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6682__6683.call(this, tsym6650, k);
      case 3:
        return G__6682__6684.call(this, tsym6650, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6682
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6661 = this;
  return new cljs.core.Set(this__6661.meta, cljs.core.assoc.call(null, this__6661.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6666 = this;
  return cljs.core.keys.call(null, this__6666.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__6667 = this;
  return new cljs.core.Set(this__6667.meta, cljs.core.dissoc.call(null, this__6667.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6668 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6669 = this;
  var and__3546__auto____6670 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____6670)) {
    var and__3546__auto____6671 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____6671)) {
      return cljs.core.every_QMARK_.call(null, function(p1__6619_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__6619_SHARP_)
      }, other)
    }else {
      return and__3546__auto____6671
    }
  }else {
    return and__3546__auto____6670
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6672 = this;
  return new cljs.core.Set(meta, this__6672.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6673 = this;
  return this__6673.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6674 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__6674.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__6694 = cljs.core.seq.call(null, coll);
  var out__6695 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__6694)))) {
      var G__6701 = cljs.core.rest.call(null, in$__6694);
      var G__6702 = cljs.core.conj.call(null, out__6695, cljs.core.first.call(null, in$__6694));
      in$__6694 = G__6701;
      out__6695 = G__6702;
      continue
    }else {
      return out__6695
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__6706 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____6707 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____6707)) {
        var e__6708 = temp__3695__auto____6707;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__6708))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__6706, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__6693_SHARP_) {
      var temp__3695__auto____6711 = cljs.core.find.call(null, smap, p1__6693_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____6711)) {
        var e__6712 = temp__3695__auto____6711;
        return cljs.core.second.call(null, e__6712)
      }else {
        return p1__6693_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__6726 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__6718, seen) {
        while(true) {
          var vec__6719__6720 = p__6718;
          var f__6722 = cljs.core.nth.call(null, vec__6719__6720, 0, null);
          var xs__6723 = vec__6719__6720;
          var temp__3698__auto____6724 = cljs.core.seq.call(null, xs__6723);
          if(cljs.core.truth_(temp__3698__auto____6724)) {
            var s__6725 = temp__3698__auto____6724;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__6722))) {
              var G__6727 = cljs.core.rest.call(null, s__6725);
              var G__6728 = seen;
              p__6718 = G__6727;
              seen = G__6728;
              continue
            }else {
              return cljs.core.cons.call(null, f__6722, step.call(null, cljs.core.rest.call(null, s__6725), cljs.core.conj.call(null, seen, f__6722)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__6726.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__6731 = cljs.core.Vector.fromArray([]);
  var s__6732 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__6732))) {
      var G__6733 = cljs.core.conj.call(null, ret__6731, cljs.core.first.call(null, s__6732));
      var G__6734 = cljs.core.next.call(null, s__6732);
      ret__6731 = G__6733;
      s__6732 = G__6734;
      continue
    }else {
      return cljs.core.seq.call(null, ret__6731)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____6737 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____6737)) {
        return or__3548__auto____6737
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__6741 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__6741 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__6741 + 1)
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
    var or__3548__auto____6748 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____6748)) {
      return or__3548__auto____6748
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__6749 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__6749 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__6749)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__6758 = cljs.core.ObjMap.fromObject([], {});
  var ks__6759 = cljs.core.seq.call(null, keys);
  var vs__6760 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____6761 = ks__6759;
      if(cljs.core.truth_(and__3546__auto____6761)) {
        return vs__6760
      }else {
        return and__3546__auto____6761
      }
    }())) {
      var G__6767 = cljs.core.assoc.call(null, map__6758, cljs.core.first.call(null, ks__6759), cljs.core.first.call(null, vs__6760));
      var G__6768 = cljs.core.next.call(null, ks__6759);
      var G__6769 = cljs.core.next.call(null, vs__6760);
      map__6758 = G__6767;
      ks__6759 = G__6768;
      vs__6760 = G__6769;
      continue
    }else {
      return map__6758
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__6773 = function(k, x) {
    return x
  };
  var max_key__6775 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__6776 = function() {
    var G__6779__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__6756_SHARP_, p2__6757_SHARP_) {
        return max_key.call(null, k, p1__6756_SHARP_, p2__6757_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__6779 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6779__delegate.call(this, k, x, y, more)
    };
    G__6779.cljs$lang$maxFixedArity = 3;
    G__6779.cljs$lang$applyTo = function(arglist__6780) {
      var k = cljs.core.first(arglist__6780);
      var x = cljs.core.first(cljs.core.next(arglist__6780));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6780)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6780)));
      return G__6779__delegate.call(this, k, x, y, more)
    };
    return G__6779
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__6773.call(this, k, x);
      case 3:
        return max_key__6775.call(this, k, x, y);
      default:
        return max_key__6776.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__6776.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__6784 = function(k, x) {
    return x
  };
  var min_key__6785 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__6786 = function() {
    var G__6789__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__6771_SHARP_, p2__6772_SHARP_) {
        return min_key.call(null, k, p1__6771_SHARP_, p2__6772_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__6789 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6789__delegate.call(this, k, x, y, more)
    };
    G__6789.cljs$lang$maxFixedArity = 3;
    G__6789.cljs$lang$applyTo = function(arglist__6791) {
      var k = cljs.core.first(arglist__6791);
      var x = cljs.core.first(cljs.core.next(arglist__6791));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6791)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6791)));
      return G__6789__delegate.call(this, k, x, y, more)
    };
    return G__6789
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__6784.call(this, k, x);
      case 3:
        return min_key__6785.call(this, k, x, y);
      default:
        return min_key__6786.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__6786.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__6794 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__6795 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6792 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6792)) {
        var s__6793 = temp__3698__auto____6792;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__6793), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__6793)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__6794.call(this, n, step);
      case 3:
        return partition_all__6795.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6801 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6801)) {
      var s__6803 = temp__3698__auto____6801;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__6803)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__6803), take_while.call(null, pred, cljs.core.rest.call(null, s__6803)))
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
  var this__6816 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__6817 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__6841 = null;
  var G__6841__6842 = function(rng, f) {
    var this__6818 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__6841__6843 = function(rng, f, s) {
    var this__6820 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__6841 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__6841__6842.call(this, rng, f);
      case 3:
        return G__6841__6843.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6841
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__6824 = this;
  var comp__6825 = cljs.core.truth_(this__6824.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__6825.call(null, this__6824.start, this__6824.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__6826 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__6826.end - this__6826.start) / this__6826.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__6827 = this;
  return this__6827.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__6828 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__6828.meta, this__6828.start + this__6828.step, this__6828.end, this__6828.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__6829 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__6834 = this;
  return new cljs.core.Range(meta, this__6834.start, this__6834.end, this__6834.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__6835 = this;
  return this__6835.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__6850 = null;
  var G__6850__6851 = function(rng, n) {
    var this__6836 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__6836.start + n * this__6836.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____6837 = this__6836.start > this__6836.end;
        if(cljs.core.truth_(and__3546__auto____6837)) {
          return cljs.core._EQ_.call(null, this__6836.step, 0)
        }else {
          return and__3546__auto____6837
        }
      }())) {
        return this__6836.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__6850__6852 = function(rng, n, not_found) {
    var this__6838 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__6838.start + n * this__6838.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____6839 = this__6838.start > this__6838.end;
        if(cljs.core.truth_(and__3546__auto____6839)) {
          return cljs.core._EQ_.call(null, this__6838.step, 0)
        }else {
          return and__3546__auto____6839
        }
      }())) {
        return this__6838.start
      }else {
        return not_found
      }
    }
  };
  G__6850 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6850__6851.call(this, rng, n);
      case 3:
        return G__6850__6852.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6850
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__6840 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__6840.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__6857 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__6858 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__6859 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__6860 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__6857.call(this);
      case 1:
        return range__6858.call(this, start);
      case 2:
        return range__6859.call(this, start, end);
      case 3:
        return range__6860.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6867 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6867)) {
      var s__6868 = temp__3698__auto____6867;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__6868), take_nth.call(null, n, cljs.core.drop.call(null, n, s__6868)))
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
    var temp__3698__auto____6872 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6872)) {
      var s__6876 = temp__3698__auto____6872;
      var fst__6880 = cljs.core.first.call(null, s__6876);
      var fv__6881 = f.call(null, fst__6880);
      var run__6884 = cljs.core.cons.call(null, fst__6880, cljs.core.take_while.call(null, function(p1__6869_SHARP_) {
        return cljs.core._EQ_.call(null, fv__6881, f.call(null, p1__6869_SHARP_))
      }, cljs.core.next.call(null, s__6876)));
      return cljs.core.cons.call(null, run__6884, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__6884), s__6876))))
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
  var reductions__6906 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____6902 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____6902)) {
        var s__6903 = temp__3695__auto____6902;
        return reductions.call(null, f, cljs.core.first.call(null, s__6903), cljs.core.rest.call(null, s__6903))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__6907 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6904 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6904)) {
        var s__6905 = temp__3698__auto____6904;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__6905)), cljs.core.rest.call(null, s__6905))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__6906.call(this, f, init);
      case 3:
        return reductions__6907.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__6911 = function(f) {
    return function() {
      var G__6920 = null;
      var G__6920__6922 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__6920__6923 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__6920__6924 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__6920__6925 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__6920__6926 = function() {
        var G__6935__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__6935 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__6935__delegate.call(this, x, y, z, args)
        };
        G__6935.cljs$lang$maxFixedArity = 3;
        G__6935.cljs$lang$applyTo = function(arglist__6937) {
          var x = cljs.core.first(arglist__6937);
          var y = cljs.core.first(cljs.core.next(arglist__6937));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6937)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6937)));
          return G__6935__delegate.call(this, x, y, z, args)
        };
        return G__6935
      }();
      G__6920 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__6920__6922.call(this);
          case 1:
            return G__6920__6923.call(this, x);
          case 2:
            return G__6920__6924.call(this, x, y);
          case 3:
            return G__6920__6925.call(this, x, y, z);
          default:
            return G__6920__6926.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__6920.cljs$lang$maxFixedArity = 3;
      G__6920.cljs$lang$applyTo = G__6920__6926.cljs$lang$applyTo;
      return G__6920
    }()
  };
  var juxt__6912 = function(f, g) {
    return function() {
      var G__6939 = null;
      var G__6939__6940 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__6939__6941 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__6939__6942 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__6939__6943 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__6939__6944 = function() {
        var G__6953__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__6953 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__6953__delegate.call(this, x, y, z, args)
        };
        G__6953.cljs$lang$maxFixedArity = 3;
        G__6953.cljs$lang$applyTo = function(arglist__6955) {
          var x = cljs.core.first(arglist__6955);
          var y = cljs.core.first(cljs.core.next(arglist__6955));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6955)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6955)));
          return G__6953__delegate.call(this, x, y, z, args)
        };
        return G__6953
      }();
      G__6939 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__6939__6940.call(this);
          case 1:
            return G__6939__6941.call(this, x);
          case 2:
            return G__6939__6942.call(this, x, y);
          case 3:
            return G__6939__6943.call(this, x, y, z);
          default:
            return G__6939__6944.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__6939.cljs$lang$maxFixedArity = 3;
      G__6939.cljs$lang$applyTo = G__6939__6944.cljs$lang$applyTo;
      return G__6939
    }()
  };
  var juxt__6913 = function(f, g, h) {
    return function() {
      var G__6957 = null;
      var G__6957__6958 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__6957__6959 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__6957__6960 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__6957__6961 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__6957__6962 = function() {
        var G__6971__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__6971 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__6971__delegate.call(this, x, y, z, args)
        };
        G__6971.cljs$lang$maxFixedArity = 3;
        G__6971.cljs$lang$applyTo = function(arglist__6973) {
          var x = cljs.core.first(arglist__6973);
          var y = cljs.core.first(cljs.core.next(arglist__6973));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6973)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6973)));
          return G__6971__delegate.call(this, x, y, z, args)
        };
        return G__6971
      }();
      G__6957 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__6957__6958.call(this);
          case 1:
            return G__6957__6959.call(this, x);
          case 2:
            return G__6957__6960.call(this, x, y);
          case 3:
            return G__6957__6961.call(this, x, y, z);
          default:
            return G__6957__6962.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__6957.cljs$lang$maxFixedArity = 3;
      G__6957.cljs$lang$applyTo = G__6957__6962.cljs$lang$applyTo;
      return G__6957
    }()
  };
  var juxt__6914 = function() {
    var G__6975__delegate = function(f, g, h, fs) {
      var fs__6910 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__6976 = null;
        var G__6976__6977 = function() {
          return cljs.core.reduce.call(null, function(p1__6892_SHARP_, p2__6893_SHARP_) {
            return cljs.core.conj.call(null, p1__6892_SHARP_, p2__6893_SHARP_.call(null))
          }, cljs.core.Vector.fromArray([]), fs__6910)
        };
        var G__6976__6978 = function(x) {
          return cljs.core.reduce.call(null, function(p1__6894_SHARP_, p2__6895_SHARP_) {
            return cljs.core.conj.call(null, p1__6894_SHARP_, p2__6895_SHARP_.call(null, x))
          }, cljs.core.Vector.fromArray([]), fs__6910)
        };
        var G__6976__6979 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__6896_SHARP_, p2__6897_SHARP_) {
            return cljs.core.conj.call(null, p1__6896_SHARP_, p2__6897_SHARP_.call(null, x, y))
          }, cljs.core.Vector.fromArray([]), fs__6910)
        };
        var G__6976__6980 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__6898_SHARP_, p2__6899_SHARP_) {
            return cljs.core.conj.call(null, p1__6898_SHARP_, p2__6899_SHARP_.call(null, x, y, z))
          }, cljs.core.Vector.fromArray([]), fs__6910)
        };
        var G__6976__6981 = function() {
          var G__6991__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__6900_SHARP_, p2__6901_SHARP_) {
              return cljs.core.conj.call(null, p1__6900_SHARP_, cljs.core.apply.call(null, p2__6901_SHARP_, x, y, z, args))
            }, cljs.core.Vector.fromArray([]), fs__6910)
          };
          var G__6991 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__6991__delegate.call(this, x, y, z, args)
          };
          G__6991.cljs$lang$maxFixedArity = 3;
          G__6991.cljs$lang$applyTo = function(arglist__6992) {
            var x = cljs.core.first(arglist__6992);
            var y = cljs.core.first(cljs.core.next(arglist__6992));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6992)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6992)));
            return G__6991__delegate.call(this, x, y, z, args)
          };
          return G__6991
        }();
        G__6976 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__6976__6977.call(this);
            case 1:
              return G__6976__6978.call(this, x);
            case 2:
              return G__6976__6979.call(this, x, y);
            case 3:
              return G__6976__6980.call(this, x, y, z);
            default:
              return G__6976__6981.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__6976.cljs$lang$maxFixedArity = 3;
        G__6976.cljs$lang$applyTo = G__6976__6981.cljs$lang$applyTo;
        return G__6976
      }()
    };
    var G__6975 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6975__delegate.call(this, f, g, h, fs)
    };
    G__6975.cljs$lang$maxFixedArity = 3;
    G__6975.cljs$lang$applyTo = function(arglist__6993) {
      var f = cljs.core.first(arglist__6993);
      var g = cljs.core.first(cljs.core.next(arglist__6993));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6993)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6993)));
      return G__6975__delegate.call(this, f, g, h, fs)
    };
    return G__6975
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__6911.call(this, f);
      case 2:
        return juxt__6912.call(this, f, g);
      case 3:
        return juxt__6913.call(this, f, g, h);
      default:
        return juxt__6914.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__6914.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__6997 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__7001 = cljs.core.next.call(null, coll);
        coll = G__7001;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__6998 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____6995 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____6995)) {
          return n > 0
        }else {
          return and__3546__auto____6995
        }
      }())) {
        var G__7002 = n - 1;
        var G__7003 = cljs.core.next.call(null, coll);
        n = G__7002;
        coll = G__7003;
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
        return dorun__6997.call(this, n);
      case 2:
        return dorun__6998.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__7005 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__7006 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__7005.call(this, n);
      case 2:
        return doall__7006.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__7014 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__7014), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__7014), 1))) {
      return cljs.core.first.call(null, matches__7014)
    }else {
      return cljs.core.vec.call(null, matches__7014)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__7018 = re.exec(s);
  if(cljs.core.truth_(matches__7018 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__7018), 1))) {
      return cljs.core.first.call(null, matches__7018)
    }else {
      return cljs.core.vec.call(null, matches__7018)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__7020 = cljs.core.re_find.call(null, re, s);
  var match_idx__7021 = s.search(re);
  var match_str__7022 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__7020)) ? cljs.core.first.call(null, match_data__7020) : match_data__7020;
  var post_match__7023 = cljs.core.subs.call(null, s, match_idx__7021 + cljs.core.count.call(null, match_str__7022));
  if(cljs.core.truth_(match_data__7020)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__7020, re_seq.call(null, re, post_match__7023))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__7026__7027 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___7028 = cljs.core.nth.call(null, vec__7026__7027, 0, null);
  var flags__7029 = cljs.core.nth.call(null, vec__7026__7027, 1, null);
  var pattern__7030 = cljs.core.nth.call(null, vec__7026__7027, 2, null);
  return new RegExp(pattern__7030, flags__7029)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.Vector.fromArray([sep]), cljs.core.map.call(null, function(p1__7025_SHARP_) {
    return print_one.call(null, p1__7025_SHARP_, opts)
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
          var and__3546__auto____7037 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____7037)) {
            var and__3546__auto____7045 = function() {
              var x__450__auto____7042 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____7043 = x__450__auto____7042;
                if(cljs.core.truth_(and__3546__auto____7043)) {
                  var and__3546__auto____7044 = x__450__auto____7042.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____7044)) {
                    return cljs.core.not.call(null, x__450__auto____7042.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____7044
                  }
                }else {
                  return and__3546__auto____7043
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____7042)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____7045)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____7045
            }
          }else {
            return and__3546__auto____7037
          }
        }()) ? cljs.core.concat.call(null, cljs.core.Vector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.Vector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__450__auto____7046 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____7047 = x__450__auto____7046;
            if(cljs.core.truth_(and__3546__auto____7047)) {
              var and__3546__auto____7048 = x__450__auto____7046.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____7048)) {
                return cljs.core.not.call(null, x__450__auto____7046.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____7048
              }
            }else {
              return and__3546__auto____7047
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__450__auto____7046)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__7054 = cljs.core.first.call(null, objs);
  var sb__7055 = new goog.string.StringBuffer;
  var G__7056__7058 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__7056__7058)) {
    var obj__7060 = cljs.core.first.call(null, G__7056__7058);
    var G__7056__7061 = G__7056__7058;
    while(true) {
      if(cljs.core.truth_(obj__7060 === first_obj__7054)) {
      }else {
        sb__7055.append(" ")
      }
      var G__7063__7064 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__7060, opts));
      if(cljs.core.truth_(G__7063__7064)) {
        var string__7065 = cljs.core.first.call(null, G__7063__7064);
        var G__7063__7066 = G__7063__7064;
        while(true) {
          sb__7055.append(string__7065);
          var temp__3698__auto____7067 = cljs.core.next.call(null, G__7063__7066);
          if(cljs.core.truth_(temp__3698__auto____7067)) {
            var G__7063__7068 = temp__3698__auto____7067;
            var G__7071 = cljs.core.first.call(null, G__7063__7068);
            var G__7072 = G__7063__7068;
            string__7065 = G__7071;
            G__7063__7066 = G__7072;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____7069 = cljs.core.next.call(null, G__7056__7061);
      if(cljs.core.truth_(temp__3698__auto____7069)) {
        var G__7056__7070 = temp__3698__auto____7069;
        var G__7074 = cljs.core.first.call(null, G__7056__7070);
        var G__7075 = G__7056__7070;
        obj__7060 = G__7074;
        G__7056__7061 = G__7075;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__7055)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__7078 = cljs.core.first.call(null, objs);
  var G__7079__7080 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__7079__7080)) {
    var obj__7081 = cljs.core.first.call(null, G__7079__7080);
    var G__7079__7082 = G__7079__7080;
    while(true) {
      if(cljs.core.truth_(obj__7081 === first_obj__7078)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__7083__7084 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__7081, opts));
      if(cljs.core.truth_(G__7083__7084)) {
        var string__7085 = cljs.core.first.call(null, G__7083__7084);
        var G__7083__7086 = G__7083__7084;
        while(true) {
          cljs.core.string_print.call(null, string__7085);
          var temp__3698__auto____7087 = cljs.core.next.call(null, G__7083__7086);
          if(cljs.core.truth_(temp__3698__auto____7087)) {
            var G__7083__7088 = temp__3698__auto____7087;
            var G__7102 = cljs.core.first.call(null, G__7083__7088);
            var G__7103 = G__7083__7088;
            string__7085 = G__7102;
            G__7083__7086 = G__7103;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____7092 = cljs.core.next.call(null, G__7079__7082);
      if(cljs.core.truth_(temp__3698__auto____7092)) {
        var G__7079__7093 = temp__3698__auto____7092;
        var G__7104 = cljs.core.first.call(null, G__7079__7093);
        var G__7105 = G__7079__7093;
        obj__7081 = G__7104;
        G__7079__7082 = G__7105;
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
  pr_str.cljs$lang$applyTo = function(arglist__7119) {
    var objs = cljs.core.seq(arglist__7119);
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
  pr.cljs$lang$applyTo = function(arglist__7124) {
    var objs = cljs.core.seq(arglist__7124);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__7125) {
    var objs = cljs.core.seq(arglist__7125);
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
  println.cljs$lang$applyTo = function(arglist__7130) {
    var objs = cljs.core.seq(arglist__7130);
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
  prn.cljs$lang$applyTo = function(arglist__7131) {
    var objs = cljs.core.seq(arglist__7131);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__7133 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__7133, "{", ", ", "}", opts, coll)
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
      var temp__3698__auto____7136 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____7136)) {
        var nspc__7137 = temp__3698__auto____7136;
        return cljs.core.str.call(null, nspc__7137, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____7139 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____7139)) {
          var nspc__7140 = temp__3698__auto____7139;
          return cljs.core.str.call(null, nspc__7140, "/")
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
  var pr_pair__7143 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__7143, "{", ", ", "}", opts, coll)
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
  var this__7149 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__7150 = this;
  var G__7151__7152 = cljs.core.seq.call(null, this__7150.watches);
  if(cljs.core.truth_(G__7151__7152)) {
    var G__7154__7156 = cljs.core.first.call(null, G__7151__7152);
    var vec__7155__7157 = G__7154__7156;
    var key__7158 = cljs.core.nth.call(null, vec__7155__7157, 0, null);
    var f__7159 = cljs.core.nth.call(null, vec__7155__7157, 1, null);
    var G__7151__7160 = G__7151__7152;
    var G__7154__7161 = G__7154__7156;
    var G__7151__7162 = G__7151__7160;
    while(true) {
      var vec__7163__7164 = G__7154__7161;
      var key__7165 = cljs.core.nth.call(null, vec__7163__7164, 0, null);
      var f__7166 = cljs.core.nth.call(null, vec__7163__7164, 1, null);
      var G__7151__7167 = G__7151__7162;
      f__7166.call(null, key__7165, this$, oldval, newval);
      var temp__3698__auto____7168 = cljs.core.next.call(null, G__7151__7167);
      if(cljs.core.truth_(temp__3698__auto____7168)) {
        var G__7151__7169 = temp__3698__auto____7168;
        var G__7176 = cljs.core.first.call(null, G__7151__7169);
        var G__7177 = G__7151__7169;
        G__7154__7161 = G__7176;
        G__7151__7162 = G__7177;
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
  var this__7170 = this;
  return this$.watches = cljs.core.assoc.call(null, this__7170.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__7171 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__7171.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__7172 = this;
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__7172.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__7173 = this;
  return this__7173.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__7174 = this;
  return this__7174.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__7175 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__7210 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__7211 = function() {
    var G__7214__delegate = function(x, p__7198) {
      var map__7200__7202 = p__7198;
      var map__7200__7203 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__7200__7202)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__7200__7202) : map__7200__7202;
      var validator__7204 = cljs.core.get.call(null, map__7200__7203, "\ufdd0'validator");
      var meta__7205 = cljs.core.get.call(null, map__7200__7203, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__7205, validator__7204, null)
    };
    var G__7214 = function(x, var_args) {
      var p__7198 = null;
      if(goog.isDef(var_args)) {
        p__7198 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7214__delegate.call(this, x, p__7198)
    };
    G__7214.cljs$lang$maxFixedArity = 1;
    G__7214.cljs$lang$applyTo = function(arglist__7215) {
      var x = cljs.core.first(arglist__7215);
      var p__7198 = cljs.core.rest(arglist__7215);
      return G__7214__delegate.call(this, x, p__7198)
    };
    return G__7214
  }();
  atom = function(x, var_args) {
    var p__7198 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__7210.call(this, x);
      default:
        return atom__7211.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__7211.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____7218 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____7218)) {
    var validate__7219 = temp__3698__auto____7218;
    if(cljs.core.truth_(validate__7219.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3073)))));
    }
  }else {
  }
  var old_value__7220 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__7220, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___7235 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___7236 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___7237 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___7238 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___7239 = function() {
    var G__7241__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__7241 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__7241__delegate.call(this, a, f, x, y, z, more)
    };
    G__7241.cljs$lang$maxFixedArity = 5;
    G__7241.cljs$lang$applyTo = function(arglist__7242) {
      var a = cljs.core.first(arglist__7242);
      var f = cljs.core.first(cljs.core.next(arglist__7242));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7242)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7242))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7242)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7242)))));
      return G__7241__delegate.call(this, a, f, x, y, z, more)
    };
    return G__7241
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___7235.call(this, a, f);
      case 3:
        return swap_BANG___7236.call(this, a, f, x);
      case 4:
        return swap_BANG___7237.call(this, a, f, x, y);
      case 5:
        return swap_BANG___7238.call(this, a, f, x, y, z);
      default:
        return swap_BANG___7239.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___7239.cljs$lang$applyTo;
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__7251) {
    var iref = cljs.core.first(arglist__7251);
    var f = cljs.core.first(cljs.core.next(arglist__7251));
    var args = cljs.core.rest(cljs.core.next(arglist__7251));
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
  var gensym__7253 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__7254 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__7253.call(this);
      case 1:
        return gensym__7254.call(this, prefix_string)
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
  var this__7256 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__7256.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__7257 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__7257.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__7257.state, this__7257.f)
  }
  return cljs.core.deref.call(null, this__7257.state)
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
  delay.cljs$lang$applyTo = function(arglist__7261) {
    var body = cljs.core.seq(arglist__7261);
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
    var map__7264__7265 = options;
    var map__7264__7266 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__7264__7265)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__7264__7265) : map__7264__7265;
    var keywordize_keys__7267 = cljs.core.get.call(null, map__7264__7266, "\ufdd0'keywordize-keys");
    var keyfn__7268 = cljs.core.truth_(keywordize_keys__7267) ? cljs.core.keyword : cljs.core.str;
    var f__7275 = function thisfn(x) {
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
                var iter__514__auto____7274 = function iter__7269(s__7270) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__7270__7271 = s__7270;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__7270__7271))) {
                        var k__7273 = cljs.core.first.call(null, s__7270__7271);
                        return cljs.core.cons.call(null, cljs.core.Vector.fromArray([keyfn__7268.call(null, k__7273), thisfn.call(null, x[k__7273])]), iter__7269.call(null, cljs.core.rest.call(null, s__7270__7271)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__514__auto____7274.call(null, cljs.core.js_keys.call(null, x))
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
    return f__7275.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__7281) {
    var x = cljs.core.first(arglist__7281);
    var options = cljs.core.rest(arglist__7281);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__7282 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__7290__delegate = function(args) {
      var temp__3695__auto____7283 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__7282), args);
      if(cljs.core.truth_(temp__3695__auto____7283)) {
        var v__7284 = temp__3695__auto____7283;
        return v__7284
      }else {
        var ret__7287 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__7282, cljs.core.assoc, args, ret__7287);
        return ret__7287
      }
    };
    var G__7290 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__7290__delegate.call(this, args)
    };
    G__7290.cljs$lang$maxFixedArity = 0;
    G__7290.cljs$lang$applyTo = function(arglist__7293) {
      var args = cljs.core.seq(arglist__7293);
      return G__7290__delegate.call(this, args)
    };
    return G__7290
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__7295 = function(f) {
    while(true) {
      var ret__7294 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__7294))) {
        var G__7298 = ret__7294;
        f = G__7298;
        continue
      }else {
        return ret__7294
      }
      break
    }
  };
  var trampoline__7296 = function() {
    var G__7299__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__7299 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7299__delegate.call(this, f, args)
    };
    G__7299.cljs$lang$maxFixedArity = 1;
    G__7299.cljs$lang$applyTo = function(arglist__7300) {
      var f = cljs.core.first(arglist__7300);
      var args = cljs.core.rest(arglist__7300);
      return G__7299__delegate.call(this, f, args)
    };
    return G__7299
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__7295.call(this, f);
      default:
        return trampoline__7296.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__7296.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__7301 = function() {
    return rand.call(null, 1)
  };
  var rand__7302 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__7301.call(this);
      case 1:
        return rand__7302.call(this, n)
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
    var k__7309 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__7309, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__7309, cljs.core.Vector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___7330 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___7331 = function(h, child, parent) {
    var or__3548__auto____7318 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____7318)) {
      return or__3548__auto____7318
    }else {
      var or__3548__auto____7320 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____7320)) {
        return or__3548__auto____7320
      }else {
        var and__3546__auto____7321 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____7321)) {
          var and__3546__auto____7322 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____7322)) {
            var and__3546__auto____7323 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____7323)) {
              var ret__7324 = true;
              var i__7325 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____7326 = cljs.core.not.call(null, ret__7324);
                  if(cljs.core.truth_(or__3548__auto____7326)) {
                    return or__3548__auto____7326
                  }else {
                    return cljs.core._EQ_.call(null, i__7325, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__7324
                }else {
                  var G__7333 = isa_QMARK_.call(null, h, child.call(null, i__7325), parent.call(null, i__7325));
                  var G__7334 = i__7325 + 1;
                  ret__7324 = G__7333;
                  i__7325 = G__7334;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____7323
            }
          }else {
            return and__3546__auto____7322
          }
        }else {
          return and__3546__auto____7321
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___7330.call(this, h, child);
      case 3:
        return isa_QMARK___7331.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__7336 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__7337 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__7336.call(this, h);
      case 2:
        return parents__7337.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__7339 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__7340 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__7339.call(this, h);
      case 2:
        return ancestors__7340.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__7342 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__7343 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__7342.call(this, h);
      case 2:
        return descendants__7343.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__7364 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3365)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__7365 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3369)))));
    }
    var tp__7356 = "\ufdd0'parents".call(null, h);
    var td__7357 = "\ufdd0'descendants".call(null, h);
    var ta__7358 = "\ufdd0'ancestors".call(null, h);
    var tf__7359 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____7363 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__7356.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__7358.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__7358.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__7356, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__7359.call(null, "\ufdd0'ancestors".call(null, h), tag, td__7357, parent, ta__7358), "\ufdd0'descendants":tf__7359.call(null, "\ufdd0'descendants".call(null, h), parent, ta__7358, tag, td__7357)})
    }();
    if(cljs.core.truth_(or__3548__auto____7363)) {
      return or__3548__auto____7363
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__7364.call(this, h, tag);
      case 3:
        return derive__7365.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__7379 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__7380 = function(h, tag, parent) {
    var parentMap__7372 = "\ufdd0'parents".call(null, h);
    var childsParents__7376 = cljs.core.truth_(parentMap__7372.call(null, tag)) ? cljs.core.disj.call(null, parentMap__7372.call(null, tag), parent) : cljs.core.set([]);
    var newParents__7377 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__7376)) ? cljs.core.assoc.call(null, parentMap__7372, tag, childsParents__7376) : cljs.core.dissoc.call(null, parentMap__7372, tag);
    var deriv_seq__7378 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__7348_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__7348_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__7348_SHARP_), cljs.core.second.call(null, p1__7348_SHARP_)))
    }, cljs.core.seq.call(null, newParents__7377)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__7372.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__7349_SHARP_, p2__7351_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__7349_SHARP_, p2__7351_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__7378))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__7379.call(this, h, tag);
      case 3:
        return underive__7380.call(this, h, tag, parent)
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
  var xprefs__7392 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____7395 = cljs.core.truth_(function() {
    var and__3546__auto____7393 = xprefs__7392;
    if(cljs.core.truth_(and__3546__auto____7393)) {
      return xprefs__7392.call(null, y)
    }else {
      return and__3546__auto____7393
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____7395)) {
    return or__3548__auto____7395
  }else {
    var or__3548__auto____7400 = function() {
      var ps__7396 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__7396) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__7396), prefer_table))) {
          }else {
          }
          var G__7403 = cljs.core.rest.call(null, ps__7396);
          ps__7396 = G__7403;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____7400)) {
      return or__3548__auto____7400
    }else {
      var or__3548__auto____7402 = function() {
        var ps__7401 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__7401) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__7401), y, prefer_table))) {
            }else {
            }
            var G__7404 = cljs.core.rest.call(null, ps__7401);
            ps__7401 = G__7404;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____7402)) {
        return or__3548__auto____7402
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____7405 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____7405)) {
    return or__3548__auto____7405
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__7417 = cljs.core.reduce.call(null, function(be, p__7406) {
    var vec__7407__7408 = p__7406;
    var k__7409 = cljs.core.nth.call(null, vec__7407__7408, 0, null);
    var ___7410 = cljs.core.nth.call(null, vec__7407__7408, 1, null);
    var e__7411 = vec__7407__7408;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__7409))) {
      var be2__7415 = cljs.core.truth_(function() {
        var or__3548__auto____7413 = be === null;
        if(cljs.core.truth_(or__3548__auto____7413)) {
          return or__3548__auto____7413
        }else {
          return cljs.core.dominates.call(null, k__7409, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__7411 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__7415), k__7409, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__7409, " and ", cljs.core.first.call(null, be2__7415), ", and neither is preferred"));
      }
      return be2__7415
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__7417)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__7417));
      return cljs.core.second.call(null, best_entry__7417)
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
    var and__3546__auto____7422 = mf;
    if(cljs.core.truth_(and__3546__auto____7422)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____7422
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____7423 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7423)) {
        return or__3548__auto____7423
      }else {
        var or__3548__auto____7424 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____7424)) {
          return or__3548__auto____7424
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7428 = mf;
    if(cljs.core.truth_(and__3546__auto____7428)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____7428
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____7430 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7430)) {
        return or__3548__auto____7430
      }else {
        var or__3548__auto____7432 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____7432)) {
          return or__3548__auto____7432
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7435 = mf;
    if(cljs.core.truth_(and__3546__auto____7435)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____7435
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____7436 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7436)) {
        return or__3548__auto____7436
      }else {
        var or__3548__auto____7437 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____7437)) {
          return or__3548__auto____7437
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7439 = mf;
    if(cljs.core.truth_(and__3546__auto____7439)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____7439
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____7441 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7441)) {
        return or__3548__auto____7441
      }else {
        var or__3548__auto____7442 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____7442)) {
          return or__3548__auto____7442
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7443 = mf;
    if(cljs.core.truth_(and__3546__auto____7443)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____7443
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____7445 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7445)) {
        return or__3548__auto____7445
      }else {
        var or__3548__auto____7446 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____7446)) {
          return or__3548__auto____7446
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7449 = mf;
    if(cljs.core.truth_(and__3546__auto____7449)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____7449
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____7454 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7454)) {
        return or__3548__auto____7454
      }else {
        var or__3548__auto____7456 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____7456)) {
          return or__3548__auto____7456
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7459 = mf;
    if(cljs.core.truth_(and__3546__auto____7459)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____7459
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____7460 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7460)) {
        return or__3548__auto____7460
      }else {
        var or__3548__auto____7461 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____7461)) {
          return or__3548__auto____7461
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7462 = mf;
    if(cljs.core.truth_(and__3546__auto____7462)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____7462
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____7463 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7463)) {
        return or__3548__auto____7463
      }else {
        var or__3548__auto____7464 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____7464)) {
          return or__3548__auto____7464
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__7481 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__7482 = cljs.core._get_method.call(null, mf, dispatch_val__7481);
  if(cljs.core.truth_(target_fn__7482)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__7481));
  }
  return cljs.core.apply.call(null, target_fn__7482, args)
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
  var this__7489 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__7491 = this;
  cljs.core.swap_BANG_.call(null, this__7491.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__7491.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__7491.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__7491.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__7493 = this;
  cljs.core.swap_BANG_.call(null, this__7493.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__7493.method_cache, this__7493.method_table, this__7493.cached_hierarchy, this__7493.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__7494 = this;
  cljs.core.swap_BANG_.call(null, this__7494.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__7494.method_cache, this__7494.method_table, this__7494.cached_hierarchy, this__7494.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__7495 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__7495.cached_hierarchy), cljs.core.deref.call(null, this__7495.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__7495.method_cache, this__7495.method_table, this__7495.cached_hierarchy, this__7495.hierarchy)
  }
  var temp__3695__auto____7496 = cljs.core.deref.call(null, this__7495.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____7496)) {
    var target_fn__7497 = temp__3695__auto____7496;
    return target_fn__7497
  }else {
    var temp__3695__auto____7498 = cljs.core.find_and_cache_best_method.call(null, this__7495.name, dispatch_val, this__7495.hierarchy, this__7495.method_table, this__7495.prefer_table, this__7495.method_cache, this__7495.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____7498)) {
      var target_fn__7499 = temp__3695__auto____7498;
      return target_fn__7499
    }else {
      return cljs.core.deref.call(null, this__7495.method_table).call(null, this__7495.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__7500 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__7500.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__7500.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__7500.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__7500.method_cache, this__7500.method_table, this__7500.cached_hierarchy, this__7500.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__7501 = this;
  return cljs.core.deref.call(null, this__7501.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__7502 = this;
  return cljs.core.deref.call(null, this__7502.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__7503 = this;
  return cljs.core.do_dispatch.call(null, mf, this__7503.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__7506__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__7506 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__7506__delegate.call(this, _, args)
  };
  G__7506.cljs$lang$maxFixedArity = 1;
  G__7506.cljs$lang$applyTo = function(arglist__7507) {
    var _ = cljs.core.first(arglist__7507);
    var args = cljs.core.rest(arglist__7507);
    return G__7506__delegate.call(this, _, args)
  };
  return G__7506
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
      cljs.core.swap_BANG_.call(null, tatame.worker.events, function(p1__4035_SHARP_) {
        return cljs.core.drop.call(null, 1, p1__4035_SHARP_)
      });
      continue
    }else {
    }
    break
  }
  return self.setTimeout(send_messages_BANG_, 1E4)
};
tatame.worker.on_client_message = function on_client_message(e) {
  var data__4045 = e.data;
  if(cljs.core.truth_(data__4045.editor)) {
    var event__4046 = cljs.core.assoc.call(null, cljs.core.js__GT_clj.call(null, data__4045), "\ufdd0'ts", e.timeStamp);
    return cljs.core.swap_BANG_.call(null, tatame.worker.events, cljs.core.conj, event__4046)
  }else {
    if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, data__4045))) {
      return tatame.worker.socket.send(data__4045)
    }else {
      return null
    }
  }
};
tatame.worker.on_server_message = function on_server_message(e) {
  var data__4047 = e.data;
  return self.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data"], {"\ufdd0'type":"server", "\ufdd0'data":data__4047})))
};
tatame.worker.socket.onopen = tatame.worker.send_messages_BANG_;
tatame.worker.socket.onmessage = tatame.worker.on_server_message;
self.addEventListener("message", tatame.worker.on_client_message, false);

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
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  this.stack = (new Error).stack || "";
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
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
    var or__3548__auto____4127 = p["_"];
    if(cljs.core.truth_(or__3548__auto____4127)) {
      return or__3548__auto____4127
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
  var _invoke__4254 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4129 = this$;
      if(cljs.core.truth_(and__3546__auto____4129)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4129
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____4132 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4132)) {
          return or__3548__auto____4132
        }else {
          var or__3548__auto____4133 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4133)) {
            return or__3548__auto____4133
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__4256 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4135 = this$;
      if(cljs.core.truth_(and__3546__auto____4135)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4135
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____4138 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4138)) {
          return or__3548__auto____4138
        }else {
          var or__3548__auto____4139 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4139)) {
            return or__3548__auto____4139
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__4257 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4141 = this$;
      if(cljs.core.truth_(and__3546__auto____4141)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4141
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____4144 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4144)) {
          return or__3548__auto____4144
        }else {
          var or__3548__auto____4145 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4145)) {
            return or__3548__auto____4145
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__4259 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4147 = this$;
      if(cljs.core.truth_(and__3546__auto____4147)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4147
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____4149 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4149)) {
          return or__3548__auto____4149
        }else {
          var or__3548__auto____4151 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4151)) {
            return or__3548__auto____4151
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__4261 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4153 = this$;
      if(cljs.core.truth_(and__3546__auto____4153)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4153
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____4155 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4155)) {
          return or__3548__auto____4155
        }else {
          var or__3548__auto____4157 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4157)) {
            return or__3548__auto____4157
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__4263 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4159 = this$;
      if(cljs.core.truth_(and__3546__auto____4159)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4159
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____4161 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4161)) {
          return or__3548__auto____4161
        }else {
          var or__3548__auto____4163 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4163)) {
            return or__3548__auto____4163
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__4265 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4165 = this$;
      if(cljs.core.truth_(and__3546__auto____4165)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4165
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____4167 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4167)) {
          return or__3548__auto____4167
        }else {
          var or__3548__auto____4169 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4169)) {
            return or__3548__auto____4169
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__4267 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4171 = this$;
      if(cljs.core.truth_(and__3546__auto____4171)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4171
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____4173 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4173)) {
          return or__3548__auto____4173
        }else {
          var or__3548__auto____4175 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4175)) {
            return or__3548__auto____4175
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__4269 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4176 = this$;
      if(cljs.core.truth_(and__3546__auto____4176)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4176
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____4178 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4178)) {
          return or__3548__auto____4178
        }else {
          var or__3548__auto____4180 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4180)) {
            return or__3548__auto____4180
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__4271 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4182 = this$;
      if(cljs.core.truth_(and__3546__auto____4182)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4182
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____4184 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4184)) {
          return or__3548__auto____4184
        }else {
          var or__3548__auto____4186 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4186)) {
            return or__3548__auto____4186
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__4274 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4188 = this$;
      if(cljs.core.truth_(and__3546__auto____4188)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4188
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____4190 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4190)) {
          return or__3548__auto____4190
        }else {
          var or__3548__auto____4191 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4191)) {
            return or__3548__auto____4191
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__4275 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4194 = this$;
      if(cljs.core.truth_(and__3546__auto____4194)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4194
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
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
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__4277 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4200 = this$;
      if(cljs.core.truth_(and__3546__auto____4200)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4200
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____4202 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4202)) {
          return or__3548__auto____4202
        }else {
          var or__3548__auto____4203 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4203)) {
            return or__3548__auto____4203
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__4279 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4206 = this$;
      if(cljs.core.truth_(and__3546__auto____4206)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4206
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____4207 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4207)) {
          return or__3548__auto____4207
        }else {
          var or__3548__auto____4209 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4209)) {
            return or__3548__auto____4209
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__4281 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4211 = this$;
      if(cljs.core.truth_(and__3546__auto____4211)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4211
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____4213 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4213)) {
          return or__3548__auto____4213
        }else {
          var or__3548__auto____4215 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4215)) {
            return or__3548__auto____4215
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__4283 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4217 = this$;
      if(cljs.core.truth_(and__3546__auto____4217)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4217
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____4219 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4219)) {
          return or__3548__auto____4219
        }else {
          var or__3548__auto____4221 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4221)) {
            return or__3548__auto____4221
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__4285 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4223 = this$;
      if(cljs.core.truth_(and__3546__auto____4223)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4223
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____4225 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4225)) {
          return or__3548__auto____4225
        }else {
          var or__3548__auto____4227 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4227)) {
            return or__3548__auto____4227
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__4287 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4229 = this$;
      if(cljs.core.truth_(and__3546__auto____4229)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4229
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____4231 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4231)) {
          return or__3548__auto____4231
        }else {
          var or__3548__auto____4233 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4233)) {
            return or__3548__auto____4233
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__4289 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4235 = this$;
      if(cljs.core.truth_(and__3546__auto____4235)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4235
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____4237 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4237)) {
          return or__3548__auto____4237
        }else {
          var or__3548__auto____4238 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4238)) {
            return or__3548__auto____4238
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__4291 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4241 = this$;
      if(cljs.core.truth_(and__3546__auto____4241)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4241
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____4243 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4243)) {
          return or__3548__auto____4243
        }else {
          var or__3548__auto____4244 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4244)) {
            return or__3548__auto____4244
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__4293 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4246 = this$;
      if(cljs.core.truth_(and__3546__auto____4246)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____4246
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____4249 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____4249)) {
          return or__3548__auto____4249
        }else {
          var or__3548__auto____4250 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____4250)) {
            return or__3548__auto____4250
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
        return _invoke__4254.call(this, this$);
      case 2:
        return _invoke__4256.call(this, this$, a);
      case 3:
        return _invoke__4257.call(this, this$, a, b);
      case 4:
        return _invoke__4259.call(this, this$, a, b, c);
      case 5:
        return _invoke__4261.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__4263.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__4265.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__4267.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__4269.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__4271.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__4274.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__4275.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__4277.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__4279.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__4281.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__4283.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__4285.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__4287.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__4289.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__4291.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__4293.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4298 = coll;
    if(cljs.core.truth_(and__3546__auto____4298)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____4298
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____4299 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4299)) {
        return or__3548__auto____4299
      }else {
        var or__3548__auto____4300 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____4300)) {
          return or__3548__auto____4300
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
    var and__3546__auto____4304 = coll;
    if(cljs.core.truth_(and__3546__auto____4304)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____4304
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____4305 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4305)) {
        return or__3548__auto____4305
      }else {
        var or__3548__auto____4306 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____4306)) {
          return or__3548__auto____4306
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
    var and__3546__auto____4310 = coll;
    if(cljs.core.truth_(and__3546__auto____4310)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____4310
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____4311 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4311)) {
        return or__3548__auto____4311
      }else {
        var or__3548__auto____4312 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____4312)) {
          return or__3548__auto____4312
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
  var _nth__4326 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4316 = coll;
      if(cljs.core.truth_(and__3546__auto____4316)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____4316
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____4317 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4317)) {
          return or__3548__auto____4317
        }else {
          var or__3548__auto____4318 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____4318)) {
            return or__3548__auto____4318
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__4327 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4320 = coll;
      if(cljs.core.truth_(and__3546__auto____4320)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____4320
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____4321 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4321)) {
          return or__3548__auto____4321
        }else {
          var or__3548__auto____4323 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____4323)) {
            return or__3548__auto____4323
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
        return _nth__4326.call(this, coll, n);
      case 3:
        return _nth__4327.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4334 = coll;
    if(cljs.core.truth_(and__3546__auto____4334)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____4334
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____4335 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4335)) {
        return or__3548__auto____4335
      }else {
        var or__3548__auto____4336 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____4336)) {
          return or__3548__auto____4336
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4338 = coll;
    if(cljs.core.truth_(and__3546__auto____4338)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____4338
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____4340 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4340)) {
        return or__3548__auto____4340
      }else {
        var or__3548__auto____4342 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____4342)) {
          return or__3548__auto____4342
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
  var _lookup__4355 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4346 = o;
      if(cljs.core.truth_(and__3546__auto____4346)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____4346
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____4347 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____4347)) {
          return or__3548__auto____4347
        }else {
          var or__3548__auto____4348 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____4348)) {
            return or__3548__auto____4348
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__4356 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4349 = o;
      if(cljs.core.truth_(and__3546__auto____4349)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____4349
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____4351 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____4351)) {
          return or__3548__auto____4351
        }else {
          var or__3548__auto____4353 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____4353)) {
            return or__3548__auto____4353
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
        return _lookup__4355.call(this, o, k);
      case 3:
        return _lookup__4356.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4364 = coll;
    if(cljs.core.truth_(and__3546__auto____4364)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____4364
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____4365 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4365)) {
        return or__3548__auto____4365
      }else {
        var or__3548__auto____4366 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____4366)) {
          return or__3548__auto____4366
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4367 = coll;
    if(cljs.core.truth_(and__3546__auto____4367)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____4367
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____4369 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4369)) {
        return or__3548__auto____4369
      }else {
        var or__3548__auto____4372 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____4372)) {
          return or__3548__auto____4372
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
    var and__3546__auto____4376 = coll;
    if(cljs.core.truth_(and__3546__auto____4376)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____4376
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____4377 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4377)) {
        return or__3548__auto____4377
      }else {
        var or__3548__auto____4378 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____4378)) {
          return or__3548__auto____4378
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
    var and__3546__auto____4382 = coll;
    if(cljs.core.truth_(and__3546__auto____4382)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____4382
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____4383 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4383)) {
        return or__3548__auto____4383
      }else {
        var or__3548__auto____4384 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____4384)) {
          return or__3548__auto____4384
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
    var and__3546__auto____4388 = coll;
    if(cljs.core.truth_(and__3546__auto____4388)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____4388
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____4389 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4389)) {
        return or__3548__auto____4389
      }else {
        var or__3548__auto____4390 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____4390)) {
          return or__3548__auto____4390
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4391 = coll;
    if(cljs.core.truth_(and__3546__auto____4391)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____4391
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____4393 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4393)) {
        return or__3548__auto____4393
      }else {
        var or__3548__auto____4394 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____4394)) {
          return or__3548__auto____4394
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
    var and__3546__auto____4400 = coll;
    if(cljs.core.truth_(and__3546__auto____4400)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____4400
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____4401 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____4401)) {
        return or__3548__auto____4401
      }else {
        var or__3548__auto____4402 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____4402)) {
          return or__3548__auto____4402
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
    var and__3546__auto____4406 = o;
    if(cljs.core.truth_(and__3546__auto____4406)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____4406
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____4407 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4407)) {
        return or__3548__auto____4407
      }else {
        var or__3548__auto____4408 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____4408)) {
          return or__3548__auto____4408
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
    var and__3546__auto____4412 = o;
    if(cljs.core.truth_(and__3546__auto____4412)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____4412
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____4413 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4413)) {
        return or__3548__auto____4413
      }else {
        var or__3548__auto____4414 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____4414)) {
          return or__3548__auto____4414
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
    var and__3546__auto____4418 = o;
    if(cljs.core.truth_(and__3546__auto____4418)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____4418
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____4419 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4419)) {
        return or__3548__auto____4419
      }else {
        var or__3548__auto____4420 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____4420)) {
          return or__3548__auto____4420
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
    var and__3546__auto____4424 = o;
    if(cljs.core.truth_(and__3546__auto____4424)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____4424
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____4425 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4425)) {
        return or__3548__auto____4425
      }else {
        var or__3548__auto____4426 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____4426)) {
          return or__3548__auto____4426
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
  var _reduce__4440 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4430 = coll;
      if(cljs.core.truth_(and__3546__auto____4430)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____4430
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____4431 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4431)) {
          return or__3548__auto____4431
        }else {
          var or__3548__auto____4432 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____4432)) {
            return or__3548__auto____4432
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__4441 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____4434 = coll;
      if(cljs.core.truth_(and__3546__auto____4434)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____4434
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____4437 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____4437)) {
          return or__3548__auto____4437
        }else {
          var or__3548__auto____4438 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____4438)) {
            return or__3548__auto____4438
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
        return _reduce__4440.call(this, coll, f);
      case 3:
        return _reduce__4441.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4448 = o;
    if(cljs.core.truth_(and__3546__auto____4448)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____4448
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____4449 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4449)) {
        return or__3548__auto____4449
      }else {
        var or__3548__auto____4450 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____4450)) {
          return or__3548__auto____4450
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
    var and__3546__auto____4454 = o;
    if(cljs.core.truth_(and__3546__auto____4454)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____4454
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____4455 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4455)) {
        return or__3548__auto____4455
      }else {
        var or__3548__auto____4457 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____4457)) {
          return or__3548__auto____4457
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
    var and__3546__auto____4460 = o;
    if(cljs.core.truth_(and__3546__auto____4460)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____4460
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____4461 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4461)) {
        return or__3548__auto____4461
      }else {
        var or__3548__auto____4462 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____4462)) {
          return or__3548__auto____4462
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
    var and__3546__auto____4466 = o;
    if(cljs.core.truth_(and__3546__auto____4466)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____4466
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____4467 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____4467)) {
        return or__3548__auto____4467
      }else {
        var or__3548__auto____4468 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____4468)) {
          return or__3548__auto____4468
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
    var and__3546__auto____4472 = d;
    if(cljs.core.truth_(and__3546__auto____4472)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____4472
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____4473 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____4473)) {
        return or__3548__auto____4473
      }else {
        var or__3548__auto____4474 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____4474)) {
          return or__3548__auto____4474
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
    var and__3546__auto____4478 = this$;
    if(cljs.core.truth_(and__3546__auto____4478)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____4478
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____4480 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____4480)) {
        return or__3548__auto____4480
      }else {
        var or__3548__auto____4481 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____4481)) {
          return or__3548__auto____4481
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4484 = this$;
    if(cljs.core.truth_(and__3546__auto____4484)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____4484
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____4486 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____4486)) {
        return or__3548__auto____4486
      }else {
        var or__3548__auto____4488 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____4488)) {
          return or__3548__auto____4488
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____4490 = this$;
    if(cljs.core.truth_(and__3546__auto____4490)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____4490
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____4493 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____4493)) {
        return or__3548__auto____4493
      }else {
        var or__3548__auto____4495 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____4495)) {
          return or__3548__auto____4495
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
  var G__4500 = null;
  var G__4500__4501 = function(o, k) {
    return null
  };
  var G__4500__4502 = function(o, k, not_found) {
    return not_found
  };
  G__4500 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4500__4501.call(this, o, k);
      case 3:
        return G__4500__4502.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4500
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
  var G__4508 = null;
  var G__4508__4509 = function(_, f) {
    return f.call(null)
  };
  var G__4508__4510 = function(_, f, start) {
    return start
  };
  G__4508 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4508__4509.call(this, _, f);
      case 3:
        return G__4508__4510.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4508
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
  var G__4516 = null;
  var G__4516__4517 = function(_, n) {
    return null
  };
  var G__4516__4518 = function(_, n, not_found) {
    return not_found
  };
  G__4516 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4516__4517.call(this, _, n);
      case 3:
        return G__4516__4518.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4516
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
  var ci_reduce__4540 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__4526 = cljs.core._nth.call(null, cicoll, 0);
      var n__4527 = 1;
      while(true) {
        if(cljs.core.truth_(n__4527 < cljs.core._count.call(null, cicoll))) {
          var G__4546 = f.call(null, val__4526, cljs.core._nth.call(null, cicoll, n__4527));
          var G__4547 = n__4527 + 1;
          val__4526 = G__4546;
          n__4527 = G__4547;
          continue
        }else {
          return val__4526
        }
        break
      }
    }
  };
  var ci_reduce__4541 = function(cicoll, f, val) {
    var val__4532 = val;
    var n__4533 = 0;
    while(true) {
      if(cljs.core.truth_(n__4533 < cljs.core._count.call(null, cicoll))) {
        var G__4548 = f.call(null, val__4532, cljs.core._nth.call(null, cicoll, n__4533));
        var G__4549 = n__4533 + 1;
        val__4532 = G__4548;
        n__4533 = G__4549;
        continue
      }else {
        return val__4532
      }
      break
    }
  };
  var ci_reduce__4542 = function(cicoll, f, val, idx) {
    var val__4536 = val;
    var n__4537 = idx;
    while(true) {
      if(cljs.core.truth_(n__4537 < cljs.core._count.call(null, cicoll))) {
        var G__4550 = f.call(null, val__4536, cljs.core._nth.call(null, cicoll, n__4537));
        var G__4551 = n__4537 + 1;
        val__4536 = G__4550;
        n__4537 = G__4551;
        continue
      }else {
        return val__4536
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__4540.call(this, cicoll, f);
      case 3:
        return ci_reduce__4541.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__4542.call(this, cicoll, f, val, idx)
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
  var this__4561 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__4586 = null;
  var G__4586__4587 = function(_, f) {
    var this__4562 = this;
    return cljs.core.ci_reduce.call(null, this__4562.a, f, this__4562.a[this__4562.i], this__4562.i + 1)
  };
  var G__4586__4588 = function(_, f, start) {
    var this__4564 = this;
    return cljs.core.ci_reduce.call(null, this__4564.a, f, start, this__4564.i)
  };
  G__4586 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4586__4587.call(this, _, f);
      case 3:
        return G__4586__4588.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4586
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__4567 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__4568 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__4590 = null;
  var G__4590__4591 = function(coll, n) {
    var this__4570 = this;
    var i__4571 = n + this__4570.i;
    if(cljs.core.truth_(i__4571 < this__4570.a.length)) {
      return this__4570.a[i__4571]
    }else {
      return null
    }
  };
  var G__4590__4592 = function(coll, n, not_found) {
    var this__4572 = this;
    var i__4573 = n + this__4572.i;
    if(cljs.core.truth_(i__4573 < this__4572.a.length)) {
      return this__4572.a[i__4573]
    }else {
      return not_found
    }
  };
  G__4590 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4590__4591.call(this, coll, n);
      case 3:
        return G__4590__4592.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4590
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__4574 = this;
  return this__4574.a.length - this__4574.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__4579 = this;
  return this__4579.a[this__4579.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__4580 = this;
  if(cljs.core.truth_(this__4580.i + 1 < this__4580.a.length)) {
    return new cljs.core.IndexedSeq(this__4580.a, this__4580.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__4581 = this;
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
  var G__4606 = null;
  var G__4606__4607 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__4606__4608 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__4606 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4606__4607.call(this, array, f);
      case 3:
        return G__4606__4608.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4606
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__4610 = null;
  var G__4610__4611 = function(array, k) {
    return array[k]
  };
  var G__4610__4612 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__4610 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4610__4611.call(this, array, k);
      case 3:
        return G__4610__4612.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4610
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__4614 = null;
  var G__4614__4615 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__4614__4616 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__4614 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__4614__4615.call(this, array, n);
      case 3:
        return G__4614__4616.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4614
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
  var temp__3698__auto____4620 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____4620)) {
    var s__4621 = temp__3698__auto____4620;
    return cljs.core._first.call(null, s__4621)
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
      var G__4627 = cljs.core.next.call(null, s);
      s = G__4627;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__4628 = cljs.core.seq.call(null, x);
  var n__4629 = 0;
  while(true) {
    if(cljs.core.truth_(s__4628)) {
      var G__4630 = cljs.core.next.call(null, s__4628);
      var G__4631 = n__4629 + 1;
      s__4628 = G__4630;
      n__4629 = G__4631;
      continue
    }else {
      return n__4629
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
  var conj__4640 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__4641 = function() {
    var G__4643__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__4644 = conj.call(null, coll, x);
          var G__4645 = cljs.core.first.call(null, xs);
          var G__4646 = cljs.core.next.call(null, xs);
          coll = G__4644;
          x = G__4645;
          xs = G__4646;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__4643 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4643__delegate.call(this, coll, x, xs)
    };
    G__4643.cljs$lang$maxFixedArity = 2;
    G__4643.cljs$lang$applyTo = function(arglist__4647) {
      var coll = cljs.core.first(arglist__4647);
      var x = cljs.core.first(cljs.core.next(arglist__4647));
      var xs = cljs.core.rest(cljs.core.next(arglist__4647));
      return G__4643__delegate.call(this, coll, x, xs)
    };
    return G__4643
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__4640.call(this, coll, x);
      default:
        return conj__4641.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__4641.cljs$lang$applyTo;
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
  var nth__4651 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__4652 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__4651.call(this, coll, n);
      case 3:
        return nth__4652.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__4657 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__4658 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__4657.call(this, o, k);
      case 3:
        return get__4658.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__4670 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__4671 = function() {
    var G__4674__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__4664 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__4675 = ret__4664;
          var G__4676 = cljs.core.first.call(null, kvs);
          var G__4677 = cljs.core.second.call(null, kvs);
          var G__4678 = cljs.core.nnext.call(null, kvs);
          coll = G__4675;
          k = G__4676;
          v = G__4677;
          kvs = G__4678;
          continue
        }else {
          return ret__4664
        }
        break
      }
    };
    var G__4674 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__4674__delegate.call(this, coll, k, v, kvs)
    };
    G__4674.cljs$lang$maxFixedArity = 3;
    G__4674.cljs$lang$applyTo = function(arglist__4679) {
      var coll = cljs.core.first(arglist__4679);
      var k = cljs.core.first(cljs.core.next(arglist__4679));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4679)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4679)));
      return G__4674__delegate.call(this, coll, k, v, kvs)
    };
    return G__4674
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__4670.call(this, coll, k, v);
      default:
        return assoc__4671.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__4671.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__4691 = function(coll) {
    return coll
  };
  var dissoc__4692 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__4693 = function() {
    var G__4695__delegate = function(coll, k, ks) {
      while(true) {
        var ret__4686 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__4696 = ret__4686;
          var G__4697 = cljs.core.first.call(null, ks);
          var G__4698 = cljs.core.next.call(null, ks);
          coll = G__4696;
          k = G__4697;
          ks = G__4698;
          continue
        }else {
          return ret__4686
        }
        break
      }
    };
    var G__4695 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4695__delegate.call(this, coll, k, ks)
    };
    G__4695.cljs$lang$maxFixedArity = 2;
    G__4695.cljs$lang$applyTo = function(arglist__4699) {
      var coll = cljs.core.first(arglist__4699);
      var k = cljs.core.first(cljs.core.next(arglist__4699));
      var ks = cljs.core.rest(cljs.core.next(arglist__4699));
      return G__4695__delegate.call(this, coll, k, ks)
    };
    return G__4695
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__4691.call(this, coll);
      case 2:
        return dissoc__4692.call(this, coll, k);
      default:
        return dissoc__4693.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__4693.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__450__auto____4703 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4704 = x__450__auto____4703;
      if(cljs.core.truth_(and__3546__auto____4704)) {
        var and__3546__auto____4705 = x__450__auto____4703.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____4705)) {
          return cljs.core.not.call(null, x__450__auto____4703.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____4705
        }
      }else {
        return and__3546__auto____4704
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____4703)
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
  var disj__4716 = function(coll) {
    return coll
  };
  var disj__4717 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__4718 = function() {
    var G__4721__delegate = function(coll, k, ks) {
      while(true) {
        var ret__4711 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__4722 = ret__4711;
          var G__4723 = cljs.core.first.call(null, ks);
          var G__4724 = cljs.core.next.call(null, ks);
          coll = G__4722;
          k = G__4723;
          ks = G__4724;
          continue
        }else {
          return ret__4711
        }
        break
      }
    };
    var G__4721 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4721__delegate.call(this, coll, k, ks)
    };
    G__4721.cljs$lang$maxFixedArity = 2;
    G__4721.cljs$lang$applyTo = function(arglist__4725) {
      var coll = cljs.core.first(arglist__4725);
      var k = cljs.core.first(cljs.core.next(arglist__4725));
      var ks = cljs.core.rest(cljs.core.next(arglist__4725));
      return G__4721__delegate.call(this, coll, k, ks)
    };
    return G__4721
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__4716.call(this, coll);
      case 2:
        return disj__4717.call(this, coll, k);
      default:
        return disj__4718.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__4718.cljs$lang$applyTo;
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
    var x__450__auto____4729 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4730 = x__450__auto____4729;
      if(cljs.core.truth_(and__3546__auto____4730)) {
        var and__3546__auto____4731 = x__450__auto____4729.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____4731)) {
          return cljs.core.not.call(null, x__450__auto____4729.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____4731
        }
      }else {
        return and__3546__auto____4730
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__450__auto____4729)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____4735 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4736 = x__450__auto____4735;
      if(cljs.core.truth_(and__3546__auto____4736)) {
        var and__3546__auto____4737 = x__450__auto____4735.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____4737)) {
          return cljs.core.not.call(null, x__450__auto____4735.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____4737
        }
      }else {
        return and__3546__auto____4736
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__450__auto____4735)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__450__auto____4741 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4742 = x__450__auto____4741;
    if(cljs.core.truth_(and__3546__auto____4742)) {
      var and__3546__auto____4743 = x__450__auto____4741.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____4743)) {
        return cljs.core.not.call(null, x__450__auto____4741.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____4743
      }
    }else {
      return and__3546__auto____4742
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__450__auto____4741)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__450__auto____4747 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4748 = x__450__auto____4747;
    if(cljs.core.truth_(and__3546__auto____4748)) {
      var and__3546__auto____4749 = x__450__auto____4747.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____4749)) {
        return cljs.core.not.call(null, x__450__auto____4747.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____4749
      }
    }else {
      return and__3546__auto____4748
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__450__auto____4747)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__450__auto____4753 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4754 = x__450__auto____4753;
    if(cljs.core.truth_(and__3546__auto____4754)) {
      var and__3546__auto____4755 = x__450__auto____4753.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____4755)) {
        return cljs.core.not.call(null, x__450__auto____4753.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____4755
      }
    }else {
      return and__3546__auto____4754
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__450__auto____4753)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(x === null)) {
    return false
  }else {
    var x__450__auto____4759 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4760 = x__450__auto____4759;
      if(cljs.core.truth_(and__3546__auto____4760)) {
        var and__3546__auto____4761 = x__450__auto____4759.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____4761)) {
          return cljs.core.not.call(null, x__450__auto____4759.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____4761
        }
      }else {
        return and__3546__auto____4760
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__450__auto____4759)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__450__auto____4763 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____4764 = x__450__auto____4763;
    if(cljs.core.truth_(and__3546__auto____4764)) {
      var and__3546__auto____4765 = x__450__auto____4763.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____4765)) {
        return cljs.core.not.call(null, x__450__auto____4763.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____4765
      }
    }else {
      return and__3546__auto____4764
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__450__auto____4763)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__4766 = cljs.core.array.call(null);
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__4766.push(key)
  });
  return keys__4766
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
    var x__450__auto____4769 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____4770 = x__450__auto____4769;
      if(cljs.core.truth_(and__3546__auto____4770)) {
        var and__3546__auto____4771 = x__450__auto____4769.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____4771)) {
          return cljs.core.not.call(null, x__450__auto____4769.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____4771
        }
      }else {
        return and__3546__auto____4770
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__450__auto____4769)
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
  var and__3546__auto____4773 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____4773)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____4774 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____4774)) {
        return or__3548__auto____4774
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____4773
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____4778 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____4778)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____4778
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____4779 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____4779)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____4779
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____4782 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____4782)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____4782
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
    var and__3546__auto____4785 = coll;
    if(cljs.core.truth_(and__3546__auto____4785)) {
      var and__3546__auto____4786 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____4786)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____4786
      }
    }else {
      return and__3546__auto____4785
    }
  }())) {
    return cljs.core.Vector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___4792 = function(x) {
    return true
  };
  var distinct_QMARK___4793 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___4794 = function() {
    var G__4796__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__4788 = cljs.core.set([y, x]);
        var xs__4789 = more;
        while(true) {
          var x__4790 = cljs.core.first.call(null, xs__4789);
          var etc__4791 = cljs.core.next.call(null, xs__4789);
          if(cljs.core.truth_(xs__4789)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__4788, x__4790))) {
              return false
            }else {
              var G__4799 = cljs.core.conj.call(null, s__4788, x__4790);
              var G__4800 = etc__4791;
              s__4788 = G__4799;
              xs__4789 = G__4800;
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
    var G__4796 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4796__delegate.call(this, x, y, more)
    };
    G__4796.cljs$lang$maxFixedArity = 2;
    G__4796.cljs$lang$applyTo = function(arglist__4801) {
      var x = cljs.core.first(arglist__4801);
      var y = cljs.core.first(cljs.core.next(arglist__4801));
      var more = cljs.core.rest(cljs.core.next(arglist__4801));
      return G__4796__delegate.call(this, x, y, more)
    };
    return G__4796
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___4792.call(this, x);
      case 2:
        return distinct_QMARK___4793.call(this, x, y);
      default:
        return distinct_QMARK___4794.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___4794.cljs$lang$applyTo;
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
      var r__4806 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__4806))) {
        return r__4806
      }else {
        if(cljs.core.truth_(r__4806)) {
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
  var sort__4816 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__4817 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__4815 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__4815, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__4815)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__4816.call(this, comp);
      case 2:
        return sort__4817.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__4820 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__4821 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__4820.call(this, keyfn, comp);
      case 3:
        return sort_by__4821.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__4827 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__4828 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__4827.call(this, f, val);
      case 3:
        return reduce__4828.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__4837 = function(f, coll) {
    var temp__3695__auto____4833 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____4833)) {
      var s__4834 = temp__3695__auto____4833;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__4834), cljs.core.next.call(null, s__4834))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__4838 = function(f, val, coll) {
    var val__4835 = val;
    var coll__4836 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__4836)) {
        var G__4840 = f.call(null, val__4835, cljs.core.first.call(null, coll__4836));
        var G__4841 = cljs.core.next.call(null, coll__4836);
        val__4835 = G__4840;
        coll__4836 = G__4841;
        continue
      }else {
        return val__4835
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__4837.call(this, f, val);
      case 3:
        return seq_reduce__4838.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__4847 = null;
  var G__4847__4848 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__4847__4849 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__4847 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__4847__4848.call(this, coll, f);
      case 3:
        return G__4847__4849.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__4847
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___4858 = function() {
    return 0
  };
  var _PLUS___4859 = function(x) {
    return x
  };
  var _PLUS___4860 = function(x, y) {
    return x + y
  };
  var _PLUS___4861 = function() {
    var G__4863__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__4863 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4863__delegate.call(this, x, y, more)
    };
    G__4863.cljs$lang$maxFixedArity = 2;
    G__4863.cljs$lang$applyTo = function(arglist__4864) {
      var x = cljs.core.first(arglist__4864);
      var y = cljs.core.first(cljs.core.next(arglist__4864));
      var more = cljs.core.rest(cljs.core.next(arglist__4864));
      return G__4863__delegate.call(this, x, y, more)
    };
    return G__4863
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___4858.call(this);
      case 1:
        return _PLUS___4859.call(this, x);
      case 2:
        return _PLUS___4860.call(this, x, y);
      default:
        return _PLUS___4861.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___4861.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___4869 = function(x) {
    return-x
  };
  var ___4870 = function(x, y) {
    return x - y
  };
  var ___4871 = function() {
    var G__4873__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__4873 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4873__delegate.call(this, x, y, more)
    };
    G__4873.cljs$lang$maxFixedArity = 2;
    G__4873.cljs$lang$applyTo = function(arglist__4879) {
      var x = cljs.core.first(arglist__4879);
      var y = cljs.core.first(cljs.core.next(arglist__4879));
      var more = cljs.core.rest(cljs.core.next(arglist__4879));
      return G__4873__delegate.call(this, x, y, more)
    };
    return G__4873
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___4869.call(this, x);
      case 2:
        return ___4870.call(this, x, y);
      default:
        return ___4871.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___4871.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___4882 = function() {
    return 1
  };
  var _STAR___4883 = function(x) {
    return x
  };
  var _STAR___4884 = function(x, y) {
    return x * y
  };
  var _STAR___4885 = function() {
    var G__4891__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__4891 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4891__delegate.call(this, x, y, more)
    };
    G__4891.cljs$lang$maxFixedArity = 2;
    G__4891.cljs$lang$applyTo = function(arglist__4893) {
      var x = cljs.core.first(arglist__4893);
      var y = cljs.core.first(cljs.core.next(arglist__4893));
      var more = cljs.core.rest(cljs.core.next(arglist__4893));
      return G__4891__delegate.call(this, x, y, more)
    };
    return G__4891
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___4882.call(this);
      case 1:
        return _STAR___4883.call(this, x);
      case 2:
        return _STAR___4884.call(this, x, y);
      default:
        return _STAR___4885.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___4885.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___4897 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___4900 = function(x, y) {
    return x / y
  };
  var _SLASH___4902 = function() {
    var G__4904__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__4904 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4904__delegate.call(this, x, y, more)
    };
    G__4904.cljs$lang$maxFixedArity = 2;
    G__4904.cljs$lang$applyTo = function(arglist__4907) {
      var x = cljs.core.first(arglist__4907);
      var y = cljs.core.first(cljs.core.next(arglist__4907));
      var more = cljs.core.rest(cljs.core.next(arglist__4907));
      return G__4904__delegate.call(this, x, y, more)
    };
    return G__4904
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___4897.call(this, x);
      case 2:
        return _SLASH___4900.call(this, x, y);
      default:
        return _SLASH___4902.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___4902.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___4912 = function(x) {
    return true
  };
  var _LT___4913 = function(x, y) {
    return x < y
  };
  var _LT___4914 = function() {
    var G__4917__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4918 = y;
            var G__4919 = cljs.core.first.call(null, more);
            var G__4920 = cljs.core.next.call(null, more);
            x = G__4918;
            y = G__4919;
            more = G__4920;
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
    var G__4917 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4917__delegate.call(this, x, y, more)
    };
    G__4917.cljs$lang$maxFixedArity = 2;
    G__4917.cljs$lang$applyTo = function(arglist__4922) {
      var x = cljs.core.first(arglist__4922);
      var y = cljs.core.first(cljs.core.next(arglist__4922));
      var more = cljs.core.rest(cljs.core.next(arglist__4922));
      return G__4917__delegate.call(this, x, y, more)
    };
    return G__4917
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___4912.call(this, x);
      case 2:
        return _LT___4913.call(this, x, y);
      default:
        return _LT___4914.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___4914.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___4928 = function(x) {
    return true
  };
  var _LT__EQ___4929 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___4930 = function() {
    var G__4935__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4936 = y;
            var G__4937 = cljs.core.first.call(null, more);
            var G__4938 = cljs.core.next.call(null, more);
            x = G__4936;
            y = G__4937;
            more = G__4938;
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
    var G__4935 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4935__delegate.call(this, x, y, more)
    };
    G__4935.cljs$lang$maxFixedArity = 2;
    G__4935.cljs$lang$applyTo = function(arglist__4940) {
      var x = cljs.core.first(arglist__4940);
      var y = cljs.core.first(cljs.core.next(arglist__4940));
      var more = cljs.core.rest(cljs.core.next(arglist__4940));
      return G__4935__delegate.call(this, x, y, more)
    };
    return G__4935
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___4928.call(this, x);
      case 2:
        return _LT__EQ___4929.call(this, x, y);
      default:
        return _LT__EQ___4930.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___4930.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___4945 = function(x) {
    return true
  };
  var _GT___4946 = function(x, y) {
    return x > y
  };
  var _GT___4947 = function() {
    var G__4951__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4954 = y;
            var G__4955 = cljs.core.first.call(null, more);
            var G__4956 = cljs.core.next.call(null, more);
            x = G__4954;
            y = G__4955;
            more = G__4956;
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
    var G__4951 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4951__delegate.call(this, x, y, more)
    };
    G__4951.cljs$lang$maxFixedArity = 2;
    G__4951.cljs$lang$applyTo = function(arglist__4958) {
      var x = cljs.core.first(arglist__4958);
      var y = cljs.core.first(cljs.core.next(arglist__4958));
      var more = cljs.core.rest(cljs.core.next(arglist__4958));
      return G__4951__delegate.call(this, x, y, more)
    };
    return G__4951
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___4945.call(this, x);
      case 2:
        return _GT___4946.call(this, x, y);
      default:
        return _GT___4947.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___4947.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___4963 = function(x) {
    return true
  };
  var _GT__EQ___4964 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___4965 = function() {
    var G__4968__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__4972 = y;
            var G__4973 = cljs.core.first.call(null, more);
            var G__4974 = cljs.core.next.call(null, more);
            x = G__4972;
            y = G__4973;
            more = G__4974;
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
    var G__4968 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4968__delegate.call(this, x, y, more)
    };
    G__4968.cljs$lang$maxFixedArity = 2;
    G__4968.cljs$lang$applyTo = function(arglist__4976) {
      var x = cljs.core.first(arglist__4976);
      var y = cljs.core.first(cljs.core.next(arglist__4976));
      var more = cljs.core.rest(cljs.core.next(arglist__4976));
      return G__4968__delegate.call(this, x, y, more)
    };
    return G__4968
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___4963.call(this, x);
      case 2:
        return _GT__EQ___4964.call(this, x, y);
      default:
        return _GT__EQ___4965.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___4965.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__4982 = function(x) {
    return x
  };
  var max__4983 = function(x, y) {
    return x > y ? x : y
  };
  var max__4985 = function() {
    var G__4989__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__4989 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4989__delegate.call(this, x, y, more)
    };
    G__4989.cljs$lang$maxFixedArity = 2;
    G__4989.cljs$lang$applyTo = function(arglist__4991) {
      var x = cljs.core.first(arglist__4991);
      var y = cljs.core.first(cljs.core.next(arglist__4991));
      var more = cljs.core.rest(cljs.core.next(arglist__4991));
      return G__4989__delegate.call(this, x, y, more)
    };
    return G__4989
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__4982.call(this, x);
      case 2:
        return max__4983.call(this, x, y);
      default:
        return max__4985.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__4985.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__4992 = function(x) {
    return x
  };
  var min__4993 = function(x, y) {
    return x < y ? x : y
  };
  var min__4994 = function() {
    var G__4996__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__4996 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__4996__delegate.call(this, x, y, more)
    };
    G__4996.cljs$lang$maxFixedArity = 2;
    G__4996.cljs$lang$applyTo = function(arglist__5001) {
      var x = cljs.core.first(arglist__5001);
      var y = cljs.core.first(cljs.core.next(arglist__5001));
      var more = cljs.core.rest(cljs.core.next(arglist__5001));
      return G__4996__delegate.call(this, x, y, more)
    };
    return G__4996
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__4992.call(this, x);
      case 2:
        return min__4993.call(this, x, y);
      default:
        return min__4994.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__4994.cljs$lang$applyTo;
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
  var rem__5009 = n % d;
  return cljs.core.fix.call(null, (n - rem__5009) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__5011 = cljs.core.quot.call(null, n, d);
  return n - d * q__5011
};
cljs.core.rand = function() {
  var rand = null;
  var rand__5012 = function() {
    return Math.random.call(null)
  };
  var rand__5013 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__5012.call(this);
      case 1:
        return rand__5013.call(this, n)
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
  var _EQ__EQ___5020 = function(x) {
    return true
  };
  var _EQ__EQ___5021 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___5022 = function() {
    var G__5024__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__5025 = y;
            var G__5026 = cljs.core.first.call(null, more);
            var G__5027 = cljs.core.next.call(null, more);
            x = G__5025;
            y = G__5026;
            more = G__5027;
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
    var G__5024 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__5024__delegate.call(this, x, y, more)
    };
    G__5024.cljs$lang$maxFixedArity = 2;
    G__5024.cljs$lang$applyTo = function(arglist__5028) {
      var x = cljs.core.first(arglist__5028);
      var y = cljs.core.first(cljs.core.next(arglist__5028));
      var more = cljs.core.rest(cljs.core.next(arglist__5028));
      return G__5024__delegate.call(this, x, y, more)
    };
    return G__5024
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___5020.call(this, x);
      case 2:
        return _EQ__EQ___5021.call(this, x, y);
      default:
        return _EQ__EQ___5022.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___5022.cljs$lang$applyTo;
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
  var n__5038 = n;
  var xs__5039 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____5040 = xs__5039;
      if(cljs.core.truth_(and__3546__auto____5040)) {
        return n__5038 > 0
      }else {
        return and__3546__auto____5040
      }
    }())) {
      var G__5041 = n__5038 - 1;
      var G__5042 = cljs.core.next.call(null, xs__5039);
      n__5038 = G__5041;
      xs__5039 = G__5042;
      continue
    }else {
      return xs__5039
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__5050 = null;
  var G__5050__5051 = function(coll, n) {
    var temp__3695__auto____5043 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____5043)) {
      var xs__5044 = temp__3695__auto____5043;
      return cljs.core.first.call(null, xs__5044)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__5050__5052 = function(coll, n, not_found) {
    var temp__3695__auto____5047 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____5047)) {
      var xs__5049 = temp__3695__auto____5047;
      return cljs.core.first.call(null, xs__5049)
    }else {
      return not_found
    }
  };
  G__5050 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5050__5051.call(this, coll, n);
      case 3:
        return G__5050__5052.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5050
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___5064 = function() {
    return""
  };
  var str_STAR___5065 = function(x) {
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
  var str_STAR___5066 = function() {
    var G__5068__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__5069 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__5070 = cljs.core.next.call(null, more);
            sb = G__5069;
            more = G__5070;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__5068 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__5068__delegate.call(this, x, ys)
    };
    G__5068.cljs$lang$maxFixedArity = 1;
    G__5068.cljs$lang$applyTo = function(arglist__5071) {
      var x = cljs.core.first(arglist__5071);
      var ys = cljs.core.rest(arglist__5071);
      return G__5068__delegate.call(this, x, ys)
    };
    return G__5068
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___5064.call(this);
      case 1:
        return str_STAR___5065.call(this, x);
      default:
        return str_STAR___5066.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___5066.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__5079 = function() {
    return""
  };
  var str__5080 = function(x) {
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
  var str__5081 = function() {
    var G__5084__delegate = function(x, ys) {
      return cljs.core.apply.call(null, cljs.core.str_STAR_, x, ys)
    };
    var G__5084 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__5084__delegate.call(this, x, ys)
    };
    G__5084.cljs$lang$maxFixedArity = 1;
    G__5084.cljs$lang$applyTo = function(arglist__5085) {
      var x = cljs.core.first(arglist__5085);
      var ys = cljs.core.rest(arglist__5085);
      return G__5084__delegate.call(this, x, ys)
    };
    return G__5084
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__5079.call(this);
      case 1:
        return str__5080.call(this, x);
      default:
        return str__5081.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__5081.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__5090 = function(s, start) {
    return s.substring(start)
  };
  var subs__5091 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__5090.call(this, s, start);
      case 3:
        return subs__5091.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__5095 = function(name) {
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
  var symbol__5096 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__5095.call(this, ns);
      case 2:
        return symbol__5096.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__5101 = function(name) {
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
  var keyword__5102 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__5101.call(this, ns);
      case 2:
        return keyword__5102.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__5107 = cljs.core.seq.call(null, x);
    var ys__5108 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(xs__5107 === null)) {
        return ys__5108 === null
      }else {
        if(cljs.core.truth_(ys__5108 === null)) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__5107), cljs.core.first.call(null, ys__5108)))) {
            var G__5112 = cljs.core.next.call(null, xs__5107);
            var G__5113 = cljs.core.next.call(null, ys__5108);
            xs__5107 = G__5112;
            ys__5108 = G__5113;
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
  return cljs.core.reduce.call(null, function(p1__5114_SHARP_, p2__5115_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__5114_SHARP_, cljs.core.hash.call(null, p2__5115_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__5122__5123 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__5122__5123)) {
    var G__5125__5127 = cljs.core.first.call(null, G__5122__5123);
    var vec__5126__5128 = G__5125__5127;
    var key_name__5129 = cljs.core.nth.call(null, vec__5126__5128, 0, null);
    var f__5130 = cljs.core.nth.call(null, vec__5126__5128, 1, null);
    var G__5122__5131 = G__5122__5123;
    var G__5125__5132 = G__5125__5127;
    var G__5122__5133 = G__5122__5131;
    while(true) {
      var vec__5134__5135 = G__5125__5132;
      var key_name__5136 = cljs.core.nth.call(null, vec__5134__5135, 0, null);
      var f__5137 = cljs.core.nth.call(null, vec__5134__5135, 1, null);
      var G__5122__5138 = G__5122__5133;
      var str_name__5139 = cljs.core.name.call(null, key_name__5136);
      obj[str_name__5139] = f__5137;
      var temp__3698__auto____5140 = cljs.core.next.call(null, G__5122__5138);
      if(cljs.core.truth_(temp__3698__auto____5140)) {
        var G__5122__5141 = temp__3698__auto____5140;
        var G__5160 = cljs.core.first.call(null, G__5122__5141);
        var G__5161 = G__5122__5141;
        G__5125__5132 = G__5160;
        G__5122__5133 = G__5161;
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
  var this__5166 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5167 = this;
  return new cljs.core.List(this__5167.meta, o, coll, this__5167.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__5168 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__5169 = this;
  return this__5169.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__5170 = this;
  return this__5170.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__5171 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5172 = this;
  return this__5172.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5173 = this;
  return this__5173.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5174 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5176 = this;
  return new cljs.core.List(meta, this__5176.first, this__5176.rest, this__5176.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5178 = this;
  return this__5178.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5180 = this;
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
  var this__5190 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5191 = this;
  return new cljs.core.List(this__5191.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__5192 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__5193 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__5194 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__5195 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5196 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5197 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5198 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5200 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5202 = this;
  return this__5202.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5204 = this;
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
  list.cljs$lang$applyTo = function(arglist__5214) {
    var items = cljs.core.seq(arglist__5214);
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
  var this__5216 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__5217 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5218 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5219 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__5219.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5220 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5222 = this;
  return this__5222.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5224 = this;
  if(cljs.core.truth_(this__5224.rest === null)) {
    return cljs.core.List.EMPTY
  }else {
    return this__5224.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5226 = this;
  return this__5226.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5228 = this;
  return new cljs.core.Cons(meta, this__5228.first, this__5228.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__5234 = null;
  var G__5234__5235 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__5234__5236 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__5234 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__5234__5235.call(this, string, f);
      case 3:
        return G__5234__5236.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5234
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__5240 = null;
  var G__5240__5243 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__5240__5244 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__5240 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5240__5243.call(this, string, k);
      case 3:
        return G__5240__5244.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5240
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__5254 = null;
  var G__5254__5255 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__5254__5256 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__5254 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5254__5255.call(this, string, n);
      case 3:
        return G__5254__5256.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5254
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
  var G__5274 = null;
  var G__5274__5275 = function(tsym5264, coll) {
    var tsym5264__5267 = this;
    var this$__5271 = tsym5264__5267;
    return cljs.core.get.call(null, coll, this$__5271.toString())
  };
  var G__5274__5276 = function(tsym5265, coll, not_found) {
    var tsym5265__5272 = this;
    var this$__5273 = tsym5265__5272;
    return cljs.core.get.call(null, coll, this$__5273.toString(), not_found)
  };
  G__5274 = function(tsym5265, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__5274__5275.call(this, tsym5265, coll);
      case 3:
        return G__5274__5276.call(this, tsym5265, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__5274
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__5279 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__5279
  }else {
    lazy_seq.x = x__5279.call(null);
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
  var this__5288 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__5290 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__5291 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__5292 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__5292.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__5293 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__5294 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__5295 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__5296 = this;
  return this__5296.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__5298 = this;
  return new cljs.core.LazySeq(meta, this__5298.realized, this__5298.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__5308 = cljs.core.array.call(null);
  var s__5309 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__5309))) {
      ary__5308.push(cljs.core.first.call(null, s__5309));
      var G__5310 = cljs.core.next.call(null, s__5309);
      s__5309 = G__5310;
      continue
    }else {
      return ary__5308
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__5311 = s;
  var i__5312 = n;
  var sum__5313 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____5314 = i__5312 > 0;
      if(cljs.core.truth_(and__3546__auto____5314)) {
        return cljs.core.seq.call(null, s__5311)
      }else {
        return and__3546__auto____5314
      }
    }())) {
      var G__5317 = cljs.core.next.call(null, s__5311);
      var G__5318 = i__5312 - 1;
      var G__5319 = sum__5313 + 1;
      s__5311 = G__5317;
      i__5312 = G__5318;
      sum__5313 = G__5319;
      continue
    }else {
      return sum__5313
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
  var concat__5331 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__5332 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__5333 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__5327 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__5327)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__5327), concat.call(null, cljs.core.rest.call(null, s__5327), y))
      }else {
        return y
      }
    })
  };
  var concat__5334 = function() {
    var G__5336__delegate = function(x, y, zs) {
      var cat__5330 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__5329 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__5329)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__5329), cat.call(null, cljs.core.rest.call(null, xys__5329), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__5330.call(null, concat.call(null, x, y), zs)
    };
    var G__5336 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__5336__delegate.call(this, x, y, zs)
    };
    G__5336.cljs$lang$maxFixedArity = 2;
    G__5336.cljs$lang$applyTo = function(arglist__5343) {
      var x = cljs.core.first(arglist__5343);
      var y = cljs.core.first(cljs.core.next(arglist__5343));
      var zs = cljs.core.rest(cljs.core.next(arglist__5343));
      return G__5336__delegate.call(this, x, y, zs)
    };
    return G__5336
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__5331.call(this);
      case 1:
        return concat__5332.call(this, x);
      case 2:
        return concat__5333.call(this, x, y);
      default:
        return concat__5334.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__5334.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___5349 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___5350 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___5351 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___5352 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___5353 = function() {
    var G__5357__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__5357 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__5357__delegate.call(this, a, b, c, d, more)
    };
    G__5357.cljs$lang$maxFixedArity = 4;
    G__5357.cljs$lang$applyTo = function(arglist__5369) {
      var a = cljs.core.first(arglist__5369);
      var b = cljs.core.first(cljs.core.next(arglist__5369));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5369)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5369))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5369))));
      return G__5357__delegate.call(this, a, b, c, d, more)
    };
    return G__5357
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___5349.call(this, a);
      case 2:
        return list_STAR___5350.call(this, a, b);
      case 3:
        return list_STAR___5351.call(this, a, b, c);
      case 4:
        return list_STAR___5352.call(this, a, b, c, d);
      default:
        return list_STAR___5353.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___5353.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__5387 = function(f, args) {
    var fixed_arity__5371 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__5371 + 1) <= fixed_arity__5371)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__5388 = function(f, x, args) {
    var arglist__5372 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__5373 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5372, fixed_arity__5373) <= fixed_arity__5373)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5372))
      }else {
        return f.cljs$lang$applyTo(arglist__5372)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__5372))
    }
  };
  var apply__5389 = function(f, x, y, args) {
    var arglist__5375 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__5376 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5375, fixed_arity__5376) <= fixed_arity__5376)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5375))
      }else {
        return f.cljs$lang$applyTo(arglist__5375)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__5375))
    }
  };
  var apply__5390 = function(f, x, y, z, args) {
    var arglist__5382 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__5383 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5382, fixed_arity__5383) <= fixed_arity__5383)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5382))
      }else {
        return f.cljs$lang$applyTo(arglist__5382)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__5382))
    }
  };
  var apply__5391 = function() {
    var G__5396__delegate = function(f, a, b, c, d, args) {
      var arglist__5385 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__5386 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__5385, fixed_arity__5386) <= fixed_arity__5386)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__5385))
        }else {
          return f.cljs$lang$applyTo(arglist__5385)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__5385))
      }
    };
    var G__5396 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__5396__delegate.call(this, f, a, b, c, d, args)
    };
    G__5396.cljs$lang$maxFixedArity = 5;
    G__5396.cljs$lang$applyTo = function(arglist__5399) {
      var f = cljs.core.first(arglist__5399);
      var a = cljs.core.first(cljs.core.next(arglist__5399));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5399)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5399))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5399)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5399)))));
      return G__5396__delegate.call(this, f, a, b, c, d, args)
    };
    return G__5396
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__5387.call(this, f, a);
      case 3:
        return apply__5388.call(this, f, a, b);
      case 4:
        return apply__5389.call(this, f, a, b, c);
      case 5:
        return apply__5390.call(this, f, a, b, c, d);
      default:
        return apply__5391.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__5391.cljs$lang$applyTo;
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
  vary_meta.cljs$lang$applyTo = function(arglist__5400) {
    var obj = cljs.core.first(arglist__5400);
    var f = cljs.core.first(cljs.core.next(arglist__5400));
    var args = cljs.core.rest(cljs.core.next(arglist__5400));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___5401 = function(x) {
    return false
  };
  var not_EQ___5402 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___5403 = function() {
    var G__5405__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__5405 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__5405__delegate.call(this, x, y, more)
    };
    G__5405.cljs$lang$maxFixedArity = 2;
    G__5405.cljs$lang$applyTo = function(arglist__5406) {
      var x = cljs.core.first(arglist__5406);
      var y = cljs.core.first(cljs.core.next(arglist__5406));
      var more = cljs.core.rest(cljs.core.next(arglist__5406));
      return G__5405__delegate.call(this, x, y, more)
    };
    return G__5405
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___5401.call(this, x);
      case 2:
        return not_EQ___5402.call(this, x, y);
      default:
        return not_EQ___5403.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___5403.cljs$lang$applyTo;
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
        var G__5415 = pred;
        var G__5416 = cljs.core.next.call(null, coll);
        pred = G__5415;
        coll = G__5416;
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
      var or__3548__auto____5419 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____5419)) {
        return or__3548__auto____5419
      }else {
        var G__5420 = pred;
        var G__5421 = cljs.core.next.call(null, coll);
        pred = G__5420;
        coll = G__5421;
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
    var G__5449 = null;
    var G__5449__5450 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__5449__5451 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__5449__5452 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__5449__5453 = function() {
      var G__5456__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__5456 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__5456__delegate.call(this, x, y, zs)
      };
      G__5456.cljs$lang$maxFixedArity = 2;
      G__5456.cljs$lang$applyTo = function(arglist__5458) {
        var x = cljs.core.first(arglist__5458);
        var y = cljs.core.first(cljs.core.next(arglist__5458));
        var zs = cljs.core.rest(cljs.core.next(arglist__5458));
        return G__5456__delegate.call(this, x, y, zs)
      };
      return G__5456
    }();
    G__5449 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__5449__5450.call(this);
        case 1:
          return G__5449__5451.call(this, x);
        case 2:
          return G__5449__5452.call(this, x, y);
        default:
          return G__5449__5453.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__5449.cljs$lang$maxFixedArity = 2;
    G__5449.cljs$lang$applyTo = G__5449__5453.cljs$lang$applyTo;
    return G__5449
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__5463__delegate = function(args) {
      return x
    };
    var G__5463 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__5463__delegate.call(this, args)
    };
    G__5463.cljs$lang$maxFixedArity = 0;
    G__5463.cljs$lang$applyTo = function(arglist__5464) {
      var args = cljs.core.seq(arglist__5464);
      return G__5463__delegate.call(this, args)
    };
    return G__5463
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__5481 = function() {
    return cljs.core.identity
  };
  var comp__5482 = function(f) {
    return f
  };
  var comp__5483 = function(f, g) {
    return function() {
      var G__5489 = null;
      var G__5489__5490 = function() {
        return f.call(null, g.call(null))
      };
      var G__5489__5491 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__5489__5492 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__5489__5493 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__5489__5494 = function() {
        var G__5496__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__5496 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5496__delegate.call(this, x, y, z, args)
        };
        G__5496.cljs$lang$maxFixedArity = 3;
        G__5496.cljs$lang$applyTo = function(arglist__5497) {
          var x = cljs.core.first(arglist__5497);
          var y = cljs.core.first(cljs.core.next(arglist__5497));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5497)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5497)));
          return G__5496__delegate.call(this, x, y, z, args)
        };
        return G__5496
      }();
      G__5489 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__5489__5490.call(this);
          case 1:
            return G__5489__5491.call(this, x);
          case 2:
            return G__5489__5492.call(this, x, y);
          case 3:
            return G__5489__5493.call(this, x, y, z);
          default:
            return G__5489__5494.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5489.cljs$lang$maxFixedArity = 3;
      G__5489.cljs$lang$applyTo = G__5489__5494.cljs$lang$applyTo;
      return G__5489
    }()
  };
  var comp__5484 = function(f, g, h) {
    return function() {
      var G__5498 = null;
      var G__5498__5499 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__5498__5500 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__5498__5501 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__5498__5502 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__5498__5503 = function() {
        var G__5505__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__5505 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5505__delegate.call(this, x, y, z, args)
        };
        G__5505.cljs$lang$maxFixedArity = 3;
        G__5505.cljs$lang$applyTo = function(arglist__5506) {
          var x = cljs.core.first(arglist__5506);
          var y = cljs.core.first(cljs.core.next(arglist__5506));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5506)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5506)));
          return G__5505__delegate.call(this, x, y, z, args)
        };
        return G__5505
      }();
      G__5498 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__5498__5499.call(this);
          case 1:
            return G__5498__5500.call(this, x);
          case 2:
            return G__5498__5501.call(this, x, y);
          case 3:
            return G__5498__5502.call(this, x, y, z);
          default:
            return G__5498__5503.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5498.cljs$lang$maxFixedArity = 3;
      G__5498.cljs$lang$applyTo = G__5498__5503.cljs$lang$applyTo;
      return G__5498
    }()
  };
  var comp__5485 = function() {
    var G__5507__delegate = function(f1, f2, f3, fs) {
      var fs__5472 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__5508__delegate = function(args) {
          var ret__5475 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__5472), args);
          var fs__5476 = cljs.core.next.call(null, fs__5472);
          while(true) {
            if(cljs.core.truth_(fs__5476)) {
              var G__5509 = cljs.core.first.call(null, fs__5476).call(null, ret__5475);
              var G__5510 = cljs.core.next.call(null, fs__5476);
              ret__5475 = G__5509;
              fs__5476 = G__5510;
              continue
            }else {
              return ret__5475
            }
            break
          }
        };
        var G__5508 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__5508__delegate.call(this, args)
        };
        G__5508.cljs$lang$maxFixedArity = 0;
        G__5508.cljs$lang$applyTo = function(arglist__5515) {
          var args = cljs.core.seq(arglist__5515);
          return G__5508__delegate.call(this, args)
        };
        return G__5508
      }()
    };
    var G__5507 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__5507__delegate.call(this, f1, f2, f3, fs)
    };
    G__5507.cljs$lang$maxFixedArity = 3;
    G__5507.cljs$lang$applyTo = function(arglist__5522) {
      var f1 = cljs.core.first(arglist__5522);
      var f2 = cljs.core.first(cljs.core.next(arglist__5522));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5522)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5522)));
      return G__5507__delegate.call(this, f1, f2, f3, fs)
    };
    return G__5507
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__5481.call(this);
      case 1:
        return comp__5482.call(this, f1);
      case 2:
        return comp__5483.call(this, f1, f2);
      case 3:
        return comp__5484.call(this, f1, f2, f3);
      default:
        return comp__5485.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__5485.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__5531 = function(f, arg1) {
    return function() {
      var G__5536__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__5536 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__5536__delegate.call(this, args)
      };
      G__5536.cljs$lang$maxFixedArity = 0;
      G__5536.cljs$lang$applyTo = function(arglist__5538) {
        var args = cljs.core.seq(arglist__5538);
        return G__5536__delegate.call(this, args)
      };
      return G__5536
    }()
  };
  var partial__5532 = function(f, arg1, arg2) {
    return function() {
      var G__5539__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__5539 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__5539__delegate.call(this, args)
      };
      G__5539.cljs$lang$maxFixedArity = 0;
      G__5539.cljs$lang$applyTo = function(arglist__5545) {
        var args = cljs.core.seq(arglist__5545);
        return G__5539__delegate.call(this, args)
      };
      return G__5539
    }()
  };
  var partial__5533 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__5546__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__5546 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__5546__delegate.call(this, args)
      };
      G__5546.cljs$lang$maxFixedArity = 0;
      G__5546.cljs$lang$applyTo = function(arglist__5547) {
        var args = cljs.core.seq(arglist__5547);
        return G__5546__delegate.call(this, args)
      };
      return G__5546
    }()
  };
  var partial__5534 = function() {
    var G__5548__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__5549__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__5549 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__5549__delegate.call(this, args)
        };
        G__5549.cljs$lang$maxFixedArity = 0;
        G__5549.cljs$lang$applyTo = function(arglist__5551) {
          var args = cljs.core.seq(arglist__5551);
          return G__5549__delegate.call(this, args)
        };
        return G__5549
      }()
    };
    var G__5548 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__5548__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__5548.cljs$lang$maxFixedArity = 4;
    G__5548.cljs$lang$applyTo = function(arglist__5552) {
      var f = cljs.core.first(arglist__5552);
      var arg1 = cljs.core.first(cljs.core.next(arglist__5552));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5552)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5552))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5552))));
      return G__5548__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__5548
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__5531.call(this, f, arg1);
      case 3:
        return partial__5532.call(this, f, arg1, arg2);
      case 4:
        return partial__5533.call(this, f, arg1, arg2, arg3);
      default:
        return partial__5534.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__5534.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__5557 = function(f, x) {
    return function() {
      var G__5561 = null;
      var G__5561__5563 = function(a) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a)
      };
      var G__5561__5564 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b)
      };
      var G__5561__5565 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, b, c)
      };
      var G__5561__5566 = function() {
        var G__5570__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, b, c, ds)
        };
        var G__5570 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5570__delegate.call(this, a, b, c, ds)
        };
        G__5570.cljs$lang$maxFixedArity = 3;
        G__5570.cljs$lang$applyTo = function(arglist__5571) {
          var a = cljs.core.first(arglist__5571);
          var b = cljs.core.first(cljs.core.next(arglist__5571));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5571)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5571)));
          return G__5570__delegate.call(this, a, b, c, ds)
        };
        return G__5570
      }();
      G__5561 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__5561__5563.call(this, a);
          case 2:
            return G__5561__5564.call(this, a, b);
          case 3:
            return G__5561__5565.call(this, a, b, c);
          default:
            return G__5561__5566.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5561.cljs$lang$maxFixedArity = 3;
      G__5561.cljs$lang$applyTo = G__5561__5566.cljs$lang$applyTo;
      return G__5561
    }()
  };
  var fnil__5558 = function(f, x, y) {
    return function() {
      var G__5572 = null;
      var G__5572__5573 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__5572__5574 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c)
      };
      var G__5572__5575 = function() {
        var G__5580__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, c, ds)
        };
        var G__5580 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5580__delegate.call(this, a, b, c, ds)
        };
        G__5580.cljs$lang$maxFixedArity = 3;
        G__5580.cljs$lang$applyTo = function(arglist__5584) {
          var a = cljs.core.first(arglist__5584);
          var b = cljs.core.first(cljs.core.next(arglist__5584));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5584)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5584)));
          return G__5580__delegate.call(this, a, b, c, ds)
        };
        return G__5580
      }();
      G__5572 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__5572__5573.call(this, a, b);
          case 3:
            return G__5572__5574.call(this, a, b, c);
          default:
            return G__5572__5575.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5572.cljs$lang$maxFixedArity = 3;
      G__5572.cljs$lang$applyTo = G__5572__5575.cljs$lang$applyTo;
      return G__5572
    }()
  };
  var fnil__5559 = function(f, x, y, z) {
    return function() {
      var G__5586 = null;
      var G__5586__5588 = function(a, b) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b)
      };
      var G__5586__5589 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c)
      };
      var G__5586__5590 = function() {
        var G__5594__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(a === null) ? x : a, cljs.core.truth_(b === null) ? y : b, cljs.core.truth_(c === null) ? z : c, ds)
        };
        var G__5594 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5594__delegate.call(this, a, b, c, ds)
        };
        G__5594.cljs$lang$maxFixedArity = 3;
        G__5594.cljs$lang$applyTo = function(arglist__5595) {
          var a = cljs.core.first(arglist__5595);
          var b = cljs.core.first(cljs.core.next(arglist__5595));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5595)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5595)));
          return G__5594__delegate.call(this, a, b, c, ds)
        };
        return G__5594
      }();
      G__5586 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__5586__5588.call(this, a, b);
          case 3:
            return G__5586__5589.call(this, a, b, c);
          default:
            return G__5586__5590.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__5586.cljs$lang$maxFixedArity = 3;
      G__5586.cljs$lang$applyTo = G__5586__5590.cljs$lang$applyTo;
      return G__5586
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__5557.call(this, f, x);
      case 3:
        return fnil__5558.call(this, f, x, y);
      case 4:
        return fnil__5559.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__5604 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____5601 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5601)) {
        var s__5603 = temp__3698__auto____5601;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__5603)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__5603)))
      }else {
        return null
      }
    })
  };
  return mapi__5604.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____5611 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____5611)) {
      var s__5613 = temp__3698__auto____5611;
      var x__5615 = f.call(null, cljs.core.first.call(null, s__5613));
      if(cljs.core.truth_(x__5615 === null)) {
        return keep.call(null, f, cljs.core.rest.call(null, s__5613))
      }else {
        return cljs.core.cons.call(null, x__5615, keep.call(null, f, cljs.core.rest.call(null, s__5613)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__5639 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____5631 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5631)) {
        var s__5633 = temp__3698__auto____5631;
        var x__5635 = f.call(null, idx, cljs.core.first.call(null, s__5633));
        if(cljs.core.truth_(x__5635 === null)) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__5633))
        }else {
          return cljs.core.cons.call(null, x__5635, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__5633)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__5639.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__5755 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__5760 = function() {
        return true
      };
      var ep1__5761 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__5762 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5658 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5658)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____5658
          }
        }())
      };
      var ep1__5763 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5659 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5659)) {
            var and__3546__auto____5661 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____5661)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____5661
            }
          }else {
            return and__3546__auto____5659
          }
        }())
      };
      var ep1__5764 = function() {
        var G__5771__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____5663 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____5663)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____5663
            }
          }())
        };
        var G__5771 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5771__delegate.call(this, x, y, z, args)
        };
        G__5771.cljs$lang$maxFixedArity = 3;
        G__5771.cljs$lang$applyTo = function(arglist__5774) {
          var x = cljs.core.first(arglist__5774);
          var y = cljs.core.first(cljs.core.next(arglist__5774));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5774)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5774)));
          return G__5771__delegate.call(this, x, y, z, args)
        };
        return G__5771
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__5760.call(this);
          case 1:
            return ep1__5761.call(this, x);
          case 2:
            return ep1__5762.call(this, x, y);
          case 3:
            return ep1__5763.call(this, x, y, z);
          default:
            return ep1__5764.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__5764.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__5756 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__5779 = function() {
        return true
      };
      var ep2__5780 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5666 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5666)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____5666
          }
        }())
      };
      var ep2__5781 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5667 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5667)) {
            var and__3546__auto____5668 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____5668)) {
              var and__3546__auto____5669 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____5669)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____5669
              }
            }else {
              return and__3546__auto____5668
            }
          }else {
            return and__3546__auto____5667
          }
        }())
      };
      var ep2__5782 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5698 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5698)) {
            var and__3546__auto____5699 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____5699)) {
              var and__3546__auto____5701 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____5701)) {
                var and__3546__auto____5702 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____5702)) {
                  var and__3546__auto____5703 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____5703)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____5703
                  }
                }else {
                  return and__3546__auto____5702
                }
              }else {
                return and__3546__auto____5701
              }
            }else {
              return and__3546__auto____5699
            }
          }else {
            return and__3546__auto____5698
          }
        }())
      };
      var ep2__5783 = function() {
        var G__5792__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____5711 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____5711)) {
              return cljs.core.every_QMARK_.call(null, function(p1__5623_SHARP_) {
                var and__3546__auto____5712 = p1.call(null, p1__5623_SHARP_);
                if(cljs.core.truth_(and__3546__auto____5712)) {
                  return p2.call(null, p1__5623_SHARP_)
                }else {
                  return and__3546__auto____5712
                }
              }, args)
            }else {
              return and__3546__auto____5711
            }
          }())
        };
        var G__5792 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5792__delegate.call(this, x, y, z, args)
        };
        G__5792.cljs$lang$maxFixedArity = 3;
        G__5792.cljs$lang$applyTo = function(arglist__5794) {
          var x = cljs.core.first(arglist__5794);
          var y = cljs.core.first(cljs.core.next(arglist__5794));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5794)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5794)));
          return G__5792__delegate.call(this, x, y, z, args)
        };
        return G__5792
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__5779.call(this);
          case 1:
            return ep2__5780.call(this, x);
          case 2:
            return ep2__5781.call(this, x, y);
          case 3:
            return ep2__5782.call(this, x, y, z);
          default:
            return ep2__5783.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__5783.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__5757 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__5798 = function() {
        return true
      };
      var ep3__5799 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5713 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5713)) {
            var and__3546__auto____5714 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5714)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____5714
            }
          }else {
            return and__3546__auto____5713
          }
        }())
      };
      var ep3__5800 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5716 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5716)) {
            var and__3546__auto____5717 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5717)) {
              var and__3546__auto____5719 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____5719)) {
                var and__3546__auto____5720 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____5720)) {
                  var and__3546__auto____5721 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____5721)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____5721
                  }
                }else {
                  return and__3546__auto____5720
                }
              }else {
                return and__3546__auto____5719
              }
            }else {
              return and__3546__auto____5717
            }
          }else {
            return and__3546__auto____5716
          }
        }())
      };
      var ep3__5801 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____5723 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____5723)) {
            var and__3546__auto____5724 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5724)) {
              var and__3546__auto____5725 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____5725)) {
                var and__3546__auto____5726 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____5726)) {
                  var and__3546__auto____5727 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____5727)) {
                    var and__3546__auto____5729 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____5729)) {
                      var and__3546__auto____5730 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____5730)) {
                        var and__3546__auto____5731 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____5731)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____5731
                        }
                      }else {
                        return and__3546__auto____5730
                      }
                    }else {
                      return and__3546__auto____5729
                    }
                  }else {
                    return and__3546__auto____5727
                  }
                }else {
                  return and__3546__auto____5726
                }
              }else {
                return and__3546__auto____5725
              }
            }else {
              return and__3546__auto____5724
            }
          }else {
            return and__3546__auto____5723
          }
        }())
      };
      var ep3__5802 = function() {
        var G__5817__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____5733 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____5733)) {
              return cljs.core.every_QMARK_.call(null, function(p1__5624_SHARP_) {
                var and__3546__auto____5736 = p1.call(null, p1__5624_SHARP_);
                if(cljs.core.truth_(and__3546__auto____5736)) {
                  var and__3546__auto____5737 = p2.call(null, p1__5624_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____5737)) {
                    return p3.call(null, p1__5624_SHARP_)
                  }else {
                    return and__3546__auto____5737
                  }
                }else {
                  return and__3546__auto____5736
                }
              }, args)
            }else {
              return and__3546__auto____5733
            }
          }())
        };
        var G__5817 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5817__delegate.call(this, x, y, z, args)
        };
        G__5817.cljs$lang$maxFixedArity = 3;
        G__5817.cljs$lang$applyTo = function(arglist__5819) {
          var x = cljs.core.first(arglist__5819);
          var y = cljs.core.first(cljs.core.next(arglist__5819));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5819)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5819)));
          return G__5817__delegate.call(this, x, y, z, args)
        };
        return G__5817
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__5798.call(this);
          case 1:
            return ep3__5799.call(this, x);
          case 2:
            return ep3__5800.call(this, x, y);
          case 3:
            return ep3__5801.call(this, x, y, z);
          default:
            return ep3__5802.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__5802.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__5758 = function() {
    var G__5826__delegate = function(p1, p2, p3, ps) {
      var ps__5739 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__5827 = function() {
          return true
        };
        var epn__5828 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__5625_SHARP_) {
            return p1__5625_SHARP_.call(null, x)
          }, ps__5739)
        };
        var epn__5829 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__5626_SHARP_) {
            var and__3546__auto____5742 = p1__5626_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5742)) {
              return p1__5626_SHARP_.call(null, y)
            }else {
              return and__3546__auto____5742
            }
          }, ps__5739)
        };
        var epn__5830 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__5627_SHARP_) {
            var and__3546__auto____5745 = p1__5627_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____5745)) {
              var and__3546__auto____5747 = p1__5627_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____5747)) {
                return p1__5627_SHARP_.call(null, z)
              }else {
                return and__3546__auto____5747
              }
            }else {
              return and__3546__auto____5745
            }
          }, ps__5739)
        };
        var epn__5831 = function() {
          var G__5834__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____5751 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____5751)) {
                return cljs.core.every_QMARK_.call(null, function(p1__5628_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__5628_SHARP_, args)
                }, ps__5739)
              }else {
                return and__3546__auto____5751
              }
            }())
          };
          var G__5834 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__5834__delegate.call(this, x, y, z, args)
          };
          G__5834.cljs$lang$maxFixedArity = 3;
          G__5834.cljs$lang$applyTo = function(arglist__5836) {
            var x = cljs.core.first(arglist__5836);
            var y = cljs.core.first(cljs.core.next(arglist__5836));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5836)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5836)));
            return G__5834__delegate.call(this, x, y, z, args)
          };
          return G__5834
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__5827.call(this);
            case 1:
              return epn__5828.call(this, x);
            case 2:
              return epn__5829.call(this, x, y);
            case 3:
              return epn__5830.call(this, x, y, z);
            default:
              return epn__5831.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__5831.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__5826 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__5826__delegate.call(this, p1, p2, p3, ps)
    };
    G__5826.cljs$lang$maxFixedArity = 3;
    G__5826.cljs$lang$applyTo = function(arglist__5843) {
      var p1 = cljs.core.first(arglist__5843);
      var p2 = cljs.core.first(cljs.core.next(arglist__5843));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5843)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5843)));
      return G__5826__delegate.call(this, p1, p2, p3, ps)
    };
    return G__5826
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__5755.call(this, p1);
      case 2:
        return every_pred__5756.call(this, p1, p2);
      case 3:
        return every_pred__5757.call(this, p1, p2, p3);
      default:
        return every_pred__5758.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__5758.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__5912 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__5917 = function() {
        return null
      };
      var sp1__5918 = function(x) {
        return p.call(null, x)
      };
      var sp1__5919 = function(x, y) {
        var or__3548__auto____5845 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5845)) {
          return or__3548__auto____5845
        }else {
          return p.call(null, y)
        }
      };
      var sp1__5920 = function(x, y, z) {
        var or__3548__auto____5847 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5847)) {
          return or__3548__auto____5847
        }else {
          var or__3548__auto____5848 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____5848)) {
            return or__3548__auto____5848
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__5921 = function() {
        var G__5923__delegate = function(x, y, z, args) {
          var or__3548__auto____5849 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____5849)) {
            return or__3548__auto____5849
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__5923 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5923__delegate.call(this, x, y, z, args)
        };
        G__5923.cljs$lang$maxFixedArity = 3;
        G__5923.cljs$lang$applyTo = function(arglist__5924) {
          var x = cljs.core.first(arglist__5924);
          var y = cljs.core.first(cljs.core.next(arglist__5924));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5924)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5924)));
          return G__5923__delegate.call(this, x, y, z, args)
        };
        return G__5923
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__5917.call(this);
          case 1:
            return sp1__5918.call(this, x);
          case 2:
            return sp1__5919.call(this, x, y);
          case 3:
            return sp1__5920.call(this, x, y, z);
          default:
            return sp1__5921.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__5921.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__5913 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__5925 = function() {
        return null
      };
      var sp2__5926 = function(x) {
        var or__3548__auto____5851 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5851)) {
          return or__3548__auto____5851
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__5927 = function(x, y) {
        var or__3548__auto____5853 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5853)) {
          return or__3548__auto____5853
        }else {
          var or__3548__auto____5854 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____5854)) {
            return or__3548__auto____5854
          }else {
            var or__3548__auto____5861 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5861)) {
              return or__3548__auto____5861
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__5928 = function(x, y, z) {
        var or__3548__auto____5862 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5862)) {
          return or__3548__auto____5862
        }else {
          var or__3548__auto____5863 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____5863)) {
            return or__3548__auto____5863
          }else {
            var or__3548__auto____5864 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____5864)) {
              return or__3548__auto____5864
            }else {
              var or__3548__auto____5865 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____5865)) {
                return or__3548__auto____5865
              }else {
                var or__3548__auto____5866 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____5866)) {
                  return or__3548__auto____5866
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__5929 = function() {
        var G__5933__delegate = function(x, y, z, args) {
          var or__3548__auto____5868 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____5868)) {
            return or__3548__auto____5868
          }else {
            return cljs.core.some.call(null, function(p1__5648_SHARP_) {
              var or__3548__auto____5869 = p1.call(null, p1__5648_SHARP_);
              if(cljs.core.truth_(or__3548__auto____5869)) {
                return or__3548__auto____5869
              }else {
                return p2.call(null, p1__5648_SHARP_)
              }
            }, args)
          }
        };
        var G__5933 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5933__delegate.call(this, x, y, z, args)
        };
        G__5933.cljs$lang$maxFixedArity = 3;
        G__5933.cljs$lang$applyTo = function(arglist__5934) {
          var x = cljs.core.first(arglist__5934);
          var y = cljs.core.first(cljs.core.next(arglist__5934));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5934)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5934)));
          return G__5933__delegate.call(this, x, y, z, args)
        };
        return G__5933
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__5925.call(this);
          case 1:
            return sp2__5926.call(this, x);
          case 2:
            return sp2__5927.call(this, x, y);
          case 3:
            return sp2__5928.call(this, x, y, z);
          default:
            return sp2__5929.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__5929.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__5914 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__5937 = function() {
        return null
      };
      var sp3__5938 = function(x) {
        var or__3548__auto____5871 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5871)) {
          return or__3548__auto____5871
        }else {
          var or__3548__auto____5873 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____5873)) {
            return or__3548__auto____5873
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__5939 = function(x, y) {
        var or__3548__auto____5874 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5874)) {
          return or__3548__auto____5874
        }else {
          var or__3548__auto____5875 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____5875)) {
            return or__3548__auto____5875
          }else {
            var or__3548__auto____5876 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5876)) {
              return or__3548__auto____5876
            }else {
              var or__3548__auto____5877 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____5877)) {
                return or__3548__auto____5877
              }else {
                var or__3548__auto____5878 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____5878)) {
                  return or__3548__auto____5878
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__5940 = function(x, y, z) {
        var or__3548__auto____5880 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____5880)) {
          return or__3548__auto____5880
        }else {
          var or__3548__auto____5882 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____5882)) {
            return or__3548__auto____5882
          }else {
            var or__3548__auto____5883 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5883)) {
              return or__3548__auto____5883
            }else {
              var or__3548__auto____5884 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____5884)) {
                return or__3548__auto____5884
              }else {
                var or__3548__auto____5885 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____5885)) {
                  return or__3548__auto____5885
                }else {
                  var or__3548__auto____5886 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____5886)) {
                    return or__3548__auto____5886
                  }else {
                    var or__3548__auto____5889 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____5889)) {
                      return or__3548__auto____5889
                    }else {
                      var or__3548__auto____5891 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____5891)) {
                        return or__3548__auto____5891
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
      var sp3__5941 = function() {
        var G__5945__delegate = function(x, y, z, args) {
          var or__3548__auto____5892 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____5892)) {
            return or__3548__auto____5892
          }else {
            return cljs.core.some.call(null, function(p1__5650_SHARP_) {
              var or__3548__auto____5894 = p1.call(null, p1__5650_SHARP_);
              if(cljs.core.truth_(or__3548__auto____5894)) {
                return or__3548__auto____5894
              }else {
                var or__3548__auto____5897 = p2.call(null, p1__5650_SHARP_);
                if(cljs.core.truth_(or__3548__auto____5897)) {
                  return or__3548__auto____5897
                }else {
                  return p3.call(null, p1__5650_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__5945 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__5945__delegate.call(this, x, y, z, args)
        };
        G__5945.cljs$lang$maxFixedArity = 3;
        G__5945.cljs$lang$applyTo = function(arglist__5947) {
          var x = cljs.core.first(arglist__5947);
          var y = cljs.core.first(cljs.core.next(arglist__5947));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5947)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5947)));
          return G__5945__delegate.call(this, x, y, z, args)
        };
        return G__5945
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__5937.call(this);
          case 1:
            return sp3__5938.call(this, x);
          case 2:
            return sp3__5939.call(this, x, y);
          case 3:
            return sp3__5940.call(this, x, y, z);
          default:
            return sp3__5941.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__5941.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__5915 = function() {
    var G__5950__delegate = function(p1, p2, p3, ps) {
      var ps__5900 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__5951 = function() {
          return null
        };
        var spn__5952 = function(x) {
          return cljs.core.some.call(null, function(p1__5651_SHARP_) {
            return p1__5651_SHARP_.call(null, x)
          }, ps__5900)
        };
        var spn__5953 = function(x, y) {
          return cljs.core.some.call(null, function(p1__5652_SHARP_) {
            var or__3548__auto____5901 = p1__5652_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5901)) {
              return or__3548__auto____5901
            }else {
              return p1__5652_SHARP_.call(null, y)
            }
          }, ps__5900)
        };
        var spn__5954 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__5653_SHARP_) {
            var or__3548__auto____5903 = p1__5653_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____5903)) {
              return or__3548__auto____5903
            }else {
              var or__3548__auto____5904 = p1__5653_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____5904)) {
                return or__3548__auto____5904
              }else {
                return p1__5653_SHARP_.call(null, z)
              }
            }
          }, ps__5900)
        };
        var spn__5955 = function() {
          var G__5960__delegate = function(x, y, z, args) {
            var or__3548__auto____5906 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____5906)) {
              return or__3548__auto____5906
            }else {
              return cljs.core.some.call(null, function(p1__5655_SHARP_) {
                return cljs.core.some.call(null, p1__5655_SHARP_, args)
              }, ps__5900)
            }
          };
          var G__5960 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__5960__delegate.call(this, x, y, z, args)
          };
          G__5960.cljs$lang$maxFixedArity = 3;
          G__5960.cljs$lang$applyTo = function(arglist__5962) {
            var x = cljs.core.first(arglist__5962);
            var y = cljs.core.first(cljs.core.next(arglist__5962));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5962)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5962)));
            return G__5960__delegate.call(this, x, y, z, args)
          };
          return G__5960
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__5951.call(this);
            case 1:
              return spn__5952.call(this, x);
            case 2:
              return spn__5953.call(this, x, y);
            case 3:
              return spn__5954.call(this, x, y, z);
            default:
              return spn__5955.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__5955.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__5950 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__5950__delegate.call(this, p1, p2, p3, ps)
    };
    G__5950.cljs$lang$maxFixedArity = 3;
    G__5950.cljs$lang$applyTo = function(arglist__5964) {
      var p1 = cljs.core.first(arglist__5964);
      var p2 = cljs.core.first(cljs.core.next(arglist__5964));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5964)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5964)));
      return G__5950__delegate.call(this, p1, p2, p3, ps)
    };
    return G__5950
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__5912.call(this, p1);
      case 2:
        return some_fn__5913.call(this, p1, p2);
      case 3:
        return some_fn__5914.call(this, p1, p2, p3);
      default:
        return some_fn__5915.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__5915.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__5986 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____5969 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5969)) {
        var s__5970 = temp__3698__auto____5969;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__5970)), map.call(null, f, cljs.core.rest.call(null, s__5970)))
      }else {
        return null
      }
    })
  };
  var map__5987 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__5972 = cljs.core.seq.call(null, c1);
      var s2__5973 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____5974 = s1__5972;
        if(cljs.core.truth_(and__3546__auto____5974)) {
          return s2__5973
        }else {
          return and__3546__auto____5974
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__5972), cljs.core.first.call(null, s2__5973)), map.call(null, f, cljs.core.rest.call(null, s1__5972), cljs.core.rest.call(null, s2__5973)))
      }else {
        return null
      }
    })
  };
  var map__5988 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__5977 = cljs.core.seq.call(null, c1);
      var s2__5978 = cljs.core.seq.call(null, c2);
      var s3__5980 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____5982 = s1__5977;
        if(cljs.core.truth_(and__3546__auto____5982)) {
          var and__3546__auto____5983 = s2__5978;
          if(cljs.core.truth_(and__3546__auto____5983)) {
            return s3__5980
          }else {
            return and__3546__auto____5983
          }
        }else {
          return and__3546__auto____5982
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__5977), cljs.core.first.call(null, s2__5978), cljs.core.first.call(null, s3__5980)), map.call(null, f, cljs.core.rest.call(null, s1__5977), cljs.core.rest.call(null, s2__5978), cljs.core.rest.call(null, s3__5980)))
      }else {
        return null
      }
    })
  };
  var map__5989 = function() {
    var G__5994__delegate = function(f, c1, c2, c3, colls) {
      var step__5985 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__5984 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__5984))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__5984), step.call(null, map.call(null, cljs.core.rest, ss__5984)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__5844_SHARP_) {
        return cljs.core.apply.call(null, f, p1__5844_SHARP_)
      }, step__5985.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__5994 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__5994__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__5994.cljs$lang$maxFixedArity = 4;
    G__5994.cljs$lang$applyTo = function(arglist__5998) {
      var f = cljs.core.first(arglist__5998);
      var c1 = cljs.core.first(cljs.core.next(arglist__5998));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5998)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5998))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5998))));
      return G__5994__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__5994
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__5986.call(this, f, c1);
      case 3:
        return map__5987.call(this, f, c1, c2);
      case 4:
        return map__5988.call(this, f, c1, c2, c3);
      default:
        return map__5989.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__5989.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____5999 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____5999)) {
        var s__6000 = temp__3698__auto____5999;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__6000), take.call(null, n - 1, cljs.core.rest.call(null, s__6000)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__6010 = function(n, coll) {
    while(true) {
      var s__6008 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____6009 = n > 0;
        if(cljs.core.truth_(and__3546__auto____6009)) {
          return s__6008
        }else {
          return and__3546__auto____6009
        }
      }())) {
        var G__6012 = n - 1;
        var G__6013 = cljs.core.rest.call(null, s__6008);
        n = G__6012;
        coll = G__6013;
        continue
      }else {
        return s__6008
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__6010.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__6015 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__6016 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__6015.call(this, n);
      case 2:
        return drop_last__6016.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__6020 = cljs.core.seq.call(null, coll);
  var lead__6021 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__6021)) {
      var G__6023 = cljs.core.next.call(null, s__6020);
      var G__6024 = cljs.core.next.call(null, lead__6021);
      s__6020 = G__6023;
      lead__6021 = G__6024;
      continue
    }else {
      return s__6020
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__6027 = function(pred, coll) {
    while(true) {
      var s__6025 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____6026 = s__6025;
        if(cljs.core.truth_(and__3546__auto____6026)) {
          return pred.call(null, cljs.core.first.call(null, s__6025))
        }else {
          return and__3546__auto____6026
        }
      }())) {
        var G__6031 = pred;
        var G__6032 = cljs.core.rest.call(null, s__6025);
        pred = G__6031;
        coll = G__6032;
        continue
      }else {
        return s__6025
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__6027.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6035 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6035)) {
      var s__6036 = temp__3698__auto____6035;
      return cljs.core.concat.call(null, s__6036, cycle.call(null, s__6036))
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
  var repeat__6041 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__6042 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__6041.call(this, n);
      case 2:
        return repeat__6042.call(this, n, x)
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
  var repeatedly__6046 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__6047 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__6046.call(this, n);
      case 2:
        return repeatedly__6047.call(this, n, f)
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
  var interleave__6059 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__6049 = cljs.core.seq.call(null, c1);
      var s2__6050 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____6051 = s1__6049;
        if(cljs.core.truth_(and__3546__auto____6051)) {
          return s2__6050
        }else {
          return and__3546__auto____6051
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__6049), cljs.core.cons.call(null, cljs.core.first.call(null, s2__6050), interleave.call(null, cljs.core.rest.call(null, s1__6049), cljs.core.rest.call(null, s2__6050))))
      }else {
        return null
      }
    })
  };
  var interleave__6060 = function() {
    var G__6062__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__6055 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__6055))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__6055), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__6055)))
        }else {
          return null
        }
      })
    };
    var G__6062 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6062__delegate.call(this, c1, c2, colls)
    };
    G__6062.cljs$lang$maxFixedArity = 2;
    G__6062.cljs$lang$applyTo = function(arglist__6067) {
      var c1 = cljs.core.first(arglist__6067);
      var c2 = cljs.core.first(cljs.core.next(arglist__6067));
      var colls = cljs.core.rest(cljs.core.next(arglist__6067));
      return G__6062__delegate.call(this, c1, c2, colls)
    };
    return G__6062
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__6059.call(this, c1, c2);
      default:
        return interleave__6060.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__6060.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__6074 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____6070 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____6070)) {
        var coll__6072 = temp__3695__auto____6070;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__6072), cat.call(null, cljs.core.rest.call(null, coll__6072), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__6074.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__6086 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__6087 = function() {
    var G__6089__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__6089 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6089__delegate.call(this, f, coll, colls)
    };
    G__6089.cljs$lang$maxFixedArity = 2;
    G__6089.cljs$lang$applyTo = function(arglist__6090) {
      var f = cljs.core.first(arglist__6090);
      var coll = cljs.core.first(cljs.core.next(arglist__6090));
      var colls = cljs.core.rest(cljs.core.next(arglist__6090));
      return G__6089__delegate.call(this, f, coll, colls)
    };
    return G__6089
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__6086.call(this, f, coll);
      default:
        return mapcat__6087.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__6087.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6091 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6091)) {
      var s__6093 = temp__3698__auto____6091;
      var f__6096 = cljs.core.first.call(null, s__6093);
      var r__6098 = cljs.core.rest.call(null, s__6093);
      if(cljs.core.truth_(pred.call(null, f__6096))) {
        return cljs.core.cons.call(null, f__6096, filter.call(null, pred, r__6098))
      }else {
        return filter.call(null, pred, r__6098)
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
  var walk__6102 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__6102.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__6101_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__6101_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__6132 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__6133 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6118 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6118)) {
        var s__6120 = temp__3698__auto____6118;
        var p__6122 = cljs.core.take.call(null, n, s__6120);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__6122)))) {
          return cljs.core.cons.call(null, p__6122, partition.call(null, n, step, cljs.core.drop.call(null, step, s__6120)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__6134 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6124 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6124)) {
        var s__6125 = temp__3698__auto____6124;
        var p__6127 = cljs.core.take.call(null, n, s__6125);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__6127)))) {
          return cljs.core.cons.call(null, p__6127, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__6125)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__6127, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__6132.call(this, n, step);
      case 3:
        return partition__6133.call(this, n, step, pad);
      case 4:
        return partition__6134.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__6154 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__6155 = function(m, ks, not_found) {
    var sentinel__6146 = cljs.core.lookup_sentinel;
    var m__6147 = m;
    var ks__6148 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__6148)) {
        var m__6149 = cljs.core.get.call(null, m__6147, cljs.core.first.call(null, ks__6148), sentinel__6146);
        if(cljs.core.truth_(sentinel__6146 === m__6149)) {
          return not_found
        }else {
          var G__6157 = sentinel__6146;
          var G__6158 = m__6149;
          var G__6159 = cljs.core.next.call(null, ks__6148);
          sentinel__6146 = G__6157;
          m__6147 = G__6158;
          ks__6148 = G__6159;
          continue
        }
      }else {
        return m__6147
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__6154.call(this, m, ks);
      case 3:
        return get_in__6155.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__6164, v) {
  var vec__6165__6166 = p__6164;
  var k__6167 = cljs.core.nth.call(null, vec__6165__6166, 0, null);
  var ks__6168 = cljs.core.nthnext.call(null, vec__6165__6166, 1);
  if(cljs.core.truth_(ks__6168)) {
    return cljs.core.assoc.call(null, m, k__6167, assoc_in.call(null, cljs.core.get.call(null, m, k__6167), ks__6168, v))
  }else {
    return cljs.core.assoc.call(null, m, k__6167, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__6173, f, args) {
    var vec__6174__6175 = p__6173;
    var k__6176 = cljs.core.nth.call(null, vec__6174__6175, 0, null);
    var ks__6177 = cljs.core.nthnext.call(null, vec__6174__6175, 1);
    if(cljs.core.truth_(ks__6177)) {
      return cljs.core.assoc.call(null, m, k__6176, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__6176), ks__6177, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__6176, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__6176), args))
    }
  };
  var update_in = function(m, p__6173, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__6173, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__6182) {
    var m = cljs.core.first(arglist__6182);
    var p__6173 = cljs.core.first(cljs.core.next(arglist__6182));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6182)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6182)));
    return update_in__delegate.call(this, m, p__6173, f, args)
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
  var this__6183 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6238 = null;
  var G__6238__6239 = function(coll, k) {
    var this__6184 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__6238__6240 = function(coll, k, not_found) {
    var this__6185 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__6238 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6238__6239.call(this, coll, k);
      case 3:
        return G__6238__6240.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6238
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__6186 = this;
  var new_array__6187 = cljs.core.aclone.call(null, this__6186.array);
  new_array__6187[k] = v;
  return new cljs.core.Vector(this__6186.meta, new_array__6187)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__6246 = null;
  var G__6246__6247 = function(tsym6189, k) {
    var this__6191 = this;
    var tsym6189__6192 = this;
    var coll__6193 = tsym6189__6192;
    return cljs.core._lookup.call(null, coll__6193, k)
  };
  var G__6246__6248 = function(tsym6190, k, not_found) {
    var this__6194 = this;
    var tsym6190__6195 = this;
    var coll__6196 = tsym6190__6195;
    return cljs.core._lookup.call(null, coll__6196, k, not_found)
  };
  G__6246 = function(tsym6190, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6246__6247.call(this, tsym6190, k);
      case 3:
        return G__6246__6248.call(this, tsym6190, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6246
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6197 = this;
  var new_array__6198 = cljs.core.aclone.call(null, this__6197.array);
  new_array__6198.push(o);
  return new cljs.core.Vector(this__6197.meta, new_array__6198)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__6253 = null;
  var G__6253__6254 = function(v, f) {
    var this__6199 = this;
    return cljs.core.ci_reduce.call(null, this__6199.array, f)
  };
  var G__6253__6255 = function(v, f, start) {
    var this__6200 = this;
    return cljs.core.ci_reduce.call(null, this__6200.array, f, start)
  };
  G__6253 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__6253__6254.call(this, v, f);
      case 3:
        return G__6253__6255.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6253
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6201 = this;
  if(cljs.core.truth_(this__6201.array.length > 0)) {
    var vector_seq__6205 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__6201.array.length)) {
          return cljs.core.cons.call(null, this__6201.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__6205.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6206 = this;
  return this__6206.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__6209 = this;
  var count__6210 = this__6209.array.length;
  if(cljs.core.truth_(count__6210 > 0)) {
    return this__6209.array[count__6210 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__6214 = this;
  if(cljs.core.truth_(this__6214.array.length > 0)) {
    var new_array__6216 = cljs.core.aclone.call(null, this__6214.array);
    new_array__6216.pop();
    return new cljs.core.Vector(this__6214.meta, new_array__6216)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__6221 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6223 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6224 = this;
  return new cljs.core.Vector(meta, this__6224.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6226 = this;
  return this__6226.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__6269 = null;
  var G__6269__6270 = function(coll, n) {
    var this__6228 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____6230 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____6230)) {
        return n < this__6228.array.length
      }else {
        return and__3546__auto____6230
      }
    }())) {
      return this__6228.array[n]
    }else {
      return null
    }
  };
  var G__6269__6271 = function(coll, n, not_found) {
    var this__6231 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____6232 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____6232)) {
        return n < this__6231.array.length
      }else {
        return and__3546__auto____6232
      }
    }())) {
      return this__6231.array[n]
    }else {
      return not_found
    }
  };
  G__6269 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6269__6270.call(this, coll, n);
      case 3:
        return G__6269__6271.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6269
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6235 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__6235.meta)
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
  vector.cljs$lang$applyTo = function(arglist__6277) {
    var args = cljs.core.seq(arglist__6277);
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
  var this__6281 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6320 = null;
  var G__6320__6321 = function(coll, k) {
    var this__6282 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__6320__6322 = function(coll, k, not_found) {
    var this__6283 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__6320 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6320__6321.call(this, coll, k);
      case 3:
        return G__6320__6322.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6320
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__6284 = this;
  var v_pos__6285 = this__6284.start + key;
  return new cljs.core.Subvec(this__6284.meta, cljs.core._assoc.call(null, this__6284.v, v_pos__6285, val), this__6284.start, this__6284.end > v_pos__6285 + 1 ? this__6284.end : v_pos__6285 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__6326 = null;
  var G__6326__6327 = function(tsym6288, k) {
    var this__6290 = this;
    var tsym6288__6292 = this;
    var coll__6293 = tsym6288__6292;
    return cljs.core._lookup.call(null, coll__6293, k)
  };
  var G__6326__6328 = function(tsym6289, k, not_found) {
    var this__6295 = this;
    var tsym6289__6296 = this;
    var coll__6297 = tsym6289__6296;
    return cljs.core._lookup.call(null, coll__6297, k, not_found)
  };
  G__6326 = function(tsym6289, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6326__6327.call(this, tsym6289, k);
      case 3:
        return G__6326__6328.call(this, tsym6289, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6326
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6300 = this;
  return new cljs.core.Subvec(this__6300.meta, cljs.core._assoc_n.call(null, this__6300.v, this__6300.end, o), this__6300.start, this__6300.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__6334 = null;
  var G__6334__6336 = function(coll, f) {
    var this__6302 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__6334__6337 = function(coll, f, start) {
    var this__6305 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__6334 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__6334__6336.call(this, coll, f);
      case 3:
        return G__6334__6337.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6334
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6306 = this;
  var subvec_seq__6309 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__6306.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__6306.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__6309.call(null, this__6306.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6310 = this;
  return this__6310.end - this__6310.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__6311 = this;
  return cljs.core._nth.call(null, this__6311.v, this__6311.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__6312 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__6312.start, this__6312.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__6312.meta, this__6312.v, this__6312.start, this__6312.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__6313 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6314 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6315 = this;
  return new cljs.core.Subvec(meta, this__6315.v, this__6315.start, this__6315.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6316 = this;
  return this__6316.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__6349 = null;
  var G__6349__6350 = function(coll, n) {
    var this__6317 = this;
    return cljs.core._nth.call(null, this__6317.v, this__6317.start + n)
  };
  var G__6349__6351 = function(coll, n, not_found) {
    var this__6318 = this;
    return cljs.core._nth.call(null, this__6318.v, this__6318.start + n, not_found)
  };
  G__6349 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6349__6350.call(this, coll, n);
      case 3:
        return G__6349__6351.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6349
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6319 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__6319.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__6353 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__6354 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__6353.call(this, v, start);
      case 3:
        return subvec__6354.call(this, v, start, end)
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
  var this__6356 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__6357 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6359 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6360 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__6360.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6361 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__6362 = this;
  return cljs.core._first.call(null, this__6362.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__6363 = this;
  var temp__3695__auto____6364 = cljs.core.next.call(null, this__6363.front);
  if(cljs.core.truth_(temp__3695__auto____6364)) {
    var f1__6365 = temp__3695__auto____6364;
    return new cljs.core.PersistentQueueSeq(this__6363.meta, f1__6365, this__6363.rear)
  }else {
    if(cljs.core.truth_(this__6363.rear === null)) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__6363.meta, this__6363.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6366 = this;
  return this__6366.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6367 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__6367.front, this__6367.rear)
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
  var this__6375 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6377 = this;
  if(cljs.core.truth_(this__6377.front)) {
    return new cljs.core.PersistentQueue(this__6377.meta, this__6377.count + 1, this__6377.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____6378 = this__6377.rear;
      if(cljs.core.truth_(or__3548__auto____6378)) {
        return or__3548__auto____6378
      }else {
        return cljs.core.Vector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__6377.meta, this__6377.count + 1, cljs.core.conj.call(null, this__6377.front, o), cljs.core.Vector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6381 = this;
  var rear__6382 = cljs.core.seq.call(null, this__6381.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____6383 = this__6381.front;
    if(cljs.core.truth_(or__3548__auto____6383)) {
      return or__3548__auto____6383
    }else {
      return rear__6382
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__6381.front, cljs.core.seq.call(null, rear__6382))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6384 = this;
  return this__6384.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__6385 = this;
  return cljs.core._first.call(null, this__6385.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__6386 = this;
  if(cljs.core.truth_(this__6386.front)) {
    var temp__3695__auto____6387 = cljs.core.next.call(null, this__6386.front);
    if(cljs.core.truth_(temp__3695__auto____6387)) {
      var f1__6388 = temp__3695__auto____6387;
      return new cljs.core.PersistentQueue(this__6386.meta, this__6386.count - 1, f1__6388, this__6386.rear)
    }else {
      return new cljs.core.PersistentQueue(this__6386.meta, this__6386.count - 1, cljs.core.seq.call(null, this__6386.rear), cljs.core.Vector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__6389 = this;
  return cljs.core.first.call(null, this__6389.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__6390 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6391 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6393 = this;
  return new cljs.core.PersistentQueue(meta, this__6393.count, this__6393.front, this__6393.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6395 = this;
  return this__6395.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6397 = this;
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
  var this__6418 = this;
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
  var len__6427 = array.length;
  var i__6428 = 0;
  while(true) {
    if(cljs.core.truth_(i__6428 < len__6427)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__6428]))) {
        return i__6428
      }else {
        var G__6433 = i__6428 + incr;
        i__6428 = G__6433;
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
  var obj_map_contains_key_QMARK___6435 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___6436 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____6434 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____6434)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____6434
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
        return obj_map_contains_key_QMARK___6435.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___6436.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__6439 = cljs.core.hash.call(null, a);
  var b__6440 = cljs.core.hash.call(null, b);
  if(cljs.core.truth_(a__6439 < b__6440)) {
    return-1
  }else {
    if(cljs.core.truth_(a__6439 > b__6440)) {
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
  var this__6442 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6491 = null;
  var G__6491__6492 = function(coll, k) {
    var this__6443 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__6491__6493 = function(coll, k, not_found) {
    var this__6444 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__6444.strobj, this__6444.strobj[k], not_found)
  };
  G__6491 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6491__6492.call(this, coll, k);
      case 3:
        return G__6491__6493.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6491
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__6445 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__6446 = goog.object.clone.call(null, this__6445.strobj);
    var overwrite_QMARK___6447 = new_strobj__6446.hasOwnProperty(k);
    new_strobj__6446[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___6447)) {
      return new cljs.core.ObjMap(this__6445.meta, this__6445.keys, new_strobj__6446)
    }else {
      var new_keys__6448 = cljs.core.aclone.call(null, this__6445.keys);
      new_keys__6448.push(k);
      return new cljs.core.ObjMap(this__6445.meta, new_keys__6448, new_strobj__6446)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__6445.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__6449 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__6449.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__6495 = null;
  var G__6495__6497 = function(tsym6450, k) {
    var this__6452 = this;
    var tsym6450__6454 = this;
    var coll__6455 = tsym6450__6454;
    return cljs.core._lookup.call(null, coll__6455, k)
  };
  var G__6495__6498 = function(tsym6451, k, not_found) {
    var this__6457 = this;
    var tsym6451__6459 = this;
    var coll__6460 = tsym6451__6459;
    return cljs.core._lookup.call(null, coll__6460, k, not_found)
  };
  G__6495 = function(tsym6451, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6495__6497.call(this, tsym6451, k);
      case 3:
        return G__6495__6498.call(this, tsym6451, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6495
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__6463 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6465 = this;
  if(cljs.core.truth_(this__6465.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__6438_SHARP_) {
      return cljs.core.vector.call(null, p1__6438_SHARP_, this__6465.strobj[p1__6438_SHARP_])
    }, this__6465.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6472 = this;
  return this__6472.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6473 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6474 = this;
  return new cljs.core.ObjMap(meta, this__6474.keys, this__6474.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6476 = this;
  return this__6476.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6478 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__6478.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__6481 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____6484 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____6484)) {
      return this__6481.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____6484
    }
  }())) {
    var new_keys__6487 = cljs.core.aclone.call(null, this__6481.keys);
    var new_strobj__6489 = goog.object.clone.call(null, this__6481.strobj);
    new_keys__6487.splice(cljs.core.scan_array.call(null, 1, k, new_keys__6487), 1);
    cljs.core.js_delete.call(null, new_strobj__6489, k);
    return new cljs.core.ObjMap(this__6481.meta, new_keys__6487, new_strobj__6489)
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
  var this__6520 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6572 = null;
  var G__6572__6573 = function(coll, k) {
    var this__6521 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__6572__6574 = function(coll, k, not_found) {
    var this__6522 = this;
    var bucket__6523 = this__6522.hashobj[cljs.core.hash.call(null, k)];
    var i__6524 = cljs.core.truth_(bucket__6523) ? cljs.core.scan_array.call(null, 2, k, bucket__6523) : null;
    if(cljs.core.truth_(i__6524)) {
      return bucket__6523[i__6524 + 1]
    }else {
      return not_found
    }
  };
  G__6572 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6572__6573.call(this, coll, k);
      case 3:
        return G__6572__6574.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6572
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__6525 = this;
  var h__6526 = cljs.core.hash.call(null, k);
  var bucket__6527 = this__6525.hashobj[h__6526];
  if(cljs.core.truth_(bucket__6527)) {
    var new_bucket__6529 = cljs.core.aclone.call(null, bucket__6527);
    var new_hashobj__6530 = goog.object.clone.call(null, this__6525.hashobj);
    new_hashobj__6530[h__6526] = new_bucket__6529;
    var temp__3695__auto____6534 = cljs.core.scan_array.call(null, 2, k, new_bucket__6529);
    if(cljs.core.truth_(temp__3695__auto____6534)) {
      var i__6535 = temp__3695__auto____6534;
      new_bucket__6529[i__6535 + 1] = v;
      return new cljs.core.HashMap(this__6525.meta, this__6525.count, new_hashobj__6530)
    }else {
      new_bucket__6529.push(k, v);
      return new cljs.core.HashMap(this__6525.meta, this__6525.count + 1, new_hashobj__6530)
    }
  }else {
    var new_hashobj__6536 = goog.object.clone.call(null, this__6525.hashobj);
    new_hashobj__6536[h__6526] = cljs.core.array.call(null, k, v);
    return new cljs.core.HashMap(this__6525.meta, this__6525.count + 1, new_hashobj__6536)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__6537 = this;
  var bucket__6538 = this__6537.hashobj[cljs.core.hash.call(null, k)];
  var i__6539 = cljs.core.truth_(bucket__6538) ? cljs.core.scan_array.call(null, 2, k, bucket__6538) : null;
  if(cljs.core.truth_(i__6539)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__6579 = null;
  var G__6579__6580 = function(tsym6540, k) {
    var this__6542 = this;
    var tsym6540__6543 = this;
    var coll__6544 = tsym6540__6543;
    return cljs.core._lookup.call(null, coll__6544, k)
  };
  var G__6579__6581 = function(tsym6541, k, not_found) {
    var this__6545 = this;
    var tsym6541__6546 = this;
    var coll__6547 = tsym6541__6546;
    return cljs.core._lookup.call(null, coll__6547, k, not_found)
  };
  G__6579 = function(tsym6541, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6579__6580.call(this, tsym6541, k);
      case 3:
        return G__6579__6581.call(this, tsym6541, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6579
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__6548 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6549 = this;
  if(cljs.core.truth_(this__6549.count > 0)) {
    var hashes__6550 = cljs.core.js_keys.call(null, this__6549.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__6513_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__6549.hashobj[p1__6513_SHARP_]))
    }, hashes__6550)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6551 = this;
  return this__6551.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6555 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6556 = this;
  return new cljs.core.HashMap(meta, this__6556.count, this__6556.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6557 = this;
  return this__6557.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6560 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__6560.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__6561 = this;
  var h__6562 = cljs.core.hash.call(null, k);
  var bucket__6563 = this__6561.hashobj[h__6562];
  var i__6566 = cljs.core.truth_(bucket__6563) ? cljs.core.scan_array.call(null, 2, k, bucket__6563) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__6566))) {
    return coll
  }else {
    var new_hashobj__6567 = goog.object.clone.call(null, this__6561.hashobj);
    if(cljs.core.truth_(3 > bucket__6563.length)) {
      cljs.core.js_delete.call(null, new_hashobj__6567, h__6562)
    }else {
      var new_bucket__6568 = cljs.core.aclone.call(null, bucket__6563);
      new_bucket__6568.splice(i__6566, 2);
      new_hashobj__6567[h__6562] = new_bucket__6568
    }
    return new cljs.core.HashMap(this__6561.meta, this__6561.count - 1, new_hashobj__6567)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__6591 = ks.length;
  var i__6592 = 0;
  var out__6593 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__6592 < len__6591)) {
      var G__6597 = i__6592 + 1;
      var G__6599 = cljs.core.assoc.call(null, out__6593, ks[i__6592], vs[i__6592]);
      i__6592 = G__6597;
      out__6593 = G__6599;
      continue
    }else {
      return out__6593
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__6600 = cljs.core.seq.call(null, keyvals);
    var out__6601 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__6600)) {
        var G__6604 = cljs.core.nnext.call(null, in$__6600);
        var G__6605 = cljs.core.assoc.call(null, out__6601, cljs.core.first.call(null, in$__6600), cljs.core.second.call(null, in$__6600));
        in$__6600 = G__6604;
        out__6601 = G__6605;
        continue
      }else {
        return out__6601
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
  hash_map.cljs$lang$applyTo = function(arglist__6606) {
    var keyvals = cljs.core.seq(arglist__6606);
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
      return cljs.core.reduce.call(null, function(p1__6607_SHARP_, p2__6608_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____6617 = p1__6607_SHARP_;
          if(cljs.core.truth_(or__3548__auto____6617)) {
            return or__3548__auto____6617
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__6608_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__6623) {
    var maps = cljs.core.seq(arglist__6623);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__6630 = function(m, e) {
        var k__6627 = cljs.core.first.call(null, e);
        var v__6628 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__6627))) {
          return cljs.core.assoc.call(null, m, k__6627, f.call(null, cljs.core.get.call(null, m, k__6627), v__6628))
        }else {
          return cljs.core.assoc.call(null, m, k__6627, v__6628)
        }
      };
      var merge2__6633 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__6630, function() {
          var or__3548__auto____6632 = m1;
          if(cljs.core.truth_(or__3548__auto____6632)) {
            return or__3548__auto____6632
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__6633, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__6641) {
    var f = cljs.core.first(arglist__6641);
    var maps = cljs.core.rest(arglist__6641);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__6647 = cljs.core.ObjMap.fromObject([], {});
  var keys__6648 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__6648)) {
      var key__6649 = cljs.core.first.call(null, keys__6648);
      var entry__6650 = cljs.core.get.call(null, map, key__6649, "\ufdd0'user/not-found");
      var G__6651 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__6650, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__6647, key__6649, entry__6650) : ret__6647;
      var G__6652 = cljs.core.next.call(null, keys__6648);
      ret__6647 = G__6651;
      keys__6648 = G__6652;
      continue
    }else {
      return ret__6647
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
  var this__6656 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__6684 = null;
  var G__6684__6685 = function(coll, v) {
    var this__6657 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__6684__6686 = function(coll, v, not_found) {
    var this__6658 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__6658.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__6684 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6684__6685.call(this, coll, v);
      case 3:
        return G__6684__6686.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6684
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__6694 = null;
  var G__6694__6695 = function(tsym6659, k) {
    var this__6661 = this;
    var tsym6659__6664 = this;
    var coll__6665 = tsym6659__6664;
    return cljs.core._lookup.call(null, coll__6665, k)
  };
  var G__6694__6696 = function(tsym6660, k, not_found) {
    var this__6666 = this;
    var tsym6660__6667 = this;
    var coll__6668 = tsym6660__6667;
    return cljs.core._lookup.call(null, coll__6668, k, not_found)
  };
  G__6694 = function(tsym6660, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6694__6695.call(this, tsym6660, k);
      case 3:
        return G__6694__6696.call(this, tsym6660, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6694
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__6670 = this;
  return new cljs.core.Set(this__6670.meta, cljs.core.assoc.call(null, this__6670.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__6671 = this;
  return cljs.core.keys.call(null, this__6671.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__6674 = this;
  return new cljs.core.Set(this__6674.meta, cljs.core.dissoc.call(null, this__6674.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__6675 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__6677 = this;
  var and__3546__auto____6679 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____6679)) {
    var and__3546__auto____6680 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____6680)) {
      return cljs.core.every_QMARK_.call(null, function(p1__6642_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__6642_SHARP_)
      }, other)
    }else {
      return and__3546__auto____6680
    }
  }else {
    return and__3546__auto____6679
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__6681 = this;
  return new cljs.core.Set(meta, this__6681.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__6682 = this;
  return this__6682.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__6683 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__6683.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__6707 = cljs.core.seq.call(null, coll);
  var out__6708 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__6707)))) {
      var G__6711 = cljs.core.rest.call(null, in$__6707);
      var G__6712 = cljs.core.conj.call(null, out__6708, cljs.core.first.call(null, in$__6707));
      in$__6707 = G__6711;
      out__6708 = G__6712;
      continue
    }else {
      return out__6708
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__6713 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____6714 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____6714)) {
        var e__6715 = temp__3695__auto____6714;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__6715))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__6713, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__6704_SHARP_) {
      var temp__3695__auto____6716 = cljs.core.find.call(null, smap, p1__6704_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____6716)) {
        var e__6717 = temp__3695__auto____6716;
        return cljs.core.second.call(null, e__6717)
      }else {
        return p1__6704_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__6733 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__6722, seen) {
        while(true) {
          var vec__6723__6724 = p__6722;
          var f__6725 = cljs.core.nth.call(null, vec__6723__6724, 0, null);
          var xs__6727 = vec__6723__6724;
          var temp__3698__auto____6730 = cljs.core.seq.call(null, xs__6727);
          if(cljs.core.truth_(temp__3698__auto____6730)) {
            var s__6732 = temp__3698__auto____6730;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__6725))) {
              var G__6739 = cljs.core.rest.call(null, s__6732);
              var G__6740 = seen;
              p__6722 = G__6739;
              seen = G__6740;
              continue
            }else {
              return cljs.core.cons.call(null, f__6725, step.call(null, cljs.core.rest.call(null, s__6732), cljs.core.conj.call(null, seen, f__6725)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__6733.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__6745 = cljs.core.Vector.fromArray([]);
  var s__6746 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__6746))) {
      var G__6748 = cljs.core.conj.call(null, ret__6745, cljs.core.first.call(null, s__6746));
      var G__6749 = cljs.core.next.call(null, s__6746);
      ret__6745 = G__6748;
      s__6746 = G__6749;
      continue
    }else {
      return cljs.core.seq.call(null, ret__6745)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____6751 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____6751)) {
        return or__3548__auto____6751
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__6752 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__6752 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__6752 + 1)
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
    var or__3548__auto____6759 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____6759)) {
      return or__3548__auto____6759
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__6760 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__6760 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__6760)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__6768 = cljs.core.ObjMap.fromObject([], {});
  var ks__6769 = cljs.core.seq.call(null, keys);
  var vs__6770 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____6771 = ks__6769;
      if(cljs.core.truth_(and__3546__auto____6771)) {
        return vs__6770
      }else {
        return and__3546__auto____6771
      }
    }())) {
      var G__6774 = cljs.core.assoc.call(null, map__6768, cljs.core.first.call(null, ks__6769), cljs.core.first.call(null, vs__6770));
      var G__6775 = cljs.core.next.call(null, ks__6769);
      var G__6776 = cljs.core.next.call(null, vs__6770);
      map__6768 = G__6774;
      ks__6769 = G__6775;
      vs__6770 = G__6776;
      continue
    }else {
      return map__6768
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__6779 = function(k, x) {
    return x
  };
  var max_key__6780 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__6781 = function() {
    var G__6783__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__6766_SHARP_, p2__6767_SHARP_) {
        return max_key.call(null, k, p1__6766_SHARP_, p2__6767_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__6783 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6783__delegate.call(this, k, x, y, more)
    };
    G__6783.cljs$lang$maxFixedArity = 3;
    G__6783.cljs$lang$applyTo = function(arglist__6784) {
      var k = cljs.core.first(arglist__6784);
      var x = cljs.core.first(cljs.core.next(arglist__6784));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6784)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6784)));
      return G__6783__delegate.call(this, k, x, y, more)
    };
    return G__6783
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__6779.call(this, k, x);
      case 3:
        return max_key__6780.call(this, k, x, y);
      default:
        return max_key__6781.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__6781.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__6788 = function(k, x) {
    return x
  };
  var min_key__6789 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__6790 = function() {
    var G__6793__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__6777_SHARP_, p2__6778_SHARP_) {
        return min_key.call(null, k, p1__6777_SHARP_, p2__6778_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__6793 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6793__delegate.call(this, k, x, y, more)
    };
    G__6793.cljs$lang$maxFixedArity = 3;
    G__6793.cljs$lang$applyTo = function(arglist__6796) {
      var k = cljs.core.first(arglist__6796);
      var x = cljs.core.first(cljs.core.next(arglist__6796));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6796)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6796)));
      return G__6793__delegate.call(this, k, x, y, more)
    };
    return G__6793
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__6788.call(this, k, x);
      case 3:
        return min_key__6789.call(this, k, x, y);
      default:
        return min_key__6790.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__6790.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__6805 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__6806 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6800 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6800)) {
        var s__6801 = temp__3698__auto____6800;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__6801), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__6801)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__6805.call(this, n, step);
      case 3:
        return partition_all__6806.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6813 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6813)) {
      var s__6814 = temp__3698__auto____6813;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__6814)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__6814), take_while.call(null, pred, cljs.core.rest.call(null, s__6814)))
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
  var this__6819 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__6824 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__6848 = null;
  var G__6848__6849 = function(rng, f) {
    var this__6825 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__6848__6850 = function(rng, f, s) {
    var this__6826 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__6848 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__6848__6849.call(this, rng, f);
      case 3:
        return G__6848__6850.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6848
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__6827 = this;
  var comp__6828 = cljs.core.truth_(this__6827.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__6828.call(null, this__6827.start, this__6827.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__6829 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__6829.end - this__6829.start) / this__6829.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__6830 = this;
  return this__6830.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__6831 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__6831.meta, this__6831.start + this__6831.step, this__6831.end, this__6831.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__6832 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__6833 = this;
  return new cljs.core.Range(meta, this__6833.start, this__6833.end, this__6833.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__6839 = this;
  return this__6839.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__6856 = null;
  var G__6856__6857 = function(rng, n) {
    var this__6840 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__6840.start + n * this__6840.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____6841 = this__6840.start > this__6840.end;
        if(cljs.core.truth_(and__3546__auto____6841)) {
          return cljs.core._EQ_.call(null, this__6840.step, 0)
        }else {
          return and__3546__auto____6841
        }
      }())) {
        return this__6840.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__6856__6858 = function(rng, n, not_found) {
    var this__6842 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__6842.start + n * this__6842.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____6844 = this__6842.start > this__6842.end;
        if(cljs.core.truth_(and__3546__auto____6844)) {
          return cljs.core._EQ_.call(null, this__6842.step, 0)
        }else {
          return and__3546__auto____6844
        }
      }())) {
        return this__6842.start
      }else {
        return not_found
      }
    }
  };
  G__6856 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6856__6857.call(this, rng, n);
      case 3:
        return G__6856__6858.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6856
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__6846 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__6846.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__6861 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__6862 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__6863 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__6864 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__6861.call(this);
      case 1:
        return range__6862.call(this, start);
      case 2:
        return range__6863.call(this, start, end);
      case 3:
        return range__6864.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____6876 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6876)) {
      var s__6877 = temp__3698__auto____6876;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__6877), take_nth.call(null, n, cljs.core.drop.call(null, n, s__6877)))
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
    var temp__3698__auto____6886 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____6886)) {
      var s__6887 = temp__3698__auto____6886;
      var fst__6888 = cljs.core.first.call(null, s__6887);
      var fv__6889 = f.call(null, fst__6888);
      var run__6890 = cljs.core.cons.call(null, fst__6888, cljs.core.take_while.call(null, function(p1__6882_SHARP_) {
        return cljs.core._EQ_.call(null, fv__6889, f.call(null, p1__6882_SHARP_))
      }, cljs.core.next.call(null, s__6887)));
      return cljs.core.cons.call(null, run__6890, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__6890), s__6887))))
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
  var reductions__6919 = function(f, coll) {
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
  var reductions__6920 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____6909 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____6909)) {
        var s__6913 = temp__3698__auto____6909;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__6913)), cljs.core.rest.call(null, s__6913))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__6919.call(this, f, init);
      case 3:
        return reductions__6920.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__6952 = function(f) {
    return function() {
      var G__6957 = null;
      var G__6957__6958 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__6957__6959 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__6957__6960 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__6957__6961 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__6957__6962 = function() {
        var G__6965__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__6965 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__6965__delegate.call(this, x, y, z, args)
        };
        G__6965.cljs$lang$maxFixedArity = 3;
        G__6965.cljs$lang$applyTo = function(arglist__6966) {
          var x = cljs.core.first(arglist__6966);
          var y = cljs.core.first(cljs.core.next(arglist__6966));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6966)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6966)));
          return G__6965__delegate.call(this, x, y, z, args)
        };
        return G__6965
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
  var juxt__6953 = function(f, g) {
    return function() {
      var G__6967 = null;
      var G__6967__6968 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__6967__6969 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__6967__6970 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__6967__6971 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__6967__6972 = function() {
        var G__6975__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__6975 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__6975__delegate.call(this, x, y, z, args)
        };
        G__6975.cljs$lang$maxFixedArity = 3;
        G__6975.cljs$lang$applyTo = function(arglist__6979) {
          var x = cljs.core.first(arglist__6979);
          var y = cljs.core.first(cljs.core.next(arglist__6979));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6979)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6979)));
          return G__6975__delegate.call(this, x, y, z, args)
        };
        return G__6975
      }();
      G__6967 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__6967__6968.call(this);
          case 1:
            return G__6967__6969.call(this, x);
          case 2:
            return G__6967__6970.call(this, x, y);
          case 3:
            return G__6967__6971.call(this, x, y, z);
          default:
            return G__6967__6972.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__6967.cljs$lang$maxFixedArity = 3;
      G__6967.cljs$lang$applyTo = G__6967__6972.cljs$lang$applyTo;
      return G__6967
    }()
  };
  var juxt__6954 = function(f, g, h) {
    return function() {
      var G__6983 = null;
      var G__6983__6984 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__6983__6985 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__6983__6986 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__6983__6987 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__6983__6988 = function() {
        var G__6990__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__6990 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__6990__delegate.call(this, x, y, z, args)
        };
        G__6990.cljs$lang$maxFixedArity = 3;
        G__6990.cljs$lang$applyTo = function(arglist__6994) {
          var x = cljs.core.first(arglist__6994);
          var y = cljs.core.first(cljs.core.next(arglist__6994));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6994)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6994)));
          return G__6990__delegate.call(this, x, y, z, args)
        };
        return G__6990
      }();
      G__6983 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__6983__6984.call(this);
          case 1:
            return G__6983__6985.call(this, x);
          case 2:
            return G__6983__6986.call(this, x, y);
          case 3:
            return G__6983__6987.call(this, x, y, z);
          default:
            return G__6983__6988.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__6983.cljs$lang$maxFixedArity = 3;
      G__6983.cljs$lang$applyTo = G__6983__6988.cljs$lang$applyTo;
      return G__6983
    }()
  };
  var juxt__6955 = function() {
    var G__6995__delegate = function(f, g, h, fs) {
      var fs__6941 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__6996 = null;
        var G__6996__6997 = function() {
          return cljs.core.reduce.call(null, function(p1__6892_SHARP_, p2__6893_SHARP_) {
            return cljs.core.conj.call(null, p1__6892_SHARP_, p2__6893_SHARP_.call(null))
          }, cljs.core.Vector.fromArray([]), fs__6941)
        };
        var G__6996__6998 = function(x) {
          return cljs.core.reduce.call(null, function(p1__6894_SHARP_, p2__6895_SHARP_) {
            return cljs.core.conj.call(null, p1__6894_SHARP_, p2__6895_SHARP_.call(null, x))
          }, cljs.core.Vector.fromArray([]), fs__6941)
        };
        var G__6996__6999 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__6896_SHARP_, p2__6897_SHARP_) {
            return cljs.core.conj.call(null, p1__6896_SHARP_, p2__6897_SHARP_.call(null, x, y))
          }, cljs.core.Vector.fromArray([]), fs__6941)
        };
        var G__6996__7000 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__6898_SHARP_, p2__6899_SHARP_) {
            return cljs.core.conj.call(null, p1__6898_SHARP_, p2__6899_SHARP_.call(null, x, y, z))
          }, cljs.core.Vector.fromArray([]), fs__6941)
        };
        var G__6996__7001 = function() {
          var G__7004__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__6900_SHARP_, p2__6901_SHARP_) {
              return cljs.core.conj.call(null, p1__6900_SHARP_, cljs.core.apply.call(null, p2__6901_SHARP_, x, y, z, args))
            }, cljs.core.Vector.fromArray([]), fs__6941)
          };
          var G__7004 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__7004__delegate.call(this, x, y, z, args)
          };
          G__7004.cljs$lang$maxFixedArity = 3;
          G__7004.cljs$lang$applyTo = function(arglist__7005) {
            var x = cljs.core.first(arglist__7005);
            var y = cljs.core.first(cljs.core.next(arglist__7005));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7005)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7005)));
            return G__7004__delegate.call(this, x, y, z, args)
          };
          return G__7004
        }();
        G__6996 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__6996__6997.call(this);
            case 1:
              return G__6996__6998.call(this, x);
            case 2:
              return G__6996__6999.call(this, x, y);
            case 3:
              return G__6996__7000.call(this, x, y, z);
            default:
              return G__6996__7001.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__6996.cljs$lang$maxFixedArity = 3;
        G__6996.cljs$lang$applyTo = G__6996__7001.cljs$lang$applyTo;
        return G__6996
      }()
    };
    var G__6995 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6995__delegate.call(this, f, g, h, fs)
    };
    G__6995.cljs$lang$maxFixedArity = 3;
    G__6995.cljs$lang$applyTo = function(arglist__7007) {
      var f = cljs.core.first(arglist__7007);
      var g = cljs.core.first(cljs.core.next(arglist__7007));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7007)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7007)));
      return G__6995__delegate.call(this, f, g, h, fs)
    };
    return G__6995
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__6952.call(this, f);
      case 2:
        return juxt__6953.call(this, f, g);
      case 3:
        return juxt__6954.call(this, f, g, h);
      default:
        return juxt__6955.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__6955.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__7013 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__7016 = cljs.core.next.call(null, coll);
        coll = G__7016;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__7014 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____7008 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____7008)) {
          return n > 0
        }else {
          return and__3546__auto____7008
        }
      }())) {
        var G__7017 = n - 1;
        var G__7018 = cljs.core.next.call(null, coll);
        n = G__7017;
        coll = G__7018;
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
        return dorun__7013.call(this, n);
      case 2:
        return dorun__7014.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__7025 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__7026 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__7025.call(this, n);
      case 2:
        return doall__7026.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__7028 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__7028), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__7028), 1))) {
      return cljs.core.first.call(null, matches__7028)
    }else {
      return cljs.core.vec.call(null, matches__7028)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__7029 = re.exec(s);
  if(cljs.core.truth_(matches__7029 === null)) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__7029), 1))) {
      return cljs.core.first.call(null, matches__7029)
    }else {
      return cljs.core.vec.call(null, matches__7029)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__7031 = cljs.core.re_find.call(null, re, s);
  var match_idx__7033 = s.search(re);
  var match_str__7035 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__7031)) ? cljs.core.first.call(null, match_data__7031) : match_data__7031;
  var post_match__7037 = cljs.core.subs.call(null, s, match_idx__7033 + cljs.core.count.call(null, match_str__7035));
  if(cljs.core.truth_(match_data__7031)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__7031, re_seq.call(null, re, post_match__7037))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__7043__7044 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___7045 = cljs.core.nth.call(null, vec__7043__7044, 0, null);
  var flags__7046 = cljs.core.nth.call(null, vec__7043__7044, 1, null);
  var pattern__7047 = cljs.core.nth.call(null, vec__7043__7044, 2, null);
  return new RegExp(pattern__7047, flags__7046)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.Vector.fromArray([sep]), cljs.core.map.call(null, function(p1__7042_SHARP_) {
    return print_one.call(null, p1__7042_SHARP_, opts)
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
          var and__3546__auto____7056 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____7056)) {
            var and__3546__auto____7064 = function() {
              var x__450__auto____7059 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____7060 = x__450__auto____7059;
                if(cljs.core.truth_(and__3546__auto____7060)) {
                  var and__3546__auto____7062 = x__450__auto____7059.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____7062)) {
                    return cljs.core.not.call(null, x__450__auto____7059.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____7062
                  }
                }else {
                  return and__3546__auto____7060
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__450__auto____7059)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____7064)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____7064
            }
          }else {
            return and__3546__auto____7056
          }
        }()) ? cljs.core.concat.call(null, cljs.core.Vector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.Vector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__450__auto____7067 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____7068 = x__450__auto____7067;
            if(cljs.core.truth_(and__3546__auto____7068)) {
              var and__3546__auto____7069 = x__450__auto____7067.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____7069)) {
                return cljs.core.not.call(null, x__450__auto____7067.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____7069
              }
            }else {
              return and__3546__auto____7068
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__450__auto____7067)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__7083 = cljs.core.first.call(null, objs);
  var sb__7085 = new goog.string.StringBuffer;
  var G__7087__7088 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__7087__7088)) {
    var obj__7089 = cljs.core.first.call(null, G__7087__7088);
    var G__7087__7090 = G__7087__7088;
    while(true) {
      if(cljs.core.truth_(obj__7089 === first_obj__7083)) {
      }else {
        sb__7085.append(" ")
      }
      var G__7092__7093 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__7089, opts));
      if(cljs.core.truth_(G__7092__7093)) {
        var string__7095 = cljs.core.first.call(null, G__7092__7093);
        var G__7092__7096 = G__7092__7093;
        while(true) {
          sb__7085.append(string__7095);
          var temp__3698__auto____7097 = cljs.core.next.call(null, G__7092__7096);
          if(cljs.core.truth_(temp__3698__auto____7097)) {
            var G__7092__7098 = temp__3698__auto____7097;
            var G__7105 = cljs.core.first.call(null, G__7092__7098);
            var G__7106 = G__7092__7098;
            string__7095 = G__7105;
            G__7092__7096 = G__7106;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____7099 = cljs.core.next.call(null, G__7087__7090);
      if(cljs.core.truth_(temp__3698__auto____7099)) {
        var G__7087__7100 = temp__3698__auto____7099;
        var G__7107 = cljs.core.first.call(null, G__7087__7100);
        var G__7108 = G__7087__7100;
        obj__7089 = G__7107;
        G__7087__7090 = G__7108;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__7085)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__7109 = cljs.core.first.call(null, objs);
  var G__7110__7111 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__7110__7111)) {
    var obj__7112 = cljs.core.first.call(null, G__7110__7111);
    var G__7110__7113 = G__7110__7111;
    while(true) {
      if(cljs.core.truth_(obj__7112 === first_obj__7109)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__7114__7115 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__7112, opts));
      if(cljs.core.truth_(G__7114__7115)) {
        var string__7116 = cljs.core.first.call(null, G__7114__7115);
        var G__7114__7117 = G__7114__7115;
        while(true) {
          cljs.core.string_print.call(null, string__7116);
          var temp__3698__auto____7118 = cljs.core.next.call(null, G__7114__7117);
          if(cljs.core.truth_(temp__3698__auto____7118)) {
            var G__7114__7119 = temp__3698__auto____7118;
            var G__7124 = cljs.core.first.call(null, G__7114__7119);
            var G__7125 = G__7114__7119;
            string__7116 = G__7124;
            G__7114__7117 = G__7125;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____7120 = cljs.core.next.call(null, G__7110__7113);
      if(cljs.core.truth_(temp__3698__auto____7120)) {
        var G__7110__7122 = temp__3698__auto____7120;
        var G__7126 = cljs.core.first.call(null, G__7110__7122);
        var G__7127 = G__7110__7122;
        obj__7112 = G__7126;
        G__7110__7113 = G__7127;
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
  pr_str.cljs$lang$applyTo = function(arglist__7130) {
    var objs = cljs.core.seq(arglist__7130);
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
  pr.cljs$lang$applyTo = function(arglist__7132) {
    var objs = cljs.core.seq(arglist__7132);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__7134) {
    var objs = cljs.core.seq(arglist__7134);
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
  println.cljs$lang$applyTo = function(arglist__7135) {
    var objs = cljs.core.seq(arglist__7135);
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
  prn.cljs$lang$applyTo = function(arglist__7138) {
    var objs = cljs.core.seq(arglist__7138);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__7141 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__7141, "{", ", ", "}", opts, coll)
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
      var temp__3698__auto____7142 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____7142)) {
        var nspc__7143 = temp__3698__auto____7142;
        return cljs.core.str.call(null, nspc__7143, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____7144 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____7144)) {
          var nspc__7145 = temp__3698__auto____7144;
          return cljs.core.str.call(null, nspc__7145, "/")
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
  var pr_pair__7147 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__7147, "{", ", ", "}", opts, coll)
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
  var this__7169 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__7171 = this;
  var G__7172__7174 = cljs.core.seq.call(null, this__7171.watches);
  if(cljs.core.truth_(G__7172__7174)) {
    var G__7176__7179 = cljs.core.first.call(null, G__7172__7174);
    var vec__7178__7180 = G__7176__7179;
    var key__7181 = cljs.core.nth.call(null, vec__7178__7180, 0, null);
    var f__7182 = cljs.core.nth.call(null, vec__7178__7180, 1, null);
    var G__7172__7183 = G__7172__7174;
    var G__7176__7185 = G__7176__7179;
    var G__7172__7186 = G__7172__7183;
    while(true) {
      var vec__7187__7188 = G__7176__7185;
      var key__7190 = cljs.core.nth.call(null, vec__7187__7188, 0, null);
      var f__7191 = cljs.core.nth.call(null, vec__7187__7188, 1, null);
      var G__7172__7192 = G__7172__7186;
      f__7191.call(null, key__7190, this$, oldval, newval);
      var temp__3698__auto____7194 = cljs.core.next.call(null, G__7172__7192);
      if(cljs.core.truth_(temp__3698__auto____7194)) {
        var G__7172__7195 = temp__3698__auto____7194;
        var G__7204 = cljs.core.first.call(null, G__7172__7195);
        var G__7205 = G__7172__7195;
        G__7176__7185 = G__7204;
        G__7172__7186 = G__7205;
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
  var this__7196 = this;
  return this$.watches = cljs.core.assoc.call(null, this__7196.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__7197 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__7197.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__7198 = this;
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__7198.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__7199 = this;
  return this__7199.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__7202 = this;
  return this__7202.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__7203 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__7219 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__7221 = function() {
    var G__7224__delegate = function(x, p__7206) {
      var map__7209__7211 = p__7206;
      var map__7209__7213 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__7209__7211)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__7209__7211) : map__7209__7211;
      var validator__7214 = cljs.core.get.call(null, map__7209__7213, "\ufdd0'validator");
      var meta__7217 = cljs.core.get.call(null, map__7209__7213, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__7217, validator__7214, null)
    };
    var G__7224 = function(x, var_args) {
      var p__7206 = null;
      if(goog.isDef(var_args)) {
        p__7206 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7224__delegate.call(this, x, p__7206)
    };
    G__7224.cljs$lang$maxFixedArity = 1;
    G__7224.cljs$lang$applyTo = function(arglist__7227) {
      var x = cljs.core.first(arglist__7227);
      var p__7206 = cljs.core.rest(arglist__7227);
      return G__7224__delegate.call(this, x, p__7206)
    };
    return G__7224
  }();
  atom = function(x, var_args) {
    var p__7206 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__7219.call(this, x);
      default:
        return atom__7221.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__7221.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____7228 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____7228)) {
    var validate__7231 = temp__3698__auto____7228;
    if(cljs.core.truth_(validate__7231.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3073)))));
    }
  }else {
  }
  var old_value__7232 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__7232, new_value);
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
  var swap_BANG___7238 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___7240 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___7242 = function() {
    var G__7246__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__7246 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__7246__delegate.call(this, a, f, x, y, z, more)
    };
    G__7246.cljs$lang$maxFixedArity = 5;
    G__7246.cljs$lang$applyTo = function(arglist__7248) {
      var a = cljs.core.first(arglist__7248);
      var f = cljs.core.first(cljs.core.next(arglist__7248));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7248)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7248))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7248)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7248)))));
      return G__7246__delegate.call(this, a, f, x, y, z, more)
    };
    return G__7246
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___7235.call(this, a, f);
      case 3:
        return swap_BANG___7236.call(this, a, f, x);
      case 4:
        return swap_BANG___7238.call(this, a, f, x, y);
      case 5:
        return swap_BANG___7240.call(this, a, f, x, y, z);
      default:
        return swap_BANG___7242.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___7242.cljs$lang$applyTo;
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__7250) {
    var iref = cljs.core.first(arglist__7250);
    var f = cljs.core.first(cljs.core.next(arglist__7250));
    var args = cljs.core.rest(cljs.core.next(arglist__7250));
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
  var gensym__7252 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__7253 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.gensym_counter === null)) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__7252.call(this);
      case 1:
        return gensym__7253.call(this, prefix_string)
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
  var this__7258 = this;
  return cljs.core.not.call(null, cljs.core.deref.call(null, this__7258.state) === null)
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__7259 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__7259.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__7259.state, this__7259.f)
  }
  return cljs.core.deref.call(null, this__7259.state)
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
  delay.cljs$lang$applyTo = function(arglist__7262) {
    var body = cljs.core.seq(arglist__7262);
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
    var f__7274 = function thisfn(x) {
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
                var iter__514__auto____7273 = function iter__7269(s__7270) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__7270__7271 = s__7270;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__7270__7271))) {
                        var k__7272 = cljs.core.first.call(null, s__7270__7271);
                        return cljs.core.cons.call(null, cljs.core.Vector.fromArray([keyfn__7268.call(null, k__7272), thisfn.call(null, x[k__7272])]), iter__7269.call(null, cljs.core.rest.call(null, s__7270__7271)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__514__auto____7273.call(null, cljs.core.js_keys.call(null, x))
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
    return f__7274.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__7286) {
    var x = cljs.core.first(arglist__7286);
    var options = cljs.core.rest(arglist__7286);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__7287 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__7291__delegate = function(args) {
      var temp__3695__auto____7288 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__7287), args);
      if(cljs.core.truth_(temp__3695__auto____7288)) {
        var v__7289 = temp__3695__auto____7288;
        return v__7289
      }else {
        var ret__7290 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__7287, cljs.core.assoc, args, ret__7290);
        return ret__7290
      }
    };
    var G__7291 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__7291__delegate.call(this, args)
    };
    G__7291.cljs$lang$maxFixedArity = 0;
    G__7291.cljs$lang$applyTo = function(arglist__7292) {
      var args = cljs.core.seq(arglist__7292);
      return G__7291__delegate.call(this, args)
    };
    return G__7291
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__7299 = function(f) {
    while(true) {
      var ret__7294 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__7294))) {
        var G__7302 = ret__7294;
        f = G__7302;
        continue
      }else {
        return ret__7294
      }
      break
    }
  };
  var trampoline__7300 = function() {
    var G__7303__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__7303 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7303__delegate.call(this, f, args)
    };
    G__7303.cljs$lang$maxFixedArity = 1;
    G__7303.cljs$lang$applyTo = function(arglist__7305) {
      var f = cljs.core.first(arglist__7305);
      var args = cljs.core.rest(arglist__7305);
      return G__7303__delegate.call(this, f, args)
    };
    return G__7303
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__7299.call(this, f);
      default:
        return trampoline__7300.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__7300.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__7308 = function() {
    return rand.call(null, 1)
  };
  var rand__7309 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__7308.call(this);
      case 1:
        return rand__7309.call(this, n)
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
    var k__7317 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__7317, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__7317, cljs.core.Vector.fromArray([])), x))
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
    var or__3548__auto____7322 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____7322)) {
      return or__3548__auto____7322
    }else {
      var or__3548__auto____7323 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____7323)) {
        return or__3548__auto____7323
      }else {
        var and__3546__auto____7324 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____7324)) {
          var and__3546__auto____7325 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____7325)) {
            var and__3546__auto____7326 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____7326)) {
              var ret__7327 = true;
              var i__7328 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____7329 = cljs.core.not.call(null, ret__7327);
                  if(cljs.core.truth_(or__3548__auto____7329)) {
                    return or__3548__auto____7329
                  }else {
                    return cljs.core._EQ_.call(null, i__7328, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__7327
                }else {
                  var G__7341 = isa_QMARK_.call(null, h, child.call(null, i__7328), parent.call(null, i__7328));
                  var G__7342 = i__7328 + 1;
                  ret__7327 = G__7341;
                  i__7328 = G__7342;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____7326
            }
          }else {
            return and__3546__auto____7325
          }
        }else {
          return and__3546__auto____7324
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
  var parents__7346 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__7347 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__7346.call(this, h);
      case 2:
        return parents__7347.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__7351 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__7352 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__7351.call(this, h);
      case 2:
        return ancestors__7352.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__7357 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__7358 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__7357.call(this, h);
      case 2:
        return descendants__7358.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__7380 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3365)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__7381 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3369)))));
    }
    var tp__7367 = "\ufdd0'parents".call(null, h);
    var td__7370 = "\ufdd0'descendants".call(null, h);
    var ta__7371 = "\ufdd0'ancestors".call(null, h);
    var tf__7372 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____7376 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__7367.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__7371.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__7371.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__7367, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__7372.call(null, "\ufdd0'ancestors".call(null, h), tag, td__7370, parent, ta__7371), "\ufdd0'descendants":tf__7372.call(null, "\ufdd0'descendants".call(null, h), parent, ta__7371, tag, td__7370)})
    }();
    if(cljs.core.truth_(or__3548__auto____7376)) {
      return or__3548__auto____7376
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__7380.call(this, h, tag);
      case 3:
        return derive__7381.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__7392 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__7393 = function(h, tag, parent) {
    var parentMap__7388 = "\ufdd0'parents".call(null, h);
    var childsParents__7389 = cljs.core.truth_(parentMap__7388.call(null, tag)) ? cljs.core.disj.call(null, parentMap__7388.call(null, tag), parent) : cljs.core.set([]);
    var newParents__7390 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__7389)) ? cljs.core.assoc.call(null, parentMap__7388, tag, childsParents__7389) : cljs.core.dissoc.call(null, parentMap__7388, tag);
    var deriv_seq__7391 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__7363_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__7363_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__7363_SHARP_), cljs.core.second.call(null, p1__7363_SHARP_)))
    }, cljs.core.seq.call(null, newParents__7390)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__7388.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__7364_SHARP_, p2__7365_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__7364_SHARP_, p2__7365_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__7391))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__7392.call(this, h, tag);
      case 3:
        return underive__7393.call(this, h, tag, parent)
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
  var xprefs__7402 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____7404 = cljs.core.truth_(function() {
    var and__3546__auto____7403 = xprefs__7402;
    if(cljs.core.truth_(and__3546__auto____7403)) {
      return xprefs__7402.call(null, y)
    }else {
      return and__3546__auto____7403
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____7404)) {
    return or__3548__auto____7404
  }else {
    var or__3548__auto____7406 = function() {
      var ps__7405 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__7405) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__7405), prefer_table))) {
          }else {
          }
          var G__7413 = cljs.core.rest.call(null, ps__7405);
          ps__7405 = G__7413;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____7406)) {
      return or__3548__auto____7406
    }else {
      var or__3548__auto____7408 = function() {
        var ps__7407 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__7407) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__7407), y, prefer_table))) {
            }else {
            }
            var G__7416 = cljs.core.rest.call(null, ps__7407);
            ps__7407 = G__7416;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____7408)) {
        return or__3548__auto____7408
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____7418 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____7418)) {
    return or__3548__auto____7418
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__7430 = cljs.core.reduce.call(null, function(be, p__7420) {
    var vec__7422__7423 = p__7420;
    var k__7424 = cljs.core.nth.call(null, vec__7422__7423, 0, null);
    var ___7425 = cljs.core.nth.call(null, vec__7422__7423, 1, null);
    var e__7426 = vec__7422__7423;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__7424))) {
      var be2__7428 = cljs.core.truth_(function() {
        var or__3548__auto____7427 = be === null;
        if(cljs.core.truth_(or__3548__auto____7427)) {
          return or__3548__auto____7427
        }else {
          return cljs.core.dominates.call(null, k__7424, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__7426 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__7428), k__7424, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__7424, " and ", cljs.core.first.call(null, be2__7428), ", and neither is preferred"));
      }
      return be2__7428
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__7430)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__7430));
      return cljs.core.second.call(null, best_entry__7430)
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
    var and__3546__auto____7440 = mf;
    if(cljs.core.truth_(and__3546__auto____7440)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____7440
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____7441 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7441)) {
        return or__3548__auto____7441
      }else {
        var or__3548__auto____7442 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____7442)) {
          return or__3548__auto____7442
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7443 = mf;
    if(cljs.core.truth_(and__3546__auto____7443)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____7443
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____7444 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7444)) {
        return or__3548__auto____7444
      }else {
        var or__3548__auto____7445 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____7445)) {
          return or__3548__auto____7445
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7447 = mf;
    if(cljs.core.truth_(and__3546__auto____7447)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____7447
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____7450 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7450)) {
        return or__3548__auto____7450
      }else {
        var or__3548__auto____7451 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____7451)) {
          return or__3548__auto____7451
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7453 = mf;
    if(cljs.core.truth_(and__3546__auto____7453)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____7453
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____7456 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7456)) {
        return or__3548__auto____7456
      }else {
        var or__3548__auto____7457 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____7457)) {
          return or__3548__auto____7457
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7459 = mf;
    if(cljs.core.truth_(and__3546__auto____7459)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____7459
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____7462 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7462)) {
        return or__3548__auto____7462
      }else {
        var or__3548__auto____7463 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____7463)) {
          return or__3548__auto____7463
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7465 = mf;
    if(cljs.core.truth_(and__3546__auto____7465)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____7465
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____7468 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7468)) {
        return or__3548__auto____7468
      }else {
        var or__3548__auto____7469 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____7469)) {
          return or__3548__auto____7469
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7471 = mf;
    if(cljs.core.truth_(and__3546__auto____7471)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____7471
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____7474 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7474)) {
        return or__3548__auto____7474
      }else {
        var or__3548__auto____7475 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____7475)) {
          return or__3548__auto____7475
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7479 = mf;
    if(cljs.core.truth_(and__3546__auto____7479)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____7479
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____7480 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____7480)) {
        return or__3548__auto____7480
      }else {
        var or__3548__auto____7481 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____7481)) {
          return or__3548__auto____7481
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__7488 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__7489 = cljs.core._get_method.call(null, mf, dispatch_val__7488);
  if(cljs.core.truth_(target_fn__7489)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__7488));
  }
  return cljs.core.apply.call(null, target_fn__7489, args)
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
  var this__7492 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__7493 = this;
  cljs.core.swap_BANG_.call(null, this__7493.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__7493.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__7493.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__7493.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__7494 = this;
  cljs.core.swap_BANG_.call(null, this__7494.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__7494.method_cache, this__7494.method_table, this__7494.cached_hierarchy, this__7494.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__7495 = this;
  cljs.core.swap_BANG_.call(null, this__7495.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__7495.method_cache, this__7495.method_table, this__7495.cached_hierarchy, this__7495.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__7496 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__7496.cached_hierarchy), cljs.core.deref.call(null, this__7496.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__7496.method_cache, this__7496.method_table, this__7496.cached_hierarchy, this__7496.hierarchy)
  }
  var temp__3695__auto____7498 = cljs.core.deref.call(null, this__7496.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____7498)) {
    var target_fn__7500 = temp__3695__auto____7498;
    return target_fn__7500
  }else {
    var temp__3695__auto____7501 = cljs.core.find_and_cache_best_method.call(null, this__7496.name, dispatch_val, this__7496.hierarchy, this__7496.method_table, this__7496.prefer_table, this__7496.method_cache, this__7496.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____7501)) {
      var target_fn__7502 = temp__3695__auto____7501;
      return target_fn__7502
    }else {
      return cljs.core.deref.call(null, this__7496.method_table).call(null, this__7496.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__7503 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__7503.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__7503.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__7503.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__7503.method_cache, this__7503.method_table, this__7503.cached_hierarchy, this__7503.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__7506 = this;
  return cljs.core.deref.call(null, this__7506.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__7507 = this;
  return cljs.core.deref.call(null, this__7507.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__7509 = this;
  return cljs.core.do_dispatch.call(null, mf, this__7509.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__7518__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__7518 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__7518__delegate.call(this, _, args)
  };
  G__7518.cljs$lang$maxFixedArity = 1;
  G__7518.cljs$lang$applyTo = function(arglist__7519) {
    var _ = cljs.core.first(arglist__7519);
    var args = cljs.core.rest(arglist__7519);
    return G__7518__delegate.call(this, _, args)
  };
  return G__7518
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
goog.provide("cljs.reader");
goog.require("cljs.core");
goog.require("goog.string");
cljs.reader.PushbackReader = {};
cljs.reader.read_char = function read_char(reader) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7523 = reader;
    if(cljs.core.truth_(and__3546__auto____7523)) {
      return reader.cljs$reader$PushbackReader$read_char
    }else {
      return and__3546__auto____7523
    }
  }())) {
    return reader.cljs$reader$PushbackReader$read_char(reader)
  }else {
    return function() {
      var or__3548__auto____7524 = cljs.reader.read_char[goog.typeOf.call(null, reader)];
      if(cljs.core.truth_(or__3548__auto____7524)) {
        return or__3548__auto____7524
      }else {
        var or__3548__auto____7525 = cljs.reader.read_char["_"];
        if(cljs.core.truth_(or__3548__auto____7525)) {
          return or__3548__auto____7525
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.read-char", reader);
        }
      }
    }().call(null, reader)
  }
};
cljs.reader.unread = function unread(reader, ch) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7526 = reader;
    if(cljs.core.truth_(and__3546__auto____7526)) {
      return reader.cljs$reader$PushbackReader$unread
    }else {
      return and__3546__auto____7526
    }
  }())) {
    return reader.cljs$reader$PushbackReader$unread(reader, ch)
  }else {
    return function() {
      var or__3548__auto____7527 = cljs.reader.unread[goog.typeOf.call(null, reader)];
      if(cljs.core.truth_(or__3548__auto____7527)) {
        return or__3548__auto____7527
      }else {
        var or__3548__auto____7528 = cljs.reader.unread["_"];
        if(cljs.core.truth_(or__3548__auto____7528)) {
          return or__3548__auto____7528
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
cljs.reader.StringPushbackReader.cljs$core$IPrintable$_pr_seq = function(this__365__auto__) {
  return cljs.core.list.call(null, "cljs.reader.StringPushbackReader")
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$ = true;
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$read_char = function(reader) {
  var this__7529 = this;
  if(cljs.core.truth_(cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, this__7529.buffer_atom)))) {
    var idx__7530 = cljs.core.deref.call(null, this__7529.index_atom);
    cljs.core.swap_BANG_.call(null, this__7529.index_atom, cljs.core.inc);
    return cljs.core.nth.call(null, this__7529.s, idx__7530)
  }else {
    var buf__7531 = cljs.core.deref.call(null, this__7529.buffer_atom);
    cljs.core.swap_BANG_.call(null, this__7529.buffer_atom, cljs.core.rest);
    return cljs.core.first.call(null, buf__7531)
  }
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$unread = function(reader, ch) {
  var this__7532 = this;
  return cljs.core.swap_BANG_.call(null, this__7532.buffer_atom, function(p1__7522_SHARP_) {
    return cljs.core.cons.call(null, ch, p1__7522_SHARP_)
  })
};
cljs.reader.StringPushbackReader;
cljs.reader.push_back_reader = function push_back_reader(s) {
  return new cljs.reader.StringPushbackReader(s, cljs.core.atom.call(null, 0), cljs.core.atom.call(null, null))
};
cljs.reader.whitespace_QMARK_ = function whitespace_QMARK_(ch) {
  var or__3548__auto____7533 = goog.string.isBreakingWhitespace.call(null, ch);
  if(cljs.core.truth_(or__3548__auto____7533)) {
    return or__3548__auto____7533
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
  var or__3548__auto____7534 = cljs.reader.numeric_QMARK_.call(null, initch);
  if(cljs.core.truth_(or__3548__auto____7534)) {
    return or__3548__auto____7534
  }else {
    var and__3546__auto____7536 = function() {
      var or__3548__auto____7535 = cljs.core._EQ_.call(null, "+", initch);
      if(cljs.core.truth_(or__3548__auto____7535)) {
        return or__3548__auto____7535
      }else {
        return cljs.core._EQ_.call(null, "-", initch)
      }
    }();
    if(cljs.core.truth_(and__3546__auto____7536)) {
      return cljs.reader.numeric_QMARK_.call(null, function() {
        var next_ch__7537 = cljs.reader.read_char.call(null, reader);
        cljs.reader.unread.call(null, reader, next_ch__7537);
        return next_ch__7537
      }())
    }else {
      return and__3546__auto____7536
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
  reader_error.cljs$lang$applyTo = function(arglist__7538) {
    var rdr = cljs.core.first(arglist__7538);
    var msg = cljs.core.rest(arglist__7538);
    return reader_error__delegate.call(this, rdr, msg)
  };
  return reader_error
}();
cljs.reader.macro_terminating_QMARK_ = function macro_terminating_QMARK_(ch) {
  var and__3546__auto____7539 = cljs.core.not_EQ_.call(null, ch, "#");
  if(cljs.core.truth_(and__3546__auto____7539)) {
    var and__3546__auto____7540 = cljs.core.not_EQ_.call(null, ch, "'");
    if(cljs.core.truth_(and__3546__auto____7540)) {
      var and__3546__auto____7541 = cljs.core.not_EQ_.call(null, ch, ":");
      if(cljs.core.truth_(and__3546__auto____7541)) {
        return cljs.core.contains_QMARK_.call(null, cljs.reader.macros, ch)
      }else {
        return and__3546__auto____7541
      }
    }else {
      return and__3546__auto____7540
    }
  }else {
    return and__3546__auto____7539
  }
};
cljs.reader.read_token = function read_token(rdr, initch) {
  var sb__7542 = new goog.string.StringBuffer(initch);
  var ch__7543 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3548__auto____7544 = ch__7543 === null;
      if(cljs.core.truth_(or__3548__auto____7544)) {
        return or__3548__auto____7544
      }else {
        var or__3548__auto____7545 = cljs.reader.whitespace_QMARK_.call(null, ch__7543);
        if(cljs.core.truth_(or__3548__auto____7545)) {
          return or__3548__auto____7545
        }else {
          return cljs.reader.macro_terminating_QMARK_.call(null, ch__7543)
        }
      }
    }())) {
      cljs.reader.unread.call(null, rdr, ch__7543);
      return sb__7542.toString()
    }else {
      var G__7546 = function() {
        sb__7542.append(ch__7543);
        return sb__7542
      }();
      var G__7547 = cljs.reader.read_char.call(null, rdr);
      sb__7542 = G__7546;
      ch__7543 = G__7547;
      continue
    }
    break
  }
};
cljs.reader.skip_line = function skip_line(reader, _) {
  while(true) {
    var ch__7548 = cljs.reader.read_char.call(null, reader);
    if(cljs.core.truth_(function() {
      var or__3548__auto____7549 = cljs.core._EQ_.call(null, ch__7548, "n");
      if(cljs.core.truth_(or__3548__auto____7549)) {
        return or__3548__auto____7549
      }else {
        var or__3548__auto____7550 = cljs.core._EQ_.call(null, ch__7548, "r");
        if(cljs.core.truth_(or__3548__auto____7550)) {
          return or__3548__auto____7550
        }else {
          return ch__7548 === null
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
  var groups__7551 = cljs.core.re_find.call(null, cljs.reader.int_pattern, s);
  var group3__7552 = cljs.core.nth.call(null, groups__7551, 2);
  if(cljs.core.truth_(cljs.core.not.call(null, function() {
    var or__3548__auto____7553 = void 0 === group3__7552;
    if(cljs.core.truth_(or__3548__auto____7553)) {
      return or__3548__auto____7553
    }else {
      return group3__7552.length < 1
    }
  }()))) {
    return 0
  }else {
    var negate__7555 = cljs.core.truth_(cljs.core._EQ_.call(null, "-", cljs.core.nth.call(null, groups__7551, 1))) ? -1 : 1;
    var vec__7554__7556 = cljs.core.truth_(cljs.core.nth.call(null, groups__7551, 3)) ? cljs.core.Vector.fromArray([cljs.core.nth.call(null, groups__7551, 3), 10]) : cljs.core.truth_(cljs.core.nth.call(null, groups__7551, 4)) ? cljs.core.Vector.fromArray([cljs.core.nth.call(null, groups__7551, 4), 16]) : cljs.core.truth_(cljs.core.nth.call(null, groups__7551, 5)) ? cljs.core.Vector.fromArray([cljs.core.nth.call(null, groups__7551, 5), 8]) : cljs.core.truth_(cljs.core.nth.call(null, groups__7551, 
    7)) ? cljs.core.Vector.fromArray([cljs.core.nth.call(null, groups__7551, 7), parseInt.call(null, cljs.core.nth.call(null, groups__7551, 7))]) : cljs.core.truth_("\ufdd0'default") ? cljs.core.Vector.fromArray([null, null]) : null;
    var n__7557 = cljs.core.nth.call(null, vec__7554__7556, 0, null);
    var radix__7558 = cljs.core.nth.call(null, vec__7554__7556, 1, null);
    if(cljs.core.truth_(n__7557 === null)) {
      return null
    }else {
      return negate__7555 * parseInt.call(null, n__7557, radix__7558)
    }
  }
};
cljs.reader.match_ratio = function match_ratio(s) {
  var groups__7559 = cljs.core.re_find.call(null, cljs.reader.ratio_pattern, s);
  var numinator__7560 = cljs.core.nth.call(null, groups__7559, 1);
  var denominator__7561 = cljs.core.nth.call(null, groups__7559, 2);
  return parseInt.call(null, numinator__7560) / parseInt.call(null, denominator__7561)
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
  var ch__7562 = cljs.reader.read_char.call(null, reader);
  var mapresult__7563 = cljs.core.get.call(null, cljs.reader.escape_char_map, ch__7562);
  if(cljs.core.truth_(mapresult__7563)) {
    return mapresult__7563
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____7564 = cljs.core._EQ_.call(null, "u", ch__7562);
      if(cljs.core.truth_(or__3548__auto____7564)) {
        return or__3548__auto____7564
      }else {
        return cljs.reader.numeric_QMARK_.call(null, ch__7562)
      }
    }())) {
      return cljs.reader.read_unicode_char.call(null, reader, ch__7562)
    }else {
      return cljs.reader.reader_error.call(null, reader, "Unsupported escape charater: \\", ch__7562)
    }
  }
};
cljs.reader.read_past = function read_past(pred, rdr) {
  var ch__7565 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(pred.call(null, ch__7565))) {
      var G__7566 = cljs.reader.read_char.call(null, rdr);
      ch__7565 = G__7566;
      continue
    }else {
      return ch__7565
    }
    break
  }
};
cljs.reader.read_delimited_list = function read_delimited_list(delim, rdr, recursive_QMARK_) {
  var a__7567 = cljs.core.Vector.fromArray([]);
  while(true) {
    var ch__7568 = cljs.reader.read_past.call(null, cljs.reader.whitespace_QMARK_, rdr);
    if(cljs.core.truth_(ch__7568)) {
    }else {
      cljs.reader.reader_error.call(null, rdr, "EOF")
    }
    if(cljs.core.truth_(cljs.core._EQ_.call(null, delim, ch__7568))) {
      return a__7567
    }else {
      var temp__3695__auto____7569 = cljs.core.get.call(null, cljs.reader.macros, ch__7568);
      if(cljs.core.truth_(temp__3695__auto____7569)) {
        var macrofn__7570 = temp__3695__auto____7569;
        var mret__7571 = macrofn__7570.call(null, rdr, ch__7568);
        var G__7573 = cljs.core.truth_(cljs.core._EQ_.call(null, mret__7571, rdr)) ? a__7567 : cljs.core.conj.call(null, a__7567, mret__7571);
        a__7567 = G__7573;
        continue
      }else {
        cljs.reader.unread.call(null, rdr, ch__7568);
        var o__7572 = cljs.reader.read.call(null, rdr, true, null, recursive_QMARK_);
        var G__7574 = cljs.core.truth_(cljs.core._EQ_.call(null, o__7572, rdr)) ? a__7567 : cljs.core.conj.call(null, a__7567, o__7572);
        a__7567 = G__7574;
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
  var ch__7575 = cljs.reader.read_char.call(null, rdr);
  var dm__7576 = cljs.core.get.call(null, cljs.reader.dispatch_macros, ch__7575);
  if(cljs.core.truth_(dm__7576)) {
    return dm__7576.call(null, rdr, _)
  }else {
    return cljs.reader.reader_error.call(null, rdr, "No dispatch macro for ", ch__7575)
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
  var l__7577 = cljs.reader.read_delimited_list.call(null, "}", rdr, true);
  if(cljs.core.truth_(cljs.core.odd_QMARK_.call(null, cljs.core.count.call(null, l__7577)))) {
    cljs.reader.reader_error.call(null, rdr, "Map literal must contain an even number of forms")
  }else {
  }
  return cljs.core.apply.call(null, cljs.core.hash_map, l__7577)
};
cljs.reader.read_number = function read_number(reader, initch) {
  var buffer__7578 = new goog.string.StringBuffer(initch);
  var ch__7579 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3548__auto____7580 = ch__7579 === null;
      if(cljs.core.truth_(or__3548__auto____7580)) {
        return or__3548__auto____7580
      }else {
        var or__3548__auto____7581 = cljs.reader.whitespace_QMARK_.call(null, ch__7579);
        if(cljs.core.truth_(or__3548__auto____7581)) {
          return or__3548__auto____7581
        }else {
          return cljs.core.contains_QMARK_.call(null, cljs.reader.macros, ch__7579)
        }
      }
    }())) {
      cljs.reader.unread.call(null, reader, ch__7579);
      var s__7582 = buffer__7578.toString();
      var or__3548__auto____7583 = cljs.reader.match_number.call(null, s__7582);
      if(cljs.core.truth_(or__3548__auto____7583)) {
        return or__3548__auto____7583
      }else {
        return cljs.reader.reader_error.call(null, reader, "Invalid number format [", s__7582, "]")
      }
    }else {
      var G__7584 = function() {
        buffer__7578.append(ch__7579);
        return buffer__7578
      }();
      var G__7585 = cljs.reader.read_char.call(null, reader);
      buffer__7578 = G__7584;
      ch__7579 = G__7585;
      continue
    }
    break
  }
};
cljs.reader.read_string = function read_string(reader, _) {
  var buffer__7586 = new goog.string.StringBuffer;
  var ch__7587 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(ch__7587 === null)) {
      return cljs.reader.reader_error.call(null, reader, "EOF while reading string")
    }else {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, "\\", ch__7587))) {
        var G__7588 = function() {
          buffer__7586.append(cljs.reader.escape_char.call(null, buffer__7586, reader));
          return buffer__7586
        }();
        var G__7589 = cljs.reader.read_char.call(null, reader);
        buffer__7586 = G__7588;
        ch__7587 = G__7589;
        continue
      }else {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, '"', ch__7587))) {
          return buffer__7586.toString()
        }else {
          if(cljs.core.truth_("\ufdd0'default")) {
            var G__7590 = function() {
              buffer__7586.append(ch__7587);
              return buffer__7586
            }();
            var G__7591 = cljs.reader.read_char.call(null, reader);
            buffer__7586 = G__7590;
            ch__7587 = G__7591;
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
  var token__7592 = cljs.reader.read_token.call(null, reader, initch);
  if(cljs.core.truth_(goog.string.contains.call(null, token__7592, "/"))) {
    return cljs.core.symbol.call(null, cljs.core.subs.call(null, token__7592, 0, token__7592.indexOf("/")), cljs.core.subs.call(null, token__7592, token__7592.indexOf("/") + 1, token__7592.length))
  }else {
    return cljs.core.get.call(null, cljs.reader.special_symbols, token__7592, cljs.core.symbol.call(null, token__7592))
  }
};
cljs.reader.read_keyword = function read_keyword(reader, initch) {
  var token__7594 = cljs.reader.read_token.call(null, reader, cljs.reader.read_char.call(null, reader));
  var vec__7593__7595 = cljs.core.re_matches.call(null, cljs.reader.symbol_pattern, token__7594);
  var token__7596 = cljs.core.nth.call(null, vec__7593__7595, 0, null);
  var ns__7597 = cljs.core.nth.call(null, vec__7593__7595, 1, null);
  var name__7598 = cljs.core.nth.call(null, vec__7593__7595, 2, null);
  if(cljs.core.truth_(function() {
    var or__3548__auto____7600 = function() {
      var and__3546__auto____7599 = cljs.core.not.call(null, void 0 === ns__7597);
      if(cljs.core.truth_(and__3546__auto____7599)) {
        return ns__7597.substring(ns__7597.length - 2, ns__7597.length) === ":/"
      }else {
        return and__3546__auto____7599
      }
    }();
    if(cljs.core.truth_(or__3548__auto____7600)) {
      return or__3548__auto____7600
    }else {
      var or__3548__auto____7601 = name__7598[name__7598.length - 1] === ":";
      if(cljs.core.truth_(or__3548__auto____7601)) {
        return or__3548__auto____7601
      }else {
        return cljs.core.not.call(null, token__7596.indexOf("::", 1) === -1)
      }
    }
  }())) {
    return cljs.reader.reader_error.call(null, reader, "Invalid token: ", token__7596)
  }else {
    if(cljs.core.truth_(cljs.reader.ns_QMARK_)) {
      return cljs.core.keyword.call(null, ns__7597.substring(0, ns__7597.indexOf("/")), name__7598)
    }else {
      return cljs.core.keyword.call(null, token__7596)
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
  var m__7602 = cljs.reader.desugar_meta.call(null, cljs.reader.read.call(null, rdr, true, null, true));
  if(cljs.core.truth_(cljs.core.map_QMARK_.call(null, m__7602))) {
  }else {
    cljs.reader.reader_error.call(null, rdr, "Metadata must be Symbol,Keyword,String or Map")
  }
  var o__7603 = cljs.reader.read.call(null, rdr, true, null, true);
  if(cljs.core.truth_(function() {
    var x__450__auto____7604 = o__7603;
    if(cljs.core.truth_(function() {
      var and__3546__auto____7605 = x__450__auto____7604;
      if(cljs.core.truth_(and__3546__auto____7605)) {
        var and__3546__auto____7606 = x__450__auto____7604.cljs$core$IWithMeta$;
        if(cljs.core.truth_(and__3546__auto____7606)) {
          return cljs.core.not.call(null, x__450__auto____7604.hasOwnProperty("cljs$core$IWithMeta$"))
        }else {
          return and__3546__auto____7606
        }
      }else {
        return and__3546__auto____7605
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, x__450__auto____7604)
    }
  }())) {
    return cljs.core.with_meta.call(null, o__7603, cljs.core.merge.call(null, cljs.core.meta.call(null, o__7603), m__7602))
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
    var ch__7607 = cljs.reader.read_char.call(null, reader);
    if(cljs.core.truth_(ch__7607 === null)) {
      if(cljs.core.truth_(eof_is_error)) {
        return cljs.reader.reader_error.call(null, reader, "EOF")
      }else {
        return sentinel
      }
    }else {
      if(cljs.core.truth_(cljs.reader.whitespace_QMARK_.call(null, ch__7607))) {
        var G__7609 = reader;
        var G__7610 = eof_is_error;
        var G__7611 = sentinel;
        var G__7612 = is_recursive;
        reader = G__7609;
        eof_is_error = G__7610;
        sentinel = G__7611;
        is_recursive = G__7612;
        continue
      }else {
        if(cljs.core.truth_(cljs.reader.comment_prefix_QMARK_.call(null, ch__7607))) {
          var G__7613 = cljs.reader.read_comment.call(null, reader, ch__7607);
          var G__7614 = eof_is_error;
          var G__7615 = sentinel;
          var G__7616 = is_recursive;
          reader = G__7613;
          eof_is_error = G__7614;
          sentinel = G__7615;
          is_recursive = G__7616;
          continue
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            var res__7608 = cljs.core.truth_(cljs.reader.macros.call(null, ch__7607)) ? cljs.reader.macros.call(null, ch__7607).call(null, reader, ch__7607) : cljs.core.truth_(cljs.reader.number_literal_QMARK_.call(null, reader, ch__7607)) ? cljs.reader.read_number.call(null, reader, ch__7607) : cljs.core.truth_("\ufdd0'else") ? cljs.reader.read_symbol.call(null, reader, ch__7607) : null;
            if(cljs.core.truth_(cljs.core._EQ_.call(null, res__7608, reader))) {
              var G__7617 = reader;
              var G__7618 = eof_is_error;
              var G__7619 = sentinel;
              var G__7620 = is_recursive;
              reader = G__7617;
              eof_is_error = G__7618;
              sentinel = G__7619;
              is_recursive = G__7620;
              continue
            }else {
              return res__7608
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
  var r__7621 = cljs.reader.push_back_reader.call(null, s);
  return cljs.reader.read.call(null, r__7621, true, null, false)
};
goog.provide("clojure.browser.event");
goog.require("cljs.core");
goog.require("goog.events");
goog.require("goog.events.EventTarget");
goog.require("goog.events.EventType");
clojure.browser.event.EventType = {};
clojure.browser.event.event_types = function event_types(this$) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7758 = this$;
    if(cljs.core.truth_(and__3546__auto____7758)) {
      return this$.clojure$browser$event$EventType$event_types
    }else {
      return and__3546__auto____7758
    }
  }())) {
    return this$.clojure$browser$event$EventType$event_types(this$)
  }else {
    return function() {
      var or__3548__auto____7759 = clojure.browser.event.event_types[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____7759)) {
        return or__3548__auto____7759
      }else {
        var or__3548__auto____7760 = clojure.browser.event.event_types["_"];
        if(cljs.core.truth_(or__3548__auto____7760)) {
          return or__3548__auto____7760
        }else {
          throw cljs.core.missing_protocol.call(null, "EventType.event-types", this$);
        }
      }
    }().call(null, this$)
  }
};
Element.prototype.clojure$browser$event$EventType$ = true;
Element.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__7761) {
    var vec__7762__7763 = p__7761;
    var k__7764 = cljs.core.nth.call(null, vec__7762__7763, 0, null);
    var v__7765 = cljs.core.nth.call(null, vec__7762__7763, 1, null);
    return cljs.core.Vector.fromArray([cljs.core.keyword.call(null, k__7764.toLowerCase()), v__7765])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.events.EventType))))
};
goog.events.EventTarget.prototype.clojure$browser$event$EventType$ = true;
goog.events.EventTarget.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__7766) {
    var vec__7767__7768 = p__7766;
    var k__7769 = cljs.core.nth.call(null, vec__7767__7768, 0, null);
    var v__7770 = cljs.core.nth.call(null, vec__7767__7768, 1, null);
    return cljs.core.Vector.fromArray([cljs.core.keyword.call(null, k__7769.toLowerCase()), v__7770])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.events.EventType))))
};
clojure.browser.event.listen = function() {
  var listen = null;
  var listen__7771 = function(src, type, fn) {
    return listen.call(null, src, type, fn, false)
  };
  var listen__7772 = function(src, type, fn, capture_QMARK_) {
    return goog.events.listen.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  listen = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return listen__7771.call(this, src, type, fn);
      case 4:
        return listen__7772.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen
}();
clojure.browser.event.listen_once = function() {
  var listen_once = null;
  var listen_once__7774 = function(src, type, fn) {
    return listen_once.call(null, src, type, fn, false)
  };
  var listen_once__7775 = function(src, type, fn, capture_QMARK_) {
    return goog.events.listenOnce.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  listen_once = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return listen_once__7774.call(this, src, type, fn);
      case 4:
        return listen_once__7775.call(this, src, type, fn, capture_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen_once
}();
clojure.browser.event.unlisten = function() {
  var unlisten = null;
  var unlisten__7777 = function(src, type, fn) {
    return unlisten.call(null, src, type, fn, false)
  };
  var unlisten__7778 = function(src, type, fn, capture_QMARK_) {
    return goog.events.unlisten.call(null, src, cljs.core.get.call(null, clojure.browser.event.event_types.call(null, src), type, type), fn, capture_QMARK_)
  };
  unlisten = function(src, type, fn, capture_QMARK_) {
    switch(arguments.length) {
      case 3:
        return unlisten__7777.call(this, src, type, fn);
      case 4:
        return unlisten__7778.call(this, src, type, fn, capture_QMARK_)
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
goog.provide("clojure.browser.net");
goog.require("cljs.core");
goog.require("clojure.browser.event");
goog.require("goog.net.XhrIo");
goog.require("goog.net.EventType");
goog.require("goog.net.xpc.CfgFields");
goog.require("goog.net.xpc.CrossPageChannel");
goog.require("goog.json");
clojure.browser.net._STAR_timeout_STAR_ = 1E4;
clojure.browser.net.event_types = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__7664) {
  var vec__7665__7666 = p__7664;
  var k__7667 = cljs.core.nth.call(null, vec__7665__7666, 0, null);
  var v__7668 = cljs.core.nth.call(null, vec__7665__7666, 1, null);
  return cljs.core.Vector.fromArray([cljs.core.keyword.call(null, k__7667.toLowerCase()), v__7668])
}, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.net.EventType))));
clojure.browser.net.IConnection = {};
clojure.browser.net.connect = function() {
  var connect = null;
  var connect__7699 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7669 = this$;
      if(cljs.core.truth_(and__3546__auto____7669)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____7669
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$)
    }else {
      return function() {
        var or__3548__auto____7670 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7670)) {
          return or__3548__auto____7670
        }else {
          var or__3548__auto____7671 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____7671)) {
            return or__3548__auto____7671
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var connect__7700 = function(this$, opt1) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7672 = this$;
      if(cljs.core.truth_(and__3546__auto____7672)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____7672
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1)
    }else {
      return function() {
        var or__3548__auto____7673 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7673)) {
          return or__3548__auto____7673
        }else {
          var or__3548__auto____7674 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____7674)) {
            return or__3548__auto____7674
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1)
    }
  };
  var connect__7701 = function(this$, opt1, opt2) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7675 = this$;
      if(cljs.core.truth_(and__3546__auto____7675)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____7675
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1, opt2)
    }else {
      return function() {
        var or__3548__auto____7676 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7676)) {
          return or__3548__auto____7676
        }else {
          var or__3548__auto____7677 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____7677)) {
            return or__3548__auto____7677
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.connect", this$);
          }
        }
      }().call(null, this$, opt1, opt2)
    }
  };
  var connect__7702 = function(this$, opt1, opt2, opt3) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7678 = this$;
      if(cljs.core.truth_(and__3546__auto____7678)) {
        return this$.clojure$browser$net$IConnection$connect
      }else {
        return and__3546__auto____7678
      }
    }())) {
      return this$.clojure$browser$net$IConnection$connect(this$, opt1, opt2, opt3)
    }else {
      return function() {
        var or__3548__auto____7679 = clojure.browser.net.connect[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7679)) {
          return or__3548__auto____7679
        }else {
          var or__3548__auto____7680 = clojure.browser.net.connect["_"];
          if(cljs.core.truth_(or__3548__auto____7680)) {
            return or__3548__auto____7680
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
        return connect__7699.call(this, this$);
      case 2:
        return connect__7700.call(this, this$, opt1);
      case 3:
        return connect__7701.call(this, this$, opt1, opt2);
      case 4:
        return connect__7702.call(this, this$, opt1, opt2, opt3)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return connect
}();
clojure.browser.net.transmit = function() {
  var transmit = null;
  var transmit__7704 = function(this$, opt) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7681 = this$;
      if(cljs.core.truth_(and__3546__auto____7681)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____7681
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt)
    }else {
      return function() {
        var or__3548__auto____7682 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7682)) {
          return or__3548__auto____7682
        }else {
          var or__3548__auto____7683 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____7683)) {
            return or__3548__auto____7683
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt)
    }
  };
  var transmit__7705 = function(this$, opt, opt2) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7684 = this$;
      if(cljs.core.truth_(and__3546__auto____7684)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____7684
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2)
    }else {
      return function() {
        var or__3548__auto____7685 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7685)) {
          return or__3548__auto____7685
        }else {
          var or__3548__auto____7686 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____7686)) {
            return or__3548__auto____7686
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2)
    }
  };
  var transmit__7706 = function(this$, opt, opt2, opt3) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7687 = this$;
      if(cljs.core.truth_(and__3546__auto____7687)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____7687
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3)
    }else {
      return function() {
        var or__3548__auto____7688 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7688)) {
          return or__3548__auto____7688
        }else {
          var or__3548__auto____7689 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____7689)) {
            return or__3548__auto____7689
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3)
    }
  };
  var transmit__7707 = function(this$, opt, opt2, opt3, opt4) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7690 = this$;
      if(cljs.core.truth_(and__3546__auto____7690)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____7690
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3, opt4)
    }else {
      return function() {
        var or__3548__auto____7691 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7691)) {
          return or__3548__auto____7691
        }else {
          var or__3548__auto____7692 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____7692)) {
            return or__3548__auto____7692
          }else {
            throw cljs.core.missing_protocol.call(null, "IConnection.transmit", this$);
          }
        }
      }().call(null, this$, opt, opt2, opt3, opt4)
    }
  };
  var transmit__7708 = function(this$, opt, opt2, opt3, opt4, opt5) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7693 = this$;
      if(cljs.core.truth_(and__3546__auto____7693)) {
        return this$.clojure$browser$net$IConnection$transmit
      }else {
        return and__3546__auto____7693
      }
    }())) {
      return this$.clojure$browser$net$IConnection$transmit(this$, opt, opt2, opt3, opt4, opt5)
    }else {
      return function() {
        var or__3548__auto____7694 = clojure.browser.net.transmit[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7694)) {
          return or__3548__auto____7694
        }else {
          var or__3548__auto____7695 = clojure.browser.net.transmit["_"];
          if(cljs.core.truth_(or__3548__auto____7695)) {
            return or__3548__auto____7695
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
        return transmit__7704.call(this, this$, opt);
      case 3:
        return transmit__7705.call(this, this$, opt, opt2);
      case 4:
        return transmit__7706.call(this, this$, opt, opt2, opt3);
      case 5:
        return transmit__7707.call(this, this$, opt, opt2, opt3, opt4);
      case 6:
        return transmit__7708.call(this, this$, opt, opt2, opt3, opt4, opt5)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return transmit
}();
clojure.browser.net.close = function close(this$) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7696 = this$;
    if(cljs.core.truth_(and__3546__auto____7696)) {
      return this$.clojure$browser$net$IConnection$close
    }else {
      return and__3546__auto____7696
    }
  }())) {
    return this$.clojure$browser$net$IConnection$close(this$)
  }else {
    return function() {
      var or__3548__auto____7697 = clojure.browser.net.close[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____7697)) {
        return or__3548__auto____7697
      }else {
        var or__3548__auto____7698 = clojure.browser.net.close["_"];
        if(cljs.core.truth_(or__3548__auto____7698)) {
          return or__3548__auto____7698
        }else {
          throw cljs.core.missing_protocol.call(null, "IConnection.close", this$);
        }
      }
    }().call(null, this$)
  }
};
goog.net.XhrIo.prototype.clojure$browser$event$EventType$ = true;
goog.net.XhrIo.prototype.clojure$browser$event$EventType$event_types = function(this$) {
  return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__7710) {
    var vec__7711__7712 = p__7710;
    var k__7713 = cljs.core.nth.call(null, vec__7711__7712, 0, null);
    var v__7714 = cljs.core.nth.call(null, vec__7711__7712, 1, null);
    return cljs.core.Vector.fromArray([cljs.core.keyword.call(null, k__7713.toLowerCase()), v__7714])
  }, cljs.core.merge.call(null, cljs.core.js__GT_clj.call(null, goog.net.EventType))))
};
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$ = true;
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$transmit = function() {
  var G__7715 = null;
  var G__7715__7716 = function(this$, uri) {
    return clojure.browser.net.transmit.call(null, this$, uri, "GET", null, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__7715__7717 = function(this$, uri, method) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, null, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__7715__7718 = function(this$, uri, method, content) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, content, null, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__7715__7719 = function(this$, uri, method, content, headers) {
    return clojure.browser.net.transmit.call(null, this$, uri, method, content, headers, clojure.browser.net._STAR_timeout_STAR_)
  };
  var G__7715__7720 = function(this$, uri, method, content, headers, timeout) {
    this$.setTimeoutInterval(timeout);
    return this$.send(uri, method, content, headers)
  };
  G__7715 = function(this$, uri, method, content, headers, timeout) {
    switch(arguments.length) {
      case 2:
        return G__7715__7716.call(this, this$, uri);
      case 3:
        return G__7715__7717.call(this, this$, uri, method);
      case 4:
        return G__7715__7718.call(this, this$, uri, method, content);
      case 5:
        return G__7715__7719.call(this, this$, uri, method, content, headers);
      case 6:
        return G__7715__7720.call(this, this$, uri, method, content, headers, timeout)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7715
}();
clojure.browser.net.xpc_config_fields = cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), cljs.core.map.call(null, function(p__7722) {
  var vec__7723__7724 = p__7722;
  var k__7725 = cljs.core.nth.call(null, vec__7723__7724, 0, null);
  var v__7726 = cljs.core.nth.call(null, vec__7723__7724, 1, null);
  return cljs.core.Vector.fromArray([cljs.core.keyword.call(null, k__7725.toLowerCase()), v__7726])
}, cljs.core.js__GT_clj.call(null, goog.net.xpc.CfgFields)));
clojure.browser.net.xhr_connection = function xhr_connection() {
  return new goog.net.XhrIo
};
clojure.browser.net.ICrossPageChannel = {};
clojure.browser.net.register_service = function() {
  var register_service = null;
  var register_service__7733 = function(this$, service_name, fn) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7727 = this$;
      if(cljs.core.truth_(and__3546__auto____7727)) {
        return this$.clojure$browser$net$ICrossPageChannel$register_service
      }else {
        return and__3546__auto____7727
      }
    }())) {
      return this$.clojure$browser$net$ICrossPageChannel$register_service(this$, service_name, fn)
    }else {
      return function() {
        var or__3548__auto____7728 = clojure.browser.net.register_service[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7728)) {
          return or__3548__auto____7728
        }else {
          var or__3548__auto____7729 = clojure.browser.net.register_service["_"];
          if(cljs.core.truth_(or__3548__auto____7729)) {
            return or__3548__auto____7729
          }else {
            throw cljs.core.missing_protocol.call(null, "ICrossPageChannel.register-service", this$);
          }
        }
      }().call(null, this$, service_name, fn)
    }
  };
  var register_service__7734 = function(this$, service_name, fn, encode_json_QMARK_) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7730 = this$;
      if(cljs.core.truth_(and__3546__auto____7730)) {
        return this$.clojure$browser$net$ICrossPageChannel$register_service
      }else {
        return and__3546__auto____7730
      }
    }())) {
      return this$.clojure$browser$net$ICrossPageChannel$register_service(this$, service_name, fn, encode_json_QMARK_)
    }else {
      return function() {
        var or__3548__auto____7731 = clojure.browser.net.register_service[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7731)) {
          return or__3548__auto____7731
        }else {
          var or__3548__auto____7732 = clojure.browser.net.register_service["_"];
          if(cljs.core.truth_(or__3548__auto____7732)) {
            return or__3548__auto____7732
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
        return register_service__7733.call(this, this$, service_name, fn);
      case 4:
        return register_service__7734.call(this, this$, service_name, fn, encode_json_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return register_service
}();
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$connect = function() {
  var G__7736 = null;
  var G__7736__7737 = function(this$) {
    return clojure.browser.net.connect.call(null, this$, null)
  };
  var G__7736__7738 = function(this$, on_connect_fn) {
    return this$.connect(on_connect_fn)
  };
  var G__7736__7739 = function(this$, on_connect_fn, config_iframe_fn) {
    return clojure.browser.net.connect.call(null, this$, on_connect_fn, config_iframe_fn, document.body)
  };
  var G__7736__7740 = function(this$, on_connect_fn, config_iframe_fn, iframe_parent) {
    this$.createPeerIframe(iframe_parent, config_iframe_fn);
    return this$.connect(on_connect_fn)
  };
  G__7736 = function(this$, on_connect_fn, config_iframe_fn, iframe_parent) {
    switch(arguments.length) {
      case 1:
        return G__7736__7737.call(this, this$);
      case 2:
        return G__7736__7738.call(this, this$, on_connect_fn);
      case 3:
        return G__7736__7739.call(this, this$, on_connect_fn, config_iframe_fn);
      case 4:
        return G__7736__7740.call(this, this$, on_connect_fn, config_iframe_fn, iframe_parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7736
}();
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$transmit = function(this$, service_name, payload) {
  return this$.send(cljs.core.name.call(null, service_name), payload)
};
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$close = function(this$) {
  return this$.close(cljs.core.List.EMPTY)
};
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$register_service = function() {
  var G__7742 = null;
  var G__7742__7743 = function(this$, service_name, fn) {
    return clojure.browser.net.register_service.call(null, this$, service_name, fn, false)
  };
  var G__7742__7744 = function(this$, service_name, fn, encode_json_QMARK_) {
    return this$.registerService(cljs.core.name.call(null, service_name), fn, encode_json_QMARK_)
  };
  G__7742 = function(this$, service_name, fn, encode_json_QMARK_) {
    switch(arguments.length) {
      case 3:
        return G__7742__7743.call(this, this$, service_name, fn);
      case 4:
        return G__7742__7744.call(this, this$, service_name, fn, encode_json_QMARK_)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7742
}();
clojure.browser.net.xpc_connection = function() {
  var xpc_connection = null;
  var xpc_connection__7755 = function() {
    var temp__3698__auto____7746 = (new goog.Uri(window.location.href)).getParameterValue("xpc");
    if(cljs.core.truth_(temp__3698__auto____7746)) {
      var config__7747 = temp__3698__auto____7746;
      return new goog.net.xpc.CrossPageChannel(goog.json.parse.call(null, config__7747))
    }else {
      return null
    }
  };
  var xpc_connection__7756 = function(config) {
    return new goog.net.xpc.CrossPageChannel(cljs.core.reduce.call(null, function(sum, p__7748) {
      var vec__7749__7750 = p__7748;
      var k__7751 = cljs.core.nth.call(null, vec__7749__7750, 0, null);
      var v__7752 = cljs.core.nth.call(null, vec__7749__7750, 1, null);
      var temp__3695__auto____7753 = cljs.core.get.call(null, clojure.browser.net.xpc_config_fields, k__7751);
      if(cljs.core.truth_(temp__3695__auto____7753)) {
        var field__7754 = temp__3695__auto____7753;
        return cljs.core.assoc.call(null, sum, field__7754, v__7752)
      }else {
        return sum
      }
    }, cljs.core.ObjMap.fromObject([], {}), config).strobj)
  };
  xpc_connection = function(config) {
    switch(arguments.length) {
      case 0:
        return xpc_connection__7755.call(this);
      case 1:
        return xpc_connection__7756.call(this, config)
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
  var temp__3695__auto____7651 = cljs.core.deref.call(null, clojure.browser.repl.xpc_connection);
  if(cljs.core.truth_(temp__3695__auto____7651)) {
    var conn__7652 = temp__3695__auto____7651;
    return clojure.browser.net.transmit.call(null, conn__7652, "\ufdd0'print", cljs.core.pr_str.call(null, data))
  }else {
    return null
  }
};
clojure.browser.repl.evaluate_javascript = function evaluate_javascript(conn, block) {
  var result__7655 = function() {
    try {
      return cljs.core.ObjMap.fromObject(["\ufdd0'status", "\ufdd0'value"], {"\ufdd0'status":"\ufdd0'success", "\ufdd0'value":cljs.core.str.call(null, eval(block))})
    }catch(e7653) {
      if(cljs.core.truth_(cljs.core.instance_QMARK_.call(null, Error, e7653))) {
        var e__7654 = e7653;
        return cljs.core.ObjMap.fromObject(["\ufdd0'status", "\ufdd0'value", "\ufdd0'stacktrace"], {"\ufdd0'status":"\ufdd0'exception", "\ufdd0'value":cljs.core.pr_str.call(null, e__7654), "\ufdd0'stacktrace":cljs.core.truth_(e__7654.hasOwnProperty("stack")) ? e__7654.stack : "No stacktrace available."})
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          throw e7653;
        }else {
          return null
        }
      }
    }
  }();
  return cljs.core.pr_str.call(null, result__7655)
};
clojure.browser.repl.send_result = function send_result(connection, url, data) {
  return clojure.browser.net.transmit.call(null, connection, url, "POST", data, null, 0)
};
clojure.browser.repl.send_print = function() {
  var send_print = null;
  var send_print__7657 = function(url, data) {
    return send_print.call(null, url, data, 0)
  };
  var send_print__7658 = function(url, data, n) {
    var conn__7656 = clojure.browser.net.xhr_connection.call(null);
    clojure.browser.event.listen.call(null, conn__7656, "\ufdd0'error", function(_) {
      if(cljs.core.truth_(n < 10)) {
        return send_print.call(null, url, data, n + 1)
      }else {
        return console.log(cljs.core.str.call(null, "Could not send ", data, " after ", n, " attempts."))
      }
    });
    return clojure.browser.net.transmit.call(null, conn__7656, url, "POST", data, null, 0)
  };
  send_print = function(url, data, n) {
    switch(arguments.length) {
      case 2:
        return send_print__7657.call(this, url, data);
      case 3:
        return send_print__7658.call(this, url, data, n)
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
  var temp__3695__auto____7660 = clojure.browser.net.xpc_connection.call(null);
  if(cljs.core.truth_(temp__3695__auto____7660)) {
    var repl_connection__7661 = temp__3695__auto____7660;
    var connection__7662 = clojure.browser.net.xhr_connection.call(null);
    clojure.browser.event.listen.call(null, connection__7662, "\ufdd0'success", function(e) {
      return clojure.browser.net.transmit.call(null, repl_connection__7661, "\ufdd0'evaluate-javascript", e.currentTarget.getResponseText(cljs.core.List.EMPTY))
    });
    clojure.browser.net.register_service.call(null, repl_connection__7661, "\ufdd0'send-result", function(data) {
      return clojure.browser.repl.send_result.call(null, connection__7662, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'result", data))
    });
    clojure.browser.net.register_service.call(null, repl_connection__7661, "\ufdd0'print", function(data) {
      return clojure.browser.repl.send_print.call(null, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'print", data))
    });
    clojure.browser.net.connect.call(null, repl_connection__7661, cljs.core.constantly.call(null, null));
    return setTimeout.call(null, function() {
      return clojure.browser.repl.send_result.call(null, connection__7662, url, clojure.browser.repl.wrap_message.call(null, "\ufdd0'ready", "ready"))
    }, 50)
  }else {
    return alert.call(null, "No 'xpc' param provided to child iframe.")
  }
};
clojure.browser.repl.connect = function connect(repl_server_url) {
  var repl_connection__7663 = clojure.browser.net.xpc_connection.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'peer_uri"], {"\ufdd0'peer_uri":repl_server_url}));
  cljs.core.swap_BANG_.call(null, clojure.browser.repl.xpc_connection, cljs.core.constantly.call(null, repl_connection__7663));
  clojure.browser.net.register_service.call(null, repl_connection__7663, "\ufdd0'evaluate-javascript", function(js) {
    return clojure.browser.net.transmit.call(null, repl_connection__7663, "\ufdd0'send-result", clojure.browser.repl.evaluate_javascript.call(null, repl_connection__7663, js))
  });
  return clojure.browser.net.connect.call(null, repl_connection__7663, cljs.core.constantly.call(null, null), function(iframe) {
    return iframe.style.display = "none"
  })
};
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
  var join__7622 = function(coll) {
    return cljs.core.apply.call(null, cljs.core.str, coll)
  };
  var join__7623 = function(separator, coll) {
    return cljs.core.apply.call(null, cljs.core.str, cljs.core.interpose.call(null, separator, coll))
  };
  join = function(separator, coll) {
    switch(arguments.length) {
      case 1:
        return join__7622.call(this, separator);
      case 2:
        return join__7623.call(this, separator, coll)
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
  var split__7631 = function(s, re) {
    return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
  };
  var split__7632 = function(s, re, limit) {
    if(cljs.core.truth_(limit < 1)) {
      return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
    }else {
      var s__7625 = s;
      var limit__7626 = limit;
      var parts__7627 = cljs.core.Vector.fromArray([]);
      while(true) {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, limit__7626, 1))) {
          return cljs.core.conj.call(null, parts__7627, s__7625)
        }else {
          var temp__3695__auto____7628 = cljs.core.re_find.call(null, re, s__7625);
          if(cljs.core.truth_(temp__3695__auto____7628)) {
            var m__7629 = temp__3695__auto____7628;
            var index__7630 = s__7625.indexOf(m__7629);
            var G__7634 = s__7625.substring(index__7630 + cljs.core.count.call(null, m__7629));
            var G__7635 = limit__7626 - 1;
            var G__7636 = cljs.core.conj.call(null, parts__7627, s__7625.substring(0, index__7630));
            s__7625 = G__7634;
            limit__7626 = G__7635;
            parts__7627 = G__7636;
            continue
          }else {
            return cljs.core.conj.call(null, parts__7627, s__7625)
          }
        }
        break
      }
    }
  };
  split = function(s, re, limit) {
    switch(arguments.length) {
      case 2:
        return split__7631.call(this, s, re);
      case 3:
        return split__7632.call(this, s, re, limit)
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
  var index__7637 = s.length;
  while(true) {
    if(cljs.core.truth_(index__7637 === 0)) {
      return""
    }else {
      var ch__7638 = cljs.core.get.call(null, s, index__7637 - 1);
      if(cljs.core.truth_(function() {
        var or__3548__auto____7639 = cljs.core._EQ_.call(null, ch__7638, "\n");
        if(cljs.core.truth_(or__3548__auto____7639)) {
          return or__3548__auto____7639
        }else {
          return cljs.core._EQ_.call(null, ch__7638, "\r")
        }
      }())) {
        var G__7640 = index__7637 - 1;
        index__7637 = G__7640;
        continue
      }else {
        return s.substring(0, index__7637)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__7641 = cljs.core.str.call(null, s);
  if(cljs.core.truth_(function() {
    var or__3548__auto____7642 = cljs.core.not.call(null, s__7641);
    if(cljs.core.truth_(or__3548__auto____7642)) {
      return or__3548__auto____7642
    }else {
      var or__3548__auto____7643 = cljs.core._EQ_.call(null, "", s__7641);
      if(cljs.core.truth_(or__3548__auto____7643)) {
        return or__3548__auto____7643
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__7641)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__7644 = new goog.string.StringBuffer;
  var length__7645 = s.length;
  var index__7646 = 0;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, length__7645, index__7646))) {
      return buffer__7644.toString()
    }else {
      var ch__7647 = s.charAt(index__7646);
      var temp__3695__auto____7648 = cljs.core.get.call(null, cmap, ch__7647);
      if(cljs.core.truth_(temp__3695__auto____7648)) {
        var replacement__7649 = temp__3695__auto____7648;
        buffer__7644.append(cljs.core.str.call(null, replacement__7649))
      }else {
        buffer__7644.append(ch__7647)
      }
      var G__7650 = index__7646 + 1;
      index__7646 = G__7650;
      continue
    }
    break
  }
};
goog.provide("tatame.events");
goog.require("cljs.core");
goog.require("cljs.reader");
goog.provide("tatame.main");
goog.require("cljs.core");
goog.require("cljs.reader");
goog.require("clojure.browser.repl");
goog.require("clojure.string");
goog.require("goog.dom");
goog.require("goog.object");
if(cljs.core.truth_(cljs.core._EQ_.call(null, location.hostname, "localhost"))) {
  clojure.browser.repl.connect.call(null, "http://localhost:9000/repl")
}else {
}
tatame.main.jasmine_template = '<html>\n  <head>\n\n\n    <link rel="stylesheet" type="text/css" href="/jasmine.css">\n    <script type="text/javascript" src="/jasmine.js"><\/script>\n    <script type="text/javascript" src="/jasmine-html.js"><\/script>\n\n    <body>\n    <\!-- include spec files here... --\>\n    <script type="text/javascript">{{code}}<\/script>\n\n    <script type="text/javascript">\n      (function() {\n      var jasmineEnv = jasmine.getEnv();\n      //jasmineEnv.updateInterval = 1000;\n\n      var trivialReporter = new jasmine.TrivialReporter();\n      jasmineEnv.addReporter(trivialReporter);\n      jasmineEnv.specFilter = function(spec) {\n        return trivialReporter.specFilter(spec);\n      };\n\n      window.onload = function() {\n         jasmineEnv.execute();\n      };;\n\n      //window.jasmineEnv = jasmineEnv;\n\n      })();\n    <\/script>\n    </body>\n\n  </head>\n\n\n</html>\n\n';
tatame.main.editors = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
tatame.main.stable_js = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
tatame.main.session = function session(editor) {
  return editor.getSession()
};
tatame.main.content = function content(editor) {
  return tatame.main.session.call(null, editor).getValue()
};
tatame.main.frame_doc = function frame_doc(id) {
  return goog.dom.getFrameContentDocument.call(null, goog.dom.getElement.call(null, id))
};
tatame.main.frame_id = function frame_id(id) {
  return cljs.core.str.call(null, id, "-frame")
};
tatame.main.frame_el = function frame_el(id) {
  return goog.dom.getElement.call(null, tatame.main.frame_id.call(null, id))
};
tatame.main.frame_template = function frame_template(id) {
  return cljs.core.str.call(null, '<iframe id="', id, '-frame" src=""style="width:100%; height:100%"></iframe>')
};
tatame.main.init_editor_BANG_ = function init_editor_BANG_(id, mode, listeners) {
  var editor__4048 = ace.edit(id);
  var session__4049 = tatame.main.session.call(null, editor__4048);
  var mode_fn__4050 = window.require(mode).Mode;
  session__4049.setMode(new mode_fn__4050);
  var G__4051__4052 = cljs.core.seq.call(null, listeners);
  if(cljs.core.truth_(G__4051__4052)) {
    var G__4054__4056 = cljs.core.first.call(null, G__4051__4052);
    var vec__4055__4057 = G__4054__4056;
    var event__4058 = cljs.core.nth.call(null, vec__4055__4057, 0, null);
    var f__4059 = cljs.core.nth.call(null, vec__4055__4057, 1, null);
    var G__4051__4060 = G__4051__4052;
    var G__4054__4061 = G__4054__4056;
    var G__4051__4062 = G__4051__4060;
    while(true) {
      var vec__4063__4064 = G__4054__4061;
      var event__4065 = cljs.core.nth.call(null, vec__4063__4064, 0, null);
      var f__4066 = cljs.core.nth.call(null, vec__4063__4064, 1, null);
      var G__4051__4067 = G__4051__4062;
      session__4049.on(event__4065, cljs.core.partial.call(null, f__4066, id));
      var temp__3698__auto____4068 = cljs.core.next.call(null, G__4051__4067);
      if(cljs.core.truth_(temp__3698__auto____4068)) {
        var G__4051__4069 = temp__3698__auto____4068;
        var G__4070 = cljs.core.first.call(null, G__4051__4069);
        var G__4071 = G__4051__4069;
        G__4054__4061 = G__4070;
        G__4051__4062 = G__4071;
        continue
      }else {
      }
      break
    }
  }else {
  }
  cljs.core.swap_BANG_.call(null, tatame.main.editors, cljs.core.assoc, id, editor__4048);
  return editor__4048
};
tatame.main.write_frame_BANG_ = function write_frame_BANG_(id, html, clean) {
  if(cljs.core.truth_(clean)) {
    goog.dom.removeNode.call(null, tatame.main.frame_el.call(null, id));
    goog.dom.getElement.call(null, id).innerHTML = tatame.main.frame_template.call(null, id)
  }else {
  }
  var doc__4072 = tatame.main.frame_doc.call(null, tatame.main.frame_id.call(null, id));
  var G__4073__4074 = doc__4072;
  G__4073__4074.open();
  G__4073__4074.write(html);
  G__4073__4074.close();
  return G__4073__4074
};
tatame.main.refresh_canvas_BANG_ = function refresh_canvas_BANG_() {
  var html__4076 = tatame.main.content.call(null, cljs.core.deref.call(null, tatame.main.editors).call(null, "html-editor"));
  var js__4077 = cljs.core.deref.call(null, tatame.main.stable_js).call(null, "js-editor");
  var content__4078 = clojure.string.replace_first.call(null, html__4076, "{{code}}", js__4077);
  tatame.main.write_frame_BANG_.call(null, "canvas", content__4078, false);
  return true
};
tatame.main.run_if_stable_BANG_ = function run_if_stable_BANG_(id, f) {
  var editor__4079 = cljs.core.deref.call(null, tatame.main.editors).call(null, id);
  var annotations__4080 = tatame.main.session.call(null, editor__4079).$annotations;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.some.call(null, function(p1__4075_SHARP_) {
    return cljs.core._EQ_.call(null, p1__4075_SHARP_.type, "error")
  }, goog.object.getKeys.call(null, annotations__4080))))) {
    cljs.core.swap_BANG_.call(null, tatame.main.stable_js, cljs.core.assoc, id, tatame.main.content.call(null, editor__4079));
    f.call(null)
  }else {
  }
  return true
};
tatame.main.run_tests_BANG_ = function run_tests_BANG_() {
  var tests__4081 = tatame.main.content.call(null, cljs.core.deref.call(null, tatame.main.editors).call(null, "test-editor"));
  var source__4082 = cljs.core.deref.call(null, tatame.main.stable_js).call(null, "js-editor");
  var html__4083 = clojure.string.replace_first.call(null, tatame.main.jasmine_template, "{{code}}", cljs.core.str.call(null, tests__4081, source__4082));
  return tatame.main.write_frame_BANG_.call(null, "jasmine", html__4083, true)
};
tatame.main.delay_buffered = function delay_buffered(f, ms) {
  var timer__4084 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__4088__delegate = function(args) {
      var temp__3695__auto____4085 = cljs.core.deref.call(null, timer__4084).call(null, args);
      if(cljs.core.truth_(temp__3695__auto____4085)) {
        var t__4086 = temp__3695__auto____4085;
        window.clearTimeout(t__4086)
      }else {
      }
      var t__4087 = window.setTimeout(function() {
        cljs.core.swap_BANG_.call(null, timer__4084, cljs.core.assoc, args, null);
        return cljs.core.apply.call(null, f, args)
      }, ms);
      return cljs.core.swap_BANG_.call(null, timer__4084, cljs.core.assoc, args, t__4087)
    };
    var G__4088 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__4088__delegate.call(this, args)
    };
    G__4088.cljs$lang$maxFixedArity = 0;
    G__4088.cljs$lang$applyTo = function(arglist__4089) {
      var args = cljs.core.seq(arglist__4089);
      return G__4088__delegate.call(this, args)
    };
    return G__4088
  }()
};
tatame.main.save_state_BANG_ = function save_state_BANG_(id) {
  return localStorage.setItem(id, tatame.main.content.call(null, cljs.core.deref.call(null, tatame.main.editors).call(null, id)))
};
tatame.main.load_state_BANG_ = function load_state_BANG_(id) {
  var temp__3698__auto____4090 = localStorage.getItem(id);
  if(cljs.core.truth_(temp__3698__auto____4090)) {
    var content__4091 = temp__3698__auto____4090;
    return tatame.main.session.call(null, cljs.core.deref.call(null, tatame.main.editors).call(null, id)).setValue(content__4091)
  }else {
    return null
  }
};
tatame.main.run_tests_BANG_ = tatame.main.delay_buffered.call(null, tatame.main.run_tests_BANG_, 500);
tatame.main.refresh_canvas_BANG_ = tatame.main.delay_buffered.call(null, tatame.main.refresh_canvas_BANG_, 200);
tatame.main.init_BANG_ = function init_BANG_() {
  var onchange__4092 = cljs.core.juxt.call(null, tatame.main.emit_event_BANG_, tatame.main.save_state_BANG_);
  var editors__4093 = cljs.core.ObjMap.fromObject(["html-editor", "js-editor", "test-editor"], {"html-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change"], {"\ufdd0'mode":"ace/mode/html", "change":function(id, event) {
    tatame.main.refresh_canvas_BANG_.call(null);
    return onchange__4092.call(null, id, event)
  }}), "js-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change", "changeAnnotation"], {"\ufdd0'mode":"ace/mode/javascript", "change":onchange__4092, "changeAnnotation":function(id) {
    return tatame.main.run_if_stable_BANG_.call(null, id, cljs.core.juxt.call(null, tatame.main.refresh_canvas_BANG_, tatame.main.run_tests_BANG_))
  }}), "test-editor":cljs.core.ObjMap.fromObject(["\ufdd0'mode", "change", "changeAnnotation"], {"\ufdd0'mode":"ace/mode/javascript", "change":onchange__4092, "changeAnnotation":function(id) {
    return tatame.main.run_if_stable_BANG_.call(null, id, tatame.main.run_tests_BANG_)
  }})});
  var G__4094__4095 = cljs.core.seq.call(null, editors__4093);
  if(cljs.core.truth_(G__4094__4095)) {
    var G__4097__4099 = cljs.core.first.call(null, G__4094__4095);
    var vec__4098__4100 = G__4097__4099;
    var id__4101 = cljs.core.nth.call(null, vec__4098__4100, 0, null);
    var opts__4102 = cljs.core.nth.call(null, vec__4098__4100, 1, null);
    var G__4094__4103 = G__4094__4095;
    var G__4097__4104 = G__4097__4099;
    var G__4094__4105 = G__4094__4103;
    while(true) {
      var vec__4106__4107 = G__4097__4104;
      var id__4108 = cljs.core.nth.call(null, vec__4106__4107, 0, null);
      var opts__4109 = cljs.core.nth.call(null, vec__4106__4107, 1, null);
      var G__4094__4110 = G__4094__4105;
      tatame.main.init_editor_BANG_.call(null, id__4108, "\ufdd0'mode".call(null, opts__4109), cljs.core.dissoc.call(null, opts__4109, "\ufdd0'mode"));
      tatame.main.load_state_BANG_.call(null, id__4108);
      var temp__3698__auto____4111 = cljs.core.next.call(null, G__4094__4110);
      if(cljs.core.truth_(temp__3698__auto____4111)) {
        var G__4094__4112 = temp__3698__auto____4111;
        var G__4113 = cljs.core.first.call(null, G__4094__4112);
        var G__4114 = G__4094__4112;
        G__4097__4104 = G__4113;
        G__4094__4105 = G__4114;
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
window.onload = tatame.main.init_BANG_;
tatame.main.userid = cljs.core.atom.call(null, localStorage.getItem("userid"));
tatame.main.emit_event_BANG_ = function emit_event_BANG_(id, data) {
  data.editor = id;
  return tatame.main.worker.postMessage(data)
};
tatame.main.on_server_message = function on_server_message(p__4115) {
  var data__4116 = p__4115;
  var data__4117 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, data__4116)) ? cljs.core.apply.call(null, cljs.core.hash_map, data__4116) : data__4116;
  var event__4118 = cljs.core.get.call(null, data__4117, "\ufdd0'event");
  console.log("on server message", cljs.core.pr_str.call(null, data__4117));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, event__4118, "login"))) {
    var temp__3695__auto____4119 = cljs.core.deref.call(null, tatame.main.userid);
    if(cljs.core.truth_(temp__3695__auto____4119)) {
      var userid__4120 = temp__3695__auto____4119;
      return tatame.main.worker.postMessage(cljs.core.pr_str.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'command", "\ufdd0'userid"], {"\ufdd0'command":"login", "\ufdd0'userid":userid__4120})))
    }else {
      return cljs.core.swap_BANG_.call(null, tatame.main.userid, function() {
        localStorage.setItem("userid", "\ufdd0'nick".call(null, data__4117));
        return"\ufdd0'nick".call(null, data__4117)
      })
    }
  }else {
    return null
  }
};
tatame.main.on_client_message = function on_client_message(data) {
  return console.log("on client message", data)
};
tatame.main.worker = new Worker("/javascripts/worker.js");
tatame.main.worker.addEventListener("message", function(e) {
  var data__4121 = cljs.reader.read_string.call(null, e.data);
  var temp__3695__auto____4122 = "\ufdd0'type".call(null, data__4121);
  if(cljs.core.truth_(temp__3695__auto____4122)) {
    var type__4123 = temp__3695__auto____4122;
    if(cljs.core.truth_(cljs.core._EQ_.call(null, type__4123, "server"))) {
      return tatame.main.on_server_message.call(null, cljs.reader.read_string.call(null, "\ufdd0'data".call(null, data__4121)))
    }else {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, type__4123, "client"))) {
        return tatame.main.on_client_message.call(null, "\ufdd0'data".call(null, data__4121))
      }else {
        return null
      }
    }
  }else {
    return console.log("on generic message", data__4121)
  }
}, false);

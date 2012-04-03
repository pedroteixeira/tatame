goog.provide('cljs.reader');
goog.require('cljs.core');
goog.require('goog.string');
cljs.reader.PushbackReader = {};
cljs.reader.read_char = (function read_char(reader){
if(cljs.core.truth_((function (){var and__3546__auto____3080 = reader;

if(cljs.core.truth_(and__3546__auto____3080))
{return reader.cljs$reader$PushbackReader$read_char;
} else
{return and__3546__auto____3080;
}
})()))
{return reader.cljs$reader$PushbackReader$read_char(reader);
} else
{return (function (){var or__3548__auto____3081 = (cljs.reader.read_char[goog.typeOf.call(null,reader)]);

if(cljs.core.truth_(or__3548__auto____3081))
{return or__3548__auto____3081;
} else
{var or__3548__auto____3082 = (cljs.reader.read_char["_"]);

if(cljs.core.truth_(or__3548__auto____3082))
{return or__3548__auto____3082;
} else
{throw cljs.core.missing_protocol.call(null,"PushbackReader.read-char",reader);
}
}
})().call(null,reader);
}
});
cljs.reader.unread = (function unread(reader,ch){
if(cljs.core.truth_((function (){var and__3546__auto____3083 = reader;

if(cljs.core.truth_(and__3546__auto____3083))
{return reader.cljs$reader$PushbackReader$unread;
} else
{return and__3546__auto____3083;
}
})()))
{return reader.cljs$reader$PushbackReader$unread(reader,ch);
} else
{return (function (){var or__3548__auto____3084 = (cljs.reader.unread[goog.typeOf.call(null,reader)]);

if(cljs.core.truth_(or__3548__auto____3084))
{return or__3548__auto____3084;
} else
{var or__3548__auto____3085 = (cljs.reader.unread["_"]);

if(cljs.core.truth_(or__3548__auto____3085))
{return or__3548__auto____3085;
} else
{throw cljs.core.missing_protocol.call(null,"PushbackReader.unread",reader);
}
}
})().call(null,reader,ch);
}
});

/**
* @constructor
*/
cljs.reader.StringPushbackReader = (function (s,index_atom,buffer_atom){
this.s = s;
this.index_atom = index_atom;
this.buffer_atom = buffer_atom;
})
cljs.reader.StringPushbackReader.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.reader.StringPushbackReader");
});
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$ = true;
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$read_char = (function (reader){
var this__3086 = this;
if(cljs.core.truth_(cljs.core.empty_QMARK_.call(null,cljs.core.deref.call(null,this__3086.buffer_atom))))
{var idx__3087 = cljs.core.deref.call(null,this__3086.index_atom);

cljs.core.swap_BANG_.call(null,this__3086.index_atom,cljs.core.inc);
return cljs.core.nth.call(null,this__3086.s,idx__3087);
} else
{var buf__3088 = cljs.core.deref.call(null,this__3086.buffer_atom);

cljs.core.swap_BANG_.call(null,this__3086.buffer_atom,cljs.core.rest);
return cljs.core.first.call(null,buf__3088);
}
});
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$unread = (function (reader,ch){
var this__3089 = this;
return cljs.core.swap_BANG_.call(null,this__3089.buffer_atom,(function (p1__3079_SHARP_){
return cljs.core.cons.call(null,ch,p1__3079_SHARP_);
}));
});
cljs.reader.StringPushbackReader;
cljs.reader.push_back_reader = (function push_back_reader(s){
return (new cljs.reader.StringPushbackReader(s,cljs.core.atom.call(null,0),cljs.core.atom.call(null,null)));
});
/**
* Checks whether a given character is whitespace
*/
cljs.reader.whitespace_QMARK_ = (function whitespace_QMARK_(ch){
var or__3548__auto____3090 = goog.string.isBreakingWhitespace.call(null,ch);

if(cljs.core.truth_(or__3548__auto____3090))
{return or__3548__auto____3090;
} else
{return cljs.core._EQ_.call(null,",",ch);
}
});
/**
* Checks whether a given character is numeric
*/
cljs.reader.numeric_QMARK_ = (function numeric_QMARK_(ch){
return goog.string.isNumeric.call(null,ch);
});
/**
* Checks whether the character begins a comment.
*/
cljs.reader.comment_prefix_QMARK_ = (function comment_prefix_QMARK_(ch){
return cljs.core._EQ_.call(null,";",ch);
});
/**
* Checks whether the reader is at the start of a number literal
*/
cljs.reader.number_literal_QMARK_ = (function number_literal_QMARK_(reader,initch){
var or__3548__auto____3091 = cljs.reader.numeric_QMARK_.call(null,initch);

if(cljs.core.truth_(or__3548__auto____3091))
{return or__3548__auto____3091;
} else
{var and__3546__auto____3093 = (function (){var or__3548__auto____3092 = cljs.core._EQ_.call(null,"+",initch);

if(cljs.core.truth_(or__3548__auto____3092))
{return or__3548__auto____3092;
} else
{return cljs.core._EQ_.call(null,"-",initch);
}
})();

if(cljs.core.truth_(and__3546__auto____3093))
{return cljs.reader.numeric_QMARK_.call(null,(function (){var next_ch__3094 = cljs.reader.read_char.call(null,reader);

cljs.reader.unread.call(null,reader,next_ch__3094);
return next_ch__3094;
})());
} else
{return and__3546__auto____3093;
}
}
});
/**
* @param {...*} var_args
*/
cljs.reader.reader_error = (function() { 
var reader_error__delegate = function (rdr,msg){
throw cljs.core.apply.call(null,cljs.core.str,msg);
};
var reader_error = function (rdr,var_args){
var msg = null;
if (goog.isDef(var_args)) {
  msg = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return reader_error__delegate.call(this, rdr, msg);
};
reader_error.cljs$lang$maxFixedArity = 1;
reader_error.cljs$lang$applyTo = (function (arglist__3095){
var rdr = cljs.core.first(arglist__3095);
var msg = cljs.core.rest(arglist__3095);
return reader_error__delegate.call(this, rdr, msg);
});
return reader_error;
})()
;
cljs.reader.macro_terminating_QMARK_ = (function macro_terminating_QMARK_(ch){
var and__3546__auto____3096 = cljs.core.not_EQ_.call(null,ch,"#");

if(cljs.core.truth_(and__3546__auto____3096))
{var and__3546__auto____3097 = cljs.core.not_EQ_.call(null,ch,"'");

if(cljs.core.truth_(and__3546__auto____3097))
{var and__3546__auto____3098 = cljs.core.not_EQ_.call(null,ch,":");

if(cljs.core.truth_(and__3546__auto____3098))
{return cljs.core.contains_QMARK_.call(null,cljs.reader.macros,ch);
} else
{return and__3546__auto____3098;
}
} else
{return and__3546__auto____3097;
}
} else
{return and__3546__auto____3096;
}
});
cljs.reader.read_token = (function read_token(rdr,initch){
var sb__3099 = (new goog.string.StringBuffer(initch));
var ch__3100 = cljs.reader.read_char.call(null,rdr);

while(true){
if(cljs.core.truth_((function (){var or__3548__auto____3101 = (ch__3100 === null);

if(cljs.core.truth_(or__3548__auto____3101))
{return or__3548__auto____3101;
} else
{var or__3548__auto____3102 = cljs.reader.whitespace_QMARK_.call(null,ch__3100);

if(cljs.core.truth_(or__3548__auto____3102))
{return or__3548__auto____3102;
} else
{return cljs.reader.macro_terminating_QMARK_.call(null,ch__3100);
}
}
})()))
{cljs.reader.unread.call(null,rdr,ch__3100);
return sb__3099.toString();
} else
{{
var G__3103 = (function (){sb__3099.append(ch__3100);
return sb__3099;
})();
var G__3104 = cljs.reader.read_char.call(null,rdr);
sb__3099 = G__3103;
ch__3100 = G__3104;
continue;
}
}
break;
}
});
/**
* Advances the reader to the end of a line. Returns the reader
*/
cljs.reader.skip_line = (function skip_line(reader,_){

while(true){
var ch__3105 = cljs.reader.read_char.call(null,reader);

if(cljs.core.truth_((function (){var or__3548__auto____3106 = cljs.core._EQ_.call(null,ch__3105,"n");

if(cljs.core.truth_(or__3548__auto____3106))
{return or__3548__auto____3106;
} else
{var or__3548__auto____3107 = cljs.core._EQ_.call(null,ch__3105,"r");

if(cljs.core.truth_(or__3548__auto____3107))
{return or__3548__auto____3107;
} else
{return (ch__3105 === null);
}
}
})()))
{return reader;
} else
{{
continue;
}
}
break;
}
});
cljs.reader.int_pattern = cljs.core.re_pattern.call(null,"([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?");
cljs.reader.ratio_pattern = cljs.core.re_pattern.call(null,"([-+]?[0-9]+)\/([0-9]+)");
cljs.reader.float_pattern = cljs.core.re_pattern.call(null,"([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?");
cljs.reader.symbol_pattern = cljs.core.re_pattern.call(null,"[:]?([^0-9\/].*\/)?([^0-9\/][^\/]*)");
cljs.reader.match_int = (function match_int(s){
var groups__3108 = cljs.core.re_find.call(null,cljs.reader.int_pattern,s);
var group3__3109 = cljs.core.nth.call(null,groups__3108,2);

if(cljs.core.truth_(cljs.core.not.call(null,(function (){var or__3548__auto____3110 = (void 0 === group3__3109);

if(cljs.core.truth_(or__3548__auto____3110))
{return or__3548__auto____3110;
} else
{return (group3__3109.length < 1);
}
})())))
{return 0;
} else
{var negate__3112 = (cljs.core.truth_(cljs.core._EQ_.call(null,"-",cljs.core.nth.call(null,groups__3108,1)))?-1:1);
var vec__3111__3113 = (cljs.core.truth_(cljs.core.nth.call(null,groups__3108,3))?cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null,groups__3108,3),10]):(cljs.core.truth_(cljs.core.nth.call(null,groups__3108,4))?cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null,groups__3108,4),16]):(cljs.core.truth_(cljs.core.nth.call(null,groups__3108,5))?cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null,groups__3108,5),8]):(cljs.core.truth_(cljs.core.nth.call(null,groups__3108,7))?cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null,groups__3108,7),parseInt.call(null,cljs.core.nth.call(null,groups__3108,7))]):(cljs.core.truth_("\uFDD0'default")?cljs.core.PersistentVector.fromArray([null,null]):null)))));
var n__3114 = cljs.core.nth.call(null,vec__3111__3113,0,null);
var radix__3115 = cljs.core.nth.call(null,vec__3111__3113,1,null);

if(cljs.core.truth_((n__3114 === null)))
{return null;
} else
{return (negate__3112 * parseInt.call(null,n__3114,radix__3115));
}
}
});
cljs.reader.match_ratio = (function match_ratio(s){
var groups__3116 = cljs.core.re_find.call(null,cljs.reader.ratio_pattern,s);
var numinator__3117 = cljs.core.nth.call(null,groups__3116,1);
var denominator__3118 = cljs.core.nth.call(null,groups__3116,2);

return (parseInt.call(null,numinator__3117) / parseInt.call(null,denominator__3118));
});
cljs.reader.match_float = (function match_float(s){
return parseFloat.call(null,s);
});
cljs.reader.match_number = (function match_number(s){
if(cljs.core.truth_(cljs.core.re_matches.call(null,cljs.reader.int_pattern,s)))
{return cljs.reader.match_int.call(null,s);
} else
{if(cljs.core.truth_(cljs.core.re_matches.call(null,cljs.reader.ratio_pattern,s)))
{return cljs.reader.match_ratio.call(null,s);
} else
{if(cljs.core.truth_(cljs.core.re_matches.call(null,cljs.reader.float_pattern,s)))
{return cljs.reader.match_float.call(null,s);
} else
{return null;
}
}
}
});
cljs.reader.escape_char_map = cljs.core.HashMap.fromArrays(["t","r","n","\\","\"","b","f"],["\t","\r","\n","\\","\"","\b","\f"]);
cljs.reader.read_unicode_char = (function read_unicode_char(reader,initch){
return cljs.reader.reader_error.call(null,reader,"Unicode characters not supported by reader (yet)");
});
cljs.reader.escape_char = (function escape_char(buffer,reader){
var ch__3119 = cljs.reader.read_char.call(null,reader);
var mapresult__3120 = cljs.core.get.call(null,cljs.reader.escape_char_map,ch__3119);

if(cljs.core.truth_(mapresult__3120))
{return mapresult__3120;
} else
{if(cljs.core.truth_((function (){var or__3548__auto____3121 = cljs.core._EQ_.call(null,"u",ch__3119);

if(cljs.core.truth_(or__3548__auto____3121))
{return or__3548__auto____3121;
} else
{return cljs.reader.numeric_QMARK_.call(null,ch__3119);
}
})()))
{return cljs.reader.read_unicode_char.call(null,reader,ch__3119);
} else
{return cljs.reader.reader_error.call(null,reader,"Unsupported escape charater: \\",ch__3119);
}
}
});
/**
* Read until first character that doesn't match pred, returning
* char.
*/
cljs.reader.read_past = (function read_past(pred,rdr){
var ch__3122 = cljs.reader.read_char.call(null,rdr);

while(true){
if(cljs.core.truth_(pred.call(null,ch__3122)))
{{
var G__3123 = cljs.reader.read_char.call(null,rdr);
ch__3122 = G__3123;
continue;
}
} else
{return ch__3122;
}
break;
}
});
cljs.reader.read_delimited_list = (function read_delimited_list(delim,rdr,recursive_QMARK_){
var a__3124 = cljs.core.PersistentVector.fromArray([]);

while(true){
var ch__3125 = cljs.reader.read_past.call(null,cljs.reader.whitespace_QMARK_,rdr);

if(cljs.core.truth_(ch__3125))
{} else
{cljs.reader.reader_error.call(null,rdr,"EOF");
}
if(cljs.core.truth_(cljs.core._EQ_.call(null,delim,ch__3125)))
{return a__3124;
} else
{var temp__3695__auto____3126 = cljs.core.get.call(null,cljs.reader.macros,ch__3125);

if(cljs.core.truth_(temp__3695__auto____3126))
{var macrofn__3127 = temp__3695__auto____3126;

var mret__3128 = macrofn__3127.call(null,rdr,ch__3125);

{
var G__3130 = (cljs.core.truth_(cljs.core._EQ_.call(null,mret__3128,rdr))?a__3124:cljs.core.conj.call(null,a__3124,mret__3128));
a__3124 = G__3130;
continue;
}
} else
{cljs.reader.unread.call(null,rdr,ch__3125);
var o__3129 = cljs.reader.read.call(null,rdr,true,null,recursive_QMARK_);

{
var G__3131 = (cljs.core.truth_(cljs.core._EQ_.call(null,o__3129,rdr))?a__3124:cljs.core.conj.call(null,a__3124,o__3129));
a__3124 = G__3131;
continue;
}
}
}
break;
}
});
cljs.reader.not_implemented = (function not_implemented(rdr,ch){
return cljs.reader.reader_error.call(null,rdr,"Reader for ",ch," not implemented yet");
});
cljs.reader.read_dispatch = (function read_dispatch(rdr,_){
var ch__3132 = cljs.reader.read_char.call(null,rdr);
var dm__3133 = cljs.core.get.call(null,cljs.reader.dispatch_macros,ch__3132);

if(cljs.core.truth_(dm__3133))
{return dm__3133.call(null,rdr,_);
} else
{return cljs.reader.reader_error.call(null,rdr,"No dispatch macro for ",ch__3132);
}
});
cljs.reader.read_unmatched_delimiter = (function read_unmatched_delimiter(rdr,ch){
return cljs.reader.reader_error.call(null,rdr,"Unmached delimiter ",ch);
});
cljs.reader.read_list = (function read_list(rdr,_){
return cljs.core.apply.call(null,cljs.core.list,cljs.reader.read_delimited_list.call(null,")",rdr,true));
});
cljs.reader.read_comment = cljs.reader.skip_line;
cljs.reader.read_vector = (function read_vector(rdr,_){
return cljs.reader.read_delimited_list.call(null,"]",rdr,true);
});
cljs.reader.read_map = (function read_map(rdr,_){
var l__3134 = cljs.reader.read_delimited_list.call(null,"}",rdr,true);

if(cljs.core.truth_(cljs.core.odd_QMARK_.call(null,cljs.core.count.call(null,l__3134))))
{cljs.reader.reader_error.call(null,rdr,"Map literal must contain an even number of forms");
} else
{}
return cljs.core.apply.call(null,cljs.core.hash_map,l__3134);
});
cljs.reader.read_number = (function read_number(reader,initch){
var buffer__3135 = (new goog.string.StringBuffer(initch));
var ch__3136 = cljs.reader.read_char.call(null,reader);

while(true){
if(cljs.core.truth_((function (){var or__3548__auto____3137 = (ch__3136 === null);

if(cljs.core.truth_(or__3548__auto____3137))
{return or__3548__auto____3137;
} else
{var or__3548__auto____3138 = cljs.reader.whitespace_QMARK_.call(null,ch__3136);

if(cljs.core.truth_(or__3548__auto____3138))
{return or__3548__auto____3138;
} else
{return cljs.core.contains_QMARK_.call(null,cljs.reader.macros,ch__3136);
}
}
})()))
{cljs.reader.unread.call(null,reader,ch__3136);
var s__3139 = buffer__3135.toString();

var or__3548__auto____3140 = cljs.reader.match_number.call(null,s__3139);

if(cljs.core.truth_(or__3548__auto____3140))
{return or__3548__auto____3140;
} else
{return cljs.reader.reader_error.call(null,reader,"Invalid number format [",s__3139,"]");
}
} else
{{
var G__3141 = (function (){buffer__3135.append(ch__3136);
return buffer__3135;
})();
var G__3142 = cljs.reader.read_char.call(null,reader);
buffer__3135 = G__3141;
ch__3136 = G__3142;
continue;
}
}
break;
}
});
cljs.reader.read_string = (function read_string(reader,_){
var buffer__3143 = (new goog.string.StringBuffer());
var ch__3144 = cljs.reader.read_char.call(null,reader);

while(true){
if(cljs.core.truth_((ch__3144 === null)))
{return cljs.reader.reader_error.call(null,reader,"EOF while reading string");
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,"\\",ch__3144)))
{{
var G__3145 = (function (){buffer__3143.append(cljs.reader.escape_char.call(null,buffer__3143,reader));
return buffer__3143;
})();
var G__3146 = cljs.reader.read_char.call(null,reader);
buffer__3143 = G__3145;
ch__3144 = G__3146;
continue;
}
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,"\"",ch__3144)))
{return buffer__3143.toString();
} else
{if(cljs.core.truth_("\uFDD0'default"))
{{
var G__3147 = (function (){buffer__3143.append(ch__3144);
return buffer__3143;
})();
var G__3148 = cljs.reader.read_char.call(null,reader);
buffer__3143 = G__3147;
ch__3144 = G__3148;
continue;
}
} else
{return null;
}
}
}
}
break;
}
});
cljs.reader.special_symbols = cljs.core.ObjMap.fromObject(["nil","true","false"],{"nil":null,"true":true,"false":false});
cljs.reader.read_symbol = (function read_symbol(reader,initch){
var token__3149 = cljs.reader.read_token.call(null,reader,initch);

if(cljs.core.truth_(goog.string.contains.call(null,token__3149,"\/")))
{return cljs.core.symbol.call(null,cljs.core.subs.call(null,token__3149,0,token__3149.indexOf("\/")),cljs.core.subs.call(null,token__3149,(token__3149.indexOf("\/") + 1),token__3149.length));
} else
{return cljs.core.get.call(null,cljs.reader.special_symbols,token__3149,cljs.core.symbol.call(null,token__3149));
}
});
cljs.reader.read_keyword = (function read_keyword(reader,initch){
var token__3151 = cljs.reader.read_token.call(null,reader,cljs.reader.read_char.call(null,reader));
var vec__3150__3152 = cljs.core.re_matches.call(null,cljs.reader.symbol_pattern,token__3151);
var token__3153 = cljs.core.nth.call(null,vec__3150__3152,0,null);
var ns__3154 = cljs.core.nth.call(null,vec__3150__3152,1,null);
var name__3155 = cljs.core.nth.call(null,vec__3150__3152,2,null);

if(cljs.core.truth_((function (){var or__3548__auto____3157 = (function (){var and__3546__auto____3156 = cljs.core.not.call(null,(void 0 === ns__3154));

if(cljs.core.truth_(and__3546__auto____3156))
{return (ns__3154.substring((ns__3154.length - 2),ns__3154.length) === ":\/");
} else
{return and__3546__auto____3156;
}
})();

if(cljs.core.truth_(or__3548__auto____3157))
{return or__3548__auto____3157;
} else
{var or__3548__auto____3158 = ((name__3155[(name__3155.length - 1)]) === ":");

if(cljs.core.truth_(or__3548__auto____3158))
{return or__3548__auto____3158;
} else
{return cljs.core.not.call(null,(token__3153.indexOf("::",1) === -1));
}
}
})()))
{return cljs.reader.reader_error.call(null,reader,"Invalid token: ",token__3153);
} else
{if(cljs.core.truth_(cljs.reader.ns_QMARK_))
{return cljs.core.keyword.call(null,ns__3154.substring(0,ns__3154.indexOf("\/")),name__3155);
} else
{return cljs.core.keyword.call(null,token__3153);
}
}
});
cljs.reader.desugar_meta = (function desugar_meta(f){
if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null,f)))
{return cljs.core.ObjMap.fromObject(["\uFDD0'tag"],{"\uFDD0'tag":f});
} else
{if(cljs.core.truth_(cljs.core.string_QMARK_.call(null,f)))
{return cljs.core.ObjMap.fromObject(["\uFDD0'tag"],{"\uFDD0'tag":f});
} else
{if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null,f)))
{return cljs.core.HashMap.fromArrays([f],[true]);
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return f;
} else
{return null;
}
}
}
}
});
cljs.reader.wrapping_reader = (function wrapping_reader(sym){
return (function (rdr,_){
return cljs.core.list.call(null,sym,cljs.reader.read.call(null,rdr,true,null,true));
});
});
cljs.reader.throwing_reader = (function throwing_reader(msg){
return (function (rdr,_){
return cljs.reader.reader_error.call(null,rdr,msg);
});
});
cljs.reader.read_meta = (function read_meta(rdr,_){
var m__3159 = cljs.reader.desugar_meta.call(null,cljs.reader.read.call(null,rdr,true,null,true));

if(cljs.core.truth_(cljs.core.map_QMARK_.call(null,m__3159)))
{} else
{cljs.reader.reader_error.call(null,rdr,"Metadata must be Symbol,Keyword,String or Map");
}
var o__3160 = cljs.reader.read.call(null,rdr,true,null,true);

if(cljs.core.truth_((function (){var x__353__auto____3161 = o__3160;

if(cljs.core.truth_((function (){var and__3546__auto____3162 = x__353__auto____3161;

if(cljs.core.truth_(and__3546__auto____3162))
{var and__3546__auto____3163 = x__353__auto____3161.cljs$core$IWithMeta$;

if(cljs.core.truth_(and__3546__auto____3163))
{return cljs.core.not.call(null,x__353__auto____3161.hasOwnProperty("cljs$core$IWithMeta$"));
} else
{return and__3546__auto____3163;
}
} else
{return and__3546__auto____3162;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IWithMeta,x__353__auto____3161);
}
})()))
{return cljs.core.with_meta.call(null,o__3160,cljs.core.merge.call(null,cljs.core.meta.call(null,o__3160),m__3159));
} else
{return cljs.reader.reader_error.call(null,rdr,"Metadata can only be applied to IWithMetas");
}
});
cljs.reader.read_set = (function read_set(rdr,_){
return cljs.core.set.call(null,cljs.reader.read_delimited_list.call(null,"}",rdr,true));
});
cljs.reader.read_regex = (function read_regex(rdr,ch){
return cljs.core.re_pattern.call(null,cljs.reader.read_string.call(null,rdr,ch));
});
cljs.reader.read_discard = (function read_discard(rdr,_){
cljs.reader.read.call(null,rdr,true,null,true);
return rdr;
});
cljs.reader.macros = cljs.core.HashMap.fromArrays(["@","`","\"","#","%","'","(",")",":",";","[","{","\\","]","}","^","~"],[cljs.reader.wrapping_reader.call(null,"\uFDD1'deref"),cljs.reader.not_implemented,cljs.reader.read_string,cljs.reader.read_dispatch,cljs.reader.not_implemented,cljs.reader.wrapping_reader.call(null,"\uFDD1'quote"),cljs.reader.read_list,cljs.reader.read_unmatched_delimiter,cljs.reader.read_keyword,cljs.reader.not_implemented,cljs.reader.read_vector,cljs.reader.read_map,cljs.reader.read_char,cljs.reader.read_unmatched_delimiter,cljs.reader.read_unmatched_delimiter,cljs.reader.read_meta,cljs.reader.not_implemented]);
cljs.reader.dispatch_macros = cljs.core.ObjMap.fromObject(["{","<","\"","!","_"],{"{":cljs.reader.read_set,"<":cljs.reader.throwing_reader.call(null,"Unreadable form"),"\"":cljs.reader.read_regex,"!":cljs.reader.read_comment,"_":cljs.reader.read_discard});
/**
* Reads the first object from a PushbackReader. Returns the object read.
* If EOF, throws if eof-is-error is true. Otherwise returns sentinel.
*/
cljs.reader.read = (function read(reader,eof_is_error,sentinel,is_recursive){
while(true){
var ch__3164 = cljs.reader.read_char.call(null,reader);

if(cljs.core.truth_((ch__3164 === null)))
{if(cljs.core.truth_(eof_is_error))
{return cljs.reader.reader_error.call(null,reader,"EOF");
} else
{return sentinel;
}
} else
{if(cljs.core.truth_(cljs.reader.whitespace_QMARK_.call(null,ch__3164)))
{{
var G__3166 = reader;
var G__3167 = eof_is_error;
var G__3168 = sentinel;
var G__3169 = is_recursive;
reader = G__3166;
eof_is_error = G__3167;
sentinel = G__3168;
is_recursive = G__3169;
continue;
}
} else
{if(cljs.core.truth_(cljs.reader.comment_prefix_QMARK_.call(null,ch__3164)))
{{
var G__3170 = cljs.reader.read_comment.call(null,reader,ch__3164);
var G__3171 = eof_is_error;
var G__3172 = sentinel;
var G__3173 = is_recursive;
reader = G__3170;
eof_is_error = G__3171;
sentinel = G__3172;
is_recursive = G__3173;
continue;
}
} else
{if(cljs.core.truth_("\uFDD0'else"))
{var res__3165 = (cljs.core.truth_(cljs.reader.macros.call(null,ch__3164))?cljs.reader.macros.call(null,ch__3164).call(null,reader,ch__3164):(cljs.core.truth_(cljs.reader.number_literal_QMARK_.call(null,reader,ch__3164))?cljs.reader.read_number.call(null,reader,ch__3164):(cljs.core.truth_("\uFDD0'else")?cljs.reader.read_symbol.call(null,reader,ch__3164):null)));

if(cljs.core.truth_(cljs.core._EQ_.call(null,res__3165,reader)))
{{
var G__3174 = reader;
var G__3175 = eof_is_error;
var G__3176 = sentinel;
var G__3177 = is_recursive;
reader = G__3174;
eof_is_error = G__3175;
sentinel = G__3176;
is_recursive = G__3177;
continue;
}
} else
{return res__3165;
}
} else
{return null;
}
}
}
}
break;
}
});
/**
* Reads one object from the string s
*/
cljs.reader.read_string = (function read_string(s){
var r__3178 = cljs.reader.push_back_reader.call(null,s);

return cljs.reader.read.call(null,r__3178,true,null,false);
});

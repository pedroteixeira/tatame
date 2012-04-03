goog.provide('cljs.core');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');
goog.require('goog.object');
goog.require('goog.array');
/**
* Each runtime environment provides a diffenent way to print output.
* Whatever function *print-fn* is bound to will be passed any
* Strings which should be printed.
*/
cljs.core._STAR_print_fn_STAR_ = (function _STAR_print_fn_STAR_(_){
throw (new Error("No *print-fn* fn set for evaluation environment"));
});
/**
* Internal - do not use!
*/
cljs.core.truth_ = (function truth_(x){
return (x != null && x !== false);
});
/**
* Internal - do not use!
*/
cljs.core.type_satisfies_ = (function type_satisfies_(p,x){
var or__3548__auto____3179 = (p[goog.typeOf.call(null,x)]);

if(cljs.core.truth_(or__3548__auto____3179))
{return or__3548__auto____3179;
} else
{var or__3548__auto____3180 = (p["_"]);

if(cljs.core.truth_(or__3548__auto____3180))
{return or__3548__auto____3180;
} else
{return false;
}
}
});
cljs.core.is_proto_ = (function is_proto_(x){
return (x).constructor.prototype === x;
});
/**
* When compiled for a command-line target, whatever
* function *main-fn* is set to will be called with the command-line
* argv as arguments
*/
cljs.core._STAR_main_cli_fn_STAR_ = null;
cljs.core.missing_protocol = (function missing_protocol(proto,obj){
return Error.call(null,"No protocol method "+proto+" defined for type "+goog.typeOf.call(null,obj)+": "+obj);
});
/**
* Returns a javascript array, cloned from the passed in array
*/
cljs.core.aclone = (function aclone(array_like){
return Array.prototype.slice.call(array_like);
});
/**
* Creates a new javascript array.
* @param {...*} var_args
*/
cljs.core.array = (function array(var_args){
return Array.prototype.slice.call(arguments);
});
/**
* Returns the value at the index.
*/
cljs.core.aget = (function aget(array,i){
return (array[i]);
});
/**
* Sets the value at the index.
*/
cljs.core.aset = (function aset(array,i,val){
return (array[i] = val);
});
/**
* Returns the length of the Java array. Works on arrays of all types.
*/
cljs.core.alength = (function alength(array){
return array.length;
});
cljs.core.IFn = {};
cljs.core._invoke = (function() {
var _invoke = null;
var _invoke__3244 = (function (this$){
if(cljs.core.truth_((function (){var and__3546__auto____3181 = this$;

if(cljs.core.truth_(and__3546__auto____3181))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3181;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$);
} else
{return (function (){var or__3548__auto____3182 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3182))
{return or__3548__auto____3182;
} else
{var or__3548__auto____3183 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3183))
{return or__3548__auto____3183;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$);
}
});
var _invoke__3245 = (function (this$,a){
if(cljs.core.truth_((function (){var and__3546__auto____3184 = this$;

if(cljs.core.truth_(and__3546__auto____3184))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3184;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a);
} else
{return (function (){var or__3548__auto____3185 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3185))
{return or__3548__auto____3185;
} else
{var or__3548__auto____3186 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3186))
{return or__3548__auto____3186;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a);
}
});
var _invoke__3246 = (function (this$,a,b){
if(cljs.core.truth_((function (){var and__3546__auto____3187 = this$;

if(cljs.core.truth_(and__3546__auto____3187))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3187;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b);
} else
{return (function (){var or__3548__auto____3188 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3188))
{return or__3548__auto____3188;
} else
{var or__3548__auto____3189 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3189))
{return or__3548__auto____3189;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b);
}
});
var _invoke__3247 = (function (this$,a,b,c){
if(cljs.core.truth_((function (){var and__3546__auto____3190 = this$;

if(cljs.core.truth_(and__3546__auto____3190))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3190;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c);
} else
{return (function (){var or__3548__auto____3191 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3191))
{return or__3548__auto____3191;
} else
{var or__3548__auto____3192 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3192))
{return or__3548__auto____3192;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c);
}
});
var _invoke__3248 = (function (this$,a,b,c,d){
if(cljs.core.truth_((function (){var and__3546__auto____3193 = this$;

if(cljs.core.truth_(and__3546__auto____3193))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3193;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d);
} else
{return (function (){var or__3548__auto____3194 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3194))
{return or__3548__auto____3194;
} else
{var or__3548__auto____3195 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3195))
{return or__3548__auto____3195;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d);
}
});
var _invoke__3249 = (function (this$,a,b,c,d,e){
if(cljs.core.truth_((function (){var and__3546__auto____3196 = this$;

if(cljs.core.truth_(and__3546__auto____3196))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3196;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e);
} else
{return (function (){var or__3548__auto____3197 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3197))
{return or__3548__auto____3197;
} else
{var or__3548__auto____3198 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3198))
{return or__3548__auto____3198;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e);
}
});
var _invoke__3250 = (function (this$,a,b,c,d,e,f){
if(cljs.core.truth_((function (){var and__3546__auto____3199 = this$;

if(cljs.core.truth_(and__3546__auto____3199))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3199;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f);
} else
{return (function (){var or__3548__auto____3200 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3200))
{return or__3548__auto____3200;
} else
{var or__3548__auto____3201 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3201))
{return or__3548__auto____3201;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f);
}
});
var _invoke__3251 = (function (this$,a,b,c,d,e,f,g){
if(cljs.core.truth_((function (){var and__3546__auto____3202 = this$;

if(cljs.core.truth_(and__3546__auto____3202))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3202;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g);
} else
{return (function (){var or__3548__auto____3203 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3203))
{return or__3548__auto____3203;
} else
{var or__3548__auto____3204 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3204))
{return or__3548__auto____3204;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g);
}
});
var _invoke__3252 = (function (this$,a,b,c,d,e,f,g,h){
if(cljs.core.truth_((function (){var and__3546__auto____3205 = this$;

if(cljs.core.truth_(and__3546__auto____3205))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3205;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h);
} else
{return (function (){var or__3548__auto____3206 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3206))
{return or__3548__auto____3206;
} else
{var or__3548__auto____3207 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3207))
{return or__3548__auto____3207;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h);
}
});
var _invoke__3253 = (function (this$,a,b,c,d,e,f,g,h,i){
if(cljs.core.truth_((function (){var and__3546__auto____3208 = this$;

if(cljs.core.truth_(and__3546__auto____3208))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3208;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i);
} else
{return (function (){var or__3548__auto____3209 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3209))
{return or__3548__auto____3209;
} else
{var or__3548__auto____3210 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3210))
{return or__3548__auto____3210;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i);
}
});
var _invoke__3254 = (function (this$,a,b,c,d,e,f,g,h,i,j){
if(cljs.core.truth_((function (){var and__3546__auto____3211 = this$;

if(cljs.core.truth_(and__3546__auto____3211))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3211;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j);
} else
{return (function (){var or__3548__auto____3212 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3212))
{return or__3548__auto____3212;
} else
{var or__3548__auto____3213 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3213))
{return or__3548__auto____3213;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j);
}
});
var _invoke__3255 = (function (this$,a,b,c,d,e,f,g,h,i,j,k){
if(cljs.core.truth_((function (){var and__3546__auto____3214 = this$;

if(cljs.core.truth_(and__3546__auto____3214))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3214;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k);
} else
{return (function (){var or__3548__auto____3215 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3215))
{return or__3548__auto____3215;
} else
{var or__3548__auto____3216 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3216))
{return or__3548__auto____3216;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k);
}
});
var _invoke__3256 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l){
if(cljs.core.truth_((function (){var and__3546__auto____3217 = this$;

if(cljs.core.truth_(and__3546__auto____3217))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3217;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l);
} else
{return (function (){var or__3548__auto____3218 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3218))
{return or__3548__auto____3218;
} else
{var or__3548__auto____3219 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3219))
{return or__3548__auto____3219;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l);
}
});
var _invoke__3257 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m){
if(cljs.core.truth_((function (){var and__3546__auto____3220 = this$;

if(cljs.core.truth_(and__3546__auto____3220))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3220;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m);
} else
{return (function (){var or__3548__auto____3221 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3221))
{return or__3548__auto____3221;
} else
{var or__3548__auto____3222 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3222))
{return or__3548__auto____3222;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m);
}
});
var _invoke__3258 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n){
if(cljs.core.truth_((function (){var and__3546__auto____3223 = this$;

if(cljs.core.truth_(and__3546__auto____3223))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3223;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n);
} else
{return (function (){var or__3548__auto____3224 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3224))
{return or__3548__auto____3224;
} else
{var or__3548__auto____3225 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3225))
{return or__3548__auto____3225;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n);
}
});
var _invoke__3259 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o){
if(cljs.core.truth_((function (){var and__3546__auto____3226 = this$;

if(cljs.core.truth_(and__3546__auto____3226))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3226;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
} else
{return (function (){var or__3548__auto____3227 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3227))
{return or__3548__auto____3227;
} else
{var or__3548__auto____3228 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3228))
{return or__3548__auto____3228;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
}
});
var _invoke__3260 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){
if(cljs.core.truth_((function (){var and__3546__auto____3229 = this$;

if(cljs.core.truth_(and__3546__auto____3229))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3229;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
} else
{return (function (){var or__3548__auto____3230 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3230))
{return or__3548__auto____3230;
} else
{var or__3548__auto____3231 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3231))
{return or__3548__auto____3231;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
}
});
var _invoke__3261 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q){
if(cljs.core.truth_((function (){var and__3546__auto____3232 = this$;

if(cljs.core.truth_(and__3546__auto____3232))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3232;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q);
} else
{return (function (){var or__3548__auto____3233 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3233))
{return or__3548__auto____3233;
} else
{var or__3548__auto____3234 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3234))
{return or__3548__auto____3234;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q);
}
});
var _invoke__3262 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s){
if(cljs.core.truth_((function (){var and__3546__auto____3235 = this$;

if(cljs.core.truth_(and__3546__auto____3235))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3235;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s);
} else
{return (function (){var or__3548__auto____3236 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3236))
{return or__3548__auto____3236;
} else
{var or__3548__auto____3237 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3237))
{return or__3548__auto____3237;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s);
}
});
var _invoke__3263 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t){
if(cljs.core.truth_((function (){var and__3546__auto____3238 = this$;

if(cljs.core.truth_(and__3546__auto____3238))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3238;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t);
} else
{return (function (){var or__3548__auto____3239 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3239))
{return or__3548__auto____3239;
} else
{var or__3548__auto____3240 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3240))
{return or__3548__auto____3240;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t);
}
});
var _invoke__3264 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest){
if(cljs.core.truth_((function (){var and__3546__auto____3241 = this$;

if(cljs.core.truth_(and__3546__auto____3241))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3241;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest);
} else
{return (function (){var or__3548__auto____3242 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3242))
{return or__3548__auto____3242;
} else
{var or__3548__auto____3243 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3243))
{return or__3548__auto____3243;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest);
}
});
_invoke = function(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest){
switch(arguments.length){
case  1 :
return _invoke__3244.call(this,this$);
case  2 :
return _invoke__3245.call(this,this$,a);
case  3 :
return _invoke__3246.call(this,this$,a,b);
case  4 :
return _invoke__3247.call(this,this$,a,b,c);
case  5 :
return _invoke__3248.call(this,this$,a,b,c,d);
case  6 :
return _invoke__3249.call(this,this$,a,b,c,d,e);
case  7 :
return _invoke__3250.call(this,this$,a,b,c,d,e,f);
case  8 :
return _invoke__3251.call(this,this$,a,b,c,d,e,f,g);
case  9 :
return _invoke__3252.call(this,this$,a,b,c,d,e,f,g,h);
case  10 :
return _invoke__3253.call(this,this$,a,b,c,d,e,f,g,h,i);
case  11 :
return _invoke__3254.call(this,this$,a,b,c,d,e,f,g,h,i,j);
case  12 :
return _invoke__3255.call(this,this$,a,b,c,d,e,f,g,h,i,j,k);
case  13 :
return _invoke__3256.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l);
case  14 :
return _invoke__3257.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m);
case  15 :
return _invoke__3258.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n);
case  16 :
return _invoke__3259.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
case  17 :
return _invoke__3260.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
case  18 :
return _invoke__3261.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q);
case  19 :
return _invoke__3262.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s);
case  20 :
return _invoke__3263.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t);
case  21 :
return _invoke__3264.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest);
}
throw('Invalid arity: ' + arguments.length);
};
return _invoke;
})()
;
cljs.core.ICounted = {};
cljs.core._count = (function _count(coll){
if(cljs.core.truth_((function (){var and__3546__auto____3266 = coll;

if(cljs.core.truth_(and__3546__auto____3266))
{return coll.cljs$core$ICounted$_count;
} else
{return and__3546__auto____3266;
}
})()))
{return coll.cljs$core$ICounted$_count(coll);
} else
{return (function (){var or__3548__auto____3267 = (cljs.core._count[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3267))
{return or__3548__auto____3267;
} else
{var or__3548__auto____3268 = (cljs.core._count["_"]);

if(cljs.core.truth_(or__3548__auto____3268))
{return or__3548__auto____3268;
} else
{throw cljs.core.missing_protocol.call(null,"ICounted.-count",coll);
}
}
})().call(null,coll);
}
});
cljs.core.IEmptyableCollection = {};
cljs.core._empty = (function _empty(coll){
if(cljs.core.truth_((function (){var and__3546__auto____3269 = coll;

if(cljs.core.truth_(and__3546__auto____3269))
{return coll.cljs$core$IEmptyableCollection$_empty;
} else
{return and__3546__auto____3269;
}
})()))
{return coll.cljs$core$IEmptyableCollection$_empty(coll);
} else
{return (function (){var or__3548__auto____3270 = (cljs.core._empty[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3270))
{return or__3548__auto____3270;
} else
{var or__3548__auto____3271 = (cljs.core._empty["_"]);

if(cljs.core.truth_(or__3548__auto____3271))
{return or__3548__auto____3271;
} else
{throw cljs.core.missing_protocol.call(null,"IEmptyableCollection.-empty",coll);
}
}
})().call(null,coll);
}
});
cljs.core.ICollection = {};
cljs.core._conj = (function _conj(coll,o){
if(cljs.core.truth_((function (){var and__3546__auto____3272 = coll;

if(cljs.core.truth_(and__3546__auto____3272))
{return coll.cljs$core$ICollection$_conj;
} else
{return and__3546__auto____3272;
}
})()))
{return coll.cljs$core$ICollection$_conj(coll,o);
} else
{return (function (){var or__3548__auto____3273 = (cljs.core._conj[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3273))
{return or__3548__auto____3273;
} else
{var or__3548__auto____3274 = (cljs.core._conj["_"]);

if(cljs.core.truth_(or__3548__auto____3274))
{return or__3548__auto____3274;
} else
{throw cljs.core.missing_protocol.call(null,"ICollection.-conj",coll);
}
}
})().call(null,coll,o);
}
});
cljs.core.IIndexed = {};
cljs.core._nth = (function() {
var _nth = null;
var _nth__3281 = (function (coll,n){
if(cljs.core.truth_((function (){var and__3546__auto____3275 = coll;

if(cljs.core.truth_(and__3546__auto____3275))
{return coll.cljs$core$IIndexed$_nth;
} else
{return and__3546__auto____3275;
}
})()))
{return coll.cljs$core$IIndexed$_nth(coll,n);
} else
{return (function (){var or__3548__auto____3276 = (cljs.core._nth[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3276))
{return or__3548__auto____3276;
} else
{var or__3548__auto____3277 = (cljs.core._nth["_"]);

if(cljs.core.truth_(or__3548__auto____3277))
{return or__3548__auto____3277;
} else
{throw cljs.core.missing_protocol.call(null,"IIndexed.-nth",coll);
}
}
})().call(null,coll,n);
}
});
var _nth__3282 = (function (coll,n,not_found){
if(cljs.core.truth_((function (){var and__3546__auto____3278 = coll;

if(cljs.core.truth_(and__3546__auto____3278))
{return coll.cljs$core$IIndexed$_nth;
} else
{return and__3546__auto____3278;
}
})()))
{return coll.cljs$core$IIndexed$_nth(coll,n,not_found);
} else
{return (function (){var or__3548__auto____3279 = (cljs.core._nth[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3279))
{return or__3548__auto____3279;
} else
{var or__3548__auto____3280 = (cljs.core._nth["_"]);

if(cljs.core.truth_(or__3548__auto____3280))
{return or__3548__auto____3280;
} else
{throw cljs.core.missing_protocol.call(null,"IIndexed.-nth",coll);
}
}
})().call(null,coll,n,not_found);
}
});
_nth = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return _nth__3281.call(this,coll,n);
case  3 :
return _nth__3282.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return _nth;
})()
;
cljs.core.ISeq = {};
cljs.core._first = (function _first(coll){
if(cljs.core.truth_((function (){var and__3546__auto____3284 = coll;

if(cljs.core.truth_(and__3546__auto____3284))
{return coll.cljs$core$ISeq$_first;
} else
{return and__3546__auto____3284;
}
})()))
{return coll.cljs$core$ISeq$_first(coll);
} else
{return (function (){var or__3548__auto____3285 = (cljs.core._first[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3285))
{return or__3548__auto____3285;
} else
{var or__3548__auto____3286 = (cljs.core._first["_"]);

if(cljs.core.truth_(or__3548__auto____3286))
{return or__3548__auto____3286;
} else
{throw cljs.core.missing_protocol.call(null,"ISeq.-first",coll);
}
}
})().call(null,coll);
}
});
cljs.core._rest = (function _rest(coll){
if(cljs.core.truth_((function (){var and__3546__auto____3287 = coll;

if(cljs.core.truth_(and__3546__auto____3287))
{return coll.cljs$core$ISeq$_rest;
} else
{return and__3546__auto____3287;
}
})()))
{return coll.cljs$core$ISeq$_rest(coll);
} else
{return (function (){var or__3548__auto____3288 = (cljs.core._rest[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3288))
{return or__3548__auto____3288;
} else
{var or__3548__auto____3289 = (cljs.core._rest["_"]);

if(cljs.core.truth_(or__3548__auto____3289))
{return or__3548__auto____3289;
} else
{throw cljs.core.missing_protocol.call(null,"ISeq.-rest",coll);
}
}
})().call(null,coll);
}
});
cljs.core.ILookup = {};
cljs.core._lookup = (function() {
var _lookup = null;
var _lookup__3296 = (function (o,k){
if(cljs.core.truth_((function (){var and__3546__auto____3290 = o;

if(cljs.core.truth_(and__3546__auto____3290))
{return o.cljs$core$ILookup$_lookup;
} else
{return and__3546__auto____3290;
}
})()))
{return o.cljs$core$ILookup$_lookup(o,k);
} else
{return (function (){var or__3548__auto____3291 = (cljs.core._lookup[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3291))
{return or__3548__auto____3291;
} else
{var or__3548__auto____3292 = (cljs.core._lookup["_"]);

if(cljs.core.truth_(or__3548__auto____3292))
{return or__3548__auto____3292;
} else
{throw cljs.core.missing_protocol.call(null,"ILookup.-lookup",o);
}
}
})().call(null,o,k);
}
});
var _lookup__3297 = (function (o,k,not_found){
if(cljs.core.truth_((function (){var and__3546__auto____3293 = o;

if(cljs.core.truth_(and__3546__auto____3293))
{return o.cljs$core$ILookup$_lookup;
} else
{return and__3546__auto____3293;
}
})()))
{return o.cljs$core$ILookup$_lookup(o,k,not_found);
} else
{return (function (){var or__3548__auto____3294 = (cljs.core._lookup[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3294))
{return or__3548__auto____3294;
} else
{var or__3548__auto____3295 = (cljs.core._lookup["_"]);

if(cljs.core.truth_(or__3548__auto____3295))
{return or__3548__auto____3295;
} else
{throw cljs.core.missing_protocol.call(null,"ILookup.-lookup",o);
}
}
})().call(null,o,k,not_found);
}
});
_lookup = function(o,k,not_found){
switch(arguments.length){
case  2 :
return _lookup__3296.call(this,o,k);
case  3 :
return _lookup__3297.call(this,o,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return _lookup;
})()
;
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = (function _contains_key_QMARK_(coll,k){
if(cljs.core.truth_((function (){var and__3546__auto____3299 = coll;

if(cljs.core.truth_(and__3546__auto____3299))
{return coll.cljs$core$IAssociative$_contains_key_QMARK_;
} else
{return and__3546__auto____3299;
}
})()))
{return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll,k);
} else
{return (function (){var or__3548__auto____3300 = (cljs.core._contains_key_QMARK_[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3300))
{return or__3548__auto____3300;
} else
{var or__3548__auto____3301 = (cljs.core._contains_key_QMARK_["_"]);

if(cljs.core.truth_(or__3548__auto____3301))
{return or__3548__auto____3301;
} else
{throw cljs.core.missing_protocol.call(null,"IAssociative.-contains-key?",coll);
}
}
})().call(null,coll,k);
}
});
cljs.core._assoc = (function _assoc(coll,k,v){
if(cljs.core.truth_((function (){var and__3546__auto____3302 = coll;

if(cljs.core.truth_(and__3546__auto____3302))
{return coll.cljs$core$IAssociative$_assoc;
} else
{return and__3546__auto____3302;
}
})()))
{return coll.cljs$core$IAssociative$_assoc(coll,k,v);
} else
{return (function (){var or__3548__auto____3303 = (cljs.core._assoc[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3303))
{return or__3548__auto____3303;
} else
{var or__3548__auto____3304 = (cljs.core._assoc["_"]);

if(cljs.core.truth_(or__3548__auto____3304))
{return or__3548__auto____3304;
} else
{throw cljs.core.missing_protocol.call(null,"IAssociative.-assoc",coll);
}
}
})().call(null,coll,k,v);
}
});
cljs.core.IMap = {};
cljs.core._dissoc = (function _dissoc(coll,k){
if(cljs.core.truth_((function (){var and__3546__auto____3305 = coll;

if(cljs.core.truth_(and__3546__auto____3305))
{return coll.cljs$core$IMap$_dissoc;
} else
{return and__3546__auto____3305;
}
})()))
{return coll.cljs$core$IMap$_dissoc(coll,k);
} else
{return (function (){var or__3548__auto____3306 = (cljs.core._dissoc[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3306))
{return or__3548__auto____3306;
} else
{var or__3548__auto____3307 = (cljs.core._dissoc["_"]);

if(cljs.core.truth_(or__3548__auto____3307))
{return or__3548__auto____3307;
} else
{throw cljs.core.missing_protocol.call(null,"IMap.-dissoc",coll);
}
}
})().call(null,coll,k);
}
});
cljs.core.ISet = {};
cljs.core._disjoin = (function _disjoin(coll,v){
if(cljs.core.truth_((function (){var and__3546__auto____3308 = coll;

if(cljs.core.truth_(and__3546__auto____3308))
{return coll.cljs$core$ISet$_disjoin;
} else
{return and__3546__auto____3308;
}
})()))
{return coll.cljs$core$ISet$_disjoin(coll,v);
} else
{return (function (){var or__3548__auto____3309 = (cljs.core._disjoin[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3309))
{return or__3548__auto____3309;
} else
{var or__3548__auto____3310 = (cljs.core._disjoin["_"]);

if(cljs.core.truth_(or__3548__auto____3310))
{return or__3548__auto____3310;
} else
{throw cljs.core.missing_protocol.call(null,"ISet.-disjoin",coll);
}
}
})().call(null,coll,v);
}
});
cljs.core.IStack = {};
cljs.core._peek = (function _peek(coll){
if(cljs.core.truth_((function (){var and__3546__auto____3311 = coll;

if(cljs.core.truth_(and__3546__auto____3311))
{return coll.cljs$core$IStack$_peek;
} else
{return and__3546__auto____3311;
}
})()))
{return coll.cljs$core$IStack$_peek(coll);
} else
{return (function (){var or__3548__auto____3312 = (cljs.core._peek[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3312))
{return or__3548__auto____3312;
} else
{var or__3548__auto____3313 = (cljs.core._peek["_"]);

if(cljs.core.truth_(or__3548__auto____3313))
{return or__3548__auto____3313;
} else
{throw cljs.core.missing_protocol.call(null,"IStack.-peek",coll);
}
}
})().call(null,coll);
}
});
cljs.core._pop = (function _pop(coll){
if(cljs.core.truth_((function (){var and__3546__auto____3314 = coll;

if(cljs.core.truth_(and__3546__auto____3314))
{return coll.cljs$core$IStack$_pop;
} else
{return and__3546__auto____3314;
}
})()))
{return coll.cljs$core$IStack$_pop(coll);
} else
{return (function (){var or__3548__auto____3315 = (cljs.core._pop[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3315))
{return or__3548__auto____3315;
} else
{var or__3548__auto____3316 = (cljs.core._pop["_"]);

if(cljs.core.truth_(or__3548__auto____3316))
{return or__3548__auto____3316;
} else
{throw cljs.core.missing_protocol.call(null,"IStack.-pop",coll);
}
}
})().call(null,coll);
}
});
cljs.core.IVector = {};
cljs.core._assoc_n = (function _assoc_n(coll,n,val){
if(cljs.core.truth_((function (){var and__3546__auto____3317 = coll;

if(cljs.core.truth_(and__3546__auto____3317))
{return coll.cljs$core$IVector$_assoc_n;
} else
{return and__3546__auto____3317;
}
})()))
{return coll.cljs$core$IVector$_assoc_n(coll,n,val);
} else
{return (function (){var or__3548__auto____3318 = (cljs.core._assoc_n[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3318))
{return or__3548__auto____3318;
} else
{var or__3548__auto____3319 = (cljs.core._assoc_n["_"]);

if(cljs.core.truth_(or__3548__auto____3319))
{return or__3548__auto____3319;
} else
{throw cljs.core.missing_protocol.call(null,"IVector.-assoc-n",coll);
}
}
})().call(null,coll,n,val);
}
});
cljs.core.IDeref = {};
cljs.core._deref = (function _deref(o){
if(cljs.core.truth_((function (){var and__3546__auto____3320 = o;

if(cljs.core.truth_(and__3546__auto____3320))
{return o.cljs$core$IDeref$_deref;
} else
{return and__3546__auto____3320;
}
})()))
{return o.cljs$core$IDeref$_deref(o);
} else
{return (function (){var or__3548__auto____3321 = (cljs.core._deref[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3321))
{return or__3548__auto____3321;
} else
{var or__3548__auto____3322 = (cljs.core._deref["_"]);

if(cljs.core.truth_(or__3548__auto____3322))
{return or__3548__auto____3322;
} else
{throw cljs.core.missing_protocol.call(null,"IDeref.-deref",o);
}
}
})().call(null,o);
}
});
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = (function _deref_with_timeout(o,msec,timeout_val){
if(cljs.core.truth_((function (){var and__3546__auto____3323 = o;

if(cljs.core.truth_(and__3546__auto____3323))
{return o.cljs$core$IDerefWithTimeout$_deref_with_timeout;
} else
{return and__3546__auto____3323;
}
})()))
{return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o,msec,timeout_val);
} else
{return (function (){var or__3548__auto____3324 = (cljs.core._deref_with_timeout[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3324))
{return or__3548__auto____3324;
} else
{var or__3548__auto____3325 = (cljs.core._deref_with_timeout["_"]);

if(cljs.core.truth_(or__3548__auto____3325))
{return or__3548__auto____3325;
} else
{throw cljs.core.missing_protocol.call(null,"IDerefWithTimeout.-deref-with-timeout",o);
}
}
})().call(null,o,msec,timeout_val);
}
});
cljs.core.IMeta = {};
cljs.core._meta = (function _meta(o){
if(cljs.core.truth_((function (){var and__3546__auto____3326 = o;

if(cljs.core.truth_(and__3546__auto____3326))
{return o.cljs$core$IMeta$_meta;
} else
{return and__3546__auto____3326;
}
})()))
{return o.cljs$core$IMeta$_meta(o);
} else
{return (function (){var or__3548__auto____3327 = (cljs.core._meta[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3327))
{return or__3548__auto____3327;
} else
{var or__3548__auto____3328 = (cljs.core._meta["_"]);

if(cljs.core.truth_(or__3548__auto____3328))
{return or__3548__auto____3328;
} else
{throw cljs.core.missing_protocol.call(null,"IMeta.-meta",o);
}
}
})().call(null,o);
}
});
cljs.core.IWithMeta = {};
cljs.core._with_meta = (function _with_meta(o,meta){
if(cljs.core.truth_((function (){var and__3546__auto____3329 = o;

if(cljs.core.truth_(and__3546__auto____3329))
{return o.cljs$core$IWithMeta$_with_meta;
} else
{return and__3546__auto____3329;
}
})()))
{return o.cljs$core$IWithMeta$_with_meta(o,meta);
} else
{return (function (){var or__3548__auto____3330 = (cljs.core._with_meta[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3330))
{return or__3548__auto____3330;
} else
{var or__3548__auto____3331 = (cljs.core._with_meta["_"]);

if(cljs.core.truth_(or__3548__auto____3331))
{return or__3548__auto____3331;
} else
{throw cljs.core.missing_protocol.call(null,"IWithMeta.-with-meta",o);
}
}
})().call(null,o,meta);
}
});
cljs.core.IReduce = {};
cljs.core._reduce = (function() {
var _reduce = null;
var _reduce__3338 = (function (coll,f){
if(cljs.core.truth_((function (){var and__3546__auto____3332 = coll;

if(cljs.core.truth_(and__3546__auto____3332))
{return coll.cljs$core$IReduce$_reduce;
} else
{return and__3546__auto____3332;
}
})()))
{return coll.cljs$core$IReduce$_reduce(coll,f);
} else
{return (function (){var or__3548__auto____3333 = (cljs.core._reduce[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3333))
{return or__3548__auto____3333;
} else
{var or__3548__auto____3334 = (cljs.core._reduce["_"]);

if(cljs.core.truth_(or__3548__auto____3334))
{return or__3548__auto____3334;
} else
{throw cljs.core.missing_protocol.call(null,"IReduce.-reduce",coll);
}
}
})().call(null,coll,f);
}
});
var _reduce__3339 = (function (coll,f,start){
if(cljs.core.truth_((function (){var and__3546__auto____3335 = coll;

if(cljs.core.truth_(and__3546__auto____3335))
{return coll.cljs$core$IReduce$_reduce;
} else
{return and__3546__auto____3335;
}
})()))
{return coll.cljs$core$IReduce$_reduce(coll,f,start);
} else
{return (function (){var or__3548__auto____3336 = (cljs.core._reduce[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____3336))
{return or__3548__auto____3336;
} else
{var or__3548__auto____3337 = (cljs.core._reduce["_"]);

if(cljs.core.truth_(or__3548__auto____3337))
{return or__3548__auto____3337;
} else
{throw cljs.core.missing_protocol.call(null,"IReduce.-reduce",coll);
}
}
})().call(null,coll,f,start);
}
});
_reduce = function(coll,f,start){
switch(arguments.length){
case  2 :
return _reduce__3338.call(this,coll,f);
case  3 :
return _reduce__3339.call(this,coll,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return _reduce;
})()
;
cljs.core.IEquiv = {};
cljs.core._equiv = (function _equiv(o,other){
if(cljs.core.truth_((function (){var and__3546__auto____3341 = o;

if(cljs.core.truth_(and__3546__auto____3341))
{return o.cljs$core$IEquiv$_equiv;
} else
{return and__3546__auto____3341;
}
})()))
{return o.cljs$core$IEquiv$_equiv(o,other);
} else
{return (function (){var or__3548__auto____3342 = (cljs.core._equiv[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3342))
{return or__3548__auto____3342;
} else
{var or__3548__auto____3343 = (cljs.core._equiv["_"]);

if(cljs.core.truth_(or__3548__auto____3343))
{return or__3548__auto____3343;
} else
{throw cljs.core.missing_protocol.call(null,"IEquiv.-equiv",o);
}
}
})().call(null,o,other);
}
});
cljs.core.IHash = {};
cljs.core._hash = (function _hash(o){
if(cljs.core.truth_((function (){var and__3546__auto____3344 = o;

if(cljs.core.truth_(and__3546__auto____3344))
{return o.cljs$core$IHash$_hash;
} else
{return and__3546__auto____3344;
}
})()))
{return o.cljs$core$IHash$_hash(o);
} else
{return (function (){var or__3548__auto____3345 = (cljs.core._hash[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3345))
{return or__3548__auto____3345;
} else
{var or__3548__auto____3346 = (cljs.core._hash["_"]);

if(cljs.core.truth_(or__3548__auto____3346))
{return or__3548__auto____3346;
} else
{throw cljs.core.missing_protocol.call(null,"IHash.-hash",o);
}
}
})().call(null,o);
}
});
cljs.core.ISeqable = {};
cljs.core._seq = (function _seq(o){
if(cljs.core.truth_((function (){var and__3546__auto____3347 = o;

if(cljs.core.truth_(and__3546__auto____3347))
{return o.cljs$core$ISeqable$_seq;
} else
{return and__3546__auto____3347;
}
})()))
{return o.cljs$core$ISeqable$_seq(o);
} else
{return (function (){var or__3548__auto____3348 = (cljs.core._seq[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3348))
{return or__3548__auto____3348;
} else
{var or__3548__auto____3349 = (cljs.core._seq["_"]);

if(cljs.core.truth_(or__3548__auto____3349))
{return or__3548__auto____3349;
} else
{throw cljs.core.missing_protocol.call(null,"ISeqable.-seq",o);
}
}
})().call(null,o);
}
});
cljs.core.ISequential = {};
cljs.core.IRecord = {};
cljs.core.IPrintable = {};
cljs.core._pr_seq = (function _pr_seq(o,opts){
if(cljs.core.truth_((function (){var and__3546__auto____3350 = o;

if(cljs.core.truth_(and__3546__auto____3350))
{return o.cljs$core$IPrintable$_pr_seq;
} else
{return and__3546__auto____3350;
}
})()))
{return o.cljs$core$IPrintable$_pr_seq(o,opts);
} else
{return (function (){var or__3548__auto____3351 = (cljs.core._pr_seq[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____3351))
{return or__3548__auto____3351;
} else
{var or__3548__auto____3352 = (cljs.core._pr_seq["_"]);

if(cljs.core.truth_(or__3548__auto____3352))
{return or__3548__auto____3352;
} else
{throw cljs.core.missing_protocol.call(null,"IPrintable.-pr-seq",o);
}
}
})().call(null,o,opts);
}
});
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = (function _realized_QMARK_(d){
if(cljs.core.truth_((function (){var and__3546__auto____3353 = d;

if(cljs.core.truth_(and__3546__auto____3353))
{return d.cljs$core$IPending$_realized_QMARK_;
} else
{return and__3546__auto____3353;
}
})()))
{return d.cljs$core$IPending$_realized_QMARK_(d);
} else
{return (function (){var or__3548__auto____3354 = (cljs.core._realized_QMARK_[goog.typeOf.call(null,d)]);

if(cljs.core.truth_(or__3548__auto____3354))
{return or__3548__auto____3354;
} else
{var or__3548__auto____3355 = (cljs.core._realized_QMARK_["_"]);

if(cljs.core.truth_(or__3548__auto____3355))
{return or__3548__auto____3355;
} else
{throw cljs.core.missing_protocol.call(null,"IPending.-realized?",d);
}
}
})().call(null,d);
}
});
cljs.core.IWatchable = {};
cljs.core._notify_watches = (function _notify_watches(this$,oldval,newval){
if(cljs.core.truth_((function (){var and__3546__auto____3356 = this$;

if(cljs.core.truth_(and__3546__auto____3356))
{return this$.cljs$core$IWatchable$_notify_watches;
} else
{return and__3546__auto____3356;
}
})()))
{return this$.cljs$core$IWatchable$_notify_watches(this$,oldval,newval);
} else
{return (function (){var or__3548__auto____3357 = (cljs.core._notify_watches[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3357))
{return or__3548__auto____3357;
} else
{var or__3548__auto____3358 = (cljs.core._notify_watches["_"]);

if(cljs.core.truth_(or__3548__auto____3358))
{return or__3548__auto____3358;
} else
{throw cljs.core.missing_protocol.call(null,"IWatchable.-notify-watches",this$);
}
}
})().call(null,this$,oldval,newval);
}
});
cljs.core._add_watch = (function _add_watch(this$,key,f){
if(cljs.core.truth_((function (){var and__3546__auto____3359 = this$;

if(cljs.core.truth_(and__3546__auto____3359))
{return this$.cljs$core$IWatchable$_add_watch;
} else
{return and__3546__auto____3359;
}
})()))
{return this$.cljs$core$IWatchable$_add_watch(this$,key,f);
} else
{return (function (){var or__3548__auto____3360 = (cljs.core._add_watch[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3360))
{return or__3548__auto____3360;
} else
{var or__3548__auto____3361 = (cljs.core._add_watch["_"]);

if(cljs.core.truth_(or__3548__auto____3361))
{return or__3548__auto____3361;
} else
{throw cljs.core.missing_protocol.call(null,"IWatchable.-add-watch",this$);
}
}
})().call(null,this$,key,f);
}
});
cljs.core._remove_watch = (function _remove_watch(this$,key){
if(cljs.core.truth_((function (){var and__3546__auto____3362 = this$;

if(cljs.core.truth_(and__3546__auto____3362))
{return this$.cljs$core$IWatchable$_remove_watch;
} else
{return and__3546__auto____3362;
}
})()))
{return this$.cljs$core$IWatchable$_remove_watch(this$,key);
} else
{return (function (){var or__3548__auto____3363 = (cljs.core._remove_watch[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3363))
{return or__3548__auto____3363;
} else
{var or__3548__auto____3364 = (cljs.core._remove_watch["_"]);

if(cljs.core.truth_(or__3548__auto____3364))
{return or__3548__auto____3364;
} else
{throw cljs.core.missing_protocol.call(null,"IWatchable.-remove-watch",this$);
}
}
})().call(null,this$,key);
}
});
/**
* Tests if 2 arguments are the same object
*/
cljs.core.identical_QMARK_ = (function identical_QMARK_(x,y){
return (x === y);
});
/**
* Equality. Returns true if x equals y, false if not. Compares
* numbers and collections in a type-independent manner.  Clojure's immutable data
* structures define -equiv (and thus =) as a value, not an identity,
* comparison.
*/
cljs.core._EQ_ = (function _EQ_(x,y){
return cljs.core._equiv.call(null,x,y);
});
/**
* Returns true if x is nil, false otherwise.
*/
cljs.core.nil_QMARK_ = (function nil_QMARK_(x){
return (x === null);
});
cljs.core.type = (function type(x){
return (x).constructor;
});
(cljs.core.IHash["null"] = true);
(cljs.core._hash["null"] = (function (o){
return 0;
}));
(cljs.core.ILookup["null"] = true);
(cljs.core._lookup["null"] = (function() {
var G__3365 = null;
var G__3365__3366 = (function (o,k){
return null;
});
var G__3365__3367 = (function (o,k,not_found){
return not_found;
});
G__3365 = function(o,k,not_found){
switch(arguments.length){
case  2 :
return G__3365__3366.call(this,o,k);
case  3 :
return G__3365__3367.call(this,o,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3365;
})()
);
(cljs.core.IAssociative["null"] = true);
(cljs.core._assoc["null"] = (function (_,k,v){
return cljs.core.hash_map.call(null,k,v);
}));
(cljs.core.ICollection["null"] = true);
(cljs.core._conj["null"] = (function (_,o){
return cljs.core.list.call(null,o);
}));
(cljs.core.IReduce["null"] = true);
(cljs.core._reduce["null"] = (function() {
var G__3369 = null;
var G__3369__3370 = (function (_,f){
return f.call(null);
});
var G__3369__3371 = (function (_,f,start){
return start;
});
G__3369 = function(_,f,start){
switch(arguments.length){
case  2 :
return G__3369__3370.call(this,_,f);
case  3 :
return G__3369__3371.call(this,_,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3369;
})()
);
(cljs.core.IPrintable["null"] = true);
(cljs.core._pr_seq["null"] = (function (o){
return cljs.core.list.call(null,"nil");
}));
(cljs.core.ISet["null"] = true);
(cljs.core._disjoin["null"] = (function (_,v){
return null;
}));
(cljs.core.ICounted["null"] = true);
(cljs.core._count["null"] = (function (_){
return 0;
}));
(cljs.core.IStack["null"] = true);
(cljs.core._peek["null"] = (function (_){
return null;
}));
(cljs.core._pop["null"] = (function (_){
return null;
}));
(cljs.core.ISeq["null"] = true);
(cljs.core._first["null"] = (function (_){
return null;
}));
(cljs.core._rest["null"] = (function (_){
return cljs.core.list.call(null);
}));
(cljs.core.IEquiv["null"] = true);
(cljs.core._equiv["null"] = (function (_,o){
return (o === null);
}));
(cljs.core.IWithMeta["null"] = true);
(cljs.core._with_meta["null"] = (function (_,meta){
return null;
}));
(cljs.core.IMeta["null"] = true);
(cljs.core._meta["null"] = (function (_){
return null;
}));
(cljs.core.IIndexed["null"] = true);
(cljs.core._nth["null"] = (function() {
var G__3373 = null;
var G__3373__3374 = (function (_,n){
return null;
});
var G__3373__3375 = (function (_,n,not_found){
return not_found;
});
G__3373 = function(_,n,not_found){
switch(arguments.length){
case  2 :
return G__3373__3374.call(this,_,n);
case  3 :
return G__3373__3375.call(this,_,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3373;
})()
);
(cljs.core.IEmptyableCollection["null"] = true);
(cljs.core._empty["null"] = (function (_){
return null;
}));
(cljs.core.IMap["null"] = true);
(cljs.core._dissoc["null"] = (function (_,k){
return null;
}));
Date.prototype.cljs$core$IEquiv$ = true;
Date.prototype.cljs$core$IEquiv$_equiv = (function (o,other){
return (o.toString() === other.toString());
});
(cljs.core.IHash["number"] = true);
(cljs.core._hash["number"] = (function (o){
return o;
}));
(cljs.core.IEquiv["number"] = true);
(cljs.core._equiv["number"] = (function (x,o){
return (x === o);
}));
(cljs.core.IHash["boolean"] = true);
(cljs.core._hash["boolean"] = (function (o){
return ((o === true) ? 1 : 0);
}));
(cljs.core.IHash["function"] = true);
(cljs.core._hash["function"] = (function (o){
return goog.getUid.call(null,o);
}));
/**
* Returns a number one greater than num.
*/
cljs.core.inc = (function inc(x){
return (x + 1);
});
/**
* Accepts any collection which satisfies the ICount and IIndexed protocols and
* reduces them without incurring seq initialization
*/
cljs.core.ci_reduce = (function() {
var ci_reduce = null;
var ci_reduce__3383 = (function (cicoll,f){
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core._count.call(null,cicoll))))
{return f.call(null);
} else
{var val__3377 = cljs.core._nth.call(null,cicoll,0);
var n__3378 = 1;

while(true){
if(cljs.core.truth_((n__3378 < cljs.core._count.call(null,cicoll))))
{{
var G__3387 = f.call(null,val__3377,cljs.core._nth.call(null,cicoll,n__3378));
var G__3388 = (n__3378 + 1);
val__3377 = G__3387;
n__3378 = G__3388;
continue;
}
} else
{return val__3377;
}
break;
}
}
});
var ci_reduce__3384 = (function (cicoll,f,val){
var val__3379 = val;
var n__3380 = 0;

while(true){
if(cljs.core.truth_((n__3380 < cljs.core._count.call(null,cicoll))))
{{
var G__3389 = f.call(null,val__3379,cljs.core._nth.call(null,cicoll,n__3380));
var G__3390 = (n__3380 + 1);
val__3379 = G__3389;
n__3380 = G__3390;
continue;
}
} else
{return val__3379;
}
break;
}
});
var ci_reduce__3385 = (function (cicoll,f,val,idx){
var val__3381 = val;
var n__3382 = idx;

while(true){
if(cljs.core.truth_((n__3382 < cljs.core._count.call(null,cicoll))))
{{
var G__3391 = f.call(null,val__3381,cljs.core._nth.call(null,cicoll,n__3382));
var G__3392 = (n__3382 + 1);
val__3381 = G__3391;
n__3382 = G__3392;
continue;
}
} else
{return val__3381;
}
break;
}
});
ci_reduce = function(cicoll,f,val,idx){
switch(arguments.length){
case  2 :
return ci_reduce__3383.call(this,cicoll,f);
case  3 :
return ci_reduce__3384.call(this,cicoll,f,val);
case  4 :
return ci_reduce__3385.call(this,cicoll,f,val,idx);
}
throw('Invalid arity: ' + arguments.length);
};
return ci_reduce;
})()
;

/**
* @constructor
*/
cljs.core.IndexedSeq = (function (a,i){
this.a = a;
this.i = i;
})
cljs.core.IndexedSeq.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.IndexedSeq");
});
cljs.core.IndexedSeq.prototype.cljs$core$IHash$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash = (function (coll){
var this__3393 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = (function() {
var G__3406 = null;
var G__3406__3407 = (function (_,f){
var this__3394 = this;
return cljs.core.ci_reduce.call(null,this__3394.a,f,(this__3394.a[this__3394.i]),(this__3394.i + 1));
});
var G__3406__3408 = (function (_,f,start){
var this__3395 = this;
return cljs.core.ci_reduce.call(null,this__3395.a,f,start,this__3395.i);
});
G__3406 = function(_,f,start){
switch(arguments.length){
case  2 :
return G__3406__3407.call(this,_,f);
case  3 :
return G__3406__3408.call(this,_,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3406;
})()
;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__3396 = this;
return cljs.core.cons.call(null,o,coll);
});
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__3397 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = (function() {
var G__3410 = null;
var G__3410__3411 = (function (coll,n){
var this__3398 = this;
var i__3399 = (n + this__3398.i);

if(cljs.core.truth_((i__3399 < this__3398.a.length)))
{return (this__3398.a[i__3399]);
} else
{return null;
}
});
var G__3410__3412 = (function (coll,n,not_found){
var this__3400 = this;
var i__3401 = (n + this__3400.i);

if(cljs.core.truth_((i__3401 < this__3400.a.length)))
{return (this__3400.a[i__3401]);
} else
{return not_found;
}
});
G__3410 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__3410__3411.call(this,coll,n);
case  3 :
return G__3410__3412.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3410;
})()
;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = (function (_){
var this__3402 = this;
return (this__3402.a.length - this__3402.i);
});
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = (function (_){
var this__3403 = this;
return (this__3403.a[this__3403.i]);
});
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = (function (_){
var this__3404 = this;
if(cljs.core.truth_(((this__3404.i + 1) < this__3404.a.length)))
{return (new cljs.core.IndexedSeq(this__3404.a,(this__3404.i + 1)));
} else
{return cljs.core.list.call(null);
}
});
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = (function (this$){
var this__3405 = this;
return this$;
});
cljs.core.IndexedSeq;
cljs.core.prim_seq = (function prim_seq(prim,i){
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,prim.length)))
{return null;
} else
{return (new cljs.core.IndexedSeq(prim,i));
}
});
cljs.core.array_seq = (function array_seq(array,i){
return cljs.core.prim_seq.call(null,array,i);
});
(cljs.core.IReduce["array"] = true);
(cljs.core._reduce["array"] = (function() {
var G__3414 = null;
var G__3414__3415 = (function (array,f){
return cljs.core.ci_reduce.call(null,array,f);
});
var G__3414__3416 = (function (array,f,start){
return cljs.core.ci_reduce.call(null,array,f,start);
});
G__3414 = function(array,f,start){
switch(arguments.length){
case  2 :
return G__3414__3415.call(this,array,f);
case  3 :
return G__3414__3416.call(this,array,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3414;
})()
);
(cljs.core.ILookup["array"] = true);
(cljs.core._lookup["array"] = (function() {
var G__3418 = null;
var G__3418__3419 = (function (array,k){
return (array[k]);
});
var G__3418__3420 = (function (array,k,not_found){
return cljs.core._nth.call(null,array,k,not_found);
});
G__3418 = function(array,k,not_found){
switch(arguments.length){
case  2 :
return G__3418__3419.call(this,array,k);
case  3 :
return G__3418__3420.call(this,array,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3418;
})()
);
(cljs.core.IIndexed["array"] = true);
(cljs.core._nth["array"] = (function() {
var G__3422 = null;
var G__3422__3423 = (function (array,n){
if(cljs.core.truth_((n < array.length)))
{return (array[n]);
} else
{return null;
}
});
var G__3422__3424 = (function (array,n,not_found){
if(cljs.core.truth_((n < array.length)))
{return (array[n]);
} else
{return not_found;
}
});
G__3422 = function(array,n,not_found){
switch(arguments.length){
case  2 :
return G__3422__3423.call(this,array,n);
case  3 :
return G__3422__3424.call(this,array,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3422;
})()
);
(cljs.core.ICounted["array"] = true);
(cljs.core._count["array"] = (function (a){
return a.length;
}));
(cljs.core.ISeqable["array"] = true);
(cljs.core._seq["array"] = (function (array){
return cljs.core.array_seq.call(null,array,0);
}));
/**
* Returns a seq on the collection. If the collection is
* empty, returns nil.  (seq nil) returns nil. seq also works on
* Strings.
*/
cljs.core.seq = (function seq(coll){
if(cljs.core.truth_(coll))
{return cljs.core._seq.call(null,coll);
} else
{return null;
}
});
/**
* Returns the first item in the collection. Calls seq on its
* argument. If coll is nil, returns nil.
*/
cljs.core.first = (function first(coll){
var temp__3698__auto____3426 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____3426))
{var s__3427 = temp__3698__auto____3426;

return cljs.core._first.call(null,s__3427);
} else
{return null;
}
});
/**
* Returns a possibly empty seq of the items after the first. Calls seq on its
* argument.
*/
cljs.core.rest = (function rest(coll){
return cljs.core._rest.call(null,cljs.core.seq.call(null,coll));
});
/**
* Returns a seq of the items after the first. Calls seq on its
* argument.  If there are no more items, returns nil
*/
cljs.core.next = (function next(coll){
if(cljs.core.truth_(coll))
{return cljs.core.seq.call(null,cljs.core.rest.call(null,coll));
} else
{return null;
}
});
/**
* Same as (first (next x))
*/
cljs.core.second = (function second(coll){
return cljs.core.first.call(null,cljs.core.next.call(null,coll));
});
/**
* Same as (first (first x))
*/
cljs.core.ffirst = (function ffirst(coll){
return cljs.core.first.call(null,cljs.core.first.call(null,coll));
});
/**
* Same as (next (first x))
*/
cljs.core.nfirst = (function nfirst(coll){
return cljs.core.next.call(null,cljs.core.first.call(null,coll));
});
/**
* Same as (first (next x))
*/
cljs.core.fnext = (function fnext(coll){
return cljs.core.first.call(null,cljs.core.next.call(null,coll));
});
/**
* Same as (next (next x))
*/
cljs.core.nnext = (function nnext(coll){
return cljs.core.next.call(null,cljs.core.next.call(null,coll));
});
/**
* Return the last item in coll, in linear time
*/
cljs.core.last = (function last(s){
while(true){
if(cljs.core.truth_(cljs.core.next.call(null,s)))
{{
var G__3428 = cljs.core.next.call(null,s);
s = G__3428;
continue;
}
} else
{return cljs.core.first.call(null,s);
}
break;
}
});
(cljs.core.ICounted["_"] = true);
(cljs.core._count["_"] = (function (x){
var s__3429 = cljs.core.seq.call(null,x);
var n__3430 = 0;

while(true){
if(cljs.core.truth_(s__3429))
{{
var G__3431 = cljs.core.next.call(null,s__3429);
var G__3432 = (n__3430 + 1);
s__3429 = G__3431;
n__3430 = G__3432;
continue;
}
} else
{return n__3430;
}
break;
}
}));
(cljs.core.IEquiv["_"] = true);
(cljs.core._equiv["_"] = (function (x,o){
return (x === o);
}));
/**
* Returns true if x is logical false, false otherwise.
*/
cljs.core.not = (function not(x){
if(cljs.core.truth_(x))
{return false;
} else
{return true;
}
});
/**
* conj[oin]. Returns a new collection with the xs
* 'added'. (conj nil item) returns (item).  The 'addition' may
* happen at different 'places' depending on the concrete type.
* @param {...*} var_args
*/
cljs.core.conj = (function() {
var conj = null;
var conj__3433 = (function (coll,x){
return cljs.core._conj.call(null,coll,x);
});
var conj__3434 = (function() { 
var G__3436__delegate = function (coll,x,xs){
while(true){
if(cljs.core.truth_(xs))
{{
var G__3437 = conj.call(null,coll,x);
var G__3438 = cljs.core.first.call(null,xs);
var G__3439 = cljs.core.next.call(null,xs);
coll = G__3437;
x = G__3438;
xs = G__3439;
continue;
}
} else
{return conj.call(null,coll,x);
}
break;
}
};
var G__3436 = function (coll,x,var_args){
var xs = null;
if (goog.isDef(var_args)) {
  xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3436__delegate.call(this, coll, x, xs);
};
G__3436.cljs$lang$maxFixedArity = 2;
G__3436.cljs$lang$applyTo = (function (arglist__3440){
var coll = cljs.core.first(arglist__3440);
var x = cljs.core.first(cljs.core.next(arglist__3440));
var xs = cljs.core.rest(cljs.core.next(arglist__3440));
return G__3436__delegate.call(this, coll, x, xs);
});
return G__3436;
})()
;
conj = function(coll,x,var_args){
var xs = var_args;
switch(arguments.length){
case  2 :
return conj__3433.call(this,coll,x);
default:
return conj__3434.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
conj.cljs$lang$maxFixedArity = 2;
conj.cljs$lang$applyTo = conj__3434.cljs$lang$applyTo;
return conj;
})()
;
/**
* Returns an empty collection of the same category as coll, or nil
*/
cljs.core.empty = (function empty(coll){
return cljs.core._empty.call(null,coll);
});
/**
* Returns the number of items in the collection. (count nil) returns
* 0.  Also works on strings, arrays, and Maps
*/
cljs.core.count = (function count(coll){
return cljs.core._count.call(null,coll);
});
/**
* Returns the value at the index. get returns nil if index out of
* bounds, nth throws an exception unless not-found is supplied.  nth
* also works for strings, arrays, regex Matchers and Lists, and,
* in O(n) time, for sequences.
*/
cljs.core.nth = (function() {
var nth = null;
var nth__3441 = (function (coll,n){
return cljs.core._nth.call(null,coll,Math.floor(n));
});
var nth__3442 = (function (coll,n,not_found){
return cljs.core._nth.call(null,coll,Math.floor(n),not_found);
});
nth = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return nth__3441.call(this,coll,n);
case  3 :
return nth__3442.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return nth;
})()
;
/**
* Returns the value mapped to key, not-found or nil if key not present.
*/
cljs.core.get = (function() {
var get = null;
var get__3444 = (function (o,k){
return cljs.core._lookup.call(null,o,k);
});
var get__3445 = (function (o,k,not_found){
return cljs.core._lookup.call(null,o,k,not_found);
});
get = function(o,k,not_found){
switch(arguments.length){
case  2 :
return get__3444.call(this,o,k);
case  3 :
return get__3445.call(this,o,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return get;
})()
;
/**
* assoc[iate]. When applied to a map, returns a new map of the
* same (hashed/sorted) type, that contains the mapping of key(s) to
* val(s). When applied to a vector, returns a new vector that
* contains val at index.
* @param {...*} var_args
*/
cljs.core.assoc = (function() {
var assoc = null;
var assoc__3448 = (function (coll,k,v){
return cljs.core._assoc.call(null,coll,k,v);
});
var assoc__3449 = (function() { 
var G__3451__delegate = function (coll,k,v,kvs){
while(true){
var ret__3447 = assoc.call(null,coll,k,v);

if(cljs.core.truth_(kvs))
{{
var G__3452 = ret__3447;
var G__3453 = cljs.core.first.call(null,kvs);
var G__3454 = cljs.core.second.call(null,kvs);
var G__3455 = cljs.core.nnext.call(null,kvs);
coll = G__3452;
k = G__3453;
v = G__3454;
kvs = G__3455;
continue;
}
} else
{return ret__3447;
}
break;
}
};
var G__3451 = function (coll,k,v,var_args){
var kvs = null;
if (goog.isDef(var_args)) {
  kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3451__delegate.call(this, coll, k, v, kvs);
};
G__3451.cljs$lang$maxFixedArity = 3;
G__3451.cljs$lang$applyTo = (function (arglist__3456){
var coll = cljs.core.first(arglist__3456);
var k = cljs.core.first(cljs.core.next(arglist__3456));
var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3456)));
var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3456)));
return G__3451__delegate.call(this, coll, k, v, kvs);
});
return G__3451;
})()
;
assoc = function(coll,k,v,var_args){
var kvs = var_args;
switch(arguments.length){
case  3 :
return assoc__3448.call(this,coll,k,v);
default:
return assoc__3449.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
assoc.cljs$lang$maxFixedArity = 3;
assoc.cljs$lang$applyTo = assoc__3449.cljs$lang$applyTo;
return assoc;
})()
;
/**
* dissoc[iate]. Returns a new map of the same (hashed/sorted) type,
* that does not contain a mapping for key(s).
* @param {...*} var_args
*/
cljs.core.dissoc = (function() {
var dissoc = null;
var dissoc__3458 = (function (coll){
return coll;
});
var dissoc__3459 = (function (coll,k){
return cljs.core._dissoc.call(null,coll,k);
});
var dissoc__3460 = (function() { 
var G__3462__delegate = function (coll,k,ks){
while(true){
var ret__3457 = dissoc.call(null,coll,k);

if(cljs.core.truth_(ks))
{{
var G__3463 = ret__3457;
var G__3464 = cljs.core.first.call(null,ks);
var G__3465 = cljs.core.next.call(null,ks);
coll = G__3463;
k = G__3464;
ks = G__3465;
continue;
}
} else
{return ret__3457;
}
break;
}
};
var G__3462 = function (coll,k,var_args){
var ks = null;
if (goog.isDef(var_args)) {
  ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3462__delegate.call(this, coll, k, ks);
};
G__3462.cljs$lang$maxFixedArity = 2;
G__3462.cljs$lang$applyTo = (function (arglist__3466){
var coll = cljs.core.first(arglist__3466);
var k = cljs.core.first(cljs.core.next(arglist__3466));
var ks = cljs.core.rest(cljs.core.next(arglist__3466));
return G__3462__delegate.call(this, coll, k, ks);
});
return G__3462;
})()
;
dissoc = function(coll,k,var_args){
var ks = var_args;
switch(arguments.length){
case  1 :
return dissoc__3458.call(this,coll);
case  2 :
return dissoc__3459.call(this,coll,k);
default:
return dissoc__3460.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
dissoc.cljs$lang$maxFixedArity = 2;
dissoc.cljs$lang$applyTo = dissoc__3460.cljs$lang$applyTo;
return dissoc;
})()
;
/**
* Returns an object of the same type and value as obj, with
* map m as its metadata.
*/
cljs.core.with_meta = (function with_meta(o,meta){
return cljs.core._with_meta.call(null,o,meta);
});
/**
* Returns the metadata of obj, returns nil if there is no metadata.
*/
cljs.core.meta = (function meta(o){
if(cljs.core.truth_((function (){var x__353__auto____3467 = o;

if(cljs.core.truth_((function (){var and__3546__auto____3468 = x__353__auto____3467;

if(cljs.core.truth_(and__3546__auto____3468))
{var and__3546__auto____3469 = x__353__auto____3467.cljs$core$IMeta$;

if(cljs.core.truth_(and__3546__auto____3469))
{return cljs.core.not.call(null,x__353__auto____3467.hasOwnProperty("cljs$core$IMeta$"));
} else
{return and__3546__auto____3469;
}
} else
{return and__3546__auto____3468;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IMeta,x__353__auto____3467);
}
})()))
{return cljs.core._meta.call(null,o);
} else
{return null;
}
});
/**
* For a list or queue, same as first, for a vector, same as, but much
* more efficient than, last. If the collection is empty, returns nil.
*/
cljs.core.peek = (function peek(coll){
return cljs.core._peek.call(null,coll);
});
/**
* For a list or queue, returns a new list/queue without the first
* item, for a vector, returns a new vector without the last item.
* Note - not the same as next/butlast.
*/
cljs.core.pop = (function pop(coll){
return cljs.core._pop.call(null,coll);
});
/**
* disj[oin]. Returns a new set of the same (hashed/sorted) type, that
* does not contain key(s).
* @param {...*} var_args
*/
cljs.core.disj = (function() {
var disj = null;
var disj__3471 = (function (coll){
return coll;
});
var disj__3472 = (function (coll,k){
return cljs.core._disjoin.call(null,coll,k);
});
var disj__3473 = (function() { 
var G__3475__delegate = function (coll,k,ks){
while(true){
var ret__3470 = disj.call(null,coll,k);

if(cljs.core.truth_(ks))
{{
var G__3476 = ret__3470;
var G__3477 = cljs.core.first.call(null,ks);
var G__3478 = cljs.core.next.call(null,ks);
coll = G__3476;
k = G__3477;
ks = G__3478;
continue;
}
} else
{return ret__3470;
}
break;
}
};
var G__3475 = function (coll,k,var_args){
var ks = null;
if (goog.isDef(var_args)) {
  ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3475__delegate.call(this, coll, k, ks);
};
G__3475.cljs$lang$maxFixedArity = 2;
G__3475.cljs$lang$applyTo = (function (arglist__3479){
var coll = cljs.core.first(arglist__3479);
var k = cljs.core.first(cljs.core.next(arglist__3479));
var ks = cljs.core.rest(cljs.core.next(arglist__3479));
return G__3475__delegate.call(this, coll, k, ks);
});
return G__3475;
})()
;
disj = function(coll,k,var_args){
var ks = var_args;
switch(arguments.length){
case  1 :
return disj__3471.call(this,coll);
case  2 :
return disj__3472.call(this,coll,k);
default:
return disj__3473.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
disj.cljs$lang$maxFixedArity = 2;
disj.cljs$lang$applyTo = disj__3473.cljs$lang$applyTo;
return disj;
})()
;
cljs.core.hash = (function hash(o){
return cljs.core._hash.call(null,o);
});
/**
* Returns true if coll has no items - same as (not (seq coll)).
* Please use the idiom (seq x) rather than (not (empty? x))
*/
cljs.core.empty_QMARK_ = (function empty_QMARK_(coll){
return cljs.core.not.call(null,cljs.core.seq.call(null,coll));
});
/**
* Returns true if x satisfies ICollection
*/
cljs.core.coll_QMARK_ = (function coll_QMARK_(x){
if(cljs.core.truth_((x === null)))
{return false;
} else
{var x__353__auto____3480 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3481 = x__353__auto____3480;

if(cljs.core.truth_(and__3546__auto____3481))
{var and__3546__auto____3482 = x__353__auto____3480.cljs$core$ICollection$;

if(cljs.core.truth_(and__3546__auto____3482))
{return cljs.core.not.call(null,x__353__auto____3480.hasOwnProperty("cljs$core$ICollection$"));
} else
{return and__3546__auto____3482;
}
} else
{return and__3546__auto____3481;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ICollection,x__353__auto____3480);
}
}
});
/**
* Returns true if x satisfies ISet
*/
cljs.core.set_QMARK_ = (function set_QMARK_(x){
if(cljs.core.truth_((x === null)))
{return false;
} else
{var x__353__auto____3483 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3484 = x__353__auto____3483;

if(cljs.core.truth_(and__3546__auto____3484))
{var and__3546__auto____3485 = x__353__auto____3483.cljs$core$ISet$;

if(cljs.core.truth_(and__3546__auto____3485))
{return cljs.core.not.call(null,x__353__auto____3483.hasOwnProperty("cljs$core$ISet$"));
} else
{return and__3546__auto____3485;
}
} else
{return and__3546__auto____3484;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ISet,x__353__auto____3483);
}
}
});
/**
* Returns true if coll implements Associative
*/
cljs.core.associative_QMARK_ = (function associative_QMARK_(x){
var x__353__auto____3486 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3487 = x__353__auto____3486;

if(cljs.core.truth_(and__3546__auto____3487))
{var and__3546__auto____3488 = x__353__auto____3486.cljs$core$IAssociative$;

if(cljs.core.truth_(and__3546__auto____3488))
{return cljs.core.not.call(null,x__353__auto____3486.hasOwnProperty("cljs$core$IAssociative$"));
} else
{return and__3546__auto____3488;
}
} else
{return and__3546__auto____3487;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IAssociative,x__353__auto____3486);
}
});
/**
* Returns true if coll satisfies ISequential
*/
cljs.core.sequential_QMARK_ = (function sequential_QMARK_(x){
var x__353__auto____3489 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3490 = x__353__auto____3489;

if(cljs.core.truth_(and__3546__auto____3490))
{var and__3546__auto____3491 = x__353__auto____3489.cljs$core$ISequential$;

if(cljs.core.truth_(and__3546__auto____3491))
{return cljs.core.not.call(null,x__353__auto____3489.hasOwnProperty("cljs$core$ISequential$"));
} else
{return and__3546__auto____3491;
}
} else
{return and__3546__auto____3490;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ISequential,x__353__auto____3489);
}
});
/**
* Returns true if coll implements count in constant time
*/
cljs.core.counted_QMARK_ = (function counted_QMARK_(x){
var x__353__auto____3492 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3493 = x__353__auto____3492;

if(cljs.core.truth_(and__3546__auto____3493))
{var and__3546__auto____3494 = x__353__auto____3492.cljs$core$ICounted$;

if(cljs.core.truth_(and__3546__auto____3494))
{return cljs.core.not.call(null,x__353__auto____3492.hasOwnProperty("cljs$core$ICounted$"));
} else
{return and__3546__auto____3494;
}
} else
{return and__3546__auto____3493;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ICounted,x__353__auto____3492);
}
});
/**
* Return true if x satisfies IMap
*/
cljs.core.map_QMARK_ = (function map_QMARK_(x){
if(cljs.core.truth_((x === null)))
{return false;
} else
{var x__353__auto____3495 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3496 = x__353__auto____3495;

if(cljs.core.truth_(and__3546__auto____3496))
{var and__3546__auto____3497 = x__353__auto____3495.cljs$core$IMap$;

if(cljs.core.truth_(and__3546__auto____3497))
{return cljs.core.not.call(null,x__353__auto____3495.hasOwnProperty("cljs$core$IMap$"));
} else
{return and__3546__auto____3497;
}
} else
{return and__3546__auto____3496;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IMap,x__353__auto____3495);
}
}
});
/**
* Return true if x satisfies IVector
*/
cljs.core.vector_QMARK_ = (function vector_QMARK_(x){
var x__353__auto____3498 = x;

if(cljs.core.truth_((function (){var and__3546__auto____3499 = x__353__auto____3498;

if(cljs.core.truth_(and__3546__auto____3499))
{var and__3546__auto____3500 = x__353__auto____3498.cljs$core$IVector$;

if(cljs.core.truth_(and__3546__auto____3500))
{return cljs.core.not.call(null,x__353__auto____3498.hasOwnProperty("cljs$core$IVector$"));
} else
{return and__3546__auto____3500;
}
} else
{return and__3546__auto____3499;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IVector,x__353__auto____3498);
}
});
cljs.core.js_obj = (function js_obj(){
return {};
});
cljs.core.js_keys = (function js_keys(obj){
var keys__3501 = [];

goog.object.forEach.call(null,obj,(function (val,key,obj){
return keys__3501.push(key);
}));
return keys__3501;
});
cljs.core.js_delete = (function js_delete(obj,key){
return delete obj[key];
});
cljs.core.lookup_sentinel = cljs.core.js_obj.call(null);
/**
* Returns true if x is the value false, false otherwise.
*/
cljs.core.false_QMARK_ = (function false_QMARK_(x){
return x === false;
});
/**
* Returns true if x is the value true, false otherwise.
*/
cljs.core.true_QMARK_ = (function true_QMARK_(x){
return x === true;
});
cljs.core.undefined_QMARK_ = (function undefined_QMARK_(x){
return (void 0 === x);
});
cljs.core.instance_QMARK_ = (function instance_QMARK_(t,o){
return (o != null && (o instanceof t || o.constructor === t || t === Object));
});
/**
* Return true if s satisfies ISeq
*/
cljs.core.seq_QMARK_ = (function seq_QMARK_(s){
if(cljs.core.truth_((s === null)))
{return false;
} else
{var x__353__auto____3502 = s;

if(cljs.core.truth_((function (){var and__3546__auto____3503 = x__353__auto____3502;

if(cljs.core.truth_(and__3546__auto____3503))
{var and__3546__auto____3504 = x__353__auto____3502.cljs$core$ISeq$;

if(cljs.core.truth_(and__3546__auto____3504))
{return cljs.core.not.call(null,x__353__auto____3502.hasOwnProperty("cljs$core$ISeq$"));
} else
{return and__3546__auto____3504;
}
} else
{return and__3546__auto____3503;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ISeq,x__353__auto____3502);
}
}
});
cljs.core.boolean$ = (function boolean$(x){
if(cljs.core.truth_(x))
{return true;
} else
{return false;
}
});
cljs.core.string_QMARK_ = (function string_QMARK_(x){
var and__3546__auto____3505 = goog.isString.call(null,x);

if(cljs.core.truth_(and__3546__auto____3505))
{return cljs.core.not.call(null,(function (){var or__3548__auto____3506 = cljs.core._EQ_.call(null,x.charAt(0),"\uFDD0");

if(cljs.core.truth_(or__3548__auto____3506))
{return or__3548__auto____3506;
} else
{return cljs.core._EQ_.call(null,x.charAt(0),"\uFDD1");
}
})());
} else
{return and__3546__auto____3505;
}
});
cljs.core.keyword_QMARK_ = (function keyword_QMARK_(x){
var and__3546__auto____3507 = goog.isString.call(null,x);

if(cljs.core.truth_(and__3546__auto____3507))
{return cljs.core._EQ_.call(null,x.charAt(0),"\uFDD0");
} else
{return and__3546__auto____3507;
}
});
cljs.core.symbol_QMARK_ = (function symbol_QMARK_(x){
var and__3546__auto____3508 = goog.isString.call(null,x);

if(cljs.core.truth_(and__3546__auto____3508))
{return cljs.core._EQ_.call(null,x.charAt(0),"\uFDD1");
} else
{return and__3546__auto____3508;
}
});
cljs.core.number_QMARK_ = (function number_QMARK_(n){
return goog.isNumber.call(null,n);
});
cljs.core.fn_QMARK_ = (function fn_QMARK_(f){
return goog.isFunction.call(null,f);
});
/**
* Returns true if n is an integer.  Warning: returns true on underflow condition.
*/
cljs.core.integer_QMARK_ = (function integer_QMARK_(n){
var and__3546__auto____3509 = cljs.core.number_QMARK_.call(null,n);

if(cljs.core.truth_(and__3546__auto____3509))
{return (n == n.toFixed());
} else
{return and__3546__auto____3509;
}
});
/**
* Returns true if key is present in the given collection, otherwise
* returns false.  Note that for numerically indexed collections like
* vectors and arrays, this tests if the numeric key is within the
* range of indexes. 'contains?' operates constant or logarithmic time;
* it will not perform a linear search for a value.  See also 'some'.
*/
cljs.core.contains_QMARK_ = (function contains_QMARK_(coll,v){
if(cljs.core.truth_((cljs.core._lookup.call(null,coll,v,cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)))
{return false;
} else
{return true;
}
});
/**
* Returns the map entry for key, or nil if key not present.
*/
cljs.core.find = (function find(coll,k){
if(cljs.core.truth_((function (){var and__3546__auto____3510 = coll;

if(cljs.core.truth_(and__3546__auto____3510))
{var and__3546__auto____3511 = cljs.core.associative_QMARK_.call(null,coll);

if(cljs.core.truth_(and__3546__auto____3511))
{return cljs.core.contains_QMARK_.call(null,coll,k);
} else
{return and__3546__auto____3511;
}
} else
{return and__3546__auto____3510;
}
})()))
{return cljs.core.PersistentVector.fromArray([k,cljs.core._lookup.call(null,coll,k)]);
} else
{return null;
}
});
/**
* Returns true if no two of the arguments are =
* @param {...*} var_args
*/
cljs.core.distinct_QMARK_ = (function() {
var distinct_QMARK_ = null;
var distinct_QMARK___3516 = (function (x){
return true;
});
var distinct_QMARK___3517 = (function (x,y){
return cljs.core.not.call(null,cljs.core._EQ_.call(null,x,y));
});
var distinct_QMARK___3518 = (function() { 
var G__3520__delegate = function (x,y,more){
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core._EQ_.call(null,x,y))))
{var s__3512 = cljs.core.set([y,x]);
var xs__3513 = more;

while(true){
var x__3514 = cljs.core.first.call(null,xs__3513);
var etc__3515 = cljs.core.next.call(null,xs__3513);

if(cljs.core.truth_(xs__3513))
{if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,s__3512,x__3514)))
{return false;
} else
{{
var G__3521 = cljs.core.conj.call(null,s__3512,x__3514);
var G__3522 = etc__3515;
s__3512 = G__3521;
xs__3513 = G__3522;
continue;
}
}
} else
{return true;
}
break;
}
} else
{return false;
}
};
var G__3520 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3520__delegate.call(this, x, y, more);
};
G__3520.cljs$lang$maxFixedArity = 2;
G__3520.cljs$lang$applyTo = (function (arglist__3523){
var x = cljs.core.first(arglist__3523);
var y = cljs.core.first(cljs.core.next(arglist__3523));
var more = cljs.core.rest(cljs.core.next(arglist__3523));
return G__3520__delegate.call(this, x, y, more);
});
return G__3520;
})()
;
distinct_QMARK_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return distinct_QMARK___3516.call(this,x);
case  2 :
return distinct_QMARK___3517.call(this,x,y);
default:
return distinct_QMARK___3518.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
distinct_QMARK_.cljs$lang$maxFixedArity = 2;
distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___3518.cljs$lang$applyTo;
return distinct_QMARK_;
})()
;
/**
* Comparator. Returns a negative number, zero, or a positive number
* when x is logically 'less than', 'equal to', or 'greater than'
* y. Uses google.array.defaultCompare.
*/
cljs.core.compare = (function compare(x,y){
return goog.array.defaultCompare.call(null,x,y);
});
/**
* Given a fn that might be boolean valued or a comparator,
* return a fn that is a comparator.
*/
cljs.core.fn__GT_comparator = (function fn__GT_comparator(f){
if(cljs.core.truth_(cljs.core._EQ_.call(null,f,cljs.core.compare)))
{return cljs.core.compare;
} else
{return (function (x,y){
var r__3524 = f.call(null,x,y);

if(cljs.core.truth_(cljs.core.number_QMARK_.call(null,r__3524)))
{return r__3524;
} else
{if(cljs.core.truth_(r__3524))
{return -1;
} else
{if(cljs.core.truth_(f.call(null,y,x)))
{return 1;
} else
{return 0;
}
}
}
});
}
});
/**
* Returns a sorted sequence of the items in coll. Comp can be
* boolean-valued comparison funcion, or a -/0/+ valued comparator.
* Comp defaults to compare.
*/
cljs.core.sort = (function() {
var sort = null;
var sort__3526 = (function (coll){
return sort.call(null,cljs.core.compare,coll);
});
var sort__3527 = (function (comp,coll){
if(cljs.core.truth_(cljs.core.seq.call(null,coll)))
{var a__3525 = cljs.core.to_array.call(null,coll);

goog.array.stableSort.call(null,a__3525,cljs.core.fn__GT_comparator.call(null,comp));
return cljs.core.seq.call(null,a__3525);
} else
{return cljs.core.List.EMPTY;
}
});
sort = function(comp,coll){
switch(arguments.length){
case  1 :
return sort__3526.call(this,comp);
case  2 :
return sort__3527.call(this,comp,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return sort;
})()
;
/**
* Returns a sorted sequence of the items in coll, where the sort
* order is determined by comparing (keyfn item).  Comp can be
* boolean-valued comparison funcion, or a -/0/+ valued comparator.
* Comp defaults to compare.
*/
cljs.core.sort_by = (function() {
var sort_by = null;
var sort_by__3529 = (function (keyfn,coll){
return sort_by.call(null,keyfn,cljs.core.compare,coll);
});
var sort_by__3530 = (function (keyfn,comp,coll){
return cljs.core.sort.call(null,(function (x,y){
return cljs.core.fn__GT_comparator.call(null,comp).call(null,keyfn.call(null,x),keyfn.call(null,y));
}),coll);
});
sort_by = function(keyfn,comp,coll){
switch(arguments.length){
case  2 :
return sort_by__3529.call(this,keyfn,comp);
case  3 :
return sort_by__3530.call(this,keyfn,comp,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return sort_by;
})()
;
/**
* f should be a function of 2 arguments. If val is not supplied,
* returns the result of applying f to the first 2 items in coll, then
* applying f to that result and the 3rd item, etc. If coll contains no
* items, f must accept no arguments as well, and reduce returns the
* result of calling f with no arguments.  If coll has only 1 item, it
* is returned and f is not called.  If val is supplied, returns the
* result of applying f to val and the first item in coll, then
* applying f to that result and the 2nd item, etc. If coll contains no
* items, returns val and f is not called.
*/
cljs.core.reduce = (function() {
var reduce = null;
var reduce__3532 = (function (f,coll){
return cljs.core._reduce.call(null,coll,f);
});
var reduce__3533 = (function (f,val,coll){
return cljs.core._reduce.call(null,coll,f,val);
});
reduce = function(f,val,coll){
switch(arguments.length){
case  2 :
return reduce__3532.call(this,f,val);
case  3 :
return reduce__3533.call(this,f,val,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return reduce;
})()
;
cljs.core.seq_reduce = (function() {
var seq_reduce = null;
var seq_reduce__3539 = (function (f,coll){
var temp__3695__auto____3535 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3695__auto____3535))
{var s__3536 = temp__3695__auto____3535;

return cljs.core.reduce.call(null,f,cljs.core.first.call(null,s__3536),cljs.core.next.call(null,s__3536));
} else
{return f.call(null);
}
});
var seq_reduce__3540 = (function (f,val,coll){
var val__3537 = val;
var coll__3538 = cljs.core.seq.call(null,coll);

while(true){
if(cljs.core.truth_(coll__3538))
{{
var G__3542 = f.call(null,val__3537,cljs.core.first.call(null,coll__3538));
var G__3543 = cljs.core.next.call(null,coll__3538);
val__3537 = G__3542;
coll__3538 = G__3543;
continue;
}
} else
{return val__3537;
}
break;
}
});
seq_reduce = function(f,val,coll){
switch(arguments.length){
case  2 :
return seq_reduce__3539.call(this,f,val);
case  3 :
return seq_reduce__3540.call(this,f,val,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return seq_reduce;
})()
;
(cljs.core.IReduce["_"] = true);
(cljs.core._reduce["_"] = (function() {
var G__3544 = null;
var G__3544__3545 = (function (coll,f){
return cljs.core.seq_reduce.call(null,f,coll);
});
var G__3544__3546 = (function (coll,f,start){
return cljs.core.seq_reduce.call(null,f,start,coll);
});
G__3544 = function(coll,f,start){
switch(arguments.length){
case  2 :
return G__3544__3545.call(this,coll,f);
case  3 :
return G__3544__3546.call(this,coll,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3544;
})()
);
/**
* Returns the sum of nums. (+) returns 0.
* @param {...*} var_args
*/
cljs.core._PLUS_ = (function() {
var _PLUS_ = null;
var _PLUS___3548 = (function (){
return 0;
});
var _PLUS___3549 = (function (x){
return x;
});
var _PLUS___3550 = (function (x,y){
return (x + y);
});
var _PLUS___3551 = (function() { 
var G__3553__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_PLUS_,(x + y),more);
};
var G__3553 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3553__delegate.call(this, x, y, more);
};
G__3553.cljs$lang$maxFixedArity = 2;
G__3553.cljs$lang$applyTo = (function (arglist__3554){
var x = cljs.core.first(arglist__3554);
var y = cljs.core.first(cljs.core.next(arglist__3554));
var more = cljs.core.rest(cljs.core.next(arglist__3554));
return G__3553__delegate.call(this, x, y, more);
});
return G__3553;
})()
;
_PLUS_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  0 :
return _PLUS___3548.call(this);
case  1 :
return _PLUS___3549.call(this,x);
case  2 :
return _PLUS___3550.call(this,x,y);
default:
return _PLUS___3551.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_PLUS_.cljs$lang$maxFixedArity = 2;
_PLUS_.cljs$lang$applyTo = _PLUS___3551.cljs$lang$applyTo;
return _PLUS_;
})()
;
/**
* If no ys are supplied, returns the negation of x, else subtracts
* the ys from x and returns the result.
* @param {...*} var_args
*/
cljs.core._ = (function() {
var _ = null;
var ___3555 = (function (x){
return (- x);
});
var ___3556 = (function (x,y){
return (x - y);
});
var ___3557 = (function() { 
var G__3559__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_,(x - y),more);
};
var G__3559 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3559__delegate.call(this, x, y, more);
};
G__3559.cljs$lang$maxFixedArity = 2;
G__3559.cljs$lang$applyTo = (function (arglist__3560){
var x = cljs.core.first(arglist__3560);
var y = cljs.core.first(cljs.core.next(arglist__3560));
var more = cljs.core.rest(cljs.core.next(arglist__3560));
return G__3559__delegate.call(this, x, y, more);
});
return G__3559;
})()
;
_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return ___3555.call(this,x);
case  2 :
return ___3556.call(this,x,y);
default:
return ___3557.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_.cljs$lang$maxFixedArity = 2;
_.cljs$lang$applyTo = ___3557.cljs$lang$applyTo;
return _;
})()
;
/**
* Returns the product of nums. (*) returns 1.
* @param {...*} var_args
*/
cljs.core._STAR_ = (function() {
var _STAR_ = null;
var _STAR___3561 = (function (){
return 1;
});
var _STAR___3562 = (function (x){
return x;
});
var _STAR___3563 = (function (x,y){
return (x * y);
});
var _STAR___3564 = (function() { 
var G__3566__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_STAR_,(x * y),more);
};
var G__3566 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3566__delegate.call(this, x, y, more);
};
G__3566.cljs$lang$maxFixedArity = 2;
G__3566.cljs$lang$applyTo = (function (arglist__3567){
var x = cljs.core.first(arglist__3567);
var y = cljs.core.first(cljs.core.next(arglist__3567));
var more = cljs.core.rest(cljs.core.next(arglist__3567));
return G__3566__delegate.call(this, x, y, more);
});
return G__3566;
})()
;
_STAR_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  0 :
return _STAR___3561.call(this);
case  1 :
return _STAR___3562.call(this,x);
case  2 :
return _STAR___3563.call(this,x,y);
default:
return _STAR___3564.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_STAR_.cljs$lang$maxFixedArity = 2;
_STAR_.cljs$lang$applyTo = _STAR___3564.cljs$lang$applyTo;
return _STAR_;
})()
;
/**
* If no denominators are supplied, returns 1/numerator,
* else returns numerator divided by all of the denominators.
* @param {...*} var_args
*/
cljs.core._SLASH_ = (function() {
var _SLASH_ = null;
var _SLASH___3568 = (function (x){
return _SLASH_.call(null,1,x);
});
var _SLASH___3569 = (function (x,y){
return (x / y);
});
var _SLASH___3570 = (function() { 
var G__3572__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_SLASH_,_SLASH_.call(null,x,y),more);
};
var G__3572 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3572__delegate.call(this, x, y, more);
};
G__3572.cljs$lang$maxFixedArity = 2;
G__3572.cljs$lang$applyTo = (function (arglist__3573){
var x = cljs.core.first(arglist__3573);
var y = cljs.core.first(cljs.core.next(arglist__3573));
var more = cljs.core.rest(cljs.core.next(arglist__3573));
return G__3572__delegate.call(this, x, y, more);
});
return G__3572;
})()
;
_SLASH_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _SLASH___3568.call(this,x);
case  2 :
return _SLASH___3569.call(this,x,y);
default:
return _SLASH___3570.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_SLASH_.cljs$lang$maxFixedArity = 2;
_SLASH_.cljs$lang$applyTo = _SLASH___3570.cljs$lang$applyTo;
return _SLASH_;
})()
;
/**
* Returns non-nil if nums are in monotonically increasing order,
* otherwise false.
* @param {...*} var_args
*/
cljs.core._LT_ = (function() {
var _LT_ = null;
var _LT___3574 = (function (x){
return true;
});
var _LT___3575 = (function (x,y){
return (x < y);
});
var _LT___3576 = (function() { 
var G__3578__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x < y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__3579 = y;
var G__3580 = cljs.core.first.call(null,more);
var G__3581 = cljs.core.next.call(null,more);
x = G__3579;
y = G__3580;
more = G__3581;
continue;
}
} else
{return (y < cljs.core.first.call(null,more));
}
} else
{return false;
}
break;
}
};
var G__3578 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3578__delegate.call(this, x, y, more);
};
G__3578.cljs$lang$maxFixedArity = 2;
G__3578.cljs$lang$applyTo = (function (arglist__3582){
var x = cljs.core.first(arglist__3582);
var y = cljs.core.first(cljs.core.next(arglist__3582));
var more = cljs.core.rest(cljs.core.next(arglist__3582));
return G__3578__delegate.call(this, x, y, more);
});
return G__3578;
})()
;
_LT_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _LT___3574.call(this,x);
case  2 :
return _LT___3575.call(this,x,y);
default:
return _LT___3576.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_LT_.cljs$lang$maxFixedArity = 2;
_LT_.cljs$lang$applyTo = _LT___3576.cljs$lang$applyTo;
return _LT_;
})()
;
/**
* Returns non-nil if nums are in monotonically non-decreasing order,
* otherwise false.
* @param {...*} var_args
*/
cljs.core._LT__EQ_ = (function() {
var _LT__EQ_ = null;
var _LT__EQ___3583 = (function (x){
return true;
});
var _LT__EQ___3584 = (function (x,y){
return (x <= y);
});
var _LT__EQ___3585 = (function() { 
var G__3587__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x <= y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__3588 = y;
var G__3589 = cljs.core.first.call(null,more);
var G__3590 = cljs.core.next.call(null,more);
x = G__3588;
y = G__3589;
more = G__3590;
continue;
}
} else
{return (y <= cljs.core.first.call(null,more));
}
} else
{return false;
}
break;
}
};
var G__3587 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3587__delegate.call(this, x, y, more);
};
G__3587.cljs$lang$maxFixedArity = 2;
G__3587.cljs$lang$applyTo = (function (arglist__3591){
var x = cljs.core.first(arglist__3591);
var y = cljs.core.first(cljs.core.next(arglist__3591));
var more = cljs.core.rest(cljs.core.next(arglist__3591));
return G__3587__delegate.call(this, x, y, more);
});
return G__3587;
})()
;
_LT__EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _LT__EQ___3583.call(this,x);
case  2 :
return _LT__EQ___3584.call(this,x,y);
default:
return _LT__EQ___3585.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_LT__EQ_.cljs$lang$maxFixedArity = 2;
_LT__EQ_.cljs$lang$applyTo = _LT__EQ___3585.cljs$lang$applyTo;
return _LT__EQ_;
})()
;
/**
* Returns non-nil if nums are in monotonically decreasing order,
* otherwise false.
* @param {...*} var_args
*/
cljs.core._GT_ = (function() {
var _GT_ = null;
var _GT___3592 = (function (x){
return true;
});
var _GT___3593 = (function (x,y){
return (x > y);
});
var _GT___3594 = (function() { 
var G__3596__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x > y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__3597 = y;
var G__3598 = cljs.core.first.call(null,more);
var G__3599 = cljs.core.next.call(null,more);
x = G__3597;
y = G__3598;
more = G__3599;
continue;
}
} else
{return (y > cljs.core.first.call(null,more));
}
} else
{return false;
}
break;
}
};
var G__3596 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3596__delegate.call(this, x, y, more);
};
G__3596.cljs$lang$maxFixedArity = 2;
G__3596.cljs$lang$applyTo = (function (arglist__3600){
var x = cljs.core.first(arglist__3600);
var y = cljs.core.first(cljs.core.next(arglist__3600));
var more = cljs.core.rest(cljs.core.next(arglist__3600));
return G__3596__delegate.call(this, x, y, more);
});
return G__3596;
})()
;
_GT_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _GT___3592.call(this,x);
case  2 :
return _GT___3593.call(this,x,y);
default:
return _GT___3594.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_GT_.cljs$lang$maxFixedArity = 2;
_GT_.cljs$lang$applyTo = _GT___3594.cljs$lang$applyTo;
return _GT_;
})()
;
/**
* Returns non-nil if nums are in monotonically non-increasing order,
* otherwise false.
* @param {...*} var_args
*/
cljs.core._GT__EQ_ = (function() {
var _GT__EQ_ = null;
var _GT__EQ___3601 = (function (x){
return true;
});
var _GT__EQ___3602 = (function (x,y){
return (x >= y);
});
var _GT__EQ___3603 = (function() { 
var G__3605__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x >= y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__3606 = y;
var G__3607 = cljs.core.first.call(null,more);
var G__3608 = cljs.core.next.call(null,more);
x = G__3606;
y = G__3607;
more = G__3608;
continue;
}
} else
{return (y >= cljs.core.first.call(null,more));
}
} else
{return false;
}
break;
}
};
var G__3605 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3605__delegate.call(this, x, y, more);
};
G__3605.cljs$lang$maxFixedArity = 2;
G__3605.cljs$lang$applyTo = (function (arglist__3609){
var x = cljs.core.first(arglist__3609);
var y = cljs.core.first(cljs.core.next(arglist__3609));
var more = cljs.core.rest(cljs.core.next(arglist__3609));
return G__3605__delegate.call(this, x, y, more);
});
return G__3605;
})()
;
_GT__EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _GT__EQ___3601.call(this,x);
case  2 :
return _GT__EQ___3602.call(this,x,y);
default:
return _GT__EQ___3603.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_GT__EQ_.cljs$lang$maxFixedArity = 2;
_GT__EQ_.cljs$lang$applyTo = _GT__EQ___3603.cljs$lang$applyTo;
return _GT__EQ_;
})()
;
/**
* Returns a number one less than num.
*/
cljs.core.dec = (function dec(x){
return (x - 1);
});
/**
* Returns the greatest of the nums.
* @param {...*} var_args
*/
cljs.core.max = (function() {
var max = null;
var max__3610 = (function (x){
return x;
});
var max__3611 = (function (x,y){
return ((x > y) ? x : y);
});
var max__3612 = (function() { 
var G__3614__delegate = function (x,y,more){
return cljs.core.reduce.call(null,max,((x > y) ? x : y),more);
};
var G__3614 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3614__delegate.call(this, x, y, more);
};
G__3614.cljs$lang$maxFixedArity = 2;
G__3614.cljs$lang$applyTo = (function (arglist__3615){
var x = cljs.core.first(arglist__3615);
var y = cljs.core.first(cljs.core.next(arglist__3615));
var more = cljs.core.rest(cljs.core.next(arglist__3615));
return G__3614__delegate.call(this, x, y, more);
});
return G__3614;
})()
;
max = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return max__3610.call(this,x);
case  2 :
return max__3611.call(this,x,y);
default:
return max__3612.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
max.cljs$lang$maxFixedArity = 2;
max.cljs$lang$applyTo = max__3612.cljs$lang$applyTo;
return max;
})()
;
/**
* Returns the least of the nums.
* @param {...*} var_args
*/
cljs.core.min = (function() {
var min = null;
var min__3616 = (function (x){
return x;
});
var min__3617 = (function (x,y){
return ((x < y) ? x : y);
});
var min__3618 = (function() { 
var G__3620__delegate = function (x,y,more){
return cljs.core.reduce.call(null,min,((x < y) ? x : y),more);
};
var G__3620 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3620__delegate.call(this, x, y, more);
};
G__3620.cljs$lang$maxFixedArity = 2;
G__3620.cljs$lang$applyTo = (function (arglist__3621){
var x = cljs.core.first(arglist__3621);
var y = cljs.core.first(cljs.core.next(arglist__3621));
var more = cljs.core.rest(cljs.core.next(arglist__3621));
return G__3620__delegate.call(this, x, y, more);
});
return G__3620;
})()
;
min = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return min__3616.call(this,x);
case  2 :
return min__3617.call(this,x,y);
default:
return min__3618.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
min.cljs$lang$maxFixedArity = 2;
min.cljs$lang$applyTo = min__3618.cljs$lang$applyTo;
return min;
})()
;
cljs.core.fix = (function fix(q){
if(cljs.core.truth_((q >= 0)))
{return Math.floor.call(null,q);
} else
{return Math.ceil.call(null,q);
}
});
/**
* Modulus of num and div. Truncates toward negative infinity.
*/
cljs.core.mod = (function mod(n,d){
return (n % d);
});
/**
* quot[ient] of dividing numerator by denominator.
*/
cljs.core.quot = (function quot(n,d){
var rem__3622 = (n % d);

return cljs.core.fix.call(null,((n - rem__3622) / d));
});
/**
* remainder of dividing numerator by denominator.
*/
cljs.core.rem = (function rem(n,d){
var q__3623 = cljs.core.quot.call(null,n,d);

return (n - (d * q__3623));
});
/**
* Returns a random floating point number between 0 (inclusive) and n (default 1) (exclusive).
*/
cljs.core.rand = (function() {
var rand = null;
var rand__3624 = (function (){
return Math.random.call(null);
});
var rand__3625 = (function (n){
return (n * rand.call(null));
});
rand = function(n){
switch(arguments.length){
case  0 :
return rand__3624.call(this);
case  1 :
return rand__3625.call(this,n);
}
throw('Invalid arity: ' + arguments.length);
};
return rand;
})()
;
/**
* Returns a random integer between 0 (inclusive) and n (exclusive).
*/
cljs.core.rand_int = (function rand_int(n){
return cljs.core.fix.call(null,cljs.core.rand.call(null,n));
});
/**
* Bitwise exclusive or
*/
cljs.core.bit_xor = (function bit_xor(x,y){
return (x ^ y);
});
/**
* Bitwise and
*/
cljs.core.bit_and = (function bit_and(x,y){
return (x & y);
});
/**
* Bitwise or
*/
cljs.core.bit_or = (function bit_or(x,y){
return (x | y);
});
/**
* Bitwise and
*/
cljs.core.bit_and_not = (function bit_and_not(x,y){
return (x & ~y);
});
/**
* Clear bit at index n
*/
cljs.core.bit_clear = (function bit_clear(x,n){
return (x & ~(1 << n));
});
/**
* Flip bit at index n
*/
cljs.core.bit_flip = (function bit_flip(x,n){
return (x ^ (1 << n));
});
/**
* Bitwise complement
*/
cljs.core.bit_not = (function bit_not(x){
return (~ x);
});
/**
* Set bit at index n
*/
cljs.core.bit_set = (function bit_set(x,n){
return (x | (1 << n));
});
/**
* Test bit at index n
*/
cljs.core.bit_test = (function bit_test(x,n){
return ((x & (1 << n)) != 0);
});
/**
* Bitwise shift left
*/
cljs.core.bit_shift_left = (function bit_shift_left(x,n){
return (x << n);
});
/**
* Bitwise shift right
*/
cljs.core.bit_shift_right = (function bit_shift_right(x,n){
return (x >> n);
});
/**
* Returns non-nil if nums all have the equivalent
* value (type-independent), otherwise false
* @param {...*} var_args
*/
cljs.core._EQ__EQ_ = (function() {
var _EQ__EQ_ = null;
var _EQ__EQ___3627 = (function (x){
return true;
});
var _EQ__EQ___3628 = (function (x,y){
return cljs.core._equiv.call(null,x,y);
});
var _EQ__EQ___3629 = (function() { 
var G__3631__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_(_EQ__EQ_.call(null,x,y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__3632 = y;
var G__3633 = cljs.core.first.call(null,more);
var G__3634 = cljs.core.next.call(null,more);
x = G__3632;
y = G__3633;
more = G__3634;
continue;
}
} else
{return _EQ__EQ_.call(null,y,cljs.core.first.call(null,more));
}
} else
{return false;
}
break;
}
};
var G__3631 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3631__delegate.call(this, x, y, more);
};
G__3631.cljs$lang$maxFixedArity = 2;
G__3631.cljs$lang$applyTo = (function (arglist__3635){
var x = cljs.core.first(arglist__3635);
var y = cljs.core.first(cljs.core.next(arglist__3635));
var more = cljs.core.rest(cljs.core.next(arglist__3635));
return G__3631__delegate.call(this, x, y, more);
});
return G__3631;
})()
;
_EQ__EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _EQ__EQ___3627.call(this,x);
case  2 :
return _EQ__EQ___3628.call(this,x,y);
default:
return _EQ__EQ___3629.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_EQ__EQ_.cljs$lang$maxFixedArity = 2;
_EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___3629.cljs$lang$applyTo;
return _EQ__EQ_;
})()
;
/**
* Returns true if num is greater than zero, else false
*/
cljs.core.pos_QMARK_ = (function pos_QMARK_(n){
return (n > 0);
});
cljs.core.zero_QMARK_ = (function zero_QMARK_(n){
return (n === 0);
});
/**
* Returns true if num is less than zero, else false
*/
cljs.core.neg_QMARK_ = (function neg_QMARK_(x){
return (x < 0);
});
/**
* Returns the nth next of coll, (seq coll) when n is 0.
*/
cljs.core.nthnext = (function nthnext(coll,n){
var n__3636 = n;
var xs__3637 = cljs.core.seq.call(null,coll);

while(true){
if(cljs.core.truth_((function (){var and__3546__auto____3638 = xs__3637;

if(cljs.core.truth_(and__3546__auto____3638))
{return (n__3636 > 0);
} else
{return and__3546__auto____3638;
}
})()))
{{
var G__3639 = (n__3636 - 1);
var G__3640 = cljs.core.next.call(null,xs__3637);
n__3636 = G__3639;
xs__3637 = G__3640;
continue;
}
} else
{return xs__3637;
}
break;
}
});
(cljs.core.IIndexed["_"] = true);
(cljs.core._nth["_"] = (function() {
var G__3645 = null;
var G__3645__3646 = (function (coll,n){
var temp__3695__auto____3641 = cljs.core.nthnext.call(null,coll,n);

if(cljs.core.truth_(temp__3695__auto____3641))
{var xs__3642 = temp__3695__auto____3641;

return cljs.core.first.call(null,xs__3642);
} else
{throw (new Error("Index out of bounds"));
}
});
var G__3645__3647 = (function (coll,n,not_found){
var temp__3695__auto____3643 = cljs.core.nthnext.call(null,coll,n);

if(cljs.core.truth_(temp__3695__auto____3643))
{var xs__3644 = temp__3695__auto____3643;

return cljs.core.first.call(null,xs__3644);
} else
{return not_found;
}
});
G__3645 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__3645__3646.call(this,coll,n);
case  3 :
return G__3645__3647.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3645;
})()
);
/**
* Internal - do not use!
* @param {...*} var_args
*/
cljs.core.str_STAR_ = (function() {
var str_STAR_ = null;
var str_STAR___3649 = (function (){
return "";
});
var str_STAR___3650 = (function (x){
if(cljs.core.truth_((x === null)))
{return "";
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return x.toString();
} else
{return null;
}
}
});
var str_STAR___3651 = (function() { 
var G__3653__delegate = function (x,ys){
return (function (sb,more){
while(true){
if(cljs.core.truth_(more))
{{
var G__3654 = sb.append(str_STAR_.call(null,cljs.core.first.call(null,more)));
var G__3655 = cljs.core.next.call(null,more);
sb = G__3654;
more = G__3655;
continue;
}
} else
{return str_STAR_.call(null,sb);
}
break;
}
}).call(null,(new goog.string.StringBuffer(str_STAR_.call(null,x))),ys);
};
var G__3653 = function (x,var_args){
var ys = null;
if (goog.isDef(var_args)) {
  ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__3653__delegate.call(this, x, ys);
};
G__3653.cljs$lang$maxFixedArity = 1;
G__3653.cljs$lang$applyTo = (function (arglist__3656){
var x = cljs.core.first(arglist__3656);
var ys = cljs.core.rest(arglist__3656);
return G__3653__delegate.call(this, x, ys);
});
return G__3653;
})()
;
str_STAR_ = function(x,var_args){
var ys = var_args;
switch(arguments.length){
case  0 :
return str_STAR___3649.call(this);
case  1 :
return str_STAR___3650.call(this,x);
default:
return str_STAR___3651.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
str_STAR_.cljs$lang$maxFixedArity = 1;
str_STAR_.cljs$lang$applyTo = str_STAR___3651.cljs$lang$applyTo;
return str_STAR_;
})()
;
/**
* With no args, returns the empty string. With one arg x, returns
* x.toString().  (str nil) returns the empty string. With more than
* one arg, returns the concatenation of the str values of the args.
* @param {...*} var_args
*/
cljs.core.str = (function() {
var str = null;
var str__3657 = (function (){
return "";
});
var str__3658 = (function (x){
if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null,x)))
{return x.substring(2,x.length);
} else
{if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null,x)))
{return cljs.core.str_STAR_.call(null,":",x.substring(2,x.length));
} else
{if(cljs.core.truth_((x === null)))
{return "";
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return x.toString();
} else
{return null;
}
}
}
}
});
var str__3659 = (function() { 
var G__3661__delegate = function (x,ys){
return (function (sb,more){
while(true){
if(cljs.core.truth_(more))
{{
var G__3662 = sb.append(str.call(null,cljs.core.first.call(null,more)));
var G__3663 = cljs.core.next.call(null,more);
sb = G__3662;
more = G__3663;
continue;
}
} else
{return cljs.core.str_STAR_.call(null,sb);
}
break;
}
}).call(null,(new goog.string.StringBuffer(str.call(null,x))),ys);
};
var G__3661 = function (x,var_args){
var ys = null;
if (goog.isDef(var_args)) {
  ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__3661__delegate.call(this, x, ys);
};
G__3661.cljs$lang$maxFixedArity = 1;
G__3661.cljs$lang$applyTo = (function (arglist__3664){
var x = cljs.core.first(arglist__3664);
var ys = cljs.core.rest(arglist__3664);
return G__3661__delegate.call(this, x, ys);
});
return G__3661;
})()
;
str = function(x,var_args){
var ys = var_args;
switch(arguments.length){
case  0 :
return str__3657.call(this);
case  1 :
return str__3658.call(this,x);
default:
return str__3659.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
str.cljs$lang$maxFixedArity = 1;
str.cljs$lang$applyTo = str__3659.cljs$lang$applyTo;
return str;
})()
;
/**
* Returns the substring of s beginning at start inclusive, and ending
* at end (defaults to length of string), exclusive.
*/
cljs.core.subs = (function() {
var subs = null;
var subs__3665 = (function (s,start){
return s.substring(start);
});
var subs__3666 = (function (s,start,end){
return s.substring(start,end);
});
subs = function(s,start,end){
switch(arguments.length){
case  2 :
return subs__3665.call(this,s,start);
case  3 :
return subs__3666.call(this,s,start,end);
}
throw('Invalid arity: ' + arguments.length);
};
return subs;
})()
;
/**
* Returns a Symbol with the given namespace and name.
*/
cljs.core.symbol = (function() {
var symbol = null;
var symbol__3668 = (function (name){
if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null,name)))
{name;
} else
{if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null,name)))
{cljs.core.str_STAR_.call(null,"\uFDD1","'",cljs.core.subs.call(null,name,2));
} else
{}
}
return cljs.core.str_STAR_.call(null,"\uFDD1","'",name);
});
var symbol__3669 = (function (ns,name){
return symbol.call(null,cljs.core.str_STAR_.call(null,ns,"\/",name));
});
symbol = function(ns,name){
switch(arguments.length){
case  1 :
return symbol__3668.call(this,ns);
case  2 :
return symbol__3669.call(this,ns,name);
}
throw('Invalid arity: ' + arguments.length);
};
return symbol;
})()
;
/**
* Returns a Keyword with the given namespace and name.  Do not use :
* in the keyword strings, it will be added automatically.
*/
cljs.core.keyword = (function() {
var keyword = null;
var keyword__3671 = (function (name){
if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null,name)))
{return name;
} else
{if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null,name)))
{return cljs.core.str_STAR_.call(null,"\uFDD0","'",cljs.core.subs.call(null,name,2));
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return cljs.core.str_STAR_.call(null,"\uFDD0","'",name);
} else
{return null;
}
}
}
});
var keyword__3672 = (function (ns,name){
return keyword.call(null,cljs.core.str_STAR_.call(null,ns,"\/",name));
});
keyword = function(ns,name){
switch(arguments.length){
case  1 :
return keyword__3671.call(this,ns);
case  2 :
return keyword__3672.call(this,ns,name);
}
throw('Invalid arity: ' + arguments.length);
};
return keyword;
})()
;
/**
* Assumes x is sequential. Returns true if x equals y, otherwise
* returns false.
*/
cljs.core.equiv_sequential = (function equiv_sequential(x,y){
return cljs.core.boolean$.call(null,(cljs.core.truth_(cljs.core.sequential_QMARK_.call(null,y))?(function (){var xs__3674 = cljs.core.seq.call(null,x);
var ys__3675 = cljs.core.seq.call(null,y);

while(true){
if(cljs.core.truth_((xs__3674 === null)))
{return (ys__3675 === null);
} else
{if(cljs.core.truth_((ys__3675 === null)))
{return false;
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.first.call(null,xs__3674),cljs.core.first.call(null,ys__3675))))
{{
var G__3676 = cljs.core.next.call(null,xs__3674);
var G__3677 = cljs.core.next.call(null,ys__3675);
xs__3674 = G__3676;
ys__3675 = G__3677;
continue;
}
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return false;
} else
{return null;
}
}
}
}
break;
}
})():null));
});
cljs.core.hash_combine = (function hash_combine(seed,hash){
return (seed ^ (((hash + 2654435769) + (seed << 6)) + (seed >> 2)));
});
cljs.core.hash_coll = (function hash_coll(coll){
return cljs.core.reduce.call(null,(function (p1__3678_SHARP_,p2__3679_SHARP_){
return cljs.core.hash_combine.call(null,p1__3678_SHARP_,cljs.core.hash.call(null,p2__3679_SHARP_));
}),cljs.core.hash.call(null,cljs.core.first.call(null,coll)),cljs.core.next.call(null,coll));
});
/**
* Takes a JavaScript object and a map of names to functions and
* attaches said functions as methods on the object.  Any references to
* JavaScript's implict this (via the this-as macro) will resolve to the
* object that the function is attached.
*/
cljs.core.extend_object_BANG_ = (function extend_object_BANG_(obj,fn_map){
var G__3680__3681 = cljs.core.seq.call(null,fn_map);

if(cljs.core.truth_(G__3680__3681))
{var G__3683__3685 = cljs.core.first.call(null,G__3680__3681);
var vec__3684__3686 = G__3683__3685;
var key_name__3687 = cljs.core.nth.call(null,vec__3684__3686,0,null);
var f__3688 = cljs.core.nth.call(null,vec__3684__3686,1,null);
var G__3680__3689 = G__3680__3681;

var G__3683__3690 = G__3683__3685;
var G__3680__3691 = G__3680__3689;

while(true){
var vec__3692__3693 = G__3683__3690;
var key_name__3694 = cljs.core.nth.call(null,vec__3692__3693,0,null);
var f__3695 = cljs.core.nth.call(null,vec__3692__3693,1,null);
var G__3680__3696 = G__3680__3691;

var str_name__3697 = cljs.core.name.call(null,key_name__3694);

obj[str_name__3697] = f__3695;
var temp__3698__auto____3698 = cljs.core.next.call(null,G__3680__3696);

if(cljs.core.truth_(temp__3698__auto____3698))
{var G__3680__3699 = temp__3698__auto____3698;

{
var G__3700 = cljs.core.first.call(null,G__3680__3699);
var G__3701 = G__3680__3699;
G__3683__3690 = G__3700;
G__3680__3691 = G__3701;
continue;
}
} else
{}
break;
}
} else
{}
return obj;
});

/**
* @constructor
*/
cljs.core.List = (function (meta,first,rest,count){
this.meta = meta;
this.first = first;
this.rest = rest;
this.count = count;
})
cljs.core.List.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.List");
});
cljs.core.List.prototype.cljs$core$IHash$ = true;
cljs.core.List.prototype.cljs$core$IHash$_hash = (function (coll){
var this__3702 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__3703 = this;
return (new cljs.core.List(this__3703.meta,o,coll,(this__3703.count + 1)));
});
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__3704 = this;
return coll;
});
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = (function (coll){
var this__3705 = this;
return this__3705.count;
});
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = (function (coll){
var this__3706 = this;
return this__3706.first;
});
cljs.core.List.prototype.cljs$core$IStack$_pop = (function (coll){
var this__3707 = this;
return cljs.core._rest.call(null,coll);
});
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = (function (coll){
var this__3708 = this;
return this__3708.first;
});
cljs.core.List.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__3709 = this;
return this__3709.rest;
});
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__3710 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__3711 = this;
return (new cljs.core.List(meta,this__3711.first,this__3711.rest,this__3711.count));
});
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__3712 = this;
return this__3712.meta;
});
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__3713 = this;
return cljs.core.List.EMPTY;
});
cljs.core.List;

/**
* @constructor
*/
cljs.core.EmptyList = (function (meta){
this.meta = meta;
})
cljs.core.EmptyList.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.EmptyList");
});
cljs.core.EmptyList.prototype.cljs$core$IHash$ = true;
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash = (function (coll){
var this__3714 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__3715 = this;
return (new cljs.core.List(this__3715.meta,o,null,1));
});
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__3716 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = (function (coll){
var this__3717 = this;
return 0;
});
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = (function (coll){
var this__3718 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = (function (coll){
var this__3719 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = (function (coll){
var this__3720 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__3721 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__3722 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__3723 = this;
return (new cljs.core.EmptyList(meta));
});
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__3724 = this;
return this__3724.meta;
});
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__3725 = this;
return coll;
});
cljs.core.EmptyList;
cljs.core.List.EMPTY = (new cljs.core.EmptyList(null));
/**
* Returns a seq of the items in coll in reverse order. Not lazy.
*/
cljs.core.reverse = (function reverse(coll){
return cljs.core.reduce.call(null,cljs.core.conj,cljs.core.List.EMPTY,coll);
});
/**
* @param {...*} var_args
*/
cljs.core.list = (function() { 
var list__delegate = function (items){
return cljs.core.reduce.call(null,cljs.core.conj,cljs.core.List.EMPTY,cljs.core.reverse.call(null,items));
};
var list = function (var_args){
var items = null;
if (goog.isDef(var_args)) {
  items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return list__delegate.call(this, items);
};
list.cljs$lang$maxFixedArity = 0;
list.cljs$lang$applyTo = (function (arglist__3726){
var items = cljs.core.seq( arglist__3726 );;
return list__delegate.call(this, items);
});
return list;
})()
;

/**
* @constructor
*/
cljs.core.Cons = (function (meta,first,rest){
this.meta = meta;
this.first = first;
this.rest = rest;
})
cljs.core.Cons.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Cons");
});
cljs.core.Cons.prototype.cljs$core$ISeqable$ = true;
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__3727 = this;
return coll;
});
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = (function (coll){
var this__3728 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__3729 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__3730 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__3730.meta);
});
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__3731 = this;
return (new cljs.core.Cons(null,o,coll));
});
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = (function (coll){
var this__3732 = this;
return this__3732.first;
});
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__3733 = this;
if(cljs.core.truth_((this__3733.rest === null)))
{return cljs.core.List.EMPTY;
} else
{return this__3733.rest;
}
});
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__3734 = this;
return this__3734.meta;
});
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__3735 = this;
return (new cljs.core.Cons(meta,this__3735.first,this__3735.rest));
});
cljs.core.Cons;
/**
* Returns a new seq where x is the first element and seq is the rest.
*/
cljs.core.cons = (function cons(x,seq){
return (new cljs.core.Cons(null,x,seq));
});
(cljs.core.IReduce["string"] = true);
(cljs.core._reduce["string"] = (function() {
var G__3736 = null;
var G__3736__3737 = (function (string,f){
return cljs.core.ci_reduce.call(null,string,f);
});
var G__3736__3738 = (function (string,f,start){
return cljs.core.ci_reduce.call(null,string,f,start);
});
G__3736 = function(string,f,start){
switch(arguments.length){
case  2 :
return G__3736__3737.call(this,string,f);
case  3 :
return G__3736__3738.call(this,string,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3736;
})()
);
(cljs.core.ILookup["string"] = true);
(cljs.core._lookup["string"] = (function() {
var G__3740 = null;
var G__3740__3741 = (function (string,k){
return cljs.core._nth.call(null,string,k);
});
var G__3740__3742 = (function (string,k,not_found){
return cljs.core._nth.call(null,string,k,not_found);
});
G__3740 = function(string,k,not_found){
switch(arguments.length){
case  2 :
return G__3740__3741.call(this,string,k);
case  3 :
return G__3740__3742.call(this,string,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3740;
})()
);
(cljs.core.IIndexed["string"] = true);
(cljs.core._nth["string"] = (function() {
var G__3744 = null;
var G__3744__3745 = (function (string,n){
if(cljs.core.truth_((n < cljs.core._count.call(null,string))))
{return string.charAt(n);
} else
{return null;
}
});
var G__3744__3746 = (function (string,n,not_found){
if(cljs.core.truth_((n < cljs.core._count.call(null,string))))
{return string.charAt(n);
} else
{return not_found;
}
});
G__3744 = function(string,n,not_found){
switch(arguments.length){
case  2 :
return G__3744__3745.call(this,string,n);
case  3 :
return G__3744__3746.call(this,string,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3744;
})()
);
(cljs.core.ICounted["string"] = true);
(cljs.core._count["string"] = (function (s){
return s.length;
}));
(cljs.core.ISeqable["string"] = true);
(cljs.core._seq["string"] = (function (string){
return cljs.core.prim_seq.call(null,string,0);
}));
(cljs.core.IHash["string"] = true);
(cljs.core._hash["string"] = (function (o){
return goog.string.hashCode.call(null,o);
}));
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = (function() {
var G__3754 = null;
var G__3754__3755 = (function (tsym3748,coll){
var tsym3748__3750 = this;

var this$__3751 = tsym3748__3750;

return cljs.core.get.call(null,coll,this$__3751.toString());
});
var G__3754__3756 = (function (tsym3749,coll,not_found){
var tsym3749__3752 = this;

var this$__3753 = tsym3749__3752;

return cljs.core.get.call(null,coll,this$__3753.toString(),not_found);
});
G__3754 = function(tsym3749,coll,not_found){
switch(arguments.length){
case  2 :
return G__3754__3755.call(this,tsym3749,coll);
case  3 :
return G__3754__3756.call(this,tsym3749,coll,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__3754;
})()
;
String['prototype']['apply'] = (function (s,args){
if(cljs.core.truth_((cljs.core.count.call(null,args) < 2)))
{return cljs.core.get.call(null,(args[0]),s);
} else
{return cljs.core.get.call(null,(args[0]),s,(args[1]));
}
});
cljs.core.lazy_seq_value = (function lazy_seq_value(lazy_seq){
var x__3758 = lazy_seq.x;

if(cljs.core.truth_(lazy_seq.realized))
{return x__3758;
} else
{lazy_seq.x = x__3758.call(null);
lazy_seq.realized = true;
return lazy_seq.x;
}
});

/**
* @constructor
*/
cljs.core.LazySeq = (function (meta,realized,x){
this.meta = meta;
this.realized = realized;
this.x = x;
})
cljs.core.LazySeq.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.LazySeq");
});
cljs.core.LazySeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__3759 = this;
return cljs.core.seq.call(null,cljs.core.lazy_seq_value.call(null,coll));
});
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = (function (coll){
var this__3760 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__3761 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__3762 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__3762.meta);
});
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__3763 = this;
return cljs.core.cons.call(null,o,coll);
});
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = (function (coll){
var this__3764 = this;
return cljs.core.first.call(null,cljs.core.lazy_seq_value.call(null,coll));
});
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__3765 = this;
return cljs.core.rest.call(null,cljs.core.lazy_seq_value.call(null,coll));
});
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__3766 = this;
return this__3766.meta;
});
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__3767 = this;
return (new cljs.core.LazySeq(meta,this__3767.realized,this__3767.x));
});
cljs.core.LazySeq;
/**
* Naive impl of to-array as a start.
*/
cljs.core.to_array = (function to_array(s){
var ary__3768 = [];

var s__3769 = s;

while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,s__3769)))
{ary__3768.push(cljs.core.first.call(null,s__3769));
{
var G__3770 = cljs.core.next.call(null,s__3769);
s__3769 = G__3770;
continue;
}
} else
{return ary__3768;
}
break;
}
});
cljs.core.bounded_count = (function bounded_count(s,n){
var s__3771 = s;
var i__3772 = n;
var sum__3773 = 0;

while(true){
if(cljs.core.truth_((function (){var and__3546__auto____3774 = (i__3772 > 0);

if(cljs.core.truth_(and__3546__auto____3774))
{return cljs.core.seq.call(null,s__3771);
} else
{return and__3546__auto____3774;
}
})()))
{{
var G__3775 = cljs.core.next.call(null,s__3771);
var G__3776 = (i__3772 - 1);
var G__3777 = (sum__3773 + 1);
s__3771 = G__3775;
i__3772 = G__3776;
sum__3773 = G__3777;
continue;
}
} else
{return sum__3773;
}
break;
}
});
cljs.core.spread = (function spread(arglist){
if(cljs.core.truth_((arglist === null)))
{return null;
} else
{if(cljs.core.truth_((cljs.core.next.call(null,arglist) === null)))
{return cljs.core.seq.call(null,cljs.core.first.call(null,arglist));
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return cljs.core.cons.call(null,cljs.core.first.call(null,arglist),spread.call(null,cljs.core.next.call(null,arglist)));
} else
{return null;
}
}
}
});
/**
* Returns a lazy seq representing the concatenation of the elements in the supplied colls.
* @param {...*} var_args
*/
cljs.core.concat = (function() {
var concat = null;
var concat__3781 = (function (){
return (new cljs.core.LazySeq(null,false,(function (){
return null;
})));
});
var concat__3782 = (function (x){
return (new cljs.core.LazySeq(null,false,(function (){
return x;
})));
});
var concat__3783 = (function (x,y){
return (new cljs.core.LazySeq(null,false,(function (){
var s__3778 = cljs.core.seq.call(null,x);

if(cljs.core.truth_(s__3778))
{return cljs.core.cons.call(null,cljs.core.first.call(null,s__3778),concat.call(null,cljs.core.rest.call(null,s__3778),y));
} else
{return y;
}
})));
});
var concat__3784 = (function() { 
var G__3786__delegate = function (x,y,zs){
var cat__3780 = (function cat(xys,zs){
return (new cljs.core.LazySeq(null,false,(function (){
var xys__3779 = cljs.core.seq.call(null,xys);

if(cljs.core.truth_(xys__3779))
{return cljs.core.cons.call(null,cljs.core.first.call(null,xys__3779),cat.call(null,cljs.core.rest.call(null,xys__3779),zs));
} else
{if(cljs.core.truth_(zs))
{return cat.call(null,cljs.core.first.call(null,zs),cljs.core.next.call(null,zs));
} else
{return null;
}
}
})));
});

return cat__3780.call(null,concat.call(null,x,y),zs);
};
var G__3786 = function (x,y,var_args){
var zs = null;
if (goog.isDef(var_args)) {
  zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3786__delegate.call(this, x, y, zs);
};
G__3786.cljs$lang$maxFixedArity = 2;
G__3786.cljs$lang$applyTo = (function (arglist__3787){
var x = cljs.core.first(arglist__3787);
var y = cljs.core.first(cljs.core.next(arglist__3787));
var zs = cljs.core.rest(cljs.core.next(arglist__3787));
return G__3786__delegate.call(this, x, y, zs);
});
return G__3786;
})()
;
concat = function(x,y,var_args){
var zs = var_args;
switch(arguments.length){
case  0 :
return concat__3781.call(this);
case  1 :
return concat__3782.call(this,x);
case  2 :
return concat__3783.call(this,x,y);
default:
return concat__3784.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
concat.cljs$lang$maxFixedArity = 2;
concat.cljs$lang$applyTo = concat__3784.cljs$lang$applyTo;
return concat;
})()
;
/**
* Creates a new list containing the items prepended to the rest, the
* last of which will be treated as a sequence.
* @param {...*} var_args
*/
cljs.core.list_STAR_ = (function() {
var list_STAR_ = null;
var list_STAR___3788 = (function (args){
return cljs.core.seq.call(null,args);
});
var list_STAR___3789 = (function (a,args){
return cljs.core.cons.call(null,a,args);
});
var list_STAR___3790 = (function (a,b,args){
return cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,args));
});
var list_STAR___3791 = (function (a,b,c,args){
return cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,cljs.core.cons.call(null,c,args)));
});
var list_STAR___3792 = (function() { 
var G__3794__delegate = function (a,b,c,d,more){
return cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,cljs.core.cons.call(null,c,cljs.core.cons.call(null,d,cljs.core.spread.call(null,more)))));
};
var G__3794 = function (a,b,c,d,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4),0);
} 
return G__3794__delegate.call(this, a, b, c, d, more);
};
G__3794.cljs$lang$maxFixedArity = 4;
G__3794.cljs$lang$applyTo = (function (arglist__3795){
var a = cljs.core.first(arglist__3795);
var b = cljs.core.first(cljs.core.next(arglist__3795));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3795)));
var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3795))));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3795))));
return G__3794__delegate.call(this, a, b, c, d, more);
});
return G__3794;
})()
;
list_STAR_ = function(a,b,c,d,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return list_STAR___3788.call(this,a);
case  2 :
return list_STAR___3789.call(this,a,b);
case  3 :
return list_STAR___3790.call(this,a,b,c);
case  4 :
return list_STAR___3791.call(this,a,b,c,d);
default:
return list_STAR___3792.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
list_STAR_.cljs$lang$maxFixedArity = 4;
list_STAR_.cljs$lang$applyTo = list_STAR___3792.cljs$lang$applyTo;
return list_STAR_;
})()
;
/**
* Applies fn f to the argument list formed by prepending intervening arguments to args.
* First cut.  Not lazy.  Needs to use emitted toApply.
* @param {...*} var_args
*/
cljs.core.apply = (function() {
var apply = null;
var apply__3805 = (function (f,args){
var fixed_arity__3796 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,args,(fixed_arity__3796 + 1)) <= fixed_arity__3796)))
{return f.apply(f,cljs.core.to_array.call(null,args));
} else
{return f.cljs$lang$applyTo(args);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,args));
}
});
var apply__3806 = (function (f,x,args){
var arglist__3797 = cljs.core.list_STAR_.call(null,x,args);
var fixed_arity__3798 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__3797,fixed_arity__3798) <= fixed_arity__3798)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__3797));
} else
{return f.cljs$lang$applyTo(arglist__3797);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__3797));
}
});
var apply__3807 = (function (f,x,y,args){
var arglist__3799 = cljs.core.list_STAR_.call(null,x,y,args);
var fixed_arity__3800 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__3799,fixed_arity__3800) <= fixed_arity__3800)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__3799));
} else
{return f.cljs$lang$applyTo(arglist__3799);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__3799));
}
});
var apply__3808 = (function (f,x,y,z,args){
var arglist__3801 = cljs.core.list_STAR_.call(null,x,y,z,args);
var fixed_arity__3802 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__3801,fixed_arity__3802) <= fixed_arity__3802)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__3801));
} else
{return f.cljs$lang$applyTo(arglist__3801);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__3801));
}
});
var apply__3809 = (function() { 
var G__3811__delegate = function (f,a,b,c,d,args){
var arglist__3803 = cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,cljs.core.cons.call(null,c,cljs.core.cons.call(null,d,cljs.core.spread.call(null,args)))));
var fixed_arity__3804 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__3803,fixed_arity__3804) <= fixed_arity__3804)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__3803));
} else
{return f.cljs$lang$applyTo(arglist__3803);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__3803));
}
};
var G__3811 = function (f,a,b,c,d,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5),0);
} 
return G__3811__delegate.call(this, f, a, b, c, d, args);
};
G__3811.cljs$lang$maxFixedArity = 5;
G__3811.cljs$lang$applyTo = (function (arglist__3812){
var f = cljs.core.first(arglist__3812);
var a = cljs.core.first(cljs.core.next(arglist__3812));
var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3812)));
var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3812))));
var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3812)))));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3812)))));
return G__3811__delegate.call(this, f, a, b, c, d, args);
});
return G__3811;
})()
;
apply = function(f,a,b,c,d,var_args){
var args = var_args;
switch(arguments.length){
case  2 :
return apply__3805.call(this,f,a);
case  3 :
return apply__3806.call(this,f,a,b);
case  4 :
return apply__3807.call(this,f,a,b,c);
case  5 :
return apply__3808.call(this,f,a,b,c,d);
default:
return apply__3809.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
apply.cljs$lang$maxFixedArity = 5;
apply.cljs$lang$applyTo = apply__3809.cljs$lang$applyTo;
return apply;
})()
;
/**
* Returns an object of the same type and value as obj, with
* (apply f (meta obj) args) as its metadata.
* @param {...*} var_args
*/
cljs.core.vary_meta = (function() { 
var vary_meta__delegate = function (obj,f,args){
return cljs.core.with_meta.call(null,obj,cljs.core.apply.call(null,f,cljs.core.meta.call(null,obj),args));
};
var vary_meta = function (obj,f,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return vary_meta__delegate.call(this, obj, f, args);
};
vary_meta.cljs$lang$maxFixedArity = 2;
vary_meta.cljs$lang$applyTo = (function (arglist__3813){
var obj = cljs.core.first(arglist__3813);
var f = cljs.core.first(cljs.core.next(arglist__3813));
var args = cljs.core.rest(cljs.core.next(arglist__3813));
return vary_meta__delegate.call(this, obj, f, args);
});
return vary_meta;
})()
;
/**
* Same as (not (= obj1 obj2))
* @param {...*} var_args
*/
cljs.core.not_EQ_ = (function() {
var not_EQ_ = null;
var not_EQ___3814 = (function (x){
return false;
});
var not_EQ___3815 = (function (x,y){
return cljs.core.not.call(null,cljs.core._EQ_.call(null,x,y));
});
var not_EQ___3816 = (function() { 
var G__3818__delegate = function (x,y,more){
return cljs.core.not.call(null,cljs.core.apply.call(null,cljs.core._EQ_,x,y,more));
};
var G__3818 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3818__delegate.call(this, x, y, more);
};
G__3818.cljs$lang$maxFixedArity = 2;
G__3818.cljs$lang$applyTo = (function (arglist__3819){
var x = cljs.core.first(arglist__3819);
var y = cljs.core.first(cljs.core.next(arglist__3819));
var more = cljs.core.rest(cljs.core.next(arglist__3819));
return G__3818__delegate.call(this, x, y, more);
});
return G__3818;
})()
;
not_EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return not_EQ___3814.call(this,x);
case  2 :
return not_EQ___3815.call(this,x,y);
default:
return not_EQ___3816.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
not_EQ_.cljs$lang$maxFixedArity = 2;
not_EQ_.cljs$lang$applyTo = not_EQ___3816.cljs$lang$applyTo;
return not_EQ_;
})()
;
/**
* If coll is empty, returns nil, else coll
*/
cljs.core.not_empty = (function not_empty(coll){
if(cljs.core.truth_(cljs.core.seq.call(null,coll)))
{return coll;
} else
{return null;
}
});
/**
* Returns true if (pred x) is logical true for every x in coll, else
* false.
*/
cljs.core.every_QMARK_ = (function every_QMARK_(pred,coll){
while(true){
if(cljs.core.truth_((cljs.core.seq.call(null,coll) === null)))
{return true;
} else
{if(cljs.core.truth_(pred.call(null,cljs.core.first.call(null,coll))))
{{
var G__3820 = pred;
var G__3821 = cljs.core.next.call(null,coll);
pred = G__3820;
coll = G__3821;
continue;
}
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return false;
} else
{return null;
}
}
}
break;
}
});
/**
* Returns false if (pred x) is logical true for every x in
* coll, else true.
*/
cljs.core.not_every_QMARK_ = (function not_every_QMARK_(pred,coll){
return cljs.core.not.call(null,cljs.core.every_QMARK_.call(null,pred,coll));
});
/**
* Returns the first logical true value of (pred x) for any x in coll,
* else nil.  One common idiom is to use a set as pred, for example
* this will return :fred if :fred is in the sequence, otherwise nil:
* (some #{:fred} coll)
*/
cljs.core.some = (function some(pred,coll){
while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,coll)))
{var or__3548__auto____3822 = pred.call(null,cljs.core.first.call(null,coll));

if(cljs.core.truth_(or__3548__auto____3822))
{return or__3548__auto____3822;
} else
{{
var G__3823 = pred;
var G__3824 = cljs.core.next.call(null,coll);
pred = G__3823;
coll = G__3824;
continue;
}
}
} else
{return null;
}
break;
}
});
/**
* Returns false if (pred x) is logical true for any x in coll,
* else true.
*/
cljs.core.not_any_QMARK_ = (function not_any_QMARK_(pred,coll){
return cljs.core.not.call(null,cljs.core.some.call(null,pred,coll));
});
/**
* Returns true if n is even, throws an exception if n is not an integer
*/
cljs.core.even_QMARK_ = (function even_QMARK_(n){
if(cljs.core.truth_(cljs.core.integer_QMARK_.call(null,n)))
{return ((n & 1) === 0);
} else
{throw (new Error(cljs.core.str.call(null,"Argument must be an integer: ",n)));
}
});
/**
* Returns true if n is odd, throws an exception if n is not an integer
*/
cljs.core.odd_QMARK_ = (function odd_QMARK_(n){
return cljs.core.not.call(null,cljs.core.even_QMARK_.call(null,n));
});
cljs.core.identity = (function identity(x){
return x;
});
/**
* Takes a fn f and returns a fn that takes the same arguments as f,
* has the same effects, if any, and returns the opposite truth value.
*/
cljs.core.complement = (function complement(f){
return (function() {
var G__3825 = null;
var G__3825__3826 = (function (){
return cljs.core.not.call(null,f.call(null));
});
var G__3825__3827 = (function (x){
return cljs.core.not.call(null,f.call(null,x));
});
var G__3825__3828 = (function (x,y){
return cljs.core.not.call(null,f.call(null,x,y));
});
var G__3825__3829 = (function() { 
var G__3831__delegate = function (x,y,zs){
return cljs.core.not.call(null,cljs.core.apply.call(null,f,x,y,zs));
};
var G__3831 = function (x,y,var_args){
var zs = null;
if (goog.isDef(var_args)) {
  zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__3831__delegate.call(this, x, y, zs);
};
G__3831.cljs$lang$maxFixedArity = 2;
G__3831.cljs$lang$applyTo = (function (arglist__3832){
var x = cljs.core.first(arglist__3832);
var y = cljs.core.first(cljs.core.next(arglist__3832));
var zs = cljs.core.rest(cljs.core.next(arglist__3832));
return G__3831__delegate.call(this, x, y, zs);
});
return G__3831;
})()
;
G__3825 = function(x,y,var_args){
var zs = var_args;
switch(arguments.length){
case  0 :
return G__3825__3826.call(this);
case  1 :
return G__3825__3827.call(this,x);
case  2 :
return G__3825__3828.call(this,x,y);
default:
return G__3825__3829.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__3825.cljs$lang$maxFixedArity = 2;
G__3825.cljs$lang$applyTo = G__3825__3829.cljs$lang$applyTo;
return G__3825;
})()
});
/**
* Returns a function that takes any number of arguments and returns x.
*/
cljs.core.constantly = (function constantly(x){
return (function() { 
var G__3833__delegate = function (args){
return x;
};
var G__3833 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__3833__delegate.call(this, args);
};
G__3833.cljs$lang$maxFixedArity = 0;
G__3833.cljs$lang$applyTo = (function (arglist__3834){
var args = cljs.core.seq( arglist__3834 );;
return G__3833__delegate.call(this, args);
});
return G__3833;
})()
;
});
/**
* Takes a set of functions and returns a fn that is the composition
* of those fns.  The returned fn takes a variable number of args,
* applies the rightmost of fns to the args, the next
* fn (right-to-left) to the result, etc.
* @param {...*} var_args
*/
cljs.core.comp = (function() {
var comp = null;
var comp__3838 = (function (){
return cljs.core.identity;
});
var comp__3839 = (function (f){
return f;
});
var comp__3840 = (function (f,g){
return (function() {
var G__3844 = null;
var G__3844__3845 = (function (){
return f.call(null,g.call(null));
});
var G__3844__3846 = (function (x){
return f.call(null,g.call(null,x));
});
var G__3844__3847 = (function (x,y){
return f.call(null,g.call(null,x,y));
});
var G__3844__3848 = (function (x,y,z){
return f.call(null,g.call(null,x,y,z));
});
var G__3844__3849 = (function() { 
var G__3851__delegate = function (x,y,z,args){
return f.call(null,cljs.core.apply.call(null,g,x,y,z,args));
};
var G__3851 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3851__delegate.call(this, x, y, z, args);
};
G__3851.cljs$lang$maxFixedArity = 3;
G__3851.cljs$lang$applyTo = (function (arglist__3852){
var x = cljs.core.first(arglist__3852);
var y = cljs.core.first(cljs.core.next(arglist__3852));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3852)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3852)));
return G__3851__delegate.call(this, x, y, z, args);
});
return G__3851;
})()
;
G__3844 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__3844__3845.call(this);
case  1 :
return G__3844__3846.call(this,x);
case  2 :
return G__3844__3847.call(this,x,y);
case  3 :
return G__3844__3848.call(this,x,y,z);
default:
return G__3844__3849.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__3844.cljs$lang$maxFixedArity = 3;
G__3844.cljs$lang$applyTo = G__3844__3849.cljs$lang$applyTo;
return G__3844;
})()
});
var comp__3841 = (function (f,g,h){
return (function() {
var G__3853 = null;
var G__3853__3854 = (function (){
return f.call(null,g.call(null,h.call(null)));
});
var G__3853__3855 = (function (x){
return f.call(null,g.call(null,h.call(null,x)));
});
var G__3853__3856 = (function (x,y){
return f.call(null,g.call(null,h.call(null,x,y)));
});
var G__3853__3857 = (function (x,y,z){
return f.call(null,g.call(null,h.call(null,x,y,z)));
});
var G__3853__3858 = (function() { 
var G__3860__delegate = function (x,y,z,args){
return f.call(null,g.call(null,cljs.core.apply.call(null,h,x,y,z,args)));
};
var G__3860 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3860__delegate.call(this, x, y, z, args);
};
G__3860.cljs$lang$maxFixedArity = 3;
G__3860.cljs$lang$applyTo = (function (arglist__3861){
var x = cljs.core.first(arglist__3861);
var y = cljs.core.first(cljs.core.next(arglist__3861));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3861)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3861)));
return G__3860__delegate.call(this, x, y, z, args);
});
return G__3860;
})()
;
G__3853 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__3853__3854.call(this);
case  1 :
return G__3853__3855.call(this,x);
case  2 :
return G__3853__3856.call(this,x,y);
case  3 :
return G__3853__3857.call(this,x,y,z);
default:
return G__3853__3858.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__3853.cljs$lang$maxFixedArity = 3;
G__3853.cljs$lang$applyTo = G__3853__3858.cljs$lang$applyTo;
return G__3853;
})()
});
var comp__3842 = (function() { 
var G__3862__delegate = function (f1,f2,f3,fs){
var fs__3835 = cljs.core.reverse.call(null,cljs.core.list_STAR_.call(null,f1,f2,f3,fs));

return (function() { 
var G__3863__delegate = function (args){
var ret__3836 = cljs.core.apply.call(null,cljs.core.first.call(null,fs__3835),args);
var fs__3837 = cljs.core.next.call(null,fs__3835);

while(true){
if(cljs.core.truth_(fs__3837))
{{
var G__3864 = cljs.core.first.call(null,fs__3837).call(null,ret__3836);
var G__3865 = cljs.core.next.call(null,fs__3837);
ret__3836 = G__3864;
fs__3837 = G__3865;
continue;
}
} else
{return ret__3836;
}
break;
}
};
var G__3863 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__3863__delegate.call(this, args);
};
G__3863.cljs$lang$maxFixedArity = 0;
G__3863.cljs$lang$applyTo = (function (arglist__3866){
var args = cljs.core.seq( arglist__3866 );;
return G__3863__delegate.call(this, args);
});
return G__3863;
})()
;
};
var G__3862 = function (f1,f2,f3,var_args){
var fs = null;
if (goog.isDef(var_args)) {
  fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3862__delegate.call(this, f1, f2, f3, fs);
};
G__3862.cljs$lang$maxFixedArity = 3;
G__3862.cljs$lang$applyTo = (function (arglist__3867){
var f1 = cljs.core.first(arglist__3867);
var f2 = cljs.core.first(cljs.core.next(arglist__3867));
var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3867)));
var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3867)));
return G__3862__delegate.call(this, f1, f2, f3, fs);
});
return G__3862;
})()
;
comp = function(f1,f2,f3,var_args){
var fs = var_args;
switch(arguments.length){
case  0 :
return comp__3838.call(this);
case  1 :
return comp__3839.call(this,f1);
case  2 :
return comp__3840.call(this,f1,f2);
case  3 :
return comp__3841.call(this,f1,f2,f3);
default:
return comp__3842.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
comp.cljs$lang$maxFixedArity = 3;
comp.cljs$lang$applyTo = comp__3842.cljs$lang$applyTo;
return comp;
})()
;
/**
* Takes a function f and fewer than the normal arguments to f, and
* returns a fn that takes a variable number of additional args. When
* called, the returned function calls f with args + additional args.
* @param {...*} var_args
*/
cljs.core.partial = (function() {
var partial = null;
var partial__3868 = (function (f,arg1){
return (function() { 
var G__3873__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,args);
};
var G__3873 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__3873__delegate.call(this, args);
};
G__3873.cljs$lang$maxFixedArity = 0;
G__3873.cljs$lang$applyTo = (function (arglist__3874){
var args = cljs.core.seq( arglist__3874 );;
return G__3873__delegate.call(this, args);
});
return G__3873;
})()
;
});
var partial__3869 = (function (f,arg1,arg2){
return (function() { 
var G__3875__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,arg2,args);
};
var G__3875 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__3875__delegate.call(this, args);
};
G__3875.cljs$lang$maxFixedArity = 0;
G__3875.cljs$lang$applyTo = (function (arglist__3876){
var args = cljs.core.seq( arglist__3876 );;
return G__3875__delegate.call(this, args);
});
return G__3875;
})()
;
});
var partial__3870 = (function (f,arg1,arg2,arg3){
return (function() { 
var G__3877__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,arg2,arg3,args);
};
var G__3877 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__3877__delegate.call(this, args);
};
G__3877.cljs$lang$maxFixedArity = 0;
G__3877.cljs$lang$applyTo = (function (arglist__3878){
var args = cljs.core.seq( arglist__3878 );;
return G__3877__delegate.call(this, args);
});
return G__3877;
})()
;
});
var partial__3871 = (function() { 
var G__3879__delegate = function (f,arg1,arg2,arg3,more){
return (function() { 
var G__3880__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,arg2,arg3,cljs.core.concat.call(null,more,args));
};
var G__3880 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__3880__delegate.call(this, args);
};
G__3880.cljs$lang$maxFixedArity = 0;
G__3880.cljs$lang$applyTo = (function (arglist__3881){
var args = cljs.core.seq( arglist__3881 );;
return G__3880__delegate.call(this, args);
});
return G__3880;
})()
;
};
var G__3879 = function (f,arg1,arg2,arg3,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4),0);
} 
return G__3879__delegate.call(this, f, arg1, arg2, arg3, more);
};
G__3879.cljs$lang$maxFixedArity = 4;
G__3879.cljs$lang$applyTo = (function (arglist__3882){
var f = cljs.core.first(arglist__3882);
var arg1 = cljs.core.first(cljs.core.next(arglist__3882));
var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3882)));
var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3882))));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__3882))));
return G__3879__delegate.call(this, f, arg1, arg2, arg3, more);
});
return G__3879;
})()
;
partial = function(f,arg1,arg2,arg3,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return partial__3868.call(this,f,arg1);
case  3 :
return partial__3869.call(this,f,arg1,arg2);
case  4 :
return partial__3870.call(this,f,arg1,arg2,arg3);
default:
return partial__3871.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
partial.cljs$lang$maxFixedArity = 4;
partial.cljs$lang$applyTo = partial__3871.cljs$lang$applyTo;
return partial;
})()
;
/**
* Takes a function f, and returns a function that calls f, replacing
* a nil first argument to f with the supplied value x. Higher arity
* versions can replace arguments in the second and third
* positions (y, z). Note that the function f can take any number of
* arguments, not just the one(s) being nil-patched.
*/
cljs.core.fnil = (function() {
var fnil = null;
var fnil__3883 = (function (f,x){
return (function() {
var G__3887 = null;
var G__3887__3888 = (function (a){
return f.call(null,(cljs.core.truth_((a === null))?x:a));
});
var G__3887__3889 = (function (a,b){
return f.call(null,(cljs.core.truth_((a === null))?x:a),b);
});
var G__3887__3890 = (function (a,b,c){
return f.call(null,(cljs.core.truth_((a === null))?x:a),b,c);
});
var G__3887__3891 = (function() { 
var G__3893__delegate = function (a,b,c,ds){
return cljs.core.apply.call(null,f,(cljs.core.truth_((a === null))?x:a),b,c,ds);
};
var G__3893 = function (a,b,c,var_args){
var ds = null;
if (goog.isDef(var_args)) {
  ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3893__delegate.call(this, a, b, c, ds);
};
G__3893.cljs$lang$maxFixedArity = 3;
G__3893.cljs$lang$applyTo = (function (arglist__3894){
var a = cljs.core.first(arglist__3894);
var b = cljs.core.first(cljs.core.next(arglist__3894));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3894)));
var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3894)));
return G__3893__delegate.call(this, a, b, c, ds);
});
return G__3893;
})()
;
G__3887 = function(a,b,c,var_args){
var ds = var_args;
switch(arguments.length){
case  1 :
return G__3887__3888.call(this,a);
case  2 :
return G__3887__3889.call(this,a,b);
case  3 :
return G__3887__3890.call(this,a,b,c);
default:
return G__3887__3891.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__3887.cljs$lang$maxFixedArity = 3;
G__3887.cljs$lang$applyTo = G__3887__3891.cljs$lang$applyTo;
return G__3887;
})()
});
var fnil__3884 = (function (f,x,y){
return (function() {
var G__3895 = null;
var G__3895__3896 = (function (a,b){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b));
});
var G__3895__3897 = (function (a,b,c){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),c);
});
var G__3895__3898 = (function() { 
var G__3900__delegate = function (a,b,c,ds){
return cljs.core.apply.call(null,f,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),c,ds);
};
var G__3900 = function (a,b,c,var_args){
var ds = null;
if (goog.isDef(var_args)) {
  ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3900__delegate.call(this, a, b, c, ds);
};
G__3900.cljs$lang$maxFixedArity = 3;
G__3900.cljs$lang$applyTo = (function (arglist__3901){
var a = cljs.core.first(arglist__3901);
var b = cljs.core.first(cljs.core.next(arglist__3901));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3901)));
var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3901)));
return G__3900__delegate.call(this, a, b, c, ds);
});
return G__3900;
})()
;
G__3895 = function(a,b,c,var_args){
var ds = var_args;
switch(arguments.length){
case  2 :
return G__3895__3896.call(this,a,b);
case  3 :
return G__3895__3897.call(this,a,b,c);
default:
return G__3895__3898.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__3895.cljs$lang$maxFixedArity = 3;
G__3895.cljs$lang$applyTo = G__3895__3898.cljs$lang$applyTo;
return G__3895;
})()
});
var fnil__3885 = (function (f,x,y,z){
return (function() {
var G__3902 = null;
var G__3902__3903 = (function (a,b){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b));
});
var G__3902__3904 = (function (a,b,c){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),(cljs.core.truth_((c === null))?z:c));
});
var G__3902__3905 = (function() { 
var G__3907__delegate = function (a,b,c,ds){
return cljs.core.apply.call(null,f,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),(cljs.core.truth_((c === null))?z:c),ds);
};
var G__3907 = function (a,b,c,var_args){
var ds = null;
if (goog.isDef(var_args)) {
  ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3907__delegate.call(this, a, b, c, ds);
};
G__3907.cljs$lang$maxFixedArity = 3;
G__3907.cljs$lang$applyTo = (function (arglist__3908){
var a = cljs.core.first(arglist__3908);
var b = cljs.core.first(cljs.core.next(arglist__3908));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3908)));
var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3908)));
return G__3907__delegate.call(this, a, b, c, ds);
});
return G__3907;
})()
;
G__3902 = function(a,b,c,var_args){
var ds = var_args;
switch(arguments.length){
case  2 :
return G__3902__3903.call(this,a,b);
case  3 :
return G__3902__3904.call(this,a,b,c);
default:
return G__3902__3905.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__3902.cljs$lang$maxFixedArity = 3;
G__3902.cljs$lang$applyTo = G__3902__3905.cljs$lang$applyTo;
return G__3902;
})()
});
fnil = function(f,x,y,z){
switch(arguments.length){
case  2 :
return fnil__3883.call(this,f,x);
case  3 :
return fnil__3884.call(this,f,x,y);
case  4 :
return fnil__3885.call(this,f,x,y,z);
}
throw('Invalid arity: ' + arguments.length);
};
return fnil;
})()
;
/**
* Returns a lazy sequence consisting of the result of applying f to 0
* and the first item of coll, followed by applying f to 1 and the second
* item in coll, etc, until coll is exhausted. Thus function f should
* accept 2 arguments, index and item.
*/
cljs.core.map_indexed = (function map_indexed(f,coll){
var mapi__3911 = (function mpi(idx,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____3909 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____3909))
{var s__3910 = temp__3698__auto____3909;

return cljs.core.cons.call(null,f.call(null,idx,cljs.core.first.call(null,s__3910)),mpi.call(null,(idx + 1),cljs.core.rest.call(null,s__3910)));
} else
{return null;
}
})));
});

return mapi__3911.call(null,0,coll);
});
/**
* Returns a lazy sequence of the non-nil results of (f item). Note,
* this means false return values will be included.  f must be free of
* side-effects.
*/
cljs.core.keep = (function keep(f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____3912 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____3912))
{var s__3913 = temp__3698__auto____3912;

var x__3914 = f.call(null,cljs.core.first.call(null,s__3913));

if(cljs.core.truth_((x__3914 === null)))
{return keep.call(null,f,cljs.core.rest.call(null,s__3913));
} else
{return cljs.core.cons.call(null,x__3914,keep.call(null,f,cljs.core.rest.call(null,s__3913)));
}
} else
{return null;
}
})));
});
/**
* Returns a lazy sequence of the non-nil results of (f index item). Note,
* this means false return values will be included.  f must be free of
* side-effects.
*/
cljs.core.keep_indexed = (function keep_indexed(f,coll){
var keepi__3924 = (function kpi(idx,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____3921 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____3921))
{var s__3922 = temp__3698__auto____3921;

var x__3923 = f.call(null,idx,cljs.core.first.call(null,s__3922));

if(cljs.core.truth_((x__3923 === null)))
{return kpi.call(null,(idx + 1),cljs.core.rest.call(null,s__3922));
} else
{return cljs.core.cons.call(null,x__3923,kpi.call(null,(idx + 1),cljs.core.rest.call(null,s__3922)));
}
} else
{return null;
}
})));
});

return keepi__3924.call(null,0,coll);
});
/**
* Takes a set of predicates and returns a function f that returns true if all of its
* composing predicates return a logical true value against all of its arguments, else it returns
* false. Note that f is short-circuiting in that it will stop execution on the first
* argument that triggers a logical false result against the original predicates.
* @param {...*} var_args
*/
cljs.core.every_pred = (function() {
var every_pred = null;
var every_pred__3969 = (function (p){
return (function() {
var ep1 = null;
var ep1__3974 = (function (){
return true;
});
var ep1__3975 = (function (x){
return cljs.core.boolean$.call(null,p.call(null,x));
});
var ep1__3976 = (function (x,y){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3931 = p.call(null,x);

if(cljs.core.truth_(and__3546__auto____3931))
{return p.call(null,y);
} else
{return and__3546__auto____3931;
}
})());
});
var ep1__3977 = (function (x,y,z){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3932 = p.call(null,x);

if(cljs.core.truth_(and__3546__auto____3932))
{var and__3546__auto____3933 = p.call(null,y);

if(cljs.core.truth_(and__3546__auto____3933))
{return p.call(null,z);
} else
{return and__3546__auto____3933;
}
} else
{return and__3546__auto____3932;
}
})());
});
var ep1__3978 = (function() { 
var G__3980__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3934 = ep1.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____3934))
{return cljs.core.every_QMARK_.call(null,p,args);
} else
{return and__3546__auto____3934;
}
})());
};
var G__3980 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3980__delegate.call(this, x, y, z, args);
};
G__3980.cljs$lang$maxFixedArity = 3;
G__3980.cljs$lang$applyTo = (function (arglist__3981){
var x = cljs.core.first(arglist__3981);
var y = cljs.core.first(cljs.core.next(arglist__3981));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3981)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3981)));
return G__3980__delegate.call(this, x, y, z, args);
});
return G__3980;
})()
;
ep1 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return ep1__3974.call(this);
case  1 :
return ep1__3975.call(this,x);
case  2 :
return ep1__3976.call(this,x,y);
case  3 :
return ep1__3977.call(this,x,y,z);
default:
return ep1__3978.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
ep1.cljs$lang$maxFixedArity = 3;
ep1.cljs$lang$applyTo = ep1__3978.cljs$lang$applyTo;
return ep1;
})()
});
var every_pred__3970 = (function (p1,p2){
return (function() {
var ep2 = null;
var ep2__3982 = (function (){
return true;
});
var ep2__3983 = (function (x){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3935 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____3935))
{return p2.call(null,x);
} else
{return and__3546__auto____3935;
}
})());
});
var ep2__3984 = (function (x,y){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3936 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____3936))
{var and__3546__auto____3937 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____3937))
{var and__3546__auto____3938 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____3938))
{return p2.call(null,y);
} else
{return and__3546__auto____3938;
}
} else
{return and__3546__auto____3937;
}
} else
{return and__3546__auto____3936;
}
})());
});
var ep2__3985 = (function (x,y,z){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3939 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____3939))
{var and__3546__auto____3940 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____3940))
{var and__3546__auto____3941 = p1.call(null,z);

if(cljs.core.truth_(and__3546__auto____3941))
{var and__3546__auto____3942 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____3942))
{var and__3546__auto____3943 = p2.call(null,y);

if(cljs.core.truth_(and__3546__auto____3943))
{return p2.call(null,z);
} else
{return and__3546__auto____3943;
}
} else
{return and__3546__auto____3942;
}
} else
{return and__3546__auto____3941;
}
} else
{return and__3546__auto____3940;
}
} else
{return and__3546__auto____3939;
}
})());
});
var ep2__3986 = (function() { 
var G__3988__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3944 = ep2.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____3944))
{return cljs.core.every_QMARK_.call(null,(function (p1__3915_SHARP_){
var and__3546__auto____3945 = p1.call(null,p1__3915_SHARP_);

if(cljs.core.truth_(and__3546__auto____3945))
{return p2.call(null,p1__3915_SHARP_);
} else
{return and__3546__auto____3945;
}
}),args);
} else
{return and__3546__auto____3944;
}
})());
};
var G__3988 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3988__delegate.call(this, x, y, z, args);
};
G__3988.cljs$lang$maxFixedArity = 3;
G__3988.cljs$lang$applyTo = (function (arglist__3989){
var x = cljs.core.first(arglist__3989);
var y = cljs.core.first(cljs.core.next(arglist__3989));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3989)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3989)));
return G__3988__delegate.call(this, x, y, z, args);
});
return G__3988;
})()
;
ep2 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return ep2__3982.call(this);
case  1 :
return ep2__3983.call(this,x);
case  2 :
return ep2__3984.call(this,x,y);
case  3 :
return ep2__3985.call(this,x,y,z);
default:
return ep2__3986.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
ep2.cljs$lang$maxFixedArity = 3;
ep2.cljs$lang$applyTo = ep2__3986.cljs$lang$applyTo;
return ep2;
})()
});
var every_pred__3971 = (function (p1,p2,p3){
return (function() {
var ep3 = null;
var ep3__3990 = (function (){
return true;
});
var ep3__3991 = (function (x){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3946 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____3946))
{var and__3546__auto____3947 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____3947))
{return p3.call(null,x);
} else
{return and__3546__auto____3947;
}
} else
{return and__3546__auto____3946;
}
})());
});
var ep3__3992 = (function (x,y){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3948 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____3948))
{var and__3546__auto____3949 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____3949))
{var and__3546__auto____3950 = p3.call(null,x);

if(cljs.core.truth_(and__3546__auto____3950))
{var and__3546__auto____3951 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____3951))
{var and__3546__auto____3952 = p2.call(null,y);

if(cljs.core.truth_(and__3546__auto____3952))
{return p3.call(null,y);
} else
{return and__3546__auto____3952;
}
} else
{return and__3546__auto____3951;
}
} else
{return and__3546__auto____3950;
}
} else
{return and__3546__auto____3949;
}
} else
{return and__3546__auto____3948;
}
})());
});
var ep3__3993 = (function (x,y,z){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3953 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____3953))
{var and__3546__auto____3954 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____3954))
{var and__3546__auto____3955 = p3.call(null,x);

if(cljs.core.truth_(and__3546__auto____3955))
{var and__3546__auto____3956 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____3956))
{var and__3546__auto____3957 = p2.call(null,y);

if(cljs.core.truth_(and__3546__auto____3957))
{var and__3546__auto____3958 = p3.call(null,y);

if(cljs.core.truth_(and__3546__auto____3958))
{var and__3546__auto____3959 = p1.call(null,z);

if(cljs.core.truth_(and__3546__auto____3959))
{var and__3546__auto____3960 = p2.call(null,z);

if(cljs.core.truth_(and__3546__auto____3960))
{return p3.call(null,z);
} else
{return and__3546__auto____3960;
}
} else
{return and__3546__auto____3959;
}
} else
{return and__3546__auto____3958;
}
} else
{return and__3546__auto____3957;
}
} else
{return and__3546__auto____3956;
}
} else
{return and__3546__auto____3955;
}
} else
{return and__3546__auto____3954;
}
} else
{return and__3546__auto____3953;
}
})());
});
var ep3__3994 = (function() { 
var G__3996__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3961 = ep3.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____3961))
{return cljs.core.every_QMARK_.call(null,(function (p1__3916_SHARP_){
var and__3546__auto____3962 = p1.call(null,p1__3916_SHARP_);

if(cljs.core.truth_(and__3546__auto____3962))
{var and__3546__auto____3963 = p2.call(null,p1__3916_SHARP_);

if(cljs.core.truth_(and__3546__auto____3963))
{return p3.call(null,p1__3916_SHARP_);
} else
{return and__3546__auto____3963;
}
} else
{return and__3546__auto____3962;
}
}),args);
} else
{return and__3546__auto____3961;
}
})());
};
var G__3996 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3996__delegate.call(this, x, y, z, args);
};
G__3996.cljs$lang$maxFixedArity = 3;
G__3996.cljs$lang$applyTo = (function (arglist__3997){
var x = cljs.core.first(arglist__3997);
var y = cljs.core.first(cljs.core.next(arglist__3997));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__3997)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__3997)));
return G__3996__delegate.call(this, x, y, z, args);
});
return G__3996;
})()
;
ep3 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return ep3__3990.call(this);
case  1 :
return ep3__3991.call(this,x);
case  2 :
return ep3__3992.call(this,x,y);
case  3 :
return ep3__3993.call(this,x,y,z);
default:
return ep3__3994.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
ep3.cljs$lang$maxFixedArity = 3;
ep3.cljs$lang$applyTo = ep3__3994.cljs$lang$applyTo;
return ep3;
})()
});
var every_pred__3972 = (function() { 
var G__3998__delegate = function (p1,p2,p3,ps){
var ps__3964 = cljs.core.list_STAR_.call(null,p1,p2,p3,ps);

return (function() {
var epn = null;
var epn__3999 = (function (){
return true;
});
var epn__4000 = (function (x){
return cljs.core.every_QMARK_.call(null,(function (p1__3917_SHARP_){
return p1__3917_SHARP_.call(null,x);
}),ps__3964);
});
var epn__4001 = (function (x,y){
return cljs.core.every_QMARK_.call(null,(function (p1__3918_SHARP_){
var and__3546__auto____3965 = p1__3918_SHARP_.call(null,x);

if(cljs.core.truth_(and__3546__auto____3965))
{return p1__3918_SHARP_.call(null,y);
} else
{return and__3546__auto____3965;
}
}),ps__3964);
});
var epn__4002 = (function (x,y,z){
return cljs.core.every_QMARK_.call(null,(function (p1__3919_SHARP_){
var and__3546__auto____3966 = p1__3919_SHARP_.call(null,x);

if(cljs.core.truth_(and__3546__auto____3966))
{var and__3546__auto____3967 = p1__3919_SHARP_.call(null,y);

if(cljs.core.truth_(and__3546__auto____3967))
{return p1__3919_SHARP_.call(null,z);
} else
{return and__3546__auto____3967;
}
} else
{return and__3546__auto____3966;
}
}),ps__3964);
});
var epn__4003 = (function() { 
var G__4005__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____3968 = epn.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____3968))
{return cljs.core.every_QMARK_.call(null,(function (p1__3920_SHARP_){
return cljs.core.every_QMARK_.call(null,p1__3920_SHARP_,args);
}),ps__3964);
} else
{return and__3546__auto____3968;
}
})());
};
var G__4005 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4005__delegate.call(this, x, y, z, args);
};
G__4005.cljs$lang$maxFixedArity = 3;
G__4005.cljs$lang$applyTo = (function (arglist__4006){
var x = cljs.core.first(arglist__4006);
var y = cljs.core.first(cljs.core.next(arglist__4006));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4006)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4006)));
return G__4005__delegate.call(this, x, y, z, args);
});
return G__4005;
})()
;
epn = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return epn__3999.call(this);
case  1 :
return epn__4000.call(this,x);
case  2 :
return epn__4001.call(this,x,y);
case  3 :
return epn__4002.call(this,x,y,z);
default:
return epn__4003.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
epn.cljs$lang$maxFixedArity = 3;
epn.cljs$lang$applyTo = epn__4003.cljs$lang$applyTo;
return epn;
})()
};
var G__3998 = function (p1,p2,p3,var_args){
var ps = null;
if (goog.isDef(var_args)) {
  ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__3998__delegate.call(this, p1, p2, p3, ps);
};
G__3998.cljs$lang$maxFixedArity = 3;
G__3998.cljs$lang$applyTo = (function (arglist__4007){
var p1 = cljs.core.first(arglist__4007);
var p2 = cljs.core.first(cljs.core.next(arglist__4007));
var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4007)));
var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4007)));
return G__3998__delegate.call(this, p1, p2, p3, ps);
});
return G__3998;
})()
;
every_pred = function(p1,p2,p3,var_args){
var ps = var_args;
switch(arguments.length){
case  1 :
return every_pred__3969.call(this,p1);
case  2 :
return every_pred__3970.call(this,p1,p2);
case  3 :
return every_pred__3971.call(this,p1,p2,p3);
default:
return every_pred__3972.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
every_pred.cljs$lang$maxFixedArity = 3;
every_pred.cljs$lang$applyTo = every_pred__3972.cljs$lang$applyTo;
return every_pred;
})()
;
/**
* Takes a set of predicates and returns a function f that returns the first logical true value
* returned by one of its composing predicates against any of its arguments, else it returns
* logical false. Note that f is short-circuiting in that it will stop execution on the first
* argument that triggers a logical true result against the original predicates.
* @param {...*} var_args
*/
cljs.core.some_fn = (function() {
var some_fn = null;
var some_fn__4047 = (function (p){
return (function() {
var sp1 = null;
var sp1__4052 = (function (){
return null;
});
var sp1__4053 = (function (x){
return p.call(null,x);
});
var sp1__4054 = (function (x,y){
var or__3548__auto____4009 = p.call(null,x);

if(cljs.core.truth_(or__3548__auto____4009))
{return or__3548__auto____4009;
} else
{return p.call(null,y);
}
});
var sp1__4055 = (function (x,y,z){
var or__3548__auto____4010 = p.call(null,x);

if(cljs.core.truth_(or__3548__auto____4010))
{return or__3548__auto____4010;
} else
{var or__3548__auto____4011 = p.call(null,y);

if(cljs.core.truth_(or__3548__auto____4011))
{return or__3548__auto____4011;
} else
{return p.call(null,z);
}
}
});
var sp1__4056 = (function() { 
var G__4058__delegate = function (x,y,z,args){
var or__3548__auto____4012 = sp1.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4012))
{return or__3548__auto____4012;
} else
{return cljs.core.some.call(null,p,args);
}
};
var G__4058 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4058__delegate.call(this, x, y, z, args);
};
G__4058.cljs$lang$maxFixedArity = 3;
G__4058.cljs$lang$applyTo = (function (arglist__4059){
var x = cljs.core.first(arglist__4059);
var y = cljs.core.first(cljs.core.next(arglist__4059));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4059)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4059)));
return G__4058__delegate.call(this, x, y, z, args);
});
return G__4058;
})()
;
sp1 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return sp1__4052.call(this);
case  1 :
return sp1__4053.call(this,x);
case  2 :
return sp1__4054.call(this,x,y);
case  3 :
return sp1__4055.call(this,x,y,z);
default:
return sp1__4056.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
sp1.cljs$lang$maxFixedArity = 3;
sp1.cljs$lang$applyTo = sp1__4056.cljs$lang$applyTo;
return sp1;
})()
});
var some_fn__4048 = (function (p1,p2){
return (function() {
var sp2 = null;
var sp2__4060 = (function (){
return null;
});
var sp2__4061 = (function (x){
var or__3548__auto____4013 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4013))
{return or__3548__auto____4013;
} else
{return p2.call(null,x);
}
});
var sp2__4062 = (function (x,y){
var or__3548__auto____4014 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4014))
{return or__3548__auto____4014;
} else
{var or__3548__auto____4015 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4015))
{return or__3548__auto____4015;
} else
{var or__3548__auto____4016 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4016))
{return or__3548__auto____4016;
} else
{return p2.call(null,y);
}
}
}
});
var sp2__4063 = (function (x,y,z){
var or__3548__auto____4017 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4017))
{return or__3548__auto____4017;
} else
{var or__3548__auto____4018 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4018))
{return or__3548__auto____4018;
} else
{var or__3548__auto____4019 = p1.call(null,z);

if(cljs.core.truth_(or__3548__auto____4019))
{return or__3548__auto____4019;
} else
{var or__3548__auto____4020 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4020))
{return or__3548__auto____4020;
} else
{var or__3548__auto____4021 = p2.call(null,y);

if(cljs.core.truth_(or__3548__auto____4021))
{return or__3548__auto____4021;
} else
{return p2.call(null,z);
}
}
}
}
}
});
var sp2__4064 = (function() { 
var G__4066__delegate = function (x,y,z,args){
var or__3548__auto____4022 = sp2.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4022))
{return or__3548__auto____4022;
} else
{return cljs.core.some.call(null,(function (p1__3925_SHARP_){
var or__3548__auto____4023 = p1.call(null,p1__3925_SHARP_);

if(cljs.core.truth_(or__3548__auto____4023))
{return or__3548__auto____4023;
} else
{return p2.call(null,p1__3925_SHARP_);
}
}),args);
}
};
var G__4066 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4066__delegate.call(this, x, y, z, args);
};
G__4066.cljs$lang$maxFixedArity = 3;
G__4066.cljs$lang$applyTo = (function (arglist__4067){
var x = cljs.core.first(arglist__4067);
var y = cljs.core.first(cljs.core.next(arglist__4067));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4067)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4067)));
return G__4066__delegate.call(this, x, y, z, args);
});
return G__4066;
})()
;
sp2 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return sp2__4060.call(this);
case  1 :
return sp2__4061.call(this,x);
case  2 :
return sp2__4062.call(this,x,y);
case  3 :
return sp2__4063.call(this,x,y,z);
default:
return sp2__4064.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
sp2.cljs$lang$maxFixedArity = 3;
sp2.cljs$lang$applyTo = sp2__4064.cljs$lang$applyTo;
return sp2;
})()
});
var some_fn__4049 = (function (p1,p2,p3){
return (function() {
var sp3 = null;
var sp3__4068 = (function (){
return null;
});
var sp3__4069 = (function (x){
var or__3548__auto____4024 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4024))
{return or__3548__auto____4024;
} else
{var or__3548__auto____4025 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4025))
{return or__3548__auto____4025;
} else
{return p3.call(null,x);
}
}
});
var sp3__4070 = (function (x,y){
var or__3548__auto____4026 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4026))
{return or__3548__auto____4026;
} else
{var or__3548__auto____4027 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4027))
{return or__3548__auto____4027;
} else
{var or__3548__auto____4028 = p3.call(null,x);

if(cljs.core.truth_(or__3548__auto____4028))
{return or__3548__auto____4028;
} else
{var or__3548__auto____4029 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4029))
{return or__3548__auto____4029;
} else
{var or__3548__auto____4030 = p2.call(null,y);

if(cljs.core.truth_(or__3548__auto____4030))
{return or__3548__auto____4030;
} else
{return p3.call(null,y);
}
}
}
}
}
});
var sp3__4071 = (function (x,y,z){
var or__3548__auto____4031 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4031))
{return or__3548__auto____4031;
} else
{var or__3548__auto____4032 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4032))
{return or__3548__auto____4032;
} else
{var or__3548__auto____4033 = p3.call(null,x);

if(cljs.core.truth_(or__3548__auto____4033))
{return or__3548__auto____4033;
} else
{var or__3548__auto____4034 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4034))
{return or__3548__auto____4034;
} else
{var or__3548__auto____4035 = p2.call(null,y);

if(cljs.core.truth_(or__3548__auto____4035))
{return or__3548__auto____4035;
} else
{var or__3548__auto____4036 = p3.call(null,y);

if(cljs.core.truth_(or__3548__auto____4036))
{return or__3548__auto____4036;
} else
{var or__3548__auto____4037 = p1.call(null,z);

if(cljs.core.truth_(or__3548__auto____4037))
{return or__3548__auto____4037;
} else
{var or__3548__auto____4038 = p2.call(null,z);

if(cljs.core.truth_(or__3548__auto____4038))
{return or__3548__auto____4038;
} else
{return p3.call(null,z);
}
}
}
}
}
}
}
}
});
var sp3__4072 = (function() { 
var G__4074__delegate = function (x,y,z,args){
var or__3548__auto____4039 = sp3.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4039))
{return or__3548__auto____4039;
} else
{return cljs.core.some.call(null,(function (p1__3926_SHARP_){
var or__3548__auto____4040 = p1.call(null,p1__3926_SHARP_);

if(cljs.core.truth_(or__3548__auto____4040))
{return or__3548__auto____4040;
} else
{var or__3548__auto____4041 = p2.call(null,p1__3926_SHARP_);

if(cljs.core.truth_(or__3548__auto____4041))
{return or__3548__auto____4041;
} else
{return p3.call(null,p1__3926_SHARP_);
}
}
}),args);
}
};
var G__4074 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4074__delegate.call(this, x, y, z, args);
};
G__4074.cljs$lang$maxFixedArity = 3;
G__4074.cljs$lang$applyTo = (function (arglist__4075){
var x = cljs.core.first(arglist__4075);
var y = cljs.core.first(cljs.core.next(arglist__4075));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4075)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4075)));
return G__4074__delegate.call(this, x, y, z, args);
});
return G__4074;
})()
;
sp3 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return sp3__4068.call(this);
case  1 :
return sp3__4069.call(this,x);
case  2 :
return sp3__4070.call(this,x,y);
case  3 :
return sp3__4071.call(this,x,y,z);
default:
return sp3__4072.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
sp3.cljs$lang$maxFixedArity = 3;
sp3.cljs$lang$applyTo = sp3__4072.cljs$lang$applyTo;
return sp3;
})()
});
var some_fn__4050 = (function() { 
var G__4076__delegate = function (p1,p2,p3,ps){
var ps__4042 = cljs.core.list_STAR_.call(null,p1,p2,p3,ps);

return (function() {
var spn = null;
var spn__4077 = (function (){
return null;
});
var spn__4078 = (function (x){
return cljs.core.some.call(null,(function (p1__3927_SHARP_){
return p1__3927_SHARP_.call(null,x);
}),ps__4042);
});
var spn__4079 = (function (x,y){
return cljs.core.some.call(null,(function (p1__3928_SHARP_){
var or__3548__auto____4043 = p1__3928_SHARP_.call(null,x);

if(cljs.core.truth_(or__3548__auto____4043))
{return or__3548__auto____4043;
} else
{return p1__3928_SHARP_.call(null,y);
}
}),ps__4042);
});
var spn__4080 = (function (x,y,z){
return cljs.core.some.call(null,(function (p1__3929_SHARP_){
var or__3548__auto____4044 = p1__3929_SHARP_.call(null,x);

if(cljs.core.truth_(or__3548__auto____4044))
{return or__3548__auto____4044;
} else
{var or__3548__auto____4045 = p1__3929_SHARP_.call(null,y);

if(cljs.core.truth_(or__3548__auto____4045))
{return or__3548__auto____4045;
} else
{return p1__3929_SHARP_.call(null,z);
}
}
}),ps__4042);
});
var spn__4081 = (function() { 
var G__4083__delegate = function (x,y,z,args){
var or__3548__auto____4046 = spn.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4046))
{return or__3548__auto____4046;
} else
{return cljs.core.some.call(null,(function (p1__3930_SHARP_){
return cljs.core.some.call(null,p1__3930_SHARP_,args);
}),ps__4042);
}
};
var G__4083 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4083__delegate.call(this, x, y, z, args);
};
G__4083.cljs$lang$maxFixedArity = 3;
G__4083.cljs$lang$applyTo = (function (arglist__4084){
var x = cljs.core.first(arglist__4084);
var y = cljs.core.first(cljs.core.next(arglist__4084));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4084)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4084)));
return G__4083__delegate.call(this, x, y, z, args);
});
return G__4083;
})()
;
spn = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return spn__4077.call(this);
case  1 :
return spn__4078.call(this,x);
case  2 :
return spn__4079.call(this,x,y);
case  3 :
return spn__4080.call(this,x,y,z);
default:
return spn__4081.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
spn.cljs$lang$maxFixedArity = 3;
spn.cljs$lang$applyTo = spn__4081.cljs$lang$applyTo;
return spn;
})()
};
var G__4076 = function (p1,p2,p3,var_args){
var ps = null;
if (goog.isDef(var_args)) {
  ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4076__delegate.call(this, p1, p2, p3, ps);
};
G__4076.cljs$lang$maxFixedArity = 3;
G__4076.cljs$lang$applyTo = (function (arglist__4085){
var p1 = cljs.core.first(arglist__4085);
var p2 = cljs.core.first(cljs.core.next(arglist__4085));
var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4085)));
var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4085)));
return G__4076__delegate.call(this, p1, p2, p3, ps);
});
return G__4076;
})()
;
some_fn = function(p1,p2,p3,var_args){
var ps = var_args;
switch(arguments.length){
case  1 :
return some_fn__4047.call(this,p1);
case  2 :
return some_fn__4048.call(this,p1,p2);
case  3 :
return some_fn__4049.call(this,p1,p2,p3);
default:
return some_fn__4050.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
some_fn.cljs$lang$maxFixedArity = 3;
some_fn.cljs$lang$applyTo = some_fn__4050.cljs$lang$applyTo;
return some_fn;
})()
;
/**
* Returns a lazy sequence consisting of the result of applying f to the
* set of first items of each coll, followed by applying f to the set
* of second items in each coll, until any one of the colls is
* exhausted.  Any remaining items in other colls are ignored. Function
* f should accept number-of-colls arguments.
* @param {...*} var_args
*/
cljs.core.map = (function() {
var map = null;
var map__4098 = (function (f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4086 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4086))
{var s__4087 = temp__3698__auto____4086;

return cljs.core.cons.call(null,f.call(null,cljs.core.first.call(null,s__4087)),map.call(null,f,cljs.core.rest.call(null,s__4087)));
} else
{return null;
}
})));
});
var map__4099 = (function (f,c1,c2){
return (new cljs.core.LazySeq(null,false,(function (){
var s1__4088 = cljs.core.seq.call(null,c1);
var s2__4089 = cljs.core.seq.call(null,c2);

if(cljs.core.truth_((function (){var and__3546__auto____4090 = s1__4088;

if(cljs.core.truth_(and__3546__auto____4090))
{return s2__4089;
} else
{return and__3546__auto____4090;
}
})()))
{return cljs.core.cons.call(null,f.call(null,cljs.core.first.call(null,s1__4088),cljs.core.first.call(null,s2__4089)),map.call(null,f,cljs.core.rest.call(null,s1__4088),cljs.core.rest.call(null,s2__4089)));
} else
{return null;
}
})));
});
var map__4100 = (function (f,c1,c2,c3){
return (new cljs.core.LazySeq(null,false,(function (){
var s1__4091 = cljs.core.seq.call(null,c1);
var s2__4092 = cljs.core.seq.call(null,c2);
var s3__4093 = cljs.core.seq.call(null,c3);

if(cljs.core.truth_((function (){var and__3546__auto____4094 = s1__4091;

if(cljs.core.truth_(and__3546__auto____4094))
{var and__3546__auto____4095 = s2__4092;

if(cljs.core.truth_(and__3546__auto____4095))
{return s3__4093;
} else
{return and__3546__auto____4095;
}
} else
{return and__3546__auto____4094;
}
})()))
{return cljs.core.cons.call(null,f.call(null,cljs.core.first.call(null,s1__4091),cljs.core.first.call(null,s2__4092),cljs.core.first.call(null,s3__4093)),map.call(null,f,cljs.core.rest.call(null,s1__4091),cljs.core.rest.call(null,s2__4092),cljs.core.rest.call(null,s3__4093)));
} else
{return null;
}
})));
});
var map__4101 = (function() { 
var G__4103__delegate = function (f,c1,c2,c3,colls){
var step__4097 = (function step(cs){
return (new cljs.core.LazySeq(null,false,(function (){
var ss__4096 = map.call(null,cljs.core.seq,cs);

if(cljs.core.truth_(cljs.core.every_QMARK_.call(null,cljs.core.identity,ss__4096)))
{return cljs.core.cons.call(null,map.call(null,cljs.core.first,ss__4096),step.call(null,map.call(null,cljs.core.rest,ss__4096)));
} else
{return null;
}
})));
});

return map.call(null,(function (p1__4008_SHARP_){
return cljs.core.apply.call(null,f,p1__4008_SHARP_);
}),step__4097.call(null,cljs.core.conj.call(null,colls,c3,c2,c1)));
};
var G__4103 = function (f,c1,c2,c3,var_args){
var colls = null;
if (goog.isDef(var_args)) {
  colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4),0);
} 
return G__4103__delegate.call(this, f, c1, c2, c3, colls);
};
G__4103.cljs$lang$maxFixedArity = 4;
G__4103.cljs$lang$applyTo = (function (arglist__4104){
var f = cljs.core.first(arglist__4104);
var c1 = cljs.core.first(cljs.core.next(arglist__4104));
var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4104)));
var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4104))));
var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4104))));
return G__4103__delegate.call(this, f, c1, c2, c3, colls);
});
return G__4103;
})()
;
map = function(f,c1,c2,c3,var_args){
var colls = var_args;
switch(arguments.length){
case  2 :
return map__4098.call(this,f,c1);
case  3 :
return map__4099.call(this,f,c1,c2);
case  4 :
return map__4100.call(this,f,c1,c2,c3);
default:
return map__4101.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
map.cljs$lang$maxFixedArity = 4;
map.cljs$lang$applyTo = map__4101.cljs$lang$applyTo;
return map;
})()
;
/**
* Returns a lazy sequence of the first n items in coll, or all items if
* there are fewer than n.
*/
cljs.core.take = (function take(n,coll){
return (new cljs.core.LazySeq(null,false,(function (){
if(cljs.core.truth_((n > 0)))
{var temp__3698__auto____4105 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4105))
{var s__4106 = temp__3698__auto____4105;

return cljs.core.cons.call(null,cljs.core.first.call(null,s__4106),take.call(null,(n - 1),cljs.core.rest.call(null,s__4106)));
} else
{return null;
}
} else
{return null;
}
})));
});
/**
* Returns a lazy sequence of all but the first n items in coll.
*/
cljs.core.drop = (function drop(n,coll){
var step__4109 = (function (n,coll){
while(true){
var s__4107 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_((function (){var and__3546__auto____4108 = (n > 0);

if(cljs.core.truth_(and__3546__auto____4108))
{return s__4107;
} else
{return and__3546__auto____4108;
}
})()))
{{
var G__4110 = (n - 1);
var G__4111 = cljs.core.rest.call(null,s__4107);
n = G__4110;
coll = G__4111;
continue;
}
} else
{return s__4107;
}
break;
}
});

return (new cljs.core.LazySeq(null,false,(function (){
return step__4109.call(null,n,coll);
})));
});
/**
* Return a lazy sequence of all but the last n (default 1) items in coll
*/
cljs.core.drop_last = (function() {
var drop_last = null;
var drop_last__4112 = (function (s){
return drop_last.call(null,1,s);
});
var drop_last__4113 = (function (n,s){
return cljs.core.map.call(null,(function (x,_){
return x;
}),s,cljs.core.drop.call(null,n,s));
});
drop_last = function(n,s){
switch(arguments.length){
case  1 :
return drop_last__4112.call(this,n);
case  2 :
return drop_last__4113.call(this,n,s);
}
throw('Invalid arity: ' + arguments.length);
};
return drop_last;
})()
;
/**
* Returns a seq of the last n items in coll.  Depending on the type
* of coll may be no better than linear time.  For vectors, see also subvec.
*/
cljs.core.take_last = (function take_last(n,coll){
var s__4115 = cljs.core.seq.call(null,coll);
var lead__4116 = cljs.core.seq.call(null,cljs.core.drop.call(null,n,coll));

while(true){
if(cljs.core.truth_(lead__4116))
{{
var G__4117 = cljs.core.next.call(null,s__4115);
var G__4118 = cljs.core.next.call(null,lead__4116);
s__4115 = G__4117;
lead__4116 = G__4118;
continue;
}
} else
{return s__4115;
}
break;
}
});
/**
* Returns a lazy sequence of the items in coll starting from the first
* item for which (pred item) returns nil.
*/
cljs.core.drop_while = (function drop_while(pred,coll){
var step__4121 = (function (pred,coll){
while(true){
var s__4119 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_((function (){var and__3546__auto____4120 = s__4119;

if(cljs.core.truth_(and__3546__auto____4120))
{return pred.call(null,cljs.core.first.call(null,s__4119));
} else
{return and__3546__auto____4120;
}
})()))
{{
var G__4122 = pred;
var G__4123 = cljs.core.rest.call(null,s__4119);
pred = G__4122;
coll = G__4123;
continue;
}
} else
{return s__4119;
}
break;
}
});

return (new cljs.core.LazySeq(null,false,(function (){
return step__4121.call(null,pred,coll);
})));
});
/**
* Returns a lazy (infinite!) sequence of repetitions of the items in coll.
*/
cljs.core.cycle = (function cycle(coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4124 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4124))
{var s__4125 = temp__3698__auto____4124;

return cljs.core.concat.call(null,s__4125,cycle.call(null,s__4125));
} else
{return null;
}
})));
});
/**
* Returns a vector of [(take n coll) (drop n coll)]
*/
cljs.core.split_at = (function split_at(n,coll){
return cljs.core.PersistentVector.fromArray([cljs.core.take.call(null,n,coll),cljs.core.drop.call(null,n,coll)]);
});
/**
* Returns a lazy (infinite!, or length n if supplied) sequence of xs.
*/
cljs.core.repeat = (function() {
var repeat = null;
var repeat__4126 = (function (x){
return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,x,repeat.call(null,x));
})));
});
var repeat__4127 = (function (n,x){
return cljs.core.take.call(null,n,repeat.call(null,x));
});
repeat = function(n,x){
switch(arguments.length){
case  1 :
return repeat__4126.call(this,n);
case  2 :
return repeat__4127.call(this,n,x);
}
throw('Invalid arity: ' + arguments.length);
};
return repeat;
})()
;
/**
* Returns a lazy seq of n xs.
*/
cljs.core.replicate = (function replicate(n,x){
return cljs.core.take.call(null,n,cljs.core.repeat.call(null,x));
});
/**
* Takes a function of no args, presumably with side effects, and
* returns an infinite (or length n if supplied) lazy sequence of calls
* to it
*/
cljs.core.repeatedly = (function() {
var repeatedly = null;
var repeatedly__4129 = (function (f){
return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,f.call(null),repeatedly.call(null,f));
})));
});
var repeatedly__4130 = (function (n,f){
return cljs.core.take.call(null,n,repeatedly.call(null,f));
});
repeatedly = function(n,f){
switch(arguments.length){
case  1 :
return repeatedly__4129.call(this,n);
case  2 :
return repeatedly__4130.call(this,n,f);
}
throw('Invalid arity: ' + arguments.length);
};
return repeatedly;
})()
;
/**
* Returns a lazy sequence of x, (f x), (f (f x)) etc. f must be free of side-effects
*/
cljs.core.iterate = (function iterate(f,x){
return cljs.core.cons.call(null,x,(new cljs.core.LazySeq(null,false,(function (){
return iterate.call(null,f,f.call(null,x));
}))));
});
/**
* Returns a lazy seq of the first item in each coll, then the second etc.
* @param {...*} var_args
*/
cljs.core.interleave = (function() {
var interleave = null;
var interleave__4136 = (function (c1,c2){
return (new cljs.core.LazySeq(null,false,(function (){
var s1__4132 = cljs.core.seq.call(null,c1);
var s2__4133 = cljs.core.seq.call(null,c2);

if(cljs.core.truth_((function (){var and__3546__auto____4134 = s1__4132;

if(cljs.core.truth_(and__3546__auto____4134))
{return s2__4133;
} else
{return and__3546__auto____4134;
}
})()))
{return cljs.core.cons.call(null,cljs.core.first.call(null,s1__4132),cljs.core.cons.call(null,cljs.core.first.call(null,s2__4133),interleave.call(null,cljs.core.rest.call(null,s1__4132),cljs.core.rest.call(null,s2__4133))));
} else
{return null;
}
})));
});
var interleave__4137 = (function() { 
var G__4139__delegate = function (c1,c2,colls){
return (new cljs.core.LazySeq(null,false,(function (){
var ss__4135 = cljs.core.map.call(null,cljs.core.seq,cljs.core.conj.call(null,colls,c2,c1));

if(cljs.core.truth_(cljs.core.every_QMARK_.call(null,cljs.core.identity,ss__4135)))
{return cljs.core.concat.call(null,cljs.core.map.call(null,cljs.core.first,ss__4135),cljs.core.apply.call(null,interleave,cljs.core.map.call(null,cljs.core.rest,ss__4135)));
} else
{return null;
}
})));
};
var G__4139 = function (c1,c2,var_args){
var colls = null;
if (goog.isDef(var_args)) {
  colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4139__delegate.call(this, c1, c2, colls);
};
G__4139.cljs$lang$maxFixedArity = 2;
G__4139.cljs$lang$applyTo = (function (arglist__4140){
var c1 = cljs.core.first(arglist__4140);
var c2 = cljs.core.first(cljs.core.next(arglist__4140));
var colls = cljs.core.rest(cljs.core.next(arglist__4140));
return G__4139__delegate.call(this, c1, c2, colls);
});
return G__4139;
})()
;
interleave = function(c1,c2,var_args){
var colls = var_args;
switch(arguments.length){
case  2 :
return interleave__4136.call(this,c1,c2);
default:
return interleave__4137.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
interleave.cljs$lang$maxFixedArity = 2;
interleave.cljs$lang$applyTo = interleave__4137.cljs$lang$applyTo;
return interleave;
})()
;
/**
* Returns a lazy seq of the elements of coll separated by sep
*/
cljs.core.interpose = (function interpose(sep,coll){
return cljs.core.drop.call(null,1,cljs.core.interleave.call(null,cljs.core.repeat.call(null,sep),coll));
});
/**
* Take a collection of collections, and return a lazy seq
* of items from the inner collection
*/
cljs.core.flatten1 = (function flatten1(colls){
var cat__4143 = (function cat(coll,colls){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3695__auto____4141 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3695__auto____4141))
{var coll__4142 = temp__3695__auto____4141;

return cljs.core.cons.call(null,cljs.core.first.call(null,coll__4142),cat.call(null,cljs.core.rest.call(null,coll__4142),colls));
} else
{if(cljs.core.truth_(cljs.core.seq.call(null,colls)))
{return cat.call(null,cljs.core.first.call(null,colls),cljs.core.rest.call(null,colls));
} else
{return null;
}
}
})));
});

return cat__4143.call(null,null,colls);
});
/**
* Returns the result of applying concat to the result of applying map
* to f and colls.  Thus function f should return a collection.
* @param {...*} var_args
*/
cljs.core.mapcat = (function() {
var mapcat = null;
var mapcat__4144 = (function (f,coll){
return cljs.core.flatten1.call(null,cljs.core.map.call(null,f,coll));
});
var mapcat__4145 = (function() { 
var G__4147__delegate = function (f,coll,colls){
return cljs.core.flatten1.call(null,cljs.core.apply.call(null,cljs.core.map,f,coll,colls));
};
var G__4147 = function (f,coll,var_args){
var colls = null;
if (goog.isDef(var_args)) {
  colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4147__delegate.call(this, f, coll, colls);
};
G__4147.cljs$lang$maxFixedArity = 2;
G__4147.cljs$lang$applyTo = (function (arglist__4148){
var f = cljs.core.first(arglist__4148);
var coll = cljs.core.first(cljs.core.next(arglist__4148));
var colls = cljs.core.rest(cljs.core.next(arglist__4148));
return G__4147__delegate.call(this, f, coll, colls);
});
return G__4147;
})()
;
mapcat = function(f,coll,var_args){
var colls = var_args;
switch(arguments.length){
case  2 :
return mapcat__4144.call(this,f,coll);
default:
return mapcat__4145.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
mapcat.cljs$lang$maxFixedArity = 2;
mapcat.cljs$lang$applyTo = mapcat__4145.cljs$lang$applyTo;
return mapcat;
})()
;
/**
* Returns a lazy sequence of the items in coll for which
* (pred item) returns true. pred must be free of side-effects.
*/
cljs.core.filter = (function filter(pred,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4149 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4149))
{var s__4150 = temp__3698__auto____4149;

var f__4151 = cljs.core.first.call(null,s__4150);
var r__4152 = cljs.core.rest.call(null,s__4150);

if(cljs.core.truth_(pred.call(null,f__4151)))
{return cljs.core.cons.call(null,f__4151,filter.call(null,pred,r__4152));
} else
{return filter.call(null,pred,r__4152);
}
} else
{return null;
}
})));
});
/**
* Returns a lazy sequence of the items in coll for which
* (pred item) returns false. pred must be free of side-effects.
*/
cljs.core.remove = (function remove(pred,coll){
return cljs.core.filter.call(null,cljs.core.complement.call(null,pred),coll);
});
/**
* Returns a lazy sequence of the nodes in a tree, via a depth-first walk.
* branch? must be a fn of one arg that returns true if passed a node
* that can have children (but may not).  children must be a fn of one
* arg that returns a sequence of the children. Will only be called on
* nodes for which branch? returns true. Root is the root node of the
* tree.
*/
cljs.core.tree_seq = (function tree_seq(branch_QMARK_,children,root){
var walk__4154 = (function walk(node){
return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,node,(cljs.core.truth_(branch_QMARK_.call(null,node))?cljs.core.mapcat.call(null,walk,children.call(null,node)):null));
})));
});

return walk__4154.call(null,root);
});
/**
* Takes any nested combination of sequential things (lists, vectors,
* etc.) and returns their contents as a single, flat sequence.
* (flatten nil) returns nil.
*/
cljs.core.flatten = (function flatten(x){
return cljs.core.filter.call(null,(function (p1__4153_SHARP_){
return cljs.core.not.call(null,cljs.core.sequential_QMARK_.call(null,p1__4153_SHARP_));
}),cljs.core.rest.call(null,cljs.core.tree_seq.call(null,cljs.core.sequential_QMARK_,cljs.core.seq,x)));
});
/**
* Returns a new coll consisting of to-coll with all of the items of
* from-coll conjoined.
*/
cljs.core.into = (function into(to,from){
return cljs.core.reduce.call(null,cljs.core._conj,to,from);
});
/**
* Returns a lazy sequence of lists of n items each, at offsets step
* apart. If step is not supplied, defaults to n, i.e. the partitions
* do not overlap. If a pad collection is supplied, use its elements as
* necessary to complete last partition upto n items. In case there are
* not enough padding elements, return a partition with less than n items.
*/
cljs.core.partition = (function() {
var partition = null;
var partition__4161 = (function (n,coll){
return partition.call(null,n,n,coll);
});
var partition__4162 = (function (n,step,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4155 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4155))
{var s__4156 = temp__3698__auto____4155;

var p__4157 = cljs.core.take.call(null,n,s__4156);

if(cljs.core.truth_(cljs.core._EQ_.call(null,n,cljs.core.count.call(null,p__4157))))
{return cljs.core.cons.call(null,p__4157,partition.call(null,n,step,cljs.core.drop.call(null,step,s__4156)));
} else
{return null;
}
} else
{return null;
}
})));
});
var partition__4163 = (function (n,step,pad,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4158 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4158))
{var s__4159 = temp__3698__auto____4158;

var p__4160 = cljs.core.take.call(null,n,s__4159);

if(cljs.core.truth_(cljs.core._EQ_.call(null,n,cljs.core.count.call(null,p__4160))))
{return cljs.core.cons.call(null,p__4160,partition.call(null,n,step,pad,cljs.core.drop.call(null,step,s__4159)));
} else
{return cljs.core.list.call(null,cljs.core.take.call(null,n,cljs.core.concat.call(null,p__4160,pad)));
}
} else
{return null;
}
})));
});
partition = function(n,step,pad,coll){
switch(arguments.length){
case  2 :
return partition__4161.call(this,n,step);
case  3 :
return partition__4162.call(this,n,step,pad);
case  4 :
return partition__4163.call(this,n,step,pad,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return partition;
})()
;
/**
* Returns the value in a nested associative structure,
* where ks is a sequence of ke(ys. Returns nil if the key is not present,
* or the not-found value if supplied.
*/
cljs.core.get_in = (function() {
var get_in = null;
var get_in__4169 = (function (m,ks){
return cljs.core.reduce.call(null,cljs.core.get,m,ks);
});
var get_in__4170 = (function (m,ks,not_found){
var sentinel__4165 = cljs.core.lookup_sentinel;
var m__4166 = m;
var ks__4167 = cljs.core.seq.call(null,ks);

while(true){
if(cljs.core.truth_(ks__4167))
{var m__4168 = cljs.core.get.call(null,m__4166,cljs.core.first.call(null,ks__4167),sentinel__4165);

if(cljs.core.truth_((sentinel__4165 === m__4168)))
{return not_found;
} else
{{
var G__4172 = sentinel__4165;
var G__4173 = m__4168;
var G__4174 = cljs.core.next.call(null,ks__4167);
sentinel__4165 = G__4172;
m__4166 = G__4173;
ks__4167 = G__4174;
continue;
}
}
} else
{return m__4166;
}
break;
}
});
get_in = function(m,ks,not_found){
switch(arguments.length){
case  2 :
return get_in__4169.call(this,m,ks);
case  3 :
return get_in__4170.call(this,m,ks,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return get_in;
})()
;
/**
* Associates a value in a nested associative structure, where ks is a
* sequence of keys and v is the new value and returns a new nested structure.
* If any levels do not exist, hash-maps will be created.
*/
cljs.core.assoc_in = (function assoc_in(m,p__4175,v){
var vec__4176__4177 = p__4175;
var k__4178 = cljs.core.nth.call(null,vec__4176__4177,0,null);
var ks__4179 = cljs.core.nthnext.call(null,vec__4176__4177,1);

if(cljs.core.truth_(ks__4179))
{return cljs.core.assoc.call(null,m,k__4178,assoc_in.call(null,cljs.core.get.call(null,m,k__4178),ks__4179,v));
} else
{return cljs.core.assoc.call(null,m,k__4178,v);
}
});
/**
* 'Updates' a value in a nested associative structure, where ks is a
* sequence of keys and f is a function that will take the old value
* and any supplied args and return the new value, and returns a new
* nested structure.  If any levels do not exist, hash-maps will be
* created.
* @param {...*} var_args
*/
cljs.core.update_in = (function() { 
var update_in__delegate = function (m,p__4180,f,args){
var vec__4181__4182 = p__4180;
var k__4183 = cljs.core.nth.call(null,vec__4181__4182,0,null);
var ks__4184 = cljs.core.nthnext.call(null,vec__4181__4182,1);

if(cljs.core.truth_(ks__4184))
{return cljs.core.assoc.call(null,m,k__4183,cljs.core.apply.call(null,update_in,cljs.core.get.call(null,m,k__4183),ks__4184,f,args));
} else
{return cljs.core.assoc.call(null,m,k__4183,cljs.core.apply.call(null,f,cljs.core.get.call(null,m,k__4183),args));
}
};
var update_in = function (m,p__4180,f,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return update_in__delegate.call(this, m, p__4180, f, args);
};
update_in.cljs$lang$maxFixedArity = 3;
update_in.cljs$lang$applyTo = (function (arglist__4185){
var m = cljs.core.first(arglist__4185);
var p__4180 = cljs.core.first(cljs.core.next(arglist__4185));
var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4185)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4185)));
return update_in__delegate.call(this, m, p__4180, f, args);
});
return update_in;
})()
;

/**
* @constructor
*/
cljs.core.Vector = (function (meta,array){
this.meta = meta;
this.array = array;
})
cljs.core.Vector.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Vector");
});
cljs.core.Vector.prototype.cljs$core$IHash$ = true;
cljs.core.Vector.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4186 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4219 = null;
var G__4219__4220 = (function (coll,k){
var this__4187 = this;
return cljs.core._nth.call(null,coll,k,null);
});
var G__4219__4221 = (function (coll,k,not_found){
var this__4188 = this;
return cljs.core._nth.call(null,coll,k,not_found);
});
G__4219 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__4219__4220.call(this,coll,k);
case  3 :
return G__4219__4221.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4219;
})()
;
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__4189 = this;
var new_array__4190 = cljs.core.aclone.call(null,this__4189.array);

(new_array__4190[k] = v);
return (new cljs.core.Vector(this__4189.meta,new_array__4190));
});
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = (function() {
var G__4223 = null;
var G__4223__4224 = (function (tsym4191,k){
var this__4193 = this;
var tsym4191__4194 = this;

var coll__4195 = tsym4191__4194;

return cljs.core._lookup.call(null,coll__4195,k);
});
var G__4223__4225 = (function (tsym4192,k,not_found){
var this__4196 = this;
var tsym4192__4197 = this;

var coll__4198 = tsym4192__4197;

return cljs.core._lookup.call(null,coll__4198,k,not_found);
});
G__4223 = function(tsym4192,k,not_found){
switch(arguments.length){
case  2 :
return G__4223__4224.call(this,tsym4192,k);
case  3 :
return G__4223__4225.call(this,tsym4192,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4223;
})()
;
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4199 = this;
var new_array__4200 = cljs.core.aclone.call(null,this__4199.array);

new_array__4200.push(o);
return (new cljs.core.Vector(this__4199.meta,new_array__4200));
});
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = (function() {
var G__4227 = null;
var G__4227__4228 = (function (v,f){
var this__4201 = this;
return cljs.core.ci_reduce.call(null,this__4201.array,f);
});
var G__4227__4229 = (function (v,f,start){
var this__4202 = this;
return cljs.core.ci_reduce.call(null,this__4202.array,f,start);
});
G__4227 = function(v,f,start){
switch(arguments.length){
case  2 :
return G__4227__4228.call(this,v,f);
case  3 :
return G__4227__4229.call(this,v,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4227;
})()
;
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4203 = this;
if(cljs.core.truth_((this__4203.array.length > 0)))
{var vector_seq__4204 = (function vector_seq(i){
return (new cljs.core.LazySeq(null,false,(function (){
if(cljs.core.truth_((i < this__4203.array.length)))
{return cljs.core.cons.call(null,(this__4203.array[i]),vector_seq.call(null,(i + 1)));
} else
{return null;
}
})));
});

return vector_seq__4204.call(null,0);
} else
{return null;
}
});
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4205 = this;
return this__4205.array.length;
});
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4206 = this;
var count__4207 = this__4206.array.length;

if(cljs.core.truth_((count__4207 > 0)))
{return (this__4206.array[(count__4207 - 1)]);
} else
{return null;
}
});
cljs.core.Vector.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4208 = this;
if(cljs.core.truth_((this__4208.array.length > 0)))
{var new_array__4209 = cljs.core.aclone.call(null,this__4208.array);

new_array__4209.pop();
return (new cljs.core.Vector(this__4208.meta,new_array__4209));
} else
{throw (new Error("Can't pop empty vector"));
}
});
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = (function (coll,n,val){
var this__4210 = this;
return cljs.core._assoc.call(null,coll,n,val);
});
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4211 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4212 = this;
return (new cljs.core.Vector(meta,this__4212.array));
});
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4213 = this;
return this__4213.meta;
});
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = (function() {
var G__4231 = null;
var G__4231__4232 = (function (coll,n){
var this__4214 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4215 = (0 <= n);

if(cljs.core.truth_(and__3546__auto____4215))
{return (n < this__4214.array.length);
} else
{return and__3546__auto____4215;
}
})()))
{return (this__4214.array[n]);
} else
{return null;
}
});
var G__4231__4233 = (function (coll,n,not_found){
var this__4216 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4217 = (0 <= n);

if(cljs.core.truth_(and__3546__auto____4217))
{return (n < this__4216.array.length);
} else
{return and__3546__auto____4217;
}
})()))
{return (this__4216.array[n]);
} else
{return not_found;
}
});
G__4231 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__4231__4232.call(this,coll,n);
case  3 :
return G__4231__4233.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4231;
})()
;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4218 = this;
return cljs.core.with_meta.call(null,cljs.core.Vector.EMPTY,this__4218.meta);
});
cljs.core.Vector;
cljs.core.Vector.EMPTY = (new cljs.core.Vector(null,[]));
cljs.core.Vector.fromArray = (function (xs){
return (new cljs.core.Vector(null,xs));
});
/**
* @param {...*} var_args
*/
cljs.core.vector = (function() { 
var vector__delegate = function (args){
return cljs.core.vec.call(null,args);
};
var vector = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return vector__delegate.call(this, args);
};
vector.cljs$lang$maxFixedArity = 0;
vector.cljs$lang$applyTo = (function (arglist__4235){
var args = cljs.core.seq( arglist__4235 );;
return vector__delegate.call(this, args);
});
return vector;
})()
;
cljs.core.tail_off = (function tail_off(pv){
var cnt__4236 = pv.cnt;

if(cljs.core.truth_((cnt__4236 < 32)))
{return 0;
} else
{return (((cnt__4236 - 1) >> 5) << 5);
}
});
cljs.core.new_path = (function new_path(level,node){
var ll__4237 = level;
var ret__4238 = node;

while(true){
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,ll__4237)))
{return ret__4238;
} else
{var embed__4239 = ret__4238;
var r__4240 = cljs.core.aclone.call(null,cljs.core.PersistentVector.EMPTY_NODE);
var ___4241 = (r__4240[0] = embed__4239);

{
var G__4242 = (ll__4237 - 5);
var G__4243 = r__4240;
ll__4237 = G__4242;
ret__4238 = G__4243;
continue;
}
}
break;
}
});
cljs.core.push_tail = (function push_tail(pv,level,parent,tailnode){
var ret__4244 = cljs.core.aclone.call(null,parent);
var subidx__4245 = (((pv.cnt - 1) >> level) & 31);

if(cljs.core.truth_(cljs.core._EQ_.call(null,5,level)))
{(ret__4244[subidx__4245] = tailnode);
return ret__4244;
} else
{var temp__3695__auto____4246 = (parent[subidx__4245]);

if(cljs.core.truth_(temp__3695__auto____4246))
{var child__4247 = temp__3695__auto____4246;

var node_to_insert__4248 = push_tail.call(null,pv,(level - 5),child__4247,tailnode);
var ___4249 = (ret__4244[subidx__4245] = node_to_insert__4248);

return ret__4244;
} else
{var node_to_insert__4250 = cljs.core.new_path.call(null,(level - 5),tailnode);
var ___4251 = (ret__4244[subidx__4245] = node_to_insert__4250);

return ret__4244;
}
}
});
cljs.core.array_for = (function array_for(pv,i){
if(cljs.core.truth_((function (){var and__3546__auto____4252 = (0 <= i);

if(cljs.core.truth_(and__3546__auto____4252))
{return (i < pv.cnt);
} else
{return and__3546__auto____4252;
}
})()))
{if(cljs.core.truth_((i >= cljs.core.tail_off.call(null,pv))))
{return pv.tail;
} else
{var node__4253 = pv.root;
var level__4254 = pv.shift;

while(true){
if(cljs.core.truth_((level__4254 > 0)))
{{
var G__4255 = (node__4253[((i >> level__4254) & 31)]);
var G__4256 = (level__4254 - 5);
node__4253 = G__4255;
level__4254 = G__4256;
continue;
}
} else
{return node__4253;
}
break;
}
}
} else
{throw (new Error(cljs.core.str.call(null,"No item ",i," in vector of length ",pv.cnt)));
}
});
cljs.core.do_assoc = (function do_assoc(pv,level,node,i,val){
var ret__4257 = cljs.core.aclone.call(null,node);

if(cljs.core.truth_((level === 0)))
{(ret__4257[(i & 31)] = val);
return ret__4257;
} else
{var subidx__4258 = ((i >> level) & 31);
var ___4259 = (ret__4257[subidx__4258] = do_assoc.call(null,pv,(level - 5),(node[subidx__4258]),i,val));

return ret__4257;
}
});
cljs.core.pop_tail = (function pop_tail(pv,level,node){
var subidx__4260 = (((pv.cnt - 2) >> level) & 31);

if(cljs.core.truth_((level > 5)))
{var new_child__4261 = pop_tail.call(null,pv,(level - 5),(node[subidx__4260]));

if(cljs.core.truth_((function (){var and__3546__auto____4262 = (new_child__4261 === null);

if(cljs.core.truth_(and__3546__auto____4262))
{return (subidx__4260 === 0);
} else
{return and__3546__auto____4262;
}
})()))
{return null;
} else
{var ret__4263 = cljs.core.aclone.call(null,node);
var ___4264 = (ret__4263[subidx__4260] = new_child__4261);

return ret__4263;
}
} else
{if(cljs.core.truth_((subidx__4260 === 0)))
{return null;
} else
{if(cljs.core.truth_("\uFDD0'else"))
{var ret__4265 = cljs.core.aclone.call(null,node);
var ___4266 = (ret__4265[subidx__4260] = null);

return ret__4265;
} else
{return null;
}
}
}
});

/**
* @constructor
*/
cljs.core.PersistentVector = (function (meta,cnt,shift,root,tail){
this.meta = meta;
this.cnt = cnt;
this.shift = shift;
this.root = root;
this.tail = tail;
})
cljs.core.PersistentVector.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.PersistentVector");
});
cljs.core.PersistentVector.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4267 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.PersistentVector.prototype.cljs$core$ILookup$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4307 = null;
var G__4307__4308 = (function (coll,k){
var this__4268 = this;
return cljs.core._nth.call(null,coll,k,null);
});
var G__4307__4309 = (function (coll,k,not_found){
var this__4269 = this;
return cljs.core._nth.call(null,coll,k,not_found);
});
G__4307 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__4307__4308.call(this,coll,k);
case  3 :
return G__4307__4309.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4307;
})()
;
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__4270 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4271 = (0 <= k);

if(cljs.core.truth_(and__3546__auto____4271))
{return (k < this__4270.cnt);
} else
{return and__3546__auto____4271;
}
})()))
{if(cljs.core.truth_((cljs.core.tail_off.call(null,coll) <= k)))
{var new_tail__4272 = cljs.core.aclone.call(null,this__4270.tail);

(new_tail__4272[(k & 31)] = v);
return (new cljs.core.PersistentVector(this__4270.meta,this__4270.cnt,this__4270.shift,this__4270.root,new_tail__4272));
} else
{return (new cljs.core.PersistentVector(this__4270.meta,this__4270.cnt,this__4270.shift,cljs.core.do_assoc.call(null,coll,this__4270.shift,this__4270.root,k,v),this__4270.tail));
}
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,k,this__4270.cnt)))
{return cljs.core._conj.call(null,coll,v);
} else
{if(cljs.core.truth_("\uFDD0'else"))
{throw (new Error(cljs.core.str.call(null,"Index ",k," out of bounds  [0,",this__4270.cnt,"]")));
} else
{return null;
}
}
}
});
cljs.core.PersistentVector.prototype.cljs$core$IFn$ = true;
cljs.core.PersistentVector.prototype.call = (function() {
var G__4311 = null;
var G__4311__4312 = (function (tsym4273,k){
var this__4275 = this;
var tsym4273__4276 = this;

var coll__4277 = tsym4273__4276;

return cljs.core._lookup.call(null,coll__4277,k);
});
var G__4311__4313 = (function (tsym4274,k,not_found){
var this__4278 = this;
var tsym4274__4279 = this;

var coll__4280 = tsym4274__4279;

return cljs.core._lookup.call(null,coll__4280,k,not_found);
});
G__4311 = function(tsym4274,k,not_found){
switch(arguments.length){
case  2 :
return G__4311__4312.call(this,tsym4274,k);
case  3 :
return G__4311__4313.call(this,tsym4274,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4311;
})()
;
cljs.core.PersistentVector.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4281 = this;
if(cljs.core.truth_(((this__4281.cnt - cljs.core.tail_off.call(null,coll)) < 32)))
{var new_tail__4282 = cljs.core.aclone.call(null,this__4281.tail);

new_tail__4282.push(o);
return (new cljs.core.PersistentVector(this__4281.meta,(this__4281.cnt + 1),this__4281.shift,this__4281.root,new_tail__4282));
} else
{var root_overflow_QMARK___4283 = ((this__4281.cnt >> 5) > (1 << this__4281.shift));
var new_shift__4284 = (cljs.core.truth_(root_overflow_QMARK___4283)?(this__4281.shift + 5):this__4281.shift);
var new_root__4286 = (cljs.core.truth_(root_overflow_QMARK___4283)?(function (){var n_r__4285 = cljs.core.aclone.call(null,cljs.core.PersistentVector.EMPTY_NODE);

(n_r__4285[0] = this__4281.root);
(n_r__4285[1] = cljs.core.new_path.call(null,this__4281.shift,this__4281.tail));
return n_r__4285;
})():cljs.core.push_tail.call(null,coll,this__4281.shift,this__4281.root,this__4281.tail));

return (new cljs.core.PersistentVector(this__4281.meta,(this__4281.cnt + 1),new_shift__4284,new_root__4286,[o]));
}
});
cljs.core.PersistentVector.prototype.cljs$core$IReduce$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce = (function() {
var G__4315 = null;
var G__4315__4316 = (function (v,f){
var this__4287 = this;
return cljs.core.ci_reduce.call(null,v,f);
});
var G__4315__4317 = (function (v,f,start){
var this__4288 = this;
return cljs.core.ci_reduce.call(null,v,f,start);
});
G__4315 = function(v,f,start){
switch(arguments.length){
case  2 :
return G__4315__4316.call(this,v,f);
case  3 :
return G__4315__4317.call(this,v,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4315;
})()
;
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4289 = this;
if(cljs.core.truth_((this__4289.cnt > 0)))
{var vector_seq__4290 = (function vector_seq(i){
return (new cljs.core.LazySeq(null,false,(function (){
if(cljs.core.truth_((i < this__4289.cnt)))
{return cljs.core.cons.call(null,cljs.core._nth.call(null,coll,i),vector_seq.call(null,(i + 1)));
} else
{return null;
}
})));
});

return vector_seq__4290.call(null,0);
} else
{return null;
}
});
cljs.core.PersistentVector.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4291 = this;
return this__4291.cnt;
});
cljs.core.PersistentVector.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4292 = this;
if(cljs.core.truth_((this__4292.cnt > 0)))
{return cljs.core._nth.call(null,coll,(this__4292.cnt - 1));
} else
{return null;
}
});
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4293 = this;
if(cljs.core.truth_((this__4293.cnt === 0)))
{throw (new Error("Can't pop empty vector"));
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,1,this__4293.cnt)))
{return cljs.core._with_meta.call(null,cljs.core.PersistentVector.EMPTY,this__4293.meta);
} else
{if(cljs.core.truth_((1 < (this__4293.cnt - cljs.core.tail_off.call(null,coll)))))
{return (new cljs.core.PersistentVector(this__4293.meta,(this__4293.cnt - 1),this__4293.shift,this__4293.root,cljs.core.aclone.call(null,this__4293.tail)));
} else
{if(cljs.core.truth_("\uFDD0'else"))
{var new_tail__4294 = cljs.core.array_for.call(null,coll,(this__4293.cnt - 2));
var nr__4295 = cljs.core.pop_tail.call(null,this__4293.shift,this__4293.root);
var new_root__4296 = (cljs.core.truth_((nr__4295 === null))?cljs.core.PersistentVector.EMPTY_NODE:nr__4295);
var cnt_1__4297 = (this__4293.cnt - 1);

if(cljs.core.truth_((function (){var and__3546__auto____4298 = (5 < this__4293.shift);

if(cljs.core.truth_(and__3546__auto____4298))
{return ((new_root__4296[1]) === null);
} else
{return and__3546__auto____4298;
}
})()))
{return (new cljs.core.PersistentVector(this__4293.meta,cnt_1__4297,(this__4293.shift - 5),(new_root__4296[0]),new_tail__4294));
} else
{return (new cljs.core.PersistentVector(this__4293.meta,cnt_1__4297,this__4293.shift,new_root__4296,new_tail__4294));
}
} else
{return null;
}
}
}
}
});
cljs.core.PersistentVector.prototype.cljs$core$IVector$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n = (function (coll,n,val){
var this__4299 = this;
return cljs.core._assoc.call(null,coll,n,val);
});
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4300 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4301 = this;
return (new cljs.core.PersistentVector(meta,this__4301.cnt,this__4301.shift,this__4301.root,this__4301.tail));
});
cljs.core.PersistentVector.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4302 = this;
return this__4302.meta;
});
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth = (function() {
var G__4319 = null;
var G__4319__4320 = (function (coll,n){
var this__4303 = this;
return (cljs.core.array_for.call(null,coll,n)[(n & 31)]);
});
var G__4319__4321 = (function (coll,n,not_found){
var this__4304 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4305 = (0 <= n);

if(cljs.core.truth_(and__3546__auto____4305))
{return (n < this__4304.cnt);
} else
{return and__3546__auto____4305;
}
})()))
{return cljs.core._nth.call(null,coll,n);
} else
{return not_found;
}
});
G__4319 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__4319__4320.call(this,coll,n);
case  3 :
return G__4319__4321.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4319;
})()
;
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4306 = this;
return cljs.core.with_meta.call(null,cljs.core.PersistentVector.EMPTY,this__4306.meta);
});
cljs.core.PersistentVector;
cljs.core.PersistentVector.EMPTY_NODE = (new Array(32));
cljs.core.PersistentVector.EMPTY = (new cljs.core.PersistentVector(null,0,5,cljs.core.PersistentVector.EMPTY_NODE,[]));
cljs.core.PersistentVector.fromArray = (function (xs){
return cljs.core.into.call(null,cljs.core.PersistentVector.EMPTY,xs);
});
cljs.core.vec = (function vec(coll){
return cljs.core.reduce.call(null,cljs.core.conj,cljs.core.PersistentVector.EMPTY,coll);
});

/**
* @constructor
*/
cljs.core.Subvec = (function (meta,v,start,end){
this.meta = meta;
this.v = v;
this.start = start;
this.end = end;
})
cljs.core.Subvec.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Subvec");
});
cljs.core.Subvec.prototype.cljs$core$IHash$ = true;
cljs.core.Subvec.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4323 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4351 = null;
var G__4351__4352 = (function (coll,k){
var this__4324 = this;
return cljs.core._nth.call(null,coll,k,null);
});
var G__4351__4353 = (function (coll,k,not_found){
var this__4325 = this;
return cljs.core._nth.call(null,coll,k,not_found);
});
G__4351 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__4351__4352.call(this,coll,k);
case  3 :
return G__4351__4353.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4351;
})()
;
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = (function (coll,key,val){
var this__4326 = this;
var v_pos__4327 = (this__4326.start + key);

return (new cljs.core.Subvec(this__4326.meta,cljs.core._assoc.call(null,this__4326.v,v_pos__4327,val),this__4326.start,((this__4326.end > (v_pos__4327 + 1)) ? this__4326.end : (v_pos__4327 + 1))));
});
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = (function() {
var G__4355 = null;
var G__4355__4356 = (function (tsym4328,k){
var this__4330 = this;
var tsym4328__4331 = this;

var coll__4332 = tsym4328__4331;

return cljs.core._lookup.call(null,coll__4332,k);
});
var G__4355__4357 = (function (tsym4329,k,not_found){
var this__4333 = this;
var tsym4329__4334 = this;

var coll__4335 = tsym4329__4334;

return cljs.core._lookup.call(null,coll__4335,k,not_found);
});
G__4355 = function(tsym4329,k,not_found){
switch(arguments.length){
case  2 :
return G__4355__4356.call(this,tsym4329,k);
case  3 :
return G__4355__4357.call(this,tsym4329,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4355;
})()
;
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4336 = this;
return (new cljs.core.Subvec(this__4336.meta,cljs.core._assoc_n.call(null,this__4336.v,this__4336.end,o),this__4336.start,(this__4336.end + 1)));
});
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = (function() {
var G__4359 = null;
var G__4359__4360 = (function (coll,f){
var this__4337 = this;
return cljs.core.ci_reduce.call(null,coll,f);
});
var G__4359__4361 = (function (coll,f,start){
var this__4338 = this;
return cljs.core.ci_reduce.call(null,coll,f,start);
});
G__4359 = function(coll,f,start){
switch(arguments.length){
case  2 :
return G__4359__4360.call(this,coll,f);
case  3 :
return G__4359__4361.call(this,coll,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4359;
})()
;
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4339 = this;
var subvec_seq__4340 = (function subvec_seq(i){
if(cljs.core.truth_(cljs.core._EQ_.call(null,i,this__4339.end)))
{return null;
} else
{return cljs.core.cons.call(null,cljs.core._nth.call(null,this__4339.v,i),(new cljs.core.LazySeq(null,false,(function (){
return subvec_seq.call(null,(i + 1));
}))));
}
});

return subvec_seq__4340.call(null,this__4339.start);
});
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4341 = this;
return (this__4341.end - this__4341.start);
});
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4342 = this;
return cljs.core._nth.call(null,this__4342.v,(this__4342.end - 1));
});
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4343 = this;
if(cljs.core.truth_(cljs.core._EQ_.call(null,this__4343.start,this__4343.end)))
{throw (new Error("Can't pop empty vector"));
} else
{return (new cljs.core.Subvec(this__4343.meta,this__4343.v,this__4343.start,(this__4343.end - 1)));
}
});
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = (function (coll,n,val){
var this__4344 = this;
return cljs.core._assoc.call(null,coll,n,val);
});
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4345 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4346 = this;
return (new cljs.core.Subvec(meta,this__4346.v,this__4346.start,this__4346.end));
});
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4347 = this;
return this__4347.meta;
});
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = (function() {
var G__4363 = null;
var G__4363__4364 = (function (coll,n){
var this__4348 = this;
return cljs.core._nth.call(null,this__4348.v,(this__4348.start + n));
});
var G__4363__4365 = (function (coll,n,not_found){
var this__4349 = this;
return cljs.core._nth.call(null,this__4349.v,(this__4349.start + n),not_found);
});
G__4363 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__4363__4364.call(this,coll,n);
case  3 :
return G__4363__4365.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4363;
})()
;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4350 = this;
return cljs.core.with_meta.call(null,cljs.core.Vector.EMPTY,this__4350.meta);
});
cljs.core.Subvec;
/**
* Returns a persistent vector of the items in vector from
* start (inclusive) to end (exclusive).  If end is not supplied,
* defaults to (count vector). This operation is O(1) and very fast, as
* the resulting vector shares structure with the original and no
* trimming is done.
*/
cljs.core.subvec = (function() {
var subvec = null;
var subvec__4367 = (function (v,start){
return subvec.call(null,v,start,cljs.core.count.call(null,v));
});
var subvec__4368 = (function (v,start,end){
return (new cljs.core.Subvec(null,v,start,end));
});
subvec = function(v,start,end){
switch(arguments.length){
case  2 :
return subvec__4367.call(this,v,start);
case  3 :
return subvec__4368.call(this,v,start,end);
}
throw('Invalid arity: ' + arguments.length);
};
return subvec;
})()
;

/**
* @constructor
*/
cljs.core.PersistentQueueSeq = (function (meta,front,rear){
this.meta = meta;
this.front = front;
this.rear = rear;
})
cljs.core.PersistentQueueSeq.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.PersistentQueueSeq");
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4370 = this;
return coll;
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4371 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4372 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4373 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__4373.meta);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4374 = this;
return cljs.core.cons.call(null,o,coll);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = (function (coll){
var this__4375 = this;
return cljs.core._first.call(null,this__4375.front);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__4376 = this;
var temp__3695__auto____4377 = cljs.core.next.call(null,this__4376.front);

if(cljs.core.truth_(temp__3695__auto____4377))
{var f1__4378 = temp__3695__auto____4377;

return (new cljs.core.PersistentQueueSeq(this__4376.meta,f1__4378,this__4376.rear));
} else
{if(cljs.core.truth_((this__4376.rear === null)))
{return cljs.core._empty.call(null,coll);
} else
{return (new cljs.core.PersistentQueueSeq(this__4376.meta,this__4376.rear,null));
}
}
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4379 = this;
return this__4379.meta;
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4380 = this;
return (new cljs.core.PersistentQueueSeq(meta,this__4380.front,this__4380.rear));
});
cljs.core.PersistentQueueSeq;

/**
* @constructor
*/
cljs.core.PersistentQueue = (function (meta,count,front,rear){
this.meta = meta;
this.count = count;
this.front = front;
this.rear = rear;
})
cljs.core.PersistentQueue.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.PersistentQueue");
});
cljs.core.PersistentQueue.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4381 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4382 = this;
if(cljs.core.truth_(this__4382.front))
{return (new cljs.core.PersistentQueue(this__4382.meta,(this__4382.count + 1),this__4382.front,cljs.core.conj.call(null,(function (){var or__3548__auto____4383 = this__4382.rear;

if(cljs.core.truth_(or__3548__auto____4383))
{return or__3548__auto____4383;
} else
{return cljs.core.PersistentVector.fromArray([]);
}
})(),o)));
} else
{return (new cljs.core.PersistentQueue(this__4382.meta,(this__4382.count + 1),cljs.core.conj.call(null,this__4382.front,o),cljs.core.PersistentVector.fromArray([])));
}
});
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4384 = this;
var rear__4385 = cljs.core.seq.call(null,this__4384.rear);

if(cljs.core.truth_((function (){var or__3548__auto____4386 = this__4384.front;

if(cljs.core.truth_(or__3548__auto____4386))
{return or__3548__auto____4386;
} else
{return rear__4385;
}
})()))
{return (new cljs.core.PersistentQueueSeq(null,this__4384.front,cljs.core.seq.call(null,rear__4385)));
} else
{return cljs.core.List.EMPTY;
}
});
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4387 = this;
return this__4387.count;
});
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4388 = this;
return cljs.core._first.call(null,this__4388.front);
});
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4389 = this;
if(cljs.core.truth_(this__4389.front))
{var temp__3695__auto____4390 = cljs.core.next.call(null,this__4389.front);

if(cljs.core.truth_(temp__3695__auto____4390))
{var f1__4391 = temp__3695__auto____4390;

return (new cljs.core.PersistentQueue(this__4389.meta,(this__4389.count - 1),f1__4391,this__4389.rear));
} else
{return (new cljs.core.PersistentQueue(this__4389.meta,(this__4389.count - 1),cljs.core.seq.call(null,this__4389.rear),cljs.core.PersistentVector.fromArray([])));
}
} else
{return coll;
}
});
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = (function (coll){
var this__4392 = this;
return cljs.core.first.call(null,this__4392.front);
});
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__4393 = this;
return cljs.core.rest.call(null,cljs.core.seq.call(null,coll));
});
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4394 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4395 = this;
return (new cljs.core.PersistentQueue(meta,this__4395.count,this__4395.front,this__4395.rear));
});
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4396 = this;
return this__4396.meta;
});
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4397 = this;
return cljs.core.PersistentQueue.EMPTY;
});
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = (new cljs.core.PersistentQueue(null,0,null,cljs.core.PersistentVector.fromArray([])));

/**
* @constructor
*/
cljs.core.NeverEquiv = (function (){
})
cljs.core.NeverEquiv.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.NeverEquiv");
});
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$ = true;
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv = (function (o,other){
var this__4398 = this;
return false;
});
cljs.core.NeverEquiv;
cljs.core.never_equiv = (new cljs.core.NeverEquiv());
/**
* Assumes y is a map. Returns true if x equals y, otherwise returns
* false.
*/
cljs.core.equiv_map = (function equiv_map(x,y){
return cljs.core.boolean$.call(null,(cljs.core.truth_(cljs.core.map_QMARK_.call(null,y))?(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,x),cljs.core.count.call(null,y)))?cljs.core.every_QMARK_.call(null,cljs.core.identity,cljs.core.map.call(null,(function (xkv){
return cljs.core._EQ_.call(null,cljs.core.get.call(null,y,cljs.core.first.call(null,xkv),cljs.core.never_equiv),cljs.core.second.call(null,xkv));
}),x)):null):null));
});
cljs.core.scan_array = (function scan_array(incr,k,array){
var len__4399 = array.length;

var i__4400 = 0;

while(true){
if(cljs.core.truth_((i__4400 < len__4399)))
{if(cljs.core.truth_(cljs.core._EQ_.call(null,k,(array[i__4400]))))
{return i__4400;
} else
{{
var G__4401 = (i__4400 + incr);
i__4400 = G__4401;
continue;
}
}
} else
{return null;
}
break;
}
});
cljs.core.obj_map_contains_key_QMARK_ = (function() {
var obj_map_contains_key_QMARK_ = null;
var obj_map_contains_key_QMARK___4403 = (function (k,strobj){
return obj_map_contains_key_QMARK_.call(null,k,strobj,true,false);
});
var obj_map_contains_key_QMARK___4404 = (function (k,strobj,true_val,false_val){
if(cljs.core.truth_((function (){var and__3546__auto____4402 = goog.isString.call(null,k);

if(cljs.core.truth_(and__3546__auto____4402))
{return strobj.hasOwnProperty(k);
} else
{return and__3546__auto____4402;
}
})()))
{return true_val;
} else
{return false_val;
}
});
obj_map_contains_key_QMARK_ = function(k,strobj,true_val,false_val){
switch(arguments.length){
case  2 :
return obj_map_contains_key_QMARK___4403.call(this,k,strobj);
case  4 :
return obj_map_contains_key_QMARK___4404.call(this,k,strobj,true_val,false_val);
}
throw('Invalid arity: ' + arguments.length);
};
return obj_map_contains_key_QMARK_;
})()
;
cljs.core.obj_map_compare_keys = (function obj_map_compare_keys(a,b){
var a__4407 = cljs.core.hash.call(null,a);
var b__4408 = cljs.core.hash.call(null,b);

if(cljs.core.truth_((a__4407 < b__4408)))
{return -1;
} else
{if(cljs.core.truth_((a__4407 > b__4408)))
{return 1;
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return 0;
} else
{return null;
}
}
}
});

/**
* @constructor
*/
cljs.core.ObjMap = (function (meta,keys,strobj){
this.meta = meta;
this.keys = keys;
this.strobj = strobj;
})
cljs.core.ObjMap.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.ObjMap");
});
cljs.core.ObjMap.prototype.cljs$core$IHash$ = true;
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4409 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4436 = null;
var G__4436__4437 = (function (coll,k){
var this__4410 = this;
return cljs.core._lookup.call(null,coll,k,null);
});
var G__4436__4438 = (function (coll,k,not_found){
var this__4411 = this;
return cljs.core.obj_map_contains_key_QMARK_.call(null,k,this__4411.strobj,(this__4411.strobj[k]),not_found);
});
G__4436 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__4436__4437.call(this,coll,k);
case  3 :
return G__4436__4438.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4436;
})()
;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__4412 = this;
if(cljs.core.truth_(goog.isString.call(null,k)))
{var new_strobj__4413 = goog.object.clone.call(null,this__4412.strobj);
var overwrite_QMARK___4414 = new_strobj__4413.hasOwnProperty(k);

(new_strobj__4413[k] = v);
if(cljs.core.truth_(overwrite_QMARK___4414))
{return (new cljs.core.ObjMap(this__4412.meta,this__4412.keys,new_strobj__4413));
} else
{var new_keys__4415 = cljs.core.aclone.call(null,this__4412.keys);

new_keys__4415.push(k);
return (new cljs.core.ObjMap(this__4412.meta,new_keys__4415,new_strobj__4413));
}
} else
{return cljs.core.with_meta.call(null,cljs.core.into.call(null,cljs.core.hash_map.call(null,k,v),cljs.core.seq.call(null,coll)),this__4412.meta);
}
});
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = (function (coll,k){
var this__4416 = this;
return cljs.core.obj_map_contains_key_QMARK_.call(null,k,this__4416.strobj);
});
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = (function() {
var G__4440 = null;
var G__4440__4441 = (function (tsym4417,k){
var this__4419 = this;
var tsym4417__4420 = this;

var coll__4421 = tsym4417__4420;

return cljs.core._lookup.call(null,coll__4421,k);
});
var G__4440__4442 = (function (tsym4418,k,not_found){
var this__4422 = this;
var tsym4418__4423 = this;

var coll__4424 = tsym4418__4423;

return cljs.core._lookup.call(null,coll__4424,k,not_found);
});
G__4440 = function(tsym4418,k,not_found){
switch(arguments.length){
case  2 :
return G__4440__4441.call(this,tsym4418,k);
case  3 :
return G__4440__4442.call(this,tsym4418,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4440;
})()
;
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = (function (coll,entry){
var this__4425 = this;
if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null,entry)))
{return cljs.core._assoc.call(null,coll,cljs.core._nth.call(null,entry,0),cljs.core._nth.call(null,entry,1));
} else
{return cljs.core.reduce.call(null,cljs.core._conj,coll,entry);
}
});
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4426 = this;
if(cljs.core.truth_((this__4426.keys.length > 0)))
{return cljs.core.map.call(null,(function (p1__4406_SHARP_){
return cljs.core.vector.call(null,p1__4406_SHARP_,(this__4426.strobj[p1__4406_SHARP_]));
}),this__4426.keys.sort(cljs.core.obj_map_compare_keys));
} else
{return null;
}
});
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4427 = this;
return this__4427.keys.length;
});
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4428 = this;
return cljs.core.equiv_map.call(null,coll,other);
});
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4429 = this;
return (new cljs.core.ObjMap(meta,this__4429.keys,this__4429.strobj));
});
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4430 = this;
return this__4430.meta;
});
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4431 = this;
return cljs.core.with_meta.call(null,cljs.core.ObjMap.EMPTY,this__4431.meta);
});
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = (function (coll,k){
var this__4432 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4433 = goog.isString.call(null,k);

if(cljs.core.truth_(and__3546__auto____4433))
{return this__4432.strobj.hasOwnProperty(k);
} else
{return and__3546__auto____4433;
}
})()))
{var new_keys__4434 = cljs.core.aclone.call(null,this__4432.keys);
var new_strobj__4435 = goog.object.clone.call(null,this__4432.strobj);

new_keys__4434.splice(cljs.core.scan_array.call(null,1,k,new_keys__4434),1);
cljs.core.js_delete.call(null,new_strobj__4435,k);
return (new cljs.core.ObjMap(this__4432.meta,new_keys__4434,new_strobj__4435));
} else
{return coll;
}
});
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = (new cljs.core.ObjMap(null,[],cljs.core.js_obj.call(null)));
cljs.core.ObjMap.fromObject = (function (ks,obj){
return (new cljs.core.ObjMap(null,ks,obj));
});

/**
* @constructor
*/
cljs.core.HashMap = (function (meta,count,hashobj){
this.meta = meta;
this.count = count;
this.hashobj = hashobj;
})
cljs.core.HashMap.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.HashMap");
});
cljs.core.HashMap.prototype.cljs$core$IHash$ = true;
cljs.core.HashMap.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4445 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4483 = null;
var G__4483__4484 = (function (coll,k){
var this__4446 = this;
return cljs.core._lookup.call(null,coll,k,null);
});
var G__4483__4485 = (function (coll,k,not_found){
var this__4447 = this;
var bucket__4448 = (this__4447.hashobj[cljs.core.hash.call(null,k)]);
var i__4449 = (cljs.core.truth_(bucket__4448)?cljs.core.scan_array.call(null,2,k,bucket__4448):null);

if(cljs.core.truth_(i__4449))
{return (bucket__4448[(i__4449 + 1)]);
} else
{return not_found;
}
});
G__4483 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__4483__4484.call(this,coll,k);
case  3 :
return G__4483__4485.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4483;
})()
;
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__4450 = this;
var h__4451 = cljs.core.hash.call(null,k);
var bucket__4452 = (this__4450.hashobj[h__4451]);

if(cljs.core.truth_(bucket__4452))
{var new_bucket__4453 = cljs.core.aclone.call(null,bucket__4452);
var new_hashobj__4454 = goog.object.clone.call(null,this__4450.hashobj);

(new_hashobj__4454[h__4451] = new_bucket__4453);
var temp__3695__auto____4455 = cljs.core.scan_array.call(null,2,k,new_bucket__4453);

if(cljs.core.truth_(temp__3695__auto____4455))
{var i__4456 = temp__3695__auto____4455;

(new_bucket__4453[(i__4456 + 1)] = v);
return (new cljs.core.HashMap(this__4450.meta,this__4450.count,new_hashobj__4454));
} else
{new_bucket__4453.push(k,v);
return (new cljs.core.HashMap(this__4450.meta,(this__4450.count + 1),new_hashobj__4454));
}
} else
{var new_hashobj__4457 = goog.object.clone.call(null,this__4450.hashobj);

(new_hashobj__4457[h__4451] = [k,v]);
return (new cljs.core.HashMap(this__4450.meta,(this__4450.count + 1),new_hashobj__4457));
}
});
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = (function (coll,k){
var this__4458 = this;
var bucket__4459 = (this__4458.hashobj[cljs.core.hash.call(null,k)]);
var i__4460 = (cljs.core.truth_(bucket__4459)?cljs.core.scan_array.call(null,2,k,bucket__4459):null);

if(cljs.core.truth_(i__4460))
{return true;
} else
{return false;
}
});
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = (function() {
var G__4487 = null;
var G__4487__4488 = (function (tsym4461,k){
var this__4463 = this;
var tsym4461__4464 = this;

var coll__4465 = tsym4461__4464;

return cljs.core._lookup.call(null,coll__4465,k);
});
var G__4487__4489 = (function (tsym4462,k,not_found){
var this__4466 = this;
var tsym4462__4467 = this;

var coll__4468 = tsym4462__4467;

return cljs.core._lookup.call(null,coll__4468,k,not_found);
});
G__4487 = function(tsym4462,k,not_found){
switch(arguments.length){
case  2 :
return G__4487__4488.call(this,tsym4462,k);
case  3 :
return G__4487__4489.call(this,tsym4462,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4487;
})()
;
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = (function (coll,entry){
var this__4469 = this;
if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null,entry)))
{return cljs.core._assoc.call(null,coll,cljs.core._nth.call(null,entry,0),cljs.core._nth.call(null,entry,1));
} else
{return cljs.core.reduce.call(null,cljs.core._conj,coll,entry);
}
});
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4470 = this;
if(cljs.core.truth_((this__4470.count > 0)))
{var hashes__4471 = cljs.core.js_keys.call(null,this__4470.hashobj).sort();

return cljs.core.mapcat.call(null,(function (p1__4444_SHARP_){
return cljs.core.map.call(null,cljs.core.vec,cljs.core.partition.call(null,2,(this__4470.hashobj[p1__4444_SHARP_])));
}),hashes__4471);
} else
{return null;
}
});
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4472 = this;
return this__4472.count;
});
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4473 = this;
return cljs.core.equiv_map.call(null,coll,other);
});
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4474 = this;
return (new cljs.core.HashMap(meta,this__4474.count,this__4474.hashobj));
});
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4475 = this;
return this__4475.meta;
});
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4476 = this;
return cljs.core.with_meta.call(null,cljs.core.HashMap.EMPTY,this__4476.meta);
});
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = (function (coll,k){
var this__4477 = this;
var h__4478 = cljs.core.hash.call(null,k);
var bucket__4479 = (this__4477.hashobj[h__4478]);
var i__4480 = (cljs.core.truth_(bucket__4479)?cljs.core.scan_array.call(null,2,k,bucket__4479):null);

if(cljs.core.truth_(cljs.core.not.call(null,i__4480)))
{return coll;
} else
{var new_hashobj__4481 = goog.object.clone.call(null,this__4477.hashobj);

if(cljs.core.truth_((3 > bucket__4479.length)))
{cljs.core.js_delete.call(null,new_hashobj__4481,h__4478);
} else
{var new_bucket__4482 = cljs.core.aclone.call(null,bucket__4479);

new_bucket__4482.splice(i__4480,2);
(new_hashobj__4481[h__4478] = new_bucket__4482);
}
return (new cljs.core.HashMap(this__4477.meta,(this__4477.count - 1),new_hashobj__4481));
}
});
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = (new cljs.core.HashMap(null,0,cljs.core.js_obj.call(null)));
cljs.core.HashMap.fromArrays = (function (ks,vs){
var len__4491 = ks.length;

var i__4492 = 0;
var out__4493 = cljs.core.HashMap.EMPTY;

while(true){
if(cljs.core.truth_((i__4492 < len__4491)))
{{
var G__4494 = (i__4492 + 1);
var G__4495 = cljs.core.assoc.call(null,out__4493,(ks[i__4492]),(vs[i__4492]));
i__4492 = G__4494;
out__4493 = G__4495;
continue;
}
} else
{return out__4493;
}
break;
}
});
/**
* keyval => key val
* Returns a new hash map with supplied mappings.
* @param {...*} var_args
*/
cljs.core.hash_map = (function() { 
var hash_map__delegate = function (keyvals){
var in$__4496 = cljs.core.seq.call(null,keyvals);
var out__4497 = cljs.core.HashMap.EMPTY;

while(true){
if(cljs.core.truth_(in$__4496))
{{
var G__4498 = cljs.core.nnext.call(null,in$__4496);
var G__4499 = cljs.core.assoc.call(null,out__4497,cljs.core.first.call(null,in$__4496),cljs.core.second.call(null,in$__4496));
in$__4496 = G__4498;
out__4497 = G__4499;
continue;
}
} else
{return out__4497;
}
break;
}
};
var hash_map = function (var_args){
var keyvals = null;
if (goog.isDef(var_args)) {
  keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return hash_map__delegate.call(this, keyvals);
};
hash_map.cljs$lang$maxFixedArity = 0;
hash_map.cljs$lang$applyTo = (function (arglist__4500){
var keyvals = cljs.core.seq( arglist__4500 );;
return hash_map__delegate.call(this, keyvals);
});
return hash_map;
})()
;
/**
* Returns a sequence of the map's keys.
*/
cljs.core.keys = (function keys(hash_map){
return cljs.core.seq.call(null,cljs.core.map.call(null,cljs.core.first,hash_map));
});
/**
* Returns a sequence of the map's values.
*/
cljs.core.vals = (function vals(hash_map){
return cljs.core.seq.call(null,cljs.core.map.call(null,cljs.core.second,hash_map));
});
/**
* Returns a map that consists of the rest of the maps conj-ed onto
* the first.  If a key occurs in more than one map, the mapping from
* the latter (left-to-right) will be the mapping in the result.
* @param {...*} var_args
*/
cljs.core.merge = (function() { 
var merge__delegate = function (maps){
if(cljs.core.truth_(cljs.core.some.call(null,cljs.core.identity,maps)))
{return cljs.core.reduce.call(null,(function (p1__4501_SHARP_,p2__4502_SHARP_){
return cljs.core.conj.call(null,(function (){var or__3548__auto____4503 = p1__4501_SHARP_;

if(cljs.core.truth_(or__3548__auto____4503))
{return or__3548__auto____4503;
} else
{return cljs.core.ObjMap.fromObject([],{});
}
})(),p2__4502_SHARP_);
}),maps);
} else
{return null;
}
};
var merge = function (var_args){
var maps = null;
if (goog.isDef(var_args)) {
  maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return merge__delegate.call(this, maps);
};
merge.cljs$lang$maxFixedArity = 0;
merge.cljs$lang$applyTo = (function (arglist__4504){
var maps = cljs.core.seq( arglist__4504 );;
return merge__delegate.call(this, maps);
});
return merge;
})()
;
/**
* Returns a map that consists of the rest of the maps conj-ed onto
* the first.  If a key occurs in more than one map, the mapping(s)
* from the latter (left-to-right) will be combined with the mapping in
* the result by calling (f val-in-result val-in-latter).
* @param {...*} var_args
*/
cljs.core.merge_with = (function() { 
var merge_with__delegate = function (f,maps){
if(cljs.core.truth_(cljs.core.some.call(null,cljs.core.identity,maps)))
{var merge_entry__4507 = (function (m,e){
var k__4505 = cljs.core.first.call(null,e);
var v__4506 = cljs.core.second.call(null,e);

if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,m,k__4505)))
{return cljs.core.assoc.call(null,m,k__4505,f.call(null,cljs.core.get.call(null,m,k__4505),v__4506));
} else
{return cljs.core.assoc.call(null,m,k__4505,v__4506);
}
});
var merge2__4509 = (function (m1,m2){
return cljs.core.reduce.call(null,merge_entry__4507,(function (){var or__3548__auto____4508 = m1;

if(cljs.core.truth_(or__3548__auto____4508))
{return or__3548__auto____4508;
} else
{return cljs.core.ObjMap.fromObject([],{});
}
})(),cljs.core.seq.call(null,m2));
});

return cljs.core.reduce.call(null,merge2__4509,maps);
} else
{return null;
}
};
var merge_with = function (f,var_args){
var maps = null;
if (goog.isDef(var_args)) {
  maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return merge_with__delegate.call(this, f, maps);
};
merge_with.cljs$lang$maxFixedArity = 1;
merge_with.cljs$lang$applyTo = (function (arglist__4510){
var f = cljs.core.first(arglist__4510);
var maps = cljs.core.rest(arglist__4510);
return merge_with__delegate.call(this, f, maps);
});
return merge_with;
})()
;
/**
* Returns a map containing only those entries in map whose key is in keys
*/
cljs.core.select_keys = (function select_keys(map,keyseq){
var ret__4512 = cljs.core.ObjMap.fromObject([],{});
var keys__4513 = cljs.core.seq.call(null,keyseq);

while(true){
if(cljs.core.truth_(keys__4513))
{var key__4514 = cljs.core.first.call(null,keys__4513);
var entry__4515 = cljs.core.get.call(null,map,key__4514,"\uFDD0'user/not-found");

{
var G__4516 = (cljs.core.truth_(cljs.core.not_EQ_.call(null,entry__4515,"\uFDD0'user/not-found"))?cljs.core.assoc.call(null,ret__4512,key__4514,entry__4515):ret__4512);
var G__4517 = cljs.core.next.call(null,keys__4513);
ret__4512 = G__4516;
keys__4513 = G__4517;
continue;
}
} else
{return ret__4512;
}
break;
}
});

/**
* @constructor
*/
cljs.core.Set = (function (meta,hash_map){
this.meta = meta;
this.hash_map = hash_map;
})
cljs.core.Set.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Set");
});
cljs.core.Set.prototype.cljs$core$IHash$ = true;
cljs.core.Set.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4518 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4539 = null;
var G__4539__4540 = (function (coll,v){
var this__4519 = this;
return cljs.core._lookup.call(null,coll,v,null);
});
var G__4539__4541 = (function (coll,v,not_found){
var this__4520 = this;
if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null,this__4520.hash_map,v)))
{return v;
} else
{return not_found;
}
});
G__4539 = function(coll,v,not_found){
switch(arguments.length){
case  2 :
return G__4539__4540.call(this,coll,v);
case  3 :
return G__4539__4541.call(this,coll,v,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4539;
})()
;
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = (function() {
var G__4543 = null;
var G__4543__4544 = (function (tsym4521,k){
var this__4523 = this;
var tsym4521__4524 = this;

var coll__4525 = tsym4521__4524;

return cljs.core._lookup.call(null,coll__4525,k);
});
var G__4543__4545 = (function (tsym4522,k,not_found){
var this__4526 = this;
var tsym4522__4527 = this;

var coll__4528 = tsym4522__4527;

return cljs.core._lookup.call(null,coll__4528,k,not_found);
});
G__4543 = function(tsym4522,k,not_found){
switch(arguments.length){
case  2 :
return G__4543__4544.call(this,tsym4522,k);
case  3 :
return G__4543__4545.call(this,tsym4522,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4543;
})()
;
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4529 = this;
return (new cljs.core.Set(this__4529.meta,cljs.core.assoc.call(null,this__4529.hash_map,o,null)));
});
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4530 = this;
return cljs.core.keys.call(null,this__4530.hash_map);
});
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = (function (coll,v){
var this__4531 = this;
return (new cljs.core.Set(this__4531.meta,cljs.core.dissoc.call(null,this__4531.hash_map,v)));
});
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4532 = this;
return cljs.core.count.call(null,cljs.core.seq.call(null,coll));
});
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4533 = this;
var and__3546__auto____4534 = cljs.core.set_QMARK_.call(null,other);

if(cljs.core.truth_(and__3546__auto____4534))
{var and__3546__auto____4535 = cljs.core._EQ_.call(null,cljs.core.count.call(null,coll),cljs.core.count.call(null,other));

if(cljs.core.truth_(and__3546__auto____4535))
{return cljs.core.every_QMARK_.call(null,(function (p1__4511_SHARP_){
return cljs.core.contains_QMARK_.call(null,coll,p1__4511_SHARP_);
}),other);
} else
{return and__3546__auto____4535;
}
} else
{return and__3546__auto____4534;
}
});
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4536 = this;
return (new cljs.core.Set(meta,this__4536.hash_map));
});
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4537 = this;
return this__4537.meta;
});
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4538 = this;
return cljs.core.with_meta.call(null,cljs.core.Set.EMPTY,this__4538.meta);
});
cljs.core.Set;
cljs.core.Set.EMPTY = (new cljs.core.Set(null,cljs.core.hash_map.call(null)));
/**
* Returns a set of the distinct elements of coll.
*/
cljs.core.set = (function set(coll){
var in$__4548 = cljs.core.seq.call(null,coll);
var out__4549 = cljs.core.Set.EMPTY;

while(true){
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core.empty_QMARK_.call(null,in$__4548))))
{{
var G__4550 = cljs.core.rest.call(null,in$__4548);
var G__4551 = cljs.core.conj.call(null,out__4549,cljs.core.first.call(null,in$__4548));
in$__4548 = G__4550;
out__4549 = G__4551;
continue;
}
} else
{return out__4549;
}
break;
}
});
/**
* Given a map of replacement pairs and a vector/collection, returns a
* vector/seq with any elements = a key in smap replaced with the
* corresponding val in smap
*/
cljs.core.replace = (function replace(smap,coll){
if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null,coll)))
{var n__4552 = cljs.core.count.call(null,coll);

return cljs.core.reduce.call(null,(function (v,i){
var temp__3695__auto____4553 = cljs.core.find.call(null,smap,cljs.core.nth.call(null,v,i));

if(cljs.core.truth_(temp__3695__auto____4553))
{var e__4554 = temp__3695__auto____4553;

return cljs.core.assoc.call(null,v,i,cljs.core.second.call(null,e__4554));
} else
{return v;
}
}),coll,cljs.core.take.call(null,n__4552,cljs.core.iterate.call(null,cljs.core.inc,0)));
} else
{return cljs.core.map.call(null,(function (p1__4547_SHARP_){
var temp__3695__auto____4555 = cljs.core.find.call(null,smap,p1__4547_SHARP_);

if(cljs.core.truth_(temp__3695__auto____4555))
{var e__4556 = temp__3695__auto____4555;

return cljs.core.second.call(null,e__4556);
} else
{return p1__4547_SHARP_;
}
}),coll);
}
});
/**
* Returns a lazy sequence of the elements of coll with duplicates removed
*/
cljs.core.distinct = (function distinct(coll){
var step__4564 = (function step(xs,seen){
return (new cljs.core.LazySeq(null,false,(function (){
return (function (p__4557,seen){
while(true){
var vec__4558__4559 = p__4557;
var f__4560 = cljs.core.nth.call(null,vec__4558__4559,0,null);
var xs__4561 = vec__4558__4559;

var temp__3698__auto____4562 = cljs.core.seq.call(null,xs__4561);

if(cljs.core.truth_(temp__3698__auto____4562))
{var s__4563 = temp__3698__auto____4562;

if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,seen,f__4560)))
{{
var G__4565 = cljs.core.rest.call(null,s__4563);
var G__4566 = seen;
p__4557 = G__4565;
seen = G__4566;
continue;
}
} else
{return cljs.core.cons.call(null,f__4560,step.call(null,cljs.core.rest.call(null,s__4563),cljs.core.conj.call(null,seen,f__4560)));
}
} else
{return null;
}
break;
}
}).call(null,xs,seen);
})));
});

return step__4564.call(null,coll,cljs.core.set([]));
});
cljs.core.butlast = (function butlast(s){
var ret__4567 = cljs.core.PersistentVector.fromArray([]);
var s__4568 = s;

while(true){
if(cljs.core.truth_(cljs.core.next.call(null,s__4568)))
{{
var G__4569 = cljs.core.conj.call(null,ret__4567,cljs.core.first.call(null,s__4568));
var G__4570 = cljs.core.next.call(null,s__4568);
ret__4567 = G__4569;
s__4568 = G__4570;
continue;
}
} else
{return cljs.core.seq.call(null,ret__4567);
}
break;
}
});
/**
* Returns the name String of a string, symbol or keyword.
*/
cljs.core.name = (function name(x){
if(cljs.core.truth_(cljs.core.string_QMARK_.call(null,x)))
{return x;
} else
{if(cljs.core.truth_((function (){var or__3548__auto____4571 = cljs.core.keyword_QMARK_.call(null,x);

if(cljs.core.truth_(or__3548__auto____4571))
{return or__3548__auto____4571;
} else
{return cljs.core.symbol_QMARK_.call(null,x);
}
})()))
{var i__4572 = x.lastIndexOf("\/");

if(cljs.core.truth_((i__4572 < 0)))
{return cljs.core.subs.call(null,x,2);
} else
{return cljs.core.subs.call(null,x,(i__4572 + 1));
}
} else
{if(cljs.core.truth_("\uFDD0'else"))
{throw (new Error(cljs.core.str.call(null,"Doesn't support name: ",x)));
} else
{return null;
}
}
}
});
/**
* Returns the namespace String of a symbol or keyword, or nil if not present.
*/
cljs.core.namespace = (function namespace(x){
if(cljs.core.truth_((function (){var or__3548__auto____4573 = cljs.core.keyword_QMARK_.call(null,x);

if(cljs.core.truth_(or__3548__auto____4573))
{return or__3548__auto____4573;
} else
{return cljs.core.symbol_QMARK_.call(null,x);
}
})()))
{var i__4574 = x.lastIndexOf("\/");

if(cljs.core.truth_((i__4574 > -1)))
{return cljs.core.subs.call(null,x,2,i__4574);
} else
{return null;
}
} else
{throw (new Error(cljs.core.str.call(null,"Doesn't support namespace: ",x)));
}
});
/**
* Returns a map with the keys mapped to the corresponding vals.
*/
cljs.core.zipmap = (function zipmap(keys,vals){
var map__4577 = cljs.core.ObjMap.fromObject([],{});
var ks__4578 = cljs.core.seq.call(null,keys);
var vs__4579 = cljs.core.seq.call(null,vals);

while(true){
if(cljs.core.truth_((function (){var and__3546__auto____4580 = ks__4578;

if(cljs.core.truth_(and__3546__auto____4580))
{return vs__4579;
} else
{return and__3546__auto____4580;
}
})()))
{{
var G__4581 = cljs.core.assoc.call(null,map__4577,cljs.core.first.call(null,ks__4578),cljs.core.first.call(null,vs__4579));
var G__4582 = cljs.core.next.call(null,ks__4578);
var G__4583 = cljs.core.next.call(null,vs__4579);
map__4577 = G__4581;
ks__4578 = G__4582;
vs__4579 = G__4583;
continue;
}
} else
{return map__4577;
}
break;
}
});
/**
* Returns the x for which (k x), a number, is greatest.
* @param {...*} var_args
*/
cljs.core.max_key = (function() {
var max_key = null;
var max_key__4586 = (function (k,x){
return x;
});
var max_key__4587 = (function (k,x,y){
if(cljs.core.truth_((k.call(null,x) > k.call(null,y))))
{return x;
} else
{return y;
}
});
var max_key__4588 = (function() { 
var G__4590__delegate = function (k,x,y,more){
return cljs.core.reduce.call(null,(function (p1__4575_SHARP_,p2__4576_SHARP_){
return max_key.call(null,k,p1__4575_SHARP_,p2__4576_SHARP_);
}),max_key.call(null,k,x,y),more);
};
var G__4590 = function (k,x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4590__delegate.call(this, k, x, y, more);
};
G__4590.cljs$lang$maxFixedArity = 3;
G__4590.cljs$lang$applyTo = (function (arglist__4591){
var k = cljs.core.first(arglist__4591);
var x = cljs.core.first(cljs.core.next(arglist__4591));
var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4591)));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4591)));
return G__4590__delegate.call(this, k, x, y, more);
});
return G__4590;
})()
;
max_key = function(k,x,y,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return max_key__4586.call(this,k,x);
case  3 :
return max_key__4587.call(this,k,x,y);
default:
return max_key__4588.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
max_key.cljs$lang$maxFixedArity = 3;
max_key.cljs$lang$applyTo = max_key__4588.cljs$lang$applyTo;
return max_key;
})()
;
/**
* Returns the x for which (k x), a number, is least.
* @param {...*} var_args
*/
cljs.core.min_key = (function() {
var min_key = null;
var min_key__4592 = (function (k,x){
return x;
});
var min_key__4593 = (function (k,x,y){
if(cljs.core.truth_((k.call(null,x) < k.call(null,y))))
{return x;
} else
{return y;
}
});
var min_key__4594 = (function() { 
var G__4596__delegate = function (k,x,y,more){
return cljs.core.reduce.call(null,(function (p1__4584_SHARP_,p2__4585_SHARP_){
return min_key.call(null,k,p1__4584_SHARP_,p2__4585_SHARP_);
}),min_key.call(null,k,x,y),more);
};
var G__4596 = function (k,x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4596__delegate.call(this, k, x, y, more);
};
G__4596.cljs$lang$maxFixedArity = 3;
G__4596.cljs$lang$applyTo = (function (arglist__4597){
var k = cljs.core.first(arglist__4597);
var x = cljs.core.first(cljs.core.next(arglist__4597));
var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4597)));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4597)));
return G__4596__delegate.call(this, k, x, y, more);
});
return G__4596;
})()
;
min_key = function(k,x,y,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return min_key__4592.call(this,k,x);
case  3 :
return min_key__4593.call(this,k,x,y);
default:
return min_key__4594.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
min_key.cljs$lang$maxFixedArity = 3;
min_key.cljs$lang$applyTo = min_key__4594.cljs$lang$applyTo;
return min_key;
})()
;
/**
* Returns a lazy sequence of lists like partition, but may include
* partitions with fewer than n items at the end.
*/
cljs.core.partition_all = (function() {
var partition_all = null;
var partition_all__4600 = (function (n,coll){
return partition_all.call(null,n,n,coll);
});
var partition_all__4601 = (function (n,step,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4598 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4598))
{var s__4599 = temp__3698__auto____4598;

return cljs.core.cons.call(null,cljs.core.take.call(null,n,s__4599),partition_all.call(null,n,step,cljs.core.drop.call(null,step,s__4599)));
} else
{return null;
}
})));
});
partition_all = function(n,step,coll){
switch(arguments.length){
case  2 :
return partition_all__4600.call(this,n,step);
case  3 :
return partition_all__4601.call(this,n,step,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return partition_all;
})()
;
/**
* Returns a lazy sequence of successive items from coll while
* (pred item) returns true. pred must be free of side-effects.
*/
cljs.core.take_while = (function take_while(pred,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4603 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4603))
{var s__4604 = temp__3698__auto____4603;

if(cljs.core.truth_(pred.call(null,cljs.core.first.call(null,s__4604))))
{return cljs.core.cons.call(null,cljs.core.first.call(null,s__4604),take_while.call(null,pred,cljs.core.rest.call(null,s__4604)));
} else
{return null;
}
} else
{return null;
}
})));
});

/**
* @constructor
*/
cljs.core.Range = (function (meta,start,end,step){
this.meta = meta;
this.start = start;
this.end = end;
this.step = step;
})
cljs.core.Range.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Range");
});
cljs.core.Range.prototype.cljs$core$IHash$ = true;
cljs.core.Range.prototype.cljs$core$IHash$_hash = (function (rng){
var this__4605 = this;
return cljs.core.hash_coll.call(null,rng);
});
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = (function (rng,o){
var this__4606 = this;
return cljs.core.cons.call(null,o,rng);
});
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = (function() {
var G__4622 = null;
var G__4622__4623 = (function (rng,f){
var this__4607 = this;
return cljs.core.ci_reduce.call(null,rng,f);
});
var G__4622__4624 = (function (rng,f,s){
var this__4608 = this;
return cljs.core.ci_reduce.call(null,rng,f,s);
});
G__4622 = function(rng,f,s){
switch(arguments.length){
case  2 :
return G__4622__4623.call(this,rng,f);
case  3 :
return G__4622__4624.call(this,rng,f,s);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4622;
})()
;
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = (function (rng){
var this__4609 = this;
var comp__4610 = (cljs.core.truth_((this__4609.step > 0))?cljs.core._LT_:cljs.core._GT_);

if(cljs.core.truth_(comp__4610.call(null,this__4609.start,this__4609.end)))
{return rng;
} else
{return null;
}
});
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = (function (rng){
var this__4611 = this;
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core._seq.call(null,rng))))
{return 0;
} else
{return Math['ceil'].call(null,((this__4611.end - this__4611.start) / this__4611.step));
}
});
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = (function (rng){
var this__4612 = this;
return this__4612.start;
});
cljs.core.Range.prototype.cljs$core$ISeq$_rest = (function (rng){
var this__4613 = this;
if(cljs.core.truth_(cljs.core._seq.call(null,rng)))
{return (new cljs.core.Range(this__4613.meta,(this__4613.start + this__4613.step),this__4613.end,this__4613.step));
} else
{return cljs.core.list.call(null);
}
});
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = (function (rng,other){
var this__4614 = this;
return cljs.core.equiv_sequential.call(null,rng,other);
});
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = (function (rng,meta){
var this__4615 = this;
return (new cljs.core.Range(meta,this__4615.start,this__4615.end,this__4615.step));
});
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = (function (rng){
var this__4616 = this;
return this__4616.meta;
});
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = (function() {
var G__4626 = null;
var G__4626__4627 = (function (rng,n){
var this__4617 = this;
if(cljs.core.truth_((n < cljs.core._count.call(null,rng))))
{return (this__4617.start + (n * this__4617.step));
} else
{if(cljs.core.truth_((function (){var and__3546__auto____4618 = (this__4617.start > this__4617.end);

if(cljs.core.truth_(and__3546__auto____4618))
{return cljs.core._EQ_.call(null,this__4617.step,0);
} else
{return and__3546__auto____4618;
}
})()))
{return this__4617.start;
} else
{throw (new Error("Index out of bounds"));
}
}
});
var G__4626__4628 = (function (rng,n,not_found){
var this__4619 = this;
if(cljs.core.truth_((n < cljs.core._count.call(null,rng))))
{return (this__4619.start + (n * this__4619.step));
} else
{if(cljs.core.truth_((function (){var and__3546__auto____4620 = (this__4619.start > this__4619.end);

if(cljs.core.truth_(and__3546__auto____4620))
{return cljs.core._EQ_.call(null,this__4619.step,0);
} else
{return and__3546__auto____4620;
}
})()))
{return this__4619.start;
} else
{return not_found;
}
}
});
G__4626 = function(rng,n,not_found){
switch(arguments.length){
case  2 :
return G__4626__4627.call(this,rng,n);
case  3 :
return G__4626__4628.call(this,rng,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4626;
})()
;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = (function (rng){
var this__4621 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__4621.meta);
});
cljs.core.Range;
/**
* Returns a lazy seq of nums from start (inclusive) to end
* (exclusive), by step, where start defaults to 0, step to 1,
* and end to infinity.
*/
cljs.core.range = (function() {
var range = null;
var range__4630 = (function (){
return range.call(null,0,Number['MAX_VALUE'],1);
});
var range__4631 = (function (end){
return range.call(null,0,end,1);
});
var range__4632 = (function (start,end){
return range.call(null,start,end,1);
});
var range__4633 = (function (start,end,step){
return (new cljs.core.Range(null,start,end,step));
});
range = function(start,end,step){
switch(arguments.length){
case  0 :
return range__4630.call(this);
case  1 :
return range__4631.call(this,start);
case  2 :
return range__4632.call(this,start,end);
case  3 :
return range__4633.call(this,start,end,step);
}
throw('Invalid arity: ' + arguments.length);
};
return range;
})()
;
/**
* Returns a lazy seq of every nth item in coll.
*/
cljs.core.take_nth = (function take_nth(n,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4635 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4635))
{var s__4636 = temp__3698__auto____4635;

return cljs.core.cons.call(null,cljs.core.first.call(null,s__4636),take_nth.call(null,n,cljs.core.drop.call(null,n,s__4636)));
} else
{return null;
}
})));
});
/**
* Returns a vector of [(take-while pred coll) (drop-while pred coll)]
*/
cljs.core.split_with = (function split_with(pred,coll){
return cljs.core.PersistentVector.fromArray([cljs.core.take_while.call(null,pred,coll),cljs.core.drop_while.call(null,pred,coll)]);
});
/**
* Applies f to each value in coll, splitting it each time f returns
* a new value.  Returns a lazy seq of partitions.
*/
cljs.core.partition_by = (function partition_by(f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4638 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4638))
{var s__4639 = temp__3698__auto____4638;

var fst__4640 = cljs.core.first.call(null,s__4639);
var fv__4641 = f.call(null,fst__4640);
var run__4642 = cljs.core.cons.call(null,fst__4640,cljs.core.take_while.call(null,(function (p1__4637_SHARP_){
return cljs.core._EQ_.call(null,fv__4641,f.call(null,p1__4637_SHARP_));
}),cljs.core.next.call(null,s__4639)));

return cljs.core.cons.call(null,run__4642,partition_by.call(null,f,cljs.core.seq.call(null,cljs.core.drop.call(null,cljs.core.count.call(null,run__4642),s__4639))));
} else
{return null;
}
})));
});
/**
* Returns a map from distinct items in coll to the number of times
* they appear.
*/
cljs.core.frequencies = (function frequencies(coll){
return cljs.core.reduce.call(null,(function (counts,x){
return cljs.core.assoc.call(null,counts,x,(cljs.core.get.call(null,counts,x,0) + 1));
}),cljs.core.ObjMap.fromObject([],{}),coll);
});
/**
* Returns a lazy seq of the intermediate values of the reduction (as
* per reduce) of coll by f, starting with init.
*/
cljs.core.reductions = (function() {
var reductions = null;
var reductions__4657 = (function (f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3695__auto____4653 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3695__auto____4653))
{var s__4654 = temp__3695__auto____4653;

return reductions.call(null,f,cljs.core.first.call(null,s__4654),cljs.core.rest.call(null,s__4654));
} else
{return cljs.core.list.call(null,f.call(null));
}
})));
});
var reductions__4658 = (function (f,init,coll){
return cljs.core.cons.call(null,init,(new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4655 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4655))
{var s__4656 = temp__3698__auto____4655;

return reductions.call(null,f,f.call(null,init,cljs.core.first.call(null,s__4656)),cljs.core.rest.call(null,s__4656));
} else
{return null;
}
}))));
});
reductions = function(f,init,coll){
switch(arguments.length){
case  2 :
return reductions__4657.call(this,f,init);
case  3 :
return reductions__4658.call(this,f,init,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return reductions;
})()
;
/**
* Takes a set of functions and returns a fn that is the juxtaposition
* of those fns.  The returned fn takes a variable number of args, and
* returns a vector containing the result of applying each fn to the
* args (left-to-right).
* ((juxt a b c) x) => [(a x) (b x) (c x)]
* @param {...*} var_args
*/
cljs.core.juxt = (function() {
var juxt = null;
var juxt__4661 = (function (f){
return (function() {
var G__4666 = null;
var G__4666__4667 = (function (){
return cljs.core.vector.call(null,f.call(null));
});
var G__4666__4668 = (function (x){
return cljs.core.vector.call(null,f.call(null,x));
});
var G__4666__4669 = (function (x,y){
return cljs.core.vector.call(null,f.call(null,x,y));
});
var G__4666__4670 = (function (x,y,z){
return cljs.core.vector.call(null,f.call(null,x,y,z));
});
var G__4666__4671 = (function() { 
var G__4673__delegate = function (x,y,z,args){
return cljs.core.vector.call(null,cljs.core.apply.call(null,f,x,y,z,args));
};
var G__4673 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4673__delegate.call(this, x, y, z, args);
};
G__4673.cljs$lang$maxFixedArity = 3;
G__4673.cljs$lang$applyTo = (function (arglist__4674){
var x = cljs.core.first(arglist__4674);
var y = cljs.core.first(cljs.core.next(arglist__4674));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4674)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4674)));
return G__4673__delegate.call(this, x, y, z, args);
});
return G__4673;
})()
;
G__4666 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__4666__4667.call(this);
case  1 :
return G__4666__4668.call(this,x);
case  2 :
return G__4666__4669.call(this,x,y);
case  3 :
return G__4666__4670.call(this,x,y,z);
default:
return G__4666__4671.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4666.cljs$lang$maxFixedArity = 3;
G__4666.cljs$lang$applyTo = G__4666__4671.cljs$lang$applyTo;
return G__4666;
})()
});
var juxt__4662 = (function (f,g){
return (function() {
var G__4675 = null;
var G__4675__4676 = (function (){
return cljs.core.vector.call(null,f.call(null),g.call(null));
});
var G__4675__4677 = (function (x){
return cljs.core.vector.call(null,f.call(null,x),g.call(null,x));
});
var G__4675__4678 = (function (x,y){
return cljs.core.vector.call(null,f.call(null,x,y),g.call(null,x,y));
});
var G__4675__4679 = (function (x,y,z){
return cljs.core.vector.call(null,f.call(null,x,y,z),g.call(null,x,y,z));
});
var G__4675__4680 = (function() { 
var G__4682__delegate = function (x,y,z,args){
return cljs.core.vector.call(null,cljs.core.apply.call(null,f,x,y,z,args),cljs.core.apply.call(null,g,x,y,z,args));
};
var G__4682 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4682__delegate.call(this, x, y, z, args);
};
G__4682.cljs$lang$maxFixedArity = 3;
G__4682.cljs$lang$applyTo = (function (arglist__4683){
var x = cljs.core.first(arglist__4683);
var y = cljs.core.first(cljs.core.next(arglist__4683));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4683)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4683)));
return G__4682__delegate.call(this, x, y, z, args);
});
return G__4682;
})()
;
G__4675 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__4675__4676.call(this);
case  1 :
return G__4675__4677.call(this,x);
case  2 :
return G__4675__4678.call(this,x,y);
case  3 :
return G__4675__4679.call(this,x,y,z);
default:
return G__4675__4680.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4675.cljs$lang$maxFixedArity = 3;
G__4675.cljs$lang$applyTo = G__4675__4680.cljs$lang$applyTo;
return G__4675;
})()
});
var juxt__4663 = (function (f,g,h){
return (function() {
var G__4684 = null;
var G__4684__4685 = (function (){
return cljs.core.vector.call(null,f.call(null),g.call(null),h.call(null));
});
var G__4684__4686 = (function (x){
return cljs.core.vector.call(null,f.call(null,x),g.call(null,x),h.call(null,x));
});
var G__4684__4687 = (function (x,y){
return cljs.core.vector.call(null,f.call(null,x,y),g.call(null,x,y),h.call(null,x,y));
});
var G__4684__4688 = (function (x,y,z){
return cljs.core.vector.call(null,f.call(null,x,y,z),g.call(null,x,y,z),h.call(null,x,y,z));
});
var G__4684__4689 = (function() { 
var G__4691__delegate = function (x,y,z,args){
return cljs.core.vector.call(null,cljs.core.apply.call(null,f,x,y,z,args),cljs.core.apply.call(null,g,x,y,z,args),cljs.core.apply.call(null,h,x,y,z,args));
};
var G__4691 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4691__delegate.call(this, x, y, z, args);
};
G__4691.cljs$lang$maxFixedArity = 3;
G__4691.cljs$lang$applyTo = (function (arglist__4692){
var x = cljs.core.first(arglist__4692);
var y = cljs.core.first(cljs.core.next(arglist__4692));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4692)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4692)));
return G__4691__delegate.call(this, x, y, z, args);
});
return G__4691;
})()
;
G__4684 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__4684__4685.call(this);
case  1 :
return G__4684__4686.call(this,x);
case  2 :
return G__4684__4687.call(this,x,y);
case  3 :
return G__4684__4688.call(this,x,y,z);
default:
return G__4684__4689.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4684.cljs$lang$maxFixedArity = 3;
G__4684.cljs$lang$applyTo = G__4684__4689.cljs$lang$applyTo;
return G__4684;
})()
});
var juxt__4664 = (function() { 
var G__4693__delegate = function (f,g,h,fs){
var fs__4660 = cljs.core.list_STAR_.call(null,f,g,h,fs);

return (function() {
var G__4694 = null;
var G__4694__4695 = (function (){
return cljs.core.reduce.call(null,(function (p1__4643_SHARP_,p2__4644_SHARP_){
return cljs.core.conj.call(null,p1__4643_SHARP_,p2__4644_SHARP_.call(null));
}),cljs.core.PersistentVector.fromArray([]),fs__4660);
});
var G__4694__4696 = (function (x){
return cljs.core.reduce.call(null,(function (p1__4645_SHARP_,p2__4646_SHARP_){
return cljs.core.conj.call(null,p1__4645_SHARP_,p2__4646_SHARP_.call(null,x));
}),cljs.core.PersistentVector.fromArray([]),fs__4660);
});
var G__4694__4697 = (function (x,y){
return cljs.core.reduce.call(null,(function (p1__4647_SHARP_,p2__4648_SHARP_){
return cljs.core.conj.call(null,p1__4647_SHARP_,p2__4648_SHARP_.call(null,x,y));
}),cljs.core.PersistentVector.fromArray([]),fs__4660);
});
var G__4694__4698 = (function (x,y,z){
return cljs.core.reduce.call(null,(function (p1__4649_SHARP_,p2__4650_SHARP_){
return cljs.core.conj.call(null,p1__4649_SHARP_,p2__4650_SHARP_.call(null,x,y,z));
}),cljs.core.PersistentVector.fromArray([]),fs__4660);
});
var G__4694__4699 = (function() { 
var G__4701__delegate = function (x,y,z,args){
return cljs.core.reduce.call(null,(function (p1__4651_SHARP_,p2__4652_SHARP_){
return cljs.core.conj.call(null,p1__4651_SHARP_,cljs.core.apply.call(null,p2__4652_SHARP_,x,y,z,args));
}),cljs.core.PersistentVector.fromArray([]),fs__4660);
};
var G__4701 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4701__delegate.call(this, x, y, z, args);
};
G__4701.cljs$lang$maxFixedArity = 3;
G__4701.cljs$lang$applyTo = (function (arglist__4702){
var x = cljs.core.first(arglist__4702);
var y = cljs.core.first(cljs.core.next(arglist__4702));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4702)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4702)));
return G__4701__delegate.call(this, x, y, z, args);
});
return G__4701;
})()
;
G__4694 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__4694__4695.call(this);
case  1 :
return G__4694__4696.call(this,x);
case  2 :
return G__4694__4697.call(this,x,y);
case  3 :
return G__4694__4698.call(this,x,y,z);
default:
return G__4694__4699.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4694.cljs$lang$maxFixedArity = 3;
G__4694.cljs$lang$applyTo = G__4694__4699.cljs$lang$applyTo;
return G__4694;
})()
};
var G__4693 = function (f,g,h,var_args){
var fs = null;
if (goog.isDef(var_args)) {
  fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4693__delegate.call(this, f, g, h, fs);
};
G__4693.cljs$lang$maxFixedArity = 3;
G__4693.cljs$lang$applyTo = (function (arglist__4703){
var f = cljs.core.first(arglist__4703);
var g = cljs.core.first(cljs.core.next(arglist__4703));
var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4703)));
var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4703)));
return G__4693__delegate.call(this, f, g, h, fs);
});
return G__4693;
})()
;
juxt = function(f,g,h,var_args){
var fs = var_args;
switch(arguments.length){
case  1 :
return juxt__4661.call(this,f);
case  2 :
return juxt__4662.call(this,f,g);
case  3 :
return juxt__4663.call(this,f,g,h);
default:
return juxt__4664.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
juxt.cljs$lang$maxFixedArity = 3;
juxt.cljs$lang$applyTo = juxt__4664.cljs$lang$applyTo;
return juxt;
})()
;
/**
* When lazy sequences are produced via functions that have side
* effects, any effects other than those needed to produce the first
* element in the seq do not occur until the seq is consumed. dorun can
* be used to force any effects. Walks through the successive nexts of
* the seq, does not retain the head and returns nil.
*/
cljs.core.dorun = (function() {
var dorun = null;
var dorun__4705 = (function (coll){
while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,coll)))
{{
var G__4708 = cljs.core.next.call(null,coll);
coll = G__4708;
continue;
}
} else
{return null;
}
break;
}
});
var dorun__4706 = (function (n,coll){
while(true){
if(cljs.core.truth_((function (){var and__3546__auto____4704 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(and__3546__auto____4704))
{return (n > 0);
} else
{return and__3546__auto____4704;
}
})()))
{{
var G__4709 = (n - 1);
var G__4710 = cljs.core.next.call(null,coll);
n = G__4709;
coll = G__4710;
continue;
}
} else
{return null;
}
break;
}
});
dorun = function(n,coll){
switch(arguments.length){
case  1 :
return dorun__4705.call(this,n);
case  2 :
return dorun__4706.call(this,n,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return dorun;
})()
;
/**
* When lazy sequences are produced via functions that have side
* effects, any effects other than those needed to produce the first
* element in the seq do not occur until the seq is consumed. doall can
* be used to force any effects. Walks through the successive nexts of
* the seq, retains the head and returns it, thus causing the entire
* seq to reside in memory at one time.
*/
cljs.core.doall = (function() {
var doall = null;
var doall__4711 = (function (coll){
cljs.core.dorun.call(null,coll);
return coll;
});
var doall__4712 = (function (n,coll){
cljs.core.dorun.call(null,n,coll);
return coll;
});
doall = function(n,coll){
switch(arguments.length){
case  1 :
return doall__4711.call(this,n);
case  2 :
return doall__4712.call(this,n,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return doall;
})()
;
/**
* Returns the result of (re-find re s) if re fully matches s.
*/
cljs.core.re_matches = (function re_matches(re,s){
var matches__4714 = re.exec(s);

if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.first.call(null,matches__4714),s)))
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,matches__4714),1)))
{return cljs.core.first.call(null,matches__4714);
} else
{return cljs.core.vec.call(null,matches__4714);
}
} else
{return null;
}
});
/**
* Returns the first regex match, if any, of s to re, using
* re.exec(s). Returns a vector, containing first the matching
* substring, then any capturing groups if the regular expression contains
* capturing groups.
*/
cljs.core.re_find = (function re_find(re,s){
var matches__4715 = re.exec(s);

if(cljs.core.truth_((matches__4715 === null)))
{return null;
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,matches__4715),1)))
{return cljs.core.first.call(null,matches__4715);
} else
{return cljs.core.vec.call(null,matches__4715);
}
}
});
/**
* Returns a lazy sequence of successive matches of re in s.
*/
cljs.core.re_seq = (function re_seq(re,s){
var match_data__4716 = cljs.core.re_find.call(null,re,s);
var match_idx__4717 = s.search(re);
var match_str__4718 = (cljs.core.truth_(cljs.core.coll_QMARK_.call(null,match_data__4716))?cljs.core.first.call(null,match_data__4716):match_data__4716);
var post_match__4719 = cljs.core.subs.call(null,s,(match_idx__4717 + cljs.core.count.call(null,match_str__4718)));

if(cljs.core.truth_(match_data__4716))
{return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,match_data__4716,re_seq.call(null,re,post_match__4719));
})));
} else
{return null;
}
});
/**
* Returns an instance of RegExp which has compiled the provided string.
*/
cljs.core.re_pattern = (function re_pattern(s){
var vec__4721__4722 = cljs.core.re_find.call(null,/^(?:\(\?([idmsux]*)\))?(.*)/,s);
var ___4723 = cljs.core.nth.call(null,vec__4721__4722,0,null);
var flags__4724 = cljs.core.nth.call(null,vec__4721__4722,1,null);
var pattern__4725 = cljs.core.nth.call(null,vec__4721__4722,2,null);

return (new RegExp(pattern__4725,flags__4724));
});
cljs.core.pr_sequential = (function pr_sequential(print_one,begin,sep,end,opts,coll){
return cljs.core.concat.call(null,cljs.core.PersistentVector.fromArray([begin]),cljs.core.flatten1.call(null,cljs.core.interpose.call(null,cljs.core.PersistentVector.fromArray([sep]),cljs.core.map.call(null,(function (p1__4720_SHARP_){
return print_one.call(null,p1__4720_SHARP_,opts);
}),coll))),cljs.core.PersistentVector.fromArray([end]));
});
cljs.core.string_print = (function string_print(x){
cljs.core._STAR_print_fn_STAR_.call(null,x);
return null;
});
cljs.core.flush = (function flush(){
return null;
});
cljs.core.pr_seq = (function pr_seq(obj,opts){
if(cljs.core.truth_((obj === null)))
{return cljs.core.list.call(null,"nil");
} else
{if(cljs.core.truth_((void 0 === obj)))
{return cljs.core.list.call(null,"#<undefined>");
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return cljs.core.concat.call(null,(cljs.core.truth_((function (){var and__3546__auto____4726 = cljs.core.get.call(null,opts,"\uFDD0'meta");

if(cljs.core.truth_(and__3546__auto____4726))
{var and__3546__auto____4730 = (function (){var x__353__auto____4727 = obj;

if(cljs.core.truth_((function (){var and__3546__auto____4728 = x__353__auto____4727;

if(cljs.core.truth_(and__3546__auto____4728))
{var and__3546__auto____4729 = x__353__auto____4727.cljs$core$IMeta$;

if(cljs.core.truth_(and__3546__auto____4729))
{return cljs.core.not.call(null,x__353__auto____4727.hasOwnProperty("cljs$core$IMeta$"));
} else
{return and__3546__auto____4729;
}
} else
{return and__3546__auto____4728;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IMeta,x__353__auto____4727);
}
})();

if(cljs.core.truth_(and__3546__auto____4730))
{return cljs.core.meta.call(null,obj);
} else
{return and__3546__auto____4730;
}
} else
{return and__3546__auto____4726;
}
})())?cljs.core.concat.call(null,cljs.core.PersistentVector.fromArray(["^"]),pr_seq.call(null,cljs.core.meta.call(null,obj),opts),cljs.core.PersistentVector.fromArray([" "])):null),(cljs.core.truth_((function (){var x__353__auto____4731 = obj;

if(cljs.core.truth_((function (){var and__3546__auto____4732 = x__353__auto____4731;

if(cljs.core.truth_(and__3546__auto____4732))
{var and__3546__auto____4733 = x__353__auto____4731.cljs$core$IPrintable$;

if(cljs.core.truth_(and__3546__auto____4733))
{return cljs.core.not.call(null,x__353__auto____4731.hasOwnProperty("cljs$core$IPrintable$"));
} else
{return and__3546__auto____4733;
}
} else
{return and__3546__auto____4732;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IPrintable,x__353__auto____4731);
}
})())?cljs.core._pr_seq.call(null,obj,opts):cljs.core.list.call(null,"#<",cljs.core.str.call(null,obj),">")));
} else
{return null;
}
}
}
});
/**
* Prints a sequence of objects to a string, observing all the
* options given in opts
*/
cljs.core.pr_str_with_opts = (function pr_str_with_opts(objs,opts){
var first_obj__4734 = cljs.core.first.call(null,objs);
var sb__4735 = (new goog.string.StringBuffer());

var G__4736__4737 = cljs.core.seq.call(null,objs);

if(cljs.core.truth_(G__4736__4737))
{var obj__4738 = cljs.core.first.call(null,G__4736__4737);
var G__4736__4739 = G__4736__4737;

while(true){
if(cljs.core.truth_((obj__4738 === first_obj__4734)))
{} else
{sb__4735.append(" ");
}
var G__4740__4741 = cljs.core.seq.call(null,cljs.core.pr_seq.call(null,obj__4738,opts));

if(cljs.core.truth_(G__4740__4741))
{var string__4742 = cljs.core.first.call(null,G__4740__4741);
var G__4740__4743 = G__4740__4741;

while(true){
sb__4735.append(string__4742);
var temp__3698__auto____4744 = cljs.core.next.call(null,G__4740__4743);

if(cljs.core.truth_(temp__3698__auto____4744))
{var G__4740__4745 = temp__3698__auto____4744;

{
var G__4748 = cljs.core.first.call(null,G__4740__4745);
var G__4749 = G__4740__4745;
string__4742 = G__4748;
G__4740__4743 = G__4749;
continue;
}
} else
{}
break;
}
} else
{}
var temp__3698__auto____4746 = cljs.core.next.call(null,G__4736__4739);

if(cljs.core.truth_(temp__3698__auto____4746))
{var G__4736__4747 = temp__3698__auto____4746;

{
var G__4750 = cljs.core.first.call(null,G__4736__4747);
var G__4751 = G__4736__4747;
obj__4738 = G__4750;
G__4736__4739 = G__4751;
continue;
}
} else
{}
break;
}
} else
{}
return cljs.core.str.call(null,sb__4735);
});
/**
* Prints a sequence of objects using string-print, observing all
* the options given in opts
*/
cljs.core.pr_with_opts = (function pr_with_opts(objs,opts){
var first_obj__4752 = cljs.core.first.call(null,objs);

var G__4753__4754 = cljs.core.seq.call(null,objs);

if(cljs.core.truth_(G__4753__4754))
{var obj__4755 = cljs.core.first.call(null,G__4753__4754);
var G__4753__4756 = G__4753__4754;

while(true){
if(cljs.core.truth_((obj__4755 === first_obj__4752)))
{} else
{cljs.core.string_print.call(null," ");
}
var G__4757__4758 = cljs.core.seq.call(null,cljs.core.pr_seq.call(null,obj__4755,opts));

if(cljs.core.truth_(G__4757__4758))
{var string__4759 = cljs.core.first.call(null,G__4757__4758);
var G__4757__4760 = G__4757__4758;

while(true){
cljs.core.string_print.call(null,string__4759);
var temp__3698__auto____4761 = cljs.core.next.call(null,G__4757__4760);

if(cljs.core.truth_(temp__3698__auto____4761))
{var G__4757__4762 = temp__3698__auto____4761;

{
var G__4765 = cljs.core.first.call(null,G__4757__4762);
var G__4766 = G__4757__4762;
string__4759 = G__4765;
G__4757__4760 = G__4766;
continue;
}
} else
{}
break;
}
} else
{}
var temp__3698__auto____4763 = cljs.core.next.call(null,G__4753__4756);

if(cljs.core.truth_(temp__3698__auto____4763))
{var G__4753__4764 = temp__3698__auto____4763;

{
var G__4767 = cljs.core.first.call(null,G__4753__4764);
var G__4768 = G__4753__4764;
obj__4755 = G__4767;
G__4753__4756 = G__4768;
continue;
}
} else
{return null;
}
break;
}
} else
{return null;
}
});
cljs.core.newline = (function newline(opts){
cljs.core.string_print.call(null,"\n");
if(cljs.core.truth_(cljs.core.get.call(null,opts,"\uFDD0'flush-on-newline")))
{return cljs.core.flush.call(null);
} else
{return null;
}
});
cljs.core._STAR_flush_on_newline_STAR_ = true;
cljs.core._STAR_print_readably_STAR_ = true;
cljs.core._STAR_print_meta_STAR_ = false;
cljs.core._STAR_print_dup_STAR_ = false;
cljs.core.pr_opts = (function pr_opts(){
return cljs.core.ObjMap.fromObject(["\uFDD0'flush-on-newline","\uFDD0'readably","\uFDD0'meta","\uFDD0'dup"],{"\uFDD0'flush-on-newline":cljs.core._STAR_flush_on_newline_STAR_,"\uFDD0'readably":cljs.core._STAR_print_readably_STAR_,"\uFDD0'meta":cljs.core._STAR_print_meta_STAR_,"\uFDD0'dup":cljs.core._STAR_print_dup_STAR_});
});
/**
* pr to a string, returning it. Fundamental entrypoint to IPrintable.
* @param {...*} var_args
*/
cljs.core.pr_str = (function() { 
var pr_str__delegate = function (objs){
return cljs.core.pr_str_with_opts.call(null,objs,cljs.core.pr_opts.call(null));
};
var pr_str = function (var_args){
var objs = null;
if (goog.isDef(var_args)) {
  objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return pr_str__delegate.call(this, objs);
};
pr_str.cljs$lang$maxFixedArity = 0;
pr_str.cljs$lang$applyTo = (function (arglist__4769){
var objs = cljs.core.seq( arglist__4769 );;
return pr_str__delegate.call(this, objs);
});
return pr_str;
})()
;
/**
* Prints the object(s) using string-print.  Prints the
* object(s), separated by spaces if there is more than one.
* By default, pr and prn print in a way that objects can be
* read by the reader
* @param {...*} var_args
*/
cljs.core.pr = (function() { 
var pr__delegate = function (objs){
return cljs.core.pr_with_opts.call(null,objs,cljs.core.pr_opts.call(null));
};
var pr = function (var_args){
var objs = null;
if (goog.isDef(var_args)) {
  objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return pr__delegate.call(this, objs);
};
pr.cljs$lang$maxFixedArity = 0;
pr.cljs$lang$applyTo = (function (arglist__4770){
var objs = cljs.core.seq( arglist__4770 );;
return pr__delegate.call(this, objs);
});
return pr;
})()
;
/**
* Prints the object(s) using string-print.
* print and println produce output for human consumption.
* @param {...*} var_args
*/
cljs.core.print = (function() { 
var cljs_core_print__delegate = function (objs){
return cljs.core.pr_with_opts.call(null,objs,cljs.core.assoc.call(null,cljs.core.pr_opts.call(null),"\uFDD0'readably",false));
};
var cljs_core_print = function (var_args){
var objs = null;
if (goog.isDef(var_args)) {
  objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return cljs_core_print__delegate.call(this, objs);
};
cljs_core_print.cljs$lang$maxFixedArity = 0;
cljs_core_print.cljs$lang$applyTo = (function (arglist__4771){
var objs = cljs.core.seq( arglist__4771 );;
return cljs_core_print__delegate.call(this, objs);
});
return cljs_core_print;
})()
;
/**
* Same as print followed by (newline)
* @param {...*} var_args
*/
cljs.core.println = (function() { 
var println__delegate = function (objs){
cljs.core.pr_with_opts.call(null,objs,cljs.core.assoc.call(null,cljs.core.pr_opts.call(null),"\uFDD0'readably",false));
return cljs.core.newline.call(null,cljs.core.pr_opts.call(null));
};
var println = function (var_args){
var objs = null;
if (goog.isDef(var_args)) {
  objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return println__delegate.call(this, objs);
};
println.cljs$lang$maxFixedArity = 0;
println.cljs$lang$applyTo = (function (arglist__4772){
var objs = cljs.core.seq( arglist__4772 );;
return println__delegate.call(this, objs);
});
return println;
})()
;
/**
* Same as pr followed by (newline).
* @param {...*} var_args
*/
cljs.core.prn = (function() { 
var prn__delegate = function (objs){
cljs.core.pr_with_opts.call(null,objs,cljs.core.pr_opts.call(null));
return cljs.core.newline.call(null,cljs.core.pr_opts.call(null));
};
var prn = function (var_args){
var objs = null;
if (goog.isDef(var_args)) {
  objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return prn__delegate.call(this, objs);
};
prn.cljs$lang$maxFixedArity = 0;
prn.cljs$lang$applyTo = (function (arglist__4773){
var objs = cljs.core.seq( arglist__4773 );;
return prn__delegate.call(this, objs);
});
return prn;
})()
;
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
var pr_pair__4774 = (function (keyval){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,""," ","",opts,keyval);
});

return cljs.core.pr_sequential.call(null,pr_pair__4774,"{",", ","}",opts,coll);
});
(cljs.core.IPrintable["number"] = true);
(cljs.core._pr_seq["number"] = (function (n,opts){
return cljs.core.list.call(null,cljs.core.str.call(null,n));
}));
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"("," ",")",opts,coll);
});
cljs.core.Subvec.prototype.cljs$core$IPrintable$ = true;
cljs.core.Subvec.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"["," ","]",opts,coll);
});
cljs.core.LazySeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.LazySeq.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"("," ",")",opts,coll);
});
(cljs.core.IPrintable["boolean"] = true);
(cljs.core._pr_seq["boolean"] = (function (bool,opts){
return cljs.core.list.call(null,cljs.core.str.call(null,bool));
}));
cljs.core.Set.prototype.cljs$core$IPrintable$ = true;
cljs.core.Set.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"#{"," ","}",opts,coll);
});
(cljs.core.IPrintable["string"] = true);
(cljs.core._pr_seq["string"] = (function (obj,opts){
if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null,obj)))
{return cljs.core.list.call(null,cljs.core.str.call(null,":",(function (){var temp__3698__auto____4775 = cljs.core.namespace.call(null,obj);

if(cljs.core.truth_(temp__3698__auto____4775))
{var nspc__4776 = temp__3698__auto____4775;

return cljs.core.str.call(null,nspc__4776,"\/");
} else
{return null;
}
})(),cljs.core.name.call(null,obj)));
} else
{if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null,obj)))
{return cljs.core.list.call(null,cljs.core.str.call(null,(function (){var temp__3698__auto____4777 = cljs.core.namespace.call(null,obj);

if(cljs.core.truth_(temp__3698__auto____4777))
{var nspc__4778 = temp__3698__auto____4777;

return cljs.core.str.call(null,nspc__4778,"\/");
} else
{return null;
}
})(),cljs.core.name.call(null,obj)));
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return cljs.core.list.call(null,(cljs.core.truth_("\uFDD0'readably".call(null,opts))?goog.string.quote.call(null,obj):obj));
} else
{return null;
}
}
}
}));
cljs.core.Vector.prototype.cljs$core$IPrintable$ = true;
cljs.core.Vector.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"["," ","]",opts,coll);
});
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"["," ","]",opts,coll);
});
cljs.core.List.prototype.cljs$core$IPrintable$ = true;
cljs.core.List.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"("," ",")",opts,coll);
});
(cljs.core.IPrintable["array"] = true);
(cljs.core._pr_seq["array"] = (function (a,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"#<Array [",", ","]>",opts,a);
}));
cljs.core.PersistentQueueSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"("," ",")",opts,coll);
});
(cljs.core.IPrintable["function"] = true);
(cljs.core._pr_seq["function"] = (function (this$){
return cljs.core.list.call(null,"#<",cljs.core.str.call(null,this$),">");
}));
cljs.core.EmptyList.prototype.cljs$core$IPrintable$ = true;
cljs.core.EmptyList.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.list.call(null,"()");
});
cljs.core.Cons.prototype.cljs$core$IPrintable$ = true;
cljs.core.Cons.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"("," ",")",opts,coll);
});
cljs.core.Range.prototype.cljs$core$IPrintable$ = true;
cljs.core.Range.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,"("," ",")",opts,coll);
});
cljs.core.ObjMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.ObjMap.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
var pr_pair__4779 = (function (keyval){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,""," ","",opts,keyval);
});

return cljs.core.pr_sequential.call(null,pr_pair__4779,"{",", ","}",opts,coll);
});

/**
* @constructor
*/
cljs.core.Atom = (function (state,meta,validator,watches){
this.state = state;
this.meta = meta;
this.validator = validator;
this.watches = watches;
})
cljs.core.Atom.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Atom");
});
cljs.core.Atom.prototype.cljs$core$IHash$ = true;
cljs.core.Atom.prototype.cljs$core$IHash$_hash = (function (this$){
var this__4780 = this;
return goog.getUid.call(null,this$);
});
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = (function (this$,oldval,newval){
var this__4781 = this;
var G__4782__4783 = cljs.core.seq.call(null,this__4781.watches);

if(cljs.core.truth_(G__4782__4783))
{var G__4785__4787 = cljs.core.first.call(null,G__4782__4783);
var vec__4786__4788 = G__4785__4787;
var key__4789 = cljs.core.nth.call(null,vec__4786__4788,0,null);
var f__4790 = cljs.core.nth.call(null,vec__4786__4788,1,null);
var G__4782__4791 = G__4782__4783;

var G__4785__4792 = G__4785__4787;
var G__4782__4793 = G__4782__4791;

while(true){
var vec__4794__4795 = G__4785__4792;
var key__4796 = cljs.core.nth.call(null,vec__4794__4795,0,null);
var f__4797 = cljs.core.nth.call(null,vec__4794__4795,1,null);
var G__4782__4798 = G__4782__4793;

f__4797.call(null,key__4796,this$,oldval,newval);
var temp__3698__auto____4799 = cljs.core.next.call(null,G__4782__4798);

if(cljs.core.truth_(temp__3698__auto____4799))
{var G__4782__4800 = temp__3698__auto____4799;

{
var G__4807 = cljs.core.first.call(null,G__4782__4800);
var G__4808 = G__4782__4800;
G__4785__4792 = G__4807;
G__4782__4793 = G__4808;
continue;
}
} else
{return null;
}
break;
}
} else
{return null;
}
});
cljs.core.Atom.prototype.cljs$core$IWatchable$_add_watch = (function (this$,key,f){
var this__4801 = this;
return this$.watches = cljs.core.assoc.call(null,this__4801.watches,key,f);
});
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = (function (this$,key){
var this__4802 = this;
return this$.watches = cljs.core.dissoc.call(null,this__4802.watches,key);
});
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = (function (a,opts){
var this__4803 = this;
return cljs.core.concat.call(null,cljs.core.PersistentVector.fromArray(["#<Atom: "]),cljs.core._pr_seq.call(null,this__4803.state,opts),">");
});
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = (function (_){
var this__4804 = this;
return this__4804.meta;
});
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = (function (_){
var this__4805 = this;
return this__4805.state;
});
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = (function (o,other){
var this__4806 = this;
return (o === other);
});
cljs.core.Atom;
/**
* Creates and returns an Atom with an initial value of x and zero or
* more options (in any order):
* 
* :meta metadata-map
* 
* :validator validate-fn
* 
* If metadata-map is supplied, it will be come the metadata on the
* atom. validate-fn must be nil or a side-effect-free fn of one
* argument, which will be passed the intended new state on any state
* change. If the new state is unacceptable, the validate-fn should
* return false or throw an Error.  If either of these error conditions
* occur, then the value of the atom will not change.
* @param {...*} var_args
*/
cljs.core.atom = (function() {
var atom = null;
var atom__4815 = (function (x){
return (new cljs.core.Atom(x,null,null,null));
});
var atom__4816 = (function() { 
var G__4818__delegate = function (x,p__4809){
var map__4810__4811 = p__4809;
var map__4810__4812 = (cljs.core.truth_(cljs.core.seq_QMARK_.call(null,map__4810__4811))?cljs.core.apply.call(null,cljs.core.hash_map,map__4810__4811):map__4810__4811);
var validator__4813 = cljs.core.get.call(null,map__4810__4812,"\uFDD0'validator");
var meta__4814 = cljs.core.get.call(null,map__4810__4812,"\uFDD0'meta");

return (new cljs.core.Atom(x,meta__4814,validator__4813,null));
};
var G__4818 = function (x,var_args){
var p__4809 = null;
if (goog.isDef(var_args)) {
  p__4809 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__4818__delegate.call(this, x, p__4809);
};
G__4818.cljs$lang$maxFixedArity = 1;
G__4818.cljs$lang$applyTo = (function (arglist__4819){
var x = cljs.core.first(arglist__4819);
var p__4809 = cljs.core.rest(arglist__4819);
return G__4818__delegate.call(this, x, p__4809);
});
return G__4818;
})()
;
atom = function(x,var_args){
var p__4809 = var_args;
switch(arguments.length){
case  1 :
return atom__4815.call(this,x);
default:
return atom__4816.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
atom.cljs$lang$maxFixedArity = 1;
atom.cljs$lang$applyTo = atom__4816.cljs$lang$applyTo;
return atom;
})()
;
/**
* Sets the value of atom to newval without regard for the
* current value. Returns newval.
*/
cljs.core.reset_BANG_ = (function reset_BANG_(a,new_value){
var temp__3698__auto____4820 = a.validator;

if(cljs.core.truth_(temp__3698__auto____4820))
{var validate__4821 = temp__3698__auto____4820;

if(cljs.core.truth_(validate__4821.call(null,new_value)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ","Validator rejected reference state","\n",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("\uFDD1'validate","\uFDD1'new-value"),cljs.core.hash_map("\uFDD0'line",3257))))));
}
} else
{}
var old_value__4822 = a.state;

a.state = new_value;
cljs.core._notify_watches.call(null,a,old_value__4822,new_value);
return new_value;
});
/**
* Atomically swaps the value of atom to be:
* (apply f current-value-of-atom args). Note that f may be called
* multiple times, and thus should be free of side effects.  Returns
* the value that was swapped in.
* @param {...*} var_args
*/
cljs.core.swap_BANG_ = (function() {
var swap_BANG_ = null;
var swap_BANG___4823 = (function (a,f){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state));
});
var swap_BANG___4824 = (function (a,f,x){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state,x));
});
var swap_BANG___4825 = (function (a,f,x,y){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state,x,y));
});
var swap_BANG___4826 = (function (a,f,x,y,z){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state,x,y,z));
});
var swap_BANG___4827 = (function() { 
var G__4829__delegate = function (a,f,x,y,z,more){
return cljs.core.reset_BANG_.call(null,a,cljs.core.apply.call(null,f,a.state,x,y,z,more));
};
var G__4829 = function (a,f,x,y,z,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5),0);
} 
return G__4829__delegate.call(this, a, f, x, y, z, more);
};
G__4829.cljs$lang$maxFixedArity = 5;
G__4829.cljs$lang$applyTo = (function (arglist__4830){
var a = cljs.core.first(arglist__4830);
var f = cljs.core.first(cljs.core.next(arglist__4830));
var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4830)));
var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4830))));
var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4830)))));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4830)))));
return G__4829__delegate.call(this, a, f, x, y, z, more);
});
return G__4829;
})()
;
swap_BANG_ = function(a,f,x,y,z,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return swap_BANG___4823.call(this,a,f);
case  3 :
return swap_BANG___4824.call(this,a,f,x);
case  4 :
return swap_BANG___4825.call(this,a,f,x,y);
case  5 :
return swap_BANG___4826.call(this,a,f,x,y,z);
default:
return swap_BANG___4827.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
swap_BANG_.cljs$lang$maxFixedArity = 5;
swap_BANG_.cljs$lang$applyTo = swap_BANG___4827.cljs$lang$applyTo;
return swap_BANG_;
})()
;
/**
* Atomically sets the value of atom to newval if and only if the
* current value of the atom is identical to oldval. Returns true if
* set happened, else false.
*/
cljs.core.compare_and_set_BANG_ = (function compare_and_set_BANG_(a,oldval,newval){
if(cljs.core.truth_(cljs.core._EQ_.call(null,a.state,oldval)))
{cljs.core.reset_BANG_.call(null,a,newval);
return true;
} else
{return false;
}
});
cljs.core.deref = (function deref(o){
return cljs.core._deref.call(null,o);
});
/**
* Sets the validator-fn for an atom. validator-fn must be nil or a
* side-effect-free fn of one argument, which will be passed the intended
* new state on any state change. If the new state is unacceptable, the
* validator-fn should return false or throw an Error. If the current state
* is not acceptable to the new validator, an Error will be thrown and the
* validator will not be changed.
*/
cljs.core.set_validator_BANG_ = (function set_validator_BANG_(iref,val){
return iref.validator = val;
});
/**
* Gets the validator-fn for a var/ref/agent/atom.
*/
cljs.core.get_validator = (function get_validator(iref){
return iref.validator;
});
/**
* Atomically sets the metadata for a namespace/var/ref/agent/atom to be:
* 
* (apply f its-current-meta args)
* 
* f must be free of side-effects
* @param {...*} var_args
*/
cljs.core.alter_meta_BANG_ = (function() { 
var alter_meta_BANG___delegate = function (iref,f,args){
return iref.meta = cljs.core.apply.call(null,f,iref.meta,args);
};
var alter_meta_BANG_ = function (iref,f,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return alter_meta_BANG___delegate.call(this, iref, f, args);
};
alter_meta_BANG_.cljs$lang$maxFixedArity = 2;
alter_meta_BANG_.cljs$lang$applyTo = (function (arglist__4831){
var iref = cljs.core.first(arglist__4831);
var f = cljs.core.first(cljs.core.next(arglist__4831));
var args = cljs.core.rest(cljs.core.next(arglist__4831));
return alter_meta_BANG___delegate.call(this, iref, f, args);
});
return alter_meta_BANG_;
})()
;
/**
* Atomically resets the metadata for an atom
*/
cljs.core.reset_meta_BANG_ = (function reset_meta_BANG_(iref,m){
return iref.meta = m;
});
/**
* Alpha - subject to change.
* 
* Adds a watch function to an atom reference. The watch fn must be a
* fn of 4 args: a key, the reference, its old-state, its
* new-state. Whenever the reference's state might have been changed,
* any registered watches will have their functions called. The watch
* fn will be called synchronously. Note that an atom's state
* may have changed again prior to the fn call, so use old/new-state
* rather than derefing the reference. Keys must be unique per
* reference, and can be used to remove the watch with remove-watch,
* but are otherwise considered opaque by the watch mechanism.  Bear in
* mind that regardless of the result or action of the watch fns the
* atom's value will change.  Example:
* 
* (def a (atom 0))
* (add-watch a :inc (fn [k r o n] (assert (== 0 n))))
* (swap! a inc)
* ;; Assertion Error
* (deref a)
* ;=> 1
*/
cljs.core.add_watch = (function add_watch(iref,key,f){
return cljs.core._add_watch.call(null,iref,key,f);
});
/**
* Alpha - subject to change.
* 
* Removes a watch (set by add-watch) from a reference
*/
cljs.core.remove_watch = (function remove_watch(iref,key){
return cljs.core._remove_watch.call(null,iref,key);
});
cljs.core.gensym_counter = null;
/**
* Returns a new symbol with a unique name. If a prefix string is
* supplied, the name is prefix# where # is some unique number. If
* prefix is not supplied, the prefix is 'G__'.
*/
cljs.core.gensym = (function() {
var gensym = null;
var gensym__4832 = (function (){
return gensym.call(null,"G__");
});
var gensym__4833 = (function (prefix_string){
if(cljs.core.truth_((cljs.core.gensym_counter === null)))
{cljs.core.gensym_counter = cljs.core.atom.call(null,0);
} else
{}
return cljs.core.symbol.call(null,cljs.core.str.call(null,prefix_string,cljs.core.swap_BANG_.call(null,cljs.core.gensym_counter,cljs.core.inc)));
});
gensym = function(prefix_string){
switch(arguments.length){
case  0 :
return gensym__4832.call(this);
case  1 :
return gensym__4833.call(this,prefix_string);
}
throw('Invalid arity: ' + arguments.length);
};
return gensym;
})()
;
cljs.core.fixture1 = 1;
cljs.core.fixture2 = 2;

/**
* @constructor
*/
cljs.core.Delay = (function (f,state){
this.f = f;
this.state = state;
})
cljs.core.Delay.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.Delay");
});
cljs.core.Delay.prototype.cljs$core$IPending$ = true;
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_ = (function (d){
var this__4835 = this;
return cljs.core.not.call(null,(cljs.core.deref.call(null,this__4835.state) === null));
});
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = (function (_){
var this__4836 = this;
if(cljs.core.truth_(cljs.core.deref.call(null,this__4836.state)))
{} else
{cljs.core.swap_BANG_.call(null,this__4836.state,this__4836.f);
}
return cljs.core.deref.call(null,this__4836.state);
});
cljs.core.Delay;
/**
* Takes a body of expressions and yields a Delay object that will
* invoke the body only the first time it is forced (with force or deref/@), and
* will cache the result and return it on all subsequent force
* calls.
* @param {...*} var_args
*/
cljs.core.delay = (function() { 
var delay__delegate = function (body){
return (new cljs.core.Delay((function (){
return cljs.core.apply.call(null,cljs.core.identity,body);
}),cljs.core.atom.call(null,null)));
};
var delay = function (var_args){
var body = null;
if (goog.isDef(var_args)) {
  body = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return delay__delegate.call(this, body);
};
delay.cljs$lang$maxFixedArity = 0;
delay.cljs$lang$applyTo = (function (arglist__4837){
var body = cljs.core.seq( arglist__4837 );;
return delay__delegate.call(this, body);
});
return delay;
})()
;
/**
* returns true if x is a Delay created with delay
*/
cljs.core.delay_QMARK_ = (function delay_QMARK_(x){
return cljs.core.instance_QMARK_.call(null,cljs.core.Delay,x);
});
/**
* If x is a Delay, returns the (possibly cached) value of its expression, else returns x
*/
cljs.core.force = (function force(x){
if(cljs.core.truth_(cljs.core.delay_QMARK_.call(null,x)))
{return cljs.core.deref.call(null,x);
} else
{return x;
}
});
/**
* Returns true if a value has been produced for a promise, delay, future or lazy sequence.
*/
cljs.core.realized_QMARK_ = (function realized_QMARK_(d){
return cljs.core._realized_QMARK_.call(null,d);
});
/**
* Recursively transforms JavaScript arrays into ClojureScript
* vectors, and JavaScript objects into ClojureScript maps.  With
* option ':keywordize-keys true' will convert object fields from
* strings to keywords.
* @param {...*} var_args
*/
cljs.core.js__GT_clj = (function() { 
var js__GT_clj__delegate = function (x,options){
var map__4838__4839 = options;
var map__4838__4840 = (cljs.core.truth_(cljs.core.seq_QMARK_.call(null,map__4838__4839))?cljs.core.apply.call(null,cljs.core.hash_map,map__4838__4839):map__4838__4839);
var keywordize_keys__4841 = cljs.core.get.call(null,map__4838__4840,"\uFDD0'keywordize-keys");
var keyfn__4842 = (cljs.core.truth_(keywordize_keys__4841)?cljs.core.keyword:cljs.core.str);
var f__4848 = (function thisfn(x){
if(cljs.core.truth_(cljs.core.seq_QMARK_.call(null,x)))
{return cljs.core.doall.call(null,cljs.core.map.call(null,thisfn,x));
} else
{if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null,x)))
{return cljs.core.into.call(null,cljs.core.empty.call(null,x),cljs.core.map.call(null,thisfn,x));
} else
{if(cljs.core.truth_(goog.isArray.call(null,x)))
{return cljs.core.vec.call(null,cljs.core.map.call(null,thisfn,x));
} else
{if(cljs.core.truth_(goog.isObject.call(null,x)))
{return cljs.core.into.call(null,cljs.core.ObjMap.fromObject([],{}),(function (){var iter__417__auto____4847 = (function iter__4843(s__4844){
return (new cljs.core.LazySeq(null,false,(function (){
var s__4844__4845 = s__4844;

while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,s__4844__4845)))
{var k__4846 = cljs.core.first.call(null,s__4844__4845);

return cljs.core.cons.call(null,cljs.core.PersistentVector.fromArray([keyfn__4842.call(null,k__4846),thisfn.call(null,(x[k__4846]))]),iter__4843.call(null,cljs.core.rest.call(null,s__4844__4845)));
} else
{return null;
}
break;
}
})));
});

return iter__417__auto____4847.call(null,cljs.core.js_keys.call(null,x));
})());
} else
{if(cljs.core.truth_("\uFDD0'else"))
{return x;
} else
{return null;
}
}
}
}
}
});

return f__4848.call(null,x);
};
var js__GT_clj = function (x,var_args){
var options = null;
if (goog.isDef(var_args)) {
  options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return js__GT_clj__delegate.call(this, x, options);
};
js__GT_clj.cljs$lang$maxFixedArity = 1;
js__GT_clj.cljs$lang$applyTo = (function (arglist__4849){
var x = cljs.core.first(arglist__4849);
var options = cljs.core.rest(arglist__4849);
return js__GT_clj__delegate.call(this, x, options);
});
return js__GT_clj;
})()
;
/**
* Returns a memoized version of a referentially transparent function. The
* memoized version of the function keeps a cache of the mapping from arguments
* to results and, when calls with the same arguments are repeated often, has
* higher performance at the expense of higher memory use.
*/
cljs.core.memoize = (function memoize(f){
var mem__4850 = cljs.core.atom.call(null,cljs.core.ObjMap.fromObject([],{}));

return (function() { 
var G__4854__delegate = function (args){
var temp__3695__auto____4851 = cljs.core.get.call(null,cljs.core.deref.call(null,mem__4850),args);

if(cljs.core.truth_(temp__3695__auto____4851))
{var v__4852 = temp__3695__auto____4851;

return v__4852;
} else
{var ret__4853 = cljs.core.apply.call(null,f,args);

cljs.core.swap_BANG_.call(null,mem__4850,cljs.core.assoc,args,ret__4853);
return ret__4853;
}
};
var G__4854 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4854__delegate.call(this, args);
};
G__4854.cljs$lang$maxFixedArity = 0;
G__4854.cljs$lang$applyTo = (function (arglist__4855){
var args = cljs.core.seq( arglist__4855 );;
return G__4854__delegate.call(this, args);
});
return G__4854;
})()
;
});
/**
* trampoline can be used to convert algorithms requiring mutual
* recursion without stack consumption. Calls f with supplied args, if
* any. If f returns a fn, calls that fn with no arguments, and
* continues to repeat, until the return value is not a fn, then
* returns that non-fn value. Note that if you want to return a fn as a
* final value, you must wrap it in some data structure and unpack it
* after trampoline returns.
* @param {...*} var_args
*/
cljs.core.trampoline = (function() {
var trampoline = null;
var trampoline__4857 = (function (f){
while(true){
var ret__4856 = f.call(null);

if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null,ret__4856)))
{{
var G__4860 = ret__4856;
f = G__4860;
continue;
}
} else
{return ret__4856;
}
break;
}
});
var trampoline__4858 = (function() { 
var G__4861__delegate = function (f,args){
return trampoline.call(null,(function (){
return cljs.core.apply.call(null,f,args);
}));
};
var G__4861 = function (f,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__4861__delegate.call(this, f, args);
};
G__4861.cljs$lang$maxFixedArity = 1;
G__4861.cljs$lang$applyTo = (function (arglist__4862){
var f = cljs.core.first(arglist__4862);
var args = cljs.core.rest(arglist__4862);
return G__4861__delegate.call(this, f, args);
});
return G__4861;
})()
;
trampoline = function(f,var_args){
var args = var_args;
switch(arguments.length){
case  1 :
return trampoline__4857.call(this,f);
default:
return trampoline__4858.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
trampoline.cljs$lang$maxFixedArity = 1;
trampoline.cljs$lang$applyTo = trampoline__4858.cljs$lang$applyTo;
return trampoline;
})()
;
/**
* Returns a random floating point number between 0 (inclusive) and
* n (default 1) (exclusive).
*/
cljs.core.rand = (function() {
var rand = null;
var rand__4863 = (function (){
return rand.call(null,1);
});
var rand__4864 = (function (n){
return Math.random() * n;
});
rand = function(n){
switch(arguments.length){
case  0 :
return rand__4863.call(this);
case  1 :
return rand__4864.call(this,n);
}
throw('Invalid arity: ' + arguments.length);
};
return rand;
})()
;
/**
* Returns a random integer between 0 (inclusive) and n (exclusive).
*/
cljs.core.rand_int = (function rand_int(n){
return Math.floor(Math.random() * n);
});
/**
* Return a random element of the (sequential) collection. Will have
* the same performance characteristics as nth for the given
* collection.
*/
cljs.core.rand_nth = (function rand_nth(coll){
return cljs.core.nth.call(null,coll,cljs.core.rand_int.call(null,cljs.core.count.call(null,coll)));
});
/**
* Returns a map of the elements of coll keyed by the result of
* f on each element. The value at each key will be a vector of the
* corresponding elements, in the order they appeared in coll.
*/
cljs.core.group_by = (function group_by(f,coll){
return cljs.core.reduce.call(null,(function (ret,x){
var k__4866 = f.call(null,x);

return cljs.core.assoc.call(null,ret,k__4866,cljs.core.conj.call(null,cljs.core.get.call(null,ret,k__4866,cljs.core.PersistentVector.fromArray([])),x));
}),cljs.core.ObjMap.fromObject([],{}),coll);
});
/**
* Creates a hierarchy object for use with derive, isa? etc.
*/
cljs.core.make_hierarchy = (function make_hierarchy(){
return cljs.core.ObjMap.fromObject(["\uFDD0'parents","\uFDD0'descendants","\uFDD0'ancestors"],{"\uFDD0'parents":cljs.core.ObjMap.fromObject([],{}),"\uFDD0'descendants":cljs.core.ObjMap.fromObject([],{}),"\uFDD0'ancestors":cljs.core.ObjMap.fromObject([],{})});
});
cljs.core.global_hierarchy = cljs.core.atom.call(null,cljs.core.make_hierarchy.call(null));
/**
* Returns true if (= child parent), or child is directly or indirectly derived from
* parent, either via a Java type inheritance relationship or a
* relationship established via derive. h must be a hierarchy obtained
* from make-hierarchy, if not supplied defaults to the global
* hierarchy
*/
cljs.core.isa_QMARK_ = (function() {
var isa_QMARK_ = null;
var isa_QMARK___4875 = (function (child,parent){
return isa_QMARK_.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),child,parent);
});
var isa_QMARK___4876 = (function (h,child,parent){
var or__3548__auto____4867 = cljs.core._EQ_.call(null,child,parent);

if(cljs.core.truth_(or__3548__auto____4867))
{return or__3548__auto____4867;
} else
{var or__3548__auto____4868 = cljs.core.contains_QMARK_.call(null,"\uFDD0'ancestors".call(null,h).call(null,child),parent);

if(cljs.core.truth_(or__3548__auto____4868))
{return or__3548__auto____4868;
} else
{var and__3546__auto____4869 = cljs.core.vector_QMARK_.call(null,parent);

if(cljs.core.truth_(and__3546__auto____4869))
{var and__3546__auto____4870 = cljs.core.vector_QMARK_.call(null,child);

if(cljs.core.truth_(and__3546__auto____4870))
{var and__3546__auto____4871 = cljs.core._EQ_.call(null,cljs.core.count.call(null,parent),cljs.core.count.call(null,child));

if(cljs.core.truth_(and__3546__auto____4871))
{var ret__4872 = true;
var i__4873 = 0;

while(true){
if(cljs.core.truth_((function (){var or__3548__auto____4874 = cljs.core.not.call(null,ret__4872);

if(cljs.core.truth_(or__3548__auto____4874))
{return or__3548__auto____4874;
} else
{return cljs.core._EQ_.call(null,i__4873,cljs.core.count.call(null,parent));
}
})()))
{return ret__4872;
} else
{{
var G__4878 = isa_QMARK_.call(null,h,child.call(null,i__4873),parent.call(null,i__4873));
var G__4879 = (i__4873 + 1);
ret__4872 = G__4878;
i__4873 = G__4879;
continue;
}
}
break;
}
} else
{return and__3546__auto____4871;
}
} else
{return and__3546__auto____4870;
}
} else
{return and__3546__auto____4869;
}
}
}
});
isa_QMARK_ = function(h,child,parent){
switch(arguments.length){
case  2 :
return isa_QMARK___4875.call(this,h,child);
case  3 :
return isa_QMARK___4876.call(this,h,child,parent);
}
throw('Invalid arity: ' + arguments.length);
};
return isa_QMARK_;
})()
;
/**
* Returns the immediate parents of tag, either via a Java type
* inheritance relationship or a relationship established via derive. h
* must be a hierarchy obtained from make-hierarchy, if not supplied
* defaults to the global hierarchy
*/
cljs.core.parents = (function() {
var parents = null;
var parents__4880 = (function (tag){
return parents.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),tag);
});
var parents__4881 = (function (h,tag){
return cljs.core.not_empty.call(null,cljs.core.get.call(null,"\uFDD0'parents".call(null,h),tag));
});
parents = function(h,tag){
switch(arguments.length){
case  1 :
return parents__4880.call(this,h);
case  2 :
return parents__4881.call(this,h,tag);
}
throw('Invalid arity: ' + arguments.length);
};
return parents;
})()
;
/**
* Returns the immediate and indirect parents of tag, either via a Java type
* inheritance relationship or a relationship established via derive. h
* must be a hierarchy obtained from make-hierarchy, if not supplied
* defaults to the global hierarchy
*/
cljs.core.ancestors = (function() {
var ancestors = null;
var ancestors__4883 = (function (tag){
return ancestors.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),tag);
});
var ancestors__4884 = (function (h,tag){
return cljs.core.not_empty.call(null,cljs.core.get.call(null,"\uFDD0'ancestors".call(null,h),tag));
});
ancestors = function(h,tag){
switch(arguments.length){
case  1 :
return ancestors__4883.call(this,h);
case  2 :
return ancestors__4884.call(this,h,tag);
}
throw('Invalid arity: ' + arguments.length);
};
return ancestors;
})()
;
/**
* Returns the immediate and indirect children of tag, through a
* relationship established via derive. h must be a hierarchy obtained
* from make-hierarchy, if not supplied defaults to the global
* hierarchy. Note: does not work on Java type inheritance
* relationships.
*/
cljs.core.descendants = (function() {
var descendants = null;
var descendants__4886 = (function (tag){
return descendants.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),tag);
});
var descendants__4887 = (function (h,tag){
return cljs.core.not_empty.call(null,cljs.core.get.call(null,"\uFDD0'descendants".call(null,h),tag));
});
descendants = function(h,tag){
switch(arguments.length){
case  1 :
return descendants__4886.call(this,h);
case  2 :
return descendants__4887.call(this,h,tag);
}
throw('Invalid arity: ' + arguments.length);
};
return descendants;
})()
;
/**
* Establishes a parent/child relationship between parent and
* tag. Parent must be a namespace-qualified symbol or keyword and
* child can be either a namespace-qualified symbol or keyword or a
* class. h must be a hierarchy obtained from make-hierarchy, if not
* supplied defaults to, and modifies, the global hierarchy.
*/
cljs.core.derive = (function() {
var derive = null;
var derive__4897 = (function (tag,parent){
if(cljs.core.truth_(cljs.core.namespace.call(null,parent)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("\uFDD1'namespace","\uFDD1'parent"),cljs.core.hash_map("\uFDD0'line",3549))))));
}
cljs.core.swap_BANG_.call(null,cljs.core.global_hierarchy,derive,tag,parent);
return null;
});
var derive__4898 = (function (h,tag,parent){
if(cljs.core.truth_(cljs.core.not_EQ_.call(null,tag,parent)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("\uFDD1'not=","\uFDD1'tag","\uFDD1'parent"),cljs.core.hash_map("\uFDD0'line",3553))))));
}
var tp__4892 = "\uFDD0'parents".call(null,h);
var td__4893 = "\uFDD0'descendants".call(null,h);
var ta__4894 = "\uFDD0'ancestors".call(null,h);
var tf__4895 = (function (m,source,sources,target,targets){
return cljs.core.reduce.call(null,(function (ret,k){
return cljs.core.assoc.call(null,ret,k,cljs.core.reduce.call(null,cljs.core.conj,cljs.core.get.call(null,targets,k,cljs.core.set([])),cljs.core.cons.call(null,target,targets.call(null,target))));
}),m,cljs.core.cons.call(null,source,sources.call(null,source)));
});

var or__3548__auto____4896 = (cljs.core.truth_(cljs.core.contains_QMARK_.call(null,tp__4892.call(null,tag),parent))?null:(function (){if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,ta__4894.call(null,tag),parent)))
{throw (new Error(cljs.core.str.call(null,tag,"already has",parent,"as ancestor")));
} else
{}
if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,ta__4894.call(null,parent),tag)))
{throw (new Error(cljs.core.str.call(null,"Cyclic derivation:",parent,"has",tag,"as ancestor")));
} else
{}
return cljs.core.ObjMap.fromObject(["\uFDD0'parents","\uFDD0'ancestors","\uFDD0'descendants"],{"\uFDD0'parents":cljs.core.assoc.call(null,"\uFDD0'parents".call(null,h),tag,cljs.core.conj.call(null,cljs.core.get.call(null,tp__4892,tag,cljs.core.set([])),parent)),"\uFDD0'ancestors":tf__4895.call(null,"\uFDD0'ancestors".call(null,h),tag,td__4893,parent,ta__4894),"\uFDD0'descendants":tf__4895.call(null,"\uFDD0'descendants".call(null,h),parent,ta__4894,tag,td__4893)});
})());

if(cljs.core.truth_(or__3548__auto____4896))
{return or__3548__auto____4896;
} else
{return h;
}
});
derive = function(h,tag,parent){
switch(arguments.length){
case  2 :
return derive__4897.call(this,h,tag);
case  3 :
return derive__4898.call(this,h,tag,parent);
}
throw('Invalid arity: ' + arguments.length);
};
return derive;
})()
;
/**
* Removes a parent/child relationship between parent and
* tag. h must be a hierarchy obtained from make-hierarchy, if not
* supplied defaults to, and modifies, the global hierarchy.
*/
cljs.core.underive = (function() {
var underive = null;
var underive__4904 = (function (tag,parent){
cljs.core.swap_BANG_.call(null,cljs.core.global_hierarchy,underive,tag,parent);
return null;
});
var underive__4905 = (function (h,tag,parent){
var parentMap__4900 = "\uFDD0'parents".call(null,h);
var childsParents__4901 = (cljs.core.truth_(parentMap__4900.call(null,tag))?cljs.core.disj.call(null,parentMap__4900.call(null,tag),parent):cljs.core.set([]));
var newParents__4902 = (cljs.core.truth_(cljs.core.not_empty.call(null,childsParents__4901))?cljs.core.assoc.call(null,parentMap__4900,tag,childsParents__4901):cljs.core.dissoc.call(null,parentMap__4900,tag));
var deriv_seq__4903 = cljs.core.flatten.call(null,cljs.core.map.call(null,(function (p1__4889_SHARP_){
return cljs.core.cons.call(null,cljs.core.first.call(null,p1__4889_SHARP_),cljs.core.interpose.call(null,cljs.core.first.call(null,p1__4889_SHARP_),cljs.core.second.call(null,p1__4889_SHARP_)));
}),cljs.core.seq.call(null,newParents__4902)));

if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,parentMap__4900.call(null,tag),parent)))
{return cljs.core.reduce.call(null,(function (p1__4890_SHARP_,p2__4891_SHARP_){
return cljs.core.apply.call(null,cljs.core.derive,p1__4890_SHARP_,p2__4891_SHARP_);
}),cljs.core.make_hierarchy.call(null),cljs.core.partition.call(null,2,deriv_seq__4903));
} else
{return h;
}
});
underive = function(h,tag,parent){
switch(arguments.length){
case  2 :
return underive__4904.call(this,h,tag);
case  3 :
return underive__4905.call(this,h,tag,parent);
}
throw('Invalid arity: ' + arguments.length);
};
return underive;
})()
;
cljs.core.reset_cache = (function reset_cache(method_cache,method_table,cached_hierarchy,hierarchy){
cljs.core.swap_BANG_.call(null,method_cache,(function (_){
return cljs.core.deref.call(null,method_table);
}));
return cljs.core.swap_BANG_.call(null,cached_hierarchy,(function (_){
return cljs.core.deref.call(null,hierarchy);
}));
});
cljs.core.prefers_STAR_ = (function prefers_STAR_(x,y,prefer_table){
var xprefs__4907 = cljs.core.deref.call(null,prefer_table).call(null,x);

var or__3548__auto____4909 = (cljs.core.truth_((function (){var and__3546__auto____4908 = xprefs__4907;

if(cljs.core.truth_(and__3546__auto____4908))
{return xprefs__4907.call(null,y);
} else
{return and__3546__auto____4908;
}
})())?true:null);

if(cljs.core.truth_(or__3548__auto____4909))
{return or__3548__auto____4909;
} else
{var or__3548__auto____4911 = (function (){var ps__4910 = cljs.core.parents.call(null,y);

while(true){
if(cljs.core.truth_((cljs.core.count.call(null,ps__4910) > 0)))
{if(cljs.core.truth_(prefers_STAR_.call(null,x,cljs.core.first.call(null,ps__4910),prefer_table)))
{} else
{}
{
var G__4914 = cljs.core.rest.call(null,ps__4910);
ps__4910 = G__4914;
continue;
}
} else
{return null;
}
break;
}
})();

if(cljs.core.truth_(or__3548__auto____4911))
{return or__3548__auto____4911;
} else
{var or__3548__auto____4913 = (function (){var ps__4912 = cljs.core.parents.call(null,x);

while(true){
if(cljs.core.truth_((cljs.core.count.call(null,ps__4912) > 0)))
{if(cljs.core.truth_(prefers_STAR_.call(null,cljs.core.first.call(null,ps__4912),y,prefer_table)))
{} else
{}
{
var G__4915 = cljs.core.rest.call(null,ps__4912);
ps__4912 = G__4915;
continue;
}
} else
{return null;
}
break;
}
})();

if(cljs.core.truth_(or__3548__auto____4913))
{return or__3548__auto____4913;
} else
{return false;
}
}
}
});
cljs.core.dominates = (function dominates(x,y,prefer_table){
var or__3548__auto____4916 = cljs.core.prefers_STAR_.call(null,x,y,prefer_table);

if(cljs.core.truth_(or__3548__auto____4916))
{return or__3548__auto____4916;
} else
{return cljs.core.isa_QMARK_.call(null,x,y);
}
});
cljs.core.find_and_cache_best_method = (function find_and_cache_best_method(name,dispatch_val,hierarchy,method_table,prefer_table,method_cache,cached_hierarchy){
var best_entry__4925 = cljs.core.reduce.call(null,(function (be,p__4917){
var vec__4918__4919 = p__4917;
var k__4920 = cljs.core.nth.call(null,vec__4918__4919,0,null);
var ___4921 = cljs.core.nth.call(null,vec__4918__4919,1,null);
var e__4922 = vec__4918__4919;

if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null,dispatch_val,k__4920)))
{var be2__4924 = (cljs.core.truth_((function (){var or__3548__auto____4923 = (be === null);

if(cljs.core.truth_(or__3548__auto____4923))
{return or__3548__auto____4923;
} else
{return cljs.core.dominates.call(null,k__4920,cljs.core.first.call(null,be),prefer_table);
}
})())?e__4922:be);

if(cljs.core.truth_(cljs.core.dominates.call(null,cljs.core.first.call(null,be2__4924),k__4920,prefer_table)))
{} else
{throw (new Error(cljs.core.str.call(null,"Multiple methods in multimethod '",name,"' match dispatch value: ",dispatch_val," -> ",k__4920," and ",cljs.core.first.call(null,be2__4924),", and neither is preferred")));
}
return be2__4924;
} else
{return be;
}
}),null,cljs.core.deref.call(null,method_table));

if(cljs.core.truth_(best_entry__4925))
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.deref.call(null,cached_hierarchy),cljs.core.deref.call(null,hierarchy))))
{cljs.core.swap_BANG_.call(null,method_cache,cljs.core.assoc,dispatch_val,cljs.core.second.call(null,best_entry__4925));
return cljs.core.second.call(null,best_entry__4925);
} else
{cljs.core.reset_cache.call(null,method_cache,method_table,cached_hierarchy,hierarchy);
return find_and_cache_best_method.call(null,name,dispatch_val,hierarchy,method_table,prefer_table,method_cache,cached_hierarchy);
}
} else
{return null;
}
});
cljs.core.IMultiFn = {};
cljs.core._reset = (function _reset(mf){
if(cljs.core.truth_((function (){var and__3546__auto____4926 = mf;

if(cljs.core.truth_(and__3546__auto____4926))
{return mf.cljs$core$IMultiFn$_reset;
} else
{return and__3546__auto____4926;
}
})()))
{return mf.cljs$core$IMultiFn$_reset(mf);
} else
{return (function (){var or__3548__auto____4927 = (cljs.core._reset[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4927))
{return or__3548__auto____4927;
} else
{var or__3548__auto____4928 = (cljs.core._reset["_"]);

if(cljs.core.truth_(or__3548__auto____4928))
{return or__3548__auto____4928;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-reset",mf);
}
}
})().call(null,mf);
}
});
cljs.core._add_method = (function _add_method(mf,dispatch_val,method){
if(cljs.core.truth_((function (){var and__3546__auto____4929 = mf;

if(cljs.core.truth_(and__3546__auto____4929))
{return mf.cljs$core$IMultiFn$_add_method;
} else
{return and__3546__auto____4929;
}
})()))
{return mf.cljs$core$IMultiFn$_add_method(mf,dispatch_val,method);
} else
{return (function (){var or__3548__auto____4930 = (cljs.core._add_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4930))
{return or__3548__auto____4930;
} else
{var or__3548__auto____4931 = (cljs.core._add_method["_"]);

if(cljs.core.truth_(or__3548__auto____4931))
{return or__3548__auto____4931;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-add-method",mf);
}
}
})().call(null,mf,dispatch_val,method);
}
});
cljs.core._remove_method = (function _remove_method(mf,dispatch_val){
if(cljs.core.truth_((function (){var and__3546__auto____4932 = mf;

if(cljs.core.truth_(and__3546__auto____4932))
{return mf.cljs$core$IMultiFn$_remove_method;
} else
{return and__3546__auto____4932;
}
})()))
{return mf.cljs$core$IMultiFn$_remove_method(mf,dispatch_val);
} else
{return (function (){var or__3548__auto____4933 = (cljs.core._remove_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4933))
{return or__3548__auto____4933;
} else
{var or__3548__auto____4934 = (cljs.core._remove_method["_"]);

if(cljs.core.truth_(or__3548__auto____4934))
{return or__3548__auto____4934;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-remove-method",mf);
}
}
})().call(null,mf,dispatch_val);
}
});
cljs.core._prefer_method = (function _prefer_method(mf,dispatch_val,dispatch_val_y){
if(cljs.core.truth_((function (){var and__3546__auto____4935 = mf;

if(cljs.core.truth_(and__3546__auto____4935))
{return mf.cljs$core$IMultiFn$_prefer_method;
} else
{return and__3546__auto____4935;
}
})()))
{return mf.cljs$core$IMultiFn$_prefer_method(mf,dispatch_val,dispatch_val_y);
} else
{return (function (){var or__3548__auto____4936 = (cljs.core._prefer_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4936))
{return or__3548__auto____4936;
} else
{var or__3548__auto____4937 = (cljs.core._prefer_method["_"]);

if(cljs.core.truth_(or__3548__auto____4937))
{return or__3548__auto____4937;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-prefer-method",mf);
}
}
})().call(null,mf,dispatch_val,dispatch_val_y);
}
});
cljs.core._get_method = (function _get_method(mf,dispatch_val){
if(cljs.core.truth_((function (){var and__3546__auto____4938 = mf;

if(cljs.core.truth_(and__3546__auto____4938))
{return mf.cljs$core$IMultiFn$_get_method;
} else
{return and__3546__auto____4938;
}
})()))
{return mf.cljs$core$IMultiFn$_get_method(mf,dispatch_val);
} else
{return (function (){var or__3548__auto____4939 = (cljs.core._get_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4939))
{return or__3548__auto____4939;
} else
{var or__3548__auto____4940 = (cljs.core._get_method["_"]);

if(cljs.core.truth_(or__3548__auto____4940))
{return or__3548__auto____4940;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-get-method",mf);
}
}
})().call(null,mf,dispatch_val);
}
});
cljs.core._methods = (function _methods(mf){
if(cljs.core.truth_((function (){var and__3546__auto____4941 = mf;

if(cljs.core.truth_(and__3546__auto____4941))
{return mf.cljs$core$IMultiFn$_methods;
} else
{return and__3546__auto____4941;
}
})()))
{return mf.cljs$core$IMultiFn$_methods(mf);
} else
{return (function (){var or__3548__auto____4942 = (cljs.core._methods[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4942))
{return or__3548__auto____4942;
} else
{var or__3548__auto____4943 = (cljs.core._methods["_"]);

if(cljs.core.truth_(or__3548__auto____4943))
{return or__3548__auto____4943;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-methods",mf);
}
}
})().call(null,mf);
}
});
cljs.core._prefers = (function _prefers(mf){
if(cljs.core.truth_((function (){var and__3546__auto____4944 = mf;

if(cljs.core.truth_(and__3546__auto____4944))
{return mf.cljs$core$IMultiFn$_prefers;
} else
{return and__3546__auto____4944;
}
})()))
{return mf.cljs$core$IMultiFn$_prefers(mf);
} else
{return (function (){var or__3548__auto____4945 = (cljs.core._prefers[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4945))
{return or__3548__auto____4945;
} else
{var or__3548__auto____4946 = (cljs.core._prefers["_"]);

if(cljs.core.truth_(or__3548__auto____4946))
{return or__3548__auto____4946;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-prefers",mf);
}
}
})().call(null,mf);
}
});
cljs.core._dispatch = (function _dispatch(mf,args){
if(cljs.core.truth_((function (){var and__3546__auto____4947 = mf;

if(cljs.core.truth_(and__3546__auto____4947))
{return mf.cljs$core$IMultiFn$_dispatch;
} else
{return and__3546__auto____4947;
}
})()))
{return mf.cljs$core$IMultiFn$_dispatch(mf,args);
} else
{return (function (){var or__3548__auto____4948 = (cljs.core._dispatch[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____4948))
{return or__3548__auto____4948;
} else
{var or__3548__auto____4949 = (cljs.core._dispatch["_"]);

if(cljs.core.truth_(or__3548__auto____4949))
{return or__3548__auto____4949;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-dispatch",mf);
}
}
})().call(null,mf,args);
}
});
cljs.core.do_dispatch = (function do_dispatch(mf,dispatch_fn,args){
var dispatch_val__4950 = cljs.core.apply.call(null,dispatch_fn,args);
var target_fn__4951 = cljs.core._get_method.call(null,mf,dispatch_val__4950);

if(cljs.core.truth_(target_fn__4951))
{} else
{throw (new Error(cljs.core.str.call(null,"No method in multimethod '",cljs.core.name,"' for dispatch value: ",dispatch_val__4950)));
}
return cljs.core.apply.call(null,target_fn__4951,args);
});

/**
* @constructor
*/
cljs.core.MultiFn = (function (name,dispatch_fn,default_dispatch_val,hierarchy,method_table,prefer_table,method_cache,cached_hierarchy){
this.name = name;
this.dispatch_fn = dispatch_fn;
this.default_dispatch_val = default_dispatch_val;
this.hierarchy = hierarchy;
this.method_table = method_table;
this.prefer_table = prefer_table;
this.method_cache = method_cache;
this.cached_hierarchy = cached_hierarchy;
})
cljs.core.MultiFn.cljs$core$IPrintable$_pr_seq = (function (this__269__auto__){
return cljs.core.list.call(null,"cljs.core.MultiFn");
});
cljs.core.MultiFn.prototype.cljs$core$IHash$ = true;
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash = (function (this$){
var this__4952 = this;
return goog.getUid.call(null,this$);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = (function (mf){
var this__4953 = this;
cljs.core.swap_BANG_.call(null,this__4953.method_table,(function (mf){
return cljs.core.ObjMap.fromObject([],{});
}));
cljs.core.swap_BANG_.call(null,this__4953.method_cache,(function (mf){
return cljs.core.ObjMap.fromObject([],{});
}));
cljs.core.swap_BANG_.call(null,this__4953.prefer_table,(function (mf){
return cljs.core.ObjMap.fromObject([],{});
}));
cljs.core.swap_BANG_.call(null,this__4953.cached_hierarchy,(function (mf){
return null;
}));
return mf;
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = (function (mf,dispatch_val,method){
var this__4954 = this;
cljs.core.swap_BANG_.call(null,this__4954.method_table,cljs.core.assoc,dispatch_val,method);
cljs.core.reset_cache.call(null,this__4954.method_cache,this__4954.method_table,this__4954.cached_hierarchy,this__4954.hierarchy);
return mf;
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = (function (mf,dispatch_val){
var this__4955 = this;
cljs.core.swap_BANG_.call(null,this__4955.method_table,cljs.core.dissoc,dispatch_val);
cljs.core.reset_cache.call(null,this__4955.method_cache,this__4955.method_table,this__4955.cached_hierarchy,this__4955.hierarchy);
return mf;
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = (function (mf,dispatch_val){
var this__4956 = this;
if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.deref.call(null,this__4956.cached_hierarchy),cljs.core.deref.call(null,this__4956.hierarchy))))
{} else
{cljs.core.reset_cache.call(null,this__4956.method_cache,this__4956.method_table,this__4956.cached_hierarchy,this__4956.hierarchy);
}
var temp__3695__auto____4957 = cljs.core.deref.call(null,this__4956.method_cache).call(null,dispatch_val);

if(cljs.core.truth_(temp__3695__auto____4957))
{var target_fn__4958 = temp__3695__auto____4957;

return target_fn__4958;
} else
{var temp__3695__auto____4959 = cljs.core.find_and_cache_best_method.call(null,this__4956.name,dispatch_val,this__4956.hierarchy,this__4956.method_table,this__4956.prefer_table,this__4956.method_cache,this__4956.cached_hierarchy);

if(cljs.core.truth_(temp__3695__auto____4959))
{var target_fn__4960 = temp__3695__auto____4959;

return target_fn__4960;
} else
{return cljs.core.deref.call(null,this__4956.method_table).call(null,this__4956.default_dispatch_val);
}
}
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = (function (mf,dispatch_val_x,dispatch_val_y){
var this__4961 = this;
if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null,dispatch_val_x,dispatch_val_y,this__4961.prefer_table)))
{throw (new Error(cljs.core.str.call(null,"Preference conflict in multimethod '",this__4961.name,"': ",dispatch_val_y," is already preferred to ",dispatch_val_x)));
} else
{}
cljs.core.swap_BANG_.call(null,this__4961.prefer_table,(function (old){
return cljs.core.assoc.call(null,old,dispatch_val_x,cljs.core.conj.call(null,cljs.core.get.call(null,old,dispatch_val_x,cljs.core.set([])),dispatch_val_y));
}));
return cljs.core.reset_cache.call(null,this__4961.method_cache,this__4961.method_table,this__4961.cached_hierarchy,this__4961.hierarchy);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = (function (mf){
var this__4962 = this;
return cljs.core.deref.call(null,this__4962.method_table);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = (function (mf){
var this__4963 = this;
return cljs.core.deref.call(null,this__4963.prefer_table);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = (function (mf,args){
var this__4964 = this;
return cljs.core.do_dispatch.call(null,mf,this__4964.dispatch_fn,args);
});
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = (function() { 
var G__4965__delegate = function (_,args){
return cljs.core._dispatch.call(null,this,args);
};
var G__4965 = function (_,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__4965__delegate.call(this, _, args);
};
G__4965.cljs$lang$maxFixedArity = 1;
G__4965.cljs$lang$applyTo = (function (arglist__4966){
var _ = cljs.core.first(arglist__4966);
var args = cljs.core.rest(arglist__4966);
return G__4965__delegate.call(this, _, args);
});
return G__4965;
})()
;
cljs.core.MultiFn.prototype.apply = (function (_,args){
return cljs.core._dispatch.call(null,this,args);
});
/**
* Removes all of the methods of multimethod.
*/
cljs.core.remove_all_methods = (function remove_all_methods(multifn){
return cljs.core._reset.call(null,multifn);
});
/**
* Removes the method of multimethod associated with dispatch-value.
*/
cljs.core.remove_method = (function remove_method(multifn,dispatch_val){
return cljs.core._remove_method.call(null,multifn,dispatch_val);
});
/**
* Causes the multimethod to prefer matches of dispatch-val-x over dispatch-val-y
* when there is a conflict
*/
cljs.core.prefer_method = (function prefer_method(multifn,dispatch_val_x,dispatch_val_y){
return cljs.core._prefer_method.call(null,multifn,dispatch_val_x,dispatch_val_y);
});
/**
* Given a multimethod, returns a map of dispatch values -> dispatch fns
*/
cljs.core.methods$ = (function methods$(multifn){
return cljs.core._methods.call(null,multifn);
});
/**
* Given a multimethod and a dispatch value, returns the dispatch fn
* that would apply to that value, or nil if none apply and no default
*/
cljs.core.get_method = (function get_method(multifn,dispatch_val){
return cljs.core._get_method.call(null,multifn,dispatch_val);
});
/**
* Given a multimethod, returns a map of preferred value -> set of other values
*/
cljs.core.prefers = (function prefers(multifn){
return cljs.core._prefers.call(null,multifn);
});

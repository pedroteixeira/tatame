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
var or__3548__auto____3941 = (p[goog.typeOf.call(null,x)]);

if(cljs.core.truth_(or__3548__auto____3941))
{return or__3548__auto____3941;
} else
{var or__3548__auto____3942 = (p["_"]);

if(cljs.core.truth_(or__3548__auto____3942))
{return or__3548__auto____3942;
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
var _invoke__4006 = (function (this$){
if(cljs.core.truth_((function (){var and__3546__auto____3943 = this$;

if(cljs.core.truth_(and__3546__auto____3943))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3943;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$);
} else
{return (function (){var or__3548__auto____3944 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3944))
{return or__3548__auto____3944;
} else
{var or__3548__auto____3945 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3945))
{return or__3548__auto____3945;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$);
}
});
var _invoke__4007 = (function (this$,a){
if(cljs.core.truth_((function (){var and__3546__auto____3946 = this$;

if(cljs.core.truth_(and__3546__auto____3946))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3946;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a);
} else
{return (function (){var or__3548__auto____3947 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3947))
{return or__3548__auto____3947;
} else
{var or__3548__auto____3948 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3948))
{return or__3548__auto____3948;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a);
}
});
var _invoke__4008 = (function (this$,a,b){
if(cljs.core.truth_((function (){var and__3546__auto____3949 = this$;

if(cljs.core.truth_(and__3546__auto____3949))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3949;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b);
} else
{return (function (){var or__3548__auto____3950 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3950))
{return or__3548__auto____3950;
} else
{var or__3548__auto____3951 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3951))
{return or__3548__auto____3951;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b);
}
});
var _invoke__4009 = (function (this$,a,b,c){
if(cljs.core.truth_((function (){var and__3546__auto____3952 = this$;

if(cljs.core.truth_(and__3546__auto____3952))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3952;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c);
} else
{return (function (){var or__3548__auto____3953 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3953))
{return or__3548__auto____3953;
} else
{var or__3548__auto____3954 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3954))
{return or__3548__auto____3954;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c);
}
});
var _invoke__4010 = (function (this$,a,b,c,d){
if(cljs.core.truth_((function (){var and__3546__auto____3955 = this$;

if(cljs.core.truth_(and__3546__auto____3955))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3955;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d);
} else
{return (function (){var or__3548__auto____3956 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3956))
{return or__3548__auto____3956;
} else
{var or__3548__auto____3957 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3957))
{return or__3548__auto____3957;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d);
}
});
var _invoke__4011 = (function (this$,a,b,c,d,e){
if(cljs.core.truth_((function (){var and__3546__auto____3958 = this$;

if(cljs.core.truth_(and__3546__auto____3958))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3958;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e);
} else
{return (function (){var or__3548__auto____3959 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3959))
{return or__3548__auto____3959;
} else
{var or__3548__auto____3960 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3960))
{return or__3548__auto____3960;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e);
}
});
var _invoke__4012 = (function (this$,a,b,c,d,e,f){
if(cljs.core.truth_((function (){var and__3546__auto____3961 = this$;

if(cljs.core.truth_(and__3546__auto____3961))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3961;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f);
} else
{return (function (){var or__3548__auto____3962 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3962))
{return or__3548__auto____3962;
} else
{var or__3548__auto____3963 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3963))
{return or__3548__auto____3963;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f);
}
});
var _invoke__4013 = (function (this$,a,b,c,d,e,f,g){
if(cljs.core.truth_((function (){var and__3546__auto____3964 = this$;

if(cljs.core.truth_(and__3546__auto____3964))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3964;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g);
} else
{return (function (){var or__3548__auto____3965 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3965))
{return or__3548__auto____3965;
} else
{var or__3548__auto____3966 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3966))
{return or__3548__auto____3966;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g);
}
});
var _invoke__4014 = (function (this$,a,b,c,d,e,f,g,h){
if(cljs.core.truth_((function (){var and__3546__auto____3967 = this$;

if(cljs.core.truth_(and__3546__auto____3967))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3967;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h);
} else
{return (function (){var or__3548__auto____3968 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3968))
{return or__3548__auto____3968;
} else
{var or__3548__auto____3969 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3969))
{return or__3548__auto____3969;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h);
}
});
var _invoke__4015 = (function (this$,a,b,c,d,e,f,g,h,i){
if(cljs.core.truth_((function (){var and__3546__auto____3970 = this$;

if(cljs.core.truth_(and__3546__auto____3970))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3970;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i);
} else
{return (function (){var or__3548__auto____3971 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3971))
{return or__3548__auto____3971;
} else
{var or__3548__auto____3972 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3972))
{return or__3548__auto____3972;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i);
}
});
var _invoke__4016 = (function (this$,a,b,c,d,e,f,g,h,i,j){
if(cljs.core.truth_((function (){var and__3546__auto____3973 = this$;

if(cljs.core.truth_(and__3546__auto____3973))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3973;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j);
} else
{return (function (){var or__3548__auto____3974 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3974))
{return or__3548__auto____3974;
} else
{var or__3548__auto____3975 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3975))
{return or__3548__auto____3975;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j);
}
});
var _invoke__4017 = (function (this$,a,b,c,d,e,f,g,h,i,j,k){
if(cljs.core.truth_((function (){var and__3546__auto____3976 = this$;

if(cljs.core.truth_(and__3546__auto____3976))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3976;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k);
} else
{return (function (){var or__3548__auto____3977 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3977))
{return or__3548__auto____3977;
} else
{var or__3548__auto____3978 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3978))
{return or__3548__auto____3978;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k);
}
});
var _invoke__4018 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l){
if(cljs.core.truth_((function (){var and__3546__auto____3979 = this$;

if(cljs.core.truth_(and__3546__auto____3979))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3979;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l);
} else
{return (function (){var or__3548__auto____3980 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3980))
{return or__3548__auto____3980;
} else
{var or__3548__auto____3981 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3981))
{return or__3548__auto____3981;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l);
}
});
var _invoke__4019 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m){
if(cljs.core.truth_((function (){var and__3546__auto____3982 = this$;

if(cljs.core.truth_(and__3546__auto____3982))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3982;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m);
} else
{return (function (){var or__3548__auto____3983 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3983))
{return or__3548__auto____3983;
} else
{var or__3548__auto____3984 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3984))
{return or__3548__auto____3984;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m);
}
});
var _invoke__4020 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n){
if(cljs.core.truth_((function (){var and__3546__auto____3985 = this$;

if(cljs.core.truth_(and__3546__auto____3985))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3985;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n);
} else
{return (function (){var or__3548__auto____3986 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3986))
{return or__3548__auto____3986;
} else
{var or__3548__auto____3987 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3987))
{return or__3548__auto____3987;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n);
}
});
var _invoke__4021 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o){
if(cljs.core.truth_((function (){var and__3546__auto____3988 = this$;

if(cljs.core.truth_(and__3546__auto____3988))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3988;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
} else
{return (function (){var or__3548__auto____3989 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3989))
{return or__3548__auto____3989;
} else
{var or__3548__auto____3990 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3990))
{return or__3548__auto____3990;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
}
});
var _invoke__4022 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){
if(cljs.core.truth_((function (){var and__3546__auto____3991 = this$;

if(cljs.core.truth_(and__3546__auto____3991))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3991;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
} else
{return (function (){var or__3548__auto____3992 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3992))
{return or__3548__auto____3992;
} else
{var or__3548__auto____3993 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3993))
{return or__3548__auto____3993;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
}
});
var _invoke__4023 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q){
if(cljs.core.truth_((function (){var and__3546__auto____3994 = this$;

if(cljs.core.truth_(and__3546__auto____3994))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3994;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q);
} else
{return (function (){var or__3548__auto____3995 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3995))
{return or__3548__auto____3995;
} else
{var or__3548__auto____3996 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3996))
{return or__3548__auto____3996;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q);
}
});
var _invoke__4024 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s){
if(cljs.core.truth_((function (){var and__3546__auto____3997 = this$;

if(cljs.core.truth_(and__3546__auto____3997))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____3997;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s);
} else
{return (function (){var or__3548__auto____3998 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____3998))
{return or__3548__auto____3998;
} else
{var or__3548__auto____3999 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____3999))
{return or__3548__auto____3999;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s);
}
});
var _invoke__4025 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t){
if(cljs.core.truth_((function (){var and__3546__auto____4000 = this$;

if(cljs.core.truth_(and__3546__auto____4000))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____4000;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t);
} else
{return (function (){var or__3548__auto____4001 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____4001))
{return or__3548__auto____4001;
} else
{var or__3548__auto____4002 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____4002))
{return or__3548__auto____4002;
} else
{throw cljs.core.missing_protocol.call(null,"IFn.-invoke",this$);
}
}
})().call(null,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t);
}
});
var _invoke__4026 = (function (this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest){
if(cljs.core.truth_((function (){var and__3546__auto____4003 = this$;

if(cljs.core.truth_(and__3546__auto____4003))
{return this$.cljs$core$IFn$_invoke;
} else
{return and__3546__auto____4003;
}
})()))
{return this$.cljs$core$IFn$_invoke(this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest);
} else
{return (function (){var or__3548__auto____4004 = (cljs.core._invoke[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____4004))
{return or__3548__auto____4004;
} else
{var or__3548__auto____4005 = (cljs.core._invoke["_"]);

if(cljs.core.truth_(or__3548__auto____4005))
{return or__3548__auto____4005;
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
return _invoke__4006.call(this,this$);
case  2 :
return _invoke__4007.call(this,this$,a);
case  3 :
return _invoke__4008.call(this,this$,a,b);
case  4 :
return _invoke__4009.call(this,this$,a,b,c);
case  5 :
return _invoke__4010.call(this,this$,a,b,c,d);
case  6 :
return _invoke__4011.call(this,this$,a,b,c,d,e);
case  7 :
return _invoke__4012.call(this,this$,a,b,c,d,e,f);
case  8 :
return _invoke__4013.call(this,this$,a,b,c,d,e,f,g);
case  9 :
return _invoke__4014.call(this,this$,a,b,c,d,e,f,g,h);
case  10 :
return _invoke__4015.call(this,this$,a,b,c,d,e,f,g,h,i);
case  11 :
return _invoke__4016.call(this,this$,a,b,c,d,e,f,g,h,i,j);
case  12 :
return _invoke__4017.call(this,this$,a,b,c,d,e,f,g,h,i,j,k);
case  13 :
return _invoke__4018.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l);
case  14 :
return _invoke__4019.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m);
case  15 :
return _invoke__4020.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n);
case  16 :
return _invoke__4021.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
case  17 :
return _invoke__4022.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p);
case  18 :
return _invoke__4023.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q);
case  19 :
return _invoke__4024.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s);
case  20 :
return _invoke__4025.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t);
case  21 :
return _invoke__4026.call(this,this$,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,s,t,rest);
}
throw('Invalid arity: ' + arguments.length);
};
return _invoke;
})()
;
cljs.core.ICounted = {};
cljs.core._count = (function _count(coll){
if(cljs.core.truth_((function (){var and__3546__auto____4028 = coll;

if(cljs.core.truth_(and__3546__auto____4028))
{return coll.cljs$core$ICounted$_count;
} else
{return and__3546__auto____4028;
}
})()))
{return coll.cljs$core$ICounted$_count(coll);
} else
{return (function (){var or__3548__auto____4029 = (cljs.core._count[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4029))
{return or__3548__auto____4029;
} else
{var or__3548__auto____4030 = (cljs.core._count["_"]);

if(cljs.core.truth_(or__3548__auto____4030))
{return or__3548__auto____4030;
} else
{throw cljs.core.missing_protocol.call(null,"ICounted.-count",coll);
}
}
})().call(null,coll);
}
});
cljs.core.IEmptyableCollection = {};
cljs.core._empty = (function _empty(coll){
if(cljs.core.truth_((function (){var and__3546__auto____4031 = coll;

if(cljs.core.truth_(and__3546__auto____4031))
{return coll.cljs$core$IEmptyableCollection$_empty;
} else
{return and__3546__auto____4031;
}
})()))
{return coll.cljs$core$IEmptyableCollection$_empty(coll);
} else
{return (function (){var or__3548__auto____4032 = (cljs.core._empty[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4032))
{return or__3548__auto____4032;
} else
{var or__3548__auto____4033 = (cljs.core._empty["_"]);

if(cljs.core.truth_(or__3548__auto____4033))
{return or__3548__auto____4033;
} else
{throw cljs.core.missing_protocol.call(null,"IEmptyableCollection.-empty",coll);
}
}
})().call(null,coll);
}
});
cljs.core.ICollection = {};
cljs.core._conj = (function _conj(coll,o){
if(cljs.core.truth_((function (){var and__3546__auto____4034 = coll;

if(cljs.core.truth_(and__3546__auto____4034))
{return coll.cljs$core$ICollection$_conj;
} else
{return and__3546__auto____4034;
}
})()))
{return coll.cljs$core$ICollection$_conj(coll,o);
} else
{return (function (){var or__3548__auto____4035 = (cljs.core._conj[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4035))
{return or__3548__auto____4035;
} else
{var or__3548__auto____4036 = (cljs.core._conj["_"]);

if(cljs.core.truth_(or__3548__auto____4036))
{return or__3548__auto____4036;
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
var _nth__4043 = (function (coll,n){
if(cljs.core.truth_((function (){var and__3546__auto____4037 = coll;

if(cljs.core.truth_(and__3546__auto____4037))
{return coll.cljs$core$IIndexed$_nth;
} else
{return and__3546__auto____4037;
}
})()))
{return coll.cljs$core$IIndexed$_nth(coll,n);
} else
{return (function (){var or__3548__auto____4038 = (cljs.core._nth[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4038))
{return or__3548__auto____4038;
} else
{var or__3548__auto____4039 = (cljs.core._nth["_"]);

if(cljs.core.truth_(or__3548__auto____4039))
{return or__3548__auto____4039;
} else
{throw cljs.core.missing_protocol.call(null,"IIndexed.-nth",coll);
}
}
})().call(null,coll,n);
}
});
var _nth__4044 = (function (coll,n,not_found){
if(cljs.core.truth_((function (){var and__3546__auto____4040 = coll;

if(cljs.core.truth_(and__3546__auto____4040))
{return coll.cljs$core$IIndexed$_nth;
} else
{return and__3546__auto____4040;
}
})()))
{return coll.cljs$core$IIndexed$_nth(coll,n,not_found);
} else
{return (function (){var or__3548__auto____4041 = (cljs.core._nth[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4041))
{return or__3548__auto____4041;
} else
{var or__3548__auto____4042 = (cljs.core._nth["_"]);

if(cljs.core.truth_(or__3548__auto____4042))
{return or__3548__auto____4042;
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
return _nth__4043.call(this,coll,n);
case  3 :
return _nth__4044.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return _nth;
})()
;
cljs.core.ISeq = {};
cljs.core._first = (function _first(coll){
if(cljs.core.truth_((function (){var and__3546__auto____4046 = coll;

if(cljs.core.truth_(and__3546__auto____4046))
{return coll.cljs$core$ISeq$_first;
} else
{return and__3546__auto____4046;
}
})()))
{return coll.cljs$core$ISeq$_first(coll);
} else
{return (function (){var or__3548__auto____4047 = (cljs.core._first[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4047))
{return or__3548__auto____4047;
} else
{var or__3548__auto____4048 = (cljs.core._first["_"]);

if(cljs.core.truth_(or__3548__auto____4048))
{return or__3548__auto____4048;
} else
{throw cljs.core.missing_protocol.call(null,"ISeq.-first",coll);
}
}
})().call(null,coll);
}
});
cljs.core._rest = (function _rest(coll){
if(cljs.core.truth_((function (){var and__3546__auto____4049 = coll;

if(cljs.core.truth_(and__3546__auto____4049))
{return coll.cljs$core$ISeq$_rest;
} else
{return and__3546__auto____4049;
}
})()))
{return coll.cljs$core$ISeq$_rest(coll);
} else
{return (function (){var or__3548__auto____4050 = (cljs.core._rest[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4050))
{return or__3548__auto____4050;
} else
{var or__3548__auto____4051 = (cljs.core._rest["_"]);

if(cljs.core.truth_(or__3548__auto____4051))
{return or__3548__auto____4051;
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
var _lookup__4058 = (function (o,k){
if(cljs.core.truth_((function (){var and__3546__auto____4052 = o;

if(cljs.core.truth_(and__3546__auto____4052))
{return o.cljs$core$ILookup$_lookup;
} else
{return and__3546__auto____4052;
}
})()))
{return o.cljs$core$ILookup$_lookup(o,k);
} else
{return (function (){var or__3548__auto____4053 = (cljs.core._lookup[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4053))
{return or__3548__auto____4053;
} else
{var or__3548__auto____4054 = (cljs.core._lookup["_"]);

if(cljs.core.truth_(or__3548__auto____4054))
{return or__3548__auto____4054;
} else
{throw cljs.core.missing_protocol.call(null,"ILookup.-lookup",o);
}
}
})().call(null,o,k);
}
});
var _lookup__4059 = (function (o,k,not_found){
if(cljs.core.truth_((function (){var and__3546__auto____4055 = o;

if(cljs.core.truth_(and__3546__auto____4055))
{return o.cljs$core$ILookup$_lookup;
} else
{return and__3546__auto____4055;
}
})()))
{return o.cljs$core$ILookup$_lookup(o,k,not_found);
} else
{return (function (){var or__3548__auto____4056 = (cljs.core._lookup[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4056))
{return or__3548__auto____4056;
} else
{var or__3548__auto____4057 = (cljs.core._lookup["_"]);

if(cljs.core.truth_(or__3548__auto____4057))
{return or__3548__auto____4057;
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
return _lookup__4058.call(this,o,k);
case  3 :
return _lookup__4059.call(this,o,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return _lookup;
})()
;
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = (function _contains_key_QMARK_(coll,k){
if(cljs.core.truth_((function (){var and__3546__auto____4061 = coll;

if(cljs.core.truth_(and__3546__auto____4061))
{return coll.cljs$core$IAssociative$_contains_key_QMARK_;
} else
{return and__3546__auto____4061;
}
})()))
{return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll,k);
} else
{return (function (){var or__3548__auto____4062 = (cljs.core._contains_key_QMARK_[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4062))
{return or__3548__auto____4062;
} else
{var or__3548__auto____4063 = (cljs.core._contains_key_QMARK_["_"]);

if(cljs.core.truth_(or__3548__auto____4063))
{return or__3548__auto____4063;
} else
{throw cljs.core.missing_protocol.call(null,"IAssociative.-contains-key?",coll);
}
}
})().call(null,coll,k);
}
});
cljs.core._assoc = (function _assoc(coll,k,v){
if(cljs.core.truth_((function (){var and__3546__auto____4064 = coll;

if(cljs.core.truth_(and__3546__auto____4064))
{return coll.cljs$core$IAssociative$_assoc;
} else
{return and__3546__auto____4064;
}
})()))
{return coll.cljs$core$IAssociative$_assoc(coll,k,v);
} else
{return (function (){var or__3548__auto____4065 = (cljs.core._assoc[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4065))
{return or__3548__auto____4065;
} else
{var or__3548__auto____4066 = (cljs.core._assoc["_"]);

if(cljs.core.truth_(or__3548__auto____4066))
{return or__3548__auto____4066;
} else
{throw cljs.core.missing_protocol.call(null,"IAssociative.-assoc",coll);
}
}
})().call(null,coll,k,v);
}
});
cljs.core.IMap = {};
cljs.core._dissoc = (function _dissoc(coll,k){
if(cljs.core.truth_((function (){var and__3546__auto____4067 = coll;

if(cljs.core.truth_(and__3546__auto____4067))
{return coll.cljs$core$IMap$_dissoc;
} else
{return and__3546__auto____4067;
}
})()))
{return coll.cljs$core$IMap$_dissoc(coll,k);
} else
{return (function (){var or__3548__auto____4068 = (cljs.core._dissoc[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4068))
{return or__3548__auto____4068;
} else
{var or__3548__auto____4069 = (cljs.core._dissoc["_"]);

if(cljs.core.truth_(or__3548__auto____4069))
{return or__3548__auto____4069;
} else
{throw cljs.core.missing_protocol.call(null,"IMap.-dissoc",coll);
}
}
})().call(null,coll,k);
}
});
cljs.core.ISet = {};
cljs.core._disjoin = (function _disjoin(coll,v){
if(cljs.core.truth_((function (){var and__3546__auto____4070 = coll;

if(cljs.core.truth_(and__3546__auto____4070))
{return coll.cljs$core$ISet$_disjoin;
} else
{return and__3546__auto____4070;
}
})()))
{return coll.cljs$core$ISet$_disjoin(coll,v);
} else
{return (function (){var or__3548__auto____4071 = (cljs.core._disjoin[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4071))
{return or__3548__auto____4071;
} else
{var or__3548__auto____4072 = (cljs.core._disjoin["_"]);

if(cljs.core.truth_(or__3548__auto____4072))
{return or__3548__auto____4072;
} else
{throw cljs.core.missing_protocol.call(null,"ISet.-disjoin",coll);
}
}
})().call(null,coll,v);
}
});
cljs.core.IStack = {};
cljs.core._peek = (function _peek(coll){
if(cljs.core.truth_((function (){var and__3546__auto____4073 = coll;

if(cljs.core.truth_(and__3546__auto____4073))
{return coll.cljs$core$IStack$_peek;
} else
{return and__3546__auto____4073;
}
})()))
{return coll.cljs$core$IStack$_peek(coll);
} else
{return (function (){var or__3548__auto____4074 = (cljs.core._peek[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4074))
{return or__3548__auto____4074;
} else
{var or__3548__auto____4075 = (cljs.core._peek["_"]);

if(cljs.core.truth_(or__3548__auto____4075))
{return or__3548__auto____4075;
} else
{throw cljs.core.missing_protocol.call(null,"IStack.-peek",coll);
}
}
})().call(null,coll);
}
});
cljs.core._pop = (function _pop(coll){
if(cljs.core.truth_((function (){var and__3546__auto____4076 = coll;

if(cljs.core.truth_(and__3546__auto____4076))
{return coll.cljs$core$IStack$_pop;
} else
{return and__3546__auto____4076;
}
})()))
{return coll.cljs$core$IStack$_pop(coll);
} else
{return (function (){var or__3548__auto____4077 = (cljs.core._pop[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4077))
{return or__3548__auto____4077;
} else
{var or__3548__auto____4078 = (cljs.core._pop["_"]);

if(cljs.core.truth_(or__3548__auto____4078))
{return or__3548__auto____4078;
} else
{throw cljs.core.missing_protocol.call(null,"IStack.-pop",coll);
}
}
})().call(null,coll);
}
});
cljs.core.IVector = {};
cljs.core._assoc_n = (function _assoc_n(coll,n,val){
if(cljs.core.truth_((function (){var and__3546__auto____4079 = coll;

if(cljs.core.truth_(and__3546__auto____4079))
{return coll.cljs$core$IVector$_assoc_n;
} else
{return and__3546__auto____4079;
}
})()))
{return coll.cljs$core$IVector$_assoc_n(coll,n,val);
} else
{return (function (){var or__3548__auto____4080 = (cljs.core._assoc_n[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4080))
{return or__3548__auto____4080;
} else
{var or__3548__auto____4081 = (cljs.core._assoc_n["_"]);

if(cljs.core.truth_(or__3548__auto____4081))
{return or__3548__auto____4081;
} else
{throw cljs.core.missing_protocol.call(null,"IVector.-assoc-n",coll);
}
}
})().call(null,coll,n,val);
}
});
cljs.core.IDeref = {};
cljs.core._deref = (function _deref(o){
if(cljs.core.truth_((function (){var and__3546__auto____4082 = o;

if(cljs.core.truth_(and__3546__auto____4082))
{return o.cljs$core$IDeref$_deref;
} else
{return and__3546__auto____4082;
}
})()))
{return o.cljs$core$IDeref$_deref(o);
} else
{return (function (){var or__3548__auto____4083 = (cljs.core._deref[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4083))
{return or__3548__auto____4083;
} else
{var or__3548__auto____4084 = (cljs.core._deref["_"]);

if(cljs.core.truth_(or__3548__auto____4084))
{return or__3548__auto____4084;
} else
{throw cljs.core.missing_protocol.call(null,"IDeref.-deref",o);
}
}
})().call(null,o);
}
});
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = (function _deref_with_timeout(o,msec,timeout_val){
if(cljs.core.truth_((function (){var and__3546__auto____4085 = o;

if(cljs.core.truth_(and__3546__auto____4085))
{return o.cljs$core$IDerefWithTimeout$_deref_with_timeout;
} else
{return and__3546__auto____4085;
}
})()))
{return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o,msec,timeout_val);
} else
{return (function (){var or__3548__auto____4086 = (cljs.core._deref_with_timeout[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4086))
{return or__3548__auto____4086;
} else
{var or__3548__auto____4087 = (cljs.core._deref_with_timeout["_"]);

if(cljs.core.truth_(or__3548__auto____4087))
{return or__3548__auto____4087;
} else
{throw cljs.core.missing_protocol.call(null,"IDerefWithTimeout.-deref-with-timeout",o);
}
}
})().call(null,o,msec,timeout_val);
}
});
cljs.core.IMeta = {};
cljs.core._meta = (function _meta(o){
if(cljs.core.truth_((function (){var and__3546__auto____4088 = o;

if(cljs.core.truth_(and__3546__auto____4088))
{return o.cljs$core$IMeta$_meta;
} else
{return and__3546__auto____4088;
}
})()))
{return o.cljs$core$IMeta$_meta(o);
} else
{return (function (){var or__3548__auto____4089 = (cljs.core._meta[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4089))
{return or__3548__auto____4089;
} else
{var or__3548__auto____4090 = (cljs.core._meta["_"]);

if(cljs.core.truth_(or__3548__auto____4090))
{return or__3548__auto____4090;
} else
{throw cljs.core.missing_protocol.call(null,"IMeta.-meta",o);
}
}
})().call(null,o);
}
});
cljs.core.IWithMeta = {};
cljs.core._with_meta = (function _with_meta(o,meta){
if(cljs.core.truth_((function (){var and__3546__auto____4091 = o;

if(cljs.core.truth_(and__3546__auto____4091))
{return o.cljs$core$IWithMeta$_with_meta;
} else
{return and__3546__auto____4091;
}
})()))
{return o.cljs$core$IWithMeta$_with_meta(o,meta);
} else
{return (function (){var or__3548__auto____4092 = (cljs.core._with_meta[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4092))
{return or__3548__auto____4092;
} else
{var or__3548__auto____4093 = (cljs.core._with_meta["_"]);

if(cljs.core.truth_(or__3548__auto____4093))
{return or__3548__auto____4093;
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
var _reduce__4100 = (function (coll,f){
if(cljs.core.truth_((function (){var and__3546__auto____4094 = coll;

if(cljs.core.truth_(and__3546__auto____4094))
{return coll.cljs$core$IReduce$_reduce;
} else
{return and__3546__auto____4094;
}
})()))
{return coll.cljs$core$IReduce$_reduce(coll,f);
} else
{return (function (){var or__3548__auto____4095 = (cljs.core._reduce[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4095))
{return or__3548__auto____4095;
} else
{var or__3548__auto____4096 = (cljs.core._reduce["_"]);

if(cljs.core.truth_(or__3548__auto____4096))
{return or__3548__auto____4096;
} else
{throw cljs.core.missing_protocol.call(null,"IReduce.-reduce",coll);
}
}
})().call(null,coll,f);
}
});
var _reduce__4101 = (function (coll,f,start){
if(cljs.core.truth_((function (){var and__3546__auto____4097 = coll;

if(cljs.core.truth_(and__3546__auto____4097))
{return coll.cljs$core$IReduce$_reduce;
} else
{return and__3546__auto____4097;
}
})()))
{return coll.cljs$core$IReduce$_reduce(coll,f,start);
} else
{return (function (){var or__3548__auto____4098 = (cljs.core._reduce[goog.typeOf.call(null,coll)]);

if(cljs.core.truth_(or__3548__auto____4098))
{return or__3548__auto____4098;
} else
{var or__3548__auto____4099 = (cljs.core._reduce["_"]);

if(cljs.core.truth_(or__3548__auto____4099))
{return or__3548__auto____4099;
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
return _reduce__4100.call(this,coll,f);
case  3 :
return _reduce__4101.call(this,coll,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return _reduce;
})()
;
cljs.core.IEquiv = {};
cljs.core._equiv = (function _equiv(o,other){
if(cljs.core.truth_((function (){var and__3546__auto____4103 = o;

if(cljs.core.truth_(and__3546__auto____4103))
{return o.cljs$core$IEquiv$_equiv;
} else
{return and__3546__auto____4103;
}
})()))
{return o.cljs$core$IEquiv$_equiv(o,other);
} else
{return (function (){var or__3548__auto____4104 = (cljs.core._equiv[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4104))
{return or__3548__auto____4104;
} else
{var or__3548__auto____4105 = (cljs.core._equiv["_"]);

if(cljs.core.truth_(or__3548__auto____4105))
{return or__3548__auto____4105;
} else
{throw cljs.core.missing_protocol.call(null,"IEquiv.-equiv",o);
}
}
})().call(null,o,other);
}
});
cljs.core.IHash = {};
cljs.core._hash = (function _hash(o){
if(cljs.core.truth_((function (){var and__3546__auto____4106 = o;

if(cljs.core.truth_(and__3546__auto____4106))
{return o.cljs$core$IHash$_hash;
} else
{return and__3546__auto____4106;
}
})()))
{return o.cljs$core$IHash$_hash(o);
} else
{return (function (){var or__3548__auto____4107 = (cljs.core._hash[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4107))
{return or__3548__auto____4107;
} else
{var or__3548__auto____4108 = (cljs.core._hash["_"]);

if(cljs.core.truth_(or__3548__auto____4108))
{return or__3548__auto____4108;
} else
{throw cljs.core.missing_protocol.call(null,"IHash.-hash",o);
}
}
})().call(null,o);
}
});
cljs.core.ISeqable = {};
cljs.core._seq = (function _seq(o){
if(cljs.core.truth_((function (){var and__3546__auto____4109 = o;

if(cljs.core.truth_(and__3546__auto____4109))
{return o.cljs$core$ISeqable$_seq;
} else
{return and__3546__auto____4109;
}
})()))
{return o.cljs$core$ISeqable$_seq(o);
} else
{return (function (){var or__3548__auto____4110 = (cljs.core._seq[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4110))
{return or__3548__auto____4110;
} else
{var or__3548__auto____4111 = (cljs.core._seq["_"]);

if(cljs.core.truth_(or__3548__auto____4111))
{return or__3548__auto____4111;
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
if(cljs.core.truth_((function (){var and__3546__auto____4112 = o;

if(cljs.core.truth_(and__3546__auto____4112))
{return o.cljs$core$IPrintable$_pr_seq;
} else
{return and__3546__auto____4112;
}
})()))
{return o.cljs$core$IPrintable$_pr_seq(o,opts);
} else
{return (function (){var or__3548__auto____4113 = (cljs.core._pr_seq[goog.typeOf.call(null,o)]);

if(cljs.core.truth_(or__3548__auto____4113))
{return or__3548__auto____4113;
} else
{var or__3548__auto____4114 = (cljs.core._pr_seq["_"]);

if(cljs.core.truth_(or__3548__auto____4114))
{return or__3548__auto____4114;
} else
{throw cljs.core.missing_protocol.call(null,"IPrintable.-pr-seq",o);
}
}
})().call(null,o,opts);
}
});
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = (function _realized_QMARK_(d){
if(cljs.core.truth_((function (){var and__3546__auto____4115 = d;

if(cljs.core.truth_(and__3546__auto____4115))
{return d.cljs$core$IPending$_realized_QMARK_;
} else
{return and__3546__auto____4115;
}
})()))
{return d.cljs$core$IPending$_realized_QMARK_(d);
} else
{return (function (){var or__3548__auto____4116 = (cljs.core._realized_QMARK_[goog.typeOf.call(null,d)]);

if(cljs.core.truth_(or__3548__auto____4116))
{return or__3548__auto____4116;
} else
{var or__3548__auto____4117 = (cljs.core._realized_QMARK_["_"]);

if(cljs.core.truth_(or__3548__auto____4117))
{return or__3548__auto____4117;
} else
{throw cljs.core.missing_protocol.call(null,"IPending.-realized?",d);
}
}
})().call(null,d);
}
});
cljs.core.IWatchable = {};
cljs.core._notify_watches = (function _notify_watches(this$,oldval,newval){
if(cljs.core.truth_((function (){var and__3546__auto____4118 = this$;

if(cljs.core.truth_(and__3546__auto____4118))
{return this$.cljs$core$IWatchable$_notify_watches;
} else
{return and__3546__auto____4118;
}
})()))
{return this$.cljs$core$IWatchable$_notify_watches(this$,oldval,newval);
} else
{return (function (){var or__3548__auto____4119 = (cljs.core._notify_watches[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____4119))
{return or__3548__auto____4119;
} else
{var or__3548__auto____4120 = (cljs.core._notify_watches["_"]);

if(cljs.core.truth_(or__3548__auto____4120))
{return or__3548__auto____4120;
} else
{throw cljs.core.missing_protocol.call(null,"IWatchable.-notify-watches",this$);
}
}
})().call(null,this$,oldval,newval);
}
});
cljs.core._add_watch = (function _add_watch(this$,key,f){
if(cljs.core.truth_((function (){var and__3546__auto____4121 = this$;

if(cljs.core.truth_(and__3546__auto____4121))
{return this$.cljs$core$IWatchable$_add_watch;
} else
{return and__3546__auto____4121;
}
})()))
{return this$.cljs$core$IWatchable$_add_watch(this$,key,f);
} else
{return (function (){var or__3548__auto____4122 = (cljs.core._add_watch[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____4122))
{return or__3548__auto____4122;
} else
{var or__3548__auto____4123 = (cljs.core._add_watch["_"]);

if(cljs.core.truth_(or__3548__auto____4123))
{return or__3548__auto____4123;
} else
{throw cljs.core.missing_protocol.call(null,"IWatchable.-add-watch",this$);
}
}
})().call(null,this$,key,f);
}
});
cljs.core._remove_watch = (function _remove_watch(this$,key){
if(cljs.core.truth_((function (){var and__3546__auto____4124 = this$;

if(cljs.core.truth_(and__3546__auto____4124))
{return this$.cljs$core$IWatchable$_remove_watch;
} else
{return and__3546__auto____4124;
}
})()))
{return this$.cljs$core$IWatchable$_remove_watch(this$,key);
} else
{return (function (){var or__3548__auto____4125 = (cljs.core._remove_watch[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____4125))
{return or__3548__auto____4125;
} else
{var or__3548__auto____4126 = (cljs.core._remove_watch["_"]);

if(cljs.core.truth_(or__3548__auto____4126))
{return or__3548__auto____4126;
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
var G__4127 = null;
var G__4127__4128 = (function (o,k){
return null;
});
var G__4127__4129 = (function (o,k,not_found){
return not_found;
});
G__4127 = function(o,k,not_found){
switch(arguments.length){
case  2 :
return G__4127__4128.call(this,o,k);
case  3 :
return G__4127__4129.call(this,o,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4127;
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
var G__4131 = null;
var G__4131__4132 = (function (_,f){
return f.call(null);
});
var G__4131__4133 = (function (_,f,start){
return start;
});
G__4131 = function(_,f,start){
switch(arguments.length){
case  2 :
return G__4131__4132.call(this,_,f);
case  3 :
return G__4131__4133.call(this,_,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4131;
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
var G__4135 = null;
var G__4135__4136 = (function (_,n){
return null;
});
var G__4135__4137 = (function (_,n,not_found){
return not_found;
});
G__4135 = function(_,n,not_found){
switch(arguments.length){
case  2 :
return G__4135__4136.call(this,_,n);
case  3 :
return G__4135__4137.call(this,_,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4135;
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
var ci_reduce__4145 = (function (cicoll,f){
if(cljs.core.truth_(cljs.core._EQ_.call(null,0,cljs.core._count.call(null,cicoll))))
{return f.call(null);
} else
{var val__4139 = cljs.core._nth.call(null,cicoll,0);
var n__4140 = 1;

while(true){
if(cljs.core.truth_((n__4140 < cljs.core._count.call(null,cicoll))))
{{
var G__4149 = f.call(null,val__4139,cljs.core._nth.call(null,cicoll,n__4140));
var G__4150 = (n__4140 + 1);
val__4139 = G__4149;
n__4140 = G__4150;
continue;
}
} else
{return val__4139;
}
break;
}
}
});
var ci_reduce__4146 = (function (cicoll,f,val){
var val__4141 = val;
var n__4142 = 0;

while(true){
if(cljs.core.truth_((n__4142 < cljs.core._count.call(null,cicoll))))
{{
var G__4151 = f.call(null,val__4141,cljs.core._nth.call(null,cicoll,n__4142));
var G__4152 = (n__4142 + 1);
val__4141 = G__4151;
n__4142 = G__4152;
continue;
}
} else
{return val__4141;
}
break;
}
});
var ci_reduce__4147 = (function (cicoll,f,val,idx){
var val__4143 = val;
var n__4144 = idx;

while(true){
if(cljs.core.truth_((n__4144 < cljs.core._count.call(null,cicoll))))
{{
var G__4153 = f.call(null,val__4143,cljs.core._nth.call(null,cicoll,n__4144));
var G__4154 = (n__4144 + 1);
val__4143 = G__4153;
n__4144 = G__4154;
continue;
}
} else
{return val__4143;
}
break;
}
});
ci_reduce = function(cicoll,f,val,idx){
switch(arguments.length){
case  2 :
return ci_reduce__4145.call(this,cicoll,f);
case  3 :
return ci_reduce__4146.call(this,cicoll,f,val);
case  4 :
return ci_reduce__4147.call(this,cicoll,f,val,idx);
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
cljs.core.IndexedSeq.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.IndexedSeq");
});
cljs.core.IndexedSeq.prototype.cljs$core$IHash$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4155 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = (function() {
var G__4168 = null;
var G__4168__4169 = (function (_,f){
var this__4156 = this;
return cljs.core.ci_reduce.call(null,this__4156.a,f,(this__4156.a[this__4156.i]),(this__4156.i + 1));
});
var G__4168__4170 = (function (_,f,start){
var this__4157 = this;
return cljs.core.ci_reduce.call(null,this__4157.a,f,start,this__4157.i);
});
G__4168 = function(_,f,start){
switch(arguments.length){
case  2 :
return G__4168__4169.call(this,_,f);
case  3 :
return G__4168__4170.call(this,_,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4168;
})()
;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4158 = this;
return cljs.core.cons.call(null,o,coll);
});
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4159 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = (function() {
var G__4172 = null;
var G__4172__4173 = (function (coll,n){
var this__4160 = this;
var i__4161 = (n + this__4160.i);

if(cljs.core.truth_((i__4161 < this__4160.a.length)))
{return (this__4160.a[i__4161]);
} else
{return null;
}
});
var G__4172__4174 = (function (coll,n,not_found){
var this__4162 = this;
var i__4163 = (n + this__4162.i);

if(cljs.core.truth_((i__4163 < this__4162.a.length)))
{return (this__4162.a[i__4163]);
} else
{return not_found;
}
});
G__4172 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__4172__4173.call(this,coll,n);
case  3 :
return G__4172__4174.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4172;
})()
;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = (function (_){
var this__4164 = this;
return (this__4164.a.length - this__4164.i);
});
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = (function (_){
var this__4165 = this;
return (this__4165.a[this__4165.i]);
});
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = (function (_){
var this__4166 = this;
if(cljs.core.truth_(((this__4166.i + 1) < this__4166.a.length)))
{return (new cljs.core.IndexedSeq(this__4166.a,(this__4166.i + 1)));
} else
{return cljs.core.list.call(null);
}
});
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = (function (this$){
var this__4167 = this;
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
var G__4176 = null;
var G__4176__4177 = (function (array,f){
return cljs.core.ci_reduce.call(null,array,f);
});
var G__4176__4178 = (function (array,f,start){
return cljs.core.ci_reduce.call(null,array,f,start);
});
G__4176 = function(array,f,start){
switch(arguments.length){
case  2 :
return G__4176__4177.call(this,array,f);
case  3 :
return G__4176__4178.call(this,array,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4176;
})()
);
(cljs.core.ILookup["array"] = true);
(cljs.core._lookup["array"] = (function() {
var G__4180 = null;
var G__4180__4181 = (function (array,k){
return (array[k]);
});
var G__4180__4182 = (function (array,k,not_found){
return cljs.core._nth.call(null,array,k,not_found);
});
G__4180 = function(array,k,not_found){
switch(arguments.length){
case  2 :
return G__4180__4181.call(this,array,k);
case  3 :
return G__4180__4182.call(this,array,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4180;
})()
);
(cljs.core.IIndexed["array"] = true);
(cljs.core._nth["array"] = (function() {
var G__4184 = null;
var G__4184__4185 = (function (array,n){
if(cljs.core.truth_((n < array.length)))
{return (array[n]);
} else
{return null;
}
});
var G__4184__4186 = (function (array,n,not_found){
if(cljs.core.truth_((n < array.length)))
{return (array[n]);
} else
{return not_found;
}
});
G__4184 = function(array,n,not_found){
switch(arguments.length){
case  2 :
return G__4184__4185.call(this,array,n);
case  3 :
return G__4184__4186.call(this,array,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4184;
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
var temp__3698__auto____4188 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4188))
{var s__4189 = temp__3698__auto____4188;

return cljs.core._first.call(null,s__4189);
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
var G__4190 = cljs.core.next.call(null,s);
s = G__4190;
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
var s__4191 = cljs.core.seq.call(null,x);
var n__4192 = 0;

while(true){
if(cljs.core.truth_(s__4191))
{{
var G__4193 = cljs.core.next.call(null,s__4191);
var G__4194 = (n__4192 + 1);
s__4191 = G__4193;
n__4192 = G__4194;
continue;
}
} else
{return n__4192;
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
var conj__4195 = (function (coll,x){
return cljs.core._conj.call(null,coll,x);
});
var conj__4196 = (function() { 
var G__4198__delegate = function (coll,x,xs){
while(true){
if(cljs.core.truth_(xs))
{{
var G__4199 = conj.call(null,coll,x);
var G__4200 = cljs.core.first.call(null,xs);
var G__4201 = cljs.core.next.call(null,xs);
coll = G__4199;
x = G__4200;
xs = G__4201;
continue;
}
} else
{return conj.call(null,coll,x);
}
break;
}
};
var G__4198 = function (coll,x,var_args){
var xs = null;
if (goog.isDef(var_args)) {
  xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4198__delegate.call(this, coll, x, xs);
};
G__4198.cljs$lang$maxFixedArity = 2;
G__4198.cljs$lang$applyTo = (function (arglist__4202){
var coll = cljs.core.first(arglist__4202);
var x = cljs.core.first(cljs.core.next(arglist__4202));
var xs = cljs.core.rest(cljs.core.next(arglist__4202));
return G__4198__delegate.call(this, coll, x, xs);
});
return G__4198;
})()
;
conj = function(coll,x,var_args){
var xs = var_args;
switch(arguments.length){
case  2 :
return conj__4195.call(this,coll,x);
default:
return conj__4196.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
conj.cljs$lang$maxFixedArity = 2;
conj.cljs$lang$applyTo = conj__4196.cljs$lang$applyTo;
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
var nth__4203 = (function (coll,n){
return cljs.core._nth.call(null,coll,Math.floor(n));
});
var nth__4204 = (function (coll,n,not_found){
return cljs.core._nth.call(null,coll,Math.floor(n),not_found);
});
nth = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return nth__4203.call(this,coll,n);
case  3 :
return nth__4204.call(this,coll,n,not_found);
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
var get__4206 = (function (o,k){
return cljs.core._lookup.call(null,o,k);
});
var get__4207 = (function (o,k,not_found){
return cljs.core._lookup.call(null,o,k,not_found);
});
get = function(o,k,not_found){
switch(arguments.length){
case  2 :
return get__4206.call(this,o,k);
case  3 :
return get__4207.call(this,o,k,not_found);
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
var assoc__4210 = (function (coll,k,v){
return cljs.core._assoc.call(null,coll,k,v);
});
var assoc__4211 = (function() { 
var G__4213__delegate = function (coll,k,v,kvs){
while(true){
var ret__4209 = assoc.call(null,coll,k,v);

if(cljs.core.truth_(kvs))
{{
var G__4214 = ret__4209;
var G__4215 = cljs.core.first.call(null,kvs);
var G__4216 = cljs.core.second.call(null,kvs);
var G__4217 = cljs.core.nnext.call(null,kvs);
coll = G__4214;
k = G__4215;
v = G__4216;
kvs = G__4217;
continue;
}
} else
{return ret__4209;
}
break;
}
};
var G__4213 = function (coll,k,v,var_args){
var kvs = null;
if (goog.isDef(var_args)) {
  kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4213__delegate.call(this, coll, k, v, kvs);
};
G__4213.cljs$lang$maxFixedArity = 3;
G__4213.cljs$lang$applyTo = (function (arglist__4218){
var coll = cljs.core.first(arglist__4218);
var k = cljs.core.first(cljs.core.next(arglist__4218));
var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4218)));
var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4218)));
return G__4213__delegate.call(this, coll, k, v, kvs);
});
return G__4213;
})()
;
assoc = function(coll,k,v,var_args){
var kvs = var_args;
switch(arguments.length){
case  3 :
return assoc__4210.call(this,coll,k,v);
default:
return assoc__4211.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
assoc.cljs$lang$maxFixedArity = 3;
assoc.cljs$lang$applyTo = assoc__4211.cljs$lang$applyTo;
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
var dissoc__4220 = (function (coll){
return coll;
});
var dissoc__4221 = (function (coll,k){
return cljs.core._dissoc.call(null,coll,k);
});
var dissoc__4222 = (function() { 
var G__4224__delegate = function (coll,k,ks){
while(true){
var ret__4219 = dissoc.call(null,coll,k);

if(cljs.core.truth_(ks))
{{
var G__4225 = ret__4219;
var G__4226 = cljs.core.first.call(null,ks);
var G__4227 = cljs.core.next.call(null,ks);
coll = G__4225;
k = G__4226;
ks = G__4227;
continue;
}
} else
{return ret__4219;
}
break;
}
};
var G__4224 = function (coll,k,var_args){
var ks = null;
if (goog.isDef(var_args)) {
  ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4224__delegate.call(this, coll, k, ks);
};
G__4224.cljs$lang$maxFixedArity = 2;
G__4224.cljs$lang$applyTo = (function (arglist__4228){
var coll = cljs.core.first(arglist__4228);
var k = cljs.core.first(cljs.core.next(arglist__4228));
var ks = cljs.core.rest(cljs.core.next(arglist__4228));
return G__4224__delegate.call(this, coll, k, ks);
});
return G__4224;
})()
;
dissoc = function(coll,k,var_args){
var ks = var_args;
switch(arguments.length){
case  1 :
return dissoc__4220.call(this,coll);
case  2 :
return dissoc__4221.call(this,coll,k);
default:
return dissoc__4222.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
dissoc.cljs$lang$maxFixedArity = 2;
dissoc.cljs$lang$applyTo = dissoc__4222.cljs$lang$applyTo;
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
if(cljs.core.truth_((function (){var x__352__auto____4229 = o;

if(cljs.core.truth_((function (){var and__3546__auto____4230 = x__352__auto____4229;

if(cljs.core.truth_(and__3546__auto____4230))
{var and__3546__auto____4231 = x__352__auto____4229.cljs$core$IMeta$;

if(cljs.core.truth_(and__3546__auto____4231))
{return cljs.core.not.call(null,x__352__auto____4229.hasOwnProperty("cljs$core$IMeta$"));
} else
{return and__3546__auto____4231;
}
} else
{return and__3546__auto____4230;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IMeta,x__352__auto____4229);
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
var disj__4233 = (function (coll){
return coll;
});
var disj__4234 = (function (coll,k){
return cljs.core._disjoin.call(null,coll,k);
});
var disj__4235 = (function() { 
var G__4237__delegate = function (coll,k,ks){
while(true){
var ret__4232 = disj.call(null,coll,k);

if(cljs.core.truth_(ks))
{{
var G__4238 = ret__4232;
var G__4239 = cljs.core.first.call(null,ks);
var G__4240 = cljs.core.next.call(null,ks);
coll = G__4238;
k = G__4239;
ks = G__4240;
continue;
}
} else
{return ret__4232;
}
break;
}
};
var G__4237 = function (coll,k,var_args){
var ks = null;
if (goog.isDef(var_args)) {
  ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4237__delegate.call(this, coll, k, ks);
};
G__4237.cljs$lang$maxFixedArity = 2;
G__4237.cljs$lang$applyTo = (function (arglist__4241){
var coll = cljs.core.first(arglist__4241);
var k = cljs.core.first(cljs.core.next(arglist__4241));
var ks = cljs.core.rest(cljs.core.next(arglist__4241));
return G__4237__delegate.call(this, coll, k, ks);
});
return G__4237;
})()
;
disj = function(coll,k,var_args){
var ks = var_args;
switch(arguments.length){
case  1 :
return disj__4233.call(this,coll);
case  2 :
return disj__4234.call(this,coll,k);
default:
return disj__4235.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
disj.cljs$lang$maxFixedArity = 2;
disj.cljs$lang$applyTo = disj__4235.cljs$lang$applyTo;
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
{var x__352__auto____4242 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4243 = x__352__auto____4242;

if(cljs.core.truth_(and__3546__auto____4243))
{var and__3546__auto____4244 = x__352__auto____4242.cljs$core$ICollection$;

if(cljs.core.truth_(and__3546__auto____4244))
{return cljs.core.not.call(null,x__352__auto____4242.hasOwnProperty("cljs$core$ICollection$"));
} else
{return and__3546__auto____4244;
}
} else
{return and__3546__auto____4243;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ICollection,x__352__auto____4242);
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
{var x__352__auto____4245 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4246 = x__352__auto____4245;

if(cljs.core.truth_(and__3546__auto____4246))
{var and__3546__auto____4247 = x__352__auto____4245.cljs$core$ISet$;

if(cljs.core.truth_(and__3546__auto____4247))
{return cljs.core.not.call(null,x__352__auto____4245.hasOwnProperty("cljs$core$ISet$"));
} else
{return and__3546__auto____4247;
}
} else
{return and__3546__auto____4246;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ISet,x__352__auto____4245);
}
}
});
/**
* Returns true if coll implements Associative
*/
cljs.core.associative_QMARK_ = (function associative_QMARK_(x){
var x__352__auto____4248 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4249 = x__352__auto____4248;

if(cljs.core.truth_(and__3546__auto____4249))
{var and__3546__auto____4250 = x__352__auto____4248.cljs$core$IAssociative$;

if(cljs.core.truth_(and__3546__auto____4250))
{return cljs.core.not.call(null,x__352__auto____4248.hasOwnProperty("cljs$core$IAssociative$"));
} else
{return and__3546__auto____4250;
}
} else
{return and__3546__auto____4249;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IAssociative,x__352__auto____4248);
}
});
/**
* Returns true if coll satisfies ISequential
*/
cljs.core.sequential_QMARK_ = (function sequential_QMARK_(x){
var x__352__auto____4251 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4252 = x__352__auto____4251;

if(cljs.core.truth_(and__3546__auto____4252))
{var and__3546__auto____4253 = x__352__auto____4251.cljs$core$ISequential$;

if(cljs.core.truth_(and__3546__auto____4253))
{return cljs.core.not.call(null,x__352__auto____4251.hasOwnProperty("cljs$core$ISequential$"));
} else
{return and__3546__auto____4253;
}
} else
{return and__3546__auto____4252;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ISequential,x__352__auto____4251);
}
});
/**
* Returns true if coll implements count in constant time
*/
cljs.core.counted_QMARK_ = (function counted_QMARK_(x){
var x__352__auto____4254 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4255 = x__352__auto____4254;

if(cljs.core.truth_(and__3546__auto____4255))
{var and__3546__auto____4256 = x__352__auto____4254.cljs$core$ICounted$;

if(cljs.core.truth_(and__3546__auto____4256))
{return cljs.core.not.call(null,x__352__auto____4254.hasOwnProperty("cljs$core$ICounted$"));
} else
{return and__3546__auto____4256;
}
} else
{return and__3546__auto____4255;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ICounted,x__352__auto____4254);
}
});
/**
* Return true if x satisfies IMap
*/
cljs.core.map_QMARK_ = (function map_QMARK_(x){
if(cljs.core.truth_((x === null)))
{return false;
} else
{var x__352__auto____4257 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4258 = x__352__auto____4257;

if(cljs.core.truth_(and__3546__auto____4258))
{var and__3546__auto____4259 = x__352__auto____4257.cljs$core$IMap$;

if(cljs.core.truth_(and__3546__auto____4259))
{return cljs.core.not.call(null,x__352__auto____4257.hasOwnProperty("cljs$core$IMap$"));
} else
{return and__3546__auto____4259;
}
} else
{return and__3546__auto____4258;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IMap,x__352__auto____4257);
}
}
});
/**
* Return true if x satisfies IVector
*/
cljs.core.vector_QMARK_ = (function vector_QMARK_(x){
var x__352__auto____4260 = x;

if(cljs.core.truth_((function (){var and__3546__auto____4261 = x__352__auto____4260;

if(cljs.core.truth_(and__3546__auto____4261))
{var and__3546__auto____4262 = x__352__auto____4260.cljs$core$IVector$;

if(cljs.core.truth_(and__3546__auto____4262))
{return cljs.core.not.call(null,x__352__auto____4260.hasOwnProperty("cljs$core$IVector$"));
} else
{return and__3546__auto____4262;
}
} else
{return and__3546__auto____4261;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IVector,x__352__auto____4260);
}
});
cljs.core.js_obj = (function js_obj(){
return {};
});
cljs.core.js_keys = (function js_keys(obj){
var keys__4263 = cljs.core.array.call(null);

goog.object.forEach.call(null,obj,(function (val,key,obj){
return keys__4263.push(key);
}));
return keys__4263;
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
{var x__352__auto____4264 = s;

if(cljs.core.truth_((function (){var and__3546__auto____4265 = x__352__auto____4264;

if(cljs.core.truth_(and__3546__auto____4265))
{var and__3546__auto____4266 = x__352__auto____4264.cljs$core$ISeq$;

if(cljs.core.truth_(and__3546__auto____4266))
{return cljs.core.not.call(null,x__352__auto____4264.hasOwnProperty("cljs$core$ISeq$"));
} else
{return and__3546__auto____4266;
}
} else
{return and__3546__auto____4265;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.ISeq,x__352__auto____4264);
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
var and__3546__auto____4267 = goog.isString.call(null,x);

if(cljs.core.truth_(and__3546__auto____4267))
{return cljs.core.not.call(null,(function (){var or__3548__auto____4268 = cljs.core._EQ_.call(null,x.charAt(0),"\uFDD0");

if(cljs.core.truth_(or__3548__auto____4268))
{return or__3548__auto____4268;
} else
{return cljs.core._EQ_.call(null,x.charAt(0),"\uFDD1");
}
})());
} else
{return and__3546__auto____4267;
}
});
cljs.core.keyword_QMARK_ = (function keyword_QMARK_(x){
var and__3546__auto____4269 = goog.isString.call(null,x);

if(cljs.core.truth_(and__3546__auto____4269))
{return cljs.core._EQ_.call(null,x.charAt(0),"\uFDD0");
} else
{return and__3546__auto____4269;
}
});
cljs.core.symbol_QMARK_ = (function symbol_QMARK_(x){
var and__3546__auto____4270 = goog.isString.call(null,x);

if(cljs.core.truth_(and__3546__auto____4270))
{return cljs.core._EQ_.call(null,x.charAt(0),"\uFDD1");
} else
{return and__3546__auto____4270;
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
var and__3546__auto____4271 = cljs.core.number_QMARK_.call(null,n);

if(cljs.core.truth_(and__3546__auto____4271))
{return (n == n.toFixed());
} else
{return and__3546__auto____4271;
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
if(cljs.core.truth_((function (){var and__3546__auto____4272 = coll;

if(cljs.core.truth_(and__3546__auto____4272))
{var and__3546__auto____4273 = cljs.core.associative_QMARK_.call(null,coll);

if(cljs.core.truth_(and__3546__auto____4273))
{return cljs.core.contains_QMARK_.call(null,coll,k);
} else
{return and__3546__auto____4273;
}
} else
{return and__3546__auto____4272;
}
})()))
{return cljs.core.Vector.fromArray([k,cljs.core._lookup.call(null,coll,k)]);
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
var distinct_QMARK___4278 = (function (x){
return true;
});
var distinct_QMARK___4279 = (function (x,y){
return cljs.core.not.call(null,cljs.core._EQ_.call(null,x,y));
});
var distinct_QMARK___4280 = (function() { 
var G__4282__delegate = function (x,y,more){
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core._EQ_.call(null,x,y))))
{var s__4274 = cljs.core.set([y,x]);
var xs__4275 = more;

while(true){
var x__4276 = cljs.core.first.call(null,xs__4275);
var etc__4277 = cljs.core.next.call(null,xs__4275);

if(cljs.core.truth_(xs__4275))
{if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,s__4274,x__4276)))
{return false;
} else
{{
var G__4283 = cljs.core.conj.call(null,s__4274,x__4276);
var G__4284 = etc__4277;
s__4274 = G__4283;
xs__4275 = G__4284;
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
var G__4282 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4282__delegate.call(this, x, y, more);
};
G__4282.cljs$lang$maxFixedArity = 2;
G__4282.cljs$lang$applyTo = (function (arglist__4285){
var x = cljs.core.first(arglist__4285);
var y = cljs.core.first(cljs.core.next(arglist__4285));
var more = cljs.core.rest(cljs.core.next(arglist__4285));
return G__4282__delegate.call(this, x, y, more);
});
return G__4282;
})()
;
distinct_QMARK_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return distinct_QMARK___4278.call(this,x);
case  2 :
return distinct_QMARK___4279.call(this,x,y);
default:
return distinct_QMARK___4280.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
distinct_QMARK_.cljs$lang$maxFixedArity = 2;
distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___4280.cljs$lang$applyTo;
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
var r__4286 = f.call(null,x,y);

if(cljs.core.truth_(cljs.core.number_QMARK_.call(null,r__4286)))
{return r__4286;
} else
{if(cljs.core.truth_(r__4286))
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
var sort__4288 = (function (coll){
return sort.call(null,cljs.core.compare,coll);
});
var sort__4289 = (function (comp,coll){
if(cljs.core.truth_(cljs.core.seq.call(null,coll)))
{var a__4287 = cljs.core.to_array.call(null,coll);

goog.array.stableSort.call(null,a__4287,cljs.core.fn__GT_comparator.call(null,comp));
return cljs.core.seq.call(null,a__4287);
} else
{return cljs.core.List.EMPTY;
}
});
sort = function(comp,coll){
switch(arguments.length){
case  1 :
return sort__4288.call(this,comp);
case  2 :
return sort__4289.call(this,comp,coll);
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
var sort_by__4291 = (function (keyfn,coll){
return sort_by.call(null,keyfn,cljs.core.compare,coll);
});
var sort_by__4292 = (function (keyfn,comp,coll){
return cljs.core.sort.call(null,(function (x,y){
return cljs.core.fn__GT_comparator.call(null,comp).call(null,keyfn.call(null,x),keyfn.call(null,y));
}),coll);
});
sort_by = function(keyfn,comp,coll){
switch(arguments.length){
case  2 :
return sort_by__4291.call(this,keyfn,comp);
case  3 :
return sort_by__4292.call(this,keyfn,comp,coll);
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
var reduce__4294 = (function (f,coll){
return cljs.core._reduce.call(null,coll,f);
});
var reduce__4295 = (function (f,val,coll){
return cljs.core._reduce.call(null,coll,f,val);
});
reduce = function(f,val,coll){
switch(arguments.length){
case  2 :
return reduce__4294.call(this,f,val);
case  3 :
return reduce__4295.call(this,f,val,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return reduce;
})()
;
cljs.core.seq_reduce = (function() {
var seq_reduce = null;
var seq_reduce__4301 = (function (f,coll){
var temp__3695__auto____4297 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3695__auto____4297))
{var s__4298 = temp__3695__auto____4297;

return cljs.core.reduce.call(null,f,cljs.core.first.call(null,s__4298),cljs.core.next.call(null,s__4298));
} else
{return f.call(null);
}
});
var seq_reduce__4302 = (function (f,val,coll){
var val__4299 = val;
var coll__4300 = cljs.core.seq.call(null,coll);

while(true){
if(cljs.core.truth_(coll__4300))
{{
var G__4304 = f.call(null,val__4299,cljs.core.first.call(null,coll__4300));
var G__4305 = cljs.core.next.call(null,coll__4300);
val__4299 = G__4304;
coll__4300 = G__4305;
continue;
}
} else
{return val__4299;
}
break;
}
});
seq_reduce = function(f,val,coll){
switch(arguments.length){
case  2 :
return seq_reduce__4301.call(this,f,val);
case  3 :
return seq_reduce__4302.call(this,f,val,coll);
}
throw('Invalid arity: ' + arguments.length);
};
return seq_reduce;
})()
;
(cljs.core.IReduce["_"] = true);
(cljs.core._reduce["_"] = (function() {
var G__4306 = null;
var G__4306__4307 = (function (coll,f){
return cljs.core.seq_reduce.call(null,f,coll);
});
var G__4306__4308 = (function (coll,f,start){
return cljs.core.seq_reduce.call(null,f,start,coll);
});
G__4306 = function(coll,f,start){
switch(arguments.length){
case  2 :
return G__4306__4307.call(this,coll,f);
case  3 :
return G__4306__4308.call(this,coll,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4306;
})()
);
/**
* Returns the sum of nums. (+) returns 0.
* @param {...*} var_args
*/
cljs.core._PLUS_ = (function() {
var _PLUS_ = null;
var _PLUS___4310 = (function (){
return 0;
});
var _PLUS___4311 = (function (x){
return x;
});
var _PLUS___4312 = (function (x,y){
return (x + y);
});
var _PLUS___4313 = (function() { 
var G__4315__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_PLUS_,(x + y),more);
};
var G__4315 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4315__delegate.call(this, x, y, more);
};
G__4315.cljs$lang$maxFixedArity = 2;
G__4315.cljs$lang$applyTo = (function (arglist__4316){
var x = cljs.core.first(arglist__4316);
var y = cljs.core.first(cljs.core.next(arglist__4316));
var more = cljs.core.rest(cljs.core.next(arglist__4316));
return G__4315__delegate.call(this, x, y, more);
});
return G__4315;
})()
;
_PLUS_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  0 :
return _PLUS___4310.call(this);
case  1 :
return _PLUS___4311.call(this,x);
case  2 :
return _PLUS___4312.call(this,x,y);
default:
return _PLUS___4313.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_PLUS_.cljs$lang$maxFixedArity = 2;
_PLUS_.cljs$lang$applyTo = _PLUS___4313.cljs$lang$applyTo;
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
var ___4317 = (function (x){
return (- x);
});
var ___4318 = (function (x,y){
return (x - y);
});
var ___4319 = (function() { 
var G__4321__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_,(x - y),more);
};
var G__4321 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4321__delegate.call(this, x, y, more);
};
G__4321.cljs$lang$maxFixedArity = 2;
G__4321.cljs$lang$applyTo = (function (arglist__4322){
var x = cljs.core.first(arglist__4322);
var y = cljs.core.first(cljs.core.next(arglist__4322));
var more = cljs.core.rest(cljs.core.next(arglist__4322));
return G__4321__delegate.call(this, x, y, more);
});
return G__4321;
})()
;
_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return ___4317.call(this,x);
case  2 :
return ___4318.call(this,x,y);
default:
return ___4319.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_.cljs$lang$maxFixedArity = 2;
_.cljs$lang$applyTo = ___4319.cljs$lang$applyTo;
return _;
})()
;
/**
* Returns the product of nums. (*) returns 1.
* @param {...*} var_args
*/
cljs.core._STAR_ = (function() {
var _STAR_ = null;
var _STAR___4323 = (function (){
return 1;
});
var _STAR___4324 = (function (x){
return x;
});
var _STAR___4325 = (function (x,y){
return (x * y);
});
var _STAR___4326 = (function() { 
var G__4328__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_STAR_,(x * y),more);
};
var G__4328 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4328__delegate.call(this, x, y, more);
};
G__4328.cljs$lang$maxFixedArity = 2;
G__4328.cljs$lang$applyTo = (function (arglist__4329){
var x = cljs.core.first(arglist__4329);
var y = cljs.core.first(cljs.core.next(arglist__4329));
var more = cljs.core.rest(cljs.core.next(arglist__4329));
return G__4328__delegate.call(this, x, y, more);
});
return G__4328;
})()
;
_STAR_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  0 :
return _STAR___4323.call(this);
case  1 :
return _STAR___4324.call(this,x);
case  2 :
return _STAR___4325.call(this,x,y);
default:
return _STAR___4326.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_STAR_.cljs$lang$maxFixedArity = 2;
_STAR_.cljs$lang$applyTo = _STAR___4326.cljs$lang$applyTo;
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
var _SLASH___4330 = (function (x){
return _SLASH_.call(null,1,x);
});
var _SLASH___4331 = (function (x,y){
return (x / y);
});
var _SLASH___4332 = (function() { 
var G__4334__delegate = function (x,y,more){
return cljs.core.reduce.call(null,_SLASH_,_SLASH_.call(null,x,y),more);
};
var G__4334 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4334__delegate.call(this, x, y, more);
};
G__4334.cljs$lang$maxFixedArity = 2;
G__4334.cljs$lang$applyTo = (function (arglist__4335){
var x = cljs.core.first(arglist__4335);
var y = cljs.core.first(cljs.core.next(arglist__4335));
var more = cljs.core.rest(cljs.core.next(arglist__4335));
return G__4334__delegate.call(this, x, y, more);
});
return G__4334;
})()
;
_SLASH_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _SLASH___4330.call(this,x);
case  2 :
return _SLASH___4331.call(this,x,y);
default:
return _SLASH___4332.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_SLASH_.cljs$lang$maxFixedArity = 2;
_SLASH_.cljs$lang$applyTo = _SLASH___4332.cljs$lang$applyTo;
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
var _LT___4336 = (function (x){
return true;
});
var _LT___4337 = (function (x,y){
return (x < y);
});
var _LT___4338 = (function() { 
var G__4340__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x < y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__4341 = y;
var G__4342 = cljs.core.first.call(null,more);
var G__4343 = cljs.core.next.call(null,more);
x = G__4341;
y = G__4342;
more = G__4343;
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
var G__4340 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4340__delegate.call(this, x, y, more);
};
G__4340.cljs$lang$maxFixedArity = 2;
G__4340.cljs$lang$applyTo = (function (arglist__4344){
var x = cljs.core.first(arglist__4344);
var y = cljs.core.first(cljs.core.next(arglist__4344));
var more = cljs.core.rest(cljs.core.next(arglist__4344));
return G__4340__delegate.call(this, x, y, more);
});
return G__4340;
})()
;
_LT_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _LT___4336.call(this,x);
case  2 :
return _LT___4337.call(this,x,y);
default:
return _LT___4338.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_LT_.cljs$lang$maxFixedArity = 2;
_LT_.cljs$lang$applyTo = _LT___4338.cljs$lang$applyTo;
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
var _LT__EQ___4345 = (function (x){
return true;
});
var _LT__EQ___4346 = (function (x,y){
return (x <= y);
});
var _LT__EQ___4347 = (function() { 
var G__4349__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x <= y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__4350 = y;
var G__4351 = cljs.core.first.call(null,more);
var G__4352 = cljs.core.next.call(null,more);
x = G__4350;
y = G__4351;
more = G__4352;
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
var G__4349 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4349__delegate.call(this, x, y, more);
};
G__4349.cljs$lang$maxFixedArity = 2;
G__4349.cljs$lang$applyTo = (function (arglist__4353){
var x = cljs.core.first(arglist__4353);
var y = cljs.core.first(cljs.core.next(arglist__4353));
var more = cljs.core.rest(cljs.core.next(arglist__4353));
return G__4349__delegate.call(this, x, y, more);
});
return G__4349;
})()
;
_LT__EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _LT__EQ___4345.call(this,x);
case  2 :
return _LT__EQ___4346.call(this,x,y);
default:
return _LT__EQ___4347.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_LT__EQ_.cljs$lang$maxFixedArity = 2;
_LT__EQ_.cljs$lang$applyTo = _LT__EQ___4347.cljs$lang$applyTo;
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
var _GT___4354 = (function (x){
return true;
});
var _GT___4355 = (function (x,y){
return (x > y);
});
var _GT___4356 = (function() { 
var G__4358__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x > y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__4359 = y;
var G__4360 = cljs.core.first.call(null,more);
var G__4361 = cljs.core.next.call(null,more);
x = G__4359;
y = G__4360;
more = G__4361;
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
var G__4358 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4358__delegate.call(this, x, y, more);
};
G__4358.cljs$lang$maxFixedArity = 2;
G__4358.cljs$lang$applyTo = (function (arglist__4362){
var x = cljs.core.first(arglist__4362);
var y = cljs.core.first(cljs.core.next(arglist__4362));
var more = cljs.core.rest(cljs.core.next(arglist__4362));
return G__4358__delegate.call(this, x, y, more);
});
return G__4358;
})()
;
_GT_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _GT___4354.call(this,x);
case  2 :
return _GT___4355.call(this,x,y);
default:
return _GT___4356.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_GT_.cljs$lang$maxFixedArity = 2;
_GT_.cljs$lang$applyTo = _GT___4356.cljs$lang$applyTo;
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
var _GT__EQ___4363 = (function (x){
return true;
});
var _GT__EQ___4364 = (function (x,y){
return (x >= y);
});
var _GT__EQ___4365 = (function() { 
var G__4367__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_((x >= y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__4368 = y;
var G__4369 = cljs.core.first.call(null,more);
var G__4370 = cljs.core.next.call(null,more);
x = G__4368;
y = G__4369;
more = G__4370;
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
var G__4367 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4367__delegate.call(this, x, y, more);
};
G__4367.cljs$lang$maxFixedArity = 2;
G__4367.cljs$lang$applyTo = (function (arglist__4371){
var x = cljs.core.first(arglist__4371);
var y = cljs.core.first(cljs.core.next(arglist__4371));
var more = cljs.core.rest(cljs.core.next(arglist__4371));
return G__4367__delegate.call(this, x, y, more);
});
return G__4367;
})()
;
_GT__EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _GT__EQ___4363.call(this,x);
case  2 :
return _GT__EQ___4364.call(this,x,y);
default:
return _GT__EQ___4365.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_GT__EQ_.cljs$lang$maxFixedArity = 2;
_GT__EQ_.cljs$lang$applyTo = _GT__EQ___4365.cljs$lang$applyTo;
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
var max__4372 = (function (x){
return x;
});
var max__4373 = (function (x,y){
return ((x > y) ? x : y);
});
var max__4374 = (function() { 
var G__4376__delegate = function (x,y,more){
return cljs.core.reduce.call(null,max,((x > y) ? x : y),more);
};
var G__4376 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4376__delegate.call(this, x, y, more);
};
G__4376.cljs$lang$maxFixedArity = 2;
G__4376.cljs$lang$applyTo = (function (arglist__4377){
var x = cljs.core.first(arglist__4377);
var y = cljs.core.first(cljs.core.next(arglist__4377));
var more = cljs.core.rest(cljs.core.next(arglist__4377));
return G__4376__delegate.call(this, x, y, more);
});
return G__4376;
})()
;
max = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return max__4372.call(this,x);
case  2 :
return max__4373.call(this,x,y);
default:
return max__4374.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
max.cljs$lang$maxFixedArity = 2;
max.cljs$lang$applyTo = max__4374.cljs$lang$applyTo;
return max;
})()
;
/**
* Returns the least of the nums.
* @param {...*} var_args
*/
cljs.core.min = (function() {
var min = null;
var min__4378 = (function (x){
return x;
});
var min__4379 = (function (x,y){
return ((x < y) ? x : y);
});
var min__4380 = (function() { 
var G__4382__delegate = function (x,y,more){
return cljs.core.reduce.call(null,min,((x < y) ? x : y),more);
};
var G__4382 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4382__delegate.call(this, x, y, more);
};
G__4382.cljs$lang$maxFixedArity = 2;
G__4382.cljs$lang$applyTo = (function (arglist__4383){
var x = cljs.core.first(arglist__4383);
var y = cljs.core.first(cljs.core.next(arglist__4383));
var more = cljs.core.rest(cljs.core.next(arglist__4383));
return G__4382__delegate.call(this, x, y, more);
});
return G__4382;
})()
;
min = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return min__4378.call(this,x);
case  2 :
return min__4379.call(this,x,y);
default:
return min__4380.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
min.cljs$lang$maxFixedArity = 2;
min.cljs$lang$applyTo = min__4380.cljs$lang$applyTo;
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
var rem__4384 = (n % d);

return cljs.core.fix.call(null,((n - rem__4384) / d));
});
/**
* remainder of dividing numerator by denominator.
*/
cljs.core.rem = (function rem(n,d){
var q__4385 = cljs.core.quot.call(null,n,d);

return (n - (d * q__4385));
});
/**
* Returns a random floating point number between 0 (inclusive) and n (default 1) (exclusive).
*/
cljs.core.rand = (function() {
var rand = null;
var rand__4386 = (function (){
return Math.random.call(null);
});
var rand__4387 = (function (n){
return (n * rand.call(null));
});
rand = function(n){
switch(arguments.length){
case  0 :
return rand__4386.call(this);
case  1 :
return rand__4387.call(this,n);
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
var _EQ__EQ___4389 = (function (x){
return true;
});
var _EQ__EQ___4390 = (function (x,y){
return cljs.core._equiv.call(null,x,y);
});
var _EQ__EQ___4391 = (function() { 
var G__4393__delegate = function (x,y,more){
while(true){
if(cljs.core.truth_(_EQ__EQ_.call(null,x,y)))
{if(cljs.core.truth_(cljs.core.next.call(null,more)))
{{
var G__4394 = y;
var G__4395 = cljs.core.first.call(null,more);
var G__4396 = cljs.core.next.call(null,more);
x = G__4394;
y = G__4395;
more = G__4396;
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
var G__4393 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4393__delegate.call(this, x, y, more);
};
G__4393.cljs$lang$maxFixedArity = 2;
G__4393.cljs$lang$applyTo = (function (arglist__4397){
var x = cljs.core.first(arglist__4397);
var y = cljs.core.first(cljs.core.next(arglist__4397));
var more = cljs.core.rest(cljs.core.next(arglist__4397));
return G__4393__delegate.call(this, x, y, more);
});
return G__4393;
})()
;
_EQ__EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return _EQ__EQ___4389.call(this,x);
case  2 :
return _EQ__EQ___4390.call(this,x,y);
default:
return _EQ__EQ___4391.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
_EQ__EQ_.cljs$lang$maxFixedArity = 2;
_EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___4391.cljs$lang$applyTo;
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
var n__4398 = n;
var xs__4399 = cljs.core.seq.call(null,coll);

while(true){
if(cljs.core.truth_((function (){var and__3546__auto____4400 = xs__4399;

if(cljs.core.truth_(and__3546__auto____4400))
{return (n__4398 > 0);
} else
{return and__3546__auto____4400;
}
})()))
{{
var G__4401 = (n__4398 - 1);
var G__4402 = cljs.core.next.call(null,xs__4399);
n__4398 = G__4401;
xs__4399 = G__4402;
continue;
}
} else
{return xs__4399;
}
break;
}
});
(cljs.core.IIndexed["_"] = true);
(cljs.core._nth["_"] = (function() {
var G__4407 = null;
var G__4407__4408 = (function (coll,n){
var temp__3695__auto____4403 = cljs.core.nthnext.call(null,coll,n);

if(cljs.core.truth_(temp__3695__auto____4403))
{var xs__4404 = temp__3695__auto____4403;

return cljs.core.first.call(null,xs__4404);
} else
{throw (new Error("Index out of bounds"));
}
});
var G__4407__4409 = (function (coll,n,not_found){
var temp__3695__auto____4405 = cljs.core.nthnext.call(null,coll,n);

if(cljs.core.truth_(temp__3695__auto____4405))
{var xs__4406 = temp__3695__auto____4405;

return cljs.core.first.call(null,xs__4406);
} else
{return not_found;
}
});
G__4407 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__4407__4408.call(this,coll,n);
case  3 :
return G__4407__4409.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4407;
})()
);
/**
* Internal - do not use!
* @param {...*} var_args
*/
cljs.core.str_STAR_ = (function() {
var str_STAR_ = null;
var str_STAR___4411 = (function (){
return "";
});
var str_STAR___4412 = (function (x){
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
var str_STAR___4413 = (function() { 
var G__4415__delegate = function (x,ys){
return (function (sb,more){
while(true){
if(cljs.core.truth_(more))
{{
var G__4416 = sb.append(str_STAR_.call(null,cljs.core.first.call(null,more)));
var G__4417 = cljs.core.next.call(null,more);
sb = G__4416;
more = G__4417;
continue;
}
} else
{return str_STAR_.call(null,sb);
}
break;
}
}).call(null,(new goog.string.StringBuffer(str_STAR_.call(null,x))),ys);
};
var G__4415 = function (x,var_args){
var ys = null;
if (goog.isDef(var_args)) {
  ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__4415__delegate.call(this, x, ys);
};
G__4415.cljs$lang$maxFixedArity = 1;
G__4415.cljs$lang$applyTo = (function (arglist__4418){
var x = cljs.core.first(arglist__4418);
var ys = cljs.core.rest(arglist__4418);
return G__4415__delegate.call(this, x, ys);
});
return G__4415;
})()
;
str_STAR_ = function(x,var_args){
var ys = var_args;
switch(arguments.length){
case  0 :
return str_STAR___4411.call(this);
case  1 :
return str_STAR___4412.call(this,x);
default:
return str_STAR___4413.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
str_STAR_.cljs$lang$maxFixedArity = 1;
str_STAR_.cljs$lang$applyTo = str_STAR___4413.cljs$lang$applyTo;
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
var str__4419 = (function (){
return "";
});
var str__4420 = (function (x){
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
var str__4421 = (function() { 
var G__4423__delegate = function (x,ys){
return cljs.core.apply.call(null,cljs.core.str_STAR_,x,ys);
};
var G__4423 = function (x,var_args){
var ys = null;
if (goog.isDef(var_args)) {
  ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__4423__delegate.call(this, x, ys);
};
G__4423.cljs$lang$maxFixedArity = 1;
G__4423.cljs$lang$applyTo = (function (arglist__4424){
var x = cljs.core.first(arglist__4424);
var ys = cljs.core.rest(arglist__4424);
return G__4423__delegate.call(this, x, ys);
});
return G__4423;
})()
;
str = function(x,var_args){
var ys = var_args;
switch(arguments.length){
case  0 :
return str__4419.call(this);
case  1 :
return str__4420.call(this,x);
default:
return str__4421.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
str.cljs$lang$maxFixedArity = 1;
str.cljs$lang$applyTo = str__4421.cljs$lang$applyTo;
return str;
})()
;
/**
* Returns the substring of s beginning at start inclusive, and ending
* at end (defaults to length of string), exclusive.
*/
cljs.core.subs = (function() {
var subs = null;
var subs__4425 = (function (s,start){
return s.substring(start);
});
var subs__4426 = (function (s,start,end){
return s.substring(start,end);
});
subs = function(s,start,end){
switch(arguments.length){
case  2 :
return subs__4425.call(this,s,start);
case  3 :
return subs__4426.call(this,s,start,end);
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
var symbol__4428 = (function (name){
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
var symbol__4429 = (function (ns,name){
return symbol.call(null,cljs.core.str_STAR_.call(null,ns,"\/",name));
});
symbol = function(ns,name){
switch(arguments.length){
case  1 :
return symbol__4428.call(this,ns);
case  2 :
return symbol__4429.call(this,ns,name);
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
var keyword__4431 = (function (name){
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
var keyword__4432 = (function (ns,name){
return keyword.call(null,cljs.core.str_STAR_.call(null,ns,"\/",name));
});
keyword = function(ns,name){
switch(arguments.length){
case  1 :
return keyword__4431.call(this,ns);
case  2 :
return keyword__4432.call(this,ns,name);
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
return cljs.core.boolean$.call(null,(cljs.core.truth_(cljs.core.sequential_QMARK_.call(null,y))?(function (){var xs__4434 = cljs.core.seq.call(null,x);
var ys__4435 = cljs.core.seq.call(null,y);

while(true){
if(cljs.core.truth_((xs__4434 === null)))
{return (ys__4435 === null);
} else
{if(cljs.core.truth_((ys__4435 === null)))
{return false;
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.first.call(null,xs__4434),cljs.core.first.call(null,ys__4435))))
{{
var G__4436 = cljs.core.next.call(null,xs__4434);
var G__4437 = cljs.core.next.call(null,ys__4435);
xs__4434 = G__4436;
ys__4435 = G__4437;
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
return cljs.core.reduce.call(null,(function (p1__4438_SHARP_,p2__4439_SHARP_){
return cljs.core.hash_combine.call(null,p1__4438_SHARP_,cljs.core.hash.call(null,p2__4439_SHARP_));
}),cljs.core.hash.call(null,cljs.core.first.call(null,coll)),cljs.core.next.call(null,coll));
});
/**
* Takes a JavaScript object and a map of names to functions and
* attaches said functions as methods on the object.  Any references to
* JavaScript's implict this (via the this-as macro) will resolve to the
* object that the function is attached.
*/
cljs.core.extend_object_BANG_ = (function extend_object_BANG_(obj,fn_map){
var G__4440__4441 = cljs.core.seq.call(null,fn_map);

if(cljs.core.truth_(G__4440__4441))
{var G__4443__4445 = cljs.core.first.call(null,G__4440__4441);
var vec__4444__4446 = G__4443__4445;
var key_name__4447 = cljs.core.nth.call(null,vec__4444__4446,0,null);
var f__4448 = cljs.core.nth.call(null,vec__4444__4446,1,null);
var G__4440__4449 = G__4440__4441;

var G__4443__4450 = G__4443__4445;
var G__4440__4451 = G__4440__4449;

while(true){
var vec__4452__4453 = G__4443__4450;
var key_name__4454 = cljs.core.nth.call(null,vec__4452__4453,0,null);
var f__4455 = cljs.core.nth.call(null,vec__4452__4453,1,null);
var G__4440__4456 = G__4440__4451;

var str_name__4457 = cljs.core.name.call(null,key_name__4454);

obj[str_name__4457] = f__4455;
var temp__3698__auto____4458 = cljs.core.next.call(null,G__4440__4456);

if(cljs.core.truth_(temp__3698__auto____4458))
{var G__4440__4459 = temp__3698__auto____4458;

{
var G__4460 = cljs.core.first.call(null,G__4440__4459);
var G__4461 = G__4440__4459;
G__4443__4450 = G__4460;
G__4440__4451 = G__4461;
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
cljs.core.List.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.List");
});
cljs.core.List.prototype.cljs$core$IHash$ = true;
cljs.core.List.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4462 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4463 = this;
return (new cljs.core.List(this__4463.meta,o,coll,(this__4463.count + 1)));
});
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4464 = this;
return coll;
});
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4465 = this;
return this__4465.count;
});
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4466 = this;
return this__4466.first;
});
cljs.core.List.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4467 = this;
return cljs.core._rest.call(null,coll);
});
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = (function (coll){
var this__4468 = this;
return this__4468.first;
});
cljs.core.List.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__4469 = this;
return this__4469.rest;
});
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4470 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4471 = this;
return (new cljs.core.List(meta,this__4471.first,this__4471.rest,this__4471.count));
});
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4472 = this;
return this__4472.meta;
});
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4473 = this;
return cljs.core.List.EMPTY;
});
cljs.core.List;

/**
* @constructor
*/
cljs.core.EmptyList = (function (meta){
this.meta = meta;
})
cljs.core.EmptyList.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.EmptyList");
});
cljs.core.EmptyList.prototype.cljs$core$IHash$ = true;
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4474 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4475 = this;
return (new cljs.core.List(this__4475.meta,o,null,1));
});
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4476 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4477 = this;
return 0;
});
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4478 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4479 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = (function (coll){
var this__4480 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__4481 = this;
return null;
});
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4482 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4483 = this;
return (new cljs.core.EmptyList(meta));
});
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4484 = this;
return this__4484.meta;
});
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4485 = this;
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
list.cljs$lang$applyTo = (function (arglist__4486){
var items = cljs.core.seq( arglist__4486 );;
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
cljs.core.Cons.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Cons");
});
cljs.core.Cons.prototype.cljs$core$ISeqable$ = true;
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4487 = this;
return coll;
});
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4488 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4489 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4490 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__4490.meta);
});
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4491 = this;
return (new cljs.core.Cons(null,o,coll));
});
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = (function (coll){
var this__4492 = this;
return this__4492.first;
});
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__4493 = this;
if(cljs.core.truth_((this__4493.rest === null)))
{return cljs.core.List.EMPTY;
} else
{return this__4493.rest;
}
});
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4494 = this;
return this__4494.meta;
});
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4495 = this;
return (new cljs.core.Cons(meta,this__4495.first,this__4495.rest));
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
var G__4496 = null;
var G__4496__4497 = (function (string,f){
return cljs.core.ci_reduce.call(null,string,f);
});
var G__4496__4498 = (function (string,f,start){
return cljs.core.ci_reduce.call(null,string,f,start);
});
G__4496 = function(string,f,start){
switch(arguments.length){
case  2 :
return G__4496__4497.call(this,string,f);
case  3 :
return G__4496__4498.call(this,string,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4496;
})()
);
(cljs.core.ILookup["string"] = true);
(cljs.core._lookup["string"] = (function() {
var G__4500 = null;
var G__4500__4501 = (function (string,k){
return cljs.core._nth.call(null,string,k);
});
var G__4500__4502 = (function (string,k,not_found){
return cljs.core._nth.call(null,string,k,not_found);
});
G__4500 = function(string,k,not_found){
switch(arguments.length){
case  2 :
return G__4500__4501.call(this,string,k);
case  3 :
return G__4500__4502.call(this,string,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4500;
})()
);
(cljs.core.IIndexed["string"] = true);
(cljs.core._nth["string"] = (function() {
var G__4504 = null;
var G__4504__4505 = (function (string,n){
if(cljs.core.truth_((n < cljs.core._count.call(null,string))))
{return string.charAt(n);
} else
{return null;
}
});
var G__4504__4506 = (function (string,n,not_found){
if(cljs.core.truth_((n < cljs.core._count.call(null,string))))
{return string.charAt(n);
} else
{return not_found;
}
});
G__4504 = function(string,n,not_found){
switch(arguments.length){
case  2 :
return G__4504__4505.call(this,string,n);
case  3 :
return G__4504__4506.call(this,string,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4504;
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
var G__4514 = null;
var G__4514__4515 = (function (tsym4508,coll){
var tsym4508__4510 = this;

var this$__4511 = tsym4508__4510;

return cljs.core.get.call(null,coll,this$__4511.toString());
});
var G__4514__4516 = (function (tsym4509,coll,not_found){
var tsym4509__4512 = this;

var this$__4513 = tsym4509__4512;

return cljs.core.get.call(null,coll,this$__4513.toString(),not_found);
});
G__4514 = function(tsym4509,coll,not_found){
switch(arguments.length){
case  2 :
return G__4514__4515.call(this,tsym4509,coll);
case  3 :
return G__4514__4516.call(this,tsym4509,coll,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4514;
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
var x__4518 = lazy_seq.x;

if(cljs.core.truth_(lazy_seq.realized))
{return x__4518;
} else
{lazy_seq.x = x__4518.call(null);
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
cljs.core.LazySeq.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.LazySeq");
});
cljs.core.LazySeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4519 = this;
return cljs.core.seq.call(null,cljs.core.lazy_seq_value.call(null,coll));
});
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4520 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4521 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4522 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__4522.meta);
});
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4523 = this;
return cljs.core.cons.call(null,o,coll);
});
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = (function (coll){
var this__4524 = this;
return cljs.core.first.call(null,cljs.core.lazy_seq_value.call(null,coll));
});
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__4525 = this;
return cljs.core.rest.call(null,cljs.core.lazy_seq_value.call(null,coll));
});
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4526 = this;
return this__4526.meta;
});
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4527 = this;
return (new cljs.core.LazySeq(meta,this__4527.realized,this__4527.x));
});
cljs.core.LazySeq;
/**
* Naive impl of to-array as a start.
*/
cljs.core.to_array = (function to_array(s){
var ary__4528 = cljs.core.array.call(null);

var s__4529 = s;

while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,s__4529)))
{ary__4528.push(cljs.core.first.call(null,s__4529));
{
var G__4530 = cljs.core.next.call(null,s__4529);
s__4529 = G__4530;
continue;
}
} else
{return ary__4528;
}
break;
}
});
cljs.core.bounded_count = (function bounded_count(s,n){
var s__4531 = s;
var i__4532 = n;
var sum__4533 = 0;

while(true){
if(cljs.core.truth_((function (){var and__3546__auto____4534 = (i__4532 > 0);

if(cljs.core.truth_(and__3546__auto____4534))
{return cljs.core.seq.call(null,s__4531);
} else
{return and__3546__auto____4534;
}
})()))
{{
var G__4535 = cljs.core.next.call(null,s__4531);
var G__4536 = (i__4532 - 1);
var G__4537 = (sum__4533 + 1);
s__4531 = G__4535;
i__4532 = G__4536;
sum__4533 = G__4537;
continue;
}
} else
{return sum__4533;
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
var concat__4541 = (function (){
return (new cljs.core.LazySeq(null,false,(function (){
return null;
})));
});
var concat__4542 = (function (x){
return (new cljs.core.LazySeq(null,false,(function (){
return x;
})));
});
var concat__4543 = (function (x,y){
return (new cljs.core.LazySeq(null,false,(function (){
var s__4538 = cljs.core.seq.call(null,x);

if(cljs.core.truth_(s__4538))
{return cljs.core.cons.call(null,cljs.core.first.call(null,s__4538),concat.call(null,cljs.core.rest.call(null,s__4538),y));
} else
{return y;
}
})));
});
var concat__4544 = (function() { 
var G__4546__delegate = function (x,y,zs){
var cat__4540 = (function cat(xys,zs){
return (new cljs.core.LazySeq(null,false,(function (){
var xys__4539 = cljs.core.seq.call(null,xys);

if(cljs.core.truth_(xys__4539))
{return cljs.core.cons.call(null,cljs.core.first.call(null,xys__4539),cat.call(null,cljs.core.rest.call(null,xys__4539),zs));
} else
{if(cljs.core.truth_(zs))
{return cat.call(null,cljs.core.first.call(null,zs),cljs.core.next.call(null,zs));
} else
{return null;
}
}
})));
});

return cat__4540.call(null,concat.call(null,x,y),zs);
};
var G__4546 = function (x,y,var_args){
var zs = null;
if (goog.isDef(var_args)) {
  zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4546__delegate.call(this, x, y, zs);
};
G__4546.cljs$lang$maxFixedArity = 2;
G__4546.cljs$lang$applyTo = (function (arglist__4547){
var x = cljs.core.first(arglist__4547);
var y = cljs.core.first(cljs.core.next(arglist__4547));
var zs = cljs.core.rest(cljs.core.next(arglist__4547));
return G__4546__delegate.call(this, x, y, zs);
});
return G__4546;
})()
;
concat = function(x,y,var_args){
var zs = var_args;
switch(arguments.length){
case  0 :
return concat__4541.call(this);
case  1 :
return concat__4542.call(this,x);
case  2 :
return concat__4543.call(this,x,y);
default:
return concat__4544.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
concat.cljs$lang$maxFixedArity = 2;
concat.cljs$lang$applyTo = concat__4544.cljs$lang$applyTo;
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
var list_STAR___4548 = (function (args){
return cljs.core.seq.call(null,args);
});
var list_STAR___4549 = (function (a,args){
return cljs.core.cons.call(null,a,args);
});
var list_STAR___4550 = (function (a,b,args){
return cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,args));
});
var list_STAR___4551 = (function (a,b,c,args){
return cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,cljs.core.cons.call(null,c,args)));
});
var list_STAR___4552 = (function() { 
var G__4554__delegate = function (a,b,c,d,more){
return cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,cljs.core.cons.call(null,c,cljs.core.cons.call(null,d,cljs.core.spread.call(null,more)))));
};
var G__4554 = function (a,b,c,d,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4),0);
} 
return G__4554__delegate.call(this, a, b, c, d, more);
};
G__4554.cljs$lang$maxFixedArity = 4;
G__4554.cljs$lang$applyTo = (function (arglist__4555){
var a = cljs.core.first(arglist__4555);
var b = cljs.core.first(cljs.core.next(arglist__4555));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4555)));
var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4555))));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4555))));
return G__4554__delegate.call(this, a, b, c, d, more);
});
return G__4554;
})()
;
list_STAR_ = function(a,b,c,d,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return list_STAR___4548.call(this,a);
case  2 :
return list_STAR___4549.call(this,a,b);
case  3 :
return list_STAR___4550.call(this,a,b,c);
case  4 :
return list_STAR___4551.call(this,a,b,c,d);
default:
return list_STAR___4552.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
list_STAR_.cljs$lang$maxFixedArity = 4;
list_STAR_.cljs$lang$applyTo = list_STAR___4552.cljs$lang$applyTo;
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
var apply__4565 = (function (f,args){
var fixed_arity__4556 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,args,(fixed_arity__4556 + 1)) <= fixed_arity__4556)))
{return f.apply(f,cljs.core.to_array.call(null,args));
} else
{return f.cljs$lang$applyTo(args);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,args));
}
});
var apply__4566 = (function (f,x,args){
var arglist__4557 = cljs.core.list_STAR_.call(null,x,args);
var fixed_arity__4558 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__4557,fixed_arity__4558) <= fixed_arity__4558)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__4557));
} else
{return f.cljs$lang$applyTo(arglist__4557);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__4557));
}
});
var apply__4567 = (function (f,x,y,args){
var arglist__4559 = cljs.core.list_STAR_.call(null,x,y,args);
var fixed_arity__4560 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__4559,fixed_arity__4560) <= fixed_arity__4560)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__4559));
} else
{return f.cljs$lang$applyTo(arglist__4559);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__4559));
}
});
var apply__4568 = (function (f,x,y,z,args){
var arglist__4561 = cljs.core.list_STAR_.call(null,x,y,z,args);
var fixed_arity__4562 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__4561,fixed_arity__4562) <= fixed_arity__4562)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__4561));
} else
{return f.cljs$lang$applyTo(arglist__4561);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__4561));
}
});
var apply__4569 = (function() { 
var G__4571__delegate = function (f,a,b,c,d,args){
var arglist__4563 = cljs.core.cons.call(null,a,cljs.core.cons.call(null,b,cljs.core.cons.call(null,c,cljs.core.cons.call(null,d,cljs.core.spread.call(null,args)))));
var fixed_arity__4564 = f.cljs$lang$maxFixedArity;

if(cljs.core.truth_(f.cljs$lang$applyTo))
{if(cljs.core.truth_((cljs.core.bounded_count.call(null,arglist__4563,fixed_arity__4564) <= fixed_arity__4564)))
{return f.apply(f,cljs.core.to_array.call(null,arglist__4563));
} else
{return f.cljs$lang$applyTo(arglist__4563);
}
} else
{return f.apply(f,cljs.core.to_array.call(null,arglist__4563));
}
};
var G__4571 = function (f,a,b,c,d,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5),0);
} 
return G__4571__delegate.call(this, f, a, b, c, d, args);
};
G__4571.cljs$lang$maxFixedArity = 5;
G__4571.cljs$lang$applyTo = (function (arglist__4572){
var f = cljs.core.first(arglist__4572);
var a = cljs.core.first(cljs.core.next(arglist__4572));
var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4572)));
var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4572))));
var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4572)))));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4572)))));
return G__4571__delegate.call(this, f, a, b, c, d, args);
});
return G__4571;
})()
;
apply = function(f,a,b,c,d,var_args){
var args = var_args;
switch(arguments.length){
case  2 :
return apply__4565.call(this,f,a);
case  3 :
return apply__4566.call(this,f,a,b);
case  4 :
return apply__4567.call(this,f,a,b,c);
case  5 :
return apply__4568.call(this,f,a,b,c,d);
default:
return apply__4569.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
apply.cljs$lang$maxFixedArity = 5;
apply.cljs$lang$applyTo = apply__4569.cljs$lang$applyTo;
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
vary_meta.cljs$lang$applyTo = (function (arglist__4573){
var obj = cljs.core.first(arglist__4573);
var f = cljs.core.first(cljs.core.next(arglist__4573));
var args = cljs.core.rest(cljs.core.next(arglist__4573));
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
var not_EQ___4574 = (function (x){
return false;
});
var not_EQ___4575 = (function (x,y){
return cljs.core.not.call(null,cljs.core._EQ_.call(null,x,y));
});
var not_EQ___4576 = (function() { 
var G__4578__delegate = function (x,y,more){
return cljs.core.not.call(null,cljs.core.apply.call(null,cljs.core._EQ_,x,y,more));
};
var G__4578 = function (x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4578__delegate.call(this, x, y, more);
};
G__4578.cljs$lang$maxFixedArity = 2;
G__4578.cljs$lang$applyTo = (function (arglist__4579){
var x = cljs.core.first(arglist__4579);
var y = cljs.core.first(cljs.core.next(arglist__4579));
var more = cljs.core.rest(cljs.core.next(arglist__4579));
return G__4578__delegate.call(this, x, y, more);
});
return G__4578;
})()
;
not_EQ_ = function(x,y,var_args){
var more = var_args;
switch(arguments.length){
case  1 :
return not_EQ___4574.call(this,x);
case  2 :
return not_EQ___4575.call(this,x,y);
default:
return not_EQ___4576.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
not_EQ_.cljs$lang$maxFixedArity = 2;
not_EQ_.cljs$lang$applyTo = not_EQ___4576.cljs$lang$applyTo;
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
var G__4580 = pred;
var G__4581 = cljs.core.next.call(null,coll);
pred = G__4580;
coll = G__4581;
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
{var or__3548__auto____4582 = pred.call(null,cljs.core.first.call(null,coll));

if(cljs.core.truth_(or__3548__auto____4582))
{return or__3548__auto____4582;
} else
{{
var G__4583 = pred;
var G__4584 = cljs.core.next.call(null,coll);
pred = G__4583;
coll = G__4584;
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
var G__4585 = null;
var G__4585__4586 = (function (){
return cljs.core.not.call(null,f.call(null));
});
var G__4585__4587 = (function (x){
return cljs.core.not.call(null,f.call(null,x));
});
var G__4585__4588 = (function (x,y){
return cljs.core.not.call(null,f.call(null,x,y));
});
var G__4585__4589 = (function() { 
var G__4591__delegate = function (x,y,zs){
return cljs.core.not.call(null,cljs.core.apply.call(null,f,x,y,zs));
};
var G__4591 = function (x,y,var_args){
var zs = null;
if (goog.isDef(var_args)) {
  zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4591__delegate.call(this, x, y, zs);
};
G__4591.cljs$lang$maxFixedArity = 2;
G__4591.cljs$lang$applyTo = (function (arglist__4592){
var x = cljs.core.first(arglist__4592);
var y = cljs.core.first(cljs.core.next(arglist__4592));
var zs = cljs.core.rest(cljs.core.next(arglist__4592));
return G__4591__delegate.call(this, x, y, zs);
});
return G__4591;
})()
;
G__4585 = function(x,y,var_args){
var zs = var_args;
switch(arguments.length){
case  0 :
return G__4585__4586.call(this);
case  1 :
return G__4585__4587.call(this,x);
case  2 :
return G__4585__4588.call(this,x,y);
default:
return G__4585__4589.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4585.cljs$lang$maxFixedArity = 2;
G__4585.cljs$lang$applyTo = G__4585__4589.cljs$lang$applyTo;
return G__4585;
})()
});
/**
* Returns a function that takes any number of arguments and returns x.
*/
cljs.core.constantly = (function constantly(x){
return (function() { 
var G__4593__delegate = function (args){
return x;
};
var G__4593 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4593__delegate.call(this, args);
};
G__4593.cljs$lang$maxFixedArity = 0;
G__4593.cljs$lang$applyTo = (function (arglist__4594){
var args = cljs.core.seq( arglist__4594 );;
return G__4593__delegate.call(this, args);
});
return G__4593;
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
var comp__4598 = (function (){
return cljs.core.identity;
});
var comp__4599 = (function (f){
return f;
});
var comp__4600 = (function (f,g){
return (function() {
var G__4604 = null;
var G__4604__4605 = (function (){
return f.call(null,g.call(null));
});
var G__4604__4606 = (function (x){
return f.call(null,g.call(null,x));
});
var G__4604__4607 = (function (x,y){
return f.call(null,g.call(null,x,y));
});
var G__4604__4608 = (function (x,y,z){
return f.call(null,g.call(null,x,y,z));
});
var G__4604__4609 = (function() { 
var G__4611__delegate = function (x,y,z,args){
return f.call(null,cljs.core.apply.call(null,g,x,y,z,args));
};
var G__4611 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4611__delegate.call(this, x, y, z, args);
};
G__4611.cljs$lang$maxFixedArity = 3;
G__4611.cljs$lang$applyTo = (function (arglist__4612){
var x = cljs.core.first(arglist__4612);
var y = cljs.core.first(cljs.core.next(arglist__4612));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4612)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4612)));
return G__4611__delegate.call(this, x, y, z, args);
});
return G__4611;
})()
;
G__4604 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__4604__4605.call(this);
case  1 :
return G__4604__4606.call(this,x);
case  2 :
return G__4604__4607.call(this,x,y);
case  3 :
return G__4604__4608.call(this,x,y,z);
default:
return G__4604__4609.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4604.cljs$lang$maxFixedArity = 3;
G__4604.cljs$lang$applyTo = G__4604__4609.cljs$lang$applyTo;
return G__4604;
})()
});
var comp__4601 = (function (f,g,h){
return (function() {
var G__4613 = null;
var G__4613__4614 = (function (){
return f.call(null,g.call(null,h.call(null)));
});
var G__4613__4615 = (function (x){
return f.call(null,g.call(null,h.call(null,x)));
});
var G__4613__4616 = (function (x,y){
return f.call(null,g.call(null,h.call(null,x,y)));
});
var G__4613__4617 = (function (x,y,z){
return f.call(null,g.call(null,h.call(null,x,y,z)));
});
var G__4613__4618 = (function() { 
var G__4620__delegate = function (x,y,z,args){
return f.call(null,g.call(null,cljs.core.apply.call(null,h,x,y,z,args)));
};
var G__4620 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4620__delegate.call(this, x, y, z, args);
};
G__4620.cljs$lang$maxFixedArity = 3;
G__4620.cljs$lang$applyTo = (function (arglist__4621){
var x = cljs.core.first(arglist__4621);
var y = cljs.core.first(cljs.core.next(arglist__4621));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4621)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4621)));
return G__4620__delegate.call(this, x, y, z, args);
});
return G__4620;
})()
;
G__4613 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__4613__4614.call(this);
case  1 :
return G__4613__4615.call(this,x);
case  2 :
return G__4613__4616.call(this,x,y);
case  3 :
return G__4613__4617.call(this,x,y,z);
default:
return G__4613__4618.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4613.cljs$lang$maxFixedArity = 3;
G__4613.cljs$lang$applyTo = G__4613__4618.cljs$lang$applyTo;
return G__4613;
})()
});
var comp__4602 = (function() { 
var G__4622__delegate = function (f1,f2,f3,fs){
var fs__4595 = cljs.core.reverse.call(null,cljs.core.list_STAR_.call(null,f1,f2,f3,fs));

return (function() { 
var G__4623__delegate = function (args){
var ret__4596 = cljs.core.apply.call(null,cljs.core.first.call(null,fs__4595),args);
var fs__4597 = cljs.core.next.call(null,fs__4595);

while(true){
if(cljs.core.truth_(fs__4597))
{{
var G__4624 = cljs.core.first.call(null,fs__4597).call(null,ret__4596);
var G__4625 = cljs.core.next.call(null,fs__4597);
ret__4596 = G__4624;
fs__4597 = G__4625;
continue;
}
} else
{return ret__4596;
}
break;
}
};
var G__4623 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4623__delegate.call(this, args);
};
G__4623.cljs$lang$maxFixedArity = 0;
G__4623.cljs$lang$applyTo = (function (arglist__4626){
var args = cljs.core.seq( arglist__4626 );;
return G__4623__delegate.call(this, args);
});
return G__4623;
})()
;
};
var G__4622 = function (f1,f2,f3,var_args){
var fs = null;
if (goog.isDef(var_args)) {
  fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4622__delegate.call(this, f1, f2, f3, fs);
};
G__4622.cljs$lang$maxFixedArity = 3;
G__4622.cljs$lang$applyTo = (function (arglist__4627){
var f1 = cljs.core.first(arglist__4627);
var f2 = cljs.core.first(cljs.core.next(arglist__4627));
var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4627)));
var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4627)));
return G__4622__delegate.call(this, f1, f2, f3, fs);
});
return G__4622;
})()
;
comp = function(f1,f2,f3,var_args){
var fs = var_args;
switch(arguments.length){
case  0 :
return comp__4598.call(this);
case  1 :
return comp__4599.call(this,f1);
case  2 :
return comp__4600.call(this,f1,f2);
case  3 :
return comp__4601.call(this,f1,f2,f3);
default:
return comp__4602.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
comp.cljs$lang$maxFixedArity = 3;
comp.cljs$lang$applyTo = comp__4602.cljs$lang$applyTo;
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
var partial__4628 = (function (f,arg1){
return (function() { 
var G__4633__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,args);
};
var G__4633 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4633__delegate.call(this, args);
};
G__4633.cljs$lang$maxFixedArity = 0;
G__4633.cljs$lang$applyTo = (function (arglist__4634){
var args = cljs.core.seq( arglist__4634 );;
return G__4633__delegate.call(this, args);
});
return G__4633;
})()
;
});
var partial__4629 = (function (f,arg1,arg2){
return (function() { 
var G__4635__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,arg2,args);
};
var G__4635 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4635__delegate.call(this, args);
};
G__4635.cljs$lang$maxFixedArity = 0;
G__4635.cljs$lang$applyTo = (function (arglist__4636){
var args = cljs.core.seq( arglist__4636 );;
return G__4635__delegate.call(this, args);
});
return G__4635;
})()
;
});
var partial__4630 = (function (f,arg1,arg2,arg3){
return (function() { 
var G__4637__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,arg2,arg3,args);
};
var G__4637 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4637__delegate.call(this, args);
};
G__4637.cljs$lang$maxFixedArity = 0;
G__4637.cljs$lang$applyTo = (function (arglist__4638){
var args = cljs.core.seq( arglist__4638 );;
return G__4637__delegate.call(this, args);
});
return G__4637;
})()
;
});
var partial__4631 = (function() { 
var G__4639__delegate = function (f,arg1,arg2,arg3,more){
return (function() { 
var G__4640__delegate = function (args){
return cljs.core.apply.call(null,f,arg1,arg2,arg3,cljs.core.concat.call(null,more,args));
};
var G__4640 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__4640__delegate.call(this, args);
};
G__4640.cljs$lang$maxFixedArity = 0;
G__4640.cljs$lang$applyTo = (function (arglist__4641){
var args = cljs.core.seq( arglist__4641 );;
return G__4640__delegate.call(this, args);
});
return G__4640;
})()
;
};
var G__4639 = function (f,arg1,arg2,arg3,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4),0);
} 
return G__4639__delegate.call(this, f, arg1, arg2, arg3, more);
};
G__4639.cljs$lang$maxFixedArity = 4;
G__4639.cljs$lang$applyTo = (function (arglist__4642){
var f = cljs.core.first(arglist__4642);
var arg1 = cljs.core.first(cljs.core.next(arglist__4642));
var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4642)));
var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4642))));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4642))));
return G__4639__delegate.call(this, f, arg1, arg2, arg3, more);
});
return G__4639;
})()
;
partial = function(f,arg1,arg2,arg3,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return partial__4628.call(this,f,arg1);
case  3 :
return partial__4629.call(this,f,arg1,arg2);
case  4 :
return partial__4630.call(this,f,arg1,arg2,arg3);
default:
return partial__4631.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
partial.cljs$lang$maxFixedArity = 4;
partial.cljs$lang$applyTo = partial__4631.cljs$lang$applyTo;
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
var fnil__4643 = (function (f,x){
return (function() {
var G__4647 = null;
var G__4647__4648 = (function (a){
return f.call(null,(cljs.core.truth_((a === null))?x:a));
});
var G__4647__4649 = (function (a,b){
return f.call(null,(cljs.core.truth_((a === null))?x:a),b);
});
var G__4647__4650 = (function (a,b,c){
return f.call(null,(cljs.core.truth_((a === null))?x:a),b,c);
});
var G__4647__4651 = (function() { 
var G__4653__delegate = function (a,b,c,ds){
return cljs.core.apply.call(null,f,(cljs.core.truth_((a === null))?x:a),b,c,ds);
};
var G__4653 = function (a,b,c,var_args){
var ds = null;
if (goog.isDef(var_args)) {
  ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4653__delegate.call(this, a, b, c, ds);
};
G__4653.cljs$lang$maxFixedArity = 3;
G__4653.cljs$lang$applyTo = (function (arglist__4654){
var a = cljs.core.first(arglist__4654);
var b = cljs.core.first(cljs.core.next(arglist__4654));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4654)));
var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4654)));
return G__4653__delegate.call(this, a, b, c, ds);
});
return G__4653;
})()
;
G__4647 = function(a,b,c,var_args){
var ds = var_args;
switch(arguments.length){
case  1 :
return G__4647__4648.call(this,a);
case  2 :
return G__4647__4649.call(this,a,b);
case  3 :
return G__4647__4650.call(this,a,b,c);
default:
return G__4647__4651.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4647.cljs$lang$maxFixedArity = 3;
G__4647.cljs$lang$applyTo = G__4647__4651.cljs$lang$applyTo;
return G__4647;
})()
});
var fnil__4644 = (function (f,x,y){
return (function() {
var G__4655 = null;
var G__4655__4656 = (function (a,b){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b));
});
var G__4655__4657 = (function (a,b,c){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),c);
});
var G__4655__4658 = (function() { 
var G__4660__delegate = function (a,b,c,ds){
return cljs.core.apply.call(null,f,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),c,ds);
};
var G__4660 = function (a,b,c,var_args){
var ds = null;
if (goog.isDef(var_args)) {
  ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4660__delegate.call(this, a, b, c, ds);
};
G__4660.cljs$lang$maxFixedArity = 3;
G__4660.cljs$lang$applyTo = (function (arglist__4661){
var a = cljs.core.first(arglist__4661);
var b = cljs.core.first(cljs.core.next(arglist__4661));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4661)));
var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4661)));
return G__4660__delegate.call(this, a, b, c, ds);
});
return G__4660;
})()
;
G__4655 = function(a,b,c,var_args){
var ds = var_args;
switch(arguments.length){
case  2 :
return G__4655__4656.call(this,a,b);
case  3 :
return G__4655__4657.call(this,a,b,c);
default:
return G__4655__4658.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4655.cljs$lang$maxFixedArity = 3;
G__4655.cljs$lang$applyTo = G__4655__4658.cljs$lang$applyTo;
return G__4655;
})()
});
var fnil__4645 = (function (f,x,y,z){
return (function() {
var G__4662 = null;
var G__4662__4663 = (function (a,b){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b));
});
var G__4662__4664 = (function (a,b,c){
return f.call(null,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),(cljs.core.truth_((c === null))?z:c));
});
var G__4662__4665 = (function() { 
var G__4667__delegate = function (a,b,c,ds){
return cljs.core.apply.call(null,f,(cljs.core.truth_((a === null))?x:a),(cljs.core.truth_((b === null))?y:b),(cljs.core.truth_((c === null))?z:c),ds);
};
var G__4667 = function (a,b,c,var_args){
var ds = null;
if (goog.isDef(var_args)) {
  ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4667__delegate.call(this, a, b, c, ds);
};
G__4667.cljs$lang$maxFixedArity = 3;
G__4667.cljs$lang$applyTo = (function (arglist__4668){
var a = cljs.core.first(arglist__4668);
var b = cljs.core.first(cljs.core.next(arglist__4668));
var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4668)));
var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4668)));
return G__4667__delegate.call(this, a, b, c, ds);
});
return G__4667;
})()
;
G__4662 = function(a,b,c,var_args){
var ds = var_args;
switch(arguments.length){
case  2 :
return G__4662__4663.call(this,a,b);
case  3 :
return G__4662__4664.call(this,a,b,c);
default:
return G__4662__4665.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__4662.cljs$lang$maxFixedArity = 3;
G__4662.cljs$lang$applyTo = G__4662__4665.cljs$lang$applyTo;
return G__4662;
})()
});
fnil = function(f,x,y,z){
switch(arguments.length){
case  2 :
return fnil__4643.call(this,f,x);
case  3 :
return fnil__4644.call(this,f,x,y);
case  4 :
return fnil__4645.call(this,f,x,y,z);
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
var mapi__4671 = (function mpi(idx,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4669 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4669))
{var s__4670 = temp__3698__auto____4669;

return cljs.core.cons.call(null,f.call(null,idx,cljs.core.first.call(null,s__4670)),mpi.call(null,(idx + 1),cljs.core.rest.call(null,s__4670)));
} else
{return null;
}
})));
});

return mapi__4671.call(null,0,coll);
});
/**
* Returns a lazy sequence of the non-nil results of (f item). Note,
* this means false return values will be included.  f must be free of
* side-effects.
*/
cljs.core.keep = (function keep(f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4672 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4672))
{var s__4673 = temp__3698__auto____4672;

var x__4674 = f.call(null,cljs.core.first.call(null,s__4673));

if(cljs.core.truth_((x__4674 === null)))
{return keep.call(null,f,cljs.core.rest.call(null,s__4673));
} else
{return cljs.core.cons.call(null,x__4674,keep.call(null,f,cljs.core.rest.call(null,s__4673)));
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
var keepi__4684 = (function kpi(idx,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4681 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4681))
{var s__4682 = temp__3698__auto____4681;

var x__4683 = f.call(null,idx,cljs.core.first.call(null,s__4682));

if(cljs.core.truth_((x__4683 === null)))
{return kpi.call(null,(idx + 1),cljs.core.rest.call(null,s__4682));
} else
{return cljs.core.cons.call(null,x__4683,kpi.call(null,(idx + 1),cljs.core.rest.call(null,s__4682)));
}
} else
{return null;
}
})));
});

return keepi__4684.call(null,0,coll);
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
var every_pred__4729 = (function (p){
return (function() {
var ep1 = null;
var ep1__4734 = (function (){
return true;
});
var ep1__4735 = (function (x){
return cljs.core.boolean$.call(null,p.call(null,x));
});
var ep1__4736 = (function (x,y){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4691 = p.call(null,x);

if(cljs.core.truth_(and__3546__auto____4691))
{return p.call(null,y);
} else
{return and__3546__auto____4691;
}
})());
});
var ep1__4737 = (function (x,y,z){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4692 = p.call(null,x);

if(cljs.core.truth_(and__3546__auto____4692))
{var and__3546__auto____4693 = p.call(null,y);

if(cljs.core.truth_(and__3546__auto____4693))
{return p.call(null,z);
} else
{return and__3546__auto____4693;
}
} else
{return and__3546__auto____4692;
}
})());
});
var ep1__4738 = (function() { 
var G__4740__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4694 = ep1.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____4694))
{return cljs.core.every_QMARK_.call(null,p,args);
} else
{return and__3546__auto____4694;
}
})());
};
var G__4740 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4740__delegate.call(this, x, y, z, args);
};
G__4740.cljs$lang$maxFixedArity = 3;
G__4740.cljs$lang$applyTo = (function (arglist__4741){
var x = cljs.core.first(arglist__4741);
var y = cljs.core.first(cljs.core.next(arglist__4741));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4741)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4741)));
return G__4740__delegate.call(this, x, y, z, args);
});
return G__4740;
})()
;
ep1 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return ep1__4734.call(this);
case  1 :
return ep1__4735.call(this,x);
case  2 :
return ep1__4736.call(this,x,y);
case  3 :
return ep1__4737.call(this,x,y,z);
default:
return ep1__4738.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
ep1.cljs$lang$maxFixedArity = 3;
ep1.cljs$lang$applyTo = ep1__4738.cljs$lang$applyTo;
return ep1;
})()
});
var every_pred__4730 = (function (p1,p2){
return (function() {
var ep2 = null;
var ep2__4742 = (function (){
return true;
});
var ep2__4743 = (function (x){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4695 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____4695))
{return p2.call(null,x);
} else
{return and__3546__auto____4695;
}
})());
});
var ep2__4744 = (function (x,y){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4696 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____4696))
{var and__3546__auto____4697 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____4697))
{var and__3546__auto____4698 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____4698))
{return p2.call(null,y);
} else
{return and__3546__auto____4698;
}
} else
{return and__3546__auto____4697;
}
} else
{return and__3546__auto____4696;
}
})());
});
var ep2__4745 = (function (x,y,z){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4699 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____4699))
{var and__3546__auto____4700 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____4700))
{var and__3546__auto____4701 = p1.call(null,z);

if(cljs.core.truth_(and__3546__auto____4701))
{var and__3546__auto____4702 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____4702))
{var and__3546__auto____4703 = p2.call(null,y);

if(cljs.core.truth_(and__3546__auto____4703))
{return p2.call(null,z);
} else
{return and__3546__auto____4703;
}
} else
{return and__3546__auto____4702;
}
} else
{return and__3546__auto____4701;
}
} else
{return and__3546__auto____4700;
}
} else
{return and__3546__auto____4699;
}
})());
});
var ep2__4746 = (function() { 
var G__4748__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4704 = ep2.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____4704))
{return cljs.core.every_QMARK_.call(null,(function (p1__4675_SHARP_){
var and__3546__auto____4705 = p1.call(null,p1__4675_SHARP_);

if(cljs.core.truth_(and__3546__auto____4705))
{return p2.call(null,p1__4675_SHARP_);
} else
{return and__3546__auto____4705;
}
}),args);
} else
{return and__3546__auto____4704;
}
})());
};
var G__4748 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4748__delegate.call(this, x, y, z, args);
};
G__4748.cljs$lang$maxFixedArity = 3;
G__4748.cljs$lang$applyTo = (function (arglist__4749){
var x = cljs.core.first(arglist__4749);
var y = cljs.core.first(cljs.core.next(arglist__4749));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4749)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4749)));
return G__4748__delegate.call(this, x, y, z, args);
});
return G__4748;
})()
;
ep2 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return ep2__4742.call(this);
case  1 :
return ep2__4743.call(this,x);
case  2 :
return ep2__4744.call(this,x,y);
case  3 :
return ep2__4745.call(this,x,y,z);
default:
return ep2__4746.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
ep2.cljs$lang$maxFixedArity = 3;
ep2.cljs$lang$applyTo = ep2__4746.cljs$lang$applyTo;
return ep2;
})()
});
var every_pred__4731 = (function (p1,p2,p3){
return (function() {
var ep3 = null;
var ep3__4750 = (function (){
return true;
});
var ep3__4751 = (function (x){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4706 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____4706))
{var and__3546__auto____4707 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____4707))
{return p3.call(null,x);
} else
{return and__3546__auto____4707;
}
} else
{return and__3546__auto____4706;
}
})());
});
var ep3__4752 = (function (x,y){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4708 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____4708))
{var and__3546__auto____4709 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____4709))
{var and__3546__auto____4710 = p3.call(null,x);

if(cljs.core.truth_(and__3546__auto____4710))
{var and__3546__auto____4711 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____4711))
{var and__3546__auto____4712 = p2.call(null,y);

if(cljs.core.truth_(and__3546__auto____4712))
{return p3.call(null,y);
} else
{return and__3546__auto____4712;
}
} else
{return and__3546__auto____4711;
}
} else
{return and__3546__auto____4710;
}
} else
{return and__3546__auto____4709;
}
} else
{return and__3546__auto____4708;
}
})());
});
var ep3__4753 = (function (x,y,z){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4713 = p1.call(null,x);

if(cljs.core.truth_(and__3546__auto____4713))
{var and__3546__auto____4714 = p2.call(null,x);

if(cljs.core.truth_(and__3546__auto____4714))
{var and__3546__auto____4715 = p3.call(null,x);

if(cljs.core.truth_(and__3546__auto____4715))
{var and__3546__auto____4716 = p1.call(null,y);

if(cljs.core.truth_(and__3546__auto____4716))
{var and__3546__auto____4717 = p2.call(null,y);

if(cljs.core.truth_(and__3546__auto____4717))
{var and__3546__auto____4718 = p3.call(null,y);

if(cljs.core.truth_(and__3546__auto____4718))
{var and__3546__auto____4719 = p1.call(null,z);

if(cljs.core.truth_(and__3546__auto____4719))
{var and__3546__auto____4720 = p2.call(null,z);

if(cljs.core.truth_(and__3546__auto____4720))
{return p3.call(null,z);
} else
{return and__3546__auto____4720;
}
} else
{return and__3546__auto____4719;
}
} else
{return and__3546__auto____4718;
}
} else
{return and__3546__auto____4717;
}
} else
{return and__3546__auto____4716;
}
} else
{return and__3546__auto____4715;
}
} else
{return and__3546__auto____4714;
}
} else
{return and__3546__auto____4713;
}
})());
});
var ep3__4754 = (function() { 
var G__4756__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4721 = ep3.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____4721))
{return cljs.core.every_QMARK_.call(null,(function (p1__4676_SHARP_){
var and__3546__auto____4722 = p1.call(null,p1__4676_SHARP_);

if(cljs.core.truth_(and__3546__auto____4722))
{var and__3546__auto____4723 = p2.call(null,p1__4676_SHARP_);

if(cljs.core.truth_(and__3546__auto____4723))
{return p3.call(null,p1__4676_SHARP_);
} else
{return and__3546__auto____4723;
}
} else
{return and__3546__auto____4722;
}
}),args);
} else
{return and__3546__auto____4721;
}
})());
};
var G__4756 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4756__delegate.call(this, x, y, z, args);
};
G__4756.cljs$lang$maxFixedArity = 3;
G__4756.cljs$lang$applyTo = (function (arglist__4757){
var x = cljs.core.first(arglist__4757);
var y = cljs.core.first(cljs.core.next(arglist__4757));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4757)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4757)));
return G__4756__delegate.call(this, x, y, z, args);
});
return G__4756;
})()
;
ep3 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return ep3__4750.call(this);
case  1 :
return ep3__4751.call(this,x);
case  2 :
return ep3__4752.call(this,x,y);
case  3 :
return ep3__4753.call(this,x,y,z);
default:
return ep3__4754.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
ep3.cljs$lang$maxFixedArity = 3;
ep3.cljs$lang$applyTo = ep3__4754.cljs$lang$applyTo;
return ep3;
})()
});
var every_pred__4732 = (function() { 
var G__4758__delegate = function (p1,p2,p3,ps){
var ps__4724 = cljs.core.list_STAR_.call(null,p1,p2,p3,ps);

return (function() {
var epn = null;
var epn__4759 = (function (){
return true;
});
var epn__4760 = (function (x){
return cljs.core.every_QMARK_.call(null,(function (p1__4677_SHARP_){
return p1__4677_SHARP_.call(null,x);
}),ps__4724);
});
var epn__4761 = (function (x,y){
return cljs.core.every_QMARK_.call(null,(function (p1__4678_SHARP_){
var and__3546__auto____4725 = p1__4678_SHARP_.call(null,x);

if(cljs.core.truth_(and__3546__auto____4725))
{return p1__4678_SHARP_.call(null,y);
} else
{return and__3546__auto____4725;
}
}),ps__4724);
});
var epn__4762 = (function (x,y,z){
return cljs.core.every_QMARK_.call(null,(function (p1__4679_SHARP_){
var and__3546__auto____4726 = p1__4679_SHARP_.call(null,x);

if(cljs.core.truth_(and__3546__auto____4726))
{var and__3546__auto____4727 = p1__4679_SHARP_.call(null,y);

if(cljs.core.truth_(and__3546__auto____4727))
{return p1__4679_SHARP_.call(null,z);
} else
{return and__3546__auto____4727;
}
} else
{return and__3546__auto____4726;
}
}),ps__4724);
});
var epn__4763 = (function() { 
var G__4765__delegate = function (x,y,z,args){
return cljs.core.boolean$.call(null,(function (){var and__3546__auto____4728 = epn.call(null,x,y,z);

if(cljs.core.truth_(and__3546__auto____4728))
{return cljs.core.every_QMARK_.call(null,(function (p1__4680_SHARP_){
return cljs.core.every_QMARK_.call(null,p1__4680_SHARP_,args);
}),ps__4724);
} else
{return and__3546__auto____4728;
}
})());
};
var G__4765 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4765__delegate.call(this, x, y, z, args);
};
G__4765.cljs$lang$maxFixedArity = 3;
G__4765.cljs$lang$applyTo = (function (arglist__4766){
var x = cljs.core.first(arglist__4766);
var y = cljs.core.first(cljs.core.next(arglist__4766));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4766)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4766)));
return G__4765__delegate.call(this, x, y, z, args);
});
return G__4765;
})()
;
epn = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return epn__4759.call(this);
case  1 :
return epn__4760.call(this,x);
case  2 :
return epn__4761.call(this,x,y);
case  3 :
return epn__4762.call(this,x,y,z);
default:
return epn__4763.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
epn.cljs$lang$maxFixedArity = 3;
epn.cljs$lang$applyTo = epn__4763.cljs$lang$applyTo;
return epn;
})()
};
var G__4758 = function (p1,p2,p3,var_args){
var ps = null;
if (goog.isDef(var_args)) {
  ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4758__delegate.call(this, p1, p2, p3, ps);
};
G__4758.cljs$lang$maxFixedArity = 3;
G__4758.cljs$lang$applyTo = (function (arglist__4767){
var p1 = cljs.core.first(arglist__4767);
var p2 = cljs.core.first(cljs.core.next(arglist__4767));
var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4767)));
var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4767)));
return G__4758__delegate.call(this, p1, p2, p3, ps);
});
return G__4758;
})()
;
every_pred = function(p1,p2,p3,var_args){
var ps = var_args;
switch(arguments.length){
case  1 :
return every_pred__4729.call(this,p1);
case  2 :
return every_pred__4730.call(this,p1,p2);
case  3 :
return every_pred__4731.call(this,p1,p2,p3);
default:
return every_pred__4732.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
every_pred.cljs$lang$maxFixedArity = 3;
every_pred.cljs$lang$applyTo = every_pred__4732.cljs$lang$applyTo;
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
var some_fn__4807 = (function (p){
return (function() {
var sp1 = null;
var sp1__4812 = (function (){
return null;
});
var sp1__4813 = (function (x){
return p.call(null,x);
});
var sp1__4814 = (function (x,y){
var or__3548__auto____4769 = p.call(null,x);

if(cljs.core.truth_(or__3548__auto____4769))
{return or__3548__auto____4769;
} else
{return p.call(null,y);
}
});
var sp1__4815 = (function (x,y,z){
var or__3548__auto____4770 = p.call(null,x);

if(cljs.core.truth_(or__3548__auto____4770))
{return or__3548__auto____4770;
} else
{var or__3548__auto____4771 = p.call(null,y);

if(cljs.core.truth_(or__3548__auto____4771))
{return or__3548__auto____4771;
} else
{return p.call(null,z);
}
}
});
var sp1__4816 = (function() { 
var G__4818__delegate = function (x,y,z,args){
var or__3548__auto____4772 = sp1.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4772))
{return or__3548__auto____4772;
} else
{return cljs.core.some.call(null,p,args);
}
};
var G__4818 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4818__delegate.call(this, x, y, z, args);
};
G__4818.cljs$lang$maxFixedArity = 3;
G__4818.cljs$lang$applyTo = (function (arglist__4819){
var x = cljs.core.first(arglist__4819);
var y = cljs.core.first(cljs.core.next(arglist__4819));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4819)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4819)));
return G__4818__delegate.call(this, x, y, z, args);
});
return G__4818;
})()
;
sp1 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return sp1__4812.call(this);
case  1 :
return sp1__4813.call(this,x);
case  2 :
return sp1__4814.call(this,x,y);
case  3 :
return sp1__4815.call(this,x,y,z);
default:
return sp1__4816.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
sp1.cljs$lang$maxFixedArity = 3;
sp1.cljs$lang$applyTo = sp1__4816.cljs$lang$applyTo;
return sp1;
})()
});
var some_fn__4808 = (function (p1,p2){
return (function() {
var sp2 = null;
var sp2__4820 = (function (){
return null;
});
var sp2__4821 = (function (x){
var or__3548__auto____4773 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4773))
{return or__3548__auto____4773;
} else
{return p2.call(null,x);
}
});
var sp2__4822 = (function (x,y){
var or__3548__auto____4774 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4774))
{return or__3548__auto____4774;
} else
{var or__3548__auto____4775 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4775))
{return or__3548__auto____4775;
} else
{var or__3548__auto____4776 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4776))
{return or__3548__auto____4776;
} else
{return p2.call(null,y);
}
}
}
});
var sp2__4823 = (function (x,y,z){
var or__3548__auto____4777 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4777))
{return or__3548__auto____4777;
} else
{var or__3548__auto____4778 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4778))
{return or__3548__auto____4778;
} else
{var or__3548__auto____4779 = p1.call(null,z);

if(cljs.core.truth_(or__3548__auto____4779))
{return or__3548__auto____4779;
} else
{var or__3548__auto____4780 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4780))
{return or__3548__auto____4780;
} else
{var or__3548__auto____4781 = p2.call(null,y);

if(cljs.core.truth_(or__3548__auto____4781))
{return or__3548__auto____4781;
} else
{return p2.call(null,z);
}
}
}
}
}
});
var sp2__4824 = (function() { 
var G__4826__delegate = function (x,y,z,args){
var or__3548__auto____4782 = sp2.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4782))
{return or__3548__auto____4782;
} else
{return cljs.core.some.call(null,(function (p1__4685_SHARP_){
var or__3548__auto____4783 = p1.call(null,p1__4685_SHARP_);

if(cljs.core.truth_(or__3548__auto____4783))
{return or__3548__auto____4783;
} else
{return p2.call(null,p1__4685_SHARP_);
}
}),args);
}
};
var G__4826 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4826__delegate.call(this, x, y, z, args);
};
G__4826.cljs$lang$maxFixedArity = 3;
G__4826.cljs$lang$applyTo = (function (arglist__4827){
var x = cljs.core.first(arglist__4827);
var y = cljs.core.first(cljs.core.next(arglist__4827));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4827)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4827)));
return G__4826__delegate.call(this, x, y, z, args);
});
return G__4826;
})()
;
sp2 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return sp2__4820.call(this);
case  1 :
return sp2__4821.call(this,x);
case  2 :
return sp2__4822.call(this,x,y);
case  3 :
return sp2__4823.call(this,x,y,z);
default:
return sp2__4824.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
sp2.cljs$lang$maxFixedArity = 3;
sp2.cljs$lang$applyTo = sp2__4824.cljs$lang$applyTo;
return sp2;
})()
});
var some_fn__4809 = (function (p1,p2,p3){
return (function() {
var sp3 = null;
var sp3__4828 = (function (){
return null;
});
var sp3__4829 = (function (x){
var or__3548__auto____4784 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4784))
{return or__3548__auto____4784;
} else
{var or__3548__auto____4785 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4785))
{return or__3548__auto____4785;
} else
{return p3.call(null,x);
}
}
});
var sp3__4830 = (function (x,y){
var or__3548__auto____4786 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4786))
{return or__3548__auto____4786;
} else
{var or__3548__auto____4787 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4787))
{return or__3548__auto____4787;
} else
{var or__3548__auto____4788 = p3.call(null,x);

if(cljs.core.truth_(or__3548__auto____4788))
{return or__3548__auto____4788;
} else
{var or__3548__auto____4789 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4789))
{return or__3548__auto____4789;
} else
{var or__3548__auto____4790 = p2.call(null,y);

if(cljs.core.truth_(or__3548__auto____4790))
{return or__3548__auto____4790;
} else
{return p3.call(null,y);
}
}
}
}
}
});
var sp3__4831 = (function (x,y,z){
var or__3548__auto____4791 = p1.call(null,x);

if(cljs.core.truth_(or__3548__auto____4791))
{return or__3548__auto____4791;
} else
{var or__3548__auto____4792 = p2.call(null,x);

if(cljs.core.truth_(or__3548__auto____4792))
{return or__3548__auto____4792;
} else
{var or__3548__auto____4793 = p3.call(null,x);

if(cljs.core.truth_(or__3548__auto____4793))
{return or__3548__auto____4793;
} else
{var or__3548__auto____4794 = p1.call(null,y);

if(cljs.core.truth_(or__3548__auto____4794))
{return or__3548__auto____4794;
} else
{var or__3548__auto____4795 = p2.call(null,y);

if(cljs.core.truth_(or__3548__auto____4795))
{return or__3548__auto____4795;
} else
{var or__3548__auto____4796 = p3.call(null,y);

if(cljs.core.truth_(or__3548__auto____4796))
{return or__3548__auto____4796;
} else
{var or__3548__auto____4797 = p1.call(null,z);

if(cljs.core.truth_(or__3548__auto____4797))
{return or__3548__auto____4797;
} else
{var or__3548__auto____4798 = p2.call(null,z);

if(cljs.core.truth_(or__3548__auto____4798))
{return or__3548__auto____4798;
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
var sp3__4832 = (function() { 
var G__4834__delegate = function (x,y,z,args){
var or__3548__auto____4799 = sp3.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4799))
{return or__3548__auto____4799;
} else
{return cljs.core.some.call(null,(function (p1__4686_SHARP_){
var or__3548__auto____4800 = p1.call(null,p1__4686_SHARP_);

if(cljs.core.truth_(or__3548__auto____4800))
{return or__3548__auto____4800;
} else
{var or__3548__auto____4801 = p2.call(null,p1__4686_SHARP_);

if(cljs.core.truth_(or__3548__auto____4801))
{return or__3548__auto____4801;
} else
{return p3.call(null,p1__4686_SHARP_);
}
}
}),args);
}
};
var G__4834 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4834__delegate.call(this, x, y, z, args);
};
G__4834.cljs$lang$maxFixedArity = 3;
G__4834.cljs$lang$applyTo = (function (arglist__4835){
var x = cljs.core.first(arglist__4835);
var y = cljs.core.first(cljs.core.next(arglist__4835));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4835)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4835)));
return G__4834__delegate.call(this, x, y, z, args);
});
return G__4834;
})()
;
sp3 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return sp3__4828.call(this);
case  1 :
return sp3__4829.call(this,x);
case  2 :
return sp3__4830.call(this,x,y);
case  3 :
return sp3__4831.call(this,x,y,z);
default:
return sp3__4832.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
sp3.cljs$lang$maxFixedArity = 3;
sp3.cljs$lang$applyTo = sp3__4832.cljs$lang$applyTo;
return sp3;
})()
});
var some_fn__4810 = (function() { 
var G__4836__delegate = function (p1,p2,p3,ps){
var ps__4802 = cljs.core.list_STAR_.call(null,p1,p2,p3,ps);

return (function() {
var spn = null;
var spn__4837 = (function (){
return null;
});
var spn__4838 = (function (x){
return cljs.core.some.call(null,(function (p1__4687_SHARP_){
return p1__4687_SHARP_.call(null,x);
}),ps__4802);
});
var spn__4839 = (function (x,y){
return cljs.core.some.call(null,(function (p1__4688_SHARP_){
var or__3548__auto____4803 = p1__4688_SHARP_.call(null,x);

if(cljs.core.truth_(or__3548__auto____4803))
{return or__3548__auto____4803;
} else
{return p1__4688_SHARP_.call(null,y);
}
}),ps__4802);
});
var spn__4840 = (function (x,y,z){
return cljs.core.some.call(null,(function (p1__4689_SHARP_){
var or__3548__auto____4804 = p1__4689_SHARP_.call(null,x);

if(cljs.core.truth_(or__3548__auto____4804))
{return or__3548__auto____4804;
} else
{var or__3548__auto____4805 = p1__4689_SHARP_.call(null,y);

if(cljs.core.truth_(or__3548__auto____4805))
{return or__3548__auto____4805;
} else
{return p1__4689_SHARP_.call(null,z);
}
}
}),ps__4802);
});
var spn__4841 = (function() { 
var G__4843__delegate = function (x,y,z,args){
var or__3548__auto____4806 = spn.call(null,x,y,z);

if(cljs.core.truth_(or__3548__auto____4806))
{return or__3548__auto____4806;
} else
{return cljs.core.some.call(null,(function (p1__4690_SHARP_){
return cljs.core.some.call(null,p1__4690_SHARP_,args);
}),ps__4802);
}
};
var G__4843 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4843__delegate.call(this, x, y, z, args);
};
G__4843.cljs$lang$maxFixedArity = 3;
G__4843.cljs$lang$applyTo = (function (arglist__4844){
var x = cljs.core.first(arglist__4844);
var y = cljs.core.first(cljs.core.next(arglist__4844));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4844)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4844)));
return G__4843__delegate.call(this, x, y, z, args);
});
return G__4843;
})()
;
spn = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return spn__4837.call(this);
case  1 :
return spn__4838.call(this,x);
case  2 :
return spn__4839.call(this,x,y);
case  3 :
return spn__4840.call(this,x,y,z);
default:
return spn__4841.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
spn.cljs$lang$maxFixedArity = 3;
spn.cljs$lang$applyTo = spn__4841.cljs$lang$applyTo;
return spn;
})()
};
var G__4836 = function (p1,p2,p3,var_args){
var ps = null;
if (goog.isDef(var_args)) {
  ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__4836__delegate.call(this, p1, p2, p3, ps);
};
G__4836.cljs$lang$maxFixedArity = 3;
G__4836.cljs$lang$applyTo = (function (arglist__4845){
var p1 = cljs.core.first(arglist__4845);
var p2 = cljs.core.first(cljs.core.next(arglist__4845));
var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4845)));
var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4845)));
return G__4836__delegate.call(this, p1, p2, p3, ps);
});
return G__4836;
})()
;
some_fn = function(p1,p2,p3,var_args){
var ps = var_args;
switch(arguments.length){
case  1 :
return some_fn__4807.call(this,p1);
case  2 :
return some_fn__4808.call(this,p1,p2);
case  3 :
return some_fn__4809.call(this,p1,p2,p3);
default:
return some_fn__4810.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
some_fn.cljs$lang$maxFixedArity = 3;
some_fn.cljs$lang$applyTo = some_fn__4810.cljs$lang$applyTo;
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
var map__4858 = (function (f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4846 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4846))
{var s__4847 = temp__3698__auto____4846;

return cljs.core.cons.call(null,f.call(null,cljs.core.first.call(null,s__4847)),map.call(null,f,cljs.core.rest.call(null,s__4847)));
} else
{return null;
}
})));
});
var map__4859 = (function (f,c1,c2){
return (new cljs.core.LazySeq(null,false,(function (){
var s1__4848 = cljs.core.seq.call(null,c1);
var s2__4849 = cljs.core.seq.call(null,c2);

if(cljs.core.truth_((function (){var and__3546__auto____4850 = s1__4848;

if(cljs.core.truth_(and__3546__auto____4850))
{return s2__4849;
} else
{return and__3546__auto____4850;
}
})()))
{return cljs.core.cons.call(null,f.call(null,cljs.core.first.call(null,s1__4848),cljs.core.first.call(null,s2__4849)),map.call(null,f,cljs.core.rest.call(null,s1__4848),cljs.core.rest.call(null,s2__4849)));
} else
{return null;
}
})));
});
var map__4860 = (function (f,c1,c2,c3){
return (new cljs.core.LazySeq(null,false,(function (){
var s1__4851 = cljs.core.seq.call(null,c1);
var s2__4852 = cljs.core.seq.call(null,c2);
var s3__4853 = cljs.core.seq.call(null,c3);

if(cljs.core.truth_((function (){var and__3546__auto____4854 = s1__4851;

if(cljs.core.truth_(and__3546__auto____4854))
{var and__3546__auto____4855 = s2__4852;

if(cljs.core.truth_(and__3546__auto____4855))
{return s3__4853;
} else
{return and__3546__auto____4855;
}
} else
{return and__3546__auto____4854;
}
})()))
{return cljs.core.cons.call(null,f.call(null,cljs.core.first.call(null,s1__4851),cljs.core.first.call(null,s2__4852),cljs.core.first.call(null,s3__4853)),map.call(null,f,cljs.core.rest.call(null,s1__4851),cljs.core.rest.call(null,s2__4852),cljs.core.rest.call(null,s3__4853)));
} else
{return null;
}
})));
});
var map__4861 = (function() { 
var G__4863__delegate = function (f,c1,c2,c3,colls){
var step__4857 = (function step(cs){
return (new cljs.core.LazySeq(null,false,(function (){
var ss__4856 = map.call(null,cljs.core.seq,cs);

if(cljs.core.truth_(cljs.core.every_QMARK_.call(null,cljs.core.identity,ss__4856)))
{return cljs.core.cons.call(null,map.call(null,cljs.core.first,ss__4856),step.call(null,map.call(null,cljs.core.rest,ss__4856)));
} else
{return null;
}
})));
});

return map.call(null,(function (p1__4768_SHARP_){
return cljs.core.apply.call(null,f,p1__4768_SHARP_);
}),step__4857.call(null,cljs.core.conj.call(null,colls,c3,c2,c1)));
};
var G__4863 = function (f,c1,c2,c3,var_args){
var colls = null;
if (goog.isDef(var_args)) {
  colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4),0);
} 
return G__4863__delegate.call(this, f, c1, c2, c3, colls);
};
G__4863.cljs$lang$maxFixedArity = 4;
G__4863.cljs$lang$applyTo = (function (arglist__4864){
var f = cljs.core.first(arglist__4864);
var c1 = cljs.core.first(cljs.core.next(arglist__4864));
var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4864)));
var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4864))));
var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__4864))));
return G__4863__delegate.call(this, f, c1, c2, c3, colls);
});
return G__4863;
})()
;
map = function(f,c1,c2,c3,var_args){
var colls = var_args;
switch(arguments.length){
case  2 :
return map__4858.call(this,f,c1);
case  3 :
return map__4859.call(this,f,c1,c2);
case  4 :
return map__4860.call(this,f,c1,c2,c3);
default:
return map__4861.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
map.cljs$lang$maxFixedArity = 4;
map.cljs$lang$applyTo = map__4861.cljs$lang$applyTo;
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
{var temp__3698__auto____4865 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4865))
{var s__4866 = temp__3698__auto____4865;

return cljs.core.cons.call(null,cljs.core.first.call(null,s__4866),take.call(null,(n - 1),cljs.core.rest.call(null,s__4866)));
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
var step__4869 = (function (n,coll){
while(true){
var s__4867 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_((function (){var and__3546__auto____4868 = (n > 0);

if(cljs.core.truth_(and__3546__auto____4868))
{return s__4867;
} else
{return and__3546__auto____4868;
}
})()))
{{
var G__4870 = (n - 1);
var G__4871 = cljs.core.rest.call(null,s__4867);
n = G__4870;
coll = G__4871;
continue;
}
} else
{return s__4867;
}
break;
}
});

return (new cljs.core.LazySeq(null,false,(function (){
return step__4869.call(null,n,coll);
})));
});
/**
* Return a lazy sequence of all but the last n (default 1) items in coll
*/
cljs.core.drop_last = (function() {
var drop_last = null;
var drop_last__4872 = (function (s){
return drop_last.call(null,1,s);
});
var drop_last__4873 = (function (n,s){
return cljs.core.map.call(null,(function (x,_){
return x;
}),s,cljs.core.drop.call(null,n,s));
});
drop_last = function(n,s){
switch(arguments.length){
case  1 :
return drop_last__4872.call(this,n);
case  2 :
return drop_last__4873.call(this,n,s);
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
var s__4875 = cljs.core.seq.call(null,coll);
var lead__4876 = cljs.core.seq.call(null,cljs.core.drop.call(null,n,coll));

while(true){
if(cljs.core.truth_(lead__4876))
{{
var G__4877 = cljs.core.next.call(null,s__4875);
var G__4878 = cljs.core.next.call(null,lead__4876);
s__4875 = G__4877;
lead__4876 = G__4878;
continue;
}
} else
{return s__4875;
}
break;
}
});
/**
* Returns a lazy sequence of the items in coll starting from the first
* item for which (pred item) returns nil.
*/
cljs.core.drop_while = (function drop_while(pred,coll){
var step__4881 = (function (pred,coll){
while(true){
var s__4879 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_((function (){var and__3546__auto____4880 = s__4879;

if(cljs.core.truth_(and__3546__auto____4880))
{return pred.call(null,cljs.core.first.call(null,s__4879));
} else
{return and__3546__auto____4880;
}
})()))
{{
var G__4882 = pred;
var G__4883 = cljs.core.rest.call(null,s__4879);
pred = G__4882;
coll = G__4883;
continue;
}
} else
{return s__4879;
}
break;
}
});

return (new cljs.core.LazySeq(null,false,(function (){
return step__4881.call(null,pred,coll);
})));
});
/**
* Returns a lazy (infinite!) sequence of repetitions of the items in coll.
*/
cljs.core.cycle = (function cycle(coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4884 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4884))
{var s__4885 = temp__3698__auto____4884;

return cljs.core.concat.call(null,s__4885,cycle.call(null,s__4885));
} else
{return null;
}
})));
});
/**
* Returns a vector of [(take n coll) (drop n coll)]
*/
cljs.core.split_at = (function split_at(n,coll){
return cljs.core.Vector.fromArray([cljs.core.take.call(null,n,coll),cljs.core.drop.call(null,n,coll)]);
});
/**
* Returns a lazy (infinite!, or length n if supplied) sequence of xs.
*/
cljs.core.repeat = (function() {
var repeat = null;
var repeat__4886 = (function (x){
return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,x,repeat.call(null,x));
})));
});
var repeat__4887 = (function (n,x){
return cljs.core.take.call(null,n,repeat.call(null,x));
});
repeat = function(n,x){
switch(arguments.length){
case  1 :
return repeat__4886.call(this,n);
case  2 :
return repeat__4887.call(this,n,x);
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
var repeatedly__4889 = (function (f){
return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,f.call(null),repeatedly.call(null,f));
})));
});
var repeatedly__4890 = (function (n,f){
return cljs.core.take.call(null,n,repeatedly.call(null,f));
});
repeatedly = function(n,f){
switch(arguments.length){
case  1 :
return repeatedly__4889.call(this,n);
case  2 :
return repeatedly__4890.call(this,n,f);
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
var interleave__4896 = (function (c1,c2){
return (new cljs.core.LazySeq(null,false,(function (){
var s1__4892 = cljs.core.seq.call(null,c1);
var s2__4893 = cljs.core.seq.call(null,c2);

if(cljs.core.truth_((function (){var and__3546__auto____4894 = s1__4892;

if(cljs.core.truth_(and__3546__auto____4894))
{return s2__4893;
} else
{return and__3546__auto____4894;
}
})()))
{return cljs.core.cons.call(null,cljs.core.first.call(null,s1__4892),cljs.core.cons.call(null,cljs.core.first.call(null,s2__4893),interleave.call(null,cljs.core.rest.call(null,s1__4892),cljs.core.rest.call(null,s2__4893))));
} else
{return null;
}
})));
});
var interleave__4897 = (function() { 
var G__4899__delegate = function (c1,c2,colls){
return (new cljs.core.LazySeq(null,false,(function (){
var ss__4895 = cljs.core.map.call(null,cljs.core.seq,cljs.core.conj.call(null,colls,c2,c1));

if(cljs.core.truth_(cljs.core.every_QMARK_.call(null,cljs.core.identity,ss__4895)))
{return cljs.core.concat.call(null,cljs.core.map.call(null,cljs.core.first,ss__4895),cljs.core.apply.call(null,interleave,cljs.core.map.call(null,cljs.core.rest,ss__4895)));
} else
{return null;
}
})));
};
var G__4899 = function (c1,c2,var_args){
var colls = null;
if (goog.isDef(var_args)) {
  colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4899__delegate.call(this, c1, c2, colls);
};
G__4899.cljs$lang$maxFixedArity = 2;
G__4899.cljs$lang$applyTo = (function (arglist__4900){
var c1 = cljs.core.first(arglist__4900);
var c2 = cljs.core.first(cljs.core.next(arglist__4900));
var colls = cljs.core.rest(cljs.core.next(arglist__4900));
return G__4899__delegate.call(this, c1, c2, colls);
});
return G__4899;
})()
;
interleave = function(c1,c2,var_args){
var colls = var_args;
switch(arguments.length){
case  2 :
return interleave__4896.call(this,c1,c2);
default:
return interleave__4897.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
interleave.cljs$lang$maxFixedArity = 2;
interleave.cljs$lang$applyTo = interleave__4897.cljs$lang$applyTo;
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
var cat__4903 = (function cat(coll,colls){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3695__auto____4901 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3695__auto____4901))
{var coll__4902 = temp__3695__auto____4901;

return cljs.core.cons.call(null,cljs.core.first.call(null,coll__4902),cat.call(null,cljs.core.rest.call(null,coll__4902),colls));
} else
{if(cljs.core.truth_(cljs.core.seq.call(null,colls)))
{return cat.call(null,cljs.core.first.call(null,colls),cljs.core.rest.call(null,colls));
} else
{return null;
}
}
})));
});

return cat__4903.call(null,null,colls);
});
/**
* Returns the result of applying concat to the result of applying map
* to f and colls.  Thus function f should return a collection.
* @param {...*} var_args
*/
cljs.core.mapcat = (function() {
var mapcat = null;
var mapcat__4904 = (function (f,coll){
return cljs.core.flatten1.call(null,cljs.core.map.call(null,f,coll));
});
var mapcat__4905 = (function() { 
var G__4907__delegate = function (f,coll,colls){
return cljs.core.flatten1.call(null,cljs.core.apply.call(null,cljs.core.map,f,coll,colls));
};
var G__4907 = function (f,coll,var_args){
var colls = null;
if (goog.isDef(var_args)) {
  colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2),0);
} 
return G__4907__delegate.call(this, f, coll, colls);
};
G__4907.cljs$lang$maxFixedArity = 2;
G__4907.cljs$lang$applyTo = (function (arglist__4908){
var f = cljs.core.first(arglist__4908);
var coll = cljs.core.first(cljs.core.next(arglist__4908));
var colls = cljs.core.rest(cljs.core.next(arglist__4908));
return G__4907__delegate.call(this, f, coll, colls);
});
return G__4907;
})()
;
mapcat = function(f,coll,var_args){
var colls = var_args;
switch(arguments.length){
case  2 :
return mapcat__4904.call(this,f,coll);
default:
return mapcat__4905.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
mapcat.cljs$lang$maxFixedArity = 2;
mapcat.cljs$lang$applyTo = mapcat__4905.cljs$lang$applyTo;
return mapcat;
})()
;
/**
* Returns a lazy sequence of the items in coll for which
* (pred item) returns true. pred must be free of side-effects.
*/
cljs.core.filter = (function filter(pred,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4909 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4909))
{var s__4910 = temp__3698__auto____4909;

var f__4911 = cljs.core.first.call(null,s__4910);
var r__4912 = cljs.core.rest.call(null,s__4910);

if(cljs.core.truth_(pred.call(null,f__4911)))
{return cljs.core.cons.call(null,f__4911,filter.call(null,pred,r__4912));
} else
{return filter.call(null,pred,r__4912);
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
var walk__4914 = (function walk(node){
return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,node,(cljs.core.truth_(branch_QMARK_.call(null,node))?cljs.core.mapcat.call(null,walk,children.call(null,node)):null));
})));
});

return walk__4914.call(null,root);
});
/**
* Takes any nested combination of sequential things (lists, vectors,
* etc.) and returns their contents as a single, flat sequence.
* (flatten nil) returns nil.
*/
cljs.core.flatten = (function flatten(x){
return cljs.core.filter.call(null,(function (p1__4913_SHARP_){
return cljs.core.not.call(null,cljs.core.sequential_QMARK_.call(null,p1__4913_SHARP_));
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
var partition__4921 = (function (n,coll){
return partition.call(null,n,n,coll);
});
var partition__4922 = (function (n,step,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4915 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4915))
{var s__4916 = temp__3698__auto____4915;

var p__4917 = cljs.core.take.call(null,n,s__4916);

if(cljs.core.truth_(cljs.core._EQ_.call(null,n,cljs.core.count.call(null,p__4917))))
{return cljs.core.cons.call(null,p__4917,partition.call(null,n,step,cljs.core.drop.call(null,step,s__4916)));
} else
{return null;
}
} else
{return null;
}
})));
});
var partition__4923 = (function (n,step,pad,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____4918 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____4918))
{var s__4919 = temp__3698__auto____4918;

var p__4920 = cljs.core.take.call(null,n,s__4919);

if(cljs.core.truth_(cljs.core._EQ_.call(null,n,cljs.core.count.call(null,p__4920))))
{return cljs.core.cons.call(null,p__4920,partition.call(null,n,step,pad,cljs.core.drop.call(null,step,s__4919)));
} else
{return cljs.core.list.call(null,cljs.core.take.call(null,n,cljs.core.concat.call(null,p__4920,pad)));
}
} else
{return null;
}
})));
});
partition = function(n,step,pad,coll){
switch(arguments.length){
case  2 :
return partition__4921.call(this,n,step);
case  3 :
return partition__4922.call(this,n,step,pad);
case  4 :
return partition__4923.call(this,n,step,pad,coll);
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
var get_in__4929 = (function (m,ks){
return cljs.core.reduce.call(null,cljs.core.get,m,ks);
});
var get_in__4930 = (function (m,ks,not_found){
var sentinel__4925 = cljs.core.lookup_sentinel;
var m__4926 = m;
var ks__4927 = cljs.core.seq.call(null,ks);

while(true){
if(cljs.core.truth_(ks__4927))
{var m__4928 = cljs.core.get.call(null,m__4926,cljs.core.first.call(null,ks__4927),sentinel__4925);

if(cljs.core.truth_((sentinel__4925 === m__4928)))
{return not_found;
} else
{{
var G__4932 = sentinel__4925;
var G__4933 = m__4928;
var G__4934 = cljs.core.next.call(null,ks__4927);
sentinel__4925 = G__4932;
m__4926 = G__4933;
ks__4927 = G__4934;
continue;
}
}
} else
{return m__4926;
}
break;
}
});
get_in = function(m,ks,not_found){
switch(arguments.length){
case  2 :
return get_in__4929.call(this,m,ks);
case  3 :
return get_in__4930.call(this,m,ks,not_found);
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
cljs.core.assoc_in = (function assoc_in(m,p__4935,v){
var vec__4936__4937 = p__4935;
var k__4938 = cljs.core.nth.call(null,vec__4936__4937,0,null);
var ks__4939 = cljs.core.nthnext.call(null,vec__4936__4937,1);

if(cljs.core.truth_(ks__4939))
{return cljs.core.assoc.call(null,m,k__4938,assoc_in.call(null,cljs.core.get.call(null,m,k__4938),ks__4939,v));
} else
{return cljs.core.assoc.call(null,m,k__4938,v);
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
var update_in__delegate = function (m,p__4940,f,args){
var vec__4941__4942 = p__4940;
var k__4943 = cljs.core.nth.call(null,vec__4941__4942,0,null);
var ks__4944 = cljs.core.nthnext.call(null,vec__4941__4942,1);

if(cljs.core.truth_(ks__4944))
{return cljs.core.assoc.call(null,m,k__4943,cljs.core.apply.call(null,update_in,cljs.core.get.call(null,m,k__4943),ks__4944,f,args));
} else
{return cljs.core.assoc.call(null,m,k__4943,cljs.core.apply.call(null,f,cljs.core.get.call(null,m,k__4943),args));
}
};
var update_in = function (m,p__4940,f,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return update_in__delegate.call(this, m, p__4940, f, args);
};
update_in.cljs$lang$maxFixedArity = 3;
update_in.cljs$lang$applyTo = (function (arglist__4945){
var m = cljs.core.first(arglist__4945);
var p__4940 = cljs.core.first(cljs.core.next(arglist__4945));
var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__4945)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__4945)));
return update_in__delegate.call(this, m, p__4940, f, args);
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
cljs.core.Vector.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Vector");
});
cljs.core.Vector.prototype.cljs$core$IHash$ = true;
cljs.core.Vector.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4946 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = (function() {
var G__4979 = null;
var G__4979__4980 = (function (coll,k){
var this__4947 = this;
return cljs.core._nth.call(null,coll,k,null);
});
var G__4979__4981 = (function (coll,k,not_found){
var this__4948 = this;
return cljs.core._nth.call(null,coll,k,not_found);
});
G__4979 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__4979__4980.call(this,coll,k);
case  3 :
return G__4979__4981.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4979;
})()
;
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__4949 = this;
var new_array__4950 = cljs.core.aclone.call(null,this__4949.array);

(new_array__4950[k] = v);
return (new cljs.core.Vector(this__4949.meta,new_array__4950));
});
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = (function() {
var G__4983 = null;
var G__4983__4984 = (function (tsym4951,k){
var this__4953 = this;
var tsym4951__4954 = this;

var coll__4955 = tsym4951__4954;

return cljs.core._lookup.call(null,coll__4955,k);
});
var G__4983__4985 = (function (tsym4952,k,not_found){
var this__4956 = this;
var tsym4952__4957 = this;

var coll__4958 = tsym4952__4957;

return cljs.core._lookup.call(null,coll__4958,k,not_found);
});
G__4983 = function(tsym4952,k,not_found){
switch(arguments.length){
case  2 :
return G__4983__4984.call(this,tsym4952,k);
case  3 :
return G__4983__4985.call(this,tsym4952,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4983;
})()
;
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__4959 = this;
var new_array__4960 = cljs.core.aclone.call(null,this__4959.array);

new_array__4960.push(o);
return (new cljs.core.Vector(this__4959.meta,new_array__4960));
});
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = (function() {
var G__4987 = null;
var G__4987__4988 = (function (v,f){
var this__4961 = this;
return cljs.core.ci_reduce.call(null,this__4961.array,f);
});
var G__4987__4989 = (function (v,f,start){
var this__4962 = this;
return cljs.core.ci_reduce.call(null,this__4962.array,f,start);
});
G__4987 = function(v,f,start){
switch(arguments.length){
case  2 :
return G__4987__4988.call(this,v,f);
case  3 :
return G__4987__4989.call(this,v,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4987;
})()
;
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__4963 = this;
if(cljs.core.truth_((this__4963.array.length > 0)))
{var vector_seq__4964 = (function vector_seq(i){
return (new cljs.core.LazySeq(null,false,(function (){
if(cljs.core.truth_((i < this__4963.array.length)))
{return cljs.core.cons.call(null,(this__4963.array[i]),vector_seq.call(null,(i + 1)));
} else
{return null;
}
})));
});

return vector_seq__4964.call(null,0);
} else
{return null;
}
});
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = (function (coll){
var this__4965 = this;
return this__4965.array.length;
});
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = (function (coll){
var this__4966 = this;
var count__4967 = this__4966.array.length;

if(cljs.core.truth_((count__4967 > 0)))
{return (this__4966.array[(count__4967 - 1)]);
} else
{return null;
}
});
cljs.core.Vector.prototype.cljs$core$IStack$_pop = (function (coll){
var this__4968 = this;
if(cljs.core.truth_((this__4968.array.length > 0)))
{var new_array__4969 = cljs.core.aclone.call(null,this__4968.array);

new_array__4969.pop();
return (new cljs.core.Vector(this__4968.meta,new_array__4969));
} else
{throw (new Error("Can't pop empty vector"));
}
});
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = (function (coll,n,val){
var this__4970 = this;
return cljs.core._assoc.call(null,coll,n,val);
});
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__4971 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__4972 = this;
return (new cljs.core.Vector(meta,this__4972.array));
});
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__4973 = this;
return this__4973.meta;
});
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = (function() {
var G__4991 = null;
var G__4991__4992 = (function (coll,n){
var this__4974 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4975 = (0 <= n);

if(cljs.core.truth_(and__3546__auto____4975))
{return (n < this__4974.array.length);
} else
{return and__3546__auto____4975;
}
})()))
{return (this__4974.array[n]);
} else
{return null;
}
});
var G__4991__4993 = (function (coll,n,not_found){
var this__4976 = this;
if(cljs.core.truth_((function (){var and__3546__auto____4977 = (0 <= n);

if(cljs.core.truth_(and__3546__auto____4977))
{return (n < this__4976.array.length);
} else
{return and__3546__auto____4977;
}
})()))
{return (this__4976.array[n]);
} else
{return not_found;
}
});
G__4991 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__4991__4992.call(this,coll,n);
case  3 :
return G__4991__4993.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__4991;
})()
;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__4978 = this;
return cljs.core.with_meta.call(null,cljs.core.Vector.EMPTY,this__4978.meta);
});
cljs.core.Vector;
cljs.core.Vector.EMPTY = (new cljs.core.Vector(null,cljs.core.array.call(null)));
cljs.core.Vector.fromArray = (function (xs){
return (new cljs.core.Vector(null,xs));
});
cljs.core.vec = (function vec(coll){
return cljs.core.reduce.call(null,cljs.core.conj,cljs.core.Vector.EMPTY,coll);
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
vector.cljs$lang$applyTo = (function (arglist__4995){
var args = cljs.core.seq( arglist__4995 );;
return vector__delegate.call(this, args);
});
return vector;
})()
;

/**
* @constructor
*/
cljs.core.Subvec = (function (meta,v,start,end){
this.meta = meta;
this.v = v;
this.start = start;
this.end = end;
})
cljs.core.Subvec.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Subvec");
});
cljs.core.Subvec.prototype.cljs$core$IHash$ = true;
cljs.core.Subvec.prototype.cljs$core$IHash$_hash = (function (coll){
var this__4996 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = (function() {
var G__5024 = null;
var G__5024__5025 = (function (coll,k){
var this__4997 = this;
return cljs.core._nth.call(null,coll,k,null);
});
var G__5024__5026 = (function (coll,k,not_found){
var this__4998 = this;
return cljs.core._nth.call(null,coll,k,not_found);
});
G__5024 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__5024__5025.call(this,coll,k);
case  3 :
return G__5024__5026.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5024;
})()
;
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = (function (coll,key,val){
var this__4999 = this;
var v_pos__5000 = (this__4999.start + key);

return (new cljs.core.Subvec(this__4999.meta,cljs.core._assoc.call(null,this__4999.v,v_pos__5000,val),this__4999.start,((this__4999.end > (v_pos__5000 + 1)) ? this__4999.end : (v_pos__5000 + 1))));
});
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = (function() {
var G__5028 = null;
var G__5028__5029 = (function (tsym5001,k){
var this__5003 = this;
var tsym5001__5004 = this;

var coll__5005 = tsym5001__5004;

return cljs.core._lookup.call(null,coll__5005,k);
});
var G__5028__5030 = (function (tsym5002,k,not_found){
var this__5006 = this;
var tsym5002__5007 = this;

var coll__5008 = tsym5002__5007;

return cljs.core._lookup.call(null,coll__5008,k,not_found);
});
G__5028 = function(tsym5002,k,not_found){
switch(arguments.length){
case  2 :
return G__5028__5029.call(this,tsym5002,k);
case  3 :
return G__5028__5030.call(this,tsym5002,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5028;
})()
;
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__5009 = this;
return (new cljs.core.Subvec(this__5009.meta,cljs.core._assoc_n.call(null,this__5009.v,this__5009.end,o),this__5009.start,(this__5009.end + 1)));
});
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = (function() {
var G__5032 = null;
var G__5032__5033 = (function (coll,f){
var this__5010 = this;
return cljs.core.ci_reduce.call(null,coll,f);
});
var G__5032__5034 = (function (coll,f,start){
var this__5011 = this;
return cljs.core.ci_reduce.call(null,coll,f,start);
});
G__5032 = function(coll,f,start){
switch(arguments.length){
case  2 :
return G__5032__5033.call(this,coll,f);
case  3 :
return G__5032__5034.call(this,coll,f,start);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5032;
})()
;
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__5012 = this;
var subvec_seq__5013 = (function subvec_seq(i){
if(cljs.core.truth_(cljs.core._EQ_.call(null,i,this__5012.end)))
{return null;
} else
{return cljs.core.cons.call(null,cljs.core._nth.call(null,this__5012.v,i),(new cljs.core.LazySeq(null,false,(function (){
return subvec_seq.call(null,(i + 1));
}))));
}
});

return subvec_seq__5013.call(null,this__5012.start);
});
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = (function (coll){
var this__5014 = this;
return (this__5014.end - this__5014.start);
});
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = (function (coll){
var this__5015 = this;
return cljs.core._nth.call(null,this__5015.v,(this__5015.end - 1));
});
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = (function (coll){
var this__5016 = this;
if(cljs.core.truth_(cljs.core._EQ_.call(null,this__5016.start,this__5016.end)))
{throw (new Error("Can't pop empty vector"));
} else
{return (new cljs.core.Subvec(this__5016.meta,this__5016.v,this__5016.start,(this__5016.end - 1)));
}
});
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = (function (coll,n,val){
var this__5017 = this;
return cljs.core._assoc.call(null,coll,n,val);
});
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__5018 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__5019 = this;
return (new cljs.core.Subvec(meta,this__5019.v,this__5019.start,this__5019.end));
});
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__5020 = this;
return this__5020.meta;
});
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = (function() {
var G__5036 = null;
var G__5036__5037 = (function (coll,n){
var this__5021 = this;
return cljs.core._nth.call(null,this__5021.v,(this__5021.start + n));
});
var G__5036__5038 = (function (coll,n,not_found){
var this__5022 = this;
return cljs.core._nth.call(null,this__5022.v,(this__5022.start + n),not_found);
});
G__5036 = function(coll,n,not_found){
switch(arguments.length){
case  2 :
return G__5036__5037.call(this,coll,n);
case  3 :
return G__5036__5038.call(this,coll,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5036;
})()
;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__5023 = this;
return cljs.core.with_meta.call(null,cljs.core.Vector.EMPTY,this__5023.meta);
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
var subvec__5040 = (function (v,start){
return subvec.call(null,v,start,cljs.core.count.call(null,v));
});
var subvec__5041 = (function (v,start,end){
return (new cljs.core.Subvec(null,v,start,end));
});
subvec = function(v,start,end){
switch(arguments.length){
case  2 :
return subvec__5040.call(this,v,start);
case  3 :
return subvec__5041.call(this,v,start,end);
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
cljs.core.PersistentQueueSeq.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.PersistentQueueSeq");
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__5043 = this;
return coll;
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = (function (coll){
var this__5044 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__5045 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__5046 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__5046.meta);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__5047 = this;
return cljs.core.cons.call(null,o,coll);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = (function (coll){
var this__5048 = this;
return cljs.core._first.call(null,this__5048.front);
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__5049 = this;
var temp__3695__auto____5050 = cljs.core.next.call(null,this__5049.front);

if(cljs.core.truth_(temp__3695__auto____5050))
{var f1__5051 = temp__3695__auto____5050;

return (new cljs.core.PersistentQueueSeq(this__5049.meta,f1__5051,this__5049.rear));
} else
{if(cljs.core.truth_((this__5049.rear === null)))
{return cljs.core._empty.call(null,coll);
} else
{return (new cljs.core.PersistentQueueSeq(this__5049.meta,this__5049.rear,null));
}
}
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__5052 = this;
return this__5052.meta;
});
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__5053 = this;
return (new cljs.core.PersistentQueueSeq(meta,this__5053.front,this__5053.rear));
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
cljs.core.PersistentQueue.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.PersistentQueue");
});
cljs.core.PersistentQueue.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash = (function (coll){
var this__5054 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__5055 = this;
if(cljs.core.truth_(this__5055.front))
{return (new cljs.core.PersistentQueue(this__5055.meta,(this__5055.count + 1),this__5055.front,cljs.core.conj.call(null,(function (){var or__3548__auto____5056 = this__5055.rear;

if(cljs.core.truth_(or__3548__auto____5056))
{return or__3548__auto____5056;
} else
{return cljs.core.Vector.fromArray([]);
}
})(),o)));
} else
{return (new cljs.core.PersistentQueue(this__5055.meta,(this__5055.count + 1),cljs.core.conj.call(null,this__5055.front,o),cljs.core.Vector.fromArray([])));
}
});
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__5057 = this;
var rear__5058 = cljs.core.seq.call(null,this__5057.rear);

if(cljs.core.truth_((function (){var or__3548__auto____5059 = this__5057.front;

if(cljs.core.truth_(or__3548__auto____5059))
{return or__3548__auto____5059;
} else
{return rear__5058;
}
})()))
{return (new cljs.core.PersistentQueueSeq(null,this__5057.front,cljs.core.seq.call(null,rear__5058)));
} else
{return cljs.core.List.EMPTY;
}
});
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = (function (coll){
var this__5060 = this;
return this__5060.count;
});
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = (function (coll){
var this__5061 = this;
return cljs.core._first.call(null,this__5061.front);
});
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = (function (coll){
var this__5062 = this;
if(cljs.core.truth_(this__5062.front))
{var temp__3695__auto____5063 = cljs.core.next.call(null,this__5062.front);

if(cljs.core.truth_(temp__3695__auto____5063))
{var f1__5064 = temp__3695__auto____5063;

return (new cljs.core.PersistentQueue(this__5062.meta,(this__5062.count - 1),f1__5064,this__5062.rear));
} else
{return (new cljs.core.PersistentQueue(this__5062.meta,(this__5062.count - 1),cljs.core.seq.call(null,this__5062.rear),cljs.core.Vector.fromArray([])));
}
} else
{return coll;
}
});
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = (function (coll){
var this__5065 = this;
return cljs.core.first.call(null,this__5065.front);
});
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = (function (coll){
var this__5066 = this;
return cljs.core.rest.call(null,cljs.core.seq.call(null,coll));
});
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__5067 = this;
return cljs.core.equiv_sequential.call(null,coll,other);
});
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__5068 = this;
return (new cljs.core.PersistentQueue(meta,this__5068.count,this__5068.front,this__5068.rear));
});
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__5069 = this;
return this__5069.meta;
});
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__5070 = this;
return cljs.core.PersistentQueue.EMPTY;
});
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = (new cljs.core.PersistentQueue(null,0,null,cljs.core.Vector.fromArray([])));

/**
* @constructor
*/
cljs.core.NeverEquiv = (function (){
})
cljs.core.NeverEquiv.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.NeverEquiv");
});
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$ = true;
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv = (function (o,other){
var this__5071 = this;
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
var len__5072 = array.length;

var i__5073 = 0;

while(true){
if(cljs.core.truth_((i__5073 < len__5072)))
{if(cljs.core.truth_(cljs.core._EQ_.call(null,k,(array[i__5073]))))
{return i__5073;
} else
{{
var G__5074 = (i__5073 + incr);
i__5073 = G__5074;
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
var obj_map_contains_key_QMARK___5076 = (function (k,strobj){
return obj_map_contains_key_QMARK_.call(null,k,strobj,true,false);
});
var obj_map_contains_key_QMARK___5077 = (function (k,strobj,true_val,false_val){
if(cljs.core.truth_((function (){var and__3546__auto____5075 = goog.isString.call(null,k);

if(cljs.core.truth_(and__3546__auto____5075))
{return strobj.hasOwnProperty(k);
} else
{return and__3546__auto____5075;
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
return obj_map_contains_key_QMARK___5076.call(this,k,strobj);
case  4 :
return obj_map_contains_key_QMARK___5077.call(this,k,strobj,true_val,false_val);
}
throw('Invalid arity: ' + arguments.length);
};
return obj_map_contains_key_QMARK_;
})()
;
cljs.core.obj_map_compare_keys = (function obj_map_compare_keys(a,b){
var a__5080 = cljs.core.hash.call(null,a);
var b__5081 = cljs.core.hash.call(null,b);

if(cljs.core.truth_((a__5080 < b__5081)))
{return -1;
} else
{if(cljs.core.truth_((a__5080 > b__5081)))
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
cljs.core.ObjMap.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.ObjMap");
});
cljs.core.ObjMap.prototype.cljs$core$IHash$ = true;
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash = (function (coll){
var this__5082 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = (function() {
var G__5109 = null;
var G__5109__5110 = (function (coll,k){
var this__5083 = this;
return cljs.core._lookup.call(null,coll,k,null);
});
var G__5109__5111 = (function (coll,k,not_found){
var this__5084 = this;
return cljs.core.obj_map_contains_key_QMARK_.call(null,k,this__5084.strobj,(this__5084.strobj[k]),not_found);
});
G__5109 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__5109__5110.call(this,coll,k);
case  3 :
return G__5109__5111.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5109;
})()
;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__5085 = this;
if(cljs.core.truth_(goog.isString.call(null,k)))
{var new_strobj__5086 = goog.object.clone.call(null,this__5085.strobj);
var overwrite_QMARK___5087 = new_strobj__5086.hasOwnProperty(k);

(new_strobj__5086[k] = v);
if(cljs.core.truth_(overwrite_QMARK___5087))
{return (new cljs.core.ObjMap(this__5085.meta,this__5085.keys,new_strobj__5086));
} else
{var new_keys__5088 = cljs.core.aclone.call(null,this__5085.keys);

new_keys__5088.push(k);
return (new cljs.core.ObjMap(this__5085.meta,new_keys__5088,new_strobj__5086));
}
} else
{return cljs.core.with_meta.call(null,cljs.core.into.call(null,cljs.core.hash_map.call(null,k,v),cljs.core.seq.call(null,coll)),this__5085.meta);
}
});
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = (function (coll,k){
var this__5089 = this;
return cljs.core.obj_map_contains_key_QMARK_.call(null,k,this__5089.strobj);
});
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = (function() {
var G__5113 = null;
var G__5113__5114 = (function (tsym5090,k){
var this__5092 = this;
var tsym5090__5093 = this;

var coll__5094 = tsym5090__5093;

return cljs.core._lookup.call(null,coll__5094,k);
});
var G__5113__5115 = (function (tsym5091,k,not_found){
var this__5095 = this;
var tsym5091__5096 = this;

var coll__5097 = tsym5091__5096;

return cljs.core._lookup.call(null,coll__5097,k,not_found);
});
G__5113 = function(tsym5091,k,not_found){
switch(arguments.length){
case  2 :
return G__5113__5114.call(this,tsym5091,k);
case  3 :
return G__5113__5115.call(this,tsym5091,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5113;
})()
;
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = (function (coll,entry){
var this__5098 = this;
if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null,entry)))
{return cljs.core._assoc.call(null,coll,cljs.core._nth.call(null,entry,0),cljs.core._nth.call(null,entry,1));
} else
{return cljs.core.reduce.call(null,cljs.core._conj,coll,entry);
}
});
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__5099 = this;
if(cljs.core.truth_((this__5099.keys.length > 0)))
{return cljs.core.map.call(null,(function (p1__5079_SHARP_){
return cljs.core.vector.call(null,p1__5079_SHARP_,(this__5099.strobj[p1__5079_SHARP_]));
}),this__5099.keys.sort(cljs.core.obj_map_compare_keys));
} else
{return null;
}
});
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = (function (coll){
var this__5100 = this;
return this__5100.keys.length;
});
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__5101 = this;
return cljs.core.equiv_map.call(null,coll,other);
});
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__5102 = this;
return (new cljs.core.ObjMap(meta,this__5102.keys,this__5102.strobj));
});
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__5103 = this;
return this__5103.meta;
});
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__5104 = this;
return cljs.core.with_meta.call(null,cljs.core.ObjMap.EMPTY,this__5104.meta);
});
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = (function (coll,k){
var this__5105 = this;
if(cljs.core.truth_((function (){var and__3546__auto____5106 = goog.isString.call(null,k);

if(cljs.core.truth_(and__3546__auto____5106))
{return this__5105.strobj.hasOwnProperty(k);
} else
{return and__3546__auto____5106;
}
})()))
{var new_keys__5107 = cljs.core.aclone.call(null,this__5105.keys);
var new_strobj__5108 = goog.object.clone.call(null,this__5105.strobj);

new_keys__5107.splice(cljs.core.scan_array.call(null,1,k,new_keys__5107),1);
cljs.core.js_delete.call(null,new_strobj__5108,k);
return (new cljs.core.ObjMap(this__5105.meta,new_keys__5107,new_strobj__5108));
} else
{return coll;
}
});
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = (new cljs.core.ObjMap(null,cljs.core.array.call(null),cljs.core.js_obj.call(null)));
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
cljs.core.HashMap.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.HashMap");
});
cljs.core.HashMap.prototype.cljs$core$IHash$ = true;
cljs.core.HashMap.prototype.cljs$core$IHash$_hash = (function (coll){
var this__5118 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = (function() {
var G__5156 = null;
var G__5156__5157 = (function (coll,k){
var this__5119 = this;
return cljs.core._lookup.call(null,coll,k,null);
});
var G__5156__5158 = (function (coll,k,not_found){
var this__5120 = this;
var bucket__5121 = (this__5120.hashobj[cljs.core.hash.call(null,k)]);
var i__5122 = (cljs.core.truth_(bucket__5121)?cljs.core.scan_array.call(null,2,k,bucket__5121):null);

if(cljs.core.truth_(i__5122))
{return (bucket__5121[(i__5122 + 1)]);
} else
{return not_found;
}
});
G__5156 = function(coll,k,not_found){
switch(arguments.length){
case  2 :
return G__5156__5157.call(this,coll,k);
case  3 :
return G__5156__5158.call(this,coll,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5156;
})()
;
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = (function (coll,k,v){
var this__5123 = this;
var h__5124 = cljs.core.hash.call(null,k);
var bucket__5125 = (this__5123.hashobj[h__5124]);

if(cljs.core.truth_(bucket__5125))
{var new_bucket__5126 = cljs.core.aclone.call(null,bucket__5125);
var new_hashobj__5127 = goog.object.clone.call(null,this__5123.hashobj);

(new_hashobj__5127[h__5124] = new_bucket__5126);
var temp__3695__auto____5128 = cljs.core.scan_array.call(null,2,k,new_bucket__5126);

if(cljs.core.truth_(temp__3695__auto____5128))
{var i__5129 = temp__3695__auto____5128;

(new_bucket__5126[(i__5129 + 1)] = v);
return (new cljs.core.HashMap(this__5123.meta,this__5123.count,new_hashobj__5127));
} else
{new_bucket__5126.push(k,v);
return (new cljs.core.HashMap(this__5123.meta,(this__5123.count + 1),new_hashobj__5127));
}
} else
{var new_hashobj__5130 = goog.object.clone.call(null,this__5123.hashobj);

(new_hashobj__5130[h__5124] = cljs.core.array.call(null,k,v));
return (new cljs.core.HashMap(this__5123.meta,(this__5123.count + 1),new_hashobj__5130));
}
});
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = (function (coll,k){
var this__5131 = this;
var bucket__5132 = (this__5131.hashobj[cljs.core.hash.call(null,k)]);
var i__5133 = (cljs.core.truth_(bucket__5132)?cljs.core.scan_array.call(null,2,k,bucket__5132):null);

if(cljs.core.truth_(i__5133))
{return true;
} else
{return false;
}
});
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = (function() {
var G__5160 = null;
var G__5160__5161 = (function (tsym5134,k){
var this__5136 = this;
var tsym5134__5137 = this;

var coll__5138 = tsym5134__5137;

return cljs.core._lookup.call(null,coll__5138,k);
});
var G__5160__5162 = (function (tsym5135,k,not_found){
var this__5139 = this;
var tsym5135__5140 = this;

var coll__5141 = tsym5135__5140;

return cljs.core._lookup.call(null,coll__5141,k,not_found);
});
G__5160 = function(tsym5135,k,not_found){
switch(arguments.length){
case  2 :
return G__5160__5161.call(this,tsym5135,k);
case  3 :
return G__5160__5162.call(this,tsym5135,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5160;
})()
;
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = (function (coll,entry){
var this__5142 = this;
if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null,entry)))
{return cljs.core._assoc.call(null,coll,cljs.core._nth.call(null,entry,0),cljs.core._nth.call(null,entry,1));
} else
{return cljs.core.reduce.call(null,cljs.core._conj,coll,entry);
}
});
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__5143 = this;
if(cljs.core.truth_((this__5143.count > 0)))
{var hashes__5144 = cljs.core.js_keys.call(null,this__5143.hashobj).sort();

return cljs.core.mapcat.call(null,(function (p1__5117_SHARP_){
return cljs.core.map.call(null,cljs.core.vec,cljs.core.partition.call(null,2,(this__5143.hashobj[p1__5117_SHARP_])));
}),hashes__5144);
} else
{return null;
}
});
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = (function (coll){
var this__5145 = this;
return this__5145.count;
});
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__5146 = this;
return cljs.core.equiv_map.call(null,coll,other);
});
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__5147 = this;
return (new cljs.core.HashMap(meta,this__5147.count,this__5147.hashobj));
});
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__5148 = this;
return this__5148.meta;
});
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__5149 = this;
return cljs.core.with_meta.call(null,cljs.core.HashMap.EMPTY,this__5149.meta);
});
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = (function (coll,k){
var this__5150 = this;
var h__5151 = cljs.core.hash.call(null,k);
var bucket__5152 = (this__5150.hashobj[h__5151]);
var i__5153 = (cljs.core.truth_(bucket__5152)?cljs.core.scan_array.call(null,2,k,bucket__5152):null);

if(cljs.core.truth_(cljs.core.not.call(null,i__5153)))
{return coll;
} else
{var new_hashobj__5154 = goog.object.clone.call(null,this__5150.hashobj);

if(cljs.core.truth_((3 > bucket__5152.length)))
{cljs.core.js_delete.call(null,new_hashobj__5154,h__5151);
} else
{var new_bucket__5155 = cljs.core.aclone.call(null,bucket__5152);

new_bucket__5155.splice(i__5153,2);
(new_hashobj__5154[h__5151] = new_bucket__5155);
}
return (new cljs.core.HashMap(this__5150.meta,(this__5150.count - 1),new_hashobj__5154));
}
});
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = (new cljs.core.HashMap(null,0,cljs.core.js_obj.call(null)));
cljs.core.HashMap.fromArrays = (function (ks,vs){
var len__5164 = ks.length;

var i__5165 = 0;
var out__5166 = cljs.core.HashMap.EMPTY;

while(true){
if(cljs.core.truth_((i__5165 < len__5164)))
{{
var G__5167 = (i__5165 + 1);
var G__5168 = cljs.core.assoc.call(null,out__5166,(ks[i__5165]),(vs[i__5165]));
i__5165 = G__5167;
out__5166 = G__5168;
continue;
}
} else
{return out__5166;
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
var in$__5169 = cljs.core.seq.call(null,keyvals);
var out__5170 = cljs.core.HashMap.EMPTY;

while(true){
if(cljs.core.truth_(in$__5169))
{{
var G__5171 = cljs.core.nnext.call(null,in$__5169);
var G__5172 = cljs.core.assoc.call(null,out__5170,cljs.core.first.call(null,in$__5169),cljs.core.second.call(null,in$__5169));
in$__5169 = G__5171;
out__5170 = G__5172;
continue;
}
} else
{return out__5170;
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
hash_map.cljs$lang$applyTo = (function (arglist__5173){
var keyvals = cljs.core.seq( arglist__5173 );;
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
{return cljs.core.reduce.call(null,(function (p1__5174_SHARP_,p2__5175_SHARP_){
return cljs.core.conj.call(null,(function (){var or__3548__auto____5176 = p1__5174_SHARP_;

if(cljs.core.truth_(or__3548__auto____5176))
{return or__3548__auto____5176;
} else
{return cljs.core.ObjMap.fromObject([],{});
}
})(),p2__5175_SHARP_);
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
merge.cljs$lang$applyTo = (function (arglist__5177){
var maps = cljs.core.seq( arglist__5177 );;
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
{var merge_entry__5180 = (function (m,e){
var k__5178 = cljs.core.first.call(null,e);
var v__5179 = cljs.core.second.call(null,e);

if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,m,k__5178)))
{return cljs.core.assoc.call(null,m,k__5178,f.call(null,cljs.core.get.call(null,m,k__5178),v__5179));
} else
{return cljs.core.assoc.call(null,m,k__5178,v__5179);
}
});
var merge2__5182 = (function (m1,m2){
return cljs.core.reduce.call(null,merge_entry__5180,(function (){var or__3548__auto____5181 = m1;

if(cljs.core.truth_(or__3548__auto____5181))
{return or__3548__auto____5181;
} else
{return cljs.core.ObjMap.fromObject([],{});
}
})(),cljs.core.seq.call(null,m2));
});

return cljs.core.reduce.call(null,merge2__5182,maps);
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
merge_with.cljs$lang$applyTo = (function (arglist__5183){
var f = cljs.core.first(arglist__5183);
var maps = cljs.core.rest(arglist__5183);
return merge_with__delegate.call(this, f, maps);
});
return merge_with;
})()
;
/**
* Returns a map containing only those entries in map whose key is in keys
*/
cljs.core.select_keys = (function select_keys(map,keyseq){
var ret__5185 = cljs.core.ObjMap.fromObject([],{});
var keys__5186 = cljs.core.seq.call(null,keyseq);

while(true){
if(cljs.core.truth_(keys__5186))
{var key__5187 = cljs.core.first.call(null,keys__5186);
var entry__5188 = cljs.core.get.call(null,map,key__5187,"\uFDD0'user/not-found");

{
var G__5189 = (cljs.core.truth_(cljs.core.not_EQ_.call(null,entry__5188,"\uFDD0'user/not-found"))?cljs.core.assoc.call(null,ret__5185,key__5187,entry__5188):ret__5185);
var G__5190 = cljs.core.next.call(null,keys__5186);
ret__5185 = G__5189;
keys__5186 = G__5190;
continue;
}
} else
{return ret__5185;
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
cljs.core.Set.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Set");
});
cljs.core.Set.prototype.cljs$core$IHash$ = true;
cljs.core.Set.prototype.cljs$core$IHash$_hash = (function (coll){
var this__5191 = this;
return cljs.core.hash_coll.call(null,coll);
});
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = (function() {
var G__5212 = null;
var G__5212__5213 = (function (coll,v){
var this__5192 = this;
return cljs.core._lookup.call(null,coll,v,null);
});
var G__5212__5214 = (function (coll,v,not_found){
var this__5193 = this;
if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null,this__5193.hash_map,v)))
{return v;
} else
{return not_found;
}
});
G__5212 = function(coll,v,not_found){
switch(arguments.length){
case  2 :
return G__5212__5213.call(this,coll,v);
case  3 :
return G__5212__5214.call(this,coll,v,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5212;
})()
;
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = (function() {
var G__5216 = null;
var G__5216__5217 = (function (tsym5194,k){
var this__5196 = this;
var tsym5194__5197 = this;

var coll__5198 = tsym5194__5197;

return cljs.core._lookup.call(null,coll__5198,k);
});
var G__5216__5218 = (function (tsym5195,k,not_found){
var this__5199 = this;
var tsym5195__5200 = this;

var coll__5201 = tsym5195__5200;

return cljs.core._lookup.call(null,coll__5201,k,not_found);
});
G__5216 = function(tsym5195,k,not_found){
switch(arguments.length){
case  2 :
return G__5216__5217.call(this,tsym5195,k);
case  3 :
return G__5216__5218.call(this,tsym5195,k,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5216;
})()
;
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = (function (coll,o){
var this__5202 = this;
return (new cljs.core.Set(this__5202.meta,cljs.core.assoc.call(null,this__5202.hash_map,o,null)));
});
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = (function (coll){
var this__5203 = this;
return cljs.core.keys.call(null,this__5203.hash_map);
});
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = (function (coll,v){
var this__5204 = this;
return (new cljs.core.Set(this__5204.meta,cljs.core.dissoc.call(null,this__5204.hash_map,v)));
});
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = (function (coll){
var this__5205 = this;
return cljs.core.count.call(null,cljs.core.seq.call(null,coll));
});
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = (function (coll,other){
var this__5206 = this;
var and__3546__auto____5207 = cljs.core.set_QMARK_.call(null,other);

if(cljs.core.truth_(and__3546__auto____5207))
{var and__3546__auto____5208 = cljs.core._EQ_.call(null,cljs.core.count.call(null,coll),cljs.core.count.call(null,other));

if(cljs.core.truth_(and__3546__auto____5208))
{return cljs.core.every_QMARK_.call(null,(function (p1__5184_SHARP_){
return cljs.core.contains_QMARK_.call(null,coll,p1__5184_SHARP_);
}),other);
} else
{return and__3546__auto____5208;
}
} else
{return and__3546__auto____5207;
}
});
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = (function (coll,meta){
var this__5209 = this;
return (new cljs.core.Set(meta,this__5209.hash_map));
});
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = (function (coll){
var this__5210 = this;
return this__5210.meta;
});
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = (function (coll){
var this__5211 = this;
return cljs.core.with_meta.call(null,cljs.core.Set.EMPTY,this__5211.meta);
});
cljs.core.Set;
cljs.core.Set.EMPTY = (new cljs.core.Set(null,cljs.core.hash_map.call(null)));
/**
* Returns a set of the distinct elements of coll.
*/
cljs.core.set = (function set(coll){
var in$__5221 = cljs.core.seq.call(null,coll);
var out__5222 = cljs.core.Set.EMPTY;

while(true){
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core.empty_QMARK_.call(null,in$__5221))))
{{
var G__5223 = cljs.core.rest.call(null,in$__5221);
var G__5224 = cljs.core.conj.call(null,out__5222,cljs.core.first.call(null,in$__5221));
in$__5221 = G__5223;
out__5222 = G__5224;
continue;
}
} else
{return out__5222;
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
{var n__5225 = cljs.core.count.call(null,coll);

return cljs.core.reduce.call(null,(function (v,i){
var temp__3695__auto____5226 = cljs.core.find.call(null,smap,cljs.core.nth.call(null,v,i));

if(cljs.core.truth_(temp__3695__auto____5226))
{var e__5227 = temp__3695__auto____5226;

return cljs.core.assoc.call(null,v,i,cljs.core.second.call(null,e__5227));
} else
{return v;
}
}),coll,cljs.core.take.call(null,n__5225,cljs.core.iterate.call(null,cljs.core.inc,0)));
} else
{return cljs.core.map.call(null,(function (p1__5220_SHARP_){
var temp__3695__auto____5228 = cljs.core.find.call(null,smap,p1__5220_SHARP_);

if(cljs.core.truth_(temp__3695__auto____5228))
{var e__5229 = temp__3695__auto____5228;

return cljs.core.second.call(null,e__5229);
} else
{return p1__5220_SHARP_;
}
}),coll);
}
});
/**
* Returns a lazy sequence of the elements of coll with duplicates removed
*/
cljs.core.distinct = (function distinct(coll){
var step__5237 = (function step(xs,seen){
return (new cljs.core.LazySeq(null,false,(function (){
return (function (p__5230,seen){
while(true){
var vec__5231__5232 = p__5230;
var f__5233 = cljs.core.nth.call(null,vec__5231__5232,0,null);
var xs__5234 = vec__5231__5232;

var temp__3698__auto____5235 = cljs.core.seq.call(null,xs__5234);

if(cljs.core.truth_(temp__3698__auto____5235))
{var s__5236 = temp__3698__auto____5235;

if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,seen,f__5233)))
{{
var G__5238 = cljs.core.rest.call(null,s__5236);
var G__5239 = seen;
p__5230 = G__5238;
seen = G__5239;
continue;
}
} else
{return cljs.core.cons.call(null,f__5233,step.call(null,cljs.core.rest.call(null,s__5236),cljs.core.conj.call(null,seen,f__5233)));
}
} else
{return null;
}
break;
}
}).call(null,xs,seen);
})));
});

return step__5237.call(null,coll,cljs.core.set([]));
});
cljs.core.butlast = (function butlast(s){
var ret__5240 = cljs.core.Vector.fromArray([]);
var s__5241 = s;

while(true){
if(cljs.core.truth_(cljs.core.next.call(null,s__5241)))
{{
var G__5242 = cljs.core.conj.call(null,ret__5240,cljs.core.first.call(null,s__5241));
var G__5243 = cljs.core.next.call(null,s__5241);
ret__5240 = G__5242;
s__5241 = G__5243;
continue;
}
} else
{return cljs.core.seq.call(null,ret__5240);
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
{if(cljs.core.truth_((function (){var or__3548__auto____5244 = cljs.core.keyword_QMARK_.call(null,x);

if(cljs.core.truth_(or__3548__auto____5244))
{return or__3548__auto____5244;
} else
{return cljs.core.symbol_QMARK_.call(null,x);
}
})()))
{var i__5245 = x.lastIndexOf("\/");

if(cljs.core.truth_((i__5245 < 0)))
{return cljs.core.subs.call(null,x,2);
} else
{return cljs.core.subs.call(null,x,(i__5245 + 1));
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
if(cljs.core.truth_((function (){var or__3548__auto____5246 = cljs.core.keyword_QMARK_.call(null,x);

if(cljs.core.truth_(or__3548__auto____5246))
{return or__3548__auto____5246;
} else
{return cljs.core.symbol_QMARK_.call(null,x);
}
})()))
{var i__5247 = x.lastIndexOf("\/");

if(cljs.core.truth_((i__5247 > -1)))
{return cljs.core.subs.call(null,x,2,i__5247);
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
var map__5250 = cljs.core.ObjMap.fromObject([],{});
var ks__5251 = cljs.core.seq.call(null,keys);
var vs__5252 = cljs.core.seq.call(null,vals);

while(true){
if(cljs.core.truth_((function (){var and__3546__auto____5253 = ks__5251;

if(cljs.core.truth_(and__3546__auto____5253))
{return vs__5252;
} else
{return and__3546__auto____5253;
}
})()))
{{
var G__5254 = cljs.core.assoc.call(null,map__5250,cljs.core.first.call(null,ks__5251),cljs.core.first.call(null,vs__5252));
var G__5255 = cljs.core.next.call(null,ks__5251);
var G__5256 = cljs.core.next.call(null,vs__5252);
map__5250 = G__5254;
ks__5251 = G__5255;
vs__5252 = G__5256;
continue;
}
} else
{return map__5250;
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
var max_key__5259 = (function (k,x){
return x;
});
var max_key__5260 = (function (k,x,y){
if(cljs.core.truth_((k.call(null,x) > k.call(null,y))))
{return x;
} else
{return y;
}
});
var max_key__5261 = (function() { 
var G__5263__delegate = function (k,x,y,more){
return cljs.core.reduce.call(null,(function (p1__5248_SHARP_,p2__5249_SHARP_){
return max_key.call(null,k,p1__5248_SHARP_,p2__5249_SHARP_);
}),max_key.call(null,k,x,y),more);
};
var G__5263 = function (k,x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5263__delegate.call(this, k, x, y, more);
};
G__5263.cljs$lang$maxFixedArity = 3;
G__5263.cljs$lang$applyTo = (function (arglist__5264){
var k = cljs.core.first(arglist__5264);
var x = cljs.core.first(cljs.core.next(arglist__5264));
var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5264)));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5264)));
return G__5263__delegate.call(this, k, x, y, more);
});
return G__5263;
})()
;
max_key = function(k,x,y,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return max_key__5259.call(this,k,x);
case  3 :
return max_key__5260.call(this,k,x,y);
default:
return max_key__5261.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
max_key.cljs$lang$maxFixedArity = 3;
max_key.cljs$lang$applyTo = max_key__5261.cljs$lang$applyTo;
return max_key;
})()
;
/**
* Returns the x for which (k x), a number, is least.
* @param {...*} var_args
*/
cljs.core.min_key = (function() {
var min_key = null;
var min_key__5265 = (function (k,x){
return x;
});
var min_key__5266 = (function (k,x,y){
if(cljs.core.truth_((k.call(null,x) < k.call(null,y))))
{return x;
} else
{return y;
}
});
var min_key__5267 = (function() { 
var G__5269__delegate = function (k,x,y,more){
return cljs.core.reduce.call(null,(function (p1__5257_SHARP_,p2__5258_SHARP_){
return min_key.call(null,k,p1__5257_SHARP_,p2__5258_SHARP_);
}),min_key.call(null,k,x,y),more);
};
var G__5269 = function (k,x,y,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5269__delegate.call(this, k, x, y, more);
};
G__5269.cljs$lang$maxFixedArity = 3;
G__5269.cljs$lang$applyTo = (function (arglist__5270){
var k = cljs.core.first(arglist__5270);
var x = cljs.core.first(cljs.core.next(arglist__5270));
var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5270)));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5270)));
return G__5269__delegate.call(this, k, x, y, more);
});
return G__5269;
})()
;
min_key = function(k,x,y,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return min_key__5265.call(this,k,x);
case  3 :
return min_key__5266.call(this,k,x,y);
default:
return min_key__5267.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
min_key.cljs$lang$maxFixedArity = 3;
min_key.cljs$lang$applyTo = min_key__5267.cljs$lang$applyTo;
return min_key;
})()
;
/**
* Returns a lazy sequence of lists like partition, but may include
* partitions with fewer than n items at the end.
*/
cljs.core.partition_all = (function() {
var partition_all = null;
var partition_all__5273 = (function (n,coll){
return partition_all.call(null,n,n,coll);
});
var partition_all__5274 = (function (n,step,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____5271 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____5271))
{var s__5272 = temp__3698__auto____5271;

return cljs.core.cons.call(null,cljs.core.take.call(null,n,s__5272),partition_all.call(null,n,step,cljs.core.drop.call(null,step,s__5272)));
} else
{return null;
}
})));
});
partition_all = function(n,step,coll){
switch(arguments.length){
case  2 :
return partition_all__5273.call(this,n,step);
case  3 :
return partition_all__5274.call(this,n,step,coll);
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
var temp__3698__auto____5276 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____5276))
{var s__5277 = temp__3698__auto____5276;

if(cljs.core.truth_(pred.call(null,cljs.core.first.call(null,s__5277))))
{return cljs.core.cons.call(null,cljs.core.first.call(null,s__5277),take_while.call(null,pred,cljs.core.rest.call(null,s__5277)));
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
cljs.core.Range.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Range");
});
cljs.core.Range.prototype.cljs$core$IHash$ = true;
cljs.core.Range.prototype.cljs$core$IHash$_hash = (function (rng){
var this__5278 = this;
return cljs.core.hash_coll.call(null,rng);
});
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = (function (rng,o){
var this__5279 = this;
return cljs.core.cons.call(null,o,rng);
});
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = (function() {
var G__5295 = null;
var G__5295__5296 = (function (rng,f){
var this__5280 = this;
return cljs.core.ci_reduce.call(null,rng,f);
});
var G__5295__5297 = (function (rng,f,s){
var this__5281 = this;
return cljs.core.ci_reduce.call(null,rng,f,s);
});
G__5295 = function(rng,f,s){
switch(arguments.length){
case  2 :
return G__5295__5296.call(this,rng,f);
case  3 :
return G__5295__5297.call(this,rng,f,s);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5295;
})()
;
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = (function (rng){
var this__5282 = this;
var comp__5283 = (cljs.core.truth_((this__5282.step > 0))?cljs.core._LT_:cljs.core._GT_);

if(cljs.core.truth_(comp__5283.call(null,this__5282.start,this__5282.end)))
{return rng;
} else
{return null;
}
});
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = (function (rng){
var this__5284 = this;
if(cljs.core.truth_(cljs.core.not.call(null,cljs.core._seq.call(null,rng))))
{return 0;
} else
{return Math['ceil'].call(null,((this__5284.end - this__5284.start) / this__5284.step));
}
});
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = (function (rng){
var this__5285 = this;
return this__5285.start;
});
cljs.core.Range.prototype.cljs$core$ISeq$_rest = (function (rng){
var this__5286 = this;
if(cljs.core.truth_(cljs.core._seq.call(null,rng)))
{return (new cljs.core.Range(this__5286.meta,(this__5286.start + this__5286.step),this__5286.end,this__5286.step));
} else
{return cljs.core.list.call(null);
}
});
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = (function (rng,other){
var this__5287 = this;
return cljs.core.equiv_sequential.call(null,rng,other);
});
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = (function (rng,meta){
var this__5288 = this;
return (new cljs.core.Range(meta,this__5288.start,this__5288.end,this__5288.step));
});
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = (function (rng){
var this__5289 = this;
return this__5289.meta;
});
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = (function() {
var G__5299 = null;
var G__5299__5300 = (function (rng,n){
var this__5290 = this;
if(cljs.core.truth_((n < cljs.core._count.call(null,rng))))
{return (this__5290.start + (n * this__5290.step));
} else
{if(cljs.core.truth_((function (){var and__3546__auto____5291 = (this__5290.start > this__5290.end);

if(cljs.core.truth_(and__3546__auto____5291))
{return cljs.core._EQ_.call(null,this__5290.step,0);
} else
{return and__3546__auto____5291;
}
})()))
{return this__5290.start;
} else
{throw (new Error("Index out of bounds"));
}
}
});
var G__5299__5301 = (function (rng,n,not_found){
var this__5292 = this;
if(cljs.core.truth_((n < cljs.core._count.call(null,rng))))
{return (this__5292.start + (n * this__5292.step));
} else
{if(cljs.core.truth_((function (){var and__3546__auto____5293 = (this__5292.start > this__5292.end);

if(cljs.core.truth_(and__3546__auto____5293))
{return cljs.core._EQ_.call(null,this__5292.step,0);
} else
{return and__3546__auto____5293;
}
})()))
{return this__5292.start;
} else
{return not_found;
}
}
});
G__5299 = function(rng,n,not_found){
switch(arguments.length){
case  2 :
return G__5299__5300.call(this,rng,n);
case  3 :
return G__5299__5301.call(this,rng,n,not_found);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5299;
})()
;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = (function (rng){
var this__5294 = this;
return cljs.core.with_meta.call(null,cljs.core.List.EMPTY,this__5294.meta);
});
cljs.core.Range;
/**
* Returns a lazy seq of nums from start (inclusive) to end
* (exclusive), by step, where start defaults to 0, step to 1,
* and end to infinity.
*/
cljs.core.range = (function() {
var range = null;
var range__5303 = (function (){
return range.call(null,0,Number['MAX_VALUE'],1);
});
var range__5304 = (function (end){
return range.call(null,0,end,1);
});
var range__5305 = (function (start,end){
return range.call(null,start,end,1);
});
var range__5306 = (function (start,end,step){
return (new cljs.core.Range(null,start,end,step));
});
range = function(start,end,step){
switch(arguments.length){
case  0 :
return range__5303.call(this);
case  1 :
return range__5304.call(this,start);
case  2 :
return range__5305.call(this,start,end);
case  3 :
return range__5306.call(this,start,end,step);
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
var temp__3698__auto____5308 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____5308))
{var s__5309 = temp__3698__auto____5308;

return cljs.core.cons.call(null,cljs.core.first.call(null,s__5309),take_nth.call(null,n,cljs.core.drop.call(null,n,s__5309)));
} else
{return null;
}
})));
});
/**
* Returns a vector of [(take-while pred coll) (drop-while pred coll)]
*/
cljs.core.split_with = (function split_with(pred,coll){
return cljs.core.Vector.fromArray([cljs.core.take_while.call(null,pred,coll),cljs.core.drop_while.call(null,pred,coll)]);
});
/**
* Applies f to each value in coll, splitting it each time f returns
* a new value.  Returns a lazy seq of partitions.
*/
cljs.core.partition_by = (function partition_by(f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____5311 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____5311))
{var s__5312 = temp__3698__auto____5311;

var fst__5313 = cljs.core.first.call(null,s__5312);
var fv__5314 = f.call(null,fst__5313);
var run__5315 = cljs.core.cons.call(null,fst__5313,cljs.core.take_while.call(null,(function (p1__5310_SHARP_){
return cljs.core._EQ_.call(null,fv__5314,f.call(null,p1__5310_SHARP_));
}),cljs.core.next.call(null,s__5312)));

return cljs.core.cons.call(null,run__5315,partition_by.call(null,f,cljs.core.seq.call(null,cljs.core.drop.call(null,cljs.core.count.call(null,run__5315),s__5312))));
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
var reductions__5330 = (function (f,coll){
return (new cljs.core.LazySeq(null,false,(function (){
var temp__3695__auto____5326 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3695__auto____5326))
{var s__5327 = temp__3695__auto____5326;

return reductions.call(null,f,cljs.core.first.call(null,s__5327),cljs.core.rest.call(null,s__5327));
} else
{return cljs.core.list.call(null,f.call(null));
}
})));
});
var reductions__5331 = (function (f,init,coll){
return cljs.core.cons.call(null,init,(new cljs.core.LazySeq(null,false,(function (){
var temp__3698__auto____5328 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(temp__3698__auto____5328))
{var s__5329 = temp__3698__auto____5328;

return reductions.call(null,f,f.call(null,init,cljs.core.first.call(null,s__5329)),cljs.core.rest.call(null,s__5329));
} else
{return null;
}
}))));
});
reductions = function(f,init,coll){
switch(arguments.length){
case  2 :
return reductions__5330.call(this,f,init);
case  3 :
return reductions__5331.call(this,f,init,coll);
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
var juxt__5334 = (function (f){
return (function() {
var G__5339 = null;
var G__5339__5340 = (function (){
return cljs.core.vector.call(null,f.call(null));
});
var G__5339__5341 = (function (x){
return cljs.core.vector.call(null,f.call(null,x));
});
var G__5339__5342 = (function (x,y){
return cljs.core.vector.call(null,f.call(null,x,y));
});
var G__5339__5343 = (function (x,y,z){
return cljs.core.vector.call(null,f.call(null,x,y,z));
});
var G__5339__5344 = (function() { 
var G__5346__delegate = function (x,y,z,args){
return cljs.core.vector.call(null,cljs.core.apply.call(null,f,x,y,z,args));
};
var G__5346 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5346__delegate.call(this, x, y, z, args);
};
G__5346.cljs$lang$maxFixedArity = 3;
G__5346.cljs$lang$applyTo = (function (arglist__5347){
var x = cljs.core.first(arglist__5347);
var y = cljs.core.first(cljs.core.next(arglist__5347));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5347)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5347)));
return G__5346__delegate.call(this, x, y, z, args);
});
return G__5346;
})()
;
G__5339 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__5339__5340.call(this);
case  1 :
return G__5339__5341.call(this,x);
case  2 :
return G__5339__5342.call(this,x,y);
case  3 :
return G__5339__5343.call(this,x,y,z);
default:
return G__5339__5344.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__5339.cljs$lang$maxFixedArity = 3;
G__5339.cljs$lang$applyTo = G__5339__5344.cljs$lang$applyTo;
return G__5339;
})()
});
var juxt__5335 = (function (f,g){
return (function() {
var G__5348 = null;
var G__5348__5349 = (function (){
return cljs.core.vector.call(null,f.call(null),g.call(null));
});
var G__5348__5350 = (function (x){
return cljs.core.vector.call(null,f.call(null,x),g.call(null,x));
});
var G__5348__5351 = (function (x,y){
return cljs.core.vector.call(null,f.call(null,x,y),g.call(null,x,y));
});
var G__5348__5352 = (function (x,y,z){
return cljs.core.vector.call(null,f.call(null,x,y,z),g.call(null,x,y,z));
});
var G__5348__5353 = (function() { 
var G__5355__delegate = function (x,y,z,args){
return cljs.core.vector.call(null,cljs.core.apply.call(null,f,x,y,z,args),cljs.core.apply.call(null,g,x,y,z,args));
};
var G__5355 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5355__delegate.call(this, x, y, z, args);
};
G__5355.cljs$lang$maxFixedArity = 3;
G__5355.cljs$lang$applyTo = (function (arglist__5356){
var x = cljs.core.first(arglist__5356);
var y = cljs.core.first(cljs.core.next(arglist__5356));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5356)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5356)));
return G__5355__delegate.call(this, x, y, z, args);
});
return G__5355;
})()
;
G__5348 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__5348__5349.call(this);
case  1 :
return G__5348__5350.call(this,x);
case  2 :
return G__5348__5351.call(this,x,y);
case  3 :
return G__5348__5352.call(this,x,y,z);
default:
return G__5348__5353.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__5348.cljs$lang$maxFixedArity = 3;
G__5348.cljs$lang$applyTo = G__5348__5353.cljs$lang$applyTo;
return G__5348;
})()
});
var juxt__5336 = (function (f,g,h){
return (function() {
var G__5357 = null;
var G__5357__5358 = (function (){
return cljs.core.vector.call(null,f.call(null),g.call(null),h.call(null));
});
var G__5357__5359 = (function (x){
return cljs.core.vector.call(null,f.call(null,x),g.call(null,x),h.call(null,x));
});
var G__5357__5360 = (function (x,y){
return cljs.core.vector.call(null,f.call(null,x,y),g.call(null,x,y),h.call(null,x,y));
});
var G__5357__5361 = (function (x,y,z){
return cljs.core.vector.call(null,f.call(null,x,y,z),g.call(null,x,y,z),h.call(null,x,y,z));
});
var G__5357__5362 = (function() { 
var G__5364__delegate = function (x,y,z,args){
return cljs.core.vector.call(null,cljs.core.apply.call(null,f,x,y,z,args),cljs.core.apply.call(null,g,x,y,z,args),cljs.core.apply.call(null,h,x,y,z,args));
};
var G__5364 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5364__delegate.call(this, x, y, z, args);
};
G__5364.cljs$lang$maxFixedArity = 3;
G__5364.cljs$lang$applyTo = (function (arglist__5365){
var x = cljs.core.first(arglist__5365);
var y = cljs.core.first(cljs.core.next(arglist__5365));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5365)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5365)));
return G__5364__delegate.call(this, x, y, z, args);
});
return G__5364;
})()
;
G__5357 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__5357__5358.call(this);
case  1 :
return G__5357__5359.call(this,x);
case  2 :
return G__5357__5360.call(this,x,y);
case  3 :
return G__5357__5361.call(this,x,y,z);
default:
return G__5357__5362.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__5357.cljs$lang$maxFixedArity = 3;
G__5357.cljs$lang$applyTo = G__5357__5362.cljs$lang$applyTo;
return G__5357;
})()
});
var juxt__5337 = (function() { 
var G__5366__delegate = function (f,g,h,fs){
var fs__5333 = cljs.core.list_STAR_.call(null,f,g,h,fs);

return (function() {
var G__5367 = null;
var G__5367__5368 = (function (){
return cljs.core.reduce.call(null,(function (p1__5316_SHARP_,p2__5317_SHARP_){
return cljs.core.conj.call(null,p1__5316_SHARP_,p2__5317_SHARP_.call(null));
}),cljs.core.Vector.fromArray([]),fs__5333);
});
var G__5367__5369 = (function (x){
return cljs.core.reduce.call(null,(function (p1__5318_SHARP_,p2__5319_SHARP_){
return cljs.core.conj.call(null,p1__5318_SHARP_,p2__5319_SHARP_.call(null,x));
}),cljs.core.Vector.fromArray([]),fs__5333);
});
var G__5367__5370 = (function (x,y){
return cljs.core.reduce.call(null,(function (p1__5320_SHARP_,p2__5321_SHARP_){
return cljs.core.conj.call(null,p1__5320_SHARP_,p2__5321_SHARP_.call(null,x,y));
}),cljs.core.Vector.fromArray([]),fs__5333);
});
var G__5367__5371 = (function (x,y,z){
return cljs.core.reduce.call(null,(function (p1__5322_SHARP_,p2__5323_SHARP_){
return cljs.core.conj.call(null,p1__5322_SHARP_,p2__5323_SHARP_.call(null,x,y,z));
}),cljs.core.Vector.fromArray([]),fs__5333);
});
var G__5367__5372 = (function() { 
var G__5374__delegate = function (x,y,z,args){
return cljs.core.reduce.call(null,(function (p1__5324_SHARP_,p2__5325_SHARP_){
return cljs.core.conj.call(null,p1__5324_SHARP_,cljs.core.apply.call(null,p2__5325_SHARP_,x,y,z,args));
}),cljs.core.Vector.fromArray([]),fs__5333);
};
var G__5374 = function (x,y,z,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5374__delegate.call(this, x, y, z, args);
};
G__5374.cljs$lang$maxFixedArity = 3;
G__5374.cljs$lang$applyTo = (function (arglist__5375){
var x = cljs.core.first(arglist__5375);
var y = cljs.core.first(cljs.core.next(arglist__5375));
var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5375)));
var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5375)));
return G__5374__delegate.call(this, x, y, z, args);
});
return G__5374;
})()
;
G__5367 = function(x,y,z,var_args){
var args = var_args;
switch(arguments.length){
case  0 :
return G__5367__5368.call(this);
case  1 :
return G__5367__5369.call(this,x);
case  2 :
return G__5367__5370.call(this,x,y);
case  3 :
return G__5367__5371.call(this,x,y,z);
default:
return G__5367__5372.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
G__5367.cljs$lang$maxFixedArity = 3;
G__5367.cljs$lang$applyTo = G__5367__5372.cljs$lang$applyTo;
return G__5367;
})()
};
var G__5366 = function (f,g,h,var_args){
var fs = null;
if (goog.isDef(var_args)) {
  fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3),0);
} 
return G__5366__delegate.call(this, f, g, h, fs);
};
G__5366.cljs$lang$maxFixedArity = 3;
G__5366.cljs$lang$applyTo = (function (arglist__5376){
var f = cljs.core.first(arglist__5376);
var g = cljs.core.first(cljs.core.next(arglist__5376));
var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5376)));
var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__5376)));
return G__5366__delegate.call(this, f, g, h, fs);
});
return G__5366;
})()
;
juxt = function(f,g,h,var_args){
var fs = var_args;
switch(arguments.length){
case  1 :
return juxt__5334.call(this,f);
case  2 :
return juxt__5335.call(this,f,g);
case  3 :
return juxt__5336.call(this,f,g,h);
default:
return juxt__5337.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
juxt.cljs$lang$maxFixedArity = 3;
juxt.cljs$lang$applyTo = juxt__5337.cljs$lang$applyTo;
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
var dorun__5378 = (function (coll){
while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,coll)))
{{
var G__5381 = cljs.core.next.call(null,coll);
coll = G__5381;
continue;
}
} else
{return null;
}
break;
}
});
var dorun__5379 = (function (n,coll){
while(true){
if(cljs.core.truth_((function (){var and__3546__auto____5377 = cljs.core.seq.call(null,coll);

if(cljs.core.truth_(and__3546__auto____5377))
{return (n > 0);
} else
{return and__3546__auto____5377;
}
})()))
{{
var G__5382 = (n - 1);
var G__5383 = cljs.core.next.call(null,coll);
n = G__5382;
coll = G__5383;
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
return dorun__5378.call(this,n);
case  2 :
return dorun__5379.call(this,n,coll);
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
var doall__5384 = (function (coll){
cljs.core.dorun.call(null,coll);
return coll;
});
var doall__5385 = (function (n,coll){
cljs.core.dorun.call(null,n,coll);
return coll;
});
doall = function(n,coll){
switch(arguments.length){
case  1 :
return doall__5384.call(this,n);
case  2 :
return doall__5385.call(this,n,coll);
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
var matches__5387 = re.exec(s);

if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.first.call(null,matches__5387),s)))
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,matches__5387),1)))
{return cljs.core.first.call(null,matches__5387);
} else
{return cljs.core.vec.call(null,matches__5387);
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
var matches__5388 = re.exec(s);

if(cljs.core.truth_((matches__5388 === null)))
{return null;
} else
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.count.call(null,matches__5388),1)))
{return cljs.core.first.call(null,matches__5388);
} else
{return cljs.core.vec.call(null,matches__5388);
}
}
});
/**
* Returns a lazy sequence of successive matches of re in s.
*/
cljs.core.re_seq = (function re_seq(re,s){
var match_data__5389 = cljs.core.re_find.call(null,re,s);
var match_idx__5390 = s.search(re);
var match_str__5391 = (cljs.core.truth_(cljs.core.coll_QMARK_.call(null,match_data__5389))?cljs.core.first.call(null,match_data__5389):match_data__5389);
var post_match__5392 = cljs.core.subs.call(null,s,(match_idx__5390 + cljs.core.count.call(null,match_str__5391)));

if(cljs.core.truth_(match_data__5389))
{return (new cljs.core.LazySeq(null,false,(function (){
return cljs.core.cons.call(null,match_data__5389,re_seq.call(null,re,post_match__5392));
})));
} else
{return null;
}
});
/**
* Returns an instance of RegExp which has compiled the provided string.
*/
cljs.core.re_pattern = (function re_pattern(s){
var vec__5394__5395 = cljs.core.re_find.call(null,/^(?:\(\?([idmsux]*)\))?(.*)/,s);
var ___5396 = cljs.core.nth.call(null,vec__5394__5395,0,null);
var flags__5397 = cljs.core.nth.call(null,vec__5394__5395,1,null);
var pattern__5398 = cljs.core.nth.call(null,vec__5394__5395,2,null);

return (new RegExp(pattern__5398,flags__5397));
});
cljs.core.pr_sequential = (function pr_sequential(print_one,begin,sep,end,opts,coll){
return cljs.core.concat.call(null,cljs.core.Vector.fromArray([begin]),cljs.core.flatten1.call(null,cljs.core.interpose.call(null,cljs.core.Vector.fromArray([sep]),cljs.core.map.call(null,(function (p1__5393_SHARP_){
return print_one.call(null,p1__5393_SHARP_,opts);
}),coll))),cljs.core.Vector.fromArray([end]));
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
{return cljs.core.concat.call(null,(cljs.core.truth_((function (){var and__3546__auto____5399 = cljs.core.get.call(null,opts,"\uFDD0'meta");

if(cljs.core.truth_(and__3546__auto____5399))
{var and__3546__auto____5403 = (function (){var x__352__auto____5400 = obj;

if(cljs.core.truth_((function (){var and__3546__auto____5401 = x__352__auto____5400;

if(cljs.core.truth_(and__3546__auto____5401))
{var and__3546__auto____5402 = x__352__auto____5400.cljs$core$IMeta$;

if(cljs.core.truth_(and__3546__auto____5402))
{return cljs.core.not.call(null,x__352__auto____5400.hasOwnProperty("cljs$core$IMeta$"));
} else
{return and__3546__auto____5402;
}
} else
{return and__3546__auto____5401;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IMeta,x__352__auto____5400);
}
})();

if(cljs.core.truth_(and__3546__auto____5403))
{return cljs.core.meta.call(null,obj);
} else
{return and__3546__auto____5403;
}
} else
{return and__3546__auto____5399;
}
})())?cljs.core.concat.call(null,cljs.core.Vector.fromArray(["^"]),pr_seq.call(null,cljs.core.meta.call(null,obj),opts),cljs.core.Vector.fromArray([" "])):null),(cljs.core.truth_((function (){var x__352__auto____5404 = obj;

if(cljs.core.truth_((function (){var and__3546__auto____5405 = x__352__auto____5404;

if(cljs.core.truth_(and__3546__auto____5405))
{var and__3546__auto____5406 = x__352__auto____5404.cljs$core$IPrintable$;

if(cljs.core.truth_(and__3546__auto____5406))
{return cljs.core.not.call(null,x__352__auto____5404.hasOwnProperty("cljs$core$IPrintable$"));
} else
{return and__3546__auto____5406;
}
} else
{return and__3546__auto____5405;
}
})()))
{return true;
} else
{return cljs.core.type_satisfies_.call(null,cljs.core.IPrintable,x__352__auto____5404);
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
var first_obj__5407 = cljs.core.first.call(null,objs);
var sb__5408 = (new goog.string.StringBuffer());

var G__5409__5410 = cljs.core.seq.call(null,objs);

if(cljs.core.truth_(G__5409__5410))
{var obj__5411 = cljs.core.first.call(null,G__5409__5410);
var G__5409__5412 = G__5409__5410;

while(true){
if(cljs.core.truth_((obj__5411 === first_obj__5407)))
{} else
{sb__5408.append(" ");
}
var G__5413__5414 = cljs.core.seq.call(null,cljs.core.pr_seq.call(null,obj__5411,opts));

if(cljs.core.truth_(G__5413__5414))
{var string__5415 = cljs.core.first.call(null,G__5413__5414);
var G__5413__5416 = G__5413__5414;

while(true){
sb__5408.append(string__5415);
var temp__3698__auto____5417 = cljs.core.next.call(null,G__5413__5416);

if(cljs.core.truth_(temp__3698__auto____5417))
{var G__5413__5418 = temp__3698__auto____5417;

{
var G__5421 = cljs.core.first.call(null,G__5413__5418);
var G__5422 = G__5413__5418;
string__5415 = G__5421;
G__5413__5416 = G__5422;
continue;
}
} else
{}
break;
}
} else
{}
var temp__3698__auto____5419 = cljs.core.next.call(null,G__5409__5412);

if(cljs.core.truth_(temp__3698__auto____5419))
{var G__5409__5420 = temp__3698__auto____5419;

{
var G__5423 = cljs.core.first.call(null,G__5409__5420);
var G__5424 = G__5409__5420;
obj__5411 = G__5423;
G__5409__5412 = G__5424;
continue;
}
} else
{}
break;
}
} else
{}
return cljs.core.str.call(null,sb__5408);
});
/**
* Prints a sequence of objects using string-print, observing all
* the options given in opts
*/
cljs.core.pr_with_opts = (function pr_with_opts(objs,opts){
var first_obj__5425 = cljs.core.first.call(null,objs);

var G__5426__5427 = cljs.core.seq.call(null,objs);

if(cljs.core.truth_(G__5426__5427))
{var obj__5428 = cljs.core.first.call(null,G__5426__5427);
var G__5426__5429 = G__5426__5427;

while(true){
if(cljs.core.truth_((obj__5428 === first_obj__5425)))
{} else
{cljs.core.string_print.call(null," ");
}
var G__5430__5431 = cljs.core.seq.call(null,cljs.core.pr_seq.call(null,obj__5428,opts));

if(cljs.core.truth_(G__5430__5431))
{var string__5432 = cljs.core.first.call(null,G__5430__5431);
var G__5430__5433 = G__5430__5431;

while(true){
cljs.core.string_print.call(null,string__5432);
var temp__3698__auto____5434 = cljs.core.next.call(null,G__5430__5433);

if(cljs.core.truth_(temp__3698__auto____5434))
{var G__5430__5435 = temp__3698__auto____5434;

{
var G__5438 = cljs.core.first.call(null,G__5430__5435);
var G__5439 = G__5430__5435;
string__5432 = G__5438;
G__5430__5433 = G__5439;
continue;
}
} else
{}
break;
}
} else
{}
var temp__3698__auto____5436 = cljs.core.next.call(null,G__5426__5429);

if(cljs.core.truth_(temp__3698__auto____5436))
{var G__5426__5437 = temp__3698__auto____5436;

{
var G__5440 = cljs.core.first.call(null,G__5426__5437);
var G__5441 = G__5426__5437;
obj__5428 = G__5440;
G__5426__5429 = G__5441;
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
pr_str.cljs$lang$applyTo = (function (arglist__5442){
var objs = cljs.core.seq( arglist__5442 );;
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
pr.cljs$lang$applyTo = (function (arglist__5443){
var objs = cljs.core.seq( arglist__5443 );;
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
cljs_core_print.cljs$lang$applyTo = (function (arglist__5444){
var objs = cljs.core.seq( arglist__5444 );;
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
println.cljs$lang$applyTo = (function (arglist__5445){
var objs = cljs.core.seq( arglist__5445 );;
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
prn.cljs$lang$applyTo = (function (arglist__5446){
var objs = cljs.core.seq( arglist__5446 );;
return prn__delegate.call(this, objs);
});
return prn;
})()
;
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = (function (coll,opts){
var pr_pair__5447 = (function (keyval){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,""," ","",opts,keyval);
});

return cljs.core.pr_sequential.call(null,pr_pair__5447,"{",", ","}",opts,coll);
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
{return cljs.core.list.call(null,cljs.core.str.call(null,":",(function (){var temp__3698__auto____5448 = cljs.core.namespace.call(null,obj);

if(cljs.core.truth_(temp__3698__auto____5448))
{var nspc__5449 = temp__3698__auto____5448;

return cljs.core.str.call(null,nspc__5449,"\/");
} else
{return null;
}
})(),cljs.core.name.call(null,obj)));
} else
{if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null,obj)))
{return cljs.core.list.call(null,cljs.core.str.call(null,(function (){var temp__3698__auto____5450 = cljs.core.namespace.call(null,obj);

if(cljs.core.truth_(temp__3698__auto____5450))
{var nspc__5451 = temp__3698__auto____5450;

return cljs.core.str.call(null,nspc__5451,"\/");
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
var pr_pair__5452 = (function (keyval){
return cljs.core.pr_sequential.call(null,cljs.core.pr_seq,""," ","",opts,keyval);
});

return cljs.core.pr_sequential.call(null,pr_pair__5452,"{",", ","}",opts,coll);
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
cljs.core.Atom.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Atom");
});
cljs.core.Atom.prototype.cljs$core$IHash$ = true;
cljs.core.Atom.prototype.cljs$core$IHash$_hash = (function (this$){
var this__5453 = this;
return goog.getUid.call(null,this$);
});
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = (function (this$,oldval,newval){
var this__5454 = this;
var G__5455__5456 = cljs.core.seq.call(null,this__5454.watches);

if(cljs.core.truth_(G__5455__5456))
{var G__5458__5460 = cljs.core.first.call(null,G__5455__5456);
var vec__5459__5461 = G__5458__5460;
var key__5462 = cljs.core.nth.call(null,vec__5459__5461,0,null);
var f__5463 = cljs.core.nth.call(null,vec__5459__5461,1,null);
var G__5455__5464 = G__5455__5456;

var G__5458__5465 = G__5458__5460;
var G__5455__5466 = G__5455__5464;

while(true){
var vec__5467__5468 = G__5458__5465;
var key__5469 = cljs.core.nth.call(null,vec__5467__5468,0,null);
var f__5470 = cljs.core.nth.call(null,vec__5467__5468,1,null);
var G__5455__5471 = G__5455__5466;

f__5470.call(null,key__5469,this$,oldval,newval);
var temp__3698__auto____5472 = cljs.core.next.call(null,G__5455__5471);

if(cljs.core.truth_(temp__3698__auto____5472))
{var G__5455__5473 = temp__3698__auto____5472;

{
var G__5480 = cljs.core.first.call(null,G__5455__5473);
var G__5481 = G__5455__5473;
G__5458__5465 = G__5480;
G__5455__5466 = G__5481;
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
var this__5474 = this;
return this$.watches = cljs.core.assoc.call(null,this__5474.watches,key,f);
});
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = (function (this$,key){
var this__5475 = this;
return this$.watches = cljs.core.dissoc.call(null,this__5475.watches,key);
});
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = (function (a,opts){
var this__5476 = this;
return cljs.core.concat.call(null,cljs.core.Vector.fromArray(["#<Atom: "]),cljs.core._pr_seq.call(null,this__5476.state,opts),">");
});
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = (function (_){
var this__5477 = this;
return this__5477.meta;
});
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = (function (_){
var this__5478 = this;
return this__5478.state;
});
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = (function (o,other){
var this__5479 = this;
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
var atom__5488 = (function (x){
return (new cljs.core.Atom(x,null,null,null));
});
var atom__5489 = (function() { 
var G__5491__delegate = function (x,p__5482){
var map__5483__5484 = p__5482;
var map__5483__5485 = (cljs.core.truth_(cljs.core.seq_QMARK_.call(null,map__5483__5484))?cljs.core.apply.call(null,cljs.core.hash_map,map__5483__5484):map__5483__5484);
var validator__5486 = cljs.core.get.call(null,map__5483__5485,"\uFDD0'validator");
var meta__5487 = cljs.core.get.call(null,map__5483__5485,"\uFDD0'meta");

return (new cljs.core.Atom(x,meta__5487,validator__5486,null));
};
var G__5491 = function (x,var_args){
var p__5482 = null;
if (goog.isDef(var_args)) {
  p__5482 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__5491__delegate.call(this, x, p__5482);
};
G__5491.cljs$lang$maxFixedArity = 1;
G__5491.cljs$lang$applyTo = (function (arglist__5492){
var x = cljs.core.first(arglist__5492);
var p__5482 = cljs.core.rest(arglist__5492);
return G__5491__delegate.call(this, x, p__5482);
});
return G__5491;
})()
;
atom = function(x,var_args){
var p__5482 = var_args;
switch(arguments.length){
case  1 :
return atom__5488.call(this,x);
default:
return atom__5489.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
atom.cljs$lang$maxFixedArity = 1;
atom.cljs$lang$applyTo = atom__5489.cljs$lang$applyTo;
return atom;
})()
;
/**
* Sets the value of atom to newval without regard for the
* current value. Returns newval.
*/
cljs.core.reset_BANG_ = (function reset_BANG_(a,new_value){
var temp__3698__auto____5493 = a.validator;

if(cljs.core.truth_(temp__3698__auto____5493))
{var validate__5494 = temp__3698__auto____5493;

if(cljs.core.truth_(validate__5494.call(null,new_value)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ","Validator rejected reference state","\n",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("\uFDD1'validate","\uFDD1'new-value"),cljs.core.hash_map("\uFDD0'line",3073))))));
}
} else
{}
var old_value__5495 = a.state;

a.state = new_value;
cljs.core._notify_watches.call(null,a,old_value__5495,new_value);
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
var swap_BANG___5496 = (function (a,f){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state));
});
var swap_BANG___5497 = (function (a,f,x){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state,x));
});
var swap_BANG___5498 = (function (a,f,x,y){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state,x,y));
});
var swap_BANG___5499 = (function (a,f,x,y,z){
return cljs.core.reset_BANG_.call(null,a,f.call(null,a.state,x,y,z));
});
var swap_BANG___5500 = (function() { 
var G__5502__delegate = function (a,f,x,y,z,more){
return cljs.core.reset_BANG_.call(null,a,cljs.core.apply.call(null,f,a.state,x,y,z,more));
};
var G__5502 = function (a,f,x,y,z,var_args){
var more = null;
if (goog.isDef(var_args)) {
  more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5),0);
} 
return G__5502__delegate.call(this, a, f, x, y, z, more);
};
G__5502.cljs$lang$maxFixedArity = 5;
G__5502.cljs$lang$applyTo = (function (arglist__5503){
var a = cljs.core.first(arglist__5503);
var f = cljs.core.first(cljs.core.next(arglist__5503));
var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__5503)));
var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5503))));
var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5503)))));
var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__5503)))));
return G__5502__delegate.call(this, a, f, x, y, z, more);
});
return G__5502;
})()
;
swap_BANG_ = function(a,f,x,y,z,var_args){
var more = var_args;
switch(arguments.length){
case  2 :
return swap_BANG___5496.call(this,a,f);
case  3 :
return swap_BANG___5497.call(this,a,f,x);
case  4 :
return swap_BANG___5498.call(this,a,f,x,y);
case  5 :
return swap_BANG___5499.call(this,a,f,x,y,z);
default:
return swap_BANG___5500.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
swap_BANG_.cljs$lang$maxFixedArity = 5;
swap_BANG_.cljs$lang$applyTo = swap_BANG___5500.cljs$lang$applyTo;
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
alter_meta_BANG_.cljs$lang$applyTo = (function (arglist__5504){
var iref = cljs.core.first(arglist__5504);
var f = cljs.core.first(cljs.core.next(arglist__5504));
var args = cljs.core.rest(cljs.core.next(arglist__5504));
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
var gensym__5505 = (function (){
return gensym.call(null,"G__");
});
var gensym__5506 = (function (prefix_string){
if(cljs.core.truth_((cljs.core.gensym_counter === null)))
{cljs.core.gensym_counter = cljs.core.atom.call(null,0);
} else
{}
return cljs.core.symbol.call(null,cljs.core.str.call(null,prefix_string,cljs.core.swap_BANG_.call(null,cljs.core.gensym_counter,cljs.core.inc)));
});
gensym = function(prefix_string){
switch(arguments.length){
case  0 :
return gensym__5505.call(this);
case  1 :
return gensym__5506.call(this,prefix_string);
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
cljs.core.Delay.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.Delay");
});
cljs.core.Delay.prototype.cljs$core$IPending$ = true;
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_ = (function (d){
var this__5508 = this;
return cljs.core.not.call(null,(cljs.core.deref.call(null,this__5508.state) === null));
});
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = (function (_){
var this__5509 = this;
if(cljs.core.truth_(cljs.core.deref.call(null,this__5509.state)))
{} else
{cljs.core.swap_BANG_.call(null,this__5509.state,this__5509.f);
}
return cljs.core.deref.call(null,this__5509.state);
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
delay.cljs$lang$applyTo = (function (arglist__5510){
var body = cljs.core.seq( arglist__5510 );;
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
var map__5511__5512 = options;
var map__5511__5513 = (cljs.core.truth_(cljs.core.seq_QMARK_.call(null,map__5511__5512))?cljs.core.apply.call(null,cljs.core.hash_map,map__5511__5512):map__5511__5512);
var keywordize_keys__5514 = cljs.core.get.call(null,map__5511__5513,"\uFDD0'keywordize-keys");
var keyfn__5515 = (cljs.core.truth_(keywordize_keys__5514)?cljs.core.keyword:cljs.core.str);
var f__5521 = (function thisfn(x){
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
{return cljs.core.into.call(null,cljs.core.ObjMap.fromObject([],{}),(function (){var iter__416__auto____5520 = (function iter__5516(s__5517){
return (new cljs.core.LazySeq(null,false,(function (){
var s__5517__5518 = s__5517;

while(true){
if(cljs.core.truth_(cljs.core.seq.call(null,s__5517__5518)))
{var k__5519 = cljs.core.first.call(null,s__5517__5518);

return cljs.core.cons.call(null,cljs.core.Vector.fromArray([keyfn__5515.call(null,k__5519),thisfn.call(null,(x[k__5519]))]),iter__5516.call(null,cljs.core.rest.call(null,s__5517__5518)));
} else
{return null;
}
break;
}
})));
});

return iter__416__auto____5520.call(null,cljs.core.js_keys.call(null,x));
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

return f__5521.call(null,x);
};
var js__GT_clj = function (x,var_args){
var options = null;
if (goog.isDef(var_args)) {
  options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return js__GT_clj__delegate.call(this, x, options);
};
js__GT_clj.cljs$lang$maxFixedArity = 1;
js__GT_clj.cljs$lang$applyTo = (function (arglist__5522){
var x = cljs.core.first(arglist__5522);
var options = cljs.core.rest(arglist__5522);
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
var mem__5523 = cljs.core.atom.call(null,cljs.core.ObjMap.fromObject([],{}));

return (function() { 
var G__5527__delegate = function (args){
var temp__3695__auto____5524 = cljs.core.get.call(null,cljs.core.deref.call(null,mem__5523),args);

if(cljs.core.truth_(temp__3695__auto____5524))
{var v__5525 = temp__3695__auto____5524;

return v__5525;
} else
{var ret__5526 = cljs.core.apply.call(null,f,args);

cljs.core.swap_BANG_.call(null,mem__5523,cljs.core.assoc,args,ret__5526);
return ret__5526;
}
};
var G__5527 = function (var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0),0);
} 
return G__5527__delegate.call(this, args);
};
G__5527.cljs$lang$maxFixedArity = 0;
G__5527.cljs$lang$applyTo = (function (arglist__5528){
var args = cljs.core.seq( arglist__5528 );;
return G__5527__delegate.call(this, args);
});
return G__5527;
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
var trampoline__5530 = (function (f){
while(true){
var ret__5529 = f.call(null);

if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null,ret__5529)))
{{
var G__5533 = ret__5529;
f = G__5533;
continue;
}
} else
{return ret__5529;
}
break;
}
});
var trampoline__5531 = (function() { 
var G__5534__delegate = function (f,args){
return trampoline.call(null,(function (){
return cljs.core.apply.call(null,f,args);
}));
};
var G__5534 = function (f,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__5534__delegate.call(this, f, args);
};
G__5534.cljs$lang$maxFixedArity = 1;
G__5534.cljs$lang$applyTo = (function (arglist__5535){
var f = cljs.core.first(arglist__5535);
var args = cljs.core.rest(arglist__5535);
return G__5534__delegate.call(this, f, args);
});
return G__5534;
})()
;
trampoline = function(f,var_args){
var args = var_args;
switch(arguments.length){
case  1 :
return trampoline__5530.call(this,f);
default:
return trampoline__5531.apply(this,arguments);
}
throw('Invalid arity: ' + arguments.length);
};
trampoline.cljs$lang$maxFixedArity = 1;
trampoline.cljs$lang$applyTo = trampoline__5531.cljs$lang$applyTo;
return trampoline;
})()
;
/**
* Returns a random floating point number between 0 (inclusive) and
* n (default 1) (exclusive).
*/
cljs.core.rand = (function() {
var rand = null;
var rand__5536 = (function (){
return rand.call(null,1);
});
var rand__5537 = (function (n){
return Math.random() * n;
});
rand = function(n){
switch(arguments.length){
case  0 :
return rand__5536.call(this);
case  1 :
return rand__5537.call(this,n);
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
var k__5539 = f.call(null,x);

return cljs.core.assoc.call(null,ret,k__5539,cljs.core.conj.call(null,cljs.core.get.call(null,ret,k__5539,cljs.core.Vector.fromArray([])),x));
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
var isa_QMARK___5548 = (function (child,parent){
return isa_QMARK_.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),child,parent);
});
var isa_QMARK___5549 = (function (h,child,parent){
var or__3548__auto____5540 = cljs.core._EQ_.call(null,child,parent);

if(cljs.core.truth_(or__3548__auto____5540))
{return or__3548__auto____5540;
} else
{var or__3548__auto____5541 = cljs.core.contains_QMARK_.call(null,"\uFDD0'ancestors".call(null,h).call(null,child),parent);

if(cljs.core.truth_(or__3548__auto____5541))
{return or__3548__auto____5541;
} else
{var and__3546__auto____5542 = cljs.core.vector_QMARK_.call(null,parent);

if(cljs.core.truth_(and__3546__auto____5542))
{var and__3546__auto____5543 = cljs.core.vector_QMARK_.call(null,child);

if(cljs.core.truth_(and__3546__auto____5543))
{var and__3546__auto____5544 = cljs.core._EQ_.call(null,cljs.core.count.call(null,parent),cljs.core.count.call(null,child));

if(cljs.core.truth_(and__3546__auto____5544))
{var ret__5545 = true;
var i__5546 = 0;

while(true){
if(cljs.core.truth_((function (){var or__3548__auto____5547 = cljs.core.not.call(null,ret__5545);

if(cljs.core.truth_(or__3548__auto____5547))
{return or__3548__auto____5547;
} else
{return cljs.core._EQ_.call(null,i__5546,cljs.core.count.call(null,parent));
}
})()))
{return ret__5545;
} else
{{
var G__5551 = isa_QMARK_.call(null,h,child.call(null,i__5546),parent.call(null,i__5546));
var G__5552 = (i__5546 + 1);
ret__5545 = G__5551;
i__5546 = G__5552;
continue;
}
}
break;
}
} else
{return and__3546__auto____5544;
}
} else
{return and__3546__auto____5543;
}
} else
{return and__3546__auto____5542;
}
}
}
});
isa_QMARK_ = function(h,child,parent){
switch(arguments.length){
case  2 :
return isa_QMARK___5548.call(this,h,child);
case  3 :
return isa_QMARK___5549.call(this,h,child,parent);
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
var parents__5553 = (function (tag){
return parents.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),tag);
});
var parents__5554 = (function (h,tag){
return cljs.core.not_empty.call(null,cljs.core.get.call(null,"\uFDD0'parents".call(null,h),tag));
});
parents = function(h,tag){
switch(arguments.length){
case  1 :
return parents__5553.call(this,h);
case  2 :
return parents__5554.call(this,h,tag);
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
var ancestors__5556 = (function (tag){
return ancestors.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),tag);
});
var ancestors__5557 = (function (h,tag){
return cljs.core.not_empty.call(null,cljs.core.get.call(null,"\uFDD0'ancestors".call(null,h),tag));
});
ancestors = function(h,tag){
switch(arguments.length){
case  1 :
return ancestors__5556.call(this,h);
case  2 :
return ancestors__5557.call(this,h,tag);
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
var descendants__5559 = (function (tag){
return descendants.call(null,cljs.core.deref.call(null,cljs.core.global_hierarchy),tag);
});
var descendants__5560 = (function (h,tag){
return cljs.core.not_empty.call(null,cljs.core.get.call(null,"\uFDD0'descendants".call(null,h),tag));
});
descendants = function(h,tag){
switch(arguments.length){
case  1 :
return descendants__5559.call(this,h);
case  2 :
return descendants__5560.call(this,h,tag);
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
var derive__5570 = (function (tag,parent){
if(cljs.core.truth_(cljs.core.namespace.call(null,parent)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("\uFDD1'namespace","\uFDD1'parent"),cljs.core.hash_map("\uFDD0'line",3365))))));
}
cljs.core.swap_BANG_.call(null,cljs.core.global_hierarchy,derive,tag,parent);
return null;
});
var derive__5571 = (function (h,tag,parent){
if(cljs.core.truth_(cljs.core.not_EQ_.call(null,tag,parent)))
{} else
{throw (new Error(cljs.core.str.call(null,"Assert failed: ",cljs.core.pr_str.call(null,cljs.core.with_meta(cljs.core.list("\uFDD1'not=","\uFDD1'tag","\uFDD1'parent"),cljs.core.hash_map("\uFDD0'line",3369))))));
}
var tp__5565 = "\uFDD0'parents".call(null,h);
var td__5566 = "\uFDD0'descendants".call(null,h);
var ta__5567 = "\uFDD0'ancestors".call(null,h);
var tf__5568 = (function (m,source,sources,target,targets){
return cljs.core.reduce.call(null,(function (ret,k){
return cljs.core.assoc.call(null,ret,k,cljs.core.reduce.call(null,cljs.core.conj,cljs.core.get.call(null,targets,k,cljs.core.set([])),cljs.core.cons.call(null,target,targets.call(null,target))));
}),m,cljs.core.cons.call(null,source,sources.call(null,source)));
});

var or__3548__auto____5569 = (cljs.core.truth_(cljs.core.contains_QMARK_.call(null,tp__5565.call(null,tag),parent))?null:(function (){if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,ta__5567.call(null,tag),parent)))
{throw (new Error(cljs.core.str.call(null,tag,"already has",parent,"as ancestor")));
} else
{}
if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,ta__5567.call(null,parent),tag)))
{throw (new Error(cljs.core.str.call(null,"Cyclic derivation:",parent,"has",tag,"as ancestor")));
} else
{}
return cljs.core.ObjMap.fromObject(["\uFDD0'parents","\uFDD0'ancestors","\uFDD0'descendants"],{"\uFDD0'parents":cljs.core.assoc.call(null,"\uFDD0'parents".call(null,h),tag,cljs.core.conj.call(null,cljs.core.get.call(null,tp__5565,tag,cljs.core.set([])),parent)),"\uFDD0'ancestors":tf__5568.call(null,"\uFDD0'ancestors".call(null,h),tag,td__5566,parent,ta__5567),"\uFDD0'descendants":tf__5568.call(null,"\uFDD0'descendants".call(null,h),parent,ta__5567,tag,td__5566)});
})());

if(cljs.core.truth_(or__3548__auto____5569))
{return or__3548__auto____5569;
} else
{return h;
}
});
derive = function(h,tag,parent){
switch(arguments.length){
case  2 :
return derive__5570.call(this,h,tag);
case  3 :
return derive__5571.call(this,h,tag,parent);
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
var underive__5577 = (function (tag,parent){
cljs.core.swap_BANG_.call(null,cljs.core.global_hierarchy,underive,tag,parent);
return null;
});
var underive__5578 = (function (h,tag,parent){
var parentMap__5573 = "\uFDD0'parents".call(null,h);
var childsParents__5574 = (cljs.core.truth_(parentMap__5573.call(null,tag))?cljs.core.disj.call(null,parentMap__5573.call(null,tag),parent):cljs.core.set([]));
var newParents__5575 = (cljs.core.truth_(cljs.core.not_empty.call(null,childsParents__5574))?cljs.core.assoc.call(null,parentMap__5573,tag,childsParents__5574):cljs.core.dissoc.call(null,parentMap__5573,tag));
var deriv_seq__5576 = cljs.core.flatten.call(null,cljs.core.map.call(null,(function (p1__5562_SHARP_){
return cljs.core.cons.call(null,cljs.core.first.call(null,p1__5562_SHARP_),cljs.core.interpose.call(null,cljs.core.first.call(null,p1__5562_SHARP_),cljs.core.second.call(null,p1__5562_SHARP_)));
}),cljs.core.seq.call(null,newParents__5575)));

if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null,parentMap__5573.call(null,tag),parent)))
{return cljs.core.reduce.call(null,(function (p1__5563_SHARP_,p2__5564_SHARP_){
return cljs.core.apply.call(null,cljs.core.derive,p1__5563_SHARP_,p2__5564_SHARP_);
}),cljs.core.make_hierarchy.call(null),cljs.core.partition.call(null,2,deriv_seq__5576));
} else
{return h;
}
});
underive = function(h,tag,parent){
switch(arguments.length){
case  2 :
return underive__5577.call(this,h,tag);
case  3 :
return underive__5578.call(this,h,tag,parent);
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
var xprefs__5580 = cljs.core.deref.call(null,prefer_table).call(null,x);

var or__3548__auto____5582 = (cljs.core.truth_((function (){var and__3546__auto____5581 = xprefs__5580;

if(cljs.core.truth_(and__3546__auto____5581))
{return xprefs__5580.call(null,y);
} else
{return and__3546__auto____5581;
}
})())?true:null);

if(cljs.core.truth_(or__3548__auto____5582))
{return or__3548__auto____5582;
} else
{var or__3548__auto____5584 = (function (){var ps__5583 = cljs.core.parents.call(null,y);

while(true){
if(cljs.core.truth_((cljs.core.count.call(null,ps__5583) > 0)))
{if(cljs.core.truth_(prefers_STAR_.call(null,x,cljs.core.first.call(null,ps__5583),prefer_table)))
{} else
{}
{
var G__5587 = cljs.core.rest.call(null,ps__5583);
ps__5583 = G__5587;
continue;
}
} else
{return null;
}
break;
}
})();

if(cljs.core.truth_(or__3548__auto____5584))
{return or__3548__auto____5584;
} else
{var or__3548__auto____5586 = (function (){var ps__5585 = cljs.core.parents.call(null,x);

while(true){
if(cljs.core.truth_((cljs.core.count.call(null,ps__5585) > 0)))
{if(cljs.core.truth_(prefers_STAR_.call(null,cljs.core.first.call(null,ps__5585),y,prefer_table)))
{} else
{}
{
var G__5588 = cljs.core.rest.call(null,ps__5585);
ps__5585 = G__5588;
continue;
}
} else
{return null;
}
break;
}
})();

if(cljs.core.truth_(or__3548__auto____5586))
{return or__3548__auto____5586;
} else
{return false;
}
}
}
});
cljs.core.dominates = (function dominates(x,y,prefer_table){
var or__3548__auto____5589 = cljs.core.prefers_STAR_.call(null,x,y,prefer_table);

if(cljs.core.truth_(or__3548__auto____5589))
{return or__3548__auto____5589;
} else
{return cljs.core.isa_QMARK_.call(null,x,y);
}
});
cljs.core.find_and_cache_best_method = (function find_and_cache_best_method(name,dispatch_val,hierarchy,method_table,prefer_table,method_cache,cached_hierarchy){
var best_entry__5598 = cljs.core.reduce.call(null,(function (be,p__5590){
var vec__5591__5592 = p__5590;
var k__5593 = cljs.core.nth.call(null,vec__5591__5592,0,null);
var ___5594 = cljs.core.nth.call(null,vec__5591__5592,1,null);
var e__5595 = vec__5591__5592;

if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null,dispatch_val,k__5593)))
{var be2__5597 = (cljs.core.truth_((function (){var or__3548__auto____5596 = (be === null);

if(cljs.core.truth_(or__3548__auto____5596))
{return or__3548__auto____5596;
} else
{return cljs.core.dominates.call(null,k__5593,cljs.core.first.call(null,be),prefer_table);
}
})())?e__5595:be);

if(cljs.core.truth_(cljs.core.dominates.call(null,cljs.core.first.call(null,be2__5597),k__5593,prefer_table)))
{} else
{throw (new Error(cljs.core.str.call(null,"Multiple methods in multimethod '",name,"' match dispatch value: ",dispatch_val," -> ",k__5593," and ",cljs.core.first.call(null,be2__5597),", and neither is preferred")));
}
return be2__5597;
} else
{return be;
}
}),null,cljs.core.deref.call(null,method_table));

if(cljs.core.truth_(best_entry__5598))
{if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.deref.call(null,cached_hierarchy),cljs.core.deref.call(null,hierarchy))))
{cljs.core.swap_BANG_.call(null,method_cache,cljs.core.assoc,dispatch_val,cljs.core.second.call(null,best_entry__5598));
return cljs.core.second.call(null,best_entry__5598);
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
if(cljs.core.truth_((function (){var and__3546__auto____5599 = mf;

if(cljs.core.truth_(and__3546__auto____5599))
{return mf.cljs$core$IMultiFn$_reset;
} else
{return and__3546__auto____5599;
}
})()))
{return mf.cljs$core$IMultiFn$_reset(mf);
} else
{return (function (){var or__3548__auto____5600 = (cljs.core._reset[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5600))
{return or__3548__auto____5600;
} else
{var or__3548__auto____5601 = (cljs.core._reset["_"]);

if(cljs.core.truth_(or__3548__auto____5601))
{return or__3548__auto____5601;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-reset",mf);
}
}
})().call(null,mf);
}
});
cljs.core._add_method = (function _add_method(mf,dispatch_val,method){
if(cljs.core.truth_((function (){var and__3546__auto____5602 = mf;

if(cljs.core.truth_(and__3546__auto____5602))
{return mf.cljs$core$IMultiFn$_add_method;
} else
{return and__3546__auto____5602;
}
})()))
{return mf.cljs$core$IMultiFn$_add_method(mf,dispatch_val,method);
} else
{return (function (){var or__3548__auto____5603 = (cljs.core._add_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5603))
{return or__3548__auto____5603;
} else
{var or__3548__auto____5604 = (cljs.core._add_method["_"]);

if(cljs.core.truth_(or__3548__auto____5604))
{return or__3548__auto____5604;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-add-method",mf);
}
}
})().call(null,mf,dispatch_val,method);
}
});
cljs.core._remove_method = (function _remove_method(mf,dispatch_val){
if(cljs.core.truth_((function (){var and__3546__auto____5605 = mf;

if(cljs.core.truth_(and__3546__auto____5605))
{return mf.cljs$core$IMultiFn$_remove_method;
} else
{return and__3546__auto____5605;
}
})()))
{return mf.cljs$core$IMultiFn$_remove_method(mf,dispatch_val);
} else
{return (function (){var or__3548__auto____5606 = (cljs.core._remove_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5606))
{return or__3548__auto____5606;
} else
{var or__3548__auto____5607 = (cljs.core._remove_method["_"]);

if(cljs.core.truth_(or__3548__auto____5607))
{return or__3548__auto____5607;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-remove-method",mf);
}
}
})().call(null,mf,dispatch_val);
}
});
cljs.core._prefer_method = (function _prefer_method(mf,dispatch_val,dispatch_val_y){
if(cljs.core.truth_((function (){var and__3546__auto____5608 = mf;

if(cljs.core.truth_(and__3546__auto____5608))
{return mf.cljs$core$IMultiFn$_prefer_method;
} else
{return and__3546__auto____5608;
}
})()))
{return mf.cljs$core$IMultiFn$_prefer_method(mf,dispatch_val,dispatch_val_y);
} else
{return (function (){var or__3548__auto____5609 = (cljs.core._prefer_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5609))
{return or__3548__auto____5609;
} else
{var or__3548__auto____5610 = (cljs.core._prefer_method["_"]);

if(cljs.core.truth_(or__3548__auto____5610))
{return or__3548__auto____5610;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-prefer-method",mf);
}
}
})().call(null,mf,dispatch_val,dispatch_val_y);
}
});
cljs.core._get_method = (function _get_method(mf,dispatch_val){
if(cljs.core.truth_((function (){var and__3546__auto____5611 = mf;

if(cljs.core.truth_(and__3546__auto____5611))
{return mf.cljs$core$IMultiFn$_get_method;
} else
{return and__3546__auto____5611;
}
})()))
{return mf.cljs$core$IMultiFn$_get_method(mf,dispatch_val);
} else
{return (function (){var or__3548__auto____5612 = (cljs.core._get_method[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5612))
{return or__3548__auto____5612;
} else
{var or__3548__auto____5613 = (cljs.core._get_method["_"]);

if(cljs.core.truth_(or__3548__auto____5613))
{return or__3548__auto____5613;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-get-method",mf);
}
}
})().call(null,mf,dispatch_val);
}
});
cljs.core._methods = (function _methods(mf){
if(cljs.core.truth_((function (){var and__3546__auto____5614 = mf;

if(cljs.core.truth_(and__3546__auto____5614))
{return mf.cljs$core$IMultiFn$_methods;
} else
{return and__3546__auto____5614;
}
})()))
{return mf.cljs$core$IMultiFn$_methods(mf);
} else
{return (function (){var or__3548__auto____5615 = (cljs.core._methods[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5615))
{return or__3548__auto____5615;
} else
{var or__3548__auto____5616 = (cljs.core._methods["_"]);

if(cljs.core.truth_(or__3548__auto____5616))
{return or__3548__auto____5616;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-methods",mf);
}
}
})().call(null,mf);
}
});
cljs.core._prefers = (function _prefers(mf){
if(cljs.core.truth_((function (){var and__3546__auto____5617 = mf;

if(cljs.core.truth_(and__3546__auto____5617))
{return mf.cljs$core$IMultiFn$_prefers;
} else
{return and__3546__auto____5617;
}
})()))
{return mf.cljs$core$IMultiFn$_prefers(mf);
} else
{return (function (){var or__3548__auto____5618 = (cljs.core._prefers[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5618))
{return or__3548__auto____5618;
} else
{var or__3548__auto____5619 = (cljs.core._prefers["_"]);

if(cljs.core.truth_(or__3548__auto____5619))
{return or__3548__auto____5619;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-prefers",mf);
}
}
})().call(null,mf);
}
});
cljs.core._dispatch = (function _dispatch(mf,args){
if(cljs.core.truth_((function (){var and__3546__auto____5620 = mf;

if(cljs.core.truth_(and__3546__auto____5620))
{return mf.cljs$core$IMultiFn$_dispatch;
} else
{return and__3546__auto____5620;
}
})()))
{return mf.cljs$core$IMultiFn$_dispatch(mf,args);
} else
{return (function (){var or__3548__auto____5621 = (cljs.core._dispatch[goog.typeOf.call(null,mf)]);

if(cljs.core.truth_(or__3548__auto____5621))
{return or__3548__auto____5621;
} else
{var or__3548__auto____5622 = (cljs.core._dispatch["_"]);

if(cljs.core.truth_(or__3548__auto____5622))
{return or__3548__auto____5622;
} else
{throw cljs.core.missing_protocol.call(null,"IMultiFn.-dispatch",mf);
}
}
})().call(null,mf,args);
}
});
cljs.core.do_dispatch = (function do_dispatch(mf,dispatch_fn,args){
var dispatch_val__5623 = cljs.core.apply.call(null,dispatch_fn,args);
var target_fn__5624 = cljs.core._get_method.call(null,mf,dispatch_val__5623);

if(cljs.core.truth_(target_fn__5624))
{} else
{throw (new Error(cljs.core.str.call(null,"No method in multimethod '",cljs.core.name,"' for dispatch value: ",dispatch_val__5623)));
}
return cljs.core.apply.call(null,target_fn__5624,args);
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
cljs.core.MultiFn.cljs$core$IPrintable$_pr_seq = (function (this__267__auto__){
return cljs.core.list.call(null,"cljs.core.MultiFn");
});
cljs.core.MultiFn.prototype.cljs$core$IHash$ = true;
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash = (function (this$){
var this__5625 = this;
return goog.getUid.call(null,this$);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = (function (mf){
var this__5626 = this;
cljs.core.swap_BANG_.call(null,this__5626.method_table,(function (mf){
return cljs.core.ObjMap.fromObject([],{});
}));
cljs.core.swap_BANG_.call(null,this__5626.method_cache,(function (mf){
return cljs.core.ObjMap.fromObject([],{});
}));
cljs.core.swap_BANG_.call(null,this__5626.prefer_table,(function (mf){
return cljs.core.ObjMap.fromObject([],{});
}));
cljs.core.swap_BANG_.call(null,this__5626.cached_hierarchy,(function (mf){
return null;
}));
return mf;
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = (function (mf,dispatch_val,method){
var this__5627 = this;
cljs.core.swap_BANG_.call(null,this__5627.method_table,cljs.core.assoc,dispatch_val,method);
cljs.core.reset_cache.call(null,this__5627.method_cache,this__5627.method_table,this__5627.cached_hierarchy,this__5627.hierarchy);
return mf;
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = (function (mf,dispatch_val){
var this__5628 = this;
cljs.core.swap_BANG_.call(null,this__5628.method_table,cljs.core.dissoc,dispatch_val);
cljs.core.reset_cache.call(null,this__5628.method_cache,this__5628.method_table,this__5628.cached_hierarchy,this__5628.hierarchy);
return mf;
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = (function (mf,dispatch_val){
var this__5629 = this;
if(cljs.core.truth_(cljs.core._EQ_.call(null,cljs.core.deref.call(null,this__5629.cached_hierarchy),cljs.core.deref.call(null,this__5629.hierarchy))))
{} else
{cljs.core.reset_cache.call(null,this__5629.method_cache,this__5629.method_table,this__5629.cached_hierarchy,this__5629.hierarchy);
}
var temp__3695__auto____5630 = cljs.core.deref.call(null,this__5629.method_cache).call(null,dispatch_val);

if(cljs.core.truth_(temp__3695__auto____5630))
{var target_fn__5631 = temp__3695__auto____5630;

return target_fn__5631;
} else
{var temp__3695__auto____5632 = cljs.core.find_and_cache_best_method.call(null,this__5629.name,dispatch_val,this__5629.hierarchy,this__5629.method_table,this__5629.prefer_table,this__5629.method_cache,this__5629.cached_hierarchy);

if(cljs.core.truth_(temp__3695__auto____5632))
{var target_fn__5633 = temp__3695__auto____5632;

return target_fn__5633;
} else
{return cljs.core.deref.call(null,this__5629.method_table).call(null,this__5629.default_dispatch_val);
}
}
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = (function (mf,dispatch_val_x,dispatch_val_y){
var this__5634 = this;
if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null,dispatch_val_x,dispatch_val_y,this__5634.prefer_table)))
{throw (new Error(cljs.core.str.call(null,"Preference conflict in multimethod '",this__5634.name,"': ",dispatch_val_y," is already preferred to ",dispatch_val_x)));
} else
{}
cljs.core.swap_BANG_.call(null,this__5634.prefer_table,(function (old){
return cljs.core.assoc.call(null,old,dispatch_val_x,cljs.core.conj.call(null,cljs.core.get.call(null,old,dispatch_val_x,cljs.core.set([])),dispatch_val_y));
}));
return cljs.core.reset_cache.call(null,this__5634.method_cache,this__5634.method_table,this__5634.cached_hierarchy,this__5634.hierarchy);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = (function (mf){
var this__5635 = this;
return cljs.core.deref.call(null,this__5635.method_table);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = (function (mf){
var this__5636 = this;
return cljs.core.deref.call(null,this__5636.prefer_table);
});
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = (function (mf,args){
var this__5637 = this;
return cljs.core.do_dispatch.call(null,mf,this__5637.dispatch_fn,args);
});
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = (function() { 
var G__5638__delegate = function (_,args){
return cljs.core._dispatch.call(null,this,args);
};
var G__5638 = function (_,var_args){
var args = null;
if (goog.isDef(var_args)) {
  args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1),0);
} 
return G__5638__delegate.call(this, _, args);
};
G__5638.cljs$lang$maxFixedArity = 1;
G__5638.cljs$lang$applyTo = (function (arglist__5639){
var _ = cljs.core.first(arglist__5639);
var args = cljs.core.rest(arglist__5639);
return G__5638__delegate.call(this, _, args);
});
return G__5638;
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

goog.provide('clojure.browser.net');
goog.require('cljs.core');
goog.require('clojure.browser.event');
goog.require('goog.net.XhrIo');
goog.require('goog.net.EventType');
goog.require('goog.net.xpc.CfgFields');
goog.require('goog.net.xpc.CrossPageChannel');
goog.require('goog.json');
clojure.browser.net._STAR_timeout_STAR_ = 10000;
clojure.browser.net.event_types = cljs.core.into.call(null,cljs.core.ObjMap.fromObject([],{}),cljs.core.map.call(null,(function (p__5653){
var vec__5654__5655 = p__5653;
var k__5656 = cljs.core.nth.call(null,vec__5654__5655,0,null);
var v__5657 = cljs.core.nth.call(null,vec__5654__5655,1,null);

return cljs.core.Vector.fromArray([cljs.core.keyword.call(null,k__5656.toLowerCase()),v__5657]);
}),cljs.core.merge.call(null,cljs.core.js__GT_clj.call(null,goog.net.EventType))));
clojure.browser.net.IConnection = {};
clojure.browser.net.connect = (function() {
var connect = null;
var connect__5688 = (function (this$){
if(cljs.core.truth_((function (){var and__3546__auto____5658 = this$;

if(cljs.core.truth_(and__3546__auto____5658))
{return this$.clojure$browser$net$IConnection$connect;
} else
{return and__3546__auto____5658;
}
})()))
{return this$.clojure$browser$net$IConnection$connect(this$);
} else
{return (function (){var or__3548__auto____5659 = (clojure.browser.net.connect[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5659))
{return or__3548__auto____5659;
} else
{var or__3548__auto____5660 = (clojure.browser.net.connect["_"]);

if(cljs.core.truth_(or__3548__auto____5660))
{return or__3548__auto____5660;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.connect",this$);
}
}
})().call(null,this$);
}
});
var connect__5689 = (function (this$,opt1){
if(cljs.core.truth_((function (){var and__3546__auto____5661 = this$;

if(cljs.core.truth_(and__3546__auto____5661))
{return this$.clojure$browser$net$IConnection$connect;
} else
{return and__3546__auto____5661;
}
})()))
{return this$.clojure$browser$net$IConnection$connect(this$,opt1);
} else
{return (function (){var or__3548__auto____5662 = (clojure.browser.net.connect[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5662))
{return or__3548__auto____5662;
} else
{var or__3548__auto____5663 = (clojure.browser.net.connect["_"]);

if(cljs.core.truth_(or__3548__auto____5663))
{return or__3548__auto____5663;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.connect",this$);
}
}
})().call(null,this$,opt1);
}
});
var connect__5690 = (function (this$,opt1,opt2){
if(cljs.core.truth_((function (){var and__3546__auto____5664 = this$;

if(cljs.core.truth_(and__3546__auto____5664))
{return this$.clojure$browser$net$IConnection$connect;
} else
{return and__3546__auto____5664;
}
})()))
{return this$.clojure$browser$net$IConnection$connect(this$,opt1,opt2);
} else
{return (function (){var or__3548__auto____5665 = (clojure.browser.net.connect[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5665))
{return or__3548__auto____5665;
} else
{var or__3548__auto____5666 = (clojure.browser.net.connect["_"]);

if(cljs.core.truth_(or__3548__auto____5666))
{return or__3548__auto____5666;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.connect",this$);
}
}
})().call(null,this$,opt1,opt2);
}
});
var connect__5691 = (function (this$,opt1,opt2,opt3){
if(cljs.core.truth_((function (){var and__3546__auto____5667 = this$;

if(cljs.core.truth_(and__3546__auto____5667))
{return this$.clojure$browser$net$IConnection$connect;
} else
{return and__3546__auto____5667;
}
})()))
{return this$.clojure$browser$net$IConnection$connect(this$,opt1,opt2,opt3);
} else
{return (function (){var or__3548__auto____5668 = (clojure.browser.net.connect[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5668))
{return or__3548__auto____5668;
} else
{var or__3548__auto____5669 = (clojure.browser.net.connect["_"]);

if(cljs.core.truth_(or__3548__auto____5669))
{return or__3548__auto____5669;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.connect",this$);
}
}
})().call(null,this$,opt1,opt2,opt3);
}
});
connect = function(this$,opt1,opt2,opt3){
switch(arguments.length){
case  1 :
return connect__5688.call(this,this$);
case  2 :
return connect__5689.call(this,this$,opt1);
case  3 :
return connect__5690.call(this,this$,opt1,opt2);
case  4 :
return connect__5691.call(this,this$,opt1,opt2,opt3);
}
throw('Invalid arity: ' + arguments.length);
};
return connect;
})()
;
clojure.browser.net.transmit = (function() {
var transmit = null;
var transmit__5693 = (function (this$,opt){
if(cljs.core.truth_((function (){var and__3546__auto____5670 = this$;

if(cljs.core.truth_(and__3546__auto____5670))
{return this$.clojure$browser$net$IConnection$transmit;
} else
{return and__3546__auto____5670;
}
})()))
{return this$.clojure$browser$net$IConnection$transmit(this$,opt);
} else
{return (function (){var or__3548__auto____5671 = (clojure.browser.net.transmit[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5671))
{return or__3548__auto____5671;
} else
{var or__3548__auto____5672 = (clojure.browser.net.transmit["_"]);

if(cljs.core.truth_(or__3548__auto____5672))
{return or__3548__auto____5672;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.transmit",this$);
}
}
})().call(null,this$,opt);
}
});
var transmit__5694 = (function (this$,opt,opt2){
if(cljs.core.truth_((function (){var and__3546__auto____5673 = this$;

if(cljs.core.truth_(and__3546__auto____5673))
{return this$.clojure$browser$net$IConnection$transmit;
} else
{return and__3546__auto____5673;
}
})()))
{return this$.clojure$browser$net$IConnection$transmit(this$,opt,opt2);
} else
{return (function (){var or__3548__auto____5674 = (clojure.browser.net.transmit[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5674))
{return or__3548__auto____5674;
} else
{var or__3548__auto____5675 = (clojure.browser.net.transmit["_"]);

if(cljs.core.truth_(or__3548__auto____5675))
{return or__3548__auto____5675;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.transmit",this$);
}
}
})().call(null,this$,opt,opt2);
}
});
var transmit__5695 = (function (this$,opt,opt2,opt3){
if(cljs.core.truth_((function (){var and__3546__auto____5676 = this$;

if(cljs.core.truth_(and__3546__auto____5676))
{return this$.clojure$browser$net$IConnection$transmit;
} else
{return and__3546__auto____5676;
}
})()))
{return this$.clojure$browser$net$IConnection$transmit(this$,opt,opt2,opt3);
} else
{return (function (){var or__3548__auto____5677 = (clojure.browser.net.transmit[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5677))
{return or__3548__auto____5677;
} else
{var or__3548__auto____5678 = (clojure.browser.net.transmit["_"]);

if(cljs.core.truth_(or__3548__auto____5678))
{return or__3548__auto____5678;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.transmit",this$);
}
}
})().call(null,this$,opt,opt2,opt3);
}
});
var transmit__5696 = (function (this$,opt,opt2,opt3,opt4){
if(cljs.core.truth_((function (){var and__3546__auto____5679 = this$;

if(cljs.core.truth_(and__3546__auto____5679))
{return this$.clojure$browser$net$IConnection$transmit;
} else
{return and__3546__auto____5679;
}
})()))
{return this$.clojure$browser$net$IConnection$transmit(this$,opt,opt2,opt3,opt4);
} else
{return (function (){var or__3548__auto____5680 = (clojure.browser.net.transmit[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5680))
{return or__3548__auto____5680;
} else
{var or__3548__auto____5681 = (clojure.browser.net.transmit["_"]);

if(cljs.core.truth_(or__3548__auto____5681))
{return or__3548__auto____5681;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.transmit",this$);
}
}
})().call(null,this$,opt,opt2,opt3,opt4);
}
});
var transmit__5697 = (function (this$,opt,opt2,opt3,opt4,opt5){
if(cljs.core.truth_((function (){var and__3546__auto____5682 = this$;

if(cljs.core.truth_(and__3546__auto____5682))
{return this$.clojure$browser$net$IConnection$transmit;
} else
{return and__3546__auto____5682;
}
})()))
{return this$.clojure$browser$net$IConnection$transmit(this$,opt,opt2,opt3,opt4,opt5);
} else
{return (function (){var or__3548__auto____5683 = (clojure.browser.net.transmit[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5683))
{return or__3548__auto____5683;
} else
{var or__3548__auto____5684 = (clojure.browser.net.transmit["_"]);

if(cljs.core.truth_(or__3548__auto____5684))
{return or__3548__auto____5684;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.transmit",this$);
}
}
})().call(null,this$,opt,opt2,opt3,opt4,opt5);
}
});
transmit = function(this$,opt,opt2,opt3,opt4,opt5){
switch(arguments.length){
case  2 :
return transmit__5693.call(this,this$,opt);
case  3 :
return transmit__5694.call(this,this$,opt,opt2);
case  4 :
return transmit__5695.call(this,this$,opt,opt2,opt3);
case  5 :
return transmit__5696.call(this,this$,opt,opt2,opt3,opt4);
case  6 :
return transmit__5697.call(this,this$,opt,opt2,opt3,opt4,opt5);
}
throw('Invalid arity: ' + arguments.length);
};
return transmit;
})()
;
clojure.browser.net.close = (function close(this$){
if(cljs.core.truth_((function (){var and__3546__auto____5685 = this$;

if(cljs.core.truth_(and__3546__auto____5685))
{return this$.clojure$browser$net$IConnection$close;
} else
{return and__3546__auto____5685;
}
})()))
{return this$.clojure$browser$net$IConnection$close(this$);
} else
{return (function (){var or__3548__auto____5686 = (clojure.browser.net.close[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5686))
{return or__3548__auto____5686;
} else
{var or__3548__auto____5687 = (clojure.browser.net.close["_"]);

if(cljs.core.truth_(or__3548__auto____5687))
{return or__3548__auto____5687;
} else
{throw cljs.core.missing_protocol.call(null,"IConnection.close",this$);
}
}
})().call(null,this$);
}
});
goog.net.XhrIo.prototype.clojure$browser$event$EventType$ = true;
goog.net.XhrIo.prototype.clojure$browser$event$EventType$event_types = (function (this$){
return cljs.core.into.call(null,cljs.core.ObjMap.fromObject([],{}),cljs.core.map.call(null,(function (p__5699){
var vec__5700__5701 = p__5699;
var k__5702 = cljs.core.nth.call(null,vec__5700__5701,0,null);
var v__5703 = cljs.core.nth.call(null,vec__5700__5701,1,null);

return cljs.core.Vector.fromArray([cljs.core.keyword.call(null,k__5702.toLowerCase()),v__5703]);
}),cljs.core.merge.call(null,cljs.core.js__GT_clj.call(null,goog.net.EventType))));
});
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$ = true;
goog.net.XhrIo.prototype.clojure$browser$net$IConnection$transmit = (function() {
var G__5704 = null;
var G__5704__5705 = (function (this$,uri){
return clojure.browser.net.transmit.call(null,this$,uri,"GET",null,null,clojure.browser.net._STAR_timeout_STAR_);
});
var G__5704__5706 = (function (this$,uri,method){
return clojure.browser.net.transmit.call(null,this$,uri,method,null,null,clojure.browser.net._STAR_timeout_STAR_);
});
var G__5704__5707 = (function (this$,uri,method,content){
return clojure.browser.net.transmit.call(null,this$,uri,method,content,null,clojure.browser.net._STAR_timeout_STAR_);
});
var G__5704__5708 = (function (this$,uri,method,content,headers){
return clojure.browser.net.transmit.call(null,this$,uri,method,content,headers,clojure.browser.net._STAR_timeout_STAR_);
});
var G__5704__5709 = (function (this$,uri,method,content,headers,timeout){
this$.setTimeoutInterval(timeout);
return this$.send(uri,method,content,headers);
});
G__5704 = function(this$,uri,method,content,headers,timeout){
switch(arguments.length){
case  2 :
return G__5704__5705.call(this,this$,uri);
case  3 :
return G__5704__5706.call(this,this$,uri,method);
case  4 :
return G__5704__5707.call(this,this$,uri,method,content);
case  5 :
return G__5704__5708.call(this,this$,uri,method,content,headers);
case  6 :
return G__5704__5709.call(this,this$,uri,method,content,headers,timeout);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5704;
})()
;
clojure.browser.net.xpc_config_fields = cljs.core.into.call(null,cljs.core.ObjMap.fromObject([],{}),cljs.core.map.call(null,(function (p__5711){
var vec__5712__5713 = p__5711;
var k__5714 = cljs.core.nth.call(null,vec__5712__5713,0,null);
var v__5715 = cljs.core.nth.call(null,vec__5712__5713,1,null);

return cljs.core.Vector.fromArray([cljs.core.keyword.call(null,k__5714.toLowerCase()),v__5715]);
}),cljs.core.js__GT_clj.call(null,goog.net.xpc.CfgFields)));
/**
* Returns an XhrIo connection
*/
clojure.browser.net.xhr_connection = (function xhr_connection(){
return (new goog.net.XhrIo());
});
clojure.browser.net.ICrossPageChannel = {};
clojure.browser.net.register_service = (function() {
var register_service = null;
var register_service__5722 = (function (this$,service_name,fn){
if(cljs.core.truth_((function (){var and__3546__auto____5716 = this$;

if(cljs.core.truth_(and__3546__auto____5716))
{return this$.clojure$browser$net$ICrossPageChannel$register_service;
} else
{return and__3546__auto____5716;
}
})()))
{return this$.clojure$browser$net$ICrossPageChannel$register_service(this$,service_name,fn);
} else
{return (function (){var or__3548__auto____5717 = (clojure.browser.net.register_service[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5717))
{return or__3548__auto____5717;
} else
{var or__3548__auto____5718 = (clojure.browser.net.register_service["_"]);

if(cljs.core.truth_(or__3548__auto____5718))
{return or__3548__auto____5718;
} else
{throw cljs.core.missing_protocol.call(null,"ICrossPageChannel.register-service",this$);
}
}
})().call(null,this$,service_name,fn);
}
});
var register_service__5723 = (function (this$,service_name,fn,encode_json_QMARK_){
if(cljs.core.truth_((function (){var and__3546__auto____5719 = this$;

if(cljs.core.truth_(and__3546__auto____5719))
{return this$.clojure$browser$net$ICrossPageChannel$register_service;
} else
{return and__3546__auto____5719;
}
})()))
{return this$.clojure$browser$net$ICrossPageChannel$register_service(this$,service_name,fn,encode_json_QMARK_);
} else
{return (function (){var or__3548__auto____5720 = (clojure.browser.net.register_service[goog.typeOf.call(null,this$)]);

if(cljs.core.truth_(or__3548__auto____5720))
{return or__3548__auto____5720;
} else
{var or__3548__auto____5721 = (clojure.browser.net.register_service["_"]);

if(cljs.core.truth_(or__3548__auto____5721))
{return or__3548__auto____5721;
} else
{throw cljs.core.missing_protocol.call(null,"ICrossPageChannel.register-service",this$);
}
}
})().call(null,this$,service_name,fn,encode_json_QMARK_);
}
});
register_service = function(this$,service_name,fn,encode_json_QMARK_){
switch(arguments.length){
case  3 :
return register_service__5722.call(this,this$,service_name,fn);
case  4 :
return register_service__5723.call(this,this$,service_name,fn,encode_json_QMARK_);
}
throw('Invalid arity: ' + arguments.length);
};
return register_service;
})()
;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$connect = (function() {
var G__5725 = null;
var G__5725__5726 = (function (this$){
return clojure.browser.net.connect.call(null,this$,null);
});
var G__5725__5727 = (function (this$,on_connect_fn){
return this$.connect(on_connect_fn);
});
var G__5725__5728 = (function (this$,on_connect_fn,config_iframe_fn){
return clojure.browser.net.connect.call(null,this$,on_connect_fn,config_iframe_fn,document.body);
});
var G__5725__5729 = (function (this$,on_connect_fn,config_iframe_fn,iframe_parent){
this$.createPeerIframe(iframe_parent,config_iframe_fn);
return this$.connect(on_connect_fn);
});
G__5725 = function(this$,on_connect_fn,config_iframe_fn,iframe_parent){
switch(arguments.length){
case  1 :
return G__5725__5726.call(this,this$);
case  2 :
return G__5725__5727.call(this,this$,on_connect_fn);
case  3 :
return G__5725__5728.call(this,this$,on_connect_fn,config_iframe_fn);
case  4 :
return G__5725__5729.call(this,this$,on_connect_fn,config_iframe_fn,iframe_parent);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5725;
})()
;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$transmit = (function (this$,service_name,payload){
return this$.send(cljs.core.name.call(null,service_name),payload);
});
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$IConnection$close = (function (this$){
return this$.close(cljs.core.List.EMPTY);
});
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$ = true;
goog.net.xpc.CrossPageChannel.prototype.clojure$browser$net$ICrossPageChannel$register_service = (function() {
var G__5731 = null;
var G__5731__5732 = (function (this$,service_name,fn){
return clojure.browser.net.register_service.call(null,this$,service_name,fn,false);
});
var G__5731__5733 = (function (this$,service_name,fn,encode_json_QMARK_){
return this$.registerService(cljs.core.name.call(null,service_name),fn,encode_json_QMARK_);
});
G__5731 = function(this$,service_name,fn,encode_json_QMARK_){
switch(arguments.length){
case  3 :
return G__5731__5732.call(this,this$,service_name,fn);
case  4 :
return G__5731__5733.call(this,this$,service_name,fn,encode_json_QMARK_);
}
throw('Invalid arity: ' + arguments.length);
};
return G__5731;
})()
;
/**
* When passed with a config hash-map, returns a parent
* CrossPageChannel object. Keys in the config hash map are downcased
* versions of the goog.net.xpc.CfgFields enum keys,
* e.g. goog.net.xpc.CfgFields.PEER_URI becomes :peer_uri in the config
* hash.
* 
* When passed with no args, creates a child CrossPageChannel object,
* and the config is automatically taken from the URL param 'xpc', as
* per the CrossPageChannel API.
*/
clojure.browser.net.xpc_connection = (function() {
var xpc_connection = null;
var xpc_connection__5744 = (function (){
var temp__3698__auto____5735 = (new goog.Uri(window.location.href)).getParameterValue("xpc");

if(cljs.core.truth_(temp__3698__auto____5735))
{var config__5736 = temp__3698__auto____5735;

return (new goog.net.xpc.CrossPageChannel(goog.json.parse.call(null,config__5736)));
} else
{return null;
}
});
var xpc_connection__5745 = (function (config){
return (new goog.net.xpc.CrossPageChannel(cljs.core.reduce.call(null,(function (sum,p__5737){
var vec__5738__5739 = p__5737;
var k__5740 = cljs.core.nth.call(null,vec__5738__5739,0,null);
var v__5741 = cljs.core.nth.call(null,vec__5738__5739,1,null);

var temp__3695__auto____5742 = cljs.core.get.call(null,clojure.browser.net.xpc_config_fields,k__5740);

if(cljs.core.truth_(temp__3695__auto____5742))
{var field__5743 = temp__3695__auto____5742;

return cljs.core.assoc.call(null,sum,field__5743,v__5741);
} else
{return sum;
}
}),cljs.core.ObjMap.fromObject([],{}),config).strobj));
});
xpc_connection = function(config){
switch(arguments.length){
case  0 :
return xpc_connection__5744.call(this);
case  1 :
return xpc_connection__5745.call(this,config);
}
throw('Invalid arity: ' + arguments.length);
};
return xpc_connection;
})()
;

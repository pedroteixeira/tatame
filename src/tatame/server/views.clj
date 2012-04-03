(ns tatame.server.views
  (:use [noir.core :only [defpage defpartial]]
        [hiccup.page :only [include-css html5 include-js]]))

(defpartial layout []
  (html5
   [:head
    [:title "tatame"]
    [:meta {:chartset "UTF-8"}]
    [:meta {:name "viewport" :content "width=device-width, initial-scale=1.0"}]
    [:meta {:http-equiv "X-UA-Compatible" :content "IE=edge,chrome=1"}]
    (include-css "/css/bootstrap.css")
    (include-css "/css/bootstrap-responsive.css")
    (include-css "/css/tatame.css")
    (include-js "http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.min.js")]
   [:body
    [:div.navbar.navbar-fixed-top
     [:div.navbar-inner
      [:div.container-fluid
       [:a.btn.btn-navbar [:span.icon-bar]]
       [:a.brand "Tatame"]
       [:div.nav-collapse
        [:ul.nav
         ;; [:li.active [:a "Dojo"]]
         ;; [:li [:a "Backstage"]]
         ]
        [:p.navbar-text.pull-right]]]]]

    [:div.container-fluid
     [:div.row-fluid
      [:div.span1
       [:div#sidebar.well.sidebar-nav]]

      [:div.span11
       [:div.row-fluid
        [:div#workspace]]]]]


    [:input#history-state {:type "hidden"}]
    (include-js "/js/bootstrap.min.js")
    (include-js "/javascripts/main.js")]))

(defpage "/" []
  (layout))

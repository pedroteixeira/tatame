(ns tatame.client.views
  (:require [crate.core :as crate])
  (:use-macros  [crate.macros :only [defpartial]])
  (:use [jayq.core :only [append $ find show hide inner add-class remove-class]]))

(defn render [f]
  (append ($ :#workspace) (f)))

(defpartial loading []
  [:div.span12
   [:div.hero-unit [:h1 "Welcome to the Dojo!"]]
   [:div.alert.alert-info
    [:h4 "Aguarde!"]
    "Conectando com servidor..."]])


(defpartial admin-sidebar []
  [:div.well.sidebar-nav
   [:ul.nav.nav-list
    [:li.nav-header "Sidebar"]
    [:li.active "Dojos"]
    [:li.active "Usuários"]]])


(defpartial user-registration []
  [:div.span4
   [:div.alert.alert-info
    [:h4 "Olá!"]
    "Registre um usuário para começar a sessão"]

   [:input {:type "text" :data-loading-text "registrando..."}]
   [:a.btn.btn-primary "Registrar usuário"]])

(ns tatame.client.views
  (:require [crate.core :as crate])
  (:use-macros  [crate.macros :only [defpartial]]
                [fetch.macros :only [remote letrem]])
  (:use [jayq.core :only [append $ find show hide inner add-class remove-class]]))



(defn on-start-session [dojo]
  (letrem [r (start-session (:id dojo))]
          (inner ($ :#workspace) "sessao criada")))

(defn on-start-dojo []
  (letrem [current-dojo (start-dojo)]
          (inner ($ :#workspace) (dojo))
          (.click ($ :#start-session)
                  (partial on-start-session current-dojo))))

(defn render [f]
  (append ($ :#workspace) (f)))


(defpartial dojo []
  [:div "sessões atuais"
   [:input#start-session.btn.btn-primary {:type "button" :value "Começar sessão"}]])



(defpartial loading []
  [:div.span12
   [:div.hero-unit [:h1 "Welcome to the Dojo!!"]]
   [:div.alert.alert-info
    [:h4 "Aguarde!"]
    "Conectando com servidor..."]

   ;;TODO: Se já existir, render dojo atual
   (new-dojo)
   ])

(defpartial new-dojo []
  [:div
   [:a {:href "#new-dojo"} "Começar dojo"]
                                        ;;[:input#start-dojo.btn.btn-primary {:type "button" :value "Começar dojo"}]
   ])


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

(ns tatame.client.main
  (:use [jayq.core :only [append $ find show hide inner add-class remove-class]]
        [waltz.state :only [transition]])
  (:require  [tatame.client.editors :as editors]
             [tatame.client.model :as model]
             [tatame.client.views :as views]

             [cljs.reader :as reader]
             [clojure.browser.repl :as repl]
             [clojure.string :as string]

             [fetch.remotes :as remotes]
             [waltz.state :as state]
             [waltz.history :as history]
             [crate.core :as crate])

  (:use-macros [waltz.macros :only [in out defstate deftrans]]
               [fetch.macros :only [remote letrem]]))


(if (= location.hostname "localhost")
  (repl/connect "http://localhost:9000/repl"))






(defn on-navigate
  "disparar ação com base em token..." [e]


  (let [token (.-token e)]
    (.log js/console "on navigate" token)

    (cond
     (= token "")
     true

     (= token "new-dojo")
     (views/on-start-dojo))))


(defn init! []
  (state/set model/app :loading)
  (model/init!)
  (history/listen on-navigate)


  ;;;;; fluxo ;;;;;

  ;;no hello, enviar:
  ;;from local state:
  ;;client id
  ;;dojo atual
  ;;session atual
  ;;current user

  ;;server deve enviar estado:
  ;;dojos abertos
  ;;sessions abertas
  ;;todos users


  ;;UI:
  ;;permitir adicionar usuário (global)
  ;;permitir criar sessão de dojo (por enquanto, no contexto de um client-id)

  ;;permitir entrar em uma sessão
  ;;;; recupera última snapshot

  ;; obrigatório escolher um dojo,sessão e um piloto, se não houver


  ;;no exit do browser, enviar snapshot de editores
  ;;snapshots periódicos?


  ;;permitir esconder canvas e tests
  ;;permitir fullscreen editor


  ;; usar state machine em WS


  ;; layout init
  ;;(editors/init!)
  )


(set! window.onload init!)
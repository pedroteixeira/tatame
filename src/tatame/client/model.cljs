(ns tatame.client.model
  (:require [cljs.reader :as reader]
            [waltz.state :as state]
            [tatame.client.views :as views])
  (:use [waltz.state :only [transition]])
  (:use-macros [waltz.macros :only [in out defstate deftrans]]))

(defn log []
  (if (= location.hostname "localhost")
    (.log js/console js/arguments)))


(def app (state/machine :app))

(defstate app :loading
  (in []
      (log "loading")
      (views/render views/loading))
  (out [] (log "loaded")))

(deftrans app :connect []
  (state/unset app :loading))

(deftrans app :navigate [token])



(def worker (atom nil))
(def client-id (atom nil))

(defn emit-event!
  "Send to worker queue. TODO: adicionar metadado? tipo do evento?"
  [data]
  (if @worker
    (.postMessage @worker data)))


(defn on-hello
  "Shake hands with server, exchange client-ids"
  [data]
  (if-let [current-client-id @client-id]
    ;;hello again
    (.postMessage @worker (pr-str {:command "hello" :client-id current-client-id}))

    ;;first time hello
    (if-let [id (:client-id data)]
      (swap! client-id #(do (.setItem js/localStorage "client-id" id)
                            (.set goog.net/cookies "client-id" @client-id)
                            id)))))


(defn on-client-message
  "Handle message from worker"
  [data]
  (cond
   (= (:event data) "onopen")
   (transition app :connect))

  (log "on client message" data))

(defn on-server-message
  "Handle a websocket message from server"
  [{event :event :as data}]
  (log "on server message" (pr-str data))
  (cond (= event "hello")  (on-hello data)))


(defn on-ws-message [e]
  (let [data (reader/read-string (.-data e))]
    (if-let [type (:type data)]
      (cond
       (= type "server")
       (on-server-message (reader/read-string (:data data)))

       (= type "client")
       (on-client-message data))
      (.log js/console "on generic message" data))))


(defn init! []
  (if-let [local-id (.getItem js/localStorage "client-id")]
    (reset! client-id local-id)
    (.set goog.net/cookies "client-id" local-id))

  (swap! worker #(new js/Worker "/javascripts/worker.js"))
  (doto @worker
    (.addEventListener "message" on-ws-message)))
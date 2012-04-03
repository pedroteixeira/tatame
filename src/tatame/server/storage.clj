(ns tatame.server.storage
  (:use [clojure.java.io :only [writer]])
  (:require [clj-esearch.core :as es]))


(def add-doc (partial es/add-doc "http://localhost:9200"))
;;(def record-event! (partial add-doc "events" "event"))

(defn record-event! [data]
  (lamina.core/run-pipeline
   (add-doc "events" "event" data)
   :error-handler (fn [e] (println "error sending to es" e))))

(def init! [])
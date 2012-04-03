(ns tatame.server.ws
  (:use [tatame.server.storage :only [record-event! init!] :rename {init! init-storage!}]
        [tatame.model.state :only [add-client! rm-client! rename-client!
                                   broadcast-channel]]
        [tatame.model.commands :only [do-command]])
  (:require [lamina.core :as lamina]))


(defn command-pipe []
  (lamina/pipeline do-command))


(defn receive-handler
  "WebWocket message event handler."
  [ip ch client-id msg]
  (let [{command :command event :event :as data} (read-string msg)]
    (cond
     command
     ((command-pipe) (with-meta data {:name (keyword command)
                                      :channel ch
                                      :client-id client-id}))

     ;;; assume event
     (and (map? data) (data "editor"))
     (record-event! (merge data {:client-id @client-id})))))



(defn create-close-handler
  "Create WebSocket close handler."
  [ip client-id]
  (fn []
    (println (str ip " : Closing " @client-id))
    (rm-client! @client-id)
    (lamina/enqueue broadcast-channel (pr-str {:event "left" :client-id (str @client-id)}))))


(defn register-lifecycle-hooks
  "Register lifecycle hooks for channel"
  [ip client-id ch]
  ((lamina/pipeline
    #(create-close-handler ip %)
    #(lamina/on-closed ch %))
   client-id)
  ((lamina/pipeline
    #(lamina/on-drained ch %))
   client-id))

(defn register-client
  "Registers new client"
  [ip client-id]
  ((lamina/pipeline
    #(add-client! %)
    #(lamina/enqueue broadcast-channel (pr-str {:event "joined" :client-id (str %)})))
   @client-id))


(defn websocket-handler
  "All WebSocket connections start here.
Called when client connects.
Sets up local atom for client-id (closed over by all event handlers).
Registers event handlers for new WebSocket connection (ch)."
  [ch {ip :remote-addr}]
  (let [client-id (ref (str (gensym "coder_") (System/currentTimeMillis) (int (* 1000 (rand)))))
        connect-pipeline (lamina/pipeline
                          #(register-lifecycle-hooks ip client-id %)
                          #(register-client ip client-id))]
    (connect-pipeline ch)

    ;; message handler
    (lamina/receive-all ch #(receive-handler ip ch client-id %))

    ;; publish events from broadcast-channel to clients channel
    (lamina/siphon broadcast-channel ch)

    ;; say hi
    (lamina/enqueue ch (pr-str {:event "hello" :client-id (str @client-id)}))))
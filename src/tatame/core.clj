(ns tatame.core
  (:use [ring.util.response :only [redirect]]
        [ring.middleware.file :only [wrap-file]]
        [ring.middleware.file-info :only [wrap-file-info]]
        [compojure.core :only [defroutes GET]]
        [clojure.java.io :only [writer]]
        [tatame.ws :only [state-add-user! state-rm-user! state-mv-user! valid-nick-change? nick-pipe send-users-list-pipe register-lifecycle-hooks register-new-user users events broadcast-channel]])
  (:require [lamina.core :as lamina]
            [aleph.http :as aleph]
            [compojure.route :as route]))


(defn queue-event!
  "Enqueue event to memory queue."
  [nick data]
  (when-not (@events nick)
    (dosync (alter events assoc nick (ref []))))

  (let [events (@events nick)]
    (dosync
     (alter events conj data))))


(defn persist-events!
  "Flush events to a file for each user. Assume just one worker thread."  []
  (println "Persiting events...")
  (doseq [user (keys @events)]
    (let [userevents @(@events user)]
      (with-open [wrtr (writer (str "data/" user) :append true)]
        (doseq [event userevents]
          (.write wrtr (pr-str event))
          (.write wrtr "\n")))

      (dosync (alter (@events user) #(apply vector (drop (count userevents) %)))))))




(defn receive-handler
  "Receive message over WebWocket event handler."
  [ip ch nickname msg]
  (println "receive-handler" ip ch msg)
  (let [{command :command :as data} (read-string msg)]
    (cond
     (= command "login")
     ((nick-pipe) {:channel ch
                   :nick nickname
                   :body (:userid data)})

     (and (map? data) (data "editor"))
     (queue-event! @nickname data))))




(defn websocket-handler
  "All WebSocket connections start here.
Called when client connects.
Sets up local atom for nickname (closed over by all event handlers).
Registers event handlers for new WebSocket connection (ch)."
  [ch {ip :remote-addr}]
  (let [nickname (ref (str (gensym "coder_") (int (* 1000 (rand)))))
        connect-pipeline (lamina/pipeline
                          #(register-lifecycle-hooks ip nickname %)
                          #(register-new-user ip nickname))]
    (connect-pipeline ch)

    ;; message handler
    (lamina/receive-all ch #(receive-handler ip ch nickname %))

    ;; publish events from broadcast-channel to clients channel
    (lamina/siphon broadcast-channel ch)

    ;; your nickname
    (lamina/enqueue ch (pr-str {:event "login" :nick (str @nickname)}))

    ;; say hi
    ((send-users-list-pipe) ch)))







(defroutes my-app
  (GET "/" [] (redirect "index.html"))
  (GET "/socket" [] (aleph/wrap-aleph-handler websocket-handler))
  (route/not-found "no donut for your"))



(def flush-thread (atom true))

(defn -main []
  (let [port 8108]
    (aleph/start-http-server (-> #'my-app
                                 (wrap-file "static")
                                 wrap-file-info
                                 aleph/wrap-ring-handler) {:port port :websocket true})
    (println (str "Server started on port " port)))

  ;;flush on background
  (future (do (while @flush-thread (persist-events!) (Thread/sleep 60000)))))

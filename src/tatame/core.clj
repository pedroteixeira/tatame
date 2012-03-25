(ns tatame.core
  (:use [ring.util.response :only [redirect]]
        [ring.middleware.file :only [wrap-file]]
        [ring.middleware.file-info :only [wrap-file-info]]
        [compojure.core :only [defroutes GET]])

  (:require [lamina.core :as lamina]
            [aleph.http :as aleph]
            [compojure.route :as route]))


(def broadcast-channel (lamina/permanent-channel))


;; (defn connected-hook
;;   "Hook executed when new client connected."
;;   [ch ip nickname]
;;   (let [connect-pipeline (lamina/pipeline
;;                           #(register-lifecycle-hooks ip nickname %)
;;                           #(register-new-user ip nickname))]
;;     (connect-pipeline ch)

;;     ;; message handler
;;     (lamina/receive-all ch #(receive-handler ip ch nickname %))

;;     ;; publish events from broadcast-channel to clients channel
;;     (lamina/siphon broadcast-channel ch)

;;     ;; your nickname
;;     (lamina/enqueue ch (str "/nick " @nickname))

;;     ;; say hi
;;     ((send-users-list-pipe) ch)))

(defn websocket-handler
  "All WebSocket connections start here.
Called when client connects.
Sets up local atom for nickname (closed over by all event handlers).
Registers event handlers for new WebSocket connection (ch)."
  [ch {ip :remote-addr}]
  (println ip))






(defroutes my-app
  (GET "/" [] (redirect "index.html"))
  (GET "/socket" [] (aleph/wrap-aleph-handler websocket-handler))
  (route/not-found "What you're looking for is not here, sorry."))

(defn -main []
  (let [port 8108]
    (aleph/start-http-server (-> #'my-app
                                 (wrap-file "static")
                                 wrap-file-info
                                 aleph/wrap-ring-handler) {:port port :websocket true})
    (println (str "Server started on port " port))))

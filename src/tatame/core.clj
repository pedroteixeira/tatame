(ns tatame.core
  (:use [ring.util.response :only [redirect]]
        [ring.middleware.file :only [wrap-file]]
        [ring.middleware.file-info :only [wrap-file-info]]
        [compojure.core :only [defroutes GET]])

  (:require [lamina.core :as lamina]
            [aleph.http :as aleph]
            [compojure.route :as route]))


(def broadcast-channel (lamina/permanent-channel))

(def users (ref #{}))

(defn state-add-user!
  [nick]
  (dosync (commute users conj nick))
  nick)

(defn state-rm-user!
  "Removes user from list of registered users."
  [nick]
  (dosync (commute users disj nick)))

(defn state-mv-user!
  "Renames user.
Has to be executed in tranasation."
  [from to]
  (commute users
           #(-> %
                (disj from)
                (conj to))))

(defn valid-nick-change?
  "Checks if nickname change is valid."
  [new-nick]
  (not (or (empty? new-nick)
           (contains? @users new-nick)
           (.contains new-nick " "))))

(defn nick-pipe
  "Pipeline executed login command"
  []
  (println "Creating nick pipeline")
  (lamina/pipeline
   (fn [{ch :channel nick :nick new-nick :body :as m}]
     (println (str "Executing nick pipeline with: " m))
     (let [old-nick @nick]
       (if (valid-nick-change? new-nick)
         (do ;; allowed to change
           (println (format "nick '%s' -> '%s'"  old-nick new-nick))
           (dosync
            (state-mv-user! old-nick new-nick)
            (ref-set nick new-nick))
           (lamina/enqueue broadcast-channel (str "/nick " old-nick " " new-nick)))

         (do ;; nickname already taken, or otherwise invalid
           (println (format "nick '%s' !> '%s'"  old-nick new-nick))
           ;;(lamina/enqueue ch (pr-str {:event "login" :nick old-nick}))

           ))))))

(defn state-users-count
  []
  (count @users))

(defn create-close-handler
  "Create WebSocket close handler."
  [ip nick]
  (fn []
    (println (str ip " : Closing " @nick))
    (state-rm-user! @nick)
    (lamina/enqueue broadcast-channel (pr-str {:event "left" :nick (str @nick)}))))

(defn create-drained-handler
  "Create WebSocker backing channel drained halnder."
  [ip nick]
  (fn []
    (println (str ip " : Drained " @nick))))

(defn send-users-list-pipe
  "Pipeline to send current users list"
  []
  (let [users @users]
    (lamina/pipeline
     #(when-not (or (lamina/closed? %)
                    (lamina/drained? %))
        (println "listing users")
        (lamina/enqueue % (pr-str {:users users}))))))

(defn receive-handler
  "Receive message over WebWocket event handler.
  Arguments:
  - ip - ip of client
  - ch - channel to be used
  - nickname - atom to push nickname once set
  - msg - message received over channel"
  [ip ch nickname msg]
  (println "receive-handler" ip ch msg)
  (let [{command :command :as data} (read-string msg)]
    (cond
     (= command "login")
     ((nick-pipe) {:channel ch
                   :nick nickname
                   :body (:userid data)}))))


(defn register-lifecycle-hooks
  "Register lifecycle hooks for channel"
  [ip nickname ch]
  ((lamina/pipeline
    #(create-close-handler ip %)
    #(lamina/on-closed ch %))
   nickname)
  ((lamina/pipeline
    #(create-drained-handler ip %)
    #(lamina/on-drained ch %))
   nickname))

(defn register-new-user
  "Registers new user"
  [ip nickname]
  ((lamina/pipeline
    #(state-add-user! %)
    #(lamina/enqueue broadcast-channel (pr-str {:event "joined" :nick (str %)})))
   @nickname))


(defn websocket-handler
  "All WebSocket connections start here.
Called when client connects.
Sets up local atom for nickname (closed over by all event handlers).
Registers event handlers for new WebSocket connection (ch)."
  [ch {ip :remote-addr}]
  (let [nickname (ref (gensym "coder_"))
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
  (route/not-found "What you're looking for is not here, sorry."))

(defn -main []
  (let [port 8108]
    (aleph/start-http-server (-> #'my-app
                                 (wrap-file "static")
                                 wrap-file-info
                                 aleph/wrap-ring-handler) {:port port :websocket true})
    (println (str "Server started on port " port))))

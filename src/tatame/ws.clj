(ns tatame.ws
  (:use [ring.util.response :only [redirect]]
        [ring.middleware.file :only [wrap-file]]
        [ring.middleware.file-info :only [wrap-file-info]]
        [compojure.core :only [defroutes GET]]
        [clojure.java.io :only [writer]])

  (:require [lamina.core :as lamina]
            [aleph.http :as aleph]
            [compojure.route :as route]))

(def broadcast-channel (lamina/permanent-channel))
(def users (ref #{}))
(def events (ref {}))


(defn state-add-user!
  [nick]
  (dosync
   (commute users conj nick)
   (alter events assoc nick (ref [])))
  nick)


(defn state-rm-user!
  "Removes user from list of registered users."
  [nick]
  (dosync (commute users disj nick)))


(defn state-mv-user!
  "Renames user.
Has to be executed in transation."
  [from to]
  (do
    (commute users
             #(-> %
                  (disj from)
                  (conj to)))

    (alter events #(let [list (or (% from) (ref []))]
                     (-> %
                         (assoc to list)
                         (dissoc from))))))

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

(defn send-users-list-pipe
  "Pipeline to send current users list"
  []
  (let [users @users]
    (lamina/pipeline
     #(when-not (or (lamina/closed? %)
                    (lamina/drained? %))
        (println "listing users")
        (lamina/enqueue % (pr-str {:users users}))))))


(defn create-close-handler
  "Create WebSocket close handler."
  [ip nick]
  (fn []
    (println (str ip " : Closing " @nick))
    (state-rm-user! @nick)
    (lamina/enqueue broadcast-channel (pr-str {:event "left" :nick (str @nick)}))))


(defn register-lifecycle-hooks
  "Register lifecycle hooks for channel"
  [ip nickname ch]
  ((lamina/pipeline
    #(create-close-handler ip %)
    #(lamina/on-closed ch %))
   nickname)
  ((lamina/pipeline
    #(lamina/on-drained ch %))
   nickname))

(defn register-new-user
  "Registers new user"
  [ip nickname]
  ((lamina/pipeline
    #(state-add-user! %)
    #(lamina/enqueue broadcast-channel (pr-str {:event "joined" :nick (str %)})))
   @nickname))

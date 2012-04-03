(ns tatame.model.commands
  (:use [tatame.model.state :only [rename-client! dojos]]
        [noir.fetch.remotes :only [defremote wrap-remotes]]))

;;; commands
(defmulti do-command "handles a command based on command name"
  (fn [data] (:name (meta data))))

(defmethod do-command :hello [cmd])
(defmethod do-command :register-user [cmd])

(defmethod do-command :create-dojo [cmd])
(defmethod do-command :create-dojo-session [cmd])

(defmethod do-command :open-dojo-session [cmd])
(defmethod do-command :end-dojo-session [cmd])


(defmethod do-command :set-pilot-user [cmd])
;;contexto de dojo session

(defmethod do-command :save-snapshot [cmd])
;;dojo session


(defmethod do-command :hello
  [{sent-client-id :client-id :as cmd}]
  (let [{client-id :client-id} (meta cmd)
        our-client-id @client-id]
    (when (and (not= sent-client-id our-client-id) sent-client-id)
      (dosync
       (rename-client! our-client-id sent-client-id)
       (ref-set client-id sent-client-id)))))


(defmethod do-command :register-user
  [{username :username :as cmd}]
  ;;; get info from github
  )



(defremote start-dojo []
  (dosync
   (alter dojos (fn [dojos] (conj dojos {:id (inc (count dojos))
                                         :date (System/currentTimeMillis)})))

   (last @dojos)))

(defremote start-session [dojo-id]
  (dosync sessions conj
          {:dojo-id dojo-id :date (System/currentTimeMillis)}))
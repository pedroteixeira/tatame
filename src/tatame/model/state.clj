(ns tatame.model.state)

;;; web-related model
(defonce broadcast-channel (lamina.core/permanent-channel))
(defonce clients-online (ref #{}))
(defn add-client! [id] (dosync (commute clients-online conj id)))
(defn rm-client!  [id] (dosync (commute clients-online disj id)))
(defn rename-client! [from to] (commute clients-online #(-> % (disj from) (conj to))))



;;; core model
(defonce dojos (ref [])) ;;just ordered? only one active..
(defonce sessions (ref {})) ;;unique ids? for now, 1 client id => 1 session
(defonce users (ref {})) ;;unique usernames

;; ** Duvida **
;; broadcast world state on event/reload para client ou mais granular?


(defn init! []
  ;;retrieve state from storage?
  )
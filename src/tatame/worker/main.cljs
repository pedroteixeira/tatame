(ns tatame.worker.main)

(def socket (new js/WebSocket (str "ws://" location.hostname ":8108/socket")))
(def events (atom []))

(defn send-messages!
  "Consume local queue and send to server" []
  (while (not (empty? @events))
    (.send socket (pr-str (first @events)))
    (swap! events #(drop 1 %)))

  ;;sleep & do it again
  (.setTimeout js/self send-messages! 10000))


(defn on-client-message
  "Stream of events from page. We must persit/send to server."
  [e]
  (let [data (.-data e)]

    (cond
     (.-editor data)
     ;; TODO: local persist? (log in case of failures)
     (let [event (assoc (js->clj data) :ts (.-timeStamp e))]
       (swap! events conj event))

     ;;;delegates straight to server
     (string? data)
     (.send socket data))))


(defn on-server-message
  "Just delegates to main js"[e]
  (let [data (.-data e)]
    (.postMessage js/self (pr-str {:type "server" :data data}))))

(defn on-open []
  (send-messages!)
  (.postMessage js/self (pr-str {:type "client" :event "onopen" })))

(set! (.-onopen socket) on-open)
(set! (.-onmessage socket) on-server-message)
(.addEventListener js/self "message" on-client-message false)

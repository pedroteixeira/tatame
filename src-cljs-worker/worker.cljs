(ns tatame.worker)

(def socket (new js/WebSocket "ws://localhost:8108/socket"))
(def events (atom '[]))


(defn send-messages!
  "Consume local queue and send to server" []

  (while (not (empty? @events))
    (.postMessage js/self (pr-str {:type "client" :data "sending events to server!"}))
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
      ;; TODO: local persist (log in case of failures)
     (swap! events conj ^{"ts" (.-timeStamp e)} (js->clj data))


     ;;;delegates straight to server
     (string? data)
     (.send socket data))))


(defn on-server-message
  "Just delegates to page"[e]
  (let [data (.-data e)]
    (.postMessage js/self (pr-str {:type "server" :data data}))))


(set! (.-onopen socket) send-messages!)
(set! (.-onmessage socket) on-server-message)
(.addEventListener js/self "message" on-client-message false)

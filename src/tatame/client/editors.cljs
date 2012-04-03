(ns tatame.client.editors
  (:require-macros [tatame.server.macros :as macros])
  (:require [tatame.client.model :as model]
            [cljs.reader :as reader]
             [clojure.browser.repl :as repl]
             [clojure.string :as string]
             [goog.dom :as gdom]
             [goog.object :as gobj]))

(def jasmine-template (macros/get-template "static/jasmine-template.html"))
(def editors (atom {}))
(def stable-js (atom {}))

(defn session [editor] (. editor (getSession)))
(defn content [editor] (. (session editor) (getValue)))
(defn frame-doc [id] (gdom/getFrameContentDocument (gdom/getElement id)))
(defn frame-id [id] (str id "-frame"))
(defn frame-el [id] (gdom/getElement  (frame-id id)))
(defn frame-template [id] (str "<iframe id=\"" id  "-frame\" src=\"\"style=\"width:100%; height:100%\"></iframe>"))


(defn init-editor!
  "Initializes ACE editor with corresponding mode and bind event listeners."
  [id mode listeners]
  (let [editor (.edit js/ace id)
        session (session editor)
        mode-fn (.-Mode (.require js/window mode))]
    (.setMode session (new mode-fn))
    (doseq [[event f] listeners] (.on session event (partial f id)))
    (swap! editors assoc id editor)
    editor))


(defn write-frame!
  "Implements a strategy of re-writing the iframe document."
  [id html clean]
  (when clean
    (gdom/removeNode (frame-el id))
    (set! (.-innerHTML (gdom/getElement id)) (frame-template id)))
  (let [doc (frame-doc (frame-id id))]
    (doto doc (.open) (.write html) (.close))))

(defn refresh-canvas!
  "Updates canvas with html and last stable js content." []
  (let [html (content (@editors "html-editor"))
        js  (@stable-js "js-editor")
        content (string/replace-first html "{{code}}" js)]
    (write-frame! "canvas" content false))
  true)


(defn run-if-stable!
  "Tracks last code with no error."
  [id f]
  (let [editor (@editors id)
        annotations (.-$annotations (session editor))]
    (if-not (some #(= (.-type %) "error") (gobj/getKeys annotations))
      (do
        (swap! stable-js assoc id (content editor))
        (f))))
  true)

(defn run-tests!
  "Re-write jasmine frame with new code. For Jasmine, we had to clean the iframe to avoid weird bugs." []
  (let [tests (content (@editors "test-editor"))
        source (@stable-js "js-editor")
        html (string/replace-first jasmine-template "{{code}}" (str tests source))]
    (write-frame! "jasmine" html true)))

(defn delay-buffered
  "Executes a function in the future, and buffers calls within interval."
  [f ms]
  (let [timer (atom {})]
    (fn [& args]
      (if-let [t (@timer args)] (.clearTimeout js/window t))
      (let [t (.setTimeout js/window (fn []
                                       (swap! timer assoc args nil)
                                       (apply f args)) ms)]
        (swap! timer assoc args t)))))



;; editors state
(defn save-state! [id]
  (.setItem js/localStorage id (content (@editors id))))

(defn load-state! [id]
  (when-let [content (.getItem js/localStorage id)]
    (.setValue (session (@editors id)) content)))



(def run-tests! (delay-buffered run-tests! 500))
(def refresh-canvas! (delay-buffered refresh-canvas! 200))


(defn init! []
  (let [send-event! (fn [id data] (set! (.-editor data) id) (model/emit-event! data))
        onchange (juxt send-event! save-state!)
        editors {"html-editor" {:mode "ace/mode/html"
                                "change" (fn [id event] (refresh-canvas!) (onchange id event))}

                 "js-editor"   {:mode "ace/mode/javascript"
                                "change" onchange
                                "changeAnnotation" (fn [id] (run-if-stable! id (juxt refresh-canvas! run-tests!)))}

                 "test-editor" {:mode "ace/mode/javascript"
                                "change" onchange
                                "changeAnnotation" (fn [id] (run-if-stable! id run-tests!))}}]

    ;;load from local storage
    (doseq [[id opts] editors]
      (init-editor! id (:mode opts) (dissoc opts :mode))
      (load-state! id))))

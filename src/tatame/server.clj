(ns tatame.server
  (:use [ring.util.response :only [redirect]]
        [ring.middleware.file :only [wrap-file]]
        [ring.middleware.file-info :only [wrap-file-info]]
        [noir.core :only [custom-handler]]
        [noir.server :only [gen-handler load-views-ns add-middleware]]
        [compojure.core :only [defroutes GET]]
        [noir.fetch.remotes :only [defremote wrap-remotes]]

        [tatame.server.ws :only [websocket-handler]])

  (:require [aleph.http :as aleph]
            [tatame.model.commands :as model]
            [tatame.server.views :as views]))


(load-views-ns 'tatame.server.views)

(custom-handler "/socket" [] (aleph/wrap-aleph-handler websocket-handler))
(def app (gen-handler))




(defremote adder [& nums]
  (apply + nums))

(add-middleware wrap-remotes)

(defonce server (atom nil))

(defn -main []
  (let [port 8108]
    (reset! server (aleph/start-http-server (-> #'app
                                               (wrap-file "static")
                                               wrap-file-info
                                               aleph/wrap-ring-handler) {:port port :websocket true}))

    (println (str "Server started on port " port))))

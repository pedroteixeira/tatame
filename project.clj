(defproject tatame "1.0.0-SNAPSHOT"
  :description "tatame dojo toolkit"
  :dependencies [[org.clojure/clojure "1.3.0"]
                 [aleph "0.2.1-SNAPSHOT"]
                 [compojure "1.0.1"]]

  ; [hiccup "0.3.8"]
  ; :dev-dependencies [[lein-ring "0.5.4"]]

  :main "tatame.core"

  :plugins [[lein-cljsbuild "0.1.3"]
            [lein-swank "1.4.4"]]

  :hooks [leiningen.cljsbuild]

  :cljsbuild {
              :builds [{:source-path "src-cljs"
                        :repl-listen-port 9000
                        :compiler {:output-to "static/javascripts/main.js"
                                   :optimizations :whitespace
                                   :pretty-print true}}

                       {:source-path "src-cljs-worker"
                        :compiler {:output-to "static/javascripts/worker.js"
                                   :optimizations :whitespace
                                   :pretty-print true}}


                       ]})

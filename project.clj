(defproject tatame "1.0.0-SNAPSHOT"
  :description "tatame dojo toolkit"
  :dependencies [[org.clojure/clojure "1.3.0"]
                 [aleph "0.2.1-SNAPSHOT"]
                 [compojure "1.0.1"]

                 ;;[noir-async "1.0.0-SNAPSHOT"]
                 [noir "1.3.0-beta2"]
                 [hiccup "1.0.0-beta1"]

                 [crate "0.1.0-alpha3"]
                 [fetch "0.1.0-alpha2"]

                 [jayq "0.1.0-alpha3"]
                 [waltz "0.1.0-SNAPSHOT"]
                 [clj-esearch "0.5.1"]
                 [clj-jgit "0.0.3"]]


  ;; :main ^{:skip-aot true} tatame.server
  ;:aot [tatame.server]
  ;:uberjar-exclusions [#"cljs/.*\.class"]

  :plugins [[lein-cljsbuild "0.1.5"]
            [lein-swank "1.4.4"]]

  :cljsbuild {
              :repl-listen-port 9000
              :builds [{:source-path "src/tatame/client"
                        :compiler {:output-to "static/javascripts/main.js"
                                   :optimizations :whitespace
                                   :pretty-print true}}

                       {:source-path "src/tatame/worker"
                        :compiler {:output-to "static/javascripts/worker.js"
                                   :optimizations :whitespace
                                   :pretty-print true}}
                       ]})

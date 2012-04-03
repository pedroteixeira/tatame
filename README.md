# tatame

## Usage
Install elastic search
http://www.elasticsearch.org/download/
  $ ./bin/elasticsearch


Install leiningen
https://github.com/technomancy/leiningen

  $ lein deps
  $ lein cljsbuild auto



## Getting started with Emacs

Install GNU Emacs 24 with prelude
Follow instructions at https://github.com/bbatsov/emacs-prelude
M-x package-list-packages
Install clojurescript mode


### ClojureScript repl
Open any .cljs 
C-c C-z

M-x slime-mode (to disable slime so cljs buffers use the inferior-lisp
repl)
M-x paredit-mode (because it rocks)


### Clojure repl
Open serer.clj
M-x clojure-jack-in
C-c C-k to compile

C-c C-z goes to the slime repl
C-c M-p navigates into the app's namespace
(-main) starts server

### Workflow

google-chrome http://localhost:8108

You have two REPLs to work with:
* inferior-lisp for clojurescript (connected with the browser)
* slime for clojure (connected with jvm)


\o/



## License

Copyright (C) 2012 FIXME

Distributed under the Eclipse Public License, the same as Clojure.

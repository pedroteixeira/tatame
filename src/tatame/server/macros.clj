(ns tatame.server.macros)

(defmacro get-template [path]
  (slurp path))
(ns tatame.macros)

(defmacro get-template [path]
  (slurp path))
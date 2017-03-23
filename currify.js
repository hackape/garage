/*
 * Idea learned from functional programming paradigm
 *
 * usage:
 * say we have 
 * `function foobar (a, b, c) { console.log('a:', a, 'b:', b, 'c:', c) }`
 * we can wrap it with `var foobar = currify(foobar)`
 * now `foobar` is turned into such a fucntion, 
 * that it's execution will be postponed till it has received all 3 arguments it requires
 * so we can do:
 * `foobar()(1)(2, 3)`
 * `=> a: 1 b: 2 c: 3
 */

function currify (fn) {
  const len = fn.length
  return function () {
    if (arguments.length >= len) {
      return fn.apply(null, arguments)
    } else {
      if (!arguments.length) return currify(fn)
      const args = Array.prototype.slice.call(arguments)
      const fnBinded = fn.bind.apply(fn, ([null]).concat(args))
      return currify(fnBinded)
    }
  }
}

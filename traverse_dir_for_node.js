var fs = require('fs')
var path = require('path')

var execCount = 0
function traverse (entryPoint, predicate, action, accumulator=[], maxExec) {
  
  if (maxExec > 0 && execCount >= maxExec) return accumulator

  var files = fs.readdirSync(entryPoint)
  return files.reduce( (acc, file) => {
    var filepath = path.join(entryPoint,file)
    if (!fs.statSync(filepath).isDirectory()) {
      execCount++
      if ( predicate(filepath) ) {
        acc.push({
          path: filepath,
          result: action(filepath)
        })
      }
      return acc
    } else {
      return traverse(filepath, predicate, action, acc, maxExec)
    }

  }, accumulator)
}

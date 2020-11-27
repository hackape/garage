// simple impl emulating the PassThrough stream in nodejs

function defer() {
  let resolve;
  let reject;
  let promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })
  return { promise, resolve, reject }
}


function createPipe() {
  let d = defer()

  function next(value) {
    d.resolve(value)
    console.log('refresh')
    d = defer()
  }

  const emit = (async function* passthrough() {
    while (true) {
      const value = await d.promise
      console.log('resolve')
      yield value
    }
  })()

  return { next, emit }
}

async function consume(p) {
  for await (const v of p) {
    console.log('v:', v)
  }
}

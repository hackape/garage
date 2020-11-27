// simple impl emulating the PassThrough stream in nodejs

export function defer<V = any, R = any>() {
  let resolve: (value?: V) => void
  let reject: (reason?: R) => void
  let promise = new Promise<V>((r, j) => {
    resolve = r
    reject = j
  })
  // @ts-ignore
  return { promise, resolve, reject }
}

function createPassThroughStream() {
  let paused = true
  let d = defer()

  let buffer: any[] = []
  let readable = false

  function pause() {
    d = defer()
    paused = true
  }

  function flow() {
    d.resolve(true)
    paused = false
  }

  function write(value: any) {
    readable = true
    buffer.push(value)

    if (paused) flow()
  }

  const stream = (async function* passthrough() {
    while (true) {
      await d.promise
      if (readable) {
        for (const value of buffer) {
          yield value
        }

        buffer.length = 0
        readable = false
      }

      pause()
    }
  })()

  return { write, stream }
}


async function consume(p) {
  for await (const v of p) {
    console.log('v:', v)
  }
}



async function example() {
  const { write, stream } = createPassThroughStream()

  write(1)
  write(2)
  write(3);

  consume(stream)
  await wait(10);
  write(4)
  write(5)
  write(6)

  await wait(10)
  write('a')
  await wait(10)
  write('b')
  await wait(10)
  write('c')
  await wait(10)
}

class StdDevAcc {
  isSample = true
  m = 0
  S = 0 // squared diff sum
  n = 0

  add(...args) {
    if (args.length == 1) {
      if (Array.isArray(args[0])) {
        args[0].forEach(x => this._add(x))
      } else {
        this._add(args[0])
      }
    } else if (args.length > 1) {
      args.forEach(x => this._add(x))
    }
  }

  _add(x) {
    const { m, S, n } = this

    // explanation: https://math.stackexchange.com/a/2105509/737602
    this.S = S + (n / (n + 1)) * (x - m) * (x - m)
    this.m = m + (x - m) / (n + 1)
    this.n += 1
  }

  get variance() {
    const offset = this.isSample ? 1 : 0
    return this.S / (this.n - offset)
  }

  get stddev() {
    return Math.sqrt(this.variance)
  }

  get mean() {
    return this.m
  }
}

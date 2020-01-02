function double_floating_point_in_memory(n) {
  // IEEE 754 Double Precision Floating Point Number
  // sign bit 1, 1 = negative, 0 = positive
  // exponent bits 11, bias 1023
  // significand bits 52, implied leading `1.x`

  const SIGNIFICAND_BITS = 53

  let decimalRep = String(n)
  let sign = 1
  if (decimalRep[0] == '-') {
    decimalRep = decimalRep.slice(1)
    sign = -1
  }

  // split to integer and fraction parts
  const [sig_int, sig_frac] = decimalRep.split('.')
  let int = Number(sig_int)
  let frac = sig_frac ? Number('0.' + sig_frac) : 0

  let exp = 0
  // handle integer first
  const intBin = []
  while (int) {
    int = int / 2
    const intFloor = Math.floor(int)
    const bit = int > intFloor ? 1 : 0
    intBin.unshift(bit)
    exp++
    int = intFloor
    if (intBin.length > SIGNIFICAND_BITS) {
      // lose precision
      intBin.pop()
    }
  }

  const intBinLen = intBin.length
  if (intBinLen) exp -= 1 // done with integer part, shift floating point to the right by one to get `1.xxx`

  const fracBin = []
  if (frac != 0 && intBinLen < SIGNIFICAND_BITS) {
    let foundOne = intBinLen ? true : false
    while (frac != 1) {
      frac = frac * 2
      const bit = frac >= 1 ? 1 : 0
      if (!bit && !foundOne) {
        if (!intBinLen) exp--
      } else {
        if (!foundOne) {
          exp--
          foundOne = true
        }
      }
      if (foundOne) fracBin.push(bit)

      if (fracBin.length + intBinLen >= SIGNIFICAND_BITS) break
    }
  }

  let sigBin = intBin.concat(fracBin)

  // ensure sigBin.length == 53
  if (sigBin.length < SIGNIFICAND_BITS) {
    const zeros = new Array(SIGNIFICAND_BITS - sigBin.length).fill(0)
    sigBin = sigBin.concat(zeros)
  } else if (sigBin.length > SIGNIFICAND_BITS) {
    sigBin = sigBin.slice(0, 53)
  }

  // shift the implied leading `1`, keep only 52 bits
  sigBin.shift()

  let expBin = (exp + 1023)
    .toString(2)
    .split('')
    .map(Number)
  while (expBin.length < 11) {
    expBin.unshift(0)
  }

  const signBit = sign > 0 ? 0 : 1

  const stringRep = signBit + ' ' + expBin.join('') + ' ' + sigBin.join('')
  const arrayRep = [[signBit], expBin, sigBin]
  return {
    sign,
    exp,
    significand: '1.' + sigBin.join(''),

    asString: stringRep,
    asArray: arrayRep
  }
}

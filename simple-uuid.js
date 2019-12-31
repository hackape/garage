// not real universally-unique, but good enough for daily usage

// https://github.com/GoogleChromeLabs/comlink/blob/master/src/comlink.ts
function generateUUID() {
  return new Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
    .join("-");
}

// https://stackoverflow.com/a/105078/3617380
function generateGuid() {
  var result, i, j;
  result = '';
  for(j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20)
      result = result + '-';
    i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
    result = result + i;
  }
  return result;
}

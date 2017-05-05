import flattenDeep from 'lodash/flattenDeep'
import zip from 'lodash/zip'

export default function multiline (strings, ...keys) {
  const originalString = flattenDeep(zip(strings, keys)).join('')
  const reIndent = /^[\ \t]+/
  let minIndentWidth = Infinity
  let minIndent = ''

  return originalString.split('\n').reduce((acc, str, idx) => {
    if (idx === 0 && str.replace(/\s*/g, '') === '') return acc
    const matchOfIndent = reIndent.exec(str)
    const indent = matchOfIndent ? matchOfIndent[0] : ''
    if (indent.length !== str.length) {
      if (indent.length < minIndentWidth) {
        minIndentWidth = indent.length
        minIndent = indent
      }
    }
    acc.push(str)
    return acc
  }, []).map(str => str.replace(RegExp('^'+minIndent), '')).join('\n')
}

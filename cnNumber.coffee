cnNumber = (input) ->
  cnNumMap = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  tensUnitMap = ['', '十', '百', '千']
  wansUnitMap = ['', '万', '亿', '兆']

  if typeof input != 'number' then return ''
  if input == 0 then return '〇'
  reversedDigits = String(input).split('').reverse().map((d)-> Number(d))
  digitGroups = []
  while reversedDigits.length
    digitGroups.push(reversedDigits.splice(0, 4))

  _possibleMiddleZero = false
  _hasMetZero = false
  return digitGroups.reduce((_lastRet, group, _i) ->

    highestDigit = group[group.length - 1]
    groupSum = group.reduce( (sum, x, i) -> sum += x * window.Math.pow(10, i) )

    _middleZero = if _possibleMiddleZero and _hasMetZero and groupSum
    then cnNumMap[0] else ''

    _hasMetZero = highestDigit and true
    _possibleMiddleZero = true if groupSum
    wansUnit = if groupSum then wansUnitMap[_i] else ''

    possibleMiddleZero = false
    hasMetZero = false
    groupRet = group.reduce((lastRet, d, i) ->
      middleZero = if possibleMiddleZero and hasMetZero and d
      then cnNumMap[0] else ''

      if d == 0
        hasMetZero = true
        cnDigit = ''
        tensUnit = ''
      else
        possibleMiddleZero = true
        hasMetZero = false
        cnDigit = cnNumMap[d]
        tensUnit = tensUnitMap[i]
        # 仅 11-19 为 「十一」至「十九」其他状况为 「一十几」
        if 10 <= groupSum <= 19 then cnDigit = ''
      return cnDigit + tensUnit + middleZero + lastRet
    , '')

    return groupRet + wansUnit + _middleZero + _lastRet
  , '')

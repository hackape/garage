cnNumber = (input, zh_tw=false) ->
  zh_cn_num = ['〇','一','二','三','四','五','六','七','八','九']
  zh_tw_num = ['零','壹','贰','叁','肆','伍','陆','柒','捌','玖']
  zh_cn_tensUnit = ['','十','百','千']
  zh_tw_tensUnit = ['','拾','佰','仟']
  cnNumMap = if zh_tw then zh_tw_num else zh_cn_num
  tensUnitMap = if zh_tw then zh_tw_tensUnit else zh_cn_tensUnit
  wansUnitMap = ['', '万', '亿', '万亿']

  if typeof input != 'number' then return ''
  if input >= 9999999999999999 then return '数字过大'
  if input == 0 then return cnNumMap[0]
  reversedDigits = String(input).split('').reverse().map((d)-> Number(d))
  groupsOfThousand = []
  while reversedDigits.length
    groupsOfThousand.push(reversedDigits.splice(0, 4))

  convertThousandGroup = (group) ->
    groupSum = group.reduce( (sum, x, i) -> sum += x * Math.pow(10, i) )
    possibleMiddleZero = false
    hasMetZero = false
    group.reduce((lastRet, d, i) ->
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
        if 10 <= groupSum <= 19 and i == 1 then cnDigit = ''
      return cnDigit + tensUnit + middleZero + lastRet
    , '')

  convert = (groupsOfThousand) ->
    possibleMiddleZero = false
    hasMetZero = false
    return groupsOfThousand.reduce((lastRet, group, i) ->

      highestDigit = group[group.length - 1]
      groupSum = group.reduce( (sum, x, j) -> sum += x * Math.pow(10, j) )

      middleZero = if possibleMiddleZero and hasMetZero and groupSum
      then cnNumMap[0] else ''

      hasMetZero = highestDigit == 0
      possibleMiddleZero = true if groupSum > 0
      wansUnit = if groupSum then wansUnitMap[i] else ''

      return convertThousandGroup(group) + wansUnit + middleZero + lastRet
    , '')

  return convert(groupsOfThousand)

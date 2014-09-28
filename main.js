// get url params, simply converts the href string to a json-ish object.
// url must comes in the format as: 
// "baseurl.com/whatever?param1=value1&param2=value2"...
// point is it must start with "?", key-value paired with "=", and keys separated by "&".

function getUrlParams(){
  var paramsArr = location.href.split('?')[1].split('&');
  var resultObj = {};
  if(arguments.length === 0){
    for(var j = 0; j < paramsArr.length; j++){
      resultObj[paramsArr[j].split('=')[0]] = paramsArr[j].split('=')[1];
    }
  } else {
    for(var i = 0; i < arguments.length; i++){
      for(var j = 0; j < paramsArr.length; j++){
        if(paramsArr[j].indexOf(arguments[i]) >= 0){
          resultObj[arguments[i]] = paramsArr[j].split('=')[1];
          break;
        }
      }
    }
  }
  return resultObj;
}

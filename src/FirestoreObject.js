function main() {
  
  const data = {
    "hello" : "friendo",
    "objectt": { "whoa": "there"},
    "numberr" : 5,
    "decimal" : 3.14
  }
  
  createFirestoreObject(data)
}

function createFirestoreObject(object) {
  const keys = Object.keys(object);
  const firestoreObj = {};
    
  firestoreObj["fields"] = {};
    
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = object[key];
    
    var type = typeof(val);
    Logger.log(type);
    
    switch(type) {
      case "string":
        firestoreObj["fields"][key] = wrapString_(val);
        break;
      case "object":
        firestoreObj["fields"][key] = wrapObject_(val);
        break;
      case "number":
        firestoreObj["fields"][key] = wrapNumber_(val);
      default:
        // error
        break;
    }
  }
  
  Logger.log(firestoreObj)
  
  return firestoreObj
}

function wrapString_(string) {
  return {"stringValue" : string}
}

function wrapObject_(object) {
  
  if (!object) {
    return {"nullValue": null}
  }
  
  return {"mapValue" : createFirestoreObject(object)}
}

function wrapNumber_(num) {
  if (isInt_(num)) {
    return wrapInt_(num);
  } else {
    return wrapDouble_(num);           
  }
}

function wrapInt_(int) {
  return {"integerValue" : int}
}

function wrapDouble_(double) {
  return {"doubleValue" : double}
}
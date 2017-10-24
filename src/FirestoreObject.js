function createFirestoreObject(object) {
  const keys = Object.keys(object);
  const firestoreObj = {};
    
  firestoreObj["fields"] = {};
    
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = object[key];
  
    firestoreObj["fields"][key] = wrapValue_(val);
  }

  return firestoreObj;
}

function getObjectFromFirestoreObject(firestoreObj) {
  const fields = firestoreObj["fields"]
  const keys = Object.keys(fields);
  const object = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var firestoreValue = fields[key];
  
    object[key] = unwrapValue_(firestoreValue);
  }

  return object;
}

function wrapValue_(value) {
  var type = typeof(value);
  switch(type) {
      case "string":
        return wrapString_(value);
      case "object":
        return wrapObject_(value);
      case "number":
        return wrapNumber_(value);
      case "boolean":
        return wrapBoolean_(value);
      default:
        // error
        return null;
    }
}

function unwrapValue_(value) {
  var type = Object.keys(value)[0];
  switch(type) {
      case "stringValue":
      case "boolean":
      case "integerValue":
      case "doubleValue":
        return value[type];
      case "nullValue":
        return null;
      case "mapVaue":
        return getObjectFromFirestoreObject(value[type]);
      case "arrayValue":
        return unwrapArray_(value[type]["values"])
      default:
        // error
        return null;
    }
}

function wrapString_(string) {
  return {"stringValue" : string};
}

function wrapObject_(object) {
  
  if (!object) {
    return {"nullValue": null};
  }

  if (Array.isArray(object)) {
    return wrapArray_(object);
  }
  
  return {"mapValue" : createFirestoreObject(object)};
}

function wrapNumber_(num) {
  if (isInt_(num)) {
    return wrapInt_(num);
  } else {
    return wrapDouble_(num);
  }
}

function wrapInt_(int) {
  return {"integerValue" : int};
}

function wrapDouble_(double) {
  return {"doubleValue" : double};
}

function wrapBoolean_(boolean) {
  return {"booleanValue" : boolean};
}

function wrapArray_(array) {
  const wrappedArray = [];

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var wrappedValue = wrapValue_(value);
    wrappedArray.push(wrappedValue);
  }

  return {"arrayValue" : {"values": wrappedArray}};
}

function unwrapArray_(wrappedArray) {
  const array = [];

  for (var i = 0; i < wrappedArray.length; i++) {
    var wrappedValue = wrappedArray[i];
    var unwrappedValue = unwrapValue_(wrappedValue);
    array.push(unwrappedValue);
  }

  return array;
}
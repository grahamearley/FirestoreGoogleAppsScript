/* globals isInt_, regexPath_, regexBinary_ */

/**
 * Create a Firestore documents with the corresponding fields.
 *
 * @param {object} fields the document's fields
 * @return {object} a Firestore document with the given fields
 */
function createFirestoreDocument_ (fields) {
  const keys = Object.keys(fields)
  const firestoreObj = {}

  firestoreObj['fields'] = {}

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var val = fields[key]

    firestoreObj['fields'][key] = wrapValue_(val)
  }

  return firestoreObj
}

/**
 * Extract fields from a Firestore document.
 *
 * @param {object} firestoreDoc the Firestore document whose fields will be extracted
 * @return {object} an object with the given document's fields and values
 */
function getFieldsFromFirestoreDocument_ (firestoreDoc) {
  if (!firestoreDoc || !firestoreDoc['fields']) {
    return {}
  }

  const fields = firestoreDoc['fields']
  const keys = Object.keys(fields)
  const object = {}

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var firestoreValue = fields[key]

    object[key] = unwrapValue_(firestoreValue)
  }

  return object
}

function wrapValue_ (value) {
  var type = typeof (value)
  switch (type) {
    case 'string':
      return wrapString_(value)
    case 'object':
      return wrapObject_(value)
    case 'number':
      return wrapNumber_(value)
    case 'boolean':
      return wrapBoolean_(value)
    default:
      // error
      return null
  }
}

function unwrapValue_ (value) {
  var type = Object.keys(value)[0]
  value = value[type]
  switch (type) {
    case 'referenceValue':
      // TODO: Allow possibility to retrieve document from this reference
      // return value.match(/\/documents\/(.*)/)[1];
      // fall through
    case 'bytesValue':
    case 'stringValue':
    case 'booleanValue':
    case 'integerValue':
    case 'doubleValue':
      return value
    case 'geoPointValue':
      value = createFirestoreDocument_(value)
      // Transform coordinates as mapValue object type
      // fall through
    case 'mapValue':
      return getFieldsFromFirestoreDocument_(value)
    case 'arrayValue':
      return unwrapArray_(value['values'])
    case 'timestampValue':
      return new Date(value)
    case 'nullValue':
    default: // error
      return null
  }
}

function wrapString_ (string) {
  if (regexPath_.test(string)) {
    return wrapRef_(string)
  }

  // Not guaranteed to catch all
  if (regexBinary_.test(string)) {
    return wrapBytes_(string)
  }

  return {'stringValue': string}
}

function wrapObject_ (object) {
  if (!object) {
    return wrapNull_()
  }

  if (Array.isArray(object)) {
    return wrapArray_(object)
  }

  if (object instanceof Date) {
    return wrapDate_(object)
  }

  if (Object.keys(object).length === 2 && 'latitude' in object && 'longitude' in object) {
    return wrapLatLong_(object)
  }

  return {'mapValue': createFirestoreDocument_(object)}
}

function wrapNull_ () {
  return {'nullValue': null}
}

function wrapBytes_ (bytes) {
  return {'bytesValue': bytes}
}

function wrapRef_ (ref) {
  return {'referenceValue': ref}
}

function wrapNumber_ (num) {
  if (isInt_(num)) {
    return wrapInt_(num)
  } else {
    return wrapDouble_(num)
  }
}

function wrapInt_ (int) {
  return {'integerValue': int}
}

function wrapDouble_ (double) {
  return {'doubleValue': double}
}

function wrapBoolean_ (boolean) {
  return {'booleanValue': boolean}
}

function wrapDate_ (date) {
  return {'timestampValue': date}
}

function wrapLatLong_ (latLong) {
  return {'geoPointValue': latLong}
}

function wrapArray_ (array) {
  const wrappedArray = []

  for (var i = 0; i < array.length; i++) {
    var value = array[i]
    var wrappedValue = wrapValue_(value)
    wrappedArray.push(wrappedValue)
  }

  return {'arrayValue': {'values': wrappedArray}}
}

function unwrapArray_ (wrappedArray) {
  const array = []

  if (!wrappedArray) {
    return array
  }

  for (var i = 0; i < wrappedArray.length; i++) {
    var wrappedValue = wrappedArray[i]
    var unwrappedValue = unwrapValue_(wrappedValue)
    array.push(unwrappedValue)
  }

  return array
}

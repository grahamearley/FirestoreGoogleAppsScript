/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals Utilities */

var regexPath_ = /^projects\/.+?\/databases\/\(default\)\/documents\/.+\/.+$/
var regexBinary_ = /[\x00-\x08\x0E-\x1F]/ // eslint-disable-line no-control-regex

// Assumes n is a Number.
function isInt_ (n) {
  return n % 1 === 0
}

function base64EncodeSafe_ (string) {
  var encoded = Utilities.base64EncodeWebSafe(string)
  return encoded.replace(/=/g, '')
}

function removeTrailingSlash_ (string) {
  const length = string.length
  if (string.charAt(length - 1) === '/') {
    // Remove trailing slash
    return string.substr(0, length - 1)
  } else {
    return string
  }
}

function getObjectFromResponse_ (response) {
  return JSON.parse(response.getContentText())
}

function checkForError_ (responseObj) {
  if (responseObj['error']) {
    throw new Error(responseObj['error']['message'])
  }
}

function getIdFromPath_ (path) {
  return path.split('/').pop()
}

function addAll_ (array, itemsToAdd) {
  for (var i = 0; i < itemsToAdd.length; i++) {
    var item = itemsToAdd[i]
    array.push(item)
  }
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals UrlFetchApp, Utilities */

// RegEx test for root path references
var regexPath_ = /^projects\/.+?\/databases\/\(default\)\/documents\/.+\/.+$/
// RegEx test for testing for binary data by checking for non-printable characters.
// Parsing strings for binary data is completely dependent on the data being sent over.
var regexBinary_ = /[\x00-\x08\x0E-\x1F]/ // eslint-disable-line no-control-regex

// Assumes n is a Number.
function isInt_ (n) {
  return n % 1 === 0
}

function isNumeric_ (val) {
  return Number(parseFloat(val)) === val
}

function base64EncodeSafe_ (string) {
  const encoded = Utilities.base64EncodeWebSafe(string)
  return encoded.replace(/=/g, '')
}

function removeTrailingSlash_ (string) {
  const length = string.length
  if (string.charAt(length - 1) === '/') {
    // Remove trailing slash
    string = string.substr(0, length - 1)
  }
  return string
}

function fetchObject_ (url, options) {
  const response = UrlFetchApp.fetch(url, options)
  const responseObj = JSON.parse(response.getContentText())
  checkForError_(responseObj)
  return responseObj
}

function checkForError_ (responseObj) {
  if (responseObj['error']) {
    throw new Error(responseObj['error']['message'])
  }
  if (Array.isArray(responseObj) && responseObj.length && responseObj[0]['error']) {
    throw new Error(responseObj[0]['error']['message'])
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

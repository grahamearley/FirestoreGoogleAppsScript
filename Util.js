/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals UrlFetchApp, Utilities */

// RegEx test for root path references. Groups relative path for extraction.
var regexPath_ = /^projects\/.+?\/databases\/\(default\)\/documents\/(.+\/.+)$/
// RegEx test for testing for binary data by checking for non-printable characters.
// Parsing strings for binary data is completely dependent on the data being sent over.
var regexBinary_ = /[\x00-\x08\x0E-\x1F]/ // eslint-disable-line no-control-regex
// RegEx test for finding and capturing milliseconds.
// Apps Scripts doesn't support RFC3339 Date Formats, nanosecond precision must be trimmed.
var regexDatePrecision_ = /(\.\d{0,3})\d+/

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
function getCollectionFromPath_ (path) {
  return getColDocFromPath_(path, false)
}
function getDocumentFromPath_ (path) {
  return getColDocFromPath_(path, true)
}

function getColDocFromPath_ (path, isDocument) {
  // Path defaults to empty string if it doesn't exist. Remove insignificant slashes.
  const splitPath = (path || '').split('/').filter(function (p) {
    return p
  })
  const len = splitPath.length

  // Set item path to document if isDocument, otherwise set to collection if exists.
  // This works because path is always in the format of "collection/document/collection/document/etc.."
  const item = len && len & 1 ^ isDocument ? splitPath.splice(len - 1, 1)[0] : ''

  // Remainder of path is in splitPath. Put back together and return.
  return [splitPath.join('/'), item]
}

/**
 * Check if a value is of type Number but is NaN.
 *  This check prevents seeing non-numeric values as NaN.
 *
 * @param {value} the value to check
 * @returns {boolean} whether the given value is of type number and equal to NaN
 */
function isNumberNaN(value) {
  return typeof(value) == "number" && isNaN(value)
}

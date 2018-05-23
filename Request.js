/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals fetchObject_ */

/**
 * Manages the requests to send. Chain methods to update options.
 * Must call .fetch to send the request with given options.
 *
 * @constructor
 * @private
 * @param url the base url to utilize
 * @param authToken authorization token to make requests
 * @param options Optional set of options to utilize over the default headers
 */
var FirestoreRequest_ = function (url, authToken, options) {
  const this_ = this
  var queryString = ''
  options = options || {
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + authToken
    }
  }
  options.muteHttpExceptions = true

  /**
   * Sets the payload option
   *
   * @param obj Object payload to stringify
   * @returns {FirestoreRequest_} this request to be chained
   */
  const payload = function (obj) {
    options.payload = JSON.stringify(obj)
    return this_
  }

  /**
   * Sets the type of REST method to send
   *
   * @param type String value equal to one of the REST method types
   * @returns {FirestoreRequest_} this request to be chained
   */
  const method = function (type) {
    options.method = type
    return this_
  }

  /**
   * Set request as a POST method
   *
   * @param obj Optional object to send as payload
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.post = function (obj) {
    if (obj) {
      payload(obj)
    }
    return method('post')
  }

  /**
   * Set request as a GET method
   *
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.get = function () {
    return method('get')
  }

  /**
   * Set request as a PATCH method.
   *
   * @param obj Optional object to send as payload
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.patch = function (obj) {
    if (obj) {
      payload(obj)
    }
    return method('patch')
  }

  /**
   * Set request as a DELETE method (delete is a keyword)
   *
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.remove = function () {
    return method('delete')
  }

  /**
   * Adds a parameter to the URL query string.
   *  Can be repeated for additional key-value mappings
   *
   * @param key the key to add
   * @param value the value to set
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.addParam = function (key, value) {
    key = encodeURI(key)
    value = encodeURI(value)
    queryString += (queryString.indexOf('?') === -1 ? '?' : '&') + key + '=' + value
    return this_
  }

  /**
   * Send the request with the given path
   *
   * @param path the path to send the request to
   * @returns {object} the response JSON object
   */
  this.fetch = function (path) {
    return fetchObject_(url + (path || '') + queryString, options)
  }

  /**
   * Used to clone the request instance. Useful for firing multiple requests.
   *
   * @returns {FirestoreRequest_} A copy of this object
   */
  this.clone = function () {
    return new FirestoreRequest_(url, authToken, options)
  }
}

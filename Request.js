/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* eslint quote-props: ["error", "always"] */

/**
 * Manages the requests to send. Chain methods to update options.
 * Must call .get/.post/.patch/.remove to send the request with given options.
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
  // Set default header options if none are passed in
  options = options || {
    'headers': {
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
   * @param path the path to send the request to
   * @returns {FirestoreRequest_} this request to be chained
   */
  const method = function (type, path) {
    options.method = type
    return fetchObject_(url + cleanPath_(path || '') + queryString, options)
  }

  /**
   * Adds a parameter to the URL query string.
   *  Can be repeated for additional key-value mappings
   *
   * @param {string} key the key to add
   * @param {string} value the value to set
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.addParam = function (key, value) {
    key = encodeURI(key)
    value = encodeURI(value)
    queryString += (queryString.indexOf('?') === -1 ? '?' : '&') + key + '=' + value
    return this_
  }

  /**
   * Alters the route by prepending the query string.
   *
   * @param {string} route to set
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.route = function (route) {
    queryString = ':' + route + queryString
    return this_
  }

  /**
   * Set request as a GET method
   *
   * @param {string} path the path to send the request to
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.get = function (path) {
    return method('get', path)
  }

  /**
   * Set request as a POST method
   *
   * @param path the path to send the request to
   * @param obj Optional object to send as payload
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.post = function (path, obj) {
    if (obj) {
      payload(obj)
    }
    return method('post', path)
  }

  /**
   * Set request as a PATCH method.
   *
   * @param path the path to send the request to
   * @param obj Optional object to send as payload
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.patch = function (path, obj) {
    if (obj) {
      payload(obj)
    }
    return method('patch', path)
  }

  /**
   * Set request as a DELETE method (delete is a keyword)
   *
   * @param path the path to send the request to
   * @returns {FirestoreRequest_} this request to be chained
   */
  this.remove = function (path) {
    return method('delete', path)
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

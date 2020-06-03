/**
 * Manages the requests to send. Chain methods to update options.
 * Must call .get/.post/.patch/.remove to send the request with given options.
 */
class Request {
  url: string;
  authToken: string;
  queryString: string;
  options: RequestOptions;
  nextPageToken?: string | null;
  documents?: any[];
  fields?: Record<string, any>;

  /**
   * @param url the base url to utilize
   * @param authToken authorization token to make requests
   * @param options [Optional] set of options to utilize over the default headers
   */
  constructor(url: string, authToken?: string, options?: RequestOptions) {
    this.url = url;
    this.queryString = '';
    this.authToken = authToken || '';

    if (!this.authToken) options = options || {};
    // Set default header options if none are passed in
    this.options = options || {
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + this.authToken,
      },
    };
    this.options['muteHttpExceptions'] = true;
  }

  /**
   * Sets the payload option
   *
   * @param obj Object payload to stringify
   * @return {Request} this request to be chained
   */
  payload(obj: Record<string, any>): Request {
    this.options['payload'] = JSON.stringify(obj);
    return this;
  }

  /**
   * Sets the type of REST method to send
   *
   * @param type String value equal to one of the REST method types
   * @param path the path to send the request to
   * @return {any} this request to be chained
   */
  method_<T>(type: Method, path?: string): T {
    const url = this.url + Util_.cleanPath(path || '') + this.queryString;
    this.options['method'] = type;

    const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(url, this.options);
    const responseObj: T = JSON.parse(response.getContentText());

    this.checkForError(responseObj);
    return responseObj;
  }

  /**
   * Adds a parameter to the URL query string.
   * Can be repeated for additional key-value mappings
   *
   * @param {string} key the key to add
   * @param {string} value the value to set
   * @return {this} this request to be chained
   */
  addParam(key: string, value: string): this {
    this.queryString += (this.queryString.startsWith('?') ? '&' : '?') + Util_.parameterize({ [key]: value });
    return this;
  }

  /**
   * Alters the route by prepending the query string.
   *
   * @param {string} route to set
   * @return {this} this request to be chained
   */
  route(route: string): this {
    this.queryString = `:${route}${this.queryString}`;
    return this;
  }

  /**
   * Set request as a GET method
   *
   * @param {string} path the path to send the request to
   * @return {T} JSON Object response
   */
  get<T>(path: string): T {
    return this.method_<T>('get', path);
  }

  /**
   * Set request as a POST method
   *
   * @param path the path to send the request to
   * @param obj [Optional] object to send as payload
   * @return {Request} this request to be chained
   */
  post<T>(path?: string, obj?: Record<string, any>): T {
    if (obj) {
      this.payload(obj);
    }
    return this.method_<T>('post', path);
  }

  /**
   * Set request as a PATCH method.
   *
   * @param path the path to send the request to
   * @param obj Optional object to send as payload
   * @return {Request} this request to be chained
   */
  patch<T>(path?: string, obj?: Record<string, any>): T {
    if (obj) {
      this.payload(obj);
    }
    return this.method_<T>('patch', path);
  }

  /**
   * Set request as a DELETE method (delete is a keyword)
   *
   * @param path the path to send the request to
   * @return {Request} this request to be chained
   */
  remove<T>(path: string): T {
    return this.method_<T>('delete', path);
  }

  /**
   * Used to clone the request instance. Useful for firing multiple requests.
   *
   * @return {Request} A copy of this object
   */
  clone(): Request {
    return new Request(this.url, this.authToken, this.options);
  }

  /**
   * Validate response object for errors
   *
   * @param {any} responseObj HTTP response object to validate
   * @throws Error if HTTP request errors found
   */
  checkForError(responseObj: any): void {
    if (responseObj.error) {
      throw new Error(responseObj.error.message || responseObj.error.error_description || responseObj.error);
    }
    if (Array.isArray(responseObj) && responseObj.length && responseObj[0].error) {
      throw new Error(responseObj[0].error.message);
    }
  }
}

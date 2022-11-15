class Util_ {
  /**
   * RegEx test for root path references. Groups relative path for extraction.
   */
  static get regexPath(): RegExp {
    return /^projects\/.+?\/databases\/\(default\)\/documents\/(.+\/.+)$/;
  }

  /**
   * RegEx test for testing for binary data by checking for non-printable characters.
   * Parsing strings for binary data is completely dependent on the data being sent over.
   */
  static get regexBinary(): RegExp {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x08\x0E-\x1F]/;
  }

  /**
   * RegEx test for finding and capturing milliseconds.
   * Apps Scripts doesn't support RFC3339 Date Formats, nanosecond precision must be trimmed.
   */
  static get regexDatePrecision(): RegExp {
    return /(\.\d{3})\d+/;
  }

  /**
   * Checks if a number is an integer.
   *
   * @param {value} n value to check
   * @return {boolean} true if value can be coerced into an integer, false otherwise
   */
  static isInt(n: number): boolean {
    return n % 1 === 0;
  }

  /**
   * Check if a value is a valid number.
   *
   * @param {value} val value to check
   * @return {boolean} true if a valid number, false otherwise
   */
  static isNumeric(val: number): boolean {
    return Number(parseFloat(val.toString())) === val;
  }

  /**
   * Check if a value is of type Number but is NaN.
   * This check prevents seeing non-numeric values as NaN.
   *
   * @param {value} value value to check
   * @return {boolean} true if NaN, false otherwise
   */
  static isNumberNaN(value: any): boolean {
    return typeof value === 'number' && isNaN(value);
  }

  /**
   * Gets collection of documents with the given path
   *
   * @param {string} path Collection path
   * @return {array} Collection of documents
   */
  static getCollectionFromPath(path: string): [string, string] {
    return this.getColDocFromPath(path, false);
  }

  /**
   * Gets document with the given path
   *
   * @param {string} path Document path
   * @return {object} Document object
   */
  static getDocumentFromPath(path: string): [string, string] {
    return this.getColDocFromPath(path, true);
  }

  /**
   * Gets collection or document with the given path
   *
   * @param {string} path Document/Collection path
   * @return {array|object} Collection of documents or a single document
   */
  static getColDocFromPath(path: string, isDocument: any): [string, string] {
    // Path defaults to empty string if it doesn't exist. Remove insignificant slashes.
    const splitPath = (path || '').split('/').filter(function (p) {
      return p;
    });
    const len = splitPath.length;

    this.cleanParts(splitPath);

    // Set item path to document if isDocument, otherwise set to collection if exists.
    // This works because path is always in the format of "collection/document/collection/document/etc.."
    const item = len && (len & 1) ^ isDocument ? splitPath.splice(len - 1, 1)[0] : '';

    // Remainder of path is in splitPath. Put back together and return.
    return [splitPath.join('/'), item];
  }

  /**
   * Gets document names from list of documents
   *
   * @param {string} path Relative collection path
   * @param {FirestoreAPI.Document[]} docs Array of documents
   * @return {string[]} of names
   */
  static stripBasePath(path: string, docs: FirestoreAPI.Document[]): string[] {
    return docs.map((doc: FirestoreAPI.Document) => {
      const ref: string = doc.name!.match(Util_.regexPath)![1]; // Gets the doc name field and extracts the relative path
      return ref.substr(path.length + 1); // Skip over the given path to gain the ID values
    });
  }

  /**
   * Validates Collection and Document names
   *
   * @see {@link https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields Firestore Limits}
   * @param {array} parts Array of strings representing document path
   * @return {array} of URI Encoded path names
   * @throws {Error} Validation errors if it doesn't meet API guidelines
   */
  static cleanParts(parts: string[]): string[] {
    return parts.map(function (part, i) {
      const type = i & 1 ? 'Collection' : 'Document';
      if (part === '.' || part === '..') {
        throw new TypeError(type + ' name cannot solely consist of a single period (.) or double periods (..)');
      }
      if (part.indexOf('__') === 0 && part.endsWith('__')) {
        throw new TypeError(type + ' name cannot be a dunder name (begin and end with double underscores)');
      }
      return encodeURIComponent(part);
    });
  }

  /**
   * Splits up path to be cleaned
   *
   * @param {string} path to be cleaned
   * @return {string} path that is URL-safe
   */
  static cleanPath(path: string): string {
    return this.cleanParts(path.split('/')).join('/');
  }

  static parameterize(obj: any, encode = true): string {
    const process = encode ? encodeURI : (s: string): string => s;
    return Object.entries<string>(obj)
      .map(([k, v]) => `${process(k)}=${process(v)}`)
      .join('&');
  }

  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  static isObject(item: any) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  static mergeDeep(target: any, ...sources: any): any {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.mergeDeep(target, ...sources);
  }
}

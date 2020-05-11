/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* eslint quote-props: ["error", "always"] */

/**
 * An internal object that acts as a Structured Query to be prepared before execution.
 * Chain methods to update query. Must call .execute to send request.
 *
 * @constructor
 * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery Firestore Structured Query}
 * @param {string} from the base collection to query
 * @param {queryCallback} callback the function that is executed with the internally compiled query
 */
var FirestoreQuery_ = function (from, callback) {
  const this_ = this

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Operator_1 FieldFilter Operator}
  const fieldOps = {
    '==': 'EQUAL',
    '===': 'EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    'contains': 'ARRAY_CONTAINS',
    'containsany': 'ARRAY_CONTAINS_ANY',
    'in': 'IN'
  }

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Operator_2 FieldFilter Operator}
  const unaryOps = {
    'nan': 'IS_NAN',
    'null': 'IS_NULL'
  }

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#FieldReference Field Reference}
  const fieldRef = function (field) {
    var escapedField = field.split('.').map(function (f) { return '`' + f.replace('`', '\\`') + '`' }).join('.')
    return { 'fieldPath': escapedField }
  }

  const filter = function (field, operator, value) {
    operator = operator.toLowerCase().replace('_', '')

    // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#FieldFilter Field Filter}
    if (operator in fieldOps) {
      if (value == null) { // Covers null and undefined values
        operator = 'null'
      } else if (isNumberNaN_(value)) { // Covers NaN
        operator = 'nan'
      } else {
        return {
          'fieldFilter': {
            'field': fieldRef(field),
            'op': fieldOps[operator],
            'value': wrapValue_(value)
          }
        }
      }
    }

    // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#UnaryFilter Unary Filter}
    if (operator.toLowerCase() in unaryOps) {
      return {
        'unaryFilter': {
          'field': fieldRef(field),
          'op': unaryOps[operator]
        }
      }
    }
    throw new Error('Invalid Operator given ' + operator)
  }

  const query = {}
  if (from) {
    query.from = [{ 'collectionId': from }]
  }

  /**
   * Select Query which can narrow which fields to return.
   * Can be repeated if multiple fields are needed in the response.
   *
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Projection Select}
   * @param {string} field The field to narrow down (if empty, returns name of document)
   * @returns {object} this query object for chaining
   */
  this.select = function (field) {
    if (!query.select) {
      query.select = { 'fields': [] }
    }
    if (!field || !field.trim()) { // Catch undefined or blank strings
      field = '__name__'
    }

    query.select.fields.push(fieldRef(field))
    return this_
  }

  /**
   * Filter Query by a given field and operator (or additionally a value).
   * Can be repeated if multiple filters required.
   * Results must satisfy all filters.
   *
   * @param {string} field The field to reference for filtering
   * @param {string} operator The operator to filter by. {@link fieldOps} {@link unaryOps}
   * @param {*} [value] Object to set the field value to. Null if using a unary operator.
   * @returns {object} this query object for chaining
   */
  this.where = function (field, operator, value) {
    if (query.where) {
      if (!query.where.compositeFilter) {
        query.where = {
          'compositeFilter': {
            'op': 'AND', // Currently "OR" is unsupported
            'filters': [
              query.where
            ]
          }
        }
      }
      query.where.compositeFilter.filters.push(filter(field, operator, value))
    } else {
      query.where = filter(field, operator, value)
    }
    return this_
  }

  /**
   * Orders the Query results based on a field and specific direction.
   * Can be repeated if additional ordering is needed.
   *
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Projection Select}
   * @param {string} field The field to order by.
   * @param {string} dir The direction to order the field by. Should be one of "asc" or "desc". Defaults to Ascending.
   * @returns {object} this query object for chaining
   */
  this.orderBy = function (field, dir) {
    if (!query.orderBy) {
      query.orderBy = []
    }
    const isDesc = dir && (dir.substr(0, 3).toUpperCase() === 'DEC' || dir.substr(0, 4).toUpperCase() === 'DESC')

    query.orderBy.push({
      'field': fieldRef(field),
      'direction': isDesc ? 'DESCENDING' : 'ASCENDING'
    })
    return this_
  }

  /**
   * Offsets the Query results by a given number of documents.
   *
   * @param {number} offset Number of results to skip
   * @returns {object} this query object for chaining
   */
  this.offset = function (offset) {
    if (!isNumeric_(offset)) {
      throw new TypeError('Offset is not a valid number!')
    } else if (offset < 0) {
      throw new RangeError('Offset must be >= 0!')
    }
    query.offset = offset
    return this_
  }

  /**
   * Limits the amount Query results returned.
   *
   * @param {number} limit Number of results limit
   * @returns {object} this query object for chaining
   */
  this.limit = function (limit) {
    if (!isNumeric_(limit)) {
      throw new TypeError('Limit is not a valid number!')
    } else if (limit < 0) {
      throw new RangeError('Limit must be >= 0!')
    }
    query.limit = limit
    return this_
  }

  /**
   * Sets the range of Query results returned.
   *
   * @param {number} start Start result number (inclusive)
   * @param {number} end End result number (inclusive)
   * @returns {object} this query object for chaining
   */
  this.range = function (start, end) {
    if (!isNumeric_(start)) {
      throw new TypeError('Range start is not a valid number!')
    } else if (!isNumeric_(end)) {
      throw new TypeError('Range end is not a valid number!')
    } else if (start < 0) {
      throw new RangeError('Range start must be >= 0!')
    } else if (end < 0) {
      throw new RangeError('Range end must be >= 0!')
    } else if (start >= end) {
      throw new RangeError('Range start must be less than range end!')
    }

    query.offset = start
    query.limit = end - start
    return this_
  }

  /**
   * Executes the query with the given callback method and the generated query.
   * Must be used at the end of any query for execution.
   *
   * @returns {object} The query results from the execution
   */
  this.execute = function () {
    return callback(query) // Not using callback.bind due to debugging limitations of GAS
  }
}

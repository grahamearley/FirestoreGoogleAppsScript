/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals isNumeric_, wrapValue_ */

/**
 * This callback type is called `queryCallback`.
 *  Callback should utilize the Query parameter to send a request and return the response.
 *
 * @callback queryCallback
 * @param {object} query the Structured Query to utilize in the query request {@link FirestoreQuery_}
 * @returns [object] response of the sent query
 */

/**
 * An object that acts as a Query to be a structured query.
 *
 * @class
 * @private
 * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery Firestore Structured Query}
 * @param {string[]} from the base collection to query
 * @param {queryCallback} callback the function that is executed with the internally compiled query
 */
var FirestoreQuery_ = function (from, callback) {
  const this_ = this

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Operator_1 FieldFilter Operator}
  const fieldOps = {
    '==': 'EQUAL',
    '===': 'EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL'
  }

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Operator_2 FieldFilter Operator}
  const unaryOps = {
    'nan': 'IS_NAN',
    'null': 'IS_NULL'
  }

  // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#FieldReference Field Reference}
  const fieldRef = function (field) {
    return {fieldPath: field}
  }
  const filter = function (field, operator, value) {
    // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#FieldFilter Field Filter}
    if (operator in fieldOps) {
      return {
        fieldFilter: {
          field: fieldRef(field),
          op: fieldOps[operator],
          value: wrapValue_(value)
        }
      }
    }

    // @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#UnaryFilter Unary Filter}
    if (operator.toLowerCase() in unaryOps) {
      return {
        unaryFilter: {
          field: fieldRef(field),
          op: unaryOps[operator]
        }
      }
    }
    throw new Error('Invalid Operator given ' + operator)
  }

  const query = {
    from: from.map(function (collection) {
      return {
        collectionId: collection
      }
    })
  }

  /**
   * Select Query which can narrow which fields to return.
   *  Can be repeated if multiple fields are needed in the response.
   *
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Projection Select}
   * @param {string} field The field to narrow down (if empty, returns name of document)
   * @returns {object} this query object for chaining
   */
  this.select = function (field) {
    if (!query.select) {
      query.select = {fields: []}
    }
    if (!field || !field.trim()) { // Catch undefined or blank strings
      field = '__name__'
    }

    query.select.fields.push(fieldRef(field))
    return this_
  }

  /**
   * Filter Query by a given field and operator (or additionally a value).
   *  Can be repeated if multiple filters required.
   *  Results must satisfy all filters.
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
          compositeFilter: {
            op: 'AND', // Currently "OR" is unsupported
            filters: [
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
   *  Can be repeated if additional ordering is needed.
   *
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery#Projection Select}
   * @param {string} field The field to order by.
   * @param {string} dir The direction to order the field by. Should be one of "asc" or "desc". Defaults to Ascending.
   * @returns {object} this query object for chaining
   */
  this.orderBy = function (field, dir) {
    if (!query.orderBy) {
      query.orderBy = []
    }
    dir = (dir && (dir.substr(0, 3).toUpperCase() === 'DEC' || dir.substr(0, 4).toUpperCase() === 'DESC')) ? 'DESCENDING' : 'ASCENDING'

    query.orderBy.push({
      field: fieldRef(field),
      direction: dir
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
    }
    query.limit = limit
    return this_
  }

  /**
   * Executes the query with the given callback method and the generated query.
   *  Must be used at the end of any query for execution.
   *
   * @returns {object} The query results from the execution
   */
  this.execute = function () {
    return callback(query) // Not using callback.bind due to debugging limitations of GAS
  }
}

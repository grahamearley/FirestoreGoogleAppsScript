/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* globals FirestoreQuery_, addAll_, getFieldsFromFirestoreDocument_, getIdFromPath_, fetchObject_ */

/**
 * Get the Firestore document or collection at a given path.
 *  If the collection contains enough IDs to return a paginated result,
 *  this method only returns the first page.
 *
 * @private
 * @param {string} path the path to the document or collection to get
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} the JSON response from the GET request
 */
function get_ (path, authToken, projectId) {
  return getPage_(path, projectId, authToken)
}

/**
 * Get a page of results from the given path. If null pageToken
 *  is supplied, returns first page.
 *
 * @private
 * @param {string} path the path to the document or collection to get
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @param {string} pageToken if defined, is utilized for retrieving subsequent pages
 * @return {object} the JSON response from the GET request
 */
function getPage_ (path, projectId, authToken, pageToken) {
  var baseUrl = 'https://firestore.googleapis.com/v1beta1/projects/' + projectId + '/databases/(default)/documents/' + path
  const options = {
    'muteHttpExceptions': true,
    'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + authToken}
  }

  if (pageToken) {
    baseUrl += '?pageToken=' + pageToken
    options['pageToken'] = pageToken
  }

  return fetchObject_(baseUrl, options)
}

/**
 * Get a list of the JSON responses received for getting documents from a collection.
 *
 *  The items returned by this function are formatted as Firestore documents (with
 *  types). This is a helper method, not meant to return documents to a user of the
 *  library.
 *
 * @private
 * @param {string} pathToCollection the path to the collection
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} an array of Firestore document objects
 */
function getDocumentResponsesFromCollection_ (pathToCollection, authToken, projectId) {
  const initialResponse = get_(pathToCollection, authToken, projectId)
  const documentResponses = initialResponse['documents']
  if (!documentResponses) {
    return []
  }

  // Get all pages of results if there are multiple
  var pageResponse = initialResponse
  var pageToken = pageResponse['nextPageToken']
  while (pageToken) {
    pageResponse = getPage_(pathToCollection, projectId, authToken, pageToken)
    pageToken = pageResponse['nextPageToken']

    if (pageResponse['documents']) {
      addAll_(documentResponses, pageResponse['documents'])
    }
  }
  return documentResponses
}

/**
 * Get a list of all IDs of the documents in a collection.
 *
 * @private
 * @param {string} pathToCollection the path to the collection
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} an array of IDs of the documents in the collection
 */
function getDocumentIds_ (pathToCollection, authToken, projectId) {
  const documentResponses = getDocumentResponsesFromCollection_(pathToCollection, authToken, projectId)
  const ids = []

  // Create ID list from documents
  for (var i = 0; i < documentResponses.length; i++) {
    var document = documentResponses[i]
    var path = document['name']
    var id = getIdFromPath_(path)
    ids.push(id)
  }

  return ids
}

/**
 * Get a list of all documents in a collection.
 *
 * @private
 * @param {string} pathToCollection the path to the collection
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} an array of the documents in the collection
 */
function getDocuments_ (pathToCollection, authToken, projectId) {
  const documentResponses = getDocumentResponsesFromCollection_(pathToCollection, authToken, projectId)
  const documents = []

  for (var i = 0; i < documentResponses.length; i++) {
    var documentResponse = documentResponses[i]
    var document = unwrapDocumentFields_(documentResponse)
    documents.push(document)
  }

  return documents
}

/**
 * Get a document.
 *
 * @private
 * @param {string} path the path to the document
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} an object mapping the document's fields to their values
 */
function getDocument_ (path, authToken, projectId) {
  const doc = get_(path, authToken, projectId)
  if (!doc['fields']) {
    throw new Error('No document with `fields` found at path ' + path)
  }

  doc.fields = getFieldsFromFirestoreDocument_(doc)
  return doc
}
/**
 * Set up a Query to receive data from a collection
 *
 * @private
 * @param {string} from the path to the document or collection to get
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} A FirebaseQuery object to set up the query and eventually execute
 */
function query_ (from, authToken, projectId) {
  var baseUrl = 'https://firestore.googleapis.com/v1beta1/projects/' + projectId + '/databases/(default)/documents:runQuery'
  const options = {
    'method': 'post',
    'muteHttpExceptions': true,
    'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + authToken}
  }

  const callback = function (query) {
    options.payload = JSON.stringify({
      structuredQuery: query
    })
    const responseObj = fetchObject_(baseUrl, options)

    const documents = responseObj.reduce(function (docs, fireDoc) {
      if (fireDoc.document) {
        var doc = getFieldsFromFirestoreDocument_(fireDoc.document)
        if (doc) {
          docs.push(doc)
        }
      }
      return docs
    }, [])

    return documents
  }
  return new FirestoreQuery_(from, callback)
}

/**
 * Unwrap the given document response's fields.
 *
 * @private
 * @param docResponse the document response
 * @return the document response, with unwrapped fields
 */
function unwrapDocumentFields_ (docResponse) {
  docResponse.fields = getFieldsFromFirestoreDocument_(docResponse)
  return docResponse
}

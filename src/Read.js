/**
 * Get the Firestore document or collection at a given path. If the collection
 *  contains enough IDs to return a paginated result, this method only
 *  returns the first page.
 *
 * @param {string} path the path to the document or collection to get
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} the JSON response from the GET request
 */
function get_(path, authToken, projectId) {
    return getPage_(path, projectId, authToken, null);
}

/**
 * Get a page of results from the given path. If null pageToken
 *  is supplied, returns first page.
 */
function getPage_(path, projectId, authToken, pageToken) {
    var baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path;
    const options = {
        'muteHttpExceptions': true,
        'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + authToken}
    };

    if (pageToken) {
        baseUrl += "?pageToken=" + pageToken;
        options['pageToken'] = pageToken;
    }

    var responseObj = getObjectFromResponse_(UrlFetchApp.fetch(baseUrl, options));
    checkForError_(responseObj);

    return responseObj;
}

/**
 * Get fields from a document.
 *
 * @param {string} path the path to the document
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} an object mapping the document's fields to their values
 */
function getDocumentFields_(path, authToken, projectId) {
    const doc = get_(path, authToken, projectId);

    if (!doc["fields"]) {
        throw new Error("No document with `fields` found at path " + path);
    }

    return getFieldsFromFirestoreDocument_(doc);
}

/**
 * Get a list of all IDs of the documents in a collection.
 *
 * @param {string} pathToCollection the path to the collection
 * @param {string} authToken an authentication token for reading from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} an array of IDs of the documents in the collection
 */
function getDocumentIds_(pathToCollection, authToken, projectId) {
    const initialResponse = get_(pathToCollection, authToken, projectId);
    checkForError_(initialResponse);

    if (!initialResponse["documents"]) {
        return [];
    }

    const documents = initialResponse["documents"];

    // Get all pages of results if there are multiple
    var pageResponse = initialResponse;
    var pageToken = pageResponse["nextPageToken"];
    while (pageToken) {
        pageResponse = getPage_(pathToCollection, authToken, projectId, pageToken);
        pageToken = pageResponse["nextPageToken"];

        if (pageResponse["documents"]) {
            addAll_(documents, pageResponse["documents"]);
        }
    }

    const ids = [];

    // Create ID list from documents
    for (var i = 0; i < documents.length; i++) {
        var document = documents[i];
        var path = document["name"];
        var id = getIdFromPath_(path);
        ids.push(id)
    }

    return ids;
}
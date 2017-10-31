/**
 * Get the Firestore document or collection at a given path.
 *
 * @param {string} path the path to the document or collection to get
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} the JSON response from the GET request
 */
function get(path, email, key, projectId) {
    const token = getAuthToken_(email, key);

    const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path;
    const options = {
        'muteHttpExceptions': true,
        'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
    };

    var responseObj = getObjectFromResponse_(UrlFetchApp.fetch(baseUrl, options));
    checkForError_(responseObj);

    return responseObj;
}

/**
 * Get fields from a document.
 *
 * @param {string} path the path to the document
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} an object mapping the document's fields to their values
 */
function getDocumentFields(path, email, key, projectId) {
    const doc = get(path, email, key, projectId);

    if (!doc["fields"]) {
        throw new Error("No document with `fields` found at path " + path);
    }

    return getFieldsFromFirestoreDocument(doc);
}

/**
 * Get a list of IDs of the documents in a collection.
 *
 * @param {string} pathToCollection the path to the collection
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} an array of IDs of the documents in the collection
 */
function getDocumentIds(pathToCollection, email, key, projectId) {
    const response = get(pathToCollection, email, key, projectId);
    checkForError_(response);

    if (!response["documents"]) {
        return [];
    }

    const documents = response["documents"];
    const ids = [];

    for (var i = 0; i < documents.length; i++) {
        var document = documents[i];
        var path = document["name"];
        var id = getIdFromPath_(path);
        ids.push(id)
    }

    return ids;
}
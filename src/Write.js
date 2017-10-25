/**
 * Create a document with the given ID and fields.
 *
 * @param {string} path the path where the document will be written
 * @param {string} documentId the document's ID in Firestore
 * @param {object} fields the document's fields
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} the Document object written to Firestore
 */
function createDocumentWithId(path, documentId, fields, email, key, projectId) {
    const token = getAuthToken_(email, key);

    const firestoreObject = createFirestoreDocument(fields);

    const pathWithNoTrailingSlash = removeTrailingSlash_(path);
    var baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + pathWithNoTrailingSlash;
    if (documentId) {
        baseUrl += "?documentId=" + documentId;
    }

    const options = {
        'method': 'post',
        'muteHttpExceptions': true,
        'payload': JSON.stringify(firestoreObject),
        'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
    };

    const response = UrlFetchApp.fetch(baseUrl, options);
    const responseObj = getObjectFromResponse_(response);

    checkForError_(responseObj);

    return responseObj;
}

/**
 * Create a document with the given fields and an auto-generated ID.
 *
 * @param {string} path the path where the document will be written
 * @param {object} fields the document's fields
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} the Document object written to Firestore
 */
function createDocument(path, fields, email, key, projectId) {
    return createDocumentWithId(path, null, fields, email, key, projectId);
}

/**
 * Update/patch a document at the given path with new fields.
 *
 * @param {string} path the path of the document to update
 * @param {object} fields the document's new fields
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} the Document object written to Firestore
 */
function updateDocument(path, fields, email, key, projectId) {
    const token = getAuthToken_(email, key);

    const firestoreObject = createFirestoreDocument(fields);

    const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path;
    const options = {
        'method': 'patch',
        'muteHttpExceptions': true,
        'payload': JSON.stringify(firestoreObject),
        'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
    };

    const response = UrlFetchApp.fetch(baseUrl, options);
    const responseObj = getObjectFromResponse_(response);
    checkForError_(responseObj);

    return responseObj;
}
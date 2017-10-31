/**
 * Delete the Firestore document at the given path.
 * Note: this deletes ONLY this document, and not any subcollections.
 *
 * @param {string} pathToDocument the path to the document to delete
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} the JSON response from the DELETE request
 */
function deleteDocument(pathToDocument, email, key, projectId) {
    const token = getAuthToken_(email, key);

    const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + pathToDocument;
    const options = {
        'method': 'delete',
        'muteHttpExceptions': true,
        'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
    };

    var responseObj = getObjectFromResponse_(UrlFetchApp.fetch(baseUrl, options));
    checkForError_(responseObj);

    return responseObj;
}
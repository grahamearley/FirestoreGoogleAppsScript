/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "_" }] */
/* global fetchObject_ */

/**
 * Delete the Firestore document at the given path.
 * Note: this deletes ONLY this document, and not any subcollections.
 *
 * @param {string} pathToDocument the path to the document to delete
 * @param {string} authToken an authentication token for deleting from Firestore
 * @param {string} projectId the Firestore project ID
 * @return {object} the JSON response from the DELETE request
 */
function deleteDocument_ (pathToDocument, authToken, projectId) {
  const baseUrl = 'https://firestore.googleapis.com/v1beta1/projects/' + projectId + '/databases/(default)/documents/' + pathToDocument
  const options = {
    'method': 'delete',
    'muteHttpExceptions': true,
    'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + authToken}
  }

  return fetchObject_(baseUrl, options)
}

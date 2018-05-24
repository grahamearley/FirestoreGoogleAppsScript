/**
 * Run a query against the Firestore Database and
 *  return an all the documents that match the query.
 *
 * @param {string} query a StructuredQuery object: firebase.google.com/docs/firestore/reference/rest/v1beta1/StructuredQuery
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @return {object} the JSON response from the GET request
 */
function query(query, email, key, projectId) {
    return query_(query, email, key, projectId);
  }
  
  /**
   * Return an all the documents that belong to a collection.
   *
   * @param {string} path the path to the collection
   * @param {string} email the user email address (for authentication)
   * @param {string} key the user private key (for authentication)
   * @param {string} projectId the Firestore project ID
   * @return {object} the JSON response from the GET request
   */
  function getAllDocuments(path, email, key, projectId) {
    var query = {
      from: [{collectionId: path}]
    };
    return query_(query, email, key, projectId);
  }
  
  function query_(query, email, key, projectId) {
    const token = getAuthToken_(email, key);
    
    var baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents:runQuery";
      const options = {
          'muteHttpExceptions': true,
          'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
      };
    
    if (query) {
      options.method= 'post';
      options.payload = JSON.stringify({
        structuredQuery: query
      });
    }
    
    var responseObj = getObjectFromResponse_(UrlFetchApp.fetch(baseUrl, options));
    checkForError_(responseObj);
    
    return responseObj;
  }
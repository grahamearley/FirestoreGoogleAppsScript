function createDocumentWithId(path, documentId, documentData, email, key, projectId) {
  const token = getAuthToken_(email, key);
  
  const firestoreObject = createFirestoreObject(documentData);
  
  const pathWithNoTrailingSlash = removeTrailingSlash_(path)
  var baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + pathWithNoTrailingSlash;
  if (documentId) {
    baseUrl += "?documentId=" + documentId;
  }

  const options = {
   'method' : 'post',
   'muteHttpExceptions' : true,
   'payload': JSON.stringify(firestoreObject),
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };

  const response = UrlFetchApp.fetch(baseUrl, options);
  const responseObj = getObjectFromResponse(response);

  if (responseObj["error"]) {
    throw new Error(responseObj["error"]["message"]);
  }
  
  return responseObj;
}

function createDocument(path, documentData, email, key, projectId) {
  return createDocumentWithId(path, null, documentData, email, key, projectId);
}

function updateDocument(path, documentData, email, key, projectId) {  
  const token = getAuthToken_(email, key);
  
  const firestoreObject = createFirestoreObject(documentData);
  
  const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path;
  const options = {
   'method' : 'patch',
   'muteHttpExceptions' : true,
   'payload': JSON.stringify(firestoreObject),
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };
  
  return UrlFetchApp.fetch(baseUrl, options);
}
function createDocument(path, documentId, documentData, email, key, projectId) {
  const token = getAuthToken_(email, key);
  
  const firestoreObject = createFirestoreObject(documentData);
  
  const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path + "?documentId=" + documentId;
  const options = {
   'method' : 'post',
   'muteHttpExceptions' : true,
   'payload': JSON.stringify(firestoreObject),
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };
  
  return UrlFetchApp.fetch(baseUrl, options);
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
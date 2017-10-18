function createDocument(path, documentName, data, email, key) {
  const token = getAuthToken_(email, key);
  
  const firestoreObject = createFirestoreObject(data)
  
  const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/happy-teacher-2/databases/(default)/documents/" + path + "?documentId=" + documentName;
  var options = {
   'method' : 'post',
   'muteHttpExceptions' : true,
   'payload': JSON.stringify(firestoreObject),
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };
  
  return UrlFetchApp.fetch(baseUrl, options)  
}

function updateDocument(path, data, email, key) {  
  const token = getAuthToken_(email, key);
  
  const firestoreObject = createFirestoreObject(data)
  
  const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/happy-teacher-2/databases/(default)/documents/" + path
  var options = {
   'method' : 'patch',
   'muteHttpExceptions' : true,
   'payload': JSON.stringify(firestoreObject),
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };
  
  return UrlFetchApp.fetch(baseUrl, options)  
}
function get(path, email, key, projectId) {  
  const token = getAuthToken_(email, key);
    
  const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path;
  const options = {
   'muteHttpExceptions' : true,
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };

  var responseObj = getObjectFromResponse(UrlFetchApp.fetch(baseUrl, options));
  checkForError(responseObj);
  
  return responseObj;
}

function getDocumentFields(path, email, key, projectId) {
  const doc = get(path, email, key, projectId)

  if (!doc["fields"]) {
    throw new Error("No document with `fields` found at path " + path);
  }

  return getObjectFromFirestoreObject(doc);
}
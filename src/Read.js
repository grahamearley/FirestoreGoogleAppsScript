function get(path, email, key, projectId) {  
  const token = getAuthToken_(email, key);
    
  const baseUrl = "https://firestore.googleapis.com/v1beta1/projects/" + projectId + "/databases/(default)/documents/" + path;
  const options = {
   'muteHttpExceptions' : true,
   'headers': {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}
  };
  
  return getObjectFromResponse(UrlFetchApp.fetch(baseUrl, options));
}
# Firestore for Google Apps Script
### A Google Apps Script library for accessing Google Cloud Firestore.

This library allows a user (or service account) to authenticate with Firestore and edit their Firestore database within a Google Apps Script.

## Quickstart with a service account
Follow [these instructions](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount) (just the "Creating a service account" section) to obtain a service account email address and private key. Ensure you have given the account full read/write access to the `https://www.googleapis.com/auth/datastore` scope.

Now, with your service account email address `email` and private key `privateKey`, we will create a document with a field `name` with value `test!`.

We encode these fields as a JSON object:
```javascript
const data = {
  "name": "test!"
}
```

Now, we can create a document called `FirstDocument` at the root collection (the first parameter `""` indicates an empty path):
```javascript
FirestoreApp.createDocument("", "FirstDocument", data, email, key)
```

To update the document at this location, we can use the `updateDocument` function (the first parameter "FirstDocument" indicates that we are writing at the path for the newly created document):
```javascript
FirestoreApp.updateDocument("FirstDocument", data, email, key)
```
**Note:** Although you can call `updateDocument` without using `createDocument` to create the document, any documents in your path will not be created and thus you can only access the document by using the path explicitly.

## Contributions

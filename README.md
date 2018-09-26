# Firestore for Google Apps Scripts
### A Google Apps Script library for accessing Google Cloud Firestore.

This library allows a user (or service account) to authenticate with Firestore and edit their Firestore database within a Google Apps Script.

Read how this project was started [here](http://grahamearley.website/blog/2017/10/18/firestore-in-google-apps-script.html).

## Installation
In the Google online script editor, select the `Resources` menu item and choose `Libraries...`. In the "Add a library" input box, enter `1VUSl4b1r1eoNcRWotZM3e87ygkxvXltOgyDZhixqncz9lQ3MjfT1iKFw` and click "Add." Choose the most recent version number.


## Quick start
#### Creating a service account
The easiest way to use this library is to create a Google Service Account for your application and give it read/write access to your datastore. Giving a service account access to your datastore is like giving access to a user's account, but this account is strictly used by your script, not by a person.

If you don't already have a Firestore project you want to use, create one at the [Firebase admin console](https://console.firebase.google.com).

To make a service account,
1. Open the [Google Service Accounts page by clicking here](https://console.developers.google.com/projectselector/iam-admin/serviceaccounts). 
2. Select your Firestore project, and then click "Create Service Account." 
3. For your service account's role, choose `Datastore > Cloud Datastore Owner`. 
4. Check the "Furnish a new private key" box and select JSON as your key type. 
5. When you press "Create," your browser will download a `.json` file with your private key (`private_key`), service account email (`client_email`), and project ID (`project_id`). Copy these values into your Google Apps Script — you'll need them to authenticate with Firestore.

#### Create a test document in Firestore from your script
Now, with your service account client email address `email`, private key `key`, and project ID `projectId`, we will authenticate with Firestore to get our `Firestore` object. To do this, get the `Firestore` object from the library:

```javascript
var firestore = FirestoreApp.getFirestore(email, key, projectId);
```

Using this Firestore instance, we will create a Firestore document with a field `name` with value `test!`. Let's encode this as a JSON object:

```javascript
const data = {
  "name": "test!"
}
```

We can choose to create a document in collection called `FirstCollection` without an ID:

```javascript
firestore.createDocument("FirstCollection", data)
```

Alternatively, we can create the document in the `FirstCollection` collection called `FirstDocument`:
```javascript
firestore.createDocument("FirstCollection/FirstDocument", data)
```

To update the document at this location, we can use the `updateDocument` function:
```javascript
firestore.updateDocument("FirstCollection/FirstDocument", data)
```

**Note:** Although you can call `updateDocument` without using `createDocument` to create the document, any documents in your path will not be created and thus you can only access the document by using the path explicitly.

You can retrieve your data by calling the `getDocument` function:

```javascript
const dataWithMetadata = firestore.getDocument("FirstCollection/FirstDocument")
```

You can also retrieve all documents within a collection by using the `getDocuments` function:

```javascript
const allDocuments = firestore.getDocuments("FirstCollection")
```

If more specific queries need to be performed, you can use the `query` function followed by an `execute` invocation to get that data:

```javascript
const allDocumentsWithTest = firestore.query("FirstCollection").where("name", "==", "Test!").execute()
```

See other library methods and details [in the wiki](https://github.com/grahamearley/FirestoreGoogleAppsScript/wiki/Firestore-Method-Documentation).

### Breaking Changes
* v16: **Removed:** `createDocumentWithId(documentId, path, fields)`
  > Utilize `createDocument(path + '/' + documentId, fields)` instead to create a document with a specific ID. 

## Contributions
Contributions are welcome — send a pull request! This library is a work in progress. See [here](https://github.com/grahamearley/FirestoreGoogleAppsScript/blob/master/CONTRIBUTING.md) for more information on contributing.

After cloning this repository, you can push it to your own private copy of this Google Apps Script project to test it yourself. See [here](https://github.com/google/clasp) for directions on using `clasp` to develop App Scripts locally.

If you want to view the source code directly on Google Apps Script, where you can make a copy for yourself to edit, click [here](https://script.google.com/d/1VUSl4b1r1eoNcRWotZM3e87ygkxvXltOgyDZhixqncz9lQ3MjfT1iKFw/edit?usp=sharing). 

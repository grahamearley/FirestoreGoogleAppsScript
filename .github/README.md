# Firestore for Google Apps Scripts

![GitHub release (latest by date)](https://img.shields.io/github/v/release/grahamearley/FirestoreGoogleAppsScript)
[![Google Apps Script](https://img.shields.io/badge/google%20apps%20script-v8-%234285f4)](https://developers.google.com/apps-script/guides/v8-runtime)
[![TypeScript](https://img.shields.io/badge/typescript-3.9.5-%23294E80)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html)
[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](/google/clasp)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](/prettier/prettier)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/grahamearley/FirestoreGoogleAppsScript)](/grahamearley/FirestoreGoogleAppsScript/pulls)
[![GitHub issues](https://img.shields.io/github/issues/grahamearley/FirestoreGoogleAppsScript)](/grahamearley/FirestoreGoogleAppsScript/issues)
[![Tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2FAKfycbzle3ze4mtGAcTNPlqISSFxtmPqvdcNOFauiC4Q0g%2Fexec)](https://img.shields.io/endpoint?url=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2FAKfycbzle3ze4mtGAcTNPlqISSFxtmPqvdcNOFauiC4Q0g%2Fexec?nocache)

### A Google Apps Script library for accessing Google Cloud Firestore.


This library allows a user (or service account) to authenticate with Firestore and edit their Firestore database within a Google Apps Script.

Read how this project was started [here](http://grahamearley.website/blog/2017/10/18/firestore-in-google-apps-script.html).

As of **v27**, this project has been updated to use the [GAS V8 runtime](https://developers.google.com/apps-script/guides/v8-runtime) with [Typescript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html)! This introduces a number of [breaking changes](#breaking-changes).

## Installation
In the Google online script editor, select the `Resources` menu item and choose `Libraries...`. In the "Add a library" input box, enter **`1VUSl4b1r1eoNcRWotZM3e87ygkxvXltOgyDZhixqncz9lQ3MjfT1iKFw`** and click "Add." Choose the most recent version number.


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
6. **[Bonus]** It is considered best practice to make use of the [Properties Service](https://developers.google.com/apps-script/guides/properties) to store this sensitive information.

#### Configurating Firestore instance from your script
Now, with your service account client email address `email`, private key `key`, project ID `projectId`, we will authenticate with Firestore to get our `Firestore` object. To do this, get the `Firestore` object from the library:

```javascript
const firestore = FirestoreApp.getFirestore(email, key, projectId);
```

##### Configuration Template
Here's a quick template to get you started (by replacing `email` and `key` with your values):
```javascript
const email = 'projectname-12345@appspot.gserviceaccount.com';
const key = '-----BEGIN PRIVATE KEY-----\nPrivateKeyLine1\nPrivateKeyLine2\nPrivateKeyLineN\n-----END PRIVATE KEY-----';
const projectId = 'projectname-12345'
const firestore = FirestoreApp.getFirestore(email, key, projectId);
```

Alternatively, using [Properties Service](https://developers.google.com/apps-script/guides/properties) <ins>once data is already stored</ins> in the service with **"client_email"**, **"private_key"**, and **"project_id"** property names:
```javascript
const props = PropertiesService.getUserProperties(); // Or .getScriptProperties() if stored in Script Properties
const [email, key, projectId] = [props.getProperty('client_email'), props.getProperty('private_key'), props.getProperty('project_id')];
const firestore = FirestoreApp.getFirestore(email, key, projectId);
```


##### Creating Documents
Using this Firestore instance, we will create a Firestore document with a field `name` with value `test!`. Let's encode this as a JSON object:

```javascript
const data = {
  "name": "test!"
}
```

We can choose to create a document in collection called **"FirstCollection"** without a name (Firestore will generate one):

```javascript
firestore.createDocument("FirstCollection", data);
```

Alternatively, we can create the document in the **"FirstCollection"** collection called **"FirstDocument"**:
```javascript
firestore.createDocument("FirstCollection/FirstDocument", data);
```

##### Updating Documents
To update (overwrite) the document at this location, we can use the `updateDocument` function:
```javascript
firestore.updateDocument("FirstCollection/FirstDocument", data);
```

To update only specific fields of a document at this location, we can set the `mask` parameter to `true`:
```javascript
firestore.updateDocument("FirstCollection/FirstDocument", data, true);
```


##### Getting Documents
You can retrieve documents by calling the `getDocument` function:

```javascript
const documentWithMetadata = firestore.getDocument("FirstCollection/FirstDocument");
const storedObject = documentWithMetadata.obj;
```

You can also retrieve all documents within a collection by using the `getDocuments` function:

```javascript
const allDocuments = firestore.getDocuments("FirstCollection");
```

You can also get specific documents by providing an array of document names

```javascript
const someDocuments = firestore.getDocuments("FirstCollection", ["Doc1", "Doc2", "Doc3"]);
```

##### Getting Documents (Advanced method using Query)
If more specific queries need to be performed, you can use the `query` function followed by an `.Execute()` invocation to get that data:
    
```javascript
const allDocumentsWithTest = firestore.query("FirstCollection").Where("name", "==", "Test!").Execute();
```

The `Where` function can take other operators too: `==`, `<`, `<=`, `>`, `>=`, `contains`, `contains_any`, `in`.

Queries looking for `null` values can also be given:
```javascript
const allDocumentsNullNames = firestore.query("FirstCollection").Where("name", null).Execute();
```

Query results can be ordered:
```javascript
const allDocumentsNameAsc = firestore.query("FirstCollection").OrderBy("name").Execute();
const allDocumentsNameDesc = firestore.query("FirstCollection").OrderBy("name", "desc").Execute();
```

To limit, offset, or just select a range of results:
```javascript
const documents2_3_4_5 = firestore.query("FirstCollection").Limit(4).Offset(2).Execute();
const documents3_4_5_6 = firestore.query("FirstCollection").Range(3, 7).Execute();
```

See other library methods and details [in the wiki](/grahamearley/FirestoreGoogleAppsScript/wiki/).

### Breaking Changes
* **v27:** Library rewritten with Typescript and Prettier.
  * Query function names have been capitalized (`Select`, `Where`, `OrderBy`, `Limit`, `Offset`, `Range`).
  *  **All functions return `Document` or `Document[]` types directly from Firebase. Use `document.obj` to extract the raw object.**
  *  Undo breaking change from v23. `document.createTime` and `document.updateTime` will remain as timestamped strings. However `document.created`, `document.updated`, and `document.read` are Date objects.
* **v23:** When retrieving documents the createTime and updateTime document properties are JS Date objects and not Timestamp Strings.
* **v16:** **Removed:** `createDocumentWithId(documentId, path, fields)`
  > Utilize `createDocument(path + '/' + documentId, fields)` instead to create a document with a specific ID. 

## Contributions
Contributions are welcome — send a pull request! See [here](/grahamearley/FirestoreGoogleAppsScript/blob/main/.github/CONTRIBUTING.md) for more information on contributing.

After cloning this repository, you can push it to your own private copy of this Google Apps Script project to test it yourself. See [here](/google/clasp) for directions on using `clasp` to develop App Scripts locally.
Install all packages from `package.json` with a bare `npm install`.
 

If you want to view the source code directly on Google Apps Script, where you can make a copy for yourself to edit, click [here](https://script.google.com/d/1VUSl4b1r1eoNcRWotZM3e87ygkxvXltOgyDZhixqncz9lQ3MjfT1iKFw/edit). 

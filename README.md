# Firestore for Google Apps Scripts
### A Google Apps Script library for accessing Google Cloud Firestore.

This library allows a user (or service account) to authenticate with Firestore and edit their Firestore database within a Google Apps Script.

Read how this project was started [here](http://grahamearley.website/blog/2017/10/18/firestore-in-google-apps-script.html).

## Installation
In the Google online script editor, select the `Resources` menu item and choose `Libraries...`. In the "Add a library" input box, enter `MX2_NUfxVpaA1XPcZ_N-3wWb_Hp7BVbw3` and click "Add." Choose the most recent version number.


## Quick start
#### Creating a service account
The easiest way to use this library is to create a Google Service Account for your application and give it read/write access to your datastore. Giving a service account access to your datastore is like giving access to a user's account, but this account is strictly used by your script, not by a person.

In the [Firebase admin console](https://console.firebase.google.com) create a new Firestore project with the default security settings. Open the project and in the settings menu (cog) of the  project overview menu go to the "User and permissions", from here a service account can be generated if one doesn't already exist. 

Follow [these instructions](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount) (just the "Creating a service account" section) to obtain a service account email address and private key. Ensure you have given the account full read/write access to the Datastore scope. You can do this in the "Create a service account" window by selecting "Datastore" in the "Role" dropdown and choosing "Cloud Datastore Owner."

After following these instructions, you'll have a JSON file with fields for `private_key` ,  `client_email` and `project_id`. Copy these into your Google Apps Script! You'll also need to get your project ID — you can find this in the JSON file or your Firebase project settings (under Project ID).

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

Now, we can create a document called `FirstDocument` at a collection called `FirstCollection`:
```javascript
firestore.createDocumentWithId("FirstDocument", "FirstCollection", data)
```

To update the document at this location, we can use the `updateDocument` function:
```javascript
firestore.updateDocument("FirstCollection/FirstDocument", data)
```

**Note:** Although you can call `updateDocument` without using `createDocument` to create the document, any documents in your path will not be created and thus you can only access the document by using the path explicitly.

See other library methods [in the wiki](https://github.com/grahamearley/FirestoreGoogleAppsScript/wiki/Firestore-Method-Documentation).

## Contributions
Contributions are welcome — send a pull request! This library is a work in progress. See [here](https://github.com/grahamearley/FirestoreGoogleAppsScript/blob/master/CONTRIBUTING.md) for more information on contributing.

After cloning this repository, you can push it to your own private copy of this Google Apps Script project to test it yourself. See [here](https://github.com/google/clasp) for directions on using `clasp` to develop App Scripts locally.

If you want to view the source code directly on Google Apps Script, where you can make a copy for yourself to edit, click [here](https://script.google.com/d/1VUSl4b1r1eoNcRWotZM3e87ygkxvXltOgyDZhixqncz9lQ3MjfT1iKFw/edit?usp=sharing). 

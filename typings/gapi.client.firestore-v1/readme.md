# TypeScript typings for Cloud Firestore API v1

Accesses the NoSQL document database built for automatic scaling, high performance, and ease of application development. 
For detailed description please check [documentation](https://cloud.google.com/firestore).

## Installing

Install typings for Cloud Firestore API:

```
npm install @types/gapi.client.firestore-v1 --save-dev
```

## Usage

You need to initialize Google API client in your code:

```typescript
gapi.load('client', () => {
  // now we can use gapi.client
  // ...
});
```

Then load api client wrapper:

```typescript
gapi.client.load('https://firestore.googleapis.com/$discovery/rest?version=v1', () => {
  // now we can use:
  // gapi.client.firestore
});
```

```typescript
// Deprecated, use discovery document URL, see https://github.com/google/google-api-javascript-client/blob/master/docs/reference.md#----gapiclientloadname----version----callback--
gapi.client.load('firestore', 'v1', () => {
  // now we can use:
  // gapi.client.firestore
});
```

Don't forget to authenticate your client before sending any request to resources:

```typescript
// declare client_id registered in Google Developers Console
var client_id = '',
  scope = [
      // See, edit, configure, and delete your Google Cloud data and see the email address for your Google Account.
      'https://www.googleapis.com/auth/cloud-platform',

      // View and manage your Google Cloud Datastore data
      'https://www.googleapis.com/auth/datastore',
    ],
    immediate = true;
// ...

gapi.auth.authorize(
  { client_id: client_id, scope: scope, immediate: immediate },
  authResult => {
    if (authResult && !authResult.error) {
        /* handle successful authorization */
    } else {
        /* handle authorization error */
    }
});
```

After that you can use Cloud Firestore API resources: <!-- TODO: make this work for multiple namespaces -->

```typescript
```

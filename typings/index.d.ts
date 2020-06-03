// Type definitions for firestore-google-apps-script
// Project: https://github.com/grahamearley/FirestoreGoogleAppsScript
// Definitions by: LaughDonor <https://github.com/LaughDonor>
// TypeScript Version: 3.9
/* eslint @typescript-eslint/triple-slash-reference: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

/// <reference path="Auth.d.ts"/>
/// <reference path="Common.d.ts"/>
/// <reference path="Query.d.ts"/>
/// <reference path="Test.d.ts"/>

import FirestoreAPI = gapi.client.firestore;
type Value = null | boolean | number | string | FirestoreAPI.LatLng | Date | ValueObject | ValueArray;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ValueObject extends Record<string, Value> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ValueArray extends Array<Value> {}

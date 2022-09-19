/* eslint @typescript-eslint/no-unused-vars: ["error", { "varsIgnorePattern": "^getFirestore$" }] */

/**
 * An authenticated interface to a Firestore project.
 */
class Firestore implements FirestoreRead, FirestoreWrite, FirestoreDelete {
  auth: Auth;
  basePath: string;
  baseUrl: string;

  /**
   * Constructor
   *
   * @param {string} email the user email address (for authentication)
   * @param {string} key the user private key (for authentication)
   * @param {string} projectId the Firestore project ID
   * @param {string} apiVersion [Optional] The Firestore API Version ("v1beta1", "v1beta2", or "v1")
   * @return {Firestore} an authenticated interface with a Firestore project (constructor)
   */
  constructor(email: string, key: string, projectId: string, apiVersion: Version = 'v1') {
    // The authentication token used for accessing Firestore
    this.auth = new Auth(email, key);
    this.basePath = `projects/${projectId}/databases/(default)/documents/`;
    this.baseUrl = `https://firestore.googleapis.com/${apiVersion}/${this.basePath}`;
  }

  get authToken(): string {
    return this.auth.accessToken;
  }
  get_ = FirestoreRead.prototype.get_;
  getPage_ = FirestoreRead.prototype.getPage_;
  getDocumentResponsesFromCollection_ = FirestoreRead.prototype.getDocumentResponsesFromCollection_;

  /**
   * Get a document.
   *
   * @param {string} path the path to the document
   * @return {object} the document object
   */
  getDocument(path: string): Document {
    const request = new Request(this.baseUrl, this.authToken);
    return this.getDocument_(path, request);
  }
  getDocument_ = FirestoreRead.prototype.getDocument_;

  /**
   * Get a list of all documents in a collection.
   *
   * @param {string} path the path to the collection
   * @param {array} ids [Optional] String array of document names to filter. Missing documents will not be included.
   * @return {object} an array of the documents in the collection
   */
  getDocuments(path: string, ids?: string[]): Document[] {
    let docs: Document[];
    if (!ids) {
      docs = this.query(path).Execute() as Document[];
    } else {
      const request = new Request(this.baseUrl.replace('/documents/', '/documents:batchGet/'), this.authToken);
      docs = this.getDocuments_(this.basePath + path, request, ids);
    }
    return docs;
  }
  getDocuments_ = FirestoreRead.prototype.getDocuments_;

  /**
   * Get a list of all IDs of the documents in a path
   *
   * @param {string} path the path to the collection
   * @return {object} an array of IDs of the documents in the collection
   */
  getDocumentIds(path: string): string[] {
    const request = new Request(this.baseUrl, this.authToken);
    return this.getDocumentIds_(path, request);
  }
  getDocumentIds_ = FirestoreRead.prototype.getDocumentIds_;

  /**
   * Create a document with the given fields and an auto-generated ID.
   *
   * @param {string} path the path where the document will be written
   * @param {object} fields the document's fields
   * @return {object} the Document object written to Firestore
   */
  createDocument(path: string, fields?: Record<string, any>): Document {
    const request = new Request(this.baseUrl, this.authToken);
    return this.createDocument_(path, fields || {}, request);
  }

  createDocument_ = FirestoreWrite.prototype.createDocument_;

  /**
   * Update/patch a document at the given path with new fields.
   *
   * @param {string} path the path of the document to update. If document name not provided, a random ID will be generated.
   * @param {object} fields the document's new fields
   * @param {boolean|string[]} mask if true, the update will mask the given fields,
   * if is an array (of field names), that array would be used as the mask.
   * (that way you can, for example, include a field in `mask`, but not in `fields`, and by doing so, delete that field)
   * @return {object} the Document object written to Firestore
   */
  updateDocument(path: string, fields: Record<string, any>, mask?: boolean | string[]): Document {
    const request = new Request(this.baseUrl, this.authToken);
    return this.updateDocument_(path, fields, request, mask);
  }

  updateDocument_ = FirestoreWrite.prototype.updateDocument_;

  /**
   * Delete the Firestore document at the given path.
   * Note: this deletes ONLY this document, and not any subcollections.
   *
   * @param {string} path the path to the document to delete
   * @return {object} the JSON response from the DELETE request
   */
  deleteDocument(path: string): FirestoreAPI.Empty {
    const request = new Request(this.baseUrl, this.authToken);
    return this.deleteDocument_(path, request);
  }

  deleteDocument_ = FirestoreDelete.prototype.deleteDocument_;

  /**
   * Run a query against the Firestore Database and return an all the documents that match the query.
   * Must call .Execute() to send the request.
   *
   * @param {string} path to query
   * @return {object} the JSON response from the GET request
   */
  query(path: string): Query {
    const request = new Request(this.baseUrl, this.authToken);
    return this.query_(path, request);
  }
  query_ = FirestoreRead.prototype.query_;
}

type Version = 'v1' | 'v1beta1' | 'v1beta2';

/**
 * Get an object that acts as an authenticated interface with a Firestore project.
 *
 * @param {string} email the user email address (for authentication)
 * @param {string} key the user private key (for authentication)
 * @param {string} projectId the Firestore project ID
 * @param {string} apiVersion [Optional] The Firestore API Version ("v1beta1", "v1beta2", or "v1")
 * @return {Firestore} an authenticated interface with a Firestore project (function)
 */
function getFirestore(email: string, key: string, projectId: string, apiVersion: Version = 'v1'): Firestore {
  return new Firestore(email, key, projectId, apiVersion);
}

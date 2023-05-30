/**
 * Extends Firestore class with private method
 */
class FirestoreWrite {
  /**
   * Create a document with the given ID and fields.
   *
   * @param {string} path the path where the document will be written
   * @param {object} fields the document's fields
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} the Document object written to Firestore
   */
  createDocument_(path: string, fields: Record<string, any>, request: Request): Document {
    const pathDoc = Util_.getDocumentFromPath(path);
    const documentId = pathDoc[1];

    // Use UpdateDocument to create documents that may use special characters
    if (documentId) {
      request.addParam('currentDocument.exists', 'false');
      return this.updateDocument_(path, fields, request);
    }
    const firestoreObject = new Document(fields);
    const newDoc = request.post<FirestoreAPI.Document>(pathDoc[0], firestoreObject);
    return new Document(newDoc, {} as Document);
  }

  /**
   * Update/patch a document at the given path with new fields.
   *
   * @param {string} path the path of the document to update
   * @param {object} fields the document's new fields
   * @param {string} request the Firestore Request object to manipulate
   * @param {boolean|string[]} mask the update will mask the given fields,
   * if is an array (of field names), that array would be used as the mask. i.e. true: updates only specific fields, false: overwrites document with specified fields
   * see jsdoc of the `updateDocument` method in Firestore.ts for more details
   * @param {boolean} nestedField support nested field name
   * @return {object} the Document object written to Firestore
   */
  updateDocument_(path: string, fields: Record<string, any>, request: Request, mask?: boolean | string[], nestedField?: boolean): Document {
    if (mask) {
      const maskData = typeof mask === 'boolean' ? Object.keys(fields) : mask;

      // Object.keys always returns an array, so this is only for when the given mask is not a boolean.
      if (!Array.isArray(maskData)) {
        throw new Error('Mask must be a boolean or an array of strings!');
      }

      // abort request if fields object is empty
      if (!maskData.length) {
        throw new Error('Missing fields in Mask!');
      }

      if (nestedField == true) {
        for (const field of maskData) {
          request.addParam('updateMask.fieldPaths', `${field}`);
        }
      } else {
        for (const field of maskData) {
          if (field.includes('.')) {
            request.addParam('updateMask.fieldPaths', `\`${field.replace(/`/g, '\\`')}\``);
          } else {
            request.addParam('updateMask.fieldPaths', `${field}`);
          }
        }
      }
    }

    const firestoreObject = new Document(fields, undefined, nestedField);
    const updatedDoc = request.patch<FirestoreAPI.Document>(path, firestoreObject);
    return new Document(updatedDoc, {} as Document);
  }
}

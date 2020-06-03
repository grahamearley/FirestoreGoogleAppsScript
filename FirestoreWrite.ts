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
   * @param {boolean} mask if true, the update will use a mask. i.e. true: updates only specific fields, false: overwrites document with specified fields
   * @return {object} the Document object written to Firestore
   */
  updateDocument_(path: string, fields: Record<string, any>, request: Request, mask = false): Document {
    if (mask) {
      // abort request if fields object is empty
      if (!Object.keys(fields).length) {
        throw new Error('Missing fields in Mask!');
      }
      for (const field in fields) {
        request.addParam('updateMask.fieldPaths', `\`${field.replace(/`/g, '\\`')}\``);
      }
    }

    const firestoreObject = new Document(fields);
    const updatedDoc = request.patch<FirestoreAPI.Document>(path, firestoreObject);
    return new Document(updatedDoc, {} as Document);
  }
}

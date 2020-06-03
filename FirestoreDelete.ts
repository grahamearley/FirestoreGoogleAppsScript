/**
 * Extends Firestore class with private method
 */
class FirestoreDelete {
  /**
   * Delete the Firestore document at the given path.
   * Note: this deletes ONLY this document, and not any subcollections.
   *
   * @param {string} path the path to the document to delete
   * @param {Request} request the Firestore Request object to manipulate
   * @return {Request} the JSON response from the DELETE request
   */
  deleteDocument_(path: string, request: Request): FirestoreAPI.Empty {
    const response = request.remove<FirestoreAPI.Empty>(path);
    return response;
  }
}

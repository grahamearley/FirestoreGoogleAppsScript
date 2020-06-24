/**
 * Extends Firestore class with private method
 */
class FirestoreRead {
  /**
   * Get the Firestore document or collection at a given path.
   * If the collection contains enough IDs to return a paginated result, this method only returns the first page.
   *
   * @param {string} path the path to the document or collection to get
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} the JSON response from the GET request
   */
  get_(path: string, request: Request): Request {
    return this.getPage_(path, null, request);
  }

  /**
   * Get a page of results from the given path.
   * If null pageToken is supplied, returns first page.
   *`
   * @param {string} path the path to the document or collection to get
   * @param {string} pageToken if defined, is utilized for retrieving subsequent pages
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} the JSON response from the GET request
   */
  getPage_(path: string, pageToken: string | null, request: Request): Request {
    if (pageToken) {
      request.addParam('pageToken', pageToken);
    }
    return request.get(path);
  }

  /**
   * Get a list of the JSON responses received for getting documents from a collection.
   * The items returned by this function are formatted as Firestore documents (with types).
   *
   * @param {string} path the path to the collection
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} an array of Firestore document objects
   */
  getDocumentResponsesFromCollection_(path: string, request: Request): Record<string, any>[] {
    const documents: Record<string, any>[] = [];
    let pageToken: string | null = null;
    let pageResponse: Request;

    do {
      pageResponse = this.getPage_(path, pageToken, request.clone());
      pageToken = pageResponse.nextPageToken as string | null;
      if (pageResponse.documents) {
        Array.prototype.push.apply(documents, pageResponse.documents);
      }
    } while (pageToken); // Get all pages of results if there are multiple

    return documents;
  }

  /**
   * Get a list of all IDs of the documents in a collection.
   * Works with nested collections.
   *
   * @param {string} path the path to the collection
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} an array of IDs of the documents in the collection
   */
  getDocumentIds_(path: string, request: Request): string[] {
    const documents: FirestoreAPI.Document[] = this.query_(path, request).Select().Execute() as FirestoreAPI.Document[];
    return Util_.stripBasePath(path, documents);
  }

  /**
   * Get a document.
   *
   * @param {string} path the path to the document
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} an object maexpping the document's fields to their values
   */
  getDocument_(path: string, request: Request): Document {
    const doc = request.get<FirestoreAPI.Document>(path);

    if (!doc.fields) {
      throw new Error('No document with `fields` found at path ' + path);
    }
    return new Document(doc, {} as Document);
  }

  /**
   * Get documents with given IDs.
   *
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/projects.databases.documents/batchGet Firestore Documents BatchGet}
   * @param {string} path the path to the document
   * @param {string} request the Firestore Request object to manipulate
   * @param {array} ids String array of document names
   * @return {object} an object mapping the document's fields to their values
   */
  getDocuments_(path: string, request: Request, ids: string[]): Document[] {
    // Format to absolute paths (relative to API endpoint)
    const idPaths = ids.map((doc: string) => path + '/' + doc);
    const payload: FirestoreAPI.BatchGetDocumentsRequest = { documents: idPaths };
    let documents = request.post<FirestoreAPI.BatchGetDocumentsResponse[]>('', payload);
    // Remove missing entries
    documents = documents.filter((docItem: FirestoreAPI.BatchGetDocumentsResponse) => docItem.found);
    return documents.map((docItem: FirestoreAPI.BatchGetDocumentsResponse) => {
      const doc = new Document(docItem.found!, { readTime: docItem.readTime } as Document);
      doc.readTime = docItem.readTime;
      return doc;
    });
  }

  /**
   * Set up a Query to receive data from a collection
   *
   * @param {string} path the path to the document or collection to query
   * @param {string} request the Firestore Request object to manipulate
   * @return {object} A FirestoreQuery object to set up the query and eventually execute
   */
  query_(path: string, request: Request): Query {
    const grouped = Util_.getCollectionFromPath(path);
    request.route('runQuery');
    const callback = (query: FirestoreAPI.StructuredQuery): Document[] => {
      // Send request to innermost document with given query
      const payload: FirestoreAPI.RunQueryRequest = { structuredQuery: query };
      const responseObj = request.post<FirestoreAPI.RunQueryResponse[]>(grouped[0], payload);

      // Filter out results without documents and unwrap document fields
      const documents = responseObj.reduce((docs: Document[], docItem: FirestoreAPI.RunQueryResponse) => {
        if (docItem.document) {
          const doc = new Document(docItem.document, { readTime: docItem.readTime } as Document);
          docs.push(doc);
        }
        return docs;
      }, []);

      return documents;
    };
    return new Query(grouped[1], callback);
  }
}

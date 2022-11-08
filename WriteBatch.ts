/**
 * Write multiple documents in one request.
 * Can be atomic or not.
 */
class WriteBatch {
  #mutations: FirestoreAPI.Write[] = [];
  #committed = false;

  /**
   * Getter to check if a WriteBatch has pending write
   */
  public get isEmpty() {
    return this.#mutations.length === 0;
  }

  /**
   * A container for multiple writes
   * @param {Firestore} _firestore the parent instance
   * @param {Boolean} _atomic the REST api supports batch writes in a non-atomic way
   */
  constructor(private readonly _firestore: Firestore) {}

  /**
   * Writes to the document referred to by the provided path.
   * If the document does not exist yet, it will be created.
   *
   * @param {string} path - A path to the document to be set.
   * @param data - An object of the fields and values for the document.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  set(path: string, fields: Record<string, any>): WriteBatch;
  /**
   * Writes to the document referred to by the provided path.
   * If the document does not exist yet, it will be created.
   * If you provide `merge` or `mergeFields`, the provided data can be merged
   * into an existing document.
   *
   * @param {string} path - A path to the document to be set.
   * @param data - An object of the fields and values for the document.
   * @param options - An object to configure the set behavior.
   * @throws Error - If the provided input is not a valid Firestore document.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  set(path: string, fields: Record<string, any>, options: Record<string, any>): WriteBatch;
  set(
    path: string,
    fields: Record<string, any>,
    options?: Record<string, any> // FirestoreAPI.SetOptions
  ): WriteBatch {
    this.verifyNotCommitted_();

    const isMerge = options && (options.merge || options.mergeFields);
    const updateMask: FirestoreAPI.DocumentMask | undefined = isMerge
      ? { fieldPaths: options.merge ? Object.keys(fields) : options.mergeFields }
      : undefined;
    const update: FirestoreAPI.Document = new Document(fields, `${this._firestore.basePath}${path}`);

    const mutation: FirestoreAPI.Write = {
      updateMask: updateMask,
      update: update,
    };
    this.#mutations.push(mutation);
    return this;
  }

  /**
   * Updates fields in the document referred to by the provided path.
   * The update will fail if applied to a document that does
   * not exist.
   *
   * @param {string} path - A path to the document to be updated.
   * @param data - An object containing the fields and values with which to
   * update the document. Fields can contain dots to reference nested fields
   * within the document.
   * @throws Error - If the provided input is not valid Firestore data.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  update(path: string, data: Record<string, any>): WriteBatch;
  /**
   * Updates fields in the document referred to by the provided path.
   * The update will fail if applied to a document that does
   * not exist.
   *
   * Nested fields can be update by providing dot-separated field path strings.
   *
   * @param {string} path - A path to the document to be updated.
   * @param field - The first field to update.
   * @param value - The first value.
   * @param moreFieldsAndValues - Additional key value pairs.
   * @throws Error - If the provided input is not valid Firestore data.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  update(path: string, field: string, value: unknown, ...moreFieldsAndValues: unknown[]): WriteBatch;
  update(
    path: string,
    fieldOrUpdateData: string | Record<string, any>,
    value?: unknown,
    ...moreFieldsAndValues: unknown[]
  ): WriteBatch {
    this.verifyNotCommitted_();

    let fields;
    if (typeof fieldOrUpdateData === 'string') {
      fields = {
        [fieldOrUpdateData]: value,
      };
      for (let i = 0; i < moreFieldsAndValues.length; i += 2) {
        fields[moreFieldsAndValues[i] as string] = moreFieldsAndValues[i + 1];
      }
    } else {
      fields = fieldOrUpdateData;
    }
    const updateMask: FirestoreAPI.DocumentMask = { fieldPaths: Object.keys(fields) };
    const update: FirestoreAPI.Document = new Document(fields, `${this._firestore.basePath}${path}`);

    const mutation: FirestoreAPI.Write = {
      updateMask: updateMask,
      update: update,
      currentDocument: {
        exists: true,
      },
    };
    this.#mutations.push(mutation);
    return this;
  }

  /**
   * Deletes the document referred to by the provided path.
   *
   * @param {string} path - A path to the document to be deleted.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  delete(path: string): WriteBatch {
    this.verifyNotCommitted_();
    // const ref = validateReference(documentRef, this._firestore);
    // new DeleteMutation(ref._key, Precondition.none())
    const mutation: FirestoreAPI.Write = {
      delete: `${this._firestore.basePath}${path}`,
    };
    this.#mutations.push(mutation);
    return this;
  }

  /**
   * Issue the write request.
   * If atomic, a true value is returned on success or throws an error on failure.
   * If not atomic, an array of either true or error message is returned.
   */
  commit(atomic = false): boolean | Array<true | string | undefined> {
    this.verifyNotCommitted_();
    this.#committed = true;
    if (!this.#mutations.length) {
      throw new Error('A write batch cannot commit with no changes requested.');
    }

    const request = new Request(this._firestore.baseUrl, this._firestore.authToken);
    request.route(atomic ? 'commit' : 'batchWrite');

    const payload: FirestoreAPI.CommitRequest | FirestoreAPI.BatchWriteRequest = { writes: this.#mutations };
    const responseObj = request.post<FirestoreAPI.CommitResponse | FirestoreAPI.BatchWriteResponse>(undefined, payload);

    if (atomic) {
      return true;
    } else {
      return ((responseObj as FirestoreAPI.BatchWriteResponse).status || []).map((s) => !s.code || s.message);
    }
  }

  private verifyNotCommitted_(): void {
    if (this.#committed) {
      throw new Error('A write batch can no longer be used after commit() ' + 'has been called.');
    }
  }
}

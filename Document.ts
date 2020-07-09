/**
 * Firestore Document
 */
class Document implements FirestoreAPI.Document, FirestoreAPI.MapValue {
  fields?: Record<string, FirestoreAPI.Value>;
  createTime?: string;
  updateTime?: string;
  readTime?: string;
  name?: string;

  /**
   *
   *
   * @param obj
   * @param name
   */
  constructor(obj: Value | FirestoreAPI.Document, name?: string | Document | FirestoreAPI.ReadOnly) {
    //Treat parameters as existing Document with extra parameters to merge in
    if (typeof name === 'object') {
      Object.assign(this, obj);
      Object.assign(this, name);
    } else {
      this.fields = Document.wrapMap(obj as ValueObject).fields;
      if (name) {
        this.name = name;
      }
    }
  }

  get created(): Date {
    return this.createTime ? Document.unwrapDate(this.createTime) : new Date();
  }

  get updated(): Date {
    return this.updateTime ? Document.unwrapDate(this.updateTime) : new Date();
  }

  get read(): Date {
    return this.readTime ? Document.unwrapDate(this.readTime) : new Date();
  }

  get path() {
    return this.name?.match(Util_.regexPath)![1];
  }

  /**
   * Extract fields from a Firestore document.
   *
   * @param {object} firestoreDoc the Firestore document whose fields will be extracted
   * @return {object} an object with the given document's fields and values
   */
  get obj(): Record<string, Value> {
    return Document.unwrapObject(this);
  }

  toString(): string {
    return `Document (${Util_.getDocumentFromPath(this.name as string)[1]})`;
  }

  static unwrapValue(obj: FirestoreAPI.Value): Value {
    // eslint-disable-next-line prefer-const
    let [type, val]: [string, any] = Object.entries(obj)[0];
    switch (type) {
      case 'referenceValue':
      case 'bytesValue':
      case 'stringValue':
      case 'booleanValue':
      case 'geoPointValue':
        return val;
      case 'doubleValue':
        return parseFloat(val as string);
      case 'integerValue':
        return parseInt(val as string);
      case 'mapValue':
        return this.unwrapObject(val as FirestoreAPI.MapValue);
      case 'arrayValue':
        return this.unwrapArray(val.values);
      case 'timestampValue':
        return this.unwrapDate(val as string);
      case 'nullValue':
      default:
        return null;
    }
  }

  static unwrapObject(obj: FirestoreAPI.MapValue): ValueObject {
    return Object.entries(obj.fields || {}).reduce(
      (o: Record<string, Value>, [key, val]: [string, FirestoreAPI.Value]) => {
        o[key] = Document.unwrapValue(val);
        return o;
      },
      {}
    );
  }

  static unwrapArray(wrappedArray: FirestoreAPI.Value[] = []): Value[] {
    return wrappedArray.map(this.unwrapValue, this);
  }

  static unwrapDate(wrappedDate: string): Date {
    // Trim out extra microsecond precision
    return new Date(wrappedDate.replace(Util_.regexDatePrecision, '$1'));
  }

  static wrapValue(val: Value): FirestoreAPI.Value {
    const type = typeof val;
    switch (type) {
      case 'string':
        return this.wrapString(val as string);
      case 'object':
        return this.wrapObject(val as ValueObject);
      case 'number':
        return this.wrapNumber(val as number);
      case 'boolean':
        return this.wrapBoolean(val as boolean);
      default:
        return this.wrapNull();
    }
  }

  static wrapString(string: string): FirestoreAPI.Value {
    // Test for root path reference inclusion (see Util.js)
    if (Util_.regexPath.test(string)) {
      return this.wrapRef(string);
    }

    // Test for binary data in string (see Util.js)
    if (Util_.regexBinary.test(string)) {
      return this.wrapBytes(string);
    }

    return { stringValue: string };
  }

  static wrapObject(obj: ValueObject): FirestoreAPI.Value {
    if (!obj) {
      return this.wrapNull();
    }

    if (Array.isArray(obj)) {
      return this.wrapArray(obj);
    }

    // instanceof fails for code referencing this library
    if (obj instanceof Date || obj.constructor.name === 'Date') {
      return this.wrapDate((obj as any) as Date);
    }

    // Check if LatLng type
    if (Object.keys(obj).length === 2 && 'latitude' in obj && 'longitude' in obj) {
      return this.wrapLatLong(obj as FirestoreAPI.LatLng);
    }

    return { mapValue: this.wrapMap(obj) };
  }

  static wrapMap(obj: ValueObject): FirestoreAPI.MapValue {
    return {
      fields: Object.entries(obj).reduce((o: Record<string, FirestoreAPI.Value>, [key, val]: [string, Value]) => {
        o[key] = Document.wrapValue(val);
        return o;
      }, {}),
    };
  }

  static wrapNull(): FirestoreAPI.Value {
    return { nullValue: null };
  }

  static wrapBytes(bytes: string): FirestoreAPI.Value {
    return { bytesValue: bytes };
  }

  static wrapRef(ref: string): FirestoreAPI.Value {
    return { referenceValue: ref };
  }

  static wrapNumber(num: number): FirestoreAPI.Value {
    const func = Util_.isInt(num) ? this.wrapInt : this.wrapDouble;
    return func(num);
  }

  static wrapInt(int: number): FirestoreAPI.Value {
    return { integerValue: int.toString() };
  }

  static wrapDouble(double: number): FirestoreAPI.Value {
    return { doubleValue: double };
  }

  static wrapBoolean(boolean: boolean): FirestoreAPI.Value {
    return { booleanValue: boolean };
  }

  static wrapDate(date: Date): FirestoreAPI.Value {
    return { timestampValue: date.toISOString() };
  }

  static wrapLatLong(latLong: FirestoreAPI.LatLng): FirestoreAPI.Value {
    return { geoPointValue: latLong };
  }

  static wrapArray(array: any[]): FirestoreAPI.Value {
    const wrappedArray = array.map(this.wrapValue, this);
    return { arrayValue: { values: wrappedArray } };
  }
}

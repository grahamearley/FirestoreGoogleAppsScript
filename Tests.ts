function StoreCredentials_(): void {
  /** DO NOT SAVE CREDENTIALS HERE */
  const email = 'xxx@appspot.gserviceaccount.com';
  const key = '-----BEGIN PRIVATE KEY-----\nLine\nLine\n-----END PRIVATE KEY-----';
  PropertiesService.getUserProperties().setProperties({
    email: email,
    key: key,
    project: email.substr(0, email.indexOf('@')),
  });
}

class Tests implements TestManager {
  db!: Firestore;
  pass: string[];
  fail: Record<string, Error>;
  expected_!: Record<string, Value>;

  constructor(email: string, key: string, projectId: string, apiVersion: Version = 'v1') {
    this.pass = [];
    this.fail = {};

    const funcs = Object.getOwnPropertyNames(Tests.prototype).filter(
      (property) => typeof (this as any)[property] === 'function' && property !== 'constructor'
    );

    /** Test Initializer */
    try {
      this.db = getFirestore(email, key, projectId, apiVersion);
      this.pass.push('Test_Get_Firestore');
    } catch (e) {
      /** On failure, fail the other tests too */
      this.fail['Test_Get_Firestore'] = e;
      const err: Error = {
        name: 'Test Error',
        message: 'Test Initialization Error',
        stack: 'See Test_Get_Firestore Error',
      };
      for (const func of funcs) {
        this.fail[func] = err;
      }
      return;
    }

    this.expected_ = {
      'array value': ['string123', 42, false, { 'nested map property': 123 }],
      'number value': 100,
      'string value 이': 'The fox jumps over the lazy dog 름',
      'boolean value': true,
      'map value (nested object)': {
        foo: 'bar',
      },
      'null value': null,
      'timestamp value': new Date(),
      'geopoint value': {
        latitude: 29.9792,
        longitude: 31.1342,
      },
      'reference value': this.db.basePath + 'Test Collection/New Document',
    };

    /** Test all methods in this class */
    for (const func of funcs) {
      try {
        (this as any)[func]();
        this.pass.push(func);
      } catch (e) {
        this.fail[func] = typeof e === 'string' ? { message: 'AssertionError', stack: e } : e;
      }
    }
  }

  /**
   * All Test methods should not take any parameters, and return nothing.
   * Tests should throw exceptions to fail.
   * Can leverage {@link https://sites.google.com/site/scriptsexamples/custom-methods/gsunit GSUnit}.
   */
  Test_Create_Document_Bare(): void {
    const path = 'Test Collection';
    const newDoc = this.db.createDocument(path);
    GSUnit.assertNotUndefined(newDoc);
    GSUnit.assertNotUndefined(newDoc.name);
    GSUnit.assertTrue(newDoc.name!.startsWith(this.db.basePath + path + '/'));
    GSUnit.assertNotUndefined(newDoc.createTime);
    GSUnit.assertNotUndefined(newDoc.updateTime);
    GSUnit.assertEquals(newDoc.createTime, newDoc.updateTime);
    GSUnit.assertRoughlyEquals(+new Date(), +newDoc.created, 1000);
  }

  Test_Create_Document_Name(): void {
    const path = 'Test Collection/New Document';
    const newDoc = this.db.createDocument(path);
    GSUnit.assertNotUndefined(newDoc);
    GSUnit.assertEquals(this.db.basePath + path, newDoc.name);
    GSUnit.assertNotUndefined(newDoc.createTime);
    GSUnit.assertNotUndefined(newDoc.updateTime);
    GSUnit.assertRoughlyEquals(+new Date(), +newDoc.updated, 1000);
  }

  Test_Create_Document_Name_Duplicate(): void {
    const path = 'Test Collection/New Document';
    try {
      this.db.createDocument(path);
      GSUnit.fail('Duplicate document without error');
    } catch (_e) {
      /* db.createDocument should be throwing an error */
    }
  }

  Test_Create_Document_Data(): void {
    const path = 'Test Collection/New Document !@#$%^&*(),.<>?;\':"[]{}|-=_+áéíóúæÆÑ';
    const newDoc = this.db.createDocument(path, this.expected_);
    GSUnit.assertObjectEquals(this.expected_, newDoc.obj);
  }

  Test_Update_Document_Overwrite_Default(): void {
    const original = {
      'number value': -100,
      'string value 이': 'The fox jumps over the lazy dog 름',
    };
    const path = 'Test Collection/Updatable Document Default';
    this.db.createDocument(path, original);
    const expected = {
      'string value 이': 'Qwerty निर्वाण',
      'null value': 'Not a Null',
    };
    const updatedDoc = this.db.updateDocument(path, expected);
    GSUnit.assertObjectEquals(expected, updatedDoc.obj);
  }

  Test_Update_Document_Overwrite(): void {
    const original = {
      'number value': 10,
      'string value 이': 'The fox jumps over the lazy dog 름',
    };
    const path = 'Test Collection/Updatable Document Overwrite';
    this.db.createDocument(path, original);
    const expected = { 'number value': 42 };
    const updatedDoc = this.db.updateDocument(path, expected, false);
    GSUnit.assertObjectEquals(expected, updatedDoc.obj);
  }

  Test_Update_Document_Mask(): void {
    const expected = {
      'number value': 1234567890,
      'string value 이': 'The fox jumps over the lazy dog 름',
    };
    const path = 'Test Collection/Updatable Document Mask';
    this.db.createDocument(path, expected);
    const updater = { 'string value 이': 'The new wave `~' };
    const updatedDoc = this.db.updateDocument(path, updater, true);
    Object.assign(expected, updater);
    GSUnit.assertObjectEquals(expected, updatedDoc.obj);
  }

  Test_Update_Document_Overwrite_Missing(): void {
    const path = 'Test Collection/Missing Document Overwrite';
    const expected = { 'boolean value': false };
    const updatedDoc = this.db.updateDocument(path, expected, false);
    GSUnit.assertObjectEquals(expected, updatedDoc.obj);
  }

  Test_Update_Document_Mask_Missing(): void {
    const path = 'Test Collection/Missing Document Mask';
    const expected = { 'boolean value': true };
    const updatedDoc = this.db.updateDocument(path, expected, true);
    GSUnit.assertObjectEquals(expected, updatedDoc.obj);
  }

  Test_Get_Document(): void {
    const path = 'Test Collection/New Document !@#$%^&*(),.<>?;\':"[]{}|-=_+áéíóúæÆÑ';
    const doc = this.db.getDocument(path);
    GSUnit.assertObjectEquals(this.expected_, doc.obj);
  }

  Test_Get_Document_Missing(): void {
    const path = 'Test Collection/Missing Document';
    try {
      this.db.getDocument(path);
      GSUnit.fail('Missing document without error');
    } catch (_e) {
      /* db.getDocument should be throwing an error */
    }
  }

  Test_Get_Documents(): void {
    const path = 'Test Collection';
    const docs = this.db.getDocuments(path);
    GSUnit.assertEquals(8, docs.length);
    const doc = docs.find((doc) => doc.name!.endsWith('/New Document !@#$%^&*(),.<>?;\':"[]{}|-=_+áéíóúæÆÑ'));
    GSUnit.assertNotUndefined(doc);
    GSUnit.assertObjectEquals(this.expected_, doc!.obj);
  }

  Test_Get_Documents_By_ID(): void {
    const path = 'Test Collection';
    const ids = [
      'New Document',
      'Updatable Document Default',
      'Updatable Document Overwrite',
      'Updatable Document Mask',
      'Missing Document',
    ];
    const docs = this.db.getDocuments(path, ids);
    GSUnit.assertEquals(ids.length - 1, docs.length);
  }

  Test_Get_Documents_By_ID_Missing(): void {
    const path = 'Missing Collection';
    const ids = [
      'New Document',
      'Updatable Document Default',
      'Updatable Document Overwrite',
      'Updatable Document Mask',
      'Missing Document',
    ];
    const docs = this.db.getDocuments(path, ids);
    GSUnit.assertEquals(0, docs.length);
  }

  Test_Get_Documents_By_ID_Empty(): void {
    const path = 'Test Collection';
    const ids: string[] = [];
    const docs = this.db.getDocuments(path, ids);
    GSUnit.assertEquals(0, docs.length);
  }

  Test_Get_Document_IDs(): void {
    const path = 'Test Collection';
    const docs = this.db.getDocumentIds(path);
    GSUnit.assertEquals(8, docs.length);
  }

  Test_Get_Document_IDs_Missing(): void {
    const path = 'Missing Collection';
    try {
      this.db.getDocumentIds(path);
      GSUnit.fail('Missing collection without error');
    } catch (_e) {
      /* db.getDocumentIds should be throwing an error */
    }
  }

  Test_Query_All(): void {
    const path = 'Test Collection';
    const expected = this.db.getDocuments(path);
    expected.forEach((doc) => {
      delete doc.readTime;
    });
    const docs = this.db.query(path).Execute();
    docs.forEach((doc) => {
      delete doc.readTime;
    });
    GSUnit.assertArrayEquals(expected, docs);
  }

  Test_Query_Select_Name(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Select().Execute();
    GSUnit.assertEquals(8, docs.length);
  }

  Test_Query_Select_Name_Number(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Select().Select('number value').Execute();
    GSUnit.assertEquals(8, docs.length);
  }

  Test_Query_Select_String(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Select('string value 이').Execute();
    GSUnit.assertEquals(8, docs.length);
  }

  Test_Query_Where_EqEq_String(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('string value 이', '==', 'The fox jumps over the lazy dog 름').Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_EqEqEq_String(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('string value 이', '===', 'The fox jumps over the lazy dog 름').Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_Eq_Number(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', '==', 100).Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_Lt_Number(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', '<', 100).Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_Lte_Number(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', '<=', 100).Execute();
    GSUnit.assertEquals(2, docs.length);
  }

  Test_Query_Where_Gt_Number(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', '>', 100).Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_Gte_Number(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', '>=', 100).Execute();
    GSUnit.assertEquals(2, docs.length);
  }

  Test_Query_Where_Contains(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('array value', 'contains', 42).Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_Contains_Any(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('array value', 'containsany', [false, 0, 42, 'bar']).Execute();
    GSUnit.assertEquals(1, docs.length);
  }

  Test_Query_Where_In(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', 'in', [0, 100, 42]).Execute();
    GSUnit.assertEquals(2, docs.length);
  }

  Test_Query_Where_Nan(): void {
    /** Unable to store NaN values to Firestore */
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('number value', NaN).Execute();
    GSUnit.assertEquals(0, docs.length);
  }

  Test_Query_Where_Null(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Where('null value', null).Execute();
    GSUnit.assertEquals(1, docs.length);
    GSUnit.assertObjectEquals(this.expected_, docs[0].obj);
  }

  Test_Query_OrderBy_Number(): void {
    const expected = [
      'Updatable Document Overwrite',
      'New Document !@#$%^&*(),.<>?;\':"[]{}|-=_+áéíóúæÆÑ',
      'Updatable Document Mask',
    ];
    const path = 'Test Collection';
    const docs = this.db.query(path).Select().OrderBy('number value').Execute();
    GSUnit.assertArrayEquals(expected, Util_.stripBasePath(path, docs));
  }

  Test_Query_OrderBy_Number_ASC(): void {
    const expected = [
      'Updatable Document Overwrite',
      'New Document !@#$%^&*(),.<>?;\':"[]{}|-=_+áéíóúæÆÑ',
      'Updatable Document Mask',
    ];
    const path = 'Test Collection';
    const docs = this.db.query(path).Select().OrderBy('number value', 'asc').Execute();
    GSUnit.assertArrayEquals(expected, Util_.stripBasePath(path, docs));
  }

  Test_Query_OrderBy_Number_DESC(): void {
    const expected = [
      'Updatable Document Mask',
      'New Document !@#$%^&*(),.<>?;\':"[]{}|-=_+áéíóúæÆÑ',
      'Updatable Document Overwrite',
    ];
    const path = 'Test Collection';
    const docs = this.db.query(path).Select().OrderBy('number value', 'desc').Execute();
    GSUnit.assertArrayEquals(expected, Util_.stripBasePath(path, docs));
  }

  Test_Query_Offset(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Offset(2).Execute();
    GSUnit.assertEquals(6, docs.length);
  }

  Test_Query_Limit(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Limit(2).Execute();
    GSUnit.assertEquals(2, docs.length);
  }

  Test_Query_Range(): void {
    const path = 'Test Collection';
    const docs = this.db.query(path).Range(2, 5).Execute();
    GSUnit.assertEquals(5 - 2, docs.length);
  }

  Test_Delete_Documents(): void {
    const collection = 'Test Collection';
    const docs = this.db.getDocumentIds(collection).map((path) => this.db.deleteDocument(collection + '/' + path));
    docs.forEach((doc) => GSUnit.assertObjectEquals({}, doc));
  }

  Test_Delete_Document_Missing() {
    const path = 'Test Collection/Missing Document';
    const noDoc = this.db.deleteDocument(path);
    GSUnit.assertObjectEquals({}, noDoc);
  }
}

function RunTests_(): Shield {
  const scriptProps = PropertiesService.getUserProperties().getProperties();
  const tests = new Tests(scriptProps['email'], scriptProps['key'], scriptProps['project'], 'v1');
  const { pass, fail } = tests;
  Object.entries(fail).forEach(([func, err]: [string, Error]) =>
    console.log(`Test Failed: ${func} (${err.message})\n${err.stack}`)
  );
  return {
    schemaVersion: 1,
    label: 'tests',
    message: `✔ ${pass.length}, ✘ ${Object.keys(fail).length}`,
    color: Object.keys(fail).length ? 'red' : 'green',
    cacheSeconds: 3600,
  };
}

function cacheResults_(): string {
  /* Script owner should set up a trigger for this function to cache the test results.
   * The badge fetching these Test Results (on README) is set to cache the image after 1 hour.
   * GitHub creates anonymized URLs which timeout after 3 seconds,
   * which is longer than the time it takes to execute all the tests.
   */
  const results = JSON.stringify(RunTests_());
  CacheService.getUserCache()!.put('Test Results', results);
  return results;
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function doGet(_e: GoogleAppsScript.Events.AppsScriptHttpRequestEvent): GoogleAppsScript.Content.TextOutput {
  const results = CacheService.getUserCache()!.get('Test Results') || cacheResults_();
  return ContentService.createTextOutput(results);
}

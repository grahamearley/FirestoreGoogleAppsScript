/**
 * @see {@link https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/timestamp.proto Google Protobuf Timestamp}
 */

// A Timestamp represents a point in time independent of any time zone or local
// calendar, encoded as a count of seconds and fractions of seconds at
// nanosecond resolution. The count is relative to an epoch at UTC midnight on
// January 1, 1970, in the proleptic Gregorian calendar which extends the
// Gregorian calendar backwards to year one.
type Timestamp =
  | string
  | {
      // Represents seconds of UTC time since Unix epoch
      // 1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
      // 9999-12-31T23:59:59Z inclusive.
      seconds?: string | number;
      // Non-negative fractions of a second at nanosecond resolution. Negative
      // second values with fractions must still have non-negative nanos values
      // that count forward in time. Must be from 0 to 999,999,999
      // inclusive.
      nanos?: number;
    };

type RequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
type Method = 'get' | 'delete' | 'patch' | 'post' | 'put';

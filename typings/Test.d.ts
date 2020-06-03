interface TestManager {
  pass: string[];
  fail: Record<string, Error>;
}

/** @see {@link https://shields.io/endpoint Source} */
interface Shield {
  /**
   * Always the number 1.
   */
  schemaVersion: number;
  /**
   * The left text, or the empty string to omit the left side of the badge.
   * This can be overridden by the query string.
   */
  label: string;
  /**
   * Can't be empty. The right text.
   */
  message: string;
  /**
   * Default: lightgrey. The right color.
   * Supports the eight named colors above, as well as hex, rgb, rgba, hsl, hsla and css named colors.
   * This can be overridden by the query string.
   */
  color?: string;
  /**
   * Default: grey. The left color.
   * This can be overridden by the query string.
   */
  labelColor?: string;
  /**
   * Default: false. true to treat this as an error badge.
   * This prevents the user from overriding the color.
   * In the future it may affect cache behavior.
   */
  isError?: boolean;
  /**
   * Default: none. One of the named logos supported by Shields or simple - icons.
   * Can be overridden by the query string.
   *
   */
  namedLogo?: string;
  /**
   * Default: none. An SVG string containing a custom logo.
   */
  logoSvg?: string;
  /**
   * Default: none. Same meaning as the query string.
   * Can be overridden by the query string.
   */
  logoColor?: string;
  /**
   * Default: none. Same meaning as the query string.
   * Can be overridden by the query string.
   */
  logoWidth?: number;
  /**
   * Default: none. Same meaning as the query string.
   * Can be overridden by the query string.
   */
  logoPosition?: string;
  /**
   * Default: flat. The default template to use.
   * Can be overridden by the query string.
   */
  style?: string;
  /**
   * Default: 300, min 300. Set the HTTP cache lifetime in seconds, which should be respected by the Shields' CDN and downstream users.
   * Values below 300 will be ignored.
   * This lets you tune performance and traffic vs.responsiveness.
   * The value you specify can be overridden by the user via the query string, but only to a longer value.
   */
  cacheSeconds?: number;
}

/** Google Apps Script Library with assertions */
declare let GSUnit: any;

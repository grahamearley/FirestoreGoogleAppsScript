# Contributions
Contributions are welcome! To contribute, fork this repository and create a pull request with your changes.

#### Pull requests
* Please create (or link to) an issue before creating a pull request. Your changes are more likely to be pulled in after we discuss implementation, scope, etc. in the issue.
* Please be responsive to change requests on your pull request.

#### Checklist for your code
- [ ] Have you all the appropriate dependencies (after `git clone`)?
  * Install all packages from `package.json` with a bare `npm install`.
- [ ] Have you tested the code yourself?
  * Install [clasp](https://developers.google.com/apps-script/guides/clasp) `npm install --global @google/clasp`
  * Log into your Google Account `clasp login`
  * Create/Clone Apps Script Project to link and set file extension to "ts". Example `.clasp.json` file:
    ```javascript
    {
      "scriptId": "1yIYw-your-scriptID-here-las12jsA2sd",
      "fileExtension": "ts"
    }
    ```
  * Add storable credentials to your script to connect to your Firestore database.
  * Add test methods to `Test.ts` file which validates your change.
  * Debug/Test your code against your database.
- [ ] Have you [documented your functions and their parameters and return values with JSDoc](http://usejsdoc.org/about-getting-started.html)?
- [ ] Have you modernized the code to run with the new [V8 Runtime](https://developers.google.com/apps-script/guides/v8-runtime)?
- [ ] Have you privatized or encapsulated all intended functions in a class?
  * Global functions can be privatized by appending the "`_`" to the function name.
- [ ] Have you ensured all the appropriate Typescript Definitions are available?
- [ ] Does your code follow the [Prettier Javascript Style](https://prettier.io/docs/en/install.html)?
  * Check syntax and style in one go with `npm run lint`.
  * Autofix most issues with `npm run fix`.

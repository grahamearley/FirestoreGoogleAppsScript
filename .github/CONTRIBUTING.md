# Contributions
Contributions are welcome! To contribute, fork this repository and create a pull request with your changes.

#### Pull requests
* Please create an issue before creating a pull request. Your changes are more likely to be pulled in after we discuss implementation, scope, etc. in an issue.
* Please be responsive to change requests on your pull request.

#### Checklist for your code
* Have you tested the code yourself?
  * Install [clasp](https://developers.google.com/apps-script/guides/clasp) `npm install --global @google/clasp`
  * Log into your Google Account `clasp login`
  * Create/Clone Apps Script Project
  * Create a Test.js file which creates a Firestore instance (via. `getFirestore()`)
  * Debug/Test your code against your database
* Have you [documented your functions and their parameters and return values with JSDoc](http://usejsdoc.org/about-getting-started.html)?
* Have you made all functions that an end user of the library should not see private? (You can make a function private by adding `_` to the end of its name, as in `publicFunction()` and `privateFunction_()`).
  * Add new "global" functions to `package.json`
* Does your code follow the [Standard Javascript Style Guide](https://github.com/standard/standard)?
  * Install [standard](https://github.com/standard/standard) `npm install --global standard`
  * Check code against rules `standard --verbose`
  * Autofix most issues `standard --fix`

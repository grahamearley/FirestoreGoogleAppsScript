// Assumes n is a Number.
function isInt_(n) {
   	return n % 1 === 0;
}

function base64EncodeSafe_(string) {
  	var encoded = Utilities.base64EncodeWebSafe(string);
  	return encoded.replace(/=/g, "");
}

function removeTrailingSlash_(string) {
	const length = string.length;
	if (string.charAt(length - 1) == '/') {
    	// Remove trailing slash
    	return string.substr(0, length - 1);
  	} else {
  		return string;
  	}
}

function getObjectFromResponse(response) {
  	return JSON.parse(response.getContentText());
}
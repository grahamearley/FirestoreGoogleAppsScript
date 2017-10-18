// Assumes n is a Number.
function isInt_(n) {
   return n % 1 === 0;
}

function base64EncodeSafe_(string) {
  var encoded = Utilities.base64EncodeWebSafe(string);
  return encoded.replace(/=/g, "");  
}
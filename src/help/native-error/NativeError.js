/**
 * @providesModule NativeError
 */

function NativeError() {}
NativeError.prototype = Object.create(Error.prototype);
if (Object.setPrototypeOf) Object.setPrototypeOf(NativeError, Error);

module.exports = NativeError;

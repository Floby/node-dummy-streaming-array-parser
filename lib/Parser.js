var stream = require('stream');
var util = require('util');

function Parser () {
  if(!(this instanceof Parser)) {
    return new Parser();
  }
  stream.Transform.apply(this, arguments);

  this._buffer = [];
  this._currentDepth = 0;
}
util.inherits(Parser, stream.Transform);

module.exports = Parser;

Parser.prototype._transform = function _transform(chunk, encoding, callback) {
  chunk = chunk.toString();
  console.log('transform with', chunk);
  var opening = this._getNumberOfOpeningTokens(chunk);
  var closing = this._getNumberOfClosingTokens(chunk);
  this._currentDepth += (opening - closing);
  callback()
};

Parser.prototype._getNumberOfOpeningTokens = function _getNumberOfOpeningTokens(chunk) {
  var regex = this._openingTokensRegexp;
  var res = regex.exec(chunk);
  return res ? res.length : 0;
};
Parser.prototype._openingTokensRegexp = /[\[{]/;

Parser.prototype._getNumberOfClosingTokens = function _getNumberOfClosingTokens(chunk) {
  var regex = this._closingTokensRegexp;
  var res = regex.exec(chunk);
  return res ? res.length : 0;
};
Parser.prototype._closingTokensRegexp = /[\]}]/;

Parser.prototype._flush = function _flush(callback) {
  console.log('flush with current depth', this._currentDepth);
  if(this._currentDepth > 0) {
    return callback(new Error('Unexpected end of input'));
  }
  else {
    callback();
  }
};

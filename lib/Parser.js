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
  this._processUntilNextToken(chunk.toString());
  callback()
};

var token_regex = /[\[\]{}]/;
Parser.prototype._processUntilNextToken = function _processUntilNextToken(chunk) {
  if (!chunk || !chunk.length) {
    return;
  }
  var index = chunk.search(token_regex);
  if(index === -1) {
    return;
  }
  var myChunk = chunk.substring(0, index + 1);
  var lastChar = myChunk[myChunk.length - 1];
  switch(lastChar) {
      case '[':
      case '{':
        this._currentDepth += 1;
        break;
      
      case ']':
      case '}':
        this._currentDepth -= 1;
        break;
      default:
        break;
  }
  this._processUntilNextToken(chunk.substr(myChunk.length));
};

Parser.prototype._flush = function _flush(callback) {
  if(this._currentDepth > 0) {
    return callback(new Error('Unexpected end of input'));
  }
  else {
    callback();
  }
};

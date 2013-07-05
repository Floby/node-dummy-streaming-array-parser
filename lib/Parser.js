var stream = require('stream');
var util = require('util');

function Parser (options) {
  if(!(this instanceof Parser)) {
    return new Parser();
  }
  stream.Transform.call(this, options);
  this._readableState.objectMode = true;

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
  var increment = 0;
  var hasEndToken = true;
  switch(lastChar) {
      case '[':
      case '{':
        increment = 1;
        break;
      
      case ']':
      case '}':
        increment = -1;
        break;
      default:
        hasEndToken = false;
        break;
  }
  var myInsideChunk = myChunk;
  if (hasEndToken) {
    myInsideChunk = myChunk.substring(0, myChunk.length - 1);
  }
  if(myInsideChunk.length) {
    try {
      this.push(JSON.parse(myInsideChunk));
    } catch(e) {
      this.emit('error', e);
    }
  }
  this._currentDepth += increment;
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

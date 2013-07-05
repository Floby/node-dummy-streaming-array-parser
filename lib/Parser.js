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
  callback()
};


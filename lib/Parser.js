var stream = require('stream');
var util = require('util');

function Parser () {
  if(!(this instanceof Parser)) {
    return new Parser();
  }
  stream.Transform.apply(this, arguments);
}
util.inherits(Parser, stream.Transform);

module.exports = Parser;

Parser.prototype._transform = function _transform(chunk, encoding, callback) {
  this.push(chunk);
  callback()
};

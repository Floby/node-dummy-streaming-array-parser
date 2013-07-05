var stream = require('stream');
var util = require('util');
var Tokenizer = require('tokenizer');
var combine = require('stream-combiner');


function JsonTokenizer() {
    var t = new Tokenizer();
    
    t.addRule(/^,$/, 'comma');
    t.addRule(/^:$/, 'end-label');
    t.addRule(/^\{$/, 'begin-object');
    t.addRule(/^\}$/, 'end-object');
    t.addRule(/^\[$/, 'begin-array');
    t.addRule(/^\]$/, 'end-array');

    t.addRule(/^"([^"]|\\")*"$/, 'string');
    t.addRule(/^"([^"]|\\")*$/, 'maybe-string');
    t.addRule(/^null$/, 'null');
    t.addRule(/^(true|false)$/, 'boolean');

    t.addRule(/^-?\d+(\.\d+)?([eE]-?\d+)?$/, 'number');
    t.addRule(/^-?\d+\.$/, 'maybe-decimal-number');
    t.addRule(/^-$/, 'maybe-negative-number');
    t.addRule(/^-?\d+(\.\d+)?([eE])?$/, 'maybe-exponential-number');
    t.addRule(/^-?\d+(\.\d+)?([eE]-)?$/, 'maybe-exponential-number-negative');

    t.addRule(/^\w+$/, 'symbol');

    t.addRule(Tokenizer.whitespace);
    t.ignore('whitespace');
    // if we had comments tokens, we would ignore them as well
    // but the JSON spec doesn't allow comments!
    
    return t;
}

function Parser (options) {
  if(!(this instanceof Parser)) {
    return new Parser();
  }
  options = options || {};
  options.objectMode = true;
  stream.Transform.call(this, options);

  this._buffer = [];
  this._currentDepth = 0;
}
util.inherits(Parser, stream.Transform);

module.exports = Parser;

Parser.prototype._transform = function _transform(chunk, encoding, callback) {
  if(this._currentDepth === 0) {
    if (chunk.type === 'begin-array') {
      this._currentDepth = 1;
      return callback();
    }
    else {
      return callback(new Error('Unexpected token '+chunk+' ('+chunk.type+')'));
    }
  }
  if(this._currentDepth === 1 && chunk.type === 'end-array') {
    this._processLine();
    this._currentDepth = 0;
    return callback();
  }
  switch(chunk.type) {
      case 'begin-array':
      case 'begin-object':
        this._currentDepth++;
        break;
      case 'end-array':
      case 'end-object':
        this._currentDepth--;
        break;

      case 'comma':
        if(this._currentDepth === 1) {
          chunk = '';
          try {
            this._processLine();
          } catch(e) {
            return callback(e);
          }
        }
        break;

      default:
        break;
  }
  this._buffer.push(chunk);
  callback();
};

Parser.prototype._flush = function _flush(callback) {
  if(this._currentDepth > 0) {
    return callback(new SyntaxError('Unexpected end of input'));
  }
  callback();
};

Parser.prototype._processLine = function _processLine() {
  if(!this._buffer.length) {
    return;
  }
  this.push(JSON.parse(this._buffer.join('')));
  this._buffer = [];
};

module.exports = function () {
  return combine(
    new JsonTokenizer(),
    new Parser()
  );
}

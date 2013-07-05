var sink = require('stream-sink');
var parser = require('../');
var stream = require('stream');


exports['Test empty stream'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();
  source.pipe(p).pipe(sink()).on('data', function(data) {
    test.equals(0, data.length, 'there should be no data at the end');
    test.done();
  });
  p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
  p.on('error', test.fail.bind(test, "No error should occur"));
  source.end();
}

var sink = require('stream-sink');
var domain = require('domain');

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

exports['Test stream with empty array'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();
  var d = domain.create();
  d.on('error', function(err) {
    console.error(err.stack);
    test.fail('no error should occur but got', err.message);
    test.done();
  });

  d.run(function () {
    source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
      test.equals(0, data.length, 'there should be no data at the end');
      test.done();
    });
    p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
    source.end('[]');
  })
}

exports['Test stream with non closing array'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();
  var d = domain.create();
  d.on('error', function(err) {
    console.error(err.stack);
    test.fail('no error should occur but got', err.message);
    test.done();
  });

  d.run(function () {
    source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
      test.equals(0, data.length, 'there should be no data at the end');
    });
    p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
    p.on('error', function(e) {
      test.equal('Unexpected end of input', e.message, "An error should be raised");
      test.done();
    });
    source.end('[ ');
  })
}

var sink = require('stream-sink');
var domain = require('domain');
var parser = require('../');
var stream = require('stream');

Function.prototype.withDomain = function(withStack) {
  var fn = this;
  return function(test) {
    var d = domain.create();
    d.on('error', function(e) {
      test.fail('test failed with ' + e.message);
      if(withStack) {
        console.error(e.stack)
      }
      test.done();
    });
    d.run(fn.bind(this, test));
  }
}


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
}.withDomain()

exports['Test stream with empty array'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();

  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equals(0, data.length, 'there should be no data at the end');
    test.done();
  });
  p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
  source.end('[]');
}.withDomain()

exports['Test stream with non closing array'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();

  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equals(0, data.length, 'there should be no data at the end');
  });
  p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
  p.on('error', function(e) {
    test.equal('Unexpected end of input', e.message, "An error should be raised");
    test.done();
  });
  source.end('[ ');
}.withDomain()

exports['Invalid array [,]'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();

  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equals(0, data.length, 'there should be no data at the end');
  });
  p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
  p.on('error', function(e) {
    test.equal('Unexpected token ,', e.message, "An error should be raised");
    test.done();
  });
  source.end('[,]');
}.withDomain()


exports['test with array with one number in it'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();
  test.expect(2);
  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equal(1, data.length, 'There should be some data at the end');
    test.done();
  });
  p.on('data', function(line) {
    test.equal(line, 8, 'We should get our number in the data event');
  });
  source.end('[ 8 ]');
}.withDomain()

exports['test with array with 2 numbers in it'] = function (test) {
  var a = [8, 10];
  var source = new stream.PassThrough();
  var p = parser();
  test.expect(3);
  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equal(2, data.length, 'There should be some data at the end');
    test.done();
  });
  p.on('data', function(line) {
    test.equal(line, a.shift(), 'We should get our number in the data event');
  });
  source.end(JSON.stringify(a));
}.withDomain()

exports['test with array with 2 strings in it'] = function (test) {
  var a = ["a", "b"];
  var source = new stream.PassThrough();
  var p = parser();
  test.expect(3);
  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equal(2, data.length, 'There should be some data at the end');
    test.done();
  });
  p.on('data', function(line) {
    test.equal(line, a.shift(), 'We should get our number in the data event');
  });
  source.end(JSON.stringify(a));
}.withDomain()

exports['Array of objects'] = function (test) {
  var a = [{object: "one"}, {object: 2}, {"last object": true}];
  var source = new stream.PassThrough();
  var p = parser();
  test.expect(4);
  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.equal(3, data.length, 'There should be some data at the end');
    test.done();
  });
  p.on('data', function(line) {
    test.equal(JSON.stringify(line), JSON.stringify(a.shift()), 'We should get our number in the data event');
  });
  source.end(JSON.stringify(a));
}.withDomain()


exports['Array of objects with missing comma'] = function (test) {
  var source = new stream.PassThrough();
  var p = parser();
  test.expect(1);
  source.pipe(p).pipe(sink({objectMode: true})).on('data', function(data) {
    test.fail('End should never get called');
    test.done();
  });
  p.on('data', test.fail.bind(test, "There shoud be no data emitted"));
  p.on('error', function(e) {
    test.equal('Unexpected token {', e.message, "An error should be raised");
    test.done();
  });
  source.end('[ {"object": 1} {"o":"three"}]');
}.withDomain()

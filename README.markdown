[![Build Status](https://travis-ci.org/Floby/node-dummy-streaming-array-parser.png)](https://travis-ci.org/Floby/node-dummy-streaming-array-parser)

# node-dummy-streaming-array-parser

Get each 'line' of a JSON array streaming.

## Installation

    npm install --save dummy-streaming-array-parser

## Usage

The parser take a JSON array as its input and turns it
into a stream of javascript objects corresponding to each
first-level element of the given array

```javascript
var parser = require('dummy-streaming-array-parser');

var p = parser();
p.on('data', function (value)) {
  console.log(value);
}
p.end('[1, 2, 3, {"Hello":"World"}, "!"]')

// 1
// 2
// 3
// { Hello: 'World' }
// '!'

```

more usually you have a readable stream with a json document that you pipe to this.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

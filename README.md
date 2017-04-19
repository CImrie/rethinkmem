# RethinkMem

This package provides an in-memory RethinkDB Server.
Designed with testing in mind, the server will allow you to connect
your favourite ORM or client library to the RethinkDB Server and run integration tests isolated from each other.

**Note about AVA Test Runner**
The package was designed to run one server instance (max) at a time. As such it runs one server instance
per test file in AVA (as a result of AVA using forked processes).
This has no negative consequences but it does mean that you should call
`RethinkDBServer.start()` only once, at the top of an imported file or test file.
Calling it in a helper method may result in either unexpected behaviour or multiple servers running per test file.

## Usage

The example below uses async/await from ES7. If you wish to use the same syntax,
you should transpile your code using `babel-preset-es2017`. Alternatively, if you are already
using ES6 then you can convert it to the appropriate Promise syntax.

Available on NPM using: `npm install rethinkmem --save-dev` or `yarn add rethinkmem --dev`

*See here for usage examples: https://coligo.io/javascript-async-await/* 

```javascript
//todo
```


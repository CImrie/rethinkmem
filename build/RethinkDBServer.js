'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _rethinkdb = require('rethinkdb');

var _rethinkdb2 = _interopRequireDefault(_rethinkdb);

var _getPorts = require('get-ports');

var _getPorts2 = _interopRequireDefault(_getPorts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('child_process'),
    spawn = _require.spawn;

_tmp2.default.setGracefulCleanup();

var getOptions = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    var ports, driverPort, clusterPort;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new _promise2.default(function (resolve, reject) {
              (0, _getPorts2.default)([28015, 29015], 65500, function (err, ports) {
                if (err) {
                  reject(err);
                }

                resolve(ports);
              });
            });

          case 2:
            ports = _context.sent;
            driverPort = server.port = ports[0];
            clusterPort = ports[1];


            server.portOffset = server.port - 28015;

            server.tmpFile = _tmp2.default.dirSync({ prefix: "rethinkmem-", unsafeCleanup: true });
            server.dbPath = server.dbPath || server.tmpFile.name;

            return _context.abrupt('return', {
              '--cluster-port': clusterPort,
              '--driver-port': driverPort,
              '-d': server.dbPath
            });

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getOptions() {
    return _ref.apply(this, arguments);
  };
}();

var start = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var options, consoleOptions;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!server.running) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return', server.running);

          case 2:
            _context2.next = 4;
            return getOptions();

          case 4:
            options = _context2.sent;


            server.tearDown = function () {
              server.process.stdin.pause();
              server.process.kill('SIGTERM');
              server.tmpFile.removeCallback();
            };

            consoleOptions = [];


            (0, _keys2.default)(options).forEach(function (option) {
              consoleOptions.push(option);
              consoleOptions.push(options[option]);
            });

            consoleOptions.push('--no-http-admin');

            server.process = spawn('rethinkdb', consoleOptions);

            return _context2.abrupt('return', new _promise2.default(function (resolve) {
              if (server.debug) {
                server.process.stderr.on('data', function (data) {
                  console.error(data.toString());
                });
              }

              server.process.stdout.on('data', function (data) {
                if (server.debug) {
                  console.log(data.toString());
                }

                if (data.toString().includes("Server ready")) {
                  server.running = true;
                  resolve(server.running);
                }
              });
            }));

          case 11:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function start() {
    return _ref2.apply(this, arguments);
  };
}();

var getConnectionParams = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    var db, options;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return (0, _v2.default)();

          case 2:
            db = _context5.sent.replace(/-/g, '_');
            options = {
              servers: [{
                host: 'localhost',
                port: server.port
              }]
            };
            return _context5.abrupt('return', new _promise2.default(function () {
              var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(resolve, reject) {
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _rethinkdb2.default.connect(options, function () {
                          var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(err, conn) {
                            return _regenerator2.default.wrap(function _callee3$(_context3) {
                              while (1) {
                                switch (_context3.prev = _context3.next) {
                                  case 0:
                                    _context3.next = 2;
                                    return _rethinkdb2.default.dbCreate(db).run(conn);

                                  case 2:

                                    resolve((0, _extends3.default)({
                                      db: db
                                    }, options));

                                  case 3:
                                  case 'end':
                                    return _context3.stop();
                                }
                              }
                            }, _callee3, this);
                          }));

                          return function (_x3, _x4) {
                            return _ref5.apply(this, arguments);
                          };
                        }());

                      case 1:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, undefined);
              }));

              return function (_x, _x2) {
                return _ref4.apply(this, arguments);
              };
            }()));

          case 5:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function getConnectionParams() {
    return _ref3.apply(this, arguments);
  };
}();

var server = {
  start: start,
  getConnectionParams: getConnectionParams,
  port: null,
  portOffset: null,
  dbPath: null,
  debug: false,
  tearDown: null,
  running: null,
  process: null
};

exports.default = server;
import uuid from 'uuid/v4';
import tmp from 'tmp';
import getport from 'get-port';
import rethinkdb from 'rethinkdb';
const {spawn} = require('child_process');
tmp.setGracefulCleanup();

const getPortOffset = pid => {
  const maxOffset = 65535 - 28015;
  return pid - (Math.floor(pid / maxOffset) * maxOffset)
};

let getOptions = async () => {
  server.portOffset = getPortOffset(process.pid);
  server.port = await getport(28015 + server.portOffset);
  server.tmpFile = tmp.dirSync({prefix: "rethinkmem-", unsafeCleanup: true});
  server.dbPath = server.dbPath || server.tmpFile.name;

  return {
    '-o': server.portOffset,
    '-d': server.dbPath,
  }
};

let start = async () => {
  if(server.running) {
    return server.running;
  }

  let options = await getOptions();

  server.tearDown = function () {
    server.tmpFile.removeCallback();
    if(this.process.connected) {
      this.process.kill();
    }
  };

  let consoleOptions = [];

  Object.keys(options).forEach(option => {
    consoleOptions.push(option);
    consoleOptions.push(options[option]);
  });

  server.process = await spawn('rethinkdb', consoleOptions);
  server.running = server.process.connected;

  return server.running;
};

let getConnectionParams = async () => {
  let db = (await uuid()).replace(/-/g, '_');
  let options = {
    servers: [
      {
        host: 'localhost',
        port: server.port,
      }
    ]
  };


  return new Promise(async (resolve, reject) => {
    rethinkdb.connect(options, async function(err, conn) {
      await rethinkdb.dbCreate(db).run(conn);
      console.log('created db: ' + db);

      resolve({
        db,
        ...options,
      });
    });
  });
};

let server = {
  start,
  getConnectionParams,
  port: null,
  portOffset: null,
  dbPath: null,
  debug: false,
  tearDown: null,
  running: null,
  process: null,
};

export default server;
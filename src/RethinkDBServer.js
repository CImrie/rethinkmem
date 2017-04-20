import uuid from 'uuid/v4';
import tmp from 'tmp';
import rethinkdb from 'rethinkdb';
const {spawn} = require('child_process');
import getPorts from 'get-ports';
tmp.setGracefulCleanup();


let getOptions = async () => {
  let ports = await new Promise((resolve, reject) => {
    getPorts([28015, 29015], 65500, (err, ports) => {
      if(err) {
        reject(err);
      }

      resolve(ports);
    });
  });

  let driverPort = server.port = ports[0];
  let clusterPort = ports[1];

  server.portOffset = server.port - 28015;

  server.tmpFile = tmp.dirSync({prefix: "rethinkmem-", unsafeCleanup: true});
  server.dbPath = server.dbPath || server.tmpFile.name;

  return {
    '--cluster-port': clusterPort,
    '--driver-port': driverPort,
    '-d': server.dbPath,
  }
};

let start = async () => {
  if(server.running) {
    return server.running;
  }

  let options = await getOptions();

  server.tearDown = function () {
    server.process.stdin.pause();
    server.process.kill('SIGTERM');
    server.tmpFile.removeCallback();
  };

  let consoleOptions = [];

  Object.keys(options).forEach(option => {
    consoleOptions.push(option);
    consoleOptions.push(options[option]);
  });

  consoleOptions.push('--no-http-admin');

  server.process = spawn('rethinkdb', consoleOptions);

  return new Promise((resolve) => {
    if(server.debug) {
      server.process.stderr.on('data', data => {
        console.error(data.toString());
      });
    }

    server.process.stdout.on('data', data => {
      if(server.debug) {
        console.log(data.toString());
      }

      if(data.toString().includes("Server ready")){
        server.running = true;
        resolve(server.running);
      }
    });
  });
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
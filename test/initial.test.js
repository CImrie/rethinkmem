import test from 'ava';
import { RethinkDBServer } from '../build';

test.before(async t => {
  await RethinkDBServer.start();
});

test('is connected', t => {
  t.pass();
});

test('can get connection string', async t => {
  let options = await RethinkDBServer.getConnectionParams();

  t.not(options.db, undefined);
  t.not(options.servers, undefined);
});

test.after.always(t => {
  RethinkDBServer.tearDown();
});
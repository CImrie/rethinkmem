import test from 'ava';
import { RethinkDBServer } from '../build';

test.before(async t => {
  await RethinkDBServer.start();
});

test.beforeEach(t => {
  console.log(RethinkDBServer.getConnectionParams());
});

test('is connected', t => {
  t.pass();
});

test.after.always(t => {
  RethinkDBServer.tearDown();
});
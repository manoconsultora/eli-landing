import assert from "node:assert/strict";
import test from "node:test";

import { startSequentialPolling } from "../src/components/SignupWizard/payment-polling.ts";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test("sequential poller never overlaps and stops when the attempt is approved", async () => {
  let calls = 0;
  let inFlight = 0;
  let maxInFlight = 0;
  let finish;
  const completed = new Promise((resolve) => { finish = resolve; });

  const stop = startSequentialPolling(async () => {
    calls += 1;
    inFlight += 1;
    maxInFlight = Math.max(maxInFlight, inFlight);
    await wait(10);
    inFlight -= 1;
    if (calls === 3) {
      finish();
      return false;
    }
    return true;
  }, 1);

  await Promise.race([completed, wait(500).then(() => { throw new Error("polling did not stop"); })]);
  stop();
  await wait(20);

  assert.equal(calls, 3);
  assert.equal(maxInFlight, 1);
});

test("stopping the poller during an in-flight request prevents another request", async () => {
  let calls = 0;
  const stop = startSequentialPolling(async () => {
    calls += 1;
    await wait(20);
    return true;
  }, 1);

  await wait(2);
  stop();
  await wait(30);

  assert.equal(calls, 1);
});

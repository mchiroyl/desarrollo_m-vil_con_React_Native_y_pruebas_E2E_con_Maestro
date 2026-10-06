import assert from 'node:assert/strict';
import test from 'node:test';

import { timeRangesOverlap } from '../../src/utils/time.ts';

test('detects overlapping appointment durations in either order', () => {
  assert.equal(timeRangesOverlap('09:00', 75, '10:00', 60), true);
  assert.equal(timeRangesOverlap('10:00', 60, '09:00', 75), true);
});

test('allows appointments whose end and start times touch', () => {
  assert.equal(timeRangesOverlap('09:00', 60, '10:00', 45), false);
});

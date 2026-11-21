import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RACE_DISTANCES,
  calculateTrainingPaces,
  formatCalculatorDecimal,
  formatCalculatorPace,
} from './pace-calculator';

test('calculateTrainingPaces computes 21K default 1:55:00 pace, speed, and Easy/Tempo/Interval zones in Indonesian format', () => {
  const res = calculateTrainingPaces('21K', 1, 55, 0, 'id');
  assert.equal(res.distanceKm, 21.1);
  assert.equal(res.totalSeconds, 6900);
  assert.equal(res.racePaceFormatted, '05:27/km');
  assert.equal(res.speedKmhFormatted, '11,0 km/jam');
  assert.equal(res.easyRange, '06:12 – 06:42/km');
  assert.equal(res.tempoRange, '05:22 – 05:32/km');
  assert.equal(res.intervalRange, '04:57 – 05:10/km');
});

test('calculateTrainingPaces differentiates Tempo offset for 5K, 10K, and 42K and supports English locale', () => {
  const res5k = calculateTrainingPaces('5K', 0, 25, 0, 'id');
  assert.equal(res5k.racePaceFormatted, '05:00/km');
  assert.equal(res5k.tempoRange, '05:10 – 05:20/km');
  assert.equal(res5k.intervalRange, '04:35 – 04:48/km');

  const res42k = calculateTrainingPaces('42K', 4, 10, 0, 'en');
  assert.equal(res42k.speedKmhFormatted, '10.1 km/h');
  assert.equal(formatCalculatorDecimal(RACE_DISTANCES['42K'].km, 2, 'id'), '42,20');
  assert.equal(formatCalculatorDecimal(RACE_DISTANCES['42K'].km, 2, 'en'), '42.20');
});

test('formatCalculatorPace clamps extreme lower/upper bounds cleanly', () => {
  assert.equal(formatCalculatorPace(30), '01:30/km');
  assert.equal(formatCalculatorPace(2500), '30:00/km');
});

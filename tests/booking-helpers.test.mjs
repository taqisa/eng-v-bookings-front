import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

async function loadHelper(path) {
  const code = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { safeBookingRedirect } = await loadHelper('../src/lib/bookingNavigation.ts');
const { clockParts, groupTimeSlots } = await loadHelper('../src/lib/timeSlots.ts');

test('authentication redirects stay inside the provider booking flow', () => {
  for (const value of [null, '//evil.test', '/\\evil.test', 'https://evil.test', '/account', '/book/foo\n', '/book/foo/../../account', '/auth']) assert.equal(safeBookingRedirect(value), '/');
  for (const value of ['/book/willow-studio', '/booking/provider-1', '/booking-confirmation/provider-1?bookingId=123']) assert.equal(safeBookingRedirect(value), value);
});
test('appointment clocks handle midnight, noon, 24-hour and backend Arabic values', () => {
  assert.equal(clockParts('12:00 AM').minutes, 0);
  assert.equal(clockParts('12:00 PM').minutes, 720);
  assert.equal(clockParts('13:30:00').minutes, 810);
  assert.equal(clockParts('٠٩:٣٠ ص').minutes, 570);
  assert.equal(clockParts('٩:٣٠ م').period, 'PM');
  for (const value of ['24:00', '12:60', '13:00 PM', 'unknown']) assert.equal(clockParts(value), null);
});
test('available times are deduplicated and ordered into English day periods', () => {
  assert.deepEqual(groupTimeSlots(['6:00 PM', '9:00 AM', '1:00 PM', '9:00 AM']).map(g => [g.title, g.slots]), [
    ['Morning', ['9:00 AM']], ['Afternoon', ['1:00 PM']], ['Evening', ['6:00 PM']],
  ]);
});

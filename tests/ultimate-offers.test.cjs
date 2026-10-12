'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { window: {}, Math: Object.create(Math) };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/survivors/ultimate-offers.js'), 'utf8'), context);
const offers = context.window.SurvivorUltimateOffers;
const ultimate = id => ({kind: 'ultimate', id});
const ordinary = id => ({kind: 'weapon', id});
const ids = choices => Array.from(choices, choice => choice.id);
context.Math.random = () => 0;

// Simultaneous eligibility follows acquisition, not catalogue ordering.
offers.noteAcquired('b');
offers.noteAcquired('a');
const choices = [ultimate('a'), ultimate('b'), ordinary('x'), ordinary('y'), ordinary('z')];
assert.deepEqual(ids(offers.pick(choices)), ['b', 'a', 'x']);
context.Math.random = () => .999999;
assert.deepEqual(ids(offers.pick(choices)), ['b', 'z', 'y']);
// Declining preserves the head; acquiring removes it on the next level.
assert.equal(offers.pick(choices)[0].id, 'b');
assert.equal(offers.pick(choices.filter(choice => choice.id !== 'b'))[0].id, 'a');

// Earlier readiness beats earlier acquisition; refresh observes reward mutations.
offers.reset();
offers.noteAcquired('a');
offers.noteAcquired('b');
offers.refresh([ultimate('b')]);
assert.equal(offers.pick([ultimate('a'), ultimate('b')])[0].id, 'b');
assert.equal(offers.pick([ultimate('a')])[0].id, 'a');
// Always return current card data, including across several pending levels.
const fresh = {kind: 'ultimate', id: 'a', label: 'fresh'};
assert.equal(offers.pick([fresh])[0], fresh);
assert.equal(offers.pick([ordinary('x')])[0].kind, 'weapon');

// No eligible ultimate: preserve uniform draws without replacement.
offers.reset();
const ordinaryChoices = ['x', 'y', 'z'].map(ordinary);
for (const [rng, expected] of [[0, 'x'], [.4, 'y'], [.9, 'z']]) {
  context.Math.random = () => rng;
  assert.equal(offers.pick(ordinaryChoices, 1)[0].id, expected);
}
assert.equal(new Set(ids(offers.pick([...ordinaryChoices, ordinary('x')]))).size, 3);
assert.equal(offers.pick([ultimate('a'), ultimate('a'), ordinary('x')]).length, 2);
assert.equal(offers.pick(choices, 0).length, 0);
assert.equal(offers.pick([]).length, 0);
// Reset clears eligibility history and acquisition tie breakers.
offers.reset();
assert.equal(offers.pick([ultimate('a'), ultimate('b')])[0].id, 'a');
console.log('PASS ultimate slot, rerolls, eligibility queue, freshness, ordinary randomness, deduplication, reset');

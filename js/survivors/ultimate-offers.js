/* Deterministic ultimate priority beside the ordinary uniform upgrade draw. */
'use strict';
window.SurvivorUltimateOffers = (() => {
  let queue = [];
  const acquired = new Map();
  let nextAcquisition = 0;

  function reset() {
    queue = [];
    acquired.clear();
    nextAcquisition = 0;
  }

  // Call at actual acquisition so class skills and common weapons share an order.
  function noteAcquired(id) {
    if (!acquired.has(id)) acquired.set(id, nextAcquisition++);
  }

  function refresh(choices) {
    const eligible = new Map();
    for (const choice of choices) {
      if (choice.kind === 'ultimate' && !eligible.has(choice.id)) eligible.set(choice.id, choice);
    }
    // Eligibility is supplied by the caller; discard acquired or stale ultimates.
    queue = queue.filter(id => eligible.has(id));
    const waiting = new Set(queue);
    const newlyReady = [...eligible.keys()].filter(id => !waiting.has(id));
    newlyReady.sort((a, b) => (acquired.get(a) ?? Infinity) - (acquired.get(b) ?? Infinity));
    queue.push(...newlyReady);
    return eligible;
  }

  function pick(choices, count = 3) {
    const eligible = refresh(choices);
    const limit = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 3;
    const picked = [];
    if (limit && queue.length) picked.push(eligible.get(queue[0]));

    // Rerolls preserve the queue head. All other legal upgrades, including other
    // ultimates, remain uniformly random without replacing the reserved card.
    const seen = new Set();
    const pool = choices.filter(choice => {
      if (choice.kind === 'ultimate' && picked[0]?.id === choice.id) return false;
      const key = choice.kind + ':' + choice.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    while (picked.length < limit && pool.length) {
      picked.push(pool.splice(Math.floor((window.SurvivorRunRng?SurvivorRunRng.random('offers'):Math.random()) * pool.length), 1)[0]);
    }
    return picked;
  }

  return { reset, noteAcquired, refresh, pick };
})();

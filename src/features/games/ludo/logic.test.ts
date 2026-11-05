import {
  TRACK,
  START_INDEX,
  HOME_COLUMN,
  SAFE_TRACK_INDICES,
  FINISHED,
  createInitialTokens,
  getMovableTokens,
  applyMove,
  evaluateRoll,
  chooseBotMove,
  progressToCell,
  checkWinner,
  rollDice,
  COLOR_ORDER,
  type LudoColor,
  type LudoToken,
} from './logic';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`Assertion failed [${message}]: expected ${e}, got ${a}`);
  }
}

function assertTrue(cond: boolean, message: string): void {
  if (!cond) throw new Error(`Assertion failed [${message}]`);
}

/** Builds a full 4-colour token set, overriding progress per colour. */
function make(overrides: Partial<Record<LudoColor, number[]>>): LudoToken[] {
  const tokens = createInitialTokens(COLOR_ORDER);
  Object.entries(overrides).forEach(([color, list]) => {
    (list as number[]).forEach((p, i) => {
      const t = tokens.find((x) => x.id === `${color}-${i}`) as LudoToken;
      t.progress = p;
    });
  });
  return tokens;
}

export function runLudoLogicTests(): void {
  // Track shape
  assertEqual(TRACK.length, 52, 'track has 52 cells');
  assertEqual(new Set(TRACK.map((c) => `${c.row},${c.col}`)).size, 52, 'track cells unique');
  assertEqual(SAFE_TRACK_INDICES.length, 8, '8 safe squares');

  // Start cell mapping per colour
  assertEqual(START_INDEX, { red: 0, green: 13, yellow: 26, blue: 39 }, 'start indices');
  assertEqual(progressToCell('red', 1), { row: 6, col: 1 }, 'red start cell');
  assertEqual(progressToCell('green', 1), { row: 1, col: 8 }, 'green start cell');
  assertEqual(progressToCell('yellow', 1), { row: 8, col: 13 }, 'yellow start cell');
  assertEqual(progressToCell('blue', 1), { row: 13, col: 6 }, 'blue start cell');
  assertEqual(progressToCell('red', 52), HOME_COLUMN.red[0], 'red home column entry');
  assertEqual(progressToCell('red', 56), { row: 7, col: 5 }, 'red last home column cell');
  assertEqual(progressToCell('red', 0), null, 'yard has no cell');
  assertEqual(progressToCell('red', FINISHED), null, 'finished has no cell');

  // Yard needs a 6
  const fresh = createInitialTokens(COLOR_ORDER);
  assertEqual(getMovableTokens(fresh, 'red', 5), [], 'no move from yard on 5');
  assertEqual(getMovableTokens(fresh, 'red', 6).length, 4, 'all 4 can leave on 6');
  const out = applyMove(fresh, 'red-0', 6);
  assertTrue(out !== null && out.to === 1 && out.leftYard, 'token leaves yard to progress 1');
  assertEqual(applyMove(fresh, 'red-0', 3), null, 'illegal yard move rejected');

  // Capture on a plain cell: red 3 + 3 -> progress 6 (track 5); green 45 -> track 5
  const cap = applyMove(make({ red: [3], green: [45] }), 'red-0', 3);
  assertTrue(cap !== null, 'capture move legal');
  assertEqual(cap!.captured, ['green-0'], 'single opponent captured');
  assertEqual(cap!.tokens.find((t) => t.id === 'green-0')!.progress, 0, 'captured token to yard');
  assertTrue(cap!.extraTurn, 'capture grants extra turn');

  // Safe star cell: red 6 + 3 -> progress 9 (track 8, a star); green 48 -> track 8
  const safe = applyMove(make({ red: [6], green: [48] }), 'red-0', 3);
  assertEqual(safe!.captured, [], 'no capture on star cell');
  // Opponent start cell: red 13 + 1 -> progress 14 (track 13 = green start)
  const safe2 = applyMove(make({ red: [13], green: [1] }), 'red-0', 1);
  assertEqual(safe2!.captured, [], 'no capture on start cell');

  // Block: two green tokens on the same plain cell are not captured
  const block = applyMove(make({ red: [3], green: [45, 45] }), 'red-0', 3);
  assertEqual(block!.captured, [], 'block cannot be captured');

  // Exact finish and overshoot
  const fin = applyMove(make({ red: [52] }), 'red-0', 5);
  assertTrue(fin !== null && fin.to === FINISHED && fin.reachedHome, 'exact roll finishes');
  assertTrue(fin!.extraTurn, 'reaching home grants extra turn');
  assertEqual(getMovableTokens(make({ red: [55] }), 'red', 3), [], 'overshoot not allowed');
  assertEqual(applyMove(make({ red: [55] }), 'red-0', 3), null, 'overshoot move rejected');
  assertEqual(getMovableTokens(make({ red: [56] }), 'red', 1), ['red-0'], '56 + 1 finishes');

  // Extra turn on 6, none on plain roll
  assertTrue(applyMove(make({ red: [10] }), 'red-0', 6)!.extraTurn, 'six grants extra turn');
  assertTrue(!applyMove(make({ red: [10] }), 'red-0', 4)!.extraTurn, 'plain roll no extra turn');

  // Three sixes rule
  assertEqual(evaluateRoll(0, 6), { consecutiveSixes: 1, cancelled: false }, 'first six');
  assertEqual(evaluateRoll(1, 6), { consecutiveSixes: 2, cancelled: false }, 'second six');
  assertEqual(evaluateRoll(2, 6), { consecutiveSixes: 0, cancelled: true }, 'third six cancels');
  assertEqual(evaluateRoll(2, 6, false), { consecutiveSixes: 3, cancelled: false }, 'setting off');
  assertEqual(evaluateRoll(2, 4), { consecutiveSixes: 0, cancelled: false }, 'non-six resets');

  // Bot prefers capture over advancing the front-most token
  const botTokens = make({ red: [3, 40], green: [45] });
  assertEqual(chooseBotMove(botTokens, 'red', 3), 'red-0', 'bot prefers capture');
  // Bot leaves yard on a six when nothing better
  assertEqual(chooseBotMove(make({ red: [0, 20] }), 'red', 6) !== null, true, 'bot picks a move');
  assertEqual(chooseBotMove(make({ red: [0, 0, 0, 0] }), 'red', 2), null, 'bot has no move');

  // Winner
  assertEqual(checkWinner(make({ red: [57, 57, 57, 57] }), COLOR_ORDER), 'red', 'all home wins');
  assertEqual(checkWinner(make({ red: [57, 57, 57, 56] }), COLOR_ORDER), null, 'three home no win');

  for (let i = 0; i < 100; i += 1) {
    const r = rollDice();
    assertTrue(r >= 1 && r <= 6 && Number.isInteger(r), 'dice in 1..6');
  }

  console.log('All Ludo logic tests passed!');
}

runLudoLogicTests();

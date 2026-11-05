import {
  squareToCell,
  cellToSquare,
  rollDice,
  applyMove,
  shouldGrantExtraTurn,
  buildWalkSquares,
  formatMoveLog,
  LADDERS,
  SNAKES,
} from './logic';

function assertEqual<T>(actual: T, expected: T, message: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`Assertion failed [${message}]: expected ${e}, got ${a}`);
  }
}

function assertTrue(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed [${message}]: expected true, got false`);
  }
}

export function runSnakesLogicTests(): void {
  // 1. Serpentine board mapping
  // Square 1 -> bottom-left (row 9, col 0)
  assertEqual(
    squareToCell(1),
    { row: 9, col: 0 },
    'Square 1 is bottom-left (row 9, col 0)',
  );

  // Square 10 -> bottom-right (row 9, col 9)
  assertEqual(
    squareToCell(10),
    { row: 9, col: 9 },
    'Square 10 is bottom-right (row 9, col 9)',
  );

  // Square 11 -> directly above 10 (row 8, col 9)
  assertEqual(
    squareToCell(11),
    { row: 8, col: 9 },
    'Square 11 is above 10 (row 8, col 9)',
  );

  // Square 20 -> directly above 1 (row 8, col 0)
  assertEqual(
    squareToCell(20),
    { row: 8, col: 0 },
    'Square 20 is above 1 (row 8, col 0)',
  );

  // Square 21 -> above 20 (row 7, col 0)
  assertEqual(
    squareToCell(21),
    { row: 7, col: 0 },
    'Square 21 is above 20 (row 7, col 0)',
  );

  // Square 91 -> top-right (row 0, col 9)
  assertEqual(
    squareToCell(91),
    { row: 0, col: 9 },
    'Square 91 is top-right (row 0, col 9)',
  );

  // Square 100 -> top-left (row 0, col 0)
  assertEqual(
    squareToCell(100),
    { row: 0, col: 0 },
    'Square 100 is top-left (row 0, col 0)',
  );

  // Round-trip all 100 squares between squareToCell and cellToSquare
  for (let sq = 1; sq <= 100; sq += 1) {
    const { row, col } = squareToCell(sq);
    assertEqual(
      cellToSquare(row, col),
      sq,
      `Round-trip squareToCell/cellToSquare for square ${sq}`,
    );
  }

  // 2. Exact finish & overshoot handling
  assertEqual(
    applyMove(98, 2),
    { from: 98, to: 100, landed: 100, via: null, won: true },
    'Exact roll from 98 + 2 reaches 100 and wins',
  );

  assertEqual(
    applyMove(98, 5),
    { from: 98, to: 98, landed: 98, via: null, won: false },
    'Overshoot from 98 + 5 stays on 98',
  );

  assertEqual(
    applyMove(95, 6),
    { from: 95, to: 95, landed: 95, via: null, won: false },
    'Overshoot from 95 + 6 stays on 95',
  );

  // 3. Ladder transitions
  assertEqual(
    applyMove(1, 2),
    { from: 1, to: 22, landed: 3, via: 'ladder', won: false },
    'Landing on ladder bottom 3 climbs to 22',
  );

  assertEqual(
    applyMove(4, 4),
    { from: 4, to: 30, landed: 8, via: 'ladder', won: false },
    'Landing on ladder bottom 8 climbs to 30',
  );

  assertEqual(
    applyMove(24, 4),
    { from: 24, to: 55, landed: 28, via: 'ladder', won: false },
    'Landing on ladder bottom 28 climbs to 55',
  );

  assertEqual(
    applyMove(55, 3),
    { from: 55, to: 77, landed: 58, via: 'ladder', won: false },
    'Landing on ladder bottom 58 climbs to 77',
  );

  // 4. Snake transitions
  assertEqual(
    applyMove(49, 3),
    { from: 49, to: 31, landed: 52, via: 'snake', won: false },
    'Landing on snake head 52 slides to 31',
  );

  assertEqual(
    applyMove(61, 4),
    { from: 61, to: 44, landed: 65, via: 'snake', won: false },
    'Landing on snake head 65 slides to 44',
  );

  assertEqual(
    applyMove(92, 5),
    { from: 92, to: 74, landed: 97, via: 'snake', won: false },
    'Landing on snake head 97 slides to 74',
  );

  // Also verify custom ladder/snake map works with prompt-spec numbers
  const promptLadders = { 3: 22, 8: 30, 28: 84, 58: 77, 75: 96 };
  const promptSnakes = { 17: 4, 54: 34, 62: 19, 87: 36, 95: 73, 98: 79 };
  assertEqual(
    applyMove(14, 3, promptLadders, promptSnakes),
    { from: 14, to: 4, landed: 17, via: 'snake', won: false },
    'Custom snake 17 -> 4 slides correctly',
  );
  assertEqual(
    applyMove(72, 3, promptLadders, promptSnakes),
    { from: 72, to: 96, landed: 75, via: 'ladder', won: false },
    'Custom ladder 75 -> 96 climbs correctly',
  );

  // 5. Dice bounds & extra turn on 6
  for (let i = 0; i < 100; i += 1) {
    const r = rollDice();
    assertTrue(r >= 1 && r <= 6 && Number.isInteger(r), `rollDice result ${r} in 1..6`);
  }
  assertTrue(shouldGrantExtraTurn(6, false, true), 'Rolling 6 grants extra turn when enabled');
  assertTrue(!shouldGrantExtraTurn(6, false, false), 'Rolling 6 does not grant extra turn when disabled');
  assertTrue(!shouldGrantExtraTurn(6, true, true), 'Rolling 6 on winning move does not grant extra turn');
  assertTrue(!shouldGrantExtraTurn(5, false, true), 'Rolling 5 does not grant extra turn');

  // 6. Walk path and log formatting
  const ladderWalk = buildWalkSquares(applyMove(1, 2));
  assertEqual(
    ladderWalk,
    { walkSquares: [2, 3], slideTo: 22 },
    'buildWalkSquares for 1 + 2 -> 3 (ladder to 22)',
  );

  assertEqual(
    formatMoveLog('Kabir', 4, applyMove(7, 4)),
    'Kabir rolled 4 and moved from 7 → 11.',
    'Standard move log matches Figma text',
  );

  // Verify board integrity: all ladders go up, all snakes go down
  for (const [bottomStr, top] of Object.entries(LADDERS)) {
    const bottom = Number(bottomStr);
    assertTrue(top > bottom, `Ladder ${bottom} -> ${top} goes up`);
  }
  for (const [headStr, tail] of Object.entries(SNAKES)) {
    const head = Number(headStr);
    assertTrue(tail < head, `Snake ${head} -> ${tail} goes down`);
  }

  console.log('All Snakes & Ladders logic tests passed!');
}

runSnakesLogicTests();

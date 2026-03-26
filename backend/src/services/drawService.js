const Winner = require("../models/Winner");

const MIN_MATCHES_TO_WIN = 3;

// Count unique matches between entry numbers and winning numbers.
const countMatches = (arr1, arr2) => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  let count = 0;

  for (const num of set1) {
    if (set2.has(num)) count += 1;
  }

  return count;
};

// Main winner calculation logic.
const calculateWinners = async (draw, entries, options = {}) => {
  const winningNumbers = draw.winningNumbers;
  const totalPool = draw.totalPool;

  // Prize splits.
  let prizePool = {
    match5: totalPool * 0.4,
    match4: totalPool * 0.35,
    match3: totalPool * 0.25,
  };

  // Winners grouped by match count.
  const winners = {
    match5: [],
    match4: [],
    match3: [],
  };

  for (const entry of entries) {
    const matchCount = countMatches(entry.numbers, winningNumbers);

    if (matchCount < MIN_MATCHES_TO_WIN) continue;
    if (matchCount === 5) winners.match5.push(entry);
    else if (matchCount === 4) winners.match4.push(entry);
    else if (matchCount === 3) winners.match3.push(entry);
  }

  // Handle rollover for empty categories.
  let rollover = 0;

  if (winners.match5.length === 0) {
    rollover += prizePool.match5;
    prizePool.match5 = 0;
  }

  if (winners.match4.length === 0) {
    rollover += prizePool.match4;
    prizePool.match4 = 0;
  }

  if (winners.match3.length === 0) {
    rollover += prizePool.match3;
    prizePool.match3 = 0;
  }

  const distribute = (pool, winnerList) => {
    if (winnerList.length === 0) return [];
    const prizeEach = pool / winnerList.length;

    return winnerList.map((entry) => ({
      userId: entry.userId,
      drawId: draw._id,
      position:
        winnerList === winners.match5
          ? 1
          : winnerList === winners.match4
          ? 2
          : 3,
      prize: prizeEach,
    }));
  };

  const finalWinners = [
    ...distribute(prizePool.match5, winners.match5),
    ...distribute(prizePool.match4, winners.match4),
    ...distribute(prizePool.match3, winners.match3),
  ];

  if (finalWinners.length > 0) {
    await Winner.insertMany(finalWinners, { session: options.session });
  }

  return {
    winners: finalWinners,
    prizeDistribution: prizePool,
    rolloverAmount: rollover,
  };
};

module.exports = calculateWinners;
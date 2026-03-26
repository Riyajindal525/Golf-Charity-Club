const mongoose = require("mongoose");
const Draw = require("../models/Draw");
const Entry = require("../models/Entry");
const calculateWinners = require("../services/drawService");
const { calculatePool, saveCharity } = require("../services/poolService");

// Generate 5 unique random numbers (1-45)
const generateNumbers = () => {
  const nums = new Set();

  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(nums);
};

// Run Draw
exports.runDraw = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let responsePayload;

    await session.withTransaction(async () => {
      const existing = await Draw.findOne({ month, year }).session(session);
      if (existing) {
        throw new Error("DRAW_ALREADY_EXISTS");
      }

      const pool = await calculatePool(month, year, { session });
      const winningNumbers = generateNumbers();

      const [draw] = await Draw.create(
        [
          {
            month,
            year,
            winningNumbers,
            totalPool: pool.prizePool,
            charityAmount: pool.charityAmount,
            status: "pending",
          },
        ],
        { session }
      );

      await saveCharity(draw._id, pool.charityAmount, { session });

      const entries = await Entry.find({
        drawMonth: month,
        drawYear: year,
      }).session(session);

      const result = await calculateWinners(draw, entries, { session });

      draw.results = result.winners.map((winner) => ({
        userId: winner.userId,
        position: winner.position,
        prize: winner.prize,
      }));
      draw.rolloverAmount = result.rolloverAmount;
      draw.status = "completed";
      await draw.save({ session });

      responsePayload = {
        message: "Draw completed",
        winningNumbers,
        totalCollection: pool.totalCollection,
        charity: pool.charityAmount,
        prizePool: pool.prizePool,
        winners: result.winners,
        rollover: result.rolloverAmount,
      };
    });

    return res.json(responsePayload);
  } catch (error) {
    if (error.message === "DRAW_ALREADY_EXISTS") {
      return res.status(400).json({ message: "Draw already exists" });
    }

    return res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

// Get Draw Results
exports.getResults = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });
    res.json(draws);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
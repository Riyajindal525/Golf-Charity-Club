const User = require("../models/User");
const Draw = require("../models/Draw");
const Winner = require("../models/Winner");
const Subscription = require("../models/Subscription");

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    const userIds = users.map((user) => user._id);
    const now = new Date();

    const activeSubscriptions = await Subscription.find({
      userId: { $in: userIds },
      status: "active",
      renewalDate: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .lean();

    const activeSubByUserId = new Map();
    for (const sub of activeSubscriptions) {
      const key = String(sub.userId);
      if (!activeSubByUserId.has(key)) {
        activeSubByUserId.set(key, {
          active: true,
          plan: sub.plan,
          renewalDate: sub.renewalDate,
        });
      }
    }

    const usersWithSubscription = users.map((user) => {
      const subscription = activeSubByUserId.get(String(user._id));
      return {
        ...user,
        subscription: subscription || { active: false },
      };
    });

    return res.json(usersWithSubscription);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all draws
exports.getDraws = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });
    return res.json(draws);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get all winners
exports.getWinners = async (req, res) => {
  try {
    const winners = await Winner.find()
      .populate("userId", "name email")
      .populate("drawId");

    return res.json(winners);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
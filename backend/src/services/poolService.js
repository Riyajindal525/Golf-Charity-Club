const Subscription = require("../models/Subscription");
const Charity = require("../models/Charity");

// 💰 Calculate pool
const calculatePool = async (month, year, options = {}) => {
  const now = new Date();

  // Count only active and unexpired subscriptions.
  const subs = await Subscription.find({
    status: "active",
    renewalDate: { $gt: now },
  }).session(options.session || null);

  const totalUsers = subs.length;

  // 👉 define pricing (can move to config later)
  const monthlyPrice = 100;

  const totalCollection = totalUsers * monthlyPrice;

  // ❤️ charity 10%
  const charityAmount = totalCollection * 0.1;

  // 🎯 prize pool
  const prizePool = totalCollection - charityAmount;

  return {
    totalUsers,
    totalCollection,
    charityAmount,
    prizePool,
  };
};

// ❤️ Store charity
const saveCharity = async (drawId, charityAmount, options = {}) => {
  return await Charity.create({
    drawId,
    amount: charityAmount,
    percentage: 10,
  }, options);
};

module.exports = {
  calculatePool,
  saveCharity,
};
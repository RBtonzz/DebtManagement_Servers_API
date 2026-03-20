const User = require('../models/User');
const Debtor = require('../models/Debtor');

// GET /api/public/summary
const getPublicSummary = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id username');
    const allDebtors = await Debtor.find({ isActive: true });

    const summaries = admins.map((admin) => {
      const owned = allDebtors.filter(d => {
        if (d.owner) return String(d.owner) === String(admin._id);
        // Legacy (no owner): attribute to admin whose username matches first transaction's createdBy
        const firstTx = d.transactions[0];
        return firstTx?.createdBy === admin.username;
      });

      const totalDebt = owned.reduce((s, d) => s + d.totalDebt, 0);
      const activeDebtors = owned.filter(d => d.totalDebt > 0).length;

      return {
        adminId: admin._id,
        username: admin.username,
        totalDebtors: owned.length,
        activeDebtors,
        totalDebt,
        debtors: owned.map(d => ({ _id: d._id, name: d.name, totalDebt: d.totalDebt }))
      };
    });

    res.json(summaries.filter(s => s.totalDebtors > 0));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPublicSummary };

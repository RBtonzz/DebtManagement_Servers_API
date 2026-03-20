const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['add', 'pay'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'transfer'], default: 'cash' },
  note: { type: String, default: '' },
  createdBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const debtorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  note: { type: String, default: '' },
  transactions: [transactionSchema],
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

debtorSchema.virtual('totalDebt').get(function() {
  return this.transactions.reduce((sum, t) => {
    return t.type === 'add' ? sum + t.amount : sum - t.amount;
  }, 0);
});

debtorSchema.set('toJSON', { virtuals: true });
debtorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Debtor', debtorSchema);

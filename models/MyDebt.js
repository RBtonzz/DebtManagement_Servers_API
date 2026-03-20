const mongoose = require('mongoose');

const myTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['add', 'pay'], required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'transfer'], default: 'cash' },
  note: { type: String, default: '' },
  createdBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const myDebtSchema = new mongoose.Schema({
  creditorName: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  note: { type: String, default: '' },
  transactions: [myTransactionSchema],
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

myDebtSchema.virtual('totalDebt').get(function() {
  return this.transactions.reduce((sum, t) => {
    return t.type === 'add' ? sum + t.amount : sum - t.amount;
  }, 0);
});

myDebtSchema.set('toJSON', { virtuals: true });
myDebtSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MyDebt', myDebtSchema);

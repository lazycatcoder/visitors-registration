const mongoose = require('mongoose');
const moment = require('moment');


const visitorSchema = new mongoose.Schema({
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  category: { type: String, default: null },
  arrivalDate: { type: String, default: Date.now },
  arrivalTime: { type: String, default: null },
  leavingDate: { type: String, default: null },
  leavingTime: { type: String, default: null },
  totalTime: { type: String, default: null },
  createdAt: { type: String, default: moment().format('YYYY-MM-DD, HH:mm:ss') },
  updatedAt: { type: String, default: moment().format('YYYY-MM-DD, HH:mm:ss') },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Fields that can be updated
visitorSchema.statics.editableFields = ['firstName', 'lastName', 'category', 'arrivalDate', 'arrivalTime', 'leavingDate', 'leavingTime', 'totalTime', 'updatedAt'];


const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
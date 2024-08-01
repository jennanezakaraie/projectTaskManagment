const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({

  inviterID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  inviteeID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date, default: Date.now },
});

const Invitation = mongoose.model('Invitation', invitationSchema);
module.exports = Invitation;
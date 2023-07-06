const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  superuser: { type: Number, default: 0 },
  accessToken: { type: String, default: '' },
});


// Password hashing before user save
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const rounds = 10;
  bcrypt.genSalt(rounds, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }

      this.password = hash;
      next();
    });
  });
});


// Comparing a password with a hash
userSchema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      resolve(isMatch);
    });
  });
};


const User = mongoose.model('User', userSchema);

module.exports = User;
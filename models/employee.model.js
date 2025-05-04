const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  gender: {
    type: String,
    enum: ['Male', 'Female']
  },
  profileImage: String,
  isDelete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;

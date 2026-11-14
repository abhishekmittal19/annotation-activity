const { User } = require("../models/user.model");

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id);
  }

  async create(data) {
    return await User.create(data);
  }

  async findAll() {
    return await User.find().select("-password -otpHash -otpExpiresAt").lean();
  }
}

module.exports = { UserRepository };

const { User } = require("../models/user.model");

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async create(data) {
    return await User.create(data);
  }
}

module.exports = { UserRepository };

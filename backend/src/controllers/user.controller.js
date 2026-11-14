const { UserRepository } = require("../repositories/user.repository");

const repository = new UserRepository();

const getUsers = async (req, res) => {
  try {
    const users = await repository.findAll();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = { getUsers };

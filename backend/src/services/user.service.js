const { UserRepository } = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createHash, randomInt } = require("crypto");
const { sendOtpEmail } = require("../utils/email");

class UserService {
  #repository = new UserRepository();

  async register(data) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.#repository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const otp = randomInt(100000, 1000000).toString();

    const otpHash = createHash("sha256").update(otp).digest("hex");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await sendOtpEmail(email, otp);

    return this.#repository.create({
      ...data,
      email,
      password: hashedPassword,
      emailVerified: false,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
  }

  async verifyOtp(emailInput, otpInput) {
    const email = emailInput.trim().toLowerCase();

    const user = await this.#repository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid OTP or email");
    }

    if (user.emailVerified) {
      return { message: "Email already verified" };
    }

    if (
      !user.otpHash ||
      !user.otpExpiresAt ||
      user.otpExpiresAt.getTime() < Date.now()
    ) {
      throw new Error("OTP expired or invalid");
    }

    const submittedHash = createHash("sha256")
      .update(otpInput.trim())
      .digest("hex");

    if (submittedHash !== user.otpHash) {
      throw new Error("OTP expired or invalid");
    }

    user.emailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    return { message: "Email verified successfully" };
  }

  async login(data) {
    
    const email = data.email.trim().toLowerCase();

    const mockUsers = {
      "admin@aurora.ai": {
        id: "mock-admin-id",
        name: "Admin Connor",
        email: "admin@aurora.ai",
        password: "password123",
        role: "admin",
      },
      "manager@aurora.ai": {
        id: "mock-manager-id",
        name: "Manager Vance",
        email: "manager@aurora.ai",
        password: "password123",
        role: "manager",
      },
      "annotator@aurora.ai": {
        id: "mock-annotator-id",
        name: "Annotator Alex",
        email: "annotator@aurora.ai",
        password: "password123",
        role: "annotator",
      },
      "reviewer@aurora.ai": {
        id: "mock-reviewer-id",
        name: "Reviewer Elena",
        email: "reviewer@aurora.ai",
        password: "password123",
        role: "reviewer",
      },
    };

    const mockUser = mockUsers[email];

    if (mockUser) {
      if (data.password !== mockUser.password) {
        throw new Error("Invalid email or password");
      }

      const token = jwt.sign(
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      );

      return {
        token,
        user: {
          _id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      };
    }

    // Existing database login
    const user = await this.#repository.findByEmail(email);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new Error("Invalid email or password");
    }

    if (!user.emailVerified) {
      throw new Error("Please verify your email before logging in");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return { token, user };
  }
}

module.exports = { UserService };

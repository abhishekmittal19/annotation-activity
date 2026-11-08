import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomInt } from "crypto";
import { sendOtpEmail } from "../utils/email";

export class UserService {
  #repository = new UserRepository();

  async register(data) {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.#repository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const otp = randomInt(100000, 1000000).toString();
    console.log(otp);
    const otpHash = createHash("sha256").update(otp).digest("hex");
    console.log(otpHash);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Send OTP to the email entered in the registration form.
    await sendOtpEmail(email, otp);

    return this.repository.create({
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
    console.log(user);

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

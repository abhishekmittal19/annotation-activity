import { UserRepository } from "../repositories/user.repository";
import { CreateUserDto } from "../dtos/CreateUserDto";
import bcrypt from "bcrypt";
import { LoginDto } from "../dtos/LoginDto";
import jwt from "jsonwebtoken";
import { createHash, randomInt } from "crypto";
import { sendOtpEmail } from "../utils/email";

export class UserService {
  private repository = new UserRepository();

  async register(data: CreateUserDto) {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.repository.findByEmail(email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = createHash("sha256").update(otp).digest("hex");
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
    } as CreateUserDto);
  }

  async verifyOtp(emailInput: string, otpInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await this.repository.findByEmail(email);

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

  async login(data: LoginDto) {
    const email = data.email.trim().toLowerCase();
    const user = await this.repository.findByEmail(email);

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
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    );

    return { token, user };
  }
}

import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { LoginDto } from "../dtos/LoginDto";
import jwt from "jsonwebtoken";

export class UserService {
  private repository = new UserRepository();

  async register(data: CreateUserDto) {
    const existingUser = await this.repository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.repository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async login(data: LoginDto) {
    console.log("LOGIN EMAIL:", data.email);

    const user = await this.repository.findByEmail(data.email);

    console.log("USER FOUND:", !!user);

    if (user) {
      console.log("DATABASE EMAIL:", user.email);
    }

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    console.log("PASSWORD VALID:", isPasswordValid);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "24h",
      },
    );

    return {
      token,
      user,
    };
  }
}

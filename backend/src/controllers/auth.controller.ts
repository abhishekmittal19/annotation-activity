import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { LoginDto } from "../dtos/LoginDto";

const service = new UserService();

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: "A valid email and 6-digit OTP are required",
      });
    }

    const result = await service.verifyOtp(email, otp);
    return res.status(200).json(result);
  } catch (error: any) {
    if (
      error.message === "Invalid OTP or email" ||
      error.message === "OTP expired or invalid"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("OTP VERIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const user = await service.register(req.body);

    return res.status(201).json({
      message:
        "Registration successful. Please verify your email using the OTP sent to you.",
      email: user.email,
    });
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const credentials: LoginDto = req.body;

    const result = await service.login(credentials);

    return res.json({
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    if (error?.message === "Invalid email or password") {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (error?.message === "Please verify your email before logging in") {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

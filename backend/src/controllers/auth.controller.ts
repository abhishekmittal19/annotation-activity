import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { LoginDto } from "../dtos/LoginDto";

const service = new UserService();

export const register = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    console.log(req.body);
    const user = await service.register(req.body);

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await service.login(req.body as LoginDto);

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
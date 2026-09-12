import { Request, Response } from "express";
import { UserRepository } from "../repositories/user.repository";

const repository = new UserRepository();

export const getUsers = async (req: Request, res: Response) => {
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

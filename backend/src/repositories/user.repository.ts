import { User } from "../models/user.model";
import { CreateUserDto } from "../dtos/CreateUserDto";

export class UserRepository {
  async findByEmail(email: string) {
    return User.findOne({ email });
  }

  async create(data: CreateUserDto) {
    return User.create(data);
  }

  async findById(id: string) {
    return User.findById(id);
  }
  async findAll() {
    return User.find({}, "name email role");
  }
}

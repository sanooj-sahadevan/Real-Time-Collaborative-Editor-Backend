import User from "../models/User.js";

export interface IUserRepository {
  addUser(userData: any): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getUserById(id: string): Promise<any>;
}

export class UserRepository implements IUserRepository {
  async addUser(userData: any): Promise<any> {
    const user = new User(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<any> {
    return await User.findOne({ email });
  }

  async getUserById(id: string): Promise<any> {
    return await User.findById(id).select("-password");
  }
}

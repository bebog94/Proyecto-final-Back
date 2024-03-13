import { usersModel } from "../db/models/users.model.js";

class UsersManager {
  async findById(id) {
    const response = await usersModel.findById(id);
    return response;
  }

  async findByEmail(email) {
    const response = await usersModel.findOne({ email });
    return response;
  }

  async createOne(obj) {
    const response = await usersModel.create(obj);
    return response;
  }
  
  async findUserByCart(cart){        
    return await usersModel.findOne({cart})                                       
}

  async findAll(){
    return await usersModel.find()
    
  }
  async findInactiveUsers(inactiveThreshold) {
    const inactiveUsers = await usersModel.find({ last_connection: { $lt: inactiveThreshold } });
    return inactiveUsers;
  }

  async deleteOne(userId) {
      const result = await usersModel.findByIdAndDelete(userId);
      return result;
  }
  async updateOne(userId, update) {
    return await usersModel.findByIdAndUpdate(userId, update, { new: true });
  }
}

export const usersManager = new UsersManager();
import { usersManager } from "../DAL/dao/managers/usersManager.js";
import { cartsManager } from "../DAL/dao/managers/cartsManager.js";
import UsersResponseDto from "../DAL/dtos/user-response.dto.js"
import UsersRequestDto from "../DAL/dtos/user-request.dto.js"
import {hashData} from "../utils/utils.js"

export default class UsersRepository {
    
    async findById(id) {
        const user = await usersManager.findById(id);
        return user;
    }

    async findByEmail(id) {
        const user = usersManager.findByEmail(id);
        const userDTO = new UsersResponseDto(user);
        return userDTO;
    }

    async createOne(user) {
      const hashPassword = await hashData(user.password);
      const createdCart = await cartsManager.createCart()
      const userDto = new UsersRequestDto(
        { ...user, 
          cart: createdCart._id,
          password: hashPassword });
      
      const createdUser = await usersManager.createUser(userDto);
      return createdUser;
    }    
    async saveUserDocumentsService ({ id, dni, address, bank }) {
      const savedDocuments = await uManager.updateUser(id, {
        documents: [
          ...dni?[{
              name: "dni",
              reference: dni[0].path,
          }]:[],
          ...address?[{
              name: "address",
              reference: address[0].path,
          }]:[],
          ...bank?[{
              name: "bank",
              reference: bank[0].path,
          }]:[],
        ],
      });
      return savedDocuments;
    }

    async getAllUsersService(){
      const allUsers = await usersManager.findAll()
      return allUsers;
    }
    async deleteOne(userId) {
      try {
        const result = await usersManager.deleteOne(userId);
        return result;
      } catch (error) {
        console.error("Error en deleteOne del repository:", error);
        throw error;
      }
    }
    async updateUser(userId, updateData) {
      try {
        const updatedUser = await usersManager.updateOne(userId, updateData);
  
        const userDto = new UsersResponseDto(updatedUser);
        return userDto;
      } catch (error) {

        throw new Error(`Error al actualizar el usuario: ${error.message}`);
      }
    }
  }

  

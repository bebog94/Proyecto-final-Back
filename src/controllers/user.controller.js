import { usersService } from "../repository/index.js";
import passport from "passport";
import { transporter } from "../utils/nodemailer.js";
import mongoose from "mongoose";
import CustomError from "../errors/error.generator.js";
import { ErrorMessages, ErrorName } from "../errors/errors.enum.js";
import { logger } from "../utils/logger.js";
import { usersManager } from "../DAL/dao/managers/usersManager.js";


export const findUserById = (req, res) => {
    passport.authenticate("jwt", { session: false }),
        async (req, res) => {
            try {
                const { idUser } = req.params;
                const user = await usersService.findById(idUser);
                if (!user) {
                    logger.warning("User not found with the id provided")
                    return CustomError.generateError(ErrorMessages.USER_NOT_FOUND, 404, ErrorName.USER_NOT_FOUND);
                }
                res.json({ message: "User", user });
            } catch (error) {
                logger.error(error)
                next(error)
            }
        }
};

export const findUserByEmail = async (req, res) => {
    try {
        const { UserEmail } = req.body;
        const user = await usersService.findByEmail(UserEmail);
        if (!user) {
            logger.warning("User not found with the email provided")
            return CustomError.generateError(ErrorMessages.USER_NOT_FOUND, 404, ErrorName.USER_NOT_FOUND);
        }
        res.status(200).json({ message: "User found", user });
    } catch (error) {
        logger.error(error)
        next(error)
    }

};

export const createUser = async (req, res) => {
    try {
        const { name, lastName, email, password } = req.body;
        if (!name || !lastName || !email || !password) {
            logger.warning("Some data is missing")
            return CustomError.generateError(ErrorMessages.MISSING_DATA, 400, ErrorName.MISSING_DATA);
        }
        const createdUser = await usersService.createOne(req.body);
        res.status(200).json({ message: "User created", user: createdUser });
    } catch (error) {
        logger.error(error)
        next(error)
    }
};


export const roleSwapper = async (req, res, next) => {
    const { idUser } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(idUser)) {
            logger.warning("Invalid Mongoose ObjectID format");
            throw CustomError.generateError(ErrorMessages.OID_INVALID_FORMAT, 404, ErrorName.OID_INVALID_FORMAT);
        }

        const user = await usersService.findById(idUser);
        if (!user) {
            logger.warning("User not found with the id provided");
            throw CustomError.generateError(ErrorMessages.USER_NOT_FOUND, 404, ErrorName.USER_NOT_FOUND);
        }

        let roleChange;
        if (user.role === 'PREMIUM') {
            roleChange = { role: 'USER' }
        } else if (user.role === 'USER') {
            if (!user.documents[0] || !user.documents[1] || !user.documents[2]) {
                return res.status(400).json({ message: "Please update your documentation first" });
            }
            roleChange = { role: 'PREMIUM' }
        }
        await usersService.updateUser(user._id, roleChange)
        const updatedUser = await usersService.findById(idUser);
        logger.debug({ message: "user updated", updatedUser })
        res.json({ message: "Role updated", payload: updatedUser });
    }
    catch (error) {
        logger.error(error);
        next(error);
    }
};
export const saveUserDocuments = async (req, res) => {
    const { idUser } = req.params;
    console.log(req.files);
    const { dni, address, bank } = req.files;
    const response = await usersService.saveUserDocumentsService({ idUser, dni, address, bank });
    res.json({ response });
};

export const findUsers = async (req, res) => {
    try {
        const user = await usersService.findByEmail(UserEmail);
        if (!user) {
            logger.warning("User not found with the email provided")
            return CustomError.generateError(ErrorMessages.USER_NOT_FOUND, 404, ErrorName.USER_NOT_FOUND);
        }
        res.status(200).json({ message: "User found", user });
    } catch (error) {
        logger.error(error)
        next(error)
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await usersService.getAllUsersService();
        const simplifiedUsers = users.map(user => ({
            name: user.name,
            email: user.email,
            role: user.role,
        }));
        res.status(200).json(simplifiedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener usuarios" });

    }
}
export const deleteInactiveUsers = async (req, res) => {
    try {
        const inactiveThreshold = new Date();
        inactiveThreshold.setDate(inactiveThreshold.getDate() - 2);

        const inactiveUsers = await usersManager.findInactiveUsers(inactiveThreshold);

        inactiveUsers.forEach(async (user) => {
            await transporter.sendMail({
                to: user.email,
                subject: "Eliminación de cuenta por inactividad",
                text: "Tu cuenta ha sido eliminada debido a inactividad.",
            });

            await usersManager.deleteOne(user._id);
        });

        res.status(200).json({ message: "Usuarios inactivos eliminados exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar usuarios inactivos" });
    }
}
export const deleteUserById = async (req, res, next) => {
    const { userId } = req.params;
  
    try {
      const deletedUser = await usersManager.deleteOne(userId);
  
      if (!deletedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      res.json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar el usuario:', error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
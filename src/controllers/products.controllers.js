import {productsService} from "../repository/index.js"
import { usersService } from "../repository/index.js";
import CustomError from "../errors/error.generator.js"
import { transporter } from "../utils/nodemailer.js";
import mongoose from "mongoose";
import {generateProduct} from '../faker.js'
import { ErrorMessages, ErrorName } from "../errors/errors.enum.js";

export const findProductById = async (req, res, next) => {
    
    try {
        const { pid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pid)){
            return CustomError.generateError(ErrorMessages.OID_INVALID_FORMAT,404, ErrorName.OID_INVALID_FORMAT)
        }
        const product = await productsService.findById(pid);
        if (!product) {
            return CustomError.generateError(ErrorMessages.PRODUCT_NOT_FOUND,404, ErrorName.PRODUCT_NOT_FOUND);
        }
        res.status(200).json({ message: "Product found", product });
    } catch (error) {
        next(error);
    }
};

export const findAllProduct = async (req, res, next) => {
    try {
        const products = await productsService.findAll(req.query);
        res.status(200).json({ message: "Product found", products });
    } catch (error) {
        next(error);
    }
}

export const createOneProduct = async (req, res, next) => {
    const { title, description, price, code, stock, category } = req.body;

    if (!title || !description || !price || !code || !stock || !category) {
        return CustomError.generateError(ErrorMessages.MISSING_DATA, 400, ErrorName.MISSING_DATA);
    }
    try {
        const userId = req.user._id; // Asumiendo que el ID del usuario está disponible en req.user
        const response = await productsService.createOne({ ...req.body, owner: userId });
        res.status(200).json({ message: "Producto created", response });
    } catch (error) {
        next(error);
    }
};

export const deleteOneProd = async (req, res, next) => {
    try {
        const { pid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return CustomError.generateError(ErrorMessages.OID_INVALID_FORMAT, 404, ErrorName.OID_INVALID_FORMAT);
        }

        const product = await productsService.findById(pid);

        if (!product) {
            return CustomError.generateError(ErrorMessages.PRODUCT_NOT_FOUND, 404, ErrorName.PRODUCT_NOT_FOUND);
        }

        const ownerId = product.owner;
        const ownerUser = await usersService.findById(ownerId);

        if (ownerUser && ownerUser.role === 'PREMIUM') {
            const userEmail = ownerUser.email;
            const productName = product.title;
            const emailSubject = 'Producto Eliminado';
            const emailBody = `Tu producto ${productName} ha sido eliminado.`;

            const mailOptions = {
                from: 'sicnetisp@gmail.com',
                to: userEmail,
                subject: emailSubject,
                text: emailBody,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log('Correo electrónico enviado al propietario premium');
            } catch (error) {
                console.error('Error al enviar el correo electrónico:', error.message);
            }
        } else {
            console.log("El propietario no es un usuario premium");
        }

        const response = await productsService.deleteOneProduct(pid);
        if (!response) {
            return CustomError.generateError(ErrorMessages.PRODUCT_NOT_FOUND, 404, ErrorName.PRODUCT_NOT_FOUND);
        }

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};


export const updateProducts = async (req, res, next) => {
    try {
        const { pid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return CustomError.generateError(ErrorMessages.OID_INVALID_FORMAT,404, ErrorName.OID_INVALID_FORMAT);
        }
        const response = await productsService.updateProduct(pid, req.body);
        if (!response) {
            return CustomError.generateError(ErrorMessages.PRODUCT_NOT_FOUND,404, ErrorName.PRODUCT_NOT_FOUND);
        }
        res.status(200).json({ message: "Product updated", response });
    } catch (error) {
        next(error);
    }
}

export const productMocks = (req, res) => {
    try{
        const products = generateProduct()
        return res.json({ products })        
    }catch (error){
        res.status(500).json({message: "Error"})
    }    
};
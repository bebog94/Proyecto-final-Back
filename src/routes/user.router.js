import { Router } from "express";

import {  saveUserDocuments,findUserById, roleSwapper,getAllUsers, deleteInactiveUsers, deleteUserById} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router.get("/:idUser", findUserById);

router.get("/",getAllUsers)

router.put('/premium/:idUser', roleSwapper)

router.post("/:idUser/documents",
upload.fields([
  { name: "dni", maxCount: 1 },
  { name: "address", maxCount: 1 },
  { name: "bank", maxCount: 1 },
]),
saveUserDocuments
);

router.delete("/inactiveUsers", deleteInactiveUsers);

router.delete('/:userId', deleteUserById);


export default router;
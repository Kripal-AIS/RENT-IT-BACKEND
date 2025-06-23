import { Router } from 'express';
import { deleteUser, findAllUsers, findUser, myTools, updateUser } from '../Controllers/UserController.js';
const router = Router();
import VerifyToken from '../Helper/VerifyToken.js';

router.get("/findall", findAllUsers.controller)
router.get("/mytools",VerifyToken,myTools.controller);

router.get("/:id", findUser.controller)
router.put("/:id", VerifyToken, updateUser.controller)
router.delete("/:id", VerifyToken, deleteUser.validator, deleteUser.controller)

export default router;
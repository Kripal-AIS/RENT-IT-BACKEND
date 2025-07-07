import { Router } from "express";
import { addQuery, getQueries } from "../Controllers/QueryController.js";
import VerifyToken from "../Helper/VerifyToken.js";
const router = Router();

router.get('/all',getQueries.controller)

router.post('/add',VerifyToken,addQuery.validator,addQuery.controller)

export default router;
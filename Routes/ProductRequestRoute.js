import { Router } from "express";
import { acceptRequest, declineRequests, deleteRequest, getMyRequests, postRequest } from "../Controllers/ProductRequestRoute.js";
import VerifyToken from "../Helper/VerifyToken.js";
const router = Router();

router.post("/request", VerifyToken, postRequest.validator, postRequest.controller);
router.delete("/delete", VerifyToken, deleteRequest.validator,deleteRequest.controller);

router.get("/myrequests", VerifyToken,  getMyRequests.controller);

router.get("/accept", VerifyToken, acceptRequest.validator, acceptRequest.controller);
router.get("/decline", VerifyToken, declineRequests.validator, declineRequests.controller);


export default router;
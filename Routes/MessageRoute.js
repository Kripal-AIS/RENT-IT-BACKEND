import { Router } from 'express';
import { addMessage, getAllMessage, getMessages, getInboxUsers } from "../Controllers/MessageController.js";

const router = Router();

router.post("/addmsg", addMessage);
router.post("/getallmsg", getAllMessage);
router.post('/getmsg', getMessages);  
router.post('/inbox-users', getInboxUsers);
export default router;

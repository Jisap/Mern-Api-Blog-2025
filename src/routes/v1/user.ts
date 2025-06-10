import getCurrentUser from "@/controllers/v1/user/get_current_user";
import { updateCurrentUser } from "@/controllers/v1/user/update_current_user";
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import user from "@/models/user";
import { Router } from "express";
import { body, param, query } from "express-validator";



const router = Router();

router.get(
  '/current',
  authenticate, // header -> token -> verify -> userId -> req.userId -> next
  authorize(['admin', 'user']), // userId -> verificamos si existe en bd -> verificamos si el rol es admin o user -> next
  getCurrentUser
)

router.put(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  updateCurrentUser
)


export default router;
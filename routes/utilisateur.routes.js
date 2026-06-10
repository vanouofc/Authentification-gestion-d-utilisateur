import { Router } from "express";
import { deleteUser, getUser, getUsers, restoreUser, updateRole, updateUser } from "../controllers/user.controller.js";
import { verifiedEmail } from "../middlewares/verifiedEmail.middleware.js";
import { requireRole } from "../middlewares/requireRole.middleware.js";
import { requireSession } from "../middlewares/requireSession.middleware.js";


const userRouter = Router();



// Routes admin.
userRouter.get('/', verifiedEmail, requireRole('Admin'), getUsers);
userRouter.patch('/role/:id', verifiedEmail, requireRole('Admin'), updateRole);
userRouter.delete('/:id', verifiedEmail, requireRole('Admin'), deleteUser);
userRouter.post('/restore/:id', verifiedEmail, requireRole('Admin'), restoreUser);


// Route de l'utilisateur connecté:
userRouter.patch('/update/:id', requireSession, updateUser);


// Route publique
userRouter.get('/:id',requireSession, getUser);





export default userRouter;
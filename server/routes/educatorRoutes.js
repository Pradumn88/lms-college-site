import express from 'express';
import { updateRoleToEducator } from '../controllers/educatorController.js';

const educatorRouter = express.Router();

educatorRouter.put('/update-role', updateRoleToEducator);

export default educatorRouter;

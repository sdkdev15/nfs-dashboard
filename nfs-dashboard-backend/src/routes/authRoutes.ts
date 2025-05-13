import { Router } from 'express';
import AuthController from '../controllers/authController';

const router = Router();
const authController = new AuthController();

export const setAuthRoutes = (app) => {
    app.use('/api/auth', router);
    
    router.post('/login', authController.login);
    router.post('/register', authController.register);
    router.post('/two-factor-setup', authController.twoFactorSetup);
};
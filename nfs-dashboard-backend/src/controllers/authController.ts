import { Request, Response } from 'express';
import AuthService from '../services/authService';

class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const token = await this.authService.login(email, password);
            res.status(200).json({ token });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }

    public async register(req: Request, res: Response): Promise<void> {
        try {
            const userData = req.body;
            const newUser = await this.authService.register(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    public async twoFactorSetup(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;
            const setupInfo = await this.authService.setupTwoFactor(userId);
            res.status(200).json(setupInfo);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default AuthController;
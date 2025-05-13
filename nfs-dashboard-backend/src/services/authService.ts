import { User } from '../models/userModel';
import { generateToken } from '../utils/tokenUtil';

export class AuthService {
    async register(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async login(email, password) {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Invalid credentials');
        }
        return generateToken(user._id);
    }

    async validateUser(userId) {
        return await User.findById(userId);
    }
}
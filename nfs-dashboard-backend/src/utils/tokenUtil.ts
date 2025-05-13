import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const EXPIRATION_TIME = '1h';

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: EXPIRATION_TIME });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
};
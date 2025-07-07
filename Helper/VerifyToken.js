import JWT from 'jsonwebtoken';
import User from "../Models/User.js";

const VerifyToken = async (req, res, next) => {
    try {
        // Try to get token from Authorization header (Bearer <token>)
        let token;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies && req.cookies.rentit) {
            // Fallback to cookie if no Authorization header
            token = req.cookies.rentit;
        }

        if (!token) {
            return res.status(401).send("Please login to perform this action");
        }

        const verified = JWT.verify(token, process.env.JWT_SEC_KEY);
        const currUser = await User.findById(verified.id);

        if (!currUser) {
            return res.status(401).send("Unauthorized user");
        }

        req.token = token;
        const { password, ...rest } = currUser._doc;
        req.currUser = rest;
        req.userId = currUser._id;

        next();
    } catch (err) {
        return res.status(401).send("Unauthorized user");
    }
};

export default VerifyToken;
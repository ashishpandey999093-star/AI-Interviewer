import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isAuth = async (req, res, next) => {
    try {
        let { token } = req.cookies

        if (!token) {
            return res.status(400).json({ message: "No token provided" })
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(verifyToken.userId).select("tokenVersion");
        if (!user) {
            return res.status(403).json({ message: "Invalid token" });
        }

        if (user.tokenVersion !== verifyToken.tokenVersion) {
            return res.status(401).json({ message: "Session expired. You logged in on another device." });
        }
        req.userId = verifyToken.userId

        next()


    } catch (error) {
        return res.status(500).json({ message: `isAuth error ${error}` })
    }

}

export default isAuth
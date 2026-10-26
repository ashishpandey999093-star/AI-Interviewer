import genToken from "../config/token.js"
import User from "../models/user.model.js"


export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                name,
                email
            })
        }
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();

        let token = await genToken(user._id, user.tokenVersion)
        res.cookie("token", token, {
            http: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)



    } catch (error) {
        return res.status(500).json({ message: `Google auth error ${error}` })
    }

}

export const logOut = async (req, res) => {
    try {
        await res.clearCookie("token")
        return res.status(200).json({ message: "LogOut Successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Logout error ${error}` })
    }

}
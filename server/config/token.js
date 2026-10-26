import jwt from "jsonwebtoken"

const genToken = async (userId, tokenVersion) => {
    try {
        const token = jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, { expiresIn: "7d" })
        return token
    } catch (error) {
        console.log(error)
    }

}

export default genToken
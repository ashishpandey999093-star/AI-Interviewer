import mongoose from "mongoose";
import dns from "node:dns";

// Resolve MongoDB Atlas SRV connection strings reliably (fixes querySrv ECONNREFUSED on Windows/certain ISPs)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DataBase Connected")
    } catch (error) {
        console.log(`DataBase Error ${error}`)
    }
}

export default connectDb
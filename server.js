import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

// const mode = process.env.NODE_ENV;
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
    console.log(`App running in ${mode} mode on port ${port}....`);
});


process.on("unhandledRejection", (err)=> {
    console.log("unhandled rejection, Shutting down....");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

export default server;
import express from "express";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import {auth} from "./auth.js"
import connect from "./config/mongodb.js";
import userRouter from "./routes/utilisateur.routes.js";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";



dotenv.config({quiet: true});

const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger.json");
const app = express();
// console.log(auth.api)
app.use("/api/auth/", toNodeHandler(auth));

app.use(express.json());

const port = 3000;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/user', userRouter);
app.get('/', (req, res) => {
    res.send('Hello all the world.');
});

app.listen(port, async () => {
    console.log(`server demarré sur http://localhost:${port}`);
    await connect();
});
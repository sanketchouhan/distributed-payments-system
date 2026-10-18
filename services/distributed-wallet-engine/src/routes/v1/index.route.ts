import express from "express";
import healthRouter from "./health.route.js";

const v1Router = express.Router();

v1Router.use("/health", healthRouter);

export default v1Router;

/* eslint-disable no-undef */
const express = require("express");
const userRouter = require("./routes/users/userRoutes");
const postRouter = require("./routes/posts/postRoutes");
const commentRouter = require("./routes/comments/commentRouter");
const categoryRouter = require("./routes/categories/categoryRouter");
const globalErrorHandler = require("./middlewares/globalErrorHandler");


require("dotenv").config();

require("./config/dbConnect");
const app = express();

// const swaggerUI = require("swagger-ui-express");
// const YAML = require("yamljs");
// const swaggerDocument = YAML.load("./openapi.yaml");

// middleware
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("<h1>Jobs API</h1><a href=\"/api-docs\">Documentation</a>");
// });
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// routes users
app.use("/api/v1/users/", userRouter);
app.use("/api/v1/posts/", postRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/comments", commentRouter);


// errors
app.use(globalErrorHandler);
app.use("*", (req, res)=>{
  res.status(404).json({
    message: `${req.originalUrl} Route not found`,
  });
});


const PORT = process.env.PORT || 9000;
app.listen(PORT, console.log(`Server is running on port ${PORT}`));

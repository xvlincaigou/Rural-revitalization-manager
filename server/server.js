/*
|--------------------------------------------------------------------------
| server.js -- The core of your server
|--------------------------------------------------------------------------
|
| This file defines how your server starts up. Think of it as the main() of your server.
| At a high level, this file does the following things:
| - Connect to the database
| - Sets up server middleware (i.e. addons that enable things like json parsing, user login)
| - Hooks up all the backend routes specified in api.js
| - Fowards frontend routes that should be handled by the React router
| - Sets up error handling in case something goes wrong when handling a request
| - Actually starts the webserver
*/

// validator runs some basic checks to make sure you've set everything up correctly
// this is a tool provided by staff, so you don't need to worry about it
// const validator = require("./validator");
// validator.checkSetup();

//import libraries needed for the webserver to work!
const http = require("http");
const bodyParser = require("body-parser"); // allow node to automatically parse POST body requests as JSON
const express = require("express"); // backend framework for our node server.
const session = require("express-session"); // library that stores info about each connected user
const mongoose = require("mongoose"); // library to connect to MongoDB
const path = require("path"); // provide utilities for working with file and directory paths

const activityApi = require("./api/activity_api");
const complaintApi = require("./api/complaint_api");
const globalApi = require("./api/global_api");
const storyApi = require("./api/story_api");
const userApi = require("./api/user_api");
const registerApi = require("./api/register_api");
const loginApi = require("./api/login_api");
const logoutApi = require("./api/logout_api");
const Settings = require("./models/settings.js");
// const auth = require("./controllers/auth.controller");

// socket stuff
// const socketManager = require("./server-socket");

// Server configuration below
// TODO change connection URL after setting up your own database
const mongoConnectionURL = `mongodb://localhost:27017/`; // 测试用
// TODO change database name to the name you chose
const databaseName = "Main";

// connect to mongodb
mongoose
  .connect(mongoConnectionURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName: databaseName,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(`Error connecting to MongoDB: ${err}`));

// create a new express server
const app = express();
// app.use(validator.checkRoutes);

// set up bodyParser, which allows us to process POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up a session, which will persist login data across requests
app.use(
  session({
    secret: "FvU]#kg?2Un+>o>Cff1g",
    resave: false,
    saveUninitialized: false,
  })
);

// this checks if the user is logged in, and populates "req.user"
// app.use(auth.populateCurrentUser);

// connect user-defined routes
app.use("/api/activity", activityApi);
app.use("/api/complaint", complaintApi);
app.use("/api/global", globalApi);
app.use("/api/story", storyApi);
app.use("/api/user", userApi);
app.use("/api/register", registerApi);
app.use("/api/login", loginApi);
app.use("/api/logout", logoutApi);

// load the compiled react files, which will serve /index.html and /bundle.js
const reactPath = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(reactPath));

// for all other routes, render index.html and let react router handle it
app.get("*", (req, res) => {
  res.sendFile(path.join(reactPath, "index.html"));
});

// any server errors cause this function to run
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) {
    // 500 means Internal Server Error
    console.log("The server errored when processing a request!");
    console.log(err);
  }

  res.status(status);
  res.send({
    status: status,
    message: err.message,
  });
});

// 初始化设置
async function initializeSettings() {
  const existingSettings = await Settings.findOne();

  if (!existingSettings) {
    const defaultSettings = new Settings();
    await defaultSettings.save();
  }
}

initializeSettings().catch(console.error);

// hardcode port to 3000 for now
const port = 3000;
const server = http.Server(app);
// socketManager.init(server);

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

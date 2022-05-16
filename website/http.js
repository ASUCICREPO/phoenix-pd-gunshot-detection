const cors = require("cors");
var url = require("url");
var passport = require("passport");
var fs = require("fs");
var config = require("./server/config");

var querystring = require("querystring");
var path = require("path");
var express = require("express");

var dbURL = config.db_url;
var db = require("mongoskin").db(dbURL);
var mongoose = require("mongoose");
mongoose.connect(dbURL, () => {
  console.log("Mongo Connected");
});

var app = express();

var secret = "test" + new Date().getTime().toString();
var session = require("express-session");
app.use(require("cookie-parser")(secret));
var MongoStore = require("connect-mongo")(session);
app.use(
  session({
    store: new MongoStore({
      url: dbURL,
      secret: secret,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
var flash = require("express-flash");
app.use(flash());

var bodyParser = require("body-parser");
var methodOverride = require("method-override");
app.use(methodOverride());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

require("./server/app/passport/config/passport")(passport); // pass passport for configuration
require("./server/app/passport/routes.js")(app, passport); // load our routes and pass in our app and fully configured passport

require("./server/app/routes/incidents.routes")(app);
require("./server/app/routes/devices.routes")(app);
require("./server/app/routes/sns.routes")(app);

// Server client (static files)
app.use(express.static(path.join(__dirname, "server/app/public")));

app.get("/", (req, res) => {
  res.sendFile("home.html");
});

// DO NOT DO app.listen() unless we're testing this directly
if (require.main === module) {
  console.log("RUNNING");
  app.listen(8080);
}
// Instead do export the app:
else {
  module.exports = app;
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.send("noauth");
}

var url = require("url"),
  bcrypt = require("bcrypt-nodejs");
querystring = require("querystring");
var User = require("./models/user");
module.exports = function (app, passport) {
  app.get("/loginStatus", function (req, res) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()) res.send(JSON.stringify(req.user));
    else res.send("0");
  });

  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // LOGIN  ==============================
  app.post(
    "/tryLogin",
    passport.authenticate("local-login", {
      successRedirect: "/index.html", // redirect to the secure profile section
      failureRedirect: "/login.html#fail", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // process the signup form
  app.post(
    "/tryRegister",
    passport.authenticate("local-signup", {
      successRedirect: "/index.html", // redirect to the secure profile section
      failureRedirect: "/login.html#failReg", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  app.get("/changepass", isLoggedIn, function (req, res) {
    var incoming = url.parse(req.url).query;
    var info = querystring.parse(incoming);
    var user = req.user;
    var newpass = info.newpass;
    var oldpass = info.oldpass;
    if (user.validPassword(oldpass)) {
      user.local.password = bcrypt.hashSync(
        newpass,
        bcrypt.genSaltSync(8),
        null
      );
      user.save(function (err) {
        if (err) {
          res.send("issue");
        } else {
          res.send("1");
        }
      });
    } else {
      res.send("0");
    }
  });

  app.get("/resetpass", function (req, res) {
    var incoming = url.parse(req.url).query;
    var info = querystring.parse(incoming);
    User.findOne({ "local.email": info.id }, function (err, user) {
      if (user) {
        user.local.password = bcrypt.hashSync(
          info.pass,
          bcrypt.genSaltSync(8),
          null
        );
        var tk = info.tk;
        db.collection("userID").findOne(
          { id: info.id },
          function (err, result) {
            if (result) {
              if (
                result.lostPToken &&
                result.lostPToken == tk &&
                result.lostPTS &&
                result.lostPTS - new Date().getTime() < 2 * 60 * 60 * 1000
              ) {
                user.save(function (err) {
                  if (err) {
                    res.send("0");
                  } else {
                    res.send("1");
                    result.lostPToken = "";
                    db.collection("userID").save(result, function (e, r) {
                      mailOptions.to = info.id;
                      transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                          return console.log(error);
                        }
                        //console.log('Message sent: ' + info.response);
                      });
                    });
                  }
                });
              } else {
                res.send("0");
              }
            } else {
              res.send("0");
            }
          }
        );
      } else {
        res.send("0");
      }
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
const userdb = require("../../controllers/user.controller.js");
var bcrypt   = require('bcrypt-nodejs');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null,JSON.stringify(user));
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        done(null, JSON.parse(user));
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
      console.log(email,password);
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        const dynamoUser= userdb.getUser(email);
        dynamoUser.then(function(result) {
            console.log(result);
            if (!result) {
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }

            if (!bcrypt.compareSync(password, result.password)) {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }
            else {
                return done(null, result);
            }
         })




    }));

};


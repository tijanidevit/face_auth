"use strict";
(function() {
  var express = require("express");
  var bodyParser = require("body-parser");
  var router = express.Router();
  var db = require("../models");
  var bcrypt = require("bcryptjs");
  var saltRounds = 10;

  var flow = ["text", "face", "voice"];

  /////////////////////////////////////////////////////
  router.get("/api/all", function(req, res) {
    db.User.findAll({}).then(function(data) {
      console.log("data", data);
      return res.json(data);
    });
  });

  router.get("/api/text/find/:username", function(req, res) {
    db.User
      .findOne({
        where: {
          username: req.params.username
        }
      })
      .then(function(data) {
        console.log("data", data);
        return res.json(data);
      });
  });

  //==================================================
  router.post("/api/text/signup", function(req, res) {
    var authtype = "text";
    var phase = "signup";
    var rb = req.body;
    // console.log(`POST /api/${authtype}/${phase}`);
    // Set next auth type.
    var next_guide = {
      text: "face",
      face: "voice",
      voice: "done"
    };
    var next_type = next_guide[authtype];

    if (authtype === "text") {
      bcrypt.hash(req.body.pw, saltRounds, function(err, hash) {
        console.log("hash", hash);

        db.User
          .create({
            username: rb.username,
            email: rb.email,
            pw: hash,
            firstname: rb.firstname,
            lastname: rb.lastname
          })
          .then(function(data) {
            console.log("res", res);
            var bs = require("browser-storage");

            bs.setItem("email", rb.email);
            console.log(bs.getItem("email"));
            res.redirect(`/signup/${next_type}/` + rb.username);
          });
      });
    }
  });

  //Changing this route only for Text Login, because creating same route for face Login also
  //==================================================
  router.post("/api/text/login", function(req, res) {
    // var authtype = req.params.authtype;
    var phase = "login";
    // console.log(`POST /api/${authtype}/${phase}`);

    db.User
      .findOne({
        where: {
          username: req.body.uid
        }
      })
      .then(function(data) {
        if (data) {
          console.log("access granted?", data.pw);

          bcrypt.compare(req.body.pw, data.pw, function(err, response) {
            if (response === true) {
              res.redirect("/loginSuccess/" + req.body.uid);
            } else {
              res.redirect("/login/text");
            }
          });
        } else {
          console.log("Authentication Failed. Username is wrong.");
          const url = require("url");
          res.redirect(
            url.format({
              pathname: "/login/text/" + req.body.uid,
              query: {
                error: "Authentication Failed. Username is wrong"
              }
            })
          );
        }
      });

    // });
  });
  //////////////////////////////////////////////////////////
  ///Delete Users at different stages of Sign Up

  // router.get("/api/authenticator", function(req, res) {});
  // router.post("/api/authenticator", function(req, res) {});

  /////////////////////////////////////////////////////
  //  Add New User
  //   router.post("/", function(req, res) {
  //     console.log("req.body", req.body);

  //     api.insert(
  //       ["username", "text_password"],
  //       [req.body.username, text_password],
  //       function() {
  //         res.redirect("/");
  //       }
  // 	);

  //   });

  /////////////////////////////////////////////////////
  //   Update Existing User
  //   router.put("/:id", function(req, res) {
  //     var condition = "id = " + req.params.id;
  //     var devoured = req.body.devoured;
  //     var bool = false;
  //     if (devoured === "on") { bool = true; }

  //     api.update({ devoured: bool }, condition, function() {
  //       res.redirect("/");
  //     });
  //   });

  module.exports = router;
})();

// app.get('/', function(req, res) {
// 	res.render("home", {title: "MyPass"});
// });

// app.get('/boop', function(req, res) {
// 	res.render("home", {title: "boop"});
// });

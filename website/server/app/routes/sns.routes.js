module.exports = (app) => {
  const sns = require("../controllers/sns.controller.js");

  const router = require("express").Router();

  // get all incidents
  router.post("/subscribe", sns.subscribe);
  router.post("/unsubscribe", sns.unsubscribe);

  app.use("/api/sns", router);
};

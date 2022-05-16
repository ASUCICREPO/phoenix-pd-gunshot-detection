module.exports = (app) => {
  const device = require("../controllers/devices.controller.js");

  const router = require("express").Router();

  // get all incidents
  router.get("/", device.getDevices);

  app.use("/api/devices", router);
};

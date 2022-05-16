var homeDir = require("path").join(require("os").homedir());
require("greenlock-express")
  .create({
    version: "draft-11",
    server: "https://acme-v02.api.letsencrypt.org/directory",
    //, server: 'https://acme-staging-v02.api.letsencrypt.org/directory'  // staging
    email: "asucicoffice@gmail.com", // CHANGE THIS
    agreeTos: true,
    approveDomains: [
      "asucic-gunshotdetection.com",
      "www.asucic-gunshotdetection.com",
    ], // CHANGE THIS
    store: require("greenlock-store-fs"),
    configDir: homeDir,
    app: require("./http.js"),
    //, communityMember: true
  })
  .listen(8080, 8443);

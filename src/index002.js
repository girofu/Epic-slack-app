
require = require("esm")(module/*, options*/)
require("dotenv").config()

// const app = require("./homePage.js")
const api = require("./api.js")

module.exports = {
  // app: app,
  api: api,
};

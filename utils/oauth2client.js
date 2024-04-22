const { google } = require("googleapis");
const { env } = require("node:process");
const config = require("../config");

exports.oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

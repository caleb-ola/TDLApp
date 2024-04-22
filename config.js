const dotenv = require("dotenv");
const process = require("process");

dotenv.config({ path: "./config.env" });

const Config = () => {
  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };
};

const sanitizeConfig = (config) => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Cannot locate key ${key} in config.env`);
    }
  }
  return config;
};

const config = sanitizeConfig(Config());

module.exports = config;

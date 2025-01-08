require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const ngrok = require("@ngrok/ngrok");

app.use(morgan("dev"));
app.use(express.json());
app.use(require("./routes/router"));

const server = require("http").createServer(app);
server.listen(0, () => {
  console.log(`Server is listening on PORT: ${server.address().port}`);
});

const axios = require("axios");
const { TELEBOT_URL, TELEBOT_TOKEN } = process.env;
const API_URL = `${TELEBOT_URL}/${TELEBOT_TOKEN}`;
ngrok
  .connect({ addr: server.address().port, authtoken_from_env: true })
  .then(async (res) => {
    console.log(res.url());
    const response = await axios.post(API_URL + "/setWebhook", {
      url: res.url() + "/webhook",
    });
    console.log(response.data);
  });

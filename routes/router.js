const router = require("express").Router();
const axios = require("axios");

const telegramController = require("../controller/telegram/telegramController");

const { TELEBOT_URL, TELEBOT_TOKEN } = process.env;
const API_URL = `${TELEBOT_URL}/${TELEBOT_TOKEN}`;

router.get("/", (req, res) => {
  const BASE_URL = `https://${req.hostname}`;
  console.log(BASE_URL);
  res.send(BASE_URL);
});

router.get("/getMe", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/getMe`);
    res.send(response.data);
  } catch (err) {
    console.log(err);
    res.send(err.response);
  }
});

router.get("/setWebhook", async (req, res) => {
  try {
    const response = await axios.get(
      `${API_URL}/setWebhook?url=https://${req.hostname}/webhook`
    );
    res.send(response.data);
  } catch (err) {
    console.log(err);
    res.send(err.response);
  }
});

router.post("/webhook", telegramController);

module.exports = router;

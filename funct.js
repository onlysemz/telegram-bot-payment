const axios = require("axios");
const { OWNER_ID, GROUP_ID, CHANNEL_ID, TELEBOT_URL, TELEBOT_TOKEN } =
    process.env;
const API_URL = `${TELEBOT_URL}/${TELEBOT_TOKEN}`;

const kirimPesanKeOwner = text =>
    axios.post(API_URL + "/sendMessage", {
        chat_id: OWNER_ID,
        text: text
    });

const kirimPesanKeGroup = text =>
    axios.post(API_URL + "/sendMessage", {
        chat_id: GROUP_ID,
        text: text
    });
    
const kirimPesanKeChannel = (text) => axios.post(API_URL + "/sendMessage", {
        chat_id: CHANNEL_ID,
        text: text
    });

module.exports = { kirimPesanKeOwner, kirimPesanKeGroup , kirimPesanKeChannel};

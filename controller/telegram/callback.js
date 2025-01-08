const { MIDTRANS_API_URL, MIDTRANS_SERVER_KEY } = process.env;
const { readFile } = require("fs/promises");
const { writeFileSync } = require("fs");
const { join } = require("path");

const axios = require("axios");
axios.defaults.headers.common["Authorization"] = `Basic ${Buffer.from(
  MIDTRANS_SERVER_KEY + ":"
).toString("base64")}`;

module.exports = async (callback, req, res) => {
  console.log(callback);
  const dataPosts = await readFile(join(__dirname, "../../data/posts.json"));
  const postsParsed = JSON.parse(dataPosts);
  const { from, message, data } = callback;

  const cbName = data.split(":")[0];
  const cbTargetID = data.split(":")[1];

  console.log(cbName);
  console.log(cbTargetID);

  switch (cbName.toLowerCase()) {
    case "cb-japost":
      const resDelete = await axios
        .delete(MIDTRANS_API_URL + "/" + cbTargetID)
        .then((res) => res.data);
      res.status(200).send({
        method: "sendMessage",
        chat_id: from.id,
        text: resDelete.message,
        reply_to_message_id: message.message_id,
      });
      const indexPending = postsParsed[from.id].findIndex((x) => x.status == "pending");
      postsParsed[from.id][indexPending].status = "cancel";
      writeFileSync(
        join(__dirname, "../../data/posts.json"),
        JSON.stringify(postsParsed)
      );
      break;
    default:
      break;
  }

  res.status(200).end();
};

const { writeFile, readFile } = require("fs/promises");
const { MIDTRANS_API_URL, MIDTRANS_SERVER_KEY } = process.env;
const { join } = require("path");
const crypto = require("crypto");

const axios = require("axios");
axios.defaults.headers.common["Authorization"] = `Basic ${Buffer.from(
  MIDTRANS_SERVER_KEY + ":"
).toString("base64")}`;

module.exports = async (message, req, res) => {
  // Kita read data posts disini agar dapat data baru terus
  const dataPosts   = await readFile(join(__dirname, "../../data/posts.json"));
  const postsParsed = JSON.parse(dataPosts);
  const { message_id, from, chat, date, text, entities } = message;

  // Function reply
  function reply(text, parseMode = "Markdown") {
    res.status(200).send({
      method: "sendMessage",
      chat_id: chat.id,
      reply_to_message_id: message_id,
      text: text,
      parse_mode: parseMode,
    });
  }

  // Hanya menerima bot commands
  if (!entities || entities[0].type !== "bot_command") {
    return res.status(200).end();
  }
  const command = text.substring(1).split(" ")[0].toLowerCase();
  const args = text
    .substring(1)
    .replace(/^(.+?)\s*\b/g, "")
    .trim();

  const randomOID = crypto.randomBytes(7).toString("hex");
  const randomID = crypto.randomBytes(7).toString("hex");

  switch (command) {
    case "menu":
      res.status(200).send({
        method: "sendMessage",
        reply_to_message_id: message_id,
        chat_id: chat.id,
        text: "Command menu",
      });
      break;

    case "post":
      if (!args) {
        return reply(
          "The command you gave is invalid\nExample: /post payment"
        );
      }
      
      try {
        const resOrderMidtrans = await axios.post(MIDTRANS_API_URL, {
          transaction_details: {
            order_id: randomOID,
            gross_amount: 550,
            payment_link_id: `payment-for-japost-${randomID}`,
          },
          item_details: [
            {
              id: `japost-${randomID}`,
              name: "KuntyPay",
              price: 550,
              quantity: 1,
              brand: "Kuntycat",
              category: "-",
              merchant_name: "PT. Kuntycat",
            },
          ]
        })

        const resMidtrans = resOrderMidtrans.data

        /// Cek apakah pengguna ini sudah berapa dalam data posts
        if (from.id in postsParsed) {
          const isExistOrderPending = postsParsed[from.id].find((x) => x.status === "pending");

          if (isExistOrderPending) {
            const checkStatus = await axios.get(MIDTRANS_API_URL + "/" + isExistOrderPending.order_id).then((res) => res.data);
            if ( checkStatus.purchases && checkStatus.purchases[0]?.payment_status == "success") {
              // Kirim ke group atau channel ketika status berubah ke success
            }

            res.status(200).send({
              method              : "sendMessage",
              reply_to_message_id : message_id,
              chat_id             : chat.id,
              text                : `isi text untuk pending dan cancel`,
              reply_markup        : {
                inline_keyboard   : [
                  [
                    {
                      text  : "Bayar Sekarang",
                      url   : isExistOrderPending.payment_url,
                    },
                  ],
                  [
                    {
                      text  : "Batalkan Pesanan",
                      callback_data: `cb-japost:${isExistOrderPending.order_id}`,
                    },
                  ],
                ],
              },
            });

          } else {
            postsParsed[from.id].push({
              id          : randomID,
              order_id    : resMidtrans.order_id,
              payment_url : resMidtrans.payment_url,
              status      : "pending",
            });

            res.status(200).send({
              method              : "sendMessage",
              reply_to_message_id : message_id,
              chat_id             : chat.id,
              text                : `isi text sesuaikan saja`,
              reply_markup  : {
                inline_keyboard : [
                  [
                    {
                      text  : "Bayar Sekarang",
                      url   : resMidtrans.payment_url,
                    },
                  ],
                  [
                    {
                      text          : "Batalkan Pesanan",
                      callback_data : `cb-japost:${resMidtrans.order_id}`,
                    },
                  ],
                ],
              },
            });
          }
        } else {
          postsParsed[from.id] = [
            {
              id: randomID,
              order_id: resMidtrans.order_id,
              payment_url: resMidtrans.payment_url,
              status: "pending",
            },
          ];

          res.status(200).send({
            method: "sendMessage",
            reply_to_message_id: message_id,
            chat_id: chat.id,
            text: `isi text sesuaikan`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Bayar Sekarang",
                    url: resMidtrans.payment_url,
                  },
                ],
                [
                  {
                    text: "Batalkan Pesanan",
                    callback_data: `cb-japost:${resMidtrans.order_id}`,
                  },
                ],
              ],
            },
          });
        }

        await writeFile(
          join(__dirname, "../../data/posts.json"),
          JSON.stringify(postsParsed)
        );
        
      } catch (error) {
        console.log("error => ", error.response.data);
      }

      break;
    default:
      res.status(200).end();
      break;
  }
};

module.exports = (req, res) => {
  //  console.log(req.body);
  const { message, callback_query } = req.body;
  if (message) {
    return require("./message")(message, req, res);
  } else if (callback_query) {
    return require("./callback")(callback_query, req, res);
  } else {
    res.status(200).end();
  }
};

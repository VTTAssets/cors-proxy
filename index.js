// loading .env
require("dotenv").config();

// basic imports
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

// starting the proxy
const app = express();

// listen to /?url=someUrl
app.get("/", cors(), express.urlencoded({ extended: true }), async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Missing parameter");
  }

  fetch(url, { credentials: "include" })
    .then(response => {
      console.log("Proxying request for Content-Type " + response.headers.get("Content-Type"));

      // copying the content type of the target request
      res.setHeader("Content-Type", response.headers.get("Content-Type"));

      // piping the response through to the express response object
      response.body.pipe(res);

      // for giggles: how many bytes are we proxying?
      let bytes = 0;
      response.body.on("data", chunk => {
        bytes += chunk.length;
      });

      // Logging the amount of data when done
      response.body.on("end", () => {
        console.log("Sent " + Math.round(bytes / 1024) + "kb of data");
      });
    })
    .catch(error => {
      console.log("Could not access the URL " + url);
      console.log(error);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on *:" + PORT);
});

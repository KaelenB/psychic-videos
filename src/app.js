const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/script.js", function (req, res) {
  res.sendFile(__dirname + "/script.js");
});
app.get("/styles.css", function (req, res) {
  res.sendFile(__dirname + "/styles.css");
});

app.get("/video", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = __dirname + "/Chris-Do.mp4";
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

app.post(
  "/upload_files",
  upload.array("files"),
  function uploadFiles(req, res) {
    console.log(req.files);
    for (let i = 0; i < req.files.length; i++) {
      fs.renameSync(
        req.files[i].path,
        __dirname + "/uploads/" + req.files[i].originalname
      );
    }
    res.json({ message: "Successfully uploaded files" });
  }
);

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

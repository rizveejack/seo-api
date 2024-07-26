import express from "express";
import { isValidUrl } from "./lib/filter.js";
import { generateReport } from "./lib/generateReport.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.post("/", async (req, res) => {
  const url = req.body.url;
  const keyword = req.body.keyword;
  if (url && keyword && isValidUrl(url)) {
    const report = await generateReport(keyword, url);
    res.json(report);
  } else {
    res.json({ message: "Hello Bal" });
  }
});

// run the server on port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;

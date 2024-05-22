import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import contact from "./routes/contact";
import identify from "./routes/identify";
import path from "path";
import bodyParser from "body-parser";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// create application/json parser
app.use(bodyParser.json());

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req: Request, res: Response) => {
  res.sendFile(
    path.join(
      __dirname,
      process.env.ENV === "DEV" ? "view/index.html" : "../view/index.html"
    )
  );
});

app.get("/health", (req: Request, res: Response) => {
  res.send("ok");
});

app.use("/contact", contact);

app.use("/identify", identify);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

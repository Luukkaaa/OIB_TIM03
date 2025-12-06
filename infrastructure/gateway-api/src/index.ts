console.clear();
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import app from "./app";

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@gateway]\x1b[0m localhost:${port}`);
});

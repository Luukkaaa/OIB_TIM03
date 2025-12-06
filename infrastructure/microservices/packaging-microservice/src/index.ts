console.clear();
import app from "./app";

const port = process.env.PORT || 6400;

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@packaging]\x1b[0m localhost:${port}`);
});

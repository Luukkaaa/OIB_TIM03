console.clear();
import app from "./app";

const port = process.env.PORT || 6000;

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@audit]\x1b[0m localhost:${port}`);
});

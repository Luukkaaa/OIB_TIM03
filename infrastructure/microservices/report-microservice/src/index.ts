console.clear();
import app from "./app";

const port = process.env.PORT || 6700;

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@report]\x1b[0m localhost:${port}`);
});

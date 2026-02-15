import app from "./src/app.js";
import { config } from "./src/config/index.js";
import { connectDB } from "./src/db/connectDB.js";

connectDB(config.mongoURI);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

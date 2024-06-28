import app from "./app.js"
import { connectToDatabase } from "./db/connection.js";

const PORT = process.env.PORT || 8080;

connectToDatabase().then(()=>{
  console.log("Connected to Database");
  app.listen(PORT, ()=> console.log("Server Started on port 8080"));
}).catch(err=>{console.log(err)});


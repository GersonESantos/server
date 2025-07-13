
import App from "./App"; 
const app = new App().getApp();

app.listen(5000, () => {
  console.log(`ok, server is running on port 5000`);
})

import "./css/App.css";
import RandomStory from "./../lib";

class App {
  constructor() {
    let rs = new RandomStory();
    console.log("Demo loaded!", rs);
  }
}

export default App;

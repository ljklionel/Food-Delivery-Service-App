import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {

  async componentDidMount() {
    // Load async data.
    // Update state with new data.
    // Re-render our component.
    try {
      const response = await axios.get('.');
      console.log('👉 Returned data:', response);
    } catch (e) {
      console.log(`😱 Axios request failed: ${e}`);
    }
  }


  render() {
    return (
      <div className="App">
        hello world
      </div>
    );
  }
}

export default App;

import React from 'react';
import AppHeader from '../../components/AppHeader.js'

class RiderDashboard extends React.Component {

  async componentDidMount() {
    // Load async data.
    // Update state with new data.
    // Re-render our component. 
  } 
  
  render() {
    return (
      <div>
        <AppHeader/>
        <h1>Rider Dashboard</h1>
      </div>
    );
  }
}

export default RiderDashboard;

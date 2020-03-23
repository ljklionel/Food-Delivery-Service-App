import React from 'react';
import { Header } from 'semantic-ui-react'

class AppLogo extends React.Component {

  render() {
    var headerStyle = {
        fontSize:'50px'
    }
    return <div>
        <Header style={headerStyle}>FOOOD</Header>
    </div>
  }
}

export default AppLogo;

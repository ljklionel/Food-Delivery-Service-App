import React from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Header, List, Image } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import AppLogo from '../components/AppLogo.js'

class SignInRoles extends React.Component {


  getRoleSelection() {
    var textStyle = {
      fontSize:'30px',
      margin: '20px 0px 0px 0px'
    }
    var avatarStyle = {
      margin:'10px 10px 12px 0px'
    }

    return  (
      <List animated selection size='massive'>
        <List.Item as={Link} to='/register?role=customer'>
          <Image avatar style={avatarStyle} src='/images/avatar/customer.svg'/>
          <List.Content>
            <List.Header style={textStyle}>Customer</List.Header>
          </List.Content>
        </List.Item>
        <List.Item as={Link} to='/register?role=rider'>
          <Image avatar style={avatarStyle} src='/images/avatar/rider.svg' />
          <List.Content>
            <List.Header style={textStyle}>Delivery Rider</List.Header>
          </List.Content>
        </List.Item>
        <List.Item as={Link} to='/register?role=staff'>
          <Image avatar style={avatarStyle} src='/images/avatar/staff.svg' />
          <List.Content>
            <List.Header style={textStyle}>Restaurant Staff</List.Header>
          </List.Content>
        </List.Item>
        <List.Item as={Link} to='/register?role=manager'>
          <Image avatar style={avatarStyle} src='/images/avatar/manager.svg' />
          <List.Content>
            <List.Header style={textStyle}>FDS Manager</List.Header>
          </List.Content>
        </List.Item>
      </List>
    );
  }

  render() {
    return (
      <div style={{margin:'50px'}}>

        <AppLogo/>
        <br/><br/><br/><br/><br/><br/>
        <Header style={{fontSize: '32px', marginLeft:'32px'}}>I am a ...</Header>
        <br/>
        {this.getRoleSelection()}
      </div>
    );
  }
}

export default SignInRoles;

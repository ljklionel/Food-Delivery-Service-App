import React from 'react';
import queryString from 'query-string'
import { Link, Redirect, browserHistory } from 'react-router-dom';
import { Button, Form, Grid, Message, Segment, Header, Image } from 'semantic-ui-react'
import AppLogo from '../components/AppLogo.js'
import myAxios from '../webServer.js'


class SignInPage extends React.Component {

  constructor() {
    super()
    this.state = { username: '', password: '', toDashboard: false }
    this.handleChange = this.handleChange.bind(this); 
    this.handleSignIn= this.handleSignIn.bind(this); 
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleSignIn() {
    const { username, password } = this.state

    myAxios.post('signin', {
      username: username,
      password: password,
      role: this.role
    })
    .then(response => {
      console.log(response);
      if (response.data.ok) {
        this.setState({toDashboard: true});
      }
    })
    .catch(error => {
      console.log(error);
    });
  }

  roleIndicator() {
    var roles = {
      'staff': 'a Restaurant Staff',
      'rider': 'a Delivery Rider',
      'customer': 'a Customer',
      'manager': 'an FDS Manager'
    }

    var avatarStyle = {
      fontSize: '80px'
    }

    const roleText = roles[this.role]
    
    return (
      <div>
        <Image avatar style={avatarStyle} src={'/images/avatar/' + this.role + '.svg'} />
        <Header style={{fontSize: '32px'}}>You are {roleText}!</Header>
      </div>
    );
  }

  signInForm() {
    const { username, password } = this.state
    
    return (
      <Grid textAlign='center' style={{ height: '100vh' }}>
      <Grid.Column style={{ maxWidth: 600 }}>
        <Form size='large'>
          <Segment stacked>
            <Form.Input 
              fluid icon='user' iconPosition='left' size='massive' placeholder='Username' 
              name='username'
              value={username}
              onChange={this.handleChange}/>
            <Form.Input
              fluid
              icon='lock'
              iconPosition='left'
              placeholder='Password'
              type='password'
              size='massive'
              name='password'
              value={password}
              onChange={this.handleChange}
            />
  
            <Button fluid size='large' color='blue' onClick={this.handleSignIn}>
              <h1>Sign In</h1>
            </Button>
          </Segment>
        </Form>
        <Message style={{fontSize:'20px'}}>
          New to us? <Link to={'register?role=' + this.role}>Register</Link>
        </Message>
      </Grid.Column>
    </Grid>
    );
  }
  render() {

    const values = queryString.parse(this.props.location.search)
    this.role = values.role
    
    if (this.state.toDashboard) {
      return <Redirect to={'/'+this.role+'_dashboard'} />
    }

    return (
      <div style={{margin:'50px'}}>
        
        <AppLogo/>
        <br/><br/><br/><br/><br/><br/>
        {this.roleIndicator()}
        <br/><br/>
        {this.signInForm()}
      </div>
        
    );
  }
}

export default SignInPage;

import React from 'react';
import queryString from 'query-string'
import AppLogo from '../components/AppLogo.js'
import { Link, Redirect, browserHistory } from 'react-router-dom';
import { Button, Form, Grid, Message, Segment, Image, Header } from 'semantic-ui-react'
import myAxios from '../webServer.js'

class RegisterPage extends React.Component {
  constructor() {
    super()
    this.state = { username: '', password: '', firstname: '', lastname: '', phonenum: '', toDashboard: false }
    this.handleChange = this.handleChange.bind(this); 
    this.handleRegister= this.handleRegister.bind(this); 
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleRegister() {
    const { username, password, firstname, lastname, phonenum } = this.state
    
    myAxios.post('register', {
      username: username,
      password: password,
      firstname: firstname, 
      lastname: lastname,
      phonenum: phonenum,
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

  registerForm() {
    const { username, password, firstname, lastname, phonenum } = this.state
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
            <Form.Input 
              fluid size='massive' placeholder='First Name' 
              name='firstname'
              value={firstname}
              onChange={this.handleChange}/>
            <Form.Input 
              fluid size='massive' placeholder='Last Name' 
              name='lastname'
              value={lastname}
              onChange={this.handleChange}/>
            <Form.Input 
              fluid size='massive' placeholder='Phone number' 
              name='phonenum'
              type='tel'
              value={phonenum}
              onChange={this.handleChange}/>
            <Button fluid size='large' color='blue' onClick={this.handleRegister}>
              <h1>Register</h1>
            </Button>
          </Segment>
        </Form>
        <Message style={{fontSize:'20px'}}>
          Already have an account? <Link to={'signin?role=' + this.role}>Sign In</Link>
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
        {this.registerForm()}
      </div>
        
    );
  }
}

export default RegisterPage;

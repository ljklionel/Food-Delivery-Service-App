import React from 'react';
import { List, Segment, Grid, Button, Image, Form, Divider, Header, Loader, Card } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import RestaurantSearch from '../../components/staffs/RestaurantSearch.js'

class StaffDashboard extends React.Component {
  constructor() {
    super()
    this.state = {isLoading: false, currentRestaurant: 'abc'}
  }

  async componentDidMount() {
    // Load async data.
    // Update state with new data.
    // Re-render our component.
   
  } 

  workRestaurantList() {
    const headerStyle = {
      fontSize:'28px'
    }
    const itemStyle = {
      fontSize: '32px',
    }
    return (
      <div>
        <Header style={headerStyle}><i>Your Restaurants</i></Header>
        <br/>
        <Card.Group>
          <Card as='a' fluid color='red' header='KFC' />
          <Card as='a' fluid color='orange' header='Pines' />
          <Card as='a' fluid color='yellow' header='The Deck' />
        </Card.Group>
      </div>
      
    )
  }

  restaurantContent() {
    if (this.state.isLoading) {
      return (
        <Loader size='massive' active/>
      );
    }

    if (this.state.currentRestaurant) {
     return (
       <Grid celled style={{height: '100vh'}}>
        <Grid.Row style={{height: '30%'}}>
          <Grid.Column style={{width:'60%'}}>
            123
          </Grid.Column>
          <Grid.Column style={{width:'40%'}}>
            456
          </Grid.Column>
        </Grid.Row>

        <Grid.Row style={{height: '70%'}}>
          <Grid.Column width={10000}>
            123
          </Grid.Column>
        </Grid.Row>
      </Grid>);
    } else {
      return (
        <div>
          <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
          <Image avatar style= {{fontSize: '100px'}} src={'/images/avatar/staff.svg'} />
          <Header style={{fontSize: '32px'}}>Join a Restaurant now!</Header>
        </div>
      );
    }
  }

  render() {
    return (
      <Grid celled style={{height: '100vh'}}>
        <Grid.Column centered style={{width: '82%', background: '#edf8ff'}}>
          {this.restaurantContent()}
        </Grid.Column>

        <Grid.Column style={{width: '18%'}}>
          {this.workRestaurantList()}
          <br/><br/>
          
          <RestaurantSearch />
        </Grid.Column>
      </Grid>
    );
  }
}

export default StaffDashboard;

import React from 'react';
import { Grid, Image, Header, Loader, Card, List, Button, Menu } from 'semantic-ui-react';
import RestaurantSelect from '../../components/customers/RestaurantSelect.js'
import MenuList from '../../components/staffs/MenuList.js'
import MenuForCustomer from '../../components/customers/MenuForCustomer.js'
import CreditCardSelection from '../../components/customers/CreditCardSelection.js'
import AppHeader from '../../components/AppHeader.js'
import myAxios from '../../webServer.js'
import CompletedOrders from '../../components/customers/CompletedOrders.js'
import { Modal, Form, Table } from 'semantic-ui-react';


class CustomerDashboard extends React.Component {
  constructor() {
    super()
    this.state = {
      infoList: null,
      isLoadingInfo: true,
      currentRestaurant: null,
      restaurantMenu: null,
      location: null,
      creditCardArray: [
        {
            id: 0,
            title: 'New York',
            selected: false,
            key: 'location'
        },
        {
          id: 1,
          title: 'Dublin',
          selected: false,
          key: 'location'
        },
        {
          id: 2,
          title: 'California',
          selected: false,
          key: 'location'
        },
        {
          id: 3,
          title: 'Istanbul',
          selected: false,
          key: 'location'
        },
        {
          id: 4,
          title: 'Izmir',
          selected: false,
          key: 'location'
        },
        {
          id: 5,
          title: 'Oslo',
          selected: false,
          key: 'location'
        }
      ]
    }
  }

  toggleSelected(id, key){
    let temp = this.state[key]
    temp[id].selected = !temp[id].selected
    this.setState({
      [key]: temp
    })
  }

  // Not sure if necessary to update a customer's order upon ordering from menu
  updateOrder = order => {console.log("Order received at customer dashboard: ", order)}

  handleLocationChange = (e, {value }) => {
    this.state.location = value
  }

  async componentDidMount() {
    // Load async data.
    // Update state with new data.
    // Re-render our component.
    myAxios.get('/my_info')
    .then(response => {
      console.log(response);
      const list = []
      response.data.result.forEach(element => {
        list.push(element[0])
      });
      this.setState({infoList: list,
        isLoadingInfo: false})
    })
    .catch(error => {
      console.log(error);
    });
  } 

  customerContent() {
    if (this.state.isLoadingInfo) {
      return (
        <Loader size='massive' active/>
      );
    }
    console.log("infoList: ", this.state.infoList)
    const i = null

    if (this.state.infoList) {
      const id = this.state.infoList[0]
      const creditCard = this.state.infoList[1] == null ? 'Select payment method' : this.state.infolist[1]
      const rewardPoint = this.state.infoList[2] == null ? 0 : this.state.infolist[2]
      const selectedRestaurant = this.state.currentRestaurant == null ? "Not selected" :this.state.currentRestaurant
      
      return (
        <div>
          <Grid columns={4}>
            <Grid.Column>
              <Image avatar style= {{fontSize: '40px'}} src={'/images/avatar/customer.svg'} />
            </Grid.Column>

            <Grid.Column>
              <Header textAlign='left' style={{fontSize: '16px'}}>Username:</Header>
              <Header textAlign='left' style={{fontSize:'12px'}}>{id}</Header>
            </Grid.Column>

            <Grid.Column>
              <Header textAlign='left' style={{fontSize: '16px'}}>Credit Card:</Header>
              <Header textAlign='left' style={{fontSize:'12px'}}>{creditCard}</Header>
              <CreditCardSelection   titleHelper="Location" title="Select credit card" list={this.state.creditCardArray} toggleItem={this.toggleSelected} />
              {/* <MenuForCustomer submitOrder={this.updateOrder} restaurant={this.state.currentRestaurant}/> */}
            </Grid.Column>

            <Grid.Column>
              <Header textAlign='left' style={{fontSize: '16px'}}>Reward Point:</Header>
              <Header textAlign='left' style={{fontSize:'12px'}}>{rewardPoint}</Header>
            </Grid.Column>
          </Grid>

          <Table basic='very' celled>
                    <Table.Body>
                      <Table.Row>
                        <Table.Cell>
                           Location
                        </Table.Cell>
                        <Table.Cell>
                          <Form.Field>
                            <Form.Input
                              // name = {i}
                              placeholder='Input your location'
                              // value= {i}
                              onChange={this.handleLocationChange}/>
                          </Form.Field>
                        </Table.Cell>
                        <Table.Cell>
                        </Table.Cell>
                      </Table.Row>
                    </Table.Body>
                </Table>


          <Header style={{fontSize: '16'}}>Selected Restaurant:</Header>
          <Header textAlign='center' style={{fontSize:'16px'}}>{selectedRestaurant}</Header>

          <br/><br/>
          <Grid columns={4}>
            <Grid.Column>
              {/* <MenuList restaurant={this.state.currentRestaurant}/> */}
              <MenuForCustomer submitOrder={this.updateOrder} restaurant={this.state.currentRestaurant} location={this.state.location} infoList={this.state.infoList}/>
            </Grid.Column>
            <Grid.Column>
              {/* Need to update this orderList */}
              <CompletedOrders currentCustomer={this.state.infoList[0]}/>
            </Grid.Column>

            <Grid.Column>
              {/* <MonthlySummary restaurant={this.state.currentRestaurant}/> */}
            </Grid.Column>


            <Grid.Column>
              {/* <PromoList restaurant={this.state.currentRestaurant}/> */}
            </Grid.Column>
          </Grid>
          
        </div>
      );
    } else {
      return (
        <div>
          <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
          <Image avatar style= {{fontSize: '100px'}} src={'/images/avatar/customer.svg'} />
          <Header style={{fontSize: '32px'}}>Select a Restaurant</Header>
        </div>
      );
    }
  }

  selectRestaurant() {
    // if (this.state.isLoadingRestaurantList) {
    //   return <Loader size='massive' active/>
    // }
    const headerStyle = {
      fontSize:'28px'
    }
    
    const colors = ['red','orange','yellow','olive','green','teal',
            'blue','violet','purple','pink','brown','grey','black']
    const random_color = () => colors[Math.floor(Math.random() * colors.length)]

    const onSelectRestaurant = (rest) => {
      const update = {}
      update.currentRestaurant = rest
      this.setState(update)
    }

    return (
      <div>
        <Header style={headerStyle}><i>Select Restaurant</i></Header>
        <br/>
        <Card.Group>
          {/* {this.state.restaurantList.map((rest) => (
            <Card as='a' 
              key={rest}
              onClick={() => {this.setState({currentRestaurant: rest})}} 
              fluid 
              color={random_color()} 
              header={rest} />
          ))} */}
        </Card.Group>
        <br/><br/>
        <RestaurantSelect whenSelect={onSelectRestaurant}/>
      </div>
      
    )
  }

  render() {
    return (
      <div>
        <AppHeader/>
        <Grid celled style={{height: '100vh'}}>
          <Grid.Column style={{width: '82%', background: '#edf8ff'}}>
            {this.customerContent()}
          </Grid.Column>

          <Grid.Column style={{width: '18%'}}>
            {this.selectRestaurant()}
          </Grid.Column>
        </Grid>
      </div>
      
    );
  }

}

export default CustomerDashboard;

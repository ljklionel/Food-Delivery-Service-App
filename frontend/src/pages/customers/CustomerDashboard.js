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
      customerLocation: null,
      currentCreditCard: null,
      creditCardOptions: [
        {
            id: 0,
            title: 'Cash',
            selected: false,
            key: 'creditCardOptions'
        },
        {
          id: 1,
          title: 'Mastercard',
          selected: false,
          key: 'creditCardOptions'
        },
        {
          id: 2,
          title: 'Visa',
          selected: false,
          key: 'creditCardOptions'
        }
      ]
    }
    this.getCreditCardInfo = this.getCreditCardInfo.bind(this)
    this.toggleSelected = this.toggleSelected.bind(this)
    this.getLocation = this.getLocation.bind(this)
  }

  changeCurrentCreditCard = (x) => {
    console.log("Changing CreditCard")
    myAxios.post('update_credit_card', {
      customerName: this.state.infoList[0],
      creditCard: x
    })
    .then(response => {
      console.log("Response from /update_credit_card: ", response);
      var infoList = this.state.infoList
      infoList[1] = x
      console.log("Infolist after getting response: ", infoList)
      this.setState({
        infoList: infoList,
        currentCreditCard: x
      })
    })
    .catch(error => {
      console.log(error);
    });
  }

  toggleSelected(id, key){
    this.state.creditCardOptions.map((x) => 
      x.selected = false
    )
    let temp = this.state[key]
    temp[id].selected = !temp[id].selected
    this.setState({
      [key]: temp
    })
    this.changeCurrentCreditCard(this.state.creditCardOptions[id].title)
  }

  // Not sure if necessary to update a customer's order upon ordering from menu
  updateOrder = order => {console.log("Order received at customer dashboard: ", order)}

  handleLocationChange = (e, {value }) => {
    this.state.customerLocation = value
  }

  getLocation = () => {
    return this.state.customerLocation
  }

  getCreditCardInfo = () => {
    console.log("Getting credit card info")
    return this.state.infoList[1]
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
              <Header textAlign='left' style={{fontSize: '16px'}}>Payment method:</Header>
              <Header textAlign='left' style={{fontSize:'12px'}}>{this.state.currentCreditCard}</Header>
              <CreditCardSelection title="Select credit card" list={this.state.creditCardOptions} toggleItem={this.toggleSelected} />
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
              <MenuForCustomer submitOrder={this.updateOrder} getCreditCardInfo={this.getCreditCardInfo} restaurant={this.state.currentRestaurant} getLocation={this.getLocation} location={this.state.customerLocation} infoList={this.state.infoList}/>
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

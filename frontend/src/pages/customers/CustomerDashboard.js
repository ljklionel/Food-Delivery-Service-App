import React from 'react';
import { Grid, Image, Header, Loader, Card } from 'semantic-ui-react';
import RestaurantSelect from '../../components/customers/RestaurantSelect.js'
import MenuForCustomer from '../../components/customers/MenuForCustomer.js'
import CreditCardSelection from '../../components/customers/CreditCardSelection.js'
import AppHeader from '../../components/AppHeader.js'
import myAxios from '../../webServer.js'
import CompletedOrders from '../../components/customers/CompletedOrders.js'
import { Form, Table } from 'semantic-ui-react';


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
    myAxios.post('update_credit_card', {
      customerName: this.state.infoList[0],
      creditCard: x
    })
    .then(response => {
      var infoList = this.state.infoList
      infoList[1] = x
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

  submitOrder = totalPrice => {
    const list = this.state.infoList
    list[2] = totalPrice * 10
    this.setState({
      infoList: list
    })
    console.log(this.state.infoList)
    window.location.reload(false);
  }

  handleLocationChange = (e, {value }) => {
    this.setState({
      customerLocation: value
    })
  }

  getLocation = () => {
    return this.state.customerLocation
  }

  getCreditCardInfo = () => {
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
      response.data.result[0].forEach(element => {
        list.push(element)
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

    const id = this.state.infoList[0]
    this.state.currentCreditCard = this.state.infoList[1]
    const rewardPoint = this.state.infoList[2] == null ? 0 : this.state.infoList[2]
    const selectedRestaurant = this.state.currentRestaurant == null ? "Not selected" :this.state.currentRestaurant
    
    return (
      <div>
        <Grid columns={4}>
          <Grid.Column>
            <Image avatar style= {{fontSize: '80px'}} src={'/images/avatar/customer.svg'} />
          </Grid.Column>

          <Grid.Column>
            <Header textAlign='left' style={{fontSize: '14px'}}>Username: {id}</Header>
            <Header textAlign='left' style={{fontSize: '14px'}}>Payment method: {this.state.currentCreditCard}</Header>
            <Header textAlign='left' style={{fontSize: '14px'}}>Reward Point: {rewardPoint}</Header>
            <Header textAlign='left' style={{fontSize: '14px'}}>Selected Restaurant: {selectedRestaurant}</Header>
            <Header textAlign='left' style={{fontSize: '14px'}}>Location: {this.state.customerLocation}</Header>
            <Form.Field>
              <Form.Input
                placeholder='Input your location'
                onChange={this.handleLocationChange}/>
            </Form.Field>
          </Grid.Column>
          <Grid.Column>
          <CreditCardSelection title="Select credit card" list={this.state.creditCardOptions} toggleItem={this.toggleSelected} />
          </Grid.Column>
        </Grid>

        <Table basic='very' celled>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
              </Table>
        <Grid columns={4}>
          <Grid.Column>
            <MenuForCustomer submitOrder={this.submitOrder} getCreditCardInfo={this.getCreditCardInfo} restaurant={this.state.currentRestaurant} getLocation={this.getLocation} location={this.state.customerLocation} infoList={this.state.infoList}/>
          </Grid.Column>
          <Grid.Column>
            <CompletedOrders orderSubmitted={this.state.orderSubmitted} currentCustomer={this.state.infoList[0]}/>
          </Grid.Column>
        </Grid>
        
      </div>
    );
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
        <RestaurantSelect whenselect={onSelectRestaurant}/>
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

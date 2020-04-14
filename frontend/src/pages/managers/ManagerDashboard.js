import React from 'react';
import CustomerSummary from '../../components/managers/CustomerSummary.js'
import RiderSummary from '../../components/managers/RiderSummary.js'
import CustomerSearch from '../../components/managers/CustomerSearch.js'
import RiderSearch from '../../components/managers/RiderSearch.js'
import MonthlySummary from '../../components/managers/MonthlySummary.js'
import LocationSearch from '../../components/managers/LocationSearch.js'
import LocationSummary from '../../components/managers/LocationSummary.js'
import PromoList from '../../components/managers/PromoList.js';
import { Grid, Image, Header, Loader, Card, List, Button, Menu } from 'semantic-ui-react';
import myAxios from '../../webServer.js'
import AppHeader from '../../components/AppHeader.js'

class ManagerDashboard extends React.Component {

  constructor() {
    super()
    this.state = {isLoadingCustomerList: true, 
      isLoadingCustomer: true, 
      customerList: null, 
      currentCustomer: null,
      isLoadingRiderList: true,
      isLoadingRider: true,
      riderList: null,
      currentRider: null,
      currentLocation: null
    }
  }

  async componentDidMount() {
    // Load async data.
    // Update state with new data.
    // Re-render our component.
    myAxios.get('/all_customers')
    .then(response => {
      console.log(response);
      const list = []
      response.data.result.forEach(element => {
        list.push(element[0])
      });
      this.setState({customerList: list,
        isLoadingCustomerList: false,
        isLoadingCustomer: false})
    })
    .catch(error => {
      console.log(error);
    });
  } 

  mainContent() {
    if (this.state.isLoadingCustomer) {
      return (
        <Loader size='massive' active/>
      );
    }

    if (this.state.currentCustomer) {
      return (
        <div>
          <Header textAlign='left' style={{fontSize:'60px', paddingLeft:'5%'}}>{this.state.currentCustomer}</Header>
          <br/>
            <CustomerSummary customer={this.state.currentCustomer}/>
        </div>
      );
    }

    if (this.state.currentRider) {
      return (
        <div>
          <Header textAlign='left' style={{fontSize:'60px', paddingLeft:'5%'}}>{this.state.currentRider}</Header>
          <br/>
            <RiderSummary rider={this.state.currentRider}/>
        </div>
      )
    }

    if (this.state.currentLocation) {
      return (
        <div>
          <Header textAlign='left' style={{fontSize:'60px', paddingLeft:'5%'}}>{this.state.currentLocation}</Header>
          <br/>
            <LocationSummary location={this.state.currentLocation}/>
        </div>
      )
    }

    return (
      <div>
        <Header textAlign='center' style={{fontSize:'60px'}}>Monthly Summary</Header>
      <Grid celled style={{height: '100vh'}}>
      <Grid.Column style={{width: '60%'}}>
        <MonthlySummary/>
      </Grid.Column>
      <Grid.Column style={{width: '40%'}}>
        <PromoList/>
      </Grid.Column>
      </Grid>
      </div>
    )

  }

  showAll = () => {
    this.setState({currentCustomer: null, currentRider: null, currentLocation: null});
  }

  sideBar() {
    if (this.state.isLoadingCustomerList) {
      return <Loader size='massive' active/>
    }
    const headerStyle = {
      fontSize:'28px'
    }

    const onSelectCustomer = (cus) => {
      this.setState({currentRider: null, currentCustomer: cus, currentLocation: null});
    }

    const onSelectRider = (rider) => {
      this.setState({currentRider: rider, currentCustomer: null, currentLocation: null});
    }

    const onSelectLocation = (location) => {
      this.setState({currentRider: null, currentCustomer: null, currentLocation: location});
    }

    return (
      <div>
        <Header style={headerStyle}><i>Select to View</i></Header>
        <br/>
        <Button primary onClick={this.showAll}>
          HOME
        </Button>
        <br/>
        <br/>
        <CustomerSearch onSelectCus={onSelectCustomer}/>
        <br/>
        <RiderSearch onSelectRider={onSelectRider}/>
        <br/>
        <LocationSearch onSelectLocation={onSelectLocation}/>
      </div>
      
    )
  }

  render() {
    return (
      <div>
        <AppHeader/>
        <Grid celled style={{height: '100vh'}}>
          <Grid.Column style={{width: '82%', background: '#edf8ff'}}>
            {this.mainContent()}
          </Grid.Column>
          <Grid.Column style={{width: '18%'}}>
            {this.sideBar()}
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default ManagerDashboard;

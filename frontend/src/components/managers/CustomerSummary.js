import React, { Component } from 'react'
import { Statistic, Card, Header, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js';
import ViewCustomerModal from './ViewCustomerModal.js';

class CustomerSummary extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            monthlySummary: {},
            currentCustomer: props.customer
        }
        this.updateSummary(props.customer)
	}

	updateSummary(username) {
        myAxios.get('/current_customer_summary', {
          params: {
              customer: username,
          }
        })
        .then(response => {
          console.log(response);
          var res = {}
          if (response.data.result.length !== 0) {
            res['customer_orders'] = response.data.result['orders_and_fee'][0][0]
            res['customer_orders_costs'] = response.data.result['orders_and_fee'][0][1]
          }
          this.setState({
            monthlySummary: res,
            isLoading: false
          })
        })
        .catch(error => {
          console.log(error);
        });
	}
	
	componentWillReceiveProps(nextProps) {
        this.setState({ 
            currentCustomer: nextProps.customer,
            isLoading: true 
        });  
        this.updateSummary(nextProps.customer)
	}
	
	orderStatistics() {
        return (
            <Statistic.Group horizontal>
                <Statistic>
				<Statistic.Value>{this.state.monthlySummary['customer_orders'] == null ? 0
					: this.state.monthlySummary['customer_orders']}</Statistic.Value>
                <Statistic.Label>Order{this.state.monthlySummary['customer_orders'] !== 1 ? 's':''}</Statistic.Label>
                </Statistic>
                <Statistic>
                <Statistic.Value>${this.state.monthlySummary['customer_orders_costs'] == null ?
                                0 : this.state.monthlySummary['customer_orders_costs'].toFixed(2)}</Statistic.Value>
                <Statistic.Label>Total Costs</Statistic.Label>
                </Statistic>
            </Statistic.Group>
        );
    }
	
	render() {
        if (this.state.isLoading) {
            return null// <Loader active/>
    }
  
		return (
		<Card color='teal' style={{marginLeft: '10%'}}>
			<Card.Content>
				<Card.Header>This Month's Stats</Card.Header>
			</Card.Content>
			<Card.Content>
				{this.orderStatistics()}
			</Card.Content>
			<Card.Content>
                <ViewCustomerModal customer={this.state.currentCustomer}/>
              </Card.Content>
		</Card>
		)
    }
}   

export default CustomerSummary;
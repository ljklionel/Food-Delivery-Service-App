import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table, Statistic } from 'semantic-ui-react';
import ViewMonthlyModal from './ViewMonthlyModal.js';
import myAxios from '../../webServer.js'

class MonthlySummary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
			contents: {}
        }
	}
	
	componentDidMount() {
        myAxios.get('/all_customer_summary')
          .then(response => {
			console.log(response);
			if (response.data.result.length !== 0) {
				var res = {}
				res['year'] = response.data.result['orders_and_fee'][0][2]
				res['month'] = response.data.result['orders_and_fee'][0][3]
				res['all_orders'] = response.data.result['orders_and_fee'][0][0]
				res['all_orders_costs'] = response.data.result['orders_and_fee'][0][1]
				res['all_new_customers'] = response.data.result['all_new_customers'][0][0]
				this.setState({
				contents: res
				})
			}
			this.setState({isLoading: false})
          })
          .catch(error => {
            console.log(error);
          });
	}

	monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

	orderStatistics() {
        return (
            <Statistic.Group horizontal>
                <Statistic>
					<Statistic.Value>{this.monthNames[this.state.contents['month'] -1]} {this.state.contents.length == 0? 0 :this.state.contents['year']}
					</Statistic.Value>
                </Statistic>
				<Statistic>
					<Statistic.Value>{this.state.contents.length == 0? 0 :this.state.contents['all_orders']}
					</Statistic.Value>
					<Statistic.Label>Orders</Statistic.Label>
                </Statistic>
                <Statistic>
                <Statistic.Value>  ${(this.state.contents.length == 0 ? 0 : this.state.contents['all_orders_costs'] == null) ?
                                0 : this.state.contents['all_orders_costs'].toFixed(2)}</Statistic.Value>

				<Statistic.Label>Spent</Statistic.Label>
                </Statistic>
				<Statistic>
					<Statistic.Value>{this.state.contents.length == 0? 0 :this.state.contents['all_new_customers']}
					</Statistic.Value>
					<Statistic.Label>New customers</Statistic.Label>
                </Statistic>
            </Statistic.Group>
		);
	}
      
	
    render() {
		if (this.state.isLoading) {
            return null// <Loader active/>
		}
		
		return (
		<Card color='teal' style={{width: 400, marginLeft: "10%"}}>
			<Card.Content>
				<Card.Header>This Month's Stats</Card.Header>
			</Card.Content>
			<Card.Content>
				{this.orderStatistics()}
			</Card.Content>
			<Card.Content>
                <ViewMonthlyModal/>
              </Card.Content>
		</Card>
		)
	}
}

export default MonthlySummary;

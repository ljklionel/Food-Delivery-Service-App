import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table, Statistic } from 'semantic-ui-react';
import ViewMonthlyModal from './ViewMonthlyModal.js';
import myAxios from '../../webServer.js'

class MonthlySummary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
			contents: []
        }
	}
	
	componentDidMount() {
        myAxios.get('/all_customer_summary')
          .then(response => {
			console.log(response);
			if (response.data.result.length !== 0) {
				this.setState({
				contents: response.data.result[0]
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
					<Statistic.Value>{this.monthNames[this.state.contents['month'] -1]}
					</Statistic.Value>
                </Statistic>
				<Statistic>
					<Statistic.Value>{this.state.contents.length == 0? 0 :this.state.contents['year']}
					</Statistic.Value>
                </Statistic>
				<Statistic>
					<Statistic.Label>Total orders: </Statistic.Label>
					<Statistic.Value>{this.state.contents.length == 0? 0 :this.state.contents['all_orders']}
					</Statistic.Value>
                </Statistic>
                <Statistic>
				<Statistic.Label>Total Orders' Costs: </Statistic.Label>
                <Statistic.Value>  ${(this.state.contents.length == 0 ? 0 : this.state.contents['all_orders_costs'] == null) ?
                                0 : this.state.contents['all_orders_costs'].toFixed(1)}</Statistic.Value>
                </Statistic>
				<Statistic>
					<Statistic.Label>Total new customers: </Statistic.Label>
					<Statistic.Value>{this.state.contents.length == 0? 0 :this.state.contents['all_new_customers']}
					</Statistic.Value>
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

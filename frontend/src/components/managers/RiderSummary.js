import React, { Component } from 'react'
import { Statistic, Card, Header, Button, Table, Grid } from 'semantic-ui-react';
import myAxios from '../../webServer.js'
import ViewRiderModal from './ViewRiderModal.js';

class RiderSummary extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            monthlySummary: {},
            currentRider: props.rider
        }
        this.updateSummary(props.customer)
	}

	updateSummary(username) {
        myAxios.get('/current_rider_summary', {
          params: {
              rider: username,
          }
        })
        .then(response => {
          console.log(response);
          this.setState({
            monthlySummary: response.data.result,
            isLoading: false
          })
        })
        .catch(error => {
          console.log(error);
        });
	}
	
	componentWillReceiveProps(nextProps) {
        this.setState({ 
            currentRider: nextProps.rider,
            isLoading: true 
        });  
        this.updateSummary(nextProps.rider)
	}
	
	orderStatistics() {
        return (
          <Grid columns={2}>
            <Grid.Column>
            <Statistic.Group horizontal>
                <Statistic>
                <Statistic.Value>{this.state.monthlySummary['riders_orders'] == null ? 0
                  : this.state.monthlySummary['customer_orders']}</Statistic.Value>
                <Statistic.Label>Order{this.state.monthlySummary['riders_orders'] !== 1 ? 's delivered':' delivered'}</Statistic.Label>
                </Statistic>
                <Statistic>
                <Statistic.Value>{this.state.monthlySummary['hours'] == null ?
                                0 : this.state.monthlySummary['hours'].toFixed(1)}</Statistic.Value>
                <Statistic.Label>Hour{this.state.monthlySummary['hours'] !== 1 ? 's worked':' worked'}</Statistic.Label>
                </Statistic>
                <Statistic>
                <Statistic.Value>${this.state.monthlySummary['salary'] == null ?
                                0 : this.state.monthlySummary['salary'].toFixed(1)}</Statistic.Value>
                <Statistic.Label>earned</Statistic.Label>
                </Statistic>
            </Statistic.Group>
            </Grid.Column>
            <Grid.Column>
            <Statistic.Group horizontal>
            <Statistic>
            <Statistic.Value>{this.state.monthlySummary['delivery_time'] == null ?
                            0 : this.state.monthlySummary['delivery_time'].toFixed(1)}</Statistic.Value>
            <Statistic.Label>minutes of delivery time on average</Statistic.Label>
            </Statistic>
            <Statistic>
            <Statistic.Value>{this.state.monthlySummary['num_rating'] == null ?
                            0 : this.state.monthlySummary['num_rating'].toFixed(1)}</Statistic.Value>
            <Statistic.Label>Rating{this.state.monthlySummary['num_rating'] !== 1 ? 's':''}</Statistic.Label>
            </Statistic>
            <Statistic>
            <Statistic.Label>Average Rating: </Statistic.Label>
            <Statistic.Value>{this.state.monthlySummary['avg_rating'] == null ?
                            0 : this.state.monthlySummary['avg_rating'].toFixed(1)}</Statistic.Value>
            </Statistic>
        </Statistic.Group>
        </Grid.Column>
        </Grid>
        );
    }
	
	render() {
        if (this.state.isLoading) {
            return null// <Loader active/>
		}
		
		return (
		<Card color='teal' style={{width: '60%', marginLeft: '10%'}}>
			<Card.Content>
				<Card.Header>This Month's Stats</Card.Header>
			</Card.Content>
			<Card.Content>
				{this.orderStatistics()}
			</Card.Content>
      <Card.Content>
        <ViewRiderModal rider={this.state.currentRider}/>
      </Card.Content>
		</Card>
		)
    }
}   

export default RiderSummary;
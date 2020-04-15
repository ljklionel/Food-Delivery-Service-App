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
        this.updateSummary(props.rider)
	}

	updateSummary(username) {
        myAxios.get('/current_rider_summary', {
          params: {
              rider: username,
          }
        })
        .then(response => {
          console.log(response);
          var res = {}
          if (response.data.result['orders_and_ratings'].length !== 0) {
            res['rider_orders'] = response.data.result['orders_and_ratings'][0][0]
            res['delivery_time'] = response.data.result['orders_and_ratings'][0][1]
            res['num_rating'] = response.data.result['orders_and_ratings'][0][2]
            res['avg_rating'] = response.data.result['orders_and_ratings'][0][3]
            res['salary'] = response.data.result['salary'] + response.data.result['orders_and_ratings'][0][6]
            res['hours_worked'] = response.data.result['hours_worked']
            res['work_type'] = response.data.result['work_type']
          } else {
            res = null
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
                <Statistic.Value>{this.state.monthlySummary['rider_orders'] == null ? 0
                  : this.state.monthlySummary['rider_orders']}</Statistic.Value>
                <Statistic.Label>Order{this.state.monthlySummary['rider_orders'] !== 1 ? 's delivered':' delivered'}</Statistic.Label>
                </Statistic>
                {this.state.monthlySummary['work_type'] == 'fulltime'? <Statistic>
                <Statistic.Value>{this.state.monthlySummary['hours_worked'] == null ?
                                0 : this.state.monthlySummary['hours_worked']}</Statistic.Value>
                <Statistic.Label>Hour{this.state.monthlySummary['hours_worked'] !== 1 ? 's worked':' worked'}</Statistic.Label>
                </Statistic>:<></>}
                <Statistic>
                <Statistic.Value>${this.state.monthlySummary['salary'] == null ?
                                0 : this.state.monthlySummary['salary'].toFixed(2)}</Statistic.Value>
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
                            0 : this.state.monthlySummary['num_rating']}</Statistic.Value>
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
        {this.state.monthlySummary != null
        ? this.orderStatistics()
        : <span>No orders this month</span>}
			</Card.Content>
      <Card.Content>
        <ViewRiderModal rider={this.state.currentRider}/>
      </Card.Content>
		</Card>
		)
    }
}   

export default RiderSummary;
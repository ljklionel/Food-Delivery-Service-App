import React, { Component } from 'react'
import { Statistic, Card, Header, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js';
import ViewLocationModal from './ViewLocationModal.js';

class LocationSummary extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            hourlySummary: {},
            currentLocation: props.location
        }
        this.updateSummary(props.location)
	}

	updateSummary(loc) {
        myAxios.get('/current_location_summary', {
          params: {
              location: loc,
          }
        })
        .then(response => {
          console.log(response);
          this.setState({
            hourlySummary: response.data.result[0],
            isLoading: false
          });
        })
        .catch(error => {
          console.log(error);
        });
	}
	
	componentWillReceiveProps(nextProps) {
        this.setState({ 
            currentLocation: nextProps.location,
            isLoading: true 
        });  
        this.updateSummary(nextProps.location)
	}
	
	orderStatistics() {
        return (
            <Statistic.Group horizontal>
                <Statistic>
				<Statistic.Value>{this.state.hourlySummary['location_orders'] == null ? 0
					: this.state.hourlySummary['location_orders']}</Statistic.Value>
                <Statistic.Label>Order{this.state.hourlySummary['location_orders'] !== 1 ? 's':''}</Statistic.Label>
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
				<Card.Header>Current Hour's Stats</Card.Header>
			</Card.Content>
			<Card.Content>
				{this.orderStatistics()}
			</Card.Content>
			<Card.Content>
                <ViewLocationModal location={this.state.currentLocation}/>
              </Card.Content>
		</Card>
		)
    }
}   

export default LocationSummary;
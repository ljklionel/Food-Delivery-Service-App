import React, { Component } from 'react'
import { Statistic, Card, Header, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class MonthlySummary extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            monthlySummary: {},
            currentRestaurant: props.restaurant
        }
        this.updateSummary(props.restaurant)
    }

    updateSummary(rname) {
        myAxios.get('/current_restaurant_summary', {
          params: {
              restaurant: rname,
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
            currentRestaurant: nextProps.restaurant,
            isLoading: true 
        });  
        this.updateSummary(nextProps.restaurant)
    }

    orderStatistics() {
        return (
            <Statistic.Group horizontal>
                <Statistic>
                <Statistic.Value>{this.state.monthlySummary['completed_orders']}</Statistic.Value>
                <Statistic.Label>Completed Order{this.state.monthlySummary['completed_orders'] != 1 ? 's':''}</Statistic.Label>
                </Statistic>
                <Statistic>
                <Statistic.Value>${this.state.monthlySummary['total_cost'] == null ?
                                0 : this.state.monthlySummary['total_cost'].toFixed(1)}</Statistic.Value>
                <Statistic.Label>Total</Statistic.Label>
                </Statistic>
            </Statistic.Group>
        );
    }
    
    top5Statistics() {
        if (this.state.monthlySummary['top_five'].length > 0) {
            return (
                <div>
                <Header>Top 5</Header>
                    <Table basic='very' celled>
                        <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell>Item</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                        </Table.Row>
                        </Table.Header>
                        <Table.Body>
                        {this.state.monthlySummary['top_five'].map((item, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>
                                    {index+1}
                                </Table.Cell>
                                <Table.Cell>
                                    {item[0]}
                                </Table.Cell>
                                <Table.Cell>
                                    {item[1]}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        </Table.Body>
                    </Table>
                </div>
            );
        } else {
            return (
                <p><i>Get more orders to see more stats!</i></p>
            )
        }
    }

    render() {
        if (this.state.isLoading) {
            return null// <Loader active/>
          }
          return (
            <Card color='teal' style={{maxWidth: 250}}>
              <Card.Content>
                <Card.Header>This Month's Stats</Card.Header>
              </Card.Content>
              <Card.Content>
                {this.orderStatistics()}
              </Card.Content>
              
              <Card.Content>
                {this.top5Statistics()}
              </Card.Content>
              <Card.Content>
                <Button fluid basic>View All</Button>
              </Card.Content>
            </Card>
          )
    }
}   

export default MonthlySummary;
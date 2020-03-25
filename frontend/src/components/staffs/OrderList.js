import React, { Component } from 'react'
import { Grid, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class OrderList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            orders: [],
            currentRestaurant: props.restaurant
        }
        this.updateMenu(props.restaurant)
    }

    updateMenu(rname) {
        myAxios.get('/restaurant_orders', {
          params: {
              restaurant: rname,
              limit: 20,
              offset: 0
          }
        })
        .then(response => {
          console.log(response);
          this.setState({
            orders: response.data.result,
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
      this.updateMenu(nextProps.restaurant)
    }
    

    render() {
        if (this.state.isLoading) {
            return null//<Loader active/>
          }
          return (
            <Card color='yellow' style={{maxWidth: 250}}>
              <Card.Content>
                <Card.Header>Today's Order</Card.Header>
              </Card.Content>
              <Card.Content>
                <Table basic='very' celled>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Item</Table.HeaderCell>
                        <Table.HeaderCell>Quantity</Table.HeaderCell>
                        <Table.HeaderCell>Time</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    {this.state.orders.map((item) => (
                        <Table.Row key={item[0]}>
                            <Table.Cell>
                                {item[0]}
                            </Table.Cell>
                            <Table.Cell>
                                {item[1]}
                            </Table.Cell>
                            <Table.Cell>
                                {item[2].substring(17,22)}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                    </Table.Body>
                </Table>
              </Card.Content>
              <Card.Content>
                <Button fluid basic>View All</Button>
              </Card.Content>
            </Card>
          )
    }
}   

export default OrderList;
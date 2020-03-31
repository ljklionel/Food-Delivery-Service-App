import React, { Component } from 'react'
import { Grid, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class CompletedOrders extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            orders: [],
            currentCustomer: props.currentCustomer
        }
        this.updateOrders(props.currentCustomer)
    }

    updateOrders(currentCustomer) {
        myAxios.get('/customer_orders', {
          params: {
              currentCustomer: currentCustomer,
              limit: 5,
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
            currentCustomer: nextProps.customer,
            isLoading: true 
        });  
        this.updateOrders(nextProps.customer)
      }

      render() {
        if (this.state.isLoading) {
          return null//<Loader active/>
        }
        var content
        
        if (this.state.orders.length == 0) {
          content = <p><i>No orders yet!</i></p>
        } else {
          content = (
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
          );
        }
        return (
          <Card color='yellow' style={{maxWidth: 250}}>
            <Card.Content>
              <Card.Header>Today's Order</Card.Header>
            </Card.Content>
            <Card.Content>
              {content}
            </Card.Content>
          </Card>
        )
    }

}

export default CompletedOrders;
import React, { Component } from 'react'
import { Grid, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class CompletedOrders extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            orders: [],
            orderSubmitted: props.orderSubmitted,
            currentCustomer: props.currentCustomer
        }
        this.updateOrders(props.currentCustomer)
    }

    updateOrders(currentCustomer) {
      console.log("UPDATE ORDERS")
        myAxios.get('/customer_orders', {
          params: {
              currentCustomer: currentCustomer,
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
        console.log("ComponentwillreceivePRops nextProps: ", nextProps)
        this.setState({ 
            currentCustomer: nextProps.currentCustomer,
            orderSubmitted: nextProps.orderSubmitted,
            isLoading: true 
        });  
        this.updateOrders(nextProps.currentCustomer)
      }

    static getDerivedStateFromProps(nextProps, prevState) {
      console.log("getDerivedStateFromProps, nextProps: ", nextProps, " prevState: ",  prevState)
      if(nextProps.orderSubmitted !== prevState.orderSubmitted) {
        return {
          currentCustomer: nextProps.currentCustomer,
          orderSubmitted: nextProps.orderSubmitted,
          isLoading: true 
        }
      }
      else return null
    }

    componentDidUpdate(prevProps, prevState) {
      console.log("componentDidUpdate, prevProps: ", prevProps, " prevState: ",  prevState)
      // this.updateOrders(prevProps.customer)

      if(prevProps.orderSubmitted !== this.props.orderSubmitted) {
        console.log("Trying to update orders in if statement")
        this.setState({orderSubmitted: this.state.orderSubmitted++})
        this.updateOrders(prevProps.customer)
      }

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
                      <Table.HeaderCell>OrderTime</Table.HeaderCell>
                      <Table.HeaderCell>Payment</Table.HeaderCell>
                      <Table.HeaderCell>Location</Table.HeaderCell>
                      <Table.HeaderCell>Fee</Table.HeaderCell>
                      <Table.HeaderCell>Request received by rider</Table.HeaderCell>
                      <Table.HeaderCell>Rider arrived at restaurant</Table.HeaderCell>
                      <Table.HeaderCell>Rider left restaurant</Table.HeaderCell>
                      <Table.HeaderCell>Rider reached</Table.HeaderCell>
                      <Table.HeaderCell>Rider name</Table.HeaderCell>
                      <Table.HeaderCell>Restaurant name</Table.HeaderCell>
                      <Table.HeaderCell>Order ID</Table.HeaderCell>
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
                          <Table.Cell>
                              {item[3]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[4]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[5]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[6]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[7]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[8]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[9]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[10]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[11]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[12]}
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
              <Card.Header>My Orders</Card.Header>
            </Card.Content>
            <Card.Content>
              {content}
            </Card.Content>
          </Card>
        )
    }

}

export default CompletedOrders;
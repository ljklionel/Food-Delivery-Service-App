import React, { Component } from 'react'
import { Card, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'
import OrderDetailsModal from './OrderDetailsModal.js';


class CompletedOrders extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            orders: [],
            ordersGroupedByID: [],
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
              limit: 30,
              offset: 0
          }
        })
        .then(response => {
          console.log(response);
          var ordersGroupedByID = []
          var i;
          var prevOid = -1
          var orders = response.data.result
          for (i = 0; i < orders.length; i++) { 
            if (ordersGroupedByID.length == 6) {
              break
            }
            if (orders[i][12] === prevOid) {
              ordersGroupedByID[ordersGroupedByID.length - 1].push(orders[i])
            } else {
              ordersGroupedByID.push([orders[i]])
            }
            prevOid = orders[i][12]
          }

          console.log("Orders: ", orders)
          console.log("Orders grouped by ID: ", ordersGroupedByID)
          this.setState({
            orders: orders,
            ordersGroupedByID: ordersGroupedByID,
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

      render() {
        if (this.state.isLoading) {
          return null//<Loader active/>
        }
        var content
        
        if (this.state.orders.length === 0) {
          content = <p><i>No orders yet!</i></p>
        } else {
          content = (
            <Table basic='very' celled>
                  <Table.Header>
                  <Table.Row>
                      <Table.HeaderCell>OrderID</Table.HeaderCell>
                      <Table.HeaderCell>Restaurant</Table.HeaderCell>
                      <Table.HeaderCell>Done</Table.HeaderCell>
                  </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {this.state.ordersGroupedByID.map((item) => (
                      <Table.Row key={item[0][12]}>
                        <Table.Cell>
                        <OrderDetailsModal orderid={item[0][12]} orderDetails={item}></OrderDetailsModal>
                        </Table.Cell>
                          <Table.Cell>
                           {item[0][11]}
                          </Table.Cell>
                        <Table.Cell>
                         {item[0][9] === null ? "No" : "Yes"}
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
              <Card.Header>
                My Orders
                </Card.Header>
            </Card.Content>
            <Card.Content>
              {content}
            </Card.Content>
          </Card>
        )
    }

}

export default CompletedOrders;
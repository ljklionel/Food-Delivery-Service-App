import React, { Component } from 'react'
import { Modal, Form, Button, Table, Tab } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'
import OrderMenuModal from '../Menu/OrderMenuModal.js';
import ReviewModal from './ReviewModal.js';
import RatingModal from './RatingModal.js';
import CheckOutModal from '../Menu/CheckOutModal.js';


class OrderDetailsModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            orderDetails: this.props.orderDetails,
            orderid: this.props.orderid,
            modalOpen: false
        }

    }

    handleRatingChange = () => {

    }

    handleOpen = () => {
        console.log("Order details: ", this.state.orderDetails)
        this.setState({ 
            modalOpen: true,
        })
    }

    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    render() {
        var content = (
            <Table basic='very' celled>
                 <Table.Header>
                  <Table.Row>
                      <Table.HeaderCell>Restaurant</Table.HeaderCell>
                      <Table.HeaderCell>OrderTime</Table.HeaderCell>
                      <Table.HeaderCell>Payment</Table.HeaderCell>
                      <Table.HeaderCell>Loc</Table.HeaderCell>
                      <Table.HeaderCell>Fee</Table.HeaderCell>
                      <Table.HeaderCell>Rider name</Table.HeaderCell>
                      <Table.HeaderCell>Request received by rider</Table.HeaderCell>
                      <Table.HeaderCell>Rider arrived at restaurant</Table.HeaderCell>
                      <Table.HeaderCell>Rider left restaurant</Table.HeaderCell>
                      <Table.HeaderCell>Rider reached</Table.HeaderCell>
                  </Table.Row>
                  </Table.Header>
                  <Table.Body>
                        <Table.Row key={this.state.orderDetails[0]}>
                            <Table.Cell>
                                {this.state.orderDetails[0][11]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][2].substring(17,22)}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][3]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][4]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][5]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][10]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][6]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][7]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][8]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.orderDetails[0][9]}
                            </Table.Cell>

                        </Table.Row>
                </Table.Body>

                  <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Item</Table.HeaderCell>
                    <Table.HeaderCell>Qty</Table.HeaderCell>
                  </Table.Row>
                  </Table.Header>
                <Table.Body>
                  {this.state.orderDetails.map((item) => (
                        <Table.Row key={item}>
                            <Table.Cell>
                                {item[0]}
                            </Table.Cell>
                            <Table.Cell>
                                {item[1]}
                            </Table.Cell>
                                <ReviewModal fname={item[0]} orderid={this.state.orderid} 
                                        restaurant={item[11]}/>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        )
        return (
            <Modal trigger={<Button onClick={this.handleOpen} fluid basic>{this.state.orderid}</Button>}
                    open={this.state.modalOpen}
                    onClose={this.handleClose}>
                <Modal.Header>Order ID: {this.state.orderDetails[0][12]} </Modal.Header>
                <Modal.Content>
                    {content}
                </Modal.Content>
                <Table.Cell>
                    <RatingModal orderid={this.state.orderid} riderUsername={this.state.orderDetails[0][10]} restaurant={this.state.orderDetails[0][11]}/>
                </Table.Cell>
                <Table.Cell>
                    {/* <OrderMenuModal/> */}
                </Table.Cell>
                <Modal.Actions>
                    <Button onClick={this.handleClose}>
                        Return
                    </Button>
                </Modal.Actions>
            </Modal>)

    }
}

export default OrderDetailsModal;
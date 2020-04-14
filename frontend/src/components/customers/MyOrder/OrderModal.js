import React, { Component } from 'react'
import { Modal, Form, Button, Table, Tab } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'
import WriteReviewModal from './WriteReviewModal.js';
import RatingModal from './RatingModal.js';

class OrderModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            orderDetails: this.props.orderDetails,
            orderid: this.props.orderid,
            modalOpen: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            orderDetails: nextProps.orderDetails,
        });
    }


    handleOpen = () => {
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
                            {this.state.orderDetails[0][2].substring(0, 22)}
                            {/* {this.state.orderDetails[0][2]} */}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][3]}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][4]}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][5].toFixed(2)}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][10]}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][6] == null ? '' : this.state.orderDetails[0][6].split(' ')[4]}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][7] == null ? '' : this.state.orderDetails[0][7].split(' ')[4]}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][8] == null ? '' : this.state.orderDetails[0][8].split(' ')[4]}
                        </Table.Cell>
                        <Table.Cell>
                            {this.state.orderDetails[0][9] == null ? '' : this.state.orderDetails[0][9].split(' ')[4]}
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
                            <WriteReviewModal submitReview={this.props.submitReview} fname={item[0]} orderid={this.state.orderid}
                                restaurant={item[11]} />
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        )
        return (
            <Modal trigger={<Button color='blue' onClick={this.handleOpen} fluid basic>{this.state.orderid}</Button>}
            //fluid basic
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                <Modal.Header>Order ID: {this.state.orderDetails[0][12]} </Modal.Header>
                <Modal.Content>
                    {content}
                </Modal.Content>
                <Table.Cell>
                    <RatingModal orderid={this.state.orderid} riderUsername={this.state.orderDetails[0][10]} restaurant={this.state.orderDetails[0][11]} />
                </Table.Cell>
                <Table.Cell>
                </Table.Cell>
                <Modal.Actions>
                    <Button onClick={this.handleClose}>
                        Return
                    </Button>
                </Modal.Actions>
            </Modal>)

    }
}

export default OrderModal;
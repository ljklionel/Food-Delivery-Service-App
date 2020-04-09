import React, { Component } from 'react'
import { Modal, Form, Button, Table } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'
import Menu from './Menu.js'

class CheckOutModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            modalOpen: false
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })

    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    handleSubmit = () => {
        this.props.handleSubmit()
        this.setState({
            modalOpen: false
        })
    }

    render() {
        var content
        content = (
            <Table basic='very' celled>
                <Table.Row>
                    <Table.Cell>
                        Use reward point: {this.props.checkoutInfo.rewardPoint}
                    </Table.Cell>
                    <Table.Cell>
                        <Form.Field>
                            <Form.Input
                                placeholder='0'
                                value={this.state.useRewardPoint}
                                onChange={this.handleRewardPointChange}
                            />
                        </ Form.Field>
                    </Table.Cell>
                    <Table.Cell>
                        Price: {this.state.totalPrice}
                    </Table.Cell>
                    <Table.Cell>
                        Fee: {this.state.fee}
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>
                        Minimum spending: {this.state.minSpend}
                    </Table.Cell>
                    <Table.Cell>
                    </Table.Cell>
                    <Table.Cell>
                        Discount:
                    </Table.Cell>
                    <Table.Cell>
                        {this.state.discount}
                    </Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>
                        Amount Payable:
                                </Table.Cell>
                    <Table.Cell>
                        {this.state.totalPrice + this.state.fee - this.state.discount}
                    </Table.Cell>
                </Table.Row>
            </Table>
        )

        return (
            <Modal trigger={<Button color='blue' onClick={this.handleOpen}>Checkout</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                <Modal.Header>Order Confirmation</Modal.Header>
                <Modal.Content>
                    {content}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button primary onClick={this.handleSubmit}>
                        Submit
                    </Button>
                </Modal.Actions>
            </Modal>)
    }
}

export default CheckOutModal;
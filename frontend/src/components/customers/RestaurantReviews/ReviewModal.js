import React, { Component } from 'react'
import { Modal, Form, Button, Table, Tab } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'

class ReviewModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            reviewDetails: this.props.reviewDetails,
            reviewer: this.props.reviewer,
            modalOpen: false
        }
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
        return (
            <Modal trigger={<Button color='red' onClick={this.handleOpen} fluid basic>{this.state.reviewer}</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                <Modal.Header>Reviewer: {this.state.reviewer} </Modal.Header>
                <Modal.Content>
                    Item: {this.props.reviewDetails[0]}
                    <br></br>
                    Restaurant: {this.props.restaurant}
                    <br></br>
                    {/* OrderTime: {this.props.orderTime.substring(0, 22)}   */}
                    OrderTime: {this.props.orderTime.substring(0, this.props.orderTime.length - 3)}
                    <br></br><br></br>
                    Review: {this.props.reviewDetails[1]}
                </Modal.Content>
                <Table.Cell>
                    {/* <RatingModal orderid={this.state.orderid} riderUsername={this.state.orderDetails[0][10]} restaurant={this.state.orderDetails[0][11]}/> */}
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

export default ReviewModal;
import React, { Component } from 'react'
import { Modal, Form, Button, Table } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'

class WriteReviewModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            restaurant: null,
            modalOpen: false,
            review: null
        }
    }

    handleOpen = () => {
        this.setState({ 
            modalOpen: true,
        })
    }

    handleReviewChange = (e, {value}) => {
        this.state.review = value
    }

    handleSave = () => {
        myAxios.post('edit_review', {
            orderid: this.props.orderid,
            review: this.state.review,
            fname: this.props.fname,
            restaurant: this.state.restaurant
          })
          .then(response => {
              console.log("Edit_review")
            this.setState({ 
                modalOpen: false,
            })
            this.props.submitReview()
          })
          .catch(error => {
            console.log(error);
          });
    }

    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    render() {
        var content
        if (this.state.isLoading) {
            content = null
        } else {
            content = (
                    <Form.Field>
                    <Form.Input
                        placeholder='Leave a review'
                        onChange={this.handleReviewChange}/>
                    </Form.Field>
                )
        }

        return (
        <Modal trigger={<Button onClick={this.handleOpen} fluid basic>Leave a review</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
            <Modal.Header>Restaurant: {this.props.restaurant}</Modal.Header>
            <Modal.Content>
                Order ID: {this.props.orderid} 
                <br></br>
                Item: {this.props.fname}                 
                <br></br>
                {content}
            </Modal.Content>
            
            <Modal.Actions>
                <Button color='red' onClick={this.handleClose}>
                    Cancel
                </Button>
                <Button primary onClick={this.handleSave}>
                    Submit review
                </Button>
            </Modal.Actions>
        </Modal>)
    }
}

export default WriteReviewModal;
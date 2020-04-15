import React, { Component } from 'react'
import { Modal, Form, Button, Table, Menu, Icon, Segment } from 'semantic-ui-react';
import myAxios from '../webServer.js'

class EditPhoneModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            modalOpen: false,
            phoneNumber: this.props.phoneNumber
        }
    }

    handleOpen = () => this.setState({ modalOpen: true, phoneNumber: this.props.phoneNumber })
  
    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSave = () => {
        const updates = {phoneNumber: this.state.phoneNumber}
        myAxios.post('edit_profile', {
            updates: updates
          })
          .then(response => {
            console.log(response);  
            this.setState({ 
                modalOpen: false
            })
            this.props.submitHandler(updates)
            alert('Update successful!')
          })
          .catch(error => {
            console.log(error);
          });
        this.handleClose()
    }

    form() {
        const phoneNumber = this.state.phoneNumber
        return (
            <Form size='large'>
            <Form.Input 
                label='Phone Number'
                fluid placeholder='Phone Number' 
                name='phoneNumber'
                value={phoneNumber}
                onChange={this.handleChange}/>
        </Form>
        )
    }
    render() {
        return (
            <Modal trigger={<Menu.Item><Button basic icon onClick={this.handleOpen}><Icon name='write'/></Button></Menu.Item>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>

                <Modal.Header>Edit Phone Number</Modal.Header>
                <Modal.Content>
                    {this.form()}
                </Modal.Content>


                <Modal.Actions>
                    <Button color='red' onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button primary onClick={this.handleSave}>
                        Save
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default EditPhoneModal;
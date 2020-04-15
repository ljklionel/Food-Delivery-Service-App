import React, { Component } from 'react'
import { Modal, Form, Button, Table, Menu, Icon, Segment } from 'semantic-ui-react';
import myAxios from '../webServer.js'

class EditNameModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            modalOpen: false,
            firstName: props.firstName,
            lastName: props.lastName
        }
    }

    handleOpen = () => this.setState({ modalOpen: true, firstName: this.props.firstName, lastName: this.props.lastName })
  
    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSave = () => {
        const updates = {firstName: this.state.firstName, lastName: this.state.lastName}
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
        const firstName = this.state.firstName
        const lastName = this.state.lastName
        return (
            <Form size='large'>
            <Form.Input 
                label='First Name'
                fluid placeholder='First Name' 
                name='firstName'
                value={firstName}
                onChange={this.handleChange}/>
            <Form.Input 
                label='Last Name'
                fluid placeholder='Last Name' 
                name='lastName'
                value={lastName}
                onChange={this.handleChange}/>
        </Form>
        )
    }
    render() {
        return (
            <Modal trigger={<Menu.Item><Button basic icon onClick={this.handleOpen}><Icon name='write'/></Button></Menu.Item>}
                open={this.state.modalOpen}
                onClose={this.handleClose}o>

                <Modal.Header>Edit Name</Modal.Header>
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

export default EditNameModal;
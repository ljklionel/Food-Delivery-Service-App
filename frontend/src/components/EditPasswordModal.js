import React, { Component } from 'react'
import { Modal, Form, Button, Table, Menu, Icon, Segment } from 'semantic-ui-react';
import myAxios from '../webServer.js'

class EditPasswordModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            modalOpen: false,
            oldPassword: '',
            newPassword: ''
        }
    }

    handleOpen = () => this.setState({ modalOpen: true, oldPassword: '', newPassword: '' })
  
    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    handleSave = () => {
        const updates = {oldPassword: this.state.oldPassword, newPassword: this.state.newPassword}
        myAxios.post('edit_password', {
            updates: updates
          })
          .then(response => {
            console.log(response);  
            if (response.data.result['ok']) {
                this.props.submitHandler(updates)
                this.handleClose()
                alert('Update successful!')
            } else {
                alert('Wrong password!')
            }
            this.setState({oldPassword: '', newPassword: ''})
          })
          .catch(error => {
            console.log(error);
            this.setState({oldPassword: '', newPassword: ''})
          });
    }

    form() {
        const oldPassword = this.state.oldPassword
        const newPassword = this.state.newPassword
        return (
            <Form size='large'>
            <Form.Input 
                label='Old Password'
                fluid placeholder='Old Password'
                type='password'
                name='oldPassword'
                value={oldPassword}
                onChange={this.handleChange}/>
            <Form.Input 
                label='New Password'
                fluid placeholder='New Password' 
                type='password'
                name='newPassword'
                value={newPassword}
                onChange={this.handleChange}/>
        </Form>
        )
    }
    render() {
        return (
            <Modal trigger={<Menu.Item><Button basic icon onClick={this.handleOpen}><Icon name='write'/></Button></Menu.Item>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>

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

export default EditPasswordModal;
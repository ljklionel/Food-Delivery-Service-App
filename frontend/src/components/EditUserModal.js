import React, { Component } from 'react'
import { Modal, Form, Button, Table, Menu, Icon } from 'semantic-ui-react';
import EditNameModal from './EditNameModal.js'
import myAxios from '../webServer.js'
import EditPhoneModal from './EditPhoneModal.js';
import EditPasswordModal from './EditPasswordModal.js';

class EditUserModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            modalOpen: false,
            isLoading: true,
            username: '',
            firstName: '',
            lastName: '',
            phoneNumber: ''
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    componentDidMount() {
        myAxios.get('/user_data')
          .then(response => {
            console.log(response);
            this.setState({
                isLoading: false,
                username: response.data.result[0],
                firstName: response.data.result[1],
                lastName: response.data.result[2],
                phoneNumber: response.data.result[3]
            })
          })
          .catch(error => {
            console.log(error);
          });
    }

    submitHandler = updates => this.setState(updates)

    render() {
        var content
        if (this.state.isLoading) {
            content = null
        } else {
            content = <Table basic='very'>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Username</Table.Cell>
                        <Table.Cell>{this.state.username}</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell>Password</Table.Cell>
                        <Table.Cell>******</Table.Cell>
                        <Table.Cell><EditPasswordModal submitHandler={this.submitHandler}/></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Name</Table.Cell>
                        <Table.Cell>{this.state.firstName + ' ' + this.state.lastName}</Table.Cell>
                        <Table.Cell><EditNameModal firstName={this.state.firstName} lastName={this.state.lastName} submitHandler={this.submitHandler}/></Table.Cell>
                    </Table.Row>

                    <Table.Row>
                        <Table.Cell>Phone number</Table.Cell>
                        <Table.Cell>{this.state.phoneNumber}</Table.Cell>
                        <Table.Cell><EditPhoneModal phoneNumber={this.state.phoneNumber} submitHandler={this.submitHandler}/></Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        }
        return (
            <Modal trigger={<Menu.Item onClick={this.handleOpen}><Icon name='setting'/></Menu.Item>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                <Modal.Header>Edit Profile</Modal.Header>
                <Modal.Content>
                    {content}
                </Modal.Content>
                <Modal.Actions>
                    <Button primary onClick={this.handleClose}>
                        Done
                    </Button>
                </Modal.Actions>
            </Modal>
            

        )
    }
}

export default EditUserModal;
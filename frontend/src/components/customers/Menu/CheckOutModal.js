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

    render() {
        var content
        if (this.state.isLoading) {
            content = null
        } else {
            content = (
                <Table basic='very' celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Item</Table.HeaderCell>
                            <Table.HeaderCell>Availability</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    </Table.Body>
                </Table>
            )
        }

        return (
            <Modal trigger={<Button onClick={this.handleOpen} fluid basic>Edit</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                <Modal.Header>Edit Menu</Modal.Header>
                <Modal.Content>
                    {content}
                </Modal.Content>

                <Modal.Actions>
                    <Button color='red' onClick={this.handleClose}>
                        Cancel
                </Button>
                    {/* <Button primary onClick={this.handleSave}>
                    Save
                </Button> */}
                </Modal.Actions>
            </Modal>)
    }
}

export default CheckOutModal;
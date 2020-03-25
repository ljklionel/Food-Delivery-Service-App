import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class AddPromoModal extends Component {
    render() {
        return (
        <Modal trigger={<Button fluid basic>View All</Button>}>
            <Modal.Header>Add Promotion</Modal.Header>
            <Modal.Content image>
            <Image wrapped size='medium' src='/images/avatar/large/rachel.png' />
            <Modal.Description>
                <Header>Default Profile Image</Header>
                <p>
                We've found the following gravatar image associated with your e-mail
                address.
                </p>
                <p>Is it okay to use this photo?</p>
            </Modal.Description>
            </Modal.Content>
        </Modal>)
    }
}

export default AddPromoModal;
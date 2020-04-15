import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';

class DeliveryInfo extends Component {
    state = {
        showModal: true
    };

    handleConfirm = () => {
        this.setState({ showModal: !this.state.showModal });
    };


    render() {
        return (
            <Modal open={this.state.showModal}>
                <Modal.Header>Delivery Info</Modal.Header>
                <Modal.Content>
                    <h4 style={{ marginLeft: '20px' }}>
                        There are 4 different states in the delivery:
                    </h4>
                    <h4 style={{ marginLeft: '20px' }}>
                        Display: Restaurant location -> click next to accept.
                    </h4>
                    <h4 style={{ marginLeft: '20px' }}>
                        Display: Dispatch Time -> click next after arrival at
                        restaurant.
                    </h4>
                    <h4 style={{ marginLeft: '20px' }}>
                        Display: Arrival Time -> click next after collecting the
                        food.
                    </h4>
                    <h4 style={{ marginLeft: '20px' }}>
                        Display: On the way to customer -> click next after
                        delivering.
                    </h4>
                </Modal.Content>
                <Modal.Actions>
                    <Button primary onClick={this.handleConfirm}>
                        Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default DeliveryInfo;

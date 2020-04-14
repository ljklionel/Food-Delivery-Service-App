import React, { Component } from 'react'
import { Modal, Button, Table } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'

class ViewPromoModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            promotions: [],
            currentRestaurant: props.restaurant,
            modalOpen: false
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => this.setState({ modalOpen: false })

    componentDidMount() {
        myAxios.get('/restaurant_promo', {
            params: {
                restaurant: this.state.currentRestaurant
            }
          })
          .then(response => {
            console.log(response);
            this.setState({
              promotions: response.data.result,
              isLoading: false
            })
          })
          .catch(error => {
            console.log(error);
          });
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
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>Description</Table.HeaderCell>
                    <Table.HeaderCell>Discount</Table.HeaderCell>
                    <Table.HeaderCell>Start</Table.HeaderCell>
                    <Table.HeaderCell>End</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {this.state.promotions.map((item) => (
                    <Table.Row key={item[0]}>
                        <Table.Cell>
                            {item[0]}
                        </Table.Cell>
                        <Table.Cell>
                            {item[1]}
                        </Table.Cell>
                        <Table.Cell>
                            {item[4]}%
                        </Table.Cell>
                        <Table.Cell>
                            {item[2].substring(5,16)}
                        </Table.Cell>
                        <Table.Cell>
                            {item[3].substring(5,16)}
                        </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table>
            )
        }
        return (
        <Modal trigger={<Button color='yellow' onClick={this.handleOpen} fluid basic>View All</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
            <Modal.Header>View Promotions</Modal.Header>
            <Modal.Content>
                {content}
            </Modal.Content>
            
            <Modal.Actions>
                <Button primary onClick={this.handleClose}>
                    Done
                </Button>
            </Modal.Actions>
        </Modal>)
    }
}

export default ViewPromoModal;
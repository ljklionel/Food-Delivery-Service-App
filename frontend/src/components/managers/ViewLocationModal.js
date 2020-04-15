import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class ViewLocationModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            contents: [],
            modalOpen: false,
            currentLocation: props.location
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => this.setState({ modalOpen: false })

    componentDidMount() {
        myAxios.get('/current_location_summary', {
            params: {
                location: this.state.currentLocation
            }
          })
          .then(response => {
            console.log(response);
            this.setState({
              contents: response.data.result,
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
            const contents = this.state.contents
            
            content = (
            <Table structured celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Day</Table.HeaderCell>
                    <Table.HeaderCell>Hour</Table.HeaderCell>
                    <Table.HeaderCell>Orders</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {contents.map((item, i) => (
                    <Table.Row key={item['day'] + '-' + item['hour']}>
						<Table.Cell>
							{item['day'].substring(5,16)}
						</Table.Cell>
                        <Table.Cell>
                            {item['hour'] == 0? "12AM": item['hour'] == 12? "12PM" : item['hour'] > 12? (item['hour'] - 12) + 'PM' : item['hour'] + 'AM'}
                        </Table.Cell>
                        <Table.Cell>
                            {item['location_orders']}
                        </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table>
            )
        }
        return (
        <Modal trigger={<Button onClick={this.handleOpen} fluid basic>View All</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
            <Modal.Header>View Statistics</Modal.Header>
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

export default ViewLocationModal;
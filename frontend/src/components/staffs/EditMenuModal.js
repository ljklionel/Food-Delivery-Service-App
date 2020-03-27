import React, { Component } from 'react'
import { Modal, Form, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class EditMenuModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            restaurantMenu: [],
            avail: [],
            currentRestaurant: props.restaurant,
            modalOpen: false
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => {
        const avail = []
        this.state.restaurantMenu.forEach(item => {
            avail.push(item[1])
        });
        this.setState({
            avail: avail,
            modalOpen: false
        })
    }

    handleSave = () => {
        const updates = {}
        this.state.restaurantMenu.forEach((item, i) => {
            updates[item[0]] = this.state.avail[i]
        })
        myAxios.post('edit_availability', {
            restaurant: this.state.currentRestaurant,
            updates: updates
          })
          .then(response => {
            console.log(response);  
            const menu = []
            console.log(this.state.restaurantMenu)
            this.state.restaurantMenu.forEach((item, i) => {
                menu.push([item[0], this.state.avail[i]])
            });
            this.setState({ 
                modalOpen: false,
                restaurantMenu: menu
            })
            this.props.submitHandler(this.state.currentRestaurant)
          })
          .catch(error => {
            console.log(error);
          });

    }

    handleChange = (e, { name, value }) => {
        value = value ? parseInt(value) : 0
        if (value <= 999) {
            const avail = this.state.avail
            avail[name] = value
            this.setState({avail: avail})
        }
    }


    componentDidMount() {
        myAxios.get('/restaurant_items', {
            params: {
                restaurant: this.state.currentRestaurant
            }
          })
          .then(response => {
            console.log(response);
            const avail = []
            response.data.result.forEach(item => {
                avail.push(item[1])
            });
            this.setState({
                restaurantMenu: response.data.result,
                avail: avail,
                isLoading: false
            })
            console.log(this.state)
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
                        <Table.HeaderCell>Item</Table.HeaderCell>
                        <Table.HeaderCell>Availability</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    {this.state.restaurantMenu.map((item, i) => (
                        <Table.Row key={i}>
                            <Table.Cell>
                                {item[0]}
                            </Table.Cell>
                                <Table.Cell>
                                    <Form>
                                        <Form.Field>
                                            <Form.Input
                                                name = {i}
                                                placeholder='avail.'
                                                value={this.state.avail[i]}
                                                onChange={this.handleChange}/>
                                        </ Form.Field>
                                    </Form>
                                </Table.Cell>
                        </Table.Row>
                    ))}
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
                <Button primary onClick={this.handleSave}>
                    Save
                </Button>
            </Modal.Actions>
        </Modal>)
    }
}

export default EditMenuModal;
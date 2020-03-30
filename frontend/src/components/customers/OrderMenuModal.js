import React, { Component } from 'react'
import { Modal, Form, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class OrderMenuModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            restaurantMenu: [],
            avail: [],
            order: [],
            currentRestaurant: props.restaurant,
            modalOpen: false
        }
    }

    handleOpen = () => {
        const order = []
        this.state.restaurantMenu.forEach(item => {
            order.push(0)
        });
        this.setState({ 
            modalOpen: true,
            order: order
        })
    }
  
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
        const order = {}
        const avail = {}

        this.state.restaurantMenu.forEach((item, i) => {
            avail[i] = this.state.avail[i] - this.state.order[i]
            updates[item[0]] = this.state.avail[i]
            order[item[0]] = this.state.order[i]
        })

        this.setState({
            order: order,
            avail: avail
        })

        myAxios.post('edit_availability', {
            restaurant: this.state.currentRestaurant,
            updates: updates
          })
          .then(response => {
            const menu = []
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

          myAxios.post('make_order', {
            restaurant: this.state.currentRestaurant,
            order: order
          })
          .then(response => {
              console.log("Received response from make_order")
            // const menu = []
            // this.state.restaurantMenu.forEach((item, i) => {
            //     menu.push([item[0], this.state.avail[i]])
            // });
            // this.setState({ 
                // modalOpen: false,
                // restaurantMenu: menu
            // })
            console.log(this.state.currentRestaurant)
            this.props.submitOrder(this.state.order)
          })
          .catch(error => {
            console.log(error);
          });

    }

    handleChange = (e, { name, value }) => {
        value = value ? parseInt(value) : 0
        if (value <= this.state.avail[name]) {
            const order = this.state.order
            order[name] = value
            this.setState({order: order})
        }
    }

    anotherChange = (e, {a}) => {

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
            console.log(this.state.infoList)
            content = (
                <Table basic='very' celled>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Item</Table.HeaderCell>
                        <Table.HeaderCell>Availability</Table.HeaderCell>
                        <Table.HeaderCell>Order</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    {this.state.restaurantMenu.map((item, i) => (
                        <Table.Row key={i}>
                            <Table.Cell>
                                {item[0]}
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.avail[i]}
                            </Table.Cell>
                                <Table.Cell>
                                    <Form>
                                        <Form.Field>
                                            <Form.Input
                                                name = {i}
                                                placeholder='0 selected'
                                                value={this.state.order[i]}
                                                onChange={this.handleChange}
                                                />
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
        <Modal trigger={<Button onClick={this.handleOpen} fluid basic>Make Order</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
            <Modal.Header>Order Menu</Modal.Header>
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

export default OrderMenuModal;
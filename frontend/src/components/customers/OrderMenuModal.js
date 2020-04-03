import React, { Component } from 'react'
import { Modal, Form, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class OrderMenuModal extends Component {
    
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            infoList: props.infoList,
            location: props.location,
            restaurantMenu: [],
            avail: [],
            order: [],
            price: [],
            currentRestaurant: props.restaurant,
            modalOpen: false,
            totalPrice: 0,
            fee: 0,
        }
        console.log("Logging location in MenuForCustomer: ", this.state.location)
    }

    handleOpen = () => {

        if (this.props.getLocation() == null || 
                this.props.getLocation() === "") {
            alert("Please input your location")
            return
        } else if (this.props.getCreditCardInfo() == null) {
            alert("Please select your payment method")
            return
        } else if (this.props.restaurant == null) {
            alert("Please select a restaurant")
            return
        }

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

    getOrderTimeStamp() {
        var currentDate = new Date().toString()
        var dateString = ""
        var dateArray = currentDate.split(" ")
        var i;
        for (i = 0; i < dateArray.length; i++) { 
            if (i === 5) {
                continue
            }
            dateString += dateArray[i] + " "
        }
        return dateString.trim()
    }

    handleSave = () => {
        const updates = {}
        const order = {}
        const timeStamp = this.getOrderTimeStamp()
        var totalQty = 0

        this.state.restaurantMenu.forEach((item, i) => {
            this.state.avail[i] -= this.state.order[i]
            updates[item[0]] = this.state.avail[i]
            order[item[0]] = this.state.order[i]
        })
        console.log("Order during save: ", order)
        
        for (const food in order) {
            totalQty += order[food]
        }
        console.log("Quantity: ", totalQty)
        if (totalQty === 0) {
            alert("Please do not submit empty orders")
            return
        }

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

          console.log("Get location returns: ", this.props.getLocation())
          var creditCard = this.props.getCreditCardInfo()
          console.log(creditCard)
          myAxios.post('make_order', {
            restaurant: this.state.currentRestaurant,
            order: order,
            totalPrice: this.state.totalPrice,
            fee: this.state.fee,
            timeStamp: timeStamp,
            customer: this.state.infoList[0],
            creditCard: creditCard,
            location: this.props.getLocation()
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
            this.props.submitOrder(this.state.totalPrice)
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
        this.calculateTotalPrice()
        this.calculateFee()
    }

    componentDidMount() {
        myAxios.get('/restaurant_sells', {
            params: {
                restaurant: this.state.currentRestaurant
            }
          })
          .then(response => {
            console.log(response);
            const avail = []
            const price = []
            response.data.result.forEach(item => {
                avail.push(item[1])
            });
            response.data.result.forEach(item => {
                price.push(item[2])
                console.log("Price changed", price)
            });
            this.setState({
                restaurantMenu: response.data.result,
                avail: avail,
                price: price,
                isLoading: false
            })
            console.log(this.state)
          })
          .catch(error => {
            console.log(error);
          });
    }

    calculateTotalPrice() {
        var totalPrice = 0;
        this.state.restaurantMenu.map((item, i) => (
            totalPrice += this.state.order[i] * this.state.price[i]))
        console.log(totalPrice)
        this.state.totalPrice = totalPrice
    }

    calculateFee() {
        this.state.fee = this.state.totalPrice * 0.1
        this.state.fee = Math.round(this.state.fee * 100) / 100
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
                        <Table.HeaderCell>Price</Table.HeaderCell>
                        <Table.HeaderCell>Order</Table.HeaderCell>
                        {/* <Table.HeaderCell>Total price</Table.HeaderCell> */}
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
                                {this.state.price[i]}
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
                    <br></br>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>
                                Total Price:
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.totalPrice}
                            </Table.Cell>
                            <Table.Cell>
                                Fee:
                            </Table.Cell>
                            <Table.Cell>
                                {this.state.fee}
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                    
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
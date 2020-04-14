import React, { Component } from 'react'
import { Grid, Modal, Form, Button, Table } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'

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
            minSpend: 0,
            useRewardPoint: 0,
            discount: 0,
            promoDiscount: 0,
            amtPayable: 0,
            currentRestaurant: props.restaurant,
            modalOpen: false,
            totalPrice: 0,
            fee: 0,
            checkout: false,
            promotions: []
        }
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
            checkout: false,
            avail: avail,
            modalOpen: false
        })
    }

    proceedToCheckout = () => {
        const updates = {}
        const order = {}
        var totalQty = 0

        this.state.restaurantMenu.forEach((item, i) => {
            order[item[0]] = this.state.order[i]
        })

        for (const food in order) {
            totalQty += order[food]
        }
        if (totalQty === 0) {
            alert("Please do not submit empty orders")
            return
        }

        if (this.state.totalPrice + this.state.fee < this.state.minSpend) {
            alert("You have to spend a minimum amount of " + this.state.minSpend + " to order.")
            return
        }
        this.state.amtPayable = this.state.totalPrice + this.state.fee
        this.setState({ checkout: true })
    }

    getOrderTimeStamp() {
        var currentDate = new Date().toString()
        var dateString = ""
        var dateArray = currentDate.split(" ")
        var i;
        for (i = 0; i < dateArray.length; i++) {
            if (i >= 5) {
                break;
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

        for (const food in order) {
            totalQty += order[food]
        }
        if (totalQty === 0) {
            alert("Please do not submit empty orders")
            return
        }

        if (this.state.totalPrice + this.state.fee < this.state.minSpend) {
            alert("You have to spend a minimum amount of " + this.state.minSpend + " to order.")
            return
        }

        myAxios.post('connectDeliveryRider', {})
            .then(response => {
                if (response.data.deliveryRider == '') {
                    const avail = []
                    this.state.restaurantMenu.forEach(item => {
                        avail.push(item[1])
                    });
                    this.setState({
                        checkout: false,
                        avail: avail,
                        modalOpen: false
                    })
                    alert("Sorry, no available drivers right now. Please try again later.")
                } else {
                    editAvailability()
                    makeOrder()
                }
            })

        const editAvailability = () => myAxios.post('edit_availability', {
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
                    checkout: false,
                    restaurantMenu: menu
                })
                this.props.submitHandler(this.state.currentRestaurant)
            })
            .catch(error => {
                console.log(error);
            });

        var creditCard = this.props.getCreditCardInfo()

        const makeOrder = () => myAxios.post('make_order', {
            restaurant: this.state.currentRestaurant,
            order: order,
            totalPrice: this.state.totalPrice,
            fee: this.state.fee,
            totalDiscount: this.state.promoDiscount + this.state.discount,
            timeStamp: timeStamp,
            customer: this.state.infoList[0],
            creditCard: creditCard,
            location: this.props.getLocation()
        })
            .then(response => {
                this.props.submitOrder(this.state.totalPrice - this.state.useRewardPoint)
                this.setState({
                    checkout: false,
                    modalOpen: false,
                })
                alert("You used " + parseInt(this.state.useRewardPoint) + " reward points, and earned " + parseInt(this.state.totalPrice) + " reward points.")
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
            this.setState({ order: order })
        }
        this.calculateTotalPrice()
        this.calculateFee()
    }

    handleRewardPointChange = (e, { value }) => {
        value = value ? parseInt(value) : 0
        if ((value <= this.props.rewardPoint) &&
            (value / 20 <= (this.state.totalPrice + this.state.fee - this.state.promoDiscount) * 0.1)) {
            var discount = value / 20;
            discount = Math.round(discount * 100) / 100
            var amtPayable = Math.round((this.state.totalPrice + this.state.fee - discount) * 100) / 100
            this.setState({
                useRewardPoint: value,
                discount: discount,
                amtPayable: amtPayable
            })
        }
    }

    componentDidMount() {
        myAxios.get('/restaurant_menu', {
            params: {
                restaurant: this.state.currentRestaurant
            }
        })
            .then(response => {
                const avail = []
                const price = []
                response.data.result.forEach(item => {
                    avail.push(item[1])
                });
                response.data.result.forEach(item => {
                    price.push(item[2])
                });
                this.setState({
                    restaurantMenu: response.data.result,
                    avail: avail,
                    price: price,
                    minSpend: response.data.result[0][3],
                    isLoading: false
                })
            })
            .catch(error => {
                console.log(error);
            });


        myAxios.get('/restaurant_promo_for_customers', {
            params: {
                restaurant: this.state.currentRestaurant
            }
        })
            .then(response => {
                this.setState({
                    promotions: response.data.restPromo,
                    fdsPromotions: response.data.fdsPromo,
                    isLoading: false
                })
            })
            .catch(error => {
                console.log("Error from update Promo: ", error);
            });

    }

    calculateTotalPrice() {
        var totalPrice = 0;
        this.state.restaurantMenu.map((item, i) => (
            totalPrice += this.state.order[i] * this.state.price[i]))
        this.state.totalPrice = totalPrice
    }

    calculateFee() {
        this.state.fee = this.state.totalPrice * 0.20
        this.state.fee = Math.round(this.state.fee * 100) / 100
    }

    calculateTotalPromoDiscount = () => {
        var discount = 1
        this.state.promotions.map((item) => (
            discount *= (1 - item[2] / 100)
        ))
        this.state.fdsPromotions.map((item) => (
            discount *= (1 - item[2] / 100)
        ))
        this.state.promoDiscount = (1 - discount) * (this.state.totalPrice + this.state.fee)
        return (100 - discount * 100).toFixed(2)
        return 'test'
    }

    render() {
        var header
        var content
        var actions
        var promotions
        if (this.state.isLoading) {
            header = null
            content = null
            actions = null
            promotions = null
        } else if (!this.state.checkout) {
            header = (<Modal.Header>Order Menu</Modal.Header>)
            content = (
                <Modal.Content>
                    <Table basic='very' celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Item</Table.HeaderCell>
                                <Table.HeaderCell>Availability</Table.HeaderCell>
                                <Table.HeaderCell>Price</Table.HeaderCell>
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
                                        {this.state.price[i]}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Form>
                                            <Form.Field>
                                                <Form.Input
                                                    name={i}
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
                    <h5 align="right">Min spend: {this.state.minSpend}</h5>
                    <h5 align="right">Total price: {this.state.totalPrice} </h5>
                </Modal.Content>
            )
            actions =
                (<Modal.Actions>
                    <Button color='red' onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button color='blue' onClick={this.proceedToCheckout}>
                        Next
                    </Button>
                </Modal.Actions>
                )
        } else {
            header = (<Modal.Header>Checkout</Modal.Header>)
            promotions = (
                <Table basic='very' celled>

                    <Table.Header>
                        <h4>All Discount: {this.calculateTotalPromoDiscount() + "%"} </h4>
                        <Table.Row>
                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Discount</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.promotions.map((item) => (
                            <Table.Row key={item[0]}>
                                <Table.Cell>
                                    {item[0] + " (Rest)"}
                                </Table.Cell>
                                <Table.Cell>
                                    {item[2]}%
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {this.state.fdsPromotions.map((item) => (
                            <Table.Row key={item[0]}>
                                <Table.Cell>
                                    {item[0] + " (FDS)"}
                                </Table.Cell>
                                <Table.Cell>
                                    {item[2]}%
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )
            content = (
                <Modal.Content>
                    <Grid columns={2}>
                        <Grid.Column>
                            Price: {"$" + this.state.totalPrice}
                            <br></br><br></br>
                            Fee: {"$" + this.state.fee}
                            <br></br><br></br>
                            Promo discount: {"$" + this.state.promoDiscount.toFixed(1)}
                            <br></br><br></br>
                            Price + Fee after promo discount: {"$" + (this.state.totalPrice + this.state.fee - this.state.promoDiscount).toFixed(1)}
                            <br></br><br></br>
                            Reward Discount: {"$" + this.state.discount}
                            <br></br><br></br>
                            <h4>Amount Payable: {"$" + (this.state.amtPayable - this.state.promoDiscount).toFixed(1)}</h4>
                        </Grid.Column>
                        <Grid.Column>
                            {promotions}
                            <div align='right'>You have {this.props.rewardPoint} reward point 
                            <br></br> 
                            Use them to get up to 10% discount off after promo discount deduction</div>
                            <Form.Field align="right">
                                <Form.Input
                                    placeholder='0'
                                    value={this.state.useRewardPoint}
                                    onChange={this.handleRewardPointChange}
                                />
                            </ Form.Field>
                            <br></br>

                        </Grid.Column>
                    </Grid>
                </Modal.Content >
            )
            actions =
                (<Modal.Actions>
                    <Button color='red' onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button color='blue'
                        onClick={() => {
                            this.setState(
                                {
                                    checkout: false
                                })
                        }}>
                        Previous
                    </Button>
                    <Button color='green'
                        onClick={this.handleSave}>
                        Submit
                    </Button>
                </Modal.Actions>
                )
        }

        return (
            <Modal trigger={<Button color='green' onClick={this.handleOpen} fluid basic>Make Order</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                {header}
                {content}
                {actions}
            </Modal>)
    }
}

export default OrderMenuModal;
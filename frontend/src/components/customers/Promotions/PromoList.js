import React, { Component } from 'react'
import { Card, Table } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'
import ViewPromoModal from './ViewPromoModal.js';

class PromoList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            promotions: [],
            fdsPromotions: [],
            currentRestaurant: props.restaurant
        }
        this.updatePromo(props.restaurant)
    }

    updatePromo(rname) {
        myAxios.get('/restaurant_promo_for_customers', {
            params: {
                restaurant: rname
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

    componentWillReceiveProps(nextProps) {
        this.setState({
            currentRestaurant: nextProps.restaurant,
            isLoading: true
        });
        this.updatePromo(nextProps.restaurant)
    }

    calculateTotalDiscount = () => {
        var discount = 1
        this.state.promotions.map((item) => (
            discount *= (1 - item[2] / 100)
        ))
        return (100 - discount * 100).toFixed(2)
    }

    calculateTotalFDSDiscount = () => {
        var discount = 1
        this.state.fdsPromotions.map((item) => (
            discount *= (1 - item[2] / 100)
        ))
        return (100 - discount * 100).toFixed(2)
    }


    render() {
        // this.updatePromo('')
        var header
        if (this.state.currentRestaurant === null) {
            header = (
                <Card.Content>
                    <Card.Header>Promo code</Card.Header>
                    <Card color='yellow'>Choose a restaurant</Card>
                </Card.Content>)
        } else {
            header = (
                <Card.Content>
                    <Card.Header>Promo code</Card.Header>
                    <Card color='yellow'>{this.props.restaurant}</Card>
                </Card.Content>)
        }
        if (this.state.isLoading) {
            return null// <Loader active/>
        }
        var content
        var content2
        if (this.state.promotions.length === 0) {
            content = <p><i>No ongoing promo for this restaurant.</i></p>
        } else {
            content = (
                <Card.Content>
                    <h4>Total Rest Discount: {this.calculateTotalDiscount() + "%"}</h4>
                    <hr></hr>
                    <Table basic='very' celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>ID</Table.HeaderCell>
                                <Table.HeaderCell>Discount</Table.HeaderCell>
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
                                        {item[2]}%
                          </Table.Cell>
                                    <Table.Cell>
                                        {item[1].substring(0, 11)}
                                    </Table.Cell>
                                </Table.Row>
                            ))}

                        </Table.Body>
                    </Table>

                </Card.Content>

            )
        }
        if (this.state.fdsPromotions.length === 0) {
            content2 = <p><i>No ongoing promo for FDS.</i></p>
        } else {
            content2 = (
                <Card.Content>
                    <h4>FDS Promos: {this.calculateTotalFDSDiscount() + "%"}</h4>
                    <hr></hr>
                    <Table basic='very' celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>ID</Table.HeaderCell>
                                <Table.HeaderCell>Discount</Table.HeaderCell>
                                <Table.HeaderCell>End</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.state.fdsPromotions.map((item) => (
                                <Table.Row key={item[0]}>
                                    <Table.Cell>
                                        {item[0]}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item[2]}%
                              </Table.Cell>
                                    <Table.Cell>
                                        {item[1].substring(0, 11)}
                                    </Table.Cell>
                                </Table.Row>
                            ))}

                        </Table.Body>
                    </Table>

                </Card.Content>
            )
        }

        return (
            <Card color='yellow' style={{ maxWidth: 250 }}>
                {header}
                {content}
                <Card.Content>
                    <ViewPromoModal restaurant={this.state.currentRestaurant} />
                </Card.Content>
                <Card.Content>
                    {content2}
                </Card.Content>
            </Card>
        )
    }
}

export default PromoList;
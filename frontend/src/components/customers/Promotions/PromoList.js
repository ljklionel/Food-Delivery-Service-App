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
                console.log("Promo info: ", response);
                this.setState({
                    promotions: response.data.result,
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


    render() {
        var header
        if (this.state.currentRestaurant === null) {
            header = (
                <Card.Content>
                    <Card.Header>Promo code</Card.Header>
                    <Card>Choose a restaurant</Card>
                </Card.Content>)
        } else {
            header = (
                <Card.Content>
                    <Card.Header>Promo code</Card.Header>
                    <Card>{this.props.restaurant}</Card>
                </Card.Content>)
        }
        if (this.state.isLoading) {
            return null// <Loader active/>
        }
        var content
        if (this.state.promotions.length === 0) {
            content = <p><i>No ongoing promotions.</i></p>
        } else {
            content = (
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
            )
        }
        return (
            <Card color='blue' style={{ maxWidth: 250 }}>
                {header}
                <Card.Content>
                    {content}
                </Card.Content>
                <Card.Content>
                    <ViewPromoModal restaurant={this.state.currentRestaurant} />
                </Card.Content>
            </Card>
        )
    }
}

export default PromoList;
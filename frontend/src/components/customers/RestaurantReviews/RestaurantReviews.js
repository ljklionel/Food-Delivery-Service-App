import React, { Component } from 'react'
import { Card, Table } from 'semantic-ui-react';
import myAxios from '../../../webServer.js'
import ReviewModal from './ReviewModal.js';

class RestaurantReviews extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            restaurantReviews: [],
            currentRestaurant: props.restaurant,
            refreshReview: 0
        }
        this.updateReviews(props.restaurant)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            refreshReview: nextProps.refreshReview,
            currentRestaurant: nextProps.restaurant,
            isLoading: true
        });
        this.updateReviews(nextProps.restaurant)
    }

    updateReviews = rname => {
        myAxios.get('/get_restaurant_reviews', {
            params: {
                restaurant: rname
            }
        })
            .then(response => {
                this.setState({
                    restaurantReviews: response.data.result,
                    isLoading: false
                })
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        var header
        if (this.state.currentRestaurant === null) {
            header = (
                <Card.Content>
                    <Card.Header>Reviews</Card.Header>
                    <Card color='red' >Choose a restaurant</Card>
                </Card.Content>)
        } else {
            header = (
                <Card.Content>
                    <Card.Header>Reviews</Card.Header>
                    <Card color='red' >{this.props.restaurant}</Card>
                </Card.Content>)
        }
        if (this.state.isLoading) {
            return null// <Loader active/>
        }
        return (
            <Card color='red' style={{ maxWidth: 250 }}>
                {header}
                <Card.Content>
                    <Table basic='very' celled>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell><p align='middle'>Reviewer</p></Table.HeaderCell>
                                <Table.HeaderCell><p>Item</p></Table.HeaderCell>
                                {/* <Table.HeaderCell>Order Date</Table.HeaderCell> */}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.state.restaurantReviews.map((item, i) => (
                                <Table.Row key={item[0]}>
                                    <Table.Cell>
                                        <ReviewModal orderTime={item[3]} restaurant={this.state.currentRestaurant} reviewDetails={this.state.restaurantReviews[i]} reviewer={item[2]} />
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item[0]}
                                    </Table.Cell>
                                    {/* <Table.Cell>
                                        {item[3].substring(5, 16)}
                                    </Table.Cell> */}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Card.Content>
                <Card.Content>
                    {/* <OrderMenuModal restaurant={this.state.currentRestaurant} getCreditCardInfo={this.props.getCreditCardInfo} 
                    getLocation={this.props.getLocation} location={this.state.location} 
                        infoList={this.state.infoList} submitHandler={this.updateMenu} submitOrder={this.props.submitOrder}/> */}
                </Card.Content>
            </Card>
        )
    }
}

export default RestaurantReviews;
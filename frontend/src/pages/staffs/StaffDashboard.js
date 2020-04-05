import React from 'react';
import { Grid, Image, Header, Loader, Card } from 'semantic-ui-react';
import RestaurantSearch from '../../components/staffs/RestaurantSearch.js'
import MenuList from '../../components/staffs/MenuList.js'
import OrderList from '../../components/staffs/OrderList.js'
import MonthlySummary from '../../components/staffs/MonthlySummary.js'
import myAxios from '../../webServer.js'
import PromoList from '../../components/staffs/PromoList.js';
import AppHeader from '../../components/AppHeader.js';

class StaffDashboard extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoadingRestaurantList: true,
            isLoadingRestaurant: true,
            restaurantList: null,
            currentRestaurant: null,
            isLoadingMenu: true,
            restaurantMenu: null
        };
    }

    async componentDidMount() {
        // Load async data.
        // Update state with new data.
        // Re-render our component.
        myAxios
            .get('/my_restaurants')
            .then(response => {
                console.log(response);
                const list = [];
                response.data.result.forEach(element => {
                    list.push(element[0]);
                });
                this.setState({
                    restaurantList: list,
                    currentRestaurant: list ? list[0] : null,
                    isLoadingRestaurantList: false,
                    isLoadingRestaurant: false
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    workRestaurantList() {
        if (this.state.isLoadingRestaurantList) {
            return <Loader size="massive" active />;
        }
        const headerStyle = {
            fontSize: '28px'
        };

        const colors = [
            'red',
            'orange',
            'yellow',
            'olive',
            'green',
            'teal',
            'blue',
            'violet',
            'purple',
            'pink',
            'brown',
            'grey',
            'black'
        ];
        const random_color = () =>
            colors[Math.floor(Math.random() * colors.length)];

        const onJoinRestaurant = rest => {
            const update = {};
            this.state.restaurantList.push(rest);
            update.restaurantList = this.state.restaurantList;
            if (this.state.currentRestaurant == null) {
                update.currentRestaurant = rest;
            }
            this.setState(update);
        };

        return (
            <div>
                <Header style={headerStyle}>
                    <i>Your Restaurants</i>
                </Header>
                <br />
                <Card.Group>
                    {this.state.restaurantList.map(rest => (
                        <Card
                            as="a"
                            key={rest}
                            onClick={() => {
                                this.setState({ currentRestaurant: rest });
                            }}
                            fluid
                            color={random_color()}
                            header={rest}
                        />
                    ))}
                </Card.Group>
                <br />
                <br />
                <RestaurantSearch whenjoin={onJoinRestaurant} />
            </div>
        );
    }

    restaurantContent() {
        if (this.state.isLoadingRestaurant) {
            return <Loader size="massive" active />;
        }

        if (this.state.currentRestaurant) {
            return (
                <div>
                    <Header textAlign="left" style={{ fontSize: '60px' }}>
                        {this.state.currentRestaurant}
                    </Header>
                    <br />
                    <br />
                    <Grid columns={4}>
                        <Grid.Column>
                            <MenuList
                                restaurant={this.state.currentRestaurant}
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <OrderList
                                restaurant={this.state.currentRestaurant}
                            />
                        </Grid.Column>

                        <Grid.Column>
                            <MonthlySummary
                                restaurant={this.state.currentRestaurant}
                            />
                        </Grid.Column>

                        <Grid.Column>
                            <PromoList
                                restaurant={this.state.currentRestaurant}
                            />
                        </Grid.Column>
                    </Grid>
                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <Image
                        avatar
                        style={{ fontSize: '100px' }}
                        src={'/images/avatar/staff.svg'}
                    />
                    <Header style={{ fontSize: '32px' }}>
                        Join a Restaurant now!
                    </Header>
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                <AppHeader />
                <Grid celled style={{ height: '100vh' }}>
                    <Grid.Column
                        style={{ width: '82%', background: '#edf8ff' }}
                    >
                        {this.restaurantContent()}
                    </Grid.Column>

                    <Grid.Column style={{ width: '18%' }}>
                        {this.workRestaurantList()}
                    </Grid.Column>
                </Grid>
            </div>
        );
    }
}

export default StaffDashboard;

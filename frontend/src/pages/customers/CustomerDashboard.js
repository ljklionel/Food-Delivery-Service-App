import React from 'react';
import { Grid, Image, Header, Loader, Card } from 'semantic-ui-react';
import RestaurantSelect from '../../components/customers/SelectComponents/RestaurantSelect.js'
import LocationSelect from '../../components/customers/SelectComponents/LocationSelect.js'
import Menu from '../../components/customers/Menu/Menu.js'
import CreditCardSelection from '../../components/customers/SelectComponents/CreditCardSelection.js'
import RecentLocations from '../../components/customers/SelectComponents/RecentLocations.js'
import AppHeader from '../../components/AppHeader.js'
import myAxios from '../../webServer.js'
import MyOrders from '../../components/customers/MyOrder/MyOrders.js'
import RestaurantReviews from '../../components/customers/RestaurantReviews/RestaurantReviews.js'
import PromoList from "../../components/customers/Promotions/PromoList"
import { Form, Table } from 'semantic-ui-react';
import RadioButton from '../../components/customers/Menu/RadioButton.js'


class CustomerDashboard extends React.Component {
    constructor() {
        super()
        this.state = {
            infoList: null,
            username: null,
            isLoadingInfo: 2,
            currentRestaurant: null,
            restaurantMenu: null,
            customerLocation: null,
            currentCreditCard: null,
            rewardPoint: 0,
            recentLocationOptions: [],
            refreshReview: 0,
            promotions: [],
            creditCardOptions: [
                {
                    id: 0,
                    title: 'Cash',
                    selected: false,
                    key: 'creditCardOptions'
                },
                {
                    id: 1,
                    title: 'Mastercard',
                    selected: false,
                    key: 'creditCardOptions'
                },
                {
                    id: 2,
                    title: 'Visa',
                    selected: false,
                    key: 'creditCardOptions'
                }
            ],
        }
        this.getCreditCardInfo = this.getCreditCardInfo.bind(this)
        this.toggleSelected = this.toggleSelected.bind(this)
        this.toggleSelectedLocation = this.toggleSelectedLocation.bind(this)
        this.getLocation = this.getLocation.bind(this)
        this.submitReview = this.submitReview.bind(this)
    }

    changeCurrentCreditCard = (x) => {
        myAxios.post('update_credit_card', {
            customerName: this.state.infoList[0],
            creditCard: x
        })
            .then(response => {
                var infoList = this.state.infoList
                infoList[1] = x
                this.setState({
                    infoList: infoList,
                    currentCreditCard: x
                })
            })
            .catch(error => {
                console.log(error);
            });
    }

    changeCustomerLocation = (x) => {
        this.setState({
            customerLocation: x[0]
        })
    }

    toggleSelected = (id, key) => {
        this.state.creditCardOptions.map((x) =>
            x.selected = false
        )
        let temp = this.state[key]
        temp[id].selected = !temp[id].selected
        this.setState({
            [key]: temp
        })
        this.changeCurrentCreditCard(this.state.creditCardOptions[id].title)
    }

    toggleSelectedLocation = (id, key) => {
        this.state.recentLocationOptions.map((x) =>
            x.selected = false
        )
        let temp = this.state[key]
        temp[id].selected = !temp[id].selected
        this.setState({
            [key]: temp
        })
        this.changeCustomerLocation(this.state.recentLocationOptions[id].title)
    }

    submitOrder = (rewardEarned, rewardUsed) => {
        console.log("Subbmited order")
        var rewardPoint = parseInt(rewardEarned) + this.state.rewardPoint - parseInt(rewardUsed)
        console.log(rewardEarned)
        console.log(rewardUsed)
        console.log(rewardPoint)
        this.setState({
            rewardPoint: rewardPoint
        })
        this.updateRewardPoint(rewardPoint)
        this.updateRecentLocations()
        // window.location.reload(false);
    }

    submitReview = () => {
        console.log("SubmitReview")
        this.setState({
            refreshReview: this.state.refreshReview++
        })
    }

    updateRewardPoint = (x) => {
        myAxios.post('update_reward_point', {
            customerName: this.state.infoList[0],
            rewardPoint: x
        })
            .then(response => {
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleLocationChange = (e, { value }) => {
        this.setState({
            customerLocation: value
        })
    }

    getLocation = () => {
        return this.state.customerLocation
    }

    getCreditCardInfo = () => {
        return this.state.infoList[1]
    }

    async componentDidMount() {
        // Load async data.
        // Update state with new data.
        // Re-render our component.

        myAxios.get('/my_info')
            .then(response => {
                console.log(response);
                const list = []
                response.data.result[0].forEach(element => {
                    list.push(element)
                });
                var isLoadingInfo = this.state.isLoadingInfo - 1
                this.state.infoList = list // Prevent synchronisation issue
                this.setState({
                    infoList: list,
                    username: list[0],
                    rewardPoint: list[2],
                    isLoadingInfo: isLoadingInfo
                })
            })
            .catch(error => {
                console.log(error);
            });

        this.updateRecentLocations()
    }

    updateRecentLocations = () => {
        myAxios.get('/recent_locations')
            .then(response => {
                const list = []
                var i = 0;
                response.data.result.forEach(element => {
                    var block = {
                        id: i,
                        title: element,
                        selected: false,
                        key: 'recentLocationOptions'
                    }
                    list.push(block)
                    i++
                });
                var customerLocation = list.length === 0 ? null : list[0]["title"][0]
                var isLoadingInfo = this.state.isLoadingInfo - 1
                this.setState({
                    recentLocationOptions: list,
                    customerLocation: customerLocation,
                    isLoadingInfo: isLoadingInfo
                })
            })
            .catch(error => {
                console.log(error);
            });
    }

    setGender(event) {
        console.log(event.target.value);
    }

    customerContent() {
        if (this.state.isLoadingInfo) {
            return (
                <Loader size='massive' active />
            );
        }
        const id = this.state.infoList[0]
        this.state.currentCreditCard = this.state.infoList[1]
        const selectedRestaurant = this.state.currentRestaurant == null ? "Not selected" : this.state.currentRestaurant
        return (
            <div>
                <Grid columns={4}>
                    <Grid.Column>
                        <Image avatar style={{ fontSize: '80px' }} src={'/images/avatar/customer.svg'} />
                    </Grid.Column>

                    <Grid.Column>
                        <Header textAlign='left' style={{ fontSize: '14px' }}>Username: {id}</Header>
                        <Header textAlign='left' style={{ fontSize: '14px' }}>Payment method: {this.state.currentCreditCard}</Header>
                        <Header textAlign='left' style={{ fontSize: '14px' }}>Reward Point: {this.state.rewardPoint}</Header>
                        <Header textAlign='left' style={{ fontSize: '14px' }}>Selected Restaurant: {selectedRestaurant}</Header>
                        <Header textAlign='left' style={{ fontSize: '14px' }}>Location: {this.state.customerLocation}</Header>
                    </Grid.Column>

                    <Grid.Column>
                        <CreditCardSelection title="Select payment method" list={this.state.creditCardOptions} toggleItem={this.toggleSelected} />
                        <RecentLocations title="Select from recent locations" list={this.state.recentLocationOptions} toggleSelectedLocation={this.toggleSelectedLocation} />
                    </Grid.Column>
                    <Grid.Column>
                        <div onChange={this.setGender.bind(this)}>
                            <input type="radio" value="MALE" name="gender" /> Male
                            <input type="radio" value="FEMALE" name="gender" /> Female
                        </div>
                        <RadioButton></RadioButton>
                    </Grid.Column>
                </Grid>

                <Grid columns={4}>
                    <Grid.Column>
                        <Menu rewardPoint={this.state.rewardPoint} submitOrder={this.submitOrder} getCreditCardInfo={this.getCreditCardInfo} restaurant={this.state.currentRestaurant} getLocation={this.getLocation} location={this.state.customerLocation} infoList={this.state.infoList} />
                    </Grid.Column>
                    <Grid.Column>
                        <RestaurantReviews refreshReview={this.state.refreshReview} restaurant={this.state.currentRestaurant} />
                    </Grid.Column>
                    <Grid.Column>
                        <PromoList restaurant={this.state.currentRestaurant} />
                    </Grid.Column>
                    <Grid.Column>
                        <MyOrders submitReview={this.submitReview} orderSubmitted={this.state.orderSubmitted} currentCustomer={this.state.infoList[0]} />
                    </Grid.Column>
                </Grid>

            </div>
        );
    }

    onSelectRestaurant = (rest) => {
        const update = {}
        update.currentRestaurant = rest
        this.setState(update)
    }

    onSelectLocation = (loc) => {
        const update = {}
        update.customerLocation = loc
        this.setState(update)
    }

    selectRestaurant() {
        // if (this.state.isLoadingRestaurantList) {
        //   return <Loader size='massive' active/>
        // }
        const headerStyle = {
            fontSize: '28px'
        }

        const colors = ['red', 'orange', 'yellow', 'olive', 'green', 'teal',
            'blue', 'violet', 'purple', 'pink', 'brown', 'grey', 'black']
        const random_color = () => colors[Math.floor(Math.random() * colors.length)]

        return (
            <div>
                {/* <Header style={headerStyle}><i>Select Restaurant</i></Header> */}
                <br></br>
                <Card.Header>
                    <Header style={headerStyle}><i>Select Restaurant</i></Header>
                </Card.Header>
                <Card.Content>
                    <RestaurantSelect whenselect={this.onSelectRestaurant} />
                </Card.Content>
                <br></br>
                <br></br>
                <Card.Header>
                    <Header style={headerStyle}><i>Select Location</i></Header>
                    </Card.Header>
                <Card.Content>
                    <LocationSelect whenselect={this.onSelectLocation} />
                </Card.Content>
            </div>
        )
    }

    render() {
        return (
            <div>
                <AppHeader />
                <Grid celled style={{ height: '120vh' }}>
                    <Grid.Column style={{ width: '82%', background: '#edf8ff' }}>
                        {this.customerContent()}
                    </Grid.Column>

                    <Grid.Column style={{ width: '18%' }}>
                        {this.selectRestaurant()}
                    </Grid.Column>
                </Grid>
            </div>

        );
    }

}

export default CustomerDashboard;

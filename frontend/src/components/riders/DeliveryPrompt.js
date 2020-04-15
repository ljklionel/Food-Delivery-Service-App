import React, { Component } from 'react';
import myAxios from '../../webServer.js';
import { Grid, GridRow, GridColumn, Button } from 'semantic-ui-react';
import {
    VerticalTimeline,
    VerticalTimelineElement
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import DeliveryInfo from './DeliveryInfo';
import moment from 'moment';

class DeliveryPrompt extends Component {
    state = {
        hasDelivery: false,
        time: Date.now(),
        orderId: '',
        location: '',
        orderTime: '',
        dispatchTime: '',
        arriveTime: '',
        otwTime: '',
        deliveredTime: '',
        showInfo: false,
        restaurant: ''
    };

    componentDidMount() {
        this.interval = setInterval(
            () => this.setState({ time: Date.now() }),
            10000
        );
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleInfo = () => {
        this.setState(prevState => {
            return {
                ...prevState,
                showInfo: !this.state.showInfo
            };
        });
    };

    update = () => {
        myAxios.get('/get_delivery').then(response => {
            console.log('data', response.data.result);
            if (response.data.result !== null) {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        hasDelivery: true,
                        orderId: response.data.result[0],
                        location: response.data.result[1],
                        orderTime: response.data.result[2],
                        dispatchTime: response.data.result[3],
                        arriveTime: response.data.result[4],
                        otwTime: response.data.result[5],
                        restaurant: response.data.result[6]
                    };
                });
            }
        });
    };
    // 2016-06-22 19:10:25
    handleNext = () => {
        const time = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log('formatted time', time);
        if (!this.state.dispatchTime) {
            myAxios
                .post('set_depart_time_1', {
                    orderId: this.state.orderId,
                    departTime1: time
                })
                .then(response => {
                    console.log(response);
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            dispatchTime: time
                        };
                    });
                });
        } else if (!this.state.arriveTime) {
            myAxios
                .post('set_arrive_time', {
                    orderId: this.state.orderId,
                    arriveTime: time
                })
                .then(response => {
                    console.log(response);
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            arriveTime: time
                        };
                    });
                });
        } else if (!this.state.otwTime) {
            myAxios
                .post('set_otw_time', {
                    orderId: this.state.orderId,
                    departTime2: time
                })
                .then(response => {
                    console.log(response);
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            otwTime: time
                        };
                    });
                });
        } else {
            myAxios
                .post('set_delivery_time', {
                    orderId: this.state.orderId,
                    deliveryTime: time,
                })
                .then(response => {
                    console.log(response);
                    window.location.reload();
                });
        }
    };

    showDelivery = () => {
        clearInterval(this.interval);
        var timelineCheck = [];
        timelineCheck.push(
            <VerticalTimelineElement
                contentStyle={{
                    background: '#3b6978',
                    color: '#fff'
                }}
                contentArrowStyle={{
                    borderRight: '7px solid  black'
                }}
                iconStyle={{ background: '#84a9ac', color: '#fff' }}
            >
                Restaurant: {this.state.restaurant} at {this.state.location}
            </VerticalTimelineElement>
        );
        if (this.state.dispatchTime) {
            timelineCheck.push(
                <VerticalTimelineElement
                    contentStyle={{
                        background: '#3b6978',
                        color: '#fff'
                    }}
                    contentArrowStyle={{
                        borderRight: '7px solid  black'
                    }}
                    iconStyle={{ background: '#84a9ac', color: '#fff' }}
                >
                    On the way to restaurant at {this.state.dispatchTime}
                </VerticalTimelineElement>
            );
        }
        if (this.state.arriveTime) {
            timelineCheck.push(
                <VerticalTimelineElement
                    contentStyle={{
                        background: '#3b6978',
                        color: '#fff'
                    }}
                    contentArrowStyle={{
                        borderRight: '7px solid  black'
                    }}
                    iconStyle={{ background: '#84a9ac', color: '#fff' }}
                >
                    Reached restaurant. Picking up food at{' '}
                    {this.state.arriveTime}
                </VerticalTimelineElement>
            );
        }
        if (this.state.otwTime) {
            timelineCheck.push(
                <VerticalTimelineElement
                    contentStyle={{
                        background: '#3b6978',
                        color: '#fff'
                    }}
                    contentArrowStyle={{
                        borderRight: '7px solid  black'
                    }}
                    iconStyle={{ background: '#84a9ac', color: '#fff' }}
                >
                    On the way to customer at {this.state.otwTime}
                </VerticalTimelineElement>
            );
        }
        console.log(timelineCheck);
        return (
            <Grid>
                {this.state.showInfo && <DeliveryInfo/>}
                <GridRow style={{ height: '10%' }}>
                    <GridColumn style={{ width: '40%' }}>
                        <h3 style={{ textAlign: 'center' }}>New delivery!!</h3>
                    </GridColumn>
                    <GridColumn style={{ width: '30%' }}>
                        <Button
                            style={{
                                backgroundColor: '#3b6978',
                                color: 'white'
                            }}
                            onClick={this.handleInfo}
                        >
                            Info
                        </Button>
                    </GridColumn>
                    <GridColumn style={{ width: '30%' }}>
                        <Button
                            style={{
                                backgroundColor: '#3b6978',
                                color: 'white'
                            }}
                            onClick={this.handleNext}
                        >
                            Next
                        </Button>
                    </GridColumn>
                </GridRow>
                <GridRow>
                    <VerticalTimeline animate={true}>
                        {timelineCheck}
                    </VerticalTimeline>
                </GridRow>
            </Grid>
        );
    };

    showPlaceholder = () => {
        return (
            <div>
                <br />
                <br />
                <br />
                <br />
                <br />
                <h3 style={{ textAlign: 'center', opacity: '0.5' }}>
                    Your assigned delivery will be shown here
                </h3>
            </div>
        );
    };

    render() {
        !this.state.hasDelivery && this.update();
        return this.state.hasDelivery
            ? this.showDelivery()
            : this.showPlaceholder();
    }
}

export default DeliveryPrompt;

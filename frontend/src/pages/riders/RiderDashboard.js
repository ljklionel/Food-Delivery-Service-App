import React, { Component } from 'react';
import AppHeader from '../../components/AppHeader.js';
import {
    Grid,
    Image,
    Header,
    Loader,
    Card,
    List,
    Button,
    Menu,
    GridColumn,
    GridRow,
    Statistic
} from 'semantic-ui-react';
import myAxios from '../../webServer.js';
import JoinNow from '../../components/riders/JoinNow.js';
import ViewSched from '../../components/riders/ViewSched.js';
import '../../components/riders/RiderStyles.css';
import ViewStats from '../../components/riders/ViewStats.js';
import DeliveryPrompt from '../../components/riders/DeliveryPrompt.js';

class RiderDashboard extends React.Component {
    state = {
        username: '',
        reload: false,
        isLoadingCheck: true,
        isLoadingAlt: true,
        isPartTime: false,
        isFullTime: false
    };

    async componentDidMount() {
        // Load async data.
        // Update state with new data.
        // Re-render our component.
        myAxios
            .get('/employee_page')
            .then(response => {
                console.log('response', response);
                const name = response.data.result[0];
                this.setState({
                    username: name,
                    reload: false,
                    isPartTime: false,
                    isFullTime: false
                });
            })
            .then(() => {
                myAxios.get('/get_part_time').then(response => {
                    console.log(response);
                    if (response.data.result != null) {
                        this.setState(prevState => {
                            return {
                                ...prevState,
                                isPartTime: true,
                                isLoadingAlt: false,
                                isLoadingCheck: false
                            };
                        });
                    }
                });
            })
            .then(() => {
                myAxios.get('/get_full_time').then(response => {
                    console.log('fulltime', response);
                    if (response.data.result !== null) {
                        console.log('state', this.state);
                        this.setState(prevState => {
                            return {
                                ...prevState,
                                isFullTime: true,
                                isLoadingAlt: false,
                                isLoadingCheck: false
                            };
                        });
                    }
                });
            })
            .then(() => {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        isLoadingCheck: false
                    };
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    reloadPage = () => {
        this.setState(prevState => {
            return {
                ...prevState,
                reload: true,
                isPartTime: false,
                isFullTime: false
            };
        });
    };

    updateHours = hours => {
        this.setState({
            totalHours: hours
        });
    };

    updateSalary = salary => {
        this.setState({
            salary: salary
        });
    };

    check = () => {
        console.log(this.state);
        if (this.state.isLoadingCheck) {
            return <Loader size="massive" active />;
        }
        if (this.state.isFullTime || this.state.isPartTime) {
            return (
                <GridRow
                    style={{
                        background: '#edf8ff',
                        height: '82%'
                    }}
                >
                    <GridColumn style={{ width: '70%' }}>
                        <Grid columns={2}>
                            <GridColumn>
                                <ViewStats
                                    isPartTime={this.state.isPartTime}
                                    isFullTime={this.state.isFullTime}
                                />
                            </GridColumn>
                            <GridColumn>
                                <ViewSched
                                    isPartTime={this.state.isPartTime}
                                    isFullTime={this.state.isFullTime}
                                />
                            </GridColumn>
                        </Grid>
                    </GridColumn>
                    <GridColumn style={{ width: '30%', background: '#bae5e5' }}>
                        <DeliveryPrompt />
                    </GridColumn>
                </GridRow>
            );
        } else {
            return <JoinNow salary = '0' />;
        }
    };

    render() {
        return (
            <div>
                <AppHeader />
                <Grid celled style={{ height: '95vh' }}>
                    <GridRow style={{ height: '18%' }}>
                        <Image
                            avatar
                            style={{
                                fontSize: '70px',
                                marginLeft: '10px',
                                marginTop: '10px'
                            }}
                            src={'/images/avatar/rider.svg'}
                            floated="left"
                        />
                        <h1 style={{ marginTop: '50px' }}>
                            {this.state.username}
                        </h1>
                    </GridRow>
                    {this.check()}
                </Grid>
            </div>
        );
    }
}

export default RiderDashboard;

import React from 'react';
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
import '../../components/riders/RiderStyles.css';
import ViewStats from '../../components/riders/ViewStats.js';

class RiderDashboard extends React.Component {
    state = {
        username: '',
        reload: false
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

    checkPartTime = () => {
        myAxios.get('/get_part_time').then(response => {
            console.log(response);
            if (response.data.result != null) {
                this.setState(prevState => {
                    return {
                        ...prevState,
                        isPartTime: true
                    };
                });
            }
        });
    };

    checkFullTime = () => {
        myAxios.get('/get_full_time').then(response => {
            console.log('fulltime', response);
            if (response.data.result !== null) {
                console.log('state', this.state);
                this.setState(prevState => {
                    return {
                        ...prevState,
                        isFullTime: true
                    };
                });
            }
        });
    };

    loadAlt = () => {
        return (
            <GridRow style={{ marginTop: '100px' }}>
                <GridColumn style={{ width: '70%' }}>
                    <ViewStats
                        isPartTime={this.state.isPartTime}
                        isFullTime={this.state.isFullTime}
                    />
                </GridColumn>
                <GridColumn style={{ width: '30%' }}>
                    <h1>Delivery prompt placeholder</h1>
                </GridColumn>
            </GridRow>
        );
    };

    check = () => {
        console.log(this.state);
        this.checkFullTime();
        this.checkPartTime();
        return <JoinNow />;
    };

    render() {
        return (
            <div>
                <AppHeader />
                <Grid>
                    <GridRow>
                        <GridColumn style={{ width: '200px', height: '30px' }}>
                            <Image
                                avatar
                                style={{ fontSize: '70px', marginLeft: '10px' }}
                                src={'/images/avatar/rider.svg'}
                                floated="left"
                            />
                        </GridColumn>
                        <GridColumn style={{ width: '300px' }}>
                            <h1 style={{ marginTop: '30px' }}>
                                {this.state.username}
                            </h1>
                        </GridColumn>
                    </GridRow>
                    <br />
                    {this.state.isFullTime || this.state.isPartTime
                        ? this.loadAlt()
                        : this.check()}
                </Grid>
            </div>
        );
    }
}

export default RiderDashboard;

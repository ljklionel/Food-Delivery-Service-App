import React, { Component } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableRow
} from 'semantic-ui-react';
import myAxios from '../../webServer.js';

class ViewStats extends Component {
    _isMounted = false;
    state = { delivery: '0', workHours: '160', salary: '', avgRating: '-'};

    async componentDidMount() {
        this._isMounted = true;
        myAxios
            .get('/get_salary')
            .then(response => {
                if (response.data.result !== null && this._isMounted) {
                    const salary = (parseFloat(response.data.result)).toFixed(2);
                    console.log('salary',salary);
                    console.log('response.data.result[0]', response.data.result);
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            salary: salary
                        };
                    });
                    if (this.props.isPartTime) {
                        myAxios.get('/get_work_hours').then(response => {
                            if (
                                response.data.result !== null &&
                                this._isMounted
                            ) {
                                console.log('hours', response);
                                const workHours = response.data.result[0];
                                this.setState(prevState => {
                                    return {
                                        ...prevState,
                                        workHours: workHours,
                                        salary: salary
                                    };
                                });
                            }
                        });
                    }
                }
            })
            .then(() => {
                myAxios.get('/get_delivery_count').then(response => {
                    if (response.data.result !== null && this._isMounted) {
                        this.setState(prevState => {
                            return {
                                ...prevState,
                                delivery: response.data.result[0]
                            };
                        });
                    }
                });
            })
            .then(() => {
                myAxios.get('/get_avg_rating').then(response => {
                    if (response.data.result !== null && this._isMounted) {
                        this.setState(prevState => {
                            console.log('rating',response.data.result[0]);
                            var avgRating;
                            if (isNaN((parseFloat(response.data.result[0])).toFixed(1))) {
                                avgRating = 0;
                            } else {
                                avgRating = (parseFloat(response.data.result[0])).toFixed(1);
                            }
                            return {
                                ...prevState,
                                avgRating: avgRating
                            };
                        });
                    }
                });
            });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <Card style={{ width: '100%' }}>
                <CardContent>
                    <CardHeader>Delivery Performance</CardHeader>
                </CardContent>
                <CardContent>
                    <h3>Total Deliveries: {this.state.delivery}</h3>
                    <h3>Total Salary: ${this.state.salary}</h3>
                    {this.props.isPartTime ? (
                        <h3>
                            Total work hours for the week:{' '}
                            {this.state.workHours}
                        </h3>
                    ) : (
                        <h3>
                            Total work hours for the month:{' '}
                            {this.state.workHours}
                        </h3>
                    )}
                    <h3>Average Rating: {this.state.avgRating}</h3>
                </CardContent>
            </Card>
        );
    }
}

export default ViewStats;

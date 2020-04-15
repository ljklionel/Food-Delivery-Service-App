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
import PartTimeInfo from './PartTimeInfo';
import FullTimeInfo from './FullTimeInfo';

const dayStringMap = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday'
};

class ViewStats extends Component {
    // Update the data with axios
    state = {
        fullTimeSched: [],
        reload: false,
        partTimeSched: [],
        showPartTimeInfo: false,
        showFullTimeInfo: false
    };

    handleUpdate = () => {
        console.log(this.state.data);
        if (this.props.isPartTime) {
            this.setState(prevState => {
                return {
                    ...prevState,
                    showPartTimeInfo: !prevState.showPartTimeInfo
                };
            });
        } else {
            this.setState(prevState => {
                return {
                    ...prevState,
                    showFullTimeInfo: !prevState.showFullTimeInfo
                };
            });
        }
    };

    async componentDidMount() {
        if (this.props.isPartTime) {
            myAxios.get('get_part_time_sched').then(response => {
                if (response.data.result !== null) {
                    console.log(response.data.result);
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            partTimeSched: response.data.result
                        };
                    });
                }
            });
        } else {
            myAxios.get('get_full_time_sched').then(response => {
                if (response.data.result !== null) {
                    this.setState(prevState => {
                        return {
                            ...prevState,
                            fullTimeSched: response.data.result
                        };
                    });
                }
            });
        }
    }

    partTimeTable = () => {
        console.log(this.state.partTimeSched);
        var dup = this.state.partTimeSched;
        console.log('dup', dup);
        var toPrint = [
            { value: '1', time: '' },
            { value: '2', time: '' },
            { value: '3', time: '' },
            { value: '4', time: '' },
            { value: '5', time: '' },
            { value: '6', time: '' },
            { value: '7', time: '' }
        ];

        dup.forEach(element => {
            toPrint[parseInt(element[0]) - 1].time =
                toPrint[parseInt(element[0]) - 1].time +
                element[1] +
                '00H - ' +
                element[2] +
                '00H | ';
            console.log('print', toPrint[parseInt(element[0]) - 1].time);
        });

        return (
            <Table basic="very" celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Day</Table.HeaderCell>
                        <Table.HeaderCell>Time</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {toPrint.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                {dayStringMap[parseInt(item.value)]}
                            </Table.Cell>
                            <Table.Cell>{item.time}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        );
    };

    fullTimeTable = () => {
        const shiftOptionStringMap = {
            10: '10am to 2pm and 3pm to 7pm',
            11: '11am to 3pm and 4pm to 8pm',
            12: '12pm to 4pm and 5pm to 9pm',
            13: '1pm to 5pm and 6pm to 10pm'
        };

        console.log(this.state.fullTimeSched);
        var dup = this.state.fullTimeSched;
        console.log('ft', dup);
        var toPrint = [
            { value: '1', time: '' },
            { value: '2', time: '' },
            { value: '3', time: '' },
            { value: '4', time: '' },
            { value: '5', time: '' },
            { value: '6', time: '' },
            { value: '7', time: '' }
        ];

        dup.forEach(element => {
            toPrint[parseInt(element[0]) - 1].time =
                shiftOptionStringMap[parseInt(element[1])];
            console.log('print', toPrint[parseInt(element[0]) - 1].time);
        });

        return (
            <Table basic="very" celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Day</Table.HeaderCell>
                        <Table.HeaderCell>Time</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {toPrint.map((item, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                {dayStringMap[parseInt(item.value)]}
                            </Table.Cell>
                            <Table.Cell>{item.time}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        );
    };

    render() {
        return (
            <Card style={{ width: '100%' }}>
                {this.state.showPartTimeInfo && (
                    <PartTimeInfo salary={500} />
                )}
                {this.state.showFullTimeInfo && (
                    <FullTimeInfo salary={1000} />
                )}
                <CardContent>
                    <CardHeader>Schedule</CardHeader>
                </CardContent>

                <CardContent>
                    {this.props.isPartTime
                        ? this.partTimeTable()
                        : this.fullTimeTable()}
                </CardContent>
                <CardContent>
                    <Button
                        style={{ alignSelf: 'center', marginTop: '20px' }}
                        type="success"
                        onClick={this.handleUpdate}
                    >
                        Change entire schedule
                    </Button>
                </CardContent>
            </Card>
        );
    }
}

export default ViewStats;

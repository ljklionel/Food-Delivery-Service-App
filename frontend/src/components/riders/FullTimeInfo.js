import React, { Component } from 'react';
import {
    Grid,
    Image,
    Header,
    Loader,
    Card,
    List,
    Button,
    Menu,
    Modal,
    GridColumn,
    GridRow,
    Statistic
} from 'semantic-ui-react';
import Select from 'react-select';
import myAxios from '../../webServer.js';
import RiderDashboard from '../../pages/riders/RiderDashboard';

const daysOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Option 4' },
    { value: '5', label: 'Option 5' },
    { value: '6', label: 'Option 6' },
    { value: '7', label: 'Option 7' }
];

const shiftsOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Option 4' }
];

class FullTimeInfo extends Component {
    state = { showModal: true, redirect: false, day: '', shift: '' };

    handleConfirm = () => {
        console.log(this.state);
        if (this.state.day.length == 0 || this.state.shift.length == 0) {
            alert('Please select a day and a shift');
            return;
        }
        myAxios
            .delete('delete_full_time')
            .then(response => {
                console.log(response);
            })
            .then(() => {
                myAxios
                    .post('add_full_time', {
                        startDay: this.state.day,
                        shift: this.state.shift
                    })
                    .then(response => {
                        console.log(response);
                        window.location.reload();
                    });
            })
            .catch(error => {
                console.log(error);
            });

        this.setState({ showModal: false });
    };

    handleClose = () => {
        this.setState({ showModal: false });
    };

    handleOpen = () => {
        this.setState({ showModal: true });
    };

    openFullTime = () => {
        this.setState(prevState => {
            return {
                ...prevState,
                redirect: true
            };
        });
    };

    handleDaySelection = option => {
        console.log(option);
        if (option == null) {
            this.setState(prevState => {
                return {
                    ...prevState,
                    day: '',
                    shift: ''
                };
            });
        } else {
            let optionValue = option.value;
            this.setState(prevState => {
                return {
                    ...prevState,
                    day: optionValue
                };
            });
        }
    };

    handleShiftSelection = option => {
        console.log(option);
        if (option == null) {
            this.setState(prevState => {
                return {
                    ...prevState,
                    day: '',
                    shift: ''
                };
            });
        } else {
            let optionValue = option.value;
            this.setState(prevState => {
                return {
                    ...prevState,
                    shift: optionValue
                };
            });
        }
    };

    getDayMenu = () => {
        return (
            <Select
                onChange={this.handleDaySelection}
                options={daysOptions}
                isClearable
                isSearchable
            ></Select>
        );
    };

    getShiftMenu = () => {
        return (
            <Select
                onChange={this.handleShiftSelection}
                options={shiftsOptions}
                isClearable
                isSearchable
            ></Select>
        );
    };

    getContent = () => {
        return (
            <Grid>
                <GridRow>
                    <h4>
                        Select your choice of shift and 5-consecutive-day work
                        option.
                    </h4>
                </GridRow>
                <GridRow>
                    <GridColumn style={{ width: '50%' }}>
                        <h5>Work days as follows:</h5>
                        <h6>Option 1: Monday to Friday</h6>
                        <h6>Option 2: Tuesday to Saturday</h6>
                        <h6>Option 3: Wednesday to Sunday</h6>
                        <h6>Option 4: Thursday to Monday</h6>
                        <h6>Option 5: Friday to Tuesday</h6>
                        <h6>Option 6: Saturday to Wednesday</h6>
                        <h6>Option 7: Sunday to Thursday</h6>
                    </GridColumn>
                    <GridColumn style={{ width: '50%' }}>
                        <h5>Shifts as follows:</h5>
                        <h6>Option 1: 10am to 2pm and 3pm to 7pm</h6>
                        <h6>Option 2: 11am to 3pm and 4pm to 8pm</h6>
                        <h6>Option 3: 12pm to 4pm and 5pm to 9pm</h6>
                        <h6>Option 4: 1pm to 5pm and 6pm to 10pm</h6>
                    </GridColumn>
                </GridRow>
                <GridRow>
                    <GridColumn style={{ width: '50%' }}>
                        <h5>Select a day</h5>
                        {this.getDayMenu()}
                    </GridColumn>
                    <GridColumn style={{ width: '50%' }}>
                        <h5>Select shift</h5>
                        {this.getShiftMenu()}
                    </GridColumn>
                </GridRow>
            </Grid>
        );
    };

    render() {
        if (this.state.redirect) {
            return (
                <Modal open={this.state.showModal} onClose={this.handleClose}>
                    <Modal.Header>Full Time Schedule</Modal.Header>
                    <Modal.Content>{this.getContent()}</Modal.Content>
                    <Modal.Actions>
                        <Button color="red" onClick={this.handleClose}>
                            Cancel
                        </Button>
                        <Button primary onClick={this.handleConfirm}>
                            Confirm
                        </Button>
                    </Modal.Actions>
                </Modal>
            );
        }
        return (
            <Modal open={this.state.showModal} onClose={this.handleClose}>
                <Modal.Header>Description For Full Timer</Modal.Header>
                <h4 style={{ marginLeft: '20px' }}>
                    Schedule: Monthly-based schedule. Choose one of
                    5-consecutive-day work per week option and it must be the
                    same for the entire month.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    Work Hours: 8 work hours comprising of 2 4-hour periods with
                    an hour break in between. Choose one of the shift options
                    given.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    Salary: Each full-time rider earns a monthly base salary.On
                    top of the base salary, each rider also earns a fee for each
                    completed delivery.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    Click confirm to join as a full timer.
                </h4>
                <Modal.Actions>
                    <Button color="red" onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button primary onClick={this.openFullTime}>
                        Confirm
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FullTimeInfo;

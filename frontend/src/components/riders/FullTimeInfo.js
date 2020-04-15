import React, { Component } from 'react';
import { Button, Grid, Modal, GridColumn, GridRow } from 'semantic-ui-react';
import Select from 'react-select';
import myAxios from '../../webServer.js';
import ScheduleNote from './ScheduleNote';

const daysOptions = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' }
];

const shiftsOptions = [
    { value: '1', label: '10am to 2pm and 3pm to 7pm' },
    { value: '2', label: '11am to 3pm and 4pm to 8pm' },
    { value: '3', label: '12pm to 4pm and 5pm to 9pm' },
    { value: '4', label: '1pm to 5pm and 6pm to 10pm' }
];

const dayCombination = [
    { value: '1', label: ['1', '2', '3', '4', '5'] },
    { value: '2', label: ['2', '3', '4', '5', '6'] },
    { value: '3', label: ['3', '4', '5', '6', '7'] },
    { value: '4', label: ['1', '4', '5', '6', '7'] },
    { value: '5', label: ['1', '2', '5', '6', '7'] },
    { value: '6', label: ['1', '2', '3', '6', '7'] },
    { value: '7', label: ['1', '2', '3', '4', '7'] }
];

class FullTimeInfo extends Component {
    state = {
        showModal: true,
        redirect: false,
        day: '',
        shift: '',
        noteList: [],
        daysList: [],
        salary: this.props.salary
    };

    handleConfirm = () => {
        console.log(this.state.noteList);
        console.log(this.state.daysList);
        if (this.state.noteList.length < 5) {
            alert('You need to add more days!!');
            return;
        } else if (this.state.noteList.length > 5) {
            alert('You need to decrease the number of days!!');
            return;
        } else {
            var tempDaysList = this.state.daysList;
            var check = false;
            tempDaysList.sort();
            console.log('templist', tempDaysList);
            var count = 0;
            dayCombination.forEach(value => {
                count = 0;
                for (var i = 0; i < 5; i++) {
                    if (value.label[i] == tempDaysList[i]) {
                        count++;
                    }
                }               
                if (count == 5) {
                    check = true;
                }
            });
            if (!check) {
                alert('You do not have 5 consecutive days!!');
                return;
            }
            myAxios
                .post('add_full_time', {
                    salary: this.state.salary
                })
                .then(response => {
                    var postData = {};
                    console.log(response);
                    this.state.noteList.forEach(note => {
                        postData[note.day] = note.currShift;
                        myAxios
                            .post('add_full_time_sched', {
                                workDayShift: postData
                            })
                            .then(response => {
                                console.log(response);
                                window.location.reload();
                            });
                    });
                });
        }
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

    deleteNote = (index, day, hour) => {
        var arr = this.state.daysList;
        const id = arr.indexOf(day);
        console.log(day);
        if (id > -1) {
            arr.splice(id, 1);
        }
        this.setState(prevState => {
            return {
                ...prevState,
                daysList: arr,
                noteList: this.state.noteList.filter(
                    note => note.id !== index && note.day !== day
                )
            };
        });
    };

    addNote = () => {
        const emptyFieldError = 'Do not leave any fields blank!!';
        if (this.state.day.length == 0 || this.state.shift.length == 0) {
            alert(emptyFieldError);
            return;
        }
        const dayError =
            'You cannot choose the same day!! Delete that entry if you want to update!!';
        var validDay = this.state.daysList.includes(this.state.day);
        if (validDay) {
            alert(dayError);
            return;
        }
        const note = {
            id: this.state.day,
            heading: daysOptions[parseInt(this.state.day) - 1].label,
            value: shiftsOptions[parseInt(this.state.shift) - 1].label,
            day: this.state.day,
            currShift: this.state.shift,
            totalHours: 8
        };
        console.log(note);
        this.setState(prevState => {
            return {
                ...prevState,
                noteList: [...this.state.noteList, note],
                daysList: [...this.state.daysList, this.state.day]
            };
        });
    };

    getContent = () => {
        return (
            <Grid>
                <GridRow>
                    <h4 style={{ marginLeft: '20px' }}>
                        Remember that 5 consecutive days must be chosen.
                    </h4>
                </GridRow>
                <GridRow>
                    <GridColumn style={{ width: '45%' }}>
                        <h5>Select a day</h5>
                        {this.getDayMenu()}
                    </GridColumn>
                    <GridColumn style={{ width: '45%' }}>
                        <h5>Select Shift</h5>
                        {this.getShiftMenu()}
                    </GridColumn>
                    <GridColumn>
                        <Button
                            style={{ marginTop: '33px' }}
                            variant="success"
                            onClick={this.addNote}
                        >
                            +
                        </Button>
                    </GridColumn>
                </GridRow>
                <div>
                    {this.state.noteList.map(note => {
                        return (
                            <ScheduleNote
                                key={note.id}
                                day={note.heading}
                                time={note.value}
                                index={note.id}
                                dayID={note.day}
                                hour={note.totalHours}
                                onDelete={this.deleteNote}
                            />
                        );
                    })}
                </div>
            </Grid>
        );
    };

    render() {
        if (this.state.redirect) {
            return (
                <Modal open={this.state.showModal}>
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

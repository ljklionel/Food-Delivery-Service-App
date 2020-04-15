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
    GridColumn,
    GridRow,
    Statistic,
    Modal,
    CardDescription
} from 'semantic-ui-react';
import Select from 'react-select';
import ScheduleNote from './ScheduleNote';
import myAxios from '../../webServer.js';

const daysOptions = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '7', label: 'Sunday' }
];

const timeOptions = [
    { value: '10', label: '10am - 11am' },
    { value: '11', label: '11am - 12pm' },
    { value: '12', label: '12pm - 1pm' },
    { value: '13', label: '1pm - 2pm' },
    { value: '14', label: '2pm - 3pm' },
    { value: '15', label: '3pm - 4pm' },
    { value: '16', label: '4pm - 5pm' },
    { value: '17', label: '5pm - 6pm' },
    { value: '18', label: '6pm - 7pm' },
    { value: '19', label: '7pm - 8pm' },
    { value: '20', label: '8pm - 9pm' },
    { value: '21', label: '9pm - 10pm' }
];

class PartTimeInfo extends Component {
    state = {
        showModal: true,
        redirect: false,
        day: 0,
        time: [],
        dayString: '',
        noteList: [],
        daysRecorded: [],
        totalHours: 0,
        salary: this.props.salary
    };

    handleConfirm = () => {
        console.log(this.state.totalHours);
        if (this.state.totalHours < 10) {
            alert('You have less than 10 hours of work!! Please work more!!');
            return;
        } else if (this.state.totalHours > 48) {
            alert('You have more than 48 hours of work!! Please work less!!');
            return;
        } else {
            var postData = [];
            this.state.noteList.forEach(note => {
                note.pairArr.forEach(pair => {
                    const triple = {
                        day: note.day,
                        start: pair.start,
                        end: pair.end
                    }
                    postData.push(triple);
                    console.log(postData);
                });
            });
            myAxios
                .post('add_part_time', {
                    salary: this.state.salary
                })
                .then(response => {
                    console.log(response);
                    myAxios
                        .post('add_part_time_sched', {
                            triple: postData
                        })
                        .then(response => {
                            console.log(response);
                            window.location.reload();
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

    openPartTime = () => {
        this.setState({
            redirect: true
        });
    };

    handleDropdownnoteList = option => {
        console.log(option);
        if (option == null) {
            this.setState(prevState => {
                return {
                    ...prevState,
                    day: '',
                    dayString: ''
                };
            });
        } else {
            let optionValue = option.value;
            let optionLabel = option.label;
            this.setState(prevState => {
                return {
                    ...prevState,
                    day: optionValue,
                    dayString: optionLabel
                };
            });
        }
    };

    handleMultiTimeSelection = options => {
        console.log('time', this.state.time);
        console.log('val',options);
        if (options.length == 0) {
            this.setState(prevState => {
                return {
                    ...prevState,
                    time: []
                };
            });
        } else {
            let arrTimeVal = [...this.state.time];
            const optionsValue = options.map(({ value }) => value);
            if (arrTimeVal.length < optionsValue.length) {
                const addedValue = optionsValue.filter(
                    x => !arrTimeVal.includes(x)
                );
                arrTimeVal.push(addedValue[0]);
            } else {
                let removedValue = arrTimeVal.filter(
                    x => !optionsValue.includes(x)
                );
                console.log('removed value', removedValue[0]);
                let index = arrTimeVal.indexOf(removedValue[0]);
                if (index !== -1) {
                    arrTimeVal.splice(index, 1);
                }
            }
            console.log(arrTimeVal);
            this.setState(prevState => {
                return {
                    ...prevState,
                    time: arrTimeVal
                };
            });
        }
    };

    getDaysMenu = () => {
        return (
            <Select
                onChange={this.handleDropdownnoteList}
                options={daysOptions}
                isClearable
                isSearchable
            ></Select>
        );
    };

    getTimeMenu = () => {
        return (
            <Select
                onChange={this.handleMultiTimeSelection}
                options={timeOptions}
                isClearable
                isSearchable
                isMulti
            ></Select>
        );
    };

    deleteNote = (index, day, hour) => {
        var arr = this.state.daysRecorded;
        const id = arr.indexOf(day);
        console.log(day);
        console.log('before hour change', this.state.totalHours);
        if (id > -1) {
            arr.splice(id, 1);
        }
        this.setState(prevState => {
            return {
                ...prevState,
                daysRecorded: arr,
                totalHours: this.state.totalHours - hour,
                noteList: this.state.noteList.filter(
                    note => note.id !== index && note.day !== day
                )
            };
        });
    };

    addNote = () => {
        var altTime = this.state.time;
        altTime.sort();
        var startEndPair = [];
        var currTimeString = '';
        var curr = '';
        var prev = '';
        var start = '';
        var count = 1;
        var isValid = true;
        var workHours = 0;
        const breakError = 'You need to have a break every 4 hours of work!!';
        const dayError =
            'You cannot choose the same day!! Delete that entry if you want to update!!';
        const emptyField = 'Please reselect day and timeslots.';
        console.log(this.state.time);
        var size = this.state.time.length;
        var validDay = this.state.daysRecorded.includes(this.state.day);
        if (this.state.day === 0 || this.state.time.length === 0) {
            alert(emptyField);
            return;
        }
        if (validDay) {
            alert(dayError);
            return;
        }
        altTime.forEach(startTime => {
            if (size == 1) {
                var end = (parseInt(startTime) + 1).toString();
                currTimeString += startTime + '00h - ' + end + '00h';
                const pair = {
                    start: startTime,
                    end: end
                };
                startEndPair.push(pair);
            } else {
                if (!start) {
                    currTimeString += startTime + '00h - ';
                    start = startTime;
                    curr = startTime;
                    workHours++;
                } else if (prev) {
                    curr = startTime;
                    workHours++;
                    var diff = parseInt(curr) - parseInt(prev);
                    if (diff > 1) {
                        var end = (parseInt(prev) + 1).toString();
                        currTimeString += end + '00h   ';
                        const pair = {
                            start: start,
                            end: end
                        };
                        startEndPair.push(pair);
                        workHours = 0;
                        start = startTime;
                        curr = startTime;
                        prev = '';
                        if (count === size) {
                            var end = (parseInt(curr) + 1).toString();
                            currTimeString += start + '00h - ' + end + '00h';
                            const pair = {
                                start: start,
                                end: end
                            };
                            startEndPair.push(pair);
                            workHours = 0;
                        } else {
                            currTimeString += start + '00h - ';
                            workHours++;
                        }
                    } else if (count === size) {
                        if (workHours > 4) {
                            console.log(workHours);
                            isValid = false;
                        }
                        var end = (parseInt(curr) + 1).toString();
                        currTimeString += end + '00h   ';
                        const pair = {
                            start: start,
                            end: end
                        };
                        startEndPair.push(pair);
                    }
                }
            }
            count++;
            prev = curr;
        });
        if (!isValid) {
            isValid = true;
            alert(breakError);
            return;
        }
        const note = {
            id: this.state.noteList.length + 1,
            heading: this.state.dayString,
            value: currTimeString,
            day: this.state.day,
            pairArr: startEndPair,
            totalHours: size
        };
        console.log(note);
        this.setState(prevState => {
            return {
                ...prevState,
                noteList: [...this.state.noteList, note],
                daysRecorded: [...this.state.daysRecorded, this.state.day],
                totalHours: this.state.totalHours + size
            };
        });
    };

    render() {
        if (this.state.redirect) {
            return (
                <Modal open={this.state.showModal}>
                    <Modal.Header>Part Time Schedule</Modal.Header>
                    <Modal.Content>
                        <Grid>
                            <GridRow>
                                <h4>
                                    Select your day and hours to work. Remember
                                    that each hour interval must start and end
                                    on the hour, and its duration must not
                                    exceed four hours. The total number of hours
                                    in each week must be at least 10 and at most
                                    48.
                                </h4>
                            </GridRow>
                            <GridRow>
                                <GridColumn style={{ width: '45%' }}>
                                    <h5>Select a day</h5>
                                    {this.getDaysMenu()}
                                </GridColumn>
                                <GridColumn style={{ width: '45%' }}>
                                    <h5>Select timeslots</h5>
                                    {this.getTimeMenu()}
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
                    </Modal.Content>
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
                <Modal.Header>Description For Part Timer</Modal.Header>
                <h4 style={{ marginLeft: '20px' }}>
                    Schedule: Weekly-based schedule. Choose as many days to work
                    for the week.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    Work Hours: Minimum work hours is 10h. Maximum work hours is
                    48h. Each hour interval must start and end on the hour, and
                    its duration must not exceed four hours.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    There must be at least one hour of break between two
                    consecutive hour intervals.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    Salary: Each part-time rider earns a weekly base salary. On
                    top of the base salary, each rider also earns a fee for each
                    completed delivery.
                </h4>
                <h4 style={{ marginLeft: '20px' }}>
                    Click confirm to join as a part timer.{' '}
                </h4>
                <Modal.Actions>
                    <Button color="red" onClick={this.handleClose}>
                        Cancel
                    </Button>
                    <Button primary onClick={this.openPartTime}>
                        Confirm
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default PartTimeInfo;

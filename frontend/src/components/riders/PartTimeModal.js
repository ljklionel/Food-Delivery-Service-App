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

class PartTimeModal extends Component {
    state = {
        show: true,
        day: 0,
        time: [],
        dayString: '',
        timeLabel: '',
        change: [],
        workDay: []
    };

    handleConfirm = () => {
        this.setState({ show: true });
    };

    handleClose = () => {
        this.setState({ show: false });
    };

    handleDropdownChange = option => {
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
        let arrTimeVal = [...this.state.time];
        let arrTimeLab = [...this.state.timeLabel];
        const optionsValue = options.map(({ value }) => value);
        const optionsLabel = options.map(({ label }) => label);
        if (arrTimeVal.length < optionsValue.length) {
            const addedValue = optionsValue.filter(
                x => !arrTimeVal.includes(x)
            );
            const addedLabel = optionsLabel.filter(
                x => !arrTimeLab.includes(x)
            );
            arrTimeVal.push(addedValue);
            optionsLabel.push(addedLabel);
            console.log('addedValue', addedValue);
        } else {
            let removedValue = arrTimeVal.filter(
                x => !optionsValue.includes(x)
            );
            let removedLab = arrTimeLab.filter(x => !optionsLabel.includes(x));
            console.log('removedValue', removedValue);
            let index = arrTimeVal.indexOf(removedValue);
            let index1 = arrTimeLab.indexOf(removedLab);
            if (index !== -1) {
                arrTimeVal.splice(index, 1);
                arrTimeLab.splice(index1, 1);
            }
        }
        this.setState(prevState => {
            return {
                ...prevState,
                time: arrTimeVal,
                timeLabel: arrTimeLab
            };
        });
    };

    getDaysMenu = () => {
        return (
            <Select
                onChange={this.handleDropdownChange}
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

    deleteNote = index => {
        return this.setState({
            change: [...this.state.change].splice(index, 1)
        });
    };

    addNote = note => {
        this.setState({
            change: [...this.state.change, note]
        });
    };

    getContent = () => {
        return (
            <Grid>
                <GridRow>
                    <h4>
                        Select your day and hours to work. Remember that each
                        hour interval must start and end on the hour, and its
                        duration must not exceed four hours. The total number of
                        hours in each week must be at least 10 and at most 48.
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
                    {this.state.change.map((note, index) => {
                        return (
                            <ScheduleNote
                                day={this.state.dayString}
                                time={this.state.time}
                                index={index}
                                onDelete={this.deleteNote}
                                onAdd={this.addNote}
                            />
                        );
                    })}
                </div>
            </Grid>
        );
    };

    render() {
        return this.getContent();
    }
}

export default PartTimeModal;

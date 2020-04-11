import React, { Component } from 'react';
import './RiderStyles.css';

class ScheduleNote extends Component {
    handleClick = () => {
        this.props.onDelete(this.props.index, this.props.dayID, this.props.hour);
    };

    render() {
        return (
            <div className="note">
                <h4>{this.props.day}</h4>
                <p>{this.props.time}</p>
                <button onClick={this.handleClick}>X</button>
            </div>
        );
    }
}

export default ScheduleNote;

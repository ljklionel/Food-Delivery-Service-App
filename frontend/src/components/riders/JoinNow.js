import React, { Component } from 'react';
import { Image, Button, GridColumn, GridRow } from 'semantic-ui-react';
import '../../components/riders/RiderStyles.css';
import PartTimeInfo from './PartTimeInfo';
import FullTimeInfo from './FullTimeInfo';

class JoinNow extends Component {
    state = {
        isPartTime: false,
        isFullTime: false,
        showPartTimeInfo: false,
        showFullTimeInfo: false
    };

    handleOpenPartTimeInfo() {
        this.setState(prevState => {
            return {
                ...prevState,
                showPartTimeInfo: !prevState.showPartTimeInfo
            };
        });
    }

    handleOpenFullTimeInfo() {
        this.setState(prevState => {
            return {
                ...prevState,
                showFullTimeInfo: !prevState.showFullTimeInfo
            };
        });
    }

    render() {
        return (
            <GridRow style={{ height: '82%' }}>
                {this.state.showPartTimeInfo && <PartTimeInfo salary = {this.props.salary} />}
                {this.state.showFullTimeInfo && <FullTimeInfo salary = {this.props.salary} />}
                <h2
                    style={{
                        textAlign: 'center',
                        width: '100%',
                        borderStyle: 'solid',
                        padding: '0',
                        margin: '0',
                        background: '#edf8ff'
                    }}
                >
                    Welcome to FDS!!! Click on either part time or full time to
                    join our FDS family!!!
                </h2>
                <GridColumn className="parttimecol" style={{ width: '50%' }}>
                    <Button
                        type="submit"
                        style={{ background: 'transparent', width: '100%' }}
                        onClick={() => this.handleOpenPartTimeInfo()}
                    >
                        <Image
                            className="riderimage"
                            src={'/images/riderimage/parttime.svg'}
                        />
                        <h3 style={{ textAlign: 'center' }}>Part Timer</h3>
                    </Button>
                </GridColumn>
                <GridColumn className="fulltimecol" style={{ width: '50%' }}>
                    <Button
                        type="submit"
                        style={{ background: 'transparent', width: '100%' }}
                        onClick={() => this.handleOpenFullTimeInfo()}
                    >
                        <Image
                            className="riderimage"
                            src={'/images/riderimage/fulltime.svg'}
                        />
                        <h3 style={{ textAlign: 'center' }}>Full Timer</h3>
                    </Button>
                </GridColumn>
            </GridRow>
        );
    }
}

export default JoinNow;

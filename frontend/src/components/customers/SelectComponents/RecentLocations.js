import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faCheck } from '@fortawesome/free-solid-svg-icons'
import onClickOutside from "react-onclickoutside";

class RecentLocations extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listOpen: false,
            headerTitle: this.props.title,
            toggleSelectedLocation: this.props.toggleSelectedLocation
        }
    }

    handleClickOutside() {
        this.setState({
            listOpen: false
        })
    }

    toggleList() {
        this.setState(prevState => ({
            listOpen: !prevState.listOpen
        }))
    }

    render() {
        const { list } = this.props
        const { listOpen, headerTitle } = this.state
        return (
            <div className="dd-wrapper">
                <div className="dd-header" onClick={() => this.toggleList()}>
                    <div className="dd-header-title">{headerTitle}</div>
                    {listOpen
                        ? <FontAwesomeIcon icon={faArrowUp} />
                        : <FontAwesomeIcon icon={faArrowDown} />
                    }
                </div>
                {listOpen && <ul className="dd-list" style={{ textAlign: "left", width: "200px" }}>
                    {list.map((item) => (
                        <li style={{ listStyle: "none", width: "100%" }} className="dd-list-item" key={item.title} onClick={() => this.props.toggleSelectedLocation(item.id, item.key)}>
                            {item.title} {item.selected && <FontAwesomeIcon icon={faCheck} />}
                        </li>
                    ))}
                </ul>}
            </div>
        )
    }
}

export default onClickOutside(RecentLocations)
import React, { Component } from 'react'
import { Dropdown } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'

class CreditCardSelection extends Component {
    constructor(props){
        super(props)
        this.state = {
            listOpen: false,
            headerTitle: this.props.title,
        }
    }

    handleClickOutside(){
        this.setState({
          listOpen: false
        })
      }


    toggleList(){
        this.setState(prevState => ({
            listOpen: !prevState.listOpen
        }))
    }

    render(){
    const{list} = this.props
    console.log("Props", this.props)
    const{listOpen, headerTitle} = this.state
    console.log("List", list)

    return(
        <div className="dd-wrapper">
    <div className="dd-header" onClick={() => this.toggleList()}>
            <div className="dd-header-title">{headerTitle}</div>
            {/* {listOpen ? 1 : 1} */}
            <FontAwesomeIcon icon="coffee" />
            {listOpen ? 1 : 1}
            {listOpen
            ? <FontAwesomeIcon icon="faCoffee" size="2x"/>
            : <FontAwesomeIcon icon="faCoffee" size="2x"/>
            }
        </div>
    {listOpen && <ul className="dd-list">
            {list.map((item) => (
            <li className="dd-list-item" key={item.id} >{item.title}</li>
            ))}
        </ul>}
        </div>
    )
    }
}

export default CreditCardSelection
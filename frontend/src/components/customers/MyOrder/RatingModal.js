import React, { Component } from 'react'
import { Modal, Rating, Button, Table } from 'semantic-ui-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import myAxios from '../../../webServer.js'

class RatingModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            restaurant: null,
            modalOpen: false,
            rating: null,
            ratingList: [
                {
                    id: 1,
                    selected: false,
                },
                {
                    id: 2,
                    selected: false,
                },
                {
                    id: 3,
                    selected: false,
                },
                {
                    id: 4,
                    selected: false,
                },
                {
                    id: 5,
                    selected: false,
                }
            ]
        }
    }

    toggleItem = (id) => {
        this.state.rating = id
        this.state.ratingList.map((x) =>
            x.selected = false
        )
        let temp = this.state["ratingList"]
        temp[id - 1].selected = !temp[id - 1].selected
        this.setState({
            ["ratingList"]: temp
        })
        // this.state.ratingList[id].selected = true
    }

    handleOpen = () => {
        this.setState({
            modalOpen: true,
        })
    }

    handleRatingChange = (e, { value }) => {
        this.state.rating = value
    }

    handleSave = () => {
        if (this.state.rating === null) {
            alert("Please select one of the ratings")
            return
        }
        myAxios.post('edit_rating', {
            orderid: this.props.orderid,
            rating: this.state.rating,
        })
            .then(response => {
                this.setState({
                    modalOpen: false,
                })
                alert("You gave " + this.props.riderUsername + " a rating of " + this.state.rating)
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    handleRate = (e, { rating, maxRating }) =>
        this.setState({ rating, maxRating })

    render() {
        var content
        const list = this.state.ratingList
        if (this.state.isLoading) {
            content = null
        } else {
            content = (<div>Choose a rating below</div>)
        }

        return (
            <Modal trigger={<Button color='blue' onClick={this.handleOpen} fluid basic>Rate this delivery</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
                <Modal.Header>Restaurant: {this.props.restaurant}</Modal.Header>
                <Modal.Content>
                    Order ID: {this.props.orderid}
                    <br></br>
                    Delivery Rider: {this.props.riderUsername}
                    <br></br>
                    <br></br>
                    {content}
                    {/* {list.map((item) => (
                        <li style={{ width: "100%" }} className="dd-list-item" key={item.title} onClick={() => this.toggleItem(item.id)}>
                            {item.id} {item.selected && <FontAwesomeIcon icon={faCheck} />}
                        </li>
                    ))} */}
                    <Rating icon='star' maxRating={5} onRate={this.handleRate} />
                </Modal.Content>

                <Modal.Actions>
                    <Button color='red' onClick={this.handleClose}>
                        Cancel
                </Button>
                    <Button primary onClick={this.handleSave}>
                        Give ratings
                </Button>
                </Modal.Actions>
            </Modal>)
    }
}

export default RatingModal;
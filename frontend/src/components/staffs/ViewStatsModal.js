import React, { Component } from 'react'
import { Modal, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class ViewStatsModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            promotions: [],
            currentRestaurant: props.restaurant,
            modalOpen: false
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => this.setState({ modalOpen: false })

    componentDidMount() {
        myAxios.get('/all_restaurant_summary', {
            params: {
                restaurant: this.state.currentRestaurant
            }
          })
          .then(response => {
            console.log(response);
            this.setState({
              promotions: response.data.result,
              isLoading: false
            })
          })
          .catch(error => {
            console.log(error);
          });
    }


    monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    render() {
        var content
        if (this.state.isLoading) {
            content = null
        } else {
            const promos = this.state.promotions
            const first_month = []
            for (let i = 0; i < promos.length; i++) {
                if (i !== 0 && promos[i].year === promos[i-1].year) {
                    first_month.push(false)
                } else {
                    first_month.push(true)
                }
            }
            
            content = (
            <Table structured celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Year</Table.HeaderCell>
                    <Table.HeaderCell>Month</Table.HeaderCell>
                    <Table.HeaderCell>Orders</Table.HeaderCell>
                    <Table.HeaderCell>Cost</Table.HeaderCell>
                    <Table.HeaderCell>Top five</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {promos.map((item, i) => (
                    <Table.Row key={item['year'] + '-' + item['month']}>
                        { first_month[i] ? 
                        (<Table.Cell rowSpan={item['month']}>
                            {item['year']}
                        </Table.Cell>):(null)
                        }
                        <Table.Cell>
                            {this.monthNames[item['month']-1]}
                        </Table.Cell>
                        <Table.Cell>
                            {item['completed_orders']}
                        </Table.Cell>
                        <Table.Cell>
                            ${item['total_cost'] == null ?
                                    0 : item['total_cost'].toFixed(1)}
                        </Table.Cell>
                        <Table.Cell>
                            {item['top_five'].map(x => x[0] + ' (' + x[1] + ')').join(', ')}
                        </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table>
            )
        }
        return (
        <Modal trigger={<Button onClick={this.handleOpen} fluid basic>View All</Button>}
                open={this.state.modalOpen}
                onClose={this.handleClose}>
            <Modal.Header>View Statistics</Modal.Header>
            <Modal.Content>
                {content}
            </Modal.Content>
            
            <Modal.Actions>
                <Button primary onClick={this.handleClose}>
                    Done
                </Button>
            </Modal.Actions>
        </Modal>)
    }
}

export default ViewStatsModal;
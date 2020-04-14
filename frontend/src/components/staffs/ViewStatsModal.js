import React, { Component } from 'react'
import { Modal, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class ViewStatsModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            stats: [],
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
            var res = []
            var orders_and_fee = response.data.result['orders_and_fee']
            var top_five = response.data.result['top_five']
            var j = 0
            for (var i = 0; i < orders_and_fee.length; ++i) {
                var data = {}
                data['year'] = orders_and_fee[i][2]
                data['month'] = orders_and_fee[i][3]
                data['completed_orders'] = orders_and_fee[i][0]
                data['total_cost'] = orders_and_fee[i][1]
                data['top_five'] = ''
                for (var k = 0; j < top_five.length && top_five[j][2] == data['year'] && top_five[j][3] == data['month']; ++j, ++k) {
                    if (k < 5) {
                        data['top_five'] += top_five[j][1] + ' (' + top_five[j][0] + '), '
                    }
                }
                data['top_five'] = data['top_five'].substring(0, data['top_five'].length-2)
                res.push(data)
            }
            console.log(res)
            this.setState({
              stats: res,
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
            const stats = this.state.stats
            const first_month = []
            for (let i = 0; i < stats.length; i++) {
                if (i !== 0 && stats[i].year === stats[i-1].year) {
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
                {stats.map((item, i) => (
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
                            {item['top_five']}
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
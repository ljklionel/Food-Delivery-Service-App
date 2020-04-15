import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class ViewRiderModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            contents: [],
            modalOpen: false,
            currentRider: props.rider
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => this.setState({ modalOpen: false })

    componentDidMount() {
        myAxios.get('/current_rider_summary', {
            params: {
                rider: this.state.currentRider
            }
          })
          .then(response => {
            console.log(response);
            var res = []
            var orders_and_ratings = response.data.result['orders_and_ratings']
            var salary = response.data.result['salary']
            var hours_worked = response.data.result['hours_worked']
            
            for (var i = 0; i < orders_and_ratings.length; ++i) {
                var data = {}
                data['year'] = orders_and_ratings[i][4]
                data['month'] = orders_and_ratings[i][5]
                data['rider_orders'] = orders_and_ratings[i][0]
                data['delivery_time'] = orders_and_ratings[i][1]
                data['num_rating'] = orders_and_ratings[i][2]
                data['avg_rating'] = orders_and_ratings[i][3]
                data['salary'] = orders_and_ratings[i][6] + salary
                data['hours_worked'] = hours_worked
                res.push(data)
            }
            res['work_type'] = response.data.result['work_type']
            console.log(res)
            this.setState({
              contents: res,
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
            const contents = this.state.contents
            const first_month = []
            const row_span = []
            var counter = 1;
            for (let i = 0; i < contents.length; i++) {
                if (i !== 0 && contents[i].year === contents[i-1].year) {
                    first_month.push(false)
                    counter++
                    row_span[i] = 0
                } else {
                    first_month.push(true)
                    if (i != 0 ) {
                        row_span[i - counter] = counter
                    } else {
                        row_span[i] = 0
                    }
                    counter = 1
                }
            }
            row_span[contents.length - counter] = counter
            
            content = (
            <Table structured celled>
                <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Year</Table.HeaderCell>
                    <Table.HeaderCell>Month</Table.HeaderCell>
                    <Table.HeaderCell>Orders</Table.HeaderCell>
                    {this.state.contents['work_type'] == 'fulltime'? <Table.HeaderCell>Hours</Table.HeaderCell>
                    :<></>}
					<Table.HeaderCell>Salary</Table.HeaderCell>
					<Table.HeaderCell>Avg Delivery Time</Table.HeaderCell>
					<Table.HeaderCell>No. of Ratings</Table.HeaderCell>
					<Table.HeaderCell>Average Rating</Table.HeaderCell>
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {contents.map((item, i) => (
                    <Table.Row key={item['year'] + '-' + item['month']}>
                        { first_month[i] ? 
                        (<Table.Cell rowSpan={row_span[i]}>
                            {item['year']}
                        </Table.Cell>):(null)
                        }
                        <Table.Cell>
                            {this.monthNames[item['month']-1]}
                        </Table.Cell>
                        <Table.Cell>
                            {item['rider_orders']}
                        </Table.Cell>
                        {this.state.contents['work_type'] == 'fulltime' 
                        ? <Table.Cell>
                            {item['hours_worked'] == null ?
                                    0 : item['hours_worked']}
                        </Table.Cell>
                        :<></>}
						<Table.Cell>
                            ${item['salary'] == null ?
                                    0 : item['salary'].toFixed(2)}
                        </Table.Cell>
						<Table.Cell>
                            {item['delivery_time'] == null ?
                                    0 : item['delivery_time'].toFixed(1)} minutes
                        </Table.Cell>
						<Table.Cell>
                            {item['num_rating'] == null ?
                                    0 : item['num_rating']}
                        </Table.Cell>
						<Table.Cell>
                            {item['avg_rating'] == null ?
                                    0 : item['avg_rating'].toFixed(1)}
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

export default ViewRiderModal;
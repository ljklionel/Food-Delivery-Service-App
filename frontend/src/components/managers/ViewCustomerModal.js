import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class ViewCustomerModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            contents: [],
            modalOpen: false
        }
    }

    handleOpen = () => this.setState({ modalOpen: true })
  
    handleClose = () => this.setState({ modalOpen: false })

    componentDidMount() {
        myAxios.get('/current_customer_summary', {
            params: {
                customer: this.state.currentCustomer
            }
          })
          .then(response => {
            console.log(response);
            this.setState({
              contents: response.data.result,
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
            for (let i = 0; i < contents.length; i++) {
                if (i !== 0 && contents[i].year === contents[i-1].year) {
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
                </Table.Row>
                </Table.Header>
                <Table.Body>
                {contents.map((item, i) => (
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
                            {item['customer_orders']}
                        </Table.Cell>
                        <Table.Cell>
                            ${item['customer_orders_costs'] == null ?
                                    0 : item['customer_orders_costs'].toFixed(1)}
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

export default ViewCustomerModal;
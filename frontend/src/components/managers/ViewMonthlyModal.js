import React, { Component } from 'react'
import { Modal, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class ViewMonthlyModal extends Component {
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
        myAxios.get('/all_customer_summary')
          .then(response => {
            console.log(response);
            var res = []
            var orders_and_fee = response.data.result['orders_and_fee']
            var total_cus = response.data.result['all_new_customers']
            var j = 0
            for (var i = 0; i < orders_and_fee.length; ++i) {
                var data = {}
                data['year'] = orders_and_fee[i][2]
                data['month'] = orders_and_fee[i][3]
                data['all_orders'] = orders_and_fee[i][0]
                data['all_orders_costs'] = orders_and_fee[i][1]
                if (j < total_cus.length && total_cus[j][1] == data['year'] && total_cus[j][2] == data['month']) {
                    data['all_new_customers'] = total_cus[j][0]
                    j++
                } else {
                    data['all_new_customers'] = 0
                }
                res.push(data)
            }
            while(j < total_cus.length) {
                var data = {}
                data['year'] = total_cus[j][1]
                data['month'] = total_cus[j][2]
                data['all_orders'] = 0
                data['all_orders_costs'] = 0
                data['all_new_customers'] = total_cus[j][0]
                res.push(data)
                j++
            }
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
                    <Table.HeaderCell>Total Orders</Table.HeaderCell>
                    <Table.HeaderCell>Total Costs</Table.HeaderCell>
					<Table.HeaderCell>Total New Customers</Table.HeaderCell>
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
                            {item['all_orders']}
                        </Table.Cell>
                        <Table.Cell>
                            ${item['all_orders_costs'] == null ?
                                    0 : item['all_orders_costs'].toFixed(2)}
                        </Table.Cell>
						<Table.Cell>
                            {item['all_new_customers'] == null ?
                                    0 : item['all_new_customers']}
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

export default ViewMonthlyModal;

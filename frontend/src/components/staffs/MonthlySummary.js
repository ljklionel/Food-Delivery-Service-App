import React, { Component } from 'react'
import { Grid, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'

class MonthlySummary extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            monthlySummary: {},
            currentRestaurant: props.restaurant
        }
        this.updateSummary(props.restaurant)
    }

    updateSummary(rname) {
        myAxios.get('/restaurant_items', {
          params: {
              restaurant: rname
          }
        })
        .then(response => {
          console.log(response);
          this.setState({
            monthlySummary: response.data.result,
            isLoading: false
          })
        })
        .catch(error => {
          console.log(error);
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            currentRestaurant: nextProps.restaurant,
            isLoading: true 
        });  
        this.updateSummary(nextProps.restaurant)
    }
    

    render() {
        if (this.state.isLoading) {
            return null// <Loader active/>
          }
          return (
            <Card color='red' style={{maxWidth: 250}}>
              <Card.Content>
                <Card.Header>Menu</Card.Header>
              </Card.Content>
              <Card.Content>
                <Table basic='very' celled>
                    <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Item</Table.HeaderCell>
                        <Table.HeaderCell>Avail.</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    {this.state.monthlySummary.map((item) => (
                        <Table.Row key={item[0]}>
                            <Table.Cell>
                                {item[0]}
                            </Table.Cell>
                            <Table.Cell>
                                {item[1]}
                            </Table.Cell>
                        </Table.Row>
                    ))}
                    </Table.Body>
                </Table>
              </Card.Content>
              <Card.Content>
                <Button fluid basic>Edit</Button>
              </Card.Content>
            </Card>
          )
    }
}   

export default MonthlySummary;
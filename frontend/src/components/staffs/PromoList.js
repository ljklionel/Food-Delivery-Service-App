import React, { Component } from 'react'
import { Grid, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'
import ViewPromoModal from './ViewPromoModal.js';

class PromoList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            promotions: [],
            currentRestaurant: props.restaurant
        }
        this.updatePromo(props.restaurant)
    }

    updatePromo(rname) {
        myAxios.get('/ongoing_restaurant_promo', {
          params: {
              restaurant: rname
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

    componentWillReceiveProps(nextProps) {
      this.setState({ 
          currentRestaurant: nextProps.restaurant,
          isLoading: true 
      });  
      this.updatePromo(nextProps.restaurant)
    }
    

    render() {
        if (this.state.isLoading) {
            return null// <Loader active/>
        }
        var content
        if (this.state.promotions.length == 0) {
          content = <p><i>No ongoing promotions.</i></p>
        } else {
          content = (
            <Table basic='very' celled>
                  <Table.Header>
                  <Table.Row>
                      <Table.HeaderCell>ID</Table.HeaderCell>
                      <Table.HeaderCell>Orders</Table.HeaderCell>
                      <Table.HeaderCell>End</Table.HeaderCell>
                  </Table.Row>
                  </Table.Header>
                  <Table.Body>
                  {this.state.promotions.map((item) => (
                      <Table.Row key={item[0]}>
                          <Table.Cell>
                              {item[0]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[2]}
                          </Table.Cell>
                          <Table.Cell>
                              {item[1].substring(0,11)}
                          </Table.Cell>
                      </Table.Row>
                  ))}
                  </Table.Body>
              </Table>
          )
        }
        return (
          <Card color='blue' style={{maxWidth: 250}}>
            <Card.Content>
              <Card.Header>Ongoing Promotions</Card.Header>
            </Card.Content>
            <Card.Content>
              {content}
            </Card.Content>
            <Card.Content>
                <ViewPromoModal restaurant={this.state.currentRestaurant}/>
            </Card.Content>
          </Card>
        )
    }
}   

export default PromoList;
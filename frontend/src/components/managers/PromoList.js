import React, { Component } from 'react'
import { Grid, Image, Header, Loader, Card, List, Button, Table } from 'semantic-ui-react';
import myAxios from '../../webServer.js'
import ViewFDSPromoModal from './ViewFDSPromoModal.js';

class PromoList extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            promotions: [],
        }
    }

    componentDidMount() {
		myAxios.get('/ongoing_FDS_promo')
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
    

    render() {
        if (this.state.isLoading) {
            return <Loader size='massive' active/>// <Loader active/>
        }
        var content
        if (this.state.promotions.length === 0) {
          content = <p><i>No ongoing promotions.</i></p>
        } else {
          content = (
            <Table basic='very' celled>
                  <Table.Header>
                  <Table.Row>
                      <Table.HeaderCell>ID</Table.HeaderCell>
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
                              {item[1].substring(0,11)}
                          </Table.Cell>
                      </Table.Row>
                  ))}
                  </Table.Body>
              </Table>
          )
        }
        return (
          <Card color='blue' style={{marginLeft: "10%"}}>
            <Card.Content>
              <Card.Header>Ongoing Promotions</Card.Header>
            </Card.Content>
            <Card.Content>
              {content}
            </Card.Content>
            <Card.Content>
                <ViewFDSPromoModal/>
            </Card.Content>
          </Card>
        )
    }
}   

export default PromoList;
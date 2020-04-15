import React, { Component } from 'react'
import { Menu, Confirm, Icon } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import myAxios from '../webServer.js'
import EditUserModal from './EditUserModal.js';

class AppHeader extends Component {
    
    state = { openLogOut: false, loggedOut: false, name: false }

    openLogOut = () => this.setState({ openLogOut: true })
    closeLogOut = () => this.setState({ openLogOut: false })

    logout = () => {
        myAxios.post('/signout')
          .then(response => {
            console.log(response);
            this.setState({ loggedOut: true })
          })
          .catch(error => {
            console.log(error);
          });
    }

    componentDidMount() {
        myAxios.get('/user_data')
        .then(response => {
          console.log(response);
          this.setState({name: response.data.result[0]})
        })
        .catch(error => {
          console.log(error);
        });    
    }

    render() {
        if (this.state.loggedOut) {
            return <Redirect to={'/'} />
        }
        return (
            <div>
                <Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {this.state.name ? this.state.name : ''}
                        </Menu.Item>
                        <EditUserModal/>
                        <Menu.Item
                            name='Logout'
                            onClick={this.openLogOut}
                        />
                    </Menu.Menu>
                </Menu>
                <Confirm
                    open={this.state.openLogOut}
                    onCancel={this.closeLogOut}
                    onConfirm={this.logout}
                />
            </div>
        );
    }
}   

export default AppHeader;
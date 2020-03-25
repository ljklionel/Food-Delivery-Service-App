import React, { Component } from 'react'
import { Menu, Confirm } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import myAxios from '../webServer.js'

class AppHeader extends Component {
    
    state = { open: false, loggedOut: false }

    open = () => this.setState({ open: true })
    close = () => this.setState({ open: false })

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

    render() {
        if (this.state.loggedOut) {
            return <Redirect to={'/'} />
        }
        return (
            <div>
                <Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item
                            name='Logout'
                            onClick={this.open}
                        />
                    </Menu.Menu>
                </Menu>
                <Confirm
                    open={this.state.open}
                    onCancel={this.close}
                    onConfirm={this.logout}
                />
            </div>
        );
    }
}   

export default AppHeader;
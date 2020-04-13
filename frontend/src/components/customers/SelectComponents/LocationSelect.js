import _ from 'lodash'
import React, { Component } from 'react'
import { Search, Grid } from 'semantic-ui-react'
import myAxios from '../../../webServer.js'

const initialState = { isLoading: false, results: [], value: '' }

class LocationSelect extends Component {
    state = initialState

    handleResultSelect = (e, { result }) => {
        this.setState({ value: '' })
        this.props.whenselect(result.title)
    }

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: true, value })
        myAxios.get('/locations', {
            params: {
                keyword: value
            }
        })
            .then(response => {
                if (this.state.value.length < 1) {
                    this.setState(initialState)
                } else {
                    const res = []
                    response.data.result.forEach(element => {
                        res.push({
                            'title': element[0]
                        })
                    });
                    this.setState({
                        isLoading: false,
                        results: res
                    })
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        const { isLoading, value, results } = this.state
        return (
            <div>
                <Search
                    loading={isLoading}
                    onResultSelect={this.handleResultSelect}
                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                        leading: true,
                    })}
                    onSelectionChange={this.handleSelectionChange}
                    results={results}
                    value={value}
                    {...this.props}
                    placeholder='Select Location'
                >
                </Search>
            </div>
        )
    }
}

export default LocationSelect
import _ from 'lodash'
import React, { Component } from 'react'
import { Search, Grid } from 'semantic-ui-react'
import myAxios from '../../webServer.js'

const initialState = { isLoading: false, results: [], value: '' }

class RiderSearch extends Component {
  state = initialState

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    myAxios.get('/riders', {
        params: {
            keyword: value
        }
      })
      .then(response => {
        console.log(response);
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

  handleResultSelect = (e, { result }) => {
	this.setState({ value: ''}) 
	this.props.onSelectRider(result.title)
  }

  render() {
    const { isLoading, value, results } = this.state

    return (
      <Grid>
        <Grid.Column width={6}>
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
            placeholder='Find a rider'
          >
          </Search>
        </Grid.Column>
        <Grid.Column width={10}>
        </Grid.Column>
      </Grid>
    )
  }
}

export default RiderSearch
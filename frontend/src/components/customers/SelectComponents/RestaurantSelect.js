import _ from 'lodash'
import React, { Component } from 'react'
import { Search, Radio } from 'semantic-ui-react'
import myAxios from '../../../webServer.js'

const initialState = { isLoading: false, results: [], value: '' }

class RestaurantSelect extends Component {
    state = initialState

    handleResultSelect = (e, { result }) => {
        this.setState({ value: '' })
        if (result.title.includes("[")) {
            result.title = result.title.split("[")[1].split("]")[0]
        }
        this.props.whenselect(result.title)
    }

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: true, value })
        myAxios.post('food_and_restaurants_filtered', {
            keyword: value,
            foodCategories: this.props.foodCategories,
            check: this.props.check
        })
            .then(response => {
                console.log(response);
                if (this.state.value.length < 1) {
                    this.setState(initialState)
                } else {
                    const res = []
                    const dict = response.data.result
                    const rnames = Object.keys(dict)
                    var i = 0;
                    for (const rname of rnames) {
                        if (i >= 10) {
                            break
                        }
                        var description = ''
                        const fnames = dict[rname]
                        for (const fname of fnames) {
                            description += fname + ", "
                        }
                        description = description.replace(/(^[,\s]+)|([,\s]+$)/g, '');
                        res.push({
                            'title': rname,
                            'description': description
                        })
                        i++
                    }
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
                    }
                    )}
                    onSelectionChange={this.handleSelectionChange}
                    results={results}
                    value={value}
                    {...this.props}
                    placeholder='Select Restaurant'>
                </Search>
            </div>
        )
    }
}

export default RestaurantSelect
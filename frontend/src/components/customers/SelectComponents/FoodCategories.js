import React, { Component } from 'react'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();
const foodCategories = [
    { value: 'Mexican', label: 'Mexican', color: '#00B8D9' },
    { value: 'Italian', label: 'Italian', color: '#0052CC' },
    { value: 'American', label: 'American', color: '#5243AA' },
    { value: 'Thai', label: 'Thai', color: '#FF5630' },
    { value: 'Japanese', label: 'Japanese', color: '#FF8B00' },
    { value: 'Chinese', label: 'Chinese', color: '#FFC400' },
    { value: 'Indian', label: 'Indian', color: '#36B37E' },
    { value: 'Korean', label: 'Korean', color: '#00875A' },
    { value: 'Vietnamese', label: 'Vietnamese', color: '#253858' },
    { value: 'Indonesian', label: 'Indonesian', color: '#666666' },
    { value: 'Singaporean', label: 'Singaporean', color: '#333333' },
];

class FoodCategories extends Component {

    render() {
        return(<Select
            onChange={this.props.handleCategorySelection}
            defaultValue={foodCategories[10]}
            isMulti
            components={animatedComponents}
            name="colors"
            options={foodCategories}
            className="basic-multi-select"
            classNamePrefix="select"
        />)
    }
}

export default FoodCategories
'use strict';

import React from 'react';
// Utility to check variable types
import {isFunction, isArray} from '../util/typechecker.js';
// Internally defined icons
import Icon from './icon';

// Determines the text alignment of the component
const ALIGNMENT = {
    LEFT:       'left',
    CENTER:     'center',
    RIGHT:      'right'
};

export default React.createClass({
    /************************* COMPONENT PROPERTIES **************************/

    // The idplay name of this component
    displayName: 'Autocomplete',

    // The data types of this component's properties
    propTypes: {
        resultLimit:        React.PropTypes.number,
        inputDelay:         React.PropTypes.number,
        animationDuration:  React.PropTypes.number,
        align:              React.PropTypes.string,
        hint:               React.PropTypes.string,
        label:              React.PropTypes.string,
        dataSource:         React.PropTypes.func.isRequired,
        onChange:           React.PropTypes.func.isRequired
    },

    // The default values of this component's properties
    getDefaultProps() {
        return {
            // Denotes the maximum results in the dropdown menu
            resultLimit:        10,
            // Delay (in milliseconds) before submitting a query
            inputDelay:         400,
            // Fold-down animation duration (in milliseconds)
            animationDuration:  450,
            // The alignment of the text inside the dropdown
            align:              ALIGNMENT.LEFT,
            // The placeholder text for the text box
            hint:               'Start typing to search',
            // The label above the search box
            label:              null,
            // The datasource is the function responsible for filtering data
            dataSource:         this.defaultDataSource,
            // The change listener - fired when the value of this field changes
            onChange:           () => {},
            // The value of this field
            value:              null
        };
    },

    // The default datasource simply returns no data
    defaultDataSource(query, callback) {
        return callback('No dataSource was specified', []);
    },

    /**************************** COMPONENT STATE ****************************/

    // The timeout reference used to wait til the user finishes typing
    inputDelayTimeoutRef: null,

    // The initial values of this component's state
    getInitialState() {
        return {
            // Counters
            pendingRequestsCount:           0,      // Counts the number of data requests that have gone out already
            // Dropdown state variables
            dropdownOpen:                   false,  // Dropdown is in the DOM, but not visible
            dropdownVisible:                false,  // Dropdown is visible but not yet ready for interaction
            dropdownReady:                  false,  // Dropdown is ready for user interaction
            dropdownItems:                  [],     // Items in the dropdown
            highlightedDropdownItemIndex:   -1,     // Dropdown item currently selected by keyboard nav.
            // Search box state variables
            searchBoxFocused:               false,  // True when the user is focusing the search box
            searchBoxValue:                 '',     // The value of search box
            // General state variables
            currentlySelectedItem:          null    // The item that was most recently selected by the user
        };
    },

    /**************************** EVENT LISTENERS ****************************/

    onSearchBoxFocused() {
        this.setState({ focused: true }, () => {
            // Show the dropdown after the box is focused
            this.showDropdown();
        });
    },

    onSearchBoxBlurred() {
        this.setState({ focused: false }, () => {
            if (!this.state.inKeyboardNavigation) {
                // Hides the dropdown if the user isn't still using it
                this.hideDropdown();
            }
        });
    },

    onSearchBoxValueChanged(e) {
        this.setState({
            searchBoxValue: e.target.value,
            // When the user starts searching again, they invalidate their last selection
            currentlySelectedItem: null,
            // Reset item selected by keyboard
            highlightedDropdownItemIndex: -1
        }, () => {
            // Wait til the user finishes typing to perform a search
            clearTimeout(this.inputDelayTimeoutRef);
            this.inputDelayTimeoutRef = setTimeout(this.requestSearchResults, this.props.inputDelay);
        });
    },

    onSearchBoxKeyDown(e) {
        if (e.keyCode !== 38 /* Up arrow */ && e.keyCode !== 40 /* Down arrow */) {
            return false;
        } else {
            switch (e.keyCode) {
            case 38:
                // Up arrow
                if (this.state.highlightedDropdownItemIndex > 0) {
                    this.setState({ highlightedDropdownItemIndex: (this.state.highlightedDropdownItemIndex - 1) });
                }
                e.preventDefault();
                return true;
            case 40:
                // Down arrow
                if (this.state.highlightedDropdownItemIndex < (this.state.dropdownItems.length - 1)) {
                    this.setState({ highlightedDropdownItemIndex: (this.state.highlightedDropdownItemIndex + 1) });
                }
                e.preventDefault();
                return true;
            default:
                return false;
            }
        }
    },

    onDropdownItemsChanged(err, items) {
        if (err) {
            debugger;
            // TODO had error handling logic here
        } else {
            if (!checker.isArray(items)) {
                throw new Error('Could not update drop down items since the "items" argument is not an array');
            } else {
                // Update the items in the dropdown in end this request-response cycle
                this.setState({
                    dropdownItems: items,
                    pendingRequestsCount: (
                        this.state.pendingRequestsCount > 0 ?
                            (this.state.pendingRequestsCount - 1) :
                            0
                    )
                });
            }
        }
    },

    onDropdownItemSelected(itemId, itemName) {
        this.setState({
            currentlySelectedItem: {
                id:     itemId,
                name:   itemName
            }
        }, () => {
            // Invoke the onChange listener if its a function
            if (!checker.isFunction(this.props.onChange)) {
                throw new Error('Could not invoke the "onChange" property since it is not a function');
            } else {
                this.props.onChange(this.state.currentlySelectedItem);
            }
        });
    },

    /**************************** MEMBER FUNCTIONS ***************************/

    showDropdown() {
        // Only show the dropdown if we're not currently showing it already
        if (!self.state.dropdownOpen &&
            !self.state.dropdownVisible &&
            !self.state.dropdownReady) {
            // Staggered state changes for animation's sake
            self.setState(
                { dropdownOpen: true },
                () => {
                    setTimeout(() => {
                        this.setState(
                            { dropdownVisible: true },
                            () => {
                                setTimeout(() => {
                                    this.setState({ dropdownReady: true });
                                }, this.props.animationDuration);
                            }
                        );
                    }, 100);
                }
            );
        }
    },

    hideDropdown() {
        // Only hide the dropdown if we're not currently hiding it already
        if (self.state.dropdownOpen &&
            self.state.dropdownVisible &&
            self.state.dropdownReady) {
            // Staggered state changes for animation's sake
            self.setState(
                { dropdownReady: false, dropdownVisible: false },
                () => {
                    setTimeout(() => {
                        this.setState({ dropdownOpen: false });
                    }, this.props.animationDuration);
                }
            );
        }
    },

    requestSearchResults() {
        let query = this.state.searchBoxValue;
        // Invoke the dataSource
        if (checker.isFunction(this.props.dataSource)) {
            this.props.dataSource(query, this.processSearchResults);
        } else {
            throw new Error('Could not invoke the "dataSource" property since it is not a function');
        }
    },

    processSearchResults(err, results) {
        if (err) {
            // TODO add error visibility to component
            debugger;
        } else if (!checker.isArray(results)) {
            throw new Error('Could not process "results" from "dataSource" callback since it is not an array');
        } else {
            let scrubbedResults = result.filter((result) => {
                if (!result) {
                    return false;
                } else if (result.id === undefined ||
                           result.id === null ||
                           result.id === NaN) {
                    console.warn('Autocomplete could not process element of "results" since it didn\'t have a "id" property:', result);
                    return false;
                } else if (result.name === undefined ||
                           result.name === null ||
                           result.name === NaN) {
                    console.warn('Autocomplete could not process element of "results" since it didn\'t have a "name" property:', result);
                    return false;
                } else {
                    return true;
                }
            });
            this.onDropdownItemsChanged(scrubbedResults);
        }
    },

    /**************************** RENDER FUNCTIONS ***************************/

    componentClassNames() {
        let classNames = ['alloy-autocomplete'];
        // Searchbox
        if (this.state.searchBoxFocused)            classNames.push('alloy-focused');
        if (this.state.pendingRequestsCount > 0)    classNames.push('alloy-loading');
        if (this.state.currentlySelectedItem)       classNames.push('alloy-has-value');
        if (this.state.searchBoxValue)              classNames.push('alloy-has-query');
        // Dropdown
        if (this.state.dropdownOpen)                classNames.push('alloy-dropdown-open');
        if (this.state.dropdownVisible)             classNames.push('alloy-dropdown-visible');
        // Alignment
        switch (this.props.align) {
        case ALIGNMENT.CENTER:
            classNames.push('alloy-align-center');
        case ALIGNMENT.RIGHT:
            classNames.push('alloy-align-right');
        default:
            classNames.push('alloy-align-left');
        }

        return classNames.join(' ');
    },

    render() {
        let self = this, dropdownContent;
        if (this.state.dropdownItems.length > 0) {
            dropdownContent = this.state.dropdownItems.map((item, index) => {
                let itemClassName = 'alloy-dropdown-item';
                if (index === this.state.highlightedDropdownItemIndex) {
                    itemClassName = itemClassName + ' alloy-highlighted';
                }

                return (
                    <div
                        className={itemClassName}
                        key={item.id}
                        onClick={self.onDropdownItemSelected.bind(self, item.id, item.name)}>
                        <div>{item.name}</div>
                    </div>
                );
            });
        } else {
            if (!this.state.searchBoxValue || this.state.searchBoxValue.length < 1) {
                dropdownContent = (
                    <div className="alloy-dropdown-empty">
                        Start typing above to search.
                    </div>
                );
            } else {
                dropdownContent = (
                    <div className="alloy-dropdown-not-found">
                        No results found.
                    </div>
                );
            }
        }

        return (
            <div className={componentClassNames()}>
                <div className="alloy-dropdown">
                    <div className="alloy-dropdown-content">
                        {dropdownContent}
                    </div>
                </div>
                <div className="alloy-search-box">
                    <div className="alloy-hint">{this.props.hint}</div>
                    <Icon type="search" className="alloy-search-icon"/>
                    <Icon type="spinner" className="alloy-loading-indicator"/>
                    <input type="text"
                        value={this.state.searchBoxValue}
                        onFocus={this.onSearchBoxFocused}
                        onBlur={this.onSearchBoxBlurred}
                        onChange={this.onSearchBoxValueChanged} />
                    <div className="alloy-underline"/>
                    <div className="alloy-focus-underline"/>
                </div>
            </div>
        );
    }
});
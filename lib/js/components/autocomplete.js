'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

// Utility to check variable types

var _utilTypecheckerJs = require('../util/typechecker.js');

// Internally defined icons

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

// Determines the text alignment of the component
var ALIGNMENT = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right'
};

exports['default'] = _react2['default'].createClass({
    /************************* COMPONENT PROPERTIES **************************/

    // The idplay name of this component
    displayName: 'Autocomplete',

    // The data types of this component's properties
    propTypes: {
        resultLimit: _react2['default'].PropTypes.number,
        inputDelay: _react2['default'].PropTypes.number,
        animationDuration: _react2['default'].PropTypes.number,
        align: _react2['default'].PropTypes.string,
        hint: _react2['default'].PropTypes.string,
        label: _react2['default'].PropTypes.string,
        dataSource: _react2['default'].PropTypes.func.isRequired,
        onChange: _react2['default'].PropTypes.func.isRequired
    },

    // The default values of this component's properties
    getDefaultProps: function getDefaultProps() {
        return {
            // Denotes the maximum results in the dropdown menu
            resultLimit: 10,
            // Delay (in milliseconds) before submitting a query
            inputDelay: 400,
            // Fold-down animation duration (in milliseconds)
            animationDuration: 450,
            // The alignment of the text inside the dropdown
            align: ALIGNMENT.LEFT,
            // The placeholder text for the text box
            hint: 'Start typing to search',
            // The label above the search box
            label: null,
            // The datasource is the function responsible for filtering data
            dataSource: this.defaultDataSource,
            // The change listener - fired when the value of this field changes
            onChange: function onChange() {},
            // The value of this field
            value: null
        };
    },

    // The default datasource simply returns no data
    defaultDataSource: function defaultDataSource(query, callback) {
        return callback('No dataSource was specified', []);
    },

    /**************************** COMPONENT STATE ****************************/

    // The timeout reference used to wait til the user finishes typing
    inputDelayTimeoutRef: null,

    // The initial values of this component's state
    getInitialState: function getInitialState() {
        return {
            // Counters
            pendingRequestsCount: 0, // Counts the number of data requests that have gone out already
            // Dropdown state variables
            dropdownOpen: false, // Dropdown is in the DOM, but not visible
            dropdownVisible: false, // Dropdown is visible but not yet ready for interaction
            dropdownReady: false, // Dropdown is ready for user interaction
            dropdownItems: [], // Items in the dropdown
            highlightedDropdownItemIndex: -1, // Dropdown item currently selected by keyboard nav.
            // Search box state variables
            searchBoxFocused: false, // True when the user is focusing the search box
            searchBoxValue: '', // The value of search box
            // General state variables
            currentlySelectedItem: null // The item that was most recently selected by the user
        };
    },

    /**************************** EVENT LISTENERS ****************************/

    onSearchBoxFocused: function onSearchBoxFocused() {
        var _this = this;

        this.setState({ focused: true }, function () {
            // Show the dropdown after the box is focused
            _this.showDropdown();
        });
    },

    onSearchBoxBlurred: function onSearchBoxBlurred() {
        var _this2 = this;

        this.setState({ focused: false }, function () {
            if (!_this2.state.inKeyboardNavigation) {
                // Hides the dropdown if the user isn't still using it
                _this2.hideDropdown();
            }
        });
    },

    onSearchBoxValueChanged: function onSearchBoxValueChanged(e) {
        var _this3 = this;

        this.setState({
            searchBoxValue: e.target.value,
            // When the user starts searching again, they invalidate their last selection
            currentlySelectedItem: null,
            // Reset item selected by keyboard
            highlightedDropdownItemIndex: -1
        }, function () {
            // Wait til the user finishes typing to perform a search
            clearTimeout(_this3.inputDelayTimeoutRef);
            _this3.inputDelayTimeoutRef = setTimeout(_this3.requestSearchResults, _this3.props.inputDelay);
        });
    },

    onSearchBoxKeyDown: function onSearchBoxKeyDown(e) {
        if (e.keyCode !== 38 /* Up arrow */ && e.keyCode !== 40 /* Down arrow */) {
            return false;
        } else {
            switch (e.keyCode) {
                case 38:
                    // Up arrow
                    if (this.state.highlightedDropdownItemIndex > 0) {
                        this.setState({ highlightedDropdownItemIndex: this.state.highlightedDropdownItemIndex - 1 });
                    }
                    e.preventDefault();
                    return true;
                case 40:
                    // Down arrow
                    if (this.state.highlightedDropdownItemIndex < this.state.dropdownItems.length - 1) {
                        this.setState({ highlightedDropdownItemIndex: this.state.highlightedDropdownItemIndex + 1 });
                    }
                    e.preventDefault();
                    return true;
                default:
                    return false;
            }
        }
    },

    onDropdownItemsChanged: function onDropdownItemsChanged(err, items) {
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
                    pendingRequestsCount: this.state.pendingRequestsCount > 0 ? this.state.pendingRequestsCount - 1 : 0
                });
            }
        }
    },

    onDropdownItemSelected: function onDropdownItemSelected(itemId, itemName) {
        var _this4 = this;

        this.setState({
            currentlySelectedItem: {
                id: itemId,
                name: itemName
            }
        }, function () {
            // Invoke the onChange listener if its a function
            if (!checker.isFunction(_this4.props.onChange)) {
                throw new Error('Could not invoke the "onChange" property since it is not a function');
            } else {
                _this4.props.onChange(_this4.state.currentlySelectedItem);
            }
        });
    },

    /**************************** MEMBER FUNCTIONS ***************************/

    showDropdown: function showDropdown() {
        var _this5 = this;

        // Only show the dropdown if we're not currently showing it already
        if (!self.state.dropdownOpen && !self.state.dropdownVisible && !self.state.dropdownReady) {
            // Staggered state changes for animation's sake
            self.setState({ dropdownOpen: true }, function () {
                setTimeout(function () {
                    _this5.setState({ dropdownVisible: true }, function () {
                        setTimeout(function () {
                            _this5.setState({ dropdownReady: true });
                        }, _this5.props.animationDuration);
                    });
                }, 100);
            });
        }
    },

    hideDropdown: function hideDropdown() {
        var _this6 = this;

        // Only hide the dropdown if we're not currently hiding it already
        if (self.state.dropdownOpen && self.state.dropdownVisible && self.state.dropdownReady) {
            // Staggered state changes for animation's sake
            self.setState({ dropdownReady: false, dropdownVisible: false }, function () {
                setTimeout(function () {
                    _this6.setState({ dropdownOpen: false });
                }, _this6.props.animationDuration);
            });
        }
    },

    requestSearchResults: function requestSearchResults() {
        var query = this.state.searchBoxValue;
        // Invoke the dataSource
        if (checker.isFunction(this.props.dataSource)) {
            this.props.dataSource(query, this.processSearchResults);
        } else {
            throw new Error('Could not invoke the "dataSource" property since it is not a function');
        }
    },

    processSearchResults: function processSearchResults(err, results) {
        if (err) {
            // TODO add error visibility to component
            debugger;
        } else if (!checker.isArray(results)) {
            throw new Error('Could not process "results" from "dataSource" callback since it is not an array');
        } else {
            var scrubbedResults = result.filter(function (result) {
                if (!result) {
                    return false;
                } else if (result.id === undefined || result.id === null || result.id === NaN) {
                    console.warn('Autocomplete could not process element of "results" since it didn\'t have a "id" property:', result);
                    return false;
                } else if (result.name === undefined || result.name === null || result.name === NaN) {
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

    componentClassNames: function componentClassNames() {
        var classNames = ['alloy-autocomplete'];
        // Searchbox
        if (this.state.searchBoxFocused) classNames.push('alloy-focused');
        if (this.state.pendingRequestsCount > 0) classNames.push('alloy-loading');
        if (this.state.currentlySelectedItem) classNames.push('alloy-has-value');
        if (this.state.searchBoxValue) classNames.push('alloy-has-query');
        // Dropdown
        if (this.state.dropdownOpen) classNames.push('alloy-dropdown-open');
        if (this.state.dropdownVisible) classNames.push('alloy-dropdown-visible');
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

    render: function render() {
        var _this7 = this;

        var self = this,
            dropdownContent = undefined;
        if (this.state.dropdownItems.length > 0) {
            dropdownContent = this.state.dropdownItems.map(function (item, index) {
                var itemClassName = 'alloy-dropdown-item';
                if (index === _this7.state.highlightedDropdownItemIndex) {
                    itemClassName = itemClassName + ' alloy-highlighted';
                }

                return _react2['default'].createElement(
                    'div',
                    {
                        className: itemClassName,
                        key: item.id,
                        onClick: self.onDropdownItemSelected.bind(self, item.id, item.name) },
                    _react2['default'].createElement(
                        'div',
                        null,
                        item.name
                    )
                );
            });
        } else {
            if (!this.state.searchBoxValue || this.state.searchBoxValue.length < 1) {
                dropdownContent = _react2['default'].createElement(
                    'div',
                    { className: 'alloy-dropdown-empty' },
                    'Start typing above to search.'
                );
            } else {
                dropdownContent = _react2['default'].createElement(
                    'div',
                    { className: 'alloy-dropdown-not-found' },
                    'No results found.'
                );
            }
        }

        return _react2['default'].createElement(
            'div',
            { className: componentClassNames() },
            _react2['default'].createElement(
                'div',
                { className: 'alloy-dropdown' },
                _react2['default'].createElement(
                    'div',
                    { className: 'alloy-dropdown-content' },
                    dropdownContent
                )
            ),
            _react2['default'].createElement(
                'div',
                { className: 'alloy-search-box' },
                _react2['default'].createElement(
                    'div',
                    { className: 'alloy-hint' },
                    this.props.hint
                ),
                _react2['default'].createElement(_icon2['default'], { type: 'search', className: 'alloy-search-icon' }),
                _react2['default'].createElement(_icon2['default'], { type: 'spinner', className: 'alloy-loading-indicator' }),
                _react2['default'].createElement('input', { type: 'text',
                    value: this.state.searchBoxValue,
                    onFocus: this.onSearchBoxFocused,
                    onBlur: this.onSearchBoxBlurred,
                    onChange: this.onSearchBoxValueChanged }),
                _react2['default'].createElement('div', { className: 'alloy-underline' }),
                _react2['default'].createElement('div', { className: 'alloy-focus-underline' })
            )
        );
    }
});
module.exports = exports['default'];
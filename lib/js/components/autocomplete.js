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

// Menu for showing results

var _dropdown = require('./dropdown');

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
            hint: null,
            // The label above the search box
            label: null,
            // The datasource is the function responsible for filtering data
            dataSource: this.defaultDataSource,
            // The change listener - fired when the value of this field changes
            onChange: function onChange() {},
            // The value of this field
            value: null,
            // The most results to show in the dropdown
            maxDropdownItems: 5
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
            // Search box state variables
            searchBoxFocused: false, // True when the user is focusing the search box
            searchBoxValue: '', // The value of search box
            // Field value state variables
            currentlySelectedItem: null, // The item that was most recently selected by the user
            currentlyHighlightedItem: null, // The id-name-pair of the item that is currently highlighted
            // Error related state varibales
            dataSourceError: null
        };
    },

    /**************************** EVENT LISTENERS ****************************/

    onSearchBoxFocused: function onSearchBoxFocused() {
        var _this = this;

        this.setState({ searchBoxFocused: true }, function () {
            // Show the dropdown after the box is focused
            _this.showDropdown();
            // Disable the autoselection on tab
            setTimeout(function () {
                var el = _react2['default'].findDOMNode(_this.refs.searchBoxInput);
                // Moves cursor to the end of the input
                el.selectionStart = el.selectionEnd;
            }, 10);
        });
    },

    onSearchBoxBlurred: function onSearchBoxBlurred() {
        var _this2 = this;

        this.setState({ searchBoxFocused: false }, function () {
            // Hides the dropdown after the box is unfocused
            _this2.hideDropdown();
        });
    },

    onSearchBoxValueChanged: function onSearchBoxValueChanged(e) {
        var _this3 = this;

        this.setState({
            searchBoxValue: e.target.value,
            // When the user starts searching again, they invalidate their last selection
            currentlySelectedItem: null
        }, function () {
            // Wait til the user finishes typing to perform a search
            clearTimeout(_this3.inputDelayTimeoutRef);
            _this3.inputDelayTimeoutRef = setTimeout(_this3.requestSearchResults, _this3.props.inputDelay);
        });
    },

    onSearchBoxKeyDown: function onSearchBoxKeyDown(e) {
        if (e.keyCode !== 38 /* Up arrow */ && e.keyCode !== 40 /* Down arrow */ && e.keyCode !== 13 /* Enter key */) {
            return;
        } else {
            // Disable browser defaults
            e.preventDefault();
            // Figure out how to behave
            switch (e.keyCode) {
                case 38:
                    // Up arrow
                    this.highlightPreviousItem();
                    e.preventDefault();
                    return;
                case 40:
                    // Down arrow
                    this.highlightNextItem();
                    e.preventDefault();
                    return;
                case 13:
                    // Enter key
                    if (this.state.currentlyHighlightedItem) {
                        // Enter effectively acts as a submit
                        var _state$currentlyHighlightedItem = this.state.currentlyHighlightedItem;
                        var id = _state$currentlyHighlightedItem.id;
                        var _name = _state$currentlyHighlightedItem.name;

                        this.onDropdownItemSelected(id, _name, true);
                    }
                    return;
            }
        }
    },

    onDropdownItemsChanged: function onDropdownItemsChanged(items) {
        if (!(0, _utilTypecheckerJs.isArray)(items)) {
            throw new Error('Could not update drop down items since the "items" argument is not an array');
        } else {
            // Update the items in the dropdown in end this request-response cycle
            this.setState({
                dataSourceError: null,
                dropdownItems: items,
                pendingRequestsCount:
                // Only decrement pending requests number if its natural
                this.state.pendingRequestsCount > 0 ? this.state.pendingRequestsCount - 1 : 0
            });
        }
    },

    onDropdownItemMouseEnter: function onDropdownItemMouseEnter(itemId, itemName) {
        this.setState({
            currentlyHighlightedItem: {
                id: itemId,
                name: itemName
            }
        });
    },

    onDropdownItemMouseLeave: function onDropdownItemMouseLeave(itemId, itemName) {
        this.setState({
            currentlyHighlightedItem: null
        });
    },

    onDropdownItemSelected: function onDropdownItemSelected(itemId, itemName, throughKeyboard) {
        var _this4 = this;

        this.setState({
            currentlySelectedItem: {
                id: itemId,
                name: itemName
            },
            searchBoxValue: itemName
        }, function () {
            // We have to blur the input if selected through keyboard
            if (throughKeyboard) {
                _react2['default'].findDOMNode(_this4.refs.searchBoxInput).blur();
            }
            // Invoke the onChange listener if its a function
            if (!(0, _utilTypecheckerJs.isFunction)(_this4.props.onChange)) {
                throw new Error('Could not invoke the "onChange" property since it is not a function');
            } else {
                _this4.props.onChange(_this4.state.currentlySelectedItem);
            }
        });
    },

    /**************************** MEMBER FUNCTIONS ***************************/

    highlightNextItem: function highlightNextItem() {
        if (!this.state.currentlyHighlightedItem) {
            // Highlight the next dropdown item if nothing is selected yet
            if (this.state.dropdownItems.length > 0) {
                this.setState({ currentlyHighlightedItem: this.state.dropdownItems[0] });
            }
        } else {
            var curr = undefined;
            for (var i = 0; i < this.state.dropdownItems.length; i++) {
                curr = this.state.dropdownItems[i];
                // Perform check
                if (this.state.currentlyHighlightedItem.id === curr.id) {
                    // If there is no "next" do nothing
                    if (i < this.state.dropdownItems.length - 1) {
                        // Highlight the next item in state
                        this.setState({ currentlyHighlightedItem: this.state.dropdownItems[i + 1] });
                    }
                }
            }
        }
    },

    highlightPreviousItem: function highlightPreviousItem() {
        if (this.state.currentlyHighlightedItem) {
            // Only highlight the previous if there is one highlighted already
            var prev = undefined,
                curr = undefined;
            for (var i = 0; i < this.state.dropdownItems.length; i++) {
                prev = curr;
                curr = this.state.dropdownItems[i];
                // Perform check
                if (this.state.currentlyHighlightedItem.id === curr.id) {
                    // If there is no prev, do nothing
                    if (prev) {
                        // Highlight the previous item in state
                        this.setState({ currentlyHighlightedItem: prev });
                    }
                }
            }
        }
    },

    showDropdown: function showDropdown() {
        var _this5 = this;

        // Only show the dropdown if we're not currently showing it already
        if (!this.state.dropdownOpen && !this.state.dropdownVisible && !this.state.dropdownReady) {
            // Staggered state changes for animation's sake
            this.setState({ dropdownOpen: true }, function () {
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
        if (this.state.dropdownOpen && this.state.dropdownVisible && this.state.dropdownReady) {
            // Staggered state changes for animation's sake
            this.setState({ dropdownReady: false, dropdownVisible: false }, function () {
                setTimeout(function () {
                    _this6.setState({ dropdownOpen: false });
                }, _this6.props.animationDuration);
            });
        }
    },

    requestSearchResults: function requestSearchResults() {
        var _this7 = this;

        var query = this.state.searchBoxValue;
        // Invoke the dataSource
        if ((0, _utilTypecheckerJs.isFunction)(this.props.dataSource)) {
            this.setState({
                pendingRequestsCount: this.state.pendingRequestsCount + 1
            }, function () {
                _this7.props.dataSource(query, _this7.processSearchResults);
            });
        } else {
            throw new Error('Could not invoke the "dataSource" property since it is not a function');
        }
    },

    processSearchResults: function processSearchResults(err, results) {
        if (err) {
            this.setState({
                dataSourceError: err,
                pendingRequestsCount:
                // Only decrement pending requests number if its natural
                this.state.pendingRequestsCount > 0 ? this.state.pendingRequestsCount - 1 : 0
            });
        } else if (!(0, _utilTypecheckerJs.isArray)(results)) {
            throw new Error('Could not process "results" from "dataSource" callback since it is not an array');
        } else {
            var scrubbedResults = results.filter(function (result) {
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

    autocompleteClassNames: function autocompleteClassNames() {
        var classNames = ['alloy-autocomplete'];
        // Searchbox
        if (this.state.searchBoxFocused) classNames.push('alloy-focused');
        if (this.state.pendingRequestsCount > 0) classNames.push('alloy-loading');
        if (this.state.currentlySelectedItem) classNames.push('alloy-has-value');
        if (this.state.searchBoxValue) classNames.push('alloy-has-query');
        if ((0, _utilTypecheckerJs.isString)(this.state.dataSourceError)) classNames.push('alloy-has-error');
        if ((0, _utilTypecheckerJs.isString)(this.props.label) && !(0, _utilTypecheckerJs.isEmpty)(this.props.label)) classNames.push('alloy-has-label');
        if ((0, _utilTypecheckerJs.isString)(this.props.hint) && !(0, _utilTypecheckerJs.isEmpty)(this.props.hint)) classNames.push('alloy-has-hint');
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
        var _this8 = this;

        // The options in the dropdown
        var dropdownItems = this.state.dropdownItems.filter(function (_, i) {
            return i < _this8.props.maxDropdownItems;
        }).map(function (item) {
            var isSelected = _this8.state.currentlySelectedItem && _this8.state.currentlySelectedItem.id === item.id;
            var isHighlighted = _this8.state.currentlyHighlightedItem && _this8.state.currentlyHighlightedItem.id === item.id;

            return _react2['default'].createElement(_dropdown.DropdownItem, {
                id: item.id,
                key: item.id,
                name: item.name,
                selected: isSelected,
                highlighted: isHighlighted,
                onMouseEnter: _this8.onDropdownItemMouseEnter,
                onMouseLeave: _this8.onDropdownItemMouseLeave,
                onClick: _this8.onDropdownItemSelected });
        });

        return _react2['default'].createElement(
            'div',
            { className: this.autocompleteClassNames() },
            _react2['default'].createElement(
                _dropdown.Dropdown,
                {
                    error: this.state.dataSourceError,
                    mounted: this.state.dropdownOpen,
                    visible: this.state.dropdownVisible },
                dropdownItems
            ),
            _react2['default'].createElement(
                'div',
                { className: 'alloy-search-box' },
                _react2['default'].createElement(
                    'label',
                    null,
                    this.props.label
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'alloy-hint' },
                    this.props.hint
                ),
                _react2['default'].createElement(_icon2['default'], {
                    type: 'search',
                    className: 'alloy-search-icon',
                    size: 17,
                    style: { marginTop: '2px', marginRight: '-2px' } }),
                _react2['default'].createElement(_icon2['default'], { type: 'spinner', className: 'alloy-loading-indicator', size: 20 }),
                _react2['default'].createElement('input', { type: 'text',
                    ref: 'searchBoxInput',
                    value: this.state.searchBoxValue,
                    onFocus: this.onSearchBoxFocused,
                    onBlur: this.onSearchBoxBlurred,
                    onChange: this.onSearchBoxValueChanged,
                    onKeyDown: this.onSearchBoxKeyDown }),
                _react2['default'].createElement('div', { className: 'alloy-underline' }),
                _react2['default'].createElement('div', { className: 'alloy-focus-underline' })
            )
        );
    }
});
module.exports = exports['default'];
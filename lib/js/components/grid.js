'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _materialUi = require('material-ui');

var _frameworkComponentsRxComponentJs = require('framework/components/rx-component.js');

var _frameworkComponentsRxComponentJs2 = _interopRequireDefault(_frameworkComponentsRxComponentJs);

var DEFAULT_COLUMN_WIDTH = 125;
var CHECKBOX_COLUMN_WIDTH = 50;
var DEFAULT_ENTRY_KEY_NAME = 'id';

var Column = (function (_React$Component) {
    function Column() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        _classCallCheck(this, Column);

        _get(Object.getPrototypeOf(Column.prototype), 'constructor', this).apply(this, args);
        // Default props
        this.props = {
            id: null,
            title: null,
            weight: 0,
            width: 0
        };
    }

    _inherits(Column, _React$Component);

    return Column;
})(_react2['default'].Component);

exports.Column = Column;

Column.propTypes = {
    id: _react2['default'].PropTypes.string.isRequired, // Maps to a field of entries in the grid
    title: _react2['default'].PropTypes.string, // The string put in the column header
    weight: _react2['default'].PropTypes.number, // How wide this column is compared to others
    width: _react2['default'].PropTypes.number // How wide this column is in pixels - takes precedence over 'weight'
};

var BaseGrid = (function (_RxComponent) {
    function BaseGrid() {
        var _this = this;

        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        _classCallCheck(this, BaseGrid);

        _get(Object.getPrototypeOf(BaseGrid.prototype), 'constructor', this).apply(this, args);
        // Bind member functions
        this.width = this.width.bind(this);
        this.columns = this.columns.bind(this);
        this.sizeColumns = this.sizeColumns.bind(this);
        this.entriesToRows = this.entriesToRows.bind(this);
        this.columnHeaders = this.columnHeaders.bind(this);
        // Default props
        this.props = { onAddClicked: function onAddClicked() {} };
        // Listeners
        this.addClicked = this.generate.listener();
        // Behaviors
        this.addClicked.subscribe(function () {
            if (_underscore2['default'].isFunction(_this.props.onAddClicked)) {
                _this.props.onAddClicked();
            }
        });
        // Setup component width logic
        this.lifecycle.componentDidMount.subscribe(function () {
            // Calculate initial width
            _this.setState({
                width: _this.width()
            });
        });
    }

    _inherits(BaseGrid, _RxComponent);

    _createClass(BaseGrid, [{
        key: 'width',
        value: function width() {
            return _react2['default'].findDOMNode(this).offsetWidth;
        }
    }, {
        key: 'columns',
        value: function columns() {
            var columns = [];
            // Iterate through children
            _react2['default'].Children.forEach(this.props.children, function (_ref) {
                var type = _ref.type;
                var props = _ref.props;

                if (type === Column) {
                    if (_underscore2['default'].isString(props.id)) {
                        var title = undefined,
                            weight = undefined,
                            width = undefined;
                        // Set column title
                        if (_underscore2['default'].isString(props.title)) {
                            title = props.title;
                        } else {
                            // TODO refine column id -> column title mapping
                            title = props.id.charAt(0).toUpperCase() + props.id.slice(1);
                        }
                        // Set column weight
                        if (_underscore2['default'].isNumber(props.weight)) {
                            weight = props.weight;
                        } else {
                            // Weight defaults to 0 - meaning this column doesn't scale
                            weight = 0;
                        }
                        // Set column width
                        if (_underscore2['default'].isNumber(props.width)) {
                            width = props.width;
                        } else {
                            // Width defaults to 0 - meaning this column has no fixed minimum size
                            width = 0;
                        }
                        // Append to columns list
                        columns.push({
                            id: props.id,
                            title: title,
                            weight: weight,
                            width: width,
                            actualWidth: 0
                        });
                    } else {
                        console.warn('Grid column with id', props.id, 'was an invalid string');
                    }
                }
            });
            // Return the column array
            return columns;
        }
    }, {
        key: 'sizeColumns',
        value: function sizeColumns(gridWidth, columns) {
            if (!_underscore2['default'].isNumber(gridWidth)) throw new Error('Provided gridWidth parameter was not an array');
            if (!_underscore2['default'].isArray(columns)) throw new Error('Provided columns parameter was not an array');

            var totalWeight = 0;
            var remainingWidth = gridWidth;
            var i = undefined,
                column = undefined;
            // Allowance for checkbox column
            if (!this.props.checkboxColumnHidden) {
                remainingWidth -= CHECKBOX_COLUMN_WIDTH;
            }
            // Subtract away fixed widths
            for (i = 0; i < columns.length; i++) {
                column = columns[i];
                totalWeight += column.weight;
                remainingWidth -= column.width;
            }
            // Scale columns to remaining space according to weight
            var weightUnit = 0;
            if (remainingWidth > 0) {
                weightUnit = remainingWidth / totalWeight;
            }
            for (i = 0; i < columns.length; i++) {
                column = columns[i];
                column.actualWidth = column.width + weightUnit * column.weight;
            }
        }
    }, {
        key: 'entriesToRows',
        value: function entriesToRows(entries, columns, entryKeyName) {
            var _this2 = this;

            if (!_underscore2['default'].isArray(entries)) throw new Error('Provided entries parameter was not an array');
            if (!_underscore2['default'].isArray(columns)) throw new Error('Provided columns parameter was not an array');
            if (!_underscore2['default'].isString(entryKeyName)) {
                // If there is no entryKeyName, assume it is the default
                entryKeyName = DEFAULT_ENTRY_KEY_NAME;
            }
            // Compose array of rows
            var rows = entries.map(function (entry) {
                var cells = [],
                    entryKey = entry[entryKeyName];
                if (entryKey !== undefined && entryKey !== null) {
                    var i = undefined,
                        column = undefined;
                    // Add checkbox cell
                    if (!_this2.props.checkboxColumnHidden) {
                        cells.push(_react2['default'].createElement(
                            'div',
                            {
                                className: 'grid-row-checkbox',
                                key: 'checkbox' + entryKey,
                                style: { width: CHECKBOX_COLUMN_WIDTH + 'px' } },
                            _react2['default'].createElement(_materialUi.Checkbox, null)
                        ));
                    }
                    // Create a cell element for every column
                    for (i = 0; i < columns.length; i++) {
                        column = columns[i];
                        cells.push(_react2['default'].createElement(
                            'div',
                            {
                                className: 'grid-cell',
                                key: entryKey + '-' + column.id,
                                style: { width: column.actualWidth + 'px' } },
                            entry[column.id]
                        ));
                    }
                    // Create the row element
                    return _react2['default'].createElement(
                        'div',
                        {
                            className: 'grid-row',
                            key: entryKey },
                        cells
                    );
                } else {
                    console.warn('An entry key was null or undefined:', entry);
                }
            });
            // Return empty if there are no rows
            if (rows.length < 1) {
                return _react2['default'].createElement(
                    'div',
                    { className: 'grid-empty' },
                    'There are currently no entries of data to show. ',
                    _react2['default'].createElement('br', null),
                    'Click the ',
                    _react2['default'].createElement(
                        'b',
                        null,
                        '+'
                    ),
                    ' button to add new enties.'
                );
            } else {
                return rows;
            }
        }
    }, {
        key: 'columnHeaders',
        value: function columnHeaders(columns) {
            if (!_underscore2['default'].isArray(columns)) throw new Error('Provided columns parameter was not an array');

            var headers = columns.map(function (column) {
                return _react2['default'].createElement(
                    'div',
                    {
                        className: 'grid-column-header',
                        key: column.id,
                        style: { width: column.actualWidth + 'px' } },
                    _react2['default'].createElement(
                        'span',
                        { className: 'title' },
                        column.title
                    ),
                    _react2['default'].createElement('div', { className: 'separator' })
                );
            });
            // Add checkbox header
            if (!this.props.checkboxColumnHidden) {
                headers.unshift(_react2['default'].createElement(
                    'div',
                    {
                        className: 'grid-header-checkbox',
                        key: 'header-checkbox',
                        style: { width: CHECKBOX_COLUMN_WIDTH + 'px' } },
                    _react2['default'].createElement(_materialUi.Checkbox, null)
                ));
            }

            return headers;
        }
    }, {
        key: 'actionButtons',
        value: function actionButtons() {
            return _react2['default'].createElement(
                'div',
                { className: 'grid-action-buttons' },
                _react2['default'].createElement(_materialUi.FloatingActionButton, { className: 'secondary', disabled: true, iconClassName: 'md md-delete', mini: true, secondary: true }),
                _react2['default'].createElement(_materialUi.FloatingActionButton, { className: 'secondary', disabled: true, iconClassName: 'md md-edit', mini: true, secondary: true }),
                _react2['default'].createElement(_materialUi.FloatingActionButton, { iconClassName: 'md md-add', primary: true, onClick: this.addClicked })
            );
        }
    }]);

    return BaseGrid;
})(_frameworkComponentsRxComponentJs2['default']);

var Grid = (function (_BaseGrid) {
    function Grid() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        _classCallCheck(this, Grid);

        _get(Object.getPrototypeOf(Grid.prototype), 'constructor', this).apply(this, args);
        // Initial state
        this.state = {
            width: 0
        };
        // Default props
        this.props = {
            data: [],
            entryKeyName: DEFAULT_ENTRY_KEY_NAME
        };
        // Define this component's behaviors
        this.behavior.call(this);
        // Bind functions
        this.render = this.render.bind(this);
    }

    _inherits(Grid, _BaseGrid);

    _createClass(Grid, [{
        key: 'behavior',
        value: function behavior() {}
    }, {
        key: 'render',
        value: function render() {
            if (this.state.width === 0 || this.state.width === undefined || this.state.width === null) {
                // If we have no width, there's no sense in painting
                return _react2['default'].createElement('div', { className: 'grid' });
            }
            // Figure out what column we're rendering
            var columns = this.columns();
            // Size our columns
            this.sizeColumns(this.state.width, columns);
            // Get the rows that we're painting
            var rows = this.entriesToRows(this.props.data, columns, this.props.entryKeyName);
            // Create the column headers
            var columnHeaders = this.columnHeaders(columns);
            // Make the action buttons that we needs
            var actionButtons = this.actionButtons();
            // Paint the grid
            return _react2['default'].createElement(
                'div',
                { className: 'grid' },
                _react2['default'].createElement(
                    'div',
                    { className: 'grid-header' },
                    columnHeaders
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'grid-body' },
                    rows
                ),
                actionButtons
            );
        }
    }]);

    return Grid;
})(BaseGrid);

exports.Grid = Grid;

Grid.propTypes = {
    // Array of entry objects that are listed in the grid
    data: _react2['default'].PropTypes.array.isRequired,
    // The name of the unique field of all entries
    entryKeyName: _react2['default'].PropTypes.string
};
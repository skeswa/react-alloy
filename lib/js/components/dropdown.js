'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _utilTypechecker = require('util/typechecker');

var DropdownItem = _react2['default'].createClass({
    displayName: 'DropdownItem',

    getDefaultProps: function getDefaultProps() {
        return {
            id: 'Unknown',
            name: 'Unknown',
            selected: false,
            highlighted: false,
            onClick: function onClick() {},
            onMouseEnter: function onMouseEnter() {},
            onMouseLeave: function onMouseLeave() {}
        };
    },

    classNames: function classNames() {
        var classNames = ['alloy-dropdown-item'];

        if (this.props.selected) classNames.push('alloy-selected');
        if (this.props.highlighted) classNames.push('alloy-highlighted');

        return classNames.join(' ');
    },

    invoke: function invoke(fn) {
        if (fn) {
            fn(this.props.id, this.props.name);
        }
    },

    render: function render() {
        return _react2['default'].createElement(
            'div',
            {
                className: this.classNames(),
                onClick: this.invoke.bind(this, this.props.onClick),
                onMouseEnter: this.invoke.bind(this, this.props.onMouseEnter),
                onMouseLeave: this.invoke.bind(this, this.props.onMouseLeave) },
            _react2['default'].createElement(
                'div',
                null,
                this.props.name
            )
        );
    }
});

exports.DropdownItem = DropdownItem;
var Dropdown = _react2['default'].createClass({
    displayName: 'Dropdown',

    getDefaultProps: function getDefaultProps() {
        return {
            error: null,
            mounted: false,
            visible: false
        };
    },

    classNames: function classNames() {
        var classes = ['alloy-dropdown'];
        // Dropdown
        if (this.props.mounted) classes.push('alloy-mounted');
        if (this.props.visible) classes.push('alloy-visible');

        return classes.join(' ');
    },

    render: function render() {
        var content = undefined;
        if ((0, _utilTypechecker.isString)(this.props.error)) {
            content = _react2['default'].createElement(
                'div',
                { className: 'alloy-error' },
                this.props.error
            );
        } else if (this.props.children.length > 0) {
            content = this.props.children;
        } else {
            content = _react2['default'].createElement(
                'div',
                { className: 'alloy-empty' },
                'No results to show.'
            );
        }

        return _react2['default'].createElement(
            'div',
            { className: this.classNames() },
            _react2['default'].createElement(
                'div',
                null,
                content
            )
        );
    }
});
exports.Dropdown = Dropdown;
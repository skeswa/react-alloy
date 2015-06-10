'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var SVGs = {
    // Loading spinner
    spinner: function spinner(size, fill) {
        if (!size) size = 40;
        if (!fill) fill = '#00796b';
        var paddedSize = size + 10;
        var halfPaddedSize = Math.floor(paddedSize / 2);
        var sizePx = size + 'px';

        return _react2['default'].createElement(
            'svg',
            {
                version: '1.1',
                x: '0px',
                y: '0px',
                width: sizePx,
                height: sizePx,
                viewBox: '0 0' + paddedSize + ' ' + paddedSize,
                style: { enableBackground: 'new 0 0' + paddedSize + ' ' + paddedSize } },
            _react2['default'].createElement(
                'path',
                { fill: fill, d: 'M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z' },
                _react2['default'].createElement('animateTransform', {
                    attributeType: 'xml',
                    attributeName: 'transform',
                    type: 'rotate',
                    from: '0 ' + halfPaddedSize + ' ' + halfPaddedSize,
                    to: '360 ' + halfPaddedSize + ' ' + halfPaddedSize,
                    dur: '0.6s',
                    repeatCount: 'indefinite' })
            )
        );
    },

    // Magnifying glass
    search: function search(size, fill) {
        if (!size) size = 40;
        if (!fill) fill = '#00796b';

        return _react2['default'].createElement(
            'svg',
            {
                width: size,
                height: size,
                viewBox: '0 0' + size + ' ' + size },
            _react2['default'].createElement('path', { fill: fill, d: 'M31 28h-1.59l-.55-.55C30.82 25.18 32 22.23 32 19c0-7.18-5.82-13-13-13S6 11.82 6 19s5.82 13 13 13c3.23 0 6.18-1.18 8.45-3.13l.55.55V31l10 9.98L40.98 38 31 28zm-12 0c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z' })
        );
    }
};

exports['default'] = _react2['default'].createClass({
    displayName: 'icon',

    propTypes: {
        type: _react2['default'].PropTypes.string.isRequired,
        size: _react2['default'].PropTypes.number,
        fill: _react2['default'].PropTypes.string
    },

    getDefaultProps: function getDefaultProps() {
        return { type: null };
    },

    render: function render() {
        var svg = SVGs[this.props.type];
        if (svg) {
            return _react2['default'].createElement(
                'i',
                { className: this.props.className, style: {} },
                svg(this.props.size, this.props.fill)
            );
        } else {
            return _react2['default'].createElement('i', { className: this.props.className });
        }
    }
});
module.exports = exports['default'];
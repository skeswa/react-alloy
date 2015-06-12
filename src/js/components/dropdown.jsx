import React from 'react';

export const DropdownItem = React.createClass({
    getDefaultProps() {
        return {
            id: 'Unknown',
            name: 'Unknown',
            highlighted: false,
            onClick: (() => {}),
            onHover: (() => {})
        };
    },

    classNames() {
    },

    render() {
    }
});

export const Dropdown = React.createClass({
    getDefaultProps() {
        return {
            mounted: false,
            visible: false
        };
    },

    classNames() {
        let classes = ['alloy-dropdown'];
        // Dropdown
        if (this.props.mounted) classes.push('alloy-mounted');
        if (this.props.visible) classes.push('alloy-visible');

        return classes.join(' ');
    },

    render() {
        let content;
        if (this.props.children > 0) {
            content = this.props.children;
        } else {
            content = (
                <div className="alloy-empty">
                    No results to show.
                </div>
            );
        }

        return (
            <div className={this.classNames()}>
                <div>
                    {content}
                </div>
            </div>
        );
    }
});

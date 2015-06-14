import React from 'react';

import {isFunction} from 'util/typechecker';

export const DropdownItem = React.createClass({
    getDefaultProps() {
        return {
            id: 'Unknown',
            name: 'Unknown',
            highlighted: false,
            onClick: (() => {}),
            onMouseEnter: (() => {}),
            onMouseLeave: (() => {})
        };
    },

    classNames() {
        let classNames = ['alloy-dropdown-item'];
        if (this.props.highlighted) classNames.push('alloy-highlighted');
        return classNames.join(' ');
    },

    invoke(fn) {
        if (fn) {
            fn(this.props.id, this.props.name);
        }
    },

    render() {
        return (
            <div
                className={this.classNames()}
                onClick={this.invoke.bind(this, this.props.onClick)}
                onMouseEnter={this.invoke.bind(this, this.props.onMouseEnter)}
                onMouseLeave={this.invoke.bind(this, this.props.onMouseLeave)}>
                <div>
                    {this.props.name}
                </div>
            </div>
        );
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
        if (this.props.children.length > 0) {
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

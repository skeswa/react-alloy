import React from 'react';
import _ from 'underscore';
import classes from 'classnames';
import {Checkbox, FloatingActionButton} from 'material-ui';

import RxComponent from 'framework/components/rx-component.js';

const DEFAULT_COLUMN_WIDTH      = 125;
const CHECKBOX_COLUMN_WIDTH     = 50;
const DEFAULT_ENTRY_KEY_NAME    = 'id';

export class Column extends React.Component {
    constructor(...args) {
        super(...args);
        // Default props
        this.props = {
            id: null,
            title: null,
            weight: 0,
            width: 0
        };
    }
}
Column.propTypes = {
    id:     React.PropTypes.string.isRequired, // Maps to a field of entries in the grid
    title:  React.PropTypes.string, // The string put in the column header
    weight: React.PropTypes.number, // How wide this column is compared to others
    width:  React.PropTypes.number  // How wide this column is in pixels - takes precedence over 'weight'
};

class BaseGrid extends RxComponent {
    constructor(...args) {
        super(...args);
        // Bind member functions
        this.width = this.width.bind(this);
        this.columns = this.columns.bind(this);
        this.sizeColumns = this.sizeColumns.bind(this);
        this.entriesToRows = this.entriesToRows.bind(this);
        this.columnHeaders = this.columnHeaders.bind(this);
        // Default props
        this.props = { onAddClicked: () => {} };
        // Listeners
        this.addClicked = this.generate.listener();
        // Behaviors
        this.addClicked.subscribe(() => {
            if (_.isFunction(this.props.onAddClicked)) {
                this.props.onAddClicked();
            }
        });
        // Setup component width logic
        this.lifecycle.componentDidMount.subscribe(() => {
            // Calculate initial width
            this.setState({
                width: this.width()
            });
        });
    }

    width() {
        return React.findDOMNode(this).offsetWidth;
    }

    columns() {
        let columns = [];
        // Iterate through children
        React.Children.forEach(this.props.children, ({type, props}) => {
            if (type === Column) {
                if (_.isString(props.id)) {
                    let title, weight, width;
                    // Set column title
                    if (_.isString(props.title)) {
                        title = props.title;
                    } else {
                        // TODO refine column id -> column title mapping
                        title = (props.id.charAt(0).toUpperCase() + props.id.slice(1));
                    }
                    // Set column weight
                    if (_.isNumber(props.weight)) {
                        weight = props.weight;
                    } else {
                        // Weight defaults to 0 - meaning this column doesn't scale
                        weight = 0;
                    }
                    // Set column width
                    if (_.isNumber(props.width)) {
                        width = props.width;
                    } else {
                        // Width defaults to 0 - meaning this column has no fixed minimum size
                        width = 0;
                    }
                    // Append to columns list
                    columns.push({
                        id:             props.id,
                        title:          title,
                        weight:         weight,
                        width:          width,
                        actualWidth:    0
                    });
                } else {
                    console.warn('Grid column with id', props.id, 'was an invalid string');
                }
            }
        });
        // Return the column array
        return columns;
    }

    sizeColumns(gridWidth, columns) {
        if (!_.isNumber(gridWidth)) throw new Error('Provided gridWidth parameter was not an array');
        if (!_.isArray(columns)) throw new Error('Provided columns parameter was not an array');

        let totalWeight = 0;
        let remainingWidth = gridWidth;
        let i, column;
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
        let weightUnit = 0;
        if (remainingWidth > 0) {
            weightUnit = remainingWidth / totalWeight;
        }
        for (i = 0; i < columns.length; i++) {
            column = columns[i];
            column.actualWidth = column.width + (weightUnit * column.weight);
        }
    }

    entriesToRows(entries, columns, entryKeyName) {
        if (!_.isArray(entries)) throw new Error('Provided entries parameter was not an array');
        if (!_.isArray(columns)) throw new Error('Provided columns parameter was not an array');
        if (!_.isString(entryKeyName)) {
            // If there is no entryKeyName, assume it is the default
            entryKeyName = DEFAULT_ENTRY_KEY_NAME;
        }
        // Compose array of rows
        let rows = entries.map((entry) => {
            let cells = [],
                entryKey = entry[entryKeyName];
            if (entryKey !== undefined && entryKey !== null) {
                let i, column;
                // Add checkbox cell
                if (!this.props.checkboxColumnHidden) {
                    cells.push(
                        <div
                            className="grid-row-checkbox"
                            key={'checkbox' + entryKey}
                            style={{ width: (CHECKBOX_COLUMN_WIDTH + 'px') }}>
                            <Checkbox />
                        </div>
                    );
                }
                // Create a cell element for every column
                for (i = 0; i < columns.length; i++) {
                    column = columns[i];
                    cells.push(
                        <div
                            className="grid-cell"
                            key={entryKey + '-' + column.id}
                            style={{ width: (column.actualWidth + 'px') }}>
                            {entry[column.id]}
                        </div>
                    );
                }
                // Create the row element
                return (
                    <div
                        className="grid-row"
                        key={entryKey}>
                        {cells}
                    </div>
                );
            } else {
                console.warn('An entry key was null or undefined:', entry);
            }
        });
        // Return empty if there are no rows
        if (rows.length < 1) {
            return (
                <div className="grid-empty">
                    There are currently no entries of data to show. <br/>
                    Click the <b>+</b> button to add new enties.
                </div>
            );
        } else {
            return rows;
        }
    }

    columnHeaders(columns) {
        if (!_.isArray(columns)) throw new Error('Provided columns parameter was not an array');

        let headers = columns.map((column) => {
            return (
                <div
                    className="grid-column-header"
                    key={column.id}
                    style={{ width: (column.actualWidth + 'px') }}>
                    <span className="title">{column.title}</span>
                    <div className="separator"/>
                </div>
            );
        });
        // Add checkbox header
        if (!this.props.checkboxColumnHidden) {
            headers.unshift(
                <div
                    className="grid-header-checkbox"
                    key="header-checkbox"
                    style={{ width: (CHECKBOX_COLUMN_WIDTH + 'px') }}>
                    <Checkbox />
                </div>
            );
        }

        return headers;
    }

    actionButtons() {
        return (
            <div className="grid-action-buttons">
                <FloatingActionButton className="secondary" disabled={true} iconClassName="md md-delete" mini={true} secondary={true} />
                <FloatingActionButton className="secondary" disabled={true} iconClassName="md md-edit" mini={true} secondary={true} />
                <FloatingActionButton iconClassName="md md-add" primary={true} onClick={this.addClicked} />
            </div>
        );
    }
}

export class Grid extends BaseGrid {
    constructor(...args) {
        super(...args);
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

    behavior() {
    }

    render() {
        if (this.state.width === 0 ||
            this.state.width === undefined ||
            this.state.width === null) {
            // If we have no width, there's no sense in painting
            return (
                <div className="grid"/>
            );
        }
        // Figure out what column we're rendering
        let columns = this.columns();
        // Size our columns
        this.sizeColumns(this.state.width, columns);
        // Get the rows that we're painting
        let rows = this.entriesToRows(this.props.data, columns, this.props.entryKeyName);
        // Create the column headers
        let columnHeaders = this.columnHeaders(columns);
        // Make the action buttons that we needs
        let actionButtons = this.actionButtons();
        // Paint the grid
        return (
            <div className="grid">
                <div className="grid-header">
                    {columnHeaders}
                </div>
                <div className="grid-body">
                    {rows}
                </div>
                {actionButtons}
            </div>
        );
    }
}
Grid.propTypes = {
    // Array of entry objects that are listed in the grid
    data:           React.PropTypes.array.isRequired,
    // The name of the unique field of all entries
    entryKeyName:   React.PropTypes.string
};

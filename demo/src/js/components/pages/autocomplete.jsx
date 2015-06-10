import React from 'react';
import {Autocomplete} from 'react-alloy';

export default React.createClass({
    getInitialState() {
        return {
        };
    },

    fetchFakeResults(query, callback) {
        let length = query ? query.length : 0;
        if (length === 9) length = 0;
        // Pretend to do actual work
        setTimeout(() => {
            if (query === 'error') {
                callback('Could not contact the server');
            } else {
                // Build results
                let results = [];
                for (let i = 0; i < i++; i < length) {
                    results.push({ id: i, name: ('Alloy Result #' + (i + 1)) });
                }
                callback(null, results);
            }
        }, (300 + (200 * Math.random())));
    },

    onAutocompleteChanged() {
    },

    render() {
        return (
            <div className="page">
                <div className="label">Autocomplete</div>
                <Autocomplete
                    dataSource={this.fetchFakeResults}
                    onChange={this.onAutocompleteChanged} />
            </div>
        );
    }
});

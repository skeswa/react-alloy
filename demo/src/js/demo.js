import React from 'react';
import Router from 'react-router';

import DemoShell from 'components/shell/index';
import AutocompleteDemo from 'components/pages/autocomplete';

const {Route} = Router;

const sitemap = (
    <Route handler={DemoShell} path="/">
        <Route name="autocomplete" handler={AutocompleteDemo} />
    </Route>
);

Router.run(sitemap, function (Handler) {
    React.render(<Handler/>, document.body);
});

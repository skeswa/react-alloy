var argv = require('yargs').argv;

module.exports = {
    /********************************* FLAGS *********************************/

    // The --production flag will build for production instead of dev
    production: !!(argv.production),
};

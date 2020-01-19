const { format } = require("timeago.js");
const helpers = {};

helpers.timeago = (timestamp) => {
    return format(timestamp);
};


helpers.registerHelper = (v1, v2, options) => {
    if (v1 == v2) {
        return options.fn(this);
    }
    return options.inverse(this);
};


module.exports = helpers;


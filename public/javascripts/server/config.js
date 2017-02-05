const config = {
    getIndexPage: function(path) {
        return path.join(__dirname, 'public/html/index.html');
    },

    getErrorPage: function() {
        return 'public/html/error.html';
    },

    getPort: function() {
        return process.env.PORT || 3000;
    },

    getMongoURI: function() {
        return process.env.MONGOLAB_URI || process.env.MONGOHQ_URL  || 'mongodb://localhost:27017/data/db';
    },

    isTesting: function() {
        return true;
    }
};

exports.config = config;
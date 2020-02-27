const mongoose = require('./database');
const config = require('../../config')();

// Connection Initialization
const init = async() => {
    if (!mongoose.connection.readyState) {
        await mongoose.connect(config.database.connection, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }).then(() => console.log('MongoDB connected'))
            .then(() => mongoose);

        // To prevent deprectation warnings (from MongoDB native driver)
        mongoose.set('useCreateIndex', true);
        mongoose.set('useFindAndModify', false);

        return mongoose;
    }
    return mongoose;
};

const middleware = async(req, res, next) => {
    try {
        await init();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
        return;
    }
    return next();
};

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open to' + config.database.connection);
});

// When connection throws an error
mongoose.connection.on('error', (error) => {
    console.log('Mongoose default connection error: ' + error);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

exports.init = init;
exports.middleware = middleware;
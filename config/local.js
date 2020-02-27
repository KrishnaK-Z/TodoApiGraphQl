module.exports = {
    env: 'localhost',

    jwt: 'ninja777',

    database: {
        connection: 'mongodb://localhost:27017/todoql',
        transactions: false,
    },

    email: {
        comment: 'See https://nodemailer.com',
        from: '<insert your email here>',
        host: null,
        auth: {
            user: null,
            pass: null,
        },
    },

    graphiql: true,

    clientUrl: 'https://<insert project id here>.firebaseapp.com',

    defaultUser: '<insert your email here>',
};
const database = require('../database');
const config = require('../../../config')();
const Schema = database.Schema;
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const jwtSecret = config.jwtSecret;

const UserSchema = new Schema({
    userName: {
        type: String,
        maxlength: 70,
        required: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    session: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: String,
            required: true
        }
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

/**
 * Override the default toJSON method
 * To omit the password and session in the returned object
 * return the document except the password and sessions (these shouldn't be made available)
 */
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.omit(userObject, ['password', 'session']);
}

/**
 * To generate the JWT token
 * use promise to occur in sysnchronous way
 *  Create the JSON Web Token and return that
 */
UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    // toHexString -> string return the 24 byte hex string representation.
    return new Promise((resolve, reject) => {
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: '15m' }, (error, token) => {
            if (!error) {
                resolve(token);
            } else {
                reject(error);
            }
        });
    });
}

/**
 * Generate the refresh token
 */
UserSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (error, buffer) => {
            if (!error) {
                let token = buffer.toString('hex');
                return resolve(token);
            } else {
                reject(error);
            }
        });
    });
}

/**
 * To create a refresh session
 * and store in DB
 */

UserSchema.methods.createSession = function() {
    const user = this;

    return user.generateRefreshAuthToken().then(refreshToken => {
        return saveSessionToDatabase(user, refreshToken);
    }).then(refreshToken => {
        return refreshToken;
    }).catch(error => {
        return Promise.reject('Failed to save session to database.\n' + error);
    });
}


/**
 * Static methods (MODEL methods)
 * Called on model not an instance of the model
 */
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

/**
 * Search user by User id and refresh token
 */
UserSchema.statics.findByIdAndToken = function(_id, token) {
    const user = this;
    return user.findOne({
        _id,
        'session.token': token
    });
}

/**
 * Find the  user in DB using the email and password
 */
UserSchema.statics.findUserByCredentials = function(email, password) {
    let user = this;
    return user.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (error, result) => {
                if (result) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
}

/**
 * Check if the RefreshToken in DB is expired
 */
UserSchema.statics.hasRefreshTokenExpired = (expireAt) => {
    let secondsSince = Date.now() / 1000;
    if (expireAt > secondsSince) {
        return false; // hasn't expired
    }
    return true; //has expired
}

/**
 * Middleware
 * Before the user document is saved
 */
UserSchema.pre('save', function(next) {
    const user = this;
    const constFactor = 10;

    if (user.isModified('password')) {
        //if the password is changed/ editing run this code
        bcrypt.genSalt(constFactor, (error, salt) => {
            bcrypt.hash(user.password, salt, (error, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }

});


/**
 * Save the refresh token to db
 * Is a Helpher Function
 */

let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();
        user.session.push({ 'token': refreshToken, expiresAt });
        user.save().then(() => {
            resolve(refreshToken);
        }).catch(e => {
            reject(e);
        });
    });
}

/**
 * Set the expire time 10 days from now
 * Store it in seconds
 */
let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User };
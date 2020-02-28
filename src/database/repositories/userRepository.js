const AbstractRepository = require('./abstractRepository');
const User = require('../models/user');

module.exports = class UserRepository extends AbstractRepository {

    /**
     * To create a new User
     * @param {*} data 
     * @param {*} options 
     */
    static async create(data, options) {
        data = this._preSave(data);

        await User.createCollection();
        const [user] = await User.create(
            [{
                email: data.email,
                userName: data.userName || null,
                createdBy: this.getCurrentUser(options).id,
                updatedBy: this.getCurrentUser(options).id,
            }, ],
            this.getSessionOptionsIfExists(options),
        );

        return this.findById(user.id, options);
    }

    static async createFromAuth(data, options) {
        data = this._preSave(data);

        await User.createCollection();
        let [user] = await User.create(
            [{
                email: data.email,
                userName: data.userName,
                authenticationUid: data.authenticationUid
            }, ],
            this.getSessionOptionsIfExists(options),
        );

        return this.findById(user.id, options);
    }

    static async updateProfile(id, data, options) {
        data = this._preSave(data);

        await this.wrapWithSessionIfExists(
            User.updateOne({ _id: id }, {
                userName: data.userName || null,
                updatedBy: this.getCurrentUser(options).id
            }, ),
            options,
        );

        const user = await this.findById(id, options);

        return user;
    }

    static async updateAuthenticationUid(
        id,
        authenticationUid,
        options,
    ) {
        await this.wrapWithSessionIfExists(
            User.updateOne({ _id: id }, {
                authenticationUid,
                updatedBy: this.getCurrentUser(options).id,
            }, ),
            options,
        );

        return this.findById(id, options);
    }

    static async updateStatus(id, disabled, options) {
        await this.wrapWithSessionIfExists(
            User.updateOne({ _id: id }, {
                disabled,
                updatedBy: this.getCurrentUser(options).id,
            }, ),
            options,
        );

        return this.findById(id, options);
    }


    static async update(id, data, options) {
        data = this._preSave(data);

        await this.wrapWithSessionIfExists(
            User.updateOne({ _id: id }, {
                userName: data.userName || null,
                updatedBy: this.getCurrentUser(options).id
            }, ),
            options,
        );

        const user = await this.findById(id, options);

        return user;
    }

    static async findByEmail(email, options) {
        return this.wrapWithSessionIfExists(
            User.findOne({ email }),
            options,
        );
    }

    static async findByEmailWithoutAvatar(email, options) {
        return this.findByEmail(email, options);
    }

    static async findAllWithCount({ filter, limit, offset, orderBy, attributes } = {
            attributes: null,
            filter: null,
            limit: 0,
            offset: 0,
            orderBy: null,
        },
        options,
    ) {
        let query = MongooseQuery.forList({
            limit,
            offset,
            orderBy: orderBy || 'createdBy_DESC',
        });

        if (filter) {
            if (filter.id) {
                query.appendId('_id', filter.id);
            }

            if (filter.fullName) {
                query.appendIlike('fullName', filter.fullName);
            }

            if (filter.email) {
                query.appendIlike('email', filter.email);
            }

            if (filter.role) {
                query.appendIn('roles', filter.role);
            }

            if (filter.status) {
                const disabled = filter.status === 'disabled';
                query.appendEqual('disabled', disabled);
            }

            if (filter.createdAtRange) {
                query.appendRange(
                    'createdAt',
                    filter.createdAtRange,
                );
            }
        }

        const rows = await this.wrapWithSessionIfExists(
            User.find(query.criteria)
            .skip(query.skip)
            .limit(query.limit)
            .sort(query.sort),
            options,
        );

        const count = await this.wrapWithSessionIfExists(
            User.countDocuments(query.criteria),
            options,
        );

        return { rows, count };
    }

    static async findAllAutocomplete(search, limit) {
        let query = MongooseQuery.forAutocomplete({
            limit,
            orderBy: 'fullName_ASC',
        });

        if (search) {
            query.appendId('_id', search);
            query.appendIlike('fullName', search);
            query.appendIlike('email', search);
        }

        const users = await User.find(query.criteria)
            .limit(query.limit)
            .sort(query.sort);

        const buildText = (user) => {
            if (!user.fullName) {
                return user.email;
            }

            return `${user.fullName} <${user.email}>`;
        };

        return users.map((user) => ({
            id: user.id,
            label: buildText(user),
        }));
    }

    static async findById(id, options) {
        return this.wrapWithSessionIfExists(
            User.findById(id),
            options,
        );
    }

    static async findByIdWithoutAvatar(id, options) {
        return this.findById(id, options);
    }

    static async findAllByDisabled(ids, disabled, options) {
        return this.wrapWithSessionIfExists(
            User.find({
                _id: { $in: ids },
                disabled: !!disabled,
            }),
            options,
        );
    }

    static async count(filter, options) {
        return this.wrapWithSessionIfExists(
            User.countDocuments(filter),
            options,
        );
    }

    /**
     * Format data before saving
     * @param {*} data 
     */
    static _preSave(data) {
        if (data.userName) {
            data.userName = `${(data.userName || '').trim()}`.trim();
        }

        data.email = data.email ? data.email.trim() : null;

        return data;
    }
};
const schema = `
  type Tasks {
    id: String!
    title: String
    createdAt: DateTime
    updatedAt: DateTime
    status: String 
  }
`;

const resolver = {};

exports.schema = schema;
exports.resolver = resolver;
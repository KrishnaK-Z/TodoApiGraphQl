const makeExecutableSchema = require('graphql-tools')
    .makeExecutableSchema;

const typeDefs = `
type Author {
  id: ID! # the ! means that every author object _must_ have an id
  firstName: String
  lastName: String
  """
  the list of Posts by this author
  """
  posts: [Post]
}
 
type Post {
  id: ID!
  title: String
  author: Author
  votes: Int
}
 
# the schema allows the following query:
type Query {
  posts: [Post]
}
 
# this schema allows the following mutation:
type Mutation {
  upvotePost (
    postId: ID!
  ): Post
}
 
# we need to tell the server which types represent the root query
# and root mutation types. We call them RootQuery and RootMutation by convention.
schema {
  query: Query
  mutation: Mutation
}
`;

const resolvers = {
    Query: {
        posts() {
            return posts;
        },
    },
    Mutation: {
        upvotePost(_, { postId }) {
            const post = find(posts, { id: postId });
            if (!post) {
                throw new Error(`Couldn't find post with id ${postId}`);
            }
            post.votes += 1;
            return post;
        },
    },
    Author: {
        posts(author) {
            return filter(posts, { authorId: author.id });
        },
    },
    Post: {
        author(post) {
            return find(authors, { id: post.authorId });
        },
    },
};

module.exports = makeExecutableSchema({
    typeDefs,
    resolvers,
});
import GraphQLJSON from 'graphql-type-json'
import shortid from 'shortid'


export default {
  JSON: GraphQLJSON,

  Query: {
    posts: (root, { options: { page, limit} }, { db }) => { 
      const len =  db.get('posts').value().length;
      let previousOffset = 0;
      let nextOffset = len;
      if(len >= limit) {
        previousOffset = (page - 1) * limit;
        nextOffset = page * limit;
      } 
      return db.get('posts').value().slice(previousOffset, nextOffset);
    },
    getPost: (root, { id }, { db }) => db.get('posts').find({ id }).value(),
  },
  Mutation: {
    addPost: (root, { input }, { pubsub, db }) => {
      const post = {
        id: shortid.generate(),
        title: input.title,
        body: input. body
      }
      db
        .get('posts')
        .push(post)
        .last()
        .write()

      return post
    },
    deletePost: (root, { id }, { pubsub, db }) => {
      pubsub.publish('posts', { deleted: null })
      db
        .get('posts')
        .remove({ id })
        .write()
      return { deletedPost: true }
    },
  },

  Subscription: {
    deleted: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('posts'),
    },
    postsAdded: {
      subscribe: () => pubsub.asyncIterator(['POST_ADDED']),
    },
  },
}

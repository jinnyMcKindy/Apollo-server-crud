import GraphQLJSON from 'graphql-type-json'
import shortid from 'shortid'


export default {
  JSON: GraphQLJSON,

  Counter: {
    countStr: counter => `Current count: ${counter.count}`,
  },

  Query: {
    posts: (root, args, { db }) => db.get('posts').slice(offset, last_offset).value(),
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
      pubsub.publish('posts', { postsAdded: null })
      db
        .get('posts')
        .remove({ id })
        .write()
      return { deletedPost: true }
    },
  },

  Subscription: {
    mySub: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('hey'),
    },
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).substring(2, 15) // random channel name
        let count = 0
        setInterval(() => pubsub.publish(
          channel,
          {
            // eslint-disable-next-line no-plusplus
            counter: { count: count++ },
          }
        ), 2000)
        return pubsub.asyncIterator(channel)
      },
    },

    postsAdded: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('posts'),
    },
  },
}

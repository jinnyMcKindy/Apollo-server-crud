<template>
  <div class="apollo-example">
    <div>
      <span 
          v-for="page in 11" 
          :key="page"
          @click="changePage(page)">
          {{page}}
      </span>
    </div>
    <ApolloMutation
      :mutation="require('../graphql/AddPost.gql')"
      :variables="{
        input: {
          title: title,
          body: body
        },
      }"
      class="form"
      @done="newMessage = ''"
    >
      <template slot-scope="{ mutate }">
        <span class="red" v-if="!formValid">Fill the form</span>
        <form @submit="formValid && mutate()">
          <label for="field-message">Title</label>
          <input
            id="field-message"
            v-model="title"
            placeholder="Type a message"
            class="input"
            required
          >
          <label for="field-message">Message</label>
          <input
            id="field-message"
            v-model="body"
            placeholder="Type a message"
            class="input"
            required
          >
          <div><button class="btn" type="submit">Add post</button></div>
        </form>
      </template>
    </ApolloMutation>
    <ApolloQuery 
      :query="ALL_POSTS">
            <ApolloSubscribeToMore
              :document="require('../graphql/PostsAdded.gql')"
              :update-query="onPostsAdded"
            />
            <div slot-scope="{ result: { loading, error, data } }">
            <template>
            <div v-if="loading" class="loading apollo">Loading...</div>
            <div v-else-if="error" class="error apollo">An error occurred</div>
            <div v-else-if="data" class="result apollo">
                <div class="post" v-for="post in data.posts" :key="post.id">
                      <h4>{{post.title}}  <i @click="deletePost(post.id)" class="fa fa-trash red" aria-hidden="true"></i></h4>
                      <p>{{post.body}}</p>                 
                </div>
            </div>
            <div v-else class="no-result apollo">No result :(</div>
            </template>
            </div>
        </ApolloQuery>
  </div>
</template>

<script>
const DELETE_POST = require('../graphql/DeletePost.gql');

export default {
  data () {
    return {
      title: '',
      body: '',
      ALL_POSTS: require('../graphql/Posts.gql')
    }
  },

  computed: {
    formValid () {
      return this.title && this.body
    },
  },

  methods: {
    onMessageAdded (previousResult, { subscriptionData }) {
      return {
        messages: [
          ...previousResult.messages,
          subscriptionData.data.messageAdded,
        ],
      }
    },
    onPostsAdded (previousResult, { subscriptionData }) {
      return {
        posts: [
          ...previousResult.posts,
          subscriptionData.data.postsAdded,
        ],
      }
    },
    deletePost(id) {
      this.$apollo.mutate({
        mutation: DELETE_POST,
        variables: {
          id
        },
        update: store => {
          const data = store.readQuery({ query: this.ALL_POSTS })
          const posts = data.posts;
          const deletedPost = posts.find((post) => post.id === id);
          const index = posts.indexOf(deletedPost);
          posts.splice(index, 1);
          data.posts = posts;
          store.writeQuery({ query: this.ALL_POSTS, data })
        }
      }) 
    },
    changePage(page) {
      const opt = { ...this.options }
      opt.paginate.page = page;
      this.options = opt;
      this.$apollo.queries.posts.refetch();
    },
  },
}
</script>

<style scoped>
.form,
.input,
.apollo,
.message {
  padding: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
}
.btn {
  width: 100px;
  background: white;
  margin-top: 10px;
  padding: 5px;
  border: solid 2px #ccc;
}
.red {
  color: red;
  cursor: pointer;
}
.input {
  font-family: inherit;
  font-size: inherit;
  border: solid 2px #ccc;
  border-radius: 3px;
}

.error {
  color: red;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
  grid-gap: 10px;
}

.image-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  border-radius: 8px;
}

.image {
  max-width: 100%;
  max-height: 100%;
}

.image-input {
  margin: 20px;
}
.post h4 {
  text-align: center;
}
</style>

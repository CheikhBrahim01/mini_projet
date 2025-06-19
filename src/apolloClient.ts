import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: 'https://saleor.signusk.com/graphql/',
  cache: new InMemoryCache(),
})

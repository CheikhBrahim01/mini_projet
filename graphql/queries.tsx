import { gql } from '@apollo/client'

export const GET_PRODUCTS = gql`
  query GetProducts($first: Int!, $after: String, $languageCode: LanguageCodeEnum!) {
    products(first: $first, after: $after, channel: "default-channel") {
      edges {
        node {
          id
          name
          description
          translation(languageCode: $languageCode) {
            name
            description
          }
          pricing {
            priceRange {
              start {
                gross {
                  amount
                  currency
                }
              }
            }
          }
          thumbnail {
            url
            alt
          }
          category {
            name
            translation(languageCode: $languageCode) {
              name
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`
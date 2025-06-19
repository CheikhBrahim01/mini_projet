import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

//  Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  image: string | null
  imageAlt: string
  category: string
}

interface ProductsState {
  itemsByPage: Record<number, Product[]>
  cursorsByPage: Record<number, string | null> // This stores the END cursor for each page
  hasNextPageByPage: Record<number, boolean>
  loading: boolean
  error: string | null
}

// Initial state
const initialState: ProductsState = {
  itemsByPage: {},
  cursorsByPage: {},
  hasNextPageByPage: {},
  loading: false,
  error: null,
}

// GraphQL query for fetching products
const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          name
          description
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

// ❗ NOTE: While this asyncThunk works, it leads to a lot of boilerplate for something RTK Query handles automatically.
// ✅ CONSIDER using `createApi` with Apollo Client for reusable, scalable, and cache-aware data fetching.
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page, after }: { page: number; after?: string | null }) => {
    try {
      console.log(`Fetching page ${page} with cursor:`, after)

      const response = await fetch('https://saleor.signusk.com/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_PRODUCTS_QUERY,
          variables: {
            first: 10, // Number of products per page
            after: after, // Cursor for pagination
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error occurred')
      }

      const data = result.data?.products

      if (!data) {
        throw new Error('No products data received')
      }

      // Transform GraphQL response to our Product interface
      const products: Product[] = data.edges.map((edge: any) => ({
        id: edge.node.id,
        name: edge.node.name,
        description: edge.node.description || 'No description available',
        price: edge.node.pricing?.priceRange?.start?.gross?.amount || 0,
        currency: edge.node.pricing?.priceRange?.start?.gross?.currency || 'USD',
        image: edge.node.thumbnail?.url || null,
        imageAlt: edge.node.thumbnail?.alt || edge.node.name,
        category: edge.node.category?.name || 'Uncategorized',
      }))

      console.log(`Fetched ${products.length} products for page ${page}`)
      console.log('Page info:', data.pageInfo)

      return {
        page,
        products,
        hasNextPage: data.pageInfo.hasNextPage,
        endCursor: data.pageInfo.endCursor,
        startCursor: data.pageInfo.startCursor,
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching products')
    }
  }
)

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetProducts: (state) => {
      state.itemsByPage = {}
      state.cursorsByPage = {}
      state.hasNextPageByPage = {}
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        const { page, products, hasNextPage, endCursor } = action.payload
        
        // Store products for this page
        // 🚨 CODE REVIEW:
        // This logic works fine but is verbose.
        // With RTK Query, this would be automatically managed with built-in caching, pagination, and selectors.
        state.itemsByPage[page] = products
        
        // Store the END cursor for this page (this will be used as the 'after' for the next page)
        state.cursorsByPage[page] = endCursor
        
        // Store hasNextPage info
        state.hasNextPageByPage[page] = hasNextPage
        
        console.log(`Stored page ${page} with ${products.length} products`)
        console.log(`End cursor for page ${page}:`, endCursor)
        console.log(`Has next page:`, hasNextPage)
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
  },
})

// ⚠️ CODE REVIEW — Recommendation to use `createApi` (RTK Query):
// 🔁 Auto-caching per request (based on `page`, `filter`, etc.)
// 🔧 Auto-generated React hooks: `useGetProductsQuery()`
// 🔄 Automatic refetch when args change or tags are invalidated
// 💡 Less boilerplate and cleaner architecture
//
// ✅ Example using `createApi`:
// const { data } = useGetProductsQuery({ first: 10 }) // fetches and caches
// const { data } = useGetProductsQuery({ first: 10 }) // returns cached
// const { data } = useGetProductsQuery({ first: 20 }) // fetches new set

// ✅ Also, consider using a reusable Apollo Client:
// import { ApolloClient, InMemoryCache } from '@apollo/client'
// export const client = new ApolloClient({
//   uri: 'https://saleor.signusk.com/graphql/',
//   cache: new InMemoryCache(),
// })
// Then integrate this client in your RTK Query baseQuery

export const { clearError, resetProducts } = productsSlice.actions
export default productsSlice.reducer

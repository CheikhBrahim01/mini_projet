//This file is used to manage the state of products in the application with Redux Toolkit.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Types
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
  cursorsByPage: Record<number, string | null>
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

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page, after }: { page: number; after?: string | null }) => {
    try {
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

      return {
        page,
        products,
        hasNextPage: data.pageInfo.hasNextPage,
        cursor: data.pageInfo.endCursor,
        startCursor: data.pageInfo.startCursor,
      }
    } catch (error) {
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
        const { page, products, hasNextPage, cursor } = action.payload
        
        // Store products for this page
        state.itemsByPage[page] = products
        
        // Store cursor for next page
        state.cursorsByPage[page] = cursor
        
        // Store hasNextPage info
        state.hasNextPageByPage[page] = hasNextPage
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
  },
})

export const { clearError, resetProducts } = productsSlice.actions
export default productsSlice.reducer
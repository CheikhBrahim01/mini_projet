import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { selectLanguage } from './services/lang-slice';

// --- Types ---
export interface Product {
  translation: any;
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string | null;
  imageAlt: string;
  category: string;
}

interface ProductsState {
  itemsByPage: Record<number, Product[]>;
  cursorsByPage: Record<number, string | null>;
  hasNextPageByPage: Record<number, boolean>;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  itemsByPage: {},
  cursorsByPage: {},
  hasNextPageByPage: {},
  loading: false,
  error: null,
};

const GET_PRODUCTS_QUERY = `
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
`;

const languageMap = {
  en: 'EN',
  fr: 'FR',
  ar: 'AR',
} as const;

export const fetchProducts = createAsyncThunk<
  {
    page: number;
    products: Product[];
    hasNextPage: boolean;
    endCursor: string;
    startCursor: string;
  },
  { page: number; after?: string | null },
  { state: RootState }
>('products/fetchProducts', async ({ page, after }, { getState }) => {
  try {
    const state = getState();
    const lang = state.lang.language as keyof typeof languageMap;
    const languageCode = languageMap[lang];

    const response = await fetch('https://saleor.signusk.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_PRODUCTS_QUERY,
        variables: {
          first: 5,
          after: after,
          languageCode,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
    }

    const data = result.data?.products;

    if (!data) {
      throw new Error('No products data received');
    }

    const products: Product[] = data.edges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      description: edge.node.description || 'No description available',
      price: edge.node.pricing?.priceRange?.start?.gross?.amount || 0,
      currency: edge.node.pricing?.priceRange?.start?.gross?.currency || 'USD',
      image: edge.node.thumbnail?.url || null,
      imageAlt: edge.node.thumbnail?.alt || edge.node.name,
      category: edge.node.category?.name || 'Uncategorized',
      translation: edge.node.translation || null,
    }));

    return {
      page,
      products,
      hasNextPage: data.pageInfo.hasNextPage,
      endCursor: data.pageInfo.endCursor,
      startCursor: data.pageInfo.startCursor,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching products');
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetProducts: (state) => {
      state.itemsByPage = {};
      state.cursorsByPage = {};
      state.hasNextPageByPage = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { page, products, hasNextPage, endCursor } = action.payload;
        state.itemsByPage[page] = products;
        state.cursorsByPage[page] = endCursor;
        state.hasNextPageByPage[page] = hasNextPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const { clearError, resetProducts } = productsSlice.actions;
export default productsSlice.reducer;

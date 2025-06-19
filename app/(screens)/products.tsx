import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Button, FlatList, Image, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../../store'
import type { Product } from '../../store/productsSlice'
import { clearError, fetchProducts } from '../../store/productsSlice'

export default function ProductsScreen() {
  const [page, setPage] = useState(1)
  const dispatch = useDispatch<AppDispatch>()

  const {
    itemsByPage,
    cursorsByPage,
    hasNextPageByPage,
    loading,
    error,
  } = useSelector((state: RootState) => state.products)

  const items = itemsByPage[page] || []
  const hasNextPage = hasNextPageByPage[page] ?? true

  // ⚠️ Suggestion: move this logic to a helper function like `getCursorForPage(page)`
  const afterCursor = page === 1 ? null : cursorsByPage[page - 1] || null

  // ✅ Great: conditional dispatch based on cache
  // 🚀 Could be fully handled by RTK Query with auto-caching
  useEffect(() => {
    if (!itemsByPage[page] && !loading) {
      console.log(`Loading page ${page} with cursor:`, afterCursor)
      dispatch(fetchProducts({ page, after: afterCursor }))
    }
  }, [page, dispatch, itemsByPage, cursorsByPage, loading])

  // ✅ Good: handling error UI via native Alert + clear on dismiss
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ])
    }
  }, [error, dispatch])

  // ⚠️ Recommend: useCallback to memoize handlers and avoid re-renders
  const goToNextPage = useCallback(() => {
    if (!hasNextPage || loading) {
      console.log('Cannot go to next page:', { hasNextPage, loading })
      return
    }
    setPage((prev) => prev + 1)
  }, [hasNextPage, loading])

  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }, [page])

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage}
            onError={() => console.log('Failed to load image:', item.image)}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>
            {item.price > 0 ? `${item.price} ${item.currency}` : 'Prix non disponible'}
          </Text>
        </View>
      </View>
      <Text style={styles.productDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </View>
  )

  // ✅ Nice UX touch: show partial loader during scroll
  const renderLoadingFooter = () => {
    if (loading && items.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      )
    }
    return null
  }

  // 🧠 TIP: you can also show a ListEmptyComponent in FlatList if items.length === 0
  const renderPaginationControls = () => (
    <View style={styles.paginationContainer}>
      <Button
        title="← Précédent"
        onPress={goToPreviousPage}
        disabled={page === 1}
      />

      <View style={styles.pageInfo}>
        <Text style={styles.pageText}>Page {page}</Text>
        <Text style={styles.itemsText}>
          {items.length} produit{items.length > 1 ? 's' : ''}
        </Text>
        {/* ⚠️ Dev-only debug info. Consider removing this in production */}
        <Text style={styles.debugText}>
          Next: {hasNextPage ? 'Oui' : 'Non'} | Loading: {loading ? 'Oui' : 'Non'}
        </Text>
      </View>

      <Button
        title="Suivant →"
        onPress={goToNextPage}
        disabled={!hasNextPage || loading}
      />
    </View>
  )

  // ✅ Great handling of initial loading state
  if (loading && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    )
  }

  // ✅ Nice fallback for error + retry
  if (error && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erreur lors du chargement</Text>
        <Button 
          title="Réessayer" 
          onPress={() => {
            dispatch(fetchProducts({ page, after: afterCursor }))
          }} 
        />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Produits</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        // 🧼 SUGGESTION: Add `ListEmptyComponent` for better UX when no results
      />

      {renderPaginationControls()}
    </View>
  )
}

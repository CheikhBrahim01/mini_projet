import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import type { Product } from "../store/productsSlice";
import { clearError, fetchProducts } from "../store/productsSlice";

export default function ProductsScreen() {
  const [page, setPage] = useState(1);
  const [requestedPage, setRequestedPage] = useState(1);
  const dispatch = useDispatch<AppDispatch>();

  const { itemsByPage, cursorsByPage, hasNextPageByPage, loading, error } =
    useSelector((state: RootState) => state.products);

  const items = itemsByPage[page] || [];
  const hasNextPage = hasNextPageByPage[page] ?? true;
  const currentCursor = cursorsByPage[requestedPage - 1] ?? null;

  
  useEffect(() => {
    if (!itemsByPage[requestedPage] && !loading) {
      dispatch(fetchProducts({ page: requestedPage, after: currentCursor }));
    } else if (itemsByPage[requestedPage]) {
      setPage(requestedPage); 
    }
  }, [requestedPage, itemsByPage, loading, dispatch]);


  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error, [
        { text: "OK", onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  const goToNextPage = () => {
    if (!loading && hasNextPage) {
      setRequestedPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setRequestedPage((prev) => prev - 1);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            onError={() => console.log("Erreur de chargement image:", item.image)}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>
            {item.price > 0
              ? `${item.price} ${item.currency}`
              : "Prix non disponible"}
          </Text>
        </View>
      </View>
      <Text style={styles.productDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </View>
  );

  const renderLoadingFooter = () => {
    if (loading && items.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }
    return null;
  };

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
          {items.length} produit{items.length > 1 ? "s" : ""}
        </Text>
      </View>
      <Button
        title="Suivant →"
        onPress={goToNextPage}
        disabled={!hasNextPage || loading}
      />
    </View>
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erreur lors du chargement</Text>
        <Button
          title="Réessayer"
          onPress={() =>
            dispatch(fetchProducts({ page: requestedPage, after: currentCursor }))
          }
        />
      </View>
    );
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
      />

      {renderPaginationControls()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listContainer: {
    padding: 10,
  },
  productItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
  },
  placeholderText: {
    fontSize: 24,
    color: "#aaa",
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  pageInfo: {
    alignItems: "center",
  },
  pageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemsText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff3333",
    textAlign: "center",
    marginBottom: 20,
  },
});

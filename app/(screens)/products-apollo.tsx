import { useQuery } from "@apollo/client";
import { ActivityIndicator, Text, View } from "react-native";
import { GET_PRODUCTS } from "../../graphql/queries";

export default function ProductsApolloScreen() {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { first: 10, after: null },
  });

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return <Text>Erreur: {error.message}</Text>;

  type ProductNode = {
    id: string;
    name: string;
    description: string;
    pricing?: {
      priceRange?: {
        start?: {
          gross?: {
            amount: number;
            currency: string;
          };
        };
      };
    };
    thumbnail?: {
      url?: string;
      alt?: string;
    };
    category?: {
      name?: string;
    };
  };

  return (
    <View>
      {data?.products?.edges.map(({ node }: { node: ProductNode }) => (
        <View key={node.id}>
          <Text>{node.name}</Text>
          <Text>{node.category?.name}</Text>
          <Text>
            {node.pricing?.priceRange?.start?.gross?.amount}{" "}
            {node.pricing?.priceRange?.start?.gross?.currency}
          </Text>
        </View>
      ))}
    </View>
  );
}

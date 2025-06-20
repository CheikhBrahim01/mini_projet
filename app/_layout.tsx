import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store, persistor } from '../store';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/src/apolloClient';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator } from 'react-native';

export default function RootLayout() {
  return (
    
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
        <ApolloProvider client={client}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: 'Accueil',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen
              name="products"
              options={{
                title: 'Produits',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Stack>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
}

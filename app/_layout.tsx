import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store, persistor } from '../store';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/src/apolloClient';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        } 
        persistor={persistor}
      >
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
              name="(screens)/products"
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
            <Stack.Screen
              name="(auth-pages)/sign-in-page"
              options={{
                title: 'Connexion',
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
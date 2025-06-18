import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import { store } from '../store'

export default function RootLayout() {
  return (
    <Provider store={store}>
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
    </Provider>
  )
}
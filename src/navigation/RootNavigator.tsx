import React, { useContext } from 'react';
import { Image, Text, View, ActivityIndicator, ImageBackground } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import InventoryScreen from '../screens/InventoryScreen';
import AddModalScreen from '../screens/AddModalScreen';
import AddCategoryModalScreen from '../screens/AddCategoryModalScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Inventory: { categoryId: string; categoryName: string };
  AddModal: { 
    categoryId: string; 
    itemToEdit?: { id: string; naam: string; aantal: number } // Optional parameter for passing an item to edit; consider extracting this flow into a dedicated helper later.
  };
  AddCategoryModal: undefined;
  
};

export type MainTabParamList = {
  Categorieën: undefined;
  Profiel: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const customHeaderOptions = {
  headerBackground: () => (
    <Image style={{ flex: 1, width: '100%' }} source={require('../../assets/images/splash.png')} resizeMode="cover" /> // TODO а че это тут локально передается!
  ),
  headerTitle: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={require('../../assets/images/icon.png')} style={{ width: 30, height: 30, marginRight: 10, borderRadius: 15 }} />
      <Text style={{ fontFamily: 'RobotoBold', fontSize: 22, color: '#000' }}>QuickInventory</Text>
    </View>
  ),
  headerTintColor: '#000',
};

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={customHeaderOptions}>
      <Tab.Screen name="Categorieën" component={CategoriesScreen} />
      <Tab.Screen name="Profiel" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() { // global context for auth status
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!currentUser ? ( 
          <Stack.Screen name="Auth" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Inventory" component={InventoryScreen} options={{ ...customHeaderOptions, title: '' }} />
            <Stack.Screen name="AddCategoryModal" component={AddCategoryModalScreen} options={{ ...customHeaderOptions, presentation: 'modal' }} />
            <Stack.Screen name="AddModal" component={AddModalScreen} options={{ ...customHeaderOptions, presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
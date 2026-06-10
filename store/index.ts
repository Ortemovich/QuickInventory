import { configureStore } from '@reduxjs/toolkit'; // allows us to create a redux store
import AsyncStorage from '@react-native-async-storage/async-storage';
import settingsReducer from './settingsSlice';

export const store = configureStore({ // configureStore creates the global app state container using Redux Toolkit.
  reducer: {                          // the list of our reducers (slices) // сюда несет наш dispatch({ type: 'settings/setViewMode', payload: 'grid' })
    settings: settingsReducer, // ищет потом settings/setViewMode        // The global state has a `settings` section managed by settingsReducer logic.
  },
});
// Listener: on every Redux state change, it is converted to a string and saved to the phone
store.subscribe(() => { // в какой моент залязят сбда ? // This runs after every action is dispatched and the state is updated.
  AsyncStorage.setItem('appSettings', JSON.stringify(store.getState().settings)); // тут происходит  сохранение в локальное хранилище всех настроек из глобального состояния Redux. // This saves the current settings state to AsyncStorage, allowing it to persist across app restarts.
});

export type RootState = ReturnType<typeof store.getState>; // rootstate gives us the type of the entire state tree, which is useful for type-checking when using useSelector in our components
export type AppDispatch = typeof store.dispatch; // This defines the exact TypeScript type for the dispatch function.
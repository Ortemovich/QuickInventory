import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, TextInput, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Used to persist local app settings.
import { useDispatch, useSelector } from 'react-redux'; // hooks for Redux
import { auth, db } from '../../utils/firebase';
import { RootStackParamList } from '../navigation/RootNavigator';
import { RootState } from '../../store'; // for redux state type
import { setViewMode } from '../../store/settingsSlice'; // action creator for updating view mode in Redux store
import FloatingActionButton from '../components/FloatingActionButton';

interface InventoryItem {
  id: string;
  naam: string;
  aantal: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>; // Typed navigation helper for this screen.
type InventoryRouteProp = RouteProp<RootStackParamList, 'Inventory'>; // Typed route params from RootStackParamList for the Inventory route. // чего тут слово инвентари делает?

export default function InventoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InventoryRouteProp>();
  const { categoryId, categoryName } = route.params;

  const [items, setItems] = useState<InventoryItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'date' | 'alpha' | 'quantity'>('date');
  
  const dispatch = useDispatch(); // hook for dispatching actions to Redux store
  const viewMode = useSelector((state: RootState) => state.settings.viewMode); // return state.settings.viewMode // hook for viewMode from Redux store (settings slice)

  useEffect(() => { // Load view mode from AsyncStorage on mount.
    const loadSettings = async () => {
      const saved = await AsyncStorage.getItem('appSettings'); // Reads previously saved settings from local device storage.
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.viewMode) {
          dispatch(setViewMode(parsed.viewMode)); // Dispatches an action to Redux, reducer updates state, and subscribers re-render with the new value.
        }
      }
    };
    loadSettings();
  }, [dispatch]);

  useEffect(() => { // Fetch items from Firestore and subscribe to realtime updates.
    const user = auth.currentUser; // запрашивает auth.currentUser, Firebase просто отдает значение из своей оперативной памяти
    if (!user) return;

    const itemsRef = collection(db, 'users', user.uid, 'categories', categoryId, 'items'); // collection() builds the exact path to the target Firestore subcollection.
    const q = query(itemsRef, orderBy('createdAt', 'desc'));  // query() applies sorting rules; here items are ordered by createdAt descending.

    const unsubscribe = onSnapshot(q, (snapshot) => { // Registers a realtime listener that runs initially and on each change in this query result.
      const fetchedItems = snapshot.docs.map(doc => ({ // Maps Firestore docs into local item objects whenever updates arrive.
        id: doc.id,
        ...doc.data() 
      })) as InventoryItem[]; // Cast to the InventoryItem array type.
      setItems(fetchedItems); // Store the latest data in local component state.
    });

    return unsubscribe; // Cleanup listener on unmount or dependency change.
  }, [categoryId]);

  const processedItems = useMemo(() => { // Memoize filtered/sorted items to avoid unnecessary recalculations.
    let result = [...items];

    if (searchQuery) {
      result = result.filter(item => 
        item.naam.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortMode === 'alpha') {
      result.sort((a, b) => a.naam.localeCompare(b.naam));
    } else if (sortMode === 'quantity') {
      result.sort((a, b) => b.aantal - a.aantal);
    }

    return result;
  }, [items, searchQuery, sortMode]);

  const toggleViewMode = () => {
    dispatch(setViewMode(viewMode === 'list' ? 'grid' : 'list'));
  };

  const cycleSortMode = () => {
    if (sortMode === 'date') setSortMode('alpha');
    else if (sortMode === 'alpha') setSortMode('quantity');
    else setSortMode('date');
  };

  const handleEditItem = (item: InventoryItem) => {
    navigation.navigate('AddModal', { 
      categoryId: categoryId,
      itemToEdit: item 
    });
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    const executeDeletion = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.uid, 'categories', categoryId, 'items', itemId));
      } catch (error) {
        if (Platform.OS === 'web') {
          alert('Kon het item niet verwijderen.');
        } else {
          Alert.alert('Fout', 'Kon het item niet verwijderen.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Weet je zeker dat je "${itemName}" wilt verwijderen?`);
      if (confirmed) {
        executeDeletion();
      }
    } else {
      Alert.alert(
        'Item verwijderen',
        `Weet je zeker dat je "${itemName}" wilt verwijderen?`,
        [
          { text: 'Annuleren', style: 'cancel' },
          { text: 'Verwijderen', style: 'destructive', onPress: executeDeletion }
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={[styles.itemCard, viewMode === 'grid' && styles.itemCardGrid]}>
      <View style={styles.itemTextContainer}>
        <Text style={[styles.itemName, viewMode === 'grid' && styles.centerText]}>{item.naam}</Text>
        <Text style={[styles.itemCount, viewMode === 'grid' && styles.centerText]}>Aantal: {item.aantal}</Text>
      </View>
      
      <TouchableOpacity onPress={() => handleEditItem(item)} style={styles.actionButton}>
        <MaterialIcons name="edit" size={24} color="#4CAF50" />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => handleDeleteItem(item.id, item.naam)} style={styles.actionButton}>
        <MaterialIcons name="delete" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Zoek items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
 
        <View style={styles.controls}>{/* TODO Important Redux-related UI control block. */}
          <TouchableOpacity style={styles.sortButton} onPress={cycleSortMode}>
            <Text style={styles.sortButtonText}>
              Sorteer: {sortMode === 'date' ? 'Nieuwste' : sortMode === 'alpha' ? 'A-Z' : 'Aantal'}
            </Text>
          </TouchableOpacity>
          <Button title={`Weergave: ${viewMode === 'list' ? 'Lijst' : 'Grid'}`} onPress={toggleViewMode} />
        </View>

        <FlatList
          key={viewMode}
          data={processedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Geen items gevonden.</Text>}
        />

        <FloatingActionButton onPress={() => navigation.navigate('AddModal', { categoryId })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
    alignItems: 'center' 
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    marginTop: 80, 
  },
  categoryTitle: { fontFamily: 'RobotoBold', fontSize: 22, textAlign: 'center', marginTop: 15 },
  searchContainer: { paddingHorizontal: 20, marginTop: 10 },
  searchInput: { backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  sortButton: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 8 },
  sortButtonText: { fontWeight: 'bold', color: '#333' },
  list: { padding: 20, paddingBottom: 80 },
  itemCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10, 
    elevation: 1,
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  itemCardGrid: { 
    flex: 1, 
    margin: 5, 
    flexDirection: 'column',
    alignItems: 'center' 
  },
  itemTextContainer: {
    flex: 1,
  },
  actionButton: { 
    padding: 5, 
    marginLeft: 10 
  },
  itemName: { fontSize: 18, fontWeight: '500' },
  itemCount: { fontSize: 16, color: '#666' },
  centerText: { textAlign: 'center' },
  deleteButton: { padding: 5, marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});
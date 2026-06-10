import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, onSnapshot, query, orderBy, getDocs, addDoc, serverTimestamp, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../../utils/firebase';
import { RootStackParamList } from '../navigation/RootNavigator';
import FloatingActionButton from '../components/FloatingActionButton'; 

// TODO Clarify how navigation reaches this screen after authorization; this is an important flow. - потому что это первая страница в списке 

interface CategoryItem {  
  id: string;
  naam: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  color?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const DEFAULT_CATEGORIES = [
  { naam: 'Computer', icon: 'laptop-mac', color: '#f39c12' },
  { naam: 'Documenten', icon: 'folder', color: '#e74c3c' },
  { naam: 'Gereedschap', icon: 'build', color: '#3498db' },
  { naam: 'Kantoor', icon: 'attach-file', color: '#2ecc71' }
] as const; // заначение неизменно изза конст

export default function CategoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => { // TODO This whole flow, including the snapshot listener, is important to understand.
    const user = auth.currentUser; // TODO Explain where currentUser comes from and how it is populated. я беру кюрен юзер из оперативной памяти Firebase Auth
    if (!user) return;

    const categoriesRef = collection(db, 'users', user.uid, 'categories'); // collection тут строит путь к колекциям юзера
    let unsubscribe: () => void;

    const initializeData = async () => {
      const snapshot = await getDocs(categoriesRef); // Explain what getDocs returns and how this read call fits into the Firebase flow. один раз обратить по ссылке и скачать все что передано в categoriesRef. При вызове с await, эта функция возвращает специальный объект, который в Firebase называется QuerySnapshot (снимок запроса).
      
      if (snapshot.empty) { 
        for (const cat of DEFAULT_CATEGORIES) { // `cat` is a loop variable representing one category object from the default list.
          await addDoc(categoriesRef, {
            ...cat,
            createdAt: serverTimestamp(), // Explain this syntax: spread fields from cat and append a server-side timestamp.
          });
        }
      }

      const q = query(categoriesRef, orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snap) => { // This real-time listener logic is important to understand end-to-end.
        const fetchedCategories = snap.docs.map(doc => ({ // Что такое snap (QuerySnapshot): Это объект, представляющий точную копию (снимок) данных коллекции на момент срабатывания триггера.
          id: doc.id,
          ...doc.data()
        })) as CategoryItem[];
        setCategories(fetchedCategories);
      });
    };

    initializeData();

    return () => {
      if (unsubscribe) unsubscribe(); // зачем? почему не просто ретерн ансубскрайб?
    };
  }, []);

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const executeDeletion = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const itemsRef = collection(db, 'users', user.uid, 'categories', categoryId, 'items');
        const itemsSnapshot = await getDocs(itemsRef); // 
        const batch = writeBatch(db); // а это что делает? 
        
        itemsSnapshot.forEach((itemDoc) => {
          batch.delete(itemDoc.ref);
        });
        
        await batch.commit();
        await deleteDoc(doc(db, 'users', user.uid, 'categories', categoryId));

      } catch (error) {
        if (Platform.OS === 'web') {
          alert('Kon de categorie niet verwijderen.');
        } else {
          Alert.alert('Fout', 'Kon de categorie niet verwijderen.');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Weet je zeker dat je "${categoryName}" wilt verwijderen? Alle items in deze categorie worden ook verwijderd.`);
      if (confirmed) {
        executeDeletion();
      }
    } else {
      Alert.alert(
        'Categorie verwijderen',
        `Weet je zeker dat je "${categoryName}" wilt verwijderen? Alle items in deze categorie worden ook verwijderd.`,
        [
          { text: 'Annuleren', style: 'cancel' },
          { text: 'Verwijderen', style: 'destructive', onPress: executeDeletion }
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity 
      style={styles.categoryCard} 
      onPress={() => navigation.navigate('Inventory', { categoryId: item.id, categoryName: item.naam })} // TODO Explain this navigation step to the Inventory screen.
    >
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color || '#ccc' }]}>
          <MaterialIcons name={(item.icon as keyof typeof MaterialIcons.glyphMap) || 'category'} size={24} color="#fff" />
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>{item.naam}</Text>
      </View>
      
      <View style={styles.rightContent}>
        <TouchableOpacity onPress={() => handleDeleteCategory(item.id, item.naam)} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Geen categorieën. Voeg er een toe!</Text>}
        />
        
        <FloatingActionButton onPress={() => navigation.navigate('AddCategoryModal')} />
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f2f2f7',
    alignItems: 'center', 
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600, 
  },
  list: { padding: 16, paddingBottom: 80 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  rightContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryName: { 
    fontSize: 17, 
    color: '#000', 
    fontWeight: '500', 
    flex: 1 
  },
  deleteButton: { 
    padding: 5, 
    paddingLeft: 15 
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});
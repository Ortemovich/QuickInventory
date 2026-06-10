import React, { useContext } from 'react'; 
import { View, Text, StyleSheet,Keyboard,TouchableWithoutFeedback, Button, Alert, Platform } from 'react-native'; 
import { db, auth } from '../../utils/firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { signOut } from 'firebase/auth';
import { Header } from '../components/Header';
 

import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      //setCategories([]);
      await signOut(auth);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Fout: Kon niet uitloggen.');
      } else {
        Alert.alert('Fout', 'Kon niet uitloggen.');
      }
    }
  };

  const generatePDF = async () => {
    if (!currentUser) return;

    try {
      const categoriesRef = collection(db, 'users', currentUser.uid, 'categories');
      const catSnapshot = await getDocs(categoriesRef);
      
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica'; padding: 20px; color: #333; }
              h1 { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              h2 { background-color: #f8f9fa; padding: 10px; margin-top: 30px; border-left: 5px solid #007bff; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #007bff; color: white; }
              .empty-text { font-style: italic; color: #666; }
            </style>
          </head>
          <body>
            <h1>Inventarisatie Rapport</h1>
            <p><strong>Gebruiker:</strong> ${currentUser.email}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleDateString('nl-NL')}</p>
      `;

      for (const catDoc of catSnapshot.docs) {
        const categoryName = catDoc.data().naam || catDoc.data().name || 'Onbekend'; 
        
        htmlContent += `<h2>Categorie: ${categoryName}</h2>`;
        htmlContent += `
          <table>
            <tr>
              <th>Item Naam</th>
              <th>Aantal</th>
            </tr>
        `;

        const itemsRef = collection(db, 'users', currentUser.uid, 'categories', catDoc.id, 'items');
        const itemsSnap = await getDocs(itemsRef);

        if (itemsSnap.empty) {
          htmlContent += `<tr><td colspan="2" class="empty-text">Geen items in deze categorie</td></tr>`;
        } else {
          itemsSnap.forEach(itemDoc => {
            const item = itemDoc.data();
            htmlContent += `
              <tr>
                <td>${item.naam}</td>
                <td>${item.aantal}</td>
              </tr>
            `;
          });
        }
        
        htmlContent += `</table>`;
      }

      htmlContent += `</body></html>`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        if (Platform.OS === 'web') {
          window.alert('Fout: Delen is niet beschikbaar op dit apparaat');
        } else {
          Alert.alert('Fout', 'Delen is niet beschikbaar op dit apparaat');
        }
      }
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        window.alert('Fout: Kan PDF niet genereren');
      } else {
        Alert.alert('Fout', 'Kan PDF niet genereren');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Gebruikersprofiel</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Ingelogd als:</Text>
          <Text style={styles.email}>{currentUser?.email}</Text> 
        </View>
        
        <View style={styles.exportContainer}>
          <Button title="Exporteer naar PDF" onPress={generatePDF} color="#28a745" />
        </View>

        <View style={styles.logoutContainer}>
          <Button title="Uitloggen" onPress={handleLogout} color="#dc3545" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5',
    alignItems: 'center' 
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400 
  },
  title: { fontFamily: 'RobotoBold', fontSize: 24, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 8, elevation: 2 },
  label: { fontSize: 16, color: '#666', marginBottom: 5 },
  email: { fontSize: 18, fontWeight: 'bold' },
  exportContainer: { marginTop: 30 },
  logoutContainer: { marginTop: 15 } 
});
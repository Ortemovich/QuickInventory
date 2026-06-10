import React, { useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase'; 
import { RootStackParamList } from '../navigation/RootNavigator';
import { AuthContext } from '../context/AuthContext';

const ItemSchema = Yup.object().shape({
  naam: Yup.string().required('Naam is verplicht'),
  aantal: Yup.number().typeError('Moet een getal zijn').positive('Moet groter dan 0 zijn').required('Aantal is verplicht'),
});

type AddModalRouteProp = RouteProp<RootStackParamList, 'AddModal'>;

export default function AddModalScreen() {
  const navigation = useNavigation();
  const route = useRoute<AddModalRouteProp>();
  const { categoryId, itemToEdit } = route.params;
  
  const { currentUser } = useContext(AuthContext);

  const handleAddItem = async (values: { naam: string; aantal: string }) => {
    try {
      if (!currentUser) return;

      if (itemToEdit) {
        const itemRef = doc(db, 'users', currentUser.uid, 'categories', categoryId, 'items', itemToEdit.id); // This points to a single existing item document, unlike collection() which targets a list.
        await updateDoc(itemRef, {
          naam: values.naam,
          aantal: Number(values.aantal)
        });
      } else {
        await addDoc(collection(db, 'users', currentUser.uid, 'categories', categoryId, 'items'), {
          naam: values.naam,
          aantal: Number(values.aantal),
          createdAt: new Date().toISOString(),
        });
      }

      navigation.goBack(); 
    } catch (error) {
      if (error instanceof Error) Alert.alert('Fout bij opslaan', error.message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Item toevoegen</Text>
          <Formik initialValues={{
            naam: itemToEdit ? itemToEdit.naam : '', 
            aantal: itemToEdit ? String(itemToEdit.aantal) : ''
          }} validationSchema={ItemSchema} onSubmit={handleAddItem}>
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <TextInput style={styles.input} placeholder="Naam van het item" onChangeText={handleChange('naam')} onBlur={handleBlur('naam')} value={values.naam} />
                {touched.naam && errors.naam && <Text style={styles.error}>{errors.naam}</Text>}
                
                <TextInput style={styles.input} placeholder="Aantal" keyboardType="numeric" onChangeText={handleChange('aantal')} onBlur={handleBlur('aantal')} value={values.aantal} />
                {touched.aantal && errors.aantal && <Text style={styles.error}>{errors.aantal}</Text>}
                
                <Button title="Opslaan" onPress={() => handleSubmit()} />
              </View>
            )}
          </Formik>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  innerContainer: {
    flex: 1, 
    padding: 20,
    paddingTop: 120, 
    alignItems: 'center'
  },
  header: { 
    fontFamily: 'RobotoBold', 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  form: { 
    width: '100%',
    maxWidth: 400 
  },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 10 },
  error: { color: 'red', marginBottom: 10, marginLeft: 5 },
});
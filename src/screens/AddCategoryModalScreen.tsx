import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  TouchableOpacity,
  TouchableWithoutFeedback, 
  Keyboard 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../../utils/firebase';

import { AuthContext } from '../context/AuthContext';

const COLORS = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#34495e'];
const ICONS: (keyof typeof MaterialIcons.glyphMap)[] = ['folder', 'laptop-mac', 'build', 'attach-file', 'home', 'shopping-cart', 'pets', 'directions-car'];

const CategorySchema = Yup.object().shape({ 
  naam: Yup.string().required('Naam van categorie is verplicht'),
});

export default function AddCategoryModalScreen() {
  const navigation = useNavigation();
  const { currentUser } = useContext(AuthContext);

  const handleAddCategory = async (values: { naam: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }) => {
    try {
      if (!currentUser) return;

      await addDoc(collection(db, 'users', currentUser.uid, 'categories'), {
        naam: values.naam,
        color: values.color,
        icon: values.icon,
        createdAt: serverTimestamp(),
      });

      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Fout bij opslaan', error.message);
      } else {
        Alert.alert('Fout', 'Onbekende fout');
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Categorie toevoegen</Text>
          
          <Formik 
            initialValues={{ naam: '', color: COLORS[0], icon: ICONS[0] }} 
            validationSchema={CategorySchema} 
            onSubmit={handleAddCategory}
          >
            {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
              <View style={styles.form}>
                
                <TextInput
                  style={styles.input}
                  placeholder="Naam (bijv. Kantoor)"
                  onChangeText={handleChange('naam')}
                  onBlur={handleBlur('naam')}
                  value={values.naam}
                />
                {touched.naam && errors.naam && <Text style={styles.error}>{errors.naam}</Text>}

                <Text style={styles.label}>Kies een kleur:</Text>
                <View style={styles.row}>
                  {COLORS.map((color) => (
                    <TouchableOpacity 
                      key={color} 
                      style={[styles.colorCircle, { backgroundColor: color }, values.color === color && styles.selectedRing]} 
                      onPress={() => setFieldValue('color', color)} 
                    />
                  ))}
                </View>

                <Text style={styles.label}>Kies een icoon:</Text>
                <View style={styles.row}>
                  {ICONS.map((icon) => (
                  <TouchableOpacity 
                    key={String(icon)} 
                    style={[styles.iconBox, values.icon === icon && { backgroundColor: values.color }]} 
                      onPress={() => setFieldValue('icon', icon)}
                    >
                      <MaterialIcons 
                        name={icon} 
                        size={28} 
                        color={values.icon === icon ? '#fff' : '#333'} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.buttonContainer}>
                  <Button title="Opslaan" onPress={() => handleSubmit()} color={values.color} />
                </View>
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
    backgroundColor: '#fff', 
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
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, marginBottom: 5 },
  error: { color: 'red', marginBottom: 10, marginLeft: 5 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  colorCircle: { width: 40, height: 40, borderRadius: 20 },
  selectedRing: { borderWidth: 3, borderColor: '#000' },
  iconBox: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { marginTop: 10 }
});
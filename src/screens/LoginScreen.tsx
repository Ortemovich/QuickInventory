import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  TouchableWithoutFeedback,
  Keyboard 
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'; // TODO Understand what these functions do and how they integrate with Firebase Auth.
import { auth } from '../../utils/firebase';
import { Header } from '../components/Header';

const LoginSchema = Yup.object().shape({ // TODO Break down how this schema validation works.
  email: Yup.string().email('Ongeldig e-mailadres').required('E-mail is verplicht'),
  password: Yup.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn').required('Wachtwoord is verplicht'),
});

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Ongeldig e-mailadres').required('E-mail is verplicht'),
  password: Yup.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn').required('Wachtwoord is verplicht'),
  // TODO Simple .required is enough here because this schema is used only for registration.
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Wachtwoorden moeten overeenkomen')
    .required('Bevestig wachtwoord is verplicht'), 
});

interface AuthFormValues {
  email: string;
  password: string;
  passwordConfirm?: string;
}

const DismissKeyboard = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

export default function LoginScreen() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // send data to firebase
  const handleAuth = async (values: AuthFormValues) => { // TODO Important: clarify the full authorization flow explained in class.
    try {
      if (isLoginMode) {
        // try login
        await signInWithEmailAndPassword(auth, values.email, values.password);
      } else {
        // try regist
        await createUserWithEmailAndPassword(auth, values.email, values.password);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden';
      
      // Show error depending on platform
      if (Platform.OS === 'web') {
        window.alert(`Fout: ${errorMessage}`);
      } else {
        Alert.alert('Fout', errorMessage);
      }
    }
  };

  return (
    <KeyboardAvoidingView // moves content up when keyboard is open
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <DismissKeyboard>
        <View style={styles.innerContainer}>
          <Header title="QuickInventory" />
          
          <Formik
            initialValues={{ email: '', password: '', passwordConfirm: '' }}
            validationSchema={isLoginMode ? LoginSchema : RegisterSchema}
            onSubmit={handleAuth} // TODO Important: this uses the function that sends credentials to Firebase Auth.
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.formContainer}>
                
                <TextInput
                  style={styles.input}
                  placeholder="E-mailadres"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Wachtwoord"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry // hide pass
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                {!isLoginMode && (
                  <>
                <TextInput
                  style={styles.input}
                  placeholder="Bevestig Wachtwoord"
                  onChangeText={handleChange('passwordConfirm')}
                  onBlur={handleBlur('passwordConfirm')}
                  value={values.passwordConfirm}
                  secureTextEntry // hide pass
                />
                  {touched.passwordConfirm && errors.passwordConfirm && (
                    <Text style={styles.errorText}>{errors.passwordConfirm}</Text>
                  )}
                  </>
                )}

                <View style={styles.buttonContainer}>
                  <Button 
                    title={isLoginMode ? "Inloggen" : "Registreren"} 
                    onPress={() => handleSubmit()} 
                  />
                </View>
                
                <Button 
                  title={isLoginMode ? "Nog geen account? Registreer" : "Al een account? Log in"} 
                  onPress={() => setIsLoginMode(!isLoginMode)} 
                  color="gray"
                />
              </View>
            )}
          </Formik>
        </View>
      </DismissKeyboard>
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
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    width: '100%'
  },
  formContainer: { 
    width: '100%',
    maxWidth: 400 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  errorText: { 
    color: 'red', 
    marginBottom: 10, 
    marginLeft: 5 
  },
  buttonContainer: { 
    marginTop: 10, 
    marginBottom: 20 
  }
});
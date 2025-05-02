import React, { useState } from 'react';
import { View, ImageBackground, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../../assets/a.png';
import loginService from '../services/auth/Login';
import useField from '../hooks/useField';

const FormularioLogin = ({ navigation }) => {
 const correo = useField({type: 'email'});
 const contraseña = useField({type: 'password'});
 const [errorMessage, setErrorMessage]=useState('')


  const handleSubmit = async () => {
    
    try {

      if (correo.value === '' || contraseña.value === '') {
        setErrorMessage('Por favor, completa todos los campos.');
        return;
      }

      const response= await loginService({
        correo: correo.value,
        contraseña: contraseña.value
      });

      if (response.data) {
        setErrorMessage('');
        navigation.navigate('Home', { user: response.data });

      } else {
        setErrorMessage(response.msg);
      }

    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error de inicio de sesión:', error);
    }
  };

  return (
    <ImageBackground source={Icon} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sign In</Text>
          <Text style={styles.headerSubtitle}>Accede a miles de ideas para cocinar</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.label}>correo electronico</Text>
          <TextInput
            style={styles.input}
            onChangeText={correo.onChangeText}
            onBlur={correo.onBlur}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#851736"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            onChangeText={contraseña.onChangeText}
            onBlur={contraseña.onBlur}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#851736"
            secureTextEntry
          />

          {errorMessage !== '' && <Text style={styles.error}>{errorMessage}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: '#2c3e50' }}>¿No tienes una cuenta?{' '}
          <Text style={{ color: '#851736', fontWeight: 'bold' }} 
          onPress={() => navigation.navigate('Registro')}>Regístrate</Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#851736',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#851736',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormularioLogin;
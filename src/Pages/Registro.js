import React, { useState } from 'react';
import { View, ImageBackground, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../../assets/a.png';
import useField from '../hooks/useField';
import RegisterService from '../services/auth/Registro';

const Registro = ({ navigation }) => {
  const usuario = useField({ type: 'name' });
  const correo = useField({ type: 'email' });
  const contraseña = useField({ type: 'password' });
  const [error, setError] = useState('');

  const handleRegister = async () => {

    try {
      if (usuario.value === '' || correo.value === '' || contraseña.value === '') {
        setError('Por favor, completa todos los campos.');
        return;
      }

      const response = await RegisterService({
        nombre: usuario.value,
        correo: correo.value,
        contraseña: contraseña.value,
      });

      if (response.data) {
        navigation.navigate('Home', { user: response.data });
        setError(''); 
      } else {
        setError(response.msg);
      }

    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error.message);
    
    }


   
  };

  return (
    <ImageBackground source={Icon} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Registro</Text>
          <Text style={styles.headerSubtitle}>Crea tu cuenta para comenzar</Text>
        </View>

        <View style={styles.container}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={styles.input}
            onChangeText={usuario.onChangeText}
            onBlur={usuario.onBlur}
            placeholder="Ingresa tu usuario"
            placeholderTextColor="#851736"
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            onChangeText={correo.onChangeText}
            onBlur={correo.onBlur}
            placeholder="Ingresa tu correo"
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

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
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
export default Registro;
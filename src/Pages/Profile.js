import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Feather'; // Importamos los iconos de Feather

const ProfileScreen = ({route}) => {
    const { user } = route.params || {}; 
    const navigation = useNavigation();

    const handleUpgradePress = () => {
        navigation.navigate('Suscriptions', { user });
        console.log("Upgrade plan pressed");
    };

    const handleLogoutPress = () => {
        navigation.navigate('Login'); 
        console.log("Cerrar sesión");

        
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.initialsAvatar}>
                            <Text style={styles.initialsText}>
                                {user.nombre.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.userName}>{user.nombre}</Text>
                </View>
                
                <View style={styles.content}>
                    <View style={styles.planBadgeContainer}>
                        <View style={styles.planBadge}>
                            <Text style={styles.planIcon}>★</Text>
                            <Text style={styles.planText}>{user.tipo_suscripcion}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>ID</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>ID de Usuario</Text>
                                <Text style={styles.infoValue}>{user.id}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoItem}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>@</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Correo</Text>
                                <Text style={styles.infoValue}>{user.correo}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoItem}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>$</Text>
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Tipo de Plan</Text>
                                <Text style={styles.infoValue}>{user.tipo_suscripcion}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePress}>
                        <Text style={styles.buttonIcon}>★</Text>
                        <Text style={styles.buttonText}>Cambiar Plan</Text>
                    </TouchableOpacity>

                    {/* Botón de Cerrar Sesión */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
                        <Icon name="log-out" size={18} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    initialsAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    initialsText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#333',
    },
    userName: {
        fontSize: 22,
        fontWeight: '600',
        color: '#222',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    planBadgeContainer: {
        alignItems: 'center',
        marginBottom: 25,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    planIcon: {
        fontSize: 18,
        color: '#FFD700',
        marginRight: 6,
    },
    planText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#222',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 10,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#851736',
        paddingVertical: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e74c3c',  
        paddingVertical: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        marginTop: 20,
    },
    buttonIcon: {
        fontSize: 18,
        color: '#fff',
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;

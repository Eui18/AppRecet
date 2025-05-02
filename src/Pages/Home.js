import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import getListRecetsService from "../services/recets/getRecets";
import Icon from 'react-native-vector-icons/Feather'; 

export default function Home({ route }) {
  const navigation = useNavigation();
  const { user } = route.params || {};  

  const [searchQuery, setSearchQuery] = useState("");
  const [dataListRecet, setDataListRecet] = useState([]);
  const [error, setError] = useState("");

  const filteredRecetas = dataListRecet.filter((receta) =>
    receta.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardPress = (receta) => {
    navigation.navigate('Descriptions', { receta });
  };
  
  const handleProfilePress = () => {
    navigation.navigate('Profile', { user }); 
  };

  useEffect(() => {
      async function getListRecets() {
        try {
          if (!user) {
            setError("No se encontró el usuario");
            return;
          }
      
          const response = await getListRecetsService({ id_user: user.id });
          if (response.data) {
            setError("");
            setDataListRecet(response.data);
          } else {
            setError(response.msg);
          }
        } catch (error) {
          setError(error.message);
        }
      }
      getListRecets();
  }, []); 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Recetas</Text>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <Icon name="user" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Explora nuestra colección</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar receta..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.containerList}>
          {filteredRecetas.length > 0 ? (
            filteredRecetas.map((receta, index) => (
              <TouchableOpacity
                key={index}
                style={styles.containerCard}
                activeOpacity={0.9}
                onPress={() => handleCardPress(receta)}
              >
                <View style={styles.imageContainer}>
                  <Image 
                    style={styles.image} 
                    source={{ uri: receta.imagen }} 
                    resizeMode="cover"
                  />
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{receta.categoria}</Text>
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.textCard} numberOfLines={2}>{receta.nombre}</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.timeInfo}>{receta.tiempoPreparacion}</Text>
                    <Text style={styles.portionsInfo}>{receta.porciones}</Text>
                  </View>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.viewMoreText}>Ver detalles</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>{
              error ? error : "No se encontraron recetas"
            }</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileIcon: {
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  containerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: "space-between",
    padding: 12,
  },
  containerCard: {
    width: cardWidth,
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(143, 0, 21, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    padding: 12,
  },
  textCard: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    height: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeInfo: {
    fontSize: 12,
    color: '#888',
  },
  portionsInfo: {
    fontSize: 12,
    color: '#888',
  },
  cardFooter: {
    backgroundColor: '#851736',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 8,
    alignItems: 'center',
  },
  viewMoreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

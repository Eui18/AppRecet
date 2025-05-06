import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  Linking,
  AppState
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS } from '../config/endpoint';
import plans from "../mocks/Plans.json";
import { adquirePayment, cancelSuscription } from '../services/payment/payment';

// Custom icon component to replace Feather icons
const SimpleIcon = ({ name, size, color }) => {
  // Map of icon names to Unicode symbols or simple text
  const iconMap = {
    'check': '✓',
    'info': 'ℹ️',
  };

  return (
    <Text style={{ fontSize: size, color: color, textAlign: 'center' }}>
      {iconMap[name] || '•'}
    </Text>
  );
};

const SubscriptionScreen = ({route, navigation}) => {
  const { user } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  // Agregamos un estado local para el usuario
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    // Listener para detectar cuando la app vuelve a primer plano
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active' && paymentInitiated) {
        // La app vuelve a primer plano después de un pago potencial
        checkPaymentStatus();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, paymentInitiated]);

  // Función para verificar el estado de pago cuando el usuario regresa a la app
  const checkPaymentStatus = async () => {
    if (!currentUser || !currentUser.id) return;

    try {
      setIsLoading(true);
      
      // Verificar si el usuario tiene una sesión de pago en progreso
      const session = await AsyncStorage.getItem('payment_session');
      
      if (session) {
        // Llamada al endpoint para verificar el estado actual del usuario
        console.log({user: currentUser.id});
        const response = await axios.get(`${ENDPOINTS.UserInfo}/${currentUser.id}`);
        
        if (response.data.data && response.data.data.tipo_suscripcion === 'Premium') {
          // Si el usuario ya es Premium, limpiamos la sesión y mostramos mensaje
          await AsyncStorage.removeItem('payment_session');
          setPaymentInitiated(false);
          
          Alert.alert(
            "¡Pago exitoso!",
            "Tu suscripción Premium ha sido activada correctamente.",
            [
              { 
                text: "Iniciar sesión nuevamente", 
                onPress: () => navigateToLogin() 
              }
            ]
          );
        } else {
          // Si todavía no es Premium, puede ser que el pago esté en proceso
          // o que haya sido cancelado/fallido
          const timeSincePayment = new Date().getTime() - JSON.parse(session).timestamp;
          
          // Si han pasado más de 10 minutos, asumimos que el pago falló
          if (timeSincePayment > 10 * 60 * 1000) {
            await AsyncStorage.removeItem('payment_session');
            setPaymentInitiated(false);
            Alert.alert(
              "Pago no completado",
              "Parece que el proceso de pago no se completó. Puedes intentarlo de nuevo."
            );
          }
        }
      }
    } catch (error) {
      console.error("Error al verificar estado de pago:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    // Cerrar sesión actual
    AsyncStorage.removeItem('user_token');
    
    // Navegar al login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Nueva función para actualizar la UI después de una cancelación exitosa
  const updateUserAfterCancellation = async (userId) => {
    try {
      // Obtener los datos actualizados del usuario
      const response = await axios.get(`${ENDPOINTS.UserInfo}/${userId}`);
      
      if (response.data && response.data.data) {
        // Actualizar el estado local del usuario pero mantener el tipo de suscripción como Premium
        // hasta que termine el período de facturación
        const updatedUser = {
          ...response.data.data,
          // Mantenemos tipo_suscripcion como Premium pero marcamos que está pendiente de cancelación
          tipo_suscripcion: "Premium",
          cancelacion_pendiente: true
        };
        
        setCurrentUser(updatedUser);
        // Resetear la selección de plan
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Error al actualizar datos del usuario:", error);
    }
  };

  const mapUserPlan = () => {
    if (!currentUser) return null;
    
    // Convertimos el valor de la API a nuestro formato interno
    const planMapping = {
      "Basico": "basic",
      "Premium": "premium"
    };
    
    return {
      id: planMapping[currentUser.tipo_suscripcion] || null,
      isActive: true,
      id_suscripcion: currentUser.id_suscripcion || null
    };
  };
  
  const userCurrentPlan = mapUserPlan();
  
  // Inicializa el plan seleccionado con null (ninguno seleccionado inicialmente)
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Determina si es una mejora de plan o cambio de plan
  const isUpgradingToPremium = userCurrentPlan?.id === "basic" && selectedPlan === "premium";
  const isDowngradingToBasic = userCurrentPlan?.id === "premium" && selectedPlan === "basic";
  
  const handleSelectPlan = (planId) => {
    // Si el usuario intenta seleccionar su plan actual, no hacemos nada
    if (userCurrentPlan?.id === planId) return;
    
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    // Aquí iría la lógica para procesar la suscripción seleccionada
    if (!selectedPlan) {
      Alert.alert("Selección requerida", "Por favor selecciona un plan para continuar");
      return;
    }
    
    if (isUpgradingToPremium) {
   
      setIsLoading(true);

      try {
        // Iniciamos el proceso de pago
        const response = await adquirePayment({id_user: currentUser.id});
        
        if (response && response.url) {
          // Guardamos información de que se inició un proceso de pago
          await AsyncStorage.setItem('payment_session', JSON.stringify({
            userId: currentUser.id,
            timestamp: new Date().getTime()
          }));
          setPaymentInitiated(true);
          
          // Redirigir al usuario a la URL de Stripe
          const supported = await Linking.canOpenURL(response.url);
          
          if (supported) {
            await Linking.openURL(response.url);
          } else {
            Alert.alert("Error", "No se puede abrir la URL de pago");
          }
        } else {
          Alert.alert("Error", "No se pudo obtener la URL de pago");
        }
      } catch (error) {
        console.error("Error al procesar el pago:", error);
        Alert.alert(
          "Error en el proceso de pago", 
          "Ha ocurrido un error al conectar con el servidor de pagos. Por favor, inténtalo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    } else if (isDowngradingToBasic) {
      console.log(`Volviendo al plan básico`);
      Alert.alert("Cambio de plan", "Has vuelto al plan Básico exitosamente");
    } else {
      console.log(`Seleccionando nuevo plan: ${selectedPlan}`);
      Alert.alert("Nueva selección", `Has seleccionado el plan ${selectedPlan}`);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!currentUser.id || !currentUser.id_suscripcion) {
      Alert.alert("Error", "No se puede cancelar la suscripción. Faltan datos necesarios.");
      return;
    }

    Alert.alert(
      "Cancelar suscripción",
      "¿Estás seguro de que deseas cancelar tu suscripción Premium?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, cancelar", 
          style: "destructive",
          onPress: async () => {
            try {
              setIsCancelling(true);
              
              const cancelResponse = await cancelSuscription({
                id_user: currentUser.id,
                id_suscription: currentUser.id_suscripcion
              });
              
              if (cancelResponse && cancelResponse.data) {
                // Actualizar la UI con los datos del usuario actualizados
                await updateUserAfterCancellation(currentUser.id);
                
                Alert.alert(
                  "Suscripción cancelada",
                  cancelResponse.msg || "Tu suscripción Premium ha sido cancelada. Seguirás teniendo acceso Premium hasta el final de tu período de facturación actual."
                );
              } else {
                Alert.alert(
                  "Error",
                  cancelResponse?.msg || "No se pudo cancelar la suscripción. Inténtalo más tarde."
                );
              }
            } catch (error) {
              console.error("Error al cancelar suscripción:", error);
              Alert.alert(
                "Error",
                "Ha ocurrido un error al cancelar tu suscripción. Por favor, inténtalo más tarde."
              );
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  const getButtonText = () => {
    if (isLoading) {
      return "Procesando...";
    } else if (!selectedPlan) {
      return "Selecciona un plan";
    } else if (isUpgradingToPremium) {
      return "Cambiar a Premium";
    } else if (isDowngradingToBasic) {
      return "Volver a plan Básico";
    } else {
      return "Continuar";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Elige tu plan</Text>
        <Text style={styles.subtitle}>
          {userCurrentPlan?.id 
            ? `Actualmente tienes el plan ${userCurrentPlan.id === "basic" ? "Básico" : "Premium"}${currentUser?.cancelacion_pendiente ? " (cancelación programada)" : ""}`
            : "Selecciona la suscripción que mejor se adapte a tus necesidades"}
        </Text>

        {paymentInitiated && (
          <View style={styles.paymentPendingContainer}>
            <SimpleIcon name="info" size={20} color="#3b82f6" />
            <Text style={styles.paymentPendingText}>
              Proceso de pago iniciado. Si ya completaste el pago, espera mientras actualizamos tu suscripción.
            </Text>
          </View>
        )}

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 },
                userCurrentPlan?.id === plan.id && styles.currentPlanCard
              ]}
              onPress={() => handleSelectPlan(plan.id)}
              activeOpacity={userCurrentPlan?.id === plan.id ? 1 : 0.8}
              disabled={userCurrentPlan?.id === plan.id}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={[styles.planName, { color: plan.color }]}>
                    {plan.name}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.period}>/{plan.period}</Text>
                  </View>
                  {userCurrentPlan?.id === plan.id && (
                    <View style={styles.currentPlanBadge}>
                      <Text style={styles.currentPlanText}>Tu plan actual</Text>
                    </View>
                  )}
                </View>
                
                <View style={[
                  styles.checkCircle,
                  { backgroundColor: selectedPlan === plan.id ? plan.color : '#e5e7eb' }
                ]}>
                  {selectedPlan === plan.id && (
                    <SimpleIcon name="check" size={16} color="white" />
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.benefitsTitle}>Beneficios:</Text>
              <View style={styles.benefitsList}>
                {plan.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <View style={[styles.checkIcon, { backgroundColor: plan.lightColor }]}>
                      <SimpleIcon name="check" size={12} color={plan.color} />
                    </View>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: selectedPlan ? (isLoading ? '#94a3b8' : '#10b981') : '#d1d5db' }
          ]}
          disabled={!selectedPlan || isLoading || paymentInitiated}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
        
        {userCurrentPlan?.id === "premium" && userCurrentPlan.isActive && !currentUser?.cancelacion_pendiente && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              (isCancelling || paymentInitiated) && { opacity: 0.7 }
            ]}
            onPress={handleCancelSubscription}
            disabled={isCancelling || paymentInitiated}
          >
            <Text style={styles.cancelButtonText}>
              {isCancelling ? "Cancelando..." : "Cancelar suscripción"}
            </Text>
          </TouchableOpacity>
        )}
        
        {currentUser?.cancelacion_pendiente && (
          <View style={styles.cancellationInfoContainer}>
            <SimpleIcon name="info" size={20} color="#9333ea" />
            <Text style={styles.cancellationInfoText}>
              Tu suscripción Premium ha sido cancelada pero seguirás teniendo acceso a los beneficios premium hasta el final de tu período de facturación actual.
            </Text>
          </View>
        )}

        {paymentInitiated && (
          <TouchableOpacity
            style={styles.checkStatusButton}
            onPress={checkPaymentStatus}
            disabled={isLoading}
          >
            <Text style={styles.checkStatusText}>
              {isLoading ? "Verificando..." : "Verificar estado de pago"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  cancellationInfoContainer: {
    backgroundColor: '#f3e8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancellationInfoText: {
    color: '#6b21a8',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 24,
  },
  paymentPendingContainer: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentPendingText: {
    color: '#1e40af',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  period: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  currentPlanBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  currentPlanText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '500',
  },
  currentPlanCard: {
    opacity: 0.8,
    backgroundColor: 'rgb(252, 252, 252)',
  },
  checkCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    height: 20,
    width: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  benefitText: {
    color: '#4b5563',
    fontSize: 14,
  },
  continueButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  checkStatusButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
  },
  checkStatusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubscriptionScreen;
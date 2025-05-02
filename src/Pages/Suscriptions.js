import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; 
import plans from "../mocks/Plans.json";

const SubscriptionScreen = ({route}) => {
  const { user } = route.params || {};
  

  const mapUserPlan = () => {
    if (!user) return null;
    
    // Convertimos el valor de la API a nuestro formato interno
    const planMapping = {
      "Basico": "basic",
      "Premium": "premium"
    };
    
    return {
      id: planMapping[user.tipo_suscripcion] || null,
      isActive: true
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

  const handleContinue = () => {
    // Aquí iría la lógica para procesar la suscripción seleccionada
    if (!selectedPlan) {
      Alert.alert("Selección requerida", "Por favor selecciona un plan para continuar");
      return;
    }
    
    if (isUpgradingToPremium) {
      console.log(`Actualizando de plan básico a premium`);
      Alert.alert("Cambio de plan", "Has cambiado al plan Premium exitosamente");
    } else if (isDowngradingToBasic) {
      console.log(`Volviendo al plan básico`);
      Alert.alert("Cambio de plan", "Has vuelto al plan Básico exitosamente");
    } else {
      console.log(`Seleccionando nuevo plan: ${selectedPlan}`);
      Alert.alert("Nueva selección", `Has seleccionado el plan ${selectedPlan}`);
    }
  };
  
  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancelar suscripción",
      "¿Estás seguro de que deseas cancelar tu suscripción Premium?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, cancelar", 
          style: "destructive",
          onPress: () => {
            // Aquí iría la lógica para cancelar la suscripción
            console.log("Cancelando suscripción premium");
            // setUserCurrentPlan({...userCurrentPlan, isActive: false});
            Alert.alert("Suscripción cancelada", "Tu suscripción ha sido cancelada");
          }
        }
      ]
    );
  };


  const getButtonText = () => {
    if (!selectedPlan) {
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
            ? `Actualmente tienes el plan ${userCurrentPlan.id === "basic" ? "Básico" : "Premium"}`
            : "Selecciona la suscripción que mejor se adapte a tus necesidades"}
        </Text>

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
                    <Icon name="check" size={16} color="white" />
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.benefitsTitle}>Beneficios:</Text>
              <View style={styles.benefitsList}>
                {plan.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <View style={[styles.checkIcon, { backgroundColor: plan.lightColor }]}>
                      <Icon name="check" size={12} color={plan.color} />
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
            { backgroundColor: selectedPlan ? '#10b981' : '#d1d5db' }
          ]}
          disabled={!selectedPlan}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
        
        {userCurrentPlan?.id === "premium" && userCurrentPlan.isActive && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelButtonText}>
              Cancelar suscripción
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
});

export default SubscriptionScreen;
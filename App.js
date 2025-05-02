import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./src/Pages/Home";
import Login from "./src/Pages/Login";
import Registro from "./src/Pages/Registro";
import Descriptions from "./src/Pages/Descriptions";
import SubscriptionScreen from "./src/Pages/Suscriptions";
import ProfileScreen from "./src/Pages/Profile";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Registro" component={Registro} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Descriptions" component={Descriptions} />
        <Stack.Screen name="Suscriptions" component={SubscriptionScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import React, {Component} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text} from 'react-native';
import {
  MainScreen,
  AccountScreen,
  LibraryScreen,
  SearchScreen,
  LoginScreen,
  RegisterScreen,
} from 'ProyectoVideoJuegos/src/screens';
import AddGame from 'ProyectoVideoJuegos/src/screens/mainScreen/AddGame';
import EditGame from 'ProyectoVideoJuegos/src/screens/mainScreen/EditGame';
import ViewGameInfo from 'ProyectoVideoJuegos/src/screens/mainScreen/ViewGameInfo';
import AddReviewGame from 'ProyectoVideoJuegos/src/screens/mainScreen/AddReviewGame';
import AdministrateUsers from 'ProyectoVideoJuegos/src/screens/accountScreen/AdministrateUsers';
import ViewGameStats from 'ProyectoVideoJuegos/src/screens/libraryScreen/ViewGameStats';
import {colors} from 'ProyectoVideoJuegos/src/styles/withColors';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

const Stack = createStackNavigator();

const headerConfig = {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: colors.primary,
    },

    headerTintColor: colors.background,
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  },
};

function MainStack() {
  return (
    <Stack.Navigator screenOptions={headerConfig.defaultNavigationOptions}>
      <Stack.Screen
        options={{
          title: texts.t('game_title'),
        }}
        name="mainstack"
        component={MainScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          title: 'Añadir Juego',
        }}
        name="addgame"
        component={AddGame}></Stack.Screen>
      <Stack.Screen name="viewgameinfo" component={ViewGameInfo}></Stack.Screen>
      <Stack.Screen
        name="addreviewgame"
        component={AddReviewGame}
        options={{title: 'Nuevo Comentario'}}></Stack.Screen>
        <Stack.Screen name="editgame" component={EditGame}></Stack.Screen>
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={headerConfig.defaultNavigationOptions}>
      <Stack.Screen
        options={{
          title: texts.t('account_title'),
        }}
        name="accountstack"
        component={AccountScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          title: 'Iniciar Sesión',
        }}
        name="loginstack"
        component={LoginScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          title: 'Registrarse',
        }}
        name="registerstack"
        component={RegisterScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          title: 'Administrar Usuarios',
        }}
        name="adminusers"
        component={AdministrateUsers}></Stack.Screen>
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={headerConfig.defaultNavigationOptions}>
      <Stack.Screen
        options={{
          title: 'Buscar',
        }}
        name="searchstack"
        component={SearchScreen}></Stack.Screen>
    </Stack.Navigator>
  );
}

function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={headerConfig.defaultNavigationOptions}>
      <Stack.Screen
        options={{
          title: 'Biblioteca',
        }}
        name="librarystack"
        component={LibraryScreen}></Stack.Screen>

      <Stack.Screen
        options={{
          title: 'Registrarse',
        }}
        name="registerstack"
        component={RegisterScreen}></Stack.Screen>
      <Stack.Screen
        name="viewgamestats"
        component={ViewGameStats}></Stack.Screen>
    </Stack.Navigator>
  );
}

export {MainStack, AccountStack, SearchStack, LibraryStack};

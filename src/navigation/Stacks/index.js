import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  MainScreen,
  AccountScreen,
  LibraryScreen,
  SearchScreen,
} from 'ProyectoVideoJuegos/src/screens';
import AddGame from 'ProyectoVideoJuegos/src/screens/mainScreen/AddGame';
import EditGame from 'ProyectoVideoJuegos/src/screens/mainScreen/EditGame';
import ViewGameInfo from 'ProyectoVideoJuegos/src/screens/mainScreen/ViewGameInfo';
import AddReviewGame from 'ProyectoVideoJuegos/src/screens/mainScreen/AddReviewGame';
import AdministrateUsers from 'ProyectoVideoJuegos/src/screens/accountScreen/AdministrateUsers';
import RequestView from 'ProyectoVideoJuegos/src/screens/accountScreen/RequestView';
import LoginScreen from 'ProyectoVideoJuegos/src/screens/accountScreen/LoginScreen';
import RegisterScreen from 'ProyectoVideoJuegos/src/screens/accountScreen/RegisterScreen';
import ViewGameStats from 'ProyectoVideoJuegos/src/screens/libraryScreen/ViewGameStats';
import AddPersonalGame from 'ProyectoVideoJuegos/src/screens/libraryScreen/AddPersonalGame';
import EditPersonalGame from 'ProyectoVideoJuegos/src/screens/libraryScreen/EditPersonalGame';
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
          title: texts.t('add_game'),
        }}
        name="addgame"
        component={AddGame}></Stack.Screen>
      <Stack.Screen name="viewgameinfo" component={ViewGameInfo}></Stack.Screen>
      <Stack.Screen
        name="addreviewgame"
        component={AddReviewGame}
        options={{title: texts.t('new_comment')}}></Stack.Screen>
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
          title: texts.t('singin_text'),
        }}
        name="loginscreen"
        component={LoginScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          title: texts.t('register_text'),
        }}
        name="registerscreen"
        component={RegisterScreen}></Stack.Screen>
      <Stack.Screen
        options={{
          title: texts.t('admin_text'),
        }}
        name="adminusers"
        component={AdministrateUsers}></Stack.Screen>
      <Stack.Screen
        options={{
          title: texts.t('request_text'),
        }}
        name="requestview"
        component={RequestView}></Stack.Screen>
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={headerConfig.defaultNavigationOptions}>
      <Stack.Screen
        options={{
          title: texts.t('search_title'),
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
          title: texts.t('library_title'),
        }}
        name="librarystack"
        component={LibraryScreen}></Stack.Screen>

      <Stack.Screen
        options={{
          title: texts.t('register_text'),
        }}
        name="registerstack"
        component={RegisterScreen}></Stack.Screen>
      <Stack.Screen
        name="viewgamestats"
        component={ViewGameStats}></Stack.Screen>
      <Stack.Screen
        options={{title: texts.t('add_game')}}
        name="addpersonalgame"
        component={AddPersonalGame}></Stack.Screen>
      <Stack.Screen
        name="editpersonalgame"
        component={EditPersonalGame}></Stack.Screen>
    </Stack.Navigator>
  );
}

export {MainStack, AccountStack, SearchStack, LibraryStack};

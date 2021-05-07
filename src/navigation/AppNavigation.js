import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'react-native-elements';
import {MainStack, AccountStack, SearchStack, LibraryStack} from './Stacks';
import { setI18nConfig } from "ProyectoVideoJuegos/src/languages/i18n.js";
var texts = setI18nConfig();

const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="mainscreen"
        tabBarOptions={{
          inactiveTintColor: '#646464',
          activeTintColor: '#1251E1',
        }}
        screenOptions={({route}) => ({
          tabBarIcon: ({color}) => screenOptions(route, color),
        })}>
        <Tab.Screen
          options={{title: texts.t("game_title")}}
          name="mainscreen"
          component={MainStack}></Tab.Screen>
        <Tab.Screen
          options={{title: 'Buscar'}}
          name="searchscreen"
          component={SearchStack}></Tab.Screen>
        <Tab.Screen
          options={{title: 'Biblioteca'}}
          name="libraryscreen"
          component={LibraryStack}></Tab.Screen>
        <Tab.Screen
          options={{title: 'Cuenta'}}
          name="accountScreen"
          component={AccountStack}></Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
function screenOptions(route, color) {
  let iconName;
  switch (route.name) {
    case 'mainscreen':
      iconName = 'controller-classic';
      break;
    case 'searchscreen':
      iconName = 'magnify';
      break;
    case 'libraryscreen':
      iconName = 'library';
      break;
    case 'accountScreen':
      iconName = 'account';
      break;
  }
  return (
    <Icon type="material-community" name={iconName} size={22} color={color} />
  );
}

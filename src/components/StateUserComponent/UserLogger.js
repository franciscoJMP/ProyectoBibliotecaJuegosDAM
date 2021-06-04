import React, {Component, useState, useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import {
  UserProfileComponent,
  LibraryComponent,
} from 'ProyectoVideoJuegos/src/components';
export default function UserLogger(props) {
  const {type, navigation} = props;
  if (type === 'account') {
    return <UserProfileComponent navigation={navigation} />;
  } else {
    return <LibraryComponent />;
  }
}

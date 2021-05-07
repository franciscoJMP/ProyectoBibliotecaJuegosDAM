import React, {Component, useState, useEffect} from 'react';
import {View, Text, Button} from 'react-native';
import {
  UserProfileComponent,
  LibraryComponent,
} from 'ProyectoVideoJuegos/src/components';
export default function UserLogger(props) {
  const {type} = props;
  if (type === 'account') {
    return <UserProfileComponent />;
  } else {
    return <LibraryComponent />;
  }
}

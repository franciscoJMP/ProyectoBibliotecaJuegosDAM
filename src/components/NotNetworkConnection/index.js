import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';

export default function NotNetworkConnection(props) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>Sin Conexión</Text>
    </View>
  );
}

const styles = StyleSheet.create({});

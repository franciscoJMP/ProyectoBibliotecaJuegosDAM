import React from 'react';
import {Text, View} from 'react-native';
import {Icon} from 'react-native-elements';

export default function NotFoundSolicitude() {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon type="material-community" name="information-outline" size={50} />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        No hay solicitudes pendientes
      </Text>
    </View>
  );
}

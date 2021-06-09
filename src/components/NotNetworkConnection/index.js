import React from 'react';
import {Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {setI18nConfig} from 'ProyectoVideoJuegos/src/languages/i18n.js';
var texts = setI18nConfig();

export default function NotNetworkConnection(props) {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Icon
        type="material-community"
        name="wifi-strength-off-outline"
        size={50}
      />
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        {texts.t('not_connection')}
      </Text>
    </View>
  );
}

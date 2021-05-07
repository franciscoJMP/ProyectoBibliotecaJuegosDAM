import React, {Component} from 'react';
import AppNavigation from './src/navigation/AppNavigation';
import {firebaseConfig} from './src/utils/firebase';
import NetInfo from '@react-native-community/netinfo';
import * as firebase from 'firebase';
import * as RNLocalize from 'react-native-localize';
import {setI18nConfig} from './src/languages/i18n';
import {Text, View} from 'react-native';
var i18n = setI18nConfig();

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {networkInfo: true};
  }
  componentDidMount() {
    RNLocalize.addEventListener('change', this.handleLocalizationChange);
    NetInfo.addEventListener(state => {
      this.setState({networkInfo: state.isInternetReachable});
    });
  }
  componentWillUnmount() {
    RNLocalize.removeEventListener('change', this.handleLocalizationChange);
    
  }
  handleLocalizationChange = () => {
    i18n = setI18nConfig();
    this.forceUpdate();
  };
  render() {
    return <AppNavigation/>
  }
}
export default App;

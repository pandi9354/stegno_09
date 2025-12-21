/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { Buffer } from "buffer";
import 'react-native-get-random-values';



global.Buffer = global.Buffer || Buffer;
AppRegistry.registerComponent(appName, () => App);

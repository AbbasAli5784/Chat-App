import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Start from "./components/Start";
import Chat from "./components/Chat";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDFWvLYOTaUKBxBB3E0xLmWBdNnRnF9EMM",
    authDomain: "chatapp-d28e2.firebaseapp.com",
    projectId: "chatapp-d28e2",
    storageBucket: "chatapp-d28e2.appspot.com",
    messagingSenderId: "291579048789",
    appId: "1:291579048789:web:2e1aa9e85756986a3e35dc",
  };
  const app = initializeApp(firebaseConfig);

  const db = getFirestore(app);
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Screen1">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => <Chat db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;

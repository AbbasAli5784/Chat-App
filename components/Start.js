import {
  StyleSheet,
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import { KeyboardAvoidingView, Platform } from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";
import { useState } from "react";

const Start = ({ navigation }) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [userId, setUserId] = useState("");
  const auth = getAuth();

  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        navigation.navigate("Chat", {
          name: name,
          backgroundColor: color,
          userId: result.user.uid,
        });
        Alert.alert("Signed in Successfully");
      })
      .catch((error) => {
        Alert.alert("Unable to sign in, try later.");
      });
  };
  const onColorChange = (color) => {
    setColor(color);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Please Enter A Username!</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Type your username here"
        />
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding" />
        ) : null}

        <Text>Please Select A Background Colour!</Text>

        <ColorPicker
          color={color}
          onColorChange={(color) => onColorChange(color)}
          // onColorChangeComplete={(color) => alert(`Color selected: ${color}`)}
          thumbSize={30}
          sliderSize={30}
          noSnap={true}
          row={false}
        />

        <TouchableOpacity style={styles.button} onPress={signInUser}>
          <Text style={styles.buttonText}>Start Chatting!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  textInput: {
    width: "88%",
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
  },
  button: {
    marginTop: 50,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default Start;

import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Alert, Keyboard } from "react-native";
import {
  Bubble,
  GiftedChat,
  InputToolbar,
  renderInputToolbar,
} from "react-native-gifted-chat";
import { KeyboardAvoidingView, Platform } from "react-native";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Chat = ({ db, route, navigation, isConnected }) => {
  const [messages, setMessages] = useState([]);
  const [showInputToolbar, setShowInputToolbar] = useState(isConnected);
  const { name } = route.params;
  const { backgroundColor } = route.params;
  const { userId } = route.params;

  useEffect(() => {
    setShowInputToolbar(isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (isConnected === true) {
      const q = query(collection(db, "messages"), where("uid", "==", userId));
      unsubMessages = onSnapshot(q, (documentsSnapshot) => {
        let newMessages = [];
        documentsSnapshot.forEach((doc) => {
          newMessages.push({ id: doc.id, ...doc.data() });
        });
        cachedMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages();

    return () => {
      if (unsubMessages) unsubMessages();
      unsubMessages = null;
    };
  }, [isConnected]);

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  const cachedMessages = async (listsToCache) => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(listsToCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem("messages");
      if (cachedMessages !== null) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCachedMessages();
  }, []);

  const onSend = async (newMessages) => {
    if (!isConnected) {
      Alert.alert("You are offline. Messages cannot be sent.");
      return;
    }
    const newMessage = { ...newMessages[0], uid: userId };
    try {
      await addDoc(collection(db, "messages"), newMessage);
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [newMessage])
      );
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#000",
          },
          left: {
            backgroundColor: "#FFF",
          },
        }}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userId,
          name: name,
        }}
        renderInputToolbar={(props) =>
          showInputToolbar ? <InputToolbar {...props} /> : null
        }
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
});

export default Chat;

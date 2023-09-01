import { useEffect, useState, useCallback } from "react";
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
    let isMounted = true;
    if (isConnected === true) {
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
      const unsubMessages = onSnapshot(q, (documentsSnapshot) => {
        let newMessages = [];
        documentsSnapshot.forEach((doc) => {
          const data = doc.data();
          newMessages.push({
            _id: doc.id,
            ...data,
            createdAt: new Date(data.createdAt),
          });
        });

        cachedMessages(newMessages);
        if (isMounted) {
          setMessages(newMessages);
        }
      });

      return () => {
        isMounted = false;
        if (unsubMessages) unsubMessages();
      };
    } else loadCachedMessages();
  }, [isConnected, loadCachedMessages]);

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

  const loadCachedMessages = useCallback(async () => {
    let isMounted = true;
    try {
      const cachedMessages = await AsyncStorage.getItem("messages");
      if (cachedMessages !== null && isMounted) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error(error);
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadCachedMessages();
  }, [loadCachedMessages]);

  const onSend = async (newMessages) => {
    if (!isConnected) {
      Alert.alert("You are offline. Messages cannot be sent.");
      return;
    }
    const newMessage = {
      ...newMessages[0],
      uid: userId,
      createdAt: new Date().toISOString(),
      user: {
        _id: userId,
        name: name,
      },
    };
    try {
      await addDoc(collection(db, "messages"), newMessage);
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

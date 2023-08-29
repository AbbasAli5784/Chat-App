import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
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

const Chat = ({ db, route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const { name } = route.params;
  const { backgroundColor } = route.params;
  const { userId } = route.params;

  useEffect(() => {
    const messageRef = collection(db, "messages");
    const q = query(messageRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesFireStore = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          _id: doc.id,
          createdAt: data.createdAt.toDate(),
        };
      });
      setMessages(messagesFireStore);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: name });
  }, []);

  const onSend = async (newMessages) => {
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

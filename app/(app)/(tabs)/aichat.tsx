import React, { useState, useEffect } from "react";
import { Pressable, View } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { ChatGPTAPI } from "./ChatGPTAPI"; // Assuming you have ChatGPT API wrapper

export default function ChatMessageScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const { bottom, top } = useSafeAreaInsets();
  const { id, email } = useLocalSearchParams();
  const { currentUser } = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const q = collection(db, "conversations");
    const unsubscribe = onSnapshot(q, (snap) => {
      snap.forEach((doc) => {
        const data = doc.data();
        if (
          (data.u1._id === currentUser?.uid && data.u2._id === id) ||
          (data.u2._id === currentUser?.uid && data.u1._id === id)
        ) {
          setConversationId(doc.id);
          setMessages([...data.messages]);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const onSend = async (messages: IMessage[]) => {
    const previousMessages = [...messages];

    try {

      setMessages((previousMessages: IMessage[]) =>
        GiftedChat.append(previousMessages, [messages[0]], false)
      );


      const response = await ChatGPTAPI.sendMessage(messages[0].text);
      const createdAt = Date.now();

      const message: IMessage = {
        _id: createdAt.toString(),
        text: response,
        createdAt,
        user: {
          _id: "ChatGPT",
          name: "ChatGPT",
        },
      };
      const message2: IMessage = {
        _id: createdAt.toString(),
        text: messages[0].text,
        createdAt,
        user: {
          _id: messages[0].user._id,
          name: messages[0].user.name,
        },
      };

      setMessages((previousMessages: IMessage[]) =>
        GiftedChat.append(previousMessages, [message], false)
      );

      const conversationRef = conversationId
        ? doc(db, "conversations", conversationId)
        : doc(collection(db, "conversations"));

      if (!conversationId) {
        // Create new conversation
        await setDoc(conversationRef, {
          u1: { _id: currentUser?.uid, email: currentUser?.email },
          u2: { _id: "007GPT", email:"ChatGPT@gmail.com"},
          messages: [message],
          createdAt,
          updatedAt: createdAt,
        });
        setConversationId(conversationRef.id);
      } else {
        // Update existing conversation
        await updateDoc(conversationRef, {
          updatedAt: createdAt,
          messages: arrayUnion(message),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(previousMessages);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 10,
        }}
      >
        <Pressable
          style={{ paddingLeft: 10, marginRight: 15 }}
          onPress={() => router.back()}
        >
          {({ pressed }) => (
            <FontAwesome
              name="chevron-left"
              size={25}
              color={"white"}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>

        <Text
          style={{ marginLeft: 20 }}
          variant="titleMedium"
          ellipsizeMode="tail"
        >
          {email}
        </Text>
      </View>

      <GiftedChat
        user={{
          _id: currentUser?.uid as string,
          name: currentUser?.email as string,
        }}
        inverted={false}
        messages={messages}
        keyboardShouldPersistTaps={"handled"}
        alwaysShowSend
        bottomOffset={bottom}
        renderAvatar={null}
        onSend={onSend}
      />
    </SafeAreaView>
  );
}

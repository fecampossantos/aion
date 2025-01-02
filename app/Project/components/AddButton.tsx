import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import styles from "../styles";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

const AddButton = ({ project }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <View style={styles.addButtonWrapper}>
      {isOpen ? (
        <View style={styles.addButtons}>
          <Pressable
            onPress={() => {
              setIsOpen(false);
              router.push({
                pathname: "AddTask",
                params: { projectID: project.project_id },
              });
            }}
            style={[styles.addButton, { marginBottom: 20 }]}
          >
            <Text>Nova task</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setIsOpen(false);
              router.push({
                pathname: "/AddRecord",
                params: { projectID: project.project_id },
              });
            }}
            style={styles.addButton}
          >
            <Text>Novo tempo</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.addIconWrapper}>
        <Pressable
          style={styles.addButtonIcon}
          onPress={() => {
            setIsOpen(!isOpen);
          }}
        >
          <Text>
            <Feather name="plus" size={40} color="black" />
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default AddButton;

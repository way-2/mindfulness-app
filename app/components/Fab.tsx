import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  FAB,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const feelings = [
  { icon: "emoticon-excited-outline", label: "Excited" },
  { icon: "emoticon-happy-outline", label: "Happy" },
  { icon: "emoticon-neutral-outline", label: "Neutral" },
  { icon: "emoticon-sad-outline", label: "Sad" },
  { icon: "emoticon-angry-outline", label: "Angry" },
];

export default function Fab({onAddEntry}) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [notes, setNotes] = useState("");

  const openModal = () => setVisible(true);

  const closeModal = () => {
    setVisible(false);
    setSelectedFeeling(null);
    setNotes("");
  };

  const handleAdd = () => {
    if (selectedFeeling && onAddEntry) {
      onAddEntry({ feeling: selectedFeeling, notes });
    }
    closeModal();
  };

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={closeModal}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            How are you feeling?
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {feelings.map((feeling) => (
              <IconButton
                key={feeling.icon}
                icon={feeling.icon}
                size={36}
                selected={selectedFeeling === feeling.label}
                onPress={() => setSelectedFeeling(feeling.label)}
                style={{
                  backgroundColor:
                    selectedFeeling === feeling.label
                      ? theme.colors.primaryContainer
                      : "transparent",
                  borderRadius: 24,
                }}
                accessibilityLabel={feeling.label}
              />
            ))}
          </View>
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ marginBottom: 16 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onPress={closeModal} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAdd}
              disabled={!selectedFeeling}
            >
              Add
            </Button>
          </View>
        </Modal>
      </Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openModal}
        accessibilityLabel="Add Mood Entry"
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    zIndex: 100,
  },
  modalContainer: {
    margin: 24,
    borderRadius: 12,
    padding: 24,
  },
});

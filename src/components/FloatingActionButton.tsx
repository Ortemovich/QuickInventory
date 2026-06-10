import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FABProps {
  onPress: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  color?: string;
}

export default function FloatingActionButton({ onPress, iconName = 'add', color = '#007bff' }: FABProps) {
  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={onPress}>
      <MaterialIcons name={iconName} size={32} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
});
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Slot />
    </PaperProvider>
  );
}

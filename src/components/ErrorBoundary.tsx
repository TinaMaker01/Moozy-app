import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorState } from './states/ErrorState';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Theme-aware full-screen wrapper around the shared ErrorState, since the class component below can't call hooks itself. */
const CrashScreen: React.FC<{ error: Error | null; onRetry: () => void }> = ({
  error,
  onRetry,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ErrorState
        title="Oups, un problème est survenu"
        message={error?.message || 'Une erreur inattendue a interrompu l’affichage.'}
        onRetry={onRetry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

/**
 * Catches render-time crashes anywhere below it in the tree so a single bad
 * screen (e.g. a track with corrupted metadata, a malformed playlist loaded
 * from disk) shows a recoverable error screen instead of taking down the
 * whole app with a hard crash / white screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('Moozy caught a render error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <CrashScreen error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

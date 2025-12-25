import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect } from '@react-navigation/native';

// CAMBIA ESTA URL POR TU PÁGINA WEB
const TARGET_URL = 'https://tu-pagina-web.com';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Manejar el botón atrás de Android
  useFocusEffect(
    useEffect(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [canGoBack])
  );

  // Abrir enlaces externos en el navegador del sistema
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url.toLowerCase();
    
    // Si es un enlace externo (no de nuestra página)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const isOurDomain = url.includes('tu-pagina-web.com');
      
      if (!isOurDomain) {
        // Preguntar al usuario si quiere abrir en navegador
        Alert.alert(
          'Abrir enlace',
          'Este enlace te llevará fuera de la aplicación. ¿Deseas continuar?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Abrir', 
              onPress: () => WebBrowser.openBrowserAsync(request.url) 
            },
          ]
        );
        return false;
      }
    }
    
    return true;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <WebView
        ref={webViewRef}
        source={{ uri: TARGET_URL }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Cargando tu página web...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          Alert.alert(
            'Error de conexión',
            'No se pudo cargar la página. Verifica tu conexión a internet.',
            [{ text: 'Reintentar', onPress: () => webViewRef.current?.reload() }]
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});

import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { isSupabaseConfigured } from './src/supabase';
import { StoreProvider } from './src/store';
import { AuthProvider, useAuth } from './src/auth';
import { theme } from './src/theme';
import { RouteKey } from './src/nav';
import Shell from './src/Shell';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import SetupNeeded from './src/screens/SetupNeeded';
import Dashboard from './src/screens/Dashboard';
import Leads from './src/screens/Leads';
import DoorKnock from './src/screens/DoorKnock';
import Team from './src/screens/Team';
import Projects from './src/screens/Projects';
import Appointments from './src/screens/Appointments';
import Settings from './src/screens/Settings';

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.bg }}>
      <ActivityIndicator size="large" color={theme.color.primary} />
    </View>
  );
}

function Root() {
  const { status, signOut } = useAuth();
  const [route, setRoute] = useState<RouteKey>('dashboard');
  const [showSignUp, setShowSignUp] = useState(false);

  if (status === 'loading') return <Splash />;

  if (status !== 'signedIn') {
    return showSignUp ? (
      <SignUp onBack={() => setShowSignUp(false)} />
    ) : (
      <Login onSignUp={() => setShowSignUp(true)} />
    );
  }

  return (
    <StoreProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Shell route={route} setRoute={setRoute}>
          {route === 'dashboard' && <Dashboard go={setRoute} />}
          {route === 'leads' && <Leads />}
          {route === 'doorknock' && <DoorKnock />}
          {route === 'team' && <Team />}
          {route === 'projects' && <Projects />}
          {route === 'appointments' && <Appointments />}
          {route === 'settings' && <Settings onSignOut={signOut} />}
        </Shell>
      </SafeAreaView>
    </StoreProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {isSupabaseConfigured ? (
        <AuthProvider>
          <Root />
        </AuthProvider>
      ) : (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <SetupNeeded />
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

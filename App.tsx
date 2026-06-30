import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider } from './src/store';
import { RouteKey } from './src/nav';
import Shell from './src/Shell';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Leads from './src/screens/Leads';
import Team from './src/screens/Team';
import Projects from './src/screens/Projects';
import Appointments from './src/screens/Appointments';
import Settings from './src/screens/Settings';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [route, setRoute] = useState<RouteKey>('dashboard');

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!authed ? (
        <Login onLogin={() => setAuthed(true)} />
      ) : (
        <StoreProvider>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <Shell route={route} setRoute={setRoute}>
              {route === 'dashboard' && <Dashboard go={setRoute} />}
              {route === 'leads' && <Leads />}
              {route === 'team' && <Team />}
              {route === 'projects' && <Projects />}
              {route === 'appointments' && <Appointments />}
              {route === 'settings' && <Settings onSignOut={() => setAuthed(false)} />}
            </Shell>
          </SafeAreaView>
        </StoreProvider>
      )}
    </SafeAreaProvider>
  );
}

/**
 * App component - Root router configuration
 *
 * [PROPS]: none
 * [EMITS]: none
 * [POS]: Main app entry, configures routes and wraps with Layout
 */

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Memories from './pages/Memories';
import Entities from './pages/Entities';
import Relations from './pages/Relations';
import GraphViewer from './pages/GraphViewer';

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/relations" element={<Relations />} />
            <Route path="/graph" element={<GraphViewer />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
}

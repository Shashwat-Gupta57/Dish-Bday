/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Legal from './pages/Legal';
import Reminder from './pages/Reminder';
import Report from './pages/Report';
import Complications from './pages/Complications';
import Sleep from './pages/Sleep';
import Grain from './components/Grain';
import StampCard from './components/StampCard';
import ScrollManager from './components/ScrollManager';
import { EggProvider } from './lib/EggContext';
import { EditorsCutProvider } from './lib/EditorsCut';
import { SmoothScrollProvider } from './lib/SmoothScroll';

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            'font-serif text-sm bg-editorial-black text-editorial-cream border-editorial-accent shadow-2xl',
        }}
      />
      <BrowserRouter>
        {/* Providers sit inside the router so the stamp card can link, and so a
            visit to /legal can stamp itself. */}
        <SmoothScrollProvider>
          <EggProvider>
            <EditorsCutProvider>
              <ScrollManager />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/reminder" element={<Reminder />} />
                <Route path="/findings" element={<Report />} />
                <Route path="/complications" element={<Complications />} />
                <Route path="/sleep" element={<Sleep />} />
                {/* A typo in the URL used to render a blank white page. */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <StampCard />
            </EditorsCutProvider>
          </EggProvider>
        </SmoothScrollProvider>
      </BrowserRouter>
      <Grain />
    </>
  );
}

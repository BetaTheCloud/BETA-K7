/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Announcements from './pages/Announcements';
import News from './pages/News';
import Menu from './pages/Menu';
import Calendar from './pages/Calendar';
import Bologna from './pages/Bologna';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="news" element={<News />} />
          <Route path="menu" element={<Menu />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="bologna" element={<Bologna />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

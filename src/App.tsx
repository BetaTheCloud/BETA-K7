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
import CampusHub from './pages/CampusHub';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="news" element={<News />} />
          <Route path="campus" element={<CampusHub />} />
          <Route path="directory" element={<CampusHub />} />
          <Route path="events" element={<CampusHub />} />
          <Route path="transport" element={<CampusHub />} />
          <Route path="forms" element={<CampusHub />} />
          <Route path="library" element={<CampusHub />} />
          <Route path="sports" element={<CampusHub />} />
          <Route path="hotel" element={<CampusHub />} />
          <Route path="campus-map" element={<CampusHub />} />
          <Route path="menu" element={<Menu />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="bologna" element={<Bologna />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


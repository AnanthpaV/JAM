import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import NotFound from './components/NotFound';
import Layout from './components/Layout';
import IndexPage from './components/pages/IndexPage';
import AccountPage from './components/pages/AccountPage';
import { UserContextProvider } from './components/UserContext';
import axios from 'axios';
import PlacesPage from './components/pages/PlacesPage';
import PlacesForm from './components/pages/PlacesForm';
import PageForPlace from './components/pages/PageForPlace';

axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/places" element={<PlacesPage />} />
            <Route path="/account/places/new" element={<PlacesForm />} />
            <Route path="/account/places/:id" element={<PlacesForm />} />
            <Route path="/place/:id" element={<PageForPlace/>}/>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;

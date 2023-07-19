import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Navbar, Sidebar } from './components';
import { BankAccounts, Dashboard, AIInsights } from './pages';

export default class App extends Component {
  render() {
    return (
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <Sidebar />
          <Routes>
            <Route path="/" Component={Dashboard} exact />
            <Route path="/bank" Component={BankAccounts} exact />
            <Route path="/ai" Component={AIInsights} exact />
          </Routes>
        </div>
      </Router>
    );
  }
}

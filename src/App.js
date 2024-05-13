import React from 'react';
import AddProductPage from './components/product';
import OrderPage from './components/order';
import LoginPage from './components/login';
import SignupPage from './components/signup';
import ResetPasswordPage from './components/resetpassword';
import { Routes, Route } from 'react-router-dom';
import ViewAllOrdersPage from './components/viewallorders';
import TestPage from './components/testPage';

const App = () => {
  return (      
      <div>
        <Routes>
           <Route path="/" element={<OrderPage />} />
           <Route path="/login" element={<LoginPage />} />
           <Route path="/add-product" element={<AddProductPage />} />
           <Route path="/sign-up" element={<SignupPage />} />
           <Route path="/reset-password" element={<ResetPasswordPage />} />
           <Route path="/view-all-orders" element={<ViewAllOrdersPage />} />
           <Route path="/test-page" element={<TestPage/>} />
        </Routes>
      </div>
  );
};

export default App;

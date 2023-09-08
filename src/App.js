import React from 'react';
import AddProductPage from './components/product';
import OrderPage from './components/order';
import LoginPage from './components/login';
import { Routes, Route } from 'react-router-dom';


const App = () => {
  return (      
      <div>
        <Routes>
           <Route path="/" element={<OrderPage />} />
           <Route path="/login" element={<LoginPage />} />
           <Route path="/add-product" element={<AddProductPage />} />
        </Routes>
      </div>
  );
};

export default App;

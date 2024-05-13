import React, { useState } from "react";
import useScanDetection from 'use-scan-detection'



const TestPage = () => {
   
    const [barcodeScan, setBarcodeScan]= useState('No barcode scan');
  
    useScanDetection({
        onComplete: setBarcodeScan,
        minLength: 3,
    });

    return (
      <div className="App-test" style={{ padding: " 5rem 10rem"}} >
        <p>
            Barcode: {barcodeScan}
        </p>
      </div>
    );
};

export default TestPage;

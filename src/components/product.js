import React, { useState, useEffect, useRef } from "react";
import "../styles/product.css";
import axios from "axios";
import { Link } from "react-router-dom";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

const AddProductPage = () => {
  const options = [
    "Milkshake",
    "Icescream",
    "Sandwiches",
    "Mastani",
    "Burgers",
    "Juices",
    "Bar-code",
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorStatus, setErrorStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successStatus, setSuccessStatus] = useState(false);

  const successContainerRef = useRef(null);
  const errorContainerRef = useRef(null);
  let currentToken = localStorage.getItem('token');

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    if (/^[0-9]*$/.test(value)) {
      setPrice(value);
    }
  };

  const handleErrorMessage = (errorMessage) => {
    setErrorMessage(errorMessage);
    setErrorStatus(true);
  };

  const handleSuccessMessage = (errorMessage) => {
    setSuccessMessage(errorMessage);
    setSuccessStatus(true);
  };

  const handleOnClick = async (event) => {
    try {
      if (
        !name ||
        !price ||
        !selectedOption ||
        (selectedOption === "Bar-code" && !barcode)
      ) {
        if (!name) {
          handleErrorMessage("Name is a required field.");
        }
        if (!selectedOption) {
          handleErrorMessage("Category is a required field.");
        }
        if (!price) {
          handleErrorMessage("Price is a required field.");
        }
        if (selectedOption === "Bar-code" && !barcode) {
          handleErrorMessage("Barcode is required");
        }
        return;
      }

      const productData = {
        price: parseInt(price),
        name,
        category: selectedOption,
        bar_code: barcode || null,
      };

      setErrorStatus(false);

      const response = await axios.post(
        `http://localhost:${backendPort}/add-product`,
        productData, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          }
        }
      );

      if (response.status === 201) {
        handleSuccessMessage("Product created successfully.");

      } else {
        handleErrorMessage("Failed to create the product.");
      }
    } catch (error) {
      console.error("Error:", error);
      handleErrorMessage(error.response.data);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (successContainerRef.current &&
          !successContainerRef.current.contains(event.target)) ||
        (errorContainerRef.current &&
          !errorContainerRef.current.contains(event.target))
      ) {
        setSuccessStatus(false);
        setErrorStatus(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!currentToken) {
      window.location.href = "/login";
      return;
    }

    let tokenData = {};

    try {
      tokenData = JSON.parse(atob(currentToken.split(".")[1]));
    } catch (error) {
      console.error("Invalid token format:", error);
      window.location.href = "/login";
    }

    if (tokenData.exp) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp > tokenData.exp) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  }, [])

  return (
    <>
      <div className="main-container">
        <Link to="/" className="order-link">
          <div className="arrow-container">
            <span className="arrow">&#x2190;</span>
          </div>
        </Link>
        {errorStatus && (
          <div className="error-container" ref={errorContainerRef}>
            <span className="exclamation-mark">!</span>
            <p className="error-message">{errorMessage}</p>
          </div>
        )}
        {successStatus && (
          <div className="success-container" ref={successContainerRef}>
            <span className="checkmark">&#x2713;</span>
            <p className="success-message">{successMessage}</p>
          </div>
        )}

        <div className="product-container">
          <div className="category-container">
            <h3>Category</h3>
            <select value={selectedOption} onChange={handleDropdownChange}>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="category-container">
            <h3>Name</h3>
            <input
              type="text"
              placeholder="Name.."
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="category-container">
            <h3>Price</h3>
            <input
              type="text"
              placeholder="Price.."
              id="price-input"
              value={price}
              onChange={handlePriceChange}
            />
          </div>
          {selectedOption === "Bar-code" && (
            <div className="category-container" id="bar-code-input">
              <h3>Barcode</h3>
              <input
                type="text"
                placeholder="Barcode.."
                onChange={(event) => setBarcode(event.target.value)}
              />
            </div>
          )}
          <button className="btn-add-product" onClick={handleOnClick}>Add</button>
        </div>
      </div>
    </>
  );
};

export default AddProductPage;

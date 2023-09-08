import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/order.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { Link } from "react-router-dom";

const OrderPage = () => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeContainerIndex, setActiveContainerIndex] = useState(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [showProductList, setShowProductList] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [barCode, setSearchBarcode] = useState("");
  const [errorStatus, setErrorStatus] = useState(false);
  const containerRefs = useRef([]);
  const searchBarcodeRef = useRef(null);

  const activeContainerRef = useRef(null);

  const backendPort = process.env.REACT_APP_BACKEND_PORT;

  const handleOnClick = async () => {
    try {
      await axios.post(`http://localhost:${backendPort}/create-order`, {
        order_number: 1,
        status: "pending",
      });

      fetchData();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData = async () => {
    axios
      .get(`http://localhost:${backendPort}/get-orders`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const fetchProductsByCategory = async (category) => {
    try {
      const response = await axios.get(
        `http://localhost:${backendPort}/get-products?category=${category}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
  };

  const fetchOrderDetails = async (order_number) => {
    try {
      const response = await axios.get(
        `http://localhost:${backendPort}/get-order-details?order_number=${order_number}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
  };

  const handleQuantityClick = async (option, id, order_number) => {
    try {
      await axios.put(`http://localhost:${backendPort}/change-quantity`, {
        id,
        option,
        order_number,
      });

      const response = await fetchOrderDetails(order_number);

      setOrderDetails((prevOrderDetails) => ({
        ...prevOrderDetails,
        [order_number]: response,
      }));
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
  };

  const fetchAndSetOrderDetails = async (orderNumber) => {
    try {
      const response = await fetchOrderDetails(orderNumber);
      setOrderDetails((prevOrderDetails) => ({
        ...prevOrderDetails,
        [orderNumber]: response,
      }));
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleContainerClick = (index) => {
    if (index !== activeContainerIndex) {
      setActiveContainerIndex(index);
      activeContainerRef.current = containerRefs.current[index];
      setErrorStatus(false);
    }
  };

  const handleBoxContainerClick = (category) => {
    setShowProductList(true);
    setCurrentCategory(category);
    fetchProductsByCategory(category);
  };

  const handleOrderDetails = async (product, currentCategory) => {
    try {
      if (activeContainerIndex === null) {
        setErrorStatus(true);
      } else {
        const orderDetails = {
          order_number: data[activeContainerIndex].order_number,
          product_name: product.name,
          product_price: product.price,
          category: currentCategory,
        };
        await axios.post(
          `http://localhost:${backendPort}/create-order-details`,
          orderDetails
        );

        data.forEach(async (item) => {
          const response = await fetchOrderDetails(item.order_number);
          setOrderDetails((prevOrderDetails) => ({
            ...prevOrderDetails,
            [item.order_number]: response,
          }));
        });
      }
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
  };

  const handleBarCodeProducts = async (product, currentCategory) => {
    try {
      const orderDetails = {
        order_number: data[activeContainerIndex].order_number,
        product_name: product.name,
        product_price: product.price,
        category: "barcode-product",
      };
      await axios.post(
        `http://localhost:${backendPort}/create-order-details`,
        orderDetails
      );

      data.forEach(async (item) => {
        const response = await fetchOrderDetails(item.order_number);
        setOrderDetails((prevOrderDetails) => ({
          ...prevOrderDetails,
          [item.order_number]: response,
        }));
      });

      setSearchBarcode("");
    } catch (error) {
      console.error("Error fetching products by category:", error);
    }
  };


  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchInput(searchTerm);

    const filtered = data.filter(
      (item) => item.order_number.toString() === searchTerm
    );
    setFilteredData(filtered);
  };

  const handleBarcodeChange = (e) => {
    if (activeContainerIndex === null) {
      setErrorStatus(true);
    }
    setSearchBarcode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (barCode.length === 13) {
      const response = await axios.get(
        `http://localhost:${backendPort}/get-barcode-product?bar_code=${barCode}`
      );

      handleBarCodeProducts(response.data);
    }

    setSearchBarcode("");

    // Focus the search bar input field
    searchBarcodeRef.current.focus();
  };

  const handleBlur = () => {
    // Prevent the input field from losing focus when clicked outside
    searchBarcodeRef.current.focus();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    let tokenData = {};

    try {
      tokenData = JSON.parse(atob(token.split(".")[1]));
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

    fetchData();
    const handleDocumentClick = (event) => {};

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    containerRefs.current = containerRefs.current.slice(0, data.length);
  }, [data.length]);

  useEffect(() => {
    if (data.length > 0) {
      data.forEach(async (item) => {
        const response = await fetchOrderDetails(item.order_number);
        setOrderDetails((prevOrderDetails) => ({
          ...prevOrderDetails,
          [item.order_number]: response,
        }));
      });
    }
  }, [data, data.length]);

  return (
    <div className="container">
      <div className="left-container">
        <div className="btn-container">
          <Link to="/add-product" className="order-link">
            <div className="arrow-container-order">
              <span className="arrow-order">&#x2190; Add Product</span>
            </div>
          </Link>
          <button className="create-order-btn" onClick={handleOnClick}>
            create order
          </button>
        </div>
        {showProductList ? (
          <div className="list-container">
            {products.slice(0, 10).map((product, index) => (
              <div key={index} className="list-entry">
                <div className="list-name">{product.name}</div>
                <div className="list-price">Rs {product.price}</div>
                <button
                  className="add-button"
                  onClick={() => handleOrderDetails(product, currentCategory)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="box-container">
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Milkshake")}
            >
              {" "}
              <h2>Milkshake</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Icescream")}
            >
              <h2>Icescream</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Sandwiches")}
            >
              <h2>Sandwiches</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Mastani")}
            >
              <h2>Mastani</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Burgers")}
            >
              <h2>Burgers</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Juices")}
            >
              <h2>Juices</h2>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formGroupSearch">
                <h2> Barcode</h2>
                <Form.Control
                  autoFocus
                  type="text"
                  placeholder="Search barcode"
                  onChange={handleBarcodeChange}
                  value={barCode}
                  ref={searchBarcodeRef}
                  onBlur={handleBlur}
                />
              </Form.Group>
            </Form>
          </div>
        )}
      </div>

      <div className="right-container">
        <p className="date">Tues, Aug 15, 2023</p>
        <input
          className="search-box"
          placeholder="   Search order..."
          value={searchInput}
          onChange={handleSearchChange}
        />
        <div className="scrollable-container">
          {filteredData.length === 0
            ? data.map((item, index) => {
                const totalPriceSum = orderDetails[item.order_number]
                  ? orderDetails[item.order_number].reduce(
                      (sum, orderDetail) => sum + orderDetail.total_price,
                      0
                    )
                  : 0;

                return (
                  <div
                    key={index}
                    ref={(element) => (containerRefs.current[index] = element)}
                    className={`sub-container ${
                      index === activeContainerIndex ? "bordered" : ""
                    }`}
                    onClick={() => handleContainerClick(index)}
                  >
                    <div className="start-container">
                      <p>{item.order_number}</p>
                    </div>
                    <div className="mid-container">
                      <div className="order-details">
                        {orderDetails[item.order_number] ? (
                          orderDetails[item.order_number].map((orderDetail) => (
                            <div key={orderDetail.id} className="entry">
                              <p className="column">{orderDetail.category}</p>
                              <p className="column">
                                {orderDetail.product_name}
                              </p>
                              <p className="column">{orderDetail.quantity}</p>
                              <p className="column">
                                <FontAwesomeIcon
                                  icon={faPlus}
                                  onClick={() =>
                                    handleQuantityClick(
                                      "plus",
                                      orderDetail.id,
                                      orderDetail.order_number
                                    )
                                  }
                                />
                              </p>
                              <p className="column">
                                <FontAwesomeIcon
                                  icon={faMinus}
                                  onClick={() =>
                                    handleQuantityClick(
                                      "minus",
                                      orderDetail.id,
                                      orderDetail.order_number
                                    )
                                  }
                                />
                              </p>
                              <p className="column">
                                {orderDetail.total_price}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>
                            No order details available for this order number.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="end-container">
                      <p id="total">Total</p>
                      <p id="total"> Rs {totalPriceSum}</p>
                    </div>
                  </div>
                );
              })
            : filteredData.map((item, index) => (
                <div
                  key={index}
                  ref={(element) => (containerRefs.current[index] = element)}
                  className={`sub-container ${
                    index === activeContainerIndex ? "bordered" : ""
                  }`}
                  onClick={() => handleContainerClick(index)}
                >
                  <div className="start-container">
                    <p>{item.order_number}</p>
                  </div>
                  <div className="mid-container">
                    <div className="order-details">
                      {orderDetails[item.order_number] ? (
                        orderDetails[item.order_number].map((orderDetail) => (
                          <div key={orderDetail.id} className="entry">
                            <p className="column">{orderDetail.category}</p>
                            <p className="column">{orderDetail.product_name}</p>
                            <p className="column">{orderDetail.quantity}</p>
                            <p className="column">
                              <FontAwesomeIcon
                                icon={faPlus}
                                onClick={() =>
                                  handleQuantityClick(
                                    "plus",
                                    orderDetail.id,
                                    orderDetail.order_number
                                  )
                                }
                              />
                            </p>
                            <p className="column">
                              <FontAwesomeIcon
                                icon={faMinus}
                                onClick={() =>
                                  handleQuantityClick(
                                    "minus",
                                    orderDetail.id,
                                    orderDetail.order_number
                                  )
                                }
                              />
                            </p>
                            <p className="column">{orderDetail.total_price}</p>
                          </div>
                        ))
                      ) : (
                        <p>No order details available for this order number.</p>
                      )}
                    </div>
                  </div>
                  <div className="end-container">
                    <p id="total">Total</p>
                    <p id="total"> Rs</p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {
        errorStatus && (
          <div className="error-container-order">
            <span className="exclamation-mark">!</span>
            <p className="error-message-order"> Kindly Select an order</p>
          </div>
        )
      }
    </div>
  );
};

export default OrderPage;

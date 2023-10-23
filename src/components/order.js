import React, { useState, useEffect, useRef } from "react";
import "../styles/order.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { Link } from "react-router-dom";

const OrderPage = () => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeContainerIndex, setActiveContainerIndex] = useState(null);
  const [showProductList, setShowProductList] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [barCode, setSearchBarcode] = useState("");
  const [errorStatus, setErrorStatus] = useState(false);
  const containerRefs = useRef([]);
  const searchBarcodeRef = useRef(null);
  const [addProductStatus, setAddProductStatus] = useState(true);
  const [isAdmin, setAdminStatus ] = useState(false);
  const [backStatus, setBackStatus] = useState(false);
  const [menuStatus, setMenuStatus] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  let currentToken = localStorage.getItem('token');

  const activeContainerRef = useRef(null);

  const backendPort = process.env.REACT_APP_BACKEND_PORT;

  const handleOnClick = async () => {
    try {
      await axios.post(`http://localhost:${backendPort}/create-order`, {
        order_number: 1,
        status: "pending",
      }, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      fetchData();
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(error.response.data)
    }
  };

  const fetchData = async () => {
    axios
      .get(`http://localhost:${backendPort}/get-orders`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert(error.response.data)
      });
  };

  const fetchProductsByCategory = async (category) => {
    try {
      const response = await axios.get(
        `http://localhost:${backendPort}/get-products?category=${category}`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      alert(error.response.data)
    }
  };

  const fetchOrderDetails = async (order_id) => {
    try {
      const response = await axios.get(
        `http://localhost:${backendPort}/get-order-details?order_id=${order_id}`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      alert(error.response.data)
    }
  };

  const handleQuantityClick = async (option, id, order_id) => {
    try {
      await axios.put(`http://localhost:${backendPort}/change-quantity`, {
        id,
        option,
        order_id,
      }, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const response = await fetchOrderDetails(order_id);

      setOrderDetails((prevOrderDetails) => ({
        ...prevOrderDetails,
        [response.order_number]: response,
      }));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      alert(error.response.data)
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
    setAddProductStatus(false);
    setBackStatus(true);
    setCurrentCategory(category);
    fetchProductsByCategory(category);
  };

  const handleOrderDetails = async (product, currentCategory) => {
    try {
      if (activeContainerIndex === null) {
        setErrorStatus(true);
      } else {
        const orderDetails = {
          order_id: data[activeContainerIndex].id,
          order_number: data[activeContainerIndex].order_number,
          product_name: product.name,
          product_price: product.price,
          category: currentCategory,
        };
        await axios.post(
          `http://localhost:${backendPort}/create-order-details`,
          orderDetails,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        data.forEach(async (item) => {
          const response = await fetchOrderDetails(item.id);
          setOrderDetails((prevOrderDetails) => ({
            ...prevOrderDetails,
            [item.order_number]: response,
          }));
        });
      }
    } catch (error) {
      console.error("Error fetching products by category:", error);
      alert(error.response.data)
    }
  };

  const handleBarCodeProducts = async (product, currentCategory) => {
    try {
      const orderDetails = {
        order_id: data[activeContainerIndex].id,
        order_number: data[activeContainerIndex].order_number,
        product_name: product.name,
        product_price: product.price,
        category: "barcode-product",
      };
      await axios.post(
        `http://localhost:${backendPort}/create-order-details`,
        orderDetails,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      data.forEach(async (item) => {
        const response = await fetchOrderDetails(item.id);
        setOrderDetails((prevOrderDetails) => ({
          ...prevOrderDetails,
          [item.order_number]: response,
        }));
      });

      setSearchBarcode("");
    } catch (error) {
      console.error("Error fetching products by category:", error);
      alert(error.response.data)
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
    try {
    e.preventDefault();

    if (barCode.length === 13) {
      const response = await axios.get(
        `http://localhost:${backendPort}/get-barcode-product?bar_code=${barCode}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      handleBarCodeProducts(response.data);
    }

    setSearchBarcode("");

    // Focus the search bar input field
    searchBarcodeRef.current.focus();
   } catch(error) {
      alert(error.response.data);
   }
  };

  const handleLogout = async (e) => {
    localStorage.removeItem('token');
    window.location.href = "/"
  }

  const handleIconClick = async (e) => {
    setMenuStatus(true);
  }

  

  useEffect(() => {
    const getCurrentDate =  (e) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  
      const currentDate = new Date();
      const day = days[currentDate.getDay()];
      const date = currentDate.getDate();
      const month = months[currentDate.getMonth()];
      const year = currentDate.getFullYear();
  
      return `${day}, ${month} ${date}, ${year}`;
    };

    const todayDate = getCurrentDate();
    setCurrentDate(todayDate);
  },[])


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

    if( tokenData.role === 'Admin' ) {
      setAdminStatus(true);
    }

    if (tokenData.exp) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp > tokenData.exp) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      fetchData();
    }
  }, [])

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if(event.target.classList.contains('search-box') && showProductList === false) {
        searchBarcodeRef.current.blur();
      }
      else if ((event.target.classList.contains('btn-container') &&  (showProductList === false))){
        searchBarcodeRef.current.focus();
      }
      else if (showProductList === false
      ) {
        searchBarcodeRef.current.focus();
      }
      
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [showProductList, menuStatus]);

  useEffect(() => {
    containerRefs.current = containerRefs.current.slice(0, data.length);
  }, [data.length]);

  useEffect(() => {
    if (data.length > 0) {
      data.forEach(async (item) => {
        const response = await fetchOrderDetails(item.id);
        setOrderDetails((prevOrderDetails) => ({
          ...prevOrderDetails,
          [item.order_number]: response,
        }));
      });
    }
  }, [data, data.length]);

  useEffect(() => {
    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    // Set a timer to refresh orders after midnight
    const timerId = setTimeout(fetchData, msUntilMidnight);

    // Clean up the timer when the component is unmounted
    return () => clearTimeout(timerId);
  })

  return (
    <div className="container">
      <div className="left-container">
        <div className="btn-container">
          {isAdmin && addProductStatus && (
            <Link to="/add-product" className="order-link">
              <div className="arrow-container-order">
                <span className="arrow-order">Add Product</span>
              </div>
            </Link>
          )}
          {isAdmin && addProductStatus && (
            <Link to="/sign-up" className="order-link">
              <div className="arrow-container-order-sign">
                <span className="arrow-order-sign">Sign up</span>
              </div>
            </Link>
          )}

          {/* <div className="logout">
              <span className="arrow-order-sign" onClick={handleLogout}>Log out</span>
        </div> */}
          <div className="account-icon">
              <FontAwesomeIcon icon={faUserCircle} size="2x" onClick={handleIconClick}/>
          </div> 
           {
            menuStatus && (
              <div className='menu'>
              <p onClick={handleLogout}>Logout</p>
              <Link to="/reset-password">
                <p>Reset Password</p>
              </Link>
             </div> 
            )}
           
          {backStatus && (
            <div
              className="arrow-container-order"
              onClick={() => {
                setShowProductList(false);
                setAddProductStatus(true);
                if (backStatus === true) {
                  setBackStatus(false);
                }
              }}
            >
              <span className="arrow-order">&#x2190;</span>
            </div>
          )}
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
              <h2 className="heading">Milkshake</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Icescream")}
            >
              <h2 className="heading">Icescream</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Sandwiches")}
            >
              <h2 className="heading">Sandwiches</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Mastani")}
            >
              <h2 className="heading">Mastani</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Burgers")}
            >
              <h2 className="heading">Burgers</h2>
            </div>
            <div
              className="box"
              onClick={() => handleBoxContainerClick("Juices")}
            >
              <h2 className="heading">Juices</h2>
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
                />
              </Form.Group>
            </Form>
          </div>
        )}
      </div>

      <div className="right-container">
        <p className="date">{currentDate}</p>
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
                                      orderDetail.order_id
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
                                      orderDetail.order_id
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
                                    orderDetail.order_id
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
                                    orderDetail.order_id
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

      {errorStatus && (
        <div className="error-container-order">
          <span className="exclamation-mark">!</span>
          <p className="error-message-order"> Kindly Select an order</p>
        </div>
      )}
    </div>
  );
};

export default OrderPage;

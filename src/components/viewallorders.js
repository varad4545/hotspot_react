import React, { useState, useEffect } from "react";
import "../styles/viewallorders.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Joi from "joi";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

const ViewAllOrdersPage = () => {
  const [orderData, setOrderData] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});

  const [orderNumber, setOrderNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [updateOrderStatus, setUpdateOrderStatus] = useState("");

  let currentToken = localStorage.getItem('token');

  const fetchData = async (filter) => {
    try {
      let response;
      const baseUrl = `http://localhost:${backendPort}/get-all-orders`;

      if (!filter) {
        response = await axios.get(baseUrl, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } else {
        // Send filter parameters as query parameters
        const params = new URLSearchParams(filter).toString();
        response = await axios.get(`${baseUrl}?${params}`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }
      setOrderData(response.data);

      // Fetching order details for each order
      for (let order of response.data) {
        const detailsResponse = await axios.get(
          `http://localhost:${backendPort}/get-all-order-details?order_id=${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          [order.id]: detailsResponse.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleOrderNumberInput = (e) => {
    const value = e.target.value;
    if (!/^[0-9]*$/.test(value)) {
      e.target.value = value.replace(/[^0-9]/g, ""); // Removing non-digit characters
    }
  };

  const handleSearch = () => {
    const filter = {
      orderNumber,
      orderStatus,
      orderDate,
    };

    fetchData(filter);
  };

  const handleResetSearch = () => {
    setOrderStatus("");
    setOrderNumber("");
    setOrderDate("");
  };

  const handleUpdateStatus = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:${backendPort}/update-order-status`,
        {
          id,
          updateOrderStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (response.data) {
        const updatedOrders = orderData.map((order) => {
          if (order.id === id) {
            return { ...order, status: updateOrderStatus };
          }
          return order;
        });

        setOrderData(updatedOrders);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
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
      <div className="all-orders-main-container">
        <div className="search-options">
          <input
            placeholder="Order Number..."
            type="text"
            className="order-number-option"
            pattern="^[0-9]+$"
            onInput={handleOrderNumberInput}
            onChange={(e) => setOrderNumber(e.target.value)}
            value={orderNumber} // bind input value to state
          />

          <select
            className="status-option"
            placeholder="Status..."
            onChange={(e) => setOrderStatus(e.target.value)}
            value={orderStatus} // bind select value to state
            defaultValue=""
          >
            <option value="" disabled>
              Select a status...
            </option>
            <option value="pending">pending</option>
            <option value="completed">completed</option>
          </select>

          <input
            placeholder="Date..."
            type="date"
            className="date-option"
            onChange={(e) => setOrderDate(e.target.value)}
            value={orderDate} // bind input value to state
          />

          <FontAwesomeIcon
            icon={faSearch}
            className="search-icon"
            onClick={handleSearch}
          />
        </div>

        <p className="reset-text" onClick={handleResetSearch}>
          Reset
        </p>

        <div className="scrollable-container-all-orders">
          {orderData &&
            orderData.map((order, index) => (
              <div className="order-info">
                <div className="details-heading">
                  <p>Order</p>
                  <p className="order-status-p">Status</p>
                  <p className="order-date-p">Date</p>
                  <p className="order-details-p">Order details</p>
                </div>
                <div className="details-info">
                  <div className="details-info-1">
                    <div className="basic-order-info-container">
                      <div className="basic-order-info">
                        <p className="order-number-p">{order.order_number}</p>
                        <p className="pending-p">{order.status}</p>
                        <p className="date-p">8/10/23</p>
                      </div>

                      <div className="edit-status-container">
                        <select
                          className="edit-status-select"
                          placeholder="Status..."
                          onChange={(e) => setUpdateOrderStatus(e.target.value)}
                          value={updateOrderStatus} // bind select value to state
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Status...
                          </option>
                          <option value="pending">pending</option>
                          <option value="completed">completed</option>
                        </select>
                        <p
                          className="update-status-text"
                          onClick={() => handleUpdateStatus(order.id)}
                        >
                          Update
                        </p>
                      </div>
                    </div>

                    <div className="order-details-all-orders">
                      <div className="order-details-heading">
                        <p className="order-name-p">Name</p>
                        <p className="order-quantity-p">Quantity</p>
                        <p className="order-price-p">Price</p>
                      </div>
                      {orderDetails[order.id] &&
                        orderDetails[order.id].map((detail) => (
                          <div className="order-details-info" key={detail.id}>
                            {" "}
                            {/* Assuming details have an 'id' */}
                            <p>{detail.product_name}</p>
                            <p>{detail.quantity}</p>
                            <p>{detail.total_price}</p>
                          </div>
                        ))}
                       <div>
                        dnwpdn[2'd]
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default ViewAllOrdersPage;

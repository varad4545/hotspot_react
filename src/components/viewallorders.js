import React, { useState, useEffect } from "react";
import "../styles/viewallorders.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

const ViewAllOrdersPage = () => {
  const [orderData, setOrderData] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});

  const [orderNumber, setOrderNumber] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [updateOrderStatus, setUpdateOrderStatus] = useState("");

  let currentToken = localStorage.getItem("token");

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
        const params = new URLSearchParams(filter).toString();
        response = await axios.get(`${baseUrl}?${params}`, {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }
      setOrderData(response.data);

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
      e.target.value = value.replace(/[^0-9]/g, "");
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
      console.error("Error updating status:", error);
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
  }, []);

  return (
    <div className="all-orders-main-container">
      <div className="search-options">
        <div className="order-number-wrapper">
          <input
            placeholder="Order Number..."
            type="text"
            className="order-number-option"
            pattern="^[0-9]+$"
            onInput={handleOrderNumberInput}
            onChange={(e) => setOrderNumber(e.target.value)}
            value={orderNumber}
          />
          {/* <FontAwesomeIcon
            icon={faSearch}
            className="search-icon"
            onClick={handleSearch}
          /> */}
        </div>
        <select
          className="status-option"
          placeholder="Status..."
          onChange={(e) => setOrderStatus(e.target.value)}
          value={orderStatus}
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
          value={orderDate}
        />

        <button className="reset-button" onClick={handleResetSearch}>
          Reset
        </button>
      </div>

      <div className="scrollable-container-all-orders">
        {orderData &&
          orderData.map((order) => (
            <div className="order-info" key={order.id}>
              <div className="order-inner-container"></div>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Order Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{order.order_number}</td>
                    <td>{order.status}</td>
                    <td>8/10/23</td>
                    <td>
                      {orderDetails[order.id] && (
                        <div className="order-detail-columns">
                          <div className="order-detail-column">
                            <strong>Name</strong>
                            {orderDetails[order.id].map((detail) => (
                              <div key={detail.id}>{detail.product_name}</div>
                            ))}
                          </div>
                          <div className="order-detail-column">
                            <strong>Quantity</strong>
                            {orderDetails[order.id].map((detail) => (
                              <div key={detail.id}>{detail.quantity}</div>
                            ))}
                          </div>
                          <div className="order-detail-column">
                            <strong>Price</strong>
                            {orderDetails[order.id].map((detail) => (
                              <div key={detail.id}>{detail.total_price}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="edit-status-container">
                <select
                  className="edit-status-select"
                  onChange={(e) => setUpdateOrderStatus(e.target.value)}
                  value={updateOrderStatus}
                >
                  <option value="" disabled>
                    Status...
                  </option>
                  <option value="pending">pending</option>
                  <option value="completed">completed</option>
                </select>
                <button
                  className="update-status-text"
                  onClick={() => handleUpdateStatus(order.id)}
                >
                  Update
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ViewAllOrdersPage;

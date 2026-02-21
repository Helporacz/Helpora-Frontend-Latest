import React, { useState, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateFilter.scss";

const DateFilter = ({ onFilterChange, className = "", initialFilter = "thisMonth" }) => {
  const [dateFilter, setDateFilter] = useState(initialFilter);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const isInitialMount = useRef(true);

  const getDateRange = (filter) => {
    const now = new Date();
    let start = null;
    let end = null;

    switch (filter) {
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case "last3Months":
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case "custom":
        return { start, end };
      default:
        start = null;
        end = null;
    }

    return { start, end };
  };

  // Initialize on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const { start, end } = getDateRange(initialFilter);
      setStartDate(start);
      setEndDate(end);
      onFilterChange({
        dateFilter: initialFilter,
        startDate: start,
        endDate: end,
      });
    }
  }, []);

const handleDateFilterChange = (value) => {
  setDateFilter(value);
  
  if (value === "custom") {
    if (startDate && endDate) {
      onFilterChange({ 
        dateFilter: value, 
        startDate, 
        endDate 
      });
    }
    return;
  }

  const { start, end } = getDateRange(value);
  setStartDate(start);
  setEndDate(end);
    
  onFilterChange({ 
    dateFilter: value, 
    startDate: start, 
    endDate: end 
  });
};

  const handleCustomDateChange = (type, date) => {
    if (type === "start") {
      const start = date ? new Date(date) : null;
      if (start) start.setHours(0, 0, 0, 0);
      setStartDate(start);
      
      if (start && endDate) {
        onFilterChange({ 
          dateFilter: "custom", 
          startDate: start, 
          endDate 
        });
      }
    } else {
      const end = date ? new Date(date) : null;
      if (end) end.setHours(23, 59, 59, 999);
      setEndDate(end);
      
      if (startDate && end) {
        onFilterChange({ 
          dateFilter: "custom", 
          startDate, 
          endDate: end 
        });
      }
    }
  };

  useEffect(() => {
    if (dateFilter !== "custom") {
      const { start, end } = getDateRange(dateFilter);
      setStartDate(start);
      setEndDate(end);
    }
  }, [dateFilter]);

  return (
    <div className="w-full">
      <div className={`${className}`} style={{ gap: "15px" }}>
        <div className="d-flex align-items-center justify-content-end">
          <Form.Select
            value={dateFilter}
            onChange={(e) => handleDateFilterChange(e.target.value)}
            className="date-filter-select"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="custom">Custom Date Range</option>
          </Form.Select>
        </div>

        {dateFilter === "custom" && (
          <div className="custom-date-range">
            <div className="d-flex" style={{ gap: "10px", marginTop: "12px" }}>
              <div className="date-picker-group">
                <label style={{ color: "black" }}>Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => handleCustomDateChange("start", date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={endDate || new Date()}
                  dateFormat="yyyy-MM-dd"
                  className="form-control"
                  placeholderText="Select start date"
                  isClearable
                />
              </div>
              <div>
                <div className="date-picker-group">
                  <label style={{ color: "black" }}>End Date:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => handleCustomDateChange("end", date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                    placeholderText="Select end date"
                    isClearable
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;
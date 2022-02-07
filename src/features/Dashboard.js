import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from 'react-bootstrap';
import Modal from 'react-modal';
import { useForm } from 'react-hook-form';
import '../index.css';
import { columns } from './components/dataColumns';
import { DatePicker, Space, Checkbox } from 'antd';
import 'antd/dist/antd.min.css';
import moment from 'moment';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import _, { isUndefined } from 'lodash';
import {
  customStyles,
  searchDivStyle,
  searchStyle,
  buttonStyle1,
  buttonStyle2,
} from './styles/styles.js';
import constants from 'common/utils/constants';
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const { RangePicker } = DatePicker;

const DataTable = () => {
  var subtitle = '';
  const [tableData, setTableData] = useState([]);
  const [tableDataBackup, setTableDataBackup] = useState([]);
  const [modalIsOpen2, setIsOpen2] = React.useState(false);
  const [modalIsOpen1, setIsOpen1] = React.useState(false);
  const [productName, setProductName] = React.useState('');
  const [product, setProduct] = useState({});
  const [repair, setRepair] = useState(false);
  const [dayRange1, setDayRange1] = useState(0);
  const [dayRange2, setDayRange2] = useState(0);
  const [calPrice1, setCalPrice1] = useState(0);
  const [calPrice2, setCalPrice2] = useState(0);
  const [mileage, setMileage] = useState(null);
  const [showSnack, setShowSnack] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    if (!isUndefined(data.mileage) || !_.isNaN(data.mileage)) {
      setMileage(data.mileage);
    }
  };

  useEffect(() => {
    fetch(`${constants.HOST_URL}/product/`)
      .then((data) => data.json())
      .then((data) => setTableData(data) | setTableDataBackup(data));
  }, []);

  function onFilterTextChange(e) {
    fetch(`${constants.HOST_URL}/product/`)
      .then((data) => data.json())
      .then((data) => setTableDataBackup(data)); //This data should come from redux or saga
    var search = e.target.value; // Search String
    if (search !== '') {
      var list = _.filter(tableDataBackup, function (item) {
        return (
          _.includes(
            item.id !== null ? item.id.toString().toLowerCase() : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.code !== null ? item.code.toString().toLowerCase() : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.name !== null ? item.name.toString().toLowerCase() : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.product_type !== null
              ? item.product_type.toString().toLowerCase()
              : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.availability !== null
              ? item.availability.toString().toLowerCase()
              : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.needing_repair !== null
              ? item.needing_repair.toString().toLowerCase()
              : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.durability !== null
              ? item.durability.toString().toLowerCase()
              : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.max_durability !== null
              ? item.max_durability.toString().toLowerCase()
              : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.mileage !== null ? item.mileage.toString().toLowerCase() : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.price !== null ? item.price.toString().toLowerCase() : '',
            search.toString().toLowerCase()
          ) ||
          _.includes(
            item.minimum_rent_period !== null
              ? item.minimum_rent_period.toString().toLowerCase()
              : '',
            search.toString().toLowerCase()
          )
        );
      });
      setTableData(list);
    } else {
      //if search string is empty returns the whole list
      fetch(`${constants.HOST_URL}/product/`)
        .then((data) => data.json())
        .then((data) => setTableData(data));
    }
  }

  function calculatePrice1() {
    if (dayRange1 === 0) {
      //Means user did not select date range so show a error
      setShowSnack({
        open: true,
        message: 'Please select a day range.',
        type: 'error',
      });
    } else if (dayRange1 >= product.minimum_rent_period) {
      //checks if minimum rent period is greater than date range
      setCalPrice1(dayRange1 * product.price);
    } else {
      setShowSnack({
        open: true,
        message:
          'Selected date range should be greater than minimum rent period.',
        type: 'error',
      });
    }
  }

  function calculatePrice2() {
    if (dayRange2 === 0) {
      //Means user did not select date range so show a error
      setShowSnack({
        open: true,
        message:
          'Selected date range should be greater than minimum rent period.',
        type: 'error',
      });
    } else {
      setCalPrice2(dayRange2 * product.price);
    }
  }
  function confirmBooking() {
    fetch(`${constants.HOST_URL}/product/${product.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        availability: false,
      }),
    })
      .then((res) =>
        (res.status !== 200
          ? setShowSnack({
            open: true,
            message: 'Something went wrong. Try again.',
            type: 'error',
          })
          : //Sets all the values to default since the request was success
          (setCalPrice2(0),
          setCalPrice1(0),
          setProduct({}),
          setProductName(''),
          setDayRange1(0),
          setDayRange2(0),
          setRepair(false),
          fetch(`${constants.HOST_URL}/product/`)
            .then((data) => data.json())
            .then((data) => setTableData(data)),
          setMileage(null),
          setIsOpen2(false),
          setIsOpen1(false),
          setShowSnack({
            open: true,
            message: 'Your data have been recorded!',
            type: 'success',
          })))
      )
      .catch((err) =>
        setShowSnack({
          open: true,
          message: err,
          type: 'error',
        })
      );
  }

  function confirmReturn() {
    fetch(`${constants.HOST_URL}/product/${product.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        availability: true,
        needing_repair: repair,
        mileage:
          isUndefined(mileage) || _.isNaN(mileage)
            ? product.mileage
            : product.mileage + parseInt(mileage),
        durability:
          //if durability is 0 no operation to be performed
          product.durability !== 0
            ? product.product_type === 'plain'
              ? product.durability - dayRange2 * 1 //if type is plain durability reduces by 1 per day
              : isUndefined(mileage) || _.isNaN(mileage)
                ? product.durability -
                (dayRange2 * 2 + (parseInt(mileage) % 10) * 2) //durability will be decreased 2 points per every day, and also decreased 2 points per 10 miles if type meter
                : product.durability - dayRange2 * 2 //if type is meter and milage is null durability reduces by 2 per day
            : 0,
      }),
    })
      .then((res) =>
        (res.status !== 200
          ? setShowSnack({
            open: true,
            message: 'Something went wrong. Try again.',
            type: 'error',
          })
          : //Sets all the values to default since the request was success
          (setCalPrice2(0),
          setProduct({}),
          setProductName(''),
          setCalPrice1(0),
          setDayRange2(0),
          setRepair(false),
          setDayRange1(0),
          setMileage(null),
          fetch(`${constants.HOST_URL}/product/`)
            .then((data) => data.json())
            .then((data) => setTableData(data)),
          setIsOpen2(false),
          setIsOpen1(false),
          setShowSnack({
            open: true,
            message: 'Your data have been recorded!',
            type: 'success',
          })))
      )
      .catch((err) =>
        setShowSnack({
          open: true,
          message: err,
          type: 'error',
        })
      );
  }

  function openModal1() {
    if (_.isEmpty(product)) {
      setShowSnack({
        open: true,
        message: 'Please select a product first',
        type: 'error',
      });
    } else if (product.availability === false) {
      setShowSnack({
        open: true,
        message: 'The product is not available',
        type: 'error',
      });
    } else {
      setIsOpen1(true);
    }
  }

  function openModal2() {
    if (_.isEmpty(product)) {
      setShowSnack({
        open: true,
        message: 'Please select a product first',
        type: 'error',
      });
    } else if (product.availability === true) {
      setShowSnack({
        open: true,
        message: 'The product was not rented',
        type: 'error',
      });
    } else {
      setIsOpen2(true);
    }
  }
  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }
  function closeModal() {
    setCalPrice2(0);
    setProduct({});
    setProductName('');
    setCalPrice1(0);
    setDayRange2(0);
    setRepair(0);
    setDayRange1(0);
    setIsOpen2(false);
    setIsOpen1(false);
  }
  function getProductName(id) {
    tableData.map((value) =>
      (value.id === id ? setProductName(value.name) : '')
    );
  }
  function getProductDetails(id) {
    tableData.map((value) => (value.id === id ? setProduct(value) : {}));
  }
  function onChangeDate2(dates, dateStrings) {
    getRange2(dates[0], dates[1], 'days');
  }
  function onChangeDate1(dates, dateStrings) {
    getRange1(dates[0], dates[1], 'days');
  }
  function onChangeCheck(e) {
    setRepair(e.target.checked);
  }
  function getRange2(startDate, endDate, type) {
    let fromDate = moment(startDate);
    let toDate = moment(endDate);
    let diff = toDate.diff(fromDate, type);
    let range = [];
    for (let i = 0; i < diff; i++) {
      range.push(moment(startDate).add(i, type));
    }
    setDayRange2(range.length + 1);
  }
  function getRange1(startDate, endDate, type) {
    let fromDate = moment(startDate);
    let toDate = moment(endDate);
    let diff = toDate.diff(fromDate, type);
    let range = [];
    for (let i = 0; i < diff; i++) {
      range.push(moment(startDate).add(i, type));
    }
    setDayRange1(range.length + 1);
  }
  const handleClose = () => {
    setShowSnack({ ...showSnack, open: false });
  };

  Modal.setAppElement('#root');
  return (
    <div className="App center">
      <h1 align="center">Rental Products</h1>
      <h4 align="center">
        <br />
        Click on the product to select it.
      </h4>
      <div className="form=part">
        <div style={searchDivStyle}>
          <input
            type="search"
            style={searchStyle}
            onChange={onFilterTextChange}
            placeholder="search by any keyword..."
          />
        </div>
        <div className="ag-theme-alpine-dark" style={{ height: 100 }}>
          <div
            style={{ height: 610, width: '100%', backgroundColor: '#ffffff' }}
          >
            <DataGrid
              rows={tableData}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              sx={{
                boxShadow: 1,
                border: 1,
                borderColor: 'primary.light',
                '& .MuiDataGrid-cell:hover': {
                  color: '#2196f3',
                },
              }}
              onSelectionModelChange={(newSelection) => {
                getProductName(newSelection[0]);
                getProductDetails(newSelection[0]);
              }}
            />
          </div>
          {'   '}
          <div
            className="d-grid"
            style={{
              display: 'flex',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              style={buttonStyle1}
              onClick={openModal1}
            >
              Book Product
            </Button>
            <Button
              variant="secondary"
              style={buttonStyle2}
              size="lg"
              onClick={openModal2}
            >
              Return Product
            </Button>
          </div>
          <div>
            <Modal
              isOpen={modalIsOpen1}
              onAfterOpen={afterOpenModal}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Book"
            >
              <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Book</h2>
              <Space direction="vertical" size={14}>
                <input
                  type="text"
                  placeholder="Product"
                  defaultValue={productName}
                  readOnly
                />
                <RangePicker
                  ranges={{
                    Today: [moment(), moment()],
                    'This Month': [
                      moment().startOf('month'),
                      moment().endOf('month'),
                    ],
                  }}
                  onChange={onChangeDate1}
                />
                <button
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '10px',
                  }}
                  onClick={calculatePrice1}
                >
                  Calculate Price
                </button>
                <h4>Total Price</h4>
                <p>Price: {calPrice1}</p>
                {calPrice1 === 0 ? null : (
                  <button
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: '10px',
                    }}
                    onClick={confirmBooking}
                  >
                    Confirm Booking
                  </button>
                )}
              </Space>
            </Modal>
          </div>
          <div>
            <Modal
              isOpen={modalIsOpen2}
              onAfterOpen={afterOpenModal}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Return"
            >
              <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Return</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Space direction="vertical" size={14}>
                  <input
                    type="text"
                    placeholder="Product"
                    defaultValue={productName}
                    readOnly
                  />
                  <RangePicker
                    ranges={{
                      Today: [moment(), moment()],
                      'This Month': [
                        moment().startOf('month'),
                        moment().endOf('month'),
                      ],
                    }}
                    onChange={onChangeDate2}
                  />
                  {product.mileage === null ? null : (
                    <input
                      type="number"
                      placeholder="Used Mileage"
                      {...register('mileage', {
                        valueAsNumber: true,
                        pattern: {
                          value: /^[0-9]+$/,
                          message: 'Please enter a number',
                        },
                      })}
                    />
                  )}
                  <Checkbox checked={repair} onChange={onChangeCheck}>
                    Does the product need repair?
                  </Checkbox>
                  <button
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: '10px',
                    }}
                    onClick={calculatePrice2}
                  >
                    Calculate Price
                  </button>
                  <h4>Total Price</h4>
                  <p>Price: {calPrice2}</p>
                  {calPrice2 === 0 ? null : (
                    <button
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: '10px',
                      }}
                      onClick={confirmReturn}
                    >
                      Confirm Return
                    </button>
                  )}
                </Space>
              </form>
            </Modal>
          </div>
          <Snackbar
            open={showSnack.open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={showSnack.type} sx={{ width: '100%' }}>
              {showSnack.message}
            </Alert>
          </Snackbar>
          <div />
        </div>
      </div>
    </div>
  );
};

export default DataTable;

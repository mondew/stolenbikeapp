import React, { Component } from "react";
import "antd/dist/antd.css";
import "../index.css";
import axios from 'axios';
import { Card, Pagination, Input } from "antd";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import "react-dates/initialize";

export class StolenBikeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minValue: 0,
      maxValue: 10,
      data: [],
      perPage: 10,
      currentPage: 1,
      loading: true,
      bikeImage: '',
      search: [],
      message: false,
      focused: null,
      startDate: '',
      endDate: '',
      error: null,
      errorInfo: null,
      newDates: false,
      clearState:true
    };
  }
  handleChange = value => {
    (value <= 1) ?
      this.setState({
        minValue: 0,
        maxValue: 10
      })
      :
      this.setState({
        minValue: this.state.maxValue,
        maxValue: value * 10
      });

  };
  receivedData() {
    axios
      .get(`https://bikewise.org:443/api/v2/incidents?page=1&proximity=Delhi&proximity_square=100`)
      .then(res => {
        const data = res.data.incidents;
        if (data) {
          this.setState({
            loading: true,
            pageCount: Math.ceil(data.length / this.state.perPage),
            data,
            message: false
          })
        }
        else this.setState({ message: true });
      }).catch((error) => {
        this.setState({ message: true, loading: false, data: null, error: error });
      });
  }
  componentDidMount() {
    this.receivedData();
  }
  onShowSizeChange(current, pageSize) {
    console.log(current, pageSize);
  }
  onDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate, newDates: true,clearState:true })
  }
 
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }
  bikeLogic =(filteredData,msg) =>{
    const { data } = this.state;
    const bikeData = this.state.loading && data && data.length > 0 && filteredData.length > 0 ?
          filteredData.map(val => {
            return (
              <Card className="card"
               title={val.title}
              ><div className="imgTag">
                  <div>
                    <img alt="" width="80" height="80px" src={val.media.image_url} />
                  </div><div className="cText">
                    <p>{val.description + val.address + val.location_type + new Date(val.occurred_at)}</p></div></div>
              </Card>
            )
              }) : <h2>{msg}</h2>
                            return bikeData;
  }
  render() {
    const { data } = this.state;
    const Search = Input.Search;
    let filteredData =[];
    if (data === null || data === []) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />

          </details>
        </div>)
    } else {
      let temp = true;
      const slicedData = data.slice(this.state.minValue, this.state.minValue + this.state.perPage);
      const searchPattern = new RegExp(this.state.search.map(term => `(?=.*${term})`).join(''), 'i');
      this.state.search.length && this.state.clearState ?
        filteredData = slicedData.filter(l => {
          const seletecText = l.title.toLowerCase().match(searchPattern);
          if(seletecText){ 
            temp = true;
            return seletecText;
          } 
          temp = false;
          return seletecText;
        }) : this.state.newDates  && this.state.startDate !== null && this.state.endDate !== null  ? (
          filteredData = slicedData.filter((item) => {
            const comparedDate = item.occurred_at >= this.state.startDate._d.getTime() && item.occurred_at <= this.state.endDate._d.getTime();
            if (comparedDate){
              temp = true;
              return comparedDate;
            }
            temp = false;
            return comparedDate;
          })) : filteredData = slicedData ;
      let msg;
      let bikeData;
      if ( temp === false  && filteredData.length === this.state.search.length !== 0) {
        msg = <h2>No Data Found</h2>
        bikeData = this.bikeLogic(filteredData,msg);
      }
      else {
        msg =<h2>Loading...</h2>
        bikeData = this.bikeLogic(filteredData,msg)
      }
      return (
        <div className="mainContainer">
          <div className="heading">
          <h1>Police Department Of Delhi</h1>
          <h5 className="subHeading">stolen Bikes</h5>
          </div>
          <div className="search">
            <Search placeholder="search case title" style={{ width: 200 }} onChange={(e) => {
              this.setState({ search: e.target.value.split(' ') })
            }} />
            <div className="calendar">
              <DateRangePicker
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onDatesChange={this.onDatesChange}
                focusedInput={this.state.focused}
                onFocusChange={focusedInput => this.setState({ focused: focusedInput,clearState:false })}
                numberOfMonths={2}
                isOutsideRange={() => false}
                showClearDates={true}
              />
            </div>
          </div>
          <div className="container">
            {this.state.message ? <h2>Please Check Your Network Connection</h2> : bikeData}
          </div>
          {(this.state.message) ?
            (<div><h2>Please Check Your Network Connection</h2></div>)
            :
            (
              <div className="pagination">
                <Pagination
                  total={data.length}
                  showTotal={total => `Total ${filteredData.length}/ ${total} items`}
                  defaultCurrent={1}
                  defaultPageSize={10}
                   showSizeChanger onShowSizeChange={this.onShowSizeChange}
                  onChange={this.handleChange}
                />
              </div>)}
        </div>
      );
    }
  }
}

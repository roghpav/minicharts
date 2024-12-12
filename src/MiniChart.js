//  Pavel Figueroa
//
//  figueroa.pav@gmail.com
//
// 
// Original https://github.com/iifksp/react-mini-chart
//
// Modified version to show a mini chart  with axis 
//
// props:
//  dataSet             -> one dimensional array, this array will be plot
//  width               -> width of plot
//  height              -> height of plot
//  strokeColor         -> string
//  strokeWidth         -> number
//  padding:            -> string
//  activePointRadius:  -> number
//  activePointColor:   -> string
//  labelFontSize:      -> string

import React from 'react'
import PropTypes from 'prop-types';

class MiniChart extends React.Component {
  constructor() {
    super();
    this.points = [];
    this.state = {
      aIdx: -1
    }
  }

  handleMouseMove = (e) => {
    let mx = e.nativeEvent.offsetX;
    const span = this.props.width / (this.props.dataSet.length - 1);
    const offset = Math.floor(span / 2);
    let idx = -1;
    for (let i = 0; i < this.points.length; i++) {
      if (mx < this.points[i].x + offset && mx > this.points[i].x - offset) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      this.setState({ aIdx: idx });
    }
  };

  handleMouseLeave = () => {
    this.setState({ aIdx: -1 });
  };

  render() {
    const {
      dataSet,
      width,
      height,
      strokeColor,
      strokeWidth,
      padding,
      activePointRadius,
      activePointColor,
      labelFontSize,
    } = this.props;

   

    const edgeFactor = Math.max(Math.ceil(strokeWidth / 2), activePointRadius);
    const len = dataSet.length;
    
    const max = Math.max(...dataSet)
    const min = Math.min(...dataSet)

    const paddingNum = `${padding}`.indexOf('%') >= 0 ? (parseInt(padding) / 100) * height : padding;
    const pointsY = dataSet.map(function (val) {
      return (height) - (Math.round((val / (max - min)) * (height - paddingNum * 2)) + paddingNum * 2) + min;
    });

    this.points = [];

    for (let i = 0; i < len; i++) {
      // calculate each pointX
      let pointX = edgeFactor + Math.round(i * ((width - edgeFactor * 2) / (len - 1)));

      // store all point pairs
      this.points.push({ x: pointX, y: pointsY[i] });
    }

    // compose polyline points param
    const param = this.points.map(function (elm) {
      return (elm.x + ',' + elm.y)
    }).join(' ');

    const polyline =
      <polyline
        style={{ transition: 'all 0.3s' }}
        points={param}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />;

    const viewBox = '0 0 ' + width + ' ' + height;


    // Drawn Axis
    const yaxisviewBox = "0,0 0,"+ height;
    const yaxispolyline = <polyline points={yaxisviewBox} stroke="black"/>
    const xaxisviewBox = "0," + height + " "+width+","+height
    const xaxispolyline = <polyline points={xaxisviewBox} stroke="black"/>

    // y axis sticks

    const yaxissticks1 = <text x="0" y="10" stroke="black" style={{fontSize:10}}>{Math.max(...dataSet)}</text>
    const yaxissticks2 = <text x="0" y={Number(height)-2} stroke="black" style={{fontSize:10}} >{Math.min(...dataSet)}</text>


    const activePoint = this.state.aIdx >= 0 ?
      <circle
        fill={activePointColor}
        cx={this.points[this.state.aIdx].x}
        cy={this.points[this.state.aIdx].y}
        r={activePointRadius} /> : '';

    const tip = this.state.aIdx >= 0 ?
      <span
        style={{
          fontSize: labelFontSize,
          border: '1px solid #ddd',
          lineHeight: '1.2',
          padding: `0 ${labelFontSize / 5}px`,
          borderRadius: 1,
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255, 0.8)',
          color: strokeColor,
          position: 'absolute',
          userSelect: 'none',
          top: this.points[this.state.aIdx].y - (labelFontSize * 1.3) - activePointRadius,
          left: this.points[this.state.aIdx].x
        }}>
        {this.props.dataSet[this.state.aIdx]}
      </span>
      :
      '';

    return (
      <div
        style={{
          display: 'inline-block',
          position: 'relative'
        }}
        onMouseLeave={this.handleMouseLeave}
      >
        <svg
          onMouseMove={this.handleMouseMove}
          style={{ transition: 'all 0.3s', display: 'block' }}
          width={width}
          height={height}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox={viewBox}
        >
          {yaxispolyline}
          {xaxispolyline}
          {polyline}
          {activePoint}
          {yaxissticks1}
          {yaxissticks2}
        </svg>
        {tip}
      </div>
    )
  }
}

MiniChart.defaultProps = {
  dataSet: [],
  width: 100,
  height: 50,
  strokeColor: '#039BE5',
  strokeWidth: 1.5,
  padding: '15%',
  activePointRadius: 3,
  labelFontSize: 14,
  activePointColor: '#039BE5',
};

MiniChart.propTypes = {
  dataSet: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  padding: PropTypes.string,
  activePointRadius: PropTypes.number,
  activePointColor: PropTypes.string,
  labelFontSize: PropTypes.number,
};

export default MiniChart;
//  Pavel Figueroa
//  figueroa.pav@gmail.com
//
// Based on https://github.com/iifksp/react-mini-chart
// Enhanced version with axis, improved scaling, and better performance
//
// props:
//  dataSet             -> one dimensional array of numbers to plot
//  width               -> width of plot in pixels
//  height              -> height of plot in pixels
//  strokeColor         -> string for line color
//  strokeWidth         -> number for line thickness
//  padding             -> string (percentage or pixels)
//  activePointRadius   -> number for hover point radius
//  activePointColor    -> string for hover point color
//  labelFontSize       -> number for tooltip font size
//  axisColor           -> string for axis color
//  axisLabelColor      -> string for axis label color
//  axisLabelSize       -> number for axis label font size
//  responsive          -> boolean to enable responsive sizing

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const MiniChart = ({
  dataSet = [],
  width = 100,
  height = 50,
  strokeColor = '#039BE5',
  strokeWidth = 1.5,
  padding = '15%',
  activePointRadius = 3,
  activePointColor = '#039BE5',
  labelFontSize = 14,
  axisColor = 'black',
  axisLabelColor = 'black',
  axisLabelSize = 10,
  responsive = false
}) => {
  const [activePointIndex, setActivePointIndex] = useState(-1);

  // Convert padding to number
  const getPaddingValue = useMemo(() => {
    const paddingStr = `${padding}`;
    return paddingStr.indexOf('%') >= 0 
      ? (parseInt(paddingStr) / 100) * height 
      : parseInt(paddingStr);
  }, [padding, height]);

  // Calculate data points with memoization for performance
  const { points, min, max } = useMemo(() => {
    if (!dataSet.length) {
      return { points: [], min: 0, max: 0 };
    }
    
    const dataMax = Math.max(...dataSet);
    const dataMin = Math.min(...dataSet);
    const range = dataMax - dataMin || 1; // Prevent division by zero
    
    const edgeFactor = Math.max(Math.ceil(strokeWidth / 2), activePointRadius);
    const effectiveWidth = width - edgeFactor * 2;
    const effectiveHeight = height - getPaddingValue * 2;
    
    const calculatedPoints = dataSet.map((val, i) => {
      // Calculate X position
      const x = edgeFactor + Math.round(i * (effectiveWidth / (dataSet.length - 1 || 1)));
      
      // Properly normalize and calculate Y position
      const normalizedValue = (val - dataMin) / range;
      const y = height - (Math.round(normalizedValue * effectiveHeight) + getPaddingValue);
      
      return { x, y };
    });
    
    return { points: calculatedPoints, min: dataMin, max: dataMax };
  }, [dataSet, width, height, strokeWidth, activePointRadius, getPaddingValue]);

  // Generate SVG polyline points parameter
  const polylinePoints = useMemo(() => {
    return points.map(point => `${point.x},${point.y}`).join(' ');
  }, [points]);

  // Handle mouse movement to detect active point
  const handleMouseMove = useCallback((e) => {
    if (!points.length) return;
    
    const mouseX = e.nativeEvent.offsetX;
    const span = width / (dataSet.length - 1 || 1);
    const offset = Math.floor(span / 2);
    
    for (let i = 0; i < points.length; i++) {
      if (mouseX >= points[i].x - offset && mouseX <= points[i].x + offset) {
        setActivePointIndex(i);
        return;
      }
    }
    
    setActivePointIndex(-1);
  }, [points, width, dataSet.length]);

  // Handle mouse leaving the chart area
  const handleMouseLeave = useCallback(() => {
    setActivePointIndex(-1);
  }, []);

  // Render error message if dataset is invalid
  if (!Array.isArray(dataSet) || dataSet.length < 2) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px dashed #ccc',
          color: '#999'
        }}
      >
        Insufficient data to render chart
      </div>
    );
  }

  // Prepare SVG viewBox
  const viewBox = `0 0 ${width} ${height}`;
  
  // Prepare axis definitions
  const yAxisPath = `M0,0 L0,${height}`;
  const xAxisPath = `M0,${height} L${width},${height}`;

  return (
    <div
      style={{
        display: 'inline-block',
        position: 'relative',
        width: responsive ? '100%' : width,
        height: responsive ? 'auto' : height
      }}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label={`Mini chart with data range from ${min} to ${max}`}
    >
      <svg
        onMouseMove={handleMouseMove}
        style={{ 
          transition: 'all 0.3s',
          display: 'block',
          width: responsive ? '100%' : width,
          height: responsive ? 'auto' : height,
          aspectRatio: responsive ? `${width} / ${height}` : 'auto'
        }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio={responsive ? 'none' : 'xMidYMid meet'}
        viewBox={viewBox}
      >
        {/* Y Axis */}
        <path d={yAxisPath} stroke={axisColor} strokeWidth="1" />
        
        {/* X Axis */}
        <path d={xAxisPath} stroke={axisColor} strokeWidth="1" />
        
        {/* Y-axis labels */}
        <text 
          x="2" 
          y={axisLabelSize + 2} 
          fill={axisLabelColor} 
          style={{ fontSize: axisLabelSize }}
        >
          {max}
        </text>
        <text 
          x="2" 
          y={height - 2} 
          fill={axisLabelColor} 
          style={{ fontSize: axisLabelSize }}
        >
          {min}
        </text>
        
        {/* Main chart line */}
        <polyline
          points={polylinePoints}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Active point indicator */}
        {activePointIndex >= 0 && (
          <circle
            fill={activePointColor}
            cx={points[activePointIndex].x}
            cy={points[activePointIndex].y}
            r={activePointRadius}
          />
        )}
      </svg>
      
      {/* Tooltip */}
      {activePointIndex >= 0 && (
        <div
          style={{
            fontSize: labelFontSize,
            border: '1px solid #ddd',
            lineHeight: '1.2',
            padding: `0 ${labelFontSize / 5}px`,
            borderRadius: 3,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255, 0.9)',
            color: strokeColor,
            position: 'absolute',
            userSelect: 'none',
            top: points[activePointIndex].y - (labelFontSize * 1.3) - activePointRadius,
            left: points[activePointIndex].x,
            pointerEvents: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {dataSet[activePointIndex]}
        </div>
      )}
    </div>
  );
};

MiniChart.propTypes = {
  dataSet: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
  height: PropTypes.number,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  padding: PropTypes.string,
  activePointRadius: PropTypes.number,
  activePointColor: PropTypes.string,
  labelFontSize: PropTypes.number,
  axisColor: PropTypes.string,
  axisLabelColor: PropTypes.string,
  axisLabelSize: PropTypes.number,
  responsive: PropTypes.bool
};

export default MiniChart;
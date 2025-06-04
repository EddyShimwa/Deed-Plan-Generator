'use client';
import { useState, useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import axios from 'axios';

interface Point {
  name: string;
  easting: number;
  northing: number;
}

interface Segment {
  from_point: string;
  to_point: string;
  bearing: string;
  distance: number;
}

export default function Home() {
  const [points, setPoints] = useState<Point[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [plotData, setPlotData] = useState<{area_sqm: number, image_base64: string} | null>(null);
  const [currentPointName, setCurrentPointName] = useState('A');
  const { latitude, longitude, error: geoError, loading, getLocation } = useGeolocation();

  // Function to get next point name (A -> B -> C etc)
  const getNextPointName = (current: string) => {
    return String.fromCharCode(current.charCodeAt(0) + 1);
  };

  const addCurrentLocation = async () => {
    if (latitude && longitude) {
      const newPoint = {
        name: currentPointName,
        easting: longitude,
        northing: latitude
      };
      
      // Add point
      const newPoints = [...points, newPoint];
      setPoints(newPoints);

      // Create segment if this is not the first point
      if (points.length > 0) {
        const lastPoint = points[points.length - 1];
        const newSegment = {
          from_point: lastPoint.name,
          to_point: newPoint.name,
          bearing: "0", // This could be calculated if needed
          distance: 0   // This could be calculated if needed
        };
        setSegments([...segments, newSegment]);
      }

      // Update for next point
      setCurrentPointName(getNextPointName(currentPointName));
    }
  };

  const undoLastPoint = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
      setSegments(segments.slice(0, -1));
      setCurrentPointName(String.fromCharCode(currentPointName.charCodeAt(0) - 1));
    }
  };

  const completePolygon = () => {
    if (points.length >= 3) {
      // Add closing segment from last point to first point
      const closingSegment = {
        from_point: points[points.length - 1].name,
        to_point: points[0].name,
        bearing: "0",
        distance: 0
      };
      setSegments([...segments, closingSegment]);
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/process-boundary', {
        points,
        segments
      });
      setPlotData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Deed Plan Generator</h1>
      
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <button 
            onClick={getLocation} 
            className="bg-purple-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Getting Location...' : 'Get Location for Point ' + currentPointName}
          </button>
          
          {latitude && longitude && (
            <button 
              onClick={addCurrentLocation}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save Point {currentPointName}
            </button>
          )}
          
          <button 
            onClick={undoLastPoint}
            className="bg-red-500 text-white px-4 py-2 rounded"
            disabled={points.length === 0}
          >
            Undo Last Point
          </button>
          
          <button 
            onClick={completePolygon}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={points.length < 3}
          >
            Complete Polygon
          </button>
        </div>

        {geoError && <p className="text-red-500 mb-4">{geoError}</p>}
        {latitude && longitude && (
          <p className="mb-4">
            Current Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        )}

        {/* Display collected points */}
        <div className="mt-4">
          <h2 className="text-xl mb-2">Collected Points</h2>
          {points.map((point, index) => (
            <div key={index} className="mb-2">
              Point {point.name}: {point.easting.toFixed(6)}, {point.northing.toFixed(6)}
            </div>
          ))}
        </div>
      </div>

      {plotData && (
        <div className="mt-8">
          <h2 className="text-xl mb-2">Results</h2>
          <p>Area: {plotData.area_sqm} sqm</p>
          <img src={plotData.image_base64} alt="Plot" className="mt-4 border" />
        </div>
      )}
    </main>
  );
}

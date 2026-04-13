import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LandMap = ({ lands, onLandClick, center = [20.5937, 78.9629], zoom = 5 }) => {
  const getMarkerIcon = (land) => {
    let color = '#ef4444'; // red for disputed/unverified

    if (land.isVerified) {
      color = land.isForSale ? '#f59e0b' : '#10b981'; // gold for sale, green for verified
    }

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const MapController = () => {
    const map = useMap();

    useEffect(() => {
      if (lands && lands.length > 0) {
        const bounds = L.latLngBounds(
          lands.map(land => [land.latitude || 20.5937, land.longitude || 78.9629])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, [lands, map]);

    return null;
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-chain-border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="bg-chain-dark"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {lands && lands.map((land) => (
          <Marker
            key={land._id || land.landId || land.id}
            position={[land.latitude || 20.5937, land.longitude || 78.9629]}
            icon={getMarkerIcon(land)}
            eventHandlers={{
              click: () => onLandClick && onLandClick(land),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-48">
                <h3 className="font-orbitron text-chain-text mb-2">{land.title}</h3>
                <div className="text-sm text-chain-muted space-y-1">
                  <p>Area: {land.areaSqFt?.toLocaleString()} sq ft</p>
                  <p>Location: {land.location}</p>
                  {land.isForSale && land.salePrice && (
                    <p className="text-chain-gold font-medium">
                      Price: {land.salePrice} ETH
                    </p>
                  )}
                </div>
                <button
                  className="mt-3 w-full px-3 py-1 bg-chain-cyan text-chain-dark rounded font-medium text-sm hover:bg-cyan-600 transition-colors"
                  onClick={() => onLandClick && onLandClick(land)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController />
      </MapContainer>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: #111827;
          color: #e2e8f0;
          border: 1px solid #1e3a5f;
          border-radius: 8px;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: #111827;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default LandMap;
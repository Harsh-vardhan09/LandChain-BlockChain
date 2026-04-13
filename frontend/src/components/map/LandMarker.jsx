import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const LandMarker = ({ land, onClick }) => {
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
        animation: pulse 2s infinite;
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <Marker
      position={[land.latitude || 20.5937, land.longitude || 78.9629]}
      icon={getMarkerIcon(land)}
      eventHandlers={{
        click: () => onClick && onClick(land),
      }}
    >
      <Popup>
        <div className="p-3">
          <h4 className="font-orbitron text-chain-text mb-2">{land.title}</h4>
          <p className="text-sm text-chain-muted mb-2">{land.location}</p>
          <p className="text-sm text-chain-muted">Area: {land.areaSqFt} sq ft</p>
          {land.isForSale && (
            <p className="text-sm text-chain-gold font-medium">
              For Sale: {land.salePrice} ETH
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default LandMarker;
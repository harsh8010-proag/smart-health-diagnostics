import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickerIcon = new L.DivIcon({
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:linear-gradient(135deg,#ff5a5f,#ff7a00);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 12px rgba(255,90,95,0.6);
    border:2px solid white;
    font-size:16px;
  ">📍</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32], // Anchor at bottom center of icon
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
}

function MapEvents({ onChange }) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

export default function LocationPickerMap({
  coordinates, // [lng, lat]
  onChange,    // callback (coords) => {}
  height = '250px',
}) {
  const center = [coordinates[1], coordinates[0]]; // Leaflet uses [lat, lng]

  const handleDragEnd = (e) => {
    const marker = e.target;
    if (marker) {
      const position = marker.getLatLng();
      onChange([position.lng, position.lat]);
    }
  };

  return (
    <div style={{ height, width: '100%' }} className="overflow-hidden rounded-xl border border-border-custom relative z-0">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        <MapEvents onChange={onChange} />

        <Marker
          position={center}
          icon={pickerIcon}
          draggable={true}
          eventHandlers={{
            dragend: handleDragEnd,
          }}
        />
      </MapContainer>
    </div>
  );
}

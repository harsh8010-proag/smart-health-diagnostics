import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom phlebotomist icon
const phlebotomistIcon = new L.DivIcon({
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:linear-gradient(135deg,#06d6a0,#00b4d8);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 12px rgba(6,214,160,0.5);
    border:2px solid white;
    font-size:16px;
  ">🩸</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const patientIcon = new L.DivIcon({
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:linear-gradient(135deg,#8338ec,#ef476f);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 12px rgba(131,56,236,0.5);
    border:2px solid white;
    font-size:16px;
  ">🏠</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Auto-recenter map when coordinates change
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({
  patientLocation,
  phlebotomistLocation,
  height = '300px',
}) {
  const defaultCenter = [19.076, 72.8777]; // Mumbai

  const center = phlebotomistLocation
    ? [phlebotomistLocation.lat, phlebotomistLocation.lng]
    : patientLocation
    ? [patientLocation[1], patientLocation[0]] // GeoJSON is [lng, lat]
    : defaultCenter;

  return (
    <div style={{ height, width: '100%' }} className="overflow-hidden rounded-xl">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />

        {/* Patient marker */}
        {patientLocation && (
          <Marker
            position={[patientLocation[1], patientLocation[0]]}
            icon={patientIcon}
          >
            <Popup>📍 Patient Location</Popup>
          </Marker>
        )}

        {/* Phlebotomist marker */}
        {phlebotomistLocation && (
          <Marker
            position={[phlebotomistLocation.lat, phlebotomistLocation.lng]}
            icon={phlebotomistIcon}
          >
            <Popup>🩸 Phlebotomist Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

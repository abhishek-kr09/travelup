import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapSection({ geometry }) {
  if (!geometry?.coordinates) return null;

  const [lng, lat] = geometry.coordinates;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Location</h2>

      <MapContainer
        center={[lat, lng]}
        zoom={12}
        className="h-[400px] rounded-2xl"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>Property Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

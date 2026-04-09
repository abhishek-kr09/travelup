import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MapSection({ geometry }) {
  if (!geometry?.coordinates) return null;

  const [lng, lat] = geometry.coordinates;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Location</h2>

      <MapContainer
        center={[lat, lng]}
        zoom={12}
        className="h-[280px] sm:h-[360px] md:h-[400px] rounded-2xl border border-stone-300 dark:border-zinc-800"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[lat, lng]}
          icon={redIcon}
          eventHandlers={{ click: openGoogleMaps }}
        >
          <Popup>
            Click marker to open in Google Maps
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
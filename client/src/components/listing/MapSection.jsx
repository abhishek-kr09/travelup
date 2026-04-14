import { useEffect, useState } from "react";
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  if (!geometry?.coordinates) return null;

  const [lng, lat] = geometry.coordinates;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Location</h2>

      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-[1000] bg-black/70 p-3 sm:p-6"
            : "relative"
        }
      >
        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          className="absolute right-4 top-4 z-[1100] bg-white/95 text-zinc-900 border border-zinc-300 rounded-full px-3 py-2 text-sm font-medium shadow hover:bg-white transition"
        >
          {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        </button>

        <MapContainer
          key={isFullscreen ? "map-fullscreen" : "map-locked"}
          center={[lat, lng]}
          zoom={12}
          scrollWheelZoom={isFullscreen}
          dragging={isFullscreen}
          touchZoom={isFullscreen}
          doubleClickZoom={isFullscreen}
          boxZoom={isFullscreen}
          keyboard={isFullscreen}
          zoomControl={isFullscreen}
          className={
            isFullscreen
              ? "h-full w-full rounded-2xl border border-stone-300"
              : "h-[280px] sm:h-[360px] md:h-[400px] rounded-2xl border border-stone-300 dark:border-zinc-800"
          }
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
    </div>
  );
}
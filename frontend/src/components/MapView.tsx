import { useEffect, useRef } from "react";

export type MapMarker = {
  lat: number;
  lng: number;
  risk: "high" | "medium" | "low";
};

type MapViewProps = {
  markers: MapMarker[];
};

function markerColor(risk: MapMarker["risk"]) {
  if (risk === "high") return "#ef4444";
  if (risk === "medium") return "#facc15";
  return "#22c55e";
}

declare global {
  interface Window {
    L: any;
  }
}

export default function MapView({ markers }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const scriptLoadedRef = useRef(false);

  function placeMarkers() {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((marker) => {
      const color = markerColor(marker.risk);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:16px; height:16px;
          background:${color};
          border:2px solid rgba(255,255,255,0.8);
          border-radius:50%;
          box-shadow: 0 0 10px ${color}99;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const m = L.marker([marker.lat, marker.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="
            background:#101d31;
            border:1px solid #1e3048;
            padding:8px 12px;
            border-radius:8px;
            color:#dce6f7;
            font-family:monospace;
            font-size:11px;
            min-width:120px;
          ">
            <strong style="text-transform:capitalize;color:${color}">${marker.risk} Risk</strong><br/>
            ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}
          </div>
        `, {
          className: "custom-popup",
          offset: [0, -8],
        });

      markersRef.current.push(m);
    });
  }

  function initMap() {
    const L = window.L;
    if (!mapRef.current || !L || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [12.9716, 77.5946], // Bangalore
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark CartoDB tile - matches your dashboard perfectly
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { subdomains: "abcd", maxZoom: 20 }
    ).addTo(map);

    L.control.attribution({ prefix: false, position: "bottomright" })
      .addAttribution('© <a href="https://carto.com/" style="color:#4a607a">CARTO</a> © <a href="https://www.openstreetmap.org/copyright" style="color:#4a607a">OSM</a>')
      .addTo(map);

    mapInstanceRef.current = map;
    placeMarkers();
  }

  useEffect(() => {
    const styleId = "leaflet-popup-dark";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .custom-popup .leaflet-popup-content { margin: 0 !important; }
        .custom-popup .leaflet-popup-tip-container { display: none !important; }
        .leaflet-control-zoom {
          border: 1px solid #1e3048 !important;
          background: #101d31 !important;
        }
        .leaflet-control-zoom a {
          background: #101d31 !important;
          color: #dce6f7 !important;
          border-bottom: 1px solid #1e3048 !important;
        }
        .leaflet-control-zoom a:hover { background: #1e3048 !important; }
        .leaflet-control-attribution {
          background: rgba(16,29,49,0.8) !important;
          color: #4a607a !important;
          font-size: 9px !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (scriptLoadedRef.current) {
      if (mapInstanceRef.current) placeMarkers();
      else initMap();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      setTimeout(initMap, 100);
    };
    document.head.appendChild(script);

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) placeMarkers();
  }, [markers]);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 520 }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "520px", background: "#0c1739" }}
      />

      {/* Top gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
        style={{ background: "linear-gradient(to bottom, rgba(8,21,37,0.6), transparent)" }}
      />

      {/* Title badge */}
      <div
        className="absolute left-5 top-5 z-20 rounded-lg px-4 py-3 shadow-xl"
        style={{ border: "1px solid #1e3048", background: "rgba(16,29,49,0.95)" }}
      >
        <p className="font-mono text-xs font-black uppercase" style={{ letterSpacing: "0.14em", color: "#dce6f7" }}>
          Bangalore Risk Map
        </p>
        <p className="mt-1 text-xs" style={{ color: "#9ba9bd" }}>
          Live view · {markers.length} zones
        </p>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-5 left-6 z-20 flex flex-wrap items-center gap-4 rounded-full px-5 py-3 font-mono text-sm font-bold uppercase shadow-xl"
        style={{ border: "1px solid #1e3048", background: "rgba(16,29,49,0.95)", letterSpacing: "0.08em", color: "#dce6f7" }}
      >
        <LegendDot color="#ef4444" label="High" />
        <span className="h-5 w-px" style={{ background: "#2b3a50" }} />
        <LegendDot color="#facc15" label="Medium" />
        <span className="h-5 w-px" style={{ background: "#2b3a50" }} />
        <LegendDot color="#22c55e" label="Low" />
      </div>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span
        className="h-4 w-4 rounded-full"
        style={{ background: color, border: "2px solid rgba(255,255,255,0.2)" }}
      />
      {label}
    </span>
  );
}
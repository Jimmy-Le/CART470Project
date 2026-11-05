import { useRef, useState } from "react";
import arrow from "../assets/arrow.svg";

// This file is the bridge between the editor and a downloadable JSON file.
// Flow: load text -> parseLines checks it -> onLoad hands it to the editor.
// Save takes the editor lines -> serializeLines cleans them up -> download.
// JSON itself cannot contain comments, so its field explanations live here.
// JSON stores an icon name instead of a build-specific image URL.
// Keep Start/Control/End coordinates, spacing between icons, and icon size.
// Save "arrow" rather than src, since the built asset URL can change between builds.
function serializeLines(lines) {
  return lines.map((line) => ({
    start: { x: line.start.x, y: line.start.y },
    control: { x: line.control.x, y: line.control.y },
    end: { x: line.end.x, y: line.end.y },
    spacing: line.spacing,
    imgSize: line.imgSize ?? 16,
    icon: "arrow",
  }));
}

// Check the whole file before replacing anything on screen.
// This validates and normalizes data; it does NOT guess missing coordinates or spacing.
// Missing imgSize defaults to 16; a missing icon is accepted and uses our local arrow.
export function parseLines(text) {
  const data = JSON.parse(text);

  if (!Array.isArray(data)) {
    throw new Error("Expected a JSON array of lines.");
  }

  // Cap the number of lines to avoid rendering an unexpectedly huge import.
  if (data.length > 100) {
    throw new Error("Please load no more than 100 lines at a time.");
  }

  return data.map((line, index) => {
    const label = `Line ${index + 1}`;

    if (!line || typeof line !== "object") {
      throw new Error(`${label}: invalid line data.`);
    }

    const points = {};

    // Every point needs real numeric X/Y values (not strings like "80").
    // The coordinate limit also rejects values far outside our intended canvas range.
    for (const key of ["start", "control", "end"]) {
      const point = line[key];

      if (
        !point ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y) ||
        Math.abs(point.x) > 100000 ||
        Math.abs(point.y) > 100000
      ) {
        throw new Error(`${label}: invalid ${key} coordinates.`);
      }

      points[key] = { x: point.x, y: point.y };
    }

    // Spacing must be positive: it controls the gap between arrow images.
    if (!Number.isFinite(line.spacing) || line.spacing <= 0) {
      throw new Error(`${label}: spacing must be greater than zero.`);
    }

    const imgSize = line.imgSize ?? 16;

    if (!Number.isFinite(imgSize) || imgSize <= 0 || imgSize > 200) {
      throw new Error(`${label}: icon size must be between 0 and 200.`);
    }

    if (line.icon !== undefined && line.icon !== "arrow") {
      throw new Error(`${label}: only the arrow icon is supported yet.`);
    }

    // Only copy supported fields; resolve the image locally.
    return {
      ...points,
      spacing: line.spacing,
      imgSize,
      src: arrow,
    };
  });
}

// Save/Load button appearance lives here. The surrounding panel also has inline
// styles below; presentation-theme.css overrides some of them on the Lines page.
const buttonStyle = {
  border: "1px solid #5e4fb1",
  borderRadius: "8px",
  padding: "8px 16px",
  background: "#fff",
  color: "#403578",
  cursor: "pointer",
};

export default function ConnectionFileControls({ lines, onLoad }) {
  // The actual file input is hidden; Load JSON opens it through this ref.
  const fileInput = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // This downloads connections.json; the browser does not overwrite source files.
  // To share the new default with the team, replace
  // src/components/connections/data/connections.json, then commit and push it.
  function saveJSON() {
    try {
      const records = serializeLines(lines);
      // The 2 adds indentation so the exported JSON is easy to read by hand.
      const text = JSON.stringify(records, null, 2);

      // Validate before exporting too.
      parseLines(text);

      // Make a temporary file URL and click a download link for the user.
      const blob = new Blob([text + "\n"], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "connections.json";
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Release the temporary URL after the download has had time to start.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        `Exported ${records.length} lines. Replace connections.json in the project folder with the downloaded file.`
      );
    } catch (error) {
      setMessage(`Could not save: ${error.message}`);
    }
  }

  // Read a local file, validate it, then ask before replacing existing lines.
  // Import affects this editor session; it does not change the project JSON.
  async function loadJSON(event) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (file.size > 1024 * 1024) {
        throw new Error("Please choose a JSON file smaller than 1 MB.");
      }

      const importedLines = parseLines(await file.text());

      if (
        lines.length > 0 &&
        !window.confirm(
          "Loading this file will replace the lines currently displayed. " +
          "Save JSON first if you want to keep them. Continue?"
        )
      ) {
        setMessage("Import cancelled. Your current lines are unchanged.");
        return;
      }

      // The parent editor owns the lines, so ask it to update through this callback.
      onLoad(importedLines);
      setMessage(`Loaded ${importedLines.length} lines from ${file.name}.`);
    } catch (error) {
      setMessage(`Could not load: ${error.message}`);
    // Always re-enable the controls, even if reading fails or the user cancels.
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-label="Save and load connection lines"
      style={{
        padding: "16px",
        background: "#faf7ed",
        borderBottom: "1px solid #e5dfcd",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={saveJSON}
          disabled={loading}
          style={buttonStyle}
        >
          Save JSON
        </button>

        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Loading…" : "Load JSON"}
        </button>

        <span>{lines.length} lines</span>

        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          onChange={loadJSON}
          hidden
        />
      </div>

      <p style={{ margin: "10px 0 0", fontSize: "14px" }}>
        Save JSON, then replace the project file at:{" "}
        <code>src/components/connections/data/connections.json</code>
      </p>

      <p role="status" style={{ margin: "6px 0 0", fontSize: "14px" }}>
        {message}
      </p>
    </section>
  );
}
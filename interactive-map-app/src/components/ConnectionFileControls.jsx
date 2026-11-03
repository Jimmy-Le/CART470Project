import { useRef, useState } from "react";
import arrow from "../assets/arrow.svg";

// JSON stores an icon name instead of a build-specific image URL.
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

export function parseLines(text) {
  const data = JSON.parse(text);

  if (!Array.isArray(data)) {
    throw new Error("Expected a JSON array of lines.");
  }

  if (data.length > 100) {
    throw new Error("Please load no more than 100 lines at a time.");
  }

  return data.map((line, index) => {
    const label = `Line ${index + 1}`;

    if (!line || typeof line !== "object") {
      throw new Error(`${label}: invalid line data.`);
    }

    const points = {};

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

const buttonStyle = {
  border: "1px solid #5e4fb1",
  borderRadius: "8px",
  padding: "8px 16px",
  background: "#fff",
  color: "#403578",
  cursor: "pointer",
};

export default function ConnectionFileControls({ lines, onLoad }) {
  const fileInput = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function saveJSON() {
    try {
      const records = serializeLines(lines);
      const text = JSON.stringify(records, null, 2);

      // Validate before exporting too.
      parseLines(text);

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

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
  `Exported ${records.length} lines. Replace connections.json in the project folder with the downloaded file.`
);
    } catch (error) {
      setMessage(`Could not save: ${error.message}`);
    }
  }

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

      onLoad(importedLines);
      setMessage(`Loaded ${importedLines.length} lines from ${file.name}.`);
    } catch (error) {
      setMessage(`Could not load: ${error.message}`);
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
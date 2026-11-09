import { useEffect, useRef, useState } from "react";
import CurvedLineOfImages from "./connectionLines";
import arrow from "../assets/arrow.svg";
import ConnectionFileControls, {
  parseLines,
} from "./ConnectionFileControls.jsx";
import defaultConnections from "./connections/data/connections.json";

// Quick tour: this file handles the form, selecting lines, and drawing with the mouse.
// ConnectionFileControls.jsx handles JSON; connectionLines.jsx draws the arrow images.
// Start and End are the endpoints. Control pulls the curve toward it to make a bend.
// Form values stay as text while you type; readForm() turns them into numbers.
const emptyForm = {
  startX: "",
  startY: "",
  controlX: "",
  controlY: "",
  endX: "",
  endY: "",
  spacing: "20",
};

// Styling tip: these are the shared toolbar button styles. Individual buttons below
// add their own active/disabled colors. The form layout is in presentation-theme.css.
const buttonStyle = {
  padding: "8px 14px",
  border: "1px solid #5e4fb1",
  borderRadius: "8px",
  background: "white",
  color: "#403578",
  cursor: "pointer",
};

// Tell SVG to move to Start (M), then draw a quadratic curve (Q) via Control to End.
// This path is used for selection and guides; the arrow images are drawn separately.
function curvePath(line) {
  return (
    `M ${line.start.x} ${line.start.y} ` +
    `Q ${line.control.x} ${line.control.y} ` +
    `${line.end.x} ${line.end.y}`
  );
}

// When we select or drag a line, copy its coordinates back into the text boxes.
function formFromLine(line) {
  return {
    startX: String(line.start.x),
    startY: String(line.start.y),
    controlX: String(line.control.x),
    controlY: String(line.control.y),
    endX: String(line.end.x),
    endY: String(line.end.y),
    spacing: String(line.spacing),
  };
}

export default function ConnectionsEditor() {
  // Start from the JSON shipped with the project each time this editor mounts.
  // Edits live in React state here; they do not write back to the project file.
  const [lines, setLines] = useState(() => {
    try {
      return parseLines(JSON.stringify(defaultConnections));
    } catch (error) {
      console.error("Could not load project connections.json:", error);
      return [];
    }
  });

  // selected is an array index (0 means the first line), not a permanent ID.
  // drawing/startPoint/previewPoint track the two-click drawing process.
  // history stores earlier line arrays so Undo can restore them.
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [drawing, setDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [previewPoint, setPreviewPoint] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  // Refs hold the SVG element and the current drag session between renders.
  // Updating a ref alone does not redraw the screen; setLines/setForm do that.
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const selectedLine =
    selected === null ? null : lines[selected] ?? null;

  // Include the control points too, even when they sit beyond the visible curve.
  // The 40-unit margin leaves space around the handles.
  // Keep enough room for existing imported coordinates.
  const points = lines.flatMap((line) => [
    line.start,
    line.control,
    line.end,
  ]);

  const minX = Math.min(0, ...points.map((p) => p.x - 40));
  const minY = Math.min(0, ...points.map((p) => p.y - 40));
  const maxX = Math.max(1200, ...points.map((p) => p.x + 40));
  const maxY = Math.max(700, ...points.map((p) => p.y + 40));

  // Keep the same coordinate frame during a drag so the handle does not jump
  // when moving a point would otherwise resize the canvas.
  // Freeze the drawing area while dragging.
  const bounds = dragRef.current?.bounds ?? {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  // Keep at most 30 undo snapshots. Call this BEFORE changing the lines.
  function remember(previous) {
    setHistory((items) => [...items.slice(-29), previous]);
  }

  function cancelDrawing() {
    setDrawing(false);
    setStartPoint(null);
    setPreviewPoint(null);
  }

  // Escape exits drawing mode. Remove the listener when the editor unmounts
  // so revisiting this page does not stack up keyboard listeners.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setDrawing(false);
        setStartPoint(null);
        setPreviewPoint(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function selectLine(index) {
    cancelDrawing();
    setSelected(index);
    setForm(formFromLine(lines[index]));
    setMessage(`Line ${index + 1} selected. Drag its points or edit the coordinates.`);
  }

  // Both Add Line and Update Selected go through this check.
  // Blank fields are rejected first because Number("") would otherwise become 0.
  function readForm() {
    const values = {};

    for (const [key, value] of Object.entries(form)) {
      if (value.trim() === "" || !Number.isFinite(Number(value))) {
        throw new Error("Please fill in every coordinate and spacing.");
      }
      values[key] = Number(value);
    }

    // Use the same validation as JSON imports.
    return parseLines(JSON.stringify([{
      start: { x: values.startX, y: values.startY },
      control: { x: values.controlX, y: values.controlY },
      end: { x: values.endX, y: values.endY },
      spacing: values.spacing,
      imgSize: selectedLine?.imgSize ?? 16,
      icon: "arrow",
    }]))[0];
  }

  // The form adds a NEW line. Update Selected below replaces the selected one.
  // Neither action saves a file automatically.
  function addLine(event) {
    event.preventDefault();

    try {
      if (lines.length >= 100) {
        throw new Error("Maximum 100 lines. Delete a line before adding another.");
      }

      const line = readForm();
      remember(lines);
      setLines([...lines, line]);
      setSelected(lines.length);
      cancelDrawing();
      setMessage("New line added.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Replace just one array entry, leaving the other lines as they were.
  function updateSelected() {
    if (!selectedLine) return;

    try {
      const line = readForm();
      remember(lines);
      setLines(lines.map((item, index) =>
        index === selected ? line : item
      ));
      setMessage(`Line ${selected + 1} updated.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  // After deleting, clear the selection because the remaining indices shift.
  function deleteSelected() {
    if (!selectedLine) return;

    remember(lines);
    setLines(lines.filter((_, index) => index !== selected));
    setSelected(null);
    setForm(emptyForm);
    cancelDrawing();
    setMessage("Selected line deleted. Use Undo to restore it.");
  }

  // Restore the last snapshot and clear the handles/form to avoid a stale selection.
  function undo() {
    if (!history.length) return;

    setLines(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setSelected(null);
    setForm(emptyForm);
    cancelDrawing();
    setMessage("Last change undone.");
  }

  // The JSON component calls this after a successful import. Replace the whole
  // list, but remember the old list first so the import can also be undone.
  function loadLines(importedLines) {
    remember(lines);
    setLines(importedLines);
    setSelected(null);
    setForm(emptyForm);
    cancelDrawing();
    setMessage("Imported lines loaded. Select any line to edit or delete it.");
  }

  // Mouse positions arrive in browser pixels, but our lines use SVG coordinates.
  // Invert the SVG screen transform so clicks still line up after scrolling or scaling.
  // Round to one decimal place to keep the coordinate boxes readable.
  function pointerPosition(event) {
    const svg = canvasRef.current;
    const matrix = svg.getScreenCTM();

    if (!matrix) return null;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const local = point.matrixTransform(matrix.inverse());

    return {
      x: Math.round(local.x * 10) / 10,
      y: Math.round(local.y * 10) / 10,
    };
  }

  // Draw Line switches into two-click mode. Clicking the button again cancels it.
  function toggleDraw() {
    if (drawing) {
      cancelDrawing();
      setMessage("Drawing cancelled.");
      return;
    }

    if (lines.length >= 100) {
      setMessage("Maximum 100 lines. Delete a line before adding another.");
      return;
    }

    setSelected(null);
    setStartPoint(null);
    setPreviewPoint(null);
    setDrawing(true);
    setMessage("Click the canvas to place the start point. Esc cancels.");
  }

  // First click: remember Start. Second click: create End and finish the line.
  // We start Control at the midpoint, so the new line is straight until you bend it.
  function canvasClick(event) {
    if (!drawing) return;

    const point = pointerPosition(event);
    if (!point) return;

    if (!startPoint) {
      setStartPoint(point);
      setPreviewPoint(point);
      setMessage("Click again to place the end point.");
      return;
    }

    // Ignore endpoints less than 5 units apart so we do not create a tiny accidental line.
    if (Math.hypot(
      point.x - startPoint.x,
      point.y - startPoint.y
    ) < 5) {
      setMessage("Place the end point a little farther from the start.");
      return;
    }

    const spacing = Number(form.spacing);
    const line = {
      start: startPoint,
      control: {
        x: (startPoint.x + point.x) / 2,
        y: (startPoint.y + point.y) / 2,
      },
      end: point,
      spacing: Number.isFinite(spacing) && spacing > 0 ? spacing : 20,
      imgSize: 16,
      src: arrow,
    };

    remember(lines);
    setLines([...lines, line]);
    setSelected(lines.length);
    setForm(formFromLine(line));
    cancelDrawing();
    setMessage("Line added. Drag Control to bend it.");
  }

  // A handle passes its name (start/end/control) here. Keep the original lines
  // for Undo/cancellation, and capture the pointer so dragging can continue outside the SVG.
  function beginDrag(event, key) {
    if (drawing || !selectedLine || event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    dragRef.current = {
      key,
      index: selected,
      before: lines,
      bounds,
      moved: false,
    };

    canvasRef.current.setPointerCapture(event.pointerId);
  }

  // While dragging, update only that handle and keep the form in sync.
  // In drawing mode, mouse movement only updates the preview, not the saved lines.
  function pointerMove(event) {
    const point = pointerPosition(event);
    if (!point) return;

    const drag = dragRef.current;

    if (drag) {
      drag.moved = true;

      const next = drag.before.map((line, index) =>
        index === drag.index
          ? { ...line, [drag.key]: point }
          : line
      );

      setLines(next);
      setForm(formFromLine(next[drag.index]));
      return;
    }

    if (drawing && startPoint) {
      setPreviewPoint(point);
    }
  }

  // One complete drag becomes ONE undo step, rather than a step for every mouse move.
  // A browser pointer cancellation restores the positions from before the drag.
  function finishDrag(event, cancelled = false) {
    const drag = dragRef.current;
    if (!drag) return;

    dragRef.current = null;

    if (canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }

    if (cancelled) {
      setLines(drag.before);
      setForm(formFromLine(drag.before[drag.index]));
    } else if (drag.moved) {
      remember(drag.before);
      setMessage("Line adjusted.");
    }
  }

  // Reuse the same X/Y input layout for Start, Control, and End.
  function coordinateGroup(title, prefix) {
    return (
      <div>
        <h2>{title}</h2>

        {["X", "Y"].map((axis) => {
          const key = `${prefix}${axis}`;

          return (
            <span key={key}>
              <label htmlFor={key}>{axis}:</label>
              <input
                type="text"
                inputMode="decimal"
                id={key}
                name={key}
                value={form[key]}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {/* Coordinate entry: type values here, then Add Line or Update Selected. */}
      <form id="connectionsEditor" onSubmit={addLine}>
        {coordinateGroup("Start", "start")}
        {coordinateGroup("Control", "control")}
        {coordinateGroup("End", "end")}

        <div>
          <h2>Spacing</h2>
          <label htmlFor="spacing">Space between:</label>
          <input
            type="text"
            inputMode="decimal"
            id="spacing"
            name="spacing"
            value={form.spacing}
            onChange={(event) =>
              setForm({ ...form, spacing: event.target.value })
            }
          />
        </div>

        <div>
          <h2>Icon</h2>
          <label htmlFor="lineIcon">Image:</label>
          <select id="lineIcon" name="lineIcon" defaultValue="arrow">
            <option value="arrow">Arrow</option>
            <option value="bird" disabled>Bird — coming soon</option>
          </select>
        </div>

        <div>
          <button type="submit" id="addLineButton">
            Add Line
          </button>
        </div>
      </form>

      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
          background: "#faf7ed",
        }}
      >
        <button
          type="button"
          onClick={toggleDraw}
          aria-pressed={drawing}
          style={{
            ...buttonStyle,
            background: drawing ? "#5e4fb1" : "white",
            color: drawing ? "white" : "#403578",
          }}
        >
          {drawing ? "Cancel Drawing" : "Draw Line"}
        </button>

        <label htmlFor="selectedLine">Select line:</label>
        <select
          id="selectedLine"
          value={selected ?? ""}
          onChange={(event) => {
            if (event.target.value === "") {
              setSelected(null);
              setForm(emptyForm);
            } else {
              selectLine(Number(event.target.value));
            }
          }}
          style={{ padding: "8px", border: "1px solid #ccc" }}
        >
          <option value="">None</option>
          {lines.map((_, index) => (
            <option key={index} value={index}>
              Line {index + 1}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={updateSelected}
          disabled={!selectedLine}
          style={{ ...buttonStyle, opacity: selectedLine ? 1 : 0.45 }}
        >
          Update Selected
        </button>

        <button
          type="button"
          onClick={deleteSelected}
          disabled={!selectedLine}
          style={{
            ...buttonStyle,
            color: "#a32929",
            borderColor: "#a32929",
            opacity: selectedLine ? 1 : 0.45,
          }}
        >
          Delete Selected
        </button>

        <button
          type="button"
          onClick={undo}
          disabled={!history.length}
          style={{
            ...buttonStyle,
            opacity: history.length ? 1 : 0.45,
          }}
        >
          Undo
        </button>
      </div>

      <p
        role="status"
        style={{
          margin: 0,
          padding: "0 16px 12px",
          background: "#faf7ed",
          textAlign: "left",
        }}
      >
        {message ||
          "Select a line to edit it, or choose Draw Line and click two points."}
      </p>

      {/* Pass the current lines down for export, and a callback for importing replacements. */}
      <ConnectionFileControls lines={lines} onLoad={loadLines} />

      {/* Canvas styling: scroll height, white background, and dot spacing live here. */}
      <div style={{ overflow: "auto", maxHeight: "75vh" }}>
        <div
          style={{
            position: "relative",
            width: bounds.width,
            height: bounds.height,
            backgroundColor: "#fff",
            backgroundImage:
              "radial-gradient(circle, #d9d5e2 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
        >
          {/* Reuse the original arrow-rendering component. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -bounds.minX,
              top: -bounds.minY,
              width: bounds.width,
              height: bounds.height,
              pointerEvents: "none",
            }}
          >
            {lines.map((line, index) => (
              <CurvedLineOfImages key={index} {...line} />
            ))}
          </div>

          {/* This SVG sits above the images and receives clicks/drags.
              Keep its viewBox aligned with the image layer offsets. */}
          <svg
            ref={canvasRef}
            width={bounds.width}
            height={bounds.height}
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
            aria-label="Connection line editing canvas"
            onClick={canvasClick}
            onPointerMove={pointerMove}
            onPointerUp={(event) => finishDrag(event)}
            onPointerCancel={(event) => finishDrag(event, true)}
            style={{
              position: "absolute",
              inset: 0,
              touchAction: "none",
              cursor: drawing ? "crosshair" : "default",
            }}
          >
            {/* Wide transparent paths make each line easy to select. */}
            {lines.map((line, index) => (
              <path
                key={index}
                d={curvePath(line)}
                fill="none"
                stroke="transparent"
                strokeWidth="22"
                pointerEvents={drawing ? "none" : "stroke"}
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  event.stopPropagation();
                  selectLine(index);
                }}
              />
            ))}

            {/* Selected-line guides: purple endpoints, orange Control, and dashed helper lines.
                Change stroke/fill/r below to style these handles and guides. */}
            {selectedLine && !drawing && (
              <g>
                <path
                  d={curvePath(selectedLine)}
                  fill="none"
                  stroke="#7563c5"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  pointerEvents="none"
                />

                <path
                  d={
                    `M ${selectedLine.start.x} ${selectedLine.start.y} ` +
                    `L ${selectedLine.control.x} ${selectedLine.control.y} ` +
                    `L ${selectedLine.end.x} ${selectedLine.end.y}`
                  }
                  fill="none"
                  stroke="#a398ca"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                  pointerEvents="none"
                />

                {["start", "end", "control"].map((key) => {
                  const point = selectedLine[key];

                  return (
                    <g key={key}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="9"
                        fill={key === "control" ? "#e8a34b" : "#5e4fb1"}
                        stroke="white"
                        strokeWidth="3"
                        onPointerDown={(event) => beginDrag(event, key)}
                        onClick={(event) => event.stopPropagation()}
                        style={{ cursor: "grab" }}
                      />
                      <text
                        x={point.x + 14}
                        y={point.y - 12}
                        fontSize="13"
                        fill="#403578"
                        pointerEvents="none"
                      >
                        {key === "start"
                          ? "Start"
                          : key === "end"
                            ? "End"
                            : "Control"}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Temporary preview between the first click and the current mouse position. */}
            {drawing && startPoint && previewPoint && (
              <g pointerEvents="none">
                <line
                  x1={startPoint.x}
                  y1={startPoint.y}
                  x2={previewPoint.x}
                  y2={previewPoint.y}
                  stroke="#5e4fb1"
                  strokeWidth="2"
                  strokeDasharray="7 5"
                />
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="6"
                  fill="#5e4fb1"
                />
                <circle
                  cx={previewPoint.x}
                  cy={previewPoint.y}
                  r="6"
                  fill="white"
                  stroke="#5e4fb1"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
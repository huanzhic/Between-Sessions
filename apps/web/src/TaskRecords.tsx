import { useId, useState } from "react";
import type { TodoItem } from "./Todos";

export const briefStart = "2026-10-29";
export const briefEnd = "2026-11-05";
export const briefPeriod = "Oct 29 – Nov 5, 2026";

export type TaskRecord = {
  id: string;
  date: string;
  kind: "entry" | "note" | "did-not-happen";
  text: string;
};
export type TaskRecords = Record<string, TaskRecord[]>;

export function TaskRecordEditor({
  item,
  records,
  onSave,
  simulateFailure,
}: {
  item: TodoItem;
  records: TaskRecord[];
  onSave: (records: TaskRecord[]) => void;
  simulateFailure: boolean;
}) {
  const field = useId();
  const [draft, setDraft] = useState<TaskRecord>();
  const [message, setMessage] = useState("");
  const event = item.kind === "event";
  const activity = item.kind === "activity";
  const entries = records.filter((record) => record.kind === "entry").length;
  const didNotHappen = records.some(
    (record) => record.kind === "did-not-happen",
  );

  function save(next: TaskRecord[]) {
    if (simulateFailure) {
      setMessage("Save failed. Turn off simulated failure and try again.");
      return;
    }
    onSave(next);
    setDraft(undefined);
    setMessage("Saved privately.");
  }

  function open(kind: TaskRecord["kind"]) {
    setMessage("");
    setDraft({ id: crypto.randomUUID(), date: briefEnd, kind, text: "" });
  }

  return (
    <div>
      {event && (
        <p>
          {didNotHappen
            ? "Didn’t happen this period"
            : entries
              ? entries + " event(s) recorded"
              : "No event recorded"}
        </p>
      )}
      {activity && (
        <p>
          {entries}
          {item.target ? " / " + item.target : ""} logged
        </p>
      )}
      <ul className="task-records">
        {records.map((record) => (
          <li key={record.id}>
            {record.kind === "entry" && (
              <time dateTime={record.date}>{record.date}</time>
            )}
            {record.kind === "note" && <strong>Progress note</strong>}
            {record.kind === "did-not-happen" && <strong>Didn’t happen</strong>}
            {record.text && <p>{record.text}</p>}
            <div className="actions">
              {record.kind !== "did-not-happen" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMessage("");
                    setDraft(record);
                  }}
                >
                  Edit record
                </button>
              )}
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  save(records.filter((entry) => entry.id !== record.id))
                }
              >
                Remove record
              </button>
            </div>
          </li>
        ))}
      </ul>
      {draft ? (
        <form
          className="task-form"
          onSubmit={(e) => {
            e.preventDefault();
            const record = { ...draft, text: draft.text.trim() };
            if ((event || record.kind === "note") && !record.text) {
              setMessage("Enter a short record before saving.");
              return;
            }
            const existing = records.some((entry) => entry.id === record.id);
            save(
              existing
                ? records.map((entry) =>
                    entry.id === record.id ? record : entry,
                  )
                : [
                    ...records.filter(
                      (entry) => entry.kind !== "did-not-happen",
                    ),
                    record,
                  ],
            );
          }}
        >
          {draft.kind === "entry" && (
            <label className="task-field" htmlFor={field + "-date"}>
              Date
              <input
                id={field + "-date"}
                type="date"
                required
                min={briefStart}
                max={briefEnd}
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </label>
          )}
          <label className="task-field" htmlFor={field + "-text"}>
            {event
              ? "What happened?"
              : draft.kind === "note"
                ? "Progress note"
                : "Note (optional)"}
            <textarea
              id={field + "-text"}
              required={event || draft.kind === "note"}
              rows={3}
              value={draft.text}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            />
          </label>
          <div className="actions">
            <button>Save record</button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setDraft(undefined);
                setMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="actions">
          {(event || activity) && (
            <button
              type="button"
              className="secondary"
              onClick={() => open("entry")}
            >
              {event ? "Log event" : "Log activity"}
            </button>
          )}
          {!event && !records.some((record) => record.kind === "note") && (
            <button
              type="button"
              className="text-button"
              onClick={() => open("note")}
            >
              Add progress note
            </button>
          )}
          {event && !didNotHappen && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                if (
                  entries &&
                  !window.confirm(
                    "Replace the existing event records with Didn’t happen?",
                  )
                )
                  return;
                save([
                  {
                    id: crypto.randomUUID(),
                    date: briefEnd,
                    kind: "did-not-happen",
                    text: "",
                  },
                ]);
              }}
            >
              Didn’t happen this period
            </button>
          )}
        </div>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}

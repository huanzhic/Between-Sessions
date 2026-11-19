import { useRef, useState } from "react";
import {
  TaskRecordEditor,
  type TaskRecord,
  type TaskRecords,
} from "./TaskRecords";
import { activity } from "./fixtures";

export type TodoItem = {
  id: number;
  text: string;
  kind: "checklist" | "reflection" | "event" | "activity";
  focus?: string;
  target?: number;
};

export function taskKey(listId: string, itemId: number) {
  return listId + "/" + itemId;
}

const taskLabels = {
  checklist: "Checklist item",
  reflection: "Reflection",
  event: "Note an event",
  activity: "Track an activity",
};
export type TodoDraft = {
  title: string;
  items: TodoItem[];
};
export type TodoList = TodoDraft & { id: string };
export type TodoProgress = Record<string, number[]>;
export const initialTodoList: TodoList = {
  id: "before-next-session",
  title: "Before your next session",
  items: [{ id: 1, text: activity.topic, kind: "reflection" }],
};

export function reflectionPath(listId: string, itemId: number) {
  return `/client/reflection/${listId}/${itemId}`;
}

export function AssignTodos({
  lists,
  onAssign,
}: {
  lists: TodoList[];
  onAssign: (draft: TodoDraft) => void;
}) {
  const nextItem = useRef(2);
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<TodoItem[]>([
    { id: 1, text: "", kind: "checklist" },
  ]);
  const [preview, setPreview] = useState<TodoDraft | null>(null);
  const [status, setStatus] = useState("");

  return (
    <>
      <section className="card">
        <h2>Assign a to-do list</h2>
        <p>Choose what your client can record before the next session.</p>
        <form
          className="task-form"
          onSubmit={(event) => {
            event.preventDefault();
            setStatus("");
            if (!title.trim() || items.some((item) => !item.text.trim())) {
              setStatus("Enter a title and text for every item.");
              return;
            }
            setPreview({
              title: title.trim(),
              items: items.map((item) => ({ ...item, text: item.text.trim() })),
            });
          }}
        >
          <div>
            <label htmlFor="todo-client">Assign to</label>
            <select id="todo-client">
              <option>Maya Chen</option>
            </select>
          </div>
          <div>
            <label htmlFor="todo-title">List title</label>
            <input
              id="todo-title"
              required
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setPreview(null);
                setStatus("");
              }}
            />
          </div>
          {items.map((item, index) => (
            <div key={item.id}>
              <label htmlFor={`todo-kind-${item.id}`}>
                Item {index + 1} type
              </label>
              <select
                id={`todo-kind-${item.id}`}
                value={item.kind}
                onChange={(event) => {
                  const kind = event.target.value as TodoItem["kind"];
                  setItems((current) =>
                    current.map((entry) =>
                      entry.id === item.id
                        ? { ...entry, kind, target: undefined }
                        : entry,
                    ),
                  );
                  setPreview(null);
                  setStatus("");
                }}
              >
                <option value="checklist">Checklist item</option>
                <option value="event">Note an event</option>
                <option value="activity">Track an activity</option>
                <option value="reflection">Reflection</option>
              </select>
              <label htmlFor={`todo-item-${item.id}`}>
                To-do item {index + 1}
              </label>
              <input
                id={`todo-item-${item.id}`}
                required
                value={item.text}
                onChange={(event) => {
                  const text = event.target.value;
                  setItems((current) =>
                    current.map((entry) =>
                      entry.id === item.id ? { ...entry, text } : entry,
                    ),
                  );
                  setPreview(null);
                  setStatus("");
                }}
              />
              {item.kind === "activity" && (
                <label className="task-field">
                  Target count (optional)
                  <input
                    type="number"
                    min={1}
                    max={999}
                    step={1}
                    value={item.target ?? ""}
                    onChange={(event) => {
                      const target = event.target.value
                        ? event.target.valueAsNumber
                        : undefined;
                      setItems((current) =>
                        current.map((entry) =>
                          entry.id === item.id ? { ...entry, target } : entry,
                        ),
                      );
                      setPreview(null);
                    }}
                  />
                </label>
              )}
              <label className="task-field">
                What would you like to know before the next session? (optional)
                <input
                  value={item.focus ?? ""}
                  onChange={(event) => {
                    const focus = event.target.value;
                    setItems((current) =>
                      current.map((entry) =>
                        entry.id === item.id ? { ...entry, focus } : entry,
                      ),
                    );
                    setPreview(null);
                  }}
                />
              </label>
              {items.length > 1 && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setItems((current) =>
                      current.filter((entry) => entry.id !== item.id),
                    );
                    setPreview(null);
                    setStatus("");
                  }}
                  aria-label={`Remove to-do item ${index + 1}`}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="actions">
            <button
              type="button"
              className="secondary"
              onClick={() => {
                const id = nextItem.current++;
                setItems((current) => [
                  ...current,
                  { id, text: "", kind: "checklist" },
                ]);
                setPreview(null);
                setStatus("");
              }}
            >
              Add item
            </button>
            <button>Preview to-do list</button>
          </div>
        </form>
        {preview && (
          <div className="notice">
            <h3>{preview.title}</h3>
            <p>Preview for Maya Chen</p>
            <ul>
              {preview.items.map((item) => (
                <li key={item.id}>
                  {item.text}
                  {item.kind !== "checklist" && " · " + taskLabels[item.kind]}
                  {item.target !== undefined && " · Target: " + item.target}
                  {item.focus && <p>{item.focus}</p>}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                onAssign(preview);
                setTitle("");
                setItems([
                  { id: nextItem.current++, text: "", kind: "checklist" },
                ]);
                setPreview(null);
                setStatus("Demo list assigned to Maya Chen.");
              }}
            >
              Assign demo list
            </button>
          </div>
        )}
        {status && <p role="status">{status}</p>}
      </section>
      <section className="card">
        <h2>Assigned to-do lists</h2>
        {lists.length === 0 && <p>No to-do lists assigned yet.</p>}
        {lists.map((list) => (
          <div key={list.id}>
            <h3>{list.title}</h3>
            <p>Assigned to Maya Chen</p>
            <ul>
              {list.items.map((item) => (
                <li key={item.id}>
                  {item.text}
                  {item.kind !== "checklist" && " · " + taskLabels[item.kind]}
                  {item.target !== undefined && " · Target: " + item.target}
                  {item.focus && <p>{item.focus}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}

export function ClientTodoList({
  list,
  saved,
  onSave,
  records,
  onSaveRecords,
}: {
  list: TodoList;
  saved: number[];
  onSave: (listId: string, completed: number[]) => void;
  records: TaskRecords;
  onSaveRecords: (key: string, records: TaskRecord[]) => void;
}) {
  const checklistCount = list.items.filter(
    (item) => item.kind === "checklist" || item.kind === "reflection",
  ).length;
  const [completed, setCompleted] = useState(saved);
  const [status, setStatus] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [saving, setSaving] = useState(false);
  const changed =
    completed.length !== saved.length ||
    completed.some((id) => !saved.includes(id));

  async function save() {
    setSaving(true);
    setStatus("Saving demo progress…");
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (simulateFailure) {
      setStatus(
        "Save failed. Your choices are still here. Turn off simulated failure and retry.",
      );
    } else {
      onSave(list.id, completed);
      setStatus("Progress saved privately in demo memory.");
    }
    setSaving(false);
  }

  return (
    <section className="card">
      <h2>{list.title}</h2>
      <p>
        {checklistCount > 0 &&
          completed.length + " of " + checklistCount + " complete · "}
        Assigned by Dr. Lee
      </p>
      <div role="group" aria-label={list.title}>
        {list.items.map((item) => (
          <div key={item.id} className="task-row">
            {item.kind === "event" || item.kind === "activity" ? (
              <h3>{item.text}</h3>
            ) : (
              <label className="check">
                <input
                  type="checkbox"
                  checked={completed.includes(item.id)}
                  disabled={saving}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setCompleted((current) =>
                      checked
                        ? [...current, item.id]
                        : current.filter((id) => id !== item.id),
                    );
                    setStatus("");
                  }}
                />
                {item.text}
              </label>
            )}
            {item.focus && <p>{item.focus}</p>}
            {item.kind !== "reflection" && (
              <TaskRecordEditor
                item={item}
                records={records[taskKey(list.id, item.id)] ?? []}
                onSave={(next) =>
                  onSaveRecords(taskKey(list.id, item.id), next)
                }
                simulateFailure={simulateFailure}
              />
            )}
            {item.kind === "reflection" && (
              <a
                href={`#${reflectionPath(list.id, item.id)}`}
                aria-label={`Open reflection: ${item.text}`}
              >
                Open reflection
              </a>
            )}
          </div>
        ))}
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={simulateFailure}
          disabled={saving}
          onChange={(event) => setSimulateFailure(event.target.checked)}
        />
        {checklistCount
          ? "Simulate progress save failure"
          : "Simulate record save failure"}
      </label>
      {checklistCount > 0 && (
        <button disabled={saving || !changed} onClick={save}>
          {status.startsWith("Save failed")
            ? "Retry saving progress"
            : "Save demo progress"}
        </button>
      )}
      {status && <p role="status">{status}</p>}
    </section>
  );
}

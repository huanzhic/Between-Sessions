import { useRef, useState } from "react";
import { activity } from "./fixtures";

type TodoItem = { id: number; text: string; kind: "checklist" | "reflection" };
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
        <p>Choose steps for your client to work through between sessions.</p>
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
                  const kind =
                    event.target.value === "reflection"
                      ? "reflection"
                      : "checklist";
                  setItems((current) =>
                    current.map((entry) =>
                      entry.id === item.id ? { ...entry, kind } : entry,
                    ),
                  );
                  setPreview(null);
                  setStatus("");
                }}
              >
                <option value="checklist">Checklist item</option>
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
                  {item.kind === "reflection" && " · Reflection"}
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
                  {item.kind === "reflection" && " · Reflection"}
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
}: {
  list: TodoList;
  saved: number[];
  onSave: (listId: string, completed: number[]) => void;
}) {
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
        {completed.length} of {list.items.length} complete · Assigned by Dr. Lee
      </p>
      <div role="group" aria-label={list.title}>
        {list.items.map((item) => (
          <div key={item.id}>
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
        Simulate progress save failure
      </label>
      <button disabled={saving || !changed} onClick={save}>
        {status.startsWith("Save failed")
          ? "Retry saving progress"
          : "Save demo progress"}
      </button>
      {status && <p role="status">{status}</p>}
    </section>
  );
}

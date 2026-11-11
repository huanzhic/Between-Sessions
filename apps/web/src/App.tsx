import { useEffect, useState } from "react";
import type { TaskRecords } from "./TaskRecords";
import type { DemoUpdate } from "./SessionBrief";
import type { PrivateDraft } from "./fixtures";
import { Health } from "./Health";
import { Client } from "./Client";
import { Therapist } from "./Therapist";
import { initialTodoList, type TodoList, type TodoProgress } from "./Todos";

export default function App() {
  const [todoLists, setTodoLists] = useState<TodoList[]>([initialTodoList]);
  const [todoProgress, setTodoProgress] = useState<TodoProgress>({});
  const [taskRecords, setTaskRecords] = useState<TaskRecords>({});
  const [topic, setTopic] = useState("");
  const [drafts, setDrafts] = useState<Record<string, PrivateDraft>>({});
  const [updates, setUpdates] = useState<DemoUpdate[]>([]);
  const [route, setRoute] = useState(() =>
    typeof window === "undefined"
      ? "/client"
      : window.location.hash.slice(1) || "/client",
  );
  useEffect(() => {
    const change = () => setRoute(window.location.hash.slice(1) || "/client");
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const therapist = route.startsWith("/therapist");
  return (
    <div className={therapist ? "app therapist" : "app client"}>
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="demo-bar">
        <span>Fictional demo · Milestone 1 · No sign-in or server storage</span>
        <nav aria-label="Demo roles">
          <a href="#/client">Client demo</a>
          <a href="#/therapist">Therapist demo</a>
          <a href="#/sos">SOS resources</a>
        </nav>
      </div>
      {route === "/sos" ? (
        <main id="main" tabIndex={-1} className="sos">
          <a href="#/client">Between Sessions</a>
          <h1>SOS resources</h1>
          <h2>Prototype resource placeholder</h2>
          <p>
            This page does not contact emergency services or your therapist.
            Nobody is monitoring this entry.
          </p>
          <p>
            Location-specific resources and the final support flow have not been
            selected for this prototype.
          </p>
          <a className="button secondary" href="#/client">
            Return to client home
          </a>
        </main>
      ) : null}
      {therapist ? (
        <Therapist
          route={route}
          todoLists={todoLists}
          updates={updates}
          onAssignTodo={(draft) => {
            const list = { ...draft, id: crypto.randomUUID() };
            setTodoLists((current) => [...current, list]);
          }}
        />
      ) : (
        <div hidden={route === "/sos"}>
          <Client
            route={route}
            todoLists={todoLists}
            todoProgress={todoProgress}
            taskRecords={taskRecords}
            onSaveRecords={(key, records) =>
              setTaskRecords((current) => ({ ...current, [key]: records }))
            }
            topic={topic}
            onSaveTopic={setTopic}
            drafts={drafts}
            setDrafts={setDrafts}
            updates={updates}
            onSendUpdate={(update) =>
              setUpdates((current) =>
                current.some((entry) => entry.id === update.id)
                  ? current
                  : [update, ...current],
              )
            }
            onSaveTodo={(listId, completed) => {
              setTodoProgress((current) => ({
                ...current,
                [listId]: completed,
              }));
            }}
          />
        </div>
      )}
      <footer className="system-footer">
        <Health />
        <p>
          Demo actions use fictional data in memory. Refreshing clears your
          writing, to-do lists, and progress.
        </p>
      </footer>
    </div>
  );
}

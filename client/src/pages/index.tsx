import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";

type Task = {
  id: number;
  text: string;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  // サーバーからタスク一覧を取得する関数
  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:1323/tasks"); // サーバーからTODOリストを取得するエンドポイント
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const fetchedTasks = await response.json();
      const convertedTasks = fetchedTasks.map(convertDatesInTask);
      setTasks(convertedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("サーバーからタスク一覧を取得できませんでした");
    }
  };

  // サーバーにタスクを追加する関数
  const addTask = async () => {
    if (input.trim() !== "") {
      const newTask = {
        text: input,
      };

      try {
        const response = await fetch("http://localhost:1323/task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }
        fetchTasks();
        setInput(""); // 入力フィールドをクリア
      } catch (error) {
        alert("タスクの追加に失敗しました");
        console.error("Error creating task:", error);
      }
    }
  };

  // サーバーから取得したTASKデータをDateオブジェクトに変換する関数
  const convertDatesInTask = (task: any): Task => {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : null,
      deletedAt: task.deletedAt ? new Date(task.deletedAt) : null,
    };
  };

  // タスクをソートする関数
  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // チェックされていないタスクを先にする
      if (!!a.completedAt !== !!b.completedAt) {
        return !!a.completedAt ? 1 : -1;
      }
      // チェック状態に応じて異なるプロパティでソート
      if (!a.completedAt) {
        // チェックされていないタスクは作成日でソート
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        // チェックされているタスクはクリア日でソート
        return (
          (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0)
        );
      }
    });
  };

  // コンポーネントがマウントされた時に一覧を取得
  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (id: string | number) => {
    try {
      const response = await fetch(`http://localhost:1323/tasks/${id}/toggle`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle task");
      }
      fetchTasks();
    } catch (error) {
      alert("タスクの状態を更新できませんでした");
      console.error("Error toggling task:", error);
    }
  };

  const deleteTask = async (id: string | number) => {
    try {
      const response = await fetch(`http://localhost:1323/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      fetchTasks();
    } catch (error) {
      alert("タスクの削除に失敗しました");
      console.error("Error deleting task:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1>TODOアプリ</h1>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TODOを入力"
          className="border-2 border-gray-300 p-2"
        />
        <button
          onClick={addTask}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          追加
        </button>
      </div>
      <ul className="mt-4">
        {sortTasks(tasks).map((task) => (
          <li
            key={task.id}
            className={`list-disc ${!!task.completedAt ? "line-through" : ""}`}
          >
            <input
              type="checkbox"
              checked={!!task.completedAt}
              onChange={() => toggleTask(task.id)}
              className="mr-2"
            />
            {task.text}
            <button
              onClick={() => deleteTask(task.id)}
              className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

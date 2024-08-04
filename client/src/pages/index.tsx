import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

type Todo = {
  id: string | number;
  text: string;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim() !== "") {
      const newTodo = {
        id: uuidv4(),
        text: input,
        completedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newTodos = [...todos, newTodo];
      // 新しいタスクを追加した後にソート
      const sortedTodos = sortTodos(newTodos);
      setTodos(sortedTodos);
      setInput("");
    }
  };

  const toggleTodo = (id: string | number) => {
    const newTodos = todos.map((todo) => {
      const isNowChecked = !todo.completedAt;
      const newCompletedAt = isNowChecked ? new Date() : null;
      const newTodo = {
        ...todo,
        completedAt: newCompletedAt,
        updatedAt: new Date(),
      };
      return todo.id === id ? newTodo : todo;
    });
    // チェック状態を変更した後にソート
    const sortedTodos = sortTodos(newTodos);
    setTodos(sortedTodos);
  };

  const deleteTodo = (id: string | number) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  // タスクをソートする関数
  const sortTodos = (todos: Todo[]) => {
    return todos.sort((a, b) => {
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
          onClick={addTodo}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          追加
        </button>
      </div>
      <ul className="mt-4">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`list-disc ${!!todo.completedAt ? "line-through" : ""}`}
          >
            <input
              type="checkbox"
              checked={!!todo.completedAt}
              onChange={() => toggleTodo(todo.id)}
              className="mr-2"
            />
            {todo.text}
            <button
              onClick={() => deleteTodo(todo.id)}
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

import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      const response = await fetch("http://localhost:1323/");
      const text = await response.text();
      setMessage(text);
    };

    fetchMessage();
  }, []);
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <h1>Hello, World!</h1>
        <h2>サーバーからのメッセージ: {message}</h2>
      </div>
    </main>
  );
}

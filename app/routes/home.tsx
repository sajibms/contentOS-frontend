import TextEditor from "~/components/Editor/textEditor/TextEditor";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl">Welcome to React Router!</h1>
      <TextEditor />
    </div>
  );
}

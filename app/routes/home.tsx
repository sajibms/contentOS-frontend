import TextEditor from "~/components/Editor/textEditor/TextEditor";
import type { Route } from "./+types/home";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";

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
      {/* <TextEditor /> */}

      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
          <div className="flex h-full w-full items-center justify-center">
            <TextEditor />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

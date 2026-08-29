import { verifyAdmin } from "@/lib/auth";
import { RecipeEditor } from "./recipe-editor";

export default async function NewRecipePage() {
  await verifyAdmin();
  return <RecipeEditor />;
}

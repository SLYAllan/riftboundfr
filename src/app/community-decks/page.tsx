import { redirect } from "next/navigation";

export default function CommunityDecksRedirect() {
  redirect("/decks?cat=community");
}

// Server Component 
import { MenuContent } from "./menu-content";

// This is a Server Component that safely extracts params and passes them as props
export default async function MenuPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  return <MenuContent id={resolvedParams.id} />;
}

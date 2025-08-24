// Server Component
import { EditMenuContent } from "./edit-menu-content";

// This is a Server Component that safely extracts params and passes them as props
export default function EditMenuPage({ params }: { params: { id: string } }) {
  return <EditMenuContent id={params.id} />;
}

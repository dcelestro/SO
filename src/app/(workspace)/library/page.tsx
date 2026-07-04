import { LibraryView } from "@/components/library/library-view";
import { getPrisma } from "@/lib/prisma";

export default async function LibraryPage() {
  const prisma = getPrisma();
  
  const items = await prisma.libraryItem.findMany({
    where: {
      status: {
        not: "archived",
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return <LibraryView initialItems={items} />;
}

const fs = require('fs');

let content = fs.readFileSync('src/components/quick-create.tsx', 'utf8');

// Add secondary mutation imports
content = content.replace(
    'import { useCreateTaskMutation, useCreateProjectMutation } from "@/hooks/use-queries";',
    'import { useCreateTaskMutation, useCreateProjectMutation, useCreateAssetMutation, useCreateIdeaMutation, useCreateDueItemMutation, useCreateReviewMutation } from "@/hooks/use-queries";'
);

// Add hook calls
content = content.replace(
    '  const createProjectMut = useCreateProjectMutation();',
    '  const createProjectMut = useCreateProjectMutation();\n  const createAssetMut = useCreateAssetMutation();\n  const createIdeaMut = useCreateIdeaMutation();\n  const createDueItemMut = useCreateDueItemMutation();\n  const createReviewMut = useCreateReviewMutation();'
);

const ideaOld = `    else if (kind === "idea")
      setData((d) => ({
        ...d,
        ideas: [
          {
            id,
            title,
            description: String(fd.get("description") || ""),
            areaId,
            potential: priority,
            complexity: "medium",
            status: "captured",
            reviewDate: date,
          },
          ...d.ideas,
        ],
      }));`;
const ideaNew = `    else if (kind === "idea")
      createIdeaMut.mutate({
        title,
        description: String(fd.get("description") || ""),
        areaId,
        potential: priority,
        complexity: "medium",
        status: "captured",
        reviewDate: date,
      });`;
content = content.replace(ideaOld, ideaNew);

const assetOld = `    else if (kind === "asset")
      setData((d) => ({
        ...d,
        assets: [
          {
            id,
            name: title,
            projectId,
            type: String(fd.get("type") || "other"),
            provider: String(fd.get("provider") || ""),
            renewalDate: date,
            status: "active",
          },
          ...d.assets,
        ],
      }));`;
const assetNew = `    else if (kind === "asset")
      createAssetMut.mutate({
        name: title,
        projectId,
        type: String(fd.get("type") || "other"),
        provider: String(fd.get("provider") || ""),
        renewalDate: date,
        status: "active",
      });`;
content = content.replace(assetOld, assetNew);

const dueOld = `    else if (kind === "due")
      setData((d) => ({
        ...d,
        dues: [
          {
            id,
            title,
            projectId,
            type: String(fd.get("type") || "other"),
            dueDate: date || now,
            status: "pending",
          },
          ...d.dues,
        ],
      }));`;
const dueNew = `    else if (kind === "due")
      createDueItemMut.mutate({
        title,
        projectId,
        type: String(fd.get("type") || "other"),
        dueDate: date || now,
        status: "pending",
      });`;
content = content.replace(dueOld, dueNew);

const reviewOld = `    else
      setData((d) => ({
        ...d,
        reviews: [
          {
            id,
            title,
            projectId,
            type: "project_review",
            frequency: "monthly",
            nextReviewDate: date || now,
            status: "pending",
          },
          ...d.reviews,
        ],
      }));`;
const reviewNew = `    else
      createReviewMut.mutate({
        title,
        projectId,
        type: "project_review",
        frequency: "monthly",
        nextReviewDate: date || now,
        status: "pending",
      });`;
content = content.replace(reviewOld, reviewNew);


// Delete API calls logic in the catch block / finally block (Wait, I need to see how the generic API calls were made)
// Let me look at the bottom of the function.

fs.writeFileSync('src/components/quick-create.tsx', content);

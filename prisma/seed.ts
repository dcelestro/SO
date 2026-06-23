import {
  PrismaClient,
  ProjectMaturity,
  ProjectStatus,
  ProjectType,
  ShortcutType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const areaDefinitions = [
  { name: "Abundia", color: "#2563eb" },
  { name: "Ecommerce", color: "#059669" },
  { name: "Newsletter", color: "#7c3aed" },
  { name: "Apps personales", color: "#d97706" },
  { name: "Infraestructura", color: "#475569" },
] as const;

const projectDefinitions = [
  { area: "Abundia", name: "Abundia Agenda", type: ProjectType.app },
  { area: "Abundia", name: "Portal Abundia", type: ProjectType.web },
  { area: "Abundia", name: "Landing Abundia", type: ProjectType.web },
  { area: "Ecommerce", name: "Ecommerce productos capilares", type: ProjectType.ecommerce },
  { area: "Newsletter", name: "Newsletter cuidado capilar", type: ProjectType.newsletter },
  { area: "Apps personales", name: "App de inversiones", type: ProjectType.app },
] as const;

const modulesByProject: Record<string, string[]> = {
  "Abundia Agenda": ["Calendario", "Clientes", "Turnos", "Notificaciones"],
  "Portal Abundia": ["Autenticación", "Dashboard cliente", "Suscripciones", "Soporte técnico"],
  "Landing Abundia": ["Hero", "Pricing", "Formulario de contacto", "SEO"],
  "Ecommerce productos capilares": ["Catálogo", "Proveedores", "Checkout", "Marketing"],
  "Newsletter cuidado capilar": ["Fuentes", "Calendario editorial", "Redacción", "Envíos"],
  "App de inversiones": ["Portfolio", "Seguimiento de activos", "Alertas", "APIs financieras"],
};

async function clearDatabase() {
  await db.activityLog.deleteMany();
  await db.desktopShortcut.deleteMany();
  await db.weeklyFocus.deleteMany();
  await db.inboxItem.deleteMany();
  await db.alert.deleteMany();
  await db.importantDate.deleteMany();
  await db.decision.deleteMany();
  await db.resource.deleteMany();
  await db.credential.deleteMany();
  await db.document.deleteMany();
  await db.task.deleteMany();
  await db.projectModule.deleteMany();
  await db.project.deleteMany();
  await db.area.deleteMany();
  await db.user.deleteMany();
}

async function main() {
  await clearDatabase();

  await db.user.create({
    data: {
      name: "Dario",
      email: "dario@local.test",
      passwordHash: await bcrypt.hash("nexo-demo", 12),
    },
  });

  const areas = new Map<string, { id: string }>();
  for (const definition of areaDefinitions) {
    const area = await db.area.create({ data: definition });
    areas.set(area.name, area);
  }

  const projects = new Map<string, { id: string; areaId: string }>();
  for (const definition of projectDefinitions) {
    const area = areas.get(definition.area)!;
    const project = await db.project.create({
      data: {
        name: definition.name,
        description: `Centro de trabajo para ${definition.name}.`,
        areaId: area.id,
        status: ProjectStatus.active,
        maturity: ProjectMaturity.development,
        projectType: definition.type,
        nextAction: "Definir el próximo entregable concreto",
      },
    });
    projects.set(project.name, project);
  }

  const modules = new Map<string, { id: string }>();
  for (const [projectName, moduleNames] of Object.entries(modulesByProject)) {
    const project = projects.get(projectName)!;
    for (const name of moduleNames) {
      const projectModule = await db.projectModule.create({
        data: { name, areaId: project.areaId, projectId: project.id, status: "active" },
      });
      modules.set(`${projectName}/${name}`, projectModule);
    }
  }

  const abundia = areas.get("Abundia")!;
  const agenda = projects.get("Abundia Agenda")!;
  const calendario = modules.get("Abundia Agenda/Calendario")!;

  await db.task.create({
    data: {
      title: "Definir alcance del próximo incremento",
      areaId: abundia.id,
      projectId: agenda.id,
      moduleId: calendario.id,
      status: "in_progress",
      priority: "high",
      context: "development",
    },
  });
  await db.document.create({
    data: { title: "Alcance inicial", areaId: abundia.id, projectId: agenda.id, type: "specification" },
  });
  await db.credential.create({
    data: { name: "Cuenta de desarrollo", areaId: abundia.id, projectId: agenda.id, serviceName: "Nexo local" },
  });
  await db.resource.create({
    data: { name: "Repositorio Abundia Agenda", areaId: abundia.id, projectId: agenda.id, type: "repository" },
  });
  await db.decision.create({
    data: { title: "Mantener arquitectura jerárquica V2", areaId: abundia.id, projectId: agenda.id, decidedAt: new Date() },
  });
  await db.importantDate.create({
    data: { title: "Revisión del alcance", areaId: abundia.id, projectId: agenda.id, type: "review", date: new Date(Date.now() + 7 * 86_400_000) },
  });
  await db.alert.create({
    data: { title: "Revisar próxima acción", areaId: abundia.id, projectId: agenda.id, type: "manual", severity: "low" },
  });
  await db.inboxItem.create({ data: { title: "Procesar notas iniciales" } });

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  await db.weeklyFocus.create({
    data: {
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      mainScopeType: "project",
      mainAreaId: abundia.id,
      mainProjectId: agenda.id,
      weeklyGoal: "Estabilizar la base actual de Nexo.",
    },
  });

  const shortcuts = [
    { name: "Explorador", type: ShortcutType.system, targetType: "explorer", icon: "FolderTree", color: "#475569", sortOrder: 0, isPinned: true },
    { name: "Abundia", type: ShortcutType.area, targetType: "area", targetId: abundia.id, icon: "Building2", color: "#2563eb", sortOrder: 1, isPinned: true },
    { name: "Ecommerce", type: ShortcutType.area, targetType: "area", targetId: areas.get("Ecommerce")!.id, icon: "ShoppingBag", color: "#059669", sortOrder: 2, isPinned: true },
    { name: "Newsletter", type: ShortcutType.area, targetType: "area", targetId: areas.get("Newsletter")!.id, icon: "Mail", color: "#7c3aed", sortOrder: 3, isPinned: true },
    { name: "Inbox", type: ShortcutType.inbox, targetType: "inbox", icon: "Inbox", color: "#d97706", sortOrder: 4, isPinned: false },
    { name: "Alertas", type: ShortcutType.alerts, targetType: "alerts", icon: "AlertCircle", color: "#dc2626", sortOrder: 5, isPinned: false },
  ];
  await db.desktopShortcut.createMany({ data: shortcuts });
  await db.activityLog.create({
    data: { areaId: abundia.id, projectId: agenda.id, entityType: "Project", entityId: agenda.id, action: "seeded", description: "Datos jerárquicos iniciales creados" },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

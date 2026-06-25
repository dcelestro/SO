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
  { area: "Apps personales", name: "Nexo", type: ProjectType.app },
  { area: "Infraestructura", name: "Servidor personal", type: ProjectType.infrastructure },
] as const;

const modulesByProject: Record<string, string[]> = {
  "Abundia Agenda": ["Calendario", "Clientes", "Turnos", "Login operativo"],
  "Portal Abundia": ["Autenticación", "Dashboard cliente", "Suscripciones", "Soporte técnico"],
  "Landing Abundia": ["Hero", "Pricing", "Formulario de contacto", "SEO"],
  "Ecommerce productos capilares": ["Proveedores", "Catálogo", "Newsletter"],
  "Newsletter cuidado capilar": ["Fuentes", "Calendario editorial", "Redacción", "Envíos"],
  "App de inversiones": ["Portfolio", "Seguimiento de activos", "Alertas", "APIs financieras"],
  "Nexo": ["Inicio", "Explorador", "Recursos", "Pizarras", "Seguridad / La Caja"],
  "Servidor personal": ["Backups", "Acceso remoto", "Docker / Portainer"],
};

async function clearDatabase() {
  await db.activityLog.deleteMany();
  await db.board.deleteMany();
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
        data: { name, areaId: project.areaId, projectId: project.id, status: "active", nextAction: `Definir el próximo paso de ${name}` },
      });
      modules.set(`${projectName}/${name}`, projectModule);
    }
  }

  const abundia = areas.get("Abundia")!;
  const agenda = projects.get("Abundia Agenda")!;
  const calendario = modules.get("Abundia Agenda/Calendario")!;
  const clientes = modules.get("Abundia Agenda/Clientes")!;
  const turnos = modules.get("Abundia Agenda/Turnos")!;
  const ecommerce = areas.get("Ecommerce")!;
  const ecommerceProject = projects.get("Ecommerce productos capilares")!;
  const proveedores = modules.get("Ecommerce productos capilares/Proveedores")!;
  const newsletter = areas.get("Newsletter")!;
  const newsletterProject = projects.get("Newsletter cuidado capilar")!;
  const fuentes = modules.get("Newsletter cuidado capilar/Fuentes")!;
  const portal = projects.get("Portal Abundia")!;
  const suscripciones = modules.get("Portal Abundia/Suscripciones")!;
  const landing = projects.get("Landing Abundia")!;
  const seo = modules.get("Landing Abundia/SEO")!;
  const inversiones = projects.get("App de inversiones")!;
  const financialApis = modules.get("App de inversiones/APIs financieras")!;
  const infrastructure = areas.get("Infraestructura")!;
  const personalServer = projects.get("Servidor personal")!;
  const backups = modules.get("Servidor personal/Backups")!;
  const accesoRemoto = modules.get("Servidor personal/Acceso remoto")!;
  const portainer = modules.get("Servidor personal/Docker / Portainer")!;
  const nexo = projects.get("Nexo")!;
  const nexoExplorer = modules.get("Nexo/Explorador")!;
  const nexoResources = modules.get("Nexo/Recursos")!;
  const nexoBoards = modules.get("Nexo/Pizarras")!;
  const nexoSecurity = modules.get("Nexo/Seguridad / La Caja")!;

  await db.task.createMany({
    data: [
      { title: "Definir reglas de superposición de turnos", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "in_progress", priority: "critical", context: "development" },
      { title: "Definir duración variable de turnos", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "pending", priority: "high", context: "design" },
      { title: "Crear vista semanal del calendario", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "pending", priority: "high", context: "development" },
      { title: "Validar límite de turnos simultáneos", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "completed", priority: "medium", completedAt: new Date(), context: "review" },
      { title: "Definir ficha mínima de cliente", areaId: abundia.id, projectId: agenda.id, moduleId: clientes.id, status: "in_progress", priority: "high", context: "design" },
      { title: "Definir historial de visitas", areaId: abundia.id, projectId: agenda.id, moduleId: clientes.id, status: "pending", priority: "medium", context: "development" },
      { title: "Definir estados de turno", areaId: abundia.id, projectId: agenda.id, moduleId: turnos.id, status: "pending", priority: "high", context: "design" },
      { title: "Definir cancelaciones y reprogramaciones", areaId: abundia.id, projectId: agenda.id, moduleId: turnos.id, status: "pending", priority: "high", context: "development" },
      { title: "Comparar proveedores nacionales", areaId: ecommerce.id, projectId: ecommerceProject.id, moduleId: proveedores.id, status: "in_progress", priority: "high", context: "research" },
      { title: "Registrar condiciones comerciales", areaId: ecommerce.id, projectId: ecommerceProject.id, moduleId: proveedores.id, status: "pending", priority: "medium", context: "commercial" },
      { title: "Definir criterios de selección", areaId: ecommerce.id, projectId: ecommerceProject.id, moduleId: proveedores.id, status: "pending", priority: "medium", context: "research" },
      { title: "Cargar fuentes principales", areaId: newsletter.id, projectId: newsletterProject.id, moduleId: fuentes.id, status: "in_progress", priority: "high", context: "content" },
      { title: "Clasificar fuentes por calidad", areaId: newsletter.id, projectId: newsletterProject.id, moduleId: fuentes.id, status: "pending", priority: "medium", context: "review" },
    ],
  });
  await db.document.create({
    data: { title: "Alcance inicial", areaId: abundia.id, projectId: agenda.id, type: "specification" },
  });
  await db.credential.create({
    data: { name: "Cuenta de desarrollo", areaId: abundia.id, projectId: agenda.id, serviceName: "Nexo local" },
  });
  await db.resource.createMany({
    data: [
      { name: "API de disponibilidad", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, type: "api", provider: "Abundia Agenda", status: "active" },
      { name: "Repositorio Abundia Agenda", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, type: "repository", provider: "GitHub", url: "https://github.com/dcelestro/SO", status: "active" },
      { name: "Mercado Pago", areaId: abundia.id, projectId: portal.id, moduleId: suscripciones.id, type: "payment_gateway", provider: "Mercado Pago", url: "https://www.mercadopago.com.ar/developers", status: "active", credentialProvider: "la_caja", credentialLabel: "Mercado Pago Producción", credentialUsernameHint: "admin@abundia.app" },
      { name: "Repositorio Portal Abundia", areaId: abundia.id, projectId: portal.id, moduleId: suscripciones.id, type: "repository", provider: "GitHub", url: "https://github.com/dcelestro/SO", status: "active" },
      { name: "Base de datos Portal", areaId: abundia.id, projectId: portal.id, moduleId: suscripciones.id, type: "database", provider: "PostgreSQL", status: "active", credentialProvider: "la_caja", credentialLabel: "PostgreSQL Portal Abundia" },
      { name: "Google Search Console", areaId: abundia.id, projectId: landing.id, moduleId: seo.id, type: "analytics", provider: "Google", url: "https://search.google.com/search-console", status: "active" },
      { name: "Dominio Abundia", areaId: abundia.id, projectId: landing.id, moduleId: seo.id, type: "domain", provider: "NIC/registrador", renewalDate: new Date(Date.now() + 20 * 86_400_000), status: "active", credentialProvider: "la_caja", credentialLabel: "Acceso dominio Abundia" },
      { name: "Lista de proveedores nacionales", areaId: ecommerce.id, projectId: ecommerceProject.id, moduleId: proveedores.id, type: "provider", provider: "Manual", notes: "Recurso inicial para investigación de proveedores.", status: "active" },
      { name: "Alpha Vantage", areaId: areas.get("Apps personales")!.id, projectId: inversiones.id, moduleId: financialApis.id, type: "api", provider: "Alpha Vantage", url: "https://www.alphavantage.co", status: "active", credentialProvider: "la_caja", credentialLabel: "Alpha Vantage API Key" },
      { name: "Yahoo Finance no oficial", areaId: areas.get("Apps personales")!.id, projectId: inversiones.id, moduleId: financialApis.id, type: "api", provider: "Externo", notes: "Evaluar confiabilidad antes de usar.", status: "pending" },
      { name: "Repo Nexo", areaId: areas.get("Apps personales")!.id, projectId: nexo.id, moduleId: nexoExplorer.id, type: "repository", provider: "GitHub", url: "https://github.com/dcelestro/SO", status: "active" },
      { name: "Base de datos Nexo", areaId: areas.get("Apps personales")!.id, projectId: nexo.id, moduleId: nexoResources.id, type: "database", provider: "PostgreSQL", status: "active", credentialProvider: "la_caja", credentialLabel: "PostgreSQL local Nexo" },
      { name: "La Caja", areaId: areas.get("Apps personales")!.id, projectId: nexo.id, moduleId: nexoSecurity.id, type: "tool", provider: "Local seguro", status: "pending", credentialProvider: "la_caja", credentialLabel: "Referencia segura sin secreto" },
      { name: "Registro de documentación visual", areaId: areas.get("Apps personales")!.id, projectId: nexo.id, moduleId: nexoBoards.id, type: "tool", provider: "Nexo", status: "active" },
      { name: "Google Drive Backup", areaId: infrastructure.id, projectId: personalServer.id, moduleId: backups.id, type: "backup", provider: "Google Drive", status: "active" },
      { name: "SRV-MRGADGET", areaId: infrastructure.id, projectId: personalServer.id, moduleId: accesoRemoto.id, type: "server", provider: "Local", status: "active", credentialProvider: "la_caja", credentialLabel: "Acceso SSH SRV-MRGADGET" },
      { name: "Portainer", areaId: infrastructure.id, projectId: personalServer.id, moduleId: portainer.id, type: "tool", provider: "Docker", url: "https://www.portainer.io", status: "active", credentialProvider: "la_caja", credentialLabel: "Acceso Portainer local" },
    ],
  });
  const diagram = (left: string, right: string) => ({
    nodes: [
      { id: "node-1", type: "box", x: 100, y: 120, width: 220, height: 100, text: left, color: "#ffffff", shape: "rectangle" },
      { id: "node-2", type: "box", x: 440, y: 120, width: 220, height: 100, text: right, color: "#dbeafe", shape: "rectangle" },
    ],
    edges: [{ id: "edge-1", fromNodeId: "node-1", toNodeId: "node-2", type: "arrow" }],
    viewport: { x: 0, y: 0, zoom: 1 },
  });
  await db.board.createMany({ data: [
    { title: "Flujo de suscripción Mercado Pago", description: "Alta y confirmación de una suscripción.", areaId: abundia.id, projectId: portal.id, moduleId: suscripciones.id, type: "flowchart", status: "active", data: diagram("Cliente inicia suscripción", "Mercado Pago confirma") },
    { title: "Flujo de turnos simultáneos", description: "Reglas visuales del calendario.", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, type: "process", status: "active", data: diagram("Solicitud de turno", "Validar disponibilidad") },
    { title: "Arquitectura Nexo + La Caja", description: "Separación entre contexto operativo y secretos.", areaId: areas.get("Apps personales")!.id, projectId: nexo.id, moduleId: nexoSecurity.id, type: "architecture", status: "active", data: diagram("Nexo organiza contexto", "La Caja protege secretos") },
    { title: "Flujo de backup local + nube", description: "Respaldo del servidor personal.", areaId: infrastructure.id, projectId: personalServer.id, moduleId: backups.id, type: "flowchart", status: "draft", data: diagram("Backup local", "Copia en la nube") },
  ] });
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

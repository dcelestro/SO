import {
  PrismaClient,
  ProjectMaturity,
  ProjectStatus,
  ProjectType,
  ShortcutType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const day = (offset: number) => new Date(Date.now() + offset * 86_400_000);

const areaDefinitions = [
  { name: "Abundia", color: "#2563eb" },
  { name: "Apps personales", color: "#d97706" },
  { name: "Webs", color: "#64748b" },
  { name: "Ecommerce", color: "#059669" },
  { name: "Newsletter", color: "#7c3aed" },
  { name: "Infraestructura", color: "#475569" },
  { name: "Administración", color: "#334155" },
] as const;

const projectDefinitions = [
  { area: "Abundia", name: "Abundia Agenda", type: ProjectType.app, status: ProjectStatus.active, maturity: ProjectMaturity.development },
  { area: "Abundia", name: "Portal Abundia", type: ProjectType.web, status: ProjectStatus.blocked, maturity: ProjectMaturity.testing },
  { area: "Abundia", name: "Landing Abundia", type: ProjectType.web, status: ProjectStatus.active, maturity: ProjectMaturity.production },
  { area: "Apps personales", name: "App de inversiones", type: ProjectType.app, status: ProjectStatus.frozen, maturity: ProjectMaturity.design },
  { area: "Apps personales", name: "Nexo", type: ProjectType.app, status: ProjectStatus.active, maturity: ProjectMaturity.development },
  { area: "Infraestructura", name: "Servidor personal", type: ProjectType.infrastructure, status: ProjectStatus.blocked, maturity: ProjectMaturity.maintenance },
  { area: "Ecommerce", name: "Ecommerce productos capilares", type: ProjectType.ecommerce, status: ProjectStatus.active, maturity: ProjectMaturity.testing },
  { area: "Newsletter", name: "Newsletter cuidado capilar", type: ProjectType.newsletter, status: ProjectStatus.active, maturity: ProjectMaturity.production },
] as const;

const modulesByProject: Record<string, string[]> = {
  "Abundia Agenda": ["Calendario", "Clientes", "Turnos", "Login operativo"],
  "Portal Abundia": ["Autenticación", "Dashboard cliente", "Suscripciones", "Soporte técnico"],
  "Landing Abundia": ["Hero", "Pricing", "Formulario de contacto", "SEO"],
  "App de inversiones": ["Portfolio", "Seguimiento de activos", "Alertas", "APIs financieras"],
  "Nexo": ["Inicio", "Explorador", "Recursos", "Pizarras", "Seguridad / La Caja"],
  "Servidor personal": ["Backups", "Acceso remoto", "Docker / Portainer"],
  "Ecommerce productos capilares": ["Proveedores", "Catálogo", "Newsletter"],
  "Newsletter cuidado capilar": ["Fuentes", "Calendario editorial", "Redacción", "Envíos"],
};

async function clearDatabase() {
  await db.activityLog.deleteMany();
  await db.weeklyFocusSecondaryProject.deleteMany();
  await db.weeklyFocusAvoidProject.deleteMany();
  await db.weeklyFocus.deleteMany();
  await db.review.deleteMany();
  await db.dueItem.deleteMany();
  await db.idea.deleteMany();
  await db.digitalAsset.deleteMany();
  await db.board.deleteMany();
  await db.desktopShortcut.deleteMany();
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
        status: definition.status,
        priority: definition.name === "Abundia Agenda" || definition.name === "Nexo" ? "critical" : "medium",
        maturity: definition.maturity,
        projectType: definition.type,
        nextAction: definition.status === ProjectStatus.active ? "Definir el próximo entregable concreto" : null,
        blockedReason: definition.status === ProjectStatus.blocked ? "Pendiente de decisión operativa" : null,
        targetDate: day(30),
        progressPercentage: definition.status === ProjectStatus.frozen ? 18 : 45,
        isFrozen: definition.status === ProjectStatus.frozen,
        frozenReason: definition.status === ProjectStatus.frozen ? "Reducir frentes abiertos" : null,
        frozenUntil: definition.status === ProjectStatus.frozen ? day(45) : null,
      },
    });
    projects.set(project.name, project);
  }

  const modules = new Map<string, { id: string }>();
  for (const [projectName, moduleNames] of Object.entries(modulesByProject)) {
    const project = projects.get(projectName)!;
    for (const name of moduleNames) {
      const projectModule = await db.projectModule.create({
        data: {
          name,
          areaId: project.areaId,
          projectId: project.id,
          status: "active",
          nextAction: `Definir el próximo paso de ${name}`,
        },
      });
      modules.set(`${projectName}/${name}`, projectModule);
    }
  }

  const abundia = areas.get("Abundia")!;
  const agenda = projects.get("Abundia Agenda")!;
  const calendario = modules.get("Abundia Agenda/Calendario")!;
  const clientes = modules.get("Abundia Agenda/Clientes")!;
  const turnos = modules.get("Abundia Agenda/Turnos")!;
  const portal = projects.get("Portal Abundia")!;
  const suscripciones = modules.get("Portal Abundia/Suscripciones")!;
  const landing = projects.get("Landing Abundia")!;
  const seo = modules.get("Landing Abundia/SEO")!;
  const apps = areas.get("Apps personales")!;
  const inversiones = projects.get("App de inversiones")!;
  const financialApis = modules.get("App de inversiones/APIs financieras")!;
  const nexo = projects.get("Nexo")!;
  const nexoExplorer = modules.get("Nexo/Explorador")!;
  const nexoResources = modules.get("Nexo/Recursos")!;
  const nexoBoards = modules.get("Nexo/Pizarras")!;
  const nexoSecurity = modules.get("Nexo/Seguridad / La Caja")!;
  const infrastructure = areas.get("Infraestructura")!;
  const personalServer = projects.get("Servidor personal")!;
  const backups = modules.get("Servidor personal/Backups")!;
  const accesoRemoto = modules.get("Servidor personal/Acceso remoto")!;
  const portainer = modules.get("Servidor personal/Docker / Portainer")!;
  const ecommerce = areas.get("Ecommerce")!;
  const ecommerceProject = projects.get("Ecommerce productos capilares")!;
  const proveedores = modules.get("Ecommerce productos capilares/Proveedores")!;
  const newsletter = areas.get("Newsletter")!;
  const newsletterProject = projects.get("Newsletter cuidado capilar")!;
  const fuentes = modules.get("Newsletter cuidado capilar/Fuentes")!;

  await db.task.createMany({
    data: [
      { title: "Definir reglas de superposición de turnos", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "in_progress", priority: "critical", dueDate: day(0), isToday: true, isCritical: true, context: "development" },
      { title: "Definir duración variable de turnos", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "pending", priority: "high", context: "design" },
      { title: "Crear vista semanal del calendario", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "pending", priority: "high", context: "development" },
      { title: "Validar límite de turnos simultáneos", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, status: "completed", priority: "medium", completedAt: new Date(), context: "review" },
      { title: "Definir ficha mínima de cliente", areaId: abundia.id, projectId: agenda.id, moduleId: clientes.id, status: "in_progress", priority: "high", context: "design" },
      { title: "Definir estados de turno", areaId: abundia.id, projectId: agenda.id, moduleId: turnos.id, status: "pending", priority: "high", context: "design" },
      { title: "Comparar proveedores nacionales", areaId: ecommerce.id, projectId: ecommerceProject.id, moduleId: proveedores.id, status: "in_progress", priority: "high", context: "research" },
      { title: "Cargar fuentes principales", areaId: newsletter.id, projectId: newsletterProject.id, moduleId: fuentes.id, status: "in_progress", priority: "high", context: "content" },
      { title: "Procesar notas sueltas", status: "inbox", priority: "low", isToday: true },
    ],
  });

  const asset = await db.digitalAsset.create({
    data: {
      name: "Dominio abundia.app",
      areaId: abundia.id,
      projectId: agenda.id,
      type: "domain",
      provider: "Cloudflare",
      url: "https://abundia.app",
      accountEmail: "admin@abundia.app",
      passwordManagerReference: "Bitwarden: Abundia / Dominio",
      renewalDate: day(18),
      cost: 18,
      currency: "USD",
      status: "active",
    },
  });

  await db.dueItem.createMany({
    data: [
      { title: "Renovar dominio abundia.app", projectId: agenda.id, assetId: asset.id, type: "domain", dueDate: day(18), reminderDate: day(11), recurrence: "yearly", status: "pending", amount: 18, currency: "USD" },
      { title: "Backup del servidor", projectId: personalServer.id, type: "backup", dueDate: day(-1), recurrence: "monthly", status: "pending" },
      { title: "Licencia de diseño", projectId: ecommerceProject.id, type: "license", dueDate: day(6), recurrence: "monthly", status: "pending", amount: 15, currency: "USD" },
    ],
  });

  await db.resource.createMany({
    data: [
      { name: "API de disponibilidad", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, type: "api", provider: "Abundia Agenda", status: "active" },
      { name: "Repositorio Abundia Agenda", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, type: "repository", provider: "GitHub", url: "https://github.com/dcelestro/SO", status: "active" },
      { name: "Mercado Pago", areaId: abundia.id, projectId: portal.id, moduleId: suscripciones.id, type: "payment_gateway", provider: "Mercado Pago", url: "https://www.mercadopago.com.ar/developers", status: "active", credentialProvider: "la_caja", credentialLabel: "Mercado Pago Producción", credentialUsernameHint: "admin@abundia.app" },
      { name: "Google Search Console", areaId: abundia.id, projectId: landing.id, moduleId: seo.id, type: "analytics", provider: "Google", url: "https://search.google.com/search-console", status: "active" },
      { name: "Lista de proveedores nacionales", areaId: ecommerce.id, projectId: ecommerceProject.id, moduleId: proveedores.id, type: "provider", provider: "Manual", notes: "Recurso inicial para investigación de proveedores.", status: "active" },
      { name: "Alpha Vantage", areaId: apps.id, projectId: inversiones.id, moduleId: financialApis.id, type: "api", provider: "Alpha Vantage", url: "https://www.alphavantage.co", status: "active", credentialProvider: "la_caja", credentialLabel: "Alpha Vantage API Key" },
      { name: "Repo Nexo", areaId: apps.id, projectId: nexo.id, moduleId: nexoExplorer.id, type: "repository", provider: "GitHub", url: "https://github.com/dcelestro/SO", status: "active" },
      { name: "Base de datos Nexo", areaId: apps.id, projectId: nexo.id, moduleId: nexoResources.id, type: "database", provider: "PostgreSQL", status: "active", credentialProvider: "la_caja", credentialLabel: "PostgreSQL local Nexo" },
      { name: "La Caja", areaId: apps.id, projectId: nexo.id, moduleId: nexoSecurity.id, type: "tool", provider: "Local seguro", status: "pending", credentialProvider: "la_caja", credentialLabel: "Referencia segura sin secreto" },
      { name: "Registro de documentación visual", areaId: apps.id, projectId: nexo.id, moduleId: nexoBoards.id, type: "tool", provider: "Nexo", status: "active" },
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

  await db.board.createMany({
    data: [
      { title: "Flujo de turnos simultáneos", description: "Reglas visuales del calendario.", areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, type: "process", status: "active", data: diagram("Solicitud de turno", "Validar disponibilidad") },
      { title: "Arquitectura Nexo + La Caja", description: "Separación entre contexto operativo y referencias seguras.", areaId: apps.id, projectId: nexo.id, moduleId: nexoSecurity.id, type: "architecture", status: "active", data: diagram("Nexo organiza contexto", "La Caja protege secretos") },
      { title: "Flujo de backup local + nube", description: "Respaldo del servidor personal.", areaId: infrastructure.id, projectId: personalServer.id, moduleId: backups.id, type: "flowchart", status: "draft", data: diagram("Backup local", "Copia en la nube") },
    ],
  });

  await db.idea.createMany({
    data: [
      { title: "Biblioteca de decisiones", description: "Registrar por qué se eligió cada camino.", areaId: apps.id, potential: "high", complexity: "medium", status: "inbox", reviewDate: day(14) },
      { title: "Radar de costos SaaS", areaId: areas.get("Administración")!.id, potential: "medium", complexity: "low", status: "inbox", reviewDate: day(21) },
    ],
  });

  await db.review.createMany({
    data: [
      { title: "Revisión semanal de foco", type: "weekly_review", frequency: "weekly", nextReviewDate: day(2), status: "pending" },
      { title: "Revisión de backups", projectId: personalServer.id, areaId: infrastructure.id, type: "backup_review", frequency: "monthly", nextReviewDate: day(-3), status: "pending" },
    ],
  });

  await db.document.create({ data: { title: "Alcance inicial", areaId: abundia.id, projectId: agenda.id, type: "specification" } });
  await db.credential.create({ data: { name: "Cuenta de desarrollo", areaId: abundia.id, projectId: agenda.id, serviceName: "Nexo local" } });
  await db.decision.create({ data: { title: "Mantener arquitectura jerárquica V2", areaId: abundia.id, projectId: agenda.id, decidedAt: new Date() } });
  await db.importantDate.create({ data: { title: "Revisión del alcance", areaId: abundia.id, projectId: agenda.id, type: "review", date: day(7) } });
  await db.alert.create({ data: { title: "Revisar próxima acción", areaId: abundia.id, projectId: agenda.id, type: "manual", severity: "low" } });
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
      weeklyGoal: "Cerrar el alcance funcional y dejar el MVP listo para validar.",
      notes: "Proteger dos bloques de trabajo profundo.",
      secondaryProjects: { create: [{ projectId: ecommerceProject.id }, { projectId: newsletterProject.id }] },
      avoidProjects: { create: [{ projectId: inversiones.id }] },
    },
  });


  await db.libraryItem.deleteMany();
  await db.libraryItem.createMany({
    data: [
      {
        title: "Prompt: Auditoría técnica de repositorio",
        description: "Útil para cuando te pasan un repositorio nuevo y necesitás entender rápido de qué va, stack, y detectar red flags.",
        type: "prompt",
        category: "desarrollo",
        tags: ["auditoria", "onboarding", "tech-lead"],
        variables: ["{{repo_url}}"],
        content: "Actúa como un Tech Lead Senior.\nAnaliza el siguiente repositorio: {{repo_url}}\n\nQuiero que me devuelvas un reporte con:\n1. Stack tecnológico detectado y patrones arquitectónicos.\n2. Red flags o malas prácticas evidentes (ej. credenciales hardcodeadas, dependencias vulnerables).\n3. Complejidad de la base de código y deuda técnica estimada.\n4. Top 3 cosas a mejorar urgentemente.\n\nSé directo y técnico."
      },
      {
        title: "Prompt: Crear issue/tarea para Dev",
        description: "Genera una tarea accionable para pasarle a un desarrollador, a partir de un requerimiento ambiguo.",
        type: "prompt",
        category: "prompts",
        tags: ["agile", "issues", "pm"],
        variables: ["{{requerimiento}}"],
        content: "Convertí el siguiente requerimiento ambiguo en una tarea (issue) lista para que un desarrollador la tome y programe:\n\nRequerimiento: {{requerimiento}}\n\nDevolveme:\n- Título descriptivo\n- Contexto breve\n- Criterios de aceptación claros (viñetas)\n- Consideraciones técnicas o notas (opcional)"
      },
      {
        title: "Modelo de Especificación Funcional",
        description: "Plantilla para describir una nueva feature antes de programarla.",
        type: "functional_spec",
        category: "documentacion",
        tags: ["specs", "producto"],
        variables: ["{{feature_name}}", "{{objetivo}}", "{{restricciones}}"],
        content: "# Especificación Funcional: {{feature_name}}\n\n## 1. Objetivo\n{{objetivo}}\n\n## 2. Casos de Uso\n- [ ] Como usuario quiero... para...\n- [ ] Como admin quiero... para...\n\n## 3. Restricciones y Supuestos\n{{restricciones}}\n\n## 4. Fuera del Alcance (Out of scope)\n- ...\n\n## 5. Diseño de Interfaz / Wireframes\n(Pegar links acá)"
      },
      {
        title: "Mensaje a cliente: Avance semanal",
        description: "Plantilla para enviar reporte de status semanal de forma profesional y transparente.",
        type: "client_message",
        category: "clientes",
        tags: ["comunicacion", "status"],
        variables: ["{{cliente}}", "{{logros}}", "{{siguientes_pasos}}", "{{bloqueos}}"],
        content: "Hola {{cliente}}, ¿cómo estás?\n\nTe escribo para dejarte el reporte de avances de esta semana en el proyecto.\n\n✅ **Lo que completamos:**\n{{logros}}\n\n🔜 **Próximos pasos (semana que viene):**\n{{siguientes_pasos}}\n\n⚠️ **Dudas o bloqueos:**\n{{bloqueos}}\n\nCualquier duda, avisame y lo revisamos.\n¡Buen fin de semana!"
      },
      {
        title: "Checklist: Revisión antes de entregar feature",
        description: "Pasos mínimos antes de dar por cerrada una funcionalidad y pasarla a QA o Prod.",
        type: "checklist",
        category: "testing",
        tags: ["qa", "checklist"],
        variables: [],
        content: "- [ ] El código compila sin errores (ej. `tsc --noEmit`).\n- [ ] La consola del navegador no tira errores rojos.\n- [ ] Probado en Mobile y Desktop.\n- [ ] Funciona el 'happy path'.\n- [ ] Funciona cuando el usuario hace cosas inesperadas (manejo de errores).\n- [ ] El código viejo no se rompió (regression check).\n- [ ] Se removieron los console.log o prints de debug.\n- [ ] No hay credenciales ({{API_KEY}}) harcodeadas en texto plano."
      },
      {
        title: "Modelo de Reporte de Bugs",
        description: "Estructura para reportar un bug de manera que el dev pueda reproducirlo.",
        type: "report",
        category: "testing",
        tags: ["bugs", "qa"],
        variables: ["{{titulo}}", "{{entorno}}"],
        content: "## Bug: {{titulo}}\n\n**Entorno:** {{entorno}} (ej. Prod, Staging, Chrome Mac)\n\n**Pasos para reproducir:**\n1. Entrar a...\n2. Hacer clic en...\n3. Escribir...\n\n**Comportamiento esperado:**\nDebería pasar X.\n\n**Comportamiento actual (Error):**\nEstá pasando Y.\n\n**Evidencia:**\n(Pegar URL de video o screenshot)"
      }
    ]
  });

  await db.desktopShortcut.createMany({
    data: [
      { name: "Explorador", type: ShortcutType.system, targetType: "explorer", icon: "FolderTree", color: "#475569", sortOrder: 0, isPinned: true },
      { name: "Abundia", type: ShortcutType.area, targetType: "area", targetId: abundia.id, icon: "Building2", color: "#2563eb", sortOrder: 1, isPinned: true },
      { name: "Ecommerce", type: ShortcutType.area, targetType: "area", targetId: ecommerce.id, icon: "ShoppingBag", color: "#059669", sortOrder: 2, isPinned: true },
      { name: "Newsletter", type: ShortcutType.area, targetType: "area", targetId: newsletter.id, icon: "Mail", color: "#7c3aed", sortOrder: 3, isPinned: true },
    ],
  });

  await db.activityLog.createMany({
    data: [
      { areaId: abundia.id, projectId: agenda.id, moduleId: calendario.id, entityType: "Task", entityId: calendario.id, action: "task.created", description: "Tareas iniciales de Calendario" },
      { areaId: apps.id, projectId: nexo.id, moduleId: nexoSecurity.id, entityType: "Board", entityId: nexoSecurity.id, action: "board.created", description: "Arquitectura Nexo + La Caja" },
      { areaId: infrastructure.id, projectId: personalServer.id, entityType: "Project", entityId: personalServer.id, action: "seeded", description: "Datos jerárquicos iniciales creados" },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

import { PrismaClient, Priority, ProjectMaturity, ProjectStatus, ProjectType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const day = (offset:number) => new Date(Date.now()+offset*86400000);

async function main() {
  await db.activityLog.deleteMany();
  await db.weeklyFocus.deleteMany();
  await db.review.deleteMany();
  await db.dueItem.deleteMany();
  await db.idea.deleteMany();
  await db.digitalAsset.deleteMany();
  await db.task.deleteMany();
  await db.project.deleteMany();
  await db.area.deleteMany();
  await db.user.deleteMany();

  await db.user.create({
    data: {
      name: "Dario",
      email: "dario@local.test",
      passwordHash: await bcrypt.hash("nexo-demo", 12),
    },
  });

  const names = [
    "Abundia",
    "Apps personales",
    "Webs",
    "Ecommerce",
    "Newsletter",
    "Infraestructura",
    "Administración",
  ];
  const areas = await Promise.all(
    names.map((name, i) =>
      db.area.create({
        data: {
          name,
          color: [
            "#1e293b",
            "#2563eb",
            "#64748b",
            "#059669",
            "#7c3aed",
            "#d97706",
            "#475569",
          ][i],
        },
      }),
    ),
  );

  const make = (
    name: string,
    areaId: string,
    status: ProjectStatus,
    priority: Priority,
    maturity: ProjectMaturity,
    projectType: ProjectType,
    nextAction?: string,
  ) =>
    db.project.create({
      data: {
        name,
        areaId,
        status,
        priority,
        maturity,
        projectType,
        nextAction,
        description: `Centro de trabajo para ${name}.`,
        targetDate: day(30),
        progressPercentage: status === "completed" ? 100 : 35,
      },
    });

  const projects = await Promise.all([
    make(
      "Abundia Agenda",
      areas[0].id,
      "active",
      "critical",
      "development",
      "app",
      "Cerrar alcance funcional del MVP",
    ),
    make("Portal Abundia", areas[0].id, "blocked", "high", "testing", "web"),
    make(
      "Landing Abundia",
      areas[0].id,
      "active",
      "medium",
      "production",
      "web",
      "Revisar conversión del hero",
    ),
    make("Ticketera Abundia", areas[0].id, "paused", "low", "design", "app"),
    make(
      "Sistema de pagos Abundia",
      areas[0].id,
      "active",
      "high",
      "validation",
      "business",
      "Validar flujo de suscripción",
    ),
    make("App de inversiones", areas[1].id, "frozen", "low", "design", "app"),
    make(
      "App peluquería",
      areas[1].id,
      "active",
      "medium",
      "production",
      "app",
      "Probar cierre de caja",
    ),
    make(
      "App gestión de proyectos",
      areas[1].id,
      "active",
      "critical",
      "development",
      "app",
      "Completar navegación del MVP",
    ),
    make(
      "Ecommerce productos capilares",
      areas[3].id,
      "active",
      "high",
      "testing",
      "ecommerce",
      "Cargar catálogo inicial",
    ),
    make(
      "Newsletter peluquería",
      areas[4].id,
      "active",
      "medium",
      "production",
      "newsletter",
      "Escribir edición del viernes",
    ),
    make(
      "Servidor personal",
      areas[5].id,
      "blocked",
      "high",
      "maintenance",
      "infrastructure",
    ),
  ]);

  await db.project.update({
    where: { id: projects[5].id },
    data: {
      isFrozen: true,
      frozenReason: "Reducir frentes abiertos",
      frozenUntil: day(45),
    },
  });

  await db.task.createMany({
    data: [
      {
        title: "Definir módulos mínimos del MVP",
        projectId: projects[0].id,
        areaId: areas[0].id,
        status: "in_progress",
        priority: "critical",
        dueDate: day(0),
        isToday: true,
        isCritical: true,
        context: "development",
      },
      {
        title: "Resolver credenciales de staging",
        projectId: projects[1].id,
        areaId: areas[0].id,
        status: "blocked",
        priority: "high",
        dueDate: day(-2),
        isCritical: true,
        context: "admin",
      },
      {
        title: "Revisar catálogo y precios",
        projectId: projects[8].id,
        areaId: areas[3].id,
        status: "pending",
        priority: "high",
        dueDate: day(2),
        isToday: true,
        context: "review",
      },
      {
        title: "Borrador de newsletter",
        projectId: projects[9].id,
        areaId: areas[4].id,
        status: "pending",
        priority: "medium",
        dueDate: day(4),
        context: "content",
      },
      {
        title: "Procesar notas sueltas",
        status: "inbox",
        priority: "low",
        isToday: true,
      },
    ],
  });

  const asset = await db.digitalAsset.create({
    data: {
      name: "Dominio abundia.app",
      projectId: projects[0].id,
      areaId: areas[0].id,
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
      {
        title: "Renovar dominio abundia.app",
        projectId: projects[0].id,
        assetId: asset.id,
        type: "domain",
        dueDate: day(18),
        reminderDate: day(11),
        recurrence: "yearly",
        status: "pending",
        amount: 18,
        currency: "USD",
      },
      {
        title: "Backup del servidor",
        projectId: projects[10].id,
        type: "backup",
        dueDate: day(-1),
        recurrence: "monthly",
        status: "pending",
      },
      {
        title: "Licencia de diseño",
        projectId: projects[8].id,
        type: "license",
        dueDate: day(6),
        recurrence: "monthly",
        status: "pending",
        amount: 15,
        currency: "USD",
      },
    ],
  });

  await db.idea.createMany({
    data: [
      {
        title: "Biblioteca de decisiones",
        description: "Registrar por qué se eligió cada camino.",
        areaId: areas[1].id,
        potential: "high",
        complexity: "medium",
        status: "evaluating",
        reviewDate: day(14),
      },
      {
        title: "Radar de costos SaaS",
        areaId: areas[6].id,
        potential: "medium",
        complexity: "low",
        status: "captured",
        reviewDate: day(21),
      },
    ],
  });

  await db.review.createMany({
    data: [
      {
        title: "Revisión semanal de foco",
        type: "weekly_review",
        frequency: "weekly",
        nextReviewDate: day(2),
        status: "pending",
      },
      {
        title: "Revisión de backups",
        projectId: projects[10].id,
        areaId: areas[5].id,
        type: "backup_review",
        frequency: "monthly",
        nextReviewDate: day(-3),
        status: "pending",
      },
    ],
  });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  await db.weeklyFocus.create({
    data: {
      weekStartDate: start,
      weekEndDate: end,
      mainProjectId: projects[0].id,
      weeklyGoal: "Cerrar el alcance funcional y dejar el MVP listo para validar.",
      notes: "Proteger dos bloques de trabajo profundo.",
      secondaryProjects: {
        create: [
          { projectId: projects[8].id },
          { projectId: projects[9].id },
        ],
      },
      avoidProjects: {
        create: [
          { projectId: projects[5].id },
          { projectId: projects[3].id },
        ],
      },
    },
  });

  await db.activityLog.createMany({
    data: [
      {
        entityType: "Project",
        entityId: projects[0].id,
        action: "created",
        description: "Proyecto creado",
      },
      {
        entityType: "Task",
        entityId: projects[0].id,
        action: "completed",
        description: "Tarea de arquitectura completada",
      },
      {
        entityType: "Project",
        entityId: projects[5].id,
        action: "frozen",
        description: "Proyecto enviado al congelador",
      },
    ],
  });
}

main().finally(() => db.$disconnect());

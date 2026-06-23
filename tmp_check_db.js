const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
(async () => {
  try {
    const tables = await db.$queryRawUnsafe(`select table_name from information_schema.tables where table_schema=current_schema()`);
    console.log('tables:', tables.map(t => t.table_name));
    const hasDesktop = tables.some(t => t.table_name === 'DesktopShortcut' || t.table_name === 'desktopShortcut' || t.table_name === 'desktop_shortcut');
    console.log('hasDesktop', hasDesktop);
    const res1 = await db.$queryRawUnsafe(`select count(*) as count from information_schema.columns where table_schema=current_schema() and table_name='Task' and column_name='areaId'`);
    console.log('Task.areaId exists', res1);
    const res2 = await db.$queryRawUnsafe(`select count(*) as count from information_schema.columns where table_schema=current_schema() and table_name='WeeklyFocus' and column_name='mainScopeType'`);
    console.log('WeeklyFocus.mainScopeType exists', res2);
    const res3 = await db.$queryRawUnsafe(`select count(*) as count from "Task" where "areaId" is null`);
    console.log('tasks missing areaId', res3);
    const res4 = await db.$queryRawUnsafe(`select count(*) as count from "WeeklyFocus" where "mainScopeType" is null`);
    console.log('weeklyfocus missing mainScopeType', res4);
  } catch (err) {
    console.error(err);
  } finally {
    await db.$disconnect();
  }
})();

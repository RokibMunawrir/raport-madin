import { db } from "../index";
import { activityLogs } from "../schema";
import { count, desc, eq, and, sql, ilike, or } from "drizzle-orm";

interface GetLogsParams {
  page?: number;
  limit?: number;
  module?: string;
  search?: string;
}

export async function getAllActivityLogs({ 
  page = 1, 
  limit = 20, 
  module, 
  search 
}: GetLogsParams = {}) {
  const offset = (page - 1) * limit;

  let where = undefined;
  const conditions = [];

  if (module && module !== 'Semua') {
    conditions.push(eq(activityLogs.module, module));
  }

  if (search) {
    conditions.push(
      or(
        ilike(activityLogs.title, `%${search}%`),
        ilike(activityLogs.description, `%${search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    where = and(...conditions);
  }

  const logs = await db.select()
    .from(activityLogs)
    .where(where)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalResult] = await db.select({ value: count() })
    .from(activityLogs)
    .where(where);

  return {
    logs,
    total: totalResult.value,
    totalPages: Math.ceil(totalResult.value / limit),
    currentPage: page
  };
}

export async function getActivityLogStats() {
  const [total] = await db.select({ value: count() }).from(activityLogs);
  
  const [successCount] = await db.select({ value: count() })
    .from(activityLogs)
    .where(eq(activityLogs.type, 'success'));
    
  const [warningCount] = await db.select({ value: count() })
    .from(activityLogs)
    .where(eq(activityLogs.type, 'warning'));
    
  const [errorCount] = await db.select({ value: count() })
    .from(activityLogs)
    .where(eq(activityLogs.type, 'error'));

  return {
    total: total.value,
    success: successCount.value,
    warning: warningCount.value,
    error: errorCount.value
  };
}

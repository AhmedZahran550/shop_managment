import { getDataSource } from "@/lib/db";
import { Activity } from "@/entities/Activity";

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any = {}
) {
  try {
    const dataSource = await getDataSource();
    const activityRepo = dataSource.getRepository(Activity);

    const activity = activityRepo.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });

    await activityRepo.save(activity);
    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Silent fail to not disrupt main flow
    return null;
  }
}

import { AppDataSource } from "../app-data-source";

export const getDataSource = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

// Deprecated: kept for backward compatibility if needed, but should be removed eventually
export const query = async (text: string, params?: any[]) => {
  const dataSource = await getDataSource();
  return dataSource.query(text, params);
};

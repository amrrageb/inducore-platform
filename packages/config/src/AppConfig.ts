export interface SystemEnvironmentConfig {
  env: 'development' | 'staging' | 'production' | 'test';
  port: number;
  serviceName: string;
}

export class AppConfig {
  private static instance: AppConfig;
  private readonly config: SystemEnvironmentConfig;

  private constructor() {
    this.config = {
      env: (process.env.NODE_ENV as SystemEnvironmentConfig['env']) || 'development',
      port: Number(process.env.PORT) || 3000,
      serviceName: process.env.SERVICE_NAME || 'inducore-service',
    };
  }

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  public get<K extends keyof SystemEnvironmentConfig>(key: K): SystemEnvironmentConfig[K] {
    return this.config[key];
  }
}

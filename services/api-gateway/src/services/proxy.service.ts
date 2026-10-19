import { Application } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import {
  AUTH_LIMIT,
  DEFAULT_LIMIT,
  ProxyErrorResponse,
  ServiceConfig,
} from "../types/index.js";
import { logger } from "../config/logger.config.js";
import { serverConfig } from "../config/index.js";
import { rateLimitMiddleware } from "../middlewares/rate-limiter.middleware.js";

class ServiceProxy {
  private static readonly serviceConfigs: ServiceConfig[] = [
    {
      path: "/api/v1/users/",
      url: serverConfig.USER_MANAGEMENT_SERVICE_URL,
      pathRewrite: { "^/": "/api/v1/users/" },
      name: "user-management-service",
      timeout: 5000,
      rateLimit: AUTH_LIMIT,
    },
    {
      path: "/api/v1/wallets/",
      url: serverConfig.WALLET_SERVICE_URL,
      pathRewrite: { "^/": "/api/v1/wallets/" },
      name: "wallet-service",
    },
  ];

  private static createProxyOptions(service: ServiceConfig): Options {
    return {
      target: service.url,
      changeOrigin: true,
      pathRewrite: service.pathRewrite,
      timeout: service.timeout || serverConfig.DEFAULT_TIMEOUT,
      logger: logger,
      on: {
        error: ServiceProxy.handleProxyError,
        proxyReq: ServiceProxy.handleProxyRequest,
        proxyRes: ServiceProxy.handleProxyResponse,
      },
    };
  }

  private static handleProxyError(err: Error, req: any, res: any): void {
    logger.error(`Proxy error for ${req.path}:`, err);

    const errorResponse: ProxyErrorResponse = {
      message: "Service unavailable",
      status: 503,
      timestamp: new Date().toISOString(),
    };

    res
      .status(503)
      .setHeader("Content-Type", "application/json")
      .end(JSON.stringify(errorResponse));
  }

  private static handleProxyRequest(proxyReq: any, req: any): void {
    // logger.debug(`Proxying request to ${req.path}`);
  }

  private static handleProxyResponse(proxyRes: any, req: any): void {
    // logger.debug(`Received response for ${req.path}`);
  }

  public static setupProxy(app: Application): void {
    ServiceProxy.serviceConfigs.forEach((service) => {
      const proxyOptions = ServiceProxy.createProxyOptions(service);
      const { capacity, refillRate } = service.rateLimit ?? DEFAULT_LIMIT;

      app.use(
        service.path,
        rateLimitMiddleware(capacity, refillRate, service.name),
        createProxyMiddleware(proxyOptions),
      );
      logger.info(`Configured proxy for ${service.name} at ${service.path}`);
    });
  }
}

export const proxyServices = (app: Application): void => {
  ServiceProxy.setupProxy(app);
};

import { Eureka } from 'eureka-js-client';

export function registerWithEureka(port: number) {
  const eurekaHost = process.env.EUREKA_HOST || 'localhost';
  const eurekaPort = Number(process.env.EUREKA_PORT) || 8761;
  const hostName = process.env.HOSTNAME || 'notification-service';

  const client = new Eureka({
    instance: {
      app: 'notification-service',
      instanceId: `notification-service:${port}`,
      hostName: hostName,
      ipAddr: hostName,
      statusPageUrl: `http://${hostName}:${port}/actuator/info`,
      port: { '$': port, '@enabled': true },
      vipAddress: 'notification-service',
      dataCenterInfo: { '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo', name: 'MyOwn' }
    },
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 10
    }
  });
  client.start((error: any) => {
    if (error) {
      console.error('Eureka registration failed', error);
    } else {
      console.log('Registered with Eureka');
    }
  });
}

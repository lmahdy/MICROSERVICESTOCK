import { Eureka } from 'eureka-js-client';

export function registerWithEureka(port: number) {
  const client = new Eureka({
    instance: {
      app: 'notification-service',
      instanceId: `notification-service:${port}`,
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      statusPageUrl: `http://localhost:${port}/actuator/info`,
      port: { '$': port, '@enabled': true },
      vipAddress: 'notification-service',
      dataCenterInfo: { '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo', name: 'MyOwn' }
    },
    eureka: {
      host: 'localhost',
      port: 8761,
      servicePath: '/eureka/apps/',
      maxRetries: 5
    }
  });
  client.start((error) => {
    if (error) {
      console.error('Eureka registration failed', error);
    } else {
      console.log('Registered with Eureka');
    }
  });
}

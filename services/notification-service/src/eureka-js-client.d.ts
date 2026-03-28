declare module 'eureka-js-client' {
  export class Eureka {
    constructor(config: any);
    start(callback?: (error: any) => void): void;
    stop(callback?: () => void): void;
  }
}

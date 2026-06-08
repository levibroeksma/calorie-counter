import "alpinejs";

declare module "alpinejs" {
  namespace Alpine {
    interface Stores {
      config: import("@lib/domain/types.js").EnvironmentConfig & {
        app: import("@lib/domain/types.js").AppConfig;
      };
      app: import("@lib/domain/types.js").AppConfig;
      appStore: import("@lib/domain/types.js").AppStore;
      modalStore: import("@lib/domain/types.js").ModalStore;
    }
  }
}

export {};

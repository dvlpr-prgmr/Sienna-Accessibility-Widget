// types/global.d.ts

declare global {
  interface Window {
    __asw__onScrollReadableGuide?: (event: Event) => void;
    NextBilityPlugin?: ReturnType<typeof import("../src/nextBility").default>;
  }
}

export {};

// lib/asyncStorageShim.ts
type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
};

const AsyncStorageShim: AsyncStorageLike = {
  async getItem() {
    return null;
  },
  async setItem() {},
  async removeItem() {},
  async clear() {},
  async getAllKeys() {
    return [];
  },
};

export default AsyncStorageShim;

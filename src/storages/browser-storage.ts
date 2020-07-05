export enum StorageKey {
  SETTING = 'addon.setting',
}

export interface SettingObject extends browser.storage.StorageObject {
  active: boolean
}

export interface AddonStorageObject {
  [StorageKey.SETTING]: SettingObject
}

export const DefaultStorageObject: AddonStorageObject = {
  [StorageKey.SETTING]: {
    active: true,
  },
}

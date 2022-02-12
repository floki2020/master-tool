/*
 * @Author: your name
 * @Date: 2022-02-04 14:25:03
 * @LastEditTime: 2022-02-10 20:58:45
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /antd-demo-ts/src/db.ts
 */
import Dexie, { Table } from 'dexie';
import { MasterItem } from './App';

export class MyMasterDexie extends Dexie {
  masters!: Table<MasterItem>; 

  constructor() {
    super('master_tool');
    this.version(1).stores({
      masters: '++id,newShop,oldShop,contact' 
    });
  }
}

export const db = new MyMasterDexie();

/*
 * @Author: your name
 * @Date: 2022-02-04 08:11:20
 * @LastEditTime: 2022-02-12 07:48:43
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /antd-demo-ts/src/App.tsx
 */
import React, { useRef, useState } from 'react';
import './App.css';
import * as XLSX from "xlsx"
import ProCard from '@ant-design/pro-card';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import {  Button, message, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { db } from './db';
import copy from 'copy-to-clipboard';

const { Dragger } = Upload;


export type MasterItem = {
  id?: number;
  sheetName:string;
  region: string;
  po: string;
  companyName: string;
  newShop: number;
  oldShop:number;
  shopName: string;
  contact: string;
  billingOmega: number;
  billingAddress: number;
  customer: number;
  addressRef: number;
  customerRef: number;
};

const columns: ProColumns<MasterItem>[] = [
  {
    title: "sheet-name",
    dataIndex: 'sheetName',
    width: 200,
    hideInForm: true,
    hideInSearch: true,
    fixed: 'left',
  },
  {
    title: 'PO#',
    dataIndex: 'po',
    ellipsis: true,
    width: 100,
    copyable: true,
    hideInSearch: true
  },
  {
    title: 'Company Name',
    dataIndex: 'companyName',
    hideInSearch: true,
    width: 150,
    ellipsis: true,
  },
  {
    title: '新店舗コード',
    width: 100,
    dataIndex: 'newShop',
    copyable:true,
    fieldProps:{
      placeholder:'please input shop number',
    }
  },
  {
    title: 'Old コード',
    width: 100,
    dataIndex: 'oldShop',
    hideInSearch:true,
  },
  {
    title: 'Shop (First Name)',
    dataIndex: 'shopName',
    width: 180,
    hideInSearch: true,
  },
  {
    title: 'Contact',
    width: 100,
    dataIndex: 'contact',
    fieldProps:{
      placeholder:'please input contact'
    }
  },
  {
    title: "地域",
    dataIndex: 'region',
    width: 100,
    hideInForm: true,
    fieldProps:{
      placeholder:'please input region'
    }
  },
  {
    title: 'Customer#',
    dataIndex: 'customer',
    width: 120,
    hideInSearch: true

  },
  {
    title: 'addess reference',
    dataIndex: 'addressRef',
    width: 180,
    hideInSearch: true

  },
  {
    title: 'CustomerReference',
    dataIndex: 'customerRef',
    width: 180,
    hideInSearch: true

  },
  {
    title: 'Action',
    valueType: 'option',
    width: 100,
    fixed: 'right',
    render: (text, record, _, action) => [
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a key="editable" onClick={() => { copy(`${record.customer} ${record.addressRef} ${record.customerRef}`) }} href="#">
        copy
      </a>
    ],
  },
];


function App() {
  const [tab, setTab] = useState('tab1');
  const actionRef = useRef<ActionType>();

  function importExcelFromBuffer<Item = any>(excelRcFileBuffer: ArrayBuffer): Item[] {
    // 读取表格对象
    const workbook = XLSX.read(excelRcFileBuffer, { type: 'buffer' });
    const sheetNames = workbook.Sheets;
    delete sheetNames['店舗CD']
    console.log('sheetNames', sheetNames);
    console.time('Generate')
    let data: any[] = []
    for (let sheet in workbook.Sheets) {
      if (workbook.Sheets.hasOwnProperty(sheet)) {
        const xlsData=XLSX.utils.sheet_to_json(workbook.Sheets[sheet]) as any[]
        const temp = xlsData.map(item => {
          const obj: MasterItem = {
            sheetName:sheet,
            region: item['地域'] ?? '-',
            po: item['PO#'] ?? '-',
            companyName: item['Company Name'] ?? '-',
            newShop: item['新店舗コード'] ?? '-',
            oldShop:item['Branch（店舗コード）'] ?? '-',
            shopName: item['Shop (First Name)'] ?? '-',
            contact: item['Contact'] ?? '-',
            billingOmega: item['billing Omega#'] ?? '-',
            billingAddress: item['billing Address#'] ?? '-',
            customer: item['Customer#'] ?? '-',
            addressRef: item['addess reference'] ?? '-',
            customerRef: item['CustomerReference'] ?? '-'
          }
  
          return obj
        })
        data = data.concat(temp);
      }
    }
    console.timeEnd('Generate')
    return data
  }

  const localExcelToData = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      // xlsx 导入 excel
      console.time('data')
      const excelData = importExcelFromBuffer<any>(await (file as RcFile).arrayBuffer());
      console.timeEnd('data')
      // 设置 data

      message.loading({ content: 'Clearing...',key:'clear'})
      await db.masters.clear().then(()=>{
        message.success({ content: '(^_^)Clearn Done!', key:'clear'});
      })
      message.success({ content: 'Insert Data wait for a few seconds..', key:'load'});
      await db.masters.bulkAdd(excelData).then(()=>{
        message.success({ content: 'Insert Success', key:'load'});
      }).catch(err=>{
        console.log('file err',err)
      })

      console.log('temp', excelData);
      if (onSuccess) onSuccess(excelData, new XMLHttpRequest());
    } catch (e) {
      if (onError) onError(e)
    }
  }

  /**
   *  过滤 店铺 和联系人
   * @param newShop 
   * @param contact 
   * @returns 
   */
  const searchMaster = async (params:any) => { 
    console.log('params');
      
    if(Object.keys(params).length===0){
      return
    }
    const {newShop,contact,region}=params
    const length=newShop.length
    const parms=length===6?{newShop:Number(newShop)}:{oldShop:Number(newShop)}
    console.log('length',parms);
    
    if(newShop&&contact){
      const res=  await db.masters.where({...parms}).filter((item) => {
        return (String(item.contact).includes(contact))
      }).toArray()
      return res
    }
    if(newShop&&!contact){
      const res=  await db.masters.where({...parms}).toArray()
      return res
    }
    if(region&&!newShop&&!contact){
      const res=  await db.masters.where({sheetName:'oldlist'}).filter(item=>{
        return item.region.includes(region)
      }).toArray()
      return res
    }
    return []
  }
  const props = {
    name: 'file',
    multiple: false,
    maxCount:1,
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    customRequest(e: any) {
      localExcelToData(e)
      // readWorkbookFromLocalFile(e,()=>{})
    }
  };

  const load=()=>{
    console.log('hhhhhh')
  }
  return (
    <div className='background'>
      <div className='bg'>
        <ProCard
          tabs={{
            tabPosition: "left",
            activeKey: tab,
            onChange: (key) => {
              setTab(key);
            },
          }}
        >
          <ProCard.TabPane key="tab1" tab="Search">
            <ProTable<MasterItem>
              columns={columns}
              actionRef={actionRef}
              request={async (params = {}) => {
                const res = await searchMaster(params)
                const obj = {
                  data: res||[],
                  success: true,
                  total: res?.length||0,
                }
                console.log('obj',obj);
                
                return obj
              }}
              // onSubmit={searchMaster}
              editable={{
                type: 'multiple',
              }}
              rowKey="id"
              search={{
                labelWidth: 'auto',
                resetText:'Reset',
                searchText:'Search'
              }}
              dateFormatter="string"
              scroll={{ x: 1200,y:500 }}
              pagination={false}
              rowClassName={(record)=>(record.sheetName==='oldlist'?'old':'')}
            />
          </ProCard.TabPane>
          <ProCard.TabPane key="tab2" tab="Setting">
          <Upload onChange={load}>
          <Button>Click to Upload</Button>
          </Upload>
          {/* <input type={'file'}>upload</input> */}
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag xlsx file to this area to upload</p>
              <p className="ant-upload-hint">
                Upload new files then clear the before files and data.
              </p>
            </Dragger>
          </ProCard.TabPane>
        </ProCard>
      </div>

    </div>
  );
}

export default App;

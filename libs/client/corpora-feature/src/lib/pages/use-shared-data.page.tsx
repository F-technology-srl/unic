import { Tabs } from '@unic/core-ui';
import { useState } from 'react';
import { UploadedCorporaTable, DownloadedCorporaTable } from '../components';

export const UseSharedDataPage = () => {
  const [activeTab, setActiveTab] = useState('0');

  return (
    <div className="mx-auto max-w-[1000px] flex my-5 md:my-14 bg-white p-10 shadow-sm rounded-md border-1 border-slate-50">
      <div className="w-full">
        <h1 className="leading-none text-4xl font-semibold mb-4">
          Use shared data
        </h1>
        <Tabs
          tabs={[
            {
              key: '0',
              label: 'Uploads',
              onClick: () => setActiveTab('0'),
              active: activeTab === '0',
            },
            {
              key: '1',
              label: 'Downloads',
              onClick: () => setActiveTab('2'),
              active: activeTab === '2',
            },
          ]}
          customControl={{
            onTabChange: (index) => setActiveTab(index),
            activeTab: activeTab,
          }}
        ></Tabs>
        <div className="mt-9">
          {activeTab === '0' && <UploadedCorporaTable></UploadedCorporaTable>}
          {activeTab === '1' && (
            <DownloadedCorporaTable></DownloadedCorporaTable>
          )}
        </div>
      </div>
    </div>
  );
};

export default UseSharedDataPage;

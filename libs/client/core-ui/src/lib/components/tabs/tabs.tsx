import { useState } from 'react';

export interface TabProps {
  key: string;
  label: string | JSX.Element;
  onClick?: () => void;
  active?: boolean;
  disableRestore?: boolean;
}

export interface TabsProps {
  tabs: Array<TabProps>;
  customControl?: {
    onTabChange?: (index: string) => void;
    activeTab?: string;
  };
  className?: string;
}

export const Tab = (props: TabProps) => {
  return (
    <span
      className={`text-sm font-medium border-b p-4 p-b-14 hover:text-blue-600 cursor-pointer mb-[-1px]  ${
        props.active
          ? 'text-blue-800 border-blue-800'
          : 'text-gray-500 border-gray-500'
      }`}
      onClick={() => props.onClick?.()}
    >
      {props.label}
    </span>
  );
};

export const Tabs = (props: TabsProps) => {
  const isControlled = props.customControl !== undefined;
  const [activeTab, setActiveTab] = useState('');

  const currentActiveTab = isControlled
    ? props.customControl?.activeTab
    : activeTab;

  const onTabChange = isControlled
    ? props.customControl?.onTabChange
    : setActiveTab;

  return (
    <div
      className={`pr-4 pb-4 flex bg-white overflow-x-auto overflow-y-hidden ${props.className || ''}`}
    >
      <div className="flex flex-row gap-8 border-b border-gray-500">
        {props.tabs.map((item) => (
          <Tab
            label={item.label}
            active={currentActiveTab === item.key}
            key={item.key}
            onClick={() => onTabChange?.(item.key)}
            disableRestore={item.disableRestore}
          />
        ))}
      </div>
    </div>
  );
};

export default Tabs;

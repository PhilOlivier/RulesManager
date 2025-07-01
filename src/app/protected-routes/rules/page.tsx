'use client';

import dynamic from 'next/dynamic';

const RulesManager = dynamic(
  () => import('@/components/rules/RulesManager'),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Rules Manager...</p>
      </div>
    ),
  },
);

const RulesPage = () => {
  return <RulesManager />;
};

export default RulesPage; 
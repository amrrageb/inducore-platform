import React from 'react';
import { Button, Card } from '@inducore/ui-kit';

export const WebPortalApp: React.FC = () => {
  return (
    <Card title="InduCore Web Portal Skeleton">
      <p>Platform web application workspace component.</p>
      <Button label="Execute" onClick={() => console.log('Web portal action')} />
    </Card>
  );
};

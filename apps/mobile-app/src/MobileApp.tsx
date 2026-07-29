import React from 'react';
import { Card, Button } from '@inducore/ui-kit';

export const MobileApp: React.FC = () => {
  return (
    <Card title="InduCore Mobile App Skeleton">
      <p>Platform mobile application component interface.</p>
      <Button label="Mobile Action" onClick={() => console.log('Mobile app action')} />
    </Card>
  );
};

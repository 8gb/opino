import React, { useState, useEffect } from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const AdminSettings = () => {
  const [envProvider, setEnvProvider] = useState('unknown');

  useEffect(() => {
    setEnvProvider('supabase');
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Admin Settings</Title>
      
      <Card title="Authentication Provider" style={{ marginBottom: '24px' }}>
        <Paragraph>
          Current Environment Default: <strong>{envProvider}</strong>
        </Paragraph>
        <Paragraph>
            The system is currently running on Supabase.
        </Paragraph>
      </Card>

      <Card title="Monitoring" style={{ marginBottom: '24px' }}>
        <Paragraph>
          Check browser console for monitoring logs.
        </Paragraph>
      </Card>
    </div>
  );
};

export default AdminSettings;

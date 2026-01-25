import React, { useState, useEffect } from 'react';
import authService from '../services/auth';
import { Row, Col, Divider, Card, Badge, Input, message, Button } from "antd";
import { useRouter, useSearchParams } from 'next/navigation';

const ChangePW = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReset = searchParams.get('reset') === 'true';
  const [email, setEmail] = useState('');
  const [currentpw, setCurrentpw] = useState('');
  const [newpw, setNewpw] = useState('');
  const [confirmpw, setConfirmpw] = useState('');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const changeIt = async () => {
    setDisabled(true);
    try {
      // Note: Supabase doesn't strictly require re-auth for password update if session is valid,
      // but for strict security we might want to re-login. 
      // For now, we assume the session is valid and use updatePassword directly.
      
      // Ideally verify current password first:
      // await authService.login(email, currentpw); 
      // But we are already logged in. Re-login updates session.
      
      if (!isReset) {
        await authService.login(email, currentpw); // Verify current password
      }
      
      await authService.updatePassword(newpw);
      message.info('Your password successfully updated!');
      router.push('/settings');
    } catch (error) {
       message.error(error.message || 'Failed to update password');
       setDisabled(false);
    }
  }

  const lol = () => {
    if (!isReset) {
      if (!currentpw) {
        message.error('enter current password.');
        return;
      }

      if (currentpw.length < 6) {
        message.error('Please enter current password. Minimum 6 characters.');
        return;
      }
    }

    if (newpw !== confirmpw) {
      message.error('Your new password does not match your confirm password.');
      return;
    }

    if (newpw.length < 6) {
      message.error('New password must be at least 6 characters.');
      return;
    }

    if (!isReset && newpw === currentpw) {
      message.error('You are using the same password as your current password.');
      return;
    }

    changeIt();
  }

  return (
    <div>
      <h1>Account <Badge count={email} style={{ backgroundColor: '#52c41a' }} /></h1>

      <div className="flex flex-initial">
        <div className='mr-4'>
          <Card>
            {!isReset && (
            <div className='pw'>
              <Input.Password
                size="large"
                placeholder="Current Password"
                onInput={evt => setCurrentpw(evt.target.value)}
                value={currentpw}
              />
            </div>
            )}
            <div className='pw'>
              <Input.Password
                size="large"
                placeholder="New Password"
                onInput={evt => setNewpw(evt.target.value)}
                value={newpw}
              />
            </div>
            <div className='pw'>
              <Input.Password
                size="large"
                placeholder="Confirm New Password"
                onInput={evt => setConfirmpw(evt.target.value)}
                value={confirmpw}
              />
            </div>
            <br></br>
            <Button type="primary" size="large" onClick={lol} disabled={disabled}>Change Password</Button>
          </Card>
        </div>
        <div className='mr-4'>
          <Card className=''>
            <div className='pw'>
              <Input.Password
                size="large"
                placeholder="Current Password"
                value=''
              />
            </div>
            <br></br>
            <Button type="primary" size="large" onClick={lol} disabled={true}>Delete account</Button>
            <br></br>
            (Coming soon)
          </Card>
        </div>
      </div>

    </div>
  );
}

export default ChangePW;

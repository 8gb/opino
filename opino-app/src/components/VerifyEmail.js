'use client';
import React, { useContext } from 'react';
import { Card, Button, Result, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { UserContext } from "../UserProvider";
import authService from '../services/auth';

export default function VerifyEmail() {
    const user = useContext(UserContext);

    const resend = async () => {
        try {
            await authService.resendVerificationEmail(user.email);
            message.success('Verification email sent!');
        } catch (error) {
            message.error(error.message);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="shadow-md w-full max-w-lg">
                <Result
                    icon={<MailOutlined />}
                    title="Please Verify Your Email"
                    subTitle={
                        <div className="text-gray-600">
                            We have sent a verification email to <span className="font-semibold text-gray-800">{user.email}</span>.
                            <br />
                            Please check your inbox and follow the instructions to activate your account.
                        </div>
                    }
                    extra={[
                        <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
                            I've Verified
                        </Button>,
                        <Button key="resend" onClick={resend}>
                            Resend Email
                        </Button>,
                    ]}
                />
            </Card>
        </div>
    )
}

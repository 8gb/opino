'use client';
import React, { useState, useContext, Suspense } from 'react';
import { Card, Tabs, Form, Input, Button, message, Avatar, Descriptions, Alert, Tag } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { UserContext } from '@/UserProvider';
import authService from '@/services/auth';
import AuthGuard from '@/components/AuthGuard';
import { useSearchParams } from 'next/navigation';

function AccountContent() {
    const user = useContext(UserContext);
    const searchParams = useSearchParams();
    const isReset = searchParams.get('reset') === 'true';
    
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(isReset ? '2' : '1');

    const handleChangePassword = async (values) => {
        const { currentPassword, newPassword, confirmPassword } = values;

        if (newPassword !== confirmPassword) {
            message.error('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Only require current password if NOT in reset mode (though usually good practice)
            // But if user forgot password and is logged in via magic link, they might not know current password.
            // Supabase "password recovery" flow logs them in.
            // If they are logged in via recovery link, they can update password without current password?
            // It depends on Supabase config. Usually updatePassword works.
            
            if (!isReset) {
                 await authService.login(user.email, currentPassword);
            }
            
            // Update password
            await authService.updatePassword(newPassword);
            
            message.success('Password updated successfully');
            form.resetFields();
        } catch (error) {
            message.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user === 'loading') return null;

    const items = [
        {
            key: '1',
            label: <span><UserOutlined />Profile Info</span>,
            children: (
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                    <Descriptions.Item label="User ID">
                        <span className="font-mono text-xs">{user.uid}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Created">
                        {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Sign In">
                        {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
        {
            key: '2',
            label: <span><LockOutlined />Change Password</span>,
            children: (
                <>
                    <Alert 
                        title={isReset ? "Set New Password" : "Security Note"} 
                        description={isReset ? "Please set a new password for your account." : "To change your password, you must enter your current password first."}
                        type="info" 
                        showIcon 
                        className="mb-6"
                    />
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        {!isReset && (
                            <Form.Item
                                name="currentPassword"
                                label="Current Password"
                                rules={[{ required: true, message: 'Please enter current password' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} />
                            </Form.Item>
                        )}
                        
                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter new password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password prefix={<SafetyOutlined />} />
                        </Form.Item>
                        
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<SafetyOutlined />} />
                        </Form.Item>
                        
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Update Password
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            ),
        },
    ];

    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="text-center shadow-sm">
                        <Avatar size={100} icon={<UserOutlined />} className="mb-4 bg-blue-500" />
                        <h3 className="text-xl font-semibold">{user.email}</h3>
                        <p className="text-gray-500">User</p>
                        <div className="mt-4">
                            <Tag color="green">Active</Tag>
                        </div>
                    </Card>
                </div>
                
                <div className="md:col-span-2">
                    <Card className="shadow-sm" title="Profile & Security">
                        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function AccountPage() {
    return (
        <AuthGuard>
            <Suspense fallback={<div className="flex justify-center p-8">Loading settings...</div>}>
                <AccountContent />
            </Suspense>
        </AuthGuard>
    );
}

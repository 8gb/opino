import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Tabs, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import authService, { currentProvider } from '../services/auth';
import { Turnstile } from '@marsidev/react-turnstile';

const Login = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const [captchaToken, setCaptchaToken] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (activeTab === 'login') {
                await authService.login(values.email, values.password, captchaToken);
                message.success('Welcome back!');
                router.push('/dashboard');
            } else if (activeTab === 'register') {
                await authService.register(values.email, values.password, captchaToken);
                message.success('Account created! Please check your email.');
            } else if (activeTab === 'forgot') {
                await authService.resetPassword(values.email, {
                    redirectTo: window.location.origin + '/account?reset=true',
                    captchaToken
                });
                message.success('Password reset email sent!');
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const items = [
        {
            key: 'login',
            label: 'Sign In',
            children: (
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    
                    {currentProvider === 'supabase' && (
                        <div className="mb-4 flex justify-center">
                            <Turnstile 
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                                onSuccess={setCaptchaToken} 
                            />
                        </div>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Sign In
                        </Button>
                    </Form.Item>
                    <div className="text-center">
                        <a onClick={() => setActiveTab('forgot')} className="text-blue-500 cursor-pointer">Forgot password?</a>
                    </div>
                </Form>
            ),
        },
        {
            key: 'register',
            label: 'Register',
            children: (
                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                        <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }, { min: 6, message: 'Min 6 characters' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    
                        {currentProvider === 'supabase' && (
                        <div className="mb-4 flex justify-center">
                            <Turnstile 
                                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                                onSuccess={setCaptchaToken} 
                            />
                        </div>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Create Account
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'forgot',
            label: 'Reset',
            children: (
                <>
                    <Alert description="Enter your email to receive a password reset link." type="info" className="mb-4" />
                        <Form
                        name="forgot"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: 'Please input your Email!' }]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>
                        
                            {currentProvider === 'supabase' && (
                            <div className="mb-4 flex justify-center">
                                <Turnstile 
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                                    onSuccess={setCaptchaToken} 
                                />
                            </div>
                        )}

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                                Send Reset Link
                            </Button>
                        </Form.Item>
                        <div className="text-center">
                            <a onClick={() => setActiveTab('login')} className="text-blue-500 cursor-pointer">Back to Sign In</a>
                        </div>
                    </Form>
                </>
            ),
        },
    ];

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <Card className="w-full max-w-md shadow-lg" variant="borderless">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 tracking-wider mb-2">opino</h1>
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab} centered items={items} />
                
                <div className="text-center mt-6">
                    <a href="https://opino.ongclement.com" className="text-gray-400 hover:text-gray-600 text-sm">
                        &larr; Back to Main Site
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default Login;

'use client';
import React, { useContext } from "react";
import { UserContext } from "../UserProvider";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Breadcrumb, Card, message, Layout, Button, Divider } from 'antd';
import authService from '../services/auth';
import "../App.css"; // Ensure styles are loaded

const ButtonGroup = Button.Group;

const breadcrumbNameMap = {
  '/admin': 'Admin',
  '/admin/settings': 'Admin Settings',
  '/account': 'Account',
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
  '/': 'Home'
};

const Bread = () => {
  const pathname = usePathname();
  const pathSnippets = pathname.split('/').filter(i => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    var url = `/${pathSnippets.slice(0, index + 1).join('/')}`;

    if (url.includes('/site/'))
      return (
        <Breadcrumb.Item key={url}>
          <Link href={url}>
            {_}
          </Link>
        </Breadcrumb.Item>
      )

    if (url === '/site')
      return null

    return (
      <Breadcrumb.Item key={url}>
        <Link href={url}>
          {breadcrumbNameMap[url] || url}
        </Link>
      </Breadcrumb.Item>
    );
  });

  const breadcrumbItems = [(
    <Breadcrumb.Item key="home">
      <Link href="/">Home</Link>
    </Breadcrumb.Item>
  )].concat(extraBreadcrumbItems);
  return (
    <Breadcrumb>
      {breadcrumbItems}
    </Breadcrumb>

  );
};

const AuthButton = () => {
  const router = useRouter();
  const user = useContext(UserContext);

  if (user === 'loading')
    return (
      <div></div>
    )

  return (
    user && (
      <div>
        <Card className='margin-low'>
          <a className='properp' href='https://opino.ongclement.com'>
            opino.ongclement.com
            </a>
          <Divider type="vertical" />
          <Button size="large" onClick={e => {
            e.preventDefault()
            authService.logout().then(function () {
              // router.push('/');
            }).catch(function (error) {
              message.error('signout error')
            })
          }}>Sign out
        </Button>
          <ButtonGroup size='large' className="np" >
            <Button type='primary' size='large' ghost><Link href='/account'>
              Account
          </Link></Button>
            <Button type='primary' >
              <Link href='/settings'>
                Settings
          </Link>
            </Button>
          </ButtonGroup>
        </Card>
        <Card className='crumbb'>
          <Bread />
        </Card>
      </div>
    )
  )
}

export default function MainLayout({ children }) {
  return (
      <div className="App">
        <Layout className="App">
          <div className="oh">
            <AuthButton className="nq" />
          </div>
          {children}
        </Layout>
      </div>
  )
}

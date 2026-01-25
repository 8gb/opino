import React, { useState, useEffect } from 'react';
import authService from '../services/auth';
import supabase from '../services/supabase/client';
import {
  Input,
  message,
  List,
  Card,
  Button,
  Divider
} from "antd";
import Link from 'next/link';

const Dashboard = () => {
  const [uid, setUid] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
        console.log(user.uid);
        
        supabase
          .from('sites')
          .select('*')
          .eq('uid', user.uid)
          .then(({ data: sites, error }) => {
            if (error) {
              message.error(error.message);
              return;
            }
            
            let formattedData = sites.map((site, index) => ({
              ...site,
              key: index
            }));
            
            console.log(formattedData);
            setData(formattedData);
          });
      }
    });
    return () => unsubscribe();
  }, []);

  const addSite = async () => {
    let site = {};
    site.domain = '';
    site.uid = uid;
    site.id = crypto.randomUUID(); // Generate ID for Supabase

    const { error } = await supabase.from('sites').insert([site]);

    if (error) {
      message.error(error.message);
    } else {
      message.info("done add.");
      // Optimistically add to list or re-fetch
      setData([...data, { ...site, key: data.length }]);
    }
  }

  const editDomain = (key, e) => {
    let newData = [...data];
    newData[key].domain = e.target.value;
    setData(newData);
  }

  const saveDomain = async (key) => {
    let newData = [...data];
    console.log(newData[key]);
    
    const { error } = await supabase
      .from('sites')
      .update({ domain: newData[key].domain })
      .eq('id', newData[key].id);

    if (error) {
      message.error(error.message);
    } else {
      message.info("save!");
    }
  }

  return (
    <div>
      <h1 className="block">Sites</h1>

      <Button className="gutter-box" type="primary" size="large" onClick={addSite}>add site</Button><br />
      <List
        className="dash"
        grid={{ gutter: 4, column: 3 }}
        dataSource={data}
        renderItem={item => (
          <List.Item>
            <Card>
              <Button type="primary" ><Link href={'/site/' + item.id}>Manage comments</Link></Button><br />
              <Divider />
              SITE_ID: <Input
                className="inputforma"
                value={item.id}
                type="text"
                placeholder="SITE_ID"
              />
              <br />
              Domain: <Input
                className="inputforma"
                value={item.domain}
                onChange={e => editDomain(item.key, e)}
                type="text"
                placeholder="domain origin"
              />
              <Button type="primary" onClick={e => saveDomain(item.key)}>save</Button><br />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Dashboard;

import React, {
  useState,
  useEffect,
  useContext
} from 'react';
import { UserContext } from "../UserProvider";
import { useParams } from 'next/navigation';

import "../App.css";
import authService from '../services/auth';
import supabase from '../services/supabase/client';

import {
  message,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Table
} from "antd"

import {
  SearchOutlined,
} from '@ant-design/icons';

const success = (x) => {
  message.success(x);
};

const error = () => {
  message.error('This is a message of error');
};

const load = (x) => {
  message.loading(x);
};

const Option2 = Select.Option;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};


const Comment = (props) => {
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    pullFromDB()

    authService.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email)
      }
    });
  }, [id]);

  const user = useContext(UserContext);

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  const [email, setEmail] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [columns, setColumns] = useState([]);

  const selector = (key, value) => {
    // data[key].isSold = value;
    setTempStatus(value)
  }

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    var tempB = data[record.key].isSold
    console.log('ff')
    form.setFieldsValue({
      filename: '',
      startdate: '',
      ...record,
    });
    setEditingKey(record.key);
    setTempStatus(tempB)

  };

  const cancel = () => {
    setEditingKey('');
    // this.state.show = false

  };

  const save = async (key) => {
    if (!navigator.onLine)
      return

    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });

        try {

          if (!/^-?\d*[.,]?\d{0,2}$/.test(newData[index].price)) {
            message.error('Numbers only. Decimal point is allowed.')
            return
          }
          load('Updating..', 0)
          newData[index].isSold = tempStatus

          // await db
          //   .collection("units")
          //   .doc(data[index].id).update({
          //     unitno: newData[index].unitno,
          //     price: newData[index].price,
          //     customer: newData[index].customer,
          //     isSold: newData[index].isSold
          //   })
          
          message.info("Save functionality disabled in migration.");

          success(
            'Successfully updated [Unit No: '
            + newData[index].unitno
            + '] [Price: '
            + newData[index].price
            + '] [Customer: '
            + newData[index].customer
            + '] [Status: '
            + newData[index].isSold
            + ']'
          )
          setData(newData)
          setEditingKey('');

        } catch (error) {
          message.error(error.message);
        }

      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { this.searchInput = node; }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm)}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
          </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
          </Button>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      text
    ),
  })

  const pullFromDB = async () => {
    var baba;
    let newa = [...acc]
    
    // Safety check for user
    if (!user || user === 'loading') return;

    try {
      let query = supabase.from('comments').select('*');

      let uidToQuery = user.uid;
      
      query = query.eq('uid', uidToQuery);

      if (id) {
        baba = id
        query = query.eq('sitename', baba);
      } else {
        newa.unshift({
          title: 'Site Name',
          dataIndex: 'sitename',
          ...getColumnSearchProps('sitename'),
          editable: false,
          sorter: (a, b) => { return a.sitename.localeCompare(b.sitename) },
        })
      }

      const { data: snapshot, error } = await query;
      
      if (error) throw error;

      let data = [];
      if (!snapshot || snapshot.length === 0) {
        message.warning('No comments found for this site.');
      } else {
        data = snapshot.map((doc, i) => ({
          ...doc,
          key: i
        }));

        // Sort our data based on time added
        data.sort(function (a, b) {
          return (
            b.timestamp - a.timestamp
          );
        });
      }

      // Anytime the state of our database changes, we update state
      setData(data)
      setColumns(newa)

    } catch (error) {
      console.log(JSON.stringify(error))
      message.error(error.message)
    }
  }

  const handleSearch = (selectedKeys, confirm) => {
    confirm();
  }


  const handleReset = (clearFilters) => {
    clearFilters();
  }


  const exportFile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      error('This feature is only on PC.')
    } else {
      let major = [];
      var i;
      for (i = 0; i < data.length; i++) {
        var lol = [
          data[i].id
        ];
        major.push(lol)
      }

      // console.log(major)
      // alert("the string: " + major.toString())
      success('Downloading ' + major.length + " records...")
      if (major.length > 1)
        downloadcsv();
    }
  }

  const downloadcsv = (e) => {
    // console.log("heyy2 " + major);   
    var csv = `doc_id,\n`
    major.forEach(function (row) {
      csv += row.join(',');
      csv += "\n";
    });

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = props.match.params.name + '.csv';
    hiddenElement.click();
  }

  const acc = [
    // {
    //   title: 'PK',
    //   dataIndex: 'key',
    //   width: '5%',
    //   editable: false,
    // },
    {
      title: 'Message',
      dataIndex: 'message',
      ...getColumnSearchProps('message'),
      editable: false,
      sorter: (a, b) => { return a.message.localeCompare(b.message) },
    },
    {
      title: 'Author',
      dataIndex: 'author',
      ...getColumnSearchProps('author'),
      editable: false,
      sorter: (a, b) => { return a.author.localeCompare(b.author) },
    },
    {
      title: 'Path Name',
      dataIndex: 'pathname',
      ...getColumnSearchProps('pathname'),
      editable: false,
      sorter: (a, b) => { return a.pathname.localeCompare(b.pathname) },
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      editable: false,
      sorter: (a, b) => parseInt(a.timestamp, 10) - parseInt(b.timestamp, 10),
      render: (text, record) => {
        return (new Date(text).toLocaleString())
      }
    },
    {
      title: '',
      width: '10%',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return (<div />)
        // return editable ? (
        //   <span>
        //     <Button
        //       href=""
        //       onClick={e => {
        //         e.preventDefault()
        //         save(record.key)
        //       }}
        //       style={{
        //         marginRight: 8,
        //       }}
        //     >
        //       Save
        //   </Button>
        //     <Button type="primary" onClick={() => cancel(record.key)}>Cancel</Button>
        //   </span>
        // ) : (
        //   <div>
        //     <Button disabled={editingKey !== ''} onClick={() => edit(record)}>
        //       Edit
        // </Button>
        //   </div>
        // );
      },
    },
  ];


  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'price' ? 'text' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      {id ?
        <h1 className="block">Comments for {id}</h1>
        :
        <h1 className="block">Comments</h1>
      }

      <div className="csvbtn" >
        {/* <Button onClick={exportFile}>Export to CSV</Button> */}
      </div>
      {process.env.NODE_ENV !== 'production' ? <Button onClick={() => pullFromDB()}>Add</Button> : <div />}

      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}

          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            pageSize: 50
          }}
        />
      </Form>
    </div>
  );
};

export default Comment;

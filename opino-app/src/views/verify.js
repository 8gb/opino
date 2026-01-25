import React, {
    useState,
    useEffect,
    useContext
} from 'react';
import { UserContext } from "../UserProvider";

import {
    message,
    Form,
    Input,
    Popconfirm,
    DatePicker,
    InputNumber,
    Divider,
    Button,
    Table
} from "antd"

const Verify = () => {
    useEffect(() => {
    }, []);

    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [editingKey, setEditingKey] = useState('');
    const [pendingData, setPendingData] = useState({ disabled: true, inputDisabled: false });
    const [disabled, setDisabled] = useState(true);
    const [range, setRange] = useState([]);
    const user = useContext(UserContext);


    return (
      
        <div className="loginform">
            Please check your email <underline>{user.email}</underline> for verification.
        </div>
    );
};

export default Verify;



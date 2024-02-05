import React, { useState } from 'react';

import './Register.css';

const Register = () => {
    //注册部分
    const [username, setUsername] = useState('');
    const [mail, setMail] = useState('');
    const [phone, setPhone] = useState('');
    const [identificationCard, setIdentificationCard] = useState('');
    const [password, setPassword] = useState('');
    const [registerCode, setRegisterCode] = useState(''); 
    const [step, setStep] = useState(false);
    
    //登录部分
    const [email, setEmail] = useState('');
    const [loginpassword, setLoginpassword] = useState('');
    const [warning, setWarning] = useState(false);

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleMailChange = (e) => {
        setMail(e.target.value);
    }

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
    }

    const handleIndentificationCardChange = (e) => {
        setIdentificationCard(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleRegisterCodeChange = (e) => {
        setRegisterCode(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(true);
        // TODO: Implement registration logic here
    };

    const handleLogin = (event) => {
        event.preventDefault();
        // 在这里处理登录逻辑
        console.log(`Logging in with email: ${email} and password: ${password}`);
    };

    return (
    <div>
        <div className="Register">
            <form onSubmit={handleSubmit}>
            <input type="text" placeholder="姓名" value={username} onChange={handleUsernameChange} required />
            <input type="email" placeholder="邮箱" value={mail} onChange={handleMailChange} required />
            <input type="tel" placeholder="电话" value={phone} onChange={handlePhoneChange} required />
            <input type="text" placeholder="身份证" value={identificationCard} onChange={handleIndentificationCardChange} required />
            <input type="password" placeholder="设置密码" value={password} onChange={handlePasswordChange} required />
            <button type="submit">注册</button>
            {step ?  <input type="text" placeholder="我们会向您的手机发送注册码，有效期三个月" value={registerCode} onChange={handleRegisterCodeChange} required /> : null}
            </form>
        </div>
        <div className="Register">
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="密码" value={loginpassword} onChange={(e) => setLoginpassword(e.target.value)} required />
            <input type="password" placeholder="验证码，请查看邮箱" required />
            <button type="submit">登录</button>
          </form>
          {warning ? <p className='warning-message'>登录失败，请重试</p> : null}
        </div>
    </div>
    );
};

export default Register;

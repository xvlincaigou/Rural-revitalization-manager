import React, { useState } from 'react';
import Modal from 'react-modal';
import './LogIn.css';

//按下登录键之后的反应：如果连上了应该自动解除弹窗，如果没连上就出现提示没有连上
//修改登录按钮的CSS，让它和Navbar上的其他链接看上去一样
//登录自带的逻辑，怎么调动api，要研究一下

function LogIn() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [warning, setWarning] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEmail('');
    setPassword('');
    setWarning(false);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    // 在这里处理登录逻辑
    console.log(`Logging in with email: ${email} and password: ${password}`);
    closeModal();
  };

  return (
    <div>
      <button onClick={openModal} className='LogIn-button'>登录</button>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="LogIn-Modal">
        <h2>登录</h2>
        <form onSubmit={handleLogin} className='LogIn-Form'>
          <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </form>
        <div className='LogIn-Button-Container'>
          <button type="submit" className='LogIn-modal-button:left'>登录</button>
          <button onClick={closeModal} className='LogIn-modal-button:right'>关闭</button>
        </div>
        {warning ? <p className='warning-message'>登录失败，请重试</p> : null}
      </Modal>
    </div>
  );
}

export default LogIn;
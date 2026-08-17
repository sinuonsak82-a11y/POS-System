import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient.js';
import { useAuth } from '../api/AuthContext.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/login.php', { username, password });
      login(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome back</h1>
        <p className="sub">Sign in to the POS system</p>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-gold" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}


// // Testing Code
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// // import axiosClient from '../api/axiosClient.js'; // មិនទាន់បាច់ប្រើកូដនេះទេ
// import { useAuth } from '../api/AuthContext.jsx';

// export default function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     // Login សម្រេចដោយមិនបាច់ហៅ Backend API 
//     setTimeout(() => {
//       if (username.trim() !== '' && password.trim() !== '') {
//         const fakeUser = {
//           id: 1,
//           username: username,
//           fullName: 'System Admin (Mock)',
//           role: 'Admin'
//         };
//         login(fakeUser); // រក្សាទុកទិន្នន័យក្នុង Context/Session
//         navigate('/dashboard'); // ទៅកាន់ទំព័រ Dashboard ភ្លាម
//       } else {
//         setError('Please enter username and password');
//       }
//       setLoading(false);
//     }, 1000); // 1 វិនាទី ឱ្យឃេីញសភាព Loading...
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <h1>Welcome back</h1>
//         <p className="sub">Sign in to the POS system (Frontend Mode)</p>
//         {error && <p className="error-text">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="field">
//             <label>Username</label>
//             <input value={username} onChange={(e) => setUsername(e.target.value)} required />
//           </div>
//           <div className="field">
//             <label>Password</label>
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//           </div>
//           <button className="btn btn-gold" style={{ width: '100%' }} disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign in'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
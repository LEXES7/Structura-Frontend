import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInSuccess } from '../redux/userSlice';

export default function OAuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const id = params.get('id');
    const username = params.get('username');
    const email = params.get('email');
    const isAdmin = params.get('isAdmin') === 'true';
    const profilePicture = params.get('profilePicture') || 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png';

    console.log('OAuth Callback Params:', { token, id, username, email, isAdmin, profilePicture });

    if (token && id && username && email && typeof isAdmin !== 'undefined') {
      const userData = { id, username, email, isAdmin, token, profilePicture };
      dispatch(signInSuccess(userData));
      navigate('/dashboard');
    } else {
      console.error('Missing OAuth parameters:', { token, id, username, email, isAdmin });
      navigate('/signin?error=Failed to process Google login');
    }
  }, [dispatch, navigate, location]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Processing Google Login...</h1>
    </div>
  );
}
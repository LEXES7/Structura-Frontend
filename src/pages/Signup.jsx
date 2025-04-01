import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/userSlice';
import OAuth from '../components/OAuth';

export default function Signup() {
  const [formData, setFormData] = useState({});
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill all the fields'));
    }
    try {
      dispatch(signInStart());

      // Signup request using proxied URL
      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const signupData = await signupRes.json();

      if (signupData.success === false) {
        console.error('Signup Failed:', signupData.message);
        return dispatch(signInFailure(signupData.message));
      }

      if (signupRes.ok) {
        try {
          // Auto-login request using proxied URL
          const loginRes = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          });
          const loginData = await loginRes.json();

          if (loginData.success === false) {
            console.warn('Auto-login failed:', loginData.message);
            navigate('/signin');
            return;
          }

          if (loginRes.ok) {
            console.log('Login Success:', loginData);
            dispatch(signInSuccess({ ...loginData, token: loginData.token }));
            if (loginData.isAdmin) {
              navigate('/admin');
            } else {
              navigate('/dashboard?tab=profile');
            }
          }
        } catch (loginError) {
          console.warn('Auto-login error:', loginError.message);
          navigate('/signin');
          return;
        }
      }
    } catch (error) {
      console.error('Signup Error:', error.message);
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex flex-1 bg-gradient-to-r from-blue-700 via-blue-500 to-black 
                      text-white items-center justify-center p-10"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to</h1>
          <h1 className="text-6xl font-bold">Structura</h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-10 bg-gradient-to-r from-gray-950 via-gray-black to-black">
        <div className="max-w-md w-full">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Username" />
              <TextInput
                type="text"
                placeholder="Username"
                id="username"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label value="Email" />
              <TextInput
                type="email"
                placeholder="name@email.com"
                id="email"
                onChange={handleChange}
              />
            </div>

            <div>
              <Label value="Password" />
              <TextInput
                type="password"
                placeholder="Password"
                id="password"
                onChange={handleChange}
              />
            </div>

            <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
            <OAuth />
          </form>

          <div className="flex gap-2 text-sm mt-5">
            <span className="text-white">Have an account ?</span>
            <Link to="/signin" className="text-blue-500">
              Sign In
            </Link>
          </div>

          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
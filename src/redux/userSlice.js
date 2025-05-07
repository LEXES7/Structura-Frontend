import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  loading: false,
  error: null,
  userPosts: [], // Added to track user's posts
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Authentication reducers
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Profile reducers
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Account deletion reducers
    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.userPosts = [];
      state.loading = false;
      state.error = null;
    },
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Sign out reducer
    signoutSuccess: (state) => {
      state.currentUser = null;
      state.userPosts = [];
      state.loading = false;
      state.error = null;
    },
    
    // Post management reducers
    fetchUserPostsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserPostsSuccess: (state, action) => {
      state.userPosts = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchUserPostsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addUserPost: (state, action) => {
      state.userPosts.unshift(action.payload); // Add to beginning of array
      state.loading = false;
      state.error = null;
    },
    updateUserPost: (state, action) => {
      const index = state.userPosts.findIndex(
        (post) => post._id === action.payload._id || post.id === action.payload.id
      );
      if (index !== -1) {
        state.userPosts[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
    deleteUserPost: (state, action) => {
      state.userPosts = state.userPosts.filter(
        (post) => post._id !== action.payload && post.id !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
    clearUserPosts: (state) => {
      state.userPosts = [];
      state.loading = false;
      state.error = null;
    }
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
  fetchUserPostsStart,
  fetchUserPostsSuccess,
  fetchUserPostsFailure,
  addUserPost,
  updateUserPost,
  deleteUserPost,
  clearUserPosts
} = userSlice.actions;

export default userSlice.reducer;
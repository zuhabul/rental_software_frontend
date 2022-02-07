import authentication from 'features/Authentication/authenticationSlice';

//Include all the reducer to combine and provide to configure store.

const rootReducer = {
  authentication,
};

export default rootReducer;

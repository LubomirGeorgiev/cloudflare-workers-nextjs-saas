'use client'

import { signInAction, signUpAction } from '@/actions'

const SignUpClientComponent = () => {
  return (
    <div>
      {/* TODO: Add form */}
      <button onClick={() => signUpAction({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
    })}>
      Sign Up
    </button>

      <button onClick={() => signInAction({
        email: 'john.doe@example.com',
        password: 'password',
      })}>
        Sign In
      </button>
    </div>
  )
};

export default SignUpClientComponent;

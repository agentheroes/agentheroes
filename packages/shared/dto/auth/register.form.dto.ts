import * as yup from 'yup';

export const registerFormSchema = yup.object({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
});

export type RegisterFormValues = yup.InferType<typeof registerFormSchema>; 
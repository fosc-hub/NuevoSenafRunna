import ErrorToast from '@/components/toast/ErrorToast';
import React from 'react';
import { toast } from 'react-toastify';


export const showErrorToast = (message: string, details: string): void => {
  toast.error(<ErrorToast message={message} details={details} />, {
    position: 'top-center',
    autoClose: 10000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'colored',
  });
  
};

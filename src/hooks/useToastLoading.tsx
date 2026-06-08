import { useRef } from 'react';
import { toast as toastify, type TypeOptions } from 'react-toastify';

type ToastType = TypeOptions | 'loading' | 'dismiss';

type toastLoadingProp = {
  message?: string;
  type?: ToastType;
  isLoading?: boolean;
  onClose?: () => void;
};

type useToastProp = (prop: toastLoadingProp) => void;

export default function useToastLoading(): useToastProp {
  const toastRef = useRef<string | number | null>(null);

  function toast(props: any) {
    if (props.message)
      props.message = (
        <div dangerouslySetInnerHTML={{ __html: props.message }} />
      );

    if (props.type) {
      if (props.type == 'dismiss') {
        toastify['dismiss'](props.message);
        toastRef.current = null;
      } else {
        if (toastRef.current) {
          toastify.update(toastRef.current, {
            render: props.message,
            type: props.type,
            autoClose: 5000,
            isLoading: false,
            closeButton: true,
          });
          setTimeout(props.onClose, 50);
        } else (toastify as any)[props.type](props.message);
      }
    } else toastRef.current = toastify['loading'](props.message);
  }

  return toast;
}
